/* KEV FUSION 2026 — obdpro.js v2.0.0  ·  MODE ATELIER
   Accès lecture à TOUS les calculateurs SANS clé d'accès (UDS 0x19 / 0x22 = services ouverts).
   Session étendue automatique + TesterPresent, scan exhaustif 11/29 bits + KWP, identification
   automatique (nom, référence, matériel, logiciel, N° DE SÉRIE, VIN, KILOMÉTRAGE),
   DTC PRÉSENTS / MÉMORISÉS / permanents / en attente + OCCURRENCES + VARIABLES (JDD),
   tests actionneurs & apprentissages tentés sans clé (repli explicite si le calculateur exige 0x27),
   rapport PDF réel partageable (Web Share) + injection automatique dans l'étude. */
(function(){
'use strict';
var DB=window.KFObdDB;if(!DB){console.warn('obdpro: obdpro_db.js requis');return}
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
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3200)}

/* ══════════ AUDIO (lié aux événements visibles, mute global en tête) ══════════ */
var AU={ctx:null,on:LS.g('obdSound',true),vol:LS.g('obdVol',0.5)};
function ac(){if(!AU.ctx){try{AU.ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
 if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume().catch(function(){});return AU.ctx}
function beep(kind){
 if(!AU.on)return;var c=ac();if(!c)return;
 var map={link:[440,880,.16,'sine'],ok:[660,990,.12,'triangle'],dtc:[300,180,.22,'sawtooth'],
  act:[520,700,.1,'square'],err:[200,120,.3,'sawtooth'],tick:[1200,1200,.03,'sine'],done:[523,784,.26,'triangle']};
 var m=map[kind]||map.tick;
 try{var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(60,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.22*AU.vol,c.currentTime+.012);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.02)}catch(e){}}

/* ══════════ TRANSPORT ══════════ */
function TR(){this.kind=null;this.name='';this.rx=[];this.w=null;this.mtu=20;this.q=[];this.drop=null}
TR.prototype.avail=function(){return{ble:!!(navigator.bluetooth&&navigator.bluetooth.requestDevice),
 serial:!!(navigator.serial&&navigator.serial.requestPort),usb:!!(navigator.usb&&navigator.usb.requestDevice)}};
TR.prototype._p=function(t){this.rx.push(t);if(this.w){var f=this.w;this.w=null;f()}};
TR.prototype._r=function(ms){var s=this;return new Promise(function(res,rej){var t0=Date.now();
 (function poll(){if(s.rx.length)return res(s.rx.shift());
  if(Date.now()-t0>ms)return rej(new Error('timeout'));s.w=poll;setTimeout(poll,20)})()})};
TR.prototype._feed=function(chunk){
 this._buf=(this._buf||'')+chunk;
 var parts=this._buf.split('\r');
 for(var i=0;i<parts.length-1;i++)this._p(parts[i]);
 this._buf=parts[parts.length-1];
 if(this._buf.indexOf('>')>=0){this._p(this._buf.replace('>',''));this._buf=''}};
TR.prototype.ble=async function(){
 var opt=Array.from(new Set(DB.BLE.reduce(function(a,b){return a.concat([b.s,b.w,b.r])},[])
  .concat(['00001800-0000-1000-8000-00805f9b34fb','00001801-0000-1000-8000-00805f9b34fb','0000180a-0000-1000-8000-00805f9b34fb'])));
 var d=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:opt});
 this.dev=d;this.kind='ble';this.name=d.name||'ELM327 BLE';
 d.addEventListener('gattserverdisconnected',()=>{if(this.drop)this.drop()});
 await this._ble();LS.s('obdLast',{kind:'ble',name:this.name});return this.name};
TR.prototype._ble=async function(){
 var s=await this.dev.gatt.connect(),sv=await s.getPrimaryServices(),best=null;
 for(var i=0;i<sv.length;i++){var ch;try{ch=await sv[i].getCharacteristics()}catch(e){continue}
  var w=null,r=null;ch.forEach(function(c){if((c.properties.write||c.properties.writeWithoutResponse)&&!w)w=c;
   if((c.properties.notify||c.properties.indicate)&&!r)r=c});
  if(!w||!r)continue;var sc=10;
  DB.BLE.forEach(function(b){if(sv[i].uuid===b.s){sc=Math.max(sc,b.p);if(w.uuid===b.w)sc+=6;if(r.uuid===b.r)sc+=6}});
  if(w===r)sc+=2;if(!best||sc>best.sc)best={sc:sc,w:w,r:r,u:sv[i].uuid}}
 if(!best)throw new Error('Aucun service série BLE trouvé. Utilisez un adaptateur OBD BLE (ELM327 BLE, Vgate iCar Pro BLE, OBDLink MX+/CX, HM-10).');
 this.wc=best.w;this.rc=best.r;await this.rc.startNotifications();
 var self=this;this.rc.addEventListener('characteristicvaluechanged',function(e){
  var v=e.target.value,t='';for(var i=0;i<v.byteLength;i++)t+=String.fromCharCode(v.getUint8(i));self._feed(t)});
 this.mtu=20;this.link='BLE '+best.u.slice(4,8).toUpperCase();return true};
TR.prototype.serial=async function(){
 this.port=await navigator.serial.requestPort();this.kind='serial';this.name='Adaptateur série USB';
 var rates=[38400,115200,9600,57600,230400],self=this;
 for(var i=0;i<rates.length;i++){try{
  if(this.port.readable||this.port.writable){try{await this.port.close()}catch(e){}}
  await this.port.open({baudRate:rates[i],dataBits:8,stopBits:1,parity:'none'});
  this.link='Série '+rates[i];this._sloop();LS.s('obdLast',{kind:'serial',name:this.name});return this.name}catch(e){}}
 throw new Error('Port série inaccessible')};
TR.prototype._sloop=async function(){var dec=new TextDecoder(),self=this;
 try{while(this.port.readable){this.rd=this.port.readable.getReader();
  try{for(;;){var r=await this.rd.read();if(r.done)break;self._feed(dec.decode(r.value,{stream:true}))}}
  finally{try{this.rd.releaseLock()}catch(e){}}}}catch(e){if(self.drop)self.drop()}};
TR.prototype.usb=async function(){
 var d=await navigator.usb.requestDevice({filters:[{vendorId:0x1A86},{vendorId:0x10C4},{vendorId:0x0403},{vendorId:0x067B}]});
 await d.open();if(!d.configuration)await d.selectConfiguration(1);
 var it=null,ei=null,eo=null;
 d.configuration.interfaces.forEach(function(f){f.alternates.forEach(function(a){
  var i=null,o=null;a.endpoints.forEach(function(e){if(e.type==='bulk'){if(e.direction==='in')i=e;else o=e}});
  if(i&&o&&!it){it=f;ei=i;eo=o}})});
 if(!it)throw new Error('Interface USB série introuvable');
 await d.claimInterface(it.interfaceNumber);
 if(d.vendorId===0x1A86){await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0xA1,value:0xC29C,index:0xB2B9});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0x9A,value:0x2518,index:0x0050})}
 else if(d.vendorId===0x10C4){await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0x00,value:1,index:0});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0x1E,value:0,index:0,data:new Uint8Array([0x00,0x96,0,0])})}
 else if(d.vendorId===0x0403){await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0,value:0,index:0});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:3,value:0x4138,index:0})}
 this.u={d:d,i:ei.endpointNumber,o:eo.endpointNumber};this.kind='usb';this.name=d.productName||'Adaptateur USB';
 this.link='USB';this._uloop();LS.s('obdLast',{kind:'usb',name:this.name});return this.name};
TR.prototype._uloop=async function(){var dec=new TextDecoder(),self=this;
 try{for(;;){var r=await this.u.d.transferIn(this.u.i,64);if(r.data)self._feed(dec.decode(r.data,{stream:true}))}}
 catch(e){if(self.drop)self.drop()}};
TR.prototype.ws=async function(url){
 var self=this;this.wurl=url;
 await new Promise(function(res,rej){var s=new WebSocket(url);self.sock=s;s.binaryType='arraybuffer';
  var to=setTimeout(function(){try{s.close()}catch(e){}rej(new Error('Pont injoignable'))},8000);
  s.onopen=function(){clearTimeout(to);res()};s.onerror=function(){clearTimeout(to);rej(new Error('Erreur WebSocket'))};
  s.onclose=function(){if(self.drop)self.drop()};
  s.onmessage=function(e){self._feed(typeof e.data==='string'?e.data:new TextDecoder().decode(e.data))}});
 this.kind='ws';this.name='Pont '+url;this.link='WebSocket';LS.s('obdLast',{kind:'ws',name:this.name,url:url});return this.name};
TR.prototype.demo=function(){this.kind='demo';this.name=DB.DEMO.adapter;this.link='CAN 11 bit 500 k (simulé)';return this.name};
TR.prototype.send=async function(s){
 if(this.kind==='demo')return;
 var b=new TextEncoder().encode(s+'\r');
 if(this.kind==='ble'){for(var i=0;i<b.length;i+=this.mtu){var c=b.slice(i,i+this.mtu);
  if(this.wc.properties.writeWithoutResponse&&this.wc.writeValueWithoutResponse)await this.wc.writeValueWithoutResponse(c);
  else await this.wc.writeValue(c)}}
 else if(this.kind==='serial'){var w=this.port.writable.getWriter();await w.write(b);w.releaseLock()}
 else if(this.kind==='usb')await this.u.d.transferOut(this.u.o,b);
 else if(this.kind==='ws')this.sock.send(s+'\r')};
TR.prototype.reconnect=async function(){
 if(this.kind==='ble'&&this.dev){await this._ble();return true}
 if(this.kind==='ws'&&this.wurl){await this.ws(this.wurl);return true}
 return false};
TR.prototype.close=async function(){
 try{if(this.dev&&this.dev.gatt.connected)this.dev.gatt.disconnect()}catch(e){}
 try{if(this.rd)await this.rd.cancel()}catch(e){}
 try{if(this.port)await this.port.close()}catch(e){}
 try{if(this.u)await this.u.d.close()}catch(e){}
 try{if(this.sock)this.sock.close()}catch(e){}
 this.kind=null;this.rx=[]};

/* ══════════ ELM ══════════ */
function ELM(t){this.t=t;this.proto=0;this.can=false;this.lat=[]}
ELM.prototype.cmd=async function(c,ms){
 ms=ms||CFG.timeout;
 if(this.t.kind==='demo'){await sleep(30);return demoCmd(c)}
 var t0=performance.now();this.t.rx=[];await this.t.send(c);
 var out=[],g=0;
 for(;;){if(++g>500)break;var l;try{l=await this.t._r(ms)}catch(e){break}
  var s=String(l).trim();if(!s)continue;if(s==='>')break;
  if(/^AT/i.test(c)&&s.toUpperCase()===c.toUpperCase())continue;
  out.push(s);if(/NO DATA|UNABLE|ERROR|STOPPED|\?/i.test(s))break}
 this.lat.push(performance.now()-t0);if(this.lat.length>50)this.lat.shift();
 return out.join('\n')};
ELM.prototype.init=async function(L){
 L('Initialisation adaptateur…');
 await this.cmd('ATZ',3500);await sleep(220);
 for(const c of ['ATE0','ATL0','ATS0','ATH1','ATAL','ATAT1','ATST64'])await this.cmd(c,1400);
 this.version=await this.cmd('ATI',2200);L('Adaptateur : '+(this.version||'—'));
 this.volts=await this.cmd('ATRV',1600);L('Tension : '+this.volts);
 var forced=CFG.proto;
 if(forced!=='auto'){await this.cmd('ATSP'+forced,3000);await sleep(200)}
 else await this.cmd('ATSP0',3000);
 var r=await this.cmd('0100',9000);
 if(/UNABLE|NO DATA|ERROR|\?/i.test(r)||!r){
  L('Protocole auto échoué — balayage ciblé…');
  for(const p of [6,8,7,9,5,4,3]){await this.cmd('ATSP'+p.toString(16).toUpperCase(),3000);await sleep(160);
   var x=await this.cmd('0100',6000);if(x&&!/UNABLE|NO DATA|ERROR|\?/i.test(x)){r=x;break}}}
 if(!r||/UNABLE|NO DATA|ERROR|\?/i.test(r))throw new Error('Aucun protocole détecté — contact mis ? prise alimentée ? adaptateur compatible ?');
 var pn=await this.cmd('ATDPN',1600);var n=parseInt(String(pn).replace(/[^0-9A-F]/gi,''),16);
 this.proto=isNaN(n)?6:(n&0x0F);this.can=[6,7,8,9,10].indexOf(this.proto)>=0;
 L('Protocole : '+(DB.PROTO[this.proto]||this.proto),'ok');
 if(this.can)for(const c of ['ATCAF0','ATCFC1','ATAL','ATSTFF','ATAR'])await this.cmd(c,1300);
 this.ready=true};
ELM.prototype.frames=function(r){
 if(!r||/NO DATA|UNABLE|ERROR|STOPPED|\?/i.test(r))return[];
 return String(r).split(/\r?\n/).map(function(l){
  var t=l.replace(/[^0-9A-Fa-f ]/g,' ').trim().split(/\s+/).filter(function(x){return /^[0-9A-Fa-f]{2}$/.test(x)});
  return t.length>1?t.map(function(x){return parseInt(x,16)}):null}).filter(Boolean)};
ELM.prototype.obd=async function(m,p){return this.frames(await this.cmd(m+(p||''),CFG.timeout))};
function isotp(fr){
 var cur=null,need=0,out=[];
 for(var i=0;i<fr.length;i++){var f=fr[i],d=f.length>4?f.slice(3):f;if(!d.length)continue;
  var t=d[0]>>4;
  if(t===0){var L=d[0]&15;out=out.concat(d.slice(1,1+L))}
  else if(t===1){need=((d[0]&15)<<8)|d[1];cur=d.slice(2);if(cur.length>=need)return cur.slice(0,need)}
  else if(t===2&&cur){cur=cur.concat(d.slice(1));if(cur.length>=need)return cur.slice(0,need)}}
 return cur&&cur.length?cur:(out.length?out:null)}

