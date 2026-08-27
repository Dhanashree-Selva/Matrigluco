import time
import logging
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from app.core.config import get_settings
from app.core.exceptions import InfrastructureError
from app.ai.runtime.generation import GenerationParams, GenerationResult
from app.ai.runtime.model_loader import AIModelLoader

logger = logging.getLogger("matrigluco.ai.runtime")
settings = get_settings()


class LLMRuntime(ABC):
    """
    Abstract interface for local LLM inference engines.
    """

    @abstractmethod
    def load_model(self) -> None:
        pass

    @abstractmethod
    def generate(self, prompt: str, params: Optional[GenerationParams] = None) -> GenerationResult:
        pass

    @abstractmethod
    def stream_generate(self, prompt: str, params: Optional[GenerationParams] = None):
        pass

    @abstractmethod
    def is_loaded(self) -> bool:
        pass


class ClinicalKnowledgeRuntime(LLMRuntime):
    """
    Fallback runtime when local GGUF model is offline or uninitialized.
    """

    def __init__(self):
        self._loaded = True

    def is_loaded(self) -> bool:
        return self._loaded

    def load_model(self) -> None:
        self._loaded = True

    def _synthesize_response(self, prompt: str) -> str:
        # 1. Parse user query from prompt
        user_query = ""
        if "<|im_start|>user" in prompt:
            try:
                user_query = prompt.split("<|im_start|>user\n")[-1].split("<|im_end|>")[0].strip()
            except Exception:
                user_query = ""
        elif "User:" in prompt:
            try:
                user_query = prompt.split("User:")[-1].split("\n")[0].strip()
            except Exception:
                user_query = ""

        query_lower = user_query.lower()

        # 2. Parse Patient Profile
        profile = {}
        if "PATIENT MATERNAL PROFILE:" in prompt:
            try:
                prof_block = prompt.split("PATIENT MATERNAL PROFILE:")[1].split("\n\n")[0]
                for line in prof_block.strip().split("\n"):
                    if "Gestational Age:" in line:
                        profile["week"] = line.split("Gestational Age:")[1].strip()
                    elif "Estimated Due Date:" in line:
                        profile["due_date"] = line.split("Estimated Due Date:")[1].strip()
                    elif "Maternal Age:" in line:
                        profile["age"] = line.split("Maternal Age:")[1].strip()
                    elif "Blood Group:" in line:
                        profile["blood_group"] = line.split("Blood Group:")[1].strip()
                    elif "Prior Pregnancies:" in line:
                        profile["prior_pregnancies"] = line.split("Prior Pregnancies:")[1].strip()
            except Exception:
                pass

        # 3. Parse Latest Risk Assessment
        assessment = {}
        if "LATEST GESTATIONAL DIABETES RISK ASSESSMENT:" in prompt:
            try:
                assess_block = prompt.split("LATEST GESTATIONAL DIABETES RISK ASSESSMENT:")[1].split("\n\n")[0]
                for line in assess_block.strip().split("\n"):
                    if "Evaluated Risk Level:" in line:
                        assessment["risk_level"] = line.split("Evaluated Risk Level:")[1].strip()
                    elif "Prediction Classification:" in line:
                        assessment["classification"] = line.split("Prediction Classification:")[1].strip()
                    elif "Assessment Biomarkers:" in line:
                        assessment["biomarkers"] = line.split("Assessment Biomarkers:")[1].strip()
            except Exception:
                pass

        # 4. Parse Recent Telemetry & Measurements
        measurements = []
        if "RECENT HEALTH MEASUREMENTS & GLUCOSE TELEMETRY:" in prompt:
            try:
                meas_block = prompt.split("RECENT HEALTH MEASUREMENTS & GLUCOSE TELEMETRY:")[1].split("\n\n")[0]
                for line in meas_block.strip().split("\n"):
                    if line.strip().startswith("•"):
                        measurements.append(line.strip().lstrip("•").strip())
            except Exception:
                pass

        # 5. Intent A: Profile / Database Details Inquiry
        if any(w in query_lower for w in ["blood group", "my details", "database", "my info", "my profile", "due date", "what week", "how many weeks", "my age", "prior pregnancies", "who am i", "my data"]):
            resp_lines = ["### Verified Maternal Profile in Database\n"]
            if profile:
                resp_lines.append("Here are your clinical details registered in your Matrigluco care file:\n")
                if "week" in profile:
                    resp_lines.append(f"- **Gestational Age**: {profile['week']}")
                if "due_date" in profile:
                    resp_lines.append(f"- **Estimated Due Date**: {profile['due_date']}")
                if "blood_group" in profile:
                    resp_lines.append(f"- **Blood Group**: **{profile['blood_group']}**")
                if "age" in profile:
                    resp_lines.append(f"- **Maternal Age**: {profile['age']}")
                if "prior_pregnancies" in profile:
                    resp_lines.append(f"- **Prior Pregnancies**: {profile['prior_pregnancies']}")
            else:
                resp_lines.append("No specific maternal profile attributes were found in context. You can view or update your gestational age, due date, and blood group anytime in **Account Settings > Maternal Care Context**.")

            if assessment:
                resp_lines.append("\n**Latest Clinical Status**:")
                if "risk_level" in assessment:
                    resp_lines.append(f"- **Evaluated Risk Level**: **{assessment['risk_level']}**")
                if "biomarkers" in assessment:
                    resp_lines.append(f"- **Assessment Biomarkers**: {assessment['biomarkers']}")

            if measurements:
                resp_lines.append(f"- **Latest Health Log**: {measurements[0]}")

            resp_lines.append("\n*(Your profile data is securely stored in MySQL and accessible only to you and your authorized clinical care team.)*")
            return "\n".join(resp_lines)

        # 6. Intent B: Risk Assessment Inquiry
        if any(w in query_lower for w in ["risk", "score", "probability", "assessment", "prediction", "biomarker", "result"]):
            resp_lines = ["### Gestational Diabetes Risk Assessment Analysis\n"]
            if assessment:
                resp_lines.append("Based on your latest ML clinical evaluation in the database:\n")
                if "risk_level" in assessment:
                    resp_lines.append(f"- **Evaluated Risk Level**: **{assessment['risk_level']}**")
                if "classification" in assessment:
                    resp_lines.append(f"- **Classification**: {assessment['classification']}")
                if "biomarkers" in assessment:
                    resp_lines.append(f"- **Key Biomarkers Recorded**: {assessment['biomarkers']}")

                resp_lines.append("\n**Clinical Interpretation**:")
                if "low" in assessment.get("risk_level", "").lower():
                    resp_lines.append("Your current biomarkers reflect a **Low Risk** profile. Continue maintaining balanced low-GI nutrition and routine antenatal checkups.")
                elif "moderate" in assessment.get("risk_level", "").lower():
                    resp_lines.append("Your biomarkers show a **Moderate Risk** profile. Regular blood glucose logging (fasting and 1–2 hours post-meal) is recommended to identify early glycemic shifts.")
                else:
                    resp_lines.append("Your evaluation indicates an **Elevated / High Risk** profile. We recommend scheduling a specialist consultation with your obstetrician and maintaining consistent blood glucose tracking.")
            else:
                resp_lines.append("No completed risk assessment record was found. You can run a new clinical assessment anytime in the **Assessment** module by inputting your latest clinical biomarkers.")

            resp_lines.append("\n*(Note: ML predictions provide clinical risk stratification and support decision-making, but do not replace diagnostic laboratory tests like the 75g OGTT.)*")
            return "\n".join(resp_lines)

        # 7. Intent C: Glucose Telemetry & Readings
        if any(w in query_lower for w in ["glucose", "reading", "readings", "telemetry", "blood sugar", "sugars", "measurement", "measurements", "log", "logs", "last reading"]):
            resp_lines = ["### Blood Glucose Telemetry & Clinical Logs\n"]
            if measurements:
                resp_lines.append("Here are your most recent health readings from the database:\n")
                for m in measurements[:6]:
                    resp_lines.append(f"- {m}")
                resp_lines.append("\n**ADA Pregnancy Glycemic Reference Standards**:")
                resp_lines.append("- **Fasting Blood Glucose**: 70–95 mg/dL")
                resp_lines.append("- **1-Hour Postprandial**: < 140 mg/dL")
                resp_lines.append("- **2-Hour Postprandial**: < 120 mg/dL")
            else:
                resp_lines.append("No recent glucose measurements were found in the database. You can log your fasting and post-meal readings in the **Tracking** module to visualize trends and receive real-time glycemic feedback.")

            resp_lines.append("\n*(If you experience readings < 60 mg/dL or persistently > 180 mg/dL, please consult your prenatal healthcare provider immediately.)*")
            return "\n".join(resp_lines)

        # 8. Intent D: Nutrition / Diet / Meal Plan
        if any(w in query_lower for w in ["food", "eat", "diet", "nutrition", "meal", "snack", "carb", "carbs", "carbohydrate", "breakfast", "lunch", "dinner"]):
            week_str = f" for {profile['week']}" if "week" in profile else ""
            return (
                f"### Evidence-Based Maternal Nutrition & Glycemic Management{week_str}\n\n"
                "Here are clinical dietary guidelines tailored for gestational glycemic stability:\n\n"
                "1. **Carbohydrate Timing & Minimum Requirement**:\n"
                "   - Consume at least **175g of complex carbohydrates daily** to support fetal neurological development while avoiding ketosis.\n"
                "   - Distribute carbohydrates across **3 moderate meals and 2–3 snacks** to smooth postprandial glucose curves.\n\n"
                "2. **Low Glycemic Index (GI) Choices**:\n"
                "   - Choose steel-cut oats, quinoa, brown rice, whole-grain sourdough, lentils, and chickpeas over refined starches.\n"
                "   - Aim for **28g of dietary fiber daily** (chia seeds, leafy greens, broccoli, berries).\n\n"
                "3. **Protein & Healthy Fat Pairing**:\n"
                "   - Pair every carbohydrate with a lean protein (Greek yogurt, eggs, tofu, fish, paneer, poultry) or healthy fat (avocado, nuts, olive oil) to slow gastric emptying.\n\n"
                "4. **Postprandial Activity**:\n"
                "   - A gentle **10–15 minute walk** after lunch and dinner enhances insulin-independent glucose uptake into muscles.\n\n"
                "*(Always coordinate with your registered prenatal dietitian or obstetrician for individualized macronutrient planning.)*"
            )

        # 9. Intent E: General / Overview / Default Summary
        summary_lines = ["### Maternal Health & Clinical Care Summary\n"]
        if profile or assessment:
            summary_lines.append("Based on your verified patient records in Matrigluco:\n")
            if "week" in profile:
                summary_lines.append(f"- **Gestational Age**: {profile['week']}")
            if "blood_group" in profile:
                summary_lines.append(f"- **Blood Group**: {profile['blood_group']}")
            if "due_date" in profile:
                summary_lines.append(f"- **Due Date**: {profile['due_date']}")
            if "risk_level" in assessment:
                summary_lines.append(f"- **Evaluated Risk Level**: **{assessment['risk_level']}**")
            if measurements:
                summary_lines.append(f"- **Recent Telemetry**: {len(measurements)} recent readings on file (latest: {measurements[0]})")
            summary_lines.append("")

        summary_lines.extend([
            "### Clinical Guidance & Glycemic Targets",
            "",
            "1. **Target Blood Glucose Reference Ranges**:",
            "   - **Fasting Glucose**: 70–95 mg/dL",
            "   - **1-Hour Postprandial**: < 140 mg/dL",
            "   - **2-Hour Postprandial**: < 120 mg/dL",
            "",
            "2. **Continuous Monitoring & Antenatal Support**:",
            "   - Keep logging daily fasting and post-meal glucose in the **Tracking** module.",
            "   - Schedule specialist reviews via the **Consultations** care hub when needed.",
            "",
            "*(Note: This guidance is educational and does not replace individualized clinical advice from your prenatal care team.)*"
        ])

        return "\n".join(summary_lines)

    def generate(self, prompt: str, params: Optional[GenerationParams] = None) -> GenerationResult:
        start_time = time.perf_counter()
        response_text = self._synthesize_response(prompt)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        tokens = len(response_text.split())

        return GenerationResult(
            text=response_text,
            tokens_generated=tokens,
            finish_reason="stop",
            latency_ms=round(elapsed_ms, 2),
            model_name="matrigluco-offline-fallback:1.0.0",
        )

    def stream_generate(self, prompt: str, params: Optional[GenerationParams] = None):
        response_text = self._synthesize_response(prompt)
        words = response_text.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            time.sleep(0.015)


