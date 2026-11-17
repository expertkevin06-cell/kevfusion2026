/* KEV FUSION 2026 — icons_auto.js v1.0.0
   Icône VÉHICULE intégrée automatiquement pour PWABuilder :
   · SVG servi (icon.svg / icon-maskable.svg) + rasterisation PNG automatique (192/512 any + maskable, Apple, favicons)
   · injection immédiate dans le DOM (icône visible dès l'installation)
   · publication automatique des fichiers sur le dépôt GitHub (1 clic / auto si jeton) + manifest régénéré
   · sondage HTTP réel des fichiers, ZIP de secours, ouverture PWABuilder
   · studio live : 12 réglages appliqués instantanément, aperçu appareil, reset / aléatoire / export. */
(function(){
'use strict';
var LS={get:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
function $(s){return document.querySelector(s)}
function $$(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(m){if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},2800)}
function shade(hex,f){var n=parseInt(String(hex).slice(1),16);
 var r=Math.max(0,Math.min(255,Math.round(((n>>16)&255)*f))),g=Math.max(0,Math.min(255,Math.round(((n>>8)&255)*f))),b=Math.max(0,Math.min(255,Math.round((n&255)*f)));
 return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}
/* ---------------- état ---------------- */
var DEF={car:'#22c55e',rim:'#a3e635',bg1:'#04140c',bg2:'#0b3d24',beam:'#f4ffe0',
 scale:100,dy:2,rot:0,radius:22,pad:15,glow:34,grain:12,spoiler:true,badge:true,badgeText:'KEV FUSION',safe:false};
var ST=Object.assign({},DEF,LS.get('iconAuto',{}));
var PUB=[512,192,144,96,48,32,16],MASK=[512,192],APPLE=[180,167,152,120];
var CACHE={},BLOBS={},PROBE={},busy=false,raf=0;
/* ---------------- SVG véhicule ---------------- */
function svg(mask){
 var s=ST,sc=(mask?3.35:4.55)*(s.scale/100),ty=(mask?250:268)+(s.dy/100)*512;
 var rad=mask?0:Math.round(s.radius/100*256);
 var g1=shade(s.car,1.55),g2=shade(s.car,1.18),g3=s.car,g4=shade(s.car,.48);
 var dark=shade(s.car,.34),dark2=shade(s.car,.26),mid=shade(s.car,.62);
 var rimL=shade(s.rim,1.35),rimD=shade(s.rim,.58),rimS=shade(s.rim,.42);
 var bgL=shade(s.bg2,1.25);
 var spokes='';
 [-27,29.4].forEach(function(cx){
  for(var i=0;i<5;i++){var a=-Math.PI/2+i*Math.PI*2/5;
   spokes+='<path d="M'+cx+' 12 L'+(cx+Math.cos(a)*5.1).toFixed(2)+' '+(12+Math.sin(a)*5.1).toFixed(2)+'"/>'}});
 var grain='';
 if(s.grain>0){var op=(s.grain/100*0.09).toFixed(3);
  grain='<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/>'
   +'<feColorMatrix type="saturate" values="0"/></filter>'
   +'<rect width="512" height="512" filter="url(#gr)" opacity="'+op+'"/>'}
 var glow=s.glow>0?'<ellipse cx="256" cy="'+(ty+20)+'" rx="'+(150*(s.glow/100)+90)+'" ry="'+(40*(s.glow/100)+18)+'" fill="'+s.car+'" opacity="'+(s.glow/100*0.30).toFixed(3)+'"/>':'';
 var spoiler=s.spoiler?'<rect x="-49" y="-14.4" width="13" height="1.1" fill="'+g2+'"/>'
  +'<rect x="-49" y="-13.6" width="13" height="3.1" fill="'+g4+'"/>'
  +'<rect x="-46" y="-10.8" width="3.2" height="8.4" fill="'+dark+'"/>':'';
 var badge=(!mask&&s.badge&&s.badgeText)?'<rect y="452" width="512" height="60" fill="'+s.bg1+'" opacity=".55"/>'
  +'<text x="256" y="490" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="30" font-weight="800" letter-spacing="7" text-anchor="middle" fill="'+s.rim+'">'+esc(s.badgeText).toUpperCase()+'</text>':'';
 var safe=(s.safe&&mask)?'<circle cx="256" cy="256" r="205" fill="none" stroke="#a3e635" stroke-width="3" stroke-dasharray="10 8" opacity=".85"/>'
  +'<rect x="51" y="51" width="410" height="410" fill="none" stroke="#a3e635" stroke-width="1.6" opacity=".3"/>':'';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">'
 +'<defs>'
 +'<radialGradient id="b" cx="34%" cy="26%" r="82%"><stop offset="0" stop-color="'+bgL+'"/><stop offset="58%" stop-color="'+s.bg2+'"/><stop offset="100%" stop-color="'+s.bg1+'"/></radialGradient>'
 +'<linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+g1+'"/><stop offset="34%" stop-color="'+g2+'"/><stop offset="62%" stop-color="'+g3+'"/><stop offset="100%" stop-color="'+g4+'"/></linearGradient>'
 +'<linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+shade(s.bg1,1.1)+'"/><stop offset="50%" stop-color="'+shade(s.bg2,.85)+'"/><stop offset="100%" stop-color="'+shade(s.bg1,1.1)+'"/></linearGradient>'
 +'<radialGradient id="r" cx="35%" cy="32%" r="70%"><stop offset="0" stop-color="'+rimL+'"/><stop offset="100%" stop-color="'+rimD+'"/></radialGradient>'
 +'<linearGradient id="bm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="'+s.beam+'" stop-opacity=".95"/><stop offset="100%" stop-color="'+s.beam+'" stop-opacity="0"/></linearGradient>'
 +(rad?'<clipPath id="rd"><rect width="512" height="512" rx="'+rad+'"/></clipPath>':'')
 +grain
 +'</defs>'
 +'<g'+(rad?' clip-path="url(#rd)"':'')+'>'
 +'<rect width="512" height="512" fill="url(#b)"/>'
 +'<circle cx="176" cy="132" r="150" fill="'+s.rim+'" opacity=".07"/>'
 +glow
 +'<g transform="translate(256 '+ty.toFixed(1)+') rotate('+s.rot+') scale('+sc.toFixed(3)+')">'
 +'<ellipse cx="0" cy="17" rx="48" ry="4.4" fill="#000" opacity=".5"/>'
 +spoiler
 +'<path d="M-46 10 L-44.6 1.2 Q-31 -2.4 -18.4 -4.6 Q-8.4 -16.2 6 -16 Q19 -14.6 26.4 -6.2 Q38.4 -3.2 46.6 1.4 L47.8 8 Q47.8 12 42 12 L-42 12 Q-46 12 -46 10 Z" fill="url(#c)"/>'
 +'<path d="M-44.6 1.6 Q-31 -2 -18.4 -4.2 Q-8.4 -14.6 6 -14.4 Q18 -13.2 25 -6.6 L20.6 -5.6 Q11 -11.8 5 -12 Q-6.4 -12.2 -16.6 -2.8 Z" fill="#ffffff" opacity=".24"/>'
 +'<path d="M-13.8 -5.2 Q-6.4 -13.8 5 -13.7 Q15.6 -12.6 22 -6.4 L2 -6.4 Z" fill="url(#w)"/>'
 +'<path d="M-11 -6.2 Q-5 -12 3 -12 L3 -10.4 Q-4 -10.4 -9 -6.2 Z" fill="'+s.rim+'" opacity=".22"/>'
 +'<path d="M-26 3 L-10.4 1.2 L-13 9.4 L-28 9.4 Z" fill="'+dark+'"/>'
 +'<path d="M23 7.4 L41 6.2 L41 10.6 L23 10.6 Z" fill="'+dark2+'"/>'
 +'<rect x="-8.6" y="-4.8" width="2.6" height="7.4" fill="'+mid+'"/>'
 +'<path d="M12 -6.4 L19 -6.4 L17.4 -3.6 L11 -3.6 Z" fill="'+shade(s.car,.42)+'"/>'
 +'<path d="M39.6 .2 L46.8 2.4 L45.6 6 L38.8 3.8 Z" fill="'+s.beam+'"/>'
 +'<path d="M46.8 2.4 L53 .6 L53 7.6 L45.6 6 Z" fill="url(#bm)"/>'
 +'<rect x="-46.4" y="3.4" width="3.4" height="3.2" fill="#ff3b30"/>'
 +[-27,29.4].map(function(cx){return '<circle cx="'+cx+'" cy="12" r="8.9" fill="#05070a"/>'
  +'<circle cx="'+cx+'" cy="12" r="7.7" fill="none" stroke="#161d26" stroke-width="1.5"/>'
  +'<circle cx="'+cx+'" cy="12" r="5.5" fill="url(#r)"/>'}).join('')
 +'<g stroke="'+rimS+'" stroke-width="1.15">'+spokes+'</g>'
 +'<circle cx="-27" cy="12" r="1.6" fill="#0a0e13"/><circle cx="29.4" cy="12" r="1.6" fill="#0a0e13"/>'
 +'</g>'+badge+'</g>'+safe+'</svg>'}
function svgURL(mask){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(mask))}
function raster(size,mask){
 return new Promise(function(res,rej){
  var img=new Image();
  img.onload=function(){
   var c=document.createElement('canvas');c.width=c.height=size;
   var x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(img,0,0,size,size);
   c.toBlob(function(b){if(!b){rej(new Error('toBlob null'));return}res(b)},'image/png')};
  img.onerror=function(){rej(new Error('SVG non rasterisable'))};
  img.src=svgURL(mask)})}
function b64(u8){var o='',CH=0x8000;for(var i=0;i<u8.length;i+=CH)o+=String.fromCharCode.apply(null,u8.subarray(i,i+CH));return btoa(o)}
function dl(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},6000)}
/* ---------------- manifest ---------------- */
function base(){var p=location.pathname.replace(/[^/]*$/,'');return p||'/'}
function site(){return location.origin+base()}
function manifest(){
 var P=function(f){return base()+f},ic=[];
 ic.push({src:P('icon.svg'),sizes:'any',type:'image/svg+xml',purpose:'any'});
 ic.push({src:P('icon-192.png'),sizes:'192x192',type:'image/png',purpose:'any'});
 ic.push({src:P('icon-512.png'),sizes:'512x512',type:'image/png',purpose:'any'});
 ic.push({src:P('icon-192-maskable.png'),sizes:'192x192',type:'image/png',purpose:'maskable'});
 ic.push({src:P('icon-512-maskable.png'),sizes:'512x512',type:'image/png',purpose:'maskable'});
 ic.push({src:P('apple-touch-icon.png'),sizes:'180x180',type:'image/png',purpose:'any'});
 [144,96,48,32,16].forEach(function(s){ic.push({src:P('icon-'+s+'.png'),sizes:s+'x'+s,type:'image/png',purpose:'any'})});
 return{name:'KEV FUSION 2026 — Expert Auto & Droit',short_name:'KEV FUSION',
  description:'Expert automobile & avocat : corrélation par code moteur, pannes connues, DTC, campagnes de rappel, TSB, étude incendie, juridique, VIN, OBD.',
  id:base()+'index.html',start_url:base()+'index.html',scope:base(),
  display:'standalone',display_override:['standalone','minimal-ui'],orientation:'any',lang:'fr',dir:'ltr',
  theme_color:ST.bg1,background_color:ST.bg1,categories:['productivity','utilities','business','education'],
  icons:ic,shortcuts:[
   {name:'Recherche prédictive',short_name:'Recherche',url:base()+'index.html?view=recherche',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'Étude corrélée',short_name:'Étude',url:base()+'index.html?view=etude',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'JusteRepère',short_name:'Juridique',url:base()+'index.html?view=jr',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'Icône PWABuilder',short_name:'Icône',url:base()+'index.html?view=icone',icons:[{src:P('icon-96.png'),sizes:'96x96'}]}]}}
