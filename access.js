/* KEV FUSION 2026 — access.js v4.0.0
   DEMANDES D'ACCÈS TIERS : notification PLEINE LARGEUR, TOUT EN HAUT de l'application,
   non repliée par défaut, avec les touches AUTORISER / REFUSER / RÉVOQUER en gros boutons
   toujours visibles. La bannière est sticky : elle reste en tête au scroll et pousse
   proprement le topbar et la navigation.
   Acheminement des demandes (4 canaux redondants) : lien profond ?areq=, collage du code,
   même appareil (storage + BroadcastChannel), Firebase Firestore optionnel.
   L'autorisation publie access.json ; le tiers voit son statut en temps réel. */
(function(){
'use strict';
/* ══════════ socle ══════════ */
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},d:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function normP(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9'-]/g,'').trim()}
function today(){return new Date().toISOString().slice(0,10)}
function plusDays(n){return new Date(Date.now()+n*864e5).toISOString().slice(0,10)}
function hhmm(ts){var d=new Date(ts);return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function toast(m){if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3400)}
var AU={c:null,on:LS.g('accSound',true)};
function snd(k){if(!AU.on)return;
 try{var c=AU.c||(AU.c=new (window.AudioContext||window.webkitAudioContext)());
  if(c.state==='suspended')c.resume();
  var m={req:[523,784,.24,'triangle'],ok:[660,990,.16,'sine'],no:[300,180,.22,'sawtooth'],
   tick:[1300,1300,.02,'sine']}[k]||[900,900,.04,'sine'];
  var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(60,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.13,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.03)}catch(e){}}
function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p||[120,60,120])}catch(e){}}
function isAdmin(){try{return (typeof S!=='undefined'&&S.role==='admin')||LS.g('admDevice',false)===true}catch(e){return LS.g('admDevice',false)===true}}
function b64e(o){try{return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}catch(e){return ''}}
function b64d(s){try{return JSON.parse(decodeURIComponent(escape(atob(String(s).replace(/-/g,'+').replace(/_/g,'/')))))}catch(e){return null}}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
/* ══════════ identité / état ══════════ */
var DEVID=LS.g('devid','');
if(!DEVID){DEVID=hash(Math.random()+'_'+Date.now()+'_'+navigator.userAgent).slice(0,10);LS.s('devid',DEVID)}
var LIST=LS.g('accessList',{version:1,updated:0,granted:[],refused:[],revoked:[]});
var REQS=LS.g('accessReqs',[]);if(!Array.isArray(REQS))REQS=[];
var DAYS=LS.g('accessDays',30);
var CUR=null;            /* id de la demande affichée en bannière */
var MIN=false;           /* bannière minimisée */
var pollT=null,bc=null;
try{if(window.BroadcastChannel)bc=new BroadcastChannel('kf-access')}catch(e){}
function saveReqs(){LS.s('accessReqs',REQS.slice(0,200))}
function saveList(){LS.s('accessList',LIST)}
function contact(){return (LS.g('adminContact','')||'').trim()}
function deepLink(code){return location.href.split('?')[0].split('#')[0]+'?areq='+code}
/* ══════════ statuts ══════════ */
function findIn(arr,p){var n=normP(p);for(var i=0;i<arr.length;i++)if(normP(arr[i].prenom||arr[i])===n)return arr[i];return null}
function statusOf(p){if(!p)return null;
 var g=findIn(LIST.granted,p);
 if(g){if(g.exp&&g.exp<today())return{st:'expired',label:'⌛ Expiré le '+g.exp};
  return{st:'granted',label:'✅ Accès accordé'+(g.exp?' jusqu\'au '+g.exp:''),exp:g.exp}}
 if(findIn(LIST.revoked,p))return{st:'revoked',label:'🚫 Accès révoqué'};
 if(findIn(LIST.refused,p))return{st:'refused',label:'❌ Demande refusée'};
 return null}
function pending(){return REQS.filter(function(r){return r.st==='pending'})}
/* ══════════ access.json ══════════ */
function pull(){return fetch('access.json?t='+Date.now(),{cache:'no-store'}).then(function(r){
 if(!r.ok)return LIST;return r.json()}).then(function(j){
 if(j&&typeof j==='object'){LIST=Object.assign({version:1,updated:0,granted:[],refused:[],revoked:[]},j);saveList()}
 return LIST}).catch(function(){return LIST})}
function repo(){var h=location.hostname,m=h.match(/^([^.]+)\.github\.io$/);
 var seg=location.pathname.split('/').filter(Boolean);
 return Object.assign({owner:m?m[1]:'expertkevin06-cell',repo:(m&&seg.length)?seg[0]:'kev-fusion',branch:'main'},LS.g('ghCfg',{}))}
function token(){return (LS.g('ghToken','')||'').trim()}
function utf8b64(s){var b=new TextEncoder().encode(s),o='',CH=0x8000;
 for(var i=0;i<b.length;i+=CH)o+=String.fromCharCode.apply(null,b.subarray(i,i+CH));return btoa(o)}
