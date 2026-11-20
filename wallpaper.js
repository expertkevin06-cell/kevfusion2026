/* KEV FUSION 2026 — wallpaper.js v1.0.0
   FOND D'ÉCRAN ADMIN : import photo ou vidéo courte (≤ 10 s) au choix, rognage précis,
   22 réglages live, application immédiate à l'app, bibliothèque (recherche/filtre/tri/ordre/
   renommage/suppression + annulation), export photo/vidéo optimisée, diffusion aux tiers.
   Stockage IndexedDB (blobs), repli localStorage, diffusion lue côté tiers. */
(function(){
'use strict';
/* ═════════ utilitaires ═════════ */
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},d:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function uid(){return 'w'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function fmtT(s){s=Math.max(0,s||0);var m=Math.floor(s/60),r=s-m*60;return m+':'+(r<10?'0':'')+r.toFixed(1)}
function fmtSize(b){if(!b)return '—';return b<1024?b+' o':b<1048576?(b/1024).toFixed(0)+' Ko':(b/1048576).toFixed(2)+' Mo'}
function toast(m,act){
 if(act&&typeof window.toast!=='function'){/* fallback avec action */}
 if(typeof window.toast==='function'&&!act){window.toast(m);return}
 var t=$('#toast');if(!t){if(act)alert(m);return}
 t.innerHTML=esc(m)+(act?' <button id="wlUndoBtn" style="margin-left:10px;padding:4px 10px;font-size:12px">'+esc(act.label)+'</button>':'');
 t.classList.remove('hid');t.classList.add('show');
 if(act){var b=$('#wlUndoBtn');if(b)b.onclick=function(){act.fn();t.classList.add('hid');t.classList.remove('show')}}
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},act?9000:3200)}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function isAdmin(){try{return (typeof S!=='undefined'&&S.role==='admin')||LS.g('admDevice',false)===true}catch(e){return LS.g('admDevice',false)===true}}

