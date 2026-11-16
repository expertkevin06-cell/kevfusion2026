/* KEV FUSION 2026 — catalog_ext.js v1.0.0
   Extension massive du catalogue : modèles 2018+ toutes marques principales,
   Land Rover / Range Rover complets (L405/L460/L494/L461/L560/L551/L462/L550/L663),
   motorisations + puissances homologuées + codes moteur. Fusionné dans KFCatalog. */
'use strict';
(function(){
if(!window.KFCatalog){console.warn('catalog_ext: KFCatalog absent');return}
var C=window.KFCatalog,CAT=C.CAT,OWNER=C.OWNER;
function E(l,ch,f,code,y0,y1){return{l:l,ch:ch,kw:Math.round(ch*0.7355),f:f,code:code,y:[y0,y1]}}
function M(make,model,y0,y1,engs,body){
 CAT[make]=CAT[make]||{};
 var prev=CAT[make][model];
 var merged=engs.slice();
 if(prev&&prev.eng){prev.eng.forEach(function(e){if(!merged.some(function(x){return x.l===e.l&&x.ch===e.ch}))merged.push(e)})}
 CAT[make][model]={y:[y0,y1],body:body||'',eng:merged};
 var n=C.norm(model);OWNER[n]=OWNER[n]||[];
 if(OWNER[n].indexOf(make)<0)OWNER[n].push(make)}
function both(model,y0,y1,engs,body){M('Land Rover',model,y0,y1,engs,body);M('Range Rover',model,y0,y1,engs,body)}

/* ================= LAND ROVER / RANGE ROVER — 2018+ ================= */
var JLR_D20=[E('2.0 D150 Ingenium',150,'diesel','AJ200D',2018,2020),E('2.0 D163 Ingenium',163,'diesel','AJ200D',2018,2020),
 E('2.0 D165 Ingenium',163,'diesel','AJ200D',2019,2023),E('2.0 D180 Ingenium',180,'diesel','AJ200D',2018,2020),
 E('2.0 D200 Ingenium',204,'diesel','AJ200D',2019,2023),E('2.0 D204 Ingenium',204,'diesel','AJ200D',2020,2023),
 E('2.0 D240 Ingenium bi-turbo',240,'diesel','AJ200D',2018,2023)];
var JLR_P20=[E('2.0 P200 Ingenium',200,'essence','AJ200P',2018,2023),E('2.0 P250 Ingenium',250,'essence','AJ200P',2018,2023),
 E('2.0 P300 Ingenium',300,'essence','AJ200P',2018,2023)];
var JLR_D30=[E('3.0 D250 Ingenium I6 MHEV',249,'diesel','AJ300D',2020,2027),E('3.0 D300 Ingenium I6 MHEV',300,'diesel','AJ300D',2020,2027),
 E('3.0 D350 Ingenium I6 MHEV',350,'diesel','AJ300D',2022,2027)];
var JLR_P30=[E('3.0 P360 Ingenium I6 MHEV',360,'essence','AJ300P',2020,2027),E('3.0 P400 Ingenium I6 MHEV',400,'essence','AJ300P',2020,2027)];
var JLR_V8=[E('5.0 P525 V8 Supercharged',525,'essence','AJ133',2018,2022),E('5.0 P550 V8 Supercharged',550,'essence','AJ133',2018,2022),
 E('5.0 P565 V8 Supercharged',565,'essence','AJ133',2018,2022),E('5.0 P575 SVR',575,'essence','AJ133',2018,2022),
 E('4.4 P530 V8 BMW',530,'essence','N63',2022,2027),E('4.4 P615 V8 BMW',615,'essence','N63',2022,2027),
 E('4.4 P635 V8 BMW SV',635,'essence','S68',2024,2027)];
var JLR_PHEV2=[E('2.0 P300e PHEV',300,'hybride','AJ200PHEV',2019,2023),E('2.0 P400e PHEV',404,'hybride','AJ200PHEV',2018,2023)];
var JLR_PHEV3=[E('3.0 P440e PHEV',440,'hybride','AJ300PHEV',2022,2027),E('3.0 P460e PHEV',460,'hybride','AJ300PHEV',2023,2027),
 E('3.0 P510e PHEV',510,'hybride','AJ300PHEV',2022,2027),E('3.0 P550e PHEV',550,'hybride','AJ300PHEV',2023,2027)];
both('Range Rover',2018,2027,JLR_D20.concat(JLR_P20,JLR_D30,JLR_P30,JLR_V8,JLR_PHEV2,JLR_PHEV3,[
 E('3.0 SDV6',275,'diesel','AJV6D',2018,2020),E('3.0 TDV6',258,'diesel','AJV6D',2018,2020),
 E('4.4 SDV8',339,'diesel','AJV8D',2018,2020),E('5.0 P565 SVAutobiography',565,'essence','AJ133',2018,2022),
 E('3.0 P550e Autobiography PHEV',550,'hybride','AJ300PHEV',2023,2027),E('4.4 P615 SV',615,'essence','N63',2023,2027)]),'SUV luxe');
both('Range Rover Sport',2018,2027,JLR_D20.concat(JLR_P20,JLR_D30,JLR_P30,JLR_V8,JLR_PHEV3,[
 E('3.0 SDV6',306,'diesel','AJV6D',2018,2020),E('3.0 SDV6 HSE',306,'diesel','AJV6D',2018,2020),
 E('5.0 P575 SVR',575,'essence','AJ133',2018,2022),E('4.4 P635 SV Edition One',635,'essence','S68',2024,2027),
 E('3.0 P510e PHEV',510,'hybride','AJ300PHEV',2023,2027)]),'SUV sport');
both('Range Rover Velar',2018,2027,JLR_D20.concat(JLR_P20,[
 E('3.0 D300 V6',300,'diesel','AJV6D',2018,2020),E('5.0 P550 SVAutobiography',550,'essence','AJ133',2019,2020),
 E('2.0 P400e PHEV',404,'hybride','AJ200PHEV',2020,2023),E('3.0 P400 I6 MHEV',400,'essence','AJ300P',2020,2027)]),'SUV coupé');
both('Range Rover Evoque',2018,2027,[E('2.0 D150 Ingenium',150,'diesel','AJ200D',2019,2023),
 E('2.0 D165 Ingenium',163,'diesel','AJ200D',2019,2023),E('2.0 D180 Ingenium',180,'diesel','AJ200D',2019,2020),
 E('2.0 D200 Ingenium',204,'diesel','AJ200D',2019,2023),E('2.0 P200 Ingenium',200,'essence','AJ200P',2019,2023),
 E('2.0 P250 Ingenium',250,'essence','AJ200P',2019,2023),E('2.0 P300 Ingenium',300,'essence','AJ200P',2019,2023),
 E('1.5 P300e PHEV 3-cyl',309,'hybride','AJ150PHEV',2020,2027),E('2.0 P250e PHEV',250,'hybride','AJ200PHEV',2020,2023)],'SUV compact');
M('Land Rover','Discovery',2018,2027,JLR_D20.concat(JLR_P20,JLR_D30,JLR_P30,[
 E('3.0 SDV6',306,'diesel','AJV6D',2018,2020),E('3.0 TD6',258,'diesel','AJV6D',2018,2020),
 E('3.0 P340 I6 MHEV',340,'essence','AJ300P',2019,2020),E('3.0 P360 I6 MHEV',360,'essence','AJ300P',2020,2023),
 E('5.0 P525 V8',525,'essence','AJ133',2021,2022),E('3.0 D300 I6 MHEV',300,'diesel','AJ300D',2021,2027)]),'SUV 7 places');
M('Land Rover','Discovery Sport',2018,2027,JLR_D20.concat(JLR_P20,[
 E('2.0 P290 MHEV',290,'hybride','AJ200P',2020,2023),E('1.5 P300e PHEV',309,'hybride','AJ150PHEV',2020,2027)]),'SUV compact');
M('Land Rover','Defender',2020,2027,JLR_D20.concat(JLR_D30,JLR_P30,[
 E('2.0 P300 Ingenium',300,'essence','AJ200P',2020,2027),E('2.0 P400e PHEV',404,'hybride','AJ200PHEV',2021,2027),
 E('5.0 P525 V8',525,'essence','AJ133',2021,2024),E('5.0 P500 V8',500,'essence','AJ133',2021,2024),
 E('4.4 P635 OCTA V8 BMW',635,'essence','S68',2024,2027),E('3.0 D200 I6 MHEV',200,'diesel','AJ300D',2020,2023),
 E('3.0 D240 I6 MHEV',240,'diesel','AJ300D',2020,2023),E('3.0 D250 I6 MHEV',249,'diesel','AJ300D',2023,2027),
 E('3.0 D300 I6 MHEV',300,'diesel','AJ300D',2023,2027)]),'SUV tout-terrain');
M('Land Rover','Defender 90',2020,2027,JLR_D20.concat(JLR_D30,JLR_P30,[E('2.0 P300',300,'essence','AJ200P',2020,2027),
 E('5.0 P525 V8',525,'essence','AJ133',2021,2024),E('4.4 P635 OCTA',635,'essence','S68',2024,2027)]),'SUV 3 portes');
M('Land Rover','Defender 110',2020,2027,JLR_D20.concat(JLR_D30,JLR_P30,[E('2.0 P300',300,'essence','AJ200P',2020,2027),
 E('2.0 P400e PHEV',404,'hybride','AJ200PHEV',2021,2027),E('5.0 P525 V8',525,'essence','AJ133',2021,2024)]),'SUV 5 portes');
M('Land Rover','Defender 130',2022,2027,JLR_D30.concat(JLR_P30,[E('3.0 P400 I6 MHEV',400,'essence','AJ300P',2022,2027),
 E('5.0 P500 V8',500,'essence','AJ133',2023,2024)]),'SUV 8 places');
M('Range Rover','Range Rover SV',2023,2027,[E('4.4 P615 V8 BMW',615,'essence','N63',2023,2027),
 E('4.4 P635 V8 BMW',635,'essence','S68',2024,2027),E('3.0 P550e PHEV',550,'hybride','AJ300PHEV',2023,2027)]),'SUV luxe');
M('Range Rover','Range Rover Sport SV',2024,2027,[E('4.4 P635 V8 BMW',635,'essence','S68',2024,2027)]),'SUV sport');
/* Jaguar 2018+ */
M('Jaguar','F-Pace',2018,2027,JLR_D20.concat(JLR_P20,JLR_D30,JLR_P30,[E('5.0 P550 SVR',550,'essence','AJ133',2018,2023),
 E('2.0 P400e PHEV',404,'hybride','AJ200PHEV',2021,2027)]),'SUV');
