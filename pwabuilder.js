/* KEV FUSION 2026 — pwabuilder.js v2.0.0
   Mode PWABUILDER opérationnel : icône véhicule sportif VERT, jeu complet généré,
   publication HTTP réelle des PNG + manifest (GitHub API) — jamais de blob: manifest
   (cause de l'échec PWABuilder), sonde 404 des icônes, assetlinks, ZIP, checklist live. */
(function(){
'use strict';
if(typeof window==='undefined')return;
var $=function(s){return document.querySelector(s)};
var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var LS={get:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
function toast(m){if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},2800)}

/* ============ ÉTAT — vert sportif par défaut ============ */
var DEF={src:'sport',bg:'radial',c1:'#04140c',c2:'#0b3d24',car:'#22c55e',rim:'#a3e635',
 scale:104,dx:0,dy:2,rot:0,radius:24,pad:15,glow:46,shadow:52,grain:12,
 badge:false,badgeText:'2026',rims:true,safe:true,grid:false,spoiler:true,
 pkg:'io.github.expertkevin06_cell.kevfusion',fp:'',token:'',abs:true};
var ST=Object.assign({},DEF,LS.get('pwaStudio2',{}));
var IMG=null,GEN={},PROBE={},raf=0,busy=false;
var ANY=[512,192,144,96,72,48,32,16];
var MASK=[512,192];
var FILES=ANY.map(function(s){return'icon-'+s+'.png'})
 .concat(MASK.map(function(s){return'icon-'+s+'-maskable.png'}))
 .concat(['apple-touch-icon.png']);

/* ============ COULEURS ============ */
function shade(hex,f){var n=parseInt(String(hex).slice(1),16);
 var r=(n>>16)&255,g=(n>>8)&255,b=n&255;
 r=Math.max(0,Math.min(255,Math.round(r*f)));g=Math.max(0,Math.min(255,Math.round(g*f)));b=Math.max(0,Math.min(255,Math.round(b*f)));
 return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
function wheel(x,cx,cy,r,rim,on,spokes){
 x.save();
 x.fillStyle='#05070a';x.beginPath();x.arc(cx,cy,r,0,7);x.fill();
 x.strokeStyle='#161d26';x.lineWidth=r*.17;x.beginPath();x.arc(cx,cy,r*.87,0,7);x.stroke();
 var g=x.createRadialGradient(cx-r*.24,cy-r*.24,r*.04,cx,cy,r*.64);
 g.addColorStop(0,on?shade(rim,1.4):'#66707e');g.addColorStop(1,on?shade(rim,.66):'#252d36');
 x.fillStyle=g;x.beginPath();x.arc(cx,cy,r*.62,0,7);x.fill();
 x.strokeStyle=on?shade(rim,.5):'#1b222a';x.lineWidth=r*.12;
 var n=spokes||5;
 for(var i=0;i<n;i++){var a=i*Math.PI*2/n-Math.PI/2;
  x.beginPath();x.moveTo(cx+Math.cos(a)*r*.13,cy+Math.sin(a)*r*.13);
  x.lineTo(cx+Math.cos(a)*r*.56,cy+Math.sin(a)*r*.56);x.stroke()}
 x.fillStyle='#0a0e13';x.beginPath();x.arc(cx,cy,r*.18,0,7);x.fill();
 x.fillStyle=on?rim:'#4a5460';x.beginPath();x.arc(cx,cy,r*.07,0,7);x.fill();
 x.restore()}

/* ---- VÉHICULE SPORTIF VERT (icône par défaut) ---- */
function sport(x,s){
 var c=s.car;
 x.save();
 x.fillStyle='rgba(0,0,0,.5)';x.beginPath();x.ellipse(0,17,48,4.4,0,0,7);x.fill();
 if(s.spoiler){
  x.fillStyle=shade(c,.5);x.fillRect(-49,-13.6,13,3.1);
  x.fillStyle=shade(c,.34);x.fillRect(-46,-10.8,3.2,8.4);
  x.fillStyle=shade(c,.7);x.fillRect(-49,-14.4,13,1.1)}
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
 var w=x.createLinearGradient(-14,-14,23,-5);
 w.addColorStop(0,'#04120c');w.addColorStop(.5,'#0d3324');w.addColorStop(1,'#04120c');
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
 wheel(x,-27,12,8.9,s.rim,s.rims,5);wheel(x,29.4,12,8.9,s.rim,s.rims,5);
 x.restore()}
function supercar(x,s){
 var c=s.car;x.save();
 x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.ellipse(0,16,47,4.2,0,0,7);x.fill();
 var g=x.createLinearGradient(0,-17,0,14);g.addColorStop(0,shade(c,1.42));g.addColorStop(.42,c);g.addColorStop(1,shade(c,.52));
 x.fillStyle=g;x.beginPath();
 x.moveTo(-46,10);x.lineTo(-44,1.5);x.quadraticCurveTo(-31,-2,-18,-4.2);
 x.quadraticCurveTo(-8,-15.4,6,-15.2);x.quadraticCurveTo(18.5,-14,26,-6);
 x.quadraticCurveTo(38,-3,46,1.6);x.lineTo(47.4,8);x.quadraticCurveTo(47.4,12,42,12);
 x.lineTo(-42,12);x.quadraticCurveTo(-46,12,-46,10);x.closePath();x.fill();
 x.fillStyle='#0a1622';x.beginPath();x.moveTo(-13.6,-5);x.quadraticCurveTo(-6,-13,5,-12.9);
 x.quadraticCurveTo(15,-12,21.4,-6.2);x.lineTo(2,-6.2);x.closePath();x.fill();
 x.fillStyle=shade(c,.42);x.beginPath();x.moveTo(-25,3.4);x.lineTo(-11,1.6);x.lineTo(-13.4,9.2);x.lineTo(-27,9.2);x.closePath();x.fill();
 x.fillStyle='#fff6cf';x.beginPath();x.moveTo(39.4,.6);x.lineTo(46.4,2.6);x.lineTo(45.4,6);x.lineTo(38.6,4);x.closePath();x.fill();
 x.fillStyle='#ff3b30';x.fillRect(-46.2,3.6,3.2,3);
 wheel(x,-27,12,8.6,s.rim,s.rims,5);wheel(x,29,12,8.6,s.rim,s.rims,5);x.restore()}
function rally(x,s){
 var c=s.car;x.save();
 x.fillStyle='rgba(0,0,0,.42)';x.beginPath();x.ellipse(0,17,47,4.2,0,0,7);x.fill();
 x.fillStyle=shade(c,.72);x.fillRect(-48,-15.4,11,3.2);
 x.fillStyle=shade(c,.5);x.fillRect(-45,-12.4,3.4,9);
 var g=x.createLinearGradient(0,-15,0,14);g.addColorStop(0,shade(c,1.45));g.addColorStop(.4,c);g.addColorStop(1,shade(c,.5));
 x.fillStyle=g;x.beginPath();
 x.moveTo(-46,10);x.lineTo(-45,.4);x.quadraticCurveTo(-32,-3,-22,-4.4);
 x.quadraticCurveTo(-13,-13.6,-1,-13.4);x.quadraticCurveTo(12,-13.2,19,-6.2);
 x.lineTo(33,-4.2);x.quadraticCurveTo(44,-2.2,46,1.8);x.lineTo(47.2,8);
 x.quadraticCurveTo(47.2,12,42,12);x.lineTo(-42,12);x.quadraticCurveTo(-46,12,-46,10);x.closePath();x.fill();
 x.fillStyle='#0a1622';
 x.beginPath();x.moveTo(-18,-5.2);x.quadraticCurveTo(-11,-11.4,-1.6,-11.3);x.lineTo(-1.6,-5.2);x.closePath();x.fill();
 x.beginPath();x.moveTo(1.4,-11.3);x.quadraticCurveTo(10.6,-11.2,16.4,-6);x.lineTo(1.4,-6);x.closePath();x.fill();
 x.fillStyle=shade(c,.44);x.beginPath();x.moveTo(22,-7.4);x.lineTo(32,-6.2);x.lineTo(32,-3.6);x.lineTo(22,-4.6);x.closePath();x.fill();
 x.fillStyle='#fff6cf';x.beginPath();x.moveTo(39.6,.8);x.lineTo(46.4,2.8);x.lineTo(45.4,6.2);x.lineTo(38.8,4.2);x.closePath();x.fill();
 x.fillStyle='#ff3b30';x.fillRect(-46.2,2.6,3.6,4.4);
 wheel(x,-27,12,8.6,s.rim,true,10);wheel(x,29,12,8.6,s.rim,true,10);x.restore()}
function mono(x,s){
 x.save();
 var g=x.createLinearGradient(-34,-34,34,34);g.addColorStop(0,s.car);g.addColorStop(.55,s.rim);g.addColorStop(1,s.c2);
 x.fillStyle=g;x.font='900 46px system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
 x.textAlign='center';x.textBaseline='middle';x.fillText('KF',0,4);
 x.fillStyle=s.car;x.beginPath();
 x.moveTo(0,-33);x.quadraticCurveTo(8,-24,4.6,-17);x.quadraticCurveTo(11.4,-20.4,10,-28.6);
 x.quadraticCurveTo(15.6,-19,11,-12.4);x.quadraticCurveTo(4.6,-8,0,-12.6);
 x.quadraticCurveTo(-7,-17,-3.6,-24);x.quadraticCurveTo(-2.4,-19.4,1,-19.6);
 x.quadraticCurveTo(-3.6,-26,0,-33);x.closePath();x.fill();
 x.fillStyle='rgba(255,255,255,.3)';x.font='700 8.4px system-ui,sans-serif';
 x.fillText('EXPERT AUTO · DROIT',0,26);x.restore()}
function flame(x,s){
 x.save();
 var g=x.createLinearGradient(0,-36,0,30);
 g.addColorStop(0,'#f2ffe0');g.addColorStop(.32,s.rim);g.addColorStop(.68,s.car);g.addColorStop(1,shade(s.car,.45));
 x.fillStyle=g;x.beginPath();
 x.moveTo(0,-36);x.quadraticCurveTo(19,-18,13,-4);x.quadraticCurveTo(24,-10,21,-24);
 x.quadraticCurveTo(33,-4,22,14);x.quadraticCurveTo(12,29,0,29);
 x.quadraticCurveTo(-13,29,-23,14);x.quadraticCurveTo(-33,-4,-21,-24);
 x.quadraticCurveTo(-24,-10,-13,-4);x.quadraticCurveTo(-19,-18,0,-36);x.closePath();x.fill();
 x.fillStyle='rgba(255,255,255,.4)';x.beginPath();
 x.moveTo(0,-14);x.quadraticCurveTo(9,-2,6,8);x.quadraticCurveTo(2,17,0,17);
 x.quadraticCurveTo(-3,17,-7,8);x.quadraticCurveTo(-9,-2,0,-14);x.closePath();x.fill();x.restore()}
function upload(x,S,s){
 if(!IMG){sport(x,s);return}
 var base=Math.max(S/IMG.width,S/IMG.height),sc=base*(s.scale/100);
 var w=IMG.width*sc,h=IMG.height*sc;x.drawImage(IMG,-w/2,-h/2,w,h)}

/* ============ RENDU ============ */
function paint(ctx,S,s,mask,showSafe){
 ctx.clearRect(0,0,S,S);ctx.save();
 var rad=(s.radius/100)*(S/2);
 if(s.bg!=='transparent'){
  rr(ctx,0,0,S,S,mask?0:rad);ctx.clip();
  if(s.bg==='gradient'){var g=ctx.createLinearGradient(0,0,S,S);g.addColorStop(0,s.c1);g.addColorStop(.55,shade(s.c2,.7));g.addColorStop(1,s.c2);ctx.fillStyle=g}
  else if(s.bg==='radial'){var g2=ctx.createRadialGradient(S*.34,S*.26,S*.04,S*.5,S*.52,S*.82);g2.addColorStop(0,shade(s.c2,1.25));g2.addColorStop(.6,s.c2);g2.addColorStop(1,s.c1);ctx.fillStyle=g2}
  else ctx.fillStyle=s.c1;
  ctx.fillRect(0,0,S,S);
  var v=ctx.createRadialGradient(S/2,S*.34,S*.08,S/2,S*.52,S*.82);
  v.addColorStop(0,'rgba(255,255,255,.10)');v.addColorStop(1,'rgba(0,0,0,.58)');
  ctx.fillStyle=v;ctx.fillRect(0,0,S,S);
  if(s.grain>0){ctx.globalAlpha=s.grain/460;
   for(var i=0;i<Math.round(S*1.05);i++){ctx.fillStyle=i%2?'#fff':'#000';ctx.fillRect(Math.random()*S,Math.random()*S,1,1)}
   ctx.globalAlpha=1}}
 var content=(mask?1-(s.pad/100)*1.16:1)*(s.scale/100);
 ctx.translate(S/2+(s.dx/100)*S,S/2+(s.dy/100)*S);
 ctx.rotate(s.rot*Math.PI/180);
 var k=(S/114)*content;ctx.scale(k,k);
 if(s.shadow>0){ctx.shadowColor='rgba(0,0,0,.88)';ctx.shadowBlur=s.shadow*.23;ctx.shadowOffsetY=s.shadow*.09}
 if(s.glow>0){ctx.shadowColor=s.car;ctx.shadowBlur=s.glow*.42}
 if(s.src==='sport')sport(ctx,s);
 else if(s.src==='supercar')supercar(ctx,s);
 else if(s.src==='rally')rally(ctx,s);
 else if(s.src==='mono')mono(ctx,s);
 else if(s.src==='flame')flame(ctx,s);
 else upload(ctx,S/k,s);
 ctx.restore();
 if(s.badge&&s.badgeText){
  ctx.save();rr(ctx,0,0,S,S,mask?0:rad);ctx.clip();
  var bh=S*.155,bg=ctx.createLinearGradient(0,S-bh,S,S);
  bg.addColorStop(0,'rgba(0,0,0,.84)');bg.addColorStop(1,'rgba(0,0,0,.6)');
  ctx.fillStyle=bg;ctx.fillRect(0,S-bh,S,bh);
  ctx.fillStyle=s.rim;ctx.font='800 '+(bh*.56)+'px system-ui,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s.badgeText,S/2,S-bh/2);ctx.restore()}
 if(showSafe&&mask){
  ctx.save();ctx.strokeStyle='#a3e635';ctx.setLineDash([S*.018,S*.014]);
  ctx.lineWidth=Math.max(1,S*.0055);ctx.beginPath();ctx.arc(S/2,S/2,S*.4,0,7);ctx.stroke();
  ctx.setLineDash([]);ctx.strokeStyle='rgba(163,230,53,.3)';ctx.lineWidth=Math.max(1,S*.003);
  ctx.strokeRect(S*.1,S*.1,S*.8,S*.8);ctx.restore()}
 if(s.grid){
  ctx.save();ctx.strokeStyle='rgba(56,189,248,.26)';ctx.lineWidth=Math.max(1,S*.0025);
  for(var j=1;j<8;j++){var p=S*j/8;
   ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,S);ctx.stroke();
   ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(S,p);ctx.stroke()}
  ctx.strokeStyle='rgba(34,197,94,.6)';ctx.beginPath();
  ctx.moveTo(S/2,0);ctx.lineTo(S/2,S);ctx.moveTo(0,S/2);ctx.lineTo(S,S/2);ctx.stroke();ctx.restore()}}
function canvasOf(S,mask,safe){
 var c=document.createElement('canvas');c.width=c.height=S;
 paint(c.getContext('2d'),S,ST,mask,!!safe&&ST.safe);return c}
function blobOf(c){return new Promise(function(r){c.toBlob(r,'image/png')})}
async function pngOf(S,mask){var c=canvasOf(S,mask,false);return new Uint8Array(await (await blobOf(c)).arrayBuffer())}

/* ============ ZIP ============ */
var CT=(function(){var t=new Uint32Array(256);
 for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
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
 end.setUint32(0,0x06054b50,true);end.setUint16(4,0,true);end.setUint16(6,0,true);
 end.setUint16(8,entries.length,true);end.setUint16(10,entries.length,true);
 end.setUint32(12,cs,true);end.setUint32(16,off,true);end.setUint16(20,0,true);
 return new Blob(parts.concat(central,[new Uint8Array(end.buffer)]),{type:'application/zip'})}
function dl(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href)},6000)}
function b64u8(u8){var o='',CH=0x8000;for(var i=0;i<u8.length;i+=CH)o+=String.fromCharCode.apply(null,u8.subarray(i,i+CH));return btoa(o)}
function utf8b64(s){return b64u8(new TextEncoder().encode(s))}

