import os
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def call_gemini(prompt: str, model: str = "gemini-1.5-pro") -> str:
    response = client.models.generate_content(
        model=model,
        contents=prompt
    )
    return response.text