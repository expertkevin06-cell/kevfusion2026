/* KEV FUSION 2026 — admingate.js v4.7.0
   Accès admin TOUJOURS reachable (bouton 🛡️ en barre supérieure + gestes), mot de passe en clair
   (aucun point, jamais pré-rempli), masquable, sauvegardable sur l'appareil admin, connexion fiable en APK.
   Purge totale du module « New MRT Kevin ». */
(function(){
'use strict';
if(typeof sha256!=='function'||typeof ADMIN_HASH==='undefined'){console.warn('admingate.js: app.js non chargé');return}
const TAPS=5,TAPWIN=2500,HOLD=1100;
/* ---------- purge New MRT ---------- */
function purgeMrt(){
 try{
  if(typeof MODULES!=='undefined'){
   for(let i=MODULES.length-1;i>=0;i--){const m=MODULES[i];
    if(m&&(m.k==='mrt'||/new\s*mrt/i.test(m.n||'')))MODULES.splice(i,1)}}
  if(typeof MODULE_FALLBACKS==='object'&&MODULE_FALLBACKS)delete MODULE_FALLBACKS.mrt;
  if(S.modStatus)delete S.modStatus.mrt;
  let ch=false;
  if(S.cfg&&S.cfg.moduleOff&&Object.prototype.hasOwnProperty.call(S.cfg.moduleOff,'mrt')){delete S.cfg.moduleOff.mrt;ch=true}
  if(S.cfg&&S.cfg.moduleUrls&&Object.prototype.hasOwnProperty.call(S.cfg.moduleUrls,'mrt')){delete S.cfg.moduleUrls.mrt;ch=true}
  if(ch)ls.set('cfg',S.cfg);
  const st=ls.get('upStats',{});if(st&&st.mrt){delete st.mrt;ls.set('upStats',st)}
  if(S.check&&S.check.results){const n=S.check.results.length;
   S.check.results=S.check.results.filter(function(r){return !/new\s*mrt/i.test(r.name||'')});
   if(S.check.results.length!==n&&typeof renderVerdict==='function')renderVerdict()}
 }catch(e){}}
purgeMrt();
/* ---------- coffre local admin ---------- */
function isAdmDevice(){return ls.get('admDevice',false)===true}
function hasVault(){return !!ls.get('admVault','')}
function salt(){let s=ls.get('admSalt','');if(!s){s=uid();ls.set('admSalt',s)}return s}
function enc(p){const k=salt();let o='';for(let i=0;i<p.length;i++)o+=String.fromCharCode(p.charCodeAt(i)^k.charCodeAt(i%k.length));return btoa(unescape(encodeURIComponent(o)))}
function dec(b){try{const s=decodeURIComponent(escape(atob(b)));const k=salt();let o='';for(let i=0;i<s.length;i++)o+=String.fromCharCode(s.charCodeAt(i)^k.charCodeAt(i%k.length));return o}catch(e){return''}}
/* ---------- UI ---------- */
function loginInner(prefix){
 const logged=S.role==='admin';
 return '<div class="admhead"><span class="admshield">🛡️</span><div><b>'+(logged?'Session administrateur active':'Connexion administrateur')+'</b>'+
 '<p class="mut">Mot de passe requis · saisie visible · aucun point par défaut</p></div></div>'+
 (logged?'<p class="mut">Tu es déjà connecté en admin sur cet appareil.</p>'+
  '<div class="row"><button class="pri" data-ag="goAdmin">🔐 Ouvrir le menu admin</button>'+
  '<button class="danger" data-ag="logout">🚪 Déconnexion</button>'+
  '<button data-act="closeModal">Fermer</button></div>'
 :
 '<label>Mot de passe admin</label>'+
 '<div class="pwrow"><input id="'+prefix+'Pass" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" name="kf-adm-'+Math.random().toString(36).slice(2)+'" placeholder="Saisir le mot de passe admin" value="">'+
 '<button type="button" class="eye" data-ag="mask" data-k="'+prefix+'Pass" title="Masquer / afficher">🙈</button></div>'+
 '<div class="row vaultrow"><label class="tg '+(hasVault()?'on':'')+'"><input type="checkbox" id="'+prefix+'Save" '+(hasVault()?'checked':'')+'> 💾 Sauvegarder sur cet appareil admin</label>'+
 (hasVault()?'<button class="pri" data-ag="quick">⚡ Connexion rapide</button><button class="danger" data-ag="forget">🗑️ Oublier</button>':'')+'</div>'+
 '<div class="row"><button class="pri" data-act="adminLogin">🔑 Se connecter en admin</button><button data-act="closeModal">Annuler</button></div>'+
 '<p class="mut">Entrée = valider. Le mot de passe n\'est jamais affiché côté tiers ; la sauvegarde reste locale à cet appareil.</p>')}
function rebuildGate(){
 const g=$('#gate');if(!g)return;
 g.innerHTML='<div class="card gatehead"><h1>🔑 Accès à KEV FUSION</h1>'+
 '<p class="mut">Application technique & juridique unifiée. Les tiers demandent l\'accès par prénom ; l\'administration se fait par mot de passe.</p></div>'+
 '<div class="grid g2">'+
 '<div class="card tierscard"><h2>👤 Accès tiers</h2><label>Ton prénom</label><input id="gPrenom" maxlength="24" placeholder="Thomas" autocomplete="off">'+
 '<div class="row"><button class="pri" data-act="reqAccess">📨 Demander l\'accès</button></div><div id="reqZone"></div>'+
 '<label>Code d\'accès reçu (KF1-…)</label><input id="gCode" placeholder="KF1-Prenom-20261231-xxxxxxxx" autocomplete="off">'+
 '<button data-act="valCode">🔓 Valider le code</button></div>'+
 '<div class="card admpanel"><div class="admhead"><span class="admshield">🛡️</span><div><b>Administrateur</b><p class="mut">Connexion par mot de passe</p></div></div>'+
 '<button class="pri" data-ag="open">🔑 Ouvrir la connexion admin</button>'+
 '<p class="mut">Le mot de passe et sa sauvegarde ne sont jamais visibles pour les tiers.</p></div>'+
 '</div>'}
/* ---------- normalisation : jamais de points ---------- */
function normalizePw(root){
 const scope=root||document;if(!scope.querySelectorAll)return;
 Array.prototype.forEach.call(scope.querySelectorAll('#gPass,#mPass'),function(i){
  if(i.dataset.kfInit==='1')return;
  i.dataset.kfInit='1';i.type='text';i.value='';
  i.setAttribute('autocomplete','off');i.setAttribute('autocapitalize','off');
  i.setAttribute('autocorrect','off');i.setAttribute('spellcheck','false');
  i.setAttribute('name','kf-adm-'+Math.random().toString(36).slice(2));
  i.placeholder='Saisir le mot de passe admin';
  i.addEventListener('input',function(){i.dataset.kfTouched='1'});
  i.addEventListener('focus',function(){if(i.dataset.kfTouched!=='1'&&i.value)i.value='';i.type=i.dataset.kfMask==='1'?'password':'text'});
  i.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();window.doAdminLogin()}})})}
