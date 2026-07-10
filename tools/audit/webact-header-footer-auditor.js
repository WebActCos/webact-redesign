#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || process.cwd());
const OUT = path.join(ROOT, "tools", "audit", "reports", "header-footer");
fs.mkdirSync(OUT, { recursive: true });

const HTML = path.join(OUT, "universal-header-footer-audit.html");
const JSONF = path.join(OUT, "universal-header-footer-audit.json");
const CSV = path.join(OUT, "universal-header-footer-audit.csv");

const excluded = new Set([".git","node_modules","vendor","dist","build","coverage","tools","pages","backups"]);
const norm = v => String(v).replace(/\\/g,"/");
const rel = f => norm(path.relative(ROOT,f));
const read = f => { try { return fs.readFileSync(f,"utf8"); } catch { return ""; } };
const esc = v => String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const csv = v => `"${String(v??"").replace(/"/g,'""')}"`;

function walk(dir,out=[]){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(excluded.has(e.name)) continue;
    const f=path.join(dir,e.name);
    if(e.isDirectory()) walk(f,out); else out.push(f);
  }
  return out;
}

function isExternal(v){ return /^(?:https?:|mailto:|tel:|sms:|javascript:|data:|blob:|\/\/)/i.test(v); }
function isDynamic(v){ return /\$\{[^}]+\}|{{|}}|<%|%>/.test(v); }
function decode(v){ try{return decodeURIComponent(v)}catch{return v} }

