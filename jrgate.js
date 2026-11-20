/* KEV FUSION 2026 — jrgate.js v3.0.0
   VERRU UNIQUE JUSTEREPÈRE — accès classique et admin soumis au mot de passe administrateur.
   v3 : aucun point de mot de passe affiché par défaut.
        · placeholders textuels, champ strictement vide à l'ouverture
        · anti-remplissage automatique (attributs + nom neutre + purge tardive surveillée)
        · bouton effacer, aide explicite « aucun mot de passe pré-rempli »
        · nettoyage générique de tout champ mot de passe injecté par un autre module
        · atelier visuel permanent : la balance et le sceau se règlent en direct
   v2 : rendu idempotent, observer excluant la vue gate, timers nettoyés, nav idempotente. */
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

/* ══════════ son ══════════ */
var AU={c:null,on:LS.g('jrgSound',true)!==false};
function actx(){try{if(!AU.c)AU.c=new (window.AudioContext||window.webkitAudioContext)();
 if(AU.c&&AU.c.state==='suspended')AU.c.resume().catch(function(){});return AU.c}catch(e){return null}}
function snd(k){if(!AU.on)return;var c=actx();if(!c)return;
 var m={seal:[523,1046,.24,'sine'],deny:[196,110,.32,'sawtooth'],lock:[330,165,.2,'square'],
  tick:[1240,1240,.022,'sine'],out:[523,880,.24,'triangle'],clear:[760,420,.09,'sine']}[k]||[900,900,.04,'sine'];
 try{var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(50,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.13,c.currentTime+.012);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.03)}catch(e){}}

/* ══════════ configuration ══════════ */
var DEF={session:20,idle:5,lockOnHide:true,everyTime:true,blurOnLock:true,
 density:100,glow:56,grain:14,seal:'#d8b45a',accent:'#22c55e',
 beam:true,particles:true,parts:16,stroke:1.6,tilt:4.2,tiltSpeed:5.4};
