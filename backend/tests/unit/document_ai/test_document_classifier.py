import pytest
from pathlib import Path
from app.document_ai.routing.document_classifier import DocumentClassifier
from app.document_ai.contracts.document import DocumentClass


def test_classify_image_extension(tmp_path):
    classifier = DocumentClassifier()
    img_file = tmp_path / "scan.jpg"
    img_file.write_bytes(b"\xff\xd8\xff\xe0")

    result = classifier.classify_file(img_file, mime_type="image/jpeg")
    assert result == DocumentClass.IMAGE


def test_classify_png_extension(tmp_path):
    classifier = DocumentClassifier()
    png_file = tmp_path / "lab_results.png"
    png_file.write_bytes(b"\x89PNG\r\n\x1a\n")

    result = classifier.classify_file(png_file, mime_type="image/png")
    assert result == DocumentClass.IMAGE
