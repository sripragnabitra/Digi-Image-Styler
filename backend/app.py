# backend/app.py
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import io
import os
import traceback
from style_transfer import stylize_bytes

app = Flask(__name__)

# Read allowed origins from env so it works for local dev + any deployment
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000"
).split(",")

CORS(app, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
    }
})

# ── routes ──────────────────────────────────────────────

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Backend is running", "version": "1.0.0"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/stylize", methods=["POST"])
def stylize():
    try:
        if "content" not in request.files or "style" not in request.files:
            return jsonify({
                "error": "Missing file(s). Please upload both `content` and `style`."
            }), 400

        content_bytes = request.files["content"].read()
        style_bytes   = request.files["style"].read()

        if not content_bytes or not style_bytes:
            return jsonify({"error": "One or both uploaded files are empty."}), 400

        print("Files received — running style transfer...")
        output_image = stylize_bytes(content_bytes, style_bytes)  # → PIL Image

        img_io = io.BytesIO()
        output_image.save(img_io, format="PNG")
        img_io.seek(0)

        print("Stylization complete — sending response.")
        return send_file(img_io, mimetype="image/png")

    except ValueError as e:
        return jsonify({"error": str(e)}), 422
    except Exception as e:
        tb = traceback.format_exc()
        print("Error during /stylize:", str(e))
        print(tb)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
