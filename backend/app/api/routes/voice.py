"""ArthMitra — Voice API"""
from fastapi import APIRouter, UploadFile, File
router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Whisper large-v3 transcription endpoint."""
    return {"text": "Mock transcription — integrate Whisper large-v3", "language": "hi", "confidence": 0.95}

@router.post("/synthesize")
async def synthesize_speech(text: str, language: str = "hi"):
    """XTTS-v2 TTS endpoint."""
    return {"audio_url": "/static/mock-audio.wav", "duration_seconds": 3.2}