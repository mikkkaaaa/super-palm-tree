import React from 'react';

export default function ResultScreen({ result, score, onRestart, onReturn, onNextLevel }) {
  return (
    <div className="result-screen">
      <h1>{result === 'win' ? '🎉 YOU WIN!' : '💥 YOU LOSE!'}</h1>
      <p>Score: {score}</p>
      <div className="result-buttons">
        {result === 'win' ? (
          <>
            <button className="btn" onClick={onNextLevel}>Next Level</button>
            <button className="btn" onClick={onReturn}>Return</button>
          </>
        ) : (
          <>
            <button className="btn" onClick={onRestart}>Restart</button>
            <button className="btn" onClick={onReturn}>Return</button>
          </>
        )}
      </div>
    </div>
  );
}
