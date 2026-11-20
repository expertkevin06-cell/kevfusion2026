/* KEV FUSION 2026 — quota.js v1.1.0
   Garde-fou localStorage : purge automatique en cascade, troncature des journaux, repli mémoire.
   v1.1 : la version affichée est lue dans la meta kf-version (plus de valeur figée incohérente). */
(function(){
'use strict';
if(window.__KF_QUOTA__)return;window.__KF_QUOTA__=true;
function appVersion(){
 try{var m=document.querySelector('meta[name="kf-version"]');
  if(m&&m.content)return 'v'+String(m.content).replace(/^v/,'')}catch(e){}
 return 'v27.0'}
window.KF_APP_VERSION=appVersion();
var QUOTA=5*1024*1024,SOFT=0.70,MAXLOG=110*1024;
var LOGRE=/(log|trace|journal|history|historique)$/i;
var SAFE=['kf_tbLog','kf_jrgLog','kf_jraLog','kf_techTrace','kf_techAuthLog','kf_obdLog',
 'kf_imp23Log','kf_autoimportLog','kf_mgLog','kf_log','kf_snapshots','kf_dump','kf_photos',
 'kf_jrPhotos','kf_corrCache','kf_studyCache','kf_iconGenTs','kf_wallThumbs','kf_baseDump'];
var CRIT=/(_Hash|_hash|_session|_access|admDevice|ghToken|ghCfg|_Cfg|_cfg|studyDtc|wlCur|_cur|jrgSession|mgSession|_reg|_Reg|pwaStudio|_brand|_order|_views|_Views|removedModules|idfix)/;
var MEM=new Map(),DEGRADED=false,LASTFREED=0,PURGES=0;
var nSet=Storage.prototype.setItem,nGet=Storage.prototype.getItem,
    nRem=Storage.prototype.removeItem,nKey=Storage.prototype.key;
function sz(k,v){return ((k?k.length:0)+(v?v.length:0))*2}
function isCrit(k){return CRIT.test(k)||k==='kf_access'||k==='kf_session'||k==='kf_role'}
function usage(){var t=0;try{for(var i=0;i<localStorage.length;i++){var k=nKey.call(localStorage,i);
 t+=sz(k,nGet.call(localStorage,k))}}catch(e){}return t}
function trimLog(v,frac){
 try{var a=JSON.parse(v);
  if(Array.isArray(a)){var keep=Math.max(8,Math.round(a.length*(frac==null?0.3:frac)));
   return JSON.stringify(a.slice(0,keep))}}catch(e){}
 if(typeof v==='string'&&v.length>2000)return v.slice(0,Math.round(v.length*(frac==null?0.3:frac)));
 return v}
function rawSet(k,v){try{nSet.call(localStorage,k,v);return true}catch(e){return false}}
function rawDel(k){try{var had=nGet.call(localStorage,k)!=null;nRem.call(localStorage,k);return had?sz(k,'x'):0}catch(e){return 0}}
function purgeCascade(need){
 var freed=0,i,k,v,keys=[];
 try{for(i=0;i<localStorage.length;i++)keys.push(nKey.call(localStorage,i))}catch(e){}
 for(i=0;i<keys.length;i++){k=keys[i];
  if(isCrit(k)||!LOGRE.test(k))continue;
  v=nGet.call(localStorage,k);if(!v||v.length<3000)continue;
  var tv=trimLog(v,0.3);
  if(tv.length<v.length&&rawSet(k,tv))freed+=sz(k,v)-sz(k,tv)}
 if(freed>=need)return freed;
 for(i=0;i<SAFE.length;i++){k=SAFE[i];if(isCrit(k))continue;
  v=nGet.call(localStorage,k);if(v==null)continue;freed+=rawDel(k)||sz(k,v)}
 if(freed>=need)return freed;
 var list=[];try{for(i=0;i<localStorage.length;i++){k=nKey.call(localStorage,i);
  if(!isCrit(k))list.push([k,sz(k,nGet.call(localStorage,k))])}}catch(e){}
 list.sort(function(a,b){return b[1]-a[1]});
 for(i=0;i<list.length&&freed<need;i++)freed+=rawDel(list[i][0])||list[i][1];
 return freed}
Storage.prototype.setItem=function(k,v){
 if(this!==localStorage)return nSet.call(this,k,v);
 var s=(v==null)?'':String(v);
 if(LOGRE.test(k)&&s.length>MAXLOG)s=trimLog(s,MAXLOG/s.length*0.9)||s.slice(0,MAXLOG);
 MEM.set(k,s);
 for(var a=0;a<3;a++){
  try{nSet.call(this,k,s);DEGRADED=false;return}
  catch(e){var f=purgeCascade(sz(k,s)*1.5+64*1024);LASTFREED+=f;PURGES++;if(f<=0)break}}
 DEGRADED=true;
 try{window.dispatchEvent(new CustomEvent('kf-quota',{detail:{key:k,usage:usage()}}))}catch(e){}};
Storage.prototype.getItem=function(k){
 if(this===localStorage&&MEM.has(k))return MEM.get(k);
 return nGet.call(this,k)};
Storage.prototype.removeItem=function(k){
 if(this===localStorage)MEM.delete(k);
 return nRem.call(this,k)};
function bootPurge(){
 var u=usage();
 if(u>QUOTA*SOFT){var f=purgeCascade(u-QUOTA*0.45);LASTFREED+=f;PURGES++;u=usage()}
 window.KFQuota={usage:usage,purge:function(){var f=purgeCascade(usage());LASTFREED+=f;PURGES++;return f},
  degraded:function(){return DEGRADED},freed:function(){return LASTFREED},purges:function(){return PURGES},
  quota:QUOTA,keys:function(){var o=[];try{for(var i=0;i<localStorage.length;i++){var k=nKey.call(localStorage,i);
   o.push([k,sz(k,nGet.call(localStorage,k))])}}catch(e){}o.sort(function(a,b){return b[1]-a[1]});return o}};
 return u}
function fixChecks(){
 var list=document.getElementById('checkList');if(!list)return;
 var lis=Array.prototype.slice.call(list.children),seen={},i,li,txt;
 for(i=lis.length-1;i>=0;i--){li=lis[i];txt=(li.textContent||'').replace(/\s+/g,' ').trim();
  if(seen[txt]){li.parentNode.removeChild(li);continue}seen[txt]=1}
 lis=Array.prototype.slice.call(list.children);
 var ver=appVersion();
 for(i=0;i<lis.length;i++){txt=lis[i].textContent||'';
  if(/^\s*Version/i.test(txt)){var span=lis[i].querySelector('span.mut, .mut');
   if(span)span.textContent=ver+' · cohérente';
   lis[i].className=(lis[i].className||'').replace(/st-\w+/,'').trim()+' st-ok'}}
 var u=usage(),pct=Math.round(u/QUOTA*100),store=null;
 lis=Array.prototype.slice.call(list.children);
 for(i=0;i<lis.length;i++)if(/Stockage local|localStorage/.test(lis[i].textContent||''))store=lis[i];
 var info=pct+' % du quota ('+(u/1048576).toFixed(2)+' Mo / ~5 Mo) · '+
  (DEGRADED?'mode mémoire dégradé':'purge auto active')+
  (PURGES?' · '+PURGES+' purge(s), '+(LASTFREED/1048576).toFixed(2)+' Mo libérés':'');
 var st=DEGRADED?'st-warn':(pct>85?'st-warn':'st-ok');
 if(store){store.className=(store.className||'').replace(/st-\w+/,'').trim()+' '+st;
  var sm=store.querySelector('.mut');if(sm)sm.textContent=info;
  var ic=store.querySelector('span');if(ic)ic.textContent=DEGRADED?'⚠️':'✅'}
 else if(lis.length){var clone=lis[0].cloneNode(true);clone.className=st;
  clone.innerHTML='<span>'+(DEGRADED?'⚠️':'✅')+'</span><span><b>Stockage local</b> — <span class="mut">'+info+'</span></span>';
  list.insertBefore(clone,lis[0])}}
function hookChecks(){
 if(typeof window.runChecks!=='function'||window.runChecks.__q)return;
 var _rc=window.runChecks;
 var w=function(){var r=_rc.apply(this,arguments);
  Promise.resolve(r).then(function(){setTimeout(fixChecks,60);setTimeout(fixChecks,600)});
  return r};
 w.__q=true;window.runChecks=w}
function watchChecks(){
 var list=document.getElementById('checkList');if(!list)return;
 try{var busy=false;
  new MutationObserver(function(){if(busy)return;busy=true;
   requestAnimationFrame(function(){busy=false;fixChecks()})}).observe(list,{childList:true,subtree:true})}catch(e){}}
function boot(){
 bootPurge();hookChecks();
 if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',function(){window.KF_APP_VERSION=appVersion();hookChecks();watchChecks();fixChecks()});
 else{window.KF_APP_VERSION=appVersion();hookChecks();watchChecks();fixChecks()}
 window.addEventListener('kf-quota',function(e){
  try{if(window.toast)window.toast('⚠️ Stockage saturé : purge automatique appliquée')}catch(x){}});
 window.addEventListener('pagehide',function(){try{MEM.clear()}catch(e){}})}
boot();
})();
