from fastapi import APIRouter, HTTPException

from ..models import QuestionPack
from ..store import store

router = APIRouter(prefix="/packs", tags=["packs"])


@router.get("", response_model=list[QuestionPack])
def list_packs(type: str | None = None, subject: str | None = None):
    packs = list(store.packs.values())
    if type:
        packs = [p for p in packs if p["type"] == type]
    if subject:
        packs = [p for p in packs if p["subject"] == subject]
    return [QuestionPack(**p) for p in packs]


@router.get("/{pack_id}", response_model=QuestionPack)
def get_pack(pack_id: str):
    pack = store.packs.get(pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    return QuestionPack(**pack)
