import json
import urllib.request

KEY = "sk_8fcde96656db3fad3242bf99cd7d2ae5ef3bfb5e45719557"

# Search the shared voice library for "Jessica"
url = "https://api.elevenlabs.io/v1/shared-voices?search=Jessica&page_size=10"
req = urllib.request.Request(url, headers={"xi-api-key": KEY})
try:
    d = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
    for v in d.get("voices", [])[:10]:
        print(
            v.get("voice_id"),
            "|",
            v.get("name"),
            "|",
            v.get("language"),
            "|",
            (v.get("descriptive") or v.get("description") or "")[:60],
        )
except Exception as e:
    print("shared-voices ERR", getattr(e, "code", ""), e.read().decode("utf-8", "ignore")[:300] if hasattr(e, "read") else e)

print("---- my voices ----")
req = urllib.request.Request("https://api.elevenlabs.io/v2/voices?search=Jessica", headers={"xi-api-key": KEY})
try:
    d = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
    for v in d.get("voices", [])[:10]:
        print(v.get("voice_id"), "|", v.get("name"))
except Exception as e:
    print("v2 voices ERR", getattr(e, "code", ""), e.read().decode("utf-8", "ignore")[:200] if hasattr(e, "read") else e)
