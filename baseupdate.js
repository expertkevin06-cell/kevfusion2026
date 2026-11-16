/* KEV FUSION 2026 — baseupdate.js v1.0.0
   Mises à jour manuelles de la base (admin) : import JSON/CSV catalogue/pannes/rappels,
   moissonnage officiel RappelConso / NHTSA / Safety Gate, validation KFCatalog,
   sauvegarde locale + restauration, fusion dans vehx/kbx/recx. */
(function(){
'use strict';
if(typeof ls==='undefined'||typeof sha256!=='function'){console.warn('baseupdate: prérequis');return}
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
function toast(m){if(typeof window.toast==='function')window.toast(m);else alert(m)}
function objs(v){return Array.isArray(v)?v.filter(function(x){return x&&typeof x==='object'}):(v&&typeof v==='object'?[v]:[])}
function arr(v){if(Array.isArray(v))return v.map(function(x){return typeof x==='object'?String(x.l||x.code||x.t||''):String(x)}).filter(Boolean);
 if(v==null||v==='')return[];return String(v).split(/[,;|\/\n]+/).map(function(s){return s.trim()}).filter(Boolean)}
function dtc(v){if(Array.isArray(v)){var o=[];v.forEach(function(x){dtc(x).forEach(function(c){if(o.indexOf(c)<0)o.push(c)})});return o}
 var m=String(v||'').toUpperCase().match(/[PCBU][0-9]{4}/g);return m?Array.from(new Set(m)):[]}
function yrs(v){if(Array.isArray(v)&&v.length>=2)return[+v[0],+v[1]];if(typeof v==='number')return[v,v];
 if(typeof v==='string'){var m=v.match(/(19|20)\d{2}/g);if(m&&m.length>=2)return[+m[0],+m[m.length-1]];if(m)return[+m[0],+m[0]]}return null}
function num(v){var n=parseInt(String(v||'').replace(/[^\d]/g,''),10);return isFinite(n)&&n>0?n:null}
var C=window.KFCatalog;
function validMake(m){return C?(C.resolveMake(m)||m):m}
function validPair(m,mo){if(!C)return true;return C.isPairValid(validMake(m),mo)}
/* ---- sauvegarde ---- */
function backup(){
 var s={ts:Date.now(),kbx:ls.get('kbx',[]),recx:ls.get('recx',[]),vehx:ls.get('vehx',{})};
 var b=ls.get('baseBackups',[]);b.unshift(s);ls.set('baseBackups',b.slice(0,8));return s}
function restore(i){var b=ls.get('baseBackups',[])[i];if(!b){toast('Sauvegarde introuvable');return}
 ls.set('kbx',b.kbx||[]);ls.set('recx',b.recx||[]);ls.set('vehx',b.vehx||{});toast('💾 Base restaurée');render()}
/* ---- normalisation entrées ---- */
function normCat(e){
 var make=validMake(e.make||e.marque||e.brand);
 var model=e.model||e.modele||e.m;
 if(!make||!model)return null;
 if(!validPair(make,model))return null;
 var engs=objs(e.engines||e.eng||e.motorisations).map(function(x){
  return{l:String(x.l||x.label||x.name||x.motorisation||''),ch:num(x.ch||x.puissance||x.power),
   f:String(x.f||x.fuel||x.energie||'').toLowerCase(),code:String(x.code||x.engineCode||'').toUpperCase(),
   y:yrs(x.y||x.years||x.annees)||[2018,2027]}}).filter(function(x){return x.l});
 if(!engs.length&&e.engine){engs=[{l:String(e.engine),ch:num(e.ch),f:String(e.fuel||'').toLowerCase(),code:String(e.code||'').toUpperCase(),y:yrs(e.y)||[2018,2027]}]}
 return{make:make,model:model,y:yrs(e.y||e.years)||[2018,2027],body:e.body||'',eng:engs}}
function normFault(e){
 var t=e.t||e.titre||e.title||e.panne||e.nom;if(!t)return null;
 var b=arr(e.b||e.marques||e.marque).map(validMake);
 var m=arr(e.m||e.modeles||e.modele);
 if(b.length&&m.length&&m.indexOf('*')<0){
  var ok=m.some(function(mo){return b.some(function(mk){return validPair(mk,mo)})});
  if(!ok)return null}
 return{id:e.id||('u'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),t:String(t),
  eng:arr(e.eng||e.engineCodes||e.codesMoteur).map(function(x){return x.toUpperCase()}),
  b:b,m:m.length?m:['*'],y:yrs(e.y||e.years)||[2018,2027],
  pw:arr(e.pw||e.ch||e.puissances).map(num).filter(Boolean),
  fuel:String(e.fuel||e.energie||'').toLowerCase(),s:e.s||e.systeme||'Général',sys:arr(e.sys||e.systemes),
  g:e.g||e.gravite||'Élevé',fire:!!(e.fire||e.f||e.incendie),dtc:dtc(e.dtc||e.codes),
  sym:arr(e.sym||e.symptomes),mec:e.mec||e.mecanisme||e.description||'',chain:e.chain||e.chaine||'',
  cons:arr(e.cons||e.consequences),prv:arr(e.prv||e.preuves),tst:arr(e.tst||e.tests),act:arr(e.act||e.actions),
  sec:e.sec||e.securite||'—',law:arr(e.law||e.juridique),tsb:e.tsb||null,rec:e.rec||e.rappel||null,generic:!!e.generic}}
function normRecall(e){
 var t=e.t||e.titre||e.title||e.rappel||e.libelle;if(!t)return null;
 return{id:e.id||('r'+Date.now().toString(36)),t:String(t),b:arr(e.b||e.marques||e.marque).map(validMake),
  m:arr(e.m||e.modeles||e.modele),y:yrs(e.y||e.years)||[2018,2027],fire:!!(e.fire||e.incendie),
  risk:e.risk||e.risque||e.description||'',dtc:dtc(e.dtc||e.codes),src:e.src||e.source||'Import',law:arr(e.law||e.juridique)}}
/* ---- fusion ---- */
function mergeCat(list){
 backup();
 var vx=ls.get('vehx',{}),added=0,skip=0;
 list.forEach(function(e){var n=normCat(e);if(!n){skip++;return}
  vx[n.make]=vx[n.make]||{};
  var cur=vx[n.make][n.model]||[];
  n.eng.forEach(function(eng){
   var lab=eng.l+(eng.ch?' '+eng.ch:'');
   if(!cur.some(function(x){return String(x).toLowerCase()===lab.toLowerCase()})){cur.push(lab);added++}});
  vx[n.make][n.model]=cur;
  if(C&&C.CAT){C.CAT[n.make]=C.CAT[n.make]||{};
   var prev=C.CAT[n.make][n.model];
   var merged=n.eng.slice();
   if(prev&&prev.eng)prev.eng.forEach(function(x){if(!merged.some(function(y){return y.l===x.l&&y.ch===x.ch}))merged.push(x)});
   C.CAT[n.make][n.model]={y:n.y,body:n.body,eng:merged};
   var nn=C.norm(n.model);C.OWNER[nn]=C.OWNER[nn]||[];if(C.OWNER[nn].indexOf(n.make)<0)C.OWNER[nn].push(n.make)}});
 ls.set('vehx',vx);
 return{added:added,skip:skip}}
function mergeFaults(list){
 backup();
 var kb=ls.get('kbx',[]),added=0,skip=0;
 var seen={};kb.forEach(function(k){seen[String(k.t).toLowerCase()]=1});
 list.forEach(function(e){var n=normFault(e);if(!n){skip++;return}
  if(seen[n.t.toLowerCase()]){skip++;return}
  seen[n.t.toLowerCase()]=1;kb.push(n);added++;
  if(typeof FAULTS!=='undefined')FAULTS.push(n)});
 ls.set('kbx',kb);return{added:added,skip:skip}}
function mergeRecalls(list){
 backup();
 var rx=ls.get('recx',[]),added=0,skip=0;
 var seen={};rx.forEach(function(r){seen[String(r.t).toLowerCase()]=1});
 list.forEach(function(e){var n=normRecall(e);if(!n){skip++;return}
  if(seen[n.t.toLowerCase()]){skip++;return}
  seen[n.t.toLowerCase()]=1;rx.push(n);added++;
  if(typeof RECALLS!=='undefined')RECALLS.push(n)});
 ls.set('recx',rx);return{added:added,skip:skip}}
/* ---- import fichier ---- */
function parseCSV(txt){
 var lines=txt.split(/\r?\n/).filter(Boolean);if(lines.length<2)return[];
 var sep=lines[0].indexOf(';')>=0?';':',';
 var head=lines[0].split(sep).map(function(h){return h.trim().toLowerCase()});
 return lines.slice(1).map(function(l){
  var cells=l.split(sep),o={};head.forEach(function(h,i){o[h]=(cells[i]||'').trim()});return o})}
function handleFile(file,kind){
 var r=new FileReader();
 r.onload=function(){
  try{
   var txt=r.result,data;
   if(/\.csv$/i.test(file.name))data=parseCSV(txt);
   else{var j=JSON.parse(txt);data=Array.isArray(j)?j:(j.items||j.data||j.faults||j.recalls||j.catalog||j.vehicles||[j])}
   var res;
   if(kind==='cat')res=mergeCat(data);
   else if(kind==='rec')res=mergeRecalls(data);
   else res=mergeFaults(data);
   toast('📥 '+kind+' : +'+res.added+' · '+res.skip+' ignoré(s)');render();
  }catch(e){toast('Import : '+e.message)}};
 r.readAsText(file)}
/* ---- moissonnage officiel ---- */
async function harvestRappelConso(brand){
 var q=encodeURIComponent(brand||'');
 var url='https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso0/records?limit=100'+(q?'&where=search(marque_des_produits,"'+q+'")':'');
 var r=await fetch(url);if(!r.ok)throw new Error('RappelConso HTTP '+r.status);
 var j=await r.json();
 return(j.results||[]).map(function(x){return{t:x.libelle_affichage||x.noms_des_modeles||x.marque_des_produits,
  b:[x.marque_des_produits],m:arr(x.noms_des_modeles),y:yrs(x.date_de_publication)||[2018,2027],
  risk:x.risques_encourus||x.motif_du_rappel||'',dtc:[],src:'RappelConso',law:['CC1245','CONSOL4213']}})}
async function harvestNHTSA(make,model,year){
 var url='https://api.nhtsa.gov/recalls/recallsByVehicle?make='+encodeURIComponent(make)+'&model='+encodeURIComponent(model)+'&modelYear='+(year||2020);
 var r=await fetch(url);if(!r.ok)throw new Error('NHTSA HTTP '+r.status);
 var j=await r.json();
 return(j.results||[]).map(function(x){return{t:x.Subject||x.Component,b:[make],m:[model],y:[+year||2018,+year||2027],
  risk:x.Summary||'',dtc:[],src:'NHTSA '+(x.NHTSACampaignNumber||''),law:['CC1245']}})}
async function harvest(kind){
 var brand=($('#buBrand')||{}).value||'',model=($('#buModel')||{}).value||'',year=($('#buYear')||{}).value||'';
 try{
  var list;
  if(kind==='rc')list=await harvestRappelConso(brand);
  else if(kind==='nhtsa'){if(!brand||!model)throw new Error('Marque + modèle requis');list=await harvestNHTSA(brand,model,year)}
  else throw new Error('Source inconnue');
  var res=mergeRecalls(list);
  toast('🌐 '+kind+' : +'+res.added+' rappel(s) · '+res.skip+' ignoré(s)');render();
 }catch(e){toast('Moissonnage : '+e.message)}}
/* ---- export ---- */
function exportBase(){
 var payload={ts:new Date().toISOString(),catalog:[],faults:ls.get('kbx',[]),recalls:ls.get('recx',[]),vehicles:ls.get('vehx',{})};
 if(C&&C.CAT)Object.keys(C.CAT).forEach(function(mk){Object.keys(C.CAT[mk]).forEach(function(mo){
  var e=C.CAT[mk][mo];payload.catalog.push({make:mk,model:mo,y:e.y,body:e.body,engines:e.eng})})});
 var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
 a.download='kev-fusion-base-'+Date.now()+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},5000);
 toast('📤 Base exportée')}
