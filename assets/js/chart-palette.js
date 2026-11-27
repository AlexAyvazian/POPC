// Selected numbered swatches sampled from the supplied image, converted from its embedded ICC profile to sRGB.
export const chartSwatches=Object.freeze({
  "blue1": "#ecfeff",
  "blue2": "#74cbf5",
  "blue3": "#66a8e5",
  "blue4": "#5ca6f1",
  "blue5": "#599aee",
  "blue6": "#3c57d3",
  "teal2": "#acfaf1",
  "teal3": "#a2f2ea",
  "teal4": "#7fdfd1",
  "teal5": "#65c9bd",
  "green1": "#f5fef2",
  "green2": "#c0fb74",
  "green3": "#b6f16e",
  "green4": "#86ec4f",
  "green5": "#7fe148",
  "green6": "#62b036",
  "yellow1": "#fffed9",
  "yellow2": "#fcef6e",
  "yellow3": "#f4e14a",
  "yellow4": "#f2ce45",
  "orange1": "#fbea61",
  "orange2": "#f2a43b",
  "orange3": "#ec722f",
  "orange4": "#f09638",
  "orange5": "#e94e2c",
  "red1": "#f1a38a",
  "red2": "#e74a41",
  "red3": "#ea3a2e",
  "red4": "#ed7147",
  "red6": "#e04033",
  "pink1": "#f9d9ef",
  "pink2": "#f19dc7",
  "pink3": "#e46cac",
  "pink4": "#ea8cae",
  "purple1": "#f9dafa",
  "purple2": "#dc64d4",
  "purple3": "#dc69d1",
  "purple4": "#ac41a6"
});
export const approvedChartColors=Object.freeze(Object.values(chartSwatches));
// Follow the supplied family order and each selected swatch number in ascending order.
export const chartSequence=approvedChartColors;
export const colorAt=index=>chartSequence[index%chartSequence.length];
export function sequentialColors(names){return new Map([...new Set(names)].map((name,index)=>[name,colorAt(index)]));}