function manifestTxt(){return JSON.stringify(manifest(),null,2)}
/* ---------------- génération / injection ---------------- */
async function build(){
 CACHE={};BLOBS={};
 for(var i=0;i<PUB.length;i++){var s=PUB[i],b=await raster(s,false);BLOBS['icon-'+s+'.png']=b;CACHE['icon-'+s+'.png']=await toURL(b)}
 for(var j=0;j<MASK.length;j++){var m=MASK[j],bm=await raster(m,true);BLOBS['icon-'+m+'-maskable.png']=bm;CACHE['icon-'+m+'-maskable.png']=await toURL(bm)}
 for(var k=0;k<APPLE.length;k++){var a=APPLE[k],ba=await raster(a,false);var nm=a===180?'apple-touch-icon.png':'apple-touch-icon-'+a+'.png';BLOBS[nm]=ba;CACHE[nm]=await toURL(ba)}
 BLOBS['icon.svg']=new Blob([svg(false)],{type:'image/svg+xml'});
 BLOBS['icon-maskable.svg']=new Blob([svg(true)],{type:'image/svg+xml'});
 CACHE['icon.svg']=svgURL(false);CACHE['icon-maskable.svg']=svgURL(true);
 BLOBS['manifest.webmanifest']=new Blob([manifestTxt()],{type:'application/manifest+json'});
 LS.set('iconBuilt',Date.now());
 return CACHE}