/* ═════════ son (lié aux actions visibles, coupure unique en tête) ═════════ */
var AU={c:null,on:LS.g('wlSound',true)};
function actx(){if(!AU.c){try{AU.c=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
 if(AU.c&&AU.c.state==='suspended')AU.c.resume().catch(function(){});return AU.c}
function snd(k){
 if(!AU.on)return;var c=actx();if(!c)return;
 var m={tick:[1300,1300,.025,'sine'],apply:[560,900,.16,'triangle'],import:[420,760,.18,'sine'],
  trim:[880,660,.07,'square'],export:[523,880,.24,'triangle'],del:[300,150,.2,'sawtooth'],
  err:[220,120,.28,'sawtooth'],rec:[700,700,.05,'sine']}[k]||[900,900,.04,'sine'];
 try{var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(60,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.16,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.02)}catch(e){}}

/* ═════════ IndexedDB ═════════ */
var DBOK=('indexedDB' in window);
function idb(){return new Promise(function(res,rej){
 if(!DBOK)return rej(new Error('IndexedDB indisponible'));
 var r=indexedDB.open('kf-wall',1);
 r.onupgradeneeded=function(e){var d=e.target.result;
  if(!d.objectStoreNames.contains('items'))d.createObjectStore('items',{keyPath:'id'})};
 r.onsuccess=function(e){res(e.target.result)};r.onerror=function(){rej(r.error||new Error('IDB'))}})}
async function dbAll(){try{var d=await idb();return await new Promise(function(res,rej){
 var t=d.transaction('items','readonly'),q=t.objectStore('items').getAll();
 q.onsuccess=function(){res(q.result||[])};q.onerror=function(){rej(q.error)}})}catch(e){return []}}
async function dbPut(it){try{var d=await idb();return await new Promise(function(res,rej){
 var t=d.transaction('items','readwrite');t.objectStore('items').put(it);
 t.oncomplete=function(){res(true)};t.onerror=function(){rej(t.error)}})}catch(e){return false}}
async function dbDel(id){try{var d=await idb();return await new Promise(function(res,rej){
 var t=d.transaction('items','readwrite');t.objectStore('items').delete(id);
 t.oncomplete=function(){res(true)};t.onerror=function(){rej(t.error)}})}catch(e){return false}}

/* ═════════ état ═════════ */
var MAX=10;
var DEF={fit:'cover',scale:100,x:0,y:0,blur:0,bright:100,contrast:104,sat:106,hue:0,
 opacity:100,scrim:56,tint:'#04140c',tintAmt:16,blend:'normal',vignette:44,grain:7,
 motion:true,motionAmt:7,speed:26,loop:true,muted:true,volume:0,rate:100,eco:false,logo:true};
var ST={lib:[],cur:null,style:Object.assign({},DEF,LS.g('wlStyle',{})),trim:{in:0,out:0},
 q:'',filter:'all',sort:LS.g('wlSort','recent'),sel:[],drawer:null,undo:null,
 busy:false,prog:0,progTxt:'',live:true,strip:[],stripTok:0,rec:null,order:LS.g('wlOrder',[]),
 pub:LS.g('wlPub',null),tier:LS.g('wlTier',null)};
var URLS={};
function urlFor(it){if(!it||!it.blob)return '';if(URLS[it.id])return URLS[it.id];
 var u=URL.createObjectURL(it.blob);URLS[it.id]=u;return u}
function dropUrl(id){if(URLS[id]){try{URL.revokeObjectURL(URLS[id])}catch(e){}delete URLS[id]}}
function saveStyle(){LS.s('wlStyle',ST.style)}

/* ═════════ grain ═════════ */
var GRAIN=null;
function grain(){if(GRAIN)return GRAIN;
 var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d');
 var d=x.createImageData(128,128);
 for(var i=0;i<d.data.length;i+=4){var v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=30}
 x.putImageData(d,0,0);GRAIN=c.toDataURL('image/png');return GRAIN}

/* ═════════ calques de fond ═════════ */
var L=null,V=null,IMG=null,prevV=null,prevI=null;
function layers(){
 if(L&&document.body.contains(L))return L;
 L=document.createElement('div');L.id='wallLayer';L.setAttribute('aria-hidden','true');
 L.innerHTML='<div class="wl-media"><img id="wlImg" alt=""><video id="wlVid" playsinline preload="auto"></video></div>'+
  '<div class="wl-tint"></div><div class="wl-scrim"></div><div class="wl-vig"></div><div class="wl-grain"></div>';
 var bg=$('#bgLayer');
 if(bg&&bg.parentNode)bg.parentNode.insertBefore(L,bg.nextSibling);else document.body.appendChild(L);
 IMG=$('#wlImg');V=$('#wlVid');
 V.addEventListener('timeupdate',function(){loopGuard(V)});
 V.addEventListener('error',function(){/* média illisible : on garde le calque vide */});
 return L}
function loopGuard(v){
 if(!ST.cur||ST.cur.kind!=='video')return;
 var a=ST.trim.in,b=ST.trim.out;
 if(b-a<0.2)return;
 if(v.currentTime>=b-0.04||v.currentTime<a-0.25){
  if(ST.style.loop){try{v.currentTime=a}catch(e){}}
  else{v.pause()}}}
function filterStr(s){
 return 'blur('+(s.blur/10).toFixed(2)+'px) brightness('+(s.bright/100).toFixed(3)+') contrast('+
  (s.contrast/100).toFixed(3)+') saturate('+(s.sat/100).toFixed(3)+') hue-rotate('+s.hue+'deg)'}
function applyLive(){
 layers();
 var s=ST.style,it=ST.cur;
 var bg=$('#bgLayer');
 if(it){if(bg){if(bg.dataset.wlPrev==null)bg.dataset.wlPrev=bg.style.opacity||'';bg.style.opacity='0'}}
 else if(bg&&bg.dataset.wlPrev!=null){bg.style.opacity=bg.dataset.wlPrev;delete bg.dataset.wlPrev}
 var bl=$('#brandLayer');if(bl)bl.style.opacity=it&&!s.logo?'0':'';
 L.classList.toggle('on',!!it);
 L.style.setProperty('--wo',(s.opacity/100).toFixed(3));
 L.style.setProperty('--wsc',(s.scrim/100).toFixed(3));
 L.style.setProperty('--wta',(s.tintAmt/100).toFixed(3));
 L.style.setProperty('--wvi',(s.vignette/100).toFixed(3));
 L.style.setProperty('--wgr',(s.grain/100).toFixed(2));
 L.style.setProperty('--wdur',s.speed+'s');
 L.style.setProperty('--wmo',(s.motionAmt/100).toFixed(3));
 L.style.setProperty('--wtint',s.tint);
 L.style.setProperty('--wblend',s.blend);
 L.querySelector('.wl-grain').style.backgroundImage='url("'+grain()+'")';
 var mw=L.querySelector('.wl-media');
 mw.style.filter=filterStr(s);
 mw.style.transform='translate('+(s.x/10)+'%,'+(s.y/10)+'%) scale('+(s.scale/100).toFixed(3)+')';
 mw.classList.toggle('ken',!!(it&&it.kind==='photo'&&s.motion));
 if(!it){IMG.removeAttribute('src');V.pause();V.removeAttribute('src');L.classList.remove('vid','pic');return}
 var u=urlFor(it);
 if(it.kind==='video'){
  L.classList.add('vid');L.classList.remove('pic');
  IMG.removeAttribute('src');
  if(V.dataset.wid!==it.id){V.dataset.wid=it.id;V.src=u;V.load()}
  V.loop=false;V.muted=s.muted||!AU.on;V.volume=clamp(s.volume/100,0,1);
  V.playbackRate=clamp(s.rate/100,.25,2);
  V.style.objectFit=s.fit;
  if(!s.eco){var p=V.play();if(p&&p.catch)p.catch(function(){})}else V.pause();
 }else{
  L.classList.add('pic');L.classList.remove('vid');
  V.pause();V.removeAttribute('src');V.dataset.wid='';
  if(IMG.dataset.wid!==it.id){IMG.dataset.wid=it.id;IMG.src=u}
  IMG.style.objectFit=s.fit;
 }
 syncPreview()}
function syncPreview(){
 var box=$('#wlFrame');if(!box)return;
 var s=ST.style,it=ST.cur;
 box.style.setProperty('--wsc',(s.scrim/100).toFixed(3));
 box.style.setProperty('--wta',(s.tintAmt/100).toFixed(3));
 box.style.setProperty('--wvi',(s.vignette/100).toFixed(3));
 box.style.setProperty('--wgr',(s.grain/100).toFixed(2));
 box.style.setProperty('--wtint',s.tint);
 box.style.setProperty('--wblend',s.blend);
 box.style.setProperty('--wdur',s.speed+'s');
 box.style.setProperty('--wmo',(s.motionAmt/100).toFixed(3));
 box.querySelector('.wl-grain').style.backgroundImage='url("'+grain()+'")';
 var mw=box.querySelector('.wl-media');
 mw.style.filter=filterStr(s);
 mw.style.transform='translate('+(s.x/10)+'%,'+(s.y/10)+'%) scale('+(s.scale/100).toFixed(3)+')';
 mw.classList.toggle('ken',!!(it&&it.kind==='photo'&&s.motion));
 if(!it){prevI.removeAttribute('src');prevV.pause();prevV.removeAttribute('src');box.classList.remove('vid','pic');return}
 var u=urlFor(it);
 if(it.kind==='video'){
  box.classList.add('vid');box.classList.remove('pic');prevI.removeAttribute('src');
  if(prevV.dataset.wid!==it.id){prevV.dataset.wid=it.id;prevV.src=u;prevV.load()}
  prevV.muted=s.muted||!AU.on;prevV.volume=clamp(s.volume/100,0,1);
  prevV.playbackRate=clamp(s.rate/100,.25,2);prevV.style.objectFit=s.fit;
  var p=prevV.play();if(p&&p.catch)p.catch(function(){});
 }else{
  box.classList.add('pic');box.classList.remove('vid');prevV.pause();prevV.removeAttribute('src');prevV.dataset.wid='';
  if(prevI.dataset.wid!==it.id){prevI.dataset.wid=it.id;prevI.src=u}
  prevI.style.objectFit=s.fit}}

/* ═════════ presets procéduraux (bibliothèque amorce) ═════════ */
function artRally(x,W,H){
 var g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#03110a');g.addColorStop(.5,'#0a2c1b');g.addColorStop(1,'#061a26');
 x.fillStyle=g;x.fillRect(0,0,W,H);
 var a=x.createRadialGradient(W*.24,H*.16,20,W*.24,H*.16,W*.6);
 a.addColorStop(0,'rgba(37,194,87,.42)');a.addColorStop(1,'rgba(37,194,87,0)');x.fillStyle=a;x.fillRect(0,0,W,H);
 var b=x.createRadialGradient(W*.82,H*.2,20,W*.82,H*.2,W*.5);
 b.addColorStop(0,'rgba(56,189,248,.3)');b.addColorStop(1,'rgba(56,189,248,0)');x.fillStyle=b;x.fillRect(0,0,W,H);
 x.fillStyle='#fff';for(var i=0;i<160;i++){x.globalAlpha=Math.random()*.7;x.fillRect(Math.random()*W,Math.random()*H*.5,1.6,1.6)}
 x.globalAlpha=1;
 x.fillStyle='#061710';x.beginPath();x.moveTo(0,H*.72);
 for(var k=0;k<=12;k++)x.lineTo(W*k/12,H*.72-Math.sin(k*.8)*H*.05);
 x.lineTo(W,H);x.lineTo(0,H);x.closePath();x.fill();
 x.fillStyle='#04100a';x.fillRect(0,H*.82,W,H*.18);
 x.strokeStyle='#a3e635';x.lineWidth=H*.012;x.setLineDash([W*.05,W*.04]);
 x.beginPath();x.moveTo(0,H*.9);x.lineTo(W,H*.9);x.stroke();x.setLineDash([]);
 x.strokeStyle='#22c55e';x.lineWidth=H*.006;x.beginPath();x.moveTo(0,H*.825);x.lineTo(W,H*.825);x.stroke();
 var cx=W*.62,cy=H*.8,s=W*.0016;
 x.save();x.translate(cx,cy);x.scale(s*2.2,s*2.2);
 var bg2=x.createLinearGradient(0,-70,0,20);bg2.addColorStop(0,'#8dffb4');bg2.addColorStop(.45,'#25c257');bg2.addColorStop(1,'#053a1a');
 x.fillStyle=bg2;x.beginPath();x.moveTo(-160,10);x.lineTo(-152,-16);x.quadraticCurveTo(-96,-30,-52,-38);
 x.quadraticCurveTo(-20,-84,30,-82);x.quadraticCurveTo(78,-78,104,-40);x.quadraticCurveTo(146,-30,168,-14);
 x.lineTo(172,10);x.closePath();x.fill();
 x.fillStyle='#04140c';x.beginPath();x.moveTo(-46,-38);x.quadraticCurveTo(-16,-72,28,-70);
 x.quadraticCurveTo(66,-66,88,-40);x.closePath();x.fill();
 x.fillStyle='#f4ffe0';x.beginPath();x.moveTo(140,-22);x.lineTo(170,-14);x.lineTo(166,-2);x.lineTo(138,-8);x.closePath();x.fill();
 x.fillStyle='#05070a';[-92,104].forEach(function(wx){x.beginPath();x.arc(wx,12,30,0,7);x.fill();
  x.fillStyle='#d8b45a';x.beginPath();x.arc(wx,12,15,0,7);x.fill();x.fillStyle='#05070a'});
 x.restore();
 var beam=x.createLinearGradient(cx+W*.06,cy-H*.03,W,H*.7);
 beam.addColorStop(0,'rgba(244,255,224,.5)');beam.addColorStop(1,'rgba(244,255,224,0)');
 x.fillStyle=beam;x.beginPath();x.moveTo(cx+W*.06,cy-H*.03);x.lineTo(W,cy-H*.16);x.lineTo(W,cy+H*.04);x.closePath();x.fill();
 vign(x,W,H,.6)}
function artCircuit(x,W,H){
 var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a0a1e');g.addColorStop(.4,'#5b1a3a');g.addColorStop(.68,'#c2521f');g.addColorStop(1,'#f5b301');
 x.fillStyle=g;x.fillRect(0,0,W,H);
 var sun=x.createRadialGradient(W*.72,H*.62,10,W*.72,H*.62,W*.34);
 sun.addColorStop(0,'rgba(255,240,190,.95)');sun.addColorStop(.35,'rgba(255,176,32,.55)');sun.addColorStop(1,'rgba(255,176,32,0)');
 x.fillStyle=sun;x.fillRect(0,0,W,H);
 x.fillStyle='#160a12';x.beginPath();x.moveTo(0,H*.66);
 for(var k=0;k<=10;k++)x.lineTo(W*k/10,H*.66-Math.abs(Math.sin(k*1.1))*H*.08);
 x.lineTo(W,H);x.lineTo(0,H);x.closePath();x.fill();
 x.fillStyle='#0d0710';x.beginPath();x.moveTo(W*.1,H);x.quadraticCurveTo(W*.45,H*.72,W*.9,H*.68);
 x.lineTo(W,H*.74);x.quadraticCurveTo(W*.55,H*.82,W*.42,H);x.closePath();x.fill();
 x.save();x.lineWidth=H*.02;
 for(var i=0;i<16;i++){x.strokeStyle=i%2?'#f2f2f2':'#e11d2e';
  x.beginPath();x.moveTo(W*(.1+i*.02),H*(1-i*.006));x.quadraticCurveTo(W*(.45+i*.01),H*(.72+i*.002),W*(.9+i*.006),H*(.68+i*.004));x.stroke()}
 x.restore();
 x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=2;x.setLineDash([18,22]);
 x.beginPath();x.moveTo(W*.26,H);x.quadraticCurveTo(W*.5,H*.78,W*.95,H*.71);x.stroke();x.setLineDash([]);
 vign(x,W,H,.55)}
function artShop(x,W,H){
 var g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#0b1418');g.addColorStop(.55,'#16262b');g.addColorStop(1,'#0a1216');
 x.fillStyle=g;x.fillRect(0,0,W,H);
 for(var i=0;i<2600;i++){x.globalAlpha=Math.random()*.06;x.fillStyle=Math.random()<.5?'#fff':'#000';
  x.fillRect(Math.random()*W,Math.random()*H,2,2)}
 x.globalAlpha=1;
 x.strokeStyle='rgba(120,160,170,.14)';x.lineWidth=1;
 for(var k=0;k<26;k++){x.beginPath();x.moveTo(0,H*k/26);x.lineTo(W,H*k/26);x.stroke()}
 for(var j=0;j<40;j++){x.beginPath();x.moveTo(W*j/40,0);x.lineTo(W*j/40,H);x.stroke()}
 var sh=x.createLinearGradient(W*.1,0,W*.55,H);
 sh.addColorStop(0,'rgba(163,230,53,.22)');sh.addColorStop(.5,'rgba(56,189,248,.12)');sh.addColorStop(1,'rgba(56,189,248,0)');
 x.fillStyle=sh;x.beginPath();x.moveTo(W*.06,0);x.lineTo(W*.34,0);x.lineTo(W*.62,H);x.lineTo(W*.24,H);x.closePath();x.fill();
 x.strokeStyle='rgba(20,30,34,.85)';x.lineWidth=H*.05;
 x.beginPath();x.moveTo(-40,H*.9);x.quadraticCurveTo(W*.4,H*.7,W*.7,H*.95);x.stroke();
 x.beginPath();x.moveTo(-40,H*.98);x.quadraticCurveTo(W*.42,H*.78,W*.74,H*1.02);x.stroke();
 x.fillStyle='rgba(37,194,87,.9)';x.fillRect(W*.06,H*.12,W*.012,H*.2);
 x.fillStyle='rgba(255,176,32,.9)';x.fillRect(W*.085,H*.12,W*.012,H*.14);
 vign(x,W,H,.62)}
function artTopo(x,W,H){
 x.fillStyle='#04120c';x.fillRect(0,0,W,H);
 var g=x.createRadialGradient(W*.3,H*.3,20,W*.3,H*.3,W*.7);
 g.addColorStop(0,'rgba(37,194,87,.22)');g.addColorStop(1,'rgba(4,18,12,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
 for(var l=0;l<34;l++){
  x.beginPath();
  for(var px=0;px<=W;px+=8){
   var y=H*.5+Math.sin(px/W*6+l*.34)*H*.16+Math.sin(px/W*13+l*.7)*H*.05+(l-17)*H*.021;
   if(px===0)x.moveTo(px,y);else x.lineTo(px,y)}
  x.strokeStyle=l%5===0?'rgba(163,230,53,.72)':'rgba(37,194,87,.3)';
  x.lineWidth=l%5===0?2.2:1.1;x.stroke()}
 x.strokeStyle='rgba(56,189,248,.16)';x.lineWidth=1;
 for(var k=0;k<30;k++){x.beginPath();x.moveTo(W*k/30,0);x.lineTo(W*k/30,H);x.stroke()}
 for(var m=0;m<30;m++){x.beginPath();x.moveTo(0,H*m/30);x.lineTo(W,H*m/30);x.stroke()}
 for(var n=0;n<16;n++){var nx=Math.random()*W,ny=Math.random()*H;
  var gg=x.createRadialGradient(nx,ny,0,nx,ny,26);
  gg.addColorStop(0,'rgba(163,230,53,.9)');gg.addColorStop(1,'rgba(163,230,53,0)');
  x.fillStyle=gg;x.beginPath();x.arc(nx,ny,26,0,7);x.fill()}
 vign(x,W,H,.5)}
function vign(x,W,H,a){
 var v=x.createRadialGradient(W/2,H*.46,Math.min(W,H)*.2,W/2,H/2,Math.max(W,H)*.72);
 v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,'+a+')');x.fillStyle=v;x.fillRect(0,0,W,H)}
var PRESETS=[
 {name:'Rallye — Nuit verte',fn:artRally,tag:'rallye nuit vert'},
 {name:'Circuit — Aube ambre',fn:artCircuit,tag:'circuit aube ambre'},
 {name:'Atelier — Béton froid',fn:artShop,tag:'atelier béton gris'},
 {name:'Topographie — Lignes acides',fn:artTopo,tag:'topographie lignes acide'}];
async function makePreset(p){
 var W=1600,H=1000,c=document.createElement('canvas');c.width=W;c.height=H;
 p.fn(c.getContext('2d'),W,H);
 var blob=await new Promise(function(r){c.toBlob(r,'image/jpeg',.9)});
 var th=document.createElement('canvas');th.width=320;th.height=200;
 th.getContext('2d').drawImage(c,0,0,320,200);
 return{id:uid(),name:p.name,kind:'photo',type:'image/jpeg',dur:0,trim:{in:0,out:0},
  style:Object.assign({},DEF),blob:blob,thumb:th.toDataURL('image/jpeg',.72),ts:Date.now(),
  size:blob.size,w:W,h:H,preset:true,tag:p.tag}}
async function seed(){
 var lib=await dbAll();
 if(lib.length)return lib;
 var out=[];
 for(const p of PRESETS){var it=await makePreset(p);await dbPut(it);out.push(it)}
 return out}

/* ═════════ vignettes ═════════ */
async function thumbOf(blob,kind,at){
 try{
  var c=document.createElement('canvas');c.width=320;c.height=200;var x=c.getContext('2d');
  if(kind==='photo'){
   var u=URL.createObjectURL(blob),im=new Image();
   await new Promise(function(r,j){im.onload=r;im.onerror=j;im.src=u});
   var sc=Math.max(320/im.width,200/im.height),w=im.width*sc,h=im.height*sc;
   x.drawImage(im,(320-w)/2,(200-h)/2,w,h);URL.revokeObjectURL(u);
  }else{
   var u2=URL.createObjectURL(blob),v=document.createElement('video');
   v.muted=true;v.playsInline=true;v.preload='auto';v.src=u2;
   await new Promise(function(r,j){v.onloadeddata=r;v.onerror=j;setTimeout(r,4000)});
   try{v.currentTime=Math.min(at||.4,Math.max(0,(v.duration||1)-.1))}catch(e){}
   await new Promise(function(r){v.onseeked=r;setTimeout(r,1200)});
   var sc2=Math.max(320/(v.videoWidth||320),200/(v.videoHeight||200));
   var w2=(v.videoWidth||320)*sc2,h2=(v.videoHeight||200)*sc2;
   x.drawImage(v,(320-w2)/2,(200-h2)/2,w2,h2);URL.revokeObjectURL(u2);
  }
  return c.toDataURL('image/jpeg',.72)}catch(e){return ''}}

/* ═════════ import ═════════ */
async function importFiles(files){
 var list=Array.prototype.slice.call(files||[]).filter(function(f){return /^(image|video)\//.test(f.type)});
 if(!list.length){toast('Choisissez une photo ou une vidéo');snd('err');return}
 busy(true,'Import…');
 var added=[];
 for(var i=0;i<list.length;i++){
  var f=list[i];
  if(f.size>120*1048576){toast('« '+f.name+' » dépasse 120 Mo — ignoré');continue}
  var kind=/^video\//.test(f.type)?'video':'photo',dur=0,w=0,h=0;
  if(kind==='video'){
   var u=URL.createObjectURL(f),v=document.createElement('video');
   v.muted=true;v.preload='metadata';v.src=u;
   var ok=await new Promise(function(r){v.onloadedmetadata=function(){r(true)};v.onerror=function(){r(false)};setTimeout(function(){r(false)},9000)});
   if(!ok){URL.revokeObjectURL(u);toast('Vidéo illisible : '+f.name);snd('err');continue}
   dur=v.duration||0;w=v.videoWidth;h=v.videoHeight;URL.revokeObjectURL(u);
  }else{
   var u3=URL.createObjectURL(f),im=new Image();
   var ok2=await new Promise(function(r){im.onload=function(){r(true)};im.onerror=function(){r(false)};setTimeout(function(){r(false)},9000)});
   if(ok2){w=im.naturalWidth;h=im.naturalHeight}URL.revokeObjectURL(u3);
  }
  var trim={in:0,out:kind==='video'?Math.min(MAX,dur):0};
  var it={id:uid(),name:f.name.replace(/\.[^.]+$/,'').slice(0,60)||'Sans titre',kind:kind,type:f.type,
   dur:dur,trim:trim,style:Object.assign({},DEF),blob:f,thumb:'',ts:Date.now(),size:f.size,w:w,h:h,tag:''};
  it.thumb=await thumbOf(f,kind,trim.in+.3);
  await dbPut(it);added.push(it);
 }
 ST.lib=await dbAll();
 if(added.length){await selectItem(added[added.length-1].id,true);
  var v=added.filter(function(a){return a.kind==='video'&&a.dur>MAX});
  toast('📥 '+added.length+' média(s) importé(s)'+(v.length?' · '+v.length+' vidéo(s) > 10 s rognée(s)':''));snd('import')}
 busy(false);render()}

/* ═════════ sélection ═════════ */
async function selectItem(id,apply){
 var it=ST.lib.find(function(x){return x.id===id});
 if(!it){ST.cur=null;applyLive();return}
 ST.cur=it;ST.style=Object.assign({},DEF,it.style||{});
 ST.trim={in:(it.trim&&it.trim.in)||0,out:(it.trim&&it.trim.out)||(it.kind==='video'?Math.min(MAX,it.dur):0)};
 if(it.kind==='video'&&ST.trim.out-ST.trim.in>MAX)ST.trim.out=ST.trim.in+MAX;
 saveStyle();LS.s('wlCur',id);
 applyLive();buildStrip();
 if(apply){ST.live=true}
 render()}

/* ═════════ filmstrip ═════════ */
async function buildStrip(){
 ST.strip=[];var tok=++ST.stripTok;
 var it=ST.cur;if(!it||it.kind!=='video'){paintStrip();return}
 var u=urlFor(it),v=document.createElement('video');
 v.muted=true;v.playsInline=true;v.preload='auto';v.src=u;
 var ok=await new Promise(function(r){v.onloadeddata=function(){r(true)};v.onerror=function(){r(false)};setTimeout(function(){r(false)},6000)});
 if(!ok||tok!==ST.stripTok){paintStrip();return}
 var a=ST.trim.in,b=ST.trim.out,n=8;
 for(var i=0;i<n;i++){
  if(tok!==ST.stripTok)return;
  var t=a+(b-a)*(i/(n-1||1));
  try{v.currentTime=Math.min(t,Math.max(0,(v.duration||1)-.05))}catch(e){}
  await new Promise(function(r){v.onseeked=r;setTimeout(r,700)});
  var c=document.createElement('canvas');c.width=132;c.height=78;
  try{var sc=Math.max(132/(v.videoWidth||132),78/(v.videoHeight||78));
   var w=(v.videoWidth||132)*sc,h=(v.videoHeight||78)*sc;
   c.getContext('2d').drawImage(v,(132-w)/2,(78-h)/2,w,h);
   ST.strip.push({t:t,url:c.toDataURL('image/jpeg',.6)})}catch(e){}
  paintStrip()}
 v.removeAttribute('src');try{v.load()}catch(e){}}
function paintStrip(){
 var el=$('#wlStrip');if(!el)return;
 if(!ST.cur||ST.cur.kind!=='video'){el.innerHTML='';return}
 if(!ST.strip.length){el.innerHTML='<div class="wl-strip-wait">Génération des vignettes…</div>';return}
 el.innerHTML=ST.strip.map(function(f){
  return '<figure><img src="'+f.url+'" alt=""><figcaption>'+fmtT(f.t)+'</figcaption></figure>'}).join('')}

/* ═════════ rognage ═════════ */
function setTrim(which,val){
 var it=ST.cur;if(!it||it.kind!=='video')return;
 var d=it.dur||MAX;
 if(which==='in'){ST.trim.in=clamp(val,0,Math.max(0,ST.trim.out-.4));
  if(ST.trim.out-ST.trim.in>MAX)ST.trim.out=ST.trim.in+MAX}
 else{ST.trim.out=clamp(val,ST.trim.in+.4,d);
  if(ST.trim.out-ST.trim.in>MAX)ST.trim.in=Math.max(0,ST.trim.out-MAX)}
 ST.trim.in=Math.round(ST.trim.in*10)/10;ST.trim.out=Math.round(ST.trim.out*10)/10;
 [V,prevV].forEach(function(v){if(v&&v.src){try{v.currentTime=ST.trim.in}catch(e){}}});
 persistCur();buildStrip();snd('trim');paintTrim()}
function paintTrim(){
 var it=ST.cur;if(!it||it.kind!=='video')return;
 var span=ST.trim.out-ST.trim.in;
 var a=$('#wlTIn'),b=$('#wlTOut');
 if(a){a.value=ST.trim.in;$('#wlTInV').textContent=fmtT(ST.trim.in)}
 if(b){b.value=ST.trim.out;$('#wlTOutV').textContent=fmtT(ST.trim.out)}
 var sp=$('#wlSpan');if(sp){sp.textContent=span.toFixed(1)+' s';sp.className='wl-pill '+(span>MAX?'ko':'ok')}
 var fill=$('#wlTBar');if(fill){var d=it.dur||1;
  fill.style.left=(ST.trim.in/d*100)+'%';fill.style.width=(span/d*100)+'%'}}
async function persistCur(){
 if(!ST.cur)return;
 ST.cur.style=Object.assign({},ST.style);ST.cur.trim=Object.assign({},ST.trim);
 await dbPut(ST.cur);
 var i=ST.lib.findIndex(function(x){return x.id===ST.cur.id});if(i>=0)ST.lib[i]=ST.cur}

/* ═════════ composition export ═════════ */
function drawComposite(x,src,W,H,s,sw,sh){
 x.save();x.clearRect(0,0,W,H);
 x.fillStyle='#04120c';x.fillRect(0,0,W,H);
 var fit=s.fit,iw=sw||W,ih=sh||H,sc;
 if(fit==='contain')sc=Math.min(W/iw,H/ih);
 else if(fit==='fill')sc=null;
 else sc=Math.max(W/iw,H/ih);
 var dw=sc?iw*sc*(s.scale/100):W*(s.scale/100),dh=sc?ih*sc*(s.scale/100):H*(s.scale/100);
 var dx=(W-dw)/2+(s.x/1000)*W,dy=(H-dh)/2+(s.y/1000)*H;
 try{x.filter=filterStr(s)}catch(e){}
 try{x.drawImage(src,dx,dy,dw,dh)}catch(e){}
 x.filter='none';
 if(s.tintAmt>0){x.globalAlpha=s.tintAmt/100;
  x.globalCompositeOperation=s.blend==='normal'?'source-over':s.blend;
  x.fillStyle=s.tint;x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';x.globalAlpha=1}
 if(s.scrim>0){var g=x.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'rgba(4,18,12,'+(s.scrim/100*.85).toFixed(3)+')');
  g.addColorStop(.45,'rgba(4,18,12,'+(s.scrim/100*.4).toFixed(3)+')');
  g.addColorStop(1,'rgba(4,18,12,'+(s.scrim/100*.95).toFixed(3)+')');
  x.fillStyle=g;x.fillRect(0,0,W,H)}
 if(s.vignette>0){var v=x.createRadialGradient(W/2,H*.46,Math.min(W,H)*.18,W/2,H/2,Math.max(W,H)*.72);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,'+(s.vignette/100).toFixed(3)+')');
  x.fillStyle=v;x.fillRect(0,0,W,H)}
 x.restore()}
async function exportPhoto(){
 var it=ST.cur;if(!it||it.kind!=='photo'){toast('Sélectionnez une photo');return}
 busy(true,'Rendu de la photo…');
 try{
  var q=LS.g('wlExpW',1920),H=Math.round(q*10/16),W=q;
  var c=document.createElement('canvas');c.width=W;c.height=H;
  var u=urlFor(it),im=new Image();
  await new Promise(function(r,j){im.onload=r;im.onerror=j;im.src=u});
  drawComposite(c.getContext('2d'),im,W,H,ST.style,im.naturalWidth,im.naturalHeight);
  if(ST.style.grain>0){var gi=new Image();gi.src=grain();
   await new Promise(function(r){gi.onload=r;gi.onerror=r});
   var x=c.getContext('2d');x.globalAlpha=ST.style.grain/100*.5;
   var pt=x.createPattern(gi,'repeat');x.fillStyle=pt;x.fillRect(0,0,W,H);x.globalAlpha=1}
  var fmt=LS.g('wlExpFmt','image/jpeg'),qual=LS.g('wlExpQ',90)/100;
  var blob=await new Promise(function(r){c.toBlob(r,fmt,qual)});
  dl(blob,'fond-'+slug(it.name)+'-'+W+'x'+H+(fmt==='image/png'?'.png':fmt==='image/webp'?'.webp':'.jpg'));
  snd('export');toast('🖼️ Photo exportée · '+W+'×'+H);
 }catch(e){toast('❌ Export : '+e.message);snd('err')}
 busy(false)}
function slug(s){return String(s||'fond').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'fond'}
function dl(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href)},8000)}
function recSupport(){
 if(typeof MediaRecorder==='undefined')return null;
 var c=document.createElement('canvas');if(!c.captureStream)return null;
 var types=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'];
 for(var i=0;i<types.length;i++)if(MediaRecorder.isTypeSupported(types[i]))return types[i];
 return null}
async function exportVideo(){
 var it=ST.cur;if(!it||it.kind!=='video'){toast('Sélectionnez une vidéo');return}
 var mime=recSupport();
 if(!mime){toast('Enregistrement vidéo non supporté ici — téléchargez l\'original');snd('err');return}
 var span=ST.trim.out-ST.trim.in;
 if(span>MAX+.05){toast('Rognez à 10 s maximum');snd('err');return}
 busy(true,'Encodage de la boucle…');ST.prog=0;ST.progTxt='Préparation…';paintProg();
 var W=LS.g('wlExpW',1920)>1440?1920:1280,H=Math.round(W*9/16);
 var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
 var v=document.createElement('video');v.src=urlFor(it);v.playsInline=true;
 v.muted=!(LS.g('wlExpAudio',false));v.volume=1;
 var ok=await new Promise(function(r){v.onloadeddata=function(){r(true)};v.onerror=function(){r(false)};setTimeout(function(){r(false)},9000)});
 if(!ok){busy(false);toast('❌ Vidéo illisible');snd('err');return}
 var stream=c.captureStream(30);
 if(LS.g('wlExpAudio',false)){try{var vs=v.captureStream?v.captureStream():null;
  if(vs)vs.getAudioTracks().forEach(function(t){stream.addTrack(t)})}catch(e){}}
 var chunks=[],rec;
 try{rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:LS.g('wlExpBr',6)*1000000})}
 catch(e){busy(false);toast('❌ Encodeur indisponible');snd('err');return}
 ST.rec={rec:rec,cancel:false};
 rec.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data)};
 var done=new Promise(function(r){rec.onstop=r});
 try{v.currentTime=ST.trim.in}catch(e){}
 await new Promise(function(r){v.onseeked=r;setTimeout(r,900)});
 rec.start(200);snd('rec');
 var stop=false;
 await v.play().catch(function(){});
 var t0=performance.now();
 await new Promise(function(resolve){
  function frame(){
   if(ST.rec&&ST.rec.cancel){stop=true;resolve();return}
   if(v.currentTime>=ST.trim.out-.02||v.ended||performance.now()-t0>(span+2)*1000){resolve();return}
   drawComposite(x,v,W,H,ST.style,v.videoWidth,v.videoHeight);
   if(ST.style.grain>0){x.globalAlpha=ST.style.grain/100*.35;x.fillStyle='#808080';
    for(var i=0;i<Math.round(W*H/9000);i++)x.fillRect(Math.random()*W,Math.random()*H,1,1);x.globalAlpha=1}
   var p=clamp((v.currentTime-ST.trim.in)/span,0,1);
   ST.prog=Math.round(p*100);ST.progTxt='Encodage '+Math.round(p*100)+' %';paintProg();
   requestAnimationFrame(frame)}
  requestAnimationFrame(frame)});
 try{v.pause()}catch(e){}
 try{rec.stop()}catch(e){}
 await done;
 ST.rec=null;
 if(stop){busy(false);toast('Encodage annulé');paintProg();return}
 var blob=new Blob(chunks,{type:mime.split(';')[0]});
 if(!blob.size){busy(false);toast('❌ Encodage vide');snd('err');return}
 var ext=mime.indexOf('mp4')>=0?'mp4':'webm';
 var name='fond-'+slug(it.name)+'-'+span.toFixed(1)+'s.'+ext;
 dl(blob,name);
 var nit={id:uid(),name:it.name+' — boucle '+span.toFixed(1)+' s',kind:'video',type:blob.type,dur:span,
  trim:{in:0,out:span},style:Object.assign({},ST.style,{scrim:0,tintAmt:0,vignette:0,grain:0,blur:0,bright:100,contrast:100,sat:100,hue:0}),
  blob:blob,thumb:'',ts:Date.now(),size:blob.size,w:W,h:H,tag:'export boucle'};
 nit.thumb=await thumbOf(blob,'video',.3);
 await dbPut(nit);ST.lib=await dbAll();
 snd('export');toast('🎬 Boucle '+span.toFixed(1)+' s exportée · '+fmtSize(blob.size)+' · ajoutée à la bibliothèque');
 busy(false);ST.prog=100;ST.progTxt='Terminé';paintProg();render()}
