// Selected numbered swatches sampled from the supplied image, converted from its embedded ICC profile to sRGB.
import {masterSectors} from './master-sectors.js';
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
const sectorSwatches=["blue6", "green6", "green5", "orange2", "purple4", "purple2", "yellow4", "teal5", "blue5", "purple3", "orange4", "blue3", "teal4", "teal3", "orange3", "blue4", "red2", "purple1", "pink3", "orange5", "pink4", "red6", "pink2", "green2", "teal2", "red3", "blue2", "yellow3", "pink1", "red4", "green4", "blue1", "orange1", "red1", "green3", "green1", "yellow1"];
export function sectorColor(name){
 const index=masterSectors.indexOf(name);
 return chartSwatches[index>=0?sectorSwatches[index]:'yellow2'];
}
export const chartSequence=Object.freeze(sectorSwatches.map(key=>chartSwatches[key]).concat(chartSwatches.yellow2));