/* ============ BASE / MANIFEST ============ */
function basePath(){
 var p=location.pathname.replace(/[^/]*$/,'');
 if(!p||p==='/')return '/';
 return p}
function siteUrl(){return location.origin+basePath()}
function manifestObj(){
 var abs=!!ST.abs,bp=basePath();
 var P=function(f){return abs?(bp+f):('./'+f)};
 var icons=ANY.map(function(s){return{src:P('icon-'+s+'.png'),sizes:s+'x'+s,type:'image/png',purpose:'any'}});
 MASK.forEach(function(s){icons.push({src:P('icon-'+s+'-maskable.png'),sizes:s+'x'+s,type:'image/png',purpose:'maskable'})});
 icons.push({src:P('apple-touch-icon.png'),sizes:'180x180',type:'image/png',purpose:'any'});
 var order=[192,512];
 icons.sort(function(a,b){
  var sa=parseInt(a.sizes),sb=parseInt(b.sizes);
  var ia=order.indexOf(sa),ib=order.indexOf(sb);
  if(ia>=0&&ib>=0)return ia-ib;if(ia>=0)return -1;if(ib>=0)return 1;
  return sb-sa});
 return{name:'KEV FUSION 2026 — Expert Auto & Droit',short_name:'KEV FUSION',
  description:'Expert automobile & avocat : corrélation par code moteur, pannes connues, DTC, campagnes de rappel, TSB, étude incendie, juridique, VIN, OBD.',
  id:abs?(bp+'index.html'):'./index.html',
  start_url:abs?(bp+'index.html'):'./index.html',
  scope:abs?bp:'./',
  display:'standalone',display_override:['standalone','minimal-ui'],
  orientation:'any',lang:'fr',dir:'ltr',
  theme_color:ST.c1,background_color:ST.c1,
  categories:['productivity','utilities','business','education'],
  icons:icons,
  shortcuts:[
   {name:'Recherche prédictive',short_name:'Recherche',url:(abs?bp+'index.html':'./index.html')+'?view=recherche',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'Étude corrélée',short_name:'Étude',url:(abs?bp+'index.html':'./index.html')+'?view=etude',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'JusteRepère',short_name:'Juridique',url:(abs?bp+'index.html':'./index.html')+'?view=jr',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'Lecture VIN',short_name:'VIN',url:(abs?bp+'index.html':'./index.html')+'?view=vin',icons:[{src:P('icon-96.png'),sizes:'96x96'}]}]}}
