import os

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # pragma: no cover - dotenv optional
    pass


class Settings:
    """Runtime configuration pulled from environment variables."""

    APP_NAME: str = "NaniGO API"
    APP_VERSION: str = "1.0.0"

    # Comma-separated list of allowed CORS origins.
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173",
    ).split(",")

    # Gemini powers the "Upload Book Pages" OCR + question pipeline.
    # When no key is present the backend falls back to a deterministic
    # generator so the whole app stays demo-ready offline.
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    # Vision-capable model handles OCR (incl. Devanagari) + generation.
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    HEART_REFILL_MINUTES: int = int(os.getenv("HEART_REFILL_MINUTES", "5"))

    # SQLite database file (relative to the Backend folder by default).
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "nanigo.db")


settings = Settings()
