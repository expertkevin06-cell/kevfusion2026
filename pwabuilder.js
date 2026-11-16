/* KEV FUSION 2026 — pwabuilder.js v1.0.0
   Mode PWABuilder : studio d'icônes live, génération automatique du jeu complet,
   injection immédiate dans l'app, manifest + assetlinks, export ZIP, commit GitHub,
   checklist de conformité et lancement PWABuilder. Autonome, sans dépendance. */
(function(){
'use strict';
if(typeof window==='undefined')return;
const $=function(s){return document.querySelector(s)};
const esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
const LS={get:function(k,d){try{const v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
const toast=function(m){if(typeof window.toast==='function')window.toast(m);else{const t=$('#toast');if(t){t.textContent=m;t.classList.remove('hid');t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},2600)}}};

/* ================= ÉTAT ================= */
const DEF={src:'supercar',bg:'gradient',c1:'#0d1410',c2:'#1e6fff',car:'#ff9500',rim:'#d8b45a',
 scale:100,dx:0,dy:0,rot:0,radius:22,pad:14,glow:38,shadow:46,grain:14,
 badge:false,badgeText:'2026',rims:true,safe:true,grid:false,quality:2,
 pkg:'io.github.expertkevin06_cell.kevfusion',fp:''};
let ST=Object.assign({},DEF,LS.get('pwaStudio',{}));
let IMG=null,LAST={},raf=0,dirty=true;
const SIZES=[512,384,192,152,144,128,96,72,64,48,32,16];
const MASK=[512,192];
const APPLE=[180,167,152,120];

/* ================= DESSIN VECTORIEL ================= */
function shade(hex,f){const n=parseInt(String(hex).slice(1),16);
 let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
 r=Math.max(0,Math.min(255,Math.round(r*f)));g=Math.max(0,Math.min(255,Math.round(g*f)));b=Math.max(0,Math.min(255,Math.round(b*f)));
 return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
function wheel(x,cx,cy,r,rim,on){
 x.save();
 x.fillStyle='#07090c';x.beginPath();x.arc(cx,cy,r,0,7);x.fill();
 x.strokeStyle='#1b2330';x.lineWidth=r*0.16;x.beginPath();x.arc(cx,cy,r*0.86,0,7);x.stroke();
 const g=x.createRadialGradient(cx-r*0.2,cy-r*0.2,r*0.05,cx,cy,r*0.62);
 g.addColorStop(0,on?shade(rim,1.35):'#5a6472');g.addColorStop(1,on?shade(rim,0.72):'#2b333d');
 x.fillStyle=g;x.beginPath();x.arc(cx,cy,r*0.6,0,7);x.fill();
 x.strokeStyle=on?shade(rim,0.55):'#20272f';x.lineWidth=r*0.13;
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;
  x.beginPath();x.moveTo(cx+Math.cos(a)*r*0.14,cy+Math.sin(a)*r*0.14);x.lineTo(cx+Math.cos(a)*r*0.54,cy+Math.sin(a)*r*0.54);x.stroke()}
 x.fillStyle='#0d1116';x.beginPath();x.arc(cx,cy,r*0.17,0,7);x.fill();
 x.fillStyle=on?rim:'#4a5460';x.beginPath();x.arc(cx,cy,r*0.07,0,7);x.fill();
 x.restore()}
function supercar(x,s){
 const c=s.car;
 x.save();
 x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.ellipse(0,16,47,4.2,0,0,7);x.fill();
 const g=x.createLinearGradient(0,-17,0,14);
 g.addColorStop(0,shade(c,1.42));g.addColorStop(.42,c);g.addColorStop(1,shade(c,.52));
 x.fillStyle=g;x.beginPath();
 x.moveTo(-46,10);x.lineTo(-44,1.5);x.quadraticCurveTo(-31,-2,-18,-4.2);
 x.quadraticCurveTo(-8,-15.4,6,-15.2);x.quadraticCurveTo(18.5,-14,26,-6);
 x.quadraticCurveTo(38,-3,46,1.6);x.lineTo(47.4,8);x.quadraticCurveTo(47.4,12,42,12);
 x.lineTo(-42,12);x.quadraticCurveTo(-46,12,-46,10);x.closePath();x.fill();
 x.fillStyle='rgba(255,255,255,.20)';x.beginPath();
 x.moveTo(-44,2.2);x.quadraticCurveTo(-30,-1.4,-18,-3.6);x.quadraticCurveTo(-6,-13.6,6,-13.4);
 x.quadraticCurveTo(17,-12.4,24,-6.4);x.lineTo(20,-5.4);x.quadraticCurveTo(10,-11.4,4,-11.6);
 x.quadraticCurveTo(-6,-11.8,-16,-2.6);x.closePath();x.fill();
 const w=x.createLinearGradient(-14,-13,22,-5);w.addColorStop(0,'#0a1622');w.addColorStop(.55,'#123048');w.addColorStop(1,'#0a1622');
 x.fillStyle=w;x.beginPath();x.moveTo(-13.6,-5);x.quadraticCurveTo(-6,-13,5,-12.9);
 x.quadraticCurveTo(15,-12,21.4,-6.2);x.lineTo(2,-6.2);x.closePath();x.fill();
 x.fillStyle=shade(c,.42);x.beginPath();x.moveTo(-25,3.4);x.lineTo(-11,1.6);x.lineTo(-13.4,9.2);x.lineTo(-27,9.2);x.closePath();x.fill();
 x.fillStyle=shade(c,.34);x.beginPath();x.moveTo(24,7.6);x.lineTo(40,6.4);x.lineTo(40,10.4);x.lineTo(24,10.4);x.closePath();x.fill();
 x.fillStyle='#fff6cf';x.beginPath();x.moveTo(39.4,.6);x.lineTo(46.4,2.6);x.lineTo(45.4,6);x.lineTo(38.6,4);x.closePath();x.fill();
 x.fillStyle='rgba(255,246,207,.55)';x.beginPath();x.moveTo(46.4,2.6);x.lineTo(52,1);x.lineTo(52,7.4);x.lineTo(45.4,6);x.closePath();x.fill();
 x.fillStyle='#ff3b30';x.fillRect(-46.2,3.6,3.2,3);
 x.fillStyle=shade(c,.6);x.fillRect(-8,-4.6,2.4,7.2);
 wheel(x,-27,12,8.6,s.rim,s.rims);wheel(x,29,12,8.6,s.rim,s.rims);
 x.restore()}
function rally(x,s){
 const c=s.car;
 x.save();
 x.fillStyle='rgba(0,0,0,.42)';x.beginPath();x.ellipse(0,17,47,4.2,0,0,7);x.fill();
 x.fillStyle=shade(c,.72);x.fillRect(-48,-15.4,11,3.2);
 x.fillStyle=shade(c,.5);x.fillRect(-45,-12.4,3.4,9);
 const g=x.createLinearGradient(0,-15,0,14);
 g.addColorStop(0,shade(c,1.45));g.addColorStop(.4,c);g.addColorStop(1,shade(c,.5));
 x.fillStyle=g;x.beginPath();
 x.moveTo(-46,10);x.lineTo(-45,.4);x.quadraticCurveTo(-32,-3,-22,-4.4);
 x.quadraticCurveTo(-13,-13.6,-1,-13.4);x.quadraticCurveTo(12,-13.2,19,-6.2);
 x.lineTo(33,-4.2);x.quadraticCurveTo(44,-2.2,46,1.8);x.lineTo(47.2,8);
 x.quadraticCurveTo(47.2,12,42,12);x.lineTo(-42,12);x.quadraticCurveTo(-46,12,-46,10);x.closePath();x.fill();
 x.fillStyle='rgba(255,255,255,.18)';x.beginPath();
 x.moveTo(-45,.8);x.quadraticCurveTo(-32,-2.4,-22,-3.8);x.quadraticCurveTo(-13,-12.6,-1,-12.4);
 x.quadraticCurveTo(11,-12.2,18,-6);x.lineTo(14,-5.2);x.quadraticCurveTo(8,-10.6,-1,-10.8);
 x.quadraticCurveTo(-11,-11,-20,-2.8);x.closePath();x.fill();
 const w=x.createLinearGradient(-18,-12,17,-5);w.addColorStop(0,'#0a1622');w.addColorStop(.5,'#123048');w.addColorStop(1,'#0a1622');
 x.fillStyle=w;
 x.beginPath();x.moveTo(-18,-5.2);x.quadraticCurveTo(-11,-11.4,-1.6,-11.3);x.lineTo(-1.6,-5.2);x.closePath();x.fill();
 x.beginPath();x.moveTo(1.4,-11.3);x.quadraticCurveTo(10.6,-11.2,16.4,-6);x.lineTo(1.4,-6);x.closePath();x.fill();
 x.fillStyle=shade(c,.44);x.beginPath();x.moveTo(22,-7.4);x.lineTo(32,-6.2);x.lineTo(32,-3.6);x.lineTo(22,-4.6);x.closePath();x.fill();
 x.fillStyle=shade(c,.36);x.fillRect(-30,4.6,20,2.2);
 x.fillStyle='#fff6cf';x.beginPath();x.moveTo(39.6,.8);x.lineTo(46.4,2.8);x.lineTo(45.4,6.2);x.lineTo(38.8,4.2);x.closePath();x.fill();
 x.fillStyle='#ff3b30';x.beginPath();x.moveTo(-46.2,2.6);x.lineTo(-42.6,2.6);x.lineTo(-42.6,7);x.lineTo(-46.2,7);x.closePath();x.fill();
 wheel(x,-27,12,8.6,s.rim,true);wheel(x,29,12,8.6,s.rim,true);
 x.restore()}
function mono(x,s){
 x.save();
 const g=x.createLinearGradient(-34,-34,34,34);
 g.addColorStop(0,s.car);g.addColorStop(.55,s.rim);g.addColorStop(1,s.c2);
 x.fillStyle=g;x.font='900 46px system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
 x.textAlign='center';x.textBaseline='middle';x.fillText('KF',0,4);
 x.fillStyle=s.car;x.beginPath();
 x.moveTo(0,-33);x.quadraticCurveTo(8,-24,4.6,-17);x.quadraticCurveTo(11.4,-20.4,10,-28.6);
 x.quadraticCurveTo(15.6,-19,11,-12.4);x.quadraticCurveTo(4.6,-8,0,-12.6);
 x.quadraticCurveTo(-7,-17,-3.6,-24);x.quadraticCurveTo(-2.4,-19.4,1,-19.6);
 x.quadraticCurveTo(-3.6,-26,0,-33);x.closePath();x.fill();
 x.fillStyle='rgba(255,255,255,.28)';x.font='700 8.4px system-ui,sans-serif';
 x.fillText('EXPERT AUTO · DROIT',0,26);
 x.restore()}
function flame(x,s){
 x.save();
 const g=x.createLinearGradient(0,-36,0,30);
 g.addColorStop(0,'#fff3c4');g.addColorStop(.32,s.rim);g.addColorStop(.68,s.car);g.addColorStop(1,shade(s.car,.5));
 x.fillStyle=g;x.beginPath();
 x.moveTo(0,-36);x.quadraticCurveTo(19,-18,13,-4);x.quadraticCurveTo(24,-10,21,-24);
 x.quadraticCurveTo(33,-4,22,14);x.quadraticCurveTo(12,29,0,29);
 x.quadraticCurveTo(-13,29,-23,14);x.quadraticCurveTo(-33,-4,-21,-24);
 x.quadraticCurveTo(-24,-10,-13,-4);x.quadraticCurveTo(-19,-18,0,-36);x.closePath();x.fill();
 x.fillStyle='rgba(255,255,255,.42)';x.beginPath();
 x.moveTo(0,-14);x.quadraticCurveTo(9,-2,6,8);x.quadraticCurveTo(2,17,0,17);
 x.quadraticCurveTo(-3,17,-7,8);x.quadraticCurveTo(-9,-2,0,-14);x.closePath();x.fill();
 x.restore()}
function upload(x,S,s){
 if(!IMG)return;
 const base=Math.max(S/IMG.width,S/IMG.height),sc=base*(s.scale/100);
 const w=IMG.width*sc,h=IMG.height*sc;
 x.drawImage(IMG,-w/2,-h/2,w,h)}

/* ================= RENDU ================= */
function paint(ctx,S,s,mask,showSafe){
 ctx.clearRect(0,0,S,S);ctx.save();
 const rad=(s.radius/100)*(S/2);
 if(s.bg!=='transparent'){
  rr(ctx,0,0,S,S,mask?0:rad);ctx.clip();
  if(s.bg==='gradient'){const g=ctx.createLinearGradient(0,0,S,S);g.addColorStop(0,s.c1);g.addColorStop(.55,shade(s.c2,.62));g.addColorStop(1,s.c2);ctx.fillStyle=g}
  else if(s.bg==='radial'){const g=ctx.createRadialGradient(S*.32,S*.24,S*.05,S*.5,S*.5,S*.78);g.addColorStop(0,shade(s.c2,1.1));g.addColorStop(1,s.c1);ctx.fillStyle=g}
  else ctx.fillStyle=s.c1;
  ctx.fillRect(0,0,S,S);
  const v=ctx.createRadialGradient(S/2,S*.34,S*.08,S/2,S*.52,S*.8);
  v.addColorStop(0,'rgba(255,255,255,.10)');v.addColorStop(1,'rgba(0,0,0,.55)');
  ctx.fillStyle=v;ctx.fillRect(0,0,S,S);
  if(s.grain>0){ctx.globalAlpha=s.grain/420;
   for(let i=0;i<Math.round(S*1.1);i++){ctx.fillStyle=i%2?'#fff':'#000';
    ctx.fillRect(Math.random()*S,Math.random()*S,1,1)}
   ctx.globalAlpha=1}
 }
 const content=(mask?1-(s.pad/100)*1.15:1)*(s.scale/100);
 ctx.translate(S/2+(s.dx/100)*S,S/2+(s.dy/100)*S);
 ctx.rotate(s.rot*Math.PI/180);
 const k=(S/112)*content;ctx.scale(k,k);
 if(s.shadow>0){ctx.shadowColor='rgba(0,0,0,.85)';ctx.shadowBlur=s.shadow*.22;ctx.shadowOffsetY=s.shadow*.09}
 if(s.glow>0){ctx.shadowColor=s.car;ctx.shadowBlur=s.glow*.4}
 if(s.src==='supercar')supercar(ctx,s);
 else if(s.src==='rally')rally(ctx,s);
 else if(s.src==='mono')mono(ctx,s);
 else if(s.src==='flame')flame(ctx,s);
 else upload(ctx,S/k,s);
 ctx.restore();
 if(s.badge&&s.badgeText){
  ctx.save();rr(ctx,0,0,S,S,mask?0:rad);ctx.clip();
  const bh=S*.155;
  const bg=ctx.createLinearGradient(0,S-bh,S,S);bg.addColorStop(0,'rgba(0,0,0,.82)');bg.addColorStop(1,'rgba(0,0,0,.62)');
  ctx.fillStyle=bg;ctx.fillRect(0,S-bh,S,bh);
  ctx.fillStyle=s.rim;ctx.font='800 '+(bh*.56)+'px system-ui,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(s.badgeText,S/2,S-bh/2);ctx.restore()}
 if(showSafe&&mask){
  ctx.save();ctx.strokeStyle='#a3e635';ctx.setLineDash([S*.018,S*.014]);
  ctx.lineWidth=Math.max(1,S*.0055);ctx.beginPath();ctx.arc(S/2,S/2,S*.4,0,7);ctx.stroke();
  ctx.setLineDash([]);ctx.strokeStyle='rgba(163,230,53,.32)';ctx.lineWidth=Math.max(1,S*.003);
  ctx.strokeRect(S*.1,S*.1,S*.8,S*.8);ctx.restore()}
 if(s.grid){
  ctx.save();ctx.strokeStyle='rgba(56,189,248,.28)';ctx.lineWidth=Math.max(1,S*.0025);
  for(let i=1;i<8;i++){const p=S*i/8;
   ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,S);ctx.stroke();
   ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(S,p);ctx.stroke()}
  ctx.strokeStyle='rgba(255,122,26,.55)';ctx.beginPath();
  ctx.moveTo(S/2,0);ctx.lineTo(S/2,S);ctx.moveTo(0,S/2);ctx.lineTo(S,S/2);ctx.stroke();ctx.restore()}
}
function canvasOf(S,mask,showSafe){
 const c=document.createElement('canvas');c.width=c.height=S;
 const s=Object.assign({},ST);if(!showSafe)s.safe=false;
 paint(c.getContext('2d'),S,s,mask,!!showSafe&&s.safe);
 return c}

/* ================= ZIP (store + CRC32) ================= */
const CT=(function(){const t=new Uint32Array(256);
 for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CT[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function zip(entries){
 const enc=new TextEncoder(),parts=[],central=[];let off=0;
 entries.forEach(function(e){
  const name=enc.encode(e.name),crc=crc32(e.u8),sz=e.u8.length;
  const lh=new DataView(new ArrayBuffer(30));
  lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);
  lh.setUint16(8,0,true);lh.setUint16(10,0,true);lh.setUint16(12,0,true);
  lh.setUint32(14,crc,true);lh.setUint32(18,sz,true);lh.setUint32(22,sz,true);
  lh.setUint16(26,name.length,true);lh.setUint16(28,0,true);
  parts.push(new Uint8Array(lh.buffer),name,e.u8);
  const ch=new DataView(new ArrayBuffer(46));
  ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);
  ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);ch.setUint16(12,0,true);ch.setUint16(14,0,true);
  ch.setUint32(16,crc,true);ch.setUint32(20,sz,true);ch.setUint32(24,sz,true);
  ch.setUint16(28,name.length,true);ch.setUint16(30,0,true);ch.setUint16(32,0,true);
  ch.setUint16(34,0,true);ch.setUint16(36,0,true);ch.setUint32(38,0,true);ch.setUint32(42,off,true);
  central.push(new Uint8Array(ch.buffer),name);
  off+=30+name.length+sz});
 let cs=0;central.forEach(function(c){cs+=c.length});
 const end=new DataView(new ArrayBuffer(22));
 end.setUint32(0,0x06054b50,true);end.setUint16(4,0,true);end.setUint16(6,0,true);
 end.setUint16(8,entries.length,true);end.setUint16(10,entries.length,true);
 end.setUint32(12,cs,true);end.setUint32(16,off,true);end.setUint16(20,0,true);
 return new Blob(parts.concat(central,[new Uint8Array(end.buffer)]),{type:'application/zip'})}
function blobOf(c){return new Promise(function(r){c.toBlob(r,'image/png')})}
async function pngOf(S,mask){const c=canvasOf(S,mask,false);return new Uint8Array(await (await blobOf(c)).arrayBuffer())}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},5000)}
function utf8b64(s){const b=new TextEncoder().encode(s);let o='';const CH=0x8000;
 for(let i=0;i<b.length;i+=CH)o+=String.fromCharCode.apply(null,b.subarray(i,i+CH));return btoa(o)}

