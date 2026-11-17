/* KEV FUSION 2026 — icon-gen.js v2.0.0
   ICÔNE VÉHICULE SPORTIF RÉALISTE pour l'APK / le raccourci bureau / l'installation PWA.
   Rendu canvas multi-couches : peinture métallisée (dégradé ciel + ligne d'horizon + bounce sol),
   vernis (clearcoat), vitrage teinté avec reflet, jantes forgées + disques + étriers,
   prises d'air maillées, bas de caisse, diffuseur, feux LED, ombre de contact et reflet au sol.
   Supersampling ×2, LOD automatique aux petites tailles, maskable safe-zone 80 %.
   Studio live (panneau permanent, 20+ réglages), export PNG/ZIP, publication GitHub automatique. */
(function(){
'use strict';
/* ══════════════ utilitaires ══════════════ */
var LS={get:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},
 del:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(m){if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3000)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function hex2rgb(h){h=String(h||'#000').replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
 var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function shade(h,f){var c=hex2rgb(h);return '#'+c.map(function(v){return clamp(Math.round(v*f),0,255).toString(16).padStart(2,'0')}).join('')}
function rgba(h,a){var c=hex2rgb(h);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'}
function mix(a,b,t){var x=hex2rgb(a),y=hex2rgb(b);
 return '#'+x.map(function(v,i){return clamp(Math.round(v+(y[i]-v)*t),0,255).toString(16).padStart(2,'0')}).join('')}
function rrect(x,a,b,w,h,r){r=Math.min(r,w/2,h/2);x.beginPath();x.moveTo(a+r,b);
 x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}

/* ══════════════ réglages ══════════════ */
var DEF={view:'side',car:'#25c257',finish:'gloss',rim:'#c3cad3',spokes:'5',caliper:'#a3e635',
 bg:'radial',c1:'#04140c',c2:'#0d4a2b',scale:100,dy:2,tilt:0,radius:23,pad:16,
 glow:34,ground:62,gloss:62,detail:'auto',safe:false,reflect:true};
var ST=Object.assign({},DEF,LS.get('iconStyle2',{}));
var ANY=[512,384,192,152,144,128,96,72,64,48,32,16],MASK=[512,192],APPLE=[180,167,152,120];
var GEN={},PUBLISHED=null,raf=0;
function save(){LS.set('iconStyle2',ST)}

/* ══════════════ silhouette profil ══════════════ */
function bodyPath(x){
 x.beginPath();
 x.moveTo(96,14);x.lineTo(97,4);
 x.quadraticCurveTo(94,-6,80,-10);
 x.quadraticCurveTo(62,-15,42,-18);
 x.quadraticCurveTo(28,-20,18,-22);
 x.quadraticCurveTo(4,-40,-16,-42);
 x.quadraticCurveTo(-34,-43,-46,-36);
 x.quadraticCurveTo(-62,-29,-78,-24);
 x.quadraticCurveTo(-92,-21,-96,-14);
 x.lineTo(-97,4);
 x.quadraticCurveTo(-97,16,-88,20);
 x.lineTo(-70,24);x.lineTo(70,24);x.lineTo(88,20);
 x.quadraticCurveTo(96,18,96,14);x.closePath()}
function glassPath(x){
 x.beginPath();x.moveTo(15,-23);
 x.quadraticCurveTo(3,-37,-16,-39);
 x.quadraticCurveTo(-31,-40,-43,-34);
 x.lineTo(-38,-26);x.lineTo(-12,-25);x.closePath()}

/* ── roue réaliste ── */
function wheel(x,cx,cy,r,o,hi){
 x.save();x.translate(cx,cy);
 var tg=x.createRadialGradient(-r*.3,-r*.35,r*.08,0,0,r);
 tg.addColorStop(0,'#39414b');tg.addColorStop(.55,'#171c22');tg.addColorStop(1,'#05070a');
 x.fillStyle=tg;x.beginPath();x.arc(0,0,r,0,7);x.fill();
 x.strokeStyle='#04060a';x.lineWidth=r*.07;x.beginPath();x.arc(0,0,r*.97,0,7);x.stroke();
 if(hi){x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=r*.05;x.beginPath();x.arc(0,0,r*.84,0,7);x.stroke();
  x.strokeStyle='rgba(255,255,255,.05)';x.lineWidth=r*.03;x.beginPath();x.arc(0,0,r*.78,0,7);x.stroke()}
 /* disque */
 x.fillStyle='#2b3138';x.beginPath();x.arc(0,0,r*.60,0,7);x.fill();
 if(hi){x.fillStyle='rgba(0,0,0,.55)';
  for(var d=0;d<12;d++){var a=d*Math.PI/6;x.beginPath();x.arc(Math.cos(a)*r*.47,Math.sin(a)*r*.47,r*.035,0,7);x.fill()}}
 /* étrier */
 x.strokeStyle=o.caliper;x.lineWidth=r*.17;x.lineCap='round';
 x.beginPath();x.arc(0,0,r*.55,-0.75,0.55);x.stroke();
 /* jante */
 var rg=x.createRadialGradient(-r*.28,-r*.32,r*.05,0,0,r*.74);
 rg.addColorStop(0,shade(o.rim,1.45));rg.addColorStop(.45,o.rim);rg.addColorStop(1,shade(o.rim,.42));
 x.fillStyle=rg;x.beginPath();x.arc(0,0,r*.72,0,7);x.fill();
 x.fillStyle='#0b0f14';x.beginPath();x.arc(0,0,r*.66,0,7);x.fill();
 var n=o.spokes==='10'?10:(o.spokes==='turbine'?12:5);
 for(var i=0;i<n;i++){
  var a2=i*Math.PI*2/n-Math.PI/2, w=(o.spokes==='turbine'?0.10:0.16);
  x.save();x.rotate(a2);
  var sg=x.createLinearGradient(0,-r*.2,0,-r*.68);
  sg.addColorStop(0,shade(o.rim,1.3));sg.addColorStop(1,shade(o.rim,.62));
  x.fillStyle=sg;x.beginPath();
  x.moveTo(-r*w*.55,-r*.20);x.lineTo(r*w*.55,-r*.20);
  x.lineTo(r*w*(o.spokes==='turbine'?1.5:1.05),-r*.68);
  x.lineTo(-r*w*(o.spokes==='turbine'?.2:.55),-r*.68);x.closePath();x.fill();
  if(hi){x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=r*.018;
   x.beginPath();x.moveTo(-r*w*.5,-r*.22);x.lineTo(-r*w*.5,-r*.66);x.stroke()}
  x.restore()}
 x.strokeStyle=shade(o.rim,.85);x.lineWidth=r*.05;x.beginPath();x.arc(0,0,r*.70,0,7);x.stroke();
 var cg=x.createRadialGradient(-r*.05,-r*.06,0,0,0,r*.2);
 cg.addColorStop(0,shade(o.rim,1.5));cg.addColorStop(1,shade(o.rim,.5));
 x.fillStyle=cg;x.beginPath();x.arc(0,0,r*.19,0,7);x.fill();
 x.fillStyle=o.car;x.beginPath();x.arc(0,0,r*.09,0,7);x.fill();
 if(hi){x.fillStyle=shade(o.rim,.45);
  for(var l=0;l<5;l++){var a3=l*Math.PI*2/5-Math.PI/2;
   x.beginPath();x.arc(Math.cos(a3)*r*.145,Math.sin(a3)*r*.145,r*.022,0,7);x.fill()}}
 x.restore()}

/* ── maillage de prise d'air ── */
function mesh(x,pts,o,rows){
 x.save();x.beginPath();x.moveTo(pts[0][0],pts[0][1]);
 for(var i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]);x.closePath();
 x.fillStyle='#080b0f';x.fill();x.clip();
 if(o.hi){x.strokeStyle='rgba(150,165,180,.30)';x.lineWidth=.7;
  for(var r=0;r<rows;r++){var y=pts[0][1]+(r+.5)*(Math.abs(pts[2][1]-pts[0][1])/rows);
   x.beginPath();x.moveTo(-100,y);x.lineTo(100,y);x.stroke()}}
 x.restore();
 x.strokeStyle='rgba(0,0,0,.75)';x.lineWidth=1.1;
 x.beginPath();x.moveTo(pts[0][0],pts[0][1]);
 for(var j=1;j<pts.length;j++)x.lineTo(pts[j][0],pts[j][1]);x.closePath();x.stroke()}

/* ══════════════ vue PROFIL ══════════════ */
function drawSide(x,o){
 var C=ST.car,hi=o.hi;
 /* reflet au sol */
 if(ST.reflect){x.save();x.translate(0,90);x.scale(1,-.30);
  var rg=x.createLinearGradient(0,-44,0,26);
  rg.addColorStop(0,rgba(C,0));rg.addColorStop(1,rgba(C,.30));
  x.fillStyle=rg;bodyPath(x);x.fill();x.restore()}
 /* roues arrière-plan (côté opposé) */
 if(hi){x.fillStyle='rgba(0,0,0,.55)';
  x.beginPath();x.arc(58,24,19,0,7);x.fill();x.beginPath();x.arc(-50,24,18,0,7);x.fill()}
 /* carrosserie */
 var g=x.createLinearGradient(0,-44,0,26);
 var f=ST.finish;
 var top=f==='matte'?1.14:(f==='chrome'?1.85:(f==='satin'?1.26:1.46));
 var bot=f==='matte'?.52:(f==='chrome'?.20:.34);
 g.addColorStop(0,shade(C,top));g.addColorStop(.30,shade(C,1.06));
 g.addColorStop(.52,C);g.addColorStop(.78,shade(C,.66));g.addColorStop(1,shade(C,bot));
 x.fillStyle=g;bodyPath(x);x.fill();
 x.save();bodyPath(x);x.clip();
 /* reflet ciel */
 var sky=x.createLinearGradient(0,-44,0,-8);
 sky.addColorStop(0,'rgba(215,240,255,'+(f==='matte'?.10:.30)+')');
 sky.addColorStop(1,'rgba(215,240,255,0)');
 x.fillStyle=sky;x.fillRect(-100,-46,200,40);
 /* ligne d'horizon */
 if(f!=='matte'){var hz=x.createLinearGradient(0,-8,0,2);
  hz.addColorStop(0,'rgba(255,255,255,0)');hz.addColorStop(.5,'rgba(255,255,255,'+(f==='chrome'?.34:.16)+')');
  hz.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=hz;x.fillRect(-100,-8,200,10)}
 /* bounce sol */
 var gr=x.createLinearGradient(0,8,0,26);
 gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(20,30,22,.55)');
 x.fillStyle=gr;x.fillRect(-100,8,200,20);
 /* arête d'épaule */
 if(hi){x.strokeStyle='rgba(255,255,255,.24)';x.lineWidth=1.1;
  x.beginPath();x.moveTo(-72,-19);x.quadraticCurveTo(0,-24,74,-11);x.stroke();
  x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=1.4;
  x.beginPath();x.moveTo(-70,-16);x.quadraticCurveTo(0,-21,72,-8);x.stroke()}
 /* vernis */
 if(ST.gloss>0&&f!=='matte'){
  x.save();x.globalAlpha=(ST.gloss/100)*(f==='chrome'?.85:.55);
  var sw=x.createLinearGradient(-70,-42,40,-6);
  sw.addColorStop(0,'rgba(255,255,255,0)');sw.addColorStop(.42,'rgba(255,255,255,.95)');
  sw.addColorStop(.62,'rgba(255,255,255,.25)');sw.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=sw;x.beginPath();
  x.moveTo(-64,-30);x.quadraticCurveTo(-10,-42,52,-20);
  x.lineTo(48,-13);x.quadraticCurveTo(-10,-34,-62,-24);x.closePath();x.fill();x.restore()}
 /* bas de caisse */
 var rk=x.createLinearGradient(0,16,0,25);
 rk.addColorStop(0,shade(C,.42));rk.addColorStop(1,'#0a0f0c');
 x.fillStyle=rk;x.beginPath();x.moveTo(-72,17);x.lineTo(72,17);x.lineTo(70,25);x.lineTo(-70,25);x.closePath();x.fill();
 /* AO passages de roue */
 [54,-54].forEach(function(cx){var ao=x.createRadialGradient(cx,22,10,cx,22,34);
  ao.addColorStop(0,'rgba(0,0,0,.55)');ao.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=ao;x.beginPath();x.arc(cx,22,34,0,7);x.fill()});
 x.restore();
 /* vitrage */
 var gg=x.createLinearGradient(10,-40,-30,-24);
 gg.addColorStop(0,'#16303f');gg.addColorStop(.4,'#0b1a24');gg.addColorStop(1,'#050c12');
 x.fillStyle=gg;glassPath(x);x.fill();
 x.save();glassPath(x);x.clip();
 var rf=x.createLinearGradient(-40,-40,10,-24);
 rf.addColorStop(0,'rgba(150,205,240,0)');rf.addColorStop(.45,'rgba(160,215,250,.34)');
 rf.addColorStop(.6,'rgba(160,215,250,.06)');rf.addColorStop(1,'rgba(150,205,240,0)');
 x.fillStyle=rf;x.fillRect(-50,-42,70,22);
 if(hi){x.fillStyle='rgba(255,255,255,.16)';x.beginPath();
  x.moveTo(-30,-38);x.lineTo(-18,-39);x.lineTo(-2,-26);x.lineTo(-12,-25);x.closePath();x.fill()}
 x.restore();
 x.strokeStyle=shade(C,.5);x.lineWidth=1.2;glassPath(x);x.stroke();
 if(hi){x.strokeStyle=shade(C,1.4);x.lineWidth=1.4;
  x.beginPath();x.moveTo(15,-23);x.quadraticCurveTo(3,-37,-16,-39);x.stroke()}
 /* prise d'air latérale */
 mesh(x,[[-34,-3],[-11,-8],[-7,7],[-30,12]],o,4);
 if(hi){x.strokeStyle=shade(C,1.3);x.lineWidth=.9;
  x.beginPath();x.moveTo(-34,-3);x.lineTo(-11,-8);x.stroke()}
 /* ligne de porte + poignée */
 if(hi){x.strokeStyle='rgba(0,0,0,.42)';x.lineWidth=1;
  x.beginPath();x.moveTo(16,-22);x.quadraticCurveTo(13,0,11,22);x.stroke();
  x.fillStyle=shade(C,.55);rrect(x,-2,-13,13,3.2,1.6);x.fill();
  x.fillStyle='rgba(255,255,255,.18)';rrect(x,-2,-13,13,1.2,.6);x.fill()}
 /* rétroviseur */
 x.strokeStyle=shade(C,.6);x.lineWidth=2.2;x.beginPath();x.moveTo(17,-22);x.lineTo(26,-27);x.stroke();
 var mg=x.createLinearGradient(24,-32,36,-24);mg.addColorStop(0,shade(C,1.35));mg.addColorStop(1,shade(C,.6));
 x.fillStyle=mg;x.beginPath();x.ellipse(30,-28.5,6.2,3.4,-.18,0,7);x.fill();
 if(hi){x.fillStyle='#0d1620';x.beginPath();x.ellipse(31.5,-28.2,3.4,1.9,-.18,0,7);x.fill()}
 /* museau : prise basse + splitter */
 mesh(x,[[78,7],[95,8],[94,18],[80,18]],o,3);
 x.fillStyle='#0a0e12';x.beginPath();x.moveTo(83,19);x.lineTo(99,21);x.lineTo(99,25);x.lineTo(83,24);x.closePath();x.fill();
 if(hi){x.strokeStyle=rgba(ST.caliper,.55);x.lineWidth=.9;x.beginPath();x.moveTo(84,23.4);x.lineTo(98,24.4);x.stroke()}
 /* feu avant LED */
 var hl=x.createLinearGradient(74,-10,94,-2);
 hl.addColorStop(0,'#dff6ff');hl.addColorStop(.5,'#9fd8f5');hl.addColorStop(1,'#2b4a5e');
 x.fillStyle=hl;x.beginPath();x.moveTo(73,-9.5);x.lineTo(92,-6);x.lineTo(93,-1.5);x.lineTo(75,-3.5);x.closePath();x.fill();
 if(hi){x.save();x.shadowColor='rgba(190,235,255,.9)';x.shadowBlur=6;
  x.strokeStyle='#f2fbff';x.lineWidth=1.2;
  x.beginPath();x.moveTo(76,-8);x.lineTo(90,-5.2);x.stroke();
  x.beginPath();x.moveTo(84,-6.6);x.lineTo(86,-2.6);x.stroke();x.restore()}
 /* feu arrière */
 var tl=x.createLinearGradient(-96,-10,-78,-4);
 tl.addColorStop(0,'#ff4d3d');tl.addColorStop(1,'#7a1410');
 x.save();if(hi){x.shadowColor='rgba(255,70,50,.85)';x.shadowBlur=7}
 x.fillStyle=tl;x.beginPath();x.moveTo(-96,-10);x.lineTo(-79,-8);x.lineTo(-79,-3.5);x.lineTo(-96,-5);x.closePath();x.fill();x.restore();
 /* becquet + diffuseur */
 x.fillStyle=shade(C,.55);x.beginPath();x.moveTo(-86,-24);x.lineTo(-70,-26.5);x.lineTo(-70,-22.5);x.lineTo(-86,-21);x.closePath();x.fill();
 x.fillStyle='#080c10';x.beginPath();x.moveTo(-93,17);x.lineTo(-72,19);x.lineTo(-72,26);x.lineTo(-92,25);x.closePath();x.fill();
 if(hi){x.strokeStyle='rgba(140,155,170,.35)';x.lineWidth=.8;
  for(var d2=0;d2<4;d2++){var dx=-89+d2*5;x.beginPath();x.moveTo(dx,18.5);x.lineTo(dx,25);x.stroke()}}
 /* passages de roue + roues */
 x.fillStyle='#05070a';
 x.beginPath();x.arc(54,22,25.5,Math.PI,0);x.lineTo(79.5,26);x.lineTo(28.5,26);x.closePath();x.fill();
 x.beginPath();x.arc(-54,22,25,Math.PI,0);x.lineTo(-29,26);x.lineTo(-79,26);x.closePath();x.fill();
 wheel(x,54,22,22,ST,hi);wheel(x,-54,22,22,ST,hi);
 /* lèvre d'aile */
 if(hi){x.strokeStyle=shade(C,1.25);x.lineWidth=1.6;
  x.beginPath();x.arc(54,22,25.5,Math.PI*1.06,Math.PI*1.94);x.stroke();
  x.beginPath();x.arc(-54,22,25,Math.PI*1.06,Math.PI*1.94);x.stroke()}
}

/* ══════════════ vue FACE ══════════════ */
function drawFront(x,o){
 var C=ST.car,hi=o.hi,f=ST.finish;
 if(ST.reflect){x.save();x.translate(0,92);x.scale(1,-.26);
  var rg=x.createLinearGradient(0,-40,0,30);rg.addColorStop(0,rgba(C,0));rg.addColorStop(1,rgba(C,.28));
  x.fillStyle=rg;rrect(x,-86,-40,172,70,16);x.fill();x.restore()}
 /* pneus */
 x.fillStyle='#0a0e13';
 x.beginPath();x.ellipse(-80,24,15,19,0,0,7);x.fill();
 x.beginPath();x.ellipse(80,24,15,19,0,0,7);x.fill();
 if(hi){wheel(x,-80,25,14,ST,false);wheel(x,80,25,14,ST,false)}
 /* silhouette */
 function fp(){x.beginPath();
  x.moveTo(-34,-40);x.quadraticCurveTo(0,-44,34,-40);
  x.quadraticCurveTo(46,-30,50,-18);
  x.quadraticCurveTo(66,-16,76,-6);
  x.quadraticCurveTo(86,2,86,14);
  x.lineTo(84,26);x.quadraticCurveTo(0,32,-84,26);
  x.lineTo(-86,14);x.quadraticCurveTo(-86,2,-76,-6);
  x.quadraticCurveTo(-66,-16,-50,-18);
  x.quadraticCurveTo(-46,-30,-34,-40);x.closePath()}
 var g=x.createLinearGradient(0,-44,0,30);
 g.addColorStop(0,shade(C,f==='chrome'?1.8:1.42));g.addColorStop(.32,shade(C,1.08));
 g.addColorStop(.55,C);g.addColorStop(.82,shade(C,.62));g.addColorStop(1,shade(C,.32));
 x.fillStyle=g;fp();x.fill();
 x.save();fp();x.clip();
 var sky=x.createLinearGradient(0,-44,0,-10);
 sky.addColorStop(0,'rgba(215,240,255,'+(f==='matte'?.10:.28)+')');sky.addColorStop(1,'rgba(215,240,255,0)');
 x.fillStyle=sky;x.fillRect(-90,-46,180,38);
 var ctr=x.createLinearGradient(-20,0,20,0);
 ctr.addColorStop(0,'rgba(255,255,255,0)');ctr.addColorStop(.5,'rgba(255,255,255,'+(f==='matte'?.05:.14)+')');
 ctr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=ctr;x.fillRect(-24,-44,48,74);
 var gr=x.createLinearGradient(0,10,0,30);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(15,25,18,.6)');
 x.fillStyle=gr;x.fillRect(-90,10,180,22);
 if(ST.gloss>0&&f!=='matte'){x.globalAlpha=(ST.gloss/100)*.5;
  var sw=x.createLinearGradient(-60,-40,20,0);
  sw.addColorStop(0,'rgba(255,255,255,0)');sw.addColorStop(.45,'rgba(255,255,255,.9)');sw.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=sw;x.beginPath();x.moveTo(-58,-30);x.quadraticCurveTo(-10,-44,44,-22);
  x.lineTo(40,-15);x.quadraticCurveTo(-10,-36,-56,-23);x.closePath();x.fill();x.globalAlpha=1}
 x.restore();
 /* pare-brise */
 x.beginPath();x.moveTo(-30,-38);x.quadraticCurveTo(0,-42,30,-38);
 x.lineTo(44,-19);x.quadraticCurveTo(0,-24,-44,-19);x.closePath();
 var gg=x.createLinearGradient(0,-40,0,-18);
 gg.addColorStop(0,'#1b3a4c');gg.addColorStop(.5,'#0a1822');gg.addColorStop(1,'#050c12');
 x.fillStyle=gg;x.fill();
 x.save();x.clip();
 var rf=x.createLinearGradient(-40,-40,20,-18);
 rf.addColorStop(0,'rgba(160,215,250,0)');rf.addColorStop(.45,'rgba(160,215,250,.30)');rf.addColorStop(1,'rgba(160,215,250,0)');
 x.fillStyle=rf;x.fillRect(-46,-42,92,26);x.restore();
 x.strokeStyle=shade(C,.5);x.lineWidth=1.2;x.stroke();
 /* capot : nervures + sorties */
 if(hi){x.strokeStyle='rgba(0,0,0,.30)';x.lineWidth=1.2;
  [-22,22].forEach(function(dx){x.beginPath();x.moveTo(dx,-18);x.quadraticCurveTo(dx*1.25,-6,dx*1.4,4);x.stroke()});
  x.strokeStyle='rgba(255,255,255,.16)';x.lineWidth=.9;
  [-24,20].forEach(function(dx){x.beginPath();x.moveTo(dx,-18);x.quadraticCurveTo(dx*1.25,-6,dx*1.4,4);x.stroke()})}
 mesh(x,[[-16,-14],[16,-14],[13,-6],[-13,-6]],o,2);
 /* rétros */
 [-1,1].forEach(function(s){
  x.strokeStyle=shade(C,.6);x.lineWidth=2;x.beginPath();x.moveTo(s*46,-20);x.lineTo(s*57,-23);x.stroke();
  var mg=x.createLinearGradient(s*54,-27,s*66,-19);mg.addColorStop(0,shade(C,1.3));mg.addColorStop(1,shade(C,.55));
  x.fillStyle=mg;x.beginPath();x.ellipse(s*61,-24,6,3.2,s*.15,0,7);x.fill()});
 /* feux */
 [-1,1].forEach(function(s){
  var hl=x.createLinearGradient(s*44,-8,s*74,0);
  hl.addColorStop(0,'#e6f8ff');hl.addColorStop(.55,'#9fd8f5');hl.addColorStop(1,'#26445a');
  x.save();if(hi){x.shadowColor='rgba(190,235,255,.85)';x.shadowBlur=8}
  x.fillStyle=hl;x.beginPath();
  x.moveTo(s*44,-8);x.lineTo(s*72,-4);x.lineTo(s*74,2);x.lineTo(s*46,-1);x.closePath();x.fill();x.restore();
  if(hi){x.strokeStyle='#f4fcff';x.lineWidth=1.3;
   x.beginPath();x.moveTo(s*47,-6.2);x.lineTo(s*70,-2.6);x.stroke();
   x.beginPath();x.moveTo(s*60,-4.6);x.lineTo(s*62,1);x.stroke()}});
 /* prise centrale + latérales */
 mesh(x,[[-32,8],[32,8],[26,25],[-26,25]],o,4);
 mesh(x,[[-74,8],[-40,7],[-38,20],[-70,20]],o,3);
 mesh(x,[[40,7],[74,8],[70,20],[38,20]],o,3);
 /* splitter */
 x.fillStyle='#080c10';x.beginPath();x.moveTo(-86,25);x.quadraticCurveTo(0,31,86,25);
 x.lineTo(84,31);x.quadraticCurveTo(0,37,-84,31);x.closePath();x.fill();
 if(hi){x.strokeStyle=rgba(ST.caliper,.6);x.lineWidth=1.1;
  x.beginPath();x.moveTo(-80,29.5);x.quadraticCurveTo(0,35,80,29.5);x.stroke();
  x.fillStyle='#0a0e12';[-52,52].forEach(function(dx){
   x.beginPath();x.moveTo(dx-7,20);x.lineTo(dx+7,20);x.lineTo(dx+5,27);x.lineTo(dx-5,27);x.closePath();x.fill()})}
 /* badge */
 if(hi){x.fillStyle=shade(C,.45);x.beginPath();x.moveTo(0,-4);x.lineTo(5,-1);x.lineTo(3,5);x.lineTo(-3,5);x.lineTo(-5,-1);x.closePath();x.fill();
  x.fillStyle=ST.caliper;x.beginPath();x.arc(0,1,1.6,0,7);x.fill()}
}

/* ══════════════ fond + composition ══════════════ */
function background(x,S,o){
 if(ST.bg==='transparent')return;
 if(ST.bg==='solid'){x.fillStyle=ST.c1;x.fillRect(0,0,S,S);return}
 var g;
 if(ST.bg==='linear'){g=x.createLinearGradient(0,0,S,S);
  g.addColorStop(0,ST.c1);g.addColorStop(.55,shade(ST.c2,.72));g.addColorStop(1,ST.c2)}
 else{g=x.createRadialGradient(S*.34,S*.24,S*.03,S*.5,S*.55,S*.85);
  g.addColorStop(0,shade(ST.c2,1.35));g.addColorStop(.55,ST.c2);g.addColorStop(1,ST.c1)}
 x.fillStyle=g;x.fillRect(0,0,S,S);
 /* halo derrière la voiture */
 if(ST.glow>0){var gl=x.createRadialGradient(S*.5,S*.56,S*.04,S*.5,S*.56,S*.52);
  gl.addColorStop(0,rgba(ST.car,(ST.glow/100)*.42));gl.addColorStop(1,rgba(ST.car,0));
  x.fillStyle=gl;x.fillRect(0,0,S,S)}
 /* sol */
 var fl=x.createLinearGradient(0,S*.66,0,S);
 fl.addColorStop(0,'rgba(0,0,0,0)');fl.addColorStop(1,'rgba(0,0,0,.55)');
 x.fillStyle=fl;x.fillRect(0,S*.6,S,S*.4);
 /* vignette */
 var v=x.createRadialGradient(S/2,S*.45,S*.16,S/2,S*.5,S*.78);
 v.addColorStop(0,'rgba(255,255,255,.05)');v.addColorStop(1,'rgba(0,0,0,.55)');
 x.fillStyle=v;x.fillRect(0,0,S,S)}
function groundShadow(x,o){
 if(ST.ground<=0)return;
 var a=(ST.ground/100);
 var g=x.createRadialGradient(0,46,4,0,46,100);
 g.addColorStop(0,'rgba(0,0,0,'+(.62*a)+')');g.addColorStop(.55,'rgba(0,0,0,'+(.28*a)+')');g.addColorStop(1,'rgba(0,0,0,0)');
 x.save();x.translate(0,0);x.scale(1,.14);x.fillStyle=g;
 x.beginPath();x.arc(0,46/.14,100,0,7);x.fill();x.restore();
 if(o.hi){x.fillStyle='rgba(0,0,0,'+(.55*a)+')';
  var pos=ST.view==='front'?[-80,80]:[-54,54];
  pos.forEach(function(cx){x.save();x.scale(1,.2);x.beginPath();x.arc(cx,44/.2,20,0,7);x.fill();x.restore()})}}
function paint(x,S,mask,showSafe){
 var lod=ST.detail==='high'?true:(ST.detail==='low'?false:S>=72);
 var o={hi:lod};
 x.clearRect(0,0,S,S);
 x.save();rrect(x,0,0,S,S,mask?0:S*(ST.radius/100));x.clip();
 background(x,S,o);
 x.save();
 var k=(S/218)*(mask?(1-ST.pad/100*.9):1)*(ST.scale/100);
 x.translate(S/2,S/2+(ST.dy/100)*S+S*.045);
 x.rotate(ST.tilt*Math.PI/180);x.scale(k,k);
 groundShadow(x,o);
 if(ST.view==='front')drawFront(x,o);else drawSide(x,o);
 x.restore();
 /* bord lumineux */
 if(!mask){x.strokeStyle='rgba(255,255,255,.10)';x.lineWidth=Math.max(1,S*.006);
  rrect(x,S*.004,S*.004,S-S*.008,S-S*.008,S*(ST.radius/100));x.stroke()}
 x.restore();
 if(showSafe&&mask){x.save();x.strokeStyle='#a3e635';x.setLineDash([S*.02,S*.014]);
  x.lineWidth=Math.max(1,S*.005);x.beginPath();x.arc(S/2,S/2,S*.4,0,7);x.stroke();
  x.setLineDash([]);x.strokeStyle='rgba(163,230,53,.3)';x.lineWidth=Math.max(1,S*.003);
  x.strokeRect(S*.1,S*.1,S*.8,S*.8);x.restore()}}
function render(S,mask,safe){
 var q=S>=64?2:3, big=document.createElement('canvas');
 big.width=big.height=S*q;
 paint(big.getContext('2d'),S*q,mask,safe);
 var out=document.createElement('canvas');out.width=out.height=S;
 var c=out.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 c.drawImage(big,0,0,S,S);return out}

/* ══════════════ génération / DOM / manifest ══════════════ */
function generate(){
 GEN={};
 ANY.forEach(function(s){GEN['icon-'+s+'.png']=render(s,false,false).toDataURL('image/png')});
 MASK.forEach(function(s){GEN['icon-'+s+'-maskable.png']=render(s,true,false).toDataURL('image/png')});
 APPLE.forEach(function(s){GEN['apple-'+s+'.png']=render(s,false,false).toDataURL('image/png')});
 GEN['apple-touch-icon.png']=GEN['apple-180.png'];
 GEN['favicon-32.png']=GEN['icon-32.png'];GEN['favicon-16.png']=GEN['icon-16.png'];
 LS.set('iconGenTs',Date.now());return GEN}
function injectDOM(){
 if(!GEN['icon-192.png'])return;
 Array.prototype.forEach.call(document.querySelectorAll('link[data-kfgen]'),function(n){n.remove()});
 function add(rel,href,sz){var l=document.createElement('link');l.rel=rel;l.href=href;
  if(sz)l.setAttribute('sizes',sz);l.setAttribute('data-kfgen','1');document.head.appendChild(l)}
 add('icon',GEN['favicon-16.png'],'16x16');add('icon',GEN['favicon-32.png'],'32x32');
 add('icon',GEN['icon-192.png'],'192x192');add('icon',GEN['icon-512.png'],'512x512');
 add('apple-touch-icon',GEN['apple-touch-icon.png'],'180x180');
 add('apple-touch-icon',GEN['apple-152.png'],'152x152');add('apple-touch-icon',GEN['apple-120.png'],'120x120');
 function meta(n,c){var m=document.querySelector('meta[name="'+n+'"]');
  if(!m){m=document.createElement('meta');m.setAttribute('name',n);document.head.appendChild(m)}m.setAttribute('content',c)}
 meta('theme-color',ST.c1);meta('apple-mobile-web-app-capable','yes');
 meta('apple-mobile-web-app-status-bar-style','black-translucent');
 meta('apple-mobile-web-app-title','KEV FUSION');
 meta('msapplication-TileColor',ST.c1);meta('msapplication-TileImage',GEN['icon-144.png'])}
function basePath(){var p=location.pathname.replace(/[^/]*$/,'');return (!p||p==='/')?'/':p}
function manifestObj(abs){
 var bp=basePath(),P=function(f){return abs?(bp+f):('./'+f)},icons=[];
 ANY.forEach(function(s){icons.push({src:P('icon-'+s+'.png'),sizes:s+'x'+s,type:'image/png',purpose:'any'})});
 MASK.forEach(function(s){icons.push({src:P('icon-'+s+'-maskable.png'),sizes:s+'x'+s,type:'image/png',purpose:'maskable'})});
 icons.push({src:P('apple-touch-icon.png'),sizes:'180x180',type:'image/png',purpose:'any'});
 var u=abs?(bp+'index.html'):'./index.html';
 return{name:'KEV FUSION 2026 — Expert Auto & Droit',short_name:'KEV FUSION',
  description:'Expert automobile & avocat : pannes corrélées, DTC, campagnes de rappel, TSB, étude incendie, juridique, VIN, OBD.',
  id:u,start_url:u,scope:abs?bp:'./',display:'standalone',display_override:['standalone','minimal-ui'],
  orientation:'any',lang:'fr',dir:'ltr',theme_color:ST.c1,background_color:ST.c1,
  categories:['productivity','utilities','business','education'],icons:icons,
  shortcuts:[{name:'Recherche prédictive',short_name:'Recherche',url:u+'?view=recherche',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'Étude corrélée',short_name:'Étude',url:u+'?view=etude',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'JusteRepère',short_name:'Juridique',url:u+'?view=jr',icons:[{src:P('icon-96.png'),sizes:'96x96'}]},
   {name:'Lecture VIN',short_name:'VIN',url:u+'?view=vin',icons:[{src:P('icon-96.png'),sizes:'96x96'}]}]}}
function manifestTxt(){return JSON.stringify(manifestObj(true),null,2)}
function assetlinksTxt(){
 var s=LS.get('pwaStudio',{})||{};
 return JSON.stringify([{relation:['delegate_permission/common.handle_all_urls'],
  target:{namespace:'android_app',package_name:s.pkg||'io.github.expertkevin06_cell.kevfusion',
   sha256_cert_fingerprints:[s.fp||'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99']}}],null,2)}
function ensureManifest(){
 fetch('./manifest.webmanifest?g='+Date.now(),{cache:'no-store'}).then(function(r){
  if(r.ok)return;
  var blob=new Blob([JSON.stringify(manifestObj(false))],{type:'application/manifest+json'});
  var ml=document.querySelector('link[rel="manifest"]');
  if(!ml){ml=document.createElement('link');ml.rel='manifest';document.head.appendChild(ml)}
  if(ml._kf)URL.revokeObjectURL(ml._kf);ml._kf=URL.createObjectURL(blob);ml.href=ml._kf;ml.setAttribute('data-kfgen','1')}).catch(function(){})}

/* ══════════════ GitHub ══════════════ */
function token(){return (LS.get('ghToken','')||'').trim()}
function repo(){var h=location.hostname,m=h.match(/^([^.]+)\.github\.io$/);
 var seg=location.pathname.split('/').filter(Boolean);
 return Object.assign({owner:m?m[1]:'expertkevin06-cell',repo:(m&&seg.length)?seg[0]:'kev-fusion',branch:'main'},LS.get('ghCfg',{}))}
function b64u8(u8){var o='',CH=0x8000;for(var i=0;i<u8.length;i+=CH)o+=String.fromCharCode.apply(null,u8.subarray(i,i+CH));return btoa(o)}
function utf8b64(s){return b64u8(new TextEncoder().encode(s))}
async function ghPut(path,data,isText){
 var c=repo(),tk=token();if(!tk)throw new Error('Jeton GitHub absent');
 var api='https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/'+path,sha=null;
 try{var g=await fetch(api+'?ref='+encodeURIComponent(c.branch),{headers:{Authorization:'Bearer '+tk,Accept:'application/vnd.github+json'}});
  if(g.ok)sha=(await g.json()).sha}catch(e){}
 var body={message:'KEV FUSION · icône sportive réaliste '+path,content:isText?utf8b64(data):b64u8(data),branch:c.branch};
 if(sha)body.sha=sha;
 var r=await fetch(api,{method:'PUT',headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',Accept:'application/vnd.github+json'},body:JSON.stringify(body)});
 if(!r.ok)throw new Error(path+' → HTTP '+r.status);
 return r.json()}
async function publish(){
 if(!GEN['icon-192.png'])generate();
 if(!token()){toast('🔑 Admin → Jeton GitHub : enregistre le jeton');studio();return false}
 var files=Object.keys(GEN),done=0,total=files.length+2;
 setProg(0,total,'Publication…');
 for(var i=0;i<files.length;i++){
  var f=files[i],u8=new Uint8Array(await (await fetch(GEN[f])).arrayBuffer());
  await ghPut(f,u8,false);done++;setProg(done,total,f)}
 await ghPut('manifest.webmanifest',manifestTxt(),true);done++;setProg(done,total,'manifest.webmanifest');
 await ghPut('.well-known/assetlinks.json',assetlinksTxt(),true);done++;setProg(done,total,'assetlinks.json');
 LS.set('iconPublished',Date.now());LS.set('iconVer','2.0');PUBLISHED=true;badge();
 toast('✅ Icônes réalistes + manifest publiés');return true}
function setProg(d,t,l){var b=$('#igProg'),s=$('#igProgTxt');
 if(b)b.style.width=(t?Math.round(d/t*100):0)+'%';if(s)s.textContent=l+' ('+d+'/'+t+')'}
function probe(){return fetch('./icon-192.png?g='+Date.now(),{cache:'no-store'}).then(function(r){PUBLISHED=r.ok;badge();return r.ok}).catch(function(){PUBLISHED=false;badge();return false})}

/* ══════════════ ZIP ══════════════ */
var CT=(function(){var t=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u8){var c=0xFFFFFFFF;for(var i=0;i<u8.length;i++)c=CT[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function zip(entries){
 var enc=new TextEncoder(),parts=[],central=[],off=0;
 entries.forEach(function(e){
  var name=enc.encode(e.name),crc=crc32(e.u8),sz=e.u8.length;
  var lh=new DataView(new ArrayBuffer(30));
  lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);
  lh.setUint32(14,crc,true);lh.setUint32(18,sz,true);lh.setUint32(22,sz,true);lh.setUint16(26,name.length,true);
  parts.push(new Uint8Array(lh.buffer),name,e.u8);
  var ch=new DataView(new ArrayBuffer(46));
  ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);
  ch.setUint32(16,crc,true);ch.setUint32(20,sz,true);ch.setUint32(24,sz,true);
  ch.setUint16(28,name.length,true);ch.setUint32(42,off,true);
  central.push(new Uint8Array(ch.buffer),name);off+=30+name.length+sz});
 var cs=0;central.forEach(function(c){cs+=c.length});
 var end=new DataView(new ArrayBuffer(22));
 end.setUint32(0,0x06054b50,true);end.setUint16(8,entries.length,true);end.setUint16(10,entries.length,true);
 end.setUint32(12,cs,true);end.setUint32(16,off,true);
 return new Blob(parts.concat(central,[new Uint8Array(end.buffer)]),{type:'application/zip'})}
function dl(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href)},6000)}
async function downloadZip(){
 if(!GEN['icon-192.png'])generate();
 var entries=[];for(var f in GEN)entries.push({name:f,u8:new Uint8Array(await (await fetch(GEN[f])).arrayBuffer())});
 entries.push({name:'manifest.webmanifest',u8:new TextEncoder().encode(manifestTxt())});
 entries.push({name:'.well-known/assetlinks.json',u8:new TextEncoder().encode(assetlinksTxt())});
 entries.push({name:'LISEZ-MOI.txt',u8:new TextEncoder().encode(
  'KEV FUSION — icône véhicule sportif réaliste\n\n'+
  '1. Dépose TOUT à la racine du dépôt GitHub Pages (dossier .well-known inclus).\n'+
  '2. Commit + push, attends le déploiement Pages (~1 min).\n'+
  '3. https://www.pwabuilder.com → colle l\'URL du site → Package For Stores → Android.\n'+
  '4. Sur le bureau : supprime l\'ancien raccourci puis réinstalle l\'app pour rafraîchir l\'icône.\n\n'+
  'Généré le '+new Date().toLocaleString('fr-FR')+'\n')});
 dl(zip(entries),'kev-fusion-icones-sport.zip');toast('📦 ZIP téléchargé')}

/* ══════════════ CSS ══════════════ */
function css(){
 if($('#igCss'))return;var s=document.createElement('style');s.id='igCss';
 s.textContent=
 '#igFab{position:fixed;right:14px;bottom:190px;z-index:940;width:54px;height:54px;border-radius:17px;'+
 'border:1px solid #22c55e;background:linear-gradient(145deg,#06180f,#123a24);color:#a3e635;font-size:25px;'+
 'cursor:pointer;display:grid;place-items:center;box-shadow:0 12px 30px #000b,0 0 0 1px #22c55e44;transition:.2s}'+
 '#igFab:hover{transform:translateY(-2px);box-shadow:0 16px 36px #000c,0 0 22px #22c55e55}'+
 '#igFab i{position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;background:#f59e0b;'+
 'border:2px solid #04140c;font-style:normal;font-size:9px;line-height:12px;color:#04140c;font-weight:900;display:grid;place-items:center}'+
 '#igOv{position:fixed;inset:0;z-index:9998;display:none;background:rgba(3,8,5,.86);backdrop-filter:blur(10px);padding:14px;overflow:auto}'+
 '#igOv.on{display:block}'+
 '#igWrap{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) 336px;gap:14px;align-items:start}'+
 '@media(max-width:960px){#igWrap{grid-template-columns:1fr}}'+
 '.igCard{background:linear-gradient(160deg,#0e1a13,#141c2e 70%);border:1px solid #25314a;border-radius:16px;padding:16px;'+
 'box-shadow:0 14px 40px #000a;margin-bottom:14px}'+
 '.igCard.acc{border-color:#22c55e66;box-shadow:0 14px 40px #22c55e22}'+
 '.igHead{display:flex;align-items:center;gap:12px;margin-bottom:12px}'+
 '.igHead h2{margin:0;font-size:18px;color:#e8eefc;font-weight:800}'+
 '.igHead p{margin:2px 0 0;font-size:12px;color:#8899b4}'+
 '.igBadge{width:42px;height:42px;flex:none;border-radius:12px;display:grid;place-items:center;font-size:21px;'+
 'background:conic-gradient(from 200deg,#22c55e,#a3e635,#38bdf8,#22c55e);color:#04140c;box-shadow:0 0 20px #22c55e66}'+
 '.igX{margin-left:auto;background:#0f1625;border:1px solid #25314a;color:#e8eefc;border-radius:10px;padding:7px 12px;cursor:pointer;font-size:15px}'+
 '.igStage{display:grid;place-items:center;padding:20px;border-radius:14px;border:1px solid #25314a;'+
 'background:radial-gradient(50% 50% at 50% 40%,#22c55e14,transparent 70%),repeating-conic-gradient(#141c2e 0% 25%,#0f1625 0% 50%) 0 0/24px 24px}'+
 '#igBig{width:min(320px,72vw);height:auto;border-radius:26px;box-shadow:0 26px 60px #000d,0 0 0 1px #334466;transition:transform .25s}'+
 '#igBig:hover{transform:scale(1.03) rotate(-.6deg)}'+
 '.igStrip{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-top:14px;justify-content:center}'+
 '.igTh{display:flex;flex-direction:column;align-items:center;gap:4px}'+
 '.igTh canvas{border-radius:9px;box-shadow:0 6px 16px #000a,0 0 0 1px #25314a;background:#0f1625}'+
 '.igTh span{font:700 9.5px/1 ui-monospace,monospace;color:#5a6a84}'+
 '.igDev{display:grid;grid-template-columns:repeat(auto-fit,minmax(126px,1fr));gap:14px}'+
 '.igDv{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}'+
 '.igDv>span{font-size:11px;color:#8899b4;line-height:1.4}.igDv i{font-style:normal;font-size:10px;color:#5a6a84}'+
 '.igAnd{width:92px;height:92px;border-radius:27px;overflow:hidden;box-shadow:0 10px 26px #000b,0 0 0 1px #334466}'+
 '.igIos{width:88px;height:88px;border-radius:20px;overflow:hidden;box-shadow:0 10px 26px #000b,0 0 0 1px #334466}'+
 '.igAnd canvas,.igIos canvas{width:100%;height:100%;display:block}'+
 '.igWin{width:104px;height:104px;display:grid;place-items:center;border-radius:8px;box-shadow:0 10px 26px #000b,0 0 0 1px #334466}'+
 '.igWin canvas{width:64px;height:64px;border-radius:12px}'+
 '.igTab{display:flex;align-items:center;gap:7px;background:#0f1625;border:1px solid #25314a;border-radius:9px 9px 0 0;padding:7px 11px}'+
 '.igTab canvas{width:16px;height:16px;border-radius:3px}.igTab span{font-size:10.5px;color:#8899b4}'+
 '.igPanel{position:sticky;top:14px;max-height:calc(100vh - 40px);overflow:auto;border-color:#22c55e55;'+
 'background:linear-gradient(165deg,#06180f,#141c2e 65%)}'+
 '@media(max-width:960px){.igPanel{position:static;max-height:none}}'+
 '.igPanel::-webkit-scrollbar,#igOv::-webkit-scrollbar{width:10px}'+
 '.igPanel::-webkit-scrollbar-track,#igOv::-webkit-scrollbar-track{background:#04140c;border-radius:8px}'+
 '.igPanel::-webkit-scrollbar-thumb,#igOv::-webkit-scrollbar-thumb{background:linear-gradient(#22c55e,#38bdf8);border-radius:8px;border:2px solid #04140c}'+
 '.igPanel::-webkit-scrollbar-thumb:hover,#igOv::-webkit-scrollbar-thumb:hover{background:#a3e635}'+
 '.igPanel,#igOv{scrollbar-width:thin;scrollbar-color:#22c55e #04140c}'+
 '.igCtl{margin-bottom:11px}'+
 '.igCtl label{display:flex;justify-content:space-between;font-size:10.5px;font-weight:800;letter-spacing:.6px;'+
 'text-transform:uppercase;color:#8899b4;margin-bottom:4px}'+
 '.igCtl label b{color:#a3e635;font-family:ui-monospace,monospace}'+
 '.igCtl select,.igCtl input[type=text]{width:100%;background:#0f1625;border:1px solid #25314a;color:#e8eefc;'+
 'border-radius:9px;padding:8px 10px;font-size:13px;margin:0}'+
 '.igCtl select:focus,.igCtl input:focus{outline:none;border-color:#22c55e;box-shadow:0 0 0 3px #22c55e2e}'+
 '.igCtl input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:2px 0 0;'+
 'background:linear-gradient(90deg,#22c55e,#a3e635,#38bdf8);border:0;padding:0}'+
 '.igCtl input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;'+
 'background:#e8eefc;border:3px solid #22c55e;box-shadow:0 0 10px #22c55eaa;cursor:grab}'+
 '.igCtl input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#e8eefc;border:3px solid #22c55e;cursor:grab}'+
 '.igCols{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:11px}'+
 '.igCols div{display:flex;flex-direction:column;align-items:center;gap:3px}'+
 '.igCols input[type=color]{width:100%;height:32px;border:1px solid #334466;border-radius:9px;background:#0f1625;padding:2px;cursor:pointer;margin:0}'+
 '.igCols span{font-size:9px;color:#5a6a84;text-align:center;line-height:1.2}'+
 '.igPres{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:11px}'+
 '.igPres button{width:26px;height:26px;border-radius:8px;border:2px solid #25314a;cursor:pointer;padding:0}'+
 '.igPres button:hover{border-color:#a3e635;transform:scale(1.12)}'+
 '.igTgs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:11px}'+
 '.igTg{display:flex;align-items:center;gap:6px;font-size:11px;color:#8899b4;background:#0f1625;border:1px solid #25314a;'+
 'border-radius:18px;padding:6px 11px;cursor:pointer;user-select:none}'+
 '.igTg input{width:auto;margin:0;accent-color:#22c55e}'+
 '.igTg.on{color:#a3e635;border-color:#22c55e;background:#22c55e14}'+
 '.igBtns{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:4px}'+
 '.igBtns button{border-radius:10px;padding:10px;font-size:12.5px;font-weight:700;cursor:pointer;border:1px solid #25314a;background:#0f1625;color:#e8eefc}'+
 '.igBtns button:hover{border-color:#22c55e}'+
 '.igBtns .p{grid-column:1/-1;background:linear-gradient(135deg,#22c55e,#a3e635);border-color:#22c55e;color:#04140c}'+
 '.igBtns .b{background:linear-gradient(135deg,#1f6f54,#3fa382);border-color:#1f6f54;color:#fff}'+
 '.igSep{height:1px;background:linear-gradient(90deg,#22c55e66,#38bdf866,transparent);margin:12px 0}'+
 '.igProg{display:flex;align-items:center;gap:10px;margin-top:10px}'+
 '.igProg .bar{flex:1;height:7px;background:#0f1625;border-radius:6px;overflow:hidden;margin:0}'+
 '.igProg .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#22c55e,#38bdf8);transition:width .3s}'+
 '.igProg span{font-size:11px;color:#8899b4}'+
 '.igNote{font-size:11.5px;color:#8899b4;line-height:1.55;margin:8px 0 0}'+
 '.igNote b{color:#e8eefc}';
 document.head.appendChild(s)}

/* ══════════════ STUDIO ══════════════ */
var ov=null;
function rng(id,label,min,max,unit){
 return '<div class="igCtl"><label>'+label+' <b id="igo_'+id+'">'+ST[id]+(unit||'')+'</b></label>'+
 '<input type="range" id="ig_'+id+'" data-ig="'+id+'" min="'+min+'" max="'+max+'" value="'+ST[id]+'"></div>'}
function studio(){
 css();
 if(!ov){
  ov=document.createElement('div');ov.id='igOv';document.body.appendChild(ov);
  ov.addEventListener('click',function(e){if(e.target===ov)closeStudio()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('on'))closeStudio()});
 }
 ov.innerHTML='<div id="igWrap">'+
 '<section>'+
  '<div class="igCard acc"><div class="igHead"><span class="igBadge">🏎️</span>'+
   '<div><h2>Icône véhicule sportif réaliste</h2><p>Raccourci bureau · installation PWA · APK PWABuilder</p></div>'+
   '<button class="igX" id="igClose">✕</button></div>'+
   '<div class="igStage"><canvas id="igBig" width="512" height="512"></canvas></div>'+
   '<div class="igStrip" id="igStrip"></div>'+
   '<div class="igProg"><div class="bar"><i id="igProg"></i></div><span id="igProgTxt">Prêt.</span></div>'+
   '<p class="igNote">Après publication, <b>supprime l\'ancien raccourci</b> puis réinstalle l\'app : le bureau affiche la nouvelle icône. '+
   'Android utilise l\'icône <b>maskable</b> (zone de sécurité 80 %), iOS l\'<b>apple-touch-icon</b>, Windows la tuile 144.</p>'+
  '</div>'+
  '<div class="igCard"><h2 style="margin:0 0 12px;font-size:15px;color:#e8eefc">📱 Rendu réel sur appareil</h2>'+
   '<div class="igDev">'+
    '<div class="igDv"><div class="igAnd"><canvas id="igAnd" width="192" height="192"></canvas></div><span>Android<br><i>maskable · squircle</i></span></div>'+
    '<div class="igDv"><div class="igIos"><canvas id="igIos" width="180" height="180"></canvas></div><span>iOS / iPadOS<br><i>apple-touch-icon</i></span></div>'+
    '<div class="igDv"><div class="igWin" id="igWin"><canvas id="igWinC" width="128" height="128"></canvas></div><span>Tuile Windows<br><i>144 · fond plein</i></span></div>'+
    '<div class="igDv"><div class="igTab"><canvas id="igTab" width="32" height="32"></canvas><span>onglet</span></div><span>Navigateur<br><i>favicon 32</i></span></div>'+
   '</div></div>'+
  '<div class="igCard"><h2 style="margin:0 0 10px;font-size:15px;color:#e8eefc">📦 Livraison</h2>'+
   '<div class="igBtns">'+
    '<button class="p" id="igPub">📡 Publier sur GitHub (auto)</button>'+
    '<button id="igZip">📦 ZIP complet</button>'+
    '<button id="igPng">🖼️ PNG 512</button>'+
    '<button class="b" id="igMan">📄 manifest</button>'+
    '<button id="igAsset">🔗 assetlinks</button>'+
   '</div>'+
   '<p class="igNote" id="igState"></p></div>'+
 '</section>'+
 '<aside class="igCard igPanel">'+
  '<h2 style="margin:0 0 12px;font-size:15px;color:#a3e635">🎛️ Réglages live</h2>'+
  '<div class="igCtl"><label>Vue</label><select id="ig_view" data-ig="view">'+
   '<option value="side">Profil dynamique</option><option value="front">Face avant</option></select></div>'+
  '<div class="igCtl"><label>Peinture</label><div class="igPres" id="igPres"></div></div>'+
  '<div class="igCols">'+
   '<div><input type="color" id="ig_car" data-ig="car" value="'+ST.car+'"><span>Carrosserie</span></div>'+
   '<div><input type="color" id="ig_rim" data-ig="rim" value="'+ST.rim+'"><span>Jantes</span></div>'+
   '<div><input type="color" id="ig_caliper" data-ig="caliper" value="'+ST.caliper+'"><span>Étriers</span></div>'+
   '<div><input type="color" id="ig_c1" data-ig="c1" value="'+ST.c1+'"><span>Fond 1</span></div>'+
  '</div>'+
  '<div class="igCtl"><label>Finition</label><select id="ig_finish" data-ig="finish">'+
   '<option value="gloss">Brillante (vernis)</option><option value="satin">Satinée</option>'+
   '<option value="matte">Mate</option><option value="chrome">Chrome</option></select></div>'+
  '<div class="igCtl"><label>Jantes</label><select id="ig_spokes" data-ig="spokes">'+
   '<option value="5">5 branches</option><option value="10">10 branches</option><option value="turbine">Turbine</option></select></div>'+
  '<div class="igCtl"><label>Fond</label><select id="ig_bg" data-ig="bg">'+
   '<option value="radial">Dégradé radial</option><option value="linear">Dégradé diagonal</option>'+
   '<option value="solid">Uni</option><option value="transparent">Transparent</option></select></div>'+
  '<div class="igCtl"><label>Couleur fond 2</label><input type="color" id="ig_c2" data-ig="c2" value="'+ST.c2+'" style="width:100%;height:32px;border:1px solid #334466;border-radius:9px;background:#0f1625;padding:2px;cursor:pointer"></div>'+
  '<div class="igSep"></div>'+
  rng('scale','Échelle',60,150,'%')+rng('dy','Position verticale',-20,20,'')+
  rng('tilt','Inclinaison',-10,10,'°')+rng('radius','Arrondi des coins',0,50,'%')+
  rng('pad','Marge maskable',0,30,'%')+rng('glow','Halo',0,100,'%')+
  rng('ground','Ombre au sol',0,100,'%')+rng('gloss','Vernis / reflet',0,100,'%')+
  '<div class="igCtl"><label>Niveau de détail</label><select id="ig_detail" data-ig="detail">'+
   '<option value="auto">Automatique (LOD)</option><option value="high">Détaillé partout</option>'+
   '<option value="low">Simplifié (petites tailles)</option></select></div>'+
  '<div class="igTgs">'+
   '<label class="igTg" id="igt_safe"><input type="checkbox" data-igt="safe"> Zone maskable</label>'+
   '<label class="igTg" id="igt_reflect"><input type="checkbox" data-igt="reflect"> Reflet au sol</label>'+
  '</div>'+
  '<div class="igBtns">'+
   '<button id="igReset">↺ Réinitialiser</button><button id="igRand">🎲 Aléatoire</button>'+
   '<button class="p" id="igApply">💉 Appliquer à l\'app</button>'+
  '</div>'+
 '</aside></div>';
 ov.classList.add('on');document.documentElement.style.overflow='hidden';
 var presets=['#25c257','#e11d2e','#1e6fff','#f5b301','#c9ced6','#14181f','#ff7a1a','#a855f7'];
 $('#igPres').innerHTML=presets.map(function(c){return '<button type="button" data-igp="'+c+'" style="background:'+c+'" title="'+c+'"></button>'}).join('');
 ['view','finish','spokes','bg','detail'].forEach(function(k){var e=$('#ig_'+k);if(e)e.value=ST[k]});
 ['safe','reflect'].forEach(function(k){var w=$('#igt_'+k);if(w){w.querySelector('input').checked=!!ST[k];w.classList.toggle('on',!!ST[k])}});
 var strip=$('#igStrip');strip.innerHTML='';
 [192,144,96,64,48,32,16].forEach(function(n){
  var d=document.createElement('div');d.className='igTh';
  var c=document.createElement('canvas');c.width=c.height=n;c.dataset.th=n;
  var l=document.createElement('span');l.textContent=n+'px';
  d.appendChild(c);d.appendChild(l);strip.appendChild(d)});
 bindStudio();schedule();stateLine()}
function closeStudio(){if(ov)ov.classList.remove('on');document.documentElement.style.overflow=''}
function stateLine(){
 var e=$('#igState');if(!e)return;
 e.innerHTML=(PUBLISHED?'<b style="color:#22c55e">✅ Icônes en ligne</b> — PWABuilder peut les lire.'
  :'<b style="color:#f59e0b">⚠️ Icônes non publiées</b> — publie (jeton admin) ou dépose le ZIP.')+
  ' <span style="color:#5a6a84">Jeton : '+(token()?'présent':'absent')+'</span>'}
function bindStudio(){
 $('#igClose').addEventListener('click',closeStudio);
 ov.addEventListener('input',function(e){
  var k=e.target.dataset&&e.target.dataset.ig;
  if(k){ST[k]=e.target.type==='range'?+e.target.value:e.target.value;
   var o=$('#igo_'+k);if(o)o.textContent=ST[k]+(k==='tilt'?'°':(k==='dy'?'':'%'));
   save();schedule();return}
  var t=e.target.dataset&&e.target.dataset.igt;
  if(t){ST[t]=e.target.checked;var w=$('#igt_'+t);if(w)w.classList.toggle('on',ST[t]);save();schedule()}});
 ov.addEventListener('change',function(e){
  var k=e.target.dataset&&e.target.dataset.ig;
  if(k&&(e.target.tagName==='SELECT')){ST[k]=e.target.value;save();schedule()}});
 ov.addEventListener('click',async function(e){
  var p=e.target.closest('[data-igp]');
  if(p){ST.car=p.dataset.igp;$('#ig_car').value=ST.car;save();schedule();return}
  var b=e.target.closest('button');if(!b)return;
  if(b.id==='igReset'){ST=Object.assign({},DEF);save();closeStudio();studio();toast('↺ Réglages réinitialisés')}
  else if(b.id==='igRand'){
   var pal=[['#25c257','#04140c','#0d4a2b','#c3cad3','#a3e635'],['#e11d2e','#170608','#4a0d12','#c9ced6','#ffd166'],
    ['#1e6fff','#050d1c','#0d2a52','#c3cad3','#38bdf8'],['#f5b301','#1a1204','#4a3a08','#2b3138','#ff7a1a'],
    ['#c9ced6','#0b0f14','#232a33','#8b939c','#ef4444'],['#14181f','#05070a','#1a1f27','#d8b45a','#a3e635'],
    ['#ff7a1a','#180a03','#4a2208','#2b3138','#ffd166'],['#a855f7','#12061c','#33125a','#c3cad3','#38bdf8']];
   var q=pal[Math.floor(Math.random()*pal.length)];
   ST.car=q[0];ST.c1=q[1];ST.c2=q[2];ST.rim=q[3];ST.caliper=q[4];
   ST.view=Math.random()<.5?'side':'front';ST.spokes=['5','10','turbine'][Math.floor(Math.random()*3)];
   ST.finish=['gloss','satin','matte','chrome'][Math.floor(Math.random()*4)];
   ST.tilt=Math.floor(Math.random()*11)-5;ST.scale=88+Math.floor(Math.random()*36);
   save();closeStudio();studio();toast('🎲 Variante générée')}
  else if(b.id==='igApply'){generate();injectDOM();toast('💉 Icône appliquée à l\'app');stateLine()}
  else if(b.id==='igPub'){try{await publish();stateLine()}catch(err){toast('❌ '+err.message);setProg(0,1,'❌ '+err.message)}}
  else if(b.id==='igZip'){await downloadZip()}
  else if(b.id==='igPng'){dl(new Blob([new Uint8Array(await (await fetch(render(512,false,false).toDataURL('image/png'))).arrayBuffer())],{type:'image/png'}),'kev-fusion-icon-512.png');toast('🖼️ PNG 512 téléchargé')}
  else if(b.id==='igMan'){dl(new Blob([manifestTxt()],{type:'application/manifest+json'}),'manifest.webmanifest')}
  else if(b.id==='igAsset'){dl(new Blob([assetlinksTxt()],{type:'application/json'}),'assetlinks.json')}})}
function schedule(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;draw()})}
function draw(){
 var big=$('#igBig');if(!big)return;
 paint(big.getContext('2d'),512,false,ST.safe);
 Array.prototype.forEach.call(document.querySelectorAll('#igStrip canvas'),function(c){
  paint(c.getContext('2d'),+c.dataset.th,false,false)});
 var a=$('#igAnd');if(a)paint(a.getContext('2d'),192,true,ST.safe);
 var i=$('#igIos');if(i)paint(i.getContext('2d'),180,false,false);
 var w=$('#igWinC');if(w)paint(w.getContext('2d'),128,false,false);
 var wn=$('#igWin');if(wn)wn.style.background=ST.bg==='transparent'?'#0f1625':ST.c1;
 var t=$('#igTab');if(t)paint(t.getContext('2d'),32,false,false)}

/* ══════════════ FAB + boot ══════════════ */
function fab(){
 css();if($('#igFab'))return;
 var b=document.createElement('button');b.id='igFab';b.type='button';
 b.title='Icône véhicule sportif — studio & publication';b.innerHTML='🏎️<i id="igDot">!</i>';
 b.addEventListener('click',function(e){e.preventDefault();studio()});
 document.body.appendChild(b);badge()}
function badge(){var d=$('#igDot');if(d)d.style.display=PUBLISHED?'none':'grid'}
function boot(){
 css();fab();generate();injectDOM();ensureManifest();
 probe().then(function(ok){
  var need=LS.get('iconVer','')!=='2.0';
  if(token()&&LS.get('ghAuto',true)&&(!ok||need)){
   publish().catch(function(e){toast('❌ '+e.message)})}
 }).catch(function(){});
 setTimeout(function(){if(!ov)badge()},1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFIconGen={generate:generate,inject:injectDOM,publish:publish,zip:downloadZip,probe:probe,
 studio:studio,close:closeStudio,manifest:manifestTxt,assetlinks:assetlinksTxt,
 render:function(s,m){return render(s||512,!!m,false)},style:ST,isPublished:function(){return PUBLISHED}};
})();
