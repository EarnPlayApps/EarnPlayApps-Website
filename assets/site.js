const $ = (selector) => document.querySelector(selector);
const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function safeDownloadURL(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, window.location.href);
    if (url.protocol !== "https:" && url.origin !== window.location.origin) return null;
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return escapeHTML(url.href);
  } catch { return null; }
}

function appIconMarkup(type, extraClass = "") {
  const icons = { convert: "all-convert-icon.webp", qr: "qr-scanner-icon.webp", calculator: "e-calculator-icon.webp" };
  const file = icons[type] || icons.convert;
  const names = { convert: "All Convert", qr: "QR Scanner", calculator: "E-Calculator" };
  return `<img class="product-app-icon ${extraClass}" src="assets/${file}" alt="${names[type] || "EarnPlayApps app"} icon" loading="lazy">`;
}

function previewMarkup(type, compact = false) {
  const cls = compact ? "ui-preview ui-preview-compact" : "ui-preview";
  if (type === "qr") return `
    <div class="${cls} preview-qr">
      <div class="preview-topline"><span>QR SCANNER</span><i>•••</i></div>
      <div class="scanner-stage"><div class="scanner-corner tl"></div><div class="scanner-corner tr"></div><div class="scanner-corner bl"></div><div class="scanner-corner br"></div><div class="fake-qr"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b></div><span class="scan-beam"></span></div>
      <div class="preview-result"><span class="result-dot"></span><span><b>Ready to scan</b><small>QR codes & barcodes</small></span></div>
      <div class="preview-controls"><i>Gallery</i><i class="scan-main">SCAN</i><i>History</i></div>
    </div>`;
  if (type === "calculator") return `
    <div class="${cls} preview-calculator">
      <div class="preview-topline"><span>E-CALCULATOR</span><i>•••</i></div>
      <div class="calc-display"><small>125 × 8</small><strong>1,000</strong></div>
      <div class="calc-keys"><i>AC</i><i>±</i><i>%</i><i class="calc-op">÷</i><i>7</i><i>8</i><i>9</i><i class="calc-op">×</i><i>4</i><i>5</i><i>6</i><i class="calc-op">−</i><i>1</i><i>2</i><i>3</i><i class="calc-op">+</i><i class="calc-zero">0</i><i>.</i><i class="calc-equal">=</i></div>
    </div>`;
  return `
    <div class="${cls} preview-convert">
      <div class="preview-topline"><span>ALL CONVERT</span><i>•••</i></div>
      <div class="convert-heading"><small>YOUR FILE WORKSPACE</small><b>Convert anything.<br>Keep it simple.</b></div>
      <div class="file-tile"><span class="file-symbol">PDF</span><span><b>Project-brief.pdf</b><small>2.4 MB · Ready to convert</small></span><i>•••</i></div>
      <div class="convert-arrow">↓</div>
      <div class="format-row"><span>OUTPUT FORMAT</span><b>DOCX <i>⌄</i></b></div>
      <div class="convert-action">Convert file <span>→</span></div>
      <div class="preview-foot">Preview · Save · Share</div>
    </div>`;
}

function renderAppCard(app) {
  const id = encodeURIComponent(app.id);
  return `
    <article class="app-card">
      <a class="app-card-visual" href="app.html?id=${id}" aria-label="Explore ${escapeHTML(app.name)}">
        ${previewMarkup(app.previewType, true)}
        <span class="app-card-visual-label">PRODUCT PREVIEW</span>
      </a>
      <div class="app-card-content">
        <div class="studio-signature"><img src="assets/epa-mark.svg" alt="" aria-hidden="true"><span>AN EARNPLAYAPPS PRODUCT</span></div>
        <div class="app-card-kicker"><span>${escapeHTML(app.category)}</span><span class="status">${escapeHTML(app.status)}</span></div>
        <h3>${escapeHTML(app.name)}</h3>
        <p>${escapeHTML(app.tagline)}</p>
        <a class="app-card-link" href="app.html?id=${id}">Explore app details <span>→</span></a>
      </div>
    </article>`;
}

