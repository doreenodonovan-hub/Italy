experiences.push({id:'sicily-market',region:'sicily',name:'Palermo market + street-food experience',role:'local',cat:'food',coords:[38.1157,13.3615],traits:{food:10,local:10,nightlife:7,photo:8},obvious:7,story:{surprise:9,participation:7,human:8,unique:9,visual:8,revelation:8}},
{id:'sicily-cooking',region:'sicily',name:'Sicilian cooking class',role:'maker',cat:'maker',coords:[37.5079,15.083],traits:{maker:10,food:10,local:8},obvious:6,story:{surprise:7,participation:10,human:9,unique:7,visual:5,revelation:8}},
{id:'sicily-modica',region:'sicily',name:'Modica chocolate + Baroque streets',role:'wildcard',cat:'food',coords:[36.8588,14.76],traits:{food:9,smalltown:9,local:8,photo:9,churches:7},obvious:3,wildcard:true,story:{surprise:9,participation:6,human:7,unique:10,visual:9,revelation:8}},
{id:'sicily-vendicari',region:'sicily',name:'Vendicari nature reserve + beach',role:'wildcard',cat:'outdoor',coords:[36.806,15.107],traits:{outdoor:9,beach:9,photo:10,relax:8},obvious:2,wildcard:true,season:['apr','may','jun','jul','aug','sep','oct'],story:{surprise:9,participation:7,human:2,unique:9,visual:10,revelation:5}},
{id:'piedmont-turin',region:'piedmont',name:'Turin cafés + elegant center',role:'icon',cat:'local',coords:[45.0703,7.6869],traits:{local:8,food:9,shopping:8,art:6,photo:7},obvious:5,story:{surprise:8,participation:5,human:6,unique:8,visual:8,revelation:6}},
{id:'piedmont-barolo',region:'piedmont',name:'Barolo producer day',role:'local',cat:'wine',coords:[44.6107,7.9429],traits:{wine:10,food:8,local:9,scenery:9},obvious:6,story:{surprise:7,participation:8,human:9,unique:8,visual:8,revelation:9}},
{id:'piedmont-truffle',region:'piedmont',name:'Alba food + truffle culture',role:'maker',cat:'food',coords:[44.7009,8.0357],traits:{food:10,local:9,maker:7},obvious:5,story:{surprise:8,participation:7,human:9,unique:9,visual:5,revelation:9}},
{id:'piedmont-sacre',region:'piedmont',name:'Sacra di San Michele',role:'wildcard',cat:'churches',coords:[45.0988,7.3431],traits:{churches:9,scenery:10,photo:10,outdoor:6},obvious:2,wildcard:true,story:{surprise:10,participation:5,human:3,unique:10,visual:10,revelation:8}},
{id:'piedmont-langhe',region:'piedmont',name:'Langhe hill-town day',role:'pace',cat:'smalltown',coords:[44.65,7.95],traits:{smalltown:9,scenery:9,photo:9,wine:9,relax:8},obvious:4,story:{surprise:8,participation:5,human:5,unique:8,visual:9,revelation:5}});

