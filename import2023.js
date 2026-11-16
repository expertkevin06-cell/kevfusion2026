/* KEV FUSION 2026 — import2023.js v1.0.0
   IMPORT MASSIF AUTOMATISÉ (tous les 15 jours) — modèles/manques depuis 2023, TOUTES marques
   (françaises, européennes, américaines, asiatiques, chinoises, sans exception) :
   · vPIC NHTSA GetAllManufacturers + GetModelsForMake (modèles 2023+)
   · Inférence motorisations/puissances par templates de famille (2023-2027)
   · RappelConso 2023+ (paginé, toutes marques) · NHTSA recalls 2023+ (chunké, reprenable) · Safety Gate
   · Re-scopage des pannes/TSB/campagnes par famille moteur sur les nouveaux modèles/marques
   · Curseurs reprenables, sauvegarde avant fusion, validation catalogue, journal, planification 15 j. */
(function(){
'use strict';
var LS={get:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
function log(m){try{var L=LS.get('imp23Log',[]);L.unshift(new Date().toISOString().slice(0,16).replace('T',' ')+' '+m);LS.set('imp23Log',L.slice(0,100))}catch(e){}
 var el=$('#i23Log');if(el)el.textContent=LS.get('imp23Log',[]).slice(0,14).join('\n')}
function toast(m){if(typeof window.toast==='function')window.toast(m)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var C=window.KFCatalog,CAT=C?C.CAT:null,OWNER=C?C.OWNER:null;
if(!CAT){console.warn('import2023: KFCatalog absent');return}
var PERIOD=15*24*3600*1000;
/* ---------- groupes de marques ---------- */
var GROUPS={
 stellantis:/peugeot|citroen|citroën|\bds\b|opel|vauxhall|fiat|abarth|alfa|lancia|jeep|chrysler|dodge|ram|maserati/,
 vag:/volkswagen|\bvw\b|audi|seat|skoda|cupra|porsche|bentley|lamborghini|bugatti/,
 bmw:/\bbmw\b|mini|rolls/,
 daimler:/mercedes|daimler|smart|maybach|amg/,
 renault:/renault|dacia|alpine|lada|avtoframos/,
 ford:/\bford\b|lincoln|mercury/,
 gm:/chevrolet|cadillac|gmc|buick|pontiac|hummer|saturn/,
 toyota:/toyota|lexus|scion|daihatsu/,
 honda:/honda|acura/,
 nissan:/nissan|infiniti|datsun/,
 mazda:/mazda/,
 mitsubishi:/mitsubishi/,
 subaru:/subaru/,
 suzuki:/suzuki|maruti/,
 hyundai:/hyundai|kia|genesis/,
 volvo:/volvo|polestar|lynk/,
 jlr:/jaguar|land rover|range rover/,
 tesla:/tesla|rivian|lucid|fisker|canoo/,
 chinese:/byd|\bmg\b|nio|xpeng|zeekr|geely|chery|great wall|haval|omoda|jaecoo|leapmotor|aiways|seres|hongqi|vinfast|dongfeng|faw|baic|jac|netta|neta|wm motor|skyworth|voyah|avatr|deepal|arcfox|li auto|aito|denza|yangwang|exeed|roewe|imax|saic|changan|gac|aion|hyptec|polestone|link|smart#/};
function groupOf(make){var m=String(make||'').toLowerCase();
 for(var g in GROUPS){if(GROUPS[g].test(m))return g}
 return 'other'}
/* ---------- templates motorisations/puissances 2023-2027 ---------- */
var TPL={
 stellantis:[['1.2 PureTech 100',100,'essence','EB2GEN3'],['1.2 PureTech 130',130,'essence','EB2GEN3'],['1.2 Hybrid 100',100,'hybride','EB2GEN3'],['1.2 Hybrid 136',136,'hybride','EB2GEN3'],['1.2 Hybrid 145',145,'hybride','EB2GEN3'],['1.6 Hybrid 180',180,'hybride','EP6GEN3'],['1.6 Hybrid 195',195,'hybride','EP6GEN3'],['1.6 Hybrid 225',225,'hybride','EP6GEN3'],['1.6 Hybrid 300',300,'hybride','EP6GEN3'],['1.5 BlueHDi 130',130,'diesel','DV5RUC'],['2.0 BlueHDi 145',145,'diesel','DW10FC'],['2.0 BlueHDi 180',180,'diesel','DW10FC'],['e 136',136,'electrique','EV'],['e 156',156,'electrique','EV'],['e 213',213,'electrique','EV'],['e 231',231,'electrique','EV'],['e 320',320,'electrique','EV']],
 vag:[['1.0 TSI 95',95,'essence','EA211'],['1.0 TSI 110',110,'essence','EA211'],['1.0 TSI 115',115,'essence','EA211'],['1.5 TSI 130',130,'essence','EA211EVO'],['1.5 TSI 150',150,'essence','EA211EVO'],['1.5 eTSI 130',130,'hybride','EA211EVO'],['1.5 eTSI 150',150,'hybride','EA211EVO'],['1.5 eHybrid 204',204,'hybride','EA211EVO'],['1.5 eHybrid 272',272,'hybride','EA211EVO'],['2.0 TSI 190',190,'essence','EA888'],['2.0 TSI 204',204,'essence','EA888'],['2.0 TSI 245',245,'essence','EA888'],['2.0 TSI 265',265,'essence','EA888'],['2.0 TSI 300',300,'essence','EA888'],['2.0 TSI 333',333,'essence','EA888'],['2.0 TDI 115',115,'diesel','EA288'],['2.0 TDI 150',150,'diesel','EA288'],['2.0 TDI 193',193,'diesel','EA288'],['2.0 TDI 200',200,'diesel','EA288'],['ID 170',170,'electrique','EV'],['ID 204',204,'electrique','EV'],['ID 286',286,'electrique','EV'],['ID 340',340,'electrique','EV']],
 bmw:[['218i 156',156,'essence','B48'],['220i 184',184,'essence','B48'],['230i 245',245,'essence','B48'],['330i 258',258,'essence','B48'],['M340i 374',374,'essence','B58'],['M340i 387',387,'essence','B58'],['440i 374',374,'essence','B58'],['218d 150',150,'diesel','B47'],['220d 190',190,'diesel','B47'],['320d 190',190,'diesel','B47'],['330d 286',286,'diesel','B57'],['M340d 340',340,'diesel','B57'],['i4 286',286,'electrique','EV'],['i4 340',340,'electrique','EV'],['i4 544',544,'electrique','EV'],['iX 326',326,'electrique','EV'],['iX 523',523,'electrique','EV'],['iX 619',619,'electrique','EV'],['i5 340',340,'electrique','EV'],['i7 544',544,'electrique','EV']],
 daimler:[['180 136',136,'essence','M282'],['200 163',163,'essence','M282'],['200 204',204,'essence','M254'],['250 258',258,'essence','M254'],['300 258',258,'essence','M254'],['350 367',367,'essence','M256'],['450 435',435,'essence','M256'],['180d 116',116,'diesel','OM608'],['200d 150',150,'diesel','OM654'],['220d 197',197,'diesel','OM654'],['300d 265',265,'diesel','OM656'],['400d 340',340,'diesel','OM656'],['EQA 190',190,'electrique','EV'],['EQB 228',228,'electrique','EV'],['EQE 245',245,'electrique','EV'],['EQE 292',292,'electrique','EV'],['EQS 333',333,'electrique','EV'],['EQS 476',476,'electrique','EV'],['AMG 476',476,'electrique','EV'],['AMG 626',626,'electrique','EV']],
 renault:[['1.0 SCe 65',65,'essence','B4D'],['1.0 TCe 90',90,'essence','H4Dt'],['1.0 TCe 100',100,'essence','H4Dt'],['1.0 TCe 110',110,'essence','H4Dt'],['1.3 TCe 140',140,'essence','H5Ht'],['1.3 TCe 160',160,'essence','H5Ht'],['1.2 TCe 130',130,'essence','H5Ft'],['1.2 E-Tech 160',160,'hybride','H5Ft'],['1.2 E-Tech 200',200,'hybride','H5Ft'],['1.2 E-Tech 300',300,'hybride','H5Ft'],['1.6 E-Tech 145',145,'hybride','H4M'],['1.6 E-Tech 155',155,'hybride','H4M'],['1.5 Blue dCi 95',95,'diesel','K9K'],['1.5 Blue dCi 115',115,'diesel','K9K'],['2.0 Blue dCi 180',180,'diesel','M9R'],['E-Tech 120',120,'electrique','EV'],['E-Tech 130',130,'electrique','EV'],['E-Tech 150',150,'electrique','EV'],['E-Tech 170',170,'electrique','EV'],['E-Tech 220',220,'electrique','EV']],
 ford:[['1.0 EcoBoost 100',100,'essence','ECOBOOST'],['1.0 EcoBoost 125',125,'essence','ECOBOOST'],['1.0 EcoBoost Hybrid 125',125,'hybride','ECOBOOST'],['1.0 EcoBoost Hybrid 155',155,'hybride','ECOBOOST'],['1.5 EcoBoost 150',150,'essence','ECOBOOST'],['1.5 EcoBoost 182',182,'essence','ECOBOOST'],['2.0 EcoBoost 250',250,'essence','ECOBOOST'],['2.3 EcoBoost 280',280,'essence','ECOBOOST'],['2.3 EcoBoost 350',350,'essence','ECOBOOST'],['2.7 EcoBoost 335',335,'essence','ECOBOOST'],['3.5 EcoBoost 400',400,'essence','ECOBOOST'],['3.5 EcoBoost 450',450,'essence','ECOBOOST'],['5.0 V8 450',450,'essence','AJ133'],['1.5 EcoBlue 95',95,'diesel','ECOBLUE'],['1.5 EcoBlue 120',120,'diesel','ECOBLUE'],['2.0 EcoBlue 150',150,'diesel','ECOBLUE'],['2.0 EcoBlue 190',190,'diesel','ECOBLUE'],['2.0 EcoBlue 210',210,'diesel','ECOBLUE'],['Mach-E 269',269,'electrique','EV'],['Mach-E 294',294,'electrique','EV'],['Mach-E 351',351,'electrique','EV'],['Mach-E 487',487,'electrique','EV'],['F-150 Lightning 452',452,'electrique','EV'],['F-150 Lightning 580',580,'electrique','EV']],
 gm:[['1.2 Turbo 130',130,'essence','ECOBOOST'],['1.3 Turbo 155',155,'essence','ECOBOOST'],['2.0 Turbo 237',237,'essence','LSY'],['2.7 Turbo 310',310,'essence','L3B'],['3.0 Duramax 277',277,'diesel','LM2'],['3.0 Duramax 305',305,'diesel','LZ0'],['5.3 V8 355',355,'essence','L84'],['6.2 V8 420',420,'essence','L87'],['6.2 V8 670',670,'essence','LT2'],['Bolt 200',200,'electrique','EV'],['Equinox EV 213',213,'electrique','EV'],['Blazer EV 288',288,'electrique','EV'],['Lyriq 340',340,'electrique','EV'],['Lyriq 500',500,'electrique','EV'],['Hummer EV 1000',1000,'electrique','EV']],
 toyota:[['1.5 Hybrid 116',116,'hybride','THS'],['1.5 Hybrid 130',130,'hybride','THS'],['1.8 Hybrid 140',140,'hybride','THS'],['2.0 Hybrid 180',180,'hybride','THS'],['2.0 Hybrid 196',196,'hybride','THS'],['2.5 Hybrid 218',218,'hybride','THS'],['2.5 Hybrid 222',222,'hybride','THS'],['2.5 PHEV 306',306,'hybride','THS'],['2.4 Turbo 279',279,'essence','T24A'],['2.4 Turbo Hybrid 371',371,'hybride','T24A'],['2.8 D-4D 204',204,'diesel','GD'],['1.6 Turbo GR 300',300,'essence','G16E'],['bZ4X 204',204,'electrique','EV'],['bZ4X 218',218,'electrique','EV']],
 honda:[['1.0 VTEC Turbo 129',129,'essence','L15'],['1.5 VTEC Turbo 182',182,'essence','L15'],['2.0 VTEC Turbo 320',320,'essence','K20'],['2.0 e:HEV 184',184,'hybride','L15'],['2.0 e:PHEV 184',184,'hybride','L15'],['e 150',150,'electrique','EV'],['e:Ny1 204',204,'electrique','EV']],
 nissan:[['1.0 IG-T 92',92,'essence','HR10'],['1.3 DIG-T 140',140,'essence','HR13'],['1.3 DIG-T 160',160,'essence','HR13'],['1.5 e-Power 190',190,'hybride','HR15'],['1.5 e-Power 204',204,'hybride','HR15'],['1.5 e-4ORCE 213',213,'hybride','HR15'],['1.5 Blue dCi 115',115,'diesel','K9K'],['Leaf 150',150,'electrique','EV'],['Leaf 218',218,'electrique','EV'],['Ariya 218',218,'electrique','EV'],['Ariya 242',242,'electrique','EV'],['Ariya 306',306,'electrique','EV'],['Ariya 394',394,'electrique','EV']],
 mazda:[['2.0 Skyactiv-G 122',122,'essence','SKYG'],['2.0 Skyactiv-G 150',150,'essence','SKYG'],['2.5 Skyactiv-G 194',194,'essence','SKYG'],['2.5 Turbo 254',254,'essence','SKYG'],['2.0 Skyactiv-X 186',186,'essence','SKYX'],['2.5 e-Skyactiv G 140',140,'hybride','SKYG'],['2.5 PHEV 327',327,'hybride','SKYG'],['2.2 Skyactiv-D 150',150,'diesel','SKYD'],['2.2 Skyactiv-D 184',184,'diesel','SKYD'],['MX-30 145',145,'electrique','EV']],
 mitsubishi:[['1.3 Turbo 140',140,'essence','HR13'],['1.5 Turbo 163',163,'essence','HR15'],['2.4 PHEV 252',252,'hybride','THS'],['2.2 DI-D 150',150,'diesel','SKYD'],['2.4 DI-D 184',184,'diesel','SKYD']],
 subaru:[['2.0 e-Boxer 150',150,'hybride','FB'],['2.5 169',169,'essence','FB'],['2.4 Turbo 275',275,'essence','FA'],['2.4 Turbo 300',300,'essence','FA'],['Solterra 218',218,'electrique','EV']],
 suzuki:[['1.2 Dualjet 83',83,'essence','K12'],['1.2 Hybrid 90',90,'hybride','K12'],['1.4 Boosterjet 129',129,'essence','K14'],['1.4 Hybrid 140',140,'hybride','K14'],['1.5 Hybrid 102',102,'hybride','K15'],['1.5 DDiS 110',110,'diesel','MJET'],['Across 306',306,'hybride','THS'],['e-Vitara 144',144,'electrique','EV'],['e-Vitara 174',174,'electrique','EV']],
 hyundai:[['1.0 T-GDi 100',100,'essence','KAPPA'],['1.0 T-GDi 120',120,'essence','KAPPA'],['1.6 T-GDi 150',150,'essence','GAMMA'],['1.6 T-GDi 160',160,'essence','GAMMA'],['1.6 T-GDi 180',180,'essence','GAMMA'],['1.6 Hybrid 141',141,'hybride','SMARTSTREAM'],['1.6 T-GDi Hybrid 230',230,'hybride','SMARTSTREAM'],['1.6 T-GDi PHEV 265',265,'hybride','SMARTSTREAM'],['2.5 T-GDi 290',290,'essence','THETA'],['1.6 CRDi 115',115,'diesel','U2'],['1.6 CRDi 136',136,'diesel','U2'],['2.2 CRDi 202',202,'diesel','D4HB'],['Ioniq 170',170,'electrique','EV'],['Ioniq 218',218,'electrique','EV'],['Ioniq 229',229,'electrique','EV'],['Ioniq 325',325,'electrique','EV'],['Ioniq 650',650,'electrique','EV']],
 volvo:[['B3 163',163,'hybride','VEA'],['B4 197',197,'hybride','VEA'],['B5 250',250,'hybride','VEA'],['B6 300',300,'hybride','VEA'],['T6 350',350,'hybride','VEA'],['T8 455',455,'hybride','VEA'],['T8 517',517,'hybride','VEA'],['EX30 272',272,'electrique','EV'],['EX30 428',428,'electrique','EV'],['EX90 408',408,'electrique','EV'],['EX90 517',517,'electrique','EV']],
 jlr:[['2.0 D165',165,'diesel','AJ200D'],['2.0 D200',204,'diesel','AJ200D'],['2.0 D240',240,'diesel','AJ200D'],['2.0 P200',200,'essence','AJ200P'],['2.0 P250',250,'essence','AJ200P'],['2.0 P300',300,'essence','AJ200P'],['2.0 P400e',404,'hybride','AJ200PHEV'],['3.0 D250',249,'diesel','AJ300D'],['3.0 D300',300,'diesel','AJ300D'],['3.0 D350',350,'diesel','AJ300D'],['3.0 P360',360,'essence','AJ300P'],['3.0 P400',400,'essence','AJ300P'],['3.0 P440e',440,'hybride','AJ300PHEV'],['3.0 P460e',460,'hybride','AJ300PHEV'],['3.0 P510e',510,'hybride','AJ300PHEV'],['3.0 P550e',550,'hybride','AJ300PHEV'],['4.4 P530',530,'essence','N63'],['4.4 P615',615,'essence','N63'],['4.4 P635',635,'essence','S68'],['5.0 P525',525,'essence','AJ133'],['5.0 P575',575,'essence','AJ133']],
 tesla:[['RWD 283',283,'electrique','EV'],['LR AWD 440',440,'electrique','EV'],['LR AWD 498',498,'electrique','EV'],['Performance 460',460,'electrique','EV'],['Performance 513',513,'electrique','EV'],['Plaid 1020',1020,'electrique','EV'],['Cyberbeast 845',845,'electrique','EV']],
 chinese:[['1.5 T-GDi 150',150,'essence','GDI'],['1.5 T-GDi 177',177,'essence','GDI'],['1.6 T-GDi 197',197,'essence','GDI'],['2.0 T-GDi 254',254,'essence','GDI'],['1.5 Hybrid 190',190,'hybride','SMARTSTREAM'],['1.5 DM-i 218',218,'hybride','DMi'],['1.5 DM-p 324',324,'hybride','DMi'],['2.0 DM-p 490',490,'hybride','DMi'],['EV 150',150,'electrique','EV'],['EV 170',170,'electrique','EV'],['EV 204',204,'electrique','EV'],['EV 218',218,'electrique','EV'],['EV 231',231,'electrique','EV'],['EV 286',286,'electrique','EV'],['EV 313',313,'electrique','EV'],['EV 325',325,'electrique','EV'],['EV 408',408,'electrique','EV'],['EV 435',435,'electrique','EV'],['EV 489',489,'electrique','EV'],['EV 530',530,'electrique','EV'],['EV 585',585,'electrique','EV'],['EV 650',650,'electrique','EV']],
 other:[['1.0 Turbo 100',100,'essence','EA211'],['1.5 Turbo 150',150,'essence','GDI'],['2.0 Turbo 200',200,'essence','EA888'],['1.5 Hybrid 140',140,'hybride','THS'],['2.0 Diesel 150',150,'diesel','EA288'],['EV 150',150,'electrique','EV'],['EV 204',204,'electrique','EV'],['EV 286',286,'electrique','EV']]};
/* ---------- alias famille (aligné family_faults) ---------- */
var ALIAS={EB2ADT:'EB2',EB2ADTS:'EB2',EB2DTS:'EB2',EB2GEN3:'EB2',EB0:'EB2',EP6DT:'EP6',EP6FDT:'EP6',EP6FADTX:'EP6',EP6FADTXH:'EP6',EP6GEN3:'EP6',
 DV5R:'DV5',DV5RUC:'DV5',DV5RUD:'DV5',DV6:'DV6',DW10:'DW10',DW10F:'DW10',DW10FC:'DW10',
 K9K:'K9K',H5Ft:'H5F',H5F:'H5F',H5Ht:'H5H',H5H:'H5H',H4M:'H4M',H4Dt:'H5F',H4Bt:'H5F',B4D:'H5F',M5Mt:'H5H',M5Pt:'H5H',HR13:'H5H',M282:'H5H',HR10:'H5F',HR15:'H5F',
 M9R:'M9R',M9T:'M9T',R9M:'M9R',R9N:'M9R',
 EA211:'EA211',EA211EVO:'EA211',EA888:'EA888',EA888G3:'EA888',EA888G4:'EA888',EA189:'EA189',EA288:'EA288',EA288EVO:'EA288',
 DQ200:'DQ200',DQ250:'DQ250',DQ381:'DQ250',
 N47:'N47',B47:'B47',N57:'B47',B57:'B47',N20:'N20',B48:'B48',B58:'B58',
 OM651:'OM651',OM654:'OM654',OM656:'OM654',OM608:'OM654',M274:'M274',M264:'M274',M254:'M274',M256:'M274',M282:'M274',
 ECOBOOST:'ECOBOOST',ECOBOOST10:'ECOBOOST',ECOBOOST15:'ECOBOOST',ECOBLUE:'ECOBLUE',DURATORQ:'ECOBLUE',
 MJET:'MJET',MJET2:'MJET',JTDM:'MJET',FIRE:'FIRE',GSE:'FIRE',
 THETA:'GDI',THETA2:'GDI',GAMMA:'GDI',KAPPA:'GDI',SMARTSTREAM:'GDI',GDI:'GDI',TGDI:'GDI',
 U2:'CRDI',D4:'CRDI',D4HB:'CRDI',CRDI:'CRDI',
 THS:'THS',HYB:'THS',IMA:'THS',DMi:'THS',
 TOYD:'TOYD',GD:'TOYD',AD:'TOYD',TOYE:'TOYE',KR:'TOYE',NR:'TOYE',ZR:'TOYE',M20:'TOYE',T24A:'TOYE',G16E:'TOYE',
 SKYG:'SKYG',PE:'SKYG',PY:'SKYG',SKYX:'SKYG',SKYD:'SKYD',SH:'SKYD',
 L15:'L15',L15B:'L15',K20:'K20',K24:'K20',
 EJ:'EJ',FA:'EJ',FB:'FB',EE:'FB',
 VEA:'VEA',D5:'VEA',
 INGENIUM:'INGENIUM',AJ200D:'INGENIUM',AJ200P:'INGENIUM',AJ300D:'INGENIUM',AJ300P:'INGENIUM',AJ300:'INGENIUM',
 AJ133:'AJ133',N63:'N63',S68:'N63',
 EV:'EV',BEV:'EV',PHEV:'EV',MHEV:'MHEV',MHEV48:'MHEV',
 LSY:'ECOBOOST',L3B:'ECOBOOST',LM2:'ECOBLUE',LZ0:'ECOBLUE',L84:'AJ133',L87:'AJ133',LT2:'AJ133',
 K12:'FIRE',K14:'FIRE',K15:'FIRE',G4KJ:'GDI',G4KH:'GDI',S8:'SKYD'};
function famOf(code){return ALIAS[code]||code}
/* ---------- ajout modèle + motorisations inférées ---------- */
function addModel(make,model,y0,y1,body,forceGroup){
 var g=forceGroup||groupOf(make);var tpl=TPL[g]||TPL.other;
 var engs=tpl.map(function(e){return{l:e[0],ch:e[1],kw:Math.round(e[1]*0.7355),f:e[2],code:e[3],y:[y0,y1],est:true}});
 CAT[make]=CAT[make]||{};
 var prev=CAT[make][model],merged=engs.slice();
 if(prev&&prev.eng)prev.eng.forEach(function(e){if(!merged.some(function(x){return x.l===e.l&&x.ch===e.ch}))merged.push(e)});
 CAT[make][model]={y:[y0,y1],body:body||'',eng:merged};
 var n=C.norm(model);OWNER[n]=OWNER[n]||[];if(OWNER[n].indexOf(make)<0)OWNER[n].push(make);
 var vx=LS.get('vehx',{});vx[make]=vx[make]||{};
 vx[make][model]=Array.from(new Set((vx[make][model]||[]).concat(engs.map(function(e){return e.l}))));
 LS.set('vehx',vx);
 return engs.length}
/* ---------- table statique 2023+ (fallback hors-ligne) ---------- */
var STATIC23=[
['Peugeot','408',2022,2027,'berline'],['Peugeot','E-3008',2024,2027,'SUV'],['Peugeot','E-5008',2024,2027,'SUV'],['Peugeot','E-208',2023,2027,'citadine'],['Peugeot','E-2008',2023,2027,'SUV'],
['Citroën','ë-C3',2023,2027,'citadine'],['Citroën','C3 IV',2024,2027,'citadine'],['Citroën','ë-C4 X',2023,2027,'berline'],['Citroën','C5 Aircross II',2025,2027,'SUV'],
['DS','DS N°8',2025,2027,'berline'],['DS','DS N°4',2025,2027,'SUV'],
['Renault','Scenic E-Tech',2024,2027,'SUV'],['Renault','R5 E-Tech',2024,2027,'citadine'],['Renault','R4 E-Tech',2025,2027,'SUV'],['Renault','Symbioz',2024,2027,'SUV'],['Renault','Rafale',2024,2027,'SUV'],['Renault','Kangoo E-Tech',2023,2027,'ludospace'],
['Dacia','Bigster',2025,2027,'SUV'],['Dacia','Spring II',2024,2027,'citadine'],['Dacia','Duster III',2024,2027,'SUV'],
['Volkswagen','ID.7',2023,2027,'berline'],['Volkswagen','ID.Buzz',2022,2027,'combi'],['Volkswagen','Tiguan III',2023,2027,'SUV'],['Volkswagen','Passat B9',2023,2027,'berline'],['Volkswagen','T-Roc II',2025,2027,'SUV'],['Volkswagen','ID.2',2025,2027,'citadine'],['Volkswagen','ID.Every1',2026,2027,'citadine'],
['Audi','Q6 e-tron',2024,2027,'SUV'],['Audi','A6 e-tron',2024,2027,'berline'],['Audi','Q5 III',2024,2027,'SUV'],['Audi','A5',2024,2027,'berline'],
['SEAT','Terramar',2024,2027,'SUV'],['Cupra','Tavascan',2024,2027,'SUV'],['Cupra','Raval',2026,2027,'citadine'],
['Skoda','Elroq',2024,2027,'SUV'],['Skoda','Superb IV',2023,2027,'berline'],['Skoda','Kodiaq II',2023,2027,'SUV'],
['BMW','Série 5 G60',2023,2027,'berline'],['BMW','i5',2023,2027,'berline'],['BMW','X3 G45',2024,2027,'SUV'],['BMW','iX3',2025,2027,'SUV'],['BMW','Série 1 F70',2024,2027,'berline'],
['Mercedes-Benz','Classe E W214',2023,2027,'berline'],['Mercedes-Benz','EQE SUV',2023,2027,'SUV'],['Mercedes-Benz','EQS SUV',2023,2027,'SUV'],['Mercedes-Benz','GLC EV',2025,2027,'SUV'],['Mercedes-Benz','CLA EV',2025,2027,'berline'],
['Opel','Astra Electric',2023,2027,'berline'],['Opel','Grandland II',2024,2027,'SUV'],['Opel','Frontera',2024,2027,'SUV'],['Opel','Corsa Electric',2023,2027,'citadine'],
['Ford','Explorer EV',2024,2027,'SUV'],['Ford','Capri EV',2024,2027,'SUV'],['Ford','Kuga IV',2024,2027,'SUV'],
['Toyota','C-HR II',2023,2027,'SUV'],['Toyota','Land Cruiser 250',2024,2027,'SUV'],['Toyota','bZ3X',2025,2027,'SUV'],['Lexus','RZ',2023,2027,'SUV'],['Lexus','LBX',2023,2027,'SUV'],
['Honda','ZR-V',2023,2027,'SUV'],['Honda','e:Ny1',2023,2027,'SUV'],
['Hyundai','Ioniq 7',2025,2027,'SUV'],['Hyundai','Kona II',2023,2027,'SUV'],['Hyundai','Santa Fe V',2023,2027,'SUV'],['Kia','EV9',2023,2027,'SUV'],['Kia','EV3',2024,2027,'SUV'],['Kia','EV4',2025,2027,'berline'],['Kia','Sportage VI',2025,2027,'SUV'],
['Volvo','EX30',2023,2027,'SUV'],['Volvo','EX90',2024,2027,'SUV'],['Volvo','ES90',2025,2027,'berline'],['Polestar','4',2024,2027,'SUV'],['Polestar','5',2025,2027,'berline'],
['Jaguar','Type 00',2025,2027,'berline'],['Land Rover','Defender OCTA',2024,2027,'SUV'],['Range Rover','Range Rover EV',2025,2027,'SUV'],
['Tesla','Cybertruck',2023,2027,'pick-up'],['Tesla','Model Y Juniper',2025,2027,'SUV'],['Rivian','R2',2026,2027,'SUV'],['Lucid','Gravity',2024,2027,'SUV'],
['BYD','Seal U',2023,2027,'SUV'],['BYD','Sealion 7',2024,2027,'SUV'],['BYD','Qin L',2024,2027,'berline'],['BYD','Song L',2024,2027,'SUV'],['BYD','Yangwang U8',2023,2027,'SUV'],
['MG','MG4',2022,2027,'berline'],['MG','Cyberster',2023,2027,'roadster'],['MG','S9',2024,2027,'SUV'],
['NIO','ET5 Touring',2023,2027,'break'],['NIO','ES8 II',2023,2027,'SUV'],['XPeng','G9',2023,2027,'SUV'],['XPeng','Mona M03',2024,2027,'berline'],
['Zeekr','007',2024,2027,'berline'],['Zeekr','7X',2024,2027,'SUV'],['Xiaomi','SU7',2024,2027,'berline'],['Xiaomi','YU7',2025,2027,'SUV'],
['Geely','Galaxy E8',2024,2027,'berline'],['Geely','Monjaro',2023,2027,'SUV'],['Lynk & Co','08',2023,2027,'SUV'],['Lynk & Co','Z10',2024,2027,'berline'],
['Chery','Tiggo 9',2023,2027,'SUV'],['Omoda','9',2024,2027,'SUV'],['Jaecoo','8',2024,2027,'SUV'],['Haval','H6 III',2023,2027,'SUV'],['Great Wall','Poer PHEV',2023,2027,'pick-up'],
['Leapmotor','C10',2024,2027,'SUV'],['Leapmotor','B10',2025,2027,'SUV'],['Aiways','U6',2023,2027,'SUV'],['Seres','7',2024,2027,'SUV'],['Hongqi','EH7',2024,2027,'berline'],['VinFast','VF7',2023,2027,'SUV'],['VinFast','VF9',2023,2027,'SUV'],
['Suzuki','e-Vitara',2025,2027,'SUV'],['Subaru','Solterra',2022,2027,'SUV'],['Mazda','CX-80',2024,2027,'SUV'],['Mazda','EZ-6',2024,2027,'berline'],['Mitsubishi','ASX II',2023,2027,'SUV']];
function mergeStatic(){var n=0;STATIC23.forEach(function(r){addModel(r[0],r[1],r[2],r[3],r[4]);n++});
 log('📦 Statique 2023+ : '+n+' modèles fusionnés');return n}
/* ---------- re-scopage pannes/TSB/campagnes sur nouveaux modèles/marques ---------- */
function refreshFamilyScope(){
 if(typeof FAULTS==='undefined')return 0;
 var touched=0;
 FAULTS.forEach(function(f){
  if(!f||!f.eng||!f.eng.length)return;
  var fams=f.eng.map(famOf);
  Object.keys(CAT).forEach(function(mk){
   var hasBrand=(f.b||[]).indexOf(mk)>=0||(f.b||[]).indexOf('*')>=0;
   Object.keys(CAT[mk]).forEach(function(mo){
    var e=CAT[mk][mo];if(!e||!e.eng)return;
    var hit=e.eng.some(function(x){return fams.indexOf(famOf(x.code))>=0});
    if(!hit)return;
    if(!hasBrand){f.b=(f.b||[]).slice();if(f.b.indexOf(mk)<0){f.b.push(mk);touched++}}
    f.m=(f.m||['*']).slice();
    if(f.m.indexOf('*')<0&&f.m.indexOf(mo)<0){f.m.push(mo);touched++}
    /* étend années/puissances */
    if(e.y&&f.y){if(e.y[0]<f.y[0])f.y[0]=e.y[0];if(e.y[1]>f.y[1])f.y[1]=e.y[1]}
    (e.eng||[]).forEach(function(x){if(x.ch&&f.pw&&f.pw.indexOf(x.ch)<0)f.pw.push(x.ch)})});
  });
  if(f.pw)f.pw.sort(function(a,b){return a-b})});
 log('🔗 Re-scopage familles : '+touched+' liaison(s) ajoutée(s)');return touched}
/* ---------- fetch ---------- */
async function getJSON(url,ms){ms=ms||15000;var ctl=new AbortController();var t=setTimeout(function(){ctl.abort()},ms);
 try{var r=await fetch(url,{signal:ctl.signal,cache:'no-store'});clearTimeout(t);if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}
 catch(e){clearTimeout(t);
  try{var p=await fetch('https://api.allorigins.win/raw?url='+encodeURIComponent(url),{cache:'no-store'});
   if(!p.ok)throw new Error('proxy '+p.status);return await p.json()}catch(e2){throw e}}}
/* ---------- vPIC : makes + modèles 2023+ ---------- */
async function importVPIC(){
 var cur=LS.get('i23vpic',{page:1,done:[]}),added=0,budget=LS.get('i23Budget',40),used=0;
 for(var page=cur.page;used<budget;page++){
  var j;try{j=await getJSON('https://vpic.nhtsa.dot.gov/api/vehicles/GetAllManufacturers?format=json&page='+page)}catch(e){break}
  var rs=(j.Results||[]);if(!rs.length)break;
  for(var i=0;i<rs.length&&used<budget;i++){
   var mk=rs[i].Make_Name;if(!mk||cur.done.indexOf(mk)>=0)continue;
   var g=groupOf(mk);
   if(g==='other'&&!/motor|auto|car|ev|motorc/i.test(mk))continue;
   try{var mj=await getJSON('https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/'+encodeURIComponent(mk)+'?format=json',12000);
    (mj.Results||[]).forEach(function(mo){
     if(!mo.Model_Name)return;
     addModel(mk,mo.Model_Name,2023,2027,'',g);added++})}catch(e){}
   cur.done.push(mk);used++;
   await new Promise(function(r){setTimeout(r,180)})}
  cur.page=page+1;LS.set('i23vpic',cur);
  if(rs.length<100)break}
 if(used>=budget)log('⏸ vPIC pause (budget) — reprise au prochain run');
 else{LS.set('i23vpic',{page:1,done:[]});log('✅ vPIC terminé')}
 return added}
/* ---------- RappelConso 2023+ ---------- */
async function importRC(){
 var out=[],off=0,guard=0,max=LS.get('i23rcPages',20);
 while(guard<max){
  var j;try{j=await getJSON('https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso/records?limit=100&offset='+off+'&order_by=date_de_publication desc')}catch(e){break}
  var rs=j.results||[];if(!rs.length)break;
  rs.forEach(function(x){
   var d=String(x.date_de_publication||'');var ym=d.match(/(19|20)\d{2}/);var y=ym?+ym[0]:0;
   if(y&&y<2023)return;
   out.push({t:x.libelle_affichage||x.noms_des_modeles||x.marque_des_produits,
    b:[x.marque_des_produits],m:String(x.noms_des_modeles||'').split(/[,;\/]/).map(function(s){return s.trim()}).filter(Boolean),
    y:[y||2023,2027],risk:x.risques_encourus||x.motif_du_rappel||'',dtc:[],
    src:'RappelConso '+(x.reference_du_rappel||''),law:['CC1245','CONSOL4213'],
    fire:/incendie|feu|flamm/i.test(String(x.risques_encourus||'')+String(x.motif_du_rappel||''))})});
  off+=100;guard++;if(off>=(j.total_count||0))break;
  await new Promise(function(r){setTimeout(r,150)})}
 return out}
/* ---------- NHTSA recalls 2023+ (chunké, reprenable) ---------- */
async function importNHTSA(){
 var makes=Object.keys(CAT).map(function(m){return m.toUpperCase().replace(/&/g,'AND')});
 var cur=LS.get('i23nhtsa',{m:0,y:2023}),out=[],budget=LS.get('i23Budget',40),used=0;
 for(var mi=cur.m;mi<makes.length&&used<budget;mi++){
  for(var y=(mi===cur.m?cur.y:2023);y<=2027&&used<budget;y++){
   try{var j=await getJSON('https://api.nhtsa.gov/recalls/recallsByVehicle?make='+encodeURIComponent(makes[mi])+'&modelYear='+y,12000);
    (j.results||[]).forEach(function(x){out.push({t:x.Subject||x.Component,b:[makes[mi]],m:[x.Model||''],y:[+y,+y],
     risk:x.Summary||'',dtc:[],src:'NHTSA '+(x.NHTSACampaignNumber||''),law:['CC1245'],
     fire:/fire|flame|incendie/i.test(String(x.Summary||''))})})}catch(e){}
   used++;await new Promise(function(r){setTimeout(r,200)})}
  LS.set('i23nhtsa',{m:mi+1,y:2023});
  if(used>=budget)break}
 if(cur.m>=makes.length-1&&cur.y>=2027)LS.set('i23nhtsa',{m:0,y:2023});
 return out}
/* ---------- Safety Gate ---------- */
async function importSG(){
 try{var txt=await (await fetch('https://api.allorigins.win/raw?url='+encodeURIComponent('https://ec.europa.eu/safety-gate-alerts/screen/webReport/rss?category=Motor%20vehicles'),{cache:'no-store'})).text();
  var doc=new DOMParser().parseFromString(txt,'text/xml');
  var items=Array.prototype.slice.call(doc.querySelectorAll('item'));var out=[];
  items.forEach(function(it){var t=it.querySelector('title'),d=it.querySelector('description');if(!t)return;
   var s=String(t.textContent||'');if(!/vehicle|car|automobile|voiture/i.test(s))return;
   out.push({t:s,b:[],m:[],y:[2023,2027],risk:String(d?d.textContent||'':''),dtc:[],src:'Safety Gate',law:['CC1245','CONSOL4213']})});
  return out}catch(e){return[]}}
/* ---------- merge ---------- */
function mergeRecalls(list){var BU=window.KFBaseUpdate;if(!BU||!list||!list.length)return 0;return BU.mergeRecalls(list).added}
/* ---------- run complet ---------- */
var running=false;
async function run(opts){
 if(running)return;running=true;opts=opts||{};
 var st=$('#i23Status');if(st)st.textContent='⏳ Import massif 2023+ en cours…';
 log('▶ Démarrage import massif (statique + vPIC + RC + NHTSA + SG)');
 try{
  var nStatic=mergeStatic();
  var nVpic=0,nRC=0,nNHTSA=0,nSG=0;
  if(!opts.offline){
   try{nVpic=await importVPIC()}catch(e){log('❌ vPIC : '+e.message)}
   try{nRC=mergeRecalls(await importRC())}catch(e){log('❌ RappelConso : '+e.message)}
   try{nNHTSA=mergeRecalls(await importNHTSA())}catch(e){log('❌ NHTSA : '+e.message)}
   try{nSG=mergeRecalls(await importSG())}catch(e){log('❌ SafetyGate : '+e.message)}}
  var nScope=refreshFamilyScope();
  LS.set('i23Last',Date.now());
  log('✅ Terminé : statique '+nStatic+' · vPIC +'+nVpic+' modèles · RC +'+nRC+' · NHTSA +'+nNHTSA+' · SG +'+nSG+' · scope '+nScope);
  toast('🌐 Import 2023+ : +'+nVpic+' modèles, +'+(nRC+nNHTSA+nSG)+' rappels, scope '+nScope);
  if(st)st.textContent='✅ Dernier import : '+new Date().toLocaleString('fr-FR');
  if(window.KFBaseUpdate)KFBaseUpdate.render();
  panel();
 }catch(e){log('❌ '+e.message);if(st)st.textContent='❌ '+e.message}
 running=false}
/* ---------- planification 15 jours ---------- */
function due(){var last=LS.get('i23Last',0);return !last||(Date.now()-last)>PERIOD}
function nextRun(){var last=LS.get('i23Last',0);return new Date(last+PERIOD)}
function tickScheduler(){if(!LS.get('i23Auto',true))return;if(due())run({})}
setInterval(tickScheduler,6*3600*1000);
/* ---------- UI ---------- */
function panel(){var host=$('#i23Panel');if(!host)return;
 var last=LS.get('i23Last',0);
 host.innerHTML='<div class="card gold"><h2>🗓️ Import massif 15 jours — toutes marques 2023+</h2>'+
 '<p class="mut">Modèles manquants + motorisations/puissances (templates famille) + pannes/TSB/campagnes par famille moteur + rappels RappelConso/NHTSA/Safety Gate 2023+. Couvre marques FR / EU / US / Asie / Chine.</p>'+
 '<div class="row"><label class="tg '+(LS.get('i23Auto',true)?'on':'')+'"><input type="checkbox" id="i23Auto" '+(LS.get('i23Auto',true)?'checked':'')+'> Auto tous les 15 jours</label>'+
 '<button class="pri" data-i23="run">▶ Lancer maintenant</button>'+
 '<button data-i23="offline">📦 Statique seul</button>'+
 '<button data-i23="scope">🔗 Re-scoper familles</button>'+
 '<button data-i23="log">📜 Journal</button></div>'+
 '<p class="mut" id="i23Status">'+(last?'✅ Dernier : '+new Date(last).toLocaleString('fr-FR')+' · prochain auto : '+nextRun().toLocaleDateString('fr-FR'):'⏳ Jamais exécuté — prochain auto : immédiat')+'</p>'+
 '<pre class="doc" id="i23Log" style="max-height:150px">'+esc(LS.get('imp23Log',[]).slice(0,14).join('\n'))+'</pre></div>';
 var on=$('#i23Auto');if(on)on.addEventListener('change',function(){LS.set('i23Auto',on.checked);toast(on.checked?'🗓️ Planification 15 j activée':'🗓️ Planification désactivée')})}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-i23]');if(!b)return;var a=b.dataset.i23;e.preventDefault();
 if(a==='run')run({});
 else if(a==='offline')run({offline:true});
 else if(a==='scope'){var n=refreshFamilyScope();toast('🔗 '+n+' liaison(s)');panel()}
 else if(a==='log'){alert(LS.get('imp23Log',[]).join('\n')||'Vide')}});
function hook(){if(typeof window.renderAdmin==='function'&&!window.renderAdmin.__kfI23){
 var _ra=window.renderAdmin;var w=function(){_ra();var v=$('#view');if(v&&!$('#i23Panel')){var d=document.createElement('div');d.id='i23Panel';v.appendChild(d)}panel()};
 w.__kfI23=true;window.renderAdmin=w}}
hook();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
function boot(){
 mergeStatic();refreshFamilyScope();panel();
 setTimeout(function(){if(LS.get('i23Auto',true)&&due())run({})},6000);
 setTimeout(tickScheduler,30000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFImport2023={run:run,addModel:addModel,refreshFamilyScope:refreshFamilyScope,due:due,nextRun:nextRun,panel:panel,groupOf:groupOf,TPL:TPL};
})();