/* ================= MANIFEST / ASSETLINKS ================= */
function appUrl(){return location.href.split('?')[0].split('#')[0].replace(/index\.html$/,'')}
function manifestObj(){
 const icons=[];
 SIZES.forEach(function(s){icons.push({src:'icon-'+s+'.png',sizes:s+'x'+s,type:'image/png',purpose:'any'})});
 MASK.forEach(function(s){icons.push({src:'icon-'+s+'-maskable.png',sizes:s+'x'+s,type:'image/png',purpose:'maskable'})});
 icons.push({src:'apple-touch-icon.png',sizes:'180x180',type:'image/png',purpose:'any'});
 return{name:'KEV FUSION 2026 — Expert Auto & Droit',short_name:'KEV FUSION',
  description:'Expert automobile & avocat : corrélation par code moteur, pannes connues, DTC, campagnes de rappel, TSB, étude incendie, juridique, VIN, OBD.',
  id:'./',start_url:'./index.html',scope:'./',display:'standalone',display_override:['standalone','minimal-ui'],
  orientation:'any',lang:'fr',dir:'ltr',theme_color:ST.c1,background_color:ST.c1,
  categories:['productivity','utilities','business','education'],icons:icons,
  shortcuts:[
   {name:'Recherche prédictive',short_name:'Recherche',url:'./index.html?view=recherche',icons:[{src:'icon-96.png',sizes:'96x96'}]},
   {name:'Étude corrélée',short_name:'Étude',url:'./index.html?view=etude',icons:[{src:'icon-96.png',sizes:'96x96'}]},
   {name:'JusteRepère',short_name:'Juridique',url:'./index.html?view=jr',icons:[{src:'icon-96.png',sizes:'96x96'}]},
   {name:'Lecture VIN',short_name:'VIN',url:'./index.html?view=vin',icons:[{src:'icon-96.png',sizes:'96x96'}]}]}}
