

function renderPrimary(id){
  const saved=state.savedExp.get(id),ids=state.layouts.get(id)||[];
  primaryExperienceList.innerHTML=ids.map((x,i)=>{
    const e=expById[x],is=saved.has(x),meta=reachMeta(e);
    return`<article class="exp-card bg-white rounded-[1.35rem] border ${is?'saved-card':'border-stone-100'} overflow-hidden"><div class="p-5"><div class="flex flex-col md:flex-row gap-4"><div class="w-28 h-20 shrink-0 rounded-xl bg-cream flex items-center justify-center font-display text-center px-2 text-sm font-bold text-stone-600">${roleLabel(e,i)}</div><div class="flex-grow"><div class="flex flex-col sm:flex-row sm:justify-between gap-2"><div><h4 class="font-display text-2xl font-bold">${e.name}</h4>${reachBadge(e)}<p class="text-stone-600 mt-2">${experienceLead(e)}</p>${experienceDeepDiveHtml(e)}${meta.zone!=='core'?`<p class="text-sm text-stone-500 mt-2">${meta.note}</p>`:''}${e.note?`<p class="text-sm text-[#7b5a24] bg-[#fff6e8] rounded-lg px-3 py-2 mt-3">${e.note}</p>`:''}${seasonMsg(e)}</div><button data-save-exp="${e.id}" class="saveExp shrink-0 px-4 py-2 rounded-xl border-2 ${is?'border-basil bg-mist text-basil':'border-stone-200'} font-bold">${is?'✓ Saved':'Save'}</button></div></div></div></div></article>`
  }).join('');
  document.querySelectorAll('.saveExp').forEach(b=>b.onclick=()=>{const e=expById[b.dataset.saveExp],s=state.savedExp.get(e.region);s.has(e.id)?s.delete(e.id):s.add(e.id);if(s.size)state.savedRegions.add(e.region);updateHeader();renderPrimary(e.region);renderWildcards(e.region);renderHiddenGems(e.region);renderOthers(e.region);renderExploreBottom(e.region)})
}

function wildcardScore(e){
  let s=expScore(e),w=weights();
  // A Wildcard should not simply echo an explicit preference.
  if((w[e.cat]||0)>0)s-=5.5;
  if(e.cat==='ancient'&&(w.ancient||0)>0)s-=3;
  if(e.cat==='art'&&((w.art||0)+(w.churches||0))>0)s-=3;
  if(e.cat==='local'&&((w.local||0)+(w.food||0))>0)s-=3;
  const st=e.story||{},avg=((st.surprise||0)+(st.human||0)+(st.unique||0)+(st.visual||0)+(st.revelation||0)+(st.participation||0))/6;
  s+=avg*.45+Math.max(0,6-(e.obvious||10))*.8;
  return s
}
function wildcardCandidates(id){
  const saved=state.savedExp.get(id),primary=new Set(state.layouts.get(id)||[]);
  return experiences.filter(e=>e.region===id&&e.wildcard&&!e.hiddenGem&&!primary.has(e.id)&&!saved.has(e.id)&&reachAllows(e)).sort((a,b)=>wildcardScore(b)-wildcardScore(a))
}
function wildCardHtml(e,saved,label){
  const meta=reachMeta(e);
  return`<div class="bg-ink text-white rounded-[1.45rem] overflow-hidden"><div class="p-6"><div class="flex flex-col sm:flex-row sm:justify-between gap-4"><div><p class="text-xs uppercase tracking-[.15em] text-gold font-bold mb-2">${label}</p><h4 class="font-display text-2xl font-bold">${e.name}</h4><div class="mt-2 text-xs text-white/60">${zoneLabels[meta.zone]}${meta.zone!=='core'?` · ${meta.note}`:''}</div><p class="text-white/75 mt-2">${expWhy(e)}</p></div><button data-wild-save="${e.id}" class="wildSave shrink-0 px-4 py-2 rounded-xl border border-white/30 font-bold">${saved?'✓ Saved':'Save'}</button></div></div></div>`
}
function renderWildcards(id){
  const saved=state.savedExp.get(id),savedWild=experiences.filter(e=>e.region===id&&e.wildcard&&saved.has(e.id)),next=wildcardCandidates(id)[0],cards=[];
  savedWild.forEach((e,i)=>cards.push(wildCardHtml(e,true,i?'Saved Wildcard':'Wildcard you saved')));
  if(next)cards.push(wildCardHtml(next,false,savedWild.length?'Another Wildcard':'Wildcard'));
  experienceWildcardSection.innerHTML=cards.length?`<div class="mb-4"><p class="uppercase tracking-[.18em] text-xs font-bold text-tomato mb-2">Discovery layer</p><h3 class="font-display text-3xl font-bold">Wildcard</h3><p class="text-stone-500 mt-1">A less-obvious experience that fits deeper patterns without simply repeating the category you explicitly selected.</p></div><div class="space-y-4">${cards.join('')}</div>`:'';
  document.querySelectorAll('.wildSave').forEach(b=>b.onclick=()=>{const e=expById[b.dataset.wildSave],s=state.savedExp.get(e.region);s.has(e.id)?s.delete(e.id):s.add(e.id);if(s.size)state.savedRegions.add(e.region);updateHeader();renderWildcards(e.region);renderOthers(e.region);renderExploreBottom(e.region)})
}

