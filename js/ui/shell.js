/* Shell: navigation, role-based menu, view registry. */
(function (HW) {
  const $ = HW.$;
  HW.views = {};
  HW.shell = {
    init() {
      $("nav").addEventListener("click", e => { const b = e.target.closest("button"); if (b) HW.shell.show(b.dataset.v); });
      $("logout").onclick = () => HW.auth.logout();
      HW.bus.on("auth:login", HW.shell.enter);
      HW.bus.on("auth:logout", HW.shell.exit);
      HW.bus.on("apps:changed", HW.shell.updateBadge);
    },
    show(v) {
      const me = HW.auth.current();
      if (v === "post" && me.role !== "employer") v = "jobs";
      ["jobs", "apps", "post", "stats"].forEach(x => $("v-" + x).classList.toggle("hidden", x !== v));
      document.querySelectorAll("#nav button").forEach(b => b.setAttribute("aria-selected", b.dataset.v === v));
      HW.views[v].render(); scrollTo(0, 0);
    },
    updateBadge() { const me = HW.auth.current(); $("appBadge").textContent = me ? HW.apps.visibleTo(me).length : 0; },
    enter(u) {
      const emp = u.role === "employer";
      $("auth").classList.add("hidden"); $("shell").classList.remove("hidden");
      $("uName").textContent = u.name + " (" + (emp ? "Employer" : "Job seeker") + ")";
      document.querySelector('[data-v="post"]').classList.toggle("hidden", !emp);
      document.querySelector('[data-v="apps"]').firstChild.textContent = emp ? "Applicants" : "My applications";
      $("v-apps").querySelector("h1").textContent = emp ? "Applicants" : "My applications";
      $("v-apps").querySelector(".sub").textContent = emp ? "Review candidates and move them through each stage." : "Track every application from submission to offer.";
      HW.shell.updateBadge(); HW.shell.show("jobs");
    },
    exit() {
      $("shell").classList.add("hidden"); $("auth").classList.remove("hidden");
      $("loginForm").reset(); $("regForm").reset(); $("meter").style.width = "0";
      HW.views.auth.tab(false);
    }
  };
})(window.HW);
