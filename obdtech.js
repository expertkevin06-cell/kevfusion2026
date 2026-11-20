/* KEV FUSION 2026 — obdtech.js v1.0.0
   MODE TECHNICIEN DIAGNOSTICIEN D'ATELIER.
   · Diagnostic approfondi SANS clé : readiness, Mode 06 moniteurs, Mode 09 CVN/CALID,
     balayage DID étendus, consigne/réel, règles d'anomalies, enregistreur d'essai routier,
     corrélation automatique avec la méga-base.
   · Fonctions protégées : accès OFFICIEL uniquement (AutoAuth/SGW, jeton SFD, compte atelier,
     clé constructeur saisie). Gestion des temporisations NRC 0x36/0x37 et journalisation.
     AUCUN contournement, AUCUN calcul de clé, AUCUNE neutralisation de protection.
   · Registre technicien + traçabilité horodatée + rapport PDF partageable. */
(function(){
'use strict';
var DB=window.KFObdTechDB;if(!DB){console.warn('obdtech: obdtech_db.js requis');return}
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function hex(b){return Array.prototype.map.call(b||[],function(x){return ('0'+(x&255).toString(16)).slice(-2)}).join('').toUpperCase()}
function unhex(s){s=String(s||'').replace(/[^0-9A-Fa-f]/g,'');var o=[];for(var i=0;i+1<s.length;i+=2)o.push(parseInt(s.substr(i,2),16));return o}
function h3(n){return ('00'+(n>>>0).toString(16)).slice(-3).toUpperCase()}
function toast(m){if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3400)}
function P(){return window.KFObdPro}
function OB(){var p=P();return p?p.state:null}
function U(){var p=P();return p?p.uds:null}
function E(){var p=P();return p?p.elm:null}
function T(){var p=P();return p?p.transport:null}

/* ══════════ AUDIO ══════════ */
var AU={c:null,on:LS.g('techSound',true),vol:LS.g('techVol',.45)};
function ctx(){if(!AU.c){try{AU.c=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
 if(AU.c&&AU.c.state==='suspended')AU.c.resume().catch(function(){});return AU.c}
function snd(k){if(!AU.on)return;var c=ctx();if(!c)return;
 var m={ok:[620,940,.13,'triangle'],warn:[420,300,.18,'sawtooth'],bad:[240,130,.28,'sawtooth'],
  tick:[1250,1250,.03,'sine'],lock:[300,220,.2,'square'],rec:[700,700,.06,'sine'],done:[523,880,.26,'triangle']}[k]||[900,900,.05,'sine'];
 try{var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(60,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.2*AU.vol,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.02)}catch(e){}}

/* ══════════ CONFIG / ÉTAT ══════════ */
var DEF={sweep:'std',timeout:2600,live:900,tolBoost:15,tolEgr:12,minOcc:1,density:100,
 glow:56,grid:32,scan:true,c1:'#22c55e',c2:'#38bdf8',c3:'#ff4d6d',c4:'#c084fc',
 sound:true,vol:45,autoCorr:true,autoLog:true,showRaw:false};
var CFG=Object.assign({},DEF,LS.g('techCfg',{}));
AU.on=CFG.sound;AU.vol=CFG.vol/100;
var REG=LS.g('techReg',{technicien:'',atelier:'',agrement:'',baseLegale:'Véhicule confié — accord propriétaire'});
var AUTH=LS.g('techAuth',{autoauth:{user:'',api:'',endpoint:''},sfd:'',key:'',session:{}});
var ST={tab:'access',busy:false,ready:null,m06:[],mode09:{},did:[],live:[],liveT:null,
 rec:null,recT:null,anomalies:[],corr:[],trace:LS.g('techTrace',[]),authLog:LS.g('techAuthLog',[]),
 gw:null,lastAdv:null};
function save(){LS.s('techCfg',CFG)}
function saveReg(){LS.s('techReg',REG)}
function saveAuth(){LS.s('techAuth',AUTH)}
function tr(kind,msg,lvl){
 var e={t:new Date().toISOString(),kind:kind,msg:String(msg),lvl:lvl||'info',
  vin:(OB()||{}).vin||'',km:(OB()||{}).km,tech:REG.technicien,atelier:REG.atelier};
 ST.trace.unshift(e);if(ST.trace.length>1200)ST.trace.pop();LS.s('techTrace',ST.trace.slice(0,600));
 var el=$('#tcTrace');if(el)el.innerHTML=traceHtml();
 var lg=$('#tcLog');if(lg)lg.innerHTML=ST.trace.slice(0,180).map(function(x){
  return '<div class="tl-'+x.lvl+'"><i>'+esc(x.t.slice(11,19))+'</i><b>'+esc(x.kind)+'</b> '+esc(x.msg)+'</div>'}).join('')}
function authLog(m,lvl){ST.authLog.unshift({t:new Date().toISOString(),m:String(m),lvl:lvl||'info'});
 if(ST.authLog.length>400)ST.authLog.pop();LS.s('techAuthLog',ST.authLog.slice(0,200));
 var e=$('#tcAuthLog');if(e)e.innerHTML=ST.authLog.slice(0,60).map(function(x){
  return '<div class="tl-'+x.lvl+'"><i>'+esc(x.t.slice(11,19))+'</i>'+esc(x.m)+'</div>'}).join('')}
function busy(b,t){ST.busy=b;var e=$('#tcBusy');
 if(e){e.style.display=b?'flex':'none';e.innerHTML=b?'<span class="tc-spin"></span>'+esc(t||''):''}
 $$('[data-tc]').forEach(function(x){if(b)x.setAttribute('disabled','');else x.removeAttribute('disabled')})}
function needConn(){var o=OB();if(!o||!o.conn){toast('🔌 Connectez l\'OBD (onglet OBD Atelier)');return false}return true}
function regOk(){return !!(REG.technicien&&REG.atelier)}

/* ══════════ ACCÈS OFFICIELS ══════════ */
function gwFor(){
 var v='';try{v=(typeof S!=='undefined'&&S.vehicle&&S.vehicle.brand)||''}catch(e){}
 v=v.toLowerCase();
 if(/peugeot|citro|ds\b|opel|vauxhall|fiat|alfa|lancia|jeep|abarth|chrysler|dodge|ram/.test(v))return DB.GATEWAYS[0];
 if(/volkswagen|vw|audi|skoda|seat|cupra/.test(v))return DB.GATEWAYS[1];
 if(/mercedes|smart/.test(v))return DB.GATEWAYS[2];
 if(/bmw|mini/.test(v))return DB.GATEWAYS[3];
 if(/renault|dacia|alpine/.test(v))return DB.GATEWAYS[4];
 return DB.GATEWAYS[5]}
async function autoAuthUnlock(){
 if(!needConn())return;
 if(!regOk()){toast('🧑‍🔧 Renseignez le registre technicien');ST.tab='access';render();return}
 var a=AUTH.autoauth,o=OB();
 if(!a.user||!a.api){toast('Compte AutoAuth + clé API requis');return}
 if(!o.vin){toast('VIN non lu — lancez la lecture OBD');return}
 var ep=(a.endpoint||'').trim();
 if(!ep){toast('Endpoint AutoAuth à renseigner (documentation de votre abonnement)');return}
 if(!confirm('🔐 DÉVERROUILLAGE OFFICIEL SGW via AutoAuth\n\nVIN : '+o.vin+
  '\nTechnicien : '+REG.technicien+' ('+REG.atelier+')\n\n'+
  'Votre compte AutoAuth doit être actif et autorisé pour ce VIN.\n'+
  'Le déverrouillage est journalisé. Aucune protection n\'est contournée.\n\nContinuer ?'))return;
 busy(true,'Demande de déverrouillage AutoAuth…');
 authLog('Demande AutoAuth pour VIN '+o.vin+' par '+REG.technicien);
 try{
  var url=ep.replace('{vin}',encodeURIComponent(o.vin));
  var r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
   body:JSON.stringify({username:a.user,apiKey:a.api,vin:o.vin,technician:REG.technicien,workshop:REG.atelier})});
  var txt=await r.text();var j=null;try{j=JSON.parse(txt)}catch(e){}
  if(!r.ok)throw new Error('AutoAuth HTTP '+r.status+' — '+txt.slice(0,180));
  var token=(j&&(j.token||j.unlockToken||j.session||j.access_token))||'';
  if(!token)throw new Error('Réponse AutoAuth sans jeton — vérifiez l\'endpoint et l\'abonnement');
  AUTH.session[o.vin]={token:token,ts:Date.now(),by:REG.technicien,src:'AutoAuth'};saveAuth();
  authLog('✅ Jeton AutoAuth obtenu (validité limitée)','ok');
  tr('ACCÈS','Déverrouillage SGW officiel obtenu via AutoAuth pour '+o.vin,'ok');
  toast('🔓 Accès officiel accordé — fonctions protégées disponibles');snd('ok');
 }catch(e){authLog('❌ '+e.message,'err');tr('ACCÈS','Échec AutoAuth : '+e.message,'err');
  toast('❌ '+e.message);snd('bad')}
 busy(false);render()}
function sfdApply(){
 if(!needConn())return;
 if(!regOk()){toast('🧑‍🔧 Registre technicien requis');return}
 var t=(AUTH.sfd||'').trim();
 if(!t){toast('Jeton SFD requis (délivré par le portail constructeur)');return}
 var o=OB();
 var ecu=selEcu('#tcAuthEcu');if(!ecu){toast('Sélectionnez le calculateur');return}
 var did=($('#tcSfdDid')||{}).value||'';
 if(!did){toast('DID de dépôt du jeton SFD requis (documentation constructeur du calculateur)');return}
 if(!confirm('🔐 DÉPÔT D\'UN JETON SFD OFFICIEL\n\nCalculateur : '+ecu.name+'\nVIN : '+(o.vin||'—')+
  '\n\nLe jeton doit avoir été délivré par le portail constructeur pour CE VIN et CE calculateur.\n'+
  'Il est appliqué tel quel, sans modification. Journalisé.\n\nContinuer ?'))return;
 busy(true,'Application du jeton SFD…');
 (async function(){
  try{
   var u=U();await u.head(ecu.tx,ecu.rx);await u.open();
   var bytes=unhex(did).concat(unhex(t));
   var r=await u.req([0x2E].concat(bytes),12000);
   if(r.err){authLog('❌ SFD : '+r.err,'err');tr('ACCÈS','SFD refusé : '+r.err,'warn');toast('❌ '+r.err);snd('bad')}
   else{AUTH.session['sfd-'+h3(ecu.tx)]={token:t.slice(0,24)+'…',ts:Date.now(),by:REG.technicien,src:'SFD'};saveAuth();
    authLog('✅ Jeton SFD accepté par '+ecu.name,'ok');tr('ACCÈS','Jeton SFD officiel appliqué sur '+ecu.name,'ok');
    toast('🔓 SFD appliqué');snd('ok')}
  }catch(e){authLog('❌ '+e.message,'err');toast('❌ '+e.message)}
  busy(false);render()})()}
async function keyAccess(){
 if(!needConn())return;
 if(!regOk()){toast('🧑‍🔧 Registre technicien requis');return}
 var ecu=selEcu('#tcAuthEcu');if(!ecu){toast('Sélectionnez le calculateur');return}
 var lvl=parseInt(($('#tcSecLvl')||{}).value||'3',10);
 if(isNaN(lvl)||lvl%2===0){toast('Niveau impair requis (1, 3, 5, 11, 17…)');return}
 busy(true,'Demande de seed…');
 try{
  var u=U();await u.head(ecu.tx,ecu.rx);await u.open();
  var s=await u.req([0x27,lvl],4000);
  if(s.nrc&&DB.SECNRC[s.nrc]){
   authLog('⚠️ '+DB.SECNRC[s.nrc].l+' — '+DB.SECNRC[s.nrc].a,'warn');
   toast('⚠️ '+DB.SECNRC[s.nrc].l);snd('lock');busy(false);render();return}
  if(s.err){authLog('❌ '+s.err,'err');toast('❌ '+s.err);busy(false);render();return}
  var seed=hex(s.data.slice(1));
  AUTH.lastSeed=seed;saveAuth();
  authLog('Seed reçu de '+ecu.name+' : '+seed+' (niveau '+lvl+')');
  busy(false);render();
  var key=prompt('SEED reçu du calculateur '+ecu.name+' :\n'+seed+
   '\n\nSaisissez la CLÉ correspondante (hexadécimal) telle que fournie par votre documentation technique constructeur.\n\n'+
   'L\'application ne calcule, ne devine et ne contourne aucune clé.','');
  if(!key){authLog('Clé non fournie — accès non tenté','warn');render();return}
  busy(true,'Envoi de la clé…');
  var r=await u.req([0x27,lvl+1].concat(unhex(key)),6000);
  if(r.nrc&&DB.SECNRC[r.nrc]){
   authLog('❌ '+DB.SECNRC[r.nrc].l+' — '+DB.SECNRC[r.nrc].a,'err');
   tr('ACCÈS','Accès sécurité refusé sur '+ecu.name+' : '+DB.SECNRC[r.nrc].l,'warn');
   toast('❌ '+DB.SECNRC[r.nrc].l+' — '+DB.SECNRC[r.nrc].a);snd('bad');
   if(r.nrc===0x36||r.nrc===0x37){AUTH.delayUntil=Date.now()+120000;saveAuth();
    authLog('Temporisation de sécurité appliquée : 120 s avant nouvelle tentative','warn')}
  }else if(r.err){authLog('❌ '+r.err,'err');toast('❌ '+r.err);snd('bad')}
  else{AUTH.session['key-'+h3(ecu.tx)]={ts:Date.now(),by:REG.technicien,src:'Clé constructeur',level:lvl};saveAuth();
   authLog('✅ Accès sécurité accordé sur '+ecu.name+' (niveau '+lvl+')','ok');
   tr('ACCÈS','Accès sécurité officiel obtenu sur '+ecu.name,'ok');toast('🔓 Accès accordé');snd('ok')}
 }catch(e){authLog('❌ '+e.message,'err');toast('❌ '+e.message);snd('bad')}
 busy(false);render()}
function selEcu(sel){
 var el=$(sel);if(!el)return null;var tx=parseInt(el.value,10);
 return (OB().ecus||[]).find(function(e){return e.tx===tx})||null}
function hasAccess(ecu){
 var o=OB();if(!o)return false;
 if(AUTH.session[o.vin]&&Date.now()-AUTH.session[o.vin].ts<3600000)return 'SGW';
 if(AUTH.session['sfd-'+h3(ecu.tx)]&&Date.now()-AUTH.session['sfd-'+h3(ecu.tx)].ts<1800000)return 'SFD';
 if(AUTH.session['key-'+h3(ecu.tx)]&&Date.now()-AUTH.session['key-'+h3(ecu.tx)].ts<600000)return 'CLÉ';
 return null}

/* ══════════ DIAGNOSTIC AVANCÉ (sans clé) ══════════ */
async function readiness(){
 var e=E(),f=await e.obd('01','01');
 if(!f.length)return null;
 var d=f[0].length>4?f[0].slice(4):f[0].slice(1);
 if(d.length<4)return null;
 var mil=!!(d[0]&0x80),cnt=d[0]&0x7F;
 var sup=d[1],rdy=d[2],sup2=d[3],rdy2=d.length>3?d[3]:0;
 var fuel=await pidVal('51');
 var isD=typeof fuel==='string'&&/diesel/i.test(fuel);
 var list=(isD?DB.READY.diesel:DB.READY.petrol).map(function(x){
  var s=!!(sup&(1<<x.b)),r=!!(rdy&(1<<x.b));
  return{n:x.n,supported:s,ready:r}});
 return{mil:mil,count:cnt,list:list,diesel:isD}}
async function pidVal(p){
 try{var f=await E().obd('01',p);
  if(!f.length)return null;var d=f[0].length>4?f[0].slice(4):f[0].slice(1);
  var fn=((window.KFObdDB||{}).PID||{})[p];return fn&&fn.f?fn.f(d):null}catch(e){return null}}
async function mode06(){
 var e=E(),out=[];
 var sup=await e.obd('06','00');
 var mids=[];
 if(sup.length){var d=sup[0].length>4?sup[0].slice(4):sup[0].slice(1);
  for(var i=0;i<d.length;i++)for(var b=0;b<8;b++)if(d[i]&(1<<b))mids.push(i*8+b+1)}
 if(!mids.length)mids=[1,2,3,4,5,6,7,8,9,10];
 for(const mid of mids.slice(0,14)){
  var mh=('0'+mid.toString(16)).slice(-2).toUpperCase();
  var meta=DB.M06.find(function(x){return x.mid===mh})||{n:'Moniteur '+mh,tid:{}};
  var t=await e.obd('06',mh);
  var rows=[];
  if(t.length){t.forEach(function(fr){
   var d=fr.length>4?fr.slice(4):fr.slice(1);
   for(var i=0;i+2<d.length;i+=3){
    var tid=('0'+d[i].toString(16)).slice(-2).toUpperCase();
    var val=d[i+1]*256+d[i+2];
    rows.push({tid:tid,n:meta.tid[tid]||('TID '+tid),val:val})}})}
  out.push({mid:mh,name:meta.n,rows:rows})}
 return out}
async function mode09(){
 var e=E(),o={};
 var specs=[['02','VIN'],['04','CALID'],['06','CVN'],['0A','Nom ECU'],['08','IPT']];
 for(const s of specs){
  try{var f=await e.obd('09',s[0]);
   if(f.length){var all=[];f.forEach(function(x){all=all.concat(x)});
    var txt=all.map(function(b){return b>=32&&b<127?String.fromCharCode(b):''}).join('').replace(/\s+/g,' ').trim();
    o[s[1]]=txt||hex(all)}}catch(e){}}
 return o}
async function didSweep(){
 var o=OB(),u=U(),out=[];
 var ecus=o.ecus||[];if(!ecus.length){toast('Lancez le scan OBD');return out}
 var ranges=CFG.sweep==='deep'?DB.DID_SWEEP:CFG.sweep==='light'?DB.DID_SWEEP.slice(0,2):DB.DID_SWEEP.slice(0,4);
 for(var i=0;i<ecus.length;i++){
  var e=ecus[i];busy(true,'Balayage DID '+e.name+' ('+(i+1)+'/'+ecus.length+')');
  await u.head(e.tx,e.rx);await u.open();
  var found=[];
  for(const r of ranges){
   var a=parseInt(r[0],16),b=parseInt(r[1],16);
   for(var id=a;id<=b;id++){
    if(ST.busy===false)return out;
    var hh=('000'+id.toString(16)).slice(-4).toUpperCase();
    var bytes=await u.did(hh);
    if(!bytes||!bytes.length)continue;
    var hint=DB.DID_HINT[hh]||((window.KFObdDB||{}).VAR||{})[hh];
    var name=(hint&&hint.n)||hint||('DID '+hh);
    var val;
    if(hint&&hint.d){try{val=hint.d(bytes)}catch(err){val=hex(bytes)}}
    else{var t=bytes.map(function(x){return x>=32&&x<127?String.fromCharCode(x):''}).join('').trim();
     val=t.length>3?t:hex(bytes)}
    found.push({did:hh,name:typeof name==='string'?name:'DID '+hh,val:val,raw:hex(bytes)});
    if(found.length>90)break}
   if(found.length>90)break}
  out.push({ecu:e.name,tx:e.tx,items:found});
  tr('DID',e.name+' : '+found.length+' DID lisibles sans clé','ok');snd('tick')}
 return out}
async function advanced(){
 if(!needConn())return;
 busy(true,'Diagnostic approfondi…');
 try{
  ST.ready=await readiness();
  tr('READINESS',ST.ready?('MIL '+(ST.ready.mil?'ALLUMÉ':'éteint')+' · '+ST.ready.count+' DTC'):'non disponible',
   ST.ready&&ST.ready.mil?'warn':'ok');
  busy(true,'Moniteurs Mode 06…');ST.m06=await mode06();
  tr('MODE 06',ST.m06.length+' moniteurs lus','ok');
  busy(true,'Identification Mode 09…');ST.mode09=await mode09();
  tr('MODE 09',Object.keys(ST.mode09).length+' informations','ok');
  ST.did=await didSweep();
  busy(true,'Analyse consigne / réel…');await analyse();
  ST.lastAdv=new Date().toISOString();
  if(CFG.autoCorr)correlate();
  snd('done');toast('🧑‍🔧 Diagnostic approfondi terminé');
  tr('DIAG','Diagnostic approfondi terminé sans clé d\'accès','ok');
 }catch(e){tr('DIAG','Erreur : '+e.message,'err');toast('❌ '+e.message);snd('bad')}
 busy(false);render()}
async function analyse(){
 var u=U(),o=OB(),res=[];
 var rpm=await pidVal('0C'),running=rpm!=null&&rpm>400;
 for(const r of DB.RULES){
  try{
   if(r.want&&r.real){
    var ecu=(o.ecus||[])[0];if(!ecu)continue;
    await u.head(ecu.tx,ecu.rx);
    var w=await u.did(r.want),v=await u.did(r.real);
    if(!w||!v||w.length<1||v.length<1)continue;
    var W=w.length>1?w[0]*256+w[1]:w[0],V=v.length>1?v[0]*256+v[1]:v[0];
    var tol=r.id==='boost'?CFG.tolBoost:r.id==='egr'?CFG.tolEgr:r.tol;
    var gap=Math.abs(W-V);
    res.push({id:r.id,n:r.n,want:W,real:V,gap:gap,tol:tol,unit:r.unit,ok:gap<=tol,
     fault:r.fault,dtc:r.dtc,advice:r.advice})}
   else if(r.pid){
    var val=await pidVal(r.pid);if(val==null)continue;
    var ok=true,note='';
    if(r.lim!=null){ok=Math.abs(val)<=r.lim;note='|'+val.toFixed(1)+'| ≤ '+r.lim}
    if(r.min!=null&&running){ok=ok&&val>=r.min;note+=' ≥ '+r.min}
    if(r.max!=null){if(r.running&&!running){continue}ok=ok&&val<=r.max;note+=' ≤ '+r.max}
    res.push({id:r.id,n:r.n,want:null,real:Math.round(val*10)/10,gap:null,tol:r.lim||r.max,unit:r.unit,ok:ok,
     fault:r.fault,dtc:r.dtc,advice:r.advice,note:note})}
  }catch(e){}}
 ST.anomalies=res;
 var bad=res.filter(function(x){return !x.ok});
 tr('ANALYSE',res.length+' règles évaluées · '+bad.length+' anomalie(s)',bad.length?'warn':'ok');
 if(bad.length)snd('warn');
 return res}
function correlate(){
 var o=OB();if(!o)return;
 var codes=[];
 (o.ecus||[]).forEach(function(e){(e.dtc||[]).forEach(function(d){codes.push(d.code)})});
 ST.anomalies.filter(function(a){return !a.ok}).forEach(function(a){(a.dtc||[]).forEach(function(c){codes.push(c)})});
 codes=Array.from(new Set(codes));
 try{
  if(window.KFCorr&&typeof S!=='undefined'&&S.vehicle&&S.vehicle.brand){
   var c=window.KFCorr.correlate(S.vehicle,{strict:true,readDtc:codes});
   ST.corr=(c.faults||[]).slice(0,14).map(function(f){
    return{t:f.t,g:f.g,s:f.s,dtc:f.dtc,mec:f.mec,tst:f.tst,act:f.act,sec:f.sec,fire:f.fire}});
   tr('CORRÉLATION',ST.corr.length+' fiche(s) méga-base pour '+codes.length+' code(s)','ok');
   if(window.KFObdPro&&window.KFObdPro.inject)window.KFObdPro.inject();
  }
 }catch(e){tr('CORRÉLATION','Erreur : '+e.message,'warn')}}

/* ══════════ ENREGISTREUR D'ESSAI ══════════ */
function recStart(){
 if(!needConn())return;
 if(!regOk()){toast('🧑‍🔧 Registre technicien requis pour un essai tracé');return}
 ST.rec={t0:Date.now(),rows:[],tech:REG.technicien,vin:(OB()||{}).vin,km:(OB()||{}).km};
 tr('ESSAI','Début d\'enregistrement routier','ok');snd('rec');
 var pids=['0C','0D','05','42','0B','11','10','06','07','5C','0F'];
 ST.recT=setInterval(async function(){
  if(!ST.rec||ST.busy)return;
  var row={t:Date.now()-ST.rec.t0};
  for(const p of pids){var v=await pidVal(p);row[p]=v==null?null:Math.round(v*10)/10}
  ST.rec.rows.push(row);
  if(ST.rec.rows.length>4000){recStop();return}
  paintRec()},CFG.live);
 render()}
function recStop(){
 if(ST.recT){clearInterval(ST.recT);ST.recT=null}
 if(ST.rec){ST.rec.t1=Date.now();
  tr('ESSAI','Fin d\'enregistrement : '+ST.rec.rows.length+' échantillons sur '+Math.round((ST.rec.t1-ST.rec.t0)/1000)+' s','ok');
  snd('done');toast('⏹️ Essai enregistré · '+ST.rec.rows.length+' points')}
 render()}
function recCsv(){
 if(!ST.rec||!ST.rec.rows.length){toast('Aucun enregistrement');return}
 var pids=Object.keys(ST.rec.rows[0]);
 var head=['t_ms'].concat(pids.filter(function(p){return p!=='t'}).map(function(p){
  var m=((window.KFObdDB||{}).PID||{})[p];return (m?m.n:p)+(m&&m.u?' ('+m.u+')':'')}));
 var lines=[head.join(';')];
 ST.rec.rows.forEach(function(r){lines.push(pids.map(function(p){return r[p]==null?'':String(r[p]).replace('.',',')}).join(';'))});
 var blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'});
 var a=document.createElement('a');a.href=URL.createObjectURL(blob);
 a.download='KEV-FUSION-essai-'+(ST.rec.vin||'vehicule')+'-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.csv';
 a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},6000);toast('📈 CSV exporté')}

