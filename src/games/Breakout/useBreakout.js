import { useRef, useCallback, useEffect } from 'react';
import hitAudioSrc from '/assets/video/hit.wav';
import winAudioSrc from '/assets/video/win.wav';
import loseAudioSrc from '/assets/video/lose.wav';

export default function useBreakout(canvasRef, level, callbacks = {}) {
  const {
    onScoreChange = () => {},
    onLivesChange = () => {},
    onGameOver = () => {},
  } = callbacks;

  const state = useRef({
    ctx: null,
    width: 900,
    height: 600,

    ball: {
      x: 450,
      y: 300,
      radius: 10,
      vx: 0,
      vy: 0,
      speed: level.ballSpeed || 2,
    },

    paddle: {
      w: level.paddleWidth || 120,
      h: 15,
      x: 390,
      y: 570,
    },

    bricks: [],
    rows: level.rows || 3,
    cols: 10,
    brickW: 78,
    brickH: 28,

    score: 0,
    lives: 3,
    result: null,

    stars: [],

    isBallMoving: false,

    ballTrail: [], // 拖尾位置数组

    config: {
      speedIncrement: 0.03,
      maxSpeed: 6,
      ballSpeed: level.ballSpeed || 2,
    },
  });

  // 音频实例，只创建一次
  const hitAudio = useRef(new Audio(hitAudioSrc));
  const winAudio = useRef(new Audio(winAudioSrc));
  const loseAudio = useRef(new Audio(loseAudioSrc));

  // 初始化星星背景
  const initStars = () => {
    const stars = [];
    for (let i = 0; i < 130; i++) {
      stars.push({
        x: Math.random() * state.current.width,
        y: Math.random() * state.current.height,
        size: Math.random() * 2 + 0.8,
        speed: (Math.random() - 0.5) * 0.2,
        alpha: Math.random(),
        delta: 0.004 + Math.random() * 0.008,
      });
    }
    return stars;
  };

  // 初始化砖块数组
  const initBricks = () => {
    const bricks = [];
    const offsetX = 40;
    const offsetY = 70;
    for (let r = 0; r < state.current.rows; r++) {
      for (let c = 0; c < state.current.cols; c++) {
        bricks.push({
          x: offsetX + c * (state.current.brickW + 7),
          y: offsetY + r * (state.current.brickH + 7),
          w: state.current.brickW,
          h: state.current.brickH,
          alpha: 1,
          colorHue: 210 - r * 25,
        });
      }
    }
    return bricks;
  };

  // 初始化游戏状态
  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    state.current.ctx = ctx;
    state.current.width = canvas.width;
    state.current.height = canvas.height;

    // 初始球拍居中
    state.current.paddle.x = (state.current.width - state.current.paddle.w) / 2;

    // 初始化砖块和星星
    state.current.bricks = initBricks();
    state.current.stars = initStars();

    // 重置分数、生命和状态
    state.current.score = 0;
    state.current.lives = 3;
    state.current.result = null;
    state.current.isBallMoving = false;

    // 重置拖尾数组
    state.current.ballTrail = [];

    // 球在球拍正上方，等待发射
    const b = state.current.ball;
    const p = state.current.paddle;
    b.x = p.x + p.w / 2;
    b.y = p.y - b.radius;
    b.vx = 0;
    b.vy = 0;
    b.speed = state.current.config.ballSpeed;

    // 通知外部更新分数和生命
    onScoreChange(0);
    onLivesChange(3);
  }, [canvasRef, onLivesChange, onScoreChange]);

  // 鼠标移动控制球拍，球未发射时球跟随球拍移动
  const onMouseMove = useCallback((e) => {
    if (!state.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    const p = state.current.paddle;
    p.x = Math.min(Math.max(mouseX - p.w / 2, 0), state.current.width - p.w);

    if (!state.current.isBallMoving) {
      const b = state.current.ball;
      b.x = p.x + p.w / 2;
      b.y = p.y - b.radius;
    }
  }, [canvasRef]);

  // 点击画布发射球
  const onCanvasClick = useCallback(() => {
    if (!state.current.isBallMoving && state.current.lives > 0) {
      state.current.isBallMoving = true;
      state.current.ball.vx = Math.random() > 0.5 ? 1 : -1;
      state.current.ball.vy = -1;
    }
  }, []);

  // 游戏主循环，更新物体状态
  const update = useCallback(() => {
    const s = state.current;

    // 星星移动闪烁
    s.stars.forEach(star => {
      star.x += star.speed;
      if (star.x > s.width) star.x = 0;
      if (star.x < 0) star.x = s.width;

      star.alpha += star.delta;
      if (star.alpha > 1) star.alpha = 1;
      if (star.alpha < 0.2) star.alpha = 0.2;
      if (star.alpha === 1 || star.alpha === 0.2) star.delta = -star.delta;
    });

    // 球未发射不更新位置
    if (!s.isBallMoving) return;

    // 球运动
    const b = s.ball;
    b.x += b.vx * b.speed;
    b.y += b.vy * b.speed;

    // 记录拖尾点位置
    s.ballTrail.push({ x: b.x, y: b.y });
    // 限制拖尾长度，保留30个点
    if (s.ballTrail.length > 30) {
      s.ballTrail.shift();
    }

    // 边界碰撞检测与音效
    if (b.x - b.radius < 0) {
      b.x = b.radius;
      b.vx = -b.vx;
      hitAudio.current.currentTime = 0;
      hitAudio.current.play();
    }
    if (b.x + b.radius > s.width) {
      b.x = s.width - b.radius;
      b.vx = -b.vx;
      hitAudio.current.currentTime = 0;
      hitAudio.current.play();
    }
    if (b.y - b.radius < 0) {
      b.y = b.radius;
      b.vy = -b.vy;
      hitAudio.current.currentTime = 0;
      hitAudio.current.play();
    }

    // 球拍碰撞及音效
    const p = s.paddle;
    if (
      b.x > p.x &&
      b.x < p.x + p.w &&
      b.y + b.radius > p.y &&
      b.y - b.radius < p.y + p.h
    ) {
      b.vy = -Math.abs(b.vy);
      const hitPos = b.x - (p.x + p.w / 2);
      b.vx = hitPos / (p.w / 2);
      b.speed = Math.min(b.speed + s.config.speedIncrement, s.config.maxSpeed);

      hitAudio.current.currentTime = 0;
      hitAudio.current.play();
    }

    // 砖块碰撞及颜色变浅和碰撞音效
    s.bricks = s.bricks.filter(br => {
      if (br.alpha <= 0) return false;

      const hit =
        b.x + b.radius > br.x &&
        b.x - b.radius < br.x + br.w &&
        b.y + b.radius > br.y &&
        b.y - b.radius < br.y + br.h;

      if (hit) {
        b.vy = -b.vy;
        br.alpha -= 0.25;
        if (br.alpha < 0) br.alpha = 0;

        s.score += 10;
        onScoreChange(s.score);

        hitAudio.current.currentTime = 0;
        hitAudio.current.play();

        return br.alpha > 0;
      }
      return true;
    });

    // 球落底，失去生命或游戏结束
    if (b.y - b.radius > s.height) {
      s.lives--;
      onLivesChange(s.lives);

      if (s.lives <= 0) {
        s.result = 'lose';
        onGameOver('lose');

        loseAudio.current.currentTime = 0;
        loseAudio.current.play();
      } else {
        // 重置球，暂停运动
        s.isBallMoving = false;
        b.x = p.x + p.w / 2;
        b.y = p.y - b.radius;
        b.speed = s.config.ballSpeed;
        b.vx = 0;
        b.vy = 0;

        // 清空拖尾，避免旧拖尾残留
        s.ballTrail = [];
      }
    }

    // 判断胜利（所有砖块消除）
    if (s.bricks.length === 0 && !s.result) {
      s.result = 'win';
      onGameOver('win');

      winAudio.current.currentTime = 0;
      winAudio.current.play();
    }
  }, [onScoreChange, onLivesChange, onGameOver]);

  // 画面绘制
  const draw = useCallback(() => {
    const s = state.current;
    const ctx = s.ctx;

    // 清屏
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, s.width, s.height);

    // 画星星背景
    s.stars.forEach(star => {
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2);
      gradient.addColorStop(0, `rgba(255,255,255,${star.alpha})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 画拖尾（越旧越透明越小）
    for (let i = 0; i < s.ballTrail.length; i++) {
      const pos = s.ballTrail[i];
      const alpha = ((i + 1) / s.ballTrail.length) * 0.6; // 透明度渐变
      const radius = s.ball.radius * (0.6 + 0.4 * (i / s.ballTrail.length)); // 大小渐变
      const gradient = ctx.createRadialGradient(pos.x, pos.y, radius * 0.2, pos.x, pos.y, radius);
      gradient.addColorStop(0, `rgba(170, 255, 255, ${alpha})`);
      gradient.addColorStop(1, `rgba(0, 136, 136, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 画砖块
    s.bricks.forEach(br => {
      const alpha = br.alpha;
      const lightness = 60 + (1 - alpha) * 40;
      const grad = ctx.createLinearGradient(br.x, br.y, br.x, br.y + br.h);
      grad.addColorStop(0, `hsla(200, 90%, ${lightness}%, ${alpha * 0.9})`);
      grad.addColorStop(1, `hsla(200, 70%, ${lightness - 10}%, ${alpha * 0.7})`);

      ctx.fillStyle = grad;
      ctx.fillRect(br.x, br.y, br.w, br.h);

      ctx.shadowColor = `rgba(0, 255, 255, ${alpha * 0.6})`;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(br.x, br.y, br.w, br.h);
      ctx.shadowBlur = 0;
    });

    // 画球本体
    const b = s.ball;
    const ballGradient = ctx.createRadialGradient(b.x, b.y, b.radius * 0.2, b.x, b.y, b.radius);
    ballGradient.addColorStop(0, '#aaffff');
    ballGradient.addColorStop(1, '#008888');
    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();

    // 画球拍
    const p = s.paddle;
    const paddleGradient = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y);
    paddleGradient.addColorStop(0, '#00ffff');
    paddleGradient.addColorStop(1, '#006666');
    ctx.fillStyle = paddleGradient;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.shadowBlur = 0;
  }, []);

  // 游戏结束状态检测
  const isGameOver = useCallback(() => state.current.result !== null, []);
  const getResult = useCallback(() => state.current.result, []);
  const getScore = useCallback(() => state.current.score, []);
  const getLives = useCallback(() => state.current.lives, []);

  // 绑定鼠标事件监听
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onCanvasClick);
    return () => {
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onCanvasClick);
    };
  }, [onMouseMove, onCanvasClick, canvasRef]);

  return {
    init,
    update,
    draw,
    isGameOver,
    getResult,
    getScore,
    getLives,
  };
}
