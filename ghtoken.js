/* KEV FUSION 2026 — ghtoken.js v1.0.0
   Case JETON GITHUB réservée à l'ADMIN, visible uniquement en session admin.
   · Le jeton n'est JAMAIS écrit dans un fichier publié : stockage local appareil seulement.
   · Une fois enregistré, TOUS les modules (access.json, icônes, manifest, diffusion) l'utilisent
     automatiquement sans re-saisie = "intégration automatique".
   · Test de validité via api.github.com, effacement en 1 clic, masquage permanent du jeton. */
(function(){
'use strict';
var LS={get:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},
 del:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function $(s){return document.querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(m){if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3000)}
function isAdmin(){return (typeof S!=='undefined'&&S.role==='admin')||LS.get('admDevice',false)===true}
function get(){return (LS.get('ghToken','')||'').trim()}
function mask(t){if(!t)return '—';return t.slice(0,6)+'…'+t.slice(-4)}
/* ---------- état ---------- */
function stateLine(extra){
 var el=$('#ghState');if(!el)return;
 var t=get();
 var html;
 if(!t)html='<span class="st-warn">⚠️ Aucun jeton enregistré — la publication automatique est désactivée.</span>';
 else html='<span class="st-ok">✅ Jeton présent sur cet appareil : <code>'+esc(mask(t))+'</code></span>';
 if(location.protocol!=='https:'&&location.hostname!=='localhost')
  html+='<br><span class="st-warn">⚠️ Contexte non-HTTPS : le jeton reste local mais l\'app doit tourner en HTTPS pour GitHub Pages.</span>';
 if(extra)html+='<br><span class="mut">'+esc(extra)+'</span>';
 el.innerHTML=html}
/* ---------- test ---------- */
async function test(){
 var t=get();if(!t){stateLine('Enregistre d\'abord un jeton.');return}
 stateLine('⏳ Test en cours…');
 try{
  var r=await fetch('https://api.github.com/user',{headers:{Authorization:'Bearer '+t,Accept:'application/vnd.github+json'}});
  if(!r.ok)throw new Error('HTTP '+r.status+(r.status===401?' (jeton invalide ou révoqué)':''));
  var j=await r.json();
  var rl=await fetch('https://api.github.com/rate_limit',{headers:{Authorization:'Bearer '+t}});
  var lim='';if(rl.ok){var lj=await rl.json();lim=' · reste '+(lj.resources&&lj.resources.core?lj.resources.core.remaining:'?')+' req/h'}
  stateLine('Connecté : '+j.login+(j.name?' ('+j.name+')':'')+lim);
  toast('✅ Jeton valide : '+j.login);
 }catch(e){stateLine('❌ '+e.message);toast('❌ Jeton : '+e.message)}}
/* ---------- carte admin ---------- */
function card(){
 var auto=LS.get('ghAuto',true);
 return '<div class="card gold" id="ghTokenCard">'+
 '<h2>🔑 Jeton GitHub — publication automatique</h2>'+
 '<p class="mut">Visible <b>uniquement en session admin</b>. Le jeton est stocké <b>seulement sur cet appareil</b> '+
 '(jamais dans les fichiers publiés, jamais envoyé ailleurs que <code>api.github.com</code>). '+
 'Une fois enregistré, la publication de <code>access.json</code>, des icônes PWA, du manifest et des mises à jour tiers se fait <b>sans re-saisie</b>.</p>'+
 '<label for="ghTok">Jeton (fine-grained, Contents: Read &amp; write, repo kev-fusion)</label>'+
 '<input id="ghTok" type="password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" '+
 'placeholder="github_pat_… ou ghp_…" value="">'+
 '<div class="row">'+
  '<button class="pri" id="ghSave">💾 Enregistrer sur cet appareil</button>'+
  '<button id="ghTest">🧪 Tester</button>'+
  '<button class="danger" id="ghClear">🗑️ Effacer</button>'+
 '</div>'+
 '<p id="ghState" class="mut" style="margin-top:8px"></p>'+
 '<label class="tg '+(auto?'on':'')+'" style="display:inline-flex;margin-top:10px">'+
  '<input type="checkbox" id="ghAuto" '+(auto?'checked':'')+'> Publication automatique dès qu\'une action admin le demande</label>'+
 '<div class="row" style="margin-top:10px">'+
  '<button id="ghPubAcc">📡 Publier access.json</button>'+
  '<button id="ghPubIcons">🚗 Publier les icônes</button>'+
  '<button id="ghPubMan">📄 Publier le manifest</button>'+
 '</div>'+
 '<p class="dim" style="margin-top:8px">Sécurité : crée un jeton <b>fine-granted</b> limité au dépôt <code>kev-fusion</code>, '+
 'permission <b>Contents: Read &amp; write</b> uniquement. Révoque tout jeton déjà partagé par message ou capture.</p>'+
 '</div>'}
function bind(){
 var c=$('#ghTokenCard');if(!c||c._b)return;c._b=1;
 var inp=$('#ghTok');
 $('#ghSave').addEventListener('click',function(){
  var v=(inp.value||'').trim();
  if(!v){toast('Colle d\'abord le jeton');inp.focus();return}
  if(!/^(ghp|gho|ghu|ghs|ghr|github_pat)_[A-Za-z0-9_]{20,}$/.test(v)){
   if(!confirm('Ce jeton n\'a pas le format attendu. Enregistrer quand même ?'))return}
  LS.set('ghToken',v);LS.set('ghTokenSet',Date.now());inp.value='';
  stateLine('Enregistré à '+new Date().toLocaleTimeString('fr-FR'));
  toast('🔑 Jeton enregistré (appareil admin uniquement)')});
 $('#ghTest').addEventListener('click',test);
 $('#ghClear').addEventListener('click',function(){
  LS.del('ghToken');LS.del('ghTokenSet');stateLine('Jeton effacé de cet appareil.');
  toast('🗑️ Jeton effacé')});
 var au=$('#ghAuto');if(au)au.addEventListener('change',function(){LS.set('ghAuto',au.checked);
  toast(au.checked?'🤖 Publication auto activée':'🤖 Publication auto désactivée')});
 $('#ghPubAcc').addEventListener('click',async function(){
  if(!get()){toast('🔑 Enregistre d\'abord le jeton');return}
  try{if(window.KFAccess&&KFAccess.publish){await KFAccess.publish();toast('📡 access.json publié')}else toast('Module accès absent')}
  catch(e){toast('❌ '+e.message)}});
 $('#ghPubIcons').addEventListener('click',async function(){
  if(!get()){toast('🔑 Enregistre d\'abord le jeton');return}
  try{if(window.KFIconGen&&KFIconGen.publish){await KFIconGen.publish();toast('🚗 Icônes publiées')}else toast('Module icônes absent')}
  catch(e){toast('❌ '+e.message)}});
 $('#ghPubMan').addEventListener('click',async function(){
  if(!get()){toast('🔑 Enregistre d\'abord le jeton');return}
  try{if(window.KFIconGen&&KFIconGen.publish){await KFIconGen.publish();toast('📄 Manifest + icônes publiés')}else toast('Module icônes absent')}
  catch(e){toast('❌ '+e.message)}});
 stateLine()}
function inject(){
 if(!isAdmin())return;
 var v=$('#view');if(!v)return;
 if(!$('#ghTokenCard')){v.insertAdjacentHTML('afterbegin',card())}
 bind();stateLine()}
/* hook renderAdmin */
function hook(){
 if(typeof window.renderAdmin!=='function'||window.renderAdmin.__kfGh)return;
 var _ra=window.renderAdmin;
 var w=function(){_ra();inject()};
 w.__kfGh=true;window.renderAdmin=w}
hook();
/* si admin se connecte pendant que la vue admin est déjà rendue */
document.addEventListener('click',function(e){
 if(e.target.closest('[data-act="nav"]')&&e.target.closest('[data-act="nav"]').dataset.k==='admin'){setTimeout(inject,60)}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){hook();inject()});
else{hook();inject()}
window.KFGhToken={get:get,test:test,set:function(v){LS.set('ghToken',String(v||'').trim());stateLine()},
 clear:function(){LS.del('ghToken');stateLine()},inject:inject,isAdmin:isAdmin};
})();
