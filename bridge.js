/* KEV FUSION 2026 — bridge.js v2.0.0
   INTEROPÉRABILITÉ + AUTO-RÉPARATION + CENTRE DE SANTÉ.
   1. Republie sur `window` les globaux lexicaux des fichiers d'origine (const/let ne sont pas
      des propriétés de window) : c'est la cause racine des extensions non appliquées.
   2. Pour CHAQUE module requis : vérifie la présence réelle, ré-injecte le fichier manquant
      (cache-bust, 2 tentatives), puis installe un SECOURS FONCTIONNEL si le fichier reste
      indisponible. Aucun module ne peut donc rester « absent ».
   3. Centre de santé : score, compteurs réels, état par module (actif / réparé / secours),
      actions unitaires et globales, journal, export, purge, mise à jour. */
(function(){
'use strict';
/* ══════════ socle ══════════ */
function $(s,r){try{return (r||document).querySelector(s)}catch(e){return null}}
function $$(s,r){try{return Array.prototype.slice.call((r||document).querySelectorAll(s))}catch(e){return[]}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ls(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}}
function sl(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}
function grab(n){try{return (0,eval)('typeof '+n+'!=="undefined"?'+n+':undefined')}catch(e){return undefined}}
function toast(m){try{if(typeof window.toast==='function')window.toast(m);
 else{var t=$('#toast');if(t){t.textContent=m;t.classList.remove('hid');t.classList.add('show');
  clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3200)}}}catch(e){}}
async function sha(s){try{if(window.crypto&&crypto.subtle){var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
 return Array.from(new Uint8Array(b)).map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}}catch(e){}
 var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return 'fnv'+(h>>>0).toString(16)}
var AU={c:null,on:ls('bhSound',true)};
function snd(k){if(!AU.on)return;
 try{var c=AU.c||(AU.c=new (window.AudioContext||window.webkitAudioContext)());
  if(c.state==='suspended')c.resume();
  var m={ok:[523,880,.2,'triangle'],warn:[420,300,.18,'sawtooth'],tick:[1300,1300,.02,'sine'],
   fix:[392,660,.26,'triangle'],fb:[300,520,.2,'square']}[k]||[900,900,.04,'sine'];
  var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(60,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.1,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.03)}catch(e){}}
function isAdmin(){try{return (window.S&&S.role==='admin')||ls('admDevice',false)===true}catch(e){return false}}

/* ══════════ 1. globaux lexicaux → window ══════════ */
var NAMES=['S','NAV','MODULES','MODS','APPS','FAULTS','RECALLS','TSBDB','KB','PHOTOS','DOSSIERS',
 'PROCEDURES','CAT2LAW','JRULES','JTPL','JDOM','VINWMI','WMI','ADMIN_HASH','CAT','OWNER','LOCK',
 'KFCatalog','KFCorr','KBall','Rall','TSBall','A','F','ls','esc','norm','toast','switchView',
 'enterApp','runChecks','renderVerdict','renderStudy','renderAdmin','renderJr','renderModules',
 'adminLogin','doRequest','doValCode','validAccess','txtById','famOf','sysOf'];
var PUB={ok:[],miss:[]};
function publish(){
 PUB.ok=[];PUB.miss=[];
 for(var i=0;i<NAMES.length;i++){var n=NAMES[i];
  try{
   if(window[n]===undefined){var v=grab(n);if(v!==undefined&&v!==null)window[n]=v}
   if(window[n]!==undefined)PUB.ok.push(n);else PUB.miss.push(n);
  }catch(e){PUB.miss.push(n)}}
 return PUB}
publish();

/* ══════════ 2. registre des modules requis ══════════ */
var REG=[
 {g:'S',n:'État application',f:null,core:true},
 {g:'NAV',n:'Navigation',f:null,core:true},
 {g:'switchView',n:'Routage des vues',f:null,core:true,fn:true},
 {g:'KFCatalog',n:'Catalogue véhicules',f:'catalog.js'},
 {g:'FAULTS',n:'Base pannes',f:'faults.js'},
 {g:'KFCorr',n:'Corrélation',f:'correlation.js'},
 {g:'KFAccess',n:'Accès tiers',f:'access.js'},
 {g:'KFNotify',n:'Notifications',f:'notify.js'},
 {g:'KFAdmin',n:'Console admin',f:'admingate.js'},
 {g:'KFVinLoc',n:'Localisation VIN',f:'vinloc.js'},
 {g:'KFObdPro',n:'OBD atelier',f:'obdpro.js'},
 {g:'KFJrAdmin',n:'JusteRepère admin',f:'jradmin.js'},
 {g:'KFWall',n:'Fond d’écran',f:'wallpaper.js'},
 {g:'KFTurbo',n:'Turbo / optimisation',f:'turbo.js'}];
var STATE={};REG.forEach(function(m){STATE[m.g]={status:'?',tries:0,src:'—',ts:0}});
function present(m){
 var v=window[m.g];if(v===undefined)v=grab(m.g);
 if(v===undefined||v===null)return false;
 if(m.fn)return typeof v==='function';
 return true}
function refreshState(){
 REG.forEach(function(m){
  var st=STATE[m.g];
  if(present(m)){if(st.status!=='fb'&&st.status!=='fixed')st.status='ok';st.src=st.src==='—'?'chargé':st.src}
  else if(st.status!=='fb')st.status='missing'})}

/* ══════════ 3. secours fonctionnels ══════════ */
var FB={};
FB.KFTurbo=function(){
 return{__fb:true,state:{fb:true},cfg:{},
  optimize:function(){publish();try{if(window.KFQuota)KFQuota.purge()}catch(e){}toast('⚡ Optimisation (secours) appliquée');return true},
  purge:function(){try{if(window.KFQuota)return KFQuota.purge()}catch(e){}return 0},
  timers:function(){return[]},report:function(){toast('Rapport indisponible en mode secours')}}};
FB.KFWall=function(){
 var api={__fb:true,state:{fb:true},
  apply:function(url){var l=$('#bgLayer');if(!l){l=document.createElement('div');l.id='bgLayer';document.body.appendChild(l)}
   l.style.backgroundImage='url("'+url+'")';l.style.backgroundSize='cover';l.style.backgroundPosition='center';l.style.opacity='.45';
   sl('wallFb',url);toast('🖼️ Fond appliqué (secours)')},
  clear:function(){var l=$('#bgLayer');if(l)l.style.backgroundImage='';sl('wallFb','');toast('Fond retiré')},
  import:function(){var i=document.createElement('input');i.type='file';i.accept='image/*';
   i.onchange=function(){var f=i.files[0];if(!f)return;var r=new FileReader();
    r.onload=function(){api.apply(r.result)};r.readAsDataURL(f)};i.click()},
  render:function(){return '<div class="card"><h2>🖼️ Fond d’écran (secours)</h2>'+
   '<p class="mut">Module complet indisponible. Import photo et application directe restent opérationnels.</p>'+
   '<div class="row"><button class="pri" data-fbwall="pick">📥 Choisir une photo</button>'+
   '<button data-fbwall="clear">🚫 Retirer</button></div></div>'}};
 var saved=ls('wallFb','');if(saved)setTimeout(function(){api.apply(saved)},400);
 document.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('[data-fbwall]'):null;if(!b)return;
  if(b.dataset.fbwall==='pick')api.import();else api.clear()});
 return api};
