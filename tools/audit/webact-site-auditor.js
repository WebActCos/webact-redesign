#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());
const REPORT_DIR = path.join(ROOT, "tools", "audit", "reports");
const HTML_REPORT = path.join(REPORT_DIR, "enterprise-site-audit.html");
const JSON_REPORT = path.join(REPORT_DIR, "enterprise-site-audit.json");

const EXCLUDED_DIRS = new Set([
  ".git", "node_modules", "vendor", "dist", "build", "coverage",
  ".next", ".cache", "tools/backups"
]);

const SEARCH_EXTS = new Set([
  ".html", ".htm", ".css", ".js", ".json", ".xml", ".txt",
  ".md", ".webmanifest"
]);

const HTML_EXTS = new Set([".html", ".htm"]);

function normalizeSlashes(value) {
  return value.replace(/\\/g, "/");
}

function rel(file) {
  return normalizeSlashes(path.relative(ROOT, file));
}

function shouldExclude(filePath) {
  const relative = normalizeSlashes(path.relative(ROOT, filePath));
  return [...EXCLUDED_DIRS].some((item) =>
    relative === item || relative.startsWith(item + "/")
  );
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (shouldExclude(full)) continue;
    if (entry.isDirectory()) walk(full, results);
    else results.push(full);
  }
  return results;
}

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function stripQueryHash(value) {
  return value.replace(/[?#].*$/, "");
}

function isExternal(value) {
  return /^(?:https?:|mailto:|tel:|sms:|javascript:|data:|blob:|\/\/)/i.test(value);
}

function resolveInternal(sourceFile, reference) {
  let cleaned = stripQueryHash(reference.trim());
  if (!cleaned || cleaned.startsWith("#") || isExternal(cleaned)) {
    return { external: true, exists: true, target: null };
  }

  try {
    cleaned = decodeURIComponent(cleaned);
  } catch {}

  let target;
  if (cleaned.startsWith("/")) {
    target = path.join(ROOT, cleaned.replace(/^\/+/, ""));
  } else {
    target = path.resolve(path.dirname(sourceFile), cleaned);
  }

  if (!target.startsWith(ROOT)) {
    return { external: false, exists: false, target };
  }

  const candidates = [target];
  if (!path.extname(target)) {
    candidates.push(path.join(target, "index.html"));
    candidates.push(target + ".html");
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    candidates.push(path.join(target, "index.html"));
  }

  const found = candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate) && fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  });

  return { external: false, exists: Boolean(found), target: found || target };
}

function addIssue(issues, severity, category, file, line, message, value = "") {
  issues.push({
    severity,
    category,
    file: rel(file),
    line,
    message,
    value
  });
}

function extractFirst(text, regex) {
  const match = regex.exec(text);
  return match ? match[1].trim() : "";
}