function priceText(value) { return value ? escapeHTML(value) : "—"; }

function renderPricing(app) {
  const plans = Array.isArray(app.plans) ? app.plans : [];
  return `
    <section class="product-pricing">
      <div class="pricing-heading"><div><div class="eyebrow">SIMPLE, TRANSPARENT PLANS</div><h2>Choose your access.</h2><p>Proposed launch pricing. Final plan benefits and terms will be confirmed before sales open.</p></div><span class="pricing-status">NOT YET ON SALE</span></div>
      <div class="pricing-grid">
        ${plans.map((plan, index) => {
          const price = plan.name === "Free" ? "RM0" : (plan.monthly || plan.yearly || plan.lifetime || "To be announced");
          const period = plan.name === "Free" ? "Forever free" : plan.monthly ? "per month" : plan.yearly ? "per year" : "one-time";
          const highlight = index === 2 ? " pricing-featured" : "";
          return `<article class="pricing-card${highlight}"><span class="plan-name">${escapeHTML(plan.name)}</span><strong class="plan-price">${priceText(price)}</strong><small class="plan-period">${period}</small><p>${escapeHTML(plan.description)}</p><span class="plan-coming">Coming soon</span></article>`;
        }).join("")}
      </div>
      <p class="pricing-disclaimer">Prices shown are proposals in Malaysian Ringgit (MYR), not active offers. No payment is collected on this website yet. Lifetime access will be governed by the final published product terms.</p>
    </section>`;
}

function renderAppDetail(detail, app) {
  if (!app) {
    detail.innerHTML = `<div class="detail-card"><div class="eyebrow">EARNPLAYAPPS STORE</div><h1>Product not found</h1><p>This product could not be found in our official directory.</p><a class="button primary" href="store.html">Back to Store →</a></div>`;
    return;
  }
  document.title = `${app.name} — EarnPlayApps`;
  const features = Array.isArray(app.features) ? app.features : [];
  const useCases = Array.isArray(app.useCases) ? app.useCases : [];
  const downloadURL = safeDownloadURL(app.download);
  const isAvailable = Boolean(downloadURL && app.status === "Available");
  detail.innerHTML = `
    <div class="product-detail">
      <a class="product-back product-back-top" href="store.html">← ALL PRODUCTS</a>
      <section class="product-hero">
        <div class="product-hero-copy">
          <div class="studio-signature product-signature"><img src="assets/epa-mark.svg" alt="" aria-hidden="true"><span>AN EARNPLAYAPPS ORIGINAL</span></div>
          <div class="eyebrow">${escapeHTML(app.category).toUpperCase()} · EARNPLAYAPPS PRODUCT</div>
          <h1>${escapeHTML(app.name)}</h1>
          <p class="product-tagline">${escapeHTML(app.tagline)}</p>
          <div class="product-status-line"><span class="status">${escapeHTML(app.status)}</span><span>Version ${escapeHTML(app.version)}</span></div>
          <p class="product-audience">${escapeHTML(app.audience || "")}</p>
        </div>
        <div class="product-preview-wrap product-icon-wrap"><div class="preview-glow"></div>${appIconMarkup(app.previewType, "product-detail-icon")}<span class="preview-caption">OFFICIAL PRODUCT ICON</span></div>
      </section>
      <section class="product-description"><div class="eyebrow">THE PRODUCT</div><h2>Designed around your everyday tasks.</h2><p>${escapeHTML(app.description)}</p></section>
      <section class="product-features"><div class="eyebrow">WHAT YOU CAN DO</div><h2>Features built around real use.</h2><div class="feature-list">${features.map((feature) => `<div class="feature"><span aria-hidden="true">✓</span><span>${escapeHTML(feature)}</span></div>`).join("")}</div></section>
      <section class="product-usecases"><div class="eyebrow">MADE FOR REAL LIFE</div><h2>Useful in more ways.</h2><div class="usecase-grid">${useCases.map((item, i) => `<article><span>0${i+1}</span><p>${escapeHTML(item)}</p></article>`).join("")}</div></section>
      ${renderPricing(app)}
      <aside class="product-release"><div><span class="purchase-label">OFFICIAL RELEASE</span><strong>${isAvailable ? "Ready to download" : "Preparing for release"}</strong><small>We will publish the verified release here when testing is complete.</small></div>${isAvailable ? `<a class="button primary" href="${downloadURL}" rel="noopener">Download APK →</a>` : '<span class="purchase-disabled">Downloads and checkout are not open yet.</span>'}</aside>
      <div class="product-support"><p>Questions about ${escapeHTML(app.name)}?</p><a href="support.html">Contact EarnPlayApps support →</a></div>
      <a class="product-back" href="store.html">← Explore the complete product collection</a>
    </div>`;
}