/* ══════════ UDS ══════════ */
function UDS(e){this.e=e;this.tx=0x7E0;this.rx=0x7E8;this.session=1}
UDS.prototype.head=async function(tx,rx){
 this.tx=tx;this.rx=rx;
 if(this.e.t.kind==='demo')return;
 await this.e.cmd('ATSH'+h3(tx),1400);await this.e.cmd('ATCRA'+h3(rx),1400);
 await this.e.cmd('ATFCSH'+h3(tx),1200);await this.e.cmd('ATFCSD300000',1200);await this.e.cmd('ATFCSM1',1200)};
UDS.prototype.req=async function(b,ms){
 if(this.e.t.kind==='demo')return demoUds(this.tx,b);
 var r=await this.e.cmd(b.map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('').toUpperCase(),ms||CFG.timeout);
 var fr=this.e.frames(r);if(!fr.length)return{err:'pas de réponse'};
 var d=null;
 if(this.e.can){if(fr.length===1&&fr[0].length>4){var q=fr[0].slice(3);d=(q[0]>>4)===0?q.slice(1,1+(q[0]&15)):q}
  else d=isotp(fr);if(!d)d=fr[0].slice(fr[0].length>4?4:1)}
 else{d=[];fr.forEach(function(f){d=d.concat(f)});if(d.length>3)d=d.slice(3)}
 if(!d||!d.length)return{err:'réponse vide'};
 if(d[0]===0x7F){var n=d[2];
  if(n===0x78){await sleep(500);return this.req(b,(ms||CFG.timeout)+4000)}
  return{nrc:n,err:DB.NRC[n]||('NRC '+n)}}
 if(d[0]!==(b[0]+0x40))return{err:'réponse inattendue '+hex(d),data:d};
 return{data:d.slice(1)}};
UDS.prototype.open=async function(){
 /* session étendue SANS clé : 0x10 03 puis 0x10 02 puis défaut — aucune sécurité requise pour lire */
 for(const s of (CFG.session==='ext'?[3,2,1]:CFG.session==='def'?[1]:[3,2,1])){
  var r=await this.req([0x10,s],2600);
  if(!r.err){this.session=s;return s}}
 return 1};
UDS.prototype.ping=async function(){var r=await this.req([0x3E,0x00],1300);return !r.err};
UDS.prototype.tp=async function(){return this.req([0x3E,0x80],1200)};
UDS.prototype.did=async function(id){var b=unhex(id);var r=await this.req([0x22,b[0],b[1]],CFG.timeout);
 if(r.err)return null;return r.data.slice(2)};
UDS.prototype.txt=async function(id){var b=await this.did(id);if(!b)return '';
 var t=b.map(function(x){return x>=32&&x<127?String.fromCharCode(x):''}).join('').replace(/\s+/g,' ').trim();
 return t||hex(b)};
UDS.prototype.ident=async function(){
 var o={};
 for(const id of DB.IDENT){var t=await this.txt(id);if(t)o[id]=t}
 return o};
UDS.prototype.km=async function(){
 for(const id of DB.KM_DID){
  var b=await this.did(id);if(!b||b.length<2)continue;
  var v=null;
  if(DB.VAR[id]&&DB.VAR[id].d){try{v=DB.VAR[id].d(b)}catch(e){}}
  if(v==null){if(b.length>=4)v=(b[0]*16777216+b[1]*65536+b[2]*256+b[3])/10;
   else if(b.length===3)v=b[0]*65536+b[1]*256+b[2];
   else v=b[0]*256+b[1]}
  if(v>0&&v<2000000)return{km:Math.round(v),did:id}}
 return null};
UDS.prototype.dtcs=async function(mask){
 var r=await this.req([0x19,0x02,mask],CFG.timeout+1500);
 if(r.err)return[];
 var b=r.data.slice(1),out=[];
 for(var i=0;i+3<b.length;i+=4){
  var b0=b[i],b1=b[i+1],b2=b[i+2],st=b[i+3];
  var pre=['P','C','B','U'][(b0>>6)&3];
  var code=pre+((b0>>4)&3)+(b0&15)+('0'+b1.toString(16)).slice(-2).toUpperCase()+('0'+(b2>>4).toString(16)).slice(-2).toUpperCase();
  code=pre+((b0>>4)&3)+(b0&15)+('0'+(b1>>4).toString(16)).slice(-1).toUpperCase()+('0'+(b1&15).toString(16)).slice(-1).toUpperCase()+('0'+(b2>>4).toString(16)).slice(-1).toUpperCase();
  code=pre+((b0>>4)&3)+(b0&15)+('0'+b1.toString(16)).slice(-2).toUpperCase()+('0'+b2.toString(16)).slice(-2).toUpperCase();
  out.push({code:code,raw:[b0,b1,b2],status:st})}
 return out};
UDS.prototype.allDtc=async function(){
 var seen={},list=[];
 for(const m of [0xFF,0x01,0x08,0x04,0x02]){
  var a=await this.dtcs(m);
  a.forEach(function(d){if(seen[d.code]){seen[d.code].status|=d.status}
   else{seen[d.code]=d;list.push(d)}})}
 if(!list.length){var h=await this.req([0x19,0x0A],CFG.timeout+1500);
  if(!h.err){var b=h.data.slice(1);
   for(var i=0;i+3<b.length;i+=4){var b0=b[i],b1=b[i+1],b2=b[i+2],st=b[i+3];
    var pre=['P','C','B','U'][(b0>>6)&3];
    var code=pre+((b0>>4)&3)+(b0&15)+('0'+b1.toString(16)).slice(-2).toUpperCase()+('0'+b2.toString(16)).slice(-2).toUpperCase();
    if(!seen[code]){var d={code:code,raw:[b0,b1,b2],status:st};seen[code]=d;list.push(d)}}}}
 return list};
UDS.prototype.jdd=async function(d){
 var out={occ:null,age:null,heal:null,vars:[],records:[]};
 /* compteur de détection de défaut */
 var fdc=await this.req([0x19,0x14],2600);
 if(!fdc.err&&fdc.data.length>=4){for(var i=0;i+3<fdc.data.length;i+=4){
  if(fdc.data[i]===d.raw[0]&&fdc.data[i+1]===d.raw[1]&&fdc.data[i+2]===d.raw[2])out.occ=fdc.data[i+3]}}
 /* snapshot 0x04 + extended 0x06 : variables & occurrences */
 for(const sub of [0x04,0x06]){
  var r=await this.req([0x19,sub,d.raw[0],d.raw[1],d.raw[2],0xFF],CFG.timeout+2000);
  if(r.err||r.data.length<5)continue;
  var b=r.data.slice(4);
  out.records.push({type:sub===4?'Image figée (snapshot)':'Données étendues',raw:hex(b)});
  var k=0;
  while(k<b.length){
   if(sub===0x06&&k===0){k++;continue}
   if(k+1>=b.length)break;
   var id=('0'+b[k].toString(16)).slice(-2).toUpperCase()+('0'+b[k+1].toString(16)).slice(-2).toUpperCase();
   var meta=DB.VAR[id];
   var len=meta?(id==='00A6'||id==='F405'?4:(['000C','0042','0010','F40D','F411','F420','F421','F422','F423','0021','0031','F406'].indexOf(id)>=0?2:1)):1;
   if(k+2+len>b.length)len=Math.max(1,b.length-k-2);
   var val=b.slice(k+2,k+2+len);
   if(meta){var v;try{v=meta.d(val)}catch(e){v=null}
    if(v!=null){out.vars.push({id:id,n:meta.n,u:meta.u,v:Math.round(v*10)/10});
     if(/occurrence/i.test(meta.n)&&out.occ==null)out.occ=v;
     if(/vieillissement/i.test(meta.n))out.age=v;
     if(/guérison/i.test(meta.n))out.heal=v;
     k+=2+len;continue}}
   out.vars.push({id:id,n:'Variable '+id,u:'brut',v:hex(val)});
   k+=2+len;
   if(out.vars.length>28)break}
 }
 if(out.occ==null)out.occ=1;
 return out};
UDS.prototype.clear=async function(){return this.req([0x14,0xFF,0xFF,0xFF],6000)};
UDS.prototype.io=async function(did,ctrl,params){var b=unhex(did);
 return this.req([0x2F,b[0],b[1],ctrl].concat(unhex(params||'')),9000)};
UDS.prototype.ioBack=async function(did){var b=unhex(did);return this.req([0x2F,b[0],b[1],0x00],6000)};
UDS.prototype.routine=async function(did,opts){var b=unhex(did);
 return this.req([0x31,0x01,b[0],b[1]].concat(unhex(opts||'')),15000)};
UDS.prototype.routinePoll=async function(did){var b=unhex(did);return this.req([0x31,0x03,b[0],b[1]],7000)};

/* ══════════ DÉMO ══════════ */
var DEMO_STATE=null;
function demoReset(){DEMO_STATE=JSON.parse(JSON.stringify(DB.DEMO))}
demoReset();
function demoCmd(c){
 var u=c.toUpperCase().replace(/\s/g,'');
 if(u==='ATI'||u==='ATZ')return DB.DEMO.adapter;
 if(u==='ATRV')return DEMO_STATE.volts;
 if(u==='ATDPN')return '6';
 if(u==='0902')return '49 02 01 '+hex(Array.prototype.map.call(DEMO_STATE.vin,function(ch){return ch.charCodeAt(0)}));
 if(u==='03'){var m=DEMO_STATE.ecus[0].dtc.filter(function(d){return d.st&8});
  return '43 '+m.map(function(d){return d.code}).map(function(s){var p=s[0];var i='PCBU'.indexOf(p);
   var n=parseInt(s.slice(1),16);var b0=(i<<6)|n>>8,b1=n&255;return ('0'+b0.toString(16)).slice(-2)+' '+('0'+b1.toString(16)).slice(-2)}).join(' ')||'43 00 00'}
 if(u==='07')return '47 00 00';
 if(u==='0A')return '4A 00 00';
 if(u.indexOf('01')===0){var pid=u.slice(2);
  var vals={'0C':[0x0B,0xD0],'0D':[0x00],'05':[0x7B],'42':[0x31,0xF4],'0F':[0x46],'5C':[0x78],'A6':[0x00,0x09,0x18,0x60]};
  var v=vals[pid]||[0];return '41 '+pid+' '+hex(v)}
 return 'OK'}
function demoUds(tx,b){
 var e=DEMO_STATE.ecus.find(function(x){return x.tx===tx});
 if(!e)return{err:'pas de réponse'};
 var sid=b[0];
 if(sid===0x3E)return{data:[0x00]};
 if(sid===0x10)return{data:[b[1],0x00,0x32,0x01,0xF4]};
 if(sid===0x22){
  var id=('0'+b[1].toString(16)).slice(-2).toUpperCase()+('0'+b[2].toString(16)).slice(-2).toUpperCase();
  var map={F197:e.name,F187:e.part,F191:e.hw,F188:e.sw,F18C:e.serial,F190:DEMO_STATE.vin,F189:'v2.14',F193:'A',F195:'CAL-07',F199:'2024-03-18',F1A0:'ECU-'+h3(tx)};
  if(map[id])return{data:[b[1],b[2]].concat(Array.prototype.map.call(map[id],function(c){return c.charCodeAt(0)}))};
  if(id==='F405'){var k=DEMO_STATE.km;return{data:[b[1],b[2],(k>>16)&255,(k>>8)&255,k&255]}}
  if(id==='F40E')return{data:[b[1],b[2],96+40]};
  if(id==='F40D')return{data:[b[1],b[2],0x01,0x54]};
  if(id==='F410')return{data:[b[1],b[2],68]};
  return{err:'Requête hors plage',nrc:0x31}}
 if(sid===0x19){
  var sub=b[1];
  if(sub===0x02){var mask=b[2];
   var sel=e.dtc.filter(function(d){return (d.st&mask)||mask===0xFF});
   return{data:[mask].concat(sel.reduce(function(a,d){return a.concat(d.raw,[d.st])},[]))}}
  if(sub===0x0A)return{data:[0xFF].concat(e.dtc.reduce(function(a,d){return a.concat(d.raw,[d.st])},[]))};
  if(sub===0x14)return{data:e.dtc.reduce(function(a,d){return a.concat(d.raw,[d.occ])},[])};
  if(sub===0x04||sub===0x06){
   var code=b[2],c1=b[3],c2=b[4];
   var d=e.dtc.find(function(x){return x.raw[0]===code&&x.raw[1]===c1&&x.raw[2]===c2});
   if(!d)return{err:'Requête hors plage',nrc:0x31};
   var body=[];
   if(sub===0x06)body.push(0x01);
   d.vars.forEach(function(v){
    var id=v[0],val=v[1],meta=DB.VAR[id],bytes=[];
    if(id==='F405'||id==='00A6'){bytes=[(val>>16)&255,(val>>8)&255,val&255];if(id==='00A6')bytes=[(val*10>>24)&255,(val*10>>16)&255,(val*10>>8)&255,(val*10)&255]}
    else if(['000C','0042','0010','F40D','F420','F421'].indexOf(id)>=0){var n=id==='000C'?val*4:(id==='0042'?val*1000:val*100);bytes=[(n>>8)&255,n&255]}
    else if(id==='0005'||id==='000F'||id==='005C'||id==='0046'||id==='F40E')bytes=[Math.round(val)+40];
    else bytes=[Math.round(val)];
    body=body.concat(unhex(id),bytes)});
   if(sub===0x06)body=body.concat([0x01,0x00,d.occ],[0x01,0x01,d.age],[0x01,0x02,d.heal]);
   return{data:[code,c1,c2,d.st].concat(body)}}
  return{err:'Sous-fonction non supportée',nrc:0x12}}
 if(sid===0x14){e.dtc=[];return{data:[]}}
 if(sid===0x2F||sid===0x31){
  if(tx===0x6AC)return{nrc:0x33,err:DB.NRC[0x33]};
  return{data:b.slice(1).concat([0x01])}}
 return{err:'Service non supporté',nrc:0x11}}