function toURL(b){return new Promise(function(r){var f=new FileReader();f.onload=function(){r(f.result)};f.readAsDataURL(b)})}
function inject(){
 if(!CACHE['icon-192.png'])return;
 $$('link[data-kficon]').forEach(function(n){n.remove()});
 var add=function(rel,href,sizes,type){var l=document.createElement('link');l.rel=rel;l.href=href;
  if(sizes)l.setAttribute('sizes',sizes);if(type)l.type=type;l.setAttribute('data-kficon','1');document.head.appendChild(l)};
 add('icon',CACHE['icon.svg'],'any','image/svg+xml');
 add('icon',CACHE['icon-32.png'],'32x32','image/png');
 add('icon',CACHE['icon-192.png'],'192x192','image/png');
 add('apple-touch-icon',CACHE['apple-touch-icon.png'],'180x180');
 var meta=function(n,c){var m=document.querySelector('meta[name="'+n+'"]');
  if(!m){m=document.createElement('meta');m.name=n;document.head.appendChild(m)}m.content=c};
 meta('theme-color',ST.bg1);meta('apple-mobile-web-app-title','KEV FUSION');
 meta('apple-mobile-web-app-capable','yes');meta('apple-mobile-web-app-status-bar-style','black-translucent')}
/* ---------------- GitHub ---------------- */
function repo(){var h=location.hostname,m=h.match(/^([^.]+)\.github\.io$/);
 var seg=location.pathname.split('/').filter(Boolean);
 return Object.assign({owner:m?m[1]:'expertkevin06-cell',repo:(m&&seg.length)?seg[0]:'kev-fusion',branch:'main'},LS.get('ghCfg',{}))}
function token(){return (LS.get('ghToken','')||'').trim()}
async function put(path,blobOrText,isText){
 var c=repo(),tk=token();if(!tk)throw new Error('jeton GitHub absent');
 var api='https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/'+path,sha=null;
 try{var g=await fetch(api+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now(),{headers:{Authorization:'Bearer '+tk,Accept:'application/vnd.github+json'},cache:'no-store'});
  if(g.ok){var j=await g.json();sha=j.sha}}catch(e){}
 var content=isText?btoa(unescape(encodeURIComponent(blobOrText))):b64(new Uint8Array(await blobOrText.arrayBuffer()));
 var body={message:'KEV FUSION · icône véhicule PWA — '+path,content:content,branch:c.branch};if(sha)body.sha=sha;
 var r=await fetch(api,{method:'PUT',headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify(body)});
 if(!r.ok){var t=await r.text().catch(function(){return''});throw new Error(path+' → HTTP '+r.status+' '+t.slice(0,120))}
 return r.json()}
