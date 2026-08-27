from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class ExtractedLabValues:
    glucose_fasting: Optional[float] = None
    glucose_pp: Optional[float] = None
    glucose: Optional[float] = None
    hba1c: Optional[float] = None
    bmi: Optional[float] = None
    age: Optional[float] = None
    blood_pressure: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "glucose_fasting": self.glucose_fasting,
            "glucose_pp": self.glucose_pp,
            "glucose": self.glucose,
            "hba1c": self.hba1c,
            "bmi": self.bmi,
            "age": self.age,
            "blood_pressure": self.blood_pressure,
        }