var raw=LS.g('jrgCfg',{});if(!raw||typeof raw!=='object')raw={};
var CFG=Object.assign({},DEF,raw);
function normCfg(){
 CFG.session=clamp(CFG.session,5,120);CFG.idle=clamp(CFG.idle,1,30);
 CFG.density=clamp(CFG.density,85,125);CFG.glow=clamp(CFG.glow,0,100);CFG.grain=clamp(CFG.grain,0,40);
 CFG.parts=clamp(CFG.parts,0,40);CFG.stroke=clamp(CFG.stroke,.4,5);
 CFG.tilt=clamp(CFG.tilt,0,14);CFG.tiltSpeed=clamp(CFG.tiltSpeed,1.5,16);
 if(typeof CFG.seal!=='string'||!/^#[0-9a-f]{6}$/i.test(CFG.seal))CFG.seal=DEF.seal;
 if(typeof CFG.accent!=='string'||!/^#[0-9a-f]{6}$/i.test(CFG.accent))CFG.accent=DEF.accent}
normCfg();
function saveCfg(){LS.s('jrgCfg',CFG)}
var rawLog=LS.g('jrgLog',[]);if(!Array.isArray(rawLog))rawLog=[];
var rawF=LS.g('jrgFails',null);if(!rawF||typeof rawF!=='object')rawF={n:0,until:0};
var G={unlocked:false,exp:0,last:Date.now(),target:'jradmin',pw:'',pw2:'',err:'',caps:false,
 busy:false,mode:'ask',change:null,log:rawLog,fails:{n:+rawF.n||0,until:+rawF.until||0},
 hasApp:false,painting:false,renderKey:'',navKey:'',cdTimer:null,tick:null,obs:null,guard:null,raf:0,
 pending:null,fatal:''};
function jlog(kind,msg,lvl){
 try{G.log.unshift({t:new Date().toISOString(),kind:String(kind),msg:String(msg),lvl:lvl||'info'});
  if(G.log.length>400)G.log.pop();LS.s('jrgLog',G.log);
  var el=$('#jrgLog');if(el)el.innerHTML=logHtml()}catch(e){}}
function logHtml(){
 if(!G.log.length)return '<p class="jrg-empty">Aucune tentative enregistrée.</p>';
 return G.log.slice(0,14).map(function(l){
  return '<div class="jrg-log-l '+esc(l.lvl)+'"><i>'+esc(String(l.t).slice(11,19))+'</i><b>'+esc(l.kind)+'</b><span>'+esc(l.msg)+'</span></div>'}).join('')}
function cooldown(){var u=G.fails.until||0;return u>Date.now()?u-Date.now():0}
function refHash(){try{return (typeof ADMIN_HASH!=='undefined'&&ADMIN_HASH)||LS.g('jrgHash','')||''}catch(e){return LS.g('jrgHash','')||''}}
function view(){try{return (typeof S!=='undefined'&&S.view)||''}catch(e){return''}}
function setView(v){try{if(typeof S!=='undefined')S.view=v}catch(e){}}

/* ══════════ champs mot de passe : vides, sans points, sans remplissage auto ══════════ */
var DOTS=/[\u2022\u25CF\u2219\u2027\u00B7*]/;
function cleanPw(root){
 try{
  $$('input[type="password"],input[data-jrgpw]',root||document).forEach(function(i){
   var ph=i.getAttribute('placeholder')||'';
   if(DOTS.test(ph))i.setAttribute('placeholder',i.id==='jrgPw2'?'Répétez le mot de passe':'Saisissez le mot de passe');
   if(i.dataset.jrgClean)return;
   i.dataset.jrgClean='1';
   i.setAttribute('autocomplete','new-password');
   i.setAttribute('autocorrect','off');i.setAttribute('autocapitalize','off');
   i.setAttribute('spellcheck','false');
   i.setAttribute('data-lpignore','true');i.setAttribute('data-1p-ignore','true');
   i.setAttribute('data-form-type','other');
   i.name='jrg-'+Math.random().toString(36).slice(2,10);
   if(i.value)i.value='';
   var mark=function(){i.dataset.jrgTyped='1'};
   i.addEventListener('input',mark);i.addEventListener('keydown',mark);
   [120,420,900].forEach(function(ms){setTimeout(function(){
    try{if(!i.dataset.jrgTyped&&i.value){i.value='';
     if(i.id==='jrgPw')G.pw='';if(i.id==='jrgPw2')G.pw2='';
     if(G.change){if(i.id==='jrgOld')G.change.old='';if(i.id==='jrgN1')G.change.n1='';if(i.id==='jrgN2')G.change.n2=''}
     paintStrength()}}catch(e){}},ms)});
  });
 }catch(e){}}

/* ══════════ session ══════════ */
function grant(){
 G.unlocked=true;G.exp=Date.now()+CFG.session*60000;G.last=Date.now();
 G.fails={n:0,until:0};LS.s('jrgFails',G.fails);
 try{LS.s('admDevice',true);if(typeof S!=='undefined')S.role='admin'}catch(e){}
 try{if(!CFG.everyTime)sessionStorage.setItem('kf_jrgSession',JSON.stringify({exp:G.exp}));
  else sessionStorage.removeItem('kf_jrgSession')}catch(e){}
 document.body.classList.remove('jrg-locked');document.body.classList.add('jrg-unlocked');
 G.renderKey='';startTick();syncNav();bar();
 jlog('ACCÈS','Mot de passe administrateur validé · session '+CFG.session+' min','ok')}
function revoke(reason){
 if(!G.unlocked)return;
 G.unlocked=false;G.exp=0;G.pw='';G.pw2='';G.change=null;G.mode='ask';
 try{sessionStorage.removeItem('kf_jrgSession')}catch(e){}
 document.body.classList.add('jrg-locked');document.body.classList.remove('jrg-unlocked');
 stopTick();bar();
 var v=view();if(v==='jr'||v==='jradmin')setView('jrgate');
 G.renderKey='';
 jlog('VERROU',reason||'Verrouillage manuel','warn');snd('lock');
 syncNav();renderGate(true);toast('🔒 JusteRepère verrouillé')}
function restore(){
 if(CFG.everyTime)return;
 try{var s=JSON.parse(sessionStorage.getItem('kf_jrgSession')||'null');
  if(s&&s.exp>Date.now()){G.unlocked=true;G.exp=s.exp;G.last=Date.now();
   document.body.classList.remove('jrg-locked');document.body.classList.add('jrg-unlocked');
   startTick();jlog('SESSION','Session restaurée dans cet onglet','info')}}catch(e){}}
function startTick(){stopTick();G.tick=setInterval(function(){
 if(!G.unlocked)return;
 var now=Date.now();
 if(now>G.exp){revoke('Expiration de la session');return}
 if(CFG.idle>0&&now-G.last>CFG.idle*60000){revoke('Inactivité de '+CFG.idle+' min');return}
 paintTimer()},1000)}
function stopTick(){if(G.tick){clearInterval(G.tick);G.tick=null}}
function touch(){if(G.unlocked)G.last=Date.now()}
['pointerdown','keydown','wheel','touchstart'].forEach(function(ev){
 try{window.addEventListener(ev,touch,{passive:true})}catch(e){}});
document.addEventListener('visibilitychange',function(){
 try{if(document.hidden&&G.unlocked&&CFG.lockOnHide)revoke('Onglet masqué')}catch(e){}});
window.addEventListener('beforeunload',function(){try{sessionStorage.removeItem('kf_jrgSession')}catch(e){}});

/* ══════════ authentification ══════════ */
async function submit(){
 if(G.busy)return;
 try{
  var cd=cooldown();
  if(cd>0){G.err='Trop de tentatives. Réessayez dans '+Math.ceil(cd/1000)+' s.';snd('deny');renderGate(true);return}
  var pw=G.pw||'';
  if(!pw.length){G.err='Saisissez le mot de passe administrateur.';snd('deny');renderGate(true);return}
  if(pw.length<4){G.err='Le mot de passe doit contenir au moins 4 caractères.';snd('deny');renderGate(true);return}
  G.busy=true;G.err='';renderGate(true);
  var h=await sha(pw),ref=refHash();
  if(!ref){
   if(pw!==G.pw2){G.busy=false;G.err='Les deux saisies ne correspondent pas.';snd('deny');renderGate(true);return}
   if(pw.length<8){G.busy=false;G.err='Choisissez au moins 8 caractères.';snd('deny');renderGate(true);return}
   LS.s('jrgHash',h);LS.s('jraHash',h);
   jlog('INIT','Mot de passe administrateur JusteRepère défini','ok');
   G.busy=false;G.pw='';G.pw2='';grant();snd('seal');toast('🔐 Mot de passe défini · JusteRepère ouvert');openTarget();return}
  if(h===ref){G.busy=false;G.pw='';G.pw2='';grant();snd('seal');toast('⚖️ Accès administrateur accordé');openTarget();return}
  G.fails.n=(G.fails.n||0)+1;
  var pen=G.fails.n>=10?300000:G.fails.n>=5?30000:0;
  if(pen)G.fails.until=Date.now()+pen;
  LS.s('jrgFails',G.fails);
  G.busy=false;G.pw='';
  G.err='Mot de passe incorrect.'+(pen?' Blocage de '+(pen/1000)+' s.':G.fails.n>=3?' Tentative '+G.fails.n+' sur 5 avant blocage.':'');
  jlog('REFUS','Mot de passe incorrect (tentative '+G.fails.n+')','err');snd('deny');renderGate(true);
 }catch(e){G.busy=false;G.err='Erreur de vérification : '+(e&&e.message||'inconnue');
  jlog('ERREUR','Vérification : '+G.err,'err');renderGate(true)}}
async function changePw(){
 try{
  var c=G.change||{};
  if(!c.old||!c.n1||!c.n2){G.err='Renseignez les trois champs.';renderGate(true);return}
  if(c.n1!==c.n2){G.err='La confirmation ne correspond pas.';snd('deny');renderGate(true);return}
  if(c.n1.length<8){G.err='Au moins 8 caractères requis.';snd('deny');renderGate(true);return}
  if(G.hasApp){G.err='Mot de passe défini par l’application : modifiez-le depuis l’espace Admin.';renderGate(true);return}
  var ho=await sha(c.old),hn=await sha(c.n1);
  if(ho!==refHash()){G.err='Mot de passe actuel incorrect.';jlog('REFUS','Changement refusé','err');snd('deny');renderGate(true);return}
  LS.s('jrgHash',hn);LS.s('jraHash',hn);G.change=null;G.err='';G.mode='ask';
  jlog('SÉCURITÉ','Mot de passe administrateur modifié','ok');snd('seal');toast('🔐 Mot de passe modifié');renderGate(true);
 }catch(e){G.err='Erreur : '+(e&&e.message||'inconnue');renderGate(true)}}
function openTarget(){
 var t=G.target||'jradmin';G.mode='ask';G.renderKey='';
 try{
  if(typeof window.__jrgInner==='function')window.__jrgInner(t);
  else if(typeof window.switchView==='function')window.switchView(t);
 }catch(e){jlog('ERREUR','Ouverture : '+(e&&e.message||''),'err');showGate()}
 setTimeout(bar,80)}

/* ══════════ interception ══════════ */
function hook(){
 try{
  if(typeof window.switchView==='function'&&!window.switchView.__jrg){
   var inner=window.switchView;window.__jrgInner=inner;
   var w=function(v){
    if(v!=='jr'&&v!=='jradmin'&&v!=='jrgate')return inner(v);
    if(v==='jrgate'){if(G.unlocked)G.target='jradmin';showGate();return}
    if(!G.unlocked){G.target=v;showGate();
     jlog('BLOCAGE','Accès « '+v+' » refusé : mot de passe administrateur requis','warn');snd('deny');return}
    touch();var r=inner(v);setTimeout(bar,60);return r};
   w.__jrg=true;window.switchView=w}
  ['renderJr','renderJrAdmin'].forEach(function(fn){
   if(typeof window[fn]==='function'&&!window[fn].__jrg){
    var o=window[fn];var f=function(){if(!G.unlocked){showGate();return}return o.apply(this,arguments)};
    f.__jrg=true;window[fn]=f}});
  if(window.KFJrAdmin&&typeof window.KFJrAdmin.render==='function'&&!window.KFJrAdmin.render.__jrg){
   var o2=window.KFJrAdmin.render;
   var f2=function(){if(!G.unlocked){showGate();return}return o2.apply(this,arguments)};
   f2.__jrg=true;window.KFJrAdmin.render=f2}
 }catch(e){}}
function showGate(){
 setView('jrgate');
 try{
  var boot=$('#boot'),gate=$('#gate'),app=$('#app');
  if(boot&&!boot.classList.contains('hid')){G.pending=G.target||'jradmin';return}
  if(gate)gate.classList.add('hid');
  if(app)app.classList.remove('hid');
 }catch(e){}
 syncNav();renderGate(true);bar()}
function watch(){
 var v=$('#view');if(!v||G.obs)return;
 try{
  G.obs=new MutationObserver(function(){
   if(G.painting||G.raf)return;
   G.raf=requestAnimationFrame(function(){
    G.raf=0;if(G.painting)return;
    try{
     var cur=view();
     if(!G.unlocked&&(cur==='jr'||cur==='jradmin')){showGate();return}
     if(!G.unlocked&&cur!=='jrgate'&&v.querySelector('.jr-hero,.jr-lock-in,#jrFacts')){showGate();return}
     if(G.unlocked&&(cur==='jr'||cur==='jradmin'||cur==='jrgate'))attachBar();
     cleanPw(v);
    }catch(e){}})});
  G.obs.observe(v,{childList:true,subtree:false});
 }catch(e){}}

/* ══════════ navigation ══════════ */
function syncNav(){
 try{
  if(typeof NAV!=='undefined'&&Array.isArray(NAV)){
   if(!NAV.some(function(n){return n&&n[0]==='jrgate'})){
    var i=NAV.findIndex(function(n){return n&&n[0]==='jr'});
    NAV.splice(i<0?NAV.length:i,0,['jrgate','🔒 JusteRepère'])}
   var e=NAV.find(function(n){return n&&n[0]==='jrgate'});
   if(e)e[1]=G.unlocked?'⚖️ JusteRepère':'🔒 JusteRepère';
  }
  var cur=view();
  var list=(typeof NAV!=='undefined'&&Array.isArray(NAV))?NAV:[];
  var key=(G.unlocked?'1':'0')+'|'+cur+'|'+list.map(function(n){
   return n[0]+':'+n[1]+((!G.unlocked&&(n[0]==='jr'||n[0]==='jradmin'))?'h':'s')}).join(',');
  var n=$('#nav');
  if(n&&key!==G.navKey){
   G.navKey=key;
   n.innerHTML=list.map(function(x){
    var hide=!G.unlocked&&(x[0]==='jr'||x[0]==='jradmin');
    return '<button data-act="nav" data-k="'+esc(x[0])+'" class="'+(x[0]===cur?'act':'')+'"'+
     (hide?' style="display:none"':'')+'>'+esc(x[1])+'</button>'}).join('')}
  var b=$('#jrgTop');
  if(!b){var h=document.querySelector('.hbtns');
   if(h){b=document.createElement('button');b.id='jrgTop';b.type='button';
    b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();
     if(G.unlocked)revoke('Verrouillage depuis la barre supérieure');
     else{G.target='jradmin';showGate()}});
    h.insertBefore(b,h.firstChild)}}
  if(b){b.textContent=G.unlocked?'⚖️':'🔒';
   b.title=G.unlocked?'JusteRepère ouvert — cliquer pour verrouiller':'JusteRepère verrouillé — mot de passe administrateur';
   b.style.borderColor=G.unlocked?CFG.seal:'#ff4d6d';
   b.style.color=G.unlocked?CFG.seal:'#ff4d6d';
   b.style.background=G.unlocked?'#12261a':'#20101a'}
  var jb=$('#jrTopBtn');if(jb)jb.style.display=G.unlocked?'':'none';
 }catch(e){}}

/* ══════════ visuel ══════════ */
function strength(p){p=String(p||'');var s=0;
 if(p.length>=8)s+=25;if(p.length>=12)s+=15;if(p.length>=16)s+=10;
 if(/[a-z]/.test(p)&&/[A-Z]/.test(p))s+=20;if(/\d/.test(p))s+=15;if(/[^A-Za-z0-9]/.test(p))s+=20;
 return clamp(s,0,100)}
function scaleSVG(){
 return '<svg class="jrg-scale" viewBox="0 0 220 200" aria-hidden="true">'+
 '<defs><linearGradient id="jrgBrass" x1="0" y1="0" x2="1" y2="1">'+
 '<stop offset="0" stop-color="#fff0bd"/><stop class="jrg-s2" offset=".45" stop-color="'+CFG.seal+'"/><stop offset="1" stop-color="#7a5f1e"/></linearGradient>'+
 '<linearGradient id="jrgBeamG" x1="0" y1="0" x2="1" y2="0">'+
 '<stop class="jrg-b1" offset="0" stop-color="'+CFG.accent+'"/><stop class="jrg-b2" offset=".5" stop-color="'+CFG.seal+'"/><stop offset="1" stop-color="#38bdf8"/></linearGradient>'+
 '<radialGradient id="jrgHalo" cx=".5" cy=".5" r=".5">'+
 '<stop class="jrg-h1" offset="0" stop-color="'+CFG.seal+'" stop-opacity=".5"/><stop class="jrg-h2" offset="1" stop-color="'+CFG.seal+'" stop-opacity="0"/></radialGradient></defs>'+
 '<circle cx="110" cy="96" r="86" fill="url(#jrgHalo)"/>'+
 '<g class="jrg-beam-g"><rect x="34" y="52" width="152" height="7" rx="3.5" fill="url(#jrgBeamG)"/>'+
 '<circle cx="110" cy="55.5" r="9" fill="url(#jrgBrass)"/>'+
 '<g class="jrg-cables" stroke="'+CFG.seal+'" stroke-width="'+CFG.stroke+'" opacity=".85" fill="none">'+
 '<path d="M46 59 L34 92"/><path d="M46 59 L58 92"/><path d="M174 59 L162 92"/><path d="M174 59 L186 92"/></g>'+
 '<path d="M22 92 H70 A24 12 0 0 1 22 92 Z" fill="url(#jrgBrass)" opacity=".92"/>'+
 '<path d="M150 92 H198 A24 12 0 0 1 150 92 Z" fill="url(#jrgBrass)" opacity=".92"/>'+
 '<path d="M22 92 H70" stroke="#3a2f10" stroke-width="1.4"/><path d="M150 92 H198" stroke="#3a2f10" stroke-width="1.4"/></g>'+
 '<rect x="106" y="55" width="8" height="98" rx="4" fill="url(#jrgBrass)"/>'+
 '<path d="M78 158 H142 L152 176 H68 Z" fill="url(#jrgBrass)"/>'+
 '<rect x="60" y="176" width="100" height="8" rx="4" fill="#2a2410"/>'+
 '<circle cx="110" cy="55.5" r="3.4" fill="#2a2410"/></svg>'}
function partsHtml(){
 if(!CFG.particles||!CFG.parts)return '';
 var s='';for(var i=0;i<CFG.parts;i++){
  s+='<i style="left:'+((i*6.3+3)%98).toFixed(1)+'%;animation-duration:'+(13+(i%9)*2.4).toFixed(1)+
   's;animation-delay:-'+(i*1.3).toFixed(1)+'s;width:'+(2+i%4)+'px;height:'+(2+i%4)+'px"></i>'}
 return s}
function applyVisual(){
 try{
  var r=document.documentElement.style;
  r.setProperty('--jrg-seal',CFG.seal);r.setProperty('--jrg-acc',CFG.accent);
  r.setProperty('--jrg-glow',(CFG.glow/100).toFixed(2));
  r.setProperty('--jrg-grain',(CFG.grain/100).toFixed(2));
  r.setProperty('--jrg-den',(CFG.density/100).toFixed(2));
  r.setProperty('--jrg-tilt',CFG.tilt.toFixed(2)+'deg');
  r.setProperty('--jrg-tiltdur',CFG.tiltSpeed.toFixed(2)+'s');
  document.body.classList.toggle('jrg-beam',!!CFG.beam);
  document.body.classList.toggle('jrg-blur',!G.unlocked&&!!CFG.blurOnLock);
  var cab=$('.jrg-cables');if(cab){cab.setAttribute('stroke-width',CFG.stroke);cab.setAttribute('stroke',CFG.seal)}
  [['.jrg-s2',CFG.seal],['.jrg-b1',CFG.accent],['.jrg-b2',CFG.seal],['.jrg-h1',CFG.seal],['.jrg-h2',CFG.seal]]
   .forEach(function(p){var e=$(p[0]);if(e)e.setAttribute('stop-color',p[1])});
  var pp=$('.jrg-parts');
  if(pp){pp.innerHTML=partsHtml();pp.style.display=(CFG.particles&&CFG.parts)?'':'none'}
  else if(CFG.particles&&CFG.parts){var st=$('.jrg-stage');
   if(st&&!$('.jrg-parts')){var d=document.createElement('div');d.className='jrg-parts';d.innerHTML=partsHtml();
    var inner=$('.jrg-inner');if(inner)st.insertBefore(d,inner);else st.appendChild(d)}}
 }catch(e){}}

/* ══════════ rendu ══════════ */
function stateKey(){
 return [G.unlocked?1:0,G.mode,G.err,G.busy?1:0,cooldown()>0?1:0,G.change?1:0,refHash()?1:0,
  CFG.session,CFG.idle,CFG.lockOnHide?1:0,CFG.everyTime?1:0,G.fails.n,G.log.length,G.fatal].join('|')}
function pwField(id,label,ph,val,extra){
 return '<label for="'+id+'">'+label+'</label>'+
 '<div class="jrg-pwrow"><input id="'+id+'" data-jrgpw="1" type="password" autocomplete="new-password" '+
  'placeholder="'+esc(ph)+'" value="'+esc(val||'')+'"'+(extra||'')+'>'+
  '<button class="jrg-eye" data-jrgeye="'+id+'" type="button" title="Afficher / masquer">👁</button>'+
  '<button class="jrg-clr" data-jrgclr="'+id+'" type="button" title="Effacer le champ">✕</button></div>'}
function fallbackForm(){
 var first=!refHash();
 return '<div class="jrg-stage"><div class="jrg-inner" style="grid-template-columns:1fr">'+
 '<div class="jrg-left"><span class="jrg-kick">🔒 ACCÈS PROTÉGÉ</span><h1>JusteRepère</h1>'+
 '<p class="jrg-lede">Accès réservé à l’administrateur. Le champ est vide : saisissez votre mot de passe.</p>'+
 '<div class="jrg-form" style="grid-template-columns:1fr"><div class="jrg-form-b">'+
 pwField('jrgPw',first?'Créer le mot de passe administrateur':'Mot de passe administrateur',
  first?'8 caractères minimum':'Saisissez le mot de passe','')+
 (first?pwField('jrgPw2','Confirmer le mot de passe','Répétez le mot de passe',''):'')+
 (G.err?'<p class="jrg-err">'+esc(G.err)+'</p>':'')+
 '<div class="jrg-form-a"><button class="jrg-pri" data-jrg="submit">'+(first?'🔐 Créer et ouvrir':'🔓 Déverrouiller')+'</button>'+
 '<button data-jrg="home">🏠 Accueil</button></div>'+
 '<p class="jrg-hint">Aucun mot de passe n’est pré-rempli.</p></div></div></div></div></div>'}
function renderGate(force){
 var v=$('#view');if(!v)return;
 var key=stateKey();
 if(!force&&key===G.renderKey&&v.querySelector('.jrg-stage'))return;
 G.renderKey=key;G.painting=true;
 if(G.cdTimer){clearInterval(G.cdTimer);G.cdTimer=null}
 var html='';
 try{html=fullGate()}catch(e){G.fatal=String(e&&e.message||e);html=fallbackForm()}
 try{v.innerHTML=html}catch(e){try{v.innerHTML=fallbackForm()}catch(e2){}}
 applyVisual();bindGate();cleanPw(v);
 var cd=cooldown();
 if(cd>0){G.cdTimer=setInterval(function(){
  var c=cooldown();var e=$('#jrgCd');
  if(c<=0){clearInterval(G.cdTimer);G.cdTimer=null;G.renderKey='';renderGate(true);return}
  if(e)e.textContent=Math.ceil(c/1000)},300)}
 if(!cd){var p=$('#jrgPw');if(p)setTimeout(function(){try{p.focus()}catch(e){}},90)}
 paintTimer();syncVisualDock();
 requestAnimationFrame(function(){requestAnimationFrame(function(){G.painting=false})})}
function fullGate(){
 var first=!refHash();
 var cd=cooldown();
 var sessMs=Math.max(1,CFG.session*60000);
 var left=G.unlocked?Math.max(0,G.exp-Date.now()):0;
 var st=strength(G.change?G.change.n1:G.pw);
 var changing=G.unlocked&&G.mode==='change';
 return '<div class="jrg-stage">'+
 '<div class="jrg-grid"></div><div class="jrg-aur"></div><div class="jrg-grain"></div>'+
 '<div class="jrg-parts">'+partsHtml()+'</div>'+
 '<div class="jrg-inner"><div class="jrg-left">'+
 '<span class="jrg-kick">'+(G.unlocked?'⚖️ SESSION ADMINISTRATEUR ACTIVE':'🔒 ACCÈS PROTÉGÉ · MOT DE PASSE ADMINISTRATEUR')+'</span>'+
 '<h1>JusteRepère</h1>'+
 '<p class="jrg-lede">Le module juridique — repères, procédures, courriers, dossiers et calculateurs — '+
  'est <b>réservé à l’administrateur</b>. Aucun accès, y compris par lien direct, n’est possible sans mot de passe.</p>'+
 (G.unlocked?
  '<div class="jrg-session">'+
   '<div class="jrg-ring" style="--p:'+(left/sessMs*100).toFixed(1)+'"><b id="jrgClock">'+mmss(left)+'</b><span>session</span></div>'+
   '<div class="jrg-sess-txt"><b>Accès ouvert</b>'+
    '<span>Expiration dans '+mmss(left)+' · auto-verrouillage après '+CFG.idle+' min d’inactivité'+
    (CFG.lockOnHide?' · verrouillage si l’onglet est masqué':'')+'</span>'+
    '<div class="jrg-sess-a">'+
     '<button class="jrg-pri" data-jrg="gojr">⚖️ JusteRepère Admin</button>'+
     '<button data-jrg="goclassic">📚 JusteRepère classique</button>'+
     '<button class="jrg-danger" data-jrg="lock">🔒 Verrouiller maintenant</button>'+
     '<button data-jrg="change">🔑 Changer le mot de passe</button>'+
    '</div></div></div>'
  :
  '<div class="jrg-form">'+scaleSVG()+'<div class="jrg-form-b">'+
   pwField('jrgPw',first?'Créer le mot de passe administrateur':'Mot de passe administrateur',
    first?'8 caractères minimum':'Saisissez le mot de passe',G.pw,cd>0?' disabled':'')+
   (first?pwField('jrgPw2','Confirmer le mot de passe','Répétez le mot de passe',G.pw2):'')+
   '<div class="jrg-str"><i style="width:'+st+'%" class="'+(st<40?'ko':st<70?'warn':'ok')+'"></i></div>'+
   '<span class="jrg-str-l">'+(G.pw||first?(st<40?'Faible':st<70?'Correct':'Robuste')+' · '+st+'/100':'Champ vide')+'</span>'+
   '<p class="jrg-vide">Champ vide à l’ouverture · aucun mot de passe pré-rempli · saisie masquée</p>'+
   (G.caps?'<p class="jrg-caps">⇪ Verrouillage majuscules actif</p>':'')+
   (G.err?'<p class="jrg-err">'+esc(G.err)+'</p>':'')+
   (cd>0?'<p class="jrg-cool">Blocage temporaire · <b id="jrgCd">'+Math.ceil(cd/1000)+'</b> s</p>':'')+
   '<div class="jrg-form-a">'+
    '<button class="jrg-pri" data-jrg="submit"'+(cd>0||G.busy?' disabled':'')+'>'+(G.busy?'Vérification…':first?'🔐 Créer et ouvrir':'🔓 Déverrouiller')+'</button>'+
    '<button data-jrg="home">🏠 Accueil</button>'+
    '<button data-jrg="sound" id="jrgMute">'+(AU.on?'🔊':'🔇')+'</button></div>'+
   '<p class="jrg-hint">'+(first?'Aucun mot de passe n’est encore défini pour JusteRepère sur cet appareil. Le premier mot de passe saisi devient la référence administrateur.'
    :G.hasApp?'Le mot de passe administrateur de l’application est requis.'
    :'Le mot de passe administrateur JusteRepère est requis.')+' Entrée pour valider.</p>'+
  '</div></div>')+
 (changing?'<div class="jrg-change"><b>🔑 Changer le mot de passe administrateur</b>'+
  (G.hasApp?'<p class="jrg-err">Mot de passe défini par l’application : modifiez-le depuis l’espace Admin.</p>':'')+
  pwField('jrgOld','Mot de passe actuel','Saisissez le mot de passe actuel',(G.change||{}).old)+
  pwField('jrgN1','Nouveau mot de passe','8 caractères minimum',(G.change||{}).n1)+
  pwField('jrgN2','Confirmer le nouveau mot de passe','Répétez le nouveau mot de passe',(G.change||{}).n2)+
  (G.err?'<p class="jrg-err">'+esc(G.err)+'</p>':'')+
  '<div class="jrg-form-a"><button class="jrg-pri" data-jrg="dosave">💾 Enregistrer</button>'+
  '<button data-jrg="cancelchange">Annuler</button></div></div>':'')+
 '</div><aside class="jrg-right">'+
  visualDock()+
  '<div class="jrg-panel"><b>État de la protection</b><table class="jrg-tbl">'+
   '<tr><td>Accès</td><td><b class="'+(G.unlocked?'ok':'ko')+'">'+(G.unlocked?'Ouvert':'Verrouillé')+'</b></td></tr>'+
   '<tr><td>Référence</td><td>'+(G.hasApp?'Mot de passe de l’application':refHash()?'Mot de passe local défini':'À définir')+'</td></tr>'+
   '<tr><td>Champ mot de passe</td><td><b class="ok">Vide · sans points</b></td></tr>'+
   '<tr><td>Session</td><td>'+CFG.session+' min</td></tr>'+
   '<tr><td>Inactivité</td><td>'+CFG.idle+' min</td></tr>'+
   '<tr><td>Onglet masqué</td><td>'+(CFG.lockOnHide?'Verrouille':'Ignore')+'</td></tr>'+
   '<tr><td>À chaque ouverture</td><td>'+(CFG.everyTime?'Mot de passe requis':'Session d’onglet')+'</td></tr>'+
   '<tr><td>Tentatives échouées</td><td><b class="'+(G.fails.n?'ko':'ok')+'">'+(G.fails.n||0)+'</b></td></tr>'+
  '</table></div>'+
  '<div class="jrg-panel"><b>Journal des accès</b><div class="jrg-log" id="jrgLog">'+logHtml()+'</div>'+
   '<div class="jrg-panel-a"><button data-jrg="export">🧾 Exporter</button><button data-jrg="clearlog">Vider</button></div></div>'+
 '</aside></div></div>'}
function visualDock(){
 return '<div class="jrg-panel jrg-vdock"><b>🎛️ Atelier visuel · balance &amp; sceau</b>'+
 vrg('stroke','Épaisseur des câbles',.4,5,' px',.1)+
 vrg('tilt','Amplitude du fléau',0,14,'°',.2)+
 vrg('tiltSpeed','Cycle du fléau',1.5,16,' s',.1)+
 vrg('parts','Particules',0,40,'',1)+
 vrg('glow','Halo du sceau',0,100,'%',1)+
 vrg('grain','Grain parchemin',0,40,'',1)+
 vrg('density','Densité interface',85,125,'%',1)+
 '<div class="jrg-vcols">'+
  '<div><input type="color" data-jrv="seal" value="'+CFG.seal+'"><span>Sceau</span></div>'+
  '<div><input type="color" data-jrv="accent" value="'+CFG.accent+'"><span>Accent</span></div></div>'+
 '<div class="jrg-vtgs">'+vtg('beam','Fléau animé')+vtg('particles','Particules')+vtg('blurOnLock','Fond flouté')+'</div>'+
 '<div class="jrg-vbtns"><button data-jrv-act="reset">↺ Réinitialiser</button>'+
  '<button data-jrv-act="rand">🎲 Aléatoire</button>'+
  '<button data-jrv-act="sound" id="jrgVMute">'+(AU.on?'🔊 Son':'🔇 Muet')+'</button></div>'+
 '<p class="jrg-vnote">Réglages appliqués <b>en direct</b> sur la balance, le sceau et l’arrière-plan.</p></div>'}
function vrg(k,l,a,b,u,step){return '<div class="jrg-vc"><label>'+l+' <b id="jrgvo_'+k+'">'+CFG[k]+u+'</b></label>'+
 '<input type="range" data-jrv="'+k+'" data-u="'+u+'" min="'+a+'" max="'+b+'" step="'+(step||1)+'" value="'+CFG[k]+'"></div>'}
function vtg(k,l){return '<label class="jrg-vtg'+(CFG[k]?' on':'')+'" id="jrgvt_'+k+'"><input type="checkbox" data-jrvt="'+k+'"'+(CFG[k]?' checked':'')+'> '+l+'</label>'}
function syncVisualDock(){
 try{
  $$('[data-jrv]').forEach(function(e){var k=e.dataset.jrv;e.value=CFG[k];
   var o=$('#jrgvo_'+k);if(o)o.textContent=(k==='stroke'||k==='tilt'||k==='tiltSpeed'?(+CFG[k]).toFixed(1):CFG[k])+(e.dataset.u||'')});
  ['beam','particles','blurOnLock'].forEach(function(k){
   var w=$('#jrgvt_'+k);if(w){var i=w.querySelector('input');if(i)i.checked=!!CFG[k];w.classList.toggle('on',!!CFG[k])}});
  var m=$('#jrgVMute');if(m)m.textContent=AU.on?'🔊 Son':'🔇 Muet';
 }catch(e){}}
function paintTimer(){
 try{
  var sessMs=Math.max(1,CFG.session*60000),left=Math.max(0,G.exp-Date.now());
  var c=$('#jrgClock');if(c)c.textContent=mmss(left);
  var r=$('.jrg-ring');if(r)r.style.setProperty('--p',(left/sessMs*100).toFixed(1));
  var t=$('#jrgBarClock');if(t)t.textContent=mmss(left);
  var s=$('#jrgBarState');if(s)s.textContent=G.unlocked?'OUVERT':'VERROUILLÉ';
 }catch(e){}}
function paintStrength(){
 try{var st=strength(G.change?G.change.n1||'':G.pw);
  var i=$('.jrg-str i');if(i){i.style.width=st+'%';i.className=st<40?'ko':st<70?'warn':'ok'}
  var l=$('.jrg-str-l');
  if(l)l.textContent=(G.pw||G.change||!refHash())?((st<40?'Faible':st<70?'Correct':'Robuste')+' · '+st+'/100'):'Champ vide';
 }catch(e){}}
function bindGate(){
 var v=$('#view');if(!v||v._jrg)return;v._jrg=1;
 v.addEventListener('input',function(e){
  var t=e.target;if(!t)return;
  if(t.id==='jrgPw'){G.pw=t.value;paintStrength();return}
  if(t.id==='jrgPw2'){G.pw2=t.value;return}
  if(t.id==='jrgOld'){G.change=G.change||{};G.change.old=t.value;return}
  if(t.id==='jrgN1'){G.change=G.change||{};G.change.n1=t.value;paintStrength();return}
  if(t.id==='jrgN2'){G.change=G.change||{};G.change.n2=t.value;return}
  var vk=t.dataset&&t.dataset.jrv;
  if(vk){CFG[vk]=+t.value;normCfg();saveCfg();applyVisual();
   var o=$('#jrgvo_'+vk);if(o)o.textContent=(vk==='stroke'||vk==='tilt'||vk==='tiltSpeed'?(+CFG[vk]).toFixed(1):CFG[vk])+(t.dataset.u||'');
   return}});
 v.addEventListener('change',function(e){
  var t=e.target;if(!t)return;
  var vk=t.dataset&&t.dataset.jrv;
  if(vk&&t.type==='color'){CFG[vk]=t.value;normCfg();saveCfg();applyVisual();syncNav();snd('tick');return}
  var tk=t.dataset&&t.dataset.jrvt;
  if(tk){CFG[tk]=t.checked;saveCfg();applyVisual();
   var w=$('#jrgvt_'+tk);if(w)w.classList.toggle('on',CFG[tk]);snd('tick');return}});
 v.addEventListener('keydown',function(e){
  var id=e.target&&e.target.id||'';
  if(e.key==='Enter'&&(id==='jrgPw'||id==='jrgPw2')){e.preventDefault();submit();return}
  if(e.key==='Enter'&&/^jrg(Old|N1|N2)$/.test(id)){e.preventDefault();changePw();return}
  try{if(e.getModifierState){var c=e.getModifierState('CapsLock');
   if(c!==G.caps){G.caps=c;var el=$('.jrg-caps');
    if(c&&!el){var p=$('#jrgPw');if(p&&p.parentNode&&p.parentNode.parentNode){
     var d=document.createElement('p');d.className='jrg-caps';d.textContent='⇪ Verrouillage majuscules actif';
     p.parentNode.parentNode.insertBefore(d,p.parentNode.nextSibling)}}
    else if(!c&&el&&el.parentNode)el.parentNode.removeChild(el)}}}catch(x){}});
 v.addEventListener('click',function(e){
  var eye=e.target.closest?e.target.closest('[data-jrgeye]'):null;
  if(eye){var i=$('#'+eye.dataset.jrgeye);
   if(i){i.type=i.type==='password'?'text':'password';eye.textContent=i.type==='password'?'👁':'🙈';
    try{i.focus()}catch(x){}}return}
  var clr=e.target.closest?e.target.closest('[data-jrgclr]'):null;
  if(clr){var id=clr.dataset.jrgclr,f=$('#'+id);
   if(f){f.value='';f.dataset.jrgTyped='1'}
   if(id==='jrgPw')G.pw='';if(id==='jrgPw2')G.pw2='';
   if(G.change){if(id==='jrgOld')G.change.old='';if(id==='jrgN1')G.change.n1='';if(id==='jrgN2')G.change.n2=''}
   paintStrength();snd('clear');try{if(f)f.focus()}catch(x){}return}
  var va=e.target.closest?e.target.closest('[data-jrv-act]'):null;
  if(va){var a=va.dataset.jrvAct;
   if(a==='reset'){var keep={session:CFG.session,idle:CFG.idle,lockOnHide:CFG.lockOnHide,everyTime:CFG.everyTime};
    CFG=Object.assign({},DEF,keep);normCfg();saveCfg();applyVisual();syncVisualDock();syncNav();snd('tick');toast('↺ Atelier visuel réinitialisé');return}
   if(a==='rand'){var pal=[['#d8b45a','#22c55e'],['#ffb020','#38bdf8'],['#c084fc','#a3e635'],
     ['#7dd3fc','#ff4d9d'],['#a3e635','#d8b45a'],['#ff9f4a','#22c55e']];
    var p=pal[Math.floor(Math.random()*pal.length)];CFG.seal=p[0];CFG.accent=p[1];
    CFG.glow=28+Math.floor(Math.random()*66);CFG.grain=Math.floor(Math.random()*32);
    CFG.density=90+Math.floor(Math.random()*30);CFG.stroke=+(0.6+Math.random()*3.4).toFixed(1);
    CFG.tilt=+(Math.random()*12).toFixed(1);CFG.tiltSpeed=+(2+Math.random()*10).toFixed(1);
    CFG.parts=Math.floor(Math.random()*36);normCfg();saveCfg();applyVisual();syncVisualDock();syncNav();
    snd('seal');toast('🎲 Variante générée');return}
   if(a==='sound'){AU.on=!AU.on;LS.s('jrgSound',AU.on);syncVisualDock();
    var m=$('#jrgMute');if(m)m.textContent=AU.on?'🔊':'🔇';
    var bs=$('#jrgBarSound');if(bs)bs.textContent=AU.on?'🔊':'🔇';if(AU.on)snd('tick');return}
   return}
  var b=e.target.closest?e.target.closest('[data-jrg]'):null;if(!b)return;
  var k=b.dataset.jrg;
  if(k==='submit'){submit();return}
  if(k==='home'){try{if(typeof window.__jrgInner==='function')window.__jrgInner('accueil')}catch(x){}return}
  if(k==='sound'){AU.on=!AU.on;LS.s('jrgSound',AU.on);b.textContent=AU.on?'🔊':'🔇';syncVisualDock();
   var m2=$('#jrgBarSound');if(m2)m2.textContent=AU.on?'🔊':'🔇';if(AU.on)snd('tick');return}
  if(k==='lock'){revoke('Verrouillage manuel');return}
  if(k==='gojr'){G.target='jradmin';openTarget();return}
  if(k==='goclassic'){G.target='jr';openTarget();return}
  if(k==='change'){G.mode='change';G.change={};G.err='';renderGate(true);return}
  if(k==='cancelchange'){G.mode='ask';G.change=null;G.err='';renderGate(true);return}
  if(k==='dosave'){changePw();return}
  if(k==='export'){dl(new Blob([JSON.stringify({ts:new Date().toISOString(),config:CFG,tentatives:G.fails,journal:G.log},null,2)],
   {type:'application/json'}),'JusteRepere-journal-'+new Date().toISOString().slice(0,10)+'.json');snd('out');toast('🧾 Journal exporté');return}
  if(k==='clearlog'){G.log=[];LS.s('jrgLog',[]);G.renderKey='';var el=$('#jrgLog');if(el)el.innerHTML=logHtml();snd('tick');return}})}

/* ══════════ barre de sécurité ══════════ */
function bar(){
 try{
  var cur=view(),show=G.unlocked&&(cur==='jr'||cur==='jradmin'||cur==='jrgate');
  document.body.classList.toggle('jrg-bar-on',show);
  if(!show){var b=$('#jrgBar');if(b&&b.parentNode)b.parentNode.removeChild(b);return}
  attachBar();
 }catch(e){}}
function attachBar(){
 try{
  var cur=view();
  if(!G.unlocked||(cur!=='jr'&&cur!=='jradmin'&&cur!=='jrgate')){
   var x=$('#jrgBar');if(x&&x.parentNode)x.parentNode.removeChild(x);
   document.body.classList.remove('jrg-bar-on');return}
  document.body.classList.add('jrg-bar-on');
  if($('#jrgBar')){paintTimer();syncBar();return}
  var b=document.createElement('div');b.id='jrgBar';
  b.innerHTML='<div class="jrg-bar-id"><span class="jrg-bar-seal">⚖️</span>'+
   '<div><b>SÉCURITÉ JUSTEREPÈRE</b><span id="jrgBarState">OUVERT</span></div>'+
   '<div class="jrg-bar-clock" id="jrgBarClock">--:--</div>'+
   '<button class="jrg-bar-lock" data-jrgb="lock">🔒 Verrouiller</button></div>'+
   '<div class="jrg-bar-tools">'+
   brg('session','Session',5,120,' min',1)+brg('idle','Inactivité',1,30,' min',1)+
   '<div class="jrg-btgs">'+btg('lockOnHide','Onglet masqué')+btg('everyTime','À chaque ouverture')+
    btg('blurOnLock','Masquer au verrou')+btg('beam','Fléau animé')+btg('particles','Particules')+'</div>'+
   brg('stroke','Câbles',.4,5,' px',.1)+brg('tilt','Fléau',0,14,'°',.2)+
   brg('parts','Particules',0,40,'',1)+brg('density','Densité',85,125,'%',1)+
   brg('glow','Halo',0,100,'%',1)+brg('grain','Grain',0,40,'',1)+
   '<div class="jrg-bcols"><div><input type="color" data-jrgb="seal" value="'+CFG.seal+'"><span>Sceau</span></div>'+
    '<div><input type="color" data-jrgb="accent" value="'+CFG.accent+'"><span>Accent</span></div></div>'+
   '<div class="jrg-bbtns"><button data-jrgb="change">🔑 Mot de passe</button>'+
    '<button data-jrgb="export">🧾 Journal</button>'+
    '<button data-jrgb="sound" id="jrgBarSound">'+(AU.on?'🔊':'🔇')+'</button>'+
    '<button data-jrgb="reset">↺</button><button data-jrgb="rand">🎲</button>'+
    '<button class="p" data-jrgb="gate">⚖️ État</button></div></div>';
  document.body.appendChild(b);
  b.addEventListener('input',function(e){
   var k=e.target.dataset&&e.target.dataset.jrgb;if(!k)return;
   CFG[k]=e.target.type==='range'?+e.target.value:e.target.value;normCfg();
   var o=$('#jrgbo_'+k);
   if(o)o.textContent=(k==='stroke'||k==='tilt'?(+CFG[k]).toFixed(1):CFG[k])+(k==='session'||k==='idle'?' min':k==='stroke'?' px':k==='tilt'?'°':k==='grain'||k==='parts'?'':'%');
   saveCfg();applyVisual();
   if(k==='session'&&G.unlocked){G.exp=Date.now()+CFG.session*60000;paintTimer()}
   if(k==='everyTime'&&CFG.everyTime){try{sessionStorage.removeItem('kf_jrgSession')}catch(x){}}
   if(k==='seal'||k==='accent')syncNav();
   snd('tick')});
  b.addEventListener('change',function(e){
   var k=e.target.dataset&&e.target.dataset.jrgbt;if(!k)return;
   CFG[k]=e.target.checked;var w=$('#jrgbt_'+k);if(w)w.classList.toggle('on',CFG[k]);
   saveCfg();applyVisual();
   if(k==='everyTime'&&CFG.everyTime){try{sessionStorage.removeItem('kf_jrgSession')}catch(x){}}
   snd('tick')});
  b.addEventListener('click',function(e){
   var t=e.target.closest?e.target.closest('[data-jrgb]'):null;if(!t)return;
   var k=t.dataset.jrgb;
   if(k==='lock'){revoke('Verrouillage depuis la barre de sécurité');return}
   if(k==='gate'){G.mode='ask';showGate();return}
   if(k==='change'){G.mode='change';G.change={};G.err='';showGate();return}
   if(k==='export'){dl(new Blob([JSON.stringify({ts:new Date().toISOString(),config:CFG,journal:G.log},null,2)],
    {type:'application/json'}),'JusteRepere-journal-'+new Date().toISOString().slice(0,10)+'.json');snd('out');toast('🧾 Journal exporté');return}
   if(k==='sound'){AU.on=!AU.on;LS.s('jrgSound',AU.on);t.textContent=AU.on?'🔊':'🔇';
    var m=$('#jrgMute');if(m)m.textContent=AU.on?'🔊':'🔇';syncVisualDock();if(AU.on)snd('tick');return}
   if(k==='reset'){var keep={session:CFG.session,idle:CFG.idle,lockOnHide:CFG.lockOnHide,everyTime:CFG.everyTime};
    CFG=Object.assign({},DEF,keep);normCfg();saveCfg();applyVisual();
    var bb=$('#jrgBar');if(bb&&bb.parentNode)bb.parentNode.removeChild(bb);attachBar();
    syncNav();if(view()==='jrgate')renderGate(true);snd('tick');toast('↺ Réglages réinitialisés');return}
   if(k==='rand'){var pal=[['#d8b45a','#22c55e'],['#ffb020','#38bdf8'],['#c084fc','#a3e635'],
     ['#7dd3fc','#ff4d9d'],['#a3e635','#d8b45a'],['#ff9f4a','#22c55e']];
    var p=pal[Math.floor(Math.random()*pal.length)];CFG.seal=p[0];CFG.accent=p[1];
    CFG.glow=28+Math.floor(Math.random()*66);CFG.grain=Math.floor(Math.random()*32);
    CFG.density=90+Math.floor(Math.random()*30);CFG.stroke=+(0.6+Math.random()*3.4).toFixed(1);
    CFG.tilt=+(Math.random()*12).toFixed(1);CFG.parts=Math.floor(Math.random()*36);
    normCfg();saveCfg();applyVisual();
    var b2=$('#jrgBar');if(b2&&b2.parentNode)b2.parentNode.removeChild(b2);attachBar();
    syncNav();if(view()==='jrgate')renderGate(true);snd('seal');toast('🎲 Thème généré');return}});
  syncBar();paintTimer();applyVisual();
 }catch(e){}}
function brg(k,l,a,b,u,step){
 var val=(k==='stroke'||k==='tilt')?(+CFG[k]).toFixed(1):CFG[k];
 return '<div class="jrg-bc"><label>'+l+' <b id="jrgbo_'+k+'">'+val+u+'</b></label>'+
 '<input type="range" data-jrgb="'+k+'" min="'+a+'" max="'+b+'" step="'+(step||1)+'" value="'+CFG[k]+'"></div>'}
function btg(k,l){return '<label class="jrg-btg'+(CFG[k]?' on':'')+'" id="jrgbt_'+k+'"><input type="checkbox" data-jrgbt="'+k+'"'+(CFG[k]?' checked':'')+'> '+l+'</label>'}
function syncBar(){
 try{
  $$('[data-jrgb]').forEach(function(e){var k=e.dataset.jrgb;if(e.type==='range'||e.type==='color')e.value=CFG[k]});
  ['session','idle','stroke','tilt','parts','density','glow','grain'].forEach(function(k){
   var o=$('#jrgbo_'+k);
   if(o)o.textContent=(k==='stroke'||k==='tilt'?(+CFG[k]).toFixed(1):CFG[k])+
    (k==='session'||k==='idle'?' min':k==='stroke'?' px':k==='tilt'?'°':k==='grain'||k==='parts'?'':'%')});
  ['lockOnHide','everyTime','blurOnLock','beam','particles'].forEach(function(k){
   var w=$('#jrgbt_'+k);if(w){var i=w.querySelector('input');if(i)i.checked=!!CFG[k];w.classList.toggle('on',!!CFG[k])}});
 }catch(e){}}

/* ══════════ CSS ══════════ */
function css(){
 if($('#jrgCss'))return;var s=document.createElement('style');s.id='jrgCss';
 s.textContent=
 ':root{--jrg-seal:#d8b45a;--jrg-acc:#22c55e;--jrg-glow:.56;--jrg-grain:.14;--jrg-den:1;'+
 '--jrg-tilt:4.2deg;--jrg-tiltdur:5.4s;'+
 '--jrg-ink:#04100b;--jrg-ink2:#08190f;--jrg-surf:#0d2417;--jrg-line:#1e4a31;--jrg-line2:#2c6a46;'+
 '--jrg-tx:#f1f8f2;--jrg-tx2:#c6ddcc;--jrg-mut:#88ad95;--jrg-dim:#5c876d;'+
 '--jrg-cyan:#38bdf8;--jrg-amber:#ffb020;--jrg-gar:#ff4d6d;--jrg-acid:#a3e635}'+
 'body.jrg-blur #bgLayer,body.jrg-blur #wallLayer{filter:blur(14px) saturate(.6)}'+
 '.jrg-stage{position:relative;border-radius:22px;overflow:hidden;border:1px solid var(--jrg-line);'+
  'background:linear-gradient(140deg,#04100b 0%,#0a2416 34%,#0e1c2e 64%,#1d1226 88%,#2a1220 100%);'+
  'box-shadow:0 24px 64px #000c;min-height:min(78vh,760px)}'+
 '.jrg-grid{position:absolute;inset:0;opacity:.3;background-image:linear-gradient(#d8b45a1a 1px,transparent 1px),linear-gradient(90deg,#d8b45a1a 1px,transparent 1px);'+
  'background-size:34px 34px;-webkit-mask-image:radial-gradient(78% 78% at 22% 18%,#000,transparent);mask-image:radial-gradient(78% 78% at 22% 18%,#000,transparent)}'+
 '.jrg-aur{position:absolute;inset:-14%;pointer-events:none;opacity:calc(var(--jrg-glow)*.62);mix-blend-mode:screen;'+
  'background:radial-gradient(38% 44% at 14% 8%,var(--jrg-seal),transparent 62%),'+
  'radial-gradient(36% 42% at 88% 12%,var(--jrg-cyan),transparent 60%),'+
  'radial-gradient(44% 50% at 74% 96%,var(--jrg-acc),transparent 62%),'+
  'radial-gradient(30% 36% at 30% 92%,var(--jrg-gar),transparent 60%);animation:jrgAur 19s ease-in-out infinite alternate}'+
 '@keyframes jrgAur{to{transform:translate3d(2.4%,-2%,0) scale(1.08)}}'+
 '.jrg-grain{position:absolute;inset:0;pointer-events:none;opacity:var(--jrg-grain);mix-blend-mode:overlay;'+
  'background-image:radial-gradient(#f4ecd8 1px,transparent 1px);background-size:3px 3px}'+
 '.jrg-parts{position:absolute;inset:0;pointer-events:none;overflow:hidden}'+
 '.jrg-parts i{position:absolute;bottom:-12px;border-radius:50%;background:var(--jrg-seal);'+
  'box-shadow:0 0 12px var(--jrg-seal);opacity:.5;animation:jrgUp 18s linear infinite}'+
 '@keyframes jrgUp{0%{transform:translateY(0);opacity:0}14%{opacity:.6}86%{opacity:.35}100%{transform:translateY(-104vh);opacity:0}}'+
 '.jrg-inner{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:22px;padding:26px;align-items:start}'+
 '@media(max-width:1080px){.jrg-inner{grid-template-columns:1fr;padding:20px}}'+
 '.jrg-left{min-width:0}'+
 '.jrg-kick{display:inline-block;font:800 10px/1 system-ui;letter-spacing:1.7px;color:#04100b;'+
  'background:linear-gradient(90deg,var(--jrg-seal),var(--jrg-acc));padding:7px 13px;border-radius:8px;margin-bottom:14px}'+
 '.jrg-left h1{font-size:clamp(30px,5.4vw,46px);margin:0 0 10px;color:#f7fcf7;letter-spacing:-1.2px;font-weight:800}'+
 '.jrg-lede{margin:0 0 20px;font-size:14px;line-height:1.7;color:#a8c9b3;max-width:640px}'+
 '.jrg-lede b{color:#eaf6ec}'+
 '.jrg-form{display:grid;grid-template-columns:210px minmax(0,1fr);gap:22px;align-items:center;'+
  'border:1px solid var(--jrg-line2);border-radius:18px;padding:22px;'+
  'background:linear-gradient(150deg,#08190fdd,#0d2417cc 60%,#141026cc);box-shadow:0 16px 44px #000a}'+
 '@media(max-width:720px){.jrg-form{grid-template-columns:1fr;padding:18px}}'+
 '.jrg-scale{width:100%;height:auto;filter:drop-shadow(0 10px 26px #000a)}'+
 '.jrg-beam-g{transform-origin:110px 55.5px}'+
 'body.jrg-beam .jrg-beam-g{animation:jrgTilt var(--jrg-tiltdur) ease-in-out infinite alternate}'+
 '@keyframes jrgTilt{0%{transform:rotate(calc(var(--jrg-tilt)*-1))}100%{transform:rotate(var(--jrg-tilt))}}'+
 '.jrg-form-b label,.jrg-change label{display:block;font-size:10px;font-weight:800;letter-spacing:.9px;text-transform:uppercase;color:var(--jrg-dim);margin:12px 0 6px}'+
 '.jrg-form-b label:first-child{margin-top:0}'+
 '.jrg-pwrow{display:flex;gap:7px}'+
 '.jrg-pwrow input{flex:1;min-width:0;margin:0;padding:14px 15px;font-size:16px;font-family:ui-monospace,monospace;letter-spacing:.5px;'+
  'background:#04100b;border:1px solid var(--jrg-line2);color:var(--jrg-tx);border-radius:12px}'+
 '.jrg-pwrow input::placeholder{color:#4d7a60;letter-spacing:0;font-family:system-ui,sans-serif;font-size:13.5px}'+
 '.jrg-pwrow input:focus{outline:none;border-color:var(--jrg-seal);box-shadow:0 0 0 4px #d8b45a26}'+
 '.jrg-pwrow input:disabled{opacity:.5}'+
 '.jrg-eye,.jrg-clr{flex:none;background:#04100b;border:1px solid var(--jrg-line2);border-radius:12px;padding:0 13px;font-size:16px;cursor:pointer}'+
 '.jrg-eye{color:var(--jrg-seal)}.jrg-clr{color:var(--jrg-gar)}'+
 '.jrg-eye:hover{border-color:var(--jrg-seal)}.jrg-clr:hover{border-color:var(--jrg-gar);background:#ff4d6d14}'+
 '.jrg-str{height:6px;border-radius:6px;background:#04100b;border:1px solid var(--jrg-line);overflow:hidden;margin-top:9px}'+
 '.jrg-str i{display:block;height:100%;transition:width .25s}'+
 '.jrg-str i.ko{background:linear-gradient(90deg,var(--jrg-gar),#ff8f6d)}'+
 '.jrg-str i.warn{background:linear-gradient(90deg,var(--jrg-amber),var(--jrg-seal))}'+
 '.jrg-str i.ok{background:linear-gradient(90deg,var(--jrg-acc),var(--jrg-acid))}'+
 '.jrg-str-l{display:block;font:700 10px/1 system-ui;color:var(--jrg-dim);margin-top:5px;letter-spacing:.6px}'+
 '.jrg-vide{margin:8px 0 0;font-size:10.5px;font-weight:700;color:var(--jrg-acc);letter-spacing:.2px}'+
 '.jrg-caps{margin:9px 0 0;font-size:11.5px;font-weight:700;color:var(--jrg-amber)}'+
 '.jrg-err{margin:11px 0 0;font-size:12.5px;font-weight:700;color:var(--jrg-gar);line-height:1.5}'+
 '.jrg-cool{margin:11px 0 0;font-size:12.5px;color:var(--jrg-amber);font-weight:700}'+
 '.jrg-cool b{font-family:ui-monospace,monospace;font-size:15px}'+
 '.jrg-form-a{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}'+
 '.jrg-form-a button,.jrg-sess-a button,.jrg-panel-a button,.jrg-change button,.jrg-vbtns button{'+
  'padding:11px 15px;font-size:12px;font-weight:800;border-radius:11px;border:1px solid var(--jrg-line2);'+
  'background:#04100b;color:var(--jrg-tx);cursor:pointer;transition:.16s}'+
 '.jrg-form-a button:hover,.jrg-sess-a button:hover,.jrg-panel-a button:hover,.jrg-vbtns button:hover{border-color:var(--jrg-seal);color:var(--jrg-seal)}'+
 '.jrg-pri{background:linear-gradient(135deg,var(--jrg-seal),var(--jrg-acc))!important;border-color:var(--jrg-seal)!important;color:#04100b!important}'+
 '.jrg-danger{border-color:var(--jrg-gar)!important;color:var(--jrg-gar)!important;background:#ff4d6d12!important}'+
 '.jrg-form-a button:disabled{opacity:.45;cursor:not-allowed}'+
 '.jrg-hint{margin:14px 0 0;font-size:11px;line-height:1.65;color:var(--jrg-dim)}'+
 '.jrg-session{display:flex;gap:22px;align-items:center;flex-wrap:wrap;border:1px solid var(--jrg-seal);border-radius:18px;'+
  'padding:22px;background:linear-gradient(150deg,#d8b45a12,#0d2417cc 60%,#141026cc)}'+
 '.jrg-ring{--p:100;width:124px;height:124px;flex:none;border-radius:50%;display:grid;place-items:center;position:relative;'+
  'background:conic-gradient(var(--jrg-seal) calc(var(--p)*1%),#04100b 0)}'+
 '.jrg-ring::after{content:"";position:absolute;inset:9px;border-radius:50%;background:#08190f;border:1px solid var(--jrg-line)}'+
 '.jrg-ring b{position:relative;z-index:1;font:900 25px/1 ui-monospace,monospace;color:var(--jrg-seal)}'+
 '.jrg-ring span{position:relative;z-index:1;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:var(--jrg-dim);margin-top:5px}'+
 '.jrg-sess-txt{flex:1;min-width:230px}'+
 '.jrg-sess-txt>b{display:block;font-size:17px;color:var(--jrg-tx);margin-bottom:6px}'+
 '.jrg-sess-txt>span{display:block;font-size:12px;color:var(--jrg-mut);line-height:1.6;margin-bottom:14px}'+
 '.jrg-sess-a{display:flex;gap:8px;flex-wrap:wrap}'+
 '.jrg-change{margin-top:16px;border:1px solid var(--jrg-cyan);border-radius:16px;padding:18px;background:#38bdf80e}'+
 '.jrg-change>b{display:block;font-size:14px;color:var(--jrg-tx);margin-bottom:4px}'+
 '.jrg-right{display:flex;flex-direction:column;gap:12px;position:sticky;top:76px;max-height:calc(100vh - 100px);overflow:auto;padding-right:3px}'+
 '@media(max-width:1080px){.jrg-right{position:static;max-height:none;overflow:visible}}'+
 '.jrg-panel{border:1px solid var(--jrg-line);border-radius:16px;padding:14px;background:linear-gradient(160deg,#08190fdd,#0d2417bb)}'+
 '.jrg-panel>b{display:block;font-size:10.5px;letter-spacing:1.1px;text-transform:uppercase;color:var(--jrg-seal);margin-bottom:10px}'+
 '.jrg-vdock{border-color:var(--jrg-seal);box-shadow:0 0 0 1px #d8b45a22}'+
 '.jrg-vc{margin-bottom:10px}'+
 '.jrg-vc label{display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin-bottom:4px;'+
  'font-size:9px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--jrg-dim)}'+
 '.jrg-vc label b{color:var(--jrg-seal);font-family:ui-monospace,monospace;font-size:10px}'+
 '.jrg-vc input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--jrg-seal),var(--jrg-acc),var(--jrg-cyan))}'+
 '.jrg-vc input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#f4ecd8;border:3px solid var(--jrg-seal);cursor:grab}'+
 '.jrg-vc input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#f4ecd8;border:3px solid var(--jrg-seal);cursor:grab}'+
 '.jrg-vcols{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}'+
 '.jrg-vcols div{display:flex;flex-direction:column;align-items:center;gap:3px}'+
 '.jrg-vcols input[type=color]{width:100%;height:32px;border:1px solid var(--jrg-line2);border-radius:9px;background:#04100b;padding:2px;cursor:pointer;margin:0}'+
 '.jrg-vcols span{font-size:8.5px;color:var(--jrg-dim)}'+
 '.jrg-vtgs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}'+
 '.jrg-vtg{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--jrg-dim);background:#04100b;'+
  'border:1px solid var(--jrg-line2);border-radius:16px;padding:4px 9px;cursor:pointer;white-space:nowrap}'+
 '.jrg-vtg input{width:auto;margin:0;accent-color:var(--jrg-seal)}'+
 '.jrg-vtg.on{color:var(--jrg-seal);border-color:var(--jrg-seal);background:#d8b45a14}'+
 '.jrg-vbtns{display:grid;grid-template-columns:1fr 1fr;gap:6px}'+
 '.jrg-vbtns button{padding:9px;font-size:10.5px}'+
 '.jrg-vbtns button:last-child{grid-column:1/-1}'+
 '.jrg-vnote{margin:10px 0 0;font-size:10px;line-height:1.55;color:var(--jrg-dim)}'+
 '.jrg-vnote b{color:var(--jrg-tx2)}'+
 '.jrg-tbl{width:100%;border-collapse:collapse;font-size:12px}'+
 '.jrg-tbl td{border-bottom:1px solid var(--jrg-line);padding:6px 4px;color:var(--jrg-tx2)}'+
 '.jrg-tbl td:first-child{color:var(--jrg-dim);width:46%}'+
 '.jrg-tbl b.ok{color:var(--jrg-acc)}.jrg-tbl b.ko{color:var(--jrg-gar)}'+
 '.jrg-log{max-height:180px;overflow:auto;background:#04100b;border:1px solid var(--jrg-line);border-radius:11px;padding:9px}'+
 '.jrg-log-l{display:flex;gap:7px;font:10.5px/1.65 ui-monospace,monospace;padding:2px 0}'+
 '.jrg-log-l i{font-style:normal;color:var(--jrg-dim);flex:none}'+
 '.jrg-log-l b{flex:none;min-width:74px;color:var(--jrg-seal)}'+
 '.jrg-log-l.ok span{color:var(--jrg-acc)}.jrg-log-l.warn span{color:var(--jrg-amber)}'+
 '.jrg-log-l.err span{color:var(--jrg-gar)}.jrg-log-l.info span{color:var(--jrg-tx2)}'+
 '.jrg-empty{margin:0;font-size:11.5px;color:var(--jrg-dim);text-align:center;padding:10px}'+
 '.jrg-panel-a{display:flex;gap:7px;margin-top:10px}'+
 '.jrg-panel-a button{flex:1;padding:9px;font-size:11px}'+
 '.jrg-right::-webkit-scrollbar,.jrg-log::-webkit-scrollbar,.jrg-bar-tools::-webkit-scrollbar{width:9px;height:9px}'+
 '.jrg-right::-webkit-scrollbar-track,.jrg-log::-webkit-scrollbar-track,.jrg-bar-tools::-webkit-scrollbar-track{background:#04100b;border-radius:8px}'+
 '.jrg-right::-webkit-scrollbar-thumb,.jrg-log::-webkit-scrollbar-thumb,.jrg-bar-tools::-webkit-scrollbar-thumb{'+
  'background:linear-gradient(var(--jrg-seal),var(--jrg-acc));border-radius:8px;border:2px solid #04100b}'+
 '.jrg-right::-webkit-scrollbar-thumb:hover,.jrg-log::-webkit-scrollbar-thumb:hover{background:var(--jrg-seal)}'+
 '.jrg-right,.jrg-log,.jrg-bar-tools{scrollbar-width:thin;scrollbar-color:var(--jrg-seal) #04100b}'+
 '#jrgBar{position:fixed;left:0;right:0;bottom:0;z-index:150;display:flex;height:118px;'+
  'background:linear-gradient(180deg,#08190fF2,#04100bF8);border-top:1px solid var(--jrg-seal);'+
  'box-shadow:0 -14px 40px #000b;backdrop-filter:blur(14px);font-size:calc(13px*var(--jrg-den))}'+
 'body.jrg-bar-on main{padding-bottom:140px}'+
 '.jrg-bar-id{flex:none;display:flex;align-items:center;gap:11px;padding:12px 16px;border-right:1px solid var(--jrg-line);'+
  'background:linear-gradient(135deg,#d8b45a14,transparent);min-width:250px}'+
 '.jrg-bar-seal{font-size:26px}'+
 '.jrg-bar-id>div>b{display:block;font:800 10px/1 system-ui;letter-spacing:1.3px;color:var(--jrg-seal)}'+
 '.jrg-bar-id>div>span{display:block;font:800 11px/1 system-ui;color:var(--jrg-acc);margin-top:5px}'+
 '.jrg-bar-clock{font:900 21px/1 ui-monospace,monospace;color:var(--jrg-seal);padding:6px 10px;border:1px solid var(--jrg-line2);border-radius:10px;background:#04100b}'+
 '.jrg-bar-lock{background:#ff4d6d14;border:1px solid var(--jrg-gar);color:var(--jrg-gar);border-radius:10px;padding:9px 12px;font-size:11.5px;font-weight:800;cursor:pointer;white-space:nowrap}'+
 '.jrg-bar-tools{flex:1;display:flex;align-items:center;gap:14px;padding:12px 16px;overflow-x:auto;overflow-y:hidden}'+
 '.jrg-bc{flex:none;width:116px}'+
 '.jrg-bc label{display:flex;justify-content:space-between;align-items:baseline;gap:5px;margin-bottom:5px;'+
  'font-size:8.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--jrg-dim)}'+
 '.jrg-bc label b{color:var(--jrg-seal);font-family:ui-monospace,monospace;font-size:9.5px}'+
 '.jrg-bc input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--jrg-seal),var(--jrg-acc),var(--jrg-cyan))}'+
 '.jrg-bc input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#f4ecd8;border:3px solid var(--jrg-seal);cursor:grab}'+
 '.jrg-btgs{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:5px;width:250px}'+
 '.jrg-btg{display:flex;align-items:center;gap:5px;font-size:9.5px;color:var(--jrg-dim);background:#04100b;'+
  'border:1px solid var(--jrg-line2);border-radius:16px;padding:4px 9px;cursor:pointer;white-space:nowrap}'+
 '.jrg-btg input{width:auto;margin:0;accent-color:var(--jrg-seal)}'+
 '.jrg-btg.on{color:var(--jrg-seal);border-color:var(--jrg-seal);background:#d8b45a14}'+
 '.jrg-bcols{flex:none;display:flex;gap:7px}'+
 '.jrg-bcols div{display:flex;flex-direction:column;align-items:center;gap:3px}'+
 '.jrg-bcols input[type=color]{width:46px;height:30px;border:1px solid var(--jrg-line2);border-radius:9px;background:#04100b;padding:2px;cursor:pointer;margin:0}'+
 '.jrg-bcols span{font-size:8px;color:var(--jrg-dim)}'+
 '.jrg-bbtns{flex:none;display:grid;grid-template-columns:repeat(3,auto);gap:5px}'+
 '.jrg-bbtns button{padding:8px 10px;font-size:10.5px;font-weight:800;border-radius:9px;border:1px solid var(--jrg-line2);background:#04100b;color:var(--jrg-tx);cursor:pointer;white-space:nowrap}'+
 '.jrg-bbtns .p{background:linear-gradient(135deg,var(--jrg-seal),var(--jrg-acc));border-color:var(--jrg-seal);color:#04100b}'+
 '@media(max-width:900px){#jrgBar{height:152px;flex-direction:column}'+
  '.jrg-bar-id{min-width:0;border-right:0;border-bottom:1px solid var(--jrg-line);padding:8px 12px;justify-content:space-between}'+
  '.jrg-bar-seal{font-size:20px}.jrg-bar-clock{font-size:16px}'+
  '.jrg-bar-tools{padding:9px 12px}body.jrg-bar-on main{padding-bottom:174px}}'+
 '@media(max-width:640px){.jrg-inner{padding:16px}.jrg-form{gap:14px}.jrg-scale{max-width:168px;margin:0 auto}'+
  '.jrg-session{padding:16px}.jrg-ring{width:104px;height:104px}.jrg-ring b{font-size:21px}'+
  '.jrg-pwrow input{font-size:15px;padding:12px 13px}.jrg-eye,.jrg-clr{padding:0 11px}}'+
 '@media (prefers-reduced-motion:reduce){.jrg-aur,.jrg-parts i,.jrg-beam-g{animation:none!important}}';
 document.head.appendChild(s)}

/* ══════════ boot ══════════ */
function boot(){
 try{
  css();
  G.hasApp=(typeof ADMIN_HASH!=='undefined'&&!!ADMIN_HASH);
  document.body.classList.add('jrg-locked');
  hook();restore();applyVisual();syncNav();watch();cleanPw(document);
  G.guard=setInterval(function(){
   try{
    hook();cleanPw(document);
    var cur=view();
    if(!G.unlocked&&(cur==='jr'||cur==='jradmin')){showGate();return}
    syncNav();bar();
    if(G.pending){var b=$('#boot');
     if(b&&b.classList.contains('hid')){var t=G.pending;G.pending=null;G.target=t;showGate()}}
   }catch(e){}},1200);
  document.addEventListener('click',function(e){
   try{
    var b=e.target.closest?e.target.closest('[data-act="nav"]'):null;
    if(b&&(b.dataset.k==='jr'||b.dataset.k==='jradmin')&&!G.unlocked){
     e.preventDefault();e.stopPropagation();G.target=b.dataset.k;showGate();snd('deny');return}
    var a=e.target.closest?e.target.closest('[data-act="jr"],[data-act="jrOpen"],[data-act="openJr"]'):null;
    if(a&&!G.unlocked){e.preventDefault();e.stopPropagation();G.target='jr';showGate();snd('deny')}
   }catch(x){}},true);
  try{var q=new URLSearchParams(location.search).get('view');
   if(q==='jr'||q==='jradmin'){G.target=q;setTimeout(showGate,150)}}catch(e){}
  jlog('INIT','Verrou JusteRepère actif · champ mot de passe vide, sans points','info');
 }catch(e){
  try{var v=$('#view');if(v){v.innerHTML=fallbackForm();bindGate();cleanPw(v)}}catch(x){}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFJrGate={lock:revoke,unlock:submit,show:showGate,state:G,cfg:CFG,
 isOpen:function(){return G.unlocked},log:function(){return G.log},render:function(){renderGate(true)},
 cleanFields:function(){cleanPw(document)}};
})();
