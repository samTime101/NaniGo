# NaniGO Backend — FastAPI

Python API powering the NaniGO gamified learning app: parent auth, children
management, default + personalized question packs, an AI "Upload Book Pages"
pipeline, 1v1 battles (vs bot), and a leaderboard.

It runs fully in-memory and is **seeded for instant demo** — no database or
API keys required. Drop in an `OPENAI_API_KEY` to enable real vision-LLM
question generation from textbook photos.

## Setup

```bash
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Interactive docs: http://localhost:8000/docs

## Demo credentials (seeded)

- Parent: `demo@nanigo.app` / `demo1234`
- Children codes: `482913` (Aarav), `305178` (Diya)

## Architecture

```
Backend/
├── main.py                 # App factory, CORS, router wiring
└── app/
    ├── config.py           # Env-driven settings
    ├── models.py           # Pydantic schemas (snake_case)
    ├── store.py            # In-memory store + seed data
    ├── deps.py             # Bearer-token parent auth dependency
    ├── ai.py               # Vision-LLM pipeline + offline fallback
    ├── data/questions.py   # Seed question bank (math/nepali/science)
    └── routers/
        ├── auth.py         # /api/auth  signup, login, me
        ├── children.py     # /api/children, /api/kid/*  CRUD + gameplay
        ├── packs.py        # /api/packs  list/get question packs
        ├── uploads.py      # /api/uploads  book→questions pipeline
        ├── battles.py      # /api/battles  start + answer (bot opponent)
        └── leaderboard.py  # /api/leaderboard  class / all-Nepal
```

## API overview

All routes are prefixed with `/api`.

### Auth (parents)
| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/signup` | `{name,email,password}` → `{parent, token}` |
| POST | `/auth/login`  | `{email,password}` → `{parent, token}` |
| GET  | `/auth/me`     | Bearer token required |

### Children (parent-scoped; send `Authorization: Bearer <token>`)
| Method | Path | Notes |
|--------|------|-------|
| GET  | `/children` | list this parent's children |
| POST | `/children` | `{name,age,grade,avatar}` → child + 6-digit code |
| POST | `/children/{id}/regenerate-code` | new code |

### Kid session (public, scoped by code)
| Method | Path | Notes |
|--------|------|-------|
| POST | `/kid/login/{code}` | resolve child by 6-digit code |
| GET  | `/kid/{child_id}` | fetch child profile |
| POST | `/kid/{child_id}/complete-level` | `{pack_id,sequence_no,correct,total}` → xp + stars |
| POST | `/kid/{child_id}/lose-heart` | decrement hearts (sets refill timer at 0) |
| POST | `/kid/{child_id}/refill-hearts` | reset to 3 hearts |

### Packs
| Method | Path | Notes |
|--------|------|-------|
| GET | `/packs?type=default&subject=math` | filterable list |
| GET | `/packs/{id}` | single pack with questions + levels |

### Uploads (the killer feature — parent token required)
| Method | Path | Notes |
|--------|------|-------|
| POST | `/uploads` | multipart: `child_id`, `subject`, `files[]` → creates a `generating` pack, processes in background to `ready` (15 questions / 3 levels) |
| POST | `/uploads/{pack_id}/retry` | re-run a failed pack |

### Battles (vs bot)
| Method | Path | Notes |
|--------|------|-------|
| POST | `/battles` | `{child_id,subject}` → battle with 5 questions + bot opponent |
| POST | `/battles/answer` | speed-weighted scoring (base 100 + up to 100 bonus) |

### Leaderboard
| Method | Path | Notes |
|--------|------|-------|
| GET | `/leaderboard?scope=class&grade=2&current_child_id=child-1` | ranked by XP |

## AI pipeline

`app/ai.py` sends uploaded page images to a vision model (default `gpt-4o`)
with a strict-JSON system prompt asking for 15 grade-appropriate MCQs. The
response is validated, and on any failure (or when no key is set) it falls
back to the seed bank so the feature always works.

## Notes

- Storage is in-memory; restarting the server resets to seed data. Swap the
  methods in `app/store.py` for Postgres/Supabase to persist.
- Tokens are simple opaque strings for the demo, not JWTs.
