from typing import List
from app.ai.rag.contracts import RAGChunk

DEFAULT_CLINICAL_CHUNKS: List[RAGChunk] = [
    RAGChunk(
        chunk_id="chunk_ada_glycemic_targets",
        document_id="ADA_GDM_2024",
        text=(
            "Gestational Diabetes Glycemic Targets (ADA 2024 / ACOG): Recommended self-monitoring targets "
            "during pregnancy are: Fasting blood glucose 70–95 mg/dL (3.9–5.3 mmol/L); 1-hour postprandial glucose < 140 mg/dL "
            "(< 7.8 mmol/L); and 2-hour postprandial glucose < 120 mg/dL (< 6.7 mmol/L). Target HbA1c is ideally < 6.0% (42 mmol/mol) "
            "if achievable without maternal hypoglycemia."
        ),
        metadata={"category": "targets", "source": "ADA Guidelines 2024", "topic": "glycemic_targets"},
    ),
    RAGChunk(
        chunk_id="chunk_ada_screening_criteria",
        document_id="ADA_GDM_2024",
        text=(
            "Gestational Diabetes Screening & Diagnostic Criteria: Routine universal screening is performed at 24–28 weeks of gestation. "
            "For the 75g 2-hour Oral Glucose Tolerance Test (OGTT), diagnostic thresholds are: Fasting ≥ 92 mg/dL, 1-hour ≥ 180 mg/dL, "
            "and 2-hour ≥ 153 mg/dL. Any single abnormal value establishes a clinical diagnosis of Gestational Diabetes Mellitus (GDM)."
        ),
        metadata={"category": "screening", "source": "ADA Guidelines 2024", "topic": "diagnostic_criteria"},
    ),
    RAGChunk(
        chunk_id="chunk_maternal_nutrition",
        document_id="WHO_ANC_2023",
        text=(
            "Maternal Nutrition & Macronutrient Distribution in GDM: Daily dietary intake must supply at least 175 grams of complex "
            "carbohydrates to prevent maternal ketosis and support fetal neural development. Carbohydrates should have a low glycemic index, "
            "be high in fiber (target 28g/day), and be distributed across 3 moderate meals and 2–3 snacks. Protein intake should increase "
            "by +25g/day (~1.1 g/kg/day) paired with healthy monounsaturated and polyunsaturated fats."
        ),
        metadata={"category": "nutrition", "source": "WHO Antenatal Care 2023", "topic": "nutrition_diet"},
    ),
    RAGChunk(
        chunk_id="chunk_physical_activity",
        document_id="ACOG_EXERCISE_2023",
        text=(
            "Physical Activity & Postprandial Glucose Control: Moderate aerobic exercise (such as a 10–15 minute brisk walk after meals, "
            "prenatal yoga, or stationary cycling) significantly lowers postprandial glucose peaks by enhancing insulin-independent GLUT4 "
            "translocation into skeletal muscle. Cumulative target is 150 minutes per week unless obstetric contraindications exist."
        ),
        metadata={"category": "lifestyle", "source": "ACOG Committee Opinion 2023", "topic": "exercise_activity"},
    ),
    RAGChunk(
        chunk_id="chunk_hypo_hyper_management",
        document_id="ADA_GDM_2024",
        text=(
            "Hypoglycemia and Hyperglycemia Management: Hypoglycemia during pregnancy is defined as blood glucose < 60–70 mg/dL. "
            "Immediate treatment is the 15-15 Rule: consume 15g fast-acting carbohydrate (such as 1/2 cup fruit juice or 3–4 glucose tablets), "
            "wait 15 minutes, and recheck glucose. Persistent hyperglycemia (> 200 mg/dL), severe nausea/vomiting, or ketones in urine "
            "warrant immediate clinical evaluation."
        ),
        metadata={"category": "acute_management", "source": "ADA Guidelines 2024", "topic": "hypoglycemia_hyperglycemia"},
    ),
    RAGChunk(
        chunk_id="chunk_fetal_surveillance",
        document_id="ACOG_FETAL_2023",
        text=(
            "Fetal Growth & Gestational Milestones: Maternal hyperglycemia increases fetal insulin production and excess fat deposition, "
            "raising risk of macrosomia (birth weight > 4,000g), birth trauma, and neonatal hypoglycemia. Ongoing glycemic logging, "
            "regular ultrasound biometry (abdominal circumference monitoring), and third-trimester fetal movement tracking optimize outcomes."
        ),
        metadata={"category": "fetal_care", "source": "ACOG Clinical Practice Guidelines 2023", "topic": "fetal_surveillance"},
    ),
    RAGChunk(
        chunk_id="chunk_blood_pressure_preeclampsia",
        document_id="ACOG_HYPERTENSION_2023",
        text=(
            "Blood Pressure & Preeclampsia Awareness: Normal blood pressure in pregnancy is < 120/80 mmHg. A reading ≥ 140/90 mmHg "
            "after 20 weeks requires prompt evaluation. Warning signs that require urgent emergency care include persistent severe headaches, "
            "visual changes (blurriness or flashing lights), upper right abdominal pain, or sudden shortness of breath."
        ),
        metadata={"category": "cardiovascular", "source": "ACOG Guidelines 2023", "topic": "blood_pressure"},
    ),
]


def get_default_clinical_chunks() -> List[RAGChunk]:
    """Returns verified evidence-based maternal clinical guideline chunks for RAG."""
    return list(DEFAULT_CLINICAL_CHUNKS)
