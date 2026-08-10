
function optimizedRoute(ids){
  const list=[...ids];
  if(list.length<=2)return list;
  // Keep the first saved region as the starting point so the suggested route
  // feels connected to the traveler's own sequence, then optimize the rest.
  const start=list[0],rest=list.slice(1);
  let best=[start,...rest],bestCost=Infinity;
  permutations(rest).forEach(p=>{
    const candidate=[start,...p];
    let cost=0;
    for(let i=0;i<candidate.length-1;i++)cost+=travelCost(candidate[i],candidate[i+1]);
    if(cost<bestCost){bestCost=cost;best=candidate}
  });
  return best
}
function routeLegs(ids){
  const route=optimizedRoute(ids),legs=[];
  for(let i=0;i<route.length-1;i++)legs.push([route[i],route[i+1]]);
  return{route,legs}
}
function tripCrowdingWarning(regionCount){
  const d=daysVal();
  if(!d)return'';
  if(regionCount>=4&&d<=7)return`<div class="mb-6 rounded-[1.4rem] border-2 border-tomato bg-[#fff0ed] p-5"><div class="font-display text-2xl font-bold text-tomato">Four regions in ${state.exactDays?`${state.exactDays} days`:'5–7 days'} will limit what you can actually do.</div><p class="text-stone-700 mt-2">Even with an efficient route, four regions means at least three relocations — packing, checking out, getting to the station, traveling and settling in again. You can do it, but you will have less time for the experiences you saved. Consider dropping a region or treating one as a future trip.</p></div>`;
  if(regionCount>=3&&d<=7)return`<div class="mb-6 rounded-[1.4rem] border border-[#e6c98f] bg-cream p-5"><div class="font-display text-xl font-bold">This is a busy plan for a short trip.</div><p class="text-stone-700 mt-2">Three regions in about a week means at least two relocations. The route can be efficient, but each move reduces the time available for experiences.</p></div>`;
  if(regionCount>=4&&d<=10)return`<div class="mb-6 rounded-[1.4rem] border border-[#e6c98f] bg-cream p-5"><div class="font-display text-xl font-bold">Four regions will make this a fast-moving trip.</div><p class="text-stone-700 mt-2">It may work, especially with easy rail connections, but expect less depth in each region.</p></div>`;
  return''
}
function mapProject(lat,lon){
  // Simple equirectangular projection for the Italy-focused prototype.
  // Domain roughly covers mainland Italy, Sicily, Sardinia, lakes and Dolomites.
  const minLon=6.0,maxLon=19.2,minLat=35.2,maxLat=47.3;
  const x=70+((lon-minLon)/(maxLon-minLon))*620;
  const y=35+((maxLat-lat)/(maxLat-minLat))*690;
  return [x,y]
}
function mapPath(points){
  return points.map((p,i)=>{const [x,y]=mapProject(p[1],p[0]);return`${i?'L':'M'} ${x.toFixed(1)} ${y.toFixed(1)}`}).join(' ')+' Z'
}
function renderMap(){
  const mainland=[
    [6.8,46.0],[7.6,45.9],[8.6,46.1],[9.5,46.3],[10.7,46.5],[12.2,46.7],[13.4,46.5],
    [13.8,45.8],[13.2,45.2],[12.6,44.7],[12.4,44.0],[12.8,43.3],[13.5,42.8],[14.0,42.2],
    [14.7,41.4],[15.4,40.8],[16.3,40.1],[17.2,40.0],[18.1,40.4],[18.5,40.0],[18.1,39.5],
    [17.4,39.1],[16.9,38.8],[16.3,38.4],[15.9,38.0],[15.7,38.4],[15.9,39.0],[15.6,39.6],
    [15.0,40.0],[14.4,40.4],[13.8,41.0],[13.0,41.5],[12.4,42.0],[11.7,42.5],[11.0,43.0],
    [10.5,43.5],[10.0,44.0],[9.3,44.3],[8.4,44.1],[7.7,44.4],[7.3,45.0]
  ];
  const sicily=[
    [12.3,38.2],[13.0,38.1],[13.8,38.0],[14.6,38.0],[15.4,38.2],[15.7,37.7],[15.2,37.3],
    [14.4,37.0],[13.4,37.1],[12.7,37.4]
  ];
  const sardinia=[
    [8.1,41.2],[8.8,41.3],[9.4,40.8],[9.5,40.0],[9.3,39.2],[8.9,38.8],[8.4,39.0],[8.1,39.8]
  ];

  const savedRegions=[...state.savedRegions];
  const suggestedOrder=optimizedRoute(savedRegions);
  const regionPins=savedRegions.map(id=>{
    const r=regionById[id], [x,y]=mapProject(r.coords[0],r.coords[1]),order=suggestedOrder.indexOf(id)+1;
    return `<g><circle cx="${x}" cy="${y}" r="11" fill="#4F6F52" stroke="white" stroke-width="3"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="10" font-weight="700" fill="white">${order}</text><text x="${x+15}" y="${y-4}" class="map-pin-label">${r.short}</text></g>`
  }).join('');

  const expPins=[];
  savedRegions.forEach(id=>{
    const r=regionById[id];
    [...(state.savedExp.get(id)||new Set())].forEach(eid=>{
      const e=expById[eid];
      if(!e?.coords)return;
      const [x,y]=mapProject(e.coords[0],e.coords[1]);
      expPins.push(`<g><circle cx="${x}" cy="${y}" r="4.5" fill="#C79A4A" stroke="#292722" stroke-width="1"/><title>${e.name} — ${zoneLabels[reachMeta(e).zone]}</title></g>`)
    })
  });

  const connectingLines=[];
  for(let i=0;i<suggestedOrder.length-1;i++){
    const a=regionById[suggestedOrder[i]],b=regionById[suggestedOrder[i+1]];
    const [x1,y1]=mapProject(a.coords[0],a.coords[1]),[x2,y2]=mapProject(b.coords[0],b.coords[1]);
    connectingLines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#b8b0a4" stroke-width="3"/>`)
  }

  tripMap.innerHTML=`<svg viewBox="0 0 760 770" width="100%" height="100%" role="img" aria-label="Schematic map of Italy showing saved regions and experiences">
    <rect x="0" y="0" width="760" height="770" rx="18" fill="#f5f1e8"/>
    <text x="28" y="30" class="map-note">SUGGESTED ORDER</text>
    <text x="28" y="49" class="map-pin-label">${suggestedOrder.map(id=>regionById[id].short).join(' → ')}</text>
    <path d="${mapPath(mainland)}" fill="#e8dfd2" stroke="#9d9488" stroke-width="2.2"/>
    <path d="${mapPath(sicily)}" fill="#e8dfd2" stroke="#9d9488" stroke-width="2.2"/>
    <path d="${mapPath(sardinia)}" fill="#e8dfd2" stroke="#9d9488" stroke-width="2.2"/>
    ${connectingLines.join('')}
    ${expPins.join('')}
    ${regionPins}
    <g transform="translate(28,700)">
      <circle cx="7" cy="7" r="7" fill="#4F6F52"/><text x="22" y="11" class="map-note">Saved region</text>
      <circle cx="130" cy="7" r="4.5" fill="#C79A4A" stroke="#292722"/><text x="144" y="11" class="map-note">Saved experience</text>
      <line x1="270" y1="7" x2="312" y2="7" stroke="#b8b0a4" stroke-width="3"/><text x="322" y="11" class="map-note">suggested region order — exact transport comes later</text>
    </g>
  </svg>`;

  if(!savedRegions.length){
    tripMap.innerHTML=`<div class="min-h-[440px] flex items-center justify-center p-8 text-center text-stone-500"><div><div class="font-display text-2xl font-bold text-ink mb-2">Nothing to map yet</div><p>Save one or more regions and they will appear here.</p></div></div>`
  }
}
const travelOverrides={
'rome|tuscany':{level:'Lower',hours:'about 1½–2½ hours between Rome and Florence by fast train',example:'Rome → Florence',why:'Both sit on Italy’s main north–south high-speed rail spine.',solutions:['This pairing usually does not require a flight or car.','Choose central accommodation near rail stations if you want the transfer to feel simpler.']},
'rome|umbria':{level:'Lower',hours:'about 1–1½ hours for a representative Rome → Orvieto rail trip',example:'Rome → Orvieto',why:'Orvieto is directly reachable by rail from Rome.',solutions:['This can work as a separate stop or a day-trip style addition.','A car is not required for Orvieto itself.']},
'tuscany|bologna':{level:'Lower',hours:'about 40–60 minutes Florence → Bologna by fast train',example:'Florence → Bologna',why:'Both are on a strong high-speed rail corridor.',solutions:['This is one of the easier region-to-region moves in the prototype.']},
'bologna|venice':{level:'Lower',hours:'about 1½ hours Bologna → Venice by fast train',example:'Bologna → Venice',why:'Direct rail makes the move comparatively simple.',solutions:['No car is needed for the city-to-city transfer.']},
'campania|naples':{level:'Lower',hours:'roughly 45–90 minutes for Naples → Sorrento/Salerno depending on route and base',example:'Naples → Sorrento or Salerno',why:'These are neighboring parts of Campania with established rail/transfer options.',solutions:['Choose the coastal base first; Sorrento and Salerno create different onward connections.']},
'naples|rome':{level:'Moderate',hours:'about 1–1¼ hours by fast train',example:'Rome → Naples',why:'The train itself is easy, but changing regions still consumes packing, checkout and arrival time.',solutions:['This is geographically straightforward even if you treat it as a real relocation.']},
'tuscany|venice':{level:'Moderate',hours:'about 2–2½ hours Florence → Venice by fast train',example:'Florence → Venice',why:'Direct high-speed rail helps, but it is a more meaningful move than Florence → Bologna.',solutions:['Book a direct train when possible.','Avoid adding another distant region immediately after Venice if the trip is short.']},
'liguria|tuscany':{level:'Moderate',hours:'roughly 2½–4 hours Florence → Ligurian coast depending on town and connections',example:'Florence → La Spezia / Ligurian coast',why:'The regions are not far apart, but the rail path is less seamless than the high-speed spine.',solutions:['Choose a rail-friendly Ligurian base.','Avoid unnecessary car pickup for Cinque Terre.']},
'bologna|dolomites':{level:'Moderate',hours:'roughly 3–5 hours depending on the Dolomites base',example:'Bologna → a Dolomites gateway/base',why:'Mountain geography and the final valley connection matter as much as the mainline train.',solutions:['Choose the exact Dolomites base before judging the transfer.','Some combinations work best with train plus bus/transfer.']},
'puglia|venice':{level:'Higher',hours:'roughly 8–10+ hours by rail for representative Venice → Bari/Lecce travel',example:'Venice → Bari or Lecce',why:'This is a long north-to-south move even though both are well-known destinations.',solutions:['Treat it as a major travel day.','Compare flight and rail once exact bases are chosen.','If the trip is short, ask whether both regions contain enough high-priority experiences to justify the move.']},
'sicily|tuscany':{level:'Higher',hours:'often a very long rail journey; flying may be more practical depending on bases',example:'Florence/Tuscany → Sicily',why:'The island location and north–south distance make this a major relocation.',solutions:['Compare flights from Florence/Pisa/Bologna with long-distance rail.','Choose the Sicilian base before judging the route.','Treat the move as a significant part of the day.']},
'lakes|sicily':{level:'Higher',hours:'a major north-to-island relocation; flying is often the practical comparison',example:'Italian Lakes / Milan area → Sicily',why:'The geographic span is large.',solutions:['Compare flights from the Milan area with rail.','Keep the move if both regions are central to the trip, not just because each ranked well.']},
'dolomites|puglia':{level:'Higher',hours:'a long north-to-south relocation, commonly requiring multiple transport stages',example:'Dolomites → Puglia',why:'Mountain access plus a long southbound journey makes this a substantially harder transfer.',solutions:['Consider a flight from a northern airport after leaving the mountains.','Avoid stacking several other moves around this transfer.']},
'puglia|sicily':{level:'Higher',hours:'representative Bari → Catania can take roughly a full travel day by ground transport',example:'Bari → Catania',why:'They appear relatively close on the map, but the transport network does not make this a simple high-speed-rail hop.',solutions:['Treat the move as a travel day.','Compare train, long-distance bus and flights once exact bases are chosen.','Choose eastern vs western Sicily with the onward route in mind.','If the overall trip is short, decide whether both regions contain enough high-priority experiences to justify the transfer.']}
};
function pairKey(a,b){return[a,b].sort().join('|')}
function hav(a,b){const r=x=>x*Math.PI/180,R=6371,dlat=r(b[0]-a[0]),dlon=r(b[1]-a[1]),q=Math.sin(dlat/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(dlon/2)**2;return 2*R*Math.asin(Math.sqrt(q))}
function travelInfo(a,b){const k=pairKey(a,b);if(travelOverrides[k])return travelOverrides[k];const A=regionById[a],B=regionById[b],km=hav(A.coords,B.coords);let level='Moderate',hours='roughly 3–6 hours depending on exact bases and connections';if(km<220){level='Lower';hours='often around 1½–3 hours between representative bases'}if(km>500){level='Higher';hours='often 6+ hours or worth comparing rail with a flight'}if(a==='sicily'||b==='sicily'){level='Higher';hours='island access makes the exact base and transport mode especially important'}return{level,hours,example:`${A.short} → ${B.short}`,why:'Prototype planning signal based on geography and typical transport complexity, not a live timetable.',solutions:['Choose exact bases before booking transport.','Compare direct rail, bus, transfer and flight options when the itinerary becomes concrete.']}}
function daysVal(){if(state.exactDays)return state.exactDays;return{'5-7':6,'8-10':9,'11-14':12.5,'15-21':18,'22+':24}[state.tripLength]||null}
function consequence(level){const d=daysVal();if(!d)return null;if(level==='Higher'&&d<=7)return'On a trip this short, this move can consume a meaningful share of the usable trip.';if(level==='Higher'&&d<=10)return'This is workable, but it deserves to be treated as a major relocation rather than a quick hop.';if(level==='Higher'&&d>=15)return'Still a real transfer, but a longer trip gives you more room to absorb it.';if(level==='Moderate'&&d<=7)return'This is not prohibitive, but every relocation matters more on a short trip.';if(level==='Lower'&&d<=7)return'This is one of the easier pairings if you want more than one region in a short trip.';return'The transfer is manageable if both regions contain enough high-priority experiences for you.'}