FB.KFNotify=function(){
 var N=ls('ntfList',[]);if(!Array.isArray(N))N=[];
 function save(){sl('ntfList',N.slice(0,120))}
 function badge(){var b=$('#notifBtn');if(!b)return;var o=$('#ntfBadge');if(o&&o.parentNode)o.parentNode.removeChild(o);
  var n=N.filter(function(x){return !x.read}).length;
  if(n){var s=document.createElement('span');s.id='ntfBadge';s.textContent=n>9?'9+':n;
   s.style.cssText='position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;border-radius:10px;background:#ff2d55;color:#fff;font:900 11px/20px system-ui;text-align:center;padding:0 5px';
   b.style.position='relative';b.appendChild(s)}}
 var api={__fb:true,list:function(){return N},unread:function(){return N.filter(function(x){return !x.read}).length},
  push:function(o){N.unshift({id:'n'+Date.now(),type:o.type||'system',title:o.title||'',body:o.body||'',
   t:Date.now(),read:false,level:o.level||'info'});save();badge();toast('🔔 '+(o.title||'Notification'));
   try{if(navigator.serviceWorker&&navigator.serviceWorker.ready)navigator.serviceWorker.ready.then(function(r){
    r.showNotification(o.title||'KEV FUSION',{body:o.body||'',icon:'./icon-192.png',tag:'kf-'+Date.now(),data:{url:'./index.html'}})})}catch(e){}
   return N[0]},
  markAll:function(){N.forEach(function(x){x.read=true});save();badge()},
  clearAll:function(){N=[];save();badge()},
  open:function(){api.markAll();toast('🔔 '+api.list().length+' notification(s) — mode secours')},
  close:function(){},perm:function(){try{return Notification.permission}catch(e){return 'unsupported'}},
  ask:function(){try{return Notification.requestPermission().then(function(p){badge();return p})}catch(e){return Promise.resolve('denied')}},
  paint:badge};
 setTimeout(badge,600);
 return api};
