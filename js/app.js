/* Hydralia — capa de datos y utilidades (frontend demo) */
window.Hydralia = (function () {
  const STORAGE_KEY = "hydralia_plants_v1";
  const EVENTS_KEY = "hydralia_events_v1";
  const REMINDERS_KEY = "hydralia_reminders_v1";

  const HERO_TIPS = [
    "Las plantas respiran mejor si limpias sus hojas con un paño húmedo una vez al mes.",
    "Riega por la mañana para que el exceso de humedad se evapore durante el día.",
    "Un buen drenaje es tan importante como la frecuencia de riego.",
    "Gira tus macetas cada semana para un crecimiento uniforme hacia la luz.",
    "No riegues por calendario: revisa siempre la humedad del sustrato antes.",
    "Las suculentas prefieren suelo seco entre riegos; menos es más.",
    "La luz indirecta brillante funciona para la mayoría de plantas de interior.",
    "Retira hojas secas para evitar que atraigan plagas o hongos.",
    "En invierno, la mayoría de plantas necesitan menos agua y fertilizante.",
    "Aerar el sustrato mejora la oxigenación de las raíces.",
  ];

  const DIAGNOSTIC_MAP = {
    hojas_amarillas: {
      label: "Hojas amarillas",
      causes: "Exceso de riego, deficiencia de nutrientes o falta de luz.",
      solution: "Revisa el drenaje, reduce el riego y coloca la planta en un lugar más luminoso.",
    },
    hojas_marrones: {
      label: "Hojas marrones",
      causes: "Quemaduras solares, riego insuficiente o baja humedad ambiental.",
      solution: "Protege del sol directo, ajusta el riego y considera un humidificador.",
    },
    crecimiento_lento: {
      label: "Crecimiento lento",
      causes: "Falta de nutrientes, maceta pequeña o temperatura inadecuada.",
      solution: "Fertiliza en primavera-verano y evalúa si necesita trasplante.",
    },
    tallos_blandos: {
      label: "Tallos blandos",
      causes: "Pudrición por exceso de agua o ataque de plagas en la base.",
      solution: "Revisa las raíces, reduce el riego y elimina partes afectadas.",
    },
    insectos: {
      label: "Presencia de insectos",
      causes: "Plagas como áfidos, cochinillas o araña roja.",
      solution: "Inspecciona hojas y tallos; aplica jabón potásico o alcohol diluido.",
    },
    caida_hojas: {
      label: "Caída de hojas",
      causes: "Cambio brusco de ambiente, estrés hídrico o corrientes de aire.",
      solution: "Mantén condiciones estables y evita mover la planta con frecuencia.",
    },
  };

  function uid(prefix) {
    return (prefix || "p_") + Math.random().toString(36).slice(2, 9);
  }

  function loadPlants() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function savePlants(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("hydralia:updated"));
  }

  function loadEvents() {
    try {
      return JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveEvents(list) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("hydralia:updated"));
  }

  function loadReminders() {
    try {
      return JSON.parse(localStorage.getItem(REMINDERS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveReminders(list) {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("hydralia:updated"));
  }

  const DEMO_VERSION = "2";

  function ensureSampleData() {
    if (localStorage.getItem("hydralia_demo_version") !== DEMO_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EVENTS_KEY);
      localStorage.removeItem(REMINDERS_KEY);
      localStorage.setItem("hydralia_demo_version", DEMO_VERSION);
    }
    const existing = loadPlants();
    if (existing.length) return;

    const now = new Date();
    const daysAgo = (d) =>
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - d).toISOString();

    const p1 = {
      id: "sample_1",
      name: "Potus",
      species: "Pothos (Epipremnum)",
      acquired: daysAgo(30),
      location: "Interior",
      potSize: "14 cm",
      substrate: "Ligero, drenante",
      photo: "img/IMG-20260507-WA0027.jpg",
      leafPhoto: null,
      soil: {
        humidity: "Húmeda",
        compaction: "Suelo suelto",
        drainage: "Medio",
        fungi: false,
      },
      leaves: {
        color: "Verde",
        spots: false,
        dry: false,
        yellow: true,
        falling: false,
        pests: false,
        notes: "Alguna hoja amarilla en la base",
      },
      wellness: { health: 90, hydration: 70, sun: 85 },
      history: [
        {
          date: daysAgo(7),
          amount: "200 ml",
          method: "Regadera",
          notes: "Riego completo",
        },
        {
          date: daysAgo(2),
          amount: "150 ml",
          method: "Regadera",
          notes: "Agua filtrada",
        },
      ],
      nextWater: daysAgo(-3),
      generalState: "Buena",
      comments: "Las hojas inferiores comenzaron a amarillear.",
    };

    const p2 = {
      id: "sample_2",
      name: "Suculenta Jade",
      species: "Crassula ovata",
      acquired: daysAgo(90),
      location: "Balcón",
      potSize: "10 cm",
      substrate: "Arenoso",
      photo: "img/IMG-20260512-WA0013.jpg",
      leafPhoto: null,
      soil: {
        humidity: "Seca",
        compaction: "Medianamente compacto",
        drainage: "Alto",
        fungi: false,
      },
      leaves: {
        color: "Verde claro",
        spots: false,
        dry: false,
        yellow: false,
        falling: false,
        pests: false,
        notes: "",
      },
      wellness: { health: 95, hydration: 55, sun: 92 },
      history: [
        {
          date: daysAgo(20),
          amount: "50 ml",
          method: "Regadera",
          notes: "",
        },
        {
          date: daysAgo(5),
          amount: "60 ml",
          method: "Regadera",
          notes: "Suelo completamente seco",
        },
      ],
      nextWater: daysAgo(-8),
      generalState: "Excelente",
      comments: "Crecimiento vigoroso en el balcón.",
    };

    savePlants([p1, p2]);

    const events = [
      { id: uid("ev_"), plantId: "sample_1", type: "riego", date: daysAgo(2), title: "Riego Potus" },
      { id: uid("ev_"), plantId: "sample_1", type: "riego", date: daysAgo(7), title: "Riego Potus" },
      { id: uid("ev_"), plantId: "sample_2", type: "riego", date: daysAgo(5), title: "Riego Suculenta" },
      { id: uid("ev_"), plantId: "sample_1", type: "fertilizacion", date: daysAgo(-5), title: "Fertilizar Potus" },
      { id: uid("ev_"), plantId: "sample_2", type: "poda", date: daysAgo(-12), title: "Poda Suculenta" },
      { id: uid("ev_"), plantId: "sample_1", type: "evento", date: daysAgo(-1), title: "Revisión mensual" },
    ];
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

    const reminders = [
      {
        id: uid("rem_"),
        plantId: "sample_1",
        type: "riego",
        date: daysAgo(-3),
        message: "Regar Potus",
      },
      {
        id: uid("rem_"),
        plantId: "sample_2",
        type: "riego",
        date: daysAgo(-8),
        message: "Regar Suculenta Jade",
      },
      {
        id: uid("rem_"),
        plantId: "sample_1",
        type: "fertilizacion",
        date: daysAgo(-5),
        message: "Fertilizar Potus",
      },
      {
        id: uid("rem_"),
        plantId: "sample_2",
        type: "maceta",
        date: daysAgo(-20),
        message: "Evaluar cambio de maceta",
      },
    ];
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  }

  function computeAvgRiegoDays(p) {
    const h = (p.history || [])
      .map((x) => new Date(x.date))
      .sort((a, b) => a - b);
    if (h.length < 2) return null;
    let total = 0;
    for (let i = 1; i < h.length; i++) total += h[i] - h[i - 1];
    return total / (h.length - 1) / (1000 * 60 * 60 * 24);
  }

  function daysSinceLastRiego(p) {
    const h = (p.history || [])
      .map((x) => new Date(x.date))
      .sort((a, b) => b - a);
    if (!h.length) return null;
    return Math.floor((Date.now() - h[0]) / (1000 * 60 * 60 * 24));
  }

  function mapStateToValue(s) {
    const map = {
      Excelente: 95,
      Buena: 75,
      Regular: 50,
      Mala: 25,
      Crítica: 10,
    };
    return map[s] || 60;
  }

  function getWellness(p) {
    if (p.wellness) return p.wellness;
    const base = mapStateToValue(p.generalState);
    return {
      health: base,
      hydration: p.soil?.humidity === "Seca" ? 40 : p.soil?.humidity === "Mojada" ? 90 : 70,
      sun: p.location === "Exterior" || p.location === "Balcón" ? 90 : 75,
    };
  }

  function generateTips(p) {
    const tips = [];
    if (p.soil) {
      if (p.soil.humidity === "Mojada")
        tips.push({
          type: "danger",
          text: "El suelo permanece mojado durante más de 10 días. Podría existir exceso de riego.",
        });
      if (p.soil.humidity === "Seca")
        tips.push({
          type: "alert",
          text: "El suelo está seco; considera regar pronto o aumentar ligeramente la cantidad.",
        });
      if (p.soil.fungi)
        tips.push({
          type: "danger",
          text: "Detectada posible presencia de hongos; ventila y considera trasplante.",
        });
      if (p.soil.drainage === "Bajo")
        tips.push({
          type: "alert",
          text: "El drenaje es bajo; considera cambiar a una maceta con mejor drenaje.",
        });
    }
    if (p.leaves) {
      const notes = (p.leaves.notes || "").toLowerCase();
      if (p.leaves.yellow || notes.includes("amarill"))
        tips.push({
          type: "alert",
          text: "Se registran varias hojas amarillas. Revisa la iluminación y el drenaje.",
        });
      if (p.leaves.pests)
        tips.push({
          type: "danger",
          text: "Posible presencia de plagas. Inspecciona y aplica tratamiento localizado.",
        });
    }
    const avg = computeAvgRiegoDays(p);
    const days = daysSinceLastRiego(p);
    if (avg && days !== null && days > avg + 2)
      tips.push({
        type: "alert",
        text: `Tu ${p.name} suele regarse cada ${Math.round(avg)} días. Han pasado ${days} días desde el último riego.`,
      });
    if (p.generalState === "Mala" || p.generalState === "Crítica")
      tips.push({
        type: "danger",
        text: "Estado general preocupante. Revisa riego, luz y posibles plagas.",
      });
    return tips;
  }

  function computeAchievements(plants) {
    const totalRiegos = plants.reduce(
      (s, p) => s + (p.history ? p.history.length : 0),
      0,
    );
    const healthy = plants.filter(
      (p) => p.generalState === "Excelente" || p.generalState === "Buena",
    ).length;

    const oldest = plants.reduce((min, p) => {
      if (!p.acquired) return min;
      const d = new Date(p.acquired);
      return !min || d < min ? d : min;
    }, null);
    const daysSinceFirst = oldest
      ? Math.floor((Date.now() - oldest) / (1000 * 60 * 60 * 24))
      : 0;

    return [
      {
        id: "first_month",
        icon: "🌱",
        title: "Primer mes cuidando una planta",
        desc: "Registra plantas y cuídalas al menos 30 días.",
        unlocked: daysSinceFirst >= 30,
        progress: Math.min(100, Math.round((daysSinceFirst / 30) * 100)),
      },
      {
        id: "ten_waterings",
        icon: "💧",
        title: "10 riegos completados",
        desc: "Registra 10 riegos en total.",
        unlocked: totalRiegos >= 10,
        progress: Math.min(100, Math.round((totalRiegos / 10) * 100)),
      },
      {
        id: "five_healthy",
        icon: "🌿",
        title: "5 plantas saludables",
        desc: "Mantén 5 plantas en estado Buena o Excelente.",
        unlocked: healthy >= 5,
        progress: Math.min(100, Math.round((healthy / 5) * 100)),
      },
    ];
  }

  function renderWellnessBars(p) {
    const w = getWellness(p);
    return `
      <div class="wellness-bars">
        <div class="wellness-item">
          <label><span>🌿 Salud</span><span>${w.health}%</span></label>
          <div class="progress"><div class="progress-bar wellness-health" style="width:${w.health}%"></div></div>
        </div>
        <div class="wellness-item">
          <label><span>💧 Hidratación</span><span>${w.hydration}%</span></label>
          <div class="progress"><div class="progress-bar wellness-hydration" style="width:${w.hydration}%"></div></div>
        </div>
        <div class="wellness-item">
          <label><span>☀️ Exposición solar</span><span>${w.sun}%</span></label>
          <div class="progress"><div class="progress-bar wellness-sun" style="width:${w.sun}%"></div></div>
        </div>
      </div>`;
  }

  function renderPlantSelect(id, selectedId) {
    const plants = loadPlants();
    let html = `<select id="${id}" class="form-control custom-select">`;
    html += `<option value="">— Seleccionar planta —</option>`;
    plants.forEach((p) => {
      html += `<option value="${p.id}"${p.id === selectedId ? " selected" : ""}>${p.name}</option>`;
    });
    html += `</select>`;
    return html;
  }

  function getPlantById(id) {
    return loadPlants().find((p) => p.id === id);
  }

  function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("es-ES");
  }

  return {
    STORAGE_KEY,
    HERO_TIPS,
    DIAGNOSTIC_MAP,
    uid,
    loadPlants,
    savePlants,
    loadEvents,
    saveEvents,
    loadReminders,
    saveReminders,
    ensureSampleData,
    computeAvgRiegoDays,
    daysSinceLastRiego,
    mapStateToValue,
    getWellness,
    generateTips,
    computeAchievements,
    renderWellnessBars,
    renderPlantSelect,
    getPlantById,
    formatDate,
    formatDateTime,
  };
})();
