"""One-off helper: create an ElevenLabs Conversational AI agent for NaniGO's
voice tutor, with prompt/first-message/language overrides enabled so the
backend can personalise each conversation per uploaded book.

Usage:
    python create_agent.py <ELEVENLABS_API_KEY>

Prints the new agent_id. Put it (and the key) in Backend/.env.
"""

import json
import sys
import urllib.request

API = "https://api.elevenlabs.io/v1/convai/agents/create"

body = {
    "name": "NaniGO Voice Tutor",
    "conversation_config": {
        "agent": {
            "language": "en",
            "first_message": "Namaste! I'm Nani. Ask me anything about your book!",
            "prompt": {
                "prompt": (
                    "You are Nani, a warm, patient voice tutor for children in "
                    "Nepal. Answer only using the book content provided at the "
                    "start of each conversation. Keep replies short and simple."
                ),
            },
        },
        # Eager turn-taking so Nani replies quickly once the child stops
        # talking — the default "normal" eagerness made replies feel laggy.
        "turn": {
            "turn_eagerness": "eager",
            "turn_timeout": 4.0,
        },
    },
    # Enable per-conversation overrides (required for the backend to inject the
    # book-specific system prompt / first message).
    "platform_settings": {
        "overrides": {
            "conversation_config_override": {
                "agent": {
                    "prompt": {"prompt": True},
                    "first_message": True,
                    "language": True,
                },
            },
        },
    },
}


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python create_agent.py <ELEVENLABS_API_KEY>")
        sys.exit(1)
    key = sys.argv[1].strip()

    req = urllib.request.Request(
        API,
        data=json.dumps(body).encode("utf-8"),
        headers={"xi-api-key": key, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:  # type: ignore[name-defined]
        print(f"HTTP {exc.code}: {exc.read().decode('utf-8', 'ignore')}")
        sys.exit(1)

    print(json.dumps(data, indent=2))
    agent_id = data.get("agent_id")
    if agent_id:
        print(f"\nAGENT_ID={agent_id}")


if __name__ == "__main__":
    import urllib.error

    main()