function paintProg(){
 var b=$('#wlProg'),t=$('#wlProgTxt');
 if(b)b.style.width=ST.prog+'%';
 if(t)t.textContent=ST.progTxt||'Prêt.'}
function busy(b,t){ST.busy=b;var e=$('#wlBusy');
 if(e){e.style.display=b?'flex':'none';e.innerHTML=b?'<span class="wl-spin"></span>'+esc(t||''):''}
 $$('[data-wl]').forEach(function(x){if(b)x.setAttribute('disabled','');else x.removeAttribute('disabled')});
 if(!b){ST.progTxt='Prêt.';paintProg()}}

/* ═════════ boucle vidéo procédurale ═════════ */
async function genLoop(){
 var mime=recSupport();
 if(!mime){toast('Génération vidéo non supportée sur ce navigateur');snd('err');return}
 busy(true,'Génération d\'une boucle de 8 s…');
 var W=1280,H=720,c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');
 var st=c.captureStream(30),chunks=[],rec;
 try{rec=new MediaRecorder(st,{mimeType:mime,videoBitsPerSecond:5000000})}
 catch(e){busy(false);toast('❌ Encodeur indisponible');return}
 ST.rec={rec:rec,cancel:false};
 rec.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data)};
 var done=new Promise(function(r){rec.onstop=r});
 rec.start(200);snd('rec');
 var t0=performance.now(),DUR=8000,stop=false;
 await new Promise(function(resolve){
  function frame(){
   if(ST.rec&&ST.rec.cancel){stop=true;resolve();return}
   var el=performance.now()-t0,p=el/DUR;
   if(p>=1){resolve();return}
   var tt=el/1000;
   var g=x.createLinearGradient(0,0,W,H);
   g.addColorStop(0,'#03110a');g.addColorStop(.5,'#0a2c1b');g.addColorStop(1,'#061a26');
   x.fillStyle=g;x.fillRect(0,0,W,H);
   var a=x.createRadialGradient(W*(.24+Math.sin(tt*.5)*.05),H*.18,20,W*.24,H*.18,W*.6);
   a.addColorStop(0,'rgba(37,194,87,'+(.34+Math.sin(tt*1.2)*.1).toFixed(3)+')');a.addColorStop(1,'rgba(37,194,87,0)');
   x.fillStyle=a;x.fillRect(0,0,W,H);
   var b=x.createRadialGradient(W*.82,H*.22,20,W*.82,H*.22,W*.5);
   b.addColorStop(0,'rgba(56,189,248,.26)');b.addColorStop(1,'rgba(56,189,248,0)');x.fillStyle=b;x.fillRect(0,0,W,H);
   x.fillStyle='#fff';for(var i=0;i<90;i++){var sx=(i*97%W),sy=(i*53)%(H*.5);
    x.globalAlpha=.25+Math.abs(Math.sin(tt*2+i))*.5;x.fillRect(sx,sy,1.6,1.6)}
   x.globalAlpha=1;
   x.fillStyle='#061710';x.beginPath();x.moveTo(0,H*.72);
   for(var k=0;k<=12;k++)x.lineTo(W*k/12,H*.72-Math.sin(k*.8+tt*.4)*H*.045);
   x.lineTo(W,H);x.lineTo(0,H);x.closePath();x.fill();
   x.fillStyle='#04100a';x.fillRect(0,H*.82,W,H*.18);
   x.save();x.strokeStyle='#a3e635';x.lineWidth=H*.014;x.setLineDash([W*.06,W*.05]);
   x.lineDashOffset=-tt*W*.35;x.beginPath();x.moveTo(0,H*.9);x.lineTo(W,H*.9);x.stroke();x.restore();
   x.strokeStyle='#22c55e';x.lineWidth=H*.006;x.beginPath();x.moveTo(0,H*.825);x.lineTo(W,H*.825);x.stroke();
   var cx=W*.6,cy=H*.8+Math.sin(tt*3)*2.4;
   x.save();x.translate(cx,cy);x.scale(2.1,2.1);
   var bg2=x.createLinearGradient(0,-70,0,20);bg2.addColorStop(0,'#8dffb4');bg2.addColorStop(.45,'#25c257');bg2.addColorStop(1,'#053a1a');
   x.fillStyle=bg2;x.beginPath();x.moveTo(-160,10);x.lineTo(-152,-16);x.quadraticCurveTo(-96,-30,-52,-38);
   x.quadraticCurveTo(-20,-84,30,-82);x.quadraticCurveTo(78,-78,104,-40);x.quadraticCurveTo(146,-30,168,-14);
   x.lineTo(172,10);x.closePath();x.fill();
   x.fillStyle='#04140c';x.beginPath();x.moveTo(-46,-38);x.quadraticCurveTo(-16,-72,28,-70);
   x.quadraticCurveTo(66,-66,88,-40);x.closePath();x.fill();
   x.fillStyle='#f4ffe0';x.beginPath();x.moveTo(140,-22);x.lineTo(170,-14);x.lineTo(166,-2);x.lineTo(138,-8);x.closePath();x.fill();
   [-92,104].forEach(function(wx){x.fillStyle='#05070a';x.beginPath();x.arc(wx,12,30,0,7);x.fill();
    x.save();x.translate(wx,12);x.rotate(tt*9);x.fillStyle='#d8b45a';x.beginPath();x.arc(0,0,15,0,7);x.fill();
    x.strokeStyle='#6f5418';x.lineWidth=3;for(var sp=0;sp<5;sp++){var an=sp*Math.PI*2/5;
     x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(an)*14,Math.sin(an)*14);x.stroke()}x.restore()});
   x.restore();
   var beam=x.createLinearGradient(cx+W*.06,cy-H*.03,W,H*.7);
   beam.addColorStop(0,'rgba(244,255,224,'+(.42+Math.sin(tt*4)*.1).toFixed(3)+')');beam.addColorStop(1,'rgba(244,255,224,0)');
   x.fillStyle=beam;x.beginPath();x.moveTo(cx+W*.06,cy-H*.03);x.lineTo(W,cy-H*.18);x.lineTo(W,cy+H*.05);x.closePath();x.fill();
   for(var d=0;d<26;d++){var px=(d*137+tt*90)%W,py=H*.3+((d*71)%(H*.55))+Math.sin(tt+d)*8;
    x.fillStyle='rgba(163,230,53,'+(.12+Math.abs(Math.sin(tt+d))*.3).toFixed(3)+')';
    x.beginPath();x.arc(px,py,1.6+Math.abs(Math.sin(d))*2,0,7);x.fill()}
   vign(x,W,H,.55);
   ST.prog=Math.round(p*100);ST.progTxt='Génération '+Math.round(p*100)+' %';paintProg();
   requestAnimationFrame(frame)}
  requestAnimationFrame(frame)});
 try{rec.stop()}catch(e){}
 await done;ST.rec=null;
 if(stop){busy(false);toast('Génération annulée');return}
 var blob=new Blob(chunks,{type:mime.split(';')[0]});
 var it={id:uid(),name:'Boucle rallye — 8 s',kind:'video',type:blob.type,dur:8,trim:{in:0,out:8},
  style:Object.assign({},DEF),blob:blob,thumb:'',ts:Date.now(),size:blob.size,w:W,h:H,tag:'boucle générée rallye'};
 it.thumb=await thumbOf(blob,'video',.5);
 await dbPut(it);ST.lib=await dbAll();
 await selectItem(it.id,true);
 snd('export');toast('🎬 Boucle de 8 s créée · '+fmtSize(blob.size));
 busy(false);render()}

