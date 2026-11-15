/* KEV FUSION 2026 — predictive.js v4.2.0 · sélecteur prédictif + corrélation précise (KFCorr) */
(function(){
'use strict';
if(typeof KBall!=='function'||typeof VEHDB==='undefined'||!window.KFCorr){console.warn('predictive.js: prérequis manquants');return}
S.vehicle=null;S.yearFilter=null;
const WIN=KFCorr.WIN;
const PF={sys:'',grav:'',q:'',fire:false,rappel:true,tsb:true,dtc:true,strict:true};
const ALIAS={hdi:['bluehdi'],bluehdi:['hdi'],tfsi:['tsi'],tsi:['tfsi'],thp:['puretech'],puretech:['thp'],
 hybrid:['hybride','e-tech','e:hev','phev'],hybride:['hybrid','e-tech','e:hev','phev'],electrique:['electric','ev','e-'],electric:['electrique','ev','e-']};
const norm=KFCorr.norm;
function matchLabel(label,q){const t=norm(q).split(' ').filter(Boolean);if(!t.length)return true;const L=norm(label);
 return t.every(k=>L.includes(k)||(ALIAS[k]||[]).some(a=>L.includes(a)))}
function overlap(y,a,b){return y&&y[0]<=b&&y[1]>=a}
function inWin(e){if(!e.y)return true;const Y=S.yearFilter;return Y?overlap(e.y,Y,Y):overlap(e.y,WIN[0],WIN[1])}
function brands(){return[...new Set([...Object.keys(VEHDB),...Object.keys(VEHall())])].sort()}
function models(b){if(!b)return[];const s=new Set();
 Object.keys(VEHDB[b]||{}).forEach(m=>{if((VEHDB[b][m]||[]).some(inWin))s.add(m)});
 Object.keys(VEHall()[b]||{}).forEach(m=>{if((VEHall()[b][m]||[]).length)s.add(m)});return[...s].sort()}
function engines(b,m){if(!b||!m)return[];const out=[],seen=new Set();
 (VEHDB[b]&&VEHDB[b][m]||[]).forEach(e=>{if(inWin(e)&&!seen.has(e.label)){seen.add(e.label);out.push(e)}});
 (VEHall()[b]&&VEHall()[b][m]||[]).forEach(x=>{if(!seen.has(x)){seen.add(x);out.push({label:x,ch:null,fuel:'',y:null})}});return out}
function kw(ch){return ch?Math.round(ch*0.7355):null}
function makeCombo(mount,cfg){
 mount.innerHTML='<label>'+esc(cfg.label)+'</label><div class="cbx"><input class="cbx-in" autocomplete="off" placeholder="'+esc(cfg.placeholder||'')+'" value="'+esc(cfg.value||'')+'"><button type="button" class="cbx-tgl" tabindex="-1">▾</button><div class="cbx-list hid"></div></div>';
 const wrap=mount.querySelector('.cbx'),inp=mount.querySelector('.cbx-in'),list=mount.querySelector('.cbx-list'),tgl=mount.querySelector('.cbx-tgl');
 let items=[],active=-1,open=false;
 function renderList(){items=cfg.options().filter(o=>matchLabel(o.label,inp.value));active=-1;
  list.innerHTML=items.length?items.map((o,i)=>'<div class="cbx-opt" data-i="'+i+'"><span>'+esc(o.label)+'</span>'+(o.sub?'<span class="pw">'+esc(o.sub)+'</span>':'')+'</div>').join(''):'<div class="cbx-opt mut">'+esc(cfg.empty||'Aucun résultat')+'</div>'}
 function openList(){open=true;renderList();list.classList.remove('hid')}
 function closeList(){open=false;list.classList.add('hid')}
 function hl(){[...list.children].forEach((c,i)=>c.classList.toggle('act',i===active));const a=list.children[active];if(a&&a.scrollIntoView)a.scrollIntoView({block:'nearest'})}
 function pick(o){inp.value=o.label;closeList();cfg.onPick(o)}
 inp.addEventListener('focus',openList);
 inp.addEventListener('input',()=>{open?renderList():openList()});
 inp.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){e.preventDefault();if(!open)openList();active=Math.min(active+1,items.length-1);hl()}
  else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0);hl()}
  else if(e.key==='Enter'){e.preventDefault();if(active>=0&&items[active])pick(items[active]);else if(items.length===1)pick(items[0])}
  else if(e.key==='Escape')closeList()});
 inp.addEventListener('blur',()=>setTimeout(()=>{if(!wrap.contains(document.activeElement))closeList()},120));
 tgl.addEventListener('click',()=>{open?closeList():openList();inp.focus()});
 list.addEventListener('mousedown',e=>e.preventDefault());
 list.addEventListener('click',e=>{const o=e.target.closest('.cbx-opt');if(!o||o.classList.contains('mut'))return;pick(items[+o.dataset.i])});
 return{refresh(){if(open)renderList()},setValue(v){inp.value=v},focus(){inp.focus()}}
}
let cB,cM,cE;
function mountSelector(host){
 host.innerHTML='<div class="grid g3"><div id="cbBrand"></div><div id="cbModel"></div><div id="cbEngine"></div></div>'+
 '<div class="row" style="margin-top:8px"><div style="max-width:180px"><label>Année (2015–2027)</label><select id="pfYear"><option value="">Toutes 2015–2027</option>'+
 Array.from({length:WIN[1]-WIN[0]+1},(_,i)=>WIN[0]+i).map(y=>'<option '+(S.yearFilter===y?'selected':'')+'>'+y+'</option>').join('')+'</select></div><div id="vehRead" class="vehread" style="flex:1"></div></div>';
 cB=makeCombo($('#cbBrand'),{label:'Marque',placeholder:'Tape une marque…',value:S.vehicle?S.vehicle.brand:'',empty:'Aucune marque',
  options:()=>brands().map(b=>({label:b})),
  onPick:o=>{S.vehicle={brand:o.label,model:'',engine:'',ch:null,fuel:'',y:null};cM.setValue('');cE.setValue('');cM.refresh();cE.refresh();readout();vehChanged();cM.focus()}});
 cM=makeCombo($('#cbModel'),{label:'Modèle réel (2015–2027)',placeholder:S.vehicle&&S.vehicle.brand?'Modèles '+S.vehicle.brand:'Choisis la marque',value:S.vehicle?S.vehicle.model:'',empty:'Choisis la marque',
  options:()=>models(S.vehicle?S.vehicle.brand:'').map(m=>({label:m})),
  onPick:o=>{S.vehicle.model=o.label;S.vehicle.engine='';S.vehicle.ch=null;cE.setValue('');cE.refresh();readout();vehChanged();cE.focus()}});
 cE=makeCombo($('#cbEngine'),{label:'Motorisation + puissance réelle',placeholder:S.vehicle&&S.vehicle.model?'Motorisations '+S.vehicle.model:'Choisis le modèle',value:S.vehicle?S.vehicle.engine:'',empty:'Choisis le modèle',
  options:()=>engines(S.vehicle?S.vehicle.brand:'',S.vehicle?S.vehicle.model:'').map(e=>({label:e.label,sub:e.ch?e.ch+' ch':'',_e:e})),
  onPick:o=>{const e=o._e||{label:o.label,ch:null};S.vehicle.engine=e.label;S.vehicle.ch=e.ch;S.vehicle.fuel=e.fuel;S.vehicle.y=e.y;readout();vehChanged()}});
 $('#pfYear').addEventListener('change',e=>{S.yearFilter=e.target.value?+e.target.value:null;
  if(S.vehicle){if(S.vehicle.model&&models(S.vehicle.brand).indexOf(S.vehicle.model)<0){S.vehicle.model='';S.vehicle.engine='';cM.setValue('');cE.setValue('')}
   if(S.vehicle.engine&&!engines(S.vehicle.brand,S.vehicle.model).some(x=>x.label===S.vehicle.engine)){S.vehicle.engine='';S.vehicle.ch=null;cE.setValue('')}}
  cM.refresh();cE.refresh();readout();vehChanged()});
 readout()}
