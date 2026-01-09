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

// Criar public se não existir
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Limpar public
fs.rmSync(publicDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const routes = [];
const siteMap = [];

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
    route = `/financiamento/${name}`;
  }

  return route;
}

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateHTML(content, frontmatter, route) {
  const title = frontmatter.title || 'Finance Calc BR';
  const description = frontmatter.description || 'Calculadoras e guias de finanças pessoais';
  const image = frontmatter.image || `${baseUrl}/assets/images/og-image.png`;
  const canonical = `${baseUrl}${route === '/' ? '' : route}`;
  const bodyClass = frontmatter.bodyClass || '';

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
      breadcrumbs += isLast ? ` / <span>${label}</span>` : ` / <a href="${currentPath}">${label}</a>`;
    });
  }
  breadcrumbs += '</nav>';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="theme-color" content="#ffffff" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${canonical}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" type="image/svg+xml" href="/assets/images/logo.svg" />
  <link rel="shortcut icon" href="/assets/images/logo.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/assets/images/logo.svg" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/assets/css/base.css" />
  <link rel="stylesheet" href="/assets/css/components.css" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${escapeHtml(title)}",
    "description": "${escapeHtml(description)}",
    "url": "${canonical}",
    "image": "${image}"
  }
  </script>
</head>
<body class="${bodyClass}">
  <header class="site-header">
    <nav class="navbar">
      <div class="nav-container">
        <a href="/" class="logo"><img src="/assets/images/logo.svg" alt="Finance Calc BR" class="logo-img" /> Finance Calc BR</a>
        <ul class="nav-menu">
          <li><a href="/">Home</a></li>
          <li><a href="/calculadoras/financiar-vs-vista">Calculadoras</a></li>
          <li><a href="/financiamento">Guias</a></li>
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
    <!-- <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
      data-ad-slot="xxxxxxxxxx"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins> -->
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
  <script defer src="/assets/js/calc/finance-vs-cash.js"><\/script>
</body>
</html>`;

  return html;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
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

      siteMap.push(route);

      console.log(`✓ ${filePath} -> ${outputPath}`);
    }
  });
}

// Processar todos os Markdown
processDirectory(contentDir);

// Gerar sitemap.xml
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${siteMap
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route === '/' ? '' : route}</loc>
    <changefreq>weekly</changefreq>
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

copyAssets(
  path.join(projectRoot, 'src/assets/css'),
  path.join(publicDir, 'assets/css'),
);
copyAssets(
  path.join(projectRoot, 'src/assets/js'),
  path.join(publicDir, 'assets/js'),
);
copyAssets(
  path.join(projectRoot, 'src/assets/images'),
  path.join(publicDir, 'assets/images'),
);

console.log('\n✓ Build concluído com sucesso!');
