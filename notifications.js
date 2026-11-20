/* KEV FUSION 2026 — notifications.js v2.0.0  (réécriture IIFE : supprime le conflit global « AD »)
   Couche de compatibilité et de pilotage des notifications. Toute la mécanique robuste
   (file persistante, cloche + tiroir, bannière, notifications système via SW, replis,
   vibration, son, titre) est fournie par notify.js. Ce module expose les API historiques
   attendues par app.js et les boutons data-notif, sans aucun identifiant global nu. */
(function(){
'use strict';
function $(s){try{return document.querySelector(s)}catch(e){return null}}
function toast(m){try{if(typeof window.toast==='function')window.toast(m)}catch(e){}}
function N(){return window.KFNotify||null}
function perm(){try{return ('Notification' in window)?Notification.permission:'unsupported'}catch(e){return 'unsupported'}}
/* ══════════ demande de permission + test ══════════ */
function ask(){
 try{
  var n=N();
  if(n&&n.ask)return n.ask().then(function(p){paintLine();return p});
  if(!('Notification' in window)){toast('Notifications système non supportées — la cloche et la bannière restent actives.');return Promise.resolve('unsupported')}
  return Notification.requestPermission().then(function(p){paintLine();
   if(p==='granted')test();return p});
 }catch(e){return Promise.resolve('denied')}}
function test(){
 try{
  var n=N();
  if(n&&n.push){n.push({type:'system',level:'ok',title:'KEV FUSION — notifications actives',
   body:'Cloche, bannière, système, son et vibration sont opérationnels.'});return}
  if(navigator.serviceWorker&&navigator.serviceWorker.ready){
   navigator.serviceWorker.ready.then(function(r){
    r.showNotification('KEV FUSION — test',{body:'Chaîne de notification opérationnelle.',
     icon:'./icon-192.png',badge:'./icon-96.png',tag:'kf-test',data:{url:'./index.html'}})});
   return}
  if('Notification' in window&&Notification.permission==='granted')
   new Notification('KEV FUSION — test',{body:'Chaîne de notification opérationnelle.',icon:'./icon-192.png'});
 }catch(e){}}
function open(){try{var n=N();if(n&&n.open)n.open()}catch(e){}}
function push(o){try{var n=N();if(n&&n.push)return n.push(o||{})}catch(e){}return null}
/* ══════════ ligne d'état dans l'auto-vérification ══════════ */
function paintLine(){
 var el=$('#notifLine');if(!el)return;
 var p=perm(),n=N(),cnt=n&&n.unread?n.unread():0;
 var cls=p==='granted'?'st-ok':p==='denied'?'st-fail':'st-warn';
 var lbl=p==='granted'?'autorisées':p==='denied'?'refusées (cloche active)':p==='unsupported'?'non supportées (cloche active)':'à autoriser';
 el.className=cls;
 el.innerHTML='<span>'+(p==='granted'?'✅':'⚠️')+'</span><span><b>Notifications</b> — <span class="mut">'+
  lbl+(cnt?' · '+cnt+' non traitée(s)':'')+'</span> '+
  (p!=='granted'?'<button class="pri" data-notif="ask" style="padding:4px 10px;font-size:12px">🔔 Activer</button>':'')+
  ' <button data-notif="open" style="padding:4px 10px;font-size:12px">📂 Ouvrir</button>'+
  ' <button data-notif="test" style="padding:4px 10px;font-size:12px">🧪 Tester</button></span>'}
/* ══════════ boutons data-notif ══════════ */
document.addEventListener('click',function(e){
 var b=e.target.closest?e.target.closest('[data-notif]'):null;
 if(!b)return;
 /* la cloche est gérée par notify.js : on ne la détourne pas */
 if(b.id==='notifBtn')return;
 var k=b.dataset.notif;
 if(k==='ask'){e.preventDefault();ask();return}
 if(k==='test'){e.preventDefault();test();return}
 if(k==='open'){e.preventDefault();open();return}
},false);
/* ══════════ abonnement push Firebase (si activé) ══════════ */
function subscribe(){
 try{
  var C=window.KF_FIREBASE;
  if(!C||!C.enabled||!C.apiKey||!window.firebase||!firebase.messaging)return;
  if(perm()!=='granted')return;
  navigator.serviceWorker.ready.then(function(reg){
   try{
    var m=firebase.messaging();
    m.getToken({vapidKey:C.vapidKey||C.vapid,serviceWorkerRegistration:reg}).then(function(t){
     if(t){try{localStorage.setItem('kf_fcmToken',t)}catch(e){}}
    }).catch(function(){});
   }catch(e){}});
 }catch(e){}}
function boot(){
 paintLine();
 setInterval(paintLine,5000);
 if(perm()==='granted')subscribe();
 document.addEventListener('pointerdown',function once(){
  if(perm()==='default')ask().then(function(p){if(p==='granted')subscribe()});
  document.removeEventListener('pointerdown',once)},{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
/* ══════════ API globale (compat) ══════════ */
window.notifAsk=ask;
window.askNotif=ask;
window.askNotifications=ask;
window.notifTest=test;
window.notifOpen=open;
window.KFNotif={push:push,ask:ask,test:test,open:open,perm:perm,subscribe:subscribe,
 list:function(){var n=N();return n&&n.list?n.list():[]},
 unread:function(){var n=N();return n&&n.unread?n.unread():0},
 clearAll:function(){var n=N();if(n&&n.clearAll)n.clearAll()}};
})();
