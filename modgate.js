/* KEV FUSION 2026 — modgate.js v1.0.0
   VERROU ADMINISTRATEUR DU PAVÉ « MODULES » — même modèle que JusteRepère.
   Les six applications fusionnées ne s'ouvrent qu'après mot de passe administrateur :
   interception de la navigation, des rendus, des cartes d'accueil, des iframes et des liens
   profonds. Session expirante, auto-verrouillage, tentatives limitées, journal, changement
   de mot de passe. Atelier visuel permanent : la baie technique se règle en direct.
   Rendu idempotent, observateur excluant sa propre vue, minuteurs nettoyés. */
(function(){
'use strict';
/* ══════════ socle ══════════ */
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},
 d:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function $(s,r){try{return (r||document).querySelector(s)}catch(e){return null}}
function $$(s,r){try{return Array.prototype.slice.call((r||document).querySelectorAll(s))}catch(e){return[]}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function clamp(v,a,b){v=+v;if(!isFinite(v))v=a;return Math.max(a,Math.min(b,v))}
function pad(n){return (n<10?'0':'')+n}
function mmss(ms){ms=Math.max(0,+ms||0);var s=Math.floor(ms/1000);return pad(Math.floor(s/60))+':'+pad(s%60)}
function toast(m){try{if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3200)}catch(e){}}
function dl(blob,name){try{var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href)},8000)}catch(e){toast('Export impossible')}}
async function sha(s){
 try{if(window.crypto&&crypto.subtle&&crypto.subtle.digest){
  var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}}catch(e){}
 var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
 return 'fnv'+(h>>>0).toString(16)}
function nST(f,d){return setTimeout(f,d)}

/* ══════════ son ══════════ */
var AU={c:null,on:LS.g('mgSound',true)!==false};
function actx(){try{if(!AU.c)AU.c=new (window.AudioContext||window.webkitAudioContext)();
 if(AU.c&&AU.c.state==='suspended')AU.c.resume().catch(function(){});return AU.c}catch(e){return null}}
function snd(k){if(!AU.on)return;var c=actx();if(!c)return;
 var m={open:[330,880,.28,'triangle'],seal:[494,988,.22,'sine'],deny:[180,96,.32,'sawtooth'],
  lock:[300,150,.2,'square'],tick:[1400,1400,.018,'sine'],out:[523,880,.22,'triangle'],
  clear:[760,420,.08,'sine'],bay:[620,940,.09,'square']}[k]||[900,900,.04,'sine'];
 try{var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(45,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.12,c.currentTime+.012);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.03)}catch(e){}}

/* ══════════ configuration ══════════ */
var DEF={session:25,idle:6,lockOnHide:true,everyTime:true,blurOnLock:true,
 bays:6,ledSpeed:2.4,fanSpeed:1.6,scan:true,scanSpeed:4.5,fans:true,parts:true,partCount:18,
 tilt:5,depth:14,glow:58,grid:32,grain:12,density:100,
 c1:'#2563eb',c2:'#22d3ee',c3:'#ffb020'};
