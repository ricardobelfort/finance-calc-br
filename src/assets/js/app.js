/**
 * APP.JS - Funcionalidades Globais
 * - Tema claro/escuro
 * - Menu hamburger responsivo
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
// Menu Hamburger
// ==========================================

function initializeHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = navMenu?.querySelectorAll('a');

  if (!hamburger || !navMenu) return;

  // Toggle menu ao clicar no hamburger
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active'));
  });

  // Fechar menu ao clicar em um link
  navLinks?.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', false);
    });
  });

  // Fechar menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', false);
    }
  });
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
  initializeHamburger();
  initializeScrollToTop();

  // Adicionar event listener ao botão de tema
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      toggleTheme();
    });
  }
});

// Atualizar ao mudar preferência do sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === null) {
    initializeTheme();
  }
});
