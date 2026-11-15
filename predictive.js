/* KEV FUSION 2026 — predictive.js v4.1.0
   Sélecteur prédictif fiable : marque → modèle réel (2015–2027) → motorisation + puissance réelle.
   Matching par tokens + alias (1.5 HDi ≡ 1.5 BlueHDi), cascade sans re-mount, pannes/rappels/TSB auto.
   Les bases techniques (data.js) et juridiques (LEGAL/JR) sont conservées et réutilisées telles quelles. */
(function(){
'use strict';
if(typeof KBall!=='function'||typeof VEHDB==='undefined'){console.warn('predictive.js: prérequis manquants');return}
S.vehicle=null;S.yearFilter=null;
const WIN=[2015,2027];
const PF={sys:'',grav:'',energie:'',q:'',fire:false,rappel:true,tsb:true,dtc:false};
const ALIAS={hdi:['bluehdi'],bluehdi:['hdi'],tfsi:['tsi'],tsi:['tfsi'],thp:['puretech'],puretech:['thp'],
 ecoboost:['ecoboost'],tdi:['tdi'],dci:['dci'],cdti:['cdti'],multijet:['mjet','jtd'],jtd:['multijet'],
 skyactiv:['skyactiv'],hybrid:['hybride','e-tech','e:hev','phev'],hybride:['hybrid','e-tech','e:hev','phev'],
 electrique:['electric','ev','e-'],electric:['electrique','ev','e-']};
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function tokens(q){return norm(q).split(' ').filter(Boolean)}
function matchLabel(label,q){const t=tokens(q);if(!t.length)return true;const L=norm(label);
 return t.every(k=>L.includes(k)||(ALIAS[k]||[]).some(a=>L.includes(a)))}
function overlap(y,a,b){return y&&y[0]<=b&&y[1]>=a}
function inWin(e){if(!e.y)return true;const Y=S.yearFilter;return Y?overlap(e.y,Y,Y):overlap(e.y,WIN[0],WIN[1])}
function brands(){return[...new Set([...Object.keys(VEHDB),...Object.keys(VEHall())])].sort()}
function models(b){if(!b)return[];const set=new Set();
 Object.keys(VEHDB[b]||{}).forEach(m=>{if((VEHDB[b][m]||[]).some(inWin))set.add(m)});
 Object.keys(VEHall()[b]||{}).forEach(m=>{if((VEHall()[b][m]||[]).length)set.add(m)});
 return[...set].sort()}
function engines(b,m){if(!b||!m)return[];const out=[],seen=new Set();
 (VEHDB[b]&&VEHDB[b][m]||[]).forEach(e=>{if(inWin(e)&&!seen.has(e.label)){seen.add(e.label);out.push(e)}});
 (VEHall()[b]&&VEHall()[b][m]||[]).forEach(s=>{if(!seen.has(s)){seen.add(s);out.push({label:s,ch:null,fuel:'',y:null})}});
 return out}
function kw(ch){return ch?Math.round(ch*0.7355):null}
/* ---- combobox robuste (pas de re-mount, focus conservé) ---- */
function makeCombo(mount,cfg){
 mount.innerHTML='<label>'+esc(cfg.label)+'</label><div class="cbx"><input class="cbx-in" autocomplete="off" placeholder="'+esc(cfg.placeholder||'')+'" value="'+esc(cfg.value||'')+'"><button type="button" class="cbx-tgl" tabindex="-1">▾</button><div class="cbx-list hid"></div></div>';
 const wrap=mount.querySelector('.cbx'),inp=mount.querySelector('.cbx-in'),list=mount.querySelector('.cbx-list'),tgl=mount.querySelector('.cbx-tgl');
 let items=[],active=-1,open=false;
 function renderList(){const q=inp.value;items=cfg.options().filter(o=>matchLabel(o.label,q));active=-1;
  list.innerHTML=items.length?items.map((o,i)=>'<div class="cbx-opt" data-i="'+i+'"><span>'+esc(o.label)+'</span>'+(o.sub?'<span class="pw">'+esc(o.sub)+'</span>':'')+'</div>').join(''):'<div class="cbx-opt mut">'+esc(cfg.empty||'Aucun résultat')+'</div>'}
 function openList(){open=true;renderList();list.classList.remove('hid')}
 function closeList(){open=false;list.classList.add('hid')}
 function hl(){[...list.children].forEach((c,i)=>c.classList.toggle('act',i===active));const a=list.children[active];if(a&&a.scrollIntoView)a.scrollIntoView({block:'nearest'})}
 function pick(o){inp.value=o.label;closeList();cfg.onPick(o)}
 inp.addEventListener('focus',openList);
 inp.addEventListener('input',()=>{if(!open)openList();else renderList();if(cfg.onType)cfg.onType(inp.value)});
 inp.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){e.preventDefault();if(!open)openList();active=Math.min(active+1,items.length-1);hl()}
  else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0);hl()}
  else if(e.key==='Enter'){e.preventDefault();if(active>=0&&items[active])pick(items[active]);else if(items.length===1)pick(items[0])}
  else if(e.key==='Escape')closeList()});
 inp.addEventListener('blur',()=>setTimeout(()=>{if(!wrap.contains(document.activeElement))closeList()},120));
 tgl.addEventListener('click',()=>{open?closeList():openList();inp.focus()});
 list.addEventListener('mousedown',e=>e.preventDefault());
 list.addEventListener('click',e=>{const o=e.target.closest('.cbx-opt');if(!o||o.classList.contains('mut'))return;pick(items[+o.dataset.i])});
 return{refresh(){if(open)renderList()},setValue(v){inp.value=v},focus(){inp.focus()},get value(){return inp.value}};
}
/* ---- corrélation ---- */
function vehPannes(v){if(!v||!v.brand)return[];return KBall().map(k=>{let sc=0;const why=[];
 if(k.b.includes(v.brand)||k.b.includes('*')){sc+=3;why.push('marque')}
 if(v.model&&norm(k.t+' '+k.mec).includes(norm(v.model))){sc+=3;why.push('modèle')}
 if(v.engine){const e=norm(v.engine).split(' ')[0];if(norm(k.t+' '+k.mec).includes(e)){sc+=2;why.push('motorisation')}}
 return Object.assign({},k,{sc,why})}).filter(k=>k.sc>0).sort((a,b)=>b.sc-a.sc)}
