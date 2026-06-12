"""In-memory data store seeded for instant demo readiness.

Keeps the whole app functional without external dependencies. Swappable
for Postgres/Supabase later by replacing the repository methods.
"""

from __future__ import annotations

import threading
import time
import uuid

from .data.questions import SUBJECT_BANK

_lock = threading.RLock()


def uid() -> str:
    return uuid.uuid4().hex[:10]


def now_ms() -> int:
    return int(time.time() * 1000)


def gen_code() -> str:
    import random

    return str(random.randint(100000, 999999))


def _build_levels(pack_id: str, questions: list[dict], per_level: int, count: int):
    levels = []
    for i in range(count):
        chunk = questions[i * per_level : i * per_level + per_level]
        levels.append(
            {
                "id": f"{pack_id}-L{i + 1}",
                "sequence_no": i + 1,
                "question_ids": [q["id"] for q in chunk],
            }
        )
    return levels


def _default_pack(subject, title, title_np, questions):
    pack_id = f"default-{subject}"
    return {
        "id": pack_id,
        "title": title,
        "title_np": title_np,
        "subject": subject,
        "type": "default",
        "status": "ready",
        "grade": 2,
        "created_by": None,
        "questions": questions,
        "levels": _build_levels(pack_id, questions, 5, 5),
    }


class Store:
    def __init__(self) -> None:
        self.parents: dict[str, dict] = {}
        self.passwords: dict[str, str] = {}  # parent_id -> password (demo only)
        self.tokens: dict[str, str] = {}  # token -> parent_id
        self.children: dict[str, dict] = {}
        self.packs: dict[str, dict] = {}
        self.battles: dict[str, dict] = {}
        self._seed()

    # ---------- seeding ----------
    def _seed(self) -> None:
        self.packs["default-math"] = _default_pack(
            "math", "Math Adventure", "गणित यात्रा", SUBJECT_BANK["math"]
        )
        self.packs["default-nepali"] = _default_pack(
            "nepali", "Nepali Words", "नेपाली शब्द", SUBJECT_BANK["nepali"]
        )
        self.packs["default-science"] = _default_pack(
            "science", "Science Explorer", "विज्ञान खोज", SUBJECT_BANK["science"]
        )

        parent_id = "parent-1"
        self.parents[parent_id] = {
            "id": parent_id,
            "name": "Sita Sharma",
            "email": "demo@nanigo.app",
        }
        self.passwords[parent_id] = "demo1234"

        self.children["child-1"] = {
            "id": "child-1",
            "parent_id": parent_id,
            "name": "Aarav",
            "age": 7,
            "grade": 2,
            "avatar": "tiger",
            "child_code": "482913",
            "total_xp": 1240,
            "streak_days": 5,
            "hearts": 3,
            "hearts_refill_at": None,
            "accuracy": 86,
            "time_today_min": 24,
            "weekly_xp": [120, 80, 160, 200, 140, 260, 280],
            "completed_levels": {"default-math": 3, "default-nepali": 1},
            "activity": [
                {"id": "a1", "text": "Completed Level 3 - Math Adventure", "stars": 3, "at": now_ms() - 3_600_000},
                {"id": "a2", "text": "Completed Level 1 - Nepali Words", "stars": 2, "at": now_ms() - 7_200_000},
            ],
        }
        self.children["child-2"] = {
            "id": "child-2",
            "parent_id": parent_id,
            "name": "Diya",
            "age": 9,
            "grade": 4,
            "avatar": "peacock",
            "child_code": "305178",
            "total_xp": 2050,
            "streak_days": 12,
            "hearts": 2,
            "hearts_refill_at": None,
            "accuracy": 91,
            "time_today_min": 38,
            "weekly_xp": [200, 240, 180, 320, 280, 300, 360],
            "completed_levels": {"default-math": 5, "default-science": 2},
            "activity": [
                {"id": "b1", "text": "Completed Level 5 - Math Adventure", "stars": 3, "at": now_ms() - 1_800_000},
                {"id": "b2", "text": "Completed Level 2 - Science Explorer", "stars": 3, "at": now_ms() - 9_000_000},
            ],
        }

    # ---------- helpers ----------
    @property
    def lock(self):
        return _lock

    def child_by_code(self, code: str):
        for c in self.children.values():
            if c["child_code"] == code.strip():
                return c
        return None


store = Store()
