// ===== УПРАВЛЕНИЕ ЭКРАНАМИ =====
let currentSearchScreen = 1;
const totalSearchScreens = 6;

// Рандомизация позиций червяков
function randomizeWormPositions() {
  document.querySelectorAll('.search-screen').forEach(screen => {
    const worm = screen.querySelector('.worm-search');
    if (worm) {
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 60;
      const randomX = Math.floor(Math.random() * maxX);
      const randomY = Math.floor(Math.random() * maxY);
      
      worm.style.left = randomX + 'px';
      worm.style.top = randomY + 'px';
    }
  });
}

function findWorm(wormNum, element) {
  if (element.classList.contains('found')) return;

  element.classList.add('found');
  playFindSound();

  setTimeout(() => {
    if (currentSearchScreen < totalSearchScreens) {
      currentSearchScreen++;
      showScreen('screen' + currentSearchScreen);
    } else {
      showScreen('cutscene');
    }
  }, 800);
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');

  if (screenId === 'screen-worms') {
    initGame2();
  }
}

// ===== ЗВУКИ =====
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playFindSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523, audioCtx.currentTime);
  osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.3);
}

function playCorrectSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523, audioCtx.currentTime);
  osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
  osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.5);
}

function playWrongSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.4);
}

function playWinSound() {
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.3);
    osc.start(audioCtx.currentTime + i * 0.1);
    osc.stop(audioCtx.currentTime + i * 0.1 + 0.3);
  });
}

// ===== ФОРМЫ ЧЕРВЯКОВ =====
const wormShapes = [
  { id: 1, path: "M 20 40 C 20 10, 60 10, 60 40 C 60 70, 100 70, 100 40", viewBox: "0 0 120 80" },
  { id: 2, path: "M 80 15 C 30 15, 15 40, 15 60 C 15 80, 40 85, 70 75", viewBox: "0 0 120 80" },
  { id: 3, path: "M 10 40 Q 30 10, 50 40 Q 70 70, 90 40 Q 105 20, 115 35", viewBox: "0 0 120 80" },
  { id: 4, path: "M 15 20 C 15 70, 30 75, 60 75 C 90 75, 105 70, 105 20", viewBox: "0 0 120 80" },
  { id: 5, path: "M 15 20 L 90 20 C 100 20, 100 35, 90 35 L 30 35 C 20 35, 20 50, 30 50 L 105 50", viewBox: "0 0 120 80" },
  { id: 6, path: "M 60 70 C 20 70, 10 40, 30 25 C 50 10, 80 15, 85 35 C 90 55, 70 60, 60 50", viewBox: "0 0 120 80" },
  { id: 7, path: "M 20 20 C 20 60, 40 70, 70 70 L 100 70 C 110 70, 110 55, 100 55 L 60 55 C 45 55, 40 45, 40 30 L 40 20", viewBox: "0 0 120 80" },
  { id: 8, path: "M 10 50 C 25 20, 45 20, 55 40 C 65 60, 80 60, 90 40 C 100 20, 110 25, 115 35", viewBox: "0 0 120 80" }
];

let currentRound = 0;
let currentWormIndex = -1;
let holes = [];
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let filledHoles = new Set();
let shuffledIndices = [];

// ===== СОЗДАНИЕ SVG ЧЕРВЯКОВ (временное решение до подключения PNG) =====
function createStandardWormSVG() {
  return `
    <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="shadow-std"><feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter></defs>
      <path d="M 10 40 L 110 40" fill="none" stroke="#E8566D" stroke-width="18" stroke-linecap="round" filter="url(#shadow-std)"/>
      <path d="M 10 40 L 110 40" fill="none" stroke="#FF8FA3" stroke-width="14" stroke-linecap="round"/>
      <path d="M 10 40 L 110 40" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="14" stroke-linecap="round" stroke-dasharray="8 6"/>
      <circle cx="18" cy="36" r="5" fill="white" stroke="#333" stroke-width="1.5"/>
      <circle cx="20" cy="35" r="2.5" fill="#333"/>
      <circle cx="18" cy="44" r="5" fill="white" stroke="#333" stroke-width="1.5"/>
      <circle cx="20" cy="43" r="2.5" fill="#333"/>
      <path d="M 14 42 Q 18 46, 22 42" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;
}

function createIndividualWormSVG(shape, isFilled = false) {
  const color = isFilled ? '#FF6B8A' : '#FF8FA3';
  const strokeColor = '#E8566D';
  return `
    <svg viewBox="${shape.viewBox}" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="shadow${shape.id}"><feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter></defs>
      <path d="${shape.path}" fill="none" stroke="${strokeColor}" stroke-width="18" stroke-linecap="round" filter="url(#shadow${shape.id})"/>
      <path d="${shape.path}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"/>
      <path d="${shape.path}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="14" stroke-linecap="round" stroke-dasharray="8 6"/>
      <circle cx="22" cy="36" r="5" fill="white" stroke="#333" stroke-width="1.5"/>
      <circle cx="24" cy="35" r="2.5" fill="#333"/>
      <circle cx="22" cy="44" r="5" fill="white" stroke="#333" stroke-width="1.5"/>
      <circle cx="24" cy="43" r="2.5" fill="#333"/>
      <path d="M 18 42 Q 22 46, 26 42" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;
}

