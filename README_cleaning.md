# Data sources and cleaning log

How every file in `data/` was obtained and prepared.
Nothing below changes a source value. Each step converts a format, removes a non-data row,
adds a new column whose method is described here, or (for the map) simplifies shapes.

The two raw downloads are kept unchanged in `data/raw/` for reference:
- `data/raw/war-memorials.csv`: the Queensland register exactly as downloaded (Mac Roman text encoding)
- `data/raw/casualties.csv`: the AWM casualty table as copied from the web page

The page itself loads only the files in `data/`, never `data/raw/`.

| File in `data/` | Source | How it was made |
|---|---|---|
| `qld_memorials.csv` | Queensland Government | Cleaned from `raw/war-memorials.csv` (§1) |
| `awm_deaths_by_conflict.csv` | Australian War Memorial | Cleaned from `raw/casualties.csv` (§2) |
| `memorials_vs_deaths.csv` | AWM + Places of Pride | Calculated from two other files (§3) |
| `pop_memorials_by_conflict.csv`, `pop_memorials_by_type.csv` | Places of Pride (AWM) | Result counts read from the register's filters (§4) |
| `qld_councils.json` | Australian Bureau of Statistics | Boundaries simplified and converted to TopoJSON (§5) |

---

## 1. `qld_memorials.csv` (from the downloaded `war-memorials.csv`)
**Source:** Queensland Government, *Register of War Memorials* (data.qld.gov.au / data.gov.au), records up to Dec 2019.
1,399 memorials in, 1,399 out.

| Step | What and why |
|---|---|
| Text encoding | The original is saved in Mac Roman, so dashes and apostrophes broke in the browser ("1899Ð1902"). Re-saved as UTF-8 ("1899–1902"). |
| Kept columns | `id, name, suburb, postcode, latitude, longitude, type, conflicts`, unchanged. Dropped long HTML text columns not used by any chart (`address, description, services_held, add_info, recorded_by`), which shrinks the file from 1.4 MB to about 0.5 MB. |
| `inscription` (new) | `inscript` with HTML tags (`<p>`, `<br />`) and entities (`&nbsp;`) removed. Same words, plain text, for the word cloud. |
| `type_main` (new) | Two rows list two types ("Stone/cairn/plinth<br />Place", "Gate/Arch, Plaque"). `type_main` is the first one listed, so every memorial has exactly one type for the heatmap. `type` is kept as the original. |
| `n_conflicts` (new) | Number of conflicts in the `|`-separated `conflicts` field. |
| `date_recorded` | Converted from d/m/yy to YYYY-MM-DD. Two "1/1/70" placeholder dates were set to blank. |
| `lga_code`, `lga_name` (new) | The council each memorial is in, found by checking which ABS 2025 council boundary contains its coordinates (a point-in-polygon spatial join). |
| `lga_method` (new) | How the council was found: **inside boundary** for 1,365 memorials; **nearest council** for 28 points on the waterfront just outside the coastline; **by suburb** for 6 memorials where the coordinates were missing (1) or clearly don't match the listed suburb (5, e.g. "Kalinga Honour Gates, Clayfield" has coordinates in Rockhampton). |
| `coords_ok` (new) | `False` for those 7 memorials. Their coordinates are kept exactly as published, but filter them out of the dot map so they don't appear in the sea or the wrong city. |

Result: memorials are in 66 of Queensland's 78 councils, and every `lga_name` matches `properties.LGA_NAME` in `qld_councils.json`.

---

## 2. `awm_deaths_by_conflict.csv` (from the AWM table, saved as `casualties.csv`)
**Source:** Australian War Memorial, *Deaths as a result of service with Australian units*,
https://www.awm.gov.au/articles/encyclopedia/war_casualties
36 conflicts. Deaths add up to **103,139**, matching the AWM's own total row.

| Step | What and why |
|---|---|
| Removed the "Total" row | It isn't a conflict; summing it would double every chart. |
| `deaths` | Text such as "61,727" turned into the number 61727; "Nil" (New Zealand 1860–61) turned into 0. |
| `dates_awm` | The AWM's original date text, kept for reference. |
| `start_date`, `end_date` (new) | Read from `dates_awm` by hand, row by row. Where the AWM gives only years ("1947–50"), the dates are 1 Jan of the first year and 31 Dec of the last; `date_precision` says `year` or `day`. |
| `ongoing` (new) | `True` for the three rows with no end year ("1979-", "1997 -", "2014 -"); `end_date` is blank. |
| `conflict` | Line break removed from the Kashmir name; missing "(" fixed in "Irian Jaya (Operation Cenderawasih)". |
| `pop_conflict` (new) | The matching conflict name in Places of Pride, so the two sources can be compared: South Africa → Boer War, China → Boxer Rebellion, Iraq → Second Gulf War (Iraq), and the two East Timor rows → East Timor. Left blank where Places of Pride has no matching tag. |

