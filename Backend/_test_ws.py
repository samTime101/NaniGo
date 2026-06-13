import asyncio
import json
import urllib.request

import websockets

BASE = "http://localhost:8000/api"


def session(lang):
    url = f"{BASE}/tutor/session?child_id=child-1&lang={lang}"
    return json.loads(urllib.request.urlopen(url, timeout=30).read().decode())


async def try_lang(lang):
    s = session(lang)
    print(f"\n==== lang={lang}  voice={s.get('voice_id')}  language={s.get('language')}")
    agent = {
        "prompt": {"prompt": s["system_prompt"]},
        "first_message": s["first_message"],
    }
    if s.get("language"):
        agent["language"] = s["language"]
    override = {"agent": agent}
    if s.get("voice_id"):
        override["tts"] = {"voice_id": s["voice_id"]}

    init = {
        "type": "conversation_initiation_client_data",
        "conversation_config_override": override,
    }
    try:
        async with websockets.connect(s["signed_url"], max_size=None) as ws:
            await ws.send(json.dumps(init))
            for _ in range(5):
                msg = await asyncio.wait_for(ws.recv(), timeout=15)
                data = json.loads(msg)
                t = data.get("type")
                print("  <-", t)
                if t == "conversation_initiation_metadata":
                    print("     OK metadata:", json.dumps(data.get("conversation_initiation_metadata_event", {}))[:200])
                    return
                if "error" in (t or "").lower() or data.get("error"):
                    print("     ERROR:", json.dumps(data)[:400])
                    return
    except Exception as e:
        print("  WS EXCEPTION:", repr(e)[:400])


async def main():
    await try_lang("en")
    await try_lang("np")


asyncio.run(main())
