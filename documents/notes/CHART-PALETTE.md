# Chart palette

The shared donor palette uses only swatches 2–9 from each of the eight supplied color families. Pixel values were converted to sRGB before use. No generated tints or data-mark opacity are applied.

Balanced charts use one hardcoded rule in `balancedPalette()`:

1. **Select** how many colors each family receives by round-robin quota, keeping family usage as even as possible.
2. **Regroup** the selected colors before assignment into the fixed display order **Blue → Teal → Green → Yellow → Orange → Red → Pink → Purple**.
3. Within each family, assign shades in ascending order **2 → 3 → 4 → 5 → 6 → 7 → 8 → 9**.

Example for 11 categories: **Blue 2 → Blue 3 → Teal 2 → Teal 3 → Green 2 → Green 3 → Yellow 2 → Orange 2 → Red 2 → Pink 2 → Purple 2**.

Sector identities do not have permanent semantic colors; each visual selects its balanced palette for the categories displayed, then uses the regrouped sequence above.

| Swatch | sRGB |
| --- | --- |
| blue2 | `#89c9f1` |
| blue3 | `#75a6e0` |
| blue4 | `#6ea4eb` |
| blue5 | `#6898e8` |
| blue6 | `#4256cc` |
| blue7 | `#4862c0` |
| blue8 | `#3144a8` |
| blue9 | `#151c74` |
| teal2 | `#bdf8f1` |
| teal3 | `#b4f0ea` |
| teal4 | `#96ddd1` |
| teal5 | `#7fc7bd` |
| teal6 | `#456e77` |
| teal7 | `#416b75` |
| teal8 | `#314f65` |
| teal9 | `#26414f` |
| green2 | `#ccf986` |
| green3 | `#c2ef7f` |
| green4 | `#9fea67` |
| green5 | `#97df60` |
| green6 | `#75ae49` |
| green7 | `#6a9c42` |
| green8 | `#4d7a30` |
| green9 | `#3d6325` |
| yellow2 | `#faef81` |
| yellow3 | `#f1e266` |
| yellow4 | `#eccf5f` |
| yellow5 | `#be9c48` |
| yellow6 | `#a99442` |
| yellow7 | `#897233` |
| yellow8 | `#775f2b` |
| yellow9 | `#6a5826` |
| orange2 | `#e7a751` |
| orange3 | `#dd7941` |
| orange4 | `#e39a4c` |
| orange5 | `#d8593a` |
| orange6 | `#b85a31` |
| orange7 | `#9c4626` |
| orange8 | `#7b311d` |
| orange9 | `#80311d` |
| red2 | `#d65649` |
| red3 | `#d84a3a` |
| red4 | `#dd7852` |
| red5 | `#a33624` |
| red6 | `#cf4d3d` |
| red7 | `#9a3122` |
| red8 | `#7d251e` |
| red9 | `#55171f` |
| pink2 | `#e5a1c5` |
| pink3 | `#d573aa` |
| pink4 | `#dd90ad` |
| pink5 | `#a44471` |
| pink6 | `#8f466a` |
| pink7 | `#8b3d61` |
| pink8 | `#732a48` |
| pink9 | `#73225b` |
| purple2 | `#cd6bcf` |
| purple3 | `#cd6fcc` |
| purple4 | `#9f48a1` |
| purple5 | `#813993` |
| purple6 | `#772f8a` |
| purple7 | `#6a2886` |
| purple8 | `#4f1463` |
| purple9 | `#4d1365` |
