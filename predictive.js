/* KEV FUSION 2026 — predictive.js v5.2.0
   Correctif : « Lancer l'étude corrélée » utilise désormais un moteur d'étude AUTONOME
   (plus d'appel à runStudy/qualify/scoreKB d'app.js, sources de l'erreur), qualification juridique
   défensive, rendu complet + PDF + JSON + dossier, garde-fous et message d'erreur lisible. */
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
function lawOf(id){try{const l=txtById(id);return l&&l.t?l:null}catch(e){return null}}
/* ---------- combobox ---------- */
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
   const es=engines(S.vehicle.brand,o.label);
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
/* ---------- rendu corrélation ---------- */
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
 '<p class="mut">★ code issu d\'un TSB/rappel du modèle · ✅ déjà lu sur le véhicule.</p>'+
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
 '<button data-ps="studyOne" data-k="'+esc(k.id)+'">🧠 Étudier ce cas</button>'+
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
 '<div class="row"><button class="pri" data-ps="study">🧠 Lancer l\'étude corrélée</button><button data-ps="injectDtc">🔢 Injecter les DTC</button><button data-ps="widen">🧪 Élargir</button></div></div>'+
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
  if(!c){host.innerHTML='<div class="card"><h2>🔎 Recherche prédictive</h2><p class="mut">Choisis <b>marque → modèle → motorisation + puissance</b>.</p></div>'+legalBlock(q);return}
  host.innerHTML=resultsHTML(c,q)+legalBlock(q);
 }catch(e){log('error','runSearch '+e.message);
  host.innerHTML='<div class="card"><h2 class="st-fail">⚠️ Recherche interrompue</h2><p class="mut">'+esc(e.message)+'</p><button data-ps="clearQ">↻ Réinitialiser</button></div>'}}
function renderStudyPanel(){
 const host=$('#vehPanel');if(!host)return;const c=currentCorr();
 if(!c){host.innerHTML='<div class="card mut">Sélectionne marque → modèle → motorisation pour la corrélation.</div>';return}
 host.innerHTML=traceCard(c)+'<div class="card"><h2>🔗 Filtres de corrélation</h2>'+filterBar(c.faults)+'</div>'+(PF.dtc?dtcCard(c):'')+resultsHTML(c,'')}
/* ---------- ÉTUDE AUTONOME (correctif erreur) ---------- */
function studyForm(){
 const g=function(id){const e=$('#'+id);return e?e.value:''};
 const v=resolvedVehicle()||{};
 return{brand:v.brand||'',model:v.model||'',engine:v.engine||'',ch:v.ch||null,fuel:v.fuel||'',y:v.y||null,
  vendeur:g('stVendeur')||'pro',achat:g('stAchat'),neuf:g('stNeuf')||'occasion',prix:g('stPrix'),
  constats:Array.prototype.map.call(document.querySelectorAll('#stConstats input:checked'),function(i){return i.value}),
  dtc:(String(g('stDtc')||'').toUpperCase().match(/[PCBU][0-9]{4}/g)||[]),
  ctx:String(g('stCtx')||'').trim()}}
