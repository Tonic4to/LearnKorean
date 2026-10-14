// Small DOM and random helpers shared by every screen.
var U = (function () {
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { append(el, x); });
    else el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  }

  // h('div', {class: 'x', onclick: fn, html: '<b>…</b>'}, [children])
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    append(el, children);
    return el;
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function sample(a, n) { return shuffle(a).slice(0, n); }
  function weightedPick(a, weight) {
    var ws = a.map(weight), total = ws.reduce(function (s, x) { return s + x; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < a.length; i++) { r -= ws[i]; if (r <= 0) return a[i]; }
    return a[a.length - 1];
  }

  return { h: h, shuffle: shuffle, pick: pick, sample: sample, weightedPick: weightedPick };
})();
