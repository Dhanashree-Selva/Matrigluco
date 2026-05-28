from fastapi import APIRouter, UploadFile, File
from PIL import Image
import easyocr
import cv2
import numpy as np
import fitz
import tempfile
import re
from .prediction import model, scaler

router = APIRouter()

# OCR Reader
#reader = easyocr.Reader(['en'], gpu=False)


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
    reader = easyocr.Reader(['en'])
    text = ""

    # PDF Upload
    if file.filename.endswith(".pdf"):
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

            img = np.frombuffer(
                pix.samples,
                dtype=np.uint8
            ).reshape(
                pix.height,
                pix.width,
                pix.n
            )

            results = reader.readtext(img)

            for result in results:
                text += result[1] + " "

    # Image Upload
    else:
        image_bytes = await file.read()

        np_arr = np.frombuffer(
            image_bytes,
            np.uint8
        )

        img = cv2.imdecode(
            np_arr,
            cv2.IMREAD_COLOR
        )

        results = reader.readtext(img)

        for result in results:
            text += result[1] + " "

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