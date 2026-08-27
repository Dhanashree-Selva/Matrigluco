import os
import shutil
from PIL import Image, ImageDraw, ImageFont
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.pdf_report_generator import PDFReportGenerator


def create_lab_report_image(output_png_path: str, title: str, report_id: str, test_items: list):
    width, height = 800, 1100
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    try:
        font_large = ImageFont.truetype("arial.ttf", 22)
        font_medium = ImageFont.truetype("arial.ttf", 15)
        font_bold = ImageFont.truetype("arialbd.ttf", 15)
        font_small = ImageFont.truetype("arial.ttf", 12)
        font_mono = ImageFont.truetype("cour.ttf", 13)
    except Exception:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_bold = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_mono = ImageFont.load_default()

    # 1. Top Decorative Bar
    draw.rectangle([0, 0, width, 16], fill=(225, 29, 72))

    # 2. Header
    draw.text((40, 35), "MATRIGLUCO CLINICAL DIAGNOSTICS", fill=(225, 29, 72), font=font_large)
    draw.text((40, 65), "Comprehensive Maternal Health & Metabolic Pathology Laboratory", fill=(100, 116, 139), font=font_small)
    draw.text((40, 82), "Accreditation: NABL / ISO 15189:2022 • Reg No: MG-DIAG-2026", fill=(148, 163, 184), font=font_small)

    draw.text((580, 40), f"REF: {report_id}", fill=(15, 23, 42), font=font_mono)
    draw.text((580, 60), "Date: 18-Aug-2026", fill=(71, 85, 105), font=font_small)
    draw.text((580, 78), "Sample ID: #SMP-8821", fill=(71, 85, 105), font=font_small)

    draw.line([(40, 105), (760, 105)], fill=(203, 213, 225), width=2)

    # 3. Patient Information Box
    draw.rectangle([(40, 120), (760, 200)], fill=(248, 250, 252), outline=(226, 232, 240), width=1)
    draw.text((55, 130), "PATIENT INFORMATION", fill=(71, 85, 105), font=font_bold)
    draw.text((55, 155), "Patient: Gestational Patient", fill=(30, 41, 59), font=font_medium)
    draw.text((55, 175), "Age / Gender: 28 Yrs / Female", fill=(71, 85, 105), font=font_small)

    draw.text((420, 155), "Referring Clinician: Dr. Sarah Jenkins, MD (OB/GYN)", fill=(30, 41, 59), font=font_medium)
    draw.text((420, 175), "Gestational Age: 24 Weeks (Trimester 2)", fill=(71, 85, 105), font=font_small)

    # 4. Report Title Banner
    draw.rectangle([(40, 220), (760, 255)], fill=(241, 245, 249))
    draw.text((55, 228), title.upper(), fill=(15, 23, 42), font=font_bold)

    # 5. Table Header
    y = 275
    draw.rectangle([(40, y), (760, y + 30)], fill=(226, 232, 240))
    draw.text((55, y + 8), "INVESTIGATION / PARAMETER", fill=(51, 65, 85), font=font_bold)
    draw.text((360, y + 8), "OBSERVED VALUE", fill=(51, 65, 85), font=font_bold)
    draw.text((510, y + 8), "UNITS", fill=(51, 65, 85), font=font_bold)
    draw.text((610, y + 8), "REFERENCE RANGE", fill=(51, 65, 85), font=font_bold)

    y += 35
    for item in test_items:
        draw.line([(40, y + 30), (760, y + 30)], fill=(241, 245, 249), width=1)
        draw.text((55, y + 8), item["name"], fill=(15, 23, 42), font=font_bold)
        draw.text((360, y + 8), str(item["value"]), fill=(225, 29, 72), font=font_bold)
        draw.text((510, y + 8), item["unit"], fill=(71, 85, 105), font=font_medium)
        draw.text((610, y + 8), item["ref"], fill=(100, 116, 139), font=font_small)
        y += 40

    # 6. Clinical Impression / Notes
    y += 40
    draw.rectangle([(40, y), (760, y + 130)], fill=(255, 241, 242), outline=(254, 205, 211), width=1)
    draw.text((55, y + 15), "CLINICAL INTERPRETATION & NOTES:", fill=(159, 18, 57), font=font_bold)
    draw.text((55, y + 42), "• Fasting and 2-Hour Postprandial glucose values indicate standard gestational glucose tolerance.", fill=(159, 18, 57), font=font_small)
    draw.text((55, y + 62), "• Blood pressure readings within optimal normal maternal hemodynamic targets.", fill=(159, 18, 57), font=font_small)
    draw.text((55, y + 82), "• Recommended: Routine dietary balance and follow-up antenatal screening at Week 28.", fill=(159, 18, 57), font=font_small)

    # 7. Verification Seal and Signatures
    y += 180
    draw.line([(40, y), (760, y)], fill=(203, 213, 225), width=1)
    draw.text((55, y + 15), "Verified by Medical Pathologist:", fill=(100, 116, 139), font=font_small)
    draw.text((55, y + 35), "Dr. Ananya Sharma, MD (Pathology)", fill=(15, 23, 42), font=font_bold)
    draw.text((55, y + 52), "Chief Clinical Biochemist • Medical Council Reg #49281", fill=(148, 163, 184), font=font_small)

    draw.rectangle([(560, y + 15), (740, y + 65)], fill=(240, 253, 244), outline=(187, 247, 208), width=1)
    draw.text((575, y + 25), "✓ CLINICALLY VERIFIED", fill=(22, 101, 52), font=font_bold)
    draw.text((575, y + 45), "Digital Signature Validated", fill=(22, 101, 52), font=font_small)

    # 8. Footer
    draw.text((40, height - 35), "MatriGluco Clinical Healthcare Workspace • Confidential Medical Document • End of Report", fill=(148, 163, 184), font=font_small)

    img.save(output_png_path, "PNG")


