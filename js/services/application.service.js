/* Application service: owns applications and their stage pipeline. */
(function (HW) {
  const KEY = "hirewell:apps";
  let apps = HW.storage.get(KEY, []);
  let next = apps.reduce((m, a) => Math.max(m, a.id), 0) + 1;
  const save = () => { HW.storage.set(KEY, apps); HW.bus.emit("apps:changed"); };

  HW.apps = {
    forUser: email => apps.filter(a => a.owner === email),
    forEmployer: email => apps.filter(a => { const j = HW.jobs.get(a.jobId); return j && j.owner === email; }),
    visibleTo: user => user.role === "employer" ? HW.apps.forEmployer(user.email) : HW.apps.forUser(user.email),
    hasApplied: (jobId, email) => apps.some(a => a.jobId === jobId && a.owner === email),
    countForJob: jobId => apps.filter(a => a.jobId === jobId).length,
    apply(jobId, user, { name, email, note }) {
      const errors = {};
      if (!name.trim()) errors.aName = "Enter your full name.";
      if (!HW.validEmail(email.trim())) errors.aMail = "Enter a valid email address.";
      if (Object.keys(errors).length) return { ok: false, errors };
      if (HW.apps.hasApplied(jobId, user.email)) return { ok: false, errors: { aMail: "You already applied to this job." } };
      apps.push({ id: next++, jobId, owner: user.email, name: name.trim(), email: email.trim(), note: note.trim(), stage: "Applied", date: Date.now() });
      save(); return { ok: true };
    },
    setStage(id, stage) { apps.find(a => a.id === id).stage = stage; save(); },
    withdraw(id) { apps = apps.filter(a => a.id !== id); save(); }
  };
  // When the job service deletes a job, its applications go too.
  HW.bus.on("jobs:removed", jobId => { apps = apps.filter(a => a.jobId !== jobId); save(); });
})(window.HW);
