from io import BytesIO

from PIL import Image

ALLOWED_FORMATS = {"PNG", "BMP"}


class StegoError(Exception):
    pass


def _bytes_to_bits(data: bytes) -> list[int]:
    bits: list[int] = []
    for byte in data:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)
    return bits


def _bits_to_bytes(bits: list[int]) -> bytes:
    result = bytearray()
    for i in range(0, len(bits), 8):
        chunk = bits[i : i + 8]
        if len(chunk) < 8:
            break
        byte = 0
        for bit in chunk:
            byte = (byte << 1) | bit
        result.append(byte)
    return bytes(result)


def get_capacity(image: Image.Image) -> int:
    """Return max message bytes that can be embedded (excluding 4-byte length header)."""
    width, height = image.size
    total_bits = width * height * 3
    header_bits = 32
    return (total_bits - header_bits) // 8


def validate_image(image_bytes: bytes) -> Image.Image:
    try:
        image = Image.open(BytesIO(image_bytes))
        image.load()
    except Exception as exc:
        raise StegoError("Invalid image file") from exc

    if image.format not in ALLOWED_FORMATS:
        raise StegoError("Only PNG and BMP images are supported. JPEG compression destroys hidden data.")

    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    elif image.mode == "RGBA":
        image = image.convert("RGB")

    return image


def encode_lsb(image: Image.Image, message: str) -> Image.Image:
    message_bytes = message.encode("utf-8")
    capacity = get_capacity(image)
    if len(message_bytes) > capacity:
        raise StegoError(
            f"Message too large. Max {capacity} bytes for this image, got {len(message_bytes)} bytes."
        )

    length = len(message_bytes)
    payload = length.to_bytes(4, byteorder="big") + message_bytes
    bits = _bytes_to_bits(payload)

    pixels = list(image.getdata())
    if len(bits) > len(pixels) * 3:
        raise StegoError("Message too large for this image")

    new_pixels = []
    bit_index = 0
    for r, g, b in pixels:
        if bit_index < len(bits):
            r = (r & ~1) | bits[bit_index]
            bit_index += 1
        if bit_index < len(bits):
            g = (g & ~1) | bits[bit_index]
            bit_index += 1
        if bit_index < len(bits):
            b = (b & ~1) | bits[bit_index]
            bit_index += 1
        new_pixels.append((r, g, b))

    stego = Image.new("RGB", image.size)
    stego.putdata(new_pixels)
    return stego


def decode_lsb(image: Image.Image) -> str:
    pixels = list(image.getdata())
    bits: list[int] = []
    for r, g, b in pixels:
        bits.append(r & 1)
        bits.append(g & 1)
        bits.append(b & 1)

    if len(bits) < 32:
        raise StegoError("No hidden message found in this image")

    length_bits = bits[:32]
    message_length = int.from_bytes(_bits_to_bytes(length_bits), byteorder="big")
    required_bits = 32 + message_length * 8

    if message_length <= 0 or required_bits > len(bits):
        raise StegoError("No valid hidden message found in this image")

    message_bits = bits[32 : 32 + message_length * 8]
    message_bytes = _bits_to_bytes(message_bits)

    try:
        return message_bytes.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise StegoError("Decoded data is not valid UTF-8 text") from exc
