/* KEV FUSION 2026 — notify.js v1.0.0
   CENTRE DE NOTIFICATIONS ROBUSTE, TOUS NAVIGATEURS.
   Corrige le cas « ça marche sur Firefox mais pas sur Chrome » :
   · garde de version du Service Worker : détecte un SW périmé, le met à jour,
     impose skipWaiting puis recharge UNE fois (Chrome servait un bundle ancien en cache)
   · navigation network-first dans le SW (index.html toujours frais)
   · notifications système via registration.showNotification() (Chrome desktop + Android),
     repli new Notification(), repli bannière/toast — jamais de silence
   · cloche = point d'entrée unique : badge compteur + tiroir plein largeur en haut avec
     AUTORISER / REFUSER / RÉVOQUER par élément
   · détection des demandes d'accès par lecture directe du stockage (indépendante d'access.js),
     events storage + BroadcastChannel + poll, donc cross-onglets et cross-navigateurs locaux
   · vibration, son, titre d'onglet, erreurs globales capturées */
(function(){
'use strict';
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hhmm(ts){var d=new Date(ts);return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p)}catch(e){}}
var AU={c:null,on:LS.g('ntfSound',true)};
function snd(k){if(!AU.on)return;
 try{var c=AU.c||(AU.c=new (window.AudioContext||window.webkitAudioContext)());
  if(c.state==='suspended')c.resume();
  var m={req:[523,784,.24,'triangle'],ok:[660,990,.16,'sine'],no:[300,180,.22,'sawtooth'],
   tick:[1300,1300,.02,'sine'],err:[200,120,.3,'sawtooth']}[k]||[900,900,.04,'sine'];
  var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(60,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.13,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.03)}catch(e){}}
function isAdmin(){try{return (typeof S!=='undefined'&&S.role==='admin')||LS.g('admDevice',false)===true}catch(e){return LS.g('admDevice',false)===true}}

/* ══════════ file de notifications persistante ══════════ */
var N=LS.g('ntfList',[]);if(!Array.isArray(N))N=[];
var seenReq=LS.g('ntfSeenReq',{});
var seenList=LS.g('ntfSeenList','');
function save(){LS.s('ntfList',N.slice(0,120))}
function push(o){
 var n={id:o.id||('n'+Date.now()+Math.random().toString(36).slice(2,6)),
  type:o.type||'system',title:o.title||'',body:o.body||'',level:o.level||'info',
  t:Date.now(),read:false,reqId:o.reqId||null,sticky:!!o.sticky,actions:o.actions||null};
 N.unshift(n);if(N.length>120)N.pop();save();
 paintBadge();paintDrawer();paintTitle();
 if(n.type==='access'||n.level==='crit'){snd('req');buzz([140,70,140]);native(n)}
 else if(n.level==='err'){snd('err');buzz(90)}
 else snd('tick');
 return n}
function unread(){return N.filter(function(x){return !x.read}).length}
function markAll(){N.forEach(function(x){x.read=true});save();paintBadge();paintDrawer();paintTitle()}
function clearAll(){N=[];save();paintBadge();paintDrawer();paintTitle()}
function remove(id){N=N.filter(function(x){return x.id!==id});save();paintBadge();paintDrawer();paintTitle()}

/* ══════════ notifications système (multi-repli) ══════════ */
function perm(){try{return ('Notification' in window)?Notification.permission:'unsupported'}catch(e){return 'unsupported'}}
function askPerm(){
 try{
  if(!('Notification' in window)){toastMsg('Notifications système non supportées ici — la bannière et la cloche restent actives.');return Promise.resolve('unsupported')}
  return Notification.requestPermission().then(function(p){paintDrawer();
   if(p==='granted')nativeTest();return p})}catch(e){return Promise.resolve('denied')}}
function nativeTest(){
 native({title:'KEV FUSION — notifications actives',body:'Vous recevrez ici les demandes d’accès et alertes.',type:'system'})}
