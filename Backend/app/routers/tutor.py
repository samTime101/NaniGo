"""Voice tutor endpoints backed by ElevenLabs Conversational AI.

The kid taps "Ask Nani" inside a book/pack and talks to a voice agent that is
grounded in that book's content (a lightweight RAG approach):

1. The backend OCR's the uploaded pages into ``pack.source_text`` (see uploads).
2. Here we build a system prompt + first message from that text (plus the
   generated questions as a fallback) and hand them to the frontend.
3. The frontend starts an ElevenLabs session and passes them as conversation
   *overrides*, so a single shared agent is personalised per book.

The ElevenLabs API key never leaves the server — we only return a short-lived
signed URL for the WebRTC/WebSocket connection.

Requires, in the ElevenLabs agent's Security settings, that overrides are
enabled for "System prompt" and "First message".
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request

from fastapi import APIRouter, HTTPException

from ..config import settings
from ..store import store

router = APIRouter(prefix="/tutor", tags=["tutor"])

_SIGNED_URL_ENDPOINT = (
    "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"
)

# Keep the override prompt well within ElevenLabs limits.
_MAX_CONTEXT_CHARS = 6000


def _enabled() -> bool:
    return bool(settings.ELEVENLABS_API_KEY and settings.ELEVENLABS_AGENT_ID)


def _context_from_questions(pack: dict) -> str:
    """Fallback knowledge when OCR text is unavailable (e.g. offline demo)."""
    lines: list[str] = []
    for q in pack.get("questions", []):
        text = q.get("text", "")
        if q.get("kind") == "mcq":
            opts = q.get("options") or []
            ci = q.get("correct_index", 0)
            answer = opts[ci] if 0 <= ci < len(opts) else ""
            lines.append(f"Q: {text} A: {answer}")
        elif q.get("kind") == "match":
            pairs = ", ".join(
                f"{p.get('left')} = {p.get('right')}"
                for p in (q.get("pairs") or [])
            )
            lines.append(f"{text}: {pairs}")
        elif q.get("kind") == "order":
            seq = " -> ".join(q.get("sequence") or [])
            lines.append(f"{text}: {seq}")
        exp = q.get("explanation")
        if exp:
            lines.append(f"   ({exp})")
    return "\n".join(lines)


def _build_prompt(pack: dict, child: dict | None) -> tuple[str, str]:
    """Return (system_prompt, first_message) grounded in the book content."""
    knowledge = (pack.get("source_text") or "").strip()
    if not knowledge:
        knowledge = _context_from_questions(pack)
    knowledge = knowledge[:_MAX_CONTEXT_CHARS]

    name = (child or {}).get("name", "friend")
    grade = (child or {}).get("grade", pack.get("grade", 2))
    age = (child or {}).get("age", 7)
    subject = pack.get("subject", "this subject")
    title = pack.get("title", "your book")

    system_prompt = (
        f"You are Nani, a warm, patient, and playful voice tutor for children "
        f"in Nepal. You are helping {name}, a {age}-year-old in class {grade}, "
        f"learn from their book \"{title}\" ({subject}).\n\n"
        "RULES:\n"
        "- Speak in short, simple, encouraging sentences a young child "
        "understands. One idea at a time.\n"
        "- You may reply in English or Nepali, matching the language the child "
        "uses. Keep Nepali simple.\n"
        "- ONLY answer using the book content below. If the answer is not in "
        "the book, gently say you can only help with this book and steer back "
        "to it.\n"
        "- Never give away quiz answers directly — instead give a hint and ask "
        "a guiding question so the child figures it out.\n"
        "- Be cheerful and celebrate effort.\n\n"
        "=== BOOK CONTENT ===\n"
        f"{knowledge}\n"
        "=== END BOOK CONTENT ==="
    )

    first_message = (
        f"Namaste {name}! I'm Nani. I just read your book about {subject}. "
        "Ask me anything about it!"
    )
    return system_prompt, first_message


def _build_general_prompt(child: dict | None) -> tuple[str, str]:
    """Prompt for the always-on tutor when the child isn't inside a book."""
    name = (child or {}).get("name", "friend")
    grade = (child or {}).get("grade", 2)
    age = (child or {}).get("age", 7)

    system_prompt = (
        f"You are Nani, a warm, patient, and playful voice tutor for children "
        f"in Nepal. You are helping {name}, a {age}-year-old in class {grade}. "
        "Help with school subjects like math, science, Nepali, and English.\n\n"
        "RULES:\n"
        "- Speak in short, simple, encouraging sentences a young child "
        "understands. One idea at a time.\n"
        "- You may reply in English or Nepali, matching the language the child "
        "uses. Keep Nepali simple.\n"
        "- Keep topics age-appropriate and school-related. Gently steer back if "
        "the child drifts off-topic.\n"
        "- Encourage curiosity: give hints and ask guiding questions instead of "
        "just handing over answers.\n"
        "- Be cheerful and celebrate effort."
    )
    first_message = (
        f"Namaste {name}! I'm Nani, your study buddy. What shall we learn today?"
    )
    return system_prompt, first_message


def _signed_url() -> str:
    req = urllib.request.Request(
        f"{_SIGNED_URL_ENDPOINT}?agent_id={settings.ELEVENLABS_AGENT_ID}",
        headers={"xi-api-key": settings.ELEVENLABS_API_KEY},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:  # pragma: no cover - network
        detail = exc.read().decode("utf-8", "ignore")
        raise HTTPException(
            status_code=502,
            detail=f"ElevenLabs signed URL request failed ({exc.code}): {detail}",
        )
    except Exception as exc:  # pragma: no cover - network
        raise HTTPException(
            status_code=502, detail=f"ElevenLabs unreachable: {exc}"
        )

    url = body.get("signed_url")
    if not url:
        raise HTTPException(status_code=502, detail="No signed_url in response")
    return url


@router.get("/config")
def tutor_config():
    """Tell the frontend whether the voice tutor is available."""
    return {"enabled": _enabled(), "agent_id": settings.ELEVENLABS_AGENT_ID}


@router.get("/session")
def tutor_general_session(child_id: str | None = None):
    """Mint a session for the always-on tutor (no specific book)."""
    if not _enabled():
        raise HTTPException(status_code=503, detail="Voice tutor not configured")

    child = store.children.get(child_id) if child_id else None
    system_prompt, first_message = _build_general_prompt(child)

    return {
        "signed_url": _signed_url(),
        "agent_id": settings.ELEVENLABS_AGENT_ID,
        "system_prompt": system_prompt,
        "first_message": first_message,
    }


@router.get("/{pack_id}/session")
def tutor_session(pack_id: str, child_id: str | None = None):
    """Mint a signed URL + per-book override prompt for the voice tutor."""
    if not _enabled():
        raise HTTPException(status_code=503, detail="Voice tutor not configured")

    pack = store.packs.get(pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")

    child = store.children.get(child_id) if child_id else None
    system_prompt, first_message = _build_prompt(pack, child)

    return {
        "signed_url": _signed_url(),
        "agent_id": settings.ELEVENLABS_AGENT_ID,
        "system_prompt": system_prompt,
        "first_message": first_message,
    }
