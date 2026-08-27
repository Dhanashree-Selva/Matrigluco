"""
Rebuilds the local RAG knowledge chunk index from all stored guideline files.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.ai.knowledge.ingestion import KnowledgeIngestionPipeline


def rebuild_index():
    pipeline = KnowledgeIngestionPipeline()
    docs_dir = Path("storage/private/knowledge-documents")
    print(f"Rebuilding knowledge index from {docs_dir}...")
    count = 0
    for txt_file in docs_dir.glob("*.txt"):
        print(f"  Indexing: {txt_file.name}")
        pipeline.ingest_document(str(txt_file))
        count += 1
    print(f"Index rebuild complete. Processed {count} documents.")


if __name__ == "__main__":
    rebuild_index()
