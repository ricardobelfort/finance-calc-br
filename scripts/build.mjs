/**
 * Build Script - gera HTML estático a partir de Markdown
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMarkdown, extractFrontmatter } from './markdown.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const contentDir = path.join(projectRoot, 'src/content');
const publicDir = path.join(projectRoot, 'public');
const baseUrl = 'https://www.financecalcbr.com.br';

function toCanonicalUrl(route) {
  const normalizedRoute = route === '/' ? '/' : route;
  return `${baseUrl}${normalizedRoute}`;
}

function formatSitemapLastmod(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

// Criar public se não existir
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Limpar public
fs.rmSync(publicDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const routes = [];
const siteMap = new Map();

function getRouteFromPath(filePath) {
  const relative = path.relative(contentDir, filePath);
  const parts = relative.split(path.sep);
  const filename = parts[parts.length - 1];
  const category = parts[0];
  const name = filename.replace('.md', '');

  let route = '';

  if (category === 'pages' && name === 'index') {
    route = '/';
  } else if (category === 'pages') {
    route = `/${name}`;
  } else if (category === 'calculators') {
    route = `/calculadoras/${name}`;
  } else if (category === 'hubs') {
    route = `/${name}`;
  } else if (category === 'artigos') {
    // Suporta clusters via prefixo no nome do arquivo:
    // cartao-xxx -> /cartao/xxx
    // emprestimos-xxx -> /emprestimos/xxx
    // orcamento-xxx -> /orcamento/xxx
    // investimentos-xxx -> /investimentos/xxx
    const prefixes = ['cartao', 'emprestimos', 'orcamento', 'investimentos', 'pix'];

    const matched = prefixes.find((p) => name.startsWith(p + '-'));
    if (matched) {
      route = `/${matched}/${name.replace(matched + '-', '')}`;
    } else {
      route = `/financiamento/${name}`;
    }
  }

  return route;
}

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Garante que a URL da imagem esteja absoluta (necessário para OG/Twitter)
 */
