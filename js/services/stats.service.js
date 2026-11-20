/* Stats service: read-only summaries built from the other services. */
(function (HW) {
  HW.stats = {
    summary(user) {
      const V = HW.apps.visibleTo(user), n = s => V.filter(a => a.stage === s).length;
      return {
        open: HW.jobs.all().filter(j => j.open).length,
        total: V.length, interviews: n("Interview"), offers: n("Offer"),
        byStage: HW.STAGES.map(s => [s, n(s)]),
        byCat: HW.jobs.openByCategory()
      };
    }
  };
})(window.HW);
