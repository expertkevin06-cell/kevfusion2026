/* KEV FUSION 2026 — tiers.js v1.0.0
   GESTION DES TIERS · POSTE ADMINISTRATEUR
   · case de notification dédiée en tête d'application : prénom du demandeur, canal, code
   · pavé de 3 cases géantes : ACCÈS / REFUS / RÉVOCATION, appliquées au tiers sélectionné
   · case de saisie du code ou du lien reçu par mail → décodage → prénom du demandeur
   · file des demandes, accès actifs, historique, recherche, filtres, tri, vues enregistrées,
     sélection multiple, glisser-déposer, tiroir de détail, annulation, export, impression
   · publication access.json (jeton GitHub) pour que le tiers voie son statut en temps réel */
(function(){
'use strict';
/* ══════════ socle ══════════ */
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},
 d:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function $(s,r){try{return (r||document).querySelector(s)}catch(e){return null}}
function $$(s,r){try{return Array.prototype.slice.call((r||document).querySelectorAll(s))}catch(e){return[]}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9'-]/g,'').trim()}
function uid(){return 't'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function today(){return new Date().toISOString().slice(0,10)}
function plusDays(n){return new Date(Date.now()+n*864e5).toISOString().slice(0,10)}
function dfr(d){if(!d)return '—';var p=String(d).split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:d}
function hhmm(ts){var d=new Date(ts);return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+' '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function ago(ts){var m=Math.round((Date.now()-ts)/60000);
 if(m<1)return 'à l’instant';if(m<60)return 'il y a '+m+' min';
 var h=Math.round(m/60);if(h<24)return 'il y a '+h+' h';return 'il y a '+Math.round(h/24)+' j'}
function toast(m,act){try{
 if(typeof window.toast==='function'&&!act){window.toast(m);return}
 var t=$('#toast');if(!t)return;
 t.innerHTML=esc(m)+(act?' <button id="tgUndo" style="margin-left:10px;padding:5px 11px;font-size:12px;border-radius:8px;border:1px solid #22c55e;background:#22c55e18;color:#22c55e;cursor:pointer">'+esc(act.label)+'</button>':'');
 t.classList.remove('hid');t.classList.add('show');
 if(act){var b=$('#tgUndo');if(b)b.onclick=function(){act.fn();t.classList.add('hid');t.classList.remove('show')}}
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},act?9000:3200)}catch(e){}}
function b64e(o){try{return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}catch(e){return ''}}
function b64d(s){try{return JSON.parse(decodeURIComponent(escape(atob(String(s).replace(/-/g,'+').replace(/_/g,'/')))))}catch(e){return null}}
function isAdmin(){try{return (window.S&&S.role==='admin')||LS.g('admDevice',false)===true}catch(e){return LS.g('admDevice',false)===true}}

/* ══════════ audio ══════════ */
var AU={c:null,on:LS.g('tgSound',true)};
function snd(k){if(!AU.on)return;
 try{var c=AU.c||(AU.c=new (window.AudioContext||window.webkitAudioContext)());
  if(c.state==='suspended')c.resume();
  var m={grant:[523,880,.26,'triangle'],refuse:[330,160,.26,'sawtooth'],revoke:[440,220,.3,'square'],
   decode:[660,1180,.16,'sine'],tick:[1320,1320,.02,'sine'],notify:[494,740,.24,'triangle'],
   undo:[400,620,.16,'sine'],out:[523,880,.22,'triangle']}[k]||[900,900,.04,'sine'];
  var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(55,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.12,c.currentTime+.012);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.03)}catch(e){}}
function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p)}catch(e){}}

/* ══════════ configuration ══════════ */
var DEF={days:30,filter:'pending',sort:'recent',view:'all',density:100,glow:58,grain:12,
 nameSize:100,autoNotif:true,confirm:true,autoPublish:true,sound:true,
 c1:'#2563eb',c2:'#22c55e',c3:'#ff3b5c',compact:false};
var CFG=Object.assign({},DEF,LS.g('tgCfg',{}));
function saveCfg(){LS.s('tgCfg',CFG)}

/* ══════════ données ══════════ */
function mkCode(p,d,t){return b64e({p:p,d:d||('dev'+Math.random().toString(36).slice(2,8)),t:t||Date.now(),n:Math.random().toString(36).slice(2,8)})}
function seed(){
 var now=Date.now();
 var s=[
  {p:'Thomas',ch:'mail',t:now-7*60000,st:'pending',note:'Expertise véhicule 3008 — dossier JR-2026-014'},
  {p:'Marie',ch:'lien',t:now-52*60000,st:'pending',note:'Contrôle technique Spring — demande d’accès ponctuel'},
  {p:'Julien',ch:'sms',t:now-5*3600000,st:'pending',note:'Garage partenaire — accès dossiers partagés'},
  {p:'Sophie',ch:'mail',t:now-26*3600000,st:'granted',exp:plusDays(21),note:'Assurance — sinistre Kuga PHEV'},
  {p:'Karim',ch:'whatsapp',t:now-3*864e5,st:'granted',exp:plusDays(6),note:'Confrère expert — mission commune'},
  {p:'Léa',ch:'lien',t:now-6*864e5,st:'refused',note:'Demande hors périmètre'},
  {p:'Antoine',ch:'mail',t:now-11*864e5,st:'revoked',note:'Accès retiré après clôture du dossier'}];
 return s.map(function(x,i){
  return{id:uid(),p:x.p,code:mkCode(x.p,null,x.t),d:'dev'+(1000+i),t:x.t,st:x.st,ch:x.ch,
   note:x.note||'',exp:x.exp||null,ord:i,hist:[{t:x.t,a:'Demande reçue par '+x.ch}]}})}
var REQS=LS.g('tgReqs',null);
if(!Array.isArray(REQS)||!REQS.length){REQS=seed();LS.s('tgReqs',REQS)}
var VIEWS=LS.g('tgViews',[]);if(!Array.isArray(VIEWS))VIEWS=[];
var HIST=LS.g('tgHist',[]);if(!Array.isArray(HIST))HIST=[];
var ST={sel:null,bulk:[],q:'',drawer:null,undo:null,decoded:null,busy:false,editing:false};
function save(){LS.s('tgReqs',REQS);LS.s('tgHist',HIST.slice(0,200));LS.s('tgViews',VIEWS);syncAccess()}
function syncAccess(){
 try{
  var ext=LS.g('accessReqs',[]);if(!Array.isArray(ext))ext=[];
  REQS.forEach(function(r){
   var e=ext.find(function(x){return norm(x.p)===norm(r.p)});
   if(e){e.st=r.st;e.t=r.t;e.ch=r.ch}else ext.unshift({id:r.id,p:r.p,d:r.d,t:r.t,st:r.st,ch:r.ch,code:r.code});
  });
  LS.s('accessReqs',ext.slice(0,200));
  var L=LS.g('accessList',{version:1,granted:[],refused:[],revoked:[]});
  L.granted=REQS.filter(function(r){return r.st==='granted'}).map(function(r){return{prenom:r.p,exp:r.exp,since:r.t}});
  L.refused=REQS.filter(function(r){return r.st==='refused'}).map(function(r){return{prenom:r.p,since:r.t}});
  L.revoked=REQS.filter(function(r){return r.st==='revoked'}).map(function(r){return{prenom:r.p,since:r.t}});
  L.updated=Date.now();LS.s('accessList',L);
 }catch(e){}}
function hist(p,a){HIST.unshift({t:Date.now(),p:p,a:a});if(HIST.length>200)HIST.pop()}
function pending(){return REQS.filter(function(r){return r.st==='pending'})}
function granted(){return REQS.filter(function(r){return r.st==='granted'})}
function current(){
 if(ST.sel){var r=REQS.find(function(x){return x.id===ST.sel});if(r)return r}
 var p=pending();return p.length?p[0]:null}

