/* KEV FUSION 2026 — obdpro.js v1.0.0
   OBD PRO : connexion Bluetooth sans friction (BLE 4.0→5.x, auto-découverte GATT),
   + Web Serial / WebUSB / pont WebSocket / démo.
   ELM327/STN : init adaptative, protocole auto, CAN 11/29 bits, ISO-TP.
   UDS ISO 14229 + KWP2000 ISO 14230 : lecture DTC / JDD (freeze frames, historique,
   compteurs, conditions), scan et identification de TOUS les calculateurs (BSI included),
   live data, calibrages assistés (moteur, BV mécanique/automatique/robotisée), tests actionneurs.
   Sécurité : lecture seule par défaut, mode atelier explicite, conditions préalables vérifiées,
   journal complet, retour automatique à l'état normal, corrélation avec la méga-base. */
(function(){
'use strict';
var DB=window.KFObdDB;if(!DB){console.warn('obdpro: obdpro_db.js absent');return}
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},d:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function toast(m){if(typeof window.toast==='function'){window.toast(m);return}
 var t=$('#toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},3200)}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function hex(b){return Array.prototype.map.call(b,function(x){return ('0'+(x&255).toString(16)).slice(-2)}).join('').toUpperCase()}
function unhex(s){s=String(s||'').replace(/[^0-9A-Fa-f]/g,'');var o=[];for(var i=0;i+1<s.length;i+=2)o.push(parseInt(s.substr(i,2),16));return o}
function h4(n){return ('000'+(n>>>0).toString(16)).slice(-3).toUpperCase()}

/* ═══════════ TRANSPORT ═══════════ */
function Transport(){this.kind=null;this.name='';this.dev=null;this.port=null;this.ws=null;
 this.rx=[];this.waiter=null;this.mtu=20;this.wc=null;this.rc=null;this.onDrop=null;this.usb=null;this.q=Promise.resolve()}
Transport.prototype.available=function(){
 return{ble:!!(navigator.bluetooth&&navigator.bluetooth.requestDevice),
  serial:!!(navigator.serial&&navigator.serial.requestPort),
  usb:!!(navigator.usb&&navigator.usb.requestDevice),
  ws:true,demo:true}};
Transport.prototype._push=function(txt){
 this.rx.push(txt);
 if(this.waiter){var w=this.waiter;this.waiter=null;w()}
};
Transport.prototype._read=function(timeout){
 var self=this;
 return new Promise(function(res,rej){
  var t0=Date.now();
  function poll(){
   if(self.rx.length)return res(self.rx.shift());
   if(Date.now()-t0>timeout)return rej(new Error('timeout'));
   self.waiter=poll;setTimeout(poll,25)}
  poll()})};
/* --- BLE : découverte automatique, toutes versions --- */
Transport.prototype.ble=async function(){
 var self=this;
 var opt=DB.BLE.map(function(b){return b.s}).concat(DB.BLE.map(function(b){return b.w})).concat(DB.BLE.map(function(b){return b.r}));
 opt=Array.from(new Set(opt.concat(['00001800-0000-1000-8000-00805f9b34fb','00001801-0000-1000-8000-00805f9b34fb',
  '0000180a-0000-1000-8000-00805f9b34fb','0000180f-0000-1000-8000-00805f9b34fb'])));
 var dev=await navigator.bluetooth.requestDevice({acceptAllDevices:true,optionalServices:opt});
 this.dev=dev;this.kind='ble';this.name=dev.name||'ELM327 BLE';
 dev.addEventListener('gattserverdisconnected',function(){if(self.onDrop)self.onDrop()});
 await this._bleConnect();
 LS.s('obdLast',{kind:'ble',name:this.name,id:dev.id});
 return this.name};
Transport.prototype._bleConnect=async function(){
 var srv=await this.dev.gatt.connect();
 var services=await srv.getPrimaryServices();
 var best=null;
 for(var i=0;i<services.length;i++){
  var s=services[i],chars;
  try{chars=await s.getCharacteristics()}catch(e){continue}
  var w=null,r=null;
  chars.forEach(function(c){
   if(c.properties.write||c.properties.writeWithoutResponse){if(!w)w=c}
   if(c.properties.notify||c.properties.indicate){if(!r)r=c}});
  if(!w||!r)continue;
  var score=10;
  DB.BLE.forEach(function(b){
   if(s.uuid===b.s){score=Math.max(score,b.p);
    if(w.uuid===b.w)score+=6;if(r.uuid===b.r)score+=6}});
  if(w===r)score+=2;
  if(!best||score>best.score)best={score:score,w:w,r:r,s:s}}
 if(!best)throw new Error('Aucun service BLE série trouvé sur cet appareil. Vérifiez qu\'il s\'agit d\'un adaptateur OBD BLE (ELM327 BLE, Vgate iCar Pro BLE, OBDLink MX+/CX, HM-10).');
 this.wc=best.w;this.rc=best.r;
 await this.rc.startNotifications();
 var self=this,buf='';
 this.rc.addEventListener('characteristicvaluechanged',function(e){
  var v=e.target.value,txt='';
  for(var i=0;i<v.byteLength;i++)txt+=String.fromCharCode(v.getUint8(i));
  buf+=txt;
  var parts=buf.split('\r');
  for(var k=0;k<parts.length-1;k++)self._push(parts[k]);
  buf=parts[parts.length-1];
  if(buf.indexOf('>')>=0){self._push(buf.replace('>',''));buf=''}});
 /* MTU : sonde par taille de paquet */
 this.mtu=20;
 try{var probe=new Uint8Array(185);this.mtu=185}catch(e){}
 this.proto='BLE '+(best.s.uuid.slice(4,8).toUpperCase());
 return true};
Transport.prototype.reconnect=async function(){
 if(this.kind==='ble'&&this.dev){await this._bleConnect();return true}
 if(this.kind==='serial'&&this.port){await this._serialOpen();return true}
 if(this.kind==='ws'&&this.wsUrl){await this.wsConnect(this.wsUrl);return true}
 return false};
/* --- Web Serial --- */
Transport.prototype.serial=async function(baud){
 this.port=await navigator.serial.requestPort();
 this.kind='serial';this.name='Adaptateur série USB';
 await this._serialOpen(baud);
 LS.s('obdLast',{kind:'serial',name:this.name});
 return this.name};
Transport.prototype._serialOpen=async function(baud){
 var rates=[baud||38400,115200,38400,9600,57600,230400];
 var self=this;
 for(var i=0;i<rates.length;i++){
  try{
   if(this.port.readable||this.port.writable){try{await this.port.close()}catch(e){}}
   await this.port.open({baudRate:rates[i],dataBits:8,stopBits:1,parity:'none',flowControl:'none'});
   this.baud=rates[i];this.proto='Série '+rates[i]+' baud';
   this._serialLoop();return true}catch(e){}}
 throw new Error('Ouverture du port série impossible')};
Transport.prototype._serialLoop=async function(){
 var self=this,dec=new TextDecoder(),buf='';
 try{
  while(this.port.readable){
   this.reader=this.port.readable.getReader();
   try{
    for(;;){var r=await this.reader.read();if(r.done)break;
     buf+=dec.decode(r.value,{stream:true});
     var parts=buf.split('\r');
     for(var k=0;k<parts.length-1;k++)self._push(parts[k]);
     buf=parts[parts.length-1];
     if(buf.indexOf('>')>=0){self._push(buf.replace('>',''));buf=''}}
   }finally{try{this.reader.releaseLock()}catch(e){}}
  }
 }catch(e){if(self.onDrop)self.onDrop()}};
/* --- WebUSB (CDC / CH340 / CP210x / FTDI) --- */
Transport.prototype.usbConnect=async function(){
 var d=await navigator.usb.requestDevice({filters:[
  {vendorId:0x1A86},{vendorId:0x10C4},{vendorId:0x0403},{vendorId:0x067B},{vendorId:0x0483}]});
 await d.open();if(d.configuration===null)await d.selectConfiguration(1);
 var iface=null,epIn=null,epOut=null;
 for(var i=0;i<d.configuration.interfaces.length;i++){
  var it=d.configuration.interfaces[i];
  for(var j=0;j<it.alternates.length;j++){
   var al=it.alternates[j],ein=null,eout=null;
   al.endpoints.forEach(function(e){if(e.direction==='in'&&e.type==='bulk')ein=e;if(e.direction==='out'&&e.type==='bulk')eout=e});
   if(ein&&eout){iface=it;epIn=ein;epOut=eout;break}}
  if(iface)break}
 if(!iface)throw new Error('Interface USB série non trouvée');
 await d.claimInterface(iface.interfaceNumber);
 try{await d.selectAlternateInterface(iface.interfaceNumber,0)}catch(e){}
 var vid=d.vendorId;
 if(vid===0x1A86){/* CH340 */
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0xA1,value:0xC29C,index:0xB2B9});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0xA4,value:0xDF,index:0});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0xA4,value:0x9F,index:0});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0x9A,value:0x2518,index:0x0050});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0xA1,value:0x501F,index:0xD90A});
 }else if(vid===0x10C4){/* CP210x */
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0x00,value:0x0001,index:0});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0x1E,value:0x0000,index:0,data:new Uint8Array([0x00,0x96,0x00,0x00])});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0x07,value:0x0300,index:0});
 }else if(vid===0x0403){/* FTDI */
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0x00,value:0,index:0});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0x03,value:0x4138,index:0});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0x02,value:0,index:0});
  await d.controlTransferOut({requestType:'vendor',recipient:'device',request:0x04,value:0x0008,index:0})}
 this.usb={d:d,in:epIn.endpointNumber,out:epOut.endpointNumber};
 this.kind='usb';this.name=d.productName||'Adaptateur USB';this.proto='USB';
 this._usbLoop();LS.s('obdLast',{kind:'usb',name:this.name});return this.name};
