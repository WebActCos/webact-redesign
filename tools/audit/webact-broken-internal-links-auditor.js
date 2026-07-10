#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());
const REPORT_DIR = path.join(ROOT, "tools", "audit", "reports", "broken-links");
const HTML_REPORT = path.join(REPORT_DIR, "broken-internal-links.html");
const JSON_REPORT = path.join(REPORT_DIR, "broken-internal-links.json");
const CSV_REPORT = path.join(REPORT_DIR, "broken-internal-links.csv");

const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  "vendor",
  "dist",
  "build",
  "coverage",
  ".next",
  ".cache",
  "tools",
  "pages",
  "includes",
  "assets/includes",
  "assets/templates"
]);

const EXCLUDED_FILE_PATTERNS = [
  "before-",
  ".before-",
  "baseline",
  "backup",
  "homepage-baseline",
  "report.html",
  "index-before-"
];

function normalize(value) {
  return String(value).replace(/\\/g, "/");
}

function relative(file) {
  return normalize(path.relative(ROOT, file));
}

function isExcluded(filePath) {
  const rel = relative(filePath).toLowerCase();
  const parts = rel.split("/");

  if (parts.some(part => EXCLUDED_DIRS.has(part))) {
    return true;
  }

  return EXCLUDED_FILE_PATTERNS.some(pattern =>
    rel.includes(pattern.toLowerCase())
  );
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (isExcluded(full)) {
      continue;
    }

    if (entry.isDirectory()) {
      walk(full, results);
    } else {
      results.push(full);
    }
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

function isExternal(value) {
  return /^(?:https?:|mailto:|tel:|sms:|javascript:|data:|blob:|\/\/)/i.test(value);
}

function isDynamic(value) {
  return /\$\{[^}]+\}/.test(value) ||
    /\+\s*[A-Za-z_$][\w$]*(?:\[[^\]]+\])?\s*\+/.test(value) ||
    /<%|%>|{{|}}/.test(value);
}

