import React, { useState } from "react";
import "./App.css";
import titleImage from "./title.png";

// Import character images
import peterImage from "./peter_griffin.png";
import walterImage from "./walter_white.png";
import daenerysImage from "./daenerys_targaryaen.png";
import tonyImage from "./tony_soprano.png";
import patrickImage from "./patrick_bateman.png";
import loisImage from "./lois_griffin.png";
import arthurImage from "./arthur_morgan.png";
import rachelImage from "./rachel_green.png";
import tylerImage from "./tyler_durden.png";

function App() {
  const [textInputs, setTextInputs] = useState({});
  const [audioUrls, setAudioUrls] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [errors, setErrors] = useState({});

  // Character list
  const characters = [
    { name: "Peter Griffin from Family Guy", image: peterImage, voice: "peter_griffin" },
    { name: "Walter White from Breaking Bad", image: walterImage, voice: "walter_white" },
    { name: "Daenerys Targaryen from Game of Thrones", image: daenerysImage, voice: "daenerys_targaryaen" },
    { name: "Tony Soprano from The Sopranos", image: tonyImage, voice: "tony_soprano" },
    { name: "Patrick Bateman from American Psycho", image: patrickImage, voice: "patrick_bateman" },
    { name: "Lois Griffin from Family Guy", image: loisImage, voice: "lois_griffin" },
    { name: "Arthur Morgan from Red Dead Redemption II", image: arthurImage, voice: "arthur_morgan" },
    { name: "Rachel Green from Friends", image: rachelImage, voice: "rachel_green" },
    { name: "Tyler Durden from **** ****", image: tylerImage, voice: "tyler_durden" },
  ];

  const handleGenerate = async (charVoice) => {
    const text = textInputs[charVoice] || "";

    if (!text.trim()) {
      setErrors((prev) => ({ ...prev, [charVoice]: "Please enter some text!" }));
      return;
    }

    setErrors((prev) => ({ ...prev, [charVoice]: null }));
    setLoadingStates((prev) => ({ ...prev, [charVoice]: true }));
    setAudioUrls((prev) => ({ ...prev, [charVoice]: null }));

    try {
      const res = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: charVoice }),
      });

      const data = await res.json();

      if (data.error) {
        setErrors((prev) => ({ ...prev, [charVoice]: data.error }));
      } else if (data.audio_url) {
        setAudioUrls((prev) => ({
          ...prev,
          [charVoice]: `http://localhost:5000${data.audio_url}`,
        }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        [charVoice]: "Failed to connect to server.",
      }));
    }

    setLoadingStates((prev) => ({ ...prev, [charVoice]: false }));
  };

  return (
    <div className="app-container">
      {/* Title */}
      <header className="title-header">
        <img
          src={titleImage}
          alt="Fantasy VoiceLab Title"
          className="title-image"
        />
      </header>

      {/* Character cards */}
      <main className="main-layout">
        {characters.map((char) => (
          <div key={char.voice} className="character-card">
            <img src={char.image} alt={char.name} className="character-image" />
            <h2 className="character-name">{char.name}</h2>
            <input
              type="text"
              placeholder="Enter text..."
              className="text-input"
              value={textInputs[char.voice] || ""}
              onChange={(e) =>
                setTextInputs((prev) => ({
                  ...prev,
                  [char.voice]: e.target.value,
                }))
              }
            />
            <button
              className="generate-btn"
              onClick={() => handleGenerate(char.voice)}
              disabled={loadingStates[char.voice]}
            >
              {loadingStates[char.voice] ? "Generating..." : "Generate Voice"}
            </button>

            {errors[char.voice] && (
              <p className="error-message">{errors[char.voice]}</p>
            )}

            {audioUrls[char.voice] && (
              <audio
                controls
                autoPlay
                style={{ marginTop: "15px", width: "100%" }}
              >
                <source src={audioUrls[char.voice]} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
