/* KEV FUSION 2026 — predictive.js v5.1.0
   RECHERCHE : résultats garantis et immédiats après sélection, détails complets, TSB + rappels,
   trace d'ingénieur visible, filtres live, aucun identifiant hérité, aucune exception silencieuse. */
(function(){
'use strict';
if(typeof KBall!=='function'||typeof VEHDB==='undefined'||!window.KFCorr){console.warn('predictive.js: prérequis manquants');return}
S.vehicle=null;S.yearFilter=null;
const WIN=KFCorr.WIN,norm=KFCorr.norm;
const PF={sys:'',grav:'',q:'',fire:false,rappel:true,tsb:true,dtc:true,strict:true};
const ALIAS={hdi:['bluehdi'],bluehdi:['hdi'],tfsi:['tsi'],tsi:['tfsi'],thp:['puretech'],puretech:['thp'],
 hybrid:['hybride','e-tech','e:hev','phev'],hybride:['hybrid','e-tech','e:hev','phev'],
 electrique:['electric','ev','e-'],electric:['electrique','ev','e-'],fap:['dpf','particules'],egr:['vanne egr']};
function toks(q){return norm(q).split(' ').filter(Boolean)}
function matchText(text,q){const t=toks(q);if(!t.length)return true;const L=norm(text);
 return t.every(function(k){return L.indexOf(k)>=0||(ALIAS[k]||[]).some(function(a){return L.indexOf(a)>=0})})}
function overlap(y,a,b){return y&&y[0]<=b&&y[1]>=a}
function inWin(e){if(!e.y)return true;const Y=S.yearFilter;return Y?overlap(e.y,Y,Y):overlap(e.y,WIN[0],WIN[1])}
function brands(){return Array.from(new Set(Object.keys(VEHDB).concat(Object.keys(VEHall())))).sort()}
function models(b){if(!b)return[];const s=new Set();
 Object.keys(VEHDB[b]||{}).forEach(function(m){if((VEHDB[b][m]||[]).some(inWin))s.add(m)});
 Object.keys(VEHall()[b]||{}).forEach(function(m){if((VEHall()[b][m]||[]).length)s.add(m)});
 return Array.from(s).sort()}
function engines(b,m){if(!b||!m)return[];const out=[],seen=new Set();
 ((VEHDB[b]||{})[m]||[]).forEach(function(e){if(inWin(e)&&!seen.has(e.label)){seen.add(e.label);out.push(e)}});
 ((VEHall()[b]||{})[m]||[]).forEach(function(x){if(!seen.has(x)){seen.add(x);out.push({label:x,ch:null,fuel:KFCorr.fuelGroup(x),y:null})}});
 return out}
function kw(ch){return ch?Math.round(ch*0.7355):null}
function makeCombo(mount,cfg){
 mount.innerHTML='<label>'+esc(cfg.label)+'</label><div class="cbx"><input class="cbx-in" autocomplete="off" placeholder="'+esc(cfg.placeholder||'')+'" value="'+esc(cfg.value||'')+'"><button type="button" class="cbx-tgl" tabindex="-1">▾</button><div class="cbx-list hid"></div></div>';
 const wrap=mount.querySelector('.cbx'),inp=mount.querySelector('.cbx-in'),list=mount.querySelector('.cbx-list'),tgl=mount.querySelector('.cbx-tgl');
 let items=[],active=-1,open=false;
 function renderList(){items=cfg.options().filter(function(o){return matchText(o.label,inp.value)});active=-1;
  list.innerHTML=items.length?items.map(function(o,i){return '<div class="cbx-opt" data-i="'+i+'"><span>'+esc(o.label)+'</span>'+(o.sub?'<span class="pw">'+esc(o.sub)+'</span>':'')+'</div>'}).join(''):'<div class="cbx-opt mut">'+esc(cfg.empty||'Aucun résultat')+'</div>'}
 function openList(){open=true;renderList();list.classList.remove('hid')}
 function closeList(){open=false;list.classList.add('hid')}
 function hl(){Array.prototype.forEach.call(list.children,function(c,i){c.classList.toggle('act',i===active)});
  const a=list.children[active];if(a&&a.scrollIntoView)a.scrollIntoView({block:'nearest'})}
 function pick(o){if(!o)return;inp.value=o.label;closeList();cfg.onPick(o)}
 inp.addEventListener('focus',openList);
 inp.addEventListener('input',function(){open?renderList():openList()});
 inp.addEventListener('keydown',function(e){
  if(e.key==='ArrowDown'){e.preventDefault();if(!open)openList();active=Math.min(active+1,items.length-1);hl()}
  else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0);hl()}
  else if(e.key==='Enter'){e.preventDefault();if(active>=0&&items[active])pick(items[active]);else if(items.length===1)pick(items[0])}
  else if(e.key==='Escape')closeList()});
 inp.addEventListener('blur',function(){setTimeout(function(){if(!wrap.contains(document.activeElement))closeList()},120)});
 tgl.addEventListener('click',function(){open?closeList():openList();inp.focus()});
 list.addEventListener('mousedown',function(e){e.preventDefault()});
 list.addEventListener('click',function(e){const o=e.target.closest('.cbx-opt');if(!o||o.classList.contains('mut'))return;pick(items[+o.dataset.i])});
 return{refresh:function(){if(open)renderList()},setValue:function(v){inp.value=v},focus:function(){inp.focus()}}}