Transport.prototype._usbLoop=async function(){
 var self=this,dec=new TextDecoder(),buf='';
 try{for(;;){var r=await this.usb.d.transferIn(this.usb.in,64);
  if(r.data){buf+=dec.decode(r.data,{stream:true});
   var parts=buf.split('\r');
   for(var k=0;k<parts.length-1;k++)self._push(parts[k]);
   buf=parts[parts.length-1];
   if(buf.indexOf('>')>=0){self._push(buf.replace('>',''));buf=''}}}}
 catch(e){if(self.onDrop)self.onDrop()}};
/* --- pont WebSocket (Bluetooth Classic SPP via passerelle) --- */
Transport.prototype.wsConnect=async function(url){
 var self=this;this.wsUrl=url;
 await new Promise(function(res,rej){
  var ws=new WebSocket(url);self.ws=ws;
  ws.binaryType='arraybuffer';
  var to=setTimeout(function(){try{ws.close()}catch(e){}rej(new Error('Pont WebSocket injoignable'))},8000);
  ws.onopen=function(){clearTimeout(to);res()};
  ws.onerror=function(){clearTimeout(to);rej(new Error('Erreur WebSocket'))};
  ws.onclose=function(){if(self.onDrop)self.onDrop()};
  var buf='';
  ws.onmessage=function(e){
   var txt=typeof e.data==='string'?e.data:new TextDecoder().decode(e.data);
   buf+=txt;var parts=buf.split('\r');
   for(var k=0;k<parts.length-1;k++)self._push(parts[k]);
   buf=parts[parts.length-1];
   if(buf.indexOf('>')>=0){self._push(buf.replace('>',''));buf=''}}});
 this.kind='ws';this.name='Pont '+url;this.proto='WebSocket';
 LS.s('obdLast',{kind:'ws',name:this.name,url:url});return this.name};
/* --- démo --- */
Transport.prototype.demo=function(){
 this.kind='demo';this.name='Simulateur OBD (démo)';this.proto='CAN 11 bit 500 k (simulé)';return this.name};
Transport.prototype.write=async function(s){
 if(this.kind==='demo')return;
 var data=new TextEncoder().encode(s+'\r');
 if(this.kind==='ble'){
  var n=this.mtu||20;
  for(var i=0;i<data.length;i+=n){
   var chunk=data.slice(i,i+n);
   if(this.wc.properties.writeWithoutResponse&&this.wc.writeValueWithoutResponse)await this.wc.writeValueWithoutResponse(chunk);
   else await this.wc.writeValue(chunk)}
 }else if(this.kind==='serial'){
  var w=this.port.writable.getWriter();await w.write(data);w.releaseLock();
 }else if(this.kind==='usb'){
  await this.usb.d.transferOut(this.usb.out,data);
 }else if(this.kind==='ws'){this.ws.send(s+'\r')}};
Transport.prototype.close=async function(){
 try{if(this.kind==='ble'&&this.dev&&this.dev.gatt.connected)this.dev.gatt.disconnect()}catch(e){}
 try{if(this.reader)await this.reader.cancel()}catch(e){}
 try{if(this.port)await this.port.close()}catch(e){}
 try{if(this.usb)await this.usb.d.close()}catch(e){}
 try{if(this.ws)this.ws.close()}catch(e){}
 this.kind=null;this.rx=[]};
/* démo : réponses ELM simulées */
var DEMO={'ATI':'ELM327 v1.5 (SIM)','ATZ':'ELM327 v1.5 (SIM)','ATRV':'12.6V','ATDPN':'6','ATSP0':'OK',
 '0902':'49 02 01 56 46 33 00 00 00','0100':'41 00 BE 3E B8 13','03':'43 01 33 00 00 00 00',
 '07':'47 00 00 00 00 00 00','010C':'41 0C 0B D0','010D':'41 0D 00','0105':'41 05 7B','0142':'41 42 31 F4',
 '010F':'41 0F 46','015C':'41 5C 78','01A6':'41 A6 00 0A 12 34'};

/* ═══════════ ELM ═══════════ */
function ELM(tr){this.tr=tr;this.echo=false;this.proto=0;this.hdr=true;this.can=false;this.busy=false;this.lat=[]}
ELM.prototype.cmd=async function(c,timeout){
 var self=this;timeout=timeout||2500;
 if(this.tr.kind==='demo'){await sleep(40);return DEMO[c.toUpperCase().replace(/\s/g,'')]||'OK'}
 var t0=performance.now();
 this.tr.rx=[];
 await this.tr.write(c);
 var out=[],guard=0;
 for(;;){
  guard++;if(guard>400)break;
  var line;
  try{line=await this.tr._read(timeout)}catch(e){break}
  var s=String(line).trim();
  if(!s)continue;
  if(s==='>')break;
  if(/^AT/.test(c.toUpperCase())&&s===c.toUpperCase())continue;
  out.push(s);
  if(/NO DATA|UNABLE TO CONNECT|BUS INIT.*ERROR|STOPPED|\?|ERROR/i.test(s))break;
 }
 var dt=performance.now()-t0;this.lat.push(dt);if(this.lat.length>40)this.lat.shift();
 return out.join('\n')};
ELM.prototype.init=async function(log){
 var L=log||function(){};
 L('Réinitialisation de l\'adaptateur…');
 await this.cmd('ATZ',3500);await sleep(250);
 await this.cmd('ATE0',1500);await this.cmd('ATL0',1200);await this.cmd('ATS0',1200);
 await this.cmd('ATH1',1200);this.hdr=true;
 await this.cmd('ATAL',1200);await this.cmd('ATST64',1200);await this.cmd('ATAT1',1200);
 var id=await this.cmd('ATI',2000);this.version=id;
 L('Adaptateur : '+(id||'inconnu'));
 var v=await this.cmd('ATRV',1500);this.volts=v;L('Tension véhicule : '+v);
 L('Recherche du protocole véhicule…');
 await this.cmd('ATSP0',3000);
 var r=await this.cmd('0100',9000);
 if(/UNABLE|NO DATA|ERROR/i.test(r)){
  L('Protocole auto échoué — essais ciblés (CAN 11/29, KWP, ISO)…');
  var order=[6,8,7,9,5,4,3,1,2];
  for(var i=0;i<order.length;i++){
   await this.cmd('ATSP'+order[i].toString(16).toUpperCase(),3000);
   await sleep(180);
   var t=await this.cmd('0100',6000);
   if(!/UNABLE|NO DATA|ERROR|\?/i.test(t)&&t){r=t;break}}
 }
 if(/UNABLE|NO DATA|ERROR|\?/i.test(r)||!r)throw new Error('Aucun protocole véhicule détecté. Vérifiez : contact mis, prise OBD alimentée, adaptateur compatible, véhicule après 2001 (OBD-II).');
 var pn=await this.cmd('ATDPN',1500);
 var n=parseInt(String(pn).replace(/[^0-9A-F]/gi,''),16);if(isNaN(n))n=0;
 this.proto=n&0x0F;this.can=[6,7,8,9,10,11,12].indexOf(this.proto)>=0;
 L('Protocole : '+(DB.PROTO[this.proto]||this.proto));
 if(this.can){await this.cmd('ATCAF0',1200);await this.cmd('ATCFC1',1200);await this.cmd('ATAL',1200);
  await this.cmd('ATSTFF',1200);await this.cmd('ATAR',1200)}
 this.ready=true;return true};
ELM.prototype.obd=async function(mode,pid,timeout){
 var c=mode+(pid==null?'':pid);
 var r=await this.cmd(c,timeout||3000);
 return this.parse(r)};
ELM.prototype.parse=function(r){
 if(!r)return{err:'NO DATA',frames:[]};
 if(/NO DATA/i.test(r))return{err:'NO DATA',frames:[]};
 if(/UNABLE|ERROR|STOPPED|\?/i.test(r))return{err:r.trim(),frames:[]};
 var lines=String(r).split(/\r?\n/).map(function(x){return x.trim()}).filter(Boolean);
 var frames=[];
 lines.forEach(function(l){
  var toks=l.replace(/[^0-9A-Fa-f ]/g,' ').trim().split(/\s+/).filter(function(t){return /^[0-9A-Fa-f]{2}$/.test(t)});
  if(toks.length<2)return;
  var b=toks.map(function(t){return parseInt(t,16)});
  frames.push(b)});
 return{frames:frames,raw:r}};
/* ISO-TP : assemblage à partir des trames CAN */
function isotp(frames){
 var out=[],cur=null,need=0,seq=0;
 for(var i=0;i<frames.length;i++){
  var f=frames[i];if(!f||!f.length)continue;
  var d=f.length>4?f.slice(3):f; /* avec ATH1 : 3 octets d'en-tête 11-bit */
  if(d.length<1)continue;
  var pci=d[0]>>4;
  if(pci===0){var len=d[0]&0x0F;if(len>0&&d.length>len)return d.slice(1,1+len);out=out.concat(d.slice(1,1+len))}
  else if(pci===1){need=((d[0]&0x0F)<<8)|d[1];cur=d.slice(2);seq=1;
   if(cur.length>=need)return cur.slice(0,need)}
  else if(pci===2){if(cur){cur=cur.concat(d.slice(1));seq=(seq+1)&0x0F;
   if(cur.length>=need){var o=cur.slice(0,need);cur=null;return o}}}
 }
 if(cur&&cur.length)return cur;
 return out.length?out:null}
/* ═══════════ UDS / KWP ═══════════ */
function UDS(elm){this.e=elm;this.tx=0x7E0;this.rx=0x7E8;this.t29=false;this.session=1;this.tp=null}
UDS.prototype.setHeader=async function(tx,rx){
 this.tx=tx;this.rx=rx;
 await this.e.cmd('ATSH'+(this.t29?h4(tx).padStart(8,'0'):h4(tx)),1500);
 await this.e.cmd('ATCRA'+(this.t29?h4(rx).padStart(8,'0'):h4(rx)),1500);
 await this.e.cmd('ATFCSH'+(this.t29?h4(tx).padStart(8,'0'):h4(tx)),1200);
 await this.e.cmd('ATFCSD300000',1200);await this.e.cmd('ATFCSM1',1200)};