function readout(){const v=S.vehicle,el=$('#vehRead');if(!el)return;
 if(!v||!v.brand){el.innerHTML='<span class="mut">Marque → modèle → motorisation : corrélation réelle et précise.</span>';return}
 const sig=KFCorr.signature(v);
 el.innerHTML='🚗 <b>'+esc(v.brand)+'</b> '+esc(v.model||'')+' '+esc(v.engine||'')+(v.ch?' · <b class="pw">'+v.ch+' ch</b> ('+kw(v.ch)+' kW)':'')+
 ' · '+esc(sig.fuelGroup.toUpperCase())+' · famille <b>'+esc(sig.familyLabel)+'</b>'+(v.y?' · '+v.y[0]+'–'+v.y[1]:'')}
function syncStudy(){const v=S.vehicle||{};const set=(id,val)=>{const e=$('#'+id);if(e)e.value=val||''};
 set('stMarque',v.brand);set('stModele',v.model);set('stMotor',v.engine);set('stAnnee',S.yearFilter||(v.y?v.y[1]:''));set('stEnergie',v.fuel||'Essence');
 S.veh={marque:v.brand||'',modele:v.model||'',motor:v.engine||'',annee:S.yearFilter||(v.y?v.y[1]:''),vin:S.veh?S.veh.vin:''}}