M('Jaguar','E-Pace',2018,2027,JLR_D20.concat(JLR_P20,[E('1.5 P300e PHEV',309,'hybride','AJ150PHEV',2020,2023),
 E('2.0 P300 MHEV',300,'hybride','AJ200P',2020,2023)]),'SUV compact');
M('Jaguar','I-Pace',2018,2027,[E('EV400 AWD',400,'electrique','EV',2018,2027)]),'SUV électrique');
M('Jaguar','XE',2018,2023,JLR_D20.concat(JLR_P20,[E('3.0 P380 S',380,'essence','AJ126',2018,2019)]),'berline');
M('Jaguar','XF',2018,2023,JLR_D20.concat(JLR_P20,[E('3.0 P380 S',380,'essence','AJ126',2018,2019)]),'berline');
M('Jaguar','F-Type',2018,2024,[E('2.0 P300',300,'essence','AJ200P',2018,2024),E('3.0 P380 V6',380,'essence','AJ126',2018,2020),
 E('5.0 P450 V8',450,'essence','AJ133',2020,2024),E('5.0 P575 R',575,'essence','AJ133',2020,2024)]),'sportive');

/* ================= AUTRES MARQUES — compléments 2018+ ================= */
M('Peugeot','208 II',2019,2027,[E('1.2 PureTech 75',75,'essence','EB2',2019,2023),E('1.2 PureTech 100',100,'essence','EB2ADT',2019,2027),
 E('1.2 PureTech 130',130,'essence','EB2ADTS',2019,2023),E('1.2 Hybrid 100',100,'hybride','EB2GEN3',2023,2027),
 E('1.2 Hybrid 136',136,'hybride','EB2GEN3',2023,2027),E('1.5 BlueHDi 100',100,'diesel','DV5R',2019,2023),
 E('e-208 136',136,'electrique','EV',2019,2027),E('e-208 156',156,'electrique','EV',2023,2027)],'citadine');
