from fastapi import APIRouter, Depends, HTTPException

from ..deps import get_current_parent
from ..models import (
    Attempt,
    AttemptCreate,
    Child,
    ChildCreate,
    LevelAttempt,
    LevelResult,
)
from ..store import gen_code, now_ms, store, uid

router = APIRouter(tags=["children"])


def _owned_child(child_id: str, parent_id: str) -> dict:
    child = store.children.get(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    if child["parent_id"] != parent_id:
        raise HTTPException(status_code=403, detail="Not your child")
    return child


# ---------- Parent-scoped ----------
@router.get("/children", response_model=list[Child])
def list_children(parent: dict = Depends(get_current_parent)):
    return [
        Child(**c)
        for c in store.children.values()
        if c["parent_id"] == parent["id"]
    ]


@router.post("/children", response_model=Child, status_code=201)
def add_child(body: ChildCreate, parent: dict = Depends(get_current_parent)):
    with store.lock:
        child = {
            "id": uid(),
            "parent_id": parent["id"],
            "name": body.name,
            "age": body.age,
            "grade": body.grade,
            "avatar": body.avatar,
            "child_code": gen_code(),
            "total_xp": 0,
            "streak_days": 0,
            "hearts": 3,
            "hearts_refill_at": None,
            "accuracy": 0,
            "time_today_min": 0,
            "weekly_xp": [0, 0, 0, 0, 0, 0, 0],
            "completed_levels": {},
            "activity": [],
        }
        store.save_child(child)
    return Child(**child)


@router.post("/children/{child_id}/regenerate-code", response_model=Child)
def regenerate_code(child_id: str, parent: dict = Depends(get_current_parent)):
    child = _owned_child(child_id, parent["id"])
    with store.lock:
        child["child_code"] = gen_code()
        store.save_child(child)
    return Child(**child)


# ---------- Kid session (public, scoped by code) ----------
@router.post("/kid/login/{code}", response_model=Child)
def kid_login(code: str):
    child = store.child_by_code(code)
    if not child:
        raise HTTPException(status_code=404, detail="Invalid code")
    return Child(**child)


@router.get("/kid/{child_id}", response_model=Child)
def get_child(child_id: str):
    child = store.children.get(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return Child(**child)


# ---------- Gameplay ----------
@router.post("/kid/{child_id}/complete-level", response_model=LevelResult)
def complete_level(child_id: str, body: LevelAttempt):
    child = store.children.get(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    pack = store.packs.get(body.pack_id)
    accuracy = body.correct / body.total if body.total else 0
    stars = 3 if accuracy >= 0.9 else 2 if accuracy >= 0.6 else 1
    xp = body.correct * 10 + stars * 15
    with store.lock:
        prev = child["completed_levels"].get(body.pack_id, 0)
        child["completed_levels"][body.pack_id] = max(prev, body.sequence_no)
        child["total_xp"] += xp
        child["weekly_xp"][6] += xp
        child["accuracy"] = round((child["accuracy"] + accuracy * 100) / 2)
        child["activity"].insert(
            0,
            {
                "id": uid(),
                "text": f"Completed Level {body.sequence_no} - {pack['title'] if pack else 'Pack'}",
                "stars": stars,
                "at": now_ms(),
            },
        )
        child["activity"] = child["activity"][:8]
        store.save_child(child)
    return LevelResult(xp_earned=xp, stars=stars, total_xp=child["total_xp"])


@router.post("/kid/{child_id}/lose-heart", response_model=Child)
def lose_heart(child_id: str):
    from ..config import settings

    child = store.children.get(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    with store.lock:
        child["hearts"] = max(0, child["hearts"] - 1)
        if child["hearts"] == 0:
            child["hearts_refill_at"] = now_ms() + settings.HEART_REFILL_MINUTES * 60_000
        store.save_child(child)
    return Child(**child)


@router.post("/kid/{child_id}/refill-hearts", response_model=Child)
def refill_hearts(child_id: str):
    child = store.children.get(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    with store.lock:
        child["hearts"] = 3
        child["hearts_refill_at"] = None
        store.save_child(child)
    return Child(**child)


# ---------- Per-question attempt logging ----------
@router.post("/kid/{child_id}/attempt", response_model=Attempt)
def log_attempt(child_id: str, body: AttemptCreate):
    child = store.children.get(child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    pack = store.packs.get(body.pack_id)
    question = None
    if pack:
        question = next(
            (q for q in pack["questions"] if q["id"] == body.question_id), None
        )
    attempt = {
        "id": uid(),
        "child_id": child_id,
        "pack_id": body.pack_id,
        "pack_title": pack["title"] if pack else "Unknown",
        "subject": pack["subject"] if pack else "math",
        "question_id": body.question_id,
        "question_text": question["text"] if question else "",
        "kind": question.get("kind", "mcq") if question else "mcq",
        "correct": body.correct,
        "time_ms": body.time_ms,
        "selected": body.selected,
        "at": now_ms(),
    }
    store.add_attempt(attempt)
    return Attempt(**attempt)


@router.get("/children/{child_id}/attempts", response_model=list[Attempt])
def get_attempts(child_id: str, parent: dict = Depends(get_current_parent)):
    _owned_child(child_id, parent["id"])
    attempts = store.attempts_for_child(child_id)
    # newest first
    return [Attempt(**a) for a in sorted(attempts, key=lambda a: a["at"], reverse=True)]
