from fastapi import APIRouter, UploadFile, File
import fitz
import tempfile
import re
import os
import requests
import numpy as np
import app.api.endpoints.prediction as pred

router = APIRouter()

OCR_API_KEY = os.getenv("OCR_API_KEY")

def extract_text_from_image(image_bytes, filename="report.png", content_type="image/png"):
    try:
        print(f"\n--- [OCR DEBUG] UPLOADING FILE: {filename} ---")
        print(f"Content-Type: {content_type}")
        print(f"Byte Size: {len(image_bytes)}")

        if len(image_bytes) == 0:
            print("ERROR: Image bytes are empty.")
            return ""

        files = {
            "file": (
                filename,
                image_bytes,
                content_type
            )
        }

        payload = {
            "apikey": OCR_API_KEY,
            "language": "eng",
            "isOverlayRequired": "false",
            "OCREngine": 2
        }

        response = requests.post(
            "https://api.ocr.space/parse/image",
            files=files,
            data=payload,
            timeout=60
        )

        print(f"OCR HTTP STATUS: {response.status_code}")
        # print("OCR RAW RESPONSE:", response.text)

        result = response.json()

        if result.get("IsErroredOnProcessing"):
            print("OCR API ERROR:", result.get("ErrorMessage") or result)
            return ""

        if result.get("ParsedResults"):
            text = ""
            for res in result["ParsedResults"]:
                text += res.get("ParsedText", "") + " "
            return text.strip()

        return ""

    except Exception as e:
        print(f"OCR Exception: {e}")
        return ""


def extract_health_values(text):
    print("\n--- [DEBUG] extract_health_values CALLED ---")
    print(f"OCR TEXT: {text}")

    extracted = {
        "glucose_fasting": None,
        "glucose_pp": None,
        "glucose": None,
        "hba1c": None,
        "bmi": None
    }

    # Regex patterns for variations
    # HbA1c Variations (tolerant to HbAIC/HBAIC)
    hba1c_patterns = [
        r"(hba1c|a1c|hbaic|hb\s*a1c|hb\s*a1\s*c)\s*[:\-]?\s*(\d+\.?\d*)\s*(%)?"
    ]

    # Glucose PP Variations
    pp_patterns = [
        r"(glucose\s*\(pp\)|post\s*meal|pp\s*plasma\s*glucose|after\s*meal|postprandial)(?:\s*glucose)?\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dl|mmol/l)?"
    ]

    # Glucose Fasting Variations
    fasting_patterns = [
        r"(glucose\s*fasting|fasting\s*glucose|glucose,\s*fasting|fasting\s*blood\s*sugar|fbs)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dl|mmol/l)?",
        r"(blood\s*glucose|plasma\s*glucose|glucose)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dl|mmol/l)",
        r"(blood\s*glucose|plasma\s*glucose|glucose)\s*[:\-]\s*(\d+\.?\d*)"
    ]

    # BMI Variations
    bmi_patterns = [
        r"(bmi|body\s*mass\s*index)\s*[:\-]?\s*(\d+\.?\d*)"
    ]

    # Extracting HbA1c
    for pattern in hba1c_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            extracted["hba1c"] = float(match.group(2))
            print(f"Matched hba1c using pattern: \"{pattern}\"")
            print(f"Matched value: {extracted['hba1c']}")
            break

    # Extracting Glucose PP (Check PP first to avoid generic glucose matching)
    for pattern in pp_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            extracted["glucose_pp"] = float(match.group(2))
            print(f"Matched glucose_pp using pattern: \"{pattern}\"")
            print(f"Matched value: {extracted['glucose_pp']}")
            break

    # Extracting Glucose Fasting / General
    # Only match if didn't already match as PP or if specifically a Fasting keyword
    for pattern in fasting_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            # If we already have a PP value and this match is just "glucose", maybe skip?
            # But the user might have both. For now, let's just avoid double-counting if possible.
            # Actually, most reports have these as distinct lines.
            
            # Simple check: if this match overlaps with the PP match, we might have a problem.
            # But re.search just gives the first one.
            
            val = float(match.group(2))
            if extracted["glucose_pp"] == val:
                # Likely the same field matched by a broader pattern
                continue
                
            extracted["glucose_fasting"] = val
            print(f"Matched glucose_fasting using pattern: \"{pattern}\"")
            print(f"Matched value: {extracted['glucose_fasting']}")
            break

    # Extracting BMI
    for pattern in bmi_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            extracted["bmi"] = float(match.group(2))
            print(f"Matched bmi using pattern: \"{pattern}\"")
            print(f"Matched value: {extracted['bmi']}")
            break

    # Fallback Logic
    if extracted["glucose_fasting"] is not None:
        extracted["glucose"] = extracted["glucose_fasting"]
        print(f"Mapped glucose from glucose_fasting: {extracted['glucose']}")
    elif extracted["glucose_pp"] is not None:
        extracted["glucose"] = extracted["glucose_pp"]
        print(f"Mapped glucose from glucose_pp: {extracted['glucose']}")

    return extracted


