import re
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, Tuple, List


@dataclass
class ExtractedHealthValues:
    fasting_glucose: Optional[float] = None
    postprandial_glucose: Optional[float] = None
    glucose: Optional[float] = None
    hba1c: Optional[float] = None
    bp_systolic: Optional[float] = None
    bp_diastolic: Optional[float] = None
    blood_pressure: Optional[float] = None
    bmi: Optional[float] = None
    age: Optional[float] = None
    insulin: Optional[float] = None
    platelets: Optional[float] = None
    cholesterol: Optional[float] = None

    # Backward compatibility aliases
    @property
    def glucose_fasting(self) -> Optional[float]:
        return self.fasting_glucose

    @property
    def glucose_pp(self) -> Optional[float]:
        return self.postprandial_glucose

    def to_dict(self) -> Dict[str, Any]:
        data: Dict[str, Any] = {}
        if self.fasting_glucose is not None:
            data["fasting_glucose"] = self.fasting_glucose
            data["glucose_fasting"] = self.fasting_glucose
        if self.postprandial_glucose is not None:
            data["postprandial_glucose"] = self.postprandial_glucose
            data["glucose_pp"] = self.postprandial_glucose
        if self.glucose is not None:
            data["glucose"] = self.glucose
        if self.hba1c is not None:
            data["hba1c"] = self.hba1c
        if self.bp_systolic is not None:
            data["bp_systolic"] = self.bp_systolic
        if self.bp_diastolic is not None:
            data["bp_diastolic"] = self.bp_diastolic
        if self.blood_pressure is not None:
            data["blood_pressure"] = self.blood_pressure
        if self.bmi is not None:
            data["bmi"] = self.bmi
        if self.age is not None:
            data["age"] = self.age
        if self.insulin is not None:
            data["insulin"] = self.insulin
        if self.platelets is not None:
            data["platelets"] = self.platelets
        if self.cholesterol is not None:
            data["cholesterol"] = self.cholesterol
        return data


