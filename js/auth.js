/* Hydralia — autenticación demo (solo localStorage, sin backend) */
window.HydraliaAuth = (function () {
  const USERS_KEY = "hydralia_users_v1";
  const SESSION_KEY = "hydralia_session_v1";
  const DEMO_EMAIL = "demo@hydralia.app";
  const DEMO_PASSWORD = "demo123";

  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveUsers(list) {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  }

  function hashPassword(password) {
    let h = 5381;
    for (let i = 0; i < password.length; i++) {
      h = (h * 33) ^ password.charCodeAt(i);
    }
    return "h_" + (h >>> 0).toString(36);
  }

  function normalizeEmail(email) {
    return String(email || "")
      .trim()
      .toLowerCase();
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        userId: user.id,
        name: user.name,
        email: user.email,
      }),
    );
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    const s = getSession();
    if (!s || !s.userId) return false;
    return loadUsers().some((u) => u.id === s.userId);
  }

  function getUserId() {
    const s = getSession();
    return s && s.userId ? s.userId : null;
  }

  function getCurrentUser() {
    const s = getSession();
    if (!s) return null;
    return loadUsers().find((u) => u.id === s.userId) || null;
  }

  function ensureDemoUser() {
    const users = loadUsers();
    if (users.some((u) => u.email === DEMO_EMAIL)) return;
    users.push({
      id: "user_demo",
      name: "Usuario demo",
      email: DEMO_EMAIL,
      passwordHash: hashPassword(DEMO_PASSWORD),
      createdAt: new Date().toISOString(),
    });
    saveUsers(users);
  }

  function register(name, email, password) {
    name = String(name || "").trim();
    email = normalizeEmail(email);
    password = String(password || "");

    if (!name || name.length < 2) {
      return { ok: false, error: "Escribe un nombre de al menos 2 caracteres." };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Introduce un correo válido." };
    }
    if (!password || password.length < 4) {
      return { ok: false, error: "La contraseña debe tener al menos 4 caracteres." };
    }

    const users = loadUsers();
    if (users.some((u) => u.email === email)) {
      return { ok: false, error: "Ya existe una cuenta con ese correo." };
    }

    const user = {
      id: "user_" + Math.random().toString(36).slice(2, 11),
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    setSession(user);
    return { ok: true, user };
  }

  function login(email, password) {
    email = normalizeEmail(email);
    password = String(password || "");

    if (!email || !password) {
      return { ok: false, error: "Completa correo y contraseña." };
    }

    const user = loadUsers().find((u) => u.email === email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }

    setSession(user);
    return { ok: true, user };
  }

  function logout() {
    clearSession();
  }

  function redirectAfterAuth() {
    const params = new URLSearchParams(location.search);
    const target = params.get("redirect");
    if (target && !target.includes("login") && !target.includes("registro")) {
      location.href = target;
    } else {
      location.href = "index.html";
    }
  }

  function initDarkModeToggle() {
    const KEY = "hydralia_dark_mode";
    const btn = document.getElementById("btnToggleDark");
    function apply(isDark) {
      document.body.classList.toggle("dark-mode", isDark);
      if (btn) btn.textContent = isDark ? "☀️" : "🌙";
    }
    apply(localStorage.getItem(KEY) === "1");
    if (btn) {
      btn.addEventListener("click", function () {
        const now = !document.body.classList.contains("dark-mode");
        apply(now);
        localStorage.setItem(KEY, now ? "1" : "0");
      });
    }
  }

  function showAuthError($el, message) {
    if (!$el || !$el.length) return;
    $el.removeClass("d-none").text(message);
  }

  function initAuthPage(page) {
    initDarkModeToggle();

    if (page === "login") {
      const $form = $("#form-login");
      const $err = $("#auth-error");
      $form.on("submit", function (e) {
        e.preventDefault();
        $err.addClass("d-none");
        const result = login($("#login-email").val(), $("#login-password").val());
        if (!result.ok) {
          showAuthError($err, result.error);
          return;
        }
        redirectAfterAuth();
      });
    }

    if (page === "registro") {
      const $form = $("#form-registro");
      const $err = $("#auth-error");
      $form.on("submit", function (e) {
        e.preventDefault();
        $err.addClass("d-none");
        const pass = $("#reg-password").val();
        const pass2 = $("#reg-password2").val();
        if (pass !== pass2) {
          showAuthError($err, "Las contraseñas no coinciden.");
          return;
        }
        const result = register($("#reg-name").val(), $("#reg-email").val(), pass);
        if (!result.ok) {
          showAuthError($err, result.error);
          return;
        }
        redirectAfterAuth();
      });
    }
  }

  ensureDemoUser();

  return {
    USERS_KEY,
    SESSION_KEY,
    DEMO_EMAIL,
    DEMO_PASSWORD,
    ensureDemoUser,
    isLoggedIn,
    getSession,
    getUserId,
    getCurrentUser,
    register,
    login,
    logout,
    initAuthPage,
  };
})();