function hiddenGemScore(e){
  const st=e.story||{};
  return expScore(e)+Math.max(0,5-(e.obvious||5))*1.2+(st.unique||0)*.15+(st.surprise||0)*.15
}
function renderHiddenGems(id){
  ensureRegion(id);
  const saved=state.savedExp.get(id);
  const gems=experiences.filter(e=>e.region===id&&e.hiddenGem&&(saved.has(e.id)||reachAllows(e))).sort((a,b)=>{
    if(saved.has(a.id)!==saved.has(b.id))return saved.has(a.id)?-1:1;
    return hiddenGemScore(b)-hiddenGemScore(a)
  }).slice(0,4);

  if(!gems.length){hiddenGemSection.innerHTML='';return}

  hiddenGemSection.innerHTML=`<div class="hidden-gem-shell rounded-[1.6rem] p-6 sm:p-7"><div class="mb-5"><span class="hidden-gem-badge inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[.14em]">Hidden Gems</span><h3 class="font-display text-3xl font-bold mt-3">The things most first-pass itineraries miss</h3><p class="text-stone-600 mt-2 max-w-3xl">More obscure than a Wildcard. These can be tiny, niche, odd, producer-led or simply easy to overlook. They are not universal “must-sees”; the point is to surface the unusual one that fits you.</p></div><div class="grid md:grid-cols-2 gap-4">${gems.map(e=>{const is=saved.has(e.id),m=reachMeta(e);return`<article class="hidden-gem-card rounded-xl p-5"><div class="flex items-start justify-between gap-3"><div><div class="text-xs uppercase tracking-[.14em] font-bold text-[#60476d] mb-2">Hidden Gem</div><h4 class="font-display text-xl font-bold">${e.name}</h4>${reachBadge(e)}</div><button data-save-gem="${e.id}" class="shrink-0 px-3 py-2 rounded-lg border-2 ${is?'border-[#60476d] bg-[#f4eff8] text-[#60476d]':'border-stone-200'} text-sm font-bold">${is?'✓ Saved':'Save'}</button></div><p class="text-sm text-stone-600 leading-relaxed mt-3">${e.hiddenGemInfo||expWhy(e)}</p></article>`}).join('')}</div></div>`;

  document.querySelectorAll('[data-save-gem]').forEach(b=>b.onclick=()=>{
    const e=expById[b.dataset.saveGem],s=state.savedExp.get(e.region);
    s.has(e.id)?s.delete(e.id):s.add(e.id);
    if(s.size)state.savedRegions.add(e.region);
    updateHeader();renderHiddenGems(e.region);renderExploreBottom(e.region)
  })
}
function renderOthers(id){
  const saved=state.savedExp.get(id),primary=new Set(state.layouts.get(id)||[]),active=wildcardCandidates(id)[0]?.id;
  const others=experiences.filter(e=>e.region===id&&!e.hiddenGem&&!primary.has(e.id)&&!saved.has(e.id)&&e.id!==active&&reachAllows(e)).sort((a,b)=>expScore(b)-expScore(a)).slice(0,5);
  otherExperienceSection.innerHTML=others.length?`<div class="mb-4"><p class="uppercase tracking-[.18em] text-xs font-bold text-tomato mb-2">More options to consider</p><h3 class="font-display text-2xl font-bold">Other strong possibilities</h3></div><div class="grid md:grid-cols-2 gap-3">${others.map(e=>{const m=reachMeta(e);return`<div class="bg-white border border-stone-100 rounded-xl overflow-hidden"><div class="p-4"><div class="font-bold">${e.name}</div>${reachBadge(e)}<div class="text-sm text-stone-500 mt-2">${expWhy(e)}</div>${m.zone!=='core'?`<div class="text-xs text-stone-400 mt-2">${m.note}</div>`:''}<button data-save-other="${e.id}" class="mt-3 text-sm font-bold text-basil underline">Save this</button></div></div>`}).join('')}</div>`:'';
  document.querySelectorAll('[data-save-other]').forEach(b=>b.onclick=()=>{const e=expById[b.dataset.saveOther],s=state.savedExp.get(e.region);s.add(e.id);state.savedRegions.add(e.region);updateHeader();if(!e.wildcard){const l=state.layouts.get(e.region)||[],idx=l.findIndex(x=>!s.has(x));if(idx>=0)l[idx]=e.id;else l.push(e.id);state.layouts.set(e.region,l)}renderPrimary(e.region);renderWildcards(e.region);renderHiddenGems(e.region);renderOthers(e.region);renderExploreBottom(e.region)})
}