class MedicalReportParser:
    """
    Robust deterministic parser for clinical medical reports, PDFs, and OCR text streams.
    """

    TRIGGERS: Dict[str, List[str]] = {
        "fasting_glucose": [
            r"fasting\s*(?:blood\s*|plasma\s*|serum\s*)?glucose(?:\s*\(fbs\))?",
            r"glucose\s*fasting",
            r"fbs",
            r"f\.b\.s\.?",
            r"fasting\s*blood\s*sugar",
            r"fasting\s*sugar",
            r"fasting",
        ],
        "postprandial_glucose": [
            r"(?:2[- ]?hour\s*)?post\s*prandial\s*(?:blood\s*|plasma\s*|serum\s*)?glucose(?:\s*\(ppbs\))?",
            r"glucose\s*(?:2h\s*)?pp",
            r"ppbs",
            r"p\.p\.b\.s\.?",
            r"post\s*prandial\s*blood\s*sugar",
            r"post\s*prandial\s*sugar",
            r"2h\s*ppbs",
            r"post\s*prandial",
        ],
        "glucose": [
            r"estimated\s*average\s*glucose",
            r"(?:blood|plasma|serum)\s*glucose",
            r"random\s*blood\s*sugar",
            r"rbs",
            r"r\.b\.s\.?",
            r"glucose",
            r"sugar",
        ],
        "hba1c": [
            r"glycated\s*hemoglobin(?:\s*\(hba1c\))?",
            r"glycohemoglobin",
            r"hba1c",
            r"hb\s*a1c",
            r"hb1ac",
            r"a1c",
        ],
        "bp_systolic": [
            r"systolic\s*blood\s*pressure",
            r"bp\s*systolic",
            r"systolic\s*bp",
            r"systolic",
        ],
        "bp_diastolic": [
            r"diastolic\s*blood\s*pressure",
            r"bp\s*diastolic",
            r"diastolic\s*bp",
            r"diastolic",
        ],
        "blood_pressure": [
            r"blood\s*pressure\s*\(systolic/diastolic\)",
            r"blood\s*pressure",
            r"bp\s*reading",
            r"b\.p\.",
        ],
        "bmi": [
            r"body\s*mass\s*index(?:\s*\(bmi\))?",
            r"bmi",
        ],
        "insulin": [
            r"serum\s*insulin(?:\s*\(fasting\))?",
            r"fasting\s*insulin",
            r"serum\s*fasting\s*insulin",
            r"insulin",
        ],
        "platelets": [
            r"platelet\s*count",
            r"platelets",
        ],
        "cholesterol": [
            r"total\s*serum\s*cholesterol",
            r"total\s*cholesterol",
            r"serum\s*cholesterol",
            r"cholesterol",
        ],
        "age": [
            r"age\s*/\s*gender",
            r"age",
            r"yrs",
            r"years",
        ],
    }

    RANGES: Dict[str, Tuple[float, float]] = {
        "fasting_glucose": (30.0, 500.0),
        "postprandial_glucose": (30.0, 600.0),
        "glucose": (30.0, 600.0),
        "hba1c": (2.0, 25.0),
        "bp_systolic": (60.0, 260.0),
        "bp_diastolic": (40.0, 160.0),
        "blood_pressure": (40.0, 260.0),
        "bmi": (10.0, 70.0),
        "age": (1.0, 120.0),
        "insulin": (0.5, 300.0),
        "platelets": (10.0, 1000.0),
        "cholesterol": (50.0, 600.0),
    }

    def parse(self, text: str) -> ExtractedHealthValues:
        extracted = ExtractedHealthValues()
        if not text or not text.strip():
            return extracted

        lines = [line.strip() for line in text.splitlines() if line.strip()]

        # 1. Dual blood pressure fraction e.g. "120/80" or "118/78"
        bp_pair = re.search(r"\b(\d{2,3})\s*[/]\s*(\d{2,3})\b", text)
        if bp_pair:
            sys_val = float(bp_pair.group(1))
            dia_val = float(bp_pair.group(2))
            if 70 <= sys_val <= 240 and 40 <= dia_val <= 140:
                extracted.bp_systolic = sys_val
                extracted.bp_diastolic = dia_val
                extracted.blood_pressure = dia_val

        # 2. Patient Age from header
        age_match = re.search(
            r"(?:age(?:\s*/\s*gender)?|patient\s*age)\s*[:=-]?\s*(\d{1,3})\s*(?:yrs|years)?",
            text,
            re.IGNORECASE,
        )
        if age_match:
            try:
                age_val = float(age_match.group(1))
                if 1 <= age_val <= 120:
                    extracted.age = age_val
            except ValueError:
                pass

        # 3. Columnar Table Extraction (e.g. parameter names followed by a list of observed values)
        from app.document_ai.medical.terminology import ClinicalTerminologyRegistry

        terminology = ClinicalTerminologyRegistry()
        i = 0
        while i < len(lines):
            concepts_run = []
            j = i
            while j < len(lines):
                line = lines[j]
                # Skip table section headers
                if any(
                    h in line.upper()
                    for h in [
                        "INVESTIGATION",
                        "PARAMETER",
                        "TEST NAME",
                        "PANEL",
                        "DIAGNOSTICS",
                        "PATIENT INFORMATION",
                    ]
                ):
                    j += 1
                    continue

                concept = terminology.match_concept(line)
                # Ensure line is a parameter label rather than a sentence
                if (
                    concept
                    and len(line.split()) <= 7
                    and not any(
                        w in line.lower()
                        for w in ["indicate", "recommended", "tolerance", "screening", "notes", "verified"]
                    )
                ):
                    concepts_run.append((concept.value, line))
                    j += 1
                else:
                    break

            if len(concepts_run) >= 2:
                # Seek forward to the first numeric line
                k = j
                while k < len(lines) and not re.search(r"^\d+\.?\d*$", lines[k]):
                    k += 1

                numbers_run = []
                while k < len(lines):
                    num_m = re.match(r"^(\d+\.?\d*)$", lines[k])
                    if num_m:
                        numbers_run.append(float(num_m.group(1)))
                        k += 1
                        if len(numbers_run) == len(concepts_run):
                            break
                    else:
                        break

                if len(numbers_run) == len(concepts_run):
                    for (c_key, _), val in zip(concepts_run, numbers_run):
                        min_v, max_v = self.RANGES.get(c_key, (0.0, 9999.0))
                        if min_v <= val <= max_v and getattr(extracted, c_key, None) is None:
                            setattr(extracted, c_key, val)
                    i = k
                    continue
            i += 1

        # 4. Line-by-line key-value extraction (same line)
        for line in lines:
            for key, patterns in self.TRIGGERS.items():
                if getattr(extracted, key, None) is not None:
                    continue

                trigger_regex = r"(?:" + "|".join(patterns) + r")"
                m = re.search(trigger_regex, line, re.IGNORECASE)
                if m:
                    after_text = line[m.end() :]
                    num_m = re.search(r"\b(\d+\.?\d*)\b", after_text)
                    if num_m:
                        try:
                            val = float(num_m.group(1))
                            min_v, max_v = self.RANGES.get(key, (0.0, 9999.0))
                            if min_v <= val <= max_v:
                                setattr(extracted, key, val)
                        except ValueError:
                            pass

        # 5. Proximity window fallback across clean text
        clean_text = " ".join(lines)
        for key, patterns in self.TRIGGERS.items():
            if getattr(extracted, key, None) is not None:
                continue

            trigger_regex = r"(?:" + "|".join(patterns) + r")"
            for trigger_match in re.finditer(trigger_regex, clean_text, re.IGNORECASE):
                start_pos = trigger_match.end()
                lookahead = clean_text[start_pos : start_pos + 60]

                # Look for first numeric value within immediate lookahead
                numbers = re.finditer(r"\b(\d+\.?\d*)\b", lookahead)
                found = False
                for num_match in numbers:
                    val_str = num_match.group(1)
                    try:
                        val = float(val_str)
                        min_v, max_v = self.RANGES.get(key, (0.0, 9999.0))
                        if min_v <= val <= max_v:
                            setattr(extracted, key, val)
                            found = True
                            break
                    except ValueError:
                        continue

                if found:
                    break

        # 6. Fallback glucose
        if extracted.glucose is None:
            extracted.glucose = extracted.fasting_glucose or extracted.postprandial_glucose

        # 7. Reconcile blood pressure
        if extracted.blood_pressure is None:
            extracted.blood_pressure = extracted.bp_diastolic or extracted.bp_systolic

        return extracted