var raw=LS.g('mgCfg',{});if(!raw||typeof raw!=='object')raw={};
var CFG=Object.assign({},DEF,raw);
function normCfg(){
 CFG.session=clamp(CFG.session,5,120);CFG.idle=clamp(CFG.idle,1,30);
 CFG.bays=clamp(CFG.bays,2,10);CFG.ledSpeed=clamp(CFG.ledSpeed,.4,10);
 CFG.fanSpeed=clamp(CFG.fanSpeed,.3,8);CFG.scanSpeed=clamp(CFG.scanSpeed,1,14);
 CFG.partCount=clamp(CFG.partCount,0,44);CFG.tilt=clamp(CFG.tilt,0,16);
 CFG.depth=clamp(CFG.depth,0,34);CFG.glow=clamp(CFG.glow,0,100);
 CFG.grid=clamp(CFG.grid,0,80);CFG.grain=clamp(CFG.grain,0,40);CFG.density=clamp(CFG.density,85,125);
 ['c1','c2','c3'].forEach(function(k){if(!/^#[0-9a-f]{6}$/i.test(CFG[k]||''))CFG[k]=DEF[k]})}
normCfg();
function saveCfg(){LS.s('mgCfg',CFG)}
var rl=LS.g('mgLog',[]);if(!Array.isArray(rl))rl=[];
var rf=LS.g('mgFails',null);if(!rf||typeof rf!=='object')rf={n:0,until:0};
var MODVIEWS=['modules','module','mods','apps','applis'];
var M={unlocked:false,exp:0,last:Date.now(),target:'modules',pw:'',pw2:'',err:'',caps:false,
 busy:false,mode:'ask',change:null,log:rl,fails:{n:+rf.n||0,until:+rf.until||0},
 hasApp:false,painting:false,renderKey:'',navKey:'',cdT:null,obs:null,raf:0,pending:null,fatal:'',
 ticks:[]};
function jlog(k,m,l){try{M.log.unshift({t:new Date().toISOString(),k:String(k),m:String(m),l:l||'info'});
 if(M.log.length>400)M.log.pop();LS.s('mgLog',M.log);
 var e=$('#mgLog');if(e)e.innerHTML=logHtml()}catch(e){}}
function logHtml(){
 if(!M.log.length)return '<p class="mg-empty">Aucune tentative enregistrée.</p>';
 return M.log.slice(0,14).map(function(l){
  return '<div class="mg-log-l '+esc(l.l)+'"><i>'+esc(String(l.t).slice(11,19))+'</i><b>'+esc(l.k)+'</b><span>'+esc(l.m)+'</span></div>'}).join('')}
function cooldown(){var u=M.fails.until||0;return u>Date.now()?u-Date.now():0}
function refHash(){
 try{if(typeof ADMIN_HASH!=='undefined'&&ADMIN_HASH)return ADMIN_HASH}catch(e){}
 return LS.g('mgHash','')||LS.g('jrgHash','')||''}
function view(){try{return (typeof S!=='undefined'&&S.view)||''}catch(e){return''}}
function setView(v){try{if(typeof S!=='undefined')S.view=v}catch(e){}}
function isMod(v){return MODVIEWS.indexOf(v)>=0}

/* ══════════ champs mot de passe ══════════ */
var DOTS=/[\u2022\u25CF\u2219\u2027\u00B7*]/;
function cleanPw(root){
 try{
  $$('input[type="password"],input[data-mgpw]',root||document).forEach(function(i){
   if(!i.closest||!i.closest('#mgStage,#mgBar'))return;
   var ph=i.getAttribute('placeholder')||'';
   if(DOTS.test(ph))i.setAttribute('placeholder','Saisissez le mot de passe');
   if(i.dataset.mgClean)return;
   i.dataset.mgClean='1';
   i.setAttribute('autocomplete','new-password');
   i.setAttribute('autocorrect','off');i.setAttribute('autocapitalize','off');
   i.setAttribute('spellcheck','false');i.setAttribute('data-lpignore','true');
   i.setAttribute('data-1p-ignore','true');i.setAttribute('data-form-type','other');
   i.name='mg-'+Math.random().toString(36).slice(2,10);
   if(i.value)i.value='';
   var mark=function(){i.dataset.mgTyped='1'};
   i.addEventListener('input',mark);i.addEventListener('keydown',mark);
   [120,420,900].forEach(function(ms){nST(function(){
    try{if(!i.dataset.mgTyped&&i.value){i.value='';
     if(i.id==='mgPw')M.pw='';if(i.id==='mgPw2')M.pw2='';
     if(M.change){if(i.id==='mgOld')M.change.old='';if(i.id==='mgN1')M.change.n1='';if(i.id==='mgN2')M.change.n2=''}
     paintStrength()}}catch(e){}},ms)});
  });
 }catch(e){}}

/* ══════════ session ══════════ */
function grant(){
 M.unlocked=true;M.exp=Date.now()+CFG.session*60000;M.last=Date.now();
 M.fails={n:0,until:0};LS.s('mgFails',M.fails);
 try{LS.s('admDevice',true);if(typeof S!=='undefined')S.role='admin'}catch(e){}
 try{if(!CFG.everyTime)sessionStorage.setItem('kf_mgSession',JSON.stringify({exp:M.exp}));
  else sessionStorage.removeItem('kf_mgSession')}catch(e){}
 document.body.classList.remove('mg-locked');document.body.classList.add('mg-unlocked');
 M.renderKey='';syncNav();bar();
 jlog('ACCÈS','Mot de passe administrateur validé · pavé modules ouvert','ok')}
function revoke(reason){
 if(!M.unlocked)return;
 M.unlocked=false;M.exp=0;M.pw='';M.pw2='';M.change=null;M.mode='ask';
 try{sessionStorage.removeItem('kf_mgSession')}catch(e){}
 document.body.classList.add('mg-locked');document.body.classList.remove('mg-unlocked');
 killFrames();bar();
 var v=view();if(isMod(v))setView('modgate');
 M.renderKey='';
 jlog('VERROU',reason||'Verrouillage manuel','warn');snd('lock');
 syncNav();renderGate(true);toast('🔒 Pavé modules verrouillé')}
function restore(){
 if(CFG.everyTime)return;
 try{var s=JSON.parse(sessionStorage.getItem('kf_mgSession')||'null');
  if(s&&s.exp>Date.now()){M.unlocked=true;M.exp=s.exp;M.last=Date.now();
   document.body.classList.remove('mg-locked');document.body.classList.add('mg-unlocked');
   jlog('SESSION','Session modules restaurée dans cet onglet','info')}}catch(e){}}
function touch(){if(M.unlocked)M.last=Date.now()}
['pointerdown','keydown','wheel','touchstart'].forEach(function(ev){
 try{window.addEventListener(ev,touch,{passive:true})}catch(e){}});
document.addEventListener('visibilitychange',function(){
 try{if(document.hidden&&M.unlocked&&CFG.lockOnHide)revoke('Onglet masqué')}catch(e){}});
window.addEventListener('beforeunload',function(){try{sessionStorage.removeItem('kf_mgSession')}catch(e){}});
function killFrames(){
 try{$$('iframe.mod,iframe[data-mod],.modframe iframe').forEach(function(f){
  if(M.unlocked)return;
  try{f.src='about:blank'}catch(e){}
  if(f.parentNode)f.parentNode.removeChild(f)});
  var v=$('#view');
  if(v&&!M.unlocked&&(isMod(view())||v.querySelector('iframe.mod')))renderGate(true);
 }catch(e){}}

/* ══════════ authentification ══════════ */
async function submit(){
 if(M.busy)return;
 try{
  var cd=cooldown();
  if(cd>0){M.err='Trop de tentatives. Réessayez dans '+Math.ceil(cd/1000)+' s.';snd('deny');renderGate(true);return}
  var pw=M.pw||'';
  if(!pw.length){M.err='Saisissez le mot de passe administrateur.';snd('deny');renderGate(true);return}
  if(pw.length<4){M.err='Le mot de passe doit contenir au moins 4 caractères.';snd('deny');renderGate(true);return}
  M.busy=true;M.err='';renderGate(true);
  var h=await sha(pw),ref=refHash();
  if(!ref){
   if(pw!==M.pw2){M.busy=false;M.err='Les deux saisies ne correspondent pas.';snd('deny');renderGate(true);return}
   if(pw.length<8){M.busy=false;M.err='Choisissez au moins 8 caractères.';snd('deny');renderGate(true);return}
   LS.s('mgHash',h);
   jlog('INIT','Mot de passe administrateur des modules défini','ok');
   M.busy=false;M.pw='';M.pw2='';grant();snd('seal');toast('🔐 Mot de passe défini · modules ouverts');openTarget();return}
  if(h===ref){M.busy=false;M.pw='';M.pw2='';grant();snd('seal');toast('🧩 Accès administrateur accordé');openTarget();return}
  M.fails.n=(M.fails.n||0)+1;
  var pen=M.fails.n>=10?300000:M.fails.n>=5?30000:0;
  if(pen)M.fails.until=Date.now()+pen;
  LS.s('mgFails',M.fails);
  M.busy=false;M.pw='';
  M.err='Mot de passe incorrect.'+(pen?' Blocage de '+(pen/1000)+' s.':M.fails.n>=3?' Tentative '+M.fails.n+' sur 5 avant blocage.':'');
  jlog('REFUS','Mot de passe incorrect (tentative '+M.fails.n+')','err');snd('deny');renderGate(true);
 }catch(e){M.busy=false;M.err='Erreur de vérification : '+(e&&e.message||'inconnue');renderGate(true)}}
async function changePw(){
 try{
  var c=M.change||{};
  if(!c.old||!c.n1||!c.n2){M.err='Renseignez les trois champs.';renderGate(true);return}
  if(c.n1!==c.n2){M.err='La confirmation ne correspond pas.';snd('deny');renderGate(true);return}
  if(c.n1.length<8){M.err='Au moins 8 caractères requis.';snd('deny');renderGate(true);return}
  if(M.hasApp){M.err='Mot de passe défini par l’application : modifiez-le depuis l’espace Admin.';renderGate(true);return}
  var ho=await sha(c.old),hn=await sha(c.n1);
  if(ho!==refHash()){M.err='Mot de passe actuel incorrect.';jlog('REFUS','Changement refusé','err');snd('deny');renderGate(true);return}
  LS.s('mgHash',hn);M.change=null;M.err='';M.mode='ask';
  jlog('SÉCURITÉ','Mot de passe des modules modifié','ok');snd('seal');toast('🔐 Mot de passe modifié');renderGate(true);
 }catch(e){M.err='Erreur : '+(e&&e.message||'inconnue');renderGate(true)}}
function openTarget(){
 var t=M.target||'modules';M.mode='ask';M.renderKey='';
 try{
  if(typeof window.__mgInner==='function')window.__mgInner(t);
  else if(typeof window.switchView==='function')window.switchView(t);
 }catch(e){jlog('ERREUR','Ouverture : '+(e&&e.message||''),'err');showGate()}
 nST(bar,80)}

/* ══════════ interception ══════════ */
function hook(){
 try{
  if(typeof window.switchView==='function'&&!window.switchView.__mg){
   var inner=window.switchView;window.__mgInner=inner;
   var w=function(v){
    if(v==='modgate'){if(M.unlocked)M.target='modules';showGate();return}
    if(!isMod(v))return inner(v);
    if(!M.unlocked){M.target=v;showGate();
     jlog('BLOCAGE','Accès « '+v+' » refusé : mot de passe administrateur requis','warn');snd('deny');return}
    touch();var r=inner(v);nST(bar,70);return r};
   w.__mg=true;window.switchView=w}
  ['renderModules','renderMods','renderApps'].forEach(function(fn){
   if(typeof window[fn]==='function'&&!window[fn].__mg){
    var o=window[fn];var f=function(){if(!M.unlocked){showGate();return}return o.apply(this,arguments)};
    f.__mg=true;window[fn]=f}});
 }catch(e){}}
function showGate(){
 setView('modgate');
 try{
  var boot=$('#boot'),gate=$('#gate'),app=$('#app');
  if(boot&&!boot.classList.contains('hid')){M.pending=M.target||'modules';return}
  if(gate)gate.classList.add('hid');
  if(app)app.classList.remove('hid');
 }catch(e){}
 syncNav();renderGate(true);bar()}
function watch(){
 var v=$('#view');if(!v||M.obs)return;
 var NMO=window.MutationObserver;if(!NMO)return;
 try{
  M.obs=new NMO(function(){
   if(M.painting||M.raf)return;
   M.raf=requestAnimationFrame(function(){
    M.raf=0;if(M.painting)return;
    try{
     var cur=view();
     if(!M.unlocked&&isMod(cur)){showGate();return}
     if(!M.unlocked&&cur!=='modgate'&&v.querySelector('iframe.mod,.modcard,iframe[data-mod]')){showGate();return}
     if(M.unlocked&&(isMod(cur)||cur==='modgate'))attachBar();
     cleanPw(v);
    }catch(e){}})});
  M.obs.observe(v,{childList:true,subtree:false});
 }catch(e){}}

/* ══════════ navigation ══════════ */
function syncNav(){
 try{
  if(typeof NAV!=='undefined'&&Array.isArray(NAV)){
   if(!NAV.some(function(n){return n&&n[0]==='modgate'})){
    var i=NAV.findIndex(function(n){return n&&isMod(n[0])});
    NAV.splice(i<0?NAV.length:i,0,['modgate','🔒 Modules'])}
   var e=NAV.find(function(n){return n&&n[0]==='modgate'});
   if(e)e[1]=M.unlocked?'🧩 Modules':'🔒 Modules';
  }
  var cur=view();
  var list=(typeof NAV!=='undefined'&&Array.isArray(NAV))?NAV:[];
  var key=(M.unlocked?'1':'0')+'|'+cur+'|'+list.map(function(n){
   return n[0]+':'+n[1]+((!M.unlocked&&isMod(n[0]))?'h':'s')}).join(',');
  var n=$('#nav');
  if(n&&key!==M.navKey){
   M.navKey=key;
   n.innerHTML=list.map(function(x){
    var hide=!M.unlocked&&isMod(x[0]);
    return '<button data-act="nav" data-k="'+esc(x[0])+'" class="'+(x[0]===cur?'act':'')+'"'+
     (hide?' style="display:none"':'')+'>'+esc(x[1])+'</button>'}).join('')}
  var b=$('#mgTop');
  if(!b){var h=document.querySelector('.hbtns');
   if(h){b=document.createElement('button');b.id='mgTop';b.type='button';
    b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();
     if(M.unlocked)revoke('Verrouillage depuis la barre supérieure');
     else{M.target='modules';showGate()}});
    h.insertBefore(b,h.firstChild)}}
  if(b){b.textContent=M.unlocked?'🧩':'🔒';
   b.title=M.unlocked?'Modules ouverts — cliquer pour verrouiller':'Modules verrouillés — mot de passe administrateur';
   b.style.borderColor=M.unlocked?CFG.c2:'#ff4d6d';
   b.style.color=M.unlocked?CFG.c2:'#ff4d6d';
   b.style.background=M.unlocked?'#0b1a2e':'#20101a'}
 }catch(e){}}

/* ══════════ baie technique ══════════ */
function strength(p){p=String(p||'');var s=0;
 if(p.length>=8)s+=25;if(p.length>=12)s+=15;if(p.length>=16)s+=10;
 if(/[a-z]/.test(p)&&/[A-Z]/.test(p))s+=20;if(/\d/.test(p))s+=15;if(/[^A-Za-z0-9]/.test(p))s+=20;
 return clamp(s,0,100)}
function unitsSvg(){
 var n=Math.round(CFG.bays),out='',top=44,h=26,gap=4;
 for(var i=0;i<n;i++){
  var y=top+i*(h+gap);
  out+='<g class="mg-unit" style="--i:'+i+'">'+
   '<rect x="30" y="'+y+'" width="180" height="'+h+'" rx="4" fill="url(#mgFace)" stroke="#1d2c44" stroke-width="1"/>'+
   '<rect x="33" y="'+(y+3)+'" width="4" height="'+(h-6)+'" rx="2" fill="#2b3d57"/>'+
   '<rect x="203" y="'+(y+3)+'" width="4" height="'+(h-6)+'" rx="2" fill="#2b3d57"/>'+
   '<g stroke="#22334c" stroke-width="1" opacity=".9">';
  for(var v=0;v<9;v++)out+='<path d="M'+(52+v*5)+' '+(y+6)+' V'+(y+h-6)+'"/>';
  out+='</g>'+
   '<rect x="104" y="'+(y+6)+'" width="52" height="'+(h-12)+'" rx="2.5" fill="#040a14" stroke="#1b2b42"/>'+
   '<rect class="mg-oled" x="107" y="'+(y+9)+'" width="'+(18+(i%3)*11)+'" height="2.4" rx="1.2" fill="'+CFG.c2+'" opacity=".85"/>'+
   '<rect x="107" y="'+(y+14)+'" width="'+(30-(i%4)*6)+'" height="2" rx="1" fill="'+CFG.c1+'" opacity=".7"/>'+
   '<circle class="mg-led a" cx="168" cy="'+(y+h/2)+'" r="3" fill="'+CFG.c2+'"/>'+
   '<circle class="mg-led b" cx="178" cy="'+(y+h/2)+'" r="3" fill="'+(i%3===0?CFG.c3:'#22c55e')+'"/>'+
   '<circle class="mg-led c" cx="188" cy="'+(y+h/2)+'" r="3" fill="'+CFG.c1+'"/>'+
   '</g>'}
 return out}
function rackSvg(){
 var n=Math.round(CFG.bays),H=44+n*30+52;
 return '<svg id="mgRack" class="mg-rack" viewBox="0 0 240 '+H+'" aria-hidden="true">'+
 '<defs>'+
 '<linearGradient id="mgFrame" x1="0" y1="0" x2="1" y2="1">'+
  '<stop offset="0" stop-color="#2c3d57"/><stop offset=".45" stop-color="#16243a"/><stop offset="1" stop-color="#0a1120"/></linearGradient>'+
 '<linearGradient id="mgFace" x1="0" y1="0" x2="0" y2="1">'+
  '<stop offset="0" stop-color="#1b2942"/><stop offset=".5" stop-color="#111d31"/><stop offset="1" stop-color="#0b1526"/></linearGradient>'+
 '<linearGradient id="mgBar" x1="0" y1="0" x2="1" y2="0">'+
  '<stop class="mg-s1" offset="0" stop-color="'+CFG.c1+'"/><stop class="mg-s2" offset=".5" stop-color="'+CFG.c2+'"/><stop offset="1" stop-color="'+CFG.c3+'"/></linearGradient>'+
 '<radialGradient id="mgHalo" cx=".5" cy=".45" r=".55">'+
  '<stop class="mg-h1" offset="0" stop-color="'+CFG.c2+'" stop-opacity=".45"/><stop class="mg-h2" offset="1" stop-color="'+CFG.c1+'" stop-opacity="0"/></radialGradient>'+
 '</defs>'+
 '<ellipse cx="120" cy="'+(H*.45)+'" rx="118" ry="'+(H*.44)+'" fill="url(#mgHalo)"/>'+
 '<g id="mgBody">'+
 '<rect x="20" y="26" width="200" height="'+(H-52)+'" rx="9" fill="url(#mgFrame)" stroke="#33465f" stroke-width="1.6"/>'+
 '<rect x="24" y="30" width="192" height="'+(H-60)+'" rx="7" fill="#070d18" stroke="#1a2740"/>'+
 '<rect x="26" y="32" width="188" height="7" rx="3.5" fill="url(#mgBar)"/>'+
 '<text x="120" y="'+(H-32)+'" text-anchor="middle" font-family="ui-monospace,monospace" font-size="8" letter-spacing="2.4" fill="'+CFG.c2+'" opacity=".85">KEV FUSION · RACK</text>'+
 '<g id="mgUnits">'+unitsSvg()+'</g>'+
 '<g id="mgFans" transform="translate(0,'+(H-24)+')">'+
  '<g class="mg-fan" style="transform-origin:74px 0px"><circle cx="74" cy="0" r="11" fill="#0a1322" stroke="#22334c"/>'+
   '<g stroke="'+CFG.c2+'" stroke-width="2" opacity=".8" fill="none">'+
   '<path d="M74 -9 Q80 -3 74 0 Q68 -3 74 -9"/><path d="M83 0 Q77 6 74 0 Q77 -6 83 0"/>'+
   '<path d="M74 9 Q68 3 74 0 Q80 3 74 9"/><path d="M65 0 Q71 -6 74 0 Q71 6 65 0"/></g>'+
   '<circle cx="74" cy="0" r="2.4" fill="'+CFG.c3+'"/></g>'+
  '<g class="mg-fan" style="transform-origin:166px 0px"><circle cx="166" cy="0" r="11" fill="#0a1322" stroke="#22334c"/>'+
   '<g stroke="'+CFG.c1+'" stroke-width="2" opacity=".8" fill="none">'+
   '<path d="M166 -9 Q172 -3 166 0 Q160 -3 166 -9"/><path d="M175 0 Q169 6 166 0 Q169 -6 175 0"/>'+
   '<path d="M166 9 Q160 3 166 0 Q166 6 166 9"/><path d="M157 0 Q163 -6 166 0 Q163 6 157 0"/></g>'+
   '<circle cx="166" cy="0" r="2.4" fill="'+CFG.c3+'"/></g>'+
  '<g stroke="#1d2c44" stroke-width="2.4" fill="none" opacity=".9">'+
   '<path d="M96 2 Q120 16 144 2"/><path d="M100 6 Q120 22 140 6"/></g>'+
 '</g>'+
 '</g>'+
 (CFG.scan?'<rect id="mgScan" x="24" y="30" width="192" height="16" fill="'+CFG.c2+'" opacity=".14"/>':'')+
 '</svg>'}
function partsHtml(){
 if(!CFG.parts||!CFG.partCount)return '';
 var s='';for(var i=0;i<CFG.partCount;i++){
  s+='<i style="left:'+((i*7.1+4)%97).toFixed(1)+'%;animation-duration:'+(11+(i%8)*2.1).toFixed(1)+
   's;animation-delay:-'+(i*1.1).toFixed(1)+'s;width:'+(2+i%3)+'px;height:'+(2+i%3)+'px"></i>'}
 return s}
function applyVisual(){
 try{
  var r=document.documentElement.style;
  r.setProperty('--mg1',CFG.c1);r.setProperty('--mg2',CFG.c2);r.setProperty('--mg3',CFG.c3);
  r.setProperty('--mg-glow',(CFG.glow/100).toFixed(2));
  r.setProperty('--mg-grid',(CFG.grid/100).toFixed(2));
  r.setProperty('--mg-grain',(CFG.grain/100).toFixed(2));
  r.setProperty('--mg-den',(CFG.density/100).toFixed(2));
  r.setProperty('--mg-led',CFG.ledSpeed.toFixed(2)+'s');
  r.setProperty('--mg-fan',CFG.fanSpeed.toFixed(2)+'s');
  r.setProperty('--mg-scan',CFG.scanSpeed.toFixed(2)+'s');
  r.setProperty('--mg-tilt',CFG.tilt.toFixed(1)+'deg');
  r.setProperty('--mg-depth',CFG.depth.toFixed(0)+'px');
  document.body.classList.toggle('mg-fans',!!CFG.fans);
  document.body.classList.toggle('mg-scanon',!!CFG.scan);
  document.body.classList.toggle('mg-blur',!M.unlocked&&!!CFG.blurOnLock);
  var u=$('#mgUnits');if(u)u.innerHTML=unitsSvg();
  var rack=$('#mgRack');
  if(rack){var n=Math.round(CFG.bays),H=44+n*30+52;
   if(Math.abs(rack.viewBox.baseVal.height-H)>1){
    var wrap=rack.parentNode;if(wrap){wrap.innerHTML=rackSvg();rack=$('#mgRack')}}}
  [['.mg-s1',CFG.c1],['.mg-s2',CFG.c2],['.mg-h1',CFG.c2],['.mg-h2',CFG.c1]]
   .forEach(function(p){var e=$(p[0]);if(e)e.setAttribute('stop-color',p[1])});
  var sc=$('#mgScan');
  if(CFG.scan&&!sc){var body=$('#mgBody');
   if(body&&body.parentNode){var el=document.createElementNS('http://www.w3.org/2000/svg','rect');
    el.id='mgScan';el.setAttribute('x','24');el.setAttribute('y','30');
    el.setAttribute('width','192');el.setAttribute('height','16');
    el.setAttribute('fill',CFG.c2);el.setAttribute('opacity','.14');body.parentNode.appendChild(el)}}
  else if(!CFG.scan&&sc&&sc.parentNode)sc.parentNode.removeChild(sc);
  var pp=$('.mg-parts');
  if(pp){pp.innerHTML=partsHtml();pp.style.display=(CFG.parts&&CFG.partCount)?'':'none'}
 }catch(e){}}

/* ══════════ rendu ══════════ */
function stateKey(){
 return [M.unlocked?1:0,M.mode,M.err,M.busy?1:0,cooldown()>0?1:0,M.change?1:0,refHash()?1:0,
  CFG.session,CFG.idle,CFG.lockOnHide?1:0,CFG.everyTime?1:0,M.fails.n,M.log.length,M.fatal].join('|')}
function pwField(id,label,ph,val,extra){
 return '<label for="'+id+'">'+label+'</label>'+
 '<div class="mg-pwrow"><input id="'+id+'" data-mgpw="1" type="password" autocomplete="new-password" '+
  'placeholder="'+esc(ph)+'" value="'+esc(val||'')+'"'+(extra||'')+'>'+
  '<button class="mg-eye" data-mgeye="'+id+'" type="button" title="Afficher / masquer">👁</button>'+
  '<button class="mg-clr" data-mgclr="'+id+'" type="button" title="Effacer">✕</button></div>'}
function fallback(){
 var first=!refHash();
 return '<div class="mg-stage" id="mgStage"><div class="mg-inner" style="grid-template-columns:1fr">'+
 '<div class="mg-left"><span class="mg-kick">🔒 PAVÉ MODULES · ACCÈS ADMINISTRATEUR</span>'+
 '<h1>Modules techniques</h1>'+
 '<p class="mg-lede">Les six applications fusionnées sont réservées à l’administrateur. Le champ est vide.</p>'+
 '<div class="mg-form" style="grid-template-columns:1fr"><div class="mg-form-b">'+
 pwField('mgPw',first?'Créer le mot de passe administrateur':'Mot de passe administrateur',
  first?'8 caractères minimum':'Saisissez le mot de passe','')+
 (first?pwField('mgPw2','Confirmer le mot de passe','Répétez le mot de passe',''):'')+
 (M.err?'<p class="mg-err">'+esc(M.err)+'</p>':'')+
 '<div class="mg-form-a"><button class="mg-pri" data-mg="submit">'+(first?'🔐 Créer et ouvrir':'🔓 Déverrouiller')+'</button>'+
 '<button data-mg="home">🏠 Accueil</button></div>'+
 '<p class="mg-hint">Aucun mot de passe n’est pré-rempli.</p></div></div></div></div></div>'}
function renderGate(force){
 var v=$('#view');if(!v)return;
 var key=stateKey();
 if(!force&&key===M.renderKey&&v.querySelector('#mgStage'))return;
 M.renderKey=key;M.painting=true;
 if(M.cdT){clearInterval(M.cdT);M.cdT=null}
 var html='';
 try{html=fullGate()}catch(e){M.fatal=String(e&&e.message||e);html=fallback()}
 try{v.innerHTML=html}catch(e){try{v.innerHTML=fallback()}catch(e2){}}
 applyVisual();bindGate();cleanPw(v);
 var cd=cooldown();
 if(cd>0){M.cdT=setInterval(function(){
  var c=cooldown(),e=$('#mgCd');
  if(c<=0){clearInterval(M.cdT);M.cdT=null;M.renderKey='';renderGate(true);return}
  if(e)e.textContent=Math.ceil(c/1000)},300)}
 if(!cd){var p=$('#mgPw');if(p)nST(function(){try{p.focus()}catch(e){}},90)}
 paintTimer();syncDock();
 requestAnimationFrame(function(){requestAnimationFrame(function(){M.painting=false})})}
function fullGate(){
 var first=!refHash(),cd=cooldown();
 var sessMs=Math.max(1,CFG.session*60000);
 var left=M.unlocked?Math.max(0,M.exp-Date.now()):0;
 var st=strength(M.change?M.change.n1:M.pw);
 var changing=M.unlocked&&M.mode==='change';
 var MODS=[['2026tech','Base technique & motorisations','#22c55e'],
  ['kev-diag-incendie','Diagnostic incendie & origine','#ff4d6d'],
  ['auto-legal','Auto-Droit & procédures','#ffb020'],
  ['autodiag-formation','Auto-diagnostic & formation','#22d3ee'],
  ['new-mrt-kevin','MRT & mesures routières','#a855f7'],
  ['aide-technique','Aide technique & documentation','#2563eb']];
 return '<div class="mg-stage" id="mgStage">'+
 '<div class="mg-grid"></div><div class="mg-aur"></div><div class="mg-grain"></div>'+
 '<div class="mg-parts">'+partsHtml()+'</div>'+
 '<div class="mg-inner"><div class="mg-left">'+
 '<span class="mg-kick">'+(M.unlocked?'🧩 SESSION ADMINISTRATEUR ACTIVE':'🔒 PAVÉ MODULES · MOT DE PASSE ADMINISTRATEUR')+'</span>'+
 '<h1>Modules techniques</h1>'+
 '<p class="mg-lede">Le pavé <b>Modules</b> réunit les six applications fusionnées. '+
  'Comme JusteRepère, il est <b>réservé à l’administrateur</b> : aucun onglet, aucune carte, '+
  'aucune iframe et aucun lien direct ne s’ouvre sans mot de passe.</p>'+
 '<div class="mg-mods">'+MODS.map(function(m,i){
  return '<div class="mg-mod" style="--mc:'+m[2]+';--d:'+(i*60)+'ms">'+
   '<span class="mg-mod-led"></span><div><b>'+esc(m[0])+'</b><span>'+esc(m[1])+'</span></div>'+
   '<em>'+(M.unlocked?'OUVERT':'VERROUILLÉ')+'</em></div>'}).join('')+'</div>'+
 (M.unlocked?
  '<div class="mg-session">'+
   '<div class="mg-ring" style="--p:'+(left/sessMs*100).toFixed(1)+'"><b id="mgClock">'+mmss(left)+'</b><span>session</span></div>'+
   '<div class="mg-sess-t"><b>Accès ouvert</b>'+
    '<span>Expiration dans '+mmss(left)+' · verrouillage après '+CFG.idle+' min d’inactivité'+
    (CFG.lockOnHide?' · verrouillage si l’onglet est masqué':'')+'</span>'+
    '<div class="mg-sess-a"><button class="mg-pri" data-mg="go">🧩 Ouvrir les modules</button>'+
     '<button class="mg-danger" data-mg="lock">🔒 Verrouiller maintenant</button>'+
     '<button data-mg="change">🔑 Changer le mot de passe</button></div></div></div>'
  :
  '<div class="mg-form"><div class="mg-rackwrap">'+rackSvg()+'</div><div class="mg-form-b">'+
   pwField('mgPw',first?'Créer le mot de passe administrateur':'Mot de passe administrateur',
    first?'8 caractères minimum':'Saisissez le mot de passe',M.pw,cd>0?' disabled':'')+
   (first?pwField('mgPw2','Confirmer le mot de passe','Répétez le mot de passe',M.pw2):'')+
   '<div class="mg-str"><i style="width:'+st+'%" class="'+(st<40?'ko':st<70?'warn':'ok')+'"></i></div>'+
   '<span class="mg-str-l">'+(M.pw||first?(st<40?'Faible':st<70?'Correct':'Robuste')+' · '+st+'/100':'Champ vide')+'</span>'+
   '<p class="mg-vide">Champ vide à l’ouverture · aucun mot de passe pré-rempli · saisie masquée</p>'+
   (M.caps?'<p class="mg-caps">⇪ Verrouillage majuscules actif</p>':'')+
   (M.err?'<p class="mg-err">'+esc(M.err)+'</p>':'')+
   (cd>0?'<p class="mg-cool">Blocage temporaire · <b id="mgCd">'+Math.ceil(cd/1000)+'</b> s</p>':'')+
   '<div class="mg-form-a">'+
    '<button class="mg-pri" data-mg="submit"'+(cd>0||M.busy?' disabled':'')+'>'+(M.busy?'Vérification…':first?'🔐 Créer et ouvrir':'🔓 Déverrouiller')+'</button>'+
    '<button data-mg="home">🏠 Accueil</button>'+
    '<button data-mg="sound" id="mgMute">'+(AU.on?'🔊':'🔇')+'</button></div>'+
   '<p class="mg-hint">'+(first?'Aucun mot de passe n’est encore défini pour les modules. Le premier mot de passe saisi devient la référence.'
    :M.hasApp?'Le mot de passe administrateur de l’application est requis.'
    :'Le mot de passe administrateur est requis — le même que JusteRepère s’il est déjà défini.')+' Entrée pour valider.</p>'+
  '</div></div>')+
 (changing?'<div class="mg-change"><b>🔑 Changer le mot de passe des modules</b>'+
  (M.hasApp?'<p class="mg-err">Mot de passe défini par l’application : modifiez-le depuis l’espace Admin.</p>':'')+
  pwField('mgOld','Mot de passe actuel','Saisissez le mot de passe actuel',(M.change||{}).old)+
  pwField('mgN1','Nouveau mot de passe','8 caractères minimum',(M.change||{}).n1)+
  pwField('mgN2','Confirmer le nouveau mot de passe','Répétez le nouveau mot de passe',(M.change||{}).n2)+
  (M.err?'<p class="mg-err">'+esc(M.err)+'</p>':'')+
  '<div class="mg-form-a"><button class="mg-pri" data-mg="dosave">💾 Enregistrer</button>'+
  '<button data-mg="cancelchange">Annuler</button></div></div>':'')+
 '</div><aside class="mg-right">'+dock()+
  '<div class="mg-panel"><b>État de la protection</b><table class="mg-tbl">'+
   '<tr><td>Accès</td><td><b class="'+(M.unlocked?'ok':'ko')+'">'+(M.unlocked?'Ouvert':'Verrouillé')+'</b></td></tr>'+
   '<tr><td>Référence</td><td>'+(M.hasApp?'Mot de passe de l’application':refHash()?'Mot de passe local défini':'À définir')+'</td></tr>'+
   '<tr><td>Champ mot de passe</td><td><b class="ok">Vide · sans points</b></td></tr>'+
   '<tr><td>Session</td><td>'+CFG.session+' min</td></tr>'+
   '<tr><td>Inactivité</td><td>'+CFG.idle+' min</td></tr>'+
   '<tr><td>Onglet masqué</td><td>'+(CFG.lockOnHide?'Verrouille':'Ignore')+'</td></tr>'+
   '<tr><td>À chaque ouverture</td><td>'+(CFG.everyTime?'Mot de passe requis':'Session d’onglet')+'</td></tr>'+
   '<tr><td>Tentatives échouées</td><td><b class="'+(M.fails.n?'ko':'ok')+'">'+(M.fails.n||0)+'</b></td></tr>'+
   '<tr><td>Portée</td><td>Onglets · cartes · iframes · liens</td></tr>'+
  '</table></div>'+
  '<div class="mg-panel"><b>Journal des accès</b><div class="mg-log" id="mgLog">'+logHtml()+'</div>'+
   '<div class="mg-panel-a"><button data-mg="export">🧾 Exporter</button><button data-mg="clearlog">Vider</button></div></div>'+
 '</aside></div></div>'}
function dock(){
 return '<div class="mg-panel mg-dock"><b>🎛️ Atelier visuel · baie technique</b>'+
 vrg('bays','Unités de baie',2,10,'',1)+
 vrg('ledSpeed','Cycle des voyants',.4,10,' s',.1)+
 vrg('fanSpeed','Rotation ventilateurs',.3,8,' s',.1)+
 vrg('scanSpeed','Balayage lumineux',1,14,' s',.1)+
 vrg('tilt','Inclinaison du rack',0,16,'°',.5)+
 vrg('depth','Profondeur (ombre)',0,34,' px',1)+
 vrg('partCount','Particules',0,44,'',1)+
 vrg('glow','Halo technique',0,100,'%',1)+
 vrg('grid','Grille de fond',0,80,'',1)+
 vrg('grain','Grain',0,40,'',1)+
 vrg('density','Densité interface',85,125,'%',1)+
 '<div class="mg-vcols">'+
  '<div><input type="color" data-mgv="c1" value="'+CFG.c1+'"><span>Châssis</span></div>'+
  '<div><input type="color" data-mgv="c2" value="'+CFG.c2+'"><span>Signal</span></div>'+
  '<div><input type="color" data-mgv="c3" value="'+CFG.c3+'"><span>Alerte</span></div></div>'+
 '<div class="mg-vtgs">'+vtg('fans','Ventilateurs')+vtg('scan','Balayage')+
  vtg('parts','Particules')+vtg('blurOnLock','Fond flouté')+'</div>'+
 '<div class="mg-vbtns"><button data-mgv-act="reset">↺ Réinitialiser</button>'+
  '<button data-mgv-act="rand">🎲 Aléatoire</button>'+
  '<button data-mgv-act="sound" id="mgVMute">'+(AU.on?'🔊 Son actif':'🔇 Muet')+'</button></div>'+
 '<p class="mg-vnote">Chaque réglage s’applique <b>en direct</b> sur la baie, les voyants et l’arrière-plan.</p></div>'}
function vrg(k,l,a,b,u,s){
 var val=(k==='ledSpeed'||k==='fanSpeed'||k==='scanSpeed'||k==='tilt')?(+CFG[k]).toFixed(1):CFG[k];
 return '<div class="mg-vc"><label>'+l+' <b id="mgvo_'+k+'">'+val+u+'</b></label>'+
 '<input type="range" data-mgv="'+k+'" data-u="'+u+'" min="'+a+'" max="'+b+'" step="'+(s||1)+'" value="'+CFG[k]+'"></div>'}
function vtg(k,l){return '<label class="mg-vtg'+(CFG[k]?' on':'')+'" id="mgvt_'+k+'"><input type="checkbox" data-mgvt="'+k+'"'+(CFG[k]?' checked':'')+'> '+l+'</label>'}
function syncDock(){
 try{
  $$('[data-mgv]').forEach(function(e){var k=e.dataset.mgv;e.value=CFG[k];
   var o=$('#mgvo_'+k);if(o)o.textContent=(k==='ledSpeed'||k==='fanSpeed'||k==='scanSpeed'||k==='tilt'?(+CFG[k]).toFixed(1):CFG[k])+(e.dataset.u||'')});
  ['fans','scan','parts','blurOnLock'].forEach(function(k){
   var w=$('#mgvt_'+k);if(w){var i=w.querySelector('input');if(i)i.checked=!!CFG[k];w.classList.toggle('on',!!CFG[k])}});
  var m=$('#mgVMute');if(m)m.textContent=AU.on?'🔊 Son actif':'🔇 Muet';
 }catch(e){}}
function paintTimer(){
 try{
  var sessMs=Math.max(1,CFG.session*60000),left=Math.max(0,M.exp-Date.now());
  var c=$('#mgClock');if(c)c.textContent=mmss(left);
  var r=$('.mg-ring');if(r)r.style.setProperty('--p',(left/sessMs*100).toFixed(1));
  var t=$('#mgBarClock');if(t)t.textContent=mmss(left);
  var s=$('#mgBarState');if(s)s.textContent=M.unlocked?'OUVERT':'VERROUILLÉ';
 }catch(e){}}
function paintStrength(){
 try{var st=strength(M.change?M.change.n1||'':M.pw);
  var i=$('.mg-str i');if(i){i.style.width=st+'%';i.className=st<40?'ko':st<70?'warn':'ok'}
  var l=$('.mg-str-l');
  if(l)l.textContent=(M.pw||M.change||!refHash())?((st<40?'Faible':st<70?'Correct':'Robuste')+' · '+st+'/100'):'Champ vide';
 }catch(e){}}
function bindGate(){
 var v=$('#view');if(!v||v._mg)return;v._mg=1;
 v.addEventListener('input',function(e){
  var t=e.target;if(!t)return;
  if(t.id==='mgPw'){M.pw=t.value;paintStrength();return}
  if(t.id==='mgPw2'){M.pw2=t.value;return}
  if(t.id==='mgOld'){M.change=M.change||{};M.change.old=t.value;return}
  if(t.id==='mgN1'){M.change=M.change||{};M.change.n1=t.value;paintStrength();return}
  if(t.id==='mgN2'){M.change=M.change||{};M.change.n2=t.value;return}
  var k=t.dataset&&t.dataset.mgv;
  if(k){CFG[k]=+t.value;normCfg();saveCfg();applyVisual();
   var o=$('#mgvo_'+k);
   if(o)o.textContent=(k==='ledSpeed'||k==='fanSpeed'||k==='scanSpeed'||k==='tilt'?(+CFG[k]).toFixed(1):CFG[k])+(t.dataset.u||'');
   return}});
 v.addEventListener('change',function(e){
  var t=e.target;if(!t)return;
  var k=t.dataset&&t.dataset.mgv;
  if(k&&t.type==='color'){CFG[k]=t.value;normCfg();saveCfg();applyVisual();syncNav();snd('tick');return}
  var g=t.dataset&&t.dataset.mgvt;
  if(g){CFG[g]=t.checked;saveCfg();applyVisual();
   var w=$('#mgvt_'+g);if(w)w.classList.toggle('on',CFG[g]);snd('tick');return}});
 v.addEventListener('keydown',function(e){
  var id=e.target&&e.target.id||'';
  if(e.key==='Enter'&&(id==='mgPw'||id==='mgPw2')){e.preventDefault();submit();return}
  if(e.key==='Enter'&&/^mg(Old|N1|N2)$/.test(id)){e.preventDefault();changePw();return}
  try{if(e.getModifierState){var c=e.getModifierState('CapsLock');
   if(c!==M.caps){M.caps=c;var el=$('.mg-caps');
    if(c&&!el){var p=$('#mgPw');if(p&&p.parentNode&&p.parentNode.parentNode){
     var d=document.createElement('p');d.className='mg-caps';d.textContent='⇪ Verrouillage majuscules actif';
     p.parentNode.parentNode.insertBefore(d,p.parentNode.nextSibling)}}
    else if(!c&&el&&el.parentNode)el.parentNode.removeChild(el)}}}catch(x){}});
 v.addEventListener('click',function(e){
  var eye=e.target.closest?e.target.closest('[data-mgeye]'):null;
  if(eye){var i=$('#'+eye.dataset.mgeye);
   if(i){i.type=i.type==='password'?'text':'password';eye.textContent=i.type==='password'?'👁':'🙈';
    try{i.focus()}catch(x){}}return}
  var clr=e.target.closest?e.target.closest('[data-mgclr]'):null;
  if(clr){var id=clr.dataset.mgclr,f=$('#'+id);
   if(f){f.value='';f.dataset.mgTyped='1'}
   if(id==='mgPw')M.pw='';if(id==='mgPw2')M.pw2='';
   if(M.change){if(id==='mgOld')M.change.old='';if(id==='mgN1')M.change.n1='';if(id==='mgN2')M.change.n2=''}
   paintStrength();snd('clear');try{if(f)f.focus()}catch(x){}return}
  var va=e.target.closest?e.target.closest('[data-mgv-act]'):null;
  if(va){var a=va.dataset.mgvAct;
   if(a==='reset'){var keep={session:CFG.session,idle:CFG.idle,lockOnHide:CFG.lockOnHide,everyTime:CFG.everyTime};
    CFG=Object.assign({},DEF,keep);normCfg();saveCfg();applyVisual();syncDock();syncNav();
    snd('tick');toast('↺ Atelier visuel réinitialisé');return}
   if(a==='rand'){var pal=[['#2563eb','#22d3ee','#ffb020'],['#7c3aed','#22d3ee','#ff4d9d'],
     ['#0ea5e9','#a3e635','#ffb020'],['#1d4ed8','#38bdf8','#ff4d6d'],
     ['#0891b2','#22c55e','#ffd166'],['#4338ca','#c084fc','#22d3ee']];
    var p=pal[Math.floor(Math.random()*pal.length)];CFG.c1=p[0];CFG.c2=p[1];CFG.c3=p[2];
    CFG.bays=2+Math.floor(Math.random()*9);CFG.ledSpeed=+(0.5+Math.random()*6).toFixed(1);
    CFG.fanSpeed=+(0.4+Math.random()*4).toFixed(1);CFG.scanSpeed=+(1.5+Math.random()*9).toFixed(1);
    CFG.tilt=+(Math.random()*14).toFixed(1);CFG.depth=Math.floor(Math.random()*32);
    CFG.glow=25+Math.floor(Math.random()*70);CFG.grid=Math.floor(Math.random()*70);
    CFG.grain=Math.floor(Math.random()*30);CFG.partCount=Math.floor(Math.random()*40);
    normCfg();saveCfg();applyVisual();syncDock();syncNav();snd('bay');toast('🎲 Variante de baie générée');return}
   if(a==='sound'){AU.on=!AU.on;LS.s('mgSound',AU.on);syncDock();
    var m=$('#mgMute');if(m)m.textContent=AU.on?'🔊':'🔇';
    var b=$('#mgBarSound');if(b)b.textContent=AU.on?'🔊':'🔇';if(AU.on)snd('tick');return}
   return}
  var b=e.target.closest?e.target.closest('[data-mg]'):null;if(!b)return;
  var k=b.dataset.mg;
  if(k==='submit'){submit();return}
  if(k==='home'){try{if(typeof window.__mgInner==='function')window.__mgInner('accueil')}catch(x){}return}
  if(k==='sound'){AU.on=!AU.on;LS.s('mgSound',AU.on);b.textContent=AU.on?'🔊':'🔇';syncDock();
   var m2=$('#mgBarSound');if(m2)m2.textContent=AU.on?'🔊':'🔇';if(AU.on)snd('tick');return}
  if(k==='lock'){revoke('Verrouillage manuel');return}
  if(k==='go'){M.target='modules';openTarget();return}
  if(k==='change'){M.mode='change';M.change={};M.err='';renderGate(true);return}
  if(k==='cancelchange'){M.mode='ask';M.change=null;M.err='';renderGate(true);return}
  if(k==='dosave'){changePw();return}
  if(k==='export'){dl(new Blob([JSON.stringify({ts:new Date().toISOString(),config:CFG,
   tentatives:M.fails,journal:M.log},null,2)],{type:'application/json'}),
   'KEV-FUSION-modules-journal-'+new Date().toISOString().slice(0,10)+'.json');snd('out');toast('🧾 Journal exporté');return}
  if(k==='clearlog'){M.log=[];LS.s('mgLog',[]);M.renderKey='';
   var el=$('#mgLog');if(el)el.innerHTML=logHtml();snd('tick');return}})}

/* ══════════ barre de sécurité ══════════ */
function offsets(){
 try{
  var tb=$('#tbBar'),jb=$('#jrgBar');
  var h=(tb?tb.offsetHeight:0)+(jb?jb.offsetHeight:0);
  var r=document.documentElement.style;
  r.setProperty('--mg-off',h+'px');
  var mb=$('#mgBar');r.setProperty('--mg-h',(mb?mb.offsetHeight:0)+'px');
 }catch(e){}}
function bar(){
 try{
  var cur=view(),show=M.unlocked&&(isMod(cur)||cur==='modgate');
  document.body.classList.toggle('mg-bar-on',show);
  if(!show){var b=$('#mgBar');if(b&&b.parentNode)b.parentNode.removeChild(b);offsets();return}
  attachBar();
 }catch(e){}}
function attachBar(){
 try{
  var cur=view();
  if(!M.unlocked||!(isMod(cur)||cur==='modgate')){
   var x=$('#mgBar');if(x&&x.parentNode)x.parentNode.removeChild(x);
   document.body.classList.remove('mg-bar-on');offsets();return}
  document.body.classList.add('mg-bar-on');
  if($('#mgBar')){paintTimer();syncBar();offsets();return}
  var b=document.createElement('div');b.id='mgBar';
  b.innerHTML='<div class="mg-bar-id"><span class="mg-bar-ic">🧩</span>'+
   '<div><b>SÉCURITÉ MODULES</b><span id="mgBarState">OUVERT</span></div>'+
   '<div class="mg-bar-clock" id="mgBarClock">--:--</div>'+
   '<button class="mg-bar-lock" data-mgb="lock">🔒 Verrouiller</button></div>'+
   '<div class="mg-bar-tools">'+
   brg('session','Session',5,120,' min',1)+brg('idle','Inactivité',1,30,' min',1)+
   '<div class="mg-btgs">'+btg('lockOnHide','Onglet masqué')+btg('everyTime','À chaque ouverture')+
    btg('blurOnLock','Masquer au verrou')+btg('fans','Ventilateurs')+btg('scan','Balayage')+btg('parts','Particules')+'</div>'+
   brg('bays','Unités',2,10,'',1)+brg('ledSpeed','Voyants',.4,10,' s',.1)+
   brg('fanSpeed','Ventilos',.3,8,' s',.1)+brg('tilt','Inclinaison',0,16,'°',.5)+
   brg('glow','Halo',0,100,'%',1)+brg('grain','Grain',0,40,'',1)+brg('density','Densité',85,125,'%',1)+
   '<div class="mg-bcols">'+
    '<div><input type="color" data-mgb="c1" value="'+CFG.c1+'"><span>Châssis</span></div>'+
    '<div><input type="color" data-mgb="c2" value="'+CFG.c2+'"><span>Signal</span></div>'+
    '<div><input type="color" data-mgb="c3" value="'+CFG.c3+'"><span>Alerte</span></div></div>'+
   '<div class="mg-bbtns"><button data-mgb="change">🔑 Mot de passe</button>'+
    '<button data-mgb="export">🧾 Journal</button>'+
    '<button data-mgb="sound" id="mgBarSound">'+(AU.on?'🔊':'🔇')+'</button>'+
    '<button data-mgb="reset">↺</button><button data-mgb="rand">🎲</button>'+
    '<button class="p" data-mgb="gate">🧩 État</button></div></div>';
  document.body.appendChild(b);
  b.addEventListener('input',function(e){
   var k=e.target.dataset&&e.target.dataset.mgb;if(!k)return;
   CFG[k]=e.target.type==='range'?+e.target.value:e.target.value;normCfg();
   var o=$('#mgbo_'+k);
   if(o)o.textContent=(k==='ledSpeed'||k==='fanSpeed'||k==='tilt'?(+CFG[k]).toFixed(1):CFG[k])+
    (k==='session'||k==='idle'?' min':k==='ledSpeed'||k==='fanSpeed'?' s':k==='tilt'?'°':k==='grain'||k==='bays'?'':'%');
   saveCfg();applyVisual();
   if(k==='session'&&M.unlocked){M.exp=Date.now()+CFG.session*60000;paintTimer()}
   if(k==='c1'||k==='c2'||k==='c3')syncNav();
   snd('tick');offsets()});
  b.addEventListener('change',function(e){
   var k=e.target.dataset&&e.target.dataset.mgbt;if(!k)return;
   CFG[k]=e.target.checked;var w=$('#mgbt_'+k);if(w)w.classList.toggle('on',CFG[k]);
   saveCfg();applyVisual();
   if(k==='everyTime'&&CFG.everyTime){try{sessionStorage.removeItem('kf_mgSession')}catch(x){}}
   snd('tick')});
  b.addEventListener('click',function(e){
   var t=e.target.closest?e.target.closest('[data-mgb]'):null;if(!t)return;
   var k=t.dataset.mgb;
   if(k==='lock'){revoke('Verrouillage depuis la barre de sécurité');return}
   if(k==='gate'){M.mode='ask';showGate();return}
   if(k==='change'){M.mode='change';M.change={};M.err='';showGate();return}
   if(k==='export'){dl(new Blob([JSON.stringify({ts:new Date().toISOString(),config:CFG,journal:M.log},null,2)],
    {type:'application/json'}),'KEV-FUSION-modules-journal-'+new Date().toISOString().slice(0,10)+'.json');
    snd('out');toast('🧾 Journal exporté');return}
   if(k==='sound'){AU.on=!AU.on;LS.s('mgSound',AU.on);t.textContent=AU.on?'🔊':'🔇';
    var m=$('#mgMute');if(m)m.textContent=AU.on?'🔊':'🔇';syncDock();if(AU.on)snd('tick');return}
   if(k==='reset'){var keep={session:CFG.session,idle:CFG.idle,lockOnHide:CFG.lockOnHide,everyTime:CFG.everyTime};
    CFG=Object.assign({},DEF,keep);normCfg();saveCfg();applyVisual();
    var bb=$('#mgBar');if(bb&&bb.parentNode)bb.parentNode.removeChild(bb);attachBar();
    syncNav();if(view()==='modgate')renderGate(true);snd('tick');toast('↺ Réglages réinitialisés');return}
   if(k==='rand'){var pal=[['#2563eb','#22d3ee','#ffb020'],['#7c3aed','#22d3ee','#ff4d9d'],
     ['#0ea5e9','#a3e635','#ffb020'],['#1d4ed8','#38bdf8','#ff4d6d'],['#0891b2','#22c55e','#ffd166']];
    var p=pal[Math.floor(Math.random()*pal.length)];CFG.c1=p[0];CFG.c2=p[1];CFG.c3=p[2];
    CFG.bays=2+Math.floor(Math.random()*9);CFG.glow=25+Math.floor(Math.random()*70);
    CFG.grain=Math.floor(Math.random()*30);CFG.tilt=+(Math.random()*14).toFixed(1);
    normCfg();saveCfg();applyVisual();
    var b2=$('#mgBar');if(b2&&b2.parentNode)b2.parentNode.removeChild(b2);attachBar();
    syncNav();if(view()==='modgate')renderGate(true);snd('bay');toast('🎲 Thème de baie généré');return}});
  syncBar();paintTimer();applyVisual();offsets();
 }catch(e){}}
function brg(k,l,a,b,u,s){
 var val=(k==='ledSpeed'||k==='fanSpeed'||k==='tilt')?(+CFG[k]).toFixed(1):CFG[k];
 return '<div class="mg-bc"><label>'+l+' <b id="mgbo_'+k+'">'+val+u+'</b></label>'+
 '<input type="range" data-mgb="'+k+'" min="'+a+'" max="'+b+'" step="'+(s||1)+'" value="'+CFG[k]+'"></div>'}
function btg(k,l){return '<label class="mg-btg'+(CFG[k]?' on':'')+'" id="mgbt_'+k+'"><input type="checkbox" data-mgbt="'+k+'"'+(CFG[k]?' checked':'')+'> '+l+'</label>'}
function syncBar(){
 try{
  $$('[data-mgb]').forEach(function(e){var k=e.dataset.mgb;if(e.type==='range'||e.type==='color')e.value=CFG[k]});
  ['session','idle','bays','ledSpeed','fanSpeed','tilt','glow','grain','density'].forEach(function(k){
   var o=$('#mgbo_'+k);
   if(o)o.textContent=(k==='ledSpeed'||k==='fanSpeed'||k==='tilt'?(+CFG[k]).toFixed(1):CFG[k])+
    (k==='session'||k==='idle'?' min':k==='ledSpeed'||k==='fanSpeed'?' s':k==='tilt'?'°':k==='grain'||k==='bays'?'':'%')});
  ['lockOnHide','everyTime','blurOnLock','fans','scan','parts'].forEach(function(k){
   var w=$('#mgbt_'+k);if(w){var i=w.querySelector('input');if(i)i.checked=!!CFG[k];w.classList.toggle('on',!!CFG[k])}});
 }catch(e){}}

/* ══════════ CSS ══════════ */
function css(){
 if($('#mgCss'))return;var s=document.createElement('style');s.id='mgCss';
 s.textContent=
 ':root{--mg1:#2563eb;--mg2:#22d3ee;--mg3:#ffb020;--mg-glow:.58;--mg-grid:.32;--mg-grain:.12;--mg-den:1;'+
 '--mg-led:2.4s;--mg-fan:1.6s;--mg-scan:4.5s;--mg-tilt:5deg;--mg-depth:14px;--mg-h:0px;--mg-off:0px;'+
 '--mg-ink:#050b16;--mg-ink2:#0a1322;--mg-surf:#0e1a2e;--mg-line:#1b2c46;--mg-line2:#28405f;'+
 '--mg-tx:#eaf2ff;--mg-tx2:#c0d2ea;--mg-mut:#8aa2c0;--mg-dim:#5d7595;'+
 '--mg-green:#22c55e;--mg-red:#ff4d6d;--mg-purple:#a855f7}'+
 'body.mg-blur #bgLayer,body.mg-blur #wallLayer{filter:blur(14px) saturate(.62)}'+
 'body.mg-locked nav#nav button[data-k="modules"],body.mg-locked nav#nav button[data-k="module"],'+
 'body.mg-locked nav#nav button[data-k="mods"],body.mg-locked nav#nav button[data-k="apps"],'+
 'body.mg-locked nav#nav button[data-k="applis"]{display:none!important}'+
 'body.mg-locked iframe.mod,body.mg-locked iframe[data-mod]{display:none!important}'+
 '.mg-stage{position:relative;border-radius:22px;overflow:hidden;border:1px solid var(--mg-line);'+
  'background:linear-gradient(142deg,#050b16 0%,#0a1a30 32%,#0d1c3a 58%,#141033 82%,#1c0f26 100%);'+
  'box-shadow:0 24px 64px #000c;min-height:min(80vh,780px)}'+
 '.mg-grid{position:absolute;inset:0;opacity:var(--mg-grid);'+
  'background-image:linear-gradient(#22d3ee1c 1px,transparent 1px),linear-gradient(90deg,#22d3ee1c 1px,transparent 1px);'+
  'background-size:30px 30px;-webkit-mask-image:radial-gradient(78% 78% at 24% 20%,#000,transparent);mask-image:radial-gradient(78% 78% at 24% 20%,#000,transparent)}'+
 '.mg-aur{position:absolute;inset:-14%;pointer-events:none;opacity:calc(var(--mg-glow)*.6);mix-blend-mode:screen;'+
  'background:radial-gradient(38% 44% at 12% 6%,var(--mg1),transparent 62%),'+
  'radial-gradient(36% 42% at 90% 10%,var(--mg2),transparent 60%),'+
  'radial-gradient(44% 50% at 76% 96%,var(--mg-purple),transparent 62%),'+
  'radial-gradient(30% 36% at 28% 94%,var(--mg3),transparent 60%);animation:mgAur 20s ease-in-out infinite alternate}'+
 '@keyframes mgAur{to{transform:translate3d(2.4%,-2%,0) scale(1.08)}}'+
 '.mg-grain{position:absolute;inset:0;pointer-events:none;opacity:var(--mg-grain);mix-blend-mode:overlay;'+
  'background-image:radial-gradient(#cfe4ff 1px,transparent 1px);background-size:3px 3px}'+
 '.mg-parts{position:absolute;inset:0;pointer-events:none;overflow:hidden;contain:strict}'+
 '.mg-parts i{position:absolute;bottom:-12px;border-radius:50%;background:var(--mg2);'+
  'box-shadow:0 0 12px var(--mg2);opacity:.5;animation:mgUp 17s linear infinite}'+
 '@keyframes mgUp{0%{transform:translateY(0);opacity:0}14%{opacity:.6}86%{opacity:.32}100%{transform:translateY(-106vh);opacity:0}}'+
 '.mg-inner{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 344px;gap:22px;padding:26px;align-items:start}'+
 '@media(max-width:1080px){.mg-inner{grid-template-columns:1fr;padding:20px}}'+
 '.mg-left{min-width:0}'+
 '.mg-kick{display:inline-block;font:800 10px/1 system-ui;letter-spacing:1.7px;color:#050b16;'+
  'background:linear-gradient(90deg,var(--mg2),var(--mg1));padding:7px 13px;border-radius:8px;margin-bottom:14px}'+
 '.mg-left h1{font-size:clamp(30px,5.4vw,46px);margin:0 0 10px;color:#f2f8ff;letter-spacing:-1.2px;font-weight:800}'+
 '.mg-lede{margin:0 0 16px;font-size:14px;line-height:1.7;color:#a6bcd8;max-width:660px}'+
 '.mg-lede b{color:#e9f3ff}'+
 '.mg-mods{display:grid;grid-template-columns:repeat(auto-fit,minmax(212px,1fr));gap:8px;margin-bottom:18px}'+
 '.mg-mod{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:11px;'+
  'border:1px solid var(--mg-line);border-left:3px solid var(--mc);background:#0a1322cc;'+
  'animation:mgIn .5s ease-out both;animation-delay:var(--d)}'+
 '@keyframes mgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'+
 '.mg-mod-led{width:8px;height:8px;border-radius:50%;flex:none;background:var(--mc);box-shadow:0 0 9px var(--mc);'+
  'animation:mgBlink var(--mg-led) ease-in-out infinite}'+
 '.mg-mod>div{flex:1;min-width:0}'+
 '.mg-mod b{display:block;font-size:11.5px;color:var(--mg-tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.mg-mod span{display:block;font-size:9.5px;color:var(--mg-dim);margin-top:2px}'+
 '.mg-mod em{font-style:normal;font:800 8px/1 system-ui;letter-spacing:.8px;color:var(--mc);'+
  'border:1px solid var(--mc);border-radius:8px;padding:4px 6px;flex:none}'+
 '.mg-form{display:grid;grid-template-columns:230px minmax(0,1fr);gap:22px;align-items:center;'+
  'border:1px solid var(--mg-line2);border-radius:18px;padding:22px;'+
  'background:linear-gradient(150deg,#0a1322dd,#0e1a2ecc 60%,#141033cc);box-shadow:0 16px 44px #000a}'+
 '@media(max-width:760px){.mg-form{grid-template-columns:1fr;padding:18px}}'+
 '.mg-rackwrap{perspective:800px}'+
 '.mg-rack{width:100%;height:auto;transform:rotateX(var(--mg-tilt)) rotateY(calc(var(--mg-tilt)*-.5));'+
  'filter:drop-shadow(0 var(--mg-depth) calc(var(--mg-depth)*1.4) #000b)}'+
 '.mg-led{animation:mgBlink var(--mg-led) ease-in-out infinite}'+
 '.mg-led.b{animation-delay:.35s}.mg-led.c{animation-delay:.7s}'+
 '.mg-unit:nth-child(2n) .mg-led{animation-delay:.5s}'+
 '.mg-unit:nth-child(3n) .mg-led.a{animation-delay:.9s}'+
 '@keyframes mgBlink{0%,100%{opacity:.28}45%{opacity:1}60%{opacity:.5}}'+
 '.mg-oled{animation:mgOled calc(var(--mg-led)*1.7) steps(6,end) infinite}'+
 '@keyframes mgOled{0%,100%{opacity:.35}50%{opacity:.95}}'+
 'body.mg-fans .mg-fan{animation:mgSpin var(--mg-fan) linear infinite}'+
 '@keyframes mgSpin{to{transform:rotate(360deg)}}'+
 'body.mg-scanon #mgScan{animation:mgScan var(--mg-scan) linear infinite}'+
 '@keyframes mgScan{0%{transform:translateY(0);opacity:0}12%{opacity:.2}88%{opacity:.16}100%{transform:translateY(230px);opacity:0}}'+
 '.mg-form-b label,.mg-change label{display:block;font-size:10px;font-weight:800;letter-spacing:.9px;'+
  'text-transform:uppercase;color:var(--mg-dim);margin:12px 0 6px}'+
 '.mg-form-b label:first-child{margin-top:0}'+
 '.mg-pwrow{display:flex;gap:7px}'+
 '.mg-pwrow input{flex:1;min-width:0;margin:0;padding:14px 15px;font-size:16px;font-family:ui-monospace,monospace;'+
  'letter-spacing:.5px;background:#050b16;border:1px solid var(--mg-line2);color:var(--mg-tx);border-radius:12px}'+
 '.mg-pwrow input::placeholder{color:#4a6285;letter-spacing:0;font-family:system-ui,sans-serif;font-size:13.5px}'+
 '.mg-pwrow input:focus{outline:none;border-color:var(--mg2);box-shadow:0 0 0 4px #22d3ee26}'+
 '.mg-pwrow input:disabled{opacity:.5}'+
 '.mg-eye,.mg-clr{flex:none;background:#050b16;border:1px solid var(--mg-line2);border-radius:12px;padding:0 13px;font-size:16px;cursor:pointer}'+
 '.mg-eye{color:var(--mg2)}.mg-clr{color:var(--mg-red)}'+
 '.mg-eye:hover{border-color:var(--mg2)}.mg-clr:hover{border-color:var(--mg-red);background:#ff4d6d14}'+
 '.mg-str{height:6px;border-radius:6px;background:#050b16;border:1px solid var(--mg-line);overflow:hidden;margin-top:9px}'+
 '.mg-str i{display:block;height:100%;transition:width .25s}'+
 '.mg-str i.ko{background:linear-gradient(90deg,var(--mg-red),#ff8f6d)}'+
 '.mg-str i.warn{background:linear-gradient(90deg,var(--mg3),#ffd166)}'+
 '.mg-str i.ok{background:linear-gradient(90deg,var(--mg-green),var(--mg2))}'+
 '.mg-str-l{display:block;font:700 10px/1 system-ui;color:var(--mg-dim);margin-top:5px;letter-spacing:.6px}'+
 '.mg-vide{margin:8px 0 0;font-size:10.5px;font-weight:700;color:var(--mg-green)}'+
 '.mg-caps{margin:9px 0 0;font-size:11.5px;font-weight:700;color:var(--mg3)}'+
 '.mg-err{margin:11px 0 0;font-size:12.5px;font-weight:700;color:var(--mg-red);line-height:1.5}'+
 '.mg-cool{margin:11px 0 0;font-size:12.5px;color:var(--mg3);font-weight:700}'+
 '.mg-cool b{font-family:ui-monospace,monospace;font-size:15px}'+
 '.mg-form-a{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}'+
 '.mg-form-a button,.mg-sess-a button,.mg-panel-a button,.mg-change button,.mg-vbtns button{'+
  'padding:11px 15px;font-size:12px;font-weight:800;border-radius:11px;border:1px solid var(--mg-line2);'+
  'background:#050b16;color:var(--mg-tx);cursor:pointer;transition:.16s}'+
 '.mg-form-a button:hover,.mg-sess-a button:hover,.mg-panel-a button:hover,.mg-vbtns button:hover{border-color:var(--mg2);color:var(--mg2)}'+
 '.mg-pri{background:linear-gradient(135deg,var(--mg2),var(--mg1))!important;border-color:var(--mg2)!important;color:#050b16!important}'+
 '.mg-danger{border-color:var(--mg-red)!important;color:var(--mg-red)!important;background:#ff4d6d12!important}'+
 '.mg-form-a button:disabled{opacity:.45;cursor:not-allowed}'+
 '.mg-hint{margin:14px 0 0;font-size:11px;line-height:1.65;color:var(--mg-dim)}'+
 '.mg-session{display:flex;gap:22px;align-items:center;flex-wrap:wrap;border:1px solid var(--mg2);border-radius:18px;'+
  'padding:22px;background:linear-gradient(150deg,#22d3ee12,#0e1a2ecc 60%,#141033cc)}'+
 '.mg-ring{--p:100;width:124px;height:124px;flex:none;border-radius:50%;display:grid;place-items:center;position:relative;'+
  'background:conic-gradient(var(--mg2) calc(var(--p)*1%),#050b16 0)}'+
 '.mg-ring::after{content:"";position:absolute;inset:9px;border-radius:50%;background:#0a1322;border:1px solid var(--mg-line)}'+
 '.mg-ring b{position:relative;z-index:1;font:900 25px/1 ui-monospace,monospace;color:var(--mg2)}'+
 '.mg-ring span{position:relative;z-index:1;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:var(--mg-dim);margin-top:5px}'+
 '.mg-sess-t{flex:1;min-width:230px}'+
 '.mg-sess-t>b{display:block;font-size:17px;color:var(--mg-tx);margin-bottom:6px}'+
 '.mg-sess-t>span{display:block;font-size:12px;color:var(--mg-mut);line-height:1.6;margin-bottom:14px}'+
 '.mg-sess-a{display:flex;gap:8px;flex-wrap:wrap}'+
 '.mg-change{margin-top:16px;border:1px solid var(--mg-purple);border-radius:16px;padding:18px;background:#a855f70e}'+
 '.mg-change>b{display:block;font-size:14px;color:var(--mg-tx);margin-bottom:4px}'+
 '.mg-right{display:flex;flex-direction:column;gap:12px;position:sticky;top:76px;max-height:calc(100vh - 100px);overflow:auto;padding-right:3px}'+
 '@media(max-width:1080px){.mg-right{position:static;max-height:none;overflow:visible}}'+
 '.mg-panel{border:1px solid var(--mg-line);border-radius:16px;padding:14px;background:linear-gradient(160deg,#0a1322dd,#0e1a2ebb)}'+
 '.mg-panel>b{display:block;font-size:10.5px;letter-spacing:1.1px;text-transform:uppercase;color:var(--mg2);margin-bottom:10px}'+
 '.mg-dock{border-color:var(--mg2);box-shadow:0 0 0 1px #22d3ee22}'+
 '.mg-vc{margin-bottom:10px}'+
 '.mg-vc label{display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin-bottom:4px;'+
  'font-size:9px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--mg-dim)}'+
 '.mg-vc label b{color:var(--mg2);font-family:ui-monospace,monospace;font-size:10px}'+
 '.mg-vc input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--mg1),var(--mg2),var(--mg3))}'+
 '.mg-vc input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;'+
  'background:#eaf2ff;border:3px solid var(--mg2);box-shadow:0 0 9px var(--mg2);cursor:grab}'+
 '.mg-vc input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#eaf2ff;border:3px solid var(--mg2);cursor:grab}'+
 '.mg-vcols{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:10px 0}'+
 '.mg-vcols div{display:flex;flex-direction:column;align-items:center;gap:3px}'+
 '.mg-vcols input[type=color]{width:100%;height:32px;border:1px solid var(--mg-line2);border-radius:9px;background:#050b16;padding:2px;cursor:pointer;margin:0}'+
 '.mg-vcols span{font-size:8.5px;color:var(--mg-dim)}'+
 '.mg-vtgs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}'+
 '.mg-vtg{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--mg-dim);background:#050b16;'+
  'border:1px solid var(--mg-line2);border-radius:16px;padding:4px 9px;cursor:pointer;white-space:nowrap}'+
 '.mg-vtg input{width:auto;margin:0;accent-color:var(--mg2)}'+
 '.mg-vtg.on{color:var(--mg2);border-color:var(--mg2);background:#22d3ee14}'+
 '.mg-vbtns{display:grid;grid-template-columns:1fr 1fr;gap:6px}'+
 '.mg-vbtns button{padding:9px;font-size:10.5px}'+
 '.mg-vbtns button:last-child{grid-column:1/-1}'+
 '.mg-vnote{margin:10px 0 0;font-size:10px;line-height:1.55;color:var(--mg-dim)}'+
 '.mg-vnote b{color:var(--mg-tx2)}'+
 '.mg-tbl{width:100%;border-collapse:collapse;font-size:12px}'+
 '.mg-tbl td{border-bottom:1px solid var(--mg-line);padding:6px 4px;color:var(--mg-tx2)}'+
 '.mg-tbl td:first-child{color:var(--mg-dim);width:46%}'+
 '.mg-tbl b.ok{color:var(--mg-green)}.mg-tbl b.ko{color:var(--mg-red)}'+
 '.mg-log{max-height:180px;overflow:auto;background:#050b16;border:1px solid var(--mg-line);border-radius:11px;padding:9px}'+
 '.mg-log-l{display:flex;gap:7px;font:10.5px/1.65 ui-monospace,monospace;padding:2px 0}'+
 '.mg-log-l i{font-style:normal;color:var(--mg-dim);flex:none}'+
 '.mg-log-l b{flex:none;min-width:74px;color:var(--mg2)}'+
 '.mg-log-l.ok span{color:var(--mg-green)}.mg-log-l.warn span{color:var(--mg3)}'+
 '.mg-log-l.err span{color:var(--mg-red)}.mg-log-l.info span{color:var(--mg-tx2)}'+
 '.mg-empty{margin:0;font-size:11.5px;color:var(--mg-dim);text-align:center;padding:10px}'+
 '.mg-panel-a{display:flex;gap:7px;margin-top:10px}'+
 '.mg-panel-a button{flex:1;padding:9px;font-size:11px}'+
 '.mg-right::-webkit-scrollbar,.mg-log::-webkit-scrollbar,.mg-bar-tools::-webkit-scrollbar{width:9px;height:9px}'+
 '.mg-right::-webkit-scrollbar-track,.mg-log::-webkit-scrollbar-track,.mg-bar-tools::-webkit-scrollbar-track{background:#050b16;border-radius:8px}'+
 '.mg-right::-webkit-scrollbar-thumb,.mg-log::-webkit-scrollbar-thumb,.mg-bar-tools::-webkit-scrollbar-thumb{'+
  'background:linear-gradient(var(--mg1),var(--mg2));border-radius:8px;border:2px solid #050b16}'+
 '.mg-right::-webkit-scrollbar-thumb:hover,.mg-log::-webkit-scrollbar-thumb:hover{background:var(--mg2)}'+
 '.mg-right,.mg-log,.mg-bar-tools{scrollbar-width:thin;scrollbar-color:var(--mg2) #050b16}'+
 '#mgBar{position:fixed;left:0;right:0;bottom:var(--mg-off);z-index:145;display:flex;height:120px;'+
  'background:linear-gradient(180deg,#0a1322F6,#050b16FB);border-top:1px solid var(--mg2);'+
  'box-shadow:0 -12px 34px #000b;font-size:calc(13px*var(--mg-den))}'+
 'body.mg-bar-on main{padding-bottom:calc(var(--mg-h) + var(--mg-off) + 24px)}'+
 'body.mg-bar-on #toast{bottom:calc(var(--mg-h) + var(--mg-off) + 14px)}'+
 '.mg-bar-id{flex:none;display:flex;align-items:center;gap:10px;padding:10px 14px;border-right:1px solid var(--mg-line);'+
  'background:linear-gradient(135deg,#22d3ee16,transparent);min-width:246px}'+
 '.mg-bar-ic{font-size:24px}'+
 '.mg-bar-id>div>b{display:block;font:900 10px/1 system-ui;letter-spacing:1.3px;color:var(--mg2)}'+
 '.mg-bar-id>div>span{display:block;font:800 11px/1 system-ui;color:var(--mg-green);margin-top:5px}'+
 '.mg-bar-clock{font:900 20px/1 ui-monospace,monospace;color:var(--mg2);padding:6px 10px;border:1px solid var(--mg-line2);border-radius:10px;background:#050b16}'+
 '.mg-bar-lock{background:#ff4d6d14;border:1px solid var(--mg-red);color:var(--mg-red);border-radius:10px;'+
  'padding:9px 12px;font-size:11.5px;font-weight:800;cursor:pointer;white-space:nowrap}'+
 '.mg-bar-tools{flex:1;display:flex;align-items:center;gap:13px;padding:10px 14px;overflow-x:auto;overflow-y:hidden}'+
 '.mg-bc{flex:none;width:112px}'+
 '.mg-bc label{display:flex;justify-content:space-between;align-items:baseline;gap:5px;margin-bottom:4px;'+
  'font-size:8px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;color:var(--mg-dim)}'+
 '.mg-bc label b{color:var(--mg2);font-family:ui-monospace,monospace;font-size:9px}'+
 '.mg-bc input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--mg1),var(--mg2),var(--mg3))}'+
 '.mg-bc input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;'+
  'background:#eaf2ff;border:3px solid var(--mg2);cursor:grab}'+
 '.mg-btgs{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:5px;width:262px}'+
 '.mg-btg{display:flex;align-items:center;gap:5px;font-size:9px;color:var(--mg-dim);background:#050b16;'+
  'border:1px solid var(--mg-line2);border-radius:15px;padding:4px 8px;cursor:pointer;white-space:nowrap}'+
 '.mg-btg input{width:auto;margin:0;accent-color:var(--mg2)}'+
 '.mg-btg.on{color:var(--mg2);border-color:var(--mg2);background:#22d3ee14}'+
 '.mg-bcols{flex:none;display:flex;gap:6px}'+
 '.mg-bcols div{display:flex;flex-direction:column;align-items:center;gap:2px}'+
 '.mg-bcols input[type=color]{width:40px;height:28px;border:1px solid var(--mg-line2);border-radius:8px;background:#050b16;padding:2px;cursor:pointer;margin:0}'+
 '.mg-bcols span{font-size:7.5px;color:var(--mg-dim)}'+
 '.mg-bbtns{flex:none;display:grid;grid-template-columns:repeat(3,auto);gap:5px}'+
 '.mg-bbtns button{padding:7px 9px;font-size:10px;font-weight:800;border-radius:8px;border:1px solid var(--mg-line2);'+
  'background:#050b16;color:var(--mg-tx);cursor:pointer;white-space:nowrap}'+
 '.mg-bbtns .p{background:linear-gradient(135deg,var(--mg2),var(--mg1));border-color:var(--mg2);color:#050b16}'+
 '@media(max-width:900px){#mgBar{height:160px;flex-direction:column}'+
  '.mg-bar-id{min-width:0;border-right:0;border-bottom:1px solid var(--mg-line);padding:7px 11px;justify-content:space-between}'+
  '.mg-bar-ic{font-size:19px}.mg-bar-clock{font-size:16px}.mg-bar-tools{padding:8px 11px}}'+
 '@media(max-width:640px){.mg-inner{padding:16px}.mg-form{gap:14px}.mg-rackwrap{max-width:200px;margin:0 auto}'+
  '.mg-session{padding:16px}.mg-ring{width:104px;height:104px}.mg-ring b{font-size:21px}'+
  '.mg-pwrow input{font-size:15px;padding:12px 13px}.mg-eye,.mg-clr{padding:0 11px}'+
  '.mg-mods{grid-template-columns:1fr}}'+
 '@media print{#mgBar{display:none!important}}'+
 '@media (prefers-reduced-motion:reduce){.mg-aur,.mg-parts i,.mg-fan,.mg-led,.mg-oled,#mgScan,.mg-mod{animation:none!important}}';
 document.head.appendChild(s)}

/* ══════════ boot ══════════ */
function loop(fn,ms){var h=nST(function t(){fn();h=nST(t,ms)},ms);M.ticks.push(h);return h}
function boot(){
 try{
  css();
  M.hasApp=(typeof ADMIN_HASH!=='undefined'&&!!ADMIN_HASH);
  document.body.classList.add('mg-locked');
  hook();restore();applyVisual();syncNav();watch();cleanPw(document);
  loop(function(){
   if(!M.unlocked)return;
   var now=Date.now();
   if(now>M.exp){revoke('Expiration de la session');return}
   if(CFG.idle>0&&now-M.last>CFG.idle*60000){revoke('Inactivité de '+CFG.idle+' min');return}
   paintTimer()},700);
  loop(function(){
   try{
    hook();cleanPw(document);
    var cur=view();
    if(!M.unlocked&&isMod(cur)){showGate();return}
    if(!M.unlocked)killFrames();
    syncNav();bar();offsets();
    if(M.pending){var b=$('#boot');
     if(b&&b.classList.contains('hid')){var t=M.pending;M.pending=null;M.target=t;showGate()}}
   }catch(e){}},1100);
  document.addEventListener('click',function(e){
   try{
    var n=e.target.closest?e.target.closest('[data-act="nav"]'):null;
    if(n&&isMod(n.dataset.k)&&!M.unlocked){
     e.preventDefault();e.stopPropagation();M.target=n.dataset.k;showGate();snd('deny');return}
    var m=e.target.closest?e.target.closest('[data-act="mod"],[data-act="openMod"],[data-act="module"],[data-mod],[data-module],.modcard'):null;
    if(m&&!M.unlocked){e.preventDefault();e.stopPropagation();M.target='modules';showGate();snd('deny')}
   }catch(x){}},true);
  try{var q=new URLSearchParams(location.search).get('view');
   if(isMod(q)){M.target=q;nST(showGate,150)}}catch(e){}
  jlog('INIT','Verrou du pavé modules actif · champ mot de passe vide, sans points','info');
 }catch(e){
  try{var v=$('#view');if(v){v.innerHTML=fallback();bindGate();cleanPw(v)}}catch(x){}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFModGate={lock:revoke,unlock:submit,show:showGate,state:M,cfg:CFG,
 isOpen:function(){return M.unlocked},log:function(){return M.log},render:function(){renderGate(true)}};
})();
