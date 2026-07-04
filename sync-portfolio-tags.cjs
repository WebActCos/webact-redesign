const fs = require("fs");
const vm = require("vm");

const allPath = "js/portfolio-data-all.js";
const masterPath = "js/portfolio-master-data.js";

function loadJs(path){
  const sandbox = { window:{} };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path,"utf8"), sandbox);
  return sandbox.window;
}

const allWin = loadJs(allPath);
const masterWin = loadJs(masterPath);

const rows = Object.values(allWin).find(v => Array.isArray(v) && Array.isArray(v[0]));
const projects = Object.values(masterWin).find(v => Array.isArray(v) && v[0] && typeof v[0] === "object");

if(!rows || !projects){
  console.error("Could not find portfolio rows or master projects.");
  process.exit(1);
}

const slug = s => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const tagMap = new Map(rows.map(r => [slug(r[0]), r[1]]));

const copy = tag => ({
  intro: `${tag.toLowerCase()} website experience centered on trust, service clarity, brand story, and practical next steps for visitors.`,
  heading: `Grow Your ${tag} Business Online`,
  body: `Showcase your services, story, proof, and conversion paths with a ${tag.toLowerCase()} website built for customers.`
});

for(const p of projects){
  const tag = tagMap.get(slug(p.name || p.title));
  if(!tag) continue;

  const c = copy(tag);
  p.industry = tag;
  p.category = tag;
  p.type = tag;
  p.description = `${p.name} presents a ${c.intro}`;
  p.seoDescription = p.description;

  p.snapshot = p.snapshot || {};
  p.snapshot.industry = tag;

  p.cta = p.cta || {};
  p.cta.heading = c.heading;
  p.cta.headline = c.heading;
  p.cta.text = c.body;
  p.cta.body = c.body;

  p.override = p.override || {};
  p.override.hero = p.description;
  p.override.cta = { headline:c.heading, text:c.body, button:"Start a Similar Project" };
}

fs.writeFileSync(
  masterPath,
  "window.webactPortfolioMasterData = " + JSON.stringify(projects,null,2) + ";\n",
  "utf8"
);

console.log(`Synced ${projects.length} master projects from portfolio tags.`);