function native(n){
 try{
  if(navigator.serviceWorker&&navigator.serviceWorker.ready){
   navigator.serviceWorker.ready.then(function(reg){
    try{reg.showNotification(n.title,{body:n.body,icon:'./icon-192.png',badge:'./icon-96.png',
     tag:'kf-'+(n.reqId||n.id),renotify:true,requireInteraction:(n.type==='access'),
     data:{url:'./index.html',reqId:n.reqId||'',kind:n.type},
     actions:(n.type==='access')?[{action:'approve',title:'✅ Autoriser'},{action:'refuse',title:'❌ Refuser'}]:[]
    })}catch(e){fallbackNative(n)}});
   return}
  fallbackNative(n);
 }catch(e){}}
function fallbackNative(n){
 try{
  if('Notification' in window&&Notification.permission==='granted'){new Notification(n.title,{body:n.body,icon:'./icon-192.png',tag:'kf-'+n.id})}
 }catch(e){}}
function toastMsg(m){try{if(typeof window.toast==='function')window.toast(m);else{
 var t=$('#toast');if(t){t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3200)}}}catch(e){}}

/* ══════════ badge cloche + titre ══════════ */
function pendingReqs(){
 try{var r=LS.g('accessReqs',[]);return Array.isArray(r)?r.filter(function(x){return x.st==='pending'}):[]}catch(e){return[]}}
function grantedList(){try{var l=LS.g('accessList',{});return (l&&l.granted)||[]}catch(e){return[]}}
function badgeCount(){return pendingReqs().length+unread()}
function paintBadge(){
 var b=$('#notifBtn');if(!b)return;
 var old=$('#ntfBadge');if(old&&old.parentNode)old.parentNode.removeChild(old);
 var n=badgeCount();
 b.classList.toggle('ntf-hot',n>0);
 if(n>0){var s=document.createElement('span');s.id='ntfBadge';
  s.textContent=n>9?'9+':n;
  s.style.cssText='position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;border-radius:10px;background:#ff2d55;color:#fff;font:900 11px/20px system-ui;text-align:center;padding:0 5px;box-shadow:0 0 14px #ff2d55;z-index:5';
  b.style.position='relative';b.appendChild(s)}}
function paintTitle(){
 var base='KEV FUSION 2026';var n=badgeCount();
 document.title=(n>0?'('+n+') 🔔 ':'')+base}

/* ══════════ tiroir (menu cloche) ══════════ */
var DRAWER_OPEN=false;
function drawer(){
 var d=$('#ntfDrawer');
 if(!d){d=document.createElement('div');d.id='ntfDrawer';
  document.body.appendChild(d);
  d.addEventListener('click',function(e){
   var t=e.target.closest?e.target.closest('[data-ntf]'):null;
   if(!t){if(e.target.id==='ntfDrawer')closeDrawer();return}
   var k=t.dataset.ntf,id=t.dataset.id,p=t.dataset.p;
   if(k==='close')closeDrawer();
   else if(k==='all')markAll();
   else if(k==='clear')clearAll();
   else if(k==='perm')askPerm();
   else if(k==='sound'){AU.on=!AU.on;LS.s('ntfSound',AU.on);paintDrawer();if(AU.on)snd('ok')}
   else if(k==='read'){var n=N.find(function(x){return x.id===id});if(n){n.read=true;save();paintBadge();paintDrawer();paintTitle()}return}
   else if(k==='approve'){var r=reqById(id);if(r&&window.KFAccess)KFAccess.approve(r);else approveLocal(r);return}
   else if(k==='refuse'){var r2=reqById(id);if(r2&&window.KFAccess)KFAccess.refuse(r2);else refuseLocal(r2);return}
   else if(k==='revoke'){if(window.KFAccess)KFAccess.revoke(p);return}
   else if(k==='goto'){closeDrawer();try{if(typeof switchView==='function')switchView('admin')}catch(e){}}
  })}
 return d}
