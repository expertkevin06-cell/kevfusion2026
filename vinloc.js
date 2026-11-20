/* KEV FUSION 2026 — vinloc.js v2.0.0
   Case « Localisation VIN » à ouverture automatique en mode Recherche, avec localisation
   PRÉCISE de la frappe à froid : pièce de référence (tourelle, feuillure de tablier, traverse
   sous siège, longeron, puits, berceau), repère géométrique coté, accès pas-à-pas, outillage
   et précautions. Deux schémas synchronisés : vue véhicule (repère pulsant) + vue pièce
   (zoom avec plage de frappe et cote). Export PNG, copie, ajout au rapport. */
(function(){
'use strict';
var DB=window.KFVinLocDB;if(!DB){console.warn('vinloc: base absente');return}
var Z=DB.Z;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
function clamp(v,a,b){v=+v;if(!isFinite(v)?a:v);return Math.max(a,Math.min(b,+v||a))}
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
function toast(m){try{if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3000)}catch(e){}}
var AU={c:null};
function snd(k){if(!CFG.sound)return;
 try{var c=AU.c||(AU.c=new (window.AudioContext||window.webkitAudioContext)());
  if(c.state==='suspended')c.resume();
  var m={open:[420,900,.22,'triangle'],tick:[1300,1300,.02,'sine'],mark:[660,1180,.12,'sine'],
   out:[523,880,.22,'triangle']}[k]||[900,900,.04,'sine'];
  var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(50,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.1,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.03)}catch(e){}}
var DEF={view:'auto',style:'real',zoom:100,rot:0,marker:100,glow:56,grid:28,dims:true,labels:true,anim:true,
 c1:'#38bdf8',c2:'#ffb020',density:100,sound:true};
var CFG=Object.assign({},DEF,LS.g('vlCfg',{}));
function saveCfg(){LS.s('vlCfg',CFG)}
var ST={key:'',zone:null,res:null,vin:'',dismissed:{}};

/* ══════════ résolution précise ══════════ */
function resolve(brand,model,fuel,power,year){
 var mk=brand||'',md=model||'',yr=parseInt(year,10)||0;
 var mo=DB.MODEL[mk+'|'+md];
 var yrule=null;
 if(yr)for(var i=0;i<DB.YEAR.length;i++){var y=DB.YEAR[i];
  if(y.b.indexOf(mk)>=0&&yr>=y.from&&yr<=y.to){yrule=y;break}}
 var br=DB.BRAND[mk];
 var fr=DB.fuelRule(fuel||'');
 var pid=(mo&&mo[0])||(fr&&fr.p)||(yrule&&yrule.p)||(br&&br.p)||'goulotte_baie_d';
 var zone=Z[pid]||Z.goulotte_baie_d;
 var src=mo?'modèle':(fr&&fr.p)?'motorisation':yrule?'plateforme/année':br?'marque':'générique';
 var note=(mo&&mo[1])||(fr&&fr.n)||(yrule&&yrule.n)||(br&&br.n)||zone.anchor;
 var sec=(br&&br.sec||['goulotte_baie_d','piedB_g']).map(function(s){return Z[s]}).filter(Boolean);
 return{key:mk+'|'+md+'|'+(fuel||'')+'|'+(power||'')+'|'+(year||''),
  brand:mk,model:md,fuel:fuel||'',power:power||'',year:year||'',
  pid:pid,zone:zone,sec:sec,note:note,src:src}}
function currentVehicle(){try{if(typeof S!=='undefined'&&S.vehicle&&S.vehicle.brand)return S.vehicle}catch(e){}return null}

/* ══════════ schémas ══════════ */
function defs(){
 var real=CFG.style==='real';
 return '<defs>'+
 '<linearGradient id="vlBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#08131f"/><stop offset=".55" stop-color="#0c1c2c"/><stop offset="1" stop-color="#101426"/></linearGradient>'+
 '<linearGradient id="vlBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(real?'#3b4a5e':'#16283c')+'"/><stop offset=".5" stop-color="'+(real?'#22303f':'#101d2c')+'"/><stop offset="1" stop-color="'+(real?'#141d28':'#0b1420')+'"/></linearGradient>'+
 '<linearGradient id="vlGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b4a63"/><stop offset="1" stop-color="#12283a"/></linearGradient>'+
 '<linearGradient id="vlMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(real?'#9fb2c6':'#5b6d80')+'"/><stop offset=".45" stop-color="'+(real?'#66788c':'#33414f')+'"/><stop offset="1" stop-color="'+(real?'#3a4655':'#202b38')+'"/></linearGradient>'+
 '<radialGradient id="vlHalo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="'+CFG.c1+'" stop-opacity="'+(CFG.glow/140).toFixed(2)+'"/><stop offset="1" stop-color="'+CFG.c1+'" stop-opacity="0"/></radialGradient>'+
 '<radialGradient id="vlMark" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="'+CFG.c2+'" stop-opacity=".95"/><stop offset=".6" stop-color="'+CFG.c2+'" stop-opacity=".35"/><stop offset="1" stop-color="'+CFG.c2+'" stop-opacity="0"/></radialGradient>'+
 '</defs>'}
function marker(px,py,k){
 k=k||1;var a=CFG.anim?' class="vl-pulse"':'';
 return '<g transform="translate('+px.toFixed(1)+' '+py.toFixed(1)+')">'+
 '<circle r="'+(30*k).toFixed(1)+'" fill="url(#vlMark)"'+a+' style="transform-box:fill-box;transform-origin:center"/>'+
 '<circle r="'+(10*k).toFixed(1)+'" fill="none" stroke="'+CFG.c2+'" stroke-width="2.4"/>'+
 '<circle r="'+(3.2*k).toFixed(1)+'" fill="'+CFG.c2+'"/>'+
 '<path d="M0 '+(-15*k).toFixed(1)+' V'+(-28*k).toFixed(1)+' M'+(15*k).toFixed(1)+' 0 H'+(28*k).toFixed(1)+' M0 '+(15*k).toFixed(1)+' V'+(28*k).toFixed(1)+' M'+(-15*k).toFixed(1)+' 0 H'+(-28*k).toFixed(1)+'" stroke="'+CFG.c2+'" stroke-width="2" opacity=".85"/></g>'}
function vinPlate(x,y,size){
 var vin=(ST.vin||'VF1AAAA0000123456').toUpperCase().slice(0,17);
 var fs=size||15,step=fs*0.83,s='';
 s+='<g font-family="ui-monospace,monospace" font-size="'+fs+'" font-weight="700">';
 for(var i=0;i<vin.length;i++){var cx=x+i*step;
  s+='<text x="'+cx.toFixed(1)+'" y="'+(y+fs*0.8)+'" fill="#0b1420">'+esc(vin[i])+'</text>';
  s+='<text x="'+(cx-0.8).toFixed(1)+'" y="'+(y+fs*0.8-0.8)+'" fill="#e6eef7" opacity=".92">'+esc(vin[i])+'</text>'}
 s+='</g>';return s}
function dim(x1,y1,x2,y2,label){
 if(!CFG.dims)return '';
 return '<g stroke="'+CFG.c1+'" stroke-width="1.4" opacity=".9">'+
 '<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'"/>'+
 '<path d="M'+x1+' '+(y1-5)+' V'+(y1+5)+'"/><path d="M'+x2+' '+(y2-5)+' V'+(y2+5)+'"/>'+
 '<text x="'+((x1+x2)/2)+'" y="'+(Math.min(y1,y2)-7)+'" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10.5" fill="'+CFG.c1+'" stroke="none">'+esc(label||'')+'</text></g>'}
function vehScene(res){
 var z=res.zone,view=z.v,x=z.x,y=z.y;
 var real=CFG.style==='real',body='url(#vlBody)',glass='url(#vlGlass)',
  stroke=real?'#0a121c':'#3f5a76',sw=real?1.4:1.6,s='';
 s+='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 340" preserveAspectRatio="xMidYMid meet">'+defs();
 s+='<rect width="520" height="340" fill="url(#vlBg)"/>';
 if(CFG.grid>0){s+='<g stroke="'+CFG.c1+'" stroke-opacity="'+(CFG.grid/300).toFixed(3)+'">';
  for(var gx=0;gx<=520;gx+=26)s+='<path d="M'+gx+' 0 V340"/>';
  for(var gy=0;gy<=340;gy+=26)s+='<path d="M0 '+gy+' H520"/>';s+='</g>'}
 s+='<rect width="520" height="340" fill="url(#vlHalo)"/>';
 s+='<g stroke="'+CFG.c1+'" stroke-opacity=".5" fill="none"><path d="M18 18 h26 M18 18 v26"/><path d="M502 18 h-26 M502 18 v26"/><path d="M18 322 h26 M18 322 v-26"/><path d="M502 322 h-26 M502 322 v-26"/></g>';
 var car='',px=0,py=0;
 if(view==='top'){
  car='<path d="M260 26 C330 26 352 52 352 96 L352 246 C352 292 328 314 260 314 C192 314 168 292 168 246 L168 96 C168 52 190 26 260 26 Z" fill="'+body+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M196 96 C210 74 236 66 260 66 C284 66 310 74 324 96 L324 150 L196 150 Z" fill="'+glass+'" opacity=".9"/>'+
   '<path d="M196 214 L324 214 L324 258 C310 276 284 282 260 282 C236 282 210 276 196 258 Z" fill="'+glass+'" opacity=".8"/>'+
   '<g fill="#0d1622" stroke="'+stroke+'"><rect x="150" y="70" width="16" height="46" rx="6"/><rect x="354" y="70" width="16" height="46" rx="6"/><rect x="150" y="224" width="16" height="46" rx="6"/><rect x="354" y="224" width="16" height="46" rx="6"/></g>'+
   '<path d="M260 30 V310" stroke="'+CFG.c1+'" stroke-opacity=".25" stroke-dasharray="6 8"/>'+
   '<text x="260" y="20" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="'+CFG.c1+'">AVANT</text>';
  px=168+(x/100)*184;py=26+(y/100)*288;
 }else if(view==='front34'){
  car='<path d="M96 236 L116 156 C128 122 168 104 250 102 C336 100 386 118 402 152 L424 236 C428 252 420 262 404 262 L116 262 C100 262 92 252 96 236 Z" fill="'+body+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M150 150 C166 122 200 112 250 112 C304 112 340 122 356 150 L352 176 L154 176 Z" fill="'+glass+'" opacity=".9"/>'+
   '<g fill="#0b1420" stroke="'+stroke+'"><ellipse cx="150" cy="252" rx="34" ry="30"/><ellipse cx="372" cy="252" rx="34" ry="30"/></g>'+
   '<g fill="url(#vlMetal)"><ellipse cx="150" cy="252" rx="17" ry="15"/><ellipse cx="372" cy="252" rx="17" ry="15"/></g>'+
   '<path d="M186 208 h60 M276 208 h60" stroke="'+CFG.c1+'" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>'+
   '<path d="M120 190 C160 178 340 178 402 190" stroke="'+(real?'#9fb4c8':CFG.c1)+'" stroke-opacity=".5" fill="none"/>';
  px=96+(x/100)*328;py=100+(y/100)*164;
 }else if(view==='bay'){
  car='<path d="M70 250 C90 130 180 78 260 78 C340 78 430 130 450 250 Z" fill="'+glass+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M70 250 L450 250 L450 268 L70 268 Z" fill="url(#vlMetal)" stroke="'+stroke+'"/>'+
   '<path d="M96 236 C120 140 190 96 260 96 C330 96 400 140 424 236" fill="none" stroke="'+CFG.c1+'" stroke-opacity=".35"/>'+
   '<rect x="236" y="252" width="48" height="12" rx="3" fill="#0d1622"/>';
  px=70+(x/100)*380;py=78+(y/100)*176;
 }else if(view==='sill'){
  car='<path d="M96 60 h328 v200 h-328 z" fill="'+body+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M96 60 h328 v34 h-328 z" fill="url(#vlMetal)" stroke="'+stroke+'"/>'+
   '<path d="M150 94 v166 M370 94 v166" stroke="'+stroke+'" stroke-opacity=".6"/>'+
   '<rect x="212" y="120" width="96" height="64" rx="6" fill="#0b1420" stroke="'+CFG.c1+'" stroke-opacity=".6"/>'+
   '<g fill="'+CFG.c1+'" opacity=".85"><rect x="222" y="132" width="76" height="5" rx="2"/><rect x="222" y="144" width="60" height="5" rx="2"/><rect x="222" y="156" width="70" height="5" rx="2"/></g>'+
   '<path d="M96 260 h328 v14 h-328 z" fill="url(#vlMetal)" stroke="'+stroke+'"/>';
  px=96+(x/100)*328;py=60+(y/100)*214;
 }else{
  car='<path d="M110 70 h300 v190 h-300 z" fill="'+body+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<circle cx="260" cy="168" r="70" fill="#0b1420" stroke="'+stroke+'"/>'+
   '<circle cx="260" cy="168" r="52" fill="#101c2a" stroke="'+stroke+'" stroke-opacity=".7"/>'+
   '<path d="M260 116 v104 M208 168 h104" stroke="'+stroke+'" stroke-opacity=".5"/>'+
   '<path d="M110 70 h300 v22 h-300 z" fill="url(#vlMetal)" stroke="'+stroke+'"/>';
  px=110+(x/100)*300;py=70+(y/100)*190;
 }
 s+=car+marker(px,py);
 if(CFG.labels)s+='<g font-family="system-ui,sans-serif"><rect x="16" y="290" width="488" height="38" rx="9" fill="#08131f" stroke="'+CFG.c1+'" stroke-opacity=".5"/>'+
  '<circle cx="34" cy="309" r="6" fill="'+CFG.c2+'"/>'+
  '<text x="48" y="305" font-size="12.5" font-weight="700" fill="#eaf4ff">'+esc(z.l)+'</text>'+
  '<text x="48" y="321" font-size="10.5" fill="#8fb0cc">Vue véhicule · '+esc(viewLabel(view))+' · côté '+esc(z.side||'—')+'</text></g>';
 s+='</svg>';return s}
function partScene(res){
 var z=res.zone,real=CFG.style==='real',
  metal='url(#vlMetal)',stroke=real?'#0a121c':'#3f5a76',sw=real?1.5:1.7,s='';
 s+='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 340" preserveAspectRatio="xMidYMid meet">'+defs();
 s+='<rect width="520" height="340" fill="url(#vlBg)"/>';
 if(CFG.grid>0){s+='<g stroke="'+CFG.c1+'" stroke-opacity="'+(CFG.grid/320).toFixed(3)+'">';
  for(var gx=0;gx<=520;gx+=26)s+='<path d="M'+gx+' 0 V340"/>';
  for(var gy=0;gy<=340;gy+=26)s+='<path d="M0 '+gy+' H520"/>';s+='</g>'}
 var body='';
 if(z.part==='turret'){
  body='<circle cx="260" cy="160" r="104" fill="'+metal+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<circle cx="260" cy="160" r="70" fill="#16222f" stroke="'+stroke+'"/>'+
   '<circle cx="260" cy="160" r="26" fill="#0b1420" stroke="'+stroke+'"/>'+
   '<g fill="#0b1420" stroke="'+stroke+'"><circle cx="260" cy="86" r="11"/><circle cx="196" cy="196" r="11"/><circle cx="324" cy="196" r="11"/></g>'+
   '<path d="M156 160 a104 104 0 0 1 208 0" fill="none" stroke="#cfd9e4" stroke-opacity=".5" stroke-width="2"/>'+
   '<rect x="176" y="238" width="168" height="40" rx="6" fill="#1a2532" stroke="'+CFG.c2+'" stroke-opacity=".8"/>'+vinPlate(186,248,13)+
   dim(260,268,344,268,'40–70 mm du bord');
  s+=body+marker(260,258,0.8);
 }else if(z.part==='firewall'){
  body='<path d="M70 90 L450 90 L450 150 L410 150 L410 250 L110 250 L110 150 L70 150 Z" fill="'+metal+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M110 150 L410 150 L410 168 L110 168 Z" fill="#22303e" stroke="'+stroke+'"/>'+
   '<path d="M70 90 L450 90 L450 104 L70 104 Z" fill="#2c3a49" stroke="'+stroke+'"/>'+
   '<g stroke="'+stroke+'" stroke-opacity=".6"><path d="M150 168 V250"/><path d="M370 168 V250"/></g>'+
   '<rect x="180" y="182" width="180" height="40" rx="6" fill="#1a2532" stroke="'+CFG.c2+'" stroke-opacity=".8"/>'+vinPlate(190,192,13)+
   dim(110,268,180,268,'80–150 mm du pied de baie');
  s+=body+marker(270,202,0.8);
 }else if(z.part==='cross'){
  body='<path d="M60 130 C140 108 380 108 460 130 L460 196 C380 218 140 218 60 196 Z" fill="'+metal+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M60 130 C140 108 380 108 460 130" fill="none" stroke="#cfd9e4" stroke-opacity=".5" stroke-width="2"/>'+
   '<g stroke="'+stroke+'" stroke-opacity=".55"><path d="M120 122 V204"/><path d="M400 122 V204"/></g>'+
   '<rect x="170" y="142" width="180" height="40" rx="6" fill="#1a2532" stroke="'+CFG.c2+'" stroke-opacity=".8"/>'+vinPlate(180,152,13)+
   dim(260,214,260,252,'100–200 mm du tunnel')+
   '<path d="M260 96 V130" stroke="'+CFG.c1+'" stroke-dasharray="4 5" opacity=".7"/>'+
   '<text x="266" y="92" font-family="system-ui,sans-serif" font-size="10" fill="'+CFG.c1+'">tunnel central</text>';
  s+=body+marker(260,162,0.8);
 }else if(z.part==='rail'){
  body='<path d="M60 150 C120 120 200 112 300 116 C380 120 440 132 470 150 L470 210 C440 226 380 236 300 238 C200 240 120 232 60 210 Z" fill="'+metal+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M60 150 C120 120 200 112 300 116 C380 120 440 132 470 150" fill="none" stroke="#cfd9e4" stroke-opacity=".5"/>'+
   '<rect x="150" y="150" width="220" height="52" rx="6" fill="#1a2532" stroke="'+CFG.c2+'" stroke-opacity=".8"/>'+vinPlate(160,162)+
   dim(60,232,150,232,'150–300 mm du passage de roue');
  s+=body+marker(260,176,0.8);
 }else if(z.part==='well'){
  body='<circle cx="260" cy="170" r="112" fill="#16222f" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<circle cx="260" cy="170" r="86" fill="'+metal+'" stroke="'+stroke+'"/>'+
   '<circle cx="260" cy="170" r="34" fill="#0b1420" stroke="'+stroke+'"/>'+
   '<g stroke="'+stroke+'" stroke-opacity=".5"><path d="M260 84 V256 M174 170 H346"/></g>'+
   '<rect x="176" y="196" width="168" height="40" rx="6" fill="#1a2532" stroke="'+CFG.c2+'" stroke-opacity=".8"/>'+vinPlate(186,206,13)+
   dim(260,236,346,236,'plage décalée à droite');
  s+=body+marker(260,216,0.8);
 }else if(z.part==='bay'){
  body='<path d="M70 240 C90 130 180 84 260 84 C340 84 430 130 450 240 Z" fill="url(#vlGlass)" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M70 240 L450 240 L450 262 L70 262 Z" fill="'+metal+'" stroke="'+stroke+'"/>'+
   '<path d="M84 246 L436 246" stroke="'+CFG.c2+'" stroke-opacity=".7" stroke-width="3"/>'+
   '<rect x="300" y="222" width="120" height="26" rx="5" fill="#1a2532" stroke="'+CFG.c2+'" stroke-opacity=".85"/>'+
   '<text x="360" y="240" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" font-weight="700" fill="#e6eef7">'+esc((ST.vin||'VF1AAAA0000123456').slice(0,17))+'</text>'+
   dim(300,268,420,268,'bas droite, lisible par le vitrage');
  s+=body+marker(360,235,0.7);
 }else{ /* sill */
  body='<path d="M96 60 h328 v200 h-328 z" fill="'+metal+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'+
   '<path d="M96 60 h328 v34 h-328 z" fill="#2c3a49" stroke="'+stroke+'"/>'+
   '<rect x="196" y="120" width="128" height="70" rx="7" fill="#0b1420" stroke="'+CFG.c2+'" stroke-opacity=".8"/>'+
   '<g fill="'+CFG.c1+'" opacity=".85"><rect x="206" y="132" width="108" height="6" rx="3"/><rect x="206" y="146" width="86" height="6" rx="3"/><rect x="206" y="160" width="98" height="6" rx="3"/><rect x="206" y="174" width="60" height="6" rx="3"/></g>'+
   dim(96,214,196,214,'partie basse du montant');
  s+=body+marker(260,155,0.8);
 }
 if(CFG.labels)s+='<g font-family="system-ui,sans-serif"><rect x="16" y="290" width="488" height="38" rx="9" fill="#08131f" stroke="'+CFG.c2+'" stroke-opacity=".5"/>'+
  '<circle cx="34" cy="309" r="6" fill="'+CFG.c2+'"/>'+
  '<text x="48" y="305" font-size="12.5" font-weight="700" fill="#ffd166">ZOOM PIÈCE · '+esc(z.l)+'</text>'+
  '<text x="48" y="321" font-size="10.5" fill="#8fb0cc">'+esc(z.m)+' · repère : '+esc(z.anchor)+'</text></g>';
 s+='</svg>';return s}
function viewLabel(v){return{top:'dessus',front34:'3/4 avant',bay:'baie de pare-brise',sill:'pied / seuil',well:'coffre / puits',rail:'longeron'}[v]||v}

/* ══════════ rendu ══════════ */
function host(){var vr=$('#vehRead');if(!vr)return null;
 var h=$('#vinlocHost');if(!h){h=document.createElement('div');h.id='vinlocHost';
  vr.parentNode.insertBefore(h,vr.nextSibling)}return h}
function render(open){
 var h=host();if(!h)return;
 var veh=currentVehicle();
 if(!veh||!veh.brand||!veh.model||!veh.engine){h.innerHTML='';ST.key='';return}
 var res=resolve(veh.brand,veh.model,veh.fuel||veh.energie||'',veh.ch||veh.power||'',veh.year||'');
 ST.vin=veh.vin||ST.vin||'';ST.res=res;ST.zone=res.zone;
 var show=open||!ST.dismissed[res.key];
 ST.key=res.key;
 h.innerHTML='<div class="vl-wrap'+(show?' open':'')+'" id="vlWrap">'+
  '<div class="vl-head" data-vl="toggle"><span class="vl-ic">📍</span>'+
   '<div class="vl-t"><b>Localisation VIN — frappe à froid</b>'+
   '<span>'+esc(res.brand)+' '+esc(res.model)+(res.fuel?' · '+esc(res.fuel):'')+(res.power?' · '+res.power+' ch':'')+(res.year?' · '+esc(res.year):'')+'</span></div>'+
   '<span class="vl-badge '+(res.src==='modèle'?'ok':res.src==='générique'?'warn':'')+'">règle '+esc(res.src)+'</span>'+
   '<span class="vl-x">'+(show?'▾':'▸')+'</span></div>'+
  (show?body(res):'')+'</div>';
 bind();if(show)snd('open')}
function body(res){
 var z=res.zone;
 var dual=CFG.view==='auto';
 var veh=vehScene(res),part=partScene(res);
 return '<div class="vl-body">'+
 '<div class="vl-main">'+
  '<div class="vl-scenes'+(dual?' two':'')+'">'+
   '<figure class="vl-fig"><figcaption>🚗 Vue véhicule — '+esc(viewLabel(z.v))+'</figcaption><div class="vl-scene" id="vlSceneV">'+veh+'</div></figure>'+
   (dual?'<figure class="vl-fig"><figcaption>🔩 Zoom pièce — '+esc(z.part)+'</figcaption><div class="vl-scene" id="vlSceneP">'+part+'</div></figure>':'')+
  '</div>'+
  '<div class="vl-views">'+['auto','part','top','front34','bay','sill','well'].map(function(v){
    var on=(CFG.view===v)||(CFG.view==='auto'&&v==='auto');
    return '<button class="vl-vbtn'+(on?' on':'')+'" data-vlview="'+v+'">'+
     (v==='auto'?'Véhicule + pièce':v==='part'?'Pièce seule':viewLabel(v))+'</button>'}).join('')+'</div>'+
  '<div class="vl-prec"><span class="vl-prec-ic">🎯</span><div><b>'+esc(z.l)+'</b>'+
   '<span class="vl-method">'+esc(z.m)+' · côté '+esc(z.side||'—')+'</span></div></div>'+
  '<div class="vl-detail"><b>Repère géométrique (cote)</b><p class="vl-anchor">'+esc(z.anchor)+'</p>'+
   '<b style="margin-top:8px">Détail &amp; règle appliquée</b><p>'+esc(res.note)+'</p></div>'+
  (z.steps.length?'<div class="vl-steps"><b>Accès pas-à-pas</b><ol>'+
    z.steps.map(function(s2,i){return '<li><span>'+(i+1)+'</span>'+esc(s2)+'</li>'}).join('')+'</ol></div>':'')+
  '<div class="vl-grid2">'+
   '<div class="vl-box"><b>🧰 Outillage conseillé</b><p>'+esc(z.t||'Lampe rasante, miroir, brosse douce')+'</p></div>'+
   '<div class="vl-box warn"><b>⚠️ Précautions d’expertise</b><p>'+esc(z.w||'Croiser frappe, plaque et baie ; toute incohérence = suspicion de remarquage.')+'</p></div></div>'+
  (res.sec.length?'<div class="vl-sec"><b>Lectures complémentaires à croiser</b><div class="vl-chips">'+
    res.sec.map(function(s2){return '<span class="vl-chip">'+esc(s2.l)+'</span>'}).join('')+'</div></div>':'')+
  (ST.vin?'<div class="vl-vin"><b>VIN lu / saisi</b><span class="mono">'+esc(ST.vin)+'</span>'+
    '<em>17 caractères — contrôler la cohérence WMI avec '+esc(res.brand)+'.</em></div>':'')+
  '<div class="vl-act">'+
   '<button class="vl-pri" data-vl="png">🖼️ Exporter les schémas</button>'+
   '<button data-vl="copy">📋 Copier la fiche</button>'+
   '<button data-vl="report">📄 Ajouter au rapport</button>'+
   '<button data-vl="dismiss">✕ Fermer</button></div>'+
 '</div>'+
 '<aside class="vl-dock"><b>🎛️ Réglages des schémas</b>'+
  '<div class="vl-c"><label>Affichage</label><select data-vlc="view">'+
   '<option value="auto"'+(CFG.view==='auto'?' selected':'')+'>Véhicule + pièce (recommandé)</option>'+
   '<option value="part"'+(CFG.view==='part'?' selected':'')+'>Pièce seule (zoom)</option>'+
   ['top','front34','bay','sill','well'].map(function(v){
    return '<option value="'+v+'"'+(CFG.view===v?' selected':'')+'>Véhicule · '+viewLabel(v)+'</option>'}).join('')+
  '</select></div>'+
  '<div class="vl-c"><label>Rendu</label><select data-vlc="style">'+
   '<option value="real"'+(CFG.style==='real'?' selected':'')+'>Photo-réaliste (métal, ombres)</option>'+
   '<option value="line"'+(CFG.style==='line'?' selected':'')+'>Schéma technique filaire</option></select></div>'+
  vrg('zoom','Zoom',60,180,'%')+vrg('rot','Rotation',-24,24,'°')+
  vrg('marker','Taille du repère',40,180,'%')+vrg('glow','Halo',0,100,'%')+
  vrg('grid','Grille atelier',0,80,'')+vrg('density','Densité',85,125,'%')+
  '<div class="vl-tgs">'+vtg('dims','Cotes')+vtg('labels','Étiquettes')+vtg('anim','Repère pulsant')+vtg('sound','Son')+'</div>'+
  '<div class="vl-cols"><div><input type="color" data-vlc="c1" value="'+CFG.c1+'"><span>Atelier</span></div>'+
   '<div><input type="color" data-vlc="c2" value="'+CFG.c2+'"><span>Repère</span></div></div>'+
  '<div class="vl-btns"><button data-vl="reset">↺</button><button data-vl="rand">🎲</button>'+
   '<button class="p" data-vl="png">🖼️ PNG</button></div>'+
  '<p class="vl-note">Réglages appliqués <b>en direct</b>. Les cotes indiquent la distance depuis le point de référence de la pièce.</p>'+
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
  if(k&&e.target.tagName==='SELECT'){CFG[k]=e.target.value;saveCfg();repaint();snd('tick')}});
 w.addEventListener('click',function(e){
  var vb=e.target.closest('[data-vlview]');
  if(vb){CFG.view=vb.dataset.vlview;saveCfg();repaint();snd('tick');return}
  var b=e.target.closest('[data-vl]');if(!b)return;
  var k=b.dataset.vl;
  if(k==='toggle'||k==='dismiss'){
   var wrap=$('#vlWrap');var open=wrap&&wrap.classList.contains('open');
   if(open){ST.dismissed[ST.key]=true;if(wrap)wrap.classList.remove('open');
    setTimeout(function(){render(false)},280)}
   else{delete ST.dismissed[ST.key];render(true)}
   snd('tick');return}
  if(k==='png'){exportPng();return}
  if(k==='copy'){copyCard();return}
  if(k==='report'){addToReport();return}
  if(k==='reset'){CFG=Object.assign({},DEF);saveCfg();render(true);snd('tick');return}
  if(k==='rand'){var pal=[['#38bdf8','#ffb020'],['#22c55e','#ff4d6d'],['#a855f7','#22d3ee'],['#ffd166','#38bdf8'],['#00e5a0','#ff8f6d']];
   var p=pal[Math.floor(Math.random()*pal.length)];CFG.c1=p[0];CFG.c2=p[1];
   CFG.glow=25+Math.floor(Math.random()*70);CFG.grid=Math.floor(Math.random()*70);
   CFG.zoom=85+Math.floor(Math.random()*70);saveCfg();render(true);snd('mark');return}})}
function repaint(){
 if(!ST.res)return;
 var v=$('#vlSceneV'),p=$('#vlSceneP');
 if(CFG.view==='auto'){
  if(v)v.innerHTML=vehScene(ST.res);
  if(p)p.innerHTML=partScene(ST.res);
 }else if(CFG.view==='part'){
  if(v)v.innerHTML=partScene(ST.res);
 }else{
  var z=Object.assign({},ST.res.zone,{v:CFG.view});
  if(v)v.innerHTML=vehScene(Object.assign({},ST.res,{zone:z}));
 }
 $$('.vl-scene').forEach(function(s){
  s.style.setProperty('--vlzoom',(CFG.zoom/100));s.style.setProperty('--vlrot',CFG.rot+'deg')});
 $$('[data-vlview]').forEach(function(b){
  b.classList.toggle('on',b.dataset.vlview===CFG.view)});
 syncDock()}
function syncDock(){
 $$('[data-vlc]').forEach(function(e){var k=e.dataset.vlc;e.value=CFG[k];
  var o=$('#vlo_'+k);if(o)o.textContent=CFG[k]+(k==='rot'?'°':'%')});
 ['dims','labels','anim','sound'].forEach(function(k){var g=$('#vlt_'+k);
  if(g){var i=g.querySelector('input');if(i)i.checked=!!CFG[k];g.classList.toggle('on',!!CFG[k])}})}
function exportPng(){
 var svgs=$$('#vinlocHost .vl-scene svg');
 if(!svgs.length){toast('Ouvrez la case d’abord');return}
 var n=svgs.length,W=1560,H=n>1?1020*1:1020;
 var c=document.createElement('canvas');c.width=W;c.height=(n>1?510*n+40:1020);
 var x=c.getContext('2d');x.fillStyle='#08131f';x.fillRect(0,0,c.width,c.height);
 var done=0;
 svgs.forEach(function(sv,i){
  var xml=new XMLSerializer().serializeToString(sv);
  var img=new Image();
  img.onload=function(){var hh=(n>1?510:1020);
   x.drawImage(img,0,i*(n>1?510:0),W,hh);
   if(++done===svgs.length)finish()};
  img.onerror=function(){if(++done===svgs.length)finish()};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml)});
 function finish(){c.toBlob(function(b){
  var a=document.createElement('a');a.href=URL.createObjectURL(b);
  a.download='VIN-localisation-'+(ST.res?ST.res.model:'vehicule')+'.png';a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href)},6000);toast('🖼️ Schéma(s) exporté(s)');snd('out')},'image/png')}}