function qualifySafe(f,form){
 const out=[],add=function(id,why){const l=lawOf(id);if(l&&!out.some(function(x){return x.id===l.id}))out.push(Object.assign({},l,{why:why}))};
 const grave=form.constats.indexOf('incendie')>=0||form.constats.indexOf('véhicule immobilisé')>=0||f.some(function(k){return k.g==='Critique'});
 const months=form.achat?Math.floor((Date.now()-new Date(form.achat).getTime())/2629800000):null;
 if(form.vendeur==='pro'){add('CONSO2173','Vendeur professionnel → garantie légale de conformité');
  if(months!==null&&months<=(form.neuf==='occasion'?12:24))add('CONSO2177','Présomption d\'antériorité ('+(form.neuf==='occasion'?12:24)+' mois)')}
 if(grave)add('CC1641','Défaut grave → résolution ou réduction du prix'+(form.vendeur==='part'?' (particulier : voie principale)':''));
 if(form.constats.indexOf('après entretien')>=0||/répar|garage|entretien/i.test(form.ctx))add('CC12311','Intervention d\'un réparateur → obligation de résultat');
 if(form.constats.indexOf('incendie')>=0||/bless|brûl|dommage/i.test(form.ctx)){
  add('CC1245','Dommage par défaut de sécurité du produit');add('CONSOL4213','Obligation générale de sécurité — vérifier les rappels');
  if(/propag|voisin|tiers/i.test(form.ctx))add('CC1240','Dommages causés à des tiers')}
 if(/dissimul|menti|maquill|tromp|compteur/i.test(form.ctx))add('CC1137','Indices de dissimulation intentionnelle → dol');
 f.forEach(function(k){(k.law||[]).forEach(function(id){add(id,'Fondement rattaché à la panne corrélée : '+k.t)})});
 if(!out.length)add('CC1641','À qualifier selon gravité et antériorité du défaut');
 return out}
