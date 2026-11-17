/* KEV FUSION 2026 — icon-gen.js v3.0.0
   Icône rallye RÉELLE servie par le dépôt : icon.svg (+ PNG générés par le workflow).
   · injecte les vrais fichiers (jamais de blob manifest quand le manifest HTTP existe)
   · sonde les PNG et affiche l'état PWABuilder
   · publication GitHub optionnelle (jeton admin) — rasterise icon.svg côté navigateur
   · ouvre le studio icons.html */
(function(){
'use strict';
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
function $(s){return document.querySelector(s)}
function toast(m){if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3000)}
var ST=Object.assign({bg1:'#04140c'},LS.g('iconStyle3',{}));
var SRC='',CAR='',GEN={},PUBLISHED=null;
var ANY=[16,32,48,64,72,96,128,144,152,192,384,512],MASK=[192,512],APPLE=[180,167,152,120];
function load(){return fetch('icon.svg?g='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.text():''})
 .then(function(t){SRC=t;var m=t.match(/<!--CAR-->([\s\S]*?)<!--\/CAR-->/);CAR=m?m[1]:'';return !!CAR}).catch(function(){return false})}
function svgFor(size,mask){
 if(!CAR)return '';
 var raw=SRC,defs=raw.match(/<defs>[\s\S]*?<\/defs>/),bg=defs?defs[0]:'';
 var head=raw.split('<!--CAR-->')[0].replace(/<svg[^>]*>/,'').replace(/<defs>[\s\S]*?<\/defs>/,'');
 var rx=mask?0:116,k=mask?0.76:1;
 head=head.replace(/rx="116"/g,'rx="'+rx+'"');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="'+size+'" height="'+size+'">'+bg+head+
  '<g transform="translate(256 262) scale('+k+') translate(-256 -262)">'+CAR+'</g></svg>'}
function raster(size,mask){
 return new Promise(function(res){
  var svg=svgFor(size,mask);if(!svg){res(null);return}
  var im=new Image();
  im.onload=function(){var q=2,c=document.createElement('canvas');c.width=c.height=size*q;
   c.getContext('2d').drawImage(im,0,0,size*q,size*q);
   var o=document.createElement('canvas');o.width=o.height=size;
   var oc=o.getContext('2d');oc.imageSmoothingQuality='high';oc.drawImage(c,0,0,size,size);
   res(o.toDataURL('image/png'))};
  im.onerror=function(){res(null)};
  im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)})}
async function generate(){
 GEN={};
 for(var i=0;i<ANY.length;i++){var d=await raster(ANY[i],false);if(d)GEN['icon-'+ANY[i]+'.png']=d}
 for(var j=0;j<MASK.length;j++){var m=await raster(MASK[j],true);if(m)GEN['icon-'+MASK[j]+'-maskable.png']=m}
 for(var a=0;a<APPLE.length;a++){var ap=await raster(APPLE[a],true);if(ap)GEN['apple-'+APPLE[a]+'.png']=ap}
 if(GEN['apple-180.png'])GEN['apple-touch-icon.png']=GEN['apple-180.png'];
 if(GEN['icon-32.png'])GEN['favicon-32.png']=GEN['icon-32.png'];
 if(GEN['icon-16.png'])GEN['favicon-16.png']=GEN['icon-16.png'];
 return GEN}
function inject(){
 Array.prototype.forEach.call(document.querySelectorAll('link[data-kfgen]'),function(n){n.remove()});
 function add(rel,href,type,sz){var l=document.createElement('link');l.rel=rel;l.href=href;
  if(type)l.type=type;if(sz)l.setAttribute('sizes',sz);l.setAttribute('data-kfgen','1');document.head.appendChild(l)}
 add('icon','icon.svg','image/svg+xml','any');
 if(PUBLISHED){add('icon','icon-32.png','image/png','32x32');add('icon','icon-192.png','image/png','192x192');
  add('apple-touch-icon','apple-touch-icon.png',null,'180x180')}
 else if(GEN['icon-192.png']){add('icon',GEN['icon-32.png'],'image/png','32x32');
  add('apple-touch-icon',GEN['apple-touch-icon.png']||GEN['icon-192.png'],null,'180x180')}
 function meta(n,c){var m=document.querySelector('meta[name="'+n+'"]');
  if(!m){m=document.createElement('meta');m.setAttribute('name',n);document.head.appendChild(m)}m.setAttribute('content',c)}
 meta('theme-color',ST.bg1||'#04140c');meta('apple-mobile-web-app-capable','yes');
 meta('apple-mobile-web-app-status-bar-style','black-translucent');meta('apple-mobile-web-app-title','KEV FUSION');
 meta('msapplication-TileColor',ST.bg1||'#04140c');
 /* le manifest HTTP n'est JAMAIS remplacé : PWABuilder doit pouvoir le lire */
 var ml=document.querySelector('link[rel="manifest"]');
 if(ml&&/^blob:/.test(ml.href)){ml.href='manifest.webmanifest';ml.removeAttribute('data-kfgen')}
 if(!ml){ml=document.createElement('link');ml.rel='manifest';ml.href='manifest.webmanifest';document.head.appendChild(ml)}}