M('Peugeot','2008 II',2019,2027,[E('1.2 PureTech 100',100,'essence','EB2ADT',2019,2027),E('1.2 PureTech 130',130,'essence','EB2ADTS',2019,2023),
 E('1.2 Hybrid 136',136,'hybride','EB2GEN3',2023,2027),E('1.5 BlueHDi 110',110,'diesel','DV5R',2019,2023),
 E('e-2008 136',136,'electrique','EV',2019,2027),E('e-2008 156',156,'electrique','EV',2023,2027)],'SUV');
M('Peugeot','308 III',2021,2027,[E('1.2 PureTech 110',110,'essence','EB2ADTS',2021,2023),E('1.2 PureTech 130',130,'essence','EB2ADTS',2021,2023),
 E('1.2 Hybrid 136',136,'hybride','EB2GEN3',2023,2027),E('1.5 BlueHDi 130',130,'diesel','DV5RUC',2021,2023),
 E('1.6 Hybrid 180',180,'hybride','EP6GEN3',2021,2027),E('1.6 Hybrid 225',225,'hybride','EP6GEN3',2021,2027),
 E('e-308 156',156,'electrique','EV',2023,2027)],'berline');
M('Peugeot','3008 III',2023,2027,[E('1.2 Hybrid 136',136,'hybride','EB2GEN3',2023,2027),E('1.6 Hybrid 195',195,'hybride','EP6GEN3',2023,2027),
 E('e-3008 213',213,'electrique','EV',2024,2027),E('e-3008 231',231,'electrique','EV',2024,2027),
 E('e-3008 320 Dual Motor',320,'electrique','EV',2024,2027)],'SUV');
M('Peugeot','5008 II',2018,2023,[E('1.2 PureTech 130',130,'essence','EB2ADTS',2018,2023),E('1.6 PureTech 180',180,'essence','EP6FADTX',2018,2023),
 E('1.5 BlueHDi 130',130,'diesel','DV5RUC',2018,2023),E('2.0 BlueHDi 180',180,'diesel','DW10FC',2018,2023)]),'SUV 7 places');
M('Peugeot','508 II',2018,2027,[E('1.6 PureTech 180',180,'essence','EP6FADTX',2018,2023),E('1.6 PureTech 225',225,'essence','EP6FADTX',2019,2023),
 E('1.5 BlueHDi 130',130,'diesel','DV5RUC',2018,2023),E('2.0 BlueHDi 160',160,'diesel','DW10FC',2018,2020),
 E('1.6 Hybrid 225',225,'hybride','EP6FADTXH',2019,2023),E('1.6 Hybrid 360 PSE',360,'hybride','EP6FADTXH',2021,2023),
 E('1.6 Hybrid 180',180,'hybride','EP6GEN3',2023,2027)]),'berline');
M('Citroën','C3 III',2018,2023,[E('1.2 PureTech 68',68,'essence','EB2',2018,2020),E('1.2 PureTech 82',82,'essence','EB2',2018,2020),
 E('1.2 PureTech 110',110,'essence','EB2ADTS',2018,2023),E('1.5 BlueHDi 100',100,'diesel','DV5R',2018,2023)]),'citadine');
M('Citroën','C3 IV',2023,2027,[E('1.2 PureTech 83',83,'essence','EB2GEN3',2023,2027),E('1.2 Hybrid 100',100,'hybride','EB2GEN3',2023,2027),
 E('ë-C3 113',113,'electrique','EV',2023,2027)],'citadine');
M('Citroën','C4 III',2020,2027,[E('1.2 PureTech 100',100,'essence','EB2ADT',2020,2023),E('1.2 PureTech 130',130,'essence','EB2ADTS',2020,2023),
 E('1.5 BlueHDi 110',110,'diesel','DV5R',2020,2023),E('1.5 BlueHDi 130',130,'diesel','DV5RUC',2020,2023),
 E('ë-C4 136',136,'electrique','EV',2020,2027),E('ë-C4 156',156,'electrique','EV',2023,2027)]),'berline');