function runStudySafe(focusId){
 const host=$('#stResult');if(!host)return;
 try{
  const form=studyForm();
  if(!form.brand){host.innerHTML='<div class="card"><h2 class="st-warn">🚗 Véhicule requis</h2><p class="mut">Sélectionne marque → modèle → motorisation avant de lancer l\'étude.</p></div>';return}
  const c=KFCorr.correlate(form,{strict:PF.strict,readDtc:form.dtc});
  let top=c.faults.slice(0,8);
  if(focusId){const one=c.faults.find(function(x){return x.id===focusId});if(one)top=[one].concat(top.filter(function(x){return x.id!==focusId})).slice(0,8)}
  const laws=qualifySafe(top,form);
  const best=top.length?top[0].sc:0;
  const level=best>=15?'PROBABLE — faisceau fort, confirmer par preuves':best>=10?'PROBABLE':best>=6?'POSSIBLE — hypothèse à vérifier':'INDÉTERMINÉ — données insuffisantes';
  const fires=top.filter(function(k){return k.f});
  const study={ts:new Date().toISOString(),version:'5.2.0',form:form,signature:c.sig,
   top:top.map(function(k){return{id:k.id,t:k.t,s:k.s,g:k.g,f:k.f,dtc:k.dtc,mec:k.mec,ch:k.ch,cons:k.cons,sym:k.sym,prv:k.prv,tst:k.tst,sec:k.sec,sc:k.sc,why:k.why,relevance:k.relevance,law:k.law}}),
   laws:laws.map(function(l){return{id:l.id,ref:l.ref,t:l.t,why:l.why,delai:l.delai}}),
   fires:fires.map(function(k){return{id:k.id,t:k.t,ch:k.ch}}),
   recalls:c.recalls.map(function(r){return{t:r.t,src:r.src,risk:r.risk,y:r.y,dtc:r.dtc}}),
   tsb:c.tsb.map(function(t){return{ref:t.ref,sys:t.sys,s:t.s,y:t.y,dtc:t.dtc}}),
   dtc:c.dtc,level:level,trace:c.trace};
  S.study=study;S.lastCorr=c;
  const h=ls.get('studies',[]);h.unshift(study);ls.set('studies',h.slice(0,20));
  host.innerHTML='<div class="card"><h2>🧠 Étude corrélée — <span class="'+(best>=10?'st-warn':'st-ok')+'">'+esc(level)+'</span></h2>'+
   '<p class="mut">'+esc(form.brand)+' '+esc(form.model)+' '+esc(form.engine)+(form.ch?' · '+form.ch+' ch':'')+' · vendeur '+esc(form.vendeur==='pro'?'professionnel':'particulier')+(form.achat?' · achat '+esc(form.achat):'')+(form.prix?' · '+esc(form.prix)+' €':'')+'</p>'+
   '<p class="mut">Constatations : '+esc(form.constats.join(', ')||'—')+' · DTC : '+esc(form.dtc.join(', ')||'—')+'</p>'+
   (form.ctx?'<p class="mut">'+esc(form.ctx)+'</p>':'')+
   '<div class="row"><button class="pri" data-ps="studyPdf">🖨️ Rapport PDF</button><button data-ps="studyJson">📤 Export JSON</button><button data-ps="studyDoss">📁 Créer le dossier</button><button class="jr" data-ps="studyJR">⚖️ JusteRepère</button></div></div>'+
   '<div class="card"><h2>🔧 Causes corrélées ('+top.length+')</h2>'+
   (top.length?top.map(faultFull).join(''):'<p class="mut">Aucune cause corrélée — élargis le périmètre.</p>')+'</div>'+
   (fires.length?'<div class="card"><h2>🔥 Chaînes incendie ('+fires.length+')</h2>'+fires.map(function(k){return '<div class="card"><b>'+esc(k.t)+'</b><p class="b-fire">'+esc(k.ch||'—')+'</p><p class="mut"><b>Sécurité :</b> '+esc(k.sec||'—')+'</p></div>'}).join('')+'</div>':'')+
   '<div class="card"><h2>⚖️ Qualification juridique ('+laws.length+')</h2>'+laws.map(function(l){
    return '<div class="card"><h3>'+esc(l.t)+' <span class="badge b-law">'+esc(l.ref)+'</span></h3><p>'+esc(l.txt)+'</p><p class="mut"><b>Délai :</b> '+esc(l.delai)+'</p><p class="b-law"><b>Application au cas :</b> '+esc(l.why)+'</p></div>'}).join('')+'</div>'+
   (c.recalls.length?'<div class="card"><h2>📣 Rappels à vérifier ('+c.recalls.length+')</h2>'+c.recalls.map(recallCard).join('')+'</div>':'')+
   (c.tsb.length?'<div class="card"><h2>🧰 TSB applicables ('+c.tsb.length+')</h2>'+c.tsb.map(tsbCard).join('')+'</div>':'')+
   '<div class="card"><h2>🧭 Méthode & réserves</h2><p class="mut">Qualifier → Inférer → Corréler → Analyser → Tester → Conclure (Certain / Probable / Possible / Indéterminé). Document d\'aide à l\'expertise issu des bases fusionnées ; ne constitue pas une expertise judiciaire contradictoire.</p></div>';
  toast('🧠 Étude corrélée générée');
  host.scrollIntoView({behavior:'smooth',block:'start'});
 }catch(e){log('error','study '+e.message);
  host.innerHTML='<div class="card"><h2 class="st-fail">⚠️ Étude interrompue</h2><p class="mut">'+esc(e.message)+'</p>'+
  '<div class="row"><button class="pri" data-ps="study">↻ Relancer</button><button data-ps="widen">🧪 Élargir le périmètre</button></div></div>'}}