let cB,cM,cE;
function mountSelector(host){
 if(!host)return;
 host.innerHTML='<div class="grid g3"><div id="cbBrand"></div><div id="cbModel"></div><div id="cbEngine"></div></div>'+
 '<div class="row" style="margin-top:8px"><div style="max-width:180px"><label>Année (2015–2027)</label><select id="pfYear"><option value="">Toutes 2015–2027</option>'+
 Array.from({length:WIN[1]-WIN[0]+1},function(_,i){return WIN[0]+i}).map(function(y){return '<option '+(S.yearFilter===y?'selected':'')+'>'+y+'</option>'}).join('')+'</select></div>'+
 '<div id="vehRead" class="vehread" style="flex:1"></div></div>'+
 '<div class="row" style="margin-top:8px"><button class="pri" data-ps="run">🔎 Afficher les pannes / rappels / TSB</button>'+
 '<button data-ps="widen">🧪 Élargir (mode ingénieur)</button><button data-ps="clearQ">✖ Réinitialiser filtres</button></div>';
 cB=makeCombo($('#cbBrand'),{label:'Marque',placeholder:'Tape une marque…',value:S.vehicle?S.vehicle.brand:'',empty:'Aucune marque',
  options:function(){return brands().map(function(b){return{label:b}})},
  onPick:function(o){S.vehicle={brand:o.label,model:'',engine:'',ch:null,fuel:'',y:null};
   cM.setValue('');cE.setValue('');cM.refresh();cE.refresh();vehChanged();cM.focus()}});
 cM=makeCombo($('#cbModel'),{label:'Modèle réel (2015–2027)',placeholder:S.vehicle&&S.vehicle.brand?'Modèles '+S.vehicle.brand:'Choisis la marque',value:S.vehicle?S.vehicle.model:'',empty:'Choisis la marque',
  options:function(){return models(S.vehicle?S.vehicle.brand:'').map(function(m){return{label:m}})},
  onPick:function(o){S.vehicle.model=o.label;S.vehicle.engine='';S.vehicle.ch=null;S.vehicle.fuel='';
   const es=engines(o.brand||S.vehicle.brand,o.label);
   if(es.length===1){S.vehicle.engine=es[0].label;S.vehicle.ch=es[0].ch;S.vehicle.fuel=es[0].fuel;S.vehicle.y=es[0].y;cE.setValue(es[0].label)}
   else cE.setValue('');
   cE.refresh();vehChanged();cE.focus()}});
 cE=makeCombo($('#cbEngine'),{label:'Motorisation + puissance réelle',placeholder:S.vehicle&&S.vehicle.model?'Motorisations '+S.vehicle.model:'Choisis le modèle',value:S.vehicle?S.vehicle.engine:'',empty:'Choisis le modèle',
  options:function(){return engines(S.vehicle?S.vehicle.brand:'',S.vehicle?S.vehicle.model:'').map(function(e){return{label:e.label,sub:e.ch?e.ch+' ch':'',_e:e}})},
  onPick:function(o){const e=o._e||{label:o.label,ch:null};S.vehicle.engine=e.label;S.vehicle.ch=e.ch;
   S.vehicle.fuel=e.fuel||KFCorr.fuelGroup(e.label);S.vehicle.y=e.y;vehChanged()}});
 const ys=$('#pfYear');
 if(ys)ys.addEventListener('change',function(e){S.yearFilter=e.target.value?+e.target.value:null;
  if(S.vehicle){if(S.vehicle.model&&models(S.vehicle.brand).indexOf(S.vehicle.model)<0){S.vehicle.model='';S.vehicle.engine='';cM.setValue('');cE.setValue('')}
   if(S.vehicle.engine&&!engines(S.vehicle.brand,S.vehicle.model).some(function(x){return x.label===S.vehicle.engine})){S.vehicle.engine='';S.vehicle.ch=null;cE.setValue('')}}
  cM.refresh();cE.refresh();vehChanged()});
 readout()}