/* ══════════ PDF TECHNICIEN ══════════ */
function pdf(){
 var W=595.28,H=841.89,M=42,LH=13.2;
 var pages=[],cur=[],y=H-M;
 function lat(s){return String(s).normalize('NFC').replace(/[^\x20-\xFF]/g,function(c){
  return {'€':'EUR','—':'-','–':'-','’':"'",'“':'"','”':'"','…':'...','✅':'[OK]','❌':'[X]','⚠':'[!]','🔐':'[SEC]','🔓':'[OPEN]','🧑':'','🔧':'','📋':'','📈':'','📄':''}[c]||''})}
 function q(s){return String(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
 function band(){cur.push('0.016 0.078 0.047 rg '+M+' '+(H-M-4)+' '+(W-2*M)+' 26 re f');
  cur.push('BT /F2 11.5 Tf 1 1 1 rg 1 0 0 1 '+(M+10)+' '+(H-M+5)+' Tm ('+q(lat('KEV FUSION 2026 — RAPPORT TECHNICIEN DIAGNOSTICIEN'))+') Tj ET');y=H-M-24}
 function nl(h){y-=(h||LH);if(y<M+42){pages.push(cur);cur=[];y=H-M;band()}}
 function t(s,o){o=o||{};nl(o.h);cur.push('BT /'+(o.b?'F2':'F1')+' '+(o.fs||9.3)+' Tf '+(o.c||'0.09 0.11 0.16')+
  ' rg 1 0 0 1 '+(M+(o.x||0))+' '+y.toFixed(2)+' Tm ('+q(lat(s))+') Tj ET')}
 function rule(){nl(8);cur.push('0.82 0.86 0.9 RG 0.7 w '+M+' '+(y+4).toFixed(2)+' m '+(W-M)+' '+(y+4).toFixed(2)+' l S');nl(4)}
 band();
 var o=OB()||{};
 t('Édité le '+new Date().toLocaleString('fr-FR'),{fs:8.3,c:'0.35 0.4 0.48'});
 t('Technicien : '+(REG.technicien||'—')+'   ·   Atelier : '+(REG.atelier||'—')+'   ·   Agrément : '+(REG.agrement||'—'),{b:true,fs:10});
 t('VIN : '+(o.vin||'—')+'   ·   Kilométrage : '+(o.km!=null?o.km.toLocaleString('fr-FR')+' km':'—')+'   ·   '+blabelSafe());
 t('Protocole : '+(o.proto||'—')+'   ·   Tension : '+(o.volts||'—')+'   ·   Calculateurs : '+((o.ecus||[]).length));
 t('Cadre : '+REG.baseLegale,{fs:8.3,c:'0.3 0.35 0.42'});
 rule();
 t('ACCÈS AUX CALCULATEURS',{b:true,fs:10.5,c:'0.13 0.35 0.62'});
 t('Lectures (DTC, JDD, DID, moniteurs) : services de diagnostic ouverts — aucune clé d\'accès requise.',{fs:8.6,c:'0.13 0.55 0.28'});
 var ses=Object.keys(AUTH.session||{});
 if(ses.length)ses.forEach(function(k){var s=AUTH.session[k];
  t('• Accès officiel '+s.src+' — '+k+' — '+new Date(s.ts).toLocaleString('fr-FR')+' par '+s.by,{fs:8.4,x:6})});
 else t('• Aucun accès protégé utilisé : diagnostic réalisé en lecture seule.',{fs:8.4,x:6,c:'0.3 0.35 0.42'});
 t('Aucune protection de calculateur contournée. Aucun compteur kilométrique modifié.',{fs:8.2,c:'0.42 0.46 0.52'});
 rule();
 if(ST.ready){
  t('READINESS / MIL',{b:true,fs:10.5,c:'0.13 0.35 0.62'});
  t('MIL : '+(ST.ready.mil?'ALLUMÉ':'éteint')+'   ·   DTC annoncés : '+ST.ready.count+'   ·   Carburant : '+(ST.ready.diesel?'diesel':'essence'),
   {c:ST.ready.mil?'0.72 0.13 0.2':'0.13 0.55 0.28'});
  ST.ready.list.forEach(function(x){if(x.supported)t('• '+x.n+' : '+(x.ready?'prêt':'NON PRÊT'),{fs:8.4,x:6,
   c:x.ready?'0.3 0.35 0.42':'0.62 0.4 0.05'})});
  rule()}
 if(ST.m06&&ST.m06.length){
  t('MONITEURS OBD (MODE 06)',{b:true,fs:10.5,c:'0.13 0.35 0.62'});
  ST.m06.forEach(function(m){t('• '+m.name+' [MID '+m.mid+']',{b:true,fs:8.8});
   m.rows.slice(0,8).forEach(function(r){t('   '+r.n+' = '+r.val,{fs:8.2,x:10,c:'0.3 0.35 0.42'})})});
  rule()}
 if(Object.keys(ST.mode09||{}).length){
  t('IDENTIFICATION (MODE 09)',{b:true,fs:10.5,c:'0.13 0.35 0.62'});
  Object.keys(ST.mode09).forEach(function(k){t('• '+k+' : '+String(ST.mode09[k]).slice(0,90),{fs:8.4,x:6})});
  rule()}
 var rows=[];(o.ecus||[]).forEach(function(e){(e.dtc||[]).forEach(function(d){rows.push({e:e,d:d})})});
 t('DÉFAUTS — '+rows.length+' au total',{b:true,fs:10.5,c:'0.72 0.13 0.2'});
 var by={};rows.forEach(function(r){(by[r.e.name]=by[r.e.name]||[]).push(r.d)});
 Object.keys(by).forEach(function(k){
  nl(17);t(k.toUpperCase(),{b:true,fs:9.6});
  by[k].forEach(function(d){
   t(d.code+'  ×'+(d.occ||1)+'  statut 0x'+('0'+(d.status||0).toString(16)).slice(-2).toUpperCase()+
    (d.present?'  PRÉSENT':'')+(d.stored?'  MÉMORISÉ':''),{fs:8.8,x:6,c:d.present?'0.72 0.13 0.2':'0.62 0.4 0.05'});
   if(d.label)t('   '+d.label,{fs:8.2,x:12,c:'0.3 0.35 0.42'});
   if(d.vars&&d.vars.length){var line='';
    d.vars.slice(0,12).forEach(function(v){var seg=v.n+'='+v.v+(v.u&&v.u!=='brut'?v.u:'')+'  ';
     if((line+seg).length>94){t('   '+line,{fs:7.8,x:12,c:'0.3 0.35 0.42'});line=seg}else line+=seg});
    if(line)t('   '+line,{fs:7.8,x:12,c:'0.3 0.35 0.42'})}})});
 rule();
 if(ST.anomalies&&ST.anomalies.length){
  t('ANALYSE CONSIGNE / RÉEL & RÈGLES',{b:true,fs:10.5,c:'0.13 0.35 0.62'});
  ST.anomalies.forEach(function(a){
   t((a.ok?'[OK] ':'[X] ')+a.n+(a.want!=null?(' — consigne '+a.want+' / réel '+a.real+' (écart '+a.gap+' '+a.unit+', seuil '+a.tol+')'):
    (' — '+a.real+' '+a.unit)),{fs:8.6,x:6,c:a.ok?'0.3 0.35 0.42':'0.72 0.13 0.2'});
   if(!a.ok){t('   Cause probable : '+a.fault,{fs:8.2,x:12,c:'0.62 0.4 0.05'});
    t('   Contrôles : '+a.advice,{fs:8,x:12,c:'0.3 0.35 0.42'})}});
  rule()}
 if(ST.corr&&ST.corr.length){
  t('CORRÉLATION MÉGA-BASE (marque · modèle · motorisation · puissance · année)',{b:true,fs:10,c:'0.13 0.35 0.62'});
  ST.corr.forEach(function(f,i){t((i+1)+'. '+f.t+'  ['+f.g+']',{b:true,fs:8.8});
   if(f.mec)t('   Mécanisme : '+String(f.mec).slice(0,150),{fs:8,x:8,c:'0.3 0.35 0.42'});
   if(f.tst&&f.tst.length)t('   Tests : '+f.tst.slice(0,4).join(' · ').slice(0,150),{fs:8,x:8,c:'0.3 0.35 0.42'})});
  rule()}
 if(ST.did&&ST.did.length){
  t('DID ÉTENDUS LUS SANS CLÉ',{b:true,fs:10,c:'0.13 0.35 0.62'});
  ST.did.forEach(function(g){t('• '+g.ecu+' — '+g.items.length+' DID',{b:true,fs:8.6});
   g.items.slice(0,16).forEach(function(i){t('   '+i.did+' '+i.name+' = '+String(i.val).slice(0,60),{fs:7.8,x:10,c:'0.3 0.35 0.42'})})});
  rule()}
 if(ST.rec&&ST.rec.rows.length){
  t('ESSAI ROUTIER ENREGISTRÉ',{b:true,fs:10,c:'0.13 0.35 0.62'});
  t(ST.rec.rows.length+' échantillons sur '+Math.round(((ST.rec.t1||Date.now())-ST.rec.t0)/1000)+' s (CSV joint).',{fs:8.4,x:6});
  rule()}
 t('TRAÇABILITÉ — '+ST.trace.length+' événements journalisés',{b:true,fs:10,c:'0.13 0.35 0.62'});
 ST.trace.slice(0,26).forEach(function(x){t(x.t.slice(0,19).replace('T',' ')+' ['+x.kind+'] '+String(x.msg).slice(0,110),{fs:7.6,x:4,c:'0.3 0.35 0.42'})});
 rule();
 DB.TRACE.mentions.forEach(function(m){t('• '+m,{fs:7.8,c:'0.35 0.4 0.48'})});
 t('KEV FUSION 2026 — '+location.host,{fs:7.8,c:'0.35 0.4 0.48'});
 pages.push(cur);
 var objs=[],n=1;function add(s){objs.push(s);return n++}
 var fr=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
 var fb=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 var pg=add('<< /Type /Pages /Kids [] /Count 0 >>'),ids=[];
 pages.forEach(function(ops){var s=ops.join('\n');
  var sid=add('<< /Length '+s.length+' >>\nstream\n'+s+'\nendstream');
  ids.push(add('<< /Type /Page /Parent '+pg+' 0 R /MediaBox [0 0 '+W.toFixed(2)+' '+H.toFixed(2)+
   '] /Resources << /Font << /F1 '+fr+' 0 R /F2 '+fb+' 0 R >> >> /Contents '+sid+' 0 R >>'))});
 objs[pg-1]='<< /Type /Pages /Kids ['+ids.map(function(i){return i+' 0 R'}).join(' ')+'] /Count '+ids.length+' >>';
 var cat=add('<< /Type /Catalog /Pages '+pg+' 0 R >>');
 var out='%PDF-1.4\n',offs=[];
 objs.forEach(function(o2,i){offs.push(out.length);out+=(i+1)+' 0 obj\n'+o2+'\nendobj\n'});
 var xr=out.length;out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n';
 offs.forEach(function(o2){out+=('0000000000'+o2).slice(-10)+' 00000 n \n'});
 out+='trailer\n<< /Size '+(objs.length+1)+' /Root '+cat+' 0 R >>\nstartxref\n'+xr+'\n%%EOF';
 var b=new Uint8Array(out.length);for(var i=0;i<out.length;i++)b[i]=out.charCodeAt(i)&255;
 return new Blob([b],{type:'application/pdf'})}
function blabelSafe(){try{var o=OB();return (o&&o.ecus&&o.ecus.length)?'ciblage atelier':'—'}catch(e){return '—'}}
function pdfName(){return 'KEV-FUSION-technicien-'+((OB()||{}).vin||'rapport')+'-'+new Date().toISOString().slice(0,10)+'.pdf'}
function dlPdf(){var b=pdf(),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=pdfName();a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href)},6000);tr('RAPPORT','PDF technicien généré','ok');toast('📄 PDF technicien');snd('done')}
async function sharePdf(){
 var b=pdf(),f=new File([b],pdfName(),{type:'application/pdf'});
 var o=OB()||{},n=0;(o.ecus||[]).forEach(function(e){n+=(e.dtc||[]).length});
 var txt='KEV FUSION — Rapport technicien\n'+(REG.technicien||'')+' · '+(REG.atelier||'')+
  '\nVIN '+(o.vin||'—')+' · '+(o.km!=null?o.km+' km':'—')+'\n'+n+' défaut(s) · '+
  ST.anomalies.filter(function(a){return !a.ok}).length+' anomalie(s) consigne/réel';
 try{if(navigator.canShare&&navigator.canShare({files:[f]})){
   await navigator.share({files:[f],title:'Rapport technicien — KEV FUSION',text:txt});
   tr('RAPPORT','PDF partagé','ok');toast('📤 Partagé');snd('done');return}
  if(navigator.share){await navigator.share({title:'Rapport technicien',text:txt});return}}
 catch(e){if(e&&e.name==='AbortError')return}
 dlPdf();try{await navigator.clipboard.writeText(txt);toast('📋 PDF + résumé copié')}catch(e){}}
