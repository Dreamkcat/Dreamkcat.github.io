// 设备检测
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 游戏配置
const config = {
  gridSize: 20,
  canvasWidth: 400,
  canvasHeight: 400,
  breadSpeed: 5, // 初始速度
  taffSpeed: 6,  // 初始速度比面包快
  taffSize: 1,   // 初始大小
  fragmentDropRate: 1, // 每步掉落碎片数
  maxFragments: 50, // 最大碎片数
  treasureSpawnRate: 0.02, // 宝藏生成概率
  stepCountForSpeedDecrease: 10, // 每10步速度减少
  fragmentLifetime: 3000, // 碎片生命周期（毫秒）
  propMessageDuration: 500, // 道具消息持续时间（毫秒）
  taffSpeedDecreasePerFragment: 0.05, // 每吃一个碎片速度减少5%
  taffSpeedDecreaseMax: 0.5, // 速度最多减少50%
  maxTreasures: 3 // 最多同时出现3个道具
};

// 游戏状态
const gameState = {
  bread: {
    x: 10,
    y: 10,
    direction: 'right',
    speed: config.breadSpeed,
    steps: 0,
    hasEdge: true, // 是否有边
    isCombatMode: false // 是否为战斗形态
  },
  taff: {
    x: 1,
    y: 1,
    body: [
      { x: 1, y: 1 }, // 头部
      { x: 0, y: 1 }, // 身体
      { x: -1, y: 1 } // 尾巴
    ],
    direction: 'right',
    speed: config.taffSpeed, // 当前速度
    size: config.taffSize, // 当前大小
    collisionMultiplier: 1 // 碰撞检测倍数
  },
  smallTaff: {
    x: 18, // 小Taff初始位置
    y: 18,
    direction: 'left',
    speed: config.taffSpeed * 0.24, // 小Taff速度减少80%后再快20%
    size: 0.625, // 小Taff大小为大Taff的62.5%（增加25%）
    isInvisible: false, // 是否隐身
    invisibleTimer: 0, // 隐身计时器
    invisibleMode: false, // 是否启用特殊隐身模式
    invisibleModeTimer: 0, // 隐身模式总计时器
    invisiblePhase: 'fadeIn', // 当前阶段：fadeIn, visible, fadeOut, hidden
    invisiblePhaseTimer: 0, // 当前阶段计时器
    opacity: 1 // 当前不透明度
  },
  difficulty: 'normal', // normal, stealth 或 nightmare
  fragments: [],
  treasures: [],
  score: 0,
  gameOver: false,
  message: '',
  propCount: 0, // 吃到的道具数量
  gameWin: false, // 游戏胜利状态
  showCounterProp: false // 是否显示反击道具
};

// 音效对象
const sounds = {
  eatProp: new Audio('audio/吃道具.mp3'),
  taffEat: new Audio('audio/好吃好吃.wav'),
  taffEat2: new Audio('audio/豪士.wav'),
  gameOver: new Audio('audio/taff有小面包吃.wav'),
  gameWin: new Audio('audio/你过关，除草几.wav'),
  follow: new Audio('audio/关注匡匡喵.wav'),
  nightmareIntro: new Audio('audio/taff才不是小恶魔呢.wav'),
  nightmareWin: new Audio('audio/噩梦过关.wav'),
  combatMode: new Audio('audio/我的刀盾.MP3'),
  notTang: new Audio('audio/才不唐呢.wav'),
  likeYou: new Audio('audio/最喜欢你啦.wav')
};

// 视频元素
const winVideo = document.createElement('video');
winVideo.src = 'success.mp4';
winVideo.controls = false;
winVideo.style.position = 'fixed';
winVideo.style.top = '0';
winVideo.style.left = '0';
winVideo.style.width = '100%';
winVideo.style.height = '100%';
winVideo.style.zIndex = '2000';
winVideo.style.display = 'none';

// 宝藏类型
const treasureTypes = [
  { type: 'edge-less', name: '无边设计', effect: 'removeEdge', value: 1, message: '豪士豪士 面包脱离边边' },
  { type: 'qq-egg', name: 'qq蛋', effect: 'speed', value: 1.5, message: 'qq 加速 50%' },
  { type: 'counter', name: '反击道具', effect: 'combatMode', value: 1, message: '战斗形态激活！' }
];

