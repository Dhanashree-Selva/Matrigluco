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
    print("\n--- [DEBUG] extract_health_values (ROBUST WINDOW) CALLED ---")
    
    extracted = {
        "glucose_fasting": None,
        "glucose_pp": None,
        "glucose": None,
        "hba1c": None,
        "bmi": None,
        "age": None,
        "blood_pressure": None
    }

    # Better Triggers
    triggers = {
        "hba1c": [r"hba1c", r"hbaic", r"hba 1c", r"hb1ac", r"a1c", r"glycated\s*hemoglobin", r"glycohemoglobin"],
        "glucose": [r"estimated\s*average\s*glucose", r"blood\s*glucose", r"plasma\s*glucose", r"fbs", r"f\.b\.s", r"rbs", r"r\.b\.s", r"ppbs", r"p\.p\.b\.s", r"sugar", r"fasting", r"post\s*prandial", r"glucose"],
        "bmi": [r"bmi", r"body\s*mass\s*index"],
        "age": [r"age", r"yrs", r"years"],
        "blood_pressure": [r"bp", r"blood\s*pressure", r"b\.p\."]
    }

    # Medical Ranges for Validation
    ranges = {
        "hba1c": (2.0, 25.0),
        "glucose": (30.0, 600.0),
        "age": (1.0, 120.0),
        "bmi": (10.0, 60.0),
        "blood_pressure": (30.0, 250.0)
    }

    # Flatten text for consistent window search
    clean_text = " ".join(text.splitlines())
    print(f"Analyzing {len(clean_text)} chars using window search...")

    for key, patterns in triggers.items():
        trigger_regex = r"\b(?:" + "|".join(patterns) + r")\b"
        
        # Find all occurrences of the trigger
        for trigger_match in re.finditer(trigger_regex, clean_text, re.IGNORECASE):
            start_pos = trigger_match.end()
            # Look ahead up to 200 chars for valid numbers
            lookahead = clean_text[start_pos : start_pos + 200]
            
            # Find all numbers in the lookahead
            numbers = re.finditer(r"\b(\d+\.?\d*)\b", lookahead)
            
            for num_match in numbers:
                val_str = num_match.group(1)
                try:
                    val = float(val_str)
                    
                    # Validate Range
                    min_v, max_v = ranges[key]
                    if min_v <= val <= max_v:
                        print(f"[MATCH {key.upper()}] Found {val} near context: ...{trigger_match.group(0)}...")
                        
                        # Special handling for blood pressure (check for diastolic pair)
                        if key == "blood_pressure":
                            pair_match = re.search(r"(\d+)\s*[/]\s*(\d+)", lookahead[max(0, num_match.start()-10) : num_match.end()+10])
                            if pair_match:
                                extracted[key] = float(pair_match.group(2))
                            else:
                                extracted[key] = val
                        elif key == "glucose":
                            context = (trigger_match.group(0) + " " + lookahead).lower()
                            if any(k in context for k in ["post", "pp", "after", "meal", "p.p."]):
                                if extracted["glucose_pp"] is None: extracted["glucose_pp"] = val
                            elif any(k in context for k in ["fasting", "fbs", "f.b.s."]):
                                if extracted["glucose_fasting"] is None: extracted["glucose_fasting"] = val
                            else:
                                if extracted["glucose"] is None: extracted["glucose"] = val
                        else:
                            if extracted[key] is None:
                                extracted[key] = int(val) if key == "age" else val
                        
                        break # Found valid number for this trigger instance
                except:
                    continue
            
            if key != "glucose" and extracted[key] is not None:
                break # Found valid result for this field

    # Final logic for overall glucose
    if extracted["glucose_fasting"] is not None:
        extracted["glucose"] = extracted["glucose_fasting"]
    elif extracted["glucose_pp"] is not None and extracted["glucose"] is None:
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

    blood_pressure = (
        extracted_data.get("blood_pressure")
        or 70
    )

    age = (
        extracted_data.get("age")
        or 30
    )

    input_features = np.array([[
        0,          # pregnancies
        glucose,
        blood_pressure,
        20,         # skin thickness
        0,          # insulin
        bmi,
        0.2,        # diabetes pedigree
        age
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