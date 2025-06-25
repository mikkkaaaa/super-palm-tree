import React, { useEffect, useRef, useState } from 'react';
import useBreakout from './useBreakout';
import HudMusicPlayer from './HudMusicPlayer';

export default function GameScreen({ level, onGameEnd, lives, setLives, score, setScore }) {
  const canvasRef = useRef();
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);

  const {
    init,
    update,
    draw,
    isGameOver,
    getResult,
  } = useBreakout(canvasRef, level, {
    onScoreChange: setScore,
    onLivesChange: setLives,
    onGameOver: (res) => {
      setGameOver(true);
      setResult(res);
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (gameOver) {
      onGameEnd(result, score);
      return;
    }
    let anim;
    const loop = () => {
      update();
      draw();
      if (isGameOver()) {
        setGameOver(true);
        setResult(getResult());
      } else {
        anim = requestAnimationFrame(loop);
      }
    };
    anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
  }, [update, draw, isGameOver, getResult, gameOver, onGameEnd, result, score]);

  return (
    <div className="game-screen-container">
      {/* 顶部 HUD */}
      <div className="hud-container">
        {/* 音乐播放器靠左 */}
        <HudMusicPlayer />

        {/* 分数和生命值居中显示 */}
        <div className="hud-item">
          <div className="label">SCORE</div>
          <div className="value">{score}</div>
        </div>
        <div className="hud-item">
          <div className="label">LIVES</div>
          <div className="value">{lives}</div>
        </div>
      </div>

      {/* 游戏画布 */}
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        style={{ cursor: 'pointer' }}
        title="Move mouse to move paddle, click to launch ball"
      />
    </div>
  );
}
