#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());
const CONFIG_PATH = path.join(ROOT, "tools", "audit", "webact-auditor-v4.config.json");
const REPORT_DIR = path.join(ROOT, "tools", "audit", "reports", "v4");
const HTML_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v4.html");
const JSON_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v4.json");
const CSV_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v4.csv");

const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
const ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

const norm = v => String(v).replace(/\\/g, "/");
const rel = f => norm(path.relative(ROOT, f));
const read = f => { try { return fs.readFileSync(f, "utf8"); } catch { return ""; } };
const cleanText = v => String(v || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const csv = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
const lineAt = (t, i) => t.slice(0, i).split(/\r?\n/).length;
const sev = (k, d) => CONFIG.severity?.[k] || d;

function excluded(file) {
  const r = rel(file).toLowerCase();
  if ((CONFIG.excludeFilePatterns || []).some(p => r.includes(p.toLowerCase()))) return true;
  return (CONFIG.excludeDirectories || []).some(d => {
    const x = norm(d).replace(/^\.?\//,"").replace(/\/$/,"").toLowerCase();
    return r === x || r.startsWith(x + "/");
  });
}

function walk(dir, out=[]) {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    const f = path.join(dir, e.name);
    if (excluded(f)) continue;
    if (e.isDirectory()) walk(f, out);
    else out.push(f);
  }
  return out;
}

function areaFor(page) {
  for (const area of CONFIG.siteAreas || []) {
    if ((area.patterns || []).some(p => new RegExp(p, "i").test(page))) return area;
  }
  return {name:"other", checks:{links:true,assets:true,seo:false,canonical:false,headings:false,sharedLayout:false,imageDimensions:false,orphan:false}};
}

function add(findings, priority, area, category, file, line, message, value="", recommendation="") {
  findings.push({priority, area, category, file:rel(file), line, message, value, recommendation});
}

function first(html, regex) {
  const m = regex.exec(html);
  return m ? m[1].trim() : "";
}

function external(ref) {
  return /^(?:https?:|mailto:|tel:|sms:|javascript:|data:|blob:|\/\/)/i.test(ref);
}

function isDynamic(ref) {
  return (CONFIG.dynamicRoutePatterns || []).some(p => new RegExp(p, "i").test(ref));
}

function resolveRef(source, raw) {
  const ref = raw.replace(/[?#].*$/, "");
  if (!ref || ref.startsWith("#") || external(raw)) return {ignored:true, exists:true};

  let target = ref.startsWith("/")
    ? path.join(ROOT, ref.replace(/^\/+/,""))
    : path.resolve(path.dirname(source), ref);

  const candidates = [target];
  if (!path.extname(target)) {
    candidates.push(path.join(target, "index.html"));
    candidates.push(target + ".html");
  }

  const found = candidates.find(f => {
    try { return fs.existsSync(f) && fs.statSync(f).isFile(); } catch { return false; }
  });

  return {ignored:false, exists:Boolean(found), target:found || target};
}

function hasSignal(html, type) {
  return (CONFIG.knownSharedSignals?.[type] || []).some(s => html.toLowerCase().includes(s.toLowerCase()));
}

function templateMarker(area, title) {
  return (CONFIG.templateMarkers?.[area] || []).some(m => cleanText(m) === cleanText(title));
}

function auditPage(file, html, findings, groups, stats) {
  const page = rel(file);
  const area = areaFor(page);
  const checks = area.checks || {};
  stats.areas[area.name] = (stats.areas[area.name] || 0) + 1;

  const title = cleanText(first(html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const description =
    first(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    first(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
  const canonical =
    first(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i) ||
    first(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (checks.seo) {
    if (!title) add(findings, sev("missingTitle","high"), area.name, "SEO", file, 1, "Missing page title.", "", "Add a unique title.");
    if (!description) add(findings, sev("missingDescription","medium"), area.name, "SEO", file, 1, "Missing meta description.", "", "Add a useful description.");
  }

  if (title) {
    if (!groups.titles.has(title)) groups.titles.set(title, []);
    groups.titles.get(title).push({file, area:area.name, page});
    if (templateMarker(area.name, title)) {
      if (!groups.templateIssues.has(area.name)) groups.templateIssues.set(area.name, []);
      groups.templateIssues.get(area.name).push({file, title});
    }
  }

  if (description) {
    if (!groups.descriptions.has(description)) groups.descriptions.set(description, []);
    groups.descriptions.get(description).push({file, area:area.name, page});
  }

  if (checks.canonical && !canonical) {
    add(findings, sev("missingCanonical","medium"), area.name, "Canonical", file, 1, "Missing canonical URL.", "", "Add a self-referencing canonical URL.");
  }

  if (checks.headings) {
    if (h1Count === 0) add(findings, sev("missingH1","high"), area.name, "SEO", file, 1, "Missing H1.", "", "Add one descriptive H1.");
    if (h1Count > 1) add(findings, sev("multipleH1","medium"), area.name, "SEO", file, 1, `Multiple H1 elements found (${h1Count}).`, "", "Keep one primary H1.");
  }

  if (checks.sharedLayout) {
    if (!hasSignal(html, "header")) add(findings, sev("missingHeader","medium"), area.name, "Layout", file, 1, "Shared header signal not detected.", "", "Use the shared header component.");
    if (!hasSignal(html, "footer")) add(findings, sev("missingFooter","medium"), area.name, "Layout", file, 1, "Shared footer signal not detected.", "", "Use the shared footer component.");
  }

  for (const m of html.matchAll(/<(?<tag>a|img|script|link|source|iframe)\b(?<attrs>[^>]*)>/gi)) {
    const tag = m.groups.tag.toLowerCase();
    const attrs = m.groups.attrs;
    const attr = (tag === "a" || tag === "link") ? "href" : "src";
    const am = attrs.match(new RegExp(`\\b${attr}\\s*=\\s*["']([^"']*)["']`, "i"));
    if (!am) continue;

    const value = am[1].trim();
    if (!value || isDynamic(value)) continue;
    stats.references++;

    const result = resolveRef(file, value);
    if (result.exists) continue;

    const isAsset = ["img","script","source","iframe"].includes(tag) || (tag === "link" && /\brel=["']stylesheet["']/i.test(attrs));
    if ((isAsset && checks.assets) || (!isAsset && checks.links)) {
      add(
        findings,
        sev(isAsset ? "missingAsset" : "brokenInternalLink", "critical"),
        area.name,
        isAsset ? "Assets" : "Links",
        file,
        lineAt(html, m.index),
        isAsset ? "Missing internal asset." : "Broken internal link.",
        value,
        isAsset ? "Restore the asset or update the reference." : "Update or remove the link."
      );
    }
  }

  if (checks.imageDimensions) {
    for (const m of html.matchAll(/<img\b([^>]*)>/gi)) {
      const attrs = m[1];
      if (!/\bwidth\s*=/i.test(attrs) || !/\bheight\s*=/i.test(attrs)) {
        add(findings, sev("imageDimensions","info"), area.name, "Performance", file, lineAt(html,m.index), "Image lacks explicit width and/or height.", m[0], "Add intrinsic dimensions to reduce layout shift.");
      }
    }
  }
}

function aggregate(findings, groups) {
  for (const [area, items] of groups.templateIssues) {
    if (!items.length) continue;
    add(
      findings,
      sev("templateNotReplaced","high"),
      area,
      "Template",
      items[0].file,
      1,
      `${items.length} pages still use an unreplaced ${area} template title.`,
      items[0].title,
      `Fix the ${area} generator/template once instead of editing every page manually.`
    );
  }

  for (const [title, items] of groups.titles) {
    const byArea = new Map();
    for (const item of items) {
      if (!byArea.has(item.area)) byArea.set(item.area, []);
      byArea.get(item.area).push(item);
    }
    for (const [area, list] of byArea) {
      const limit = CONFIG.collectionRules?.[area]?.maxDuplicateGroup ?? 3;
      if (list.length <= limit) continue;
      if (templateMarker(area, title)) continue;
      add(
        findings,
        sev("duplicateTitle","medium"),
        area,
        "Duplicate Content",
        list[0].file,
        1,
        `${list.length} pages in ${area} share the same title.`,
        title,
        `Review the ${area} template or generator.`
      );
    }
  }

  for (const [description, items] of groups.descriptions) {
    const byArea = new Map();
    for (const item of items) {
      if (!byArea.has(item.area)) byArea.set(item.area, []);
      byArea.get(item.area).push(item);
    }
    for (const [area, list] of byArea) {
      const limit = CONFIG.collectionRules?.[area]?.maxDuplicateGroup ?? 3;
      if (list.length <= limit) continue;
      add(
        findings,
        sev("duplicateDescription","low"),
        area,
        "Duplicate Content",
        list[0].file,
        1,
        `${list.length} pages in ${area} share the same description.`,
        description,
        `Review the ${area} template or generator.`
      );
    }
  }
}

function globalChecks(findings) {
  const sitemap = path.join(ROOT, "sitemap.xml");
  const robots = path.join(ROOT, "robots.txt");
  if (!fs.existsSync(sitemap)) add(findings, sev("missingSitemap","high"), "global", "Sitemap", sitemap, 1, "sitemap.xml is missing.", "", "Create a production sitemap.");
  if (!fs.existsSync(robots)) add(findings, sev("missingRobots","medium"), "global", "Robots", robots, 1, "robots.txt is missing.", "", "Create robots.txt and reference the sitemap.");
}

function dedupe(findings) {
  const seen = new Set();
  return findings.filter(f => {
    const k = [f.priority,f.area,f.category,f.file,f.line,f.message,f.value].join("|");
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function render(payload) {
  const {summary, findings} = payload;
  const areas = [...new Set(findings.map(f=>f.area))].sort();
  const categories = [...new Set(findings.map(f=>f.category))].sort();

  const rows = findings.map(f => `
<tr data-priority="${esc(f.priority)}" data-area="${esc(f.area)}" data-category="${esc(f.category)}">
<td><span class="badge ${esc(f.priority)}">${esc(f.priority)}</span></td>
<td>${esc(f.area)}</td>
<td>${esc(f.category)}</td>
<td><code>${esc(f.file)}</code></td>
<td>${f.line}</td>
<td><strong>${esc(f.message)}</strong>${f.value ? `<div class="value">${esc(f.value)}</div>`:""}${f.recommendation ? `<div class="rec">${esc(f.recommendation)}</div>`:""}</td>
</tr>`).join("");

  const areaCards = Object.entries(summary.areas).map(([name,count])=>`
<div class="card"><div class="number">${count}</div><div class="label">${esc(name)} pages</div></div>`).join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WebAct Enterprise Auditor v4</title>
<style>
:root{--navy:#071b33;--blue:#1377ff;--bg:#f4f7fb;--card:#fff;--line:#dbe5ef;--text:#17283d;--muted:#66788e}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,Arial,sans-serif}
header{background:linear-gradient(135deg,#071b33,#0e5aa6);color:#fff;padding:42px 24px}.wrap{max-width:1500px;margin:auto}
h1{font-size:clamp(34px,5vw,62px);margin:8px 0}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-weight:800;font-size:12px;opacity:.8}
.cards{display:grid;grid-template-columns:repeat(7,minmax(130px,1fr));gap:14px;margin:-24px auto 28px;padding:0 24px}
.card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:0 10px 26px rgba(15,40,75,.08)}
.number{font-size:30px;font-weight:900}.label{font-size:13px;color:var(--muted)}
main{padding:0 24px 50px}.panel{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden}
.controls{display:flex;gap:12px;flex-wrap:wrap;padding:18px;border-bottom:1px solid var(--line)}
input,select{padding:11px 12px;border:1px solid var(--line);border-radius:10px;font:inherit;min-width:200px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--line);vertical-align:top}
th{position:sticky;top:0;background:#f8fbff}.badge{padding:4px 9px;border-radius:999px;font-size:11px;font-weight:900;text-transform:uppercase}
.badge.critical{background:#fde8e8;color:#a80000}.badge.high{background:#fff0e0;color:#a64b00}.badge.medium{background:#fff8d7;color:#7c6500}.badge.low{background:#eaf4ff;color:#165c94}.badge.info{background:#edf0f4;color:#4c5b6b}
.value{margin-top:6px;color:var(--muted);word-break:break-all}.rec{margin-top:7px;color:#255b36;font-weight:600}
.area-grid{padding:0 24px 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.area-grid .card{box-shadow:none}
@media(max-width:1000px){.cards{grid-template-columns:repeat(2,1fr)}table{display:block;overflow:auto}}
</style></head><body>
<header><div class="wrap"><div class="eyebrow">WebAct Development Tools</div><h1>Enterprise Site Auditor v4</h1><p>Project-aware audit generated ${esc(summary.generatedAt)}. Findings are grouped by Website, Industries, Portfolio, Knowledge Base, App Store, and Blog instead of treating every HTML file the same.</p></div></header>
<section class="cards wrap">
<div class="card"><div class="number">${summary.productionPages}</div><div class="label">Production pages</div></div>
<div class="card"><div class="number">${summary.referencesChecked}</div><div class="label">References checked</div></div>
<div class="card"><div class="number">${summary.findings}</div><div class="label">Actionable findings</div></div>
<div class="card"><div class="number">${summary.critical}</div><div class="label">Critical</div></div>
<div class="card"><div class="number">${summary.high}</div><div class="label">High</div></div>
<div class="card"><div class="number">${summary.medium}</div><div class="label">Medium</div></div>
<div class="card"><div class="number">${summary.low + summary.info}</div><div class="label">Low + info</div></div>
</section>
<section class="area-grid wrap">${areaCards}</section>
<main class="wrap"><div class="panel"><div class="controls">
<input id="search" type="search" placeholder="Search findings">
<select id="priority"><option value="">All priorities</option><option>critical</option><option>high</option><option>medium</option><option>low</option><option>info</option></select>
<select id="area"><option value="">All areas</option>${areas.map(a=>`<option>${esc(a)}</option>`).join("")}</select>
<select id="category"><option value="">All categories</option>${categories.map(c=>`<option>${esc(c)}</option>`).join("")}</select>
</div>
${findings.length ? `<table><thead><tr><th>Priority</th><th>Area</th><th>Category</th><th>File</th><th>Line</th><th>Finding and action</th></tr></thead><tbody id="results">${rows}</tbody></table>` : `<div style="padding:40px;text-align:center"><h2>No production findings</h2></div>`}
</div></main>
<script>
const s=document.getElementById("search"),p=document.getElementById("priority"),a=document.getElementById("area"),c=document.getElementById("category");
function filter(){const q=(s.value||"").toLowerCase();document.querySelectorAll("#results tr").forEach(r=>{r.hidden=!((!q||r.textContent.toLowerCase().includes(q))&&(!p.value||r.dataset.priority===p.value)&&(!a.value||r.dataset.area===a.value)&&(!c.value||r.dataset.category===c.value));});}
[s,p,a,c].forEach(x=>x&&x.addEventListener("input",filter));
</script></body></html>`;
}

function main() {
  fs.mkdirSync(REPORT_DIR, {recursive:true});
  const pages = walk(ROOT).filter(f => /\.html?$/i.test(f));
  const findings = [];
  const groups = {titles:new Map(), descriptions:new Map(), templateIssues:new Map()};
  const stats = {references:0, areas:{}};

  for (const file of pages) auditPage(file, read(file), findings, groups, stats);
  aggregate(findings, groups);
  globalChecks(findings);

  const clean = dedupe(findings).sort((a,b)=>
    ORDER[a.priority]-ORDER[b.priority] ||
    a.area.localeCompare(b.area) ||
    a.category.localeCompare(b.category) ||
    a.file.localeCompare(b.file) ||
    a.line-b.line
  );

  const summary = {
    generatedAt:new Date().toISOString(),
    productionPages:pages.length,
    referencesChecked:stats.references,
    findings:clean.length,
    areas:stats.areas,
    critical:clean.filter(f=>f.priority==="critical").length,
    high:clean.filter(f=>f.priority==="high").length,
    medium:clean.filter(f=>f.priority==="medium").length,
    low:clean.filter(f=>f.priority==="low").length,
    info:clean.filter(f=>f.priority==="info").length
  };

  const payload = {summary, findings:clean};
  fs.writeFileSync(JSON_REPORT, JSON.stringify(payload,null,2), "utf8");
  fs.writeFileSync(HTML_REPORT, render(payload), "utf8");
  fs.writeFileSync(CSV_REPORT, [
    ["Priority","Area","Category","File","Line","Message","Value","Recommendation"].map(csv).join(","),
    ...clean.map(f=>[f.priority,f.area,f.category,f.file,f.line,f.message,f.value,f.recommendation].map(csv).join(","))
  ].join("\n"), "utf8");

  console.log("");
  console.log("WebAct Enterprise Site Auditor v4");
  console.log("----------------------------------");
  console.log(`Production pages:   ${summary.productionPages}`);
  console.log(`References checked: ${summary.referencesChecked}`);
  console.log(`Actionable findings:${summary.findings}`);
  console.log(`Critical:           ${summary.critical}`);
  console.log(`High:               ${summary.high}`);
  console.log(`Medium:             ${summary.medium}`);
  console.log(`Low:                ${summary.low}`);
  console.log(`Info:               ${summary.info}`);
  console.log("");
  console.log(`HTML: ${HTML_REPORT}`);
  console.log(`JSON: ${JSON_REPORT}`);
  console.log(`CSV:  ${CSV_REPORT}`);

  process.exitCode = (CONFIG.failOn || []).some(level => clean.some(f=>f.priority===level)) ? 1 : 0;
}

main();
