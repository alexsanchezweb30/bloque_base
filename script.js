const state = {
  items: [],
  activeTag: "all",
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderLead(item) {
  const lead = document.getElementById("lead");
  if (!item) {
    lead.innerHTML = `<p class="empty-state">Sin noticias todavía. En cuanto el robot haga su primera pasada, aquí aparecerá la más reciente.</p>`;
    return;
  }
  lead.innerHTML = `
    <span class="lead-tag">${escapeHtml(item.tag)}</span>
    <h1 class="lead-title"><a href="${item.link}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h1>
    <p class="lead-summary">${escapeHtml(item.summary)}</p>
    ${item.take ? `<p class="lead-take">${escapeHtml(item.take)}</p>` : ""}
    <div class="lead-meta">
      <span>${escapeHtml(item.source)}</span>
      <span>·</span>
      <span>${timeAgo(item.pubDate)}</span>
    </div>
  `;
}

function renderTimeline(items) {
  const timeline = document.getElementById("timeline");
  if (!items.length) {
    timeline.innerHTML = `<p class="empty-state">No hay más noticias en esta categoría todavía.</p>`;
    return;
  }
  timeline.innerHTML = items.map(item => `
    <div class="entry">
      <div class="entry-time">
        <span>${timeAgo(item.pubDate)}</span>
        <span class="entry-tag">${escapeHtml(item.tag)}</span>
      </div>
      <h3 class="entry-title"><a href="${item.link}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3>
      <p class="entry-summary">${escapeHtml(item.summary)}</p>
      ${item.take ? `<p class="entry-take">${escapeHtml(item.take)}</p>` : ""}
      <p class="entry-source">Fuente: <a href="${item.link}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source)}</a></p>
    </div>
  `).join("");
}

function applyFilter() {
  const filtered = state.activeTag === "all"
    ? state.items
    : state.items.filter(i => i.tag === state.activeTag);

  renderLead(filtered[0]);
  renderTimeline(filtered.slice(1));
}

function setupFilters() {
  document.querySelectorAll(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.activeTag = btn.dataset.tag;
      applyFilter();
    });
  });
}

async function loadNews() {
  try {
    const res = await fetch(`data/news.json?t=${Date.now()}`);
    const data = await res.json();
    state.items = (data.items || []).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    document.getElementById("footer-updated").textContent = new Date(data.lastUpdated).toLocaleString("es-ES");
    document.getElementById("pulse-text").textContent = `actualizado ${timeAgo(data.lastUpdated)}`;
    applyFilter();
  } catch (err) {
    document.getElementById("pulse-text").textContent = "sin conexión con los datos";
    renderLead(null);
  }
}

setupFilters();
loadNews();
