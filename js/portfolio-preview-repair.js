(function () {
  if (window.__webactPortfolioPreviewRepair) return;
  window.__webactPortfolioPreviewRepair = true;

  var cacheKey = "webactPortfolioPreviewImages:v5";
  var cache = {};
  try {
    cache = JSON.parse(localStorage.getItem(cacheKey) || "{}");
  } catch (error) {
    cache = {};
  }

  function saveCache() {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cache));
    } catch (error) {}
  }

  function getSlug(href) {
    var path = new URL(href, window.location.href).pathname.replace(/\/index\.html$/i, "").replace(/\/$/, "");
    return decodeURIComponent(path.split("/").pop() || "");
  }

  function isPortfolioCaseLink(link) {
    var slug = getSlug(link.href);
    return slug && slug !== "portfolio" && /\/about\/portfolio\//i.test(new URL(link.href, window.location.href).pathname);
  }

  function getCard(link) {
    return link.closest(".portfolio-card, .case-study-card, .project-card, .work-card, article, li, .card") || link.closest("div");
  }

  function findPreviewSpot(card) {
    var image = card.querySelector("img");
    if (image) return image;

    var nodes = Array.prototype.slice.call(card.querySelectorAll("figure, .image, .thumbnail, .preview, div"));
    return nodes.find(function (node) {
      return /website preview/i.test(node.textContent || "");
    }) || card.firstElementChild;
  }

  function applyPreview(card, src, title) {
    if (!card || !src || card.dataset.realPreviewApplied === src) return;
    card.dataset.realPreviewApplied = src;
    card.classList.add("portfolio-preview-repaired");

    var frame = document.createElement("div");
    frame.className = "webact-portfolio-preview-frame";

    var img = document.createElement("img");
    img.src = src;
    img.alt = title || "Website preview";
    img.loading = "lazy";
    frame.appendChild(img);

    var spot = findPreviewSpot(card);
    if (spot && spot.parentNode) {
      spot.parentNode.replaceChild(frame, spot);
    } else {
      card.insertBefore(frame, card.firstChild);
    }
  }

  function imageScore(image) {
    var src = image.currentSrc || image.src || "";
    var alt = (image.alt || "").toLowerCase();
    var joined = (src + " " + alt).toLowerCase();
    if (!src || /logo|icon|avatar|placeholder|webact/i.test(joined)) return -1;

    var width = image.naturalWidth || image.width || 0;
    var height = image.naturalHeight || image.height || 0;
    if (width < 220 || height < 120) return -1;

    var score = width * height;
    if (/device|mockup|portfolio|3-devices|desktop|tablet|phone/i.test(joined)) score *= 3;
    if (/hero|case|website|preview/i.test(joined)) score *= 2;
    return score;
  }

  function extractPreview(pageUrl, done) {
    var iframe = document.createElement("iframe");
    iframe.style.cssText = "position:absolute;left:-99999px;top:-99999px;width:1200px;height:900px;opacity:0;pointer-events:none;";

    var finished = false;
    function finish(src) {
      if (finished) return;
      finished = true;
      iframe.remove();
      done(src || "");
    }

    iframe.addEventListener("load", function () {
      setTimeout(function () {
        try {
          var doc = iframe.contentDocument || iframe.contentWindow.document;
          var images = Array.prototype.slice.call(doc.images || []);
          images.sort(function (a, b) {
            return imageScore(b) - imageScore(a);
          });
          finish(images.length && imageScore(images[0]) > -1 ? images[0].src : "");
        } catch (error) {
          finish("");
        }
      }, 450);
    });

    setTimeout(function () {
      finish("");
    }, 6000);

    iframe.src = pageUrl;
    document.body.appendChild(iframe);
  }

  function repairPortfolioPreviews() {
    var seen = {};
    Array.prototype.slice.call(document.querySelectorAll("a[href]")).forEach(function (link) {
      if (!isPortfolioCaseLink(link)) return;
      var slug = getSlug(link.href);
      if (seen[slug]) return;
      seen[slug] = true;

      var card = getCard(link);
      var title = (card && (card.querySelector("h2, h3, h4") || card).textContent || link.textContent || "Website preview").trim();

      if (cache[slug]) {
        applyPreview(card, cache[slug], title);
        return;
      }

      extractPreview(link.href, function (src) {
        if (!src) return;
        cache[slug] = src;
        saveCache();
        applyPreview(card, src, title);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", repairPortfolioPreviews);
  } else {
    repairPortfolioPreviews();
  }
  window.addEventListener("load", repairPortfolioPreviews);
})();



