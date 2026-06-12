"""Gemini-powered pipeline that turns uploaded textbook pages into questions.

Uses a Gemini vision model to OCR the page images (including Devanagari /
Nepali) and generate a MIX of grade-appropriate question types in one
multimodal call: multiple-choice, match-the-following, and order (drag&drop).
If no GEMINI_API_KEY is configured, or the call fails, it falls back to a
deterministic mixed generator built from the seed bank so the feature always
works.
"""

from __future__ import annotations

import json

from .config import settings
from .data.questions import SUBJECT_PACK_MIXED

SYSTEM_PROMPT = (
    "You are an OCR and question-writing assistant for a children's learning "
    "app in Nepal. Read the attached textbook page images carefully. They may "
    "contain Devanagari / Nepali text. Extract the educational content and "
    "generate exactly 15 fun questions for a {age}-year-old child in class "
    "{grade} studying {subject}. Mix the question types for variety:\n"
    "- about 8 'mcq' (multiple choice, 4 options)\n"
    "- about 2 'match' (match-the-following with 3-4 pairs)\n"
    "- about 2 'order' (put 3-4 items in the correct order)\n"
    "- about 3 'speak' (the child hears the question and answers OUT LOUD "
    "with their voice; the answer should be a short word or phrase)\n"
    "Keep language simple and kid-friendly. Return STRICT JSON only:\n"
    '{{"questions": [\n'
    '  {{"kind":"mcq","text":"...","options":["a","b","c","d"],'
    '"correct_index":0,"explanation":"..."}},\n'
    '  {{"kind":"match","text":"Match ...","pairs":[{{"left":"..","right":".."}}],'
    '"explanation":"..."}},\n'
    '  {{"kind":"order","text":"Put in order ...","sequence":["first","second","third"],'
    '"explanation":"..."}},\n'
    '  {{"kind":"speak","text":"Say the answer out loud: what is 2 plus 2?",'
    '"answer":"four","accept":["4","four","char"],"explanation":"..."}}\n'
    "]}}"
)


def _norm_mcq(q: dict) -> dict | None:
    opts = q.get("options")
    ci = q.get("correct_index")
    if (
        isinstance(q.get("text"), str)
        and isinstance(opts, list)
        and len(opts) == 4
        and isinstance(ci, int)
        and 0 <= ci < 4
    ):
        return {
            "kind": "mcq",
            "text": q["text"],
            "text_np": q.get("text_np"),
            "options": [str(o) for o in opts],
            "correct_index": ci,
            "explanation": q.get("explanation", ""),
            "figure": q.get("figure"),
            "pairs": None,
            "sequence": None,
        }
    return None


def _norm_match(q: dict) -> dict | None:
    pairs = q.get("pairs")
    if (
        isinstance(q.get("text"), str)
        and isinstance(pairs, list)
        and 2 <= len(pairs) <= 5
        and all(
            isinstance(p, dict)
            and isinstance(p.get("left"), (str, int, float))
            and isinstance(p.get("right"), (str, int, float))
            for p in pairs
        )
    ):
        return {
            "kind": "match",
            "text": q["text"],
            "text_np": q.get("text_np"),
            "options": [],
            "correct_index": 0,
            "explanation": q.get("explanation", ""),
            "figure": None,
            "pairs": [
                {"left": str(p["left"]), "right": str(p["right"])} for p in pairs
            ],
            "sequence": None,
        }
    return None


def _norm_order(q: dict) -> dict | None:
    seq = q.get("sequence")
    if (
        isinstance(q.get("text"), str)
        and isinstance(seq, list)
        and 2 <= len(seq) <= 6
        and all(isinstance(s, (str, int, float)) for s in seq)
    ):
        return {
            "kind": "order",
            "text": q["text"],
            "text_np": q.get("text_np"),
            "options": [],
            "correct_index": 0,
            "explanation": q.get("explanation", ""),
            "figure": None,
            "pairs": None,
            "sequence": [str(s) for s in seq],
            "answer": None,
            "accept": None,
        }
    return None


def _norm_speak(q: dict) -> dict | None:
    answer = q.get("answer")
    if isinstance(q.get("text"), str) and isinstance(answer, (str, int, float)):
        accept = q.get("accept")
        accept_list = (
            [str(a) for a in accept] if isinstance(accept, list) else None
        )
        return {
            "kind": "speak",
            "text": q["text"],
            "text_np": q.get("text_np"),
            "options": [],
            "correct_index": 0,
            "explanation": q.get("explanation", ""),
            "figure": None,
            "pairs": None,
            "sequence": None,
            "answer": str(answer),
            "accept": accept_list,
        }
    return None


