(function () {
  "use strict";

  function getBasePath() {
    var path = window.location.pathname;

    if (path.indexOf("/webact-redesign/") === 0) {
      return "/webact-redesign";
    }

    return "";
  }

  function loadInclude(targetId, filePath) {
    var target = document.getElementById(targetId);
    if (!target) return Promise.resolve();

    return fetch(getBasePath() + filePath, { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load " + filePath + " (" + response.status + ")");
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