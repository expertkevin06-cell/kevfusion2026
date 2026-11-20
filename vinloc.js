/* KEV FUSION 2026 — vinloc.js v1.0.0
   CASE « LOCALISATION VIN » — s'ouvre automatiquement dans le mode Recherche dès que
   marque + modèle + motorisation sont identifiés. Indique la zone de frappe à froid du
   numéro de série, avec détail d'accès, méthode, outillage, précautions et SCHÉMA vectoriel
   annoté (vue commutable, repère pulsant, plage de frappe agrandie). Couvre toute la base :
   modèle précis → marque → générique, avec affinements par motorisation / puissance. */
(function(){
'use strict';
var DB=window.KFVinLocDB;if(!DB){console.warn('vinloc: base absente');return}
var Z=DB.Z;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
function clamp(v,a,b){v=+v;if(!isFinite(v))v=a;return Math.max(a,Math.min(b,v))}
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
function toast(m){if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3000)}
function snd(k){try{if(typeof window.KFTurbo!=='undefined')return}catch(e){}
 /* bips discrets liés aux événements visibles */
 if(!CFG.sound)return;
 try{var c=AU.c||(AU.c=new (window.AudioContext||window.webkitAudioContext)());
  if(c.state==='suspended')c.resume();
  var m={open:[420,900,.22,'triangle'],tick:[1300,1300,.02,'sine'],mark:[660,1100,.12,'sine'],
   out:[523,880,.22,'triangle']}[k]||[900,900,.04,'sine'];
  var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(50,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.1,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.03)}catch(e){}}
var AU={c:null};
var DEF={view:'auto',style:'real',zoom:100,rot:0,marker:100,glow:56,grid:30,labels:true,anim:true,
 c1:'#38bdf8',c2:'#ffb020',density:100,sound:true};
var CFG=Object.assign({},DEF,LS.g('vlCfg',{}));
function saveCfg(){LS.s('vlCfg',CFG)}
var ST={key:'',open:false,dismissed:{},zone:null,alt:null,vin:''};

/* ══════════ résolution de la localisation ══════════ */
function resolve(brand,model,fuel,power,year){
 var mk=brand||'',md=model||'';
 var mkey=mk+'|'+md;
 var base=DB.MODEL[mkey]||null;
 var br=DB.BRAND[mk]||null;
 var fr=DB.fuelRule(fuel||'');
 var primary=(base&&base.primary)||(fr&&fr.primary)||(br&&br.primary)||'baie';
 var sec=(br&&br.sec)||['baie','piedB_g'];
 var zone=Z[primary]||Z.baie;
 var detail=(base&&base.d)||(br&&br.note)||zone.d;
 var note=(fr&&fr.note)||'';
 return{key:mkey+'|'+(fuel||'')+'|'+(power||'')+'|'+(year||''),
  brand:mk,model:md,fuel:fuel||'',power:power||'',year:year||'',
  primary:primary,zone:zone,sec:sec.map(function(s){return Z[s]}).filter(Boolean),
  detail:detail,note:note,specific:!!base,brandRule:!!br}}
function currentVehicle(){
 try{if(typeof S!=='undefined'&&S.vehicle&&S.vehicle.brand)return S.vehicle}catch(e){}
 return null}

/* ══════════ schémas SVG ══════════ */
function vehTop(c){/* vue de dessus */
 c.beginPath();c.moveTo(50,4);c.bezierCurveTo(74,4,80,14,80,30);c.lineTo(80,74);
 c.bezierCurveTo(80,90,72,96,50,96);c.bezierCurveTo(28,96,20,90,20,74);c.lineTo(20,30);
 c.bezierCurveTo(20,14,26,4,50,4);c.closePath()}
function vehFront(c){/* 3/4 avant */
 c.beginPath();c.moveTo(14,66);c.lineTo(20,44);c.bezierCurveTo(26,34,38,30,50,30);
 c.bezierCurveTo(64,30,76,34,82,44);c.lineTo(88,66);c.bezierCurveTo(88,74,84,78,78,78);
 c.lineTo(22,78);c.bezierCurveTo(16,78,14,74,14,66);c.closePath()}
function scene(res,opts){
 var o=opts||{};
 var view=o.view||res.zone.v;
 var zc=o.zone||res.zone;
 var x=zc.x,y=zc.y;
 var W=520,H=340;
 var real=CFG.style==='real';
 var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 340" width="100%" preserveAspectRatio="xMidYMid meet">';
 s+='<defs>'+
  '<linearGradient id="vlBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#08131f"/><stop offset=".55" stop-color="#0c1c2c"/><stop offset="1" stop-color="#101426"/></linearGradient>'+
  '<linearGradient id="vlBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(real?'#3b4a5e':'#16283c')+'"/><stop offset=".5" stop-color="'+(real?'#22303f':'#101d2c')+'"/><stop offset="1" stop-color="'+(real?'#141d28':'#0b1420')+'"/></linearGradient>'+
  '<linearGradient id="vlGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b4a63"/><stop offset="1" stop-color="#12283a"/></linearGradient>'+
  '<linearGradient id="vlMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fa3b8"/><stop offset=".45" stop-color="#5b6d80"/><stop offset="1" stop-color="#33414f"/></linearGradient>'+
  '<radialGradient id="vlHalo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="'+CFG.c1+'" stop-opacity="'+(CFG.glow/140).toFixed(2)+'"/><stop offset="1" stop-color="'+CFG.c1+'" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="vlMark" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="'+CFG.c2+'" stop-opacity=".95"/><stop offset=".6" stop-color="'+CFG.c2+'" stop-opacity=".35"/><stop offset="1" stop-color="'+CFG.c2+'" stop-opacity="0"/></radialGradient>'+
  '<filter id="vlSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>'+
  '</defs>';
 s+='<rect width="520" height="340" fill="url(#vlBg)"/>';
 if(CFG.grid>0){s+='<g stroke="'+CFG.c1+'" stroke-opacity="'+(CFG.grid/300).toFixed(3)+'" stroke-width="1">';
  for(var gx=0;gx<=520;gx+=26)s+='<path d="M'+gx+' 0 V340"/>';
  for(var gy=0;gy<=340;gy+=26)s+='<path d="M0 '+gy+' H520"/>';
  s+='</g>'}
 s+='<rect width="520" height="340" fill="url(#vlHalo)"/>';
 /* échelle + cadre atelier */
 s+='<g stroke="'+CFG.c1+'" stroke-opacity=".5" fill="none"><path d="M18 18 h26 M18 18 v26"/><path d="M502 18 h-26 M502 18 v26"/><path d="M18 322 h26 M18 322 v-26"/><path d="M502 322 h-26 M502 322 v-26"/></g>';
 var body='url(#vlBody)',glass='url(#vlGlass)',stroke=real?'#0a121c':'#3f5a76',sw=real?1.4:1.6;
 function grp(inner,tx,ty,sc,rot){
  return '<g transform="translate('+tx+' '+ty+') rotate('+rot+') scale('+sc+')">'+inner+'</g>'}
 var car='';
 if(view==='top'){
  car='<g><path d="M260 26 C330 26 352 52 352 96 L352 246 C352 292 328 314 260 314 C192 314 168 292 168 246 L168 96 C168 52 190 26 260 26 Z" fill="'+body+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M196 96 C210 74 236 66 260 66 C284 66 310 74 324 96 L324 150 L196 150 Z" fill="'+glass+'" opacity=".9"/>'+
   '<path d="M196 214 L324 214 L324 258 C310 276 284 282 260 282 C236 282 210 276 196 258 Z" fill="'+glass+'" opacity=".8"/>'+
   '<g stroke="'+stroke+'" stroke-width="1.2" opacity=".7"><path d="M168 120 h-14 v60 h14"/><path d="M352 120 h14 v60 h-14"/></g>'+
   '<g fill="#0d1622" stroke="'+stroke+'"><rect x="150" y="70" width="16" height="46" rx="6"/><rect x="354" y="70" width="16" height="46" rx="6"/><rect x="150" y="224" width="16" height="46" rx="6"/><rect x="354" y="224" width="16" height="46" rx="6"/></g>'+
   '<path d="M260 30 V310" stroke="'+CFG.c1+'" stroke-opacity=".25" stroke-dasharray="6 8"/></g>';
  var px=168+ (x/100)*184, py=26+(y/100)*288;
  var mark=marker(px,py,o);
  s+=grp(car,0,0,1,0)+mark;
 }else if(view==='front34'){
  car='<g><path d="M96 236 L116 156 C128 122 168 104 250 102 C336 100 386 118 402 152 L424 236 C428 252 420 262 404 262 L116 262 C100 262 92 252 96 236 Z" fill="'+body+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M150 150 C166 122 200 112 250 112 C304 112 340 122 356 150 L352 176 L154 176 Z" fill="'+glass+'" opacity=".9"/>'+
   '<g fill="#0b1420" stroke="'+stroke+'"><ellipse cx="150" cy="252" rx="34" ry="30"/><ellipse cx="372" cy="252" rx="34" ry="30"/></g>'+
   '<g fill="url(#vlMetal)"><ellipse cx="150" cy="252" rx="17" ry="15"/><ellipse cx="372" cy="252" rx="17" ry="15"/></g>'+
   '<path d="M186 208 h60 M276 208 h60" stroke="'+CFG.c1+'" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>'+
   '<path d="M120 190 C160 178 340 178 402 190" stroke="'+(real?'#9fb4c8':CFG.c1)+'" stroke-opacity=".5" fill="none"/>'+
   '<path d="M250 102 V60" stroke="'+stroke+'" stroke-opacity=".5" stroke-dasharray="4 6"/></g>';
  var px2=96+(x/100)*328, py2=100+(y/100)*164;
  s+=grp(car,0,0,1,0)+marker(px2,py2,o);
 }else if(view==='bay'){
  car='<g><path d="M70 250 C90 130 180 78 260 78 C340 78 430 130 450 250 Z" fill="'+glass+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M70 250 L450 250 L450 268 L70 268 Z" fill="url(#vlMetal)" stroke="'+stroke+'"/>'+
   '<path d="M96 236 C120 140 190 96 260 96 C330 96 400 140 424 236" fill="none" stroke="'+CFG.c1+'" stroke-opacity=".35"/>'+
   '<g fill="#0d1622"><rect x="236" y="252" width="48" height="12" rx="3"/></g>'+
   '<path d="M120 210 h60 M340 210 h60" stroke="#0a121c" stroke-opacity=".5" stroke-width="6"/></g>';
  var px3=70+(x/100)*380, py3=78+(y/100)*176;
  s+=grp(car,0,0,1,0)+marker(px3,py3,o);
 }else if(view==='sill'){
  car='<g><path d="M96 60 h328 v200 h-328 z" fill="'+body+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M96 60 h328 v34 h-328 z" fill="url(#vlMetal)" stroke="'+stroke+'"/>'+
   '<path d="M150 94 v166 M370 94 v166" stroke="'+stroke+'" stroke-opacity=".6"/>'+
   '<rect x="212" y="120" width="96" height="64" rx="6" fill="#0b1420" stroke="'+CFG.c1+'" stroke-opacity=".6"/>'+
   '<g fill="'+CFG.c1+'" opacity=".85"><rect x="222" y="132" width="76" height="5" rx="2"/><rect x="222" y="144" width="60" height="5" rx="2"/><rect x="222" y="156" width="70" height="5" rx="2"/><rect x="222" y="168" width="44" height="5" rx="2"/></g>'+
   '<path d="M96 260 h328 v14 h-328 z" fill="url(#vlMetal)" stroke="'+stroke+'"/></g>';
  var px4=96+(x/100)*328, py4=60+(y/100)*214;
  s+=grp(car,0,0,1,0)+marker(px4,py4,o);
 }else if(view==='well'){
  car='<g><path d="M110 70 h300 v190 h-300 z" fill="'+body+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<circle cx="260" cy="168" r="70" fill="#0b1420" stroke="'+stroke+'"/>'+
   '<circle cx="260" cy="168" r="52" fill="#101c2a" stroke="'+stroke+'" stroke-opacity=".7"/>'+
   '<g stroke="'+stroke+'" stroke-opacity=".5"><path d="M260 116 v104 M208 168 h104"/></g>'+
   '<path d="M110 70 h300 v22 h-300 z" fill="url(#vlMetal)" stroke="'+stroke+'"/>'+
   '<path d="M126 236 h60 M334 236 h60" stroke="'+CFG.c1+'" stroke-opacity=".4"/></g>';
  var px5=110+(x/100)*300, py5=70+(y/100)*190;
  s+=grp(car,0,0,1,0)+marker(px5,py5,o);
 }else{ /* rail : zoom frappe à froid */
  car='<g><path d="M60 150 C120 120 200 112 300 116 C380 120 440 132 470 150 L470 210 C440 226 380 236 300 238 C200 240 120 232 60 210 Z" fill="url(#vlMetal)" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M60 150 C120 120 200 112 300 116 C380 120 440 132 470 150" fill="none" stroke="#cfd9e4" stroke-opacity=".5"/>'+
   '<g stroke="#22303e" stroke-opacity=".55"><path d="M90 140 v66"/><path d="M430 142 v64"/></g>'+
   '<rect x="150" y="150" width="220" height="52" rx="6" fill="#1a2532" stroke="'+CFG.c2+'" stroke-opacity=".8"/>'+
   vinPlate(160,162)+
   '<path d="M150 202 l-14 26 M370 202 l14 26" stroke="'+CFG.c2+'" stroke-opacity=".7" stroke-width="2"/>'+
   '<text x="260" y="252" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" fill="'+CFG.c2+'">FRAPPE À FROID — 17 CARACTÈRES ESTAMPÉS</text></g>';
  s+=grp(car,0,0,1,0)+marker(260,176,o);
 }
 /* légende */
 if(CFG.labels){
  s+='<g font-family="system-ui,sans-serif" font-size="12" fill="#cfe0f2">'+
   '<rect x="18" y="292" width="'+Math.min(486,18+ (zc.l||'').length*7+120)+'" height="34" rx="8" fill="#08131f" stroke="'+CFG.c1+'" stroke-opacity=".5"/>'+
   '<circle cx="36" cy="309" r="6" fill="'+CFG.c2+'"/>'+
   '<text x="50" y="305" font-weight="700" fill="#eaf4ff">'+esc(zc.l||'')+'</text>'+
   '<text x="50" y="320" font-size="10.5" fill="#8fb0cc">'+esc(zc.m||'')+' · vue '+esc(viewLabel(view))+'</text></g>'}
 s+='</svg>';
 return s}
function marker(px,py,o){
 var k=(CFG.marker/100),anim=CFG.anim?' class="vl-pulse"':'';
 return '<g transform="translate('+px.toFixed(1)+' '+py.toFixed(1)+')"'+(o&&o.nolabel?'':'')+'>'+
  '<circle r="'+(34*k).toFixed(1)+'" fill="url(#vlMark)"'+anim+' style="transform-box:fill-box;transform-origin:center"/>'+
  '<circle r="'+(11*k).toFixed(1)+'" fill="none" stroke="'+CFG.c2+'" stroke-width="2.4"/>'+
  '<circle r="'+(3.4*k).toFixed(1)+'" fill="'+CFG.c2+'"/>'+
  '<path d="M0 '+(-16*k).toFixed(1)+' V'+(-30*k).toFixed(1)+' M'+(16*k).toFixed(1)+' 0 H'+(30*k).toFixed(1)+' M0 '+(16*k).toFixed(1)+' V'+(30*k).toFixed(1)+' M'+(-16*k).toFixed(1)+' 0 H'+(-30*k).toFixed(1)+'" stroke="'+CFG.c2+'" stroke-width="2" opacity=".85"/>'+
  '</g>'}
function vinPlate(x,y){
 var vin=(ST.vin||'VF1AAAA0000123456').toUpperCase().slice(0,17);
 var s='<g font-family="ui-monospace,monospace" font-size="15" font-weight="700">';
 for(var i=0;i<vin.length;i++){
  var cx=x+i*12.4;
  s+='<text x="'+cx.toFixed(1)+'" y="'+(y+22)+'" fill="#0b1420">'+esc(vin[i])+'</text>';
  s+='<text x="'+(cx-0.8).toFixed(1)+'" y="'+(y+21.2)+'" fill="#dfe8f2" opacity=".9">'+esc(vin[i])+'</text>'}
 s+='</g>';return s}
function viewLabel(v){return{top:'dessus',front34:'3/4 avant',bay:'baie de pare-brise',sill:'pied / seuil de porte',well:'coffre / puits',rail:'zoom frappe'}[v]||v}

/* ══════════ rendu de la case ══════════ */
function host(){
 var vr=$('#vehRead');if(!vr)return null;
 var h=$('#vinlocHost');
 if(!h){h=document.createElement('div');h.id='vinlocHost';
  vr.parentNode.insertBefore(h,vr.nextSibling)}
 return h}
function render(open){
 var h=host();if(!h)return;
 var veh=currentVehicle();
 if(!veh||!veh.brand||!veh.model||!veh.engine){h.innerHTML='';ST.key='';return}
 var fuel=veh.fuel||veh.energie||'';
 var res=resolve(veh.brand,veh.model,fuel,veh.ch||veh.power||'',veh.year||'');
 ST.vin=veh.vin||ST.vin||'';
 var key=res.key;
 var dismissed=ST.dismissed[key];
 if(!open&&ST.key===key&&h.querySelector('.vl-card'))return;
 ST.key=key;ST.zone=res;
 var show=open||(!dismissed);
 h.innerHTML=
 '<div class="vl-wrap'+(show?' open':'')+'" id="vlWrap">'+
  '<div class="vl-head"><span class="vl-ic">🔎</span>'+
   '<div class="vl-t"><b>Localisation VIN — frappe à froid</b>'+
    '<span>'+esc(res.brand)+' '+esc(res.model)+(res.fuel?' · '+esc(res.fuel):'')+(res.power?' · '+res.power+' ch':'')+'</span></div>'+
   '<span class="vl-badge '+(res.specific?'ok':res.brandRule?'':'warn')+'">'+(res.specific?'modèle référencé':res.brandRule?'règle marque':'règle générique')+'</span>'+
   '<button class="vl-x" data-vl="toggle" title="'+(show?'Replier':'Ouvrir')+'">'+(show?'▾':'▸')+'</button></div>'+
  (show?body(res):'')+
 '</div>';
 bind();
 if(show){snd('open')}
}
function body(res){
 var z=res.zone;
 var view=CFG.view==='auto'?z.v:CFG.view;
 var sc=scene(res,{view:view,zone:z});
 return '<div class="vl-body">'+
  '<div class="vl-main">'+
   '<div class="vl-scene" id="vlScene">'+sc+'</div>'+
   '<div class="vl-views">'+['auto','top','front34','bay','sill','well','rail'].map(function(v){
     return '<button class="vl-vbtn'+((CFG.view===v||(CFG.view==='auto'&&v===z.v))?' on':'')+'" data-vlview="'+v+'">'+
      (v==='auto'?'Auto':viewLabel(v))+'</button>'}).join('')+'</div>'+
   '<div class="vl-zoom">'+
    '<div class="vl-zl"><b>Zone de frappe</b><span>'+esc(z.l)+'</span></div>'+
    '<div class="vl-zl"><b>Méthode</b><span>'+esc(z.m)+'</span></div>'+
    '<div class="vl-zl"><b>Vue de référence</b><span>'+esc(viewLabel(view))+'</span></div>'+
    (ST.vin?'<div class="vl-zl"><b>VIN lu</b><span class="mono">'+esc(ST.vin)+'</span></div>':'')+
   '</div>'+
   '<div class="vl-detail"><b>Détail de localisation &amp; accès</b><p>'+esc(res.detail)+'</p>'+
    (res.note?'<p class="vl-note">'+esc(res.note)+'</p>':'')+'</div>'+
   '<div class="vl-grid2">'+
    '<div class="vl-box"><b>🧰 Outillage conseillé</b><p>'+esc(z.t||'Lampe, miroir, brosse douce')+'</p></div>'+
    '<div class="vl-box warn"><b>⚠️ Précautions d’expertise</b><p>'+esc(z.w||'Comparer frappe, plaque et baie ; toute incohérence = suspicion.')+'</p></div>'+
   '</div>'+
   (res.sec.length?'<div class="vl-sec"><b>Lectures complémentaires</b><div class="vl-chips">'+
     res.sec.map(function(s2){return '<span class="vl-chip">'+esc(s2.l)+' · '+esc(s2.m)+'</span>'}).join('')+'</div></div>':'')+
   '<div class="vl-act">'+
    '<button class="vl-pri" data-vl="png">🖼️ Exporter le schéma</button>'+
    '<button data-vl="copy">📋 Copier le détail</button>'+
    '<button data-vl="report">📄 Ajouter au rapport</button>'+
    '<button data-vl="dismiss">✕ Fermer la case</button>'+
   '</div>'+
  '</div>'+
  '<aside class="vl-dock">'+
   '<b>🎛️ Réglages du schéma</b>'+
   '<div class="vl-c"><label>Vue</label><select data-vlc="view">'+
    ['auto','top','front34','bay','sill','well','rail'].map(function(v){
     return '<option value="'+v+'"'+(CFG.view===v?' selected':'')+'>'+(v==='auto'?'Automatique (zone)':viewLabel(v))+'</option>'}).join('')+'</select></div>'+
   '<div class="vl-c"><label>Rendu</label><select data-vlc="style">'+
    '<option value="real"'+(CFG.style==='real'?' selected':'')+'>Photo-réaliste (métal, ombres)</option>'+
    '<option value="line"'+(CFG.style==='line'?' selected':'')+'>Schéma technique filaire</option></select></div>'+
   vrg('zoom','Zoom',60,180,'%')+vrg('rot','Rotation',-24,24,'°')+
   vrg('marker','Taille du repère',40,180,'%')+vrg('glow','Halo',0,100,'%')+
   vrg('grid','Grille atelier',0,80,'')+vrg('density','Densité',85,125,'%')+
   '<div class="vl-tgs">'+vtg('labels','Étiquettes')+vtg('anim','Repère pulsant')+vtg('sound','Son')+'</div>'+
   '<div class="vl-cols">'+
    '<div><input type="color" data-vlc="c1" value="'+CFG.c1+'"><span>Atelier</span></div>'+
    '<div><input type="color" data-vlc="c2" value="'+CFG.c2+'"><span>Repère</span></div></div>'+
   '<div class="vl-btns"><button data-vl="reset">↺</button><button data-vl="rand">🎲</button>'+
    '<button class="p" data-vl="png">🖼️ PNG</button></div>'+
   '<p class="vl-note">Réglages appliqués <b>en direct</b> sur le schéma.</p>'+
  '</aside></div>'}
function vrg(k,l,a,b,u){return '<div class="vl-c"><label>'+l+' <b id="vlo_'+k+'">'+CFG[k]+u+'</b></label>'+
 '<input type="range" data-vlc="'+k+'" min="'+a+'" max="'+b+'" value="'+CFG[k]+'"></div>'}
function vtg(k,l){return '<label class="vl-tg'+(CFG[k]?' on':'')+'" id="vlt_'+k+'"><input type="checkbox" data-vlt="'+k+'"'+(CFG[k]?' checked':'')+'> '+l+'</label>'}
function bind(){
 var w=$('#vinlocHost');if(!w||w._b)return;w._b=1;
 w.addEventListener('input',function(e){
  var k=e.target.dataset&&e.target.dataset.vlc;
  if(k){CFG[k]=e.target.type==='range'?+e.target.value:e.target.value;
   var o=$('#vlo_'+k);if(o)o.textContent=CFG[k]+(k==='rot'?'°':'%');
   saveCfg();repaint();return}
  var t=e.target.dataset&&e.target.dataset.vlt;
  if(t){CFG[t]=e.target.checked;var g=$('#vlt_'+t);if(g)g.classList.toggle('on',CFG[t]);saveCfg();repaint()}});
 w.addEventListener('change',function(e){
  var k=e.target.dataset&&e.target.dataset.vlc;
  if(k&&e.target.tagName==='SELECT'){CFG[k]=e.target.value;saveCfg();repaint()}});
 w.addEventListener('click',function(e){
  var vb=e.target.closest('[data-vlview]');
  if(vb){CFG.view=vb.dataset.vlview;saveCfg();repaint();snd('tick');return}
  var b=e.target.closest('[data-vl]');if(!b)return;
  var k=b.dataset.vl;
  if(k==='toggle'){var wrap=$('#vlWrap');var open=wrap.classList.contains('open');
   if(open){ST.dismissed[ST.key]=true;render(false);wrap=$('#vlWrap');if(wrap)wrap.classList.remove('open')}
   else{delete ST.dismissed[ST.key];render(true)}
   snd('tick');return}
  if(k==='dismiss'){ST.dismissed[ST.key]=true;var w2=$('#vlWrap');if(w2)w2.classList.remove('open');
   setTimeout(function(){render(false)},260);snd('tick');return}
  if(k==='png'){exportPng();return}
  if(k==='copy'){copyDetail();return}
  if(k==='report'){addToReport();return}
  if(k==='reset'){CFG=Object.assign({},DEF);saveCfg();render(true);snd('tick');return}
  if(k==='rand'){var pal=[['#38bdf8','#ffb020'],['#22c55e','#ff4d6d'],['#a855f7','#22d3ee'],['#ffd166','#38bdf8']];
   var p=pal[Math.floor(Math.random()*pal.length)];CFG.c1=p[0];CFG.c2=p[1];
   CFG.glow=25+Math.floor(Math.random()*70);CFG.grid=Math.floor(Math.random()*70);
   CFG.zoom=85+Math.floor(Math.random()*70);saveCfg();render(true);snd('mark');return}})}
function repaint(){
 var sc=$('#vlScene');if(!sc||!ST.zone)return;
 var view=CFG.view==='auto'?ST.zone.zone.v:CFG.view;
 sc.innerHTML=scene(ST.zone,{view:view,zone:ST.zone.zone});
 sc.style.setProperty('--vlzoom',(CFG.zoom/100));
 sc.style.setProperty('--vlrot',CFG.rot+'deg');
 $$('[data-vlview]',sc.parentNode.parentNode).forEach(function(b){
  b.classList.toggle('on',b.dataset.vlview===CFG.view||(CFG.view==='auto'&&b.dataset.vlview===ST.zone.zone.v))});
 syncDock()}
function syncDock(){
 $$('[data-vlc]').forEach(function(e){var k=e.dataset.vlc;e.value=CFG[k];
  var o=$('#vlo_'+k);if(o)o.textContent=CFG[k]+(k==='rot'?'°':'%')});
 ['labels','anim','sound'].forEach(function(k){var g=$('#vlt_'+k);
  if(g){var i=g.querySelector('input');if(i)i.checked=!!CFG[k];g.classList.toggle('on',!!CFG[k])}})}
function exportPng(){
 var svg=$('#vlScene svg');if(!svg){toast('Ouvrez la case d’abord');return}
 var xml=new XMLSerializer().serializeToString(svg);
 var img=new Image();
 img.onload=function(){var c=document.createElement('canvas');c.width=1560;c.height=1020;
  var x=c.getContext('2d');x.fillStyle='#08131f';x.fillRect(0,0,1560,1020);
  x.drawImage(img,0,0,1560,1020);
  c.toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);
   a.download='VIN-localisation-'+(ST.zone?ST.zone.model:'vehicule')+'.png';a.click();
   setTimeout(function(){URL.revokeObjectURL(a.href)},6000);toast('🖼️ Schéma exporté');snd('out')},'image/png')};
 img.onerror=function(){toast('Export impossible')};
 img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml)}