/* ══════════ décodage du code / lien ══════════ */
function decode(raw){
 var s=String(raw||'').trim();if(!s)return null;
 var m=s.match(/[?&#](?:areq|req|code)=([^&\s]+)/);if(m)s=m[1];
 s=s.replace(/^["'<\s]+|["'>\s]+$/g,'');
 var o=b64d(s);
 if(o&&o.p)return{p:String(o.p).trim(),d:o.d||'',t:+o.t||Date.now(),n:o.n||'',code:s};
 var m2=s.match(/^([A-Za-zÀ-ÿ' -]{2,24})[-_:|]([A-Za-z0-9]{4,12})$/);
 if(m2)return{p:m2[1].trim(),d:m2[2],t:Date.now(),n:m2[2],code:s};
 if(/^[A-Za-zÀ-ÿ' -]{2,24}$/.test(s))return{p:s.trim(),d:'',t:Date.now(),n:'',code:mkCode(s.trim())};
 return null}
function ingestCode(raw,silent){
 var d=decode(raw);
 if(!d){if(!silent){toast('❌ Code ou lien non reconnu — vérifiez le contenu du mail');snd('refuse')}return null}
 ST.decoded=d;
 var ex=REQS.find(function(r){return norm(r.p)===norm(d.p)});
 if(ex){
  if(ex.st==='refused'||ex.st==='revoked'){ex.st='pending';ex.t=Date.now();ex.hist.push({t:Date.now(),a:'Nouvelle demande (code reçu)'})}
  ex.code=d.code||ex.code;ST.sel=ex.id;save();
  if(!silent){snd('decode');toast('🔎 Demande de '+ex.p+' retrouvée')}
 }else{
  var r={id:uid(),p:d.p,code:d.code,d:d.d,t:d.t,n:d.n,st:'pending',ch:'code reçu',
   note:'',exp:null,ord:-1,hist:[{t:Date.now(),a:'Code décodé depuis le mail'}]};
  REQS.unshift(r);ST.sel=r.id;save();
  if(!silent){snd('notify');buzz([120,60,120]);notify(r)}
 }
 render();return d}

/* ══════════ actions ══════════ */
function snapshot(){return JSON.parse(JSON.stringify(REQS))}
function restore(snap){REQS=snap;save();render();snd('undo');toast('↩️ Action annulée')}
function act(kind,ids){
 var targets=(ids&&ids.length?ids:[ST.sel]).filter(Boolean)
  .map(function(id){return REQS.find(function(r){return r.id===id})}).filter(Boolean);
 if(!targets.length){toast('Sélectionnez d’abord un tiers');snd('refuse');return}
 var label={grant:'ACCÈS',refuse:'REFUS',revoke:'RÉVOCATION'}[kind];
 if(CFG.confirm&&!confirm(label+' pour : '+targets.map(function(t){return t.p}).join(', ')+
  (kind==='grant'?' ('+CFG.days+' jours)':'')+'\n\nConfirmer cette décision ?'))return;
 var snap=snapshot();
 targets.forEach(function(r){
  if(kind==='grant'){r.st='granted';r.exp=plusDays(CFG.days);r.hist.push({t:Date.now(),a:'Accès accordé '+CFG.days+' j'})}
  if(kind==='refuse'){r.st='refused';r.exp=null;r.hist.push({t:Date.now(),a:'Demande refusée'})}
  if(kind==='revoke'){r.st='revoked';r.exp=null;r.hist.push({t:Date.now(),a:'Accès révoqué'})}
  hist(r.p,label)});
 ST.bulk=[];save();
 snd(kind==='grant'?'grant':kind==='refuse'?'refuse':'revoke');
 buzz(kind==='grant'?80:[60,40,60]);
 toast((kind==='grant'?'✅ Accès accordé à ':kind==='refuse'?'❌ Refus pour ':'🚫 Révocation de ')+
  targets.map(function(t){return t.p}).join(', '),{label:'Annuler',fn:function(){restore(snap)}});
 if(CFG.autoPublish)publish();
 render()}
function repo(){var h=location.hostname,m=h.match(/^([^.]+)\.github\.io$/);
 var seg=location.pathname.split('/').filter(Boolean);
 return Object.assign({owner:m?m[1]:'expertkevin06-cell',repo:(m&&seg.length)?seg[0]:'kev-fusion',branch:'main'},LS.g('ghCfg',{}))}
function publish(){
 var tk=(LS.g('ghToken','')||'').trim();
 var L=LS.g('accessList',{});
 if(!tk){toast('🔑 Jeton GitHub absent — décision enregistrée localement, publiez access.json depuis l’Admin');return Promise.resolve(false)}
 var c=repo(),api='https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/access.json';
 var b=new TextEncoder().encode(JSON.stringify(L,null,2)),o='',CH=0x8000;
 for(var i=0;i<b.length;i+=CH)o+=String.fromCharCode.apply(null,b.subarray(i,i+CH));
 return fetch(api+'?ref='+encodeURIComponent(c.branch),{headers:{Authorization:'Bearer '+tk,Accept:'application/vnd.github+json'}})
  .then(function(r){return r.ok?r.json():null}).then(function(cur){
   var body={message:'KEV FUSION · accès tiers '+new Date().toISOString(),content:btoa(o),branch:c.branch};
   if(cur&&cur.sha)body.sha=cur.sha;
   return fetch(api,{method:'PUT',headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify(body)})})
  .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);toast('📡 access.json publié — les tiers sont notifiés');return true})
  .catch(function(e){toast('⚠️ Publication impossible ('+e.message+') — décision conservée localement');return false})}
function notify(r){
 try{if(window.KFNotify&&KFNotify.push)KFNotify.push({type:'access',reqId:r.id,level:'crit',sticky:true,
  title:'Demande d’accès — '+r.p,body:'Reçue par '+(r.ch||'—')+' · '+hhmm(r.t)+'. Traitez-la depuis le poste Tiers.'})}catch(e){}
 paintNotif()}

/* ══════════ filtres ══════════ */
function visible(){
 var q=norm(ST.q),out=REQS.slice();
 if(CFG.filter!=='all')out=out.filter(function(r){return r.st===CFG.filter});
 var v=VIEWS.find(function(x){return x.id===CFG.view});
 if(v){if(v.filter!=='all')out=out.filter(function(r){return r.st===v.filter});
  if(v.q)out=out.filter(function(r){return norm(r.p+' '+r.note).indexOf(norm(v.q))>=0})}
 if(q)out=out.filter(function(r){return norm(r.p+' '+(r.note||'')+' '+(r.ch||'')).indexOf(q)>=0});
 var s=CFG.sort;
 if(s==='name')out.sort(function(a,b){return a.p.localeCompare(b.p)});
 else if(s==='status')out.sort(function(a,b){var w={pending:0,granted:1,refused:2,revoked:3};return w[a.st]-w[b.st]});
 else if(s==='manual')out.sort(function(a,b){return (a.ord||0)-(b.ord||0)});
 else out.sort(function(a,b){return b.t-a.t});
 return out}
var STL={pending:{l:'En attente',c:'#ffb020'},granted:{l:'Accès actif',c:'#22c55e'},
 refused:{l:'Refusé',c:'#ff3b5c'},revoked:{l:'Révoqué',c:'#a855f7'}};

/* ══════════ notification dédiée ══════════ */
function notifHost(){
 var b=$('#tgNotif');
 if(!b){b=document.createElement('div');b.id='tgNotif';
  if(document.body.firstChild)document.body.insertBefore(b,document.body.firstChild);
  else document.body.appendChild(b);
  b.addEventListener('click',function(e){
   var t=e.target.closest?e.target.closest('[data-tgn]'):null;if(!t)return;
   var k=t.dataset.tgn;
   if(k==='open'){open();return}
   if(k==='min'){LS.s('tgNotifMin',true);paintNotif();return}
   if(k==='unmin'){LS.s('tgNotifMin',false);paintNotif();return}
   if(k==='next'){var ps=pending();var i=ps.findIndex(function(x){return x.id===ST.sel});
    ST.sel=(ps[(i+1)%ps.length]||{}).id||null;paintNotif();render();return}
   if(k==='grant'||k==='refuse'||k==='revoke'){act(k,[t.dataset.id||ST.sel]);return}})}
 return b}
function paintNotif(){
 var b=notifHost(),ps=pending();
 document.body.classList.toggle('tg-notif-on',ps.length>0);
 if(!ps.length||!CFG.autoNotif){b.innerHTML='';b.style.display='none';offset();return}
 b.style.display='block';
 var r=current()||ps[0];ST.sel=ST.sel||r.id;
 var min=LS.g('tgNotifMin',false);
 if(min){b.className='tgn min';
  b.innerHTML='<button class="tgn-pill" data-tgn="unmin"><span class="tgn-dot"></span>'+
   '<b>'+ps.length+' demande(s) d’accès</b><em>▲</em></button>';offset();return}
 b.className='tgn';
 b.innerHTML='<div class="tgn-row">'+
  '<span class="tgn-dot"></span>'+
  '<span class="tgn-lbl">DEMANDE D’ACCÈS TIERS</span>'+
  '<span class="tgn-name" style="font-size:calc(20px*var(--tg-name))">'+esc(r.p)+'</span>'+
  '<span class="tgn-meta">'+esc(r.ch||'—')+' · '+ago(r.t)+' · #'+esc((r.code||'').slice(-6))+'</span>'+
  (ps.length>1?'<button class="tgn-next" data-tgn="next">⇄ '+ps.length+'</button>':'')+
  '<button class="tgn-open" data-tgn="open">📂 Poste Tiers</button>'+
  '<button class="tgn-min" data-tgn="min">—</button></div>'+
  '<div class="tgn-acts">'+
   '<button class="tgn-a ok" data-tgn="grant" data-id="'+r.id+'">✅ ACCÈS</button>'+
   '<button class="tgn-a ko" data-tgn="refuse" data-id="'+r.id+'">❌ REFUS</button>'+
   '<button class="tgn-a rv" data-tgn="revoke" data-id="'+r.id+'">🚫 RÉVOCATION</button>'+
  '</div>';
 offset()}
function offset(){try{
 var b=$('#tgNotif'),h=b&&b.style.display!=='none'?b.offsetHeight:0;
 document.documentElement.style.setProperty('--tgH',h+'px')}catch(e){}}

/* ══════════ rendu principal ══════════ */
function open(){try{if(typeof switchView==='function')switchView('tiers')}catch(e){render()}}
function render(){
 paintNotif();
 var v=$('#view');if(!v)return;
 var cur='';try{cur=(window.S&&S.view)||''}catch(e){}
 if(cur!=='tiers')return;
 if(!isAdmin()){
  v.innerHTML='<div class="card tg-lock"><span class="tg-lock-ic">🔒</span>'+
   '<h1>Poste Tiers — accès administrateur</h1>'+
   '<p class="mut">La gestion des accès tiers est réservée à l’administrateur.</p>'+
   '<div class="row" style="justify-content:center;margin-top:14px">'+
   '<button class="pri" data-tg="admin">🛡️ Connexion admin</button>'+
   '<button data-tg="home">🏠 Accueil</button></div></div>';
  bind(v);return}
 var r=current(),ps=pending(),gr=granted(),rows=visible();
 v.innerHTML=
 '<div class="tg-hero"><div class="tg-hero-bg"></div><div class="tg-hero-in">'+
  '<div class="tg-hero-l"><span class="tg-kick">POSTE ADMINISTRATEUR · GESTION DES TIERS</span>'+
   '<h1>Accès, refus, révocation</h1>'+
   '<p>Décodez le <b>code ou le lien reçu par mail</b>, identifiez le <b>prénom du demandeur</b>, '+
   'puis tranchez en un geste. Chaque décision est journalisée, annulable et publiée aux tiers.</p></div>'+
  '<div class="tg-hero-r">'+
   hstat(ps.length,'en attente','warn')+hstat(gr.length,'accès actifs','ok')+
   hstat(REQS.filter(function(x){return x.st==='refused'}).length,'refusés','ko')+
   hstat(REQS.filter(function(x){return x.st==='revoked'}).length,'révoqués','rv')+
  '</div></div>'+
  '<button class="tg-mute" data-tg="sound">'+(AU.on?'🔊 Son actif':'🔇 Son coupé')+'</button></div>'+
 /* CASE NOTIFICATION DÉDIÉE */
 '<div class="tg-notifcard'+(r&&r.st==='pending'?' live':'')+'">'+
  '<div class="tg-nc-h"><span class="tg-nc-ic">🔔</span><b>Notification du tiers</b>'+
   '<span class="tg-nc-count">'+ps.length+' en attente</span></div>'+
  (r?'<div class="tg-nc-body">'+
    '<div class="tg-nc-id"><span class="tg-nc-name" style="font-size:calc(30px*var(--tg-name))">'+esc(r.p)+'</span>'+
     '<span class="tg-nc-sub">'+esc(r.ch||'—')+' · '+hhmm(r.t)+' · '+ago(r.t)+'</span>'+
     '<span class="tg-nc-note">'+esc(r.note||'Aucune note')+'</span></div>'+
    '<div class="tg-nc-code"><label>Code du tiers</label><code>'+esc(r.code||'—')+'</code>'+
     '<button class="tg-mini" data-tg="copycode" data-id="'+r.id+'">📋 Copier</button></div>'+
   '</div>'
   :'<div class="tg-nc-empty">Aucune demande en attente. Collez un code ci-dessous pour enregistrer un tiers.</div>')+
  /* PAVÉ DE 3 CASES */
  '<div class="tg-triple">'+
   triple('grant','✅','ACCÈS','Autoriser '+CFG.days+' jours','ok',r&&r.st!=='granted')+
   triple('refuse','❌','REFUS','Refuser la demande','ko',r&&r.st!=='refused')+
   triple('revoke','🚫','RÉVOCATION','Retirer un accès actif','rv',r&&r.st==='granted')+
  '</div>'+
  '<div class="tg-triple-f"><label>Durée d’accès'+
   '<select data-tgc="days">'+[7,15,30,90,180,365].map(function(d){
    return '<option value="'+d+'"'+(CFG.days===d?' selected':'')+'>'+d+' jours</option>'}).join('')+'</select></label>'+
   '<span class="tg-target">Cible : <b>'+(r?esc(r.p):'aucune')+'</b></span>'+
   '<button class="tg-mini" data-tg="next">⇄ Tiers suivant</button></div>'+
 '</div>'+
 /* CASE CODE / LIEN */
 '<div class="tg-codebox">'+
  '<div class="tg-cb-h"><span>📧</span><b>Code ou lien du tiers reçu par mail</b>'+
   '<span class="mut">Collez le lien complet ou le code : le prénom du demandeur est identifié automatiquement.</span></div>'+
  '<div class="tg-cb-row">'+
   '<input id="tgCode" placeholder="Ex. https://…/?areq=eyJw…  ou  eyJwIjoiVGhvbWFz…  ou  Thomas-A7F3K2" autocomplete="off">'+
   '<button class="tg-pri" data-tg="decode">🔎 Identifier le demandeur</button>'+
   '<button class="tg-mini" data-tg="paste">📋 Coller</button>'+
   '<button class="tg-mini" data-tg="clearcode">✕</button></div>'+
  (ST.decoded?'<div class="tg-cb-res"><span>👤</span><b>'+esc(ST.decoded.p)+'</b>'+
   '<span class="mut">demandeur identifié · '+hhmm(ST.decoded.t)+'</span>'+
   '<span class="tg-cb-ok">Ajouté à la file — tranchez avec le pavé ci-dessus</span></div>':'')+
 '</div>'+
 /* FILE */
 '<div class="tg-card">'+
  '<div class="tg-tools">'+
   '<input id="tgQ" placeholder="Rechercher un prénom, une note…" value="'+esc(ST.q)+'">'+
   '<select data-tgc="filter">'+[['all','Tous'],['pending','En attente'],['granted','Accès actifs'],
    ['refused','Refusés'],['revoked','Révoqués']].map(function(o){
    return '<option value="'+o[0]+'"'+(CFG.filter===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>'+
   '<select data-tgc="sort">'+[['recent','Récents'],['name','Prénom'],['status','Statut'],['manual','Ordre manuel']].map(function(o){
    return '<option value="'+o[0]+'"'+(CFG.sort===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>'+
   '<select data-tgc="view"><option value="all">Vue : tout</option>'+
    VIEWS.map(function(x){return '<option value="'+x.id+'"'+(CFG.view===x.id?' selected':'')+'">🔖 '+esc(x.name)+'</option>'}).join('')+'</select>'+
   '<button class="tg-mini" data-tg="saveview">🔖</button>'+
   '<button class="tg-mini" data-tg="add">＋ Tiers</button>'+
  '</div>'+
  (ST.bulk.length?'<div class="tg-bulk"><b>'+ST.bulk.length+' sélectionné(s)</b>'+
   '<button class="ok" data-tg="bullok">✅ Accès</button>'+
   '<button class="ko" data-tg="bulkko">❌ Refus</button>'+
   '<button class="rv" data-tg="bulkrv">🚫 Révoquer</button>'+
   '<button data-tg="bulknone">Désélectionner</button></div>':'')+
  '<div class="tg-list" id="tgList">'+(rows.length?rows.map(rowHtml).join('')
   :'<div class="tg-empty">Aucun tiers pour ce filtre.</div>')+'</div>'+
 '</div>'+
 /* HISTORIQUE */
 '<div class="tg-card"><h2>🧾 Historique des décisions</h2>'+
  (HIST.length?'<div class="tg-hist">'+HIST.slice(0,20).map(function(h){
    return '<div><i>'+hhmm(h.t)+'</i><b>'+esc(h.p)+'</b><span>'+esc(h.a)+'</span></div>'}).join('')+'</div>'
   :'<p class="mut">Aucune décision enregistrée.</p>')+'</div>'+
 dock()+
 (ST.drawer?drawerHtml():'');
 bind(v);dnd();theme()}
function hstat(v,l,c){return '<div class="tg-hs '+c+'"><b>'+v+'</b><span>'+l+'</span></div>'}
function triple(k,ic,label,sub,c,en){
 return '<button class="tg-tri '+c+(en?'':' dis')+'" data-tg="'+k+'"'+(en?'':' disabled')+'>'+
  '<span class="tg-tri-ic">'+ic+'</span><b>'+label+'</b><i>'+sub+'</i></button>'}
function rowHtml(r){
 var s=STL[r.st],sel=ST.sel===r.id,bulk=ST.bulk.indexOf(r.id)>=0;
 return '<article class="tg-row'+(sel?' sel':'')+(bulk?' bulk':'')+'" draggable="true" data-id="'+r.id+'" style="--rc:'+s.c+'">'+
  '<label class="tg-check"><input type="checkbox" data-tgsel="'+r.id+'"'+(bulk?' checked':'')+'></label>'+
  '<button class="tg-pick" data-tgpick="'+r.id+'">'+esc(r.p.charAt(0).toUpperCase())+'</button>'+
  '<div class="tg-rid"><b>'+esc(r.p)+'</b>'+
   '<span>'+esc(r.ch||'—')+' · '+ago(r.t)+(r.exp?' · expire '+dfr(r.exp):'')+'</span>'+
   (r.note?'<i>'+esc(r.note)+'</i>':'')+'</div>'+
  '<span class="tg-st" style="color:'+s.c+';border-color:'+s.c+'">'+s.l+'</span>'+
  '<div class="tg-ra">'+
   (r.st!=='granted'?'<button class="ok" data-tgact="grant" data-id="'+r.id+'">✅</button>':'')+
   (r.st!=='refused'?'<button class="ko" data-tgact="refuse" data-id="'+r.id+'">❌</button>':'')+
   (r.st==='granted'?'<button class="rv" data-tgact="revoke" data-id="'+r.id+'">🚫</button>':'')+
   '<button data-tgopen="'+r.id+'">⋯</button>'+
  '</div></article>'}
function drawerHtml(){
 var r=REQS.find(function(x){return x.id===ST.drawer});if(!r)return '';
 var s=STL[r.st];
 return '<div class="tg-drawer" id="tgDrawer"><div class="tg-drawer-in">'+
  '<div class="tg-dh"><b>Fiche tiers</b><button data-tg="dclose">✕</button></div>'+
  '<div class="tg-dhero" style="--rc:'+s.c+'"><span>'+esc(r.p.charAt(0).toUpperCase())+'</span>'+
   '<div><b>'+esc(r.p)+'</b><i>'+s.l+(r.exp?' · '+dfr(r.exp):'')+'</i></div></div>'+
  '<table class="tg-tbl"><tr><td>Reçu</td><td>'+hhmm(r.t)+'</td></tr>'+
   '<tr><td>Canal</td><td>'+esc(r.ch||'—')+'</td></tr>'+
   '<tr><td>Appareil</td><td class="mono">'+esc(r.d||'—')+'</td></tr>'+
   '<tr><td>Code</td><td class="mono brk">'+esc(r.code||'—')+'</td></tr>'+
   '<tr><td>Expiration</td><td>'+(r.exp?dfr(r.exp):'—')+'</td></tr></table>'+
  '<label>Note interne</label><textarea id="tgNote" rows="3">'+esc(r.note||'')+'</textarea>'+
  '<b class="tg-dsub">Journal du tiers</b>'+
  '<div class="tg-dhist">'+(r.hist||[]).slice().reverse().map(function(h){
    return '<div><i>'+hhmm(h.t)+'</i><span>'+esc(h.a)+'</span></div>'}).join('')+'</div>'+
  '<div class="tg-da">'+
   '<button class="ok" data-tgact="grant" data-id="'+r.id+'">✅ Accès</button>'+
   '<button class="ko" data-tgact="refuse" data-id="'+r.id+'">❌ Refus</button>'+
   '<button class="rv" data-tgact="revoke" data-id="'+r.id+'">🚫 Révocation</button>'+
   '<button data-tg="copycode" data-id="'+r.id+'">📋 Code</button>'+
   '<button class="del" data-tg="del" data-id="'+r.id+'">🗑 Supprimer</button></div>'+
 '</div></div>'}
function dock(){
 return '<aside class="tg-dock"><b>🎛️ Réglages du poste</b>'+
 '<div class="tg-c"><label>Durée d’accès</label><select data-tgc="days">'+
  [7,15,30,90,180,365].map(function(d){return '<option value="'+d+'"'+(CFG.days===d?' selected':'')+'>'+d+' jours</option>'}).join('')+'</select></div>'+
 rg('nameSize','Taille du prénom',70,160,'%')+
 rg('density','Densité',85,125,'%')+rg('glow','Halo',0,100,'%')+rg('grain','Grain',0,40,'')+
 '<div class="tg-tgs">'+tg('autoNotif','Notification')+tg('confirm','Confirmation')+
  tg('autoPublish','Publication auto')+tg('compact','Compact')+tg('sound','Son')+'</div>'+
 '<div class="tg-cols">'+
  '<div><input type="color" data-tgc="c1" value="'+CFG.c1+'"><span>Poste</span></div>'+
  '<div><input type="color" data-tgc="c2" value="'+CFG.c2+'"><span>Accès</span></div>'+
  '<div><input type="color" data-tgc="c3" value="'+CFG.c3+'"><span>Refus</span></div></div>'+
 '<div class="tg-btns">'+
  '<button class="p" data-tg="publish">📡 Publier</button>'+
  '<button data-tg="export">🧬 Export</button>'+
  '<button data-tg="print">🖨 Imprimer</button>'+
  '<button data-tg="reset">↺</button><button data-tg="rand">🎲</button>'+
  '<button data-tg="seed">🌱 Jeu d’essai</button></div>'+
 '<p class="tg-note">Réglages appliqués <b>en direct</b>. Les décisions sont annulables 9 s et publiées aux tiers.</p></aside>'}
function rg(k,l,a,b,u){return '<div class="tg-c"><label>'+l+' <b id="tgo_'+k+'">'+CFG[k]+u+'</b></label>'+
 '<input type="range" data-tgc="'+k+'" data-u="'+u+'" min="'+a+'" max="'+b+'" value="'+CFG[k]+'"></div>'}
function tg(k,l){return '<label class="tg-tg'+(CFG[k]?' on':'')+'" id="tgt_'+k+'"><input type="checkbox" data-tgt="'+k+'"'+(CFG[k]?' checked':'')+'> '+l+'</label>'}
function theme(){try{var r=document.documentElement.style;
 r.setProperty('--tg1',CFG.c1);r.setProperty('--tg2',CFG.c2);r.setProperty('--tg3',CFG.c3);
 r.setProperty('--tg-glow',(CFG.glow/100).toFixed(2));
 r.setProperty('--tg-grain',(CFG.grain/100).toFixed(2));
 r.setProperty('--tg-den',(CFG.density/100).toFixed(2));
 r.setProperty('--tg-name',(CFG.nameSize/100).toFixed(2))}catch(e){}}

/* ══════════ événements ══════════ */
function bind(root){
 if(root._tg)return;root._tg=1;
 root.addEventListener('input',function(e){
  var t=e.target;
  if(t.id==='tgQ'){ST.q=t.value;paintList();return}
  if(t.id==='tgNote'){var r=REQS.find(function(x){return x.id===ST.drawer});if(r){r.note=t.value;save()}return}
  var k=t.dataset&&t.dataset.tgc;
  if(k){CFG[k]=t.type==='range'?+t.value:t.value;
   var o=$('#tgo_'+k);if(o)o.textContent=CFG[k]+(t.dataset.u||'');
   saveCfg();theme();if(k!=='days')render();else{paintNotif();render()}return}
  var g=t.dataset&&t.dataset.tgt;
  if(g){CFG[g]=t.checked;var w=$('#tgt_'+g);if(w)w.classList.toggle('on',CFG[g]);
   saveCfg();if(g==='sound')AU.on=CFG.sound;render();return}});
 root.addEventListener('change',function(e){
  var t=e.target;
  var k=t.dataset&&t.dataset.tgc;
  if(k&&t.tagName==='SELECT'){CFG[k]=t.value;saveCfg();render();return}
  var s=t.dataset&&t.dataset.tgsel;
  if(s){if(t.checked){if(ST.bulk.indexOf(s)<0)ST.bulk.push(s)}else ST.bulk=ST.bulk.filter(function(x){return x!==s});
   render();return}});
 root.addEventListener('keydown',function(e){
  if(e.key==='Enter'&&e.target.id==='tgCode'){e.preventDefault();ingestCode(e.target.value);e.target.value=''}});
 root.addEventListener('click',async function(e){
  var pick=e.target.closest?e.target.closest('[data-tgpick]'):null;
  if(pick){ST.sel=pick.dataset.tgpick;snd('tick');render();return}
  var op=e.target.closest?e.target.closest('[data-tgopen]'):null;
  if(op){ST.drawer=op.dataset.tgopen;render();return}
  var ac=e.target.closest?e.target.closest('[data-tgact]'):null;
  if(ac){ST.sel=ac.dataset.id;act(ac.dataset.tgact,[ac.dataset.id]);return}
  var b=e.target.closest?e.target.closest('[data-tg]'):null;if(!b)return;
  var k=b.dataset.tg;
  if(k==='grant'||k==='refuse'||k==='revoke'){act(k,ST.bulk.length?ST.bulk.slice():null);return}
  if(k==='bullok'){act('grant',ST.bulk.slice());return}
  if(k==='bulkko'){act('refuse',ST.bulk.slice());return}
  if(k==='bulkrv'){act('revoke',ST.bulk.slice());return}
  if(k==='bulknone'){ST.bulk=[];render();return}
  if(k==='decode'){var i=$('#tgCode');if(i){ingestCode(i.value);i.value=''}return}
  if(k==='paste'){try{var txt=await navigator.clipboard.readText();var i2=$('#tgCode');
   if(i2)i2.value=txt;ingestCode(txt)}catch(x){toast('Autorisez l’accès au presse-papiers ou collez manuellement')}return}
  if(k==='clearcode'){var i3=$('#tgCode');if(i3)i3.value='';ST.decoded=null;render();return}
  if(k==='copycode'){var r=REQS.find(function(x){return x.id===b.dataset.id});
   if(r){try{await navigator.clipboard.writeText(r.code);toast('📋 Code copié');snd('tick')}catch(x){toast(r.code)}}return}
  if(k==='next'){var ps=pending();if(ps.length){var i4=ps.findIndex(function(x){return x.id===ST.sel});
   ST.sel=ps[(i4+1)%ps.length].id;snd('tick');render()}return}
  if(k==='add'){var p=prompt('Prénom du tiers à ajouter :');if(p&&p.trim()){ingestCode(p.trim())}return}
  if(k==='del'){var snap=snapshot();var id=b.dataset.id;var r2=REQS.find(function(x){return x.id===id});
   REQS=REQS.filter(function(x){return x.id!==id});ST.drawer=null;save();render();
   toast('🗑️ '+(r2?r2.p:'Tiers')+' supprimé',{label:'Annuler',fn:function(){restore(snap)}});return}
  if(k==='dclose'){ST.drawer=null;render();return}
  if(k==='saveview'){var n=prompt('Nom de la vue :','Ma vue');
   if(n){VIEWS.push({id:uid(),name:n.slice(0,28),filter:CFG.filter,q:ST.q});CFG.view=VIEWS[VIEWS.length-1].id;
    save();saveCfg();render();toast('🔖 Vue enregistrée')}return}
  if(k==='publish'){ST.busy=true;render();await publish();ST.busy=false;render();return}
  if(k==='export'){exportJson();return}
  if(k==='print'){printReport();return}
  if(k==='seed'){REQS=seed();ST.sel=null;save();render();snd('notify');toast('🌱 Jeu d’essai rechargé');return}
  if(k==='reset'){CFG=Object.assign({},DEF);saveCfg();theme();render();snd('tick');toast('↺ Réglages réinitialisés');return}
  if(k==='rand'){var pal=[['#2563eb','#22c55e','#ff3b5c'],['#0ea5e9','#a3e635','#ff4d6d'],
    ['#7c3aed','#22d3ee','#ff7a1a'],['#1d4ed8','#39ff88','#f72585']];
   var p=pal[Math.floor(Math.random()*pal.length)];CFG.c1=p[0];CFG.c2=p[1];CFG.c3=p[2];
   CFG.glow=25+Math.floor(Math.random()*70);CFG.grain=Math.floor(Math.random()*32);
   saveCfg();theme();render();snd('tick');toast('🎲 Thème généré');return}
  if(k==='sound'){AU.on=!AU.on;CFG.sound=AU.on;saveCfg();render();if(AU.on)snd('tick');return}
  if(k==='admin'){try{if(typeof switchView==='function')switchView('admin')}catch(x){}return}
  if(k==='home'){try{if(typeof switchView==='function')switchView('accueil')}catch(x){}return}})}
function paintList(){
 var l=$('#tgList');if(!l)return;var rows=visible();
 l.innerHTML=rows.length?rows.map(rowHtml).join(''):'<div class="tg-empty">Aucun tiers pour ce filtre.</div>';
 dnd()}
function dnd(){
 var l=$('#tgList');if(!l||l._d)return;l._d=1;
 var dragId=null;
 l.addEventListener('dragstart',function(e){var c=e.target.closest('.tg-row');if(!c)return;
  dragId=c.dataset.id;c.classList.add('drag')});
 l.addEventListener('dragend',function(){$$('.tg-row',l).forEach(function(c){c.classList.remove('drag','over')})});
 l.addEventListener('dragover',function(e){var c=e.target.closest('.tg-row');if(!c||!dragId)return;
  e.preventDefault();$$('.tg-row',l).forEach(function(x){x.classList.remove('over')});c.classList.add('over')});
 l.addEventListener('drop',function(e){var c=e.target.closest('.tg-row');if(!c||!dragId)return;
  e.preventDefault();
  var ids=visible().map(function(x){return x.id});
  var f=ids.indexOf(dragId),t=ids.indexOf(c.dataset.id);
  if(f<0||t<0||f===t)return;
  ids.splice(t,0,ids.splice(f,1)[0]);
  ids.forEach(function(id,i){var r=REQS.find(function(x){return x.id===id});if(r)r.ord=i});
  CFG.sort='manual';saveCfg();save();render();snd('tick')})}
function exportJson(){
 var data={ts:new Date().toISOString(),poste:'gestion des tiers',
  tiers:REQS.map(function(r){return{prenom:r.p,statut:r.st,canal:r.ch,recu:new Date(r.t).toISOString(),
   expiration:r.exp,note:r.note,code:r.code,journal:r.hist}}),
  historique:HIST,vues:VIEWS};
 try{var a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  a.download='KEV-FUSION-tiers-'+today()+'.json';a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href)},6000);snd('out');toast('🧬 Export tiers généré')}catch(e){}}
function printReport(){
 var rows=REQS.slice().sort(function(a,b){return b.t-a.t});
 var html='<h1>KEV FUSION 2026 — Gestion des accès tiers</h1><p>Édité le '+new Date().toLocaleString('fr-FR')+'</p>'+
  '<h2>Synthèse</h2><p>'+pending().length+' demande(s) en attente · '+granted().length+' accès actif(s) · '+
  REQS.filter(function(r){return r.st==='refused'}).length+' refus · '+
  REQS.filter(function(r){return r.st==='revoked'}).length+' révocation(s)</p><h2>Détail</h2>';
 rows.forEach(function(r){html+='<p><b>'+esc(r.p)+'</b> — '+STL[r.st].l+
  (r.exp?' (jusqu’au '+dfr(r.exp)+')':'')+'<br>Reçu : '+hhmm(r.t)+' · canal '+(r.ch||'—')+
  (r.note?'<br>Note : '+esc(r.note):'')+'</p>'});
 html+='<h2>Historique</h2>'+HIST.slice(0,30).map(function(h){
  return '<p>'+hhmm(h.t)+' — '+esc(h.p)+' : '+esc(h.a)+'</p>'}).join('');
 html+='<p><i>Document interne de traçabilité des accès. Aucune donnée n’est transmise à un tiers sans publication explicite.</i></p>';
 var pa=$('#printArea');if(pa){pa.innerHTML=html;document.body.classList.add('printing');
  window.print();setTimeout(function(){document.body.classList.remove('printing')},900)}}

/* ══════════ CSS ══════════ */
function css(){
 if($('#tgCss'))return;var s=document.createElement('style');s.id='tgCss';
 s.textContent=
 ':root{--tg1:#2563eb;--tg2:#22c55e;--tg3:#ff3b5c;--tgH:0px;--tg-glow:.58;--tg-grain:.12;--tg-den:1;--tg-name:1;'+
 '--tg-ink:#050b18;--tg-ink2:#0a1424;--tg-surf:#0e1c30;--tg-line:#1c3050;--tg-line2:#2a4468;'+
 '--tg-tx:#eaf2ff;--tg-tx2:#c0d2ea;--tg-mut:#8aa2c0;--tg-dim:#5d7595;--tg-rv:#a855f7;--tg-warn:#ffb020}'+
 '#topbar{top:var(--tgH,0px)!important}'+
 'nav#nav{top:calc(56px + var(--tgH,0px))!important}'+
 'body.tg-notif-on #accBanner{display:none!important}'+
 /* notification dédiée */
 '#tgNotif{position:sticky;top:0;z-index:620;display:none;width:100%;'+
  'background:linear-gradient(135deg,#0a1a3a 0%,#122a52 42%,#1a1030 100%);'+
  'border-bottom:2px solid var(--tg1);box-shadow:0 10px 34px #000d}'+
 '.tgn-row{display:flex;align-items:center;gap:10px;padding:11px 14px;flex-wrap:wrap}'+
 '.tgn-dot{width:12px;height:12px;border-radius:50%;background:var(--tg-warn);box-shadow:0 0 14px var(--tg-warn);'+
  'flex:none;animation:tgnP 1.3s ease-in-out infinite}'+
 '@keyframes tgnP{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.55}}'+
 '.tgn-lbl{font:900 11px/1 system-ui;letter-spacing:1.4px;color:#9fc0f0}'+
 '.tgn-name{font-weight:900;color:#fff;background:linear-gradient(90deg,var(--tg1),var(--tg-rv));'+
  'padding:6px 14px;border-radius:11px;text-transform:capitalize;line-height:1.1}'+
 '.tgn-meta{font:600 10.5px/1 ui-monospace,monospace;color:#8aa2c0}'+
 '.tgn-next,.tgn-min,.tgn-open{background:#0a1424;border:1px solid var(--tg-line2);color:#c0d2ea;'+
  'border-radius:9px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer}'+
 '.tgn-open{border-color:var(--tg1);color:#9fc0f0}'+
 '.tgn-min{margin-left:auto}'+
 '.tgn-acts{display:flex;gap:9px;padding:0 14px 12px;flex-wrap:wrap}'+
 '.tgn-a{flex:1;min-width:130px;padding:13px 16px;font:900 14px/1 system-ui;letter-spacing:.6px;'+
  'border-radius:12px;cursor:pointer;transition:.15s;border:2px solid}'+
 '.tgn-a.ok{background:linear-gradient(135deg,var(--tg2),#a3e635);border-color:var(--tg2);color:#04140c}'+
 '.tgn-a.ko{background:#ff3b5c18;border-color:var(--tg3);color:#ff8fa0}'+
 '.tgn-a.rv{background:#a855f718;border-color:var(--tg-rv);color:#d8b4fe}'+
 '.tgn-a:hover{transform:translateY(-2px)}'+
 '.tgn-pill{display:flex;align-items:center;gap:9px;width:100%;padding:9px 14px;background:none;border:0;cursor:pointer;color:#9fc0f0}'+
 '.tgn-pill b{font:900 12px/1 system-ui;letter-spacing:1px}.tgn-pill em{margin-left:auto;font-style:normal}'+
 /* hero */
 '.tg-hero{position:relative;border-radius:20px;overflow:hidden;margin-bottom:14px;border:1px solid var(--tg-line);'+
  'background:linear-gradient(140deg,#050b18,#0d1f3d 36%,#141033 74%,#1c0f26);box-shadow:0 20px 54px #000b}'+
 '.tg-hero-bg{position:absolute;inset:0;opacity:.32;background-image:linear-gradient(#2563eb22 1px,transparent 1px),linear-gradient(90deg,#2563eb22 1px,transparent 1px);'+
  'background-size:30px 30px;-webkit-mask-image:radial-gradient(76% 76% at 24% 20%,#000,transparent);mask-image:radial-gradient(76% 76% at 24% 20%,#000,transparent)}'+
 '.tg-hero::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:calc(var(--tg-glow)*.42);mix-blend-mode:screen;'+
  'background:radial-gradient(42% 56% at 12% 6%,var(--tg1),transparent 62%),radial-gradient(40% 50% at 90% 94%,var(--tg-rv),transparent 60%)}'+
 '.tg-hero-in{position:relative;display:flex;gap:20px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;padding:24px 22px 20px}'+
 '.tg-hero-l{flex:1;min-width:270px}'+
 '.tg-kick{display:inline-block;font:800 10px/1 system-ui;letter-spacing:1.6px;color:#050b18;'+
  'background:linear-gradient(90deg,var(--tg1),var(--tg2));padding:6px 12px;border-radius:8px;margin-bottom:10px}'+
 '.tg-hero h1{font-size:clamp(26px,4.6vw,40px);margin:0 0 9px;color:#f2f8ff;letter-spacing:-.9px;font-weight:800}'+
 '.tg-hero p{margin:0;font-size:13.5px;color:#a6bcd8;line-height:1.65;max-width:660px}'+
 '.tg-hero p b{color:#e9f3ff}'+
 '.tg-hero-r{display:flex;gap:9px;flex-wrap:wrap}'+
 '.tg-hs{min-width:84px;padding:10px 12px;border-radius:14px;background:#050b18cc;border:1px solid var(--tg-line);text-align:center}'+
 '.tg-hs b{display:block;font:900 22px/1 ui-monospace,monospace;color:var(--tg1)}'+
 '.tg-hs.ok b{color:var(--tg2)}.tg-hs.ko b{color:var(--tg3)}.tg-hs.warn b{color:var(--tg-warn)}.tg-hs.rv b{color:var(--tg-rv)}'+
 '.tg-hs span{display:block;font-size:8.5px;letter-spacing:.8px;text-transform:uppercase;color:var(--tg-dim);margin-top:4px}'+
 '.tg-mute{position:absolute;top:14px;right:14px;z-index:3;background:#050b18cc;border:1px solid var(--tg-line2);'+
  'color:#9fc0f0;border-radius:20px;padding:7px 13px;font-size:11.5px;font-weight:800;cursor:pointer}'+
 /* case notification */
 '.tg-notifcard{border:1px solid var(--tg-line2);border-radius:18px;background:linear-gradient(160deg,#0a1424ee,#0e1c30ee);'+
  'padding:calc(16px*var(--tg-den));margin-bottom:14px;box-shadow:0 14px 40px #000a}'+
 '.tg-notifcard.live{border-color:var(--tg-warn);box-shadow:0 14px 40px #000a,0 0 0 1px #ffb02033}'+
 '.tg-nc-h{display:flex;align-items:center;gap:10px;margin-bottom:13px}'+
 '.tg-nc-ic{font-size:20px}'+
 '.tg-nc-h b{font-size:15px;color:var(--tg-tx)}'+
 '.tg-nc-count{margin-left:auto;font:800 10px/1 system-ui;color:#050b18;background:var(--tg-warn);padding:5px 9px;border-radius:12px}'+
 '.tg-nc-body{display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin-bottom:14px}'+
 '.tg-nc-id{flex:1;min-width:200px}'+
 '.tg-nc-name{display:block;font-weight:900;color:#fff;text-transform:capitalize;line-height:1.05;'+
  'text-shadow:0 4px 20px #2563eb66}'+
 '.tg-nc-sub{display:block;font:600 11px/1 ui-monospace,monospace;color:var(--tg-mut);margin-top:6px}'+
 '.tg-nc-note{display:block;font-size:12.5px;color:var(--tg-tx2);margin-top:6px}'+
 '.tg-nc-code{min-width:220px}'+
 '.tg-nc-code label{display:block;font-size:9px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:var(--tg-dim);margin-bottom:5px}'+
 '.tg-nc-code code{display:block;font-family:ui-monospace,monospace;font-size:10.5px;color:#a3e635;'+
  'background:#050b18;border:1px solid #22c55e33;border-radius:9px;padding:8px 10px;word-break:break-all;margin-bottom:6px}'+
 '.tg-nc-empty{padding:18px;text-align:center;color:var(--tg-mut);font-size:13px;border:1px dashed var(--tg-line2);border-radius:12px;margin-bottom:14px}'+
 /* pavé 3 cases */
 '.tg-triple{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}'+
 '@media(max-width:640px){.tg-triple{grid-template-columns:1fr}}'+
 '.tg-tri{display:flex;flex-direction:column;align-items:center;gap:5px;padding:20px 12px;border-radius:16px;'+
  'cursor:pointer;border:2px solid;transition:.18s;background:#050b18}'+
 '.tg-tri-ic{font-size:30px;line-height:1}'+
 '.tg-tri b{font:900 16px/1 system-ui;letter-spacing:1px}'+
 '.tg-tri i{font-style:normal;font-size:11px;opacity:.8;text-align:center}'+
 '.tg-tri.ok{border-color:var(--tg2);background:linear-gradient(160deg,#22c55e1f,#050b18);color:#a3e635}'+
 '.tg-tri.ko{border-color:var(--tg3);background:linear-gradient(160deg,#ff3b5c1f,#050b18);color:#ff8fa0}'+
 '.tg-tri.rv{border-color:var(--tg-rv);background:linear-gradient(160deg,#a855f71f,#050b18);color:#d8b4fe}'+
 '.tg-tri:hover:not(.dis){transform:translateY(-3px);box-shadow:0 14px 32px #000a}'+
 '.tg-tri.ok:hover:not(.dis){box-shadow:0 14px 32px #22c55e44}'+
 '.tg-tri.ko:hover:not(.dis){box-shadow:0 14px 32px #ff3b5c44}'+
 '.tg-tri.rv:hover:not(.dis){box-shadow:0 14px 32px #a855f744}'+
 '.tg-tri.dis{opacity:.35;cursor:not-allowed}'+
 '.tg-triple-f{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:12px;padding-top:11px;border-top:1px solid var(--tg-line)}'+
 '.tg-triple-f label{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--tg-dim);margin:0}'+
 '.tg-triple-f select{margin:0;padding:8px 10px;font-size:12px;background:#050b18;border:1px solid var(--tg-line2);color:var(--tg-tx);border-radius:9px}'+
 '.tg-target{font-size:12px;color:var(--tg-mut)}.tg-target b{color:#fff;text-transform:capitalize}'+
 /* case code */
 '.tg-codebox{border:1px solid var(--tg2);border-radius:16px;background:#22c55e0a;padding:15px;margin-bottom:14px}'+
 '.tg-cb-h{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:11px}'+
 '.tg-cb-h b{font-size:14px;color:#a3e635}'+
 '.tg-cb-h .mut{font-size:11.5px;color:var(--tg-mut);flex:1;min-width:180px}'+
 '.tg-cb-row{display:flex;gap:8px;flex-wrap:wrap}'+
 '.tg-cb-row input{flex:1;min-width:220px;margin:0;padding:12px 14px;font-size:12.5px;font-family:ui-monospace,monospace;'+
  'background:#050b18;border:1px solid var(--tg-line2);color:var(--tg-tx);border-radius:11px}'+
 '.tg-cb-row input:focus{outline:none;border-color:var(--tg2);box-shadow:0 0 0 3px #22c55e26}'+
 '.tg-pri{padding:12px 16px;font:900 12.5px/1 system-ui;border-radius:11px;cursor:pointer;'+
  'border:2px solid var(--tg2);background:linear-gradient(135deg,var(--tg2),#a3e635);color:#04140c}'+
 '.tg-pri:hover{transform:translateY(-2px)}'+
 '.tg-mini{padding:9px 12px;font-size:11.5px;font-weight:800;border-radius:10px;cursor:pointer;'+
  'border:1px solid var(--tg-line2);background:#050b18;color:var(--tg-tx2)}'+
 '.tg-mini:hover{border-color:var(--tg1);color:#9fc0f0}'+
 '.tg-cb-res{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:11px;padding:10px 13px;'+
  'border:1px dashed var(--tg2);border-radius:12px;background:#050b18}'+
 '.tg-cb-res b{font-size:19px;color:#fff;text-transform:capitalize}'+
 '.tg-cb-ok{margin-left:auto;font:800 10.5px/1 system-ui;color:#a3e635}'+
 /* liste */
 '.tg-card{border:1px solid var(--tg-line);border-radius:16px;background:#0e1c30ee;padding:calc(15px*var(--tg-den));margin-bottom:14px}'+
 '.tg-card h2{font-size:15px;color:var(--tg-tx);margin-bottom:11px}'+
 '.tg-tools{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}'+
 '.tg-tools input,.tg-tools select{margin:0;padding:9px 11px;font-size:12px;background:#050b18;'+
  'border:1px solid var(--tg-line2);color:var(--tg-tx);border-radius:10px;width:auto}'+
 '.tg-tools input{flex:1;min-width:180px}'+
 '.tg-bulk{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:9px 12px;border-radius:11px;'+
  'background:#ffb02010;border:1px solid var(--tg-warn);margin-bottom:11px}'+
 '.tg-bulk b{font-size:12px;color:var(--tg-warn);margin-right:auto}'+
 '.tg-bulk button{padding:8px 11px;font-size:11px;font-weight:800;border-radius:9px;cursor:pointer;border:1px solid var(--tg-line2);background:#050b18;color:var(--tg-tx2)}'+
 '.tg-bulk .ok{border-color:var(--tg2);color:#a3e635}.tg-bulk .ko{border-color:var(--tg3);color:#ff8fa0}'+
 '.tg-bulk .rv{border-color:var(--tg-rv);color:#d8b4fe}'+
 '.tg-list{display:flex;flex-direction:column;gap:8px;max-height:none}'+
 '.tg-row{display:flex;gap:10px;align-items:center;border:1px solid var(--tg-line);border-left:3px solid var(--rc);'+
  'border-radius:12px;background:#050b18;padding:10px 12px;cursor:grab;transition:.15s}'+
 '.tg-row:hover{border-color:var(--tg-line2);transform:translateX(2px)}'+
 '.tg-row.sel{border-color:var(--tg1);box-shadow:0 0 0 2px #2563eb44}'+
 '.tg-row.bulk{background:#ffb0200e}'+
 '.tg-row.drag{opacity:.4}.tg-row.over{border-color:var(--tg2);box-shadow:0 0 0 2px #22c55e55}'+
 '.tg-check{flex:none;display:flex;align-items:center}'+
 '.tg-check input{width:auto;margin:0;accent-color:var(--tg-warn)}'+
 '.tg-pick{flex:none;width:34px;height:34px;border-radius:50%;border:1px solid var(--rc);background:#0a1424;'+
  'color:#fff;font:900 15px/1 system-ui;cursor:pointer}'+
 '.tg-pick:hover{background:var(--rc);color:#050b18}'+
 '.tg-rid{flex:1;min-width:0}'+
 '.tg-rid b{display:block;font-size:14px;color:var(--tg-tx);text-transform:capitalize}'+
 '.tg-rid span{display:block;font:600 10px/1.4 ui-monospace,monospace;color:var(--tg-dim);margin-top:2px}'+
 '.tg-rid i{display:block;font-style:normal;font-size:11.5px;color:var(--tg-mut);margin-top:3px}'+
 '.tg-st{flex:none;font:800 9.5px/1 system-ui;padding:5px 9px;border-radius:12px;border:1px solid;white-space:nowrap}'+
 '.tg-ra{flex:none;display:flex;gap:5px}'+
 '.tg-ra button{padding:7px 9px;font-size:12px;border-radius:9px;cursor:pointer;border:1px solid var(--tg-line2);background:#0a1424;color:var(--tg-tx2)}'+
 '.tg-ra .ok{border-color:var(--tg2)}.tg-ra .ko{border-color:var(--tg3)}.tg-ra .rv{border-color:var(--tg-rv)}'+
 '.tg-ra button:hover{transform:translateY(-1px)}'+
 '.tg-empty{padding:24px;text-align:center;color:var(--tg-mut);font-size:13px;border:1px dashed var(--tg-line2);border-radius:12px}'+
 '.tg-hist{display:flex;flex-direction:column;gap:5px;max-height:200px;overflow:auto}'+
 '.tg-hist div{display:flex;gap:9px;font-size:11.5px;padding:5px 8px;border-radius:8px;background:#050b18}'+
 '.tg-hist i{font-style:normal;font-family:ui-monospace,monospace;color:var(--tg-dim);flex:none}'+
 '.tg-hist b{color:var(--tg-tx);text-transform:capitalize}'+
 '.tg-hist span{color:var(--tg-mut)}'+
 '.tg-hist::-webkit-scrollbar,.tg-dhist::-webkit-scrollbar,.tg-drawer-in::-webkit-scrollbar{width:9px}'+
 '.tg-hist::-webkit-scrollbar-track,.tg-dhist::-webkit-scrollbar-track,.tg-drawer-in::-webkit-scrollbar-track{background:#050b18;border-radius:8px}'+
 '.tg-hist::-webkit-scrollbar-thumb,.tg-dhist::-webkit-scrollbar-thumb,.tg-drawer-in::-webkit-scrollbar-thumb{'+
  'background:linear-gradient(var(--tg1),var(--tg-rv));border-radius:8px;border:2px solid #050b18}'+
 '.tg-hist,.tg-dhist,.tg-drawer-in{scrollbar-width:thin;scrollbar-color:var(--tg1) #050b18}'+
 /* dock */
 '.tg-dock{border:1px solid var(--tg-line2);border-radius:16px;background:linear-gradient(165deg,#0a1424,#141033);'+
  'padding:14px;margin-bottom:14px}'+
 '.tg-dock>b{display:block;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9fc0f0;margin-bottom:11px}'+
 '.tg-c{margin-bottom:10px}'+
 '.tg-c label{display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin-bottom:4px;'+
  'font-size:9px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--tg-dim)}'+
 '.tg-c label b{color:#9fc0f0;font-family:ui-monospace,monospace;font-size:10px}'+
 '.tg-c select{width:100%;background:#050b18;border:1px solid var(--tg-line2);color:var(--tg-tx);border-radius:9px;padding:8px;font-size:12px;margin:0}'+
 '.tg-c input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:2px 0 0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--tg1),var(--tg2),var(--tg-rv))}'+
 '.tg-c input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;'+
  'background:#eaf2ff;border:3px solid var(--tg1);cursor:grab}'+
 '.tg-tgs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}'+
 '.tg-tg{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--tg-dim);background:#050b18;'+
  'border:1px solid var(--tg-line2);border-radius:15px;padding:5px 9px;cursor:pointer}'+
 '.tg-tg input{width:auto;margin:0;accent-color:var(--tg1)}'+
 '.tg-tg.on{color:#9fc0f0;border-color:var(--tg1);background:#2563eb14}'+
 '.tg-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:10px}'+
 '.tg-cols div{display:flex;flex-direction:column;align-items:center;gap:3px}'+
 '.tg-cols input[type=color]{width:100%;height:30px;border:1px solid var(--tg-line2);border-radius:8px;background:#050b18;padding:2px;cursor:pointer;margin:0}'+
 '.tg-cols span{font-size:8px;color:var(--tg-dim)}'+
 '.tg-btns{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}'+
 '.tg-btns button{padding:9px;font-size:11px;font-weight:800;border-radius:9px;cursor:pointer;'+
  'border:1px solid var(--tg-line2);background:#050b18;color:var(--tg-tx)}'+
 '.tg-btns button:hover{border-color:var(--tg1);color:#9fc0f0}'+
 '.tg-btns .p{grid-column:1/-1;background:linear-gradient(135deg,var(--tg1),var(--tg-rv));border-color:var(--tg1);color:#fff}'+
 '.tg-note{margin:10px 0 0;font-size:10px;line-height:1.55;color:var(--tg-dim)}.tg-note b{color:var(--tg-tx2)}'+
 /* drawer */
 '.tg-drawer{position:fixed;inset:0;z-index:700;background:#050b18cc;backdrop-filter:blur(6px);display:flex;justify-content:flex-end}'+
 '.tg-drawer-in{width:min(460px,96vw);height:100%;overflow:auto;background:linear-gradient(168deg,#0a1424,#0e1c30);'+
  'border-left:1px solid var(--tg-line2);padding:18px;box-shadow:-20px 0 60px #000b;animation:tgSlide .26s ease-out}'+
 '@keyframes tgSlide{from{transform:translateX(28px);opacity:0}to{transform:none;opacity:1}}'+
 '.tg-dh{display:flex;align-items:center;gap:10px;margin-bottom:14px}'+
 '.tg-dh b{flex:1;font-size:15px;color:var(--tg-tx)}'+
 '.tg-dh button{background:#050b18;border:1px solid var(--tg-line2);color:var(--tg-tx2);border-radius:9px;padding:6px 11px;cursor:pointer}'+
 '.tg-dhero{display:flex;gap:13px;align-items:center;border:1px solid var(--rc);border-radius:14px;padding:13px;margin-bottom:13px;background:#050b18}'+
 '.tg-dhero span{width:48px;height:48px;border-radius:50%;background:var(--rc);color:#050b18;display:grid;place-items:center;font:900 22px/1 system-ui}'+
 '.tg-dhero b{display:block;font-size:20px;color:#fff;text-transform:capitalize}'+
 '.tg-dhero i{display:block;font-style:normal;font-size:11.5px;color:var(--tg-mut);margin-top:3px}'+
 '.tg-tbl{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px}'+
 '.tg-tbl td{border-bottom:1px solid var(--tg-line);padding:7px 5px;color:var(--tg-tx2)}'+
 '.tg-tbl td:first-child{color:var(--tg-dim);width:34%}'+
 '.tg-tbl .mono{font-family:ui-monospace,monospace}.tg-tbl .brk{word-break:break-all;font-size:10px}'+
 '.tg-drawer-in label{display:block;font-size:9px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:var(--tg-dim);margin:10px 0 5px}'+
 '.tg-drawer-in textarea{width:100%;margin:0;padding:10px;font-size:12.5px;background:#050b18;border:1px solid var(--tg-line2);color:var(--tg-tx);border-radius:10px;resize:vertical}'+
 '.tg-dsub{display:block;font-size:10px;letter-spacing:.8px;text-transform:uppercase;color:#9fc0f0;margin:14px 0 7px}'+
 '.tg-dhist{max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:5px}'+
 '.tg-dhist div{display:flex;gap:9px;font-size:11.5px;padding:5px 8px;border-radius:8px;background:#050b18}'+
 '.tg-dhist i{font-style:normal;font-family:ui-monospace,monospace;color:var(--tg-dim);flex:none}'+
 '.tg-dhist span{color:var(--tg-tx2)}'+
 '.tg-da{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:15px}'+
 '.tg-da button{padding:11px;font-size:12px;font-weight:900;border-radius:10px;cursor:pointer;border:2px solid var(--tg-line2);background:#050b18;color:var(--tg-tx)}'+
 '.tg-da .ok{border-color:var(--tg2);color:#a3e635}.tg-da .ko{border-color:var(--tg3);color:#ff8fa0}'+
 '.tg-da .rv{border-color:var(--tg-rv);color:#d8b4fe}.tg-da .del{border-color:var(--tg3);color:#ff8fa0;grid-column:1/-1}'+
 '.tg-lock{text-align:center;padding:34px 24px!important}'+
 '.tg-lock-ic{font-size:44px;display:block;margin-bottom:12px}'+
 '@media print{#tgNotif,.tg-dock,.tg-drawer,.tg-mute{display:none!important}}';
 document.head.appendChild(s)}

/* ══════════ intégration ══════════ */
function ensureNav(){
 try{
  if(typeof NAV!=='undefined'&&Array.isArray(NAV)&&!NAV.some(function(n){return n&&n[0]==='tiers'})){
   var i=NAV.findIndex(function(n){return n&&n[0]==='admin'});
   NAV.splice(i<0?NAV.length:i,0,['tiers','👥 Tiers'])}
  var b=$('#tgTop');
  if(!b){var h=document.querySelector('.hbtns');
   if(h){b=document.createElement('button');b.id='tgTop';b.type='button';b.textContent='👥';
    b.title='Poste Tiers — accès / refus / révocation';
    b.style.borderColor='#2563eb';b.style.color='#9fc0f0';b.style.background='#0a1424';
    b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();open()});
    h.insertBefore(b,h.firstChild)}}
  var n=pending().length;
  if(b){var o=$('#tgTopBadge');if(o&&o.parentNode)o.parentNode.removeChild(o);
   if(n){var s=document.createElement('span');s.id='tgTopBadge';s.textContent=n>9?'9+':n;
    s.style.cssText='position:absolute;top:-7px;right:-7px;min-width:19px;height:19px;border-radius:10px;background:#ffb020;color:#050b18;font:900 10px/19px system-ui;text-align:center;padding:0 4px';
    b.style.position='relative';b.appendChild(s)}}
 }catch(e){}}
function hook(){
 try{
  if(typeof window.switchView==='function'&&!window.switchView.__tg){
   var _s=window.switchView;
   var w=function(v){
    if(v!=='tiers')return _s(v);
    try{if(window.S)S.view='tiers'}catch(e){}
    ensureNav();
    var n=$('#nav');
    if(n&&typeof NAV!=='undefined'&&Array.isArray(NAV))n.innerHTML=NAV.map(function(x){
     return '<button data-act="nav" data-k="'+esc(x[0])+'" class="'+(x[0]==='tiers'?'act':'')+'">'+esc(x[1])+'</button>'}).join('');
    render()};
   w.__tg=true;window.switchView=w}
 }catch(e){}}
function pullExternal(){
 try{
  var ext=LS.g('accessReqs',[]);if(!Array.isArray(ext))return;
  var changed=false;
  ext.forEach(function(e){
   if(!e||!e.p)return;
   var r=REQS.find(function(x){return norm(x.p)===norm(e.p)});
   if(!r){REQS.unshift({id:e.id||uid(),p:e.p,code:e.code||mkCode(e.p),d:e.d||'',t:e.t||Date.now(),
    st:e.st||'pending',ch:e.ch||'externe',note:'',exp:null,ord:-1,hist:[{t:Date.now(),a:'Demande importée'}]});
    changed=true;notify(REQS[0])}
   else if(r.st!==e.st&&e.st){r.st=e.st;changed=true}});
  if(changed){save();render()}
 }catch(e){}}
function boot(){
 css();theme();hook();ensureNav();syncAccess();paintNotif();
 try{var q=new URLSearchParams(location.search);var c=q.get('areq')||q.get('tgcode');
  if(c){ingestCode(c);history.replaceState(null,'',location.pathname)}}catch(e){}
 window.addEventListener('storage',function(e){
  if(e.key==='kf_accessReqs'){pullExternal();paintNotif()}});
 setInterval(function(){ensureNav();paintNotif();pullExternal()},4000);
 window.addEventListener('resize',offset);
 setTimeout(offset,300);setTimeout(offset,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFTiers={open:open,render:render,decode:decode,ingest:ingestCode,
 grant:function(p){var r=REQS.find(function(x){return norm(x.p)===norm(p)});if(r)act('grant',[r.id])},
 refuse:function(p){var r=REQS.find(function(x){return norm(x.p)===norm(p)});if(r)act('refuse',[r.id])},
 revoke:function(p){var r=REQS.find(function(x){return norm(x.p)===norm(p)});if(r)act('revoke',[r.id])},
 list:function(){return REQS},pending:pending,granted:granted,publish:publish,export:exportJson};
})();
