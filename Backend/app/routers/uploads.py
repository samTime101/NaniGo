import threading

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from ..ai import generate_questions
from ..deps import get_current_parent
from ..models import QuestionPack, SubjectId, UploadResponse
from ..store import now_ms, store, uid

router = APIRouter(prefix="/uploads", tags=["uploads"])

SUBJECT_TITLES: dict[str, tuple[str, str]] = {
    "math": ("My Book - Math", "मेरो किताब - गणित"),
    "nepali": ("My Book - Nepali", "मेरो किताब - नेपाली"),
    "science": ("My Book - Science", "मेरो किताब - विज्ञान"),
    "english": ("My Book - English", "मेरो किताब - अंग्रेजी"),
}


def _run_pipeline(pack_id: str, subject: str, age: int, grade: int, images: list[bytes]):
    """Background worker: generate, validate, split into 3 levels of 5."""
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
                store.save_pack(pack)
    except Exception:
        with store.lock:
            pack = store.packs.get(pack_id)
            if pack:
                pack["status"] = "failed"
                store.save_pack(pack)


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

    # Read all uploaded pages (multiple images -> one question bank).
    images: list[bytes] = []
    for f in files[:10]:
        images.append(await f.read())

    pack_id = f"pers-{uid()}"
    title, title_np = SUBJECT_TITLES.get(subject, SUBJECT_TITLES["math"])
    with store.lock:
        store.save_pack(
            {
                "id": pack_id,
                "title": title,
                "title_np": title_np,
                "subject": subject,
                "type": "personalized",
                "status": "generating",
                "grade": child["grade"],
                "created_by": parent["name"].split(" ")[0],
                "child_id": child_id,
                "created_at": now_ms(),
                "page_count": len(images),
                "questions": [],
                "levels": [],
            }
        )

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
        store.save_pack(pack)
    # Re-run with no images (uses fallback bank for the subject).
    threading.Thread(
        target=_run_pipeline,
        args=(pack_id, pack["subject"], pack["grade"] + 5, pack["grade"], []),
        daemon=True,
    ).start()
    return UploadResponse(pack_id=pack_id, status="generating")