/* ═════════ bibliothèque ═════════ */
function visible(){
 var q=ST.q.toLowerCase().trim();
 var out=ST.lib.filter(function(it){
  if(ST.filter!=='all'&&it.kind!==ST.filter)return false;
  if(!q)return true;
  return (it.name+' '+(it.tag||'')+' '+it.kind).toLowerCase().indexOf(q)>=0});
 if(ST.sort==='name')out.sort(function(a,b){return a.name.localeCompare(b.name)});
 else if(ST.sort==='dur')out.sort(function(a,b){return (b.dur||0)-(a.dur||0)});
 else if(ST.sort==='size')out.sort(function(a,b){return (b.size||0)-(a.size||0)});
 else if(ST.sort==='manual'){var o=ST.order;
  out.sort(function(a,b){var ia=o.indexOf(a.id),ib=o.indexOf(b.id);
   return (ia<0?9999:ia)-(ib<0?9999:ib)})}
 else out.sort(function(a,b){return b.ts-a.ts});
 return out}
async function renameItem(id,name){
 var it=ST.lib.find(function(x){return x.id===id});if(!it)return;
 it.name=(name||'').trim().slice(0,60)||it.name;it.ts=it.ts;await dbPut(it);
 if(ST.cur&&ST.cur.id===id)ST.cur=it;
 snd('tick');render()}
async function delItems(ids){
 var removed=ST.lib.filter(function(x){return ids.indexOf(x.id)>=0});
 if(!removed.length)return;
 for(const id of ids){await dbDel(id);dropUrl(id)}
 ST.lib=await dbAll();ST.sel=[];
 if(ST.cur&&ids.indexOf(ST.cur.id)>=0){ST.cur=null;LS.d('wlCur');applyLive()}
 ST.undo=removed;snd('del');
 toast('🗑️ '+removed.length+' média(s) supprimé(s)',{label:'Annuler',fn:async function(){
  for(const it of removed)await dbPut(it);
  ST.lib=await dbAll();ST.undo=null;snd('apply');toast('↩️ Restauration effectuée');render()}});
 render()}
async function duplicateItem(id){
 var it=ST.lib.find(function(x){return x.id===id});if(!it)return;
 var cp=Object.assign({},it,{id:uid(),name:it.name+' (copie)',ts:Date.now(),preset:false});
 await dbPut(cp);ST.lib=await dbAll();await selectItem(cp.id,false);snd('apply');toast('📄 Copie créée');render()}

/* ═════════ diffusion ═════════ */
function repo(){var h=location.hostname,m=h.match(/^([^.]+)\.github\.io$/);
 var seg=location.pathname.split('/').filter(Boolean);
 return Object.assign({owner:m?m[1]:'expertkevin06-cell',repo:(m&&seg.length)?seg[0]:'kev-fusion',branch:'main'},LS.g('ghCfg',{}))}
function token(){return (LS.g('ghToken','')||'').trim()}
function b64(u8){var o='',CH=0x8000;for(var i=0;i<u8.length;i+=CH)o+=String.fromCharCode.apply(null,u8.subarray(i,i+CH));return btoa(o)}
async function ghPut(path,data,isText){
 var c=repo(),tk=token();if(!tk)throw new Error('Jeton GitHub absent (Admin → 🔑 Jeton GitHub)');
 var api='https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/'+path,sha=null;
 try{var g=await fetch(api+'?ref='+encodeURIComponent(c.branch),{headers:{Authorization:'Bearer '+tk,Accept:'application/vnd.github+json'}});
  if(g.ok)sha=(await g.json()).sha}catch(e){}
 var body={message:'KEV FUSION · fond d\'écran '+path,content:isText?b64(new TextEncoder().encode(data)):b64(data),branch:c.branch};
 if(sha)body.sha=sha;
 var r=await fetch(api,{method:'PUT',headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify(body)});
 if(!r.ok)throw new Error(path+' → HTTP '+r.status);
 return r.json()}
async function publish(){
 var it=ST.cur;if(!it){toast('Sélectionnez un média');return}
 if(it.kind==='video'&&ST.trim.out-ST.trim.in>MAX+.05){toast('Rognez la vidéo à 10 s');snd('err');return}
 if(it.size>40*1048576){toast('Fichier > 40 Mo : utilisez « Télécharger » puis commit manuel');snd('err');return}
 if(!token()){toast('🔑 Renseignez le jeton GitHub (Admin)');snd('err');return}
 if(!confirm('📡 DIFFUSER AUX TIERS\n\n'+it.name+'\n'+(it.kind==='video'?('Vidéo '+(ST.trim.out-ST.trim.in).toFixed(1)+' s'):('Photo'))+' · '+fmtSize(it.size)+
  '\n\nLe fichier et ses réglages seront publiés sur le dépôt. Les tiers le recevront automatiquement.'))return;
 busy(true,'Diffusion…');
 try{
  var ext=it.kind==='video'?(it.type.indexOf('mp4')>=0?'mp4':'webm'):(it.type==='image/png'?'png':it.type==='image/webp'?'webp':'jpg');
  var file='wall.'+ext;
  var u8=new Uint8Array(await it.blob.arrayBuffer());
  await ghPut(file,u8,false);
  var meta={version:1,ts:Date.now(),kind:it.kind,file:file,type:it.type,name:it.name,
   dur:it.dur,trim:ST.trim,style:ST.style,by:(typeof S!=='undefined'&&S.prenom)||'admin'};
  await ghPut('maj-wall.json',JSON.stringify(meta,null,2),true);
  ST.pub=meta;LS.s('wlPub',meta);
  snd('export');toast('📡 Fond diffusé aux tiers');
 }catch(e){toast('❌ '+e.message);snd('err')}
 busy(false);render()}
async function tierPoll(){
 if(isAdmin())return;
 try{
  var r=await fetch('maj-wall.json?t='+Date.now(),{cache:'no-store'});
  if(!r.ok)return;var m=await r.json();
  if(!m||!m.file)return;
  if(ST.tier&&ST.tier.ts===m.ts)return;
  var fr=await fetch(m.file+'?t='+m.ts,{cache:'no-store'});
  if(!fr.ok)return;var blob=await fr.blob();
  var it={id:'tier-'+m.ts,name:m.name||'Fond diffusé',kind:m.kind,type:m.type,dur:m.dur||0,
   trim:m.trim||{in:0,out:0},style:Object.assign({},DEF,m.style||{}),blob:blob,thumb:'',ts:m.ts,size:blob.size,tier:true};
  ST.cur=it;ST.style=Object.assign({},DEF,m.style||{});ST.trim=it.trim;
  ST.tier=m;LS.s('wlTier',m);
  applyLive();
 }catch(e){}}