function textOnly(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function audit() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const files = walk(ROOT);
  const htmlFiles = files.filter((file) => HTML_EXTS.has(path.extname(file).toLowerCase()));
  const searchableFiles = files.filter((file) => SEARCH_EXTS.has(path.extname(file).toLowerCase()));

  const issues = [];
  const pages = [];
  const graph = new Map();
  const titleMap = new Map();
  const descriptionMap = new Map();
  const canonMap = new Map();

  let refsChecked = 0;
  let validRefs = 0;

  for (const file of htmlFiles) {
    const html = readText(file);
    const page = rel(file);
    graph.set(page, new Set());

    const title = textOnly(extractFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
    const description = extractFirst(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
      extractFirst(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
    const canonical = extractFirst(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i) ||
      extractFirst(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    const lang = extractFirst(html, /<html[^>]+lang=["']([^"']+)["']/i);
    const hasMain = /<main\b/i.test(html);
    const hasHeader = /<header\b/i.test(html) || /data-shared-header/i.test(html);
    const hasFooter = /<footer\b/i.test(html) || /data-shared-footer/i.test(html);
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
    const hasOgTitle = /<meta[^>]+property=["']og:title["']/i.test(html);
    const hasOgDescription = /<meta[^>]+property=["']og:description["']/i.test(html);
    const hasOgImage = /<meta[^>]+property=["']og:image["']/i.test(html);
    const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

    if (!title) addIssue(issues, "error", "SEO", file, 1, "Missing <title>.");
    else {
      if (!titleMap.has(title)) titleMap.set(title, []);
      titleMap.get(title).push(page);
      if (title.length < 20 || title.length > 65) {
        addIssue(issues, "warning", "SEO", file, 1, `Title length is ${title.length}; target roughly 20–65 characters.`, title);
      }
    }

    if (!description) addIssue(issues, "warning", "SEO", file, 1, "Missing meta description.");
    else {
      if (!descriptionMap.has(description)) descriptionMap.set(description, []);
      descriptionMap.get(description).push(page);
      if (description.length < 70 || description.length > 170) {
        addIssue(issues, "warning", "SEO", file, 1, `Meta description length is ${description.length}; target roughly 70–170 characters.`, description);
      }
    }

    if (!canonical) addIssue(issues, "warning", "SEO", file, 1, "Missing canonical URL.");
    else {
      if (!canonMap.has(canonical)) canonMap.set(canonical, []);
      canonMap.get(canonical).push(page);
      if (/\/webact-redesign\//i.test(canonical)) addIssue(issues, "error", "URLs", file, 1, "Canonical contains /webact-redesign/.", canonical);
      if (/\/index\.html(?:[?#]|$)/i.test(canonical)) addIssue(issues, "error", "URLs", file, 1, "Canonical exposes index.html.", canonical);
    }

    if (h1Count === 0) addIssue(issues, "error", "SEO", file, 1, "Missing H1.");
    if (h1Count > 1) addIssue(issues, "warning", "SEO", file, 1, `Multiple H1 elements found (${h1Count}).`);
    if (!lang) addIssue(issues, "warning", "Accessibility", file, 1, "Missing html lang attribute.");
    if (!hasViewport) addIssue(issues, "error", "Mobile", file, 1, "Missing viewport meta tag.");
    if (!hasMain) addIssue(issues, "warning", "Accessibility", file, 1, "Missing <main> landmark.");
    if (!hasHeader) addIssue(issues, "warning", "Consistency", file, 1, "Shared/header landmark not detected.");
    if (!hasFooter) addIssue(issues, "warning", "Consistency", file, 1, "Shared/footer landmark not detected.");
    if (!hasOgTitle || !hasOgDescription || !hasOgImage) {
      addIssue(issues, "info", "Social", file, 1, "Open Graph metadata is incomplete.");
    }

    for (const block of jsonLdBlocks) {
      try {
        JSON.parse(block[1].trim());
      } catch (error) {
        addIssue(issues, "error", "Schema", file, lineNumberAt(html, block.index), "Invalid JSON-LD.", error.message);
      }
    }

    for (const match of html.matchAll(/\b(?<attr>href|src)\s*=\s*["'](?<value>[^"']*)["']/gi)) {
      const attribute = match.groups.attr.toLowerCase();
      const value = match.groups.value.trim();
      const line = lineNumberAt(html, match.index);

      if (!value) {
        addIssue(issues, "error", "Links", file, line, `Empty ${attribute} attribute.`);
        continue;
      }

      refsChecked++;

      if (/\/webact-redesign\//i.test(value)) addIssue(issues, "error", "URLs", file, line, "Development base path remains.", value);
      if (/(^|\/)index\.html(?:[?#]|$)/i.test(value)) addIssue(issues, "error", "URLs", file, line, "Explicit index.html URL remains.", value);
      if (value.startsWith("/") && /(^|\/)\.\.(\/|$)/.test(value)) addIssue(issues, "error", "URLs", file, line, "Invalid ../ segment in root-relative URL.", value);

      const resolved = resolveInternal(file, value);
      if (resolved.exists) {
        validRefs++;
        if (!resolved.external && resolved.target && HTML_EXTS.has(path.extname(resolved.target).toLowerCase())) {
          graph.get(page).add(rel(resolved.target));
        }
      } else {
        addIssue(
          issues,
          "error",
          attribute === "src" ? "Assets" : "Links",
          file,
          line,
          attribute === "src" ? "Missing internal asset." : "Broken internal link.",
          value
        );
      }
    }

    for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
      const attrs = match[1];
      const line = lineNumberAt(html, match.index);
      if (!/\balt\s*=/i.test(attrs)) addIssue(issues, "warning", "Accessibility", file, line, "Image is missing alt attribute.");
      if (!/\bwidth\s*=/i.test(attrs) || !/\bheight\s*=/i.test(attrs)) {
        addIssue(issues, "info", "Performance", file, line, "Image is missing explicit width and/or height.");
      }
      if (!/\bloading\s*=\s*["']lazy["']/i.test(attrs) && !/\bfetchpriority\s*=\s*["']high["']/i.test(attrs)) {
        addIssue(issues, "info", "Performance", file, line, "Image may benefit from lazy loading.");
      }
    }

    pages.push({
      file: page,
      title,
      description,
      canonical,
      h1Count,
      references: graph.get(page).size
    });
  }

  for (const file of searchableFiles) {
    const text = readText(file);
    if (/\/webact-redesign\//i.test(text)) {
      addIssue(issues, "error", "URLs", file, 1, "File still contains /webact-redesign/.");
    }
    if (/\/index\.html(?:[?#"'`\s]|$)/i.test(text)) {
      addIssue(issues, "error", "URLs", file, 1, "File still contains an explicit /index.html URL.");
    }
  }

  for (const [title, pageList] of titleMap.entries()) {
    if (pageList.length > 1) {
      for (const page of pageList) {
        addIssue(issues, "warning", "Duplicate Content", path.join(ROOT, page), 1, `Duplicate title used on ${pageList.length} pages.`, title);
      }
    }
  }

  for (const [description, pageList] of descriptionMap.entries()) {
    if (description && pageList.length > 1) {
      for (const page of pageList) {
        addIssue(issues, "warning", "Duplicate Content", path.join(ROOT, page), 1, `Duplicate meta description used on ${pageList.length} pages.`, description);
      }
    }
  }

  for (const [canonical, pageList] of canonMap.entries()) {
    if (canonical && pageList.length > 1) {
      for (const page of pageList) {
        addIssue(issues, "error", "Canonical", path.join(ROOT, page), 1, `Canonical URL is shared by ${pageList.length} pages.`, canonical);
      }
    }
  }

  const home = fs.existsSync(path.join(ROOT, "index.html")) ? "index.html" : null;
  if (home) {
    const visited = new Set([home]);
    const queue = [home];
    while (queue.length) {
      const current = queue.shift();
      for (const target of graph.get(current) || []) {
        if (!visited.has(target)) {
          visited.add(target);
          queue.push(target);
        }
      }
    }
    for (const file of htmlFiles) {
      const page = rel(file);
      if (!visited.has(page) && !page.startsWith("tools/") && !page.includes("baseline") && !page.includes("before-")) {
        addIssue(issues, "warning", "Orphan Pages", file, 1, "Page is not reachable from the homepage through detected internal HTML links.");
      }
    }
  }

  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    addIssue(issues, "error", "Sitemap", sitemapPath, 1, "sitemap.xml is missing.");
  } else {
    const sitemap = readText(sitemapPath);
    if (/\/webact-redesign\//i.test(sitemap)) addIssue(issues, "error", "Sitemap", sitemapPath, 1, "Sitemap contains /webact-redesign/.");
    if (/\/index\.html/i.test(sitemap)) addIssue(issues, "error", "Sitemap", sitemapPath, 1, "Sitemap contains index.html URLs.");
  }

  const robotsPath = path.join(ROOT, "robots.txt");
  if (!fs.existsSync(robotsPath)) {
    addIssue(issues, "warning", "Robots", robotsPath, 1, "robots.txt is missing.");
  }

  issues.sort((a, b) => {
    const order = { error: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity] ||
      a.category.localeCompare(b.category) ||
      a.file.localeCompare(b.file) ||
      a.line - b.line;
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    htmlFiles: htmlFiles.length,
    searchableFiles: searchableFiles.length,
    referencesChecked: refsChecked,
    validReferences: validRefs,
    errors: issues.filter((item) => item.severity === "error").length,
    warnings: issues.filter((item) => item.severity === "warning").length,
    info: issues.filter((item) => item.severity === "info").length
  };

  const payload = { summary, pages, issues };
  fs.writeFileSync(JSON_REPORT, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(HTML_REPORT, renderHtml(payload), "utf8");

  console.log("");
  console.log("WebAct Enterprise Site Auditor");
  console.log("--------------------------------");
  console.log(`HTML files:        ${summary.htmlFiles}`);
  console.log(`References:        ${summary.referencesChecked}`);
  console.log(`Valid references:  ${summary.validReferences}`);
  console.log(`Errors:            ${summary.errors}`);
  console.log(`Warnings:          ${summary.warnings}`);
  console.log(`Information:       ${summary.info}`);
  console.log("");
  console.log(`HTML report: ${HTML_REPORT}`);
  console.log(`JSON report: ${JSON_REPORT}`);
  console.log("");

  process.exitCode = summary.errors > 0 ? 1 : 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(payload) {
  const { summary, issues } = payload;
  const categories = [...new Set(issues.map((item) => item.category))].sort();
  const rows = issues.map((issue) => `
    <tr data-severity="${escapeHtml(issue.severity)}" data-category="${escapeHtml(issue.category)}">
      <td><span class="badge ${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</span></td>
      <td>${escapeHtml(issue.category)}</td>
      <td><code>${escapeHtml(issue.file)}</code></td>
      <td>${escapeHtml(issue.line)}</td>
      <td>${escapeHtml(issue.message)}${issue.value ? `<div class="value">${escapeHtml(issue.value)}</div>` : ""}</td>
    </tr>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WebAct Enterprise Site Audit</title>
<style>
:root{--navy:#071b33;--blue:#1478ff;--bg:#f5f8fc;--card:#fff;--line:#dce6f1;--text:#17283d;--muted:#63758b;--error:#c62828;--warning:#b26a00;--info:#1769aa}
*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:var(--bg);color:var(--text)}
header{background:linear-gradient(135deg,#071b33,#0c4f91);color:#fff;padding:42px 24px}
.wrap{max-width:1440px;margin:auto}.eyebrow{font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:.8}
h1{font-size:clamp(32px,5vw,58px);margin:10px 0}.sub{max-width:760px;opacity:.86}
.cards{display:grid;grid-template-columns:repeat(6,minmax(150px,1fr));gap:14px;margin:-25px auto 28px;padding:0 24px}
.card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:0 10px 28px rgba(20,52,90,.08)}
.number{font-size:30px;font-weight:900}.label{color:var(--muted);font-size:13px;margin-top:4px}
main{padding:0 24px 50px}.panel{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden}
.controls{display:flex;gap:12px;flex-wrap:wrap;padding:18px;border-bottom:1px solid var(--line)}
input,select{border:1px solid var(--line);border-radius:10px;padding:11px 12px;font:inherit;min-width:220px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--line);vertical-align:top}
th{background:#f8fbff;position:sticky;top:0}.badge{display:inline-block;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:900;text-transform:uppercase}
.badge.error{background:#ffebee;color:var(--error)}.badge.warning{background:#fff4df;color:var(--warning)}.badge.info{background:#eaf4ff;color:var(--info)}
.value{margin-top:5px;color:var(--muted);word-break:break-all}code{font-size:12px}.empty{padding:40px;text-align:center}
@media(max-width:1000px){.cards{grid-template-columns:repeat(2,1fr)}table{display:block;overflow:auto}}
</style>
</head>
<body>
<header><div class="wrap"><div class="eyebrow">WebAct Development Tools</div><h1>Enterprise Site Audit</h1><div class="sub">Generated ${escapeHtml(summary.generatedAt)}. Review errors first, then warnings and informational optimization opportunities.</div></div></header>
<section class="cards wrap">
<div class="card"><div class="number">${summary.htmlFiles}</div><div class="label">HTML pages</div></div>
<div class="card"><div class="number">${summary.referencesChecked}</div><div class="label">References checked</div></div>
<div class="card"><div class="number">${summary.validReferences}</div><div class="label">Valid references</div></div>
<div class="card"><div class="number">${summary.errors}</div><div class="label">Errors</div></div>
<div class="card"><div class="number">${summary.warnings}</div><div class="label">Warnings</div></div>
<div class="card"><div class="number">${summary.info}</div><div class="label">Information</div></div>
</section>
<main class="wrap"><div class="panel">
<div class="controls">
<input id="search" type="search" placeholder="Search file, category, or message">
<select id="severity"><option value="">All severities</option><option>error</option><option>warning</option><option>info</option></select>
<select id="category"><option value="">All categories</option>${categories.map(c=>`<option>${escapeHtml(c)}</option>`).join("")}</select>
</div>
${issues.length ? `<table><thead><tr><th>Severity</th><th>Category</th><th>File</th><th>Line</th><th>Finding</th></tr></thead><tbody id="results">${rows}</tbody></table>` : `<div class="empty"><h2>No issues found</h2><p>The audit completed without findings.</p></div>`}
</div></main>
<script>
const search=document.getElementById("search"),severity=document.getElementById("severity"),category=document.getElementById("category");
function filter(){const q=(search.value||"").toLowerCase();document.querySelectorAll("#results tr").forEach(row=>{const okQ=!q||row.textContent.toLowerCase().includes(q);const okS=!severity.value||row.dataset.severity===severity.value;const okC=!category.value||row.dataset.category===category.value;row.hidden=!(okQ&&okS&&okC)});}
[search,severity,category].forEach(el=>el&&el.addEventListener("input",filter));
</script>
</body></html>`;
}

audit();
