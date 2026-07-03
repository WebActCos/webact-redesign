document.addEventListener('DOMContentLoaded', function () {
  var images = document.querySelectorAll('.portfolio-thumb img, .case-image img');
  images.forEach(function (image) {
    image.addEventListener('error', function () {
      var label = image.getAttribute('alt') || 'Portfolio image';
      var box = document.createElement('span');
      box.className = 'portfolio-fallback';
      box.textContent = label.replace(' website design screenshot', '').replace(' website screenshot', '');
      image.parentNode.replaceChild(box, image);
    }, { once: true });
  });
});