function resolve(source,href){
  if(!href || href.startsWith("#") || isExternal(href) || isDynamic(href)) return {ignored:true,exists:true};
  let clean=decode(href.replace(/[?#].*$/,""));
  if(!clean) return {ignored:true,exists:true};
  let target=clean.startsWith("/") ? path.join(ROOT,clean.replace(/^\/+/, "")) : path.resolve(path.dirname(source),clean);
  const candidates=[target];
  if(!path.extname(target)){ candidates.push(path.join(target,"index.html"),target+".html"); }
  try{ if(fs.existsSync(target)&&fs.statSync(target).isDirectory()) candidates.push(path.join(target,"index.html")); }catch{}
  const found=candidates.find(c=>{try{return fs.existsSync(c)&&fs.statSync(c).isFile()}catch{return false}});
  return {ignored:false,exists:Boolean(found),target:found||target};
}

function lineAt(t,i){ return t.slice(0,i).split(/\r?\n/).length; }

const files=walk(ROOT);
const htmlFiles=files.filter(f=>/\.html?$/i.test(f));
const sharedFiles=files.filter(f=>/(^|\/)(header|footer|navigation|nav|site-header|site-footer)\.(html?|js)$/i.test(rel(f)));

const findings=[];
const coverage=[];
let checked=0,valid=0,ignored=0;

function auditBlock(source,type,text,offset=0,full=text){
  for(const m of text.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']*)["'][^>]*>/gi)){
    const href=m[1].trim();
    const line=lineAt(full,offset+m.index);
    if(!href){
      findings.push({severity:"high",area:type,category:"Empty link",file:rel(source),line,href,message:"Empty href in "+type});
      continue;
    }
    const r=resolve(source,href);
    if(r.ignored){ignored++;continue}
    checked++;
    if(r.exists){valid++;continue}
    findings.push({severity:"critical",area:type,category:"Broken internal link",file:rel(source),line,href,expectedPath:rel(r.target),message:"Broken internal link in "+type});
  }
}

for(const file of htmlFiles){
  const t=read(file);
  let hasHeader=false,hasFooter=false;
  for(const m of t.matchAll(/<header\b[^>]*>[\s\S]*?<\/header>/gi)){hasHeader=true;auditBlock(file,"header",m[0],m.index,t)}
  for(const m of t.matchAll(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi)){hasFooter=true;auditBlock(file,"footer",m[0],m.index,t)}
  const low=t.toLowerCase();
  const headerSignal=["shared-header","site-header","header-placeholder","data-shared-header","header.js","navigation.js"].some(s=>low.includes(s));
  const footerSignal=["shared-footer","site-footer","footer-placeholder","data-shared-footer","footer.js"].some(s=>low.includes(s));
  coverage.push({file:rel(file),header:hasHeader||headerSignal,footer:hasFooter||footerSignal,headerMethod:hasHeader?"inline block":headerSignal?"shared signal":"not detected",footerMethod:hasFooter?"inline block":footerSignal?"shared signal":"not detected"});
}

for(const file of sharedFiles){
  const type=/footer/i.test(rel(file))?"footer":"header";
  auditBlock(file,type,read(file));
}

findings.sort((a,b)=>a.area.localeCompare(b.area)||a.file.localeCompare(b.file)||a.line-b.line);

const summary={
  generatedAt:new Date().toISOString(),
  htmlPagesChecked:htmlFiles.length,
  sharedFilesFound:sharedFiles.length,
  internalLinksChecked:checked,
  validInternalLinks:valid,
  ignoredLinks:ignored,
  brokenLinks:findings.filter(x=>x.severity==="critical").length,
  emptyLinks:findings.filter(x=>x.severity==="high").length,
  missingHeaderPages:coverage.filter(x=>!x.header).length,
  missingFooterPages:coverage.filter(x=>!x.footer).length,
  totalFindings:findings.length
};

fs.writeFileSync(JSONF,JSON.stringify({summary,sharedFiles:sharedFiles.map(rel),findings,coverage},null,2),"utf8");
fs.writeFileSync(CSV,[["Severity","Area","Category","File","Line","Href","Expected Path"].map(csv).join(","),...findings.map(x=>[x.severity,x.area,x.category,x.file,x.line,x.href,x.expectedPath||""].map(csv).join(","))].join("\n"),"utf8");

const rows=findings.map(x=>`<tr><td>${esc(x.severity)}</td><td>${esc(x.area)}</td><td>${esc(x.category)}</td><td><code>${esc(x.file)}</code></td><td>${x.line}</td><td><code>${esc(x.href)}</code></td><td><code>${esc(x.expectedPath||"")}</code></td></tr>`).join("");
const missingRows=coverage.filter(x=>!x.header||!x.footer).map(x=>`<tr><td><code>${esc(x.file)}</code></td><td>${x.header?"Detected":"Not detected"}</td><td>${esc(x.headerMethod)}</td><td>${x.footer?"Detected":"Not detected"}</td><td>${esc(x.footerMethod)}</td></tr>`).join("");
const sharedList=sharedFiles.length?sharedFiles.map(f=>`<li><code>${esc(rel(f))}</code></li>`).join(""):"<li>No shared files detected by filename.</li>";

fs.writeFileSync(HTML,`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WebAct Header Footer Audit</title><style>body{font-family:Arial,sans-serif;margin:0;background:#f4f7fb;color:#17283d}header{background:linear-gradient(135deg,#071b33,#0e5aa6);color:#fff;padding:40px}.wrap{max-width:1400px;margin:auto}.cards{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin:20px 0}.card,.panel{background:#fff;border:1px solid #dce6f1;border-radius:14px;padding:18px}.num{font-size:28px;font-weight:800}table{width:100%;border-collapse:collapse;background:#fff}th,td{padding:10px;border-bottom:1px solid #dce6f1;text-align:left;vertical-align:top}code{word-break:break-all}@media(max-width:900px){.cards{grid-template-columns:repeat(2,1fr)}table{display:block;overflow:auto}}</style></head><body><header><div class="wrap"><h1>Universal Header & Footer Audit</h1><p>Checks only header/footer detection and links. Page-body links and design assets are ignored.</p></div></header><main class="wrap"><section class="cards"><div class="card"><div class="num">${summary.htmlPagesChecked}</div>Pages</div><div class="card"><div class="num">${summary.sharedFilesFound}</div>Shared files</div><div class="card"><div class="num">${summary.internalLinksChecked}</div>Links checked</div><div class="card"><div class="num">${summary.validInternalLinks}</div>Valid links</div><div class="card"><div class="num">${summary.brokenLinks}</div>Broken links</div><div class="card"><div class="num">${summary.emptyLinks}</div>Empty links</div></section><section class="panel"><h2>Detected shared files</h2><ul>${sharedList}</ul></section><section class="panel"><h2>Header/footer link findings</h2>${rows?`<table><thead><tr><th>Severity</th><th>Area</th><th>Category</th><th>File</th><th>Line</th><th>Href</th><th>Expected path</th></tr></thead><tbody>${rows}</tbody></table>`:"<p>No broken or empty header/footer links found.</p>"}</section><section class="panel"><h2>Pages where header or footer was not detected</h2>${missingRows?`<table><thead><tr><th>Page</th><th>Header</th><th>Method</th><th>Footer</th><th>Method</th></tr></thead><tbody>${missingRows}</tbody></table>`:"<p>Header and footer were detected on every page.</p>"}</section></main></body></html>`,"utf8");

console.log("WebAct Universal Header & Footer Audit");
console.log(`Pages checked: ${summary.htmlPagesChecked}`);
console.log(`Shared files:  ${summary.sharedFilesFound}`);
console.log(`Links checked: ${summary.internalLinksChecked}`);
console.log(`Broken links:  ${summary.brokenLinks}`);
console.log(`Empty links:   ${summary.emptyLinks}`);
console.log(`Report: ${HTML}`);
process.exitCode=summary.totalFindings>0?1:0;
