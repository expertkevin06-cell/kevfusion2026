/* KEV FUSION 2026 — admingate.js v5.0.0
   Correctif bloquant : le champ mot de passe admin est désormais créé et garanti dans un panneau
   autonome (aucun MutationObserver, aucun re-render pendant la saisie, aucun conflit avec app.js).
   Saisie visible (aucun point), masquable, sauvegarde locale admin, connexion fiable en APK. */
(function(){
'use strict';
if(typeof sha256!=='function'||typeof ADMIN_HASH==='undefined'){console.warn('admingate.js: app.js non chargé');return}

/* ---------- purge « New MRT Kevin » (une seule fois, sans boucle) ---------- */
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
 }catch(e){}}
purgeMrt();

/* ---------- coffre local ---------- */
function isAdmDevice(){return ls.get('admDevice',false)===true}
function hasVault(){return !!ls.get('admVault','')}
function salt(){let s=ls.get('admSalt','');if(!s){s=uid();ls.set('admSalt',s)}return s}
function enc(p){const k=salt();let o='';for(let i=0;i<p.length;i++)o+=String.fromCharCode(p.charCodeAt(i)^k.charCodeAt(i%k.length));return btoa(unescape(encodeURIComponent(o)))}
function dec(b){try{const s=decodeURIComponent(escape(atob(b)));const k=salt();let o='';for(let i=0;i<s.length;i++)o+=String.fromCharCode(s.charCodeAt(i)^k.charCodeAt(i%k.length));return o}catch(e){return''}}

