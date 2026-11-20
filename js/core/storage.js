/* Storage adapter: the only file that touches localStorage. */
(function (HW) {
  HW.storage = {
    get(key, fallback) {
      try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
      catch (e) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  };
})(window.HW);
