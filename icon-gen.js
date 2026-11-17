/* KEV FUSION 2026 — icon-gen.js v1.0.0
   Icône VÉHICULE SPORTIF VERT générée & intégrée AUTOMATIQUEMENT :
   · dessin vectoriel canvas (aucun asset binaire requis dans le repo)
   · injection immédiate dans le DOM (favicon, apple-touch-icon, theme-color)
   · manifest HTTP conservé pour PWABuilder ; manifest blob de secours SEULEMENT si absent
   · publication automatique des PNG + manifest + assetlinks sur GitHub (si jeton présent)
   · sinon : bouton 1-clic (ZIP prêt à committer / upload GitHub) affiché tant que les PNG sont en 404
   Idempotent, sans dépendance, ne casse jamais PWABuilder. */
(function(){
'use strict';
var LS={get:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
function toast(m){if(typeof window.toast==='function')window.toast(m);else{var t=document.getElementById('toast');if(t){t.textContent=m;t.classList.remove('hid');t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3000)}}}
var COL={c1:'#04140c',c2:'#0b3d24',car:'#22c55e',rim:'#a3e635'};
var ANY=[512,384,192,152,144,128,96,72,64,48,32,16];
var MASK=[512,192];
var APPLE=[180,167,152,120];
var GEN={},PUBLISHED=null;
/* ---------- dessin ---------- */
function shade(hex,f){var n=parseInt(hex.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
 r=Math.max(0,Math.min(255,Math.round(r*f)));g=Math.max(0,Math.min(255,Math.round(g*f)));b=Math.max(0,Math.min(255,Math.round(b*f)));
 return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
function wheel(x,cx,cy,r,rim){
 x.save();x.fillStyle='#05070a';x.beginPath();x.arc(cx,cy,r,0,7);x.fill();
 x.strokeStyle='#161d26';x.lineWidth=r*.17;x.beginPath();x.arc(cx,cy,r*.87,0,7);x.stroke();
 var g=x.createRadialGradient(cx-r*.24,cy-r*.24,r*.04,cx,cy,r*.64);
 g.addColorStop(0,shade(rim,1.4));g.addColorStop(1,shade(rim,.66));
 x.fillStyle=g;x.beginPath();x.arc(cx,cy,r*.62,0,7);x.fill();
 x.strokeStyle=shade(rim,.5);x.lineWidth=r*.12;
 for(var i=0;i<5;i++){var a=i*Math.PI*2/5-Math.PI/2;
  x.beginPath();x.moveTo(cx+Math.cos(a)*r*.13,cy+Math.sin(a)*r*.13);x.lineTo(cx+Math.cos(a)*r*.56,cy+Math.sin(a)*r*.56);x.stroke()}
 x.fillStyle='#0a0e13';x.beginPath();x.arc(cx,cy,r*.18,0,7);x.fill();
 x.fillStyle=rim;x.beginPath();x.arc(cx,cy,r*.07,0,7);x.fill();x.restore()}
function sport(x){
 var c=COL.car;
 x.save();
 x.fillStyle='rgba(0,0,0,.5)';x.beginPath();x.ellipse(0,17,48,4.4,0,0,7);x.fill();
 x.fillStyle=shade(c,.5);x.fillRect(-49,-13.8,13,3.1);
 x.fillStyle=shade(c,.34);x.fillRect(-46,-11,3.2,8.4);
 x.fillStyle=shade(c,.7);x.fillRect(-49,-14.6,13,1.1);
 var g=x.createLinearGradient(0,-18,0,14);
 g.addColorStop(0,shade(c,1.5));g.addColorStop(.34,shade(c,1.12));g.addColorStop(.62,c);g.addColorStop(1,shade(c,.44));
 x.fillStyle=g;x.beginPath();
 x.moveTo(-46,10);x.lineTo(-44.6,1.2);x.quadraticCurveTo(-31,-2.4,-18.4,-4.6);
 x.quadraticCurveTo(-8.4,-16.2,6,-16);x.quadraticCurveTo(19,-14.6,26.4,-6.2);
 x.quadraticCurveTo(38.4,-3.2,46.6,1.4);x.lineTo(47.8,8);x.quadraticCurveTo(47.8,12,42,12);
 x.lineTo(-42,12);x.quadraticCurveTo(-46,12,-46,10);x.closePath();x.fill();
 x.fillStyle='rgba(255,255,255,.24)';x.beginPath();
 x.moveTo(-44.6,1.6);x.quadraticCurveTo(-31,-2,-18.4,-4.2);x.quadraticCurveTo(-8.4,-14.6,6,-14.4);
 x.quadraticCurveTo(18,-13.2,25,-6.6);x.lineTo(20.6,-5.6);x.quadraticCurveTo(11,-11.8,5,-12);
 x.quadraticCurveTo(-6.4,-12.2,-16.6,-2.8);x.closePath();x.fill();
 var w=x.createLinearGradient(-14,-14,23,-5);w.addColorStop(0,'#04120c');w.addColorStop(.5,'#0d3324');w.addColorStop(1,'#04120c');
 x.fillStyle=w;x.beginPath();x.moveTo(-13.8,-5.2);x.quadraticCurveTo(-6.4,-13.8,5,-13.7);
 x.quadraticCurveTo(15.6,-12.6,22,-6.4);x.lineTo(2,-6.4);x.closePath();x.fill();
 x.fillStyle='rgba(163,230,53,.22)';x.beginPath();x.moveTo(-11,-6.2);x.quadraticCurveTo(-5,-12,3,-12);
 x.lineTo(3,-10.4);x.quadraticCurveTo(-4,-10.4,-9,-6.2);x.closePath();x.fill();
 x.fillStyle=shade(c,.36);x.beginPath();x.moveTo(-26,3);x.lineTo(-10.4,1.2);x.lineTo(-13,9.4);x.lineTo(-28,9.4);x.closePath();x.fill();
 x.fillStyle=shade(c,.28);x.beginPath();x.moveTo(23,7.4);x.lineTo(41,6.2);x.lineTo(41,10.6);x.lineTo(23,10.6);x.closePath();x.fill();
 x.fillStyle=shade(c,.55);x.fillRect(-8.6,-4.8,2.6,7.4);
 x.fillStyle=shade(c,.42);x.beginPath();x.moveTo(12,-6.4);x.lineTo(19,-6.4);x.lineTo(17.4,-3.6);x.lineTo(11,-3.6);x.closePath();x.fill();
 x.fillStyle='#f4ffe0';x.beginPath();x.moveTo(39.6,.2);x.lineTo(46.8,2.4);x.lineTo(45.6,6);x.lineTo(38.8,3.8);x.closePath();x.fill();
 x.fillStyle='rgba(210,255,150,.5)';x.beginPath();x.moveTo(46.8,2.4);x.lineTo(53,.6);x.lineTo(53,7.6);x.lineTo(45.6,6);x.closePath();x.fill();
 x.fillStyle='#ff3b30';x.fillRect(-46.4,3.4,3.4,3.2);
 x.fillStyle='rgba(255,59,48,.42)';x.fillRect(-49.6,3.8,3.2,2.4);
 wheel(x,-27,12,8.9,COL.rim);wheel(x,29.4,12,8.9,COL.rim);
 x.restore()}
function paint(ctx,S,mask){
 ctx.clearRect(0,0,S,S);ctx.save();
 var rad=mask?0:(S*0.24);
 rr(ctx,0,0,S,S,rad);ctx.clip();
 var g=ctx.createRadialGradient(S*.34,S*.26,S*.04,S*.5,S*.52,S*.82);
 g.addColorStop(0,shade(COL.c2,1.25));g.addColorStop(.6,COL.c2);g.addColorStop(1,COL.c1);
 ctx.fillStyle=g;ctx.fillRect(0,0,S,S);
 var v=ctx.createRadialGradient(S/2,S*.34,S*.08,S/2,S*.52,S*.8);
 v.addColorStop(0,'rgba(255,255,255,.10)');v.addColorStop(1,'rgba(0,0,0,.58)');
 ctx.fillStyle=v;ctx.fillRect(0,0,S,S);
 var content=mask?0.80:0.94;
 ctx.translate(S/2,S/2+(mask?S*0.01:0));
 var k=(S/114)*content;ctx.scale(k,k);
 ctx.shadowColor='rgba(0,0,0,.88)';ctx.shadowBlur=S*0.05;ctx.shadowOffsetY=S*0.02;
 ctx.shadowColor=COL.car;ctx.shadowBlur=S*0.045;
 sport(ctx);
 ctx.restore();
 if(mask){ctx.save();ctx.strokeStyle='rgba(163,230,53,.0)';ctx.restore()}}
function canvasOf(S,mask){var c=document.createElement('canvas');c.width=c.height=S;paint(c.getContext('2d'),S,mask);return c}
/* ---------- génération ---------- */
function generate(){
 GEN={};
 ANY.forEach(function(s){GEN['icon-'+s+'.png']=canvasOf(s,false).toDataURL('image/png')});
 MASK.forEach(function(s){GEN['icon-'+s+'-maskable.png']=canvasOf(s,true).toDataURL('image/png')});
 APPLE.forEach(function(s){GEN['apple-'+s+'.png']=canvasOf(s,false).toDataURL('image/png')});
 GEN['apple-touch-icon.png']=GEN['apple-180.png'];
 GEN['favicon-32.png']=GEN['icon-32.png'];
 GEN['favicon-16.png']=GEN['icon-16.png'];
 LS.set('iconGenTs',Date.now());
 return GEN}
/* ---------- injection DOM ---------- */
function injectDOM(){
 if(!GEN['icon-192.png'])return;
 Array.prototype.forEach.call(document.querySelectorAll('link[data-kfgen]'),function(n){n.remove()});
 function add(rel,href,sizes){var l=document.createElement('link');l.rel=rel;l.href=href;
  if(sizes)l.setAttribute('sizes',sizes);l.setAttribute('data-kfgen','1');document.head.appendChild(l)}
 add('icon',GEN['favicon-16.png'],'16x16');
 add('icon',GEN['favicon-32.png'],'32x32');
 add('icon',GEN['icon-192.png'],'192x192');
 add('icon',GEN['icon-512.png'],'512x512');
 add('apple-touch-icon',GEN['apple-touch-icon.png'],'180x180');
 add('apple-touch-icon',GEN['apple-152.png'],'152x152');
 add('apple-touch-icon',GEN['apple-120.png'],'120x120');
 function meta(n,c){var m=document.querySelector('meta[name="'+n+'"]');
  if(!m){m=document.createElement('meta');m.setAttribute('name',n);document.head.appendChild(m)}m.setAttribute('content',c)}
 meta('theme-color',COL.c1);
 meta('apple-mobile-web-app-capable','yes');
 meta('apple-mobile-web-app-status-bar-style','black-translucent');
 meta('apple-mobile-web-app-title','KEV FUSION');
 meta('msapplication-TileColor',COL.c1);
 meta('msapplication-TileImage',GEN['icon-144.png'])}
/* ---------- manifest ---------- */
function basePath(){var p=location.pathname.replace(/[^/]*$/,'');return (!p||p==='/')?'/':p}
function manifestObj(abs){
 var bp=basePath(),P=function(f){return abs?(bp+f):('./'+f)};
 var icons=[];
 ANY.forEach(function(s){icons.push({src:P('icon-'+s+'.png'),sizes:s+'x'+s,type:'image/png',purpose:'any'})});
 MASK.forEach(function(s){icons.push({src:P('icon-'+s+'-maskable.png'),sizes:s+'x'+s,type:'image/png',purpose:'maskable'})});
 icons.push({src:P('apple-touch-icon.png'),sizes:'180x180',type:'image/png',purpose:'any'});
 return{name:'KEV FUSION 2026 — Expert Auto & Droit',short_name:'KEV FUSION',
  description:'Expert automobile & avocat : pannes corrélées, DTC, campagnes de rappel, TSB, étude incendie, juridique, VIN, OBD.',
  id:abs?(bp+'index.html'):'./index.html',start_url:abs?(bp+'index.html'):'./index.html',scope:abs?bp:'./',
  display:'standalone',display_override:['standalone','minimal-ui'],orientation:'any',lang:'fr',dir:'ltr',
  theme_color:COL.c1,background_color:COL.c1,categories:['productivity','utilities','business','education'],icons:icons,
  shortcuts:[
   {name:'Recherche prédictive',short_name:'Recherche',url:(abs?bp+'index.html':'./index.html')+'?view=recherche',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'Étude corrélée',short_name:'Étude',url:(abs?bp+'index.html':'./index.html')+'?view=etude',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'JusteRepère',short_name:'Juridique',url:(abs?bp+'index.html':'./index.html')+'?view=jr',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'Lecture VIN',short_name:'VIN',url:(abs?bp+'index.html':'./index.html')+'?view=vin',icons:[{src:P('icon-96.png'),sizes:'96x96'}]}]}}
function manifestTxt(){return JSON.stringify(manifestObj(true),null,2)}
function ensureManifest(){
 fetch('./manifest.webmanifest?g='+Date.now(),{cache:'no-store'}).then(function(r){
  if(!r.ok){ /* manifest HTTP absent → secours blob (local uniquement) */
   var blob=new Blob([JSON.stringify(manifestObj(false))],{type:'application/manifest+json'});
   var ml=document.querySelector('link[rel="manifest"]');
   if(!ml){ml=document.createElement('link');ml.rel='manifest';document.head.appendChild(ml)}
   if(ml._kf)URL.revokeObjectURL(ml._kf);ml._kf=URL.createObjectURL(blob);ml.href=ml._kf;ml.setAttribute('data-kfgen','1')}
 }).catch(function(){})}
/* ---------- sonde + publication ---------- */
function probe(){
 return fetch('./icon-192.png?g='+Date.now(),{cache:'no-store',method:'GET'}).then(function(r){
  PUBLISHED=r.ok;return r.ok}).catch(function(){PUBLISHED=false;return false})}
function token(){return (LS.get('ghToken','')||'').trim()}
function repo(){
 var h=location.hostname,m=h.match(/^([^.]+)\.github\.io$/);
 var owner=m?m[1]:'expertkevin06-cell';
 var seg=location.pathname.split('/').filter(Boolean);
 var repoName=(m&&seg.length)?seg[0]:'kev-fusion';
 return Object.assign({owner:owner,repo:repoName,branch:'main'},LS.get('ghCfg',{}))}
function b64u8(u8){var o='',CH=0x8000;for(var i=0;i<u8.length;i+=CH)o+=String.fromCharCode.apply(null,u8.subarray(i,i+CH));return btoa(o)}
function utf8b64(s){return b64u8(new TextEncoder().encode(s))}
async function ghPut(path,data,isText){
 var c=repo(),tk=token();
 if(!tk)throw new Error('Jeton GitHub absent');
 var api='https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/'+path;
 var sha=null;
 try{var g=await fetch(api+'?ref='+encodeURIComponent(c.branch),{headers:{Authorization:'Bearer '+tk,Accept:'application/vnd.github+json'}});
  if(g.ok){var j=await g.json();sha=j.sha}}catch(e){}
 var body={message:'KEV FUSION · icône véhicule '+path,content:isText?utf8b64(data):b64u8(data),branch:c.branch};
 if(sha)body.sha=sha;
 var r=await fetch(api,{method:'PUT',headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify(body)});
 if(!r.ok){var t=await r.text().catch(function(){return''});throw new Error(path+' → HTTP '+r.status+' '+t.slice(0,120))}
 return r.json()}
async function publish(){
 if(!GEN['icon-192.png'])generate();
 if(!token()){toast('🔑 Renseigne le jeton GitHub (Admin → PWABuilder) puis relance');openHelp();return false}
 var files=Object.keys(GEN);var done=0;
 toast('📡 Publication des icônes…');
 for(var i=0;i<files.length;i++){
  var f=files[i];var u8=new Uint8Array(await (await fetch(GEN[f])).arrayBuffer());
  await ghPut(f,u8,false);done++;
  if(done%5===0)toast('📡 '+done+'/'+files.length)}
 await ghPut('manifest.webmanifest',manifestTxt(),true);
 await ghPut('.well-known/assetlinks.json',assetlinksTxt(),true);
 LS.set('iconPublished',Date.now());
 PUBLISHED=true;hideFab();
 toast('✅ Icônes + manifest publiés sur GitHub');
 return true}
function assetlinksTxt(){
 var fp=(LS.get('pwaStudio',{})&&LS.get('pwaStudio',{}).fp)||'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99';
 var pkg=(LS.get('pwaStudio',{})&&LS.get('pwaStudio',{}).pkg)||'io.github.expertkevin06_cell.kevfusion';
 return JSON.stringify([{relation:['delegate_permission/common.handle_all_urls'],
  target:{namespace:'android_app',package_name:pkg,sha256_cert_fingerprints:[fp]}}],null,2)}
/* ---------- ZIP fallback ---------- */
var CT=(function(){var t=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u8){var c=0xFFFFFFFF;for(var i=0;i<u8.length;i++)c=CT[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function zip(entries){
 var enc=new TextEncoder(),parts=[],central=[],off=0;
 entries.forEach(function(e){
  var name=enc.encode(e.name),crc=crc32(e.u8),sz=e.u8.length;
  var lh=new DataView(new ArrayBuffer(30));
  lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);
  lh.setUint16(8,0,true);lh.setUint16(10,0,true);lh.setUint16(12,0,true);
  lh.setUint32(14,crc,true);lh.setUint32(18,sz,true);lh.setUint32(22,sz,true);
  lh.setUint16(26,name.length,true);lh.setUint16(28,0,true);
  parts.push(new Uint8Array(lh.buffer),name,e.u8);
  var ch=new DataView(new ArrayBuffer(46));
  ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);
  ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);ch.setUint16(12,0,true);ch.setUint16(14,0,true);
  ch.setUint32(16,crc,true);ch.setUint32(20,sz,true);ch.setUint32(24,sz,true);
  ch.setUint16(28,name.length,true);ch.setUint16(30,0,true);ch.setUint16(32,0,true);
  ch.setUint16(34,0,true);ch.setUint16(36,0,true);ch.setUint32(38,0,true);ch.setUint32(42,off,true);
  central.push(new Uint8Array(ch.buffer),name);off+=30+name.length+sz});
 var cs=0;central.forEach(function(c){cs+=c.length});
 var end=new DataView(new ArrayBuffer(22));
 end.setUint32(0,0x06054b50,true);end.setUint16(8,entries.length,true);end.setUint16(10,entries.length,true);
 end.setUint32(12,cs,true);end.setUint32(16,off,true);
 return new Blob(parts.concat(central,[new Uint8Array(end.buffer)]),{type:'application/zip'})}
async function downloadZip(){
 if(!GEN['icon-192.png'])generate();
 var entries=[];
 for(var f in GEN){entries.push({name:f,u8:new Uint8Array(await (await fetch(GEN[f])).arrayBuffer())})}
 entries.push({name:'manifest.webmanifest',u8:new TextEncoder().encode(manifestTxt())});
 entries.push({name:'.well-known/assetlinks.json',u8:new TextEncoder().encode(assetlinksTxt())});
 entries.push({name:'LISEZ-MOI.txt',u8:new TextEncoder().encode(
  'KEV FUSION — Pack icônes véhicule\n\n1. Dépose TOUT à la racine du dépôt GitHub Pages (dossier .well-known inclus).\n2. Commit + push, attends le déploiement.\n3. https://www.pwabuilder.com → colle l\'URL du site.\n4. Package For Stores → Android → Signing key New (garde le .keystore).\n\nGénéré le '+new Date().toLocaleString('fr-FR')+'\n')});
 var a=document.createElement('a');a.href=URL.createObjectURL(zip(entries));a.download='kev-fusion-icons.zip';a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href)},6000);
 toast('📦 ZIP icônes téléchargé')}
/* ---------- bouton secours ---------- */
var fab=null;
function showFab(){
 if(fab||PUBLISHED)return;
 fab=document.createElement('button');
 fab.id='kfIconFab';fab.type='button';fab.title='Icônes véhicule non publiées — publier / télécharger';
 fab.textContent='🚗';
 fab.style.cssText='position:fixed;right:14px;bottom:132px;z-index:950;width:54px;height:54px;border-radius:16px;border:1px solid #22c55e;background:linear-gradient(140deg,#04140c,#0b3d24);color:#a3e635;font-size:24px;cursor:pointer;box-shadow:0 10px 28px #000a,0 0 0 1px #22c55e44;display:grid;place-items:center';
 fab.addEventListener('click',function(e){e.preventDefault();openHelp()});
 document.body.appendChild(fab)}
function hideFab(){if(fab){fab.remove();fab=null}}
function openHelp(){
 var box=document.getElementById('modalBox'),modal=document.getElementById('modal');
 if(!box||!modal)return;
 box.innerHTML='<h2>🚗 Icône véhicule — publication</h2>'+
 '<p class="mut">Les PNG d\'icône ne sont pas encore sur le dépôt (PWABuilder a besoin de fichiers HTTP réels). Deux options :</p>'+
 '<div class="row" style="margin:10px 0"><button class="pri" id="kfGenPub">📡 Publier automatiquement (jeton GitHub)</button>'+
 '<button id="kfGenZip">📦 Télécharger le ZIP</button></div>'+
 '<p class="mut">Le jeton se renseigne dans <b>Admin → 📦 PWABuilder → Jeton GitHub</b> (fine-grained, <i>Contents: Read &amp; write</i>). Sans jeton, dépose le contenu du ZIP à la racine du dépôt (dossier <code>.well-known</code> inclus) puis commit.</p>'+
 '<div class="row"><button data-act="closeModal">Fermer</button></div>';
 modal.classList.remove('hid');
 document.getElementById('kfGenPub').addEventListener('click',async function(){try{await publish()}catch(e){toast('❌ '+e.message)}});
 document.getElementById('kfGenZip').addEventListener('click',downloadZip)}
/* ---------- boot ---------- */
function boot(){
 generate();injectDOM();ensureManifest();
 probe().then(function(ok){
  if(ok){hideFab();return}
  showFab();
  if(token()&&LS.get('iconAutoPublish',true)){publish().catch(function(e){toast('❌ '+e.message)})}
 }).catch(function(){showFab()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFIconGen={generate:generate,inject:injectDOM,publish:publish,zip:downloadZip,probe:probe,
 manifest:manifestTxt,assetlinks:assetlinksTxt,colors:COL,isPublished:function(){return PUBLISHED}};
})();
