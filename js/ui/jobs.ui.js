/* Find jobs screen: search, filters, details and apply dialogs. */
(function (HW) {
  const { $, esc, money, ago } = HW;
  let cat = "";

  function fillFilters() {
    const t = $("fType").value, l = $("fLoc").value;
    $("fType").innerHTML = '<option value="">All job types</option>' + HW.jobs.types().map(x => `<option>${esc(x)}</option>`).join("");
    $("fLoc").innerHTML = '<option value="">All locations</option>' + HW.jobs.locations().map(x => `<option>${esc(x)}</option>`).join("");
    $("fType").value = t; $("fLoc").value = l;
  }
  function chips() {
    $("cats").innerHTML = ["All", ...HW.CATS].map(c => {
      const v = c === "All" ? "" : c, n = HW.jobs.all().filter(j => j.open && (!v || j.cat === v)).length;
      return `<button class="chip" data-c="${v}" aria-pressed="${cat === v}">${c} (${n})</button>`;
    }).join("");
  }
  function render() {
    const me = HW.auth.current(), emp = me.role === "employer";
    fillFilters(); chips();
    const list = HW.jobs.list({ q: $("q").value, cat, type: $("fType").value, loc: $("fLoc").value, sort: $("fSort").value });
    $("count").textContent = list.length + (list.length === 1 ? " job found" : " jobs found");
    $("jobList").innerHTML = list.length ? list.map(j => {
      const applied = HW.apps.hasApplied(j.id, me.email);
      return `<article class="job ${j.open ? "" : "closed"}"><div><h3>${esc(j.title)}</h3>
        <div class="meta"><span>${esc(j.company)}</span><span>${esc(j.loc)}</span><span>${money(j.sal)}/yr</span><span>${ago(j.posted)}</span></div>
        <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><span class="tag">${esc(j.cat)}</span><span class="tag">${esc(j.type)}</span><span class="tag ${j.open ? "open" : "closed"}">${j.open ? "Open" : "Closed"}</span></div></div>
        <div style="display:flex;gap:8px"><button class="btn ghost sm" data-d="${j.id}">Details</button>
        ${emp ? "" : `<button class="btn sm" data-a="${j.id}" ${!j.open || applied ? "disabled" : ""}>${applied ? "Applied" : "Apply"}</button>`}</div></article>`;
    }).join("") : `<div class="empty">No jobs match these filters. Clear the search or choose another category.</div>`;
  }
  function details(id) {
    const j = HW.jobs.get(id), me = HW.auth.current();
    const canApply = j.open && me.role !== "employer" && !HW.apps.hasApplied(id, me.email);
    HW.dialog.open(`<h2>${esc(j.title)}</h2><div class="meta" style="margin-bottom:10px"><span>${esc(j.company)}</span><span>${esc(j.loc)}</span><span>${esc(j.type)}</span><span>${money(j.sal)}/yr</span></div>
      <p>${esc(j.desc)}</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn ghost" data-close>Close</button>${canApply ? `<button class="btn" data-ap="${id}">Apply</button>` : ""}</div>`);
    const b = document.querySelector("[data-ap]"); if (b) b.onclick = () => applyForm(id);
  }
  function applyForm(id) {
    const j = HW.jobs.get(id), me = HW.auth.current();
    HW.dialog.open(`<h2>Apply to ${esc(j.title)}</h2><p class="sub">${esc(j.company)} \u00b7 ${esc(j.loc)}</p><form id="appForm" novalidate>
      <label for="aName">Full name *</label><input id="aName" maxlength="60" value="${esc(me.name)}"><div class="err" data-e="aName"></div>
      <label for="aMail">Email *</label><input id="aMail" type="email" value="${esc(me.email)}"><div class="err" data-e="aMail"></div>
      <label for="aNote">Cover note</label><textarea id="aNote" rows="3" maxlength="400"></textarea><div class="err"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Submit application</button></div></form>`);
    $("appForm").addEventListener("submit", e => {
      e.preventDefault();
      const r = HW.apps.apply(id, me, { name: $("aName").value, email: $("aMail").value, note: $("aNote").value });
      if (!r.ok) return HW.showErrors(r.errors);
      HW.dialog.close(); HW.toast("Application submitted"); render();
    });
  }
  HW.views.jobs = {
    render,
    init() {
      ["q", "fType", "fLoc", "fSort"].forEach(id => $(id).addEventListener("input", render));
      $("cats").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { cat = b.dataset.c; render(); } });
      $("jobList").addEventListener("click", e => {
        const d = e.target.closest("[data-d]"), a = e.target.closest("[data-a]");
        if (d) details(+d.dataset.d); if (a && !a.disabled) applyForm(+a.dataset.a);
      });
      HW.bus.on("auth:logout", () => { cat = ""; });
    }
  };
})(window.HW);