function reqById(id){try{var r=LS.g('accessReqs',[]);return r.find(function(x){return x.id===id})}catch(e){return null}}
function openDrawer(){DRAWER_OPEN=true;markVisibleRead();paintDrawer();drawer().classList.add('open')}
function closeDrawer(){DRAWER_OPEN=false;var d=$('#ntfDrawer');if(d)d.classList.remove('open')}
function markVisibleRead(){/* ouvrir le tiroir ne marque pas lu automatiquement : bouton explicite */}
function paintDrawer(){
 if(!DRAWER_OPEN)return;
 var d=drawer();
 var ps=pendingReqs(),gl=grantedList(),p=perm();
 d.innerHTML=
  '<div class="nd-head"><b>🔔 Notifications</b>'+
   '<span class="nd-count">'+badgeCount()+' non traitée(s)</span>'+
   '<button class="nd-x" data-ntf="close">✕</button></div>'+
  '<div class="nd-tools">'+
   '<button data-ntf="all">✔ Tout marquer lu</button>'+
   '<button data-ntf="clear">🗑 Effacer</button>'+
   '<button data-ntf="sound">'+(AU.on?'🔊 Son':'🔇 Muet')+'</button>'+
   '<button class="pri" data-ntf="perm">'+(p==='granted'?'✅ Système actif':p==='denied'?'⛔ Système refusé':'🔔 Activer le système')+'</button>'+
  '</div>'+
  (ps.length
   ?'<div class="nd-sec"><b>📥 Demandes d’accès tiers — action immédiate</b>'+
     ps.map(function(r){
      return '<div class="nd-item access">'+
       '<div class="nd-i-h"><span class="nd-dot"></span><b>'+esc(r.p)+'</b>'+
        '<span class="nd-t">'+hhmm(r.t)+' · '+esc(r.ch||'—')+'</span></div>'+
       (isAdmin()
        ?'<div class="nd-a"><button class="ok" data-ntf="approve" data-id="'+r.id+'">✅ AUTORISER</button>'+
          '<button class="ko" data-ntf="refuse" data-id="'+r.id+'">❌ REFUSER</button></div>'
        :'<div class="nd-a"><button data-ntf="goto">🛡️ Connexion admin pour autoriser</button></div>')+
       '</div>'}).join('')+'</div>'
   :'<div class="nd-sec empty">Aucune demande d’accès en attente.</div>')+
  (gl.length
   ?'<div class="nd-sec"><b>🚫 Accès actifs — révocation</b>'+
     gl.map(function(g){
      return '<div class="nd-item revoke"><b>'+esc(g.prenom)+'</b><span class="nd-t">→ '+esc(g.exp||'∞')+'</span>'+
       '<button class="ko" data-ntf="revoke" data-p="'+esc(g.prenom)+'">🚫 RÉVOQUER</button></div>'}).join('')+'</div>'
   :'')+
  '<div class="nd-sec"><b>🗂 Journal</b>'+
   (N.length?N.slice(0,40).map(function(n){
     return '<div class="nd-item '+n.type+' '+(n.read?'read':'')+'">'+
      '<div class="nd-i-h"><span class="nd-ic">'+iconFor(n)+'</span><b>'+esc(n.title)+'</b>'+
       '<span class="nd-t">'+hhmm(n.t)+'</span></div>'+
      (n.body?'<p>'+esc(n.body)+'</p>':'')+
      '<div class="nd-a small">'+(n.read?'':'<button data-ntf="read" data-id="'+n.id+'">✔ lu</button>')+
       '<button data-ntf="del" data-id="'+n.id+'" hidden>🗑</button></div></div>'}).join('')
    :'<div class="empty">Aucune notification.</div>')+
  '</div>'}