function prog(n,t,l){var b=$('#iaProg'),x=$('#iaProgTxt');if(b)b.style.width=(t?Math.round(n/t*100):0)+'%';if(x)x.textContent=l}
async function publish(){
 if(busy)return;busy=true;
 try{
  if(!token()){prog(0,1,'❌ Jeton GitHub requis (champ ci-contre) — ou utilise le ZIP.');toast('🔑 Jeton GitHub requis');busy=false;return}
  if(!BLOBS['icon-512.png'])await build();
  var files=['icon.svg','icon-maskable.svg','icon-512.png','icon-192.png','icon-512-maskable.png','icon-192-maskable.png','apple-touch-icon.png','icon-144.png','icon-96.png','icon-48.png','icon-32.png','icon-16.png','manifest.webmanifest'];
  prog(0,files.length,'Publication…');
  for(var i=0;i<files.length;i++){var f=files[i];
   await put(f,f==='manifest.webmanifest'?manifestTxt():BLOBS[f],f==='manifest.webmanifest');
   prog(i+1,files.length,'✅ '+f)}
  LS.set('iconPublished',Date.now());
  prog(files.length,files.length,'🎉 Publié — déploiement Pages ~1 min, puis ouvre PWABuilder.');
  toast('📡 Icône véhicule + manifest publiés');
  setTimeout(function(){probe().then(paint)},4000);
 }catch(e){prog(0,1,'❌ '+e.message);toast('GitHub : '+e.message)}
 busy=false;paint()}
async function autoPublish(){
 if(!token()||LS.get('iconPublished',0))return;
 var ok=await probe();
 var need=['icon-192.png','icon-512.png','icon-512-maskable.png'].some(function(f){return ok[f]!==200});
 if(need){try{await build();await publish()}catch(e){}}}
/* ---------------- probe ---------------- */
async function probe(){
 PROBE={};
 var list=['icon.svg','icon-192.png','icon-512.png','icon-192-maskable.png','icon-512-maskable.png','apple-touch-icon.png','manifest.webmanifest'];
 for(var i=0;i<list.length;i++){var f=list[i];
  try{var r=await fetch(f+'?probe='+Date.now(),{cache:'no-store'});PROBE[f]=r.ok?200:r.status}catch(e){PROBE[f]=0}}
 return PROBE}
