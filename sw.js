/* KEV FUSION 2026 — SW v7.0.0 */
const V='kf2026-v7.0.0';
const SHELL=['./','./index.html','./data.js','./app.js','./sanitize.js','./admingate.js','./access.js','./extra.js','./updates.js','./diffusion.js','./vehicles.js','./faults.js','./correlation.js','./predictive.js','./websearch.js','./manifest.webmanifest','./firebase-config.js','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(async k=>{for(const u of SHELL){try{await k.add(u)}catch(x){}}}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(x=>x!==V&&x.startsWith('kf2026')).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.searchParams.has('hb')){e.respondWith(fetch(r,{cache:'no-store'}));return}
 if(/maj-(tiers|base)\.json$/.test(u.pathname)){e.respondWith(fetch(r,{cache:'no-store'}));return}
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{if(res.ok)caches.open(V).then(k=>k.put('./index.html',res.clone()));return res}).catch(()=>caches.match('./index.html')));return}
 if(u.origin===location.origin){e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res.ok)caches.open(V).then(k=>k.put(r,res.clone()));return res}).catch(()=>hit);return hit||net}));return}
 e.respondWith(fetch(r).then(res=>{if(res.ok||res.type==='opaque')caches.open(V).then(k=>k.put(r,res.clone()));return res}).catch(()=>caches.match(r)))});
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(x){}const n=d.notification||{};
 e.waitUntil(self.registration.showNotification(n.title||'🔥 KEV FUSION',{body:n.body||d.body||'Notification',icon:'./icon-192.png',data:n.data||d.data||{}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'./index.html';
 e.waitUntil(clients.matchAll({type:'window'}).then(ws=>{for(const w of ws){if('focus'in w)return w.focus()}return clients.openWindow(url)}))});
try{importScripts('./firebase-config.js');const C=self.KF_FIREBASE;
 if(C&&C.enabled&&C.apiKey){importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp(C);firebase.messaging().setBackgroundMessageHandler(p=>self.registration.showNotification((p.notification&&p.notification.title)||'🔥 KEV FUSION',{body:(p.notification&&p.notification.body)||'',icon:'./icon-192.png',data:p.data||{}}))}}catch(x){}
