import React, { useEffect, useState } from 'react';

export default function ReadyGo({ onFinish, audioSrc }) {
  const [text, setText] = useState('READY');

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.play();

    const timer1 = setTimeout(() => setText('GO!'), 1500);
    const timer2 = setTimeout(() => onFinish(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      audio.pause();
    };
  }, [audioSrc, onFinish]);

  return (
    <div className="readygo-screen">
      <h1 className="readygo-text">{text}</h1>
    </div>
  );
}
