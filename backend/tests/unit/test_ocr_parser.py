import pytest
from app.integrations.ocr.parser import MedicalReportParser


def test_medical_report_parser_values():
    parser = MedicalReportParser()
    sample_text = """
    METABOLIC LAB REPORT
    Patient Age: 28 yrs
    Fasting Blood Glucose: 98.5 mg/dL
    HbA1c Glycated Hemoglobin: 5.8 %
    Blood Pressure: 120 / 80 mmHg
    BMI: 27.4
    """
    extracted = parser.parse(sample_text)

    assert extracted.age == 28.0
    assert extracted.glucose == 98.5
    assert extracted.hba1c == 5.8
    assert extracted.bmi == 27.4
    assert extracted.blood_pressure == 80.0
