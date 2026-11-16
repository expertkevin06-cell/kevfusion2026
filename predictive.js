/* KEV FUSION 2026 — predictive.js v9.0.0
   Recherche/étude : corrélation positive + 26 filtres natifs (FAP, AdBlue, turbo, courroie, chaîne,
   ADAS, batterie HT, autonomie…) appliqués au véhicule sélectionné. Résultats garantis. */
(function(){
'use strict';
if(typeof KBall!=='function'||!window.KFCorr){console.warn('predictive.js: prérequis manquants');return}
const C=window.KFCatalog,K=window.KFCorr;
const A={arr:K.arr,dtc:K.dtc,txt:K.txt,
 yrs:function(v){return Array.isArray(v)&&v.length>=2?[+v[0],+v[1]]:null},
 num:function(v){const n=parseInt(String(v||'').replace(/[^\d]/g,''),10);return isFinite(n)&&n>0?n:null}};
S.vehicle=null;S.yearFilter=null;
const norm=K.norm,SYS=K.SYS;
const PF={sys:'',grav:'',q:'',fire:false,rappel:true,tsb:true,dtc:true,strict:true,filter:''};
const ALIAS={hdi:['bluehdi'],bluehdi:['hdi'],tfsi:['tsi'],tsi:['tfsi'],thp:['puretech'],puretech:['thp'],
 courroie:['belt'],chaine:['chaîne'],crepine:['crépine'],bougies:['bougie'],dephaseurs:['déphaseur','vvt'],
 adblue:['scr','urée'],fap:['dpf','particules'],hybride:['hybrid','phev']};
function toks(q){return norm(q).split(' ').filter(Boolean)}
function matchText(text,q){const t=toks(q);if(!t.length)return true;const L=norm(text);
 return t.every(function(k){return L.indexOf(k)>=0||(ALIAS[k]||[]).some(function(a){return L.indexOf(a)>=0})})}
function brands(){return C?C.makes():Object.keys(VEHDB).sort()}
function models(b){if(!b)return[];
 let list=C?C.models(b):Object.keys(VEHDB[b]||{});
 if(S.yearFilter&&C)list=list.filter(function(m){const i=C.info(b,m);return !i||!i.y||(i.y[0]<=S.yearFilter&&i.y[1]>=S.yearFilter)});
 return list}
function engines(b,m){if(!b||!m)return[];
 let list=C?C.engines(b,m):[];
 if(!list.length&&typeof VEHDB!=='undefined'&&VEHDB[b]&&VEHDB[b][m]){
  list=A.arr(VEHDB[b][m]).map(function(x){return typeof x==='string'?{l:x,ch:null,f:K.fuelGroup(x),code:'',y:null}:x})}
 if(S.yearFilter)list=list.filter(function(e){return !e.y||(e.y[0]<=S.yearFilter&&e.y[1]<=9999&&e.y[0]<=S.yearFilter&&e.y[1]>=S.yearFilter)});
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
 '<div class="row" style="margin-top:8px"><div style="max-width:150px"><label>Année</label><select id="pfYear"><option value="">Toutes</option>'+
 yrs.map(function(y){return '<option '+(S.yearFilter===y?'selected':'')+'>'+y+'</option>'}).join('')+'</select></div>'+
 '<div id="vehRead" class="vehread" style="flex:1"></div></div>';
 makeCombo($('#cbBrand'),{label:'Marque',placeholder:'Tape une marque…',value:S.vehicle?S.vehicle.brand:'',empty:'Aucune marque',
  options:function(){return brands().map(function(b){return{label:b}})},
  onPick:function(o){S.vehicle={brand:(C&&C.resolveMake(o.label))||o.label,model:'',engine:'',ch:null,fuel:'',y:null,code:''};
   mountSelector(host);vehChanged();const m=$('#cbModel .cbx-in');if(m)m.focus()}});
 makeCombo($('#cbModel'),{label:'Modèle',placeholder:S.vehicle&&S.vehicle.brand?'Modèles '+S.vehicle.brand:'Choisis la marque',value:S.vehicle?S.vehicle.model:'',empty:'Choisis la marque',
  options:function(){return models(S.vehicle?S.vehicle.brand:'').map(function(m){const i=C?C.info(S.vehicle.brand,m):null;
   return{label:m,sub:i&&i.y?i.y[0]+'–'+i.y[1]:''}})},
  onPick:function(o){S.vehicle.model=o.label;S.vehicle.engine='';S.vehicle.ch=null;S.vehicle.fuel='';S.vehicle.code='';
   const es=engines(S.vehicle.brand,o.label);
   if(es.length===1){S.vehicle.engine=es[0].l;S.vehicle.ch=es[0].ch;S.vehicle.fuel=es[0].f;S.vehicle.y=es[0].y;S.vehicle.code=es[0].code}
   mountSelector(host);vehChanged();const e=$('#cbEngine .cbx-in');if(e&&!S.vehicle.engine)e.focus()}});
 makeCombo($('#cbEngine'),{label:'Motorisation + puissance',placeholder:S.vehicle&&S.vehicle.model?'Motorisations '+S.vehicle.model:'Choisis le modèle',value:S.vehicle?S.vehicle.engine:'',empty:'Catalogue à compléter',
  options:function(){return engines(S.vehicle?S.vehicle.brand:'',S.vehicle?S.vehicle.model:'').map(function(e){
   return{label:e.l,sub:e.ch?e.ch+' ch':(e.f||''),_e:e}})},
  onPick:function(o){const e=o._e;if(!e)return;
   S.vehicle.engine=e.l;S.vehicle.ch=A.num(e.ch);S.vehicle.fuel=e.f||K.fuelGroup(e.l);S.vehicle.y=e.y;S.vehicle.code=e.code||'';
   mountSelector(host);vehChanged()}});
 const ys=$('#pfYear');
 if(ys)ys.addEventListener('change',function(e){S.yearFilter=e.target.value?+e.target.value:null;
  if(S.vehicle){if(S.vehicle.model&&models(S.vehicle.brand).indexOf(S.vehicle.model)<0){S.vehicle.model='';S.vehicle.engine='';S.vehicle.ch=null}
   if(S.vehicle.engine&&!engines(S.vehicle.brand,S.vehicle.model).some(function(x){return x.l===S.vehicle.engine})){S.vehicle.engine='';S.vehicle.ch=null}}
  mountSelector(host);vehChanged()});
 readout()}
function readout(){const el=$('#vehRead');if(!el)return;const v=S.vehicle;
 if(!v||!v.brand){el.innerHTML='<span class="mut">Marque → modèle → motorisation : corrélation positive par code moteur.</span>';return}
 const sig=K.signature(v);const info=C?C.info(v.brand,v.model):null;
 const bad=v.model&&C&&!C.isPairValid(v.brand,v.model);
 el.innerHTML='🚗 <b>'+esc(sig.brand)+'</b> '+esc(sig.model||'')+
 (info&&info.body?' <span class="badge">'+esc(info.body)+'</span>':'')+
 ' '+esc(sig.engine||'')+(sig.ch?' · <b class="pw">'+sig.ch+' ch</b> ('+sig.kw+' kW)':'')+
 ' · '+esc((sig.fuelGroup||'?').toUpperCase())+
 ' · <span class="badge b-dtc">'+esc(sig.codeLabel)+'</span>'+
 (bad?' <span class="badge b-crit">❌ modèle inexistant pour cette marque</span>':' <span class="badge b-mod">✅ validé</span>')}
function syncStudy(){const v=S.vehicle||{};
 const set=function(id,val){const e=$('#'+id);if(e)e.value=val==null?'':val};
 set('stMarque',v.brand);set('stModele',v.model);set('stMotor',v.engine);
 set('stAnnee',S.yearFilter||(v.y?v.y[1]:''));set('stEnergie',v.fuel||'');
 S.veh={marque:v.brand||'',modele:v.model||'',motor:v.engine||'',annee:S.yearFilter||(v.y?v.y[1]:''),vin:S.veh?S.veh.vin:''}}
function currentCorr(){const v=S.vehicle;if(!v||!v.brand)return null;
 if(v.model&&C&&!C.isPairValid(v.brand,v.model))return null;
 try{return K.correlate(v,{strict:PF.strict,readDtc:S.dtc||[],sys:PF.filter})}catch(e){log('error','correlate '+e.message);return null}}
function isSearch(){return S.view==='recherche'}
function vehChanged(){syncStudy();readout();paint();document.dispatchEvent(new CustomEvent('kf:vehicle',{detail:S.vehicle}))}
function paint(){try{if(isSearch()){renderPanel();runSearch()}else renderStudyPanel()}
 catch(e){log('error','paint '+e.message);const h=$('#srRes')||$('#vehPanel');
  if(h)h.innerHTML='<div class="card"><h2 class="st-fail">⚠️ Erreur</h2><p class="mut">'+esc(e.message)+'</p><button data-ps="clearQ">↻</button></div>'}}
/* ---------- rendu ---------- */
function sysChips(c){
 const avail=c&&c.avail?c.avail:{};
 return '<div class="card"><h2>🎛️ Filtres techniques natifs</h2>'+
 '<p class="mut">Sélectionne un système : les pannes, DTC, TSB et rappels correspondants sont recherchés dans toute la base puis restreints à <b>'+esc(c?c.sig.brand:'')+' '+esc(c?c.sig.model:'')+' '+esc(c?c.sig.engine:'')+'</b>.</p>'+
 '<div class="sysgrid">'+
 '<button class="sysbtn '+(PF.filter===''?'on':'')+'" data-ps="sysf" data-k=""><span class="ic">🔧</span><span class="lb">Tout</span><span class="ct">'+(c?c.faults.length:0)+'</span></button>'+
 SYS.map(function(s){const n=avail[s.k]||0;
  return '<button class="sysbtn '+(PF.filter===s.k?'on':'')+(n?'':' dim')+'" data-ps="sysf" data-k="'+s.k+'"><span class="ic">'+s.i+'</span><span class="lb">'+esc(s.l)+'</span>'+(n?'<span class="ct">'+n+'</span>':'')+'</button>'}).join('')+
 '</div></div>'}
function traceCard(c){const t=c.trace,s=c.sig;
 return '<div class="card"><h2>🧬 Signature moteur</h2><table class="kv">'+
 '<tr><td>Véhicule</td><td><b>'+esc(s.brand)+' '+esc(s.model)+'</b> '+esc(s.engine)+'</td></tr>'+
 '<tr><td>Puissance</td><td>'+(s.ch?'<b class="pw">'+s.ch+' ch</b> / '+s.kw+' kW':'non précisée')+'</td></tr>'+
 '<tr><td>Cylindrée / énergie</td><td>'+esc(s.disp||'—')+' · '+esc((s.fuelGroup||'?').toUpperCase())+'</td></tr>'+
 '<tr><td>Codes moteur</td><td><b>'+esc(s.codeLabel)+'</b></td></tr>'+
 '<tr><td>Niveaux de corrélation</td><td class="mut">code moteur '+t.t1+' · motorisation '+t.t2+' · modèle '+t.t3+' · marque+énergie '+t.t4+' · système '+t.t5+' / '+t.total+' fiches</td></tr>'+
 '<tr><td>Résultat</td><td><b>'+t.kept+' panne(s)</b> · '+c.dtc.length+' DTC · '+c.recalls.length+' rappel(s) · '+c.tsb.length+' TSB'+(t.fallback?' <span class="badge b-elev">repli garanti</span>':'')+(PF.filter?' · filtre <b>'+esc(K.SYSMAP[PF.filter]?K.SYSMAP[PF.filter].l:PF.filter)+'</b>':'')+'</td></tr></table></div>'}
function filterBar(pool){
 const sys=Array.from(new Set(A.arr(pool).map(function(k){return k&&k.s}).filter(Boolean))).sort();
 return '<div class="row" style="margin-bottom:8px"><button class="chipf '+(PF.strict?'on':'')+'" data-ps="strict">🎯 Strict</button>'+
 '<span class="mut">Strict = plage années + puissance respectées pour les niveaux larges.</span></div>'+
 '<div class="grid g3"><div><label>Système (libellé)</label><select data-ps="sys"><option value="">Tous</option>'+
 sys.map(function(s){return '<option '+(PF.sys===s?'selected':'')+'>'+esc(s)+'</option>'}).join('')+'</select></div>'+
 '<div><label>Gravité</label><select data-ps="grav"><option value="">Toutes</option>'+
 ['Critique','Élevé','Modéré'].map(function(g){return '<option '+(PF.grav===g?'selected':'')+'>'+g+'</option>'}).join('')+'</select></div>'+
 '<div><label>Filtre texte</label><input data-ps="q" value="'+esc(PF.q)+'" placeholder="courroie, crépine, AdBlue, P0016…"></div></div>'+
 '<div class="row"><button class="chipf '+(PF.fire?'on':'')+'" data-ps="fire">🔥 Incendie</button>'+
 '<button class="chipf '+(PF.dtc?'on':'')+'" data-ps="dtc">🔢 DTC</button>'+
 '<button class="chipf '+(PF.rappel?'on':'')+'" data-ps="rappel">📣 Rappels</button>'+
 '<button class="chipf '+(PF.tsb?'on':'')+'" data-ps="tsb">🧰 TSB</button></div>'}
function applyFilters(list,q){
 let out=A.arr(list).filter(function(k){return k&&typeof k==='object'});
 if(PF.filter)out=out.filter(function(k){return A.arr(k.sys).indexOf(PF.filter)>=0});
 if(PF.sys)out=out.filter(function(k){return k.s===PF.sys});
 if(PF.grav)out=out.filter(function(k){return k.g===PF.grav});
 if(PF.fire)out=out.filter(function(k){return k.fire});
 const query=[PF.q,q].filter(Boolean).join(' ');
 if(query)out=out.filter(function(k){return matchText((k.t||'')+' '+(k.mec||'')+' '+A.dtc(k.dtc).join(' ')+' '+(k.s||'')+' '+A.txt(k.sym).join(' ')+' '+A.txt(k.cons).join(' ')+' '+(k.tsb||'')+' '+(k.rec||''),query)});
 return out}
function dtcCard(c){const L=A.arr(c.dtc).filter(function(d){return d&&d.code});
 const shown=PF.filter?L.filter(function(d){return c.faults.some(function(f){return A.arr(f.sys).indexOf(PF.filter)>=0&&f.dtc.indexOf(d.code)>=0})}):L;
 return '<div class="card"><h2>🔢 Codes défauts — '+shown.length+'</h2>'+
 (shown.length?'<div class="row">'+shown.map(function(d){return '<span class="badge '+(d.fromModel?'b-crit':'b-dtc')+'" title="'+esc(A.txt(d.faults).join(' | '))+'">'+esc(d.code)+(d.read?' ✅':'')+(d.fromModel?' ★':'')+'</span>'}).join('')+'</div>'+
 '<p class="mut">★ issu d\'un TSB/rappel · ✅ lu sur le véhicule. Survol = pannes associées.</p>'+
 '<div class="row"><button data-ps="injectDtc">🧠 Injecter dans l\'étude</button><button data-ps="copyDtc">📋 Copier</button></div>':'<p class="mut">Aucun DTC pour ce filtre.</p>')+'</div>'}
function faultFull(k){
 const tier=k.tier||5;
 const rel=tier<=2?'b-crit':tier===3?'b-elev':'b-mod';
 const D=A.dtc(k.dtc),Y=A.yrs(k.y)||[1995,2027];
 const sysb=A.arr(k.sys).slice(0,6).map(function(s){const m=K.SYSMAP[s];return m?'<span class="badge">'+m.i+' '+esc(m.l)+'</span>':''}).join('');
 return '<div class="card faultcard t'+tier+'"><h3>'+esc(k.t)+'</h3>'+
 '<div><span class="badge '+rel+'">'+esc(k.relevance||'—')+'</span>'+
 '<span class="badge '+(k.g==='Critique'?'b-crit':k.g==='Élevé'?'b-elev':'b-mod')+'">'+esc(k.g)+'</span>'+
 (k.fire?'<span class="badge b-fire">🔥 incendie</span>':'')+
 '<span class="badge">'+esc(k.s)+'</span><span class="badge">'+Y[0]+'–'+Y[1]+'</span>'+
 (A.arr(k.eng).length?'<span class="badge b-dtc">'+esc(A.arr(k.eng).slice(0,4).join('/'))+'</span>':'')+
 (A.arr(k.pw).length?'<span class="badge">'+esc(A.arr(k.pw).slice(0,8).join('/')+' ch')+'</span>':'')+
 D.map(function(d){return '<span class="badge b-dtc">'+esc(d)+'</span>'}).join('')+'</div>'+
 '<div style="margin:4px 0">'+sysb+'</div>'+
 '<p class="mut"><b>Corrélation :</b> '+esc(A.txt(k.why).join(' · '))+' · score '+k.sc+'</p>'+
 '<p><b>Mécanisme :</b> '+esc(k.mec||'—')+'</p>'+
 (k.chain?'<p class="b-fire"><b>Chaîne causale :</b> '+esc(k.chain)+'</p>':'')+
 '<p class="mut"><b>Symptômes :</b> '+esc(A.txt(k.sym).join(' · ')||'—')+'</p>'+
 '<p class="mut"><b>Conséquences :</b> '+esc(A.txt(k.cons).join(' · ')||'—')+'</p>'+
 '<p class="mut"><b>Preuves :</b> '+esc(A.txt(k.prv).join(' · ')||'—')+'</p>'+
 '<p class="mut"><b>Tests :</b> '+esc(A.txt(k.tst).join(' · ')||'—')+'</p>'+
 (A.txt(k.act).length?'<p class="mut"><b>Actions :</b> '+esc(A.txt(k.act).join(' · '))+'</p>':'')+
 '<p class="mut"><b>Sécurité :</b> '+esc(k.sec||'—')+'</p>'+
 (k.tsb?'<p class="b-elev"><b>🧰 TSB :</b> '+esc(k.tsb)+'</p>':'')+
 (k.rec?'<p class="b-fire"><b>📣 Rappel :</b> '+esc(k.rec)+'</p>':'')+
 (A.arr(k.linkTsb).length?'<p class="mut"><b>TSB liés :</b> '+A.arr(k.linkTsb).map(function(t){return esc(t.ref)}).join(' · ')+'</p>':'')+
 (A.arr(k.linkRec).length?'<p class="mut"><b>Rappels liés :</b> '+A.arr(k.linkRec).map(function(r){return esc(r.t)}).join(' · ')+'</p>':'')+
 (A.arr(k.legal).length?'<p class="mut"><b>Juridique :</b> '+A.arr(k.legal).map(function(l){return l&&l.ref?'<span class="badge b-law">'+esc(l.ref)+'</span>':''}).join(' ')+'</p>':'')+
 '<div class="row"><button class="pri" data-ps="fiche" data-k="'+esc(k.id)+'">📋 Fiche</button>'+
 '<button data-ps="studyOne" data-k="'+esc(k.id)+'">🧠 Étudier</button>'+
 '<button data-ps="toJR" data-k="'+esc(k.id)+'">⚖️ JusteRepère</button>'+
 '<button data-ps="toAD" data-k="'+esc(k.id)+'">🧠 Auto-Droit</button></div></div>'}
function recallCard(r){const Y=A.yrs(r.y)||[1995,2027];
 return '<div class="card"><b>'+(r.fire?'🔥 ':'')+esc(r.t)+'</b> <span class="badge">'+esc(r.src||'Campagne')+'</span>'+
 (r._generic?' <span class="badge b-elev">marque (générique)</span>':' <span class="badge b-mod">modèle</span>')+
 '<p class="mut">'+esc(r.risk||'—')+'</p><p class="mut">'+Y[0]+'–'+Y[1]+' · '+esc(A.dtc(r.dtc).join(', ')||'—')+'</p></div>'}
function tsbCard(t){const Y=A.yrs(t.y)||[1995,2027];
 return '<div class="card"><b>'+esc(t.ref)+'</b> <span class="badge '+(t.g==='Critique'?'b-crit':'b-elev')+'">'+esc(t.g||'—')+'</span>'+
 '<p>'+esc(t.s||'—')+'</p><p class="mut">'+esc(t.sys||'—')+' · '+esc(A.dtc(t.dtc).join(', ')||'—')+' · '+Y[0]+'–'+Y[1]+
 (A.arr(t.e).length?' · '+esc(A.arr(t.e).slice(0,4).join(', ')):'')+'</p></div>'}
function resultsHTML(c,q){
 const pan=applyFilters(c.faults,q);
 const flt=PF.filter?K.SYSMAP[PF.filter]:null;
 const rapAll=PF.rappel?A.arr(c.recalls):[];
 const rap=flt?rapAll.filter(function(r){return flt.re.test(norm(r.t+' '+r.risk))||A.dtc(r.dtc).some(function(d){return pan.some(function(f){return f.dtc.indexOf(d)>=0})})}):rapAll;
 const tsbAll=PF.tsb?A.arr(c.tsb):[];
 const tsb=flt?tsbAll.filter(function(t){return flt.re.test(norm(t.ref+' '+t.s+' '+t.sys))||A.dtc(t.dtc).some(function(d){return pan.some(function(f){return f.dtc.indexOf(d)>=0})})}):tsbAll;
 const rapF=rap.filter(function(r){return !q||matchText(r.t+' '+r.risk+' '+A.dtc(r.dtc).join(' '),q)});
 const tsbF=tsb.filter(function(t){return !q||matchText(t.ref+' '+t.s+' '+t.sys+' '+A.dtc(t.dtc).join(' '),q)});
 const s=c.sig;
 const direct=pan.filter(function(f){return f.tier<=2}).length;
 return '<div class="card accent"><h2>🎯 '+esc(s.brand)+' '+esc(s.model||'')+' '+esc(s.engine||'')+(s.ch?' '+s.ch+' ch':'')+'</h2>'+
 '<p class="mut"><b>'+pan.length+' panne(s)</b> dont <b>'+direct+' en direct code moteur</b> · '+c.dtc.length+' DTC · '+rapF.length+' rappel(s) · '+tsbF.length+' TSB'+
 (flt?' · filtre <b>'+flt.i+' '+esc(flt.l)+'</b>':'')+(q?' · « '+esc(q)+' »':'')+'</p>'+
 '<div class="row"><button class="pri" data-ps="study">🧠 Lancer l\'étude corrélée</button><button data-ps="injectDtc">🔢 Injecter DTC</button><button data-ps="web">🌐 Recherche internet</button></div></div>'+
 '<div class="card"><h2>🔧 Pannes connues ('+pan.length+')</h2>'+
 (pan.length?pan.map(faultFull).join(''):'<p class="mut">Aucune panne pour ce filtre — choisis « Tout » ou un autre système.</p>')+'</div>'+
 (PF.rappel?'<div class="card"><h2>📣 Campagnes de rappel ('+rapF.length+')</h2>'+(rapF.length?rapF.slice(0,40).map(recallCard).join('')+(rapF.length>40?'<p class="mut">+ '+(rapF.length-40)+' autres rappels (affinage par filtre système).</p>':''):'<p class="mut">Aucun rappel.</p>')+'</div>':'')+
 (PF.tsb?'<div class="card"><h2>🧰 Bulletins techniques TSB ('+tsbF.length+')</h2>'+(tsbF.length?tsbF.map(tsbCard).join(''):'<p class="mut">Aucun TSB.</p>')+'</div>':'')}
function renderPanel(){const h=$('#srPanel');if(!h)return;
 if(S.vehicle&&S.vehicle.model&&C&&!C.isPairValid(S.vehicle.brand,S.vehicle.model)){
  h.innerHTML='<div class="card accent"><h2 class="st-fail">❌ Combinaison inexistante</h2><p class="mut">« '+esc(S.vehicle.model)+' » n\'est pas un modèle '+esc(S.vehicle.brand)+'. Marques réelles : <b>'+esc(C.modelOwner(S.vehicle.model).join(', ')||'—')+'</b>.</p></div>';return}
 const c=currentCorr();
 if(!c){h.innerHTML='<div class="card mut">Sélectionne marque → modèle → motorisation.</div>';return}
 h.innerHTML=traceCard(c)+sysChips(c)+'<div class="card"><h2>🔗 Filtres avancés</h2>'+filterBar(c.faults)+'</div>'+(PF.dtc?dtcCard(c):'')}
function runSearch(){const h=$('#srRes');if(!h)return;
 try{const qe=$('#srQ'),q=qe?qe.value.trim():'';
  if(S.vehicle&&S.vehicle.model&&C&&!C.isPairValid(S.vehicle.brand,S.vehicle.model)){h.innerHTML='';return}
  const c=currentCorr();
  if(!c){h.innerHTML='<div class="card"><h2>🔎 Recherche</h2><p class="mut">Choisis marque → modèle → motorisation.</p></div>';return}
  h.innerHTML=resultsHTML(c,q)}catch(e){log('error','runSearch '+e.message);
  h.innerHTML='<div class="card"><h2 class="st-fail">⚠️ Interrompu</h2><p class="mut">'+esc(e.message)+'</p><button data-ps="clearQ">↻</button></div>'}}
function renderStudyPanel(){const h=$('#vehPanel');if(!h)return;
 if(S.vehicle&&S.vehicle.model&&C&&!C.isPairValid(S.vehicle.brand,S.vehicle.model)){
  h.innerHTML='<div class="card accent"><h2 class="st-fail">❌ Combinaison inexistante</h2><p class="mut">Marques réelles pour « '+esc(S.vehicle.model)+' » : '+esc(C.modelOwner(S.vehicle.model).join(', ')||'—')+'</p></div>';return}
 const c=currentCorr();
 if(!c){h.innerHTML='<div class="card mut">Sélectionne marque → modèle → motorisation.</div>';return}
 h.innerHTML=traceCard(c)+sysChips(c)+'<div class="card"><h2>🔗 Filtres avancés</h2>'+filterBar(c.faults)+'</div>'+(PF.dtc?dtcCard(c):'')+resultsHTML(c,'')}
/* ---------- étude ---------- */
function studyForm(){const g=function(id){const e=$('#'+id);return e?e.value:''};const v=S.vehicle||{};
 return{brand:v.brand||'',model:v.model||'',engine:v.engine||'',ch:A.num(v.ch),fuel:v.fuel||'',y:A.yrs(v.y),code:v.code||'',
  vendeur:g('stVendeur')||'pro',achat:g('stAchat'),neuf:g('stNeuf')||'occasion',prix:g('stPrix'),
  constats:Array.prototype.map.call(document.querySelectorAll('#stConstats input:checked'),function(i){return i.value}),
  dtc:A.dtc(g('stDtc')),ctx:String(g('stCtx')||'').trim(),filter:PF.filter}}
function lawOf(id){try{const l=txtById(id);return l&&l.t?l:null}catch(e){return null}}
function qualifySafe(f,form){const out=[],add=function(id,why){const l=lawOf(id);if(l&&!out.some(function(x){return x.id===l.id}))out.push(Object.assign({},l,{why:why}))};
 const grave=form.constats.indexOf('incendie')>=0||form.constats.indexOf('véhicule immobilisé')>=0||A.arr(f).some(function(k){return k&&k.g==='Critique'});
 const mo=form.achat?Math.floor((Date.now()-new Date(form.achat).getTime())/2629800000):null;
 if(form.vendeur==='pro'){add('CONSO2173','Vendeur professionnel → garantie légale de conformité');
  if(mo!==null&&mo<=(form.neuf==='occasion'?12:24))add('CONSO2177','Présomption d\'antériorité ('+(form.neuf==='occasion'?12:24)+' mois)')}
 if(grave)add('CC1641','Défaut grave → résolution ou réduction du prix');
 if(form.constats.indexOf('après entretien')>=0||/répar|garage|entretien/i.test(form.ctx))add('CC12311','Réparateur → obligation de résultat');
 if(form.constats.indexOf('incendie')>=0||A.arr(f).some(function(k){return k&&k.fire})){
  add('CC1245','Défaut de sécurité du produit');add('CONSOL4213','Obligation générale de sécurité — campagnes de rappel');
  if(/propag|voisin|tiers/i.test(form.ctx))add('CC1240','Dommages aux tiers')}
 if(/dissimul|menti|maquill|tromp|compteur/i.test(form.ctx))add('CC1137','Dissimulation → dol');
 A.arr(f).forEach(function(k){if(k)A.arr(k.law).forEach(function(id){if(typeof id==='string')add(id,'Fondement de la fiche : '+k.t)})});
 if(!out.length)add('CC1641','À qualifier selon gravité et antériorité');
 return out}
function runStudySafe(focusId){const h=$('#stResult');if(!h)return;
 try{const form=studyForm();
  if(!form.brand){h.innerHTML='<div class="card"><h2 class="st-warn">🚗 Véhicule requis</h2><p class="mut">Sélectionne marque → modèle → motorisation.</p></div>';return}
  if(form.model&&C&&!C.isPairValid(form.brand,form.model)){
   h.innerHTML='<div class="card accent"><h2 class="st-fail">❌ Combinaison inexistante</h2><p class="mut">Marques réelles : '+esc(C.modelOwner(form.model).join(', ')||'—')+'</p></div>';return}
  const c=K.correlate(form,{strict:PF.strict,readDtc:form.dtc,sys:form.filter});
  let top=applyFilters(c.faults,'').slice(0,12);
  if(focusId){const one=c.faults.find(function(x){return x&&x.id===focusId});if(one)top=[one].concat(top.filter(function(x){return x.id!==focusId})).slice(0,12)}
  if(!top.length)top=c.faults.slice(0,12);
  const laws=qualifySafe(top,form),best=top.length?(top[0].sc||0):0;
  const direct=top.filter(function(k){return k.tier<=2}).length;
  const level=direct>=2?'PROBABLE — faisceau technique fort':direct>=1?'PROBABLE':best>=11?'POSSIBLE — à confirmer par mesures':'INDÉTERMINÉ — compléter les mesures';
  const fires=top.filter(function(k){return k.fire});
  const study={ts:new Date().toISOString(),version:'9.0.0',form:form,signature:c.sig,filter:PF.filter,
   top:top.map(function(k){return{id:k.id,t:k.t,s:k.s,g:k.g,fire:!!k.fire,dtc:A.dtc(k.dtc),mec:k.mec||'',chain:k.chain||'',
    cons:A.txt(k.cons),sym:A.txt(k.sym),prv:A.txt(k.prv),tst:A.txt(k.tst),act:A.txt(k.act),sec:k.sec||'',sc:k.sc||0,
    why:A.txt(k.why),relevance:k.relevance||'',tier:k.tier,sys:A.arr(k.sys),tsb:k.tsb,rec:k.rec,
    law:A.arr(k.law).filter(function(x){return typeof x==='string'})}}),
   laws:laws.map(function(l){return{id:l.id,ref:l.ref,t:l.t,why:l.why,delai:l.delai,txt:l.txt}}),
   fires:fires.map(function(k){return{t:k.t,chain:k.chain||'',sec:k.sec}}),
   recalls:A.arr(c.recalls).slice(0,40).map(function(r){return{t:r.t,src:r.src,risk:r.risk,y:A.yrs(r.y),dtc:A.dtc(r.dtc)}}),
   tsb:A.arr(c.tsb).map(function(t){return{ref:t.ref,sys:t.sys,s:t.s,y:A.yrs(t.y),dtc:A.dtc(t.dtc),g:t.g}}),
   dtc:A.arr(c.dtc),level:level,trace:c.trace};
  S.study=study;S.lastCorr=c;const hh=ls.get('studies',[]);hh.unshift(study);ls.set('studies',hh.slice(0,20));
  h.innerHTML='<div class="card accent"><h2>🧠 Étude corrélée — <span class="'+(direct?'st-warn':'st-ok')+'">'+esc(level)+'</span></h2>'+
   '<p class="mut"><b>'+esc(form.brand)+' '+esc(form.model)+' '+esc(form.engine)+'</b>'+(form.ch?' · '+form.ch+' ch':'')+' · code '+esc(c.sig.codeLabel)+' · '+esc(form.vendeur==='pro'?'vendeur professionnel':'particulier')+'</p>'+
   '<p class="mut">'+top.length+' cause(s) dont <b>'+direct+' en direct code moteur</b> · '+c.dtc.length+' DTC · '+c.recalls.length+' rappel(s) · '+c.tsb.length+' TSB'+(PF.filter?' · filtre '+esc(K.SYSMAP[PF.filter]?K.SYSMAP[PF.filter].l:''):'')+'</p>'+
   '<p class="mut">Constatations : '+esc(A.txt(form.constats).join(', ')||'—')+' · DTC lus : '+esc(A.dtc(form.dtc).join(', ')||'—')+'</p>'+
   '<div class="row"><button class="pri" data-ps="studyPdf">🖨️ Rapport PDF</button><button data-ps="studyJson">📤 JSON</button><button data-ps="studyDoss">📁 Dossier juridique</button><button class="jr" data-ps="studyJR">⚖️ JusteRepère</button></div></div>'+
   '<div class="card"><h2>🔧 Causes corrélées ('+top.length+')</h2>'+top.map(faultFull).join('')+'</div>'+
   (fires.length?'<div class="card"><h2>🔥 Chaînes causales incendie ('+fires.length+')</h2>'+fires.map(function(k){return '<div class="card"><b>'+esc(k.t)+'</b><p class="b-fire">'+esc(k.chain||'—')+'</p><p class="mut"><b>Sécurité :</b> '+esc(k.sec||'—')+'</p></div>'}).join('')+'</div>':'')+
   '<div class="card"><h2>⚖️ Qualification juridique ('+laws.length+')</h2>'+laws.map(function(l){return '<div class="card"><h3>'+esc(l.t)+' <span class="badge b-law">'+esc(l.ref)+'</span></h3><p>'+esc(l.txt)+'</p><p class="mut"><b>Délai :</b> '+esc(l.delai)+'</p><p class="b-law"><b>Application au cas :</b> '+esc(l.why)+'</p></div>'}).join('')+'</div>'+
   (c.recalls.length?'<div class="card"><h2>📣 Rappels à vérifier ('+c.recalls.length+')</h2>'+c.recalls.slice(0,30).map(recallCard).join('')+'</div>':'')+
   (c.tsb.length?'<div class="card"><h2>🧰 TSB applicables ('+c.tsb.length+')</h2>'+c.tsb.map(tsbCard).join('')+'</div>':'')+
   '<div class="card"><h2>🧭 Méthode & réserves</h2><p class="mut">Qualifier → Inférer → Corréler (code moteur) → Analyser → Tester → Conclure. Document d\'aide à l\'expertise ; ne constitue pas une expertise judiciaire contradictoire.</p></div>';
  toast('🧠 Étude générée · '+direct+' cause(s) directe(s)');h.scrollIntoView({behavior:'smooth',block:'start'});
 }catch(e){log('error','study '+e.message);
  h.innerHTML='<div class="card"><h2 class="st-fail">⚠️ Étude interrompue</h2><p class="mut">'+esc(e.message)+'</p><div class="row"><button class="pri" data-ps="study">↻ Relancer</button><button data-ps="clearQ">✖ Réinitialiser filtres</button></div></div>'}}
function studyPdf(){const s=S.study;if(!s){toast('Lance une étude');return}const f=s.form;
 $('#printArea').innerHTML='<h1>🔥 KEV FUSION — Étude corrélée v9</h1><p>'+new Date(s.ts).toLocaleString('fr-FR')+' · '+esc(S.role==='admin'?'Expert (admin)':(S.prenom||''))+'</p>'+
 '<h2>1. Véhicule</h2><p><b>'+esc(f.brand)+' '+esc(f.model)+' '+esc(f.engine)+'</b>'+(f.ch?' · '+f.ch+' ch':'')+' · code moteur '+esc(s.signature.codeLabel)+' · '+esc(f.fuel||'')+'</p>'+
 '<p>Vendeur '+esc(f.vendeur==='pro'?'professionnel':'particulier')+' · achat '+esc(f.achat||'?')+' ('+esc(f.neuf)+') · '+esc(f.prix||'?')+' €</p>'+
 '<p>Constatations : '+esc(A.txt(f.constats).join(', ')||'—')+' · DTC : '+esc(A.dtc(f.dtc).join(', ')||'—')+'</p><p>'+esc(f.ctx||'')+'</p>'+
 '<h2>2. Conclusion technique : '+esc(s.level)+'</h2>'+
 A.arr(s.top).map(function(k,i){return '<p><b>'+(i+1)+'. '+esc(k.t)+'</b> — '+esc(k.relevance)+' (score '+k.sc+')<br>'+
  '<i>Mécanisme :</i> '+esc(k.mec)+'<br><i>DTC :</i> '+esc(A.dtc(k.dtc).join(', '))+'<br>'+
  (k.chain?'<i>Chaîne causale :</i> '+esc(k.chain)+'<br>':'')+
  '<i>Conséquences :</i> '+esc(A.txt(k.cons).join(' ; '))+'<br>'+
  '<i>Preuves :</i> '+esc(A.txt(k.prv).join(' ; '))+'<br><i>Tests :</i> '+esc(A.txt(k.tst).join(' ; '))+'<br>'+
  '<i>Actions :</i> '+esc(A.txt(k.act).join(' ; '))+'<br><i>Sécurité :</i> '+esc(k.sec)+
  (k.tsb?'<br><i>TSB :</i> '+esc(k.tsb):'')+(k.rec?'<br><i>Rappel :</i> '+esc(k.rec):'')+'</p>'}).join('')+
 '<h2>3. Qualification juridique</h2>'+A.arr(s.laws).map(function(l){return '<p><b>'+esc(l.t)+'</b> — '+esc(l.ref)+'<br>'+esc(l.txt)+'<br><i>Délai :</i> '+esc(l.delai)+'<br><i>Application :</i> '+esc(l.why)+'</p>'}).join('')+
 '<h2>4. Campagnes de rappel</h2>'+(A.arr(s.recalls).length?A.arr(s.recalls).map(function(r){return '<p>'+esc(r.t)+' ('+esc(r.src)+') — '+esc(r.risk)+'</p>'}).join(''):'<p>Aucun.</p>')+
 '<h2>5. Bulletins techniques</h2>'+(A.arr(s.tsb).length?A.arr(s.tsb).map(function(t){return '<p>'+esc(t.ref)+' — '+esc(t.s)+'</p>'}).join(''):'<p>Aucun.</p>')+
 '<h2>6. Méthode</h2><p>Corrélation par code moteur, modèle, puissance, énergie et plage d\'années. Aide à l\'expertise — ne constitue pas une expertise judiciaire contradictoire.</p>';
 document.body.classList.add('printing');window.print();setTimeout(function(){document.body.classList.remove('printing')},800)}
function studyDoss(){const s=S.study;if(!s){toast('Lance une étude');return}
 const first=A.arr(s.laws)[0]?s.laws[0].id:'CC1641';const cat=(typeof CAT2LAW==='object'&&CAT2LAW[first])||'autre';
 const d=newDossier({cat:cat,titre:(s.form.brand+' '+s.form.model+' '+s.form.engine+' — '+(PROCEDURES[cat]?PROCEDURES[cat].label:'Litige')).trim(),
  veh:{marque:s.form.brand,modele:s.form.model,motor:s.form.engine,annee:s.form.y?s.form.y[1]:'',vin:S.veh?S.veh.vin:'',prix:s.form.prix,achat:s.form.achat,neuf:s.form.neuf},
  vendeur:{nom:'',adresse:'',type:s.form.vendeur},decouverte:new Date().toISOString().slice(0,10),
  faits:(s.form.ctx||'')+' Causes : '+A.arr(s.top).map(function(x){return x.t}).join(' ; '),etude:{level:s.level,top:s.top,fires:s.fires}});
 saveDossier(d);S.doss=d;switchView('dossiers');openDossier(d.id);toast('📁 Dossier créé')}
function studyJR(){const s=S.study;if(!s){toast('Lance une étude');return}
 S.jr.dom='route';S.jr.result=null;switchView('jr');
 setTimeout(function(){const a=$('#jrVehMarque'),b=$('#jrVehMotor'),t=$('#jrTitre'),f=$('#jrFaits');
  if(a)a.value=s.form.brand+' '+s.form.model;if(b)b.value=s.form.engine+(s.form.ch?' '+s.form.ch+' ch':'');
  if(t)t.value=s.form.brand+' '+s.form.model+' — '+A.arr(s.top).map(function(x){return x.t}).slice(0,2).join(' / ');
  if(f)f.value=(s.form.ctx||'')+' '+A.arr(s.top).map(function(x){return x.t+' : '+x.mec}).join(' ; ')},90)}
function fiche(id){const c=currentCorr();if(!c)return;const k=A.arr(c.faults).find(function(x){return x&&x.id===id});if(!k)return;
 openModal('<h2>📋 '+esc(k.t)+'</h2>'+faultFull(k)+'<div class="row"><button class="pri" data-ps="studyOne" data-k="'+esc(k.id)+'">🧠 Étudier ce cas</button><button data-act="closeModal">Fermer</button></div>')}
/* ---------- vues ---------- */
window.doSearch=function(){if(isSearch())runSearch()};
window.scoreKB=function(inp){try{const v={brand:inp.marque,model:inp.modele,engine:inp.motor,ch:S.vehicle&&S.vehicle.ch,fuel:inp.energie,y:S.vehicle&&S.vehicle.y,code:S.vehicle&&S.vehicle.code};
 if(v.model&&C&&!C.isPairValid(v.brand,v.model))return[];
 const c=K.correlate(v,{strict:true,readDtc:inp.dtc||[],sys:PF.filter});S.lastCorr=c;return A.arr(c.faults).slice(0,12)}catch(e){return[]}};
window.runStudy=function(){runStudySafe()};
window.renderSearch=function(){
 $('#view').innerHTML='<div class="card"><h2>🔎 Recherche prédictive — corrélation code moteur</h2><div id="srSel"></div>'+
 '<label>Recherche libre</label><input id="srQ" placeholder="courroie, crépine, bougies, déphaseurs, AdBlue, FAP, chaîne 7mm, P0016…" autocomplete="off">'+
 '<div class="row"><button class="pri" data-ps="run">🔎 Rechercher</button><button data-ps="clearQ">✖ Réinitialiser</button>'+
 (C?'<button data-ps="purge">🛠️ Purger données invalides</button>':'')+'</div></div>'+
 '<div id="srPanel"></div><div id="srRes"></div>';
 mountSelector($('#srSel'));const q=$('#srQ');if(q)q.addEventListener('input',runSearch);paint()};
window.renderStudy=function(){
 $('#view').innerHTML='<div class="card"><h2>🧠 Étude croisée — corrélation code moteur</h2><div id="selStudy"></div></div>'+
 '<div class="card"><h2>📋 Contexte & constatations</h2><div class="grid g3">'+
 '<div><label>Vendeur</label><select id="stVendeur"><option value="pro">Professionnel</option><option value="part">Particulier</option></select></div>'+
 '<div><label>Date d\'achat</label><input id="stAchat" type="date"></div>'+
 '<div><label>Neuf/occasion</label><select id="stNeuf"><option value="occasion">Occasion</option><option value="neuf">Neuf</option></select></div>'+
 '<div><label>Prix €</label><input id="stPrix" type="number"></div></div>'+
 '<label>Constatations</label><div class="constats" id="stConstats">'+CONSTATS.map(function(c){return '<label><input type="checkbox" value="'+c+'">'+c+'</label>'}).join('')+'</div>'+
 '<label>DTC lus sur le véhicule</label><input id="stDtc" value="'+A.dtc(S.dtc).join(' ')+'" placeholder="P0016 P0521 P20EE…">'+
 '<label>Contexte</label><textarea id="stCtx" placeholder="Historique, interventions, dissimulation suspectée…"></textarea>'+
 '<div class="row"><button class="pri" data-ps="study">⚙️ Lancer l\'étude corrélée</button><button data-ps="clearQ">✖ Réinitialiser filtres</button></div></div>'+
 '<div id="vehPanel"></div><div id="stResult"></div>';
 mountSelector($('#selStudy'));syncStudy();paint()};
const _home=window.renderHome;
window.renderHome=function(){_home();const v=$('#view');const c=currentCorr();if(!v||!c)return;
 const direct=c.faults.filter(function(f){return f.tier<=2}).length;
 v.insertAdjacentHTML('afterbegin','<div class="card accent"><h2>🚗 Véhicule courant</h2>'+
 '<p><b>'+esc(c.sig.brand)+' '+esc(c.sig.model||'')+' '+esc(c.sig.engine||'')+'</b>'+(c.sig.ch?' · <b class="pw">'+c.sig.ch+' ch</b>':'')+'</p>'+
 '<p class="mut">'+c.faults.length+' pannes dont '+direct+' directes · '+c.dtc.length+' DTC · '+c.recalls.length+' rappels · '+c.tsb.length+' TSB · code '+esc(c.sig.codeLabel)+'</p>'+
 '<div class="row"><button class="pri" data-act="nav" data-k="recherche">🔎 Recherche</button><button data-act="nav" data-k="etude">🧠 Étude</button></div></div>')};
/* ---------- dispatcher ---------- */
document.addEventListener('change',function(e){const p=e.target.dataset.ps;if(p==='sys'||p==='grav'){PF[p]=e.target.value;paint()}});
document.addEventListener('input',function(e){if(e.target.dataset.ps==='q'){PF.q=e.target.value;paint()}});
document.addEventListener('click',async function(e){
 const b=e.target.closest('[data-ps]');if(!b)return;const p=b.dataset.ps,k=b.dataset.k;
 if(p==='sysf'){PF.filter=k||'';paint();
  toast(k?('🎛️ Filtre '+(K.SYSMAP[k]?K.SYSMAP[k].l:k)):'🎛️ Tous les systèmes');return}
 if(p==='purge'){const n=C?C.purge():0;toast('🛠️ '+n+' entrée(s) invalide(s) purgée(s)');mountSelector($('#srSel')||$('#selStudy'));paint();return}
 if(p==='web'){if(window.KFWebSearch&&S.vehicle&&S.vehicle.brand){toast('🌐 Recherche internet…');
   try{const r=await KFWebSearch.searchWithTranslation(S.vehicle.brand,S.vehicle.model,S.yearFilter||(S.vehicle.y?S.vehicle.y[1]:2020));
    const h=$('#srRes')||$('#stResult');if(h)h.insertAdjacentHTML('beforeend',KFWebSearch.renderWebResults(r));toast('🌐 '+r.length+' résultat(s)')}
   catch(x){toast('Web : '+x.message)}}else toast('Sélectionne un véhicule');return}
 if(p==='study'){e.preventDefault();closeModal();if(S.view!=='etude'){switchView('etude');setTimeout(function(){runStudySafe()},110)}else runStudySafe();return}
 if(p==='studyOne'){e.preventDefault();closeModal();if(S.view!=='etude'){switchView('etude');setTimeout(function(){runStudySafe(k)},110)}else runStudySafe(k);return}
 if(p==='studyPdf'){studyPdf();return}
 if(p==='studyJson'){if(S.study)download('etude-correlee-'+Date.now()+'.json',S.study);else toast('Lance une étude');return}
 if(p==='studyDoss'){studyDoss();return}
 if(p==='studyJR'){studyJR();return}
 if(p==='run'){paint();toast('🔎 Corrélation actualisée');return}
 if(p==='strict'){PF.strict=!PF.strict;paint();return}
 if(p==='fire'||p==='rappel'||p==='tsb'||p==='dtc'){PF[p]=!PF[p];paint();return}
 if(p==='clearQ'){PF.q='';PF.sys='';PF.grav='';PF.fire=false;PF.strict=true;PF.filter='';const q=$('#srQ');if(q)q.value='';paint();toast('✖ Filtres réinitialisés');return}
 if(p==='fiche'){fiche(k);return}
 if(p==='injectDtc'){const c=currentCorr();if(!c)return;
  const pan=applyFilters(c.faults,'');const set=new Set();pan.forEach(function(f){A.dtc(f.dtc).forEach(function(d){set.add(d)})});
  if(!set.size)c.dtc.forEach(function(d){set.add(d.code)});
  S.dtc=Array.from(set);
  if(S.view!=='etude'){switchView('etude');setTimeout(function(){const t=$('#stDtc');if(t)t.value=S.dtc.join(' ')},110)}
  else{const t=$('#stDtc');if(t)t.value=S.dtc.join(' ')}
  toast('🔢 '+S.dtc.length+' DTC injectés');return}
 if(p==='copyDtc'){const c=currentCorr();if(!c)return;
  try{await navigator.clipboard.writeText(A.arr(c.dtc).map(function(d){return d.code}).join(' '));toast('📋 DTC copiés')}catch(x){toast('Copie impossible')}return}
 if(p==='toJR'){const cc=currentCorr();const kb=cc?A.arr(cc.faults).find(function(x){return x&&x.id===k}):null;
  S.jr.dom='route';S.jr.result=null;switchView('jr');
  setTimeout(function(){const a=$('#jrVehMarque'),b2=$('#jrVehMotor'),f=$('#jrFaits');
   if(a)a.value=S.vehicle?S.vehicle.brand+' '+S.vehicle.model:'';if(b2)b2.value=S.vehicle?S.vehicle.engine:'';
   if(f)f.value=kb?kb.t+' : '+kb.mec:''},110);return}
 if(p==='toAD'){const cc=currentCorr();const kb=cc?A.arr(cc.faults).find(function(x){return x&&x.id===k}):null;switchView('droitsmart');
  setTimeout(function(){const t=$('#adText');if(t)t.value=(S.vehicle?S.vehicle.brand+' '+S.vehicle.model+' '+S.vehicle.engine+' : ':'')+(kb?kb.t+' — '+kb.mec:'')},110);return}});
window.KFPredictive={brands:brands,models:models,engines:engines,correlate:currentCorr,runSearch:runSearch,study:runStudySafe,SYS:SYS};
})();