function resolvedVehicle(){
 const v=S.vehicle;if(!v||!v.brand)return null;const o=Object.assign({},v);
 if(o.brand&&o.model){const es=engines(o.brand,o.model);
  if(!o.fuel){const cnt={};es.forEach(function(e){const f=e.fuel||KFCorr.fuelGroup(e.label);if(f)cnt[f]=(cnt[f]||0)+1});
   const best=Object.keys(cnt).sort(function(a,b){return cnt[b]-cnt[a]})[0];
   if(best)o.fuel=best==='ev'?'Électrique':best==='hyb'?'Hybride':best==='diesel'?'Diesel':'Essence'}
  if(!o.engine&&es.length===1){o.engine=es[0].label;o.ch=es[0].ch;o.y=es[0].y;
   if(!o.fuel)o.fuel=es[0].fuel||KFCorr.fuelGroup(es[0].label)}}
 if(!o.fuel&&o.engine)o.fuel=KFCorr.fuelGroup(o.engine);
 if(S.yearFilter)o.y=[S.yearFilter,S.yearFilter];
 return o}
function readout(){const el=$('#vehRead');if(!el)return;const v=resolvedVehicle();
 if(!v){el.innerHTML='<span class="mut">Marque → modèle → motorisation + puissance : corrélation stricte.</span>';return}
 const sig=KFCorr.signature(v);
 el.innerHTML='🚗 <b>'+esc(v.brand)+'</b> '+esc(v.model||'')+' '+esc(v.engine||'')+
 (sig.ch?' · <b class="pw">'+sig.ch+' ch</b> ('+sig.kw+' kW)':'')+
 ' · '+esc((sig.fuelGroup||'énergie déduite').toUpperCase())+' · <b>'+esc(sig.familyLabel)+'</b>'+
 (v.y?' · '+v.y[0]+'–'+v.y[1]:'')}
function syncStudy(){const v=resolvedVehicle()||{};
 const set=function(id,val){const e=$('#'+id);if(e)e.value=val==null?'':val};
 set('stMarque',v.brand);set('stModele',v.model);set('stMotor',v.engine);
 set('stAnnee',S.yearFilter||(v.y?v.y[1]:''));set('stEnergie',v.fuel||'');
 S.veh={marque:v.brand||'',modele:v.model||'',motor:v.engine||'',annee:S.yearFilter||(v.y?v.y[1]:''),vin:S.veh?S.veh.vin:''}}
function currentCorr(){const v=resolvedVehicle();if(!v)return null;
 try{return KFCorr.correlate(v,{strict:PF.strict,readDtc:S.dtc||[]})}
 catch(e){log('error','correlate '+e.message);return null}}
function isSearch(){return S.view==='recherche'}
function vehChanged(){syncStudy();readout();paint();document.dispatchEvent(new CustomEvent('kf:vehicle',{detail:S.vehicle}))}
function paint(){
 try{if(isSearch()){renderSearchPanel();runSearch()}else renderStudyPanel()}
 catch(e){log('error','paint '+e.message);
  const h=$('#srRes')||$('#vehPanel');
  if(h)h.innerHTML='<div class="card"><h2 class="st-fail">⚠️ Erreur d\'affichage</h2><p class="mut">'+esc(e.message)+'</p><button data-ps="clearQ">↻ Réinitialiser</button></div>'}}