/* ---------------- ZIP ---------------- */
var CT=(function(){var t=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc(u8){var c=0xFFFFFFFF;for(var i=0;i<u8.length;i++)c=CT[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function zip(es){var enc=new TextEncoder(),parts=[],cen=[],off=0;
 es.forEach(function(e){var nm=enc.encode(e.name),cc=crc(e.u8),sz=e.u8.length;
  var lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);
  lh.setUint32(14,cc,true);lh.setUint32(18,sz,true);lh.setUint32(22,sz,true);lh.setUint16(26,nm.length,true);
  parts.push(new Uint8Array(lh.buffer),nm,e.u8);
  var ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);
  ch.setUint16(8,0x0800,true);ch.setUint32(16,cc,true);ch.setUint32(20,sz,true);ch.setUint32(24,sz,true);
  ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);cen.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+sz});
 var cs=0;cen.forEach(function(c){cs+=c.length});
 var en=new DataView(new ArrayBuffer(22));en.setUint32(0,0x06054b50,true);en.setUint16(8,es.length,true);en.setUint16(10,es.length,true);
 en.setUint32(12,cs,true);en.setUint32(16,off,true);
 return new Blob(parts.concat(cen,[new Uint8Array(en.buffer)]),{type:'application/zip'})}
async function doZip(){
 if(!BLOBS['icon-512.png'])await build();
 var es=[];for(var k in BLOBS){es.push({name:k,u8:new Uint8Array(await BLOBS[k].arrayBuffer())})}
 es.push({name:'LISEZ-MOI.txt',u8:new TextEncoder().encode(
  'KEV FUSION 2026 — Icône véhicule PWA\n\n1. Dépose TOUT ce contenu à la racine du dépôt GitHub Pages.\n'
  +'2. Commit + push, attends le déploiement.\n3. Dans l\'app : onglet 🚗 Icône → « Sonder les fichiers » doit tout afficher ✓.\n'
  +'4. https://www.pwabuilder.com → '+site()+'\n5. Package For Stores → Android → Signing key New (garde le .keystore).\n\nGénéré le '+new Date().toLocaleString('fr-FR')+'\n')});
 dl(zip(es),'kev-fusion-icone-vehicule.zip');toast('📦 ZIP icône téléchargé ('+es.length+' fichiers)')}
/* ---------------- vue ---------------- */
function rng(id,label,min,max,unit){
 return '<div class="ia-ctl"><div class="ia-h"><label for="ia_'+id+'">'+label+'</label><output id="iao_'+id+'">'+ST[id]+(unit||'')+'</output></div>'
 +'<input type="range" id="ia_'+id+'" data-ia="'+id+'" min="'+min+'" max="'+max+'" value="'+ST[id]+'"></div>'}
function render(){
 var v=$('#view');if(!v)return;var r=repo();
 v.innerHTML=
 '<div class="card ia-hero"><div class="ia-hl"><span class="ia-tag">ICÔNE VÉHICULE · PWA</span>'
 +'<h1>Icône intégrée automatiquement</h1>'
 +'<p class="mut">Le véhicule est vectoriel (<code>icon.svg</code>) puis rastérisé en <b>PNG 192 / 512 + maskable + Apple + favicons</b>, '
 +'injecté dans l\'app instantanément et <b>publié sur ton dépôt</b> avec le manifest régénéré — exactement ce que PWABuilder exige.</p>'
 +'<p class="ia-url">Cible : <b>'+esc(site())+'</b><br>Dépôt : <b>'+esc(r.owner+'/'+r.repo)+'</b> · branche <b>'+esc(r.branch)+'</b></p></div>'
 +'<div class="ia-hr"><button class="pri" data-ia="publish">📡 Publier sur GitHub</button>'
 +'<button class="jr" data-ia="open">🚀 Ouvrir PWABuilder</button>'
 +'<button data-ia="probe">🔍 Sonder les fichiers</button></div></div>'
 +'<div class="ia-wrap"><section>'
 +'<div class="card"><h2>🎨 Aperçu live</h2><div class="ia-box"><canvas id="iaBig" width="512" height="512"></canvas>'
 +'<span class="ia-hint" id="iaHint">zone de sécurité maskable · 80 %</span></div>'
 +'<div class="ia-strip" id="iaStrip"></div></div>'
 +'<div class="card"><h2>📱 Rendu appareil</h2><div class="ia-dev">'
 +'<div class="ia-d"><div class="ia-home"><canvas id="iaHome" width="192" height="192"></canvas></div><span>Android<br><i>maskable</i></span></div>'
 +'<div class="ia-d"><div class="ia-ios"><canvas id="iaIos" width="180" height="180"></canvas></div><span>iOS<br><i>apple-touch</i></span></div>'
 +'<div class="ia-d"><div class="ia-splash" id="iaSplash"><canvas id="iaSp" width="128" height="128"></canvas><b>KEV FUSION</b></div><span>Splash<br><i>background</i></span></div>'
 +'<div class="ia-d"><div class="ia-tab"><canvas id="iaTab" width="32" height="32"></canvas><span>onglet</span></div><span>Navigateur<br><i>favicon</i></span></div>'
 +'</div></div>'
 +'<div class="card"><h2>🌐 Fichiers réellement servis</h2><div class="ia-probe" id="iaProbe"><span class="mut">Clique « Sonder les fichiers ».</span></div>'
 +'<p class="mut">Un ✗ signifie que le fichier n\'est pas encore sur le dépôt : PWABuilder échouera tant qu\'il n\'est pas publié.</p></div>'
 +'<div class="card"><h2>📦 Livraison</h2><div class="ia-pg"><div class="bar"><i id="iaProg" style="width:0%"></i></div><span class="mut" id="iaProgTxt">Prêt.</span></div>'
 +'<div class="row"><button class="pri" data-ia="publish">📡 Publier (icônes + manifest)</button>'
 +'<button data-ia="zip">📦 ZIP complet</button><button data-ia="png">🖼️ PNG 512</button>'
 +'<button data-ia="svg">🧬 icon.svg</button><button data-ia="mf">📄 manifest</button>'
 +'<button data-ia="up">↗ Upload GitHub</button></div>'
 +'<div class="ia-code"><h3>manifest.webmanifest généré</h3><pre id="iaMf"></pre>'
 +'<div class="row"><button data-ia="copy">📋 Copier</button></div></div></div>'
 +'</section><aside class="card ia-side"><h2>🎛️ Réglages live</h2>'
 +'<div class="ia-col">'
 +'<div><input type="color" id="ia_car" data-ia="car" value="'+ST.car+'"><span>Carrosserie</span></div>'
 +'<div><input type="color" id="ia_rim" data-ia="rim" value="'+ST.rim+'"><span>Jantes</span></div>'
 +'<div><input type="color" id="ia_bg1" data-ia="bg1" value="'+ST.bg1+'"><span>Fond 1</span></div>'
 +'<div><input type="color" id="ia_bg2" data-ia="bg2" value="'+ST.bg2+'"><span>Fond 2</span></div>'
 +'<div><input type="color" id="ia_beam" data-ia="beam" value="'+ST.beam+'"><span>Phare</span></div>'
 +'</div>'
 +rng('scale','Échelle',50,150,'%')+rng('dy','Position Y',-30,30,'')+rng('rot','Rotation',-25,25,'°')
 +rng('radius','Arrondi coins',0,50,'%')+rng('pad','Marge maskable',0,32,'%')
 +rng('glow','Halo',0,100,'%')+rng('grain','Grain',0,60,'')
 +'<div class="ia-tg"><label class="tg" id="iat_spoiler"><input type="checkbox" data-iat="spoiler"> Aileron</label>'
 +'<label class="tg" id="iat_badge"><input type="checkbox" data-iat="badge"> Badge</label>'
 +'<label class="tg" id="iat_safe"><input type="checkbox" data-iat="safe"> Zone maskable</label></div>'
 +'<div class="ia-ctl"><div class="ia-h"><label>Texte du badge</label></div><input type="text" id="ia_badgeText" data-ia="badgeText" value="'+esc(ST.badgeText)+'" maxlength="16"></div>'
 +'<div class="ia-sep"></div>'
 +'<div class="ia-ctl"><div class="ia-h"><label>Jeton GitHub</label><output>'+(token()?'✓':'—')+'</output></div>'
 +'<input type="password" id="iaToken" value="'+esc(token())+'" placeholder="github_pat_…" autocomplete="off"></div>'
 +'<div class="ia-act"><button data-ia="reset">↺ Reset</button><button data-ia="rand">🎲 Aléatoire</button>'
 +'<button data-ia="inject">💉 Injecter</button><button class="pri" data-ia="publish">📡 Publier</button></div>'
 +'<p class="mut">Chaque réglage régénère le SVG, les PNG et le manifest. « Injecter » change l\'icône de l\'app installée ; « Publier » écrit les fichiers sur le dépôt pour PWABuilder.</p>'
 +'</aside></div>';
 sync();strip();schedule();$('#iaMf').textContent=manifestTxt();bind();paintProbe();
 var tk=$('#iaToken');if(tk)tk.addEventListener('change',function(){LS.set('ghToken',tk.value.trim());toast('🔑 Jeton enregistré')})}
function sync(){
 ['car','rim','bg1','bg2','beam','badgeText'].forEach(function(k){var e=$('#ia_'+k);if(e)e.value=ST[k]});
 ['scale','dy','rot','radius','pad','glow','grain'].forEach(function(k){
  var e=$('#ia_'+k),o=$('#iao_'+k);if(e)e.value=ST[k];if(o)o.textContent=ST[k]+(k==='rot'?'°':(k==='grain'?'':'%'))});
 ['spoiler','badge','safe'].forEach(function(k){var w=$('#iat_'+k);if(!w)return;
  var i=w.querySelector('input');if(i)i.checked=!!ST[k];w.classList.toggle('on',!!ST[k])})}
function strip(){var s=$('#iaStrip');if(!s)return;s.innerHTML='';
 [192,144,96,72,48,32,16].forEach(function(n){var d=document.createElement('div');d.className='ia-th';
  var c=document.createElement('canvas');c.width=c.height=n;c.dataset.sz=n;
  var l=document.createElement('span');l.textContent=n+'px';d.appendChild(c);d.appendChild(l);s.appendChild(d)})}
function schedule(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;draw()})}
function draw(){
 var big=$('#iaBig');if(!big)return;
 var jobs=[[big,false]];
 $$('#iaStrip canvas').forEach(function(c){jobs.push([c,false])});
 var h=$('#iaHome');if(h)jobs.push([h,true]);
 var io=$('#iaIos');if(io)jobs.push([io,false]);
 var sp=$('#iaSp');if(sp)jobs.push([sp,true]);
 var tb=$('#iaTab');if(tb)jobs.push([tb,false]);
 jobs.forEach(function(j){var c=j[0],img=new Image();
  img.onload=function(){var x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.imageSmoothingQuality='high';x.drawImage(img,0,0,c.width,c.height)};
  img.src=svgURL(j[1])});
 var spl=$('#iaSplash');if(spl)spl.style.background=ST.bg1;
 var hi=$('#iaHint');if(hi)hi.style.display=ST.safe?'block':'none';
 var mf=$('#iaMf');if(mf)mf.textContent=manifestTxt()}
