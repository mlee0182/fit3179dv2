# Chart notes: Munzner What / Why / How, per chart

Use this for the Moodle "How" section and for interview preparation.
Spec files are in `js/`. Charts 3 and 11 are Vega specs; the rest are Vega-Lite.
"Course link" says which tutorial or lecture material each chart is built on.

| # | Chart (idiom) | File | What (data) | Why (task) | How (marks and channels) | Course link |
|---|---|---|---|---|---|---|
| 1 | Waffle chart | `01_waffle.vg.json` | `awm_deaths_by_conflict.csv`: conflict (categorical), deaths (quantitative) | Compare parts of a whole; see that two wars dominate | 211 square marks (1 full square = 500 deaths; each war's last square is filled only by its leftover share, inside a full-square outline); colour hue = conflict; position = filling order | Kirk waffle chart; Week 9 colour scales, custom legend |
| 2 | Gantt chart | `02_gantt.vg.json` | Same file: conflict, start and end date (temporal), deaths | Compare durations and overlaps; locate wars in time | Bar marks; position (x, x2) = start to end; length = duration; colour = war; text label = years, duration, deaths | Kirk Gantt chart; Week 9 text annotation layers |
| 3 | Treemap | `03_treemap.vg.json` | `pop_memorials_by_type.csv`: memorial type, family (the author's grouping), count | See part-to-whole in a two-level hierarchy | Rectangle area = count; frame = family; colour = family (red highlights rolls and boards) | Vega spec (stratify + treemap transforms); not in Vega-Lite |
| 4 | Bar chart | `04_bar_chart.vg.json` | `pop_memorials_by_conflict.csv`: war, memorial tag count | Rank wars by how often they are commemorated | Horizontal bars; length = count; colour = war (same as charts 1, 2, 12); direct value labels | Week 7 first bar chart; Week 9 layers |
| 5 | Dot map | `05_dot_map.vg.json` | `qld_memorials.csv`: latitude, longitude, conflicts | Locate memorials; spot clusters and gaps; compare one war to the rest | Circle marks at lat/long; colour = honours the selected war or not; opacity; conic equal-area projection | Week 8 symbol map code; Week 9 dropdown filter (driven by the HTML selector) |
| 6 | Choropleth | `06_choropleth.vg.json` | Same file + `qld_councils.json` (TopoJSON); share per council | Compare how strongly each council remembers the selected war | Area fill colour = % of the council's memorials that honour the war (5 classes); grey layers for too-few and no data | Week 8 choropleth: lookup, threshold classification, normalising, grey layer for missing data |
| 7 | Graduated symbol map | `07_graduated_symbol_map.vg.json` (Vega) | Same file, counted per council (`lga_name`), grouped into 5 classes: 1–9, 10–24, 25–49, 50–99, 100+ | Compare totals between councils; spot the one council in the top class | One circle size per class (Vega `threshold` scale on `size`, radius 4/7/11/16/24 px). Circles start at the mean memorial position, then a `force` layout (collide + pull back to start) nudges them apart so the crowded south-east stays readable; labels for the four largest | Week 8 symbol maps; classes are easier to read off a legend than exact areas, and Brisbane stands alone in the top class |
| 8 | Hexagon bin map | `08_bin_map.vg.json` | Same file: latitude, longitude | See density without overplotting | Hexagon polygons (built in the spec from coordinates); colour = number of memorials in the hexagon (6 classes) | Week 8 lecture: bin maps vs choropleths |
| 9 | Heatmap | `09_heatmap.vg.json` | Same file: `type_main` (categorical) x war (categorical, from splitting `conflicts`) | Compare memorial types across wars; see how building habits changed | Rectangle marks on a grid; colour lightness = % of that war's memorials (6 labelled classes); number labels for 5% or more; types never above 5% grouped as "Other types" so every column still adds to 100%; empty cells filled as 0 so the grid is complete | Kirk heat map: sorted axes, classed colours |
| 10 | Venn diagram | `10_venn.vg.json` | Same file: flags for First and Second World War | See set overlap: only WWI, only WWII, both, neither | Two overlapping circles (not to scale) inside a box for all 1,399 memorials (the "universe", so "neither" sits in the box, outside both circles); text marks give the counts; colour = war | Kirk Venn diagram: label every region; built from layered marks |
| 11 | Word cloud | `11_wordcloud.vg.json` | Same file: `inscription` text | Get a quick sense of the language on memorials | Text marks; font size = word frequency; only words used 36+ times (58 words), all horizontal; red = the three headline words, dark = words from set phrases (lest, forget, supreme, liveth, evermore), grey = the rest; three stat cards below count whole phrases ("Lest we forget" 246, "the supreme sacrifice" 69, "Their name liveth for evermore" 38 memorials) | Vega wordcloud transform; Kirk: size encodes frequency |
| 12 | Slope graph | `12_slope.vg.json` | `memorials_vs_deaths.csv`: two sources joined by war | Compare two shares for each war; see which are over- or under-remembered | Two vertical positions on a common % scale; line = war; colour for the five highlighted wars, grey for the rest; both ends labelled | Kirk slope graph; Week 9 annotation text layers |

## Interactions and where they come from

| Interaction | Where | Course link |
|---|---|---|
| War selector (5 buttons) updates charts 5 and 6 together | `js/main.js` sets the shared `conflict` parameter on both views | Week 9 dropdown filter, driven from outside the chart through the Vega view API |
| Year slider on the timeline: a red line marks the year, wars not under way fade, and a label counts the wars under way | `02_gantt.vg.json` (`pickYear` parameter bound to a range input; styled in `css/style.css`) | Week 9 parameter bound to an HTML input (`bind`), conditional encoding on opacity |
| Tooltips on every chart (dark card style in `css/style.css`) | all specs | Week 9 tooltip section |
| Hover outlines the council under the pointer | `06_choropleth.vg.json` | Vega-Lite point selection with `mouseover` |
| Hover highlights one war and names it | `12_slope.vg.json` | Week 9 selection with a conditional encoding |
| Live count of memorials for the selected war | `js/main.js` reads `qld_memorials.csv` | Week 7 JavaScript events |
| Hover highlight on treemap rectangles | `03_treemap.vg.json` | Vega `hover` encode set |
| "How to read this chart" show / hide | `js/main.js`, `index.html` | Week 7 Part A: toggling element visibility with `display` |

## Design decisions to be ready to explain

| Decision | Reason |
|---|---|
| `conicEqualArea` projection, parallels -14 and -25, rotate -146 | Dot and choropleth maps need an **equal-area** projection so area is not distorted; a **conic** projection suits a mid-latitude region; the standard parallels sit inside Queensland's latitude range |
| Percentages, not counts, in the choropleth | Raw counts mostly show which councils are big; big areas also dominate visually |
| Councils with fewer than 10 memorials left pale | A share from 5 memorials jumps 20 points per memorial, which would mislead |
| Same colour per war in charts 1, 2, 4, 12 | Consistent colour lets the reader carry the meaning between charts |
| Palette avoids red and green; tested with colour-blind simulation | About 1 in 12 men cannot tell red from green; the closest pair of war colours is still clearly different (dE 23) |
| Annotations are 10 words or fewer; text lines are 10 words or fewer | Short lines are easier to read; the tutor critique list asks for it |
| Poppy red used only for emphasis (selected war, rolls and boards, circles) | One accent colour keeps visual hierarchy clear |
| Heatmap columns normalised to 100% | Wars differ in size, so counts would hide the pattern |
| Waffle: a war's last square is only part-filled | Giving every war a whole square would show 39 deaths as 500. Part-filled squares keep every square exactly 500; the outline keeps small wars visible (Malayan Emergency = 0.08 of a square) |
| Word cloud strips `[bracketed editor notes]` and catalogue words | These are cataloguing words (e.g. "names", "images"), not inscription text; the stop-word list is visible in the spec |
| Hexagon bins are in degrees (0.4 deg) | Close to equal area across Queensland (about 70 km wide); fine for density |
| Circle positions in chart 7 = mean location of the council's memorials | The boundary file has no ready centroids; this is stated in the caption |

## Known limits (say these if asked)

- Places of Pride counts are crowd-sourced and still growing; they show what has been registered.
- The Queensland register stops at December 2019.
- Memorial counts measure how often a war is commemorated, not importance.
- A memorial can honour several wars, so tags add up to more than memorials.
- The chart 12 percentages use only the 14 wars that are named in Places of Pride.