function iconFor(n){return{access:'🔐',granted:'✅',refused:'❌',revoked:'🚫',error:'⚠️',update:'🔄',obd:'🔌',system:'🔔'}[n.type]||'🔔'}
/* actions locales de repli si KFAccess absent */
function approveLocal(r){if(!r)return;
 try{var l=LS.g('accessList',{granted:[],refused:[],revoked:[]});
  l.granted=l.granted||[];l.granted.push({prenom:r.p,exp:new Date(Date.now()+30*864e5).toISOString().slice(0,10),since:Date.now()});
  LS.s('accessList',l);
  var rs=LS.g('accessReqs',[]);rs.forEach(function(x){if(x.id===r.id)x.st='granted'});LS.s('accessReqs',rs);
  push({type:'granted',title:'Accès autorisé (local)',body:r.p+' — publiez access.json pour notifier le tiers.',level:'ok'});
  paintBadge();paintDrawer()}catch(e){}}
function refuseLocal(r){if(!r)return;
 try{var l=LS.g('accessList',{granted:[],refused:[],revoked:[]});
  l.refused=l.refused||[];l.refused.push({prenom:r.p,since:Date.now()});LS.s('accessList',l);
  var rs=LS.g('accessReqs',[]);rs.forEach(function(x){if(x.id===r.id)x.st='refused'});LS.s('accessReqs',rs);
  paintBadge();paintDrawer()}catch(e){}}

/* ══════════ détection des demandes (indépendante d'access.js) ══════════ */
function scanReqs(){
 var ps=pendingReqs();
 ps.forEach(function(r){
  var key=r.id+':'+r.st;
  if(seenReq[r.id]!==key){
   var isNew=!seenReq[r.id];
   seenReq[r.id]=key;LS.s('ntfSeenReq',seenReq);
   if(isNew){
    push({type:'access',reqId:r.id,sticky:true,level:'crit',
     title:'Demande d’accès — '+r.p,
     body:'Reçue par '+(r.ch||'—')+' à '+hhmm(r.t)+'. Autoriser, refuser ou révoquer depuis la cloche.'});
   }}});
 /* changements de la liste publiée (côté tiers) */
 try{var l=LS.g('accessList',{});var sig=JSON.stringify((l&&l.granted)||[])+JSON.stringify((l&&l.revoked)||[]);
  if(seenList&&sig!==seenList){
   var me=LS.g('myPrenom','');
   if(me){var st=null;(l.granted||[]).forEach(function(g){if(g.prenom===me)st='granted'});
    if(!st)(l.revoked||[]).forEach(function(g){if(g.prenom===me)st='revoked'});
    if(!st)(l.refused||[]).forEach(function(g){if(g.prenom===me)st='refused'});
    if(st)push({type:st,title:'Statut de votre accès : '+st,body:'Mise à jour de access.json reçue.',level:st==='granted'?'ok':'warn'})}}
  seenList=sig;LS.s('ntfSeenList',sig)}catch(e){}}
window.addEventListener('storage',function(e){
 if(e.key==='kf_accessReqs'||e.key==='kf_accessList'){scanReqs();paintBadge();paintDrawer()}});
var bcN=null;try{bcN=new BroadcastChannel('kf-notify')}catch(e){}
if(bcN)bcN.onmessage=function(e){if(e.data&&e.data.type==='req')scanReqs()};

/* ══════════ erreurs globales ══════════ */
var errT=0;
window.addEventListener('error',function(e){
 var now=Date.now();if(now-errT<4000)return;errT=now;
 push({type:'error',level:'err',title:'Erreur applicative',body:String(e.message||'').slice(0,140)})});
window.addEventListener('unhandledrejection',function(e){
 var now=Date.now();if(now-errT<4000)return;errT=now;
 push({type:'error',level:'err',title:'Promesse rejetée',body:String(e.reason&&e.reason.message||e.reason||'').slice(0,140)})});

/* ══════════ cloche : interception ══════════ */
document.addEventListener('click',function(e){
 var b=e.target.closest?e.target.closest('#notifBtn'):null;
 if(!b)return;
 e.preventDefault();e.stopPropagation();
 if(DRAWER_OPEN)closeDrawer();else openDrawer();
 snd('tick');
},true);

