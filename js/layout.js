/* Hydralia — navegación compartida */
window.HydraliaLayout = (function () {
  const MODULE_LINKS = [
    { href: "index.html", icon: "🏠", label: "Inicio", page: "inicio" },
    { href: "plantas.html", icon: "🪴", label: "Plantas", page: "plantas" },
    { href: "dashboard.html", icon: "📊", label: "Panel", page: "dashboard" },
    { href: "riego.html", icon: "💧", label: "Riego", page: "riego" },
    { href: "suelo.html", icon: "🌍", label: "Suelo", page: "suelo" },
    { href: "hojas.html", icon: "🍃", label: "Hojas", page: "hojas" },
    { href: "estado.html", icon: "❤️", label: "Estado", page: "estado" },
    { href: "consejos.html", icon: "💡", label: "Consejos", page: "consejos" },
    { href: "recordatorios.html", icon: "🔔", label: "Recordatorios", page: "recordatorios" },
    { href: "calendario.html", icon: "📅", label: "Calendario", page: "calendario" },
    { href: "logros.html", icon: "🏆", label: "Logros", page: "logros" },
    { href: "diagnostico.html", icon: "🔍", label: "Diagnóstico", page: "diagnostico" },
  ];

  const BOTTOM_NAV = [
    { href: "index.html", icon: "🏠", label: "Inicio", page: "inicio" },
    { href: "plantas.html", icon: "🪴", label: "Plantas", page: "plantas" },
    { href: "calendario.html", icon: "📅", label: "Calendario", page: "calendario" },
    { href: "recordatorios.html", icon: "🔔", label: "Recordatorios", page: "recordatorios" },
    { href: "perfil.html", icon: "👤", label: "Perfil", page: "perfil" },
  ];

  function renderTopNav(activePage) {
    const mainPages = ["inicio", "plantas", "calendario", "recordatorios", "dashboard"];
    const bottomPages = BOTTOM_NAV.map((l) => l.page);

    const desktopLinks = MODULE_LINKS.filter((l) => mainPages.includes(l.page))
      .map(
        (l) =>
          `<a href="${l.href}" class="nav-item nav-link${l.page === activePage ? " active" : ""}">${l.label}</a>`,
      )
      .join("");

    const dropdownItems = MODULE_LINKS.filter(
      (l) => !mainPages.includes(l.page) && l.page !== "perfil",
    )
      .map(
        (l) =>
          `<a href="${l.href}" class="dropdown-item${l.page === activePage ? " active" : ""}">${l.icon} ${l.label}</a>`,
      )
      .join("");

    const mobileMenuLinks = MODULE_LINKS.filter((l) => !bottomPages.includes(l.page))
      .map(
        (l) =>
          `<a href="${l.href}" class="nav-link nav-link-mobile${l.page === activePage ? " active" : ""}">${l.icon} ${l.label}</a>`,
      )
      .join("");

    return `
    <div class="hydralia-navbar-wrap">
    <div class="container-fluid p-0">
      <div class="container-lg p-0 px-lg-3">
        <nav class="navbar navbar-expand-lg navbar-light hydralia-navbar py-2 pl-3 pl-lg-4">
          <a href="index.html" class="navbar-brand hydralia-brand">
            <img src="img/hydralia-logo-nav.png?v=5" alt="Hydralia" class="brand-logo" width="564" height="159" />
          </a>
          <div class="navbar-toolbar ml-auto d-flex align-items-center">
            <button type="button" id="btnToggleDark" class="btn btn-sm btn-outline-secondary navbar-dark-btn" title="Modo oscuro" aria-label="Cambiar modo oscuro">🌙</button>
            <button type="button" class="navbar-toggler ml-2" data-toggle="collapse" data-target="#navbarCollapse" aria-label="Abrir menú">
              <span class="navbar-toggler-icon"></span>
            </button>
          </div>
          <div class="collapse navbar-collapse px-3" id="navbarCollapse">
            <div class="navbar-nav navbar-nav-desktop ml-auto py-0">
              ${desktopLinks}
              <div class="nav-item dropdown nav-modules-dropdown">
                <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown">Módulos</a>
                <div class="dropdown-menu border-0 rounded-0 m-0">
                  ${dropdownItems}
                </div>
              </div>
            </div>
            <div class="navbar-nav-mobile">
              ${mobileMenuLinks}
            </div>
          </div>
        </nav>
      </div>
    </div>
    </div>`;
  }

  function renderBottomNav(activePage) {
    return `
    <nav class="hydralia-bottom-nav" aria-label="Navegación principal">
      ${BOTTOM_NAV.map(
        (l) =>
          `<a href="${l.href}" class="bottom-nav-item${l.page === activePage ? " active" : ""}">
            <span class="bottom-nav-icon">${l.icon}</span>
            <span class="bottom-nav-label">${l.label}</span>
          </a>`,
      ).join("")}
    </nav>`;
  }

  function initNav(activePage) {
    const topEl = document.getElementById("hydralia-topnav");
    if (topEl) topEl.innerHTML = renderTopNav(activePage);

    let bottomEl = document.getElementById("hydralia-bottomnav");
    if (!bottomEl) {
      bottomEl = document.createElement("div");
      bottomEl.id = "hydralia-bottomnav";
      document.body.appendChild(bottomEl);
    }
    bottomEl.innerHTML = renderBottomNav(activePage);

    const sideEl = document.getElementById("hydralia-sidebar");
    if (sideEl) {
      sideEl.innerHTML = MODULE_LINKS.filter((l) => l.page !== "inicio")
        .map(
          (l) =>
            `<a href="${l.href}" class="nav-link${l.page === activePage ? " active" : ""}">${l.icon} ${l.label}</a>`,
        )
        .join("");
    }
  }

  return { MODULE_LINKS, BOTTOM_NAV, renderTopNav, renderBottomNav, initNav };
})();
