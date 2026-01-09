# Estrutura Completa do Projeto

## Árvore de Diretórios

```
finance-calc-br/
│
├── src/                           # Arquivos Fonte
│   ├── assets/
│   │   ├── css/
│   │   │   ├── base.css          # Estilos globais, variáveis, tipografia
│   │   │   └── components.css    # Botões, cards, alerts, formulários
│   │   └── js/
│   │       ├── app.js            # Tema, scroll-to-top, utilitários
│   │       └── calc/
│   │           └── finance-vs-cash.js  # Calculadora principal (classe)
│   │
│   └── content/                   # Conteúdo Markdown
│       ├── pages/
│       │   ├── index.md          # Home (rota: /)
│       │   ├── sobre.md          # Sobre (rota: /sobre)
│       │   ├── contato.md        # Contato (rota: /contato)
│       │   ├── privacidade.md    # Política de Privacidade (rota: /privacidade)
│       │   └── termos.md         # Termos de Uso (rota: /termos)
│       │
│       ├── calculators/
│       │   └── financiar-vs-vista.md  # (rota: /calculadoras/financiar-vs-vista)
│       │
│       ├── hubs/
│       │   └── financiamento.md   # Hub: Financiamento (rota: /financiamento)
│       │
│       └── artigos/
│           ├── juros-como-funcionam.md     # (rota: /financiamento/juros-como-funcionam)
│           ├── price-vs-sac.md             # (rota: /financiamento/price-vs-sac)
│           └── entrada-ou-parcela.md       # (rota: /financiamento/entrada-ou-parcela)
│
├── scripts/
│   ├── build.mjs                 # Main build script (ESM)
│   └── markdown.mjs              # Markdown parser + frontmatter extractor
│
├── public/                       # Gerado pelo build (não commitar)
│   ├── index.html                # Homepage
│   ├── sobre/index.html          # Página sobre
│   ├── contato/index.html
│   ├── privacidade/index.html
│   ├── termos/index.html
│   ├── calculadoras/
│   │   └── financiar-vs-vista/index.html
│   ├── financiamento/
│   │   ├── index.html            # Hub page
│   │   ├── juros-como-funcionam/index.html
│   │   ├── price-vs-sac/index.html
│   │   └── entrada-ou-parcela/index.html
│   ├── assets/
│   │   ├── css/
│   │   │   ├── base.css
│   │   │   └── components.css
│   │   └── js/
│   │       ├── app.js
│   │       └── calc/
│   │           └── finance-vs-cash.js
│   ├── sitemap.xml              # Gerado automaticamente
│   └── robots.txt               # Gerado automaticamente
│
├── .gitignore                    # Git ignore
├── package.json                  # npm scripts + dependências
├── README.md                     # Documentação principal
├── DEPLOYMENT.md                 # Guia de deploy
└── vercel.json                   # Configuração Vercel
```

## Rotas Criadas

| Arquivo                             | Caminho                                         | URL                                   |
| ----------------------------------- | ----------------------------------------------- | ------------------------------------- |
| `pages/index.md`                    | `src/content/pages/index.md`                    | `/`                                   |
| `pages/sobre.md`                    | `src/content/pages/sobre.md`                    | `/sobre`                              |
| `pages/contato.md`                  | `src/content/pages/contato.md`                  | `/contato`                            |
| `pages/privacidade.md`              | `src/content/pages/privacidade.md`              | `/privacidade`                        |
| `pages/termos.md`                   | `src/content/pages/termos.md`                   | `/termos`                             |
| `calculators/financiar-vs-vista.md` | `src/content/calculators/financiar-vs-vista.md` | `/calculadoras/financiar-vs-vista`    |
| `hubs/financiamento.md`             | `src/content/hubs/financiamento.md`             | `/financiamento`                      |
| `artigos/juros-como-funcionam.md`   | `src/content/artigos/juros-como-funcionam.md`   | `/financiamento/juros-como-funcionam` |
| `artigos/price-vs-sac.md`           | `src/content/artigos/price-vs-sac.md`           | `/financiamento/price-vs-sac`         |
| `artigos/entrada-ou-parcela.md`     | `src/content/artigos/entrada-ou-parcela.md`     | `/financiamento/entrada-ou-parcela`   |

## Scripts NPM

```json
{
  "build": "node scripts/build.mjs", // Gera site estático
  "dev": "npm run build && npx http-server public -p 3000 -g", // Dev local
  "start": "npx http-server public -p 3000 -g" // Serve apenas
}
```

## Fluxo de Build