function stripQueryAndHash(value) {
  return value.replace(/[?#].*$/, "");
}

function decodeSafe(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function resolveInternalLink(sourceFile, rawHref) {
  const href = rawHref.trim();

  if (
    !href ||
    href.startsWith("#") ||
    isExternal(href) ||
    isDynamic(href)
  ) {
    return {
      ignored: true,
      exists: true,
      target: null
    };
  }

  let clean = decodeSafe(stripQueryAndHash(href));

  if (!clean) {
    return {
      ignored: true,
      exists: true,
      target: null
    };
  }

  let target;

  if (clean.startsWith("/")) {
    target = path.join(ROOT, clean.replace(/^\/+/, ""));
  } else {
    target = path.resolve(path.dirname(sourceFile), clean);
  }

  const candidates = [];
  const addCandidate = candidate => {
    if (!candidates.includes(candidate)) {
      candidates.push(candidate);
    }
  };

  addCandidate(target);

  try {
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      addCandidate(path.join(target, "index.html"));
    }
  } catch {}

  if (!path.extname(target)) {
    addCandidate(path.join(target, "index.html"));
    addCandidate(target + ".html");
  }

  const found = candidates.find(candidate => {
    try {
      return fs.existsSync(candidate) && fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  });

  return {
    ignored: false,
    exists: Boolean(found),
    target: found || target,
    candidates
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function csv(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const allFiles = walk(ROOT);
  const htmlFiles = allFiles.filter(file => /\.html?$/i.test(file));

  const findings = [];
  let linksChecked = 0;
  let validLinks = 0;
  let ignoredLinks = 0;

  for (const file of htmlFiles) {
    const html = readText(file);

    for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']*)["'][^>]*>/gi)) {
      const href = match[1].trim();
      const line = lineNumberAt(html, match.index);

      if (!href) {
        findings.push({
          file: relative(file),
          line,
          href,
          type: "empty",
          message: "Empty internal link.",
          recommendation: "Add a valid destination or remove the link."
        });
        continue;
      }

      const result = resolveInternalLink(file, href);

      if (result.ignored) {
        ignoredLinks++;
        continue;
      }

      linksChecked++;

      if (result.exists) {
        validLinks++;
        continue;
      }

      findings.push({
        file: relative(file),
        line,
        href,
        type: "broken",
        message: "Broken internal link.",
        expectedPath: relative(result.target),
        recommendation: "Update the href to a page that exists, create the destination page, or remove the link."
      });
    }
  }

  findings.sort((a, b) =>
    a.file.localeCompare(b.file) ||
    a.line - b.line ||
    a.href.localeCompare(b.href)
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    htmlFilesChecked: htmlFiles.length,
    linksChecked,
    validLinks,
    ignoredLinks,
    brokenLinks: findings.filter(item => item.type === "broken").length,
    emptyLinks: findings.filter(item => item.type === "empty").length,
    totalFindings: findings.length
  };

  const payload = {
    summary,
    findings
  };

  fs.writeFileSync(
    JSON_REPORT,
    JSON.stringify(payload, null, 2),
    "utf8"
  );

  const csvRows = [
    [
      "Type",
      "File",
      "Line",
      "Href",
      "Expected Path",
      "Message",
      "Recommendation"
    ].map(csv).join(","),
    ...findings.map(item => [
      item.type,
      item.file,
      item.line,
      item.href,
      item.expectedPath || "",
      item.message,
      item.recommendation
    ].map(csv).join(","))
  ];

  fs.writeFileSync(
    CSV_REPORT,
    csvRows.join("\n"),
    "utf8"
  );

  const rows = findings.map(item => `
    <tr>
      <td><span class="badge ${escapeHtml(item.type)}">${escapeHtml(item.type)}</span></td>
      <td><code>${escapeHtml(item.file)}</code></td>
      <td>${item.line}</td>
      <td><code>${escapeHtml(item.href)}</code></td>
      <td>${item.expectedPath ? `<code>${escapeHtml(item.expectedPath)}</code>` : ""}</td>
      <td>${escapeHtml(item.recommendation)}</td>
    </tr>
  `).join("");

  const htmlReport = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WebAct Broken Internal Links Audit</title>
<style>
:root{
  --navy:#071b33;
  --blue:#1478ff;
  --bg:#f4f7fb;
  --card:#fff;
  --line:#dce6f1;
  --text:#17283d;
  --muted:#65778c;
  --danger:#b42318;
  --warning:#9a6700;
}
*{box-sizing:border-box}
body{
  margin:0;
  background:var(--bg);
  color:var(--text);
  font-family:Inter,Arial,sans-serif;
}
header{
  background:linear-gradient(135deg,#071b33,#0e5aa6);
  color:#fff;
  padding:42px 24px;
}
.wrap{
  max-width:1400px;
  margin:auto;
}
.eyebrow{
  font-size:12px;
  font-weight:800;
  letter-spacing:.12em;
  text-transform:uppercase;
  opacity:.8;
}
h1{
  margin:8px 0;
  font-size:clamp(34px,5vw,58px);
}
.summary{
  display:grid;
  grid-template-columns:repeat(6,minmax(140px,1fr));
  gap:14px;
  margin:-24px auto 28px;
  padding:0 24px;
}
.card{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:16px;
  padding:20px;
  box-shadow:0 10px 26px rgba(15,40,75,.08);
}
.number{
  font-size:30px;
  font-weight:900;
}
.label{
  color:var(--muted);
  font-size:13px;
  margin-top:4px;
}
main{
  padding:0 24px 50px;
}
.panel{
  background:#fff;
  border:1px solid var(--line);
  border-radius:18px;
  overflow:hidden;
}
.controls{
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  padding:18px;
  border-bottom:1px solid var(--line);
}
input,select{
  border:1px solid var(--line);
  border-radius:10px;
  padding:11px 12px;
  font:inherit;
  min-width:220px;
}
table{
  width:100%;
  border-collapse:collapse;
  font-size:14px;
}
th,td{
  text-align:left;
  padding:12px;
  border-bottom:1px solid var(--line);
  vertical-align:top;
}
th{
  position:sticky;
  top:0;
  background:#f8fbff;
}
.badge{
  display:inline-block;
  border-radius:999px;
  padding:4px 9px;
  font-size:11px;
  font-weight:900;
  text-transform:uppercase;
}
.badge.broken{
  background:#fdecec;
  color:var(--danger);
}
.badge.empty{
  background:#fff5d9;
  color:var(--warning);
}
code{
  word-break:break-all;
}
.empty-state{
  padding:40px;
  text-align:center;
}
@media(max-width:1000px){
  .summary{grid-template-columns:repeat(2,1fr)}
  table{display:block;overflow:auto}
}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <div class="eyebrow">WebAct Development Tools</div>
    <h1>Broken Internal Links Audit</h1>
    <p>Checks internal anchor links only. Images, scripts, stylesheets, canonicals, metadata, and design assets are intentionally ignored.</p>
  </div>
</header>

<section class="summary wrap">
  <div class="card"><div class="number">${summary.htmlFilesChecked}</div><div class="label">HTML files checked</div></div>
  <div class="card"><div class="number">${summary.linksChecked}</div><div class="label">Internal links checked</div></div>
  <div class="card"><div class="number">${summary.validLinks}</div><div class="label">Valid internal links</div></div>
  <div class="card"><div class="number">${summary.ignoredLinks}</div><div class="label">External or dynamic links ignored</div></div>
  <div class="card"><div class="number">${summary.brokenLinks}</div><div class="label">Broken links</div></div>
  <div class="card"><div class="number">${summary.emptyLinks}</div><div class="label">Empty links</div></div>
</section>

<main class="wrap">
  <div class="panel">
    <div class="controls">
      <input id="search" type="search" placeholder="Search file or href">
      <select id="type">
        <option value="">All findings</option>
        <option value="broken">Broken links</option>
        <option value="empty">Empty links</option>
      </select>
    </div>

    ${findings.length ? `
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Source file</th>
          <th>Line</th>
          <th>Href</th>
          <th>Expected path</th>
          <th>Recommended action</th>
        </tr>
      </thead>
      <tbody id="results">
        ${rows}
      </tbody>
    </table>
    ` : `
    <div class="empty-state">
      <h2>No broken internal links found</h2>
      <p>The audit completed without internal-link findings.</p>
    </div>
    `}
  </div>
</main>

<script>
const search = document.getElementById("search");
const type = document.getElementById("type");

function filterRows() {
  const query = (search.value || "").toLowerCase();

  document.querySelectorAll("#results tr").forEach(row => {
    const matchesQuery = !query || row.textContent.toLowerCase().includes(query);
    const badge = row.querySelector(".badge");
    const matchesType = !type.value || (badge && badge.classList.contains(type.value));

    row.hidden = !(matchesQuery && matchesType);
  });
}

[search, type].forEach(element => {
  if (element) {
    element.addEventListener("input", filterRows);
  }
});
</script>
</body>
</html>`;

  fs.writeFileSync(
    HTML_REPORT,
    htmlReport,
    "utf8"
  );

  console.log("");
  console.log("WebAct Broken Internal Links Audit");
  console.log("----------------------------------");
  console.log(`HTML files checked: ${summary.htmlFilesChecked}`);
  console.log(`Internal links:     ${summary.linksChecked}`);
  console.log(`Valid links:        ${summary.validLinks}`);
  console.log(`Ignored links:      ${summary.ignoredLinks}`);
  console.log(`Broken links:       ${summary.brokenLinks}`);
  console.log(`Empty links:        ${summary.emptyLinks}`);
  console.log("");
  console.log(`HTML: ${HTML_REPORT}`);
  console.log(`JSON: ${JSON_REPORT}`);
  console.log(`CSV:  ${CSV_REPORT}`);
  console.log("");

  process.exitCode = summary.totalFindings > 0 ? 1 : 0;
}

main();