/* ---- auth ---- */
async function auth(){
 if(typeof S!=='undefined'&&S.role==='admin')return true;
 var pw=($('#buPass')||{}).value||'';
 if(!pw)return false;
 if(await sha256(pw)===ADMIN_HASH){if(typeof S!=='undefined')S.role='admin';return true}
 return false}
/* ---- UI ---- */
function render(){
 var host=$('#buPanel');if(!host)return;
 var b=ls.get('baseBackups',[]);
 var kb=ls.get('kbx',[]),rx=ls.get('recx',[]),vx=ls.get('vehx',{});
 var ncat=0;if(C&&C.CAT)Object.keys(C.CAT).forEach(function(mk){ncat+=Object.keys(C.CAT[mk]).length});
 host.innerHTML=
 '<div class="card gold"><h2>🛠️ Mises à jour manuelles de la base</h2>'+
 '<p class="mut">Import JSON/CSV · moissonnage officiel · validation catalogue · sauvegarde/restauration. Réservé admin.</p>'+
 '<div class="row"><input type="password" id="buPass" placeholder="Mot de passe admin" style="max-width:220px">'+
 '<button class="pri" data-bu="auth">🔓 Déverrouiller</button></div>'+
 '<div class="grid g3" style="margin-top:10px">'+
 '<div class="card"><b>'+ncat+'</b><br><span class="mut">modèles catalogue</span></div>'+
 '<div class="card"><b>'+kb.length+'</b><br><span class="mut">pannes importées</span></div>'+
 '<div class="card"><b>'+rx.length+'</b><br><span class="mut">rappels importés</span></div></div>'+
 '<h3>📥 Import fichier</h3>'+
 '<div class="row">'+
 '<button data-bu="impCat">📚 Catalogue (JSON/CSV)</button>'+
 '<button data-bu="impFault">🔧 Pannes (JSON/CSV)</button>'+
 '<button data-bu="impRec">📣 Rappels (JSON/CSV)</button>'+
 '<button data-bu="export">📤 Exporter toute la base</button></div>'+
 '<input type="file" id="buFile" accept=".json,.csv,application/json,text/csv" hidden>'+
 '<h3>🌐 Moissonnage officiel</h3>'+
 '<div class="grid g3"><div><label>Marque</label><input id="buBrand" placeholder="Land Rover"></div>'+
 '<div><label>Modèle</label><input id="buModel" placeholder="Range Rover"></div>'+
 '<div><label>Année</label><input id="buYear" type="number" value="2020"></div></div>'+
 '<div class="row"><button data-bu="rc">🇫🇷 RappelConso</button><button data-bu="nhtsa">🇺🇸 NHTSA</button>'+
 '<button data-bu="sg">🇪🇺 Safety Gate (lien)</button></div>'+
 '<h3>💾 Sauvegardes locales ('+b.length+')</h3>'+
 (b.length?b.map(function(s,i){return '<div class="row" style="margin:4px 0"><span class="mut">'+new Date(s.ts).toLocaleString('fr-FR')+' · '+(s.kbx||[]).length+' pannes · '+(s.recx||[]).length+' rappels</span><button data-bu="restore" data-k="'+i+'">↩️ Restaurer</button></div>'}).join(''):'<p class="mut">Aucune sauvegarde.</p>')+
 '<h3>📄 Formats acceptés</h3>'+
 '<pre class="doc">Catalogue : [{"make":"Land Rover","model":"Range Rover","y":[2018,2027],"engines":[{"l":"3.0 D300 MHEV","ch":300,"f":"diesel","code":"AJ300D","y":[2020,2027]}]}]\n'+
 'Pannes : [{"t":"Chaîne Ingenium","eng":["AJ200D"],"b":["Land Rover"],"m":["Range Rover"],"y":[2018,2023],"pw":[150,180,204],"fuel":"diesel","s":"Distribution","sys":["chaine"],"g":"Critique","dtc":["P0016"],"mec":"…","tsb":"…","rec":"…"}]\n'+
 'Rappels : [{"t":"Rappel EGR","b":["Land Rover"],"m":["Range Rover"],"y":[2018,2022],"risk":"…","src":"RappelConso"}]\n'+
 'CSV : colonnes make,model,l,ch,f,code,y0,y1  ou  t,b,m,y,fuel,s,g,dtc,mec</pre></div>';
 var f=$('#buFile');
 if(f&&!f._bu){f._bu=1;f.addEventListener('change',function(e){if(e.target.files[0])handleFile(e.target.files[0],f._kind||'fault');e.target.value=''})}}
