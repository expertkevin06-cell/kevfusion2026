/* KEV FUSION 2026 — predictive.js v8.0.0
   Sélecteur verrouillé par KFCatalog : marque → modèles RÉELS de cette marque → motorisations
   RÉELLES de ce modèle avec puissance homologuée. Aucune combinaison inventée. */
(function(){
'use strict';
if(typeof KBall!=='function'||!window.KFCorr||!window.KFCatalog){console.warn('predictive.js: prérequis manquants');return}
const C=window.KFCatalog;
const A=window.KFnorm||{arr:function(v){return Array.isArray(v)?v:(v==null||v===''?[]:[String(v)])},
 dtc:function(v){return Array.isArray(v)?v:(String(v||'').toUpperCase().match(/[PCBU][0-9]{4}/g)||[])},
 txt:function(v){return Array.isArray(v)?v:(v==null||v===''?[]:String(v).split(/\s*[;·\n]\s*/).filter(Boolean))},
 yrs:function(v){return Array.isArray(v)&&v.length>=2?[+v[0],+v[1]]:null},
 num:function(v){const n=parseInt(String(v||'').replace(/[^\d]/g,''),10);return isFinite(n)&&n>0?n:null}};
S.vehicle=null;S.yearFilter=null;
const norm=C.norm;
const PF={sys:'',grav:'',q:'',fire:false,rappel:true,tsb:true,dtc:true,strict:true};
const ALIAS={hdi:['bluehdi'],bluehdi:['hdi'],tfsi:['tsi'],tsi:['tfsi'],thp:['puretech'],puretech:['thp'],
 courroie:['belt','distribution'],chaine:['chaîne','distribution'],crepine:['crépine'],bougies:['bougie','allumage'],
 dephaseurs:['déphaseur','vvt'],adblue:['scr','urée'],fap:['dpf','particules'],hybride:['hybrid','phev','e tech']};
function toks(q){return norm(q).split(' ').filter(Boolean)}
function matchText(text,q){const t=toks(q);if(!t.length)return true;const L=norm(text);
 return t.every(function(k){return L.indexOf(k)>=0||(ALIAS[k]||[]).some(function(a){return L.indexOf(a)>=0})})}
/* ---- catalogue strict ---- */
function brands(){return C.makes()}
function models(b){const mk=C.resolveMake(b);if(!mk)return[];
 let list=C.models(mk);
 if(S.yearFilter){list=list.filter(function(m){const i=C.info(mk,m);return !i||!i.y||(i.y[0]<=S.yearFilter&&i.y[1]>=S.yearFilter)})}
 return list}
function engines(b,m){const mk=C.resolveMake(b),md=C.resolveModel(mk,m);if(!mk||!md)return[];
 let list=C.engines(mk,md);
 const y=S.yearFilter;
 if(y)list=list.filter(function(e){return !e.y||(e.y[0]<=y&&e.y[1]>=y)});
 return list}
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
function mountSelector(host){
 if(!host)return;
 const yrs=[];for(let y=2027;y>=1995;y--)yrs.push(y);
 host.innerHTML='<div class="grid g3"><div id="cbBrand"></div><div id="cbModel"></div><div id="cbEngine"></div></div>'+
 '<div class="row" style="margin-top:8px"><div style="max-width:170px"><label>Année</label><select id="pfYear"><option value="">Toutes</option>'+
 yrs.map(function(y){return '<option '+(S.yearFilter===y?'selected':'')+'>'+y+'</option>'}).join('')+'</select></div>'+
 '<div id="vehRead" class="vehread" style="flex:1"></div></div>'+
 '<div class="row" style="margin-top:8px"><button class="pri" data-ps="run">🔎 Pannes / rappels / TSB</button>'+
 '<button data-ps="widen">🧪 Élargir</button><button data-ps="clearQ">✖ Réinitialiser</button>'+
 '<button data-ps="purge">🛠️ Purger données invalides</button></div>';
 makeCombo($('#cbBrand'),{label:'Marque',placeholder:'Tape une marque…',value:S.vehicle?S.vehicle.brand:'',empty:'Aucune marque',
  options:function(){return brands().map(function(b){return{label:b}})},
  onPick:function(o){S.vehicle={brand:C.resolveMake(o.label)||o.label,model:'',engine:'',ch:null,fuel:'',y:null};
   mountSelector(host);vehChanged();
   const m=$('#cbModel .cbx-in');if(m)m.focus()}});
 makeCombo($('#cbModel'),{label:'Modèle (catalogue officiel)',placeholder:S.vehicle&&S.vehicle.brand?'Modèles '+S.vehicle.brand:'Choisis la marque d\'abord',value:S.vehicle?S.vehicle.model:'',empty:S.vehicle&&S.vehicle.brand?'Aucun modèle pour cette marque/année':'Choisis la marque d\'abord',
  options:function(){return models(S.vehicle?S.vehicle.brand:'').map(function(m){const i=C.info(S.vehicle.brand,m);
   return{label:m,sub:i&&i.y?i.y[0]+'–'+i.y[1]:''}})},
  onPick:function(o){S.vehicle.model=o.label;S.vehicle.engine='';S.vehicle.ch=null;S.vehicle.fuel='';
   const es=engines(S.vehicle.brand,o.label);
   if(es.length===1){S.vehicle.engine=es[0].l;S.vehicle.ch=es[0].ch;S.vehicle.fuel=es[0].f;S.vehicle.y=es[0].y}
   mountSelector(host);vehChanged();
   const e=$('#cbEngine .cbx-in');if(e&&!S.vehicle.engine)e.focus()}});
 makeCombo($('#cbEngine'),{label:'Motorisation + puissance homologuée',placeholder:S.vehicle&&S.vehicle.model?'Motorisations '+S.vehicle.model:'Choisis le modèle d\'abord',value:S.vehicle?S.vehicle.engine:'',empty:S.vehicle&&S.vehicle.model?'Catalogue moteur à compléter':'Choisis le modèle d\'abord',
  options:function(){return engines(S.vehicle?S.vehicle.brand:'',S.vehicle?S.vehicle.model:'').map(function(e){
   return{label:e.l,sub:e.ch+' ch · '+e.kw+' kW',_e:e}})},
  onPick:function(o){const e=o._e;if(!e)return;
   const v=C.engineValid(S.vehicle.brand,S.vehicle.model,e.l,e.ch);
   if(!v.ok){toast('❌ '+v.reason);return}
   S.vehicle.engine=e.l;S.vehicle.ch=e.ch;S.vehicle.fuel=e.f;S.vehicle.y=e.y;S.vehicle.code=e.code;
   mountSelector(host);vehChanged()}});
 const ys=$('#pfYear');
 if(ys)ys.addEventListener('change',function(e){S.yearFilter=e.target.value?+e.target.value:null;
  if(S.vehicle){
   if(S.vehicle.model&&models(S.vehicle.brand).indexOf(S.vehicle.model)<0){S.vehicle.model='';S.vehicle.engine='';S.vehicle.ch=null}
   if(S.vehicle.engine&&!engines(S.vehicle.brand,S.vehicle.model).some(function(x){return x.l===S.vehicle.engine})){S.vehicle.engine='';S.vehicle.ch=null}}
  mountSelector(host);vehChanged()});
 readout()}
function readout(){const el=$('#vehRead');if(!el)return;const v=S.vehicle;
 if(!v||!v.brand){el.innerHTML='<span class="mut">Marque → modèle → motorisation : uniquement des combinaisons réelles du catalogue.</span>';return}
 const ok=C.isPairValid(v.brand,v.model);
 const ev=v.engine?C.engineValid(v.brand,v.model,v.engine,v.ch):null;
 const info=C.info(v.brand,v.model);
 el.innerHTML='🚗 <b>'+esc(v.brand)+'</b> '+esc(v.model||'')+
 (info&&info.body?' <span class="badge">'+esc(info.body)+'</span>':'')+
 (info&&info.y?' <span class="badge">'+info.y[0]+'–'+info.y[1]+'</span>':'')+
 ' '+esc(v.engine||'')+
 (v.ch?' · <b class="pw">'+v.ch+' ch</b> ('+Math.round(v.ch*0.7355)+' kW)':'')+
 (v.fuel?' · '+esc(v.fuel.toUpperCase()):'')+
 (v.code?' · <span class="badge b-dtc">'+esc(v.code)+'</span>':'')+
 (v.model&&!ok?' <span class="badge b-crit">❌ combinaison invalide</span>':'')+
 (ev&&!ev.ok?' <span class="badge b-crit">❌ '+esc(ev.reason)+'</span>':'')+
 (ok&&ev&&ev.ok?' <span class="badge b-mod">✅ validé catalogue</span>':'')}
function syncStudy(){const v=S.vehicle||{};
 const set=function(id,val){const e=$('#'+id);if(e)e.value=val==null?'':val};
 set('stMarque',v.brand);set('stModele',v.model);set('stMotor',v.engine);
 set('stAnnee',S.yearFilter||(v.y?v.y[1]:''));set('stEnergie',v.fuel||'');
 S.veh={marque:v.brand||'',modele:v.model||'',motor:v.engine||'',annee:S.yearFilter||(v.y?v.y[1]:''),vin:S.veh?S.veh.vin:''}}
function currentCorr(){const v=S.vehicle;if(!v||!v.brand)return null;
 if(v.model&&!C.isPairValid(v.brand,v.model))return null;
 if(v.engine){const e=C.engineValid(v.brand,v.model,v.engine,v.ch);if(!e.ok)return null}
 try{return KFCorr.correlate(v,{strict:PF.strict,readDtc:S.dtc||[]})}catch(e){log('error','correlate '+e.message);return null}}
function isSearch(){return S.view==='recherche'}
function vehChanged(){syncStudy();readout();paint();document.dispatchEvent(new CustomEvent('kf:vehicle',{detail:S.vehicle}))}
function paint(){try{if(isSearch()){renderSearchPanel();runSearch()}else renderStudyPanel()}
 catch(e){log('error','paint '+e.message);const h=$('#srRes')||$('#vehPanel');
  if(h)h.innerHTML='<div class="card"><h2 class="st-fail">⚠️ Erreur</h2><p class="mut">'+esc(e.message)+'</p><button data-ps="clearQ">↻</button></div>'}}
function traceCard(c){const t=c.trace,s=c.sig;
 return '<div class="card"><h2>🧬 Signature moteur validée</h2><table class="kv">'+
 '<tr><td>Véhicule</td><td><b>'+esc(s.brand)+' '+esc(s.model)+'</b> '+esc(s.engine)+'</td></tr>'+
 '<tr><td>Puissance homologuée</td><td>'+(s.ch?'<b class="pw">'+s.ch+' ch</b> / '+s.kw+' kW':'non précisée')+'</td></tr>'+
 '<tr><td>Cylindrée / énergie</td><td>'+esc(s.disp||'—')+' · '+esc((s.fuelGroup||'?').toUpperCase())+'</td></tr>'+
 '<tr><td>Codes moteur</td><td><b>'+esc(s.codeLabel)+'</b></td></tr>'+
 '<tr><td>Base analysée</td><td class="mut">'+t.total+' fiches · énergie '+t.fuel+' · années '+t.year+' · code moteur '+t.engine+' · modèle '+t.model+' · puissance '+t.power+'</td></tr>'+
 '<tr><td>Résultat</td><td><b>'+t.kept+' panne(s)</b> · '+c.dtc.length+' DTC · '+c.recalls.length+' rappel(s) · '+c.tsb.length+' TSB'+(t.fallback?' <span class="badge b-elev">repli</span>':'')+'</td></tr></table></div>'}
function filterBar(pool){
 const sys=Array.from(new Set(A.arr(pool).map(function(k){return k&&k.s}).filter(Boolean))).sort();
 return '<div class="row" style="margin-bottom:8px"><button class="chipf '+(PF.strict?'on':'')+'" data-ps="strict">🎯 Strict</button>'+
 '<span class="mut">Corrélation code moteur + modèle + puissance + énergie + années.</span></div>'+
 '<div class="grid g3"><div><label>Système</label><select data-ps="sys"><option value="">Tous</option>'+
 sys.map(function(s){return '<option '+(PF.sys===s?'selected':'')+'>'+esc(s)+'</option>'}).join('')+'</select></div>'+
 '<div><label>Gravité</label><select data-ps="grav"><option value="">Toutes</option>'+
 ['Critique','Élevé','Modéré'].map(function(g){return '<option '+(PF.grav===g?'selected':'')+'>'+g+'</option>'}).join('')+'</select></div>'+
 '<div><label>Filtre</label><input data-ps="q" value="'+esc(PF.q)+'" placeholder="courroie, crépine, AdBlue, P0016…"></div></div>'+
 '<div class="row"><button class="chipf '+(PF.fire?'on':'')+'" data-ps="fire">🔥 Incendie</button>'+
 '<button class="chipf '+(PF.dtc?'on':'')+'" data-ps="dtc">🔢 DTC</button>'+
 '<button class="chipf '+(PF.rappel?'on':'')+'" data-ps="rappel">📣 Rappels</button>'+
 '<button class="chipf '+(PF.tsb?'on':'')+'" data-ps="tsb">🧰 TSB</button></div>'}
function applyFilters(list,q){
 let out=A.arr(list).filter(function(k){return k&&typeof k==='object'});
 if(PF.sys)out=out.filter(function(k){return k.s===PF.sys});
 if(PF.grav)out=out.filter(function(k){return k.g===PF.grav});
 if(PF.fire)out=out.filter(function(k){return k.f});
 const query=[PF.q,q].filter(Boolean).join(' ');
 if(query)out=out.filter(function(k){return matchText((k.t||'')+' '+(k.mec||'')+' '+A.dtc(k.dtc).join(' ')+' '+(k.s||'')+' '+A.txt(k.sym).join(' ')+' '+A.txt(k.cons).join(' ')+' '+(k.tsb||'')+' '+(k.rec||''),query)});
 return out}
function dtcCard(c){const L=A.arr(c.dtc).filter(function(d){return d&&d.code});
 return '<div class="card"><h2>🔢 Codes défauts — '+L.length+'</h2>'+
 (L.length?'<div class="row">'+L.map(function(d){return '<span class="badge '+(d.fromModel?'b-crit':'b-dtc')+'" title="'+esc(A.txt(d.faults).join(' | '))+'">'+esc(d.code)+(d.read?' ✅':'')+(d.fromModel?' ★':'')+'</span>'}).join('')+'</div>'+
 '<p class="mut">★ issu d\'un TSB/rappel · ✅ lu sur le véhicule.</p>'+
 '<div class="row"><button data-ps="injectDtc">🧠 Injecter dans l\'étude</button><button data-ps="copyDtc">📋 Copier</button></div>':'<p class="mut">Aucun DTC corrélé.</p>')+'</div>'}
function faultFull(k){
 const rel=String(k.relevance||'').indexOf('DIRECT')===0?'b-crit':String(k.relevance||'').indexOf('FORT')===0?'b-elev':'b-mod';
 const D=A.dtc(k.dtc),Y=A.yrs(k.y)||[1995,2027];
 return '<div class="card faultcard"><h3>'+esc(k.t)+'</h3>'+
 '<div><span class="badge '+rel+'">'+esc(k.relevance||'—')+'</span>'+
 '<span class="badge '+(k.g==='Critique'?'b-crit':k.g==='Élevé'?'b-elev':'b-mod')+'">'+esc(k.g)+'</span>'+
 (k.f?'<span class="badge b-fire">🔥 incendie</span>':'')+'<span class="badge">'+esc(k.s)+'</span>'+
 '<span class="badge">'+Y[0]+'–'+Y[1]+'</span>'+
 (A.arr(k.eng).length?'<span class="badge b-dtc">'+esc(A.arr(k.eng).join('/'))+'</span>':'')+
 (A.arr(k.ch).length?'<span class="badge">'+esc(A.arr(k.ch).join('/')+' ch')+'</span>':'')+
 D.map(function(d){return '<span class="badge b-dtc">'+esc(d)+'</span>'}).join('')+'</div>'+
 '<p class="mut"><b>Corrélation :</b> '+esc(A.txt(k.why).join(' · '))+' · score '+k.sc+'</p>'+
 '<p><b>Mécanisme :</b> '+esc(k.mec||'—')+'</p>'+
 (k.ch&&typeof k.ch==='string'?'<p class="b-fire"><b>Chaîne incendie :</b> '+esc(k.ch)+'</p>':'')+
 '<p class="mut"><b>Symptômes :</b> '+esc(A.txt(k.sym).join(' · ')||'—')+'</p>'+
 '<p class="mut"><b>Conséquences :</b> '+esc(A.txt(k.cons).join(' · ')||'—')+'</p>'+
 '<p class="mut"><b>Preuves :</b> '+esc(A.txt(k.prv).join(' · ')||'—')+'</p>'+
 '<p class="mut"><b>Tests :</b> '+esc(A.txt(k.tst).join(' · ')||'—')+'</p>'+
 (A.txt(k.act).length?'<p class="mut"><b>Actions :</b> '+esc(A.txt(k.act).join(' · '))+'</p>':'')+
 '<p class="mut"><b>Sécurité :</b> '+esc(k.sec||'—')+'</p>'+
 (k.tsb?'<p class="b-elev"><b>🧰 TSB :</b> '+esc(k.tsb)+'</p>':'')+
 (k.rec?'<p class="b-fire"><b>📣 Rappel :</b> '+esc(k.rec)+'</p>':'')+
 (A.arr(k.legal).length?'<p class="mut"><b>Juridique :</b> '+A.arr(k.legal).map(function(l){return l&&l.ref?'<span class="badge b-law">'+esc(l.ref)+'</span>':''}).join(' ')+'</p>':'')+
 '<div class="row"><button class="pri" data-ps="fiche" data-k="'+esc(k.id)+'">📋 Fiche</button>'+
 '<button data-ps="studyOne" data-k="'+esc(k.id)+'">🧠 Étudier</button>'+
 '<button data-ps="toJR" data-k="'+esc(k.id)+'">⚖️ JusteRepère</button>'+
 '<button data-ps="toAD" data-k="'+esc(k.id)+'">🧠 Auto-Droit</button></div></div>'}
function recallCard(r){const Y=A.yrs(r.y)||[1995,2027];
 return '<div class="card"><b>'+(r.fire?'🔥 ':'')+esc(r.t)+'</b> <span class="badge">'+esc(r.src||'Campagne')+'</span>'+
 '<p class="mut">'+esc(r.risk||'—')+'</p><p class="mut">'+Y[0]+'–'+Y[1]+' · '+esc(A.dtc(r.dtc).join(', ')||'—')+'</p></div>'}
function tsbCard(t){const Y=A.yrs(t.y)||[1995,2027];
 return '<div class="card"><b>'+esc(t.ref)+'</b> <span class="badge '+(t.g==='Critique'?'b-crit':'b-elev')+'">'+esc(t.g||'—')+'</span>'+
 '<p>'+esc(t.s||'—')+'</p><p class="mut">'+esc(t.sys||'—')+' · '+esc(A.dtc(t.dtc).join(', ')||'—')+' · '+Y[0]+'–'+Y[1]+'</p></div>'}
function resultsHTML(c,q){
 const pan=applyFilters(c.faults,q);
 const rap=PF.rappel?A.arr(c.recalls).filter(function(r){return r&&(!q||matchText(r.t+' '+r.risk+' '+A.dtc(r.dtc).join(' '),q))}):[];
 const tsb=PF.tsb?A.arr(c.tsb).filter(function(t){return t&&(!q||matchText(t.ref+' '+t.s+' '+t.sys+' '+A.dtc(t.dtc).join(' '),q))}):[];
 const s=c.sig;
 return '<div class="card"><h2>🎯 '+esc(s.brand)+' '+esc(s.model||'')+' '+esc(s.engine||'')+(s.ch?' '+s.ch+' ch':'')+'</h2>'+
 '<p class="mut"><b>'+pan.length+' panne(s)</b> · '+c.dtc.length+' DTC · '+rap.length+' rappel(s) · '+tsb.length+' TSB'+(q?' · « '+esc(q)+' »':'')+'</p>'+
 '<div class="row"><button class="pri" data-ps="study">🧠 Lancer l\'étude corrélée</button><button data-ps="injectDtc">🔢 Injecter DTC</button><button data-ps="web">🌐 Recherche internet</button></div></div>'+
 '<div class="card"><h2>🔧 Pannes connues ('+pan.length+')</h2>'+(pan.length?pan.map(faultFull).join(''):'<p class="mut">Aucune panne avec ces filtres — « 🧪 Élargir » ou « ✖ Réinitialiser ».</p>')+'</div>'+
 (PF.rappel?'<div class="card"><h2>📣 Campagnes de rappel ('+rap.length+')</h2>'+(rap.length?rap.map(recallCard).join(''):'<p class="mut">Aucun rappel.</p>')+'</div>':'')+
 (PF.tsb?'<div class="card"><h2>🧰 TSB ('+tsb.length+')</h2>'+(tsb.length?tsb.map(tsbCard).join(''):'<p class="mut">Aucun TSB.</p>')+'</div>':'')}
function renderSearchPanel(){const h=$('#srPanel');if(!h)return;
 if(S.vehicle&&S.vehicle.model&&!C.isPairValid(S.vehicle.brand,S.vehicle.model)){
  h.innerHTML='<div class="card accent"><h2 class="st-fail">❌ Combinaison inexistante</h2><p class="mut">« '+esc(S.vehicle.model)+' » n\'est pas un modèle '+esc(S.vehicle.brand)+'. Marques possibles : <b>'+esc(C.modelOwner(S.vehicle.model).join(', ')||'inconnu')+'</b>.</p></div>';return}
 const c=currentCorr();
 if(!c){h.innerHTML='<div class="card mut">Sélectionne marque → modèle → motorisation.</div>';return}
 h.innerHTML=traceCard(c)+'<div class="card"><h2>🔗 Filtres</h2>'+filterBar(c.faults)+'</div>'+(PF.dtc?dtcCard(c):'')}
function runSearch(){const h=$('#srRes');if(!h)return;
 try{const qe=$('#srQ'),q=qe?qe.value.trim():'';
  if(S.vehicle&&S.vehicle.model&&!C.isPairValid(S.vehicle.brand,S.vehicle.model)){h.innerHTML='';return}
  const c=currentCorr();
  if(!c){h.innerHTML='<div class="card"><h2>🔎 Recherche</h2><p class="mut">Choisis marque → modèle → motorisation dans le catalogue officiel.</p></div>';return}
  h.innerHTML=resultsHTML(c,q)}catch(e){log('error','runSearch '+e.message);
  h.innerHTML='<div class="card"><h2 class="st-fail">⚠️ Interrompu</h2><p class="mut">'+esc(e.message)+'</p><button data-ps="clearQ">↻</button></div>'}}
function renderStudyPanel(){const h=$('#vehPanel');if(!h)return;
 if(S.vehicle&&S.vehicle.model&&!C.isPairValid(S.vehicle.brand,S.vehicle.model)){
  h.innerHTML='<div class="card accent"><h2 class="st-fail">❌ Combinaison inexistante</h2><p class="mut">« '+esc(S.vehicle.model)+' » n\'appartient pas à '+esc(S.vehicle.brand)+'. Marques réelles : <b>'+esc(C.modelOwner(S.vehicle.model).join(', ')||'—')+'</b>.</p></div>';return}
 const c=currentCorr();
 if(!c){h.innerHTML='<div class="card mut">Sélectionne marque → modèle → motorisation.</div>';return}
 h.innerHTML=traceCard(c)+'<div class="card"><h2>🔗 Filtres</h2>'+filterBar(c.faults)+'</div>'+(PF.dtc?dtcCard(c):'')+resultsHTML(c,'')}
function studyForm(){const g=function(id){const e=$('#'+id);return e?e.value:''};const v=S.vehicle||{};
 return{brand:v.brand||'',model:v.model||'',engine:v.engine||'',ch:A.num(v.ch),fuel:v.fuel||'',y:A.yrs(v.y),code:v.code||'',
  vendeur:g('stVendeur')||'pro',achat:g('stAchat'),neuf:g('stNeuf')||'occasion',prix:g('stPrix'),
  constats:Array.prototype.map.call(document.querySelectorAll('#stConstats input:checked'),function(i){return i.value}),
  dtc:A.dtc(g('stDtc')),ctx:String(g('stCtx')||'').trim()}}
function lawOf(id){try{const l=txtById(id);return l&&l.t?l:null}catch(e){return null}}
function qualifySafe(f,form){const out=[],add=function(id,why){const l=lawOf(id);if(l&&!out.some(function(x){return x.id===l.id}))out.push(Object.assign({},l,{why:why}))};
 const grave=form.constats.indexOf('incendie')>=0||form.constats.indexOf('véhicule immobilisé')>=0||A.arr(f).some(function(k){return k&&k.g==='Critique'});
 const mo=form.achat?Math.floor((Date.now()-new Date(form.achat).getTime())/2629800000):null;
 if(form.vendeur==='pro'){add('CONSO2173','Vendeur professionnel → garantie légale de conformité');
  if(mo!==null&&mo<=(form.neuf==='occasion'?12:24))add('CONSO2177','Présomption d\'antériorité ('+(form.neuf==='occasion'?12:24)+' mois)')}
 if(grave)add('CC1641','Défaut grave → résolution ou réduction du prix');
 if(form.constats.indexOf('après entretien')>=0||/répar|garage|entretien/i.test(form.ctx))add('CC12311','Réparateur → obligation de résultat');
 if(form.constats.indexOf('incendie')>=0||/bless|brûl|dommage/i.test(form.ctx)){add('CC1245','Défaut de sécurité du produit');add('CONSOL4213','Obligation générale de sécurité — rappels');
  if(/propag|voisin|tiers/i.test(form.ctx))add('CC1240','Dommages aux tiers')}
 if(/dissimul|menti|maquill|tromp|compteur/i.test(form.ctx))add('CC1137','Dissimulation → dol');
 A.arr(f).forEach(function(k){if(k)A.arr(k.law).forEach(function(id){add(id,'Fondement de la fiche : '+k.t)})});
 if(!out.length)add('CC1641','À qualifier selon gravité/antériorité');
 return out}
function runStudySafe(focusId){const h=$('#stResult');if(!h)return;
 try{const form=studyForm();
  if(!form.brand){h.innerHTML='<div class="card"><h2 class="st-warn">🚗 Véhicule requis</h2><p class="mut">Sélectionne marque → modèle → motorisation.</p></div>';return}
  if(form.model&&!C.isPairValid(form.brand,form.model)){
   h.innerHTML='<div class="card accent"><h2 class="st-fail">❌ Combinaison inexistante</h2><p class="mut">« '+esc(form.model)+' » n\'est pas un modèle '+esc(form.brand)+'. Marques réelles : '+esc(C.modelOwner(form.model).join(', ')||'—')+'</p></div>';return}
  if(form.engine){const e=C.engineValid(form.brand,form.model,form.engine,form.ch);
   if(!e.ok){h.innerHTML='<div class="card accent"><h2 class="st-fail">❌ Motorisation non homologuée</h2><p class="mut">'+esc(e.reason)+'</p></div>';return}}
  const c=KFCorr.correlate(form,{strict:PF.strict,readDtc:form.dtc});
  let top=A.arr(c.faults).slice(0,10);
  if(focusId){const one=c.faults.find(function(x){return x&&x.id===focusId});if(one)top=[one].concat(top.filter(function(x){return x.id!==focusId})).slice(0,10)}
  const laws=qualifySafe(top,form),best=top.length?(top[0].sc||0):0;
  const level=best>=15?'PROBABLE — faisceau fort':best>=10?'PROBABLE':best>=6?'POSSIBLE':'INDÉTERMINÉ';
  const fires=top.filter(function(k){return k.f});
  const study={ts:new Date().toISOString(),version:'8.0.0',form:form,signature:c.sig,
   top:top.map(function(k){return{id:k.id,t:k.t,s:k.s,g:k.g,f:!!k.f,dtc:A.dtc(k.dtc),mec:k.mec||'',ch:typeof k.ch==='string'?k.ch:'',
    cons:A.txt(k.cons),sym:A.txt(k.sym),prv:A.txt(k.prv),tst:A.txt(k.tst),act:A.txt(k.act),sec:k.sec||'',sc:k.sc||0,why:A.txt(k.why),relevance:k.relevance||'',law:A.arr(k.law).map(function(l){return l&&l.id?l.id:l}),tsb:k.tsb,rec:k.rec}}),
   laws:laws.map(function(l){return{id:l.id,ref:l.ref,t:l.t,why:l.why,delai:l.delai,txt:l.txt}}),
   fires:fires.map(function(k){return{t:k.t,ch:typeof k.ch==='string'?k.ch:'',sec:k.sec}}),
   recalls:A.arr(c.recalls).map(function(r){return{t:r.t,src:r.src,risk:r.risk,y:A.yrs(r.y),dtc:A.dtc(r.dtc)}}),
   tsb:A.arr(c.tsb).map(function(t){return{ref:t.ref,sys:t.sys,s:t.s,y:A.yrs(t.y),dtc:A.dtc(t.dtc),g:t.g}}),
   dtc:A.arr(c.dtc),level:level,trace:c.trace};
  S.study=study;S.lastCorr=c;const hh=ls.get('studies',[]);hh.unshift(study);ls.set('studies',hh.slice(0,20));
  h.innerHTML='<div class="card"><h2>🧠 Étude — <span class="'+(best>=10?'st-warn':'st-ok')+'">'+esc(level)+'</span></h2>'+
   '<p class="mut">'+esc(form.brand)+' '+esc(form.model)+' '+esc(form.engine)+(form.ch?' · '+form.ch+' ch':'')+' · '+esc(form.code||'')+' · '+esc(form.vendeur==='pro'?'vendeur pro':'particulier')+'</p>'+
   '<p class="mut">Constatations : '+esc(A.txt(form.constats).join(', ')||'—')+' · DTC : '+esc(A.dtc(form.dtc).join(', ')||'—')+'</p>'+
   '<div class="row"><button class="pri" data-ps="studyPdf">🖨️ PDF</button><button data-ps="studyJson">📤 JSON</button><button data-ps="studyDoss">📁 Dossier</button><button class="jr" data-ps="studyJR">⚖️ JusteRepère</button></div></div>'+
   '<div class="card"><h2>🔧 Causes corrélées ('+top.length+')</h2>'+(top.length?top.map(faultFull).join(''):'<p class="mut">Aucune cause.</p>')+'</div>'+
   (fires.length?'<div class="card"><h2>🔥 Chaînes incendie ('+fires.length+')</h2>'+fires.map(function(k){return '<div class="card"><b>'+esc(k.t)+'</b><p class="b-fire">'+esc(typeof k.ch==='string'?k.ch:'—')+'</p><p class="mut"><b>Sécurité :</b> '+esc(k.sec||'—')+'</p></div>'}).join('')+'</div>':'')+
   '<div class="card"><h2>⚖️ Qualification juridique ('+laws.length+')</h2>'+laws.map(function(l){return '<div class="card"><h3>'+esc(l.t)+' <span class="badge b-law">'+esc(l.ref)+'</span></h3><p>'+esc(l.txt)+'</p><p class="mut"><b>Délai :</b> '+esc(l.delai)+'</p><p class="b-law">'+esc(l.why)+'</p></div>'}).join('')+'</div>'+
   (c.recalls.length?'<div class="card"><h2>📣 Rappels ('+c.recalls.length+')</h2>'+c.recalls.map(recallCard).join('')+'</div>':'')+
   (c.tsb.length?'<div class="card"><h2>🧰 TSB ('+c.tsb.length+')</h2>'+c.tsb.map(tsbCard).join('')+'</div>':'');
  toast('🧠 Étude générée');h.scrollIntoView({behavior:'smooth',block:'start'});
 }catch(e){log('error','study '+e.message);
  h.innerHTML='<div class="card"><h2 class="st-fail">⚠️ Étude interrompue</h2><p class="mut">'+esc(e.message)+'</p><div class="row"><button class="pri" data-ps="study">↻ Relancer</button><button data-ps="widen">🧪 Élargir</button></div></div>'}}
function studyPdf(){const s=S.study;if(!s){toast('Lance une étude');return}const f=s.form;
 $('#printArea').innerHTML='<h1>🔥 KEV FUSION — Étude corrélée</h1><p>'+new Date(s.ts).toLocaleString('fr-FR')+' · v'+s.version+'</p>'+
 '<h2>1. Véhicule (catalogue validé)</h2><p>'+esc(f.brand)+' '+esc(f.model)+' '+esc(f.engine)+(f.ch?' · '+f.ch+' ch':'')+' · code '+esc(f.code||'—')+' · '+esc(f.fuel||'')+'</p>'+
 '<p>Vendeur '+esc(f.vendeur==='pro'?'professionnel':'particulier')+' · achat '+esc(f.achat||'?')+' · '+esc(f.prix||'?')+' €</p>'+
 '<p>Constatations : '+esc(A.txt(f.constats).join(', ')||'—')+' · DTC : '+esc(A.dtc(f.dtc).join(', ')||'—')+'</p><p>'+esc(f.ctx||'')+'</p>'+
 '<h2>2. Causes ('+esc(s.level)+')</h2>'+A.arr(s.top).map(function(k){return '<p><b>'+esc(k.t)+'</b> ('+esc(k.relevance)+')<br>'+esc(k.mec)+'<br>DTC : '+esc(A.dtc(k.dtc).join(', '))+'<br>Preuves : '+esc(A.txt(k.prv).join(' ; '))+'<br>Tests : '+esc(A.txt(k.tst).join(' ; '))+'<br>Actions : '+esc(A.txt(k.act).join(' ; '))+'<br>Sécurité : '+esc(k.sec)+(k.tsb?'<br>TSB : '+esc(k.tsb):'')+(k.rec?'<br>Rappel : '+esc(k.rec):'')+'</p>'}).join('')+
 '<h2>3. Juridique</h2>'+A.arr(s.laws).map(function(l){return '<p><b>'+esc(l.t)+'</b> — '+esc(l.ref)+'<br>Délai : '+esc(l.delai)+'<br>'+esc(l.why)+'</p>'}).join('')+
 '<h2>4. Rappels</h2>'+(A.arr(s.recalls).length?A.arr(s.recalls).map(function(r){return '<p>'+esc(r.t)+' — '+esc(r.risk)+'</p>'}).join(''):'<p>Aucun.</p>')+
 '<h2>5. TSB</h2>'+(A.arr(s.tsb).length?A.arr(s.tsb).map(function(t){return '<p>'+esc(t.ref)+' — '+esc(t.s)+'</p>'}).join(''):'<p>Aucun.</p>')+
 '<p><i>Aide à l\'expertise — ne constitue pas une expertise judiciaire contradictoire.</i></p>';
 document.body.classList.add('printing');window.print();setTimeout(function(){document.body.classList.remove('printing')},800)}
function studyDoss(){const s=S.study;if(!s){toast('Lance une étude');return}
 const first=A.arr(s.laws)[0]?s.laws[0].id:'CC1641';const cat=(typeof CAT2LAW==='object'&&CAT2LAW[first])||'autre';
 const d=newDossier({cat:cat,titre:(s.form.brand+' '+s.form.model+' — '+(PROCEDURES[cat]?PROCEDURES[cat].label:'Litige')).trim(),
  veh:{marque:s.form.brand,modele:s.form.model,motor:s.form.engine,annee:s.form.y?s.form.y[1]:'',vin:S.veh?S.veh.vin:'',prix:s.form.prix,achat:s.form.achat,neuf:s.form.neuf},
  vendeur:{nom:'',adresse:'',type:s.form.vendeur},decouverte:new Date().toISOString().slice(0,10),
  faits:(s.form.ctx||'')+' '+A.arr(s.top).map(function(x){return x.t}).join(' ; '),etude:{level:s.level,top:s.top,fires:s.fires}});
 saveDossier(d);S.doss=d;switchView('dossiers');openDossier(d.id);toast('📁 Dossier créé')}
function studyJR(){const s=S.study;if(!s){toast('Lance une étude');return}
 S.jr.dom='route';S.jr.result=null;switchView('jr');
 setTimeout(function(){const a=$('#jrVehMarque'),b=$('#jrVehMotor'),t=$('#jrTitre'),f=$('#jrFaits');
  if(a)a.value=s.form.brand+' '+s.form.model;if(b)b.value=s.form.engine+(s.form.ch?' '+s.form.ch+' ch':'');
  if(t)t.value=s.form.brand+' '+s.form.model+' — '+A.arr(s.top).map(function(x){return x.t}).slice(0,2).join(' / ');
  if(f)f.value=(s.form.ctx||'')+' '+A.arr(s.top).map(function(x){return x.t+' : '+x.mec}).join(' ; ')},90)}
function fiche(id){const c=currentCorr();if(!c)return;const k=A.arr(c.faults).find(function(x){return x&&x.id===id});if(!k)return;
 openModal('<h2>📋 '+esc(k.t)+'</h2>'+faultFull(k)+'<div class="row"><button class="pri" data-ps="studyOne" data-k="'+esc(k.id)+'">🧠 Étudier</button><button data-act="closeModal">Fermer</button></div>')}
window.doSearch=function(){if(isSearch())runSearch()};
window.scoreKB=function(inp){try{const v={brand:inp.marque,model:inp.modele,engine:inp.motor,ch:S.vehicle&&S.vehicle.ch,fuel:inp.energie,y:S.vehicle&&S.vehicle.y};
 if(v.model&&!C.isPairValid(v.brand,v.model))return[];
 const c=KFCorr.correlate(v,{strict:true,readDtc:inp.dtc||[]});S.lastCorr=c;return A.arr(c.faults).slice(0,10)}catch(e){return[]}};
window.runStudy=function(){runStudySafe()};
window.renderSearch=function(){
 $('#view').innerHTML='<div class="card"><h2>🔎 Recherche prédictive — catalogue verrouillé</h2><div id="srSel"></div>'+
 '<label>Recherche libre</label><input id="srQ" placeholder="courroie, crépine, bougies, déphaseurs, AdBlue, FAP, chaîne 7mm, P0016…" autocomplete="off">'+
 '<div class="row"><button class="pri" data-ps="run">🔎 Rechercher</button><button data-ps="clearQ">✖ Effacer</button></div></div>'+
 '<div id="srPanel"></div><div id="srRes"></div>';
 mountSelector($('#srSel'));const q=$('#srQ');if(q)q.addEventListener('input',runSearch);paint()};
window.renderStudy=function(){
 $('#view').innerHTML='<div class="card"><h2>🧠 Étude croisée — catalogue verrouillé</h2><div id="selStudy"></div></div>'+
 '<div class="card"><h2>📋 Contexte</h2><div class="grid g3">'+
 '<div><label>Vendeur</label><select id="stVendeur"><option value="pro">Professionnel</option><option value="part">Particulier</option></select></div>'+
 '<div><label>Date d\'achat</label><input id="stAchat" type="date"></div>'+
 '<div><label>Neuf/occasion</label><select id="stNeuf"><option value="occasion">Occasion</option><option value="neuf">Neuf</option></select></div>'+
 '<div><label>Prix €</label><input id="stPrix" type="number"></div></div>'+
 '<label>Constatations</label><div class="constats" id="stConstats">'+CONSTATS.map(function(c){return '<label><input type="checkbox" value="'+c+'">'+c+'</label>'}).join('')+'</div>'+
 '<label>DTC lus</label><input id="stDtc" value="'+A.dtc(S.dtc).join(' ')+'" placeholder="P0016 P0521…">'+
 '<label>Contexte</label><textarea id="stCtx"></textarea>'+
 '<div class="row"><button class="pri" data-ps="study">⚙️ Lancer l\'étude corrélée</button><button data-ps="widen">🧪 Élargir</button></div></div>'+
 '<div id="vehPanel"></div><div id="stResult"></div>';
 mountSelector($('#selStudy'));syncStudy();paint()};
const _home=window.renderHome;
window.renderHome=function(){_home();const v=$('#view');const c=currentCorr();if(!v||!c)return;
 v.insertAdjacentHTML('afterbegin','<div class="card"><h2>🚗 Véhicule courant</h2><p>'+esc(c.sig.brand)+' '+esc(c.sig.model||'')+' '+esc(c.sig.engine||'')+(c.sig.ch?' · <b class="pw">'+c.sig.ch+' ch</b>':'')+'</p>'+
 '<p class="mut">'+c.faults.length+' panne(s) · '+c.dtc.length+' DTC · '+c.recalls.length+' rappel(s) · '+c.tsb.length+' TSB · code '+esc(c.sig.codeLabel)+'</p>'+
 '<div class="row"><button class="pri" data-act="nav" data-k="etude">🧠 Étudier</button><button data-act="nav" data-k="recherche">🔎 Recherche</button></div></div>')};
document.addEventListener('change',function(e){const p=e.target.dataset.ps;if(p==='sys'||p==='grav'){PF[p]=e.target.value;paint()}});
document.addEventListener('input',function(e){if(e.target.dataset.ps==='q'){PF.q=e.target.value;paint()}});
document.addEventListener('click',async function(e){
 const b=e.target.closest('[data-ps]');if(!b)return;const p=b.dataset.ps,k=b.dataset.k;
 if(p==='purge'){const n=C.purge();toast('🛠️ '+n+' entrée(s) invalide(s) purgée(s)');mountSelector($('#srSel')||$('#selStudy'));paint();return}
 if(p==='web'){if(window.KFWebSearch&&S.vehicle){toast('🌐 Recherche internet…');
   try{const r=await KFWebSearch.searchWithTranslation(S.vehicle.brand,S.vehicle.model,S.yearFilter||(S.vehicle.y?S.vehicle.y[1]:2020));
    const h=$('#srRes')||$('#stResult');if(h)h.insertAdjacentHTML('beforeend',KFWebSearch.renderWebResults(r))}catch(x){toast('Web : '+x.message)}}
  else toast('Sélectionne un véhicule');return}
 if(p==='study'){e.preventDefault();closeModal();if(S.view!=='etude'){switchView('etude');setTimeout(function(){runStudySafe()},90)}else runStudySafe();return}
 if(p==='studyOne'){e.preventDefault();closeModal();if(S.view!=='etude'){switchView('etude');setTimeout(function(){runStudySafe(k)},90)}else runStudySafe(k);return}
 if(p==='studyPdf'){studyPdf();return}
 if(p==='studyJson'){if(S.study)download('etude-'+Date.now()+'.json',S.study);else toast('Lance une étude');return}
 if(p==='studyDoss'){studyDoss();return}
 if(p==='studyJR'){studyJR();return}
 if(p==='run'){paint();toast('🔎 Corrélation actualisée');return}
 if(p==='widen'){PF.strict=false;PF.sys='';PF.grav='';PF.fire=false;PF.q='';const q=$('#srQ');if(q)q.value='';paint();toast('🧪 Élargi');return}
 if(p==='strict'||p==='fire'||p==='rappel'||p==='tsb'||p==='dtc'){PF[p]=!PF[p];paint();return}
 if(p==='clearQ'){PF.q='';PF.sys='';PF.grav='';PF.fire=false;PF.strict=true;const q=$('#srQ');if(q)q.value='';paint();return}
 if(p==='fiche'){fiche(k);return}
 if(p==='injectDtc'){const c=currentCorr();if(!c)return;S.dtc=A.arr(c.dtc).map(function(d){return d.code});
  if(S.view!=='etude'){switchView('etude');setTimeout(function(){const t=$('#stDtc');if(t)t.value=S.dtc.join(' ')},90)}else{const t=$('#stDtc');if(t)t.value=S.dtc.join(' ')}
  toast('🔢 '+S.dtc.length+' DTC injectés');return}
 if(p==='copyDtc'){const c=currentCorr();if(!c)return;try{await navigator.clipboard.writeText(A.arr(c.dtc).map(function(d){return d.code}).join(' '));toast('📋 Copié')}catch(x){toast('Copie impossible')}return}
 if(p==='toJR'){const cc=currentCorr();const kb=cc?A.arr(cc.faults).find(function(x){return x&&x.id===k}):null;
  S.jr.dom='route';S.jr.result=null;switchView('jr');
  setTimeout(function(){const a=$('#jrVehMarque'),b2=$('#jrVehMotor'),f=$('#jrFaits');
   if(a)a.value=S.vehicle?S.vehicle.brand+' '+S.vehicle.model:'';if(b2)b2.value=S.vehicle?S.vehicle.engine:'';
   if(f)f.value=kb?kb.t+' : '+kb.mec:''},90);return}
 if(p==='toAD'){const cc=currentCorr();const kb=cc?A.arr(cc.faults).find(function(x){return x&&x.id===k}):null;switchView('droitsmart');
  setTimeout(function(){const t=$('#adText');if(t)t.value=(S.vehicle?S.vehicle.brand+' '+S.vehicle.model+' '+S.vehicle.engine+' : ':'')+(kb?kb.t+' — '+kb.mec:'')},90);return}});
window.KFPredictive={brands:brands,models:models,engines:engines,correlate:currentCorr,runSearch:runSearch,study:runStudySafe};
})();