function renderExploreBottom(id){
  const saved=[...state.savedRegions],remaining=saved.filter(x=>x!==id&&!state.explored.has(x));
  const next=remaining[0];
  exploreBottomNav.innerHTML=`<div class="bg-white rounded-[1.5rem] border border-stone-100 p-6"><p class="text-stone-500 mb-3">${next?'Finished looking at this region?':'Finished exploring your saved regions?'}</p><div class="grid ${next?'sm:grid-cols-3':'sm:grid-cols-2'} gap-3"><button id="bottomBackChoices" class="px-5 py-4 rounded-xl border-2 border-stone-200 font-bold">${state.savedRegions.size<=1?'← Choose another region':'← Back to regional choices'}</button>${next?`<button id="nextRegion" class="px-5 py-4 rounded-xl bg-basil text-white font-bold">Next saved region → ${regionById[next].short}</button><button id="reviewTrip" class="px-5 py-4 rounded-xl bg-cream border border-warm font-bold">Review My Trip Ideas</button>`:`<button id="reviewTrip" class="px-5 py-4 rounded-xl bg-basil text-white font-bold">Review My Trip Ideas</button>`}</div></div>`;
  bottomBackChoices.onclick=()=>{renderResults();show('resultsScreen')};
  reviewTrip.onclick=()=>openTrip('region');
  if(next)nextRegion.onclick=()=>openExplore(next)
}
function openTrip(tab='region'){state.tripTab=tab;renderTrip();show('tripBoardScreen');if(tab==='map')setTimeout(renderMap,70)}
function renderTrip(){tripBoardBackChoices.textContent=state.savedRegions.size<=1?'← Choose another region':'← Back to regional choices';document.querySelectorAll('.tripTab').forEach(b=>b.className=`tripTab px-5 py-3 rounded-xl border-2 font-bold ${b.dataset.triptab===state.tripTab?'border-basil bg-mist text-basil':'border-stone-200 bg-white'}`);tripRegionView.classList.toggle('hidden',state.tripTab!=='region');tripMapView.classList.toggle('hidden',state.tripTab!=='map');tripTravelView.classList.toggle('hidden',state.tripTab!=='travel');renderTripRegions();if(state.tripTab==='map')setTimeout(renderMap,60);if(state.tripTab==='travel')renderTravel()}


