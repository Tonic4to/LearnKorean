// Little synthesized sound effects (Web Audio, no audio files needed).
var Sfx = (function () {
  var KEY = 'hangul-sfx';
  var ctx = null;
  var on = true;
  try { on = localStorage.getItem(KEY) !== 'off'; } catch (e) { /* ignore */ }

  function audio() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // One soft bell-like note: a sine plus a quiet octave, with a quick decay.
  function note(ac, freq, at, length, volume) {
    [[1, 1], [2, 0.25]].forEach(function (p) {
      var osc = ac.createOscillator(), gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * p[0];
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(volume * p[1], at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
      osc.connect(gain).connect(ac.destination);
      osc.start(at);
      osc.stop(at + length + 0.05);
    });
  }

  function play(notes, gap, length, volume) {
    if (!on) return;
    var ac = audio();
    if (!ac) return;
    var t = ac.currentTime + 0.02;
    notes.forEach(function (f, i) { note(ac, f, t + i * gap, length, volume); });
  }

  return {
    correct: function () { play([987.77, 1318.51], 0.085, 0.35, 0.18); },        // B5 → E6
    complete: function () { play([523.25, 659.25, 783.99, 1046.5], 0.11, 0.6, 0.16); }, // C major arpeggio
    isOn: function () { return on; },
    toggle: function () {
      on = !on;
      try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) { /* ignore */ }
      if (on) this.correct();
      return on;
    }
  };
})();