function vehRappels(v){if(!v||!v.brand)return[];return Rall().filter(r=>(r.b.includes('*')||r.b.includes(v.brand))&&(!v.model||r.m.includes('*')||r.m.some(m=>norm(v.model).includes(norm(m))||norm(m).includes(norm(v.model)))))}
function vehTSB(v){if(!v||!v.brand)return[];return TSBDB.filter(t=>t.b.includes(v.brand)&&(!v.model||t.m.some(m=>norm(v.model).includes(norm(m))))&&(!v.engine||t.e.some(e=>norm(v.engine).includes(norm(e).split(' ')[0]))))}
/* ---- sélecteur ---- */
let cB,cM,cE;
function mountSelector(host){
 host.innerHTML='<div class="grid g3"><div id="cbBrand"></div><div id="cbModel"></div><div id="cbEngine"></div></div>'+
  '<div class="row" style="margin-top:8px"><div style="max-width:180px"><label>Année (2015–2027)</label><select id="pfYear"><option value="">Toutes 2015–2027</option>'+
  Array.from({length:WIN[1]-WIN[0]+1},(_,i)=>WIN[0]+i).map(y=>'<option '+(S.yearFilter===y?'selected':'')+'>'+y+'</option>').join('')+'</select></div><div id="vehRead" class="vehread" style="flex:1"></div></div>';
 cB=makeCombo($('#cbBrand'),{label:'Marque',placeholder:'Tape une marque…',value:S.vehicle?S.vehicle.brand:'',empty:'Aucune marque',
  options:()=>brands().map(b=>({label:b})),
  onPick:o=>{S.vehicle={brand:o.label,model:'',engine:'',ch:null,fuel:'',y:null};cM.setValue('');cE.setValue('');cM.refresh();cE.refresh();readout();vehChanged();cM.focus()}});
 cM=makeCombo($('#cbModel'),{label:'Modèle (réel 2015–2027)',placeholder:S.vehicle&&S.vehicle.brand?'Modèles '+S.vehicle.brand:'Choisis la marque',value:S.vehicle?S.vehicle.model:'',empty:'Choisis la marque',
  options:()=>models(S.vehicle?S.vehicle.brand:'').map(m=>({label:m})),
  onPick:o=>{S.vehicle.model=o.label;S.vehicle.engine='';S.vehicle.ch=null;cE.setValue('');cE.refresh();readout();vehChanged();cE.focus()}});
 cE=makeCombo($('#cbEngine'),{label:'Motorisation + puissance réelle',placeholder:S.vehicle&&S.vehicle.model?'Motorisations '+S.vehicle.model:'Choisis le modèle',value:S.vehicle?S.vehicle.engine:'',empty:'Choisis le modèle',
  options:()=>engines(S.vehicle?S.vehicle.brand:'',S.vehicle?S.vehicle.model:'').map(e=>({label:e.label,sub:e.ch?e.ch+' ch':'',_e:e})),
  onPick:o=>{const e=o._e||{label:o.label,ch:null};S.vehicle.engine=e.label;S.vehicle.ch=e.ch;S.vehicle.fuel=e.fuel;S.vehicle.y=e.y;readout();vehChanged()}});
 $('#pfYear').addEventListener('change',e=>{S.yearFilter=e.target.value?+e.target.value:null;
  if(S.vehicle){if(S.vehicle.model&&!models(S.vehicle.brand).includes(S.vehicle.model)){S.vehicle.model='';S.vehicle.engine='';cM.setValue('');cE.setValue('')}
   if(S.vehicle.engine&&!engines(S.vehicle.brand,S.vehicle.model).some(x=>x.label===S.vehicle.engine)){S.vehicle.engine='';S.vehicle.ch=null;cE.setValue('')}}
  cM.refresh();cE.refresh();readout();vehChanged()});
 readout();
}
function readout(){const v=S.vehicle;const el=$('#vehRead');if(!el)return;
 if(!v||!v.brand){el.innerHTML='<span class="mut">Marque → modèle → motorisation pour la corrélation réelle (2015–2027).</span>';return}
 const p=v.ch?(' · <b class="pw">'+v.ch+' ch</b> ('+kw(v.ch)+' kW)'):'';
 el.innerHTML='🚗 <b>'+esc(v.brand)+'</b> '+esc(v.model||'')+' '+esc(v.engine||'')+p+(v.fuel?' · '+esc(v.fuel):'')+(v.y?' · '+v.y[0]+'–'+v.y[1]:'')}