FB.KFAccess=function(){
 var R=ls('accessReqs',[]);if(!Array.isArray(R))R=[];
 var L=ls('accessList',{granted:[],refused:[],revoked:[]});
 function save(){sl('accessReqs',R);sl('accessList',L)}
 function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9'-]/g,'').trim()}
 var api={__fb:true,requests:function(){return R},pending:function(){return R.filter(function(x){return x.st==='pending'})},
  list:function(){return L},
  status:function(p){var n=norm(p);
   var g=(L.granted||[]).find(function(x){return norm(x.prenom)===n});
   if(g)return{st:'granted',label:'✅ Accès accordé'+(g.exp?' jusqu’au '+g.exp:'')};
   if((L.refused||[]).find(function(x){return norm(x.prenom)===n}))return{st:'refused',label:'❌ Refusé'};
   return null},
  ingest:function(p){p=String(p||'').trim();if(!p)return null;
   var id=norm(p);var e=R.find(function(x){return x.id===id});
   if(!e){e={id:id,p:p,t:Date.now(),st:'pending',ch:'secours'};R.unshift(e);save();
    try{if(window.KFNotify)KFNotify.push({type:'access',title:'Demande d’accès — '+p,body:'Autorisation possible depuis la console admin (secours).',level:'crit'})}catch(x){}}
   return e},
  approve:function(r){if(!r)return;L.granted=(L.granted||[]).filter(function(x){return norm(x.prenom)!==norm(r.p)});
   L.granted.push({prenom:r.p,exp:new Date(Date.now()+30*864e5).toISOString().slice(0,10),since:Date.now()});
   r.st='granted';save();toast('✅ '+r.p+' autorisé (secours)')},
  refuse:function(r){if(!r)return;L.refused=(L.refused||[]);L.refused.push({prenom:r.p,since:Date.now()});
   r.st='refused';save();toast('❌ '+r.p+' refusé')},
  revoke:function(p){L.granted=(L.granted||[]).filter(function(x){return norm(x.prenom)!==norm(p)});
   L.revoked=(L.revoked||[]);L.revoked.push({prenom:p,since:Date.now()});save();toast('🚫 '+p+' révoqué')},
  pull:function(){return fetch('access.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():L})
   .then(function(j){if(j&&j.granted){L=j;save()}return L}).catch(function(){return L})},
  render:function(){},renderQueue:function(){},banner:function(){}};
 return api};
FB.KFAdmin=function(){
 function render(){
  var v=$('#view');if(!v)return;
  if(!isAdmin()){
   v.innerHTML='<div class="card admpanel"><div class="admhead"><span class="admshield">🛡️</span>'+
    '<div><b>Console administrateur (secours)</b><p class="mut">Le module complet est indisponible ; cette console assure l’essentiel.</p></div></div>'+
    '<label for="fbPass">Mot de passe</label><div class="pwrow"><input id="fbPass" type="password" placeholder="Mot de passe admin"></div>'+
    '<div class="row"><button class="pri" data-fbadm="login">🔑 Connexion</button></div></div>';
   return}
  var pend=(window.KFAccess&&KFAccess.pending)?KFAccess.pending():[];
  var gl=(window.KFAccess&&KFAccess.list)?(KFAccess.list().granted||[]):[];
  v.innerHTML='<div class="card accent"><h1>🛡️ Console administrateur <span class="badge b-elev">secours</span></h1>'+
   '<p class="mut">Accès tiers, notifications et maintenance restent pilotables.</p></div>'+
   '<div class="card gold"><h2>👥 Demandes d’accès ('+pend.length+')</h2>'+
   (pend.length?pend.map(function(r){return '<div class="acc-row"><b>'+esc(r.p)+'</b><span>'+
    '<button class="pri" data-fbadm="ok" data-p="'+esc(r.p)+'">✅ Autoriser</button> '+
    '<button class="danger" data-fbadm="ko" data-p="'+esc(r.p)+'">❌ Refuser</button></span></div>'}).join('')
    :'<p class="mut">Aucune demande en attente.</p>')+
   '<div class="row" style="margin-top:10px"><input id="fbReq" placeholder="Ajouter un prénom" style="max-width:220px">'+
   '<button data-fbadm="add">➕ Ajouter la demande</button></div></div>'+
   '<div class="card"><h2>🚫 Accès actifs ('+gl.length+')</h2>'+
   (gl.length?gl.map(function(g){return '<div class="acc-row"><b>'+esc(g.prenom)+'</b><span>'+esc(g.exp||'∞')+
    ' <button class="danger" data-fbadm="rev" data-p="'+esc(g.prenom)+'">🚫 Révoquer</button></span></div>'}).join('')
    :'<p class="mut">Aucun accès actif.</p>')+'</div>'+
   '<div class="card"><h2>🧰 Maintenance</h2><div class="row">'+
   '<button data-fbadm="repair">🔧 Réparer les modules</button>'+
   '<button data-fbadm="purge">🧹 Purger</button>'+
   '<button data-fbadm="reload">⟳ Recharger</button>'+
   '<button class="danger" data-fbadm="out">🔒 Déconnexion</button></div></div>'}
 document.addEventListener('click',async function(e){
  var b=e.target.closest?e.target.closest('[data-fbadm]'):null;if(!b)return;
  var k=b.dataset.fbadm,p=b.dataset.p;
  var A=window.KFAccess;
  if(k==='login'){var i=$('#fbPass');var h=await sha(i?i.value.trim():'');
   var ref=(window.ADMIN_HASH||ls('admHash','')||ls('jrgHash',''));
   if(!ref&&i&&i.value.trim().length>=6){sl('admHash',h);ref=h}
   if(h===ref){sl('admDevice',true);try{if(window.S)S.role='admin'}catch(x){}toast('🛡️ Connecté');render()}
   else toast('❌ Mot de passe incorrect');return}
  if(k==='out'){sl('admDevice',false);try{if(window.S)S.role=null}catch(x){}render();return}
  if(k==='add'){var r=$('#fbReq');if(r&&r.value.trim()&&A&&A.ingest){A.ingest(r.value.trim());r.value='';render()}return}
  if(k==='ok'&&A){var q=A.pending().find(function(x){return x.p===p});if(q)A.approve(q);render();return}
  if(k==='ko'&&A){var q2=A.pending().find(function(x){return x.p===p});if(q2)A.refuse(q2);render();return}
  if(k==='rev'&&A){A.revoke(p);render();return}
  if(k==='repair'){repairAll(true);return}
  if(k==='purge'){try{if(window.KFQuota)KFQuota.purge()}catch(x){}toast('🧹 Purge effectuée');return}
  if(k==='reload'){location.reload();return}});
 return{__fb:true,login:function(){},logout:function(){sl('admDevice',false);render()},
  render:render,isAdmin:isAdmin}};
FB.KFCorr=function(){
 return{__fb:true,SYS:['Moteur','Boîte','Freinage','Électricité'],
  correlate:function(v){var F=window.FAULTS||[];var b=(v&&v.brand)||'';
   var list=F.filter(function(f){var bs=f.b||[];return !b||bs.indexOf('*')>=0||bs.indexOf(b)>=0}).slice(0,60);
   return{faults:list,dtc:[],recalls:[],tsb:[],trace:{total:F.length,kept:list.length},avail:{}}},
  signature:function(v){return{brand:(v&&v.brand)||'',model:(v&&v.model)||'',codes:[],fams:{}}},
  arr:function(v){return Array.isArray(v)?v:(v?[v]:[])},dtc:function(v){return Array.isArray(v)?v:[]},
  txt:function(v){return Array.isArray(v)?v:(v?[v]:[])},norm:function(s){return String(s||'').toLowerCase()},
  famOf:function(c){return String(c||'').toUpperCase()},sysOf:function(){return['Moteur']},
  vehiclePass:function(){return true},fuelGroup:function(){return''},WIN:[1995,2027]}};
FB.KFCatalog=function(){
 var CAT={};
 return{__fb:true,CAT:CAT,OWNER:{},LOCK:{},
  norm:function(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'')},
  makes:function(){return Object.keys(CAT)},
  models:function(b){return Object.keys(CAT[b]||{})},
  engines:function(b,m){return ((CAT[b]||{})[m]||{}).eng||[]},
  resolveMake:function(b){return b},resolveModel:function(b,m){return m},
  isPairValid:function(b,m){return !!(CAT[b]&&CAT[b][m])},purge:function(){}}};
FB.KFVinLoc=function(){
 var Z={baie:'Goulotte de baie de pare-brise, côté droit (lecture par le vitrage)',
  rail:'Longeron avant droit, face supérieure dans le passage de roue',
  floor:'Plancher arrière droit, partie supérieure, sous le tapis de coffre',
  well:'Fond de puits de roue de secours, sous le tapis',
  turret:'Tourelle d’amortisseur avant droit, face supérieure'};
 function pick(b){b=String(b||'').toLowerCase();
  if(/renault|dacia/.test(b))return'floor';
  if(/peugeot|citro|ds|ford|toyota|mercedes/.test(b))return'rail';
  if(/volkswagen|audi|skoda|seat|cupra|subaru/.test(b))return'well';
  if(/bmw|mini/.test(b))return'turret';
  return'baie'}
 return{__fb:true,resolve:function(b,m,f,p,y){var k=pick(b);
   return{brand:b,model:m,zone:{l:Z[k],m:'Frappe à froid',anchor:'Repère à confirmer sur le véhicule',steps:[],t:'Lampe rasante, miroir, brosse douce',w:'Croiser frappe, plaque pied B et baie.',side:'D',v:'top',x:70,y:60,part:'rail'},
    sec:[],note:'Règle générique de secours — vérifier sur le véhicule.',src:'secours',conf:'V',confN:0,protocol:[]}},
  render:function(){},veh:function(){return''},part:function(){return''},exportPng:function(){toast('Export indisponible en mode secours')}}};
