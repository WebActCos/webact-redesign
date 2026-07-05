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