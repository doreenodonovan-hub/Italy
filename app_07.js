
function renderTie(a,b){const qs=compareQuestions(a,b),i=state.compare.i;if(i>=qs.length){const win=a._score+state.compare.a>b._score+state.compare.b?a:b;tieBreakerPanel.innerHTML=`<p class="text-xs uppercase tracking-[.16em] font-bold text-tomato mb-2">After the tie-breakers</p><h3 class="font-display text-3xl font-bold mb-3">This now leans toward ${win.short}</h3><p class="text-stone-600 mb-5">You can still save both and let the Trip Board handle geography later.</p><div class="flex flex-col sm:flex-row gap-2"><button id="saveWinner" class="px-5 py-3 rounded-xl bg-basil text-white font-bold">Save ${win.short}</button><button id="saveBoth" class="px-5 py-3 rounded-xl border-2 border-stone-200 font-bold">Save both</button></div>`;saveWinner.onclick=()=>{state.savedRegions.add(win.id);updateHeader();renderTie(a,b)};saveBoth.onclick=()=>{state.savedRegions.add(a.id);state.savedRegions.add(b.id);updateHeader();renderTie(a,b)};return}const t=qs[i].t,label=traitLabels[t]||t,ae=a.examples[t]||a.name,be=b.examples[t]||b.name;const lead={smalltown:'Both can give you memorable towns, but the rhythm and setting are different.',maker:'Both can include participatory experiences; what changes is the setting and tradition surrounding them.',ancient:'Both contain history, but the kind of historical day you would have is different.',scenery:'Both can be beautiful, but the landscape would shape the trip differently.',food:'Both eat extremely well; the food experience has a different setting and regional identity.',local:'Both can feel local, but the texture of everyday life is different.',outdoor:'Both can get you outside, but outdoor time plays a different role in the trip.',churches:'Both have architecture worth seeing; the visual and historical context differs.',art:'Both offer art, but the kind of art day and its importance to the trip differ.',beach:'Both may include coast or water, but beach time is more central in one than the other.'}[t]||`Both match you in different ways around ${label}.`;tieBreakerPanel.innerHTML=`<p class="text-xs uppercase tracking-[.16em] font-bold text-tomato mb-2">Tie-breaker ${i+1} of ${qs.length}</p><h3 class="font-display text-2xl font-bold mb-3">Which version of ${label} sounds more like this trip?</h3><p class="text-stone-600 mb-5">${lead}</p><div class="grid lg:grid-cols-2 gap-4 mb-5"><div class="rounded-xl bg-cream border border-warm p-5"><h4 class="font-display text-xl font-bold mb-2">${a.short}</h4><p>${ae}.</p></div><div class="rounded-xl bg-cream border border-warm p-5"><h4 class="font-display text-xl font-bold mb-2">${b.short}</h4><p>${be}.</p></div></div><div class="grid sm:grid-cols-3 gap-2"><button data-v="a" class="tie px-4 py-3 rounded-xl border-2 border-stone-200 font-bold">${a.short}</button><button data-v="both" class="tie px-4 py-3 rounded-xl border-2 border-stone-200 font-bold">Both / this doesn’t help me choose</button><button data-v="b" class="tie px-4 py-3 rounded-xl border-2 border-stone-200 font-bold">${b.short}</button></div>`;document.querySelectorAll('.tie').forEach(x=>x.onclick=()=>{if(x.dataset.v==='a')state.compare.a+=4;if(x.dataset.v==='b')state.compare.b+=4;state.compare.i++;renderTie(a,b)})}
function ensureRegion(id){if(!state.savedExp.has(id))state.savedExp.set(id,new Set());if(!state.reach.has(id))state.reach.set(id,'core')}
function prefWeights(id){return weights()}

function expScore(e){
  const w=prefWeights(e.region);let raw=0,tw=0;
  Object.entries(w).forEach(([t,v])=>{raw+=(e.traits[t]||0)*v;tw+=v});
  let s=tw?raw/tw:5;
  if(e.friction)state.avoids.forEach(a=>s-=((e.friction[a]||0)/10)*2.1);
  const month=state.regionMonth.get(e.region);
  if(month&&e.season&&!e.season.includes(month))s-=4.5;
  // Explicitly asking for famous sights must reliably lift iconic experiences,
  // even when their functional category is archaeology, art, architecture, etc.
  if((w.famous||0)>0 && e.role==='icon') s+=1.8;
  if((w.famous||0)>=3 && e.traits.famous) s+=1.2;
  return s
}