Note for the Gantt chart: these are the AWM's official service periods, not the popular war dates (e.g. WWI runs to 1921). Label the chart accordingly.

---

## 3. `memorials_vs_deaths.csv` (new, for the slope graph)
Built from `pop_memorials_by_conflict.csv` + `awm_deaths_by_conflict.csv`. 14 rows, one per specific war tagged in Places of Pride.

- `memorial_mentions` = Places of Pride count for that war.
- `deaths` = sum of AWM deaths for rows with that `pop_conflict` (0 where the AWM lists none: First Gulf War, Thai-Malay).
- `pct_memorials` = mentions ÷ total mentions of these 14 wars. A memorial tagged with several wars counts once for each, so this measures how often a war is commemorated, not how many memorials exist.
- `pct_deaths` = deaths ÷ total deaths of these 14 wars.
- Both percentage columns add up to 100.

---

## 4. `pop_memorials_by_*` files (Places of Pride)
**Source:** Australian War Memorial, *Places of Pride: National Register of War Memorials*,
https://placesofpride.awm.gov.au/memorials. **Retrieved:** 12 October 2026. The register held **12,935 memorials** that day.

**Why it was collected this way:** the register has no download or open-data file. Its memorial search page has two filters,
*Filter by Memorial Type* (41 types) and *Filter by Conflict* (18 options), and after filtering it shows the number of matching
memorials ("Displaying 1 – 24 of **N**").

**Method:** each file records that **N**, as displayed by the site, for every filter setting. No individual memorial records were downloaded or edited.
| File | Filter applied | Rows |
|---|---|---|
| `pop_memorials_by_conflict.csv` | each conflict on its own | 18 |
| `pop_memorials_by_type.csv` | each memorial type on its own | 41 |

The counts were read automatically, by loading each filtered results page in a browser and reading its "of N" figure,
then spot-checked by hand against the live site.

**Columns added (not from the site):**
- `retrieved`: the collection date, because the register is crowd-sourced and keeps growing.
- `conflict` (short name), `start_year`, `end_year`, `is_specific_war` in the conflict file: taken from the filter labels
  (e.g. "First World War, 1914–18" → First World War, 1914, 1918). `is_specific_war` is `False` for "All", "Other",
  "National Service" and "Peacekeeping", which aren't single wars.
- `family` in the type file: **the author's own grouping** of the 41 types into five groups for the treemap
  (Rolls and boards, Monuments, Buildings, Trees/parks/gardens, Other). It is not an AWM category.

**Limits:**
- One memorial can be tagged with several conflicts, so the conflict counts add up to 14,821, more than the 12,935 memorials.
- Type counts add up to 12,259 entries; the register holds 12,935 memorials. The site does not say whether a memorial can have several types, so these are treated as entries, not unique memorials.
- The counts show what has been *registered* by 12 Oct 2026, not every memorial in Australia.

---

## 5. `qld_councils.json` (Queensland council boundaries)
**Source:** Australian Bureau of Statistics, *Australian Statistical Geography Standard (ASGS) Edition 3: Local Government Areas 2025*,
ABS geospatial web service (generalised LGA layer),
https://geo.abs.gov.au/arcgis/rest/services/ASGS2025/LGA/MapServer. Licence: CC BY 4.0. **Retrieved:** 12 October 2026.

| Step | What and why |
|---|---|
| Selected Queensland | Requested the councils with state code 3 (Queensland), in longitude/latitude (WGS84). That gave 80 records: 78 councils plus 2 ABS codes with no area ("No usual address (Qld)", "Migratory – Offshore – Shipping (Qld)"), which were dropped. |
| Simplified the shapes | Removed points along each border to about **1 km** detail, so the file fits the "few MB" limit (about 4.5 MB → 67 KB). Each shared border was simplified once and used by both neighbouring councils, so there are no gaps or overlaps. |
| Dropped tiny islands | Offshore islands under about 10 km² were removed; each council keeps its main area. They are too small to see at this map size. |
| Cleaned and converted | Repaired with mapshaper (`-clean`) and exported as **TopoJSON**. |
| Kept attributes | `LGA_CODE`, `LGA_NAME` (ABS name), `AREA_SQKM` (ABS area, rounded). |

Note: the TopoJSON object inside the file is named **`qld_lga`**, so Vega-Lite specs use
`"format": {"type": "topojson", "feature": "qld_lga"}`.

The same result can be reproduced by hand: download the LGA 2025 shapefile from the ABS "Digital boundary files" page,
open it in mapshaper.org, filter `STATE_CODE_2021 == "3"`, simplify to about 5% (prevent shape removal), and export as TopoJSON.