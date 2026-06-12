import time
import httpx

BASE = "http://127.0.0.1:8000/api"

with httpx.Client(timeout=120) as c:
    r = c.post(f"{BASE}/auth/login", json={"email": "demo@nanigo.app", "password": "demo1234"})
    token = r.json()["token"]
    h = {"Authorization": f"Bearer {token}"}

    with open("test_page.jpg", "rb") as f:
        files = {"files": ("test_page.jpg", f, "image/jpeg")}
        data = {"child_id": "child-1", "subject": "science"}
        r = c.post(f"{BASE}/uploads", data=data, files=files, headers=h)
    pack_id = r.json()["pack_id"]
    print("upload ->", r.json())

    for _ in range(40):
        time.sleep(1.5)
        pack = c.get(f"{BASE}/packs/{pack_id}").json()
        if pack["status"] != "generating":
            break
    print("status:", pack["status"], "| questions:", len(pack["questions"]))
    for q in pack["questions"][:6]:
        print(" -", q["text"], "=>", q["options"][q["correct_index"]])