function manifestTxt(){return JSON.stringify(manifestObj(),null,2)}
function assetlinksTxt(){
 const fp=(ST.fp||'').trim()||'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99';
 return JSON.stringify([{relation:['delegate_permission/common.handle_all_urls'],
  target:{namespace:'android_app',package_name:ST.pkg||'io.github.expertkevin06_cell.kevfusion',
   sha256_cert_fingerprints:[fp]}}],null,2)}

/* ================= GÉNÉRATION / INJECTION ================= */
async function generate(){
 LAST={};
 for(const s of SIZES)LAST['icon-'+s+'.png']=canvasOf(s,false,false).toDataURL('image/png');
 for(const s of MASK)LAST['icon-'+s+'-maskable.png']=canvasOf(s,true,false).toDataURL('image/png');
 for(const s of APPLE)LAST['apple-'+s+'.png']=canvasOf(s,false,false).toDataURL('image/png');
 LAST['apple-touch-icon.png']=LAST['apple-180.png'];
 LAST['favicon-32.png']=LAST['icon-32.png'];
 LAST['favicon-16.png']=LAST['icon-16.png'];
 LS.set('pwaIcons',{ts:Date.now(),c1:ST.c1,n:Object.keys(LAST).length});
 return LAST}
function injectDom(){
 if(!LAST['icon-192.png'])return;
 document.querySelectorAll('link[data-kficon]').forEach(function(n){n.remove()});
 const add=function(rel,href,sizes){const l=document.createElement('link');
  l.rel=rel;l.href=href;if(sizes)l.setAttribute('sizes',sizes);l.setAttribute('data-kficon','1');document.head.appendChild(l)};
 add('icon',LAST['icon-32.png'],'32x32');
 add('icon',LAST['icon-192.png'],'192x192');
 add('icon',LAST['icon-512.png'],'512x512');
 add('apple-touch-icon',LAST['apple-touch-icon.png'],'180x180');
 add('apple-touch-icon',LAST['apple-152.png'],'152x152');
 add('apple-touch-icon',LAST['apple-120.png'],'120x120');
 let mt=document.querySelector('meta[name="theme-color"]');
 if(!mt){mt=document.createElement('meta');mt.name='theme-color';document.head.appendChild(mt)}
 mt.content=ST.c1;
 let am=document.querySelector('meta[name="apple-mobile-web-app-capable"]');
 if(!am){am=document.createElement('meta');am.name='apple-mobile-web-app-capable';am.content='yes';document.head.appendChild(am)}
 let as=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
 if(!as){as=document.createElement('meta');as.name='apple-mobile-web-app-status-bar-style';as.content='black-translucent';document.head.appendChild(as)}
 let at=document.querySelector('meta[name="apple-mobile-web-app-title"]');
 if(!at){at=document.createElement('meta');at.name='apple-mobile-web-app-title';at.content='KEV FUSION';document.head.appendChild(at)}
 /* manifest live blob : installable immédiatement avec les nouvelles icônes */
 try{
  const m=manifestObj();
  m.icons=m.icons.map(function(i){
   const key=i.purpose==='maskable'?('icon-'+parseInt(i.sizes)+'-maskable.png'):('icon-'+parseInt(i.sizes)+'.png');
   return LAST[key]?Object.assign({},i,{src:LAST[key]}):i});
  const blob=new Blob([JSON.stringify(m)],{type:'application/manifest+json'});
  let ml=document.querySelector('link[rel="manifest"]');
  if(!ml){ml=document.createElement('link');ml.rel='manifest';document.head.appendChild(ml)}
  if(ml._kfUrl)URL.revokeObjectURL(ml._kfUrl);
  ml._kfUrl=URL.createObjectURL(blob);ml.href=ml._kfUrl;ml.setAttribute('data-kficon','1');
 }catch(e){}
}

