/* KEV FUSION 2026 — bigster_spring.js v2.0.0 (auto-réparant / idempotent)
   Rappel + panne : RESSORT DE SUSPENSION ARRIÈRE — DACIA BIGSTER.
   Scope verrouillé : Dacia / Bigster / HR12 + H4M / 130-140-155 ch / 2025-2026. */
'use strict';
(function(){
var ID='bigster-spring-rear',APPLIED=false,GUARD=null;
var SCOPE={b:['Dacia'],m:['Bigster'],eng:['HR12','H4M'],pw:[130,140,155],y:[2025,2026]};
function ready(){return !!window.KFCatalog&&typeof FAULTS!=='undefined'}
function lock(){
 if(typeof FAULTS==='undefined')return;
 var f=FAULTS.find(function(x){return x&&x.id===ID});if(!f)return;
 f.b=SCOPE.b.slice();f.m=SCOPE.m.slice();f.eng=SCOPE.eng.slice();
 f.pw=SCOPE.pw.slice();f.y=SCOPE.y.slice();
 f.lockModel=true;f.generic=false;f.fuel='';f.s='Suspension';
 f.sys=Array.isArray(f.sys)?f.sys:[];
 if(f.sys.indexOf('suspension')<0)f.sys.push('suspension');
 if(f.sys.indexOf('rappel')<0)f.sys.push('rappel')}
function apply(){
 if(APPLIED||!ready())return false;
 var C=window.KFCatalog;
 var fault={id:ID,
  t:'Ressort de suspension arrière — rupture / affaissement (campagne rappel Dacia Bigster)',
  eng:SCOPE.eng.slice(),b:SCOPE.b.slice(),m:SCOPE.m.slice(),y:SCOPE.y.slice(),pw:SCOPE.pw.slice(),
  fuel:'',s:'Suspension',sys:['suspension','rappel'],g:'Critique',fire:false,dtc:[],
  sym:['claquement / bruit métallique arrière sur bosse','véhicule affaissé de l\'arrière','hauteur arrière inégale',
       'usure anormale du pneu arrière','trace de contact pneu / carrosserie','voyant suspension (si capteur de hauteur)'],
  mec:'Ressort hélicoïdal arrière de spécification / traitement thermique défectueux sur certains lots de production : '
     +'fatigue prématurée du matériau → fissure puis rupture de spire, affaissement ou rupture complète du ressort.',
  chain:'Ressort fragilisé → rupture de spire → affaissement arrière / contact pneu-carrosserie → perte de contrôle / dégât roue',
  cons:['Affaissement arrière','Contact pneu / carrosserie','Tenue de route et freinage dégradés',
        'Risque de perte de contrôle','Non-conformité contrôle technique'],
  prv:['Spire cassée / fissure visible sur le ressort arrière','Hauteur de caisse arrière hors cote',
       'Référence / lot de ressort concerné par la campagne','VIN dans la plage de rappel',
       'Trace de frottement pneu / passage de roue'],
  tst:['Contrôle visuel des deux ressorts arrière (spires, fissures, corrosion)',
       'Mesure de la hauteur de caisse arrière (gauche / droite)',
       'Vérification de la référence et du lot de fabrication du ressort',
       'Vérification de l\'éligibilité du VIN à la campagne de rappel',
       'Contrôle géométrie / absence de contact pneu-carrosserie'],
  act:['Remplacement des DEUX ressorts arrière par la référence révisée (prise en charge campagne)',
       'Contrôle des amortisseurs, butées et coupelles arrière',
       'Réglage de la hauteur de caisse et de la géométrie',
       'Vérification de l\'absence de contact pneu / carrosserie après remplacement'],
  sec:'Ne pas charger le véhicule ; éviter les vitesses élevées et les routes dégradées ; '
     +'faire réaliser la campagne de rappel sans délai (risque de rupture en roulage).',
  law:['CC1245','CONSOL4213','CC1641','CONSO2173'],
  tsb:'Dacia Bigster — ressorts arrière : référence révisée + contrôle hauteur / géométrie (campagne)',
  rec:'Rappel Dacia Bigster — ressort de suspension arrière (risque de rupture / affaissement) — vérifier VIN',
  generic:false,lockModel:true};
 var i=FAULTS.findIndex(function(f){return f&&f.id===ID});
 if(i>=0)FAULTS[i]=fault;else FAULTS.push(fault);
 if(typeof RECALLS!=='undefined'){
  var rec={id:'rec-bigster-spring',t:'Rappel Dacia Bigster — ressort de suspension arrière (rupture / affaissement)',
   b:['Dacia'],m:['Bigster'],y:[2025,2026],fire:false,
   risk:'Ressort arrière de lot défectueux : fatigue → rupture de spire → affaissement / contact pneu-carrosserie, '
       +'risque de perte de contrôle. Remplacement des deux ressorts arrière par référence révisée.',
   dtc:[],src:'RappelConso / campagne constructeur',law:['CC1245','CONSOL4213','CC1641','CONSO2173']};
  var ri=RECALLS.findIndex(function(r){return r&&r.id===rec.id});
  if(ri>=0)RECALLS[ri]=rec;else RECALLS.push(rec)}
 if(typeof TSBDB!=='undefined'){
  var tsb={id:'tsb-bigster-spring',ref:'Dacia Bigster — ressorts arrière référence révisée (campagne rappel)',
   b:['Dacia'],m:['Bigster'],e:['HR12','H4M'],sys:'Suspension',g:'Critique',
   s:'Contrôle visuel + hauteur de caisse ; remplacement des deux ressorts arrière par référence révisée ; '
    +'contrôle amortisseurs / butées / coupelles ; réglage hauteur et géométrie ; vérification absence contact pneu.',
   dtc:[],y:[2025,2026]};
  var ti=TSBDB.findIndex(function(t){return t&&t.id===tsb.id});
  if(ti>=0)TSBDB[ti]=tsb;else TSBDB.push(tsb)}
 lock();
 if(!GUARD)GUARD=setInterval(lock,1200);
 try{C.purge()}catch(e){}
 APPLIED=true;
 window.KFBigsterSpring={ok:true,id:ID,lock:lock,scope:SCOPE};
 return true}
function boot(){
 if(apply())return;
 var n=0,t=setInterval(function(){n++;if(apply()||n>60){clearInterval(t);
  if(!APPLIED){window.KFBigsterSpring={ok:false,error:'prérequis absents'};console.warn('bigster_spring: prérequis absents')}}},150)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
document.addEventListener('DOMContentLoaded',function(){if(!APPLIED)apply();else lock()});
})();
