$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Path ".\assets\js" -Force | Out-Null

@'
window.WebActRoutes = {
  routes: {
    home: "/",
    contact: "/contact/index.html",
    portfolio: "/about/portfolio.html",
    pricing: "/pricing/index.html",
    industries: "/industries/index.html",
    privacy: "/privacy-policy/index.html",
    terms: "/terms/index.html",
    sitemap: "/sitemap.xml"
  },

  url: function (key) {
    return this.routes[key] || "/";
  },

  currentPath: function () {
    return window.location.pathname.replace(/\/$/, "/index.html");
  },

  section: function () {
    var path = this.currentPath();

    if (path.indexOf("/design/") === 0) return "design";
    if (path.indexOf("/marketing/") === 0) return "marketing";
    if (path.indexOf("/digital-ads/") === 0) return "digital-ads";
    if (path.indexOf("/pricing/") === 0) return "pricing";
    if (path.indexOf("/addons/") === 0) return "addons";
    if (path.indexOf("/industries/") === 0) return "industries";
    if (path.indexOf("/about/") === 0) return "about";
    if (path.indexOf("/contact/") === 0) return "contact";

    return "home";
  }
};
'@ | Set-Content ".\assets\js\routes.js" -NoNewline

Write-Host "Framework JS verified." -ForegroundColor Green