/* ---------- rendu ---------- */
function traceCard(c){const t=c.trace,s=c.sig;
 return '<div class="card"><h2>🧬 Trace d\'ingénieur</h2><table class="kv">'+
 '<tr><td>Véhicule</td><td><b>'+esc(s.brand)+' '+esc(s.model)+'</b> '+esc(s.engine)+'</td></tr>'+
 '<tr><td>Puissance réelle</td><td>'+(s.ch?'<b class="pw">'+s.ch+' ch</b> / '+s.kw+' kW':'non précisée')+'</td></tr>'+
 '<tr><td>Cylindrée / énergie</td><td>'+esc(s.disp||'—')+' · '+esc((s.fuelGroup||'déduite du catalogue').toUpperCase())+(s.fuelUnknown?' <span class="badge b-elev">énergie déduite</span>':'')+'</td></tr>'+
 '<tr><td>Famille moteur</td><td><b>'+esc(s.familyLabel)+'</b></td></tr>'+
 '<tr><td>Base analysée</td><td class="mut">'+t.total+' fiches → marque '+t.brand+' → système '+t.system+' → énergie '+t.energy+' → famille '+t.family+' → puissance '+t.power+' → périmètre '+t.strict+'</td></tr>'+
 '<tr><td>Retenues</td><td><b>'+t.kept+' panne(s)</b> · '+c.dtc.length+' DTC · '+c.recalls.length+' rappel(s) · '+c.tsb.length+' TSB'+(t.fallback?' <span class="badge b-elev">repli ingénieur actif</span>':'')+'</td></tr>'+
 '<tr><td>DTC du modèle</td><td class="mut">'+esc(c.modelDtc.join(', ')||'—')+'</td></tr></table></div>'}
function filterBar(pool){
 const sys=Array.from(new Set((pool||[]).map(function(k){return k.s}))).sort();
 return '<div class="row" style="margin-bottom:8px"><button class="chipf '+(PF.strict?'on':'')+'" data-ps="strict">🎯 Corrélation stricte</button>'+
 '<span class="mut">'+(PF.strict?'Marque + modèle + motorisation + puissance + énergie + systèmes.':'Élargi : ajoute les pannes génériques compatibles.')+'</span></div>'+
 '<div class="grid g3"><div><label>Système</label><select data-ps="sys"><option value="">Tous</option>'+
 sys.map(function(s){return '<option '+(PF.sys===s?'selected':'')+'>'+esc(s)+'</option>'}).join('')+'</select></div>'+
 '<div><label>Gravité</label><select data-ps="grav"><option value="">Toutes</option>'+
 ['Critique','Élevé','Modéré'].map(function(g){return '<option '+(PF.grav===g?'selected':'')+'>'+g+'</option>'}).join('')+'</select></div>'+
 '<div><label>Filtre résultats</label><input data-ps="q" value="'+esc(PF.q)+'" placeholder="DTC, composant, mot-clé…"></div></div>'+
 '<div class="row"><button class="chipf '+(PF.fire?'on':'')+'" data-ps="fire">🔥 Incendie</button>'+
 '<button class="chipf '+(PF.dtc?'on':'')+'" data-ps="dtc">🔢 Codes défauts</button>'+
 '<button class="chipf '+(PF.rappel?'on':'')+'" data-ps="rappel">📣 Rappels</button>'+
 '<button class="chipf '+(PF.tsb?'on':'')+'" data-ps="tsb">🧰 TSB</button></div>'}
function applyFilters(list,extraQ){
 let out=list||[];
 if(PF.sys)out=out.filter(function(k){return k.s===PF.sys});
 if(PF.grav)out=out.filter(function(k){return k.g===PF.grav});
 if(PF.fire)out=out.filter(function(k){return k.f});
 const q=[PF.q,extraQ].filter(Boolean).join(' ');
 if(q)out=out.filter(function(k){return matchText((k.t||'')+' '+(k.mec||'')+' '+(k.dtc||[]).join(' ')+' '+(k.s||'')+' '+(k.sym||[]).join(' ')+' '+(k.cons||[]).join(' '),q)});
 return out}
function dtcCard(c){
 return '<div class="card"><h2>🔢 Codes défauts liés — '+c.dtc.length+'</h2>'+
 (c.dtc.length?'<div class="row">'+c.dtc.map(function(d){
  return '<span class="badge '+(d.fromModel?'b-crit':'b-dtc')+'" title="'+esc(d.faults.join(' | '))+'">'+d.code+(d.read?' ✅':'')+(d.fromModel?' ★':'')+'</span>'}).join('')+'</div>'+
 '<p class="mut">★ code issu d\'un TSB/rappel du modèle · ✅ déjà lu sur le véhicule. Survole un code pour les pannes associées.</p>'+
 '<div class="row" style="margin-top:8px"><button data-ps="injectDtc">🧠 Injecter dans l\'étude</button><button data-ps="copyDtc">📋 Copier</button></div>'
 :'<p class="mut">Aucun DTC corrélé.</p>')+'</div>'}
