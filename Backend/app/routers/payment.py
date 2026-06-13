from fastapi import APIRouter, Depends, HTTPException, Body
import urllib.request
import urllib.error
import json
import uuid
from pydantic import BaseModel

from ..config import settings
from ..deps import get_current_parent
from ..store import store

router = APIRouter(prefix="/payment", tags=["payment"])

class InitiateRequest(BaseModel):
    return_url: str

class VerifyRequest(BaseModel):
    pidx: str

@router.post("/initiate")
def initiate_payment(body: InitiateRequest, parent: dict = Depends(get_current_parent)):
    if not settings.KHALTI_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Khalti not configured")
        
    url = "https://a.khalti.com/api/v2/epayment/initiate/"
    
    payload = {
        "return_url": body.return_url,
        "website_url": "http://localhost:5173", # standard frontend url
        "amount": 50000, # 500 Rs in paisa
        "purchase_order_id": f"pro_{parent['id']}_{uuid.uuid4().hex[:6]}",
        "purchase_order_name": "NaniGo Pro Subscription",
        "customer_info": {
            "name": parent["name"],
            "email": parent["email"],
            "phone": "9800000000" # dummy phone as required by API
        }
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json"
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise HTTPException(status_code=400, detail=f"Khalti error: {error_body}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
def verify_payment(body: VerifyRequest, parent: dict = Depends(get_current_parent)):
    if not settings.KHALTI_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Khalti not configured")
        
    url = "https://a.khalti.com/api/v2/epayment/lookup/"
    payload = {"pidx": body.pidx}
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json"
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            if result.get("status") == "Completed":
                # Upgrade user
                with store.lock:
                    p = store.parents.get(parent["id"])
                    if p:
                        p["subscription_tier"] = "pro"
                        store.save_parent(p)
                return {"status": "success", "message": "Subscription upgraded"}
            else:
                raise HTTPException(status_code=400, detail=f"Payment not completed: {result.get('status')}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise HTTPException(status_code=400, detail=f"Khalti error: {error_body}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
