const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".primary-nav");
const desktopNav = window.matchMedia("(min-width: 861px)");
const siteHeader = document.querySelector(".site-header");

if (siteHeader) {
  const syncHeaderScroll = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 4);
  };

  syncHeaderScroll();
  window.addEventListener("scroll", syncHeaderScroll, { passive: true });
}

function closeDesktopMenus(exceptItem = null) {
  document.querySelectorAll(".primary-nav .nav-item.is-open").forEach((item) => {
    if (item === exceptItem) return;
    item.classList.remove("is-open");
    item.querySelector(":scope > a")?.setAttribute("aria-expanded", "false");
  });
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".primary-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      if (desktopNav.matches) return;
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll(".primary-nav .nav-item").forEach((item) => {
  const trigger = item.querySelector(":scope > a");
  if (!trigger) return;

  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-expanded", "false");

  let closeTimer;
  const openMenu = () => {
    if (!desktopNav.matches) return;
    window.clearTimeout(closeTimer);
    closeDesktopMenus(item);
    item.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  };
  const queueClose = () => {
    if (!desktopNav.matches) return;
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => closeDesktopMenus(), 120);
  };

  item.addEventListener("pointerenter", openMenu);
  item.addEventListener("pointerleave", queueClose);
  item.addEventListener("focusin", openMenu);
  item.addEventListener("focusout", (event) => {
    if (item.contains(event.relatedTarget)) return;
    queueClose();
  });

  trigger.addEventListener("click", (event) => {
    if (!desktopNav.matches) return;
    if (!item.classList.contains("is-open")) {
      event.preventDefault();
      openMenu();
    }
  });
});

document.addEventListener("click", (event) => {
  if (!desktopNav.matches) return;
  if (event.target.closest(".primary-nav")) return;
  closeDesktopMenus();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeDesktopMenus();
});

desktopNav.addEventListener("change", () => {
  closeDesktopMenus();
});

document.querySelectorAll("[data-google-review-rotator]").forEach((rotator) => {
  const minRating = Number(rotator.dataset.minRating || 5);
  const cards = Array.from(rotator.querySelectorAll(".google-review-card"))
    .filter((card) => Number(card.dataset.rating || 0) >= minRating);
  const count = rotator.querySelector("[data-google-review-count]");
  const prev = rotator.querySelector("[data-google-review-prev]");
  const next = rotator.querySelector("[data-google-review-next]");
  if (!cards.length) return;

  let activeIndex = 0;
  let timer;

  const showReview = (index) => {
    activeIndex = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      const isActive = cardIndex === activeIndex;
      card.classList.toggle("active", isActive);
      card.setAttribute("aria-hidden", String(!isActive));
    });
    if (count) count.textContent = `${activeIndex + 1} / ${cards.length}`;
  };

  const queueRotation = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showReview(activeIndex + 1), 5200);
  };

  prev?.addEventListener("click", () => {
    showReview(activeIndex - 1);
    queueRotation();
  });

  next?.addEventListener("click", () => {
    showReview(activeIndex + 1);
    queueRotation();
  });

  showReview(0);
  queueRotation();
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#tab-${target}`).classList.add("active");
  });
});

