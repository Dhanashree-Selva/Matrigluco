from fastapi import APIRouter, UploadFile, File
import fitz
import tempfile
import re
import os
import requests
import numpy as np
from .prediction import model, scaler

router = APIRouter()

OCR_API_KEY = os.getenv("OCR_API_KEY")

def extract_text_from_image(image_path):
    try:
        with open(image_path, "rb") as f:
            response = requests.post(
                "https://api.ocr.space/parse/image",
                files={"file": f},
                data={
                    "apikey": OCR_API_KEY,
                    "language": "eng",
                    "isOverlayRequired": False
                },
                timeout=60
            )

        print("OCR STATUS:", response.status_code)
        print("OCR RESPONSE:", response.text)

        result = response.json()

        if result.get("IsErroredOnProcessing"):
            print("OCR API ERROR:", result)
            return ""

        if result.get("ParsedResults"):
            text = ""
            for res in result["ParsedResults"]:
                text += res.get("ParsedText", "") + " "
            return text.strip()

        return ""

    except Exception as e:
        print(f"OCR Error: {e}")
        return ""


def extract_health_values(text):
    extracted = {
        "glucose_fasting": None,
        "glucose_pp": None,
        "hba1c": None,
        "bmi": None
    }

    # Glucose Fasting
    fasting_match = re.search(
        r"(glucose fasting|fasting glucose|glucose, fasting).*?(\d+\.?\d*)",
        text,
        re.IGNORECASE
    )

    # Glucose PP / Post Meal
    pp_match = re.search(
        r"(glucose\s*\(pp\)|post meal|pp plasma glucose).*?(\d+\.?\d*)",
        text,
        re.IGNORECASE
    )

    # HbA1c
    hba1c_match = re.search(
        r"(hba1c|a1c).*?(\d+\.?\d*)",
        text,
        re.IGNORECASE
    )

    # BMI
    bmi_match = re.search(
        r"(bmi).*?(\d+\.?\d*)",
        text,
        re.IGNORECASE
    )

    if fasting_match:
        extracted["glucose_fasting"] = float(
            fasting_match.group(2)
        )

    if pp_match:
        extracted["glucose_pp"] = float(
            pp_match.group(2)
        )

    if hba1c_match:
        extracted["hba1c"] = float(
            hba1c_match.group(2)
        )

    if bmi_match:
        extracted["bmi"] = float(
            bmi_match.group(2)
        )

    return extracted


@router.post("/")
async def scan_report(
    file: UploadFile = File(...)
):
    text = ""

    # PDF Upload
    if file.filename.lower().endswith(".pdf"):
        pdf_bytes = await file.read()

        with tempfile.NamedTemporaryFile(
            suffix=".pdf",
            delete=False
        ) as temp_pdf:

            temp_pdf.write(pdf_bytes)
            temp_pdf_path = temp_pdf.name

        pdf_document = fitz.open(
            temp_pdf_path
        )

        for page in pdf_document:
            pix = page.get_pixmap()
            
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_img:
                pix.save(temp_img.name)
                temp_img_path = temp_img.name
                
            page_text = extract_text_from_image(temp_img_path)
            if page_text:
                text += page_text + " "
                
            os.remove(temp_img_path)
            
        pdf_document.close()
        os.remove(temp_pdf_path)

    # Image Upload
    else:
        image_bytes = await file.read()
        
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_img:
            temp_img.write(image_bytes)
            temp_img_path = temp_img.name
            
        page_text = extract_text_from_image(temp_img_path)
        if page_text:
            text += page_text + " "
            
        os.remove(temp_img_path)

    # Extract OCR health values
    extracted_data = extract_health_values(text)

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
    input_scaled = scaler.transform(
        input_features
    )

    # Prediction
    prediction = model.predict(
        input_scaled
    )[0]

    probability = model.predict_proba(
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