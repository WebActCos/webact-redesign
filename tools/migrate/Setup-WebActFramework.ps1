$ErrorActionPreference = "Stop"

# Keep this phase scoped. Undo accidental broad changes outside core/framework.
git restore about/blog about/portfolio industries pages assets/webact-template-embed.html assets/webact-template-feed.html 2>$null

New-Item -ItemType Directory -Path ".\assets\js" -Force | Out-Null
New-Item -ItemType Directory -Path ".\tools\migrate" -Force | Out-Null

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

@'
(function () {
  "use strict";

  function closeAllMegaMenus(header) {
    header.querySelectorAll(".wa-promodo-item").forEach(function (item) {
      item.classList.remove("wa-open");
    });

    header.querySelectorAll(".wa-promodo-link[aria-expanded]").forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
  }

  function setActiveNavigation(header) {
    if (!window.WebActRoutes) return;

    var section = window.WebActRoutes.section();

    header.querySelectorAll("[data-wa-section]").forEach(function (item) {
      if (item.getAttribute("data-wa-section") === section) {
        item.classList.add("wa-active");
      }
    });
  }

  window.WebActNavigation = {
    init: function () {
      var header = document.querySelector("[data-wa-nav]");

      if (!header || header.dataset.waInitialized === "true") {
        return;
      }

      header.dataset.waInitialized = "true";

      var menuToggle = header.querySelector("[data-wa-menu-toggle]");
      var menu = header.querySelector("[data-wa-menu]");

      if (menuToggle && menu) {
        menuToggle.addEventListener("click", function () {
          var isOpen = header.classList.toggle("wa-menu-open");
          menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
      }

      header.querySelectorAll(".wa-promodo-link[aria-controls]").forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();

          var item = button.closest(".wa-promodo-item");
          var isOpen = item.classList.contains("wa-open");

          closeAllMegaMenus(header);

          if (!isOpen) {
            item.classList.add("wa-open");
            button.setAttribute("aria-expanded", "true");
          }
        });
      });

      document.addEventListener("click", function (event) {
        if (!header.contains(event.target)) {
          closeAllMegaMenus(header);
        }
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          closeAllMegaMenus(header);
          header.classList.remove("wa-menu-open");

          if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
          }
        }
      });

      setActiveNavigation(header);
    }
  };
})();
'@ | Set-Content ".\assets\js\navigation.js" -NoNewline

@'
(function () {
  "use strict";

  function loadInclude(targetId, filePath) {
    var target = document.getElementById(targetId);

    if (!target) {
      return Promise.resolve();
    }

    return fetch(filePath, { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load " + filePath + " (" + response.status + ")");
        }

        return response.text();
      })
      .then(function (html) {
        target.innerHTML = html;

        document.dispatchEvent(
          new CustomEvent("webact:include-loaded", {
            detail: {
              targetId: targetId,
              filePath: filePath
            }
          })
        );
      })
      .catch(function (error) {
        console.error("WebAct include loading error:", error);
      });
  }

  function initializeIncludes() {
    Promise.all([
      loadInclude("webact-header", "/includes/header.html"),
      loadInclude("webact-footer", "/includes/footer.html")
    ]).then(function () {
      if (window.WebActNavigation) {
        window.WebActNavigation.init();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeIncludes);
  } else {
    initializeIncludes();
  }
})();
'@ | Set-Content ".\assets\js\includes.js" -NoNewline

$coreFiles = @(
"index.html","about\index.html","about\about-us.html","about\portfolio.html","about\faq.html","about\blog.html","about\login.html","about\how-to-videos.html","about\website-knowledge-base.html","about\widget-knowledge-base.html",
"design\index.html","design\branding.html","design\graphic-design.html","design\logo-design.html","design\professional-editor.html","design\simple-editor.html","design\website-design.html",
"marketing\index.html","marketing\aeo.html","marketing\email-marketing.html","marketing\gmb.html","marketing\local-listings.html","marketing\local-seo.html","marketing\national-seo.html","marketing\seo.html",
"digital-ads\index.html","digital-ads\amazon-advertising.html","digital-ads\google-advertising.html","digital-ads\local-services-advertising.html","digital-ads\microsoft-advertising.html","digital-ads\social-media-advertising.html","digital-ads\television-advertising.html",
"pricing\index.html","pricing\advertising.html","pricing\design.html","pricing\marketing.html","pricing\packages.html","pricing\widgets.html",
"addons\index.html","addons\domain-names.html","addons\professional-email.html","addons\website-app-store.html","addons\widgets.html","contact\index.html"
)

foreach ($file in $coreFiles) {
  if (!(Test-Path $file)) {
    Write-Host "Missing: $file" -ForegroundColor Yellow
    continue
  }

  $html = Get-Content $file -Raw

  $html = $html -replace '(?is)\s*<script src="/assets/js/routes\.js"></script>', ''
  $html = $html -replace '(?is)\s*<script src="/assets/js/navigation\.js"></script>', ''
  $html = $html -replace '(?is)\s*<script src="/assets/js/includes\.js"></script>', ''

  $scripts = @'
  <script src="/assets/js/routes.js"></script>
  <script src="/assets/js/navigation.js"></script>
  <script src="/assets/js/includes.js"></script>
'@

  $html = $html -replace '(?is)</body>', ($scripts + "`r`n</body>")

  Set-Content $file $html -NoNewline
  Write-Host "Updated scripts: $file" -ForegroundColor Green
}

git status