function faultFull(k){
 const rel=k.relevance.indexOf('DIRECT')===0?'b-crit':k.relevance.indexOf('FORT')===0?'b-elev':'b-mod';
 return '<div class="card faultcard"><h3>'+esc(k.t)+'</h3>'+
 '<div><span class="badge '+rel+'">'+esc(k.relevance)+'</span>'+
 '<span class="badge '+(k.g==='Critique'?'b-crit':k.g==='Élevé'?'b-elev':'b-mod')+'">'+esc(k.g)+'</span>'+
 (k.f?'<span class="badge b-fire">🔥 incendie</span>':'')+
 '<span class="badge">'+esc(k.s)+'</span>'+
 (k.dtc||[]).map(function(d){return '<span class="badge b-dtc">'+esc(d)+'</span>'}).join('')+'</div>'+
 '<p class="mut"><b>Corrélation :</b> '+esc(k.why.join(' · '))+' · score '+k.sc+'</p>'+
 '<p><b>Mécanisme :</b> '+esc(k.mec)+'</p>'+
 (k.ch?'<p class="b-fire"><b>Chaîne incendie :</b> '+esc(k.ch)+'</p>':'')+
 '<p class="mut"><b>Conséquences :</b> '+esc((k.cons||[]).join(' · ')||'—')+'</p>'+
 '<p class="mut"><b>Symptômes :</b> '+esc((k.sym||[]).join(' · ')||'—')+'</p>'+
 '<p class="mut"><b>Preuves :</b> '+esc((k.prv||[]).join(' · ')||'—')+'</p>'+
 '<p class="mut"><b>Tests :</b> '+esc((k.tst||[]).join(' · ')||'—')+'</p>'+
 '<p class="mut"><b>Sécurité :</b> '+esc(k.sec||'—')+'</p>'+
 (k.legal&&k.legal.length?'<p class="mut"><b>Juridique :</b> '+k.legal.map(function(l){return '<span class="badge b-law">'+esc(l.ref)+'</span>'}).join(' ')+'</p>':'')+
 (k.linkTsb&&k.linkTsb.length?'<p class="mut"><b>TSB liés :</b> '+k.linkTsb.map(function(t){return esc(t.ref)}).join(' · ')+'</p>':'')+
 (k.linkRec&&k.linkRec.length?'<p class="mut"><b>Rappels liés :</b> '+k.linkRec.map(function(r){return esc(r.t)}).join(' · ')+'</p>':'')+
 '<div class="row"><button class="pri" data-ps="fiche" data-k="'+esc(k.id)+'">📋 Fiche complète</button>'+
 '<button data-act="studyFrom" data-k="'+esc(k.id)+'">🧠 Étudier</button>'+
 '<button data-ps="toJR" data-k="'+esc(k.id)+'">⚖️ JusteRepère</button>'+
 '<button data-ps="toAD" data-k="'+esc(k.id)+'">🧠 Auto-Droit</button></div></div>'}
function recallCard(r){
 return '<div class="card"><b>'+(r.fire?'🔥 ':'')+esc(r.t)+'</b> <span class="badge">'+esc(r.src)+'</span>'+
 '<p class="mut">'+esc(r.risk)+'</p><p class="mut">'+r.y[0]+'–'+r.y[1]+' · '+esc((r.dtc||[]).join(', '))+' · '+esc((r.law||[]).join(', '))+'</p></div>'}
function tsbCard(t){
 return '<div class="card"><b>'+esc(t.ref)+'</b> <span class="badge '+(t.g==='Critique'?'b-crit':'b-elev')+'">'+esc(t.g)+'</span>'+
 '<p>'+esc(t.s)+'</p><p class="mut">'+esc(t.sys)+' · '+esc((t.dtc||[]).join(', '))+' · '+t.y[0]+'–'+t.y[1]+' · motorisations : '+esc((t.e||[]).join(', '))+'</p></div>'}
function legalBlock(q){
 if(!q)return'';
 const list=ALLTEXTS().filter(function(l){return matchText(l.t+' '+l.ref+' '+l.txt,q)});
 if(!list.length)return'';
 return '<div class="card"><h2>⚖️ Textes juridiques ('+list.length+')</h2>'+list.map(function(l){
  return '<div class="card"><h3>'+esc(l.t)+' <span class="badge b-law">'+esc(l.ref)+'</span></h3><p>'+esc(l.txt)+'</p><p class="mut">Délai : '+esc(l.delai)+'</p>'+
  '<div class="row"><button class="jr" data-act="nav" data-k="jr">⚖️ JusteRepère</button><button data-act="nav" data-k="droitsmart">🧠 Auto-Droit</button></div></div>'}).join('')+'</div>'}
