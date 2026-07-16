window.webactPortfolioContentEngine = (function () {
  "use strict";

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function normalizeIndustry(industry) {
    return String(industry || "Business").trim();
  }

  var industryMap = {
    "restaurant": {
      audience: "local diners, takeout customers, catering customers, and mobile users searching nearby",
      needs: "clear menus, location details, ordering options, food photography, reviews, and fast mobile access",
      services: ["Restaurant Website Design", "Menu Organization", "Local SEO", "Online Ordering Strategy", "Review Visibility", "Mobile UX"]
    },
    "education": {
      audience: "students, parents, educators, readers, and people researching learning resources",
      needs: "organized information, easy browsing, accessible content, clear categories, and dependable search paths",
      services: ["Education Website Design", "Content Organization", "Search UX", "SEO Structure", "Mobile Design", "Conversion Planning"]
    },
    "retail": {
      audience: "shoppers, product researchers, repeat customers, and mobile buyers",
      needs: "clear products, confident browsing, organized categories, strong imagery, and simple purchase or inquiry paths",
      services: ["Retail Website Design", "Product Presentation", "Category Planning", "SEO Content", "Mobile Shopping UX", "Landing Pages"]
    },
    "ecommerce": {
      audience: "online shoppers, repeat customers, product researchers, and mobile buyers",
      needs: "clear products, shopping confidence, organized categories, conversion-focused pages, and mobile purchase paths",
      services: ["Ecommerce Website Design", "Product Page Planning", "Category Structure", "SEO Content", "Digital Advertising", "Mobile Shopping UX"]
    },
    "dental": {
      audience: "new patients, families, emergency patients, and people comparing dental providers",
      needs: "patient trust, treatment education, appointment paths, local visibility, and clear service information",
      services: ["Dental Website Design", "Local SEO", "Treatment Pages", "Appointment Paths", "Patient Content", "Review Strategy"]
    },
    "dentist": {
      audience: "new patients, families, emergency patients, and people comparing dental providers",
      needs: "patient trust, treatment education, appointment paths, local visibility, and clear service information",
      services: ["Dentist Website Design", "Local SEO", "Treatment Pages", "Appointment Paths", "Patient Content", "Review Strategy"]
    },
    "healthcare": {
      audience: "patients, families, caregivers, referral partners, and people researching care",
      needs: "trust, accessible information, service education, appointment paths, and a calm mobile experience",
      services: ["Healthcare Website Design", "Patient-Friendly Content", "Local SEO", "Appointment Paths", "Accessibility", "Reputation Support"]
    },
    "home care": {
      audience: "families, caregivers, referral partners, and people comparing home-care providers",
      needs: "trust, service clarity, care information, referral paths, and easy contact options",
      services: ["Home Care Website Design", "Service Pages", "Local SEO", "Referral Paths", "Trust Content", "Mobile UX"]
    },
    "legal": {
      audience: "people comparing attorneys, researching practice areas, and looking for consultation options",
      needs: "authority, practice-area clarity, trust-building content, consultation calls to action, and local visibility",
      services: ["Law Firm Website Design", "Practice-Area Pages", "Local SEO", "Consultation Paths", "Attorney Content", "Lead Generation"]
    },
    "construction": {
      audience: "homeowners, builders, commercial clients, and customers comparing contractors",
      needs: "project credibility, service explanations, estimate paths, galleries, local visibility, and trust signals",
      services: ["Construction Website Design", "Project Galleries", "Estimate Paths", "Local SEO", "Service-Area Pages", "Brand Messaging"]
    },
    "roofing": {
      audience: "homeowners, property managers, storm-damage leads, and customers needing repair or replacement",
      needs: "service-area visibility, estimate requests, emergency messaging, project proof, and strong local search structure",
      services: ["Roofing Website Design", "Local SEO", "Estimate Forms", "Storm Pages", "Service-Area Content", "Review Strategy"]
    },
    "driving school": {
      audience: "student drivers, parents, adult learners, and customers comparing lesson options",
      needs: "lesson details, schedules, instructor trust, enrollment paths, service areas, and mobile-friendly contact options",
      services: ["Driving School Website Design", "Program Pages", "Local SEO", "Enrollment Paths", "Schedule Content", "Mobile UX"]
    },
    "nonprofit": {
      audience: "supporters, donors, volunteers, community partners, and people learning about the mission",
      needs: "a clear mission, trustworthy stories, donation or participation paths, event information, and accessible content",
      services: ["Nonprofit Website Design", "Mission Storytelling", "Donation Paths", "Event Content", "SEO Structure", "Mobile UX"]
    },
    "professional services": {
      audience: "prospective clients, decision-makers, referral partners, and people comparing providers",
      needs: "clear expertise, trust, service explanations, proof, professional presentation, and direct inquiry paths",
      services: ["Professional Services Website Design", "Service Pages", "SEO Structure", "Lead Paths", "Trust Content", "Brand Messaging"]
    },
    "default": {
      audience: "customers researching services, comparing providers, and looking for a trusted business online",
      needs: "clear messaging, professional presentation, mobile usability, search-friendly structure, and direct calls to action",
      services: ["Website Design", "Responsive Design", "SEO Structure", "Content Organization", "Landing Pages", "Website Support"]
    }
  };

  function getPlan(industry) {
    var key = normalizeIndustry(industry).toLowerCase();
    return industryMap[key] || industryMap.default;
  }

  function relatedProjects(row, allRows) {
    var name = row[0] || "";
    var industry = row[1] || "Business";

    return allRows
      .filter(function (candidate) {
        return (
          candidate[1] === industry &&
          slugify(candidate[0]) !== slugify(name)
        );
      })
      .slice(0, 6);
  }

  function generate(row, allRows) {
    var name = row[0] || "Portfolio Project";
    var industry = normalizeIndustry(row[1]);
    var image = row[2] || "/Resources/images/placeholder.png";
    var previewUrl = row[4] || "";
    var plan = getPlan(industry);
    var industryLower = industry.toLowerCase();

    return {
      name: name,
      industry: industry,
      image: image,
      previewUrl: previewUrl,
      slug: slugify(name),
      title: name + " Website Design Case Study",
      category: industry + " Website Design",
      summary:
        name +
        " is a WebAct " +
        industryLower +
        " website design example created to help " +
        plan.audience +
        ". The project emphasizes clear presentation, mobile usability, organized information, and practical next steps.",
      overview:
        "The " +
        name +
        " website was structured to make the business easier to understand and easier to contact. The visual direction, page hierarchy, and calls to action work together to give visitors a clear path from first impression to the next step.",
      industryStrategy:
        industry +
        " websites benefit from " +
        plan.needs +
        ". This case study shows how those priorities can be organized into a professional digital experience without relying on unsupported performance claims.",
      designStrategy:
        "WebAct's design approach focuses on readable content, consistent visual hierarchy, responsive layouts, clear navigation, and strong use of the project's real website imagery. The goal is a polished experience that represents " +
        name +
        " accurately across desktop, tablet, and mobile.",
      seoStrategy:
        "The search foundation centers on descriptive headings, relevant page language, logical internal structure, useful image text, and content aligned with how customers research " +
        industryLower +
        " businesses.",
      marketingStrategy:
        "The website can support broader growth through " +
        plan.services.join(", ") +
        ". These services connect the website to search visibility, campaigns, landing pages, reputation signals, and clearer customer journeys.",
      mobileStrategy:
        "The mobile experience keeps important information readable, imagery properly scaled, and contact actions accessible without forcing visitors to pinch, zoom, or search through cluttered layouts.",
      resultsFocus:
        "This case study focuses on visible, verifiable improvements: stronger presentation, clearer information, better mobile usability, more organized content, and a more credible path for prospective customers.",
      services: plan.services,
      related: relatedProjects(row, allRows)
    };
  }

  return {
    slugify: slugify,
    generate: generate
  };
})();