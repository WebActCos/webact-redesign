(function(){
  const copyByTag = {
    "Tattoo": ["tattoo website experience centered on artist portfolios, studio trust, booking paths, and service presentation.", "Grow Your Tattoo Studio Online", "Showcase artists, portfolios, studio information, reviews, booking paths, and service details."],
    "Ecommerce": ["ecommerce website experience centered on product discovery, simple navigation, trust, and shopping paths.", "Grow Your Ecommerce Business Online", "Showcase products, categories, promotions, brand story, and shopping paths."],
    "Restaurant": ["restaurant website experience centered on menus, locations, trust, and ordering paths.", "Grow Your Restaurant Online", "Showcase menus, location, story, ordering, reservations, and customer next steps."],
    "Business": ["business website experience centered on trust, service clarity, brand story, and practical next steps.", "Grow Your Business Online", "Showcase services, story, proof, and conversion paths with a website built for customers."]
  };

  const slugify = v => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const rows = window.webactPortfolioAll || window.webactPortfolioDataAll || window.portfolioDataAll || [];
  const slug = new URLSearchParams(location.search).get("project") || "";

  function getTag(){
    for(const row of rows){
      if(Array.isArray(row) && slugify(row[0]) === slug) return row[1];
    }
    return "";
  }

  function run(){
    const tag = getTag();
    if(!tag) return;

    const projectName = document.querySelector("h1")?.textContent?.trim() || "This project";
    const copy = copyByTag[tag] || [
      `${tag.toLowerCase()} website experience centered on trust, service clarity, brand story, and practical next steps.`,
      `Grow Your ${tag} Business Online`,
      `Showcase services, story, proof, and conversion paths with a ${tag.toLowerCase()} website built for customers.`
    ];

    document.querySelectorAll("*").forEach(el => {
      if(el.children.length) return;
      let text = el.textContent.trim();

      if(text === "Industry" || text.length > 250) return;

      if(/^(Restaurant|Business|Ecommerce|Tattoo|Dental|Healthcare|Roofing|HVAC|Plumbing|Legal)$/.test(text)){
        el.textContent = tag;
      }

      if(/presents a .* website experience/i.test(text)){
        el.textContent = `${projectName} presents a ${copy[0]}`;
      }

      if(/Grow Your .* Online/i.test(text)){
        el.textContent = copy[1];
      }

      if(/Showcase .* website/i.test(text)){
        el.textContent = copy[2];
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    run();
    setTimeout(run, 500);
    setTimeout(run, 1500);
  });
})();
