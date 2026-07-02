const fs = require("fs");
const path = require("path");

const root = process.cwd();
const index = path.join(root, "index.html");

if (!fs.existsSync(index)) {
    console.error("index.html not found");
    process.exit(1);
}

let html = fs.readFileSync(index, "utf8");

const css =
'<link rel="stylesheet" href="assets/css/homepage-polish.css">';

const js =
'<script src="assets/js/homepage-polish.js" defer></script>';

if (!html.includes("homepage-polish.css")) {

    html = html.replace(
        "</head>",
        css + "\n</head>"
    );

}

if (!html.includes("homepage-polish.js")) {

    html = html.replace(
        "</body>",
        js + "\n</body>"
    );

}

html = html.replace(
    /<link[^>]*homepage-v2\.css[^>]*>/gi,
    ""
);

html = html.replace(
    /<script[^>]*homepage-v2\.js[^>]*><\/script>/gi,
    ""
);

fs.writeFileSync(index, html);

console.log("Homepage updated successfully.");