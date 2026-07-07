const fs = require("fs");
const vm = require("vm");
const path = require("path");

const overridePath = fs.existsSync("assets/js/industry-overrides.js")
  ? "assets/js/industry-overrides.js"
  : "industry-overrides.js";

if (!fs.existsSync(overridePath)) {
  throw new Error("Missing industry-overrides.js");
}

const ctx = { console };
ctx.window = ctx;
ctx.global = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(overridePath, "utf8"), ctx);

const overrides = ctx.webactPortfolioOverrides || ctx.window.webactPortfolioOverrides;
if (!overrides) throw new Error("Could not load webactPortfolioOverrides");

function norm(v){
  return String(v || "").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g," ").trim();
}

function matchItem(item, key){
  const names = [item.name,item.company,item.title,item.businessName,item.client,item.slug].filter(Boolean);
  const k = norm(key);
  return names.some(n => {
    n = norm(n);
    return n === k || n.includes(k) || k.includes(n);
  });
}

function apply(item, key, override){
  const oldIndustry = item.industry || item.category || "";

  Object.assign(item, override);

  if (override.name) {
    if (item.name) item.name = override.name;
    if (item.company) item.company = override.name;
    if (item.title && norm(item.title) === norm(key)) item.title = override.name;
  }

  if (override.industry) {
    item.industry = override.industry;
    item.category = override.industry;

    ["tags","categories","filterTags","industries"].forEach(field => {
      if (!Array.isArray(item[field])) item[field] = [];
      item[field] = item[field].filter(t => norm(t) !== norm(oldIndustry));
      if (!item[field].some(t => norm(t) === norm(override.industry))) {
        item[field].unshift(override.industry);
      }
    });

    if (item.caseStudy && typeof item.caseStudy === "object") {
      item.caseStudy.industry = override.industry;
      item.caseStudy.category = override.industry;
    }
  }
}

const files = [
  "assets/js/portfolio-master-data.js",
  "assets/js/portfolio-data.js",
  "assets/js/portfolio-data-all.js",
  "assets/js/portfolio-tag-source.js"
].filter(fs.existsSync);

let total = 0;

files.forEach(file => {
  let code = fs.readFileSync(file, "utf8");
  const sandbox = { console };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  vm.createContext(sandbox);

  try {
    vm.runInContext(code, sandbox, { filename:file });
  } catch(e) {
    console.log("Skipped unreadable:", file);
    return;
  }

  const keys = Object.keys(sandbox).filter(k =>
    /portfolio/i.test(k) &&
    Array.isArray(sandbox[k]) &&
    sandbox[k].length
  );

  keys.forEach(varName => {
    const data = sandbox[varName];
    let updated = 0;

    Object.keys(overrides).forEach(key => {
      const item = data.find(x => matchItem(x, key));
      if (item) {
        apply(item, key, overrides[key]);
        updated++;
      }
    });

    if (updated) {
      const newCode = "window." + varName + " = " + JSON.stringify(data, null, 2) + ";\n";
      fs.writeFileSync(file, newCode, "utf8");
      console.log("Updated", updated, "records in", file, "using", varName);
      total += updated;
    }
  });
});

console.log("Total updates:", total);
