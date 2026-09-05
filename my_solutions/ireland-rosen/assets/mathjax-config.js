// Pandoc expands notation macros from preamble.tex before emitting the HTML.
window.MathJax = {
  loader: {load: ['[tex]/mathtools']},
  tex: {
    packages: {'[+]': ['mathtools']},
    inlineMath: [['\\(', '\\)']],
    displayMath: [['\\[', '\\]']],
    tags: 'none',
    // amsthm's proof-end marker has no positioning role in an HTML equation.
    macros: {qedhere: ''}
  },
  options: {skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']},
  startup: {
    ready: function () {
      MathJax.startup.defaultReady();
      MathJax.startup.promise.then(function () {
        var note = document.getElementById('math-status');
        if (note) note.hidden = true;
      });
    }
  }
};
