/* KEV FUSION 2026 — SW v26.3.0 · module New MRT Kevin (404) retiré du projet */
const V='kf2026-26.3.0';
const KEEP=2;
const CRIT=['quota.js','modclean.js','access.js','notify.js','app.js','data.js','admingate.js',
'notifications.js','jrgate.js','modgate.js','vinloc.js','vinloc_db.js','access.json'];
const SHELL=['./','./index.html','./icons.html','./icon.svg','./access.json',
'./quota.js','./firebase-config.js','./data.js','./app.js','./sanitize.js','./modclean.js','./turbo.js',
'./catalog.js','./catalog_ext.js','./renault_base.js','./brands_base.js',
'./megabase_catalog.js','./megabase2_catalog.js','./megabase3_catalog.js',
'./access.js','./notify.js','./extra.js','./updates.js','./diffusion.js',
'./vehicles.js','./faults.js','./faults_ext.js','./renault_faults.js',
'./models_add.js','./bigster_spring.js','./family_faults.js','./import2023.js',
'./megabase_faults.js','./megabase2_faults.js','./megabase3_faults.js',
'./correlation.js','./predictive.js','./brandlogo.js','./wallpaper.js',
'./vinloc_db.js','./vinloc.js','./jradmin.js',
'./obdpro_db.js','./obdpro.js','./obdtech_db.js','./obdtech.js',
'./websearch.js','./baseupdate.js','./autoimport.js',
'./admingate.js','./notifications.js','./pwabuilder.js','./icon-gen.js','./ghtoken.js',
'./jrgate.js','./modgate.js',
'./manifest.webmanifest','./maj-base.json','./maj-tiers.json'];
const ICONS=['./icon-16.png','./icon-32.png','./icon-48.png','./icon-64.png','./icon-72.png','./icon-96.png',
'./icon-128.png','./icon-144.png','./icon-152.png','./icon-192.png','./icon-384.png','./icon-512.png',
'./icon-192-maskable.png','./icon-512-maskable.png','./apple-touch-icon.png'];
async function trim(){
 const keys=await caches.keys();
 const kf=keys.filter(k=>k.indexOf('kf2026')===0).sort();
 const keep=kf.slice(-KEEP);
 let n=0;
 for(const k of kf){if(keep.indexOf(k)<0){await caches.delete(k);n++}}
 return n;
}
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(async k=>{
 const put=async u=>{try{const r=await fetch(u,{cache:'reload'});if(r.ok)await k.put(u,r.clone())}catch(x){}};
 await Promise.all(SHELL.map(put));
 await Promise.all(ICONS.map(put));
}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(trim().then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{const d=e.data||{};
 if(d.type==='SKIP_WAITING')self.skipWaiting();
 if(d.type==='GET_PENDING_ACTION'){
  e.source.postMessage({type:'PENDING_ACTION',action:self._pendAction||'',reqId:self._pendReq||''});
  self._pendAction='';self._pendReq='';}
 if(d.type==='NOTIFY'){
  e.waitUntil(self.registration.showNotification(d.title||'KEV FUSION',{
   body:d.body||'',icon:'./icon-192.png',badge:'./icon-96.png',tag:d.tag||('kf-'+Date.now()),
   renotify:true,requireInteraction:!!d.sticky,data:{url:'./index.html',reqId:d.reqId||'',kind:d.kind||'system'},
   actions:d.actions||[]}))}
 if(d.type==='TURBO_PURGE'){e.waitUntil(trim().then(n=>{
  if(e.source&&e.source.postMessage)e.source.postMessage({type:'TURBO_PURGED',removed:n});return n}))}
 if(d.type==='NOTIF_TEST')e.waitUntil(self.registration.showNotification(d.title||'🔥 KEV FUSION 2026',
  {body:d.body||'Notifications opérationnelles.',icon:'./icon-192.png',badge:'./icon-96.png',
   tag:'kf-test',renotify:true,data:{url:'./index.html'}}))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 /* le module retiré n'est plus jamais sondé ni servi */
 if(/new-mrt-kevin|newmrtkevin/i.test(u.href)){
  e.respondWith(new Response('',{status:204,statusText:'No Content'}));return}
 if(/access\.json$/.test(u.pathname)||/maj-(tiers|base|wall)\.json$/.test(u.pathname)||
    /manifest\.webmanifest$/.test(u.pathname)||/assetlinks\.json$/.test(u.pathname)||
    /icon\.svg$/.test(u.pathname)||/wall\.(jpg|jpeg|png|webp|webm|mp4)$/.test(u.pathname)){
  e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return}
 if(u.searchParams.has('hb')||u.searchParams.has('probe')||u.searchParams.has('t')||
    u.searchParams.has('g')||u.searchParams.has('c')){e.respondWith(fetch(r,{cache:'no-store'}));return}
 if(r.mode==='navigate'){
  e.respondWith(fetch(r).then(res=>{
    if(res.ok){const cp=res.clone();caches.open(V).then(k=>k.put('./index.html',cp))}
    return res}).catch(()=>caches.match('./index.html').then(h=>h||caches.match('./'))));
  return}
 if(u.origin===location.origin&&CRIT.some(c=>u.pathname.endsWith('/'+c))){
  e.respondWith(fetch(r).then(res=>{if(res.ok)caches.open(V).then(k=>k.put(r,res.clone()));return res})
   .catch(()=>caches.match(r)));return}
 if(u.origin===location.origin&&/\.(png|js|json|webmanifest)$/.test(u.pathname)){
  e.respondWith(caches.match(r).then(hit=>{
   const net=fetch(r).then(res=>{if(res.ok)caches.open(V).then(k=>k.put(r,res.clone()));return res}).catch(()=>hit);
   return hit||net}));return}
 e.respondWith(fetch(r).then(res=>{if(res.ok||res.type==='opaque')caches.open(V).then(k=>k.put(r,res.clone()));return res})
  .catch(()=>caches.match(r)))});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){try{d={body:e.data.text()}}catch(y){d={}}}
 const n=d.notification||d||{};
 e.waitUntil(self.registration.showNotification(n.title||'🔥 KEV FUSION 2026',
  {body:n.body||d.body||'Nouvelle notification',icon:'./icon-192.png',badge:'./icon-96.png',
   tag:n.tag||'kf-'+Date.now(),renotify:true,data:n.data||d.data||{url:'./index.html'}}))});
self.addEventListener('notificationclick',e=>{
 const data=e.notification.data||{};
 const action=e.action||'';
 e.notification.close();
 if(action){self._pendAction=action;self._pendReq=data.reqId||''}
 const url=data.url||'./index.html';
 e.waitUntil((async()=>{
  const list=await clients.matchAll({type:'window',includeUncontrolled:true});
  for(const c of list){
   if('focus' in c){
    if(action)c.postMessage({type:'NTF_ACTION',action:action,reqId:data.reqId||''});
    return c.focus()}}
  const nc=await clients.openWindow(url);
  if(nc&&action){self._pendAction=action;self._pendReq=data.reqId||''}
 })())});
try{importScripts('./firebase-config.js');const C=self.KF_FIREBASE;
 if(C&&C.enabled&&C.apiKey){
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
   'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp(C);
  firebase.messaging().setBackgroundMessageHandler(p=>{const n=p.notification||{};
   return self.registration.showNotification(n.title||'🔥 KEV FUSION 2026',
    {body:n.body||'',icon:'./icon-192.png',badge:'./icon-96.png',tag:'kf-fcm',
     data:p.data||{url:'./index.html'}})})}}catch(x){}
