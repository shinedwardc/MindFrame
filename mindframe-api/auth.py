import json
import os

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwe
from sqlalchemy.orm import Session

from db.models.user import User
from db.session import get_db

_security = HTTPBearer()

# Auth.js v5 encrypts the session token with JWE (dir + A256CBC-HS512).
# The key is derived from NEXTAUTH_SECRET via HKDF-SHA256, keyed to the cookie name.
_COOKIE_NAME = "authjs.session-token"


def _derive_key(secret: str) -> bytes:
    # Replicates Auth.js getDerivedEncryptionKey exactly:
    # hkdf("sha256", keyMaterial, salt=cookieName, info=`Auth.js Generated Encryption Key (${cookieName})`, 64)
    salt = _COOKIE_NAME.encode() # Using cookie name as salt, per Auth.js implementation. The key is specifically for encrypting the session token cookie.
    info = f"Auth.js Generated Encryption Key ({_COOKIE_NAME})".encode()
    return HKDF(
        algorithm=hashes.SHA256(),
        length=64,
        salt=salt,
        info=info,
    ).derive(secret.encode())


def _decode_session_token(token: str) -> dict:
    """
    Decrypts the JWE session token and returns the payload as a dictionary.
    """
    secret = os.getenv("JWT_SECRET", "")
    key = _derive_key(secret)
    payload_bytes = jwe.decrypt(token, key)
    return json.loads(payload_bytes)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(_security),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = _decode_session_token(credentials.credentials)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Token missing email claim")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name=payload.get("name"))
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def get_current_user_id(user: User = Depends(get_current_user)) -> int:
    return user.id
