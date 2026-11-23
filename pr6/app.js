'use strict';

// Початковий набір даних (Каталог навчальних модулів)
const INITIAL_MODULES = [
  {
    id: 1,
    category: 'UI/UX Design',
    title: 'Архітектура дизайн-систем',
    description: 'Побудова трирівневої ієрархії токенів: Primitive, Semantic та Component.',
    duration: '45 хв'
  },
  {
    id: 2,
    category: 'Frontend',
    title: 'Життєвий цикл Screen States',
    description: 'Моделювання станів Loading, Content, Empty та Error у динамічних SPA.',
    duration: '60 хв'
  },
  {
    id: 3,
    category: 'Accessibility',
    title: 'Семантика та доступність (a11y)',
    description: 'Правильне використання тегів button, label та керування фокусом з клавіатури.',
    duration: '30 хв'
  },
  {
    id: 4,
    category: 'CSS Architecture',
    title: 'Нативні CSS Custom Properties',
    description: 'Динамічна зміна теми (Light / Dark) без дублювання класів компонентів.',
    duration: '40 хв'
  }
];

// Стан додатку
let modules = [...INITIAL_MODULES];
let loadingTimerId = null;

// Посилання на DOM-елементи
const stateContainers = document.querySelectorAll('[data-state]');
const switcherButtons = document.querySelectorAll('[data-switch-state]');
const cardsContainer = document.getElementById('cards-container');
const searchInput = document.getElementById('search-input');
const btnRefresh = document.getElementById('btn-refresh');
const btnClearAll = document.getElementById('btn-clear-all');
const btnEmptyReset = document.getElementById('btn-empty-reset');
const btnErrorRetry = document.getElementById('btn-error-retry');
const btnThemeToggle = document.getElementById('btn-theme-toggle');

/**
 * Перемикає активний стан екрана без інлайн-стилів (через клас .is-hidden)
 * @param {'loading' | 'content' | 'empty' | 'error'} targetState
 */
function renderState(targetState) {
  stateContainers.forEach((container) => {
    const isTarget = container.dataset.state === targetState;
    container.classList.toggle('is-hidden', !isTarget);
  });

  switcherButtons.forEach((btn) => {
    const isCurrent = btn.dataset.switchState === targetState;
    btn.classList.toggle('is-active', isCurrent);
    btn.setAttribute('aria-pressed', String(isCurrent));
  });
}

/**
 * Рендерить картки у контейнер стану content або переводить екран у стан empty
 * @param {Array} items
 */
function renderCards(items) {
  if (!items || items.length === 0) {
    renderState('empty');
    return;
  }

  cardsContainer.innerHTML = '';

  items.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'card';

    article.innerHTML = `
      <div>
        <span class="card-badge">${item.category}</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-desc">${item.description}</p>
      </div>
      <div class="card-footer">
        <span class="card-meta">Тривалість: ${item.duration}</span>
        <button type="button" class="btn btn-danger" data-delete-id="${item.id}">
          Видалити
        </button>
      </div>
    `;

    cardsContainer.appendChild(article);
  });

  renderState('content');
}

/**
 * Імітація асинхронного запиту на сервер (1.6 секунди)
 */
function simulateAsyncLoad() {
  if (loadingTimerId !== null) {
    window.clearTimeout(loadingTimerId);
  }

  renderState('loading');

  loadingTimerId = window.setTimeout(() => {
    loadingTimerId = null;
    applyFilterAndRender();
  }, 1600);
}

/**
 * Фільтрує список за пошуковим запитом та оновлює відображення
 */
function applyFilterAndRender() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    renderCards(modules);
    return;
  }

  const filtered = modules.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
  );

  renderCards(filtered);
}

/**
 * Скидає фільтри та відновлює початковий список елементів
 */
function resetDataAndFilters() {
  searchInput.value = '';
  modules = [...INITIAL_MODULES];
  renderCards(modules);
}

// ============================================================================
// ОБРОБНИКИ ПОДІЙ
// ============================================================================

// 1. Панель швидкого перемикання станів (State Switcher)
switcherButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (loadingTimerId !== null) {
      window.clearTimeout(loadingTimerId);
      loadingTimerId = null;
    }

    const nextState = btn.dataset.switchState;
    if (nextState === 'content' && modules.length === 0) {
      modules = [...INITIAL_MODULES];
      renderCards(modules);
    } else if (nextState === 'content') {
      applyFilterAndRender();
    } else {
      renderState(nextState);
    }
  });
});

// 2. Пошук у реальному часі (природний перехід у стан empty при нульовому збігу)
searchInput.addEventListener('input', () => {
  applyFilterAndRender();
});

// 3. Видалення окремої картки (делегування подій)
cardsContainer.addEventListener('click', (event) => {
  const deleteBtn = event.target.closest('[data-delete-id]');
  if (!deleteBtn) return;

  const idToRemove = Number(deleteBtn.dataset.deleteId);
  modules = modules.filter((item) => item.id !== idToRemove);
  applyFilterAndRender();
});

// 4. Очищення всіх карток -> перехід у Empty State
btnClearAll.addEventListener('click', () => {
  modules = [];
  renderCards(modules);
});

// 5. Кнопки відновлення та оновлення з імітацією завантаження
btnRefresh.addEventListener('click', simulateAsyncLoad);
btnErrorRetry.addEventListener('click', simulateAsyncLoad);
btnEmptyReset.addEventListener('click', resetDataAndFilters);

// 6. Перемикач теми (Light / Dark Theme)
btnThemeToggle.addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';

  if (isDark) {
    root.removeAttribute('data-theme');
    btnThemeToggle.textContent = 'Темна тема';
    btnThemeToggle.setAttribute('aria-pressed', 'false');
  } else {
    root.setAttribute('data-theme', 'dark');
    btnThemeToggle.textContent = 'Світла тема';
    btnThemeToggle.setAttribute('aria-pressed', 'true');
  }
});

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
  renderCards(modules);
});