/* ═════════ UI ═════════ */
function render(){
 var v=$('#view');if(!v)return;
 if(!isAdmin()){
  v.innerHTML='<div class="wl-lock"><div class="wl-lock-in">'+
   '<span class="wl-lock-ic">🔒</span><h1>Fond d’écran — espace administrateur</h1>'+
   '<p>L’import d’une photo ou d’une vidéo courte (10 s maximum), son rognage, ses réglages et sa diffusion aux tiers sont réservés à l’administrateur.</p>'+
   '<div class="row" style="justify-content:center;margin-top:16px">'+
   '<button class="pri" data-wl="admin">🛡️ Ouvrir la connexion admin</button>'+
   '<button data-wl="home">🏠 Accueil</button></div>'+
   '<p class="wl-lock-note">Les tiers reçoivent automatiquement le fond diffusé par l’administrateur.</p></div></div>';
  bind();return}
 var it=ST.cur,vis=visible(),span=it&&it.kind==='video'?(ST.trim.out-ST.trim.in):0;
 var vids=ST.lib.filter(function(x){return x.kind==='video'}).length;
 var pics=ST.lib.filter(function(x){return x.kind==='photo'}).length;
 var weight=ST.lib.reduce(function(a,b){return a+(b.size||0)},0);
 v.innerHTML=
 '<div class="wl-hero"><div class="wl-hero-bg"></div><div class="wl-hero-in">'+
  '<div class="wl-hero-l"><span class="wl-kick">ADMIN · FOND D’ÉCRAN PHOTO &amp; VIDÉO</span>'+
   '<h1>Votre image, votre boucle de 10 secondes</h1>'+
   '<p>Importez une <b>photo</b> ou une <b>vidéo courte</b> de votre choix, rognez-la au dixième de seconde, '+
   'réglez le rendu en direct sur l’app entière, puis <b>téléchargez</b> le fichier ou <b>diffusez-le aux tiers</b>.</p></div>'+
  '<div class="wl-hero-r">'+
   '<div class="wl-stat"><b>'+ST.lib.length+'</b><span>médias</span></div>'+
   '<div class="wl-stat pic"><b>'+pics+'</b><span>photos</span></div>'+
   '<div class="wl-stat vid"><b>'+vids+'</b><span>vidéos</span></div>'+
   '<div class="wl-stat wt"><b>'+fmtSize(weight)+'</b><span>bibliothèque</span></div>'+
  '</div></div>'+
  '<button class="wl-mute" data-wl="sound" id="wlMute" title="Couper tous les sons">'+(AU.on?'🔊 Son actif':'🔇 Son coupé')+'</button>'+
 '</div>'+
 '<div class="wl-strip-top">'+
  '<span class="wl-pill '+(it?'ok':'ko')+'">'+(it?(it.kind==='video'?'🎬 '+esc(it.name):'🖼️ '+esc(it.name)):'aucun média sélectionné')+'</span>'+
  (it&&it.kind==='video'?'<span class="wl-pill '+(span>MAX?'ko':'ok')+'">boucle '+span.toFixed(1)+' s / 10 s</span>':'')+
  (it?'<span class="wl-pill">'+(it.w||'?')+'×'+(it.h||'?')+'</span><span class="wl-pill">'+fmtSize(it.size)+'</span>':'')+
  (ST.pub?'<span class="wl-pill info">📡 diffusé '+new Date(ST.pub.ts).toLocaleDateString('fr-FR')+'</span>':'')+
  '<label class="wl-tg '++(ST.live?'on':'')+'" id="wlLiveTg" style="margin-left:auto"><input type="checkbox" data-wlt="live"'+(ST.live?' checked':'')+'> Aperçu global en direct</label>'+
 '</div>'+
 '<div id="wlBusy" class="wl-busy" style="display:none"></div>'+
 '<div class="wl-layout">'+
  '<section class="wl-main">'+
   '<div class="wl-card">'+
    '<div class="wl-drop" id="wlDrop"><input type="file" id="wlFile" accept="image/*,video/*" multiple hidden>'+
     '<div class="wl-drop-in"><span class="wl-drop-ic">📥</span>'+
      '<div><b>Déposez une photo ou une vidéo</b><span>JPG · PNG · WebP · GIF · MP4 · WebM · MOV — vidéo limitée à 10 s (rognage automatique au-delà)</span></div>'+
      '<button class="pri" data-wl="pick">Choisir un fichier</button></div></div>'+
    '<div class="wl-frame-wrap">'+
     '<div class="wl-frame" id="wlFrame">'+
      '<div class="wl-media"><img id="wlPImg" alt=""><video id="wlPVid" playsinline preload="auto"></video></div>'+
      '<div class="wl-tint"></div><div class="wl-scrim"></div><div class="wl-vig"></div><div class="wl-grain"></div>'+
      '<div class="wl-frame-ui"><span>KEV FUSION</span><b>Aperçu du rendu</b></div>'+
     '</div>'+
     '<div class="wl-frame-side">'+
      '<div class="wl-mini"><b>Lisibilité</b><div class="wl-read" id="wlRead"></div></div>'+
      '<div class="wl-mini"><b>Raccourcis</b><p>Espace lecture/pause · ←/→ ±0,1 s · I/O bornes · A appliquer · R réinitialiser</p></div>'+
     '</div>'+
    '</div>'+
    (it&&it.kind==='video'?
     '<div class="wl-trimbox">'+
      '<div class="wl-trim-h"><b>✂️ Rognage — 10 s maximum</b>'+
       '<span class="wl-pill" id="wlSpan">'+span.toFixed(1)+' s</span>'+
       '<span class="wl-pill">source '+fmtT(it.dur)+'</span>'+
       (it.dur>MAX?'<span class="wl-pill warn">source longue : choisissez la fenêtre</span>':'')+'</div>'+
      '<div class="wl-tbar"><i id="wlTBar"></i></div>'+
      '<div class="wl-trow"><label>Début <b id="wlTInV">'+fmtT(ST.trim.in)+'</b></label>'+
       '<input type="range" id="wlTIn" min="0" max="'+(it.dur||MAX)+'" step="0.1" value="'+ST.trim.in+'"></div>'+
      '<div class="wl-trow"><label>Fin <b id="wlTOutV">'+fmtT(ST.trim.out)+'</b></label>'+
       '<input type="range" id="wlTOut" min="0" max="'+(it.dur||MAX)+'" step="0.1" value="'+ST.trim.out+'"></div>'+
      '<div class="row"><button data-wl="t10">✂️ Fenêtre 10 s</button>'+
       '<button data-wl="tstart">⏮ Au début</button><button data-wl="tend">⏭ À la fin</button>'+
       '<button data-wl="play" id="wlPlay">⏸ Pause</button></div>'+
      '<div class="wl-strip" id="wlStrip"></div>'+
     '</div>':'')+
   '</div>'+
   '<div class="wl-card">'+
    '<div class="wl-lib-h"><b>🗂️ Bibliothèque</b>'+
     '<input id="wlQ" placeholder="Rechercher un nom, un tag…" value="'+esc(ST.q)+'">'+
     '<select id="wlFilter"><option value="all">Tout</option><option value="photo">Photos</option><option value="video">Vidéos</option></select>'+
     '<select id="wlSort"><option value="recent">Récents</option><option value="name">Nom</option>'+
      '<option value="dur">Durée</option><option value="size">Poids</option><option value="manual">Ordre manuel</option></select>'+
     '<button data-wl="gen">🎬 Créer une boucle 8 s</button></div>'+
    (ST.sel.length?'<div class="wl-bulk"><b>'+ST.sel.length+' sélectionné(s)</b>'+
     '<button class="danger" data-wl="delsel">🗑️ Supprimer la sélection</button>'+
     '<button data-wl="selnone">Tout désélectionner</button></div>':'')+
    '<div class="wl-grid" id="wlGrid">'+(vis.length?vis.map(card).join(''):
     '<div class="wl-empty">Aucun média pour ce filtre. Importez un fichier ou créez une boucle.</div>')+'</div>'+
   '</div>'+
   '<div class="wl-card">'+
    '<b>📤 Télécharger &amp; diffuser</b>'+
    '<div class="wl-exp">'+
     '<div><label>Largeur de sortie</label><select id="wlExpW">'+
      [1280,1920,2560,3840].map(function(w){return '<option value="'+w+'"'+(LS.g('wlExpW',1920)===w?' selected':'')+'>'+w+' px</option>'}).join('')+
      '</select></div>'+
     '<div><label>Format photo</label><select id="wlExpFmt">'+
      [['image/jpeg','JPEG'],['image/webp','WebP'],['image/png','PNG']].map(function(f){
       return '<option value="'+f[0]+'"'+(LS.g('wlExpFmt','image/jpeg')===f[0]?' selected':'')+'>'+f[1]+'</option>'}).join('')+'</select></div>'+
     '<div><label>Qualité <b id="wlExpQV">'+LS.g('wlExpQ',90)+' %</b></label>'+
      '<input type="range" id="wlExpQ" min="50" max="100" value="'+LS.g('wlExpQ',90)+'"></div>'+
     '<div><label>Débit vidéo <b id="wlExpBrV">'+LS.g('wlExpBr',6)+' Mb/s</b></label>'+
      '<input type="range" id="wlExpBr" min="2" max="16" value="'+LS.g('wlExpBr',6)+'"></div>'+
    '</div>'+
    '<label class="wl-tg'+(LS.g('wlExpAudio',false)?' on':'')+'" id="wlExpAudioTg" style="margin:6px 0 12px">'+
     '<input type="checkbox" id="wlExpAudio"'+(LS.g('wlExpAudio',false)?' checked':'')+'> Inclure la piste audio à l’export vidéo</label>'+
    '<div class="row">'+
     '<button class="pri" data-wl="exphoto">🖼️ Télécharger la photo rendue</button>'+
     '<button class="pri" data-wl="exvideo">🎬 Télécharger la boucle ≤ 10 s</button>'+
     '<button data-wl="exorig">📦 Télécharger l’original</button>'+
     '<button class="wl-b" data-wl="publish">📡 Diffuser aux tiers</button>'+
     '<button data-wl="ghupload">↗ Upload GitHub</button>'+
     (ST.rec?'<button class="danger" data-wl="cancel">⏹ Annuler l’encodage</button>':'')+
    '</div>'+
    '<div class="wl-prog"><div class="wl-bar"><i id="wlProg" style="width:'+ST.prog+'%"></i></div><span id="wlProgTxt">'+esc(ST.progTxt||'Prêt.')+'</span></div>'+
    '<p class="wl-note">L’export applique le cadrage, les filtres, le voile et le grain : le fichier téléchargé est exactement le rendu affiché. '+
    'La boucle vidéo est encodée localement (WebM/MP4 selon le navigateur) et respecte strictement la fenêtre de 10 s.</p>'+
   '</div>'+
  '</section>'+
  '<aside class="wl-dock">'+
   '<div class="wl-dock-h"><b>🎛️ Réglages du fond</b>'+
    '<button class="wl-mini-btn" data-wl="apply" title="Appliquer à l’app">💾</button></div>'+
   '<div class="wl-dock-b">'+
    '<div class="wl-c"><label>Cadrage</label><select data-wls="fit">'+
     '<option value="cover">Remplir (cover)</option><option value="contain">Entier (contain)</option>'+
     '<option value="fill">Étirer (fill)</option></select></div>'+
    rg('scale','Échelle',50,220,'%')+rg('x','Position X',-40,40,'')+rg('y','Position Y',-40,40,'')+
    '<div class="wl-sep"></div>'+
    rg('blur','Flou',0,60,'')+rg('bright','Luminosité',30,180,'%')+rg('contrast','Contraste',40,200,'%')+
    rg('sat','Saturation',0,220,'%')+rg('hue','Teinte',-180,180,'°')+
    '<div class="wl-sep"></div>'+
    rg('opacity','Opacité du fond',10,100,'%')+rg('scrim','Voile de lisibilité',0,95,'%')+
    rg('tintAmt','Coloration',0,80,'%')+
    '<div class="wl-c"><label>Couleur de coloration</label><input type="color" data-wls="tint" value="'+ST.style.tint+'"></div>'+
    '<div class="wl-c"><label>Fusion</label><select data-wls="blend">'+
     ['normal','multiply','screen','overlay','soft-light','color'].map(function(b){
      return '<option value="'+b+'"'+(ST.style.blend===b?' selected':'')+'>'+b+'</option>'}).join('')+'</select></div>'+
    rg('vignette','Vignettage',0,100,'%')+rg('grain','Grain',0,40,'')+
    '<div class="wl-sep"></div>'+
    rg('motionAmt','Amplitude du mouvement',0,20,'')+rg('speed','Cycle du mouvement',6,80,'s')+
    '<div class="wl-tgs">'+tg('motion','Mouvement photo')+tg('loop','Boucle vidéo')+
     tg('muted','Vidéo muette')+tg('eco','Mode éco')+tg('logo','Logo de marque')+'</div>'+
    rg('volume','Volume vidéo',0,100,'%')+rg('rate','Vitesse de lecture',25,200,'%')+
    '<div class="wl-btns">'+
     '<button data-wl="reset">↺ Réinitialiser</button><button data-wl="rand">🎲 Aléatoire</button>'+
     '<button class="p" data-wl="apply">💾 Appliquer à l’app</button>'+
     '<button data-wl="clear">🚫 Retirer le fond</button>'+
     '<button data-wl="exphoto">🖼️ Export photo</button><button data-wl="exvideo">🎬 Export boucle</button>'+
    '</div>'+
    '<p class="wl-note">Chaque réglage s’applique <b>immédiatement</b> à l’aperçu et au fond réel de l’application.</p>'+
   '</div>'+
  '</aside>'+
 '</div>'+
 (ST.drawer?drawerHtml():'');
 prevI=$('#wlPImg');prevV=$('#wlPVid');
 if(prevV){prevV.addEventListener('timeupdate',function(){loopGuard(prevV)})}
 var f=$('#wlFilter');if(f)f.value=ST.filter;
 var s2=$('#wlSort');if(s2)s2.value=ST.sort;
 $$('[data-wls]').forEach(function(e){var k=e.dataset.wls;if(e.type!=='color')e.value=ST.style[k]});
 ['scale','x','y','blur','bright','contrast','sat','hue','opacity','scrim','tintAmt','vignette','grain','motionAmt','speed','volume','rate']
  .forEach(function(k){var e=$('[data-wls="'+k+'"]');if(e)e.value=ST.style[k];
   var o=$('#wlo_'+k);if(o)o.textContent=ST.style[k]+unit(k)});
 ['motion','loop','muted','eco','logo'].forEach(function(k){
  var w=$('#wlt_'+k);if(w){w.querySelector('input').checked=!!ST.style[k];w.classList.toggle('on',!!ST.style[k])}});
 syncPreview();paintTrim();paintRead();bind();dnd()}
function unit(k){return k==='hue'?'°':k==='speed'?'s':(['blur','grain','x','y','motionAmt'].indexOf(k)>=0?'':'%')}
function rg(k,l,a,b,u){return '<div class="wl-c"><label>'+l+' <b id="wlo_'+k+'">'+ST.style[k]+(u||'')+'</b></label>'+
 '<input type="range" data-wls="'+k+'" min="'+a+'" max="'+b+'" value="'+ST.style[k]+'"></div>'}
function tg(k,l){return '<label class="wl-tg" id="wlt_'+k+'"><input type="checkbox" data-wlt="'+k+'"> '+l+'</label>'}
function card(it){
 var on=ST.cur&&ST.cur.id===it.id,sel=ST.sel.indexOf(it.id)>=0;
 return '<article class="wl-item'+(on?' on':'')+(sel?' sel':'')+'" draggable="true" data-id="'+it.id+'">'+
  '<div class="wl-thumb">'+(it.thumb?'<img src="'+it.thumb+'" alt="'+esc(it.name)+'">':'<div class="wl-thumb-ph">'+(it.kind==='video'?'🎬':'🖼️')+'</div>')+
   '<label class="wl-check"><input type="checkbox" data-wlsel="'+it.id+'"'+(sel?' checked':'')+'></label>'+
   '<span class="wl-kind '+(it.kind==='video'?'v':'p')+'">'+(it.kind==='video'?('🎬 '+(it.dur?it.dur.toFixed(1)+' s':'vidéo')):'🖼️ photo')+'</span>'+
   (it.preset?'<span class="wl-badge">preset</span>':'')+(it.tier?'<span class="wl-badge tier">diffusé</span>':'')+
   '<button class="wl-open" data-wlopen="'+it.id+'" title="Détails">⋯</button>'+
  '</div>'+
  '<div class="wl-item-b"><b>'+esc(it.name)+'</b>'+
   '<span>'+fmtSize(it.size)+' · '+(it.w||'?')+'×'+(it.h||'?')+' · '+new Date(it.ts).toLocaleDateString('fr-FR')+'</span>'+
   '<div class="wl-item-a"><button class="pri" data-wluse="'+it.id+'">'+(on?'✓ Actif':'Appliquer')+'</button>'+
    '<button data-wlren="'+it.id+'" title="Renommer">✏️</button>'+
    '<button data-wldup="'+it.id+'" title="Dupliquer">📄</button>'+
    '<button class="danger" data-wldel="'+it.id+'" title="Supprimer">🗑️</button></div>'+
  '</div></article>'}