/* ══════════ actions depuis notifications SW ══════════ */
function handleAction(action,reqId){
 if(!action)return;
 var r=reqById(reqId)||pendingReqs()[0];
 if(!r)return;
 if(action==='approve'){if(window.KFAccess)KFAccess.approve(r);else approveLocal(r)}
 else if(action==='refuse'){if(window.KFAccess)KFAccess.refuse(r);else refuseLocal(r)}}
if(navigator.serviceWorker){
 navigator.serviceWorker.addEventListener('message',function(e){
  var d=e.data||{};
  if(d.type==='NTF_ACTION')handleAction(d.action,d.reqId);
  if(d.type==='PENDING_ACTION'&&d.action){handleAction(d.action,d.reqId);
   try{navigator.serviceWorker.ready.then(function(reg){reg.active.postMessage({type:'GET_PENDING_ACTION'})})}catch(x){}}
  if(d.type==='TURBO_PURGED')push({type:'update',title:'Caches purgés',body:d.removed+' ancien(s) cache(s) supprimé(s).',level:'ok'})});
}

/* ══════════ garde de version SW (corrige Chrome périmé) ══════════ */
function metaVersion(){try{var m=document.querySelector('meta[name="kf-version"]');return m?m.content:''}catch(e){return''}}
function guard(){
 if(!('serviceWorker' in navigator))return;
 var done=sessionStorage.getItem('kf_swguard');
 navigator.serviceWorker.ready.then(function(reg){
  reg.update().catch(function(){});
  fetch('sw.js?g='+Date.now(),{cache:'no-store'}).then(function(r){return r.text()}).then(function(txt){
   var m=txt.match(/const V='kf2026-([\d.]+)'/);if(!m)return;
   var swv=m[1],mv=metaVersion();
   if(mv&&swv!==mv&&!done){
    sessionStorage.setItem('kf_swguard','1');
    push({type:'update',level:'warn',title:'Mise à jour du Service Worker',body:'Version '+swv+' → '+mv+'. Rechargement…'});
    reg.active.postMessage({type:'SKIP_WAITING'});
    var once=function(){window.location.reload()};
    navigator.serviceWorker.addEventListener('controllerchange',once,{once:true});
    setTimeout(once,2500);
   }else if(done){sessionStorage.removeItem('kf_swguard')}
  }).catch(function(){});
  /* récupérer une action notification en attente (client fraîchement ouvert) */
  try{reg.active.postMessage({type:'GET_PENDING_ACTION'})}catch(e){}
 }).catch(function(){})}

