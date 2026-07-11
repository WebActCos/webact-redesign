(function () {
  "use strict";

  function getHeader() {
    return document.querySelector("[data-wa-nav]");
  }

  function closeAllMegaMenus(header) {
    if (!header) return;

    header.querySelectorAll(".wa-promodo-item").forEach(function (item) {
      item.classList.remove("wa-open");
    });

    header.querySelectorAll(".wa-promodo-link[aria-expanded]").forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
  }

  function closeMobileMenu(header) {
    if (!header) return;

    header.classList.remove("wa-menu-open");
    header.classList.remove("wa-nav-open");
    header.classList.remove("wa-open");

    var toggle = header.querySelector("[data-wa-menu-toggle]");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    }
  }

  function toggleMobileMenu(header) {
    if (!header) return;

    var toggle = header.querySelector("[data-wa-menu-toggle]");
    var menu = header.querySelector("[data-wa-menu]");

    if (!toggle || !menu) return;

    var willOpen = !header.classList.contains("wa-menu-open");

    closeAllMegaMenus(header);

    header.classList.toggle("wa-menu-open", willOpen);
    header.classList.toggle("wa-nav-open", willOpen);

    toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      willOpen ? "Close navigation" : "Open navigation"
    );
  }

  function toggleMegaMenu(button, header) {
    if (!button || !header) return;

    var item = button.closest(".wa-promodo-item");

    if (!item) return;

    var wasOpen = item.classList.contains("wa-open");

    closeAllMegaMenus(header);

    if (!wasOpen) {
      item.classList.add("wa-open");
      button.setAttribute("aria-expanded", "true");
    }
  }

  function setActiveNavigation(header) {
    if (!header || !window.WebActRoutes) return;

    var section = window.WebActRoutes.section();

    header.querySelectorAll("[data-wa-section]").forEach(function (item) {
      item.classList.toggle(
        "wa-active",
        item.getAttribute("data-wa-section") === section
      );
    });
  }

  function initializeCurrentHeader() {
    var header = getHeader();

    if (!header) return;

    setActiveNavigation(header);
  }

  /*
     Delegated click handling works even when includes.js inserts the
     shared header after navigation.js has already loaded.
  */
  document.addEventListener("click", function (event) {
    var menuToggle = event.target.closest("[data-wa-menu-toggle]");

    if (menuToggle) {
      event.preventDefault();
      event.stopPropagation();

      toggleMobileMenu(menuToggle.closest("[data-wa-nav]"));
      return;
    }

    var megaButton = event.target.closest(
      ".wa-promodo-link[aria-controls]"
    );

    if (megaButton) {
      event.preventDefault();
      event.stopPropagation();

      toggleMegaMenu(
        megaButton,
        megaButton.closest("[data-wa-nav]")
      );

      return;
    }

    var header = getHeader();

    if (header && !header.contains(event.target)) {
      closeAllMegaMenus(header);
      closeMobileMenu(header);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    var header = getHeader();

    closeAllMegaMenus(header);
    closeMobileMenu(header);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1060) {
      var header = getHeader();

      closeAllMegaMenus(header);
      closeMobileMenu(header);
    }
  });

  /*
     Keep compatibility with includes.js, which calls
     WebActNavigation.init() after inserting the shared header.
  */
  window.WebActNavigation = {
    init: initializeCurrentHeader
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeCurrentHeader
    );
  } else {
    initializeCurrentHeader();
  }
})();