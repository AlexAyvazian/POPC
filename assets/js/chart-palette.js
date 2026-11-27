// Sequential chart palette sampled from the user-supplied 8×9 swatch image.
// Every family intentionally skips swatch 1: Blues 2–9, Teals 2–9, Greens 2–9,
// Yellows 2–9, Oranges 2–9, Reds 2–9, Pinks 2–9, Purples 2–9.
export const chartSwatches=Object.freeze({
  "blue2":"#89c9f1","blue3":"#75a6e0","blue4":"#6ea4eb","blue5":"#6898e8","blue6":"#4256cc","blue7":"#4862c0","blue8":"#3144a8","blue9":"#151c74",
  "teal2":"#bdf8f1","teal3":"#b4f0ea","teal4":"#96ddd1","teal5":"#7fc7bd","teal6":"#456e77","teal7":"#416b75","teal8":"#314f65","teal9":"#26414f",
  "green2":"#ccf986","green3":"#c2ef7f","green4":"#9fea67","green5":"#97df60","green6":"#75ae49","green7":"#6a9c42","green8":"#4d7a30","green9":"#3d6325",
  "yellow2":"#faef81","yellow3":"#f1e266","yellow4":"#eccf5f","yellow5":"#be9c48","yellow6":"#a99442","yellow7":"#897233","yellow8":"#775f2b","yellow9":"#6a5826",
  "orange2":"#e7a751","orange3":"#dd7941","orange4":"#e39a4c","orange5":"#d8593a","orange6":"#b85a31","orange7":"#9c4626","orange8":"#7b311d","orange9":"#80311d",
  "red2":"#d65649","red3":"#d84a3a","red4":"#dd7852","red5":"#a33624","red6":"#cf4d3d","red7":"#9a3122","red8":"#7d251e","red9":"#55171f",
  "pink2":"#e5a1c5","pink3":"#d573aa","pink4":"#dd90ad","pink5":"#a44471","pink6":"#8f466a","pink7":"#8b3d61","pink8":"#732a48","pink9":"#73225b",
  "purple2":"#cd6bcf","purple3":"#cd6fcc","purple4":"#9f48a1","purple5":"#813993","purple6":"#772f8a","purple7":"#6a2886","purple8":"#4f1463","purple9":"#4d1365"
});
export const approvedChartColors=Object.freeze(Object.values(chartSwatches));
// Use the supplied family order exactly; never randomize or reshuffle the palette.
export const chartSequence=approvedChartColors;
export const chartFamilies=Object.freeze([
 Object.freeze([chartSwatches.blue2,chartSwatches.blue3,chartSwatches.blue4,chartSwatches.blue5,chartSwatches.blue6,chartSwatches.blue7,chartSwatches.blue8,chartSwatches.blue9]),
 Object.freeze([chartSwatches.teal2,chartSwatches.teal3,chartSwatches.teal4,chartSwatches.teal5,chartSwatches.teal6,chartSwatches.teal7,chartSwatches.teal8,chartSwatches.teal9]),
 Object.freeze([chartSwatches.green2,chartSwatches.green3,chartSwatches.green4,chartSwatches.green5,chartSwatches.green6,chartSwatches.green7,chartSwatches.green8,chartSwatches.green9]),
 Object.freeze([chartSwatches.yellow2,chartSwatches.yellow3,chartSwatches.yellow4,chartSwatches.yellow5,chartSwatches.yellow6,chartSwatches.yellow7,chartSwatches.yellow8,chartSwatches.yellow9]),
 Object.freeze([chartSwatches.orange2,chartSwatches.orange3,chartSwatches.orange4,chartSwatches.orange5,chartSwatches.orange6,chartSwatches.orange7,chartSwatches.orange8,chartSwatches.orange9]),
 Object.freeze([chartSwatches.red2,chartSwatches.red3,chartSwatches.red4,chartSwatches.red5,chartSwatches.red6,chartSwatches.red7,chartSwatches.red8,chartSwatches.red9]),
 Object.freeze([chartSwatches.pink2,chartSwatches.pink3,chartSwatches.pink4,chartSwatches.pink5,chartSwatches.pink6,chartSwatches.pink7,chartSwatches.pink8,chartSwatches.pink9]),
 Object.freeze([chartSwatches.purple2,chartSwatches.purple3,chartSwatches.purple4,chartSwatches.purple5,chartSwatches.purple6,chartSwatches.purple7,chartSwatches.purple8,chartSwatches.purple9])
]);
export const colorAt=index=>chartSequence[index%chartSequence.length];
export function sequentialColors(names){return new Map([...new Set(names)].map((name,index)=>[name,colorAt(index)]));}
export function balancedPalette(count){
 const n=Math.max(0,Math.min(Number(count)||0,chartSequence.length)),base=Math.floor(n/chartFamilies.length),extra=n%chartFamilies.length;
 // Select balanced family quotas first, then regroup once into the fixed display order:
 // Blue → Teal → Green → Yellow → Orange → Red → Pink → Purple.
 const quotas=chartFamilies.map((_,index)=>base+(index<extra?1:0)),palette=[];
 for(let family=0;family<chartFamilies.length;family++)for(let shade=0;shade<quotas[family];shade++)palette.push(chartFamilies[family][shade]);
 return palette;
}
export function balancedColors(names){
 const unique=[...new Set(names)],palette=balancedPalette(unique.length);
 return new Map(unique.map((name,index)=>[name,palette[index]??colorAt(index)]));
}