function syncStudy(){const v=S.vehicle||{};const set=(id,val)=>{const e=$('#'+id);if(e)e.value=val||''};
 set('stMarque',v.brand);set('stModele',v.model);set('stMotor',v.engine);set('stAnnee',S.yearFilter||(v.y?v.y[1]:''));set('stEnergie',v.fuel||'Essence');
 S.veh={marque:v.brand||'',modele:v.model||'',motor:v.engine||'',annee:S.yearFilter||(v.y?v.y[1]:''),vin:S.veh?S.veh.vin:''}}
function vehChanged(){syncStudy();renderVehPanel();document.dispatchEvent(new CustomEvent('kf:vehicle',{detail:S.vehicle}))}
/* ---- filtres + panneau ---- */
function filterBar(){const sys=[...new Set(KBall().map(k=>k.s))];
 return '<div class="grid g3"><div><label>Système</label><select data-ps="sys"><option value="">Tous</option>'+sys.map(s=>'<option '+(PF.sys===s?'selected':'')+'>'+esc(s)+'</option>').join('')+'</select></div>'+
 '<div><label>Gravité</label><select data-ps="grav"><option value="">Toutes</option><option '+(PF.grav==='Critique'?'selected':'')+'>Critique</option><option '+(PF.grav==='Élevé'?'selected':'')+'>Élevé</option><option '+(PF.grav==='Modéré'?'selected':'')+'>Modéré</option></select></div>'+
 '<div><label>Énergie</label><select data-ps="energie"><option value="">Toutes</option><option '+(PF.energie==='Essence'?'selected':'')+'>Essence</option><option '+(PF.energie==='Diesel'?'selected':'')+'>Diesel</option><option '+(PF.energie==='Hybride'?'selected':'')+'>Hybride</option><option '+(PF.energie==='Électrique'?'selected':'')+'>Électrique</option></select></div></div>'+
 '<div class="row"><input data-ps="q" value="'+esc(PF.q)+'" placeholder="Filtrer (DTC, composant, mot-clé)…" style="max-width:280px">'+
 '<button class="chipf '+(PF.fire?'on':'')+'" data-ps="fire">🔥 Incendie</button><button class="chipf '+(PF.rappel?'on':'')+'" data-ps="rappel">📣 Rappels</button><button class="chipf '+(PF.tsb?'on':'')+'" data-ps="tsb">🧰 TSB</button><button class="chipf '+(PF.dtc?'on':'')+'" data-ps="dtc">🔢 Avec DTC</button></div>'}
