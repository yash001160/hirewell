/* Event bus: services and screens talk through events, never through each other's internals. */
window.HW = window.HW || {};
(function (HW) {
  const handlers = {};
  HW.bus = {
    on(event, fn) { (handlers[event] = handlers[event] || []).push(fn); },
    emit(event, data) { (handlers[event] || []).forEach(fn => fn(data)); }
  };
})(window.HW);
