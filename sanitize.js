/* KEV FUSION 2026 — sanitize.js v5.3.0
   Correctif racine : les bases importées/aspirées peuvent contenir dtc, b, m, e, law, cons… sous forme
   de CHAÎNES ou d'objets → « (r.dtc || []).forEach is not a function ».
   Ce module normalise TOUTES les bases (natives + aspirées + distantes) et expose des coerceurs
   défensifs utilisés par correlation.js et predictive.js. Migration one-shot des stocks locaux. */
(function(){
'use strict';
function arr(v){
 if(Array.isArray(v))return v.filter(function(x){return x!=null&&x!==''}).map(function(x){
  return typeof x==='object'?String(x.code||x.t||x.label||x.ref||x.name||''):String(x).trim()}).filter(Boolean);
 if(v==null||v==='')return[];
 if(typeof v==='number')return[String(v)];
 if(typeof v==='string')return v.split(/[,;|\/\n]+|\s{2,}/).map(function(s){return s.trim()}).filter(Boolean);
 if(typeof v==='object')return Object.keys(v).map(function(k){return String(v[k])}).filter(Boolean);
 return[String(v)]}
function dtc(v){
 if(Array.isArray(v)){const out=[];v.forEach(function(x){dtc(x).forEach(function(c){if(out.indexOf(c)<0)out.push(c)})});return out}
 const s=String(v==null?'':v).toUpperCase();
 const m=s.match(/[PCBU][0-9]{4}/g);
 if(m)return Array.from(new Set(m));
 return arr(v).map(function(x){return x.toUpperCase()}).filter(function(x){return /^[PCBU][0-9A-Z]{4}$/.test(x)})}
function txt(v){
 if(Array.isArray(v))return v.filter(function(x){return x!=null&&x!==''}).map(function(x){
  return typeof x==='object'?String(x.t||x.label||x.txt||JSON.stringify(x)):String(x).trim()}).filter(Boolean);
 if(v==null||v==='')return[];
 if(typeof v==='string')return v.split(/\s*[;·\n]\s*/).map(function(s){return s.trim()}).filter(Boolean);
 if(typeof v==='object')return Object.keys(v).map(function(k){return String(v[k])}).filter(Boolean);
 return[String(v)]}
function yrs(v){
 if(Array.isArray(v)&&v.length>=2){const a=+v[0],b=+v[1];if(a&&b)return[Math.min(a,b),Math.max(a,b)]}
 if(Array.isArray(v)&&v.length===1){const a=+v[0];if(a)return[a,a]}
 if(typeof v==='number')return[v,v];
 if(typeof v==='string'){const m=v.match(/(19|20)\d{2}/g);
  if(m&&m.length>=2)return[+m[0],+m[m.length-1]];if(m&&m.length===1)return[+m[0],+m[0]]}
 return null}
function num(v){const n=typeof v==='number'?v:parseInt(String(v==null?'':v).replace(/[^\d]/g,''),10);return isFinite(n)&&n>0?n:null}
function normFault(k){
 if(!k||typeof k!=='object')return null;
 return{id:String(k.id||k.t||k.titre||('x'+Math.random().toString(36).slice(2,8))),
  t:String(k.t||k.titre||k.title||k.panne||k.nom||'Sans titre'),
  b:arr(k.b||k.marques||k.marque),s:String(k.s||k.systeme||k.system||'Général'),
  g:String(k.g||k.gravite||'Modéré'),f:!!(k.f||k.incendie||k.fire),
  dtc:dtc(k.dtc||k.DTC||k.codes),sym:txt(k.sym||k.symptomes),
  mec:String(k.mec||k.mecanisme||k.description||''),ch:String(k.ch||k.chaine||''),
  cons:txt(k.cons||k.consequences),prv:txt(k.prv||k.preuves),tst:txt(k.tst||k.tests),
  sec:String(k.sec||k.securite||'—'),law:arr(k.law||k.juridique),src:k.src||''}}
function normRecall(r){
 if(!r||typeof r!=='object')return null;
 const y=yrs(r.y||r.years||r.annees);
 return{id:String(r.id||r.t||('r'+Math.random().toString(36).slice(2,8))),
  t:String(r.t||r.titre||r.title||'Rappel'),b:arr(r.b||r.marques||r.marque),
  m:arr(r.m||r.modeles||r.modele),y:y||[1990,2030],
  fire:!!(r.fire||r.incendie),risk:String(r.risk||r.risque||r.description||''),
  dtc:dtc(r.dtc||r.DTC||r.codes),src:String(r.src||r.source||'Base fusion'),
  law:arr(r.law||r.juridique)}}
function normTsb(t){
 if(!t||typeof t!=='object')return null;
 const y=yrs(t.y||t.years);
 return{id:String(t.id||t.ref||('t'+Math.random().toString(36).slice(2,8))),
  ref:String(t.ref||t.id||'TSB'),b:arr(t.b||t.marques),m:arr(t.m||t.modeles),
  e:arr(t.e||t.motorisations||t.engines),sys:String(t.sys||t.systeme||t.system||'Général'),
  g:String(t.g||t.gravite||'Élevé'),s:String(t.s||t.summary||t.description||''),
  dtc:dtc(t.dtc||t.codes),y:y||[1990,2030]}}
const A={arr:arr,dtc:dtc,txt:txt,yrs:yrs,num:num,fault:normFault,recall:normRecall,tsb:normTsb};
window.KFnorm=A;
/* ---------- migration one-shot des stocks locaux ---------- */
function migrate(){
 try{
  const kb=ls.get('kbx',[]);
  if(Array.isArray(kb)){const out=kb.map(normFault).filter(Boolean);ls.set('kbx',out)}
  const rx=ls.get('recx',[]);
  if(Array.isArray(rx)){const out=rx.map(normRecall).filter(Boolean);ls.set('recx',out)}
  const vx=ls.get('vehx',{});
  if(vx&&typeof vx==='object'){const o={};
   Object.keys(vx).forEach(function(b){const mm=vx[b];if(!mm||typeof mm!=='object')return;o[b]={};
    Object.keys(mm).forEach(function(m){o[b][m]=arr(mm[m])})});
   ls.set('vehx',o)}
  const ph=ls.get('photox',[]);
  if(Array.isArray(ph))ls.set('photox',ph.filter(function(p){return p&&p.src}));
  ls.set('normV','5.3.0');
 }catch(e){try{log('warn','migrate '+e.message)}catch(x){}}}
if(typeof ls!=='undefined'&&ls.get('normV','')!=='5.3.0')migrate();
/* ---------- wrappers : toute consommation reçoit des tableaux ---------- */
function wrap(){
 if(typeof window.KBall==='function'&&!window.KBall.__kfNorm){
  const _kb=window.KBall;
  const w=function(){try{return(_kb()||[]).map(normFault).filter(Boolean)}catch(e){return[]}};
  w.__kfNorm=true;window.KBall=w}
 if(typeof window.Rall==='function'&&!window.Rall.__kfNorm){
  const _r=window.Rall;
  const w=function(){try{return(_r()||[]).map(normRecall).filter(Boolean)}catch(e){return[]}};
  w.__kfNorm=true;window.Rall=w}
 if(typeof TSBDB!=='undefined'&&Array.isArray(TSBDB)&&!TSBDB.__kfNorm){
  for(let i=0;i<TSBDB.length;i++){const n=normTsb(TSBDB[i]);if(n)TSBDB[i]=n}
  try{Object.defineProperty(TSBDB,'__kfNorm',{value:true,enumerable:false})}catch(e){}}
 if(typeof RECALLS!=='undefined'&&Array.isArray(RECALLS)&&!RECALLS.__kfNorm){
  for(let i=0;i<RECALLS.length;i++){const n=normRecall(RECALLS[i]);if(n)RECALLS[i]=n}
  try{Object.defineProperty(RECALLS,'__kfNorm',{value:true,enumerable:false})}catch(e){}}}
wrap();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wrap);else wrap();
window.KFsanitize={wrap:wrap,migrate:migrate};
})();
