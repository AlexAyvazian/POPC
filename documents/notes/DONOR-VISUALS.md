# Donor table visuals

Each of the three donor tables on all 11 committee pages and the two totaling pages has four visuals immediately above the table. PAC menu pages have none. All 39 visual sets share the master sector classifier, researched names, and the same filtered donor groups as the associated table. Pagination does not limit a visual's data.

- Radar: shares of positive net contributions by sector. Seven largest sectors plus a labeled remainder, with one common radial scale. One- and two-sector datasets include zero-value axes.
- Circle packing: master sector → researched donor. Areas encode positive net dollars. Each sector shows the 12 largest donors and a labeled bucket containing the exact sum of the remaining donors.
- Bubble: x = signed sector dollars; y = receipt count on a labeled square-root scale; circle area = distinct donors contributing in that sector.
- Dot matrix: each donor is assigned once to their largest sector by absolute net contribution. Full dots represent one donor for small datasets; large datasets use a labeled unit. Fractional dots preserve exact remainders.

Signed adjustments remain included in net totals and bubble positions. Radar and packed circles use positive net donor amounts within sectors. The chart footer provides the adjustment amount and net table total.

## Rendering and interaction

Each page contains 12 SVG charts in responsive two-column grids, stacked on small screens. Geometry and label spacing recompute from measured plot widths. Colors remain consistent across all tabs and both networks. Marks support hover, tap and keyboard inspection; sector legend buttons provide an alternative to small marks. Exact values remain available in the table.

The data model is separate from SVG rendering. D3 hierarchy 3.1.2 supplies the packing geometry; its pinned ISC-licensed bundle is served locally, with no external script requests. At most 13 leaves per sector are rendered, limiting mark count on pages containing three simultaneous packs. Dot matrices contain at most 437 marks. Search updates the charts; table pagination does not recalculate them. No animation is required, and reduced-motion preferences are respected.

Tests reconcile all four visual models against all 39 donor table datasets, verify signed and empty data, and exercise placement, search, exact dot counts, keyboard inspection, and mobile sizing in Chromium.
