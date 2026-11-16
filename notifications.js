/* KEV FUSION 2026 — notifications.js v7.1.0
   Correctif du défaut « Notifications » de l'auto-vérification :
   - état réel détaillé (support / permission / SW / TWA-Android 13+)
   - demande de permission sur geste utilisateur (bouton dédié + bouton Entrer)
   - test d'affichage réel via ServiceWorker.showNotification
   - refus utilisateur = choix, ne dégrade plus le verdict
   - ligne de contrôle actionnable et re-test en direct */
(function(){
'use strict';
if(typeof window==='undefined')return;
const KEY='kf_notifState';
function supported(){return typeof window.Notification!=='undefined'&&typeof Notification.requestPermission==='function'}
function perm(){try{return supported()?Notification.permission:'unsupported'}catch(e){return 'unsupported'}}
function isTWA(){try{return document.referrer.startsWith('android-app://')||window.matchMedia('(display-mode: standalone)').matches}catch(e){return false}}
async function swReady(){
 try{if(!('serviceWorker'in navigator))return null;
  const r=await navigator.serviceWorker.getRegistration();
  if(r&&r.active)return r;
  return await Promise.race([navigator.serviceWorker.ready,new Promise(function(res){setTimeout(function(){res(null)},4000)})]);
 }catch(e){return null}}
async function status(){
 const p=perm();
 const reg=await swReady();
 const canShow=!!(reg&&typeof reg.showNotification==='function');
 const localOk=supported()&&p==='granted';
 return{supported:supported(),permission:p,sw:!!reg,canShow:canShow,localOk:localOk,twa:isTWA(),
  ok:(p==='granted'&&(canShow||localOk))}}
function lineHTML(st){
 const p=st.permission;
 let cls='st-warn',ico='⚠️',txt='',btn='';
 if(!st.supported){cls='st-warn';ico='⚠️';txt='non supportées par ce navigateur';btn=''}
 else if(p==='granted'){
  if(st.ok){cls='st-ok';ico='✅';txt='autorisées · '+(st.canShow?'Service Worker prêt':'affichage local')+(st.twa?' · APK':'');
   btn='<button class="chipf" data-notif="test" style="margin-left:6px">🔔 Tester</button>'}
  else{cls='st-warn';ico='⚠️';txt='autorisées mais Service Worker indisponible';
   btn='<button class="chipf" data-notif="repair" style="margin-left:6px">🛠️ Réparer</button>'}}
 else if(p==='denied'){cls='st-ok';ico='✅';txt='refusées (choix utilisateur — n\'affecte pas le fonctionnement)';
  btn='<button class="chipf" data-notif="help" style="margin-left:6px">ℹ️ Réactiver</button>'}
 else{cls='st-warn';ico='🔔';txt='autorisation non demandée';
  btn='<button class="pri" data-notif="ask" style="margin-left:6px;padding:5px 12px;font-size:12px">🔔 Activer les notifications</button>'}
 return '<span class="'+cls+'">'+ico+'</span><span><b>Notifications</b> — <span class="mut">'+txt+'</span> '+btn+'</span>'}
function verdictOf(st){
 if(!st.supported)return{st:'warn',info:'non supportées'};
 if(st.permission==='denied')return{st:'ok',info:'refusées (choix utilisateur)'};
 if(st.permission==='granted')return st.ok?{st:'ok',info:'autorisées · SW prêt'}:{st:'warn',info:'autorisées · SW indisponible'};
 return{st:'warn',info:'non demandées — bouton Activer disponible'}}
async function refreshLine(){
 const st=await status();
 ls.set('notifState',{permission:st.permission,sw:st.sw,ts:Date.now()});
 const v=verdictOf(st);
 if(window.S&&S.check&&Array.isArray(S.check.results)){
  const r=S.check.results.find(function(x){return x&&x.name==='Notifications'});
  if(r){r.st=v.st;r.info=v.info}else S.check.results.push({name:'Notifications',st:v.st,info:v.info});
 }
 const list=document.getElementById('checkList');
 if(list){
  let li=document.getElementById('notifLine');
  if(!li){
   li=Array.prototype.find.call(list.children,function(n){return /Notifications/i.test(n.textContent||'')})||null;
   if(li)li.id='notifLine';
  }
  if(!li){li=document.createElement('li');li.id='notifLine';list.appendChild(li)}
  li.className='';li.innerHTML=lineHTML(st);
 }
 if(typeof window.renderVerdict==='function')window.renderVerdict();
 else if(window.S&&S.check){
  const res=S.check.results;
  const core=(typeof CORE!=='undefined'?CORE:[]);
  const cf=res.filter(function(r){return r.st==='fail'&&core.indexOf(r.name)>=0}).length;
  const w=res.filter(function(r){return r.st==='warn'}).length;
  const el=document.getElementById('verdict');
  if(el){const cls=cf?'st-fail':w?'st-warn':'st-ok';
   el.innerHTML='<span class="'+cls+'">'+(cf?'❌':w?'⚠️':'✅')+' '+(cf?'CRITIQUE — mode dégradé':w?'DÉGRADÉ — fonctionnel':'CONFORME — opérationnel')+'</span>'}
 }
 return st}
async function ask(){
 if(!supported()){toast('Notifications non supportées par ce navigateur');return await refreshLine()}
 if(Notification.permission==='denied'){
  toast('🔒 Notifications bloquées : réactive-les dans les réglages du site/app');
  help();return await refreshLine()}
 let res='default';
 try{res=await Notification.requestPermission()}catch(e){
  try{Notification.requestPermission(function(p){res=p})}catch(x){res='default'}}
 await new Promise(function(r){setTimeout(r,250)});
 const st=await refreshLine();
 if(st.permission==='granted'){toast('🔔 Notifications activées');await test(true)}
 else if(st.permission==='denied')toast('🔒 Notifications refusées — l\'app reste pleinement fonctionnelle');
 else toast('🔔 Autorisation non accordée — tu peux réessayer');
 return st}
async function test(silent){
 const st=await status();
 if(st.permission!=='granted'){if(!silent)toast('Active d\'abord les notifications');return false}
 const title='🔥 KEV FUSION 2026';
 const body='Notifications opérationnelles — demandes d\'accès, mises à jour et échéances juridiques.';
 try{
  if(st.canShow){const reg=await swReady();
   await reg.showNotification(title,{body:body,icon:'./icon-192.png',badge:'./icon-192.png',tag:'kf-test',renotify:true,data:{url:'./index.html'}});
  }else{new Notification(title,{body:body,icon:'./icon-192.png',tag:'kf-test'})}
  if(!silent)toast('🔔 Notification de test envoyée');
  return true;
 }catch(e){log('warn','notif test '+e.message);if(!silent)toast('Test impossible : '+e.message);return false}}
async function repair(){
 try{
  if('serviceWorker'in navigator){
   const reg=await navigator.serviceWorker.getRegistration();
   if(reg)await reg.update();
   else await navigator.serviceWorker.register('./sw.js');
  }
  await new Promise(function(r){setTimeout(r,600)});
  const st=await refreshLine();
  toast(st.sw?'🛠️ Service Worker réactivé':'🛠️ Service Worker toujours indisponible');
  if(st.permission==='granted'&&st.ok)await test(true);
 }catch(e){toast('Réparation : '+e.message)}}
function help(){
 const apk=isTWA();
 openModal('<h2>🔔 Réactiver les notifications</h2>'+
 '<p class="mut">Les notifications ont été refusées. Elles ne sont pas indispensables : l\'application fonctionne entièrement sans elles.</p>'+
 '<div class="card"><h3>'+(apk?'Sur l\'APK Android':'Dans le navigateur')+'</h3>'+
 (apk?'<p class="mut">1. Appui long sur l\'icône de l\'application → <b>Infos sur l\'appli</b><br>2. <b>Notifications</b> → autoriser<br>3. Reviens dans l\'application et relance l\'auto-vérification.</p>'
     :'<p class="mut">1. Clique sur l\'icône <b>🔒 / ⓘ</b> à gauche de la barre d\'adresse<br>2. <b>Notifications</b> → <b>Autoriser</b><br>3. Recharge la page.</p>')+'</div>'+
 '<div class="card"><h3>À quoi servent-elles ?</h3><p class="mut">• Demande d\'accès d\'un tiers (admin)<br>• Accord / refus / révocation (tiers)<br>• Mise à jour de base partagée<br>• Échéances juridiques à 30 jours</p></div>'+
 '<div class="row"><button class="pri" data-notif="recheck">↻ Re-vérifier</button><button data-act="closeModal">Fermer</button></div>')}
/* ---------- branchement auto-vérification ---------- */
function hook(){
 if(typeof window.runChecks==='function'&&!window.runChecks.__kfNotif){
  const _rc=window.runChecks;
  const w=async function(){const r=await _rc.apply(this,arguments);await refreshLine();return r};
  w.__kfNotif=true;window.runChecks=w}
}
hook();
/* ---------- demande sur geste utilisateur (bouton Entrer) ---------- */
function bindEnter(){
 const b=document.getElementById('btnEnter');
 if(!b||b.dataset.kfNotif)return;b.dataset.kfNotif='1';
 b.addEventListener('click',function(){
  if(supported()&&Notification.permission==='default'){
   setTimeout(function(){ask()},400)}
 },true)}
/* ---------- dispatcher ---------- */
document.addEventListener('click',async function(e){
 const b=e.target.closest('[data-notif]');if(!b)return;
 const a=b.dataset.notif;
 e.preventDefault();e.stopPropagation();
 if(a==='ask')await ask();
 else if(a==='test')await test(false);
 else if(a==='repair')await repair();
 else if(a==='help')help();
 else if(a==='recheck'){closeModal();await refreshLine();toast('↻ État des notifications actualisé')}
});
/* ---------- init ---------- */
function boot(){
 hook();bindEnter();
 const obs=new MutationObserver(function(){
  if(document.getElementById('checkList')&&!document.getElementById('notifLine'))refreshLine();
  bindEnter()});
 obs.observe(document.body,{childList:true,subtree:true});
 if(supported()&&Notification.permission==='granted')refreshLine();
 window.addEventListener('focus',function(){if(supported())refreshLine()});
 document.addEventListener('visibilitychange',function(){if(!document.hidden&&supported())refreshLine()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFNotif={status:status,ask:ask,test:test,repair:repair,refreshLine:refreshLine,help:help};
})();
