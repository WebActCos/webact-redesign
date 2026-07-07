const fs = require("fs");
const vm = require("vm");

const masterPath = "assets/js/portfolio-master-data.js";
const overridePath = "assets/js/industry-overrides.js";

const ctx = { console };
ctx.window = ctx;
ctx.global = ctx;
vm.createContext(ctx);

vm.runInContext(fs.readFileSync(masterPath, "utf8"), ctx, { filename: masterPath });
vm.runInContext(fs.readFileSync(overridePath, "utf8"), ctx, { filename: overridePath });

const data =
  ctx.window.webactPortfolioMasterData ||
  ctx.webactPortfolioMasterData ||
  ctx.window.webactPortfolioData ||
  ctx.webactPortfolioData ||
  ctx.window.portfolioData ||
  ctx.portfolioData;

const overrides = ctx.window.webactPortfolioOverrides || ctx.webactPortfolioOverrides;

if (!Array.isArray(data)) {
  throw new Error("Could not find portfolio data array.");
}

if (!overrides) {
  throw new Error("Could not find webactPortfolioOverrides.");
}

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getNames(item) {
  return [
    item.name,
    item.company,
    item.title,
    item.businessName,
    item.client,
    item.slug
  ].filter(Boolean);
}

let updated = 0;

Object.keys(overrides).forEach(key => {
  const override = overrides[key];
  const keyNorm = norm(key);

  const item = data.find(entry => {
    return getNames(entry).some(name => {
      const n = norm(name);
      return n === keyNorm || n.includes(keyNorm) || keyNorm.includes(n);
    });
  });

  if (!item) {
    console.log("No match:", key);
    return;
  }

  const oldIndustry = item.industry || item.category || "";

  Object.assign(item, override);

  if (override.industry) {
    item.industry = override.industry;
    item.category = override.industry;

    if (Array.isArray(item.tags)) {
      item.tags = item.tags
        .filter(tag => norm(tag) !== norm(oldIndustry))
        .filter(tag => norm(tag) !== norm(item.category));

      if (!item.tags.some(tag => norm(tag) === norm(override.industry))) {
        item.tags.unshift(override.industry);
      }
    } else {
      item.tags = [override.industry];
    }

    if (Array.isArray(item.categories)) {
      item.categories = item.categories
        .filter(tag => norm(tag) !== norm(oldIndustry));

      if (!item.categories.some(tag => norm(tag) === norm(override.industry))) {
        item.categories.unshift(override.industry);
      }
    }

    if (item.caseStudy && typeof item.caseStudy === "object") {
      item.caseStudy.industry = override.industry;
      item.caseStudy.category = override.industry;
    }
  }

  updated++;
});

const output =
  "window.webactPortfolioMasterData = " +
  JSON.stringify(data, null, 2) +
  ";\n";

fs.writeFileSync(masterPath, output, "utf8");

console.log("Updated portfolio records:", updated);