UDS.prototype.req=async function(bytes,timeout){
 var self=this;
 var payload=bytes.map(function(b){return ('0'+(b&255).toString(16)).slice(-2)}).join('').toUpperCase();
 var r=await this.e.cmd(payload,timeout||4000);
 var p=this.e.parse(r);
 if(p.err)return{err:p.err};
 var data=null;
 if(this.e.can){
  /* l'ELM gère l'ISO-TP : la 1re trame contient PCI */
  var frames=p.frames;
  if(frames.length===1&&frames[0].length>4){var d=frames[0].slice(3);
   if((d[0]>>4)===0)data=d.slice(1,1+(d[0]&0x0F));else data=d}
  else data=isotp(frames);
  if(!data&&frames.length)data=frames[0].slice(frames[0].length>4?4:1);
 }else{
  data=[];p.frames.forEach(function(f){data=data.concat(f)});
  /* KWP : en-tête fmt/tgt/src + len */
  if(data.length>3)data=data.slice(3);
 }
 if(!data||!data.length)return{err:'réponse vide',raw:r};
 if(data[0]===0x7F){
  var nrc=data[2];
  if(nrc===0x78){await sleep(600);return this.req(bytes,(timeout||4000)+4000)}
  return{nrc:nrc,err:(DB.NRC[nrc]||('NRC '+nrc)),sid:data[1]}}
 if(data[0]!==(bytes[0]+0x40))return{err:'réponse inattendue '+hex(data),data:data};
 return{data:data.slice(1),sid:data[0]}};
UDS.prototype.ping=async function(){var r=await this.req([0x3E,0x00],1600);return !r.err};
UDS.prototype.ident=async function(){
 var out={},self=this;
 var list=['F197','F187','F190','F191','F188','F18C','F1A0','F1B0'];
 for(var i=0;i<list.length;i++){
  var d=unhex(list[i]);
  var r=await this.req([0x22,d[0],d[1]],1800);
  if(r.err)continue;
  var bytes=r.data.slice(2);
  var txt=bytes.map(function(b){return b>=32&&b<127?String.fromCharCode(b):''}).join('').replace(/\s+/g,' ').trim();
  out[list[i]]=txt||hex(bytes);
  if(list[i]==='F190'&&bytes.length===17)this.vin=txt}
 return out};
UDS.prototype.dtc=async function(){
 var res={stored:[],pending:[],permanent:[],history:[],snapshots:[]};
 var r=await this.req([0x19,0x02,0xFF],4500);
 if(!r.err&&r.data.length>2)res.stored=this.parseDTC(r.data.slice(1));
 var p=await this.req([0x19,0x02,0x01],3500);
 if(!p.err&&p.data.length>2)res.pending=this.parseDTC(p.data.slice(1));
 var pm=await this.req([0x19,0x02,0x08],3500);
 if(!pm.err&&pm.data.length>2)res.permanent=this.parseDTC(pm.data.slice(1));
 var h=await this.req([0x19,0x0A],4500);
 if(!h.err&&h.data.length>2)res.history=this.parseDTC(h.data.slice(1));
 if(!h.err&&h.data.length>2&&!res.stored.length)res.stored=this.parseDTC(h.data.slice(1));
 /* JDD : snapshot record 0x04 (freeze frame) + 0x06 (extended) */
 for(var s=0;s<Math.min(res.stored.length,8);s++){
  var code=res.stored[s];
  var sf=await this.req([0x19,0x04,code.b0,code.b1,code.b2,0xFF],4000);
  if(!sf.err&&sf.data.length>4)res.snapshots.push({dtc:code.code,type:'freeze',raw:hex(sf.data),rec:sf.data});
  var ex=await this.req([0x19,0x06,code.b0,code.b1,code.b2,0xFF],4000);
  if(!ex.err&&ex.data.length>4)res.snapshots.push({dtc:code.code,type:'étendu',raw:hex(ex.data),rec:ex.data})}
 /* compteurs d'occurrence */
 var cnt=await this.req([0x19,0x14],3000);
 if(!cnt.err)res.counters=hex(cnt.data);
 return res};
UDS.prototype.parseDTC=function(b){
 var out=[];
 for(var i=0;i+3<b.length;i+=4){
  var b0=b[i],b1=b[i+1],b2=b[i+2],st=b[i+3];
  var pre=['P','C','B','U'][(b0>>6)&3];
  var d1=(b0>>4)&3,d2=b0&0x0F;
  var code=pre+d1+d2.toString(16).toUpperCase()+('0'+b1.toString(16)).slice(-2).toUpperCase()+('0'+(b2>>4).toString(16)).slice(-2).toUpperCase();
  code=pre+d1+(''+d2)+('0'+b1.toString(16)).slice(-2).toUpperCase()+('0'+b2.toString(16)).slice(-2).toUpperCase();
  out.push({code:code,b0:b0,b1:b1,b2:b2,status:st,
   failed:!!(st&1),confirmed:!!(st&8),pending:!!(st&4),permanent:!!(st&0x10),
   sinceClear:!!(st&0x40),testNotComplete:!!(st&0x20),
   label:(DB.DTCX[code]||window.KFObdDtcLabel&&KFObdDtcLabel(code)||'')})}
 return out};
UDS.prototype.clear=async function(){return this.req([0x14,0xFF,0xFF,0xFF],6000)};
UDS.prototype.session=async function(n){var r=await this.req([0x10,n],3500);if(!r.err)this.session=n;return r};
UDS.prototype.security=async function(level,keyHex){
 var s=await this.req([0x27,level],3500);
 if(s.err)return s;
 var seed=hex(s.data.slice(1));
 if(!keyHex)return{err:'clé requise',seed:seed,level:level};
 var k=unhex(keyHex);
 return this.req([0x27,level+1].concat(k),4000)};
UDS.prototype.routine=async function(id,opts){
 var b=unhex(id);return this.req([0x31].concat(b).concat(opts||[]),15000)};
UDS.prototype.readDID=async function(did){var b=unhex(did);return this.req([0x22].concat(b),4000)};
UDS.prototype.writeDID=async function(did,data){var b=unhex(did);return this.req([0x2E].concat(b).concat(unhex(data||'')),8000)};
UDS.prototype.io=async function(did,ctrl,params){var b=unhex(did);return this.req([0x2F].concat(b).concat([ctrl]).concat(unhex(params||'')),8000)};
UDS.prototype.ioReturn=async function(did){var b=unhex(did);return this.req([0x2F].concat(b).concat([0x00]),6000)};
UDS.prototype.testerPresent=async function(){return this.req([0x3E,0x80],1500)};

/* ═══════════ ÉTAT ═══════════ */
var TR=new Transport(),E=new ELM(TR),U=new UDS(E);
var ST={connected:false,busy:false,tab:'dtc',vin:'',proto:'',volts:'',ecus:[],dtc:{},live:[],
 log:[],workshop:LS.g('obdWorkshop',false),brand:LS.g('obdBrand','auto'),scanRange:'auto',
 key:'',liveTimer:null,tpTimer:null,calRun:null};
function log(m,lvl){
 var e={t:new Date().toISOString(),m:String(m),lvl:lvl||'info'};
 ST.log.unshift(e);if(ST.log.length>800)ST.log.pop();LS.s('obdLog',ST.log.slice(0,300));
 var el=$('#obdLog');if(el)el.innerHTML=ST.log.slice(0,200).map(function(x){
  return '<div class="ol-'+x.lvl+'"><span>'+esc(x.t.slice(11,19))+'</span> '+esc(x.m)+'</div>'}).join('');
}
function setBusy(b,txt){ST.busy=b;var s=$('#obdBusy');if(s){s.textContent=txt||'';s.style.display=b?'block':'none'}
 var btns=document.querySelectorAll('[data-obd]');Array.prototype.forEach.call(btns,function(x){if(b)x.setAttribute('disabled','');else x.removeAttribute('disabled')})}
function brandKey(){
 var b=ST.brand;
 if(b&&b!=='auto')return b;
 var v=null;try{v=(typeof S!=='undefined'&&S.vehicle&&S.vehicle.brand)||''}catch(e){}
 v=(v||'').toLowerCase();
 if(/peugeot|citro|ds\b|opel|vauxhall/.test(v))return 'psa';
 if(/renault|dacia|alpine/.test(v))return 'renault';
 if(/volkswagen|vw|audi|skoda|seat|cupra|porsche/.test(v))return 'vag';
 if(/bmw|mini/.test(v))return 'bmw';
 if(/mercedes|smart/.test(v))return 'mercedes';
 if(/ford/.test(v))return 'ford';
 if(/fiat|alfa|lancia|jeep|abarth/.test(v))return 'fca';
 if(/volvo|polestar/.test(v))return 'volvo';
 if(/jaguar|land rover|range rover/.test(v))return 'jlr';
 if(/toyota|lexus/.test(v))return 'toyota';
 if(/honda|acura/.test(v))return 'honda';
 if(/nissan|infiniti/.test(v))return 'nissan';
 if(/hyundai|kia|genesis/.test(v))return 'hk';
 return 'other'}
function brandLabel(){var k=brandKey();return (DB.SCAN[k]||DB.SCAN.other).label}