const kbSearchInput = document.querySelector("[data-kb-search]");
const kbDirectory = document.querySelector("[data-kb-directory]");
if (kbSearchInput && kbDirectory) {
  const kbCards = Array.from(kbDirectory.querySelectorAll("[data-kb-card]"));
  const kbFilters = Array.from(document.querySelectorAll("[data-kb-filter]"));
  const kbCount = document.querySelector("[data-kb-count]");
  const kbEmpty = document.querySelector("[data-kb-empty]");
  let activeCategory = "all";

  const updateKnowledgeBase = () => {
    const query = kbSearchInput.value.trim().toLowerCase();
    let visibleCards = 0;
    let visibleArticles = 0;

    kbCards.forEach((card) => {
      const categoryMatches = activeCategory === "all" || card.dataset.category === activeCategory;
      const cardText = card.dataset.search || "";
      let matchingArticles = 0;

      card.querySelectorAll("[data-kb-article]").forEach((article) => {
        const articleMatches = !query || article.dataset.search.includes(query) || cardText.includes(query);
        article.hidden = !articleMatches;
        if (articleMatches) matchingArticles += 1;
      });

      const cardMatches = categoryMatches && (!query || cardText.includes(query) || matchingArticles > 0);
      card.hidden = !cardMatches;
      if (cardMatches) {
        visibleCards += 1;
        visibleArticles += matchingArticles;
      }
    });

    kbDirectory.querySelectorAll(".kb-category-block").forEach((block) => {
      block.hidden = !block.querySelector("[data-kb-card]:not([hidden])");
    });

    if (kbCount) {
      kbCount.textContent = `${visibleArticles} article links in ${visibleCards} support sections match your search.`;
    }
    if (kbEmpty) kbEmpty.hidden = visibleCards > 0;
  };

  kbSearchInput.addEventListener("input", updateKnowledgeBase);
  kbFilters.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.kbFilter || "all";
      kbFilters.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      updateKnowledgeBase();
    });
  });
}

const widgetKbSearchInput = document.querySelector("[data-widget-kb-search]");
const widgetKbDirectory = document.querySelector("[data-widget-kb-directory]");
if (widgetKbSearchInput && widgetKbDirectory) {
  const widgetKbCards = Array.from(widgetKbDirectory.querySelectorAll("[data-widget-kb-card]"));
  const widgetKbFilters = Array.from(document.querySelectorAll("[data-widget-kb-filter]"));
  const widgetKbCount = document.querySelector("[data-widget-kb-count]");
  const widgetKbEmpty = document.querySelector("[data-widget-kb-empty]");
  let activeWidgetCategory = "all";

  const updateWidgetKnowledgeBase = () => {
    const query = widgetKbSearchInput.value.trim().toLowerCase();
    let visibleCards = 0;

    widgetKbCards.forEach((card) => {
      const categoryMatches = activeWidgetCategory === "all" || card.dataset.category === activeWidgetCategory;
      const textMatches = !query || (card.dataset.search || "").includes(query);
      const shouldShow = categoryMatches && textMatches;
      card.hidden = !shouldShow;
      if (shouldShow) visibleCards += 1;
    });

    widgetKbDirectory.querySelectorAll(".widget-kb-category").forEach((block) => {
      block.hidden = !block.querySelector("[data-widget-kb-card]:not([hidden])");
    });

    if (widgetKbCount) widgetKbCount.textContent = `${visibleCards} widget articles match your search.`;
    if (widgetKbEmpty) widgetKbEmpty.hidden = visibleCards > 0;
  };

  widgetKbSearchInput.addEventListener("input", updateWidgetKnowledgeBase);
  widgetKbFilters.forEach((button) => {
    button.addEventListener("click", () => {
      activeWidgetCategory = button.dataset.widgetKbFilter || "all";
      widgetKbFilters.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      updateWidgetKnowledgeBase();
    });
  });
}

const appStoreSearchInput = document.querySelector("[data-app-store-search]");
const appStoreDirectory = document.querySelector("[data-app-store-directory]");
if (appStoreSearchInput && appStoreDirectory) {
  const appStoreCards = Array.from(appStoreDirectory.querySelectorAll("[data-app-store-card]"));
  const appStoreFilters = Array.from(document.querySelectorAll("[data-app-store-filter]"));
  const appStoreCount = document.querySelector("[data-app-store-count]");
  const appStoreEmpty = document.querySelector("[data-app-store-empty]");
  let activeAppCategory = "All";

  const updateAppStore = () => {
    const query = appStoreSearchInput.value.trim().toLowerCase();
    let visibleCards = 0;

    appStoreCards.forEach((card) => {
      const categoryMatches = activeAppCategory === "All" || card.dataset.category === activeAppCategory;
      const searchableText = `${card.dataset.search || ""} ${card.textContent || ""}`.toLowerCase();
      const textMatches = !query || searchableText.includes(query);
      const shouldShow = categoryMatches && textMatches;
      card.hidden = !shouldShow;
      card.classList.toggle("is-hidden-by-search", !shouldShow);
      if (shouldShow) visibleCards += 1;
    });

    if (appStoreCount) {
      appStoreCount.textContent = query || activeAppCategory !== "All"
        ? `${visibleCards} WebAct apps match your search.`
        : `${visibleCards} WebAct apps available.`;
    }
    if (appStoreEmpty) appStoreEmpty.hidden = visibleCards > 0;
  };

  appStoreSearchInput.addEventListener("input", updateAppStore);
  appStoreFilters.forEach((button) => {
    button.addEventListener("click", () => {
      activeAppCategory = button.dataset.appStoreFilter || "All";
      appStoreFilters.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      updateAppStore();
    });
  });
  updateAppStore();
}