function publish(){
 var c=repo(),tk=token();
 if(!tk)return Promise.reject(new Error('Jeton GitHub absent (Admin → 🔑 Jeton)'));
 var api='https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/access.json';
 return fetch(api+'?ref='+encodeURIComponent(c.branch),{headers:{Authorization:'Bearer '+tk,Accept:'application/vnd.github+json'}})
  .then(function(g){return g.ok?g.json():null}).then(function(cur){
   LIST.updated=Date.now();
   var body={message:'KEV FUSION · accès '+new Date().toISOString(),content:utf8b64(JSON.stringify(LIST,null,2)),branch:c.branch};
   if(cur&&cur.sha)body.sha=cur.sha;
   return fetch(api,{method:'PUT',headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify(body)})})
  .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);saveList();return true})}
function publishSafe(cb){
 publish().then(function(){toast('📡 access.json publié — le tiers est notifié en temps réel');snd('ok');if(cb)cb(true)})
  .catch(function(e){
   toast('⚠️ Publication impossible ('+e.message+') — access.json téléchargé, déposez-le à la racine du dépôt');
   try{var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(LIST,null,2)],{type:'application/json'}));
    a.download='access.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},6000);
    var c=repo();window.open('https://github.com/'+c.owner+'/'+c.repo+'/upload/'+c.branch,'_blank','noopener')}catch(e2){}
   if(cb)cb(false)})}
/* ══════════ Firebase optionnel ══════════ */
function fb(){try{
 if(!window.KF_FIREBASE||!KF_FIREBASE.enabled||!KF_FIREBASE.apiKey)return null;
 if(!window.firebase)return null;
 if(!fb._db){firebase.initializeApp(KF_FIREBASE);fb._db=firebase.firestore&&firebase.firestore()}
 return fb._db||null}catch(e){return null}}
function fbPush(req){var d=fb();if(!d)return;
 try{d.collection('accessRequests').doc(req.id).set({p:req.p,d:req.d,t:req.t,n:req.n,ch:req.ch,st:'pending'})}catch(e){}}
function fbPoll(){var d=fb();if(!d)return;
 try{d.collection('accessRequests').where('st','==','pending').get().then(function(snap){
  snap.forEach(function(doc){var v=doc.data();ingest({p:v.p,d:v.d,t:v.t,n:v.n},'cloud',v.id)})}).catch(function(){})}catch(e){}}
function fbSetStatus(id,st){var d=fb();if(!d)return;
 try{d.collection('accessRequests').doc(id).set({st:st},{merge:true})}catch(e){}}
/* ══════════ demandes : création / réception ══════════ */
function makeReq(p){var t=Date.now();
 var payload={p:p,d:DEVID,t:t,n:hash(p+DEVID+t).slice(0,6)};
 var code=b64e(payload);
 return{id:hash(p+'|'+DEVID),p:p,d:DEVID,t:t,n:payload.n,code:code,ch:'local',st:'pending',link:deepLink(code)}}
function ingest(payload,channel,forcedId){
 try{
  if(!payload||!payload.p)return null;
  var p=String(payload.p).trim();if(!p)return null;
  var id=forcedId||hash(p+'|'+(payload.d||''));
  var ex=null;for(var i=0;i<REQS.length;i++)if(REQS[i].id===id)ex=REQS[i];
  var st=ex?ex.st:'pending';
  var s=statusOf(p);if(s&&s.st==='granted')st='granted';
  var req=ex||{id:id};
  req.p=p;req.d=payload.d||'';req.t=+payload.t||Date.now();req.n=payload.n||'';
  req.ch=channel||req.ch||'lien';req.code=req.code||b64e({p:p,d:req.d,t:req.t,n:req.n});
  var isNew=!ex,reopened=ex&&ex.st==='refused'&&st==='pending';
  req.st=st;
  if(isNew)REQS.unshift(req);else REQS[REQS.indexOf(ex)]=req;
  saveReqs();
  if(isNew||reopened){CUR=id;MIN=false;notifyAdmin(req,channel);fbPush(req)}
  renderAll();
  return req;
 }catch(e){return null}}
function ingestCode(code,channel){var pl=b64d(code);
 if(!pl||!pl.p){toast('❌ Code de demande invalide');return null}
 return ingest(pl,channel||'collage')}
function readUrlReq(){
 try{var q=new URLSearchParams(location.search);
  var c=q.get('areq')||q.get('req');
  if(!c&&location.hash.indexOf('areq=')>=0)c=location.hash.split('areq=')[1].split('&')[0];
  if(c){var r=ingestCode(c,'lien profond');
   if(r){history.replaceState(null,'',location.pathname+location.search.replace(/[?&]areq=[^&]*/,''));
    toast('📥 Demande de '+r.p+' reçue')}}}catch(e){}}
window.addEventListener('storage',function(e){
 if(e.key==='kf_accessBroadcast'&&e.newValue){try{ingest(JSON.parse(e.newValue),'même appareil')}catch(x){}}});