function renderVehPanel(){const host=$('#vehPanel');if(!host)return;const v=S.vehicle;
 if(!v||!v.brand){host.innerHTML='<div class="card mut">Aucun véhicule sélectionné.</div>';return}
 let pan=vehPannes(v);
 if(PF.sys)pan=pan.filter(k=>k.s===PF.sys);
 if(PF.grav)pan=pan.filter(k=>k.g===PF.grav);
 if(PF.energie)pan=pan.filter(k=>norm(k.mec+' '+k.t).includes(norm(PF.energie)));
 if(PF.fire)pan=pan.filter(k=>k.f);
 if(PF.dtc)pan=pan.filter(k=>k.dtc.length);
 if(PF.q){const q=norm(PF.q);pan=pan.filter(k=>norm(k.t+' '+k.mec+' '+k.dtc.join(' ')+' '+k.s).includes(q))}
 const rap=vehRappels(v),tsb=vehTSB(v);
 host.innerHTML='<div class="card"><h2>🔗 Corrélation — '+esc(v.brand)+' '+esc(v.model||'')+' '+esc(v.engine||'')+'</h2>'+filterBar()+
 '<p class="mut">'+pan.length+' panne(s) · '+rap.length+' rappel(s) · '+tsb.length+' TSB</p></div>'+
 '<div class="card"><h2>🔧 Pannes connues ('+pan.length+')</h2>'+(pan.length?pan.map(k=>'<div class="card"><h3>'+esc(k.t)+'</h3><div>'+badges(k)+'</div><p class="mut">'+esc(k.mec)+'</p>'+(k.ch?'<p class="b-fire">🔥 '+esc(k.ch)+'</p>':'')+'<div class="row"><button data-act="studyFrom" data-k="'+k.id+'">🧠 Étudier</button><button data-ps="toJR" data-k="'+k.id+'">⚖️ JusteRepère</button><button data-ps="toAD" data-k="'+k.id+'">🧠 Auto-Droit</button></div></div>').join(''):'<p class="mut">Aucune panne corrélée avec ces filtres.</p>')+'</div>'+
 (PF.rappel?'<div class="card"><h2>📣 Campagnes de rappel ('+rap.length+')</h2>'+(rap.length?rap.map(r=>'<div class="card"><b>'+(r.fire?'🔥 ':'')+esc(r.t)+'</b> <span class="badge">'+esc(r.src)+'</span><p class="mut">'+esc(r.risk)+'</p><p class="mut">'+r.y[0]+'–'+r.y[1]+' · '+r.dtc.join(', ')+'</p></div>').join(''):'<p class="mut">Aucun rappel.</p>')+'</div>':'')+
 (PF.tsb?'<div class="card"><h2>🧰 Bulletins techniques TSB ('+tsb.length+')</h2>'+(tsb.length?tsb.map(t=>'<div class="card"><b>'+esc(t.ref)+'</b> <span class="badge '+(t.g==='Critique'?'b-crit':'b-elev')+'">'+t.g+'</span><p>'+esc(t.s)+'</p><p class="mut">'+esc(t.sys)+' · '+t.dtc.join(', ')+' · '+t.y[0]+'–'+t.y[1]+'</p></div>').join(''):'<p class="mut">Aucun TSB.</p>')+'</div>':'')+
 '<div class="card"><h2>🔀 Interactions croisées</h2><div class="row"><button class="pri" data-act="nav" data-k="etude">🧠 Étude croisée</button><button class="jr" data-act="nav" data-k="jr">⚖️ JusteRepère</button><button data-act="nav" data-k="droitsmart">🧠 Auto-Droit</button><button data-act="nav" data-k="vin">🔎 VIN</button><button data-act="nav" data-k="formation">🎓 Formation</button><button data-act="nav" data-k="photos">📷 Photos</button></div></div>'}
