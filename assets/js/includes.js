(function () {
  "use strict";

  var GTM_CONTAINER_ID = "GTM-K7M67ZZ7";
  var FAVICON_PATH = "/images/logo-original.png";

  function installFavicon() {
    var faviconLinks = [
      { rel: "icon", type: "image/png", sizes: "32x32" },
      { rel: "shortcut icon", type: "image/png" },
      { rel: "apple-touch-icon", sizes: "180x180" }
    ];

    faviconLinks.forEach(function (config) {
      var selector = 'link[rel="' + config.rel + '"][data-webact-favicon="true"]';
      var link = document.head.querySelector(selector);

      if (!link) {
        link = document.createElement("link");
        link.rel = config.rel;
        link.setAttribute("data-webact-favicon", "true");
        document.head.appendChild(link);
      }

      link.href = FAVICON_PATH;

      if (config.type) {
        link.type = config.type;
      }

      if (config.sizes) {
        link.sizes = config.sizes;
      }
    });
  }

  function installGoogleTagManager() {
    if (!document.getElementById("webact-gtm-script")) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        "gtm.start": new Date().getTime(),
        event: "gtm.js"
      });

      var firstScript = document.getElementsByTagName("script")[0];
      var gtmScript = document.createElement("script");
      gtmScript.id = "webact-gtm-script";
      gtmScript.async = true;
      gtmScript.src =
        "https://www.googletagmanager.com/gtm.js?id=" +
        encodeURIComponent(GTM_CONTAINER_ID);

      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(gtmScript, firstScript);
      } else {
        document.head.appendChild(gtmScript);
      }
    }

    if (!document.getElementById("webact-gtm-noscript")) {
      var noScript = document.createElement("noscript");
      noScript.id = "webact-gtm-noscript";
      noScript.innerHTML =
        '<iframe src="https://www.googletagmanager.com/ns.html?id=' +
        GTM_CONTAINER_ID +
        '" height="0" width="0" style="display:none;visibility:hidden"></iframe>';

      if (document.body.firstChild) {
        document.body.insertBefore(noScript, document.body.firstChild);
      } else {
        document.body.appendChild(noScript);
      }
    }
  }

  function loadInclude(targetId, filePath) {
    var target = document.getElementById(targetId);

    if (!target) {
      return Promise.resolve();
    }

    return fetch(filePath, { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error(
            "Failed to load " + filePath + " (" + response.status + ")"
          );
        }

        return response.text();
      })
      .then(function (html) {
        target.innerHTML = html;
      })
      .catch(function (error) {
        console.error("WebAct include loading error:", error);
      });
  }
  /* WEBACT HOMEPAGE DIRECT NAVIGATION START */
  function initializeHomepageDirectNavigation() {
    if (!document.body.classList.contains("wa-home-v2")) return;

    var header = document.querySelector("#webact-header [data-wa-nav]");
    if (!header || header.dataset.homeDirectNav === "true") return;
    header.dataset.homeDirectNav = "true";

    var breakpoint = 1060;
    var toggle = header.querySelector("[data-wa-menu-toggle]");

    function panelFor(button) {
      var id = button && button.getAttribute("aria-controls");
      return id ? document.getElementById(id) : null;
    }

    function closeItem(item) {
      if (!item) return;
      item.classList.remove("wa-home-direct-open");
      var button = item.querySelector(".wa-promodo-link[aria-controls]");
      var panel = panelFor(button);
      if (button) button.setAttribute("aria-expanded","false");
      if (panel) {
        panel.setAttribute("aria-hidden","true");
        panel.setAttribute("inert","");
        panel.removeAttribute("style");
      }
    }

    function closeAll(except) {
      header.querySelectorAll(".wa-promodo-item").forEach(function (item) {
        if (item !== except) closeItem(item);
      });
    }

    header.querySelectorAll(".wa-promodo-link[aria-controls]").forEach(function (button) {
      button.addEventListener("click",function (event) {
        event.preventDefault();
        event.stopPropagation();

        var item = button.closest(".wa-promodo-item");
        var panel = panelFor(button);
        if (!item || !panel) return;

        if (item.classList.contains("wa-home-direct-open")) {
          closeItem(item);
          return;
        }

        closeAll(item);
        item.classList.add("wa-home-direct-open");
        button.setAttribute("aria-expanded","true");
        panel.setAttribute("aria-hidden","false");
        panel.removeAttribute("inert");

        if (window.innerWidth > breakpoint) {
          var rect = header.getBoundingClientRect();
          panel.style.cssText =
            "display:block!important;visibility:visible!important;opacity:1!important;" +
            "pointer-events:auto!important;position:fixed!important;left:0!important;right:auto!important;" +
            "top:" + Math.round(rect.bottom) + "px!important;width:100vw!important;max-width:100vw!important;" +
            "margin:0!important;transform:none!important;z-index:2147483001!important;";
        }
      });
    });

    if (toggle) {
      toggle.addEventListener("click",function (event) {
        event.preventDefault();
        event.stopPropagation();
        var open = !header.classList.contains("wa-home-direct-mobile-open");
        closeAll();
        header.classList.toggle("wa-home-direct-mobile-open",open);
        document.body.classList.toggle("wa-home-direct-scroll-lock",open);
        toggle.setAttribute("aria-expanded",open?"true":"false");
      });
    }

    document.addEventListener("click",function (event) {
      if (!header.contains(event.target)) {
        closeAll();
        header.classList.remove("wa-home-direct-mobile-open");
        document.body.classList.remove("wa-home-direct-scroll-lock");
      }
    });

    document.addEventListener("keydown",function (event) {
      if (event.key === "Escape") {
        closeAll();
        header.classList.remove("wa-home-direct-mobile-open");
        document.body.classList.remove("wa-home-direct-scroll-lock");
      }
    });
  }
  /* WEBACT HOMEPAGE DIRECT NAVIGATION END */


  function initializeIncludes() {
    installFavicon();
    installGoogleTagManager();

    Promise.all([
      loadInclude("webact-header", "/includes/header.html"),
      loadInclude("webact-footer", "/includes/footer.html")
    ]).then(function () {
      initializeHomepageDirectNavigation();
      if (
        window.WebActNavigation &&
        typeof window.WebActNavigation.init === "function"
      ) {
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