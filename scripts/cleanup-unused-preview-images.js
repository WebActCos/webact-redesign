const fs = require('fs');
const path = require('path');

const root = process.cwd();
const imageDir = path.join(root, 'Resources', 'images');
const portfolioDir = path.join(root, 'about', 'portfolio');
const dryRun = process.argv.includes('--dry-run');

function expectedImages() {
  const files = fs.readdirSync(portfolioDir).filter(f => /^portfolio-data-part\d+\.js$/.test(f)).sort();
  const expected = new Set();
  for (const file of files) {
    const text = fs.readFileSync(path.join(portfolioDir, file), 'utf8');
    const matches = text.matchAll(/\.\.\/\.\.\/Resources\/images\/([^"\]]+)/g);
    for (const match of matches) expected.add(decodeURIComponent(match[1]));
  }
  return expected;
}

const expected = expectedImages();
const files = fs.existsSync(imageDir) ? fs.readdirSync(imageDir) : [];
const unusedPreviewFiles = files.filter(file => file.endsWith('-preview.png') && !expected.has(file));

console.log(`Expected portfolio images: ${expected.size}`);
console.log(`Unused *-preview.png files: ${unusedPreviewFiles.length}`);
unusedPreviewFiles.forEach(file => console.log(`${dryRun ? 'Would remove' : 'Removing'} ${file}`));

if (!dryRun) {
  for (const file of unusedPreviewFiles) fs.unlinkSync(path.join(imageDir, file));
}
