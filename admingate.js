/* KEV FUSION 2026 — admingate.js v2.0.0  (réécriture IIFE : supprime le conflit global « AD »)
   Porte administrateur + console admin complète. Aucun identifiant global nu : tout est
   encapsulé et exposé explicitement sur window (adminLogin, renderAdmin, logoutAdmin…).
   Compatible avec le dispatcher d'app.js (data-act="adminLogin", vue « admin », #admBtn). */
(function(){
'use strict';
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},
 d:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function $(s,r){try{return (r||document).querySelector(s)}catch(e){return null}}
function $$(s,r){try{return Array.prototype.slice.call((r||document).querySelectorAll(s))}catch(e){return[]}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(m){try{if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3200)}catch(e){}}
async function sha(s){
 try{if(window.crypto&&crypto.subtle&&crypto.subtle.digest){
  var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}}catch(e){}
 var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
 return 'fnv'+(h>>>0).toString(16)}
function isAdmin(){try{return (typeof S!=='undefined'&&S.role==='admin')||LS.g('admDevice',false)===true}catch(e){return LS.g('admDevice',false)===true}}
function refHash(){try{if(typeof ADMIN_HASH!=='undefined'&&ADMIN_HASH)return ADMIN_HASH}catch(e){}
 return LS.g('admHash','')||LS.g('jrgHash','')||''}
function setAdmin(on){
 try{if(typeof S!=='undefined')S.role=on?'admin':null}catch(e){}
 LS.s('admDevice',!!on);
 var b=$('#admBtn');if(b)b.classList.toggle('on',!!on);
 var c=$('#roleChip');if(c){c.classList.toggle('hid',!on);c.textContent='🛡️ Admin'}}
/* ══════════ connexion ══════════ */
async function login(pw){
 pw=String(pw==null?'':pw);
 if(!pw){var f=$('#gPass')||$('#admPass');pw=f?f.value.trim():''}
 if(!pw){toast('Saisis le mot de passe administrateur');return false}
 var h=await sha(pw),ref=refHash();
 if(!ref){
  if(pw.length<6){toast('Choisis au moins 6 caractères');return false}
  LS.s('admHash',h);setAdmin(true);
  toast('🔐 Mot de passe administrateur défini');afterLogin();return true}
 if(h!==ref){toast('❌ Mot de passe incorrect');
  try{if(window.KFNotify)KFNotify.push({type:'error',level:'warn',title:'Connexion admin refusée',body:'Mot de passe incorrect.'})}catch(e){}
  return false}
 setAdmin(true);toast('🛡️ Connecté en administrateur');afterLogin();return true}
function afterLogin(){
 try{
  var gate=$('#gate'),app=$('#app');
  if(gate&&!gate.classList.contains('hid')){
   if(typeof window.enterApp==='function')window.enterApp();
   else{gate.classList.add('hid');if(app)app.classList.remove('hid')}}
 }catch(e){}
 try{if(typeof window.switchView==='function')window.switchView('admin')}catch(e){}
 try{if(window.KFAccess&&KFAccess.banner)KFAccess.banner()}catch(e){}
 try{if(window.KFNotify)KFNotify.paint()}catch(e){}
 render()}
function logout(){
 setAdmin(false);
 try{if(window.KFJrGate&&KFJrGate.lock)KFJrGate.lock('Déconnexion admin')}catch(e){}
 try{if(window.KFModGate&&KFModGate.lock)KFModGate.lock('Déconnexion admin')}catch(e){}
 toast('🔒 Déconnecté');
 try{if(typeof window.switchView==='function')window.switchView('accueil')}catch(e){}
 try{var g=$('#gate');if(g&&typeof window.KFAccess==='object'&&KFAccess.render){g.classList.remove('hid');
  var a=$('#app');if(a)a.classList.add('hid');KFAccess.render()}}catch(e){}}
/* ══════════ console admin ══════════ */
function render(){
 var v=$('#view');if(!v)return;
 if(!isAdmin()){
  v.innerHTML='<div class="card admpanel"><div class="admhead"><span class="admshield">🛡️</span>'+
   '<div><b>Espace administrateur</b><p class="mut">Connexion requise.</p></div></div>'+
   '<label for="admPass">Mot de passe</label>'+
   '<div class="pwrow"><input id="admPass" type="password" autocomplete="current-password" placeholder="Mot de passe admin">'+
   '<button type="button" class="eye" data-ag="mask">👁</button></div>'+
   '<div class="row"><button class="pri" data-ag="login">🔑 Connexion</button>'+
   '<button data-ag="home">🏠 Accueil</button></div>'+
   '<p class="mut" style="margin-top:10px">'+(refHash()?'Le mot de passe administrateur de l’application est requis.'
    :'Aucun mot de passe défini : le premier saisi (6 caractères minimum) devient la référence.')+'</p></div>';
  bind(v);return}
 var q=(window.KFQuota&&KFQuota.usage)?KFQuota.usage():0;
 var qp=Math.round(q/(5*1024*1024)*100);
 var tk=(LS.g('ghToken','')||'');
 var ct=LS.g('adminContact','');
 var ver=(document.querySelector('meta[name="kf-version"]')||{}).content||'—';
 var perms=(window.KFNotify&&KFNotify.perm)?KFNotify.perm():'unsupported';
 v.innerHTML=
 '<div class="card accent"><h1>🛡️ Console administrateur</h1>'+
 '<p class="mut">Accès tiers, notifications, stockage, diffusion et maintenance. Version '+esc(ver)+'.</p>'+
 '<div class="row" style="margin-top:10px">'+
  '<span class="badge b-mod">🛡️ Admin</span>'+
  '<span class="badge '+(tk?'b-mod':'b-elev')+'">'+(tk?'🔑 Jeton GitHub présent':'🔑 Jeton absent')+'</span>'+
  '<span class="badge '+(qp>85?'b-crit':'b-mod')+'">💾 Stockage '+qp+' %</span>'+
  '<span class="badge '+(perms==='granted'?'b-mod':'b-elev')+'">🔔 Système : '+esc(perms)+'</span>'+
 '</div></div>'+
 '<div class="card gold"><h2>👥 Demandes d’accès tiers</h2><div id="accAdmin"></div></div>'+
 '<div class="card"><h2>🔔 Notifications</h2>'+
  '<p class="mut">La cloche en haut ouvre le menu <b>Autoriser / Refuser / Révoquer</b>. '+
  'Les notifications système utilisent le Service Worker (Chrome, Edge, Firefox) avec repli automatique.</p>'+
  '<div class="row" style="margin-top:10px">'+
   '<button class="pri" data-ag="notifopen">🔔 Ouvrir le menu</button>'+
   '<button data-ag="notifperm">✅ Activer le système</button>'+
   '<button data-ag="notiftest">🧪 Tester</button>'+
   '<button data-ag="notifclear">🗑 Effacer le journal</button>'+
  '</div></div>'+
 '<div class="card"><h2>📡 Diffusion &amp; contact</h2>'+
  '<div class="grid g2">'+
   '<div><label>Jeton GitHub (publication access.json / fonds / bases)</label>'+
    '<input id="agToken" type="password" value="'+esc(tk)+'" placeholder="ghp_…"></div>'+
   '<div><label>Contact admin (téléphone ou e-mail, pour les demandes tiers)</label>'+
    '<input id="agContact" value="'+esc(ct)+'" placeholder="06… ou admin@exemple.fr"></div>'+
  '</div>'+
  '<div class="row"><button class="pri" data-ag="save">💾 Enregistrer</button>'+
   '<button data-ag="token">🔑 Assistant jeton</button>'+
   '<button data-ag="publish">📡 Publier access.json</button></div></div>'+
 '<div class="card"><h2>🧰 Maintenance</h2>'+
  '<div class="row">'+
   '<button data-ag="purge">🧹 Purger le stockage</button>'+
   '<button data-ag="boost">⚡ Optimiser (Turbo)</button>'+
   '<button data-ag="swupdate">⟳ Mettre à jour l’app</button>'+
   '<button data-ag="report">🧾 Rapport technique</button>'+
   '<button class="danger" data-ag="logout">🔒 Déconnexion</button>'+
  '</div>'+
  '<div id="agOut" class="mut" style="margin-top:10px"></div></div>';
 bind(v);
 try{if(window.KFAccess&&KFAccess.renderQueue)KFAccess.renderQueue()}catch(e){}
 try{if(window.KFAccess&&KFAccess.pull)KFAccess.pull().then(function(){if(window.KFAccess.renderQueue)KFAccess.renderQueue()})}catch(e){}}
function out(m){var e=$('#agOut');if(e)e.innerHTML=esc(m)}
function bind(root){
 if(!root||root._ag)return;root._ag=1;
 root.addEventListener('keydown',function(e){
  if(e.key==='Enter'&&e.target&&e.target.id==='admPass'){e.preventDefault();login()}});
 root.addEventListener('click',async function(e){
  var b=e.target.closest?e.target.closest('[data-ag]'):null;if(!b)return;
  var k=b.dataset.ag;
  if(k==='mask'){var i=$('#admPass');if(i){i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'👁':'🙈'}return}
  if(k==='login'){await login();return}
  if(k==='home'){try{if(typeof switchView==='function')switchView('accueil')}catch(x){}return}
  if(k==='logout'){logout();return}
  if(k==='save'){
   var t=$('#agToken'),c=$('#agContact');
   if(t)LS.s('ghToken',t.value.trim());
   if(c)LS.s('adminContact',c.value.trim());
   toast('💾 Enregistré');render();return}
  if(k==='token'){try{if(typeof window.openGhToken==='function')openGhToken();
   else window.open('https://github.com/settings/tokens/new?scopes=repo&description=KEV%20FUSION','_blank','noopener')}catch(x){}return}
  if(k==='publish'){try{if(window.KFAccess&&KFAccess.publish)KFAccess.publish()
   .then(function(){toast('📡 access.json publié')}).catch(function(er){toast('❌ '+er.message)})}catch(x){}return}
  if(k==='notifopen'){try{if(window.KFNotify)KFNotify.open()}catch(x){}return}
  if(k==='notifperm'){try{if(window.KFNotify)KFNotify.ask().then(function(){render()})}catch(x){}return}
  if(k==='notiftest'){try{if(window.KFNotify)KFNotify.push({type:'system',level:'ok',
   title:'Test de notification',body:'Chaîne complète : cloche, bannière, système, son.'})}catch(x){}return}
  if(k==='notifclear'){try{if(window.KFNotify)KFNotify.clearAll();toast('🗑 Journal effacé')}catch(x){}return}
  if(k==='purge'){try{if(window.KFQuota){var f=KFQuota.purge();toast('🧹 '+Math.round(f/1024)+' Ko libérés')}
   if(window.KFTurbo)KFTurbo.purge(true)}catch(x){}render();return}
  if(k==='boost'){try{if(window.KFTurbo)KFTurbo.optimize(true)}catch(x){}return}
  if(k==='swupdate'){
   try{if(navigator.serviceWorker){navigator.serviceWorker.getRegistration().then(function(r){
    if(r){r.update();if(r.waiting)r.waiting.postMessage({type:'SKIP_WAITING'});
     toast('⟳ Mise à jour demandée — rechargement…');setTimeout(function(){location.reload()},1200)}
    else location.reload()})}else location.reload()}catch(x){location.reload()}
   return}
  if(k==='report'){
   try{
    var data={ts:new Date().toISOString(),version:(document.querySelector('meta[name="kf-version"]')||{}).content,
     admin:isAdmin(),token:!!LS.g('ghToken',''),contact:LS.g('adminContact',''),
     quota:window.KFQuota?{usage:KFQuota.usage(),degraded:KFQuota.degraded()}:null,
     turbo:window.KFTurbo?KFTurbo.timers():null,
     notifications:window.KFNotify?KFNotify.list().slice(0,60):null,
     access:window.KFAccess?{pending:KFAccess.pending(),list:KFAccess.list()}:null,
     modules:window.KFBoot?{loaded:KFBoot.loaded,failed:KFBoot.failed}:null};
    var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    a.download='KEV-FUSION-rapport-'+new Date().toISOString().slice(0,10)+'.json';a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href)},6000);toast('🧾 Rapport exporté')}catch(x){}
   return}})}
