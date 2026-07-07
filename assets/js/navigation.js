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