function manifestTxt(){return JSON.stringify(manifestObj(),null,2)}
function assetlinksTxt(){
 var fp=(ST.fp||'').trim()||'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99';
 return JSON.stringify([{relation:['delegate_permission/common.handle_all_urls'],
  target:{namespace:'android_app',package_name:ST.pkg||'io.github.expertkevin06_cell.kevfusion',
   sha256_cert_fingerprints:[fp]}}],null,2)}

/* ============ GÉNÉRATION + INJECTION (sans blob manifest) ============ */
async function generate(){
 GEN={};
 for(var i=0;i<ANY.length;i++)GEN['icon-'+ANY[i]+'.png']=canvasOf(ANY[i],false,false).toDataURL('image/png');
 for(var j=0;j<MASK.length;j++)GEN['icon-'+MASK[j]+'-maskable.png']=canvasOf(MASK[j],true,false).toDataURL('image/png');
 GEN['apple-touch-icon.png']=canvasOf(180,false,false).toDataURL('image/png');
 LS.set('pwaGen',{ts:Date.now(),n:Object.keys(GEN).length,car:ST.car});
 return GEN}
function injectIcons(){
 if(!GEN['icon-192.png'])return;
 $$('link[data-kficon]').forEach(function(n){n.remove()});
 var add=function(rel,href,sizes){var l=document.createElement('link');
  l.rel=rel;l.href=href;if(sizes)l.setAttribute('sizes',sizes);
  l.setAttribute('data-kficon','1');document.head.appendChild(l)};
 add('icon',GEN['icon-32.png'],'32x32');
 add('icon',GEN['icon-192.png'],'192x192');
 add('icon',GEN['icon-512.png'],'512x512');
 add('apple-touch-icon',GEN['apple-touch-icon.png'],'180x180');
 var set=function(n,c){var m=document.querySelector('meta[name="'+n+'"]');
  if(!m){m=document.createElement('meta');m.name=n;document.head.appendChild(m)}m.content=c};
 set('theme-color',ST.c1);
 set('apple-mobile-web-app-capable','yes');
 set('apple-mobile-web-app-status-bar-style','black-translucent');
 set('apple-mobile-web-app-title','KEV FUSION');
 /* le manifest HTTP réel n'est JAMAIS remplacé : PWABuilder doit pouvoir le lire */
 var ml=document.querySelector('link[rel="manifest"]');
 if(ml&&/^blob:/.test(ml.href)){ml.href='manifest.webmanifest';delete ml._kfUrl}
 if(!ml){ml=document.createElement('link');ml.rel='manifest';ml.href='manifest.webmanifest';document.head.appendChild(ml)}
}

/* ============ GITHUB ============ */
function detectRepo(){
 var h=location.hostname,m=h.match(/^([^.]+)\.github\.io$/);
 var owner=m?m[1]:'expertkevin06-cell';
 var seg=location.pathname.split('/').filter(Boolean);
 var repo=(m&&seg.length)?seg[0]:'kev-fusion';
 if(!m)repo='kev-fusion';
 return Object.assign({owner:owner,repo:repo,branch:'main'},LS.get('ghCfg',{}))}
function token(){return (ST.token||'').trim()||LS.get('ghToken','')}
async function ghPut(path,data,isText){
 var c=detectRepo(),tk=token();
 if(!tk)throw new Error('Jeton GitHub manquant');
 var api='https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/'+path;
 var sha=null;
 try{var g=await fetch(api+'?ref='+encodeURIComponent(c.branch)+'&t='+Date.now(),
   {headers:{Authorization:'Bearer '+tk,Accept:'application/vnd.github+json'},cache:'no-store'});
  if(g.ok){var j=await g.json();sha=j.sha}}catch(e){}
 var body={message:'KEV FUSION · PWA '+path,content:isText?utf8b64(data):b64u8(data),branch:c.branch};
 if(sha)body.sha=sha;
 var r=await fetch(api,{method:'PUT',headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify(body)});
 if(!r.ok){var t=await r.text().catch(function(){return''});throw new Error(path+' → HTTP '+r.status+' '+t.slice(0,140))}
 return r.json()}
