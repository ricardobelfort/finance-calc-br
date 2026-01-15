(function () {
  function formatBRL(value) {
    if (!isFinite(value)) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function parseNumberBR(value) {
    if (value == null) return 0;
    const v = String(value).trim().replace(/\./g, '').replace(',', '.');
    const n = Number(v);
    return isFinite(n) ? n : 0;
  }

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function buildCalculator(container) {
    container.innerHTML = `
      <section class="calculator">
        <div class="calculator-title">Simulador: Rotativo + Pagamento Mínimo</div>

        <div class="calculator-grid">
          <div class="calculator-group">
            <label for="bill">Valor da fatura (R$)</label>
            <input id="bill" inputmode="decimal" placeholder="Ex: 2.500,00" />
          </div>

          <div class="calculator-group">
            <label for="paid">Valor pago agora (R$)</label>
            <input id="paid" inputmode="decimal" placeholder="Ex: 500,00" />
          </div>

          <div class="calculator-group">
            <label for="rate">Taxa do rotativo (% ao mês)</label>
            <input id="rate" inputmode="decimal" placeholder="Ex: 12" />
          </div>

          <div class="calculator-group">
            <label for="months">Meses para simular</label>
            <input id="months" inputmode="numeric" placeholder="Ex: 6" />
          </div>

          <div class="calculator-group">
            <label for="mode">Modo de simulação</label>
            <select id="mode">
              <option value="hold">Rotativo parado (não paga mais nada)</option>
              <option value="minimum">Pagando o mínimo (todo mês)</option>
            </select>
          </div>

          <div class="calculator-group" id="minPercentWrap" style="display:none;">
            <label for="minPercent">Mínimo (% do saldo por mês)</label>
            <input id="minPercent" inputmode="decimal" placeholder="Ex: 15" />
          </div>
        </div>

        <div class="calculator-controls">
          <button class="btn btn-primary" id="calcBtn">Calcular</button>
          <button class="btn btn-secondary" id="resetBtn" type="button">Limpar</button>
        </div>

        <div class="calculator-results" id="results"></div>

        <p style="margin-top:16px; color: var(--color-text-light); font-size: var(--font-size-sm);">
          *Simulação aproximada. Bancos podem aplicar encargos, IOF e regras específicas. Use para ter noção de ordem de grandeza.
        </p>
      </section>
    `;

    const billEl = container.querySelector('#bill');
    const paidEl = container.querySelector('#paid');
    const rateEl = container.querySelector('#rate');
    const monthsEl = container.querySelector('#months');
    const modeEl = container.querySelector('#mode');
    const minPercentWrap = container.querySelector('#minPercentWrap');
    const minPercentEl = container.querySelector('#minPercent');

    const resultsEl = container.querySelector('#results');
    const calcBtn = container.querySelector('#calcBtn');
    const resetBtn = container.querySelector('#resetBtn');

    function showResults(html) {
      resultsEl.innerHTML = html;
      resultsEl.classList.add('show');
    }

    function showError(msg) {
      showResults(`<div class="alert alert-error">${msg}</div>`);
    }

    function validateInputs() {
      const bill = parseNumberBR(billEl.value);
      const paid = parseNumberBR(paidEl.value);
      const ratePct = parseNumberBR(rateEl.value);
      const monthsRaw = parseInt(String(monthsEl.value || '0'), 10);

      const months = clamp(isFinite(monthsRaw) ? monthsRaw : 0, 1, 60);
      const rate = clamp(ratePct / 100, 0, 0.5); // UI safety: até 50% a.m.

      if (bill <= 0) return { error: 'Informe um valor de fatura maior que zero.' };
      if (paid < 0) return { error: 'O valor pago não pode ser negativo.' };
      if (paid >= bill) return { error: 'Se você pagou o total da fatura, não existe rotativo.' };
      if (ratePct <= 0) return { error: 'Informe uma taxa mensal maior que zero (em %).' };

      const principal = bill - paid;

      let minPct = null;
      if (modeEl.value === 'minimum') {
        const mp = parseNumberBR(minPercentEl.value);
        if (mp <= 0) return { error: 'Informe o mínimo (%). Ex: 15.' };
        minPct = clamp(mp / 100, 0.01, 0.8); // 1% a 80% do saldo
      }

      return { bill, paid, principal, ratePct, rate, months, minPct, mode: modeEl.value };
    }

    function simulateHold(principal, rate, months) {
      // total = P*(1+i)^n
      const rows = [];
      let saldo = principal;

      for (let m = 1; m <= months; m++) {
        const juros = saldo * rate;
        saldo = saldo + juros;

        rows.push({
          mes: m,
          saldoInicial: m === 1 ? principal : rows[m - 2].saldoFinal,
          pagamento: 0,
          juros,
          saldoFinal: saldo,
        });
      }

      return rows;
    }

    function simulateMinimum(principal, rate, months, minPct) {
      // regra: todo mês aplica juros no saldo, depois paga minPct * saldoAtual
      const rows = [];
      let saldo = principal;
      let totalPago = 0;

      for (let m = 1; m <= months; m++) {
        const saldoInicial = saldo;

        const juros = saldo * rate;
        const saldoComJuros = saldo + juros;

        const pagamento = saldoComJuros * minPct;
        saldo = saldoComJuros - pagamento;

        totalPago += pagamento;

        rows.push({
          mes: m,
          saldoInicial,
          pagamento,
          juros,
          saldoFinal: saldo,
          totalPago,
        });

        // se quitou “na prática”
        if (saldo <= 0.01) {
          rows[rows.length - 1].saldoFinal = 0;
          break;
        }
      }

      return rows;
    }

    function renderTable(rows) {
      const body = rows
        .map(
          (r) => `
          <tr>
            <td style="text-align:right;">${r.mes}</td>
            <td>${formatBRL(r.saldoInicial)}</td>
            <td>${formatBRL(r.pagamento)}</td>
            <td>${formatBRL(r.juros)}</td>
            <td>${formatBRL(r.saldoFinal)}</td>
          </tr>
        `,
        )
        .join('');

      return `
        <div class="table-wrap">
          <table class="installment-table" aria-label="Tabela de parcelas">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Saldo inicial</th>
                <th>Pagamento</th>
                <th>Juros</th>
                <th>Saldo final</th>
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `;
    }

    function calculate() {
      const v = validateInputs();
      if (v.error) return showError(v.error);

      const { principal, rate, months, mode, minPct, ratePct } = v;

      let rows;
      if (mode === 'hold') rows = simulateHold(principal, rate, months);
      else rows = simulateMinimum(principal, rate, months, minPct);

      const last = rows[rows.length - 1];
      const saldoFinal = last.saldoFinal;

      const jurosTotais = rows.reduce((acc, r) => acc + r.juros, 0);
      const totalPago = rows.reduce((acc, r) => acc + r.pagamento, 0);

      const resumo = `
        <div class="alert alert-info">
          <strong>Resumo</strong><br/>
          Saldo no rotativo: <strong>${formatBRL(principal)}</strong><br/>
          Taxa mensal: <strong>${String(ratePct).replace('.', ',')}%</strong><br/>
          Meses simulados: <strong>${rows.length}</strong>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="result-item">
              <div class="result-label">Saldo final</div>
              <div class="result-value">${formatBRL(saldoFinal)}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Juros totais no período</div>
              <div class="result-value">${formatBRL(jurosTotais)}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Total pago</div>
              <div class="result-value">${formatBRL(totalPago)}</div>
            </div>
          </div>
        </div>
      `;

      let insight = '';
      if (mode === 'hold') {
        insight = `
          <div class="alert alert-warning">
            No modo <strong>"Rotativo parado"</strong>, o saldo só cresce.  
            Para reduzir a dívida, você precisa pagar mais que os juros mensais.
          </div>
        `;
      } else {
        // se o saldo final ainda está alto, alerta
        const paidLessThanInterest = rows.some((r) => r.pagamento < r.juros);
        insight = paidLessThanInterest
          ? `<div class="alert alert-warning">
              Em alguns meses, o <strong>pagamento mínimo</strong> ficou <strong>menor que os juros</strong>.  
              Isso faz a dívida demorar muito para cair (ou até crescer dependendo da taxa).
            </div>`
          : `<div class="alert alert-success">
              Seu mínimo está ajudando a reduzir a dívida com o tempo (nesse cenário).
            </div>`;
      }

      const table = `
        <h2>Simulação mês a mês</h2>
        ${renderTable(rows)}
      `;

      showResults(resumo + insight + table);
    }

    // UI
    modeEl.addEventListener('change', () => {
      const isMin = modeEl.value === 'minimum';
      minPercentWrap.style.display = isMin ? 'block' : 'none';
    });

    calcBtn.addEventListener('click', calculate);

    resetBtn.addEventListener('click', () => {
      billEl.value = '';
      paidEl.value = '';
      rateEl.value = '';
      monthsEl.value = '';
      modeEl.value = 'hold';
      minPercentEl.value = '';
      minPercentWrap.style.display = 'none';
      resultsEl.innerHTML = '';
      resultsEl.classList.remove('show');
      billEl.focus();
    });
  }

  function init() {
    document
      .querySelectorAll('[data-calculator="cc-revolving-interest"], [data-calculator="juros-cartao-rotativo"]')
      .forEach(buildCalculator);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
