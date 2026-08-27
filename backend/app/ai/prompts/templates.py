from typing import List, Dict


def build_llama3_chat_prompt(
    system_prompt: str,
    messages: List[Dict[str, str]],
    rag_context: str = "",
    patient_context: str = "",
) -> str:
    """
    Constructs standard ChatML / instruction formatted prompt compatible with Qwen and Llama GGUF models.
    """
    full_system = system_prompt.strip()
    if patient_context:
        full_system += f"\n\n{patient_context}"
    if rag_context:
        full_system += f"\n\nVERIFIED CLINICAL KNOWLEDGE CONTEXT:\n{rag_context}"

    prompt = f"<|begin_of_text|><|im_start|>system\n{full_system}<|im_end|>\n"

    for msg in messages:
        role = msg["role"]
        content = msg["content"].strip()
        prompt += f"<|im_start|>{role}\n{content}<|im_end|>\n"

    prompt += "<|im_start|>assistant\n"
    return prompt