/* ══════════ CONFIG / ÉTAT ══════════ */
var DEF={depth:'brand',timeout:2600,session:'auto',tp:2000,proto:'auto',minOcc:1,
 fPresent:true,fStored:true,fPerm:true,fPend:true,density:100,glow:58,grid:34,sweep:true,
 c1:'#22c55e',c2:'#38bdf8',c3:'#ff4d6d',autoInject:true,autoKm:true,sound:true,vol:50};
var CFG=Object.assign({},DEF,LS.g('obdCfg2',{}));
AU.on=CFG.sound;AU.vol=CFG.vol/100;
var T=new TR(),E=new ELM(T),U=new UDS(E);
var ST={conn:false,busy:false,tab:'dtc',vin:'',km:null,serials:[],proto:'',volts:'',
 ecus:[],log:[],live:[],liveT:null,tpT:null,cal:null,act:null,studyN:0,brand:LS.g('obdBrand','auto'),lastScan:null};
function save(){LS.s('obdCfg2',CFG)}
function log(m,l){ST.log.unshift({t:new Date().toISOString(),m:String(m),l:l||'info'});
 if(ST.log.length>900)ST.log.pop();
 var el=$('#obLog');if(el)el.innerHTML=ST.log.slice(0,240).map(function(x){
  return '<div class="ol-'+x.l+'"><i>'+esc(x.t.slice(11,19))+'</i>'+esc(x.m)+'</div>'}).join('')}
function busy(b,t){ST.busy=b;var e=$('#obBusy');if(e){e.style.display=b?'flex':'none';e.innerHTML=b?'<span class="ob-spin"></span>'+esc(t||''):''}
 $$('[data-ob]').forEach(function(x){if(b)x.setAttribute('disabled','');else x.removeAttribute('disabled')})}
function bkey(){
 if(ST.brand!=='auto')return ST.brand;
 var v='';try{v=(typeof S!=='undefined'&&S.vehicle&&S.vehicle.brand)||''}catch(e){}
 v=v.toLowerCase();
 if(/peugeot|citro|ds\b|opel|vauxhall/.test(v))return 'psa';
 if(/renault|dacia|alpine/.test(v))return 'renault';
 if(/volkswagen|vw|audi|skoda|seat|cupra|porsche/.test(v))return 'vag';
 if(/bmw|mini/.test(v))return 'bmw';
 if(/mercedes|smart/.test(v))return 'mercedes';
 if(/ford/.test(v))return 'ford';
 if(/fiat|alfa|lancia|jeep|abarth/.test(v))return 'fca';
 if(/volvo|polestar/.test(v))return 'volvo';
 if(/jaguar|land ?rover|range ?rover/.test(v))return 'jlr';
 if(/toyota|lexus|honda|acura|nissan|infiniti|mazda|suzuki|mitsubishi|subaru|hyundai|kia|genesis/.test(v))return 'asian';
 return 'other'}
function blabel(){return (DB.SCAN[bkey()]||DB.SCAN.other).label}

/* ══════════ CONNEXION ══════════ */
async function connect(kind){
 if(ST.busy)return;busy(true,'Connexion…');
 try{
  var name='';
  if(kind==='auto'){var a=T.avail();
   if(a.ble){try{name=await T.ble()}catch(e){log('BLE : '+e.message,'warn')}}
   if(!name&&a.serial){try{name=await T.serial()}catch(e){log('Série : '+e.message,'warn')}}
   if(!name&&a.usb){try{name=await T.usb()}catch(e){log('USB : '+e.message,'warn')}}
   if(!name)throw new Error('Aucun adaptateur choisi. Sélectionnez Bluetooth LE, USB, pont ou Démo atelier.')}
  else if(kind==='ble')name=await T.ble();
  else if(kind==='serial')name=await T.serial();
  else if(kind==='usb')name=await T.usb();
  else if(kind==='ws'){var u=$('#obWs').value.trim();if(!u)throw new Error('Adresse du pont requise');name=await T.ws(u)}
  else{demoReset();name=T.demo()}
  T.drop=function(){ST.conn=false;log('Liaison perdue — reconnexion…','warn');beep('err');render();
   setTimeout(async function(){try{await T.reconnect();await E.init(log);ST.conn=true;beep('link');log('Reconnecté','ok');render()}
    catch(e){log('Reconnexion échouée','err');render()}},1200)};
  log('Transport : '+name+' · '+(T.link||kind),'ok');beep('link');
  await E.init(log);
  ST.conn=true;ST.proto=DB.PROTO[E.proto]||'';ST.volts=E.volts||'';
  await vin();startTP();
  log('✅ Mode atelier actif — lecture de tous les calculateurs sans clé d\'accès','ok');
  toast('🔌 Connecté · mode atelier');
  if(T.kind==='demo'){await scan(false,true);await readAll()}
 }catch(e){log('Connexion : '+e.message,'err');beep('err');toast('❌ '+e.message);ST.conn=false}
 busy(false);render()}
async function vin(){
 try{var f=await E.obd('09','02');
  if(f.length){var all=[];f.forEach(function(x){all=all.concat(x)});
   var s=all.map(function(b){return b>=32&&b<127?String.fromCharCode(b):''}).join('');
   var m=s.match(/[A-HJ-NPR-Z0-9]{17}/);if(m){ST.vin=m[0];log('VIN : '+ST.vin,'ok');
    try{if(typeof S!=='undefined'){S.veh=S.veh||{};S.veh.vin=ST.vin}}catch(e){}return}}}catch(e){}
 try{await U.head(0x7E0,0x7E8);var t=await U.txt('F190');var m2=t.match(/[A-HJ-NPR-Z0-9]{17}/);
  if(m2){ST.vin=m2[0];log('VIN (UDS) : '+ST.vin,'ok')}}catch(e){}}
async function disconnect(){stopLive();stopTP();await T.close();ST.conn=false;log('Déconnecté');render()}
function startTP(){stopTP();ST.tpT=setInterval(function(){if(ST.conn&&!ST.busy)U.tp().catch(function(){})},CFG.tp)}
function stopTP(){if(ST.tpT){clearInterval(ST.tpT);ST.tpT=null}}

/* ══════════ SCAN EXHAUSTIF ══════════ */
function scanIds(){
 var ids=[0x7E0,0x7E1,0x7E2,0x7E3,0x7E4,0x7E5,0x7E6,0x7E7];
 var cfg=DB.SCAN[bkey()]||DB.SCAN.other;
 var ranges=CFG.depth==='full'?[[0x600,0x7FF]]:CFG.depth==='wide'?[[0x600,0x7FF]].slice(0,1):cfg.ranges;
 if(CFG.depth==='wide')ranges=[[0x6A0,0x7BF]];
 ranges.forEach(function(r){for(var i=r[0];i<=r[1];i++)if(ids.indexOf(i)<0)ids.push(i)});
 return ids}
async function scan(silent,forceDemo){
 if(!ST.conn){toast('Connectez l\'adaptateur');return}
 busy(true,'Scan atelier…');ST.ecus=[];ST.serials=[];
 var t0=Date.now();
 try{
  if(T.kind==='demo'){
   DEMO_STATE.ecus.forEach(function(x){
    ST.ecus.push({tx:x.tx,rx:x.tx+8,name:x.name,part:x.part,hw:x.hw,sw:x.sw,serial:x.serial,
     ident:{F197:x.name,F187:x.part,F191:x.hw,F188:x.sw,F18C:x.serial,F190:DEMO_STATE.vin},
     session:3,km:DEMO_STATE.km,kmDid:'F405',dtc:null})});
   ST.km=DEMO_STATE.km;ST.vin=DEMO_STATE.vin;
   ST.serials=ST.ecus.map(function(e){return{ecu:e.name,tx:e.tx,serial:e.serial}});
   log('✅ '+ST.ecus.length+' calculateurs (démo atelier) — accès sans clé','ok');beep('done');
  }else{
   var ids=scanIds();log('Scan '+blabel()+' — '+ids.length+' adresses, session étendue auto, sans clé');
   var found=0;
   for(var i=0;i<ids.length;i++){
    var id=ids[i];
    busy(true,'Calculateur '+h3(id)+' · '+(i+1)+'/'+ids.length+' · '+found+' trouvé(s)');
    await U.head(id,id+8);
    var ok=await U.ping();
    if(!ok){await U.head(id,0x7E8);ok=await U.ping()}
    if(!ok)continue;
    var rx=id+8;var pr=await U.req([0x22,0xF1,0x97],1300);
    if(pr.err){await U.head(id,0x7E8);rx=0x7E8}
    await U.head(id,rx);
    var ses=await U.open();
    var info=await U.ident();
    var cfg=DB.SCAN[bkey()]||DB.SCAN.other;
    var name=info.F197||info.F1B0||(cfg.names&&cfg.names[id])||('Calculateur '+h3(id));
    var km=null;if(CFG.autoKm){km=await U.km()}
    var e={tx:id,rx:rx,name:name,part:info.F187||'',hw:info.F191||'',sw:info.F188||'',
     serial:info.F18C||'',ident:info,session:ses,km:km?km.km:null,kmDid:km?km.did:'',dtc:null};
    ST.ecus.push(e);found++;
    if(e.serial)ST.serials.push({ecu:name,tx:id,serial:e.serial});
    if(km&&!ST.km)ST.km=km.km;
    log('✅ '+h3(id)+' → '+name+(e.serial?' · série '+e.serial:'')+(km?' · '+km.km+' km':'')+' · session '+ses,'ok');
    beep('tick');paintEcus();
   }
   if(!found)log('Aucun ECU UDS — essayez KWP2000 (K-Line) ou le scan exhaustif','warn');
  }
  ST.lastScan={t:new Date().toISOString(),n:ST.ecus.length,ms:Date.now()-t0,brand:blabel()};
  if(!silent){toast('🔎 '+ST.ecus.length+' calculateur(s) · accès sans clé');beep('done')}
 }catch(e){log('Scan : '+e.message,'err');beep('err')}
 busy(false);render()}
async function kwp(){
 if(!ST.conn){toast('Connectez d\'abord');return}
 busy(true,'KWP2000 (K-Line)…');
 try{await E.cmd('ATSP5',3000);await sleep(250);await E.cmd('ATSH8110F1',1500);
  log('KWP init : '+(await E.cmd('1080',4000)||'—'));
  log('KWP identification : '+(await E.cmd('1A90',4000)||'—'));
  log('KWP défauts : '+(await E.cmd('1200',4000)||'—'));
  toast('Scan KWP terminé — voir journal');beep('ok')}catch(e){log('KWP : '+e.message,'err')}
 busy(false);render()}

/* ══════════ LECTURE DTC + JDD ══════════ */
function statusTags(st){
 return DB.STATUS.filter(function(s){return st&s.b}).map(function(s){
  return '<span class="ob-tag t-'+s.c+'" title="'+esc(s.n)+'">'+esc(s.l)+'</span>'}).join('')}
async function readAll(){
 if(!ST.conn){toast('Connectez l\'adaptateur');return}
 busy(true,'Lecture des défauts…');
 var list=ST.ecus.length?ST.ecus:[{tx:0x7E0,rx:0x7E8,name:'Moteur (OBD-II)'}];
 var codes=[],n=0;
 try{
  for(var i=0;i<list.length;i++){
   var e=list[i];
   busy(true,'Défauts '+e.name+' ('+(i+1)+'/'+list.length+')');
   await U.head(e.tx,e.rx);await U.open();
   var ds=await U.allDtc();
   for(var k=0;k<ds.length;k++){
    var d=ds[k];
    busy(true,'JDD '+d.code+' · '+e.name);
    var j=await U.jdd(d);
    d.occ=j.occ;d.age=j.age;d.heal=j.heal;d.vars=j.vars;d.records=j.records;
    d.present=!!(d.status&0x01);d.stored=!!(d.status&0x08);d.perm=!!(d.status&0x10);d.pend=!!(d.status&0x04);
    d.label=(DB.DEMO.ecus.reduce(function(a,x){return a.concat(x.dtc)},[]).find(function(x){return x.code===d.code})||{}).label||'';
    codes.push(d.code);n++;
   }
   e.dtc=ds;
   if(e.km==null&&CFG.autoKm){var km=await U.km();if(km){e.km=km.km;e.kmDid=km.did;if(!ST.km)ST.km=km.km}}
   log(e.name+' : '+ds.length+' défaut(s) · '+ds.filter(function(d){return d.present}).length+' présent(s) · '+
    ds.filter(function(d){return d.stored}).length+' mémorisé(s)',ds.length?'warn':'ok');
   if(ds.length)beep('dtc');
   paintDtc();
  }
  var uniq=Array.from(new Set(codes));
  ST.studyN=uniq.length;
  if(CFG.autoInject)injectStudy(uniq);
  log('Total : '+n+' défaut(s), '+uniq.length+' code(s) unique(s)','ok');
  toast('📋 '+n+' défaut(s) · '+uniq.length+' code(s)'+(CFG.autoInject?' · injectés dans l\'étude':''));
  beep('done');
 }catch(e){log('Lecture : '+e.message,'err');beep('err')}
 busy(false);render()}
function filtered(){
 var out=[];
 ST.ecus.forEach(function(e){
  (e.dtc||[]).forEach(function(d){
   var keep=(CFG.fPresent&&d.present)||(CFG.fStored&&d.stored)||(CFG.fPerm&&d.perm)||(CFG.fPend&&d.pend);
   if(!CFG.fPresent&&!CFG.fStored&&!CFG.fPerm&&!CFG.fPend)keep=true;
   if(!keep)return;
   if((d.occ||1)<CFG.minOcc)return;
   out.push({ecu:e.name,tx:e.tx,d:d})})});
 return out}
