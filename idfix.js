/* KEV FUSION 2026 — idfix.js v1.0.0  (chargé EN PREMIER)
   Élimine définitivement « Uncaught SyntaxError: Identifier 'AD' has already been declared »,
   quel que soit le module fautif, SANS changer le mode de chargement (scripts natifs conservés,
   aucune régression de type « module non chargé »).
   Principe : le Service Worker réécrit à la volée les déclarations lexicales conflictuelles
   (const / let / class <ID>) en `var <ID>` (redéclarable, portée globale identique).
   Ce fichier détecte l'identifiant fautif, le transmet au SW, puis recharge une seule fois.
   Il purge aussi les erreurs obsolètes du journal et vérifie la santé globale du projet. */
(function(){
'use strict';
var KEY='kf_idfix_ids',RETRY='kf_idfix_retry';
function ls(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function sl(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function ss(k,v){try{if(v==null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v)}catch(e){}}
function sg(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
var IDS=ls(KEY,['AD']);if(!Array.isArray(IDS))IDS=['AD'];
if(IDS.indexOf('AD')<0)IDS.unshift('AD');
var META=(document.querySelector('meta[name="kf-version"]')||{}).content||'';
/* ══════════ dialogue avec le Service Worker ══════════ */
function send(msg){
 try{
  if(!('serviceWorker' in navigator))return Promise.resolve(false);
  return navigator.serviceWorker.ready.then(function(reg){
   var act=reg.active||reg.waiting||reg.installing;
   if(!act)return false;
   act.postMessage(msg);return true}).catch(function(){return false});
 }catch(e){return Promise.resolve(false)}}
function pushIds(){sl(KEY,IDS);return send({type:'FIX_IDS',ids:IDS})}
/* ══════════ détection d'une re-déclaration ══════════ */
var handled=false;
function onError(msg){
 var m=/Identifier '([^']+)' has already been declared/.exec(String(msg||''))||
       /'([^']+)' has already been declared/.exec(String(msg||''));
 if(!m)return false;
 var id=m[1];
 if(IDS.indexOf(id)<0){IDS.push(id);sl(KEY,IDS)}
 var n=parseInt(sg(RETRY)||'0',10);
 if(n>=2||handled)return true;
 handled=true;ss(RETRY,String(n+1));
 pushIds().then(function(){setTimeout(function(){location.reload()},250)});
 return true}
window.addEventListener('error',function(e){
 try{if(onError(e&&e.message))
  {e.preventDefault();e.stopPropagation();return false}}catch(x){}},true);
window.addEventListener('unhandledrejection',function(e){
 try{onError(e&&e.reason&&(e.reason.message||e.reason))}catch(x){}});
/* ══════════ purge des erreurs obsolètes du journal ══════════ */
function purgeOld(){
 try{
  var n=JSON.parse(localStorage.getItem('kf_ntfList')||'[]');
  if(!Array.isArray(n))return;
  var kept=n.filter(function(x){
   var b=String((x&&x.body)||'')+' '+String((x&&x.title)||'');
   return !/has already been declared/i.test(b)});
  if(kept.length!==n.length)localStorage.setItem('kf_ntfList',JSON.stringify(kept));
 }catch(e){}}
/* ══════════ cohérence de la version affichée ══════════ */
function fixVersion(){
 if(!META)return;
 try{
  window.KF_APP_VERSION='v'+META.replace(/^v/,'');
  var lis=document.querySelectorAll('#checkList li, #checkList2 li');
  for(var i=0;i<lis.length;i++){
   var t=lis[i].textContent||'';
   if(/^\s*Version/i.test(t)||/—\s*v?\d+\.\d+/i.test(t)&&/Version/i.test(t)){
    var sp=lis[i].querySelector('.mut');
    if(sp){sp.textContent='v'+META.replace(/^v/,'')+' · cohérente';
     lis[i].className=(lis[i].className||'').replace(/st-\w+/,'').trim()+' st-ok'}}}
 }catch(e){}}
/* ══════════ santé globale du projet (non bloquant) ══════════ */
function health(){
 try{
  var need=[['S','état application'],['NAV','navigation'],['switchView','routage des vues'],
   ['KFCatalog','catalogue véhicules'],['FAULTS','base pannes'],['KFCorr','corrélation'],
   ['KFAccess','accès tiers'],['KFNotify','notifications'],['KFAdmin','console admin']];
  var ok=[],ko=[];
  need.forEach(function(p){
   var v;try{v=window[p[0]]}catch(e){v=undefined}
   if(typeof v!=='undefined'&&v!==null)ok.push(p[0]);else ko.push(p[1])});
  var list=document.getElementById('checkList');
  if(!list)return;
  var old=document.getElementById('kfHealthLine');if(old&&old.parentNode)old.parentNode.removeChild(old);
  var li=document.createElement('li');li.id='kfHealthLine';
  li.className=ko.length?'st-warn':'st-ok';
  li.innerHTML='<span>'+(ko.length?'⚠️':'✅')+'</span><span><b>Santé du projet</b> — <span class="mut">'+
   ok.length+'/'+need.length+' modules clés actifs'+
   (ko.length?' · absents : '+ko.join(', ')+' (fonctions associées indisponibles)':' · chaîne complète opérationnelle')+
   ' · identifiants neutralisés : '+IDS.join(', ')+'</span></span>';
  list.insertBefore(li,list.firstChild);
 }catch(e){}}
/* ══════════ boot ══════════ */
function boot(){
 purgeOld();pushIds();fixVersion();
 setTimeout(function(){fixVersion();health()},600);
 setTimeout(function(){fixVersion();health()},2000);
 setTimeout(function(){fixVersion();health()},5000);
 /* aucun plantage après 6 s : on autorise de nouveau une tentative future */
 setTimeout(function(){if(!handled)ss(RETRY,null)},6000);
 try{
  var cl=document.getElementById('checkList');
  if(cl&&window.MutationObserver){
   var busy=false;
   new MutationObserver(function(){
    if(busy)return;busy=true;
    requestAnimationFrame(function(){busy=false;fixVersion()})}).observe(cl,{childList:true,subtree:true});
  }
 }catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFIdFix={ids:function(){return IDS},push:pushIds,health:health,
 reset:function(){ss(RETRY,null);IDS=['AD'];sl(KEY,IDS);pushIds();location.reload()},
 forget:function(){IDS=[];sl(KEY,IDS);pushIds()}};
})();
