#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());
const CONFIG_PATH = path.join(ROOT, "tools", "audit", "webact-auditor-v3.config.json");
const REPORT_DIR = path.join(ROOT, "tools", "audit", "reports", "v3");
const HTML_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v3.html");
const JSON_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v3.json");
const CSV_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v3.csv");

const ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`Missing config: ${CONFIG_PATH}`);
    process.exit(2);
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch (error) {
    console.error(`Could not parse config: ${error.message}`);
    process.exit(2);
  }
}

const CONFIG = loadConfig();

function norm(v) { return String(v).replace(/\\/g, "/"); }
function rel(file) { return norm(path.relative(ROOT, file)); }
function read(file) { try { return fs.readFileSync(file, "utf8"); } catch { return ""; } }
function lineAt(text, index) { return text.slice(0, index).split(/\r?\n/).length; }
function textOnly(v) { return String(v || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function esc(v) { return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function csv(v) { return `"${String(v ?? "").replace(/"/g,'""')}"`; }
function sev(key, fallback) { return CONFIG.severity?.[key] || fallback; }

function excluded(filePath) {
  const r = rel(filePath).toLowerCase();
  const base = path.basename(filePath).toLowerCase();

  if ((CONFIG.excludeFiles || []).map(x => x.toLowerCase()).includes(base)) return true;
  if ((CONFIG.excludeFilePatterns || []).some(x => r.includes(x.toLowerCase()))) return true;

  return (CONFIG.excludeDirectories || []).some(dir => {
    const d = norm(dir).replace(/^\.?\//, "").replace(/\/$/, "").toLowerCase();
    return r === d || r.startsWith(d + "/");
  });
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (excluded(full)) continue;
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function isProductionHtml(file) {
  if (!(CONFIG.includeExtensions || []).includes(path.extname(file).toLowerCase())) return false;
  const r = rel(file);
  if ((CONFIG.excludeProductionPatterns || []).some(p => r.toLowerCase().includes(p.toLowerCase()))) return false;
  if (r.includes("/includes/") || r.includes("/templates/")) return false;
  return true;
}

function sectionFor(page) {
  for (const section of CONFIG.sections || []) {
    if ((section.patterns || []).some(p => new RegExp(p, "i").test(page))) {
      return { name: section.name, rules: { ...CONFIG.defaultSectionRules, ...section.rules } };
    }
  }
  return { name: "default", rules: { ...CONFIG.defaultSectionRules } };
}

function add(findings, priority, category, file, line, message, value = "", recommendation = "", section = "") {
  findings.push({
    priority, category, file: rel(file), line, message, value, recommendation, section
  });
}

function first(text, regex) {
  const m = regex.exec(text);
  return m ? m[1].trim() : "";
}

function external(ref) {
  return /^(?:https?:|mailto:|tel:|sms:|javascript:|data:|blob:|\/\/)/i.test(ref);
}

function stripQueryHash(ref) {
  return ref.replace(/[?#].*$/, "");
}

function looksDynamic(value, tagHtml = "") {
  const combined = `${value} ${tagHtml}`;
  if ((CONFIG.dynamicAttributePatterns || []).some(p => combined.toLowerCase().includes(p.toLowerCase()))) return true;
  return (CONFIG.dynamicExpressionPatterns || []).some(p => new RegExp(p, "i").test(combined));
}

function aliasTarget(ref) {
  const clean = stripQueryHash(ref);
  return CONFIG.knownRouteAliases?.[clean] || null;
}

function dynamicQueryRoute(ref) {
  return (CONFIG.dynamicQueryRoutePatterns || []).some(p => new RegExp(p, "i").test(ref));
}

function resolveRef(sourceFile, ref, rules) {
  const original = ref.trim();
  if (!original || original.startsWith("#") || external(original)) {
    return { ignored: true, exists: true, target: null };
  }

  const alias = aliasTarget(original);
  if (alias) return resolveRef(sourceFile, alias, rules);

  if (rules.allowDynamicQueryRoutes && dynamicQueryRoute(original)) {
    const base = stripQueryHash(original);
    const baseResolved = resolveRef(sourceFile, base, { ...rules, allowDynamicQueryRoutes: false });
    return baseResolved.exists
      ? { ignored: false, exists: true, target: baseResolved.target, dynamicRoute: true }
      : baseResolved;
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

  const found = candidates.find(c => {
    try { return fs.existsSync(c) && fs.statSync(c).isFile(); }
    catch { return false; }
  });

  return { ignored: false, exists: Boolean(found), target: found || target };
}

function hasShared(html, type) {
  const direct = type === "header" ? /<header\b/i.test(html) : /<footer\b/i.test(html);
  if (direct) return true;
  return (CONFIG.sharedComponentSignals?.[type] || [])
    .some(signal => html.toLowerCase().includes(signal.toLowerCase()));
}

function parseSitemap() {
  const file = path.join(ROOT, "sitemap.xml");
  const urls = new Set();
  if (!fs.existsSync(file)) return { file, urls };
  const text = read(file);
  for (const m of text.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
    try {
      const u = new URL(m[1].trim());
      let p = u.pathname.replace(/^\/+/, "");
      if (!p || p.endsWith("/")) p += "index.html";
      urls.add(p);
    } catch {}
  }
  return { file, urls };
}

function auditPage(file, html, findings, graph, maps, counters, sitemapUrls) {
  const page = rel(file);
  const section = sectionFor(page);
  const rules = section.rules;
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

  if (!title) add(findings, sev("missingTitle","high"), "SEO", file, 1, "Missing page title.", "", "Add a unique, descriptive <title>.", section.name);
  else {
    if (!maps.titles.has(title)) maps.titles.set(title, []);
    maps.titles.get(title).push({ page, section: section.name, file });
    if (rules.strictSeo && (title.length < 20 || title.length > 65)) {
      add(findings, "low", "SEO", file, 1, `Title length is ${title.length} characters.`, title, "Keep most titles near 20–65 characters.", section.name);
    }
  }

  if (!description) {
    add(findings, sev("missingDescription","medium"), "SEO", file, 1, "Missing meta description.", "", "Add a useful meta description.", section.name);
  } else {
    if (!maps.descriptions.has(description)) maps.descriptions.set(description, []);
    maps.descriptions.get(description).push({ page, section: section.name, file });
    if (rules.strictSeo && (description.length < 70 || description.length > 170)) {
      add(findings, "low", "SEO", file, 1, `Meta description length is ${description.length} characters.`, description, "Keep most descriptions near 70–170 characters.", section.name);
    }
  }

  if (rules.requireCanonical && !canonical) {
    add(findings, sev("missingCanonical","medium"), "Canonical", file, 1, "Missing canonical URL.", "", "Add a self-referencing canonical URL.", section.name);
  } else if (canonical) {
    if (!maps.canonicals.has(canonical)) maps.canonicals.set(canonical, []);
    maps.canonicals.get(canonical).push({ page, section: section.name, file });

    if (/\/webact-redesign\//i.test(canonical)) {
      add(findings, sev("oldDevelopmentPath","critical"), "URLs", file, 1, "Canonical contains the development path.", canonical, "Remove /webact-redesign/.", section.name);
    }
    if (/\/index\.html(?:[?#]|$)/i.test(canonical)) {
      add(findings, sev("explicitIndexUrl","high"), "URLs", file, 1, "Canonical exposes index.html.", canonical, "Use the clean directory URL.", section.name);
    }
  }

  if (h1Count === 0) add(findings, sev("missingH1","high"), "SEO", file, 1, "Missing H1.", "", "Add one descriptive H1.", section.name);
  if (h1Count > 1) add(findings, sev("multipleH1","medium"), "SEO", file, 1, `Multiple H1 elements found (${h1Count}).`, "", "Keep one primary H1.", section.name);
  if (!hasViewport) add(findings, sev("missingViewport","high"), "Mobile", file, 1, "Missing viewport meta tag.", "", "Add width=device-width, initial-scale=1.", section.name);
  if (!hasLang) add(findings, sev("missingLang","medium"), "Accessibility", file, 1, "Missing html lang attribute.", "", "Add lang=\"en\".", section.name);
  if (!hasMain) add(findings, "low", "Accessibility", file, 1, "Missing <main> landmark.", "", "Wrap primary content in <main>.", section.name);

  if (rules.requireSharedComponents) {
    if (!hasShared(html, "header")) add(findings, sev("missingHeader","medium"), "Consistency", file, 1, "Shared header signal not detected.", "", "Use the shared header component or add an auditor signal.", section.name);
    if (!hasShared(html, "footer")) add(findings, sev("missingFooter","medium"), "Consistency", file, 1, "Shared footer signal not detected.", "", "Use the shared footer component or add an auditor signal.", section.name);
  }

  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1].trim()); }
    catch (error) {
      add(findings, sev("invalidJsonLd","high"), "Schema", file, lineAt(html, match.index), "Invalid JSON-LD.", error.message, "Correct the JSON syntax.", section.name);
    }
  }

  for (const match of html.matchAll(/<(?<tag>a|img|script|link|source|iframe)\b(?<attrs>[^>]*)>/gi)) {
    const tag = match.groups.tag.toLowerCase();
    const attrs = match.groups.attrs;
    const fullTag = match[0];
    const line = lineAt(html, match.index);
    const attrNames = tag === "a" || tag === "link" ? ["href"] : ["src"];
    if (tag === "source") attrNames.push("srcset");

    for (const attr of attrNames) {
      const attrMatch = attrs.match(new RegExp(`\\b${attr}\\s*=\\s*["']([^"']*)["']`, "i"));
      if (!attrMatch) continue;

      const value = attrMatch[1].trim();

      if (!value) {
        if (rules.allowDynamicMarkup && looksDynamic(fullTag, fullTag)) continue;
        const key = attr === "href" ? "emptyHref" : "emptySrc";
        add(
          findings,
          sev(key, attr === "href" ? "high" : "medium"),
          "Markup",
          file,
          line,
          `Empty ${attr} attribute.`,
          fullTag,
          attr === "href" ? "Remove the link or provide a valid destination." : "Provide a valid source or mark this as a dynamic placeholder.",
          section.name
        );
        continue;
      }

      if (rules.allowDynamicMarkup && looksDynamic(value, fullTag)) continue;

      counters.references++;

      if (/\/webact-redesign\//i.test(value)) {
        add(findings, sev("oldDevelopmentPath","critical"), "URLs", file, line, "Development base path remains.", value, "Remove /webact-redesign/.", section.name);
      }
      if (/(^|\/)index\.html(?:[?#]|$)/i.test(value)) {
        add(findings, sev("explicitIndexUrl","high"), "URLs", file, line, "Explicit index.html URL remains.", value, "Use the clean directory URL.", section.name);
      }

      const resolved = resolveRef(file, value, rules);
      if (resolved.exists) {
        counters.validReferences++;
        if (!resolved.ignored && resolved.target && (CONFIG.includeExtensions || []).includes(path.extname(resolved.target).toLowerCase())) {
          graph.get(page).add(rel(resolved.target));
        }
      } else {
        const asset = ["img","script","source","iframe"].includes(tag) || (tag === "link" && /\brel=["']stylesheet["']/i.test(attrs));
        add(
          findings,
          sev(asset ? "missingAsset" : "brokenInternalLink", "critical"),
          asset ? "Assets" : "Links",
          file,
          line,
          asset ? "Missing internal asset." : "Broken internal link.",
          value,
          asset ? "Restore the asset or update the reference." : "Update or remove the link.",
          section.name
        );
      }
    }
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = match[1];
    const line = lineAt(html, match.index);
    if (rules.allowDynamicMarkup && looksDynamic(match[0], match[0])) continue;
    if (!/\balt\s*=/i.test(attrs)) {
      add(findings, sev("missingAlt","medium"), "Accessibility", file, line, "Image is missing alt text.", match[0], "Add meaningful alt text or alt=\"\" for decorative images.", section.name);
    }
    if (!/\bwidth\s*=/i.test(attrs) || !/\bheight\s*=/i.test(attrs)) {
      add(findings, "info", "Performance", file, line, "Image lacks explicit width and/or height.", match[0], "Add intrinsic dimensions to reduce layout shift.", section.name);
    }
  }

  counters.sections[section.name] = (counters.sections[section.name] || 0) + 1;
  if (sitemapUrls.has(page)) counters.inSitemap++;
}

function finalizeDuplicates(findings, maps) {
  for (const [value, items] of maps.titles) {
    if (items.length > 1) {
      items.forEach(item => add(findings, sev("duplicateTitle","medium"), "Duplicate Content", item.file, 1, `Duplicate title used on ${items.length} production pages.`, value, "Make the title unique.", item.section));
    }
  }
  for (const [value, items] of maps.descriptions) {
    if (value && items.length > 1) {
      items.forEach(item => add(findings, sev("duplicateDescription","low"), "Duplicate Content", item.file, 1, `Duplicate description used on ${items.length} production pages.`, value, "Write a unique description.", item.section));
    }
  }
  for (const [value, items] of maps.canonicals) {
    if (value && items.length > 1) {
      items.forEach(item => add(findings, sev("duplicateCanonical","high"), "Canonical", item.file, 1, `Canonical shared by ${items.length} production pages.`, value, "Use a unique self-referencing canonical or consolidate duplicate pages.", item.section));
    }
  }
}

function findOrphans(findings, files, graph, sitemapUrls) {
  const home = files.find(file => rel(file) === "index.html");
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
    const page = rel(file);
    const section = sectionFor(page);
    if (!section.rules.checkOrphans) continue;

    if (!visited.has(page) && !sitemapUrls.has(page)) {
      add(findings, sev("orphanPage","medium"), "Architecture", file, 1, "Page is neither linked from the homepage graph nor listed in sitemap.xml.", "", "Add an internal link, add it to the sitemap, or intentionally exclude it.", section.name);
    }
  }
}

function validateGlobal(findings) {
  const sitemap = path.join(ROOT, "sitemap.xml");
  const robots = path.join(ROOT, "robots.txt");

  if (!fs.existsSync(sitemap)) {
    add(findings, sev("missingSitemap","high"), "Sitemap", sitemap, 1, "sitemap.xml is missing.", "", "Create a production sitemap.", "global");
  } else {
    const text = read(sitemap);
    if (/\/webact-redesign\//i.test(text)) add(findings, "critical", "Sitemap", sitemap, 1, "Sitemap contains /webact-redesign/.", "", "Remove development paths.", "global");
    if (/\/index\.html/i.test(text)) add(findings, "high", "Sitemap", sitemap, 1, "Sitemap contains index.html URLs.", "", "Use clean URLs.", "global");
  }

  if (!fs.existsSync(robots)) {
    add(findings, sev("missingRobots","medium"), "Robots", robots, 1, "robots.txt is missing.", "", "Create robots.txt and reference the sitemap.", "global");
  }
}

function uniqueFindings(findings) {
  const seen = new Set();
  return findings.filter(item => {
    const key = [item.priority,item.category,item.file,item.line,item.message,item.value].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function render(payload) {
  const { summary, findings } = payload;
  const categories = [...new Set(findings.map(x => x.category))].sort();
  const sections = [...new Set(findings.map(x => x.section))].sort();

  const rows = findings.map(x => `
<tr data-priority="${esc(x.priority)}" data-category="${esc(x.category)}" data-section="${esc(x.section)}">
<td><span class="badge ${esc(x.priority)}">${esc(x.priority)}</span></td>
<td>${esc(x.section)}</td>
<td>${esc(x.category)}</td>
<td><code>${esc(x.file)}</code></td>
<td>${x.line}</td>
<td><strong>${esc(x.message)}</strong>${x.value ? `<div class="value">${esc(x.value)}</div>` : ""}${x.recommendation ? `<div class="recommendation">${esc(x.recommendation)}</div>` : ""}</td>
</tr>`).join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WebAct Enterprise Auditor v3</title>
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
.value{margin-top:6px;color:var(--muted);word-break:break-all}.recommendation{margin-top:7px;color:#255b36;font-weight:600}
.summary-grid{padding:0 24px 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.summary-grid .card{box-shadow:none}
@media(max-width:1000px){.cards{grid-template-columns:repeat(2,1fr)}table{display:block;overflow:auto}}
</style></head>
<body>
<header><div class="wrap"><div class="eyebrow">WebAct Development Tools</div><h1>Enterprise Site Auditor v3</h1><p>Section-aware production audit generated ${esc(summary.generatedAt)}. Dynamic portfolio routes, JavaScript templates, knowledge-base collections, app-store pages, and sitemap-aware orphan logic are handled separately.</p></div></header>
<section class="cards wrap">
<div class="card"><div class="number">${summary.productionPages}</div><div class="label">Production pages</div></div>
<div class="card"><div class="number">${summary.referencesChecked}</div><div class="label">References checked</div></div>
<div class="card"><div class="number">${summary.inSitemap}</div><div class="label">Pages in sitemap</div></div>
<div class="card"><div class="number">${summary.critical}</div><div class="label">Critical</div></div>
<div class="card"><div class="number">${summary.high}</div><div class="label">High</div></div>
<div class="card"><div class="number">${summary.medium}</div><div class="label">Medium</div></div>
<div class="card"><div class="number">${summary.low + summary.info}</div><div class="label">Low + info</div></div>
</section>
<section class="summary-grid wrap">
${Object.entries(summary.sections).map(([k,v])=>`<div class="card"><div class="number">${v}</div><div class="label">${esc(k)} pages</div></div>`).join("")}
</section>
<main class="wrap"><div class="panel"><div class="controls">
<input id="search" type="search" placeholder="Search findings">
<select id="priority"><option value="">All priorities</option><option>critical</option><option>high</option><option>medium</option><option>low</option><option>info</option></select>
<select id="section"><option value="">All sections</option>${sections.map(s=>`<option>${esc(s)}</option>`).join("")}</select>
<select id="category"><option value="">All categories</option>${categories.map(c=>`<option>${esc(c)}</option>`).join("")}</select>
</div>
${findings.length ? `<table><thead><tr><th>Priority</th><th>Section</th><th>Category</th><th>File</th><th>Line</th><th>Finding and action</th></tr></thead><tbody id="results">${rows}</tbody></table>` : `<div style="padding:40px;text-align:center"><h2>No production findings</h2></div>`}
</div></main>
<script>
const s=document.getElementById("search"),p=document.getElementById("priority"),sec=document.getElementById("section"),c=document.getElementById("category");
function filter(){const q=(s.value||"").toLowerCase();document.querySelectorAll("#results tr").forEach(r=>{r.hidden=!((!q||r.textContent.toLowerCase().includes(q))&&(!p.value||r.dataset.priority===p.value)&&(!sec.value||r.dataset.section===sec.value)&&(!c.value||r.dataset.category===c.value));});}
[s,p,sec,c].forEach(x=>x&&x.addEventListener("input",filter));
</script></body></html>`;
}

function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const all = walk(ROOT);
  const pages = all.filter(isProductionHtml);
  const findings = [];
  const graph = new Map();
  const maps = { titles: new Map(), descriptions: new Map(), canonicals: new Map() };
  const counters = { references: 0, validReferences: 0, inSitemap: 0, sections: {} };
  const sitemap = parseSitemap();

  for (const file of pages) {
    auditPage(file, read(file), findings, graph, maps, counters, sitemap.urls);
  }

  finalizeDuplicates(findings, maps);
  findOrphans(findings, pages, graph, sitemap.urls);
  validateGlobal(findings);

  const clean = uniqueFindings(findings).sort((a,b) =>
    ORDER[a.priority] - ORDER[b.priority] ||
    a.section.localeCompare(b.section) ||
    a.category.localeCompare(b.category) ||
    a.file.localeCompare(b.file) ||
    a.line - b.line
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    productionPages: pages.length,
    referencesChecked: counters.references,
    validReferences: counters.validReferences,
    inSitemap: counters.inSitemap,
    sections: counters.sections,
    critical: clean.filter(x=>x.priority==="critical").length,
    high: clean.filter(x=>x.priority==="high").length,
    medium: clean.filter(x=>x.priority==="medium").length,
    low: clean.filter(x=>x.priority==="low").length,
    info: clean.filter(x=>x.priority==="info").length
  };

  const payload = { summary, findings: clean };
  fs.writeFileSync(JSON_REPORT, JSON.stringify(payload, null, 2), "utf8");
  fs.writeFileSync(HTML_REPORT, render(payload), "utf8");
  fs.writeFileSync(CSV_REPORT, [
    ["Priority","Section","Category","File","Line","Message","Value","Recommendation"].map(csv).join(","),
    ...clean.map(x => [x.priority,x.section,x.category,x.file,x.line,x.message,x.value,x.recommendation].map(csv).join(","))
  ].join("\n"), "utf8");

  console.log("");
  console.log("WebAct Enterprise Site Auditor v3");
  console.log("----------------------------------");
  console.log(`Production pages:   ${summary.productionPages}`);
  console.log(`References checked: ${summary.referencesChecked}`);
  console.log(`Pages in sitemap:   ${summary.inSitemap}`);
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

  process.exitCode = (CONFIG.failOn || []).some(level => clean.some(x => x.priority === level)) ? 1 : 0;
}

main();