/* ═══════════ CONNEXION ═══════════ */
async function connect(kind){
 if(ST.busy)return;
 setBusy(true,'Connexion…');
 try{
  var name='';
  if(kind==='auto'){
   var av=TR.available();
   if(av.ble){try{name=await TR.ble()}catch(e){log('BLE : '+e.message,'warn')}}
   if(!name&&av.serial){try{name=await TR.serial()}catch(e){log('Série : '+e.message,'warn')}}
   if(!name&&av.usb){try{name=await TR.usbConnect()}catch(e){log('USB : '+e.message,'warn')}}
   if(!name)throw new Error('Aucun adaptateur sélectionné. Choisissez Bluetooth LE, Série USB, WebUSB ou un pont.');
  }
  else if(kind==='ble')name=await TR.ble();
  else if(kind==='serial')name=await TR.serial();
  else if(kind==='usb')name=await TR.usbConnect();
  else if(kind==='ws'){var u=$('#obdWs').value.trim();if(!u)throw new Error('Adresse du pont requise (ex. ws://192.168.1.20:35000)');name=await TR.wsConnect(u)}
  else if(kind==='demo')name=TR.demo();
  TR.onDrop=function(){ST.connected=false;log('Liaison perdue — reconnexion…','warn');render();
   setTimeout(async function(){try{await TR.reconnect();await E.init(log);ST.connected=true;log('Reconnecté','ok');render()}catch(e){log('Reconnexion échouée : '+e.message,'err');render()}},1200)};
  log('Transport : '+name+' ('+(TR.proto||kind)+')','ok');
  await E.init(log);
  U.t29=[7,9,10].indexOf(E.proto)>=0;
  ST.connected=true;ST.proto=DB.PROTO[E.proto]||'';ST.volts=E.volts||'';
  await readVin();
  await U.setHeader(0x7E0,0x7E8);
  log('Prêt — protocole '+ST.proto,'ok');
  toast('🔌 OBD connecté : '+name);
 }catch(e){log('Connexion : '+e.message,'err');toast('❌ '+e.message);ST.connected=false}
 setBusy(false);render()}
async function readVin(){
 try{
  var r=await E.obd('09','02',5000);
  if(r.frames&&r.frames.length){
   var all=[];r.frames.forEach(function(f){all=all.concat(f)});
   var s=all.map(function(b){return b>=32&&b<127?String.fromCharCode(b):''}).join('');
   var m=s.match(/[A-HJ-NPR-Z0-9]{17}/);
   if(m){ST.vin=m[0];log('VIN : '+ST.vin,'ok');
    try{if(typeof S!=='undefined'){S.veh=S.veh||{};S.veh.vin=ST.vin}}catch(e){}
    return}}
 }catch(e){}
 try{await U.setHeader(0x7E0,0x7E8);var d=await U.req([0x22,0xF1,0x90],3000);
  if(!d.err){var t=d.data.slice(2).map(function(b){return String.fromCharCode(b)}).join('');
   var m2=t.match(/[A-HJ-NPR-Z0-9]{17}/);if(m2){ST.vin=m2[0];log('VIN (UDS) : '+ST.vin,'ok')}}}catch(e){}}
async function disconnect(){
 stopLive();stopTP();await TR.close();ST.connected=false;ST.ecus=[];ST.dtc={};log('Déconnecté');render()}

/* ═══════════ SCAN ECU ═══════════ */
async function scanEcus(deep){
 if(!ST.connected){toast('Connectez d\'abord l\'adaptateur');return}
 setBusy(true,'Scan des calculateurs…');
 ST.ecus=[];
 try{
  var cfg=DB.SCAN[brandKey()]||DB.SCAN.other;
  var ids=DB.SCAN.standard.ids.slice();
  var ranges=deep?[[0x600,0x7FF]]:cfg.ranges;
  ranges.forEach(function(r){for(var i=r[0];i<=r[1];i++)if(ids.indexOf(i)<0)ids.push(i)});
  log('Scan '+(deep?'large 0x600-0x7FF':brandLabel())+' — '+ids.length+' adresses');
  var found=0;
  for(var i=0;i<ids.length;i++){
   var id=ids[i];
   setBusy(true,'Scan calculateur '+h4(id)+' ('+(i+1)+'/'+ids.length+') — '+found+' trouvé(s)');
   await U.setHeader(id,id+8);
   var ok=await U.ping();
   if(!ok){await U.setHeader(id,0x7E8);ok=await U.ping()}
   if(!ok)continue;
   var rx=id+8;
   var probe=await U.req([0x22,0xF1,0x97],1400);
   if(probe.err){await U.setHeader(id,0x7E8);rx=0x7E8}
   await U.setHeader(id,rx);
   var info=await U.ident();
   var name=info.F197||info.F1B0||cfg.hints[id]||('Calculateur '+h4(id));
   var ecu={tx:id,rx:rx,name:name,info:info,
    part:info.F187||'',hw:info.F191||'',sw:info.F188||'',serial:info.F18C||'',
    guess:cfg.hints[id]||'',dtc:null};
   ST.ecus.push(ecu);found++;
   log('✅ '+h4(id)+' → '+name+(ecu.part?' ['+ecu.part+']':''),'ok');
   renderEcus();
  }
  if(!found)log('Aucun calculateur UDS trouvé. Le véhicule utilise peut-être KWP2000 (K-Line) : lancez le scan KWP.','warn');
  toast('🔎 '+found+' calculateur(s) détecté(s)');
 }catch(e){log('Scan : '+e.message,'err')}
 setBusy(false);render()}
async function scanKwp(){
 if(!ST.connected){toast('Connectez d\'abord');return}
 setBusy(true,'Scan KWP2000 (K-Line)…');
 try{
  await E.cmd('ATSP5',3000);await sleep(300);
  await E.cmd('ATSH8110F1',1500);
  var r=await E.cmd('1080',4000);
  log('KWP init : '+(r||'—'));
  var id=await E.cmd('1A90',4000);
  log('KWP identification : '+(id||'—'));
  var d=await E.cmd('1200',4000);
  log('KWP défauts : '+(d||'—'));
  toast('Scan KWP terminé — voir le journal');
 }catch(e){log('KWP : '+e.message,'err')}
 setBusy(false);render()}

/* ═══════════ LECTURE DTC / JDD ═══════════ */
async function readAllDtc(){
 if(!ST.connected){toast('Connectez d\'abord');return}
 setBusy(true,'Lecture des défauts…');
 var total=0,all=[];
 try{
  /* OBD standard moteur */
  await E.cmd('ATSH7DF',1200);await E.cmd('ATCRA7E8',1200);
  var m3=await E.obd('03','',4000);
  var obdCodes=parseObdDtc(m3);
  var m7=await E.obd('07','',3500);
  var pend=parseObdDtc(m7);
  var mA=await E.obd('0A','',3500);
  var perm=parseObdDtc(mA);
  ST.dtc['0x7E0']={name:'Moteur (OBD-II)',stored:obdCodes,pending:pend,permanent:perm,snapshots:[],history:[]};
  /* freeze frames OBD mode 02 */
  for(var i=0;i<Math.min(obdCodes.length,6);i++){
   var ff=await E.obd('02',obdCodes[i].b0h+obdCodes[i].b1h,3000);
   if(ff.frames&&ff.frames.length)ST.dtc['0x7E0'].snapshots.push({dtc:obdCodes[i].code,type:'freeze OBD',raw:hex(ff.frames[0])})}
  total+=obdCodes.length+pend.length+perm.length;
  obdCodes.forEach(function(c){all.push(c.code)});
  log('Moteur OBD : '+obdCodes.length+' confirmé(s), '+pend.length+' en attente, '+perm.length+' permanent(s)','ok');
  /* tous les calculateurs découverts */
  var list=ST.ecus.length?ST.ecus:[{tx:0x7E0,rx:0x7E8,name:'Moteur (UDS)'}];
  for(var k=0;k<list.length;k++){
   var ecu=list[k];
   setBusy(true,'Défauts '+ecu.name+' ('+(k+1)+'/'+list.length+')');
   await U.setHeader(ecu.tx,ecu.rx);
   var r=await U.dtc();
   ecu.dtc=r;ST.dtc['0x'+h4(ecu.tx)]={name:ecu.name,stored:r.stored||[],pending:r.pending||[],
    permanent:r.permanent||[],history:r.history||[],snapshots:r.snapshots||[],counters:r.counters};
   var n=(r.stored||[]).length+(r.pending||[]).length+(r.permanent||[]).length+(r.history||[]).length;
   total+=n;(r.stored||[]).forEach(function(c){all.push(c.code)});
   log(ecu.name+' : '+n+' défaut(s), '+(r.snapshots||[]).length+' enregistrement(s) JDD',n?'warn':'ok');
   renderDtc();
  }
  /* corrélation méga-base */
  var uniq=Array.from(new Set(all));
  try{if(typeof S!=='undefined'){S.dtc=uniq;
   if(window.KFCorr&&S.vehicle&&S.vehicle.brand){var c=KFCorr.correlate(S.vehicle,{strict:true,readDtc:uniq});
    log('Corrélation méga-base : '+(c.faults?c.faults.length:0)+' fiche(s) pour '+uniq.length+' DTC','ok')}}}catch(e){}
  toast('📋 '+total+' défaut(s) lu(s) · '+uniq.length+' code(s) unique(s)');
 }catch(e){log('Lecture DTC : '+e.message,'err')}
 setBusy(false);render()}
function parseObdDtc(p){
 if(!p||!p.frames||!p.frames.length)return[];
 var b=[];p.frames.forEach(function(f){b=b.concat(f)});
 var i=b.findIndex(function(x,j){return x===0x43||x===0x47||x===0x4A});
 if(i<0)i=0;else i++;
 var out=[];
 for(var k=i;k+1<b.length;k+=2){
  var b0=b[k],b1=b[k+1];if(b0===0&&b1===0)continue;
  var pre=['P','C','B','U'][(b0>>6)&3];
  var code=pre+((b0>>4)&3)+(''+(b0&0x0F))+('0'+b1.toString(16)).slice(-2).toUpperCase();
  code=pre+((b0>>4)&3)+(b0&0x0F)+('0'+(b1>>4).toString(16)).slice(-1).toUpperCase()+('0'+(b1&0x0F).toString(16)).slice(-1).toUpperCase();
  out.push({code:code,b0:b0,b1:b1,b0h:('0'+b0.toString(16)).slice(-2).toUpperCase(),b1h:('0'+b1.toString(16)).slice(-2).toUpperCase(),
   status:8,confirmed:true,label:DB.DTCX[code]||''})}
 return out}
