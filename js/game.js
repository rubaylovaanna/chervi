// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let currentSearchScreen = 1;
const totalSearchScreens = 6;

let wormSequence = [];
let currentWormIndex = 0;
let filledCount = 0;
let totalHoles = 8;

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentWormElement = null;
let originalPosition = null;

// ===== ПОПАПЫ =====
function startGame() {
  document.getElementById('welcome-popup').classList.add('hidden');
  showScreen('screen1');
}

function showBucketPopup() {
  showScreen('screen8');
  document.getElementById('bucket-popup').classList.remove('hidden');
}

function startHoleGame() {
  document.getElementById('bucket-popup').classList.add('hidden');
  initHoleGame();
}

function showCongrats() {
  document.getElementById('congrats-popup').classList.remove('hidden');
}

// ===== УПРАВЛЕНИЕ ЭКРАНАМИ =====
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// ===== ЭКРАНЫ ПОИСКА (1-6) =====
function onObjectClick(screenNum) {
  const screen = document.getElementById('screen' + screenNum);
  const object = screen.querySelector('.object-big');
  const worm = screen.querySelector('.worm-found');

  if (object.style.display === 'none') return;

  // Скрываем предмет, показываем червяка
  object.style.display = 'none';
  worm.classList.add('show');

  // Через 1.5 сек — переход на следующий экран
  setTimeout(() => {
    if (screenNum < totalSearchScreens) {
      showScreen('screen' + (screenNum + 1));
    } else {
      showScreen('screen7');
    }
  }, 1500);
}

// ===== ИГРА С НОРКАМИ =====
function initHoleGame() {
  // Выбираем 8 случайных пар из 10
  const indices = [];
  for (let i = 1; i <= 10; i++) indices.push(i);

  // Перемешиваем (алгоритм Фишера-Йетса)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  wormSequence = indices.slice(0, 8);

  // Создаём норки в случайном порядке
  const holesRow = document.getElementById('holes-row');
  holesRow.innerHTML = '';

  const shuffledHoles = [...wormSequence].sort(() => Math.random() - 0.5);

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

  // Анимация появления
  wormImg.classList.remove('show');
  void wormImg.offsetWidth; // Перезапуск анимации
  wormImg.classList.add('show');
}

// ===== DRAG & DROP =====
document.addEventListener('pointerdown', (e) => {
  if (e.target.classList.contains('draggable-worm')) {
    startDrag(e);
  }
});

document.addEventListener('pointermove', onDrag);
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);

function startDrag(e) {
  e.preventDefault();
  isDragging = true;
  currentWormElement = e.target;

  const rect = currentWormElement.getBoundingClientRect();
  originalPosition = { left: rect.left, top: rect.top };
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;

  // Фиксируем позицию
  currentWormElement.style.position = 'fixed';
  currentWormElement.style.left = rect.left + 'px';
  currentWormElement.style.top = rect.top + 'px';
  currentWormElement.style.zIndex = '1000';
  currentWormElement.style.cursor = 'grabbing';

  // Захват указателя
  try {
    currentWormElement.setPointerCapture(e.pointerId);
  } catch (err) {
    // Игнорируем, если не поддерживается
  }
}

function onDrag(e) {
  if (!isDragging || !currentWormElement) return;
  e.preventDefault();

  currentWormElement.style.left = (e.clientX - dragOffsetX) + 'px';
  currentWormElement.style.top = (e.clientY - dragOffsetY) + 'px';
}

function endDrag(e) {
  if (!isDragging || !currentWormElement) return;
  isDragging = false;

  checkDrop(e.clientX, e.clientY);
}

function checkDrop(x, y) {
  // Временно отключаем pointer-events для проверки элемента под курсором
  currentWormElement.style.pointerEvents = 'none';
  const element = document.elementFromPoint(x, y);
  currentWormElement.style.pointerEvents = 'auto';

  const hole = element ? element.closest('.hole') : null;

  if (hole && !hole.classList.contains('filled')) {
    if (hole.dataset.wormId === currentWormElement.dataset.wormId) {
      // Совпадение! Червяк занимает место норки
      hole.innerHTML = `<img src="${currentWormElement.src}" style="width:100%;height:100%;object-fit:contain;">`;
      hole.classList.add('filled');
      filledCount++;

      // Сбрасываем стили перетаскиваемого элемента
      resetWormStyles();

      if (filledCount === totalHoles) {
        setTimeout(showCongrats, 600);
      } else {
        currentWormIndex++;
        setTimeout(showCurrentWorm, 600);
      }
    } else {
      // Не совпадение — возвращаем червяка
      returnWorm();
    }
  } else {
    // Попали не в норку — возвращаем
    returnWorm();
  }
}

function returnWorm() {
  if (!currentWormElement || !originalPosition) return;

  currentWormElement.style.transition = 'all 0.3s ease';
  currentWormElement.style.left = originalPosition.left + 'px';
  currentWormElement.style.top = originalPosition.top + 'px';

  setTimeout(() => {
    resetWormStyles();
  }, 300);
}

function resetWormStyles() {
  if (!currentWormElement) return;

  currentWormElement.style.transition = '';
  currentWormElement.style.position = '';
  currentWormElement.style.left = '';
  currentWormElement.style.top = '';
  currentWormElement.style.zIndex = '';
  currentWormElement.style.cursor = 'grab';
}

// ===== РЕСТАРТ =====
function restartGame() {
  document.getElementById('congrats-popup').classList.add('hidden');

  // Сброс экранов поиска
  for (let i = 1; i <= totalSearchScreens; i++) {
    const screen = document.getElementById('screen' + i);
    const object = screen.querySelector('.object-big');
    const worm = screen.querySelector('.worm-found');
    if (object) object.style.display = '';
    if (worm) {
      worm.classList.remove('show');
      worm.style.opacity = '0';
      worm.style.transform = 'translate(-50%, -50%) scale(0)';
    }
  }

  // Сброс игры с норками
  const holesRow = document.getElementById('holes-row');
  if (holesRow) holesRow.innerHTML = '';

  const currentWorm = document.getElementById('current-worm');
  if (currentWorm) {
    currentWorm.src = '';
    currentWorm.classList.remove('show');
  }

  // Возврат на приветствие
  currentSearchScreen = 1;
  document.getElementById('welcome-popup').classList.remove('hidden');
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
window.addEventListener('load', () => {
  // Приветственный попап показывается по умолчанию
  console.log('Игра загружена!');
});

// Блокируем контекстное меню для мобильных
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Блокируем двойной тап для зума
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);