async function clearAll(){
 if(!confirm('Effacer les défauts de TOUS les calculateurs ?\n\nLes JDD et occurrences seront perdus. Exportez le rapport AVANT.'))return;
 busy(true,'Effacement…');
 try{for(const e of ST.ecus){await U.head(e.tx,e.rx);await U.open();
  var r=await U.clear();log('Effacement '+e.name+' : '+(r.err||'OK'),r.err?'warn':'ok')}
  beep('ok');await readAll()}catch(e){log('Effacement : '+e.message,'err')}
 busy(false);render()}

/* ══════════ INJECTION ÉTUDE ══════════ */
function injectStudy(codes){
 var s=(codes||[]).join(' ');
 LS.s('studyDtc',s);
 try{if(typeof S!=='undefined')S.dtc=codes||[]}catch(e){}
 var el=$('#stDtc');
 if(el){el.value=s;el.dispatchEvent(new Event('input',{bubbles:true}));el.classList.add('ob-flash');
  setTimeout(function(){el.classList.remove('ob-flash')},1400)}
 log('🧠 '+((codes||[]).length)+' DTC injectés dans « DTC lus sur le véhicule »','ok')}
function hookStudy(){
 if(typeof window.renderStudy!=='function'||window.renderStudy.__ob2)return;
 var _r=window.renderStudy;
 var w=function(){var r=_r.apply(this,arguments);
  try{var s=LS.g('studyDtc','');var el=$('#stDtc');
   if(el&&s&&!el.value.trim()){el.value=s;el.dispatchEvent(new Event('input',{bubbles:true}))}}catch(e){}
  return r};
 w.__ob2=true;window.renderStudy=w}

/* ══════════ ACTIONNEURS / APPRENTISSAGES (sans clé) ══════════ */
async function guards(pre){
 var items=[],ok=true;
 async function pid(p){try{var f=await E.obd('01',p);
  if(f.length){var d=f[0].length>4?f[0].slice(4):f[0].slice(1);var fn=(DB.PID[p]||{}).f;return fn?fn(d):null}}catch(e){}return null}
 if(pre.vbat){var v=await pid('42');var g=v!=null&&v>=pre.vbat[0]&&v<=pre.vbat[1];
  items.push({l:'Tension '+pre.vbat.join('–')+' V',v:v==null?'non lisible':v.toFixed(2)+' V',ok:v==null?null:g});if(v!=null&&!g)ok=false}
 if(pre.cool){var t=await pid('05');var g2=t!=null&&t>=pre.cool[0]&&t<=pre.cool[1];
  items.push({l:'Température liquide '+pre.cool.join('–')+' °C',v:t==null?'non lisible':t+' °C',ok:t==null?null:g2});if(t!=null&&!g2)ok=false}
 if(pre.rpm!=null){var r=await pid('0C');
  var g3=r!=null&&(Array.isArray(pre.rpm)?r>=pre.rpm[0]&&r<=pre.rpm[1]:r===pre.rpm);
  items.push({l:'Régime '+(Array.isArray(pre.rpm)?pre.rpm.join('–'):pre.rpm)+' tr/min',v:r==null?'non lisible':Math.round(r)+' tr/min',ok:r==null?null:g3});
  if(r!=null&&!g3)ok=false}
 if(pre.ign)items.push({l:'Contact mis',v:'à confirmer',ok:null});
 if(pre.park)items.push({l:'Frein de parking serré',v:'à confirmer',ok:null});
 if(pre.brake)items.push({l:'Pédale de frein enfoncée',v:'à confirmer',ok:null});
 if(pre.hood)items.push({l:'Capot ouvert / zone ventilée',v:'à confirmer',ok:null});
 return{ok:ok,items:items}}
async function runAct(id){
 var a=DB.ACT.find(function(x){return x.id===id});if(!a)return;
 if(!ST.conn){toast('Connectez d\'abord');return}
 var tx=parseInt($('#obActEcu').value,10);var e=ST.ecus.find(function(x){return x.tx===tx});
 if(!e){toast('Sélectionnez un calculateur (lancez le scan)');return}
 var did=($('#act_'+id)||{}).value||a.did;
 if(!confirm('⚙️ TEST ACTIONNEUR — '+a.n+'\n\nCalculateur : '+e.name+'\nRisque : '+a.risk+
  '\n\nVéhicule à l\'arrêt, frein serré, personne éloignée des pièces mobiles.\nDurée '+Math.round(a.dur/1000)+
  ' s puis retour automatique à l\'état normal.\n\nExécution SANS clé d\'accès ; si le calculateur exige une sécurité, il le signalera.\n\nContinuer ?'))return;
 busy(true,'Actionneur '+a.n+'…');ST.act={a:a,e:e,steps:[],t:new Date().toISOString()};paintAct();
 var g=await guards(a.pre||{});ST.act.pre=g;paintAct();
 if(!g.ok){log('Préconditions non remplies — abandon','err');beep('err');busy(false);ST.act.done=true;paintAct();return}
 try{
  await U.head(e.tx,e.rx);var ses=await U.open();
  ST.act.steps.push({t:'Session étendue (sans clé)',r:'session '+ses,ok:true});paintAct();
  var r=await U.io(did,0x03,($('#actp_'+id)||{}).value||'');
  if(r.nrc===0x33){
   ST.act.steps.push({t:'Activation actionneur',r:'🔒 Le calculateur exige un accès sécurité (0x27). Aucune clé n\'est devinée ni contournée.',ok:false,locked:true});
   log(a.n+' : sécurité calculateur requise','warn');beep('err');toast('🔒 Ce calculateur exige une clé constructeur');
  }else if(r.err){ST.act.steps.push({t:'Activation actionneur',r:'❌ '+r.err,ok:false});beep('err')}
  else{ST.act.steps.push({t:'Activation actionneur',r:'✅ actif · '+hex(r.data),ok:true});beep('act');paintAct();
   await sleep(a.dur);
   var b=await U.ioBack(did);
   ST.act.steps.push({t:'Retour automatique à l\'état normal',r:b.err?('❌ '+b.err):'✅ returnControlToECU',ok:!b.err});
   beep('ok')}
 }catch(err){ST.act.steps.push({t:'Erreur',r:'❌ '+err.message,ok:false});beep('err')}
 ST.act.done=true;log('Actionneur '+a.n+' terminé','ok');busy(false);paintAct()}
async function actStop(){
 busy(true,'Retour état normal…');
 for(const a of DB.ACT){var el=$('#act_'+a.id);if(!el||!el.value)continue;try{await U.ioBack(el.value)}catch(e){}}
 log('Retour global à l\'état normal demandé','ok');beep('ok');busy(false);toast('⏹️ Actionneurs rendus au calculateur')}
async function runCal(id){
 var c=DB.CAL.find(function(x){return x.id===id});if(!c)return;
 if(!ST.conn){toast('Connectez d\'abord');return}
 var tx=parseInt($('#obCalEcu').value,10);var e=ST.ecus.find(function(x){return x.tx===tx});
 if(!e){toast('Sélectionnez un calculateur');return}
 var did=($('#cal_'+id)||{}).value||c.did;
 if(!confirm('🔧 APPRENTISSAGE — '+c.n+'\n\nCalculateur : '+e.name+'\nRisque : '+c.risk+
  '\n\nUne interruption peut IMMOBILISER le véhicule. Batterie stabilisée, frein serré.\n'+
  'Exécution SANS clé ; repli explicite si le calculateur exige une sécurité.\n\nContinuer ?'))return;
 busy(true,'Préconditions…');ST.cal={c:c,e:e,steps:[],t:new Date().toISOString()};paintCal();
 var g=await guards(c.pre||{});ST.cal.pre=g;paintCal();
 if(!g.ok){log('Préconditions non remplies','err');beep('err');busy(false);ST.cal.done=true;paintCal();return}
 try{
  await U.head(e.tx,e.rx);var ses=await U.open();
  ST.cal.steps.push({t:'Session étendue (sans clé)',r:'session '+ses,ok:true});paintCal();
  for(var i=0;i<c.steps.length;i++){
   var s=c.steps[i];busy(true,'Étape '+(i+1)+'/'+c.steps.length+' — '+s);
   var ent={t:s,r:'—',ok:null};ST.cal.steps.push(ent);paintCal();
   if(/Session étendue/i.test(s)){ent.r='✅ déjà ouverte';ent.ok=true;continue}
   if(/^(Contact|Relever|ATF|Boîte|Véhicule|Moteur chaud|Roues|Pressions|Mires|HT hors|N,|Point mort|Passer|Cycles|Essai|Surveillance)/i.test(s)){
    if(!confirm('Étape '+(i+1)+' : '+s+'\n\nConfirmez que la condition est remplie.')){ent.r='annulé';ent.ok=false;break}
    ent.r='✅ confirmé';ent.ok=true;continue}
   if(/Poll/i.test(s)){
    var t0=Date.now(),done=false;
    while(Date.now()-t0<90000){var pr=await U.routinePoll(did);
     if(!pr.err&&pr.data&&pr.data.length>=3){var stt=pr.data[2];if(stt===1||stt===2){done=true;break}
      if(stt===3||stt===4){ent.r='❌ routine échouée';ent.ok=false;break}}
     await sleep(1100)}
    ent.r=done?'✅ routine terminée':(ent.ok===false?ent.r:'⏱️ temporisation');ent.ok=done;paintCal();if(!done)break;continue}
   if(/Effacement/i.test(s)){var cr=await U.clear();ent.r=cr.err?('❌ '+cr.err):'✅ défauts effacés';ent.ok=!cr.err;continue}
   if(/Écriture DID|Reset compteur/i.test(s)){
    var dv=prompt('Données à écrire (hex) pour « '+s+' »','');
    if(dv==null){ent.r='saisie annulée';ent.ok=false;break}
    var b=unhex(did),wr=await U.req([0x2E,b[0],b[1]].concat(unhex(dv)),9000);
    if(wr.nrc===0x33){ent.r='🔒 sécurité calculateur requise';ent.ok=false;ent.locked=true}
    else{ent.r=wr.err?('❌ '+wr.err):'✅ écrit';ent.ok=!wr.err}
    continue}
   var rr=await U.routine(did);
   if(rr.nrc===0x33){ent.r='🔒 Le calculateur exige un accès sécurité (0x27) — non contourné.';ent.ok=false;ent.locked=true;
    log(c.n+' : sécurité requise','warn');beep('err');paintCal();break}
   ent.r=rr.err?('❌ '+rr.err):('✅ lancée · '+hex(rr.data));ent.ok=!rr.err;
   beep(ent.ok?'act':'err');paintCal();if(!ent.ok)break}
 }catch(err){ST.cal.steps.push({t:'Erreur',r:'❌ '+err.message,ok:false});beep('err')}
 ST.cal.done=true;log('Apprentissage '+c.n+' terminé — '+c.post,'ok');beep('done');
 toast('🔧 Terminé — '+c.post);busy(false);paintCal()}

/* ══════════ LIVE ══════════ */
function startLive(){
 if(!ST.conn){toast('Connectez d\'abord');return}stopLive();
 ST.live=['0C','0D','05','42','0F','5C','11','0B','10','04','2F','46','A6'].map(function(p){
  return{p:p,n:(DB.PID[p]||{}).n||p,u:(DB.PID[p]||{}).u||'',v:'—'}});
 paintLive();
 ST.liveT=setInterval(async function(){
  if(ST.busy||!ST.conn)return;
  for(const it of ST.live){try{var f=await E.obd('01',it.p);
   if(f.length){var d=f[0].length>4?f[0].slice(4):f[0].slice(1);var fn=(DB.PID[it.p]||{}).f;
    if(fn&&d.length){var v=fn(d);it.v=typeof v==='number'?Math.round(v*10)/10:v}}}catch(e){}}
  paintLive()},900)}
function stopLive(){if(ST.liveT){clearInterval(ST.liveT);ST.liveT=null}}

