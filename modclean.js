/* KEV FUSION 2026 — modclean.js v1.0.0
   Retire définitivement le module défaillant « New MRT Kevin » (404) de TOUT le projet :
   liste des modules, auto-vérification de lancement, cartes du pavé Modules, champs de
   configuration Admin et URL mémorisées. Le retrait est réversible (console Admin →
   Modules retirés → Restaurer), journalisé et notifié. Aucun autre module n'est touché. */
(function(){
'use strict';
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},
 d:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function $(s,r){try{return (r||document).querySelector(s)}catch(e){return null}}
function $$(s,r){try{return Array.prototype.slice.call((r||document).querySelectorAll(s))}catch(e){return[]}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(m){try{if(typeof window.toast==='function')window.toast(m)}catch(e){}}
/* ══════════ ciblage ══════════ */
var RX=/new[\s_\-.]*mrt[\s_\-.]*kevin|new[\s_\-.]*mrt|(^|[\s/_.-])mrt([\s/_.-]|$)/i;
var URLRX=/new-mrt-kevin|newmrtkevin|new_mrt_kevin/i;
function hay(o){
 if(o==null)return '';
 if(typeof o==='string')return o;
 if(typeof o==='object'){
  return [o.id,o.key,o.k,o.name,o.nom,o.label,o.title,o.titre,o.t,o.url,o.href,o.src,o.file]
   .filter(Boolean).join(' ')}
 return String(o)}
function hit(o){var h=hay(o);return RX.test(h)||URLRX.test(h)}
/* ══════════ état ══════════ */
var REMOVED=LS.g('removedModules',[]);if(!Array.isArray(REMOVED))REMOVED=[];
var DONE=false,FIRST=LS.g('modcleanDone',false);
function saveRemoved(){LS.s('removedModules',REMOVED)}
/* ══════════ purge des tableaux de modules ══════════ */
var ARRAYS=['MODULES','MODS','APPS','MODULE_LIST','MODULES_LIST','APPS_LIST','MODLIST','KF_MODULES'];
function scrubArray(arr,where){
 if(!Array.isArray(arr))return 0;
 var n=0;
 for(var i=arr.length-1;i>=0;i--){
  if(hit(arr[i])){
   var it=arr[i];
   REMOVED.push({where:where,index:i,item:it,label:(typeof it==='object'?(it.name||it.label||it.title||it.nom||it.t||it.id):String(it))||'New MRT Kevin',ts:Date.now()});
   arr.splice(i,1);n++}}
 return n}
function scrubGlobals(){
 var n=0;
 ARRAYS.forEach(function(k){try{if(window[k]&&Array.isArray(window[k]))n+=scrubArray(window[k],k)}catch(e){}});
 try{if(typeof S!=='undefined'&&S){
  ['modules','mods','apps','moduleList'].forEach(function(k){
   if(Array.isArray(S[k]))n+=scrubArray(S[k],'S.'+k)})}}catch(e){}
 try{if(window.KFModules&&Array.isArray(KFModules.list))n+=scrubArray(KFModules.list,'KFModules.list')}catch(e){}
 /* listes persistées */
 ['modules','mods','apps','modUrls','modUrl'].forEach(function(k){
  var v=LS.g(k,null);
  if(Array.isArray(v)){var before=v.length;
   for(var i=v.length-1;i>=0;i--)if(hit(v[i]))v.splice(i,1);
   if(v.length!==before){LS.s(k,v);n+=before-v.length}}
  else if(v&&typeof v==='object'){
   var ch=false;Object.keys(v).forEach(function(kk){
    if(RX.test(kk)||URLRX.test(kk)||URLRX.test(String(v[kk]))){delete v[kk];ch=true;n++}});
   if(ch)LS.s(k,v)}});
 /* URL mémorisées isolées */
 try{
  var drop=[];
  for(var i=0;i<localStorage.length;i++){var key=localStorage.key(i);
   if(!key)continue;
   if(/^kf_/.test(key)&&(URLRX.test(key)||URLRX.test(localStorage.getItem(key)||'')))drop.push(key)}
  drop.forEach(function(k){LS.d(k);n++})}catch(e){}
 return n}
/* ══════════ purge du DOM ══════════ */
function scrubDom(){
 var n=0;
 /* lignes d'auto-vérification */
 $$('#checkList li, #checkList2 li').forEach(function(li){
  if(RX.test(li.textContent||'')){li.parentNode.removeChild(li);n++}});
 /* cartes / iframes / champs du pavé Modules et de l'Admin */
 $$('#view [data-mod], #view [data-module], #view .modcard, #view iframe.mod, #gate [data-mod]').forEach(function(el){
  var h=(el.getAttribute('data-mod')||'')+' '+(el.getAttribute('data-module')||'')+' '+
   (el.getAttribute('src')||'')+' '+(el.textContent||'').slice(0,160);
  if(RX.test(h)||URLRX.test(h)){
   var card=el.closest('.card, .modcard, .access-card, .domcard')||el;
   if(card&&card.parentNode){card.parentNode.removeChild(card);n++}}});
 /* blocs de configuration Admin portant l'URL */
 $$('#view input').forEach(function(inp){
  var v=(inp.value||'')+' '+(inp.id||'')+' '+(inp.getAttribute('placeholder')||'');
  if(URLRX.test(v)){
   var wrap=inp.closest('.grid>div, .row, .card')||inp;
   if(wrap&&wrap.parentNode&&wrap.id!=='view'){wrap.parentNode.removeChild(wrap);n++}}});
 return n}
/* ══════════ auto-vérification : suppression de la ligne ══════════ */
function hookChecks(){
 try{
  if(typeof window.runChecks==='function'&&!window.runChecks.__mc){
   var _rc=window.runChecks;
   var w=function(){
    scrubGlobals();
    var r=_rc.apply(this,arguments);
    Promise.resolve(r).then(function(){
     try{
      if(typeof S!=='undefined'&&S.check&&Array.isArray(S.check.results)){
       var kept=S.check.results.filter(function(x){return !hit(x)&&!RX.test(String(x.name||''))});
       S.check.results=kept;
       if(typeof window.renderVerdict==='function')window.renderVerdict()}
     }catch(e){}
     scrubDom();setTimeout(scrubDom,120);setTimeout(scrubDom,700)});
    return r};
   w.__mc=true;window.runChecks=w}
 }catch(e){}}
function hookRenders(){
 ['renderModules','renderMods','renderApps','renderAdmin'].forEach(function(fn){
  try{
   if(typeof window[fn]==='function'&&!window[fn].__mc){
    var o=window[fn];
    var f=function(){scrubGlobals();var r=o.apply(this,arguments);
     setTimeout(function(){scrubDom();paintAdmin()},40);return r};
    f.__mc=true;window[fn]=f}}catch(e){}})}
/* ══════════ console Admin : modules retirés + restauration ══════════ */
function paintAdmin(){
 try{
  var cur=(typeof S!=='undefined'&&S.view)||'';
  if(cur!=='admin')return;
  var v=$('#view');if(!v)return;
  var host=$('#mcCard');
  if(!REMOVED.length){if(host&&host.parentNode)host.parentNode.removeChild(host);return}
  if(!host){host=document.createElement('div');host.id='mcCard';host.className='card mc-card';
   v.appendChild(host);
   host.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('[data-mc]'):null;if(!b)return;
    var k=b.dataset.mc;
    if(k==='restore'){restore(+b.dataset.i);return}
    if(k==='restoreall'){restoreAll();return}
    if(k==='forget'){REMOVED=[];saveRemoved();paintAdmin();toast('🧹 Historique de retrait effacé');return}})}
  var uniq=[];var seen={};
  REMOVED.forEach(function(r,i){var lb=r.label||'Module';
   if(seen[lb])return;seen[lb]=1;uniq.push({label:lb,i:i,where:r.where,ts:r.ts})});
  host.innerHTML='<div class="mc-h"><span class="mc-ic">🧹</span><div><b>Modules retirés</b>'+
   '<span>Retirés de la liste, de l’auto-vérification, du pavé Modules et de la configuration Admin.</span></div></div>'+
   '<div class="mc-list">'+uniq.map(function(u){
    return '<div class="mc-item"><div class="mc-id"><b>'+esc(u.label)+'</b>'+
     '<span>source : '+esc(u.where||'—')+' · '+new Date(u.ts).toLocaleString('fr-FR')+'</span></div>'+
     '<span class="mc-tag">404 · indisponible</span>'+
     '<button class="mc-btn" data-mc="restore" data-i="'+u.i+'">↩ Restaurer</button></div>'}).join('')+'</div>'+
   '<div class="mc-a"><button class="mc-btn" data-mc="restoreall">↩ Tout restaurer</button>'+
    '<button class="mc-btn gh" data-mc="forget">🗑 Effacer l’historique</button></div>'}catch(e){}}
