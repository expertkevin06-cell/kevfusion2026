/* KEV FUSION 2026 — admingate.js v4.6.0
   1) Suppression totale du module « New MRT Kevin » (base, config, stats, auto-vérif, vues).
   2) Accès admin : champ mot de passe EN CLAIR (aucun point, jamais pré-rempli), masquable à la demande,
      invisible pour les tiers, sauvegarde locale réservée à l'appareil admin, connexion fiable. */
(function(){
'use strict';
if(typeof sha256!=='function'||typeof ADMIN_HASH==='undefined'){console.warn('admingate.js: app.js non chargé');return}
const TAPS=5,TAPWIN=2500,HOLD=1200;
/* ---------- 1. purge New MRT ---------- */
function purgeMrt(){
 try{
  if(typeof MODULES!=='undefined'){
   for(let i=MODULES.length-1;i>=0;i--){const m=MODULES[i];
    if(m&&(m.k==='mrt'||/new\s*mrt/i.test(m.n||'')))MODULES.splice(i,1)}}
  if(typeof MODULE_FALLBACKS==='object'&&MODULE_FALLBACKS)delete MODULE_FALLBACKS.mrt;
  if(S.modStatus)delete S.modStatus.mrt;
  let changed=false;
  if(S.cfg&&S.cfg.moduleOff&&Object.prototype.hasOwnProperty.call(S.cfg.moduleOff,'mrt')){delete S.cfg.moduleOff.mrt;changed=true}
  if(S.cfg&&S.cfg.moduleUrls&&Object.prototype.hasOwnProperty.call(S.cfg.moduleUrls,'mrt')){delete S.cfg.moduleUrls.mrt;changed=true}
  if(changed)ls.set('cfg',S.cfg);
  const st=ls.get('upStats',{});if(st&&st.mrt){delete st.mrt;ls.set('upStats',st)}
  if(S.check&&S.check.results){const n=S.check.results.length;
   S.check.results=S.check.results.filter(function(r){return !/new\s*mrt/i.test(r.name||'')});
   if(S.check.results.length!==n&&typeof renderVerdict==='function')renderVerdict()}
 }catch(e){}
}
purgeMrt();
/* ---------- 2. coffre admin local ---------- */
function isAdmDevice(){return ls.get('admDevice',false)===true}
function hasVault(){return !!ls.get('admVault','')}
function salt(){let s=ls.get('admSalt','');if(!s){s=uid();ls.set('admSalt',s)}return s}
function enc(p){const k=salt();let o='';for(let i=0;i<p.length;i++)o+=String.fromCharCode(p.charCodeAt(i)^k.charCodeAt(i%k.length));return btoa(unescape(encodeURIComponent(o)))}
function dec(b){try{const s=decodeURIComponent(escape(atob(b)));const k=salt();let o='';for(let i=0;i<s.length;i++)o+=String.fromCharCode(s.charCodeAt(i)^k.charCodeAt(i%k.length));return o}catch(e){return''}}
function vaultRows(prefix){
 return '<div class="row vaultrow">'+
 '<label class="tg '+(hasVault()?'on':'')+'"><input type="checkbox" id="'+prefix+'Save" '+(hasVault()?'checked':'')+'> 💾 Sauvegarder sur cet appareil admin</label>'+
 (hasVault()?'<button class="pri" data-ag="quick">⚡ Connexion rapide</button><button class="danger" data-ag="forget">🗑️ Oublier</button>':'')+
 '</div>'}
function adminInner(prefix){
 return '<div class="admhead"><span class="admshield">🛡️</span><div><b>Espace administrateur</b>'+
 '<p class="mut">Privé · invisible pour les tiers · saisie en clair</p></div></div>'+
 '<label>Mot de passe admin (visible — aucun point par défaut)</label>'+
 '<div class="pwrow"><input id="'+prefix+'Pass" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" name="kf-adm-'+Math.random().toString(36).slice(2)+'" placeholder="Saisir le mot de passe admin" value="">'+
 '<button type="button" class="eye" data-ag="mask" data-k="'+prefix+'Pass" title="Masquer / afficher">🙈</button></div>'+
 vaultRows(prefix)+
 '<div class="row"><button class="pri" data-act="adminLogin">🔑 Connexion admin</button>'+
 '<button data-ag="hide">↩︎ Masquer</button>'+
 (isAdmDevice()?'<button class="danger" data-ag="unmark">🚫 Retirer cet appareil admin</button>':'')+'</div>'+
 '<p class="mut">Entrée = valider. Le mot de passe n\'est jamais affiché ni transmis côté tiers ; sauvegarde locale obfusquée.</p>'}
function rebuildGate(){
 const g=$('#gate');if(!g)return;
 g.innerHTML='<div class="card gatehead"><h1>🔑 Accès à KEV FUSION</h1>'+
 '<p class="mut">Application technique & juridique unifiée. Les tiers demandent l\'accès par prénom ; l\'administration est privée.</p></div>'+
 '<div class="grid g2">'+
 '<div class="card tierscard"><h2>👤 Accès tiers</h2><label>Ton prénom</label><input id="gPrenom" maxlength="24" placeholder="Thomas" autocomplete="off">'+
 '<div class="row"><button class="pri" data-act="reqAccess">📨 Demander l\'accès</button></div><div id="reqZone"></div>'+
 '<label>Code d\'accès reçu (KF1-…)</label><input id="gCode" placeholder="KF1-Prenom-20261231-xxxxxxxx" autocomplete="off">'+
 '<button data-act="valCode">🔓 Valider le code</button></div>'+
 '<div class="card admpanel '+(isAdmDevice()?'':'hid')+'" id="admBlock">'+adminInner('g')+'</div>'+
 '</div>';
 normalizePw(g)}
/* ---------- 3. normalisation : jamais de points, jamais pré-rempli ---------- */
function normalizePw(root){
 const scope=root||document;
 const list=scope.querySelectorAll?scope.querySelectorAll('#gPass,#mPass'):[];
 Array.prototype.forEach.call(list,function(i){
  if(i.dataset.kfInit==='1')return;
  i.dataset.kfInit='1';
  i.type='text';
  i.value='';
  i.setAttribute('autocomplete','off');
  i.setAttribute('autocapitalize','off');
  i.setAttribute('autocorrect','off');
  i.setAttribute('spellcheck','false');
  i.setAttribute('name','kf-adm-'+Math.random().toString(36).slice(2));
  i.placeholder='Saisir le mot de passe admin';
  i.addEventListener('input',function(){i.dataset.kfTouched='1'});
  i.addEventListener('focus',function(){if(i.dataset.kfTouched!=='1'&&i.value){i.value=''}i.type=i.dataset.kfMask==='1'?'password':'text'});
  i.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();window.doAdminLogin()}});
  if(!i.parentNode.querySelector('.eye')){
   const b=document.createElement('button');b.type='button';b.className='eye';b.textContent='🙈';
   b.setAttribute('data-ag','mask');b.setAttribute('data-k',i.id);i.parentNode.insertBefore(b,i.nextSibling)}
 })}
