"""Gemini-powered pipeline that turns uploaded textbook pages into questions.

Uses a Gemini vision model to OCR the page images (including Devanagari /
Nepali) and generate grade-appropriate MCQs in one multimodal call. If no
GEMINI_API_KEY is configured, or the call fails, it falls back to a
deterministic generator built from the seed bank so the feature always works.
"""

from __future__ import annotations

import json

from .config import settings
from .data.questions import SUBJECT_BANK

SYSTEM_PROMPT = (
    "You are an OCR and question-writing assistant for a children's learning "
    "app in Nepal. Read the attached textbook page images carefully. They may "
    "contain Devanagari / Nepali text. Extract the educational content and "
    "generate exactly 15 multiple-choice questions appropriate for a "
    "{age}-year-old child in class {grade} studying {subject}.\n"
    "Each question must have: a short 'text', exactly 4 'options', a "
    "'correct_index' (0-3), and a one-line kid-friendly 'explanation'. "
    "Keep language simple. Return STRICT JSON only, with this exact shape:\n"
    '{{"questions": [{{"text": "...", "options": ["a","b","c","d"], '
    '"correct_index": 0, "explanation": "..."}}]}}'
)


def _fallback_questions(subject: str, age: int, grade: int) -> list[dict]:
    bank = SUBJECT_BANK.get(subject, SUBJECT_BANK["math"])
    chosen = bank[:15]
    out = []
    for q in chosen:
        out.append(
            {
                "text": q["text"],
                "text_np": q.get("text_np"),
                "options": q["options"],
                "correct_index": q["correct_index"],
                "explanation": q["explanation"],
                "figure": q.get("figure"),
            }
        )
    return out


def _validate(payload: dict) -> list[dict]:
    questions = payload.get("questions", [])
    valid = []
    for q in questions:
        opts = q.get("options")
        ci = q.get("correct_index")
        if (
            isinstance(q.get("text"), str)
            and isinstance(opts, list)
            and len(opts) == 4
            and isinstance(ci, int)
            and 0 <= ci < 4
        ):
            valid.append(
                {
                    "text": q["text"],
                    "text_np": q.get("text_np"),
                    "options": [str(o) for o in opts],
                    "correct_index": ci,
                    "explanation": q.get("explanation", ""),
                    "figure": q.get("figure"),
                }
            )
    return valid


def _guess_mime(data: bytes) -> str:
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"


def generate_questions(
    subject: str,
    age: int,
    grade: int,
    image_bytes: list[bytes] | None = None,
) -> list[dict]:
    """Return up to 15 validated MCQs. Never raises — falls back on error."""
    if not settings.GEMINI_API_KEY:
        return _fallback_questions(subject, age, grade)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        prompt = SYSTEM_PROMPT.format(age=age, grade=grade, subject=subject)
        contents: list = [prompt]
        for img in (image_bytes or [])[:10]:
            contents.append(
                types.Part.from_bytes(data=img, mime_type=_guess_mime(img))
            )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.4,
            ),
        )

        text = (response.text or "").strip()
        payload = json.loads(text)
        valid = _validate(payload)
        if valid:
            return valid[:15]
    except Exception as exc:  # pragma: no cover - network/SDK errors
        print(f"[ai] Gemini generation failed, using fallback: {exc}")

    return _fallback_questions(subject, age, grade)
