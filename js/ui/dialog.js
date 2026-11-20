/* Dialog helper shared by the jobs screen. */
(function (HW) {
  HW.dialog = {
    init() { HW.$("dlgBody").addEventListener("click", e => { if (e.target.closest("[data-close]")) HW.$("dlg").close(); }); },
    open(html) { HW.$("dlgBody").innerHTML = html; if (!HW.$("dlg").open) HW.$("dlg").showModal(); },
    close() { HW.$("dlg").close(); }
  };
})(window.HW);