function vehChanged(){syncStudy();renderVehPanel();document.dispatchEvent(new CustomEvent('kf:vehicle',{detail:S.vehicle}))}
function currentCorr(){const v=S.vehicle;if(!v)return null;
 return KFCorr.correlate(v,{strict:PF.strict,readDtc:S.dtc||[]})}
function filterBar(){const c=currentCorr();const sys=[...new Set((c?c.faults:[]).map(k=>k.s))];
 return '<div class="row" style="margin-bottom:8px"><button class="chipf '+(PF.strict?'on':'')+'" data-ps="strict">🎯 Mode strict (motorisation/modèle)</button>'+
 '<span class="mut">'+(PF.strict?'Seules les pannes liées à la motorisation, au modèle ou à l\'énergie réelle sont remontées.':'Mode élargi : ajoute les pannes génériques compatibles avec les systèmes du véhicule.')+'</span></div>'+
 '<div class="grid g3"><div><label>Système</label><select data-ps="sys"><option value="">Tous</option>'+sys.map(s=>'<option '+(PF.sys===s?'selected':'')+'>'+esc(s)+'</option>').join('')+'</select></div>'+
 '<div><label>Gravité</label><select data-ps="grav"><option value="">Toutes</option><option '+(PF.grav==='Critique'?'selected':'')+'>Critique</option><option '+(PF.grav==='Élevé'?'selected':'')+'>Élevé</option><option '+(PF.grav==='Modéré'?'selected':'')+'>Modéré</option></select></div>'+
 '<div><label>Recherche</label><input data-ps="q" value="'+esc(PF.q)+'" placeholder="DTC, composant, mot-clé…"></div></div>'+
 '<div class="row"><button class="chipf '+(PF.fire?'on':'')+'" data-ps="fire">🔥 Incendie</button><button class="chipf '+(PF.dtc?'on':'')+'" data-ps="dtc">🔢 Codes défauts</button><button class="chipf '+(PF.rappel?'on':'')+'" data-ps="rappel">📣 Rappels</button><button class="chipf '+(PF.tsb?'on':'')+'" data-ps="tsb">🧰 TSB</button></div>'}
