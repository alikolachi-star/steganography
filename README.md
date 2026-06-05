# Steganography — Image LSB Web App

A full-stack university project for hiding and extracting secret text messages inside PNG/BMP images using **Least Significant Bit (LSB) steganography**.

## Features

- **Encode** — embed a secret message in a cover image (output is PNG)
- **Decode** — extract hidden text from a stego image
- **User accounts** — register, login, JWT authentication
- **Operation history** — SQLite log of encode/decode actions
- **Modern UI** — dark glassmorphism theme with Framer Motion animations

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, SQLAlchemy, Pillow, JWT |
| Frontend | React, Vite, TypeScript, Tailwind CSS, Framer Motion |
| Database | SQLite |

## Project Structure

```
steganography/
├── backend/          # FastAPI API
├── frontend/         # React SPA
└── README.md
```

## Prerequisites

- Python 3.11+
- Node.js 18+

## Setup & Run

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit SECRET_KEY for production
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

The Vite dev server proxies `/api` requests to the backend on port 8000.

## Demo Walkthrough (Presentation)

1. Open http://localhost:5173 and **Register** a new account
2. Go to **Encode** — upload a PNG image and enter: `Hello from steganography!`
3. Click **Hide message** → **Download PNG**
4. Go to **Decode** — upload the downloaded stego image
5. Click **Extract message** — the hidden text appears with animation
6. Open **History** — see logged encode/decode operations

## How LSB Works

1. The message is converted to UTF-8 bytes
2. A 32-bit length header is prepended
3. Each bit is written into the least significant bit of R, G, B channels (left-to-right, top-to-bottom)
4. Output is saved as PNG (lossless — JPEG compression destroys hidden data)

**Capacity formula:** `(width × height × 3 − 32) / 8` bytes

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/stego/encode` | Yes | Hide message in image |
| POST | `/api/stego/decode` | Yes | Extract message |
| GET | `/api/stego/history` | Yes | Operation history |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | — | JWT signing key |
| `DATABASE_URL` | `sqlite:///./steganography.db` | SQLite connection |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token lifetime (24h) |

## Notes

- Only **PNG** and **BMP** cover images are accepted (JPEG is rejected)
- Maximum upload size: **10 MB**
- Images are processed in memory — not stored in the database

## License

University project — free to use for educational purposes.