if(bc){bc.onmessage=function(e){if(e.data&&e.data.p)ingest(e.data,'même appareil')}}
function broadcast(req){
 try{localStorage.setItem('kf_accessBroadcast',JSON.stringify({p:req.p,d:req.d,t:req.t,n:req.n}))}catch(e){}
 try{if(bc)bc.postMessage({p:req.p,d:req.d,t:req.t,n:req.n})}catch(e){}}
/* ══════════ notification admin ══════════ */
function notifyAdmin(req,channel){
 snd('req');buzz([140,70,140]);
 paintBadge();paintBanner();
 toast('🔔 Nouvelle demande d’accès : '+req.p);
 try{if(window.KFNotif&&KFNotif.push)KFNotif.push({title:'Demande d’accès — '+req.p,
  body:'Reçue par '+(channel||'—')+' · '+hhmm(req.t),kind:'access',reqId:req.id})}catch(e){}}
function paintBadge(){
 var n=pending().length,b=$('#admBtn');if(!b)return;
 var old=$('#accBadge');if(old&&old.parentNode)old.parentNode.removeChild(old);
 if(n>0){var s=document.createElement('span');s.id='accBadge';
  s.style.cssText='position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;border-radius:10px;background:#ff2d55;color:#fff;font:900 11px/20px system-ui;text-align:center;padding:0 5px;box-shadow:0 0 14px #ff2d55;z-index:5';
  s.textContent=n;b.style.position='relative';b.appendChild(s)}}
/* ══════════ BANNIÈRE PLEINE LARGEUR EN HAUT ══════════ */
function banner(){
 var b=$('#accBanner');
 if(!b){b=document.createElement('div');b.id='accBanner';
  if(document.body.firstChild)document.body.insertBefore(b,document.body.firstChild);
  else document.body.appendChild(b);
  b.addEventListener('click',function(e){
   var t=e.target.closest?e.target.closest('[data-accb]'):null;if(!t)return;
   var k=t.dataset.accb;
   if(k==='min'){MIN=true;paintBanner();return}
   if(k==='unmin'){MIN=false;paintBanner();return}
   if(k==='all'){openAdmin();return}
   if(k==='login'){openAdmin();return}
   if(k==='approve'){var r=curReq();if(r)approve(r);return}
   if(k==='refuse'){var r2=curReq();if(r2)refuse(r2);return}
   if(k==='revoke'){revoke(t.dataset.p);return}
   if(k==='next'){var ps=pending();var i=ps.findIndex(function(x){return x.id===CUR});
    CUR=(ps[(i+1)%ps.length]||{}).id||null;paintBanner();return}})}
 return b}
function curReq(){
 var ps=pending();if(!ps.length)return null;
 if(CUR){var c=ps.find(function(r){return r.id===CUR});if(c)return c}
 CUR=ps[0].id;return ps[0]}
function paintBanner(){
 var b=banner(),ps=pending(),adm=isAdmin();
 var granted=(LIST.granted||[]);
 if(!ps.length&&!granted.length){b.innerHTML='';b.style.display='none';setOffset(0);paintBadge();return}
 b.style.display='block';
 if(MIN){
  b.className='accb min';
  b.innerHTML='<button class="accb-minpill" data-accb="unmin">'+
   '<span class="accb-dot"></span><b>'+(ps.length?ps.length+' demande(s) d’accès':'Accès tiers')+'</b>'+
   '<em>▲</em></button>';
 }else{
  var r=curReq();
  b.className='accb'+(ps.length?' live':'');
  b.innerHTML=
   '<div class="accb-top">'+
    '<span class="accb-dot"></span>'+
    '<b class="accb-title">'+(ps.length?'🔔 DEMANDE D’ACCÈS TIERS':'🔓 ACCÈS TIERS ACTIFS')+'</b>'+
    (r?'<span class="accb-name">'+esc(r.p)+'</span>':'')+
    (r?'<span class="accb-meta">'+hhmm(r.t)+' · '+esc(r.ch||'—')+' · #'+esc(r.n||'')+'</span>':'')+
    (ps.length>1?'<button class="accb-next" data-accb="next" title="Demande suivante">⇄ '+(ps.length)+'</button>':'')+
    '<button class="accb-min" data-accb="min" title="Réduire">—</button>'+
   '</div>'+
   (r
    ?(adm
      ?'<div class="accb-actions">'+
        '<label class="accb-days">Durée<select id="accbDays">'+
         [7,30,90,180,365].map(function(d){return '<option value="'+d+'"'+(DAYS===d?' selected':'')+'>'+d+' j</option>'}).join('')+
        '</select></label>'+
        '<button class="accb-ok" data-accb="approve">✅ AUTORISER</button>'+
        '<button class="accb-ko" data-accb="refuse">❌ REFUSER</button>'+
        '<button class="accb-ln" data-accb="all">📋 File complète</button>'+
       '</div>'
      :'<div class="accb-actions">'+
        '<button class="accb-ok" data-accb="login">🛡️ SE CONNECTER EN ADMIN POUR AUTORISER</button>'+
        '<button class="accb-ln" data-accb="all">📋 Voir la demande</button>'+
       '</div>')
    :'')+
   (granted.length
    ?'<div class="accb-rev"><span class="accb-revl">🚫 RÉVOCATION — accès actifs :</span>'+
      '<div class="accb-chips">'+granted.map(function(g){
        return '<span class="accb-chip"><b>'+esc(g.prenom)+'</b><i>'+esc(g.exp||'∞')+'</i>'+
         '<button data-accb="revoke" data-p="'+esc(g.prenom)+'" title="Révoquer '+esc(g.prenom)+'">✕ RÉVOQUER</button></span>'}).join('')+
      '</div></div>'
    :'')+
   (ps.length>1&&r?'<div class="accb-more">+ '+(ps.length-1)+' autre(s) demande(s) en attente</div>':'');
  var sel=$('#accbDays');
  if(sel)sel.onchange=function(){DAYS=+sel.value;LS.s('accessDays',DAYS)};
 }
 /* offset sticky du topbar + nav */
 requestAnimationFrame(function(){
  var h=b.offsetHeight||0;setOffset(MIN?h:h);paintBadge()});
}
function setOffset(h){
 try{document.documentElement.style.setProperty('--accH',h+'px')}catch(e){}}