async function clearDtc(which){
 if(!ST.workshop){toast('🔒 Activez le mode atelier pour effacer');return}
 if(!confirm('Effacer les défauts '+(which==='all'?'de TOUS les calculateurs':'du moteur')+' ?\n\nLes données JDD associées seront perdues. Relevez le rapport AVANT.'))return;
 setBusy(true,'Effacement…');
 try{
  if(which==='all'&&ST.ecus.length){
   for(var i=0;i<ST.ecus.length;i++){await U.setHeader(ST.ecus[i].tx,ST.ecus[i].rx);
    var r=await U.clear();log('Effacement '+ST.ecus[i].name+' : '+(r.err||'OK'),r.err?'warn':'ok')}
  }else{await E.cmd('ATSH7DF',1200);await E.cmd('ATCRA7E8',1200);
   var r2=await E.cmd('04',6000);log('Effacement OBD : '+(r2||'OK'),'ok')}
  toast('🧹 Effacement demandé');await readAllDtc();
 }catch(e){log('Effacement : '+e.message,'err')}
 setBusy(false);render()}

/* ═══════════ LIVE DATA ═══════════ */
function startLive(){
 if(!ST.connected){toast('Connectez d\'abord');return}
 stopLive();
 var pids=['0C','0D','05','42','0F','5C','11','0B','10','04','06','07','2F','45','46','A6'];
 ST.live=pids.map(function(p){return{pid:p,n:(DB.PID[p]||{}).n||p,u:(DB.PID[p]||{}).u||'',v:'—'}});
 renderLive();
 ST.liveTimer=setInterval(async function(){
  if(ST.busy||!ST.connected)return;
  for(var i=0;i<ST.live.length;i++){
   var it=ST.live[i];
   try{var r=await E.obd('01',it.pid,1800);
    if(r.frames&&r.frames.length){
     var f=r.frames[0],d=f.length>4?f.slice(4):f.slice(1);
     var fn=(DB.PID[it.pid]||{}).f;
     if(fn&&d.length){var v=fn(d);it.v=typeof v==='number'?(Math.round(v*10)/10):v}}}catch(e){}
   renderLive()}
 },900)}
function stopLive(){if(ST.liveTimer){clearInterval(ST.liveTimer);ST.liveTimer=null}}
function startTP(){if(ST.tpTimer)return;ST.tpTimer=setInterval(function(){if(ST.connected&&!ST.busy)U.testerPresent().catch(function(){})},2000)}
function stopTP(){if(ST.tpTimer){clearInterval(ST.tpTimer);ST.tpTimer=null}}

/* ═══════════ CALIBRAGES ═══════════ */
async function precheck(pre){
 var out=[],ok=true;
 if(!pre)return{ok:true,items:out};
 async function pid(p){try{var r=await E.obd('01',p,1600);
  if(r.frames&&r.frames.length){var f=r.frames[0],d=f.length>4?f.slice(4):f.slice(1);
   var fn=(DB.PID[p]||{}).f;return fn?fn(d):null}}catch(e){}return null}
 if(pre.vbat){var v=await pid('42');
  var good=v!=null&&v>=pre.vbat[0]&&v<=pre.vbat[1];
  out.push({l:'Tension batterie '+pre.vbat[0]+'–'+pre.vbat[1]+' V',v:v==null?'non lisible':v+' V',ok:v==null?null:good});
  if(v!=null&&!good)ok=false}
 if(pre.coolant){var t=await pid('05');
  var g2=t!=null&&t>=pre.coolant[0]&&t<=pre.coolant[1];
  out.push({l:'Température liquide '+pre.coolant[0]+'–'+pre.coolant[1]+' °C',v:t==null?'non lisible':t+' °C',ok:t==null?null:g2});
  if(t!=null&&!g2)ok=false}
 if(pre.rpm!=null){var r=await pid('0C');
  var g3=r!=null&&(Array.isArray(pre.rpm)?(r>=pre.rpm[0]&&r<=pre.rpm[1]):r===pre.rpm);
  out.push({l:'Régime moteur '+(Array.isArray(pre.rpm)?pre.rpm.join('–'):pre.rpm)+' tr/min',v:r==null?'non lisible':r+' tr/min',ok:r==null?null:g3});
  if(r!=null&&!g3)ok=false}
 if(pre.speed!=null){var s=await pid('0D');
  var g4=s!=null&&s===pre.speed;
  out.push({l:'Vitesse véhicule '+pre.speed+' km/h',v:s==null?'non lisible':s+' km/h',ok:s==null?null:g4});
  if(s!=null&&!g4)ok=false}
 if(pre.ignition)out.push({l:'Contact mis (à confirmer visuellement)',v:'déclaratif',ok:null});
 if(pre.park)out.push({l:'Frein de parking serré (à confirmer)',v:'déclaratif',ok:null});
 if(pre.brake)out.push({l:'Pédale de frein enfoncée (à confirmer)',v:'déclaratif',ok:null});
 if(pre.hood)out.push({l:'Capot ouvert / zone ventilée (à confirmer)',v:'déclaratif',ok:null});
 if(pre.atf)out.push({l:'Température ATF '+pre.atf[0]+'–'+pre.atf[1]+' °C (DID boîte)',v:'à lire sur calculateur boîte',ok:null});
 return{ok:ok,items:out}}
async function runCal(id){
 var cal=DB.CAL.find(function(c){return c.id===id});if(!cal)return;
 if(!ST.connected){toast('Connectez d\'abord');return}
 if(!ST.workshop){toast('🔒 Mode atelier requis (écriture)');return}
 var ecu=ST.ecus.find(function(e){return e.tx===parseInt($('#obdCalEcu').value,10)});
 if(!ecu){toast('Sélectionnez le calculateur cible (lancez un scan)');return}
 if(!confirm('⚠️ CALIBRAGE : '+cal.n+'\n\nRisque : '+cal.risk+'\n\n'+
  'Véhicule à l\'arrêt, frein de parking serré, batterie stable (chargeur recommandé).\n'+
  'Une interruption peut IMMOBILISER le véhicule.\n\nContinuer ?'))return;
 setBusy(true,'Préconditions…');
 var pc=await precheck(cal.pre);
 ST.calRun={cal:cal,ecu:ecu,pre:pc,steps:[],t:new Date().toISOString()};
 renderCal();
 if(!pc.ok){log('Préconditions NON remplies — abandon','err');toast('❌ Préconditions non remplies');setBusy(false);renderCal();return}
 startTP();
 try{
  await U.setHeader(ecu.tx,ecu.rx);
  for(var i=0;i<cal.steps.length;i++){
   var st=cal.steps[i];
   setBusy(true,'Étape '+(i+1)+'/'+cal.steps.length+' — '+st.t);
   var entry={t:st.t,res:'—',ok:null};
   ST.calRun.steps.push(entry);renderCal();
   if(!st.uds&&!st.poll){entry.res='déclaratif';entry.ok=null;
    if(!confirm('Étape '+(i+1)+' : '+st.t+'\n\nConfirmez que la condition est remplie.')){entry.res='annulé par l\'opérateur';entry.ok=false;break}
    entry.ok=true;continue}
   if(st.sec){
    var lv=parseInt(prompt('Niveau d\'accès sécurité (0x27) — impair, ex. 1, 3, 5, 11, 17','3'),10);
    if(isNaN(lv)){entry.res='niveau non fourni';entry.ok=false;break}
    var s=await U.security(lv,ST.key||null);
    if(s.err&&s.seed){
     var k=prompt('Seed reçu : '+s.seed+'\n\nSaisissez la clé correspondante (hex) issue de votre documentation technique constructeur.\nAucun contournement n\'est proposé.','');
     if(!k){entry.res='clé non fournie — étape ignorée';entry.ok=false;break}
     ST.key=k;LS.s('obdKey',k);
     var s2=await U.security(lv,k);
     entry.res=s2.err?('❌ '+s2.err):'✅ accès sécurité accordé';entry.ok=!s2.err;
     if(s2.err)break;continue}
    entry.res=s.err?('❌ '+s.err):'✅ session/sécurité';entry.ok=!s.err;
    if(s.err)break;continue}
   if(st.poll){
    var t0=Date.now(),done=false;
    while(Date.now()-t0<(st.timeout||60000)){
     var pr=await U.req(unhex(st.poll),6000);
     if(!pr.err&&pr.data&&pr.data.length>=2){
      var status=pr.data[1];
      if(status===0x02||status===0x01){done=true;break}
      if(status===0x03||status===0x04){entry.res='❌ routine échouée (statut '+status+')';entry.ok=false;break}}
     await sleep(1200)}
    if(done){entry.res='✅ routine terminée';entry.ok=true}
    else if(entry.ok===null){entry.res='⏱️ temporisation dépassée';entry.ok=false}
    renderCal();if(!entry.ok)break;continue}
   var bytes=unhex(st.uds);
   if(st.data){var dv=prompt('Données à écrire pour « '+st.t+' » (hex)',st.data==='code IMA hex'?'':st.data);
    if(dv==null){entry.res='saisie annulée';entry.ok=false;break}bytes=bytes.concat(unhex(dv))}
   var r=await U.req(bytes,15000);
   entry.res=r.err?('❌ '+r.err):('✅ '+hex(r.data||[]));entry.ok=!r.err;
   log('Calibrage '+cal.n+' — '+st.t+' : '+entry.res,r.err?'warn':'ok');
   renderCal();
   if(r.err&&r.nrc&&[0x22,0x33,0x35,0x81,0x83,0x84,0x87].indexOf(r.nrc)>=0)break;
  }
 }catch(e){log('Calibrage : '+e.message,'err')}
 stopTP();
 ST.calRun.done=true;
 log('Calibrage terminé : '+cal.n+' — '+cal.post,'ok');
 toast('🔧 Calibrage terminé — '+cal.post);
 setBusy(false);renderCal()}

