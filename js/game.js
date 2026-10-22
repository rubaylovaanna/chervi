// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let wormSequence = [];
let currentWormIndex = 0;
let filledCount = 0;
let totalHoles = 8;

let drag = {
  active: false,
  el: null,
  offsetX: 0,
  offsetY: 0,
  width: 0,
  height: 0,
  containerRect: null
};

// ===== ПОПАПЫ =====
function startGame() {
  console.log('startGame called');
  const popup = document.getElementById('welcome-popup');
  popup.classList.add('hidden');
  initHoleGame();
}

function showCongrats() {
  document.getElementById('congrats-popup').classList.remove('hidden');
}

function restartGame() {
  console.log('restartGame called');
  document.getElementById('congrats-popup').classList.add('hidden');
  document.getElementById('holes-row').innerHTML = '';
  const worm = document.getElementById('current-worm');
  worm.src = '';
  worm.style.cssText = '';
  document.getElementById('welcome-popup').classList.remove('hidden');
}

// ===== ИГРА С НОРКАМИ =====
function initHoleGame() {
  const indices = [];
  for (let i = 1; i <= 10; i++) indices.push(i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  wormSequence = indices.slice(0, 8);

  const holesRow = document.getElementById('holes-row');
  holesRow.innerHTML = '';

  const shuffledHoles = [...wormSequence].sort(() => Math.random() - 0.5);

  const isMobile = window.innerWidth <= 768;
  holesRow.style.gridTemplateColumns = `repeat(${isMobile ? 4 : 8}, 1fr)`;

  shuffledHoles.forEach(id => {
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.dataset.wormId = id;
    hole.innerHTML = `<img src="holes/hole${id}.png" alt="Норка ${id}">`;
    holesRow.appendChild(hole);
  });

  currentWormIndex = 0;
  filledCount = 0;
  totalHoles = wormSequence.length;

  showCurrentWorm();
}

function showCurrentWorm() {
  if (currentWormIndex >= wormSequence.length) {
    setTimeout(showCongrats, 500);
    return;
  }

  const wormId = wormSequence[currentWormIndex];
  const wormImg = document.getElementById('current-worm');

  wormImg.src = `worms/worm${wormId}.png`;
  wormImg.dataset.wormId = wormId;
  wormImg.style.cssText = '';
}

// ===== DRAG & DROP =====
function initDrag() {
  const wormImg = document.getElementById('current-worm');

  wormImg.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = wormImg.getBoundingClientRect();

    drag.active = true;
    drag.el = wormImg;
    drag.offsetX = e.clientX - rect.left;
    drag.offsetY = e.clientY - rect.top;
    drag.width = rect.width;
    drag.height = rect.height;
    drag.containerRect = document.getElementById('current-worm-container').getBoundingClientRect();

    wormImg.style.width = drag.width + 'px';
    wormImg.style.height = drag.height + 'px';
    wormImg.style.maxWidth = 'none';
    wormImg.style.maxHeight = 'none';
    wormImg.style.left = rect.left + 'px';
    wormImg.style.top = rect.top + 'px';
    wormImg.style.position = 'fixed';
    wormImg.style.zIndex = '1000';
    wormImg.style.cursor = 'grabbing';
    wormImg.style.filter = 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))';
    wormImg.style.margin = '0';
    wormImg.style.padding = '0';

    try {
      wormImg.setPointerCapture(e.pointerId);
    } catch (err) {}
  });

  wormImg.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    e.preventDefault();

    drag.el.style.left = (e.clientX - drag.offsetX) + 'px';
    drag.el.style.top = (e.clientY - drag.offsetY) + 'px';
  });

  wormImg.addEventListener('pointerup', (e) => {
    if (!drag.active) return;
    drag.active = false;
    checkDrop(e.clientX, e.clientY);
  });

  wormImg.addEventListener('pointercancel', () => {
    if (!drag.active) return;
    drag.active = false;
    returnWorm();
  });
}

function checkDrop(x, y) {
  const el = drag.el;
  el.style.display = 'none';
  const target = document.elementFromPoint(x, y);
  el.style.display = '';

  const hole = target ? target.closest('.hole') : null;

  if (hole && !hole.classList.contains('filled') && hole.dataset.wormId === el.dataset.wormId) {
    hole.innerHTML = `<img src="${el.src}" style="width:100%;height:100%;object-fit:contain;">`;
    hole.classList.add('filled');
    filledCount++;

    resetWorm();

    if (filledCount === totalHoles) {
      setTimeout(showCongrats, 600);
    } else {
      currentWormIndex++;
      setTimeout(showCurrentWorm, 600);
    }
  } else {
    returnWorm();
  }
}

function returnWorm() {
  const el = drag.el;
  const rect = drag.containerRect;
  const targetLeft = rect.left + rect.width / 2 - drag.width / 2;
  const targetTop = rect.top + rect.height / 2 - drag.height / 2;

  el.style.transition = 'left 0.3s ease, top 0.3s ease';
  el.style.left = targetLeft + 'px';
  el.style.top = targetTop + 'px';

  setTimeout(resetWorm, 300);
}

function resetWorm() {
  const el = drag.el;
  el.style.cssText = '';
  el.style.cursor = 'grab';
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');

  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');

  if (startBtn) {
    console.log('Start button found');
    startBtn.addEventListener('click', (e) => {
      console.log('Start button clicked');
      e.preventDefault();
      e.stopPropagation();
      startGame();
    });
  } else {
    console.error('Start button NOT found');
  }

  if (restartBtn) {
    console.log('Restart button found');
    restartBtn.addEventListener('click', (e) => {
      console.log('Restart button clicked');
      e.preventDefault();
      e.stopPropagation();
      restartGame();
    });
  }

  initDrag();
});
