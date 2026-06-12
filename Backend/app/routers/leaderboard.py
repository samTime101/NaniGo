from fastapi import APIRouter

from ..models import LeaderboardEntry
from ..store import store

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

# A few synthetic peers to populate the board alongside real children.
SYNTHETIC = [
    {"id": "lb1", "name": "Bibek", "avatar": "monkey", "xp": 3120, "grade": 2},
    {"id": "lb2", "name": "Priya", "avatar": "rabbit", "xp": 2890, "grade": 2},
    {"id": "lb3", "name": "Sushant", "avatar": "rhino", "xp": 1180, "grade": 2},
    {"id": "lb4", "name": "Anjali", "avatar": "elephant", "xp": 980, "grade": 4},
    {"id": "lb5", "name": "Kiran", "avatar": "yak", "xp": 760, "grade": 4},
    {"id": "lb6", "name": "Maya", "avatar": "peacock", "xp": 540, "grade": 3},
]


@router.get("", response_model=list[LeaderboardEntry])
def get_leaderboard(
    scope: str = "all",
    grade: int | None = None,
    current_child_id: str | None = None,
):
    entries: list[dict] = [dict(s) for s in SYNTHETIC]

    for c in store.children.values():
        entries.append(
            {
                "id": c["id"],
                "name": c["name"],
                "avatar": c["avatar"],
                "xp": c["total_xp"],
                "grade": c["grade"],
            }
        )

    if scope == "class" and grade is not None:
        entries = [e for e in entries if e["grade"] == grade]

    entries.sort(key=lambda e: e["xp"], reverse=True)

    result = []
    for e in entries:
        result.append(
            LeaderboardEntry(
                id=e["id"],
                name=e["name"],
                avatar=e["avatar"],
                xp=e["xp"],
                grade=e["grade"],
                is_current=e["id"] == current_child_id,
            )
        )
    return result