function drawerHtml(){
 var it=ST.lib.find(function(x){return x.id===ST.drawer});if(!it)return '';
 var sp=it.kind==='video'?((it.trim&&it.trim.out-it.trim.in)||0):0;
 return '<div class="wl-drawer" id="wlDrawer"><div class="wl-drawer-in">'+
  '<div class="wl-drawer-h"><b>Détails du média</b><button data-wl="dclose">✕</button></div>'+
  (it.thumb?'<img class="wl-drawer-img" src="'+it.thumb+'" alt="">':'')+
  '<table class="wl-tbl"><tr><td>Nom</td><td><input id="wlDRen" value="'+esc(it.name)+'"></td></tr>'+
  '<tr><td>Type</td><td>'+esc(it.type)+'</td></tr>'+
  '<tr><td>Dimensions</td><td>'+(it.w||'?')+' × '+(it.h||'?')+'</td></tr>'+
  '<tr><td>Poids</td><td>'+fmtSize(it.size)+'</td></tr>'+
  (it.kind==='video'?'<tr><td>Durée source</td><td>'+fmtT(it.dur)+'</td></tr>'+
   '<tr><td>Fenêtre</td><td>'+fmtT((it.trim||{}).in||0)+' → '+fmtT((it.trim||{}).out||0)+' ('+sp.toFixed(1)+' s)</td></tr>':'')+
  '<tr><td>Ajouté</td><td>'+new Date(it.ts).toLocaleString('fr-FR')+'</td></tr>'+
  '<tr><td>Cadrage</td><td>'+esc((it.style||{}).fit||'cover')+' · '+(it.style||{}).scale+' %</td></tr>'+
  '<tr><td>Voile / grain</td><td>'+(it.style||{}).scrim+' % / '+(it.style||{}).grain+'</td></tr></table>'+
  '<div class="wl-drawer-a"><button class="pri" data-wluse="'+it.id+'">Appliquer</button>'+
   '<button data-wldup="'+it.id+'">Dupliquer</button>'+
   '<button data-wl="dlsel">Télécharger l’original</button>'+
   '<button class="danger" data-wldel="'+it.id+'">Supprimer</button></div>'+
 '</div></div>'}
function paintRead(){
 var e=$('#wlRead');if(!e)return;
 var s=ST.style;
 var score=Math.round(clamp(s.scrim*.9+s.vignette*.25+(100-s.opacity)*.4+(s.blur*.6),0,100));
 var lvl=score>=52?'ok':score>=34?'warn':'ko';
 var txt=score>=52?'Texte bien lisible':score>=34?'Lisibilité limite':'Texte difficile à lire';
 e.innerHTML='<div class="wl-read-bar"><i style="width:'+clamp(score,4,100)+'%" class="'+lvl+'"></i></div>'+
  '<span class="'+lvl+'">'+txt+' · '+score+'/100</span>'+
  (lvl!=='ok'?'<button data-wl="fixread">Améliorer</button>':'')}
function dnd(){
 var z=$('#wlDrop');if(!z||z._d)return;z._d=1;
 ['dragenter','dragover'].forEach(function(ev){z.addEventListener(ev,function(e){e.preventDefault();z.classList.add('over')})});
 ['dragleave','drop'].forEach(function(ev){z.addEventListener(ev,function(e){e.preventDefault();z.classList.remove('over')})});
 z.addEventListener('drop',function(e){if(e.dataTransfer&&e.dataTransfer.files.length)importFiles(e.dataTransfer.files)});
 var g=$('#wlGrid');
 if(g&&!g._d){g._d=1;var dragId=null;
  g.addEventListener('dragstart',function(e){var c=e.target.closest('.wl-item');if(!c)return;
   dragId=c.dataset.id;c.classList.add('drag');try{e.dataTransfer.setData('text/plain',dragId)}catch(x){}});
  g.addEventListener('dragend',function(e){$$('.wl-item').forEach(function(c){c.classList.remove('drag','over')})});
  g.addEventListener('dragover',function(e){var c=e.target.closest('.wl-item');if(!c||!dragId)return;
   e.preventDefault();$$('.wl-item').forEach(function(x){x.classList.remove('over')});c.classList.add('over')});
  g.addEventListener('drop',function(e){var c=e.target.closest('.wl-item');if(!c||!dragId)return;e.preventDefault();
   var ids=visible().map(function(x){return x.id});
   var from=ids.indexOf(dragId),to=ids.indexOf(c.dataset.id);
   if(from<0||to<0||from===to)return;
   ids.splice(to,0,ids.splice(from,1)[0]);
   ST.order=ids;LS.s('wlOrder',ids);ST.sort='manual';LS.s('wlSort','manual');snd('tick');render()})}}
function bind(){
 var v=$('#view');if(!v||v._b)return;v._b=1;
 v.addEventListener('input',function(e){
  var k=e.target.dataset.wls;
  if(k){ST.style[k]=e.target.type==='range'?+e.target.value:e.target.value;
   var o=$('#wlo_'+k);if(o)o.textContent=ST.style[k]+unit(k);
   saveStyle();persistCur();if(ST.live)applyLive();else syncPreview();paintRead();return}
  var t=e.target.dataset.wlt;
  if(t){ST.style[t]=e.target.checked;var w=$('#wlt_'+t);if(w)w.classList.toggle('on',ST.style[t]);
   saveStyle();persistCur();if(ST.live)applyLive();else syncPreview();return}
  if(e.target.id==='wlTIn'){setTrim('in',+e.target.value);return}
  if(e.target.id==='wlTOut'){setTrim('out',+e.target.value);return}
  if(e.target.id==='wlQ'){ST.q=e.target.value;paintGrid();return}
  if(e.target.id==='wlExpQ'){LS.s('wlExpQ',+e.target.value);$('#wlExpQV').textContent=e.target.value+' %';return}
  if(e.target.id==='wlExpBr'){LS.s('wlExpBr',+e.target.value);$('#wlExpBrV').textContent=e.target.value+' Mb/s';return}
  if(e.target.id==='wlDRen'){/* validation au change */return}});
 v.addEventListener('change',function(e){
  var k=e.target.dataset.wls;
  if(k&&e.target.tagName==='SELECT'){ST.style[k]=e.target.value;saveStyle();persistCur();
   if(ST.live)applyLive();else syncPreview();paintRead();return}
  if(e.target.id==='wlFilter'){ST.filter=e.target.value;paintGrid();return}
  if(e.target.id==='wlSort'){ST.sort=e.target.value;LS.s('wlSort',ST.sort);paintGrid();return}
  if(e.target.id==='wlExpW'){LS.s('wlExpW',+e.target.value);return}
  if(e.target.id==='wlExpFmt'){LS.s('wlExpFmt',e.target.value);return}
  if(e.target.id==='wlExpAudio'){LS.s('wlExpAudio',e.target.checked);
   var w=$('#wlExpAudioTg');if(w)w.classList.toggle('on',e.target.checked);return}
  if(e.target.id==='wlDRen'){renameItem(ST.drawer,e.target.value);return}
  if(e.target.id==='wlFile'){importFiles(e.target.files);e.target.value='';return}
  var sel=e.target.dataset.wlsel;
  if(sel){if(e.target.checked){if(ST.sel.indexOf(sel)<0)ST.sel.push(sel)}
   else ST.sel=ST.sel.filter(function(x){return x!==sel});render();return}
  if(e.target.dataset.wlt==='live'){ST.live=e.target.checked;
   var lw=$('#wlLiveTg');if(lw)lw.classList.toggle('on',ST.live);
   if(ST.live)applyLive();return}});
 v.addEventListener('click',async function(e){
  var use=e.target.closest('[data-wluse]');if(use){await selectItem(use.dataset.wluse,true);snd('apply');toast('💾 Fond appliqué');return}
  var ren=e.target.closest('[data-wlren]');if(ren){var id=ren.dataset.wlren,it=ST.lib.find(function(x){return x.id===id});
   var n=prompt('Nouveau nom du média :',it?it.name:'');if(n!=null)await renameItem(id,n);return}
  var dup=e.target.closest('[data-wldup]');if(dup){await duplicateItem(dup.dataset.wldup);return}
  var del=e.target.closest('[data-wldel]');if(del){await delItems([del.dataset.wldel]);return}
  var op=e.target.closest('[data-wlopen]');if(op){ST.drawer=op.dataset.wlopen;render();return}
  var b=e.target.closest('[data-wl]');if(!b)return;
  var k=b.dataset.wl;
  if(k==='admin'){if(typeof window.switchView==='function')switchView('admin');else{var a=$('#admBtn');if(a)a.click()}return}
  if(k==='home'){if(typeof window.switchView==='function')switchView('accueil');return}
  if(k==='pick'){$('#wlFile').click();return}
  if(k==='sound'){AU.on=!AU.on;LS.s('wlSound',AU.on);var m=$('#wlMute');
   if(m)m.textContent=AU.on?'🔊 Son actif':'🔇 Son coupé';
   [V,prevV].forEach(function(v){if(v)v.muted=ST.style.muted||!AU.on});if(AU.on)snd('tick');return}
  if(k==='apply'){await persistCur();ST.live=true;applyLive();snd('apply');toast('💾 Fond appliqué à l’application');render();return}
  if(k==='clear'){ST.cur=null;LS.d('wlCur');applyLive();snd('tick');toast('🚫 Fond retiré');render();return}
  if(k==='reset'){ST.style=Object.assign({},DEF);saveStyle();persistCur();applyLive();snd('tick');render();return}
  if(k==='rand'){
   var pal=['#04140c','#0b1a2e','#1a0a1e','#12100a','#0a1a1a'];
   ST.style.tint=pal[Math.floor(Math.random()*pal.length)];
   ST.style.scale=90+Math.floor(Math.random()*70);ST.style.x=Math.floor(Math.random()*30)-15;
   ST.style.y=Math.floor(Math.random()*24)-12;ST.style.hue=Math.floor(Math.random()*120)-60;
   ST.style.sat=70+Math.floor(Math.random()*110);ST.style.contrast=90+Math.floor(Math.random()*70);
   ST.style.blur=Math.floor(Math.random()*14);ST.style.grain=Math.floor(Math.random()*26);
   ST.style.vignette=25+Math.floor(Math.random()*60);ST.style.scrim=40+Math.floor(Math.random()*40);
   ST.style.tintAmt=Math.floor(Math.random()*45);ST.style.motionAmt=2+Math.floor(Math.random()*14);
   saveStyle();persistCur();applyLive();snd('apply');render();return}
  if(k==='fixread'){ST.style.scrim=Math.max(ST.style.scrim,58);ST.style.vignette=Math.max(ST.style.vignette,46);
   ST.style.opacity=Math.min(ST.style.opacity,86);saveStyle();persistCur();applyLive();snd('tick');render();return}
  if(k==='t10'){var it=ST.cur;if(it&&it.kind==='video'){ST.trim.out=Math.min(it.dur,ST.trim.in+MAX);
   if(ST.trim.out-ST.trim.in<MAX)ST.trim.in=Math.max(0,ST.trim.out-MAX);
   persistCur();buildStrip();paintTrim();[V,prevV].forEach(function(v){if(v&&v.src){try{v.currentTime=ST.trim.in}catch(x){}}});snd('trim')}return}
  if(k==='tstart'){setTrim('in',0);return}
  if(k==='tend'){var i2=ST.cur;if(i2)setTrim('out',i2.dur);return}
  if(k==='play'){var vv=prevV;if(vv&&vv.src){if(vv.paused){vv.play().catch(function(){});b.textContent='⏸ Pause'}
   else{vv.pause();b.textContent='▶️ Lecture'}}return}
  if(k==='gen'){await genLoop();return}
  if(k==='cancel'){if(ST.rec)ST.rec.cancel=true;return}
  if(k==='delsel'){await delItems(ST.sel.slice());return}
  if(k==='selnone'){ST.sel=[];render();return}
  if(k==='exphoto'){await exportPhoto();return}
  if(k==='exvideo'){await exportVideo();return}
  if(k==='exorig'){var i3=ST.cur;if(!i3){toast('Sélectionnez un média');return}
   dl(i3.blob,i3.name.replace(/[^\w\-. ]+/g,'_')+(i3.kind==='video'?(i3.type.indexOf('mp4')>=0?'.mp4':'.webm'):(i3.type==='image/png'?'.png':'.jpg')));
   snd('export');toast('📦 Original téléchargé');return}
  if(k==='dlsel'){var i4=ST.lib.find(function(x){return x.id===ST.drawer});if(i4){dl(i4.blob,i4.name+(i4.kind==='video'?'.webm':'.jpg'));snd('export')}return}
  if(k==='publish'){await publish();return}
  if(k==='ghupload'){var c=repo();window.open('https://github.com/'+c.owner+'/'+c.repo+'/upload/'+c.branch,'_blank','noopener');return}
  if(k==='dclose'){ST.drawer=null;render();return}});
 document.addEventListener('keydown',function(e){
  if(!isAdmin())return;var v=$('#view');if(!v||!$('#wlFrame'))return;
  if(/^(INPUT|SELECT|TEXTAREA)$/.test((e.target.tagName||'')))return;
  var it=ST.cur;
  if(e.code==='Space'){e.preventDefault();var vv=prevV;if(vv&&vv.src){if(vv.paused)vv.play().catch(function(){});else vv.pause()}return}
  if(!it||it.kind!=='video')return;
  if(e.key==='ArrowLeft'){e.preventDefault();setTrim('in',ST.trim.in-.1)}
  if(e.key==='ArrowRight'){e.preventDefault();setTrim('out',ST.trim.out+.1)}
  if(e.key==='i'||e.key==='I'){setTrim('in',(prevV&&prevV.currentTime)||ST.trim.in)}
  if(e.key==='o'||e.key==='O'){setTrim('out',(prevV&&prevV.currentTime)||ST.trim.out)}})}
function paintGrid(){
 var g=$('#wlGrid');if(!g)return;var vis=visible();
 g.innerHTML=vis.length?vis.map(card).join(''):'<div class="wl-empty">Aucun média pour ce filtre. Importez un fichier ou créez une boucle.</div>';
 dnd()}