function open(kind){var f=$('#buFile');if(!f)return;f._kind=kind;f.click()}
/* ---- dispatch ---- */
document.addEventListener('click',async function(e){
 var b=e.target.closest('[data-bu]');if(!b)return;var a=b.dataset.bu,k=b.dataset.k;
 e.preventDefault();
 if(a==='auth'){if(await auth()){toast('🔓 Admin déverrouillé');render()}else toast('❌ Mot de passe incorrect');return}
 if(a==='impCat'){if(!await auth()){toast('🔒 Admin requis');return}open('cat');return}
 if(a==='impFault'){if(!await auth()){toast('🔒 Admin requis');return}open('fault');return}
 if(a==='impRec'){if(!await auth()){toast('🔒 Admin requis');return}open('rec');return}
 if(a==='export'){exportBase();return}
 if(a==='rc'){if(!await auth()){toast('🔒 Admin requis');return}await harvest('rc');return}
 if(a==='nhtsa'){if(!await auth()){toast('🔒 Admin requis');return}await harvest('nhtsa');return}
 if(a==='sg'){window.open('https://ec.europa.eu/safety-gate-alerts/screen/search','_blank','noopener');return}
 if(a==='restore'){if(!await auth()){toast('🔒 Admin requis');return}restore(+k);return}});
/* ---- intégration admin ---- */
function hook(){
 if(typeof window.renderAdmin==='function'&&!window.renderAdmin.__kfBu){
  var _ra=window.renderAdmin;
  var w=function(){_ra();var v=$('#view');if(!v)return;
   if(!$('#buPanel')){var d=document.createElement('div');d.id='buPanel';v.appendChild(d)}
   render()};
  w.__kfBu=true;window.renderAdmin=w}}
hook();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
window.KFBaseUpdate={render:render,mergeCat:mergeCat,mergeFaults:mergeFaults,mergeRecalls:mergeRecalls,
 harvestRappelConso:harvestRappelConso,harvestNHTSA:harvestNHTSA,export:exportBase,backup:backup,restore:restore};
})();
