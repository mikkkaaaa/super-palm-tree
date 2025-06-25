import React from 'react';

export default function StartScreen({ onStart }) {
  return (
    <div className="start-screen">
      <h1>Breakout Galaxy</h1>
      <button className="btn" onClick={onStart}>START</button>
    </div>
  );
}
