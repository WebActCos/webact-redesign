window.webactPortfolioContentEngine = (function () {
  function slugify(text) {
    return String(text || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function hashText(text) {
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = ((h << 5) - h) + text.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function pick(list, seed, count) {
    const copy = list.slice();
    const out = [];
    let s = seed || 1;
    while (copy.length && out.length < count) {
      const index = s % copy.length;
      out.push(copy.splice(index, 1)[0]);
      s = Math.floor(s / 7) + 17;
    }
    return out;
  }

  const industryMap = {
    restaurant: {
      audience: "local diners, takeout customers, catering customers, tourists, and mobile users searching nearby",
      needs: "Restaurant websites need clear menus, location information, ordering options, strong food presentation, reviews, and fast mobile access.",
      services: ["restaurant website design", "menu organization", "local SEO", "Google Business Profile support", "online ordering strategy", "review visibility", "mobile-first design", "conversion-focused calls to action"]
    },
    dental: {
      audience: "new patients, families, emergency dental patients, and people comparing dental providers",
      needs: "Dental websites need patient trust, treatment education, appointment paths, local search visibility, and clear explanations of services.",
      services: ["dental website design", "local SEO", "treatment page planning", "appointment conversion paths", "patient education content", "Google Ads strategy", "review management", "mobile-friendly design"]
    },
    dentist: {
      audience: "new patients, families, emergency dental patients, and people comparing dental providers",
      needs: "Dentist websites need patient trust, treatment education, appointment paths, local search visibility, and clear explanations of services.",
      services: ["dentist website design", "local SEO", "treatment page planning", "appointment conversion paths", "patient education content", "Google Ads strategy", "review management", "mobile-friendly design"]
    },
    legal: {
      audience: "people comparing attorneys, researching practice areas, and looking for consultation options",
      needs: "Legal websites need authority, practice area clarity, trust-building content, consultation calls to action, and local SEO.",
      services: ["law firm website design", "practice area pages", "local SEO", "consultation conversion strategy", "attorney credibility content", "Google Ads support", "lead generation", "mobile-friendly design"]
    },
    roofing: {
      audience: "homeowners, property managers, storm damage leads, and customers needing repairs or replacement",
      needs: "Roofing websites need service area visibility, estimate requests, emergency repair messaging, project proof, and strong local SEO.",
      services: ["roofing website design", "local SEO", "estimate request forms", "storm damage landing pages", "Google Ads support", "service area content", "review strategy", "mobile call paths"]
    },
    construction: {
      audience: "homeowners, builders, commercial clients, property managers, and customers comparing contractors",
      needs: "Construction websites need project credibility, service explanations, estimate paths, galleries, local visibility, and trust signals.",
      services: ["construction website design", "project gallery planning", "estimate conversion paths", "local SEO", "service area pages", "Google Ads support", "brand messaging", "mobile-friendly design"]
    },
    healthcare: {
      audience: "patients, families, caregivers, referral partners, and people researching care options",
      needs: "Healthcare websites need trust, clarity, service education, appointment paths, accessible content, and a calm user experience.",
      services: ["healthcare website design", "patient-friendly content", "local SEO", "appointment conversion paths", "service education pages", "reputation support", "mobile-friendly design", "content organization"]
    },
    "health care": {
      audience: "patients, families, caregivers, referral partners, and people researching care options",
      needs: "Health care websites need trust, clarity, service education, appointment paths, accessible content, and a calm user experience.",
      services: ["health care website design", "patient-friendly content", "local SEO", "appointment conversion paths", "service education pages", "reputation support", "mobile-friendly design", "content organization"]
    },
    ecommerce: {
      audience: "online shoppers, repeat customers, product researchers, and mobile buyers",
      needs: "Ecommerce websites need product clarity, shopping confidence, category structure, conversion strategy, and mobile purchase paths.",
      services: ["ecommerce website design", "product page planning", "category structure", "shopping conversion strategy", "SEO content", "digital advertising support", "mobile shopping UX", "landing page planning"]
    },
    hvac: {
      audience: "homeowners needing heating, cooling, repair, maintenance, or emergency service",
      needs: "HVAC websites need seasonal service visibility, emergency calls, local SEO, repair pages, and fast mobile contact paths.",
      services: ["HVAC website design", "local SEO", "service area pages", "emergency call paths", "Google Ads support", "seasonal landing pages", "review strategy", "mobile-friendly design"]
    },
    plumbing: {
      audience: "customers needing plumbing repairs, installation, drain cleaning, or emergency service",
      needs: "Plumbing websites need urgent service visibility, phone call paths, local SEO, service pages, and trust-building proof.",
      services: ["plumbing website design", "local SEO", "emergency service pages", "Google Ads support", "phone call conversion paths", "service area content", "review visibility", "mobile-friendly design"]
    },
    default: {
      audience: "customers researching services, comparing providers, and looking for a trusted business online",
      needs: "Business websites need clear messaging, professional design, mobile usability, SEO structure, and conversion-focused calls to action.",
      services: ["website design", "responsive design", "local SEO", "content organization", "Google Ads support", "landing page planning", "brand messaging", "website support"]
    }
  };

  function getIndustry(industry) {
    return industryMap[String(industry || "").toLowerCase()] || industryMap.default;
  }

  function generate(row, allRows) {
    const name = row[0] || "Portfolio Project";
    const industry = row[1] || "Business";
    const image = row[2] || "/Resources/images/placeholder.png";
    const seed = hashText(name + industry);
    const plan = getIndustry(industry);
    const services = pick(plan.services, seed, 6);

    const related = allRows
      .filter(r => r[1] === industry && slugify(r[0]) !== slugify(name))
      .slice(0, 6);

    return {
      name,
      industry,
      image,
      title: name + " Website Design Case Study",
      category: industry + " Website Design",
      summary: name + " is a WebAct " + industry.toLowerCase() + " website design case study built for " + plan.audience + ". The project highlights how WebAct uses website design, SEO, digital marketing, and customer-focused page strategy to help businesses create a stronger online presence.",
      sections: [
        {
          eyebrow: "Project Overview",
          title: "A stronger website presence for " + name + ".",
          text: "For " + name + ", WebAct focused on building a website experience that helps visitors quickly understand the business, its services, and the next step to take. In the " + industry.toLowerCase() + " industry, customers often compare several options before making contact, so the site needed to support credibility, clarity, and action. The project combines professional design, responsive layouts, organized content, and search-friendly page structure."
        },
        {
          eyebrow: "Industry Strategy",
          title: "Why " + industry.toLowerCase() + " businesses need a strong website.",
          text: plan.needs + " For " + name + ", the website needed to do more than look modern. It needed to communicate trust, organize service information, support mobile users, and give potential customers a clear reason to contact the business."
        },
        {
          eyebrow: "Website Design Services",
          title: "Website design built around customer action.",
          text: "WebAct planned the design around usability, brand trust, and conversion. The layout helps visitors move from the homepage into relevant content without confusion. Navigation, headings, visual hierarchy, page flow, and call-to-action placement were all considered so the site could support real business goals instead of simply acting as an online brochure."
        },
        {
          eyebrow: "SEO Strategy",
          title: "Search-friendly structure for long-term visibility.",
          text: "The SEO direction for " + name + " focuses on industry relevance, clear headings, service-focused language, internal page structure, and content that helps search engines understand what the business offers. For a " + industry.toLowerCase() + " business, this kind of foundation can support stronger local visibility, better indexing, and more useful search results over time."
        },
        {
          eyebrow: "Marketing and Advertising",
          title: "Digital marketing support beyond the website.",
          text: "This project can support additional growth services such as " + services.join(", ") + ". These services help connect the website to a broader marketing strategy, including search visibility, paid traffic, better landing pages, reputation signals, and clearer messaging for customers who are ready to take action."
        },
        {
          eyebrow: "Mobile Experience",
          title: "Designed for visitors on every device.",
          text: "Many visitors reach a business website from a phone. WebAct structured the " + name + " website experience so key information remains easy to read, service content is simple to browse, and important contact actions are accessible across desktop, tablet, and mobile screens."
        },
        {
          eyebrow: "Results Focus",
          title: "A better foundation for leads, trust, and growth.",
          text: "Rather than claiming fake performance numbers, this case study focuses on the practical improvements a stronger website can provide: clearer service presentation, improved professionalism, better mobile usability, stronger SEO structure, more visible calls to action, and a more trustworthy first impression for potential customers."
        }
      ],
      services,
      related
    };
  }

  return { slugify, generate };
})();