from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import torch
from openvoice import se_extractor
from openvoice.api import BaseSpeakerTTS, ToneColorConverter
from datetime import datetime

app = Flask(__name__)
CORS(app)

# -------------------------
# Setup paths and devices
# -------------------------
ckpt_base = 'checkpoints/base_speakers/EN'
ckpt_converter = 'checkpoints/converter'
device = "cuda:0" if torch.cuda.is_available() else "cpu"
output_dir = 'outputs'
os.makedirs(output_dir, exist_ok=True)

# -------------------------
# Load models (once at startup)
# -------------------------
base_speaker_tts = BaseSpeakerTTS(f'{ckpt_base}/config.json', device=device)
base_speaker_tts.load_ckpt(f'{ckpt_base}/checkpoint.pth')

tone_color_converter = ToneColorConverter(f'{ckpt_converter}/config.json', device=device)
tone_color_converter.load_ckpt(f'{ckpt_converter}/checkpoint.pth')

# Load default source speaker embedding
source_se = torch.load(f'{ckpt_base}/en_default_se.pth').to(device)

# -------------------------
# Preload reference speakers
# -------------------------
voices = {
    "peter_griffin": "resources/peter_griffin.mp3",
    "walter_white": "resources/walter_white.mp3",
    "daenerys_targaryaen": "resources/daenerys_targaryaen.mp3",
    "tony_soprano": "resources/tony_soprano.mp3",
    "patrick_bateman": "resources/patrick_bateman.mp3",
    "lois_griffin": "resources/lois_griffin.mp3",
    "arthur_morgan": "resources/arthur_morgan.mp3",
    "rachel_green": "resources/rachel_green.mp3",
    "tyler_durden": "resources/tyler_durden.mp3",
}

# Extract SE embeddings for all voices
voice_embeddings = {}
for name, path in voices.items():
    if os.path.exists(path):
        try:
            se, _ = se_extractor.get_se(path, tone_color_converter, target_dir='processed', vad=True)
            voice_embeddings[name] = se
        except Exception as e:
            print(f"Error loading voice '{name}': {e}")
    else:
        print(f"Warning: Voice file not found: {path}")


# -------------------------
# API Endpoints
# -------------------------
@app.route("/generate", methods=["POST"])
def generate_audio():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request"}), 400

    text = data["text"].strip()
    if not text:
        return jsonify({"error": "Empty text provided"}), 400

    voice_name = data.get("voice", "peter_griffin")  # default voice
    if voice_name not in voice_embeddings:
        return jsonify({"error": f"Invalid voice '{voice_name}'"}), 400

    target_se = voice_embeddings[voice_name].to(device)

    # Generate file names
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    src_path = os.path.join(output_dir, f"tmp_{timestamp}.wav")
    save_path = os.path.join(output_dir, f"output_{timestamp}.wav")

    try:
        # Step 1: Generate speech from text
        base_speaker_tts.tts(
            text,
            src_path,
            speaker='default',
            language='English',
            speed=1.0
        )

        # Step 2: Apply tone color conversion
        tone_color_converter.convert(
            audio_src_path=src_path,
            src_se=source_se,
            tgt_se=target_se,
            output_path=save_path,
            message="@FlaskServer"
        )

        audio_filename = os.path.basename(save_path)
        return jsonify({
            "success": True,
            "audio_url": f"/audio/{audio_filename}"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/audio/<filename>")
def serve_audio(filename):
    return send_from_directory(output_dir, filename)


@app.route("/voices", methods=["GET"])
def list_voices():
    """Returns the list of available voices."""
    return jsonify({"voices": list(voice_embeddings.keys())})

from pymongo import MongoClient
from flask import request

# Setup MongoDB client
mongo_client = MongoClient("mongodb://localhost:27017/")  # Adjust URL as needed
db = mongo_client["Fantasy-VoiceLab"]
users_collection = db["users"]

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # You might want to add email format validation here

    # Store user (no auth, no encryption — for demo only!)
    try:
        user = users_collection.find_one({"email": email})
        if user:
            return jsonify({"error": "Email already registered"}), 400
        
        users_collection.insert_one({"email": email, "password": password})
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
