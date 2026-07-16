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
      var selector =
        'link[rel="' + config.rel + '"][data-webact-favicon="true"]';
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

  function initializeIncludes() {
    installFavicon();
    installGoogleTagManager();

    Promise.all([
      loadInclude("webact-header", "/includes/header.html"),
      loadInclude("webact-footer", "/includes/footer.html")
    ]).then(function () {
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