function prog(done,total,label){
 var b=$('#pwaProg'),l=$('#pwaProgTxt');
 if(b)b.style.width=(total?Math.round(done/total*100):0)+'%';
 if(l)l.textContent=label}
async function publish(){
 if(busy)return;busy=true;
 try{
  if(!token()){prog(0,1,'❌ Colle ton jeton GitHub (champ ci-contre) puis relance.');toast('🔑 Jeton GitHub requis');busy=false;return}
  if(!GEN['icon-192.png'])await generate();
  var total=FILES.length+2,done=0;
  prog(0,total,'Publication…');
  for(var i=0;i<FILES.length;i++){
   var f=FILES[i],data=GEN[f];
   if(!data)throw new Error('icône manquante : '+f);
   var u8=new Uint8Array(await (await fetch(data)).arrayBuffer());
   await ghPut(f,u8,false);done++;prog(done,total,'✅ '+f)}
  await ghPut('manifest.webmanifest',manifestTxt(),true);done++;prog(done,total,'✅ manifest.webmanifest');
  await ghPut('.well-known/assetlinks.json',assetlinksTxt(),true);done++;prog(done,total,'✅ assetlinks.json');
  prog(total,total,'🎉 Publié — '+total+' fichiers. Attends le déploiement Pages (~1 min) puis ouvre PWABuilder.');
  toast('📡 Icônes + manifest publiés');
  LS.set('ghToken',token());
  setTimeout(function(){probe();check()},4000);
 }catch(e){prog(0,1,'❌ '+e.message);toast('GitHub : '+e.message)}
 busy=false}

/* ============ SONDE HTTP DES ICÔNES ============ */
async function probe(){
 PROBE={};
 var list=FILES.concat(['manifest.webmanifest']);
 for(var i=0;i<list.length;i++){
  var f=list[i];
  try{var r=await fetch(f+'?probe='+Date.now(),{cache:'no-store',method:'GET'});
   PROBE[f]=r.ok?200:r.status}catch(e){PROBE[f]=0}}
 var el=$('#pwaProbe');
 if(el){
  var ok=Object.keys(PROBE).filter(function(k){return PROBE[k]===200}).length;
  el.innerHTML='<div class="pwa-probe-h"><b>'+ok+' / '+list.length+'</b> fichiers servis en HTTP</div>'+
   list.map(function(f){var c=PROBE[f];
    return '<span class="pwa-pill '+(c===200?'ok':'ko')+'">'+(c===200?'✓':'✗')+' '+esc(f)+(c!==200?' <i>'+(c||'réseau')+'</i>':'')+'</span>'}).join('')}
 return PROBE}