function restore(i){
 var r=REMOVED[i];if(!r)return;
 try{
  var target=null;
  if(/^S\./.test(r.where||'')){var k=r.where.slice(2);if(typeof S!=='undefined'&&Array.isArray(S[k]))target=S[k]}
  else if(window[r.where]&&Array.isArray(window[r.where]))target=window[r.where];
  if(target){target.splice(Math.min(r.index,target.length),0,r.item);
   REMOVED.splice(i,1);saveRemoved();
   toast('↩ « '+r.label+' » restauré');
   try{if(typeof window.runChecks==='function')window.runChecks()}catch(e){}
   try{if(typeof window.switchView==='function')window.switchView('admin')}catch(e){}
   paintAdmin()}
  else toast('Impossible de restaurer : liste d’origine introuvable')}catch(e){toast('Restauration impossible')}}
function restoreAll(){for(var i=REMOVED.length-1;i>=0;i--)restore(i)}
/* ══════════ CSS ══════════ */
function css(){
 if($('#mcCss'))return;var s=document.createElement('style');s.id='mcCss';
 s.textContent=
 '.mc-card{border-color:#f59e0b!important;background:linear-gradient(150deg,#1a1408ee,#141c2eee 62%)!important}'+
 '.mc-h{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}'+
 '.mc-ic{font-size:24px;filter:drop-shadow(0 0 10px #f59e0b66)}'+
 '.mc-h b{display:block;font-size:15px;color:#ffd166}'+
 '.mc-h span{display:block;font-size:12px;color:#8899b4;margin-top:3px;line-height:1.5}'+
 '.mc-list{display:flex;flex-direction:column;gap:8px}'+
 '.mc-item{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 12px;border:1px solid #f59e0b44;'+
  'border-left:3px solid #f59e0b;border-radius:11px;background:#f59e0b0a}'+
 '.mc-id{flex:1;min-width:150px}'+
 '.mc-id b{display:block;font-size:13.5px;color:#e8eefc}'+
 '.mc-id span{display:block;font-size:10.5px;color:#8899b4;margin-top:2px;font-family:ui-monospace,monospace}'+
 '.mc-tag{font:800 9.5px/1 system-ui;letter-spacing:.7px;color:#ff8f9d;border:1px solid #ef4444;'+
  'background:#ef444414;padding:5px 8px;border-radius:12px;white-space:nowrap}'+
 '.mc-btn{padding:8px 12px;font-size:11.5px;font-weight:800;border-radius:10px;cursor:pointer;'+
  'border:1px solid #22c55e;background:#22c55e14;color:#22c55e;transition:.15s}'+
 '.mc-btn:hover{background:#22c55e28;transform:translateY(-1px)}'+
 '.mc-btn.gh{border-color:#334466;background:#0f1625;color:#8899b4}'+
 '.mc-btn.gh:hover{border-color:#ef4444;color:#ef4444;background:#ef444412}'+
 '.mc-a{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}';
 document.head.appendChild(s)}
