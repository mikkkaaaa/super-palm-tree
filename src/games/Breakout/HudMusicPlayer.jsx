import React, { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaForward } from 'react-icons/fa';
import './breakout.css';

const playlist = [
  { title: '星际旅程', src: '/assets/video/bg1.mp3' },
  { title: '银河之光', src: '/assets/video/bg2.mp3' },
  { title: '宇宙漫步', src: '/assets/video/bg3.mp3' },
];

export default function HudMusicPlayer() {
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [expanded, setExpanded] = useState(false);

  // 初始播放
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    const nextTrack = (currentTrack + 1) % playlist.length;
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play();
    }, 0);
  };

  const toggleExpanded = () => setExpanded(prev => !prev);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  // ✅ 添加点击页面任意位置关闭面板（点击外部时）
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        expanded &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setExpanded(false);
      }
    };

    // 捕获阶段监听
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [expanded]);

  return (
    <div
      className="hud-item"
      style={{ alignItems: 'flex-start', position: 'relative', zIndex: 20 }}
      ref={containerRef}
    >
      <div
        className="label"
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={toggleExpanded}
        title="点击展开音乐控制器"
      >
        🎵 {playlist[currentTrack].title}
      </div>

      {expanded && (
        <div
          className="music-controls-vertical"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '6px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 0 12px #00ffffaa',
            zIndex: 999,
            width: '42px',
          }}
        >
          <button onClick={handlePlayPause} className="btn small-btn">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={handleNext} className="btn small-btn">
            <FaForward />
          </button>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              width: '28px',
            }}
          >
            <FaVolumeUp style={{ fontSize: '16px', opacity: 0.7 }} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              style={{
                writingMode: 'bt-lr',
                WebkitAppearance: 'slider-vertical',
                height: '72px',
              }}
              title="音量"
            />
          </div>
        </div>
      )}

      <audio ref={audioRef} src={playlist[currentTrack].src} onEnded={handleNext} loop={false} />
    </div>
  );
}