document.querySelectorAll("[data-design-pricing-calculator]").forEach((calculator) => {
  const sliders = Array.from(calculator.querySelectorAll("[data-design-price-rate]"));
  const total = calculator.querySelector("[data-design-price-total]");
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const updateDesignPricing = () => {
    let sum = 0;

    sliders.forEach((slider) => {
      const rate = Number(slider.dataset.designPriceRate || 0);
      const quantity = Number(slider.value || 0);
      const unit = slider.dataset.designPriceUnit || "items";
      const output = document.getElementById(slider.dataset.designPriceOutput);
      const subtotal = rate * quantity;
      const unitLabel = quantity === 1 && unit.endsWith("s") ? unit.slice(0, -1) : unit;
      sum += subtotal;

      if (output) {
        output.textContent = `${quantity} ${unitLabel} / ${money.format(subtotal)}`;
      }
    });

    if (total) total.textContent = money.format(sum);
  };

  sliders.forEach((slider) => slider.addEventListener("input", updateDesignPricing));
  updateDesignPricing();
});

document.querySelectorAll("[data-modal-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.getElementById(button.dataset.modalOpen);
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    const firstField = modal.querySelector("input, select, textarea, button");
    if (firstField) firstField.focus();
  });
});

document.querySelectorAll("[data-modal-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".editor-modal");
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  document.querySelectorAll(".editor-modal.open").forEach((modal) => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });
});

document.querySelectorAll(".sapeditor-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const container = form.closest(".sapeditor-container") || form.parentElement;
    const editorUrl = form.dataset.editorUrl || "https://website.webact.com";
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;

    const data = new URLSearchParams();
    data.set("template_id", form.querySelector('[name="template_id"]')?.value || "1379478");
    data.set("SWU", form.querySelector('[name="SWU"]')?.value || "false");
    data.set("template_name", form.querySelector('[name="template_name"]')?.value || "Shoe Store");
    data.set("siteName", form.querySelector('[name="siteName"]')?.value || "WebAct");
    data.set("email", form.querySelector("#sapeditor-email")?.value || "");
    data.set("name", `${form.querySelector("#sapeditor-fname")?.value || ""} ${form.querySelector("#sapeditor-lname")?.value || ""}`.trim());
    data.set("phone", form.querySelector("#sapeditor-phone")?.value || "");
    data.set("website", form.querySelector("#sapeditor-websitelink")?.value || "No");

    const showStatus = (className, title, text) => {
      if (!container) return;
      container.innerHTML = `
        <div class="editor-status ${className}">
          <h3>${title}</h3>
          <p>${text}</p>
          <a class="button secondary" href="${editorUrl}" target="_blank" rel="noreferrer">Open Duda Simple Editor</a>
        </div>
      `;
    };

    showStatus("loading", "Creating Your Site, Please Wait...", "WebAct is starting your Duda Simple Editor website.");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: data.toString(),
      });
      const message = await response.text();

      if (!response.ok || message.toLowerCase().includes("error")) {
        showStatus("error", "We Could Not Open It Automatically", `Please use the editor link below or log in at ${editorUrl}.`);
        return;
      }

      const match = message.match(/\bhttps?:\/\/\S+/i);
      window.location.href = match ? match[0].replace(/^http:\/\//i, "https://") : editorUrl;
    } catch (error) {
      showStatus("error", "Open The Duda Simple Editor", "The editor connection could not complete from this preview, but you can still open the WebAct Duda dashboard.");
    }
  });
});