function copyDetail(){
 if(!ST.zone)return;
 var z=ST.zone.zone;
 var txt='LOCALISATION VIN — '+ST.zone.brand+' '+ST.zone.model+
  (ST.zone.fuel?' ('+ST.zone.fuel+')':'')+'\nZone : '+z.l+'\nMéthode : '+z.m+
  '\nDétail : '+ST.zone.detail+'\nOutillage : '+(z.t||'—')+'\nPrécautions : '+(z.w||'—')+
  (ST.vin?'\nVIN : '+ST.vin:'');
 try{navigator.clipboard.writeText(txt).then(function(){toast('📋 Détail copié');snd('tick')})}
 catch(e){toast(txt)}}
function addToReport(){
 if(!ST.zone)return;
 try{
  if(typeof S!=='undefined'){S.vinloc=S.vinloc||[];
   S.vinloc.push({ts:Date.now(),brand:ST.zone.brand,model:ST.zone.model,zone:ST.zone.zone.l,
    method:ST.zone.zone.m,detail:ST.zone.detail,vin:ST.vin})}
  toast('📄 Ajouté au rapport d’étude');snd('ok');
 }catch(e){toast('Ajout impossible')}}

/* ══════════ détection de la sélection ══════════ */
var lastSig='';
function sig(){
 var v=currentVehicle();
 if(!v)return '';
 return [v.brand,v.model,v.engine,v.fuel||v.energie||'',v.ch||v.power||'',v.year||''].join('|')}