function recalcLayout(id){
  ensureRegion(id);
  const saved=state.savedExp.get(id);
  const all=experiences.filter(e=>e.region===id&&!e.wildcard&&!e.hiddenGem&&(saved.has(e.id)||reachAllows(e)));
  const old=state.layouts.get(id)||[],slots=Math.min(6,Math.max(5,all.length)),next=new Array(slots).fill(null);

  // Saved items are immutable: preserve their current positions where possible.
  old.forEach((x,i)=>{if(i<slots&&saved.has(x)&&expById[x]&&!expById[x].wildcard)next[i]=x});
  const used=new Set(next.filter(Boolean));

  // If the traveler explicitly chose Famous Sights, reserve meaningful room
  // for iconic experiences. If Famous Sights is an anchor, allow up to 3 of 6.
  const w=weights();
  const requestedIcons=(w.famous||0)>0;
  const famousAnchor=(w.famous||0)>=3;
  const targetIcons=requestedIcons?(famousAnchor?4:3):0;
  let existingIcons=next.filter(Boolean).map(x=>expById[x]).filter(e=>e&&e.role==='icon').length;

  if(existingIcons<targetIcons){
    const iconCandidates=all.filter(e=>e.role==='icon'&&!used.has(e.id)).sort((a,b)=>expScore(b)-expScore(a));
    for(const e of iconCandidates){
      if(existingIcons>=targetIcons)break;
      const idx=next.findIndex(x=>!x);
      if(idx<0)break;
      next[idx]=e.id;used.add(e.id);existingIcons++;
    }
  }

  // Fill remaining slots while penalizing repetition.
  for(let i=0;i<slots;i++){
    if(next[i])continue;
    let best=null,bs=-999;
    for(const e of all){
      if(used.has(e.id))continue;
      let sc=expScore(e);
      const same=next.filter(Boolean).map(x=>expById[x].cat).filter(c=>c===e.cat).length;
      sc-=same*1.6;
      if(e.role==='icon'&&!requestedIcons)sc-=.7;
      if(sc>bs){best=e;bs=sc}
    }
    if(best){next[i]=best.id;used.add(best.id)}
  }
  state.layouts.set(id,next.filter(Boolean))
}
function expWhy(e){const w=prefWeights(e.region),c=Object.entries(w).map(([t,v])=>({t,val:(e.traits[t]||0)*v})).filter(x=>x.val>0).sort((a,b)=>b.val-a.val).slice(0,2);let s=c.length?`Strong for ${naturalList(c.map(x=>traitLabels[x.t]))}.`:'A strong fit here.';if(e.story){const a=[['hands-on participation',e.story.participation],['human connection',e.story.human],['distinctiveness',e.story.unique],['visual memory',e.story.visual],['learning / revelation',e.story.revelation],['surprise',e.story.surprise]].sort((x,y)=>y[1]-x[1])[0];if(a&&a[1]>=9)s+=` Especially strong for ${a[0]}.`}return s}
function roleLabel(e,i){return{icon:'Iconic anchor',maker:'Do / make something',local:'Local / human experience',pace:'Change of pace',focused:'Focused cultural pick'}[e.role]||(i===0?'Strong personal fit':'Recommended')}
function seasonMsg(e){const m=state.regionMonth.get(e.region);if(!m||!e.season)return'';return e.season.includes(m)?'<div class="mt-3 text-sm bg-mist rounded-lg px-3 py-2">Season fit: this experience generally aligns with the month you selected.</div>':'<div class="mt-3 text-sm bg-[#fff6e8] rounded-lg px-3 py-2">Season check: this may be limited or less reliable in the month you selected.</div>'}


function openExplore(id){state.currentRegion=id;ensureRegion(id);renderExplore();show('exploreScreen')}