// 获取DOM元素
const mainMenuBgm = document.getElementById('mainMenuBgm');
const gameBgm = document.getElementById('gameBgm');
const nightmareBgm = document.getElementById('nightmareBgm');
const nightmareIntro = document.getElementById('nightmareIntro');
const nightmareWin = document.getElementById('nightmareWin');
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const gameOverScreen = document.getElementById('game-over-screen');
const gameWinScreen = document.getElementById('game-win-screen');
const tutorialScreen = document.getElementById('tutorial-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const startButton = document.getElementById('start-btn');
const tutorialButton = document.getElementById('tutorial-btn');
const exitButton = document.getElementById('exit-btn');
const backToMenuButton = document.getElementById('back-to-menu-btn');
const normalButton = document.getElementById('normal-btn');
const stealthButton = document.getElementById('stealth-btn');
const backFromDifficultyButton = document.getElementById('back-from-difficulty-btn');
const restartButton = document.getElementById('restart-btn');
const backButton = document.getElementById('back-btn');
const restartButtonGameOver = document.getElementById('restart-btn-game-over');
const backButtonGameOver = document.getElementById('back-btn-game-over');
const restartButtonGameWin = document.getElementById('restart-btn-game-win');
const backButtonGameWin = document.getElementById('back-btn-game-win');
const mobileControls = document.getElementById('mobile-controls');
const upButton = document.getElementById('up-btn');
const downButton = document.getElementById('down-btn');
const leftButton = document.getElementById('left-btn');
const rightButton = document.getElementById('right-btn');
const authorName = document.getElementById('author-name');

// 获取Canvas元素和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 加载Taff蛇的图片
const taffHeadImg = new Image();
taffHeadImg.src = 'img/头.png';

const taffBodyImg = new Image();
taffBodyImg.src = 'img/身子.png';

const taffTailImg = new Image();
taffTailImg.src = 'img/尾巴.png';

// 加载面包相关图片
const breadWithEdgeImg = new Image();
breadWithEdgeImg.src = 'img/有边面包.png';

const breadWithoutEdgeImg = new Image();
breadWithoutEdgeImg.src = 'img/去边面包.png';

const breadCombatImg = new Image();
breadCombatImg.src = 'img/反击面包.png';

const breadCrumbImg = new Image();
breadCrumbImg.src = 'img/面包边.png';

// 加载反击道具图片
const counterPropImg = new Image();
counterPropImg.src = 'img/反击道具.webp';

// DOM元素
const scoreElement = document.getElementById('score');
const breadSpeedElement = document.getElementById('bread-speed');
const taffSizeElement = document.getElementById('taff-size');
const gameMessageElement = document.getElementById('game-message');

// 键盘控制
const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

// 初始化游戏
function initGame() {
  // 重置游戏状态
  gameState.bread = {
    x: 10,
    y: 10,
    direction: 'right',
    speed: config.breadSpeed,
    steps: 0,
    hasEdge: true, // 重置为有边面包
    isCombatMode: false // 重置为非战斗形态
  };
  gameState.taff = {
    x: 1,
    y: 1,
    body: [
      { x: 1, y: 1 }, // 头部
      { x: 0, y: 1 }, // 身体
      { x: -1, y: 1 } // 尾巴
    ],
    direction: 'right',
    speed: config.taffSpeed, // 重置为初始速度
    size: config.taffSize, // 重置为初始大小
    collisionMultiplier: 1 // 重置碰撞检测倍数
  };
  // 重置小Taff状态
  gameState.smallTaff = {
    x: 18, // 小Taff初始位置
    y: 18,
    direction: 'left',
    speed: config.taffSpeed * 0.24, // 小Taff速度减少80%后再快20%
    size: 0.625, // 小Taff大小为大Taff的62.5%（增加25%）
    isInvisible: false, // 是否隐身
    invisibleTimer: 0, // 隐身计时器
    invisibleMode: false, // 是否启用特殊隐身模式
    invisibleModeTimer: 0, // 隐身模式总计时器
    invisiblePhase: 'fadeIn', // 当前阶段：fadeIn, visible, fadeOut, hidden
    invisiblePhaseTimer: 0, // 当前阶段计时器
    opacity: 1 // 当前不透明度
  };
  gameState.fragments = [];
  gameState.treasures = [];
  gameState.score = 0;
  gameState.gameOver = false;
  gameState.message = '';
  gameState.propCount = 0; // 重置道具计数
  gameState.gameWin = false; // 重置游戏胜利状态
  gameState.showCounterProp = false; // 重置反击道具显示状态

  // 重置配置
  config.fragmentDropRate = 1; // 重置碎片掉落率

  // 隐藏游戏结束和胜利界面
  gameOverScreen.classList.add('hidden');
  gameWinScreen.classList.add('hidden');

  // 根据难度选择播放对应的BGM
  if (gameState.difficulty === 'nightmare') {
    // 恶梦模式播放恶梦BGM
    gameBgm.pause();
    gameBgm.currentTime = 0;
    nightmareBgm.play().catch(e => {
      console.log('恶梦BGM播放失败:', e);
    });
  } else {
    // 其他模式播放普通游戏BGM
    nightmareBgm.pause();
    nightmareBgm.currentTime = 0;
    gameBgm.play().catch(e => {
      console.log('游戏BGM播放失败:', e);
    });
  }

  // 更新UI
  updateUI();
  gameMessageElement.textContent = '';

  // 开始游戏循环
  gameLoop();
}

// 更新UI
function updateUI() {
  scoreElement.textContent = gameState.score;
  breadSpeedElement.textContent = `${Math.round(gameState.bread.speed / config.breadSpeed * 100)}%`;
  taffSizeElement.textContent = `${gameState.taff.body.length}`;
}

// 绘制游戏
function drawGame() {
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制网格
  ctx.strokeStyle = '#ccc';
  for (let i = 0; i < canvas.width; i += config.gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i < canvas.height; i += config.gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // 绘制碎片（面包边）
  const now = Date.now();
  gameState.fragments.forEach(fragment => {
    // 计算不透明度（随着时间逐渐减少）
    const age = now - fragment.timestamp;
    const opacity = 1 - (age / config.fragmentLifetime);

    // 绘制碎片，设置不透明度
    ctx.globalAlpha = opacity;
    ctx.drawImage(breadCrumbImg, fragment.x * config.gridSize, fragment.y * config.gridSize, config.gridSize, config.gridSize);
  });
  // 重置不透明度
  ctx.globalAlpha = 1;

  // 绘制宝藏
  gameState.treasures.forEach(treasure => {
    if (treasure.type === 'edge-less') {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(treasure.x * config.gridSize, treasure.y * config.gridSize, config.gridSize, config.gridSize);
    } else if (treasure.type === 'qq-egg') {
      ctx.fillStyle = '#4ecdc4';
      ctx.fillRect(treasure.x * config.gridSize, treasure.y * config.gridSize, config.gridSize, config.gridSize);
    } else if (treasure.type === 'counter') {
      // 绘制反击道具图标
      ctx.drawImage(counterPropImg, treasure.x * config.gridSize, treasure.y * config.gridSize, config.gridSize, config.gridSize);
    }
  });

  // 绘制面包
  let breadImg;
  if (gameState.bread.isCombatMode) {
    breadImg = breadCombatImg;
  } else {
    breadImg = gameState.bread.hasEdge ? breadWithEdgeImg : breadWithoutEdgeImg;
  }
  ctx.drawImage(breadImg, gameState.bread.x * config.gridSize, gameState.bread.y * config.gridSize, config.gridSize, config.gridSize);

  // 绘制Taff蛇
  if (gameState.difficulty === 'normal' || gameState.difficulty === 'nightmare') {
    const taffSize = config.gridSize * gameState.taff.size;

    // 绘制身体
    for (let i = 1; i < gameState.taff.body.length - 1; i++) {
      const segment = gameState.taff.body[i];
      const x = segment.x * config.gridSize + (config.gridSize - taffSize) / 2;
      const y = segment.y * config.gridSize + (config.gridSize - taffSize) / 2;
      ctx.drawImage(taffBodyImg, x, y, taffSize, taffSize);
    }

    // 绘制尾巴
    if (gameState.taff.body.length > 1) {
      const tail = gameState.taff.body[gameState.taff.body.length - 1];
      const x = tail.x * config.gridSize + (config.gridSize - taffSize) / 2;
      const y = tail.y * config.gridSize + (config.gridSize - taffSize) / 2;
      ctx.drawImage(taffTailImg, x, y, taffSize, taffSize);
    }

    // 绘制头部
    const head = gameState.taff.body[0];
    const headX = head.x * config.gridSize + (config.gridSize - taffSize) / 2;
    const headY = head.y * config.gridSize + (config.gridSize - taffSize) / 2;
    ctx.drawImage(taffHeadImg, headX, headY, taffSize, taffSize);
  }

  // 绘制小Taff（恶梦模式）
  if (gameState.difficulty === 'nightmare' && !gameState.smallTaff.isInvisible) {
    const smallTaffSize = config.gridSize * gameState.smallTaff.size;
    const smallTaffX = gameState.smallTaff.x * config.gridSize + (config.gridSize - smallTaffSize) / 2;
    const smallTaffY = gameState.smallTaff.y * config.gridSize + (config.gridSize - smallTaffSize) / 2;

    // 如果启用了特殊隐身模式，使用不透明度
    if (gameState.smallTaff.invisibleMode) {
      ctx.globalAlpha = gameState.smallTaff.opacity;
    }

    ctx.drawImage(taffHeadImg, smallTaffX, smallTaffY, smallTaffSize, smallTaffSize);

    // 重置不透明度
    if (gameState.smallTaff.invisibleMode) {
      ctx.globalAlpha = 1;
    }
  }
}

// 处理键盘输入
function handleKeyDown(e) {
  switch (e.key) {
    case 'w':
    case 'ArrowUp':
      keys.up = true;
      break;
    case 's':
    case 'ArrowDown':
      keys.down = true;
      break;
    case 'a':
    case 'ArrowLeft':
      keys.left = true;
      break;
    case 'd':
    case 'ArrowRight':
      keys.right = true;
      break;
  }
}

function handleKeyUp(e) {
  switch (e.key) {
    case 'w':
    case 'ArrowUp':
      keys.up = false;
      break;
    case 's':
    case 'ArrowDown':
      keys.down = false;
      break;
    case 'a':
    case 'ArrowLeft':
      keys.left = false;
      break;
    case 'd':
    case 'ArrowRight':
      keys.right = false;
      break;
  }
}

// 更新面包位置
function updateBread() {
  // 根据键盘输入更新方向
  if (keys.up && gameState.bread.direction !== 'down') {
    gameState.bread.direction = 'up';
  } else if (keys.down && gameState.bread.direction !== 'up') {
    gameState.bread.direction = 'down';
  } else if (keys.left && gameState.bread.direction !== 'right') {
    gameState.bread.direction = 'left';
  } else if (keys.right && gameState.bread.direction !== 'left') {
    gameState.bread.direction = 'right';
  }

  // 移动面包
  switch (gameState.bread.direction) {
    case 'up':
      gameState.bread.y = Math.max(0, gameState.bread.y - 1);
      break;
    case 'down':
      gameState.bread.y = Math.min((canvas.height / config.gridSize) - 1, gameState.bread.y + 1);
      break;
    case 'left':
      gameState.bread.x = Math.max(0, gameState.bread.x - 1);
      break;
    case 'right':
      gameState.bread.x = Math.min((canvas.width / config.gridSize) - 1, gameState.bread.x + 1);
      break;
  }

  // 增加步数
  gameState.bread.steps++;

  // 掉落碎片
  if (gameState.fragments.length < config.maxFragments) {
    gameState.fragments.push({
      x: gameState.bread.x,
      y: gameState.bread.y,
      timestamp: Date.now(), // 添加时间戳
      opacity: 1 // 初始不透明度
    });
  }

  // 移除过期的碎片
  const now = Date.now();
  gameState.fragments = gameState.fragments.filter(fragment => {
    return now - fragment.timestamp < config.fragmentLifetime;
  });

  // 检查是否吃到宝藏
  checkTreasures();
}

// 更新Taff位置
function updateTaff() {
  // 简单的追踪算法：向面包方向移动
  const head = gameState.taff.body[0];
  let newHeadX = head.x;
  let newHeadY = head.y;

  if (head.x < gameState.bread.x) {
    newHeadX += 1;
    gameState.taff.direction = 'right';
  } else if (head.x > gameState.bread.x) {
    newHeadX -= 1;
    gameState.taff.direction = 'left';
  } else if (head.y < gameState.bread.y) {
    newHeadY += 1;
    gameState.taff.direction = 'down';
  } else if (head.y > gameState.bread.y) {
    newHeadY -= 1;
    gameState.taff.direction = 'up';
  }

  // 移动蛇身：身体各段跟随前一段移动
  for (let i = gameState.taff.body.length - 1; i > 0; i--) {
    gameState.taff.body[i].x = gameState.taff.body[i - 1].x;
    gameState.taff.body[i].y = gameState.taff.body[i - 1].y;
  }

  // 移动头部
  head.x = newHeadX;
  head.y = newHeadY;

  // 检查是否吃到碎片
  checkFragments();
}

// 检查是否吃到碎片
function checkFragments() {
  const head = gameState.taff.body[0];
  for (let i = gameState.fragments.length - 1; i >= 0; i--) {
    const fragment = gameState.fragments[i];
    if (head.x === fragment.x && head.y === fragment.y) {
      // Taff吃到碎片，变长
      const tail = gameState.taff.body[gameState.taff.body.length - 1];
      gameState.taff.body.push({ x: tail.x, y: tail.y });
      gameState.fragments.splice(i, 1);

      // 减少Taff的速度，最多减少50%
      const minSpeed = config.taffSpeed * (1 - config.taffSpeedDecreaseMax);
      gameState.taff.speed = Math.max(minSpeed, gameState.taff.speed * (1 - config.taffSpeedDecreasePerFragment));

      // Taff每吃一个面包碎屑就变大10%
      gameState.taff.size *= 1.1;

      // 随机播放音效
      const randomSound = Math.random() > 0.5 ? sounds.taffEat : sounds.taffEat2;
      randomSound.play().catch(e => {
        console.log('Taff吃碎屑音效播放失败:', e);
      });

      // 随机显示消息
      const messages = ['好吃好吃！', '豪士！'];
      gameState.message = messages[Math.floor(Math.random() * messages.length)];
      gameMessageElement.textContent = gameState.message;
      setTimeout(() => {
        gameMessageElement.textContent = '';
      }, 2000);
    }
  }
}

// 检查是否吃到宝藏
function checkTreasures() {
  for (let i = gameState.treasures.length - 1; i >= 0; i--) {
    const treasure = gameState.treasures[i];
    if (treasure.x === gameState.bread.x && treasure.y === gameState.bread.y) {
      // 面包吃到宝藏
      if (treasure.type === 'edge-less') {
        // 去掉面包边
        gameState.bread.hasEdge = false;
        gameState.message = treasure.message;
        // 播放吃道具音效
        sounds.eatProp.play().catch(e => {
          console.log('吃道具音效播放失败:', e);
        });
      } else if (treasure.type === 'qq-egg') {
        // 加速
        gameState.bread.speed *= treasure.value;
        gameState.message = treasure.message;
        // 播放吃道具音效
        sounds.eatProp.play().catch(e => {
          console.log('吃道具音效播放失败:', e);
        });
      } else if (treasure.type === 'counter') {
        // 激活战斗形态
        gameState.bread.isCombatMode = true;
        gameState.message = treasure.message;
        // 播放战斗形态音效
        sounds.combatMode.play().catch(e => {
          console.log('战斗形态音效播放失败:', e);
        });

        // 恶梦难度特有效果
        if (gameState.difficulty === 'nightmare') {
          // 大Taff加速20%
          gameState.taff.speed *= 1.2;
          // 碰撞体积检测范围变成原来的200%
          gameState.taff.collisionMultiplier = 2;
          // 重新计算大Taff大小
          gameState.taff.size = config.taffSize * gameState.taff.collisionMultiplier;

          // 小Taff进入隐身模式：5秒里面隐身3秒，1s的提前不透明度由0-100，1s完全显示
          gameState.smallTaff.isInvisible = true;
          gameState.smallTaff.invisibleMode = true; // 启用特殊隐身模式
          gameState.smallTaff.invisibleModeTimer = 0; // 隐身模式总计时器
          gameState.smallTaff.invisiblePhase = 'fadeIn'; // 当前阶段：fadeIn, visible, fadeOut, hidden
          gameState.smallTaff.invisiblePhaseTimer = 0; // 当前阶段计时器
          gameState.smallTaff.opacity = 0; // 当前不透明度
        }
      }

      // 增加道具计数
      gameState.propCount++;

      // 显示大文字消息，持续0.5秒
      gameMessageElement.textContent = gameState.message;
      gameMessageElement.style.fontSize = '36px';
      gameMessageElement.style.fontWeight = 'bold';
      gameMessageElement.style.color = '#ff6b6b';
      gameMessageElement.style.textShadow = '2px 2px 0 #000';
      setTimeout(() => {
        gameMessageElement.textContent = '';
        gameMessageElement.style.fontSize = '18px';
        gameMessageElement.style.fontWeight = 'normal';
        gameMessageElement.style.color = '#333';
        gameMessageElement.style.textShadow = 'none';
      }, config.propMessageDuration);

      // 检查胜利条件
      if (gameState.difficulty === 'nightmare') {
        // 恶梦模式：战斗形态下吃到小Taff获胜
        // 这里不在这里检查，在checkGameOver函数中检查
      } else {
        // 其他模式：吃到3个道具获胜
        if (gameState.propCount >= 3) {
          gameState.gameWin = true;
          gameState.gameOver = true;

          // 暂停游戏BGM
          gameBgm.pause();

          // 播放胜利音效
          sounds.gameWin.play().catch(e => {
            console.log('胜利音效播放失败:', e);
          });

          // 等待音效播放完毕后播放视频
          setTimeout(() => {
            // 创建新的视频元素，确保每次都能正确播放
            const video = document.createElement('video');
            video.src = 'success.mp4';
            video.controls = false;
            video.style.position = 'fixed';
            video.style.top = '0';
            video.style.left = '0';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.zIndex = '2000';
            video.style.display = 'block';

            // 添加视频元素到页面
            document.body.appendChild(video);

            // 播放视频
            video.play().catch(e => {
              console.log('视频播放失败:', e);
              // 如果视频播放失败，直接显示游戏胜利界面
              document.body.removeChild(video);
              gameState.gameOver = true;
              gameWinScreen.classList.remove('hidden');
            });

            // 视频播放完毕后显示游戏胜利界面
            video.onended = function () {
              video.style.display = 'none';
              document.body.removeChild(video);
              gameState.gameOver = true;
              gameWinScreen.classList.remove('hidden');
            };
          }, 1000); // 等待1秒，确保音效播放完毕
        }
      }

      gameState.treasures.splice(i, 1);
    }
  }
}

// 生成宝藏
function spawnTreasure() {
  if (gameState.difficulty === 'nightmare') {
    // 恶梦模式：吃到3个道具后生成反击道具
    if (gameState.propCount >= 3 && !gameState.showCounterProp && gameState.treasures.length < 1) {
      const x = Math.floor(Math.random() * (canvas.width / config.gridSize));
      const y = Math.floor(Math.random() * (canvas.height / config.gridSize));
      gameState.treasures.push({ x, y, ...treasureTypes[2] }); // 反击道具
      gameState.showCounterProp = true;
    } else if (gameState.propCount < 3 && Math.random() < config.treasureSpawnRate && gameState.treasures.length < 3) {
      // 普通道具生成
      const x = Math.floor(Math.random() * (canvas.width / config.gridSize));
      const y = Math.floor(Math.random() * (canvas.height / config.gridSize));
      const treasureType = treasureTypes[Math.floor(Math.random() * 2)]; // 只生成前两种普通道具
      gameState.treasures.push({ x, y, ...treasureType });
    }
  } else {
    // 其他模式
    if (Math.random() < config.treasureSpawnRate && gameState.treasures.length < 3) {
      const x = Math.floor(Math.random() * (canvas.width / config.gridSize));
      const y = Math.floor(Math.random() * (canvas.height / config.gridSize));
      const treasureType = treasureTypes[Math.floor(Math.random() * treasureTypes.length)];
      gameState.treasures.push({ x, y, ...treasureType });
    }
  }
}

// 检查游戏结束
function checkGameOver() {
  if (gameState.difficulty === 'nightmare') {
    // 恶梦模式
    const head = gameState.taff.body[0];

    // 检查是否被大Taff抓住（考虑碰撞检测范围）
    const collisionRange = gameState.taff.collisionMultiplier || 1;
    const dx = Math.abs(head.x - gameState.bread.x);
    const dy = Math.abs(head.y - gameState.bread.y);

    if (dx < collisionRange && dy < collisionRange) {
      gameState.gameOver = true;

      // 暂停BGM
      nightmareBgm.pause();

      // 播放游戏结束音效
      sounds.gameOver.play().catch(e => {
        console.log('游戏结束音效播放失败:', e);
      });

      // 显示游戏结束全屏界面
      gameOverScreen.classList.remove('hidden');
    }

    // 检查是否被小Taff抓住（非战斗形态）
    // 在特殊隐身模式下，只有不透明度大于0.5时才能被碰撞
    const canCollide = gameState.smallTaff.invisibleMode ?
      gameState.smallTaff.opacity > 0.5 : !gameState.smallTaff.isInvisible;

    if (!gameState.bread.isCombatMode &&
      gameState.smallTaff.x === gameState.bread.x &&
      gameState.smallTaff.y === gameState.bread.y &&
      canCollide) {
      gameState.gameOver = true;

      // 暂停BGM
      nightmareBgm.pause();

      // 播放游戏结束音效
      sounds.gameOver.play().catch(e => {
        console.log('游戏结束音效播放失败:', e);
      });

      // 显示游戏结束全屏界面
      gameOverScreen.classList.remove('hidden');
    }

    // 检查是否在战斗形态下吃到小Taff（胜利条件）
    // 在特殊隐身模式下，只有不透明度大于0.5时才能被碰撞
    const canEat = gameState.smallTaff.invisibleMode ?
      gameState.smallTaff.opacity > 0.5 : !gameState.smallTaff.isInvisible;

    if (gameState.bread.isCombatMode &&
      gameState.smallTaff.x === gameState.bread.x &&
      gameState.smallTaff.y === gameState.bread.y &&
      canEat) {
      gameState.gameWin = true;
      gameState.gameOver = true;

      // 暂停BGM
      nightmareBgm.pause();

      // 播放恶梦胜利音效
      sounds.nightmareWin.play().catch(e => {
        console.log('恶梦胜利音效播放失败:', e);
      });

      // 等待音效播放完毕后播放视频
      setTimeout(() => {
        // 创建新的视频元素，确保每次都能正确播放
        const video = document.createElement('video');
        video.src = 'vedio/噩梦通关.mp4';
        video.controls = false;
        video.style.position = 'fixed';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.zIndex = '2000';
        video.style.display = 'block';

        // 添加视频元素到页面
        document.body.appendChild(video);

        // 播放视频
        video.play().catch(e => {
          console.log('视频播放失败:', e);
          // 如果视频播放失败，直接显示游戏胜利界面
          document.body.removeChild(video);
          gameState.gameOver = true;
          gameWinScreen.classList.remove('hidden');
        });

        // 视频播放完毕后显示游戏胜利界面
        video.onended = function () {
          video.style.display = 'none';
          document.body.removeChild(video);
          gameState.gameOver = true;
          gameWinScreen.classList.remove('hidden');
        };
      }, 1000); // 等待1秒，确保音效播放完毕
    }
  } else {
    // 其他模式
    // 检查是否被Taff抓住
    const head = gameState.taff.body[0];
    if (head.x === gameState.bread.x && head.y === gameState.bread.y) {
      gameState.gameOver = true;

      // 暂停游戏BGM
      gameBgm.pause();

      // 播放游戏结束音效
      sounds.gameOver.play().catch(e => {
        console.log('游戏结束音效播放失败:', e);
      });

      // 显示游戏结束全屏界面
      gameOverScreen.classList.remove('hidden');
    }
  }
}

// 游戏循环
let lastTime = 0;
let taffLastMoveTime = 0;
let smallTaffLastMoveTime = 0;
let smallTaffInvisibleTimer = 0;
function gameLoop(timestamp = 0) {
  if (gameState.gameOver) {
    return;
  }

  // 控制面包移动速度
  const deltaTime = timestamp - lastTime;
  if (deltaTime > 1000 / gameState.bread.speed) {
    updateBread();
    spawnTreasure();
    checkGameOver();
    drawGame();
    updateUI();
    lastTime = timestamp;
  }

  // 控制大Taff移动速度
  if (timestamp - taffLastMoveTime > 1000 / gameState.taff.speed) {
    updateTaff();
    taffLastMoveTime = timestamp;
  }

  // 控制小Taff移动速度（恶梦模式）
  if (gameState.difficulty === 'nightmare' && timestamp - smallTaffLastMoveTime > 1000 / gameState.smallTaff.speed) {
    updateSmallTaff();
    smallTaffLastMoveTime = timestamp;
  }

  // 更新小Taff隐身状态
  if (gameState.difficulty === 'nightmare' && gameState.smallTaff.isInvisible) {
    smallTaffInvisibleTimer += deltaTime;
    if (smallTaffInvisibleTimer > 500) { // 0.5秒后结束隐身
      gameState.smallTaff.isInvisible = false;
      smallTaffInvisibleTimer = 0;
    }
  }

  // 更新小Taff特殊隐身模式
  if (gameState.difficulty === 'nightmare' && gameState.smallTaff.invisibleMode) {
    gameState.smallTaff.invisibleModeTimer += deltaTime;
    gameState.smallTaff.invisiblePhaseTimer += deltaTime;

    // 5秒一个循环：1秒淡入，1秒完全显示，3秒隐身
    if (gameState.smallTaff.invisibleModeTimer >= 5000) {
      gameState.smallTaff.invisibleModeTimer = 0;
      gameState.smallTaff.invisiblePhase = 'fadeIn';
      gameState.smallTaff.invisiblePhaseTimer = 0;
    }

    // 根据当前阶段更新不透明度
    switch (gameState.smallTaff.invisiblePhase) {
      case 'fadeIn':
        // 1秒淡入：不透明度从0到1
        gameState.smallTaff.opacity = Math.min(1, gameState.smallTaff.invisiblePhaseTimer / 1000);
        if (gameState.smallTaff.invisiblePhaseTimer >= 1000) {
          gameState.smallTaff.invisiblePhase = 'visible';
          gameState.smallTaff.invisiblePhaseTimer = 0;
          gameState.smallTaff.opacity = 1;
        }
        break;
      case 'visible':
        // 1秒完全显示
        gameState.smallTaff.opacity = 1;
        if (gameState.smallTaff.invisiblePhaseTimer >= 1000) {
          gameState.smallTaff.invisiblePhase = 'hidden';
          gameState.smallTaff.invisiblePhaseTimer = 0;
          gameState.smallTaff.opacity = 0;
        }
        break;
      case 'hidden':
        // 3秒隐身
        gameState.smallTaff.opacity = 0;
        if (gameState.smallTaff.invisiblePhaseTimer >= 3000) {
          gameState.smallTaff.invisiblePhase = 'fadeIn';
          gameState.smallTaff.invisiblePhaseTimer = 0;
        }
        break;
    }
  }

  requestAnimationFrame(gameLoop);
}

// 更新小Taff位置
function updateSmallTaff() {
  // 简单的追踪算法：向面包方向移动
  let newX = gameState.smallTaff.x;
  let newY = gameState.smallTaff.y;

  // 随机方向冲刺效果（20%概率）
  if (Math.random() < 0.2) {
    const directions = ['up', 'down', 'left', 'right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];

    // 冲刺2格子
    switch (randomDirection) {
      case 'up':
        newY = Math.max(0, newY - 2);
        gameState.smallTaff.direction = 'up';
        break;
      case 'down':
        newY = Math.min(19, newY + 2);
        gameState.smallTaff.direction = 'down';
        break;
      case 'left':
        newX = Math.max(0, newX - 2);
        gameState.smallTaff.direction = 'left';
        break;
      case 'right':
        newX = Math.min(19, newX + 2);
        gameState.smallTaff.direction = 'right';
        break;
    }
  } else {
    // 正常追踪面包
    if (gameState.smallTaff.x < gameState.bread.x) {
      newX += 1;
      gameState.smallTaff.direction = 'right';
    } else if (gameState.smallTaff.x > gameState.bread.x) {
      newX -= 1;
      gameState.smallTaff.direction = 'left';
    } else if (gameState.smallTaff.y < gameState.bread.y) {
      newY += 1;
      gameState.smallTaff.direction = 'down';
    } else if (gameState.smallTaff.y > gameState.bread.y) {
      newY -= 1;
      gameState.smallTaff.direction = 'up';
    }
  }

  // 检查是否吃到面包
  if (newX === gameState.bread.x && newY === gameState.bread.y) {
    // 小Taff吃到面包，隐身0.5秒
    gameState.smallTaff.isInvisible = true;
    smallTaffInvisibleTimer = 0;
  } else {
    // 移动小Taff
    gameState.smallTaff.x = newX;
    gameState.smallTaff.y = newY;
  }

  // 检查小Taff是否吃到面包碎片
  gameState.fragments.forEach((fragment, index) => {
    if (Math.abs(fragment.x - gameState.smallTaff.x) < 0.5 && Math.abs(fragment.y - gameState.smallTaff.y) < 0.5) {
      // 小Taff吃到面包碎片
      gameState.fragments.splice(index, 1);
      // 小Taff吃到面包后隐身0.5秒
      gameState.smallTaff.isInvisible = true;
      gameState.smallTaff.invisibleTimer = 0;

      // 随机播放小Taff的语音
      const randomVoice = Math.random();
      if (randomVoice < 0.5) {
        sounds.notTang.play().catch(e => {
          console.log('"才不唐呢"播放失败:', e);
        });
      } else {
        sounds.likeYou.play().catch(e => {
          console.log('"最喜欢你啦"播放失败:', e);
        });
      }
    }
  });
}

// 开始游戏
function startGame() {
  // 暂停主菜单BGM
  mainMenuBgm.pause();
  mainMenuBgm.currentTime = 0;

  // 根据难度选择播放对应的BGM
  if (gameState.difficulty === 'nightmare') {
    // 恶梦模式：播放开场音效和恶梦BGM
    sounds.nightmareIntro.play().catch(e => {
      console.log('恶梦开场音效播放失败:', e);
    });
    nightmareBgm.play().catch(e => {
      console.log('恶梦BGM播放失败:', e);
    });
  } else {
    // 其他模式：播放普通游戏BGM
    gameBgm.play().catch(e => {
      console.log('游戏BGM播放失败:', e);
    });
  }

  // 隐藏主菜单，显示游戏界面
  mainMenu.classList.add('hidden');
  gameContainer.classList.remove('hidden');

  // 根据难度设置游戏界面主题
  if (gameState.difficulty === 'nightmare') {
    // 恶梦难度：黑底红字
    gameContainer.style.backgroundColor = '#1a1a1a';
    gameContainer.style.color = '#ff4444';
    gameContainer.style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.5)';
  } else {
    // 其他难度：默认样式
    gameContainer.style.backgroundColor = '#fff';
    gameContainer.style.color = '#333';
    gameContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
  }

  // 显示或隐藏手机控制按钮
  if (isMobile) {
    mobileControls.style.display = 'block';
  } else {
    mobileControls.style.display = 'none';
  }

  // 初始化游戏
  initGame();
}

// 返回主菜单
function backToMainMenu() {
  // 暂停所有BGM，播放主菜单BGM
  gameBgm.pause();
  gameBgm.currentTime = 0;
  nightmareBgm.pause();
  nightmareBgm.currentTime = 0;
  mainMenuBgm.play().catch(e => {
    console.log('主菜单BGM播放失败:', e);
  });

  // 显示主菜单，隐藏游戏界面
  mainMenu.classList.remove('hidden');
  gameContainer.classList.add('hidden');

  // 隐藏游戏结束和胜利界面
  gameOverScreen.classList.add('hidden');
  gameWinScreen.classList.add('hidden');

  // 移除视频元素（如果存在）
  if (winVideo.parentNode) {
    winVideo.parentNode.removeChild(winVideo);
  }
}

// 退出游戏
function exitGame() {
  // 暂停所有BGM
  mainMenuBgm.pause();
  gameBgm.pause();
  nightmareBgm.pause();

  // 可以在这里添加退出逻辑，比如关闭窗口
  if (confirm('确定要退出游戏吗？')) {
    // 在浏览器中，我们可以刷新页面或导航到其他页面
    window.location.reload();
  }
}

// 事件监听
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// 触摸控制（手机）
if (isMobile) {
  canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
}

// 触摸开始位置
let touchStartX = 0;
let touchStartY = 0;

// 处理触摸开始
function handleTouchStart(e) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

// 处理触摸移动
function handleTouchMove(e) {
  if (!touchStartX || !touchStartY) {
    return;
  }

  const touch = e.touches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;

  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  // 确定移动方向
  if (Math.abs(dx) > Math.abs(dy)) {
    // 水平移动
    if (dx > 0 && gameState.bread.direction !== 'left') {
      gameState.bread.direction = 'right';
    } else if (dx < 0 && gameState.bread.direction !== 'right') {
      gameState.bread.direction = 'left';
    }
  } else {
    // 垂直移动
    if (dy > 0 && gameState.bread.direction !== 'up') {
      gameState.bread.direction = 'down';
    } else if (dy < 0 && gameState.bread.direction !== 'down') {
      gameState.bread.direction = 'up';
    }
  }

  // 重置触摸起始位置
  touchStartX = touchEndX;
  touchStartY = touchEndY;
}

// 事件监听器
startButton.addEventListener('click', function () {
  mainMenu.classList.add('hidden');
  difficultyScreen.classList.remove('hidden');
});
tutorialButton.addEventListener('click', function () {
  mainMenu.classList.add('hidden');
  tutorialScreen.classList.remove('hidden');
});
exitButton.addEventListener('click', exitGame);
backToMenuButton.addEventListener('click', function () {
  tutorialScreen.classList.add('hidden');
  mainMenu.classList.remove('hidden');
});
normalButton.addEventListener('click', function () {
  gameState.difficulty = 'normal';
  difficultyScreen.classList.add('hidden');
  startGame();
});
stealthButton.addEventListener('click', function () {
  gameState.difficulty = 'stealth';
  difficultyScreen.classList.add('hidden');
  startGame();
});
// 恶梦难度按钮事件监听器
const nightmareButton = document.getElementById('nightmare-btn');
nightmareButton.addEventListener('click', function () {
  gameState.difficulty = 'nightmare';
  difficultyScreen.classList.add('hidden');
  startGame();
});
backFromDifficultyButton.addEventListener('click', function () {
  difficultyScreen.classList.add('hidden');
  mainMenu.classList.remove('hidden');
});
restartButton.addEventListener('click', initGame);
backButton.addEventListener('click', backToMainMenu);
restartButtonGameOver.addEventListener('click', initGame);
backButtonGameOver.addEventListener('click', backToMainMenu);
restartButtonGameWin.addEventListener('click', initGame);
backButtonGameWin.addEventListener('click', backToMainMenu);

// 手机控制按钮事件监听器
upButton.addEventListener('click', function () {
  if (gameState.bread.direction !== 'down') {
    gameState.bread.direction = 'up';
  }
});
downButton.addEventListener('click', function () {
  if (gameState.bread.direction !== 'up') {
    gameState.bread.direction = 'down';
  }
});
leftButton.addEventListener('click', function () {
  if (gameState.bread.direction !== 'right') {
    gameState.bread.direction = 'left';
  }
});
rightButton.addEventListener('click', function () {
  if (gameState.bread.direction !== 'left') {
    gameState.bread.direction = 'right';
  }
});

// 作者名字点击事件监听器
let clickCount = 0;
let clickTimer = null;
authorName.addEventListener('click', function () {
  // 播放关注匡匡喵音效
  sounds.follow.play().catch(e => {
    console.log('关注匡匡喵音效播放失败:', e);
  });

  // 增加点击计数
  clickCount++;

  // 清除之前的定时器
  if (clickTimer) {
    clearTimeout(clickTimer);
  }

  // 设置新的定时器，2秒内点击3次跳转到B站链接
  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, 2000);

  // 如果连续点击3次，跳转到B站链接
  if (clickCount === 3) {
    window.location.href = 'https://space.bilibili.com/398038578?spm_id_from=333.1007.0.0';
  }
});

// 页面加载时自动播放主菜单BGM
window.addEventListener('DOMContentLoaded', () => {
  // 尝试播放主菜单BGM
  mainMenuBgm.play().catch(e => {
    console.log('主菜单BGM自动播放失败，需要用户交互:', e);
  });
});