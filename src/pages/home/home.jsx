import React from "react";
import './home.css';
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate("/breakout");
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">My Little Games</h1>

        <div className="divider"></div>

        <div className="card">
          <h2 className="card-title">BREAKOUT</h2>
          <button className="button" onClick={handleStartGame}>
            START GAME
          </button>
        </div>

        <div className="spacer"></div>

        <footer className="footer">© 2025 My Little Games.</footer>
      </div>
    </div>
  );
}

export default Home;
