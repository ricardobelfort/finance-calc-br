const __boot = () => {
  const container = document.querySelector('[data-calculator="emprestimo-pessoal"]');
  if (!container) return;

  container.innerHTML = `
    <div class="calculator">
      <div class="calculator-title">Simulador de Empréstimo</div>

      <div class="calculator-grid">
        <div class="calculator-group">
          <label>Valor do empréstimo (R$)</label>
          <input type="number" id="valor" placeholder="Ex: 10000">
        </div>

        <div class="calculator-group">
          <label>Taxa de juros mensal (%)</label>
          <input type="number" id="juros" step="0.01" placeholder="Ex: 3">
        </div>

        <div class="calculator-group">
          <label>Número de meses</label>
          <input type="number" id="meses" placeholder="Ex: 24">
        </div>
      </div>

      <div class="calculator-controls">
        <button class="btn btn-primary" id="calcular">Calcular</button>
      </div>

      <div class="calculator-results" id="resultado"></div>
    </div>
  `;

  document.getElementById('calcular').addEventListener('click', () => {
    const valor = parseFloat(document.getElementById('valor').value);
    const juros = parseFloat(document.getElementById('juros').value) / 100;
    const meses = parseInt(document.getElementById('meses').value);

    if (!valor || !juros || !meses) return;

    const parcela =
      valor * (juros * Math.pow(1 + juros, meses)) /
      (Math.pow(1 + juros, meses) - 1);

    const total = parcela * meses;
    const jurosTotal = total - valor;

    const resultado = document.getElementById('resultado');
    resultado.classList.add('show');
    resultado.innerHTML = `
      <div class="result-item">
        <span class="result-label">Parcela</span>
        <span class="result-value">${formatCurrency(parcela)}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Total pago</span>
        <span class="result-value">${formatCurrency(total)}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Juros</span>
        <span class="result-value">${formatCurrency(jurosTotal)}</span>
      </div>
    `;
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', __boot);
} else {
  __boot();
}