function studyPdf(){
 const s=S.study;if(!s){toast('Lance d\'abord une étude');return}
 const f=s.form;
 $('#printArea').innerHTML='<h1>🔥 KEV FUSION — Étude corrélée</h1>'+
 '<p>'+new Date(s.ts).toLocaleString('fr-FR')+' · v'+s.version+' · '+esc(S.role==='admin'?'Kevin (admin)':(S.prenom||''))+'</p>'+
 '<h2>1. Véhicule</h2><p>'+esc(f.brand)+' '+esc(f.model)+' '+esc(f.engine)+(f.ch?' · '+f.ch+' ch':'')+' · '+esc(f.fuel||'')+'</p>'+
 '<p>Vendeur '+esc(f.vendeur==='pro'?'professionnel':'particulier')+' · achat '+esc(f.achat||'?')+' ('+esc(f.neuf)+') · '+esc(f.prix||'?')+' €</p>'+
 '<p>Constatations : '+esc(f.constats.join(', ')||'—')+' · DTC : '+esc(f.dtc.join(', ')||'—')+'</p><p>'+esc(f.ctx||'')+'</p>'+
 '<h2>2. Signature technique</h2><p>Famille '+esc(s.signature.familyLabel)+' · énergie '+esc(s.signature.fuelGroup||'déduite')+' · cylindrée '+esc(s.signature.disp||'—')+'</p>'+
 '<h2>3. Causes corrélées ('+esc(s.level)+')</h2>'+s.top.map(function(k){
  return '<p><b>'+esc(k.t)+'</b> ('+esc(k.relevance)+', score '+k.sc+')<br>Mécanisme : '+esc(k.mec)+'<br>DTC : '+esc((k.dtc||[]).join(', '))+'<br>Conséquences : '+esc((k.cons||[]).join(' ; '))+'<br>Preuves : '+esc((k.prv||[]).join(' ; '))+' · Tests : '+esc((k.tst||[]).join(' ; '))+'<br>Sécurité : '+esc(k.sec||'—')+'</p>'}).join('')+
 '<h2>4. Chaînes incendie</h2>'+(s.fires.length?s.fires.map(function(k){return '<p>🔥 <b>'+esc(k.t)+'</b> : '+esc(k.ch||'—')+'</p>'}).join(''):'<p>Aucune.</p>')+
 '<h2>5. Qualification juridique</h2>'+s.laws.map(function(l){return '<p><b>'+esc(l.t)+'</b> — '+esc(l.ref)+'<br>Délai : '+esc(l.delai)+'<br>Application : '+esc(l.why)+'</p>'}).join('')+
 '<h2>6. Rappels</h2>'+(s.recalls.length?s.recalls.map(function(r){return '<p>'+esc(r.t)+' ('+esc(r.src)+') — '+esc(r.risk)+' · '+r.y[0]+'–'+r.y[1]+'</p>'}).join(''):'<p>Aucun.</p>')+
 '<h2>7. TSB</h2>'+(s.tsb.length?s.tsb.map(function(t){return '<p>'+esc(t.ref)+' — '+esc(t.s)+'</p>'}).join(''):'<p>Aucun.</p>')+
 '<h2>8. Méthode</h2><p>Qualifier → Inférer → Corréler → Analyser → Tester → Conclure. Aide à l\'expertise, ne constitue pas une expertise judiciaire contradictoire.</p>';
 document.body.classList.add('printing');window.print();setTimeout(function(){document.body.classList.remove('printing')},800)}
function studyDoss(){
 const s=S.study;if(!s){toast('Lance d\'abord une étude');return}
 const first=s.laws[0]?s.laws[0].id:'CC1641';
 const cat=(typeof CAT2LAW==='object'&&CAT2LAW[first])||'autre';
 const d=newDossier({cat:cat,titre:(s.form.brand+' '+s.form.model+' — '+(PROCEDURES[cat]?PROCEDURES[cat].label:'Litige')).trim(),
  veh:{marque:s.form.brand,modele:s.form.model,motor:s.form.engine,annee:s.form.y?s.form.y[1]:'',vin:S.veh?S.veh.vin:'',prix:s.form.prix,achat:s.form.achat,neuf:s.form.neuf},
  vendeur:{nom:'',adresse:'',type:s.form.vendeur},decouverte:new Date().toISOString().slice(0,10),
  faits:(s.form.ctx||'')+(s.top.length?' Constatations : '+s.top.map(function(x){return x.t}).join(' ; '):''),
  etude:{level:s.level,top:s.top,fires:s.fires}});
 saveDossier(d);S.doss=d;switchView('dossiers');openDossier(d.id);toast('📁 Dossier créé depuis l\'étude')}
