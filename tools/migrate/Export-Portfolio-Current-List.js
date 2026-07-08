const fs = require("fs");
const vm = require("vm");

const file = "assets/js/portfolio-data-all.js";
const ctx = { window: {}, console };
ctx.global = ctx.window;
vm.createContext(ctx);

vm.runInContext(fs.readFileSync(file, "utf8"), ctx);

const rows = ctx.window.webactPortfolioRows || [];
const list = rows
  .map(r => `${r[0]} — ${r[1]}`)
  .join("\n");

fs.writeFileSync("portfolio-current-business-industry-list.txt", list, "utf8");
console.log("Created portfolio-current-business-industry-list.txt");