function renderVehPanel(){const host=$('#vehPanel');if(!host)return;const v=S.vehicle;
 if(!v||!v.brand){host.innerHTML='<div class="card mut">Sélectionne un véhicule pour lancer la corrélation.</div>';return}
 const c=currentCorr();let pan=c.faults;
 if(PF.sys)pan=pan.filter(k=>k.s===PF.sys);
 if(PF.grav)pan=pan.filter(k=>k.g===PF.grav);
 if(PF.fire)pan=pan.filter(k=>k.f);
 if(PF.q){const q=norm(PF.q);pan=pan.filter(k=>norm(k.t+' '+k.mec+' '+k.dtc.join(' ')+' '+k.s).includes(q))}
 const sig=c.sig;
 host.innerHTML='<div class="card"><h2>🧬 Signature technique du véhicule</h2><table class="kv">'+
 '<tr><td>Véhicule</td><td><b>'+esc(sig.brand)+' '+esc(sig.model)+'</b> '+esc(sig.engine)+'</td></tr>'+
 '<tr><td>Puissance réelle</td><td>'+(sig.ch?'<b class="pw">'+sig.ch+' ch</b> / '+sig.kw+' kW':'non précisée')+'</td></tr>'+
 '<tr><td>Cylindrée / énergie</td><td>'+esc(sig.disp||'—')+' · '+esc(sig.fuelGroup.toUpperCase())+'</td></tr>'+
 '<tr><td>Famille moteur</td><td><b>'+esc(sig.familyLabel)+'</b></td></tr>'+
 '<tr><td>Systèmes retenus</td><td class="mut">'+sig.systemList.length+' systèmes compatibles (les autres sont exclus)</td></tr>'+
 '<tr><td>Résultat corrélation</td><td><b>'+c.faults.length+' panne(s)</b> · '+c.dtc.length+' code(s) défaut · '+c.recalls.length+' rappel(s) · '+c.tsb.length+' TSB</td></tr></table></div>'+
 '<div class="card"><h2>🔗 Filtres de corrélation</h2>'+filterBar()+'</div>'+
 (PF.dtc?'<div class="card"><h2>🔢 Codes défauts (DTC) liés à ce véhicule — '+c.dtc.length+'</h2>'+
  (c.dtc.length?'<div class="row">'+c.dtc.map(d=>'<span class="badge b-dtc" title="'+esc(d.faults.join(' | '))+'">'+d.code+(d.read?' ✅ lu':'')+'</span>').join('')+'</div>'+
  '<p class="mut">Survole un code pour voir la ou les pannes associées. ✅ = code déjà lu sur le véhicule (OBD).</p>'+
  '<div class="row" style="margin-top:8px"><button data-ps="injectDtc">🧠 Injecter ces DTC dans l\'étude</button><button data-ps="copyDtc">📋 Copier les DTC</button></div>'
  :'<p class="mut">Aucun DTC corrélé.</p>')+'</div>':'')+
 '<div class="card"><h2>🔧 Pannes connues corrélées ('+pan.length+')</h2>'+(pan.length?pan.map(k=>
  '<div class="card"><h3>'+esc(k.t)+'</h3>'+
  '<div><span class="badge '+(k.relevance.indexOf('DIRECT')===0?'b-crit':k.relevance.indexOf('FORT')===0?'b-elev':'b-mod')+'">'+esc(k.relevance)+'</span>'+badges(k)+
  '<span class="badge">'+esc(k.s)+'</span></div>'+
  '<p class="mut"><b>Corrélation :</b> '+esc(k.why.join(' · '))+' · score '+k.sc+'</p>'+
  '<p class="mut">'+esc(k.mec)+'</p>'+(k.ch?'<p class="b-fire">🔥 '+esc(k.ch)+'</p>':'')+
  '<p class="mut"><b>Preuves :</b> '+k.prv.map(esc).join(' · ')+' — <b>Tests :</b> '+k.tst.map(esc).join(' · ')+'</p>'+
  '<div class="row"><button data-act="studyFrom" data-k="'+k.id+'">🧠 Étudier</button><button data-ps="toJR" data-k="'+k.id+'">⚖️ JusteRepère</button><button data-ps="toAD" data-k="'+k.id+'">🧠 Auto-Droit</button></div></div>').join('')
  :'<p class="mut">Aucune panne ne correspond à cette motorisation avec ces filtres. Désactive le mode strict pour élargir aux pannes génériques compatibles.</p>')+'</div>'+
 (PF.rappel?'<div class="card"><h2>📣 Campagnes de rappel corrélées ('+c.recalls.length+')</h2>'+(c.recalls.length?c.recalls.map(r=>
  '<div class="card"><b>'+(r.fire?'🔥 ':'')+esc(r.t)+'</b> <span class="badge">'+esc(r.src)+'</span><p class="mut">'+esc(r.risk)+'</p>'+
  '<p class="mut">'+r.y[0]+'–'+r.y[1]+' · '+r.dtc.join(', ')+' · '+esc(r.law.join(', '))+'</p></div>').join(''):'<p class="mut">Aucun rappel pour ce modèle/motorisation/année.</p>')+'</div>':'')+
 (PF.tsb?'<div class="card"><h2>🧰 Bulletins techniques TSB corrélés ('+c.tsb.length+')</h2>'+(c.tsb.length?c.tsb.map(t=>
  '<div class="card"><b>'+esc(t.ref)+'</b> <span class="badge '+(t.g==='Critique'?'b-crit':'b-elev')+'">'+t.g+'</span><p>'+esc(t.s)+'</p>'+
  '<p class="mut">'+esc(t.sys)+' · '+t.dtc.join(', ')+' · '+t.y[0]+'–'+t.y[1]+' · motorisations : '+esc(t.e.join(', '))+'</p></div>').join(''):'<p class="mut">Aucun TSB pour cette motorisation.</p>')+'</div>':'')+
 '<div class="card"><h2>🔀 Interactions croisées</h2><div class="row"><button class="pri" data-act="nav" data-k="etude">🧠 Étude croisée</button><button class="jr" data-act="nav" data-k="jr">⚖️ JusteRepère</button><button data-act="nav" data-k="droitsmart">🧠 Auto-Droit</button><button data-act="nav" data-k="vin">🔎 VIN</button><button data-act="nav" data-k="formation">🎓 Formation</button><button data-act="nav" data-k="photos">📷 Photos</button></div></div>'}
