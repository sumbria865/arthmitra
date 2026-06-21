import os
import asyncio
import httpx
from dotenv import load_dotenv

# FORCE correct env path (VERY IMPORTANT)
load_dotenv(dotenv_path="C:/Users/prink/Desktop/arthmitra/backend/.env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

print("KEY LOADED:", GEMINI_API_KEY)
print("KEY LENGTH:", len(GEMINI_API_KEY or ""))


async def test():
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": "Say hello in one line"}]
            }
        ]
    }

    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{url}?key={GEMINI_API_KEY}",
            json=payload,
            timeout=20
        )

        print("STATUS:", r.status_code)
        print("RESPONSE:", r.text)


asyncio.run(test())