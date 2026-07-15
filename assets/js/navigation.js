(function () {
  "use strict";

  if (window.__webActNavigationLoaded) {
    if (window.WebActNavigation && typeof window.WebActNavigation.init === "function") {
      window.WebActNavigation.init();
    }
    return;
  }

  window.__webActNavigationLoaded = true;

  var MOBILE_BREAKPOINT = 1060;

  function headers() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-wa-nav]"));
  }

  function setPanelState(button, isOpen) {
    if (!button) return;

    var panelId = button.getAttribute("aria-controls");
    var panel = panelId ? document.getElementById(panelId) : null;

    button.setAttribute("aria-expanded", isOpen ? "true" : "false");

    if (!panel) return;

    panel.setAttribute("aria-hidden", isOpen ? "false" : "true");

    if (isOpen) {
      panel.removeAttribute("inert");
    } else {
      panel.setAttribute("inert", "");
    }
  }

  function closeAllSubmenus(header, exceptItem) {
    if (!header) return;

    header.querySelectorAll(".wa-promodo-item").forEach(function (item) {
      if (exceptItem && item === exceptItem) return;

      item.classList.remove("wa-open", "is-open");

      var button = item.querySelector(".wa-promodo-link[aria-controls]");
      setPanelState(button, false);
    });
  }

  function setMobileMenu(header, isOpen) {
    if (!header) return;

    var toggle = header.querySelector("[data-wa-menu-toggle]");
    var menu = header.querySelector("[data-wa-menu]");

    if (!toggle || !menu) return;

    header.classList.toggle("wa-menu-open", isOpen);
    header.classList.toggle("wa-nav-open", isOpen);
    header.classList.toggle("wa-open", isOpen);
    document.body.classList.toggle("wa-mobile-navigation-open", isOpen);

    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");

    menu.setAttribute("aria-hidden", isOpen ? "false" : "true");

    if (!isOpen) {
      closeAllSubmenus(header);
    }
  }

  function toggleMobileMenu(header) {
    if (!header) return;
    setMobileMenu(header, !header.classList.contains("wa-menu-open"));
  }

  function toggleSubmenu(button, header) {
    if (!button || !header) return;

    var item = button.closest(".wa-promodo-item");
    if (!item) return;

    var willOpen = !item.classList.contains("wa-open");

    closeAllSubmenus(header, item);

    item.classList.toggle("wa-open", willOpen);
    item.classList.toggle("is-open", willOpen);
    setPanelState(button, willOpen);
  }

  function initializeHeader(header) {
    if (!header) return;

    var toggle = header.querySelector("[data-wa-menu-toggle]");
    var menu = header.querySelector("[data-wa-menu]");

    if (toggle && menu) {
      toggle.setAttribute("aria-controls", menu.id || "wa-primary-menu");
      toggle.setAttribute("aria-expanded", header.classList.contains("wa-menu-open") ? "true" : "false");
      toggle.setAttribute("aria-label", header.classList.contains("wa-menu-open") ? "Close navigation" : "Open navigation");
    }

    header.querySelectorAll(".wa-promodo-link[aria-controls]").forEach(function (button) {
      var item = button.closest(".wa-promodo-item");
      setPanelState(button, !!(item && item.classList.contains("wa-open")));
    });

    header.setAttribute("data-wa-navigation-ready", "true");
  }

  function initializeAll() {
    headers().forEach(initializeHeader);
  }

  document.addEventListener("click", function (event) {
    var menuToggle = event.target.closest("[data-wa-menu-toggle]");

    if (menuToggle) {
      event.preventDefault();
      event.stopPropagation();
      toggleMobileMenu(menuToggle.closest("[data-wa-nav]"));
      return;
    }

    var submenuButton = event.target.closest(".wa-promodo-link[aria-controls]");

    if (submenuButton) {
      event.preventDefault();
      event.stopPropagation();
      toggleSubmenu(submenuButton, submenuButton.closest("[data-wa-nav]"));
      return;
    }

    headers().forEach(function (header) {
      if (!header.contains(event.target)) {
        closeAllSubmenus(header);
        setMobileMenu(header, false);
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    headers().forEach(function (header) {
      closeAllSubmenus(header);
      setMobileMenu(header, false);
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      headers().forEach(function (header) {
        setMobileMenu(header, false);
      });
    }
  });

  var observer = new MutationObserver(function (mutations) {
    var shouldInitialize = mutations.some(function (mutation) {
      return Array.prototype.some.call(mutation.addedNodes || [], function (node) {
        return node.nodeType === 1 &&
          (node.matches && node.matches("[data-wa-nav]") ||
           node.querySelector && node.querySelector("[data-wa-nav]"));
      });
    });

    if (shouldInitialize) {
      initializeAll();
    }
  });

  window.WebActNavigation = {
    init: initializeAll,
    close: function () {
      headers().forEach(function (header) {
        closeAllSubmenus(header);
        setMobileMenu(header, false);
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initializeAll();
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
  } else {
    initializeAll();
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();