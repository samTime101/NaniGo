"""Vision-LLM pipeline that turns uploaded textbook pages into questions.

If an OPENAI_API_KEY is configured it calls a vision model; otherwise it
falls back to a deterministic generator built from the seed bank so the
"Upload Book Pages" feature always works in a demo.
"""

from __future__ import annotations

import base64
import json

from .config import settings
from .data.questions import SUBJECT_BANK

SYSTEM_PROMPT = (
    "Extract educational content from these textbook pages (may include "
    "Devanagari/Nepali). Generate 15 multiple-choice questions appropriate "
    "for a {age}-year-old in class {grade}. Each question: text, 4 options, "
    "correct index, one-line kid-friendly explanation. Return strict JSON "
    'with shape {{"questions": [{{"text": str, "options": [str,str,str,str], '
    '"correct_index": int, "explanation": str}}]}}.'
)


def _fallback_questions(subject: str, age: int, grade: int) -> list[dict]:
    bank = SUBJECT_BANK.get(subject, SUBJECT_BANK["math"])
    chosen = bank[:15]
    out = []
    for i, q in enumerate(chosen):
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
                    "options": opts,
                    "correct_index": ci,
                    "explanation": q.get("explanation", ""),
                    "figure": q.get("figure"),
                }
            )
    return valid


def generate_questions(
    subject: str,
    age: int,
    grade: int,
    image_bytes: list[bytes] | None = None,
) -> list[dict]:
    """Return up to 15 validated MCQs. Never raises — falls back on error."""
    if not settings.OPENAI_API_KEY:
        return _fallback_questions(subject, age, grade)

    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        content: list[dict] = [
            {
                "type": "text",
                "text": SYSTEM_PROMPT.format(age=age, grade=grade),
            }
        ]
        for img in (image_bytes or [])[:6]:
            b64 = base64.b64encode(img).decode()
            content.append(
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
                }
            )
        resp = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": content}],
            response_format={"type": "json_object"},
            max_tokens=2500,
        )
        payload = json.loads(resp.choices[0].message.content or "{}")
        valid = _validate(payload)
        if valid:
            return valid[:15]
    except Exception:
        pass

    return _fallback_questions(subject, age, grade)
