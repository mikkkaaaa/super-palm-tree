import React, { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaForward } from 'react-icons/fa';
import './breakout.css';

import bg1 from '/assets/video/bg1.mp3';
import bg2 from '/assets/video/bg2.mp3';
import bg3 from '/assets/video/bg3.mp3';

const playlist = [
  { title: '星际旅程', src: bg1 },
  { title: '银河之光', src: bg2 },
  { title: '宇宙漫步', src: bg3 },
];

export default function HudMusicPlayer() {
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // 初始音量50%
  const [expanded, setExpanded] = useState(false);

  // 尝试自动播放 + 用户点击触发播放兜底
  useEffect(() => {
    const tryAutoPlay = () => {
      if (!audioRef.current) return;
      audioRef.current.volume = volume;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // 自动播放失败，绑定用户点击后再播放
          document.addEventListener('click', enableOnClickPlay);
        });
    };

    const enableOnClickPlay = () => {
      if (!audioRef.current) return;
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        document.removeEventListener('click', enableOnClickPlay);
      }).catch(() => {});
    };

    tryAutoPlay();

    return () => {
      document.removeEventListener('click', enableOnClickPlay);
    };
  }, []);

  // 切换歌曲时自动播放
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.load();
    if (isPlaying) {
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrack]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleNext = () => {
    setCurrentTrack((currentTrack + 1) % playlist.length);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) audioRef.current.volume = newVol;
  };

  const toggleExpanded = () => setExpanded(prev => !prev);

  // 点击外部关闭控制器
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expanded && containerRef.current && !containerRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
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
          <button onClick={handlePlayPause} className="btn small-btn" title={isPlaying ? "暂停" : "播放"}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={handleNext} className="btn small-btn" title="下一首">
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

      <audio
        ref={audioRef}
        src={playlist[currentTrack].src}
        onEnded={handleNext}
      />
    </div>
  );
}
