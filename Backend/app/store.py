"""SQLite-backed data store with an in-memory write-through cache.

Entities are persisted as JSON blobs (one row per entity), which keeps the
schema trivial while matching the dict-based model used across the routers.
The in-memory cache is loaded at startup so reads stay fast and the existing
in-place mutation pattern keeps working; callers persist changes by calling
the `save_*` helpers.

Battles are intentionally kept in memory only — they are ephemeral.
"""

from __future__ import annotations

import json
import sqlite3
import threading
import time
import uuid

from .config import settings
from .data.questions import PUZZLE_QUESTIONS, SUBJECT_PACK_MIXED

_lock = threading.RLock()


def uid() -> str:
    return uuid.uuid4().hex[:10]


def now_ms() -> int:
    return int(time.time() * 1000)


def gen_code() -> str:
    import random

    return str(random.randint(100000, 999999))


def _build_levels(pack_id: str, questions: list[dict], per_level: int, count: int):
    from .ai import derive_lesson

    levels = []
    for i in range(count):
        chunk = questions[i * per_level : i * per_level + per_level]
        levels.append(
            {
                "id": f"{pack_id}-L{i + 1}",
                "sequence_no": i + 1,
                "question_ids": [q["id"] for q in chunk],
                "teach": derive_lesson(chunk),
            }
        )
    return levels


def _default_pack(subject, title, title_np, questions):
    pack_id = f"default-{subject}"
    levels = max(1, len(questions) // 5)
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
        "levels": _build_levels(pack_id, questions, 5, levels),
    }


class Store:
    def __init__(self, db_path: str | None = None) -> None:
        self.db_path = db_path or settings.DATABASE_PATH
        self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._init_schema()

        # in-memory caches
        self.parents: dict[str, dict] = {}
        self.passwords: dict[str, str] = {}
        self.tokens: dict[str, str] = {}
        self.children: dict[str, dict] = {}
        self.packs: dict[str, dict] = {}
        self.attempts: list[dict] = []
        self.battles: dict[str, dict] = {}  # ephemeral, not persisted

        self._load()
        if not self.packs:
            self._seed()

    # ---------- schema ----------
    def _init_schema(self) -> None:
        with _lock:
            self._conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS parents (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    password TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS tokens (
                    token TEXT PRIMARY KEY,
                    parent_id TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS children (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS packs (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS attempts (
                    id TEXT PRIMARY KEY,
                    child_id TEXT NOT NULL,
                    at INTEGER NOT NULL,
                    data TEXT NOT NULL
                );
                """
            )
            self._conn.commit()

    # ---------- load cache ----------
    def _load(self) -> None:
        cur = self._conn.cursor()
        for row in cur.execute("SELECT id, data, password FROM parents"):
            self.parents[row["id"]] = json.loads(row["data"])
            self.passwords[row["id"]] = row["password"]
        for row in cur.execute("SELECT token, parent_id FROM tokens"):
            self.tokens[row["token"]] = row["parent_id"]
        for row in cur.execute("SELECT id, data FROM children"):
            self.children[row["id"]] = json.loads(row["data"])
        for row in cur.execute("SELECT id, data FROM packs"):
            self.packs[row["id"]] = json.loads(row["data"])
        for row in cur.execute(
            "SELECT data FROM attempts ORDER BY at ASC"
        ):
            self.attempts.append(json.loads(row["data"]))

    # ---------- persistence helpers ----------
    def save_parent(self, parent: dict, password: str | None = None) -> None:
        with _lock:
            self.parents[parent["id"]] = parent
            if password is not None:
                self.passwords[parent["id"]] = password
            pw = self.passwords.get(parent["id"], "")
            self._conn.execute(
                "INSERT INTO parents (id, data, password) VALUES (?, ?, ?) "
                "ON CONFLICT(id) DO UPDATE SET data=excluded.data, password=excluded.password",
                (parent["id"], json.dumps(parent), pw),
            )
            self._conn.commit()

    def save_token(self, token: str, parent_id: str) -> None:
        with _lock:
            self.tokens[token] = parent_id
            self._conn.execute(
                "INSERT OR REPLACE INTO tokens (token, parent_id) VALUES (?, ?)",
                (token, parent_id),
            )
            self._conn.commit()

    def save_child(self, child: dict) -> None:
        with _lock:
            self.children[child["id"]] = child
            self._conn.execute(
                "INSERT INTO children (id, data) VALUES (?, ?) "
                "ON CONFLICT(id) DO UPDATE SET data=excluded.data",
                (child["id"], json.dumps(child)),
            )
            self._conn.commit()

    def save_pack(self, pack: dict) -> None:
        with _lock:
            self.packs[pack["id"]] = pack
            self._conn.execute(
                "INSERT INTO packs (id, data) VALUES (?, ?) "
                "ON CONFLICT(id) DO UPDATE SET data=excluded.data",
                (pack["id"], json.dumps(pack)),
            )
            self._conn.commit()

    def delete_pack(self, pack_id: str) -> None:
        with _lock:
            self.packs.pop(pack_id, None)
            self._conn.execute("DELETE FROM packs WHERE id = ?", (pack_id,))
            self._conn.commit()

    def delete_personalized_packs(self) -> None:
        """Remove all personalized packs so only the newest remains."""
        with _lock:
            ids = [
                pid
                for pid, p in self.packs.items()
                if p.get("type") == "personalized"
            ]
            for pid in ids:
                self.packs.pop(pid, None)
                self._conn.execute("DELETE FROM packs WHERE id = ?", (pid,))
            self._conn.commit()

    def add_attempt(self, attempt: dict) -> None:
        with _lock:
            self.attempts.append(attempt)
            self._conn.execute(
                "INSERT INTO attempts (id, child_id, at, data) VALUES (?, ?, ?, ?)",
                (attempt["id"], attempt["child_id"], attempt["at"], json.dumps(attempt)),
            )
            self._conn.commit()

    def attempts_for_child(self, child_id: str) -> list[dict]:
        return [a for a in self.attempts if a["child_id"] == child_id]

    # ---------- seeding ----------
    def _seed(self) -> None:
        self.save_pack(
            _default_pack("math", "Math Adventure", "गणित यात्रा", SUBJECT_PACK_MIXED["math"])
        )
        self.save_pack(
            _default_pack("nepali", "Nepali Words", "नेपाली शब्द", SUBJECT_PACK_MIXED["nepali"])
        )
        self.save_pack(
            _default_pack("science", "Science Explorer", "विज्ञान खोज", SUBJECT_PACK_MIXED["science"])
        )
        # Mixed interactive pack: match-the-following, order (drag&drop), mcq.
        puzzles_id = "default-puzzles"
        self.save_pack(
            {
                "id": puzzles_id,
                "title": "Fun Puzzles",
                "title_np": "रमाइलो पजल",
                "subject": "math",
                "type": "default",
                "status": "ready",
                "grade": 2,
                "created_by": None,
                "questions": PUZZLE_QUESTIONS,
                "levels": _build_levels(puzzles_id, PUZZLE_QUESTIONS, 5, 3),
            }
        )

        parent_id = "parent-1"
        self.save_parent(
            {"id": parent_id, "name": "Sita Sharma", "email": "demo@nanigo.app"},
            password="demo1234",
        )

        self.save_child(
            {
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
        )
        self.save_child(
            {
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
        )

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