const regionPrefs=[{id:'icons',label:'Famous / defining sights',traits:['famous']},{id:'history',label:'History & archaeology',traits:['ancient']},{id:'art',label:'Art & architecture',traits:['art','churches']},{id:'smalltown',label:'Towns & wandering',traits:['smalltown','photo']},{id:'local',label:'Local life & food',traits:['local','food']},{id:'maker',label:'Make or learn something',traits:['maker']},{id:'outdoor',label:'Outdoors & scenery',traits:['outdoor','scenery']},{id:'relax',label:'Relaxation',traits:['relax','romance']},{id:'shopping',label:'Shopping & artisans',traits:['shopping','maker']},{id:'gardens',label:'Gardens',traits:['gardens','scenery']}];
const monthNames=[['jan','January'],['feb','February'],['mar','March'],['apr','April'],['may','May'],['jun','June'],['jul','July'],['aug','August'],['sep','September'],['oct','October'],['nov','November'],['dec','December']];
const regionById=Object.fromEntries(regions.map(r=>[r.id,r]));const expById=Object.fromEntries(experiences.map(e=>[e.id,e]));
const reachOptions=[
{id:'core',label:'Keep it centered',short:'Core area',rank:0,desc:'Focus on the main city or base. No meaningful day-trip travel.'},
{id:'nearby',label:'Nearby additions are fine',short:'Nearby',rank:1,desc:'Include easy additions that generally do not take over the day.'},
{id:'daytrip',label:'I’m happy to make a day trip',short:'Day trip',rank:2,desc:'Include places worth roughly an hour or more each way when the experience is strong enough.'},
{id:'extension',label:'Show full-day / possible extensions too',short:'Extension',rank:3,desc:'Also show farther ideas that may use most of a day or eventually make sense as another base.'}
];
const baseLabels={
rome:'Rome',tuscany:'Florence',umbria:'Orvieto',venice:'central Venice',bologna:'Bologna',naples:'Naples',
campania:'your eventual Coastal Campania base',liguria:'your eventual Ligurian base',lakes:'your eventual lake base',
dolomites:'your eventual Dolomites base',puglia:'your eventual Puglia base',sicily:'your eventual Sicily base',piedmont:'Turin / your Piedmont base'
};
const experienceReach={
'rome-ostia':{zone:'nearby',note:'Nearby addition · roughly 45–60 minutes from central Rome depending on your starting point.'},
'rome-tivoli':{zone:'daytrip',note:'Day trip · a meaningful outing from Rome; exact time depends on transport and which Tivoli sites you combine.'},
'rome-castelli':{zone:'daytrip',note:'Day trip · the exact effort depends on which Castelli Romani town or producer you choose.'},
'rome-monterozzi':{zone:'extension',note:'Full-day / possible extension · Tarquinia is far enough from central Rome that the journey becomes part of the day.'},
'tuscany-wine':{zone:'nearby',note:'Nearby / half-day possibility from Florence depending on the producer and transport.'},
'tuscany-valdorcia':{zone:'daytrip',note:'Day-trip scale from Florence; a countryside tour or different base can make it easier.'},
'tuscany-lafoce':{zone:'extension',note:'Farther countryside idea; it may fit better once you choose a southern Tuscany base.'},
'tuscany-pitigliano':{zone:'extension',note:'Farther Tuscany discovery; usually better treated as a full-day outing or part of another base.'},
'umbria-wine':{zone:'nearby',note:'Nearby countryside addition from Orvieto with a tour or transfer.'},
'umbria-spello':{zone:'daytrip',note:'Day-trip scale from an Orvieto-centered stay.'},
'umbria-civita':{zone:'daytrip',note:'A separate outing rather than part of an Orvieto walk.'},
'venice-san-giorgio':{zone:'nearby',note:'Easy lagoon addition from central Venice.'},
'venice-murano':{zone:'nearby',note:'Nearby island addition; travel on the lagoon is part of the experience.'},
'venice-torcello':{zone:'daytrip',note:'A farther lagoon outing that uses a meaningful portion of the day.'},
'bologna-balsamic':{zone:'daytrip',note:'Producer outing outside Bologna; exact effort depends on the estate and transport.'},
'bologna-parmigiano':{zone:'daytrip',note:'Producer day outside Bologna; usually planned as an excursion.'},
'bologna-ravenna':{zone:'daytrip',note:'A distinct city excursion rather than central Bologna sightseeing.'},
'naples-procida':{zone:'daytrip',note:'Island day trip; ferry timing becomes part of the plan.'},
'campania-paestum':{zone:'daytrip',note:'A meaningful excursion from many Coastal Campania bases.'},
'liguria-portofino':{zone:'daytrip',note:'A separate coastal outing depending on your Ligurian base.'},
'lakes-varese':{zone:'daytrip',note:'A separate cultural excursion from many lake bases.'},
'lakes-garda':{zone:'extension',note:'A different lake system; this may be better treated as another base rather than a casual side trip.'},
'puglia-gravina':{zone:'extension',note:'Farther inland; whether it is a day trip depends heavily on the Puglia base you eventually choose.'},
'sicily-agrigento':{zone:'extension',note:'A major archaeological outing whose practicality depends strongly on your Sicilian base.'},
'sicily-vendicari':{zone:'nearby',note:'Easy-to-moderate addition if your base is in southeastern Sicily.'},
'piedmont-barolo':{zone:'daytrip',note:'Wine-country outing from Turin or a separate Langhe base.'},
'piedmont-truffle':{zone:'daytrip',note:'Alba-area excursion from Turin or part of a Langhe stay.'},
'piedmont-langhe':{zone:'extension',note:'Strong enough to become its own countryside base if you want more than a day trip.'},
'piedmont-sacre':{zone:'daytrip',note:'A distinct outing from Turin.'}
};
const romeRegionPhoto='https://images.unsplash.com/photo-1545043931-30a16508bfa5?auto=format&fit=crop&w=1400&q=82';
const romeExperiencePhotos={
'rome-colosseum':'https://images.unsplash.com/photo-1545043931-30a16508bfa5?auto=format&fit=crop&w=1000&q=82',
'rome-vatican':'https://images.unsplash.com/photo-1743951510012-f0ed590462c5?auto=format&fit=crop&w=1000&q=82',
'rome-trastevere':'https://images.unsplash.com/photo-1685562249871-8948aeda70a9?auto=format&fit=crop&w=1000&q=82',
'rome-tivoli':'https://images.unsplash.com/photo-1664461891582-bc909249a508?auto=format&fit=crop&w=1000&q=82',
'rome-testaccio':'https://images.unsplash.com/photo-1685562249871-8948aeda70a9?auto=format&fit=crop&w=1000&q=78',
'rome-cooking':'https://images.unsplash.com/photo-1685562249871-8948aeda70a9?auto=format&fit=crop&w=1000&q=75',
'rome-trevi':'https://images.unsplash.com/photo-1545043931-30a16508bfa5?auto=format&fit=crop&w=1000&q=82',
'rome-pantheon':'https://images.unsplash.com/photo-1545043931-30a16508bfa5?auto=format&fit=crop&w=1000&q=80',
'rome-ostia':'https://images.unsplash.com/photo-1545043931-30a16508bfa5?auto=format&fit=crop&w=1000&q=78',
'rome-castelli':'https://images.unsplash.com/photo-1685562249871-8948aeda70a9?auto=format&fit=crop&w=1000&q=76',
'rome-monterozzi':'https://images.unsplash.com/photo-1545043931-30a16508bfa5?auto=format&fit=crop&w=1000&q=76'
};
const zoneRanks={core:0,nearby:1,daytrip:2,extension:3};
const zoneLabels={core:'Core area',nearby:'Nearby addition',daytrip:'Day trip',extension:'Full-day / possible extension'};