function toAbsoluteUrl(url) {
  if (!url) return `${baseUrl}/assets/images/og-image.png`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${normalized}`;
}

function generateHTML(content, frontmatter, route) {
  const title = frontmatter.title || 'Finance Calc BR';
  const description =
    frontmatter.description || 'Calculadoras e guias de finanças pessoais';

  // Frontmatter pode definir image e imageAlt por página
  const image = frontmatter.image || `${baseUrl}/assets/images/og-image.png`;
  const imageAlt = frontmatter.imageAlt || `Finance Calc BR — ${title}`;

  const canonical = toCanonicalUrl(route);
  const bodyClass = frontmatter.bodyClass || '';

  // OG/Twitter exigem imagem absoluta
  const ogImage = toAbsoluteUrl(image);

  // Gerar breadcrumbs
  let breadcrumbs = '<nav class="breadcrumbs">';
  breadcrumbs += '<a href="/">Home</a>';
  if (route !== '/') {
    const parts = route.split('/').filter(Boolean);
    let currentPath = '';
    parts.forEach((part, idx) => {
      currentPath += '/' + part;
      const isLast = idx === parts.length - 1;
      const label = part.charAt(0).toUpperCase() + part.slice(1);
      breadcrumbs += isLast
        ? ` / <span>${label}</span>`
        : ` / <a href="${currentPath}">${label}</a>`;
    });
  }
  breadcrumbs += '</nav>';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="theme-color" content="#ffffff" />

  <!-- Canonical -->
  <link rel="canonical" href="${canonical}" />

  <!-- Favicons -->
  <link rel="icon" type="image/svg+xml" href="/assets/images/logo.svg" />
  <link rel="shortcut icon" href="/assets/images/logo.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/assets/images/logo.svg" />

  <!-- Open Graph -->
  <meta property="og:site_name" content="Finance Calc BR" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />

  <!-- CSS -->
  <link rel="stylesheet" href="/assets/css/base.css" />
  <link rel="stylesheet" href="/assets/css/components.css" />

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "Finance Calc BR",
        "url": "${toCanonicalUrl('/')}"
      },
      {
        "@type": "WebPage",
        "name": "${escapeHtml(title)}",
        "description": "${escapeHtml(description)}",
        "url": "${canonical}",
        "image": "${ogImage}"
      }
    ]
  }
  </script>

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-K4MQC6F4LY"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-K4MQC6F4LY');
  </script>
</head>
<body class="${bodyClass}">
  <header class="site-header">
    <nav class="navbar">
      <div class="nav-container">
        <a href="/" class="logo">
          <img src="/assets/images/logo.svg" alt="Finance Calc BR" class="logo-img" />
          Finance Calc BR
        </a>

        <div class="nav-controls">
          <button class="theme-toggle" id="theme-toggle" aria-label="Alternar tema">
            <svg class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>

          <button class="hamburger" id="hamburger" aria-label="Abrir menu" aria-expanded="false">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
        </div>

        <ul class="nav-menu" id="nav-menu">
          <li><a href="/">Home</a></li>
          <li><a href="/calculadoras">Calculadoras</a></li>
          <li><a href="/financiamento">Guias</a></li>
          <li><a href="/cartao">Cartão</a></li>
          <li><a href="/emprestimos">Empréstimos</a></li>
          <li><a href="/pix">PIX</a></li>
          <li><a href="/orcamento">Orçamento</a></li>
          <li><a href="/investimentos">Investimentos</a></li>
          <li><a href="/sobre">Sobre</a></li>
        </ul>
      </div>
    </nav>
  </header>

  <main class="main-container">
    <article class="content-article ${bodyClass}">
      ${breadcrumbs}
      ${content}
    </article>
  </main>

  <aside class="sidebar">
    <!-- AdSense Placeholder - Topo -->
    <!--
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
      data-ad-slot="xxxxxxxxxx"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
    -->
  </aside>

  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-copy">
        <p>&copy; 2025 Finance Calc BR. Todos os direitos reservados.</p>
      </div>
      <ul class="footer-links">
        <li><a href="/privacidade">Privacidade</a></li>
        <li><a href="/termos">Termos</a></li>
        <li><a href="/contato">Contato</a></li>
      </ul>
    </div>
  </footer>

  <script defer src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"><\/script>
  <script defer src="/assets/js/app.js"><\/script>
  <script defer src="/assets/js/calc/calculator-loader.js"></script>
</body>
</html>`;

  return html;
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const str = String(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content);
      const route = getRouteFromPath(filePath);

      if (!route) {
        console.warn(`Arquivo ignorado (rota não definida): ${filePath}`);
        return;
      }

      // Parse markdown
      const htmlContent = parseMarkdown(content);

      // Gerar HTML completo
      const fullHtml = generateHTML(htmlContent, frontmatter, route);

      // Determinar arquivo de saída
      let outputPath;
      if (route === '/') {
        outputPath = path.join(publicDir, 'index.html');
      } else {
        outputPath = path.join(publicDir, route.slice(1), 'index.html');
      }

      ensureDirectoryExists(outputPath);
      fs.writeFileSync(outputPath, fullHtml);

      // Registrar rota para sitemap
      routes.push({
        path: route,
        title: frontmatter.title || 'Sem título',
      });

      const lastmod = formatSitemapLastmod(stat.mtime);
      siteMap.set(route, lastmod);

      console.log(`✓ ${filePath} -> ${outputPath}`);
    }
  });
}

// Processar todos os Markdown
processDirectory(contentDir);

// Gerar sitemap.xml
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(siteMap.entries())
  .map(
    ([route, lastmod]) => `  <url>
    <loc>${toCanonicalUrl(route)}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
console.log(`✓ Sitemap gerado: ${publicDir}/sitemap.xml`);

// Gerar robots.txt
const robotsContent = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent);
console.log(`✓ Robots.txt gerado: ${publicDir}/robots.txt`);

// Copiar assets
function copyAssets(src, dest) {
  if (!fs.existsSync(src)) return;

  fs.cpSync(src, dest, { recursive: true });
  console.log(`✓ Assets copiados: ${src} -> ${dest}`);
}

copyAssets(path.join(projectRoot, 'src/assets/css'), path.join(publicDir, 'assets/css'));
copyAssets(path.join(projectRoot, 'src/assets/js'), path.join(publicDir, 'assets/js'));
copyAssets(path.join(projectRoot, 'src/assets/images'), path.join(publicDir, 'assets/images'));

console.log('\n✓ Build concluído com sucesso!');