/* ================= GITHUB ================= */
function gh(){return Object.assign({owner:'expertkevin06-cell',repo:'kev-fusion',branch:'main'},LS.get('ghCfg',{}))}
async function ghPut(path,u8orText,isText){
 const c=gh(),token=LS.get('ghToken','');
 if(!token)throw new Error('Jeton GitHub absent — onglet Admin → Diffusion tiers');
 const api='https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/'+path;
 let sha;
 try{const g=await fetch(api+'?ref='+encodeURIComponent(c.branch),{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json'}});
  if(g.ok){const j=await g.json();sha=j.sha}}catch(e){}
 const content=isText?utf8b64(u8orText):b64u8(u8orText);
 const body={message:'KEV FUSION · icônes PWA '+path,content:content,branch:c.branch};
 if(sha)body.sha=sha;
 const r=await fetch(api,{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify(body)});
 if(!r.ok){const t=await r.text().catch(function(){return''});throw new Error('GitHub '+r.status+' '+t.slice(0,120))}
 return r.json()}
function b64u8(u8){let o='';const CH=0x8000;
 for(let i=0;i<u8.length;i+=CH)o+=String.fromCharCode.apply(null,u8.subarray(i,i+CH));return btoa(o)}
async function commitAll(){
 if(!LAST['icon-192.png'])await generate();
 const files=[];
 SIZES.forEach(function(s){files.push('icon-'+s+'.png')});
 MASK.forEach(function(s){files.push('icon-'+s+'-maskable.png')});
 files.push('apple-touch-icon.png','favicon-32.png','favicon-16.png');
 const bar=$('#pwaProg'),lbl=$('#pwaProgTxt');
 let done=0;const total=files.length+2;
 const step=function(t){done++;if(bar)bar.style.width=Math.round(done/total*100)+'%';if(lbl)lbl.textContent=t+' ('+done+'/'+total+')'};
 if(bar)bar.style.width='0%';
 try{
  for(const f of files){
   const key=f==='apple-touch-icon.png'?'apple-180.png':f;
   const data=LAST[key]||LAST[f];
   const u8=await (await fetch(data)).arrayBuffer();
   await ghPut(f,new Uint8Array(u8),false);step(f)}
  await ghPut('manifest.webmanifest',manifestTxt(),true);step('manifest.webmanifest');
  await ghPut('.well-known/assetlinks.json',assetlinksTxt(),true);step('assetlinks.json');
  if(lbl)lbl.textContent='✅ Publié — '+total+' fichiers commités';
  toast('📡 Icônes + manifest publiés sur GitHub');
 }catch(e){if(lbl)lbl.textContent='❌ '+e.message;toast('GitHub : '+e.message)}}

/* ================= CHECKLIST ================= */
async function checklist(){
 const out=[];
 out.push({ok:location.protocol==='https:'||location.hostname==='localhost',l:'HTTPS / contexte sécurisé',d:location.protocol});
 let mf=null;
 try{const r=await fetch('manifest.webmanifest?hb='+Date.now(),{cache:'no-store'});if(r.ok)mf=await r.json()}catch(e){}
 out.push({ok:!!mf,l:'manifest.webmanifest accessible',d:mf?'servi par le dépôt':'introuvable — utilise « Injecter » ou « Publier »'});
 let reg=null;
 try{if('serviceWorker'in navigator)reg=await navigator.serviceWorker.getRegistration()}catch(e){}
 out.push({ok:!!(reg&&reg.active),l:'Service Worker actif',d:reg?(reg.active?'contrôlé':'installé, en attente'):'non enregistré'});
 out.push({ok:!!(mf&&mf.name&&mf.short_name),l:'name + short_name',d:mf?(mf.short_name||'—'):'manifest absent'});
 out.push({ok:!!(mf&&mf.start_url&&mf.scope),l:'start_url + scope',d:mf?(mf.start_url+' · '+mf.scope):'—'});
 out.push({ok:!!(mf&&mf.display==='standalone'),l:'display standalone',d:mf?mf.display:'—'});
 out.push({ok:!!(mf&&mf.theme_color&&mf.background_color),l:'theme_color + background_color',d:mf?(mf.theme_color+' / '+mf.background_color):'—'});
 const ic=(mf&&mf.icons)||[];
 const has=function(sz,pur){return ic.some(function(i){return String(i.sizes).indexOf(sz)>=0&&(!pur||String(i.purpose||'').indexOf(pur)>=0)})};
 out.push({ok:has('192'),l:'icône 192×192 (any)',d:has('192')?'présente':'requise par PWABuilder'});
 out.push({ok:has('512'),l:'icône 512×512 (any)',d:has('512')?'présente':'requise par PWABuilder'});
 out.push({ok:has('512','maskable'),l:'icône 512 maskable',d:has('512','maskable')?'présente':'requise Android adaptive'});
 out.push({ok:has('192','maskable'),l:'icône 192 maskable',d:has('192','maskable')?'présente':'recommandée'});
 out.push({ok:!!LAST['icon-512.png'],l:'jeu d\'icônes généré localement',d:LAST['icon-512.png']?(Object.keys(LAST).length+' fichiers en mémoire'):'clique « Générer le jeu »'});
 out.push({ok:!!LS.get('ghToken',''),l:'jeton GitHub (publication auto)',d:LS.get('ghToken','')?'configuré':'Admin → Diffusion tiers'});
 out.push({ok:/^[0-9A-F]{2}(:[0-9A-F]{2}){31}$/i.test((ST.fp||'').trim()),l:'empreinte SHA-256 (assetlinks)',d:ST.fp?'renseignée':'à coller depuis PWABuilder'});
 return out}

/* ================= VUE ================= */
function ctlRange(id,label,min,max,unit){
 return '<div class="ctl"><div class="ctl-h"><label for="p_'+id+'">'+label+'</label><output id="o_'+id+'">'+ST[id]+(unit||'')+'</output></div>'+
 '<input type="range" id="p_'+id+'" data-pwa="'+id+'" min="'+min+'" max="'+max+'" value="'+ST[id]+'"></div>'}
function renderPwa(){
 const v=$('#view');if(!v)return;
 v.innerHTML=
 '<div class="pwa-hero card accent">'+
  '<div class="pwa-hero-l"><span class="pwa-badge">PWA</span>'+
   '<h1>Mode PWABuilder</h1>'+
   '<p class="mut">Studio d\'icônes live · jeu complet généré automatiquement · injection immédiate dans l\'app · manifest &amp; assetlinks · export ZIP · publication GitHub en un clic.</p></div>'+
  '<div class="pwa-hero-r">'+
   '<button class="pri" data-pwa="gen">⚙️ Générer le jeu</button>'+
   '<button class="jr" data-pwa="inject">💉 Injecter dans l\'app</button>'+
   '<button data-pwa="open">🚀 Ouvrir PWABuilder</button>'+
  '</div>'+
 '</div>'+
 '<div class="pwa-wrap">'+
  '<section class="pwa-stage">'+
   '<div class="card pwa-preview">'+
    '<h2>🎨 Aperçu live</h2>'+
    '<div class="pwa-canvasbox"><canvas id="pwaBig" width="512" height="512"></canvas>'+
     '<span class="pwa-hint" id="pwaHint">zone de sécurité maskable</span></div>'+
    '<div class="pwa-strip" id="pwaStrip"></div>'+
   '</div>'+
   '<div class="card">'+
    '<h2>📱 Rendu appareil</h2>'+
    '<div class="pwa-devices">'+
     '<div class="pwa-dev"><div class="pwa-home"><canvas id="pwaHome" width="192" height="192"></canvas></div><span>Écran d\'accueil Android<br><i>maskable · squircle</i></span></div>'+
     '<div class="pwa-dev"><div class="pwa-ios"><canvas id="pwaIos" width="180" height="180"></canvas></div><span>iOS / iPadOS<br><i>apple-touch-icon</i></span></div>'+
     '<div class="pwa-dev"><div class="pwa-splash" id="pwaSplash"><canvas id="pwaSplashC" width="128" height="128"></canvas><b>KEV FUSION</b></div><span>Splash screen<br><i>background_color</i></span></div>'+
    '</div>'+
   '</div>'+
   '<div class="card">'+
    '<h2>✅ Conformité PWABuilder</h2>'+
    '<div class="pwa-score"><div class="bar"><i id="pwaScoreBar" style="width:0%"></i></div><b id="pwaScoreTxt">—</b></div>'+
    '<ul class="pwa-check" id="pwaCheck"><li class="mut">Analyse…</li></ul>'+
    '<div class="row"><button data-pwa="recheck">↻ Revérifier</button><button data-pwa="dlcheck">📤 Rapport JSON</button></div>'+
   '</div>'+
   '<div class="card">'+
    '<h2>📦 Livraison</h2>'+
    '<div class="pwa-prog"><div class="bar"><i id="pwaProg" style="width:0%"></i></div><span class="mut" id="pwaProgTxt">Prêt.</span></div>'+
    '<div class="row">'+
     '<button class="pri" data-pwa="zip">📦 ZIP complet (icônes + manifest + assetlinks)</button>'+
     '<button data-pwa="png">🖼️ PNG 512</button>'+
     '<button data-pwa="dlmanifest">📄 manifest.webmanifest</button>'+
     '<button data-pwa="dlassetlinks">🔗 assetlinks.json</button>'+
     '<button class="jr" data-pwa="commit">📡 Publier sur GitHub (auto)</button>'+
    '</div>'+
    '<p class="mut">Le ZIP contient <b>'+SIZES.length+' tailles any</b>, <b>'+MASK.length+' maskable</b>, <b>'+APPLE.length+' Apple</b>, favicons, <b>manifest.webmanifest</b> et <b>.well-known/assetlinks.json</b>. Dépose le contenu à la racine du dépôt (le dossier <code>.well-known</code> inclus) puis commit.</p>'+
    '<div class="pwa-code"><h3>manifest.webmanifest</h3><pre id="pwaManifest"></pre>'+
     '<div class="row"><button data-pwa="copymanifest">📋 Copier</button></div></div>'+
    '<div class="pwa-code"><h3>.well-known/assetlinks.json</h3><pre id="pwaAsset"></pre>'+
     '<div class="row"><button data-pwa="copyasset">📋 Copier</button></div></div>'+
   '</div>'+
  '</section>'+
  '<aside class="pwa-controls card">'+
   '<h2>🎛️ Réglages live</h2>'+
   '<div class="ctl"><div class="ctl-h"><label>Visuel source</label></div>'+
    '<select id="p_src" data-pwa="src">'+
     '<option value="supercar">Supercar ambre</option>'+
     '<option value="rally">Berline rally bleue</option>'+
     '<option value="mono">Monogramme KF</option>'+
     '<option value="flame">Flamme</option>'+
     '<option value="upload">Mes photos</option>'+
    '</select></div>'+
   '<div class="pwa-drop" id="pwaDrop">📷 Dépose / clique pour charger une photo</div>'+
   '<input type="file" id="pwaFile" accept="image/*" hidden>'+
   '<div class="ctl"><div class="ctl-h"><label>Fond</label></div>'+
    '<select id="p_bg" data-pwa="bg"><option value="gradient">Dégradé diagonal</option><option value="radial">Dégradé radial</option><option value="solid">Uni</option><option value="transparent">Transparent</option></select></div>'+
   '<div class="pwa-colors">'+
    '<div><input type="color" id="p_c1" data-pwa="c1" value="'+ST.c1+'"><span>Fond 1</span></div>'+
    '<div><input type="color" id="p_c2" data-pwa="c2" value="'+ST.c2+'"><span>Fond 2</span></div>'+
    '<div><input type="color" id="p_car" data-pwa="car" value="'+ST.car+'"><span>Carrosserie</span></div>'+
    '<div><input type="color" id="p_rim" data-pwa="rim" value="'+ST.rim+'"><span>Jantes / accent</span></div>'+
   '</div>'+
   ctlRange('scale','Échelle',40,170,'%')+
   ctlRange('dx','Décalage X',-40,40,'')+
   ctlRange('dy','Décalage Y',-40,40,'')+
   ctlRange('rot','Rotation',-45,45,'°')+
   ctlRange('radius','Arrondi des coins',0,50,'%')+
   ctlRange('pad','Marge maskable',0,32,'%')+
   ctlRange('glow','Halo lumineux',0,100,'%')+
   ctlRange('shadow','Ombre portée',0,100,'%')+
   ctlRange('grain','Grain / texture',0,60,'')+
   '<div class="pwa-toggles">'+
    '<label class="tg" id="t_safe"><input type="checkbox" data-pwat="safe"> Zone maskable</label>'+
    '<label class="tg" id="t_grid"><input type="checkbox" data-pwat="grid"> Grille &amp; axes</label>'+
    '<label class="tg" id="t_rims"><input type="checkbox" data-pwat="rims"> Jantes accent</label>'+
    '<label class="tg" id="t_badge"><input type="checkbox" data-pwat="badge"> Badge texte</label>'+
   '</div>'+
   '<div class="ctl"><div class="ctl-h"><label>Texte du badge</label></div><input type="text" id="p_badgeText" data-pwa="badgeText" value="'+esc(ST.badgeText)+'" maxlength="14"></div>'+
   '<div class="ctl"><div class="ctl-h"><label>Qualité de rendu</label></div>'+
    '<select id="p_quality" data-pwa="quality"><option value="1">Rapide</option><option value="2">Standard</option><option value="3">Haute (grain fin)</option></select></div>'+
   '<div class="pwa-sep"></div>'+
   '<div class="ctl"><div class="ctl-h"><label>Package Android (assetlinks)</label></div><input type="text" id="p_pkg" data-pwa="pkg" value="'+esc(ST.pkg)+'"></div>'+
   '<div class="ctl"><div class="ctl-h"><label>Empreinte SHA-256</label></div><input type="text" id="p_fp" data-pwa="fp" value="'+esc(ST.fp)+'" placeholder="AA:BB:…:99 (32 octets)"></div>'+
   '<div class="pwa-sep"></div>'+
   '<div class="pwa-actions">'+
    '<button data-pwa="reset">↺ Réinitialiser</button>'+
    '<button data-pwa="rand">🎲 Aléatoire</button>'+
    '<button class="pri" data-pwa="gen">⚙️ Générer</button>'+
    '<button class="jr" data-pwa="inject">💉 Injecter</button>'+
   '</div>'+
   '<p class="mut">Chaque réglage s\'applique instantanément à l\'aperçu, aux rendus appareil et au jeu exporté.</p>'+
  '</aside>'+
 '</div>';
 syncUI();mountStrip();schedulePaint();refreshCode();runCheck();
 bindControls()}
function syncUI(){
 ['src','bg','badgeText','pkg','fp','quality'].forEach(function(k){const e=$('#p_'+k);if(e)e.value=ST[k]});
 ['c1','c2','car','rim'].forEach(function(k){const e=$('#p_'+k);if(e)e.value=ST[k]});
 ['scale','dx','dy','rot','radius','pad','glow','shadow','grain'].forEach(function(k){
  const e=$('#p_'+k),o=$('#o_'+k);if(e)e.value=ST[k];
  if(o)o.textContent=ST[k]+(k==='rot'?'°':(k==='grain'?'':'%'))});
 ['safe','grid','rims','badge'].forEach(function(k){
  const w=$('#t_'+k);if(!w)return;const i=w.querySelector('input');if(i)i.checked=!!ST[k];w.classList.toggle('on',!!ST[k])})}
function mountStrip(){
 const s=$('#pwaStrip');if(!s)return;s.innerHTML='';
 [192,144,96,72,48,32,16].forEach(function(n){
  const d=document.createElement('div');d.className='pwa-thumb';
  const c=document.createElement('canvas');c.width=c.height=n;c.dataset.strip=n;
  const l=document.createElement('span');l.textContent=n+'px';
  d.appendChild(c);d.appendChild(l);s.appendChild(d)})}
function schedulePaint(){dirty=true;if(raf)return;
 raf=requestAnimationFrame(function(){raf=0;if(!dirty)return;dirty=false;doPaint()})}
function doPaint(){
 const big=$('#pwaBig');if(!big)return;
 const q=ST.quality|0;
 paint(big.getContext('2d'),512,ST,true,ST.safe);
 document.querySelectorAll('#pwaStrip canvas').forEach(function(c){
  paint(c.getContext('2d'),+c.dataset.strip,ST,false,false)});
 const home=$('#pwaHome');if(home)paint(home.getContext('2d'),192,ST,true,false);
 const ios=$('#pwaIos');if(ios)paint(ios.getContext('2d'),180,ST,false,false);
 const sp=$('#pwaSplashC');if(sp)paint(sp.getContext('2d'),128,ST,true,false);
 const spl=$('#pwaSplash');if(spl)spl.style.background=ST.c1;
 const h=$('#pwaHint');if(h)h.style.display=ST.safe?'block':'none';
 if(q>=3&&ST.grain>0){/* grain déjà rendu */}
}
function refreshCode(){
 const m=$('#pwaManifest');if(m)m.textContent=manifestTxt();
 const a=$('#pwaAsset');if(a)a.textContent=assetlinksTxt()}
async function runCheck(){
 const ul=$('#pwaCheck');if(!ul)return;
 const list=await checklist();
 const ok=list.filter(function(x){return x.ok}).length;
 const pct=Math.round(ok/list.length*100);
 const bar=$('#pwaScoreBar'),txt=$('#pwaScoreTxt');
 if(bar)bar.style.width=pct+'%';
 if(txt){txt.textContent=ok+' / '+list.length+' · '+pct+'%';txt.className=pct>=90?'st-ok':pct>=65?'st-warn':'st-fail'}
 ul.innerHTML=list.map(function(x){
  return '<li class="'+(x.ok?'ok':'ko')+'"><span class="ic">'+(x.ok?'✅':'⚠️')+'</span><span><b>'+esc(x.l)+'</b><i>'+esc(x.d)+'</i></span></li>'}).join('')}
function save(){LS.set('pwaStudio',ST)}
function bindControls(){
 const root=$('#view');if(!root||root._pwaBound)return;root._pwaBound=1;
 root.addEventListener('input',function(e){
  const t=e.target;
  const k=t.dataset&&t.dataset.pwa;
  if(k){
   let v=t.type==='range'?+t.value:t.value;
   if(k==='quality')v=+v;
   ST[k]=v;
   const o=$('#o_'+k);if(o)o.textContent=v+(k==='rot'?'°':(k==='grain'?'':'%'));
   save();schedulePaint();
   if(k==='c1'||k==='c2'||k==='pkg'||k==='fp')refreshCode();
   return}
  const tk=t.dataset&&t.dataset.pwat;
  if(tk){ST[tk]=t.checked;const w=$('#t_'+tk);if(w)w.classList.toggle('on',t.checked);save();schedulePaint()}
 });
 root.addEventListener('change',function(e){
  const k=e.target.dataset&&e.target.dataset.pwa;
  if(k&&(k==='src'||k==='bg'||k==='quality')){ST[k]=k==='quality'?+e.target.value:e.target.value;save();schedulePaint()}
 });
 const drop=$('#pwaDrop'),file=$('#pwaFile');
 if(drop&&file){
  drop.addEventListener('click',function(){file.click()});
  ['dragover','dragenter'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('over')})});
  ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('over')})});
  drop.addEventListener('drop',function(e){if(e.dataTransfer.files[0])loadImg(e.dataTransfer.files[0])});
  file.addEventListener('change',function(e){if(e.target.files[0])loadImg(e.target.files[0])})}
}
function loadImg(f){
 const r=new FileReader();
 r.onload=function(){const i=new Image();
  i.onload=function(){IMG=i;ST.src='upload';const s=$('#p_src');if(s)s.value='upload';
   const d=$('#pwaDrop');if(d)d.textContent='✅ '+f.name;save();schedulePaint();toast('📷 Photo chargée comme visuel source')};
  i.src=r.result};
 r.readAsDataURL(f)}

