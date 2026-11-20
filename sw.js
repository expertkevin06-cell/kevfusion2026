/* KEV FUSION 2026 — SW v25.1.0 · localisation VIN vérifiée par modèle/année + overrides expert */
const V='kf2026-v25.1.0';
const KEEP=2;
const SHELL=['./','./index.html','./icons.html','./icon.svg','./access.json',
'./quota.js','./firebase-config.js','./data.js','./app.js','./sanitize.js','./turbo.js',
'./catalog.js','./catalog_ext.js','./renault_base.js','./brands_base.js',
'./megabase_catalog.js','./megabase2_catalog.js','./megabase3_catalog.js',
'./access.js','./extra.js','./updates.js','./diffusion.js',
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
 if(d.type==='TURBO_PURGE'){e.waitUntil(trim().then(n=>{
  if(e.source&&e.source.postMessage)e.source.postMessage({type:'TURBO_PURGED',removed:n});return n}))}
 if(d.type==='NOTIF_TEST')e.waitUntil(self.registration.showNotification(d.title||'🔥 KEV FUSION 2026',
  {body:d.body||'Notifications opérationnelles.',icon:'./icon-192.png',badge:'./icon-96.png',
   tag:'kf-test',renotify:true,data:{url:'./index.html'}}))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(/access\.json$/.test(u.pathname)||/maj-(tiers|base|wall)\.json$/.test(u.pathname)||
    /manifest\.webmanifest$/.test(u.pathname)||/assetlinks\.json$/.test(u.pathname)||
    /icon\.svg$/.test(u.pathname)||/wall\.(jpg|jpeg|png|webp|webm|mp4)$/.test(u.pathname)){
  e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return}
 if(u.searchParams.has('hb')||u.searchParams.has('probe')||u.searchParams.has('t')||
    u.searchParams.has('g')||u.searchParams.has('c')){e.respondWith(fetch(r,{cache:'no-store'}));return}
 if(u.origin===location.origin&&/\.(png|js)$/.test(u.pathname)){
  e.respondWith(fetch(r).then(res=>{if(res.ok)caches.open(V).then(k=>k.put(r,res.clone()));return res})
   .catch(()=>caches.match(r)));return}
 if(r.mode==='navigate'){
  e.respondWith(caches.match('./index.html').then(hit=>{
   const net=fetch(r).then(res=>{if(res.ok)caches.open(V).then(k=>k.put('./index.html',res.clone()));return res}).catch(()=>hit);
   return hit||net}));return}
 if(u.origin===location.origin){e.respondWith(caches.match(r).then(hit=>{
  const net=fetch(r).then(res=>{if(res.ok)caches.open(V).then(k=>k.put(r,res.clone()));return res}).catch(()=>hit);
  return hit||net}));return}
 e.respondWith(fetch(r).then(res=>{if(res.ok||res.type==='opaque')caches.open(V).then(k=>k.put(r,res.clone()));return res})
  .catch(()=>caches.match(r)))});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){try{d={body:e.data.text()}}catch(y){d={}}}
 const n=d.notification||d||{};
 e.waitUntil(self.registration.showNotification(n.title||'🔥 KEV FUSION 2026',
  {body:n.body||d.body||'Nouvelle notification',icon:'./icon-192.png',badge:'./icon-96.png',
   tag:n.tag||'kf-'+Date.now(),renotify:true,data:n.data||d.data||{url:'./index.html'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();
 const url=(e.notification.data&&e.notification.data.url)||'./index.html';
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{
  for(const w of ws){if('focus'in w)return w.focus()}return clients.openWindow(url)}))});
try{importScripts('./firebase-config.js');const C=self.KF_FIREBASE;
 if(C&&C.enabled&&C.apiKey){
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
   'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp(C);
  firebase.messaging().setBackgroundMessageHandler(p=>{const n=p.notification||{};
   return self.registration.showNotification(n.title||'🔥 KEV FUSION 2026',
    {body:n.body||'',icon:'./icon-192.png',badge:'./icon-96.png',tag:'kf-fcm',data:p.data||{url:'./index.html'}})})}}catch(x){}
