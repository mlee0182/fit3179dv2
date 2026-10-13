// Embeds every Vega / Vega-Lite spec in js/ and wires up the page interactions.
// Pattern follows the Week 7-9 studios: vegaEmbed('#div', 'spec.vg.json', {actions: false}).

var CHARTS = [
  ['chart-waffle', 'js/01_waffle.vg.json'],
  ['chart-gantt', 'js/02_gantt.vg.json'],
  ['chart-treemap', 'js/03_treemap.vg.json', 'fixed'],
  ['chart-bar', 'js/04_bar_conflicts.vg.json'],
  ['chart-dot', 'js/05_dot_map.vg.json', 'war'],
  ['chart-symbol', 'js/06_symbol_map.vg.json'],
  ['chart-choropleth', 'js/07_choropleth.vg.json', 'war'],
  ['chart-bin', 'js/12_bin_map.vg.json'],
  ['chart-heatmap', 'js/08_heatmap.vg.json'],
  ['chart-venn', 'js/09_venn.vg.json', 'fixed'],
  ['chart-wordcloud', 'js/10_wordcloud.vg.json', 'fixed'],
  ['chart-slope', 'js/11_slope.vg.json']
];

// Shared look for every chart (fonts, axis and legend styling).
var THEME = {
  font: 'Source Sans 3, Helvetica, Arial, sans-serif',
  background: null,
  axis: {
    labelFont: 'Source Sans 3, sans-serif', titleFont: 'Source Sans 3, sans-serif',
    labelColor: '#4a473f', titleColor: '#4a473f', labelFontSize: 12, titleFontSize: 12,
    titleFontWeight: 600, domainColor: '#9b9588', tickColor: '#9b9588', gridColor: '#e6e1d4'
  },
  legend: {
    labelFont: 'Source Sans 3, sans-serif', titleFont: 'Source Sans 3, sans-serif',
    labelColor: '#4a473f', titleColor: '#2b2a27', labelFontSize: 12, titleFontSize: 12, titleFontWeight: 600
  },
  text: {font: 'Source Sans 3, sans-serif'},
  view: {stroke: null}
};

var views = {};

// Every chart reads the same files, so share one download per file.
var loader = vega.loader();
var loadFile = loader.load.bind(loader);
var downloads = {};
loader.load = function (uri, options) {
  return downloads[uri] || (downloads[uri] = loadFile(uri, options));
};

function embedChart(spec) {
  var id = spec[0], url = spec[1], kind = spec[2];
  var el = document.getElementById(id);
  if (!el) { return Promise.resolve(); }
  return vegaEmbed('#' + id, url, {actions: false, renderer: 'svg', config: THEME, loader: loader})
    .then(function (result) {
      views[id] = result.view;
      if (kind === 'fixed') {
        // Fixed-size charts: let the SVG scale down on narrow screens.
        var svg = el.querySelector('svg');
        var w = svg.getAttribute('width'), h = svg.getAttribute('height');
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.style.width = '100%';
        svg.style.height = 'auto';
      }
    })
    .catch(function (err) {
      console.error('Chart failed: ' + id, err);
      el.textContent = 'This chart could not be loaded.';
    });
}

// Wait for the web fonts so the word cloud measures text with the right font.
var fontsReady = (document.fonts && document.fonts.load)
  ? Promise.all([
      document.fonts.load('700 20px "Cormorant Garamond"'),
      document.fonts.load('400 14px "Source Sans 3"'),
      document.fonts.load('600 14px "Source Sans 3"')
    ]).catch(function () {})
  : Promise.resolve();

fontsReady.then(function () {
  return Promise.all(CHARTS.map(embedChart));
}).then(function () {
  document.documentElement.setAttribute('data-charts', 'ready');
});

// ---- War selector: drives the dot map and the choropleth together ----
var memorialRows = null;   // the Queensland register, read once for the live count

function fmt(n) { return n.toLocaleString('en-AU'); }

function updateReadout(war) {
  if (!memorialRows) { return; }
  var hits = 0;
  for (var i = 0; i < memorialRows.length; i++) {
    if ((memorialRows[i].conflicts || '').indexOf(war) >= 0) { hits++; }
  }
  document.getElementById('war-count').textContent = fmt(hits);
  document.getElementById('war-share').textContent = Math.round(hits / memorialRows.length * 100);
}

function selectWar(button) {
  var buttons = document.querySelectorAll('.war-buttons button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].setAttribute('aria-pressed', buttons[i] === button ? 'true' : 'false');
  }
  var war = button.getAttribute('data-war');
  CHARTS.forEach(function (spec) {
    if (spec[2] === 'war' && views[spec[0]]) {
      views[spec[0]].signal('conflict', war).run();
    }
  });
  var names = document.querySelectorAll('.selected-war');
  for (var j = 0; j < names.length; j++) { names[j].textContent = button.textContent; }
  updateReadout(war);
}

var warButtons = document.querySelectorAll('.war-buttons button');
for (var b = 0; b < warButtons.length; b++) {
  warButtons[b].addEventListener('click', function (e) { selectWar(e.currentTarget); });
}

loader.load('data/qld_memorials.csv')
  .then(function (text) {
    memorialRows = vega.read(text, {type: 'csv'});
    var pressed = document.querySelector('.war-buttons button[aria-pressed="true"]');
    updateReadout(pressed.getAttribute('data-war'));
  })
  .catch(function (err) { console.error('Could not read the memorial data for the count', err); });

// ---- "How to read this chart": show / hide a short explanation ----
function toggleHowTo(e) {
  var button = e.currentTarget;
  var panel = document.getElementById(button.getAttribute('data-target'));
  var open = panel.classList.toggle('open');
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
}

var howButtons = document.querySelectorAll('.howto-button');
for (var h = 0; h < howButtons.length; h++) {
  howButtons[h].addEventListener('click', toggleHowTo);
}