/* ================= ACTIONS ================= */
async function doZip(){
 if(!LAST['icon-192.png'])await generate();
 const lbl=$('#pwaProgTxt'),bar=$('#pwaProg');
 if(lbl)lbl.textContent='Assemblage du ZIP…';
 const entries=[];
 for(const s of SIZES){entries.push({name:'icon-'+s+'.png',u8:await pngOf(s,false)})}
 for(const s of MASK){entries.push({name:'icon-'+s+'-maskable.png',u8:await pngOf(s,true)})}
 for(const s of APPLE){entries.push({name:'apple-touch-icon-'+s+'.png',u8:await pngOf(s,false)})}
 entries.push({name:'apple-touch-icon.png',u8:await pngOf(180,false)});
 entries.push({name:'favicon-32.png',u8:await pngOf(32,false)});
 entries.push({name:'favicon-16.png',u8:await pngOf(16,false)});
 entries.push({name:'manifest.webmanifest',u8:new TextEncoder().encode(manifestTxt())});
 entries.push({name:'.well-known/assetlinks.json',u8:new TextEncoder().encode(assetlinksTxt())});
 entries.push({name:'LISEZ-MOI.txt',u8:new TextEncoder().encode(
  'KEV FUSION 2026 — Pack PWA / PWABuilder\n\n'+
  '1. Dépose TOUT le contenu à la racine du dépôt GitHub Pages (le dossier .well-known inclus).\n'+
  '2. Commit + push. Attends le déploiement Pages.\n'+
  '3. Ouvre https://www.pwabuilder.com et colle : '+appUrl()+'\n'+
  '4. Package For Stores → Android → Signing key : New (garde le .keystore).\n'+
  '5. Copie le SHA-256 du keystore dans le champ « Empreinte SHA-256 » du studio,\n'+
  '   régénère et republie .well-known/assetlinks.json (supprime la barre d\'URL).\n'+
  '6. Publie l\'APK dans GitHub Releases, puis colle son URL dans Admin → Diffusion.\n\n'+
  'Package : '+ST.pkg+'\nGénéré le '+new Date().toLocaleString('fr-FR')+'\n')});
 dl(zip(entries),'kev-fusion-pwa-pack.zip');
 if(bar)bar.style.width='100%';
 if(lbl)lbl.textContent='✅ ZIP prêt · '+entries.length+' fichiers';
 toast('📦 Pack PWA téléchargé ('+entries.length+' fichiers)')}