/* ---------- panneau admin autonome (hors #view, hors #modalBox) ---------- */
let panel=null,input=null,saveBox=null,masked=false,busy=false;
function buildPanel(){
 if(panel)return panel;
 panel=document.createElement('div');
 panel.id='kfAdm';
 panel.setAttribute('role','dialog');
 panel.setAttribute('aria-modal','true');
 panel.style.cssText='position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(4,8,16,.82);backdrop-filter:blur(6px)';
 panel.innerHTML=
 '<div id="kfAdmCard" style="width:100%;max-width:460px;max-height:92vh;overflow:auto;border:1px solid #ff7a1a;border-radius:18px;padding:18px;background:linear-gradient(160deg,#1a1408,#121a2b 62%);box-shadow:0 24px 70px #000c,0 0 0 1px #ff7a1a44">'+
  '<div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">'+
   '<span style="width:42px;height:42px;flex:none;display:grid;place-items:center;border-radius:12px;background:conic-gradient(from 200deg,#ff7a1a,#ffd166,#38bdf8,#ff7a1a);color:#160b00;font-size:21px;box-shadow:0 0 20px #ff7a1a77">🛡️</span>'+
   '<div><b style="font-size:17px;color:#e8eefc">Connexion administrateur</b>'+
   '<div style="font-size:12px;color:#93a4c3">Saisie visible · aucun point par défaut</div></div>'+
   '<button id="kfAdmClose" type="button" aria-label="Fermer" style="margin-left:auto;background:#0d1526;border:1px solid #22304a;color:#e8eefc;border-radius:10px;padding:6px 11px;font-size:15px;cursor:pointer">✕</button>'+
  '</div>'+
  '<label for="kfAdmPass" style="display:block;font-size:13px;color:#93a4c3;margin-bottom:6px">Mot de passe admin</label>'+
  '<div style="display:flex;gap:8px;align-items:stretch">'+
   '<input id="kfAdmPass" type="text" inputmode="text" enterkeyhint="go" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" name="kf-adm-field" placeholder="Saisir le mot de passe admin" '+
    'style="flex:1;min-width:0;background:#0d1526;border:2px solid #38bdf8;color:#e8eefc;border-radius:12px;padding:13px 14px;font:16px/1.2 ui-monospace,monospace;letter-spacing:.5px;outline:none">'+
   '<button id="kfAdmEye" type="button" title="Masquer / afficher" style="flex:none;background:#0d1526;border:1px solid #22304a;color:#e8eefc;border-radius:12px;padding:0 14px;font-size:17px;cursor:pointer">🙈</button>'+
  '</div>'+
  '<div id="kfAdmErr" style="display:none;margin-top:8px;font-size:13px;color:#ef4444"></div>'+
  '<label style="display:flex;gap:8px;align-items:center;margin:12px 0;font-size:12px;color:#93a4c3;background:#0d1526;border:1px solid #22304a;border-radius:20px;padding:8px 12px;cursor:pointer">'+
   '<input id="kfAdmSave" type="checkbox" style="width:auto;margin:0;accent-color:#ff7a1a"> 💾 Sauvegarder sur cet appareil admin</label>'+
  '<div id="kfAdmVault" style="display:none;gap:8px;flex-wrap:wrap;margin-bottom:12px">'+
   '<button id="kfAdmQuick" type="button" style="background:linear-gradient(90deg,#ff7a1a,#ff9500);border:1px solid #ff7a1a;color:#160b00;font-weight:700;border-radius:11px;padding:10px 14px;cursor:pointer">⚡ Connexion rapide</button>'+
   '<button id="kfAdmForget" type="button" style="background:#0d1526;border:1px solid #ef4444;color:#ef4444;border-radius:11px;padding:10px 14px;cursor:pointer">🗑️ Oublier</button>'+
  '</div>'+
  '<button id="kfAdmGo" type="button" style="width:100%;padding:14px;font-size:16px;font-weight:800;border-radius:12px;border:1px solid #ff7a1a;background:linear-gradient(90deg,#ff7a1a,#ff9500);color:#160b00;cursor:pointer;box-shadow:0 10px 26px #ff7a1a44">🔑 Se connecter en admin</button>'+
  '<div id="kfAdmLogged" style="display:none;gap:8px;flex-wrap:wrap;margin-top:12px">'+
   '<button id="kfAdmMenu" type="button" style="flex:1;background:#1f6f54;border:1px solid #1f6f54;color:#fff;font-weight:700;border-radius:11px;padding:11px 14px;cursor:pointer">🔐 Menu admin</button>'+
   '<button id="kfAdmOut" type="button" style="background:#0d1526;border:1px solid #ef4444;color:#ef4444;border-radius:11px;padding:11px 14px;cursor:pointer">🚪 Déconnexion</button>'+
  '</div>'+
  '<p style="margin:12px 0 0;font-size:11px;color:#6d8469">Entrée = valider. Le mot de passe n\'est jamais affiché côté tiers ; la sauvegarde reste locale à cet appareil.</p>'+
 '</div>';
 document.body.appendChild(panel);
 input=panel.querySelector('#kfAdmPass');
 saveBox=panel.querySelector('#kfAdmSave');

 panel.addEventListener('click',function(e){if(e.target===panel)close()});
 panel.querySelector('#kfAdmClose').addEventListener('click',close);
 panel.querySelector('#kfAdmEye').addEventListener('click',function(){
  masked=!masked;input.type=masked?'password':'text';this.textContent=masked?'👁':'🙈';input.focus()});
 panel.querySelector('#kfAdmGo').addEventListener('click',submit);
 input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();submit()}});
 input.addEventListener('input',function(){err('')});
 panel.querySelector('#kfAdmQuick').addEventListener('click',async function(){
  const pw=dec(ls.get('admVault',''));
  if(pw&&await sha256(pw)===ADMIN_HASH)await succeed(pw,true);
  else{ls.set('admVault','');err('Coffre invalide — ressaisis le mot de passe.');refreshVault();input.focus()}});
 panel.querySelector('#kfAdmForget').addEventListener('click',function(){
  ls.set('admVault','');refreshVault();err('');toast('🗑️ Mot de passe oublié sur cet appareil');input.focus()});
 panel.querySelector('#kfAdmMenu').addEventListener('click',function(){close();syncNav();switchView('admin')});
 panel.querySelector('#kfAdmOut').addEventListener('click',function(){
  S.role=null;ls.set('session',null);close();syncNav();toast('🚪 Déconnecté de l\'admin');switchView('home')});
 document.addEventListener('keydown',function(e){
  if(panel.style.display==='none')return;
  if(e.key==='Escape')close();
  if(e.key==='Tab'){
   const f=panel.querySelectorAll('button,input');const list=Array.prototype.filter.call(f,function(x){return x.offsetParent!==null});
   if(!list.length)return;const first=list[0],last=list[list.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 return panel}
function err(m){const e=panel&&panel.querySelector('#kfAdmErr');if(!e)return;
 e.textContent=m||'';e.style.display=m?'block':'none'}
function refreshVault(){if(!panel)return;
 const v=hasVault();panel.querySelector('#kfAdmVault').style.display=v?'flex':'none';saveBox.checked=v}
function open(){
 buildPanel();refreshVault();err('');
 const logged=S.role==='admin';
 panel.querySelector('#kfAdmLogged').style.display=logged?'flex':'none';
 panel.querySelector('#kfAdmGo').style.display=logged?'none':'block';
 masked=false;input.type='text';input.value='';
 panel.querySelector('#kfAdmEye').textContent='🙈';
 panel.style.display='flex';
 document.documentElement.style.overflow='hidden';
 setTimeout(function(){if(!logged){input.focus();input.select()}},80)}
function close(){if(!panel)return;panel.style.display='none';document.documentElement.style.overflow='';err('')}
window.openAdminModal=open;
window.KFAdminOpen=open;

/* ---------- connexion ---------- */
function syncNav(){
 const i=NAV.findIndex(function(n){return n[0]==='admin'});
 const show=isAdmDevice()||S.role==='admin';
 if(show&&i<0)NAV.push(['admin','🔐 Admin']);
 if(!show&&i>=0)NAV.splice(i,1);
 const app=$('#app');
 if(app&&!app.classList.contains('hid')&&S.view==='admin'&&typeof switchView==='function')switchView('admin')}
async function succeed(pw,save){
 ls.set('admDevice',true);
 if(save)ls.set('admVault',enc(pw));else if(!hasVault())ls.set('admVault','');
 S.role='admin';ls.set('session',{ts:Date.now()});
 input.value='';close();
 const btn=$('#admBtn');if(btn)btn.classList.add('on');
 syncNav();
 const app=$('#app');
 if(app&&app.classList.contains('hid'))enterApp();
 switchView('admin');
 toast('🛡️ Admin connecté'+(save?' · mot de passe sauvegardé':''))}
async function submit(){
 if(busy)return;
 let pw=String(input.value||'').trim();
 if(!pw&&hasVault())pw=dec(ls.get('admVault',''));
 if(!pw){err('Saisis le mot de passe admin.');input.focus();return}
 busy=true;
 const go=panel.querySelector('#kfAdmGo');const old=go.textContent;go.textContent='⏳ Vérification…';go.disabled=true;
 let ok=false;
 try{ok=(await sha256(pw))===ADMIN_HASH}catch(e){ok=false}
 go.textContent=old;go.disabled=false;busy=false;
 if(ok){await succeed(pw,!!saveBox.checked)}
 else{err('❌ Mot de passe incorrect.');log('warn','admin échec');input.value='';input.focus()}}
window.doAdminLogin=submit;

/* ---------- points d'entrée ---------- */
function bindEntry(){
 const btn=$('#admBtn');
 if(btn&&!btn.dataset.kfBound){btn.dataset.kfBound='1';
  btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open()});
  btn.classList.toggle('on',S.role==='admin')}
 const logo=$('#brandTap');
 if(logo&&!logo.dataset.kfBound){logo.dataset.kfBound='1';
  let taps=0,t=0,hold=null;
  logo.addEventListener('click',function(){const n=Date.now();if(n-t>2500)taps=0;t=n;taps++;if(taps>=5){taps=0;open()}});
  logo.addEventListener('pointerdown',function(){hold=setTimeout(open,1100)});
  ['pointerup','pointerleave','pointercancel'].forEach(function(ev){logo.addEventListener(ev,function(){clearTimeout(hold)})})}
 document.addEventListener('keydown',function(e){
  if(e.ctrlKey&&e.shiftKey&&(e.key==='A'||e.key==='a')){e.preventDefault();open()}})}
/* bouton de secours flottant : garantit l'accès même si la barre est masquée */
function fallbackButton(){
 if($('#kfAdmFab'))return;
 const b=document.createElement('button');
 b.id='kfAdmFab';b.type='button';b.title='Connexion administrateur';b.textContent='🛡️';
 b.style.cssText='position:fixed;right:14px;bottom:74px;z-index:900;width:52px;height:52px;border-radius:16px;border:1px solid #ff7a1a;background:linear-gradient(140deg,#1a1408,#2a1c08);color:#ff7a1a;font-size:22px;cursor:pointer;box-shadow:0 10px 28px #000a,0 0 0 1px #ff7a1a44;display:grid;place-items:center';
 b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open()});
 document.body.appendChild(b)}
/* ---------- init ---------- */
function boot(){
 purgeMrt();bindEntry();fallbackButton();buildPanel();syncNav();
 if(typeof rebuildGate==='function')rebuildGate();
 const g=$('#gate');
 if(g&&!g.dataset.kfAdm){g.dataset.kfAdm='1';
  const card=document.createElement('div');card.className='card admpanel';
  card.innerHTML='<div class="admhead"><span class="admshield">🛡️</span><div><b>Administrateur</b><p class="mut">Connexion par mot de passe</p></div></div><button class="pri" type="button" id="kfGateAdm">🔑 Ouvrir la connexion admin</button><p class="mut">Le mot de passe et sa sauvegarde ne sont jamais visibles pour les tiers.</p>';
  g.appendChild(card);
  card.querySelector('#kfGateAdm').addEventListener('click',open)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFAdminGate={open:open,close:close,syncNav:syncNav,isAdmDevice:isAdmDevice,hasVault:hasVault,purgeMrt:purgeMrt};
})();
