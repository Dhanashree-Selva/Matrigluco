import pytest
import pymupdf
from pathlib import Path
from app.document_ai.pipeline import DocumentIntelligencePipeline
from app.document_ai.contracts.extraction import SupportedConcept


def test_golden_pdf_extraction_pipeline(tmp_path):
    # 1. Generate a synthetic medical report PDF with PyMuPDF
    pdf_path = tmp_path / "Maternal_OGTT_Report.pdf"
    doc = pymupdf.open()
    page = doc.new_page(width=612, height=792)

    # Insert clinic header
    page.insert_text((50, 50), "METROPOLITAN CLINICAL LABORATORIES", fontsize=14)
    page.insert_text((50, 70), "Patient: Jane Doe | Age: 29 Yrs | Sample: Venous Blood", fontsize=10)

    # Insert clinical table text
    page.insert_text((50, 120), "Investigation", fontsize=10)
    page.insert_text((220, 120), "Observed Value", fontsize=10)
    page.insert_text((340, 120), "Units", fontsize=10)
    page.insert_text((420, 120), "Reference Interval", fontsize=10)

    # Row 1: Fasting Glucose
    page.insert_text((50, 150), "Fasting Blood Sugar", fontsize=10)
    page.insert_text((220, 150), "92.0", fontsize=10)
    page.insert_text((340, 150), "mg/dL", fontsize=10)
    page.insert_text((420, 150), "70.0 - 99.0", fontsize=10)

    # Row 2: Postprandial Glucose
    page.insert_text((50, 180), "Post Prandial Blood Sugar", fontsize=10)
    page.insert_text((220, 180), "134.0", fontsize=10)
    page.insert_text((340, 180), "mg/dL", fontsize=10)
    page.insert_text((420, 180), "< 140.0", fontsize=10)

    # Row 3: HbA1c
    page.insert_text((50, 210), "Glycated Hemoglobin (HbA1c)", fontsize=10)
    page.insert_text((220, 210), "5.4", fontsize=10)
    page.insert_text((340, 210), "%", fontsize=10)
    page.insert_text((420, 210), "4.0 - 5.6", fontsize=10)

    # Key-value summary at bottom
    page.insert_text((50, 260), "Blood Pressure: 118/78 mmHg", fontsize=10)
    page.insert_text((50, 280), "Body Mass Index: 24.2 kg/m2", fontsize=10)

    doc.save(str(pdf_path))
    doc.close()

    # 2. Run Document Intelligence Pipeline
    pipeline = DocumentIntelligencePipeline()
    result = pipeline.process_file(pdf_path, mime_type="application/pdf")

    extracted = result["extracted_values"]
    assert extracted["fasting_glucose"] == 92.0
    assert extracted["postprandial_glucose"] == 134.0
    assert extracted["hba1c"] == 5.4
    assert extracted["blood_pressure"] == "118/78"
    assert extracted["bmi"] == 24.2

    # Check evidence & provenance
    provenance = extracted["_provenance"]
    assert "fasting_glucose" in provenance
    assert provenance["fasting_glucose"]["evidence"]["page_number"] == 1
    assert "bbox" in provenance["fasting_glucose"]["evidence"]
