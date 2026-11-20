/* Login and register screen. */
(function (HW) {
  const $ = HW.$;
  function tab(reg) {
    $("loginForm").classList.toggle("hidden", reg); $("regForm").classList.toggle("hidden", !reg);
    $("tLogin").setAttribute("aria-selected", !reg); $("tReg").setAttribute("aria-selected", reg);
    document.querySelectorAll("#auth .err").forEach(e => e.textContent = "");
  }
  HW.views.auth = {
    tab,
    init() {
      $("tLogin").onclick = () => tab(false); $("tReg").onclick = () => tab(true);
      $("toReg").onclick = e => { e.preventDefault(); tab(true); };
      $("toLogin").onclick = e => { e.preventDefault(); tab(false); };
      document.querySelectorAll(".showpw").forEach(c => c.onchange = () =>
        c.closest("form").querySelectorAll("input.pw").forEach(i => i.type = c.checked ? "text" : "password"));
      $("rPw").addEventListener("input", () => {
        const s = HW.auth.strength($("rPw").value), m = $("meter");
        m.style.width = s * 25 + "%"; m.style.background = s <= 1 ? "var(--bad)" : s === 2 ? "var(--warn)" : "var(--good)";
      });
      $("regForm").addEventListener("submit", async e => {
        e.preventDefault(); ["rName", "rEmail", "rPw", "rPw2"].forEach(k => HW.setErr(k, ""));
        const r = await HW.auth.register({ name: $("rName").value, email: $("rEmail").value, pw: $("rPw").value, pw2: $("rPw2").value,
          role: document.querySelector('input[name="role"]:checked').value });
        if (!r.ok) return HW.showErrors(r.errors);
        HW.toast("Account created");
      });
      $("loginForm").addEventListener("submit", async e => {
        e.preventDefault(); ["lEmail", "lPw", "lMsg"].forEach(k => HW.setErr(k, ""));
        const r = await HW.auth.login({ email: $("lEmail").value, pw: $("lPw").value });
        if (!r.ok) return HW.showErrors(r.errors);
        HW.toast("Welcome back, " + r.user.name.split(" ")[0]);
      });
    }
  };
})(window.HW);
