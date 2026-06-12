import random

from fastapi import APIRouter, HTTPException

from ..models import (
    Battle,
    BattleAnswer,
    BattlePlayer,
    BattleQuestion,
    BattleScore,
    BattleStart,
)
from ..store import store, uid

router = APIRouter(prefix="/battles", tags=["battles"])

BOT_NAMES = ["Bibek", "Priya", "Sushant", "Anjali", "Kiran", "Maya"]
BOT_AVATARS = ["monkey", "rabbit", "rhino", "elephant", "yak", "peacock"]


@router.post("", response_model=Battle)
def start_battle(body: BattleStart):
    child = store.children.get(body.child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    pack = store.packs.get(f"default-{body.subject}")
    if not pack:
        raise HTTPException(status_code=404, detail="Subject not available")

    pool = list(pack["questions"])
    random.shuffle(pool)
    chosen = pool[:5]
    questions = [
        BattleQuestion(
            id=q["id"],
            text=q["text"],
            text_np=q.get("text_np"),
            options=q["options"],
            correct_index=q["correct_index"],
        )
        for q in chosen
    ]

    battle_id = uid()
    i = random.randrange(len(BOT_NAMES))
    players = [
        BattlePlayer(id=child["id"], name=child["name"], avatar=child["avatar"]),
        BattlePlayer(
            id=f"bot-{uid()}",
            name=BOT_NAMES[i],
            avatar=BOT_AVATARS[i],
            is_bot=True,
        ),
    ]
    battle = {
        "id": battle_id,
        "subject": body.subject,
        "players": [p.model_dump() for p in players],
        "questions": [q.model_dump() for q in questions],
    }
    store.battles[battle_id] = battle
    return Battle(**battle)


@router.post("/answer", response_model=BattleScore)
def answer(body: BattleAnswer):
    battle = store.battles.get(body.battle_id)
    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    if body.question_index >= len(battle["questions"]):
        raise HTTPException(status_code=400, detail="Bad question index")

    q = battle["questions"][body.question_index]
    correct = body.selected_index == q["correct_index"]

    # Speed-weighted scoring: base 100 + up to 100 bonus (within 15s window).
    gained = 0
    if correct:
        speed_bonus = max(0, 100 - int((body.time_ms / 15000) * 100))
        gained = 100 + speed_bonus

    # Simulate a believable bot answer (≈70% accuracy, 1.5-3s delay).
    bot_correct = random.random() < 0.7
    bot_gained = 0
    if bot_correct:
        bot_delay = random.uniform(1500, 3000)
        bot_gained = 100 + max(0, 100 - int((bot_delay / 15000) * 100))

    with store.lock:
        player = next(
            (p for p in battle["players"] if p["id"] == body.player_id), None
        )
        bot = next((p for p in battle["players"] if p["is_bot"]), None)
        if player:
            player["score"] += gained
        if bot:
            bot["score"] += bot_gained

    return BattleScore(
        player_id=body.player_id,
        gained=gained,
        total=player["score"] if player else gained,
        correct=correct,
        bot_score=bot["score"] if bot else 0,
    )
