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

  // Parcela Price: M = P * [i(1+i)^n] / [(1+i)^n - 1]
  function calcPricePayment(P, i, n) {
    if (i === 0) return P / n;
    const pow = Math.pow(1 + i, n);
    return P * ((i * pow) / (pow - 1));
  }

  function buildCalculator(container) {
    container.innerHTML = `
      <section class="calculator">
        <div class="calculator-title">Parcelar a Fatura vs Rotativo</div>

        <div class="calculator-grid">
          <div class="calculator-group">
            <label for="ccp_balance">Saldo da fatura (R$)</label>
            <input id="ccp_balance" inputmode="decimal" placeholder="Ex: 3.200,00" />
          </div>

          <div class="calculator-group">
            <label for="ccp_install_rate">Juros do parcelamento (% a.m.)</label>
            <input id="ccp_install_rate" inputmode="decimal" placeholder="Ex: 7" />
          </div>

          <div class="calculator-group">
            <label for="ccp_install_months">Nº de parcelas</label>
            <input id="ccp_install_months" inputmode="numeric" placeholder="Ex: 12" />
          </div>

          <div class="calculator-group">
            <label for="ccp_revolving_rate">Juros do rotativo (% a.m.)</label>
            <input id="ccp_revolving_rate" inputmode="decimal" placeholder="Ex: 12" />
          </div>

          <div class="calculator-group">
            <label for="ccp_revolving_months">Meses no rotativo (simulação)</label>
            <input id="ccp_revolving_months" inputmode="numeric" placeholder="Ex: 3" />
          </div>
        </div>

        <div class="calculator-controls">
          <button class="btn btn-primary" id="ccp_calc">Calcular</button>
          <button class="btn btn-secondary" id="ccp_reset" type="button">Limpar</button>
        </div>

        <div class="calculator-results" id="ccp_results"></div>

        <p style="margin-top:16px; color: var(--color-text-light); font-size: var(--font-size-sm);">
          *Simulação aproximada. Em cenários reais podem existir encargos, IOF e regras específicas do emissor.
        </p>
      </section>
    `;

    const balanceEl = container.querySelector('#ccp_balance');
    const installRateEl = container.querySelector('#ccp_install_rate');
    const installMonthsEl = container.querySelector('#ccp_install_months');
    const revolvingRateEl = container.querySelector('#ccp_revolving_rate');
    const revolvingMonthsEl = container.querySelector('#ccp_revolving_months');

    const calcBtn = container.querySelector('#ccp_calc');
    const resetBtn = container.querySelector('#ccp_reset');
    const resultsEl = container.querySelector('#ccp_results');

    function showResults(html) {
      resultsEl.innerHTML = html;
      resultsEl.classList.add('show');
    }

    function showError(msg) {
      showResults(`<div class="alert alert-error">${msg}</div>`);
    }

    function renderInstallmentTable(rows) {
      const body = rows
        .map(
          (r) => `
          <tr>
            <td style="text-align:right;">${r.mes}</td>
            <td>${formatBRL(r.saldoInicial)}</td>
            <td>${formatBRL(r.parcela)}</td>
            <td>${formatBRL(r.juros)}</td>
            <td>${formatBRL(r.amortizacao)}</td>
            <td>${formatBRL(r.saldoFinal)}</td>
          </tr>
        `,
        )
        .join('');

      return `
        <table class="installment-table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Saldo inicial</th>
              <th>Parcela</th>
              <th>Juros</th>
              <th>Amortização</th>
              <th>Saldo final</th>
            </tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      `;
    }

    function calculate() {
      const P = parseNumberBR(balanceEl.value);
      const installRatePct = parseNumberBR(installRateEl.value);
      const installMonthsRaw = parseInt(String(installMonthsEl.value || '0'), 10);

      const revolvingRatePct = parseNumberBR(revolvingRateEl.value);
      const revolvingMonthsRaw = parseInt(String(revolvingMonthsEl.value || '0'), 10);

      const n = clamp(isFinite(installMonthsRaw) ? installMonthsRaw : 0, 1, 60);
      const nRot = clamp(isFinite(revolvingMonthsRaw) ? revolvingMonthsRaw : 0, 1, 24);

      const i = clamp(installRatePct / 100, 0, 0.5);
      const r = clamp(revolvingRatePct / 100, 0, 0.5);

      if (P <= 0) return showError('Informe um saldo de fatura maior que zero.');
      if (installRatePct <= 0) return showError('Informe os juros do parcelamento (% a.m.).');
      if (revolvingRatePct <= 0) return showError('Informe os juros do rotativo (% a.m.).');

      // 1) Parcelamento (modelo Price)
      const parcela = calcPricePayment(P, i, n);
      let saldo = P;
      const rows = [];
      let totalPagoParcelamento = 0;
      let jurosParcelamento = 0;

      for (let m = 1; m <= n; m++) {
        const saldoInicial = saldo;
        const juros = saldo * i;
        let amortizacao = parcela - juros;
        saldo = saldo - amortizacao;

        // Ajuste final para evitar -0,00 por arredondamento
        if (saldo < 0.01) saldo = 0;

        totalPagoParcelamento += parcela;
        jurosParcelamento += juros;

        rows.push({
          mes: m,
          saldoInicial,
          parcela,
          juros,
          amortizacao,
          saldoFinal: saldo,
        });

        if (saldo === 0) break;
      }

      // 2) Rotativo (saldo cresce sem amortização)
      const totalRotativo = P * Math.pow(1 + r, nRot);
      const jurosRotativo = totalRotativo - P;

      // Recomendação
      let winner, delta;
      if (totalPagoParcelamento < totalRotativo) {
        winner = 'Parcelar a fatura';
        delta = totalRotativo - totalPagoParcelamento;
      } else {
        winner = 'Ficar no rotativo (cuidado!)';
        delta = totalPagoParcelamento - totalRotativo;
      }

      const recommendationAlert =
        winner === 'Parcelar a fatura'
          ? `<div class="alert alert-success">
              <strong>Resultado:</strong> neste cenário, <strong>parcelar a fatura</strong> sai mais barato do que manter no rotativo por ${nRot} mês(es).
            </div>`
          : `<div class="alert alert-warning">
              <strong>Resultado:</strong> neste cenário, o rotativo parece mais barato no período curto, mas é extremamente arriscado.
              Se ficar mais meses, o custo pode explodir.
            </div>`;

      const summary = `
        <div class="alert alert-info">
          <strong>Resumo</strong><br/>
          Saldo: <strong>${formatBRL(P)}</strong><br/>
          Parcelamento: <strong>${String(installRatePct).replace('.', ',')}% a.m.</strong> por <strong>${rows.length}</strong> mês(es)<br/>
          Rotativo: <strong>${String(revolvingRatePct).replace('.', ',')}% a.m.</strong> por <strong>${nRot}</strong> mês(es)
        </div>

        <div class="card">
          <div class="card-body">
            <div class="result-item">
              <div class="result-label">Parcela estimada (fatura parcelada)</div>
              <div class="result-value">${formatBRL(parcela)}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Total pago (parcelamento)</div>
              <div class="result-value">${formatBRL(totalPagoParcelamento)}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Juros totais (parcelamento)</div>
              <div class="result-value">${formatBRL(jurosParcelamento)}</div>
            </div>

            <div class="result-item">
              <div class="result-label">Total no rotativo após ${nRot} mês(es)</div>
              <div class="result-value">${formatBRL(totalRotativo)}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Juros no rotativo (no período)</div>
              <div class="result-value">${formatBRL(jurosRotativo)}</div>
            </div>

            <div class="result-item">
              <div class="result-label">Diferença (economia)</div>
              <div class="result-value">${formatBRL(delta)}</div>
            </div>
          </div>
        </div>

        ${recommendationAlert}
      `;

      const table = `
        <h2>Tabela do parcelamento (mês a mês)</h2>
        ${renderInstallmentTable(rows)}
      `;

      showResults(summary + table);
    }

    calcBtn.addEventListener('click', calculate);

    resetBtn.addEventListener('click', () => {
      balanceEl.value = '';
      installRateEl.value = '';
      installMonthsEl.value = '';
      revolvingRateEl.value = '';
      revolvingMonthsEl.value = '';
      resultsEl.innerHTML = '';
      resultsEl.classList.remove('show');
      balanceEl.focus();
    });
  }

  function init() {
    document
      .querySelectorAll('[data-calculator="cc-installment-vs-rotativo"]')
      .forEach(buildCalculator);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