let rafId=0;
function tick(){cancelAnimationFrame(rafId);rafId=requestAnimationFrame(function(){purgeMrt();normalizePw(document)})}
/* ---------- ouverture / connexion ---------- */
function openLogin(){
 openModal('<div class="admpanel modaladm">'+loginInner('m')+'</div>');
 normalizePw($('#modalBox'));
 const i=$('#mPass');if(i){i.value='';i.type='text';setTimeout(function(){i.focus()},60)}}
window.openAdminModal=openLogin;
function syncNav(){
 const i=NAV.findIndex(function(n){return n[0]==='admin'});
 const show=isAdmDevice()||S.role==='admin';
 if(show&&i<0)NAV.push(['admin','🔐 Admin']);
 if(!show&&i>=0)NAV.splice(i,1);
 const app=$('#app');
 if(app&&!app.classList.contains('hid')&&S.view&&typeof switchView==='function')switchView(S.view)}
function afterLogin(){
 closeModal();syncNav();
 const app=$('#app');
 if(app&&app.classList.contains('hid'))enterApp();
 switchView('admin')}
async function succeed(pw,save){
 ls.set('admDevice',true);
 if(save)ls.set('admVault',enc(pw));
 S.role='admin';ls.set('session',{ts:Date.now()});
 const el=$('#gPass')||$('#mPass');if(el){el.value='';el.dataset.kfTouched=''}
 toast('🛡️ Admin connecté'+(save?' · mot de passe sauvegardé':''));
 afterLogin()}