function copyCard(){
 if(!ST.res)return;var z=ST.res.zone;
 var txt='LOCALISATION VIN — FRAPPE À FROID\n'+ST.res.brand+' '+ST.res.model+
  (ST.res.fuel?' ('+ST.res.fuel+')':'')+(ST.res.power?' '+ST.res.power+' ch':'')+'\n\n'+
  'ZONE : '+z.l+'\nMÉTHODE : '+z.m+'\nCÔTÉ : '+z.side+'\nREPÈRE : '+z.anchor+'\n'+
  'RÈGLE : '+ST.res.note+'\nACCÈS :\n'+z.steps.map(function(s,i){return ' '+(i+1)+'. '+s}).join('\n')+
  '\nOUTILLAGE : '+(z.t||'—')+'\nPRÉCAUTIONS : '+(z.w||'—')+
  '\nLECTURES COMPLÉMENTAIRES : '+ST.res.sec.map(function(s){return s.l}).join(' ; ')+
  (ST.vin?'\nVIN : '+ST.vin:'');
 try{navigator.clipboard.writeText(txt).then(function(){toast('📋 Fiche copiée');snd('tick')})}catch(e){toast(txt)}}
function addToReport(){
 if(!ST.res)return;var z=ST.res.zone;
 try{if(typeof S!=='undefined'){S.vinloc=S.vinloc||[];
  S.vinloc.push({ts:Date.now(),brand:ST.res.brand,model:ST.res.model,zone:z.l,method:z.m,
   anchor:z.anchor,steps:z.steps,vin:ST.vin,rule:ST.res.src})}
  toast('📄 Ajouté au rapport d’étude');snd('ok')}catch(e){toast('Ajout impossible')}}