function resultsHTML(c,extraQ){
 const pan=applyFilters(c.faults,extraQ);
 const rap=PF.rappel?c.recalls.filter(function(r){return !extraQ||matchText(r.t+' '+r.risk+' '+(r.dtc||[]).join(' '),extraQ)}):[];
 const tsb=PF.tsb?c.tsb.filter(function(t){return !extraQ||matchText(t.ref+' '+t.s+' '+t.sys+' '+(t.dtc||[]).join(' ')+' '+(t.e||[]).join(' '),extraQ)}):[];
 const s=c.sig;
 return '<div class="card"><h2>🎯 Résultats corrélés — '+esc(s.brand)+' '+esc(s.model||'')+' '+esc(s.engine||'')+(s.ch?' '+s.ch+' ch':'')+'</h2>'+
 '<p class="mut">Mode '+(PF.strict?'<b>STRICT</b>':'élargi')+' · <b>'+pan.length+' panne(s)</b> · '+c.dtc.length+' DTC · '+rap.length+' rappel(s) · '+tsb.length+' TSB'+(extraQ?' · filtre « '+esc(extraQ)+' »':'')+'</p>'+
 '<div class="row"><button class="pri" data-act="nav" data-k="etude">🧠 Étude croisée sur ce véhicule</button><button data-ps="injectDtc">🔢 Injecter les DTC</button><button data-ps="widen">🧪 Élargir</button></div></div>'+
 '<div class="card"><h2>🔧 Pannes connues ('+pan.length+')</h2>'+
 (pan.length?pan.map(faultFull).join(''):'<p class="mut">Aucune panne avec ces filtres. Utilise « 🧪 Élargir » ou « ✖ Réinitialiser filtres ».</p>')+'</div>'+
 (PF.rappel?'<div class="card"><h2>📣 Campagnes de rappel ('+rap.length+')</h2>'+(rap.length?rap.map(recallCard).join(''):'<p class="mut">Aucun rappel pour ce modèle/motorisation/année/puissance.</p>')+'</div>':'')+
 (PF.tsb?'<div class="card"><h2>🧰 Bulletins techniques TSB ('+tsb.length+')</h2>'+(tsb.length?tsb.map(tsbCard).join(''):'<p class="mut">Aucun TSB pour cette motorisation/puissance.</p>')+'</div>':'')}
function renderSearchPanel(){
 const host=$('#srPanel');if(!host)return;const c=currentCorr();
 if(!c){host.innerHTML='<div class="card mut">Sélectionne au moins une marque pour lancer la corrélation.</div>';return}
 host.innerHTML=traceCard(c)+'<div class="card"><h2>🔗 Filtres de corrélation</h2>'+filterBar(c.faults)+'</div>'+(PF.dtc?dtcCard(c):'')}
function runSearch(){
 const host=$('#srRes');if(!host)return;
 try{
  const qEl=$('#srQ'),q=qEl?qEl.value.trim():'';
  const c=currentCorr();
  if(!c){host.innerHTML='<div class="card"><h2>🔎 Recherche prédictive</h2><p class="mut">Choisis <b>marque → modèle → motorisation + puissance</b>. Les pannes, codes défauts, rappels et TSB seront strictement limités à ce véhicule, avec tous les détails.</p></div>'+legalBlock(q);return}
  host.innerHTML=resultsHTML(c,q)+legalBlock(q);
 }catch(e){log('error','runSearch '+e.message);
  host.innerHTML='<div class="card"><h2 class="st-fail">⚠️ Recherche interrompue</h2><p class="mut">'+esc(e.message)+'</p><button data-ps="clearQ">↻ Réinitialiser</button></div>'}}
function renderStudyPanel(){
 const host=$('#vehPanel');if(!host)return;const c=currentCorr();
 if(!c){host.innerHTML='<div class="card mut">Sélectionne marque → modèle → motorisation pour la corrélation.</div>';return}
 host.innerHTML=traceCard(c)+'<div class="card"><h2>🔗 Filtres de corrélation</h2>'+filterBar(c.faults)+'</div>'+(PF.dtc?dtcCard(c):'')+resultsHTML(c,'')}
