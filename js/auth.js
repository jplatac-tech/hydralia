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
    window.dispatchEvent(new Event("hydralia:auth-changed"));
  }

  function showModalError(message) {
    const $err = $("#auth-modal-error");
    if (!$err.length) return;
    $err.removeClass("d-none").text(message);
  }

  function clearModalError() {
    $("#auth-modal-error").addClass("d-none").text("");
  }

  function openModal(mode) {
    mode = mode === "registro" ? "registro" : "login";
    clearModalError();
    if (mode === "registro") {
      $("#auth-tab-registro").tab("show");
      $("#modalAuthTitle").text("Crear cuenta");
    } else {
      $("#auth-tab-login").tab("show");
      $("#modalAuthTitle").text("Iniciar sesión");
    }
    $("#modalAuth").modal("show");
  }

  function onAuthSuccess() {
    clearModalError();
    $("#modalAuth").modal("hide");
    window.dispatchEvent(new Event("hydralia:auth-changed"));
  }

  let modalsBound = false;

  function initModals() {
    if (modalsBound || !$("#modalAuth").length) return;
    modalsBound = true;

    $("#form-login").on("submit", function (e) {
      e.preventDefault();
      clearModalError();
      const result = login($("#login-email").val(), $("#login-password").val());
      if (!result.ok) {
        showModalError(result.error);
        return;
      }
      onAuthSuccess();
    });

    $("#form-registro").on("submit", function (e) {
      e.preventDefault();
      clearModalError();
      const pass = $("#reg-password").val();
      const pass2 = $("#reg-password2").val();
      if (pass !== pass2) {
        showModalError("Las contraseñas no coinciden.");
        return;
      }
      const result = register($("#reg-name").val(), $("#reg-email").val(), pass);
      if (!result.ok) {
        showModalError(result.error);
        return;
      }
      onAuthSuccess();
    });

    $('a[data-toggle="pill"]').on("shown.bs.tab", function (e) {
      clearModalError();
      if (e.target.id === "auth-tab-registro") {
        $("#modalAuthTitle").text("Crear cuenta");
      } else {
        $("#modalAuthTitle").text("Iniciar sesión");
      }
    });
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
    openModal,
    initModals,
  };
})();