/* ══════════ PDF (générateur natif, sans dépendance) ══════════ */
function pdfBytes(){
 var W=595.28,H=841.89,M=42,LH=13.4,FS=9.4;
 var pages=[],cur=[],y=H-M;
 function esc(s){return String(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
 function lat(s){return String(s).normalize('NFC').replace(/[^\x20-\xFF]/g,function(c){
  var m={'€':'EUR','—':'-','–':'-','’':"'",'‘':"'",'“':'"','”':'"','…':'...','✅':'[OK]','❌':'[X]','⚠':'[!]','🔒':'[LOCK]','🔧':'','📋':'','🧠':'','🔌':'','⚙':'','📤':'','🏁':''};
  return m[c]||''})}
 function push(op){cur.push(op)}
 function nl(h){y-=(h||LH);if(y<M+40){pages.push(cur);cur=[];y=H-M;band()}}
 function band(){
  push('0.016 0.078 0.047 rg '+M+' '+(H-M-4)+' '+(W-2*M)+' 26 re f');
  push('BT /F2 12 Tf 1 1 1 rg 1 0 0 1 '+(M+10)+' '+(H-M+5)+' Tm ('+esc(lat('KEV FUSION 2026 — RAPPORT DIAGNOSTIC OBD · MODE ATELIER'))+') Tj ET');
  y=H-M-24}
 function txt(s,o){o=o||{};nl(o.h);
  push('BT /'+(o.b?'F2':'F1')+' '+(o.fs||FS)+' Tf '+(o.c||'0.09 0.11 0.16')+' rg 1 0 0 1 '+(M+(o.x||0))+' '+y.toFixed(2)+' Tm ('+esc(lat(s))+') Tj ET')}
 function rule(){nl(8);push('0.82 0.86 0.9 RG 0.7 w '+M+' '+(y+4).toFixed(2)+' m '+(W-M)+' '+(y+4).toFixed(2)+' l S');nl(4)}
 band();
 txt('Édité le '+new Date().toLocaleString('fr-FR'),{fs:8.4,c:'0.35 0.4 0.48'});
 txt('Véhicule : '+(ST.vin||'VIN non lu')+'   ·   Kilométrage : '+(ST.km!=null?ST.km.toLocaleString('fr-FR')+' km':'non lu'),{b:true,fs:10.4});
 txt('Marque / ciblage : '+blabel()+'   ·   Protocole : '+(ST.proto||'—')+'   ·   Tension : '+(ST.volts||'—'));
 txt('Adaptateur : '+(T.name||'—')+' ('+(E.version||'—')+')   ·   Calculateurs interrogés : '+ST.ecus.length);
 txt('Accès : mode atelier, lecture UDS 0x19/0x22 sans clé d\'accès · session étendue automatique',{fs:8.4,c:'0.13 0.55 0.28'});
 rule();
 var rows=filtered();
 var present=rows.filter(function(r){return r.d.present}).length;
 var stored=rows.filter(function(r){return r.d.stored}).length;
 txt('SYNTHÈSE — '+rows.length+' défaut(s) · '+present+' PRÉSENT(S) · '+stored+' MÉMORISÉ(S)',{b:true,fs:11,c:'0.72 0.13 0.2'});
 rule();
 txt('N° DE SÉRIE DES CALCULATEURS',{b:true,fs:10,c:'0.13 0.35 0.62'});
 ST.ecus.forEach(function(e){
  txt('• '+e.name+'  [0x'+h3(e.tx)+']',{b:true,fs:9.2});
  txt('   Série : '+(e.serial||'—')+'   ·   Pièce : '+(e.part||'—')+'   ·   HW/SW : '+(e.hw||'—')+' / '+(e.sw||'—'),{fs:8.2,x:8,c:'0.3 0.35 0.42'});
  if(e.km!=null)txt('   Kilométrage lu : '+e.km.toLocaleString('fr-FR')+' km (DID '+e.kmDid+')',{fs:8.2,x:8,c:'0.3 0.35 0.42'});
 });
 rule();
 txt('DÉFAUTS, STATUTS, OCCURRENCES ET VARIABLES',{b:true,fs:10,c:'0.13 0.35 0.62'});
 if(!rows.length)txt('Aucun défaut correspondant aux filtres actifs.',{c:'0.13 0.55 0.28'});
 var byE={};rows.forEach(function(r){(byE[r.ecu]=byE[r.ecu]||[]).push(r)});
 Object.keys(byE).forEach(function(k){
  nl(20);txt(k.toUpperCase(),{b:true,fs:10,c:'0.09 0.11 0.16'});
  byE[k].forEach(function(r){
   var d=r.d;
   nl(16);
   txt(d.code+'   ×'+(d.occ||1)+' occurrence(s)'+(d.age!=null?'   · vieillissement '+d.age:'')+(d.heal!=null?'   · guérison '+d.heal:''),
    {b:true,fs:9.8,c:d.present?'0.72 0.13 0.2':'0.62 0.4 0.05'});
   if(d.label)txt('   '+d.label,{fs:8.6,x:8});
   var tags=DB.STATUS.filter(function(s){return d.status&s.b}).map(function(s){return s.l}).join(' · ');
   txt('   Statut 0x'+('0'+d.status.toString(16)).slice(-2).toUpperCase()+' : '+tags,{fs:8,x:8,c:'0.3 0.35 0.42'});
   if(d.vars&&d.vars.length){
    txt('   Variables / conditions figées :',{fs:8.4,x:8,b:true,c:'0.13 0.35 0.62'});
    var line='';
    d.vars.forEach(function(v){
     var seg=v.n+' = '+v.v+(v.u&&v.u!=='brut'?' '+v.u:'')+'   ';
     if((line+seg).length>96){txt('   '+line,{fs:8,x:14,c:'0.3 0.35 0.42'});line=seg}
     else line+=seg});
    if(line)txt('   '+line,{fs:8,x:14,c:'0.3 0.35 0.42'});}
   (d.records||[]).forEach(function(rec){txt('   '+rec.type+' : '+rec.raw.slice(0,90),{fs:7.4,x:14,c:'0.42 0.46 0.52'})});
  })});
 rule();
 if(ST.cal){txt('APPRENTISSAGE EXÉCUTÉ : '+ST.cal.c.n+' sur '+ST.cal.e.name,{b:true,fs:10,c:'0.13 0.35 0.62'});
  ST.cal.steps.forEach(function(s){txt('• '+s.t+' → '+s.r,{fs:8.2,x:6})})}
 if(ST.act){txt('TEST ACTIONNEUR : '+ST.act.a.n+' sur '+ST.act.e.name,{b:true,fs:10,c:'0.13 0.35 0.62'});
  ST.act.steps.forEach(function(s){txt('• '+s.t+' → '+s.r,{fs:8.2,x:6})})}
 rule();
 txt('Document d\'aide à l\'expertise. Lecture réalisée sans clé d\'accès (services UDS ouverts).',{fs:8,c:'0.35 0.4 0.48'});
 txt('Les tests actionneurs et apprentissages ont été exécutés sous la responsabilité de l\'opérateur.',{fs:8,c:'0.35 0.4 0.48'});
 txt('KEV FUSION 2026 — '+location.host,{fs:8,c:'0.35 0.4 0.48'});
 pages.push(cur);
 /* assemblage PDF */
 var objs=[],n=1;
 function add(s){objs.push(s);return n++}
 var fontR=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
 var fontB=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 var pagesId=add('<< /Type /Pages /Kids [] /Count 0 >>');
 var pageIds=[];
 pages.forEach(function(ops){
  var stream=ops.join('\n');
  var sid=add('<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream');
  var pid=add('<< /Type /Page /Parent '+pagesId+' 0 R /MediaBox [0 0 '+W.toFixed(2)+' '+H.toFixed(2)+
   '] /Resources << /Font << /F1 '+fontR+' 0 R /F2 '+fontB+' 0 R >> >> /Contents '+sid+' 0 R >>');
  pageIds.push(pid)});
 objs[pagesId-1]='<< /Type /Pages /Kids ['+pageIds.map(function(i){return i+' 0 R'}).join(' ')+'] /Count '+pageIds.length+' >>';
 var catId=add('<< /Type /Catalog /Pages '+pagesId+' 0 R >>');
 var out='%PDF-1.4\n',offsets=[];
 objs.forEach(function(o,i){offsets.push(out.length);out+=(i+1)+' 0 obj\n'+o+'\nendobj\n'});
 var xref=out.length;
 out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n';
 offsets.forEach(function(o){out+=('0000000000'+o).slice(-10)+' 00000 n \n'});
 out+='trailer\n<< /Size '+(objs.length+1)+' /Root '+catId+' 0 R >>\nstartxref\n'+xref+'\n%%EOF';
 var bytes=new Uint8Array(out.length);
 for(var i=0;i<out.length;i++)bytes[i]=out.charCodeAt(i)&255;
 return bytes}
function pdfBlob(){return new Blob([pdfBytes()],{type:'application/pdf'})}
function pdfName(){return 'KEV-FUSION-OBD-'+(ST.vin||'rapport')+'-'+new Date().toISOString().slice(0,10)+'.pdf'}
function dlPdf(){var b=pdfBlob();var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=pdfName();a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href)},6000);toast('📄 PDF téléchargé');beep('done')}
async function sharePdf(){
 var b=pdfBlob(),f=new File([b],pdfName(),{type:'application/pdf'});
 var rows=filtered();
 var txt='KEV FUSION — Rapport OBD\nVIN '+(ST.vin||'—')+' · '+(ST.km!=null?ST.km+' km':'km —')+
  '\n'+rows.length+' défaut(s) · '+rows.filter(function(r){return r.d.present}).length+' présent(s)'+
  '\nCodes : '+Array.from(new Set(rows.map(function(r){return r.d.code}))).join(', ');
 try{
  if(navigator.canShare&&navigator.canShare({files:[f]})){
   await navigator.share({files:[f],title:'Rapport OBD — KEV FUSION',text:txt});
   toast('📤 Rapport partagé');beep('done');return}
  if(navigator.share){await navigator.share({title:'Rapport OBD — KEV FUSION',text:txt});toast('📤 Résumé partagé');return}
 }catch(e){if(e&&e.name==='AbortError')return}
 dlPdf();
 try{await navigator.clipboard.writeText(txt);toast('📋 PDF téléchargé + résumé copié')}catch(e){}}
function exportJson(){
 var data={ts:new Date().toISOString(),vin:ST.vin,km:ST.km,brand:blabel(),protocol:ST.proto,volts:ST.volts,
  adapter:{name:T.name,version:E.version,link:T.link},scan:ST.lastScan,
  ecus:ST.ecus.map(function(e){return{tx:'0x'+h3(e.tx),name:e.name,serial:e.serial,part:e.part,hw:e.hw,sw:e.sw,session:e.session,km:e.km,
   dtc:(e.dtc||[]).map(function(d){return{code:d.code,status:'0x'+('0'+d.status.toString(16)).slice(-2).toUpperCase(),
    present:d.present,stored:d.stored,perm:d.perm,pend:d.pend,occurrences:d.occ,aging:d.age,healed:d.heal,label:d.label,
    variables:d.vars,records:d.records}})}}),
  cal:ST.cal,act:ST.act,log:ST.log.slice(0,400)};
 var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 a.download='KEV-FUSION-OBD-'+(ST.vin||'data')+'.json';a.click();toast('📤 JSON exporté')}

/* ══════════ UI ══════════ */
var TABS=[['dtc','📋 Défauts'],['jdd','🧊 JDD & occurrences'],['ecus','🧠 Calculateurs'],
 ['act','⚙️ Actionneurs & apprentissages'],['live','📈 Live'],['rapport','📄 Rapport'],['log','📜 Journal']];
