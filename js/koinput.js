// A text box for typing Korean. Works with a real Korean keyboard (IME), and
// without one: Latin keys are read as the standard 2-set (dubeolsik) layout
// (g-k-s → 한), and there's an on-screen keyboard.
var KoInput = (function () {
  var h = U.h;
  var KEYS = {
    q: 'ㅂ', w: 'ㅈ', e: 'ㄷ', r: 'ㄱ', t: 'ㅅ', y: 'ㅛ', u: 'ㅕ', i: 'ㅑ', o: 'ㅐ', p: 'ㅔ',
    a: 'ㅁ', s: 'ㄴ', d: 'ㅇ', f: 'ㄹ', g: 'ㅎ', h: 'ㅗ', j: 'ㅓ', k: 'ㅏ', l: 'ㅣ',
    z: 'ㅋ', x: 'ㅌ', c: 'ㅊ', v: 'ㅍ', b: 'ㅠ', n: 'ㅜ', m: 'ㅡ',
    Q: 'ㅃ', W: 'ㅉ', E: 'ㄸ', R: 'ㄲ', T: 'ㅆ', O: 'ㅒ', P: 'ㅖ'
  };
  var ROWS = ['ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ', 'ㅁㄴㅇㄹㅎㅗㅓㅏㅣ', 'ㅋㅌㅊㅍㅠㅜㅡ'];
  var SHIFTED = { 'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ', 'ㅐ': 'ㅒ', 'ㅔ': 'ㅖ' };
  var OSK_KEY = 'hangul-osk';

  function isJamo(ch) { return Hangul.isConsonant(ch) || Hangul.isVowel(ch); }

  // Text → the letters it was typed from, with Latin keys read as Korean ones.
  function toJamo(text) {
    var out = [];
    Array.from(text).forEach(function (ch) {
      if (Hangul.isSyllable(ch) || isJamo(ch)) out = out.concat(Hangul.inputSequence(ch));
      else if (KEYS[ch] || KEYS[ch.toLowerCase()]) out.push(KEYS[ch] || KEYS[ch.toLowerCase()]);
      else out.push(ch);
    });
    return out;
  }

  function create(opts) {
    opts = opts || {};
    var showOsk = false;
    try { showOsk = localStorage.getItem(OSK_KEY) === 'on'; } catch (e) { /* ignore */ }
    var jamoMode = false; // last change was letter-by-letter, so ⌫ removes one letter
    var input = h('input', {
      class: 'answer ko-answer ko', type: 'text', lang: 'ko', autocomplete: 'off', autocapitalize: 'off',
      autocorrect: 'off', spellcheck: 'false', placeholder: opts.placeholder || 'Type in Korean', 'data-focus': true
    });

    // Rebuild the word being typed (back to the last space) from its letters.
    function recompose() {
      var v = input.value, pos = input.selectionStart;
      var pre = v.slice(0, pos), post = v.slice(pos);
      var start = pre.length;
      while (start > 0 && /[가-힣ㄱ-ㅣA-Za-z]/.test(pre.charAt(start - 1))) start--;
      var word = pre.slice(start);
      if (!/[A-Za-zㄱ-ㅣ]/.test(word)) return;
      var built = Hangul.assemble(toJamo(word));
      input.value = pre.slice(0, start) + built + post;
      var at = start + built.length;
      input.setSelectionRange(at, at);
      jamoMode = true;
    }

    function backspace() {
      var pos = input.selectionStart, end = input.selectionEnd, v = input.value;
      if (pos !== end || !pos) return false;
      var ch = v.charAt(pos - 1);
      if (!Hangul.isSyllable(ch)) return false;
      var seq = Hangul.inputSequence(ch);
      var rest = Hangul.assemble(seq.slice(0, -1));
      input.value = v.slice(0, pos - 1) + rest + v.slice(pos);
      input.setSelectionRange(pos - 1 + rest.length, pos - 1 + rest.length);
      return true;
    }

    input.addEventListener('input', function (e) {
      if (e.isComposing) { jamoMode = false; return; }
      recompose();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (opts.onEnter) opts.onEnter(); return; }
      if (e.key === 'Backspace' && jamoMode && !e.isComposing && backspace()) e.preventDefault();
      else if (e.key.length > 1 && e.key !== 'Shift' && e.key !== 'Backspace') jamoMode = false;
    });
    input.addEventListener('mousedown', function () { jamoMode = false; });

    // Insert at the caret, then rebuild blocks.
    function typeKey(j) {
      if (input.disabled) return;
      var pos = input.selectionStart == null ? input.value.length : input.selectionStart;
      var end = input.selectionEnd == null ? pos : input.selectionEnd;
      input.value = input.value.slice(0, pos) + j + input.value.slice(end);
      input.setSelectionRange(pos + j.length, pos + j.length);
      if (isJamo(j)) recompose(); else jamoMode = false;
    }

    var shift = false, keyButtons = [];
    function key(label, cls, fn) {
      var b = h('button', { class: 'osk-key ' + (cls || ''), type: 'button', tabindex: '-1' }, label);
      // Keep focus (and the caret) in the text box.
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', fn);
      return b;
    }
    var shiftBtn = key('⇧', 'wide', function () { shift = !shift; paintKeys(); });
    var rows = ROWS.map(function (row) {
      return h('div', { class: 'osk-row' }, row.split('').map(function (j) {
        var b = key(j, 'ko ' + (Hangul.isVowel(j) ? 'v' : 'c'), function () {
          typeKey(shift && SHIFTED[j] ? SHIFTED[j] : j);
          if (shift) { shift = false; paintKeys(); }
        });
        b.dataset.j = j;
        keyButtons.push(b);
        return b;
      }));
    });
    rows.push(h('div', { class: 'osk-row' }, [
      shiftBtn,
      key('space', 'space', function () { typeKey(' '); }),
      key('?', '', function () { typeKey('?'); }),
      key('⌫', 'wide', function () {
        if (input.disabled) return;
        if (!backspace()) {
          var pos = input.selectionStart, end = input.selectionEnd, v = input.value;
          if (pos !== end) { input.value = v.slice(0, pos) + v.slice(end); input.setSelectionRange(pos, pos); }
          else if (pos) { input.value = v.slice(0, pos - 1) + v.slice(pos); input.setSelectionRange(pos - 1, pos - 1); }
        }
      })
    ]));
    function paintKeys() {
      shiftBtn.classList.toggle('on', shift);
      keyButtons.forEach(function (b) {
        var j = b.dataset.j;
        b.textContent = shift && SHIFTED[j] ? SHIFTED[j] : j;
      });
    }
    var osk = h('div', { class: 'osk' }, rows);

    var toggle = h('button', { class: 'btn link small osk-toggle', type: 'button' });
    function paintOsk() {
      osk.style.display = showOsk ? '' : 'none';
      toggle.textContent = showOsk ? 'Hide keyboard' : 'On-screen keyboard';
      // Stop the phone's own keyboard covering the on-screen one.
      if (showOsk) input.setAttribute('inputmode', 'none'); else input.removeAttribute('inputmode');
    }
    toggle.addEventListener('click', function () {
      showOsk = !showOsk;
      try { localStorage.setItem(OSK_KEY, showOsk ? 'on' : 'off'); } catch (e) { /* ignore */ }
      paintOsk();
      input.focus();
    });
    paintOsk();

    var hint = h('div', { class: 'ko-hint muted' }, [
      'No Korean keyboard? Type as if on one (',
      h('kbd', null, 'gkrtod'), ' → ', h('span', { class: 'ko' }, '학생'), ') or use the ', toggle, '.'
    ]);

    return {
      input: input, osk: osk, hint: hint,
      value: function () { return input.value; },
      disable: function () { input.disabled = true; osk.classList.add('off'); }
    };
  }

  return { create: create, toJamo: toJamo };
})();
