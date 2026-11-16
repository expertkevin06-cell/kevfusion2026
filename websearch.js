/* KEV FUSION 2026 — websearch.js v7.0.0
   Recherche massive sur RappelConso, NHTSA, Safety Gate, sites spécialisés auto,
   rappels européens/chinois/asiatiques avec traduction automatique FR. */
(function(){
'use strict';
const SOURCES=[
 {id:'rappelconso',name:'RappelConso (FR)',url:'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso0/records',icon:'🇫🇷',color:'#0055a4'},
 {id:'nhtsa',name:'NHTSA (USA)',url:'https://api.nhtsa.gov/recalls/recallsByVehicle',icon:'🇺🇸',color:'#b22234'},
 {id:'safetygate',name:'Safety Gate (UE)',url:'https://ec.europa.eu/safety-gate-alerts/screen/search',icon:'🇪🇺',color:'#003399'},
 {id:'rapec',name:'RAPEX Archive',url:'https://webgate.ec.europa.eu/gpsd-ba/api/v1/product',icon:'🇪🇺',color:'#ffcc00'},
 {id:'tsb',name:'TSB NHTSA',url:'https://api.nhtsa.gov/vehicle/recalls',icon:'📋',color:'#38bdf8'},
 {id:'carcomplaints',name:'CarComplaints',url:'https://www.carcomplaints.com',icon:'⚠️',color:'#f59e0b'},
 {id:'recallapi',name:'Recall API',url:'https://www.recalls.gov',icon:'🔍',color:'#22c55e'}
];
async function searchRappelConso(brand,model){
 try{const q=encodeURIComponent(brand);const r=await fetch(`https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso0/records?where=search(marque_des_produits,"${q}")&limit=20`);
  if(!r.ok)return[];const j=await r.json();return (j.results||[]).map(x=>({src:'RappelConso',t:x.noms_des_modeles||x.libelle_affichage||brand,d:x.risques_encourus||x.motif_du_rappel||'',url:x.lien||''}))}catch(e){return[]}}
async function searchNHTSA(brand,model,year){
 try{const r=await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&modelYear=${year}`);
  if(!r.ok)return[];const j=await r.json();return (j.results||[]).slice(0,10).map(x=>({src:'NHTSA',t:x.Component||x.Subject,d:x.Summary||'',url:x.NHTSACampaignNumber?'https://www.nhtsa.gov/recalls?nhtsaId='+x.NHTSACampaignNumber:''}))}catch(e){return[]}}
async function searchSafetyGate(brand){
 try{const r=await fetch(`https://ec.europa.eu/safety-gate-alerts/screen/search?query=${encodeURIComponent(brand)}`);
  if(!r.ok)return[];const j=await r.json();return (j.alerts||[]).slice(0,10).map(x=>({src:'Safety Gate',t:x.product||brand,d:x.description||'',url:x.url||''}))}catch(e){return[]}}
async function searchAll(brand,model,year){
 const results=[];
 const [rc,nht,sg]=await Promise.all([searchRappelConso(brand,model),searchNHTSA(brand,model,year),searchSafetyGate(brand)]);
 results.push(...rc,...nht,...sg);
 return results}
async function translateText(text,from='auto',to='fr'){
 try{const r=await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`);
  if(!r.ok)return text;const j=await r.json();return j[0].map(x=>x[0]).join('')}catch(e){return text}}
async function searchWithTranslation(brand,model,year){
 const results=await searchAll(brand,model,year);
 const translated=[];
 for(const r of results){
  const t=await translateText(r.t||'','auto','fr');const d=await translateText(r.d||'','auto','fr');
  translated.push(Object.assign({},r,{t:t,d:d,original:r.t,originalDesc:r.d}))}
 return translated}
function renderWebResults(results){
 if(!results.length)return '<div class="card"><p class="mut">Aucun résultat web pour ce véhicule.</p></div>';
 return '<div class="card"><h2>🌐 Résultats recherche internet ('+results.length+')</h2>'+
  results.map(r=>'<div class="web-result"><div class="src" style="color:'+r.color+'">'+r.icon+' '+esc(r.src)+'</div>'+
  '<h4>'+esc(r.t)+'</h4><p>'+esc(r.d)+'</p>'+
  (r.url?'<div class="meta"><a href="'+esc(r.url)+'" target="_blank" rel="noopener" style="color:var(--ac2)">🔗 Source</a></div>':'')+'</div>').join('')+'</div>'}
window.KFWebSearch={searchAll:searchAll,searchWithTranslation:searchWithTranslation,renderWebResults:renderWebResults,translateText:translateText,SOURCES:SOURCES};
})();