function probe(){
 return Promise.all(['icon-192.png','icon-512.png','icon-512-maskable.png'].map(function(f){
  return fetch(f+'?g='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok}).catch(function(){return false})}))
 .then(function(a){PUBLISHED=a.every(Boolean);return PUBLISHED})}
function repo(){var h=location.hostname,m=h.match(/^([^.]+)\.github\.io$/);
 var seg=location.pathname.split('/').filter(Boolean);
 return Object.assign({owner:m?m[1]:'expertkevin06-cell',repo:(m&&seg.length)?seg[0]:'kev-fusion',branch:'main'},LS.g('ghCfg',{}))}
function token(){return (LS.g('ghToken','')||'').trim()}
function b64(u8){var o='';for(var i=0;i<u8.length;i+=0x8000)o+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(o)}
async function put(path,data,isText){
 var c=repo(),tk=token();if(!tk)throw new Error('jeton GitHub absent');
 var api='https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/'+path,sha=null;
 try{var g=await fetch(api+'?ref='+encodeURIComponent(c.branch),{headers:{Authorization:'Bearer '+tk,Accept:'application/vnd.github+json'}});
  if(g.ok)sha=(await g.json()).sha}catch(e){}
 var body={message:'KEV FUSION · icône rallye '+path,content:isText?b64(new TextEncoder().encode(data)):b64(data),branch:c.branch};
 if(sha)body.sha=sha;
 var r=await fetch(api,{method:'PUT',headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify(body)});
 if(!r.ok)throw new Error(path+' → HTTP '+r.status);return r.json()}