function renderExplore(){
  const r=regionById[state.currentRegion];ensureRegion(r.id);

  const backLabel=state.savedRegions.size<=1?'← Choose another region':'← Back to regional choices';
  exploreTopNav.innerHTML=`<div class="flex flex-wrap items-center justify-between gap-3"><button id="exploreBackChoices" class="px-4 py-2.5 rounded-xl bg-white border-2 border-stone-200 font-bold">${backLabel}</button><button id="exploreChangePrefs" class="text-sm font-bold text-basil underline underline-offset-4">Change my trip preferences</button></div>`;

  exploreHero.innerHTML=`<div class="bg-white rounded-[1.7rem] border border-stone-100 p-7 sm:p-9"><p class="text-xs uppercase tracking-[.15em] font-bold text-tomato mb-2">Explore this match</p><h2 class="font-display text-4xl font-bold">${regionTitle(r)}</h2><p class="text-stone-700 leading-relaxed mt-4 max-w-3xl">${regionDescription(r)}</p><div class="mt-6 max-w-3xl"><p class="text-xs uppercase tracking-[.15em] font-bold text-tomato mb-2">Why it fits your choices</p><p class="text-stone-600">${whyRegion(r)}</p></div><div class="mt-5 flex flex-col sm:flex-row gap-2"><button id="saveCurrentRegion" class="px-5 py-3 rounded-xl ${state.savedRegions.has(r.id)?'bg-mist text-basil border-2 border-basil':'bg-basil text-white'} font-bold">${state.savedRegions.has(r.id)?'✓ Saved for this trip':'Save region for this trip'}</button></div></div>`;

  exploreBackChoices.onclick=()=>{renderResults();show('resultsScreen')};
  exploreChangePrefs.onclick=()=>{renderInterests();show('interestScreen')};
  saveCurrentRegion.onclick=()=>{toggleRegion(r.id);renderExplore()};

  renderSeason(r);
  renderExplorePreferenceSummary(r);
  renderReach(r);
  recalcLayout(r.id);
  renderPrimary(r.id);
  renderWildcards(r.id);
  renderHiddenGems(r.id);
  renderOthers(r.id);
  renderExploreBottom(r.id);
  state.explored.add(r.id)
}
function renderExplorePreferenceSummary(r){
  const cat=state.mode==='know'?interestCatalog:discoveryCatalog;
  const selected=[...state.selected].map(id=>cat.find(x=>x.id===id)).filter(Boolean);
  const anchors=[...state.anchors].map(id=>cat.find(x=>x.id===id)).filter(Boolean);
  explorePreferenceSummary.innerHTML=`<div class="bg-white rounded-[1.5rem] border border-stone-100 shadow-soft p-5 sm:p-7"><p class="uppercase tracking-[.18em] text-xs font-bold text-tomato mb-2">Using the choices you already made</p><h3 class="font-display text-2xl font-bold mb-2">We are not asking you to define ${r.short} again.</h3><p class="text-sm text-stone-500 mb-4">The suggestions below use your original trip preferences. Your two priorities carry extra weight.</p><div class="flex flex-wrap gap-2 mb-4">${selected.slice(0,10).map(x=>`<span class="px-3 py-1.5 rounded-full bg-cream border border-warm text-sm">${anchors.some(a=>a.id===x.id)?'★ ':''}${x.label}</span>`).join('')}${selected.length>10?`<span class="px-3 py-1.5 rounded-full bg-stone-100 text-sm">+${selected.length-10} more</span>`:''}</div><button id="editTripPrefs" class="text-sm font-bold text-basil underline underline-offset-4">Go back and change my trip preferences</button></div>`;
  editTripPrefs.onclick=()=>{renderInterests();show('interestScreen')}
}
function renderReach(r){
  ensureRegion(r.id);
  const outer=experiences.filter(e=>e.region===r.id&&reachMeta(e).zone!=='core');
  if(!outer.length){reachPrompt.innerHTML='';return}
  const cur=reachLevel(r.id);
  const excluded=outer.filter(e=>!reachAllows(e)).sort((a,b)=>expScore(b)-expScore(a));
  const best=excluded[0],base=baseLabel(r.id),broad=base.startsWith('your eventual');
  reachPrompt.innerHTML=`<div class="bg-white rounded-[1.5rem] border border-stone-100 shadow-soft p-5 sm:p-7"><p class="uppercase tracking-[.18em] text-xs font-bold text-tomato mb-2">How wide should we look?</p><h3 class="font-display text-2xl font-bold mb-2">How far from ${base} would you go for something especially worthwhile?</h3><p class="text-sm text-stone-500 mb-5">This changes which <strong>unsaved</strong> experiences can rise. It does not commit you to taking a day trip.${broad?' Because this is a broad region, we will replace this with actual base-to-experience travel once you choose a base.':''}</p><div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${reachOptions.map(o=>`<button data-reach="${o.id}" class="reachBtn pick text-left border-2 rounded-xl p-4 ${cur===o.id?'selected':'border-stone-200'}"><div class="font-bold">${o.label}</div><div class="text-xs text-stone-500 mt-1">${o.desc}</div></button>`).join('')}</div>${best?`<div class="mt-4 text-sm bg-cream border border-warm rounded-lg p-3"><strong>Why this matters:</strong> One of the stronger ideas currently outside your chosen radius is <strong>${best.name}</strong> (${zoneLabels[reachMeta(best).zone].toLowerCase()}).</div>`:''}</div>`;
  document.querySelectorAll('.reachBtn').forEach(b=>b.onclick=()=>{state.reach.set(r.id,b.dataset.reach);renderReach(r);recalcLayout(r.id);renderPrimary(r.id);renderWildcards(r.id);renderHiddenGems(r.id);renderOthers(r.id)})
}
function renderSeason(r){if(!r.seasonSensitive){seasonPrompt.classList.add('hidden');seasonPrompt.innerHTML='';return}seasonPrompt.classList.remove('hidden');const cur=state.regionMonth.get(r.id)||'';seasonPrompt.innerHTML=`<div class="flex flex-col md:flex-row md:justify-between gap-4"><div><p class="text-xs uppercase tracking-[.15em] font-bold text-tomato mb-1">Season matters here</p><h3 class="font-display text-xl font-bold">When would you visit ${r.short}?</h3><p class="text-sm text-stone-500 mt-1">This can change beach, mountain and weather-sensitive suggestions. It was intentionally not asked earlier.</p></div><select id="monthSelect" class="rounded-xl border border-stone-300 px-3 py-3 bg-white"><option value="">Not sure yet</option>${monthNames.map(([id,n])=>`<option value="${id}" ${cur===id?'selected':''}>${n}</option>`).join('')}</select></div>`;monthSelect.onchange=e=>{e.target.value?state.regionMonth.set(r.id,e.target.value):state.regionMonth.delete(r.id);recalcLayout(r.id);renderPrimary(r.id);renderWildcards(r.id);renderOthers(r.id)}}