function openAdmin(){
 try{if(typeof switchView==='function')switchView('admin');else{var a=$('#admBtn');if(a)a.click()}}catch(e){}}
/* ══════════ autoriser / refuser / révoquer ══════════ */
function mutateList(p,action){
 var n=normP(p);
 LIST.granted=LIST.granted.filter(function(x){return normP(x.prenom)!==n});
 LIST.refused=LIST.refused.filter(function(x){return normP(x.prenom||x)!==n});
 LIST.revoked=LIST.revoked.filter(function(x){return normP(x.prenom||x)!==n});
 if(action==='grant')LIST.granted.push({prenom:String(p).trim(),exp:plusDays(DAYS),since:Date.now()});
 if(action==='refuse')LIST.refused.push({prenom:String(p).trim(),since:Date.now()});
 if(action==='revoke')LIST.revoked.push({prenom:String(p).trim(),since:Date.now()});
 saveList()}
function setReqStatus(id,st){var r=REQS.find(function(x){return x.id===id});if(r){r.st=st;saveReqs()}fbSetStatus(id,st)}
function approve(req){
 if(!isAdmin()){toast('🛡️ Connectez-vous en admin pour autoriser');openAdmin();return}
 mutateList(req.p,'grant');setReqStatus(req.id,'granted');
 if(CUR===req.id)CUR=null;
 snd('ok');buzz(80);toast('✅ '+req.p+' autorisé '+DAYS+' jours');
 publishSafe(function(){broadcast(req);renderAll()});
 renderAll()}
function refuse(req){
 if(!isAdmin()){openAdmin();return}
 mutateList(req.p,'refuse');setReqStatus(req.id,'refused');
 if(CUR===req.id)CUR=null;
 snd('no');toast('❌ '+req.p+' refusé');
 publishSafe(function(){renderAll()});
 renderAll()}
function revoke(p){
 if(!isAdmin()){openAdmin();return}
 mutateList(p,'revoke');
 var r=REQS.find(function(x){return x.p===p});if(r)setReqStatus(r.id,'revoked');
 snd('no');buzz([60,40,60]);toast('🚫 Accès de '+p+' révoqué');
 publishSafe(function(){renderAll()});
 renderAll()}
function renderAll(){paintBanner();paintBadge();renderQueue();renderAdminPanel()}
/* ══════════ envoi côté tiers ══════════ */
function sendRequest(p){
 var req=makeReq(p);
 LS.s('myPrenom',p);LS.s('myReq',req.code);
 var msg='🔑 Demande d\'accès KEV FUSION\nPrénom : '+p+'\nCode : '+req.code+'\nTraiter : '+req.link;
 ingest({p:req.p,d:req.d,t:req.t,n:req.n,code:req.code},'local');
 broadcast(req);fbPush(req);
 var tel='',mail='';var c=contact();
 if(c){if(/^[\d+.\s-]{6,}$/.test(c))tel=c.replace(/[^\d+]/g,'');else if(c.indexOf('@')>0)mail=c}
 var box=$('#accSend');
 if(box){box.innerHTML='<div class="acc-send">'+
  '<p class="mut"><b>Demande prête.</b> L’admin voit immédiatement la bannière d’autorisation s’il ouvre le lien.</p>'+
  '<div class="acc-code"><code>'+esc(req.code)+'</code>'+
   '<button class="acc-lnk" data-acc="copycode">📋 Code</button>'+
   '<button class="acc-lnk" data-acc="copylink">🔗 Lien</button></div>'+
  '<div class="acc-links"><button class="acc-lnk pri" data-acc="share">📤 Partager</button>'+
   (tel?'<a class="acc-lnk" href="sms:'+tel+'?body='+encodeURIComponent(msg)+'">💬 SMS</a>'+
    '<a class="acc-lnk" href="https://wa.me/'+tel.replace('+','')+'?text='+encodeURIComponent(msg)+'" target="_blank" rel="noopener">🟢 WhatsApp</a>':'')+
   (mail?'<a class="acc-lnk" href="mailto:'+mail+'?subject='+encodeURIComponent('Demande d\'accès KEV FUSION')+'&body='+encodeURIComponent(msg)+'">✉️ Mail</a>':'')+
  '</div><p class="acc-state wait" id="accState">⏳ En attente de l’administrateur…</p></div>'}
 startPoll();return req}
