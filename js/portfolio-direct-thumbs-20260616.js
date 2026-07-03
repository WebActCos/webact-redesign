(function () {
  if (window.__webactPortfolioDirectThumbs20260616) return;
  window.__webactPortfolioDirectThumbs20260616 = true;

  const base = "https://lirp.cdn-website.com/7b94e9c3/dms3rep/multi/opt/";
  const names = {
    "aid-the-children": "Aid the Children",
    "all-concrete-works-landscaping": "All Concrete Works & Landscaping",
    "american-sewer": "American Sewer",
    "apex-denver-locksmith": "Apex Denver Locksmith",
    "bayou-solar": "Bayou Solar",
    "beltway-home-inspections": "Beltway Home Inspections",
    "board-game-republic": "Board Game Republic",
    "brick-house-salon": "Brick House Salon",
    "budget-control-services": "Budget Control Services",
    "carie-s-posing-suits": "Carie's Posing Suits",
    "cass-and-company-salon": "Cass and Company Salon",
    "castle-rock": "Castle Rock",
    "century-tire-inc": "Century Tire Inc",
    "christy-root-designs": "Christy Root Designs",
    "coastal-homes": "Coastal Homes",
    "college-planning-coach": "College Planning Coach",
    "colorado-creditor-bar-association": "Colorado Creditor Bar Association",
    "crest-pest-control": "Crest Pest Control",
    "curved-glass-creations": "Curved Glass Creations",
    "d-and-d-machinery-movers": "D and D Machinery Movers",
    "deannas-papillons": "Deannas Papillons",
    "dental-arts": "Dental Arts",
    "denver-s-best-heating": "Denvers Best Heating",
    "denvers-best-heating": "Denvers Best Heating",
    "denver-issa": "Denver ISSA",
    "denver-sign-factory": "Denver Sign Factory",
    "denver-towing": "Denver Towing",
    "desert-empire": "Desert Empire",
    "dominion-craftsman-services": "Dominion Craftsman Services",
    "driving-instructor-classes": "Driving Instructor Classes",
    "dss-by-kat": "DSS by Kat",
    "e-sports-foundation": "E Sports Foundation",
    "ebony-equines": "Ebony Equines",
    "ed-prevost": "Ed Prevost",
    "edmotnton-heritage-festival": "Edmonton Heritage Festival",
    "einstein-plumbing": "Einstein Plumbing",
    "emergency-locksmith-denver": "Emergency Locksmith Denver",
    "epic-ivy": "Epic Ivy",
    "epleyer": "Epleyer",
    "evans-legal-group": "Evans Legal Group",
    "express-shipping-room-supply": "Express Shipping Room Supply",
    "extreme-autoworks": "Extreme Autoworks",
    "fine-arts-movement": "Fine Arts Movement",
    "finding-the-fantastic": "Finding the Fantastic",
    "firm-group": "Firm Group",
    "fr-bumper-solutions": "FR Bumper Solutions",
    "gangle-law-firm": "Gangle Law Firm",
    "genius-coaching": "Genius Coaching",
    "ghost-town-fitness": "Ghost Town Fitness",
    "glass-act": "Glass Act",
    "good-water": "Good Water",
    "granite-state-labradoodles": "Granite State Labradoodles",
    "great-escape": "Great Escape",
    "grin-barrett-charity-ride": "Grin Barrett Charity Ride",
    "heritage-roofing": "Heritage Roofing",
    "hi-dessert-egg": "Hi Desert Egg",
    "home-pro-chesapeake": "HomePro Chesapeake",
    "houston-energy-systems": "Houston Energy Systems",
    "insightifi": "Insightifi",
    "ironside-capital": "Ironside Capital",
    "jack-lewis": "Jack Lewis",
    "karma-tour-hawaii": "Karma Tour Hawaii",
    "kinetico-denver": "Kinetico Denver",
    "linda-wang": "Linda Wang",
    "little-caesars-pueblo": "Little Caesars Pueblo",
    "lower-lake-ranch": "Lower Lake Ranch",
    "manor-house-apartments": "Manor House Apartments",
    "mdt-transit": "MDT Transit",
    "meadow-hills": "Meadow Hills",
    "meditouch": "Meditouch",
    "mindful-minds-psychiatry": "Mindful Minds Psychiatry",
    "mile-high-books": "Mile High Books",
    "parkingboxx": "ParkingBoxx",
    "paw-power-agility-equipment": "Paw Power Agility Equipment",
    "peace-of-mind-pest-services": "Peace of Mind Pest Services",
    "pork-chop-s-truck-and-auto": "Pork Chop's Truck and Auto",
    "pride-swagger": "Pride Swagger",
    "roof-ready": "Roof Ready",
    "sage-restaurant": "Sage Restaurant",
    "salinas-valley-fair": "Salinas Valley Fair",
    "skin-care-essentials": "Skin Care Essentials",
    "spring-fresh": "Spring Fresh",
    "stephanie-ascari": "Stephanie Ascari",
    "sukoon": "Sukoon",
    "tala-wellness": "Tala Wellness",
    "the-executive-center": "Executive Center",
    "tipping-hat": "Tipping Hat",
    "trevey": "Trevey",
    "tropical-remodel-solutions": "Tropical Remodel Solutions",
    "turf-magic": "Turf Magic",
    "us-green": "US Green",
    "vacation-rentals": "Vacation Rentals",
    "way-cool-gaming": "Way Cool Gaming",
    "winston-c-throgmorton": "Winston C Throgmorton",
    "z-xg": "Z XG"
  };

  const exact = {
    "carie-s-posing-suits": "Carie%27s+Posing+Suits-640w.png",
    "pork-chop-s-truck-and-auto": "Pork+Chop%27s+Truck+and+Auto-640w.png",
    "denver-s-best-heating": "Denvers+Best+Heating-640w.png",
    "denvers-best-heating": "Denvers+Best+Heating-640w.png",
    "the-executive-center": "Executive+Center-640w.png"
  };

  const style = document.createElement("style");
  style.textContent = `
    .webact-live-portfolio-thumb {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      min-height: 260px !important;
      object-fit: cover !important;
      border: 0 !important;
      border-radius: inherit !important;
      background: #eef7fb !important;
    }
    .webact-live-portfolio-shell {
      padding: 0 !important;
      overflow: hidden !important;
      min-height: 260px !important;
      background: #eef7fb !important;
      display: block !important;
    }
    .webact-live-portfolio-shell > :not(.webact-live-portfolio-thumb) {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  function imgUrl(slug) {
    if (exact[slug]) return base + exact[slug];
    const name = names[slug];
    if (!name) return "";
    return base + name
      .replace(/&/g, "%26")
      .replace(/'/g, "%27")
      .replace(/\s+/g, "+") + "-640w.png";
  }

  function slugFromHref(href) {
    if (!href) return "";
    const clean = href.split("#")[0].split("?")[0].replace(/\\/g, "/");
    const parts = clean.split("/").filter(Boolean);
    const portfolioIndex = parts.lastIndexOf("portfolio");
    if (portfolioIndex >= 0 && parts[portfolioIndex + 1]) return parts[portfolioIndex + 1].replace(/\.html$/i, "");
    const last = parts[parts.length - 1] || "";
    if (last && last !== "index.html") return last.replace(/\.html$/i, "");
    return parts[parts.length - 2] || "";
  }

  function nearestCard(el) {
    let node = el;
    for (let i = 0; node && i < 9; i += 1, node = node.parentElement) {
      const hasPortfolioLink = node.querySelector && node.querySelector('a[href*="portfolio"]');
      const hasPlaceholder = node.textContent && node.textContent.indexOf("Website Preview") !== -1;
      if (hasPortfolioLink && hasPlaceholder) return node;
      if (hasPortfolioLink && /card|item|portfolio|case/i.test(node.className || "")) return node;
    }
    return el.parentElement || el;
  }

  function mediaTarget(card) {
    const placeholder = Array.from(card.querySelectorAll("*")).find((el) => {
      const text = (el.textContent || "").trim();
      return text === "Website Preview" || (text.includes("Website Preview") && el.children.length < 4);
    });
    if (placeholder) return placeholder;

    const brokenImg = Array.from(card.querySelectorAll("img")).find((img) => {
      return !img.getAttribute("src") || /placeholder|preview|blank|transparent/i.test(img.getAttribute("src") || "");
    });
    if (brokenImg) return brokenImg;

    return card.querySelector(".portfolio-media, .portfolio-image, .case-media, picture, figure") || card;
  }

  function installThumb(target, slug) {
    const url = imgUrl(slug);
    if (!url || !target || target.dataset.webactPortfolioFixed === slug) return;

    target.dataset.webactPortfolioFixed = slug;
    if (target.tagName === "IMG") {
      target.src = url;
      target.alt = (names[slug] || "Portfolio") + " website preview";
      target.classList.add("webact-live-portfolio-thumb");
      return;
    }

    const image = document.createElement("img");
    image.src = url;
    image.alt = (names[slug] || "Portfolio") + " website preview";
    image.loading = "lazy";
    image.className = "webact-live-portfolio-thumb";
    target.classList.add("webact-live-portfolio-shell");
    target.replaceChildren(image);
  }

  function repair() {
    document.querySelectorAll('a[href*="portfolio"]').forEach((link) => {
      const slug = slugFromHref(link.getAttribute("href"));
      if (!names[slug] && !exact[slug]) return;
      const card = nearestCard(link);
      installThumb(mediaTarget(card), slug);
    });

    Array.from(document.querySelectorAll("*")).forEach((el) => {
      const text = (el.textContent || "").trim();
      if (text !== "Website Preview") return;
      const card = nearestCard(el);
      const link = card.querySelector && card.querySelector('a[href*="portfolio"]');
      const slug = link ? slugFromHref(link.getAttribute("href")) : "";
      if (slug && (names[slug] || exact[slug])) installThumb(el, slug);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", repair);
  } else {
    repair();
  }
  window.addEventListener("load", repair);
  setTimeout(repair, 250);
  setTimeout(repair, 1000);
})();


