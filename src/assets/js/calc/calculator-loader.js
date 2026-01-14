/**
 * CALCULATOR-LOADER.JS
 * Carrega scripts de calculadoras de forma dinâmica com base em `data-calculator`.
 * Motivo: evitar carregar todos os scripts em todas as páginas.
 *
 * Regras:
 * - Em cada página, use: <div data-calculator="slug-da-calculadora"></div>
 * - O script correspondente será carregado 1x.
 * - Compatível com dois padrões:
 *   (1) NOVO: window.__financeCalc[slug].render(container)
 *   (2) LEGADO: script se auto-inicializa ao carregar
 */
(() => {
  const map = {
    // compras/financiamento
    'finance-vs-cash': '/assets/js/calc/finance-vs-cash.js',
    'financiar-vs-vista': '/assets/js/calc/finance-vs-cash.js',

    // cartão
    'juros-cartao-rotativo': '/assets/js/calc/cc-revolving-interest.js',
    'cc-revolving-interest': '/assets/js/calc/cc-revolving-interest.js',
    'parcelar-fatura-vs-pagar-tudo': '/assets/js/calc/cc-installment-vs-rotativo.js',
    'cc-installment-vs-rotativo': '/assets/js/calc/cc-installment-vs-rotativo.js',

    // empréstimos
    'emprestimo-pessoal': '/assets/js/calc/emprestimo-pessoal.js',

    // investimentos
    'juros-compostos': '/assets/js/calc/juros-compostos.js',

    // milhas
    'cashback-milhas': '/assets/js/calc/cashback-milhas.js',
  };

  // Track por src para garantir "load 1x"
  const loaded = new Set();

  function uniq(arr) {
    return Array.from(new Set(arr));
  }

  function getPlaceholders() {
    return Array.from(document.querySelectorAll('[data-calculator]'));
  }

  function getNeededKeys() {
    return uniq(
      getPlaceholders()
        .map((el) => (el.getAttribute('data-calculator') || '').trim())
        .filter(Boolean),
    );
  }

  function loadScriptOnce(src) {
    if (!src || loaded.has(src)) return Promise.resolve();
    loaded.add(src);

    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true; // paralelismo ok
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Falha ao carregar: ${src}`));
      document.head.appendChild(s);
    });
  }

  function showError(el, message) {
    // Evita quebrar layout
    el.innerHTML = `
      <div class="alert alert-error">
        ${message}
      </div>
    `;
  }

  function mountIfAvailable(el) {
    const key = (el.getAttribute('data-calculator') || '').trim();
    if (!key) return;

    // Padrão novo: registry
    const registry = window.__financeCalc;
    const api = registry && registry[key];

    // Só monta se existir render()
    if (api && typeof api.render === 'function') {
      try {
        api.render(el);
      } catch (e) {
        console.error('[calculator-loader] erro ao renderizar', key, e);
        showError(el, `❌ Erro ao renderizar a calculadora <strong>${key}</strong>.`);
      }
    } else {
      // Padrão legado: não fazemos nada aqui
      // (script já deve se auto-inicializar sozinho)
    }
  }

  async function boot() {
    const placeholders = getPlaceholders();
    const keys = getNeededKeys();
    if (keys.length === 0) return;

    const missing = keys.filter((k) => !map[k]);
    if (missing.length) {
      console.warn('[calculator-loader] Nenhum script mapeado para:', missing);
      // Mostra aviso nos containers (ajuda debug)
      placeholders.forEach((el) => {
        const k = (el.getAttribute('data-calculator') || '').trim();
        if (k && missing.includes(k)) {
          showError(el, `⚠️ Calculadora não mapeada: <strong>${k}</strong>.`);
        }
      });
    }

    const scripts = keys.map((k) => map[k]).filter(Boolean);

    // 1) carrega todos os scripts necessários
    for (const src of scripts) {
      try {
        await loadScriptOnce(src);
      } catch (err) {
        console.error(err);
      }
    }

    // 2) depois de carregar, tenta montar via registry (se existir)
    placeholders.forEach((el) => mountIfAvailable(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
