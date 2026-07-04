(function(){
  const tagCopy = {
    "Accounting": ["accounting website experience centered on trust, expertise, service clarity, and consultation paths.", "Grow Your Accounting Firm Online", "Showcase services, credentials, industries served, resources, and consultation paths."],
    "Automotive": ["automotive website experience centered on services, inventory or repairs, trust, and appointment paths.", "Grow Your Automotive Business Online", "Showcase services, vehicles, specials, reviews, and appointment requests."],
    "Business": ["business website experience centered on trust, service clarity, brand story, and practical next steps.", "Grow Your Business Online", "Showcase services, story, proof, and conversion paths with a website built for customers."],
    "Dental": ["dental website experience centered on patient trust, services, appointment paths, and local visibility.", "Grow Your Dental Practice Online", "Showcase services, providers, patient resources, locations, and appointment requests."],
    "Driving School": ["driving school website experience centered on courses, trust, schedules, and enrollment paths.", "Grow Your Driving School Online", "Showcase courses, instructors, schedules, pricing, reviews, and enrollment paths."],
    "Ecommerce": ["ecommerce website experience centered on product discovery, trust, simple navigation, and shopping paths.", "Grow Your Ecommerce Business Online", "Showcase products, categories, promotions, brand story, and shopping paths."],
    "Education": ["education website experience centered on programs, trust, resources, and inquiry paths.", "Grow Your Education Organization Online", "Showcase programs, outcomes, resources, enrollment details, and contact paths."],
    "Energy": ["energy website experience centered on solutions, savings, trust, and consultation paths.", "Grow Your Energy Business Online", "Showcase solutions, products, benefits, service areas, and consultation requests."],
    "Healthcare": ["healthcare website experience centered on trust, services, patient education, and appointment paths.", "Grow Your Healthcare Practice Online", "Showcase care services, providers, patient resources, locations, and appointment paths."],
    "Home Services": ["home services website experience centered on trust, service clarity, local proof, and quote paths.", "Grow Your Home Services Business Online", "Showcase services, service areas, reviews, project proof, and quote requests."],
    "HVAC": ["HVAC website experience centered on emergency service visibility, comfort solutions, trust, and appointments.", "Grow Your HVAC Business Online", "Showcase heating, cooling, indoor air quality, service areas, reviews, and appointment requests."],
    "Legal": ["legal website experience centered on credibility, practice areas, trust, and consultation paths.", "Grow Your Law Firm Online", "Showcase practice areas, attorney credibility, client resources, and consultation paths."],
    "Nonprofit": ["nonprofit website experience centered on mission, impact, trust, and donation or volunteer paths.", "Grow Your Nonprofit Online", "Showcase mission, programs, impact, events, donations, and volunteer opportunities."],
    "Pet Services": ["pet services website experience centered on trust, care details, services, and booking paths.", "Grow Your Pet Services Business Online", "Showcase services, care details, reviews, locations, and booking requests."],
    "Plumbing": ["plumbing website experience centered on urgent service needs, trust, service categories, and contact paths.", "Grow Your Plumbing Business Online", "Showcase plumbing services, emergency support, service areas, reviews, and quote requests."],
    "Professional Services": ["professional services website experience centered on expertise, trust, service clarity, and lead generation.", "Grow Your Professional Services Business Online", "Showcase services, expertise, proof, resources, and consultation paths."],
    "Real Estate": ["real estate website experience centered on listings, local expertise, trust, and lead generation.", "Grow Your Real Estate Business Online", "Showcase properties, communities, agent expertise, and buyer or seller inquiry paths."],
    "Restaurant": ["restaurant website experience centered on menus, locations, trust, and ordering paths.", "Grow Your Restaurant Online", "Showcase menus, location, story, ordering, reservations, and customer next steps."],
    "Retail": ["retail website experience centered on products, promotions, brand trust, and shopping paths.", "Grow Your Retail Business Online", "Showcase products, categories, promotions, store details, and shopping paths."],
    "Roofing": ["roofing website experience centered on service clarity, trust, project proof, and quote paths.", "Grow Your Roofing Business Online", "Showcase roofing services, service areas, reviews, project proof, and quote requests."],
    "Salon & Beauty": ["salon and beauty website experience centered on services, style, trust, and appointment booking.", "Grow Your Beauty Business Online", "Showcase services, pricing, galleries, team members, reviews, and booking paths."],
    "Security": ["security website experience centered on protection services, trust, credibility, and consultation paths.", "Grow Your Security Business Online", "Showcase services, industries served, proof, response capabilities, and contact paths."],
    "Tattoo": ["tattoo website experience centered on artist portfolios, studio trust, booking paths, and service presentation.", "Grow Your Tattoo Studio Online", "Showcase artists, portfolios, studio information, reviews, booking paths, and service details."],
    "Technology": ["technology website experience centered on solutions, credibility, product clarity, and conversion paths.", "Grow Your Technology Business Online", "Showcase solutions, features, use cases, proof, and demo or contact paths."],
    "Travel": ["travel website experience centered on destinations, experiences, trust, and booking paths.", "Grow Your Travel Business Online", "Showcase destinations, packages, experiences, reviews, and booking paths."],
    "Water Treatment": ["water treatment website experience centered on solutions, trust, product clarity, and appointments.", "Grow Your Water Treatment Business Online", "Showcase products, services, service areas, reviews, and appointment requests."]
  };

  const slugify = v => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const rows = window.webactPortfolioAll || window.webactPortfolioDataAll || window.portfolioDataAll || [];

  const tagMap = {};
  rows.forEach(row => {
    if(Array.isArray(row) && row[0] && row[1]){
      tagMap[slugify(row[0])] = row[1];
    }
  });

  const projectSlug = new URLSearchParams(location.search).get("project") || "";
  const projectName = rows.find(row => Array.isArray(row) && slugify(row[0]) === projectSlug)?.[0] || document.querySelector("h1")?.textContent?.trim() || "This project";
  const tag = tagMap[projectSlug] || "Business";
  const copy = tagCopy[tag] || tagCopy.Business;

  window.webactPortfolioCaseStudyTag = tag;

  function applyTagCopy(){
    document.querySelectorAll("[data-industry], [data-category], .case-study-industry, .case-study-category, .portfolio-industry, .portfolio-category, .project-industry, .project-category").forEach(el => {
      el.textContent = tag;
    });

    document.querySelectorAll("p, div, span").forEach(el => {
      const text = el.textContent.trim();

      if(/^.+ presents a .+ website experience/i.test(text)){
        el.textContent = `${projectName} presents a ${copy[0]}`;
      }

      if(/^Showcase your .+ website/i.test(text) || /^Showcase .+ with a .+ website/i.test(text)){
        el.textContent = copy[2];
      }
    });

    document.querySelectorAll("h1,h2,h3").forEach(el => {
      if(/^Grow Your .+ Online/i.test(el.textContent.trim())){
        el.textContent = copy[1];
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    applyTagCopy();
    setTimeout(applyTagCopy, 300);
    setTimeout(applyTagCopy, 1000);
    setTimeout(applyTagCopy, 2000);
  });
})();
