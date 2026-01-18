from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
import dateparser
from dateparser.search import search_dates

# 🔹 Set tesseract path explicitly (important on Windows)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = Flask(__name__)

@app.route("/ocr", methods=["POST"])
def ocr():
    data = request.get_json()

    try:
        # 1️⃣ Read image path
        image_path = data["image_path"].replace("\\", "/")

        # 2️⃣ OCR: Image → Text
        text = pytesseract.image_to_string(Image.open(image_path))

        # 3️⃣ DATE extraction (robust & NLP-like)
        found_dates = search_dates(
            text,
            settings={
                "PREFER_DATES_FROM": "future",
                "RETURN_AS_TIMEZONE_AWARE": False
            }
        )

        extracted_dates = []

        if found_dates:
            for raw, parsed in found_dates:
                extracted_dates.append({
                    "raw": raw,
                    "normalized": parsed.strftime("%Y-%m-%d")
                })

        # 4️⃣ Return result
        return jsonify({
            "text": text,
            "dates": extracted_dates
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(port=8000)
