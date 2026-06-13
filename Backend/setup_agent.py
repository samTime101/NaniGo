"""Create + configure the NaniGO voice-tutor agent under the API key in .env.

Run once after changing ELEVENLABS_API_KEY. Prints the new agent id; paste it
into ELEVENLABS_AGENT_ID in Backend/.env.

    python setup_agent.py
"""

import json
import urllib.error
import urllib.request

from app.config import settings

KEY = settings.ELEVENLABS_API_KEY
JESSICA = settings.ELEVENLABS_NEPALI_VOICE_ID
CREATE = "https://api.elevenlabs.io/v1/convai/agents/create"

body = {
    "name": "NaniGO Voice Tutor",
    "conversation_config": {
        "agent": {
            "language": "en",
            "first_message": "Namaste! I'm Nani. Ask me anything about your lessons!",
            "prompt": {
                "prompt": (
                    "You are Nani, a warm, patient voice tutor for children in "
                    "Nepal. Answer using the learning content provided at the "
                    "start of each conversation. Keep replies short and simple."
                ),
            },
        },
        # Eager turn-taking so Nani replies quickly once the child stops talking.
        "turn": {"turn_eagerness": "eager", "turn_timeout": 4.0},
        # Nepali experience uses the Hindi (Devanagari) pipeline + Jessica voice.
        "language_presets": {
            "hi": {
                "overrides": {
                    "tts": {"voice_id": JESSICA},
                    "agent": {
                        "first_message": "नमस्ते! म नानी हुँ। आफ्ना पाठहरूको बारेमा जे पनि सोध्नुहोस्!",
                    },
                }
            }
        },
    },
    "platform_settings": {
        "overrides": {
            "conversation_config_override": {
                "agent": {
                    "prompt": {"prompt": True},
                    "first_message": True,
                    "language": True,
                },
                "tts": {"voice_id": True},
            }
        }
    },
}


def main() -> None:
    if not KEY:
        print("No ELEVENLABS_API_KEY in .env")
        return
    req = urllib.request.Request(
        CREATE,
        data=json.dumps(body).encode(),
        headers={"xi-api-key": KEY, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        d = json.loads(urllib.request.urlopen(req, timeout=90).read().decode())
    except urllib.error.HTTPError as e:
        print("CREATE ERR", e.code, e.read().decode("utf-8", "ignore")[:500])
        return
    agent_id = d.get("agent_id")
    print("agent_id:", agent_id)

    # Verify a signed URL can be minted for it.
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id={agent_id}",
        headers={"xi-api-key": KEY},
    )
    try:
        s = json.loads(urllib.request.urlopen(req, timeout=20).read().decode())
        print("signed url OK:", bool(s.get("signed_url")))
    except urllib.error.HTTPError as e:
        print("SIGNED URL ERR", e.code, e.read().decode("utf-8", "ignore")[:300])

    print(f"\n>>> Put this in Backend/.env:\nELEVENLABS_AGENT_ID={agent_id}")


if __name__ == "__main__":
    main()