/* ---- vues ---- */
window.renderStudy=function(){
 $('#view').innerHTML='<div class="card"><h2>🧠 Étude croisée — identification prédictive</h2><div id="selStudy"></div></div>'+
 '<div class="card"><h2>📋 Contexte & constatations</h2><div class="grid g3">'+
 '<div><label>Vendeur</label><select id="stVendeur"><option value="pro">Professionnel</option><option value="part">Particulier</option></select></div>'+
 '<div><label>Date d\'achat</label><input id="stAchat" type="date"></div>'+
 '<div><label>Neuf/occasion</label><select id="stNeuf"><option value="occasion">Occasion</option><option value="neuf">Neuf</option></select></div>'+
 '<div><label>Prix €</label><input id="stPrix" type="number"></div>'+
 '<input type="hidden" id="stMarque"><input type="hidden" id="stModele"><input type="hidden" id="stMotor"><input type="hidden" id="stAnnee"><input type="hidden" id="stEnergie"></div>'+
 '<label>Constatations</label><div class="constats" id="stConstats">'+CONSTATS.map(c=>'<label><input type="checkbox" value="'+c+'">'+c+'</label>').join('')+'</div>'+
 '<label>DTC</label><input id="stDtc" value="'+S.dtc.join(' ')+'" placeholder="P0016 P0400…"><label>Contexte</label><textarea id="stCtx"></textarea>'+
 '<button class="pri" data-act="study">⚙️ Lancer l\'étude</button></div><div id="vehPanel"></div><div id="stResult"></div>';
 mountSelector($('#selStudy'));syncStudy();renderVehPanel()};
window.renderSearch=function(){
 $('#view').innerHTML='<div class="card"><h2>🔎 Recherche prédictive unifiée</h2><div id="selSearch"></div>'+
 '<label>Recherche libre</label><input id="q" placeholder="EGR, courroie, P0016, incendie, vice caché…"><button class="pri" data-act="search">Rechercher</button></div>'+
 '<div id="vehPanel"></div><div id="qRes"></div>';
 mountSelector($('#selSearch'));renderVehPanel();doSearch()};
const _home=window.renderHome;
window.renderHome=function(){_home();const v=$('#view');if(!v||!S.vehicle||!S.vehicle.brand)return;
 v.insertAdjacentHTML('afterbegin','<div class="card"><h2>🚗 Véhicule courant</h2><p>'+esc(S.vehicle.brand)+' '+esc(S.vehicle.model||'')+' '+esc(S.vehicle.engine||'')+(S.vehicle.ch?' · <b class="pw">'+S.vehicle.ch+' ch</b>':'')+'</p><div class="row"><button class="pri" data-act="nav" data-k="etude">🧠 Étudier</button><button data-act="nav" data-k="recherche">🔎 Recherche</button><button class="jr" data-act="nav" data-k="jr">⚖️ JusteRepère</button></div></div>')};
/* ---- dispatcher ---- */
document.addEventListener('change',e=>{const p=e.target.dataset.ps;if(!p)return;
 if(p==='sys'||p==='grav'||p==='energie')PF[p]=e.target.value;
 renderVehPanel()});
document.addEventListener('input',e=>{if(e.target.dataset.ps==='q'){PF.q=e.target.value;renderVehPanel()}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-ps]');if(!b)return;const p=b.dataset.ps,k=b.dataset.k;
 if(p==='fire'||p==='rappel'||p==='tsb'||p==='dtc'){PF[p]=!PF[p];renderVehPanel();return}
 if(p==='toJR'){const kb=KBall().find(x=>x.id===k);S.jr.dom='route';S.jr.result=null;switchView('jr');setTimeout(()=>{if($('#jrVehMarque'))$('#jrVehMarque').value=(S.vehicle?S.vehicle.brand+' '+S.vehicle.model:'');if($('#jrFaits'))$('#jrFaits').value=kb?kb.t+' : '+kb.mec:''},60);return}
 if(p==='toAD'){const kb=KBall().find(x=>x.id===k);switchView('droitsmart');setTimeout(()=>{const t=$('#adText');if(t)t.value=(S.vehicle?S.vehicle.brand+' '+S.vehicle.model+' '+(S.vehicle.engine||'')+' : ':'')+(kb?kb.t+' — '+kb.mec:'')},60);return}
});
window.KFPredictive={vehPannes,vehRappels,vehTSB,brands,models,engines,matchLabel};
})();
