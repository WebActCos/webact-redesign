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

  function closeAllMegaMenus(header) {
    header.querySelectorAll(".wa-promodo-item").forEach(function (item) {
      item.classList.remove("wa-open");
    });

    header.querySelectorAll(".wa-promodo-link[aria-expanded]").forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
  }

  function initializeHeader() {
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
  }

  function initializeIncludes() {
    Promise.all([
      loadInclude("webact-header", "/includes/header.html"),
      loadInclude("webact-footer", "/includes/footer.html")
    ]).then(function () {
      initializeHeader();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeIncludes);
  } else {
    initializeIncludes();
  }
})();