/* KEV FUSION 2026 — autoimport.js v1.0.0
   Import AUTOMATIQUE des bases depuis les URL d'origine du projet + sources officielles :
   · ./maj-base.json, ./maj-tiers.json (bases publiées par le projet)
   · RappelConso (data.economie.gouv.fr) — campagnes France toutes marques
   · NHTSA recalls + complaints (api.nhtsa.gov) — campagnes & symptômes US
   · EU Safety Gate (via proxy CORS) — campagnes UE
   Normalisation → validation KFCatalog → fusion kbx/recx/vehx avec sauvegarde. */
(function(){
'use strict';
var LS={get:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
function log(m){try{var L=LS.get('autoimportLog',[]);L.unshift(new Date().toISOString()+' · '+m);LS.set('autoimportLog',L.slice(0,60))}catch(e){}
 var el=$('#buLog');if(el)el.textContent=LS.get('autoimportLog',[]).slice(0,12).join('\n')}
function toast(m){if(typeof window.toast==='function')window.toast(m)}
var C=window.KFCatalog;
var CARBRANDS=['renault','dacia','alpine','peugeot','citroen','citroën','ds','opel','vauxhall','volkswagen','vw','audi','seat','skoda','cupra','bmw','mini','mercedes','mercedes-benz','smart','ford','toyota','lexus','nissan','honda','mazda','mitsubishi','subaru','suzuki','hyundai','kia','genesis','fiat','abarth','alfa romeo','alfa','lancia','jeep','volvo','polestar','land rover','range rover','jaguar','porsche','tesla','mg','byd','saab','lada','chevrolet','dodge','ram','gmc','cadillac','chrysler','infiniti','acura','lincoln','ssangyong','kgm','lynk','cupra','fisker','lucid','rivian','vinfast'];
function isCarBrand(s){s=String(s||'').toLowerCase();return CARBRANDS.some(function(b){return s.indexOf(b)>=0})}
function isAuto(rec){var t=String((rec.type_produits||rec.type||'')+' '+(rec.libelle_affichage||rec.libelle||rec.t||'')+' '+(rec.marque_des_produits||rec.marque||'')).toLowerCase();
 return /voiture|automobile|vehicule|véhicule|auto|suv|berline|utilitaire|fourgon|moto/.test(t)||isCarBrand(rec.marque_des_produits||rec.marque||rec.b)}
/* ---------- fetch robuste + proxy CORS ---------- */
async function getJSON(url,ms){
 ms=ms||15000;var ctl=new AbortController();var t=setTimeout(function(){ctl.abort()},ms);
 try{var r=await fetch(url,{signal:ctl.signal,cache:'no-store'});clearTimeout(t);
  if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}
 catch(e){clearTimeout(t);
  try{var p=await fetch('https://api.allorigins.win/raw?url='+encodeURIComponent(url),{cache:'no-store'});
   if(!p.ok)throw new Error('proxy HTTP '+p.status);return await p.json()}catch(e2){throw e}}}
/* ---------- sources ---------- */
var SRC=[
 {id:'local-base',name:'Base du projet (maj-base.json)',auto:true,run:async function(){
   var j=await getJSON('./maj-base.json?t='+Date.now());
   return{cat:j.catalog||j.vehicles||[],faults:j.faults||[],recalls:j.recalls||[]}}},
 {id:'local-tiers',name:'Base tiers (maj-tiers.json)',auto:true,run:async function(){
   var j=await getJSON('./maj-tiers.json?t='+Date.now());
   return{cat:j.catalog||[],faults:j.faults||[],recalls:j.recalls||[]}}},
 {id:'rc',name:'RappelConso France (toutes marques)',auto:true,run:async function(){
   var out=[],off=0,guard=0;
   while(guard<6){
    var u='https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso/records?limit=100&offset='+off;
    var j;try{j=await getJSON(u)}catch(e){break}
    var rs=j.results||[];if(!rs.length)break;
    rs.forEach(function(x){if(!isAuto(x))return;
     out.push({t:x.libelle_affichage||x.noms_des_modeles||x.marque_des_produits,
      b:[x.marque_des_produits],m:String(x.noms_des_modeles||'').split(/[,;\/]/).map(function(s){return s.trim()}).filter(Boolean),
      y:(function(){var m=String(x.date_de_publication||'').match(/(19|20)\d{2}/);return m?[+m[0],2027]:[2010,2027]})(),
      risk:x.risques_encourus||x.motif_du_rappel||'',dtc:[],src:'RappelConso '+(x.reference_du_rappel||''),
      law:['CC1245','CONSOL4213'],fire:/incendie|feu|flamm/i.test(String(x.risques_encourus||x.motif_du_rappel||''))})});
    off+=100;guard++;
    if(off>=(j.total_count||0))break}
   return{recalls:out}}},
 {id:'nhtsa',name:'NHTSA recalls (marques sélectionnées)',auto:false,run:async function(){
   var makes=(LS.get('autoimportMakes',['RENAULT','DACIA','PEUGEOT','CITROEN','VOLKSWAGEN','TOYOTA','FORD','BMW','MERCEDES-BENZ','LAND ROVER'])||[]);
   var out=[];
   for(var i=0;i<makes.length;i++){
    var u='https://api.nhtsa.gov/recalls/recallsByVehicle?make='+encodeURIComponent(makes[i])+'&modelYear=';
    for(var y=2018;y<=2027;y++){
     try{var j=await getJSON('https://api.nhtsa.gov/recalls/recallsByVehicle?make='+encodeURIComponent(makes[i])+'&modelYear='+y,12000);
      (j.results||[]).forEach(function(x){out.push({t:x.Subject||x.Component,b:[makes[i]],m:[x.Model||''],y:[+y,+y],
       risk:x.Summary||'',dtc:[],src:'NHTSA '+(x.NHTSACampaignNumber||''),law:['CC1245'],
       fire:/fire|flame|incendie/i.test(String(x.Summary||''))})})}catch(e){}}
    await new Promise(function(r){setTimeout(r,250)})}
   return{recalls:out}}},
 {id:'nhtsa-comp',name:'NHTSA complaints → symptômes',auto:false,run:async function(){
   var makes=(LS.get('autoimportMakes',['RENAULT','PEUGEOT','VOLKSWAGEN','TOYOTA'])||[]);var out=[];
   for(var i=0;i<makes.length;i++){for(var y=2018;y<=2026;y++){
    try{var j=await getJSON('https://api.nhtsa.gov/complaints/complaintsByVehicle?make='+encodeURIComponent(makes[i])+'&modelYear='+y,12000);
     (j.results||[]).slice(0,40).forEach(function(x){out.push({t:(x.Component||'')+' — '+(x.Summary||'').slice(0,120),
      b:[makes[i]],m:[x.Model||''],y:[+y,+y],fuel:'',s:x.Component||'Général',sys:[],g:'Élevé',
      sym:[String(x.Summary||'').slice(0,200)],mec:String(x.Summary||''),dtc:[],src:'NHTSA complaint'})})}catch(e){}}
    await new Promise(function(r){setTimeout(r,250)})}
   return{faults:out}}},
 {id:'sg',name:'EU Safety Gate (proxy)',auto:false,run:async function(){
   var u='https://api.allorigins.win/raw?url='+encodeURIComponent('https://ec.europa.eu/safety-gate-alerts/screen/webReport/rss?country=FR&category=Motor%20vehicles');
   var txt=await (await fetch(u,{cache:'no-store'})).text();
   var doc=new DOMParser().parseFromString(txt,'text/xml');
   var items=Array.prototype.slice.call(doc.querySelectorAll('item'));var out=[];
   items.forEach(function(it){var t=it.querySelector('title');var d=it.querySelector('description');
    if(!t)return;var s=String(t.textContent||'');
    if(!/vehicle|car|automobile|voiture/i.test(s))return;
    out.push({t:s,b:[],m:[],y:[2015,2027],risk:String(d?d.textContent||'':''),dtc:[],src:'Safety Gate',law:['CC1245','CONSOL4213']})});
   return{recalls:out}}}
];
/* ---------- fusion via baseupdate ---------- */
function merge(res){
 var BU=window.KFBaseUpdate,tot={cat:0,faults:0,recalls:0};
 if(!BU)return tot;
 if(res.cat&&res.cat.length){var a=BU.mergeCat(res.cat);tot.cat=a.added}
 if(res.faults&&res.faults.length){var b=BU.mergeFaults(res.faults);tot.faults=b.added}
 if(res.recalls&&res.recalls.length){var c=BU.mergeRecalls(res.recalls);tot.recalls=c.added}
 return tot}
/* ---------- exécution ---------- */
var running=false;
async function runAll(opts){
 if(running)return;running=true;opts=opts||{};
 var only=opts.only||null,auto=!!opts.auto;
 var summary=[];
 for(var i=0;i<SRC.length;i++){
  var s=SRC[i];
  if(only&&s.id!==only)continue;
  if(auto&&!s.auto)continue;
  var st=$('#buSrc_'+s.id);if(st)st.textContent='⏳';
  log('▶ '+s.name);
  try{var res=await s.run();var m=merge(res);
   summary.push(s.id+': +'+(m.cat+m.faults+m.recalls));
   log('✅ '+s.name+' → cat+'+m.cat+' pannes+'+m.faults+' rappels+'+m.recalls);
   if(st)st.textContent='✅ +'+(m.cat+m.faults+m.recalls)}
  catch(e){log('❌ '+s.name+' : '+e.message);if(st)st.textContent='❌'}
  await new Promise(function(r){setTimeout(r,200)})}
 LS.set('autoimportLast',Date.now());
 running=false;
 toast('🌐 Import auto : '+summary.join(' · '));
 if(window.KFBaseUpdate)KFBaseUpdate.render();
 return summary}
/* ---------- UI admin ---------- */
function panel(){
 var host=$('#buAuto');if(!host)return;
 var last=LS.get('autoimportLast',0);
 host.innerHTML='<div class="card gold"><h2>🌐 Import automatique des bases</h2>'+
 '<p class="mut">Sources d\'origine du projet + officielles. Validation catalogue + sauvegarde automatique avant fusion.</p>'+
 '<div class="row"><label class="tg '+(LS.get('autoimport',true)?'on':'')+'"><input type="checkbox" id="buAutoOn" '+(LS.get('autoimport',true)?'checked':'')+'> Auto au démarrage</label>'+
 '<button class="pri" data-bua="run">▶ Tout importer</button>'+
 '<button data-bua="log">📜 Journal</button></div>'+
 '<div style="margin-top:10px">'+SRC.map(function(s){
  return '<div class="row" style="margin:6px 0"><span style="flex:1">'+esc(s.name)+'</span><span class="mut" id="buSrc_'+s.id+'">—</span>'+
   '<button data-bua="one" data-k="'+s.id+'">▶</button></div>'}).join('')+'</div>'+
 '<div class="row" style="margin-top:8px"><label>Marques NHTSA (virgules)</label><input id="buMakes" value="'+esc((LS.get('autoimportMakes',['RENAULT','DACIA','PEUGEOT','CITROEN','VOLKSWAGEN','TOYOTA','FORD','BMW','MERCEDES-BENZ','LAND ROVER'])||[]).join(', '))+'"></div>'+
 '<pre class="doc" id="buLog" style="max-height:160px">'+esc(LS.get('autoimportLog',[]).slice(0,12).join('\n'))+'</pre>'+
 '<p class="dim">Dernier import : '+(last?new Date(last).toLocaleString('fr-FR'):'jamais')+'</p></div>';
 var on=$('#buAutoOn');if(on)on.addEventListener('change',function(){LS.set('autoimport',on.checked);toast(on.checked?'🌐 Auto ON':'🌐 Auto OFF')});
 var mk=$('#buMakes');if(mk)mk.addEventListener('change',function(){LS.set('autoimportMakes',mk.value.split(',').map(function(s){return s.trim().toUpperCase()}).filter(Boolean))})}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
document.addEventListener('click',async function(e){
 var b=e.target.closest('[data-bua]');if(!b)return;var a=b.dataset.bua,k=b.dataset.k;e.preventDefault();
 if(a==='run'){await runAll({});panel();return}
 if(a==='one'){await runAll({only:k});panel();return}
 if(a==='log'){var L=LS.get('autoimportLog',[]);alert(L.join('\n')||'Vide');return}});
/* hook admin */
function hook(){
 if(typeof window.renderAdmin==='function'&&!window.renderAdmin.__kfAi){
  var _ra=window.renderAdmin;
  var w=function(){_ra();var v=$('#view');if(v&&!$('#buAuto')){var d=document.createElement('div');d.id='buAuto';v.appendChild(d)}panel()};
  w.__kfAi=true;window.renderAdmin=w}}
hook();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
/* auto au boot */
function boot(){
 if(!LS.get('autoimport',true))return;
 setTimeout(function(){runAll({auto:true}).then(function(){if(window.KFPredictive)KFPredictive.runSearch&&KFPredictive.runSearch()}).catch(function(){})},2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFAutoImport={run:runAll,sources:SRC,panel:panel,log:log};
})();