/* ═════════ CSS ═════════ */
function css(){
 if($('#wlCss'))return;var s=document.createElement('style');s.id='wlCss';
 s.textContent=
 ':root{--wl-ink:#03110a;--wl-ink2:#071c12;--wl-surf:#0c2417;--wl-surf2:#10301e;--wl-line:#1e5236;--wl-line2:#2b6b48;'+
 '--wl-tx:#eefaf1;--wl-tx2:#c2e4cd;--wl-mut:#84b397;--wl-dim:#5b8a70;'+
 '--wl-grass:#25c257;--wl-acid:#a3e635;--wl-cyan:#38bdf8;--wl-amber:#ffb020;--wl-mag:#ff4d9d;--wl-red:#ff4d3d;--wl-gold:#d8b45a}'+
 /* calque de fond réel */
 '#wallLayer{position:fixed;inset:0;z-index:-2;pointer-events:none;opacity:0;transition:opacity .5s;overflow:hidden;'+
  '--wo:1;--wsc:.56;--wta:.16;--wvi:.44;--wgr:.07;--wdur:26s;--wmo:.07;--wtint:#04140c;--wblend:normal}'+
 '#wallLayer.on{opacity:var(--wo)}'+
 '#wallLayer .wl-media,#wlFrame .wl-media{position:absolute;inset:-6%;filter:none;transform-origin:50% 50%}'+
 '#wallLayer .wl-media img,#wallLayer .wl-media video,#wlFrame .wl-media img,#wlFrame .wl-media video{'+
  'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none}'+
 '#wallLayer.pic .wl-media img,#wlFrame.pic .wl-media img{display:block}'+
 '#wallLayer.vid .wl-media video,#wlFrame.vid .wl-media video{display:block}'+
 '.wl-media.ken{animation:wlKen var(--wdur) ease-in-out infinite alternate}'+
 '@keyframes wlKen{0%{transform:translate(-1%,1%) scale(1)}100%{transform:translate(1%,-1%) scale(calc(1 + var(--wmo)))}}'+
 '#wallLayer .wl-tint,#wlFrame .wl-tint{position:absolute;inset:0;background:var(--wtint);opacity:var(--wta);mix-blend-mode:var(--wblend)}'+
 '#wallLayer .wl-scrim,#wlFrame .wl-scrim{position:absolute;inset:0;background:linear-gradient(180deg,'+
  'rgba(3,17,10,calc(var(--wsc)*.9)) 0%,rgba(3,17,10,calc(var(--wsc)*.42)) 44%,rgba(3,17,10,calc(var(--wsc)*.96)) 100%)}'+
 '#wallLayer .wl-vig,#wlFrame .wl-vig{position:absolute;inset:0;background:radial-gradient(58% 56% at 50% 46%,transparent 26%,rgba(0,0,0,var(--wvi)) 100%)}'+
 '#wallLayer .wl-grain,#wlFrame .wl-grain{position:absolute;inset:0;opacity:var(--wgr);mix-blend-mode:overlay;background-repeat:repeat}'+
 /* hero */
 '.wl-hero{position:relative;border-radius:20px;overflow:hidden;margin-bottom:14px;border:1px solid var(--wl-line);'+
  'background:linear-gradient(135deg,#03110a,#0a2c1b 40%,#0d1a2e 74%,#1c0f22);box-shadow:0 20px 54px #000b}'+
 '.wl-hero-bg{position:absolute;inset:0;opacity:.34;background-image:linear-gradient(#25c25722 1px,transparent 1px),linear-gradient(90deg,#25c25722 1px,transparent 1px);'+
  'background-size:32px 32px;mask-image:radial-gradient(72% 72% at 26% 24%,#000,transparent)}'+
 '.wl-hero::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.3;mix-blend-mode:screen;'+
  'background:radial-gradient(44% 58% at 14% 6%,var(--wl-grass),transparent 62%),radial-gradient(42% 52% at 92% 94%,var(--wl-mag),transparent 60%)}'+
 '.wl-hero-in{position:relative;display:flex;gap:20px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;padding:22px 22px 20px}'+
 '.wl-hero-l{flex:1;min-width:272px}'+
 '.wl-kick{display:inline-block;font:800 10px/1 system-ui;letter-spacing:1.6px;color:#03110a;'+
  'background:linear-gradient(90deg,var(--wl-grass),var(--wl-acid));padding:6px 11px;border-radius:8px;margin-bottom:10px}'+
 '.wl-hero h1{font-size:26px;margin:0 0 8px;color:#f2fbf4;letter-spacing:-.4px}'+
 '.wl-hero p{margin:0;font-size:13px;color:#9fc4ad;line-height:1.6;max-width:660px}.wl-hero p b{color:#e8f7ec}'+
 '.wl-hero-r{display:flex;gap:10px;flex-wrap:wrap}'+
 '.wl-stat{min-width:86px;padding:11px 13px;border-radius:14px;background:#03110acc;border:1px solid var(--wl-line);text-align:center}'+
 '.wl-stat b{display:block;font-size:22px;font-weight:900;color:var(--wl-grass);line-height:1.1}'+
 '.wl-stat.pic b{color:var(--wl-cyan)}.wl-stat.vid b{color:var(--wl-mag)}.wl-stat.wt b{color:var(--wl-amber);font-size:15px}'+
 '.wl-stat span{font-size:9.5px;letter-spacing:.9px;text-transform:uppercase;color:var(--wl-dim)}'+
 '.wl-mute{position:absolute;top:14px;right:14px;z-index:3;background:#03110acc;border:1px solid var(--wl-line2);'+
  'color:var(--wl-acid);border-radius:20px;padding:7px 13px;font-size:11.5px;font-weight:800;cursor:pointer}'+
 '.wl-mute:hover{border-color:var(--wl-acid);box-shadow:0 0 16px #a3e63544}'+
 '.wl-strip-top{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:12px}'+
 '.wl-pill{font:700 10.5px/1 system-ui;padding:6px 10px;border-radius:20px;border:1px solid var(--wl-line);background:var(--wl-ink2);color:var(--wl-tx2);white-space:nowrap}'+
 '.wl-pill.ok{border-color:var(--wl-grass);color:var(--wl-grass);background:#25c25714}'+
 '.wl-pill.ko{border-color:var(--wl-red);color:var(--wl-red);background:#ff4d3d14}'+
 '.wl-pill.warn{border-color:var(--wl-amber);color:var(--wl-amber);background:#ffb02014}'+
 '.wl-pill.info{border-color:var(--wl-cyan);color:var(--wl-cyan);background:#38bdf814}'+
 '.wl-busy{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:12px;margin-bottom:12px;'+
  'background:#38bdf812;border:1px solid var(--wl-cyan);color:var(--wl-cyan);font-size:12.5px;font-weight:700}'+
 '.wl-spin{width:14px;height:14px;border-radius:50%;border:2px solid var(--wl-cyan);border-top-color:transparent;animation:wlSp .7s linear infinite}'+
 '@keyframes wlSp{to{transform:rotate(360deg)}}'+
 '.wl-layout{display:grid;grid-template-columns:minmax(0,1fr) 322px;gap:14px;align-items:start}'+
 '@media(max-width:1080px){.wl-layout{grid-template-columns:1fr}}'+
 '.wl-main{min-width:0}'+
 '.wl-card{background:#0c2417ee;border:1px solid var(--wl-line);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:0 12px 36px #000a}'+
 '.wl-card>b{display:block;font-size:14px;color:var(--wl-tx);margin-bottom:12px}'+
 /* drop */
 '.wl-drop{border:2px dashed var(--wl-line2);border-radius:14px;background:linear-gradient(135deg,#071c12,#0c2417);transition:.2s;margin-bottom:14px}'+
 '.wl-drop.over{border-color:var(--wl-acid);background:#a3e63512;box-shadow:0 0 0 4px #a3e63522}'+
 '.wl-drop-in{display:flex;gap:14px;align-items:center;padding:16px;flex-wrap:wrap}'+
 '.wl-drop-ic{font-size:28px}'+
 '.wl-drop-in>div{flex:1;min-width:200px}'+
 '.wl-drop-in b{display:block;font-size:14px;color:var(--wl-tx)}'+
 '.wl-drop-in span{display:block;font-size:11.5px;color:var(--wl-mut);margin-top:3px;line-height:1.5}'+
 /* frame */
 '.wl-frame-wrap{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:14px;align-items:start}'+
 '@media(max-width:720px){.wl-frame-wrap{grid-template-columns:1fr}}'+
 '.wl-frame{position:relative;aspect-ratio:16/10;border-radius:16px;overflow:hidden;border:1px solid var(--wl-line2);'+
  'background:#03110a;box-shadow:0 18px 44px #000b;--wsc:.56;--wta:.16;--wvi:.44;--wgr:.07;--wtint:#04140c;--wblend:normal;--wdur:26s;--wmo:.07}'+
 '.wl-frame-ui{position:absolute;left:14px;bottom:12px;z-index:4}'+
 '.wl-frame-ui span{display:block;font:800 9px/1 system-ui;letter-spacing:1.6px;color:var(--wl-acid)}'+
 '.wl-frame-ui b{display:block;font-size:15px;color:#fff;text-shadow:0 2px 10px #000}'+
 '.wl-frame-side{display:flex;flex-direction:column;gap:10px}'+
 '.wl-mini{border:1px solid var(--wl-line);border-radius:12px;background:var(--wl-ink2);padding:11px}'+
 '.wl-mini>b{display:block;font-size:10px;letter-spacing:.8px;text-transform:uppercase;color:var(--wl-dim);margin-bottom:7px}'+
 '.wl-mini p{margin:0;font-size:10.5px;color:var(--wl-mut);line-height:1.6}'+
 '.wl-read-bar{height:7px;border-radius:6px;background:#03110a;overflow:hidden;margin-bottom:6px}'+
 '.wl-read-bar i{display:block;height:100%;border-radius:6px;transition:width .3s}'+
 '.wl-read-bar i.ok{background:linear-gradient(90deg,var(--wl-grass),var(--wl-acid))}'+
 '.wl-read-bar i.warn{background:linear-gradient(90deg,var(--wl-amber),var(--wl-gold))}'+
 '.wl-read-bar i.ko{background:linear-gradient(90deg,var(--wl-red),var(--wl-mag))}'+
 '.wl-read span{font-size:11px;font-weight:700}.wl-read .ok{color:var(--wl-grass)}.wl-read .warn{color:var(--wl-amber)}.wl-read .ko{color:var(--wl-red)}'+
 '.wl-read button{margin-top:8px;width:100%;font-size:11px;padding:6px;border-radius:8px;border:1px solid var(--wl-line2);background:#03110a;color:var(--wl-acid);cursor:pointer}'+
 /* trim */
 '.wl-trimbox{margin-top:14px;border:1px solid var(--wl-mag);border-radius:14px;background:#ff4d9d0a;padding:13px}'+
 '.wl-trim-h{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}'+
 '.wl-trim-h b{font-size:13px;color:var(--wl-tx)}'+
 '.wl-tbar{position:relative;height:9px;border-radius:6px;background:#03110a;border:1px solid var(--wl-line);margin-bottom:12px;overflow:hidden}'+
 '.wl-tbar i{position:absolute;top:0;bottom:0;background:linear-gradient(90deg,var(--wl-mag),var(--wl-amber));border-radius:6px;transition:.15s}'+
 '.wl-trow{margin-bottom:9px}'+
 '.wl-trow label{display:flex;justify-content:space-between;font-size:10px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:var(--wl-dim);margin-bottom:4px}'+
 '.wl-trow label b{color:var(--wl-mag);font-family:ui-monospace,monospace;font-size:11px}'+
 '.wl-trow input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;border:0;padding:0;margin:0;'+
  'background:linear-gradient(90deg,var(--wl-mag),var(--wl-amber))}'+
 '.wl-trow input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;background:#fff;border:3px solid var(--wl-mag);box-shadow:0 0 10px var(--wl-mag);cursor:grab}'+
 '.wl-trow input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#fff;border:3px solid var(--wl-mag);cursor:grab}'+
 '.wl-strip{display:flex;gap:7px;overflow-x:auto;margin-top:11px;padding-bottom:6px}'+
 '.wl-strip figure{margin:0;flex:none;width:132px}'+
 '.wl-strip img{width:132px;height:78px;object-fit:cover;border-radius:9px;border:1px solid var(--wl-line);display:block}'+
 '.wl-strip figcaption{font:700 9.5px/1 ui-monospace,monospace;color:var(--wl-dim);margin-top:4px;text-align:center}'+
 '.wl-strip-wait{font-size:11.5px;color:var(--wl-mut);padding:10px}'+
 '.wl-strip::-webkit-scrollbar{height:9px}.wl-strip::-webkit-scrollbar-track{background:#03110a;border-radius:8px}'+
 '.wl-strip::-webkit-scrollbar-thumb{background:linear-gradient(90deg,var(--wl-mag),var(--wl-amber));border-radius:8px;border:2px solid #03110a}'+
 '.wl-strip{scrollbar-width:thin;scrollbar-color:var(--wl-mag) #03110a}'+
 /* library */
 '.wl-lib-h{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px}'+
 '.wl-lib-h b{font-size:14px;color:var(--wl-tx);margin-right:auto}'+
 '.wl-lib-h input,.wl-lib-h select{width:auto;min-width:130px;margin:0;padding:8px 10px;font-size:12px;'+
  'background:var(--wl-ink2);border:1px solid var(--wl-line2);color:var(--wl-tx);border-radius:9px}'+
 '.wl-lib-h input{min-width:190px}'+
 '.wl-lib-h button{padding:8px 12px;font-size:12px;border-radius:9px;border:1px solid var(--wl-mag);background:#ff4d9d14;color:var(--wl-mag);font-weight:700;cursor:pointer}'+
 '.wl-lib-h button:hover{background:#ff4d9d22}'+
 '.wl-bulk{display:flex;gap:8px;align-items:center;padding:9px 12px;border-radius:11px;background:#ffb02010;border:1px solid var(--wl-amber);margin-bottom:11px}'+
 '.wl-bulk b{font-size:12px;color:var(--wl-amber);margin-right:auto}'+
 '.wl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(216px,1fr));gap:12px}'+
 '.wl-item{border:1px solid var(--wl-line);border-radius:14px;background:var(--wl-ink2);overflow:hidden;transition:.18s;cursor:grab}'+
 '.wl-item:hover{border-color:var(--wl-line2);transform:translateY(-2px);box-shadow:0 12px 28px #000a}'+
 '.wl-item.on{border-color:var(--wl-grass);box-shadow:0 0 0 2px #25c25744,0 12px 28px #000a}'+
 '.wl-item.sel{border-color:var(--wl-amber)}'+
 '.wl-item.drag{opacity:.4}.wl-item.over{border-color:var(--wl-acid);box-shadow:0 0 0 2px #a3e63555}'+
 '.wl-thumb{position:relative;aspect-ratio:16/10;background:#03110a}'+
 '.wl-thumb img{width:100%;height:100%;object-fit:cover;display:block}'+
 '.wl-thumb-ph{width:100%;height:100%;display:grid;place-items:center;font-size:32px;color:var(--wl-dim)}'+
 '.wl-check{position:absolute;top:8px;left:8px;background:#03110acc;border:1px solid var(--wl-line2);border-radius:8px;padding:3px 5px;cursor:pointer}'+
 '.wl-check input{width:auto;margin:0;accent-color:var(--wl-amber)}'+
 '.wl-kind{position:absolute;bottom:8px;left:8px;font:800 9.5px/1 system-ui;padding:5px 8px;border-radius:12px;background:#03110add}'+
 '.wl-kind.p{color:var(--wl-cyan);border:1px solid var(--wl-cyan)}'+
 '.wl-kind.v{color:var(--wl-mag);border:1px solid var(--wl-mag)}'+
 '.wl-badge{position:absolute;top:8px;right:38px;font:800 9px/1 system-ui;padding:4px 7px;border-radius:10px;'+
  'background:#a3e63522;color:var(--wl-acid);border:1px solid var(--wl-acid)}'+
 '.wl-badge.tier{background:#38bdf822;color:var(--wl-cyan);border-color:var(--wl-cyan)}'+
 '.wl-open{position:absolute;top:6px;right:6px;background:#03110acc;border:1px solid var(--wl-line2);color:var(--wl-tx2);'+
  'border-radius:8px;padding:3px 8px;font-size:13px;cursor:pointer}'+
 '.wl-item-b{padding:10px}'+
 '.wl-item-b>b{display:block;font-size:12.5px;color:var(--wl-tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.wl-item-b>span{display:block;font-size:10px;color:var(--wl-dim);margin:3px 0 8px}'+
 '.wl-item-a{display:flex;gap:5px}'+
 '.wl-item-a button{padding:6px 8px;font-size:11px;border-radius:8px;border:1px solid var(--wl-line2);background:#03110a;color:var(--wl-tx2);cursor:pointer}'+
 '.wl-item-a button.pri{flex:1;background:linear-gradient(135deg,var(--wl-grass),var(--wl-acid));border-color:var(--wl-grass);color:#03110a;font-weight:800}'+
 '.wl-item-a button.danger{border-color:var(--wl-red);color:var(--wl-red)}'+
 '.wl-empty{grid-column:1/-1;padding:26px;text-align:center;border:1px dashed var(--wl-line2);border-radius:14px;color:var(--wl-mut);font-size:13px}'+
 /* export */
 '.wl-exp{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:11px;margin-bottom:8px}'+
 '.wl-exp label{display:flex;justify-content:space-between;font-size:10px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--wl-dim);margin-bottom:4px}'+
 '.wl-exp label b{color:var(--wl-amber);font-family:ui-monospace,monospace}'+
 '.wl-exp select{width:100%;margin:0;padding:8px 10px;font-size:12px;background:var(--wl-ink2);border:1px solid var(--wl-line2);color:var(--wl-tx);border-radius:9px}'+
 '.wl-exp input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;border:0;padding:0;margin:2px 0 0;background:linear-gradient(90deg,var(--wl-amber),var(--wl-mag))}'+
 '.wl-exp input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid var(--wl-amber);cursor:grab}'+
 '.wl-exp input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid var(--wl-amber);cursor:grab}'+
 '.wl-prog{display:flex;align-items:center;gap:11px;margin-top:12px}'+
 '.wl-bar{flex:1;height:8px;border-radius:6px;background:var(--wl-ink2);overflow:hidden}'+
 '.wl-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--wl-grass),var(--wl-cyan),var(--wl-mag));transition:width .25s}'+
 '.wl-prog span{font-size:11px;color:var(--wl-mut);white-space:nowrap}'+
 '.wl-note{font-size:11px;color:var(--wl-mut);line-height:1.6;margin:11px 0 0}.wl-note b{color:var(--wl-tx2)}'+
 '.wl-b{background:linear-gradient(135deg,#1f6f54,#3fa382)!important;border-color:#1f6f54!important;color:#fff!important;font-weight:700}'+
 /* dock */
 '.wl-dock{position:sticky;top:76px;max-height:calc(100vh - 96px);display:flex;flex-direction:column;'+
  'border:1px solid var(--wl-line);border-radius:18px;overflow:hidden;background:linear-gradient(168deg,#06180fF2,#141030F2 74%);'+
  'box-shadow:0 18px 48px #000b,0 0 0 1px #25c2571e;backdrop-filter:blur(12px)}'+
 '@media(max-width:1080px){.wl-dock{position:static;max-height:none}}'+
 '.wl-dock-h{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--wl-line);'+
  'background:linear-gradient(90deg,#25c2571a,transparent)}'+
 '.wl-dock-h b{flex:1;font-size:12.5px;color:#e8f7ec}'+
 '.wl-mini-btn{background:var(--wl-ink2);border:1px solid var(--wl-line2);color:var(--wl-acid);border-radius:9px;padding:5px 9px;cursor:pointer;font-size:14px}'+
 '.wl-mini-btn:hover{border-color:var(--wl-acid)}'+
 '.wl-dock-b{flex:1;overflow:auto;padding:13px 14px 16px}'+
 '.wl-dock-b::-webkit-scrollbar{width:10px}.wl-dock-b::-webkit-scrollbar-track{background:#03110a;border-radius:8px}'+
 '.wl-dock-b::-webkit-scrollbar-thumb{background:linear-gradient(var(--wl-grass),var(--wl-mag));border-radius:8px;border:2px solid #03110a}'+
 '.wl-dock-b::-webkit-scrollbar-thumb:hover{background:var(--wl-acid)}'+
 '.wl-dock-b{scrollbar-width:thin;scrollbar-color:var(--wl-grass) #03110a}'+
 '.wl-c{margin-bottom:11px}'+
 '.wl-c label{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:4px;'+
  'font-size:9.5px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:var(--wl-dim)}'+
 '.wl-c label b{color:var(--wl-acid);font-family:ui-monospace,monospace;font-size:10.5px}'+
 '.wl-c select{width:100%;background:var(--wl-ink2);border:1px solid var(--wl-line2);color:var(--wl-tx);border-radius:9px;padding:8px 10px;font-size:12px;margin:0}'+
 '.wl-c select:focus{outline:none;border-color:var(--wl-grass);box-shadow:0 0 0 3px #25c2572e}'+
 '.wl-c input[type=color]{width:100%;height:32px;border:1px solid var(--wl-line2);border-radius:9px;background:var(--wl-ink2);padding:2px;cursor:pointer;margin:0}'+
 '.wl-c input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:2px 0 0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--wl-grass),var(--wl-cyan),var(--wl-mag))}'+
 '.wl-c input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;background:#f2fbf4;'+
  'border:3px solid var(--wl-grass);box-shadow:0 0 10px var(--wl-grass);cursor:grab}'+
 '.wl-c input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#f2fbf4;border:3px solid var(--wl-grass);cursor:grab}'+
 '.wl-sep{height:1px;background:linear-gradient(90deg,#25c25766,#ff4d9d66,transparent);margin:12px 0}'+
 '.wl-tgs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:11px}'+
 '.wl-tg{display:flex;align-items:center;gap:6px;font-size:10.5px;color:var(--wl-dim);background:var(--wl-ink2);'+
  'border:1px solid var(--wl-line2);border-radius:18px;padding:5px 10px;cursor:pointer;user-select:none}'+
 '.wl-tg input{width:auto;margin:0;accent-color:var(--wl-grass)}'+
 '.wl-tg.on{color:var(--wl-acid);border-color:var(--wl-grass);background:#25c25714}'+
 '.wl-btns{display:grid;grid-template-columns:1fr 1fr;gap:7px}'+
 '.wl-btns button{border-radius:10px;padding:10px;font-size:11.5px;font-weight:800;cursor:pointer;border:1px solid var(--wl-line2);background:var(--wl-ink2);color:var(--wl-tx)}'+
 '.wl-btns button:hover{border-color:var(--wl-grass);transform:translateY(-1px)}'+
 '.wl-btns .p{grid-column:1/-1;background:linear-gradient(135deg,var(--wl-grass),var(--wl-acid));border-color:var(--wl-grass);color:#03110a}'+
 /* drawer */
 '.wl-drawer{position:fixed;inset:0;z-index:210;background:#03110acc;backdrop-filter:blur(6px);display:flex;justify-content:flex-end}'+
 '.wl-drawer-in{width:min(420px,94vw);height:100%;overflow:auto;background:linear-gradient(168deg,#071c12,#0c2417);'+
  'border-left:1px solid var(--wl-line2);padding:18px;box-shadow:-20px 0 60px #000b;animation:wlSlide .28s ease-out}'+
 '@keyframes wlSlide{from{transform:translateX(30px);opacity:0}to{transform:none;opacity:1}}'+
 '.wl-drawer-h{display:flex;align-items:center;gap:10px;margin-bottom:14px}'+
 '.wl-drawer-h b{flex:1;font-size:15px;color:var(--wl-tx)}'+
 '.wl-drawer-h button{background:var(--wl-ink2);border:1px solid var(--wl-line2);color:var(--wl-tx2);border-radius:9px;padding:6px 11px;cursor:pointer}'+
 '.wl-drawer-img{width:100%;border-radius:12px;border:1px solid var(--wl-line);display:block;margin-bottom:12px}'+
 '.wl-tbl{width:100%;border-collapse:collapse;font-size:12.5px}'+
 '.wl-tbl td{border-bottom:1px solid var(--wl-line);padding:7px 6px;color:var(--wl-tx2);vertical-align:top}'+
 '.wl-tbl td:first-child{color:var(--wl-dim);width:38%}'+
 '.wl-tbl input{width:100%;margin:0;padding:6px 8px;font-size:12px;background:var(--wl-ink2);border:1px solid var(--wl-line2);color:var(--wl-tx);border-radius:8px}'+
 '.wl-drawer-a{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:14px}'+
 '.wl-drawer-a button{padding:10px;font-size:12px;font-weight:700;border-radius:10px;border:1px solid var(--wl-line2);background:var(--wl-ink2);color:var(--wl-tx);cursor:pointer}'+
 '.wl-drawer-a .pri{grid-column:1/-1;background:linear-gradient(135deg,var(--wl-grass),var(--wl-acid));border-color:var(--wl-grass);color:#03110a}'+
 '.wl-drawer-a .danger{border-color:var(--wl-red);color:var(--wl-red)}'+
 '.wl-drawer-in::-webkit-scrollbar{width:10px}.wl-drawer-in::-webkit-scrollbar-track{background:#03110a}'+
 '.wl-drawer-in::-webkit-scrollbar-thumb{background:linear-gradient(var(--wl-grass),var(--wl-cyan));border-radius:8px;border:2px solid #03110a}'+
 /* lock */
 '.wl-lock{display:grid;place-items:center;min-height:56vh}'+
 '.wl-lock-in{max-width:560px;text-align:center;border:1px solid var(--wl-line);border-radius:20px;padding:34px 26px;'+
  'background:linear-gradient(160deg,#071c12,#0c2417);box-shadow:0 20px 54px #000b}'+
 '.wl-lock-ic{font-size:46px;display:block;margin-bottom:12px}'+
 '.wl-lock-in h1{font-size:21px;margin-bottom:10px;color:var(--wl-tx)}'+
 '.wl-lock-in p{font-size:13px;color:var(--wl-mut);line-height:1.65;margin:0}'+
 '.wl-lock-note{margin-top:16px!important;font-size:11.5px!important;color:var(--wl-dim)!important}'+
 '@media(max-width:640px){.wl-hero h1{font-size:22px}.wl-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}}';
 document.head.appendChild(s)}