function paintProbe(){var el=$('#iaProbe');if(!el)return;
 var ks=Object.keys(PROBE);if(!ks.length){el.innerHTML='<span class="mut">Clique « Sonder les fichiers ».</span>';return}
 var ok=ks.filter(function(k){return PROBE[k]===200}).length;
 el.innerHTML='<div class="ia-ph"><b>'+ok+' / '+ks.length+'</b> fichiers servis en HTTP</div>'
  +ks.map(function(k){var c=PROBE[k];return '<span class="ia-pill '+(c===200?'ok':'ko')+'">'+(c===200?'✓':'✗')+' '+esc(k)+(c!==200?' <i>'+(c||'réseau')+'</i>':'')+'</span>'}).join('')}
function paint(){paintProbe();var mf=$('#iaMf');if(mf)mf.textContent=manifestTxt()}
function save(){LS.set('iconAuto',ST)}
function bind(){var root=$('#view');if(!root||root._iaB)return;root._iaB=1;
 root.addEventListener('input',function(e){var t=e.target,k=t.dataset&&t.dataset.ia;
  if(k){ST[k]=t.type==='range'?+t.value:t.value;var o=$('#iao_'+k);
   if(o)o.textContent=ST[k]+(k==='rot'?'°':(k==='grain'?'':'%'));save();schedule();return}
  var tk=t.dataset&&t.dataset.iat;
  if(tk){ST[tk]=t.checked;var w=$('#iat_'+tk);if(w)w.classList.toggle('on',t.checked);save();schedule()}})}
/* ---------------- actions ---------------- */
document.addEventListener('click',async function(e){
 var b=e.target.closest('[data-ia]');if(!b)return;var a=b.dataset.ia;
 if(['car','rim','bg1','bg2','beam','badgeText','scale','dy','rot','radius','pad','glow','grain'].indexOf(a)>=0)return;
 e.preventDefault();
 try{
  if(a==='publish'){await publish();return}
  if(a==='probe'){toast('🔍 Sondage…');await probe();paintProbe();toast('🔍 Sondage terminé');return}
  if(a==='inject'){await build();inject();toast('💉 Icône injectée dans l\'app');return}
  if(a==='zip'){await doZip();return}
  if(a==='png'){var bl=BLOBS['icon-512.png']||await raster(512,false);dl(bl,'icon-512.png');toast('🖼️ PNG 512');return}
  if(a==='svg'){dl(new Blob([svg(false)],{type:'image/svg+xml'}),'icon.svg');toast('🧬 icon.svg');return}
  if(a==='mf'){dl(new Blob([manifestTxt()],{type:'application/manifest+json'}),'manifest.webmanifest');toast('📄 manifest');return}
  if(a==='copy'){await navigator.clipboard.writeText(manifestTxt());toast('📋 manifest copié');return}
  if(a==='up'){var c=repo();window.open('https://github.com/'+c.owner+'/'+c.repo+'/upload/'+c.branch,'_blank','noopener');return}
  if(a==='open'){var u=site();try{await navigator.clipboard.writeText(u)}catch(x){}
   window.open('https://www.pwabuilder.com/reportcard?site='+encodeURIComponent(u),'_blank','noopener');toast('🚀 PWABuilder ouvert · URL copiée');return}
  if(a==='reset'){ST=Object.assign({},DEF);save();sync();schedule();toast('↺ Réinitialisé');return}
  if(a==='rand'){var pal=[['#22c55e','#a3e635','#04140c','#0b3d24'],['#ff9500','#ffd166','#160b00','#3a1d00'],
    ['#1e6fff','#38bdf8','#04101f','#0a2a52'],['#ef4444','#fbbf24','#1a0808','#3d1010'],
    ['#a78bfa','#38bdf8','#120a1e','#2b1a4d'],['#39ff14','#d8b45a','#0a1a0a','#1d3a12']];
   var p=pal[Math.floor(Math.random()*pal.length)];
   ST.car=p[0];ST.rim=p[1];ST.bg1=p[2];ST.bg2=p[3];
   ST.scale=78+Math.floor(Math.random()*40);ST.rot=Math.floor(Math.random()*17)-8;
   ST.radius=Math.floor(Math.random()*44);ST.glow=18+Math.floor(Math.random()*62);
   save();sync();schedule();toast('🎲 Palette aléatoire');return}
 }catch(x){toast('Icône : '+x.message)}});