/* ============ CHECKLIST ============ */
async function check(){
 var out=[],mf=null,mfStatus=0;
 out.push({ok:location.protocol==='https:'||location.hostname==='localhost',l:'HTTPS',d:location.protocol});
 try{var r=await fetch('manifest.webmanifest?t='+Date.now(),{cache:'no-store'});
  mfStatus=r.status;if(r.ok)mf=await r.json()}catch(e){}
 out.push({ok:!!mf,l:'manifest.webmanifest lisible par PWABuilder',d:mf?'HTTP 200 · JSON valide':'HTTP '+(mfStatus||'réseau')+' — publie le manifest'});
 var reg=null;try{if('serviceWorker'in navigator)reg=await navigator.serviceWorker.getRegistration()}catch(e){}
 out.push({ok:!!(reg&&reg.active),l:'Service Worker actif',d:reg?(reg.active?'contrôlé':'en attente'):'non enregistré'});
 out.push({ok:!!(mf&&mf.name&&mf.short_name),l:'name + short_name',d:mf?mf.short_name:'—'});
 out.push({ok:!!(mf&&mf.start_url&&mf.scope),l:'start_url + scope',d:mf?(mf.start_url+' · '+mf.scope):'—'});
 out.push({ok:!!(mf&&mf.display==='standalone'),l:'display standalone',d:mf?mf.display:'—'});
 out.push({ok:!!(mf&&mf.theme_color&&mf.background_color),l:'theme + background color',d:mf?(mf.theme_color+' / '+mf.background_color):'—'});
 var ic=(mf&&mf.icons)||[];
 var find=function(sz,pur){return ic.filter(function(i){return String(i.sizes).indexOf(sz+'x')===0&&(!pur||String(i.purpose||'').indexOf(pur)>=0)})[0]};
 [['192','any'],['512','any'],['512','maskable'],['192','maskable']].forEach(function(p){
  var e=find(p[0],p[1]);
  var served=e?PROBE[e.src.replace(/^\//,'').split('/').pop()]:null;
  out.push({ok:!!e&&(served===200||served==null),l:'icône '+p[0]+' '+p[1],
   d:e?(e.src+(served===200?' · HTTP 200':served?' · HTTP '+served:' · non sondée')):'absente du manifest'})});
 var served=FILES.filter(function(f){return PROBE[f]===200}).length;
 out.push({ok:served===FILES.length,l:'toutes les icônes servies ('+served+'/'+FILES.length+')',
  d:served===FILES.length?'pack complet en ligne':'clique « Publier sur GitHub »'});
 out.push({ok:!!token(),l:'jeton GitHub (publication auto)',d:token()?'configuré':'champ « Jeton GitHub » ci-contre'});
 out.push({ok:/^[0-9A-F]{2}(:[0-9A-F]{2}){31}$/i.test((ST.fp||'').trim()),l:'empreinte SHA-256 assetlinks',d:ST.fp?'renseignée':'à coller depuis PWABuilder (Signing key)'});
 var ul=$('#pwaCheck');
 if(ul){
  var ok=out.filter(function(x){return x.ok}).length,pct=Math.round(ok/out.length*100);
  var b=$('#pwaScoreBar'),t=$('#pwaScoreTxt');
  if(b)b.style.width=pct+'%';
  if(t){t.textContent=ok+' / '+out.length+' · '+pct+'%';t.className=pct>=90?'st-ok':pct>=65?'st-warn':'st-fail'}
  ul.innerHTML=out.map(function(x){return '<li class="'+(x.ok?'ok':'ko')+'"><span class="ic">'+(x.ok?'✅':'⚠️')+'</span><span><b>'+esc(x.l)+'</b><i>'+esc(x.d)+'</i></span></li>'}).join('')}
 return out}

/* ============ VUE ============ */
function rangeCtl(id,label,min,max,unit){
 return '<div class="ctl"><div class="ctl-h"><label for="p_'+id+'">'+label+'</label><output id="o_'+id+'">'+ST[id]+(unit||'')+'</output></div>'+
 '<input type="range" id="p_'+id+'" data-pwa="'+id+'" min="'+min+'" max="'+max+'" value="'+ST[id]+'"></div>'}
function renderPwa(){
 var v=$('#view');if(!v)return;
 var repo=detectRepo();
 v.innerHTML=
 '<div class="card pwa-hero">'+
  '<div class="pwa-hero-l"><span class="pwa-badge">PWA · READY</span>'+
   '<h1>Mode PWABuilder</h1>'+
   '<p class="mut">Icône <b>véhicule sportif vert</b> · jeu complet généré · <b>publication HTTP réelle</b> des PNG et du manifest sur ton dépôt — c\'est ce qui manquait : PWABuilder ne peut pas lire un manifest <code>blob:</code> ni des icônes inexistantes.</p>'+
   '<p class="pwa-url">Cible : <b>'+esc(siteUrl())+'</b><br>Dépôt détecté : <b>'+esc(repo.owner+'/'+repo.repo)+'</b> · branche <b>'+esc(repo.branch)+'</b></p></div>'+
  '<div class="pwa-hero-r">'+
   '<button class="pri" data-pwa="publish">📡 Publier sur GitHub</button>'+
   '<button class="jr" data-pwa="open">🚀 Ouvrir PWABuilder</button>'+
   '<button data-pwa="probe">🔍 Sonder les icônes</button>'+
  '</div>'+
 '</div>'+
 '<div class="pwa-wrap">'+
  '<section class="pwa-stage">'+
   '<div class="card pwa-preview"><h2>🎨 Aperçu live</h2>'+
    '<div class="pwa-canvasbox"><canvas id="pwaBig" width="512" height="512"></canvas>'+
     '<span class="pwa-hint" id="pwaHint">zone de sécurité maskable · 80 %</span></div>'+
    '<div class="pwa-strip" id="pwaStrip"></div></div>'+
   '<div class="card"><h2>📱 Rendu appareil</h2><div class="pwa-devices">'+
    '<div class="pwa-dev"><div class="pwa-home"><canvas id="pwaHome" width="192" height="192"></canvas></div><span>Android<br><i>maskable · squircle</i></span></div>'+
    '<div class="pwa-dev"><div class="pwa-ios"><canvas id="pwaIos" width="180" height="180"></canvas></div><span>iOS<br><i>apple-touch-icon</i></span></div>'+
    '<div class="pwa-dev"><div class="pwa-splash" id="pwaSplash"><canvas id="pwaSplashC" width="128" height="128"></canvas><b>KEV FUSION</b></div><span>Splash<br><i>background_color</i></span></div>'+
    '<div class="pwa-dev"><div class="pwa-tab"><canvas id="pwaTab" width="32" height="32"></canvas><span>onglet</span></div><span>Navigateur<br><i>favicon 32</i></span></div>'+
   '</div></div>'+
   '<div class="card"><h2>✅ Conformité PWABuilder</h2>'+
    '<div class="pwa-score"><div class="bar"><i id="pwaScoreBar" style="width:0%"></i></div><b id="pwaScoreTxt">—</b></div>'+
    '<ul class="pwa-check" id="pwaCheck"><li class="mut">Analyse…</li></ul>'+
    '<div class="row"><button data-pwa="recheck">↻ Revérifier</button><button data-pwa="dlcheck">📤 Rapport JSON</button></div></div>'+
   '<div class="card"><h2>🌐 Fichiers réellement servis</h2>'+
    '<div class="pwa-probe" id="pwaProbe"><span class="mut">Clique « Sonder les icônes ».</span></div>'+
    '<p class="mut">Un ✗ signifie que le fichier n\'est pas encore sur le dépôt : PWABuilder échouera tant qu\'il n\'est pas publié.</p></div>'+
   '<div class="card"><h2>📦 Livraison</h2>'+
    '<div class="pwa-prog"><div class="bar"><i id="pwaProg" style="width:0%"></i></div><span class="mut" id="pwaProgTxt">Prêt.</span></div>'+
    '<div class="row">'+
     '<button class="pri" data-pwa="publish">📡 Publier (icônes + manifest + assetlinks)</button>'+
     '<button data-pwa="zip">📦 ZIP complet</button>'+
     '<button data-pwa="png">🖼️ PNG 512</button>'+
     '<button data-pwa="dlmanifest">📄 manifest</button>'+
     '<button data-pwa="dlassetlinks">🔗 assetlinks</button>'+
     '<button data-pwa="ghupload">↗ Ouvrir l\'upload GitHub</button>'+
    '</div>'+
    '<div class="pwa-code"><h3>manifest.webmanifest généré</h3><pre id="pwaManifest"></pre>'+
     '<div class="row"><button data-pwa="copymanifest">📋 Copier</button></div></div>'+
    '<div class="pwa-code"><h3>.well-known/assetlinks.json</h3><pre id="pwaAsset"></pre>'+
     '<div class="row"><button data-pwa="copyasset">📋 Copier</button></div></div>'+
    '<div class="pwa-steps"><h3>Procédure</h3><ol>'+
     '<li>Colle ton <b>jeton GitHub</b> (fine-grained, <i>Contents: Read &amp; write</i>) dans le panneau de droite.</li>'+
     '<li>Clique <b>📡 Publier</b> : les '+FILES.length+' PNG + <code>manifest.webmanifest</code> + <code>.well-known/assetlinks.json</code> sont commités.</li>'+
     '<li>Attends le déploiement Pages, puis <b>🔍 Sonder</b> : tout doit être ✓.</li>'+
     '<li><b>🚀 Ouvrir PWABuilder</b> → Package For Stores → Android → Signing key <i>New</i> (garde le <code>.keystore</code>).</li>'+
     '<li>Copie le <b>SHA-256</b> du keystore dans le champ dédié, republie → la barre d\'URL disparaît dans l\'APK.</li>'+
    '</ol></div></div>'+
  '</section>'+
  '<aside class="pwa-controls card"><h2>🎛️ Réglages live</h2>'+
   '<div class="ctl"><div class="ctl-h"><label>Visuel</label></div><select id="p_src" data-pwa="src">'+
    '<option value="sport">Véhicule sportif VERT</option><option value="supercar">Supercar ambre</option>'+
    '<option value="rally">Berline rally bleue</option><option value="mono">Monogramme KF</option>'+
    '<option value="flame">Flamme</option><option value="upload">Mes photos</option></select></div>'+
   '<div class="pwa-drop" id="pwaDrop">📷 Dépose / clique pour charger une photo</div>'+
   '<input type="file" id="pwaFile" accept="image/*" hidden>'+
   '<div class="ctl"><div class="ctl-h"><label>Fond</label></div><select id="p_bg" data-pwa="bg">'+
    '<option value="radial">Dégradé radial</option><option value="gradient">Dégradé diagonal</option>'+
    '<option value="solid">Uni</option><option value="transparent">Transparent</option></select></div>'+
   '<div class="pwa-colors">'+
    '<div><input type="color" id="p_c1" data-pwa="c1" value="'+ST.c1+'"><span>Fond 1</span></div>'+
    '<div><input type="color" id="p_c2" data-pwa="c2" value="'+ST.c2+'"><span>Fond 2</span></div>'+
    '<div><input type="color" id="p_car" data-pwa="car" value="'+ST.car+'"><span>Carrosserie</span></div>'+
    '<div><input type="color" id="p_rim" data-pwa="rim" value="'+ST.rim+'"><span>Jantes</span></div></div>'+
   rangeCtl('scale','Échelle',40,175,'%')+rangeCtl('dx','Décalage X',-40,40,'')+
   rangeCtl('dy','Décalage Y',-40,40,'')+rangeCtl('rot','Rotation',-45,45,'°')+
   rangeCtl('radius','Arrondi coins',0,50,'%')+rangeCtl('pad','Marge maskable',0,32,'%')+
   rangeCtl('glow','Halo',0,100,'%')+rangeCtl('shadow','Ombre',0,100,'%')+rangeCtl('grain','Grain',0,60,'')+
   '<div class="pwa-toggles">'+
    '<label class="tg" id="t_safe"><input type="checkbox" data-pwat="safe"> Zone maskable</label>'+
    '<label class="tg" id="t_grid"><input type="checkbox" data-pwat="grid"> Grille</label>'+
    '<label class="tg" id="t_rims"><input type="checkbox" data-pwat="rims"> Jantes accent</label>'+
    '<label class="tg" id="t_spoiler"><input type="checkbox" data-pwat="spoiler"> Aileron</label>'+
    '<label class="tg" id="t_badge"><input type="checkbox" data-pwat="badge"> Badge</label>'+
    '<label class="tg" id="t_abs"><input type="checkbox" data-pwat="abs"> Chemins absolus</label></div>'+
   '<div class="ctl"><div class="ctl-h"><label>Texte du badge</label></div>'+
    '<input type="text" id="p_badgeText" data-pwa="badgeText" value="'+esc(ST.badgeText)+'" maxlength="14"></div>'+
   '<div class="pwa-sep"></div>'+
   '<div class="ctl"><div class="ctl-h"><label>Jeton GitHub</label><output>'+(token()?'✓':'—')+'</output></div>'+
    '<input type="password" id="p_token" data-pwa="token" value="'+esc(ST.token||'')+'" placeholder="github_pat_…" autocomplete="off"></div>'+
   '<div class="ctl"><div class="ctl-h"><label>Package Android</label></div>'+
    '<input type="text" id="p_pkg" data-pwa="pkg" value="'+esc(ST.pkg)+'"></div>'+
   '<div class="ctl"><div class="ctl-h"><label>SHA-256 keystore</label></div>'+
    '<input type="text" id="p_fp" data-pwa="fp" value="'+esc(ST.fp)+'" placeholder="AA:BB:…:99"></div>'+
   '<div class="pwa-sep"></div>'+
   '<div class="pwa-actions">'+
    '<button data-pwa="reset">↺ Reset</button><button data-pwa="rand">🎲 Aléatoire</button>'+
    '<button data-pwa="green">💚 Preset vert</button><button data-pwa="inject">💉 Injecter</button>'+
    '<button class="pri" data-pwa="publish">📡 Publier</button><button class="jr" data-pwa="open">🚀 PWABuilder</button></div>'+
   '<p class="mut">Tout s\'applique instantanément. « Injecter » change l\'icône de l\'app installée ; « Publier » écrit les fichiers sur le dépôt pour PWABuilder.</p>'+
  '</aside></div>';
 syncUI();mountStrip();schedule();codes();bind();
 generate().then(function(){injectIcons();probe().then(check)}).catch(function(){check()})}
function syncUI(){
 ['src','bg','badgeText','pkg','fp','token'].forEach(function(k){var e=$('#p_'+k);if(e)e.value=ST[k]||''});
 ['c1','c2','car','rim'].forEach(function(k){var e=$('#p_'+k);if(e)e.value=ST[k]});
 ['scale','dx','dy','rot','radius','pad','glow','shadow','grain'].forEach(function(k){
  var e=$('#p_'+k),o=$('#o_'+k);if(e)e.value=ST[k];
  if(o)o.textContent=ST[k]+(k==='rot'?'°':(k==='grain'?'':'%'))});
 ['safe','grid','rims','badge','spoiler','abs'].forEach(function(k){
  var w=$('#t_'+k);if(!w)return;var i=w.querySelector('input');if(i)i.checked=!!ST[k];w.classList.toggle('on',!!ST[k])})}
function mountStrip(){var s=$('#pwaStrip');if(!s)return;s.innerHTML='';
 [192,144,96,72,48,32,16].forEach(function(n){
  var d=document.createElement('div');d.className='pwa-thumb';
  var c=document.createElement('canvas');c.width=c.height=n;c.dataset.strip=n;
  var l=document.createElement('span');l.textContent=n+'px';
  d.appendChild(c);d.appendChild(l);s.appendChild(d)})}
function schedule(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;draw()})}
function draw(){
 var big=$('#pwaBig');if(!big)return;
 paint(big.getContext('2d'),512,ST,true,ST.safe);
 $$('#pwaStrip canvas').forEach(function(c){paint(c.getContext('2d'),+c.dataset.strip,ST,false,false)});
 var h=$('#pwaHome');if(h)paint(h.getContext('2d'),192,ST,true,false);
 var i=$('#pwaIos');if(i)paint(i.getContext('2d'),180,ST,false,false);
 var s=$('#pwaSplashC');if(s)paint(s.getContext('2d'),128,ST,true,false);
 var sp=$('#pwaSplash');if(sp)sp.style.background=ST.c1;
 var t=$('#pwaTab');if(t)paint(t.getContext('2d'),32,ST,false,false);
 var hi=$('#pwaHint');if(hi)hi.style.display=ST.safe?'block':'none'}
