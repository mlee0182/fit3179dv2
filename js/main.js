var CHARTS = [
  ['chart-waffle', 'js/01_waffle.vg.json'],
  ['chart-gantt', 'js/02_gantt.vg.json'],
  ['chart-treemap', 'js/03_treemap.vg.json', 'fixed'],
  ['chart-bar', 'js/04_bar_chart.vg.json'],
  ['chart-dot', 'js/05_dot_map.vg.json'],
  ['chart-choropleth', 'js/06_choropleth.vg.json'],
  ['chart-symbol', 'js/07_proportional_symbol_map.vg.json'],
  ['chart-bin', 'js/08_bin_map.vg.json'],
  ['chart-heatmap', 'js/09_heatmap.vg.json'],
  ['chart-venn', 'js/10_venn.vg.json', 'fixed'],
  ['chart-wordcloud', 'js/11_wordcloud.vg.json', 'fixed'],
  ['chart-slope', 'js/12_slope.vg.json']
];

var THEME = {
  font: "'Source Sans 3', Helvetica, Arial, sans-serif",
  background: null,
  axis: {
    labelFont: "'Source Sans 3', sans-serif", titleFont: "'Source Sans 3', sans-serif",
    labelColor: '#4a473f', titleColor: '#4a473f', labelFontSize: 14, titleFontSize: 14,
    titleFontWeight: 600, domainColor: '#9b9588', tickColor: '#9b9588', gridColor: '#e6e1d4'
  },
  legend: {
    labelFont: "'Source Sans 3', sans-serif", titleFont: "'Source Sans 3', sans-serif",
    labelColor: '#4a473f', titleColor: '#2b2a27', labelFontSize: 14, titleFontSize: 14, titleFontWeight: 600
  },
  text: {font: "'Source Sans 3', sans-serif", fontSize: 14},
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

// Draw a chart in the given element, and store the view for later use.
function embedChart(spec) {
  var id = spec[0], url = spec[1], kind = spec[2];
  var el = document.getElementById(id);
  if (!el) { return Promise.resolve(); }
  return vegaEmbed('#' + id, url, {actions: false, renderer: 'svg', config: THEME, loader: loader})
    .then(function (result) {
      views[id] = result.view;
      if (kind === 'fixed') {
        // Fixed-size spec: let the SVG scale to its column
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
      document.fonts.load('600 14px "Source Sans 3"'),
      document.fonts.load('700 14px "Source Sans 3"')
    ]).catch(function () {})
  : Promise.resolve();

fontsReady.then(function () {
  return Promise.all(CHARTS.map(embedChart));
}).then(function () {
  alignYearSlider();
  if (views['chart-gantt']) { views['chart-gantt'].addResizeListener(alignYearSlider); }
  document.documentElement.setAttribute('data-charts', 'ready');
});

function alignYearSlider() {
  var view = views['chart-gantt'];
  var label = document.querySelector('#chart-gantt .vega-bind label');
  if (!view || !label) { return; }
  var input = label.querySelector('input');
  var x = view.scale('x');
  // view.origin() leaves out the spec's padding
  var plotLeft = document.querySelector('#chart-gantt svg').getBoundingClientRect().left
    - label.getBoundingClientRect().left + view.origin()[0] + view.padding().left;
  // Same mid-year date the spec uses for the red line
  var start = plotLeft + x(new Date(+input.min, 6, 1));
  var end = plotLeft + x(new Date(+input.max, 6, 1));
  var thumb = parseFloat(getComputedStyle(input).getPropertyValue('--thumb'));
  // 14 = the y-axis labelPadding in 02_gantt.vg.json
  label.style.setProperty('--name-width', (plotLeft - 14) + 'px');
  label.style.setProperty('--track-left', (start - thumb / 2) + 'px');
  label.style.setProperty('--track-width', (end - start + thumb) + 'px');
}

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
