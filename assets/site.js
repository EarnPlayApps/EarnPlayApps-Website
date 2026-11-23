const $ = (selector) => document.querySelector(selector);

const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function safeDownloadURL(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, window.location.href);
    if (url.protocol !== "https:" && url.origin !== window.location.origin) return null;
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return escapeHTML(url.href);
  } catch {
    return null;
  }
}

function renderAppCard(app) {
  const id = encodeURIComponent(app.id);
  return `
    <article class="app-card">
      <div class="app-icon ${escapeHTML(app.theme)}" aria-hidden="true">${escapeHTML(app.icon)}</div>
      <h3>${escapeHTML(app.name)}</h3>
      <p>${escapeHTML(app.tagline)}</p>
      <div class="meta">
        <span>${escapeHTML(app.category)}</span>
        <span class="status">${escapeHTML(app.status)}</span>
      </div>
      <a class="card-link" href="app.html?id=${id}">View app details →</a>
    </article>`;
}

function renderAppDetail(detail, app, apps) {
  if (!app) {
    detail.innerHTML = `
      <div class="detail-card">
        <h1>App not found</h1>
        <p>This app could not be found in our directory.</p>
        <a class="button primary" href="index.html#apps">Back to apps →</a>
      </div>`;
    return;
  }

  document.title = `${app.name} — EarnPlayApps`;
  const features = Array.isArray(app.features) ? app.features : [];
  const downloadURL = safeDownloadURL(app.download);
  detail.innerHTML = `
    <div class="detail-card">
      <div class="app-icon ${escapeHTML(app.theme)}" aria-hidden="true">${escapeHTML(app.icon)}</div>
      <div class="eyebrow">${escapeHTML(app.category).toUpperCase()}</div>
      <h1>${escapeHTML(app.name)}</h1>
      <h3>${escapeHTML(app.tagline)}</h3>
      <p>${escapeHTML(app.description)}</p>
      <div class="feature-list">
        ${features.map((feature) => `<div class="feature">✓ &nbsp;${escapeHTML(feature)}</div>`).join("")}
      </div>
      <p><span class="status">${escapeHTML(app.status)}</span> &nbsp; <span class="meta">Version: ${escapeHTML(app.version)}</span></p>
      ${downloadURL && app.status === "Available" ? `<a class="button primary" href="${downloadURL}" rel="noopener">Download APK →</a>` : '<div class="notice">The verified APK is not available yet. Check back here for the official release.</div>'}
      <p><a href="index.html#apps">Back to all apps →</a></p>
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

    if (grid) {
      grid.innerHTML = apps.length
        ? apps.map(renderAppCard).join("")
        : "<p>New apps are being prepared. Please check back soon.</p>";
    }

    if (detail) {
      const id = new URLSearchParams(window.location.search).get("id");
      renderAppDetail(detail, apps.find((app) => app.id === id), apps);
    }
  } catch {
    if (grid) {
      grid.innerHTML = "<p>App directory is temporarily unavailable. Please try again later.</p>";
    }
    if (detail) {
      detail.innerHTML = '<div class="detail-card"><h1>Unable to load app details</h1><p>Please check your connection and try again.</p><a class="button primary" href="index.html#apps">Back to apps →</a></div>';
    }
  }
}

loadApps();

function renderStoreCard(app) {
  const id = encodeURIComponent(app.id);
  return `
    <article class="app-card store-card">
      <div class="app-icon ${escapeHTML(app.theme)}" aria-hidden="true">${escapeHTML(app.icon)}</div>
      <h3>${escapeHTML(app.name)}</h3>
      <p>${escapeHTML(app.tagline)}</p>
      <div class="meta"><span>${escapeHTML(app.category)}</span><span class="status">${escapeHTML(app.status)}</span></div>
      <span class="store-price">Pricing coming soon</span>
      <a class="card-link" href="app.html?id=${id}">Explore app details →</a>
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
      const filtered = apps.filter((app) =>
        [app.name, app.category, app.tagline, app.description]
          .some((value) => String(value || "").toLowerCase().includes(term))
      );
      grid.innerHTML = filtered.length
        ? filtered.map(renderStoreCard).join("")
        : "<p>No apps match your search. Try another name or category.</p>";
    };
    search?.addEventListener("input", render);
    render();
  } catch {
    grid.innerHTML = "<p>The app collection is temporarily unavailable. Please try again later.</p>";
  }
}

loadStore();