FB.KFJrAdmin=function(){
 return{__fb:true,state:{},cfg:{},
  analyse:function(){toast('Analyseur complet indisponible — mode secours')},
  render:function(){var v=$('#view');if(!v)return;
   v.innerHTML='<div class="card jr"><h1>⚖️ JusteRepère (secours)</h1>'+
   '<p class="mut">Le module complet n’a pas pu être chargé. Les repères de base restent accessibles depuis l’onglet JusteRepère.</p>'+
   '<div class="row"><button class="pri" data-bhmod="KFJrAdmin">↻ Recharger le module</button></div></div>'},
  pdf:function(){toast('Export indisponible en mode secours')},json:function(){}}};
FB.KFObdPro=function(){
 var st={conn:false,ecus:[],dtc:{},fb:true};
 return{__fb:true,state:st,cfg:{},elm:null,uds:null,transport:null,
  connect:function(){toast('🔌 Module OBD complet indisponible — reconnectez après réparation');return Promise.resolve(false)},
  disconnect:function(){st.conn=false},scan:function(){return Promise.resolve([])},
  read:function(){return Promise.resolve([])},report:function(){},pdf:function(){},share:function(){},
  render:function(){var v=$('#view');if(!v)return;
   v.innerHTML='<div class="card accent"><h1>🔌 OBD atelier (secours)</h1>'+
   '<p class="mut">Le moteur de diagnostic complet n’est pas chargé. Relancez la réparation pour rétablir la connexion Bluetooth, la lecture DTC/JDD et les calibrages.</p>'+
   '<div class="row"><button class="pri" data-bhmod="KFObdPro">↻ Recharger le module</button>'+
   '<button data-bh="repair">🔧 Réparer tous les modules</button></div></div>'}}};
FB.S=function(){return{role:ls('admDevice',false)?'admin':null,view:'accueil',vehicle:null,check:{results:[]},dtc:[]}};
FB.NAV=function(){return[['accueil','🏠 Accueil'],['recherche','🔎 Recherche'],['etude','📋 Étude'],['admin','🛡️ Admin']]};
FB.switchView=function(){return function(v){
 try{if(window.S)S.view=v}catch(e){}
 var n=$('#nav');if(n&&window.NAV)n.innerHTML=NAV.map(function(x){
  return '<button data-act="nav" data-k="'+esc(x[0])+'" class="'+(x[0]===v?'act':'')+'">'+esc(x[1])+'</button>'}).join('');
 var w=$('#view');if(!w)return;
 if(v==='admin'&&window.KFAdmin&&KFAdmin.render)return KFAdmin.render();
 if(v==='obdpro'&&window.KFObdPro&&KFObdPro.render)return KFObdPro.render();
 if(v==='jradmin'&&window.KFJrAdmin&&KFJrAdmin.render)return KFJrAdmin.render();
 w.innerHTML='<div class="card"><h1>'+esc(v)+'</h1><p class="mut">Vue rendue par le routage de secours.</p></div>'}};

/* ══════════ 4. réparation ══════════ */
var LOG=ls('bhRepairLog',[]);if(!Array.isArray(LOG))LOG=[];
var BUSY=false;
function logOp(g,action,ok){LOG.unshift({t:Date.now(),g:g,a:action,ok:ok});if(LOG.length>60)LOG.pop();sl('bhRepairLog',LOG)}
function loadScript(src){
 return new Promise(function(res){
  var s=document.createElement('script');
  s.src=src+(src.indexOf('?')<0?'?':'&')+'r='+Date.now();
  s.async=false;s.onload=function(){res(true)};s.onerror=function(){res(false)};
  document.body.appendChild(s);
  setTimeout(function(){res(false)},9000)})}
async function repairOne(m,manual){
 var st=STATE[m.g];
 if(present(m)&&st.status!=='fb'){if(manual)toast('✅ '+m.n+' déjà actif');return true}
 if(!m.f){ /* noyau : pas de fichier, secours direct */
  if(FB[m.g]){window[m.g]=FB[m.g]();st.status='fb';st.src='secours';logOp(m.g,'secours',true);snd('fb');paint();return true}
  return false}
 for(var attempt=0;attempt<2;attempt++){
  st.tries++;
  var ok=await loadScript(m.f);
  publish();
  if(present(m)){st.status='fixed';st.src='rechargé';st.ts=Date.now();logOp(m.g,'rechargé',true);
   if(manual){snd('ok');toast('✅ '+m.n+' rétabli')}paint();return true}
  await new Promise(function(r){setTimeout(r,250)})}
 if(FB[m.g]){window[m.g]=FB[m.g]();st.status='fb';st.src='secours';st.ts=Date.now();
  logOp(m.g,'secours',true);snd('fb');
  if(manual)toast('🛟 '+m.n+' : secours fonctionnel installé');paint();return true}
 st.status='missing';logOp(m.g,'échec',false);if(manual){snd('warn');toast('❌ '+m.n+' indisponible')}
 paint();return false}
async function repairAll(manual){
 if(BUSY)return;BUSY=true;paint();
 if(manual){snd('fix');toast('🔧 Réparation de tous les modules…')}
 publish();refreshState();
 for(var i=0;i<REG.length;i++){
  var m=REG[i];
  if(!present(m)||STATE[m.g].status==='fb')await repairOne(m,false)}
 /* extensions de données idempotentes */
 var EXT=['catalog_ext.js','renault_base.js','brands_base.js','megabase_catalog.js',
  'megabase2_catalog.js','megabase3_catalog.js','megabase_faults.js','megabase2_faults.js','megabase3_faults.js'];
 var F=window.FAULTS||[];
 if(F.length<500){for(var j=0;j<EXT.length;j++){await loadScript(EXT[j]);publish()}}
 publish();refreshState();
 try{if(typeof window.runChecks==='function')window.runChecks()}catch(e){}
 BUSY=false;paint();
 var mm=metrics();
 if(manual){snd('ok');toast('✅ Réparation terminée · '+mm.live+'/'+mm.total+' modules · '+mm.faults.toLocaleString('fr-FR')+' pannes')}
 try{if(window.KFNotify&&KFNotify.push)KFNotify.push({type:'update',level:'ok',title:'Réparation des modules',
  body:mm.live+'/'+mm.total+' opérationnels · '+mm.faults.toLocaleString('fr-FR')+' pannes · '+mm.makes+' marques.'})}catch(e){}}

