(function () {
  "use strict";

  function getBasePath() {
    var path = window.location.pathname;

    if (path.indexOf("/") === 0) {
      return "/";
    }

    return "";
  }

  function prefixRootUrls(html) {
    var basePath = getBasePath();

    if (!basePath) {
      return html;
    }

    return html.replace(/(href|src)=("|')\/(?!\/|webact-redesign\/|https?:|mailto:|tel:|#)([^"']+)("|')/gi, function (match, attr, quoteStart, url, quoteEnd) {
      return attr + "=" + quoteStart + basePath + "/" + url + quoteEnd;
    });
  }

  function loadInclude(targetId, filePath) {
    var target = document.getElementById(targetId);
    if (!target) return Promise.resolve();

    return fetch(filePath, { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load " + filePath + " (" + response.status + ")");
        }
        return response.text();
      })
      .then(function (html) {
        target.innerHTML = prefixRootUrls(html);
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


