/* Post a job screen (employers): create, edit, close, delete. */
(function (HW) {
  const { $, esc } = HW;
  const FIELDS = { jTitle: "title", jCompany: "company", jLoc: "loc", jSal: "sal", jDesc: "desc" };
  function reset() {
    $("jobForm").reset(); $("jId").value = ""; $("jSave").textContent = "Publish job"; $("jCancel").classList.add("hidden");
    document.querySelectorAll("#jobForm .err").forEach(e => e.textContent = "");
  }
  function render() {
    const me = HW.auth.current(), rows = HW.jobs.byOwner(me.email);
    $("jCat").innerHTML = HW.CATS.map(c => `<option>${c}</option>`).join("");
    $("mine").innerHTML = rows.length ? rows.map(j => `<tr><td>${esc(j.title)}</td><td>${esc(j.cat)}</td><td>${HW.apps.countForJob(j.id)}</td>
      <td><span class="tag ${j.open ? "open" : "closed"}">${j.open ? "Open" : "Closed"}</span></td>
      <td><button class="btn ghost sm" data-ed="${j.id}">Edit</button> <button class="btn ghost sm" data-t="${j.id}">${j.open ? "Close" : "Reopen"}</button> <button class="btn danger sm" data-x="${j.id}">Delete</button></td></tr>`).join("")
      : `<tr><td colspan="5"><div class="empty">You haven\u2019t posted any jobs yet. Use the form above.</div></td></tr>`;
  }
  HW.views.post = {
    render,
    init() {
      $("jCancel").onclick = reset;
      $("jobForm").addEventListener("submit", e => {
        e.preventDefault();
        const v = { title: $("jTitle").value.trim(), company: $("jCompany").value.trim(), loc: $("jLoc").value.trim(), sal: $("jSal").value, desc: $("jDesc").value.trim() };
        Object.keys(FIELDS).forEach(k => HW.setErr(k, ""));
        const errors = HW.jobs.validate(v);
        if (Object.keys(errors).length) return HW.showErrors(errors);
        const data = { ...v, cat: $("jCat").value, type: $("jType").value }, id = +$("jId").value;
        if (id) { HW.jobs.update(id, data); HW.toast("Changes saved"); }
        else { HW.jobs.create(data, HW.auth.current().email); HW.toast("Job published"); }
        reset(); render();
      });
      $("mine").addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        if (b.dataset.ed) {
          const j = HW.jobs.get(+b.dataset.ed);
          $("jId").value = j.id; $("jTitle").value = j.title; $("jCompany").value = j.company; $("jCat").value = j.cat;
          $("jType").value = j.type; $("jLoc").value = j.loc; $("jSal").value = j.sal; $("jDesc").value = j.desc;
          $("jSave").textContent = "Save changes"; $("jCancel").classList.remove("hidden"); scrollTo({ top: 0, behavior: "smooth" });
        }
        if (b.dataset.t) { HW.toast(HW.jobs.toggle(+b.dataset.t) ? "Job reopened" : "Job closed"); render(); }
        if (b.dataset.x && confirm("Delete this job and its applications?")) { HW.jobs.remove(+b.dataset.x); HW.toast("Job deleted"); render(); }
      });
      HW.bus.on("auth:logout", reset);
    }
  };
})(window.HW);