@router.post("/")
async def scan_report(
    file: UploadFile = File(...)
):
    print(f"\n--- [SCAN REPORT] New Upload: {file.filename} ---")
    print(f"Content Type: {file.content_type}")
    
    file_bytes = await file.read()
    print(f"Total Bytes Read: {len(file_bytes)}")
    
    if len(file_bytes) == 0:
        return {
            "message": "Empty file uploaded",
            "health_data": {},
            "prediction_result": "Unknown",
            "risk_level": "Unknown",
            "probability_score": 0
        }

    text = ""

    # PDF Upload
    if file.filename.lower().endswith(".pdf"):
        with tempfile.NamedTemporaryFile(
            suffix=".pdf",
            delete=False
        ) as temp_pdf:
            temp_pdf.write(file_bytes)
            temp_pdf_path = temp_pdf.name

        pdf_document = fitz.open(temp_pdf_path)

        for i, page in enumerate(pdf_document):
            pix = page.get_pixmap()
            
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_img:
                pix.save(temp_img.name)
                with open(temp_img.name, "rb") as f:
                    page_bytes = f.read()
                
                page_text = extract_text_from_image(
                    page_bytes, 
                    filename=f"page_{i+1}.png", 
                    content_type="image/png"
                )
                print(f"PAGE {i+1} TEXT EXTRACTED.")
                if page_text:
                    text += page_text + " "
                
                os.remove(temp_img.name)
            
        pdf_document.close()
        os.remove(temp_pdf_path)

    # Image Upload
    else:
        page_text = extract_text_from_image(
            file_bytes, 
            filename=file.filename, 
            content_type=file.content_type or "image/png"
        )
        if page_text:
            text += page_text + " "

    # Extract OCR health values
    print(f"\n--- [DEBUG] TOTAL OCR TEXT COLLECTED ---\n{text}\n--------------------------------------")
    extracted_data = extract_health_values(text)
    print(f"\n[DEBUG] FINAL EXTRACTED JSON: {extracted_data}")

    # Auto prediction using OCR values
    glucose_fasting = (
        extracted_data.get("glucose_fasting")
        or 95
    )

    glucose_pp = (
        extracted_data.get("glucose_pp")
        or 140
    )

    bmi = (
        extracted_data.get("bmi")
        or 25
    )

    hba1c = (
        extracted_data.get("hba1c")
        or 5.5
    )

    # Use higher glucose value
    glucose = max(
        glucose_fasting,
        glucose_pp
    )

    input_features = np.array([[
        0,          # pregnancies
        glucose,
        70,         # blood pressure
        20,         # skin thickness
        0,          # insulin
        bmi,
        0.2,        # diabetes pedigree
        30          # age
    ]])

    # Scale input
    pred.load_model()
    if pred.model is None or pred.scaler is None:
        return {
            "message": "Model not ready yet",
            "health_data": extracted_data,
            "prediction_result": "Unknown",
            "risk_level": "Unknown",
            "probability_score": 0
        }

    input_scaled = pred.scaler.transform(
        input_features
    )

    # Prediction
    prediction = pred.model.predict(
        input_scaled
    )[0]

    probability = pred.model.predict_proba(
        input_scaled
    )[0][1]

    # Risk level
    risk_level = "Low Risk"

    if probability > 0.33:
        risk_level = "Moderate Risk"

    if probability > 0.66:
        risk_level = "High Risk"

    return {
        "message":
        "Report scanned successfully",

        "health_data":
        extracted_data,

        "prediction_result":
        "Diabetic"
        if prediction == 1
        else "Non-Diabetic",

        "risk_level":
        risk_level,

        "probability_score":
        round(probability * 100, 2)
    }