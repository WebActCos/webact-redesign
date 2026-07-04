(function(){
  const slugify = v => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

  const copyByTag = {
    "Tattoo": ["tattoo website experience centered on artist portfolios, studio trust, booking paths, and service presentation.", "Grow Your Tattoo Studio Online", "Showcase artists, portfolios, studio information, reviews, booking paths, and service details."],
    "Ecommerce": ["ecommerce website experience centered on product discovery, simple navigation, trust, and shopping paths.", "Grow Your Ecommerce Business Online", "Showcase products, categories, promotions, brand story, and shopping paths."],
    "Restaurant": ["restaurant website experience centered on menus, locations, trust, and ordering paths.", "Grow Your Restaurant Online", "Showcase menus, location, story, ordering, reservations, and customer next steps."],
    "Business": ["business website experience centered on trust, service clarity, brand story, and practical next steps.", "Grow Your Business Online", "Showcase services, story, proof, and conversion paths with a website built for customers."]
  };

  async function getTagFromData(){
    const slug = new URLSearchParams(location.search).get("project") || "";
    const res = await fetch("../js/portfolio-data-all.js", { cache: "no-store" });
    const text = await res.text();

    const matches = [...text.matchAll(/\["([^"]+)","([^"]+)"/g)];
    for(const match of matches){
      if(slugify(match[1]) === slug){
        return { name: match[1], tag: match[2] };
      }
    }
    return null;
  }

  function patchText(name, tag){
    const copy = copyByTag[tag] || [
      `${tag.toLowerCase()} website experience centered on trust, service clarity, brand story, and practical next steps.`,
      `Grow Your ${tag} Business Online`,
      `Showcase services, story, proof, and conversion paths with a ${tag.toLowerCase()} website built for customers.`
    ];

    document.querySelectorAll("*").forEach(el => {
      if(el.children.length) return;

      const text = el.textContent.trim();
      if(!text || text.length > 300) return;

      if(/^(Restaurant|Business|Ecommerce|Tattoo|Dental|Healthcare|Roofing|HVAC|Plumbing|Legal|Professional Services|Home Services)$/.test(text)){
        el.textContent = tag;
      }

      if(/presents a .* website experience/i.test(text)){
        el.textContent = `${name} presents a ${copy[0]}`;
      }

      if(/Grow Your .* Online/i.test(text)){
        el.textContent = copy[1];
      }

      if(/Showcase .* website/i.test(text)){
        el.textContent = copy[2];
      }
    });
  }

  async function run(){
    const data = await getTagFromData();
    if(!data) return;
    patchText(data.name, data.tag);
  }

  document.addEventListener("DOMContentLoaded", function(){
    run();
    setTimeout(run, 500);
    setTimeout(run, 1500);
    setTimeout(run, 3000);
  });
})();
