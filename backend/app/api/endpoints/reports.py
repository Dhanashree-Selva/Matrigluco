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

        headers = {
            "apikey": OCR_API_KEY
        }

        response = requests.post(
            "https://api.ocr.space/parse/image",
            files=files,
            data=payload,
            headers=headers,
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
    print("\n--- [DEBUG] extract_health_values (LINE-AWARE) CALLED ---")
    
    extracted = {
        "glucose_fasting": None,
        "glucose_pp": None,
        "glucose": None,
        "hba1c": None,
        "bmi": None
    }

    # Line-aware regex patterns
    hba1c_pattern = r"(hba1c|hbaic|a1c)[^\n\r\d]{0,20}(\d+\.?\d*)"
    glucose_pattern = r"(estimated\s*average\s*glucose|blood\s*glucose|plasma\s*glucose|glucose|fbs)[^\n\r\d]{0,20}(\d+\.?\d*)"
    bmi_pattern = r"(bmi|body\s*mass\s*index)[^\n\r\d]{0,20}(\d+\.?\d*)"

    lines = text.splitlines()
    print(f"Checking {len(lines)} lines for medical values...")

    for i, line in enumerate(lines):
        clean_line = line.strip()
        if not clean_line:
            continue
            
        # Match HbA1c
        if extracted["hba1c"] is None:
            match = re.search(hba1c_pattern, clean_line, re.IGNORECASE)
            if match:
                extracted["hba1c"] = float(match.group(2))
                print(f"[MATCH HbA1c] Line {i+1}: \"{clean_line}\" -> Value: {extracted['hba1c']}")

        # Match Glucose
        if extracted["glucose_fasting"] is None:
            match = re.search(glucose_pattern, clean_line, re.IGNORECASE)
            if match:
                # Check if it's specifically PP or Fasting based on keywords in the SAME line
                val = float(match.group(2))
                keyword = match.group(1).lower()
                
                if any(k in clean_line.lower() for k in ["post\s*meal", "pp", "after\s*meal"]):
                    extracted["glucose_pp"] = val
                    print(f"[MATCH Glucose PP] Line {i+1}: \"{clean_line}\" -> Value: {val}")
                else:
                    extracted["glucose_fasting"] = val
                    print(f"[MATCH Glucose Fasting] Line {i+1}: \"{clean_line}\" -> Value: {val}")

        # Match BMI
        if extracted["bmi"] is None:
            match = re.search(bmi_pattern, clean_line, re.IGNORECASE)
            if match:
                extracted["bmi"] = float(match.group(2))
                print(f"[MATCH BMI] Line {i+1}: \"{clean_line}\" -> Value: {extracted['bmi']}")

    # Fallback Logic
    if extracted["glucose_fasting"] is not None:
        extracted["glucose"] = extracted["glucose_fasting"]
    elif extracted["glucose_pp"] is not None:
        extracted["glucose"] = extracted["glucose_pp"]

    print(f"\n--- [DEBUG] EXTRACTION COMPLETED ---")
    print(f"RESULT: {extracted}")
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