function codes(){var m=$('#pwaManifest');if(m)m.textContent=manifestTxt();
 var a=$('#pwaAsset');if(a)a.textContent=assetlinksTxt()}
function save(){LS.set('pwaStudio2',ST)}
function bind(){
 var root=$('#view');if(!root||root._pwaB)return;root._pwaB=1;
 root.addEventListener('input',function(e){
  var t=e.target,k=t.dataset&&t.dataset.pwa;
  if(k){ST[k]=t.type==='range'?+t.value:t.value;
   var o=$('#o_'+k);if(o)o.textContent=ST[k]+(k==='rot'?'°':(k==='grain'?'':'%'));
   save();schedule();
   if(k==='c1'||k==='c2'||k==='pkg'||k==='fp'||k==='abs')codes();
   if(k==='token')LS.set('ghToken',ST.token||'');
   return}
  var tk=t.dataset&&t.dataset.pwat;
  if(tk){ST[tk]=t.checked;var w=$('#t_'+tk);if(w)w.classList.toggle('on',t.checked);
   save();schedule();if(tk==='abs')codes()}});
 root.addEventListener('change',function(e){
  var k=e.target.dataset&&e.target.dataset.pwa;
  if(k&&(k==='src'||k==='bg')){ST[k]=e.target.value;save();schedule()}});
 var d=$('#pwaDrop'),f=$('#pwaFile');
 if(d&&f){
  d.addEventListener('click',function(){f.click()});
  ['dragover','dragenter'].forEach(function(ev){d.addEventListener(ev,function(e){e.preventDefault();d.classList.add('over')})});
  ['dragleave','drop'].forEach(function(ev){d.addEventListener(ev,function(e){e.preventDefault();d.classList.remove('over')})});
  d.addEventListener('drop',function(e){if(e.dataTransfer.files[0])load(e.dataTransfer.files[0])});
  f.addEventListener('change',function(e){if(e.target.files[0])load(e.target.files[0])})}}
function load(f){var r=new FileReader();
 r.onload=function(){var i=new Image();i.onload=function(){IMG=i;ST.src='upload';
  var s=$('#p_src');if(s)s.value='upload';var d=$('#pwaDrop');if(d)d.textContent='✅ '+f.name;
  save();schedule();toast('📷 Photo chargée')};i.src=r.result};r.readAsDataURL(f)}

/* ============ ACTIONS ============ */
async function doZip(){
 if(!GEN['icon-192.png'])await generate();
 prog(0,1,'Assemblage du ZIP…');
 var entries=[];
 for(var i=0;i<ANY.length;i++)entries.push({name:'icon-'+ANY[i]+'.png',u8:await pngOf(ANY[i],false)});
 for(var j=0;j<MASK.length;j++)entries.push({name:'icon-'+MASK[j]+'-maskable.png',u8:await pngOf(MASK[j],true)});
 entries.push({name:'apple-touch-icon.png',u8:await pngOf(180,false)});
 entries.push({name:'manifest.webmanifest',u8:new TextEncoder().encode(manifestTxt())});
 entries.push({name:'.well-known/assetlinks.json',u8:new TextEncoder().encode(assetlinksTxt())});
 entries.push({name:'LISEZ-MOI.txt',u8:new TextEncoder().encode(
  'KEV FUSION 2026 — Pack PWA / PWABuilder\n\n'+
  '1. Dépose TOUT ce contenu à la racine du dépôt (dossier .well-known inclus).\n'+
  '2. Commit + push, attends le déploiement GitHub Pages.\n'+
  '3. Vérifie dans le studio : « Sonder les icônes » doit tout afficher ✓.\n'+
  '4. https://www.pwabuilder.com → '+siteUrl()+'\n'+
  '5. Package For Stores → Android → Signing key New (garde le .keystore).\n'+
  '6. Colle le SHA-256 dans le studio, republie assetlinks.json.\n\n'+
  'Package : '+ST.pkg+'\n'+new Date().toLocaleString('fr-FR')+'\n')});
 dl(zip(entries),'kev-fusion-pwa-pack.zip');
 prog(1,1,'✅ ZIP prêt · '+entries.length+' fichiers');toast('📦 Pack téléchargé')}
