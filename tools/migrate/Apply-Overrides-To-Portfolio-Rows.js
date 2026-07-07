const fs = require("fs");
const vm = require("vm");

const dataPath = "assets/js/portfolio-data-all.js";
const overridePath = "assets/js/industry-overrides.js";

const ctx = { console };
ctx.window = ctx;
ctx.global = ctx;
vm.createContext(ctx);

vm.runInContext(fs.readFileSync(dataPath, "utf8"), ctx, { filename: dataPath });
vm.runInContext(fs.readFileSync(overridePath, "utf8"), ctx, { filename: overridePath });

const rows = ctx.window.webactPortfolioRows || ctx.webactPortfolioRows;
const overrides = ctx.window.webactPortfolioOverrides || ctx.webactPortfolioOverrides;

if (!Array.isArray(rows)) throw new Error("Missing window.webactPortfolioRows");
if (!overrides) throw new Error("Missing window.webactPortfolioOverrides");

function norm(v){
  return String(v || "")
    .toLowerCase()
    .replace(/&/g,"and")
    .replace(/[^a-z0-9]+/g," ")
    .trim();
}

let updated = 0;

Object.keys(overrides).forEach(key => {
  const override = overrides[key];
  const keyNorm = norm(key);

  const row = rows.find(r => {
    const nameNorm = norm(r[0]);
    return nameNorm === keyNorm || nameNorm.includes(keyNorm) || keyNorm.includes(nameNorm);
  });

  if (!row) {
    console.log("No row match:", key);
    return;
  }

  if (override.name) row[0] = override.name;
  if (override.industry) row[1] = override.industry;

  updated++;
});

fs.writeFileSync(
  dataPath,
  "window.webactPortfolioRows = " + JSON.stringify(rows, null, 2) + ";\n",
  "utf8"
);

console.log("Updated rows:", updated);
