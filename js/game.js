// ===== DRAG & DROP =====
function initDrag() {
  const wormImg = document.getElementById('current-worm');

  wormImg.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Получаем текущие координаты и размеры ДО любых изменений
    const rect = wormImg.getBoundingClientRect();

    drag.active = true;
    drag.el = wormImg;
    drag.offsetX = e.clientX - rect.left;
    drag.offsetY = e.clientY - rect.top;
    drag.width = rect.width;
    drag.height = rect.height;
    drag.containerRect = document.getElementById('current-worm-container').getBoundingClientRect();

    // 2. Устанавливаем ВСЕ стили синхронно, в правильном порядке
    // Сначала размеры в пикселях (чтобы элемент не изменил размер)
    wormImg.style.width = drag.width + 'px';
    wormImg.style.height = drag.height + 'px';
    wormImg.style.maxWidth = 'none';
    wormImg.style.maxHeight = 'none';

    // Потом позицию (left/top) — ДО смены position
    wormImg.style.left = rect.left + 'px';
    wormImg.style.top = rect.top + 'px';

    // И только теперь меняем position на fixed
    wormImg.style.position = 'fixed';
    wormImg.style.zIndex = '1000';
    wormImg.style.cursor = 'grabbing';
    wormImg.style.filter = 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))';
    wormImg.style.margin = '0';
    wormImg.style.padding = '0';

    // Захват указателя
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
// ===== ИНИЦИАЛИЗАЦИЯ КНОПОК =====
document.addEventListener('DOMContentLoaded', () => {
  // Кнопка Старт
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', startGame);
  }

  // Кнопка Начать сначала
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', restartGame);
  }

  // Инициализация drag & drop
  initDrag();
});

// Делаем функции глобальными (на всякий случай)
window.startGame = startGame;
window.restartGame = restartGame;
