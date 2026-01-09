/**
 * FINANCE-VS-CASH.JS - Calculadora de Financiamento vs À Vista
 * Detecta [data-calculator="finance-vs-cash"] e monta a calculadora
 */

class FinanceVsCashCalculator {
  constructor(container) {
    this.container = container;
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="calculator">
        <h3 class="calculator-title">Comparar: Financiar vs À Vista</h3>
        
        <form id="finance-form">
          <div class="calculator-grid">
            <div class="calculator-group">
              <label for="preco">Preço do Produto (R$)</label>
              <input 
                type="number" 
                id="preco" 
                name="preco"
                placeholder="2000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div class="calculator-group">
              <label for="desconto">Desconto à Vista (%)</label>
              <input 
                type="number" 
                id="desconto" 
                name="desconto"
                placeholder="10"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div class="calculator-group">
              <label for="parcelas">Número de Parcelas</label>
              <input 
                type="number" 
                id="parcelas" 
                name="parcelas"
                placeholder="12"
                min="1"
                step="1"
                required
              />
            </div>

            <div class="calculator-group">
              <label for="juros">Juros Mensais (%)</label>
              <input 
                type="number" 
                id="juros" 
                name="juros"
                placeholder="2"
                min="0"
                max="100"
                step="0.1"
                required
              />
            </div>

            <div class="calculator-group">
              <label for="entrada">Entrada (R$ - opcional)</label>
              <input 
                type="number" 
                id="entrada" 
                name="entrada"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div class="calculator-controls">
            <button type="submit" class="btn btn-primary btn-lg">Calcular</button>
            <button type="reset" class="btn btn-secondary">Limpar</button>
          </div>
        </form>

        <div id="results" class="calculator-results"></div>
      </div>
    `;

    this.form = this.container.querySelector('#finance-form');
    this.resultsDiv = this.container.querySelector('#results');
  }

  attachEventListeners() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.calculate();
    });

    this.form.addEventListener('reset', () => {
      this.resultsDiv.innerHTML = '';
      this.resultsDiv.classList.remove('show');
    });
  }

  getFormData() {
    const formData = new FormData(this.form);
    return {
      preco: parseFloat(formData.get('preco')) || 0,
      desconto: parseFloat(formData.get('desconto')) || 0,
      parcelas: parseInt(formData.get('parcelas')) || 1,
      juros: parseFloat(formData.get('juros')) || 0,
      entrada: parseFloat(formData.get('entrada')) || 0,
    };
  }

  validate(data) {
    const errors = [];

    if (data.preco <= 0) {
      errors.push('Preço deve ser maior que 0');
    }
    if (data.desconto < 0 || data.desconto > 100) {
      errors.push('Desconto deve estar entre 0 e 100%');
    }
    if (data.parcelas < 1) {
      errors.push('Parcelas deve ser no mínimo 1');
    }
    if (data.juros < 0) {
      errors.push('Juros não pode ser negativo');
    }
    if (data.entrada < 0) {
      errors.push('Entrada não pode ser negativa');
    }
    if (data.entrada > data.preco) {
      errors.push('Entrada não pode ser maior que o preço');
    }

    return errors;
  }

  calculatePrice(principal, monthlyRate, months) {
    // Fórmula da Tabela Price (Francês)
    // M = P × [i(1+i)^n] / [(1+i)^n - 1]

    if (monthlyRate === 0) {
      return principal / months;
    }

    const rate = monthlyRate / 100;
    const numerator = rate * Math.pow(1 + rate, months);
    const denominator = Math.pow(1 + rate, months) - 1;

    return principal * (numerator / denominator);
  }

  calculate() {
    const data = this.getFormData();
    const errors = this.validate(data);

    if (errors.length > 0) {
      this.showErrors(errors);
      return;
    }

    // Cenário 1: À Vista com Desconto
    const precoComDesconto = data.preco * (1 - data.desconto / 100);

    // Cenário 2: Financiado
    const principalFinanciado = data.preco - data.entrada;
    const parcelaFixa = this.calculatePrice(principalFinanciado, data.juros, data.parcelas);
    const totalFinanciado = data.entrada + parcelaFixa * data.parcelas;
    const totalJuros = totalFinanciado - data.preco;

    // Comparação
    const diferenca = totalFinanciado - precoComDesconto;
    const percentualDiferenca = (diferenca / precoComDesconto) * 100;

    // Determinar recomendação
    const recomendacao = this.getRecommendation(
      precoComDesconto,
      totalFinanciado,
      diferenca,
      percentualDiferenca,
      data,
    );

    // Gerar tabela de parcelas
    const tabelaParcelas = this.generateInstallmentTable(
      principalFinanciado,
      data.juros,
      data.parcelas,
      data.entrada,
      parcelaFixa,
    );

    // Renderizar resultados
    this.renderResults(
      precoComDesconto,
      totalFinanciado,
      totalJuros,
      diferenca,
      percentualDiferenca,
      recomendacao,
      tabelaParcelas,
      parcelaFixa,
      data,
    );
  }

  getRecommendation(precoVista, precoFinanciado, diferenca, percentual, data) {
    if (precoFinanciado < precoVista) {
      return {
        type: 'success',
        text: `Neste cenário, <strong>financiar é mais vantajoso</strong>! Você economiza <strong>${this.formatCurrency(Math.abs(diferenca))}</strong> (${Math.abs(percentual).toFixed(1)}% mais barato) ao financiar em ${data.parcelas} vezes com ${data.juros}% de juros ao mês.
        <br><br>
        <em>Porém, lembre-se: isso pressupõe que você consegue pagar as parcelas mensais sem dificuldade.</em>`,
      };
    } else if (diferenca < precoVista * 0.05) {
      return {
        type: 'neutral',
        text: `Neste cenário, <strong>à vista e financiado são praticamente iguais</strong>. A diferença é de apenas <strong>${this.formatCurrency(diferenca)}</strong> (${percentual.toFixed(1)}% mais caro).
        <br><br>
        <em>Escolha conforme sua situação: se tem dinheiro guardado, pague à vista. Se precisa parcelar, não fará muita diferença.</em>`,
      };
    } else {
      return {
        type: 'warning',
        text: `Neste cenário, <strong>pagar à vista é mais vantajoso</strong>. Você economiza <strong>${this.formatCurrency(diferenca)}</strong> (${percentual.toFixed(1)}% mais caro ao financiar) se conseguir negociar o desconto à vista.
        <br><br>
        <em>Se não conseguir o desconto, a diferença pode ser menor. Sempre negocie com o vendedor!</em>`,
      };
    }
  }

  generateInstallmentTable(principal, monthlyRate, months, entrada, parcelaFixa) {
    const rate = monthlyRate / 100;
    let saldo = principal;
    const rows = [];

    // Se há entrada, adicionar como primeira linha
    if (entrada > 0) {
      rows.push({
        parcela: 'Entrada',
        valor: entrada,
        acumulado: entrada,
      });
    }

    for (let i = 1; i <= Math.min(months, 12); i++) {
      const jurosTemp = saldo * rate;
      const amortizacao = parcelaFixa - jurosTemp;
      saldo -= amortizacao;

      rows.push({
        parcela: i,
        valor: parcelaFixa,
        acumulado: entrada + parcelaFixa * i,
      });

      if (i === 12 && months > 12) {
        rows.push({
          parcela: '...',
          valor: '...',
          acumulado: '...',
        });
        rows.push({
          parcela: months,
          valor: parcelaFixa,
          acumulado: entrada + parcelaFixa * months,
        });
        break;
      }
    }

    return rows;
  }

  renderResults(precoVista, precoFinanciado, totalJuros, diferenca, percentual, recomendacao, tabela, parcelaFixa, data) {
    const recomendacaoClass = {
      success: 'alert-success',
      warning: 'alert-warning',
      neutral: 'alert-info',
    }[recomendacao.type];

    let tabelaHtml = `
      <table class="installment-table">
        <thead>
          <tr>
            <th>Parcela</th>
            <th>Valor (R$)</th>
            <th>Total Acumulado (R$)</th>
          </tr>
        </thead>
        <tbody>
    `;

    tabela.forEach((row) => {
      const valor = row.valor === '...' ? '...' : this.formatCurrency(row.valor);
      const acumulado = row.acumulado === '...' ? '...' : this.formatCurrency(row.acumulado);

      tabelaHtml += `
        <tr>
          <td>${row.parcela}</td>
          <td>${valor}</td>
          <td><strong>${acumulado}</strong></td>
        </tr>
      `;
    });

    tabelaHtml += `
        </tbody>
      </table>
    `;

    this.resultsDiv.innerHTML = `
      <div class="result-item">
        <span class="result-label">À Vista com ${data.desconto}% de Desconto:</span>
        <span class="result-value">${this.formatCurrency(precoVista)}</span>
      </div>

      <div class="result-item">
        <span class="result-label">Financiado (${data.parcelas}x com ${data.juros}% a.m.):</span>
        <span class="result-value">${this.formatCurrency(precoFinanciado)}</span>
      </div>

      <div class="result-item">
        <span class="result-label">Total de Juros Pagos:</span>
        <span class="result-value" style="color: #ef4444;">${this.formatCurrency(totalJuros)}</span>
      </div>

      <div class="result-item">
        <span class="result-label">Diferença:</span>
        <span class="result-value" style="color: ${diferenca > 0 ? '#10b981' : '#ef4444'};">
          ${diferenca > 0 ? '+' : ''}${this.formatCurrency(diferenca)} (${percentual > 0 ? '+' : ''}${percentual.toFixed(1)}%)
        </span>
      </div>

      <div class="result-item">
        <span class="result-label">Valor da Parcela:</span>
        <span class="result-value">${this.formatCurrency(parcelaFixa)}</span>
      </div>

      <div class="result-recommendation alert ${recomendacaoClass}">
        <strong>Recomendação:</strong>
        <p>${recomendacao.text}</p>
      </div>

      <details>
        <summary><i data-feather="list" class="icon-sm"></i> Ver Tabela de Parcelas</summary>
        ${tabelaHtml}
      </details>
    `;

    this.resultsDiv.classList.add('show');
  }

  showErrors(errors) {
    let errorHtml = '<div class="alert alert-error">';
    errorHtml += '<strong>Erros encontrados:</strong><ul>';
    errors.forEach((error) => {
      errorHtml += `<li>${error}</li>`;
    });
    errorHtml += '</ul></div>';

    this.resultsDiv.innerHTML = errorHtml;
    this.resultsDiv.classList.add('show');
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}

// ==========================================
// Inicializar
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const calculatorContainers = document.querySelectorAll('[data-calculator="finance-vs-cash"]');

  calculatorContainers.forEach((container) => {
    new FinanceVsCashCalculator(container);
  });
});