let rafId=0;
function tick(){cancelAnimationFrame(rafId);rafId=requestAnimationFrame(function(){purgeMrt();normalizePw(document)})}
/* ---------- 4. révélation discrète ---------- */
let taps=0,tapT=0,holdT=null;
function reveal(){
 let blk=$('#admBlock');
 if(!blk){const g=$('#gate');if(g){g.classList.remove('hid');rebuildGate()}blk=$('#admBlock')}
 if(!blk)return;
 blk.classList.remove('hid');blk.classList.add('pop');
 const inp=$('#gPass');if(inp){inp.value='';inp.type='text';inp.focus()}
 toast('🛡️ Espace admin révélé sur cet appareil')}
function bindGestures(){
 const logo=$('#brandTap');
 if(logo){
  logo.addEventListener('click',function(){const n=Date.now();if(n-tapT>TAPWIN)taps=0;tapT=n;taps++;if(taps>=TAPS){taps=0;reveal()}});
  logo.addEventListener('pointerdown',function(){holdT=setTimeout(reveal,HOLD)});
  ['pointerup','pointerleave','pointercancel'].forEach(function(ev){logo.addEventListener(ev,function(){clearTimeout(holdT)})})}
 document.addEventListener('keydown',function(e){if(e.ctrlKey&&e.shiftKey&&(e.key==='A'||e.key==='a')){e.preventDefault();reveal()}})}