const state={mode:null,selected:new Set(),anchors:new Set(),avoids:new Set(),savedRegions:new Set(),savedExp:new Map(),regionPrefs:new Map(),reach:new Map(),explored:new Set(),regionMonth:new Map(),currentRegion:null,tripTab:'region',tripLength:null,exactDays:null,layouts:new Map(),compare:null};

const regionDescriptions={
rome:'Ancient ruins, Baroque streets, neighborhood food and some of Italy’s biggest sights all overlap in one dense city.',
tuscany:'Florence brings Renaissance art and architecture; beyond it, Tuscany opens into hill towns, vineyards, gardens and countryside.',
umbria:'A greener, quieter central-Italy alternative built around dramatic hill towns, Etruscan layers, churches, wine and slower days.',
venice:'A lagoon city of canals, Gothic palaces, Byzantine mosaics and neighborhoods where water still shapes everyday life.',
bologna:'A porticoed university city where food traditions, markets and easy rail connections make the region feel lived-in rather than staged.',
naples:'A dense, energetic southern city where archaeology, street life, food and layers of history collide at close range.',
campania:'Cliffside towns, sea views, historic sites and food traditions stretched along the coast from Sorrento toward Salerno and Paestum.',
liguria:'Compact seaside villages wedged between steep green hills and the Ligurian Sea, with walking, trains, harbors and dramatic coastal views.',
lakes:'Elegant towns, gardens, villas and mountain-backed water views, with a slower rhythm than Italy’s major art cities.',
dolomites:'A mountain landscape of pale limestone towers, alpine villages, cable cars, scenic walks and serious hiking.',
puglia:'Whitewashed towns, masserie, olive country, ceramics, food traditions and a long Adriatic and Ionian coastline.',
sicily:'A large, varied island where Greek temples, Baroque towns, markets, food, mountains and coast sit within several layers of Mediterranean history.',
piedmont:'Turin’s cafés and museums open into wine country, truffles, elegant small towns and the foothills of the Alps.'
};

const experienceDeepDives={
'venice-stmarks':{
teaser:'Gold-backed Byzantine mosaics, domes and Venice’s maritime history make St. Mark’s feel very different from a typical Italian basilica.',
label:'Why St. Mark’s is different',
html:`Many Italian churches impress through height, frescoes, pale stone or Renaissance proportion. St. Mark’s works differently. The interior is darker and more enclosed, with domes and vaults covered in gold-backed mosaics so that the light seems to move across the ceiling rather than simply illuminate it. The building reflects Venice’s long relationship with Byzantium and Constantinople, and the four bronze horses associated with the Fourth Crusade make that imperial connection unusually concrete. The result feels less like another stop on a church checklist and more like entering a building shaped by Venice’s history as a maritime power.`
},
'tuscany-duomo':{
teaser:'The marble exterior is only the beginning: Brunelleschi’s enormous dome makes the Duomo as much an engineering story as a cathedral.',
label:'Why Florence’s Duomo is different',
html:`From the piazza, Santa Maria del Fiore can look almost patterned rather than simply built: white, green and red marble wraps the exterior in geometric bands, while Brunelleschi’s vast terracotta dome rises above the city. Inside, the surprise is scale. The nave is comparatively restrained until you reach the enormous octagon and look up into Vasari and Zuccari’s Last Judgment. What truly separates the Duomo from most other Italian cathedrals, though, is the engineering overhead. Brunelleschi created the 15th-century dome without the enormous wooden centering normally used to hold a dome during construction. He used two linked shells, internal ribs and herringbone brickwork; if you climb it, the route passes through the space between those shells before emerging above Florence’s red-tiled roofs.`
}
};
function regionDescription(r){return regionDescriptions[r.id]||r.subtitle||r.name}
function experienceLead(e){return experienceDeepDives[e.id]?.teaser||expWhy(e)}
function experienceDeepDiveHtml(e){
  const d=experienceDeepDives[e.id];
  return d?`<details class="mt-4 rounded-xl bg-cream border border-warm p-4"><summary class="cursor-pointer font-bold text-basil">${d.label} →</summary><p class="text-sm text-stone-600 leading-relaxed mt-3">${d.html}</p></details>`:''
}
