(function(){
  const copy = {
    "Ecommerce": {
      intro: "%%NAME%% presents an ecommerce website experience centered on product discovery, simple navigation, trust, and clear shopping paths for customers.",
      heading: "Grow Your Ecommerce Business Online",
      body: "Showcase products, categories, promotions, brand story, and shopping paths with an ecommerce website built for customers."
    },
    "Restaurant": {
      intro: "%%NAME%% presents a restaurant website experience centered on trust, simple navigation, menus, location details, and practical next steps for visitors.",
      heading: "Grow Your Restaurant Online",
      body: "Showcase your menu, location, story, and ordering path with a restaurant website built for customers."
    },
    "Roofing": {
      intro: "%%NAME%% presents a roofing website experience centered on service clarity, trust, project credibility, and quote-focused next steps.",
      heading: "Grow Your Roofing Business Online",
      body: "Showcase roofing services, service areas, reviews, project proof, and quote requests with a website built for local customers."
    },
    "Dental": {
      intro: "%%NAME%% presents a dental website experience centered on patient trust, clear services, appointment paths, and local visibility.",
      heading: "Grow Your Dental Practice Online",
      body: "Showcase services, providers, patient resources, location details, and appointment requests with a dental website built for patients."
    },
    "Healthcare": {
      intro: "%%NAME%% presents a healthcare website experience centered on trust, services, patient education, and simple appointment paths.",
      heading: "Grow Your Healthcare Practice Online",
      body: "Showcase care services, providers, patient resources, locations, and appointment paths with a healthcare website built for patients."
    },
    "Home Services": {
      intro: "%%NAME%% presents a home services website experience centered on trust, service clarity, local proof, and quote-focused next steps.",
      heading: "Grow Your Home Services Business Online",
      body: "Showcase services, service areas, reviews, project proof, and quote requests with a website built for local customers."
    }
  };

  const normalize = value => String(value || "").trim();
  const slugify = value => normalize(value).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

  function allProjects(){
    return []
      .concat(window.webactPortfolioProjects || [])
      .concat(window.webactPortfolioAll || [])
      .concat(window.webactPortfolioMasterData || [])
      .concat(window.portfolioMasterData || []);
  }

  function projectNameFromPage(){
    const params = new URLSearchParams(location.search);
    const slug = params.get("project") || "";
    const project = allProjects().find(item => {
      const name = Array.isArray(item) ? item[0] : (item.name || item.title);
      const itemSlug = Array.isArray(item) ? slugify(item[0]) : (item.slug || slugify(name));
      return itemSlug === slug;
    });
    return project ? (Array.isArray(project) ? project[0] : (project.name || project.title)) : "";
  }

  function projectTag(name){
    const project = allProjects().find(item => {
      const itemName = Array.isArray(item) ? item[0] : (item.name || item.title);
      return slugify(itemName) === slugify(name);
    });

    if(!project) return "";

    return Array.isArray(project)
      ? normalize(project[1])
      : normalize(project.category || project.industry || project.tag || project.type);
  }

  function applyCopy(){
    const name = projectNameFromPage();
    if(!name) return;

    const tag = projectTag(name);
    if(!tag) return;

    const template = copy[tag] || {
      intro: "%%NAME%% presents a " + tag.toLowerCase() + " website experience centered on trust, simple navigation, service clarity, and practical next steps for visitors.",
      heading: "Grow Your " + tag + " Business Online",
      body: "Showcase your services, story, proof, and conversion paths with a " + tag.toLowerCase() + " website built for customers."
    };

    document.querySelectorAll('[data-industry], [data-category], .case-study-industry, .case-study-category, .portfolio-industry, .portfolio-category, .project-industry, .project-category').forEach(el => {
      el.textContent = tag;
    });

    document.querySelectorAll("p").forEach(el => {
      if(/presents a .* website experience/i.test(el.textContent)){
        el.textContent = template.intro.replace("%%NAME%%", name);
      }
      if(/Showcase your .* website/i.test(el.textContent)){
        el.textContent = template.body;
      }
    });

    document.querySelectorAll("h1,h2,h3").forEach(el => {
      if(/Grow Your .* Online/i.test(el.textContent)){
        el.textContent = template.heading;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    applyCopy();
    setTimeout(applyCopy, 250);
    setTimeout(applyCopy, 900);
  });
})();
