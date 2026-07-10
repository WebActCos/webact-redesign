#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());
const CONFIG_PATH = path.join(ROOT, "tools", "audit", "webact-auditor.config.json");
const REPORT_DIR = path.join(ROOT, "tools", "audit", "reports", "v2");
const HTML_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v2.html");
const JSON_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v2.json");
const CSV_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v2.csv");

function loadConfig() {
  const fallback = {
    baseUrl: "https://www.webact.com",
    includeExtensions: [".html", ".htm"],
    excludeDirectories: [".git", "node_modules", "vendor", "dist", "build", "coverage", "tools", "pages", "includes", "assets/includes", "assets/templates"],
    excludeFiles: ["homepage-baseline.html"],
    excludeFilePatterns: ["before-", ".before-", "baseline", "backup", "report.html"],
    allowDynamicEmptyAttributes: true,
    dynamicAttributePatterns: ["data-src", "data-lazy", "template", "placeholder"],
    sharedComponentSignals: { header: ["data-shared-header"], footer: ["data-shared-footer"] },
    severity: {},
    failOn: ["critical", "high"]
  };
  if (!fs.existsSync(CONFIG_PATH)) return fallback;
  try {
    return { ...fallback, ...JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")) };
  } catch (error) {
    console.error(`Could not parse ${CONFIG_PATH}: ${error.message}`);
    process.exit(2);
  }
}

const CONFIG = loadConfig();
const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

function normalize(value) { return value.replace(/\\/g, "/"); }
function relative(file) { return normalize(path.relative(ROOT, file)); }
function readText(file) {
  try { return fs.readFileSync(file, "utf8"); } catch { return ""; }
}
function lineAt(text, index) { return text.slice(0, index).split(/\r?\n/).length; }
function textOnly(value) { return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function escapeHtml(value) {
  return String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function csv(value) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }

function isExcluded(filePath) {
  const rel = normalize(path.relative(ROOT, filePath));
  const base = path.basename(filePath).toLowerCase();

  if (CONFIG.excludeFiles.map(x => x.toLowerCase()).includes(base)) return true;
  if (CONFIG.excludeFilePatterns.some(pattern => rel.toLowerCase().includes(pattern.toLowerCase()))) return true;

  return CONFIG.excludeDirectories.some(dir => {
    const normalized = normalize(dir).replace(/^\.?\//, "").replace(/\/$/, "");
    return rel === normalized || rel.startsWith(normalized + "/");
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

function isProductionHtml(file) {
  if (!CONFIG.includeExtensions.includes(path.extname(file).toLowerCase())) return false;
  const rel = relative(file).toLowerCase();
  if (rel.startsWith("tools/") || rel.startsWith("pages/") || rel.startsWith("includes/")) return false;
  if (rel.includes("/includes/") || rel.includes("/templates/")) return false;
  return true;
}

function first(text, regex) {
  const match = regex.exec(text);
  return match ? match[1].trim() : "";
}

function severity(key, fallback) {
  return CONFIG.severity[key] || fallback;
}

function addFinding(findings, priority, category, file, line, message, value = "", recommendation = "") {
  findings.push({
    priority,
    category,
    file: relative(file),
    line,
    message,
    value,
    recommendation
  });
}

function isExternal(ref) {
  return /^(?:https?:|mailto:|tel:|sms:|javascript:|data:|blob:|\/\/)/i.test(ref);
}

function stripQueryHash(ref) {
  return ref.replace(/[?#].*$/, "");
}

function resolveReference(sourceFile, ref) {
  const original = ref.trim();
  if (!original || original.startsWith("#") || isExternal(original)) {
    return { ignored: true, exists: true, target: null };
  }

  let clean = stripQueryHash(original);
  try { clean = decodeURIComponent(clean); } catch {}

  let target = clean.startsWith("/")
    ? path.join(ROOT, clean.replace(/^\/+/, ""))
    : path.resolve(path.dirname(sourceFile), clean);

  if (!target.startsWith(ROOT)) return { ignored: false, exists: false, target };

  const candidates = [target];
  if (!path.extname(target)) {
    candidates.push(path.join(target, "index.html"));
    candidates.push(target + ".html");
  }
  try {
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      candidates.push(path.join(target, "index.html"));
    }
  } catch {}

  const found = candidates.find(candidate => {
    try { return fs.existsSync(candidate) && fs.statSync(candidate).isFile(); }
    catch { return false; }
  });

  return { ignored: false, exists: Boolean(found), target: found || target };
}

function hasDynamicSignal(tag) {
  const lower = tag.toLowerCase();
  return CONFIG.dynamicAttributePatterns.some(pattern => lower.includes(pattern.toLowerCase()));
}

function hasSharedComponent(html, type) {
  const direct = type === "header" ? /<header\b/i.test(html) : /<footer\b/i.test(html);
  if (direct) return true;
  const signals = CONFIG.sharedComponentSignals?.[type] || [];
  return signals.some(signal => html.toLowerCase().includes(signal.toLowerCase()));
}

function auditPage(file, html, findings, graph, maps, counters) {
  const page = relative(file);
  graph.set(page, new Set());

  const title = textOnly(first(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const description =
    first(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    first(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
  const canonical =
    first(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i) ||
    first(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const hasLang = /<html[^>]+lang=["'][^"']+["']/i.test(html);
  const hasMain = /<main\b/i.test(html);

  if (!title) addFinding(findings, severity("missingTitle","high"), "SEO", file, 1, "Missing page title.", "", "Add a unique, descriptive <title>.");
  else {
    if (!maps.titles.has(title)) maps.titles.set(title, []);
    maps.titles.get(title).push(page);
    if (title.length < 20 || title.length > 65) {
      addFinding(findings, "low", "SEO", file, 1, `Title length is ${title.length} characters.`, title, "Keep most titles near 20–65 characters.");
    }
  }

  if (!description) {
    addFinding(findings, severity("missingDescription","medium"), "SEO", file, 1, "Missing meta description.", "", "Add a unique meta description.");
  } else {
    if (!maps.descriptions.has(description)) maps.descriptions.set(description, []);
    maps.descriptions.get(description).push(page);
    if (description.length < 70 || description.length > 170) {
      addFinding(findings, "low", "SEO", file, 1, `Meta description length is ${description.length} characters.`, description, "Keep most descriptions near 70–170 characters.");
    }
  }

  if (!canonical) {
    addFinding(findings, severity("missingCanonical","medium"), "Canonical", file, 1, "Missing canonical URL.", "", "Add a self-referencing canonical URL.");
  } else {
    if (!maps.canonicals.has(canonical)) maps.canonicals.set(canonical, []);
    maps.canonicals.get(canonical).push(page);
    if (/\/webact-redesign\//i.test(canonical)) {
      addFinding(findings, severity("oldDevelopmentPath","critical"), "URLs", file, 1, "Canonical contains the development path.", canonical, "Remove /webact-redesign/.");
    }
    if (/\/index\.html(?:[?#]|$)/i.test(canonical)) {
      addFinding(findings, severity("explicitIndexUrl","high"), "URLs", file, 1, "Canonical exposes index.html.", canonical, "Use the clean directory URL.");
    }
  }

  if (h1Count === 0) addFinding(findings, severity("missingH1","high"), "SEO", file, 1, "Missing H1.", "", "Add one descriptive H1.");
  if (h1Count > 1) addFinding(findings, severity("multipleH1","medium"), "SEO", file, 1, `Multiple H1 elements found (${h1Count}).`, "", "Keep one primary H1.");
  if (!hasViewport) addFinding(findings, severity("missingViewport","high"), "Mobile", file, 1, "Missing viewport meta tag.", "", "Add width=device-width, initial-scale=1.");
  if (!hasLang) addFinding(findings, severity("missingLang","medium"), "Accessibility", file, 1, "Missing html lang attribute.", "", "Add lang=\"en\".");
  if (!hasMain) addFinding(findings, "low", "Accessibility", file, 1, "Missing <main> landmark.", "", "Wrap primary content in <main>.");
  if (!hasSharedComponent(html, "header")) addFinding(findings, severity("missingHeader","medium"), "Consistency", file, 1, "Shared header signal not detected.", "", "Use the shared header component or add an auditor signal.");
  if (!hasSharedComponent(html, "footer")) addFinding(findings, severity("missingFooter","medium"), "Consistency", file, 1, "Shared footer signal not detected.", "", "Use the shared footer component or add an auditor signal.");

  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1].trim()); }
    catch (error) {
      addFinding(findings, severity("invalidJsonLd","high"), "Schema", file, lineAt(html, match.index), "Invalid JSON-LD.", error.message, "Correct the JSON syntax.");
    }
  }

  for (const match of html.matchAll(/<(?<tag>a|img|script|link|source|iframe)\b(?<attrs>[^>]*)>/gi)) {
    const tag = match.groups.tag.toLowerCase();
    const attrs = match.groups.attrs;
    const line = lineAt(html, match.index);
    const attributeNames = tag === "a" || tag === "link" ? ["href"] : ["src"];
    if (tag === "source") attributeNames.push("srcset");

    for (const attr of attributeNames) {
      const attrRegex = new RegExp(`\\b${attr}\\s*=\\s*["']([^"']*)["']`, "i");
      const attrMatch = attrs.match(attrRegex);

      if (!attrMatch) continue;
      const value = attrMatch[1].trim();

      if (!value) {
        const dynamic = CONFIG.allowDynamicEmptyAttributes && hasDynamicSignal(match[0]);
        if (!dynamic) {
          const key = attr === "href" ? "emptyHref" : "emptySrc";
          addFinding(
            findings,
            severity(key, attr === "href" ? "high" : "medium"),
            "Markup",
            file,
            line,
            `Empty ${attr} attribute.`,
            match[0],
            attr === "href" ? "Remove the link or provide a valid destination." : "Provide a valid source or mark this as a dynamic placeholder."
          );
        }
        continue;
      }

      counters.references++;

      if (/\/webact-redesign\//i.test(value)) {
        addFinding(findings, severity("oldDevelopmentPath","critical"), "URLs", file, line, "Development base path remains.", value, "Remove /webact-redesign/.");
      }
      if (/(^|\/)index\.html(?:[?#]|$)/i.test(value)) {
        addFinding(findings, severity("explicitIndexUrl","high"), "URLs", file, line, "Explicit index.html URL remains.", value, "Use the clean directory URL.");
      }

      const resolved = resolveReference(file, value);
      if (resolved.exists) {
        counters.validReferences++;
        if (!resolved.ignored && resolved.target && CONFIG.includeExtensions.includes(path.extname(resolved.target).toLowerCase())) {
          graph.get(page).add(relative(resolved.target));
        }
      } else {
        const isAsset = ["img","script","source","iframe"].includes(tag) || (tag === "link" && /\brel=["']stylesheet["']/i.test(attrs));
        addFinding(
          findings,
          severity(isAsset ? "missingAsset" : "brokenInternalLink", "critical"),
          isAsset ? "Assets" : "Links",
          file,
          line,
          isAsset ? "Missing internal asset." : "Broken internal link.",
          value,
          isAsset ? "Restore the asset or update the reference." : "Update or remove the link."
        );
      }
    }
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = match[1];
    const line = lineAt(html, match.index);
    if (!/\balt\s*=/i.test(attrs)) {
      addFinding(findings, severity("missingAlt","medium"), "Accessibility", file, line, "Image is missing alt text.", match[0], "Add meaningful alt text or alt=\"\" for decorative images.");
    }
    if (!/\bwidth\s*=/i.test(attrs) || !/\bheight\s*=/i.test(attrs)) {
      addFinding(findings, "info", "Performance", file, line, "Image lacks explicit width and/or height.", match[0], "Add intrinsic dimensions to reduce layout shift.");
    }
  }
}

function finalizeDuplicates(findings, maps) {
  for (const [value, pages] of maps.titles) {
    if (pages.length > 1) {
      pages.forEach(page => addFinding(findings, severity("duplicateTitle","medium"), "Duplicate Content", path.join(ROOT,page), 1, `Duplicate title used on ${pages.length} production pages.`, value, "Make the title unique."));
    }
  }
  for (const [value, pages] of maps.descriptions) {
    if (value && pages.length > 1) {
      pages.forEach(page => addFinding(findings, severity("duplicateDescription","low"), "Duplicate Content", path.join(ROOT,page), 1, `Duplicate description used on ${pages.length} production pages.`, value, "Write a unique description."));
    }
  }
  for (const [value, pages] of maps.canonicals) {
    if (value && pages.length > 1) {
      pages.forEach(page => addFinding(findings, severity("duplicateCanonical","high"), "Canonical", path.join(ROOT,page), 1, `Canonical shared by ${pages.length} production pages.`, value, "Use a unique self-referencing canonical or consolidate duplicate pages."));
    }
  }
}

function findOrphans(findings, files, graph) {
  const home = files.find(file => relative(file) === "index.html");
  if (!home) return;

  const visited = new Set(["index.html"]);
  const queue = ["index.html"];

  while (queue.length) {
    const current = queue.shift();
    for (const target of graph.get(current) || []) {
      if (!visited.has(target)) {
        visited.add(target);
        queue.push(target);
      }
    }
  }

  for (const file of files) {
    const page = relative(file);
    if (!visited.has(page)) {
      addFinding(findings, severity("orphanPage","medium"), "Architecture", file, 1, "Production page is not reachable from the homepage through detected HTML links.", "", "Add an internal link, include it in navigation, or remove it from production.");
    }
  }
}

function validateSiteFiles(findings) {
  const sitemap = path.join(ROOT, "sitemap.xml");
  const robots = path.join(ROOT, "robots.txt");

  if (!fs.existsSync(sitemap)) {
    addFinding(findings, severity("missingSitemap","high"), "Sitemap", sitemap, 1, "sitemap.xml is missing.", "", "Create a production sitemap.");
  } else {
    const text = readText(sitemap);
    if (/\/webact-redesign\//i.test(text)) addFinding(findings, "critical", "Sitemap", sitemap, 1, "Sitemap contains /webact-redesign/.", "", "Remove development paths.");
    if (/\/index\.html/i.test(text)) addFinding(findings, "high", "Sitemap", sitemap, 1, "Sitemap contains index.html URLs.", "", "Use clean URLs.");
  }

  if (!fs.existsSync(robots)) {
    addFinding(findings, severity("missingRobots","medium"), "Robots", robots, 1, "robots.txt is missing.", "", "Create robots.txt and reference the sitemap.");
  }
}

function renderHtml(payload) {
  const { summary, findings } = payload;
  const categories = [...new Set(findings.map(x => x.category))].sort();
  const rows = findings.map(item => `
<tr data-priority="${escapeHtml(item.priority)}" data-category="${escapeHtml(item.category)}">
<td><span class="badge ${escapeHtml(item.priority)}">${escapeHtml(item.priority)}</span></td>
<td>${escapeHtml(item.category)}</td>
<td><code>${escapeHtml(item.file)}</code></td>
<td>${item.line}</td>
<td><strong>${escapeHtml(item.message)}</strong>${item.value ? `<div class="value">${escapeHtml(item.value)}</div>` : ""}${item.recommendation ? `<div class="recommendation">${escapeHtml(item.recommendation)}</div>` : ""}</td>
</tr>`).join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WebAct Enterprise Auditor v2</title>
<style>
:root{--navy:#071b33;--blue:#1377ff;--bg:#f4f7fb;--card:#fff;--line:#dbe5ef;--text:#17283d;--muted:#66788e}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,Arial,sans-serif}
header{background:linear-gradient(135deg,#071b33,#0e5aa6);color:#fff;padding:42px 24px}.wrap{max-width:1500px;margin:auto}
h1{font-size:clamp(34px,5vw,62px);margin:8px 0}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-weight:800;font-size:12px;opacity:.8}
.cards{display:grid;grid-template-columns:repeat(6,minmax(140px,1fr));gap:14px;margin:-24px auto 28px;padding:0 24px}
.card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:0 10px 26px rgba(15,40,75,.08)}
.number{font-size:30px;font-weight:900}.label{font-size:13px;color:var(--muted)}
main{padding:0 24px 50px}.panel{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden}
.controls{display:flex;gap:12px;flex-wrap:wrap;padding:18px;border-bottom:1px solid var(--line)}
input,select{padding:11px 12px;border:1px solid var(--line);border-radius:10px;font:inherit;min-width:220px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--line);vertical-align:top}
th{position:sticky;top:0;background:#f8fbff}.badge{padding:4px 9px;border-radius:999px;font-size:11px;font-weight:900;text-transform:uppercase}
.badge.critical{background:#fde8e8;color:#a80000}.badge.high{background:#fff0e0;color:#a64b00}.badge.medium{background:#fff8d7;color:#7c6500}.badge.low{background:#eaf4ff;color:#165c94}.badge.info{background:#edf0f4;color:#4c5b6b}
.value{margin-top:6px;color:var(--muted);word-break:break-all}.recommendation{margin-top:7px;color:#255b36;font-weight:600}
@media(max-width:1000px){.cards{grid-template-columns:repeat(2,1fr)}table{display:block;overflow:auto}}
</style></head>
<body>
<header><div class="wrap"><div class="eyebrow">WebAct Development Tools</div><h1>Enterprise Site Auditor v2</h1><p>Production-only audit generated ${escapeHtml(summary.generatedAt)}. High-noise folders, templates, reports, includes, and legacy pages are excluded.</p></div></header>
<section class="cards wrap">
<div class="card"><div class="number">${summary.productionPages}</div><div class="label">Production pages</div></div>
<div class="card"><div class="number">${summary.referencesChecked}</div><div class="label">References checked</div></div>
<div class="card"><div class="number">${summary.critical}</div><div class="label">Critical</div></div>
<div class="card"><div class="number">${summary.high}</div><div class="label">High</div></div>
<div class="card"><div class="number">${summary.medium}</div><div class="label">Medium</div></div>
<div class="card"><div class="number">${summary.low + summary.info}</div><div class="label">Low + info</div></div>
</section>
<main class="wrap"><div class="panel"><div class="controls">
<input id="search" type="search" placeholder="Search findings">
<select id="priority"><option value="">All priorities</option><option>critical</option><option>high</option><option>medium</option><option>low</option><option>info</option></select>
<select id="category"><option value="">All categories</option>${categories.map(c=>`<option>${escapeHtml(c)}</option>`).join("")}</select>
</div>
${findings.length ? `<table><thead><tr><th>Priority</th><th>Category</th><th>File</th><th>Line</th><th>Finding and action</th></tr></thead><tbody id="results">${rows}</tbody></table>` : `<div style="padding:40px;text-align:center"><h2>No production findings</h2></div>`}
</div></main>
<script>
const s=document.getElementById("search"),p=document.getElementById("priority"),c=document.getElementById("category");
function filter(){const q=(s.value||"").toLowerCase();document.querySelectorAll("#results tr").forEach(r=>{r.hidden=!((!q||r.textContent.toLowerCase().includes(q))&&(!p.value||r.dataset.priority===p.value)&&(!c.value||r.dataset.category===c.value));});}
[s,p,c].forEach(x=>x&&x.addEventListener("input",filter));
</script></body></html>`;
}

function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const allFiles = walk(ROOT);
  const productionFiles = allFiles.filter(isProductionHtml);

  const findings = [];
  const graph = new Map();
  const maps = { titles: new Map(), descriptions: new Map(), canonicals: new Map() };
  const counters = { references: 0, validReferences: 0 };

  for (const file of productionFiles) {
    auditPage(file, readText(file), findings, graph, maps, counters);
  }

  finalizeDuplicates(findings, maps);
  findOrphans(findings, productionFiles, graph);
  validateSiteFiles(findings);

  const unique = [];
  const seen = new Set();
  for (const item of findings) {
    const key = [item.priority,item.category,item.file,item.line,item.message,item.value].join("|");
    if (!seen.has(key)) { seen.add(key); unique.push(item); }
  }

  unique.sort((a,b) =>
    SEVERITY_ORDER[a.priority] - SEVERITY_ORDER[b.priority] ||
    a.category.localeCompare(b.category) ||
    a.file.localeCompare(b.file) ||
    a.line - b.line
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    productionPages: productionFiles.length,
    referencesChecked: counters.references,
    validReferences: counters.validReferences,
    critical: unique.filter(x=>x.priority==="critical").length,
    high: unique.filter(x=>x.priority==="high").length,
    medium: unique.filter(x=>x.priority==="medium").length,
    low: unique.filter(x=>x.priority==="low").length,
    info: unique.filter(x=>x.priority==="info").length,
    excludedDirectories: CONFIG.excludeDirectories
  };

  const payload = { summary, findings: unique };
  fs.writeFileSync(JSON_REPORT, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(HTML_REPORT, renderHtml(payload), "utf8");

  const csvLines = [
    ["Priority","Category","File","Line","Message","Value","Recommendation"].map(csv).join(","),
    ...unique.map(x => [x.priority,x.category,x.file,x.line,x.message,x.value,x.recommendation].map(csv).join(","))
  ];
  fs.writeFileSync(CSV_REPORT, csvLines.join("\n"), "utf8");

  console.log("");
  console.log("WebAct Enterprise Site Auditor v2");
  console.log("----------------------------------");
  console.log(`Production pages:   ${summary.productionPages}`);
  console.log(`References checked: ${summary.referencesChecked}`);
  console.log(`Critical:           ${summary.critical}`);
  console.log(`High:               ${summary.high}`);
  console.log(`Medium:             ${summary.medium}`);
  console.log(`Low:                ${summary.low}`);
  console.log(`Info:               ${summary.info}`);
  console.log("");
  console.log(`HTML: ${HTML_REPORT}`);
  console.log(`JSON: ${JSON_REPORT}`);
  console.log(`CSV:  ${CSV_REPORT}`);
  console.log("");

  const shouldFail = CONFIG.failOn.some(level => unique.some(item => item.priority === level));
  process.exitCode = shouldFail ? 1 : 0;
}

main();