function exportTrace(){
 var data={ts:new Date().toISOString(),registre:REG,vehicule:{vin:(OB()||{}).vin,km:(OB()||{}).km},
  acces:Object.keys(AUTH.session||{}).map(function(k){var s=AUTH.session[k];return{cle:k,source:s.src,par:s.by,quand:new Date(s.ts).toISOString()}}),
  journalAcces:ST.authLog,trace:ST.trace,readiness:ST.ready,mode06:ST.m06,mode09:ST.mode09,
  did:ST.did,anomalies:ST.anomalies,correlation:ST.corr,
  essai:ST.rec?{debut:new Date(ST.rec.t0).toISOString(),echantillons:ST.rec.rows.length,rows:ST.rec.rows}:null,
  mentions:DB.TRACE.mentions};
 var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 a.download='KEV-FUSION-tracabilite-'+((OB()||{}).vin||'vehicule')+'.json';a.click();toast('🧬 Traçabilité exportée')}

/* ══════════ UI ══════════ */
var TABS=[['access','🔐 Accès & registre'],['adv','🔬 Diagnostic approfondi'],['live','📈 Essai routier'],
 ['corr','🧠 Corrélation'],['trace','🧾 Traçabilité'],['rapport','📄 Rapport']];
function render(){
 var v=$('#view');if(!v)return;
 var o=OB()||{},g=gwFor();ST.gw=g;
 var nD=0;(o.ecus||[]).forEach(function(e){nD+=(e.dtc||[]).length});
 var nA=ST.anomalies.filter(function(a){return !a.ok}).length;
 v.innerHTML=
 '<div class="tc-hero"><div class="tc-hero-bg"></div><div class="tc-hero-in">'+
  '<div class="tc-hero-l"><span class="tc-kick">TECHNICIEN DIAGNOSTICIEN · ATELIER</span>'+
   '<h1>Diagnostic approfondi &amp; accès officiels</h1>'+
   '<p>Lecture <b>intégrale sans clé</b> : readiness, moniteurs Mode 06, identification Mode 09, DID étendus, '+
   'consigne/réel, essai routier enregistré, corrélation méga-base. Les fonctions protégées s\'ouvrent '+
   'par la <b>voie officielle</b> : AutoAuth/SGW, jeton SFD, compte atelier ou clé constructeur.</p>'+
   '<p class="tc-ethic">Aucune protection de calculateur n\'est contournée · aucun compteur kilométrique modifié · interventions tracées.</p>'+
  '</div>'+
  '<div class="tc-hero-r">'+
   '<div class="tc-stat"><b>'+((o.ecus||[]).length)+'</b><span>calculateurs</span></div>'+
   '<div class="tc-stat bad"><b>'+nD+'</b><span>défauts</span></div>'+
   '<div class="tc-stat warn"><b>'+nA+'</b><span>anomalies</span></div>'+
   '<div class="tc-stat info"><b>'+(ST.corr.length)+'</b><span>fiches liées</span></div>'+
  '</div></div></div>'+
 '<div class="tc-strip">'+
  '<span class="tc-pill '+(o.conn?'ok':'ko')+'">'+(o.conn?'● OBD CONNECTÉ':'○ OBD DÉCONNECTÉ')+'</span>'+
  '<span class="tc-pill '+(regOk()?'ok':'ko')+'">'+(regOk()?'🧑‍🔧 '+esc(REG.technicien):'🧑‍🔧 registre à compléter')+'</span>'+
  (o.vin?'<span class="tc-pill mono">'+esc(o.vin)+'</span>':'')+
  (o.km!=null?'<span class="tc-pill">'+o.km.toLocaleString('fr-FR')+' km</span>':'')+
  '<span class="tc-pill info">'+esc(g.name)+'</span>'+
  '<span class="tc-pill ok">🔓 lecture libre</span>'+
 '</div>'+
 '<div id="tcBusy" class="tc-busy" style="display:none"></div>'+
 '<div class="tc-layout"><section class="tc-main">'+
  (!o.conn?'<div class="card tc-need"><b>🔌 OBD non connecté.</b> Ouvrez <b>OBD Atelier</b> pour établir la liaison '+
   '(Bluetooth LE, USB, pont ou Démo), puis revenez ici. <div class="row" style="margin-top:10px">'+
   '<button class="pri" data-tc="goto">🔌 Aller à OBD Atelier</button>'+
   '<button data-tc="demo">🧪 Démo atelier</button></div></div>':'')+
  '<div class="card"><div class="row tc-tabs">'+TABS.map(function(t){
   return '<button class="tc-tab '+(ST.tab===t[0]?'on':'')+'" data-tctab="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'+
  '<div id="tcTab"></div></div>'+
 '</section>'+
 '<aside class="tc-dock"><div class="tc-dock-h"><b>🎛️ Réglages technicien</b>'+
  '<button class="tc-mini" data-tc="sound" id="tcSound">'+(CFG.sound?'🔊':'🔇')+'</button></div>'+
  '<div class="tc-dock-b">'+
   '<div class="tc-c"><label>Balayage DID</label><select data-cfg="sweep">'+
    '<option value="light">Léger (identification)</option><option value="std">Standard</option>'+
    '<option value="deep">Approfondi (toutes plages)</option></select></div>'+
   rg('timeout','Timeout requête',800,6000,'ms')+
   rg('live','Pas d\'échantillonnage',300,3000,'ms')+
   rg('tolBoost','Tolérance suralimentation',3,50,'kPa')+
   rg('tolEgr','Tolérance EGR',3,40,'%')+
   '<div class="tc-tgs">'+tg('autoCorr','Corrélation auto')+tg('autoLog','Journal auto')+
    tg('showRaw','Trames brutes')+tg('scan','Balayage animé')+'</div>'+
   rg('density','Densité interface',85,120,'%')+
   rg('glow','Halo atelier',0,100,'%')+
   rg('grid','Grille fond',0,80,'')+
   rg('vol','Volume',0,100,'%')+
   '<div class="tc-cols">'+
    '<div><input type="color" data-cfg="c1" value="'+CFG.c1+'"><span>Signal</span></div>'+
    '<div><input type="color" data-cfg="c2" value="'+CFG.c2+'"><span>Data</span></div>'+
    '<div><input type="color" data-cfg="c3" value="'+CFG.c3+'"><span>Défaut</span></div>'+
    '<div><input type="color" data-cfg="c4" value="'+CFG.c4+'"><span>Accès</span></div></div>'+
   '<div class="tc-btns">'+
    '<button data-tc="reset">↺ Reset</button><button data-tc="rand">🎲 Thème</button>'+
    '<button class="p" data-tc="pdf">📄 PDF</button><button class="b" data-tc="share">📤 Partager</button>'+
    '<button data-tc="trace">🧾 Traçabilité</button><button data-tc="csv">📈 CSV essai</button></div>'+
   '<p class="tc-note">Réglages appliqués <b>en direct</b> sur l\'analyse, l\'échantillonnage et le rapport.</p>'+
  '</div></aside></div>';
 theme();paintTab();bind()}
function rg(k,l,a,b,u){return '<div class="tc-c"><label>'+l+' <b id="to_'+k+'">'+CFG[k]+(u||'')+'</b></label>'+
 '<input type="range" data-cfg="'+k+'" data-u="'+(u||'')+'" min="'+a+'" max="'+b+'" value="'+CFG[k]+'"></div>'}
function tg(k,l){return '<label class="tc-tg '+(CFG[k]?'on':'')+'" id="tt_'+k+'"><input type="checkbox" data-cfgt="'+k+'"'+(CFG[k]?' checked':'')+'> '+l+'</label>'}
function theme(){var r=document.documentElement.style;
 r.setProperty('--tc1',CFG.c1);r.setProperty('--tc2',CFG.c2);r.setProperty('--tc3',CFG.c3);r.setProperty('--tc4',CFG.c4);
 r.setProperty('--tcglow',(CFG.glow/100).toFixed(2));r.setProperty('--tcgrid',(CFG.grid/100).toFixed(2));
 r.setProperty('--tcden',(CFG.density/100).toFixed(2));
 document.body.classList.toggle('tc-sweep',!!CFG.scan)}
function paintTab(){
 var h=$('#tcTab');if(!h)return;
 if(ST.tab==='access')h.innerHTML=accessView();
 else if(ST.tab==='adv')h.innerHTML=advView();
 else if(ST.tab==='live')h.innerHTML=liveView();
 else if(ST.tab==='corr')h.innerHTML=corrView();
 else if(ST.tab==='trace')h.innerHTML='<div id="tcTrace">'+traceHtml()+'</div><h3 style="margin-top:14px">Journal des accès</h3><div class="tc-log" id="tcAuthLog">'+
  ST.authLog.slice(0,60).map(function(x){return '<div class="tl-'+x.lvl+'"><i>'+esc(x.t.slice(11,19))+'</i>'+esc(x.m)+'</div>'}).join('')+'</div>'+
  '<h3 style="margin-top:14px">Journal général</h3><div class="tc-log" id="tcLog">'+
  ST.trace.slice(0,180).map(function(x){return '<div class="tl-'+x.lvl+'"><i>'+esc(x.t.slice(11,19))+'</i><b>'+esc(x.kind)+'</b> '+esc(x.msg)+'</div>'}).join('')+'</div>';
 else h.innerHTML=rapportView();
 if(ST.tab==='live')paintRec()}
function accessView(){
 var o=OB()||{},g=ST.gw||gwFor();
 var opts=(o.ecus||[]).map(function(e){var a=hasAccess(e);
  return '<option value="'+e.tx+'">0x'+h3(e.tx)+' — '+esc(e.name)+(a?' · 🔓 '+a:'')+'</option>'}).join('')||'<option value="">— scan OBD requis —</option>';
 return '<div class="card"><h3>🧑‍🔧 Registre technicien (obligatoire pour toute intervention)</h3>'+
  '<div class="grid g2">'+
   '<div><label>Technicien</label><input id="rgTech" value="'+esc(REG.technicien)+'" placeholder="Nom Prénom"></div>'+
   '<div><label>Atelier / raison sociale</label><input id="rgShop" value="'+esc(REG.atelier)+'" placeholder="Garage…"></div>'+
   '<div><label>N° agrément / SIRET</label><input id="rgAgr" value="'+esc(REG.agrement)+'" placeholder="SIRET / agrément"></div>'+
   '<div><label>Cadre d\'intervention</label><input id="rgLaw" value="'+esc(REG.baseLegale)+'"></div></div>'+
  '<p class="mut">Ces informations sont portées sur le rapport et dans la traçabilité horodatée.</p></div>'+
 '<div class="card"><h3>🔐 Passerelle de sécurité détectée</h3>'+
  '<div class="tc-gw"><b>'+esc(g.name)+'</b><span class="tc-pill info">'+esc(g.make)+'</span><span class="tc-pill">'+esc(g.years)+'</span>'+
  '<p>'+esc(g.desc)+'</p>'+
  '<div class="tc-gw-cols"><div><b>Lecture</b><span class="ok">'+esc(g.read)+'</span></div>'+
  '<div><b>Écritures protégées</b><span class="warn">'+esc(g.write)+'</span></div></div>'+
  '<p class="mut"><b>Prérequis :</b> '+g.needs.map(esc).join(' · ')+'</p></div>'+
  '<div class="tc-ethic-box">L\'application <b>ne calcule, ne devine et ne contourne aucune clé</b>, '+
  'ne neutralise aucune passerelle et ne modifie aucun compteur. Elle applique uniquement des accès '+
  '<b>délivrés par le constructeur ou son service agréé</b>, et journalise chaque tentative.</div></div>'+
 '<div class="card"><h3>Voie 1 — AutoAuth / Security Gateway (Stellantis)</h3>'+
  '<div class="grid g2">'+
   '<div><label>Compte AutoAuth</label><input id="aaUser" value="'+esc(AUTH.autoauth.user)+'" placeholder="identifiant atelier"></div>'+
   '<div><label>Clé API AutoAuth</label><input id="aaApi" type="password" value="'+esc(AUTH.autoauth.api)+'" placeholder="clé API de votre abonnement"></div></div>'+
  '<div><label>Endpoint de déverrouillage (documentation de votre abonnement — {vin} remplacé automatiquement)</label>'+
   '<input id="aaEp" value="'+esc(AUTH.autoauth.endpoint)+'" placeholder="https://…/vehicles/{vin}/unlock"></div>'+
  '<div class="row"><button class="pri" data-tc="autoauth">🔓 Demander le déverrouillage officiel</button>'+
  '<button data-tc="aasite">↗ AutoAuth</button></div>'+
  '<p class="mut">Le déverrouillage est accordé par le service pour le VIN et la durée de la session.Sans abonnement actif, la demande échoue — c\'est le comportement attendu.</p></div>'+
 '<div class="card"><h3>Voie 2 — Jeton SFD (VAG)</h3>'+
  '<div><label>Calculateur</label><select id="tcAuthEcu">'+opts+'</select></div>'+
  '<div class="grid g2"><div><label>Jeton SFD (délivré par le portail constructeur)</label>'+
   '<input id="tcSfd" value="'+esc(AUTH.sfd)+'" placeholder="jeton hexadécimal"></div>'+
  '<div><label>DID de dépôt du jeton (doc. constructeur du calculateur)</label>'+
   '<input id="tcSfdDid" placeholder="ex. F1A5"></div></div>'+
  '<div class="row"><button class="pri" data-tc="sfd">🔐 Appliquer le jeton officiel</button></div></div>'+
 '<div class="card"><h3>Voie 3 — Clé d\'accès constructeur (SecurityAccess UDS)</h3>'+
  '<div class="grid g2"><div><label>Niveau (impair)</label><input id="tcSecLvl" value="3" placeholder="1, 3, 5, 11, 17…"></div>'+
  '<div><label>Dernier seed reçu</label><input value="'+esc(AUTH.lastSeed||'—')+'" readonly></div></div>'+
  '<div class="row"><button class="pri" data-tc="key">🔑 Demander le seed puis saisir la clé</button></div>'+
  '<p class="mut">La clé doit provenir de votre documentation technique légitime. Les refus '+
  '<b>InvalidKey</b>, <b>ExceedNumberOfAttempts</b> et <b>RequiredTimeDelayNotExpired</b> sont '+
  'respectés : temporisation appliquée, aucune itération automatique.</p></div>'+
 '<div class="card"><h3>📋 Sessions d\'accès actives</h3>'+
  (Object.keys(AUTH.session||{}).length?
   '<table class="tc-tbl">'+Object.keys(AUTH.session).map(function(k){var s=AUTH.session[k];
    return '<tr><td>'+esc(k)+'</td><td><b>'+esc(s.src)+'</b><br><span class="mut">'+new Date(s.ts).toLocaleString('fr-FR')+' · '+esc(s.by)+'</span></td></tr>'}).join('')+'</table>'
   :'<p class="mut">Aucune session protégée ouverte — le diagnostic fonctionne en lecture libre.</p>')+
  '<div class="row"><button class="danger" data-tc="clearauth">🗑️ Clore toutes les sessions</button></div></div>'}
function advView(){
 var r=ST.ready;
 return '<div class="row" style="margin-bottom:12px">'+
  '<button class="pri" data-tc="adv">🔬 Lancer le diagnostic approfondi (sans clé)</button>'+
  '<button data-tc="analyse">📐 Réévaluer consigne / réel</button>'+
  '<button data-tc="corr">🧠 Corréler à la méga-base</button></div>'+
 (ST.lastAdv?'<p class="mut">Dernière analyse : '+new Date(ST.lastAdv).toLocaleString('fr-FR')+'</p>':'')+
 (r?'<div class="tc-box"><b>Readiness / MIL</b>'+
  '<div class="row" style="margin:8px 0"><span class="tc-pill '+(r.mil?'ko':'ok')+'">MIL '+(r.mil?'ALLUMÉ':'éteint')+'</span>'+
  '<span class="tc-pill">'+r.count+' DTC annoncés</span><span class="tc-pill info">'+(r.diesel?'diesel':'essence')+'</span></div>'+
  '<div class="tc-rdy">'+r.list.filter(function(x){return x.supported}).map(function(x){
   return '<span class="'+(x.ready?'ok':'ko')+'">'+(x.ready?'✅':'⏳')+' '+esc(x.n)+'</span>'}).join('')+'</div></div>':'')+
 (ST.anomalies.length?'<div class="tc-box"><b>Analyse consigne / réel &amp; règles</b>'+
  ST.anomalies.map(function(a){
   return '<div class="tc-rule '+(a.ok?'ok':'ko')+'"><b>'+esc(a.n)+'</b>'+
    (a.want!=null?'<span class="tc-pill">consigne '+a.want+'</span><span class="tc-pill">réel '+a.real+'</span>'+
     '<span class="tc-pill '+(a.ok?'ok':'ko')+'">écart '+a.gap+' '+esc(a.unit)+' / seuil '+a.tol+'</span>'
     :'<span class="tc-pill '+(a.ok?'ok':'ko')+'">'+a.real+' '+esc(a.unit)+'</span>')+
    (a.ok?'':'<p><b>Cause probable :</b> '+esc(a.fault)+'</p><p class="mut"><b>Contrôles :</b> '+esc(a.advice)+'</p>')+
    '</div>'}).join('')+'</div>':'')+
 (ST.m06.length?'<div class="tc-box"><b>Moniteurs OBD — Mode 06</b>'+
  ST.m06.map(function(m){return '<div class="tc-m06"><b>'+esc(m.name)+'</b><span class="tc-pill mono">MID '+m.mid+'</span>'+
   (m.rows.length?'<table class="tc-tbl">'+m.rows.map(function(x){
    return '<tr><td>'+esc(x.n)+' <i class="mono">'+x.tid+'</i></td><td><b>'+x.val+'</b></td></tr>'}).join('')+'</table>'
    :'<p class="mut">Aucune valeur retournée par ce moniteur.</p>')+'</div>'}).join('')+'</div>':'')+
 (Object.keys(ST.mode09).length?'<div class="tc-box"><b>Identification — Mode 09</b><table class="tc-tbl">'+
  Object.keys(ST.mode09).map(function(k){return '<tr><td>'+esc(k)+'</td><td class="mono">'+esc(String(ST.mode09[k]).slice(0,80))+'</td></tr>'}).join('')+
  '</table></div>':'')+
 (ST.did.length?'<div class="tc-box"><b>DID étendus lus sans clé</b>'+
  ST.did.map(function(g){return '<div class="tc-m06"><b>'+esc(g.ecu)+'</b><span class="tc-pill">'+g.items.length+' DID</span>'+
   '<table class="tc-tbl">'+g.items.slice(0,40).map(function(i){
    return '<tr><td><span class="mono">'+i.did+'</span> '+esc(i.name)+'</td><td><b>'+esc(String(i.val).slice(0,50))+'</b>'+
     (CFG.showRaw?'<br><i class="mono mut">'+esc(i.raw)+'</i>':'')+'</td></tr>'}).join('')+'</table></div>'}).join('')+'</div>':'')+
 (!r&&!ST.m06.length?'<div class="tc-empty">Lancez le diagnostic approfondi : readiness, moniteurs, identification, DID étendus et règles consigne/réel — <b>le tout sans clé d\'accès</b>.</div>':'')}
function liveView(){
 return '<div class="tc-box"><b>Enregistreur d\'essai routier</b>'+
 '<p class="mut">Échantillonne régime, vitesse, températures, tension, pression admission, papillon, MAF et corrections carburant. '+
 'Export CSV horodaté, joint au rapport. Le technicien doit rester attentif à la conduite : utilisez un second opérateur ou un trajet à l\'arrêt.</p>'+
 '<div class="row"><button class="pri" data-tc="recon">⏺ Démarrer</button>'+
 '<button class="danger" data-tc="recoff">⏹ Arrêter</button>'+
 '<button data-tc="csv">📈 Export CSV</button></div>'+
 '<div id="tcRec"></div></div>'}
function paintRec(){
 var e=$('#tcRec');if(!e)return;
 if(!ST.rec){e.innerHTML='<p class="mut">Aucun enregistrement.</p>';return}
 var n=ST.rec.rows.length,last=ST.rec.rows[n-1]||{};
 var dur=Math.round(((ST.rec.t1||Date.now())-ST.rec.t0)/1000);
 var P2=((window.KFObdDB||{}).PID)||{};
 e.innerHTML='<div class="row" style="margin:10px 0"><span class="tc-pill '+(ST.recT?'ok':'')+'">'+(ST.recT?'● ENREGISTREMENT':'⏹ arrêté')+'</span>'+
  '<span class="tc-pill">'+n+' points</span><span class="tc-pill">'+dur+' s</span>'+
  '<span class="tc-pill info">pas '+CFG.live+' ms</span></div>'+
  '<div class="tc-gauges">'+['0C','0D','05','42','0B','11','06','07'].map(function(p){
   var m=P2[p]||{n:p,u:''};var v=last[p];
   return '<div class="tc-g"><span>'+esc(m.n)+'</span><b>'+(v==null?'—':v)+'</b><em>'+esc(m.u)+'</em></div>'}).join('')+'</div>'}
function corrView(){
 if(!ST.corr.length)return '<div class="tc-empty">Lancez le diagnostic approfondi puis la corrélation : '+
  'chaque code lu est confronté à la méga-base selon <b>marque · modèle · motorisation · puissance · année</b>.</div>';
 return '<div class="row" style="margin-bottom:12px"><button class="pri" data-tc="corr">🧠 Recorréler</button>'+
  '<button data-tc="inject">🧠 Injecter les DTC dans l\'étude</button></div>'+
  ST.corr.map(function(f,i){
   return '<div class="tc-fiche '+(f.fire?'fire':'')+'"><b>'+(i+1)+'. '+esc(f.t)+'</b>'+
    '<div class="row" style="margin:6px 0"><span class="tc-pill '+(f.g==='Critique'?'ko':'')+'">'+esc(f.g)+'</span>'+
    '<span class="tc-pill info">'+esc(f.s)+'</span>'+(f.fire?'<span class="tc-pill ko">🔥 incendie</span>':'')+
    (f.dtc||[]).slice(0,6).map(function(d){return '<span class="tc-pill mono">'+esc(d)+'</span>'}).join('')+'</div>'+
    (f.mec?'<p>'+esc(f.mec)+'</p>':'')+
    (f.tst&&f.tst.length?'<p class="mut"><b>Tests :</b> '+esc(f.tst.join(' · '))+'</p>':'')+
    (f.act&&f.act.length?'<p class="mut"><b>Actions :</b> '+esc(f.act.join(' · '))+'</p>':'')+
    (f.sec&&f.sec!=='—'?'<p class="tc-sec"><b>Sécurité :</b> '+esc(f.sec)+'</p>':'')+'</div>'}).join('')}
function traceHtml(){
 if(!ST.trace.length)return '<div class="tc-empty">Aucun événement. Les lectures, accès, analyses et essais sont journalisés automatiquement.</div>';
 return '<div class="row" style="margin-bottom:10px"><button data-tc="trace">🧾 Exporter la traçabilité</button>'+
  '<button class="danger" data-tc="cleartrace">🗑️ Vider le journal</button></div>'+
  '<table class="tc-tbl wide">'+ST.trace.slice(0,150).map(function(x){
   return '<tr><td class="mono">'+esc(x.t.slice(0,19).replace('T',' '))+'</td><td><b>'+esc(x.kind)+'</b></td>'+
    '<td class="tl-'+x.lvl+'">'+esc(x.msg)+'</td></tr>'}).join('')+'</table>'}
function rapportView(){
 var o=OB()||{},n=0;(o.ecus||[]).forEach(function(e){n+=(e.dtc||[]).length});
 return '<div class="tc-box"><b>Rapport technicien diagnosticien</b>'+
 '<table class="tc-tbl"><tr><td>Technicien</td><td><b>'+esc(REG.technicien||'—')+'</b> · '+esc(REG.atelier||'—')+'</td></tr>'+
 '<tr><td>Agrément</td><td>'+esc(REG.agrement||'—')+'</td></tr>'+
 '<tr><td>VIN / km</td><td class="mono">'+esc(o.vin||'—')+' · '+(o.km!=null?o.km.toLocaleString('fr-FR')+' km':'—')+'</td></tr>'+
 '<tr><td>Calculateurs / défauts</td><td>'+((o.ecus||[]).length)+' / '+n+'</td></tr>'+
 '<tr><td>Anomalies consigne/réel</td><td>'+ST.anomalies.filter(function(a){return !a.ok}).length+' / '+ST.anomalies.length+'</td></tr>'+
 '<tr><td>Fiches corrélées</td><td>'+ST.corr.length+'</td></tr>'+
 '<tr><td>Essai routier</td><td>'+(ST.rec?ST.rec.rows.length+' points':'—')+'</td></tr>'+
 '<tr><td>Accès protégés utilisés</td><td>'+(Object.keys(AUTH.session||{}).length||'aucun — lecture libre')+'</td></tr>'+
 '<tr><td>Événements tracés</td><td>'+ST.trace.length+'</td></tr></table>'+
 '<div class="row" style="margin-top:14px"><button class="pri" data-tc="pdf">📄 Générer le PDF</button>'+
 '<button class="b" data-tc="share">📤 Partager</button>'+
 '<button data-tc="trace">🧾 Traçabilité JSON</button>'+
 '<button data-tc="csv">📈 CSV essai</button></div>'+
 '<div class="tc-ethic-box">'+DB.TRACE.mentions.map(function(m){return '<p>• '+esc(m)+'</p>'}).join('')+'</div></div>'}
function bind(){
 var v=$('#view');if(!v||v._tb)return;v._tb=1;
 v.addEventListener('input',function(e){
  var k=e.target.dataset.cfg;
  if(k){CFG[k]=e.target.type==='range'?+e.target.value:e.target.value;
   var o=$('#to_'+k);if(o)o.textContent=CFG[k]+(e.target.dataset.u||'');
   save();theme();if(k==='vol')AU.vol=CFG.vol/100;
   if(k==='live'&&ST.recT){recStop();recStart()}
   if(k==='showRaw')paintTab();return}
  var t=e.target.dataset.cfgt;
  if(t){CFG[t]=e.target.checked;var w=$('#tt_'+t);if(w)w.classList.toggle('on',CFG[t]);save();paintTab();return}
  var id=e.target.id;
  if(id==='rgTech'){REG.technicien=e.target.value;saveReg()}
  if(id==='rgShop'){REG.atelier=e.target.value;saveReg()}
  if(id==='rgAgr'){REG.agrement=e.target.value;saveReg()}
  if(id==='rgLaw'){REG.baseLegale=e.target.value;saveReg()}
  if(id==='aaUser'){AUTH.autoauth.user=e.target.value;saveAuth()}
  if(id==='aaApi'){AUTH.autoauth.api=e.target.value;saveAuth()}
  if(id==='aaEp'){AUTH.autoauth.endpoint=e.target.value;saveAuth()}
  if(id==='tcSfd'){AUTH.sfd=e.target.value;saveAuth()}});
 v.addEventListener('change',function(e){
  var k=e.target.dataset.cfg;
  if(k&&e.target.tagName==='SELECT'){CFG[k]=e.target.value;save();paintTab()}});
 v.addEventListener('click',async function(e){
  var tb=e.target.closest('[data-tctab]');if(tb){ST.tab=tb.dataset.tctab;render();return}
  var b=e.target.closest('[data-tc]');if(!b)return;
  var k=b.dataset.tc;
  if(k==='goto'){if(typeof switchView==='function')switchView('obdpro');return}
  if(k==='demo'){if(P()){await P().connect('demo');render()}return}
  if(k==='autoauth')await autoAuthUnlock();
  else if(k==='aasite')window.open('https://autoauth.com','_blank','noopener');
  else if(k==='sfd')sfdApply();
  else if(k==='key')await keyAccess();
  else if(k==='clearauth'){AUTH.session={};saveAuth();authLog('Toutes les sessions d\'accès closes','warn');
   tr('ACCÈS','Sessions protégées closes','warn');toast('🗑️ Sessions closes');render()}
  else if(k==='adv')await advanced();
  else if(k==='analyse'){if(!needConn())return;busy(true,'Analyse…');await analyse();busy(false);render()}
  else if(k==='corr'){correlate();render()}
  else if(k==='inject'){if(P()&&P().inject){P().inject();toast('🧠 DTC injectés dans l\'étude')}
   if(typeof switchView==='function')switchView('etude')}
  else if(k==='recon')recStart();
  else if(k==='recoff')recStop();
  else if(k==='csv')recCsv();
  else if(k==='pdf')dlPdf();
  else if(k==='share')await sharePdf();
  else if(k==='trace')exportTrace();
  else if(k==='cleartrace'){if(!confirm('Vider le journal de traçabilité ?'))return;
   ST.trace=[];LS.s('techTrace',[]);render();toast('🗑️ Journal vidé')}
  else if(k==='sound'){CFG.sound=!CFG.sound;AU.on=CFG.sound;save();
   var s=$('#tcSound');if(s)s.textContent=CFG.sound?'🔊':'🔇';if(CFG.sound)snd('ok')}
  else if(k==='reset'){CFG=Object.assign({},DEF);save();AU.on=CFG.sound;AU.vol=CFG.vol/100;render();toast('↺ Réinitialisé')}
  else if(k==='rand'){var pal=[['#22c55e','#38bdf8','#ff4d6d','#c084fc'],['#a3e635','#22d3ee','#ff7a1a','#f472b6'],
    ['#39ff88','#7c5cff','#ff3b6b','#ffb020'],['#00e5a0','#4cc9f0','#f72585','#b5179e']];
   var p=pal[Math.floor(Math.random()*pal.length)];CFG.c1=p[0];CFG.c2=p[1];CFG.c3=p[2];CFG.c4=p[3];
   CFG.glow=25+Math.floor(Math.random()*70);CFG.grid=Math.floor(Math.random()*70);
   save();render();toast('🎲 Thème généré')}})}

/* ══════════ CSS ══════════ */
function css(){
 if($('#tcCss'))return;var s=document.createElement('style');s.id='tcCss';
 s.textContent=
 ':root{--tc1:#22c55e;--tc2:#38bdf8;--tc3:#ff4d6d;--tc4:#c084fc;--tcglow:.56;--tcgrid:.32;--tcden:1}'+
 '.tc-hero{position:relative;border-radius:20px;overflow:hidden;margin-bottom:14px;border:1px solid #1e5236;'+
  'background:linear-gradient(135deg,#04140c,#0a2a1a 40%,#101a30 74%,#1c1030);box-shadow:0 20px 54px #000b}'+
 '.tc-hero-bg{position:absolute;inset:0;opacity:var(--tcgrid);'+
  'background-image:linear-gradient(var(--tc1)22 1px,transparent 1px),linear-gradient(90deg,var(--tc1)22 1px,transparent 1px);'+
  'background-size:32px 32px;mask-image:radial-gradient(72% 72% at 28% 26%,#000,transparent)}'+
 '.tc-hero::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:calc(var(--tcglow)*.32);mix-blend-mode:screen;'+
  'background:radial-gradient(44% 58% at 16% 8%,var(--tc1),transparent 62%),radial-gradient(42% 52% at 90% 92%,var(--tc4),transparent 60%)}'+
 'body.tc-sweep .tc-hero::before{content:"";position:absolute;top:0;bottom:0;width:32%;pointer-events:none;'+
  'background:linear-gradient(90deg,transparent,var(--tc2)55,transparent);animation:tcSw 5.6s linear infinite;opacity:.45}'+
 '@keyframes tcSw{0%{left:-38%}100%{left:108%}}'+
 '.tc-hero-in{position:relative;display:flex;gap:20px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;padding:22px}'+
 '.tc-hero-l{flex:1;min-width:272px}'+
 '.tc-kick{display:inline-block;font:800 10px/1 system-ui;letter-spacing:1.6px;color:#04140c;'+
  'background:linear-gradient(90deg,var(--tc1),var(--tc4));padding:6px 11px;border-radius:8px;margin-bottom:10px}'+
 '.tc-hero h1{font-size:26px;margin:0 0 8px;color:#f2fbf4;letter-spacing:-.4px}'+
 '.tc-hero p{margin:0 0 6px;font-size:13px;color:#9fc4ad;line-height:1.6;max-width:660px}'+
 '.tc-hero p b{color:#e8f7ec}'+
 '.tc-ethic{font-size:11.5px!important;color:var(--tc1)!important;font-weight:700}'+
 '.tc-hero-r{display:flex;gap:10px;flex-wrap:wrap}'+
 '.tc-stat{min-width:86px;padding:11px 13px;border-radius:14px;background:#04140ccc;border:1px solid #1e5236;text-align:center}'+
 '.tc-stat b{display:block;font-size:23px;font-weight:900;color:var(--tc1);line-height:1.1}'+
 '.tc-stat.bad b{color:var(--tc3)}.tc-stat.warn b{color:#ffb020}.tc-stat.info b{color:var(--tc4)}'+
 '.tc-stat span{font-size:9.5px;letter-spacing:.9px;text-transform:uppercase;color:#7fa78e}'+
 '.tc-strip{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}'+
 '.tc-pill{font:700 10.5px/1 system-ui;padding:6px 10px;border-radius:20px;border:1px solid #25314a;background:#0f1625;color:#c4cfe0;white-space:nowrap}'+
 '.tc-pill.ok{border-color:var(--tc1);color:var(--tc1);background:#22c55e14}'+
 '.tc-pill.ko{border-color:var(--tc3);color:var(--tc3);background:#ff4d6d14}'+
 '.tc-pill.info{border-color:var(--tc4);color:var(--tc4);background:#c084fc14}'+
 '.tc-pill.mono{font-family:ui-monospace,monospace}'+
 '.tc-busy{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:12px;margin-bottom:12px;'+
  'background:#38bdf812;border:1px solid var(--tc2);color:var(--tc2);font-size:12.5px;font-weight:700}'+
 '.tc-spin{width:14px;height:14px;border-radius:50%;border:2px solid var(--tc2);border-top-color:transparent;animation:tcSp .7s linear infinite}'+
 '@keyframes tcSp{to{transform:rotate(360deg)}}'+
 '.tc-layout{display:grid;grid-template-columns:minmax(0,1fr) 314px;gap:14px;align-items:start}'+
 '@media(max-width:1060px){.tc-layout{grid-template-columns:1fr}}'+
 '.tc-main{min-width:0}.tc-need{border-color:var(--tc2)}'+
 '.tc-tabs{gap:6px;margin-bottom:14px}'+
 '.tc-tab{border-radius:20px;padding:8px 14px;font-size:12px;font-weight:800;border:1px solid #25314a;background:#0f1625;color:#c4cfe0;cursor:pointer}'+
 '.tc-tab:hover{border-color:var(--tc1);color:var(--tc1)}'+
 '.tc-tab.on{background:linear-gradient(135deg,var(--tc1),var(--tc4));border-color:var(--tc1);color:#04140c}'+
 '.tc-empty{padding:22px;border-radius:14px;border:1px dashed #334466;background:#0f1625;color:#8899b4;font-size:13px;line-height:1.6;text-align:center}'+
 '.tc-empty b{color:#e8eefc}'+
 '.tc-box{border:1px solid #25314a;border-radius:14px;background:#0f1625;padding:13px;margin-bottom:12px}'+
 '.tc-box>b{display:block;font-size:13px;color:#e8eefc;margin-bottom:9px}'+
 '.tc-gw{border:1px solid var(--tc4);border-radius:13px;background:#c084fc0d;padding:12px;margin-bottom:10px}'+
 '.tc-gw>b{font-size:14px;color:#e8eefc;display:block;margin-bottom:7px}'+
 '.tc-gw p{font-size:12.5px;color:#c4cfe0;line-height:1.6;margin:8px 0}'+
 '.tc-gw-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:9px 0}'+
 '.tc-gw-cols div{border:1px solid #25314a;border-radius:10px;padding:9px;background:#0a0f1a}'+
 '.tc-gw-cols b{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:#7f8fa6;margin-bottom:4px}'+
 '.tc-gw-cols span{font-size:11.5px}.tc-gw-cols .ok{color:var(--tc1)}.tc-gw-cols .warn{color:#ffb020}'+
 '.tc-ethic-box{border:1px solid var(--tc1);border-radius:12px;background:#22c55e0d;padding:11px;margin-top:10px;font-size:12px;color:#c4e8d2;line-height:1.65}'+
 '.tc-ethic-box b{color:var(--tc1)}.tc-ethic-box p{margin:4px 0}'+
 '.tc-rdy{display:flex;gap:6px;flex-wrap:wrap}'+
 '.tc-rdy span{font-size:11px;padding:5px 9px;border-radius:10px;border:1px solid #334466;color:#8899b4}'+
 '.tc-rdy .ok{border-color:var(--tc1);color:var(--tc1)}.tc-rdy .ko{border-color:#ffb020;color:#ffb020}'+
 '.tc-rule{border-left:3px solid var(--tc1);border-radius:10px;background:#141c2e;padding:11px;margin-bottom:8px}'+
 '.tc-rule.ko{border-left-color:var(--tc3);background:linear-gradient(90deg,#ff4d6d10,#141c2e 40%)}'+
 '.tc-rule b{font-size:12.5px;color:#e8eefc;display:block;margin-bottom:6px}'+
 '.tc-rule p{margin:6px 0 0;font-size:12px;color:#c4cfe0}'+
 '.tc-m06{border:1px solid #25314a;border-radius:11px;background:#141c2e;padding:10px;margin-bottom:8px}'+
 '.tc-m06>b{font-size:12.5px;color:#e8eefc}'+
 '.tc-tbl{width:100%;border-collapse:collapse;font-size:12.5px;margin:7px 0}'+
 '.tc-tbl td{border-bottom:1px solid #25314a;padding:7px 8px;vertical-align:top;color:#c4cfe0}'+
 '.tc-tbl td:first-child{color:#8899b4;width:38%}'+
 '.tc-tbl.wide td:first-child{width:20%}.tc-tbl.wide td:nth-child(2){width:14%}'+
 '.tc-tbl b{color:#e8eefc}.tc-tbl .mono,.mono{font-family:ui-monospace,monospace}'+
 '.tc-fiche{border-left:3px solid var(--tc2);border-radius:11px;background:#141c2e;padding:12px;margin-bottom:9px}'+
 '.tc-fiche.fire{border-left-color:var(--tc3)}'+
 '.tc-fiche>b{font-size:13px;color:#e8eefc}'+
 '.tc-fiche p{margin:6px 0 0;font-size:12.5px;color:#c4cfe0;line-height:1.55}'+
 '.tc-sec{color:#ffb020!important}'+
 '.tc-gauges{display:grid;grid-template-columns:repeat(auto-fill,minmax(126px,1fr));gap:9px;margin-top:10px}'+
 '.tc-g{border:1px solid #25314a;border-radius:12px;background:linear-gradient(160deg,#0f1625,#141c2e);padding:11px;text-align:center}'+
 '.tc-g span{display:block;font-size:9.5px;text-transform:uppercase;letter-spacing:.5px;color:#7f8fa6;min-height:24px}'+
 '.tc-g b{display:block;font:900 19px/1.1 ui-monospace,monospace;color:var(--tc1);margin:3px 0}'+
 '.tc-g em{font-style:normal;font-size:9px;color:#5a6a84}'+
 '.tc-log{max-height:260px;overflow:auto;background:#04140c;border:1px solid #1e5236;border-radius:11px;padding:10px;font:11px/1.6 ui-monospace,monospace}'+
 '.tc-log i{font-style:normal;color:#5a6a84;margin-right:7px}.tc-log b{color:var(--tc2);margin-right:6px}'+
 '.tl-ok{color:var(--tc1)}.tl-warn{color:#ffb020}.tl-err{color:var(--tc3)}.tl-info{color:#c4cfe0}'+
 '.tc-dock{position:sticky;top:76px;max-height:calc(100vh - 96px);display:flex;flex-direction:column;'+
  'border:1px solid #1e5236;border-radius:18px;overflow:hidden;background:linear-gradient(168deg,#06180fF2,#141030F2 72%);'+
  'box-shadow:0 18px 48px #000b,0 0 0 1px #22c55e1e;backdrop-filter:blur(12px)}'+
 '@media(max-width:1060px){.tc-dock{position:static;max-height:none}}'+
 '.tc-dock-h{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #1e5236;'+
  'background:linear-gradient(90deg,#22c55e1a,transparent)}'+
 '.tc-dock-h b{flex:1;font-size:12.5px;color:#e8f7ec}'+
 '.tc-mini{background:#0f1625;border:1px solid #334466;color:#c4cfe0;border-radius:9px;padding:5px 9px;cursor:pointer;font-size:14px}'+
 '.tc-mini:hover{border-color:var(--tc1)}'+
 '.tc-dock-b{flex:1;overflow:auto;padding:13px 14px 16px;font-size:calc(13px*var(--tcden))}'+
 '.tc-dock-b::-webkit-scrollbar,.tc-log::-webkit-scrollbar{width:10px}'+
 '.tc-dock-b::-webkit-scrollbar-track,.tc-log::-webkit-scrollbar-track{background:#04140c;border-radius:8px}'+
 '.tc-dock-b::-webkit-scrollbar-thumb,.tc-log::-webkit-scrollbar-thumb{background:linear-gradient(var(--tc1),var(--tc4));border-radius:8px;border:2px solid #04140c}'+
 '.tc-dock-b::-webkit-scrollbar-thumb:hover{background:var(--tc1)}'+
 '.tc-dock-b,.tc-log{scrollbar-width:thin;scrollbar-color:var(--tc1) #04140c}'+
 '.tc-c{margin-bottom:11px}'+
 '.tc-c label{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:4px;'+
  'font-size:9.5px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:#7fa78e}'+
 '.tc-c label b{color:var(--tc1);font-family:ui-monospace,monospace;font-size:10.5px}'+
 '.tc-c select{width:100%;background:#0f1625;border:1px solid #334466;color:#e8eefc;border-radius:9px;padding:8px 10px;font-size:12px;margin:0}'+
 '.tc-c select:focus{outline:none;border-color:var(--tc1);box-shadow:0 0 0 3px #22c55e2e}'+
 '.tc-c input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:2px 0 0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--tc1),var(--tc2),var(--tc4))}'+
 '.tc-c input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;'+
  'background:#f2fbf4;border:3px solid var(--tc1);box-shadow:0 0 10px var(--tc1);cursor:grab}'+
 '.tc-c input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#f2fbf4;border:3px solid var(--tc1);cursor:grab}'+
 '.tc-tgs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:11px}'+
 '.tc-tg{display:flex;align-items:center;gap:6px;font-size:10.5px;color:#7fa78e;background:#0f1625;border:1px solid #334466;'+
  'border-radius:18px;padding:5px 10px;cursor:pointer;user-select:none}'+
 '.tc-tg input{width:auto;margin:0;accent-color:var(--tc1)}'+
 '.tc-tg.on{color:var(--tc1);border-color:var(--tc1);background:#22c55e14}'+
 '.tc-cols{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:11px}'+
 '.tc-cols div{display:flex;flex-direction:column;align-items:center;gap:3px}'+
 '.tc-cols input[type=color]{width:100%;height:30px;border:1px solid #334466;border-radius:9px;background:#0f1625;padding:2px;cursor:pointer;margin:0}'+
 '.tc-cols span{font-size:8.5px;color:#5a6a84}'+
 '.tc-btns{display:grid;grid-template-columns:1fr 1fr;gap:7px}'+
 '.tc-btns button{border-radius:10px;padding:10px;font-size:11.5px;font-weight:800;cursor:pointer;border:1px solid #334466;background:#0f1625;color:#e8eefc}'+
 '.tc-btns button:hover{border-color:var(--tc1);transform:translateY(-1px)}'+
 '.tc-btns .p{background:linear-gradient(135deg,var(--tc1),var(--tc2));border-color:var(--tc1);color:#04140c}'+
 '.tc-btns .b{background:linear-gradient(135deg,#1f6f54,#3fa382);border-color:#1f6f54;color:#fff}'+
 '.tc-note{font-size:10px;color:#7fa78e;line-height:1.55;margin:11px 0 0}.tc-note b{color:#e8f7ec}';
 document.head.appendChild(s)}

/* ══════════ NAV / BOOT ══════════ */
function hook(){
 try{
  if(typeof NAV!=='undefined'&&Array.isArray(NAV)&&!NAV.some(function(n){return n[0]==='obdtech'})){
   var i=NAV.findIndex(function(n){return n[0]==='obdpro'});NAV.splice(i<0?NAV.length:i+1,0,['obdtech','🧑‍🔧 Technicien'])}
  if(typeof window.switchView==='function'&&!window.switchView.__obT){
   var _s=window.switchView;
   var w=function(v){if(v!=='obdtech'){if(ST.recT)recStop();return _s(v)}
    if(typeof S!=='undefined')S.view='obdtech';
    var n=$('#nav');if(n&&typeof NAV!=='undefined')n.innerHTML=NAV.map(function(x){
     return '<button data-act="nav" data-k="'+x[0]+'" class="'+(x[0]==='obdtech'?'act':'')+'">'+x[1]+'</button>'}).join('');
    render()};
   w.__obT=true;window.switchView=w}
 }catch(e){}}
function boot(){css();hook();theme();
 window.addEventListener('beforeunload',function(){if(ST.recT)recStop()});
 document.addEventListener('visibilitychange',function(){if(document.hidden&&ST.recT)recStop()});
 if(CFG.autoLog)tr('SESSION','Mode technicien diagnosticien initialisé','info')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFObdTech={render:render,advanced:advanced,analyse:analyse,correlate:correlate,
 pdf:dlPdf,share:sharePdf,trace:exportTrace,csv:recCsv,state:ST,cfg:CFG,registre:REG,acces:AUTH};
})();