if __name__ == "__main__":
    os.makedirs("d:/Matrigluco/samples", exist_ok=True)
    os.makedirs("d:/Matrigluco/web/public/samples", exist_ok=True)

    # 1. OGTT Lab Report
    ogtt_extracted = {
        "fasting_glucose": "92.0",
        "postprandial_glucose": "134.0",
        "hba1c": "5.4",
        "bp_systolic": "118",
        "bp_diastolic": "78",
        "bmi": "24.2",
    }
    ogtt_pdf_bytes = PDFReportGenerator.generate_pdf(
        report_id="REP-2026-OGTT-01",
        extracted_values=ogtt_extracted,
        patient_name="Gestational Patient",
        date_str="18-Aug-2026",
        time_str="10:30 AM",
        gestational_age="24 Weeks (Trimester 2)",
    )
    with open("d:/Matrigluco/samples/OGTT_Lab_Report.pdf", "wb") as f:
        f.write(ogtt_pdf_bytes)

    ogtt_items = [
        {"name": "Fasting Plasma Glucose (FBS)", "value": "92.0", "unit": "mg/dL", "ref": "70 - 99"},
        {"name": "Postprandial Glucose (2h PPBS)", "value": "134.0", "unit": "mg/dL", "ref": "< 140"},
        {"name": "Glycated Hemoglobin (HbA1c)", "value": "5.4", "unit": "%", "ref": "4.0 - 5.6"},
        {"name": "Systolic Blood Pressure", "value": "118", "unit": "mmHg", "ref": "90 - 120"},
        {"name": "Diastolic Blood Pressure", "value": "78", "unit": "mmHg", "ref": "60 - 80"},
        {"name": "Body Mass Index (BMI)", "value": "24.2", "unit": "kg/m²", "ref": "18.5 - 24.9"},
    ]
    create_lab_report_image(
        output_png_path="d:/Matrigluco/samples/OGTT_Lab_Report.png",
        title="Oral Glucose Tolerance Test (OGTT) & Antenatal Panel",
        report_id="REP-2026-OGTT-01",
        test_items=ogtt_items,
    )

    # 2. Comprehensive Metabolic Panel Report
    cmp_extracted = {
        "fasting_glucose": "104.0",
        "insulin": "12.4",
        "hba1c": "5.6",
        "bp_systolic": "120",
        "bp_diastolic": "80",
        "platelets": "240",
        "cholesterol": "185.0",
    }
    cmp_pdf_bytes = PDFReportGenerator.generate_pdf(
        report_id="REP-2026-CMP-02",
        extracted_values=cmp_extracted,
        patient_name="Gestational Patient",
        date_str="18-Aug-2026",
        time_str="11:15 AM",
        gestational_age="26 Weeks (Trimester 2)",
    )
    with open("d:/Matrigluco/samples/Metabolic_Panel_Report.pdf", "wb") as f:
        f.write(cmp_pdf_bytes)

    cmp_items = [
        {"name": "Plasma Fasting Glucose", "value": "104.0", "unit": "mg/dL", "ref": "70 - 99"},
        {"name": "Serum Insulin (Fasting)", "value": "12.4", "unit": "µU/mL", "ref": "2.6 - 24.9"},
        {"name": "Glycated Hemoglobin (HbA1c)", "value": "5.6", "unit": "%", "ref": "4.0 - 5.6"},
        {"name": "Blood Pressure (Systolic/Diastolic)", "value": "120/80", "unit": "mmHg", "ref": "< 120/80"},
        {"name": "Platelet Count", "value": "240", "unit": "10³/µL", "ref": "150 - 450"},
        {"name": "Total Cholesterol", "value": "185.0", "unit": "mg/dL", "ref": "< 200"},
    ]
    create_lab_report_image(
        output_png_path="d:/Matrigluco/samples/Metabolic_Panel_Report.png",
        title="Comprehensive Maternal Metabolic Profile",
        report_id="REP-2026-CMP-02",
        test_items=cmp_items,
    )

    # Sync to web/public/samples
    shutil.copy("d:/Matrigluco/samples/OGTT_Lab_Report.pdf", "d:/Matrigluco/web/public/samples/OGTT_Lab_Report.pdf")
    shutil.copy("d:/Matrigluco/samples/OGTT_Lab_Report.png", "d:/Matrigluco/web/public/samples/OGTT_Lab_Report.png")
    shutil.copy("d:/Matrigluco/samples/Metabolic_Panel_Report.pdf", "d:/Matrigluco/web/public/samples/Metabolic_Panel_Report.pdf")
    shutil.copy("d:/Matrigluco/samples/Metabolic_Panel_Report.png", "d:/Matrigluco/web/public/samples/Metabolic_Panel_Report.png")

    print("All professional Jinja2 HTML/CSS PDF and PNG samples successfully generated and synced!")
