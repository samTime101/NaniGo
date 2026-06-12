"""Speech endpoints for the voice-answer ("speak") question type.

Flow on the client:
1. The question is read aloud  -> POST /api/speech/tts returns MP3 audio.
2. The child speaks the answer  -> the recorded audio is sent to
   POST /api/speech/grade, which transcribes it (ElevenLabs Scribe) and grades
   it against the stored answer (Gemini, with a fuzzy fallback).

The ElevenLabs API key stays on the server.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

from ..ai import grade_spoken_answer
from ..config import settings
from ..store import store

router = APIRouter(prefix="/speech", tags=["speech"])

_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice}"
_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text"


def _enabled() -> bool:
    return bool(settings.ELEVENLABS_API_KEY)


# ---------- text to speech ----------
class TtsRequest(BaseModel):
    text: str


@router.post("/tts")
def tts(req: TtsRequest):
    """Synthesize the given text to MP3 audio (for reading questions aloud)."""
    if not _enabled():
        raise HTTPException(status_code=503, detail="Speech not configured")
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")

    body = json.dumps(
        {"text": text[:800], "model_id": settings.ELEVENLABS_TTS_MODEL_ID}
    ).encode("utf-8")
    http = urllib.request.Request(
        _TTS_URL.format(voice=settings.ELEVENLABS_TTS_VOICE_ID),
        data=body,
        headers={
            "xi-api-key": settings.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(http, timeout=30) as resp:
            audio = resp.read()
    except urllib.error.HTTPError as exc:  # pragma: no cover - network
        raise HTTPException(
            status_code=502,
            detail=f"TTS failed ({exc.code}): {exc.read().decode('utf-8', 'ignore')[:200]}",
        )
    except Exception as exc:  # pragma: no cover - network
        raise HTTPException(status_code=502, detail=f"TTS unreachable: {exc}")

    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={"Cache-Control": "no-store"},
    )


# ---------- speech to text + grading ----------
def _transcribe(data: bytes, filename: str, content_type: str) -> str:
    """Forward recorded audio to ElevenLabs Scribe and return the transcript."""
    boundary = "----nanigo" + uuid.uuid4().hex
    pre = (
        f"--{boundary}\r\n"
        'Content-Disposition: form-data; name="model_id"\r\n\r\n'
        f"{settings.ELEVENLABS_STT_MODEL_ID}\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: {content_type}\r\n\r\n"
    ).encode("utf-8")
    post = f"\r\n--{boundary}--\r\n".encode("utf-8")
    payload = pre + data + post

    http = urllib.request.Request(
        _STT_URL,
        data=payload,
        headers={
            "xi-api-key": settings.ELEVENLABS_API_KEY,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(http, timeout=60) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:  # pragma: no cover - network
        raise HTTPException(
            status_code=502,
            detail=f"Transcription failed ({exc.code}): {exc.read().decode('utf-8', 'ignore')[:200]}",
        )
    except Exception as exc:  # pragma: no cover - network
        raise HTTPException(status_code=502, detail=f"STT unreachable: {exc}")

    return (body.get("text") or "").strip()


@router.post("/grade")
async def grade(
    pack_id: str = Form(...),
    question_id: str = Form(...),
    file: UploadFile = File(...),
):
    """Transcribe the recorded answer and grade it against the stored question."""
    if not _enabled():
        raise HTTPException(status_code=503, detail="Speech not configured")

    pack = store.packs.get(pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    question = next(
        (q for q in pack.get("questions", []) if q.get("id") == question_id),
        None,
    )
    if not question or question.get("kind") != "speak":
        raise HTTPException(status_code=404, detail="Speak question not found")

    audio = await file.read()
    if not audio:
        raise HTTPException(status_code=400, detail="Empty audio")

    transcript = _transcribe(
        audio,
        file.filename or "answer.webm",
        file.content_type or "audio/webm",
    )

    expected = question.get("answer") or ""
    accept = question.get("accept")
    correct, feedback = grade_spoken_answer(
        question.get("text", ""), expected, accept, transcript
    )

    return {
        "transcript": transcript,
        "correct": correct,
        "expected": expected,
        "feedback": feedback,
    }
