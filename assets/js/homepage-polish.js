(function(){
  "use strict";

  function ready(fn){
    if(document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function hasGoogleReviews(){
    return !!document.querySelector(
      '.google-reviews, [class*="google"][class*="review"], [id*="google"][id*="review"], [class*="review"]'
    );
  }

  function findHero(){
    return document.querySelector(
      '.home-hero, .homepage-hero, .wa-hero, .hero, section[class*="hero"]'
    );
  }

  function insertTrustStrip(){
    if(document.querySelector(".wa-home-trust-strip")) return;

    const hero = findHero();
    if(!hero) return;

    const trust = document.createElement("div");
    trust.className = "wa-home-trust-strip";
    trust.innerHTML = `
      <div class="wa-home-trust-item"><strong>250+</strong><span>Website Projects</span></div>
      <div class="wa-home-trust-item"><strong>2012</strong><span>Helping Businesses Grow</span></div>
      <div class="wa-home-trust-item"><strong>USA</strong><span>Nationwide Clients</span></div>
      <div class="wa-home-trust-item"><strong>★★★★★</strong><span>Google Reviews</span></div>
    `;

    hero.insertAdjacentElement("afterend", trust);
  }

  function insertWhyWebAct(){
    if(document.querySelector(".wa-why-webact-polish")) return;

    const reviews = document.querySelector(
      '.google-reviews, [class*="google"][class*="review"], [id*="google"][id*="review"], [class*="review"]'
    );

    const services = document.querySelector(
      '.services-section, .home-services, [class*="services"]'
    );

    const anchor = reviews || services;
    if(!anchor || !anchor.parentNode) return;

    const section = document.createElement("section");
    section.className = "wa-why-webact-polish";
    section.innerHTML = `
      <div class="wa-why-webact-inner">
        <div class="wa-why-webact-heading">
          <span>Why Choose WebAct</span>
          <h2>Websites and marketing built to help businesses grow.</h2>
        </div>

        <div class="wa-why-webact-grid">
          <article class="wa-why-card">
            <div class="wa-why-icon">01</div>
            <h3>Custom Websites</h3>
            <p>Professional website design built around your brand, your customers, and your goals.</p>
          </article>

          <article class="wa-why-card">
            <div class="wa-why-icon">02</div>
            <h3>SEO Ready</h3>
            <p>Pages structured for visibility, local search, clear messaging, and stronger conversions.</p>
          </article>

          <article class="wa-why-card">
            <div class="wa-why-icon">03</div>
            <h3>Fast Performance</h3>
            <p>Clean layouts, focused content, and optimized experiences for desktop and mobile visitors.</p>
          </article>

          <article class="wa-why-card">
            <div class="wa-why-icon">04</div>
            <h3>US Based Support</h3>
            <p>Real support for businesses that need a long-term website and marketing partner.</p>
          </article>
        </div>
      </div>
    `;

    anchor.insertAdjacentElement("beforebegin", section);
  }

  function tightenFooterGap(){
    const footer = document.querySelector(".wa-global-footer, footer");
    if(!footer) return;

    let prev = footer.previousElementSibling;
    while(prev && prev.nodeType === 1 && prev.offsetHeight === 0){
      prev = prev.previousElementSibling;
    }

    if(prev){
      prev.classList.add("wa-before-footer");
      prev.style.marginBottom = "0";
      prev.style.paddingBottom = prev.className.toLowerCase().includes("scroll") || prev.className.toLowerCase().includes("marquee") ? "0" : prev.style.paddingBottom;
    }

    footer.style.marginTop = "0";
  }

  function equalizeServiceCards(){
    const groups = [
      document.querySelectorAll(".service-card"),
      document.querySelectorAll(".services-card"),
      document.querySelectorAll(".wa-service-card")
    ];

    groups.forEach(cards => {
      if(!cards || cards.length < 2) return;
      cards.forEach(card => card.style.minHeight = "");
      let max = 0;
      cards.forEach(card => { max = Math.max(max, card.offsetHeight); });
      if(max > 0) cards.forEach(card => card.style.minHeight = max + "px");
    });
  }

  ready(function(){
    insertTrustStrip();
    insertWhyWebAct();
    tightenFooterGap();
    equalizeServiceCards();

    window.addEventListener("resize", function(){
      equalizeServiceCards();
      tightenFooterGap();
    });
  });
})();
