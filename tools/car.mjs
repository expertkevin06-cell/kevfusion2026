/* KEV FUSION — dessin unique de la voiture de rallye (partagé Node + navigateur).
   ctx = CanvasRenderingContext2D réel OU tools/raster.mjs Ctx. Espace de travail 512×512. */
export const DEF={car:'#25c257',acid:'#a3e635',rim:'#d8b45a',red:'#e11d2e',
  bg1:'#04140c',bg2:'#0d4a2b',bg:'radial',scale:1,dy:0,tilt:0,radius:23,pad:16,
  glow:60,shadow:70,dirt:50,gloss:62,bar:true,wing:true,num:true,flaps:true};

function shade(h,f){const n=parseInt(h.slice(1),16);
  return '#'+[(n>>16)&255,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*f))).toString(16).padStart(2,'0')).join('')}
function rgba(h,a){const n=parseInt(h.slice(1),16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);
  c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);
  c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);
  c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath()}
const BODY='M470 302 L472 284 Q468 262 436 254 Q400 246 356 242 Q332 240 316 236 Q292 200 250 194 L176 192 Q132 196 108 220 Q76 238 56 254 Q44 266 42 288 L42 306 Q42 322 58 326 L96 330 L420 330 L452 326 Q470 322 470 302 Z';
function bodyPath(c){
  c.beginPath();
  c.moveTo(470,302);c.lineTo(472,284);
  c.quadraticCurveTo(468,262,436,254);c.quadraticCurveTo(400,246,356,242);
  c.quadraticCurveTo(332,240,316,236);c.quadraticCurveTo(292,200,250,194);
  c.lineTo(176,192);c.quadraticCurveTo(132,196,108,220);
  c.quadraticCurveTo(76,238,56,254);c.quadraticCurveTo(44,266,42,288);
  c.lineTo(42,306);c.quadraticCurveTo(42,322,58,326);
  c.lineTo(96,330);c.lineTo(420,330);c.lineTo(452,326);
  c.quadraticCurveTo(470,322,470,302);c.closePath()}
function wheel(c,cx,cy,r,S){
  c.save();c.translate(cx,cy);
  let g=c.createRadialGradient(-r*.3,-r*.35,r*.08,0,0,r);
  g.addColorStop(0,'#3d4550');g.addColorStop(.55,'#141a20');g.addColorStop(1,'#05070a');
  c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();
  /* crampons */
  c.fillStyle='#1b2128';
  for(let i=0;i<18;i++){const a=i*Math.PI/9;
    c.save();c.rotate(a);c.fillRect(-r*.09,-r*.99,r*.18,r*.16);c.restore()}
  c.strokeStyle='#04060a';c.lineWidth=r*.06;c.beginPath();c.arc(0,0,r*.98,0,Math.PI*2);c.stroke();
  c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=r*.055;c.beginPath();c.arc(0,0,r*.79,0,Math.PI*2);c.stroke();
  c.fillStyle='#2b3138';c.beginPath();c.arc(0,0,r*.59,0,Math.PI*2);c.fill();
  c.fillStyle='#0d1116';
  for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.arc(Math.cos(a)*r*.46,Math.sin(a)*r*.46,r*.045,0,Math.PI*2);c.fill()}
  c.strokeStyle=S.acid;c.lineWidth=r*.16;c.lineCap='round';
  c.beginPath();c.arc(0,0,r*.53,-0.7,0.6);c.stroke();c.lineCap='butt';
  g=c.createRadialGradient(-r*.26,-r*.3,r*.05,0,0,r*.72);
  g.addColorStop(0,shade(S.rim,1.4));g.addColorStop(.45,S.rim);g.addColorStop(1,shade(S.rim,.42));
  c.fillStyle=g;c.beginPath();c.arc(0,0,r*.7,0,Math.PI*2);c.fill();
  c.fillStyle='#0b0f14';c.beginPath();c.arc(0,0,r*.63,0,Math.PI*2);c.fill();
  for(let i=0;i<10;i++){
    c.save();c.rotate(i*Math.PI/5);
    const sg=c.createLinearGradient(0,-r*.2,0,-r*.62);
    sg.addColorStop(0,shade(S.rim,1.3));sg.addColorStop(1,shade(S.rim,.6));
    c.fillStyle=sg;c.beginPath();
    c.moveTo(-r*.08,-r*.23);c.lineTo(r*.08,-r*.23);c.lineTo(r*.13,-r*.61);c.lineTo(-r*.13,-r*.61);
    c.closePath();c.fill();c.restore()}
  c.strokeStyle=shade(S.rim,.6);c.lineWidth=r*.055;c.beginPath();c.arc(0,0,r*.66,0,Math.PI*2);c.stroke();
  g=c.createRadialGradient(-r*.05,-r*.06,0,0,0,r*.2);
  g.addColorStop(0,shade(S.rim,1.45));g.addColorStop(1,shade(S.rim,.5));
  c.fillStyle=g;c.beginPath();c.arc(0,0,r*.19,0,Math.PI*2);c.fill();
  c.fillStyle=S.car;c.beginPath();c.arc(0,0,r*.08,0,Math.PI*2);c.fill();
  c.fillStyle=shade(S.rim,.45);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;
    c.beginPath();c.arc(Math.cos(a)*r*.135,Math.sin(a)*r*.135,r*.026,0,Math.PI*2);c.fill()}
  c.restore()}
