# Chart notes: Munzner What / Why / How, per chart

Use this for the Moodle "How" section and for interview preparation.
Spec files are in `js/`. Charts 3 and 10 are Vega specs; the rest are Vega-Lite.
"Course link" says which tutorial or lecture material each chart is built on.

| # | Chart (idiom) | File | What (data) | Why (task) | How (marks and channels) | Course link |
|---|---|---|---|---|---|---|
| 1 | Waffle chart | `01_waffle.vg.json` | `awm_deaths_by_conflict.csv`: conflict (categorical), deaths (quantitative) | Compare parts of a whole; see that two wars dominate | 207 square marks (1 square = about 500 deaths); colour hue = conflict; position = filling order | Kirk waffle chart; Week 9 colour scales, custom legend |
| 2 | Gantt chart | `02_gantt.vg.json` | Same file: conflict, start and end date (temporal), deaths | Compare durations and overlaps; locate wars in time | Bar marks; position (x, x2) = start to end; length = duration; colour = war; text label = years, duration, deaths | Kirk Gantt chart; Week 9 text annotation layers |
| 3 | Treemap | `03_treemap.vg.json` | `pop_memorials_by_type.csv`: memorial type, family (the author's grouping), count | See part-to-whole in a two-level hierarchy | Rectangle area = count; frame = family; colour = family (red highlights rolls and boards) | Vega spec (stratify + treemap transforms); not in Vega-Lite |
| 4 | Bar chart | `04_bar_conflicts.vg.json` | `pop_memorials_by_conflict.csv`: war, memorial tag count | Rank wars by how often they are commemorated | Horizontal bars; length = count; colour = war (same as charts 1, 2, 11); direct value labels | Week 7 first bar chart; Week 9 layers |
| 5 | Dot map | `05_dot_map.vg.json` | `qld_memorials.csv`: latitude, longitude, conflicts | Locate memorials; spot clusters and gaps; compare one war to the rest | Circle marks at lat/long; colour = honours the selected war or not; opacity; conic equal-area projection | Week 8 symbol map code; Week 9 dropdown filter (driven by the HTML selector) |
| 6 | Proportional symbol map | `06_symbol_map.vg.json` | Same file, counted per council (`lga_name`) | Compare totals between councils | Circle **area** = count (Vega-Lite `size` is area); labels for the four largest | Week 8 proportional symbol map; Kirk: size by area, not radius |
| 7 | Choropleth | `07_choropleth.vg.json` | Same file + `qld_councils.json` (TopoJSON); share per council | Compare how strongly each council remembers the selected war | Area fill colour = % of the council's memorials that honour the war (5 classes); grey layers for too-few and no data | Week 8 choropleth: lookup, threshold classification, normalising, grey layer for missing data |
| 8 | Heatmap | `08_heatmap.vg.json` | Same file: `type_main` (categorical) x war (categorical, from splitting `conflicts`) | Compare memorial types across wars; see how building habits changed | Rectangle marks on a grid; colour lightness = % of that war's memorials; number labels for 5% or more | Kirk heat map: sorted axes, classed colours |
| 9 | Venn diagram | `09_venn.vg.json` | Same file: flags for First and Second World War | See set overlap: only WWI, only WWII, both, neither | Two overlapping circles (not to scale); text marks give the counts; colour = war | Kirk Venn diagram: label every region; built from layered marks |
| 10 | Word cloud | `10_wordcloud.vg.json` | Same file: `inscription` text | Get a quick sense of the language on memorials | Text marks; font size = word frequency; colour is decorative (cycled); stop words removed | Vega wordcloud transform; Kirk: size encodes frequency |
| 11 | Slope graph | `11_slope.vg.json` | `memorials_vs_deaths.csv`: two sources joined by war | Compare two shares for each war; see which are over- or under-remembered | Two vertical positions on a common % scale; line = war; colour for the five highlighted wars, grey for the rest; both ends labelled | Kirk slope graph; Week 9 annotation text layers |
| 12 | Hexagon bin map | `12_bin_map.vg.json` | Same file: latitude, longitude | See density without overplotting | Hexagon polygons (built in the spec from coordinates); colour = number of memorials in the hexagon (6 classes) | Week 8 lecture: bin maps vs choropleths |

## Interactions and where they come from

| Interaction | Where | Course link |
|---|---|---|
| War selector (5 buttons) updates charts 5 and 7 together | `js/main.js` sets the shared `conflict` parameter on both views | Week 9 dropdown filter, driven from outside the chart through the Vega view API |
| Tooltips on every chart (dark card style in `css/style.css`) | all specs | Week 9 tooltip section |
| Hover outlines the council under the pointer | `07_choropleth.vg.json` | Vega-Lite point selection with `mouseover` |
| Hover highlights one war and names it | `11_slope.vg.json` | Week 9 selection with a conditional encoding |
| Live count of memorials for the selected war | `js/main.js` reads `qld_memorials.csv` | Week 7 JavaScript events |
| Hover highlight on treemap rectangles | `03_treemap.vg.json` | Vega `hover` encode set |
| "How to read this chart" show / hide | `js/main.js`, `index.html` | Week 7 Part A: toggling element visibility with `display` |

## Design decisions to be ready to explain

| Decision | Reason |
|---|---|
| `conicEqualArea` projection, parallels -14 and -25, rotate -146 | Dot and choropleth maps need an **equal-area** projection so area is not distorted; a **conic** projection suits a mid-latitude region; the standard parallels sit inside Queensland's latitude range |
| Percentages, not counts, in the choropleth | Raw counts mostly show which councils are big; big areas also dominate visually |
| Councils with fewer than 10 memorials left pale | A share from 5 memorials jumps 20 points per memorial, which would mislead |
| Same colour per war in charts 1, 2, 4, 11 | Consistent colour lets the reader carry the meaning between charts |
| Palette avoids red and green; tested with colour-blind simulation | About 1 in 12 men cannot tell red from green; the closest pair of war colours is still clearly different (dE 23) |
| Annotations are 10 words or fewer; text lines are 10 words or fewer | Short lines are easier to read; the tutor critique list asks for it |
| Poppy red used only for emphasis (selected war, rolls and boards, circles) | One accent colour keeps visual hierarchy clear |
| Heatmap columns normalised to 100% | Wars differ in size, so counts would hide the pattern |
| Waffle: every war gets at least one square | Otherwise the Malayan Emergency (39 deaths) would disappear; stated in the "How to read" note |
| Word cloud strips `[bracketed editor notes]` and catalogue words | These are cataloguing words (e.g. "names", "images"), not inscription text; the stop-word list is visible in the spec |
| Hexagon bins are in degrees (0.4 deg) | Close to equal area across Queensland (about 70 km wide); fine for density |
| Circle positions in chart 6 = mean location of the council's memorials | The boundary file has no ready centroids; this is stated in the caption |

## Known limits (say these if asked)

- Places of Pride counts are crowd-sourced and still growing; they show what has been registered.
- The Queensland register stops at December 2019.
- Memorial counts measure how often a war is commemorated, not importance.
- A memorial can honour several wars, so tags add up to more than memorials.
- The chart 11 percentages use only the 14 wars that are named in Places of Pride.