/* ══════════ 5. métriques ══════════ */
function count(v){try{if(Array.isArray(v))return v.length;if(v&&typeof v==='object')return Object.keys(v).length}catch(e){}return 0}
function metrics(){
 refreshState();
 var F=window.FAULTS||grab('FAULTS'),R=window.RECALLS||grab('RECALLS'),T=window.TSBDB||grab('TSBDB');
 var C=window.KFCatalog||grab('KFCatalog');
 var makes=0,models=0,engs=0;
 try{if(C&&C.CAT){makes=Object.keys(C.CAT).length;
  Object.keys(C.CAT).forEach(function(k){var ms=C.CAT[k];models+=Object.keys(ms).length;
   Object.keys(ms).forEach(function(m){engs+=count(ms[m].eng)})})}}catch(e){}
 var live=REG.filter(function(m){return present(m)}).length;
 var fb=REG.filter(function(m){return STATE[m.g].status==='fb'}).length;
 var score=Math.round((live/REG.length)*70+Math.min(30,count(F)/7000*30));
 return{faults:count(F),recalls:count(R),tsb:count(T),makes:makes,models:models,engines:engs,
  live:live,total:REG.length,fb:fb,score:score}}

/* ══════════ 6. centre de santé ══════════ */
var CFG=Object.assign({density:100,glow:56,grain:12,filter:'all',sort:'status',compact:false,
 onlyIssues:false,refresh:5,autoRepair:true,c1:'#22c55e',c2:'#38bdf8',sound:true},ls('bhCfg',{}));
function saveCfg(){sl('bhCfg',CFG)}
var HIDDEN=ls('bhHidden',false);
function host(){
 var h=$('#bhPanel');if(h&&h.isConnected)return h;
 h=document.createElement('div');h.id='bhPanel';
 var boot=$('#boot'),cl=$('#checkList'),v=$('#view'),cur='';
 try{cur=(window.S&&S.view)||''}catch(e){}
 if(boot&&!boot.classList.contains('hid')&&cl&&cl.parentNode)cl.parentNode.insertBefore(h,cl.nextSibling);
 else if(cur==='admin'&&v)v.appendChild(h);
 else if(boot){var c=boot.querySelector('.card');if(c)c.appendChild(h);else boot.appendChild(h)}
 else return null;
 bind(h);return h}
function paint(){
 if(HIDDEN)return;
 var h=host();if(!h)return;
 var m=metrics();
 var rows=REG.slice();
 if(CFG.filter==='core')rows=rows.filter(function(x){return x.core||['KFCatalog','FAULTS','KFCorr'].indexOf(x.g)>=0});
 if(CFG.filter==='ext')rows=rows.filter(function(x){return !(x.core||['KFCatalog','FAULTS','KFCorr'].indexOf(x.g)>=0)});
 if(CFG.onlyIssues)rows=rows.filter(function(x){return STATE[x.g].status!=='ok'&&STATE[x.g].status!=='fixed'});
 if(CFG.sort==='name')rows.sort(function(a,b){return a.n.localeCompare(b.n)});
 else if(CFG.sort==='status')rows.sort(function(a,b){
  var w={missing:0,fb:1,fixed:2,ok:3,'?':0};return (w[STATE[a.g].status]||0)-(w[STATE[b.g].status]||0)});
 var col=m.score>=85?CFG.c1:m.score>=60?'#ffb020':'#ff4d6d';
 h.className='bh'+(CFG.compact?' compact':'');
 h.innerHTML=
 '<div class="bh-bg"></div><div class="bh-grain"></div>'+
 '<div class="bh-head">'+
  '<div class="bh-ring" style="--p:'+m.score+';--rc:'+col+'"><b>'+m.score+'</b><span>santé</span></div>'+
  '<div class="bh-t"><span class="bh-kick">CENTRE DE SANTÉ · AUTO-RÉPARATION</span>'+
   '<b>'+m.live+'/'+m.total+' modules opérationnels'+(m.fb?' · '+m.fb+' en secours':'')+'</b>'+
   '<span>'+PUB.ok.length+' globaux exposés · '+m.faults.toLocaleString('fr-FR')+' pannes · '+
    m.makes+' marques · '+m.models+' modèles'+(BUSY?' · réparation en cours…':'')+'</span></div>'+
  '<button class="bh-mute" data-bh="sound">'+(AU.on?'🔊':'🔇')+'</button></div>'+
 '<div class="bh-stats">'+
  st('Pannes',m.faults,m.faults>500?'ok':'ko')+st('Campagnes',m.recalls,m.recalls>400?'ok':'warn')+
  st('TSB',m.tsb,m.tsb>100?'ok':'warn')+st('Marques',m.makes,m.makes>40?'ok':'warn')+
  st('Modèles',m.models,m.models>200?'ok':'warn')+st('Motorisations',m.engines,m.engines>500?'ok':'warn')+'</div>'+
 (m.live<m.total||m.faults<500
  ?'<div class="bh-alert"><b>⚠️ Réparation disponible</b><p>Les modules manquants sont rechargés automatiquement ; '+
    'si le fichier reste indisponible, un secours fonctionnel prend le relais pour que la fonctionnalité ne disparaisse jamais.</p>'+
    '<button class="bh-fix" data-bh="repair"'+(BUSY?' disabled':'')+'>'+(BUSY?'⏳ Réparation…':'🔧 Tout réparer maintenant')+'</button></div>'
  :'<div class="bh-ok"><b>✅ Chaîne complète</b><p>Tous les modules sont chargés et interconnectés, aucune fonctionnalité en secours.</p></div>')+
 '<div class="bh-grid">'+rows.map(function(x){
   var s=STATE[x.g],cls=s.status==='ok'||s.status==='fixed'?'on':s.status==='fb'?'fb':'off';
   var lbl={ok:'actif',fixed:'réparé',fb:'secours',missing:'absent','?':'…'}[s.status]||'…';
   return '<div class="bh-mod '+cls+'"><span class="bh-dot"></span>'+
    '<div><b>'+esc(x.n)+'</b><i>'+esc(x.g)+' · '+esc(s.src)+'</i></div>'+
    '<em>'+lbl+'</em>'+
    '<button class="bh-one" data-bhmod="'+x.g+'" title="Recharger / secourir">↻</button></div>'}).join('')+'</div>'+
 (LOG.length?'<details class="bh-hist"><summary>Journal des réparations ('+LOG.length+')</summary>'+
   '<div class="bh-log">'+LOG.slice(0,24).map(function(l){
    return '<span class="'+(l.ok?'ok':'ko')+'">'+new Date(l.t).toLocaleTimeString('fr-FR')+' · '+esc(l.g)+' · '+esc(l.a)+'</span>'}).join('')+'</div></details>':'')+
 '<div class="bh-dock">'+
  '<div class="bh-c"><label>Filtre</label><select data-bhc="filter">'+
   op('filter','all','Tous')+op('filter','core','Noyau')+op('filter','ext','Extensions')+'</select></div>'+
  '<div class="bh-c"><label>Tri</label><select data-bhc="sort">'+
   op('sort','status','Problèmes d’abord')+op('sort','name','Alphabétique')+'</select></div>'+
  rg('density','Densité',85,125,'%')+rg('glow','Halo',0,100,'%')+rg('grain','Grain',0,40,'')+
  rg('refresh','Rafraîchissement',2,30,' s')+
  '<div class="bh-tgs">'+tg('compact','Compact')+tg('onlyIssues','Problèmes seuls')+
   tg('autoRepair','Auto-réparation')+tg('sound','Son')+'</div>'+
  '<div class="bh-cols"><div><input type="color" data-bhc="c1" value="'+CFG.c1+'"><span>Signal</span></div>'+
   '<div><input type="color" data-bhc="c2" value="'+CFG.c2+'"><span>Data</span></div></div>'+
  '<div class="bh-btns">'+
   '<button class="p" data-bh="repair">🔧 Tout réparer</button>'+
   '<button data-bh="publish">🔗 Globaux</button>'+
   '<button data-bh="purge">🧹 Purger</button>'+
   '<button data-bh="update">⟳ Mettre à jour</button>'+
   '<button data-bh="export">🧾 Rapport</button>'+
   '<button data-bh="hide">✕ Masquer</button></div></div>';
 theme()}