function createHoleShapeSVG(shape) {
  return `
    <svg viewBox="${shape.viewBox}" xmlns="http://www.w3.org/2000/svg">
      <path d="${shape.path}" fill="none" stroke="#1a0f05" stroke-width="16" stroke-linecap="round" opacity="0.8"/>
      <path d="${shape.path}" fill="none" stroke="#2a1a0a" stroke-width="12" stroke-linecap="round"/>
    </svg>
  `;
}

// ===== УТИЛИТЫ =====
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== ИНИЦИАЛИЗАЦИЯ ИГРЫ С НОРКАМИ =====
function initGame2() {
  currentRound = 0;
  filledHoles.clear();
  shuffledIndices = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7]);
  holes = [];

  const groundArea = document.getElementById('ground-area');
  groundArea.innerHTML = '';

  for (let i = 0; i < 8; i++) {
    const shapeIndex = shuffledIndices[i];
    const shape = wormShapes[shapeIndex];

    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.dataset.shapeId = shape.id;
    hole.dataset.index = i;

    const holeShape = document.createElement('div');
    holeShape.className = 'hole-shape';
    holeShape.innerHTML = createHoleShapeSVG(shape);

    hole.appendChild(holeShape);
    groundArea.appendChild(hole);
    holes.push({ element: hole, shapeId: shape.id, shapeIndex: shapeIndex, filled: false });

    hole.addEventListener('dragover', handleDragOver);
    hole.addEventListener('dragenter', handleDragEnter);
    hole.addEventListener('dragleave', handleDragLeave);
    hole.addEventListener('drop', handleDrop);
    hole.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  nextRound();
}

function nextRound() {
  if (currentRound >= 8) { showWinScreen(); return; }

  const shapeIndex = shuffledIndices[currentRound];
  const shape = wormShapes[shapeIndex];
  currentWormIndex = shapeIndex;

  document.getElementById('round-num').textContent = currentRound + 1;

  const chervyak = document.getElementById('chervyak');
  const chervyakIndividual = document.getElementById('chervyak-individual');

  chervyak.className = '';
  chervyakIndividual.className = '';
  chervyakIndividual.innerHTML = '';

  chervyak.innerHTML = createStandardWormSVG();

  setTimeout(() => { chervyak.classList.add('crawl'); }, 100);
  setTimeout(() => { chervyak.classList.add('rotate'); }, 2100);

  setTimeout(() => {
    chervyakIndividual.innerHTML = createIndividualWormSVG(shape);
    chervyak.classList.add('morph-out');
    chervyakIndividual.classList.add('morph-in');
  }, 2600);

  setTimeout(() => {
    const draggableWorm = document.getElementById('draggable-worm');
    draggableWorm.innerHTML = createIndividualWormSVG(shape);

    const wormContainer = document.getElementById('worm-container');
    const containerRect = wormContainer.getBoundingClientRect();
    draggableWorm.style.left = containerRect.left + 'px';
    draggableWorm.style.top = containerRect.top + 'px';
    draggableWorm.style.pointerEvents = 'auto';

    draggableWorm.onmousedown = startDrag;
    draggableWorm.ontouchstart = startDragTouch;
  }, 3200);
}

// ===== DRAG & DROP (МЫШЬ) =====
function startDrag(e) {
  e.preventDefault();
  isDragging = true;
  const worm = document.getElementById('draggable-worm');
  const rect = worm.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);
}

function onDrag(e) {
  if (!isDragging) return;
  const worm = document.getElementById('draggable-worm');
  worm.style.left = (e.clientX - dragOffsetX) + 'px';
  worm.style.top = (e.clientY - dragOffsetY) + 'px';
}

function endDrag(e) {
  if (!isDragging) return;
  isDragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
  checkDrop(e.clientX, e.clientY);
}

