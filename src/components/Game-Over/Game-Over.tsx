import React from "react";
import { useNavigate } from "react-router-dom";

const GameOver = ({ score = 100 }: any) => {
  const navigate = useNavigate();
  const onReplay = () => {
    navigate("/");
  };

  const onExit = () => {
    navigate("/thankyou");
  };

  return (
    <div className="game-over-container">
      <div className="game-over-card">
        <h1 className="game-over-title">Game Over</h1>
        <p className="game-over-score">
          Your Score: <span>{score}</span>
        </p>
        <div className="game-over-buttons">
          <button className="btn replay-btn" onClick={onReplay}>
            Replay
          </button>
          <button className="btn exit-btn" onClick={onExit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
