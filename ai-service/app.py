import os
import io
import base64
from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
from dateparser.search import search_dates

# Tesseract location:
#  - On a Linux host (cloud) it's installed on PATH, so we leave it alone.
#  - On Windows (local dev) point to the default install path.
#  - TESSERACT_CMD env var overrides both if set.
tesseract_cmd = os.environ.get("TESSERACT_CMD")
if tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
elif os.name == "nt":
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/ocr", methods=["POST"])
def ocr():
    data = request.get_json(silent=True) or {}

    try:
        # 1️⃣ Load image: prefer raw bytes (works across hosts), fall back to a
        #    local path for same-machine dev.
        if data.get("image_base64"):
            image_bytes = base64.b64decode(data["image_base64"])
            image = Image.open(io.BytesIO(image_bytes))
        elif data.get("image_path"):
            image = Image.open(data["image_path"].replace("\\", "/"))
        else:
            return jsonify({"error": "No image provided (image_base64 or image_path)"}), 400

        # 2️⃣ OCR: Image → Text
        text = pytesseract.image_to_string(image)

        # 3️⃣ DATE extraction (robust & NLP-like)
        found_dates = search_dates(
            text,
            settings={
                "PREFER_DATES_FROM": "future",
                "RETURN_AS_TIMEZONE_AWARE": False,
            },
        )

        extracted_dates = []
        if found_dates:
            for raw, parsed in found_dates:
                extracted_dates.append({
                    "raw": raw,
                    "normalized": parsed.strftime("%Y-%m-%d"),
                })

        # 4️⃣ Return result
        return jsonify({"text": text, "dates": extracted_dates})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
