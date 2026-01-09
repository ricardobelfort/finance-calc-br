/**
 * APP.JS - Funcionalidades Globais
 * - Tema claro/escuro
 * - Scroll to top
 */

// ==========================================
// Theme Management
// ==========================================

const THEME_KEY = 'theme-preference';
const DARK_MODE_CLASS = 'dark';

function initializeTheme() {
  // Verificar preferência salva
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

  if (isDark) {
    document.documentElement.classList.add(DARK_MODE_CLASS);
  } else {
    document.documentElement.classList.remove(DARK_MODE_CLASS);
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains(DARK_MODE_CLASS);

  if (isDark) {
    document.documentElement.classList.remove(DARK_MODE_CLASS);
    localStorage.setItem(THEME_KEY, 'light');
  } else {
    document.documentElement.classList.add(DARK_MODE_CLASS);
    localStorage.setItem(THEME_KEY, 'dark');
  }
}

// ==========================================
// Scroll to Top
// ==========================================

function initializeScrollToTop() {
  const button = document.createElement('button');
  button.className = 'scroll-to-top';
  button.setAttribute('aria-label', 'Voltar ao topo');
  button.innerHTML = '<i data-feather="arrow-up"></i>';
  document.body.appendChild(button);

  // Renderizar ícone Feather
  setTimeout(() => {
    if (window.feather) {
      window.feather.replace({ class: 'icon' });
    }
  }, 0);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  });

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
}

// ==========================================
// Format Currency
// ==========================================

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

window.formatCurrency = formatCurrency;

// ==========================================
// Format Percentage
// ==========================================

function formatPercentage(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

window.formatPercentage = formatPercentage;

// ==========================================
// Inicializar
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initializeScrollToTop();

  // Criar botão de tema no header se não existir
  if (!document.querySelector('.theme-toggle')) {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Alternar tema');
    const isDark = document.documentElement.classList.contains(DARK_MODE_CLASS);
    themeToggle.innerHTML = isDark ? '<i data-feather="sun"></i>' : '<i data-feather="moon"></i>';
    
    themeToggle.addEventListener('click', () => {
      toggleTheme();
      const isDarkNow = document.documentElement.classList.contains(DARK_MODE_CLASS);
      themeToggle.innerHTML = isDarkNow ? '<i data-feather="sun"></i>' : '<i data-feather="moon"></i>';
      // Renderizar novamente o ícone
      setTimeout(() => {
        if (window.feather) {
          window.feather.replace({ class: 'icon' });
        }
      }, 0);
    });

    // Adicionar ao nav-container (header) em vez do body
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
      navContainer.appendChild(themeToggle);
    } else {
      document.body.appendChild(themeToggle);
    }
    
    // Renderizar ícone inicial
    setTimeout(() => {
      if (window.feather) {
        window.feather.replace({ class: 'icon' });
      }
    }, 0);
  }
});

// Atualizar ao mudar preferência do sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === null) {
    initializeTheme();
  }
});