/* ══════════ poll statut tiers ══════════ */
function startPoll(){if(pollT)return;tickStatus();pollT=setInterval(tickStatus,8000);
 window.addEventListener('focus',tickStatus)}
function tickStatus(){
 pull().then(function(){
  var p=LS.g('myPrenom',''),el=$('#accState');
  if(p&&el){var s=statusOf(p);
   el.textContent=s?s.label:'⏳ En attente de l’administrateur…';
   el.className='acc-state '+(s?s.st:'wait');
   if(s&&s.st==='granted'){LS.s('access',{prenom:p,exp:s.exp});enterAppSafe()}}
  var my=LS.g('myReq','');
  if(my&&el){var r=REQS.find(function(x){return x.code===my});
   if(r&&r.st!=='pending'){el.textContent=r.st==='granted'?'✅ Autorisé':r.st==='refused'?'❌ Refusé':'🚫 Révoqué';
    el.className='acc-state '+r.st}}
  renderAll()})}
function enterAppSafe(){try{if(typeof enterApp==='function')enterApp()}catch(e){location.reload()}}
/* ══════════ gate ══════════ */
function renderGate(){
 var g=$('#gate');if(!g)return;
 var my=LS.g('myPrenom','');
 g.innerHTML=
 '<div class="card gatehead"><h1>🔑 KEV FUSION 2026</h1>'+
 '<p class="mut">Accès tiers par prénom · bannière d’autorisation admin en tête d’application.</p></div>'+
 '<div class="access-choice">'+
  '<div class="card tier"><h2>👤 Tiers</h2>'+
   '<label for="gPrenom">Ton prénom</label>'+
   '<input id="gPrenom" maxlength="24" autocomplete="given-name" placeholder="Ex. Thomas" value="'+esc(my)+'">'+
   '<div class="row"><button class="pri" data-act="reqAccess">📨 Demander l’accès</button>'+
   '<button data-acc="enter">➡️ Entrer</button></div>'+
   '<div id="accSend"></div>'+
   '<p class="mut" style="margin-top:8px">Un seul mot : ton prénom. Le lien transmis ouvre l’application de l’admin directement sur la bannière d’autorisation.</p>'+
  '</div>'+
  '<div class="card admpanel"><div class="admhead"><span class="admshield">🛡️</span><div><b>Administrateur</b>'+
   '<p class="mut">Mot de passe · file de demandes · autorisation en 1 geste</p></div></div>'+
   '<label for="gPass">Mot de passe</label>'+
   '<div class="pwrow"><input id="gPass" type="password" autocomplete="current-password" placeholder="Mot de passe admin">'+
   '<button type="button" class="eye" data-acc="mask">👁</button></div>'+
   '<div class="row"><button class="pri" data-act="adminLogin">🔑 Connexion</button></div>'+
   '<div id="accAdmin"></div>'+
  '</div></div>';
 var inp=$('#gPrenom');
 if(inp)inp.addEventListener('input',function(){LS.s('myPrenom',inp.value.trim());tickStatus()});
 var eb=g.querySelector('[data-acc="enter"]');if(eb)eb.addEventListener('click',doValCode);
 var mb=g.querySelector('[data-acc="mask"]');
 if(mb)mb.addEventListener('click',function(){var i=$('#gPass');if(!i)return;
  var m=i.type==='password';i.type=m?'text':'password';mb.textContent=m?'👁':'🙈'});
 bindGateActions(g);
 if(my)startPoll();
 renderAdminPanel();renderQueue()}
function bindGateActions(root){
 root.addEventListener('click',function(e){
  var t=e.target.closest?e.target.closest('[data-acc]'):null;if(!t)return;
  var k=t.dataset.acc;
  if(k==='copycode'){var r=lastReq();if(r)copy(r.code,'Code copié');return}
  if(k==='copylink'){var r2=lastReq();if(r2)copy(r2.link,'Lien copié — envoyez-le à l’admin');return}
  if(k==='share'){var r3=lastReq();if(!r3)return;
   var msg='🔑 Demande d\'accès KEV FUSION\nPrénom : '+r3.p+'\nCode : '+r3.code+'\nTraiter : '+r3.link;
   if(navigator.share)navigator.share({title:'Demande d\'accès KEV FUSION',text:msg,url:r3.link}).catch(function(){});
   else copy(msg,'Message copié');return}})}
function lastReq(){var p=LS.g('myPrenom','');
 return REQS.find(function(r){return r.p===p&&r.d===DEVID})||REQS.find(function(r){return r.d===DEVID})}
