/* KEV FUSION 2026 — turbo.js v1.0.0
   OPTIMISATION AUTOMATIQUE DE RÉACTIVITÉ.
   Chargé tôt : il cadre tous les minuteurs des modules, throttle les MutationObserver,
   mémoïse le catalogue, met en cache la corrélation, purge périodiquement caches / journaux /
   médias / doublons, et allège le rendu GPU quand la cadence chute.
   Aucune réécriture des modules existants : tout est intercepté à la source.
   Barre de pilotage permanente : jauges live + 16 réglages appliqués immédiatement. */
(function(){
'use strict';
/* ══════════ socle ══════════ */
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},d:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function $(s,r){try{return (r||document).querySelector(s)}catch(e){return null}}
function $$(s,r){try{return Array.prototype.slice.call((r||document).querySelectorAll(s))}catch(e){return[]}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function clamp(v,a,b){v=+v;if(!isFinite(v))v=a;return Math.max(a,Math.min(b,v))}
function mb(n){return (n/1048576).toFixed(1)}
function toast(m){try{if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3000)}catch(e){}}
function idle(fn,ms){try{if(window.requestIdleCallback)return requestIdleCallback(fn,{timeout:ms||2000})}catch(e){}
 return setTimeout(fn,Math.min(ms||2000,300))}
function view(){try{return (typeof S!=='undefined'&&S.view)||''}catch(e){return''}}

/* ══════════ son ══════════ */
var AU={c:null,on:LS.g('tbSound',true)!==false};
function actx(){try{if(!AU.c)AU.c=new (window.AudioContext||window.webkitAudioContext)();
 if(AU.c&&AU.c.state==='suspended')AU.c.resume().catch(function(){});return AU.c}catch(e){return null}}
function snd(k){if(!AU.on)return;var c=actx();if(!c)return;
 var m={purge:[720,300,.18,'sine'],boost:[420,980,.2,'triangle'],lite:[300,180,.16,'sine'],
  tick:[1300,1300,.02,'sine'],ok:[660,990,.13,'triangle'],warn:[380,260,.18,'sawtooth']}[k]||[900,900,.04,'sine'];
 try{var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(50,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.11,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.03)}catch(e){}}

/* ══════════ configuration ══════════ */
var DEF={mode:'auto',purgeLevel:3,purgeEvery:6,cap:6,moFrames:2,cache:80,lite:false,
 bgPause:true,dedup:true,logTrim:240,prewarm:true,mediaKeep:14,
 c1:'#a3e635',c2:'#38bdf8',glow:48,grain:10,density:100,sound:true};
var raw=LS.g('tbCfg',{});if(!raw||typeof raw!=='object')raw={};
var CFG=Object.assign({},DEF,raw);
function normCfg(){
 CFG.purgeLevel=clamp(CFG.purgeLevel,1,5);CFG.purgeEvery=clamp(CFG.purgeEvery,2,60);
 CFG.cap=clamp(CFG.cap,2,12);CFG.moFrames=clamp(CFG.moFrames,1,8);CFG.cache=clamp(CFG.cache,0,300);
 CFG.logTrim=clamp(CFG.logTrim,40,2000);CFG.mediaKeep=clamp(CFG.mediaKeep,2,80);
 CFG.glow=clamp(CFG.glow,0,100);CFG.grain=clamp(CFG.grain,0,40);CFG.density=clamp(CFG.density,85,125);
 if(['auto','boost','balanced','eco'].indexOf(CFG.mode)<0)CFG.mode='auto';
 if(!/^#[0-9a-f]{6}$/i.test(CFG.c1||''))CFG.c1=DEF.c1;
 if(!/^#[0-9a-f]{6}$/i.test(CFG.c2||''))CFG.c2=DEF.c2}
normCfg();
function saveCfg(){LS.s('tbCfg',CFG)}
var T={fps:60,heap:0,longTasks:0,cost:0,mult:1,lite:false,paused:0,active:0,
 purges:0,freed:0,removed:0,dedup:0,hits:0,miss:0,lastPurge:0,log:[],started:Date.now(),
 indexed:0,moCount:0,moCalls:0,urls:0};
var rawLog=LS.g('tbLog',[]);if(Array.isArray(rawLog))T.log=rawLog;
function tlog(kind,msg,lvl){
 try{T.log.unshift({t:new Date().toISOString(),kind:kind,msg:msg,lvl:lvl||'info'});
  if(T.log.length>300)T.log.pop();LS.s('tbLog',T.log)}catch(e){}}

/* ══════════ 1. REGISTRE DES MINEURS ══════════ */
var nSI=window.setInterval,nCI=window.clearInterval,nST=window.setTimeout,nCT=window.clearTimeout;
var REG={},seq=100000;
function moduleTag(){
 try{var s=new Error().stack||'';var m=s.match(/[\w.\-]+\.js:\d+/g)||[];
  for(var i=0;i<m.length;i++){var f=m[i].split(':')[0].replace(/^.*\//,'');
   if(f&&f!=='turbo.js')return f}}catch(e){}
 return 'app'}
var POL={
 'brandlogo.js':{views:['recherche','etude','vin','accueil',''],factor:2.2,pause:true},
 'correlation.js':{views:null,factor:3,pause:true},
 'megabase_faults.js':{views:null,factor:2.6,pause:true},
 'megabase2_faults.js':{views:null,factor:2.6,pause:true},
 'megabase3_faults.js':{views:null,factor:2.6,pause:true},
 'jradmin.js':{views:['jradmin','jr','jrgate'],factor:2,pause:true},
 'jrgate.js':{views:['jradmin','jr','jrgate'],factor:1.8,pause:true},
 'obdpro.js':{views:['obdpro','obd'],factor:1.6,pause:true},
 'obdtech.js':{views:['obdtech'],factor:1.6,pause:true},
 'wallpaper.js':{views:['wall'],factor:2.4,pause:true},
 'import2023.js':{views:null,factor:3.2,pause:true},
 'autoimport.js':{views:null,factor:3.2,pause:true},
 'baseupdate.js':{views:null,factor:3,pause:true},
 'family_faults.js':{views:null,factor:3,pause:true},
 'app.js':{views:null,factor:1.3,pause:false,essential:true},
 'notifications.js':{views:null,factor:2,pause:false,essential:true}};
function pol(tag){return POL[tag]||{views:null,factor:1.8,pause:true}}
function modeMult(){return CFG.mode==='boost'?.55:CFG.mode==='eco'?2.6:CFG.mode==='balanced'?1:T.mult}
function effDelay(r){
 var p=pol(r.tag),f=p.factor*modeMult();
 if(p.views&&p.views.indexOf(view())<0)f*=2.2;
 var d=r.base*f*r.tune;
 return clamp(d,r.base,Math.max(r.base*CFG.cap,4000))}
function blocked(r){
 if(CFG.bgPause&&document.hidden&&r.tag!=='turbo.js'&&!pol(r.tag).essential)return true;
 if(r.suspended)return true;
 return false}
function tune(r){
 if(r.avg>10&&r.tune<CFG.cap)r.tune=Math.min(CFG.cap,r.tune*1.5);
 else if(r.avg<3&&r.tune>1)r.tune=Math.max(1,r.tune/1.25)}
function loop(r){
 r.handle=nST(function(){
  if(r.dead)return;
  if(!blocked(r)){
   var t0=performance.now();
   try{r.fn()}catch(e){}
   var dt=performance.now()-t0;
   r.runs++;r.total+=dt;r.avg=r.total/r.runs;r.last=dt;
   T.cost+=dt;tune(r);
  }
  if(!r.dead)loop(r)},effDelay(r))}
window.setInterval=function(fn,delay){
 if(typeof fn!=='function')return nSI(fn,delay);
 var base=Math.max(16,+delay||0),tag=moduleTag();
 var sig=tag+'|'+base+'|'+String(fn).slice(0,200);
 if(CFG.dedup){for(var k in REG){var o=REG[k];
  if(!o.dead&&o.sig===sig){T.dedup++;return o.id}}}
 var id=++seq;
 var r={id:id,fn:fn,base:base,tag:tag,sig:sig,tune:1,runs:0,total:0,avg:0,last:0,dead:false,suspended:false,handle:null};
 REG[id]=r;loop(r);return id};
window.clearInterval=function(id){
 var r=REG[id];
 if(r){r.dead=true;try{nCT(r.handle)}catch(e){}delete REG[id];return}
 try{nCI(id)}catch(e){}};
window.clearTimeout=function(id){
 var r=REG[id];if(r){r.dead=true;delete REG[id];return}
 try{nCT(id)}catch(e){}};
function timerStats(){
 var a=0,p=0,c=0;
 for(var k in REG){var r=REG[k];if(r.dead)continue;
  if(blocked(r))p++;else a++;c+=r.avg/Math.max(.2,effDelay(r)/1000)}
 T.active=a;T.paused=p;return{active:a,paused:p,cost:c}}

/* ══════════ 2. MUTATION OBSERVER THROTTLE ══════════ */
var NMO=window.MutationObserver,pend=[],moAdapt={};
if(NMO){
 var Wrapped=function(cb){
  var key='mo'+(++T.moCount),frames=0;
  var w=function(muts,obs){
   T.moCalls++;
   var need=clamp(CFG.moFrames+(moAdapt[key]||0),1,10);
   if(pend.indexOf(key)>=0)return;
   pend.push(key);
   var step=function(){
    if(++frames<need){requestAnimationFrame(step);return}
    var i=pend.indexOf(key);if(i>=0)pend.splice(i,1);
    frames=0;
    var t0=performance.now();
    try{cb(muts,obs)}catch(e){}
    var dt=performance.now()-t0;T.cost+=dt;
    if(dt>9)moAdapt[key]=Math.min(6,(moAdapt[key]||0)+1);
    else if(dt<2&&moAdapt[key])moAdapt[key]=Math.max(0,moAdapt[key]-1)};
   requestAnimationFrame(step)};
  return new NMO(w)};
 Wrapped.prototype=NMO.prototype;
 window.MutationObserver=Wrapped}

/* ══════════ 3. LISTENERS PASSIFS ══════════ */
var nAdd=EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener=function(type,fn,opts){
 if((type==='wheel'||type==='touchstart')&&fn&&typeof fn==='function'){
  var src='';try{src=String(fn)}catch(e){}
  if(src.indexOf('preventDefault')<0){
   if(opts===undefined||opts===false)opts={passive:true};
   else if(typeof opts==='object'&&opts&&opts.passive===undefined)opts=Object.assign({},opts,{passive:true})}}
 return nAdd.call(this,type,fn,opts)};

/* ══════════ 4. MÉMOÏSATION CATALOGUE ══════════ */
var MC={make:new Map(),model:new Map(),eng:new Map(),models:new Map(),gen:0};
function catGen(){try{var C=window.KFCatalog;if(!C||!C.CAT)return 0;
 var n=0;for(var k in C.CAT)n+=Object.keys(C.CAT[k]).length;return n}catch(e){return 0}}
function memoCatalog(){
 var C=window.KFCatalog;if(!C||C.__tbMemo)return false;
 var g=catGen();MC.gen=g;
 function wrap(name,cache,keyf){
  var o=C[name];if(typeof o!=='function')return;
  C[name]=function(){
   if(catGen()!==MC.gen){MC.make.clear();MC.model.clear();MC.eng.clear();MC.models.clear();MC.gen=catGen()}
   var k=keyf?keyf.apply(null,arguments):String(arguments[0]);
   if(cache.has(k))return cache.get(k);
   var r=o.apply(this,arguments);
   if(cache.size>900)cache.clear();
   cache.set(k,r);return r};
  C[name].__tb=true}
 wrap('resolveMake',MC.make);
 wrap('resolveModel',MC.model,function(a,b){return a+'|'+b});
 wrap('engines',MC.eng,function(a,b){return a+'|'+b});
 wrap('models',MC.models);
 C.__tbMemo=true;tlog('ACCÉLÉRATION','Catalogue mémoïsé (marques, modèles, motorisations)','ok');return true}

/* ══════════ 5. CACHE CORRÉLATION + INDEX ══════════ */
var CC=new Map(),ccGen=0;
function faultCount(){try{return (typeof FAULTS!=='undefined'&&FAULTS.length)||0}catch(e){return 0}}
function memoCorr(){
 var K=window.KFCorr;if(!K||typeof K.correlate!=='function'||K.correlate.__tb)return false;
 var o=K.correlate;
 K.correlate=function(v,opts){
  if(!CFG.cache)return o.apply(this,arguments);
  var n=faultCount();
  if(n!==ccGen){CC.clear();ccGen=n}
  var key;
  try{key=JSON.stringify([v&&v.brand,v&&v.model,v&&v.engine,v&&v.ch,v&&v.year,v&&v.y,
   opts&&opts.sys,opts&&opts.strict,(opts&&opts.readDtc||[]).join(','),n])}catch(e){key=null}
  if(key&&CC.has(key)){T.hits++;var e=CC.get(key);e.t=Date.now();return e.r}
  T.miss++;
  var r=o.apply(this,arguments);
  if(key){if(CC.size>=CFG.cache){var oldest=null,ot=Infinity;
    CC.forEach(function(x,k){if(x.t<ot){ot=x.t;oldest=k}});if(oldest)CC.delete(oldest)}
   CC.set(key,{r:r,t:Date.now()})}
  return r};
 K.correlate.__tb=true;tlog('ACCÉLÉRATION','Cache de corrélation actif ('+CFG.cache+' entrées)','ok');return true}
var IDX=null;
function buildIndex(){
 if(!CFG.prewarm){IDX=null;return 0}
 try{
  if(typeof FAULTS==='undefined')return 0;
  var m={},n=0;
  for(var i=0;i<FAULTS.length;i++){var f=FAULTS[i];if(!f)continue;
   var eng=f.eng||[];
   for(var j=0;j<eng.length;j++){var k=String(eng[j]).toUpperCase();
    (m[k]=m[k]||[]).push(i);n++}}
  IDX=m;T.indexed=n;return n}catch(e){return 0}}

/* ══════════ 6. PURGE AUTOMATIQUE ══════════ */
var LOGKEYS=['tbLog','jrgLog','jraLog','techTrace','techAuthLog','obdLog','imp23Log','autoimportLog','obdLast'];
async function purgeCaches(){
 var freed=0,removed=0;
 try{
  if(!window.caches)return{freed:0,removed:0};
  var keys=await caches.keys();
  var kf=keys.filter(function(k){return k.indexOf('kf2026')===0}).sort();
  var keep=kf.slice(-2);
  for(var i=0;i<kf.length;i++){
   if(keep.indexOf(kf[i])>=0)continue;
   try{var c=await caches.open(kf[i]);var reqs=await c.keys();
    for(var j=0;j<reqs.length;j++){try{var res=await c.match(reqs[j]);
     if(res){var b=await res.clone().blob();freed+=b.size||0}}catch(e){}}
    await caches.delete(kf[i]);removed++}catch(e){}}
 }catch(e){}
 return{freed:freed,removed:removed}}
function purgeLogs(){
 var n=0,keep=CFG.logTrim;
 LOGKEYS.forEach(function(k){
  var v=LS.g(k,null);
  if(Array.isArray(v)&&v.length>keep){n+=v.length-keep;LS.s(k,v.slice(0,keep))}});
 if(Array.isArray(T.log)&&T.log.length>keep){n+=T.log.length-keep;T.log=T.log.slice(0,keep);LS.s('tbLog',T.log)}
 return n}
function purgeLS(){
 var n=0;
 try{
  var drop=[];
  for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);
   if(!k||k.indexOf('kf_')!==0)continue;
   var v=localStorage.getItem(k);
   if(v==null||v==='null'||v==='""'||v==='[]'||v==='{}'){
    if(['kf_access','kf_session','kf_jrgHash','kf_jraHash','kf_ghToken','kf_tbCfg','kf_jrgCfg'].indexOf(k)<0)drop.push(k)}}
  drop.forEach(function(k){LS.d(k);n++});
 }catch(e){}
 return n}
function dedupBase(){
 var n=0;
 try{
  ['FAULTS','RECALLS','TSBDB'].forEach(function(name){
   var arr=window[name];if(!Array.isArray(arr))return;
   var seen={},out=[];
   for(var i=arr.length-1;i>=0;i--){var it=arr[i];if(!it){n++;continue}
    var id=it.id||(it.t||'')+'|'+(it.ref||'');
    if(id&&seen[id]){n++;continue}
    if(id)seen[id]=1;out.unshift(it)}
   if(n){arr.length=0;for(var j=0;j<out.length;j++)arr.push(out[j])}});
 }catch(e){}
 return n}
async function purgeMedia(){
 var removed=0,freed=0;
 if(CFG.purgeLevel<3)return{removed:0,freed:0};
 try{
  if(!window.indexedDB)return{removed:0,freed:0};
  var db=await new Promise(function(res,rej){var r=indexedDB.open('kf-wall',1);
   r.onupgradeneeded=function(e){var d=e.target.result;
    if(!d.objectStoreNames.contains('items'))d.createObjectStore('items',{keyPath:'id'})};
   r.onsuccess=function(e){res(e.target.result)};r.onerror=function(){rej(r.error)}});
  var items=await new Promise(function(res,rej){var t=db.transaction('items','readonly'),
   q=t.objectStore('items').getAll();q.onsuccess=function(){res(q.result||[])};q.onerror=function(){rej(q.error)}});
  var cur=LS.g('wlCur',''),keep=CFG.mediaKeep;
  var sorted=items.slice().sort(function(a,b){return (b.ts||0)-(a.ts||0)});
  var victims=sorted.filter(function(it,i){return i>=keep&&it.id!==cur&&!it.preset});
  if(victims.length){
   await new Promise(function(res,rej){var t=db.transaction('items','readwrite'),st=t.objectStore('items');
    victims.forEach(function(v){freed+=v.size||0;st.delete(v.id)});
    t.oncomplete=function(){res()};t.onerror=function(){rej(t.error)}});
   removed=victims.length}
  try{db.close()}catch(e){}
 }catch(e){}
 return{removed:removed,freed:freed}}
function purgeSession(){
 var n=0;
 try{var s=JSON.parse(sessionStorage.getItem('kf_jrgSession')||'null');
  if(s&&s.exp&&s.exp<Date.now()){sessionStorage.removeItem('kf_jrgSession');n++}}catch(e){}
 return n}
async function purge(manual){
 var t0=performance.now();
 var c=await purgeCaches();
 var lg=purgeLogs(),ls=purgeLS(),dd=dedupBase(),se=purgeSession();
 var md=await purgeMedia();
 CC.clear();MC.make.clear();MC.model.clear();MC.eng.clear();MC.models.clear();
 T.purges++;T.freed+=c.freed+md.freed;T.removed+=c.removed+lg+ls+dd+md.removed+se;T.lastPurge=Date.now();
 var ms=Math.round(performance.now()-t0);
 var msg='caches '+c.removed+' ('+mb(c.freed+md.freed)+' Mo) · journaux '+lg+' · clés '+ls+
  ' · doublons '+dd+' · médias '+md.removed+' · session '+se+' · '+ms+' ms';
 tlog('PURGE',msg,'ok');
 if(manual){snd('purge');toast('🧹 Purge : '+msg)}
 idle(function(){buildIndex();paint()},1200);
 paint();
 return msg}

/* ══════════ 7. ACCÉLÉRATION ══════════ */
function applyLite(on){
 T.lite=!!on;
 document.body.classList.toggle('tb-lite',T.lite);
 if(T.lite)document.body.classList.add('tb-lite-on');else document.body.classList.remove('tb-lite-on')}
function boost(manual){
 memoCatalog();memoCorr();
 var n=buildIndex();
 var before=T.active;
 timerStats();
 if(manual){
  for(var k in REG){var r=REG[k];if(!r.dead){r.tune=1;r.avg=0;r.total=0;r.runs=0}}
  CC.clear();
  snd('boost');toast('⚡ Accélération : index '+n+' liaisons · cache vidé · minuteurs recalibrés')}
 tlog('ACCÉLÉRATION','index '+n+' liaisons · catalogue+corrélation mémoïsés · '+(before-T.active)+' minuteurs optimisés','ok');
 paint()}
function sampleFps(){
 var n=0,t0=performance.now();
 function f(){n++;var el=performance.now()-t0;
  if(el<560)requestAnimationFrame(f);
  else{T.fps=Math.round(n/(el/1000));autoTune();paint()}}
 requestAnimationFrame(f)}
function autoTune(){
 if(CFG.mode!=='auto')return;
 var bad=T.fps<38||T.longTasks>4;
 var good=T.fps>52&&T.longTasks<2;
 if(bad){T.mult=Math.min(3,T.mult*1.25);if(!T.lite){applyLite(true);snd('lite');
  tlog('AUTO','Cadence '+T.fps+' fps → rendu allégé + minuteurs espacés','warn')}}
 else if(good){T.mult=Math.max(.85,T.mult/1.12);
  if(T.lite&&T.fps>56){applyLite(false);tlog('AUTO','Cadence rétablie '+T.fps+' fps → rendu complet','ok')}}}
try{if(window.PerformanceObserver){
 var po=new PerformanceObserver(function(list){T.longTasks+=list.getEntries().length});
 po.observe({entryTypes:['longtask']})}}catch(e){}
function heap(){try{if(performance.memory)T.heap=performance.memory.usedJSHeapSize||0}catch(e){}}

/* ══════════ 8. BARRE DE PILOTAGE ══════════ */
function bar(){
 if($('#tbBar'))return;
 var b=document.createElement('div');b.id='tbBar';
 b.innerHTML=
 '<div class="tb-id"><span class="tb-bolt">⚡</span>'+
  '<div class="tb-id-t"><b>TURBO APK</b><span id="tbMode">auto</span></div>'+
  '<div class="tb-gauges">'+
   '<div class="tb-g"><b id="tbFps">60</b><span>fps</span></div>'+
   '<div class="tb-g"><b id="tbHeap">0</b><span>Mo</span></div>'+
   '<div class="tb-g"><b id="tbTim">0</b><span>minuteurs</span></div>'+
   '<div class="tb-g"><b id="tbCost">0</b><span>ms/s</span></div>'+
   '<div class="tb-g"><b id="tbCache">0</b><span>cache</span></div>'+
  '</div>'+
  '<button class="tb-act p" data-tb="boost">⚡ Accélérer</button>'+
  '<button class="tb-act d" data-tb="purge">🧹 Purger</button></div>'+
 '<div class="tb-tools">'+
  '<div class="tb-c"><label>Mode</label><select data-tbc="mode">'+
   '<option value="auto">Automatique</option><option value="boost">Boost</option>'+
   '<option value="balanced">Équilibré</option><option value="eco">Économie</option></select></div>'+
  rg('purgeLevel','Agressivité purge',1,5,'')+
  rg('purgeEvery','Purge toutes les',2,60,' min')+
  rg('cap','Plafond minuteurs',2,12,'×')+
  rg('moFrames','Throttle observers',1,8,' img')+
  rg('cache','Cache corrélation',0,300,'')+
  rg('logTrim','Journaux conservés',40,2000,'')+
  rg('mediaKeep','Médias conservés',2,80,'')+
  '<div class="tb-tgs">'+tg('lite','Rendu allégé')+tg('bgPause','Pause en veille')+
   tg('dedup','Déduplication')+tg('prewarm','Préchauffage index')+'</div>'+
  rg('density','Densité',85,125,'%')+rg('glow','Halo',0,100,'%')+rg('grain','Grain',0,40,'')+
  '<div class="tb-cols">'+
   '<div><input type="color" data-tbc="c1" value="'+CFG.c1+'"><span>Signal</span></div>'+
   '<div><input type="color" data-tbc="c2" value="'+CFG.c2+'"><span>Data</span></div></div>'+
  '<div class="tb-btns">'+
   '<button data-tb="report">🧾 Rapport</button>'+
   '<button data-tb="sound" id="tbSound">'+(AU.on?'🔊':'🔇')+'</button>'+
   '<button data-tb="reset">↺</button><button data-tb="rand">🎲</button>'+
   '<button data-tb="index">🧠 Index</button></div>'+
 '</div>';
 document.body.appendChild(b);
 b.addEventListener('input',function(e){
  var k=e.target.dataset&&e.target.dataset.tbc;if(!k)return;
  CFG[k]=e.target.type==='range'?+e.target.value:e.target.value;normCfg();saveCfg();
  var o=$('#tbo_'+k);if(o)o.textContent=CFG[k]+(e.target.dataset.u||'');
  theme();
  if(k==='lite')applyLite(CFG.lite);
  if(k==='cache'){CC.clear()}
  if(k==='mode'){T.mult=1;$('#tbMode').textContent=CFG.mode}
  snd('tick');paint()});
 b.addEventListener('change',function(e){
  var k=e.target.dataset&&e.target.dataset.tbc;
  if(k&&e.target.tagName==='SELECT'){CFG[k]=e.target.value;normCfg();saveCfg();
   T.mult=1;$('#tbMode').textContent=CFG.mode;snd('tick');paint();return}
  var t=e.target.dataset&&e.target.dataset.tbt;
  if(t){CFG[t]=e.target.checked;saveCfg();var w=$('#tbt_'+t);if(w)w.classList.toggle('on',CFG[t]);
   if(t==='lite')applyLite(CFG.lite);
   if(t==='prewarm')idle(function(){buildIndex();paint()},400);
   snd('tick');paint();return}});
 b.addEventListener('click',async function(e){
  var x=e.target.closest?e.target.closest('[data-tb]'):null;if(!x)return;
  var k=x.dataset.tb;
  if(k==='boost'){boost(true);return}
  if(k==='purge'){await purge(true);return}
  if(k==='index'){var n=buildIndex();snd('ok');toast('🧠 Index : '+n+' liaisons moteur → fiches');paint();return}
  if(k==='report'){report();return}
  if(k==='sound'){AU.on=!AU.on;CFG.sound=AU.on;LS.s('tbSound',AU.on);saveCfg();
   x.textContent=AU.on?'🔊':'🔇';if(AU.on)snd('tick');return}
  if(k==='reset'){CFG=Object.assign({},DEF);normCfg();saveCfg();T.mult=1;applyLite(CFG.lite);
   var bb=$('#tbBar');if(bb&&bb.parentNode)bb.parentNode.removeChild(bb);bar();theme();sync();
   snd('tick');toast('↺ Turbo réinitialisé');return}
  if(k==='rand'){var pal=[['#a3e635','#38bdf8'],['#22c55e','#ffb020'],['#39ff88','#7c5cff'],
    ['#00e5a0','#4cc9f0'],['#ffd166','#ff4d9d']];
   var p=pal[Math.floor(Math.random()*pal.length)];CFG.c1=p[0];CFG.c2=p[1];
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
  ['lite','bgPause','dedup','prewarm'].forEach(function(k){
   var w=$('#tbt_'+k);if(w){var i=w.querySelector('input');if(i)i.checked=!!CFG[k];w.classList.toggle('on',!!CFG[k])}});
  var m=$('#tbMode');if(m)m.textContent=CFG.mode;
  var s=$('#tbSound');if(s)s.textContent=AU.on?'🔊':'🔇';
 }catch(e){}}
function paint(){
 try{
  var st=timerStats();
  var f=$('#tbFps');if(f){f.textContent=T.fps;f.className=T.fps<38?'ko':T.fps<50?'warn':'ok'}
  heap();
  var h=$('#tbHeap');if(h)h.textContent=T.heap?mb(T.heap):'—';
  var t=$('#tbTim');if(t)t.textContent=st.active+(st.paused?'+'+st.paused:'');
  var c=$('#tbCost');if(c){var cps=Math.round(st.cost);c.textContent=cps;c.className=cps>60?'ko':cps>25?'warn':'ok'}
  var ca=$('#tbCache');if(ca)ca.textContent=CC.size+'/'+CFG.cache;
  var app=$('#app');
  var visible=app&&!app.classList.contains('hid');
  document.body.classList.toggle('tb-on',!!visible);
  offset();
 }catch(e){}}
function offset(){
 try{
  var jb=$('#jrgBar'),h=jb?jb.offsetHeight:0;
  var r=document.documentElement.style;
  r.setProperty('--tb-offset',h+'px');
  var bar=$('#tbBar');
  var bh=bar?bar.offsetHeight:0;
  r.setProperty('--tb-h',bh+'px');
 }catch(e){}}
function theme(){
 try{var r=document.documentElement.style;
  r.setProperty('--tb1',CFG.c1);r.setProperty('--tb2',CFG.c2);
  r.setProperty('--tb-glow',(CFG.glow/100).toFixed(2));
  r.setProperty('--tb-grain',(CFG.grain/100).toFixed(2));
  r.setProperty('--tb-den',(CFG.density/100).toFixed(2));
 }catch(e){}}
function report(){
 var st=timerStats(),timers=[];
 for(var k in REG){var r=REG[k];if(r.dead)continue;
  timers.push({module:r.tag,base:r.base,effectif:Math.round(effDelay(r)),executions:r.runs,
   moyenne_ms:+r.avg.toFixed(2),dernier_ms:+r.last.toFixed(2),suspendu:blocked(r)})}
 timers.sort(function(a,b){return b.moyenne_ms-a.moyenne_ms});
 var data={ts:new Date().toISOString(),config:CFG,
  mesures:{fps:T.fps,heap_Mo:T.heap?+mb(T.heap):null,longTasks:T.longTasks,
   minuteurs_actifs:st.active,minuteurs_suspendus:st.paused,cout_ms_s:Math.round(st.cost),
   multiplicateur:+T.mult.toFixed(2),rendu_allege:T.lite,
   cache_correlation:CC.size,index_liaisons:T.indexed,
   cache_hits:T.hits,cache_miss:T.miss,observers:T.moCount,observer_calls:T.moCalls},
  purges:{nombre:T.purges,libere_Mo:+mb(T.freed),entrees_supprimees:T.removed,
   minuteurs_dedupliques:T.dedup,derniere:T.lastPurge?new Date(T.lastPurge).toISOString():null},
  minuteurs:timers,journal:T.log.slice(0,150)};
 try{var a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  a.download='KEV-FUSION-turbo-'+new Date().toISOString().slice(0,10)+'.json';a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href)},8000)}catch(e){}
 snd('ok');toast('🧾 Rapport turbo exporté')}

/* ══════════ CSS ══════════ */
function css(){
 if($('#tbCss'))return;var s=document.createElement('style');s.id='tbCss';
 s.textContent=
 ':root{--tb1:#a3e635;--tb2:#38bdf8;--tb-glow:.48;--tb-grain:.1;--tb-den:1;--tb-h:0px;--tb-offset:0px;'+
 '--tb-ink:#050d0a;--tb-ink2:#0a1712;--tb-line:#1d3f2c;--tb-line2:#2b5c40;'+
 '--tb-tx:#eefaf1;--tb-tx2:#c2ddca;--tb-mut:#84ad95;--tb-dim:#5a8570;'+
 '--tb-amber:#ffb020;--tb-gar:#ff4d6d;--tb-purple:#c084fc}'+
 /* allègement GPU */
 'body.tb-lite #scene .aurora,body.tb-lite #scene .stars,body.tb-lite .jrg-aur,body.tb-lite .jrg-parts,'+
 'body.tb-lite .wl-hero-bg,body.tb-lite .jr-hero-grid,body.tb-lite .ob-hero-bg,body.tb-lite .tc-hero-bg,'+
 'body.tb-lite .bl-parts,body.tb-lite #wallLayer .bl-grain,body.tb-lite #wallLayer .bl-parts,'+
 'body.tb-lite .jrg-grain,body.tb-lite .jrg-parts{animation:none!important;display:none!important}'+
 'body.tb-lite #topbar,body.tb-lite nav#nav,body.tb-lite .card,body.tb-lite #jrgBar,body.tb-lite #tbBar,'+
 'body.tb-lite .jrg-dock,body.tb-lite .jr-dock,body.tb-lite .ob-dock,body.tb-lite .tc-dock,body.tb-lite .wl-dock'+
 '{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'+
 'body.tb-lite .card,body.tb-lite .jrg-panel,body.tb-lite .jr-card,body.tb-lite .ob-ecu{box-shadow:0 4px 14px #0008!important}'+
 'body.tb-lite #car{animation:none!important}'+
 'body.tb-lite #car .wheel,body.tb-lite #scene .hills,body.tb-lite #scene .city,body.tb-lite #scene .roadline,'+
 'body.tb-lite #scene .dash{animation:none!important}'+
 'body.tb-lite #wallLayer .wl-media.ken{animation:none!important}'+
 'body.tb-lite *{scroll-behavior:auto!important}'+
 /* barre */
 '#tbBar{position:fixed;left:0;right:0;bottom:var(--tb-offset);z-index:140;display:none;height:126px;'+
  'background:linear-gradient(180deg,#0a1712F4,#050d0aFA);border-top:1px solid var(--tb1);'+
  'box-shadow:0 -12px 34px #000b;font-size:calc(13px*var(--tb-den))}'+
 'body.tb-on #tbBar{display:flex}'+
 'body.tb-on main{padding-bottom:calc(var(--tb-h) + var(--tb-offset) + 22px)}'+
 'body.tb-on #toast{bottom:calc(var(--tb-h) + var(--tb-offset) + 14px)}'+
 '#tbBar::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:var(--tb-grain);'+
  'background-image:radial-gradient(#a3e635 1px,transparent 1px);background-size:3px 3px;mix-blend-mode:overlay}'+
 '.tb-id{flex:none;display:flex;align-items:center;gap:10px;padding:10px 14px;border-right:1px solid var(--tb-line);'+
  'background:linear-gradient(135deg,#a3e63514,transparent);position:relative;z-index:1}'+
 '.tb-bolt{font-size:24px;filter:drop-shadow(0 0 calc(10px*var(--tb-glow)) var(--tb1))}'+
 '.tb-id-t>b{display:block;font:900 10px/1 system-ui;letter-spacing:1.4px;color:var(--tb1)}'+
 '.tb-id-t>span{display:block;font:800 10px/1 system-ui;color:var(--tb2);margin-top:4px;text-transform:uppercase}'+
 '.tb-gauges{display:flex;gap:7px}'+
 '.tb-g{min-width:52px;padding:5px 7px;border-radius:9px;background:#050d0a;border:1px solid var(--tb-line2);text-align:center}'+
 '.tb-g b{display:block;font:900 14px/1 ui-monospace,monospace;color:var(--tb1)}'+
 '.tb-g b.warn{color:var(--tb-amber)}.tb-g b.ko{color:var(--tb-gar)}'+
 '.tb-g span{display:block;font-size:7.5px;letter-spacing:.5px;text-transform:uppercase;color:var(--tb-dim);margin-top:3px}'+
 '.tb-act{flex:none;padding:9px 11px;font-size:11px;font-weight:900;border-radius:10px;cursor:pointer;white-space:nowrap;'+
  'border:1px solid var(--tb-line2);background:#050d0a;color:var(--tb-tx)}'+
 '.tb-act.p{background:linear-gradient(135deg,var(--tb1),var(--tb2));border-color:var(--tb1);color:#050d0a}'+
 '.tb-act.d{border-color:var(--tb-amber);color:var(--tb-amber);background:#ffb02012}'+
 '.tb-act:hover{transform:translateY(-1px)}'+
 '.tb-tools{flex:1;display:flex;align-items:center;gap:13px;padding:10px 14px;overflow-x:auto;overflow-y:hidden;position:relative;z-index:1}'+
 '.tb-tools::-webkit-scrollbar{height:9px}'+
 '.tb-tools::-webkit-scrollbar-track{background:#050d0a;border-radius:8px}'+
 '.tb-tools::-webkit-scrollbar-thumb{background:linear-gradient(90deg,var(--tb1),var(--tb2),var(--tb-purple));border-radius:8px;border:2px solid #050d0a}'+
 '.tb-tools::-webkit-scrollbar-thumb:hover{background:var(--tb1)}'+
 '.tb-tools{scrollbar-width:thin;scrollbar-color:var(--tb1) #050d0a}'+
 '.tb-c{flex:none;width:112px}'+
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
 '.tb-tgs{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:5px;width:236px}'+
 '.tb-tg{display:flex;align-items:center;gap:5px;font-size:9px;color:var(--tb-dim);background:#050d0a;'+
  'border:1px solid var(--tb-line2);border-radius:15px;padding:4px 8px;cursor:pointer;white-space:nowrap}'+
 '.tb-tg input{width:auto;margin:0;accent-color:var(--tb1)}'+
 '.tb-tg.on{color:var(--tb1);border-color:var(--tb1);background:#a3e63514}'+
 '.tb-cols{flex:none;display:flex;gap:6px}'+
 '.tb-cols div{display:flex;flex-direction:column;align-items:center;gap:2px}'+
 '.tb-cols input[type=color]{width:42px;height:28px;border:1px solid var(--tb-line2);border-radius:8px;background:#050d0a;padding:2px;cursor:pointer;margin:0}'+
 '.tb-cols span{font-size:7.5px;color:var(--tb-dim)}'+
 '.tb-btns{flex:none;display:grid;grid-template-columns:repeat(3,auto);gap:5px}'+
 '.tb-btns button{padding:7px 9px;font-size:10px;font-weight:800;border-radius:8px;border:1px solid var(--tb-line2);'+
  'background:#050d0a;color:var(--tb-tx);cursor:pointer;white-space:nowrap}'+
 '.tb-btns button:hover{border-color:var(--tb1);color:var(--tb1)}'+
 '@media(max-width:900px){#tbBar{height:164px;flex-direction:column}'+
  '.tb-id{border-right:0;border-bottom:1px solid var(--tb-line);padding:7px 11px;justify-content:space-between;gap:7px}'+
  '.tb-bolt{font-size:19px}.tb-g{min-width:44px;padding:4px 5px}.tb-g b{font-size:12px}'+
  '.tb-gauges{gap:5px}.tb-act{padding:7px 9px;font-size:10px}'+
  '.tb-tools{padding:8px 11px}}'+
 '@media(max-width:560px){.tb-id-t{display:none}.tb-g:nth-child(5){display:none}}'+
 '@media print{#tbBar{display:none!important}}';
 document.head.appendChild(s)}

/* ══════════ boot ══════════ */
var loops=[];
function start(){
 css();theme();
 if(document.body)document.body.classList.add('tb-ready');
 bar();sync();paint();
 /* mémoïsation dès que les modules sont là */
 var tries=0;
 var mo=nST(function tick(){
  tries++;
  var a=memoCatalog(),b=memoCorr();
  if((a&&b)||tries>60){idle(function(){buildIndex();paint()},600);return}
  mo=nST(tick,300)},200);
 loops.push(mo);
 /* boucles internes (non throttlées) */
 loops.push(nST(function fpsLoop(){sampleFps();nST(fpsLoop,4200)},1500));
 loops.push(nST(function uiLoop(){paint();nST(uiLoop,1400)},900));
 loops.push(nST(function purgeLoop(){
  if(!document.hidden)purge(false);
  nST(purgeLoop,Math.max(2,CFG.purgeEvery)*60000)},Math.max(2,CFG.purgeEvery)*60000));
 loops.push(nST(function decayLoop(){T.longTasks=Math.max(0,T.longTasks-1);T.cost*=.5;nST(decayLoop,5000)},5000));
 idle(function(){purge(false);boost(false)},2600);
 document.addEventListener('visibilitychange',function(){
  if(document.hidden){tlog('VEILLE','Minuteurs non essentiels suspendus','info')}
  else{paint();idle(function(){purge(false)},1200)}});
 window.addEventListener('pagehide',function(){try{LS.s('tbLog',T.log.slice(0,120))}catch(e){}});
 tlog('INIT','Turbo actif · mode '+CFG.mode+' · purge auto '+CFG.purgeEvery+' min','ok')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.KFTurbo={purge:purge,boost:boost,index:buildIndex,report:report,state:T,cfg:CFG,
 timers:function(){var o=[];for(var k in REG){var r=REG[k];if(!r.dead)o.push({module:r.tag,base:r.base,
  effectif:Math.round(effDelay(r)),avg:+r.avg.toFixed(2),runs:r.runs,paused:blocked(r)})}return o},
 suspend:function(tag,on){var n=0;for(var k in REG){var r=REG[k];
  if(!r.dead&&(!tag||r.tag===tag)){r.suspended=!!on;n++}}paint();return n},
 lite:function(on){CFG.lite=!!on;saveCfg();applyLite(CFG.lite);sync();return T.lite}};
})();