/* ---- Étude croisée : corrélation précise injectée dans le moteur d'étude ---- */
window.scoreKB=function(inp){
 const v={brand:inp.marque,model:inp.modele,engine:inp.motor,ch:S.vehicle&&S.vehicle.ch,fuel:inp.energie,y:S.vehicle&&S.vehicle.y};
 const c=KFCorr.correlate(v,{strict:true,readDtc:inp.dtc||[]});
 S.lastCorr=c;
 return c.faults.slice(0,8)};
window.renderStudy=function(){
 $('#view').innerHTML='<div class="card"><h2>🧠 Étude croisée — corrélation motorisation précise</h2><div id="selStudy"></div></div>'+
 '<div class="card"><h2>📋 Contexte & constatations</h2><div class="grid g3">'+
 '<div><label>Vendeur</label><select id="stVendeur"><option value="pro">Professionnel</option><option value="part">Particulier</option></select></div>'+
 '<div><label>Date d\'achat</label><input id="stAchat" type="date"></div>'+
 '<div><label>Neuf/occasion</label><select id="stNeuf"><option value="occasion">Occasion</option><option value="neuf">Neuf</option></select></div>'+
 '<div><label>Prix €</label><input id="stPrix" type="number"></div>'+
 '<input type="hidden" id="stMarque"><input type="hidden" id="stModele"><input type="hidden" id="stMotor"><input type="hidden" id="stAnnee"><input type="hidden" id="stEnergie"></div>'+
 '<label>Constatations</label><div class="constats" id="stConstats">'+CONSTATS.map(c=>'<label><input type="checkbox" value="'+c+'">'+c+'</label>').join('')+'</div>'+
 '<label>DTC lus sur le véhicule</label><input id="stDtc" value="'+S.dtc.join(' ')+'" placeholder="P0016 P0400…"><label>Contexte</label><textarea id="stCtx"></textarea>'+
 '<button class="pri" data-act="study">⚙️ Lancer l\'étude corrélée</button></div><div id="vehPanel"></div><div id="stResult"></div>';
 mountSelector($('#selStudy'));syncStudy();renderVehPanel()};