function studyJR(){
 const s=S.study;if(!s){toast('Lance d\'abord une étude');return}
 S.jr.dom='route';S.jr.result=null;switchView('jr');
 setTimeout(function(){
  const a=$('#jrVehMarque'),b=$('#jrVehMotor'),t=$('#jrTitre'),f=$('#jrFaits');
  if(a)a.value=s.form.brand+' '+s.form.model;
  if(b)b.value=s.form.engine+(s.form.ch?' '+s.form.ch+' ch':'');
  if(t)t.value=s.form.brand+' '+s.form.model+' — '+s.top.map(function(x){return x.t}).slice(0,2).join(' / ');
  if(f)f.value=(s.form.ctx||'')+' '+(s.form.constats.join(', '))+' '+(s.top.length?'Causes corrélées : '+s.top.map(function(x){return x.t}).join(' ; '):'')},80)}
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
 '<div class="row"><button class="pri" data-ps="studyOne" data-k="'+esc(k.id)+'">🧠 Étudier ce cas</button><button data-act="closeModal">Fermer</button></div>')}
/* ---------- vues ---------- */
window.doSearch=function(){if(isSearch())runSearch()};
window.scoreKB=function(inp){
 try{const v={brand:inp.marque,model:inp.modele,engine:inp.motor,ch:S.vehicle&&S.vehicle.ch,fuel:inp.energie,y:S.vehicle&&S.vehicle.y};
  const c=KFCorr.correlate(v,{strict:true,readDtc:inp.dtc||[]});S.lastCorr=c;return c.faults.slice(0,8)}
 catch(e){log('error','scoreKB '+e.message);return[]}};
window.runStudy=function(){runStudySafe()};
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
 $('#view').innerHTML='<div class="card"><h2>🧠 Étude croisée — corrélation motorisation stricte</h2><div id="selStudy"></div></div>'+
 '<div class="card"><h2>📋 Contexte & constatations</h2><div class="grid g3">'+
 '<div><label>Vendeur</label><select id="stVendeur"><option value="pro">Professionnel</option><option value="part">Particulier</option></select></div>'+
 '<div><label>Date d\'achat</label><input id="stAchat" type="date"></div>'+
 '<div><label>Neuf/occasion</label><select id="stNeuf"><option value="occasion">Occasion</option><option value="neuf">Neuf</option></select></div>'+
 '<div><label>Prix €</label><input id="stPrix" type="number"></div></div>'+
 '<label>Constatations</label><div class="constats" id="stConstats">'+CONSTATS.map(function(c){return '<label><input type="checkbox" value="'+c+'">'+c+'</label>'}).join('')+'</div>'+
 '<label>DTC lus sur le véhicule</label><input id="stDtc" value="'+(S.dtc||[]).join(' ')+'" placeholder="P0016 P0400…">'+
 '<label>Contexte</label><textarea id="stCtx" placeholder="Historique, interventions, dissimulation suspectée…"></textarea>'+
 '<div class="row"><button class="pri" data-ps="study">⚙️ Lancer l\'étude corrélée</button><button data-ps="widen">🧪 Élargir</button></div></div>'+
 '<div id="vehPanel"></div><div id="stResult"></div>';
 mountSelector($('#selStudy'));syncStudy();paint()};
const _home=window.renderHome;
window.renderHome=function(){_home();const v=$('#view');const c=currentCorr();if(!v||!c)return;
 v.insertAdjacentHTML('afterbegin','<div class="card"><h2>🚗 Véhicule courant</h2>'+
 '<p>'+esc(c.sig.brand)+' '+esc(c.sig.model||'')+' '+esc(c.sig.engine||'')+(c.sig.ch?' · <b class="pw">'+c.sig.ch+' ch</b>':'')+'</p>'+
 '<p class="mut">'+c.faults.length+' panne(s) · '+c.dtc.length+' DTC · '+c.recalls.length+' rappel(s) · '+c.tsb.length+' TSB</p>'+
 '<div class="row"><button class="pri" data-act="nav" data-k="etude">🧠 Étudier</button><button data-act="nav" data-k="recherche">🔎 Recherche</button><button class="jr" data-act="nav" data-k="jr">⚖️ JusteRepère</button></div></div>')};
