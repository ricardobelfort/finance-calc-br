# 📚 Guia de Extensão - Finance Calc BR

Como adicionar novo conteúdo, funcionalidades e melhorias.

## 🆕 Adicionar Nova Página/Artigo

### 1. Criar Arquivo Markdown

Escolha a categoria e crie um novo `.md`:

```bash
# Novo artigo sobre tema ABC
touch src/content/artigos/tema-abc.md

# Novo hub temático
touch src/content/hubs/novo-hub.md

# Nova página de utilidade
touch src/content/pages/nova-pagina.md

# Nova calculadora
touch src/content/calculators/nova-calculadora.md
```

### 2. Preencher Conteúdo

```markdown
---
title: "Título da Página - SEO Friendly (50-60 caracteres)"
description: "Descrição para Google (150-160 caracteres que descreve valor)"
image: "https://example.com/image.jpg" # Open Graph image (1200x630px)
---

# Título H1

Parágrafo introdutório...

## Seção 2

Conteúdo bem estruturado.

### Subsection

Mais detalhes.

---

## Lista

- Item 1
- Item 2
- Item 3

| Coluna 1 | Coluna 2 |
| -------- | -------- |
| Valor A  | Valor B  |

<details>
<summary>Clique para expandir</summary>
Conteúdo detalhado aqui.
</details>

---

**Links úteis:**

- [Link para calculadora](/calculadoras/financiar-vs-vista)
- [Link para hub](/financiamento)
- [Link externo](https://example.com)
```

### 3. Build e Teste

```bash
# Build
npm run build

# Testar localmente
npm run dev

# Abrir http://localhost:3000/seu-artigo
```

### 4. Commit e Push

```bash
git add src/content/artigos/tema-abc.md
git commit -m "Add: artigo sobre tema ABC"
git push origin main

# Vercel faz deploy automaticamente!
```

---

## 🧮 Adicionar Nova Calculadora

### 1. Criar Arquivo Markdown

```bash
touch src/content/calculators/sua-calculadora.md
```

### 2. Incluir Trigger HTML

```markdown
---
title: "Calculadora: Sua Calculadora"
description: "Descrição"
---

# Sua Calculadora

Explicação...

<div data-calculator="sua-calculadora"></div>

Mais conteúdo...
```

### 3. Criar JavaScript (src/assets/js/calc/sua-calculadora.js)

Exemplo mínimo:

```javascript
class SuaCalculadora {
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="calculator">
        <h3>Sua Calculadora</h3>
        <!-- Formulário aqui -->
      </div>
    `;
  }
}

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
  const containers = document.querySelectorAll(
    '[data-calculator="sua-calculadora"]'
  );
  containers.forEach((container) => {
    new SuaCalculadora(container);
  });
});
```

### 4. Adicionar Import no Template (scripts/build.mjs)

Editar linha no HTML template:

```html
<!-- Adicionar no final antes de </body> -->
<script src="/assets/js/calc/sua-calculadora.js"></script>
```

### 5. Build e Teste

```bash
npm run build
npm run dev
```

---

## 🎨 Customizar Estilo

### Adicionar Cor Global

Em `src/assets/css/base.css`:

```css
:root {
  /* Adicionar nova cor */
  --color-custom: #mycolor;
}
```

Usar em qualquer lugar:

```css
.meu-elemento {
  background-color: var(--color-custom);
}
```

### Criar Novo Componente

Em `src/assets/css/components.css`:

```css
/* Novo componente */
.meu-componente {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.meu-componente-title {
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

/* Responsivo */
@media (max-width: 640px) {
  .meu-componente {
    padding: var(--spacing-md);
  }
}
```

---

## 🔗 Links Internos

Sempre use rotas amigáveis:

```markdown
<!-- ❌ Errado -->

[Link](/financeiro/index.html)

<!-- ✅ Correto -->

[Link para calculadora](/calculadoras/financiar-vs-vista)
[Link para hub](/financiamento)
[Link para artigo](/financiamento/juros-como-funcionam)
```

---

## 📊 Adicionar Dados/Tabelas

### Tabela Simples

```markdown
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Dado A   | Dado B   | Dado C   |
| Dado D   | Dado E   | Dado F   |
```

### Tabela com CSS Classes

Adicionar em HTML (dentro de Markdown):

```html
<table class="installment-table">
  <thead>
    <tr>
      <th>Mês</th>
      <th>Valor</th>
      <th>Acumulado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>R$ 1.000</td>
      <td>R$ 1.000</td>
    </tr>
  </tbody>
</table>
```

---

## 🌐 Múltiplas Calculadoras na Mesma Página

Cada uma com `data-calculator` diferente:

```markdown
<div data-calculator="calc-1"></div>
<div data-calculator="calc-2"></div>
<div data-calculator="calc-3"></div>
```

Cada JS detecta e inicia automaticamente:

```javascript
// finance-vs-cash.js
document.querySelectorAll('[data-calculator="finance-vs-cash"]').forEach(...)

// outra-calc.js
document.querySelectorAll('[data-calculator="outra-calc"]').forEach(...)
```

---

## 🔐 Adicionar Conteúdo Privado/Protegido

Opções:

### 1. Separar em Hub Privado

Criar `src/content/hubs/recursos-premium.md`:

```markdown
---
title: "Recursos Premium"
description: "Conteúdo premium para assinantes"
---

# Apenas para Assinantes

[Fazer login para acessar](https://login.seu-site.com)
```

### 2. Adicionar Auth no Frontend (Complexo)

Usar biblioteca como:

- Supabase Auth
- Firebase Auth
- Auth0

Exemplo com Supabase:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, key);

// Verificar auth antes de mostrar conteúdo
const { data, error } = await supabase.auth.getSession();
if (!data.session) {
  // Redirecionar para login
}
```

---

## 📱 Adaptar para App Mobile

Com React Native / Flutter:

```javascript
// Seria necessário:
// 1. Criar API (Node.js, Python, etc)
// 2. Expor calculadora como JSON endpoint
// 3. App mobile consume API

// Exemplo endpoint:
// GET /api/calculate?price=1000&discount=10&months=12&interest=2
// Response: { result: {...} }
```

---

## 🔄 Integrar Com Ferramentas Externas

### Google Analytics (Recomendado)

Adicionar em cada página HTML (no `<head>`):

```html
<!-- Google Analytics -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-XXXXXXXXXX");
</script>
```

Editar `scripts/build.mjs` para incluir automaticamente.

### ConvertKit / Newsletter

Adicionar formulário simples:

```html
<form
  action="https://app.convertkit.com/forms/XXXXX/subscriptions"
  method="post"
>
  <input type="email" name="email_address" required />
  <button>Inscrever</button>
</form>
```

### Intercom / Chat

```html
<script>
  window.intercomSettings = {
    api_base: "https://api-iam.intercom.io",
    app_id: "YOUR_APP_ID",
  };
</script>
<script async src="https://widget.intercom.io/widget/YOUR_APP_ID"></script>
```

---

## 🚀 Otimizações Avançadas

### 1. Service Worker (PWA)

Criar `public/sw.js`:

```javascript
const CACHE_NAME = "v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["/", "/assets/css/base.css", "/assets/js/app.js"]);
    })
  );
});
```

### 2. Preload Crítico

Em template HTML:

```html
<link rel="preload" as="style" href="/assets/css/base.css" />
<link rel="preload" as="script" href="/assets/js/app.js" />
```

### 3. DNS Prefetch

```html
<link rel="dns-prefetch" href="//fonts.googleapis.com" />
<link rel="dns-prefetch" href="//cdn.example.com" />
```

---

## ✅ Checklist de Qualidade

Antes de fazer push:

- [ ] Conteúdo sem erros de ortografia
- [ ] Links internos funcionam (testar com `npm run dev`)
- [ ] Imagens carregam
- [ ] Mobile responsivo (testar em DevTools)
- [ ] Meta tags preenchidas (title, description)
- [ ] Frontmatter válido (YAML correto)
- [ ] Sem console errors (F12)
- [ ] Breadcrumbs corretos
- [ ] Calculadora funciona (se houver)

---

## 🐛 Debugar Problemas

### Build falha

```bash
# Verificar erro
npm run build 2>&1 | tail -20

# Erro comum: Markdown mal formatado
# Solução: Validar YAML no frontmatter
```

### Calculadora não funciona

```javascript
// No console do navegador (F12)
console.log(document.querySelectorAll("[data-calculator]"));
// Deve retornar array com elementos

// Verificar se arquivo JS existe
// public/assets/js/calc/finance-vs-cash.js?
```

### SEO não funciona

```bash
# Verificar meta tags
curl https://seu-site.com/pagina | grep "<meta"

# Verificar sitemap
curl https://seu-site.com/sitemap.xml

# Google Search Console
# https://search.google.com/search-console
```

---

## 📞 Quando Pedir Ajuda

Comunidade:

- GitHub Discussions
- Stack Overflow com tag `[finance-calc-br]`
- Issues no GitHub

---

**Boas contribuições! 🎉**