function openPwa(){
 const u=appUrl();
 try{navigator.clipboard.writeText(u)}catch(e){}
 window.open('https://www.pwabuilder.com/reportcard?site='+encodeURIComponent(u),'_blank','noopener');
 toast('🚀 PWABuilder ouvert · URL copiée')}

/* ================= DISPATCH ================= */
document.addEventListener('click',async function(e){
 const b=e.target.closest('[data-pwa]');if(!b)return;
 const a=b.dataset.pwa;
 if(['src','bg','c1','c2','car','rim','scale','dx','dy','rot','radius','pad','glow','shadow','grain','badgeText','pkg','fp','quality'].indexOf(a)>=0)return;
 e.preventDefault();
 try{
  if(a==='gen'){await generate();toast('⚙️ '+Object.keys(LAST).length+' icônes générées');runCheck();
   const l=$('#pwaProgTxt');if(l)l.textContent='Jeu généré : '+Object.keys(LAST).length+' fichiers.';return}
  if(a==='inject'){if(!LAST['icon-192.png'])await generate();injectDom();toast('💉 Icônes + manifest injectés dans l\'app');runCheck();return}
  if(a==='zip'){await doZip();return}
  if(a==='png'){const u8=await pngOf(512,false);dl(new Blob([u8],{type:'image/png'}),'icon-512.png');toast('🖼️ PNG 512 téléchargé');return}
  if(a==='dlmanifest'){dl(new Blob([manifestTxt()],{type:'application/manifest+json'}),'manifest.webmanifest');toast('📄 manifest téléchargé');return}
  if(a==='dlassetlinks'){dl(new Blob([assetlinksTxt()],{type:'application/json'}),'assetlinks.json');toast('🔗 assetlinks téléchargé');return}
  if(a==='copymanifest'){await navigator.clipboard.writeText(manifestTxt());toast('📋 manifest copié');return}
  if(a==='copyasset'){await navigator.clipboard.writeText(assetlinksTxt());toast('📋 assetlinks copié');return}
  if(a==='commit'){await commitAll();runCheck();return}
  if(a==='open'){openPwa();return}
  if(a==='recheck'){await runCheck();toast('↻ Conformité revérifiée');return}
  if(a==='dlcheck'){const l=await checklist();dl(new Blob([JSON.stringify({ts:new Date().toISOString(),url:appUrl(),score:l.filter(function(x){return x.ok}).length+'/'+l.length,checks:l},null,2)],{type:'application/json'}),'pwa-check.json');return}
  if(a==='reset'){ST=Object.assign({},DEF);IMG=null;save();syncUI();schedulePaint();refreshCode();toast('↺ Réglages réinitialisés');return}
  if(a==='rand'){
   const pal=[['#0d1410','#1e6fff','#ff9500','#d8b45a'],['#160b00','#ff7a1a','#ffd166','#0e1a26'],
    ['#0a1a2f','#0a5fd7','#38bdf8','#d8b45a'],['#101418','#a3e635','#ff9500','#38bdf8'],
    ['#1a0d14','#f87171','#fbbf24','#a3e635'],['#07100c','#22c55e','#ffd166','#38bdf8'],
    ['#120a1e','#a78bfa','#ff7a1a','#38bdf8']];
   const p=pal[Math.floor(Math.random()*pal.length)];
   ST.c1=p[0];ST.c2=p[1];ST.car=p[2];ST.rim=p[3];
   ST.src=['supercar','rally','mono','flame'][Math.floor(Math.random()*4)];
   ST.bg=['gradient','radial','solid'][Math.floor(Math.random()*3)];
   ST.scale=82+Math.floor(Math.random()*46);ST.rot=Math.floor(Math.random()*25)-12;
   ST.radius=Math.floor(Math.random()*46);ST.glow=22+Math.floor(Math.random()*62);
   ST.shadow=20+Math.floor(Math.random()*60);ST.grain=Math.floor(Math.random()*40);
   save();syncUI();schedulePaint();refreshCode();toast('🎲 Palette aléatoire appliquée');return}
 }catch(x){toast('PWABuilder : '+x.message)}
});

