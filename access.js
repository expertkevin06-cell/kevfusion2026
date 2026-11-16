/* KEV FUSION 2026 — access.js v7.0.0
   Écran d'accueil : choix Admin / Tiers.
   Tiers : demande par prénom → notification admin → admin approuve/refuse/révoque en temps réel.
   Admin : mot de passe Kevin83600 (champ clair, sauvegarde locale). */
(function(){
'use strict';
if(typeof sha256!=='function'||typeof ADMIN_HASH==='undefined'){console.warn('access.js: app.js non chargé');return}
const PEPPER='6eb2cb140545f6f0ea5073e0d9edec82';
const TAPS=5,TAPWIN=2500,HOLD=1100;
/* ---------- coffre admin ---------- */
function isAdmDevice(){return ls.get('admDevice',false)===true}
function hasVault(){return !!ls.get('admVault','')}
function salt(){let s=ls.get('admSalt','');if(!s){s=uid();ls.set('admSalt',s)}return s}
function enc(p){const k=salt();let o='';for(let i=0;i<p.length;i++)o+=String.fromCharCode(p.charCodeAt(i)^k.charCodeAt(i%k.length));return btoa(unescape(encodeURIComponent(o)))}
function dec(b){try{const s=decodeURIComponent(escape(atob(b)));const k=salt();let o='';for(let i=0;i<s.length;i++)o+=String.fromCharCode(s.charCodeAt(i)^k.charCodeAt(i%k.length));return o}catch(e){return''}}
/* ---------- codes tiers ---------- */
async function sigFor(prenom,exp){return (await sha256(PEPPER+'|'+prenom.toLowerCase()+'|'+exp)).slice(0,8)}
async function makeCode(prenom,days){const d=new Date(Date.now()+days*864e5);const exp=d.toISOString().slice(0,10).replace(/-/g,'');const sig=await sigFor(prenom,exp);return{code:`KF1-${prenom}-${exp}-${sig}`,prenom,exp,sig}}
async function validAccess(a){if(!a||!a.prenom||!a.exp||!a.sig)return false;if(a.exp<today8())return false;if(S.cfg.revoked&&S.cfg.revoked[a.sig])return false;return (await sigFor(a.prenom,a.exp))===a.sig}
function today8(){return new Date().toISOString().slice(0,10).replace(/-/g,'')}
/* ---------- demandes ---------- */
function getRequests(){return ls.get('requests',[])}
function saveRequests(arr){ls.set('requests',arr)}
async function doRequest(){
 const prenom=$('#gPrenom')?$('#gPrenom').value.trim().replace(/[^A-Za-zÀ-ÿ0-9 -]/g,'').slice(0,24):'';
 if(!prenom){toast('Indique ton prénom');return}
 const reqs=getRequests();
 const existing=reqs.find(r=>r.prenom.toLowerCase()===prenom.toLowerCase()&&r.status==='pending');
 if(existing){toast('📨 Demande déjà envoyée — en attente');return}
 const req={id:uid(),prenom:prenom,ts:Date.now(),status:'pending',deviceId:uid()};
 reqs.unshift(req);saveRequests(reqs);
 /* notification admin si cloud */
 if(S.db&&S.adminCloud){try{await S.db.ref('requests/'+req.id).set(req);notify('📨 Demande d\'accès',prenom+' demande l\'accès à KEV FUSION')}catch(e){}}
 $('#reqZone').innerHTML='<div class="card jr"><p>📨 Demande envoyée à l\'administrateur.</p><p class="mut">Tu recevras un code KF1-… par notification dès validation.</p><p class="dim">Réf : '+esc(req.id.slice(0,8))+'</p></div>';
 toast('📨 Demande envoyée')}
async function doValCode(){
 const raw=$('#gCode')?$('#gCode').value.trim():'';const p=raw.split('-');
 if(p.length!==4||p[0]!=='KF1'){toast('Format KF1-Prenom-AAAAMMJJ-xxxxxxxx');return}
 const a={prenom:p[1],exp:p[2],sig:p[3]};
 if(await validAccess(a)){S.access=a;ls.set('access',a);S.prenom=a.prenom;toast('🔓 Bienvenue '+a.prenom);enterApp()}
 else toast('❌ Code invalide/expiré/révoqué')}
/* ---------- login admin ---------- */
async function doAdminLogin(){
 const el=$('#gPass')||$('#mPass');
 let pw=el?String(el.value||'').trim():'';
 if(!pw&&hasVault())pw=dec(ls.get('admVault',''));
 if(!pw){toast('Saisis le mot de passe admin');if(el)el.focus();return}
 if(await sha256(pw)===ADMIN_HASH){
  const save=!!((($('#gSave')&&$('#gSave').checked)||($('#mSave')&&$('#mSave').checked)));
  ls.set('admDevice',true);if(save)ls.set('admVault',enc(pw));
  S.role='admin';ls.set('session',{ts:Date.now()});
  if(el){el.value=''}
  closeModal();syncNav();
  const app=$('#app');if(app&&app.classList.contains('hid'))enterApp();
  switchView('admin');
  toast('🛡️ Admin connecté'+(save?' · mot de passe sauvegardé':''))}
 else{toast('❌ Mot de passe incorrect');log('warn','admin échec');if(el){el.value='';el.focus()}}}
/* ---------- UI écran d'accueil ---------- */
function renderGate(){
 const g=$('#gate');if(!g)return;
 g.innerHTML='<div class="card gatehead"><h1>🔑 Bienvenue sur KEV FUSION 2026</h1>'+
 '<p class="mut">Application technique & juridique unifiée pour experts automobiles et avocats.<br>Choisis ton mode d\'accès.</p></div>'+
 '<div class="access-choice">'+
 '<div class="access-card tier" data-gate="tier"><div class="icon">👤</div><h3>Accès Tiers</h3><p>Demande d\'accès par prénom.<br>Reçois un code KF1-… après validation admin.</p></div>'+
 '<div class="access-card admin" data-gate="admin"><div class="icon">🛡️</div><h3>Administrateur</h3><p>Connexion par mot de passe.<br>Gestion complète de l\'application.</p></div>'+
 '</div><div id="gateBody" style="margin-top:16px"></div>'}
function handleGateChoice(type){
 const body=$('#gateBody');if(!body)return;
 if(type==='tier'){
  body.innerHTML='<div class="card tierscard"><h2>👤 Demande d\'accès tiers</h2>'+
  '<label>Ton prénom</label><input id="gPrenom" maxlength="24" placeholder="Thomas" autocomplete="off">'+
  '<button class="pri" data-act="reqAccess">📨 Envoyer la demande</button>'+
  '<div id="reqZone" style="margin-top:12px"></div>'+
  '<hr style="margin:16px 0;border:none;border-top:1px solid var(--line)">'+
  '<label>Tu as déjà un code ?</label><input id="gCode" placeholder="KF1-Prenom-20261231-xxxxxxxx" autocomplete="off">'+
  '<button data-act="valCode">🔓 Valider le code</button></div>'}
 else if(type==='admin'){
  body.innerHTML='<div class="admpanel"><div class="admhead"><span class="admshield">🛡️</span><div><b>Connexion administrateur</b><p class="mut">Mot de passe requis · saisie visible</p></div></div>'+
  '<label>Mot de passe admin</label>'+
  '<div class="pwrow"><input id="gPass" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Saisir le mot de passe admin">'+
  '<button type="button" class="eye" data-ag="mask" data-k="gPass">🙈</button></div>'+
  '<div class="row vaultrow"><label class="tg '+(hasVault()?'on':'')+'"><input type="checkbox" id="gSave" '+(hasVault()?'checked':'')+'> 💾 Sauvegarder sur cet appareil</label>'+
  (hasVault()?'<button class="pri" data-ag="quick">⚡ Connexion rapide</button><button class="danger" data-ag="forget">🗑️ Oublier</button>':'')+'</div>'+
  '<div class="row"><button class="pri" data-act="adminLogin">🔑 Se connecter</button><button data-ag="hide">↩︎ Retour</button></div>'+
  '<p class="mut">Entrée = valider. Le mot de passe n\'est jamais affiché côté tiers.</p></div>'}}
/* ---------- admin : gestion des demandes ---------- */
function renderRequests(){
 const reqs=getRequests();
 return '<div class="card gold"><h2>📨 Demandes d\'accès ('+reqs.length+')</h2>'+
 (reqs.length?reqs.map(r=>'<div class="notif-item"><div class="avatar">'+esc(r.prenom[0]||'?').toUpperCase()+'</div>'+
  '<div class="content"><b>'+esc(r.prenom)+'</b><span>'+new Date(r.ts).toLocaleString('fr-FR')+' · '+esc(r.status)+'</span></div>'+
  '<div class="actions">'+(r.status==='pending'?
   '<button class="pri" data-req="approve" data-k="'+r.id+'">✅ Approuver</button><button class="danger" data-req="refuse" data-k="'+r.id+'">❌ Refuser</button>':
   r.status==='approved'?
   '<span class="badge b-dtc">KF1-'+esc(r.prenom)+'-'+r.exp+'-'+r.sig+'</span><button class="danger" data-req="revoke" data-k="'+r.id+'">🚫 Révoquer</button>':
   '<span class="badge">Refusé</span>')+'</div></div>').join(''):'<p class="mut">Aucune demande.</p>')+'</div>'}
async function handleRequest(act,id){
 const reqs=getRequests();const r=reqs.find(x=>x.id===id);if(!r)return;
 if(act==='approve'){
  const c=await makeCode(r.prenom,30);r.status='approved';r.code=c.code;r.exp=c.exp;r.sig=c.sig;
  saveRequests(reqs);
  if(S.db&&S.adminCloud){try{await S.db.ref('requests/'+id).update({status:'approved',prenom:c.prenom,exp:c.exp,sig:c.sig});notify('✅ Accès accordé','Bonjour '+r.prenom+', ton code : '+c.code)}catch(e){}}
  toast('✅ Accès accordé à '+r.prenom)}
 else if(act==='refuse'){r.status='refused';saveRequests(reqs);
  if(S.db&&S.adminCloud){try{await S.db.ref('requests/'+id).update({status:'refused'})}catch(e){}}
  toast('❌ Refusé')}
 else if(act==='revoke'){if(r.sig){S.cfg.revoked=S.cfg.revoked||{};S.cfg.revoked[r.sig]={ts:Date.now()};await publishCfg()}
  r.status='revoked';saveRequests(reqs);toast('🚫 Révoqué')}
 renderAdmin()}
/* ---------- dispatcher ---------- */
document.addEventListener('click',async function(e){
 const g=e.target.closest('[data-gate]');if(g){handleGateChoice(g.dataset.gate);return}
 const b=e.target.closest('[data-req]');if(b){await handleRequest(b.dataset.req,b.dataset.k);return}
 const ag=e.target.closest('[data-ag]');if(!ag)return;const a=ag.dataset.ag,k=ag.dataset.k;
 if(a==='mask'){const i=$('#'+k);if(!i)return;const m=i.type==='password';i.type=m?'text':'password';ag.textContent=m?'🙈':'👁';i.focus();return}
 if(a==='quick'){const pw=dec(ls.get('admVault',''));if(pw&&await sha256(pw)===ADMIN_HASH){ls.set('admDevice',true);S.role='admin';ls.set('session',{ts:Date.now()});closeModal();syncNav();const app=$('#app');if(app&&app.classList.contains('hid'))enterApp();switchView('admin');toast('🛡️ Admin connecté')}else{ls.set('admVault','');toast('Coffre invalide')}return}
 if(a==='forget'){ls.set('admVault','');toast('🗑️ Oublié');renderGate();return}
 if(a==='hide'){renderGate();return}});
/* ---------- init ---------- */
function boot(){
 const g=$('#gate');if(!g)return;
 g.addEventListener('click',function(e){const c=e.target.closest('.access-card');if(c)handleGateChoice(c.dataset.gate)});
 renderGate();
 const btn=$('#admBtn');if(btn){btn.classList.toggle('on',S.role==='admin');
  btn.addEventListener('click',function(){if(S.role==='admin'){switchView('admin')}else{handleGateChoice('admin')}})}}
function syncNav(){
 const i=NAV.findIndex(function(n){return n[0]==='admin'});
 const show=isAdmDevice()||S.role==='admin';
 if(show&&i<0)NAV.push(['admin','🔐 Admin']);
 if(!show&&i>=0)NAV.splice(i,1);
 const rc=$('#roleChip');if(rc){rc.textContent=S.role==='admin'?'🛡️ Admin':'👤 Tiers';rc.classList.remove('hid')}
 const app=$('#app');if(app&&!app.classList.contains('hid')&&S.view&&typeof switchView==='function')switchView(S.view)}
window.KFAccess={renderGate:renderGate,handleGateChoice:handleGateChoice,doRequest:doRequest,doValCode:doValCode,doAdminLogin:doAdminLogin,renderRequests:renderRequests,handleRequest:handleRequest,syncNav:syncNav,isAdmDevice:isAdmDevice,hasVault:hasVault};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