function render(){
 var v=$('#view');if(!v)return;
 var a=T.avail(),last=LS.g('obdLast',null),rows=filtered();
 var nP=rows.filter(function(r){return r.d.present}).length,nS=rows.filter(function(r){return r.d.stored}).length;
 v.innerHTML=
 '<div class="ob-hero">'+
  '<div class="ob-hero-bg"></div>'+
  '<div class="ob-hero-in">'+
   '<div class="ob-hero-l">'+
    '<span class="ob-kicker">MODE ATELIER · ACCÈS SANS CLÉ</span>'+
    '<h1>Diagnostic tous calculateurs</h1>'+
    '<p>Lecture <b>présents &amp; mémorisés</b>, <b>occurrences</b> et <b>variables figées</b>, '+
    '<b>n° de série</b> et <b>kilométrage</b> automatiques, tests actionneurs et apprentissages, '+
    'rapport <b>PDF partageable</b>, injection directe dans l\'étude.</p>'+
   '</div>'+
   '<div class="ob-hero-r">'+
    '<div class="ob-stat"><b>'+ST.ecus.length+'</b><span>calculateurs</span></div>'+
    '<div class="ob-stat bad"><b>'+nP+'</b><span>présents</span></div>'+
    '<div class="ob-stat warn"><b>'+nS+'</b><span>mémorisés</span></div>'+
    '<div class="ob-stat info"><b>'+(ST.km!=null?ST.km.toLocaleString('fr-FR'):'—')+'</b><span>km</span></div>'+
   '</div>'+
  '</div>'+
 '</div>'+
 '<div class="ob-strip">'+
  '<span class="ob-pill '+(ST.conn?'ok':'ko')+'">'+(ST.conn?'● CONNECTÉ':'○ DÉCONNECTÉ')+'</span>'+
  (T.name?'<span class="ob-pill">'+esc(T.name)+'</span>':'')+
  (ST.proto?'<span class="ob-pill info">'+esc(ST.proto)+'</span>':'')+
  (ST.volts?'<span class="ob-pill">'+esc(ST.volts)+'</span>':'')+
  (ST.vin?'<span class="ob-pill mono">'+esc(ST.vin)+'</span>':'')+
  '<span class="ob-pill">'+esc(blabel())+'</span>'+
  '<span class="ob-pill ok">🔓 ATELIER · SANS CLÉ</span>'+
  (ST.studyN?'<span class="ob-pill ok">🧠 '+ST.studyN+' DTC → étude</span>':'')+
 '</div>'+
 '<div id="obBusy" class="ob-busy" style="display:none"></div>'+
 '<div class="ob-layout">'+
  '<section class="ob-main">'+
   '<div class="card ob-conn">'+
    '<h2>🔌 Connexion</h2>'+
    '<div class="grid g3">'+
     '<div><label>Transport</label><select id="obKind">'+
      '<option value="auto">🔄 Automatique</option>'+
      '<option value="ble"'+(a.ble?'':' disabled')+'>📶 Bluetooth LE 4.0 → 5.x</option>'+
      '<option value="serial"'+(a.serial?'':' disabled')+'>🔌 Série USB</option>'+
      '<option value="usb"'+(a.usb?'':' disabled')+'>🧩 WebUSB</option>'+
      '<option value="ws">🌐 Pont WebSocket</option>'+
      '<option value="demo">🧪 Démo atelier (flux complet)</option></select></div>'+
     '<div><label>Pont WebSocket</label><input id="obWs" placeholder="ws://192.168.1.20:35000" value="'+esc(LS.g('obdWs',''))+'"></div>'+
     '<div><label>Constructeur</label><select id="obBrand"><option value="auto">Auto (véhicule sélectionné)</option>'+
      Object.keys(DB.SCAN).map(function(k){return '<option value="'+k+'"'+(ST.brand===k?' selected':'')+'>'+esc(DB.SCAN[k].label)+'</option>'}).join('')+
     '</select></div>'+
    '</div>'+
    '<div class="row">'+
     '<button class="pri" data-ob="connect">🔗 Connecter</button>'+
     '<button data-ob="demo">🧪 Démo atelier</button>'+
     '<button data-ob="reconnect"'+(last?'':' disabled')+'>↻ Reconnecter</button>'+
     '<button class="danger" data-ob="disconnect">⏏ Déconnecter</button>'+
    '</div>'+
    '<p class="mut">Le mode atelier ouvre une <b>session étendue automatique</b> et interroge les services de lecture <b>ouverts</b> (UDS 0x19 / 0x22) : '+
    '<b>aucune clé d\'accès n\'est demandée</b> pour lire les défauts, les JDD, les séries et le kilométrage. '+
    'Les tests actionneurs et apprentissages sont tentés sans clé ; si un calculateur exige une sécurité, il est signalé explicitement.</p>'+
   '</div>'+
   '<div class="card">'+
    '<div class="row ob-tabs">'+TABS.map(function(t){
     return '<button class="ob-tab '+(ST.tab===t[0]?'on':'')+'" data-obtab="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'+
    '<div id="obTab"></div>'+
   '</div>'+
  '</section>'+
  '<aside class="ob-dock" id="obDock">'+
   '<div class="ob-dock-h"><b>🎛️ Réglages atelier</b><button class="ob-mini" data-ob="sound" id="obSound">'+(CFG.sound?'🔊':'🔇')+'</button></div>'+
   '<div class="ob-dock-b">'+
    '<div class="ob-c"><label>Profondeur de scan</label><select data-cfg="depth">'+
     '<option value="brand">Ciblé constructeur</option><option value="wide">Étendu 0x6A0–0x7BF</option>'+
     '<option value="full">Exhaustif 0x600–0x7FF</option></select></div>'+
    '<div class="ob-c"><label>Session diagnostic</label><select data-cfg="session">'+
     '<option value="auto">Auto étendue → défaut</option><option value="ext">Étendue only</option>'+
     '<option value="def">Défaut only</option></select></div>'+
    '<div class="ob-c"><label>Protocole</label><select data-cfg="proto">'+
     '<option value="auto">Automatique</option><option value="6">CAN 11b 500k</option><option value="7">CAN 29b 500k</option>'+
     '<option value="8">CAN 11b 250k</option><option value="9">CAN 29b 250k</option><option value="5">KWP fast</option>'+
     '<option value="4">KWP 5-baud</option><option value="3">ISO 9141</option></select></div>'+
    rng('timeout','Timeout requête',800,6000,'ms')+
    rng('tp','TesterPresent',600,4000,'ms')+
    rng('minOcc','Occurrence minimum',1,20,'×')+
    '<div class="ob-tgs">'+
     tg('fPresent','Présents')+tg('fStored','Mémorisés')+tg('fPerm','Permanents')+tg('fPend','En attente')+
     tg('autoKm','Km auto')+tg('autoInject','→ Étude auto')+tg('sweep','Balayage')+
    '</div>'+
    rng('density','Densité interface',85,120,'%')+
    rng('glow','Halo atelier',0,100,'%')+
    rng('grid','Grille fond',0,80,'')+
    rng('vol','Volume',0,100,'%')+
    '<div class="ob-cols">'+
     '<div><input type="color" data-cfg="c1" value="'+CFG.c1+'"><span>Signal</span></div>'+
     '<div><input type="color" data-cfg="c2" value="'+CFG.c2+'"><span>Data</span></div>'+
     '<div><input type="color" data-cfg="c3" value="'+CFG.c3+'"><span>Défaut</span></div>'+
    '</div>'+
    '<div class="ob-btns">'+
     '<button data-ob="reset">↺ Reset</button><button data-ob="rand">🎲 Aléatoire</button>'+
     '<button class="p" data-ob="pdf">📄 PDF</button>'+
     '<button class="b" data-ob="share">📤 Partager</button>'+
     '<button data-ob="json">🧬 JSON</button><button data-ob="inject">🧠 → Étude</button>'+
    '</div>'+
    '<p class="ob-note">Réglages appliqués <b>en direct</b>. Le scan, les filtres, les occurrences et le rendu du rapport suivent immédiatement.</p>'+
   '</div>'+
  '</aside>'+
 '</div>';
 applyTheme();paintTab();bind()}
function rng(k,l,mn,mx,u){
 return '<div class="ob-c"><label>'+l+' <b id="o_'+k+'">'+CFG[k]+(u||'')+'</b></label>'+
 '<input type="range" data-cfg="'+k+'" data-u="'+(u||'')+'" min="'+mn+'" max="'+mx+'" value="'+CFG[k]+'"></div>'}
function tg(k,l){return '<label class="ob-tg '+(CFG[k]?'on':'')+'" id="t_'+k+'"><input type="checkbox" data-cfgt="'+k+'"'+(CFG[k]?' checked':'')+'> '+l+'</label>'}
function applyTheme(){
 var r=document.documentElement.style;
 r.setProperty('--ob1',CFG.c1);r.setProperty('--ob2',CFG.c2);r.setProperty('--ob3',CFG.c3);
 r.setProperty('--obglow',(CFG.glow/100).toFixed(2));
 r.setProperty('--obgrid',(CFG.grid/100).toFixed(2));
 r.setProperty('--obden',(CFG.density/100).toFixed(2));
 document.body.classList.toggle('ob-sweep',!!CFG.sweep)}
function paintTab(){
 var h=$('#obTab');if(!h)return;
 if(ST.tab==='dtc')h.innerHTML=dtcView();
 else if(ST.tab==='jdd')h.innerHTML=jddView();
 else if(ST.tab==='ecus')h.innerHTML=ecuView();
 else if(ST.tab==='act')h.innerHTML=actView();
 else if(ST.tab==='live')h.innerHTML=liveView();
 else if(ST.tab==='rapport')h.innerHTML=rapportView();
 else h.innerHTML='<div class="ob-log" id="obLog">'+ST.log.slice(0,240).map(function(x){
  return '<div class="ol-'+x.l+'"><i>'+esc(x.t.slice(11,19))+'</i>'+esc(x.m)+'</div>'}).join('')+'</div>';
 if(ST.tab==='dtc')paintDtc();if(ST.tab==='ecus')paintEcus();if(ST.tab==='live')paintLive();
 if(ST.tab==='act'){paintAct();paintCal()}}
function dtcView(){
 return '<div class="row" style="margin-bottom:12px">'+
 '<button class="pri" data-ob="scan">🔎 Scanner tous les calculateurs</button>'+
 '<button class="pri" data-ob="read">📋 Lire présents + mémorisés + JDD</button>'+
 '<button data-ob="kwp">🔌 KWP2000</button>'+
 '<button class="danger" data-ob="clear">🧹 Effacer tout</button></div>'+
 '<div id="obDtc"></div>'}
function paintDtc(){
 var el=$('#obDtc');if(!el)return;
 var rows=filtered();
 if(!ST.ecus.length){el.innerHTML='<div class="ob-empty">Lancez le <b>scan atelier</b> puis la lecture. '+
  'Sans matériel, <b>Démo atelier</b> déroule le flux complet (8 calculateurs, défauts, occurrences, km, PDF).</div>';return}
 if(!rows.length){el.innerHTML='<div class="ob-empty ok">✅ Aucun défaut pour les filtres actifs.</div>';return}
 var by={};rows.forEach(function(r){(by[r.ecu]=by[r.ecu]||[]).push(r)});
 el.innerHTML=Object.keys(by).map(function(k){
  return '<div class="ob-ecu"><div class="ob-ecu-h"><b>'+esc(k)+'</b>'+
   '<span class="ob-pill mono">0x'+h3(by[k][0].tx)+'</span><span class="ob-pill">'+by[k].length+' défaut(s)</span></div>'+
   by[k].map(function(r){var d=r.d;
    return '<div class="ob-dtc '+(d.present?'now':'mem')+'">'+
     '<div class="ob-dtc-h"><span class="ob-code">'+esc(d.code)+'</span>'+
      '<span class="ob-occ">×'+(d.occ||1)+'</span>'+
      (d.age!=null?'<span class="ob-pill">vieill. '+d.age+'</span>':'')+
      (d.heal!=null?'<span class="ob-pill">guérison '+d.heal+'</span>':'')+
      '<span class="ob-pill mono">0x'+('0'+d.status.toString(16)).slice(-2).toUpperCase()+'</span></div>'+
     '<div class="ob-tags">'+statusTags(d.status)+'</div>'+
     (d.label?'<p class="ob-lbl">'+esc(d.label)+'</p>':'')+
     (d.vars&&d.vars.length?'<div class="ob-vars">'+d.vars.slice(0,14).map(function(v){
      return '<span class="ob-var"><i>'+esc(v.n)+'</i><b>'+esc(String(v.v))+'</b><em>'+esc(v.u||'')+'</em></span>'}).join('')+'</div>':'')+
     '</div>'}).join('')+'</div>'}).join('')}
function jddView(){
 var rows=filtered();
 if(!rows.length)return '<div class="ob-empty">Lancez la lecture pour afficher les images figées, données étendues, occurrences et variables.</div>';
 return '<p class="mut">Chaque défaut expose son <b>statut bit à bit</b>, son <b>compteur d\'occurrences</b>, de vieillissement et de guérison, '+
  'ainsi que les <b>variables figées</b> au moment du défaut (régime, température, tension, vitesse, kilométrage…).</p>'+
 rows.map(function(r){var d=r.d;
  return '<div class="ob-ecu"><div class="ob-ecu-h"><span class="ob-code">'+esc(d.code)+'</span>'+
   '<b>'+esc(r.ecu)+'</b><span class="ob-occ">×'+(d.occ||1)+'</span></div>'+
   '<div class="ob-tags">'+statusTags(d.status)+'</div>'+
   '<table class="ob-tbl"><tr><td>Occurrences</td><td><b>'+(d.occ||1)+'</b></td></tr>'+
   '<tr><td>Vieillissement</td><td>'+(d.age!=null?d.age:'—')+'</td></tr>'+
   '<tr><td>Guérison</td><td>'+(d.heal!=null?d.heal:'—')+'</td></tr>'+
   '<tr><td>Statut brut</td><td class="mono">0x'+('0'+d.status.toString(16)).slice(-2).toUpperCase()+'</td></tr></table>'+
   (d.vars&&d.vars.length?'<table class="ob-tbl"><tr><td colspan="2"><b>Variables / conditions figées</b></td></tr>'+
    d.vars.map(function(v){return '<tr><td>'+esc(v.n)+' <i class="mono">'+esc(v.id)+'</i></td><td><b>'+esc(String(v.v))+'</b> '+esc(v.u||'')+'</td></tr>'}).join('')+'</table>':
    '<p class="mut">Aucune variable figée disponible pour ce défaut.</p>')+
   (d.records||[]).map(function(rec){return '<div class="ob-rec"><b>'+esc(rec.type)+'</b><pre>'+esc(rec.raw)+'</pre></div>'}).join('')+
   '</div>'}).join('')}
function ecuView(){
 return '<div class="row" style="margin-bottom:12px">'+
 '<button class="pri" data-ob="scan">🔎 Scan atelier</button>'+
 '<button data-ob="scandeep">🌐 Scan exhaustif 0x600–0x7FF</button>'+
 '<button data-ob="kwp">🔌 KWP2000</button></div><div id="obEcus"></div>'}
function paintEcus(){
 var el=$('#obEcus');if(!el)return;
 if(!ST.ecus.length){el.innerHTML='<div class="ob-empty">Aucun calculateur. Lancez le scan (contact mis).</div>';return}
 el.innerHTML='<table class="ob-tbl wide"><tr><td><b>Adresse</b></td><td><b>Calculateur / identification automatique</b></td><td><b>Défauts</b></td></tr>'+
 ST.ecus.map(function(e){
  return '<tr><td><span class="ob-pill mono">0x'+h3(e.tx)+'→0x'+h3(e.rx)+'</span><br><span class="ob-pill">session '+(e.session||1)+'</span></td>'+
   '<td><b>'+esc(e.name)+'</b>'+
   '<div class="ob-kv"><span>Série</span><b>'+esc(e.serial||'—')+'</b></div>'+
   '<div class="ob-kv"><span>Pièce</span><b>'+esc(e.part||'—')+'</b></div>'+
   '<div class="ob-kv"><span>HW / SW</span><b>'+esc(e.hw||'—')+' / '+esc(e.sw||'—')+'</b></div>'+
   (e.km!=null?'<div class="ob-kv"><span>Kilométrage</span><b>'+e.km.toLocaleString('fr-FR')+' km <i class="mono">'+esc(e.kmDid)+'</i></b></div>':'')+
   '</td><td>'+(e.dtc?'<span class="ob-pill '+(e.dtc.length?'ko':'ok')+'">'+e.dtc.length+'</span>':'<span class="ob-pill">—</span>')+'</td></tr>'}).join('')+'</table>'}
function actView(){
 var opts=ST.ecus.map(function(e){return '<option value="'+e.tx+'">0x'+h3(e.tx)+' — '+esc(e.name)+'</option>'}).join('')||'<option value="">— lancez le scan —</option>';
 var ga={},gc={};DB.ACT.forEach(function(a){(ga[a.g]=ga[a.g]||[]).push(a)});DB.CAL.forEach(function(c){(gc[c.g]=gc[c.g]||[]).push(c)});
 return '<div class="ob-warnbox">Exécution <b>sans clé d\'accès</b>. Si un calculateur exige une sécurité (NRC 0x33), elle est '+
  '<b>signalée</b> et jamais contournée. Véhicule à l\'arrêt, frein serré, batterie stabilisée.</div>'+
 '<div class="row" style="margin:12px 0"><button class="danger" data-ob="actstop">⏹ ARRÊT GLOBAL · retour état normal</button></div>'+
 '<div class="card"><h3>⚙️ Tests actionneurs</h3><div><label>Calculateur cible</label><select id="obActEcu">'+opts+'</select></div>'+
 Object.keys(ga).map(function(g){return '<div class="ob-grp"><b>'+esc(g)+'</b><div class="grid g2">'+ga[g].map(function(a){
  return '<div class="ob-tool"><b>'+esc(a.n)+'</b><p>'+esc(a.risk)+' · '+Math.round(a.dur/1000)+' s</p>'+
   '<div class="row"><input id="act_'+a.id+'" value="'+esc(a.did)+'" style="max-width:96px" title="DID">'+
   '<input id="actp_'+a.id+'" placeholder="params" style="max-width:96px">'+
   '<button class="pri" data-obact="'+a.id+'">▶️</button></div></div>'}).join('')+'</div></div>'}).join('')+
 '<div id="obActRun"></div></div>'+
 '<div class="card"><h3>🔧 Apprentissages / calibrages</h3><div><label>Calculateur cible</label><select id="obCalEcu">'+opts+'</select></div>'+
 Object.keys(gc).map(function(g){return '<div class="ob-grp"><b>'+esc(g)+'</b>'+gc[g].map(function(c){
  return '<div class="ob-tool wide"><b>'+esc(c.n)+'</b><p>Risque : '+esc(c.risk)+' · '+c.steps.length+' étapes</p>'+
   '<details><summary>Étapes &amp; après-intervention</summary><ol>'+c.steps.map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+
   '</ol><p class="mut"><b>Après :</b> '+esc(c.post)+'</p></details>'+
   '<div class="row"><input id="cal_'+c.id+'" value="'+esc(c.did)+'" style="max-width:96px" title="DID routine">'+
   '<button class="pri" data-obcal="'+c.id+'">▶️ Exécuter</button></div></div>'}).join('')+'</div>'}).join('')+
 '<div id="obCalRun"></div></div>'}
function stepBox(o,title){
 if(!o)return '';
 return '<div class="ob-run"><b>'+esc(title)+'</b> <span class="ob-pill">'+esc(o.e.name)+'</span>'+
  (o.done?'<span class="ob-pill ok">terminé</span>':'<span class="ob-pill info">en cours</span>')+
  (o.pre?'<div class="ob-pre">'+o.pre.items.map(function(i){
   return '<span class="'+(i.ok===true?'ok':i.ok===false?'ko':'na')+'">'+(i.ok===true?'✅':i.ok===false?'❌':'ℹ️')+' '+esc(i.l)+' : '+esc(i.v)+'</span>'}).join('')+'</div>':'')+
  '<table class="ob-tbl">'+o.steps.map(function(s,i){
   return '<tr><td>'+(i+1)+'</td><td>'+esc(s.t)+'<br><b class="'+(s.ok===false?'ko':'ok')+'">'+esc(s.r)+'</b>'+
    (s.locked?'<br><span class="ob-lock">🔒 Sécurité calculateur — non contournée</span>':'')+'</td></tr>'}).join('')+'</table></div>'}
function paintAct(){var e=$('#obActRun');if(e)e.innerHTML=stepBox(ST.act,'⚙️ '+((ST.act||{}).a||{}).n)}
function paintCal(){var e=$('#obCalRun');if(e)e.innerHTML=stepBox(ST.cal,'🔧 '+((ST.cal||{}).c||{}).n)}
function liveView(){
 return '<div class="row" style="margin-bottom:12px"><button class="pri" data-ob="liveon">▶️ Flux live</button>'+
 '<button data-ob="liveoff">⏹ Arrêter</button></div><div id="obLive" class="ob-live"></div>'}
function paintLive(){
 var e=$('#obLive');if(!e)return;
 if(!ST.live.length){e.innerHTML='<div class="ob-empty">Démarrez le flux pour lire les paramètres en temps réel.</div>';return}
 e.innerHTML=ST.live.map(function(i){
  return '<div class="ob-gauge"><span>'+esc(i.n)+'</span><b>'+esc(String(i.v))+'</b><em>'+esc(i.u)+'</em></div>'}).join('')}
function rapportView(){
 var rows=filtered();
 var nP=rows.filter(function(r){return r.d.present}).length,nS=rows.filter(function(r){return r.d.stored}).length;
 var codes=Array.from(new Set(rows.map(function(r){return r.d.code})));
 return '<div class="ob-rap">'+
 '<div class="ob-rap-h"><b>Rapport de diagnostic</b><span class="ob-pill">'+new Date().toLocaleDateString('fr-FR')+'</span></div>'+
 '<table class="ob-tbl"><tr><td>VIN</td><td class="mono">'+esc(ST.vin||'—')+'</td></tr>'+
 '<tr><td>Kilométrage</td><td><b>'+(ST.km!=null?ST.km.toLocaleString('fr-FR')+' km':'—')+'</b></td></tr>'+
 '<tr><td>Calculateurs</td><td>'+ST.ecus.length+'</td></tr>'+
 '<tr><td>Défauts retenus</td><td><b>'+rows.length+'</b> ('+nP+' présents · '+nS+' mémorisés)</td></tr>'+
 '<tr><td>Codes uniques</td><td class="mono">'+esc(codes.join(' ')||'—')+'</td></tr>'+
 '<tr><td>Injection étude</td><td>'+(CFG.autoInject?'✅ automatique':'manuelle')+(ST.studyN?' · '+ST.studyN+' codes':'')+'</td></tr></table>'+
 '<div class="row" style="margin-top:14px">'+
  '<button class="pri" data-ob="pdf">📄 Générer le PDF</button>'+
  '<button class="b" data-ob="share">📤 Partager le PDF</button>'+
  '<button data-ob="json">🧬 Export JSON</button>'+
  '<button data-ob="inject">🧠 Injecter dans l\'étude</button></div>'+
 '<p class="mut">Le PDF est généré localement (aucun envoi serveur) : en-tête, véhicule, kilométrage, n° de série de chaque calculateur, '+
 'défauts avec statuts, occurrences, variables figées et traces des apprentissages/actionneurs. Le partage utilise le partage natif de l\'appareil.</p>'+
 '</div>'}
function bind(){
 var v=$('#view');if(!v||v._b2)return;v._b2=1;
 v.addEventListener('input',function(e){
  var k=e.target.dataset.cfg;
  if(k){CFG[k]=e.target.type==='range'?+e.target.value:e.target.value;
   var o=$('#o_'+k);if(o)o.textContent=CFG[k]+(e.target.dataset.u||'');
   save();applyTheme();
   if(k==='vol')AU.vol=CFG.vol/100;
   if(k==='tp'&&ST.conn)startTP();
   if(['minOcc','timeout'].indexOf(k)>=0)paintDtc();
   return}
  var t=e.target.dataset.cfgt;
  if(t){CFG[t]=e.target.checked;var w=$('#t_'+t);if(w)w.classList.toggle('on',CFG[t]);save();paintTab();return}
  if(e.target.id==='obWs')LS.s('obdWs',e.target.value)});
 v.addEventListener('change',function(e){
  var k=e.target.dataset.cfg;
  if(k&&e.target.tagName==='SELECT'){CFG[k]=e.target.value;save();if(k==='tp'&&ST.conn)startTP();paintTab()}
  if(e.target.id==='obBrand'){ST.brand=e.target.value;LS.s('obdBrand',ST.brand);render()}});
 v.addEventListener('click',async function(e){
  var tb=e.target.closest('[data-obtab]');if(tb){ST.tab=tb.dataset.obtab;render();return}
  var ac2=e.target.closest('[data-obact]');if(ac2){await runAct(ac2.dataset.obact);return}
  var cl=e.target.closest('[data-obcal]');if(cl){await runCal(cl.dataset.obcal);return}
  var b=e.target.closest('[data-ob]');if(!b)return;
  var k=b.dataset.ob;
  if(k==='connect')await connect($('#obKind').value);
  else if(k==='demo'){demoReset();await connect('demo')}
  else if(k==='reconnect'){var l=LS.g('obdLast',null);await connect(l?l.kind:'auto')}
  else if(k==='disconnect')await disconnect();
  else if(k==='scan')await scan(false);
  else if(k==='scandeep'){CFG.depth='full';save();await scan(false);CFG.depth='brand';save()}
  else if(k==='kwp')await kwp();
  else if(k==='read')await readAll();
  else if(k==='clear')await clearAll();
  else if(k==='actstop')await actStop();
  else if(k==='liveon')startLive();
  else if(k==='liveoff'){stopLive();paintLive()}
  else if(k==='pdf')dlPdf();
  else if(k==='share')await sharePdf();
  else if(k==='json')exportJson();
  else if(k==='inject'){var c=Array.from(new Set(filtered().map(function(r){return r.d.code})));
   injectStudy(c);ST.studyN=c.length;toast('🧠 '+c.length+' DTC → « DTC lus sur le véhicule »');render()}
  else if(k==='sound'){CFG.sound=!CFG.sound;AU.on=CFG.sound;save();
   var s=$('#obSound');if(s)s.textContent=CFG.sound?'🔊':'🔇';if(CFG.sound)beep('ok')}
  else if(k==='reset'){CFG=Object.assign({},DEF);save();AU.on=CFG.sound;AU.vol=CFG.vol/100;render();toast('↺ Réglages réinitialisés')}
  else if(k==='rand'){
   var pal=[['#22c55e','#38bdf8','#ff4d6d'],['#a3e635','#22d3ee','#ff7a1a'],['#ffb020','#38bdf8','#ff4d6d'],
    ['#39ff88','#7c5cff','#ff3b6b'],['#00e5a0','#4cc9f0','#f72585']];
   var p=pal[Math.floor(Math.random()*pal.length)];CFG.c1=p[0];CFG.c2=p[1];CFG.c3=p[2];
   CFG.glow=25+Math.floor(Math.random()*70);CFG.grid=Math.floor(Math.random()*70);
   CFG.density=90+Math.floor(Math.random()*28);save();render();toast('🎲 Thème atelier généré')}
 })}

/* ══════════ CSS ══════════ */
function css(){
 if($('#obCss2'))return;var s=document.createElement('style');s.id='obCss2';
 s.textContent=
 ':root{--ob1:#22c55e;--ob2:#38bdf8;--ob3:#ff4d6d;--obglow:.58;--obgrid:.34;--obden:1}'+
 '.ob-hero{position:relative;border-radius:20px;overflow:hidden;margin-bottom:14px;border:1px solid #1e5236;'+
  'background:linear-gradient(135deg,#04140c,#0a2a1a 42%,#0d1a2e 78%,#1a0f1c);box-shadow:0 20px 54px #000b}'+
 '.ob-hero-bg{position:absolute;inset:0;opacity:var(--obgrid);'+
  'background-image:linear-gradient(var(--ob1)22 1px,transparent 1px),linear-gradient(90deg,var(--ob1)22 1px,transparent 1px);'+
  'background-size:34px 34px;mask-image:radial-gradient(70% 70% at 30% 30%,#000,transparent)}'+
 '.ob-hero::after{content:"";position:absolute;inset:0;pointer-events:none;'+
  'background:radial-gradient(46% 60% at 18% 10%,var(--ob1),transparent 62%),radial-gradient(40% 50% at 88% 90%,var(--ob2),transparent 60%);'+
  'opacity:calc(var(--obglow)*.34);mix-blend-mode:screen}'+
 'body.ob-sweep .ob-hero::before{content:"";position:absolute;top:0;bottom:0;width:34%;pointer-events:none;'+
  'background:linear-gradient(90deg,transparent,var(--ob1)55,transparent);animation:obSweep 5.2s linear infinite;opacity:.5}'+
 '@keyframes obSweep{0%{left:-40%}100%{left:110%}}'+
 '.ob-hero-in{position:relative;display:flex;gap:20px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;padding:22px}'+
 '.ob-hero-l{flex:1;min-width:270px}'+
 '.ob-kicker{display:inline-block;font:800 10px/1 system-ui;letter-spacing:1.6px;color:#04140c;'+
  'background:linear-gradient(90deg,var(--ob1),var(--ob2));padding:6px 11px;border-radius:8px;margin-bottom:10px}'+
 '.ob-hero h1{font-size:27px;margin:0 0 8px;color:#f2fbf4;letter-spacing:-.4px}'+
 '.ob-hero p{margin:0;font-size:13px;color:#9fc4ad;line-height:1.6;max-width:640px}'+
 '.ob-hero p b{color:#e8f7ec}'+
 '.ob-hero-r{display:flex;gap:10px;flex-wrap:wrap}'+
 '.ob-stat{min-width:88px;padding:11px 13px;border-radius:14px;background:#04140ccc;border:1px solid #1e5236;text-align:center}'+
 '.ob-stat b{display:block;font-size:23px;font-weight:900;color:var(--ob1);line-height:1.1}'+
 '.ob-stat.bad b{color:var(--ob3)}.ob-stat.warn b{color:#ffb020}.ob-stat.info b{color:var(--ob2);font-size:17px}'+
 '.ob-stat span{font-size:9.5px;letter-spacing:.9px;text-transform:uppercase;color:#7fa78e}'+
 '.ob-strip{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}'+
 '.ob-pill{font:700 10.5px/1 system-ui;padding:6px 10px;border-radius:20px;border:1px solid #25314a;background:#0f1625;color:#c4cfe0;white-space:nowrap}'+
 '.ob-pill.ok{border-color:var(--ob1);color:var(--ob1);background:#22c55e14}'+
 '.ob-pill.ko{border-color:var(--ob3);color:var(--ob3);background:#ff4d6d14}'+
 '.ob-pill.info{border-color:var(--ob2);color:var(--ob2);background:#38bdf814}'+
 '.ob-pill.mono{font-family:ui-monospace,monospace;letter-spacing:.5px}'+
 '.ob-busy{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:12px;margin-bottom:12px;'+
  'background:#38bdf812;border:1px solid var(--ob2);color:var(--ob2);font-size:12.5px;font-weight:700}'+
 '.ob-spin{width:14px;height:14px;border-radius:50%;border:2px solid var(--ob2);border-top-color:transparent;animation:obSpin .7s linear infinite}'+
 '@keyframes obSpin{to{transform:rotate(360deg)}}'+
 '.ob-layout{display:grid;grid-template-columns:minmax(0,1fr) 316px;gap:14px;align-items:start}'+
 '@media(max-width:1060px){.ob-layout{grid-template-columns:1fr}}'+
 '.ob-main{min-width:0}'+
 '.ob-conn h2{margin-bottom:12px}'+
 '.ob-tabs{gap:6px;margin-bottom:14px}'+
 '.ob-tab{border-radius:20px;padding:8px 14px;font-size:12px;font-weight:800;border:1px solid #25314a;background:#0f1625;color:#c4cfe0;cursor:pointer}'+
 '.ob-tab:hover{border-color:var(--ob1);color:var(--ob1)}'+
 '.ob-tab.on{background:linear-gradient(135deg,var(--ob1),var(--ob2));border-color:var(--ob1);color:#04140c}'+
 '.ob-empty{padding:22px;border-radius:14px;border:1px dashed #334466;background:#0f1625;color:#8899b4;font-size:13px;line-height:1.6;text-align:center}'+
 '.ob-empty.ok{border-color:var(--ob1);color:var(--ob1);background:#22c55e10}'+
 '.ob-empty b{color:#e8eefc}'+
 '.ob-ecu{border:1px solid #25314a;border-radius:14px;background:#0f1625;padding:12px;margin-bottom:12px}'+
 '.ob-ecu-h{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #25314a}'+
 '.ob-ecu-h b{font-size:13.5px;color:#e8eefc}'+
 '.ob-dtc{border-left:3px solid #ffb020;border-radius:10px;background:#141c2e;padding:11px;margin-bottom:9px}'+
 '.ob-dtc.now{border-left-color:var(--ob3);background:linear-gradient(90deg,#ff4d6d12,#141c2e 40%)}'+
 '.ob-dtc-h{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:7px}'+
 '.ob-code{font:900 16px/1 ui-monospace,monospace;color:var(--ob3);letter-spacing:1px}'+
 '.ob-occ{font:900 12px/1 system-ui;color:#04140c;background:#ffb020;padding:4px 8px;border-radius:8px}'+
 '.ob-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px}'+
 '.ob-tag{font:700 9.5px/1 system-ui;padding:4px 8px;border-radius:12px;border:1px solid #334466;color:#8899b4}'+
 '.ob-tag.t-bad{border-color:var(--ob3);color:var(--ob3);background:#ff4d6d14}'+
 '.ob-tag.t-warn{border-color:#ffb020;color:#ffb020;background:#ffb02014}'+
 '.ob-tag.t-fire{border-color:#ff7a1a;color:#ff7a1a;background:#ff7a1a14}'+
 '.ob-tag.t-dim{opacity:.6}'+
 '.ob-lbl{margin:4px 0 8px;font-size:12.5px;color:#c4cfe0}'+
 '.ob-vars{display:flex;gap:6px;flex-wrap:wrap}'+
 '.ob-var{display:inline-flex;align-items:baseline;gap:5px;padding:5px 9px;border-radius:10px;background:#0a0f1a;border:1px solid #25314a}'+
 '.ob-var i{font-style:normal;font-size:9.5px;color:#7f8fa6;text-transform:uppercase;letter-spacing:.4px}'+
 '.ob-var b{font:800 12px/1 ui-monospace,monospace;color:var(--ob2)}'+
 '.ob-var em{font-style:normal;font-size:9px;color:#5a6a84}'+
 '.ob-tbl{width:100%;border-collapse:collapse;font-size:12.5px;margin:8px 0}'+
 '.ob-tbl td{border-bottom:1px solid #25314a;padding:7px 8px;vertical-align:top;color:#c4cfe0}'+
 '.ob-tbl td:first-child{color:#8899b4;width:34%}'+
 '.ob-tbl.wide td:first-child{width:20%}'+
 '.ob-tbl b{color:#e8eefc}.ob-tbl .mono{font-family:ui-monospace,monospace}'+
 '.ob-kv{display:flex;gap:8px;font-size:11.5px;margin-top:3px}'+
 '.ob-kv span{color:#7f8fa6;min-width:78px}.ob-kv b{color:#c4cfe0;font-weight:600}'+
 '.ob-kv .mono{font-family:ui-monospace,monospace;color:#5a6a84;font-style:normal}'+
 '.ob-rec{margin-top:8px}.ob-rec b{font-size:11px;color:var(--ob2)}'+
 '.ob-rec pre{margin:4px 0 0;background:#04140c;border:1px solid #1e5236;border-radius:9px;padding:9px;'+
  'font:10.5px/1.5 ui-monospace,monospace;color:var(--ob1);overflow:auto;max-height:110px;white-space:pre-wrap;word-break:break-all}'+
 '.ob-warnbox{padding:11px 13px;border-radius:12px;background:#ffb02010;border:1px solid #ffb020;color:#ffd8a0;font-size:12.5px;line-height:1.6}'+
 '.ob-warnbox b{color:#ffb020}'+
 '.ob-grp{margin:12px 0}.ob-grp>b{display:block;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--ob1);margin-bottom:8px}'+
 '.ob-tool{border:1px solid #25314a;border-radius:12px;background:#0f1625;padding:11px;margin-bottom:8px}'+
 '.ob-tool b{font-size:12.5px;color:#e8eefc}.ob-tool p{margin:4px 0 8px;font-size:11px;color:#8899b4}'+
 '.ob-tool details{margin:6px 0}.ob-tool summary{cursor:pointer;font-size:11.5px;color:var(--ob2)}'+
 '.ob-tool ol{margin:6px 0 6px 18px;font-size:11.5px;color:#8899b4;line-height:1.7}'+
 '.ob-tool input{margin:0}'+
 '.ob-run{border:1px solid var(--ob1);border-radius:14px;background:#22c55e0d;padding:12px;margin-top:12px}'+
 '.ob-run>b{font-size:13px;color:#e8eefc}'+
 '.ob-pre{display:flex;gap:6px;flex-wrap:wrap;margin:9px 0}'+
 '.ob-pre span{font-size:11px;padding:5px 9px;border-radius:10px;border:1px solid #334466;color:#8899b4}'+
 '.ob-pre .ok{border-color:var(--ob1);color:var(--ob1)}.ob-pre .ko{border-color:var(--ob3);color:var(--ob3)}'+
 '.ob-run .ko{color:var(--ob3)}.ob-run .ok{color:var(--ob1)}'+
 '.ob-lock{font-size:11px;color:#ffb020}'+
 '.ob-live{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:10px}'+
 '.ob-gauge{border:1px solid #25314a;border-radius:14px;background:linear-gradient(160deg,#0f1625,#141c2e);padding:13px;text-align:center}'+
 '.ob-gauge span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#7f8fa6;min-height:26px}'+
 '.ob-gauge b{display:block;font:900 21px/1.1 ui-monospace,monospace;color:var(--ob1);margin:4px 0}'+
 '.ob-gauge em{font-style:normal;font-size:9.5px;color:#5a6a84}'+
 '.ob-rap{border:1px solid #25314a;border-radius:14px;background:#0f1625;padding:14px}'+
 '.ob-rap-h{display:flex;gap:10px;align-items:center;margin-bottom:10px}'+
 '.ob-rap-h b{font-size:14px;color:#e8eefc}'+
 '.ob-log{max-height:340px;overflow:auto;background:#04140c;border:1px solid #1e5236;border-radius:12px;padding:11px;'+
  'font:11px/1.6 ui-monospace,monospace}'+
 '.ob-log i{font-style:normal;color:#5a6a84;margin-right:8px}'+
 '.ol-ok{color:var(--ob1)}.ol-warn{color:#ffb020}.ol-err{color:var(--ob3)}.ol-info{color:#c4cfe0}'+
 '.ob-flash{animation:obFlash 1.4s ease-out}'+
 '@keyframes obFlash{0%,100%{box-shadow:0 0 0 0 transparent}30%{box-shadow:0 0 0 4px var(--ob1)}}'+
 /* dock */
 '.ob-dock{position:sticky;top:76px;max-height:calc(100vh - 96px);display:flex;flex-direction:column;'+
  'border:1px solid #1e5236;border-radius:18px;overflow:hidden;background:linear-gradient(168deg,#06180fF2,#101c2eF2 70%);'+
  'box-shadow:0 18px 48px #000b,0 0 0 1px #22c55e1e;backdrop-filter:blur(12px)}'+
 '@media(max-width:1060px){.ob-dock{position:static;max-height:none}}'+
 '.ob-dock-h{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid #1e5236;'+
  'background:linear-gradient(90deg,#22c55e1a,transparent)}'+
 '.ob-dock-h b{flex:1;font-size:12.5px;color:#e8f7ec}'+
 '.ob-mini{background:#0f1625;border:1px solid #334466;color:#c4cfe0;border-radius:9px;padding:5px 9px;cursor:pointer;font-size:14px}'+
 '.ob-mini:hover{border-color:var(--ob1)}'+
 '.ob-dock-b{flex:1;overflow:auto;padding:13px 14px 16px;font-size:calc(13px*var(--obden))}'+
 '.ob-dock-b::-webkit-scrollbar,.ob-log::-webkit-scrollbar,.ob-rec pre::-webkit-scrollbar{width:10px;height:10px}'+
 '.ob-dock-b::-webkit-scrollbar-track,.ob-log::-webkit-scrollbar-track,.ob-rec pre::-webkit-scrollbar-track{background:#04140c;border-radius:8px}'+
 '.ob-dock-b::-webkit-scrollbar-thumb,.ob-log::-webkit-scrollbar-thumb,.ob-rec pre::-webkit-scrollbar-thumb{'+
  'background:linear-gradient(var(--ob1),var(--ob2));border-radius:8px;border:2px solid #04140c}'+
 '.ob-dock-b::-webkit-scrollbar-thumb:hover{background:var(--ob1)}'+
 '.ob-dock-b,.ob-log,.ob-rec pre{scrollbar-width:thin;scrollbar-color:var(--ob1) #04140c}'+
 '.ob-c{margin-bottom:11px}'+
 '.ob-c label{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:4px;'+
  'font-size:9.5px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:#7fa78e}'+
 '.ob-c label b{color:var(--ob1);font-family:ui-monospace,monospace;font-size:10.5px}'+
 '.ob-c select{width:100%;background:#0f1625;border:1px solid #334466;color:#e8eefc;border-radius:9px;padding:8px 10px;font-size:12px;margin:0}'+
 '.ob-c select:focus{outline:none;border-color:var(--ob1);box-shadow:0 0 0 3px #22c55e2e}'+
 '.ob-c input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:2px 0 0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--ob1),var(--ob2),var(--ob3))}'+
 '.ob-c input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;'+
  'background:#f2fbf4;border:3px solid var(--ob1);box-shadow:0 0 10px var(--ob1);cursor:grab}'+
 '.ob-c input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#f2fbf4;border:3px solid var(--ob1);cursor:grab}'+
 '.ob-tgs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:11px}'+
 '.ob-tg{display:flex;align-items:center;gap:6px;font-size:10.5px;color:#7fa78e;background:#0f1625;border:1px solid #334466;'+
  'border-radius:18px;padding:5px 10px;cursor:pointer;user-select:none}'+
 '.ob-tg input{width:auto;margin:0;accent-color:var(--ob1)}'+
 '.ob-tg.on{color:var(--ob1);border-color:var(--ob1);background:#22c55e14}'+
 '.ob-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:11px}'+
 '.ob-cols div{display:flex;flex-direction:column;align-items:center;gap:3px}'+
 '.ob-cols input[type=color]{width:100%;height:32px;border:1px solid #334466;border-radius:9px;background:#0f1625;padding:2px;cursor:pointer;margin:0}'+
 '.ob-cols span{font-size:9px;color:#5a6a84}'+
 '.ob-btns{display:grid;grid-template-columns:1fr 1fr;gap:7px}'+
 '.ob-btns button{border-radius:10px;padding:10px;font-size:11.5px;font-weight:800;cursor:pointer;border:1px solid #334466;background:#0f1625;color:#e8eefc}'+
 '.ob-btns button:hover{border-color:var(--ob1);transform:translateY(-1px)}'+
 '.ob-btns .p{background:linear-gradient(135deg,var(--ob1),var(--ob2));border-color:var(--ob1);color:#04140c}'+
 '.ob-btns .b{background:linear-gradient(135deg,#1f6f54,#3fa382);border-color:#1f6f54;color:#fff}'+
 '.ob-note{font-size:10px;color:#7fa78e;line-height:1.55;margin:11px 0 0}.ob-note b{color:#e8f7ec}';
 document.head.appendChild(s)}

/* ══════════ NAV / BOOT ══════════ */
function hook(){
 try{
  if(typeof NAV!=='undefined'&&Array.isArray(NAV)&&!NAV.some(function(n){return n[0]==='obdpro'})){
   var i=NAV.findIndex(function(n){return n[0]==='obd'});NAV.splice(i<0?NAV.length:i+1,0,['obdpro','🔌 OBD Atelier'])}
  if(typeof window.switchView==='function'&&!window.switchView.__obA){
   var _s=window.switchView;
   var w=function(v){if(v!=='obdpro'){stopLive();return _s(v)}
    if(typeof S!=='undefined')S.view='obdpro';
    var n=$('#nav');if(n&&typeof NAV!=='undefined')n.innerHTML=NAV.map(function(x){
     return '<button data-act="nav" data-k="'+x[0]+'" class="'+(x[0]==='obdpro'?'act':'')+'">'+x[1]+'</button>'}).join('');
    render()};
   w.__obA=true;window.switchView=w}
  hookStudy();
 }catch(e){}}
function boot(){css();hook();applyTheme();
 window.addEventListener('beforeunload',function(){stopLive();stopTP()});
 document.addEventListener('visibilitychange',function(){if(document.hidden)stopLive()});
 var s=LS.g('studyDtc','');if(s){try{if(typeof S!=='undefined'&&!S.dtc)S.dtc=s.split(/\s+/).filter(Boolean)}catch(e){}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFObdPro={connect:connect,scan:scan,read:readAll,pdf:dlPdf,share:sharePdf,json:exportJson,
 inject:function(){injectStudy(Array.from(new Set(filtered().map(function(r){return r.d.code}))))},
 state:ST,cfg:CFG,elm:E,uds:U,transport:T,render:render};
})();