function copy(txt,msg){try{navigator.clipboard.writeText(txt).then(function(){toast('📋 '+msg)})}catch(e){toast(txt)}}
/* ══════════ console admin (file) ══════════ */
function renderAdminPanel(){
 var host=$('#accAdmin');if(!host)return;
 host.innerHTML=
 '<div class="acc-queue-h"><b>📥 File de demandes</b><span class="acc-qcount">'+pending().length+' en attente</span></div>'+
 '<div class="acc-paste"><input id="accPaste" placeholder="Coller un code de demande reçu (SMS/mail)">'+
  '<button class="acc-lnk" data-accq="paste">➕ Ajouter</button></div>'+
 queueHtml()+
 '<div class="acc-tools"><label>Durée d’accès <select id="accDays">'+
  [7,30,90,180,365].map(function(d){return '<option value="'+d+'"'+(DAYS===d?' selected':'')+'>'+d+' jours</option>'}).join('')+
  '</select></label>'+
  '<button class="acc-lnk" data-accq="refresh">↻ Actualiser</button>'+
  '<button class="acc-lnk" data-accq="sound">'+(AU.on?'🔊 Son':'🔇 Muet')+'</button></div>'+
 grantedHtml()}
function queueHtml(){
 var ps=pending();
 if(!ps.length)return '<p class="mut acc-empty">Aucune demande en attente.</p>';
 return '<div class="acc-queue">'+ps.map(function(r){
  return '<div class="acc-qitem"><div class="acc-qid"><b>'+esc(r.p)+'</b>'+
   '<span>'+hhmm(r.t)+' · '+esc(r.ch||'—')+' · #'+esc(r.n||'')+'</span></div>'+
   '<div class="acc-qa">'+
    '<button class="ok" data-accq="approve" data-id="'+r.id+'">✅ AUTORISER</button>'+
    '<button class="ko" data-accq="refuse" data-id="'+r.id+'">❌ REFUSER</button>'+
    '<button class="ln" data-accq="copylink" data-id="'+r.id+'">🔗</button>'+
   '</div></div>'}).join('')+'</div>'}
function grantedHtml(){
 var g=LIST.granted||[];if(!g.length)return '';
 return '<div class="acc-granted"><b>🚫 RÉVOCATION — accès actifs ('+g.length+')</b><div class="acc-glist">'+
  g.map(function(x){return '<div class="acc-gitem"><span><b>'+esc(x.prenom)+'</b> → '+esc(x.exp||'∞')+'</span>'+
   '<button class="ko" data-accq="revoke" data-p="'+esc(x.prenom)+'">🚫 RÉVOQUER</button></div>'}).join('')+
  '</div></div>'}
function renderQueue(){if($('#accAdmin'))renderAdminPanel()}
function bindAdmin(root){
 if(!root||root._aq)return;root._aq=1;
 root.addEventListener('click',function(e){
  var t=e.target.closest?e.target.closest('[data-accq]'):null;if(!t)return;
  var k=t.dataset.accq,id=t.dataset.id,p=t.dataset.p;
  var req=REQS.find(function(r){return r.id===id});
  if(k==='paste'){var i=$('#accPaste');if(i&&i.value.trim()){ingestCode(i.value.trim(),'collage');i.value=''}return}
  if(k==='refresh'){pull().then(renderAll);return}
  if(k==='sound'){AU.on=!AU.on;LS.s('accSound',AU.on);renderAdminPanel();return}
  if(k==='approve'&&req)approve(req);
  else if(k==='refuse'&&req)refuse(req);
  else if(k==='revoke'&&p)revoke(p);
  else if(k==='copylink'&&req)copy(req.link,'Lien de traitement copié')});
 var sel=$('#accDays');if(sel)sel.onchange=function(){DAYS=+sel.value;LS.s('accessDays',DAYS);paintBanner()}}
function hookAdmin(){
 if(typeof window.renderAdmin!=='function'||window.renderAdmin.__acc)return;
 var _ra=window.renderAdmin;
 var w=function(){_ra.apply(this,arguments);
  var v=$('#view');if(!v)return;
  if(!$('#accAdminView')){var d=document.createElement('div');d.id='accAdminView';
   d.className='card gold';d.innerHTML='<h2>👥 Demandes d’accès tiers</h2><div id="accAdmin"></div>';
   v.appendChild(d)}
  renderAdminPanel();bindAdmin(v)};
 w.__acc=true;window.renderAdmin=w}
/* ══════════ compat app.js ══════════ */
window.validAccess=async function(a){if(!a||!a.prenom)return false;
 await pull();var s=statusOf(a.prenom);return !!(s&&s.st==='granted')};
window.doRequest=function(){
 var el=$('#gPrenom');var p=el?el.value.trim():'';
 if(!p){toast('Indique ton prénom');if(el)el.focus();return}
 var r=sendRequest(p);toast('📨 Demande de '+p+' préparée');snd('req');return r};
window.doValCode=function(){
 var el=$('#gPrenom')||$('#gCode');var p=el?el.value.trim():'';
 if(!p){toast('Indique ton prénom');return}
 pull().then(function(){var s=statusOf(p);
  if(s&&s.st==='granted'){LS.s('myPrenom',p);LS.s('access',{prenom:p,exp:s.exp});enterAppSafe();toast('✅ Bienvenue '+p)}
  else if(s)toast(s.label);
  else sendRequest(p)})};
