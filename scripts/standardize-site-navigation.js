const fs = require('fs');
const path = require('path');

const root = process.cwd();
const homepage = path.join(root, 'index.html');
const dryRun = process.argv.includes('--dry-run');

function slash(value) {
  return value.replace(/\\/g, '/');
}

function prefixFor(filePath) {
  const dir = path.dirname(filePath);
  const rel = slash(path.relative(dir, root));
  return rel ? rel.replace(/\/?$/, '/') : '';
}

function findHtmlFiles(dir) {
  const skip = new Set(['.git', 'node_modules', 'dist', 'build']);
  const files = [];

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(item.name)) continue;

    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      files.push(...findHtmlFiles(full));
    } else if (item.isFile() && item.name.toLowerCase().endsWith('.html')) {
      files.push(full);
    }
  }

  return files;
}

function extractHeader(html) {
  const start = html.search(/<header\b[^>]*class=["'][^"']*wa-promodo-header[^"']*["'][^>]*>/i);

  if (start < 0) {
    throw new Error('Could not find homepage header.');
  }

  const end = html.indexOf('</header>', start);

  if (end < 0) {
    throw new Error('Could not find closing homepage </header>.');
  }

  return html.slice(start, end + '</header>'.length);
}

function replaceFirstHeader(html, replacement) {
  const start = html.search(/<header\b/i);

  if (start < 0) {
    return html.replace(/<body([^>]*)>/i, `<body$1>\n${replacement}`);
  }

  const end = html.indexOf('</header>', start);

  if (end < 0) {
    return html;
  }

  return html.slice(0, start) + replacement + html.slice(end + '</header>'.length);
}

function rewritePaths(markup, prefix) {
  return markup
    .replace(/href="(?!https?:|mailto:|tel:|#|\/)([^"]+)"/g, `href="${prefix}$1"`)
    .replace(/src="(?!https?:|data:|\/)([^"]+)"/g, `src="${prefix}$1"`);
}

function ensureNavCss(html, prefix) {
  html = html.replace(/\n?<link[^>]+webact-promodo-nav\.css[^>]*>/gi, '');

  return html.replace(
    '</head>',
    `<link rel="stylesheet" href="${prefix}assets/css/webact-promodo-nav.css">\n</head>`
  );
}

function ensureNavJs(html, prefix) {
  html = html.replace(/\n?<script[^>]+webact-promodo-nav\.js[^>]*><\/script>/gi, '');

  return html.replace(
    '</body>',
    `<script src="${prefix}assets/js/webact-promodo-nav.js" defer></script>\n</body>`
  );
}

function processFile(file, homeHeader) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  const prefix = prefixFor(file);
  const header = rewritePaths(homeHeader, prefix);

  html = replaceFirstHeader(html, header);
  html = ensureNavCss(html, prefix);
  html = ensureNavJs(html, prefix);

  if (html !== before) {
    console.log(`${dryRun ? 'Would update' : 'Updated'} ${slash(path.relative(root, file))}`);

    if (!dryRun) {
      fs.writeFileSync(file, html, 'utf8');
    }

    return true;
  }

  return false;
}

function main() {
  const homeHtml = fs.readFileSync(homepage, 'utf8');
  const homeHeader = extractHeader(homeHtml);
  const files = findHtmlFiles(root);

  let count = 0;

  for (const file of files) {
    if (file === homepage) continue;

    if (processFile(file, homeHeader)) {
      count++;
    }
  }

  console.log(`${dryRun ? 'Would update' : 'Updated'} ${count} HTML files.`);
}

main();