function tick(){
 var s=sig();
 if(!s){var h=$('#vinlocHost');if(h&&h.innerHTML){h.innerHTML=''}lastSig='';return}
 if(s!==lastSig){lastSig=s;delete ST.dismissed[s];render(true)}
 else if(!$('#vinlocHost')||!$('#vinlocHost').innerHTML){render(!ST.dismissed[s])}}
function watch(){
 var mo=null;
 function attach(){
  var vr=$('#vehRead');
  if(!vr||mo)return;
  try{mo=new MutationObserver(function(){setTimeout(tick,60)});
   mo.observe(vr,{childList:true,subtree:true,characterData:true})}catch(e){}}
 attach();
 setInterval(function(){
  if(!$('#vehRead')){mo=null}
  attach();tick()},700);
 try{document.addEventListener('kf:vehicle',function(){setTimeout(tick,80)})}catch(e){}}

/* ══════════ CSS ══════════ */
function css(){
 if($('#vlCss'))return;var s=document.createElement('style');s.id='vlCss';
 s.textContent=
 '#vinlocHost{margin:12px 0}'+
 '.vl-wrap{border:1px solid #2b6b8f;border-radius:16px;overflow:hidden;background:linear-gradient(160deg,#08131f,#0c1c2c 60%,#101426);'+
  'box-shadow:0 14px 40px #000a;max-height:56px;transition:max-height .45s cubic-bezier(.2,.8,.2,1)}'+
 '.vl-wrap.open{max-height:2400px}'+
 '.vl-head{display:flex;align-items:center;gap:11px;padding:13px 15px;background:linear-gradient(90deg,#38bdf814,transparent);cursor:pointer}'+
 '.vl-ic{font-size:20px}'+
 '.vl-t{flex:1;min-width:0}'+
 '.vl-t b{display:block;font-size:14px;color:#eaf4ff}'+
 '.vl-t span{display:block;font-size:11px;color:#8fb0cc;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.vl-badge{font:800 9.5px/1 system-ui;letter-spacing:.8px;padding:5px 9px;border-radius:14px;border:1px solid #2b6b8f;color:#8fb0cc}'+
 '.vl-badge.ok{border-color:#22c55e;color:#22c55e;background:#22c55e12}'+
 '.vl-badge.warn{border-color:#ffb020;color:#ffb020;background:#ffb02012}'+
 '.vl-x{background:#0b1420;border:1px solid #2b6b8f;color:#cfe0f2;border-radius:9px;padding:5px 10px;cursor:pointer;font-size:13px}'+
 '.vl-body{display:grid;grid-template-columns:minmax(0,1fr) 268px;gap:16px;padding:16px}'+
 '@media(max-width:900px){.vl-body{grid-template-columns:1fr}}'+
 '.vl-main{min-width:0}'+
 '.vl-scene{border:1px solid #2b6b8f;border-radius:14px;overflow:hidden;background:#08131f;'+
  'transform:scale(var(--vlzoom,1)) rotate(var(--vlrot,0deg));transform-origin:50% 45%;transition:transform .25s}'+
 '.vl-scene svg{display:block;width:100%;height:auto}'+
 '.vl-pulse{animation:vlP 1.6s ease-in-out infinite}'+
 '@keyframes vlP{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.35);opacity:.5}}'+
 '.vl-views{display:flex;gap:6px;flex-wrap:wrap;margin:11px 0}'+
 '.vl-vbtn{padding:7px 12px;font-size:11.5px;font-weight:700;border-radius:16px;border:1px solid #2b6b8f;background:#0b1420;color:#cfe0f2;cursor:pointer}'+
 '.vl-vbtn:hover{border-color:#38bdf8;color:#38bdf8}'+
 '.vl-vbtn.on{background:linear-gradient(135deg,#38bdf8,#2563eb);border-color:#38bdf8;color:#04121e}'+
 '.vl-zoom{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-bottom:12px}'+
 '.vl-zl{border:1px solid #22405a;border-radius:11px;background:#0b1420;padding:9px 11px}'+
 '.vl-zl b{display:block;font-size:9px;letter-spacing:.8px;text-transform:uppercase;color:#6f8faa;margin-bottom:4px}'+
 '.vl-zl span{font-size:12.5px;color:#eaf4ff;font-weight:600}'+
 '.vl-zl .mono{font-family:ui-monospace,monospace;letter-spacing:1px;color:#ffb020}'+
 '.vl-detail{border-left:3px solid #ffb020;background:#ffb0200d;border-radius:0 12px 12px 0;padding:12px 14px;margin-bottom:12px}'+
 '.vl-detail b{display:block;font-size:12px;color:#ffd166;margin-bottom:6px}'+
 '.vl-detail p{margin:0 0 6px;font-size:13px;line-height:1.65;color:#dce8f4}'+
 '.vl-note{color:#8fb0cc!important;font-size:12px!important}'+
 '.vl-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}'+
 '@media(max-width:640px){.vl-grid2{grid-template-columns:1fr}}'+
 '.vl-box{border:1px solid #22405a;border-radius:12px;background:#0b1420;padding:11px 13px}'+
 '.vl-box b{display:block;font-size:11px;color:#9fd8f5;margin-bottom:5px}'+
 '.vl-box.warn{border-color:#ff4d6d55;background:#ff4d6d0d}'+
 '.vl-box.warn b{color:#ff8fa0}'+
 '.vl-box p{margin:0;font-size:12.5px;line-height:1.6;color:#cfe0f2}'+
 '.vl-sec{margin-bottom:12px}'+
 '.vl-sec>b{display:block;font-size:11px;color:#9fd8f5;margin-bottom:6px}'+
 '.vl-chips{display:flex;gap:6px;flex-wrap:wrap}'+
 '.vl-chip{font-size:11px;padding:5px 10px;border-radius:14px;border:1px solid #2b6b8f;background:#0b1420;color:#cfe0f2}'+
 '.vl-act{display:flex;gap:8px;flex-wrap:wrap}'+
 '.vl-act button{padding:10px 14px;font-size:12px;font-weight:800;border-radius:10px;border:1px solid #2b6b8f;background:#0b1420;color:#eaf4ff;cursor:pointer}'+
 '.vl-act button:hover{border-color:#38bdf8;color:#38bdf8}'+
 '.vl-act .vl-pri{background:linear-gradient(135deg,#38bdf8,#2563eb);border-color:#38bdf8;color:#04121e}'+
 '.vl-dock{border:1px solid #2b6b8f;border-radius:14px;background:linear-gradient(165deg,#08131f,#0c1c2c);padding:13px;align-self:start;position:sticky;top:74px;max-height:calc(100vh - 100px);overflow:auto}'+
 '@media(max-width:900px){.vl-dock{position:static;max-height:none}}'+
 '.vl-dock>b{display:block;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#38bdf8;margin-bottom:11px}'+
 '.vl-dock::-webkit-scrollbar{width:9px}.vl-dock::-webkit-scrollbar-track{background:#08131f;border-radius:8px}'+
 '.vl-dock::-webkit-scrollbar-thumb{background:linear-gradient(#38bdf8,#2563eb);border-radius:8px;border:2px solid #08131f}'+
 '.vl-dock{scrollbar-width:thin;scrollbar-color:#38bdf8 #08131f}'+
 '.vl-c{margin-bottom:10px}'+
 '.vl-c label{display:flex;justify-content:space-between;align-items:baseline;gap:6px;margin-bottom:4px;font-size:9px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#6f8faa}'+
 '.vl-c label b{color:#38bdf8;font-family:ui-monospace,monospace;font-size:10px}'+
 '.vl-c select{width:100%;background:#0b1420;border:1px solid #2b6b8f;color:#eaf4ff;border-radius:9px;padding:8px;font-size:12px;margin:0}'+
 '.vl-c select:focus{outline:none;border-color:#38bdf8}'+
 '.vl-c input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:2px 0 0;padding:0;border:0;background:linear-gradient(90deg,#38bdf8,#2563eb,#ffb020)}'+
 '.vl-c input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#eaf4ff;border:3px solid #38bdf8;cursor:grab}'+
 '.vl-c input[type=color]{width:100%;height:30px;border:1px solid #2b6b8f;border-radius:8px;background:#0b1420;padding:2px;cursor:pointer;margin:0}'+
 '.vl-tgs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}'+
 '.vl-tg{display:flex;align-items:center;gap:5px;font-size:10px;color:#6f8faa;background:#0b1420;border:1px solid #2b6b8f;border-radius:15px;padding:4px 9px;cursor:pointer}'+
 '.vl-tg input{width:auto;margin:0;accent-color:#38bdf8}'+
 '.vl-tg.on{color:#38bdf8;border-color:#38bdf8;background:#38bdf812}'+
 '.vl-cols{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px}'+
 '.vl-cols div{display:flex;flex-direction:column;align-items:center;gap:3px}'+
 '.vl-cols span{font-size:8.5px;color:#6f8faa}'+
 '.vl-btns{display:grid;grid-template-columns:1fr 1fr;gap:6px}'+
 '.vl-btns button{padding:9px;font-size:11px;font-weight:800;border-radius:9px;border:1px solid #2b6b8f;background:#0b1420;color:#eaf4ff;cursor:pointer}'+
 '.vl-btns .p{grid-column:1/-1;background:linear-gradient(135deg,#38bdf8,#2563eb);border-color:#38bdf8;color:#04121e}'+
 '.vl-note{margin:10px 0 0;font-size:10px;line-height:1.55;color:#6f8faa}.vl-note b{color:#cfe0f2}';
 document.head.appendChild(s)}

/* ══════════ boot ══════════ */
function boot(){css();watch();tick()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFVinLoc={render:render,resolve:resolve,scene:scene,exportPng:exportPng,state:ST,cfg:CFG};
})();
