(function () {
  if (window.__webactPortfolioDirectThumbsFinal20260616) return;
  window.__webactPortfolioDirectThumbsFinal20260616 = true;

  const base = "https://lirp.cdn-website.com/7b94e9c3/dms3rep/multi/opt/";
  const names = {
    "aid-the-children": "Aid The Children",
    "all-concrete-works-landscaping": "All Concrete Works Landscaping",
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
    "e-sports-foundation": "E-Sports Foundation",
    "ebony-equines": "Ebony Equines",
    "ed-prevost": "Ed Prevost",
    "edmotnton-heritage-festival": "Edmonton Heritage Festival",
    "einstein-plumbing": "Einstein Plumbing",
    "emergency-locksmith-denver": "Emergency Locksmith Denver",
    "epic-ivy": "Epic Ivy",
    "epleyer": "ePleyer",
    "evans-legal-group": "Evans Legal Group",
    "express-shipping-room-supply": "Express Shipping Room Supply",
    "extreme-autoworks": "Extreme Autoworks",
    "fine-arts-movement": "Fine Arts Movement",
    "finding-the-fantastic": "Finding The Fantastic",
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
    "hi-dessert-egg": "Hi Dessert Egg",
    "home-pro-chesapeake": "Home Pro Chesapeake",
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
    "peace-of-mind-pest-services": "Peace Of Mind Pest Services",
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

  function slugFromHref(href) {
    const clean = String(href || "")
      .split("#")[0]
      .split("?")[0]
      .replace(/\/index\.html$/i, "")
      .replace(/\/$/, "");
    const parts = clean.split("/").filter(Boolean);
    return (parts.pop() || "").toLowerCase();
  }

  function imageUrl(slug) {
    if (exact[slug]) return base + exact[slug];
    if (!names[slug]) return "";
    return base + encodeURIComponent(names[slug]).replace(/%20/g, "+") + "-640w.png";
  }

  function cardLink(root) {
    if (!root || !root.querySelectorAll) return null;
    return Array.from(root.querySelectorAll("a[href]")).find(function (link) {
      const slug = slugFromHref(link.getAttribute("href"));
      return names[slug] || exact[slug];
    }) || null;
  }

  function nearestCard(el) {
    const selectors = [
      "article",
      "li",
      ".portfolio-card",
      ".project-card",
      ".case-study-card",
      "[class*='portfolio']",
      "[class*='project']",
      "[class*='card']"
    ];

    for (const selector of selectors) {
      const candidate = el.closest && el.closest(selector);
      if (candidate && cardLink(candidate)) return candidate;
    }

    let node = el.parentElement;
    let depth = 0;
    while (node && node !== document.body && depth < 8) {
      const links = Array.from(node.querySelectorAll("a[href]")).filter(function (link) {
        const slug = slugFromHref(link.getAttribute("href"));
        return names[slug] || exact[slug];
      });
      if (links.length === 1) return node;
      node = node.parentElement;
      depth += 1;
    }
    return null;
  }

  function installStyle() {
    if (document.getElementById("webact-portfolio-direct-thumbs-final-style")) return;
    const style = document.createElement("style");
    style.id = "webact-portfolio-direct-thumbs-final-style";
    style.textContent = `
      .webact-portfolio-thumb-shell {
        background: #f5fbff !important;
        border-radius: inherit !important;
        min-height: 250px !important;
        overflow: hidden !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .webact-portfolio-thumb-shell > :not(.webact-portfolio-live-thumb) {
        display: none !important;
      }
      .webact-portfolio-live-thumb {
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 250px !important;
        object-fit: contain !important;
        object-position: center !important;
        border: 0 !important;
        background: #f5fbff !important;
      }
    `;
    document.head.appendChild(style);
  }

  function replacePlaceholder(card, slug) {
    const src = imageUrl(slug);
    if (!card || !src) return;

    const already = card.querySelector(".webact-portfolio-live-thumb");
    if (already) {
      already.src = src;
      already.alt = (names[slug] || "Website") + " preview";
      return;
    }

    const placeholder = Array.from(card.querySelectorAll("div, figure, picture, span"))
      .find(function (el) {
        return /Website Preview/i.test(el.textContent || "");
      });
    const existingImage = card.querySelector("img");
    const target = placeholder || existingImage;
    if (!target) return;

    const shell = target.tagName === "IMG" ? target.parentElement : target;
    if (!shell) return;

    shell.classList.add("webact-portfolio-thumb-shell");
    shell.innerHTML = "";

    const img = document.createElement("img");
    img.className = "webact-portfolio-live-thumb";
    img.src = src;
    img.alt = (names[slug] || "Website") + " preview";
    img.loading = "lazy";
    img.decoding = "async";
    shell.appendChild(img);
  }

  function repairPortfolioThumbs() {
    installStyle();

    document.querySelectorAll("a[href]").forEach(function (link) {
      const slug = slugFromHref(link.getAttribute("href"));
      if (!names[slug] && !exact[slug]) return;
      const card = nearestCard(link);
      replacePlaceholder(card, slug);
    });

    Array.from(document.querySelectorAll("body *")).forEach(function (el) {
      if (!/Website Preview/i.test(el.textContent || "")) return;
      const card = nearestCard(el);
      const link = cardLink(card);
      if (!link) return;
      replacePlaceholder(card, slugFromHref(link.getAttribute("href")));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", repairPortfolioThumbs);
  } else {
    repairPortfolioThumbs();
  }

  window.addEventListener("load", repairPortfolioThumbs);
  setTimeout(repairPortfolioThumbs, 250);
  setTimeout(repairPortfolioThumbs, 1000);
})();



