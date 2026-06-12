from fastapi import Depends, Header, HTTPException, status

from .store import store


def get_current_parent(authorization: str | None = Header(default=None)) -> dict:
    """Resolve the parent from a 'Bearer <token>' Authorization header."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token = authorization.split(" ", 1)[1].strip()
    parent_id = store.tokens.get(token)
    if not parent_id or parent_id not in store.parents:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return store.parents[parent_id]


ParentDep = Depends(get_current_parent)
