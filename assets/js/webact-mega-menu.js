(function () {
  function closeAll(header) {
    header.querySelectorAll('.webact-nav-item.is-open').forEach(function (item) {
      item.classList.remove('is-open');
      var button = item.querySelector('.webact-nav-button');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  }

  document.querySelectorAll('[data-webact-mega-menu]').forEach(function (header) {
    if (header.dataset.webactMegaBound === 'true') return;
    header.dataset.webactMegaBound = 'true';

    var toggle = header.querySelector('.webact-mobile-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var isOpen = header.classList.toggle('is-mobile-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        if (!isOpen) closeAll(header);
      });
    }

    header.querySelectorAll('.webact-nav-button').forEach(function (button) {
      button.addEventListener('click', function (event) {
        if (window.matchMedia('(max-width: 1180px)').matches) {
          event.preventDefault();
        }
        var item = button.closest('.webact-nav-item');
        var wasOpen = item.classList.contains('is-open');
        closeAll(header);
        if (!wasOpen) {
          item.classList.add('is-open');
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', function (event) {
      if (!header.contains(event.target)) {
        header.classList.remove('is-mobile-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        closeAll(header);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        header.classList.remove('is-mobile-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        closeAll(header);
      }
    });
  });
})();
