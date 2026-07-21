(function () {
  "use strict";

  function loadDeferredFrames() {
    document.querySelectorAll("iframe[data-webact-src]").forEach(function (frame) {
      if (!frame.src) frame.src = frame.getAttribute("data-webact-src");
      frame.removeAttribute("data-webact-src");
    });
  }

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
      if (text || link.getAttribute("aria-label")) return;

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

  function init() {
    improveImages();
    labelEmptyLinks();

    ["pointerdown", "keydown", "touchstart"].forEach(function (eventName) {
      window.addEventListener(eventName, loadDeferredFrames, {
        once: true,
        passive: true
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();