window.doAdminLogin=async function(){
 const el=$('#mPass')||$('#gPass');
 let pw=el?String(el.value||'').trim():'';
 if(!pw&&hasVault())pw=dec(ls.get('admVault',''));
 if(!pw){toast('Saisis le mot de passe admin');if(el)el.focus();return}
 if(await sha256(pw)===ADMIN_HASH){
  const save=!!((($('#mSave')&&$('#mSave').checked)||($('#gSave')&&$('#gSave').checked)));
  await succeed(pw,save);
 }else{toast('❌ Mot de passe incorrect');log('warn','admin échec');if(el){el.value='';el.focus()}}};
async function quick(){
 if(!hasVault()){toast('Aucun mot de passe sauvegardé');return}
 const pw=dec(ls.get('admVault',''));
 if(pw&&await sha256(pw)===ADMIN_HASH)await succeed(pw,true);
 else{ls.set('admVault','');toast('Coffre invalide — ressaisis le mot de passe');openLogin()}}
/* ---------- gestes (bonus) ---------- */
let taps=0,tapT=0,holdT=null;
function bindGestures(){
 const logo=$('#brandTap');
 if(logo){
  logo.addEventListener('click',function(){const n=Date.now();if(n-tapT>TAPWIN)taps=0;tapT=n;taps++;if(taps>=TAPS){taps=0;openLogin()}});
  logo.addEventListener('pointerdown',function(){holdT=setTimeout(openLogin,HOLD)});
  ['pointerup','pointerleave','pointercancel'].forEach(function(ev){logo.addEventListener(ev,function(){clearTimeout(holdT)})})}
 document.addEventListener('keydown',function(e){if(e.ctrlKey&&e.shiftKey&&(e.key==='A'||e.key==='a')){e.preventDefault();openLogin()}})}
/* ---------- actions ---------- */
document.addEventListener('click',async function(e){
 const b=e.target.closest('[data-ag]');if(!b)return;
 const a=b.dataset.ag,k=b.dataset.k;
 if(a==='open'){openLogin();return}
 if(a==='goAdmin'){closeModal();syncNav();switchView('admin');return}
 if(a==='logout'){S.role=null;ls.set('session',null);closeModal();syncNav();toast('🚪 Déconnecté de l\'admin');switchView('home');return}
 if(a==='mask'){const i=$('#'+k);if(!i)return;
  const masked=i.type==='password';i.type=masked?'text':'password';i.dataset.kfMask=masked?'':'1';
  b.textContent=masked?'🙈':'👁';i.focus();return}
 if(a==='quick'){await quick();return}
 if(a==='forget'){ls.set('admVault','');toast('🗑️ Mot de passe oublié sur cet appareil');openLogin();return}
 if(a==='unmark'){ls.set('admDevice',false);ls.set('admVault','');S.role=null;ls.set('session',null);
  syncNav();closeModal();toast('🚫 Appareil retiré · admin masqué');return}});
/* ---------- init ---------- */
function boot(){
 purgeMrt();rebuildGate();bindGestures();syncNav();normalizePw(document);
 const btn=$('#admBtn');
 if(btn){btn.classList.toggle('on',S.role==='admin');
  btn.addEventListener('click',function(){openLogin()})}
 new MutationObserver(function(){tick();
  const b2=$('#admBtn');if(b2)b2.classList.toggle('on',S.role==='admin')}).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFAdminGate={openLogin:openLogin,syncNav:syncNav,isAdmDevice:isAdmDevice,hasVault:hasVault,purgeMrt:purgeMrt};
})();