M('Citroën','C5 Aircross II',2023,2027,[E('1.2 Hybrid 136',136,'hybride','EB2GEN3',2023,2027),E('1.6 Hybrid 180',180,'hybride','EP6GEN3',2023,2027),
 E('ë-C5 Aircross 213',213,'electrique','EV',2024,2027)]),'SUV');
M('DS','DS3 Crossback E-Tense',2019,2027,[E('1.2 PureTech 100',100,'essence','EB2ADT',2019,2027),E('1.2 PureTech 130',130,'essence','EB2ADTS',2019,2023),
 E('1.5 BlueHDi 100',100,'diesel','DV5R',2019,2023),E('E-Tense 136',136,'electrique','EV',2019,2027)]),'SUV');
M('DS','DS4 II',2021,2027,[E('1.2 PureTech 130',130,'essence','EB2ADTS',2021,2023),E('1.6 PureTech 225',225,'essence','EP6FADTX',2021,2023),
 E('1.5 BlueHDi 130',130,'diesel','DV5RUC',2021,2023),E('E-Tense 225',225,'hybride','EP6FADTXH',2021,2027)]),'berline');
M('DS','DS7 II',2022,2027,[E('1.6 PureTech 180',180,'essence','EP6FADTX',2022,2023),E('1.6 E-Tense 225',225,'hybride','EP6FADTXH',2022,2023),
 E('1.6 E-Tense 300',300,'hybride','EP6FADTXH',2022,2023),E('1.6 E-Tense 360',360,'hybride','EP6FADTXH',2022,2023)]),'SUV');
M('Renault','Clio V',2019,2027,[E('1.0 SCe 65',65,'essence','B4D',2019,2023),E('1.0 TCe 90',90,'essence','H4Dt',2019,2027),
 E('1.0 TCe 100',100,'essence','H4Dt',2019,2023),E('1.3 TCe 130',130,'essence','H5Ht',2019,2023),
 E('1.5 Blue dCi 85',85,'diesel','K9K',2019,2023),E('1.5 Blue dCi 115',115,'diesel','K9K',2019,2023),
 E('1.6 E-Tech 140',140,'hybride','H4M',2020,2023),E('1.6 E-Tech 145',145,'hybride','H4M',2023,2027)]),'citadine');
M('Renault','Captur II',2019,2027,[E('1.0 TCe 90',90,'essence','H4Dt',2019,2027),E('1.0 TCe 100',100,'essence','H4Dt',2019,2023),
 E('1.3 TCe 130',130,'essence','H5Ht',2019,2023),E('1.3 TCe 140',140,'essence','H5Ht',2019,2023),
 E('1.3 TCe 155',155,'essence','H5Ht',2019,2023),E('1.5 Blue dCi 95',95,'diesel','K9K',2019,2023),
 E('1.6 E-Tech 145',145,'hybride','H4M',2020,2027),E('1.6 E-Tech Plug-in 160',160,'hybride','H4M',2020,2023)]),'SUV');
M('Renault','Megane IV',2018,2023,[E('1.3 TCe 115',115,'essence','H5Ht',2018,2023),E('1.3 TCe 140',140,'essence','H5Ht',2018,2023),
 E('1.3 TCe 160',160,'essence','H5Ht',2018,2023),E('1.5 Blue dCi 95',95,'diesel','K9K',2018,2023),
 E('1.5 Blue dCi 115',115,'diesel','K9K',2018,2023),E('1.8 TCe 280 RS',280,'essence','M5Pt',2018,2023),
 E('1.8 TCe 300 RS',300,'essence','M5Pt',2019,2023)]),'berline');
M('Renault','Megane E-Tech',2022,2027,[E('EV60 220',220,'electrique','EV',2022,2027),E('EV40 130',130,'electrique','EV',2022,2027)]),'berline');
M('Renault','Austral',2022,2027,[E('1.2 TCe 130',130,'essence','H5Ft',2022,2023),E('1.3 TCe 140',140,'essence','H5Ht',2022,2027),
 E('1.3 TCe 160',160,'essence','H5Ht',2022,2027),E('1.2 E-Tech 200',200,'hybride','H5Ft',2022,2027)]),'SUV');
M('Renault','Arkana',2021,2027,[E('1.3 TCe 140',140,'essence','H5Ht',2021,2027),E('1.3 TCe 160',160,'essence','H5Ht',2021,2027),
 E('1.6 E-Tech 145',145,'hybride','H4M',2021,2027)]),'SUV coupé');
M('Renault','Symbioz',2024,2027,[E('1.3 TCe 140',140,'essence','H5Ht',2024,2027),E('1.6 E-Tech 145',145,'hybride','H4M',2024,2027)]),'SUV');
M('Renault','Rafale',2024,2027,[E('1.2 E-Tech 200',200,'hybride','H5Ft',2024,2027),E('1.2 E-Tech 300 4x4',300,'hybride','H5Ft',2024,2027)]),'SUV coupé');
M('Renault','Scenic E-Tech',2024,2027,[E('EV60 170',170,'electrique','EV',2024,2027),E('EV87 220',220,'electrique','EV',2024,2027)]),'SUV');
M('Renault','5 E-Tech',2024,2027,[E('EV40 120',120,'electrique','EV',2024,2027),E('EV52 150',150,'electrique','EV',2024,2027)]),'citadine');
M('Dacia','Duster III',2024,2027,[E('1.0 Eco-G 100',100,'essence','H4Dt',2024,2027),E('1.2 TCe 130',130,'essence','H5Ft',2024,2027),
 E('1.2 TCe 140 4x4',140,'hybride','H5Ft',2024,2027),E('1.6 Hybrid 140',140,'hybride','H4M',2024,2027)]),'SUV');