// ===== DRAG & DROP (ТАЧ) =====
function startDragTouch(e) {
  e.preventDefault();
  const touch = e.touches[0];
  isDragging = true;
  const worm = document.getElementById('draggable-worm');
  const rect = worm.getBoundingClientRect();
  dragOffsetX = touch.clientX - rect.left;
  dragOffsetY = touch.clientY - rect.top;
  document.addEventListener('touchmove', onDragTouch, { passive: false });
  document.addEventListener('touchend', endDragTouch);
}

function onDragTouch(e) {
  if (!isDragging) return;
  e.preventDefault();
  const touch = e.touches[0];
  const worm = document.getElementById('draggable-worm');
  worm.style.left = (touch.clientX - dragOffsetX) + 'px';
  worm.style.top = (touch.clientY - dragOffsetY) + 'px';
}

function endDragTouch(e) {
  if (!isDragging) return;
  isDragging = false;
  document.removeEventListener('touchmove', onDragTouch);
  document.removeEventListener('touchend', endDragTouch);
  const touch = e.changedTouches[0];
  checkDrop(touch.clientX, touch.clientY);
}

// ===== ПРОВЕРКА DROP =====
function checkDrop(x, y) {
  const worm = document.getElementById('draggable-worm');
  const targetShapeId = wormShapes[currentWormIndex].id;

  worm.style.pointerEvents = 'none';
  const elementBelow = document.elementFromPoint(x, y);
  worm.style.pointerEvents = 'auto';

  const hole = elementBelow ? elementBelow.closest('.hole') : null;

  if (hole && !hole.classList.contains('filled')) {
    const holeShapeId = parseInt(hole.dataset.shapeId);

    if (holeShapeId === targetShapeId) {
      hole.classList.add('correct', 'filled');
      const shape = wormShapes[currentWormIndex];
      hole.querySelector('.hole-shape').innerHTML = createIndividualWormSVG(shape, true);
      playCorrectSound();
      filledHoles.add(hole.dataset.index);
      currentRound++;

      setTimeout(() => { hole.classList.remove('correct'); nextRound(); }, 800);
    } else {
      hole.classList.add('wrong');
      playWrongSound();

      const wormContainer = document.getElementById('worm-container');
      const containerRect = wormContainer.getBoundingClientRect();
      worm.style.transition = 'all 0.5s ease';
      worm.style.left = containerRect.left + 'px';
      worm.style.top = containerRect.top + 'px';

      setTimeout(() => { hole.classList.remove('wrong'); worm.style.transition = 'transform 0.1s'; }, 600);
    }
  } else {
    const wormContainer = document.getElementById('worm-container');
    const containerRect = wormContainer.getBoundingClientRect();
    worm.style.transition = 'all 0.5s ease';
    worm.style.left = containerRect.left + 'px';
    worm.style.top = containerRect.top + 'px';
    setTimeout(() => { worm.style.transition = 'transform 0.1s'; }, 500);
  }
}

function handleDragOver(e) { e.preventDefault(); }
function handleDragEnter(e) {
  e.preventDefault();
  if (!this.classList.contains('filled')) this.style.transform = 'scale(1.05)';
}
function handleDragLeave(e) { this.style.transform = 'scale(1)'; }
function handleDrop(e) { e.preventDefault(); this.style.transform = 'scale(1)'; }

// ===== ЭКРАН ПОБЕДЫ =====
function showWinScreen() {
  playWinSound();
  document.getElementById('win-screen').classList.add('show');
  createConfetti();
}

function createConfetti() {
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6B9D', '#C084FC'];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      confetti.style.width = (Math.random() * 10 + 5) + 'px';
      confetti.style.height = (Math.random() * 10 + 5) + 'px';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }, i * 60);
  }
}

// ===== РЕСТАРТ =====
function restartGame() {
  document.getElementById('win-screen').classList.remove('show');
  document.querySelectorAll('.confetti').forEach(c => c.remove());

  const chervyak = document.getElementById('chervyak');
  const chervyakIndividual = document.getElementById('chervyak-individual');
  chervyak.className = '';
  chervyak.innerHTML = '';
  chervyakIndividual.className = '';
  chervyakIndividual.innerHTML = '';

  currentSearchScreen = 1;
  showScreen('screen1');

  document.querySelectorAll('.worm-search').forEach(worm => {
    worm.classList.remove('found');
  });

  randomizeWormPositions();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('click', () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });

window.addEventListener('load', () => {
  randomizeWormPositions();
});
