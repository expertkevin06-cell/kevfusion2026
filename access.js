/* KEV FUSION 2026 — access.js v2.0.0  (ACCÈS SIMPLIFIÉ AU MAXIMUM)
   TIERS  : il indique SEULEMENT son prénom → un message pré-rempli (SMS / WhatsApp / mail / copie)
            part vers l'admin. L'app surveille access.json en continu : dès que l'admin autorise,
            l'accès s'ouvre tout seul, sans code à recopier.
   ADMIN  : un champ prénom + 3 boutons  ✅ Autoriser · ❌ Refuser · 🚫 Révoquer.
            Un seul fichier publié (access.json) = tout l'échange. Aucun canal, aucun Firebase,
            aucun kvdb. Temps réel par surveillance du fichier (≈10 s).
   État tiers visible en direct : ⏳ en attente · ✅ accordé · ❌ refusé · 🚫 révoqué. */
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
function normP(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9'-]/g,'').trim()}
function today(){return new Date().toISOString().slice(0,10)}
function plusDays(n){var d=new Date(Date.now()+n*864e5);return d.toISOString().slice(0,10)}
/* ---------- état partagé (access.json) ---------- */
var LIST=LS.get('accessList',{version:1,updated:0,granted:[],refused:[],revoked:[]});
function saveList(){LS.set('accessList',LIST)}
function findIn(arr,p){var n=normP(p);for(var i=0;i<arr.length;i++){if(normP(arr[i].prenom||arr[i])===n)return arr[i]}return null}
function statusOf(p){
 if(!p)return null;
 var g=findIn(LIST.granted,p);
 if(g){if(g.exp&&g.exp<today())return{st:'expired',label:'⌛ Expiré le '+g.exp};
       return{st:'granted',label:'✅ Accès accordé'+(g.exp?' jusqu\'au '+g.exp:''),exp:g.exp}}
 if(findIn(LIST.revoked,p))return{st:'revoked',label:'🚫 Accès révoqué'};
 if(findIn(LIST.refused,p))return{st:'refused',label:'❌ Demande refusée'};
 return null}
/* ---------- lecture / publication du fichier ---------- */
function fileUrl(){return './access.json'}
async function pull(){
 try{var r=await fetch(fileUrl()+'?t='+Date.now(),{cache:'no-store'});
  if(!r.ok)return LIST;
  var j=await r.json();
  if(j&&typeof j==='object'){LIST=Object.assign({version:1,updated:0,granted:[],refused:[],revoked:[]},j);saveList()}
 }catch(e){}
 return LIST}
function repo(){
 var h=location.hostname,m=h.match(/^([^.]+)\.github\.io$/);
 var owner=m?m[1]:'expertkevin06-cell';
 var seg=location.pathname.split('/').filter(Boolean);
 var name=(m&&seg.length)?seg[0]:'kev-fusion';
 return Object.assign({owner:owner,repo:name,branch:'main'},LS.get('ghCfg',{}))}
function token(){return (LS.get('ghToken','')||'').trim()}
function utf8b64(s){var b=new TextEncoder().encode(s),o='',CH=0x8000;
 for(var i=0;i<b.length;i+=CH)o+=String.fromCharCode.apply(null,b.subarray(i,i+CH));return btoa(o)}
async function publish(){
 var c=repo(),tk=token();
 if(!tk)throw new Error('Jeton GitHub absent (Admin → PWABuilder → Jeton)');
 var api='https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/access.json';
 var sha=null;
 try{var g=await fetch(api+'?ref='+encodeURIComponent(c.branch),{headers:{Authorization:'Bearer '+tk,Accept:'application/vnd.github+json'}});
  if(g.ok){sha=(await g.json()).sha}}catch(e){}
 LIST.updated=Date.now();
 var body={message:'KEV FUSION · accès '+new Date().toISOString(),content:utf8b64(JSON.stringify(LIST,null,2)),branch:c.branch};
 if(sha)body.sha=sha;
 var r=await fetch(api,{method:'PUT',headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify(body)});
 if(!r.ok){var t=await r.text().catch(function(){return''});throw new Error('HTTP '+r.status+' '+t.slice(0,120))}
 saveList();return true}
function downloadList(){
 var a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([JSON.stringify(LIST,null,2)],{type:'application/json'}));
 a.download='access.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},5000)}
/* ---------- actions ADMIN (3 boutons) ---------- */
function adminSet(p,action,days){
 var n=normP(p);if(!n)return false;
 LIST.granted=LIST.granted.filter(function(x){return normP(x.prenom)!==n});
 LIST.refused=LIST.refused.filter(function(x){return normP(x.prenom||x)!==n});
 LIST.revoked=LIST.revoked.filter(function(x){return normP(x.prenom||x)!==n});
 if(action==='grant')LIST.granted.push({prenom:String(p).trim(),exp:plusDays(days||30),since:Date.now()});
 if(action==='refuse')LIST.refused.push({prenom:String(p).trim(),since:Date.now()});
 if(action==='revoke')LIST.revoked.push({prenom:String(p).trim(),since:Date.now()});
 saveList();return true}
async function adminAct(p,action,days){
 if(!adminSet(p,action,days))return;
 var lbl={grant:'✅ autorisé',refuse:'❌ refusé',revoke:'🚫 révoqué'}[action];
 try{await publish();toast(lbl+' · '+p+' · publié (temps réel)')}
 catch(e){toast(lbl+' · '+p+' — publication manuelle requise : '+e.message);downloadList();openUpload()}
 renderAdminPanel();renderGate()}
function openUpload(){var c=repo();
 window.open('https://github.com/'+c.owner+'/'+c.repo+'/upload/'+c.branch,'_blank','noopener')}
/* ---------- actions TIERS ---------- */
function contact(){return (LS.get('adminContact','')||'').trim()}
function requestMsg(p){return 'Accès KEV FUSION — prénom : '+p}
function sendRequest(p){
 var msg=requestMsg(p),c=contact(),tel='',mail='';
 if(c){if(/^[\d+.\s-]{6,}$/.test(c))tel=c.replace(/[^\d+]/g,'');else if(c.indexOf('@')>0)mail=c}
 var box=$('#accSend');if(!box)return;
 var links='';
 if(tel)links+='<a class="acc-lnk" href="sms:'+tel+'?body='+encodeURIComponent(msg)+'">💬 SMS</a>'+
               '<a class="acc-lnk" href="https://wa.me/'+tel.replace('+','')+'?text='+encodeURIComponent(msg)+'" target="_blank" rel="noopener">🟢 WhatsApp</a>';
 if(mail)links+='<a class="acc-lnk" href="mailto:'+mail+'?subject='+encodeURIComponent('Accès KEV FUSION')+'&body='+encodeURIComponent(msg)+'">✉️ Mail</a>';
 links+='<button type="button" class="acc-lnk" data-acc="copy">📋 Copier</button>';
 box.innerHTML='<div class="acc-send"><p class="mut">Envoie <b>uniquement ton prénom</b> à l\'admin, puis reste ici : l\'accès s\'ouvrira tout seul dès l\'autorisation.</p>'+
  '<div class="acc-links">'+links+'</div><p class="acc-state" id="accState">⏳ En attente de l\'admin…</p></div>';
 LS.set('myPrenom',p);startPoll();
 box.querySelector('[data-acc="copy"]').addEventListener('click',function(){
  if(navigator.clipboard)navigator.clipboard.writeText(msg).then(function(){toast('📋 Prénom copié')});else toast(msg)})}
/* ---------- surveillance temps réel ---------- */
var pollT=null,polling=false;
function startPoll(){if(pollT)return;tick();pollT=setInterval(tick,10000);
 window.addEventListener('focus',tick);document.addEventListener('visibilitychange',function(){if(!document.hidden)tick()})}
async function tick(){
 if(polling)return;polling=true;
 await pull();
 reflect();
 polling=false}
function reflect(){
 var p=LS.get('myPrenom','')||($('#gPrenom')?$('#gPrenom').value.trim():'');
 var stEl=$('#accState');
 if(p&&stEl){var s=statusOf(p);stEl.textContent=s?s.label:'⏳ En attente de l\'admin…';
  stEl.className='acc-state '+(s?s.st:'wait')}
 /* ouverture automatique si autorisé */
 if(p){var s2=statusOf(p);
  if(s2&&s2.st==='granted'){
   LS.set('access',{prenom:p,exp:s2.exp});
   var gate=$('#gate');if(gate&&!gate.classList.contains('hid')){enterAppSafe()}
   toast('✅ Bienvenue '+p)}}
 /* révocation pendant session → sortie */
 var cur=LS.get('access',null);
 if(cur&&cur.prenom){var s3=statusOf(cur.prenom);
  if(s3&&(s3.st==='revoked'||s3.st==='refused'||s3.st==='expired')){
   LS.del('access');LS.del('session');
   if(typeof S!=='undefined'){S.role=null;S.access=null}
   var app=$('#app');if(app)app.classList.add('hid');
   var g2=$('#gate');if(g2)g2.classList.remove('hid');
   renderGate();toast(s3.label)}}
 renderAdminPanel()}
function enterAppSafe(){try{if(typeof enterApp==='function')enterApp()}catch(e){location.reload()}}
/* ---------- validAccess / doRequest / doValCode (compat app.js) ---------- */
window.validAccess=async function(a){
 if(!a||!a.prenom)return false;
 await pull();
 var s=statusOf(a.prenom);
 return !!(s&&s.st==='granted')}
window.doRequest=async function(){
 var el=$('#gPrenom');var p=el?el.value.trim():'';
 if(!p){toast('Indique ton prénom');if(el)el.focus();return}
 LS.set('myPrenom',p);sendRequest(p);toast('📨 Demande envoyée : '+p)}
window.doValCode=async function(){
 /* réutilisé comme « entrer avec mon prénom » */
 var el=$('#gPrenom')||$('#gCode');var p=el?el.value.trim():'';
 if(!p){toast('Indique ton prénom');return}
 await pull();var s=statusOf(p);
 if(s&&s.st==='granted'){LS.set('myPrenom',p);LS.set('access',{prenom:p,exp:s.exp});enterAppSafe();toast('✅ Bienvenue '+p)}
 else if(s)toast(s.label);
 else{LS.set('myPrenom',p);sendRequest(p)}}
/* ---------- rendu du gate (ultra simple) ---------- */
function renderGate(){
 var g=$('#gate');if(!g)return;
 var my=LS.get('myPrenom','');
 var s=my?statusOf(my):null;
 g.innerHTML=
 '<div class="card gatehead"><h1>🔑 KEV FUSION 2026</h1>'+
 '<p class="mut">Deux accès, zéro friction.</p></div>'+
 '<div class="access-choice">'+
  '<div class="card tier"><h2>👤 Tiers</h2>'+
   '<label for="gPrenom">Ton prénom</label>'+
   '<input id="gPrenom" maxlength="24" autocomplete="given-name" placeholder="Ex. Thomas" value="'+esc(my)+'">'+
   '<div class="row"><button class="pri" data-act="reqAccess">📨 Demander l\'accès</button>'+
   '<button data-acc="enter">➡️ Entrer</button></div>'+
   '<div id="accSend"></div>'+
   '<p class="mut" style="margin-top:8px">Un seul mot : ton prénom. L\'admin autorise en 1 clic ; l\'accès s\'ouvre automatiquement.</p>'+
  '</div>'+
  '<div class="card admpanel"><div class="admhead"><span class="admshield">🛡️</span><div><b>Administrateur</b>'+
   '<p class="mut">Mot de passe · gestion des accès en 1 clic</p></div></div>'+
   '<label for="gPass">Mot de passe</label>'+
   '<div class="pwrow"><input id="gPass" type="text" autocomplete="off" placeholder="Mot de passe admin">'+
   '<button type="button" class="eye" data-acc="mask">🙈</button></div>'+
   '<div class="row"><button class="pri" data-act="adminLogin">🔑 Connexion</button></div>'+
   '<div id="accAdmin"></div>'+
  '</div>'+
 '</div>';
 var inp=$('#gPrenom');
 if(inp)inp.addEventListener('input',function(){LS.set('myPrenom',inp.value.trim());
  var st=statusOf(inp.value.trim());var box=$('#accSend');
  if(st&&box&&!box.querySelector('.acc-send'))box.innerHTML='<p class="acc-state '+st.st+'">'+st.label+'</p>';
  tick()});
 var eb=g.querySelector('[data-acc="enter"]');
 if(eb)eb.addEventListener('click',function(){window.doValCode()});
 var mb=g.querySelector('[data-acc="mask"]');
 if(mb)mb.addEventListener('click',function(){var i=$('#gPass');if(!i)return;
  var m=i.type==='password';i.type=m?'text':'password';mb.textContent=m?'🙈':'👁'});
 if(my)sendRequestSilent(my);
 renderAdminPanel()}
function sendRequestSilent(p){var box=$('#accSend');if(!box||box.querySelector('.acc-send'))return;
 var s=statusOf(p);
 box.innerHTML='<p class="acc-state '+(s?s.st:'wait')+'">'+(s?s.label:'⏳ En attente de l\'admin…')+'</p>';
 startPoll()}
/* ---------- panneau ADMIN (prénom + 3 boutons + liste) ---------- */
function renderAdminPanel(){
 var host=$('#accAdmin');if(!host)return;
 var g=LIST.granted||[],r=LIST.refused||[],v=LIST.revoked||[];
 host.innerHTML=
 '<div style="margin-top:12px"><label for="accP">Prénom à gérer</label>'+
 '<input id="accP" placeholder="Prénom du tiers" value="'+esc(LS.get('accP',''))+'">'+
 '<div class="row"><label for="accD" style="margin:0">Durée (jours)</label>'+
 '<input id="accD" type="number" value="'+(LS.get('accD',30))+'" min="1" max="3650" style="max-width:90px"></div>'+
 '<div class="row" style="margin-top:6px">'+
  '<button class="pri" data-acc="grant">✅ Autoriser</button>'+
  '<button class="danger" data-acc="refuse">❌ Refuser</button>'+
  '<button class="danger" data-acc="revoke">🚫 Révoquer</button></div>'+
 '<div class="row" style="margin-top:6px"><button data-acc="pub">📡 Publier maintenant</button>'+
  '<button data-acc="dl">⬇️ access.json</button></div>'+
 '<label for="accC" style="margin-top:10px">Contact admin (tél / WhatsApp / mail)</label>'+
 '<input id="accC" placeholder="+336… ou admin@mail.fr" value="'+esc(contact())+'">'+
 '<h3 style="margin-top:10px">Autorisés ('+g.length+')</h3>'+
 (g.length?g.map(function(x){return '<div class="acc-row"><span><b>'+esc(x.prenom)+'</b> <i class="mut">→ '+esc(x.exp||'∞')+'</i></span>'+
   '<button class="danger" data-acc="rev-one" data-p="'+esc(x.prenom)+'">🚫</button></div>'}).join(''):'<p class="mut">Aucun.</p>')+
 (r.length?'<h3>Refusés ('+r.length+')</h3>'+r.map(function(x){return '<div class="acc-row"><span>'+esc(x.prenom||x)+'</span><button data-acc="unref" data-p="'+esc(x.prenom||x)+'">↩︎</button></div>'}).join(''):'')+
 (v.length?'<h3>Révoqués ('+v.length+')</h3>'+v.map(function(x){return '<div class="acc-row"><span>'+esc(x.prenom||x)+'</span><button data-acc="unrev" data-p="'+esc(x.prenom||x)+'">↩︎</button></div>'}).join(''):'')+
 '</div>';
 var cp=$('#accC');if(cp)cp.addEventListener('change',function(){LS.set('adminContact',cp.value.trim())});
 var ap=$('#accP');if(ap)ap.addEventListener('input',function(){LS.set('accP',ap.value)});
 var ad=$('#accD');if(ad)ad.addEventListener('change',function(){LS.set('accD',+ad.value||30)})}
/* ---------- dispatch ---------- */
document.addEventListener('click',async function(e){
 var b=e.target.closest('[data-acc]');if(!b)return;
 var a=b.dataset.acc,p=(b.dataset.p||($('#accP')?$('#accP').value.trim():'')||($('#gPrenom')?$('#gPrenom').value.trim():''));
 var days=$('#accD')?+$('#accD').value||30:30;
 e.preventDefault();
 if(a==='grant')await adminAct(p,'grant',days);
 else if(a==='refuse')await adminAct(p,'refuse');
 else if(a==='revoke')await adminAct(p,'revoke');
 else if(a==='rev-one')await adminAct(p,'revoke');
 else if(a==='unref'){LIST.refused=LIST.refused.filter(function(x){return normP(x.prenom||x)!==normP(p)});saveList();try{await publish()}catch(err){}renderAdminPanel();renderGate()}
 else if(a==='unrev'){LIST.revoked=LIST.revoked.filter(function(x){return normP(x.prenom||x)!==normP(p)});saveList();try{await publish()}catch(err){}renderAdminPanel();renderGate()}
 else if(a==='pub'){try{await publish();toast('📡 access.json publié')}catch(err){toast('❌ '+err.message);downloadList();openUpload()}}
 else if(a==='dl'){downloadList();toast('⬇️ access.json téléchargé')}
 else if(a==='copy'){/* géré dans sendRequest */}
 else if(a==='enter'){window.doValCode()}
 else if(a==='mask'){var i=$('#gPass');if(i){var m=i.type==='password';i.type=m?'text':'password';b.textContent=m?'🙈':'👁'}}});
/* ---------- injection panneau dans vue Admin ---------- */
function hookAdmin(){
 if(typeof window.renderAdmin!=='function'||window.renderAdmin.__kfAcc)return;
 var _ra=window.renderAdmin;
 var w=function(){_ra();var v=$('#view');if(!v)return;
  if(!$('#accAdminView')){var d=document.createElement('div');d.id='accAdminView';
   d.className='card gold';d.innerHTML='<h2>👥 Accès tiers (1 clic)</h2><div id="accAdmin"></div>';v.appendChild(d)}
  renderAdminPanel()};
 w.__kfAcc=true;window.renderAdmin=w}
hookAdmin();
/* ---------- boot ---------- */
function boot(){
 renderGate();hookAdmin();startPoll();
 setTimeout(tick,1500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFAccess={pull:pull,publish:publish,grant:function(p,d){return adminAct(p,'grant',d)},
 refuse:function(p){return adminAct(p,'refuse')},revoke:function(p){return adminAct(p,'revoke')},
 status:statusOf,list:function(){return LIST},render:renderGate,renderAdmin:renderAdminPanel};
})();