/* ═══════════ ACTIONNEURS ═══════════ */
async function runAct(id){
 var a=DB.ACT.find(function(x){return x.id===id});if(!a)return;
 if(!ST.connected){toast('Connectez d\'abord');return}
 if(!ST.workshop){toast('🔒 Mode atelier requis');return}
 var ecu=ST.ecus.find(function(e){return e.tx===parseInt($('#obdActEcu').value,10)});
 if(!ecu){toast('Sélectionnez le calculateur cible');return}
 var didEl=$('#act_'+id);var did=(didEl&&didEl.value.trim())||a.did.replace(/^2F/,'');
 if(!did){toast('DID requis');return}
 if(!confirm('⚠️ TEST ACTIONNEUR : '+a.n+'\n\nRisque : '+a.risk+'\n\n'+
  'Véhicule à l\'arrêt, frein de parking serré, personne à distance des pièces mobiles.\n'+
  'Durée limitée à '+Math.round(a.dur/1000)+' s puis retour automatique à l\'état normal.\n\nContinuer ?'))return;
 setBusy(true,'Test actionneur '+a.n+'…');startTP();
 try{
  await U.setHeader(ecu.tx,ecu.rx);
  var s=await U.session(3);
  if(s.err)log('Session étendue : '+s.err,'warn');
  var r=await U.io(did,0x03,($('#actp_'+id)&&$('#actp_'+id).value)||'');
  log('Actionneur '+a.n+' : '+(r.err?('❌ '+r.err):('✅ activé '+hex(r.data||[]))),r.err?'err':'ok');
  if(r.err){toast('❌ '+r.err);setBusy(false);stopTP();return}
  toast('▶️ '+a.n+' actif — '+Math.round(a.dur/1000)+' s');
  await sleep(a.dur);
  var back=await U.ioReturn(did);
  log('Retour état normal '+a.n+' : '+(back.err?('❌ '+back.err):'✅'),back.err?'err':'ok');
  toast('⏹️ '+a.n+' — retour à l\'état normal');
 }catch(e){log('Actionneur : '+e.message,'err');
  try{await U.ioReturn(did)}catch(e2){}}
 stopTP();setBusy(false);render()}
async function actStopAll(){
 setBusy(true,'Arrêt de tous les actionneurs…');
 try{for(var i=0;i<DB.ACT.length;i++){
  var el=$('#act_'+DB.ACT[i].id);if(!el)continue;
  var d=el.value.trim();if(!d)continue;
  try{await U.ioReturn(d)}catch(e){}}
  log('Arrêt global actionneurs demandé','ok')}catch(e){}
 setBusy(false);toast('⏹️ Retour à l\'état normal demandé')}

/* ═══════════ RAPPORT ═══════════ */
function report(){
 var r={ts:new Date().toISOString(),vin:ST.vin,brand:brandLabel(),protocol:ST.proto,volts:ST.volts,
  adapter:{name:TR.name,kind:TR.kind,version:E.version,proto:TR.proto},
  ecus:ST.ecus.map(function(e){return{tx:'0x'+h4(e.tx),rx:'0x'+h4(e.rx),name:e.name,part:e.part,hw:e.hw,sw:e.sw,serial:e.serial,
   stored:(e.dtc&&e.dtc.stored||[]).map(function(c){return{code:c.code,status:c.status,label:c.label}}),
   pending:(e.dtc&&e.dtc.pending||[]).map(function(c){return c.code}),
   permanent:(e.dtc&&e.dtc.permanent||[]).map(function(c){return c.code}),
   history:(e.dtc&&e.dtc.history||[]).map(function(c){return c.code}),
   snapshots:(e.dtc&&e.dtc.snapshots||[])}}),
  obd:ST.dtc,live:ST.live,calibrages:ST.calRun,log:ST.log.slice(0,300)};
 var blob=new Blob([JSON.stringify(r,null,2)],{type:'application/json'});
 var a=document.createElement('a');a.href=URL.createObjectURL(blob);
 a.download='kev-fusion-obd-'+(ST.vin||'rapport')+'-'+Date.now()+'.json';a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href)},5000);toast('📤 Rapport OBD exporté')}
function reportPdf(){
 var html='<h1>🔌 KEV FUSION — Rapport diagnostic OBD</h1><p>'+new Date().toLocaleString('fr-FR')+'</p>'+
 '<h2>Véhicule</h2><p>VIN : '+esc(ST.vin||'—')+' · Marque : '+esc(brandLabel())+' · Protocole : '+esc(ST.proto)+' · Tension : '+esc(ST.volts)+'</p>'+
 '<h2>Adaptateur</h2><p>'+esc(TR.name)+' · '+esc(E.version||'')+' · '+esc(TR.proto||'')+'</p>';
 Object.keys(ST.dtc).forEach(function(k){var d=ST.dtc[k];
  html+='<h2>'+esc(d.name)+' ('+k+')</h2>';
  ['stored','pending','permanent','history'].forEach(function(f){
   if(d[f]&&d[f].length)html+='<p><b>'+({stored:'Confirmés',pending:'En attente',permanent:'Permanents',history:'Historique'})[f]+' :</b> '+
    d[f].map(function(c){return esc(c.code)+(c.label?' — '+esc(c.label):'')}).join(' · ')+'</p>'});
  if(d.snapshots&&d.snapshots.length)html+='<p><b>JDD :</b><br>'+d.snapshots.map(function(s){return esc(s.dtc)+' ['+esc(s.type)+'] '+esc(s.raw)}).join('<br>')+'</p>';
  if(!d.stored.length&&!d.pending.length&&!d.history.length)html+='<p>Aucun défaut.</p>'});
 html+='<h2>Calculateurs interrogés</h2>'+ST.ecus.map(function(e){return '<p>0x'+h4(e.tx)+' → '+esc(e.name)+(e.part?' ['+esc(e.part)+']':'')+'</p>'}).join('');
 if(ST.calRun)html+='<h2>Calibrage</h2><p>'+esc(ST.calRun.cal.n)+'</p>'+ST.calRun.steps.map(function(s){return '<p>'+esc(s.t)+' : '+esc(s.res)+'</p>'}).join('');
 html+='<p><i>Document d\'aide à l\'expertise. Les calibrages et tests actionneurs ont été réalisés sous la responsabilité de l\'opérateur.</i></p>';
 var pa=$('#printArea');if(pa){pa.innerHTML=html;document.body.classList.add('printing');window.print();
  setTimeout(function(){document.body.classList.remove('printing')},900)}}

/* ═══════════ UI ═══════════ */
function render(){
 var v=$('#view');if(!v)return;
 var av=TR.available();
 var last=LS.g('obdLast',null);
 v.innerHTML=
 '<div class="card accent"><h2>🔌 OBD Pro — connexion & diagnostic complet</h2>'+
 '<div class="row" style="margin-bottom:10px">'+
  '<span class="badge '+(ST.connected?'b-mod':'b-crit')+'">'+(ST.connected?'✅ Connecté':'⭕ Déconnecté')+'</span>'+
  (TR.name?'<span class="badge">'+esc(TR.name)+'</span>':'')+
  (ST.proto?'<span class="badge b-dtc">'+esc(ST.proto)+'</span>':'')+
  (ST.volts?'<span class="badge">'+esc(ST.volts)+'</span>':'')+
  (ST.vin?'<span class="badge b-dtc">'+esc(ST.vin)+'</span>':'')+
  '<span class="badge">'+esc(brandLabel())+'</span>'+
  '<span class="badge '+(ST.workshop?'b-fire':'')+'">'+(ST.workshop?'🔓 Mode atelier':'🔒 Lecture seule')+'</span>'+
 '</div>'+
 '<div id="obdBusy" class="obd-busy" style="display:none"></div>'+
 '<div class="grid g3">'+
  '<div><label>Mode de connexion</label><select id="obdKind">'+
   '<option value="auto">🔄 Automatique (recommandé)</option>'+
   '<option value="ble"'+(av.ble?'':' disabled')+'>📶 Bluetooth LE (4.0 / 4.1 / 4.2 / 5.x)</option>'+
   '<option value="serial"'+(av.serial?'':' disabled')+'>🔌 Série USB (Web Serial)</option>'+
   '<option value="usb"'+(av.usb?'':' disabled')+'>🧩 WebUSB (CH340 / CP210x / FTDI)</option>'+
   '<option value="ws">🌐 Pont WebSocket (Bluetooth Classic)</option>'+
   '<option value="demo">🧪 Simulateur (démo)</option></select></div>'+
  '<div><label>Pont WebSocket</label><input id="obdWs" placeholder="ws://192.168.1.20:35000" value="'+esc(LS.g('obdWs',''))+'"></div>'+
  '<div><label>Constructeur (ciblage ECU)</label><select id="obdBrand">'+
   '<option value="auto">Auto (depuis le véhicule sélectionné)</option>'+
   Object.keys(DB.SCAN).filter(function(k){return k!=='standard'}).map(function(k){
    return '<option value="'+k+'"'+(ST.brand===k?' selected':'')+'>'+esc(DB.SCAN[k].label)+'</option>'}).join('')+
   '</select></div>'+
 '</div>'+
 '<div class="row">'+
  '<button class="pri" data-obd="connect">🔗 Connecter</button>'+
  '<button data-obd="reconnect"'+(last?'':' disabled')+'>↻ Reconnecter'+(last?' ('+esc(last.name)+')':'')+'</button>'+
  '<button class="danger" data-obd="disconnect">⏏ Déconnecter</button>'+
  '<button data-obd="workshop">'+(ST.workshop?'🔒 Repasser en lecture seule':'🔓 Activer le mode atelier')+'</button>'+
 '</div>'+
 '<p class="mut"><b>Bluetooth sans difficulté :</b> le mode automatique découvre <b>tous</b> les services série BLE (FFF0/FFE0/Nordic UART/ISSC/OBDLink/Vgate…), négocie la taille de paquet et reconnecte seul. '+
 'Les adaptateurs <b>Bluetooth Classic (SPP)</b> ne sont pas accessibles depuis un navigateur : utilisez un adaptateur <b>BLE</b>, un adaptateur <b>USB</b>, ou un <b>pont WebSocket</b> (passerelle SPP→WS).</p>'+
 (!av.ble?'<p class="mut st-warn">⚠️ Web Bluetooth indisponible dans ce contexte. Ouvrez l\'app en HTTPS dans Chrome/Edge Android, ou l\'APK PWABuilder (TWA) avec Bluetooth activé.</p>':'')+
 '</div>'+
 '<div class="card"><div class="row obd-tabs">'+
  ['dtc','jdd','ecus','live','cal','act','log'].map(function(t){
   var lbl={dtc:'📋 Défauts',jdd:'🧊 JDD',ecus:'🧠 Calculateurs',live:'📈 Live',cal:'🔧 Calibrages',act:'⚙️ Actionneurs',log:'📜 Journal'}[t];
   return '<button class="chipf '+(ST.tab===t?'on':'')+'" data-obdtab="'+t+'">'+lbl+'</button>'}).join('')+
 '</div><div id="obdTab"></div></div>'+
 '<div class="card"><h2>📤 Rapport</h2><div class="row">'+
  '<button class="pri" data-obd="report">📤 Export JSON complet</button>'+
  '<button data-obd="pdf">🖨️ Rapport PDF</button>'+
  '<button data-obd="inject">🧠 Injecter les DTC dans l\'étude</button>'+
 '</div></div>';
 renderTab();bind()}
