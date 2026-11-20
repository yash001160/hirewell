/* Overview screen. */
(function (HW) {
  const { $ } = HW;
  const bars = (items, max) => items.map(([l, n]) => `<div class="row"><span>${l}</span><div class="track"><div class="fill" style="width:${max ? n / max * 100 : 0}%"></div></div><b>${n}</b></div>`).join("");
  HW.views.stats = {
    init() {},
    render() {
      const me = HW.auth.current(), s = HW.stats.summary(me);
      $("statCards").innerHTML = [[s.open, "Open jobs"], [s.total, me.role === "employer" ? "Applicants" : "Applications"], [s.interviews, "In interview"], [s.offers, "Offers"]]
        .map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");
      $("stageBars").innerHTML = s.total ? bars(s.byStage, Math.max(...s.byStage.map(x => x[1]))) : `<div class="empty">No applications yet.</div>`;
      $("catBars").innerHTML = bars(s.byCat, Math.max(1, ...s.byCat.map(x => x[1])));
    }
  };
})(window.HW);
