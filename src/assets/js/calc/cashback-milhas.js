// src/assets/js/calc/cashback-milhas.js
(function () {
  function formatBRL(value) {
    const n = Number(value || 0);
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  function parseNumber(v) {
    if (v === null || v === undefined) return 0;
    const s = String(v).replace(/\./g, "").replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  function render(container) {
    container.innerHTML = `
      <section class="calculator">
        <div class="calculator-title">Comparar Cashback vs Milhas (com Anuidade)</div>

        <div class="calculator-grid">
          <div class="calculator-group">
            <label for="cm_spend">Gasto no cartão (por mês)</label>
            <input id="cm_spend" inputmode="decimal" placeholder="Ex: 2500" />
          </div>

          <div class="calculator-group">
            <label for="cm_fee">Anuidade (por ano)</label>
            <input id="cm_fee" inputmode="decimal" placeholder="Ex: 480" />
          </div>

          <div class="calculator-group">
            <label for="cm_cashback">Cashback (%)</label>
            <input id="cm_cashback" inputmode="decimal" placeholder="Ex: 1" />
          </div>

          <div class="calculator-group">
            <label for="cm_pointsRate">Pontos por R$ (milhas/pontos)</label>
            <input id="cm_pointsRate" inputmode="decimal" placeholder="Ex: 1" />
          </div>

          <div class="calculator-group">
            <label for="cm_pointsValue">Valor estimado de 1.000 pontos (em R$)</label>
            <input id="cm_pointsValue" inputmode="decimal" placeholder="Ex: 20" />
          </div>

          <div class="calculator-group">
            <label for="cm_bonus">Bônus de transferência (%)</label>
            <input id="cm_bonus" inputmode="decimal" placeholder="Ex: 80" />
          </div>
        </div>

        <div class="calculator-controls">
          <button class="btn btn-primary" id="cm_calc">Calcular</button>
          <button class="btn btn-secondary" id="cm_reset">Limpar</button>
        </div>

        <div class="calculator-results" id="cm_results">
          <div class="result-item">
            <span class="result-label">Retorno anual (cashback)</span>
            <span class="result-value" id="cm_cashback_year">—</span>
          </div>

          <div class="result-item">
            <span class="result-label">Retorno anual (milhas/pontos)</span>
            <span class="result-value" id="cm_points_year">—</span>
          </div>

          <div class="result-item">
            <span class="result-label">Resultado líquido (cashback - anuidade)</span>
            <span class="result-value" id="cm_cashback_net">—</span>
          </div>

          <div class="result-item">
            <span class="result-label">Resultado líquido (milhas - anuidade)</span>
            <span class="result-value" id="cm_points_net">—</span>
          </div>

          <div class="result-recommendation" id="cm_reco"></div>
        </div>
      </section>
    `;

    const spendEl = container.querySelector("#cm_spend");
    const feeEl = container.querySelector("#cm_fee");
    const cashbackEl = container.querySelector("#cm_cashback");
    const pointsRateEl = container.querySelector("#cm_pointsRate");
    const pointsValueEl = container.querySelector("#cm_pointsValue");
    const bonusEl = container.querySelector("#cm_bonus");

    const results = container.querySelector("#cm_results");
    const cashbackYearEl = container.querySelector("#cm_cashback_year");
    const pointsYearEl = container.querySelector("#cm_points_year");
    const cashbackNetEl = container.querySelector("#cm_cashback_net");
    const pointsNetEl = container.querySelector("#cm_points_net");
    const recoEl = container.querySelector("#cm_reco");

    function calc() {
      const spendMonth = parseNumber(spendEl.value);
      const feeYear = parseNumber(feeEl.value);

      const cashbackPct = clamp(parseNumber(cashbackEl.value), 0, 20) / 100;
      const pointsPerReal = clamp(parseNumber(pointsRateEl.value), 0, 20);

      const valuePer1000 = clamp(parseNumber(pointsValueEl.value), 0, 1000);
      const bonusPct = clamp(parseNumber(bonusEl.value), 0, 300) / 100;

      const spendYear = spendMonth * 12;

      // Cashback
      const cashbackYear = spendYear * cashbackPct;

      // Pontos: pontos/ano * (valor por 1000 / 1000) * (1 + bonus)
      const pointsYear = (spendYear * pointsPerReal) * (valuePer1000 / 1000) * (1 + bonusPct);

      const cashbackNet = cashbackYear - feeYear;
      const pointsNet = pointsYear - feeYear;

      cashbackYearEl.textContent = formatBRL(cashbackYear);
      pointsYearEl.textContent = formatBRL(pointsYear);
      cashbackNetEl.textContent = formatBRL(cashbackNet);
      pointsNetEl.textContent = formatBRL(pointsNet);

      results.classList.add("show");

      // Recomendação
      const best = pointsNet > cashbackNet ? "milhas" : "cashback";
      const diff = Math.abs(pointsNet - cashbackNet);

      let msg = "";

      if (spendMonth <= 0) {
        msg = "⚠️ Preencha seu gasto mensal para comparar.";
      } else {
        msg += `✅ No seu cenário, <strong>${best}</strong> tende a render mais. `;
        msg += `Diferença estimada: <strong>${formatBRL(diff)}</strong> por ano.<br/><br/>`;

        msg += `⚠️ Importante: qualquer benefício vira prejuízo se você cair no `;
        msg += `<a href="/cartao/rotativo">rotativo</a> ou pagar só o `;
        msg += `<a href="/cartao/pagar-minimo">mínimo</a>. `;
        msg += `Se sobrar dinheiro, o próximo passo é montar sua `;
        msg += `<a href="/orcamento/reserva-emergencia">reserva de emergência</a>.`;
      }

      recoEl.innerHTML = msg;
    }

    function reset() {
      spendEl.value = "";
      feeEl.value = "";
      cashbackEl.value = "";
      pointsRateEl.value = "";
      pointsValueEl.value = "";
      bonusEl.value = "";
      results.classList.remove("show");
      cashbackYearEl.textContent = "—";
      pointsYearEl.textContent = "—";
      cashbackNetEl.textContent = "—";
      pointsNetEl.textContent = "—";
      recoEl.innerHTML = "";
    }

    container.querySelector("#cm_calc").addEventListener("click", calc);
    container.querySelector("#cm_reset").addEventListener("click", reset);
  }

  // Expor uma função global compatível com loader
  window.__financeCalc = window.__financeCalc || {};
  window.__financeCalc["cashback-milhas"] = { render };
})();
