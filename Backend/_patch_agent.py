import json
import urllib.request
import urllib.error

KEY = "sk_8fcde96656db3fad3242bf99cd7d2ae5ef3bfb5e45719557"
AGENT = "agent_8301ktyern3yfdkb8he13t8bmgs6"
JESSICA = "cgSgspJ2msm6clMCkdW9"

body = {
    "conversation_config": {
        # Add Nepali as an additional language with the Jessica voice. This
        # registers "ne" as a selectable conversation language and lets the
        # runtime use a multilingual voice for it.
        "language_presets": {
            "hi": {
                "overrides": {
                    "tts": {"voice_id": JESSICA},
                    "agent": {
                        "first_message": "नमस्ते! म नानी हुँ। आफ्नो किताबको बारेमा जे पनि सोध्नुहोस्!",
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

req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/convai/agents/{AGENT}",
    data=json.dumps(body).encode(),
    headers={"xi-api-key": KEY, "Content-Type": "application/json"},
    method="PATCH",
)
try:
    d = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
    cc = d.get("conversation_config", {})
    print("OK language_presets keys:", list(cc.get("language_presets", {}).keys()))
    print("tts model:", cc.get("tts", {}).get("model_id"))
    ov = d.get("platform_settings", {}).get("overrides", {}).get("conversation_config_override", {})
    print("overrides:", json.dumps(ov))
except urllib.error.HTTPError as e:
    print("ERR", e.code, e.read().decode("utf-8", "ignore")[:500])
