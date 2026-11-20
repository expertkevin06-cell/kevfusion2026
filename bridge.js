/* KEV FUSION 2026 — bridge.js v1.0.0
   COUCHE D'INTEROPÉRABILITÉ + CENTRE DE SANTÉ DU PROJET.
   Cause racine corrigée : les fichiers d'origine déclarent leurs globaux en `const` / `let`
   (S, NAV, FAULTS, KFCatalog…). Ces liaisons lexicales ne sont PAS des propriétés de `window` :
   tous les modules récents qui lisent `window.X` ne les voyaient pas et ne s'appliquaient pas
   (base retombée à 63 pannes, catalogue 33 marques, extensions silencieuses).
   bridge.js republie ces globaux sur window AVANT le chargement des extensions, surveille
   l'application réelle des bases, et fournit un centre de santé avec réparation en un geste
   (ré-injection idempotente des extensions), purge, mise à jour et export. */
(function(){
'use strict';
/* ══════════ socle ══════════ */
function $(s,r){try{return (r||document).querySelector(s)}catch(e){return null}}
function $$(s,r){try{return Array.prototype.slice.call((r||document).querySelectorAll(s))}catch(e){return[]}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ls(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}}
function sl(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}
function toast(m){try{if(typeof window.toast==='function')window.toast(m);
 else{var t=$('#toast');if(t){t.textContent=m;t.classList.remove('hid');t.classList.add('show');
  clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3000)}}}catch(e){}}
function grab(n){try{return (0,eval)('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return undefined}}
var AU={c:null,on:ls('bhSound',true)};
function snd(k){if(!AU.on)return;
 try{var c=AU.c||(AU.c=new (window.AudioContext||window.webkitAudioContext)());
  if(c.state==='suspended')c.resume();
  var m={ok:[523,880,.2,'triangle'],warn:[420,300,.18,'sawtooth'],tick:[1300,1300,.02,'sine'],
   fix:[392,660,.26,'triangle']}[k]||[900,900,.04,'sine'];
  var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(60,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.1,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.03)}catch(e){}}

/* ══════════ 1. republication des globaux lexicaux ══════════ */
var NAMES=['S','NAV','MODULES','MODS','APPS','FAULTS','RECALLS','TSBDB','KB','PHOTOS','DOSSIERS',
 'PROCEDURES','CAT2LAW','JRULES','JTPL','JDOM','VINWMI','WMI','ADMIN_HASH','CAT','OWNER','LOCK',
 'KFCatalog','KFCorr','KFPredictive','KBall','Rall','TSBall','A','F','ls','esc','norm','toast',
 'switchView','enterApp','runChecks','renderVerdict','renderStudy','renderAdmin','renderJr',
 'renderModules','adminLogin','doRequest','doValCode','validAccess','txtById','famOf','sysOf'];
var PUB={ok:[],miss:[]};
function publish(){
 PUB.ok=[];PUB.miss=[];
 for(var i=0;i<NAMES.length;i++){
  var n=NAMES[i];
  try{
   if(window[n]===undefined){
    var v=grab(n);
    if(v!==undefined&&v!==null){window[n]=v;PUB.ok.push(n)}
   }else PUB.ok.push(n);
   if(window[n]===undefined)PUB.miss.push(n);
  }catch(e){PUB.miss.push(n)}}
 return PUB}
publish();

/* ══════════ 2. métriques réelles ══════════ */
function count(v){try{if(Array.isArray(v))return v.length;
 if(v&&typeof v==='object')return Object.keys(v).length}catch(e){}return 0}
function metrics(){
 var F=window.FAULTS||grab('FAULTS'),R=window.RECALLS||grab('RECALLS'),T=window.TSBDB||grab('TSBDB');
 var C=window.KFCatalog||grab('KFCatalog');
 var makes=0,models=0,engs=0;
 try{if(C&&C.CAT){makes=Object.keys(C.CAT).length;
  Object.keys(C.CAT).forEach(function(k){var ms=C.CAT[k];models+=Object.keys(ms).length;
   Object.keys(ms).forEach(function(m){engs+=count(ms[m].eng)})})}}catch(e){}
 var mods=[
  ['État application','S',!!(window.S||grab('S'))],
  ['Navigation','NAV',!!(window.NAV||grab('NAV'))],
  ['Routage des vues','switchView',typeof (window.switchView||grab('switchView'))==='function'],
  ['Catalogue véhicules','KFCatalog',!!C],
  ['Base pannes','FAULTS',count(F)>0],
  ['Corrélation','KFCorr',!!(window.KFCorr||grab('KFCorr'))],
  ['Accès tiers','KFAccess',!!window.KFAccess],
  ['Notifications','KFNotify',!!window.KFNotify],
  ['Console admin','KFAdmin',!!window.KFAdmin],
  ['Localisation VIN','KFVinLoc',!!window.KFVinLoc],
  ['OBD atelier','KFObdPro',!!window.KFObdPro],
  ['JusteRepère admin','KFJrAdmin',!!window.KFJrAdmin],
  ['Fond d’écran','KFWall',!!window.KFWall],
  ['Turbo','KFTurbo',!!window.KFTurbo]];
 var live=mods.filter(function(m){return m[2]}).length;
 return{faults:count(F),recalls:count(R),tsb:count(T),makes:makes,models:models,engines:engs,
  mods:mods,live:live,total:mods.length,
  score:Math.round((live/mods.length)*70+Math.min(30,count(F)/7000*30))}}
var EXT=[
 ['catalog_ext.js','catalogue étendu'],
 ['renault_base.js','base Renault'],
 ['brands_base.js','base marques'],
 ['megabase_catalog.js','méga-catalogue 1'],
 ['megabase2_catalog.js','méga-catalogue 2'],
 ['megabase3_catalog.js','méga-catalogue 3'],
 ['megabase_faults.js','méga-pannes 1'],
 ['megabase2_faults.js','méga-pannes 2'],
 ['megabase3_faults.js','méga-pannes 3']];

/* ══════════ 3. réparation idempotente ══════════ */
var REP={running:false,done:0,total:0,log:[]};
function loadScript(src){
 return new Promise(function(res){
  var s=document.createElement('script');
  s.src=src+(src.indexOf('?')<0?'?':'&')+'r='+Date.now();
  s.async=false;
  s.onload=function(){res(true)};
  s.onerror=function(){res(false)};
  document.body.appendChild(s)})}
async function repair(){
 if(REP.running)return;
 REP.running=true;REP.done=0;REP.total=EXT.length;REP.log=[];
 paint();snd('fix');toast('🔧 Réapplication des extensions en cours…');
 publish();
 for(var i=0;i<EXT.length;i++){
  var ok=await loadScript(EXT[i][0]);
  REP.done++;REP.log.push({f:EXT[i][0],label:EXT[i][1],ok:ok});
  publish();paint();
  await new Promise(function(r){setTimeout(r,60)})}
 publish();
 try{if(typeof window.runChecks==='function')window.runChecks()}catch(e){}
 REP.running=false;
 var m=metrics();
 snd(m.faults>500?'ok':'warn');
 toast('✅ Extensions réappliquées · '+m.faults.toLocaleString('fr-FR')+' pannes · '+m.makes+' marques');
 paint();
 try{if(window.KFNotify)KFNotify.push({type:'update',level:'ok',title:'Extensions réappliquées',
  body:m.faults.toLocaleString('fr-FR')+' pannes · '+m.recalls+' campagnes · '+m.makes+' marques · '+m.models+' modèles.'})}catch(e){}}

/* ══════════ 4. centre de santé ══════════ */
var CFG=Object.assign({density:100,glow:56,grain:12,filter:'all',sort:'status',compact:false,
 onlyIssues:false,refresh:4,c1:'#22c55e',c2:'#38bdf8',sound:true},ls('bhCfg',{}));
function saveCfg(){sl('bhCfg',CFG)}
function host(){
 var boot=$('#boot'),v=$('#view'),cur='';
 try{cur=(window.S&&S.view)||''}catch(e){}
 var h=$('#bhPanel');
 if(h&&h.isConnected)return h;
 h=document.createElement('div');h.id='bhPanel';
 var anchor=null;
 if(boot&&!boot.classList.contains('hid'))anchor=$('#checkList');
 if(anchor&&anchor.parentNode){anchor.parentNode.insertBefore(h,anchor.nextSibling)}
 else if(cur==='admin'&&v){v.appendChild(h)}
 else if(boot){var c=boot.querySelector('.card');if(c)c.appendChild(h);else boot.appendChild(h)}
 else return null;
 bind(h);return h}
function ring(score){
 var col=score>=85?CFG.c1:score>=60?'#ffb020':'#ff4d6d';
 return '<div class="bh-ring" style="--p:'+score+';--rc:'+col+'">'+
  '<b>'+score+'</b><span>santé</span></div>'}
function paint(){
 var h=host();if(!h)return;
 var m=metrics();
 var mods=m.mods.slice();
 if(CFG.onlyIssues)mods=mods.filter(function(x){return !x[2]});
 if(CFG.filter==='core')mods=mods.filter(function(x){return ['S','NAV','switchView','KFCatalog','FAULTS','KFCorr'].indexOf(x[1])>=0});
 if(CFG.filter==='ext')mods=mods.filter(function(x){return ['S','NAV','switchView','KFCatalog','FAULTS','KFCorr'].indexOf(x[1])<0});
 if(CFG.sort==='name')mods.sort(function(a,b){return a[0].localeCompare(b[0])});
 else if(CFG.sort==='status')mods.sort(function(a,b){return (a[2]?1:0)-(b[2]?1:0)});
 var issues=m.mods.filter(function(x){return !x[2]});
 var low=m.faults<500;
 h.className='bh'+(CFG.compact?' compact':'');
 h.innerHTML=
 '<div class="bh-bg"></div><div class="bh-grain"></div>'+
 '<div class="bh-head">'+ring(m.score)+
  '<div class="bh-t"><span class="bh-kick">CENTRE DE SANTÉ</span>'+
   '<b>'+(issues.length||low?'Des extensions ne sont pas appliquées':'Projet opérationnel')+'</b>'+
   '<span>'+m.live+'/'+m.total+' modules actifs · '+PUB.ok.length+' globaux exposés'+
   (low?' · base technique réduite':'')+'</span></div>'+
  '<button class="bh-mute" data-bh="sound" title="Son">'+(AU.on?'🔊':'🔇')+'</button>'+
 '</div>'+
 '<div class="bh-stats">'+
  stat('Pannes',m.faults,low?'ko':'ok')+stat('Campagnes',m.recalls,m.recalls>400?'ok':'warn')+
  stat('Marques',m.makes,m.makes>40?'ok':'warn')+stat('Modèles',m.models,m.models>200?'ok':'warn')+
  stat('Motorisations',m.engines,m.engines>500?'ok':'warn')+
 '</div>'+
 (issues.length||low
  ?'<div class="bh-alert"><b>⚠️ Action recommandée</b>'+
   '<p>'+(low?'La base technique est retombée à '+m.faults+' pannes : les méga-bases ne se sont pas appliquées. ':'')+
   (issues.length?'Modules absents : '+issues.map(function(x){return x[0]}).join(', ')+'. ':'')+
   'La réapplication recharge les extensions de façon idempotente (aucun doublon, aucune perte).</p>'+
   '<button class="bh-fix" data-bh="repair"'+(REP.running?' disabled':'')+'>'+
    (REP.running?'⏳ Réapplication '+REP.done+'/'+REP.total+'…':'🔧 Réappliquer les extensions')+'</button></div>'
  :'<div class="bh-ok"><b>✅ Chaîne complète</b><p>Toutes les bases et tous les modules sont chargés et interconnectés.</p></div>')+
 '<div class="bh-grid">'+mods.map(function(x){
   return '<div class="bh-mod '+(x[2]?'on':'off')+'"><span class="bh-dot"></span>'+
    '<div><b>'+esc(x[0])+'</b><i>'+esc(x[1])+'</i></div>'+
    '<em>'+(x[2]?'actif':'absent')+'</em></div>'}).join('')+'</div>'+
 (REP.log.length?'<div class="bh-log">'+REP.log.map(function(l){
   return '<span class="'+(l.ok?'ok':'ko')+'">'+(l.ok?'✔':'✖')+' '+esc(l.label)+'</span>'}).join('')+'</div>':'')+
 '<div class="bh-dock">'+
  '<div class="bh-c"><label>Filtre</label><select data-bhc="filter">'+
   opt('all','Tous les modules')+opt('core','Noyau seul')+opt('ext','Extensions seules')+'</select></div>'+
  '<div class="bh-c"><label>Tri</label><select data-bhc="sort">'+
   opt('status','Absents d’abord')+opt('name','Alphabétique')+'</select></div>'+
  rg('density','Densité',85,125,'%')+rg('glow','Halo',0,100,'%')+rg('grain','Grain',0,40,'')+
  rg('refresh','Rafraîchissement',2,20,' s')+
  '<div class="bh-tgs">'+tg('compact','Compact')+tg('onlyIssues','Problèmes seuls')+tg('sound','Son')+'</div>'+
  '<div class="bh-cols">'+
   '<div><input type="color" data-bhc="c1" value="'+CFG.c1+'"><span>Signal</span></div>'+
   '<div><input type="color" data-bhc="c2" value="'+CFG.c2+'"><span>Data</span></div></div>'+
  '<div class="bh-btns">'+
   '<button class="p" data-bh="repair">🔧 Réappliquer</button>'+
   '<button data-bh="publish">🔗 Exposer globaux</button>'+
   '<button data-bh="purge">🧹 Purger</button>'+
   '<button data-bh="update">⟳ Mettre à jour</button>'+
   '<button data-bh="export">🧾 Rapport</button>'+
   '<button data-bh="hide">✕ Masquer</button></div>'+
 '</div>';
 theme()}
function stat(l,v,st){return '<div class="bh-stat '+st+'"><b>'+(v||0).toLocaleString('fr-FR')+'</b><span>'+l+'</span></div>'}
function opt(v,l){return '<option value="'+v+'"'+(CFG.filter===v||CFG.sort===v?' selected':'')+'>'+l+'</option>'}
function rg(k,l,a,b,u){return '<div class="bh-c"><label>'+l+' <b id="bho_'+k+'">'+CFG[k]+u+'</b></label>'+
 '<input type="range" data-bhc="'+k+'" data-u="'+u+'" min="'+a+'" max="'+b+'" value="'+CFG[k]+'"></div>'}
function tg(k,l){return '<label class="bh-tg'+(CFG[k]?' on':'')+'" id="bht_'+k+'"><input type="checkbox" data-bht="'+k+'"'+(CFG[k]?' checked':'')+'> '+l+'</label>'}
function theme(){
 try{var r=document.documentElement.style;
  r.setProperty('--bh1',CFG.c1);r.setProperty('--bh2',CFG.c2);
  r.setProperty('--bh-glow',(CFG.glow/100).toFixed(2));
  r.setProperty('--bh-grain',(CFG.grain/100).toFixed(2));
  r.setProperty('--bh-den',(CFG.density/100).toFixed(2))}catch(e){}}
function bind(h){
 if(h._b)return;h._b=1;
 h.addEventListener('input',function(e){
  var k=e.target.dataset&&e.target.dataset.bhc;if(!k)return;
  CFG[k]=e.target.type==='range'?+e.target.value:e.target.value;
  var o=$('#bho_'+k);if(o)o.textContent=CFG[k]+(e.target.dataset.u||'');
  saveCfg();theme();if(k!=='refresh')paint()});
 h.addEventListener('change',function(e){
  var k=e.target.dataset&&e.target.dataset.bhc;
  if(k&&e.target.tagName==='SELECT'){CFG[k]=e.target.value;saveCfg();paint();return}
  var t=e.target.dataset&&e.target.dataset.bht;
  if(t){CFG[t]=e.target.checked;saveCfg();if(t==='sound')AU.on=CFG.sound;paint()}});
 h.addEventListener('click',async function(e){
  var b=e.target.closest?e.target.closest('[data-bh]'):null;if(!b)return;
  var k=b.dataset.bh;
  if(k==='repair'){await repair();return}
  if(k==='publish'){publish();snd('tick');toast('🔗 '+PUB.ok.length+' globaux exposés sur window');paint();return}
  if(k==='purge'){try{if(window.KFQuota){var f=KFQuota.purge();toast('🧹 '+Math.round(f/1024)+' Ko libérés')}
   if(window.KFTurbo)KFTurbo.purge(true)}catch(x){}paint();return}
  if(k==='update'){
   try{if(navigator.serviceWorker){var r=await navigator.serviceWorker.getRegistration();
    if(r){await r.update();if(r.waiting)r.waiting.postMessage({type:'SKIP_WAITING'});
     toast('⟳ Mise à jour appliquée — rechargement');setTimeout(function(){location.reload()},1000);return}}
   location.reload()}catch(x){location.reload()}
   return}
  if(k==='export'){
   var m=metrics();
   var data={ts:new Date().toISOString(),version:(document.querySelector('meta[name="kf-version"]')||{}).content,
    score:m.score,metrics:{faults:m.faults,recalls:m.recalls,tsb:m.tsb,makes:m.makes,models:m.models,engines:m.engines},
    modules:m.mods.map(function(x){return{name:x[0],global:x[1],active:x[2]}}),
    published:PUB.ok,missing:PUB.miss,repair:REP.log,
    storage:window.KFQuota?{usage:KFQuota.usage(),degraded:KFQuota.degraded()}:null};
   try{var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    a.download='KEV-FUSION-sante-'+new Date().toISOString().slice(0,10)+'.json';a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href)},6000);snd('ok');toast('🧾 Rapport de santé exporté')}catch(x){}
   return}
  if(k==='hide'){h.style.display='none';sl('bhHidden',true);return}
  if(k==='sound'){AU.on=!AU.on;CFG.sound=AU.on;saveCfg();paint();if(AU.on)snd('tick');return}})}

/* ══════════ CSS ══════════ */
function css(){
 if($('#bhCss'))return;var s=document.createElement('style');s.id='bhCss';
 s.textContent=
 ':root{--bh1:#22c55e;--bh2:#38bdf8;--bh-glow:.56;--bh-grain:.12;--bh-den:1}'+
 '#bhPanel{position:relative;overflow:hidden;margin:14px 0;border-radius:18px;border:1px solid #1e5236;'+
  'background:linear-gradient(150deg,#04140c,#0a2416 38%,#0d1a2e 72%,#161029);'+
  'box-shadow:0 18px 48px #000b;padding:calc(16px*var(--bh-den));font-size:calc(14px*var(--bh-den))}'+
 '.bh-bg{position:absolute;inset:0;pointer-events:none;opacity:calc(var(--bh-glow)*.5);mix-blend-mode:screen;'+
  'background:radial-gradient(40% 50% at 12% 4%,var(--bh1),transparent 62%),radial-gradient(38% 46% at 92% 96%,var(--bh2),transparent 60%)}'+
 '.bh-grain{position:absolute;inset:0;pointer-events:none;opacity:var(--bh-grain);mix-blend-mode:overlay;'+
  'background-image:radial-gradient(#a3e635 1px,transparent 1px);background-size:3px 3px}'+
 '.bh-head{position:relative;display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:14px}'+
 '.bh-ring{--p:0;--rc:#22c55e;width:78px;height:78px;flex:none;border-radius:50%;display:grid;place-items:center;position:relative;'+
  'background:conic-gradient(var(--rc) calc(var(--p)*1%),#04140c 0)}'+
 '.bh-ring::after{content:"";position:absolute;inset:7px;border-radius:50%;background:#071c12;border:1px solid #1e5236}'+
 '.bh-ring b{position:relative;z-index:1;font:900 22px/1 ui-monospace,monospace;color:var(--rc)}'+
 '.bh-ring span{position:relative;z-index:1;font-size:8px;letter-spacing:1px;text-transform:uppercase;color:#5c876d;margin-top:3px}'+
 '.bh-t{flex:1;min-width:190px}'+
 '.bh-kick{display:inline-block;font:800 9px/1 system-ui;letter-spacing:1.5px;color:#04140c;'+
  'background:linear-gradient(90deg,var(--bh1),var(--bh2));padding:5px 9px;border-radius:7px;margin-bottom:7px}'+
 '.bh-t b{display:block;font-size:16px;color:#f2fbf4}'+
 '.bh-t span{display:block;font-size:11.5px;color:#8bb098;margin-top:3px}'+
 '.bh-mute{background:#04140c;border:1px solid #2b5c40;color:#a3e635;border-radius:10px;padding:7px 11px;cursor:pointer;font-size:15px}'+
 '.bh-stats{position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px;margin-bottom:13px}'+
 '.bh-stat{border:1px solid #1e5236;border-radius:12px;background:#04140ccc;padding:9px;text-align:center}'+
 '.bh-stat b{display:block;font:900 18px/1 ui-monospace,monospace;color:#a3e635}'+
 '.bh-stat.ok b{color:var(--bh1)}.bh-stat.warn b{color:#ffb020}.bh-stat.ko b{color:#ff4d6d}'+
 '.bh-stat span{display:block;font-size:8.5px;letter-spacing:.7px;text-transform:uppercase;color:#5c876d;margin-top:4px}'+
 '.bh-alert{position:relative;border:1px solid #ffb02066;border-left:3px solid #ffb020;border-radius:0 13px 13px 0;'+
  'background:#ffb0200e;padding:12px 14px;margin-bottom:13px}'+
 '.bh-alert b{display:block;font-size:13px;color:#ffd166;margin-bottom:5px}'+
 '.bh-alert p{margin:0 0 10px;font-size:12.5px;line-height:1.6;color:#d8c9a8}'+
 '.bh-fix{padding:12px 18px;font:900 13.5px/1 system-ui;border-radius:12px;cursor:pointer;border:2px solid #ffb020;'+
  'background:linear-gradient(135deg,#ffb020,#ff7a1a);color:#1a1005;box-shadow:0 6px 20px #ffb02055}'+
 '.bh-fix:hover{transform:translateY(-2px)}.bh-fix:disabled{opacity:.6;cursor:progress;transform:none}'+
 '.bh-ok{position:relative;border:1px solid #22c55e55;border-left:3px solid var(--bh1);border-radius:0 13px 13px 0;'+
  'background:#22c55e0d;padding:11px 14px;margin-bottom:13px}'+
 '.bh-ok b{display:block;font-size:13px;color:#a3e635}'+
 '.bh-ok p{margin:4px 0 0;font-size:12px;color:#8bb098}'+
 '.bh-grid{position:relative;display:grid;grid-template-columns:repeat(auto-fill,minmax(178px,1fr));gap:7px;margin-bottom:12px;'+
  'max-height:230px;overflow:auto;padding-right:4px}'+
 '#bhPanel.compact .bh-grid{max-height:132px}'+
 '.bh-grid::-webkit-scrollbar{width:9px}.bh-grid::-webkit-scrollbar-track{background:#04140c;border-radius:8px}'+
 '.bh-grid::-webkit-scrollbar-thumb{background:linear-gradient(var(--bh1),var(--bh2));border-radius:8px;border:2px solid #04140c}'+
 '.bh-grid{scrollbar-width:thin;scrollbar-color:var(--bh1) #04140c}'+
 '.bh-mod{display:flex;gap:8px;align-items:center;border:1px solid #1e5236;border-radius:11px;background:#04140caa;padding:8px 10px}'+
 '.bh-mod.off{border-color:#ff4d6d55;background:#ff4d6d0c}'+
 '.bh-dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--bh1);box-shadow:0 0 8px var(--bh1)}'+
 '.bh-mod.off .bh-dot{background:#ff4d6d;box-shadow:0 0 8px #ff4d6d}'+
 '.bh-mod div{flex:1;min-width:0}'+
 '.bh-mod b{display:block;font-size:11.5px;color:#eaf6ec;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.bh-mod i{display:block;font-style:normal;font:9px/1.3 ui-monospace,monospace;color:#5c876d;margin-top:2px}'+
 '.bh-mod em{font-style:normal;font:800 8px/1 system-ui;letter-spacing:.6px;color:var(--bh1);text-transform:uppercase}'+
 '.bh-mod.off em{color:#ff8fa0}'+
 '.bh-log{position:relative;display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}'+
 '.bh-log span{font:700 10px/1 ui-monospace,monospace;padding:5px 8px;border-radius:9px;border:1px solid #1e5236;background:#04140c}'+
 '.bh-log .ok{color:var(--bh1);border-color:#22c55e55}.bh-log .ko{color:#ff8fa0;border-color:#ff4d6d55}'+
 '.bh-dock{position:relative;display:flex;gap:11px;align-items:flex-end;flex-wrap:wrap;'+
  'border-top:1px solid #1e5236;padding-top:12px}'+
 '.bh-c{width:112px}'+
 '.bh-c label{display:flex;justify-content:space-between;align-items:baseline;gap:5px;margin-bottom:4px;'+
  'font-size:8.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#5c876d}'+
 '.bh-c label b{color:var(--bh1);font-family:ui-monospace,monospace;font-size:9.5px}'+
 '.bh-c select{width:100%;margin:0;padding:7px 8px;font-size:11.5px;background:#04140c;border:1px solid #2b5c40;color:#eaf6ec;border-radius:9px}'+
 '.bh-c input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--bh1),var(--bh2),#c084fc)}'+
 '.bh-c input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;'+
  'background:#f2fbf4;border:3px solid var(--bh1);cursor:grab}'+
 '.bh-tgs{display:flex;gap:6px;flex-wrap:wrap}'+
 '.bh-tg{display:flex;align-items:center;gap:5px;font-size:10px;color:#5c876d;background:#04140c;'+
  'border:1px solid #2b5c40;border-radius:15px;padding:5px 9px;cursor:pointer;white-space:nowrap}'+
 '.bh-tg input{width:auto;margin:0;accent-color:var(--bh1)}'+
 '.bh-tg.on{color:var(--bh1);border-color:var(--bh1);background:#22c55e14}'+
 '.bh-cols{display:flex;gap:6px}'+
 '.bh-cols div{display:flex;flex-direction:column;align-items:center;gap:2px}'+
 '.bh-cols input[type=color]{width:42px;height:28px;border:1px solid #2b5c40;border-radius:8px;background:#04140c;padding:2px;cursor:pointer;margin:0}'+
 '.bh-cols span{font-size:7.5px;color:#5c876d}'+
 '.bh-btns{display:flex;gap:6px;flex-wrap:wrap}'+
 '.bh-btns button{padding:9px 12px;font-size:11px;font-weight:800;border-radius:10px;cursor:pointer;'+
  'border:1px solid #2b5c40;background:#04140c;color:#eaf6ec;white-space:nowrap}'+
 '.bh-btns button:hover{border-color:var(--bh1);color:var(--bh1);transform:translateY(-1px)}'+
 '.bh-btns .p{background:linear-gradient(135deg,var(--bh1),var(--bh2));border-color:var(--bh1);color:#04140c}'+
 '@media(max-width:640px){.bh-grid{grid-template-columns:1fr}.bh-c{width:calc(50% - 6px)}}';
 document.head.appendChild(s)}

/* ══════════ cycle ══════════ */
var hidden=ls('bhHidden',false);
function tick(){
 publish();
 if(hidden)return;
 var h=$('#bhPanel');
 if(!h||!h.isConnected){paint();return}
 if(!REP.running)paint()}
function boot(){
 css();theme();publish();
 if(!hidden)paint();
 setTimeout(function(){publish();if(!hidden)paint()},400);
 setTimeout(function(){publish();if(!hidden)paint()},1500);
 setTimeout(function(){publish();if(!hidden)paint()},3500);
 setInterval(tick,Math.max(2,CFG.refresh)*1000);
 /* ligne de santé honnête dans l'auto-vérification (remplace l'ancienne) */
 setInterval(function(){
  try{
   var old=document.getElementById('kfHealthLine');if(old&&old.parentNode)old.parentNode.removeChild(old);
   var list=document.getElementById('checkList');if(!list)return;
   var m=metrics(),bad=m.mods.filter(function(x){return !x[2]});
   var li=document.createElement('li');li.id='kfHealthLine';
   li.className=bad.length?'st-warn':'st-ok';
   li.innerHTML='<span>'+(bad.length?'⚠️':'✅')+'</span><span><b>Santé du projet</b> — <span class="mut">'+
    m.live+'/'+m.total+' modules actifs · '+m.faults.toLocaleString('fr-FR')+' pannes · '+
    m.makes+' marques · '+m.models+' modèles'+
    (bad.length?' · absents : '+bad.map(function(x){return x[0]}).join(', '):' · chaîne complète')+
    '</span></span>';
   list.insertBefore(li,list.firstChild);
  }catch(e){}},2500);
 try{document.addEventListener('kf:vehicle',function(){publish()})}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFBridge={publish:publish,metrics:metrics,repair:repair,paint:paint,
 show:function(){hidden=false;sl('bhHidden',false);var h=$('#bhPanel');if(h)h.style.display='';paint()},
 published:function(){return PUB}};
})();
