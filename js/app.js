/* Hydralia — capa de datos y utilidades (frontend demo) */
window.Hydralia = (function () {
  const STORAGE_KEY = "hydralia_plants_v1";
  const EVENTS_KEY = "hydralia_events_v1";
  const REMINDERS_KEY = "hydralia_reminders_v1";

  function userSuffix() {
    const A = window.HydraliaAuth;
    const id = A && A.getUserId && A.getUserId();
    return id ? "_" + id : "";
  }

  function storageKey(base) {
    return base + userSuffix();
  }

  function demoVersionKey() {
    return "hydralia_demo_version" + userSuffix();
  }

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
      return JSON.parse(localStorage.getItem(storageKey(STORAGE_KEY)) || "[]");
    } catch (e) {
      return [];
    }
  }

  function savePlants(list) {
    localStorage.setItem(storageKey(STORAGE_KEY), JSON.stringify(list));
    window.dispatchEvent(new Event("hydralia:updated"));
  }

  function loadEvents() {
    try {
      return JSON.parse(localStorage.getItem(storageKey(EVENTS_KEY)) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveEvents(list) {
    localStorage.setItem(storageKey(EVENTS_KEY), JSON.stringify(list));
    window.dispatchEvent(new Event("hydralia:updated"));
  }

  function loadReminders() {
    try {
      return JSON.parse(localStorage.getItem(storageKey(REMINDERS_KEY)) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveReminders(list) {
    localStorage.setItem(storageKey(REMINDERS_KEY), JSON.stringify(list));
    window.dispatchEvent(new Event("hydralia:updated"));
  }

  const DEMO_VERSION = "7";

  function ensureSampleData() {
    const versionKey = demoVersionKey();
    const plantsKey = storageKey(STORAGE_KEY);
    const eventsKey = storageKey(EVENTS_KEY);
    const remindersKey = storageKey(REMINDERS_KEY);

    if (
      window.HydraliaAuth &&
      HydraliaAuth.getUserId() === "user_demo" &&
      !localStorage.getItem(plantsKey) &&
      localStorage.getItem(STORAGE_KEY)
    ) {
      localStorage.setItem(plantsKey, localStorage.getItem(STORAGE_KEY));
      if (localStorage.getItem(EVENTS_KEY)) {
        localStorage.setItem(eventsKey, localStorage.getItem(EVENTS_KEY));
      }
      if (localStorage.getItem(REMINDERS_KEY)) {
        localStorage.setItem(remindersKey, localStorage.getItem(REMINDERS_KEY));
      }
    }

    if (localStorage.getItem(versionKey) !== DEMO_VERSION) {
      localStorage.removeItem(plantsKey);
      localStorage.removeItem(eventsKey);
      localStorage.removeItem(remindersKey);
      localStorage.setItem(versionKey, DEMO_VERSION);
    }
    const existing = loadPlants();
    if (existing.length) return;

    const now = new Date();
    const daysAgo = (d) =>
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - d).toISOString();

    const streakHistory = (count) => {
      const notes = [
        "Riego de hoy — racha activa",
        "Riego y revisión de hojas",
        "Agua filtrada, suelo húmedo",
        "Riego ligero por la mañana",
        "Control de humedad del sustrato",
        "Riego completo en maceta",
        "Riego y limpieza de hojas",
      ];
      return Array.from({ length: count }, (_, i) => ({
        date: daysAgo(i),
        amount: i === 0 ? "180 ml" : "150 ml",
        method: "Regadera",
        notes: notes[i] || "Riego diario de la racha",
      }));
    };

    const p1 = {
      id: "sample_1",
      name: "Potus",
      species: "Pothos (Epipremnum)",
      acquired: daysAgo(30),
      location: "Interior",
      potSize: "14 cm",
      substrate: "Ligero, drenante",
      photo: "img/Potus.jpg",
      leafPhoto: null,
      photoGallery: [
        {
          month: "2026-02",
          label: "Febrero 2026",
          photo: "img/potus1.webp",
          note: "Recién trasplantado a maceta colgante.",
        },
        {
          month: "2026-03",
          label: "Marzo 2026",
          photo: "img/potus2.webp",
          note: "Primeras hojas nuevas tras el invierno.",
        },
        {
          month: "2026-04",
          label: "Abril 2026",
          photo: "img/potus3.webp",
          note: "Ramas más largas; buena luz indirecta.",
        },
        {
          month: "2026-05",
          label: "Mayo 2026",
          photo: "img/Potus.jpg",
          note: "Crecimiento vigoroso en primavera.",
        },
      ],
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
        ...streakHistory(7),
        {
          date: daysAgo(12),
          amount: "200 ml",
          method: "Regadera",
          notes: "Riego profundo semanal",
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
      photo: "img/Suculenta Jade.webp",
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

    const p3 = {
      id: "sample_3",
      name: "Monstera",
      species: "Monstera deliciosa",
      acquired: daysAgo(45),
      location: "Interior",
      potSize: "18 cm",
      substrate: "Fibra de coco y perlita",
      photo: "img/Monstera.webp",
      leafPhoto: null,
      soil: {
        humidity: "Húmeda",
        compaction: "Suelo suelto",
        drainage: "Alto",
        fungi: false,
      },
      leaves: {
        color: "Verde oscuro",
        spots: false,
        dry: false,
        yellow: false,
        falling: false,
        pests: false,
        notes: "Nueva hoja con fenestraciones",
      },
      wellness: { health: 88, hydration: 75, sun: 80 },
      history: [
        { date: daysAgo(10), amount: "250 ml", method: "Regadera", notes: "Riego profundo" },
        { date: daysAgo(3), amount: "200 ml", method: "Regadera", notes: "" },
      ],
      nextWater: daysAgo(-4),
      generalState: "Buena",
      comments: "Crece bien cerca de la ventana orientada al este.",
    };

    const p4 = {
      id: "sample_4",
      name: "Lengua de suegra",
      species: "Sansevieria trifasciata",
      acquired: daysAgo(120),
      location: "Interior",
      potSize: "12 cm",
      substrate: "Arena y tierra universal",
      photo: "img/Lengua de suegra.jpg",
      leafPhoto: null,
      soil: {
        humidity: "Seca",
        compaction: "Medianamente compacto",
        drainage: "Alto",
        fungi: false,
      },
      leaves: {
        color: "Verde bandeado",
        spots: false,
        dry: false,
        yellow: false,
        falling: false,
        pests: false,
        notes: "",
      },
      wellness: { health: 92, hydration: 50, sun: 70 },
      history: [
        { date: daysAgo(25), amount: "80 ml", method: "Regadera", notes: "" },
        { date: daysAgo(12), amount: "70 ml", method: "Regadera", notes: "Invierno, poca agua" },
      ],
      nextWater: daysAgo(-10),
      generalState: "Excelente",
      comments: "Muy resistente; ideal para principiantes.",
    };

    const p5 = {
      id: "sample_5",
      name: "Lavanda",
      species: "Lavandula angustifolia",
      acquired: daysAgo(60),
      location: "Exterior",
      potSize: "16 cm",
      substrate: "Calizo, bien drenado",
      photo: "img/Lavanda.webp",
      leafPhoto: null,
      soil: {
        humidity: "Seca",
        compaction: "Suelo suelto",
        drainage: "Alto",
        fungi: false,
      },
      leaves: {
        color: "Verde grisáceo",
        spots: false,
        dry: false,
        yellow: false,
        falling: false,
        pests: false,
        notes: "Aroma intenso al tacto",
      },
      wellness: { health: 85, hydration: 60, sun: 95 },
      history: [
        { date: daysAgo(14), amount: "100 ml", method: "Regadera", notes: "" },
        { date: daysAgo(6), amount: "90 ml", method: "Regadera", notes: "Mañana soleada" },
      ],
      nextWater: daysAgo(-5),
      generalState: "Buena",
      comments: "Floreció la semana pasada; podar después de floración.",
    };

    savePlants([p1, p2, p3, p4, p5]);

    const events = [
      ...Array.from({ length: 7 }, (_, i) => ({
        id: uid("ev_"),
        plantId: "sample_1",
        type: "riego",
        date: daysAgo(i),
        title: i === 0 ? "Riego Potus (hoy)" : "Riego Potus — racha día " + (7 - i),
      })),
      { id: uid("ev_"), plantId: "sample_2", type: "riego", date: daysAgo(5), title: "Riego Suculenta" },
      { id: uid("ev_"), plantId: "sample_3", type: "riego", date: daysAgo(3), title: "Riego Monstera" },
      { id: uid("ev_"), plantId: "sample_4", type: "riego", date: daysAgo(12), title: "Riego Sansevieria" },
      { id: uid("ev_"), plantId: "sample_5", type: "riego", date: daysAgo(6), title: "Riego Lavanda" },
      { id: uid("ev_"), plantId: "sample_1", type: "fertilizacion", date: daysAgo(-5), title: "Fertilizar Potus" },
      { id: uid("ev_"), plantId: "sample_2", type: "poda", date: daysAgo(-12), title: "Poda Suculenta" },
      { id: uid("ev_"), plantId: "sample_3", type: "fertilizacion", date: daysAgo(-8), title: "Fertilizar Monstera" },
      { id: uid("ev_"), plantId: "sample_5", type: "poda", date: daysAgo(-3), title: "Poda Lavanda" },
      { id: uid("ev_"), plantId: "sample_1", type: "evento", date: daysAgo(-1), title: "Revisión mensual" },
      { id: uid("ev_"), plantId: "sample_4", type: "maceta", date: daysAgo(-15), title: "Trasplante Sansevieria" },
    ];
    localStorage.setItem(storageKey(EVENTS_KEY), JSON.stringify(events));

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
      {
        id: uid("rem_"),
        plantId: "sample_3",
        type: "riego",
        date: daysAgo(-4),
        message: "Regar Monstera",
      },
      {
        id: uid("rem_"),
        plantId: "sample_4",
        type: "riego",
        date: daysAgo(-10),
        message: "Regar Lengua de suegra",
      },
      {
        id: uid("rem_"),
        plantId: "sample_5",
        type: "poda",
        date: daysAgo(-7),
        message: "Podar Lavanda tras floración",
      },
    ];
    localStorage.setItem(storageKey(REMINDERS_KEY), JSON.stringify(reminders));
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
    const excellent = plants.filter((p) => p.generalState === "Excelente").length;
    const locations = new Set(plants.map((p) => p.location).filter(Boolean)).size;
    const outdoor = plants.some((p) =>
      ["Exterior", "Balcón", "Terraza"].includes(p.location),
    );
    const maxHealth = plants.reduce(
      (max, p) => Math.max(max, getWellness(p).health),
      0,
    );
    const events = loadEvents();
    const eventTypes = new Set(events.map((e) => e.type)).size;

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
        id: "first_plant",
        icon: "🪴",
        title: "Primera planta registrada",
        desc: "Añade tu primera planta al diario.",
        unlocked: plants.length >= 1,
        progress: Math.min(100, plants.length >= 1 ? 100 : 0),
      },
      {
        id: "three_plants",
        icon: "🌿",
        title: "Pequeño jardín",
        desc: "Registra al menos 3 plantas.",
        unlocked: plants.length >= 3,
        progress: Math.min(100, Math.round((plants.length / 3) * 100)),
      },
      {
        id: "five_plants",
        icon: "🏡",
        title: "Coleccionista verde",
        desc: "Cuida 5 plantas o más en tu diario.",
        unlocked: plants.length >= 5,
        progress: Math.min(100, Math.round((plants.length / 5) * 100)),
      },
      {
        id: "first_month",
        icon: "🌱",
        title: "Primer mes cuidando plantas",
        desc: "Lleva al menos 30 días registrando el cuidado.",
        unlocked: daysSinceFirst >= 30,
        progress: Math.min(100, Math.round((daysSinceFirst / 30) * 100)),
      },
      {
        id: "three_months",
        icon: "📅",
        title: "Tres meses de constancia",
        desc: "Mantén tu diario activo durante 90 días.",
        unlocked: daysSinceFirst >= 90,
        progress: Math.min(100, Math.round((daysSinceFirst / 90) * 100)),
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
        id: "twenty_waterings",
        icon: "🚿",
        title: "20 riegos completados",
        desc: "Lleva un historial de 20 riegos.",
        unlocked: totalRiegos >= 20,
        progress: Math.min(100, Math.round((totalRiegos / 20) * 100)),
      },
      {
        id: "five_healthy",
        icon: "❤️",
        title: "5 plantas saludables",
        desc: "Mantén 5 plantas en estado Buena o Excelente.",
        unlocked: healthy >= 5,
        progress: Math.min(100, Math.round((healthy / 5) * 100)),
      },
      {
        id: "all_excellent",
        icon: "⭐",
        title: "Jardín impecable",
        desc: "Ten 3 plantas en estado Excelente a la vez.",
        unlocked: excellent >= 3,
        progress: Math.min(100, Math.round((excellent / 3) * 100)),
      },
      {
        id: "outdoor_gardener",
        icon: "☀️",
        title: "Jardinero exterior",
        desc: "Cuida al menos una planta en exterior o balcón.",
        unlocked: outdoor,
        progress: outdoor ? 100 : 0,
      },
      {
        id: "varied_spaces",
        icon: "🏠",
        title: "Espacios variados",
        desc: "Planta en 3 ubicaciones distintas (interior, balcón, exterior…).",
        unlocked: locations >= 3,
        progress: Math.min(100, Math.round((locations / 3) * 100)),
      },
      {
        id: "peak_health",
        icon: "💚",
        title: "Salud al máximo",
        desc: "Consigue que una planta alcance 95% de salud.",
        unlocked: maxHealth >= 95,
        progress: Math.min(100, Math.round((maxHealth / 95) * 100)),
      },
      {
        id: "event_explorer",
        icon: "📋",
        title: "Diario completo",
        desc: "Registra eventos de al menos 4 tipos distintos.",
        unlocked: eventTypes >= 4,
        progress: Math.min(100, Math.round((eventTypes / 4) * 100)),
      },
    ];
  }

  function computeHappiness(p) {
    const w = getWellness(p);
    const tips = generateTips(p);
    let score = Math.round(w.health * 0.4 + w.hydration * 0.3 + w.sun * 0.3);
    if (tips.some((t) => t.type === "danger")) score -= 15;
    else if (tips.some((t) => t.type === "alert")) score -= 8;
    score = Math.max(0, Math.min(100, score));

    const reasons = [];
    if (w.hydration >= 60)
      reasons.push({ ok: true, text: "Bien hidratada" });
    else reasons.push({ ok: false, text: "Necesita agua pronto" });

    if (w.sun >= 70) reasons.push({ ok: true, text: "Buena iluminación" });
    else reasons.push({ ok: false, text: "Necesita más luz" });

    if (!tips.some((t) => t.type === "danger"))
      reasons.push({ ok: true, text: "Sin signos de enfermedad" });
    else reasons.push({ ok: false, text: "Revisar posibles problemas" });

    return { score, reasons };
  }

  function getPlantMessage(p) {
    const h = computeHappiness(p);
    if (h.score >= 90)
      return `Tu ${p.name} está creciendo muy bien esta semana 🌱`;
    if (h.score >= 75) return `${p.name} se ve bien, sigue así 💚`;
    if (h.score >= 55) return `${p.name} necesita un poco de atención 🌿`;
    return `${p.name} requiere cuidados urgentes ⚠️`;
  }

  function computeHomeInsights(plants) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const needsWater = plants.filter((p) => {
      if (!p.nextWater) {
        const days = daysSinceLastRiego(p);
        const avg = computeAvgRiegoDays(p);
        return avg && days !== null && days >= avg;
      }
      const d = new Date(p.nextWater);
      d.setHours(0, 0, 0, 0);
      return d <= today;
    }).length;

    const needsLight = plants.filter((p) => getWellness(p).sun < 70).length;
    const avgHealth = plants.length
      ? Math.round(
          plants.reduce((s, p) => s + getWellness(p).health, 0) / plants.length,
        )
      : 0;

    const thriving = plants
      .slice()
      .sort((a, b) => computeHappiness(b).score - computeHappiness(a).score)[0];

    let bannerMessage = "Añade tu primera planta para empezar el diario 🪴";
    if (plants.length) {
      if (needsWater > 0)
        bannerMessage = `💧 ${needsWater} planta${needsWater > 1 ? "s" : ""} necesita${needsWater === 1 ? "" : "n"} agua hoy`;
      else if (thriving && computeHappiness(thriving).score >= 88)
        bannerMessage = getPlantMessage(thriving);
      else
        bannerMessage = `${plants.length} plantas bajo cuidado · salud promedio ${avgHealth}%`;
    }

    return {
      count: plants.length,
      needsWater,
      needsLight,
      avgHealth,
      bannerMessage,
    };
  }

  function renderWellnessRing(label, value, icon, color) {
    return `
      <div class="wellness-ring-item">
        <div class="ring-meter" style="--pct:${value};--ring-color:${color}" title="${label}">
          <span>${icon}<br>${value}%</span>
        </div>
        <small>${label}</small>
      </div>`;
  }

  function renderWellnessRings(p) {
    const w = getWellness(p);
    const happy = computeHappiness(p).score;
    return `
      <div class="wellness-rings">
        ${renderWellnessRing("Salud", w.health, "🌿", "#8aa57b")}
        ${renderWellnessRing("Agua", w.hydration, "💧", "#5ba4c9")}
        ${renderWellnessRing("Sol", w.sun, "☀️", "#e8b84a")}
        ${renderWellnessRing("Felicidad", happy, "🌟", "#c9a227")}
      </div>`;
  }

  function renderHappinessBlock(p) {
    const { score, reasons } = computeHappiness(p);
    const reasonHtml = reasons
      .map(
        (r) =>
          `<li class="${r.ok ? "reason-ok" : "reason-warn"}">${r.ok ? "✅" : "⚠️"} ${r.text}</li>`,
      )
      .join("");
    return `
      <div class="happiness-block">
        <div class="happiness-score">
          <div class="ring-meter ring-meter-lg" style="--pct:${score};--ring-color:#8aa57b">
            <span>${score}%</span>
          </div>
          <div>
            <strong>🌟 Felicidad</strong>
            <ul class="happiness-reasons">${reasonHtml}</ul>
          </div>
        </div>
      </div>`;
  }

  function formatMonthLabel(monthStr) {
    if (!monthStr) return "";
    const [y, m] = monthStr.split("-");
    const names = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ];
    const mi = parseInt(m, 10) - 1;
    return `${names[mi] || m} ${y}`;
  }

  function sortPhotoGallery(gallery) {
    return (gallery || []).slice().sort((a, b) => a.month.localeCompare(b.month));
  }

  function renderPhotoTimeline(p, options) {
    options = options || {};
    const gallery = sortPhotoGallery(p.photoGallery);
    if (!gallery.length && !options.showAddButton) return "";

    const items = gallery
      .map(
        (entry) => `
        <article class="photo-timeline-item">
          <div class="photo-timeline-marker"></div>
          <time class="photo-timeline-month">${entry.label || formatMonthLabel(entry.month)}</time>
          <figure class="photo-timeline-figure">
            <img src="${encodeURI(entry.photo)}" alt="${entry.label || entry.month} — ${p.name}" loading="lazy" />
            <figcaption>${entry.note || ""}</figcaption>
          </figure>
        </article>`,
      )
      .join("");

    const track = gallery.length
      ? `<div class="photo-timeline-track">${items}</div>`
      : `<p class="photo-timeline-empty text-muted small mb-0">Aún no hay fotos. Añade la primera para seguir el crecimiento mes a mes.</p>`;

    const addBtn = options.showAddButton
      ? `<button type="button" class="btn btn-sm btn-outline-primary btn-add-gallery" data-id="${p.id}">+ Añadir foto</button>`
      : "";

    return `
      <section class="photo-timeline" aria-label="Galería mensual de ${p.name}">
        <div class="photo-timeline-head">
          <h6 class="photo-timeline-title">📸 Evolución mes a mes</h6>
          ${addBtn}
        </div>
        ${track}
      </section>`;
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

  function dayKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toDateString();
  }

  function computeCareStreak(plants) {
    const activityDates = new Set();
    (plants || []).forEach((p) => {
      (p.history || []).forEach((h) => {
        if (h.date) activityDates.add(dayKey(h.date));
      });
    });
    loadEvents().forEach((ev) => {
      if (ev.date) activityDates.add(dayKey(ev.date));
    });

    if (!activityDates.size) return 0;

    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!activityDates.has(cursor.toDateString())) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;
    while (activityDates.has(cursor.toDateString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function getStreakMessage(streak) {
    if (!streak) return "Registra un riego hoy y empieza tu racha.";
    if (streak === 1) return "¡Buen comienzo! Sigue cuidando tus plantas.";
    if (streak < 7) return "¡Vas genial! Sigue así.";
    if (streak < 14) return "¡Una semana entera! Sigue así.";
    return "¡Racha impresionante! Eres un crack del cuidado.";
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
    computeHappiness,
    getPlantMessage,
    computeHomeInsights,
    computeAchievements,
    renderPhotoTimeline,
    renderWellnessRings,
    renderHappinessBlock,
    renderWellnessBars,
    renderPlantSelect,
    getPlantById,
    formatDate,
    formatDateTime,
    formatMonthLabel,
    sortPhotoGallery,
    computeCareStreak,
    getStreakMessage,
  };
})();