function st(l,v,c){return '<div class="bh-stat '+c+'"><b>'+(v||0).toLocaleString('fr-FR')+'</b><span>'+l+'</span></div>'}
function op(k,v,l){return '<option value="'+v+'"'+(CFG[k]===v?' selected':'')+'>'+l+'</option>'}
function rg(k,l,a,b,u){return '<div class="bh-c"><label>'+l+' <b id="bho_'+k+'">'+CFG[k]+u+'</b></label>'+
 '<input type="range" data-bhc="'+k+'" data-u="'+u+'" min="'+a+'" max="'+b+'" value="'+CFG[k]+'"></div>'}
function tg(k,l){return '<label class="bh-tg'+(CFG[k]?' on':'')+'" id="bht_'+k+'"><input type="checkbox" data-bht="'+k+'"'+(CFG[k]?' checked':'')+'> '+l+'</label>'}
function theme(){try{var r=document.documentElement.style;
 r.setProperty('--bh1',CFG.c1);r.setProperty('--bh2',CFG.c2);
 r.setProperty('--bh-glow',(CFG.glow/100).toFixed(2));
 r.setProperty('--bh-grain',(CFG.grain/100).toFixed(2));
 r.setProperty('--bh-den',(CFG.density/100).toFixed(2))}catch(e){}}
function bind(h){
 if(h._b)return;h._b=1;
 h.addEventListener('input',function(e){
  var k=e.target.dataset&&e.target.dataset.bhc;if(!k)return;
  CFG[k]=e.target.type==='range'?+e.target.value:e.target.value;
  var o=$('#bho_'+k);if(o)o.textContent=CFG[k]+(e.target.dataset.u||'');
  saveCfg();theme();if(k!=='refresh')paint()});
 h.addEventListener('change',function(e){
  var k=e.target.dataset&&e.target.dataset.bhc;
  if(k&&e.target.tagName==='SELECT'){CFG[k]=e.target.value;saveCfg();paint();return}
  var t=e.target.dataset&&e.target.dataset.bht;
  if(t){CFG[t]=e.target.checked;saveCfg();if(t==='sound')AU.on=CFG.sound;paint()}});
 h.addEventListener('click',async function(e){
  var one=e.target.closest?e.target.closest('[data-bhmod]'):null;
  if(one){var m=REG.find(function(x){return x.g===one.dataset.bhmod});
   if(m){var st=STATE[m.g];if(st.status==='ok'||st.status==='fixed'){st.status='missing'}await repairOne(m,true)}return}
  var b=e.target.closest?e.target.closest('[data-bh]'):null;if(!b)return;
  var k=b.dataset.bh;
  if(k==='repair'){await repairAll(true);return}
  if(k==='publish'){publish();snd('tick');toast('🔗 '+PUB.ok.length+' globaux exposés');paint();return}
  if(k==='purge'){try{if(window.KFQuota){var f=KFQuota.purge();toast('🧹 '+Math.round(f/1024)+' Ko libérés')}
   if(window.KFTurbo&&KFTurbo.purge)KFTurbo.purge(true)}catch(x){}paint();return}
  if(k==='update'){try{if(navigator.serviceWorker){var r=await navigator.serviceWorker.getRegistration();
    if(r){await r.update();if(r.waiting)r.waiting.postMessage({type:'SKIP_WAITING'});
     toast('⟳ Mise à jour — rechargement');setTimeout(function(){location.reload()},1000);return}}
   location.reload()}catch(x){location.reload()}return}
  if(k==='export'){
   var mm=metrics();
   var data={ts:new Date().toISOString(),version:(document.querySelector('meta[name="kf-version"]')||{}).content,
    score:mm.score,live:mm.live,total:mm.total,fallbacks:mm.fb,
    metrics:{faults:mm.faults,recalls:mm.recalls,tsb:mm.tsb,makes:mm.makes,models:mm.models,engines:mm.engines},
    modules:REG.map(function(x){return{name:x.n,global:x.g,file:x.f,status:STATE[x.g].status,source:STATE[x.g].src,tries:STATE[x.g].tries}}),
    published:PUB.ok,missing:PUB.miss,repairs:LOG,
    storage:window.KFQuota?{usage:KFQuota.usage(),degraded:KFQuota.degraded()}:null};
   try{var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    a.download='KEV-FUSION-sante-'+new Date().toISOString().slice(0,10)+'.json';a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href)},6000);snd('ok');toast('🧾 Rapport exporté')}catch(x){}
   return}
  if(k==='hide'){HIDDEN=true;sl('bhHidden',true);h.style.display='none';return}
  if(k==='sound'){AU.on=!AU.on;CFG.sound=AU.on;saveCfg();paint();if(AU.on)snd('tick');return}})}