function renderTripRegions(){
  if(!state.savedRegions.size){tripRegionView.innerHTML='<div class="bg-white rounded-xl p-7 text-center">Nothing saved yet.</div>';return}
  tripRegionView.innerHTML=[...state.savedRegions].map(id=>{
    const r=regionById[id],list=[...(state.savedExp.get(id)||new Set())].map(x=>expById[x]).filter(Boolean);
    const rome=id==='rome';
    return`<div class="bg-white rounded-[1.5rem] border border-stone-100 overflow-hidden mb-4">${rome?`<div class="relative h-48"><img src="${romeRegionPhoto}" alt="Rome" class="w-full h-full object-cover"><div class="absolute inset-0 img-fade"></div><div class="absolute bottom-0 p-5 text-white"><div class="text-xs uppercase tracking-[.15em] font-bold text-gold">Your saved Rome ideas</div><h3 class="font-display text-3xl font-bold">${r.name}</h3></div></div>`:''}<div class="p-6"><div class="flex flex-col sm:flex-row sm:justify-between gap-3"><div>${rome?'':`<h3 class="font-display text-2xl font-bold">${r.name}</h3>`}<p class="text-sm text-stone-500">${list.length} saved experience${list.length===1?'':'s'} · scope currently ${reachOptions.find(o=>o.id===reachLevel(id))?.short||'Core area'}</p></div><div class="flex gap-2"><button data-trip-explore="${id}" class="px-3 py-2 rounded-lg border-2 border-stone-200 text-sm font-bold">Explore more</button><button data-remove-region="${id}" class="px-3 py-2 rounded-lg border-2 border-stone-200 text-sm font-bold text-tomato">Remove region</button></div></div><div class="mt-5 ${rome?'grid md:grid-cols-2 gap-3':'space-y-2'}">${list.length?list.map(e=>rome?`<div class="border border-stone-100 rounded-xl overflow-hidden bg-cream"><img src="${expPhoto(e)}" alt="${e.name}" class="w-full h-36 object-cover"><div class="p-4"><strong>✓ ${e.name}</strong><div class="text-xs text-stone-500 mt-1">${zoneLabels[reachMeta(e).zone]}${reachMeta(e).zone!=='core'?` · ${reachMeta(e).note}`:''}</div><button data-remove-exp="${e.id}" class="text-xs text-tomato underline mt-3">Remove</button></div></div>`:`<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-cream border border-warm rounded-lg px-4 py-3"><div><strong>✓ ${e.name}</strong><div class="text-xs text-stone-500 mt-1">${zoneLabels[reachMeta(e).zone]}${reachMeta(e).zone!=='core'?` · ${reachMeta(e).note}`:''}</div></div><button data-remove-exp="${e.id}" class="text-xs text-tomato underline self-start sm:self-auto">Remove</button></div>`).join(''):'<p class="text-sm text-stone-400">No individual experiences saved yet.</p>'}</div></div></div>`
  }).join('');
  document.querySelectorAll('[data-trip-explore]').forEach(b=>b.onclick=()=>openExplore(b.dataset.tripExplore));
  document.querySelectorAll('[data-remove-exp]').forEach(b=>b.onclick=()=>{const e=expById[b.dataset.removeExp];state.savedExp.get(e.region)?.delete(e.id);updateHeader();renderTrip()});
  document.querySelectorAll('[data-remove-region]').forEach(b=>b.onclick=()=>{const id=b.dataset.removeRegion,c=(state.savedExp.get(id)||new Set()).size;if(confirm(c?`Remove ${regionById[id].name} and its ${c} saved experiences?`:`Remove ${regionById[id].name}?`)){state.savedRegions.delete(id);state.savedExp.delete(id);updateHeader();renderTrip()}})
}


function travelCost(a,b){
  const inf=travelInfo(a,b);
  const levelBase={Lower:1,Moderate:4,Higher:9}[inf.level]||4;
  const km=hav(regionById[a].coords,regionById[b].coords);
  return levelBase+(km/1000)
}
function permutations(arr){
  if(arr.length<=1)return[arr];
  const out=[];
  arr.forEach((v,i)=>{
    const rest=[...arr.slice(0,i),...arr.slice(i+1)];
    permutations(rest).forEach(p=>out.push([v,...p]))
  });
  return out
}