/* ══════════ cycle ══════════ */
function pass(notify){
 var n=scrubGlobals();
 var d=scrubDom();
 if(n&&!DONE){
  DONE=true;saveRemoved();
  if(!FIRST){LS.s('modcleanDone',true);
   toast('🧹 Module « New MRT Kevin » (404) retiré du projet');
   try{if(window.KFNotify)KFNotify.push({type:'update',level:'warn',
    title:'Module indisponible retiré',
    body:'New MRT Kevin (404) a été retiré de la liste, des vérifications et de la configuration Admin. Restaurable depuis la console Admin.'})}catch(e){}}}
 if(n||d){hookChecks();hookRenders()}
 paintAdmin();
 return n+d}
function boot(){
 css();hookChecks();hookRenders();
 pass(true);
 setTimeout(function(){pass()},300);
 setTimeout(function(){pass()},1200);
 setTimeout(function(){pass()},3000);
 /* surveillance : ré-apparition via un re-rendu ou une ré-importation */
 try{
  var v=$('#view'),cl=$('#checkList');
  var mo=new MutationObserver(function(){
   if(boot._busy)return;boot._busy=true;
   requestAnimationFrame(function(){boot._busy=false;
    try{scrubDom();paintAdmin()}catch(e){}})});
  if(v)mo.observe(v,{childList:true,subtree:true});
  if(cl)mo.observe(cl,{childList:true,subtree:true});
 }catch(e){}
 setInterval(function(){scrubGlobals();scrubDom();hookChecks();hookRenders();paintAdmin()},4000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFModClean={scan:function(){return pass()},removed:function(){return REMOVED},
 restore:restore,restoreAll:restoreAll,
 forget:function(){REMOVED=[];saveRemoved();paintAdmin()}};
})();
