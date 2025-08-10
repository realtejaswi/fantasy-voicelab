import React, { useState } from "react";
import "./Login.css";
import titleImage from "./title.png"; // import your title image

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.success) {
        onLoginSuccess();
      }
    } catch {
      setError("Failed to connect to server");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <img src={titleImage} alt="Fantasy VoiceLab Title" className="login-title-image" />
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Email:
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="links">
          <a href="#forgot-password" onClick={(e) => e.preventDefault()}>
            Forgot Password
          </a>
          {" | "}
          <a href="#sign-up" onClick={(e) => e.preventDefault()}>
            Sign Up
          </a>
        </div>
      </form>
    </div>
  );
}