/* ---------------- intégration nav + auto-vérif ---------------- */
function hook(){
 try{
  if(typeof NAV!=='undefined'&&Array.isArray(NAV)&&!NAV.some(function(n){return n[0]==='icone'})){
   var i=NAV.findIndex(function(n){return n[0]==='pwa'});NAV.splice(i<0?NAV.length:i,0,['icone','🚗 Icône'])}
  if(typeof window.switchView==='function'&&!window.switchView.__kfIA){
   var _sv=window.switchView;
   var w=function(v){if(v!=='icone')return _sv(v);
    if(typeof S!=='undefined')S.view='icone';
    var nav=$('#nav');if(nav&&typeof NAV!=='undefined')nav.innerHTML=NAV.map(function(n){
     return '<button data-act="nav" data-k="'+n[0]+'" class="'+(n[0]==='icone'?'act':'')+'">'+n[1]+'</button>'}).join('');
    render()};
   w.__kfIA=true;window.switchView=w}
 }catch(e){}}
function hookCheck(){
 if(typeof window.runChecks!=='function'||window.runChecks.__kfIA)return;
 var _rc=window.runChecks;
 var w=async function(){var r=await _rc.apply(this,arguments);
  try{var need=['icon.svg','icon-192.png','icon-512.png','icon-512-maskable.png'];
   var miss=need.filter(function(f){return PROBE[f]!==200});
   var st=miss.length?'warn':'ok';
   var info=miss.length?('à publier : '+miss.join(', ')):'icône véhicule servie (SVG + PNG any + maskable)';
   if(window.S&&S.check&&Array.isArray(S.check.results))S.check.results.push({name:'Icône véhicule PWA',st:st,info:info});
   var li=$('#checkList');if(li){var el=document.createElement('li');el.className='st-'+st;
    el.innerHTML='<span>'+(miss.length?'⚠️':'✅')+'</span><span><b>Icône véhicule PWA</b> — <span class="mut">'+esc(info)+'</span> '
     +'<button class="chipf" data-ia="'+(miss.length?'publish':'open')+'" style="margin-left:6px">'+(miss.length?'📡 Publier':'🚀 PWABuilder')+'</button></span>';
    li.appendChild(el)}
   if(typeof window.renderVerdict==='function')window.renderVerdict()}catch(e){}
  return r};
 w.__kfIA=true;window.runChecks=w}
