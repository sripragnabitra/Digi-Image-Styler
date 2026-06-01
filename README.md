# Digi Image Styler — Neural Style Transfer

A full-stack web app that applies the visual style of any artwork onto your photos using deep learning.

**Frontend:** React + Tailwind CSS → deployed on Vercel  
**Backend:** Python Flask + TensorFlow Hub → deployed on Render / Railway / Heroku

---

## Project Structure

```
nst-full/
├── backend/
│   ├── app.py              # Flask API server
│   ├── style_transfer.py   # TF-Hub model logic
│   ├── requirements.txt
│   ├── Procfile            # For Render/Heroku
│   ├── .env.example        # Copy to .env for local dev
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── index.css
│   │   └── components/
│   │       └── UploadForm.jsx
│   ├── .env.development    # Points to localhost:5000
│   ├── .env.production     # Points to deployed backend
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

---

## Local Development

### 1 — Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file and edit if needed
cp .env.example .env

# Run Flask dev server
python app.py
# → http://localhost:5000
```

> First run downloads the TF-Hub model (~100 MB). Subsequent runs use the cache.

### 2 — Frontend

```bash
cd frontend

npm install
npm start
# → http://localhost:3000
```

The `.env.development` file already points the frontend at `http://localhost:5000`.

---

## Deployment

### Backend → Render (recommended free tier)

1. Push `backend/` to its own GitHub repo (or a subdirectory).
2. Create a new **Web Service** on [render.com](https://render.com).
3. Set **Build command:** `pip install -r requirements.txt`
4. Set **Start command:** `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120 --workers 1`
5. Add environment variable:
   - `ALLOWED_ORIGINS` = `https://your-frontend.vercel.app`

### Frontend → Vercel

1. Push `frontend/` to its own GitHub repo (or a subdirectory).
2. Import the repo on [vercel.com](https://vercel.com).
3. Add environment variable:
   - `REACT_APP_BACKEND_URL` = `https://your-backend.onrender.com`
4. Deploy — Vercel auto-detects Create React App.

---

## API Reference

| Method | Endpoint   | Description                                        |
|--------|------------|----------------------------------------------------|
| GET    | `/`        | Health check — returns `{ status: "Backend is running" }` |
| GET    | `/health`  | Lightweight health probe                           |
| POST   | `/stylize` | Accepts `content` + `style` files; returns PNG     |

**POST /stylize** form fields:
- `content` — content image (PNG / JPG)
- `style`   — style image (PNG / JPG)

Returns: `image/png` binary response.

---

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | React 18, Tailwind CSS 3, DM Sans + Playfair Display |
| Backend   | Python 3, Flask, Flask-CORS, Gunicorn         |
| ML Model  | Google Magenta Arbitrary Image Stylization (TF-Hub) |
| Infra     | Vercel (frontend), Render (backend)           |

---

## How It Works

1. User uploads a **content image** (their photo) and a **style image** (an artwork).
2. The frontend resizes both to 512 px max before uploading to save bandwidth.
3. The Flask backend feeds them to Google's Magenta model via TensorFlow Hub.
4. The model returns a stylized PIL image, which is streamed back as PNG.
5. The frontend displays the result and offers a one-click download.

---

## License

MIT
