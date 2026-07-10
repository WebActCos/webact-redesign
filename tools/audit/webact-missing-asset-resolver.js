#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());
const REPORT_DIR = path.join(ROOT, "tools", "audit", "reports", "asset-resolver");
const HTML_REPORT = path.join(REPORT_DIR, "missing-asset-resolver.html");
const JSON_REPORT = path.join(REPORT_DIR, "missing-asset-resolver.json");
const CSV_REPORT = path.join(REPORT_DIR, "missing-asset-resolver.csv");

const EXCLUDED = [
  ".git", "node_modules", "vendor", "dist", "build", "coverage",
  "tools/backups", "tools/audit/reports", "pages", "includes"
];

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"]);

function normalize(value) {
  return String(value).replace(/\\/g, "/");
}

function relative(file) {
  return normalize(path.relative(ROOT, file));
}

function isExcluded(file) {
  const rel = relative(file).toLowerCase();
  return EXCLUDED.some(item => {
    const value = normalize(item).toLowerCase();
    return rel === value || rel.startsWith(value + "/");
  });
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (isExcluded(full)) continue;
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

function lineAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function tokenize(value) {
  return path.basename(value, path.extname(value))
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length >= 3 && !["image", "images", "photo", "picture", "website"].includes(token));
}

function scoreCandidate(missingPath, candidatePath) {
  const missingName = path.basename(missingPath).toLowerCase();
  const candidateName = path.basename(candidatePath).toLowerCase();
  const missingBase = path.basename(missingPath, path.extname(missingPath)).toLowerCase();
  const candidateBase = path.basename(candidatePath, path.extname(candidatePath)).toLowerCase();

  let score = 0;
  const reasons = [];

  if (missingName === candidateName) {
    score += 100;
    reasons.push("exact filename");
  }

  if (missingBase === candidateBase) {
    score += 80;
    reasons.push("exact base name");
  }

  const missingTokens = tokenize(missingPath);
  const candidateTokens = tokenize(candidatePath);
  const overlap = missingTokens.filter(token => candidateTokens.includes(token));

  if (overlap.length) {
    score += overlap.length * 18;
    reasons.push(`shared keywords: ${overlap.join(", ")}`);
  }

  if (path.extname(missingPath).toLowerCase() === path.extname(candidatePath).toLowerCase()) {
    score += 5;
    reasons.push("same extension");
  }

  const missingParts = normalize(path.dirname(missingPath)).toLowerCase().split("/");
  const candidateParts = normalize(path.dirname(candidatePath)).toLowerCase().split("/");
  const folderOverlap = missingParts.filter(part => part && candidateParts.includes(part));

  if (folderOverlap.length) {
    score += Math.min(folderOverlap.length * 4, 12);
    reasons.push(`related folder: ${folderOverlap.slice(-2).join(", ")}`);
  }

  if (candidateBase.includes(missingBase) || missingBase.includes(candidateBase)) {
    score += 25;
    reasons.push("partial filename match");
  }

  return { score, reasons };
}