/* ══════════ CSS ══════════ */
function css(){if($('#ntfCss'))return;var s=document.createElement('style');s.id='ntfCss';
 s.textContent=
 '#notifBtn.ntf-hot{border-color:#ff2d55!important;color:#ff2d55!important;background:#ff2d5518!important;animation:ndHot 1.6s ease-in-out infinite}'+
 '@keyframes ndHot{0%,100%{box-shadow:0 0 0 0 #ff2d5500}50%{box-shadow:0 0 18px 2px #ff2d5588}}'+
 '#ntfDrawer{position:fixed;left:0;right:0;top:calc(var(--accH,0px) + 56px);z-index:700;max-height:0;overflow:hidden;'+
  'background:linear-gradient(180deg,#0d1420fb,#0a0f1af7);border-bottom:2px solid #ff2d55;'+
  'box-shadow:0 24px 60px #000d;transition:max-height .35s cubic-bezier(.2,.8,.2,1)}'+
 '#ntfDrawer.open{max-height:76vh;overflow:auto}'+
 '#ntfDrawer::-webkit-scrollbar{width:10px}#ntfDrawer::-webkit-scrollbar-track{background:#0a0f1a}'+
 '#ntfDrawer::-webkit-scrollbar-thumb{background:linear-gradient(#ff2d55,#38bdf8);border-radius:8px;border:2px solid #0a0f1a}'+
 '#ntfDrawer{scrollbar-width:thin;scrollbar-color:#ff2d55 #0a0f1a}'+
 '.nd-head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #25314a;position:sticky;top:0;background:#0d1420f7;z-index:2}'+
 '.nd-head b{font-size:15px;color:#e8eefc}'+
 '.nd-count{font:800 10px/1 system-ui;color:#04140c;background:#ff2d55;padding:5px 9px;border-radius:12px}'+
 '.nd-x{margin-left:auto;background:none;border:1px solid #334466;color:#8899b4;border-radius:9px;padding:5px 10px;cursor:pointer}'+
 '.nd-tools{display:flex;gap:7px;flex-wrap:wrap;padding:11px 16px;border-bottom:1px solid #1c2740}'+
 '.nd-tools button{padding:8px 11px;font-size:11.5px;font-weight:800;border-radius:10px;border:1px solid #334466;background:#0f1625;color:#c4cfe0;cursor:pointer}'+
 '.nd-tools button.pri{background:linear-gradient(135deg,#22c55e,#a3e635);border-color:#22c55e;color:#04140c}'+
 '.nd-sec{padding:12px 16px;border-bottom:1px solid #1c2740}'+
 '.nd-sec>b{display:block;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#ff9db0;margin-bottom:9px}'+
 '.nd-sec.empty,.nd-item.empty{font-size:12px;color:#5a6a84}'+
 '.nd-item{border:1px solid #25314a;border-left:3px solid #38bdf8;border-radius:11px;background:#0f1625;padding:10px 12px;margin-bottom:8px}'+
 '.nd-item.access{border-left-color:#ff2d55;background:#ff2d550d}'+
 '.nd-item.revoke{border-left-color:#f59e0b;display:flex;align-items:center;gap:9px;flex-wrap:wrap}'+
 '.nd-item.error{border-left-color:#ef4444}'+
 '.nd-item.granted{border-left-color:#22c55e}'+
 '.nd-item.read{opacity:.55}'+
 '.nd-i-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap}'+
 '.nd-i-h b{font-size:13px;color:#e8eefc}'+
 '.nd-t{font:600 10px/1 ui-monospace,monospace;color:#5a6a84}'+
 '.nd-dot{width:9px;height:9px;border-radius:50%;background:#ff2d55;box-shadow:0 0 10px #ff2d55;animation:ndP 1.2s infinite}'+
 '@keyframes ndP{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}'+
 '.nd-ic{font-size:15px}'+
 '.nd-item p{margin:6px 0 0;font-size:12px;color:#8899b4;line-height:1.5}'+
 '.nd-a{display:flex;gap:7px;margin-top:9px;flex-wrap:wrap}'+
 '.nd-a button{flex:1;min-width:110px;padding:11px 12px;font:900 12.5px/1 system-ui;letter-spacing:.4px;border-radius:10px;cursor:pointer;border:2px solid #334466;background:#04140c;color:#c4cfe0}'+
 '.nd-a button.ok{background:linear-gradient(135deg,#22c55e,#a3e635);border-color:#22c55e;color:#04140c}'+
 '.nd-a button.ko{border-color:#ef4444;color:#ff8f9d;background:#ef444412}'+
 '.nd-a.small button{flex:none;min-width:0;padding:6px 10px;font-size:10.5px;font-weight:700;border-width:1px}'+
 '.nd-item.revoke button{flex:none;min-width:0;margin-left:auto}';
 document.head.appendChild(s)}

/* ══════════ boot ══════════ */
function boot(){
 css();guard();scanReqs();paintBadge();paintTitle();
 setInterval(function(){scanReqs();paintBadge();paintTitle();if(DRAWER_OPEN)paintDrawer()},1500);
 /* demander la permission au premier geste utilisateur (politique Chrome) */
 var once=function(){if(perm()==='default'&&isAdmin())askPerm();
  document.removeEventListener('pointerdown',once)};
 document.addEventListener('pointerdown',once,{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFNotify={push:push,list:function(){return N},unread:unread,markAll:markAll,clearAll:clearAll,
 open:openDrawer,close:closeDrawer,native:native,perm:perm,ask:askPerm,paint:paintBadge};
})();