M('Dacia','Jogger',2021,2027,[E('1.0 TCe 110',110,'essence','H4Dt',2021,2027),E('1.0 Eco-G 100',100,'essence','H4Dt',2021,2027),
 E('1.6 Hybrid 140',140,'hybride','H4M',2023,2027)]),'break 7 places');
M('Dacia','Bigster',2025,2027,[E('1.2 TCe 130',130,'essence','H5Ft',2025,2027),E('1.2 TCe 140 4x4',140,'hybride','H5Ft',2025,2027),
 E('1.6 Hybrid 155',155,'hybride','H4M',2025,2027)]),'SUV');
M('Volkswagen','Golf VIII',2019,2027,[E('1.0 TSI 110',110,'essence','EA211',2019,2023),E('1.0 eTSI 110',110,'hybride','EA211',2019,2027),
 E('1.5 TSI 130',130,'essence','EA211EVO',2019,2023),E('1.5 TSI 150',150,'essence','EA211EVO',2019,2023),
 E('1.5 eTSI 130',130,'hybride','EA211EVO',2019,2027),E('1.5 eTSI 150',150,'hybride','EA211EVO',2019,2027),
 E('2.0 TSI 245 GTI',245,'essence','EA888',2020,2024),E('2.0 TSI 265 GTI Clubsport',265,'essence','EA888',2020,2024),
 E('2.0 TSI 300 R',300,'essence','EA888',2020,2023),E('2.0 TSI 333 R',333,'essence','EA888',2023,2027),
 E('2.0 TDI 115',115,'diesel','EA288',2019,2023),E('2.0 TDI 150',150,'diesel','EA288',2019,2023),
 E('2.0 TDI 200 GTD',200,'diesel','EA288',2020,2024),E('1.4 eHybrid 204',204,'hybride','EA211',2020,2023),
 E('1.4 eHybrid 245 GTE',245,'hybride','EA211',2020,2023),E('1.5 eHybrid 272',272,'hybride','EA211EVO',2024,2027)]),'berline');
M('Volkswagen','Tiguan III',2023,2027,[E('1.5 eTSI 130',130,'hybride','EA211EVO',2023,2027),E('1.5 eTSI 150',150,'hybride','EA211EVO',2023,2027),
 E('2.0 TSI 204',204,'essence','EA888',2023,2027),E('2.0 TSI 265',265,'essence','EA888',2023,2027),
 E('2.0 TDI 150',150,'diesel','EA288',2023,2027),E('2.0 TDI 193',193,'diesel','EA288',2023,2027),
 E('1.5 eHybrid 204',204,'hybride','EA211EVO',2023,2027),E('1.5 eHybrid 272',272,'hybride','EA211EVO',2023,2027)]),'SUV');
M('Volkswagen','T-Roc II',2024,2027,[E('1.0 TSI 115',115,'essence','EA211',2024,2027),E('1.5 TSI 150',150,'essence','EA211EVO',2024,2027),
 E('2.0 TSI 300 R',300,'essence','EA888',2024,2027)]),'SUV');
M('Volkswagen','ID.7',2023,2027,[E('Pro 286',286,'electrique','EV',2023,2027),E('Pro S 286',286,'electrique','EV',2023,2027),
 E('GTX 340',340,'electrique','EV',2024,2027)]),'berline');
M('Volkswagen','ID.Buzz',2022,2027,[E('Pro 204',204,'electrique','EV',2022,2027),E('GTX 340',340,'electrique','EV',2024,2027)]),'combi');
M('Audi','Q4 e-tron',2021,2027,[E('35 170',170,'electrique','EV',2021,2027),E('40 204',204,'electrique','EV',2021,2027),
 E('45 quattro 299',299,'electrique','EV',2021,2027),E('50 quattro 299',299,'electrique','EV',2021,2027)]),'SUV');
M('Audi','Q6 e-tron',2024,2027,[E('quattro 387',387,'electrique','EV',2024,2027),E('SQ6 489',489,'electrique','EV',2024,2027)]),'SUV');
M('Audi','A6 e-tron',2024,2027,[E('Performance 367',367,'electrique','EV',2024,2027),E('S6 503',503,'electrique','EV',2024,2027)]),'berline');
M('BMW','Série 3 G20',2018,2027,[E('318i 156',156,'essence','B48',2019,2023),E('320i 184',184,'essence','B48',2018,2023),
 E('330i 258',258,'essence','B48',2018,2023),E('M340i 374',374,'essence','B58',2019,2023),E('M340i 387',387,'essence','B58',2023,2027),
 E('318d 150',150,'diesel','B47',2018,2023),E('320d 190',190,'diesel','B47',2018,2023),E('330d 286',286,'diesel','B57',2019,2023),
 E('M340d 340',340,'diesel','B57',2019,2023),E('320e 204',204,'hybride','B48',2020,2023),E('330e 292',292,'hybride','B48',2019,2023)]),'berline');