/* ═════════ nav / boot ═════════ */
var navTimer=null;
function ensureNav(){
 try{
  if(typeof NAV==='undefined'||!Array.isArray(NAV))return;
  var has=NAV.some(function(n){return n[0]==='wall'}),adm=isAdmin();
  if(adm&&!has){var i=NAV.findIndex(function(n){return n[0]==='admin'});
   NAV.splice(i<0?NAV.length:i,0,['wall','🖼️ Fond d’écran'])}
  if(!adm&&has){for(var k=NAV.length-1;k>=0;k--)if(NAV[k][0]==='wall')NAV.splice(k,1)}
  var btn=$('#wlTopBtn');
  if(adm&&!btn){var h=document.querySelector('.hbtns');
   if(h){btn=document.createElement('button');btn.id='wlTopBtn';btn.type='button';btn.title='Fond d’écran (admin)';
    btn.textContent='🖼️';btn.style.borderColor='#a3e635';btn.style.color='#a3e635';btn.style.background='#0c2417';
    btn.addEventListener('click',function(e){e.preventDefault();if(typeof switchView==='function')switchView('wall')});
    h.insertBefore(btn,h.firstChild)}}
  if(!adm&&btn)btn.remove();
 }catch(e){}}
function hook(){
 try{
  if(typeof window.switchView==='function'&&!window.switchView.__wl){
   var _s=window.switchView;
   var w=function(v){
    if(v!=='wall'){if(prevV){try{prevV.pause()}catch(e){}}return _s(v)}
    if(typeof S!=='undefined')S.view='wall';
    ensureNav();
    var n=$('#nav');if(n&&typeof NAV!=='undefined')n.innerHTML=NAV.map(function(x){
     return '<button data-act="nav" data-k="'+x[0]+'" class="'+(x[0]==='wall'?'act':'')+'">'+x[1]+'</button>'}).join('');
    render()};
   w.__wl=true;window.switchView=w}
 }catch(e){}}
async function boot(){
 css();layers();hook();ensureNav();
 ST.lib=await seed();
 if(!ST.lib.length)ST.lib=await dbAll();
 var cur=LS.g('wlCur','');
 var it=ST.lib.find(function(x){return x.id===cur});
 if(it){ST.cur=it;ST.style=Object.assign({},DEF,it.style||{});
  ST.trim={in:(it.trim||{}).in||0,out:(it.trim||{}).out||(it.kind==='video'?Math.min(MAX,it.dur):0)}}
 applyLive();
 navTimer=setInterval(ensureNav,1500);
 tierPoll();setInterval(tierPoll,60000);
 window.addEventListener('focus',tierPoll);
 document.addEventListener('visibilitychange',function(){
  if(document.hidden){if(prevV)try{prevV.pause()}catch(e){}}
  else{if(ST.cur&&ST.cur.kind==='video'&&prevV&&prevV.src&&$('#wlFrame'))prevV.play().catch(function(){});
   if(ST.cur&&ST.cur.kind==='video'&&V&&V.src&&!ST.style.eco)V.play().catch(function(){})}});
 window.addEventListener('beforeunload',function(){Object.keys(URLS).forEach(dropUrl)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFWall={render:render,import:importFiles,apply:function(){ST.live=true;applyLive()},
 clear:function(){ST.cur=null;LS.d('wlCur');applyLive()},publish:publish,genLoop:genLoop,
 exportPhoto:exportPhoto,exportVideo:exportVideo,state:ST};
})();
