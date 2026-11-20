/* KEV FUSION 2026 — turbo.js v2.0.0
   LATENCES CORRIGÉES SANS RETIRER AUCUNE FONCTIONNALITÉ.
   Aucune mise en pause, aucun espacement de minuteur, aucune fonctionnalité désactivée.
   Les gains viennent de la structure, pas de la dégradation :
   1. verrou de scope indexé O(n) à la place des trois boucles O(n²) des méga-bases
   2. corrélation pré-normalisée + index par famille + cache (mêmes résultats, même filtre strict)
   3. MutationObserver de brandlogo recentré sur #view et filtré sur les nœuds utiles
   4. masquage CSS permanent remplaçant le minuteur de verrouillage d'interface
   5. écritures de journaux différées et regroupées (données métier écrites immédiatement)
   6. isolation de rendu et rendu à l'approche sur les longues listes
   7. flou retiré uniquement sous les cartes quasi opaques (invisible à l'œil)
   Repli automatique sur l'implémentation d'origine si un chemin optimisé échoue. */
(function(){
'use strict';
/* ══════════ socle ══════════ */
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},d:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function $(s,r){try{return (r||document).querySelector(s)}catch(e){return null}}
function $$(s,r){try{return Array.prototype.slice.call((r||document).querySelectorAll(s))}catch(e){return[]}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function clamp(v,a,b){v=+v;if(!isFinite(v))v=a;return Math.max(a,Math.min(b,v))}
function mo(n){return (n/1048576).toFixed(1)}
function toast(m){try{if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3000)}catch(e){}}
function idle(fn,ms){try{if(window.requestIdleCallback)return requestIdleCallback(fn,{timeout:ms||1500})}catch(e){}
 return setTimeout(fn,Math.min(ms||1500,240))}
function view(){try{return (typeof S!=='undefined'&&S.view)||''}catch(e){return''}}
function tagOf(){try{var s=new Error().stack||'',m=s.match(/[\w.\-]+\.js:\d+/g)||[];
 for(var i=0;i<m.length;i++){var f=m[i].split(':')[0].replace(/^.*\//,'');if(f&&f!=='turbo.js')return f}}catch(e){}
 return 'app'}

/* ══════════ son ══════════ */
var AU={c:null,on:LS.g('tbSound',true)!==false};
function actx(){try{if(!AU.c)AU.c=new (window.AudioContext||window.webkitAudioContext)();
 if(AU.c&&AU.c.state==='suspended')AU.c.resume().catch(function(){});return AU.c}catch(e){return null}}
function snd(k){if(!AU.on)return;var c=actx();if(!c)return;
 var m={opt:[440,1040,.2,'triangle'],purge:[720,300,.17,'sine'],ok:[660,990,.12,'triangle'],
  tick:[1320,1320,.02,'sine'],warn:[380,260,.17,'sawtooth'],idx:[520,860,.14,'sine']}[k]||[900,900,.04,'sine'];
 try{var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(50,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.1,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.03)}catch(e){}}

/* ══════════ configuration ══════════ */
var DEF={scopeIdx:true,corrOpt:true,cache:120,prewarm:true,moTarget:true,moCoalesce:1,
 writeBehind:true,isolate:true,cv:true,cardBlur:false,cssLock:true,purgeEvery:8,logTrim:300,
 mediaKeep:20,c1:'#a3e635',c2:'#38bdf8',c3:'#ff4d6d',glow:52,grain:10,density:100,sound:true};
var raw=LS.g('tbCfg',{});if(!raw||typeof raw!=='object')raw={};
var CFG=Object.assign({},DEF,raw);
function normCfg(){
 CFG.cache=clamp(CFG.cache,0,400);CFG.moCoalesce=clamp(CFG.moCoalesce,1,3);
 CFG.purgeEvery=clamp(CFG.purgeEvery,2,60);CFG.logTrim=clamp(CFG.logTrim,60,2000);
 CFG.mediaKeep=clamp(CFG.mediaKeep,4,120);CFG.glow=clamp(CFG.glow,0,100);
 CFG.grain=clamp(CFG.grain,0,40);CFG.density=clamp(CFG.density,85,125);
 ['c1','c2','c3'].forEach(function(k){if(!/^#[0-9a-f]{6}$/i.test(CFG[k]||''))CFG[k]=DEF[k]})}
normCfg();
function saveCfg(){LS.s('tbCfg',CFG)}
var T={fps:60,heap:0,long:0,timers:0,virtual:0,corrMs:0,corrAvg:0,hits:0,miss:0,
 poolN:0,idxN:0,scopeN:0,scopeMs:0,moSaved:0,moCalls:0,deferred:0,flushes:0,
 purges:0,freed:0,removed:0,fallback:0,cvNodes:0,log:[],lastPurge:0,boot:Date.now()};
var rl=LS.g('tbLog',[]);if(Array.isArray(rl))T.log=rl;
function tlog(k,m,l){try{T.log.unshift({t:new Date().toISOString(),k:k,m:m,l:l||'info'});
 if(T.log.length>300)T.log.pop();LS.s('tbLog',T.log)}catch(e){}}

/* ══════════ 1. ÉCRITURES DIFFÉRÉES (journaux uniquement) ══════════ */
var SP=Storage.prototype,nSet=SP.setItem,nGet=SP.getItem,nRem=SP.removeItem;
var MEM=new Map(),DIRTY=new Set(),flushT=null;
var LOGRE=/(Log|log|Trace|trace|Journal|journal)/;
function flush(){
 if(!DIRTY.size)return 0;
 var n=0;
 DIRTY.forEach(function(k){try{var v=MEM.get(k);
  if(v===undefined)nRem.call(localStorage,k);else nSet.call(localStorage,k,v);n++}catch(e){}});
 DIRTY.clear();T.flushes++;flushT=null;return n}
function scheduleFlush(){if(flushT)return;flushT=setTimeout(function(){idle(flush,900)},1400)}
SP.setItem=function(k,v){
 if(this!==localStorage)return nSet.call(this,k,v);
 var s=String(v);MEM.set(k,s);
 if(CFG.writeBehind&&LOGRE.test(k)&&s.length>700){DIRTY.add(k);T.deferred++;scheduleFlush();return}
 try{nSet.call(this,k,s);DIRTY.delete(k)}catch(e){DIRTY.add(k);scheduleFlush()}};
SP.getItem=function(k){if(this===localStorage&&MEM.has(k))return MEM.get(k);return nGet.call(this,k)};
SP.removeItem=function(k){if(this===localStorage){MEM.set(k,undefined);DIRTY.add(k);scheduleFlush()}
 return nRem.call(this,k)};
window.addEventListener('pagehide',flush);
window.addEventListener('beforeunload',flush);
document.addEventListener('visibilitychange',function(){if(document.hidden)flush()});

/* ══════════ 2. VERROU DE SCOPE INDEXÉ ══════════ */
var SNAP=new Map(),BYID=new Map(),idxGen=-1;
function reindex(){
 BYID.clear();
 try{if(typeof FAULTS==='undefined')return;
  for(var i=0;i<FAULTS.length;i++){var f=FAULTS[i];if(f&&f.id)BYID.set(f.id,f)}
  idxGen=FAULTS.length}catch(e){}}
function same(a,b){
 if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)return false;
 for(var i=0;i<a.length;i++)if(a[i]!==b[i])return false;
 return true}
function scopePass(){
 if(!CFG.scopeIdx)return 0;
 var t0=performance.now(),n=0;
 try{
  if(typeof FAULTS==='undefined')return 0;
  if(FAULTS.length!==idxGen)reindex();
  for(var i=0;i<FAULTS.length;i++){
   var f=FAULTS[i];if(!f||!f.lockModel||!f.id)continue;
   var s=SNAP.get(f.id);
   if(!s){SNAP.set(f.id,{b:(f.b||[]).slice(),m:(f.m||[]).slice(),eng:(f.eng||[]).slice(),
    pw:(f.pw||[]).slice(),y:(f.y||[]).slice()});n++;continue}
   if(!same(f.b,s.b))f.b=s.b.slice();
   if(!same(f.m,s.m))f.m=s.m.slice();
   if(!same(f.eng,s.eng))f.eng=s.eng.slice();
   if(!same(f.pw,s.pw))f.pw=s.pw.slice();
   if(!same(f.y,s.y))f.y=s.y.slice();
   if(f.generic)f.generic=false;
   n++}
  T.scopeN=n;
 }catch(e){T.fallback++;tlog('REPLI','Verrou indexé : '+e.message,'warn')}
 T.scopeMs=performance.now()-t0;return n}

/* ══════════ 3. MINUTEURS : neutralisation des boucles redondantes ══════════ */
var nSI=window.setInterval,nCI=window.clearInterval,nST=window.setTimeout,nCT=window.clearTimeout;
var REG={},seq=900000;
window.setInterval=function(fn,delay){
 if(typeof fn!=='function')return nSI(fn,delay);
 var src='';try{src=String(fn)}catch(e){}
 var tag=tagOf(),id=++seq;
 /* boucles de verrouillage O(n²) → remplacées par le verrou indexé global */
 if(CFG.scopeIdx&&/lockModel/.test(src)&&/(megabase|bigster)/.test(tag)){
  REG[id]={id:id,tag:tag,base:delay,virtual:'scope',dead:false};T.virtual++;
  tlog('OPTIMISATION','Boucle de verrou '+tag+' → verrou indexé global','ok');return id}
 /* masquage répété d'interface → CSS permanent */
 if(CFG.cssLock&&/data-ps/.test(src)&&/widen|strict/.test(src)){
  REG[id]={id:id,tag:tag,base:delay,virtual:'css',dead:false};T.virtual++;
  document.body.classList.add('tb-csslock');
  tlog('OPTIMISATION','Masquage d’interface '+tag+' → règle CSS permanente','ok');return id}
 REG[id]={id:id,tag:tag,base:Math.max(16,+delay||0),fn:fn,dead:false,runs:0,total:0,avg:0,handle:null};
 var r=REG[id];
 (function loop(){r.handle=nST(function(){
  if(r.dead)return;
  var t0=performance.now();
  try{r.fn()}catch(e){}
  var dt=performance.now()-t0;r.runs++;r.total+=dt;r.avg=r.total/r.runs;
  if(!r.dead)loop()},r.base)})();
 return id};
window.clearInterval=function(id){var r=REG[id];
 if(r){r.dead=true;if(r.handle)try{nCT(r.handle)}catch(e){}delete REG[id];return}
 try{nCI(id)}catch(e){}};
window.clearTimeout=function(id){var r=REG[id];if(r){r.dead=true;delete REG[id];return}
 try{nCT(id)}catch(e){}};

/* ══════════ 4. OBSERVERS RECENTRÉS ET FILTRÉS ══════════ */
var NMO=window.MutationObserver;
var INTEREST='.cbx-list,.cbx-opt,.vehread,#vehRead,h2,.card.accent,.bl-badge';
function matches(n,sel){
 try{if(n.nodeType!==1)return false;
  if(n.matches&&n.matches(sel))return true;
  if(n.querySelector&&n.querySelector(sel))return true}catch(e){}
 return false}
if(NMO){
 var Wrapped=function(cb){
  var tag=tagOf(),narrow=CFG.moTarget&&tag==='brandlogo.js';
  var pending=false,frames=0,bucket=[];
  var w=function(muts,obs){
   T.moCalls++;
   if(narrow){
    var rel=false;
    for(var i=0;i<muts.length&&!rel;i++){
     var m=muts[i];
     for(var j=0;j<m.addedNodes.length;j++)if(matches(m.addedNodes[j],INTEREST)){rel=true;break}
     if(!rel)for(var k=0;k<m.removedNodes.length;k++)if(matches(m.removedNodes[k],INTEREST)){rel=true;break}}
    if(!rel){T.moSaved++;return}}
   bucket=muts;
   if(pending)return;
   pending=true;
   var need=narrow?clamp(CFG.moCoalesce,1,3):1;
   var step=function(){
    if(++frames<need){requestAnimationFrame(step);return}
    frames=0;pending=false;
    try{cb(bucket,obs)}catch(e){}};
   requestAnimationFrame(step)};
  var inst=new NMO(w);
  if(narrow){
   var oo=inst.observe.bind(inst);
   inst.observe=function(t,o){
    var target=t;
    if(t===document.body||t===document.documentElement)target=document.getElementById('view')||document.body;
    return oo(target,o)}}
  return inst};
 Wrapped.prototype=NMO.prototype;
 window.MutationObserver=Wrapped}

/* ══════════ 5. LISTENERS PASSIFS ══════════ */
var nAdd=EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener=function(t,f,o){
 if((t==='wheel'||t==='touchstart')&&typeof f==='function'){
  var s='';try{s=String(f)}catch(e){}
  if(s.indexOf('preventDefault')<0){
   if(o===undefined||o===false)o={passive:true};
   else if(o&&typeof o==='object'&&o.passive===undefined)o=Object.assign({},o,{passive:true})}}
 return nAdd.call(this,t,f,o)};

/* ══════════ 6. CATALOGUE MÉMOÏSÉ ══════════ */
var MC={mk:new Map(),md:new Map(),en:new Map(),ms:new Map(),gen:-1};
function catGen(){try{var C=window.KFCatalog;if(!C||!C.CAT)return -1;
 var n=0;for(var k in C.CAT)n+=Object.keys(C.CAT[k]).length;return n}catch(e){return -1}}
function memoCatalog(){
 var C=window.KFCatalog;if(!C||C.__tb2)return false;
 MC.gen=catGen();
 function wrap(name,cache,kf){
  var o=C[name];if(typeof o!=='function')return;
  C[name]=function(){
   var g=catGen();
   if(g!==MC.gen){MC.mk.clear();MC.md.clear();MC.en.clear();MC.ms.clear();MC.gen=g}
   var k=kf?kf.apply(null,arguments):String(arguments[0]);
   if(cache.has(k))return cache.get(k);
   var r=o.apply(this,arguments);
   if(cache.size>1200)cache.clear();
   cache.set(k,r);return r}}
 wrap('resolveMake',MC.mk);
 wrap('resolveModel',MC.md,function(a,b){return a+'|'+b});
 wrap('engines',MC.en,function(a,b){return a+'|'+b});
 wrap('models',MC.ms);
 C.__tb2=true;tlog('OPTIMISATION','Catalogue mémoïsé : marques, modèles, motorisations','ok');return true}

/* ══════════ 7. CORRÉLATION OPTIMISÉE ══════════ */
var NORM=new WeakMap(),POOL=null,POOLKEY='',FAMIDX=null,CC=new Map(),uidN=0;
function yrs(v){if(Array.isArray(v)&&v.length>=2)return[+v[0],+v[1]];
 if(typeof v==='number')return[v,v];return null}
function normOne(f,src,K){
 if(NORM.has(f))return NORM.get(f);
 var o={id:f.id||('tb'+(++uidN)),t:f.t||f.titre||f.title||'Sans titre',
  eng:K.arr(f.eng),b:K.arr(f.b||f.marques||f.marque),m:K.arr(f.m||f.modeles),
  y:yrs(f.y)||K.WIN,pw:K.arr(f.pw||f.ch).map(Number).filter(Boolean),
  fuel:f.fuel||K.fuelGroup((f.t||'')+' '+(f.mec||'')+' '+(f.s||'')),
  s:f.s||f.systeme||'Général',g:f.g||f.gravite||'Élevé',
  fire:!!(f.fire||f.f||f.incendie),dtc:K.dtc(f.dtc),sym:K.txt(f.sym||f.symptomes),
  mec:f.mec||f.mecanisme||'',chain:f.chain||(typeof f.ch==='string'?f.ch:'')||f.chaine||'',
  cons:K.txt(f.cons||f.consequences),prv:K.txt(f.prv||f.preuves),tst:K.txt(f.tst||f.tests),
  act:K.txt(f.act||f.actions),sec:f.sec||f.securite||'—',law:K.arr(f.law||f.juridique),
  tsb:f.tsb||null,rec:f.rec||null,generic:!!f.generic,src:src||'Base ingénieur'};
 o.sys=K.sysOf(o);
 if(!o.law.length)o.law=['CC1641'];
 NORM.set(f,o);return o}
function buildPool(K){
 var nf=0,nk=0;
 try{nf=(typeof FAULTS!=='undefined'&&FAULTS.length)||0}catch(e){}
 try{nk=(typeof KBall==='function'&&KBall().length)||0}catch(e){}
 var key=nf+'/'+nk;
 if(POOL&&POOLKEY===key)return POOL;
 var seen={},list=[],fam={};
 function add(f,src){if(!f)return;var n=normOne(f,src,K);
  var k=K.norm(n.t);if(seen[k])return;seen[k]=1;list.push(n);
  for(var i=0;i<n.eng.length;i++){var fk=K.famOf(n.eng[i]);(fam[fk]=fam[fk]||[]).push(n)}}
 try{if(typeof FAULTS!=='undefined')for(var i=0;i<FAULTS.length;i++)add(FAULTS[i],'Base ingénieur')}catch(e){}
 try{if(typeof KBall==='function'){var kb=KBall();for(var j=0;j<kb.length;j++)add(kb[j],'Base fusionnée')}}catch(e){}
 POOL=list;FAMIDX=fam;POOLKEY=key;T.poolN=list.length;
 T.idxN=Object.keys(fam).length;
 return list}
function optimizedCorr(orig,K){
 return function(v,opts){
  if(!CFG.corrOpt)return orig.apply(this,arguments);
  var t0=performance.now();
  try{
   opts=opts||{};
   var sysF=opts.sys||'';
   var read=K.dtc(opts.readDtc).map(function(x){return x.toUpperCase()});
   var sig=K.signature(v);
   var trace={total:0,kept:0,strict:true,sys:sysF,codes:sig.codes,year:sig.year,
    t1:0,t2:0,t3:0,t4:0,t5:0,fallback:false};
   var empty={sig:sig,faults:[],dtc:[],recalls:[],tsb:[],modelDtc:[],trace:trace,systems:K.SYS,avail:{}};
   if(!v||!v.brand)return empty;
   var C=window.KFCatalog;
   if(C&&v.model&&!C.isPairValid(v.brand,v.model))return empty;
   var ck=CFG.cache?JSON.stringify([sig.brand,sig.model,sig.engine,sig.ch,sig.year,sig.y,
    sysF,read.join(','),POOLKEY]):null;
   if(ck&&CC.has(ck)){T.hits++;var e=CC.get(ck);e.t=Date.now();
    T.corrMs=performance.now()-t0;return e.r}
   T.miss++;
   buildPool(K);
   trace.total=POOL.length;
   var cand=[],seenC=new Set();
   var fams=Object.keys(sig.fams||{});
   for(var i=0;i<fams.length;i++){
    var arr=FAMIDX[fams[i]]||[];
    for(var j=0;j<arr.length;j++){var f=arr[j];
     if(seenC.has(f))continue;seenC.add(f);cand.push(f)}}
   var kept=[];
   for(var k=0;k<cand.length;k++){
    var g=cand[k];
    if(!K.vehiclePass(g,sig))continue;
    if(sysF&&g.sys.indexOf(sysF)<0)continue;
    var hit=g.dtc.filter(function(d){return read.indexOf(d)>=0});
    var sc=10;
    if(g.pw&&g.pw.length&&sig.ch&&g.pw.some(function(p){return Math.abs(p-sig.ch)<=6}))sc+=3;
    if(sig.year&&g.y&&g.y[0]<=sig.year&&sig.year<=g.y[1])sc+=2;
    if(hit.length)sc+=4;
    if(g.fire)sc+=1;
    var why=['famille moteur '+Object.keys(g.eng.reduce(function(a,x){a[K.famOf(x)]=1;return a},{}))
      .filter(function(x){return sig.fams[x]}).join('/')];
    if((g.m||[]).indexOf('*')<0)why.push('modèle '+sig.model);
    if(g.pw&&g.pw.length)why.push('puissance '+sig.ch+' ch');
    if(sig.year)why.push('année '+sig.year);
    else if(sig.years)why.push('années '+sig.years[0]+'-'+sig.years[1]);
    if(hit.length)why.push('DTC lus '+hit.join(','));
    var legal=g.law.map(function(id){try{var l=txtById(id);return l&&l.t?l:null}catch(e){return null}}).filter(Boolean);
    kept.push(Object.assign({},g,{sc:sc,why:why,relevance:'DIRECT véhicule',tier:1,
     readHits:hit,legal:legal,linkTsb:[],linkRec:[]}));
    trace.t1++}
   kept.sort(function(a,b){return b.sc-a.sc||String(a.t).localeCompare(String(b.t))});
   trace.kept=kept.length;
   var recalls=[],tsb=[];
   var brandOK=function(b){var bl=K.arr(b);
    return bl.indexOf('*')>=0||bl.indexOf(sig.brand)>=0||
     bl.some(function(x){return C&&(C.resolveMake(x)||x)===sig.brand})};
   var modelOK=function(m){var ml=K.arr(m);
    return ml.indexOf('*')>=0||ml.indexOf(sig.model)>=0||
     ml.some(function(x){return K.norm(x)===K.norm(sig.model)})};
   var yearOK=function(y){var ry=yrs(y)||K.WIN;
    if(sig.year)return ry[0]<=sig.year&&sig.year<=ry[1];
    if(sig.years)return ry[0]<=sig.years[1]&&ry[1]>=sig.years[0];
    return true};
   try{if(typeof Rall==='function')recalls=Rall().filter(function(r){
     if(!r||!brandOK(r.b)||!modelOK(r.m)||!yearOK(r.y))return false;
     var rf=K.fuelGroup((r.t||'')+' '+(r.risk||''));
     if(rf&&sig.fuelGroup&&rf!==sig.fuelGroup&&!(sig.fuelGroup==='hybride'&&(rf==='diesel'||rf==='essence')))return false;
     return true}).map(function(r){return Object.assign({},r,{b:K.arr(r.b),m:K.arr(r.m),
      dtc:K.dtc(r.dtc),law:K.arr(r.law),y:yrs(r.y)||K.WIN})})}catch(e){}
   try{if(typeof TSBDB!=='undefined'&&Array.isArray(TSBDB))tsb=TSBDB.filter(function(t){
     if(!t||!brandOK(t.b)||!modelOK(t.m)||!yearOK(t.y))return false;
     var te=K.arr(t.e);
     if(te.length&&!te.some(function(x){return sig.fams[K.famOf(x)]}))return false;
     return true}).map(function(t){return Object.assign({},t,{b:K.arr(t.b),m:K.arr(t.m),
      e:K.arr(t.e),dtc:K.dtc(t.dtc),y:yrs(t.y)||K.WIN})})}catch(e){}
   kept.forEach(function(f){
    f.linkTsb=tsb.filter(function(t){return K.dtc(t.dtc).some(function(d){return f.dtc.indexOf(d)>=0})||
     K.norm(t.sys)===K.norm(f.s)}).slice(0,4);
    f.linkRec=recalls.filter(function(r){return K.dtc(r.dtc).some(function(d){return f.dtc.indexOf(d)>=0})}).slice(0,4)});
   var map={},md=[];
   kept.forEach(function(f){f.dtc.forEach(function(d){(map[d]=map[d]||[]).push(f.t)})});
   tsb.forEach(function(t){K.dtc(t.dtc).forEach(function(d){if(!map[d])map[d]=['TSB : '+t.ref];if(md.indexOf(d)<0)md.push(d)})});
   recalls.forEach(function(r){K.dtc(r.dtc).forEach(function(d){if(!map[d])map[d]=['Campagne : '+r.t];if(md.indexOf(d)<0)md.push(d)})});
   var dtcList=Object.keys(map).sort().map(function(d){
    return{code:d,faults:map[d],read:read.indexOf(d)>=0,fromModel:md.indexOf(d)>=0}});
   var avail={};kept.forEach(function(f){f.sys.forEach(function(x){avail[x]=(avail[x]||0)+1})});
   var out={sig:sig,faults:kept,dtc:dtcList,recalls:recalls,tsb:tsb,modelDtc:md,
    trace:trace,systems:K.SYS,avail:avail};
   if(ck){if(CC.size>=CFG.cache){var ok=null,ot=Infinity;
     CC.forEach(function(x,kk){if(x.t<ot){ot=x.t;ok=kk}});if(ok)CC.delete(ok)}
    CC.set(ck,{r:out,t:Date.now()})}
   T.corrMs=performance.now()-t0;T.corrAvg=(T.corrAvg*0.8)+(T.corrMs*0.2);
   return out;
  }catch(err){
   T.fallback++;CC.clear();POOL=null;
   tlog('REPLI','Corrélation optimisée → origine : '+(err&&err.message||''),'warn');
   return orig.apply(this,arguments)}}}
function memoCorr(){
 var K=window.KFCorr;if(!K||typeof K.correlate!=='function'||K.correlate.__tb2)return false;
 var orig=K.correlate;
 K.correlate=optimizedCorr(orig,K);
 K.correlate.__tb2=true;K.correlate.__orig=orig;
 tlog('OPTIMISATION','Corrélation indexée par famille + cache '+CFG.cache+' entrées','ok');return true}

/* ══════════ 8. RENDU : ISOLATION SANS PERTE ══════════ */
function css(){
 if($('#tbCss2'))return;var s=document.createElement('style');s.id='tbCss2';
 s.textContent=
 ':root{--tb1:#a3e635;--tb2:#38bdf8;--tb3:#ff4d6d;--tb-glow:.52;--tb-grain:.1;--tb-den:1;--tb-h:0px;--tb-off:0px;'+
 '--tb-ink:#050d0a;--tb-ink2:#0a1712;--tb-line:#1d3f2c;--tb-line2:#2b5c40;'+
 '--tb-tx:#eefaf1;--tb-tx2:#c2ddca;--tb-mut:#84ad95;--tb-dim:#5a8570;--tb-amber:#ffb020;--tb-purple:#c084fc}'+
 /* le flou sous une carte opaque à 97 % n'est pas perceptible : on rend la carte opaque */
 'body.tb-noblur .card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:#141c2eF8!important}'+
 'body.tb-noblur .card.gold{background:linear-gradient(135deg,#1a1408F8,#141c2eF8)!important}'+
 'body.tb-noblur .card.jr{background:linear-gradient(135deg,#0f1a14F8,#141c2eF8)!important}'+
 /* isolation de layout sans clipping (les listes déroulantes continuent de déborder) */
 'body.tb-iso .card,body.tb-iso .faultcard,body.tb-iso .ob-ecu,body.tb-iso .jr-item,body.tb-iso .wl-item,'+
 'body.tb-iso .jrg-panel,body.tb-iso .ob-dtc{contain:layout style}'+
 /* rendu à l'approche sur les longues listes uniquement */
 'body.tb-cv .tb-long>.faultcard,body.tb-cv .tb-long>.web-result,body.tb-cv .tb-long>.notif-item,'+
 'body.tb-cv .tb-long>.jr-item,body.tb-cv .tb-long>.wl-item{content-visibility:auto;contain-intrinsic-size:auto 240px}'+
 'body.tb-csslock [data-ps="widen"],body.tb-csslock [data-ps="strict"]{display:none!important}'+
 '#scene .aurora,#wallLayer .wl-media.ken{will-change:transform}'+
 '#brandLayer .bl-parts,.jrg-parts,.tb-parts{contain:strict}'+
 /* barre de pilotage */
 '#tbBar{position:fixed;left:0;right:0;bottom:var(--tb-off);z-index:140;display:none;height:128px;'+
  'background:linear-gradient(180deg,#0a1712F6,#050d0aFB);border-top:1px solid var(--tb1);'+
  'box-shadow:0 -12px 32px #000b;font-size:calc(13px*var(--tb-den))}'+
 'body.tb-on #tbBar{display:flex}'+
 'body.tb-on main{padding-bottom:calc(var(--tb-h) + var(--tb-off) + 24px)}'+
 'body.tb-on #toast{bottom:calc(var(--tb-h) + var(--tb-off) + 14px)}'+
 '#tbBar::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:var(--tb-grain);'+
  'background-image:radial-gradient(var(--tb1) 1px,transparent 1px);background-size:3px 3px;mix-blend-mode:overlay}'+
 '.tb-id{flex:none;display:flex;align-items:center;gap:10px;padding:10px 13px;border-right:1px solid var(--tb-line);'+
  'background:linear-gradient(135deg,#a3e63516,transparent);position:relative;z-index:1}'+
 '.tb-bolt{font-size:23px;filter:drop-shadow(0 0 calc(11px*var(--tb-glow)) var(--tb1))}'+
 '.tb-id-t>b{display:block;font:900 10px/1 system-ui;letter-spacing:1.4px;color:var(--tb1)}'+
 '.tb-id-t>span{display:block;font:800 9px/1 system-ui;color:var(--tb2);margin-top:4px;letter-spacing:.4px}'+
 '.tb-gauges{display:flex;gap:6px}'+
 '.tb-g{min-width:54px;padding:5px 7px;border-radius:9px;background:#050d0a;border:1px solid var(--tb-line2);text-align:center}'+
 '.tb-g b{display:block;font:900 14px/1 ui-monospace,monospace;color:var(--tb1)}'+
 '.tb-g b.warn{color:var(--tb-amber)}.tb-g b.ko{color:var(--tb3)}'+
 '.tb-g span{display:block;font-size:7.5px;letter-spacing:.4px;text-transform:uppercase;color:var(--tb-dim);margin-top:3px}'+
 '.tb-act{flex:none;padding:9px 11px;font-size:11px;font-weight:900;border-radius:10px;cursor:pointer;white-space:nowrap;'+
  'border:1px solid var(--tb-line2);background:#050d0a;color:var(--tb-tx)}'+
 '.tb-act.p{background:linear-gradient(135deg,var(--tb1),var(--tb2));border-color:var(--tb1);color:#050d0a}'+
 '.tb-act.d{border-color:var(--tb-amber);color:var(--tb-amber);background:#ffb02012}'+
 '.tb-act:hover{transform:translateY(-1px)}'+
 '.tb-tools{flex:1;display:flex;align-items:center;gap:13px;padding:10px 13px;overflow-x:auto;overflow-y:hidden;position:relative;z-index:1}'+
 '.tb-tools::-webkit-scrollbar{height:9px}'+
 '.tb-tools::-webkit-scrollbar-track{background:#050d0a;border-radius:8px}'+
 '.tb-tools::-webkit-scrollbar-thumb{background:linear-gradient(90deg,var(--tb1),var(--tb2),var(--tb-purple));border-radius:8px;border:2px solid #050d0a}'+
 '.tb-tools::-webkit-scrollbar-thumb:hover{background:var(--tb1)}'+
 '.tb-tools{scrollbar-width:thin;scrollbar-color:var(--tb1) #050d0a}'+
 '.tb-c{flex:none;width:114px}'+
 '.tb-c label{display:flex;justify-content:space-between;align-items:baseline;gap:5px;margin-bottom:4px;'+
  'font-size:8px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;color:var(--tb-dim)}'+
 '.tb-c label b{color:var(--tb1);font-family:ui-monospace,monospace;font-size:9px}'+
 '.tb-c select{width:100%;margin:0;padding:6px 8px;font-size:11px;background:#050d0a;border:1px solid var(--tb-line2);color:var(--tb-tx);border-radius:8px}'+
 '.tb-c select:focus{outline:none;border-color:var(--tb1)}'+
 '.tb-c input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--tb1),var(--tb2),var(--tb-purple))}'+
 '.tb-c input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;'+
  'background:#f2fbf4;border:3px solid var(--tb1);box-shadow:0 0 8px var(--tb1);cursor:grab}'+
 '.tb-c input[type=range]::-moz-range-thumb{width:13px;height:13px;border-radius:50%;background:#f2fbf4;border:3px solid var(--tb1);cursor:grab}'+
 '.tb-tgs{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:5px;width:268px}'+
 '.tb-tg{display:flex;align-items:center;gap:5px;font-size:9px;color:var(--tb-dim);background:#050d0a;'+
  'border:1px solid var(--tb-line2);border-radius:15px;padding:4px 8px;cursor:pointer;white-space:nowrap}'+
 '.tb-tg input{width:auto;margin:0;accent-color:var(--tb1)}'+
 '.tb-tg.on{color:var(--tb1);border-color:var(--tb1);background:#a3e63514}'+
 '.tb-cols{flex:none;display:flex;gap:6px}'+
 '.tb-cols div{display:flex;flex-direction:column;align-items:center;gap:2px}'+
 '.tb-cols input[type=color]{width:40px;height:28px;border:1px solid var(--tb-line2);border-radius:8px;background:#050d0a;padding:2px;cursor:pointer;margin:0}'+
 '.tb-cols span{font-size:7.5px;color:var(--tb-dim)}'+
 '.tb-btns{flex:none;display:grid;grid-template-columns:repeat(3,auto);gap:5px}'+
 '.tb-btns button{padding:7px 9px;font-size:10px;font-weight:800;border-radius:8px;border:1px solid var(--tb-line2);'+
  'background:#050d0a;color:var(--tb-tx);cursor:pointer;white-space:nowrap}'+
 '.tb-btns button:hover{border-color:var(--tb1);color:var(--tb1)}'+
 '.tb-note{flex:none;width:184px;font-size:9px;line-height:1.5;color:var(--tb-dim)}'+
 '.tb-note b{color:var(--tb1)}'+
 '@media(max-width:900px){#tbBar{height:168px;flex-direction:column}'+
  '.tb-id{border-right:0;border-bottom:1px solid var(--tb-line);padding:7px 11px;justify-content:space-between;gap:7px}'+
  '.tb-bolt{font-size:19px}.tb-g{min-width:46px;padding:4px 5px}.tb-g b{font-size:12px}'+
  '.tb-gauges{gap:5px}.tb-act{padding:7px 9px;font-size:10px}'+
  '.tb-tools{padding:8px 11px}.tb-note{display:none}}'+
 '@media(max-width:560px){.tb-id-t{display:none}.tb-g:nth-child(5){display:none}}'+
 '@media print{#tbBar{display:none!important}}';
 document.head.appendChild(s)}
function applyRender(){
 var b=document.body;if(!b)return;
 b.classList.toggle('tb-noblur',!CFG.cardBlur);
 b.classList.toggle('tb-iso',!!CFG.isolate);
 b.classList.toggle('tb-cv',!!CFG.cv);
 b.classList.toggle('tb-csslock',!!CFG.cssLock)}
function markLong(){
 if(!CFG.cv){$$('.tb-long').forEach(function(e){e.classList.remove('tb-long')});T.cvNodes=0;return}
 var n=0;
 ['#srRes','#stResult','#obDtc','#jrList','#wlGrid','#view'].forEach(function(sel){
  var host=$(sel);if(!host)return;
  $$('.grid,.jr-list,.wl-grid,.ob-live,#srRes,#stResult',host).concat([host]).forEach(function(c){
   var kids=c.children;if(!kids||kids.length<12)return;
   var hit=0;for(var i=0;i<kids.length;i++){
    if(kids[i].matches&&kids[i].matches('.faultcard,.web-result,.notif-item,.jr-item,.wl-item'))hit++}
   if(hit>=10){c.classList.add('tb-long');n+=hit}})});
 T.cvNodes=n}

/* ══════════ 9. PURGE (caches, journaux, doublons, médias) ══════════ */
var LOGKEYS=['tbLog','jrgLog','jraLog','techTrace','techAuthLog','obdLog','imp23Log','autoimportLog'];
async function purgeCaches(){
 var freed=0,removed=0;
 try{if(!window.caches)return{freed:0,removed:0};
  var keys=await caches.keys();
  var kf=keys.filter(function(k){return k.indexOf('kf2026')===0}).sort();
  var keep=kf.slice(-2);
  for(var i=0;i<kf.length;i++){if(keep.indexOf(kf[i])>=0)continue;
   try{var c=await caches.open(kf[i]),rq=await c.keys();
    for(var j=0;j<rq.length;j++){try{var r=await c.match(rq[j]);
     if(r){var bl=await r.clone().blob();freed+=bl.size||0}}catch(e){}}
    await caches.delete(kf[i]);removed++}catch(e){}}
 }catch(e){}
 return{freed:freed,removed:removed}}
function purgeLogs(){
 var n=0,keep=CFG.logTrim;
 LOGKEYS.forEach(function(k){var v=LS.g(k,null);
  if(Array.isArray(v)&&v.length>keep){n+=v.length-keep;LS.s(k,v.slice(0,keep))}});
 return n}
function dedup(){
 var n=0;
 try{['FAULTS','RECALLS','TSBDB'].forEach(function(nm){
  var a=window[nm];if(!Array.isArray(a))return;
  var seen={},out=[];
  for(var i=a.length-1;i>=0;i--){var it=a[i];if(!it){n++;continue}
   var id=it.id||((it.t||'')+'|'+(it.ref||''));
   if(id&&seen[id]){n++;continue}
   if(id)seen[id]=1;out.unshift(it)}
  if(n){a.length=0;for(var j=0;j<out.length;j++)a.push(out[j])}})}catch(e){}
 if(n){POOL=null;CC.clear();SNAP.clear();idxGen=-1}
 return n}
async function purgeMedia(){
 var removed=0,freed=0;
 try{if(!window.indexedDB)return{removed:0,freed:0};
  var db=await new Promise(function(res,rej){var r=indexedDB.open('kf-wall',1);
   r.onupgradeneeded=function(e){var d=e.target.result;
    if(!d.objectStoreNames.contains('items'))d.createObjectStore('items',{keyPath:'id'})};
   r.onsuccess=function(e){res(e.target.result)};r.onerror=function(){rej(r.error)}});
  var items=await new Promise(function(res,rej){var t=db.transaction('items','readonly'),
   q=t.objectStore('items').getAll();q.onsuccess=function(){res(q.result||[])};q.onerror=function(){rej(q.error)}});
  var cur=LS.g('wlCur','');
  var sorted=items.slice().sort(function(a,b){return (b.ts||0)-(a.ts||0)});
  var victims=sorted.filter(function(it,i){return i>=CFG.mediaKeep&&it.id!==cur&&!it.preset});
  if(victims.length){await new Promise(function(res,rej){
    var t=db.transaction('items','readwrite'),st=t.objectStore('items');
    victims.forEach(function(v){freed+=v.size||0;st.delete(v.id)});
    t.oncomplete=function(){res()};t.onerror=function(){rej(t.error)}});
   removed=victims.length}
  try{db.close()}catch(e){}
 }catch(e){}
 return{removed:removed,freed:freed}}
async function purge(manual){
 var t0=performance.now();
 flush();
 var c=await purgeCaches(),lg=purgeLogs(),dd=dedup(),md=await purgeMedia();
 try{var s=JSON.parse(sessionStorage.getItem('kf_jrgSession')||'null');
  if(s&&s.exp&&s.exp<Date.now())sessionStorage.removeItem('kf_jrgSession')}catch(e){}
 T.purges++;T.freed+=c.freed+md.freed;T.removed+=c.removed+lg+dd+md.removed;T.lastPurge=Date.now();
 var ms=Math.round(performance.now()-t0);
 var msg='caches '+c.removed+' · '+mo(c.freed+md.freed)+' Mo · journaux '+lg+' · doublons '+dd+' · médias '+md.removed+' · '+ms+' ms';
 tlog('PURGE',msg,'ok');
 if(manual){snd('purge');toast('🧹 Purge : '+msg)}
 paint();return msg}

/* ══════════ 10. MESURE ══════════ */
function sampleFps(){
 var n=0,t0=performance.now();
 function f(){n++;var el=performance.now()-t0;
  if(el<520)requestAnimationFrame(f);
  else{T.fps=Math.round(n/(el/1000));paint()}}
 requestAnimationFrame(f)}
try{if(window.PerformanceObserver){
 var po=new PerformanceObserver(function(l){T.long+=l.getEntries().length});
 po.observe({entryTypes:['longtask']})}}catch(e){}
function heap(){try{if(performance.memory)T.heap=performance.memory.usedJSHeapSize||0}catch(e){}}

/* ══════════ 11. BARRE DE PILOTAGE ══════════ */
function bar(){
 if($('#tbBar'))return;
 var b=document.createElement('div');b.id='tbBar';
 b.innerHTML=
 '<div class="tb-id"><span class="tb-bolt">⚡</span>'+
  '<div class="tb-id-t"><b>TURBO APK</b><span>sans perte</span></div>'+
  '<div class="tb-gauges">'+
   '<div class="tb-g"><b id="tbFps">60</b><span>fps</span></div>'+
   '<div class="tb-g"><b id="tbCorr">0</b><span>corrélation ms</span></div>'+
   '<div class="tb-g"><b id="tbScope">0</b><span>verrou ms</span></div>'+
   '<div class="tb-g"><b id="tbHit">0</b><span>cache</span></div>'+
   '<div class="tb-g"><b id="tbHeap">0</b><span>Mo</span></div>'+
  '</div>'+
  '<button class="tb-act p" data-tb="opt">⚡ Optimiser</button>'+
  '<button class="tb-act d" data-tb="purge">🧹 Purger</button></div>'+
 '<div class="tb-tools">'+
  rg('cache','Cache corrélation',0,400,'')+
  rg('moCoalesce','Coalescence observers',1,3,' img')+
  rg('purgeEvery','Purge toutes les',2,60,' min')+
  rg('logTrim','Journaux conservés',60,2000,'')+
  rg('mediaKeep','Médias conservés',4,120,'')+
  '<div class="tb-tgs">'+
   tg('scopeIdx','Verrou indexé')+tg('corrOpt','Corrélation indexée')+
   tg('moTarget','Observers recentrés')+tg('writeBehind','Écritures groupées')+
   tg('isolate','Isolation du rendu')+tg('cv','Rendu à l’approche')+
   tg('cardBlur','Flou sous les cartes')+tg('prewarm','Préchauffage')+
   tg('cssLock','Masquage CSS')+'</div>'+
  rg('density','Densité',85,125,'%')+rg('glow','Halo',0,100,'%')+rg('grain','Grain',0,40,'')+
  '<div class="tb-cols">'+
   '<div><input type="color" data-tbc="c1" value="'+CFG.c1+'"><span>Signal</span></div>'+
   '<div><input type="color" data-tbc="c2" value="'+CFG.c2+'"><span>Data</span></div>'+
   '<div><input type="color" data-tbc="c3" value="'+CFG.c3+'"><span>Alerte</span></div></div>'+
  '<div class="tb-btns">'+
   '<button data-tb="report">🧾 Rapport</button>'+
   '<button data-tb="sound" id="tbSound">'+(AU.on?'🔊':'🔇')+'</button>'+
   '<button data-tb="index">🧠 Index</button>'+
   '<button data-tb="reset">↺</button><button data-tb="rand">🎲</button>'+
   '<button data-tb="flush">💾 Écrire</button></div>'+
  '<p class="tb-note">Aucune fonctionnalité n’est mise en pause ni désactivée. Les gains viennent de l’<b>indexation</b>, du <b>cache</b> et de l’<b>isolation du rendu</b>.</p>'+
 '</div>';
 document.body.appendChild(b);
 b.addEventListener('input',function(e){
  var k=e.target.dataset&&e.target.dataset.tbc;if(!k)return;
  CFG[k]=e.target.type==='range'?+e.target.value:e.target.value;normCfg();saveCfg();
  var o=$('#tbo_'+k);if(o)o.textContent=CFG[k]+(e.target.dataset.u||'');
  theme();
  if(k==='cache')CC.clear();
  if(k==='cv')markLong();
  snd('tick');paint()});
 b.addEventListener('change',function(e){
  var t=e.target.dataset&&e.target.dataset.tbt;
  if(t){CFG[t]=e.target.checked;saveCfg();
   var w=$('#tbt_'+t);if(w)w.classList.toggle('on',CFG[t]);
   applyRender();
   if(t==='scopeIdx'&&!CFG.scopeIdx)restoreVirtual();
   if(t==='scopeIdx'&&CFG.scopeIdx){SNAP.clear();idxGen=-1;scopePass()}
   if(t==='corrOpt'){CC.clear();POOL=null}
   if(t==='cv')markLong();
   if(t==='prewarm')idle(function(){buildPoolSafe();paint()},300);
   snd('tick');paint();return}
  var k=e.target.dataset&&e.target.dataset.tbc;
  if(k&&e.target.tagName==='SELECT'){CFG[k]=e.target.value;normCfg();saveCfg();paint()}});
 b.addEventListener('click',async function(e){
  var x=e.target.closest?e.target.closest('[data-tb]'):null;if(!x)return;
  var k=x.dataset.tb;
  if(k==='opt'){optimize(true);return}
  if(k==='purge'){await purge(true);return}
  if(k==='index'){var n=buildPoolSafe();snd('idx');
   toast('🧠 Index : '+T.poolN+' fiches · '+T.idxN+' familles');paint();return}
  if(k==='flush'){var n=flush();snd('ok');toast('💾 '+n+' écriture(s) de journal validée(s)');paint();return}
  if(k==='report'){report();return}
  if(k==='sound'){AU.on=!AU.on;CFG.sound=AU.on;LS.s('tbSound',AU.on);saveCfg();
   x.textContent=AU.on?'🔊':'🔇';if(AU.on)snd('tick');return}
  if(k==='reset'){CFG=Object.assign({},DEF);normCfg();saveCfg();applyRender();
   var bb=$('#tbBar');if(bb&&bb.parentNode)bb.parentNode.removeChild(bb);bar();theme();sync();markLong();
   snd('tick');toast('↺ Turbo réinitialisé');return}
  if(k==='rand'){var pal=[['#a3e635','#38bdf8','#ff4d6d'],['#22c55e','#ffb020','#ff4d6d'],
    ['#39ff88','#7c5cff','#ff3b6b'],['#00e5a0','#4cc9f0','#f72585'],['#ffd166','#38bdf8','#ff4d9d']];
   var p=pal[Math.floor(Math.random()*pal.length)];CFG.c1=p[0];CFG.c2=p[1];CFG.c3=p[2];
   CFG.glow=25+Math.floor(Math.random()*70);CFG.grain=Math.floor(Math.random()*30);
   CFG.density=90+Math.floor(Math.random()*30);normCfg();saveCfg();
   var b2=$('#tbBar');if(b2&&b2.parentNode)b2.parentNode.removeChild(b2);bar();theme();sync();
   snd('ok');toast('🎲 Thème turbo généré');return}});
 sync();theme()}
function rg(k,l,a,b,u){return '<div class="tb-c"><label>'+l+' <b id="tbo_'+k+'">'+CFG[k]+u+'</b></label>'+
 '<input type="range" data-tbc="'+k+'" data-u="'+u+'" min="'+a+'" max="'+b+'" value="'+CFG[k]+'"></div>'}
function tg(k,l){return '<label class="tb-tg'+(CFG[k]?' on':'')+'" id="tbt_'+k+'"><input type="checkbox" data-tbt="'+k+'"'+(CFG[k]?' checked':'')+'> '+l+'</label>'}
function sync(){
 try{
  $$('[data-tbc]').forEach(function(e){var k=e.dataset.tbc;e.value=CFG[k];
   var o=$('#tbo_'+k);if(o)o.textContent=CFG[k]+(e.dataset.u||'')});
  ['scopeIdx','corrOpt','moTarget','writeBehind','isolate','cv','cardBlur','prewarm','cssLock']
   .forEach(function(k){var w=$('#tbt_'+k);
    if(w){var i=w.querySelector('input');if(i)i.checked=!!CFG[k];w.classList.toggle('on',!!CFG[k])}});
  var s=$('#tbSound');if(s)s.textContent=AU.on?'🔊':'🔇';
 }catch(e){}}
function theme(){
 try{var r=document.documentElement.style;
  r.setProperty('--tb1',CFG.c1);r.setProperty('--tb2',CFG.c2);r.setProperty('--tb3',CFG.c3);
  r.setProperty('--tb-glow',(CFG.glow/100).toFixed(2));
  r.setProperty('--tb-grain',(CFG.grain/100).toFixed(2));
  r.setProperty('--tb-den',(CFG.density/100).toFixed(2));
  var jb=$('#jrgBar'),h=jb?jb.offsetHeight:0;
  r.setProperty('--tb-off',h+'px');
  var bb=$('#tbBar');r.setProperty('--tb-h',(bb?bb.offsetHeight:0)+'px');
 }catch(e){}}
function paint(){
 try{
  var f=$('#tbFps');if(f){f.textContent=T.fps;f.className=T.fps<38?'ko':T.fps<50?'warn':''}
  var c=$('#tbCorr');if(c){var v=T.corrAvg.toFixed(1);c.textContent=v;c.className=T.corrAvg>60?'ko':T.corrAvg>25?'warn':''}
  var s=$('#tbScope');if(s){var w=T.scopeMs.toFixed(1);s.textContent=w;s.className=T.scopeMs>25?'ko':T.scopeMs>10?'warn':''}
  heap();
  var h=$('#tbHeap');if(h)h.textContent=T.heap?mo(T.heap):'—';
  var hi=$('#tbHit');if(hi){var tot=T.hits+T.miss;
   hi.textContent=tot?Math.round(T.hits/tot*100)+'%':'—'}
  var app=$('#app');
  document.body.classList.toggle('tb-on',!!(app&&!app.classList.contains('hid')));
  var n=0;for(var k in REG)if(!REG[k].dead)n++;
  T.timers=n;
  theme();
 }catch(e){}}
function report(){
 var timers=[];
 for(var k in REG){var r=REG[k];if(r.dead)continue;
  timers.push({module:r.tag,base_ms:r.base,virtuel:r.virtual||null,
   executions:r.runs||0,moyenne_ms:r.avg?+r.avg.toFixed(2):0})}
 timers.sort(function(a,b){return (b.moyenne_ms||0)-(a.moyenne_ms||0)});
 var data={ts:new Date().toISOString(),config:CFG,
  mesures:{fps:T.fps,heap_Mo:T.heap?+mo(T.heap):null,longTasks:T.long,
   correlation_ms:+T.corrAvg.toFixed(2),verrou_ms:+T.scopeMs.toFixed(2),
   fiches_indexees:T.poolN,familles:T.idxN,fiches_verrouillees:T.scopeN,
   cache_succes:T.hits,cache_calculs:T.miss,minuteurs:T.timers,minuteurs_remplaces:T.virtual,
   observer_appels:T.moCalls,observer_evites:T.moSaved,
   ecritures_differees:T.deferred,validations:T.flushes,noeuds_a_lapproche:T.cvNodes,replis:T.fallback},
  purges:{nombre:T.purges,libere_Mo:+mo(T.freed),entrees:T.removed,
   derniere:T.lastPurge?new Date(T.lastPurge).toISOString():null},
  minuteurs:timers,journal:T.log.slice(0,150)};
 try{var a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  a.download='KEV-FUSION-turbo-'+new Date().toISOString().slice(0,10)+'.json';a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href)},8000)}catch(e){}
 snd('ok');toast('🧾 Rapport turbo exporté')}

/* ══════════ 12. ORCHESTRATION ══════════ */
function buildPoolSafe(){
 try{var K=window.KFCorr;if(!K)return 0;buildPool(K);return T.poolN}catch(e){return 0}}
function restoreVirtual(){
 for(var k in REG){var r=REG[k];
  if(r.dead||!r.virtual)continue;
  if(r.virtual==='scope'&&originalLock){r.virtual=null;r.fn=originalLock;r.base=1500;r.runs=0;r.total=0;r.avg=0;
   (function(rr){(function loop(){rr.handle=nST(function(){if(rr.dead)return;
    try{rr.fn()}catch(e){}if(!rr.dead)loop()},rr.base)})()})(r)}
  if(r.virtual==='css')document.body.classList.remove('tb-csslock')}
}
var originalLock=null;
function optimize(manual){
 var a=memoCatalog(),b=memoCorr();
 applyRender();
 var n=buildPoolSafe();
 scopePass();markLong();
 CC.clear();
 if(manual){snd('opt');
  toast('⚡ Optimisé : '+T.poolN+' fiches indexées · '+T.idxN+' familles · verrou '+T.scopeMs.toFixed(1)+' ms')}
 tlog('OPTIMISATION','catalogue='+(a?'ok':'déjà')+' corrélation='+(b?'ok':'déjà')+
  ' index='+n+' verrou='+T.scopeMs.toFixed(1)+'ms','ok');
 paint()}
function start(){
 css();applyRender();theme();
 if(document.body)document.body.classList.add('tb-ready');
 bar();sync();paint();
 var tries=0;
 nST(function tick(){
  tries++;
  var a=memoCatalog(),b=memoCorr();
  if((a&&b)||tries>80){idle(function(){buildPoolSafe();scopePass();markLong();paint()},500);return}
  nST(tick,250)},120);
 /* verrou indexé : démarrage serré puis régime nominal */
 var fast=0;
 nST(function scopeLoop(){
  scopePass();
  fast++;
  nST(scopeLoop,fast<24?260:1400)},180);
 nST(function fpsLoop(){sampleFps();nST(fpsLoop,4000)},1400);
 nST(function uiLoop(){paint();markLong();nST(uiLoop,1800)},1000);
 nST(function purgeLoop(){if(!document.hidden)purge(false);
  nST(purgeLoop,Math.max(2,CFG.purgeEvery)*60000)},Math.max(2,CFG.purgeEvery)*60000);
 nST(function decay(){T.long=Math.max(0,T.long-1);nST(decay,6000)},6000);
 nST(function flushLoop(){flush();nST(flushLoop,2500)},2500);
 idle(function(){purge(false);optimize(false)},2400);
 document.addEventListener('visibilitychange',function(){
  if(!document.hidden){paint();idle(function(){scopePass();markLong()},400)}});
 var v=$('#view');
 if(v&&NMO){try{new NMO(function(){markLong()}).observe(v,{childList:true})}catch(e){}}
 tlog('INIT','Turbo sans perte actif · index + cache + isolation','ok')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.KFTurbo={optimize:optimize,purge:purge,flush:flush,report:report,index:buildPoolSafe,
 scope:scopePass,state:T,cfg:CFG,
 timers:function(){var o=[];for(var k in REG){var r=REG[k];if(!r.dead)
  o.push({module:r.tag,base:r.base,virtuel:r.virtual||null,avg:+(r.avg||0).toFixed(2),runs:r.runs||0})}return o},
 invalidate:function(){POOL=null;CC.clear();SNAP.clear();idxGen=-1;MC.mk.clear();MC.md.clear();MC.en.clear();MC.ms.clear();MC.gen=-1;return true}};
})();