/* ══════════ CSS ══════════ */
function css(){if($('#accCss'))return;var s=document.createElement('style');s.id='accCss';
 s.textContent=
 /* bannière */
 ':root{--accH:0px}'+
 '#accBanner{position:sticky;top:0;z-index:600;display:none;width:100%;'+
  'background:linear-gradient(135deg,#2a0710 0%,#3d0a18 40%,#1a0b26 100%);'+
  'border-bottom:2px solid #ff2d55;box-shadow:0 10px 34px #000d,0 0 0 1px #ff2d5544;'+
  'font-family:system-ui,sans-serif}'+
 '#accBanner.live{animation:accGlow 2.2s ease-in-out infinite}'+
 '@keyframes accGlow{0%,100%{box-shadow:0 10px 34px #000d,0 0 0 1px #ff2d5544}50%{box-shadow:0 10px 40px #000d,0 0 26px #ff2d5588}}'+
 '#topbar{top:var(--accH,0px)!important}'+
 'nav#nav{top:calc(56px + var(--accH,0px))!important}'+
 '.accb-top{display:flex;align-items:center;gap:10px;padding:11px 14px;flex-wrap:wrap}'+
 '.accb-dot{width:13px;height:13px;border-radius:50%;background:#ff2d55;box-shadow:0 0 16px #ff2d55;flex:none;animation:accP 1.2s ease-in-out infinite}'+
 '@keyframes accP{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6}}'+
 '.accb-title{font:900 13px/1 system-ui;letter-spacing:1.4px;color:#ffd7e0}'+
 '.accb-name{font:900 19px/1 system-ui;color:#fff;background:linear-gradient(90deg,#ff2d55,#ff7a1a);'+
  'padding:7px 13px;border-radius:11px;letter-spacing:.3px;text-transform:capitalize}'+
 '.accb-meta{font:600 10.5px/1 ui-monospace,monospace;color:#c98fa0}'+
 '.accb-next{background:#ff2d5522;border:1px solid #ff2d55;color:#ffd7e0;border-radius:9px;padding:5px 9px;font-size:11px;font-weight:800;cursor:pointer}'+
 '.accb-min{margin-left:auto;background:none;border:1px solid #ff2d5566;color:#c98fa0;border-radius:8px;padding:4px 10px;font-size:13px;cursor:pointer}'+
 '.accb-minpill{display:flex;align-items:center;gap:9px;width:100%;padding:9px 14px;background:none;border:0;cursor:pointer;color:#ffd7e0}'+
 '.accb-minpill b{font:900 12px/1 system-ui;letter-spacing:1px}'+
 '.accb-minpill em{margin-left:auto;font-style:normal}'+
 '.accb-actions{display:flex;gap:9px;padding:0 14px 12px;flex-wrap:wrap;align-items:stretch}'+
 '.accb-days{display:flex;align-items:center;gap:7px;font:800 10px/1 system-ui;letter-spacing:.6px;color:#c98fa0;text-transform:uppercase}'+
 '.accb-days select{margin:0;padding:11px 10px;font-size:13px;font-weight:800;border-radius:11px;border:1px solid #ff2d5566;background:#1a0b16;color:#fff;cursor:pointer}'+
 '.accb-ok{flex:1;min-width:150px;padding:14px 18px;font:900 15px/1 system-ui;letter-spacing:.6px;border-radius:13px;cursor:pointer;'+
  'border:2px solid #22c55e;background:linear-gradient(135deg,#22c55e,#a3e635);color:#04140c;'+
  'box-shadow:0 6px 20px #22c55e55;transition:.15s}'+
 '.accb-ok:hover{transform:translateY(-2px);box-shadow:0 10px 26px #22c55e77}'+
 '.accb-ko{flex:1;min-width:120px;padding:14px 18px;font:900 15px/1 system-ui;letter-spacing:.6px;border-radius:13px;cursor:pointer;'+
  'border:2px solid #ef4444;background:#ef444418;color:#ff8f9d;transition:.15s}'+
 '.accb-ko:hover{background:#ef444433;transform:translateY(-2px)}'+
 '.accb-ln{padding:14px 15px;font:800 12px/1 system-ui;border-radius:13px;cursor:pointer;border:1px solid #ff2d5566;background:none;color:#ffd7e0}'+
 '.accb-rev{padding:0 14px 12px}'+
 '.accb-revl{display:block;font:900 10px/1 system-ui;letter-spacing:1.1px;color:#ff9db0;margin-bottom:7px;text-transform:uppercase}'+
 '.accb-chips{display:flex;gap:7px;flex-wrap:wrap}'+
 '.accb-chip{display:flex;align-items:center;gap:7px;border:1px solid #334466;border-radius:12px;background:#0f1625;padding:6px 8px}'+
 '.accb-chip b{font-size:12.5px;color:#e8eefc;text-transform:capitalize}'+
 '.accb-chip i{font-style:normal;font-size:10px;color:#8899b4}'+
 '.accb-chip button{border:1px solid #ef4444;background:#ef444418;color:#ff8f9d;border-radius:9px;padding:6px 9px;font:900 10px/1 system-ui;cursor:pointer}'+
 '.accb-chip button:hover{background:#ef444433}'+
 '.accb-more{padding:0 14px 11px;font:700 10.5px/1 system-ui;color:#c98fa0}'+
 '#accBanner.min{border-bottom-width:1px}'+
 /* gate / file */
 '.acc-send{margin-top:10px;padding:12px;border:1px dashed #334466;border-radius:12px;background:#0f1625}'+
 '.acc-code{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:9px 0}'+
 '.acc-code code{font-family:ui-monospace,monospace;font-size:11px;background:#04140c;border:1px solid #22c55e44;color:#a3e635;padding:6px 9px;border-radius:8px;word-break:break-all;flex:1;min-width:140px}'+
 '.acc-links{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}'+
 '.acc-lnk{display:inline-block;padding:8px 12px;border-radius:10px;border:1px solid #22c55e;color:#22c55e;background:#22c55e14;font-size:12.5px;font-weight:700;text-decoration:none;cursor:pointer}'+
 '.acc-lnk:hover{background:#22c55e26}'+
 '.acc-lnk.pri{background:linear-gradient(135deg,#22c55e,#a3e635);border-color:#22c55e;color:#04140c}'+
 '.acc-state{font-size:13px;font-weight:700;margin-top:8px}'+
 '.acc-state.granted{color:#22c55e}.acc-state.refused,.acc-state.revoked{color:#ef4444}'+
 '.acc-state.expired{color:#f59e0b}.acc-state.wait{color:#8899b4}'+
 '.acc-queue-h{display:flex;align-items:center;gap:10px;margin:14px 0 8px}'+
 '.acc-queue-h b{font-size:13px;color:#e8eefc}'+
 '.acc-qcount{font:800 10px/1 system-ui;color:#04140c;background:#ff4d6d;padding:5px 8px;border-radius:12px}'+
 '.acc-paste{display:flex;gap:7px;margin-bottom:10px}'+
 '.acc-paste input{flex:1;margin:0;padding:8px 10px;font-size:12px;font-family:ui-monospace,monospace;background:#0f1625;border:1px solid #334466;color:#e8eefc;border-radius:9px}'+
 '.acc-queue{display:flex;flex-direction:column;gap:8px}'+
 '.acc-qitem{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:10px 12px;border:1px solid #ff4d6d55;border-left:3px solid #ff4d6d;border-radius:11px;background:#ff4d6d0a}'+
 '.acc-qid b{display:block;font-size:13.5px;color:#e8eefc}'+
 '.acc-qid span{display:block;font-size:10.5px;color:#8899b4;margin-top:2px}'+
 '.acc-qa{display:flex;gap:6px}'+
 '.acc-qa button{padding:9px 12px;font-size:11.5px;font-weight:900;border-radius:9px;cursor:pointer;border:1px solid #334466;background:#0f1625;color:#c4cfe0}'+
 '.acc-qa .ok{background:linear-gradient(135deg,#22c55e,#a3e635);border-color:#22c55e;color:#04140c}'+
 '.acc-qa .ko{border-color:#ef4444;color:#ef4444;background:#ef444412}'+
 '.acc-qa .ln{border-color:#38bdf8;color:#38bdf8}'+
 '.acc-empty{font-size:12px;color:#8899b4;padding:8px 0}'+
 '.acc-tools{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:12px}'+
 '.acc-tools label{font-size:10px;color:#8899b4;margin:0}'+
 '.acc-tools select{margin:0;padding:7px 9px;font-size:12px;background:#0f1625;border:1px solid #334466;color:#e8eefc;border-radius:9px}'+
 '.acc-granted{margin-top:14px;border-top:1px dashed #334466;padding-top:10px}'+
 '.acc-granted>b{display:block;font-size:12px;color:#ff8f9d;margin-bottom:8px}'+
 '.acc-glist{display:flex;flex-direction:column;gap:6px}'+
 '.acc-gitem{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 10px;border:1px solid #25314a;border-radius:10px;background:#0f1625;font-size:12px}'+
 '.acc-gitem b{color:#e8eefc}'+
 '.acc-gitem button{padding:6px 10px;font-size:11px;font-weight:900;border-radius:8px;border:1px solid #ef4444;color:#ef4444;background:#ef444412;cursor:pointer}';
 document.head.appendChild(s)}
/* ══════════ boot ══════════ */
function boot(){
 css();hookAdmin();
 readUrlReq();
 renderGate();
 renderAll();
 startPoll();
 setInterval(fbPoll,8000);
 setInterval(function(){renderAll()},4000);
 window.addEventListener('resize',function(){paintBanner()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFAccess={pull:pull,publish:publish,approve:approve,refuse:refuse,revoke:revoke,
 ingest:ingest,ingestCode:ingestCode,requests:function(){return REQS},pending:pending,
 status:statusOf,list:function(){return LIST},render:renderGate,renderQueue:renderQueue,
 banner:paintBanner,send:sendRequest};
})();
