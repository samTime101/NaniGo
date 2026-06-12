from fastapi import APIRouter, Depends, HTTPException

from ..deps import get_current_parent
from ..models import AuthResponse, Parent, ParentLogin, ParentSignup
from ..store import store, uid

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_token(parent_id: str) -> str:
    token = uid() + uid()
    store.tokens[token] = parent_id
    return token


@router.post("/signup", response_model=AuthResponse)
def signup(body: ParentSignup):
    with store.lock:
        for p in store.parents.values():
            if p["email"].lower() == body.email.lower():
                raise HTTPException(status_code=409, detail="Email already registered")
        parent_id = uid()
        parent = {"id": parent_id, "name": body.name, "email": body.email}
        store.parents[parent_id] = parent
        store.passwords[parent_id] = body.password
        token = _issue_token(parent_id)
    return AuthResponse(parent=Parent(**parent), token=token)


@router.post("/login", response_model=AuthResponse)
def login(body: ParentLogin):
    with store.lock:
        for pid, p in store.parents.items():
            if p["email"].lower() == body.email.lower():
                if store.passwords.get(pid) != body.password:
                    raise HTTPException(status_code=401, detail="Wrong password")
                token = _issue_token(pid)
                return AuthResponse(parent=Parent(**p), token=token)
    raise HTTPException(status_code=404, detail="No account with that email")


@router.get("/me", response_model=Parent)
def me(parent: dict = Depends(get_current_parent)):
    return Parent(**parent)
