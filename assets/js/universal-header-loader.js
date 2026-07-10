(function () {
  function basePath() {
    return window.location.pathname.indexOf("/") === 0 ? "/webact-redesign" : "";
  }

  function loadHeader() {
    var target = document.getElementById("webact-header");
    if (!target) return;

    fetch(basePath() + "/includes/header.html", { cache: "no-cache" })
      .then(function (res) { return res.text(); })
      .then(function (html) {
        target.innerHTML = html;

        if (window.WebActPromodoNav && typeof window.WebActPromodoNav.init === "function") {
          window.WebActPromodoNav.init();
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadHeader);
  } else {
    loadHeader();
  }
})();