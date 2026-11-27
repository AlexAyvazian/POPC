# Chart palette

The shared palette uses only the numbered swatches selected from the supplied November 24 image. Balanced charts first choose how many swatches each color family receives by round-robin quota, then regroup those selected swatches before assignment into the fixed family order Blue → Teal → Green → Yellow → Orange → Red → Pink → Purple, with shade numbers ascending within each family. This regrouping rule is hardcoded once in `balancedPalette()` and is shared by every donor visual. Pixel values were converted using the embedded ICC profile to sRGB before sampling the center of each swatch. No generated tints or data-mark opacity are applied. Each chart assigns the palette consecutively to its displayed data order, starting at Blue 1. The order is Blues 1–6, Teals 2–5, Greens 1–6, Yellows 1–4, Oranges 1–5, Reds 1–4 and 6, Pinks 1–4, Purples 1–4. Sector identities do not have fixed colors.

| Swatch | sRGB |
| --- | --- |
| blue1 | `#ecfeff` |
| blue2 | `#74cbf5` |
| blue3 | `#66a8e5` |
| blue4 | `#5ca6f1` |
| blue5 | `#599aee` |
| blue6 | `#3c57d3` |
| teal2 | `#acfaf1` |
| teal3 | `#a2f2ea` |
| teal4 | `#7fdfd1` |
| teal5 | `#65c9bd` |
| green1 | `#f5fef2` |
| green2 | `#c0fb74` |
| green3 | `#b6f16e` |
| green4 | `#86ec4f` |
| green5 | `#7fe148` |
| green6 | `#62b036` |
| yellow1 | `#fffed9` |
| yellow2 | `#fcef6e` |
| yellow3 | `#f4e14a` |
| yellow4 | `#f2ce45` |
| orange1 | `#fbea61` |
| orange2 | `#f2a43b` |
| orange3 | `#ec722f` |
| orange4 | `#f09638` |
| orange5 | `#e94e2c` |
| red1 | `#f1a38a` |
| red2 | `#e74a41` |
| red3 | `#ea3a2e` |
| red4 | `#ed7147` |
| red6 | `#e04033` |
| pink1 | `#f9d9ef` |
| pink2 | `#f19dc7` |
| pink3 | `#e46cac` |
| pink4 | `#ea8cae` |
| purple1 | `#f9dafa` |
| purple2 | `#dc64d4` |
| purple3 | `#dc69d1` |
| purple4 | `#ac41a6` |