```
src/content/**/*.md
    ↓
[Lê arquivo]
    ↓
[Extrai frontmatter YAML]
    ↓
[Parse Markdown → HTML]
    ↓
[Encapsula em template HTML]
    ↓
[Adiciona SEO meta tags]
    ↓
[Escreve em public/ com rota amigável]
    ↓
[Copia assets CSS/JS]
    ↓
[Gera sitemap.xml]
    ↓
[Gera robots.txt]
    ↓
✓ Build completo!
```

## Frontmatter Format

Cada `.md` começa com:

```yaml
---
title: "Título da Página"
description: "Meta description (importante para SEO)"
image: "URL da imagem Open Graph (opcional)"
bodyClass: "classe-css-customizada (opcional)"
---
# Conteúdo Markdown aqui...
```

## Template HTML Automático

Cada página gerada inclui:

```
<html>
  <head>
    ✓ Meta charset, viewport
    ✓ Meta description (do frontmatter)
    ✓ Open Graph tags (og:title, og:description, og:image, og:url)
    ✓ Canonical URL
    ✓ JSON-LD WebPage
    ✓ CSS (base + components)
  </head>
  <body>
    <header>
      ✓ Navbar com navegação
      ✓ Logo
      ✓ Menu: Home, Calculadoras, Guias, Sobre
    </header>

    <main>
      ✓ Breadcrumbs automáticos
      ✓ Conteúdo do Markdown convertido
    </main>

    <aside>
      ✓ AdSense placeholder (comentado)
    </aside>

    <footer>
      ✓ Links: Privacidade, Termos, Contato
      ✓ Copyright
    </footer>

    ✓ JS (app.js, finance-vs-cash.js)
  </body>
</html>
```

## Componentes CSS Disponíveis

### Botões

- `.btn` - Botão base
- `.btn-primary` - Botão primário (azul)
- `.btn-secondary` - Botão secundário (outline)
- `.btn-sm` / `.btn-lg` - Tamanhos
- `.btn-block` - Full width

### Alertas

- `.alert.alert-success` - Verde
- `.alert.alert-error` - Vermelho
- `.alert.alert-warning` - Laranja
- `.alert.alert-info` - Azul

### Cards

- `.card` - Card com padding e sombra
- `.card-header` - Cabeçalho
- `.card-body` - Corpo
- `.card-footer` - Rodapé

### Formulário

- `.calculator` - Container calculadora
- `.calculator-grid` - Grid responsiva 2 colunas
- `.calculator-group` - Group de input
- `.calculator-controls` - Botões de ação
- `.calculator-results` - Resultados (hidden por padrão)

### Variáveis CSS

```css
/* Cores */
--color-primary: #2563eb
--color-primary-dark: #1e40af
--color-secondary: #7c3aed
--color-accent: #f59e0b
--color-success: #10b981
--color-error: #ef4444
--color-warning: #f97316

/* Espaçamento */
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px

/* Tipografia */
--font-size-base: 16px
--font-size-lg: 18px
--font-size-xl: 20px
--font-size-2xl: 24px
--font-size-3xl: 32px
--font-size-4xl: 40px

/* Transitions */
--transition-fast: 150ms
--transition-base: 250ms
--transition-slow: 350ms
```

## Funcionalidades JavaScript

### app.js (Global)

- ✓ Tema claro/escuro com localStorage
- ✓ Botão toggle theme (flutuante)
- ✓ Scroll-to-top com transição smooth
- ✓ Funções de formatação: `formatCurrency()`, `formatPercentage()`

### finance-vs-cash.js (Calculadora)

- ✓ Classe `FinanceVsCashCalculator`
- ✓ Detecta `[data-calculator="finance-vs-cash"]`
- ✓ Renderiza formulário com validação
- ✓ Cálculos usando Tabela Price
- ✓ Gera tabela de parcelas (primeiras 12 + última)
- ✓ Recomendação textual dinâmica
- ✓ Formatação pt-BR (moeda, datas)

## SEO Technical

### Automático

- ✓ Meta tags `<title>`, `<meta description>`
- ✓ Open Graph: og:title, og:description, og:image, og:url
- ✓ Canonical URLs
- ✓ JSON-LD WebPage Schema
- ✓ Breadcrumbs (visíveis + schema)
- ✓ `sitemap.xml` (todas as rotas)
- ✓ `robots.txt` (alow \*, sitemap link)
- ✓ Responsive viewport

### Mobile

- ✓ Meta viewport
- ✓ CSS mobile-first
- ✓ Touch-friendly buttons
- ✓ Legível em telas pequenas

## Performance

- ✓ Sem framework (apenas vanilla JS)
- ✓ CSS sem Tailwind (direto, otimizado)
- ✓ Assets cacheáveis
- ✓ Vercel CDN automático
- ✓ Gzip + Brotli automático
- ✓ Minificação automática Vercel

Meta: **90+ em PageSpeed Insights**

---

Tudo pronto para Vercel! 🚀
