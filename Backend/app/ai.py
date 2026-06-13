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
from .data.default_content import DEFAULT_BOOK_TEXT, DEFAULT_QUESTIONS

SYSTEM_PROMPT = (
    "You are an OCR and question-writing assistant for a children's learning "
    "app in Nepal. Read the attached textbook page images and/or book content "
    "carefully. They may contain Devanagari / Nepali text. Extract the "
    "educational content and generate exactly 16 fun questions for a {age}-"
    "year-old child in class {grade} studying {subject}. VOICE QUESTIONS ARE "
    "THE PRIORITY — use this mix:\n"
    "- 6 'speak' (the child hears the question and answers OUT LOUD with their "
    "voice; the answer should be a short word or phrase)\n"
    "- 4 'mcq' (multiple choice, 4 options)\n"
    "- 3 'match' (match-the-following with 3-4 pairs)\n"
    "- 3 'order' (put 3-4 items in the correct order)\n"
    "Keep language simple and kid-friendly. Return STRICT JSON only:\n"
    '{{"questions": [\n'
    '  {{"kind":"speak","text":"Say the answer out loud: what is 2 plus 2?",'
    '"answer":"four","accept":["4","four","char"],"explanation":"..."}},\n'
    '  {{"kind":"mcq","text":"...","options":["a","b","c","d"],'
    '"correct_index":0,"explanation":"..."}},\n'
    '  {{"kind":"match","text":"Match ...","pairs":[{{"left":"..","right":".."}}],'
    '"explanation":"..."}},\n'
    '  {{"kind":"order","text":"Put in order ...","sequence":["first","second","third"],'
    '"explanation":"..."}}\n'
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


QUESTION_KINDS = ["mcq", "match", "order", "speak"]

# Voice-led default mix: more 'speak' questions than the other kinds.
VOICE_HEAVY_COUNTS = {"speak": 6, "mcq": 4, "match": 3, "order": 3}


def balance_questions(
    questions: list[dict], per_kind: int | dict[str, int] = 3
) -> list[dict]:
    """Return a balanced mix of question kinds, interleaved for variety.

    ``per_kind`` may be a single int (same count for every kind) or a dict
    mapping each kind to its own count — used to make voice ('speak')
    questions more frequent than the rest. Kinds with fewer questions
    available simply contribute what they have.
    """
    counts = (
        {k: per_kind for k in QUESTION_KINDS}
        if isinstance(per_kind, int)
        else {k: per_kind.get(k, 0) for k in QUESTION_KINDS}
    )
    buckets = {k: [q for q in questions if q.get("kind") == k] for k in QUESTION_KINDS}
    picked = {k: buckets[k][: counts[k]] for k in QUESTION_KINDS}
    max_n = max((len(v) for v in picked.values()), default=0)
    ordered: list[dict] = []
    # Lead with a speak question, then round-robin the rest for variety.
    for i in range(max_n):
        for k in ("speak", "mcq", "match", "order"):
            if i < len(picked[k]):
                ordered.append(picked[k][i])
    return ordered


def _fallback_questions(
    subject: str, age: int, grade: int, use_default: bool = False
) -> list[dict]:
    """Voice-heavy offline fallback.

    When nothing was uploaded (``use_default``) the bank is the markdown-based
    default content; otherwise it uses the subject seed bank. IDs are stripped
    so the caller can assign fresh ones.
    """
    bank = (
        DEFAULT_QUESTIONS
        if use_default
        else SUBJECT_PACK_MIXED.get(subject, SUBJECT_PACK_MIXED["math"])
    )
    stripped = [{k: v for k, v in q.items() if k != "id"} for q in bank]
    return balance_questions(stripped, per_kind=VOICE_HEAVY_COUNTS)


def derive_lesson(questions: list[dict]) -> list[dict]:
    """Build interactive lesson steps from a level's questions (offline fallback).

    Teaches each concept first, then mixes in a quick "tap" check (reusing mcq
    options) so the lesson feels interactive like Duolingo/SoloLearn.
    """
    steps: list[dict] = []
    for q in questions:
        kind = q.get("kind", "mcq")
        text = q.get("text", "")
        exp = q.get("explanation", "")
        if kind == "mcq":
            opts = q.get("options") or []
            ci = q.get("correct_index", 0)
            ans = opts[ci] if 0 <= ci < len(opts) else ""
            steps.append(
                {
                    "kind": "teach",
                    "title": "Let's learn",
                    "body": f"{text}\nThe answer is: {ans}." + (f"\n{exp}" if exp else ""),
                }
            )
            if len(opts) >= 2:
                steps.append(
                    {
                        "kind": "tap",
                        "title": "Quick check",
                        "question": text,
                        "options": opts,
                        "correct_index": ci,
                        "explanation": exp,
                    }
                )
        elif kind == "match":
            pairs = q.get("pairs") or []
            lines = "\n".join(f"{p['left']}  -  {p['right']}" for p in pairs)
            steps.append(
                {
                    "kind": "teach",
                    "title": "Let's learn",
                    "body": f"{text}\n{lines}" + (f"\n{exp}" if exp else ""),
                }
            )
        elif kind == "order":
            seq = q.get("sequence") or []
            steps.append(
                {
                    "kind": "teach",
                    "title": "Let's learn",
                    "body": f"{text}\nCorrect order: " + " -> ".join(seq)
                    + (f"\n{exp}" if exp else ""),
                }
            )
        elif kind == "speak":
            steps.append(
                {
                    "kind": "teach",
                    "title": "Let's learn",
                    "body": f"{text}\nThe answer is: {q.get('answer', '')}."
                    + (f"\n{exp}" if exp else ""),
                }
            )
        else:
            steps.append({"kind": "teach", "title": "Let's learn", "body": text})
    return steps


LESSON_PROMPT = (
    "You are a friendly, fun teacher for a {age}-year-old child in class "
    "{grade} studying {subject}. The child will be quizzed on the topics below, "
    "but FIRST you must teach them interactively, like Duolingo or SoloLearn — "
    "short, simple, and encouraging. For EACH topic group (in order), create 3 "
    "to 4 lesson steps that MIX two kinds:\n"
    '- "teach": a short fun title and a body of 1-3 very simple sentences '
    "(you may include a tiny example).\n"
    '- "tap": a quick interactive check with a short question, 3 short options, '
    "the index of the correct option, and a one-line explanation.\n"
    "Start each group with a teach step, then alternate with at least one tap "
    "check. Teach the idea so the child can then answer — base it ONLY on the "
    "topics/book content given. Do NOT use emojis. Return STRICT JSON only:\n"
    '{{"lessons": [ [ '
    '{{"kind":"teach","title":"..","body":".."}}, '
    '{{"kind":"tap","question":"..","options":["a","b","c"],"correct_index":0,'
    '"explanation":".."}} '
    "] ]}}\n"
    "with exactly one inner list per topic group, in the same order."
)


def _topic_lines(questions: list[dict]) -> str:
    out = []
    for q in questions:
        out.append(f"- ({q.get('kind', 'mcq')}) {q.get('text', '')}")
    return "\n".join(out)


def _clean_step(c: dict) -> dict | None:
    if not isinstance(c, dict):
        return None
    kind = c.get("kind", "teach")
    if kind == "tap":
        opts = c.get("options")
        ci = c.get("correct_index")
        if (
            isinstance(c.get("question"), str)
            and isinstance(opts, list)
            and 2 <= len(opts) <= 4
            and isinstance(ci, int)
            and 0 <= ci < len(opts)
        ):
            return {
                "kind": "tap",
                "title": str(c.get("title") or "Quick check"),
                "body": "",
                "question": c["question"],
                "options": [str(o) for o in opts],
                "correct_index": ci,
                "explanation": str(c.get("explanation") or ""),
            }
        return None
    if c.get("title") and c.get("body"):
        return {
            "kind": "teach",
            "title": str(c["title"]),
            "body": str(c["body"]),
        }
    return None


def generate_lessons(
    subject: str,
    age: int,
    grade: int,
    levels_questions: list[list[dict]],
    book_text: str = "",
) -> list[list[dict]]:
    """Return an interactive lesson (list of steps) for each level. Never raises.

    Uses Gemini when available, grounded in the book text + each level's topics;
    falls back to deriving steps directly from the questions.
    """
    if not settings.GEMINI_API_KEY:
        return [derive_lesson(qs) for qs in levels_questions]

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        groups = "\n\n".join(
            f"Topic group {i + 1}:\n{_topic_lines(qs)}"
            for i, qs in enumerate(levels_questions)
        )
        prompt = LESSON_PROMPT.format(age=age, grade=grade, subject=subject)
        if book_text.strip():
            prompt += f"\n\n=== BOOK CONTENT ===\n{book_text[:4000]}\n=== END ==="
        prompt += f"\n\n=== TOPIC GROUPS ===\n{groups}"

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.5,
            ),
        )
        data = json.loads((response.text or "").strip())
        lessons = data.get("lessons")
        if isinstance(lessons, list) and len(lessons) == len(levels_questions):
            cleaned: list[list[dict]] = []
            for i, lesson in enumerate(lessons):
                steps = []
                if isinstance(lesson, list):
                    for c in lesson[:5]:
                        s = _clean_step(c)
                        if s:
                            steps.append(s)
                cleaned.append(steps or derive_lesson(levels_questions[i]))
            return cleaned
    except Exception as exc:  # pragma: no cover - network/SDK errors
        print(f"[ai] lesson generation failed, using fallback: {exc}")

    return [derive_lesson(qs) for qs in levels_questions]


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
    book_text: str | None = None,
) -> list[dict]:
    """Return a balanced, voice-heavy mix of validated questions. Never raises.

    When no pages are uploaded, generation is grounded in the default markdown
    content (``DEFAULT_BOOK_TEXT``) so the experience works out of the box.
    """
    has_images = bool(image_bytes)
    # No upload → fall back to the default markdown content as the source.
    grounding = (book_text or "").strip()
    use_default = not has_images and not grounding
    if use_default:
        grounding = DEFAULT_BOOK_TEXT

    if not settings.GEMINI_API_KEY:
        return _fallback_questions(subject, age, grade, use_default=use_default)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        prompt = SYSTEM_PROMPT.format(age=age, grade=grade, subject=subject)
        if grounding:
            prompt += f"\n\n=== BOOK CONTENT ===\n{grounding[:6000]}\n=== END ==="
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
        balanced = balance_questions(valid, per_kind=VOICE_HEAVY_COUNTS)
        if balanced:
            return balanced
    except Exception as exc:  # pragma: no cover - network/SDK errors
        print(f"[ai] Gemini generation failed, using fallback: {exc}")

    return _fallback_questions(subject, age, grade, use_default=use_default)


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