async function loadApps() {
  const grid = $("#app-grid");
  const detail = $("#app-detail");
  try {
    const response = await fetch("apps.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("App directory request failed");
    const apps = await response.json();
    if (!Array.isArray(apps)) throw new Error("App directory format is invalid");
    if (grid) grid.innerHTML = apps.length ? apps.map(renderAppCard).join("") : "<p>New apps are being prepared. Please check back soon.</p>";
    if (detail) {
      const id = new URLSearchParams(window.location.search).get("id");
      renderAppDetail(detail, apps.find((app) => app.id === id));
    }
  } catch {
    if (grid) grid.innerHTML = "<p>App directory is temporarily unavailable. Please try again later.</p>";
    if (detail) detail.innerHTML = '<div class="detail-card"><h1>Unable to load product details</h1><p>Please check your connection and try again.</p><a class="button primary" href="store.html">Back to Store →</a></div>';
  }
}
loadApps();

function renderStoreCard(app) {
  const id = encodeURIComponent(app.id);
  const starting = app.plans?.find((plan) => plan.name === "Pro Monthly")?.monthly || "Coming soon";
  return `
    <article class="store-product-card">
      <a class="store-card-visual store-card-icon-visual" href="app.html?id=${id}" aria-label="Explore ${escapeHTML(app.name)}">${appIconMarkup(app.previewType)}<span class="visual-open">EXPLORE PRODUCT ↗</span></a>
      <div class="store-card-content">
        <div class="studio-signature"><img src="assets/epa-mark.svg" alt="" aria-hidden="true"><span>AN EARNPLAYAPPS PRODUCT</span></div>
        <div class="store-card-kicker"><span>${escapeHTML(app.category)}</span><span class="status">${escapeHTML(app.status)}</span></div>
        <h3>${escapeHTML(app.name)}</h3><p>${escapeHTML(app.tagline)}</p>
        <div class="store-card-bottom"><span><small>PRO MONTHLY PROPOSAL</small><b>${priceText(starting)}<i>/mo</i></b></span><a class="card-link" href="app.html?id=${id}">Discover product →</a></div>
      </div>
    </article>`;
}

async function loadStore() {
  const grid = $("#store-grid");
  if (!grid) return;
  const search = $("#store-search");
  try {
    const response = await fetch("apps.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("App directory request failed");
    const apps = await response.json();
    if (!Array.isArray(apps)) throw new Error("App directory format is invalid");
    const render = () => {
      const term = (search?.value || "").trim().toLowerCase();
      const filtered = apps.filter((app) => [app.name, app.category, app.tagline, app.description, ...(app.features || [])].some((value) => String(value || "").toLowerCase().includes(term)));
      grid.innerHTML = filtered.length ? filtered.map(renderStoreCard).join("") : "<p>No products match your search. Try another name or feature.</p>";
    };
    search?.addEventListener("input", render);
    render();
  } catch {
    grid.innerHTML = "<p>The product collection is temporarily unavailable. Please try again later.</p>";
  }
}
loadStore();
