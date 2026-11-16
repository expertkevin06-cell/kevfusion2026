/* KEV FUSION 2026 — SW v10.0.0 · filtre véhicule strict (marque+modèle+motorisation+puissance+année) */
const V='kf2026-v10.0.0';
const SHELL=['./','./index.html','./data.js','./app.js','./sanitize.js','./catalog.js','./catalog_ext.js','./renault_base.js','./brands_base.js','./admingate.js','./access.js','./extra.js','./updates.js','./diffusion.js','./vehicles.js','./faults.js','./faults_ext.js','./renault_faults.js','./family_faults.js','./import2023.js','./correlation.js','./predictive.js','./websearch.js','./baseupdate.js','./autoimport.js','./notifications.js','./pwabuilder.js','./manifest.webmanifest','./firebase-config.js','./maj-base.json','./maj-tiers.json'];
const ICONS=['./icon-192.png','./icon-512.png','./icon-192-maskable.png','./icon-512-maskable.png','./apple-touch-icon.png','./icon-144.png','./icon-96.png','./icon-72.png','./icon-48.png','./icon-32.png','./icon-16.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(async k=>{
 for(const u of SHELL){try{await k.add(u)}catch(x){}}
 for(const u of ICONS){try{const r=await fetch(u,{cache:'reload'});if(r.ok)await k.put(u,r.clone())}catch(x){}}
}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(x=>x!==V&&x.startsWith('kf2026')).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{const d=e.data||{};
 if(d.type==='SKIP_WAITING')self.skipWaiting();
 if(d.type==='NOTIF_TEST')e.waitUntil(self.registration.showNotification(d.title||'🔥 KEV FUSION 2026',{body:d.body||'Notifications opérationnelles.',icon:'./icon-192.png',badge:'./icon-192.png',tag:'kf-test',renotify:true,data:{url:'./index.html'}}))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.searchParams.has('hb')||u.searchParams.has('probe')||u.searchParams.has('t')){e.respondWith(fetch(r,{cache:'no-store'}));return}
 if(/manifest\.webmanifest$/.test(u.pathname)||/maj-(tiers|base)\.json$/.test(u.pathname)||/assetlinks\.json$/.test(u.pathname)){
  e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return}
 if(/\.png$/.test(u.pathname)&&u.origin===location.origin){
  e.respondWith(fetch(r).then(res=>{if(res.ok)caches.open(V).then(k=>k.put(r,res.clone()));return res}).catch(()=>caches.match(r)));return}
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{if(res.ok)caches.open(V).then(k=>k.put('./index.html',res.clone()));return res}).catch(()=>caches.match('./index.html')));return}
 if(u.origin===location.origin){e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res.ok)caches.open(V).then(k=>k.put(r,res.clone()));return res}).catch(()=>hit);return hit||net}));return}
 e.respondWith(fetch(r).then(res=>{if(res.ok||res.type==='opaque')caches.open(V).then(k=>k.put(r,res.clone()));return res}).catch(()=>caches.match(r)))});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){try{d={body:e.data.text()}}catch(y){d={}}}
 const n=d.notification||d||{};
 e.waitUntil(self.registration.showNotification(n.title||'🔥 KEV FUSION 2026',{body:n.body||d.body||'Nouvelle notification',icon:'./icon-192.png',badge:'./icon-192.png',tag:n.tag||'kf-'+Date.now(),renotify:true,data:n.data||d.data||{url:'./index.html'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'./index.html';
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if('focus'in w)return w.focus()}return clients.openWindow(url)}))});
try{importScripts('./firebase-config.js');const C=self.KF_FIREBASE;
 if(C&&C.enabled&&C.apiKey){importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp(C);firebase.messaging().setBackgroundMessageHandler(p=>{const n=p.notification||{};
   return self.registration.showNotification(n.title||'🔥 KEV FUSION 2026',{body:n.body||'',icon:'./icon-192.png',badge:'./icon-192.png',tag:'kf-fcm',data:p.data||{url:'./index.html'}})})}}catch(x){}