function openPwa(){
 var u=siteUrl();
 try{navigator.clipboard.writeText(u)}catch(e){}
 window.open('https://www.pwabuilder.com/reportcard?site='+encodeURIComponent(u),'_blank','noopener');
 toast('🚀 PWABuilder ouvert · URL copiée')}
function ghUpload(){var c=detectRepo();
 window.open('https://github.com/'+c.owner+'/'+c.repo+'/upload/'+c.branch,'_blank','noopener');
 toast('↗ Upload GitHub ouvert')}

/* ============ DISPATCH ============ */
document.addEventListener('click',async function(e){
 var b=e.target.closest('[data-pwa]');if(!b)return;
 var a=b.dataset.pwa;
 if(['src','bg','c1','c2','car','rim','scale','dx','dy','rot','radius','pad','glow','shadow','grain','badgeText','pkg','fp','token'].indexOf(a)>=0)return;
 e.preventDefault();
 try{
  if(a==='publish'){await publish();return}
  if(a==='open'){openPwa();return}
  if(a==='probe'){toast('🔍 Sonde HTTP…');await probe();await check();toast('🔍 Sonde terminée');return}
  if(a==='inject'){await generate();injectIcons();toast('💉 Icônes injectées dans l\'app');return}
  if(a==='zip'){await doZip();return}
  if(a==='png'){var u8=await pngOf(512,false);dl(new Blob([u8],{type:'image/png'}),'icon-512.png');toast('🖼️ PNG 512');return}
  if(a==='dlmanifest'){dl(new Blob([manifestTxt()],{type:'application/manifest+json'}),'manifest.webmanifest');return}
  if(a==='dlassetlinks'){dl(new Blob([assetlinksTxt()],{type:'application/json'}),'assetlinks.json');return}
  if(a==='copymanifest'){await navigator.clipboard.writeText(manifestTxt());toast('📋 manifest copié');return}
  if(a==='copyasset'){await navigator.clipboard.writeText(assetlinksTxt());toast('📋 assetlinks copié');return}
  if(a==='ghupload'){ghUpload();return}
  if(a==='recheck'){await probe();await check();toast('↻ Vérifié');return}
  if(a==='dlcheck'){var l=await check();dl(new Blob([JSON.stringify({ts:new Date().toISOString(),url:siteUrl(),probe:PROBE,checks:l},null,2)],{type:'application/json'}),'pwa-check.json');return}
  if(a==='green'){ST.src='sport';ST.bg='radial';ST.c1='#04140c';ST.c2='#0b3d24';ST.car='#22c55e';ST.rim='#a3e635';
   ST.scale=104;ST.dy=2;ST.glow=46;ST.shadow=52;ST.radius=24;ST.pad=15;ST.spoiler=true;
   save();syncUI();schedule();codes();toast('💚 Preset sportif vert');return}
  if(a==='reset'){ST=Object.assign({},DEF);IMG=null;save();syncUI();schedule();codes();toast('↺ Réinitialisé');return}
  if(a==='rand'){
   var pal=[['#04140c','#0b3d24','#22c55e','#a3e635'],['#0a1a12','#134e33','#39ff14','#d8b45a'],
    ['#160b00','#ff7a1a','#ffd166','#0e1a26'],['#0a1a2f','#0a5fd7','#38bdf8','#d8b45a'],
    ['#101418','#a3e635','#ff9500','#38bdf8'],['#120a1e','#a78bfa','#22c55e','#38bdf8']];
   var p=pal[Math.floor(Math.random()*pal.length)];
   ST.c1=p[0];ST.c2=p[1];ST.car=p[2];ST.rim=p[3];
   ST.src=['sport','sport','supercar','rally','mono','flame'][Math.floor(Math.random()*6)];
   ST.bg=['radial','gradient','solid'][Math.floor(Math.random()*3)];
   ST.scale=86+Math.floor(Math.random()*44);ST.rot=Math.floor(Math.random()*23)-11;
   ST.radius=Math.floor(Math.random()*44);ST.glow=24+Math.floor(Math.random()*60);
   save();syncUI();schedule();codes();toast('🎲 Palette aléatoire');return}
 }catch(x){toast('PWABuilder : '+x.message)}
});

/* ============ NAV + ACCÈS DIRECT ============ */
function hook(){
 try{
  if(typeof NAV!=='undefined'&&Array.isArray(NAV)&&!NAV.some(function(n){return n[0]==='pwa'})){
   var i=NAV.findIndex(function(n){return n[0]==='modules'});
   NAV.splice(i<0?NAV.length:i,0,['pwa','📦 PWABuilder'])}
  if(typeof window.switchView==='function'&&!window.switchView.__kfPwa2){
   var _sv=window.switchView;
   var w=function(v){
    if(v!=='pwa')return _sv(v);
    if(typeof S!=='undefined')S.view='pwa';
    var nav=$('#nav');
    if(nav&&typeof NAV!=='undefined')nav.innerHTML=NAV.map(function(n){
     return '<button data-act="nav" data-k="'+n[0]+'" class="'+(n[0]==='pwa'?'act':'')+'">'+n[1]+'</button>'}).join('');
    renderPwa()};
   w.__kfPwa2=true;window.switchView=w}
 }catch(e){}}
function topButton(){
 if($('#pwaBtn'))return;
 var h=document.querySelector('.hbtns');if(!h)return;
 var b=document.createElement('button');b.id='pwaBtn';b.type='button';b.title='Mode PWABuilder';b.textContent='📦';
 b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();
  var app=$('#app'),boot=$('#boot'),gate=$('#gate');
  if(boot)boot.classList.add('hid');if(gate)gate.classList.add('hid');
  if(app)app.classList.remove('hid');
  if(typeof window.switchView==='function')window.switchView('pwa');else renderPwa()});
 h.insertBefore(b,h.firstChild)}

