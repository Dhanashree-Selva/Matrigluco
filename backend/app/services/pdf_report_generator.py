import os
import logging
from io import BytesIO
from typing import Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader, select_autoescape

logger = logging.getLogger("matrigluco.services.pdf_generator")

# Set up Jinja2 template environment
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates", "reports")
jinja_env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(["html", "xml"]),
)


class PDFReportGenerator:
    """
    High-fidelity clinical PDF generator service utilizing Jinja2 HTML/CSS templates
    and xhtml2pdf / WeasyPrint engines.
    """

    REFERENCE_RANGES: Dict[str, str] = {
        "fasting_glucose": "70 – 99 mg/dL",
        "glucose_fasting": "70 – 99 mg/dL",
        "postprandial_glucose": "< 140 mg/dL",
        "glucose_pp": "< 140 mg/dL",
        "glucose": "70 – 140 mg/dL",
        "hba1c": "4.0 – 5.6 %",
        "bp_systolic": "90 – 120 mmHg",
        "bp_diastolic": "60 – 80 mmHg",
        "blood_pressure": "< 120/80 mmHg",
        "bmi": "18.5 – 24.9 kg/m²",
        "insulin": "2.6 – 24.9 µU/mL",
        "platelets": "150 – 450 10³/µL",
        "cholesterol": "< 200 mg/dL",
    }

    LABELS: Dict[str, str] = {
        "fasting_glucose": "Fasting Plasma Glucose (FBS)",
        "glucose_fasting": "Fasting Plasma Glucose (FBS)",
        "postprandial_glucose": "2-Hour Postprandial Glucose (PPBS)",
        "glucose_pp": "2-Hour Postprandial Glucose (PPBS)",
        "glucose": "Blood Glucose (Random)",
        "hba1c": "Glycated Hemoglobin (HbA1c)",
        "bp_systolic": "Systolic Blood Pressure",
        "bp_diastolic": "Diastolic Blood Pressure",
        "blood_pressure": "Blood Pressure (Systolic/Diastolic)",
        "bmi": "Body Mass Index (BMI)",
        "insulin": "Serum Fasting Insulin",
        "platelets": "Platelet Count",
        "cholesterol": "Total Serum Cholesterol",
    }

    UNITS: Dict[str, str] = {
        "fasting_glucose": "mg/dL",
        "glucose_fasting": "mg/dL",
        "postprandial_glucose": "mg/dL",
        "glucose_pp": "mg/dL",
        "glucose": "mg/dL",
        "hba1c": "%",
        "bp_systolic": "mmHg",
        "bp_diastolic": "mmHg",
        "blood_pressure": "mmHg",
        "bmi": "kg/m²",
        "insulin": "µU/mL",
        "platelets": "10³/µL",
        "cholesterol": "mg/dL",
    }

    @classmethod
    def format_report_items(cls, extracted_values: Dict[str, Any]) -> list:
        items = []
        for raw_key, val in (extracted_values or {}).items():
            if raw_key.startswith("_"):
                continue

            normalized_key = raw_key.lower().replace(" ", "_").replace("-", "_")
            label = cls.LABELS.get(
                normalized_key,
                raw_key.replace("_", " ").title(),
            )
            unit = cls.UNITS.get(
                normalized_key,
                "mg/dL" if "glucose" in normalized_key else "%" if "hba1c" in normalized_key else "mmHg" if "bp" in normalized_key else "",
            )
            ref_range = cls.REFERENCE_RANGES.get(normalized_key, "Standard Reference")

            items.append({
                "key": raw_key,
                "label": label,
                "value": str(val),
                "unit": unit,
                "ref_range": ref_range,
            })
        return items

    @classmethod
    def render_html(
        cls,
        report_id: str,
        extracted_values: Dict[str, Any],
        patient_name: str = "Gestational Patient",
        date_str: str = "18-Aug-2026",
        time_str: str = "14:00",
        gestational_age: str = "24 Weeks (Trimester 2)",
        status: str = "Clinically Verified",
    ) -> str:
        template = jinja_env.get_template("clinical_lab_report.html")
        items = cls.format_report_items(extracted_values)

        return template.render(
            report_id=report_id,
            patient_name=patient_name,
            date=date_str,
            time=time_str,
            gestational_age=gestational_age,
            status=status,
            items=items,
        )

    @classmethod
    def generate_pdf(
        cls,
        report_id: str,
        extracted_values: Dict[str, Any],
        patient_name: str = "Gestational Patient",
        date_str: str = "18-Aug-2026",
        time_str: str = "14:00",
        gestational_age: str = "24 Weeks (Trimester 2)",
        status: str = "Clinically Verified",
    ) -> bytes:
        html_content = cls.render_html(
            report_id=report_id,
            extracted_values=extracted_values,
            patient_name=patient_name,
            date_str=date_str,
            time_str=time_str,
            gestational_age=gestational_age,
            status=status,
        )

        # 1. Try WeasyPrint if available and functional
        try:
            import weasyprint
            doc = weasyprint.HTML(string=html_content)
            return doc.write_pdf()
        except Exception as wp_exc:
            logger.debug(f"WeasyPrint not available or skipped ({wp_exc}), using xhtml2pdf.")

        # 2. Robust pure-Python xhtml2pdf rendering
        from xhtml2pdf import pisa
        out_stream = BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=out_stream)

        if pisa_status.err:
            logger.error("pisa encountered errors during PDF rendering.")

        return out_stream.getvalue()
