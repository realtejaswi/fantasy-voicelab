import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './Login';  // Import the Login component
import reportWebVitals from './reportWebVitals';

function Root() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <React.StrictMode>
      {isLoggedIn ? (
        <App />
      ) : (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);

// Keep your reportWebVitals call as is
reportWebVitals();
