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

    # Regex allowing localhost + private LAN ranges on any port, so devices
    # on the same Wi-Fi (phones/tablets) can call the API directly.
    CORS_ORIGIN_REGEX: str = os.getenv(
        "CORS_ORIGIN_REGEX",
        r"http://(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
        r"192\.168\.\d{1,3}\.\d{1,3}|"
        r"172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?",
    )

    # Gemini powers the "Upload Book Pages" OCR + question pipeline.
    # When no key is present the backend falls back to a deterministic
    # generator so the whole app stays demo-ready offline.
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    # Vision-capable model handles OCR (incl. Devanagari) + generation.
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # ElevenLabs Conversational AI powers the kid-facing voice tutor.
    # The tutor answers questions about an uploaded book using a RAG-style
    # system prompt built from the OCR'd page text + generated questions.
    # Leave the key/agent empty to disable the feature (frontend hides it).
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    ELEVENLABS_AGENT_ID: str = os.getenv("ELEVENLABS_AGENT_ID", "")

    # Voice used to read out "speak" questions, and the speech-to-text model
    # used to transcribe the child's spoken answer for grading.
    ELEVENLABS_TTS_VOICE_ID: str = os.getenv(
        "ELEVENLABS_TTS_VOICE_ID", "cjVigY5qzO86Huf0OWal"
    )
    ELEVENLABS_TTS_MODEL_ID: str = os.getenv(
        "ELEVENLABS_TTS_MODEL_ID", "eleven_multilingual_v2"
    )
    ELEVENLABS_STT_MODEL_ID: str = os.getenv(
        "ELEVENLABS_STT_MODEL_ID", "scribe_v1"
    )

    # "Jessica - Playful, Bright, Warm" voice, used when the child switches the
    # tutor to Nepali. Nepali isn't a supported conversational language, so we
    # use Hindi (same Devanagari script) for the speech pipeline.
    ELEVENLABS_NEPALI_VOICE_ID: str = os.getenv(
        "ELEVENLABS_NEPALI_VOICE_ID", "cgSgspJ2msm6clMCkdW9"
    )
    ELEVENLABS_NEPALI_LANG_CODE: str = os.getenv(
        "ELEVENLABS_NEPALI_LANG_CODE", "hi"
    )

    HEART_REFILL_MINUTES: int = int(os.getenv("HEART_REFILL_MINUTES", "5"))

    # SQLite database file (relative to the Backend folder by default).
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "nanigo.db")
    
    KHALTI_SECRET_KEY: str = os.getenv("KHALTI_SECRET_KEY", "")
    KHALTI_PUBLIC_KEY: str = os.getenv("KHALTI_PUBLIC_KEY", "")


settings = Settings()