M('BMW','X5 G05',2018,2027,[E('xDrive40i 340',340,'essence','B58',2018,2023),E('xDrive40i 381',381,'essence','B58',2023,2027),
 E('M50i 530',530,'essence','N63',2019,2023),E('M60i 530',530,'essence','S68',2023,2027),
 E('xDrive30d 286',286,'diesel','B57',2019,2023),E('xDrive40d 340',340,'diesel','B57',2019,2023),
 E('xDrive45e 394',394,'hybride','B58',2019,2023),E('xDrive50e 489',489,'hybride','B58',2023,2027)]),'SUV');
M('BMW','i4',2021,2027,[E('eDrive35 286',286,'electrique','EV',2022,2027),E('eDrive40 340',340,'electrique','EV',2021,2027),
 E('M50 544',544,'electrique','EV',2021,2027)]),'berline');
M('BMW','iX',2021,2027,[E('xDrive40 326',326,'electrique','EV',2021,2027),E('xDrive50 523',523,'electrique','EV',2021,2027),
 E('M60 619',619,'electrique','EV',2022,2027)]),'SUV');
M('Mercedes-Benz','Classe C W206',2021,2027,[E('C180 170',170,'essence','M254',2021,2027),E('C200 204',204,'essence','M254',2021,2027),
 E('C300 258',258,'essence','M254',2021,2027),E('C220d 200',200,'diesel','OM654',2021,2027),
 E('C300d 265',265,'diesel','OM654',2021,2027),E('C300e 313',313,'hybride','M254',2021,2027),
 E('AMG C43 408',408,'essence','M139',2022,2027),E('AMG C63 S E 680',680,'hybride','M139',2023,2027)]),'berline');
M('Mercedes-Benz','EQC',2019,2023,[E('400 4MATIC 408',408,'electrique','EV',2019,2023)]),'SUV');
M('Mercedes-Benz','EQA',2021,2027,[E('250 190',190,'electrique','EV',2021,2027),E('300 4MATIC 228',228,'electrique','EV',2021,2027),
 E('350 4MATIC 292',292,'electrique','EV',2021,2027)]),'SUV');
M('Mercedes-Benz','EQE',2022,2027,[E('350+ 292',292,'electrique','EV',2022,2027),E('500 4MATIC 408',408,'electrique','EV',2022,2027),
 E('AMG 53 626',626,'electrique','EV',2023,2027)]),'berline');
M('Opel','Corsa F',2019,2027,[E('1.2 75',75,'essence','EB2',2019,2023),E('1.2 Turbo 100',100,'essence','EB2ADT',2019,2027),
 E('1.2 Turbo 130',130,'essence','EB2ADTS',2019,2027),E('1.2 Hybrid 100',100,'hybride','EB2GEN3',2023,2027),
 E('1.2 Hybrid 136',136,'hybride','EB2GEN3',2023,2027),E('Corsa-e 136',136,'electrique','EV',2019,2027),
 E('Corsa-e 156',156,'electrique','EV',2023,2027)]),'citadine');
M('Opel','Astra L',2021,2027,[E('1.2 Turbo 110',110,'essence','EB2ADT',2021,2023),E('1.2 Turbo 130',130,'essence','EB2ADTS',2021,2023),
 E('1.2 Hybrid 145',145,'hybride','EB2GEN3',2023,2027),E('1.5 Diesel 130',130,'diesel','DV5RUC',2021,2023),
 E('1.6 Hybrid 180',180,'hybride','EP6GEN3',2021,2027),E('1.6 Hybrid 225',225,'hybride','EP6GEN3',2021,2027),
 E('Astra Electric 156',156,'electrique','EV',2023,2027)]),'berline');
M('Opel','Grandland II',2024,2027,[E('1.2 Hybrid 136',136,'hybride','EB2GEN3',2024,2027),E('1.6 Hybrid 195',195,'hybride','EP6GEN3',2024,2027),
 E('Grandland Electric 213',213,'electrique','EV',2024,2027)]),'SUV');
M('Ford','Focus IV',2018,2027,[E('1.0 EcoBoost 100',100,'essence','ECOBOOST',2018,2023),E('1.0 EcoBoost 125',125,'essence','ECOBOOST',2018,2023),
 E('1.0 EcoBoost Hybrid 125',125,'hybride','ECOBOOST',2020,2027),E('1.0 EcoBoost Hybrid 155',155,'hybride','ECOBOOST',2020,2023),
 E('1.5 EcoBoost 150',150,'essence','ECOBOOST',2018,2023),E('2.3 EcoBoost 280 ST',280,'essence','ECOBOOST',2019,2023),
 E('1.5 EcoBlue 95',95,'diesel','ECOBLUE',2018,2023),E('1.5 EcoBlue 120',120,'diesel','ECOBLUE',2018,2023),
 E('2.0 EcoBlue 150',150,'diesel','ECOBLUE',2018,2023),E('2.0 EcoBlue 190 ST',190,'diesel','ECOBLUE',2019,2023)]),'berline');
M('Ford','Puma',2019,2027,[E('1.0 EcoBoost Hybrid 125',125,'hybride','ECOBOOST',2019,2027),
 E('1.0 EcoBoost Hybrid 155',155,'hybride','ECOBOOST',2019,2023),E('1.0 EcoBoost 170 ST',170,'essence','ECOBOOST',2021,2023),
 E('Gen-E 163',163,'electrique','EV',2024,2027)]),'SUV');
