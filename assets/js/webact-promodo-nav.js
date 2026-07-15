(function () {
  "use strict";

  /*
    Compatibility shim only.
    assets/js/navigation.js is the single source of navigation behavior.
    Keeping a second independent click handler caused the homepage submenu
    and mobile hamburger states to conflict.
  */
  function initialize() {
    if (window.WebActNavigation && typeof window.WebActNavigation.init === "function") {
      window.WebActNavigation.init();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();