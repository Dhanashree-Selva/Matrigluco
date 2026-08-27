"""
Ingests sample clinical guideline documents into the local knowledge index.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.ai.knowledge.metadata import KnowledgeDocumentMetadata
from app.ai.knowledge.ingestion import KnowledgeIngestionPipeline


def run_ingest():
    pipeline = KnowledgeIngestionPipeline()
    sample_guide_path = Path("storage/private/knowledge-documents/sample_gdm_guideline.txt")
    sample_guide_path.parent.mkdir(parents=True, exist_ok=True)

    if not sample_guide_path.exists():
        sample_guide_path.write_text(
            "Gestational Diabetes Mellitus (GDM) is defined as glucose intolerance with onset or first recognition during pregnancy. "
            "Standard screening is conducted between 24 and 28 weeks of gestation using an oral glucose tolerance test (OGTT). "
            "Target blood glucose levels: Fasting <= 95 mg/dL, 1-hour postprandial <= 140 mg/dL, 2-hour postprandial <= 120 mg/dL. "
            "Nutritional therapy includes balanced complex carbohydrates, high fiber, and moderate physical activity.",
            encoding="utf-8",
        )

    meta = KnowledgeDocumentMetadata(
        document_id="doc-gdm-001",
        title="ADA Gestational Diabetes Clinical Management Guideline",
        document_type="guideline",
        source_author="American Diabetes Association",
        version="2024.1",
    )

    chunks = pipeline.ingest_file(sample_guide_path, meta)
    print(f"Successfully ingested {len(chunks)} chunks for '{meta.title}'.")


if __name__ == "__main__":
    run_ingest()
