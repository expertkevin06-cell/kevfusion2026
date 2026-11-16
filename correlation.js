/* KEV FUSION 2026 — correlation.js v10.0.0
   FILTRE VÉHICULE STRICT : ne présente QUE les pannes réellement corrélées à
   marque + modèle + motorisation (famille/code moteur) + puissance + année sélectionnées.
   Aucun repli, aucune panne générique hors périmètre, aucun élargissement.
   Les filtres natifs (systèmes) s'appliquent en intersection sur ce périmètre strict. */
(function(){
'use strict';
if(typeof KBall!=='function'){console.warn('correlation.js: base indisponible');return}
var C=window.KFCatalog;
var A=window.KFnorm||{arr:function(v){return Array.isArray(v)?v:(v==null||v===''?[]:[String(v)])},
 dtc:function(v){return Array.isArray(v)?v:(String(v||'').toUpperCase().match(/[PCBU][0-9]{4}/g)||[])},
 txt:function(v){return Array.isArray(v)?v:(v==null||v===''?[]:String(v).split(/\s*[;·\n]\s*/).filter(Boolean))},
 yrs:function(v){if(Array.isArray(v)&&v.length>=2)return[+v[0],+v[1]];if(typeof v==='number')return[v,v];return null},
 num:function(v){var n=parseInt(String(v==null?'':v).replace(/[^\d]/g,''),10);return isFinite(n)&&n>0?n:null}};
var WIN=[1995,2027];
function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
/* ---------- taxonomie filtres natifs ---------- */
var SYS=[
 {k:'fap',l:'FAP / Particules',i:'🌫️',re:/fap|dpf|particul|colmat|regener|cendre|suie|eolys|contre.pression/},
 {k:'adblue',l:'AdBlue / SCR',i:'💧',re:/adblue|scr|uree|nox|cristallis|\bdef\b|antipollution|demarrage interdit/},
 {k:'egr',l:'EGR',i:'♻️',re:/\begr\b|couvaison|glycol|vanne egr|refroidisseur egr/},
 {k:'turbo',l:'Turbo',i:'🌀',re:/turbo|suraliment|wastegate|geometrie variable|actuateur|boost|p0299|p0234/},
 {k:'courroie',l:'Courroie',i:'〰️',re:/courroie|\bbelt\b|humide|delamin|galet/},
 {k:'chaine',l:'Chaîne distribution',i:'⛓️',re:/chaine|\bchain\b|tendeur|patin|guide.chaine|7\s?mm|8\s?mm|saut de dent/},
 {k:'crepine',l:'Crépine / pression huile',i:'🛢️',re:/crepine|pression.{0,12}huile|pompe a huile|coussinet|limaille|p052|consommation.{0,10}huile|dilution/},
 {k:'bougies',l:'Allumage / bougies',i:'⚡',re:/bougie|bobine|allumage|\brate\b|ratés|misfire|p030|cliquetis|lspi/},
 {k:'vvt',l:'Déphaseurs / VVT',i:'🔄',re:/dephaseur|\bvvt\b|electrovanne|arbre a cames|p0011|p0014|p0016|p0017|calage variable/},
 {k:'injecteurs',l:'Injecteurs / injection',i:'💉',re:/injecteur|coking|debit|rail|p020|p0087|pompe hp|haute pression|pulverisation|calamine|pompe carburant/},
 {k:'ht',l:'Batterie HT',i:'🔋',re:/pack ht|haute tension|cellule|module|emballement|runaway|li.ion|\bnmc\b|\bnca\b|isolement|batterie hybride/},
 {k:'soh',l:'Autonomie / SOH',i:'📉',re:/\bsoh\b|autonomie|degradation|capacite|desequilibre|vieillissement/},
 {k:'charge',l:'Charge / OBC / DC-DC',i:'🔌',re:/charge|\bobc\b|chargeur|connecteur|\bccs\b|type 2|dc.dc|dcdc|inverter/},
 {k:'b12',l:'Batterie 12V / alternateur',i:'🪫',re:/12v|12 v|batterie 12|alternateur|demarreur|parasite|p0562|p0620/},
 {k:'boite',l:'Boîte de vitesses',i:'⚙️',re:/boite|\bdsg\b|dq200|dq250|dq381|mecatronic|\beat[68]\b|\bcvt\b|\bzf\b|\batf\b|convertisseur|p0700|p0730|p0841|crabot/},
 {k:'embrayage',l:'Embrayage / bimasse',i:'🔗',re:/embrayage|bimasse|volant moteur|butée|patinage/},
 {k:'adas',l:'ADAS / capteurs',i:'🛰️',re:/adas|camera|radar|calibration|capteur|\bacc\b|lane|u04|u02|c1a00/},
 {k:'freinage',l:'Freinage / ABS / ESP',i:'🛑',re:/frein|\babs\b|\besp\b|etrier|plaquette|disque|capteur roue|\bc00/},
 {k:'suspension',l:'Suspension / direction',i:'🛞',re:/amortisseur|suspension|rotule|roulement|silentbloc|direction|geometrie|ressort|epas/},
 {k:'refroid',l:'Refroidissement / surchauffe',i:'🌡️',re:/refroid|thermostat|pompe a eau|\bldr\b|surchauffe|joint de culasse|p0217|p0128|liquide de refroidissement/},
 {k:'faisceau',l:'Faisceau / réseau CAN',i:'🔌',re:/faisceau|connecteur|oxyde|court.circuit|\bcan\b|\bbsi\b|\bbcm\b|u0100|u0101|b1000|u0121|uch/},
 {k:'multi',l:'Multimédia / écran',i:'📱',re:/multimedia|ecran|tactile|emmc|reboot|navigation|u0155|u0184|r-link|pivi/},
 {k:'clim',l:'Climatisation',i:'❄️',re:/clim|compresseur|refrigerant|condenseur|r134|r1234/},
 {k:'airbag',l:'Airbag / sécurité',i:'🎈',re:/airbag|takata|pretensionneur|ceinture|\bb000|\bb001/},
 {k:'carrosserie',l:'Carrosserie / infiltration',i:'🚪',re:/carrosserie|corrosion|infiltration|etancheite|drain|humidite/},
 {k:'rappel',l:'Campagnes / TSB',i:'📣',re:/campagne|rappel|\btsb\b|recall|vin/}];
var SYSMAP={};SYS.forEach(function(s){SYSMAP[s.k]=s});
function sysOf(f){
 var t=norm((f.t||'')+' '+(f.mec||'')+' '+(f.s||'')+' '+(f.chain||'')+' '+A.txt(f.sym).join(' ')+' '+A.txt(f.cons).join(' ')+' '+(f.tsb||'')+' '+(f.rec||'')+' '+A.dtc(f.dtc).join(' '));
 var out=[];A.arr(f.sys).forEach(function(k){if(SYSMAP[k]&&out.indexOf(k)<0)out.push(k)});
 SYS.forEach(function(s){if(s.re.test(t)&&out.indexOf(s.k)<0)out.push(s.k)});
 return out}
/* ---------- alias famille moteur ---------- */
var ALIAS={EB2ADT:'EB2',EB2ADTS:'EB2',EB2DTS:'EB2',EB2GEN3:'EB2',EB0:'EB2',EP6DT:'EP6',EP6DTS:'EP6',EP6FDT:'EP6',EP6FADTX:'EP6',EP6FADTXH:'EP6',EP6GEN3:'EP6',
 DV5R:'DV5',DV5RUC:'DV5',DV5RUD:'DV5',DV5RUCD:'DV5',DV6:'DV6',DW10:'DW10',DW10F:'DW10',DW10FC:'DW10',
 K9K:'K9K',H5Ft:'H5F',H5F:'H5F',H5Ht:'H5H',H5H:'H5H',H4M:'H4M',H4Dt:'H5F',H4Bt:'H5F',B4D:'H5F',M5Mt:'H5H',M5Pt:'H5H',HR13:'H5H',M282:'H5H',HR10:'H5F',HR15:'H5F',
 M9R:'M9R',M9T:'M9T',R9M:'M9R',R9N:'M9R',
 EA211:'EA211',EA211EVO:'EA211',EA888:'EA888',EA888G1:'EA888',EA888G2:'EA888',EA888G3:'EA888',EA888G4:'EA888',EA189:'EA189',EA288:'EA288',EA288EVO:'EA288',EA897:'EA288',
 DQ200:'DQ200',DQ250:'DQ250',DQ381:'DQ250',DQ500:'DQ250',
 N47:'N47',B47:'B47',N57:'B47',B57:'B47',N20:'N20',N26:'N20',N13:'N20',B48:'B48',B58:'B58',
 OM651:'OM651',OM654:'OM654',OM656:'OM654',OM608:'OM654',OM622:'OM654',OM626:'OM654',OM654q:'OM654',M274:'M274',M264:'M274',M254:'M274',M256:'M274',M282:'M274',
 ECOBOOST:'ECOBOOST',ECOBOOST10:'ECOBOOST',ECOBOOST15:'ECOBOOST',ECOBOOST16:'ECOBOOST',ECOBLUE:'ECOBLUE',DURATORQ:'ECOBLUE',DRAGON:'ECOBOOST',
 MJET:'MJET',MJET2:'MJET',JTDM:'MJET',FIRE:'FIRE',GSE:'FIRE',T3:'FIRE',T4:'FIRE',TB:'FIRE',
 THETA:'GDI',THETA2:'GDI',GAMMA:'GDI',KAPPA:'GDI',SMARTSTREAM:'GDI',GDI:'GDI',TGDI:'GDI',
 U2:'CRDI',D4:'CRDI',D4FB:'CRDI',D4HA:'CRDI',D4HB:'CRDI',CRDI:'CRDI',
 THS:'THS',HYB:'THS',IMA:'THS',DMi:'THS',
 TOYD:'TOYD',AD:'TOYD',CD:'TOYD',GD:'TOYD',KD:'TOYD',ND:'TOYD',
 TOYE:'TOYE',KR:'TOYE',NR:'TOYE',ZR:'TOYE',M20:'TOYE',AR:'TOYE',T24A:'TOYE',G16E:'TOYE',
 SKYG:'SKYG',PE:'SKYG',PY:'SKYG',SKY:'SKYG',SKYX:'SKYG',SKYD:'SKYD',SH:'SKYD',SHVPTS:'SKYD',S8:'SKYD',
 L15:'L15',L15B:'L15',VTEC:'L15',K20:'K20',K24:'K20',
 EJ:'EJ',FA:'EJ',FB:'FB',EE:'FB',BOXER:'FB',
 VEA:'VEA',D5:'VEA',D4204T:'VEA',
 INGENIUM:'INGENIUM',AJ200D:'INGENIUM',AJ200P:'INGENIUM',AJ300D:'INGENIUM',AJ300P:'INGENIUM',AJ300:'INGENIUM',AJ:'INGENIUM',PT204:'INGENIUM',
 AJ133:'AJ133',N63:'N63',S68:'N63',
 EV:'EV',BEV:'EV',PHEV:'EV',
 MHEV48:'MHEV',MHEV:'MHEV',AJ150:'MHEV',AJ150PHEV:'MHEV',AJ200PHEV:'MHEV',AJ300PHEV:'MHEV',
 LSY:'ECOBOOST',L3B:'ECOBOOST',LM2:'ECOBLUE',LZ0:'ECOBLUE',L84:'AJ133',L87:'AJ133',LT2:'AJ133',
 K12:'FIRE',K14:'FIRE',K15:'FIRE',G4KJ:'GDI',G4KH:'GDI',S8:'SKYD'};
function famOf(code){return ALIAS[String(code||'').toUpperCase()]||String(code||'').toUpperCase()}
function famSet(codes){var s={};(codes||[]).forEach(function(c){var f=famOf(c);if(f)s[f]=1});return s}
/* ---------- énergie ---------- */
function fuelGroup(f){var n=norm(f);
 if(/electri|\bev\b|kwh|e-208|e-2008|leaf|tesla|id\.[3457]|ioniq|e-tron|ze\b|e-tech electric/.test(n))return'electrique';
 if(/hybride|hybrid|phev|e-tech|e:hev|plug.in|e-tense|4xe|boosterjet hybrid|dualjet hybrid|ecoboost hybrid|e-boxer|th[sb]\b/.test(n))return'hybride';
 if(/diesel|hdi|tdi|dci|cdti|crdi|bluehdi|ecoblue|multijet|jtd|jtdm|d-4d|skyactiv-d|cdi|ddis|di-d|duratorq|\bdv[456]\b|\bdw10\b|om6|k9k|m9[rt]|r9[mn]|ea189|ea288|n47|b47|n57|b57|ingenium|crdi/.test(n))return'diesel';
 if(/essence|puretech|thp|tsi|tfsi|tce|ecoboost|vtec|gdi|mpi|t-gdi|skyactiv-g|boxer|vvt-i|twinair|fire|firefly|vti|sce|mivec|t-jet|boosterjet|eb2|ep6|ea888|ea211|n20|n13|b48|b58|theta|kappa|gamma|l15|k2[04]/.test(n))return'essence';
 return''}
/* ---------- signature véhicule ---------- */
function signature(v){
 v=v||{};
 var mk=C?(C.resolveMake(v.brand)||v.brand):v.brand;
 var md=C?(C.resolveModel(mk,v.model)||v.model):v.model;
 var label=norm(v.engine||v.motor||'');
 var fuel=fuelGroup(v.fuel||v.energie||'')||fuelGroup(label);
 var dm=label.match(/(\d\.\d)/);var disp=dm?dm[1]:'';
 var ch=A.num(v.ch)||(label.match(/(\d{2,3})\s*(?:ch|cv|hp)?\s*$/)?+label.match(/(\d{2,3})\s*(?:ch|cv|hp)?\s*$/)[1]:null);
 var codes={};
 if(v.code)codes[String(v.code).toUpperCase()]=1;
 if(typeof engineCodes==='function')engineCodes(label,mk).forEach(function(c){codes[String(c).toUpperCase()]=1});
 if(C&&mk&&md){var es=C.engines(mk,md)||[];
  es.forEach(function(x){var en=norm(x.l);if(en===label||en.indexOf(label)>=0||label.indexOf(en)>=0)codes[String(x.code).toUpperCase()]=1})}
 var y=A.yrs(v.y);
 return{brand:mk||'',model:md||'',engine:v.engine||v.motor||'',ch:ch,kw:ch?Math.round(ch*0.7355):null,
  disp:disp,fuelGroup:fuel,codes:Object.keys(codes),fams:famSet(Object.keys(codes)),
  years:y||[2015,2027],year:v.year||null,
  codeLabel:Object.keys(codes).join(', ')||'non résolu',
  pairValid:C?C.isPairValid(mk,md):true}}
/* ---------- normalisation fiche ---------- */
function normFault(f,src){
 var o={id:f.id||('x'+Math.random().toString(36).slice(2,8)),t:f.t||f.titre||f.title||'Sans titre',
  eng:A.arr(f.eng),b:A.arr(f.b||f.marques||f.marque),m:A.arr(f.m||f.modeles),
  y:A.yrs(f.y)||WIN,pw:A.arr(f.pw||f.ch).map(Number).filter(Boolean),
  fuel:f.fuel||fuelGroup((f.t||'')+' '+(f.mec||'')+' '+(f.s||'')),
  s:f.s||f.systeme||'Général',g:f.g||f.gravite||'Élevé',
  fire:!!(f.fire||f.f||f.incendie),dtc:A.dtc(f.dtc),sym:A.txt(f.sym||f.symptomes),
  mec:f.mec||f.mecanisme||'',chain:f.chain||(typeof f.ch==='string'?f.ch:'')||f.chaine||'',
  cons:A.txt(f.cons||f.consequences),prv:A.txt(f.prv||f.preuves),tst:A.txt(f.tst||f.tests),
  act:A.txt(f.act||f.actions),sec:f.sec||f.securite||'—',law:A.arr(f.law||f.juridique),
  tsb:f.tsb||null,rec:f.rec||null,generic:!!f.generic,src:src||'Base ingénieur'};
 o.sys=sysOf(o);
 if(!o.law.length)o.law=['CC1641'];
 return o}
/* ---------- FILTRE VÉHICULE STRICT ---------- */
function vehiclePass(f,sig){
 /* 1. marque */
 var bl=f.b||[];
 var brandOK=bl.indexOf('*')>=0||bl.indexOf(sig.brand)>=0||
   bl.some(function(b){return C&&(C.resolveMake(b)||b)===sig.brand});
 if(!brandOK)return false;
 /* 2. famille / code moteur OBLIGATOIRE */
 var ff=famSet(f.eng||[]);
 var famHit=Object.keys(sig.fams).some(function(k){return ff[k]});
 if(!famHit)return false;
 /* 3. modèle : wildcard OU modèle cité */
 var ml=f.m||['*'];
 var modelOK=ml.indexOf('*')>=0||ml.indexOf(sig.model)>=0||
   ml.some(function(m){return norm(m)===norm(sig.model)});
 if(!modelOK)return false;
 /* 4. puissance */
 if(f.pw&&f.pw.length&&sig.ch){
  if(!f.pw.some(function(p){return Math.abs(p-sig.ch)<=6}))return false}
 /* 5. année */
 var fy=f.y||WIN;
 if(sig.year){if(!(fy[0]<=sig.year&&sig.year<=fy[1]))return false}
 else if(sig.years){if(!(fy[0]<=sig.years[1]&&fy[1]>=sig.years[0]))return false}
 /* 6. énergie cohérente */
 if(f.fuel&&sig.fuelGroup){
  if(f.fuel!==sig.fuelGroup&&!(sig.fuelGroup==='hybride'&&(f.fuel==='diesel'||f.fuel==='essence')))return false}
 return true}
/* ---------- corrélation ---------- */
function correlate(v,opts){
 opts=opts||{};
 var sysFilter=opts.sys||'';
 var read=A.dtc(opts.readDtc).map(function(x){return x.toUpperCase()});
 var sig=signature(v);
 var trace={total:0,kept:0,strict:true,sys:sysFilter,codes:sig.codes,year:sig.year,
  t1:0,t2:0,t3:0,t4:0,t5:0,fallback:false};
 var empty={sig:sig,faults:[],dtc:[],recalls:[],tsb:[],modelDtc:[],trace:trace,systems:SYS,avail:{}};
 if(!v||!v.brand)return empty;
 if(C&&v.model&&!C.isPairValid(v.brand,v.model))return empty;
 /* pool */
 var pool=[],seen={};
 function add(f,src){if(!f)return;var n=normFault(f,src);var k=norm(n.t);if(seen[k])return;seen[k]=1;pool.push(n)}
 try{(typeof FAULTS!=='undefined'?FAULTS:[]).forEach(function(f){add(f,'Base ingénieur')})}catch(e){}
 try{KBall().forEach(function(k){add(k,'Base fusionnée')})}catch(e){}
 trace.total=pool.length;
 /* sélection stricte */
 var kept=[];
 pool.forEach(function(f){
  if(!vehiclePass(f,sig))return;
  if(sysFilter&&f.sys.indexOf(sysFilter)<0)return;
  var dtcHit=f.dtc.filter(function(d){return read.indexOf(d)>=0});
  var sc=10;
  if(f.pw&&f.pw.length&&sig.ch&&f.pw.some(function(p){return Math.abs(p-sig.ch)<=6}))sc+=3;
  if(sig.year&&f.y&&f.y[0]<=sig.year&&sig.year<=f.y[1])sc+=2;
  if(dtcHit.length)sc+=4;
  if(f.fire)sc+=1;
  var why=['famille moteur '+Object.keys(famSet(f.eng)).filter(function(k){return sig.fams[k]}).join('/')];
  if((f.m||[]).indexOf('*')<0)why.push('modèle '+sig.model);
  if(f.pw&&f.pw.length)why.push('puissance '+sig.ch+' ch');
  if(sig.year)why.push('année '+sig.year);
  else if(sig.years)why.push('années '+sig.years[0]+'-'+sig.years[1]);
  if(dtcHit.length)why.push('DTC lus '+dtcHit.join(','));
  var legal=f.law.map(function(id){try{var l=txtById(id);return l&&l.t?l:null}catch(e){return null}}).filter(Boolean);
  kept.push(Object.assign({},f,{sc:sc,why:why,relevance:'DIRECT véhicule',tier:1,readHits:dtcHit,legal:legal,
   linkTsb:[],linkRec:[]}));
  trace.t1++});
 kept.sort(function(a,b){return b.sc-a.sc||String(a.t).localeCompare(String(b.t))});
 trace.kept=kept.length;
 /* rappels / TSB scopés véhicule */
 var recalls=[],tsb=[];
 try{recalls=Rall().filter(function(r){
  if(!r)return false;
  var bl=A.arr(r.b);
  if(!(bl.indexOf('*')>=0||bl.indexOf(sig.brand)>=0||bl.some(function(b){return C&&(C.resolveMake(b)||b)===sig.brand})))return false;
  var ml=A.arr(r.m);
  if(!(ml.indexOf('*')>=0||ml.indexOf(sig.model)>=0||ml.some(function(m){return norm(m)===norm(sig.model)})))return false;
  var ry=A.yrs(r.y)||WIN;
  if(sig.year){if(!(ry[0]<=sig.year&&sig.year<=ry[1]))return false}
  else if(sig.years){if(!(ry[0]<=sig.years[1]&&ry[1]>=sig.years[0]))return false}
  var rf=fuelGroup((r.t||'')+' '+(r.risk||''));
  if(rf&&sig.fuelGroup&&rf!==sig.fuelGroup&&!(sig.fuelGroup==='hybride'&&(rf==='diesel'||rf==='essence')))return false;
  return true}).map(function(r){return Object.assign({},r,{b:A.arr(r.b),m:A.arr(r.m),dtc:A.dtc(r.dtc),law:A.arr(r.law),y:A.yrs(r.y)||WIN})})}catch(e){}
 try{tsb=(typeof TSBDB!=='undefined'&&Array.isArray(TSBDB)?TSBDB:[]).filter(function(t){
  if(!t)return false;
  if(A.arr(t.b).indexOf(sig.brand)<0&&!A.arr(t.b).some(function(b){return C&&(C.resolveMake(b)||b)===sig.brand}))return false;
  var ml=A.arr(t.m);
  if(!(ml.indexOf('*')>=0||ml.indexOf(sig.model)>=0||ml.some(function(m){return norm(m)===norm(sig.model)})))return false;
  var ty=A.yrs(t.y)||WIN;
  if(sig.year){if(!(ty[0]<=sig.year&&sig.year<=ty[1]))return false}
  else if(sig.years){if(!(ty[0]<=sig.years[1]&&ty[1]>=sig.years[0]))return false}
  var te=A.arr(t.e);
  if(te.length){var tf=famSet(te);if(!Object.keys(sig.fams).some(function(k){return tf[k]}))return false}
  return true}).map(function(t){return Object.assign({},t,{b:A.arr(t.b),m:A.arr(t.m),e:A.arr(t.e),dtc:A.dtc(t.dtc),y:A.yrs(t.y)||WIN})})}catch(e){}
 /* liens par fiche */
 kept.forEach(function(f){
  f.linkTsb=tsb.filter(function(t){return A.dtc(t.dtc).some(function(d){return f.dtc.indexOf(d)>=0})||norm(t.sys)===norm(f.s)}).slice(0,4);
  f.linkRec=recalls.filter(function(r){return A.dtc(r.dtc).some(function(d){return f.dtc.indexOf(d)>=0})}).slice(0,4)});
 /* DTC agrégés */
 var map={};
 kept.forEach(function(f){f.dtc.forEach(function(d){(map[d]=map[d]||[]).push(f.t)})});
 tsb.forEach(function(t){A.dtc(t.dtc).forEach(function(d){if(!map[d])map[d]=['TSB : '+t.ref]})});
 recalls.forEach(function(r){A.dtc(r.dtc).forEach(function(d){if(!map[d])map[d]=['Campagne : '+r.t]})});
 var md=[];tsb.forEach(function(t){A.dtc(t.dtc).forEach(function(d){if(md.indexOf(d)<0)md.push(d)})});
 recalls.forEach(function(r){A.dtc(r.dtc).forEach(function(d){if(md.indexOf(d)<0)md.push(d)})});
 var dtcList=Object.keys(map).sort().map(function(d){return{code:d,faults:map[d],read:read.indexOf(d)>=0,fromModel:md.indexOf(d)>=0}});
 var avail={};kept.forEach(function(f){f.sys.forEach(function(k){avail[k]=(avail[k]||0)+1})});
 return{sig:sig,faults:kept,dtc:dtcList,recalls:recalls,tsb:tsb,modelDtc:md,trace:trace,systems:SYS,avail:avail}}
/* ---------- UI : verrouille le mode strict (masque élargir / toggle) ---------- */
function lockStrictUI(){
 var els=document.querySelectorAll('[data-ps="widen"],[data-ps="strict"]');
 els.forEach(function(el){el.style.display='none'});
}
setInterval(lockStrictUI,700);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lockStrictUI);else lockStrictUI();
window.KFCorr={correlate:correlate,signature:signature,norm:norm,fuelGroup:fuelGroup,WIN:WIN,
 SYS:SYS,SYSMAP:SYSMAP,sysOf:sysOf,arr:A.arr,dtc:A.dtc,txt:A.txt,famOf:famOf,vehiclePass:vehiclePass,
 systemsFor:function(){return['*']},annotate:function(k){return{fuel:'',system:k.s,powers:[]}}};
})();
