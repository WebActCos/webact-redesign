(function(){
  const copy = {
    "Ecommerce": ["ecommerce website experience centered on product discovery, simple navigation, trust, and clear shopping paths for customers.", "Grow Your Ecommerce Business Online", "Showcase products, categories, promotions, brand story, and shopping paths with an ecommerce website built for customers."],
    "Restaurant": ["restaurant website experience centered on menus, location details, trust, and practical next steps for visitors.", "Grow Your Restaurant Online", "Showcase your menu, location, story, and ordering path with a restaurant website built for customers."],
    "Dental": ["dental website experience centered on patient trust, clear services, appointment paths, and local visibility.", "Grow Your Dental Practice Online", "Showcase services, providers, patient resources, location details, and appointment requests with a dental website built for patients."],
    "Healthcare": ["healthcare website experience centered on trust, services, patient education, and simple appointment paths.", "Grow Your Healthcare Practice Online", "Showcase care services, providers, patient resources, locations, and appointment paths with a healthcare website built for patients."],
    "Home Services": ["home services website experience centered on trust, service clarity, local proof, and quote-focused next steps.", "Grow Your Home Services Business Online", "Showcase services, service areas, reviews, project proof, and quote requests with a website built for local customers."],
    "Roofing": ["roofing website experience centered on service clarity, trust, project credibility, and quote-focused next steps.", "Grow Your Roofing Business Online", "Showcase roofing services, service areas, reviews, project proof, and quote requests with a website built for local customers."],
    "HVAC": ["HVAC website experience centered on emergency service visibility, trust, comfort solutions, and quote-focused next steps.", "Grow Your HVAC Business Online", "Showcase heating, cooling, indoor air quality, service areas, reviews, and appointment requests."],
    "Plumbing": ["plumbing website experience centered on urgent service needs, trust, clear service categories, and easy contact paths.", "Grow Your Plumbing Business Online", "Showcase plumbing services, emergency support, service areas, reviews, and quote requests."],
    "Legal": ["legal website experience centered on credibility, practice areas, trust, and consultation-focused next steps.", "Grow Your Law Firm Online", "Showcase practice areas, attorney credibility, client resources, and consultation paths."],
    "Real Estate": ["real estate website experience centered on listings, local expertise, trust, and lead generation.", "Grow Your Real Estate Business Online", "Showcase properties, communities, agent expertise, and buyer or seller inquiry paths."],
    "Education": ["education website experience centered on programs, trust, student resources, and inquiry paths.", "Grow Your Education Organization Online", "Showcase programs, resources, outcomes, enrollment details, and contact paths."],
    "Pet Services": ["pet services website experience centered on trust, care details, services, and easy booking paths.", "Grow Your Pet Services Business Online", "Showcase services, care details, reviews, locations, and booking requests."],
    "Automotive": ["automotive website experience centered on services, inventory or repairs, trust, and appointment paths.", "Grow Your Automotive Business Online", "Showcase services, vehicles, specials, reviews, and appointment requests."],
    "Technology": ["technology website experience centered on solutions, credibility, product clarity, and conversion paths.", "Grow Your Technology Business Online", "Showcase solutions, features, use cases, proof, and demo or contact paths."],
    "Professional Services": ["professional services website experience centered on expertise, trust, service clarity, and lead generation.", "Grow Your Professional Services Business Online", "Showcase services, expertise, proof, resources, and consultation paths."],
    "Nonprofit": ["nonprofit website experience centered on mission, trust, community impact, and donation or volunteer paths.", "Grow Your Nonprofit Online", "Showcase your mission, programs, impact, events, donation paths, and volunteer opportunities."],
    "Retail": ["retail website experience centered on products, promotions, brand trust, and shopping paths.", "Grow Your Retail Business Online", "Showcase products, categories, promotions, store details, and shopping paths."],
    "Salon & Beauty": ["salon and beauty website experience centered on services, style, trust, and appointment booking.", "Grow Your Beauty Business Online", "Showcase services, pricing, galleries, team members, reviews, and booking paths."],
    "Printing & Graphics": ["printing and graphics website experience centered on services, portfolio proof, quote requests, and local visibility.", "Grow Your Printing & Graphics Business Online", "Showcase services, samples, capabilities, turnaround details, and quote requests."],
    "Water Treatment": ["water treatment website experience centered on services, trust, product clarity, and consultation paths.", "Grow Your Water Treatment Business Online", "Showcase solutions, products, service areas, reviews, and appointment requests."],
    "Driving School": ["driving school website experience centered on programs, schedules, trust, and enrollment paths.", "Grow Your Driving School Online", "Showcase courses, instructors, schedules, pricing, reviews, and enrollment paths."],
    "Security": ["security website experience centered on trust, protection services, credibility, and consultation paths.", "Grow Your Security Business Online", "Showcase services, industries served, proof, response capabilities, and contact paths."],
    "Energy": ["energy website experience centered on solutions, savings, trust, and consultation paths.", "Grow Your Energy Business Online", "Showcase services, products, benefits, service areas, and consultation requests."],
    "Travel": ["travel website experience centered on destinations, experiences, trust, and booking paths.", "Grow Your Travel Business Online", "Showcase destinations, packages, experiences, reviews, and booking paths."],
    "Business": ["business website experience centered on trust, service clarity, brand story, and practical next steps for visitors.", "Grow Your Business Online", "Showcase your services, story, proof, and conversion paths with a website built for customers."]
  };

  const slugify = v => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const clean = v => String(v || "").trim();

  function getAllProjects(){
    return []
      .concat(window.webactPortfolioProjects || [])
      .concat(window.webactPortfolioAll || [])
      .concat(window.webactPortfolioMasterData || [])
      .concat(window.portfolioMasterData || []);
  }

  function getCurrentProject(){
    const slug = new URLSearchParams(location.search).get("project") || "";
    return getAllProjects().find(item => {
      const name = Array.isArray(item) ? item[0] : (item.name || item.title || "");
      const itemSlug = Array.isArray(item) ? slugify(item[0]) : clean(item.slug || slugify(name));
      return itemSlug === slug;
    });
  }

  function getName(project){
    return Array.isArray(project) ? clean(project[0]) : clean(project?.name || project?.title);
  }

  function getTag(project){
    return Array.isArray(project)
      ? clean(project[1])
      : clean(project?.category || project?.industry || project?.tag || project?.type);
  }

  function applyCaseStudyCopy(){
    const project = getCurrentProject();
    if(!project) return;

    const name = getName(project);
    const tag = getTag(project);
    if(!name || !tag) return;

    const row = copy[tag] || copy.Business;
    const intro = `${name} presents a ${row[0]}`;
    const heading = row[1];
    const body = row[2];

    document.querySelectorAll('[data-industry], [data-category], .case-study-industry, .case-study-category, .portfolio-industry, .portfolio-category, .project-industry, .project-category').forEach(el => {
      el.textContent = tag;
    });

    document.querySelectorAll("p, span, div").forEach(el => {
      const t = el.textContent.trim();

      if(/^.+ presents a .+ website experience/i.test(t)){
        el.textContent = intro;
      }

      if(/^Showcase your .+ website/i.test(t) || /^Showcase .+ with a .+ website/i.test(t)){
        el.textContent = body;
      }
    });

    document.querySelectorAll("h1,h2,h3").forEach(el => {
      if(/^Grow Your .+ Online/i.test(el.textContent.trim())){
        el.textContent = heading;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    applyCaseStudyCopy();
    setTimeout(applyCaseStudyCopy, 300);
    setTimeout(applyCaseStudyCopy, 1000);
    setTimeout(applyCaseStudyCopy, 2000);
  });
})();
