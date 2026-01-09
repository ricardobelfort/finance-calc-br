# Finance Calc BR

Calculadoras e guias de finanças pessoais 100% estático, pronto para Vercel.

## 📋 O Que é?

Finance Calc BR é um site educativo com:

- **Calculadora de Financiamento vs À Vista** - Compare custos reais
- **Guias Educativos** - Juros, SAC, Price, entrada
- **SEO Otimizado** - Sitemap, meta tags, JSON-LD
- **Totalmente Estático** - HTML gerado a partir de Markdown
- **Sem Dependências Pesadas** - Apenas JavaScript vanilla

## 🚀 Quick Start

### Pré-requisitos

- Node.js 16+
- npm

### Instalação

```bash
# Clonar ou baixar o projeto
cd finance-calc-br

# Instalar dependências
npm install

# Build
npm run build

# Dev (server local)
npm run dev

# Production (apenas serve)
npm start
```

Abrir no navegador: `http://localhost:3000`

## 📁 Estrutura de Pastas

```
finance-calc-br/
├── src/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── base.css          # Estilos globais
│   │   │   └── components.css    # Componentes (cards, buttons, etc)
│   │   └── js/
│   │       ├── app.js            # Tema claro/escuro, scroll-to-top
│   │       └── calc/
│   │           └── finance-vs-cash.js  # Calculadora principal
│   └── content/
│       ├── pages/                # Páginas principais
│       │   ├── index.md
│       │   ├── sobre.md
│       │   ├── contato.md
│       │   ├── privacidade.md
│       │   └── termos.md
│       ├── calculators/          # Calculadoras
│       │   └── financiar-vs-vista.md
│       ├── hubs/                 # Páginas hub
│       │   └── financiamento.md
│       └── artigos/              # Blog posts
│           ├── juros-como-funcionam.md
│           ├── price-vs-sac.md
│           └── entrada-ou-parcela.md
├── scripts/
│   ├── build.mjs                 # Build script principal
│   └── markdown.mjs              # Parser Markdown
├── public/                       # Gerado pelo build
├── package.json
└── README.md
```

## 🔨 Como Funciona o Build

1. **Lê** todos os arquivos `.md` em `src/content/**/*`
2. **Parse** o frontmatter YAML (title, description, etc)
3. **Converte** Markdown para HTML
4. **Encapsula** em template HTML com:
   - Header, navbar, footer
   - Breadcrumbs
   - Meta tags SEO
   - JSON-LD
   - Open Graph
5. **Escreve** em `public/` mantendo rotas amigáveis
6. **Gera** `sitemap.xml` e `robots.txt`

### Rotas Automáticas

| Arquivo                                         | URL                                   |
| ----------------------------------------------- | ------------------------------------- |
| `src/content/pages/index.md`                    | `/`                                   |
| `src/content/pages/sobre.md`                    | `/sobre`                              |
| `src/content/calculators/financiar-vs-vista.md` | `/calculadoras/financiar-vs-vista`    |
| `src/content/hubs/financiamento.md`             | `/financiamento`                      |
| `src/content/artigos/juros-como-funcionam.md`   | `/financiamento/juros-como-funcionam` |

## 📝 Criar Novo Conteúdo

### Novo Artigo

Criar arquivo `src/content/artigos/seu-artigo.md`:

```markdown
---
title: "Título do Artigo"
description: "Descrição curta para meta tags"
---

# Título

Seu conteúdo aqui.

## Seção 2

Mais conteúdo.
```

Build automático irá:

- Criar `/financiamento/seu-artigo/index.html`
- Adicionar ao sitemap
- Gerar meta tags

### Novo Hub

Criar arquivo `src/content/hubs/novo-hub.md`:

```markdown
---
title: "Hub Title"
description: "Hub description"
---

# Hub

Conteúdo do hub...
```

Será criado em `/novo-hub`.

### Nova Página

Criar arquivo `src/content/pages/nova-pagina.md`:

```markdown
---
title: "Page Title"
description: "Page description"
---

# Page

Conteúdo...
```

Será criado em `/nova-pagina`.

## 🎨 Customizar Estilo

### Variáveis de Cor

Editar `src/assets/css/base.css`:

```css
:root {
  --color-primary: #2563eb;
  --color-secondary: #7c3aed;
  /* ... mais cores ... */
}
```

### Componentes

Componentes prontos em `src/assets/css/components.css`:

- `.btn` - Botões
- `.card` - Cards
- `.alert` - Alertas
- `.badge` - Badges
- `.callout` - Callouts
- `details` - FAQ
- `.calculator` - Formulário calculadora

Exemplo:

```html
<div class="alert alert-success">
  <strong>Sucesso!</strong>
  Seu cálculo foi realizado.
</div>
```

## 🔍 SEO

### Automático

O build gera automaticamente:

- `sitemap.xml` - Todas as URLs
- `robots.txt` - Instrução de crawling
- Meta tags em cada página
- Canonical URLs
- Open Graph tags
- JSON-LD (WebPage)

### Manual

Adicionar frontmatter em `.md`:

```yaml
---
title: "Título para Google"
description: "Meta description (155 caracteres)"
image: "URL da imagem OG"
---
```

## 🚀 Deploy na Vercel

### Opção 1: Automatic (Recomendado)

1. Push no GitHub
2. Conectar repositório em [Vercel](https://vercel.com)
3. Build command: `npm run build`
4. Output directory: `public`
5. Deploy!

### Opção 2: Manual

```bash
# Build local
npm run build

# Deploy (com Vercel CLI)
npm install -g vercel
vercel

# Ou apenas fazer push no public/
```

## 📊 Checklist: Antes de Publicar

### Legal & Compliance

- [ ] **Termos de Uso** completos (`/termos`)
- [ ] **Política de Privacidade** completa (`/privacidade`)
- [ ] **Contato** funcional (`/contato`)
- [ ] Disclaimer: "Não é recomendação financeira profissional"
- [ ] Avisos sobre risco em calculadoras

### Funcionalidade

- [ ] Tema claro/escuro funciona
- [ ] Calculadora valida inputs
- [ ] Breadcrumbs corretos
- [ ] Links internos funcionam
- [ ] Responsividade mobile testada

### SEO

- [ ] Title e description em cada página
- [ ] Sitemap.xml gerado
- [ ] Robots.txt configurado
- [ ] Open Graph tags preenchidas
- [ ] Imagens com alt text

### AdSense (Se usar)

- [ ] Google AdSense account criada
- [ ] Desabilitar auto ads nos TOS e Privacy (importante!)
- [ ] Adicionar code nos comentários em `scripts/build.mjs`
- [ ] Testar anúncios em staging

Exemplo (no template HTML):

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx"
  crossorigin="anonymous"
></script>

<ins
  class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
  data-ad-slot="xxxxxxxxxx"
  data-ad-format="auto"
  data-full-width-responsive="true"
></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

## 🔧 Troubleshooting

### Build falha

```bash
# Deletar build anterior
rm -rf public

# Rebuild
npm run build
```

### Calculadora não funciona

- Verificar se `[data-calculator="finance-vs-cash"]` existe no `.md`
- Verificar console do navegador (F12) para erros
- Confirmar que `finance-vs-cash.js` foi copiado ao `public/`

### Tema não salva

- Verificar localStorage no navegador (F12 > Application > Storage)
- Tentar modo anônimo
- Limpar cache do navegador

## 📈 Performance

- **PageSpeed Insights**: Deve estar acima de 90 (Vercel é rápido!)
- **Lighthouse**: Testar regularmente
- **Core Web Vitals**: Monitorar

Dicas:

- Manter CSS/JS mínimos
- Comprimir imagens
- Usar lazy loading para imagens
- Cache na Vercel é automático

## 📚 Markdown Suportado

Parser suporta:

- Headings (`#`, `##`, `###`)
- **Bold** (`**texto**`)
- _Italic_ (`*texto*`)
- [Links](url)
- ![Images](url)
- `Código inline`
- Blocos de código (```)
- Blockquotes (`> texto`)
- Listas (`-` ou `*`)
- Horizontal rules (`---`)

## 🤝 Contribuir

Contribuições são bem-vindas! Se encontrar erro:

1. Editar arquivo `.md` em `src/content/`
2. Build: `npm run build`
3. Testar em `npm run dev`
4. Fazer PR

## 📄 Licença

MIT - Veja LICENSE para detalhes

## 💡 Ideias Futuras

- [ ] Blog com paginação
- [ ] Comments (Disqus)
- [ ] Newsletter signup
- [ ] Analytics (Plausible)
- [ ] Dark mode automático por hora
- [ ] PWA (offline support)
- [ ] Versão em Inglês

---

**Made with ❤️ for Brasil**

Dúvidas? Abra uma issue no GitHub ou envie email.