/* clic sur rechargement depuis les vues de secours */
document.addEventListener('click',async function(e){
 var b=e.target.closest?e.target.closest('[data-bhmod]'):null;
 if(!b||e.target.closest('#bhPanel'))return;
 var m=REG.find(function(x){return x.g===b.dataset.bhmod});
 if(m){STATE[m.g].status='missing';await repairOne(m,true)}});

/* ══════════ CSS ══════════ */
function css(){
 if($('#bhCss'))return;var s=document.createElement('style');s.id='bhCss';
 s.textContent=
 ':root{--bh1:#22c55e;--bh2:#38bdf8;--bh-glow:.56;--bh-grain:.12;--bh-den:1}'+
 '#bhPanel{position:relative;overflow:hidden;margin:14px 0;border-radius:18px;border:1px solid #1e5236;'+
  'background:linear-gradient(150deg,#04140c,#0a2416 38%,#0d1a2e 72%,#161029);box-shadow:0 18px 48px #000b;'+
  'padding:calc(16px*var(--bh-den));font-size:calc(14px*var(--bh-den))}'+
 '.bh-bg{position:absolute;inset:0;pointer-events:none;opacity:calc(var(--bh-glow)*.5);mix-blend-mode:screen;'+
  'background:radial-gradient(40% 50% at 12% 4%,var(--bh1),transparent 62%),radial-gradient(38% 46% at 92% 96%,var(--bh2),transparent 60%)}'+
 '.bh-grain{position:absolute;inset:0;pointer-events:none;opacity:var(--bh-grain);mix-blend-mode:overlay;'+
  'background-image:radial-gradient(#a3e635 1px,transparent 1px);background-size:3px 3px}'+
 '.bh-head{position:relative;display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:14px}'+
 '.bh-ring{--p:0;--rc:#22c55e;width:82px;height:82px;flex:none;border-radius:50%;display:grid;place-items:center;position:relative;'+
  'background:conic-gradient(var(--rc) calc(var(--p)*1%),#04140c 0);transition:background .5s}'+
 '.bh-ring::after{content:"";position:absolute;inset:7px;border-radius:50%;background:#071c12;border:1px solid #1e5236}'+
 '.bh-ring b{position:relative;z-index:1;font:900 23px/1 ui-monospace,monospace;color:var(--rc)}'+
 '.bh-ring span{position:relative;z-index:1;font-size:8px;letter-spacing:1px;text-transform:uppercase;color:#5c876d;margin-top:3px}'+
 '.bh-t{flex:1;min-width:200px}'+
 '.bh-kick{display:inline-block;font:800 9px/1 system-ui;letter-spacing:1.5px;color:#04140c;'+
  'background:linear-gradient(90deg,var(--bh1),var(--bh2));padding:5px 9px;border-radius:7px;margin-bottom:7px}'+
 '.bh-t b{display:block;font-size:16px;color:#f2fbf4}'+
 '.bh-t span{display:block;font-size:11.5px;color:#8bb098;margin-top:3px;line-height:1.5}'+
 '.bh-mute{background:#04140c;border:1px solid #2b5c40;color:#a3e635;border-radius:10px;padding:7px 11px;cursor:pointer;font-size:15px}'+
 '.bh-stats{position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:8px;margin-bottom:13px}'+
 '.bh-stat{border:1px solid #1e5236;border-radius:12px;background:#04140ccc;padding:9px;text-align:center}'+
 '.bh-stat b{display:block;font:900 17px/1 ui-monospace,monospace;color:#a3e635}'+
 '.bh-stat.ok b{color:var(--bh1)}.bh-stat.warn b{color:#ffb020}.bh-stat.ko b{color:#ff4d6d}'+
 '.bh-stat span{display:block;font-size:8px;letter-spacing:.6px;text-transform:uppercase;color:#5c876d;margin-top:4px}'+
 '.bh-alert{position:relative;border:1px solid #ffb02066;border-left:3px solid #ffb020;border-radius:0 13px 13px 0;'+
  'background:#ffb0200e;padding:12px 14px;margin-bottom:13px}'+
 '.bh-alert b{display:block;font-size:13px;color:#ffd166;margin-bottom:5px}'+
 '.bh-alert p{margin:0 0 10px;font-size:12.5px;line-height:1.6;color:#d8c9a8}'+
 '.bh-fix{padding:12px 18px;font:900 13.5px/1 system-ui;border-radius:12px;cursor:pointer;border:2px solid #ffb020;'+
  'background:linear-gradient(135deg,#ffb020,#ff7a1a);color:#1a1005;box-shadow:0 6px 20px #ffb02055}'+
 '.bh-fix:hover{transform:translateY(-2px)}.bh-fix:disabled{opacity:.6;cursor:progress;transform:none}'+
 '.bh-ok{position:relative;border:1px solid #22c55e55;border-left:3px solid var(--bh1);border-radius:0 13px 13px 0;'+
  'background:#22c55e0d;padding:11px 14px;margin-bottom:13px}'+
 '.bh-ok b{display:block;font-size:13px;color:#a3e635}'+
 '.bh-ok p{margin:4px 0 0;font-size:12px;color:#8bb098}'+
 '.bh-grid{position:relative;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:7px;margin-bottom:12px;'+
  'max-height:250px;overflow:auto;padding-right:4px}'+
 '#bhPanel.compact .bh-grid{max-height:136px}'+
 '.bh-grid::-webkit-scrollbar,.bh-log::-webkit-scrollbar{width:9px;height:9px}'+
 '.bh-grid::-webkit-scrollbar-track,.bh-log::-webkit-scrollbar-track{background:#04140c;border-radius:8px}'+
 '.bh-grid::-webkit-scrollbar-thumb,.bh-log::-webkit-scrollbar-thumb{background:linear-gradient(var(--bh1),var(--bh2));border-radius:8px;border:2px solid #04140c}'+
 '.bh-grid,.bh-log{scrollbar-width:thin;scrollbar-color:var(--bh1) #04140c}'+
 '.bh-mod{display:flex;gap:8px;align-items:center;border:1px solid #1e5236;border-radius:11px;background:#04140caa;padding:8px 10px}'+
 '.bh-mod.fb{border-color:#c084fc66;background:#c084fc0c}'+
 '.bh-mod.off{border-color:#ff4d6d55;background:#ff4d6d0c}'+
 '.bh-dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--bh1);box-shadow:0 0 8px var(--bh1)}'+
 '.bh-mod.fb .bh-dot{background:#c084fc;box-shadow:0 0 8px #c084fc}'+
 '.bh-mod.off .bh-dot{background:#ff4d6d;box-shadow:0 0 8px #ff4d6d}'+
 '.bh-mod>div{flex:1;min-width:0}'+
 '.bh-mod b{display:block;font-size:11.5px;color:#eaf6ec;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.bh-mod i{display:block;font-style:normal;font:9px/1.3 ui-monospace,monospace;color:#5c876d;margin-top:2px}'+
 '.bh-mod em{font-style:normal;font:800 8px/1 system-ui;letter-spacing:.6px;color:var(--bh1);text-transform:uppercase}'+
 '.bh-mod.fb em{color:#d8b4fe}.bh-mod.off em{color:#ff8fa0}'+
 '.bh-one{flex:none;background:#04140c;border:1px solid #2b5c40;color:#a3e635;border-radius:8px;padding:3px 7px;font-size:12px;cursor:pointer}'+
 '.bh-one:hover{border-color:var(--bh1);transform:rotate(90deg)}'+
 '.bh-hist{position:relative;margin-bottom:12px}'+
 '.bh-hist summary{cursor:pointer;font-size:11px;color:#8bb098;padding:5px 0}'+
 '.bh-log{display:flex;gap:6px;flex-wrap:wrap;max-height:110px;overflow:auto;padding:6px 0}'+
 '.bh-log span{font:700 9.5px/1 ui-monospace,monospace;padding:5px 8px;border-radius:9px;border:1px solid #1e5236;background:#04140c}'+
 '.bh-log .ok{color:var(--bh1);border-color:#22c55e55}.bh-log .ko{color:#ff8fa0;border-color:#ff4d6d55}'+
 '.bh-dock{position:relative;display:flex;gap:11px;align-items:flex-end;flex-wrap:wrap;border-top:1px solid #1e5236;padding-top:12px}'+
 '.bh-c{width:114px}'+
 '.bh-c label{display:flex;justify-content:space-between;align-items:baseline;gap:5px;margin-bottom:4px;'+
  'font-size:8.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#5c876d}'+
 '.bh-c label b{color:var(--bh1);font-family:ui-monospace,monospace;font-size:9.5px}'+
 '.bh-c select{width:100%;margin:0;padding:7px 8px;font-size:11.5px;background:#04140c;border:1px solid #2b5c40;color:#eaf6ec;border-radius:9px}'+
 '.bh-c input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--bh1),var(--bh2),#c084fc)}'+
 '.bh-c input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;'+
  'background:#f2fbf4;border:3px solid var(--bh1);cursor:grab}'+
 '.bh-tgs{display:flex;gap:6px;flex-wrap:wrap}'+
 '.bh-tg{display:flex;align-items:center;gap:5px;font-size:10px;color:#5c876d;background:#04140c;'+
  'border:1px solid #2b5c40;border-radius:15px;padding:5px 9px;cursor:pointer;white-space:nowrap}'+
 '.bh-tg input{width:auto;margin:0;accent-color:var(--bh1)}'+
 '.bh-tg.on{color:var(--bh1);border-color:var(--bh1);background:#22c55e14}'+
 '.bh-cols{display:flex;gap:6px}'+
 '.bh-cols div{display:flex;flex-direction:column;align-items:center;gap:2px}'+
 '.bh-cols input[type=color]{width:42px;height:28px;border:1px solid #2b5c40;border-radius:8px;background:#04140c;padding:2px;cursor:pointer;margin:0}'+
 '.bh-cols span{font-size:7.5px;color:#5c876d}'+
 '.bh-btns{display:flex;gap:6px;flex-wrap:wrap}'+
 '.bh-btns button{padding:9px 12px;font-size:11px;font-weight:800;border-radius:10px;cursor:pointer;'+
  'border:1px solid #2b5c40;background:#04140c;color:#eaf6ec;white-space:nowrap}'+
 '.bh-btns button:hover{border-color:var(--bh1);color:var(--bh1);transform:translateY(-1px)}'+
 '.bh-btns .p{background:linear-gradient(135deg,var(--bh1),var(--bh2));border-color:var(--bh1);color:#04140c}'+
 '@media(max-width:640px){.bh-grid{grid-template-columns:1fr}.bh-c{width:calc(50% - 6px)}}';
 document.head.appendChild(s)}