const templateStyleUrls = [
  "https://cdn.jsdelivr.net/modaal/0.3.1/css/modaal.min.css",
  "https://cdn.jsdelivr.net/gh/kierancz/cbp@1.0.8/css/cbp.min.css",
  "https://cdn.jsdelivr.net/gh/kierancz/cbp@1.0.8/css/dudaapi.css",
  "https://unpkg.com/purecss@1.0.0/build/pure-min.css",
];

const templateScriptUrls = [
  "https://code.jquery.com/jquery-3.7.1.min.js",
  "https://cdn.jsdelivr.net/modaal/0.3.1/js/modaal.min.js",
  "https://cdn.jsdelivr.net/gh/kierancz/cbp@1.0.8/js/cbp.js",
];

const professionalTemplateTempUrl = "https://www.websitebuilderapi.com";
const professionalTemplateProxy = "https://vercel-proxy-pi-ten.vercel.app/api/proxy?url=";

function loadTemplateStyles() {
  templateStyleUrls.forEach((href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  });
}

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      if (existing.dataset.loaded === "true") resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.templateScript = "true";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", reject);
    document.head.appendChild(script);
  });
}

async function loadTemplateScripts() {
  for (const src of templateScriptUrls) {
    await loadScriptOnce(src);
  }
}

function parseWidgetConfig(widget) {
  try {
    return JSON.parse(atob(widget.dataset.widgetConfig || ""));
  } catch (error) {
    return {};
  }
}

function getProfessionalTemplatesUrl(widget) {
  const config = parseWidgetConfig(widget);
  const customTemplateBuffer = config.isShowCustData ? "-data" : config.Custom ? "-custom" : "";
  const siteName = String(config.SiteName || "WebAct").replace(/\s+/g, "").toLowerCase();
  return `${professionalTemplateProxy}${professionalTemplateTempUrl}/t/${siteName}/${siteName}${customTemplateBuffer}.html`;
}

function revealTemplateGrid(container) {
  const grid = container.querySelector("#grid-container");
  const cardGrid = container.querySelector("#grid-container .cbp-wrapper") || grid;
  const activeSelector = container.dataset.activeTemplateFilter || "*";

  if (grid) {
    grid.style.opacity = "1";
    grid.style.visibility = "visible";
    grid.style.display = "block";
    grid.style.position = "relative";
    grid.style.height = "auto";
    grid.style.maxHeight = "none";
    grid.style.overflow = "visible";
  }

  if (cardGrid) {
    cardGrid.classList.add("webact-template-grid");
    cardGrid.style.position = "relative";
    cardGrid.style.display = "grid";
    cardGrid.style.height = "auto";
    cardGrid.style.maxHeight = "none";
    cardGrid.style.overflow = "visible";
    cardGrid.style.transform = "none";
  }

  container.querySelectorAll(".cbp-item").forEach((item) => {
    const shouldShow = activeSelector === "*" || item.matches(activeSelector);
    item.hidden = !shouldShow;
    item.style.opacity = "1";
    item.style.visibility = "visible";
    item.style.display = shouldShow ? "block" : "none";
    item.style.position = "relative";
    item.style.left = "auto";
    item.style.top = "auto";
    item.style.width = "auto";
    item.style.height = "auto";
    item.style.maxWidth = "none";
    item.style.margin = "0";
    item.style.transform = "none";
  });

  container.querySelectorAll(".cbp-caption-activeWrap a, .formbutton").forEach((button) => {
    button.setAttribute("tabindex", "0");
  });

  container.querySelectorAll(".cbp, .cbp-wrapper, .cbp-wrapper-outer, .cbp-ready, .cbp-item-wrapper").forEach((element) => {
    element.style.position = "static";
    element.style.height = "auto";
    element.style.maxHeight = "none";
    element.style.overflow = "visible";
  });
}

