import threading
import time

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from ..ai import generate_questions
from ..deps import get_current_parent
from ..models import QuestionPack, SubjectId, UploadResponse
from ..store import store, uid

router = APIRouter(prefix="/uploads", tags=["uploads"])

SUBJECT_TITLES: dict[str, tuple[str, str]] = {
    "math": ("My Book - Math", "मेरो किताब - गणित"),
    "nepali": ("My Book - Nepali", "मेरो किताब - नेपाली"),
    "science": ("My Book - Science", "मेरो किताब - विज्ञान"),
    "english": ("My Book - English", "मेरो किताब - अंग्रेजी"),
}


def _run_pipeline(pack_id: str, subject: str, age: int, grade: int, images: list[bytes]):
    """Background worker: generate, validate, split into 3 levels of 5."""
    # Brief delay so the UI can show its animated 3-step progress state.
    time.sleep(2.0)
    try:
        raw = generate_questions(subject, age, grade, images)
        questions = []
        for i, q in enumerate(raw[:15]):
            questions.append({**q, "id": f"{pack_id}-q{i}"})
        levels = []
        for i in range(3):
            chunk = questions[i * 5 : i * 5 + 5]
            levels.append(
                {
                    "id": f"{pack_id}-L{i + 1}",
                    "sequence_no": i + 1,
                    "question_ids": [q["id"] for q in chunk],
                }
            )
        with store.lock:
            pack = store.packs.get(pack_id)
            if pack:
                pack["questions"] = questions
                pack["levels"] = levels
                pack["status"] = "ready" if questions else "failed"
    except Exception:
        with store.lock:
            pack = store.packs.get(pack_id)
            if pack:
                pack["status"] = "failed"


@router.post("", response_model=UploadResponse)
async def upload_book(
    child_id: str = Form(...),
    subject: SubjectId = Form(...),
    files: list[UploadFile] = File(default=[]),
    parent: dict = Depends(get_current_parent),
):
    child = store.children.get(child_id)
    if not child or child["parent_id"] != parent["id"]:
        raise HTTPException(status_code=403, detail="Not your child")

    images: list[bytes] = []
    for f in files[:6]:
        images.append(await f.read())

    pack_id = f"pers-{uid()}"
    title, title_np = SUBJECT_TITLES.get(subject, SUBJECT_TITLES["math"])
    with store.lock:
        store.packs[pack_id] = {
            "id": pack_id,
            "title": title,
            "title_np": title_np,
            "subject": subject,
            "type": "personalized",
            "status": "generating",
            "grade": child["grade"],
            "created_by": parent["name"].split(" ")[0],
            "questions": [],
            "levels": [],
        }

    threading.Thread(
        target=_run_pipeline,
        args=(pack_id, subject, child["age"], child["grade"], images),
        daemon=True,
    ).start()

    return UploadResponse(pack_id=pack_id, status="generating")


@router.post("/{pack_id}/retry", response_model=UploadResponse)
def retry_upload(pack_id: str, parent: dict = Depends(get_current_parent)):
    pack = store.packs.get(pack_id)
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    with store.lock:
        pack["status"] = "generating"
    # Re-run with no images (uses fallback bank for the subject).
    threading.Thread(
        target=_run_pipeline,
        args=(pack_id, pack["subject"], pack["grade"] + 5, pack["grade"], []),
        daemon=True,
    ).start()
    return UploadResponse(pack_id=pack_id, status="generating")
