/* Applications (job seeker) and Applicants (employer) screen. */
(function (HW) {
  const { $, esc, ago } = HW;
  let stageF = "";
  function render() {
    const me = HW.auth.current(), emp = me.role === "employer", all = HW.apps.visibleTo(me);
    $("stageChips").innerHTML = ["All", ...HW.STAGES].map(s => {
      const v = s === "All" ? "" : s, n = all.filter(a => !v || a.stage === v).length;
      return `<button class="chip" data-s="${v}" aria-pressed="${stageF === v}">${s} (${n})</button>`;
    }).join("");
    const list = all.filter(a => !stageF || a.stage === stageF).sort((a, b) => b.date - a.date);
    $("appList").innerHTML = list.length ? list.map(a => {
      const j = HW.jobs.get(a.jobId) || { title: "Removed job", company: "" }, i = HW.STAGES.indexOf(a.stage), rej = a.stage === "Rejected";
      const bar = HW.STAGES.slice(0, 4).map((s, k) => `<span class="${rej ? (k <= 1 ? "on" : "") : (k <= i ? "on" : "")}" title="${s}"></span>`).join("");
      return `<div class="app"><header><div><b>${esc(j.title)}</b>${emp ? ` \u00b7 ${esc(a.name)}` : ` <span class="meta" style="display:inline">${esc(j.company)}</span>`}</div>
        <span class="tag ${rej ? "closed" : a.stage === "Offer" ? "open" : ""}">${a.stage}</span></header>
        <div class="steps ${rej ? "rej" : ""}">${bar}</div>
        <div class="meta"><span>Applied ${ago(a.date)}</span><span>${esc(a.email)}</span></div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center">
        ${emp ? `<label for="st${a.id}" style="margin:0">Update stage</label><select id="st${a.id}" data-st="${a.id}" style="width:auto">${HW.STAGES.map(s => `<option ${s === a.stage ? "selected" : ""}>${s}</option>`).join("")}</select>`
              : `<button class="btn danger sm" data-w="${a.id}">Withdraw</button>`}</div></div>`;
    }).join("") : `<div class="empty">No applications here yet. Browse open jobs and apply to get started.</div>`;
  }
  HW.views.apps = {
    render,
    init() {
      $("stageChips").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { stageF = b.dataset.s; render(); } });
      $("appList").addEventListener("change", e => { if (e.target.dataset.st) { HW.apps.setStage(+e.target.dataset.st, e.target.value); HW.toast("Stage updated"); render(); } });
      $("appList").addEventListener("click", e => {
        const w = e.target.dataset.w;
        if (w && confirm("Withdraw this application?")) { HW.apps.withdraw(+w); HW.toast("Application withdrawn"); render(); }
      });
      HW.bus.on("auth:logout", () => { stageF = ""; });
    }
  };
})(window.HW);