function renderTab(){
 var h=$('#obdTab');if(!h)return;
 if(ST.tab==='dtc')h.innerHTML=dtcHtml();
 else if(ST.tab==='jdd')h.innerHTML=jddHtml();
 else if(ST.tab==='ecus')h.innerHTML=ecusHtml();
 else if(ST.tab==='live')h.innerHTML=liveHtml();
 else if(ST.tab==='cal')h.innerHTML=calHtml();
 else if(ST.tab==='act')h.innerHTML=actHtml();
 else h.innerHTML='<pre class="doc" id="obdLog">'+ST.log.slice(0,200).map(function(x){return esc(x.t.slice(11,19))+' '+esc(x.m)}).join('\n')+'</pre>';
 if(ST.tab==='dtc')renderDtc();if(ST.tab==='ecus')renderEcus();if(ST.tab==='live')renderLive();if(ST.tab==='cal')renderCal()}
function dtcHtml(){
 return '<div class="row" style="margin-bottom:10px">'+
 '<button class="pri" data-obd="readall">📋 Lire tous les défauts (moteur + tous calculateurs)</button>'+
 '<button data-obd="clearobd" class="danger">🧹 Effacer moteur</button>'+
 '<button data-obd="clearall" class="danger">🧹 Effacer tous</button></div>'+
 '<div id="obdDtc"><p class="mut">Lancez la lecture. Les codes sont corrélés à la méga-base (marque + modèle + motorisation + puissance + année).</p></div>'}
function renderDtc(){
 var el=$('#obdDtc');if(!el)return;
 var keys=Object.keys(ST.dtc);
 if(!keys.length){el.innerHTML='<p class="mut">Aucune lecture effectuée.</p>';return}
 el.innerHTML=keys.map(function(k){
  var d=ST.dtc[k];
  var groups=[['stored','Confirmés','b-crit'],['pending','En attente','b-elev'],['permanent','Permanents','b-fire'],['history','Historique','b-dtc']];
  var body=groups.map(function(g){
   var arr=d[g[0]]||[];if(!arr.length)return '';
   return '<div style="margin:6px 0"><b>'+g[1]+' ('+arr.length+')</b><div>'+arr.map(function(c){
    return '<span class="badge '+g[2]+'" title="'+esc(c.label||'')+'">'+esc(c.code)+
     (c.failed?' ⚠️':'')+(c.confirmed?' ✔':'')+'</span>'}).join(' ')+'</div>'+
    arr.filter(function(c){return c.label}).map(function(c){return '<p class="mut">'+esc(c.code)+' — '+esc(c.label)+'</p>'}).join('')+
    '</div>'}).join('');
  if(!body)body='<p class="mut st-ok">✅ Aucun défaut.</p>';
  return '<div class="card"><h3>'+esc(d.name)+' <span class="badge b-dtc">'+esc(k)+'</span></h3>'+body+
   (d.counters?'<p class="mut">Compteurs : '+esc(d.counters)+'</p>':'')+
   ((d.snapshots||[]).length?'<p class="mut">'+d.snapshots.length+' enregistrement(s) JDD → onglet 🧊 JDD</p>':'')+
   '</div>'}).join('')}
function jddHtml(){
 var out='<p class="mut">Journal des défauts : images figées (freeze frames), enregistrements étendus, statut et compteurs d\'occurrence.</p>';
 var any=false;
 Object.keys(ST.dtc).forEach(function(k){
  var d=ST.dtc[k];if(!(d.snapshots||[]).length)return;any=true;
  out+='<div class="card"><h3>'+esc(d.name)+'</h3>'+d.snapshots.map(function(s){
   return '<div class="card"><b>'+esc(s.dtc)+'</b> <span class="badge">'+esc(s.type)+'</span>'+
    '<pre class="doc">'+esc(s.raw)+'</pre>'+decodeSnap(s)+'</div>'}).join('')+'</div>'});
 Object.keys(ST.dtc).forEach(function(k){
  var d=ST.dtc[k];
  (d.stored||[]).forEach(function(c){
   any=true;
   out+='<div class="card"><b>'+esc(c.code)+'</b> — statut 0x'+('0'+c.status.toString(16)).slice(-2).toUpperCase()+
    ' <span class="badge '+(c.failed?'b-crit':'')+'">'+(c.failed?'en échec':'')+'</span>'+
    ' <span class="badge '+(c.confirmed?'b-elev':'')+'">'+(c.confirmed?'confirmé':'')+'</span>'+
    ' <span class="badge">'+(c.pending?'en attente':'')+'</span>'+
    ' <span class="badge">'+(c.testNotComplete?'test non terminé':'')+'</span>'+
    (c.label?'<p class="mut">'+esc(c.label)+'</p>':'')+'</div>'})});
 if(!any)out+='<p class="mut">Lancez d\'abord la lecture des défauts.</p>';
 return out}
function decodeSnap(s){
 if(!s.rec||s.rec.length<6)return '';
 var out=[];
 try{
  var rec=s.rec,i=0;
  while(i<rec.length-2){
   var did=('0'+rec[i].toString(16)).slice(-2).toUpperCase()+('0'+rec[i+1].toString(16)).slice(-2).toUpperCase();
   var name=DB.DID[did];
   if(name){out.push('<span class="badge b-dtc">'+did+' '+esc(name)+'</span>')}
   i++}
 }catch(e){}
 return out.length?'<div>'+out.join(' ')+'</div>':''}
function ecusHtml(){
 return '<div class="row" style="margin-bottom:10px">'+
 '<button class="pri" data-obd="scan">🔎 Scanner les calculateurs (ciblé '+esc(brandLabel())+')</button>'+
 '<button data-obd="scandeep">🌐 Scan large 0x600–0x7FF</button>'+
 '<button data-obd="kwp">🔌 Scan KWP2000 (K-Line, anciens)</button></div>'+
 '<div id="obdEcus"><p class="mut">Le scan interroge chaque adresse, identifie le calculateur (nom système, référence pièce, matériel, logiciel, série, VIN) et le rend disponible pour la lecture, les calibrages et les tests actionneurs.</p></div>'}
function renderEcus(){
 var el=$('#obdEcus');if(!el)return;
 if(!ST.ecus.length){el.innerHTML='<p class="mut">Aucun calculateur détecté. Lancez un scan (contact mis).</p>';return}
 el.innerHTML='<table class="kv"><tr><td><b>Adresse</b></td><td><b>Calculateur</b></td></tr>'+
 ST.ecus.map(function(e){
  return '<tr><td><span class="badge b-dtc">0x'+h4(e.tx)+' → 0x'+h4(e.rx)+'</span></td><td><b>'+esc(e.name)+'</b>'+
   (e.guess&&e.guess!==e.name?'<br><span class="mut">'+esc(e.guess)+'</span>':'')+
   (e.part?'<br><span class="mut">Pièce : '+esc(e.part)+'</span>':'')+
   (e.hw?'<br><span class="mut">HW : '+esc(e.hw)+'</span>':'')+
   (e.sw?'<br><span class="mut">SW : '+esc(e.sw)+'</span>':'')+
   (e.serial?'<br><span class="mut">Série : '+esc(e.serial)+'</span>':'')+
   (e.dtc?'<br><span class="badge '+((e.dtc.stored||[]).length?'b-crit':'b-mod')+'">'+((e.dtc.stored||[]).length)+' défaut(s)</span>':'')+
   '</td></tr>'}).join('')+'</table>'}
function liveHtml(){
 return '<div class="row" style="margin-bottom:10px">'+
 '<button class="pri" data-obd="liveon">▶️ Démarrer le flux live</button>'+
 '<button data-obd="liveoff">⏹ Arrêter</button></div>'+
 '<div id="obdLive" class="grid g3"><p class="mut">Démarrez le flux pour lire les paramètres moteur en temps réel.</p></div>'}
function renderLive(){
 var el=$('#obdLive');if(!el)return;
 if(!ST.live.length){el.innerHTML='<p class="mut">Flux arrêté.</p>';return}
 el.innerHTML=ST.live.map(function(it){
  return '<div class="card" style="text-align:center"><div class="mut">'+esc(it.n)+'</div>'+
   '<div class="stat" style="font-size:22px">'+esc(String(it.v))+'</div><div class="dim">'+esc(it.u)+'</div></div>'}).join('')}