/* ---------- 5. navigation ---------- */
function syncNav(){
 const i=NAV.findIndex(function(n){return n[0]==='admin'});
 const show=isAdmDevice()||S.role==='admin';
 if(show&&i<0)NAV.push(['admin','🔐 Admin']);
 if(!show&&i>=0)NAV.splice(i,1);
 const app=$('#app');
 if(app&&!app.classList.contains('hid')&&S.view&&typeof switchView==='function')switchView(S.view)}
/* ---------- 6. connexion ---------- */
async function succeed(pw,save){
 ls.set('admDevice',true);
 if(save)ls.set('admVault',enc(pw));
 S.role='admin';ls.set('session',{ts:Date.now()});
 const el=$('#gPass')||$('#mPass');if(el){el.value='';el.dataset.kfTouched=''}
 closeModal();syncNav();
 toast('🛡️ Admin connecté'+(save?' · mot de passe sauvegardé (appareil admin)':''));
 enterApp();switchView('admin')}
window.doAdminLogin=async function(){
 const el=$('#gPass')||$('#mPass');
 let pw=el?String(el.value||'').trim():'';
 if(!pw&&hasVault())pw=dec(ls.get('admVault',''));
 if(!pw){toast('Saisis le mot de passe admin');if(el)el.focus();return}
 if(await sha256(pw)===ADMIN_HASH){
  const save=!!((($('#gSave')&&$('#gSave').checked)||($('#mSave')&&$('#mSave').checked)));
  await succeed(pw,save);
 }else{toast('❌ Mot de passe incorrect');log('warn','admin échec');if(el){el.value='';el.focus()}}};
async function quick(){
 if(!hasVault()){toast('Aucun mot de passe sauvegardé');return}
 const pw=dec(ls.get('admVault',''));
 if(pw&&await sha256(pw)===ADMIN_HASH)await succeed(pw,true);
 else{ls.set('admVault','');toast('Coffre invalide — ressaisis le mot de passe');rebuildGate()}}
window.openAdminModal=function(){
 if(!isAdmDevice()&&S.role!=='admin'){toast('🔒 Espace administrateur privé');return}
 openModal('<div class="admpanel modaladm">'+adminInner('m')+'</div>');
 normalizePw($('#modalBox'));
 const i=$('#mPass');if(i){i.value='';i.type='text';i.focus()}};
/* ---------- 7. actions ---------- */
document.addEventListener('click',async function(e){
 const b=e.target.closest('[data-ag]');if(!b)return;
 const a=b.dataset.ag,k=b.dataset.k;
 if(a==='mask'){const i=$('#'+k);if(!i)return;
  const masked=i.type==='password';i.type=masked?'text':'password';i.dataset.kfMask=masked?'':'1';
  b.textContent=masked?'🙈':'👁';i.focus();return}
 if(a==='quick'){await quick();return}
 if(a==='forget'){ls.set('admVault','');toast('🗑️ Mot de passe oublié sur cet appareil');rebuildGate();
  if($('#modal')&&!$('#modal').classList.contains('hid'))window.openAdminModal();return}
 if(a==='hide'){const blk=$('#admBlock');if(blk)blk.classList.add('hid');closeModal();return}
 if(a==='unmark'){ls.set('admDevice',false);ls.set('admVault','');S.role=null;ls.set('session',null);
  syncNav();rebuildGate();closeModal();toast('🚫 Appareil retiré · espace admin masqué');return}});
/* ---------- init ---------- */
function boot(){purgeMrt();rebuildGate();bindGestures();syncNav();normalizePw(document);
 new MutationObserver(tick).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFAdminGate={reveal:reveal,syncNav:syncNav,isAdmDevice:isAdmDevice,hasVault:hasVault,purgeMrt:purgeMrt};
})();
