(function () {
  "use strict";

  function improveImages() {
    Array.prototype.slice.call(document.images || []).forEach(function (image, index) {
      image.decoding = "async";

      if (index === 0) {
        image.loading = "eager";
        image.fetchPriority = "high";
      } else if (!image.hasAttribute("loading")) {
        image.loading = "lazy";
      }
    });
  }

  function labelEmptyLinks() {
    document.querySelectorAll("a[href]").forEach(function (link) {
      var text = (link.textContent || "").replace(/\s+/g, " ").trim();

      if (text || link.getAttribute("aria-label")) {
        return;
      }

      var image = link.querySelector("img[alt]");
      var label = image && image.alt ? image.alt.trim() : "";

      if (!label) {
        label = "Open " + (link.getAttribute("href") || "link")
          .replace(/[-_/]+/g, " ")
          .trim();
      }

      link.setAttribute("aria-label", label);
    });
  }

  function initialize() {
    improveImages();
    labelEmptyLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();