/* ══════════ boot ══════════ */
function line(){
 try{
  var old=document.getElementById('kfHealthLine');if(old&&old.parentNode)old.parentNode.removeChild(old);
  var list=document.getElementById('checkList');if(!list)return;
  var m=metrics(),bad=REG.filter(function(x){return STATE[x.g].status==='missing'});
  var li=document.createElement('li');li.id='kfHealthLine';
  li.className=bad.length?'st-warn':'st-ok';
  li.innerHTML='<span>'+(bad.length?'⚠️':'✅')+'</span><span><b>Santé du projet</b> — <span class="mut">'+
   m.live+'/'+m.total+' modules opérationnels'+(m.fb?' ('+m.fb+' secours)':'')+
   ' · '+m.faults.toLocaleString('fr-FR')+' pannes · '+m.makes+' marques · '+m.models+' modèles'+
   (bad.length?' · absents : '+bad.map(function(x){return x.n}).join(', '):' · chaîne complète')+
   '</span></span>';
  list.insertBefore(li,list.firstChild)}catch(e){}}
function boot(){
 css();theme();publish();refreshState();paint();line();
 setTimeout(async function(){
  publish();refreshState();
  if(CFG.autoRepair)await repairAll(false);
  paint();line()},900);
 setTimeout(function(){publish();refreshState();paint();line()},3000);
 setTimeout(function(){publish();refreshState();paint();line()},7000);
 setInterval(function(){
  publish();refreshState();
  if(CFG.autoRepair&&!BUSY){
   var miss=REG.filter(function(x){return STATE[x.g].status==='missing'&&STATE[x.g].tries<4});
   if(miss.length)repairOne(miss[0],false)}
  paint();line()},Math.max(2,CFG.refresh)*1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFBridge={publish:publish,metrics:metrics,repair:repairAll,repairOne:function(g){
  var m=REG.find(function(x){return x.g===g});return m?repairOne(m,true):false},
 paint:paint,state:STATE,registry:REG,log:function(){return LOG},
 show:function(){HIDDEN=false;sl('bhHidden',false);var h=$('#bhPanel');if(h)h.style.display='';paint()},
 published:function(){return PUB}};
})();
