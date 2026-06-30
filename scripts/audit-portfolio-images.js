const fs = require('fs');
const path = require('path');

const root = process.cwd();
const portfolioDir = path.join(root, 'about', 'portfolio');
const imageDir = path.join(root, 'Resources', 'images');
const parts = fs.readdirSync(portfolioDir).filter(file => /^portfolio-data-part\d+\.js$/.test(file)).sort();
const rows = [];

for (const file of parts) {
  const text = fs.readFileSync(path.join(portfolioDir, file), 'utf8');
  const matches = text.matchAll(/\["([^"]+)","([^"]+)","\.\.\/\.\.\/Resources\/images\/([^"]+)","([^"]*)"\]/g);
  for (const match of matches) rows.push({ name: match[1], industry: match[2], image: decodeURIComponent(match[3]) });
}

const missing = [];
for (const row of rows) {
  const exact = path.join(imageDir, row.image);
  if (!fs.existsSync(exact)) missing.push(row);
}

console.log(`Checked ${rows.length} portfolio image references.`);
console.log(`Missing ${missing.length} image files.`);
if (missing.length) {
  console.log('\nMissing files:');
  missing.forEach(row => console.log(`${row.name} -> Resources/images/${row.image}`));
}
