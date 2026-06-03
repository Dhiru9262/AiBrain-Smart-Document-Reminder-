FROM python:3.11-slim

# System dependency: the Tesseract OCR engine (the pytesseract package only wraps it)
RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8000
EXPOSE 8000

# Production WSGI server. $PORT is injected by the host (Render/Railway).
CMD gunicorn --bind 0.0.0.0:$PORT --timeout 120 app:app