function fiche(id){
 const c=currentCorr();if(!c)return;const k=c.faults.find(function(x){return x.id===id});if(!k)return;
 openModal('<h2>📋 '+esc(k.t)+'</h2>'+
 '<div><span class="badge b-crit">'+esc(k.relevance)+'</span><span class="badge">'+esc(k.s)+'</span><span class="badge '+(k.g==='Critique'?'b-crit':'b-elev')+'">'+esc(k.g)+'</span>'+(k.dtc||[]).map(function(d){return '<span class="badge b-dtc">'+esc(d)+'</span>'}).join('')+'</div>'+
 '<p class="mut"><b>Marques :</b> '+esc((k.b||[]).join(', '))+'</p>'+
 '<p><b>Mécanisme :</b> '+esc(k.mec)+'</p>'+(k.ch?'<p class="b-fire"><b>Chaîne incendie :</b> '+esc(k.ch)+'</p>':'')+
 '<p><b>Conséquences :</b> '+esc((k.cons||[]).join(' · '))+'</p>'+
 '<p><b>Symptômes :</b> '+esc((k.sym||[]).join(' · '))+'</p>'+
 '<p><b>Preuves :</b> '+esc((k.prv||[]).join(' · '))+'</p>'+
 '<p><b>Tests :</b> '+esc((k.tst||[]).join(' · '))+'</p>'+
 '<p><b>Sécurité :</b> '+esc(k.sec||'—')+'</p>'+
 (k.legal||[]).map(function(l){return '<div class="card"><b>'+esc(l.t)+'</b> <span class="badge b-law">'+esc(l.ref)+'</span><p class="mut">'+esc(l.txt)+'</p><p class="mut">Délai : '+esc(l.delai)+'</p></div>'}).join('')+
 (k.linkTsb||[]).map(tsbCard).join('')+(k.linkRec||[]).map(recallCard).join('')+
 '<div class="row"><button class="pri" data-act="studyFrom" data-k="'+esc(k.id)+'">🧠 Étudier</button><button data-act="closeModal">Fermer</button></div>')}
/* ---------- vues ---------- */
window.doSearch=function(){if(isSearch())runSearch()};
window.scoreKB=function(inp){
 const v={brand:inp.marque,model:inp.modele,engine:inp.motor,ch:S.vehicle&&S.vehicle.ch,fuel:inp.energie,y:S.vehicle&&S.vehicle.y};
 const c=KFCorr.correlate(v,{strict:true,readDtc:inp.dtc||[]});S.lastCorr=c;return c.faults.slice(0,8)};
window.renderSearch=function(){
 $('#view').innerHTML='<div class="card"><h2>🔎 Recherche prédictive — corrélation stricte</h2>'+
 '<div id="srSel"></div>'+
 '<label>Recherche libre (restreinte au véhicule sélectionné)</label>'+
 '<input id="srQ" placeholder="EGR, courroie, P0016, incendie, fuite, calamine…" autocomplete="off">'+
 '<div class="row"><button class="pri" data-ps="run">🔎 Rechercher</button><button data-ps="clearQ">✖ Effacer</button></div></div>'+
 '<div id="srPanel"></div><div id="srRes"></div>';
 mountSelector($('#srSel'));
 const q=$('#srQ');if(q)q.addEventListener('input',runSearch);
 paint()};
window.renderStudy=function(){
 $('#view').innerHTML='<div class="card"><h2>🧠 Étude croisée — corrélation motorisation stricte</h2><div id="selStudy"></div>'+
 '<div class="row" style="margin-top:8px"><button class="pri" data-ps="run">🔎 Afficher corrélation</button><button data-ps="widen">🧪 Élargir</button></div></div>'+
 '<div class="card"><h2>📋 Contexte & constatations</h2><div class="grid g3">'+
 '<div><label>Vendeur</label><select id="stVendeur"><option value="pro">Professionnel</option><option value="part">Particulier</option></select></div>'+
 '<div><label>Date d\'achat</label><input id="stAchat" type="date"></div>'+
 '<div><label>Neuf/occasion</label><select id="stNeuf"><option value="occasion">Occasion</option><option value="neuf">Neuf</option></select></div>'+
 '<div><label>Prix €</label><input id="stPrix" type="number"></div>'+
 '<input type="hidden" id="stMarque"><input type="hidden" id="stModele"><input type="hidden" id="stMotor"><input type="hidden" id="stAnnee"><input type="hidden" id="stEnergie"></div>'+
 '<label>Constatations</label><div class="constats" id="stConstats">'+CONSTATS.map(function(c){return '<label><input type="checkbox" value="'+c+'">'+c+'</label>'}).join('')+'</div>'+
 '<label>DTC lus sur le véhicule</label><input id="stDtc" value="'+S.dtc.join(' ')+'" placeholder="P0016 P0400…"><label>Contexte</label><textarea id="stCtx"></textarea>'+
 '<button class="pri" data-act="study">⚙️ Lancer l\'étude corrélée</button></div><div id="vehPanel"></div><div id="stResult"></div>';
 mountSelector($('#selStudy'));syncStudy();paint()};