function calHtml(){
 var opts=ST.ecus.map(function(e){return '<option value="'+e.tx+'">0x'+h4(e.tx)+' — '+esc(e.name)+'</option>'}).join('');
 var groups={};DB.CAL.forEach(function(c){(groups[c.g]=groups[c.g]||[]).push(c)});
 return '<div class="card '+(ST.workshop?'':'jr')+'">'+
 '<p class="mut"><b>Calibrages / apprentissages assistés.</b> Chaque procédure vérifie les préconditions lisibles (tension, température, régime, vitesse), '+
 'ouvre une session étendue, maintient le TesterPresent, exécute les routines UDS et journalise tout. '+
 'Les identifiants de routine/DID sont <b>éditables</b> : ils doivent être confirmés sur le calculateur (lecture 0x19/0x22) car ils varient selon la référence et le logiciel.</p>'+
 (ST.workshop?'':'<p class="st-warn"><b>🔒 Mode atelier désactivé.</b> Activez-le pour exécuter une écriture.</p>')+
 '<div class="grid g2"><div><label>Calculateur cible</label><select id="obdCalEcu">'+(opts||'<option value="">— lancez un scan —')+'</option></select></div>'+
 '<div><label>Clé d\'accès sécurité (hex, documentation constructeur)</label><input id="obdKey" value="'+esc(ST.key||LS.g('obdKey',''))+'" placeholder="ex. 1A2B3C4D"></div></div>'+
 '<p class="dim">Aucun contournement d\'antidémarrage ou de sécurité n\'est fourni : la clé doit provenir de votre documentation technique légitime.</p>'+
 '</div>'+
 Object.keys(groups).map(function(g){
  return '<div class="card"><h3>'+esc(g)+'</h3>'+groups[g].map(function(c){
   return '<div class="card"><b>'+esc(c.n)+'</b> <span class="badge '+(c.risk.indexOf('TRÈS')>=0?'b-crit':c.risk.indexOf('ÉLEVÉ')>=0?'b-fire':'b-elev')+'">'+esc(c.risk)+'</span>'+
    '<p class="mut">'+c.brands.length+' marques · '+c.steps.length+' étapes · après : '+esc(c.post)+'</p>'+
    '<details><summary class="mut">Voir les étapes</summary><ol class="mut">'+c.steps.map(function(s){return '<li>'+esc(s.t)+(s.uds?' <code>'+esc(s.uds)+'</code>':'')+(s.sec?' 🔑':'')+'</li>'}).join('')+'</ol></details>'+
    '<button class="pri" data-obdcal="'+c.id+'" style="margin-top:8px">▶️ Exécuter</button></div>'}).join('')+'</div>'}).join('')+
 '<div id="obdCalRun"></div>'}
function renderCal(){
 var el=$('#obdCalRun');if(!el||!ST.calRun)return;
 var r=ST.calRun;
 el.innerHTML='<div class="card accent"><h3>🔧 '+esc(r.cal.n)+' — '+esc(r.ecu.name)+'</h3>'+
 '<p class="mut">'+esc(r.t)+(r.done?' · terminé':' · en cours')+'</p>'+
 '<table class="kv"><tr><td><b>Préconditions</b></td><td>'+r.pre.items.map(function(i){
  return '<div>'+(i.ok===true?'✅':i.ok===false?'❌':'ℹ️')+' '+esc(i.l)+' : '+esc(i.v)+'</div>'}).join('')+'</td></tr>'+
 r.steps.map(function(s,i){return '<tr><td>Étape '+(i+1)+'</td><td>'+esc(s.t)+'<br><b>'+esc(s.res)+'</b></td></tr>'}).join('')+
 '</table>'+(r.done?'<p class="mut"><b>Après intervention :</b> '+esc(r.cal.post)+'</p>':'')+'</div>'}
function actHtml(){
 var opts=ST.ecus.map(function(e){return '<option value="'+e.tx+'">0x'+h4(e.tx)+' — '+esc(e.name)+'</option>'}).join('');
 var groups={};DB.ACT.forEach(function(a){(groups[a.g]=groups[a.g]||[]).push(a)});
 return '<div class="card '+(ST.workshop?'':'jr')+'">'+
 '<p class="mut"><b>Tests actionneurs</b> (UDS 0x2F InputOutputControlByIdentifier). Activation limitée dans le temps puis '+
 '<b>retour automatique à l\'état normal</b> (returnControlToECU). DID éditable : à confirmer sur le calculateur.</p>'+
 (ST.workshop?'':'<p class="st-warn"><b>🔒 Mode atelier désactivé.</b></p>')+
 '<div class="grid g2"><div><label>Calculateur cible</label><select id="obdActEcu">'+(opts||'<option value="">— lancez un scan —')+'</option></select></div>'+
 '<div><label>&nbsp;</label><button class="danger" data-obd="actstop" style="width:100%">⏹ ARRÊT GLOBAL / retour état normal</button></div></div></div>'+
 Object.keys(groups).map(function(g){
  return '<div class="card"><h3>'+esc(g)+'</h3><div class="grid g2">'+groups[g].map(function(a){
   return '<div class="card"><b>'+esc(a.n)+'</b><p class="mut">'+esc(a.risk)+' · '+Math.round(a.dur/1000)+' s</p>'+
    '<div class="row"><input id="act_'+a.id+'" value="'+esc(a.did.replace(/^2F/,''))+'" placeholder="DID hex" style="max-width:110px">'+
    '<input id="actp_'+a.id+'" placeholder="params hex (opt.)" style="max-width:130px">'+
    '<button class="pri" data-obdact="'+a.id+'">▶️</button></div></div>'}).join('')+'</div></div>'}).join('')}
function bind(){
 var v=$('#view');if(!v||v._ob)return;v._ob=1;
 v.addEventListener('change',function(e){
  if(e.target.id==='obdBrand'){ST.brand=e.target.value;LS.s('obdBrand',ST.brand);render()}
  if(e.target.id==='obdWs')LS.s('obdWs',e.target.value);
  if(e.target.id==='obdKey'){ST.key=e.target.value.trim();LS.s('obdKey',ST.key)}});
 v.addEventListener('click',async function(e){
  var t=e.target.closest('[data-obdtab]');
  if(t){ST.tab=t.dataset.obdtab;render();return}
  var c=e.target.closest('[data-obdcal]');
  if(c){await runCal(c.dataset.obdcal);return}
  var a=e.target.closest('[data-obdact]');
  if(a){await runAct(a.dataset.obdact);return}
  var b=e.target.closest('[data-obd]');if(!b)return;
  var k=b.dataset.obd;
  if(k==='connect')await connect($('#obdKind').value);
  else if(k==='reconnect'){var l=LS.g('obdLast',null);await connect(l?l.kind:'auto')}
  else if(k==='disconnect')await disconnect();
  else if(k==='workshop'){
   if(!ST.workshop){
    if(!confirm('🔓 MODE ATELIER (écriture)\n\nPermet effacement de défauts, calibrages/apprentissages et tests actionneurs.\n\n'+
     'Ces opérations peuvent IMMOBILISER le véhicule ou provoquer des dégâts si les conditions ne sont pas respectées.\n'+
     'Vous intervenez sous votre responsabilité professionnelle, véhicule à l\'arrêt, frein de parking serré, batterie stabilisée.\n\nActiver ?'))return;
    ST.workshop=true;toast('🔓 Mode atelier activé')}
   else{ST.workshop=false;toast('🔒 Lecture seule')}
   LS.s('obdWorkshop',ST.workshop);render()}
  else if(k==='readall')await readAllDtc();
  else if(k==='clearobd')await clearDtc('obd');
  else if(k==='clearall')await clearDtc('all');
  else if(k==='scan')await scanEcus(false);
  else if(k==='scandeep')await scanEcus(true);
  else if(k==='kwp')await scanKwp();
  else if(k==='liveon')startLive();
  else if(k==='liveoff'){stopLive();renderLive()}
  else if(k==='actstop')await actStopAll();
  else if(k==='report')report();
  else if(k==='pdf')reportPdf();
  else if(k==='inject'){
   var all=[];Object.keys(ST.dtc).forEach(function(x){['stored','pending','permanent','history'].forEach(function(f){
    (ST.dtc[x][f]||[]).forEach(function(c){all.push(c.code)})})});
   var uniq=Array.from(new Set(all));
   try{if(typeof S!=='undefined')S.dtc=uniq}catch(e){}
   toast('🧠 '+uniq.length+' DTC injectés dans l\'étude');
   if(typeof window.switchView==='function')window.switchView('etude')}
 });
}
/* ═══════════ NAV ═══════════ */
function hook(){
 try{
  if(typeof NAV!=='undefined'&&Array.isArray(NAV)&&!NAV.some(function(n){return n[0]==='obdpro'})){
   var i=NAV.findIndex(function(n){return n[0]==='obd'});
   NAV.splice(i<0?NAV.length:i+1,0,['obdpro','🔌 OBD Pro'])}
  if(typeof window.switchView==='function'&&!window.switchView.__obdpro){
   var _sv=window.switchView;
   var w=function(v){
    if(v!=='obdpro'){stopLive();return _sv(v)}
    if(typeof S!=='undefined')S.view='obdpro';
    var nav=$('#nav');
    if(nav&&typeof NAV!=='undefined')nav.innerHTML=NAV.map(function(n){
     return '<button data-act="nav" data-k="'+n[0]+'" class="'+(n[0]==='obdpro'?'act':'')+'">'+n[1]+'</button>'}).join('');
    render()};
   w.__obdpro=true;window.switchView=w}
 }catch(e){}}
function css(){
 if($('#obdCss'))return;var s=document.createElement('style');s.id='obdCss';
 s.textContent='.obd-busy{padding:9px 12px;border-radius:10px;background:#38bdf814;border:1px solid #38bdf8;color:#38bdf8;font-size:12.5px;font-weight:700;margin-bottom:10px}'+
 '.obd-tabs{gap:6px;margin-bottom:12px}'+
 '#obdLog{max-height:320px;font-size:11px}'+
 '.ol-ok{color:#22c55e}.ol-warn{color:#f59e0b}.ol-err{color:#ef4444}.ol-info{color:#c4cfe0}'+
 '#obdLog span{color:#5a6a84;margin-right:6px}'+
 '#obdTab details summary{cursor:pointer;padding:4px 0}'+
 '#obdTab ol{margin-left:18px;line-height:1.7}';
 document.head.appendChild(s)}
function boot(){css();hook();ST.key=LS.g('obdKey','');
 window.addEventListener('beforeunload',function(){stopLive();stopTP()});
 document.addEventListener('visibilitychange',function(){if(document.hidden)stopLive()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFObdPro={connect:connect,disconnect:disconnect,scan:scanEcus,read:readAllDtc,
 report:report,pdf:reportPdf,state:ST,elm:E,uds:U,transport:TR,render:render};
})();