/* ---------------- CSS ---------------- */
function css(){
 if($('#iaCss'))return;var s=document.createElement('style');s.id='iaCss';
 s.textContent=
 '.ia-hero{display:flex;gap:18px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;border-color:#22c55e66;background:linear-gradient(120deg,#04140c,#0b3d24 42%,#141c2e 80%)}'
 +'.ia-hl{flex:1;min-width:270px}.ia-hr{display:flex;gap:8px;flex-wrap:wrap}'
 +'.ia-tag{display:inline-block;font:800 10.5px/1 system-ui;letter-spacing:1.5px;color:#04140c;background:linear-gradient(90deg,#22c55e,#a3e635);padding:5px 10px;border-radius:8px;margin-bottom:8px}'
 +'.ia-url{margin-top:8px;font-size:12px;color:#a3e635;word-break:break-all}'
 +'.ia-wrap{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:14px;align-items:start}'
 +'@media(max-width:1000px){.ia-wrap{grid-template-columns:1fr}}'
 +'.ia-side{position:sticky;top:118px;max-height:calc(100vh - 140px);overflow:auto;border-color:#22c55e55;background:linear-gradient(160deg,#06180f,#141c2e 62%)}'
 +'@media(max-width:1000px){.ia-side{position:static;max-height:none}}'
 +'.ia-side h2{color:#a3e635}'
 +'.ia-box{position:relative;display:grid;place-items:center;padding:22px;border-radius:14px;border:1px solid #25314a;background:radial-gradient(50% 50% at 50% 38%,#22c55e1c,transparent 70%),repeating-conic-gradient(#141c2e 0% 25%,#0f1625 0% 50%) 0 0/24px 24px}'
 +'#iaBig{width:min(330px,74vw);height:auto;border-radius:24px;box-shadow:0 22px 56px #000c,0 0 0 1px #334466;transition:transform .25s}'
 +'#iaBig:hover{transform:scale(1.025) rotate(-.6deg)}'
 +'.ia-hint{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);font-size:10.5px;color:#a3e635;background:#04140cd0;padding:3px 10px;border-radius:11px;border:1px solid #a3e63544}'
 +'.ia-strip{display:flex;gap:11px;flex-wrap:wrap;align-items:flex-end;margin-top:14px}'
 +'.ia-th{display:flex;flex-direction:column;align-items:center;gap:4px}'
 +'.ia-th canvas{border-radius:8px;box-shadow:0 5px 14px #000a,0 0 0 1px #25314a;background:#0f1625}'
 +'.ia-th span{font:600 9.5px/1 ui-monospace,monospace;color:#5a6a84}'
 +'.ia-dev{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px}'
 +'.ia-d{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}'
 +'.ia-d>span{font-size:11px;color:#8899b4;line-height:1.4}.ia-d i{color:#5a6a84;font-style:normal;font-size:10px}'
 +'.ia-home{width:94px;height:94px;border-radius:27px;overflow:hidden;box-shadow:0 10px 26px #000b,0 0 0 1px #334466;background:#0f1625}'
 +'.ia-home canvas,.ia-ios canvas{width:100%;height:100%;display:block}'
 +'.ia-ios{width:90px;height:90px;border-radius:20px;overflow:hidden;box-shadow:0 10px 26px #000b,0 0 0 1px #334466}'
 +'.ia-splash{width:106px;height:144px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;box-shadow:0 10px 26px #000b,0 0 0 1px #334466}'
 +'.ia-splash canvas{width:60px;height:60px;border-radius:14px}.ia-splash b{font-size:10px;letter-spacing:1.2px;color:#e8eefc}'
 +'.ia-tab{display:flex;align-items:center;gap:7px;background:#0f1625;border:1px solid #25314a;border-radius:9px 9px 0 0;padding:7px 11px}'
 +'.ia-tab canvas{width:16px;height:16px;border-radius:3px}.ia-tab span{font-size:10.5px;color:#8899b4}'
 +'.ia-probe{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'
 +'.ia-ph{width:100%;font-size:12.5px;color:#a3e635;margin-bottom:4px}'
 +'.ia-pill{font:600 11px/1 ui-monospace,monospace;padding:5px 9px;border-radius:14px;border:1px solid #25314a;background:#0f1625;color:#8899b4}'
 +'.ia-pill.ok{border-color:#22c55e66;color:#22c55e;background:#22c55e12}'
 +'.ia-pill.ko{border-color:#ef444466;color:#ef4444;background:#ef444412}.ia-pill i{font-style:normal;opacity:.8}'
 +'.ia-pg{display:flex;align-items:center;gap:11px;margin-bottom:10px}.ia-pg .bar{flex:1;margin:0}.ia-pg span{font-size:11.5px;word-break:break-word}'
 +'.ia-code{margin-top:12px}.ia-code h3{font-size:12px;color:#a3e635;margin-bottom:5px}'
 +'.ia-code pre{background:#04140c;border:1px solid #25314a;border-radius:10px;padding:11px;font:11px/1.5 ui-monospace,monospace;color:#a3e635;max-height:230px;overflow:auto;white-space:pre;margin-bottom:6px}'
 +'.ia-col{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:12px}'
 +'.ia-col div{display:flex;flex-direction:column;gap:3px;align-items:center}'
 +'.ia-col input[type=color]{width:100%;height:32px;border:1px solid #334466;border-radius:9px;background:#0f1625;padding:2px;cursor:pointer;margin:0}'
 +'.ia-col span{font-size:9px;color:#5a6a84;text-align:center;line-height:1.2}'
 +'.ia-ctl{margin-bottom:11px}.ia-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}'
 +'.ia-h label{margin:0}.ia-h output{font:700 11px/1 ui-monospace,monospace;color:#a3e635}'
 +'.ia-side input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:6px 0 0;padding:0;border:0;background:linear-gradient(90deg,#22c55e,#a3e635,#38bdf8)}'
 +'.ia-side input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;background:#e8eefc;border:3px solid #22c55e;box-shadow:0 0 10px #22c55e99;cursor:grab}'
 +'.ia-side input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#e8eefc;border:3px solid #22c55e;cursor:grab}'
 +'.ia-tg{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:11px}'
 +'.ia-sep{height:1px;background:linear-gradient(90deg,#22c55e66,#38bdf866,transparent);margin:13px 0}'
 +'.ia-act{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:9px}'
 +'.ia-side::-webkit-scrollbar,.ia-code pre::-webkit-scrollbar{width:9px;height:9px}'
 +'.ia-side::-webkit-scrollbar-track,.ia-code pre::-webkit-scrollbar-track{background:#04140c}'
 +'.ia-side::-webkit-scrollbar-thumb,.ia-code pre::-webkit-scrollbar-thumb{background:linear-gradient(#22c55e,#38bdf8);border-radius:7px;border:2px solid #04140c}';
 document.head.appendChild(s)}
/* ---------------- boot ---------------- */
async function boot(){
 css();hook();hookCheck();
 try{await build();inject()}catch(e){console.warn('icons_auto build',e)}
 setTimeout(function(){probe().then(function(){paintProbe();autoPublish()})},1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFIconAuto={build:build,inject:inject,publish:publish,probe:probe,zip:doZip,svg:svg,manifest:manifestTxt,render:render,state:ST};
})();
