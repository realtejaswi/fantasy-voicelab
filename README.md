# Fantasy VoiceLab

Fantasy VoiceLab is a web application that allows users to generate speech audio clips using character-specific voices from popular fictional characters. 
The application features a **React frontend** and a **Flask backend** utilizing deep learning models for text-to-speech synthesis and voice style transfer. 
The backend is built upon the logic and concepts from the repository [OpenVoice](https://github.com/myshell-ai/OpenVoice) which I cloned and adapted to develop a custom backend

---

## Table of Contents
- [Frontend](#frontend)
- [Backend](#backend)
- [Usage](#usage)
- [Requirements](#requirements)

---

## Frontend

The frontend is built with **React** and provides an interactive UI for users to input text, select fictional character voices, and generate speech audio dynamically.

### Core Components and Features:

- **App.js**: Main React component managing the UI and application state.
  
  - **State Management:**
    - `textInputs`: Stores input text keyed by character voice name.
    - `audioUrls`: Stores generated audio URLs keyed by character voice name.
    - `loadingStates`: Tracks loading status for each character's audio generation.
    - `errors`: Captures and displays errors related to input or server response.

  - **Character List:**
    - An array defining fictional characters with their display name, image, and backend voice ID.
    - Includes characters like Peter Griffin, Walter White, Daenerys Targaryen, and others.

  - **Generate Voice Workflow:**
    - Validates user input for each character card.
    - Sends a POST request to the Flask backend `/generate` endpoint with text and voice parameters.
    - Handles asynchronous response to either display generated audio or show error messages.
    - Displays an HTML5 audio player to play the generated audio automatically.

  - **Layout and Styling:**
    - Uses CSS Grid (`.main-layout`) to arrange character cards in a 3-column responsive grid.
    - Each character card displays an image, name, input box, generate button, error messages, and audio player.
    - Styling handled in `App.css` for a clean and modern UI with focus effects and transitions.

---

## Backend

The backend is a **Flask** API server that handles text-to-speech generation and voice conversion using PyTorch models, alongside managing user login with MongoDB.

### Core Functionalities:

- **Model Loading and Setup:**

  - Loads pretrained models for:
    - `BaseSpeakerTTS`: Text-to-speech synthesis for a base speaker voice.
    - `ToneColorConverter`: Converts base voice audio to target voice style.

  - Loads default speaker embedding and extracts speaker embeddings from provided reference audio files for multiple character voices.

  - Device management for GPU acceleration (`cuda`) if available, else falls back to CPU.

- **API Endpoints:**

  - `/generate` (POST):
    - Accepts JSON with `text` and `voice`.
    - Generates speech audio from text using the base TTS model.
    - Converts the generated audio into the target character's voice style using tone color conversion.
    - Saves audio to disk and returns a URL for the frontend to stream.
    - Handles errors and returns meaningful JSON responses.

  - `/audio/<filename>` (GET):
    - Serves generated audio files from the server output directory.

  - `/voices` (GET):
    - Returns the list of available voice keys supported by the backend.

  - `/login` (POST):
    - Accepts user credentials (`email`, `password`) in JSON.
    - Stores new user data in MongoDB (no encryption or authentication logic included).
    - Returns success or error responses accordingly.

- **MongoDB Integration:**
  - Connects to a local MongoDB instance.
  - Stores user credentials in a collection named `users` within the `Fantasy-VoiceLab` database.

- **File Management:**
  - Uses timestamp-based unique filenames to avoid conflicts.
  - Organizes outputs and processed embeddings in dedicated folders.

---

## Usage

1. **Backend**:  
   - Install dependencies (Flask, torch, pymongo, etc.).  
   - Ensure MongoDB is running locally.  
   - Run `app.py` to start the Flask server.

2. **Frontend**:  
   - Install React dependencies (`npm install`).  
   - Run `npm start` to launch the React development server.  
   - Interact with the UI to input text, select character voices, and generate audio.

---

## Requirements

- Python 3.8+
- PyTorch with CUDA support 
- Flask
- Flask-CORS
- pymongo
- MongoDB (local)
- Node.js and npm for frontend


---

## 📺 Website Demonstration
