/* Auth service: owns users and the session. Runs fully in the browser (localStorage), no backend. */
(function (HW) {
  const USERS = "hirewell:users", SESSION = "hirewell:session";
  let users = HW.storage.get(USERS, []), me = null;

  async function hash(pw, salt) {
    try {
      const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + pw));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
    } catch (e) { return btoa(unescape(encodeURIComponent(salt + pw))); }
  }
  function start(user) {
    me = user; HW.storage.set(SESSION, user.email); HW.bus.emit("auth:login", user);
    return { ok: true, user };
  }

  HW.auth = {
    current: () => me,
    restore() { const u = users.find(x => x.email === HW.storage.get(SESSION, null)); if (u) start(u); return !!u; },
    strength(p) {
      let s = 0;
      if (p.length >= 8) s++;
      if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
      if (/\d/.test(p)) s++;
      if (/[^A-Za-z0-9]/.test(p)) s++;
      return s;
    },
    async register({ name, email, role, pw, pw2 }) {
      name = name.trim(); email = email.trim().toLowerCase();
      const errors = {};
      if (!name) errors.rName = "Enter your full name.";
      if (!HW.validEmail(email)) errors.rEmail = "Enter a valid email address.";
      else if (users.some(u => u.email === email)) errors.rEmail = "An account with this email already exists. Sign in instead.";
      if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) errors.rPw = "Use at least 8 characters with a letter and a number.";
      if (pw2 !== pw) errors.rPw2 = "Passwords don\u2019t match.";
      if (Object.keys(errors).length) return { ok: false, errors };
      const salt = Math.random().toString(36).slice(2);
      const user = { name, email, role, salt, hash: await hash(pw, salt) };
      users.push(user); HW.storage.set(USERS, users);
      return start(user);
    },
    async login({ email, pw }) {
      email = email.trim().toLowerCase();
      const errors = {};
      if (!email) errors.lEmail = "Enter your email.";
      if (!pw) errors.lPw = "Enter your password.";
      if (Object.keys(errors).length) return { ok: false, errors };
      const u = users.find(x => x.email === email);
      if (!u || await hash(pw, u.salt) !== u.hash) return { ok: false, errors: { lMsg: "Email or password is incorrect." } };
      return start(u);
    },
    logout() { me = null; HW.storage.set(SESSION, null); HW.bus.emit("auth:logout"); }
  };
})(window.HW);