window.renderSearch=function(){
 $('#view').innerHTML='<div class="card"><h2>🔎 Recherche prédictive unifiée</h2><div id="selSearch"></div>'+
 '<label>Recherche libre</label><input id="q" placeholder="EGR, courroie, P0016, incendie, vice caché…"><button class="pri" data-act="search">Rechercher</button></div>'+
 '<div id="vehPanel"></div><div id="qRes"></div>';
 mountSelector($('#selSearch'));renderVehPanel();doSearch()};
const _home=window.renderHome;
window.renderHome=function(){_home();const v=$('#view');if(!v||!S.vehicle||!S.vehicle.brand)return;
 const c=KFCorr.correlate(S.vehicle,{strict:true,readDtc:S.dtc||[]});
 v.insertAdjacentHTML('afterbegin','<div class="card"><h2>🚗 Véhicule courant</h2><p>'+esc(S.vehicle.brand)+' '+esc(S.vehicle.model||'')+' '+esc(S.vehicle.engine||'')+(S.vehicle.ch?' · <b class="pw">'+S.vehicle.ch+' ch</b>':'')+
 '</p><p class="mut">'+c.faults.length+' panne(s) corrélée(s) · '+c.dtc.length+' DTC · '+c.recalls.length+' rappel(s) · '+c.tsb.length+' TSB</p>'+
 '<div class="row"><button class="pri" data-act="nav" data-k="etude">🧠 Étudier</button><button data-act="nav" data-k="recherche">🔎 Recherche</button><button class="jr" data-act="nav" data-k="jr">⚖️ JusteRepère</button></div></div>')};
/* ---- dispatcher ---- */
document.addEventListener('change',e=>{const p=e.target.dataset.ps;if(!p)return;if(p==='sys'||p==='grav')PF[p]=e.target.value;renderVehPanel()});
document.addEventListener('input',e=>{if(e.target.dataset.ps==='q'){PF.q=e.target.value;renderVehPanel()}});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-ps]');if(!b)return;const p=b.dataset.ps,k=b.dataset.k;
 if(p==='strict'||p==='fire'||p==='rappel'||p==='tsb'||p==='dtc'){PF[p]=!PF[p];renderVehPanel();return}
 if(p==='injectDtc'){const c=currentCorr();S.dtc=c.dtc.map(d=>d.code);switchView('etude');setTimeout(()=>{const t=$('#stDtc');if(t)t.value=S.dtc.join(' ')},60);toast('🔢 '+S.dtc.length+' DTC corrélés injectés');return}
 if(p==='copyDtc'){const c=currentCorr();try{await navigator.clipboard.writeText(c.dtc.map(d=>d.code).join(' '));toast('📋 DTC copiés')}catch(x){toast('Copie impossible')}return}
 if(p==='toJR'){const kb=KBall().find(x=>x.id===k);S.jr.dom='route';S.jr.result=null;switchView('jr');setTimeout(()=>{if($('#jrVehMarque'))$('#jrVehMarque').value=S.vehicle?S.vehicle.brand+' '+S.vehicle.model:'';if($('#jrVehMotor'))$('#jrVehMotor').value=S.vehicle?S.vehicle.engine:'';if($('#jrFaits'))$('#jrFaits').value=kb?kb.t+' : '+kb.mec:''},60);return}
 if(p==='toAD'){const kb=KBall().find(x=>x.id===k);switchView('droitsmart');setTimeout(()=>{const t=$('#adText');if(t)t.value=(S.vehicle?S.vehicle.brand+' '+S.vehicle.model+' '+S.vehicle.engine+' : ':'')+(kb?kb.t+' — '+kb.mec:'')},60);return}
});
window.KFPredictive={brands,models,engines,matchLabel,correlate:currentCorr};
})();