/* ══════════ détection auto ══════════ */
var lastSig='';
function sig(){var v=currentVehicle();if(!v)return '';
 return [v.brand,v.model,v.engine,v.fuel||'',v.ch||v.power||'',v.year||''].join('|')}
function tick(){
 var s=sig();
 if(!s){var h=$('#vinlocHost');if(h&&h.innerHTML)h.innerHTML='';lastSig='';return}
 if(s!==lastSig){lastSig=s;delete ST.dismissed[s];render(true)}
 else if(!$('#vinlocHost')||!$('#vinlocHost').innerHTML)render(!ST.dismissed[s])}
function watch(){
 var mo=null;
 function attach(){var vr=$('#vehRead');if(!vr||mo)return;
  try{mo=new MutationObserver(function(){setTimeout(tick,60)});
   mo.observe(vr,{childList:true,subtree:true,characterData:true})}catch(e){}}
 attach();
 setInterval(function(){if(!$('#vehRead'))mo=null;attach();tick()},700);
 try{document.addEventListener('kf:vehicle',function(){setTimeout(tick,80)})}catch(e){}}

/* ══════════ CSS ══════════ */
function css(){
 if($('#vlCss'))return;var s=document.createElement('style');s.id='vlCss';
 s.textContent=
 '#vinlocHost{margin:12px 0}'+
 '.vl-wrap{border:1px solid #2b6b8f;border-radius:16px;overflow:hidden;background:linear-gradient(160deg,#08131f,#0c1c2c 60%,#101426);box-shadow:0 14px 40px #000a;max-height:58px;transition:max-height .5s cubic-bezier(.2,.8,.2,1)}'+
 '.vl-wrap.open{max-height:3000px}'+
 '.vl-head{display:flex;align-items:center;gap:11px;padding:13px 15px;background:linear-gradient(90deg,#38bdf814,transparent);cursor:pointer}'+
 '.vl-ic{font-size:20px}'+
 '.vl-t{flex:1;min-width:0}'+
 '.vl-t b{display:block;font-size:14px;color:#eaf4ff}'+
 '.vl-t span{display:block;font-size:11px;color:#8fb0cc;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.vl-badge{font:800 9.5px/1 system-ui;letter-spacing:.8px;padding:5px 9px;border-radius:14px;border:1px solid #2b6b8f;color:#8fb0cc}'+
 '.vl-badge.ok{border-color:#22c55e;color:#22c55e;background:#22c55e12}'+
 '.vl-badge.warn{border-color:#ffb020;color:#ffb020;background:#ffb02012}'+
 '.vl-x{background:#0b1420;border:1px solid #2b6b8f;color:#cfe0f2;border-radius:9px;padding:5px 10px;font-size:13px}'+
 '.vl-body{display:grid;grid-template-columns:minmax(0,1fr) 272px;gap:16px;padding:16px}'+
 '@media(max-width:960px){.vl-body{grid-template-columns:1fr}}'+
 '.vl-main{min-width:0}'+
 '.vl-scenes{display:grid;gap:12px}'+
 '.vl-scenes.two{grid-template-columns:1fr 1fr}'+
 '@media(max-width:720px){.vl-scenes.two{grid-template-columns:1fr}}'+
 '.vl-fig{margin:0}'+
 '.vl-fig figcaption{font:800 10px/1 system-ui;letter-spacing:1px;text-transform:uppercase;color:#6f8faa;margin-bottom:6px}'+
 '.vl-scene{border:1px solid #2b6b8f;border-radius:14px;overflow:hidden;background:#08131f;transform:scale(var(--vlzoom,1)) rotate(var(--vlrot,0deg));transform-origin:50% 45%;transition:transform .25s}'+
 '.vl-scene svg{display:block;width:100%;height:auto}'+
 '.vl-pulse{animation:vlP 1.6s ease-in-out infinite}'+
 '@keyframes vlP{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.32);opacity:.5}}'+
 '.vl-views{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}'+
 '.vl-vbtn{padding:7px 12px;font-size:11.5px;font-weight:700;border-radius:16px;border:1px solid #2b6b8f;background:#0b1420;color:#cfe0f2;cursor:pointer}'+
 '.vl-vbtn:hover{border-color:#38bdf8;color:#38bdf8}'+
 '.vl-vbtn.on{background:linear-gradient(135deg,#38bdf8,#2563eb);border-color:#38bdf8;color:#04121e}'+
 '.vl-prec{display:flex;gap:11px;align-items:center;border:1px solid #ffb02055;border-left:3px solid #ffb020;background:#ffb0200d;border-radius:0 12px 12px 0;padding:11px 13px;margin-bottom:12px}'+
 '.vl-prec-ic{font-size:20px}'+
 '.vl-prec b{display:block;font-size:13.5px;color:#ffd166}'+
 '.vl-method{display:block;font-size:11px;color:#c9a86a;margin-top:3px}'+
 '.vl-detail{border-left:3px solid #38bdf8;background:#38bdf80d;border-radius:0 12px 12px 0;padding:12px 14px;margin-bottom:12px}'+
 '.vl-detail b{display:block;font-size:11px;color:#9fd8f5;margin-bottom:5px;letter-spacing:.6px;text-transform:uppercase}'+
 '.vl-detail p{margin:0 0 8px;font-size:13px;line-height:1.65;color:#dce8f4}'+
 '.vl-anchor{font-family:ui-monospace,monospace;color:#ffd166!important;background:#0b1420;border:1px dashed #ffb02066;border-radius:9px;padding:8px 10px}'+
 '.vl-steps{border:1px solid #22405a;border-radius:12px;background:#0b1420;padding:12px 14px;margin-bottom:12px}'+
 '.vl-steps b{display:block;font-size:11px;color:#9fd8f5;margin-bottom:8px;letter-spacing:.6px;text-transform:uppercase}'+
 '.vl-steps ol{margin:0;padding:0;list-style:none;counter-reset:st}'+
 '.vl-steps li{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;color:#cfe0f2;line-height:1.6;margin-bottom:6px}'+
 '.vl-steps li span{flex:none;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#2563eb);color:#04121e;font:800 11px/20px system-ui;text-align:center}'+
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
 '.vl-vin{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;border:1px dashed #22c55e66;border-radius:12px;background:#22c55e0a;padding:10px 13px;margin-bottom:12px}'+
 '.vl-vin b{font-size:10.5px;color:#7fd8a4;letter-spacing:.8px;text-transform:uppercase}'+
 '.vl-vin .mono{font-family:ui-monospace,monospace;letter-spacing:2px;color:#a3e635;font-size:14px;font-weight:700}'+
 '.vl-vin em{font-style:normal;font-size:10.5px;color:#6f8faa}'+
 '.vl-act{display:flex;gap:8px;flex-wrap:wrap}'+
 '.vl-act button{padding:10px 14px;font-size:12px;font-weight:800;border-radius:10px;border:1px solid #2b6b8f;background:#0b1420;color:#eaf4ff;cursor:pointer}'+
 '.vl-act button:hover{border-color:#38bdf8;color:#38bdf8}'+
 '.vl-act .vl-pri{background:linear-gradient(135deg,#38bdf8,#2563eb);border-color:#38bdf8;color:#04121e}'+
 '.vl-dock{border:1px solid #2b6b8f;border-radius:14px;background:linear-gradient(165deg,#08131f,#0c1c2c);padding:13px;align-self:start;position:sticky;top:74px;max-height:calc(100vh - 100px);overflow:auto}'+
 '@media(max-width:960px){.vl-dock{position:static;max-height:none}}'+
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
window.KFVinLoc={render:render,resolve:resolve,veh:vehScene,part:partScene,exportPng:exportPng,state:ST,cfg:CFG};
})();
