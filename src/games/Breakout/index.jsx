import React, { useState, useEffect } from 'react';
import StartScreen from './StartScreen';
import LevelSelect from './LevelSelect';
import ReadyGo from './ReadyGo';
import GameScreen from './GameScreen';
import ResultScreen from './ResultScreen';
import './breakout.css';

export default function Breakout() {
  const [screen, setScreen] = useState('start');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [unlockedLevels, setUnlockedLevels] = useState([1]);
  const [lastResult, setLastResult] = useState(null);
  const [lastScore, setLastScore] = useState(0);
  const [lives, setLives] = useState(3);

  const levels = [
    { id: 1, name: 'Level 1', ballSpeed: 2, paddleWidth: 120, rows: 3, lives: 3 },
    { id: 2, name: 'Level 2', ballSpeed: 3, paddleWidth: 100, rows: 4, lives: 3 },
    { id: 3, name: 'Level 3', ballSpeed: 4, paddleWidth: 80, rows: 5, lives: 3 },
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('unlockedLevels'));
    if (saved) setUnlockedLevels(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
  }, [unlockedLevels]);

  const handleStart = () => setScreen('level');

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    setLives(level.lives || 3);
    setLastScore(0);
    setScreen('ready');
  };

  const handleReadyGoFinish = () => setScreen('game');

  const handleGameEnd = (result, score) => {
    setLastResult(result);
    setLastScore(score);
    if (result === 'win' && selectedLevel.id < levels.length) {
      const nextId = selectedLevel.id + 1;
      if (!unlockedLevels.includes(nextId)) {
        setUnlockedLevels([...unlockedLevels, nextId]);
      }
    }
    setScreen('result');
  };

  const handleRestart = () => setScreen('ready');
  const handleReturn = () => setScreen('level');

  const handleNextLevel = () => {
    const nextId = selectedLevel.id + 1;
    const nextLevel = levels.find(lv => lv.id === nextId);
    if (nextLevel) {
      setSelectedLevel(nextLevel);
      setLives(nextLevel.lives || 3);
      setLastScore(0);
      setScreen('ready');
    }
  };

  return (
    <div className="breakout-app">
      {screen === 'start' && <StartScreen onStart={handleStart} />}
      {screen === 'level' &&
        <LevelSelect levels={levels} unlockedLevels={unlockedLevels} onSelect={handleLevelSelect} />}
      {screen === 'ready' &&
        <ReadyGo onFinish={handleReadyGoFinish} audioSrc="/assets/video/readygo.mp3" />}
      {screen === 'game' && selectedLevel &&
        <GameScreen
          level={selectedLevel}
          onGameEnd={handleGameEnd}
          lives={lives}
          setLives={setLives}
          score={lastScore}
          setScore={setLastScore}
        />}
      {screen === 'result' &&
        <ResultScreen
          result={lastResult}
          score={lastScore}
          onRestart={handleRestart}
          onReturn={handleReturn}
          onNextLevel={handleNextLevel}
        />}
    </div>
  );
}
