// Optional pronunciation via the browser's built-in Korean voice, if one exists.
var Speech = (function () {
  var voice = null;
  var supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  function findVoice() {
    voice = speechSynthesis.getVoices().filter(function (v) { return /^ko/i.test(v.lang); })[0] || null;
  }
  if (supported) {
    findVoice();
    speechSynthesis.addEventListener('voiceschanged', findVoice);
  }

  return {
    available: function () { return !!voice; },
    say: function (text) {
      if (!voice) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  };
})();
