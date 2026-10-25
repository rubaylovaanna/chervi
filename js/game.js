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
  height: 0
};

// ===== ЗВУКИ =====
const sounds = {
  success: new Audio('sounds/success.mp3'),
  gameWon: new Audio('sounds/game-won.mp3')
};

sounds.success.volume = 0.7;
sounds.gameWon.volume = 0.8;

function playSound(sound) {
  try {
    sound.currentTime = 0;
    sound.play().catch(err => {
      console.warn('Звук не воспроизведён:', err);
    });
  } catch (err) {
    console.warn('Ошибка воспроизведения звука:', err);
  }
}

let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  
  const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
  silent.volume = 0;
  silent.play().catch(() => {});
}

document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('touchstart', unlockAudio, { once: true });

// ===== ФУНКЦИИ ПОПАПОВ =====
function startGame() {
  console.log('✅ startGame called');
  unlockAudio();
  
  const welcomePopup = document.getElementById('welcome-popup');
  if (welcomePopup) welcomePopup.classList.add('hidden');

  const gameScreen = document.getElementById('game-screen');
  if (gameScreen) gameScreen.classList.add('active');

  // Полная инициализация игры
  setTimeout(() => {
    initHoleGame();
  }, 100);
}

function showCongrats() {
  playSound(sounds.gameWon);
  
  const popup = document.getElementById('congrats-popup');
  if (popup) popup.classList.remove('hidden');
}

function restartGame() {
  console.log('✅ restartGame called');
  
  const congratsPopup = document.getElementById('congrats-popup');
  if (congratsPopup) congratsPopup.classList.add('hidden');

  const gameScreen = document.getElementById('game-screen');
  if (gameScreen) gameScreen.classList.remove('active');

  // Полная очистка
  const holesRow = document.getElementById('holes-row');
  if (holesRow) holesRow.innerHTML = '';

  const container = document.getElementById('current-worm-container');
  if (container) {
    const oldWorm = document.getElementById('current-worm');
    if (oldWorm) oldWorm.remove();
  }

  const welcomePopup = document.getElementById('welcome-popup');
  if (welcomePopup) welcomePopup.classList.remove('hidden');
  
  // Сброс переменных
  wormSequence = [];
  currentWormIndex = 0;
  filledCount = 0;
}

// ===== ИГРА С НОРКАМИ =====
function initHoleGame() {
  console.log('✅ initHoleGame called');
  
  const indices = [];
  for (let i = 1; i <= 10; i++) indices.push(i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  wormSequence = indices.slice(0, 8);
  console.log('Worm sequence:', wormSequence);

  const holesRow = document.getElementById('holes-row');
  if (!holesRow) {
    console.error('❌ holes-row not found');
    return;
  }
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

  // Автоматически показываем первого червяка
  showCurrentWorm();
}

function showCurrentWorm() {
  console.log('✅ showCurrentWorm called, index:', currentWormIndex);
  
  if (currentWormIndex >= wormSequence.length) {
    console.log('All worms placed, showing congrats');
    setTimeout(showCongrats, 500);
    return;
  }

  const wormId = wormSequence[currentWormIndex];
  
  // Удаляем старого червяка если есть
  const oldWorm = document.getElementById('current-worm');
  if (oldWorm) {
    oldWorm.remove();
  }
  
  // Создаём нового червяка
  const container = document.getElementById('current-worm-container');
  if (!container) {
    console.error('❌ current-worm-container not found');
    return;
  }
  
  const newWorm = document.createElement('img');
  newWorm.id = 'current-worm';
  newWorm.alt = 'Червяк';
  newWorm.src = `worms/worm${wormId}.png`;
  newWorm.dataset.wormId = wormId;
  newWorm.style.cssText = '';
  newWorm.style.cursor = 'grab';
  
  container.appendChild(newWorm);
  
  console.log('Worm created:', newWorm.src);
  
  // Навешиваем обработчики drag
  initDrag();
}

// ===== DRAG & DROP =====
function initDrag() {
  const wormImg = document.getElementById('current-worm');
  if (!wormImg) {
    console.error('❌ current-worm not found for drag');
    return;
  }

  // Удаляем старые обработчики через клонирование
  const newWorm = wormImg.cloneNode(true);
  wormImg.parentNode.replaceChild(newWorm, wormImg);

  let originalParent = null;
  let originalNextSibling = null;

  newWorm.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = newWorm.getBoundingClientRect();

    drag.active = true;
    drag.el = newWorm;
    drag.offsetX = e.clientX - rect.left;
    drag.offsetY = e.clientY - rect.top;
    drag.width = rect.width;
    drag.height = rect.height;

    originalParent = newWorm.parentNode;
    originalNextSibling = newWorm.nextSibling;

    document.body.appendChild(newWorm);

    newWorm.style.position = 'fixed';
    newWorm.style.left = rect.left + 'px';
    newWorm.style.top = rect.top + 'px';
    newWorm.style.width = drag.width + 'px';
    newWorm.style.height = drag.height + 'px';
    newWorm.style.maxWidth = 'none';
    newWorm.style.maxHeight = 'none';
    newWorm.style.zIndex = '9999';
    newWorm.style.cursor = 'grabbing';
    newWorm.style.filter = 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))';
    newWorm.style.margin = '0';
    newWorm.style.padding = '0';
    newWorm.style.transition = 'none';

    try {
      newWorm.setPointerCapture(e.pointerId);
    } catch (err) {}
  });

  newWorm.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    e.preventDefault();

    drag.el.style.left = (e.clientX - drag.offsetX) + 'px';
    drag.el.style.top = (e.clientY - drag.offsetY) + 'px';
  });

  newWorm.addEventListener('pointerup', (e) => {
    if (!drag.active) return;
    drag.active = false;
    checkDrop(e.clientX, e.clientY, originalParent, originalNextSibling);
  });

  newWorm.addEventListener('pointercancel', () => {
    if (!drag.active) return;
    drag.active = false;
    returnWorm(originalParent, originalNextSibling);
  });
}

function checkDrop(x, y, originalParent, originalNextSibling) {
  const el = drag.el;
  if (!el) return;

  el.style.display = 'none';
  const target = document.elementFromPoint(x, y);
  el.style.display = '';

  const hole = target ? target.closest('.hole') : null;

  if (hole && !hole.classList.contains('filled') && hole.dataset.wormId === el.dataset.wormId) {
    // ✅ Совпадение
    hole.innerHTML = `<img src="${el.src}" style="width:100%;height:100%;object-fit:contain;">`;
    hole.classList.add('filled');
    filledCount++;

    playSound(sounds.success);

    el.remove();

    if (filledCount === totalHoles) {
      setTimeout(showCongrats, 600);
    } else {
      // Автоматически показываем следующего червяка
      currentWormIndex++;
      setTimeout(() => {
        showCurrentWorm();
      }, 600);
    }
  } else {
    returnWorm(originalParent, originalNextSibling);
  }
}

function returnWorm(originalParent, originalNextSibling) {
  const el = drag.el;
  if (!el || !originalParent) return;

  if (originalNextSibling) {
    originalParent.insertBefore(el, originalNextSibling);
  } else {
    originalParent.appendChild(el);
  }

  el.style.cssText = '';
  el.style.cursor = 'grab';
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

  console.log('✅ Event listeners initialized');
});

// Экспорт функций
window.startGame = startGame;
window.restartGame = restartGame;
window.showCongrats = showCongrats;
