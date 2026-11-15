/* KEV FUSION 2026 — correlation.js v6.0.0
   Corrélation par CODE MOTEUR : résolution libellé → codes, puis matching direct des fiches FAULTS
   (+ base historique KB). Aucune exclusion bloquante : tout ce qui concerne le moteur remonte. */
(function(){
'use strict';
if(typeof KBall!=='function'){console.warn('correlation.js: base indisponible');return}
const A=window.KFnorm||{arr:function(v){return Array.isArray(v)?v:(v==null||v===''?[]:[String(v)])},
 dtc:function(v){return Array.isArray(v)?v:(String(v||'').toUpperCase().match(/[PCBU][0-9]{4}/g)||[])},
 txt:function(v){return Array.isArray(v)?v:(v==null||v===''?[]:String(v).split(/\s*[;·\n]\s*/).filter(Boolean))},
 yrs:function(v){if(Array.isArray(v)&&v.length>=2)return[+v[0],+v[1]];if(typeof v==='number')return[v,v];return null},
 num:function(v){const n=parseInt(String(v==null?'':v).replace(/[^\d]/g,''),10);return isFinite(n)&&n>0?n:null}};
const WIN=[1995,2027];
function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
function fuelGroup(f){const n=norm(f);
 if(/electri|\bev\b|kwh|e-208|e-2008|leaf|tesla|id\.[3457]/.test(n))return'electrique';
 if(/hybride|hybrid|phev|e-tech|e:hev|plug-in/.test(n))return'hybride';
 if(/diesel|hdi|tdi|dci|cdti|crdi|bluehdi|ecoblue|multijet|jtd|d-4d|skyactiv-d|cdi|\bd\d?\b/.test(n))return'diesel';
 if(/essence|puretech|thp|tsi|tfsi|tce|ecoboost|vtec|gdi|mpi|t-gdi|skyactiv-g|boxer|vvt-i|twinair|fire|vti|sce/.test(n))return'essence';
 return''}
function powersOf(t){const out=[];const n=norm(t);let m;const re=/\b(\d{2,3})\s?(?:ch|cv|hp)\b/g;
 while((m=re.exec(n)))out.push(+m[1]);return Array.from(new Set(out))}
function signature(v){
 v=v||{};
 const label=norm(v.engine||v.motor||'');
 const fuel=fuelGroup(v.fuel||v.energie||'')||fuelGroup(label);
 const dm=label.match(/(\d\.\d)/);
 const ch=A.num(v.ch)||(label.match(/(\d{2,3})\s*(?:ch|cv|hp)?\s*$/)?+label.match(/(\d{2,3})\s*(?:ch|cv|hp)?\s*$/)[1]:null);
 const codes=(typeof engineCodes==='function')?engineCodes(label,v.brand):[];
 const y=A.yrs(v.y);
 return{brand:v.brand||'',model:v.model||'',engine:v.engine||v.motor||'',ch:ch,kw:ch?Math.round(ch*0.7355):null,
  disp:dm?dm[1]:'',fuelGroup:fuel,codes:codes,years:y||[2015,2027],
  codeLabel:codes.join(', ')||'code moteur non résolu'}}
function yrOK(fy,vy){if(!fy||!fy.length)return true;const a=fy[0],b=fy[1];
 const c=vy&&vy[0]?vy[0]:WIN[0],d=vy&&vy[1]?vy[1]:WIN[1];return a<=d&&b>=c}
function chOK(fch,ch){if(!fch||!fch.length||!ch)return true;
 return fch.some(function(x){return Math.abs(+x-+ch)<=6})}
function modelOK(fm,model){const L=A.arr(fm);if(!model||!L.length||L.indexOf('*')>=0)return true;
 const n=norm(model);return L.some(function(m){const x=norm(m);return n.indexOf(x)>=0||x.indexOf(n)>=0})}
function brandOK(fb,brand){const L=A.arr(fb);return L.indexOf('*')>=0||L.indexOf(brand)>=0}
function fuelOK(ff,g){if(!ff||!g)return true;
 if(ff===g)return true;
 if(g==='hybride'&&(ff==='diesel'||ff==='essence'))return true;
 return false}
function normalizeFault(f){
 return{id:f.id,t:f.t,eng:A.arr(f.eng),b:A.arr(f.b),m:A.arr(f.m),y:A.yrs(f.y)||WIN,ch:A.arr(f.ch).map(Number).filter(Boolean),
  fuel:f.fuel||'',s:f.s||'Général',g:f.g||'Élevé',f:!!f.f,dtc:A.dtc(f.dtc),sym:A.txt(f.sym),mec:f.mec||'',ch2:f.ch&&typeof f.ch==='string'?f.ch:'',
  cons:A.txt(f.cons),prv:A.txt(f.prv),tst:A.txt(f.tst),act:A.txt(f.act),sec:f.sec||'—',law:A.arr(f.law),
  tsb:f.tsb||null,rec:f.rec||null,generic:!!f.generic,src:f.src||'Base ingénieur'}}
function legacyFault(k){
 const t=norm((k.t||'')+' '+(k.mec||'')+' '+(k.s||''));
 let fuel='';
 if(/hdi|dci|tdi|cdti|crdi|diesel|adblue|scr|nox|suies|coking|multijet|jtd|ecoblue|skyactiv-d|egr|fap/.test(t)&&!/gpf|essence|puretech|thp|tsi|tce/.test(t))fuel='diesel';
 else if(/puretech|thp|tsi|tfsi|tce|ecoboost|vtec|gdi|mpi|boxer|lspi|calamine|gpf|essence|allumage|bougie/.test(t))fuel='essence';
 else if(/pack ht|bms|soh|li-ion|runaway|tesla|leaf|dc\/dc/.test(t))fuel='electrique';
 else if(/hybride|hybrid|inverter|e:hev/.test(t))fuel='hybride';
 return{id:k.id,t:k.t,eng:[],b:A.arr(k.b),m:['*'],y:WIN,ch:[],fuel:fuel,s:k.s||'Général',g:k.g||'Élevé',f:!!k.f,
  dtc:A.dtc(k.dtc),sym:A.txt(k.sym),mec:k.mec||'',ch2:typeof k.ch==='string'?k.ch:'',cons:A.txt(k.cons),prv:A.txt(k.prv),
  tst:A.txt(k.tst),act:[],sec:k.sec||'—',law:A.arr(k.law),tsb:null,rec:null,generic:A.arr(k.b).indexOf('*')>=0,src:'Base historique'}}
function correlate(v,opts){
 opts=opts||{};const strict=opts.strict!==false;
 const read=A.dtc(opts.readDtc).map(function(x){return x.toUpperCase()});
 const sig=signature(v);
 const trace={total:0,engine:0,model:0,fuel:0,year:0,power:0,kept:0,fallback:false,codes:sig.codes};
 const empty={sig:sig,faults:[],dtc:[],recalls:[],tsb:[],modelDtc:[],trace:trace};
 if(!v||!v.brand)return empty;
 const pool=[];
 try{(typeof FAULTS!=='undefined'?FAULTS:[]).forEach(function(f){const n=normalizeFault(f);if(n&&n.t)pool.push(n)})}catch(e){}
 try{KBall().forEach(function(k){if(k&&k.t)pool.push(legacyFault(k))})}catch(e){}
 trace.total=pool.length;
 const seen={},kept=[];
 pool.forEach(function(f){
  const key=norm(f.t);if(seen[key])return;
  if(!brandOK(f.b,v.brand)&&!f.generic)return;
  const engHit=f.eng.length&&sig.codes.length&&f.eng.some(function(c){return sig.codes.indexOf(c)>=0});
  const modHit=modelOK(f.m,v.model)&&A.arr(f.m).indexOf('*')<0&&!!v.model;
  const blob=norm(f.t+' '+f.mec+' '+f.s+' '+f.sym.join(' '));
  const engTextHit=!!sig.engine&&(blob.indexOf(norm(sig.engine))>=0||(sig.disp&&blob.indexOf(sig.disp)>=0));
  const fOK=fuelOK(f.fuel,sig.fuelGroup);
  const yOK=yrOK(f.y,sig.years);
  const pOK=chOK(f.ch,sig.ch);
  if(!fOK)return;
  trace.fuel++;
  if(!yOK)return;
  trace.year++;
  const dtcHit=f.dtc.filter(function(d){return read.indexOf(d)>=0});
  const genericOK=f.generic&&(!strict||f.s);
  if(!(engHit||engTextHit||modHit||dtcHit.length||genericOK||(brandOK(f.b,v.brand)&&!f.eng.length&&f.fuel===sig.fuelGroup)))return;
  if(strict&&!pOK&&!engHit&&!dtcHit.length)return;
  let sc=0;const why=[];
  if(engHit){sc+=10;why.push('code moteur '+f.eng.filter(function(c){return sig.codes.indexOf(c)>=0}).join('/'));trace.engine++}
  if(engTextHit){sc+=5;why.push('motorisation/cylindrée dans la fiche')}
  if(modHit){sc+=5;why.push('modèle cité');trace.model++}
  if(brandOK(f.b,v.brand)&&A.arr(f.b).indexOf('*')<0){sc+=3;why.push('marque')}
  if(f.fuel&&f.fuel===sig.fuelGroup){sc+=3;why.push('énergie '+f.fuel)}
  if(sig.ch&&f.ch.length&&pOK){sc+=3;why.push('puissance '+sig.ch+' ch');trace.power++}
  if(dtcHit.length){sc+=4;why.push('DTC lus '+dtcHit.join(','))}
  if(f.generic){sc+=1;why.push('fiche système générique')}
  if(!yOK)sc-=2;
  const relevance=sc>=15?'DIRECT motorisation':sc>=10?'FORT moteur+modèle':sc>=6?'COMPATIBLE système':'GÉNÉRIQUE compatible';
  const legal=f.law.map(function(id){try{const l=txtById(id);return l&&l.t?l:null}catch(e){return null}}).filter(Boolean);
  seen[key]=1;
  kept.push(Object.assign({},f,{ch:f.ch2||'',sc:sc,why:why,relevance:relevance,readHits:dtcHit,legal:legal,
   linkTsb:f.tsb?[{ref:f.tsb,sys:f.s,s:f.tsb,g:f.g,y:f.y,dtc:f.dtc,e:f.eng,b:f.b,m:f.m}]:[],
   linkRec:f.rec?[{t:f.rec,src:'Campagne / TSB',risk:f.t,y:f.y,dtc:f.dtc,law:f.law,fire:f.f}]:[]}))});
 /* rappels/TSB globaux compatibles */
 let recalls=[],tsb=[];
 try{recalls=Rall().filter(function(r){
  if(!r)return false;
  if(!brandOK(r.b,v.brand))return false;
  if(!modelOK(r.m,v.model))return false;
  if(!yrOK(A.yrs(r.y),sig.years))return false;
  const rf=fuelGroup(r.t+' '+r.risk);
  if(rf&&sig.fuelGroup&&!fuelOK(rf,sig.fuelGroup))return false;
  return true}).map(function(r){return Object.assign({},r,{b:A.arr(r.b),m:A.arr(r.m),dtc:A.dtc(r.dtc),law:A.arr(r.law),y:A.yrs(r.y)||WIN})})}catch(e){}
 try{tsb=(typeof TSBDB!=='undefined'&&Array.isArray(TSBDB)?TSBDB:[]).filter(function(t){
  if(!t)return false;
  if(A.arr(t.b).indexOf(v.brand)<0)return false;
  if(!modelOK(t.m,v.model))return false;
  if(!yrOK(A.yrs(t.y),sig.years))return false;
  if(v.engine){const sel=norm(v.engine);
   const hit=A.arr(t.e).some(function(e){const n=norm(e);return sel.indexOf(n.split(' ')[0])>=0||n.indexOf(sel.split(' ')[0])>=0})||
    A.arr(t.e).some(function(e){return typeof engineCodes==='function'&&engineCodes(e,v.brand).some(function(c){return sig.codes.indexOf(c)>=0})});
   if(!hit&&sig.codes.length)return false}
  return true}).map(function(t){return Object.assign({},t,{b:A.arr(t.b),m:A.arr(t.m),e:A.arr(t.e),dtc:A.dtc(t.dtc),y:A.yrs(t.y)||WIN})})}catch(e){}
 /* fusion des TSB/rappels portés par les fiches */
 kept.forEach(function(f){
  A.arr(f.linkTsb).forEach(function(t){if(t&&t.ref&&!tsb.some(function(x){return x.ref===t.ref&&x.sys===t.sys}))tsb.push(t)});
  A.arr(f.linkRec).forEach(function(r){if(r&&r.t&&!recalls.some(function(x){return x.t===r.t}))recalls.push(r)})});
 if(!kept.length){
  trace.fallback=true;
  pool.filter(function(f){return brandOK(f.b,v.brand)||f.generic}).slice(0,16).forEach(function(f){
   const legal=f.law.map(function(id){try{return txtById(id)}catch(e){return null}}).filter(Boolean);
   kept.push(Object.assign({},f,{ch:f.ch2||'',sc:3,why:['marque / système','repli ingénieur'],relevance:'COMPATIBLE marque (repli)',
    readHits:[],legal:legal,linkTsb:[],linkRec:[]}))})}
 kept.sort(function(a,b){return b.sc-a.sc||String(a.t).localeCompare(String(b.t))});
 trace.kept=kept.length;
 const map={};kept.forEach(function(f){A.dtc(f.dtc).forEach(function(d){(map[d]=map[d]||[]).push(f.t)})});
 recalls.forEach(function(r){A.dtc(r.dtc).forEach(function(d){if(!map[d])map[d]=['Campagne : '+r.t]})});
 tsb.forEach(function(t){A.dtc(t.dtc).forEach(function(d){if(!map[d])map[d]=['TSB : '+t.ref]})});
 const md=[];recalls.forEach(function(r){A.dtc(r.dtc).forEach(function(d){if(md.indexOf(d)<0)md.push(d)})});
 tsb.forEach(function(t){A.dtc(t.dtc).forEach(function(d){if(md.indexOf(d)<0)md.push(d)})});
 const dtcList=Object.keys(map).sort().map(function(d){return{code:d,faults:map[d],read:read.indexOf(d)>=0,fromModel:md.indexOf(d)>=0}});
 return{sig:sig,faults:kept,dtc:dtcList,recalls:recalls,tsb:tsb,modelDtc:md,trace:trace}}
window.KFCorr={correlate:correlate,signature:signature,norm:norm,fuelGroup:fuelGroup,powersOf:powersOf,WIN:WIN,
 arr:A.arr,dtc:A.dtc,txt:A.txt,systemsFor:function(){return['*']},annotate:function(k){return{fuel:'',families:new Set(),system:k.s,powers:[]}}};
})();