function resolveTarget(sourceFile, reference) {
  let clean = reference.split(/[?#]/)[0];

  if (!clean || /^(?:https?:|data:|blob:|\/\/)/i.test(clean)) {
    return null;
  }

  try {
    clean = decodeURIComponent(clean);
  } catch {
    // Keep the original value when URL decoding fails.
  }

  return clean.startsWith("/")
    ? path.join(ROOT, clean.replace(/^\/+/, ""))
    : path.resolve(path.dirname(sourceFile), clean);
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
  const imageFiles = allFiles.filter(file => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));

  const missingMap = new Map();

  for (const htmlFile of htmlFiles) {
    const html = readText(htmlFile);

    for (const match of html.matchAll(/<(?:img|source)\b[^>]*\b(?:src|srcset)\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
      const reference = match[1].trim();

      if (!reference || reference.includes("${") || /\+\s*[A-Za-z_$]/.test(reference)) continue;

      const target = resolveTarget(htmlFile, reference);
      if (!target) continue;

      if (fs.existsSync(target)) continue;

      const key = normalize(target).toLowerCase();

      if (!missingMap.has(key)) {
        missingMap.set(key, {
          missingReference: reference,
          expectedPath: target,
          occurrences: []
        });
      }

      missingMap.get(key).occurrences.push({
        file: relative(htmlFile),
        line: lineAt(html, match.index)
      });
    }
  }

  const findings = [];

  for (const item of missingMap.values()) {
    const candidates = imageFiles
      .filter(candidate => path.resolve(candidate) !== path.resolve(item.expectedPath))
      .map(candidate => {
        const result = scoreCandidate(item.expectedPath, candidate);
        return {
          path: candidate,
          relativePath: relative(candidate),
          score: result.score,
          reasons: result.reasons
        };
      })
      .filter(candidate => candidate.score > 0)
      .sort((a, b) => b.score - a.score || a.relativePath.localeCompare(b.relativePath))
      .slice(0, 10);

    findings.push({
      missingReference: item.missingReference,
      expectedPath: relative(item.expectedPath),
      occurrences: item.occurrences,
      candidates
    });
  }

  findings.sort((a, b) => a.expectedPath.localeCompare(b.expectedPath));

  const payload = {
    generatedAt: new Date().toISOString(),
    htmlFilesChecked: htmlFiles.length,
    imageFilesIndexed: imageFiles.length,
    missingAssets: findings.length,
    findings
  };

  fs.writeFileSync(JSON_REPORT, JSON.stringify(payload, null, 2), "utf8");

  const csvRows = [
    ["Missing Reference", "Expected Path", "Used By", "Best Candidate", "Score", "Reasons"].map(csv).join(",")
  ];

  for (const finding of findings) {
    const best = finding.candidates[0];
    csvRows.push([
      finding.missingReference,
      finding.expectedPath,
      finding.occurrences.map(item => `${item.file}:${item.line}`).join(" | "),
      best?.relativePath || "",
      best?.score || 0,
      best?.reasons.join("; ") || ""
    ].map(csv).join(","));
  }

  fs.writeFileSync(CSV_REPORT, csvRows.join("\n"), "utf8");

  const rows = findings.map(finding => {
    const candidateRows = finding.candidates.length
      ? finding.candidates.map(candidate => `
        <tr>
          <td><code>${escapeHtml(candidate.relativePath)}</code></td>
          <td>${candidate.score}</td>
          <td>${escapeHtml(candidate.reasons.join(", "))}</td>
        </tr>`).join("")
      : `<tr><td colspan="3">No similar candidates found.</td></tr>`;

    return `
      <section class="finding">
        <div class="finding-head">
          <div>
            <div class="label">Missing asset</div>
            <h2><code>${escapeHtml(finding.missingReference)}</code></h2>
            <p>Expected at <code>${escapeHtml(finding.expectedPath)}</code></p>
          </div>
          <span class="count">${finding.occurrences.length} use${finding.occurrences.length === 1 ? "" : "s"}</span>
        </div>

        <details>
          <summary>Pages using this asset</summary>
          <ul>${finding.occurrences.map(item => `<li><code>${escapeHtml(item.file)}:${item.line}</code></li>`).join("")}</ul>
        </details>

        <h3>Best repository candidates</h3>
        <table>
          <thead><tr><th>Candidate</th><th>Score</th><th>Why it matched</th></tr></thead>
          <tbody>${candidateRows}</tbody>
        </table>
      </section>`;
  }).join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WebAct Missing Asset Resolver</title>
<style>
:root{--navy:#071b33;--blue:#1478ff;--bg:#f4f7fb;--card:#fff;--line:#dce6f1;--text:#17283d;--muted:#65778c}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,Arial,sans-serif}
header{background:linear-gradient(135deg,#071b33,#0e5aa6);color:#fff;padding:42px 24px}
.wrap{max-width:1300px;margin:auto}
h1{font-size:clamp(34px,5vw,58px);margin:8px 0}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:-24px auto 28px;padding:0 24px}
.card,.finding{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px}
.card{box-shadow:0 10px 26px rgba(15,40,75,.08)}
.number{font-size:30px;font-weight:900}
.label{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
main{padding:0 24px 50px}
.finding{margin-bottom:18px}
.finding-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}
.count{background:#eaf4ff;color:#0b5da8;border-radius:999px;padding:7px 12px;font-weight:800;white-space:nowrap}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{text-align:left;padding:11px;border-bottom:1px solid var(--line);vertical-align:top}
th{background:#f8fbff}
code{word-break:break-all}
summary{cursor:pointer;font-weight:700}
@media(max-width:800px){.summary{grid-template-columns:1fr}.finding-head{display:block}.count{display:inline-block;margin-top:8px}table{display:block;overflow:auto}}
</style>
</head>
<body>
<header><div class="wrap"><div class="label" style="color:#c9e1ff">WebAct Development Tools</div><h1>Missing Asset Resolver</h1><p>Scans production HTML, finds missing images, and ranks the best existing repository candidates without changing website files.</p></div></header>
<section class="summary wrap">
<div class="card"><div class="number">${payload.htmlFilesChecked}</div><div class="label">HTML files checked</div></div>
<div class="card"><div class="number">${payload.imageFilesIndexed}</div><div class="label">Images indexed</div></div>
<div class="card"><div class="number">${payload.missingAssets}</div><div class="label">Missing assets</div></div>
</section>
<main class="wrap">${rows || `<section class="finding"><h2>No missing image assets found.</h2></section>`}</main>
</body>
</html>`;

  fs.writeFileSync(HTML_REPORT, html, "utf8");

  console.log("");
  console.log("WebAct Missing Asset Resolver");
  console.log("-----------------------------");
  console.log(`HTML files checked: ${payload.htmlFilesChecked}`);
  console.log(`Images indexed:     ${payload.imageFilesIndexed}`);
  console.log(`Missing assets:     ${payload.missingAssets}`);
  console.log("");
  console.log(`HTML: ${HTML_REPORT}`);
  console.log(`JSON: ${JSON_REPORT}`);
  console.log(`CSV:  ${CSV_REPORT}`);
}

main();
