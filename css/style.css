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
  containerRect: null,
  wormRect: null
};

// ===== ФУНКЦИИ ПОПАПОВ =====
function startGame() {
  console.log('✅ startGame called');
  const welcomePopup = document.getElementById('welcome-popup');
  if (welcomePopup) welcomePopup.classList.add('hidden');

  const gameScreen = document.getElementById('game-screen');
  if (gameScreen) gameScreen.classList.add('active');

  // Небольшая задержка чтобы экран успел отрисоваться
  requestAnimationFrame(() => {
    initHoleGame();
  });
}

function showCongrats() {
  const popup = document.getElementById('congrats-popup');
  if (popup) popup.classList.remove('hidden');
}

function restartGame() {
  const congratsPopup = document.getElementById('congrats-popup');
  if (congratsPopup) congratsPopup.classList.add('hidden');

  const gameScreen = document.getElementById('game-screen');
  if (gameScreen) gameScreen.classList.remove('active');

  const holesRow = document.getElementById('holes-row');
  if (holesRow) holesRow.innerHTML = '';

  const worm = document.getElementById('current-worm');
  if (worm) {
    worm.src = '';
    worm.style.cssText = '';
  }

  const welcomePopup = document.getElementById('welcome-popup');
  if (welcomePopup) welcomePopup.classList.remove('hidden');
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
  if (!holesRow) return;
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
  if (!wormImg) return;

  // ПОЛНЫЙ сброс стилей — убираем transform, position, всё
  wormImg.style.cssText = '';
  wormImg.style.transform = '';
  wormImg.style.position = '';
  wormImg.style.left = '';
  wormImg.style.top = '';
  wormImg.style.zIndex = '';
  wormImg.style.filter = '';
  wormImg.style.cursor = 'grab';

  wormImg.src = `worms/worm${wormId}.png`;
  wormImg.dataset.wormId = wormId;
}

// ===== DRAG & DROP через TRANSFORM =====
function initDrag() {
  const wormImg = document.getElementById('current-worm');
  if (!wormImg) return;

  wormImg.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const wormRect = wormImg.getBoundingClientRect();
    const containerRect = document.getElementById('current-worm-container').getBoundingClientRect();

    // Вычисляем где червяк относительно контейнера
    const wormCenterX = wormRect.left + wormRect.width / 2;
    const wormCenterY = wormRect.top + wormRect.height / 2;
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;

    // Текущий transform (смещение от центра контейнера)
    const currentTranslateX = wormCenterX - containerCenterX;
    const currentTranslateY = wormCenterY - containerCenterY;

    // Где курсор относительно центра червяка
    const cursorOffsetX = e.clientX - wormCenterX;
    const cursorOffsetY = e.clientY - wormCenterY;

    drag.active = true;
    drag.el = wormImg;
    drag.containerCenterX = containerCenterX;
    drag.containerCenterY = containerCenterY;
    drag.cursorOffsetX = cursorOffsetX;
    drag.cursorOffsetY = cursorOffsetY;

    // Устанавливаем transform так чтобы червяк остался под курсором
    const newTranslateX = e.clientX - containerCenterX - cursorOffsetX;
    const newTranslateY = e.clientY - containerCenterY - cursorOffsetY;

    wormImg.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;
    wormImg.style.zIndex = '1000';
    wormImg.style.cursor = 'grabbing';
    wormImg.style.filter = 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))';
    wormImg.style.transition = 'none';

    try {
      wormImg.setPointerCapture(e.pointerId);
    } catch (err) {}
  });

  wormImg.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    e.preventDefault();

    // Червяк следует за курсором относительно центра контейнера
    const newTranslateX = e.clientX - drag.containerCenterX - drag.cursorOffsetX;
    const newTranslateY = e.clientY - drag.containerCenterY - drag.cursorOffsetY;

    drag.el.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;
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
  if (!el) return;

  // Скрываем чтобы найти элемент под курсором
  el.style.visibility = 'hidden';
  const target = document.elementFromPoint(x, y);
  el.style.visibility = '';

  const hole = target ? target.closest('.hole') : null;

  if (hole && !hole.classList.contains('filled') && hole.dataset.wormId === el.dataset.wormId) {
    // ✅ Совпадение
    hole.innerHTML = `<img src="${el.src}" style="width:100%;height:100%;object-fit:contain;">`;
    hole.classList.add('filled');
    filledCount++;

    el.style.cssText = '';
    el.style.cursor = 'grab';

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
  if (!el) return;

  // Плавный возврат — transform в 0,0 (центр контейнера)
  el.style.transition = 'transform 0.4s ease';
  el.style.transform = 'translate(0px, 0px)';

  setTimeout(() => {
    el.style.cssText = '';
    el.style.cursor = 'grab';
  }, 400);
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM loaded');

  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');

  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startGame();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      restartGame();
    });
  }

  initDrag();
});

window.startGame = startGame;
window.restartGame = restartGame;
window.showCongrats = showCongrats;
