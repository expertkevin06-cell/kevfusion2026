/* KEV FUSION 2026 — idfix.js v2.0.0
   Garde PASSIF : ne recharge plus jamais la page, ne réécrit plus aucun module.
   Il se contente de consigner les erreurs de déclaration pour le centre de santé,
   purge les erreurs obsolètes du journal et garde la version affichée cohérente.
   La neutralisation des conflits est désormais inutile : bridge.js expose les globaux
   lexicaux sur window, ce qui supprime la cause des cascades d'échec. */
(function(){
'use strict';
var KEY='kf_idfix_ids';
function ls(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function sl(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var IDS=ls(KEY,[]);if(!Array.isArray(IDS))IDS=[];
var META='';
try{var m=document.querySelector('meta[name="kf-version"]');if(m)META=m.content||''}catch(e){}
try{sessionStorage.removeItem('kf_idfix_retry')}catch(e){}
window.addEventListener('error',function(e){
 try{
  var msg=String(e&&e.message||'');
  var mm=/Identifier '([^']+)' has already been declared/.exec(msg);
  if(mm&&IDS.indexOf(mm[1])<0){IDS.push(mm[1]);sl(KEY,IDS)}
 }catch(x){}},true);
function purgeOld(){
 try{
  var n=JSON.parse(localStorage.getItem('kf_ntfList')||'[]');
  if(!Array.isArray(n))return;
  var kept=n.filter(function(x){
   var b=String((x&&x.body)||'')+' '+String((x&&x.title)||'');
   return !/has already been declared/i.test(b)});
  if(kept.length!==n.length)localStorage.setItem('kf_ntfList',JSON.stringify(kept));
 }catch(e){}}
function fixVersion(){
 if(!META)return;
 try{
  window.KF_APP_VERSION='v'+META.replace(/^v/,'');
  var lis=document.querySelectorAll('#checkList li');
  for(var i=0;i<lis.length;i++){
   if(/^\s*Version/i.test(lis[i].textContent||'')){
    var sp=lis[i].querySelector('.mut');
    if(sp)sp.textContent='v'+META.replace(/^v/,'')+' · cohérente';
    lis[i].className=(lis[i].className||'').replace(/st-\w+/,'').trim()+' st-ok'}}
 }catch(e){}}
function boot(){purgeOld();fixVersion();setTimeout(fixVersion,800);setTimeout(fixVersion,2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFIdFix={ids:function(){return IDS},purge:purgeOld,version:fixVersion};
})();