function mesh(c,x0,y0,x1,y1,rows){
  c.fillStyle='#080c10';c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y0+2);c.lineTo(x1-2,y1);c.lineTo(x0+2,y1-2);c.closePath();c.fill();
  c.strokeStyle='rgba(150,170,190,.34)';c.lineWidth=1.3;
  for(let i=1;i<rows;i++){const y=y0+(y1-y0)*i/rows;c.beginPath();c.moveTo(x0+2,y);c.lineTo(x1-2,y+1);c.stroke()}}

export function drawRally(c,size,opt={}){
  const S=Object.assign({},DEF,opt),mask=!!opt.maskable;
  const k=size/512;
  c.save();c.scale(k,k);
  /* fond */
  const rx=mask?0:512*S.radius/100;
  if(S.bg!=='transparent'){
    c.save();rr(c,0,0,512,512,rx);c.clip();
    let g;
    if(S.bg==='solid'){c.fillStyle=S.bg1;c.fillRect(0,0,512,512)}
    else if(S.bg==='linear'){g=c.createLinearGradient(0,0,512,512);
      g.addColorStop(0,S.bg1);g.addColorStop(.52,shade(S.bg2,.72));g.addColorStop(1,S.bg2);c.fillStyle=g;c.fillRect(0,0,512,512)}
    else{g=c.createRadialGradient(184,123,10,256,266,430);
      g.addColorStop(0,shade(S.bg2,1.4));g.addColorStop(.55,S.bg2);g.addColorStop(1,S.bg1);c.fillStyle=g;c.fillRect(0,0,512,512)}
    if(S.glow>0){g=c.createRadialGradient(256,272,10,256,272,250);
      g.addColorStop(0,rgba(S.car,S.glow/100*.4));g.addColorStop(1,rgba(S.car,0));c.fillStyle=g;c.fillRect(0,0,512,512)}
    g=c.createLinearGradient(0,300,0,512);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${(S.shadow/100*.6).toFixed(3)})`);
    c.fillStyle=g;c.fillRect(0,300,512,212);
    g=c.createRadialGradient(256,236,110,256,256,400);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.6)');c.fillStyle=g;c.fillRect(0,0,512,512);
    c.restore()}
  /* scène */
  c.save();rr(c,0,0,512,512,rx);c.clip();
  c.translate(256,262+S.dy*2);c.rotate(S.tilt*Math.PI/180);
  const sc=S.scale*(mask?(1-S.pad/100*.85):1);c.scale(sc,sc);c.translate(-256,-262);
  /* ombre */
  if(S.shadow>0){const a=S.shadow/100;
    for(let i=6;i>=1;i--){c.fillStyle=`rgba(0,0,0,${(a*.09).toFixed(3)})`;
      c.beginPath();c.ellipse(256,400,190+i*5,13+i*3,0,0,Math.PI*2);c.fill()}
    [144,368].forEach(x=>{for(let i=4;i>=1;i--){c.fillStyle=`rgba(0,0,0,${(a*.12).toFixed(3)})`;
      c.beginPath();c.ellipse(x,396,42+i*4,7+i*2,0,0,Math.PI*2);c.fill()}})}
  c.fillStyle='rgba(5,7,10,.8)';
  c.beginPath();c.arc(150,346,49,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(374,346,49,0,Math.PI*2);c.fill();
  /* aileron */
  if(S.wing){
    let g=c.createLinearGradient(0,196,0,214);g.addColorStop(0,'#2c3540');g.addColorStop(1,'#0a0e13');
    c.fillStyle=g;c.beginPath();c.moveTo(40,196);c.lineTo(120,205);c.lineTo(120,214);c.lineTo(40,206);c.closePath();c.fill();
    c.fillStyle='#161d25';c.beginPath();c.moveTo(38,188);c.lineTo(48,190);c.lineTo(48,224);c.lineTo(38,222);c.closePath();c.fill();
    c.fillStyle='#12181f';c.beginPath();c.moveTo(86,208);c.lineTo(94,209);c.lineTo(98,236);c.lineTo(90,235);c.closePath();c.fill();
    c.strokeStyle=rgba(S.acid,.55);c.lineWidth=2;c.beginPath();c.moveTo(40,196);c.lineTo(120,205);c.stroke()}
  /* carrosserie */
  let g=c.createLinearGradient(0,186,0,336);
  g.addColorStop(0,shade(S.car,1.6));g.addColorStop(.18,shade(S.car,1.18));
  g.addColorStop(.42,S.car);g.addColorStop(.7,shade(S.car,.62));g.addColorStop(1,shade(S.car,.28));
  c.fillStyle=g;bodyPath(c);c.fill();
  c.save();bodyPath(c);c.clip();
  g=c.createLinearGradient(0,186,0,252);g.addColorStop(0,'rgba(223,246,255,.42)');g.addColorStop(1,'rgba(223,246,255,0)');
  c.fillStyle=g;c.fillRect(30,186,460,66);
  g=c.createLinearGradient(0,252,0,272);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.2)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.fillRect(30,252,460,20);
  g=c.createLinearGradient(0,286,0,334);g.addColorStop(0,'rgba(8,21,13,0)');g.addColorStop(1,'rgba(8,21,13,.78)');
  c.fillStyle=g;c.fillRect(30,286,460,48);
  if(S.gloss>0){c.globalAlpha=S.gloss/100;
    g=c.createLinearGradient(60,200,330,266);
    g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.42,'rgba(255,255,255,.92)');
    g.addColorStop(.64,'rgba(255,255,255,.22)');g.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=g;c.beginPath();c.moveTo(64,236);c.quadraticCurveTo(170,208,300,226);
    c.lineTo(296,240);c.quadraticCurveTo(170,222,68,248);c.closePath();c.fill();c.globalAlpha=1}
  c.strokeStyle='rgba(255,255,255,.26)';c.lineWidth=2.4;c.beginPath();c.moveTo(108,224);c.quadraticCurveTo(210,206,330,232);c.stroke();
  c.strokeStyle='rgba(0,0,0,.26)';c.lineWidth=2.6;c.beginPath();c.moveTo(108,230);c.quadraticCurveTo(210,212,330,238);c.stroke();
  c.fillStyle='rgba(7,19,9,.82)';c.fillRect(96,314,324,18);
  /* livrée */
  c.fillStyle=S.acid;c.beginPath();c.moveTo(262,332);c.lineTo(300,232);c.lineTo(326,232);c.lineTo(288,332);c.closePath();c.fill();
  c.fillStyle='rgba(242,247,242,.9)';c.beginPath();c.moveTo(296,332);c.lineTo(334,232);c.lineTo(346,232);c.lineTo(308,332);c.closePath();c.fill();
  c.fillStyle=rgba(S.acid,.55);c.beginPath();c.moveTo(118,332);c.lineTo(150,240);c.lineTo(162,240);c.lineTo(130,332);c.closePath();c.fill();
  if(S.num){
    c.fillStyle='#f4f8f4';c.beginPath();c.arc(206,284,31,0,Math.PI*2);c.fill();
    c.strokeStyle='#0b1a10';c.lineWidth=2.5;c.beginPath();c.arc(206,284,31,0,Math.PI*2);c.stroke();
    c.save();c.translate(190,272);c.fillStyle='#0b1a10';
    c.beginPath();c.moveTo(0,0);c.lineTo(15,0);c.lineTo(15,5);c.lineTo(5,17);c.lineTo(15,17);c.lineTo(15,22);c.lineTo(0,22);c.lineTo(0,16);c.lineTo(10,5);c.lineTo(0,5);c.closePath();c.fill();
    c.beginPath();c.moveTo(18,0);c.lineTo(33,0);c.lineTo(33,5);c.lineTo(23,5);c.lineTo(23,9);c.lineTo(33,9);c.lineTo(33,22);c.lineTo(18,22);c.closePath();c.fill();
    c.fillStyle='#f4f8f4';c.fillRect(23,13,5,4);c.restore()}
  if(S.dirt>0){c.fillStyle=`rgba(74,58,34,${(S.dirt/100).toFixed(2)})`;
    [[120,322,16,4],[164,326,11,3],[238,324,14,3.4],[300,327,10,3],[352,322,15,4],[410,326,12,3.2],[86,310,9,2.6],[440,316,8,2.4]]
      .forEach(([x,y,rx2,ry2])=>{c.beginPath();c.ellipse(x,y,rx2,ry2,0,0,Math.PI*2);c.fill()})}
  c.restore();
  c.strokeStyle='#03210f';c.lineWidth=2.2;bodyPath(c);c.stroke();
  /* vitrage */
  const glass=(pts)=>{c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();
    const gg=c.createLinearGradient(300,196,150,238);
    gg.addColorStop(0,'#20495e');gg.addColorStop(.45,'#0a1a24');gg.addColorStop(1,'#04090e');
    c.fillStyle=gg;c.fill();c.strokeStyle='#0a2a15';c.lineWidth=3;c.stroke()};
  glass([[314,234],[292,202],[252,197],[240,232]]);
  glass([[234,232],[244,198],[182,197],[178,232]]);
  glass([[172,232],[176,199],[140,205],[122,220],[140,232]]);
  c.save();bodyPath(c);c.clip();
  g=c.createLinearGradient(180,196,300,240);
  g.addColorStop(0,'rgba(168,220,245,0)');g.addColorStop(.46,'rgba(168,220,245,.42)');
  g.addColorStop(.64,'rgba(168,220,245,.06)');g.addColorStop(1,'rgba(168,220,245,0)');
  c.fillStyle=g;c.fillRect(120,196,200,40);
  c.fillStyle='rgba(255,255,255,.14)';c.beginPath();c.moveTo(258,198);c.lineTo(272,199);c.lineTo(246,232);c.lineTo(232,232);c.closePath();c.fill();
  c.restore();
  c.strokeStyle=shade(S.car,1.5);c.lineWidth=2.4;c.beginPath();c.moveTo(314,234);c.quadraticCurveTo(292,202,252,197);c.stroke();
  /* scoop */
  c.fillStyle='#0b1a10';c.beginPath();c.moveTo(338,240);c.lineTo(372,236);c.lineTo(376,246);c.lineTo(340,249);c.closePath();c.fill();
  c.fillStyle='#1d2a22';c.beginPath();c.moveTo(342,241);c.lineTo(370,238);c.lineTo(371,243);c.lineTo(343,246);c.closePath();c.fill();
  c.fillStyle='#0b1a10';c.fillRect(226,189,24,6);
  c.fillStyle='#2c3540';c.beginPath();c.moveTo(204,190);c.lineTo(206,176);c.lineTo(208,190);c.closePath();c.fill();
  /* rampe de phares */
  if(S.bar){
    c.fillStyle='#161d25';c.beginPath();c.moveTo(392,252);c.lineTo(470,256);c.lineTo(470,262);c.lineTo(392,258);c.closePath();c.fill();
    [[404,246,10.5],[426,243,10.5],[448,241,10],[466,240,8.6]].forEach(([x,y,r])=>{
      const gg=c.createRadialGradient(x,y,1,x,y,r*2.1);
      gg.addColorStop(0,'rgba(232,246,255,.7)');gg.addColorStop(1,'rgba(232,246,255,0)');
      c.fillStyle=gg;c.beginPath();c.arc(x,y,r*2.1,0,Math.PI*2);c.fill();
      const lg=c.createRadialGradient(x-r*.3,y-r*.3,1,x,y,r);
      lg.addColorStop(0,'#ffffff');lg.addColorStop(.42,'#d8ecff');lg.addColorStop(1,'#2e5872');
      c.fillStyle=lg;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
      c.strokeStyle='#0a0e13';c.lineWidth=2.4;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();
      c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=1.2;
      c.beginPath();c.moveTo(x-r*.6,y);c.lineTo(x+r*.6,y);c.moveTo(x,y-r*.6);c.lineTo(x,y+r*.6);c.stroke()})}
  /* avant */
  mesh(c,436,268,470,288,4);
  c.fillStyle='#0a0e12';c.beginPath();c.moveTo(430,292);c.lineTo(478,296);c.lineTo(478,304);c.lineTo(430,300);c.closePath();c.fill();
  c.strokeStyle=rgba(S.acid,.6);c.lineWidth=2;c.beginPath();c.moveTo(432,300);c.lineTo(476,303);c.stroke();
  c.fillStyle='#dff6ff';c.beginPath();c.moveTo(452,262);c.lineTo(468,264);c.lineTo(466,270);c.lineTo(450,268);c.closePath();c.fill();
  c.strokeStyle=S.red;c.lineWidth=3.4;c.beginPath();c.arc(462,312,7,-1.2,1.6);c.stroke();
  /* arrière */
  g=c.createLinearGradient(0,262,0,274);g.addColorStop(0,'#ff6a52');g.addColorStop(1,'#8c1410');
  c.fillStyle=g;c.beginPath();c.moveTo(44,262);c.lineTo(66,264);c.lineTo(66,274);c.lineTo(44,272);c.closePath();c.fill();
  c.fillStyle='#080c10';c.beginPath();c.moveTo(42,300);c.lineTo(70,302);c.lineTo(70,322);c.lineTo(44,320);c.closePath();c.fill();
  c.strokeStyle='rgba(143,163,181,.32)';c.lineWidth=1.4;
  [48,56,64].forEach(x=>{c.beginPath();c.moveTo(x,304);c.lineTo(x,320);c.stroke()});
  c.fillStyle='#2c3540';c.beginPath();c.arc(76,316,5.4,0,Math.PI*2);c.fill();
  c.fillStyle='#0a0e13';c.beginPath();c.arc(76,316,2.6,0,Math.PI*2);c.fill();
  /* bavettes */
  if(S.flaps){
    g=c.createLinearGradient(0,330,0,376);g.addColorStop(0,'#ff6a52');g.addColorStop(1,'#8c1410');
    c.fillStyle=g;
    c.beginPath();c.moveTo(96,330);c.lineTo(116,331);c.lineTo(112,376);c.lineTo(98,374);c.closePath();c.fill();
    c.beginPath();c.moveTo(316,330);c.lineTo(336,331);c.lineTo(332,372);c.lineTo(318,370);c.closePath();c.fill()}
  /* passages de roue + roues */
  c.fillStyle='#05070a';
  c.beginPath();c.arc(368,330,56,Math.PI,0);c.lineTo(424,332);c.lineTo(312,332);c.closePath();c.fill();
  c.beginPath();c.arc(144,330,56,Math.PI,0);c.lineTo(200,332);c.lineTo(88,332);c.closePath();c.fill();
  wheel(c,368,340,56,S);wheel(c,144,340,56,S);
  c.strokeStyle=shade(S.car,1.18);c.lineWidth=3.4;
  c.beginPath();c.arc(368,328,55,Math.PI*1.04,Math.PI*1.96);c.stroke();
  c.beginPath();c.arc(144,328,55,Math.PI*1.04,Math.PI*1.96);c.stroke();
  c.fillStyle='rgba(7,19,9,.7)';c.fillRect(212,316,88,6);
  c.restore();c.restore();
}
