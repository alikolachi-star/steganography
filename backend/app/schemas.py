from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class DecodeResponse(BaseModel):
    message: str


class OperationResponse(BaseModel):
    id: int
    type: str
    original_filename: str
    message_length: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoryResponse(BaseModel):
    items: list[OperationResponse]
    total: int