/* ---------- dispatcher ---------- */
document.addEventListener('change',function(e){const p=e.target.dataset.ps;if(!p)return;
 if(p==='sys'||p==='grav'){PF[p]=e.target.value;paint()}});
document.addEventListener('input',function(e){if(e.target.dataset.ps==='q'){PF.q=e.target.value;paint()}});
document.addEventListener('click',async function(e){
 const b=e.target.closest('[data-ps]');if(!b)return;const p=b.dataset.ps,k=b.dataset.k;
 if(p==='study'){e.preventDefault();closeModal();if(S.view!=='etude'){switchView('etude');setTimeout(function(){runStudySafe()},80)}else runStudySafe();return}
 if(p==='studyOne'){e.preventDefault();closeModal();if(S.view!=='etude'){switchView('etude');setTimeout(function(){runStudySafe(k)},80)}else runStudySafe(k);return}
 if(p==='studyPdf'){studyPdf();return}
 if(p==='studyJson'){if(S.study)download('etude-correlee-'+Date.now()+'.json',S.study);else toast('Lance une étude');return}
 if(p==='studyDoss'){studyDoss();return}
 if(p==='studyJR'){studyJR();return}
 if(p==='run'){paint();toast('🔎 Corrélation actualisée');return}
 if(p==='widen'){PF.strict=false;PF.sys='';PF.grav='';PF.fire=false;PF.q='';const q=$('#srQ');if(q)q.value='';paint();toast('🧪 Mode ingénieur élargi');return}
 if(p==='strict'||p==='fire'||p==='rappel'||p==='tsb'||p==='dtc'){PF[p]=!PF[p];paint();return}
 if(p==='clearQ'){PF.q='';PF.sys='';PF.grav='';PF.fire=false;PF.strict=true;const q=$('#srQ');if(q)q.value='';paint();return}
 if(p==='fiche'){fiche(k);return}
 if(p==='injectDtc'){const c=currentCorr();if(!c)return;S.dtc=c.dtc.map(function(d){return d.code});
  if(S.view!=='etude'){switchView('etude');setTimeout(function(){const t=$('#stDtc');if(t)t.value=S.dtc.join(' ')},80)}
  else{const t=$('#stDtc');if(t)t.value=S.dtc.join(' ')}
  toast('🔢 '+S.dtc.length+' DTC corrélés injectés');return}
 if(p==='copyDtc'){const c=currentCorr();if(!c)return;
  try{await navigator.clipboard.writeText(c.dtc.map(function(d){return d.code}).join(' '));toast('📋 DTC copiés')}catch(x){toast('Copie impossible')}return}
 if(p==='toJR'){const kb=KBall().find(function(x){return x.id===k});S.jr.dom='route';S.jr.result=null;switchView('jr');
  setTimeout(function(){const a=$('#jrVehMarque'),b2=$('#jrVehMotor'),f=$('#jrFaits');
   if(a)a.value=S.vehicle?S.vehicle.brand+' '+S.vehicle.model:'';
   if(b2)b2.value=S.vehicle?S.vehicle.engine:'';
   if(f)f.value=kb?kb.t+' : '+kb.mec:''},80);return}
 if(p==='toAD'){const kb=KBall().find(function(x){return x.id===k});switchView('droitsmart');
  setTimeout(function(){const t=$('#adText');if(t)t.value=(S.vehicle?S.vehicle.brand+' '+S.vehicle.model+' '+S.vehicle.engine+' : ':'')+(kb?kb.t+' — '+kb.mec:'')},80);return}});
window.KFPredictive={brands:brands,models:models,engines:engines,correlate:currentCorr,runSearch:runSearch,study:runStudySafe};
})();