class LlamaCppRuntime(LLMRuntime):
    """
    Production local LLM execution engine wrapping llama-cpp-python (GGUF).
    """

    def __init__(self, loader: Optional[AIModelLoader] = None):
        self.loader = loader or AIModelLoader()
        self._llm = None
        self._fallback_runtime = ClinicalKnowledgeRuntime()

    def is_loaded(self) -> bool:
        return self._llm is not None

    def load_model(self) -> None:
        if not settings.AI_ENABLED:
            logger.debug("AI runtime loading skipped (AI_ENABLED=false).")
            return

        if self._llm is not None:
            return

        if not self.loader.is_model_available():
            logger.info("Local GGUF model file not present. Engaging Clinical Knowledge Runtime.")
            self._llm = None
            return

        try:
            from llama_cpp import Llama  # type: ignore
        except ImportError:
            logger.warning("llama-cpp-python not found. Engaging Clinical Knowledge Runtime.")
            self._llm = None
            return

        model_path = self.loader.get_resolved_path()

        logger.info(f"Loading GGUF model from {model_path} into memory...")
        try:
            self._llm = Llama(
                model_path=str(model_path),
                n_ctx=settings.AI_CONTEXT_SIZE,
                n_gpu_layers=settings.AI_GPU_LAYERS,
                n_threads=settings.AI_THREADS,
                verbose=False,
            )
            logger.info("Local GGUF model loaded successfully.")
        except Exception as e:
            logger.warning(f"Unable to load local GGUF file ({e}). Using Clinical Knowledge Runtime.")
            self._llm = None

    def generate(self, prompt: str, params: Optional[GenerationParams] = None) -> GenerationResult:
        if not self.is_loaded():
            self.load_model()

        if self._llm is None:
            return self._fallback_runtime.generate(prompt, params)

        cfg = params or GenerationParams(
            max_tokens=settings.AI_MAX_OUTPUT_TOKENS,
            temperature=settings.AI_TEMPERATURE,
            top_p=settings.AI_TOP_P,
            top_k=settings.AI_TOP_K,
            repeat_penalty=1.18,
        )

        start_time = time.perf_counter()
        try:
            output = self._llm(
                prompt=prompt,
                max_tokens=cfg.max_tokens,
                temperature=cfg.temperature,
                top_p=cfg.top_p,
                top_k=cfg.top_k,
                repeat_penalty=cfg.repeat_penalty,
                stop=cfg.stop_sequences,
                echo=False,
            )
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0

            text = output["choices"][0]["text"].strip()
            tokens_used = output.get("usage", {}).get("completion_tokens", 0)
            finish_reason = output["choices"][0].get("finish_reason", "stop")

            return GenerationResult(
                text=text,
                tokens_generated=tokens_used,
                finish_reason=finish_reason,
                latency_ms=round(elapsed_ms, 2),
                model_name=settings.AI_MODEL_NAME,
            )
        except Exception as e:
            logger.warning(f"GGUF inference failed ({e}). Falling back to Clinical Knowledge Runtime.")
            return self._fallback_runtime.generate(prompt, params)

    def stream_generate(self, prompt: str, params: Optional[GenerationParams] = None):
        if not self.is_loaded():
            self.load_model()

        if self._llm is None:
            yield from self._fallback_runtime.stream_generate(prompt, params)
            return

        cfg = params or GenerationParams(
            max_tokens=settings.AI_MAX_OUTPUT_TOKENS,
            temperature=settings.AI_TEMPERATURE,
            top_p=settings.AI_TOP_P,
            top_k=settings.AI_TOP_K,
            repeat_penalty=1.18,
        )

        try:
            stream = self._llm(
                prompt=prompt,
                max_tokens=cfg.max_tokens,
                temperature=cfg.temperature,
                top_p=cfg.top_p,
                top_k=cfg.top_k,
                repeat_penalty=cfg.repeat_penalty,
                stop=cfg.stop_sequences,
                stream=True,
                echo=False,
            )
            for chunk in stream:
                token = chunk["choices"][0].get("text", "")
                if token:
                    yield token
        except Exception as e:
            logger.warning(f"GGUF stream failed ({e}). Yielding fallback stream.")
            yield from self._fallback_runtime.stream_generate(prompt, params)


# Global singleton instance
_ai_runtime_instance: Optional[LLMRuntime] = None


def get_ai_runtime() -> LLMRuntime:
    """Returns singleton LLMRuntime instance."""
    global _ai_runtime_instance
    if _ai_runtime_instance is None:
        _ai_runtime_instance = LlamaCppRuntime()
    return _ai_runtime_instance