M('Ford','Kuga III',2019,2027,[E('1.5 EcoBoost 150',150,'essence','ECOBOOST',2019,2023),E('2.0 EcoBlue 150',150,'diesel','ECOBLUE',2019,2023),
 E('2.0 EcoBlue 190',190,'diesel','ECOBLUE',2019,2023),E('2.5 Duratec PHEV 225',225,'hybride','DURATEC',2020,2027),
 E('2.5 Duratec FHEV 190',190,'hybride','DURATEC',2020,2027)]),'SUV');
M('Ford','Explorer EV',2024,2027,[E('Standard 170',170,'electrique','EV',2024,2027),E('Extended 286',286,'electrique','EV',2024,2027),
 E('AWD 340',340,'electrique','EV',2024,2027)]),'SUV');
M('Toyota','Yaris IV',2020,2027,[E('1.5 Hybrid 116',116,'hybride','THS',2020,2023),E('1.5 Hybrid 130',130,'hybride','THS',2022,2027),
 E('1.6 Turbo GR 261',261,'essence','G16E',2020,2024),E('1.6 Turbo GR 280',280,'essence','G16E',2024,2027)]),'citadine');
M('Toyota','Corolla XII',2018,2027,[E('1.8 Hybrid 122',122,'hybride','THS',2018,2023),E('1.8 Hybrid 140',140,'hybride','THS',2023,2027),
 E('2.0 Hybrid 180',180,'hybride','THS',2018,2023),E('2.0 Hybrid 196',196,'hybride','THS',2023,2027),
 E('2.0 Turbo GR 300',300,'essence','G16E',2022,2027)]),'berline');
M('Toyota','C-HR II',2023,2027,[E('1.8 Hybrid 140',140,'hybride','THS',2023,2027),E('2.0 Hybrid 197',197,'hybride','THS',2023,2027),
 E('2.0 PHEV 223',223,'hybride','THS',2023,2027)]),'SUV');
M('Toyota','bZ4X',2022,2027,[E('FWD 204',204,'electrique','EV',2022,2027),E('AWD 218',218,'electrique','EV',2022,2027)]),'SUV');
M('Hyundai','Tucson IV',2020,2027,[E('1.6 T-GDi 150',150,'essence','SMARTSTREAM',2020,2027),E('1.6 T-GDi 180',180,'essence','SMARTSTREAM',2020,2023),
 E('1.6 T-GDi 48V 150',150,'hybride','SMARTSTREAM',2020,2027),E('1.6 T-GDi Hybrid 230',230,'hybride','SMARTSTREAM',2020,2027),
 E('1.6 T-GDi PHEV 265',265,'hybride','SMARTSTREAM',2021,2027),E('1.6 CRDi 136',136,'diesel','U2',2020,2023)]),'SUV');
M('Hyundai','Ioniq 5',2021,2027,[E('58 kWh 170',170,'electrique','EV',2021,2027),E('72.6 kWh 218',218,'electrique','EV',2021,2023),
 E('77.4 kWh 229',229,'electrique','EV',2023,2027),E('AWD 325',325,'electrique','EV',2021,2027),E('N 650',650,'electrique','EV',2024,2027)]),'SUV');
M('Hyundai','Ioniq 6',2022,2027,[E('RWD 151',151,'electrique','EV',2022,2027),E('RWD 229',229,'electrique','EV',2022,2027),
 E('AWD 325',325,'electrique','EV',2022,2027)]),'berline');
M('Kia','Sportage V',2021,2027,[E('1.6 T-GDi 150',150,'essence','SMARTSTREAM',2021,2027),E('1.6 T-GDi 180',180,'essence','SMARTSTREAM',2021,2023),
 E('1.6 T-GDi 48V 150',150,'hybride','SMARTSTREAM',2021,2027),E('1.6 T-GDi Hybrid 230',230,'hybride','SMARTSTREAM',2021,2027),
 E('1.6 T-GDi PHEV 265',265,'hybride','SMARTSTREAM',2021,2027),E('1.6 CRDi 136',136,'diesel','U2',2021,2023)]),'SUV');
M('Kia','EV6',2021,2027,[E('58 kWh 170',170,'electrique','EV',2021,2027),E('77.4 kWh 229',229,'electrique','EV',2021,2027),
 E('AWD 325',325,'electrique','EV',2021,2027),E('GT 585',585,'electrique','EV',2022,2027)]),'SUV');
M('Kia','EV9',2023,2027,[E('RWD 204',204,'electrique','EV',2023,2027),E('AWD 384',384,'electrique','EV',2023,2027),
 E('GT 508',508,'electrique','EV',2024,2027)]),'SUV');
M('Kia','Niro II',2022,2027,[E('1.6 Hybrid 141',141,'hybride','SMARTSTREAM',2022,2027),E('1.6 PHEV 183',183,'hybride','SMARTSTREAM',2022,2027),
 E('e-Niro 204',204,'electrique','EV',2022,2027)]),'SUV');
M('Fiat','600',2023,2027,[E('1.2 Hybrid 100',100,'hybride','EB2GEN3',2023,2027),E('600e 156',156,'electrique','EV',2023,2027)]),'SUV');
M('Jeep','Avenger',2023,2027,[E('1.2 Turbo 100',100,'essence','EB2ADT',2023,2027),E('1.2 Hybrid 100',100,'hybride','EB2GEN3',2023,2027),
 E('Avenger Electric 156',156,'electrique','EV',2023,2027)]),'SUV');
