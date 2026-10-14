// Mounts screens and routes keyboard shortcuts to whichever screen is active.
var App = (function () {
  var root, keyHandler = null, armedAt = 0;

  function mount(el) {
    keyHandler = null;
    root.innerHTML = '';
    root.appendChild(el);
    window.scrollTo(0, 0);
  }

  // Ignore keys for a moment after a handler is set, so one Enter press
  // can't skip through several screens.
  function onKey(fn) { keyHandler = fn; armedAt = Date.now(); }

  document.addEventListener('keydown', function (e) {
    if (!keyHandler || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (Date.now() - armedAt < 200) return;
    keyHandler(e);
  });

  function start() {
    root = document.getElementById('app');
    Screens.home();
  }

  return { mount: mount, onKey: onKey, start: start };
})();