function manifestTxt(){
 var icons=[{src:'icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'},
  {src:'icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
  {src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
  {src:'icon-192-maskable.png',sizes:'192x192',type:'image/png',purpose:'maskable'},
  {src:'icon-512-maskable.png',sizes:'512x512',type:'image/png',purpose:'maskable'}];
 [144,96,72,48,32,16].forEach(function(s){icons.push({src:'icon-'+s+'.png',sizes:s+'x'+s,type:'image/png',purpose:'any'})});
 return JSON.stringify({name:'KEV FUSION 2026 — Expert Auto & Droit',short_name:'KEV FUSION',
  description:'Expert automobile & avocat : pannes corrélées, DTC, campagnes de rappel, TSB, étude incendie, juridique, VIN, OBD.',
  id:'./index.html',start_url:'./index.html',scope:'./',display:'standalone',
  display_override:['standalone','minimal-ui'],orientation:'any',lang:'fr',dir:'ltr',
  theme_color:ST.bg1||'#04140c',background_color:ST.bg1||'#04140c',
  categories:['productivity','utilities','business','education'],icons:icons,
  shortcuts:[{name:'Recherche prédictive',short_name:'Recherche',url:'./index.html?view=recherche',icons:[{src:'icon-96.png',sizes:'96x96'}]},
   {name:'Étude corrélée',short_name:'Étude',url:'./index.html?view=etude',icons:[{src:'icon-96.png',sizes:'96x96'}]},
   {name:'JusteRepère',short_name:'Juridique',url:'./index.html?view=jr',icons:[{src:'icon-96.png',sizes:'96x96'}]},
   {name:'Studio icônes',short_name:'Icônes',url:'./icons.html',icons:[{src:'icon-96.png',sizes:'96x96'}]}]},null,2)}
function assetTxt(){var s=LS.g('pwaStudio',{})||{};
 return JSON.stringify([{relation:['delegate_permission/common.handle_all_urls'],
  target:{namespace:'android_app',package_name:s.pkg||'io.github.expertkevin06_cell.kevfusion',
   sha256_cert_fingerprints:[s.fp||'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99']}}],null,2)}
async function publish(){
 if(!token()){toast('🔑 Admin → Jeton GitHub, puis relance');studio();return false}
 if(!CAR)await load();
 if(!CAR){toast('❌ icon.svg absent du dépôt');return false}
 if(!Object.keys(GEN).length)await generate();
 var keys=Object.keys(GEN),n=0,total=keys.length+2;
 for(var i=0;i<keys.length;i++){
  var u8=new Uint8Array(await (await fetch(GEN[keys[i]])).arrayBuffer());
  await put(keys[i],u8,false);n++;if(n%6===0)toast('📡 '+n+'/'+total)}
 await put('manifest.webmanifest',manifestTxt(),true);
 await put('.well-known/assetlinks.json',assetTxt(),true);
 LS.s('iconPublished',Date.now());LS.s('iconVer','3.0');PUBLISHED=true;inject();dot();
 toast('✅ Icônes rallye + manifest publiés');return true}
function studio(){location.href='icons.html'}
async function zip(){
 var a=document.createElement('a');
 if(!Object.keys(GEN).length)await generate();
 var CT=(function(){var t=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
 function crc(u8){var c=0xFFFFFFFF;for(var i=0;i<u8.length;i++)c=CT[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
 var files=[];for(var k in GEN)files.push({name:k,u8:new Uint8Array(await (await fetch(GEN[k])).arrayBuffer())});
 files.push({name:'icon.svg',u8:new TextEncoder().encode(SRC)});
 files.push({name:'manifest.webmanifest',u8:new TextEncoder().encode(manifestTxt())});
 files.push({name:'.well-known/assetlinks.json',u8:new TextEncoder().encode(assetTxt())});
 var enc=new TextEncoder(),parts=[],cen=[],off=0;
 files.forEach(function(f){var nm=enc.encode(f.name),cc=crc(f.u8),sz=f.u8.length;
  var lh=new DataView(new ArrayBuffer(30));
  lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);
  lh.setUint32(14,cc,true);lh.setUint32(18,sz,true);lh.setUint32(22,sz,true);lh.setUint16(26,nm.length,true);
  parts.push(new Uint8Array(lh.buffer),nm,f.u8);
  var ch=new DataView(new ArrayBuffer(46));
  ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);
  ch.setUint32(16,cc,true);ch.setUint32(20,sz,true);ch.setUint32(24,sz,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
  cen.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+sz});
 var cs=0;cen.forEach(function(c){cs+=c.length});
 var e=new DataView(new ArrayBuffer(22));
 e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);
 e.setUint32(12,cs,true);e.setUint32(16,off,true);
 a.href=URL.createObjectURL(new Blob(parts.concat(cen,[new Uint8Array(e.buffer)]),{type:'application/zip'}));
 a.download='kev-fusion-rally-icons.zip';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},6000);
 toast('📦 ZIP téléchargé')}
function dot(){var d=$('#igDot');if(d)d.style.display=PUBLISHED?'none':'grid'}
function fab(){
 if($('#igFab'))return;
 var s=document.createElement('style');
 s.textContent='#igFab{position:fixed;right:14px;bottom:190px;z-index:940;width:54px;height:54px;border-radius:17px;'+
 'border:1px solid #25c257;background:linear-gradient(145deg,#06180f,#123a24);color:#a3e635;font-size:24px;cursor:pointer;'+
 'display:grid;place-items:center;box-shadow:0 12px 30px #000b,0 0 0 1px #25c25744}'+
 '#igFab:hover{transform:translateY(-2px);box-shadow:0 16px 36px #000c,0 0 22px #25c25755}'+
 '#igFab i{position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:#ffb020;'+
 'border:2px solid #04140c;font-style:normal;font-size:9px;line-height:12px;color:#04140c;font-weight:900;display:grid;place-items:center}';
 document.head.appendChild(s);
 var b=document.createElement('button');b.id='igFab';b.type='button';
 b.title='Icône rallye — studio & publication PWABuilder';b.innerHTML='🏁<i id="igDot">!</i>';
 b.addEventListener('click',function(e){e.preventDefault();studio()});
 document.body.appendChild(b);dot()}
function boot(){
 fab();
 load().then(function(ok){
  if(!ok)return;
  return probe().then(function(){inject();
   if(!PUBLISHED)return generate().then(function(){inject()});
  })}).catch(function(){});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFIconGen={generate:generate,inject:inject,publish:publish,zip:zip,probe:probe,studio:studio,
 manifest:manifestTxt,assetlinks:assetTxt,isPublished:function(){return PUBLISHED}};
})();
