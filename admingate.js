/* KEV FUSION 2026 — admingate.js v4.4.0
   Connexion admin : champ en clair (aucun point par défaut), bloc admin invisible pour les tiers,
   mot de passe sauvegardable uniquement sur l'appareil admin (coffre local obfusqué). */
(function(){
'use strict';
if(typeof sha256!=='function'||typeof ADMIN_HASH==='undefined'){console.warn('admingate.js: app.js non chargé');return}
const TAPS=5,TAPWIN=2500,HOLD=1200;
function isAdmDevice(){return ls.get('admDevice',false)===true}
function hasVault(){return !!ls.get('admVault','')}
function salt(){let s=ls.get('admSalt','');if(!s){s=uid();ls.set('admSalt',s)}return s}
function enc(p){const k=salt();let o='';for(let i=0;i<p.length;i++)o+=String.fromCharCode(p.charCodeAt(i)^k.charCodeAt(i%k.length));return btoa(unescape(encodeURIComponent(o)))}
function dec(b){try{const s=decodeURIComponent(escape(atob(b)));const k=salt();let o='';for(let i=0;i<s.length;i++)o+=String.fromCharCode(s.charCodeAt(i)^k.charCodeAt(i%k.length));return o}catch(e){return''}}
/* ---- coffre : jamais affiché aux tiers ---- */
function vaultRows(prefix){
 return '<div class="row vaultrow">'+
 '<label class="tg '+(hasVault()?'on':'')+'"><input type="checkbox" id="'+prefix+'Save" '+(hasVault()?'checked':'')+'> 💾 Sauvegarder le mot de passe sur cet appareil admin</label>'+
 (hasVault()?'<button class="pri" data-ag="quick">⚡ Connexion rapide</button><button class="danger" data-ag="forget">🗑️ Oublier</button>':'')+
 '</div>'}
function adminInner(prefix){
 return '<div class="admhead"><span class="admshield">🛡️</span><div><b>Espace administrateur</b><p class="mut">Masqué pour les tiers · appareil admin uniquement</p></div></div>'+
 '<label>Mot de passe admin (saisie en clair — aucun point)</label>'+
 '<div class="pwrow"><input id="'+prefix+'Pass" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" name="kf-adm-'+Math.random().toString(36).slice(2)+'" placeholder="Saisir le mot de passe admin">'+
 '<button type="button" class="eye" data-ag="mask" data-k="'+prefix+'Pass" title="Masquer / afficher">🙈</button></div>'+
 vaultRows(prefix)+
 '<div class="row"><button class="pri" data-act="adminLogin">🔑 Connexion admin</button>'+
 '<button data-ag="hide">↩︎ Masquer</button>'+
 (isAdmDevice()?'<button class="danger" data-ag="unmark">🚫 Retirer cet appareil admin</button>':'')+'</div>'+
 '<p class="mut">Le mot de passe n\'est jamais transmis ni affiché côté tiers. Sauvegarde locale obfusquée, réservée à cet appareil.</p>'}
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
}
/* ---- révélation discrète (invisible pour les tiers) ---- */
let taps=0,tapT=0,holdT=null;
function reveal(){
 const b=$('#admBlock');
 if(!b){const g=$('#gate');if(g){g.classList.remove('hid');rebuildGate()} }
 const blk=$('#admBlock');if(!blk)return;
 blk.classList.remove('hid');blk.classList.add('pop');
 const inp=$('#gPass');if(inp)inp.focus();
 toast('🛡️ Espace admin révélé sur cet appareil');
}
function bindGestures(){
 const logo=$('#brandTap');
 if(logo){
  logo.addEventListener('click',()=>{const n=Date.now();if(n-tapT>TAPWIN)taps=0;tapT=n;taps++;if(taps>=TAPS){taps=0;reveal()}});
  logo.addEventListener('pointerdown',()=>{holdT=setTimeout(reveal,HOLD)});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>logo.addEventListener(ev,()=>clearTimeout(holdT)));
 }
 document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.shiftKey&&(e.key==='A'||e.key==='a')){e.preventDefault();reveal()}});
}
/* ---- navigation : Admin masqué tant que l'appareil n'est pas admin ---- */
function syncNav(){
 const i=NAV.findIndex(n=>n[0]==='admin');
 const show=isAdmDevice()||S.role==='admin';
 if(show&&i<0)NAV.push(['admin','🔐 Admin']);
 if(!show&&i>=0)NAV.splice(i,1);
 const app=$('#app');
 if(app&&!app.classList.contains('hid')&&S.view&&typeof switchView==='function')switchView(S.view);
}
/* ---- connexion ---- */
async function succeed(pw,save){
 ls.set('admDevice',true);
 if(save)ls.set('admVault',enc(pw));
 S.role='admin';ls.set('session',{ts:Date.now()});
 const el=$('#gPass')||$('#mPass');if(el)el.value='';
 closeModal();syncNav();
 toast('🛡️ Admin connecté'+(save?' · mot de passe sauvegardé (appareil admin)':''));
 enterApp();switchView('admin');
}
window.doAdminLogin=async function(){
 const el=$('#gPass')||$('#mPass');
 let pw=el?el.value.trim():'';
 if(!pw&&hasVault())pw=dec(ls.get('admVault',''));
 if(!pw){toast('Saisis le mot de passe admin');return}
 if(await sha256(pw)===ADMIN_HASH){
  const save=(($('#gSave')&&$('#gSave').checked)||($('#mSave')&&$('#mSave').checked));
  await succeed(pw,save);
 }else{toast('❌ Mot de passe incorrect');log('warn','admin échec')}
};
async function quick(){
 if(!hasVault()){toast('Aucun mot de passe sauvegardé');return}
 const pw=dec(ls.get('admVault',''));
 if(pw&&await sha256(pw)===ADMIN_HASH)await succeed(pw,true);
 else{ls.set('admVault','');toast('Coffre invalide — ressaisis le mot de passe');rebuildGate()}
}
window.openAdminModal=function(){
 if(!isAdmDevice()&&S.role!=='admin'){toast('🔒 Espace administrateur privé');return}
 openModal('<div class="admpanel modaladm">'+adminInner('m')+'</div>');
 const i=$('#mPass');if(i)i.focus();
};
/* ---- actions locales ---- */
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-ag]');if(!b)return;
 const a=b.dataset.ag,k=b.dataset.k;
 if(a==='mask'){const i=$('#'+k);if(!i)return;const show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'🙈':'👁';i.focus();return}
 if(a==='quick'){await quick();return}
 if(a==='forget'){ls.set('admVault','');toast('🗑️ Mot de passe oublié sur cet appareil');rebuildGate();if($('#modal')&&!$('#modal').classList.contains('hid'))window.openAdminModal();return}
 if(a==='hide'){const blk=$('#admBlock');if(blk)blk.classList.add('hid');closeModal();return}
 if(a==='unmark'){ls.set('admDevice',false);ls.set('admVault','');S.role=null;ls.set('session',null);syncNav();rebuildGate();closeModal();toast('🚫 Appareil retiré · espace admin masqué');return}
});
/* ---- init ---- */
function boot(){rebuildGate();bindGestures();syncNav()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFAdminGate={reveal,syncNav,isAdmDevice,hasVault};
})();
