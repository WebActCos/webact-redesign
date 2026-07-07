(function () {
  function closeAll(header) {
    header.querySelectorAll('.wa-promodo-item.is-open').forEach(function (item) {
      item.classList.remove('is-open');
      var button = item.querySelector('.wa-promodo-link');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-wa-nav]').forEach(function (header) {
      var toggle = header.querySelector('[data-wa-menu-toggle]');
      var menu = header.querySelector('[data-wa-menu]');
      if (toggle && menu) {
        toggle.addEventListener('click', function () {
          var isOpen = document.body.classList.toggle('wa-nav-open');
          toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          if (!isOpen) closeAll(header);
        });
      }

      header.querySelectorAll('.wa-promodo-link').forEach(function (button) {
        button.addEventListener('click', function (event) {
          if (window.matchMedia('(max-width: 1180px)').matches) {
            event.preventDefault();
            var item = button.closest('.wa-promodo-item');
            var wasOpen = item.classList.contains('is-open');
            closeAll(header);
            item.classList.toggle('is-open', !wasOpen);
            button.setAttribute('aria-expanded', !wasOpen ? 'true' : 'false');
          }
        });
      });
    });
  });
})();
