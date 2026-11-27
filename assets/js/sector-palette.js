import {chartSequence,balancedColors} from './chart-palette.js?v=regroup3';
import {masterSectors} from './donor-data.js?v=claude1';

if(masterSectors.length>chartSequence.length)throw Error('Sector palette is shorter than the researched sector taxonomy');

const map=balancedColors(masterSectors);

export const sectorColor=name=>map.get(name)||chartSequence[0];
export const sectorColors=names=>new Map([...new Set(names)].map(name=>[name,sectorColor(name)]));
export const researchedSectorColors=Object.freeze(masterSectors.map(name=>sectorColor(name)));