def _validate(payload: dict) -> list[dict]:
    out: list[dict] = []
    for q in payload.get("questions", []):
        kind = q.get("kind", "mcq")
        norm = (
            _norm_match(q)
            if kind == "match"
            else _norm_order(q)
            if kind == "order"
            else _norm_speak(q)
            if kind == "speak"
            else _norm_mcq(q)
        )
        if norm:
            out.append(norm)
    return out


def _fallback_questions(subject: str, age: int, grade: int) -> list[dict]:
    """Mixed offline fallback (preserves match/order question kinds)."""
    bank = SUBJECT_PACK_MIXED.get(subject, SUBJECT_PACK_MIXED["math"])
    out = []
    for q in bank[:15]:
        out.append({k: v for k, v in q.items() if k != "id"})
    return out


def _guess_mime(data: bytes) -> str:
    if data[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"


OCR_PROMPT = (
    "You are an OCR assistant for a children's learning app in Nepal. Read the "
    "attached textbook page images carefully. They may contain Devanagari / "
    "Nepali text. Transcribe ALL the educational content into clean plain text, "
    "preserving the original order, headings, lists, and any worked examples. "
    "Do NOT summarise or add commentary — return only the transcribed text."
)


def extract_book_text(image_bytes: list[bytes] | None) -> str:
    """OCR the uploaded pages into plain text for the voice tutor's knowledge.

    Returns an empty string when no key/images are available or on any error;
    callers fall back to building context from the generated questions.
    """
    if not settings.GEMINI_API_KEY or not image_bytes:
        return ""

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        contents: list = [OCR_PROMPT]
        for img in image_bytes[:10]:
            contents.append(
                types.Part.from_bytes(data=img, mime_type=_guess_mime(img))
            )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(temperature=0.0),
        )
        return (response.text or "").strip()[:8000]
    except Exception as exc:  # pragma: no cover - network/SDK errors
        print(f"[ai] Gemini OCR failed: {exc}")
        return ""


def generate_questions(
    subject: str,
    age: int,
    grade: int,
    image_bytes: list[bytes] | None = None,
) -> list[dict]:
    """Return up to 15 validated mixed-type questions. Never raises."""
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
                temperature=0.5,
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


def _normalize(s: str) -> str:
    return "".join(c for c in s.lower().strip() if c.isalnum() or c.isspace())


def _fallback_grade(
    expected: str, accept: list[str] | None, transcript: str
) -> tuple[bool, str]:
    t = _normalize(transcript)
    candidates = [expected] + (accept or [])
    for c in candidates:
        cn = _normalize(c)
        if cn and (cn in t or t in cn):
            return True, "Great job! That's right!"
    return False, f"Good try! The answer was \"{expected}\"."


def grade_spoken_answer(
    question: str,
    expected: str,
    accept: list[str] | None,
    transcript: str,
) -> tuple[bool, str]:
    """Decide whether a child's spoken (transcribed) answer is correct.

    Uses Gemini for lenient grading (tolerates pronunciation, spelling, extra
    words, English/Nepali) and falls back to fuzzy string matching offline.
    Returns (correct, short_feedback). Never raises.
    """
    if not transcript.strip():
        return False, "I didn't catch that. Try speaking again!"

    if not settings.GEMINI_API_KEY:
        return _fallback_grade(expected, accept, transcript)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = (
            "You grade a young child's spoken answer in a learning game. Be "
            "encouraging and lenient about spelling, pronunciation, extra "
            "words, and language (English or Nepali / Devanagari).\n"
            f"Question: {question}\n"
            f"Correct answer: {expected}\n"
            f"Also acceptable: {', '.join(accept) if accept else '(none)'}\n"
            f"The child said (speech-to-text, may have errors): {transcript}\n"
            'Return STRICT JSON only: {"correct": true or false, '
            '"feedback": "one short, warm sentence for the child"}'
        )
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
        data = json.loads((response.text or "").strip())
        correct = bool(data.get("correct"))
        feedback = str(data.get("feedback") or "").strip()
        if not feedback:
            feedback = (
                "Great job!" if correct else f'The answer was "{expected}".'
            )
        return correct, feedback
    except Exception as exc:  # pragma: no cover - network/SDK errors
        print(f"[ai] spoken grading failed, using fallback: {exc}")
        return _fallback_grade(expected, accept, transcript)
