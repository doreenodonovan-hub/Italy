
function renderTravel(){
  const ids=[...state.savedRegions];
  if(ids.length<2){
    tripTravelView.innerHTML='<div class="bg-white rounded-[1.5rem] border border-stone-100 p-7 text-center"><h3 class="font-display text-2xl font-bold mb-2">Save at least two regions</h3><p class="text-stone-500">Once you save another region, this section will suggest one efficient order for traveling between them.</p><button id="travelChooseAnother" class="mt-5 px-5 py-3 rounded-xl border-2 border-stone-200 font-bold">← Choose another region</button></div>';
    travelChooseAnother.onclick=()=>{renderResults();show('resultsScreen')};
    return
  }

  const controls=`<div class="bg-white rounded-[1.5rem] border border-stone-100 p-6 mb-6">
    <p class="uppercase tracking-[.16em] text-xs font-bold text-tomato mb-2">How much total time do you have?</p>
    <h3 class="font-display text-3xl font-bold mb-2">Use trip length as a reality check</h3>
    <p class="text-stone-600 mb-5">This will not tell you how many days you “should” spend in each place. It only helps flag when the number of regions and moves may crowd out the experiences you saved.</p>
    <div class="flex flex-wrap gap-2 mb-4">${[['5-7','5–7 days'],['8-10','8–10 days'],['11-14','11–14 days'],['15-21','15–21 days'],['22+','3+ weeks']].map(([id,l])=>`<button data-length="${id}" class="lengthBtn px-4 py-2 rounded-xl border-2 ${state.tripLength===id&&!state.exactDays?'border-basil bg-mist':'border-stone-200'} font-bold">${l}</button>`).join('')}</div>
    <label for="exactDays" class="block text-sm font-bold mb-1">Or enter exact days</label>
    <div class="flex gap-2 max-w-sm"><input id="exactDays" type="number" min="1" max="90" value="${state.exactDays||''}" placeholder="e.g. 12" class="w-full rounded-xl border border-stone-300 px-3 py-2"><button id="applyDays" class="px-4 py-2 rounded-xl bg-basil text-white font-bold">Apply</button></div>
  </div>`;

  const {route,legs}=routeLegs(ids);
  const routeNames=route.map(id=>regionById[id].short).join(' → ');
  const warning=tripCrowdingWarning(ids.length);

  const legCards=legs.map(([a,b],i)=>{
    const A=regionById[a],B=regionById[b],inf=travelInfo(a,b);
    const sty=inf.level==='Higher'?'bg-[#fff0ed] text-tomato':inf.level==='Lower'?'bg-mist text-basil':'bg-cream text-stone-700';
    return`<div class="relative pl-10 pb-6 ${i===legs.length-1?'':'border-l-2 border-stone-200 ml-3'}">
      <div class="absolute left-[-13px] top-0 w-7 h-7 rounded-full bg-basil text-white flex items-center justify-center text-xs font-bold">${i+1}</div>
      <div class="bg-white rounded-[1.3rem] border border-stone-100 p-5">
        <div class="flex flex-col sm:flex-row sm:justify-between gap-2">
          <div><span class="inline-flex px-3 py-1 rounded-full text-xs font-bold ${sty}">${inf.level} travel difficulty</span><h4 class="font-display text-2xl font-bold mt-2">${A.short} → ${B.short}</h4></div>
          <div class="text-sm font-bold text-stone-600 sm:text-right">${inf.hours}</div>
        </div>
        <p class="text-sm text-stone-600 mt-3">${inf.why}</p>
      </div>
    </div>`
  }).join('');

  tripTravelView.innerHTML=controls+warning+`
    <div class="bg-ink text-white rounded-[1.5rem] p-6 mb-6">
      <p class="uppercase tracking-[.16em] text-xs font-bold text-gold mb-2">Suggested efficient order</p>
      <h3 class="font-display text-3xl font-bold">${routeNames}</h3>
      <p class="text-white/70 mt-2">This is one practical sequence through the regions you saved. It minimizes unnecessary backtracking in the prototype; exact arrival city, departure city and live transport schedules could change it later.</p>
    </div>
    <div class="mb-4"><h3 class="font-display text-2xl font-bold">The ${legs.length} move${legs.length===1?'':'s'} in that route</h3><p class="text-stone-500 mt-1">Only the transfers you would actually make in this suggested order are shown.</p></div>
    <div class="ml-3">${legCards}</div>`;

  document.querySelectorAll('.lengthBtn').forEach(b=>b.onclick=()=>{
    state.tripLength=b.dataset.length;state.exactDays=null;renderTravel()
  });
  applyDays.onclick=()=>{
    const v=Number(exactDays.value);
    if(v>0){state.exactDays=v;state.tripLength=null;renderTravel()}
  }
}
startButton.onclick=()=>show('modeScreen','Step 1 of 4',25);document.querySelectorAll('.modeChoice').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;state.selected=new Set();state.anchors=new Set();renderInterests();show('interestScreen','Step 2 of 4',50)});interestBack.onclick=()=>show('modeScreen','Step 1 of 4',25);interestNext.onclick=()=>{renderPriorities();show('priorityScreen','Step 3 of 4',75)};priorityBack.onclick=()=>{renderInterests();show('interestScreen','Step 2 of 4',50)};priorityNext.onclick=()=>{renderAvoids();show('avoidScreen','Step 4 of 4',100)};avoidBack.onclick=()=>{renderPriorities();show('priorityScreen','Step 3 of 4',75)};showRegionsButton.onclick=()=>{renderResults();show('resultsScreen')};compareTopButton.onclick=()=>{renderCompare();show('compareScreen')};compareBack.onclick=()=>{renderResults();show('resultsScreen')};viewTripIdeasTopButton.onclick=()=>openTrip('region');tripIdeasHeader.onclick=()=>openTrip('region');tripBoardBackChoices.onclick=()=>{renderResults();show('resultsScreen')};homeLogo.onclick=()=>show('welcomeScreen');startOverHeader.onclick=()=>{if(confirm('Start over and clear the current saved trip ideas?'))resetAll()};document.querySelectorAll('.tripTab').forEach(b=>b.onclick=()=>{state.tripTab=b.dataset.triptab;renderTrip()});
document.addEventListener('error',e=>{if(e.target.tagName!=='IMG'||e.target.dataset.fallback)return;e.target.dataset.fallback='1';const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#e8dfd2"/><circle cx="610" cy="270" r="90" fill="#c79a4a" opacity=".55"/><path d="M0 650 L260 430 L470 560 L760 300 L1200 680 L1200 800 L0 800 Z" fill="#4F6F52" opacity=".78"/><text x="50%" y="87%" text-anchor="middle" font-family="Georgia" font-size="48" fill="#292722">Italy Choice Lab</text></svg>`;e.target.src='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg)},true);updateHeader();