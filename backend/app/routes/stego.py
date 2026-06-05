from io import BytesIO

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Operation, User
from app.schemas import DecodeResponse, HistoryResponse, OperationResponse
from app.services.lsb import StegoError, decode_lsb, encode_lsb, validate_image

router = APIRouter(prefix="/stego", tags=["stego"])

MAX_FILE_SIZE = 10 * 1024 * 1024


async def _read_image(file: UploadFile) -> bytes:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10 MB.")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file provided")
    return content


@router.post("/encode")
async def encode(
    image: UploadFile = File(...),
    message: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    content = await _read_image(image)
    try:
        cover = validate_image(content)
        stego = encode_lsb(cover, message)
    except StegoError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    buffer = BytesIO()
    stego.save(buffer, format="PNG")
    buffer.seek(0)

    operation = Operation(
        user_id=current_user.id,
        type="encode",
        original_filename=image.filename or "cover.png",
        message_length=len(message.encode("utf-8")),
    )
    db.add(operation)
    db.commit()

    base_name = (image.filename or "cover").rsplit(".", 1)[0]
    return StreamingResponse(
        buffer,
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="{base_name}_stego.png"'},
    )


@router.post("/decode", response_model=DecodeResponse)
async def decode(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = await _read_image(image)
    try:
        stego = validate_image(content)
        message = decode_lsb(stego)
    except StegoError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    operation = Operation(
        user_id=current_user.id,
        type="decode",
        original_filename=image.filename or "stego.png",
        message_length=len(message.encode("utf-8")),
    )
    db.add(operation)
    db.commit()

    return DecodeResponse(message=message)


@router.get("/history", response_model=HistoryResponse)
def history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Operation).filter(Operation.user_id == current_user.id)
    total = query.count()
    items = (
        query.order_by(Operation.created_at.desc())
        .offset(skip)
        .limit(min(limit, 100))
        .all()
    )
    return HistoryResponse(
        items=[OperationResponse.model_validate(op) for op in items],
        total=total,
    )
