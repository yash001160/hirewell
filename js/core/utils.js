/* Shared constants and small helpers. */
(function (HW) {
  HW.CATS = ["Engineering", "Design", "Marketing", "Sales", "Finance", "Operations"];
  HW.STAGES = ["Applied", "Screening", "Interview", "Offer", "Rejected"];
  HW.DAY = 86400000;
  HW.$ = id => document.getElementById(id);
  HW.esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  HW.money = n => "$" + Number(n).toLocaleString("en-US");
  HW.ago = t => { const d = Math.floor((Date.now() - t) / HW.DAY); return d < 1 ? "Today" : d === 1 ? "Yesterday" : d + " days ago"; };
  HW.validEmail = e => /^\S+@\S+\.\S+$/.test(e);
  HW.setErr = (id, msg) => { const e = document.querySelector('[data-e="' + id + '"]'); if (e) e.textContent = msg || ""; };
  HW.showErrors = errors => { Object.keys(errors).forEach(k => HW.setErr(k, errors[k])); };
  let timer;
  HW.toast = msg => {
    const t = HW.$("toast"); t.textContent = msg; t.classList.remove("hidden");
    clearTimeout(timer); timer = setTimeout(() => t.classList.add("hidden"), 2200);
  };
})(window.HW);
