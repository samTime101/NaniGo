"""Voice tutor endpoints backed by ElevenLabs Conversational AI.

The child taps "Ask Nani" and talks to a voice agent grounded in ALL of their
learning content (a lightweight RAG approach) — no need to pick a topic first:

1. Uploaded pages are OCR'd into ``pack.source_text`` (see uploads).
2. Here we combine the text (plus question-derived facts) from every book the
   child has, build a system prompt + first message, and hand them to the
   frontend.
3. The frontend starts an ElevenLabs session and passes them as conversation
   *overrides*, so a single shared agent is personalised per child.

Language: when the child switches the app to Nepali, the tutor replies in
Nepali (Devanagari) using the warm "Jessica" voice. Nepali isn't a supported
conversational language on ElevenLabs, so the speech pipeline uses Hindi (same
script), which reads Devanagari Nepali text intelligibly.

The ElevenLabs API key never leaves the server — we only return a short-lived
signed URL for the connection.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request

from fastapi import APIRouter, HTTPException

from ..config import settings
from ..store import store

router = APIRouter(prefix="/tutor", tags=["tutor"])

_TOKEN_ENDPOINT = "https://api.elevenlabs.io/v1/convai/conversation/token"

# Keep the override prompt well within ElevenLabs limits.
_MAX_CONTEXT_CHARS = 7000


def _enabled() -> bool:
    return bool(settings.ELEVENLABS_API_KEY and settings.ELEVENLABS_AGENT_ID)


def _is_nepali(lang: str | None) -> bool:
    return (lang or "").lower() in {"np", "ne", "nepali"}


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
        elif q.get("kind") == "speak":
            lines.append(f"{text}: {q.get('answer', '')}")
        exp = q.get("explanation")
        if exp:
            lines.append(f"   ({exp})")
    return "\n".join(lines)


def _all_context(child_id: str | None) -> str:
    """Combine knowledge from every book the child can learn from."""
    parts: list[str] = []
    for pack in store.packs.values():
        # Include shared default packs + this child's personalised packs.
        if pack.get("type") == "personalized" and child_id:
            if pack.get("child_id") not in (None, child_id):
                continue
        text = (pack.get("source_text") or "").strip() or _context_from_questions(pack)
        if text.strip():
            parts.append(f"## {pack.get('title', 'Book')} ({pack.get('subject', '')})\n{text}")
    return "\n\n".join(parts)[:_MAX_CONTEXT_CHARS]


def _build_session(context: str, child: dict | None, lang: str | None) -> dict:
    """Build the full session payload (prompt, first message, voice, language)."""
    name = (child or {}).get("name", "friend")
    grade = (child or {}).get("grade", 2)
    age = (child or {}).get("age", 7)
    nepali = _is_nepali(lang)

    base_rules = (
        "- Speak in short, simple, encouraging sentences a young child "
        "understands. One idea at a time.\n"
        "- Use ONLY the learning content below to answer. If something isn't "
        "there, gently say you can only help with their lessons and steer back.\n"
        "- Never give away quiz answers directly — give a hint and ask a "
        "guiding question so the child figures it out.\n"
        "- Be cheerful and celebrate effort.\n"
    )

    if nepali:
        lang_rule = (
            "- ALWAYS reply in simple, warm Nepali written in Devanagari script "
            "(देवनागरी). Keep sentences short and easy for a small child.\n"
        )
        first_message = (
            f"नमस्ते {name}! म नानी हुँ। तिम्रा पाठहरूको बारेमा जे पनि सोध्नुहोस्!"
        )
        voice_id = settings.ELEVENLABS_NEPALI_VOICE_ID
        language = settings.ELEVENLABS_NEPALI_LANG_CODE  # "hi" (Devanagari pipeline)
    else:
        lang_rule = (
            "- Reply in English by default; if the child speaks Nepali, you may "
            "reply in simple Nepali.\n"
        )
        first_message = (
            f"Namaste {name}! I'm Nani, your study buddy. "
            "Ask me anything about your lessons!"
        )
        voice_id = None
        language = "en"

    system_prompt = (
        f"You are Nani, a warm, patient, and playful voice tutor for children "
        f"in Nepal. You are helping {name}, a {age}-year-old in class {grade}, "
        f"learn from their books.\n\n"
        "RULES:\n"
        f"{lang_rule}{base_rules}\n"
        "=== LEARNING CONTENT ===\n"
        f"{context or '(no books yet — encourage the child and offer general help)'}\n"
        "=== END LEARNING CONTENT ==="
    )

    return {
        "conversation_token": _conversation_token(),
        "agent_id": settings.ELEVENLABS_AGENT_ID,
        "system_prompt": system_prompt,
        "first_message": first_message,
        "voice_id": voice_id,
        "language": language,
    }


def _conversation_token() -> str:
    """Mint a WebRTC conversation token (voice path — reliable mic capture)."""
    req = urllib.request.Request(
        f"{_TOKEN_ENDPOINT}?agent_id={settings.ELEVENLABS_AGENT_ID}",
        headers={"xi-api-key": settings.ELEVENLABS_API_KEY},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:  # pragma: no cover - network
        detail = exc.read().decode("utf-8", "ignore")
        raise HTTPException(
            status_code=502,
            detail=f"ElevenLabs token request failed ({exc.code}): {detail}",
        )
    except Exception as exc:  # pragma: no cover - network
        raise HTTPException(status_code=502, detail=f"ElevenLabs unreachable: {exc}")

    token = body.get("token")
    if not token:
        raise HTTPException(status_code=502, detail="No token in response")
    return token


@router.get("/config")
def tutor_config():
    """Tell the frontend whether the voice tutor is available."""
    return {"enabled": _enabled(), "agent_id": settings.ELEVENLABS_AGENT_ID}


@router.get("/session")
def tutor_session(child_id: str | None = None, lang: str | None = None):
    """Mint a session grounded in ALL of the child's books (no topic picking)."""
    if not _enabled():
        raise HTTPException(status_code=503, detail="Voice tutor not configured")

    if child_id:
        child = store.children.get(child_id)
        if child:
            parent = store.parents.get(child["parent_id"])
            if parent and parent.get("subscription_tier") != "pro":
                raise HTTPException(status_code=403, detail="Voice Tutor requires Pro subscription")
    else:
        raise HTTPException(status_code=403, detail="Voice Tutor requires Pro subscription")

    child = store.children.get(child_id) if child_id else None
    context = _all_context(child_id)
    return _build_session(context, child, lang)


@router.get("/{pack_id}/session")
def tutor_pack_session(
    pack_id: str, child_id: str | None = None, lang: str | None = None
):
    """Mint a session grounded in a single book (kept for completeness)."""
    if not _enabled():
        raise HTTPException(status_code=503, detail="Voice tutor not configured")
        
    if child_id:
        child = store.children.get(child_id)
        if child:
            parent = store.parents.get(child["parent_id"])
            if parent and parent.get("subscription_tier") != "pro":
                raise HTTPException(status_code=403, detail="Voice Tutor requires Pro subscription")
    else:
        raise HTTPException(status_code=403, detail="Voice Tutor requires Pro subscription")

    pack = store.packs.get(pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")

    child = store.children.get(child_id) if child_id else None
    context = (pack.get("source_text") or "").strip() or _context_from_questions(pack)
    return _build_session(context[:_MAX_CONTEXT_CHARS], child, lang)
