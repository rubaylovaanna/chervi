// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let wormSequence = [];
let currentWormIndex = 0;
let filledCount = 0;
let totalHoles = 8;

// Drag & Drop
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentWormElement = null;
let wormContainerRect = null;

// ===== ПОПАПЫ =====
function startGame() {
  document.getElementById('welcome-popup').classList.add('hidden');
  initHoleGame();
}

function showCongrats() {
  document.getElementById('congrats-popup').classList.remove('hidden');
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

  // Сбрасываем стили drag
  wormImg.classList.remove('dragging');
  wormImg.style.position = '';
  wormImg.style.left = '';
  wormImg.style.top = '';
  wormImg.style.zIndex = '';
  wormImg.style.pointerEvents = '';
  wormImg.style.cursor = 'grab';

  wormImg.src = `worms/worm${wormId}.png`;
  wormImg.dataset.wormId = wormId;

  // Анимация появления
  wormImg.classList.remove('show');
  void wormImg.offsetWidth;
  wormImg.classList.add('show');
}

// ===== DRAG & DROP (Pointer Events — мышь + тач) =====
document.addEventListener('pointerdown', (e) => {
  const worm = e.target.closest('.draggable-worm');
  if (worm && !worm.classList.contains('dragging')) {
    startDrag(e, worm);
  }
});

document.addEventListener('pointermove', (e) => {
  if (isDragging && currentWormElement) {
    e.preventDefault();
    onDrag(e);
  }
});

document.addEventListener('pointerup', (e) => {
  if (isDragging && currentWormElement) {
    endDrag(e);
  }
});

document.addEventListener('pointercancel', (e) => {
  if (isDragging && currentWormElement) {
    endDrag(e);
  }
});

function startDrag(e, worm) {
  e.preventDefault();
  isDragging = true;
  currentWormElement = worm;

  // Запоминаем позицию контейнера для возврата
  const container = document.getElementById('current-worm-container');
  wormContainerRect = container.getBoundingClientRect();

  const rect = worm.getBoundingClientRect();

  // ✅ КУРСОР ПО ЦЕНТРУ ЧЕРВЯКА
  dragOffsetX = rect.width / 2;
  dragOffsetY = rect.height / 2;

  // Переносим червяка в body для свободного перемещения
  worm.classList.add('dragging');
  worm.style.left = (e.clientX - dragOffsetX) + 'px';
  worm.style.top = (e.clientY - dragOffsetY) + 'px';

  // Захват указателя
  try {
    worm.setPointerCapture(e.pointerId);
  } catch (err) {
    // Игнорируем
  }
}

function onDrag(e) {
  if (!isDragging || !currentWormElement) return;

  // Червяк следует за курсором (центр червяка = позиция курсора)
  currentWormElement.style.left = (e.clientX - dragOffsetX) + 'px';
  currentWormElement.style.top = (e.clientY - dragOffsetY) + 'px';
}

function endDrag(e) {
  if (!isDragging || !currentWormElement) return;
  isDragging = false;

  checkDrop(e.clientX, e.clientY);
}

function checkDrop(x, y) {
  if (!currentWormElement) return;

  // Временно скрываем червяка чтобы найти элемент под ним
  currentWormElement.style.display = 'none';
  const element = document.elementFromPoint(x, y);
  currentWormElement.style.display = '';

  const hole = element ? element.closest('.hole') : null;

  if (hole && !hole.classList.contains('filled')) {
    if (hole.dataset.wormId === currentWormElement.dataset.wormId) {
      // ✅ Совпадение! Червяк занимает место норки
      hole.innerHTML = `<img src="${currentWormElement.src}" style="width:100%;height:100%;object-fit:contain;">`;
      hole.classList.add('filled');
      filledCount++;

      // Сбрасываем стили
      resetWormStyles();

      if (filledCount === totalHoles) {
        setTimeout(showCongrats, 600);
      } else {
        currentWormIndex++;
        setTimeout(showCurrentWorm, 600);
      }
    } else {
      // ❌ Не совпадение — возвращаем
      returnWorm();
    }
  } else {
    // Не попали в норку — возвращаем
    returnWorm();
  }
}

function returnWorm() {
  if (!currentWormElement || !wormContainerRect) return;

  // Возвращаем в контейнер с анимацией
  currentWormElement.style.transition = 'all 0.4s ease';
  currentWormElement.style.left = (wormContainerRect.left + wormContainerRect.width / 2 - currentWormElement.offsetWidth / 2) + 'px';
  currentWormElement.style.top = (wormContainerRect.top + wormContainerRect.height / 2 - currentWormElement.offsetHeight / 2) + 'px';

  setTimeout(() => {
    resetWormStyles();
  }, 400);
}

function resetWormStyles() {
  if (!currentWormElement) return;

  currentWormElement.classList.remove('dragging');
  currentWormElement.style.transition = '';
  currentWormElement.style.position = '';
  currentWormElement.style.left = '';
  currentWormElement.style.top = '';
  currentWormElement.style.zIndex = '';
  currentWormElement.style.cursor = 'grab';
  currentWormElement.style.pointerEvents = '';
  currentWormElement.style.display = '';
  currentWormElement.style.filter = '';
}

// ===== РЕСТАРТ =====
function restartGame() {
  document.getElementById('congrats-popup').classList.add('hidden');

  // Сброс игры с норками
  const holesRow = document.getElementById('holes-row');
  if (holesRow) holesRow.innerHTML = '';

  const currentWorm = document.getElementById('current-worm');
  if (currentWorm) {
    currentWorm.src = '';
    currentWorm.classList.remove('show', 'dragging');
    currentWorm.style.position = '';
    currentWorm.style.left = '';
    currentWorm.style.top = '';
  }

  // Возврат на приветствие
  document.getElementById('welcome-popup').classList.remove('hidden');
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
window.addEventListener('load', () => {
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
