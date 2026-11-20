/* Bootstrap: start every module, then restore the session if there is one. */
(function (HW) {
  HW.shell.init(); HW.dialog.init();
  Object.keys(HW.views).forEach(k => HW.views[k].init());
  HW.auth.restore();
})(window.HW);
