/* WebAct non-destructive PageSpeed enhancements.
   Adds performance-safe attributes without removing page content or features. */
(function () {
  'use strict';

  function enhanceImages() {
    var images = document.querySelectorAll('img');
    images.forEach(function (img, index) {
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
      if (!img.hasAttribute('fetchpriority')) {
        img.setAttribute('fetchpriority', index === 0 ? 'high' : 'low');
      }
      if (index > 0 && !img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');

      if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
        var setDimensions = function () {
          if (!img.hasAttribute('width') && img.naturalWidth) img.setAttribute('width', String(img.naturalWidth));
          if (!img.hasAttribute('height') && img.naturalHeight) img.setAttribute('height', String(img.naturalHeight));
        };
        if (img.complete) setDimensions();
        else img.addEventListener('load', setDimensions, { once: true });
      }
    });
  }

  function enhanceIframes() {
    document.querySelectorAll('iframe').forEach(function (frame) {
      if (!frame.hasAttribute('loading')) frame.setAttribute('loading', 'lazy');
      if (!frame.hasAttribute('title')) frame.setAttribute('title', 'Embedded content');
    });
  }

  function improveUnnamedLinks() {
    document.querySelectorAll('a').forEach(function (link) {
      var visible = (link.textContent || '').trim();
      if (!visible && !link.hasAttribute('aria-label')) {
        var image = link.querySelector('img[alt]');
        var label = image && image.alt ? image.alt : link.getAttribute('href');
        if (label) link.setAttribute('aria-label', label);
      }
    });
  }

  function run() {
    enhanceImages();
    enhanceIframes();
    improveUnnamedLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
}());