const _home=window.renderHome;
window.renderHome=function(){_home();const v=$('#view');const c=currentCorr();if(!v||!c)return;
 v.insertAdjacentHTML('afterbegin','<div class="card"><h2>🚗 Véhicule courant</h2>'+
 '<p>'+esc(c.sig.brand)+' '+esc(c.sig.model||'')+' '+esc(c.sig.engine||'')+(c.sig.ch?' · <b class="pw">'+c.sig.ch+' ch</b>':'')+'</p>'+
 '<p class="mut">'+c.faults.length+' panne(s) · '+c.dtc.length+' DTC · '+c.recalls.length+' rappel(s) · '+c.tsb.length+' TSB (corrélation stricte)</p>'+
 '<div class="row"><button class="pri" data-act="nav" data-k="etude">🧠 Étudier</button><button data-act="nav" data-k="recherche">🔎 Recherche</button><button class="jr" data-act="nav" data-k="jr">⚖️ JusteRepère</button></div></div>')};
/* ---------- dispatcher ---------- */
document.addEventListener('change',function(e){const p=e.target.dataset.ps;if(!p)return;
 if(p==='sys'||p==='grav'){PF[p]=e.target.value;paint()}});
document.addEventListener('input',function(e){if(e.target.dataset.ps==='q'){PF.q=e.target.value;paint()}});
document.addEventListener('click',async function(e){
 const b=e.target.closest('[data-ps]');if(!b)return;const p=b.dataset.ps,k=b.dataset.k;
 if(p==='run'){paint();toast('🔎 Corrélation actualisée');return}
 if(p==='widen'){PF.strict=false;PF.sys='';PF.grav='';PF.fire=false;PF.q='';const q=$('#srQ');if(q)q.value='';paint();toast('🧪 Mode ingénieur élargi');return}
 if(p==='strict'||p==='fire'||p==='rappel'||p==='tsb'||p==='dtc'){PF[p]=!PF[p];paint();return}
 if(p==='clearQ'){PF.q='';PF.sys='';PF.grav='';PF.fire=false;PF.strict=true;const q=$('#srQ');if(q)q.value='';paint();return}
 if(p==='fiche'){fiche(k);return}
 if(p==='injectDtc'){const c=currentCorr();if(!c)return;S.dtc=c.dtc.map(function(d){return d.code});
  switchView('etude');setTimeout(function(){const t=$('#stDtc');if(t)t.value=S.dtc.join(' ')},60);
  toast('🔢 '+S.dtc.length+' DTC corrélés injectés');return}
 if(p==='copyDtc'){const c=currentCorr();if(!c)return;
  try{await navigator.clipboard.writeText(c.dtc.map(function(d){return d.code}).join(' '));toast('📋 DTC copiés')}catch(x){toast('Copie impossible')}return}
 if(p==='toJR'){const kb=KBall().find(function(x){return x.id===k});S.jr.dom='route';S.jr.result=null;switchView('jr');
  setTimeout(function(){const a=$('#jrVehMarque'),b2=$('#jrVehMotor'),f=$('#jrFaits');
   if(a)a.value=S.vehicle?S.vehicle.brand+' '+S.vehicle.model:'';
   if(b2)b2.value=S.vehicle?S.vehicle.engine:'';
   if(f)f.value=kb?kb.t+' : '+kb.mec:''},60);return}
 if(p==='toAD'){const kb=KBall().find(function(x){return x.id===k});switchView('droitsmart');
  setTimeout(function(){const t=$('#adText');if(t)t.value=(S.vehicle?S.vehicle.brand+' '+S.vehicle.model+' '+S.vehicle.engine+' : ':'')+(kb?kb.t+' — '+kb.mec:'')},60);return}});
window.KFPredictive={brands:brands,models:models,engines:engines,correlate:currentCorr,runSearch:runSearch};
})();
