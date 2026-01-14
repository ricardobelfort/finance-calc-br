/**
 * Markdown Parser - converte Markdown para HTML
 * - Suporte a: headings, bold/italic, links, imagens, inline code, fenced code, listas, blockquotes, HR e TABELAS (GFM simples)
 * - Suporte seguro a HTML em bloco APENAS para:
 *    1) <details>...</details> (FAQ expansível)
 *    2) <div data-calculator="..."></div> (placeholder das calculadoras)
 * - Foco: HTML estável/limpo para SEO + leitura
 */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Permite HTML em bloco SOMENTE quando o bloco inteiro é:
 * - <details>...</details>
 * - <div data-calculator="..."></div>
 */
function isAllowedHtmlBlock(block) {
  const b = String(block || "").trim();

  // 1) <details>...</details>
  if (/^<details[\s>][\s\S]*<\/details>\s*$/i.test(b)) return true;

  // 2) <div data-calculator="..."></div>
  // - aceita aspas simples ou duplas
  // - id limitado a [a-z0-9-]
  if (
    /^<div\s+data-calculator=(["'])[a-z0-9-]+?\1\s*>\s*<\/div>\s*$/i.test(b)
  )
    return true;

  return false;
}

function sanitizeAllowedHtmlBlock(block) {
  let b = String(block || "").trim();

  // Bloqueios básicos por precaução
  b = b.replace(/<\/?(script|iframe|object|embed|style)[\s\S]*?>/gi, "");

  // Se for placeholder de calculadora, normaliza e mantém só data-calculator
  const calcMatch = b.match(
    /^<div\s+data-calculator=(["'])([a-z0-9-]+?)\1\s*>\s*<\/div>\s*$/i,
  );
  if (calcMatch) {
    const id = calcMatch[2];
    return `<div data-calculator="${id}"></div>`;
  }

  // Se for <details>, sanitiza permitindo apenas details/summary/br e atributo open
  if (/^<details[\s>][\s\S]*<\/details>\s*$/i.test(b)) {
    // Normaliza <details ...> mantendo só atributo open (opcional)
    b = b.replace(/<details([^>]*)>/gi, (_m, attrs) => {
      const hasOpen = /\bopen\b/i.test(attrs);
      return hasOpen ? "<details open>" : "<details>";
    });

    // Remove atributos de summary e br (deixa só a tag)
    b = b.replace(/<summary[^>]*>/gi, "<summary>");
    b = b.replace(/<br[^>]*\/?>/gi, "<br/>");

    // Remove quaisquer outras tags HTML
    b = b.replace(/<(\/?)(?!details\b|summary\b|br\b)[a-z][^>]*>/gi, "");

    return b;
  }

  // Fallback: escapa qualquer coisa inesperada
  return escapeHtml(b);
}

/**
 * Parse inline: recebe texto JÁ escapado pelo chamador.
 * Converte marcações inline sem re-escapar (evita double escaping).
 */
function parseInline(text) {
  if (text === null || text === undefined) return "";

  let t = String(text);

  // Imagens: ![alt](url)
  // OBS: alt/url já chegam escapados pelo chamador
  t = t.replace(/!\[([^\]]*?)\]\((.*?)\)/g, (_m, alt, url) => {
    return `<img src="${url}" alt="${alt}" loading="lazy" decoding="async" />`;
  });

  // Links: [texto](url)
  t = t.replace(/\[([^\]]+?)\]\((.*?)\)/g, (_m, label, url) => {
    const isExternal = /^https?:\/\//i.test(url);
    const rel = isExternal ? ` rel="noopener noreferrer"` : "";
    const target = isExternal ? ` target="_blank"` : "";
    return `<a href="${url}"${target}${rel}>${label}</a>`;
  });

  // Inline code: `code`
  // (já escapado pelo chamador)
  t = t.replace(/`([^`]+?)`/g, (_m, code) => `<code>${code}</code>`);

  // Negrito: **x** ou __x__
  t = t.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__([\s\S]+?)__/g, "<strong>$1</strong>");

  // Itálico: *x* ou _x_
  // cuidado: manter simples para não brigar com urls
  t = t.replace(
    /(^|[\s(])\*([^*]+?)\*(?=[\s).,!?:;]|$)/g,
    "$1<em>$2</em>",
  );
  t = t.replace(
    /(^|[\s(])_([^_]+?)_(?=[\s).,!?:;]|$)/g,
    "$1<em>$2</em>",
  );

  return t;
}

function isTableBlock(lines) {
  if (!lines || lines.length < 2) return false;

  // precisa ter linha separadora típica:
  // | --- | --- |
  const sep = lines[1].trim();
  const isSeparator =
    /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(sep);
  if (!isSeparator) return false;

  // linha do header precisa ter |
  const header = lines[0];
  return header.includes("|");
}

function parseTableAlignments(separatorLine) {
  const raw = separatorLine.trim().replace(/^\|/, "").replace(/\|$/, "");
  const parts = raw.split("|").map((c) => c.trim());

  // :--- => left, ---: => right, :---: => center
  return parts.map((cell) => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    return "left";
  });
}

function splitTableRow(line) {
  const raw = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return raw.split("|").map((c) => c.trim());
}

function renderTable(lines) {
  const headerCells = splitTableRow(lines[0]);
  const aligns = parseTableAlignments(lines[1]);

  const bodyLines = lines.slice(2).filter((l) => l.trim() !== "");
  const bodyRows = bodyLines.map(splitTableRow);

  const thead = `
    <thead>
      <tr>
        ${headerCells
          .map((c, i) => {
            const align = aligns[i] || "left";
            return `<th style="text-align:${align}">${parseInline(escapeHtml(c))}</th>`;
          })
          .join("")}
      </tr>
    </thead>
  `;

  const tbody = `
    <tbody>
      ${bodyRows
        .map((row) => {
          return `<tr>
            ${row
              .map((c, i) => {
                const align = aligns[i] || "left";
                return `<td style="text-align:${align}">${parseInline(escapeHtml(c))}</td>`;
              })
              .join("")}
          </tr>`;
        })
        .join("")}
    </tbody>
  `;

  return `<div class="table-wrap"><table>${thead}${tbody}</table></div>`;
}

function isListBlock(lines) {
  if (!lines?.length) return false;
  return lines.every((l) => /^\s*[-*]\s+/.test(l) || l.trim() === "");
}

function renderList(lines) {
  const items = lines
    .filter((l) => /^\s*[-*]\s+/.test(l))
    .map((l) => l.replace(/^\s*[-*]\s+/, "").trim())
    .map((txt) => `<li>${parseInline(escapeHtml(txt))}</li>`)
    .join("");
  return `<ul>${items}</ul>`;
}

function isBlockquoteBlock(lines) {
  if (!lines?.length) return false;
  return lines.every((l) => /^\s*>/.test(l) || l.trim() === "");
}

function renderBlockquote(lines) {
  const inner = lines
    .filter((l) => l.trim() !== "")
    .map((l) => l.replace(/^\s*>\s?/, ""))
    .map((txt) => parseInline(escapeHtml(txt)))
    .join("<br/>");
  return `<blockquote><p>${inner}</p></blockquote>`;
}

function isHrBlock(block) {
  return /^---\s*$/.test(block.trim());
}

function renderHeading(line) {
  const t = line.trim();
  if (/^###\s+/.test(t))
    return `<h3>${parseInline(escapeHtml(t.replace(/^###\s+/, "")))}</h3>`;
  if (/^##\s+/.test(t))
    return `<h2>${parseInline(escapeHtml(t.replace(/^##\s+/, "")))}</h2>`;
  if (/^#\s+/.test(t))
    return `<h1>${parseInline(escapeHtml(t.replace(/^#\s+/, "")))}</h1>`;
  return null;
}

export function parseMarkdown(content) {
  let md = String(content || "").replace(/\r\n/g, "\n");

  // Remove frontmatter
  const frontmatterMatch = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (frontmatterMatch) {
    md = md.slice(frontmatterMatch[0].length);
  }

  // Extrair fenced code blocks para placeholders
  const codeBlocks = [];
  md = md.replace(/```([\s\S]*?)```/g, (_m, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(code);
    return `@@CODEBLOCK_${idx}@@`;
  });

  // Quebra em blocos por linhas em branco
  const blocks = md
    .split(/\n{2,}/g)
    .map((b) => b.trim())
    .filter(Boolean);

  const htmlBlocks = blocks.map((block) => {
    // Recolocar codeblock
    const codeMatch = block.match(/^@@CODEBLOCK_(\d+)@@$/);
    if (codeMatch) {
      const code = codeBlocks[Number(codeMatch[1])] ?? "";
      return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    }

    // HTML permitido (apenas <details>...</details> e <div data-calculator="..."></div>)
    if (isAllowedHtmlBlock(block)) {
      return sanitizeAllowedHtmlBlock(block);
    }

    // HR
    if (isHrBlock(block)) return `<hr />`;

    // Heading (apenas se bloco é uma linha)
    if (!block.includes("\n")) {
      const h = renderHeading(block);
      if (h) return h;
    }

    const lines = block.split("\n");

    // Blockquote
    if (isBlockquoteBlock(lines)) return renderBlockquote(lines);

    // Lista
    if (isListBlock(lines)) return renderList(lines);

    // Tabela
    if (isTableBlock(lines)) return renderTable(lines);

    // Parágrafo normal (une linhas)
    const joined = lines.map((l) => l.trim()).join(" ");
    return `<p>${parseInline(escapeHtml(joined))}</p>`;
  });

  return htmlBlocks.join("\n\n").trim();
}

export function extractFrontmatter(content) {
  const match = String(content || "").match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};

  const frontmatter = {};
  const lines = match[1].split("\n");

  lines.forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) return;
    frontmatter[key.trim()] = rest.join(":").trim().replace(/^"|"$/g, "");
  });

  return frontmatter;
}
