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

// ===== ФУНКЦИИ ПОПАПОВ =====
function startGame() {
  console.log('✅ startGame called');
  const welcomePopup = document.getElementById('welcome-popup');
  if (welcomePopup) welcomePopup.classList.add('hidden');

  const gameScreen = document.getElementById('game-screen');
  if (gameScreen) gameScreen.classList.add('active');

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

  // Полный сброс стилей
  wormImg.style.cssText = '';
  wormImg.style.cursor = 'grab';

  wormImg.src = `worms/worm${wormId}.png`;
  wormImg.dataset.wormId = wormId;
}

// ===== DRAG & DROP =====
function initDrag() {
  const wormImg = document.getElementById('current-worm');
  if (!wormImg) return;

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

    // Запоминаем где был элемент
    originalParent = newWorm.parentNode;
    originalNextSibling = newWorm.nextSibling;

    // Перемещаем в body — теперь он поверх ВСЕГО
    document.body.appendChild(newWorm);

    // Фиксируем размеры и позицию
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

  // Скрываем чтобы найти элемент под курсором
  el.style.display = 'none';
  const target = document.elementFromPoint(x, y);
  el.style.display = '';

  const hole = target ? target.closest('.hole') : null;

  if (hole && !hole.classList.contains('filled') && hole.dataset.wormId === el.dataset.wormId) {
    // ✅ Совпадение — заменяем норку на червяка
    hole.innerHTML = `<img src="${el.src}" style="width:100%;height:100%;object-fit:contain;">`;
    hole.classList.add('filled');
    filledCount++;

    // Удаляем перетаскиваемого червяка
    el.remove();

    if (filledCount === totalHoles) {
      setTimeout(showCongrats, 600);
    } else {
      // ⚠️ Создаём НОВЫЙ элемент #current-worm в контейнере
      const container = document.getElementById('current-worm-container');
      const newWorm = document.createElement('img');
      newWorm.id = 'current-worm';
      newWorm.alt = 'Червяк';
      newWorm.style.cssText = '';
      newWorm.style.cursor = 'grab';
      container.appendChild(newWorm);

      // Перенавешиваем обработчики drag на новый элемент
      initDrag();

      currentWormIndex++;
      setTimeout(showCurrentWorm, 600);
    }
  } else {
    // ❌ Возврат в контейнер
    returnWorm(originalParent, originalNextSibling);
  }
}

function returnWorm(originalParent, originalNextSibling) {
  const el = drag.el;
  if (!el || !originalParent) return;

  // Возвращаем в оригинальный контейнер
  if (originalNextSibling) {
    originalParent.insertBefore(el, originalNextSibling);
  } else {
    originalParent.appendChild(el);
  }

  // Сбрасываем стили
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

  initDrag();
  console.log('✅ Drag initialized');
});

// Экспорт функций
window.startGame = startGame;
window.restartGame = restartGame;
window.showCongrats = showCongrats;
