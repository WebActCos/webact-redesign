#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());
const CONFIG_PATH = path.join(ROOT, "tools", "audit", "webact-auditor-v5.config.json");
const REPORT_DIR = path.join(ROOT, "tools", "audit", "reports", "v5");
const HTML_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v5.html");
const JSON_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v5.json");
const CSV_REPORT = path.join(REPORT_DIR, "webact-enterprise-audit-v5.csv");
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

const ORDER = {critical:0,high:1,medium:2,low:3,info:4};
const norm = v => String(v).replace(/\\/g,"/");
const rel = f => norm(path.relative(ROOT,f));
const read = f => { try { return fs.readFileSync(f,"utf8"); } catch { return ""; } };
const clean = v => String(v||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
const esc = v => String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const csv = v => `"${String(v??"").replace(/"/g,'""')}"`;
const lineAt = (t,i) => t.slice(0,i).split(/\r?\n/).length;
const severity = (k,d) => CONFIG.severity?.[k] || d;

function safeDecode(v) {
  try { return decodeURIComponent(v); } catch { return v; }
}

function excluded(file) {
  const r = rel(file).toLowerCase();
  if ((CONFIG.excludeFilePatterns||[]).some(p=>r.includes(p.toLowerCase()))) return true;
  return (CONFIG.excludeDirectories||[]).some(d=>{
    const x=norm(d).replace(/^\.?\//,"").replace(/\/$/,"").toLowerCase();
    return r===x || r.startsWith(x+"/");
  });
}

function walk(dir,out=[]) {
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    const f=path.join(dir,e.name);
    if (excluded(f)) continue;
    if (e.isDirectory()) walk(f,out); else out.push(f);
  }
  return out;
}

function areaFor(page) {
  for (const a of CONFIG.siteAreas||[]) {
    if ((a.patterns||[]).some(p=>new RegExp(p,"i").test(page))) return a;
  }
  return {name:"other",checks:{links:true,assets:true,seo:false,canonical:false,headings:false,layout:false,imageDimensions:false}};
}

function first(html,re) {
  const m=re.exec(html); return m ? m[1].trim() : "";
}

function external(ref) {
  return /^(?:https?:|mailto:|tel:|sms:|javascript:|data:|blob:|\/\/)/i.test(ref);
}

function dynamic(ref) {
  return (CONFIG.dynamicRoutePatterns||[]).some(p=>new RegExp(p,"i").test(ref));
}

function existingFile(candidate) {
  try { return fs.existsSync(candidate) && fs.statSync(candidate).isFile(); } catch { return false; }
}

function existingDirectory(candidate) {
  try { return fs.existsSync(candidate) && fs.statSync(candidate).isDirectory(); } catch { return false; }
}

function candidateFiles(target) {
  const out=[];
  const add=x=>{ if (!out.includes(x)) out.push(x); };
  add(target);

  if (existingDirectory(target)) add(path.join(target,"index.html"));

  const ext=path.extname(target);
  if (!ext) {
    add(path.join(target,"index.html"));
    add(target+".html");
  }
  return out;
}

function aliasRef(ref) {
  const key = ref.startsWith("/") ? ref : null;
  return key && CONFIG.routeAliases?.[key] ? CONFIG.routeAliases[key] : ref;
}

function resolveRef(source, raw, areaName) {
  let value = safeDecode(raw.trim());
  value = aliasRef(value);

  const withoutHash = value.split("#")[0];
  const withoutQuery = withoutHash.split("?")[0];

  if (!withoutQuery || withoutQuery === "." || withoutQuery === "./") {
    const index=path.join(path.dirname(source),"index.html");
    return {ignored:false,exists:existingFile(index),target:index};
  }
  if (withoutQuery.startsWith("#") || external(value)) return {ignored:true,exists:true};

  const bases=[];
  if (withoutQuery.startsWith("/")) {
    bases.push(path.join(ROOT,withoutQuery.replace(/^\/+/,"")));
  } else {
    bases.push(path.resolve(path.dirname(source),withoutQuery));
  }

  // Generated collections often contain references authored from their collection root.
  if (!withoutQuery.startsWith("/")) {
    const areaRoots = {
      portfolio:path.join(ROOT,"about","portfolio"),
      industries:path.join(ROOT,"industries"),
      "knowledge-base":path.join(ROOT,"about","website-knowledge-base"),
      "app-store":path.join(ROOT,"addons","website-app-store"),
      blog:path.join(ROOT,"about","blog")
    };
    if (areaRoots[areaName]) bases.push(path.resolve(areaRoots[areaName],withoutQuery));
    bases.push(path.resolve(ROOT,withoutQuery));
  }

  for (const b of bases) {
    for (const c of candidateFiles(b)) {
      if (existingFile(c)) return {ignored:false,exists:true,target:c};
    }
  }

  return {ignored:false,exists:false,target:bases[0]};
}

function hasSignal(html,type) {
  const lower=html.toLowerCase();
  return (CONFIG.sharedSignals?.[type]||[]).some(s=>lower.includes(s.toLowerCase()));
}

function add(raw,priority,area,category,file,line,message,value="",recommendation="",signature="") {
  raw.push({priority,area,category,file:rel(file),line,message,value,recommendation,signature:signature||`${area}|${category}|${message}|${value}`});
}

function marker(area,title) {
  return (CONFIG.templateMarkers?.[area]||[]).some(m=>clean(m)===clean(title));
}

function auditPage(file,html,raw,groups,stats) {
  const page=rel(file);
  const area=areaFor(page);
  const checks=area.checks||{};
  stats.areas[area.name]=(stats.areas[area.name]||0)+1;

  const title=clean(first(html,/<title[^>]*>([\s\S]*?)<\/title>/i));
  const description =
    first(html,/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i) ||
    first(html,/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
  const canonical =
    first(html,/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i) ||
    first(html,/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
  const h1=(html.match(/<h1\b/gi)||[]).length;

  if (checks.seo) {
    if (!title) add(raw,severity("missingTitle","high"),area.name,"SEO",file,1,"Missing page title.","","Add a unique title.");
    if (!description) add(raw,severity("missingDescription","medium"),area.name,"SEO",file,1,"Missing meta description.","","Add a useful description.");
  }

  if (title) {
    if (!groups.titles.has(title)) groups.titles.set(title,[]);
    groups.titles.get(title).push({file,area:area.name});
    if (marker(area.name,title)) {
      if (!groups.template.has(area.name)) groups.template.set(area.name,[]);
      groups.template.get(area.name).push({file,title});
    }
  }

  if (description) {
    if (!groups.descriptions.has(description)) groups.descriptions.set(description,[]);
    groups.descriptions.get(description).push({file,area:area.name});
  }

  if (checks.canonical && !canonical) {
    add(raw,severity("missingCanonical","medium"),area.name,"Canonical",file,1,"Missing canonical URL.","","Add a self-referencing canonical URL.",`${area.name}|Canonical|Missing canonical URL`);
  }

  if (checks.headings) {
    if (h1===0) add(raw,severity("missingH1","high"),area.name,"SEO",file,1,"Missing H1.","","Add one descriptive H1.");
    if (h1>1) add(raw,severity("multipleH1","medium"),area.name,"SEO",file,1,`Multiple H1 elements found (${h1}).`,"","Keep one primary H1.");
  }

  if (checks.layout) {
    if (!hasSignal(html,"header")) add(raw,severity("missingHeader","medium"),area.name,"Layout",file,1,"Shared header signal not detected.","","Confirm the collection template loads the shared header.",`${area.name}|Layout|header`);
    if (!hasSignal(html,"footer")) add(raw,severity("missingFooter","medium"),area.name,"Layout",file,1,"Shared footer signal not detected.","","Confirm the collection template loads the shared footer.",`${area.name}|Layout|footer`);
  }

  for (const m of html.matchAll(/<(?<tag>a|img|script|link|source|iframe)\b(?<attrs>[^>]*)>/gi)) {
    const tag=m.groups.tag.toLowerCase();
    const attrs=m.groups.attrs;
    const attr=(tag==="a"||tag==="link")?"href":"src";
    const am=attrs.match(new RegExp(`\\b${attr}\\s*=\\s*["']([^"']*)["']`,"i"));
    if (!am) continue;
    const value=am[1].trim();
    if (!value || dynamic(value)) continue;

    stats.references++;
    const result=resolveRef(file,value,area.name);
    if (result.ignored || result.exists) continue;

    const isAsset=["img","script","source","iframe"].includes(tag) || (tag==="link" && /\brel=["']stylesheet["']/i.test(attrs));
    if ((isAsset&&checks.assets)||(!isAsset&&checks.links)) {
      const key=isAsset?"missingAsset":"brokenInternalLink";
      add(
        raw,severity(key,"critical"),area.name,isAsset?"Assets":"Links",file,lineAt(html,m.index),
        isAsset?"Missing internal asset.":"Broken internal link.",value,
        isAsset?"Restore the asset or update the reference.":"Update or remove the link.",
        `${area.name}|${isAsset?"Assets":"Links"}|${value}`
      );
    }
  }

  if (checks.imageDimensions) {
    for (const m of html.matchAll(/<img\b([^>]*)>/gi)) {
      const attrs=m[1];
      if (!/\bwidth\s*=/i.test(attrs)||!/\bheight\s*=/i.test(attrs)) {
        add(raw,severity("imageDimensions","info"),area.name,"Performance",file,lineAt(html,m.index),
          "Image lacks explicit width and/or height.",m[0],"Add intrinsic dimensions to reduce layout shift.",
          `${area.name}|Performance|Image dimensions`);
      }
    }
  }
}

function aggregateTemplates(raw,groups) {
  for (const [area,items] of groups.template) {
    if (!items.length) continue;
    add(raw,severity("templateNotReplaced","high"),area,"Template",items[0].file,1,
      `${items.length} pages still use an unreplaced ${area} template title.`,
      items[0].title,`Fix the ${area} generator/template once.`,`${area}|Template|unreplaced`);
  }

  function duplicateGroups(map,category,priority) {
    for (const [value,items] of map) {
      const byArea=new Map();
      for (const i of items) {
        if (!byArea.has(i.area)) byArea.set(i.area,[]);
        byArea.get(i.area).push(i);
      }
      for (const [area,list] of byArea) {
        if (list.length<4 || marker(area,value)) continue;
        add(raw,priority,area,category,list[0].file,1,
          `${list.length} pages in ${area} share the same ${category==="Duplicate Titles"?"title":"description"}.`,
          value,`Review the ${area} template or generator.`,`${area}|${category}|${value}`);
      }
    }
  }
  duplicateGroups(groups.titles,"Duplicate Titles",severity("duplicateTitle","medium"));
  duplicateGroups(groups.descriptions,"Duplicate Descriptions",severity("duplicateDescription","low"));
}

function globalChecks(raw) {
  const sitemap=path.join(ROOT,"sitemap.xml");
  const robots=path.join(ROOT,"robots.txt");
  if (!existingFile(sitemap)) add(raw,severity("missingSitemap","high"),"global","Sitemap",sitemap,1,"sitemap.xml is missing.","","Create a production sitemap.");
  if (!existingFile(robots)) add(raw,severity("missingRobots","medium"),"global","Robots",robots,1,"robots.txt is missing.","","Create robots.txt and reference the sitemap.");
}

function condense(raw) {
  const threshold=CONFIG.aggregateThreshold||4;
  const sampleLimit=CONFIG.sampleLimit||8;
  const groups=new Map();

  for (const f of raw) {
    const key=[f.priority,f.signature].join("|");
    if (!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(f);
  }

  const out=[];
  for (const items of groups.values()) {
    if (items.length < threshold) {
      out.push(...items);
      continue;
    }

    const first=items[0];
    const files=[...new Set(items.map(x=>x.file))];
    const values=[...new Set(items.map(x=>x.value).filter(Boolean))];

    out.push({
      priority:first.priority,
      area:first.area,
      category:first.category,
      file:files[0],
      line:first.line,
      message:`${items.length} related findings: ${first.message}`,
      value: values.length===1 ? values[0] : "",
      recommendation:first.recommendation,
      count:items.length,
      samples:files.slice(0,sampleLimit),
      signature:first.signature
    });
  }

  const seen=new Set();
  return out.filter(f=>{
    const k=[f.priority,f.area,f.category,f.file,f.line,f.message,f.value].join("|");
    if (seen.has(k)) return false;
    seen.add(k); return true;
  }).sort((a,b)=>ORDER[a.priority]-ORDER[b.priority]||a.area.localeCompare(b.area)||a.category.localeCompare(b.category)||a.file.localeCompare(b.file));
}

function render(payload) {
  const {summary,findings}=payload;
  const areas=[...new Set(findings.map(f=>f.area))].sort();
  const categories=[...new Set(findings.map(f=>f.category))].sort();
  const rows=findings.map(f=>`
<tr data-priority="${esc(f.priority)}" data-area="${esc(f.area)}" data-category="${esc(f.category)}">
<td><span class="badge ${esc(f.priority)}">${esc(f.priority)}</span></td>
<td>${esc(f.area)}</td><td>${esc(f.category)}</td>
<td><code>${esc(f.file)}</code></td><td>${f.line}</td>
<td><strong>${esc(f.message)}</strong>
${f.value?`<div class="value">${esc(f.value)}</div>`:""}
${f.samples?.length?`<details><summary>Sample files</summary><ul>${f.samples.map(x=>`<li><code>${esc(x)}</code></li>`).join("")}</ul></details>`:""}
${f.recommendation?`<div class="rec">${esc(f.recommendation)}</div>`:""}</td></tr>`).join("");

  const areaCards=Object.entries(summary.areas).map(([n,c])=>`<div class="card"><div class="number">${c}</div><div class="label">${esc(n)} pages</div></div>`).join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WebAct Enterprise Auditor v5</title>
<style>
:root{--navy:#071b33;--blue:#1377ff;--bg:#f4f7fb;--line:#dbe5ef;--text:#17283d;--muted:#66788e}
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
details{margin-top:8px}summary{cursor:pointer;font-weight:700}li{margin:4px 0}
@media(max-width:1000px){.cards{grid-template-columns:repeat(2,1fr)}table{display:block;overflow:auto}}
</style></head><body>
<header><div class="wrap"><div class="eyebrow">Final Auditor Before Issue Remediation</div><h1>Enterprise Site Auditor v5</h1>
<p>Project-aware, route-aware, collection-aware audit generated ${esc(summary.generatedAt)}. Repeated template findings are condensed into actionable groups.</p></div></header>
<section class="cards wrap">
<div class="card"><div class="number">${summary.productionPages}</div><div class="label">Production pages</div></div>
<div class="card"><div class="number">${summary.referencesChecked}</div><div class="label">References checked</div></div>
<div class="card"><div class="number">${summary.findings}</div><div class="label">Actionable groups</div></div>
<div class="card"><div class="number">${summary.critical}</div><div class="label">Critical</div></div>
<div class="card"><div class="number">${summary.high}</div><div class="label">High</div></div>
<div class="card"><div class="number">${summary.medium}</div><div class="label">Medium</div></div>
<div class="card"><div class="number">${summary.low+summary.info}</div><div class="label">Low + info</div></div>
</section>
<section class="area-grid wrap">${areaCards}</section>
<main class="wrap"><div class="panel"><div class="controls">
<input id="search" type="search" placeholder="Search findings">
<select id="priority"><option value="">All priorities</option><option>critical</option><option>high</option><option>medium</option><option>low</option><option>info</option></select>
<select id="area"><option value="">All areas</option>${areas.map(a=>`<option>${esc(a)}</option>`).join("")}</select>
<select id="category"><option value="">All categories</option>${categories.map(c=>`<option>${esc(c)}</option>`).join("")}</select>
</div>${findings.length?`<table><thead><tr><th>Priority</th><th>Area</th><th>Category</th><th>Representative file</th><th>Line</th><th>Finding and action</th></tr></thead><tbody id="results">${rows}</tbody></table>`:`<div style="padding:40px;text-align:center"><h2>No production findings</h2></div>`}
</div></main>
<script>
const s=document.getElementById("search"),p=document.getElementById("priority"),a=document.getElementById("area"),c=document.getElementById("category");
function filter(){const q=(s.value||"").toLowerCase();document.querySelectorAll("#results tr").forEach(r=>{r.hidden=!((!q||r.textContent.toLowerCase().includes(q))&&(!p.value||r.dataset.priority===p.value)&&(!a.value||r.dataset.area===a.value)&&(!c.value||r.dataset.category===c.value));});}
[s,p,a,c].forEach(x=>x&&x.addEventListener("input",filter));
</script></body></html>`;
}

function main() {
  fs.mkdirSync(REPORT_DIR,{recursive:true});
  const pages=walk(ROOT).filter(f=>/\.html?$/i.test(f));
  const raw=[];
  const groups={titles:new Map(),descriptions:new Map(),template:new Map()};
  const stats={references:0,areas:{}};

  for (const file of pages) auditPage(file,read(file),raw,groups,stats);
  aggregateTemplates(raw,groups);
  globalChecks(raw);

  const findings=condense(raw);
  const summary={
    generatedAt:new Date().toISOString(),
    productionPages:pages.length,
    referencesChecked:stats.references,
    rawFindings:raw.length,
    findings:findings.length,
    areas:stats.areas,
    critical:findings.filter(f=>f.priority==="critical").length,
    high:findings.filter(f=>f.priority==="high").length,
    medium:findings.filter(f=>f.priority==="medium").length,
    low:findings.filter(f=>f.priority==="low").length,
    info:findings.filter(f=>f.priority==="info").length
  };

  const payload={summary,findings};
  fs.writeFileSync(JSON_REPORT,JSON.stringify(payload,null,2),"utf8");
  fs.writeFileSync(HTML_REPORT,render(payload),"utf8");
  fs.writeFileSync(CSV_REPORT,[
    ["Priority","Area","Category","Representative File","Line","Message","Value","Recommendation","Count","Samples"].map(csv).join(","),
    ...findings.map(f=>[f.priority,f.area,f.category,f.file,f.line,f.message,f.value,f.recommendation,f.count||1,(f.samples||[]).join(" | ")].map(csv).join(","))
  ].join("\n"),"utf8");

  console.log("");
  console.log("WebAct Enterprise Site Auditor v5");
  console.log("----------------------------------");
  console.log(`Production pages:    ${summary.productionPages}`);
  console.log(`References checked:  ${summary.referencesChecked}`);
  console.log(`Raw findings:        ${summary.rawFindings}`);
  console.log(`Actionable groups:   ${summary.findings}`);
  console.log(`Critical:            ${summary.critical}`);
  console.log(`High:                ${summary.high}`);
  console.log(`Medium:              ${summary.medium}`);
  console.log(`Low:                 ${summary.low}`);
  console.log(`Info:                ${summary.info}`);
  console.log("");
  console.log(`HTML: ${HTML_REPORT}`);
  console.log(`JSON: ${JSON_REPORT}`);
  console.log(`CSV:  ${CSV_REPORT}`);

  process.exitCode=(CONFIG.failOn||[]).some(level=>findings.some(f=>f.priority===level))?1:0;
}
main();