function setupTemplateFilters(container) {
  const filters = container.querySelectorAll("#filters-container [data-filter], .cbp-filter-item[data-filter]");
  const items = container.querySelectorAll(".cbp-item");
  if (!filters.length || !items.length) return;
  if (!container.dataset.activeTemplateFilter) container.dataset.activeTemplateFilter = "*";

  filters.forEach((filter) => {
    filter.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const selector = filter.dataset.filter || filter.getAttribute("data-filter") || "*";
      container.dataset.activeTemplateFilter = selector;

      filters.forEach((item) => {
        item.classList.remove("cbp-filter-item-active", "active");
        item.setAttribute("aria-selected", "false");
      });
      filter.classList.add("cbp-filter-item-active", "active");
      filter.setAttribute("aria-selected", "true");

      items.forEach((card) => {
        const shouldShow = selector === "*" || card.matches(selector);
        card.hidden = !shouldShow;
        card.style.display = shouldShow ? "block" : "none";
      });

      revealTemplateGrid(container);
    }, true);
  });
}

function ensureProfessionalStartModal() {
  let modal = document.getElementById("professional-template-start-modal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.className = "editor-modal professional-start-modal";
  modal.id = "professional-template-start-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="editor-modal-backdrop" data-professional-start-close></div>
    <div class="editor-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="professional-start-title">
      <button class="modal-close" type="button" aria-label="Close" data-professional-start-close>×</button>
      <div class="modal-startText">
        <p class="eyebrow">WebAct Website Builder</p>
        <h2 id="professional-start-title">Start Building</h2>
        <p class="professional-template-name">Professional Website</p>
      </div>
      <form class="professional-template-start-form" method="get">
        <input type="hidden" name="id">
        <input type="hidden" name="template_id">
        <input type="hidden" name="SWU">
        <input type="hidden" name="template_name">
        <input type="hidden" name="siteName">
        <input type="hidden" name="editor">
        <label>Name<input type="text" name="name" required></label>
        <label>Email<input type="email" name="email" required></label>
        <label>Phone<input type="tel" name="phone" required></label>
        <label>Website<input type="text" name="website" placeholder="https://"></label>
        <button class="button primary" type="submit">Start</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelectorAll("[data-professional-start-close]").forEach((button) => {
    button.addEventListener("click", () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    });
  });
  return modal;
}

function readTemplateParams(href) {
  const params = new URLSearchParams();
  try {
    const url = new URL(href, window.location.href);
    url.searchParams.forEach((value, key) => params.set(key, value));
  } catch (error) {
    return params;
  }
  return params;
}

function openProfessionalStartForm(params) {
  const modal = ensureProfessionalStartModal();
  const form = modal.querySelector(".professional-template-start-form");
  const title = modal.querySelector(".professional-template-name");
  const current = new URLSearchParams(window.location.search);
  const defaults = {
    id: "13",
    template_id: "",
    SWU: "false",
    template_name: "Professional Website",
    siteName: "Webact",
    editor: "website.webact.com",
    name: current.get("name") || "",
    email: current.get("email") || "",
    phone: current.get("phone") || "",
    website: current.get("website") || "",
  };

  Object.entries(defaults).forEach(([key, fallback]) => {
    const field = form.elements[key];
    if (!field) return;
    field.value = params.get(key) || fallback;
  });

  if (title) title.textContent = form.elements.template_name.value || "Professional Website";
  form.action = window.location.href.split("?")[0];
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  const first = form.querySelector('input[name="name"]');
  if (first) first.focus();
}