/* ══════════ navigation / bouton ══════════ */
function hook(){
 try{
  if(typeof window.switchView==='function'&&!window.switchView.__ag){
   var _s=window.switchView;
   var w=function(v){
    if(v!=='admin')return _s(v);
    try{if(typeof S!=='undefined')S.view='admin'}catch(e){}
    var n=$('#nav');
    if(n&&typeof NAV!=='undefined'&&Array.isArray(NAV))n.innerHTML=NAV.map(function(x){
     return '<button data-act="nav" data-k="'+esc(x[0])+'" class="'+(x[0]==='admin'?'act':'')+'">'+esc(x[1])+'</button>'}).join('');
    render()};
   w.__ag=true;window.switchView=w}
 }catch(e){}}
function topBtn(){
 var b=$('#admBtn');if(!b||b._ag)return;b._ag=1;
 b.addEventListener('click',function(e){
  e.preventDefault();e.stopPropagation();
  try{if(typeof switchView==='function')switchView('admin');else render()}catch(x){}
 },true)}
function boot(){
 hook();topBtn();setAdmin(isAdmin());
 /* re-vérifie l'état visuel du bouton */
 setInterval(function(){var b=$('#admBtn');if(b)b.classList.toggle('on',isAdmin())},2000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
/* ══════════ API globale (compat dispatcher app.js) ══════════ */
window.adminLogin=function(){return login()};
window.doAdminLogin=function(){return login()};
window.logoutAdmin=logout;
window.adminOut=logout;
window.renderAdmin=render;
window.KFAdmin={login:login,logout:logout,render:render,isAdmin:isAdmin};
})();
