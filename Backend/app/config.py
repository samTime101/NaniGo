import os


class Settings:
    """Runtime configuration pulled from environment variables."""

    APP_NAME: str = "NaniGO API"
    APP_VERSION: str = "1.0.0"

    # Comma-separated list of allowed CORS origins.
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173",
    ).split(",")

    # AI provider config for the "Upload Book Pages" pipeline.
    # When no key is present the backend falls back to a deterministic
    # generator so the whole app stays demo-ready offline.
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")

    HEART_REFILL_MINUTES: int = int(os.getenv("HEART_REFILL_MINUTES", "5"))

    # SQLite database file (relative to the Backend folder by default).
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "nanigo.db")


settings = Settings()
