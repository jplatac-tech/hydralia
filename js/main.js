(function ($) {
  "use strict";
  $(document).ready(function () {
    if ($(window).width() > 992) {
      $(".navbar .dropdown")
        .on("mouseover", function () {
          $(".dropdown-toggle", this).trigger("click");
        })
        .on("mouseout", function () {
          $(".dropdown-toggle", this).trigger("click").blur();
        });
    }
  });
})(jQuery);

(function () {
  const H = window.Hydralia;
  if (!H) return;

  H.ensureSampleData();

  const page = document.body.dataset.page || "inicio";
  if (window.HydraliaLayout) HydraliaLayout.initNav(page);

  /* ── Modo oscuro ── */
  (function () {
    const KEY = "hydralia_dark_mode";
    function applyMode(isDark) {
      document.body.classList.toggle("dark-mode", isDark);
      const btn = document.getElementById("btnToggleDark");
      if (btn) btn.textContent = isDark ? "☀️" : "🌙";
      window.dispatchEvent(new Event("hydralia:theme-changed"));
    }
    const saved = localStorage.getItem(KEY);
    const isDark = saved === "1";
    applyMode(isDark);
    document.addEventListener("click", function (e) {
      if (e.target && e.target.id === "btnToggleDark") {
        const now = !document.body.classList.contains("dark-mode");
        applyMode(now);
        localStorage.setItem(KEY, now ? "1" : "0");
      }
    });
  })();

  /* ── Utilidades UI ── */
  function refreshGlobal() {
    window.dispatchEvent(new Event("hydralia:updated"));
  }

  function plantPhotoUrl(photo) {
    return encodeURI(photo || "img/user.jpg");
  }

  function renderStats() {
    const plants = H.loadPlants();
    const insights = H.computeHomeInsights(plants);
    const healthy = plants.filter(
      (p) => p.generalState === "Excelente" || p.generalState === "Buena",
    ).length;
    const attention = plants.filter(
      (p) =>
        ["Regular", "Mala", "Crítica"].includes(p.generalState) ||
        (H.daysSinceLastRiego(p) !== null &&
          H.computeAvgRiegoDays(p) &&
          H.daysSinceLastRiego(p) > H.computeAvgRiegoDays(p) + 2),
    ).length;
    let next = null;
    plants.forEach((p) => {
      if (p.nextWater && (!next || new Date(p.nextWater) < new Date(next)))
        next = p.nextWater;
    });
    $("#stat-plants").text(insights.count);
    $("#stat-healthy").text(healthy);
    $("#stat-attention").text(attention);
    $("#stat-next").text(next ? H.formatDate(next) : "—");
    $("#stat-water-today").text(insights.needsWater);
    $("#stat-needs-light").text(insights.needsLight);
    $("#stat-avg-health").text(insights.avgHealth + "%");
  }

  function renderHomeInsights() {
    const $grid = $("#home-insights");
    const $banner = $("#home-dynamic-msg");
    if (!$grid.length) return;
    const plants = H.loadPlants();
    const insights = H.computeHomeInsights(plants);
    const healthy = plants.filter(
      (p) => p.generalState === "Excelente" || p.generalState === "Buena",
    ).length;
    const attention = plants.filter(
      (p) =>
        ["Regular", "Mala", "Crítica"].includes(p.generalState) ||
        (H.daysSinceLastRiego(p) !== null &&
          H.computeAvgRiegoDays(p) &&
          H.daysSinceLastRiego(p) > H.computeAvgRiegoDays(p) + 2),
    ).length;
    let next = null;
    plants.forEach((p) => {
      if (p.nextWater && (!next || new Date(p.nextWater) < new Date(next)))
        next = p.nextWater;
    });
    if ($banner.length) {
      $banner.html(`<p class="mb-0">${insights.bannerMessage}</p>`);
    }
    $grid.html(`
      <div class="col-12 home-stats-mobile">
        <div class="row">
          <div class="col-6 mb-3">
            <div class="insight-card insight-card--plants">
              <span class="insight-icon">🌱</span>
              <div>
                <div class="insight-value">${insights.count}</div>
                <div class="insight-label">Plantas registradas</div>
              </div>
            </div>
          </div>
          <div class="col-6 mb-3">
            <div class="insight-card insight-card--water">
              <span class="insight-icon">💧</span>
              <div>
                <div class="insight-value">${insights.needsWater}</div>
                <div class="insight-label">Necesitan agua hoy</div>
              </div>
            </div>
          </div>
          <div class="col-6 mb-3">
            <div class="insight-card insight-card--sun">
              <span class="insight-icon">☀️</span>
              <div>
                <div class="insight-value">${insights.needsLight}</div>
                <div class="insight-label">Necesitan más luz</div>
              </div>
            </div>
          </div>
          <div class="col-6 mb-3">
            <div class="insight-card insight-card--health">
              <span class="insight-icon">🟢</span>
              <div>
                <div class="insight-value">${insights.avgHealth}%</div>
                <div class="insight-label">Salud promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 home-stats-desktop">
        <div class="row">
          <div class="col-md-3 mb-3">
            <div class="card hydralia-card stat-card"><h6>Plantas</h6><h2>${insights.count}</h2></div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card hydralia-card stat-card"><h6>Saludables</h6><h2>${healthy}</h2></div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card hydralia-card stat-card"><h6>Requieren atención</h6><h2>${attention}</h2></div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card hydralia-card stat-card"><h6>Próximo riego</h6><h2 style="font-size:1.4rem">${next ? H.formatDate(next) : "—"}</h2></div>
          </div>
        </div>
      </div>`);
  }

  function renderHomePlantChips($el, limit) {
    limit = limit || 2;
    const plants = H.loadPlants();
    $el.empty();
    if (!plants.length) {
      $el.html('<p class="text-muted small mb-0">No hay plantas aún.</p>');
      return;
    }
    const shown = plants.slice(0, limit);
    const extra = plants.length - shown.length;
    let html = '<div class="plant-chip-list">';
    shown.forEach((p) => {
      const happy = H.computeHappiness(p).score;
      html += `
        <a href="plantas.html" class="plant-chip">
          <img src="${plantPhotoUrl(p.photo)}" alt="${p.name}" loading="lazy" />
          <span class="plant-chip-name">${p.name}</span>
          <span class="plant-chip-badge">🌟 ${happy}%</span>
        </a>`;
    });
    html += "</div>";
    if (extra > 0) {
      html += `<p class="text-muted small mt-2 mb-0">y ${extra} planta${extra > 1 ? "s" : ""} más</p>`;
    }
    $el.html(html);
  }

  function renderPlantCards($el, options) {
    options = options || {};
    const plants = H.loadPlants();
    const list = options.limit ? plants.slice(0, options.limit) : plants;
    $el.empty();
    if (!list.length) {
      $el.html('<p class="text-muted">No hay plantas registradas.</p>');
      return;
    }
    list.forEach((p) => {
      const avg = H.computeAvgRiegoDays(p);
      const days = H.daysSinceLastRiego(p);
      const freqText =
        avg && days !== null
          ? `Suele regarse cada ${Math.round(avg)} días · Último riego hace ${days} días`
          : "";
      const tips = H.generateTips(p);
      const tipHtml = tips.length
        ? renderTipBanner(tips[0].text, "Consejo para " + p.name)
        : "";
      const actions = options.actions !== false
        ? `<div class="mt-2 plant-card-actions plant-card-actions--compact">
            <button class="btn btn-sm btn-outline-primary btn-record" data-id="${p.id}">💧 Riego</button>
            <a href="riego.html?plant=${p.id}" class="btn btn-sm btn-outline-secondary">Historial</a>
            ${options.showDelete ? `<button class="btn btn-sm btn-outline-danger btn-delete" data-id="${p.id}">Eliminar</button>` : ""}
          </div>`
        : "";
      const galleryHtml = options.showGallery
        ? H.renderPhotoTimeline(p, { showAddButton: true })
        : "";
      const stateClass =
        p.generalState === "Excelente"
          ? "state-excellent"
          : p.generalState === "Buena"
            ? "state-good"
            : "state-attention";
      const desktopActions = options.actions !== false
        ? `<div class="mt-2 plant-card-actions plant-card-actions--inline">
            <button class="btn btn-sm btn-outline-primary mr-1 btn-record" data-id="${p.id}">Registrar riego</button>
            <a href="riego.html?plant=${p.id}" class="btn btn-sm btn-outline-secondary mr-1">Historial</a>
            ${options.showDelete ? `<button class="btn btn-sm btn-outline-danger btn-delete" data-id="${p.id}">Eliminar</button>` : ""}
          </div>`
        : "";

      $el.append(`
        <div class="card hydralia-card plant-card mb-4">
          <div class="plant-layout-desktop">
            <div class="card-body d-flex flex-wrap">
              <img src="${plantPhotoUrl(p.photo)}" class="plant-card-img mr-3 mb-2" alt="${p.name}" loading="lazy" />
              <div class="plant-card-desktop-body">
                <h5 class="mb-1">${p.name} <small class="text-muted">${p.species || ""}</small></h5>
                <p class="mb-1 small">${p.location || "—"} · Maceta ${p.potSize || "—"} · <span class="plant-state-inline ${stateClass}">${p.generalState || "—"}</span></p>
                ${freqText ? `<p class="mb-1 small text-info">${freqText}</p>` : ""}
                ${H.renderWellnessBars(p)}
                ${options.showHappiness !== false && options.showGallery ? H.renderHappinessBlock(p) : ""}
                ${tipHtml}
                ${desktopActions}
              </div>
            </div>
            ${galleryHtml}
          </div>
          <div class="plant-layout-mobile">
            <div class="plant-card-v2-photo">
              <img src="${plantPhotoUrl(p.photo)}" alt="${p.name}" loading="lazy" />
              <span class="plant-state-badge ${stateClass}">${p.generalState || "—"}</span>
            </div>
            <div class="card-body">
              <div class="plant-card-v2-head">
                <div>
                  <h5 class="mb-1"><span class="plant-avatar">🪴</span> ${p.name}</h5>
                  <p class="text-muted small mb-0">${p.species || ""} · ${p.location || "—"}</p>
                </div>
              </div>
              <p class="plant-dynamic-msg">${H.getPlantMessage(p)}</p>
              ${H.renderWellnessRings(p)}
              ${options.showHappiness !== false ? H.renderHappinessBlock(p) : ""}
              ${freqText ? `<p class="mb-2 small text-info">${freqText}</p>` : ""}
              ${tipHtml}
              ${actions}
              ${galleryHtml}
            </div>
          </div>
        </div>`);
    });
  }

  /* ── Formularios compartidos ── */
  function readFileAsDataURL(file) {
    return new Promise((resolve) => {
      if (!file || !file.size) return resolve(null);
      const r = new FileReader();
      r.onload = (e) => resolve(e.target.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(file);
    });
  }

  $(document).on("submit", "#formAddPlant", async function (e) {
    e.preventDefault();
    const fd = new FormData(this);
    const [photoData, leafData] = await Promise.all([
      readFileAsDataURL(fd.get("photo")),
      readFileAsDataURL(fd.get("leafPhoto")),
    ]);
    const plants = H.loadPlants();
    plants.push({
      id: H.uid(),
      name: fd.get("name"),
      species: fd.get("species"),
      acquired: fd.get("acquired") || new Date().toISOString(),
      location: fd.get("location"),
      potSize: fd.get("pot"),
      substrate: fd.get("substrate"),
      photo: photoData || "img/plantas.jpg",
      leafPhoto: leafData,
      soil: {
        humidity: fd.get("soilHumidity"),
        compaction: fd.get("soilCompaction"),
        drainage: fd.get("soilDrainage"),
        fungi: !!fd.get("soilFungi"),
      },
      leaves: {
        color: fd.get("leafColor"),
        spots: !!fd.get("leafSpots"),
        dry: !!fd.get("leafDry"),
        yellow: !!fd.get("leafYellow"),
        falling: !!fd.get("leafFalling"),
        pests: !!fd.get("leafPests"),
        notes: fd.get("leafNotes"),
      },
      wellness: { health: 80, hydration: 70, sun: 75 },
      history: [],
      photoGallery: [],
      generalState: fd.get("generalState") || "Buena",
      comments: fd.get("comments") || "",
    });
    H.savePlants(plants);
    $("#modalAddPlant").modal("hide");
    this.reset();
    initCurrentPage();
  });

  let pendingDeleteId = null;

  $(document).on("click", ".btn-delete", function () {
    pendingDeleteId = $(this).data("id");
    const plant = H.getPlantById(pendingDeleteId);
    $("#delete-plant-name").text(plant ? plant.name : "esta planta");
    $("#modalDeletePlant").modal("show");
  });

  $(document).on("click", "#confirmDeletePlant", function () {
    if (!pendingDeleteId) return;
    H.savePlants(H.loadPlants().filter((p) => p.id !== pendingDeleteId));
    H.saveReminders(
      H.loadReminders().filter((r) => r.plantId !== pendingDeleteId),
    );
    pendingDeleteId = null;
    $("#modalDeletePlant").modal("hide");
    initCurrentPage();
  });

  $(document).on("click", ".btn-add-gallery", function () {
    const id = $(this).data("id");
    const plant = H.getPlantById(id);
    $("#gallery-plant-id").val(id);
    $("#modalAddGalleryPhoto .modal-title").text(
      `Añadir foto — ${plant ? plant.name : "Planta"}`,
    );
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    $("#formAddGalleryPhoto")[0].reset();
    $("#gallery-plant-id").val(id);
    $("#formAddGalleryPhoto [name=month]").val(monthStr);
    $("#modalAddGalleryPhoto").modal("show");
  });

  $(document).on("submit", "#formAddGalleryPhoto", async function (e) {
    e.preventDefault();
    const fd = new FormData(this);
    const plantId = fd.get("plantId");
    const month = fd.get("month");
    const note = fd.get("note") || "";
    const file = fd.get("photo");
    if (!plantId || !month) return;

    let photoUrl = null;
    if (file && file.size) {
      photoUrl = await readFileAsDataURL(file);
    }
    if (!photoUrl) {
      alert("Selecciona una imagen para la galería.");
      return;
    }

    const plants = H.loadPlants();
    const plant = plants.find((p) => p.id === plantId);
    if (!plant) return;

    if (!plant.photoGallery) plant.photoGallery = [];
    const entry = {
      month,
      label: H.formatMonthLabel(month),
      photo: photoUrl,
      note,
    };
    const existing = plant.photoGallery.findIndex((g) => g.month === month);
    if (existing >= 0) plant.photoGallery[existing] = entry;
    else plant.photoGallery.push(entry);
    plant.photoGallery = H.sortPhotoGallery(plant.photoGallery);

    H.savePlants(plants);
    $("#modalAddGalleryPhoto").modal("hide");
    initCurrentPage();
  });

  function populatePlantSelects() {
    const plants = H.loadPlants();
    const opts = plants.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
    $("#plant-select-riego-modal, #plant-select-riego").html(opts);
    $("#reminder-plant").html(opts);
  }

  $(document).on("click", ".btn-record", function () {
    const id = $(this).data("id");
    $("#modalAddRiego").data("plantId", id);
    $("#plant-select-riego-modal").val(id);
    $("#modalAddRiego").modal("show");
  });

  $(document).on("submit", "#formAddRiego", function (e) {
    e.preventDefault();
    const fd = new FormData(this);
    const id = $("#modalAddRiego").data("plantId") || fd.get("plantId");
    const plants = H.loadPlants();
    const plant = plants.find((p) => p.id === id);
    if (!plant) return alert("Selecciona una planta");
    const date = fd.get("date") || new Date().toISOString();
    plant.history = plant.history || [];
    plant.history.push({
      date,
      amount: fd.get("amount"),
      method: fd.get("method"),
      notes: fd.get("notes"),
    });
    const next = new Date(date);
    const avg = H.computeAvgRiegoDays(plant) || 5;
    next.setDate(next.getDate() + Math.round(avg));
    plant.nextWater = next.toISOString();
    if (plant.wellness) plant.wellness.hydration = Math.min(95, plant.wellness.hydration + 15);
    H.savePlants(plants);
    const events = H.loadEvents();
    events.push({
      id: H.uid("ev_"),
      plantId: plant.id,
      type: "riego",
      date,
      title: `Riego ${plant.name}`,
    });
    H.saveEvents(events);
    $("#modalAddRiego").modal("hide");
    this.reset();
    initCurrentPage();
  });

  /* ── Consejos rotativos (portada) ── */
  let heroTipIndex = 0;
  let tipRotateTimer = null;
  const TIP_INTERVAL_MS = 5000;

  function initTipShowcase() {
    const $tip = $("#rotating-tip");
    const $dots = $("#tip-dots");
    const $counter = $("#tip-counter");
    if (!$tip.length || !H.HERO_TIPS.length) return;

    if (tipRotateTimer) clearInterval(tipRotateTimer);

    function renderDots() {
      if (!$dots.length) return;
      $dots.empty();
      H.HERO_TIPS.forEach((_, i) => {
        $dots.append(
          `<button type="button" class="tip-dot${i === heroTipIndex ? " active" : ""}" data-i="${i}" aria-label="Consejo ${i + 1}"></button>`,
        );
      });
      if ($counter.length) {
        $counter.text(`${heroTipIndex + 1} / ${H.HERO_TIPS.length}`);
      }
    }

    function showTip(index) {
      heroTipIndex = (index + H.HERO_TIPS.length) % H.HERO_TIPS.length;
      $tip.addClass("tip-fade-out");
      setTimeout(() => {
        $tip.text(H.HERO_TIPS[heroTipIndex]);
        $tip.removeClass("tip-fade-out");
        renderDots();
      }, 250);
    }

    renderDots();
    $tip.text(H.HERO_TIPS[heroTipIndex]);

    $(document).off("click.tipDot").on("click.tipDot", ".tip-dot", function () {
      showTip(+$(this).data("i"));
      startAutoRotate();
    });
    $("#tip-prev").off("click.tipNav").on("click.tipNav", () => {
      showTip(heroTipIndex - 1);
      startAutoRotate();
    });
    $("#tip-next").off("click.tipNav").on("click.tipNav", () => {
      showTip(heroTipIndex + 1);
      startAutoRotate();
    });

    function startAutoRotate() {
      if (tipRotateTimer) clearInterval(tipRotateTimer);
      tipRotateTimer = setInterval(() => showTip(heroTipIndex + 1), TIP_INTERVAL_MS);
    }
    startAutoRotate();
  }

  function renderTipBanner(message, title) {
    return `<div class="tip-banner"><strong>${title || "Aviso"}</strong><p>${message}</p></div>`;
  }

  /* ── Charts ── */
  let hydrationChart, riegosChart, growthChart;

  function getChartTheme() {
    const dark = document.body.classList.contains("dark-mode");
    return {
      text: dark ? "#e6efe6" : "#3f4a3a",
      grid: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    };
  }

  function baseChartOptions(extraScales) {
    const t = getChartTheme();
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: "easeOutQuart" },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: t.text, usePointStyle: true, padding: 16 } },
        tooltip: {
          backgroundColor: "rgba(45, 55, 40, 0.92)",
          padding: 12,
          cornerRadius: 10,
          displayColors: true,
        },
      },
      scales: extraScales || {
        x: { ticks: { color: t.text }, grid: { color: t.grid, drawBorder: false } },
        y: { ticks: { color: t.text }, grid: { color: t.grid, drawBorder: false } },
      },
    };
  }

  function applyChartTheme() {
    const t = getChartTheme();
    [hydrationChart, riegosChart, growthChart].forEach((ch) => {
      if (!ch) return;
      if (ch.options.plugins?.legend?.labels)
        ch.options.plugins.legend.labels.color = t.text;
      if (ch.options.scales) {
        Object.keys(ch.options.scales).forEach((axis) => {
          if (ch.options.scales[axis].ticks)
            ch.options.scales[axis].ticks.color = t.text;
          if (ch.options.scales[axis].grid)
            ch.options.scales[axis].grid.color = t.grid;
        });
      }
      ch.update("none");
    });
  }

  function initCharts() {
    if (!window.Chart) return;
    const ctxH = document.getElementById("chartHydration");
    const ctxR = document.getElementById("chartRiegos");
    const ctxG = document.getElementById("chartGrowth");
    const yScale100 = {
      y: { beginAtZero: true, max: 100, ticks: { color: getChartTheme().text }, grid: { color: getChartTheme().grid } },
      x: { ticks: { color: getChartTheme().text }, grid: { color: getChartTheme().grid } },
    };
    if (ctxH && !hydrationChart) {
      hydrationChart = new Chart(ctxH, {
        type: "bar",
        data: {
          labels: [],
          datasets: [{
            label: "Salud (%)",
            data: [],
            backgroundColor: "rgba(138,165,123,0.85)",
            borderRadius: 8,
            borderSkipped: false,
          }],
        },
        options: baseChartOptions(yScale100),
      });
    }
    if (ctxR && !riegosChart) {
      riegosChart = new Chart(ctxR, {
        type: "line",
        data: {
          labels: [],
          datasets: [{
            label: "Riegos",
            data: [],
            borderColor: "#5ba4c9",
            backgroundColor: "rgba(91,164,201,0.18)",
            fill: true,
            tension: 0.42,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: "#5ba4c9",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          }],
        },
        options: baseChartOptions(),
      });
    }
    if (ctxG && !growthChart) {
      growthChart = new Chart(ctxG, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Salud",
              data: [],
              borderColor: "#8aa57b",
              backgroundColor: "rgba(138,165,123,0.12)",
              fill: true,
              tension: 0.42,
              pointRadius: 5,
              pointHoverRadius: 8,
            },
            {
              label: "Hidratación",
              data: [],
              borderColor: "#5ba4c9",
              backgroundColor: "rgba(91,164,201,0.12)",
              fill: true,
              tension: 0.42,
              pointRadius: 5,
              pointHoverRadius: 8,
            },
          ],
        },
        options: baseChartOptions(yScale100),
      });
    }
    applyChartTheme();
  }

  function updateCharts() {
    const plants = H.loadPlants();
    if (hydrationChart) {
      hydrationChart.data.labels = plants.map((p) => p.name);
      hydrationChart.data.datasets[0].data = plants.map((p) => H.getWellness(p).health);
      hydrationChart.update();
    }
    if (riegosChart) {
      const weeks = [];
      const counts = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i * 7);
        weeks.push("Sem " + (4 - i));
        const start = new Date(d);
        start.setDate(start.getDate() - 7);
        counts.push(
          plants.reduce(
            (s, p) =>
              s +
              (p.history || []).filter((h) => {
                const dt = new Date(h.date);
                return dt >= start && dt <= d;
              }).length,
            0,
          ),
        );
      }
      riegosChart.data.labels = weeks;
      riegosChart.data.datasets[0].data = counts;
      riegosChart.update();
    }
    if (growthChart) {
      growthChart.data.labels = plants.map((p) => p.name);
      growthChart.data.datasets[0].data = plants.map((p) => H.getWellness(p).health);
      growthChart.data.datasets[1].data = plants.map((p) => H.getWellness(p).hydration);
      growthChart.update();
    }
  }

  /* ── Recordatorios ── */
  function renderReminders() {
    const $r = $("#reminders-list");
    if (!$r.length) return;
    const plants = H.loadPlants();
    const reminders = H.loadReminders();
    $r.empty();
    if (!reminders.length) {
      $r.html('<p class="text-muted">No hay recordatorios.</p>');
      return;
    }
    reminders
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((rem) => {
        const plant = plants.find((p) => p.id === rem.plantId);
        const name = plant ? plant.name : "Planta";
        const icons = { riego: "💧", fertilizacion: "🌱", poda: "✂️", maceta: "🪴", tratamiento: "💊" };
        $r.append(`
          <div class="card hydralia-card mb-2 p-3 d-flex flex-wrap justify-content-between align-items-center">
            <div>
              <strong>${icons[rem.type] || "🔔"} ${rem.message || rem.type}</strong>
              <br><small class="text-muted">${name} · ${H.formatDateTime(rem.date)}</small>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary reminder-done" data-id="${rem.id}">Marcar hecho</button>
            </div>
          </div>`);
      });
  }

  $(document).on("click", ".reminder-done", function () {
    const id = $(this).data("id");
    $(this).closest(".card").addClass("task-done");
    setTimeout(() => {
      H.saveReminders(H.loadReminders().filter((r) => r.id !== id));
      initCurrentPage();
    }, 400);
  });

  /* ── Páginas ── */
  const pages = {
    inicio: function () {
      renderHomeInsights();
      renderHomePlantChips($("#home-plants"), 2);
      initTipShowcase();
    },

    plantas: function () {
      renderPlantCards($("#plant-list"), { showDelete: true, showGallery: true });
    },

    dashboard: function () {
      renderStats();
      const insights = H.computeHomeInsights(H.loadPlants());
      $("#dashboard-dynamic-msg").html(`<p class="mb-0">${insights.bannerMessage}</p>`);
      renderHomePlantChips($("#dashboard-plants"), 3);
      const plants = H.loadPlants();
      const $ach = $("#achievements-preview");
      if ($ach.length) {
        $ach.empty();
        H.computeAchievements(plants).forEach((a) => {
          $ach.append(`
            <div class="achievement-item ${a.unlocked ? "unlocked" : "locked"}">
              <span class="achievement-icon">${a.icon}</span>
              <div><strong>${a.title}</strong><br><small>${a.desc}</small></div>
            </div>`);
        });
      }
      const $hist = $("#recent-history");
      if ($hist.length) {
        $hist.empty();
        const events = [];
        plants.forEach((p) =>
          (p.history || []).forEach((h) =>
            events.push({ plant: p.name, when: h.date, notes: h.notes }),
          ),
        );
        events.sort((a, b) => new Date(b.when) - new Date(a.when));
        if (!events.length) $hist.html('<p class="text-muted">Sin eventos.</p>');
        else
          events.slice(0, 8).forEach((ev) =>
            $hist.append(`<div class="mb-2"><strong>${ev.plant}</strong> — Riego · ${H.formatDateTime(ev.when)}<br><small class="text-muted">${ev.notes || ""}</small></div>`),
          );
      }
      initCharts();
      updateCharts();
      renderReminders();
    },

    riego: function () {
      const params = new URLSearchParams(location.search);
      const plantId = params.get("plant");
      const plants = H.loadPlants();
      const $list = $("#riego-history");
      const $alerts = $("#riego-alerts");
      $list.empty();
      if ($alerts.length) $alerts.empty();
      let allEvents = [];
      plants.forEach((p) => {
        (p.history || []).forEach((h) => {
          if (!plantId || p.id === plantId)
            allEvents.push({ ...h, plantName: p.name, plantId: p.id });
        });
      });
      allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
      if (!allEvents.length) {
        $list.html('<p class="text-muted">Sin riegos registrados.</p>');
        return;
      }
      allEvents.forEach((h) => {
        const avg = H.computeAvgRiegoDays(H.getPlantById(h.plantId));
        $list.append(`
          <div class="card hydralia-card mb-2 p-3">
            <div class="d-flex justify-content-between">
              <strong>${h.plantName}</strong>
              <span class="text-muted">${H.formatDateTime(h.date)}</span>
            </div>
            <p class="mb-0 small">${h.amount || "—"} · ${h.method || "—"}</p>
            ${h.notes ? `<p class="mb-0 small text-muted">${h.notes}</p>` : ""}
            ${avg ? `<p class="mb-0 small text-info">Frecuencia promedio: cada ${Math.round(avg)} días</p>` : ""}
          </div>`);
      });
      plants.forEach((p) => {
        const avg = H.computeAvgRiegoDays(p);
        const days = H.daysSinceLastRiego(p);
        if (avg && days !== null && days > avg + 1) {
          $("#riego-alerts").append(
            renderTipBanner(
              `Tu ${p.name} suele regarse cada ${Math.round(avg)} días. Han pasado ${days} días desde el último riego.`,
              "Recordatorio de riego",
            ),
          );
        }
      });
      if ($("#plant-select-riego").length) {
        $("#plant-select-riego").html(
          plants.map((p) => `<option value="${p.id}"${p.id === plantId ? " selected" : ""}>${p.name}</option>`).join(""),
        );
      }
    },

    suelo: function () {
      const plants = H.loadPlants();
      const $c = $("#suelo-content");
      $c.empty();
      plants.forEach((p) => {
        const s = p.soil || {};
        $c.append(`
          <div class="card hydralia-card mb-3 p-4" data-plant="${p.id}">
            <h5>${p.name}</h5>
            <form class="form-suelo" data-id="${p.id}">
              <div class="form-row">
                <div class="form-group col-md-3">
                  <label>Humedad</label>
                  <select name="humidity" class="form-control">
                    ${["Seca", "Húmeda", "Mojada"].map((o) => `<option${s.humidity === o ? " selected" : ""}>${o}</option>`).join("")}
                  </select>
                </div>
                <div class="form-group col-md-3">
                  <label>Compactación</label>
                  <select name="compaction" class="form-control">
                    ${["Suelo suelto", "Medianamente compacto", "Compactado"].map((o) => `<option${s.compaction === o ? " selected" : ""}>${o}</option>`).join("")}
                  </select>
                </div>
                <div class="form-group col-md-3">
                  <label>Drenaje</label>
                  <select name="drainage" class="form-control">
                    ${["Alto", "Medio", "Bajo"].map((o) => `<option${s.drainage === o ? " selected" : ""}>${o}</option>`).join("")}
                  </select>
                </div>
                <div class="form-group col-md-3 d-flex align-items-end">
                  <div class="form-check mb-3">
                    <input type="checkbox" name="fungi" class="form-check-input" id="fungi-${p.id}"${s.fungi ? " checked" : ""} />
                    <label class="form-check-label" for="fungi-${p.id}">Hongos</label>
                  </div>
                </div>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Guardar</button>
            </form>
          </div>`);
      });
    },

    hojas: function () {
      const plants = H.loadPlants();
      const $c = $("#hojas-content");
      $c.empty();
      plants.forEach((p) => {
        const l = p.leaves || {};
        $c.append(`
          <div class="card hydralia-card mb-3 p-4">
            <div class="d-flex flex-wrap">
              <img src="${plantPhotoUrl(p.photo)}" class="plant-card-img mr-3" alt="${p.name}" />
              <div style="flex:1">
                <h5>${p.name}</h5>
                <form class="form-hojas" data-id="${p.id}">
                  <div class="form-group">
                    <label>Color dominante</label>
                    <input name="color" class="form-control" value="${l.color || ""}" />
                  </div>
                  <div class="form-row">
                    ${[
                      ["spots", "Manchas"],
                      ["dry", "Hojas secas"],
                      ["yellow", "Hojas amarillas"],
                      ["falling", "Caída de hojas"],
                      ["pests", "Plagas"],
                    ]
                      .map(
                        ([k, label]) =>
                          `<div class="form-check col-md-4"><input type="checkbox" name="${k}" class="form-check-input" id="${k}-${p.id}"${l[k] ? " checked" : ""} /><label class="form-check-label" for="${k}-${p.id}">${label}</label></div>`,
                      )
                      .join("")}
                  </div>
                  <div class="form-group mt-2">
                    <label>Observaciones</label>
                    <textarea name="notes" class="form-control" rows="2">${l.notes || ""}</textarea>
                  </div>
                  <button type="submit" class="btn btn-primary btn-sm">Guardar observaciones</button>
                </form>
              </div>
            </div>
          </div>`);
      });
    },

    estado: function () {
      const plants = H.loadPlants();
      const $c = $("#estado-content");
      $c.empty();
      const states = ["Excelente", "Buena", "Regular", "Mala", "Crítica"];
      plants.forEach((p) => {
        $c.append(`
          <div class="card hydralia-card mb-3 p-4">
            <h5>${p.name}</h5>
            ${H.renderWellnessBars(p)}
            <form class="form-estado mt-3" data-id="${p.id}">
              <div class="form-group">
                <label>Estado general</label>
                <select name="generalState" class="form-control">
                  ${states.map((s) => `<option${p.generalState === s ? " selected" : ""}>${s}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label>Comentarios</label>
                <textarea name="comments" class="form-control" rows="2">${p.comments || ""}</textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Actualizar estado</button>
            </form>
          </div>`);
      });
    },

    consejos: function () {
      const plants = H.loadPlants();
      const $c = $("#consejos-content");
      $c.empty();
      let hasTips = false;
      plants.forEach((p) => {
        H.generateTips(p).forEach((tip) => {
          hasTips = true;
          $c.append(`<div class="tip-card ${tip.type === "danger" ? "danger-tip" : "alert-tip"}"><strong>${p.name}:</strong> ${tip.text}</div>`);
        });
      });
      if (!hasTips)
        $c.append('<p class="text-muted">Tus plantas están en buen estado. ¡Sigue así!</p>');
      $("#general-tips").html(
        H.HERO_TIPS.map(
          (t, i) =>
            `<div class="tip-card mb-2"><span class="text-muted small d-block mb-1">#${i + 1}</span>${t}</div>`,
        ).join(""),
      );
    },

    recordatorios: function () {
      renderReminders();
      const plants = H.loadPlants();
      if ($("#reminder-plant").length) {
        $("#reminder-plant").html(plants.map((p) => `<option value="${p.id}">${p.name}</option>`).join(""));
      }
    },

    calendario: (function () {
      let year, month;
      let bound = false;
      return function () {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      const $cal = $("#calendar-grid");
      const $title = $("#calendar-title");
      const $events = $("#calendar-events-list");
      if ($events.length) {
        $events.empty();
        H.loadEvents()
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .forEach((ev) => {
            const plant = H.getPlantById(ev.plantId);
            $events.append(`
              <div class="mb-2 small">
                <span class="calendar-dot dot-${ev.type}"></span>
                ${H.formatDate(ev.date)} — ${ev.title || ev.type}${plant ? ` (${plant.name})` : ""}
              </div>`);
          });
      }

      function renderCal(y, m) {
        $cal.empty();
        $title.text(
          new Date(y, m).toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
        );
        const first = new Date(y, m, 1);
        const last = new Date(y, m + 1, 0);
        let startDay = first.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;
        const events = H.loadEvents();
        const daysInMonth = last.getDate();
        const prevLast = new Date(y, m, 0).getDate();

        ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].forEach((d) =>
          $cal.append(`<div class="calendar-header">${d}</div>`),
        );

        for (let i = startDay - 1; i >= 0; i--) {
          $cal.append(`<div class="calendar-day other-month"><span class="day-num">${prevLast - i}</span></div>`);
        }
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = new Date(y, m, d).toDateString();
          const dayEvents = events.filter((e) => new Date(e.date).toDateString() === dateStr);
          const isToday = now.toDateString() === dateStr;
          const dots = dayEvents
            .map((e) => `<span class="calendar-dot dot-${e.type}" title="${e.title || e.type}"></span>`)
            .join("");
          $cal.append(`
            <div class="calendar-day${isToday ? " today" : ""}" title="${dayEvents.map((e) => e.title).join(", ")}">
              <span class="day-num">${d}</span>
              <div class="calendar-dots">${dots}</div>
            </div>`);
        }
        const totalCells = startDay + daysInMonth;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remaining; i++) {
          $cal.append(`<div class="calendar-day other-month"><span class="day-num">${i}</span></div>`);
        }
      }

      renderCal(year, month);
      if (!bound) {
        bound = true;
        $("#cal-prev").on("click", () => {
          month--;
          if (month < 0) { month = 11; year--; }
          renderCal(year, month);
        });
        $("#cal-next").on("click", () => {
          month++;
          if (month > 11) { month = 0; year++; }
          renderCal(year, month);
        });
      }
    };
    })(),

    logros: function () {
      const $c = $("#logros-content");
      $c.empty();
      H.computeAchievements(H.loadPlants()).forEach((a) => {
        $c.append(`
          <div class="achievement-item ${a.unlocked ? "unlocked" : "locked"}">
            <span class="achievement-icon">${a.icon}</span>
            <div style="flex:1">
              <strong>${a.title}</strong>
              <p class="mb-1 small text-muted">${a.desc}</p>
              <div class="progress" style="height:6px">
                <div class="progress-bar wellness-health" style="width:${a.progress}%"></div>
              </div>
            </div>
            <span>${a.unlocked ? "✅" : `${a.progress}%`}</span>
          </div>`);
      });
    },

    diagnostico: function () {
      /* inline form handled below */
    },

    perfil: function () {
      const plants = H.loadPlants();
      const insights = H.computeHomeInsights(plants);
      $("#profile-insights").html(`
        <div class="col-6 col-md-3 mb-3">
          <div class="insight-card insight-card--plants"><span class="insight-icon">🌱</span><div><div class="insight-value">${insights.count}</div><div class="insight-label">Plantas</div></div></div>
        </div>
        <div class="col-6 col-md-3 mb-3">
          <div class="insight-card insight-card--water"><span class="insight-icon">💧</span><div><div class="insight-value">${insights.needsWater}</div><div class="insight-label">Agua hoy</div></div></div>
        </div>
        <div class="col-6 col-md-3 mb-3">
          <div class="insight-card insight-card--sun"><span class="insight-icon">☀️</span><div><div class="insight-value">${insights.needsLight}</div><div class="insight-label">Más luz</div></div></div>
        </div>
        <div class="col-6 col-md-3 mb-3">
          <div class="insight-card insight-card--health"><span class="insight-icon">🟢</span><div><div class="insight-value">${insights.avgHealth}%</div><div class="insight-label">Salud media</div></div></div>
        </div>`);

      const $ach = $("#profile-achievements");
      $ach.empty();
      H.computeAchievements(plants)
        .filter((a) => a.unlocked)
        .slice(0, 4)
        .forEach((a) => {
          $ach.append(`<div class="achievement-item unlocked mb-2"><span class="achievement-icon">${a.icon}</span><div><strong>${a.title}</strong></div></div>`);
        });
      if (!$ach.children().length) $ach.html('<p class="text-muted small">Aún no hay logros desbloqueados.</p>');

      const $rem = $("#profile-reminders");
      $rem.empty();
      H.loadReminders()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3)
        .forEach((r) => {
          const p = plants.find((x) => x.id === r.plantId);
          $rem.append(`<p class="mb-2 small"><strong>🔔 ${r.message}</strong><br><span class="text-muted">${p ? p.name : "Planta"} · ${H.formatDateTime(r.date)}</span></p>`);
        });
      if (!$rem.children().length) $rem.html('<p class="text-muted small">No hay recordatorios pendientes.</p>');
    },
  };

  $(document).on("submit", ".form-suelo", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const fd = new FormData(this);
    const plants = H.loadPlants();
    const p = plants.find((x) => x.id === id);
    if (p) {
      p.soil = {
        humidity: fd.get("humidity"),
        compaction: fd.get("compaction"),
        drainage: fd.get("drainage"),
        fungi: !!fd.get("fungi"),
      };
      H.savePlants(plants);
      $(this).closest(".card").addClass("task-done");
    }
  });

  $(document).on("submit", ".form-hojas", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const fd = new FormData(this);
    const plants = H.loadPlants();
    const p = plants.find((x) => x.id === id);
    if (p) {
      p.leaves = {
        color: fd.get("color"),
        spots: !!fd.get("spots"),
        dry: !!fd.get("dry"),
        yellow: !!fd.get("yellow"),
        falling: !!fd.get("falling"),
        pests: !!fd.get("pests"),
        notes: fd.get("notes"),
      };
      H.savePlants(plants);
      $(this).closest(".card").addClass("task-done");
    }
  });

  $(document).on("submit", ".form-estado", function (e) {
    e.preventDefault();
    const id = $(this).data("id");
    const fd = new FormData(this);
    const plants = H.loadPlants();
    const p = plants.find((x) => x.id === id);
    if (p) {
      p.generalState = fd.get("generalState");
      p.comments = fd.get("comments");
      const w = H.getWellness(p);
      w.health = H.mapStateToValue(p.generalState);
      p.wellness = w;
      H.savePlants(plants);
      $(this).closest(".card").addClass("task-done");
    }
  });

  $(document).on("submit", "#formAddReminder", function (e) {
    e.preventDefault();
    const fd = new FormData(this);
    const reminders = H.loadReminders();
    reminders.push({
      id: H.uid("rem_"),
      plantId: fd.get("plantId"),
      type: fd.get("type"),
      date: fd.get("date") || new Date().toISOString(),
      message: fd.get("message"),
    });
    H.saveReminders(reminders);
    this.reset();
    initCurrentPage();
  });

  $(document).on("submit", "#formDiagnostico", function (e) {
    e.preventDefault();
    const symptoms = [];
    $(this).find('input[name="symptom"]:checked').each(function () {
      symptoms.push($(this).val());
    });
    const $out = $("#diagnostic-result");
    $out.empty();
    if (!symptoms.length) {
      $out.html('<p class="text-muted">Selecciona al menos un síntoma.</p>');
      return;
    }
    symptoms.forEach((s) => {
      const d = H.DIAGNOSTIC_MAP[s];
      if (d)
        $out.append(`
          <div class="diagnostic-result-item">
            <strong>${d.label}</strong>
            <p class="mb-1"><em>Causas:</em> ${d.causes}</p>
            <p class="mb-0"><em>Solución:</em> ${d.solution}</p>
          </div>`);
    });
  });

  function initCurrentPage() {
    populatePlantSelects();
    renderStats();
    const fn = pages[page];
    if (fn) fn();
    updateCharts();
  }

  window.addEventListener("hydralia:updated", initCurrentPage);
  window.addEventListener("hydralia:theme-changed", applyChartTheme);

  $(function () {
    initCurrentPage();
    $(document).on("shown.bs.modal", "#modalAddRiego", populatePlantSelects);
  });
})();
