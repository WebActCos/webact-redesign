const fs = require("fs");
const path = require("path");

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run");

const footerPath = path.join(root, "assets", "includes", "footer.html");

if (!fs.existsSync(footerPath)) {
  console.error("Missing assets/includes/footer.html");
  process.exit(1);
}

const footerHtml = fs.readFileSync(footerPath, "utf8").trim();

function slash(value) {
  return value.replace(/\\/g, "/");
}

function findHtmlFiles(dir) {
  const skip = new Set([".git", "node_modules", "dist", "build", ".next"]);
  const files = [];

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(item.name)) continue;

    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      files.push(...findHtmlFiles(full));
    } else if (item.isFile() && item.name.toLowerCase().endsWith(".html")) {
      files.push(full);
    }
  }

  return files;
}

function prefixFor(filePath) {
  const dir = path.dirname(filePath);
  const rel = slash(path.relative(dir, root));
  return rel ? rel.replace(/\/?$/, "/") : "";
}

function rewriteAbsolutePaths(html, prefix) {
  return html
    .replace(/href="\/([^"#][^"]*)"/g, `href="${prefix}$1"`)
    .replace(/src="\/([^"]*)"/g, `src="${prefix}$1"`);
}

function ensureFooterCss(html, prefix) {
  html = html.replace(/\n?<link[^>]+webact-footer\.css[^>]*>/gi, "");

  if (/<\/head>/i.test(html)) {
    return html.replace(
      /<\/head>/i,
      `<link rel="stylesheet" href="${prefix}assets/css/webact-footer.css">\n</head>`
    );
  }

  return html;
}

function removeFooterJs(html) {
  return html.replace(/\n?<script[^>]+webact-footer\.js[^>]*><\/script>/gi, "");
}

function replaceFooter(html, footer) {
  if (/<footer\b[\s\S]*?<\/footer>/i.test(html)) {
    return html.replace(/<footer\b[\s\S]*?<\/footer>/i, footer);
  }

  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${footer}\n</body>`);
  }

  return html + "\n" + footer + "\n";
}

let updated = 0;

for (const file of findHtmlFiles(root)) {
  const rel = slash(path.relative(root, file));

  if (rel === "assets/includes/footer.html") continue;

  let html = fs.readFileSync(file, "utf8");
  const before = html;
  const prefix = prefixFor(file);
  const footer = rewriteAbsolutePaths(footerHtml, prefix);

  html = replaceFooter(html, footer);
  html = ensureFooterCss(html, prefix);
  html = removeFooterJs(html);

  if (html !== before) {
    updated++;
    console.log(`${dryRun ? "Would update" : "Updated"} ${rel}`);

    if (!dryRun) {
      fs.writeFileSync(file, html, "utf8");
    }
  }
}

console.log("");
console.log(`${dryRun ? "Would update" : "Updated"} ${updated} HTML files.`);
