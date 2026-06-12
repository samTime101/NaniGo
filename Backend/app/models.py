from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

AvatarId = Literal[
    "panda", "tiger", "elephant", "monkey", "rhino", "peacock", "yak", "rabbit"
]
SubjectId = Literal["math", "nepali", "science", "english"]
PackType = Literal["default", "personalized"]
PackStatus = Literal["generating", "ready", "failed"]
FigureId = Literal["rectangle", "triangle", "circle", "square", "star"]
QuestionKind = Literal["mcq", "match", "order", "speak"]


# ---------- Questions / packs ----------
class MatchPair(BaseModel):
    left: str
    right: str


class Question(BaseModel):
    id: str
    kind: QuestionKind = "mcq"
    text: str
    text_np: Optional[str] = None
    options: list[str] = []
    correct_index: int = 0
    explanation: str = ""
    figure: Optional[FigureId] = None
    # match-the-following
    pairs: Optional[list[MatchPair]] = None
    # order (drag & drop) — the correct sequence of items
    sequence: Optional[list[str]] = None
    # speak (voice answer) — the expected spoken answer + acceptable variants
    answer: Optional[str] = None
    accept: Optional[list[str]] = None


class LessonStep(BaseModel):
    # "teach" shows a concept; "tap" is an interactive quick-check.
    kind: Literal["teach", "tap"] = "teach"
    title: str = ""
    body: str = ""
    # Fields used by interactive "tap" steps:
    question: Optional[str] = None
    options: Optional[list[str]] = None
    correct_index: Optional[int] = None
    explanation: Optional[str] = None


class Level(BaseModel):
    id: str
    sequence_no: int
    question_ids: list[str]
    # Interactive "teach first" lesson steps shown before the questions.
    teach: list[LessonStep] = []


class QuestionPack(BaseModel):
    id: str
    title: str
    title_np: str
    subject: SubjectId
    type: PackType
    status: PackStatus
    grade: int
    created_by: Optional[str] = None
    created_at: Optional[int] = None
    child_id: Optional[str] = None
    page_count: Optional[int] = None
    # OCR'd page text used to ground the voice tutor's answers (RAG context).
    source_text: Optional[str] = None
    questions: list[Question] = []
    levels: list[Level] = []


# ---------- Parents / children ----------
class Parent(BaseModel):
    id: str
    name: str
    email: str


class ParentSignup(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=4)


class ParentLogin(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    parent: Parent
    token: str


class ActivityItem(BaseModel):
    id: str
    text: str
    stars: int
    at: int


class Child(BaseModel):
    id: str
    parent_id: str
    name: str
    age: int
    grade: int
    avatar: AvatarId
    child_code: str
    total_xp: int = 0
    streak_days: int = 0
    hearts: int = 3
    hearts_refill_at: Optional[int] = None
    accuracy: int = 0
    time_today_min: int = 0
    weekly_xp: list[int] = Field(default_factory=lambda: [0, 0, 0, 0, 0, 0, 0])
    completed_levels: dict[str, int] = Field(default_factory=dict)
    activity: list[ActivityItem] = []


class ChildCreate(BaseModel):
    name: str
    age: int = Field(ge=3, le=14)
    grade: int = Field(ge=1, le=8)
    avatar: AvatarId


# ---------- Gameplay ----------
class LevelAttempt(BaseModel):
    pack_id: str
    sequence_no: int
    correct: int
    total: int


class LevelResult(BaseModel):
    xp_earned: int
    stars: int
    total_xp: int


class HeartAction(BaseModel):
    pass


# ---------- Uploads / AI ----------
class UploadResponse(BaseModel):
    pack_id: str
    status: PackStatus


# ---------- Battles ----------
class BattleQuestion(BaseModel):
    id: str
    text: str
    text_np: Optional[str] = None
    options: list[str]
    correct_index: int


class BattleStart(BaseModel):
    child_id: str
    subject: SubjectId


class BattlePlayer(BaseModel):
    id: str
    name: str
    avatar: AvatarId
    score: int = 0
    is_bot: bool = False


class Battle(BaseModel):
    id: str
    subject: SubjectId
    players: list[BattlePlayer]
    questions: list[BattleQuestion]


class BattleAnswer(BaseModel):
    battle_id: str
    player_id: str
    question_index: int
    selected_index: int
    time_ms: int


class BattleScore(BaseModel):
    player_id: str
    gained: int
    total: int
    correct: bool
    bot_score: int


# ---------- Leaderboard ----------
class LeaderboardEntry(BaseModel):
    id: str
    name: str
    avatar: AvatarId
    xp: int
    grade: int
    is_current: bool = False


# ---------- Per-question attempt logs ----------
class AttemptCreate(BaseModel):
    pack_id: str
    question_id: str
    sequence_no: int = 0
    correct: bool
    time_ms: int
    selected: Optional[str] = None


class Attempt(BaseModel):
    id: str
    child_id: str
    pack_id: str
    pack_title: str
    subject: SubjectId
    question_id: str
    question_text: str
    kind: QuestionKind
    correct: bool
    time_ms: int
    selected: Optional[str] = None
    at: int