M('Alfa Romeo','Tonale',2022,2027,[E('1.5 Hybrid 130',130,'hybride','GSE',2022,2027),E('1.5 Hybrid 160',160,'hybride','GSE',2022,2027),
 E('1.3 PHEV Q4 280',280,'hybride','GSE',2022,2027),E('1.6 JTDM 130',130,'diesel','MJET',2022,2023)]),'SUV');
M('Alfa Romeo','Junior',2024,2027,[E('1.2 Hybrid 136',136,'hybride','EB2GEN3',2024,2027),E('Elettrica 156',156,'electrique','EV',2024,2027),
 E('Elettrica Veloce 240',240,'electrique','EV',2024,2027)]),'SUV');
M('Volvo','EX30',2023,2027,[E('Single Motor 272',272,'electrique','EV',2023,2027),E('Twin Motor 428',428,'electrique','EV',2023,2027)]),'SUV');
M('Volvo','EX90',2024,2027,[E('Twin Motor 408',408,'electrique','EV',2024,2027),E('Twin Motor Performance 517',517,'electrique','EV',2024,2027)]),'SUV');
M('Tesla','Model 3 Highland',2023,2027,[E('RWD 283',283,'electrique','EV',2023,2027),E('Long Range AWD 498',498,'electrique','EV',2023,2027),
 E('Performance 460',460,'electrique','EV',2024,2027)]),'berline');
M('Tesla','Model Y Juniper',2025,2027,[E('RWD 299',299,'electrique','EV',2025,2027),E('Long Range AWD 514',514,'electrique','EV',2025,2027),
 E('Performance 534',534,'electrique','EV',2025,2027)]),'SUV');
M('Tesla','Cybertruck',2023,2027,[E('AWD 600',600,'electrique','EV',2023,2027),E('Cyberbeast 845',845,'electrique','EV',2023,2027)]),'pick-up');
M('MG','MG4',2022,2027,[E('Standard 170',170,'electrique','EV',2022,2027),E('Comfort 204',204,'electrique','EV',2022,2027),
 E('Luxury 204',204,'electrique','EV',2022,2027),E('XPower 435',435,'electrique','EV',2023,2027)]),'berline');
M('MG','ZS Hybrid+',2024,2027,[E('1.5 Hybrid+ 190',190,'hybride','15S4C',2024,2027)]),'SUV');
M('MG','HS II',2024,2027,[E('1.5 T-GDI 162',162,'essence','15E4E',2024,2027),E('1.5 PHEV 272',272,'hybride','15E4E',2024,2027)]),'SUV');
M('BYD','Seal U DM-i',2023,2027,[E('DM-i 218',218,'hybride','BYD472QA',2023,2027),E('DM-p 324',324,'hybride','BYD472QA',2024,2027)]),'SUV');
M('BYD','Seagull',2023,2027,[E('Dolphin Mini 75',75,'electrique','EV',2023,2027),E('Dolphin Mini 101',101,'electrique','EV',2023,2027)]),'citadine');
M('Cupra','Terramar',2024,2027,[E('1.5 eTSI 150',150,'hybride','EA211EVO',2024,2027),E('2.0 TSI 204',204,'essence','EA888',2024,2027),
 E('2.0 TSI 272',272,'essence','EA888',2024,2027),E('1.5 e-Hybrid 272',272,'hybride','EA211EVO',2024,2027)]),'SUV');
M('Cupra','Tavascan',2024,2027,[E('V1 286',286,'electrique','EV',2024,2027),E('V2 340',340,'electrique','EV',2024,2027)]),'SUV');
M('Skoda','Elroq',2024,2027,[E('50 170',170,'electrique','EV',2024,2027),E('60 204',204,'electrique','EV',2024,2027),
 E('85 286',286,'electrique','EV',2024,2027)]),'SUV');
M('Skoda','Enyaq',2021,2027,[E('60 179',179,'electrique','EV',2021,2023),E('80 204',204,'electrique','EV',2021,2023),
 E('85 286',286,'electrique','EV',2023,2027),E('85x 286',286,'electrique','EV',2023,2027),E('RS 340',340,'electrique','EV',2023,2027)]),'SUV');
M('Porsche','Macan Electric',2024,2027,[E('4 408',408,'electrique','EV',2024,2027),E('4S 516',516,'electrique','EV',2024,2027),
 E('Turbo 639',639,'electrique','EV',2024,2027)]),'SUV');
M('Porsche','Taycan',2019,2027,[E('RWD 408',408,'electrique','EV',2019,2023),E('4S 530',530,'electrique','EV',2019,2023),
 E('Turbo 884',884,'electrique','EV',2023,2027),E('Turbo GT 1034',1034,'electrique','EV',2024,2027)]),'berline');
/* verrous famille moteur JLR */
if(C.LOCK){C.LOCK.AJ200D=['Jaguar','Land Rover','Range Rover'];C.LOCK.AJ200P=['Jaguar','Land Rover','Range Rover'];
 C.LOCK.AJ300=['Jaguar','Land Rover','Range Rover'];C.LOCK.AJ133=['Jaguar','Land Rover','Range Rover'];
 C.LOCK.AJ150=['Jaguar','Land Rover','Range Rover'];C.LOCK.N63=['BMW','Land Rover','Range Rover'];
 C.LOCK.S68=['BMW','Land Rover','Range Rover'];C.LOCK.AJV6=['Jaguar','Land Rover','Range Rover'];
 C.LOCK.AJV8=['Jaguar','Land Rover','Range Rover']}
/* purge des combinaisons invalides après extension */
try{C.purge()}catch(e){}
window.KFCatalogExt={added:Object.keys(CAT).length};
})();