function setupTemplateActions(container) {
  container.querySelectorAll(".cbp-item").forEach((card) => {
    let overlay = card.querySelector(".cbp-caption-activeWrap");
    const caption = card.querySelector(".cbp-caption") || card;

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "cbp-caption-activeWrap";
      caption.appendChild(overlay);
    }

    let links = Array.from(overlay.querySelectorAll("a"));
    let start = links.find((link) => /template_id=|start/i.test(`${link.href} ${link.textContent}`));
    let preview = links.find((link) => /preview/i.test(link.textContent));

    if (!start) {
      const candidate = Array.from(card.querySelectorAll("a")).find((link) => link.href.includes("template_id="));
      if (candidate) {
        start = candidate.cloneNode(true);
        overlay.appendChild(start);
      }
    }

    if (!preview) {
      const candidate = links.find((link) => link !== start) || Array.from(card.querySelectorAll("a")).find((link) => link !== start);
      if (candidate) {
        preview = candidate.cloneNode(true);
        overlay.appendChild(preview);
      }
    }

    if (start) {
      start.textContent = "Start";
      start.classList.add("formbutton", "template-start-button");
      if (start.dataset.professionalStartBound !== "true") {
        start.dataset.professionalStartBound = "true";
        start.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          openProfessionalStartForm(readTemplateParams(start.href));
        });
      }
    }

    if (preview) {
      preview.textContent = "Preview";
      preview.classList.add("formbutton", "template-preview-button");
      preview.target = "_blank";
      preview.rel = "noreferrer";
    }
  });
}

function applyActiveTemplateFilter(container) {
  const selector = container.dataset.activeTemplateFilter || "*";
  container.querySelectorAll(".cbp-item").forEach((card) => {
    const shouldShow = selector === "*" || card.matches(selector);
    card.hidden = !shouldShow;
    card.style.display = shouldShow ? "block" : "none";
  });
}

function initializeTemplateGrid(container, config = {}) {
  const $ = window.jQuery;
  const grid = container.querySelector("#grid-container");

  if ($ && $.fn.modaal) {
    $(container).find(".inline").modaal({ hide_close: true });
  }

  if ($ && $.fn.cubeportfolio && grid) {
    $(grid).cubeportfolio({
      layoutMode: "grid",
      rewindNav: true,
      scrollByPage: false,
      defaultFilter: "*",
      animationType: config.Ani || "flipOut",
      gapHorizontal: Number(config.Margin || 30) - 16,
      gapVertical: Number(config.Margin || 30),
      gridAdjustment: "responsive",
      mediaQueries: [
        { width: 1100, cols: Number(config.LgNum || 3) },
        { width: 900, cols: Number(config.LgNum || 3) },
        { width: 500, cols: Number(config.MdNum || 2) },
        { width: 320, cols: Number(config.SmNum || 1) },
      ],
      caption: config.CaptionAni || "zoom",
      displayType: "lazyLoading",
      displayTypeSpeed: 100,
      filters: "#filters-container",
    });
  }

  revealTemplateGrid(container);
  setupTemplateActions(container);
  applyActiveTemplateFilter(container);
  setupTemplateFilters(container);
  window.setTimeout(() => {
    revealTemplateGrid(container);
    setupTemplateActions(container);
    applyActiveTemplateFilter(container);
  }, 250);
  window.setTimeout(() => {
    revealTemplateGrid(container);
    setupTemplateActions(container);
    applyActiveTemplateFilter(container);
  }, 1000);
}

document.querySelectorAll(".professional-template-widget[data-template-feed]").forEach(async (widget) => {
  const config = parseWidgetConfig(widget);
  const feedUrl = getProfessionalTemplatesUrl(widget);
  const loading = widget.querySelector("#loading");
  const container = widget.querySelector("#include-templates");
  const fallback = widget.querySelector(".template-feed-fallback");
  if (!feedUrl || !container) return;

  loadTemplateStyles();

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);
    const response = await fetch(feedUrl, { signal: controller.signal });
    window.clearTimeout(timeout);
    if (!response.ok) throw new Error("Template feed unavailable");
    const html = await response.text();
    container.innerHTML = html;
    container.querySelectorAll("a").forEach((link) => {
      if (!link.target) link.target = "_blank";
      link.rel = "noreferrer";
    });
    if (loading) loading.hidden = true;
    container.classList.add("loaded");
    try {
      await loadTemplateScripts();
      initializeTemplateGrid(container, config);
    } catch (scriptError) {
      revealTemplateGrid(container);
    }
  } catch (error) {
    if (loading) loading.hidden = true;
    if (fallback) fallback.hidden = false;
  }
});
