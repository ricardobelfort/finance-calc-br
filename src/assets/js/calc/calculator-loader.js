/**
 * CALCULATOR-LOADER.JS
 * Carrega scripts de calculadoras de forma dinâmica com base em `data-calculator`.
 * Motivo: evitar carregar todos os scripts em todas as páginas.
 *
 * Regras:
 * - Em cada página, use: <div data-calculator="slug-da-calculadora"></div>
 * - O script correspondente será carregado 1x.
 * - Cada arquivo de calculadora deve se auto-inicializar ao ser carregado (sem depender apenas de DOMContentLoaded).
 */
(() => {
  const map = {
    // compras/financiamento
    'finance-vs-cash': '/assets/js/calc/finance-vs-cash.js',

    // cartão
    'juros-cartao-rotativo': '/assets/js/calc/cc-revolving-interest.js',
    'cc-revolving-interest': '/assets/js/calc/cc-revolving-interest.js',
    'parcelar-fatura-vs-pagar-tudo': '/assets/js/calc/cc-installment-vs-rotativo.js',
    'cc-installment-vs-rotativo': '/assets/js/calc/cc-installment-vs-rotativo.js',

    // empréstimos
    'emprestimo-pessoal': '/assets/js/calc/emprestimo-pessoal.js',

    // investimentos
    'juros-compostos': '/assets/js/calc/juros-compostos.js',
  };

  const loaded = new Set();

  function uniq(arr) {
    return Array.from(new Set(arr));
  }

  function getNeededKeys() {
    return uniq(
      Array.from(document.querySelectorAll('[data-calculator]'))
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
      s.async = true; // permite paralelismo
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Falha ao carregar: ${src}`));
      document.head.appendChild(s);
    });
  }

  async function boot() {
    const keys = getNeededKeys();
    if (keys.length === 0) return;

    const scripts = keys
      .map((k) => map[k])
      .filter(Boolean);

    const missing = keys.filter((k) => !map[k]);
    if (missing.length) {
      // não quebra a página; só ajuda debug
      console.warn('[calculator-loader] Nenhum script mapeado para:', missing);
    }

    // carrega todos (uma vez)
    for (const src of scripts) {
      try {
        await loadScriptOnce(src);
      } catch (err) {
        console.error(err);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
