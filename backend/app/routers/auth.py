"""
Authentication API endpoints for Google OAuth.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from pydantic import BaseModel
from datetime import timedelta

from ..database import get_db
from ..models import User
from ..config import settings
from ..auth import create_access_token, get_current_user

router = APIRouter()


class GoogleAuthRequest(BaseModel):
    """Request body for Google OAuth token exchange"""
    credential: str  # Google ID token from frontend


class TokenResponse(BaseModel):
    """Response containing JWT access token"""
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    """User information response"""
    id: int
    email: str
    name: str
    created_at: str


@router.post("/google", response_model=TokenResponse)
def google_auth(
    auth_request: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with Google OAuth.

    This endpoint receives a Google ID token from the frontend,
    verifies it, creates or updates the user, and returns a JWT.

    Args:
        auth_request: Contains the Google credential (ID token)
        db: Database session

    Returns:
        JWT access token and user information
    """
    try:
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(
            auth_request.credential,
            google_requests.Request(),
            settings.google_client_id
        )

        # Extract user information from the token
        email = idinfo.get("email")
        name = idinfo.get("name", email.split("@")[0])  # Use email prefix if name not provided

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not found in Google token"
            )

        # Get or create user
        user = db.query(User).filter(User.email == email).first()

        if user is None:
            # Create new user
            user = User(
                email=email,
                name=name,
                google_access_token=auth_request.credential  # Store the token
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update existing user's token
            user.name = name  # Update name in case it changed
            user.google_access_token = auth_request.credential
            db.commit()
            db.refresh(user)

        # Create JWT access token
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "created_at": user.created_at.isoformat()
            }
        )

    except ValueError as e:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information.

    Returns:
        Current user's profile information
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        created_at=current_user.created_at.isoformat()
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    Logout endpoint (client should delete the JWT token).

    Note: Since we're using JWT, there's no server-side session to destroy.
    The client should simply delete the token from storage.

    Returns:
        Success message
    """
    return {"message": "Logged out successfully"}
