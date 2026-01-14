const __boot = () => {
  const container = document.querySelector('[data-calculator="juros-compostos"]');
  if (!container) return;

  container.innerHTML = `
    <div class="calculator">
      <div class="calculator-title">Simulador de Juros Compostos</div>

      <div class="calculator-grid">
        <div class="calculator-group">
          <label>Valor inicial (R$)</label>
          <input type="number" id="jc-inicial" placeholder="Ex: 1000">
        </div>

        <div class="calculator-group">
          <label>Aporte mensal (R$)</label>
          <input type="number" id="jc-aporte" placeholder="Ex: 200">
        </div>

        <div class="calculator-group">
          <label>Taxa (%)</label>
          <input type="number" id="jc-taxa" step="0.01" placeholder="Ex: 1">
        </div>

        <div class="calculator-group">
          <label>Tipo de taxa</label>
          <select id="jc-tipo">
            <option value="mensal" selected>Mensal</option>
            <option value="anual">Anual</option>
          </select>
        </div>

        <div class="calculator-group">
          <label>Prazo</label>
          <input type="number" id="jc-prazo" placeholder="Ex: 24">
        </div>

        <div class="calculator-group">
          <label>Unidade</label>
          <select id="jc-unidade">
            <option value="meses" selected>Meses</option>
            <option value="anos">Anos</option>
          </select>
        </div>
      </div>

      <div class="calculator-controls">
        <button class="btn btn-primary" id="jc-calcular">Calcular</button>
        <button class="btn btn-secondary" id="jc-limpar" type="button">Limpar</button>
      </div>

      <div class="calculator-results" id="jc-resultado"></div>

      <div id="jc-tabela-wrap" style="display:none; margin-top: 16px;">
        <div class="table-wrap" aria-label="Tabela com rolagem horizontal">
          <table class="installment-table" aria-label="Evolução mês a mês">
            <thead>
              <tr>
                <th style="text-align:right;">Período</th>
                <th style="text-align:right;">Saldo (R$)</th>
                <th style="text-align:right;">Aportes (R$)</th>
                <th style="text-align:right;">Juros ganhos (R$)</th>
              </tr>
            </thead>
            <tbody id="jc-tabela"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const $ = (id) => document.getElementById(id);

  function toMonthlyRate(rate, tipo) {
    const r = rate / 100;
    if (tipo === 'mensal') return r;
    // anual -> mensal (equivalente)
    return Math.pow(1 + r, 1 / 12) - 1;
  }

  function calc() {
    const inicial = parseFloat($('jc-inicial').value || '0');
    const aporte = parseFloat($('jc-aporte').value || '0');
    const taxa = parseFloat($('jc-taxa').value || '0');
    const tipo = $('jc-tipo').value;
    const prazo = parseInt($('jc-prazo').value || '0', 10);
    const unidade = $('jc-unidade').value;

    if (prazo <= 0 || taxa <= 0) {
      const r = $('jc-resultado');
      r.classList.add('show');
      r.innerHTML = `
        <div class="alert alert-warning">
          Preencha uma <strong>taxa</strong> e um <strong>prazo</strong> válidos.
        </div>
      `;
      $('jc-tabela-wrap').style.display = 'none';
      return;
    }

    const meses = unidade === 'anos' ? prazo * 12 : prazo;
    const i = toMonthlyRate(taxa, tipo);

    let saldo = inicial;
    let totalAportes = inicial;
    let totalJuros = 0;

    const rows = [];

    for (let m = 1; m <= meses; m++) {
      // juros do mês sobre saldo atual
      const jurosMes = saldo * i;
      saldo += jurosMes;

      // aporte no fim do mês (mais realista e simples)
      saldo += aporte;

      totalJuros += jurosMes;
      totalAportes += aporte;

      rows.push({
        periodo: m,
        saldo,
        aportes: totalAportes,
        juros: totalJuros,
      });
    }

    const resultado = $('jc-resultado');
    resultado.classList.add('show');
    resultado.innerHTML = `
      <div class="result-item">
        <span class="result-label">Saldo final</span>
        <span class="result-value">${formatCurrency(saldo)}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Total investido (aportes)</span>
        <span class="result-value">${formatCurrency(totalAportes)}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Juros ganhos</span>
        <span class="result-value">${formatCurrency(totalJuros)}</span>
      </div>
      <div class="result-recommendation">
        Quanto maior o prazo e o aporte, maior o efeito dos <strong>juros sobre juros</strong>.
      </div>
    `;

    // Tabela (limite pra não ficar gigante)
    const tbody = $('jc-tabela');
    tbody.innerHTML = '';

    const maxRows = 120; // 10 anos (mensal)
    const slice = rows.length > maxRows ? rows.slice(rows.length - maxRows) : rows;

    slice.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:right;">${r.periodo}</td>
        <td style="text-align:right;">${formatCurrency(r.saldo)}</td>
        <td style="text-align:right;">${formatCurrency(r.aportes)}</td>
        <td style="text-align:right;">${formatCurrency(r.juros)}</td>
      `;
      tbody.appendChild(tr);
    });

    $('jc-tabela-wrap').style.display = 'block';
  }

  function clearAll() {
    $('jc-inicial').value = '';
    $('jc-aporte').value = '';
    $('jc-taxa').value = '';
    $('jc-tipo').value = 'mensal';
    $('jc-prazo').value = '';
    $('jc-unidade').value = 'meses';
    $('jc-resultado').classList.remove('show');
    $('jc-resultado').innerHTML = '';
    $('jc-tabela-wrap').style.display = 'none';
    $('jc-tabela').innerHTML = '';
  }

  $('jc-calcular').addEventListener('click', calc);
  $('jc-limpar').addEventListener('click', clearAll);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', __boot);
} else {
  __boot();
}