/* ================= INTÉGRATION NAV ================= */
function hook(){
 try{
  if(typeof NAV!=='undefined'&&Array.isArray(NAV)&&!NAV.some(function(n){return n[0]==='pwa'})){
   const i=NAV.findIndex(function(n){return n[0]==='modules'});
   NAV.splice(i<0?NAV.length:i,0,['pwa','📦 PWABuilder'])}
  if(typeof window.switchView==='function'&&!window.switchView.__kfPwa){
   const _sv=window.switchView;
   const w=function(v){
    if(v!=='pwa')return _sv(v);
    if(typeof S!=='undefined')S.view='pwa';
    const nav=$('#nav');
    if(nav&&typeof NAV!=='undefined')nav.innerHTML=NAV.map(function(n){
     return '<button data-act="nav" data-k="'+n[0]+'" class="'+(n[0]==='pwa'?'act':'')+'">'+n[1]+'</button>'}).join('');
    renderPwa()};
   w.__kfPwa=true;window.switchView=w}
 }catch(e){}
}
hook();

/* ================= CSS ================= */
function css(){
 if($('#pwaCss'))return;
 const s=document.createElement('style');s.id='pwaCss';
 s.textContent=
 '.pwa-hero{display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:linear-gradient(120deg,#1a1408,#141c2e 45%,#0f1e33)}'+
 '.pwa-hero-l{flex:1;min-width:260px}.pwa-hero-r{display:flex;gap:8px;flex-wrap:wrap}'+
 '.pwa-badge{display:inline-block;font:800 11px/1 system-ui;letter-spacing:1.4px;color:#160b00;background:linear-gradient(90deg,#ff7a1a,#ffd166);padding:5px 10px;border-radius:8px;margin-bottom:8px}'+
 '.pwa-wrap{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:14px;align-items:start}'+
 '@media(max-width:1000px){.pwa-wrap{grid-template-columns:1fr}}'+
 '.pwa-stage{min-width:0}'+
 '.pwa-controls{position:sticky;top:118px;max-height:calc(100vh - 140px);overflow:auto;border-color:#ff7a1a55;background:linear-gradient(160deg,#161022,#141c2e 60%)}'+
 '@media(max-width:1000px){.pwa-controls{position:static;max-height:none}}'+
 '.pwa-canvasbox{position:relative;display:grid;place-items:center;padding:22px;border-radius:14px;border:1px solid var(--line,#25314a);background:radial-gradient(50% 50% at 50% 38%,#1e6fff18,transparent 70%),repeating-conic-gradient(#141c2e 0% 25%,#0f1625 0% 50%) 0 0/24px 24px}'+
 '#pwaBig{width:min(330px,74vw);height:auto;border-radius:22px;box-shadow:0 22px 56px #000c,0 0 0 1px #334466;transition:transform .25s}'+
 '#pwaBig:hover{transform:scale(1.025) rotate(-.6deg)}'+
 '.pwa-hint{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);font-size:10.5px;color:#a3e635;background:#0a0f1acc;padding:3px 10px;border-radius:11px;border:1px solid #a3e63544}'+
 '.pwa-strip{display:flex;gap:11px;flex-wrap:wrap;align-items:flex-end;margin-top:14px}'+
 '.pwa-thumb{display:flex;flex-direction:column;align-items:center;gap:4px}'+
 '.pwa-thumb canvas{border-radius:8px;box-shadow:0 5px 14px #000a,0 0 0 1px #25314a;background:#0f1625}'+
 '.pwa-thumb span{font:600 9.5px/1 ui-monospace,monospace;color:#5a6a84}'+
 '.pwa-devices{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px}'+
 '.pwa-dev{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}'+
 '.pwa-dev span{font-size:11px;color:#8899b4;line-height:1.4}.pwa-dev i{color:#5a6a84;font-style:normal;font-size:10px}'+
 '.pwa-home{width:96px;height:96px;border-radius:28px;overflow:hidden;box-shadow:0 10px 26px #000b,0 0 0 1px #334466;background:#0f1625}'+
 '.pwa-home canvas{width:100%;height:100%;display:block}'+
 '.pwa-ios{width:92px;height:92px;border-radius:21px;overflow:hidden;box-shadow:0 10px 26px #000b,0 0 0 1px #334466}'+
 '.pwa-ios canvas{width:100%;height:100%;display:block}'+
 '.pwa-splash{width:112px;height:150px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;box-shadow:0 10px 26px #000b,0 0 0 1px #334466}'+
 '.pwa-splash canvas{width:62px;height:62px;border-radius:14px}'+
 '.pwa-splash b{font-size:10.5px;letter-spacing:1.2px;color:#e8eefc}'+
 '.pwa-score{display:flex;align-items:center;gap:12px;margin-bottom:10px}'+
 '.pwa-score .bar{flex:1;margin:0}.pwa-score b{font-size:13px;white-space:nowrap}'+
 '.pwa-check{list-style:none;display:flex;flex-direction:column;gap:5px;margin-bottom:10px}'+
 '.pwa-check li{display:flex;gap:9px;align-items:flex-start;padding:7px 9px;border-radius:9px;background:#0f1625;border:1px solid #25314a;font-size:12.5px}'+
 '.pwa-check li.ok{border-color:#22c55e44}.pwa-check li.ko{border-color:#f59e0b55;background:#f59e0b0d}'+
 '.pwa-check .ic{flex:none;font-size:13px}'+
 '.pwa-check b{display:block;font-weight:700;color:#e8eefc}'+
 '.pwa-check i{display:block;font-style:normal;font-size:11px;color:#8899b4;margin-top:1px;word-break:break-word}'+
 '.pwa-prog{display:flex;align-items:center;gap:11px;margin-bottom:10px}.pwa-prog .bar{flex:1;margin:0}'+
 '.pwa-code{margin-top:12px}.pwa-code h3{font-size:12px;color:#ffd166;margin-bottom:5px}'+
 '.pwa-code pre{background:#0a0f1a;border:1px solid #25314a;border-radius:10px;padding:11px;font:11px/1.5 ui-monospace,monospace;color:#a3e635;max-height:210px;overflow:auto;white-space:pre;margin-bottom:6px}'+
 '.pwa-controls h2{color:#ffd166}'+
 '.ctl{margin-bottom:11px}.ctl-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}'+
 '.ctl-h label{margin:0}.ctl-h output{font:700 11px/1 ui-monospace,monospace;color:#a3e635}'+
 '.pwa-controls input[type=range]{width:100%;appearance:none;-webkit-appearance:none;height:6px;border-radius:6px;margin:6px 0 0;padding:0;border:0;background:linear-gradient(90deg,#ff7a1a,#38bdf8)}'+
 '.pwa-controls input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;background:#e8eefc;border:3px solid #ff7a1a;box-shadow:0 0 10px #ff7a1a99;cursor:grab}'+
 '.pwa-controls input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#e8eefc;border:3px solid #ff7a1a;cursor:grab}'+
 '.pwa-colors{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:12px}'+
 '.pwa-colors div{display:flex;flex-direction:column;gap:3px;align-items:center}'+
 '.pwa-colors input[type=color]{width:100%;height:32px;border:1px solid #334466;border-radius:9px;background:#0f1625;padding:2px;cursor:pointer;margin:0}'+
 '.pwa-colors span{font-size:9.5px;color:#5a6a84;text-align:center;line-height:1.2}'+
 '.pwa-toggles{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:11px}'+
 '.pwa-drop{border:2px dashed #334466;border-radius:11px;padding:11px;text-align:center;font-size:11.5px;color:#8899b4;cursor:pointer;margin-bottom:11px;transition:.18s}'+
 '.pwa-drop:hover,.pwa-drop.over{border-color:#38bdf8;color:#38bdf8;background:#38bdf812}'+
 '.pwa-sep{height:1px;background:linear-gradient(90deg,#ff7a1a66,#38bdf866,transparent);margin:13px 0}'+
 '.pwa-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:9px}'+
 '.pwa-controls::-webkit-scrollbar{width:9px}.pwa-controls::-webkit-scrollbar-track{background:#0a0f1a}'+
 '.pwa-controls::-webkit-scrollbar-thumb{background:linear-gradient(#ff7a1a,#38bdf8);border-radius:7px;border:2px solid #0a0f1a}'+
 '.pwa-code pre::-webkit-scrollbar{width:9px;height:9px}.pwa-code pre::-webkit-scrollbar-track{background:#0a0f1a}'+
 '.pwa-code pre::-webkit-scrollbar-thumb{background:#38bdf8;border-radius:7px;border:2px solid #0a0f1a}';
 document.head.appendChild(s)}

/* ================= BOOT ================= */
function boot(){
 css();hook();
 /* régénère silencieusement le jeu au démarrage pour l'icône installée */
 setTimeout(function(){generate().then(function(){injectDom()}).catch(function(){})},900);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFPwa={render:renderPwa,generate:generate,inject:injectDom,zip:doZip,commit:commitAll,
 manifest:manifestTxt,assetlinks:assetlinksTxt,check:checklist,state:ST,open:openPwa};
})();