/* ============ CSS ============ */
function css(){
 if($('#pwaCss2'))return;
 var s=document.createElement('style');s.id='pwaCss2';
 s.textContent=
 '#pwaBtn{border-color:#22c55e;color:#22c55e;background:#04140c}'+
 '.pwa-hero{display:flex;gap:18px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;border-color:#22c55e66;background:linear-gradient(120deg,#04140c,#0b3d24 40%,#141c2e 78%)}'+
 '.pwa-hero-l{flex:1;min-width:270px}.pwa-hero-r{display:flex;gap:8px;flex-wrap:wrap}'+
 '.pwa-badge{display:inline-block;font:800 10.5px/1 system-ui;letter-spacing:1.5px;color:#04140c;background:linear-gradient(90deg,#22c55e,#a3e635);padding:5px 10px;border-radius:8px;margin-bottom:8px}'+
 '.pwa-url{margin-top:8px;font-size:12px;color:#a3e635;word-break:break-all}'+
 '.pwa-wrap{display:grid;grid-template-columns:minmax(0,1fr) 344px;gap:14px;align-items:start}'+
 '@media(max-width:1000px){.pwa-wrap{grid-template-columns:1fr}}'+
 '.pwa-stage{min-width:0}'+
 '.pwa-controls{position:sticky;top:118px;max-height:calc(100vh - 140px);overflow:auto;border-color:#22c55e55;background:linear-gradient(160deg,#06180f,#141c2e 62%)}'+
 '@media(max-width:1000px){.pwa-controls{position:static;max-height:none}}'+
 '.pwa-canvasbox{position:relative;display:grid;place-items:center;padding:22px;border-radius:14px;border:1px solid #25314a;background:radial-gradient(50% 50% at 50% 38%,#22c55e1c,transparent 70%),repeating-conic-gradient(#141c2e 0% 25%,#0f1625 0% 50%) 0 0/24px 24px}'+
 '#pwaBig{width:min(330px,74vw);height:auto;border-radius:24px;box-shadow:0 22px 56px #000c,0 0 0 1px #334466;transition:transform .25s}'+
 '#pwaBig:hover{transform:scale(1.025) rotate(-.6deg)}'+
 '.pwa-hint{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);font-size:10.5px;color:#a3e635;background:#04140cd0;padding:3px 10px;border-radius:11px;border:1px solid #a3e63544}'+
 '.pwa-strip{display:flex;gap:11px;flex-wrap:wrap;align-items:flex-end;margin-top:14px}'+
 '.pwa-thumb{display:flex;flex-direction:column;align-items:center;gap:4px}'+
 '.pwa-thumb canvas{border-radius:8px;box-shadow:0 5px 14px #000a,0 0 0 1px #25314a;background:#0f1625}'+
 '.pwa-thumb span{font:600 9.5px/1 ui-monospace,monospace;color:#5a6a84}'+
 '.pwa-devices{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:14px}'+
 '.pwa-dev{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}'+
 '.pwa-dev>span{font-size:11px;color:#8899b4;line-height:1.4}.pwa-dev i{color:#5a6a84;font-style:normal;font-size:10px}'+
 '.pwa-home{width:94px;height:94px;border-radius:27px;overflow:hidden;box-shadow:0 10px 26px #000b,0 0 0 1px #334466;background:#0f1625}'+
 '.pwa-home canvas,.pwa-ios canvas{width:100%;height:100%;display:block}'+
 '.pwa-ios{width:90px;height:90px;border-radius:20px;overflow:hidden;box-shadow:0 10px 26px #000b,0 0 0 1px #334466}'+
 '.pwa-splash{width:108px;height:146px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;box-shadow:0 10px 26px #000b,0 0 0 1px #334466}'+
 '.pwa-splash canvas{width:60px;height:60px;border-radius:14px}'+
 '.pwa-splash b{font-size:10px;letter-spacing:1.2px;color:#e8eefc}'+
 '.pwa-tab{display:flex;align-items:center;gap:7px;background:#0f1625;border:1px solid #25314a;border-radius:9px 9px 0 0;padding:7px 11px}'+
 '.pwa-tab canvas{width:16px;height:16px;border-radius:3px}'+
 '.pwa-tab span{font-size:10.5px;color:#8899b4}'+
 '.pwa-score{display:flex;align-items:center;gap:12px;margin-bottom:10px}.pwa-score .bar{flex:1;margin:0}.pwa-score b{font-size:13px;white-space:nowrap}'+
 '.pwa-check{list-style:none;display:flex;flex-direction:column;gap:5px;margin-bottom:10px}'+
 '.pwa-check li{display:flex;gap:9px;align-items:flex-start;padding:7px 9px;border-radius:9px;background:#0f1625;border:1px solid #25314a;font-size:12.5px}'+
 '.pwa-check li.ok{border-color:#22c55e44}.pwa-check li.ko{border-color:#f59e0b55;background:#f59e0b0d}'+
 '.pwa-check .ic{flex:none}.pwa-check b{display:block;color:#e8eefc}'+
 '.pwa-check i{display:block;font-style:normal;font-size:11px;color:#8899b4;margin-top:1px;word-break:break-word}'+
 '.pwa-probe{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'+
 '.pwa-probe-h{width:100%;font-size:12.5px;color:#a3e635;margin-bottom:4px}'+
 '.pwa-pill{font:600 11px/1 ui-monospace,monospace;padding:5px 9px;border-radius:14px;border:1px solid #25314a;background:#0f1625;color:#8899b4}'+
 '.pwa-pill.ok{border-color:#22c55e66;color:#22c55e;background:#22c55e12}'+
 '.pwa-pill.ko{border-color:#ef444466;color:#ef4444;background:#ef444412}'+
 '.pwa-pill i{font-style:normal;opacity:.8}'+
 '.pwa-prog{display:flex;align-items:center;gap:11px;margin-bottom:10px}.pwa-prog .bar{flex:1;margin:0}'+
 '.pwa-prog span{font-size:11.5px;word-break:break-word}'+
 '.pwa-code{margin-top:12px}.pwa-code h3{font-size:12px;color:#a3e635;margin-bottom:5px}'+
 '.pwa-code pre{background:#04140c;border:1px solid #25314a;border-radius:10px;padding:11px;font:11px/1.5 ui-monospace,monospace;color:#a3e635;max-height:220px;overflow:auto;white-space:pre;margin-bottom:6px}'+
 '.pwa-steps{margin-top:12px}.pwa-steps h3{font-size:12px;color:#a3e635}'+
 '.pwa-steps ol{margin:6px 0 0 18px;font-size:12.5px;color:#8899b4;line-height:1.7}'+
 '.pwa-steps b{color:#e8eefc}'+
 '.pwa-controls h2{color:#a3e635}'+
 '.ctl{margin-bottom:11px}.ctl-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}'+
 '.ctl-h label{margin:0}.ctl-h output{font:700 11px/1 ui-monospace,monospace;color:#a3e635}'+
 '.pwa-controls input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:6px 0 0;padding:0;border:0;background:linear-gradient(90deg,#22c55e,#a3e635,#38bdf8)}'+
 '.pwa-controls input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;background:#e8eefc;border:3px solid #22c55e;box-shadow:0 0 10px #22c55e99;cursor:grab}'+
 '.pwa-controls input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#e8eefc;border:3px solid #22c55e;cursor:grab}'+
 '.pwa-colors{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:12px}'+
 '.pwa-colors div{display:flex;flex-direction:column;gap:3px;align-items:center}'+
 '.pwa-colors input[type=color]{width:100%;height:32px;border:1px solid #334466;border-radius:9px;background:#0f1625;padding:2px;cursor:pointer;margin:0}'+
 '.pwa-colors span{font-size:9.5px;color:#5a6a84;text-align:center;line-height:1.2}'+
 '.pwa-toggles{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:11px}'+
 '.pwa-drop{border:2px dashed #334466;border-radius:11px;padding:11px;text-align:center;font-size:11.5px;color:#8899b4;cursor:pointer;margin-bottom:11px;transition:.18s}'+
 '.pwa-drop:hover,.pwa-drop.over{border-color:#22c55e;color:#22c55e;background:#22c55e12}'+
 '.pwa-sep{height:1px;background:linear-gradient(90deg,#22c55e66,#38bdf866,transparent);margin:13px 0}'+
 '.pwa-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:9px}'+
 '.pwa-controls::-webkit-scrollbar,.pwa-code pre::-webkit-scrollbar{width:9px;height:9px}'+
 '.pwa-controls::-webkit-scrollbar-track,.pwa-code pre::-webkit-scrollbar-track{background:#04140c}'+
 '.pwa-controls::-webkit-scrollbar-thumb,.pwa-code pre::-webkit-scrollbar-thumb{background:linear-gradient(#22c55e,#38bdf8);border-radius:7px;border:2px solid #04140c}';
 document.head.appendChild(s)}

/* ============ BOOT ============ */
function boot(){css();hook();topButton();
 setTimeout(function(){generate().then(injectIcons).catch(function(){})},700);
 setTimeout(function(){hook();topButton()},1600)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFPwa={render:renderPwa,generate:generate,inject:injectIcons,publish:publish,probe:probe,
 zip:doZip,manifest:manifestTxt,assetlinks:assetlinksTxt,check:check,open:openPwa,state:ST};
})();
