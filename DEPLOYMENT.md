# 🚀 Guia de Deploy - Finance Calc BR

## Pré-requisitos

- Conta no GitHub
- Conta no Vercel (gratuito)
- Git instalado

## Deploy Automático (Recomendado)

### Passo 1: Preparar Repositório GitHub

```bash
# Inicializar git (se já não estiver)
cd /Users/ricardobelfort/dev/finance-calc-br
git init

# Configurar repositório
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Initial commit: finance-calc-br v1.0"

# Criar repositório no GitHub
# 1. Ir para https://github.com/new
# 2. Nome: "finance-calc-br"
# 3. Descrição: "Calculadoras e guias de finanças pessoais"
# 4. Criar repositório (público)

# Conectar e fazer push
git remote add origin https://github.com/SEU_USUARIO/finance-calc-br.git
git branch -M main
git push -u origin main
```

### Passo 2: Conectar Vercel

1. Ir para https://vercel.com/dashboard
2. Clicar em "New Project"
3. Selecionar "Import Git Repository"
4. Procurar por "finance-calc-br"
5. Clicar em "Import"

### Passo 3: Configurar Build

Na página de configuração, Vercel já deve detectar:

- **Framework**: Vite (podemos deixar como "Other")
- **Build Command**: `npm run build`
- **Output Directory**: `public`

Se não, configurar manualmente:

```
Build Command: npm run build
Output Directory: public
Environment Variables: (deixar em branco)
```

### Passo 4: Deploy

1. Clicar em "Deploy"
2. Esperar build completar (2-3 minutos)
3. Ver URL: `https://finance-calc-br-abc123.vercel.app`

### Passo 5: Custom Domain (Opcional)

1. Na dashboard do projeto, ir para "Settings"
2. Clicar em "Domains"
3. Adicionar domínio (ex: `finance-calc.com.br`)
4. Seguir instruções de DNS

---

## Deploy Manual (Se Preferir)

### Com Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy do projeto
cd /Users/ricardobelfort/dev/finance-calc-br
vercel

# Seguir prompts e confirmar deploy
```

### Apenas Upload de Arquivos

1. Build local:

```bash
npm run build
```

2. Fazer zip da pasta `public/`:

```bash
cd /Users/ricardobelfort/dev/finance-calc-br
zip -r finance-calc-br-public.zip public/
```

3. Em qualquer host estático (Netlify, GitHub Pages, etc):
   - Upload o conteúdo de `public/` como site estático
   - Configurar para servir `index.html` em rotas não encontradas

---

## Workflow de Atualizações

Depois de fazer deploy:

### Fazer Mudança Localmente

```bash
# Editar arquivo de conteúdo
# Ex: nano src/content/artigos/novo-artigo.md

# Build local
npm run build

# Testar localmente
npm run dev
# Abrir http://localhost:3000

# Fazer commit
git add .
git commit -m "Add: novo artigo sobre X"

# Push para GitHub
git push origin main

# Vercel vai fazer redeploy automaticamente!
```

---

## Verificar Deploy

Depois de publicado:

### Verificar SEO

```bash
# Testar sitemap
curl https://seusite.com/sitemap.xml

# Testar robots.txt
curl https://seusite.com/robots.txt
```

### Google Search Console

1. Ir para https://search.google.com/search-console
2. "Adicionar propriedade"
3. URL: seu domínio
4. Fazer verificação (adicionar HTML meta tag)
5. Fazer submit do sitemap

### Google AdSense (Se usar)

1. Criar account em https://www.google.com/adsense
2. Verificar que site atende critérios:
   - Política de privacidade completa ✓
   - Termos de uso ✓
   - Contato funcional ✓
3. Pedir aprovação
4. Google avalia por 24h
5. Adicionar código nos comentários do template (ver README)

---

## Troubleshooting

### Build falha no Vercel

Clicar em logs e verificar erro. Comum:

- Esquecer `npm install`
- Arquivo markdown com erro de sintaxe
- Caminho de arquivo incorreto

Solução:

```bash
# Testar build localmente
npm run build

# Se der erro, corrigir e fazer push novamente
```

### Site está quebrado após atualização

```bash
# Reverter último deploy no Vercel
# Dashboard > Deployments > Clicar em um deployment anterior > Promote to Production

# Ou fazer local:
git reset --hard HEAD~1
git push -f origin main
```

### Assets (CSS, JS) não carregam

Verificar se paths estão corretos:

- URLs devem ser `/assets/...` (não relativas)
- Build deve copiar `src/assets/` para `public/assets/`

Verificar build output:

```bash
npm run build
ls -la public/assets/
```

---

## Dicas de Performance

### Vercel

- Automático: edge caching, compressão, minificação
- CDN global: entrega rápida para todos

### Otimizações Extras

- Imaginar imagens em WebP (futuro)
- Minificar CSS/JS (já faz automaticamente)
- Preload de fontes (Google Fonts)

Monitor com:

- PageSpeed Insights: https://pagespeed.web.dev
- Lighthouse: F12 > Lighthouse

Meta: **Acima de 90 em todas categorias**

---

## Manutenção Contínua

### Mensalmente

- [ ] Verificar logs do Vercel (erros?)
- [ ] Rodar PageSpeed Insights
- [ ] Verificar Google Search Console (indexação?)
- [ ] Atualizar conteúdo se necessário

### Trimestralmente

- [ ] Testar calculadora (ainda funciona?)
- [ ] Atualizar links internos
- [ ] Revisar meta descriptions
- [ ] Verificar quebra de links (404s)

### Anualmente

- [ ] Revisar política de privacidade
- [ ] Atualizar termos de uso
- [ ] Atualizações de dependências se necessário

---

## Contacts & Support

Qualquer dúvida:

- GitHub Issues: Abrir issue no repositório
- Suporte Vercel: https://vercel.com/support

---

**Happy deploying! 🚀**
