/* KEV FUSION 2026 — megabase_catalog.js v1.0.0
   Compléments catalogue indispensables à la méga-base : DACIA Spring (toutes versions/puissances),
   Dacia / Renault / Volkswagen / Peugeot / Citroën / Opel / DS — modèles & motorisations réelles.
   N'écrase jamais les motorisations réelles déjà présentes : ajoute uniquement les variantes manquantes. */
'use strict';
(function(){
var APPLIED=false;
function ready(){return !!window.KFCatalog}
function E(l,ch,f,code,y0,y1){return{l:l,ch:ch,kw:Math.round(ch*0.7355),f:f,code:code,y:[y0,y1]}}
function apply(){
 if(APPLIED||!ready())return false;
 var C=window.KFCatalog,CAT=C.CAT,OWNER=C.OWNER;
 function M(make,model,y0,y1,body,engs,replace){
  CAT[make]=CAT[make]||{};
  var prev=CAT[make][model];
  if(prev&&prev.eng&&prev.eng.length&&!replace){
   engs.forEach(function(e){if(!prev.eng.some(function(x){return x.l===e.l&&x.ch===e.ch}))prev.eng.push(e)});
   prev.y=[Math.min(prev.y[0],y0),Math.max(prev.y[1],y1)];
   if(body&&!prev.body)prev.body=body;
  }else{CAT[make][model]={y:[y0,y1],body:body||'',eng:engs.slice()}}
  var n=C.norm(model);OWNER[n]=OWNER[n]||[];if(OWNER[n].indexOf(make)<0)OWNER[n].push(make)}

/* ══════════ DACIA SPRING — toutes versions ══════════ */
M('Dacia','Spring',2021,2027,'citadine électrique',[
 E('Electric 45 (26,8 kWh)',45,'electrique','EV',2021,2024),
 E('Electric 45 Extreme',45,'electrique','EV',2022,2024),
 E('Electric 65 Extreme (26,8 kWh)',65,'electrique','EV',2023,2024),
 E('Electric 65 (26,8 kWh)',65,'electrique','EV',2024,2027),
 E('Electric 100 (nouvelle génération)',100,'electrique','EV',2026,2027)],true);
M('Dacia','Spring Cargo',2021,2027,'utilitaire électrique',[
 E('Electric 45',45,'electrique','EV',2021,2024),E('Electric 65',65,'electrique','EV',2024,2027)],true);
/* ══════════ DACIA ══════════ */
M('Dacia','Solenza',2003,2005,'berline',[E('1.4 MPI 75',75,'essence','K7J',2003,2005),E('1.9 D 63',63,'diesel','F8Q',2003,2005)]);
M('Dacia','Logan MCV',2006,2021,'break',[E('1.6 16v 105',105,'essence','K4M',2006,2021),E('1.2 16v 75',75,'essence','D4F',2006,2021),E('1.5 dCi 75',75,'diesel','K9K',2006,2021),E('1.5 dCi 90',90,'diesel','K9K',2006,2021)]);
M('Dacia','Sandero Stepway',2009,2027,'crossover',[E('1.6 90',90,'essence','K7M',2009,2012),E('0.9 TCe 90',90,'essence','H4Bt',2012,2021),E('1.0 TCe 90',90,'essence','H4Dt',2021,2027),E('1.0 Eco-G 100',100,'essence','H4Dt',2021,2027),E('1.5 dCi 90',90,'diesel','K9K',2009,2021)]);
M('Dacia','Duster Pick-Up',2010,2018,'pick-up',[E('1.5 dCi 85',85,'diesel','K9K',2010,2018),E('1.6 16v 105',105,'essence','K4M',2010,2018)]);
/* ══════════ RENAULT ══════════ */
M('Renault','Vel Satis',2002,2009,'berline',[E('2.0 Turbo 170',170,'essence','F4Rt',2002,2009),E('3.5 V6 245',245,'essence','V4Y',2002,2009),E('2.2 dCi 150',150,'diesel','G9T',2002,2009),E('3.0 dCi V6 180',180,'diesel','P9X',2002,2009)]);
M('Renault','Avantime',2001,2003,'coupé monospace',[E('2.0 Turbo 163',163,'essence','F4Rt',2001,2003),E('3.0 V6 207',207,'essence','L7X',2001,2003),E('2.2 dCi 150',150,'diesel','G9T',2001,2003)]);
M('Renault','Clio Campus / Symbol',2006,2014,'berline',[E('1.2 16v 75',75,'essence','D4F',2006,2014),E('1.5 dCi 70',70,'diesel','K9K',2006,2014)]);
M('Renault','Grand Scenic',2004,2022,'monospace 7pl',[E('1.6 16v 110',110,'essence','K4M',2004,2016),E('1.5 dCi 105',105,'diesel','K9K',2004,2016),E('1.6 dCi 130',130,'diesel','R9M',2011,2016),E('1.7 Blue dCi 150',150,'diesel','R9N',2018,2022)]);
M('Renault','Grand Modus',2008,2013,'monospace',[E('1.2 16v 75',75,'essence','D4F',2008,2013),E('1.5 dCi 85',85,'diesel','K9K',2008,2013),E('1.5 dCi 105',105,'diesel','K9K',2008,2013)]);
M('Renault','Kangoo Be Bop',2009,2012,'ludospace',[E('1.6 16v 105',105,'essence','K4M',2009,2012),E('1.5 dCi 90',90,'diesel','K9K',2009,2012)]);
M('Renault','Twingo RS',2008,2013,'citadine sport',[E('1.6 16v 133',133,'essence','K4M',2008,2013)]);
M('Renault','Megane Coupe / CC',2009,2016,'coupé cabriolet',[E('1.4 TCe 130',130,'essence','H5Ft',2009,2016),E('2.0 TCe 180',180,'essence','F4Rt',2009,2016),E('1.5 dCi 110',110,'diesel','K9K',2009,2016),E('2.0 dCi 165',165,'diesel','M9R',2009,2016)]);
M('Renault','Trafic II',2001,2014,'utilitaire',[E('1.9 dCi 82',82,'diesel','F9Q',2001,2014),E('1.9 dCi 100',100,'diesel','F9Q',2001,2014),E('2.0 dCi 90',90,'diesel','M9R',2006,2014),E('2.0 dCi 115',115,'diesel','M9R',2006,2014),E('2.5 dCi 135',135,'diesel','G9U',2003,2014),E('2.5 dCi 145',145,'diesel','G9U',2006,2014)]);
M('Renault','Master II',1997,2010,'fourgon',[E('2.2 dCi 90',90,'diesel','G9T',2000,2010),E('2.5 dCi 100',100,'diesel','G9U',2001,2010),E('2.5 dCi 120',120,'diesel','G9U',2001,2010),E('2.5 dCi 145',145,'diesel','G9U',2006,2010),E('2.8 dTi 114',114,'diesel','S9W',1998,2010)]);
/* ══════════ VOLKSWAGEN ══════════ */
M('Volkswagen','up!',2011,2023,'citadine',[E('1.0 MPI 60',60,'essence','EA211',2011,2023),E('1.0 MPI 75',75,'essence','EA211',2011,2023),E('1.0 TSI 90',90,'essence','EA211',2016,2023),E('1.0 TSI 115 GTI',115,'essence','EA211',2018,2023),E('e-up! 82',82,'electrique','EV',2013,2023)]);
M('Volkswagen','Scirocco',2008,2017,'coupé',[E('1.4 TSI 160',160,'essence','EA111',2008,2015),E('2.0 TSI 200',200,'essence','EA888',2008,2017),E('2.0 TSI 265 R',265,'essence','EA888',2009,2017),E('2.0 TDI 140',140,'diesel','EA189',2008,2015),E('2.0 TDI 170',170,'diesel','EA189',2009,2015)]);
M('Volkswagen','Eos',2006,2015,'cabriolet',[E('1.4 TSI 160',160,'essence','EA111',2006,2015),E('2.0 TSI 200',200,'essence','EA888',2006,2015),E('2.0 TDI 140',140,'diesel','EA189',2006,2015)]);
M('Volkswagen','Beetle',2011,2019,'citadine',[E('1.2 TSI 105',105,'essence','EA211',2011,2019),E('1.4 TSI 160',160,'essence','EA111',2011,2019),E('2.0 TSI 200',200,'essence','EA888',2011,2019),E('2.0 TDI 140',140,'diesel','EA189',2011,2019)]);
M('Volkswagen','Phaeton',2002,2016,'berline luxe',[E('3.2 V6 241',241,'essence','VR6',2002,2016),E('4.2 V8 335',335,'essence','V8',2002,2016),E('6.0 W12 450',450,'essence','W12',2002,2016),E('5.0 V10 TDI 313',313,'diesel','V10TDI',2002,2016),E('3.0 V6 TDI 245',245,'diesel','EA897',2008,2016)]);
M('Volkswagen','Amarok',2010,2027,'pick-up',[E('2.0 TSI 180',180,'essence','EA888',2010,2020),E('2.0 TDI 140',140,'diesel','EA189',2010,2020),E('2.0 BiTDI 180',180,'diesel','EA189',2010,2020),E('2.0 BiTDI 204',204,'diesel','EA288',2020,2027),E('3.0 V6 TDI 204',204,'diesel','EA897',2016,2027),E('3.0 V6 TDI 258',258,'diesel','EA897',2018,2027)]);
M('Volkswagen','Touareg',2002,2027,'SUV luxe',[E('3.2 V6 241',241,'essence','VR6',2002,2010),E('4.2 V8 350',350,'essence','V8',2002,2010),E('5.0 V10 TDI 313',313,'diesel','V10TDI',2002,2010),E('3.0 V6 TDI 245',245,'diesel','EA897',2002,2018),E('4.2 V8 TDI 340',340,'diesel','V8TDI',2010,2018),E('3.0 TSI 340',340,'essence','EA839',2018,2027),E('4.0 V8 TDI 421',421,'diesel','EA898',2019,2023),E('3.0 eHybrid 381',381,'hybride','EA839',2020,2027)]);
M('Volkswagen','Transporter T5',2003,2015,'utilitaire',[E('2.5 TDI 131',131,'diesel','R5TDI',2003,2010),E('2.5 TDI 174',174,'diesel','R5TDI',2006,2010),E('2.0 TDI 84',84,'diesel','EA189',2009,2015),E('2.0 TDI 102',102,'diesel','EA189',2009,2015),E('2.0 TDI 140',140,'diesel','EA189',2009,2015),E('2.0 BiTDI 180',180,'diesel','EA189CFCA',2009,2015),E('2.0 TSI 150',150,'essence','EA888',2010,2015)]);
M('Volkswagen','Transporter T6',2015,2027,'utilitaire',[E('2.0 TDI 84',84,'diesel','EA288',2015,2019),E('2.0 TDI 102',102,'diesel','EA288',2015,2019),E('2.0 TDI 110',110,'diesel','EA288',2019,2027),E('2.0 TDI 150',150,'diesel','EA288',2015,2027),E('2.0 BiTDI 204',204,'diesel','EA288',2015,2027),E('2.0 TSI 150',150,'essence','EA888',2015,2019),E('2.0 TSI 204',204,'essence','EA888',2015,2027),E('ABT e-Transporter 150',150,'electrique','EV',2020,2023)]);
M('Volkswagen','Caddy',2004,2027,'ludospace',[E('1.6 MPI 102',102,'essence','EA113',2004,2015),E('1.2 TSI 84',84,'essence','EA211',2015,2020),E('1.4 TSI 125',125,'essence','EA211',2015,2020),E('1.5 TSI 114',114,'essence','EA211EVO',2020,2027),E('1.9 TDI 105',105,'diesel','EA188',2004,2010),E('2.0 TDI 85',85,'diesel','EA288',2015,2020),E('2.0 TDI 122',122,'diesel','EA288',2015,2027)]);
M('Volkswagen','Touran',2003,2027,'monospace',[E('1.6 MPI 102',102,'essence','EA113',2003,2010),E('1.4 TSI 140',140,'essence','EA111',2006,2015),E('1.5 TSI 150',150,'essence','EA211EVO',2015,2027),E('1.9 TDI 105',105,'diesel','EA188',2003,2010),E('2.0 TDI 140',140,'diesel','EA189',2003,2015),E('2.0 TDI 150',150,'diesel','EA288',2015,2027)]);
M('Volkswagen','Sharan',2010,2022,'monospace',[E('1.4 TSI 150',150,'essence','EA211',2010,2022),E('2.0 TSI 200',200,'essence','EA888',2010,2022),E('2.0 TDI 140',140,'diesel','EA189',2010,2015),E('2.0 TDI 150',150,'diesel','EA288',2015,2022),E('2.0 TDI 184',184,'diesel','EA288',2015,2022)]);
M('Volkswagen','Arteon',2017,2027,'berline',[E('2.0 TSI 190',190,'essence','EA888',2017,2027),E('2.0 TSI 280',280,'essence','EA888',2017,2023),E('2.0 TSI 320 R',320,'essence','EA888',2020,2027),E('2.0 TDI 150',150,'diesel','EA288',2017,2027),E('2.0 TDI 200',200,'diesel','EA288',2017,2027),E('1.4 eHybrid 218',218,'hybride','EA211',2020,2027)]);
M('Volkswagen','Taigo',2021,2027,'SUV coupé',[E('1.0 TSI 95',95,'essence','EA211',2021,2027),E('1.0 TSI 110',110,'essence','EA211',2021,2023),E('1.5 TSI 150',150,'essence','EA211EVO',2021,2027)]);
/* ══════════ PEUGEOT ══════════ */
M('Peugeot','1007',2005,2009,'citadine',[E('1.4 16v 90',90,'essence','ET3',2005,2009),E('1.6 16v 110',110,'essence','TU5',2005,2009),E('1.4 HDi 70',70,'diesel','DV4',2005,2009)]);
M('Peugeot','107',2005,2014,'citadine',[E('1.0 12v 68',68,'essence','KR',2005,2014)]);
M('Peugeot','207',2006,2014,'citadine',[E('1.4 VTi 95',95,'essence','EP3',2007,2012),E('1.6 VTi 120',120,'essence','EP6',2006,2012),E('1.6 THP 150',150,'essence','EP6DT',2006,2010),E('1.6 THP 175',175,'essence','EP6DTS',2007,2012),E('1.4 HDi 68',68,'diesel','DV4',2006,2012),E('1.6 HDi 92',92,'diesel','DV6',2006,2014),E('1.6 HDi 110',110,'diesel','DV6',2006,2012)]);
M('Peugeot','307',2001,2012,'berline',[E('1.4i 75',75,'essence','TU3',2001,2008),E('1.6i 110',110,'essence','TU5',2001,2008),E('2.0i 136',136,'essence','EW10',2001,2008),E('1.6 HDi 90',90,'diesel','DV6',2004,2012),E('1.6 HDi 110',110,'diesel','DV6',2004,2012),E('2.0 HDi 90',90,'diesel','DW10',2001,2008),E('2.0 HDi 136',136,'diesel','DW10',2003,2008)]);
M('Peugeot','407',2004,2011,'berline',[E('1.8i 116',116,'essence','EW7',2004,2010),E('2.0i 136',136,'essence','EW10',2004,2010),E('1.6 HDi 110',110,'diesel','DV6',2004,2011),E('2.0 HDi 136',136,'diesel','DW10',2004,2011),E('2.0 HDi 163',163,'diesel','DW10',2009,2011),E('2.7 HDi V6 204',204,'diesel','DT17',2005,2010),E('3.0 HDi V6 240',240,'diesel','DT20',2009,2011)]);
M('Peugeot','607',2000,2010,'berline',[E('2.2i 158',158,'essence','EW12',2000,2010),E('3.0 V6 207',207,'essence','ES9',2000,2010),E('2.0 HDi 110',110,'diesel','DW10',2000,2010),E('2.2 HDi 136',136,'diesel','DW12',2000,2010),E('2.7 HDi V6 204',204,'diesel','DT17',2005,2010)]);
M('Peugeot','807',2002,2014,'monospace',[E('2.0i 136',136,'essence','EW10',2002,2014),E('2.0 HDi 120',120,'diesel','DW10',2002,2014),E('2.0 HDi 136',136,'diesel','DW10',2006,2014),E('2.2 HDi 170',170,'diesel','DW12',2006,2014)]);
M('Peugeot','RCZ',2010,2015,'coupé',[E('1.6 THP 156',156,'essence','EP6DT',2010,2015),E('1.6 THP 200',200,'essence','EP6CDT',2010,2015),E('1.6 THP 270 R',270,'essence','EP6CDTR',2013,2015),E('2.0 HDi 163',163,'diesel','DW10',2010,2015)]);
M('Peugeot','Bipper / Bipper Tepee',2008,2018,'ludospace',[E('1.4 75',75,'essence','TU3',2008,2018),E('1.4 HDi 70',70,'diesel','DV4',2008,2018),E('1.3 HDi 75',75,'diesel','MJET',2009,2018)]);
/* ══════════ CITROËN ══════════ */
M('Citroën','C2',2003,2009,'citadine',[E('1.1i 60',60,'essence','TU1',2003,2009),E('1.4i 75',75,'essence','TU3',2003,2009),E('1.6 VTS 125',125,'essence','TU5',2003,2009),E('1.4 HDi 70',70,'diesel','DV4',2003,2009)]);
M('Citroën','C3 Picasso',2009,2017,'monospace',[E('1.4 VTi 95',95,'essence','EP3',2009,2017),E('1.6 VTi 120',120,'essence','EP6',2009,2017),E('1.6 HDi 92',92,'diesel','DV6',2009,2017),E('1.6 HDi 112',112,'diesel','DV6',2010,2017)]);
M('Citroën','C4 Picasso / Grand C4 Picasso',2006,2018,'monospace',[E('1.6 VTi 120',120,'essence','EP6',2008,2014),E('1.6 THP 150',150,'essence','EP6DT',2008,2014),E('1.6 THP 156',156,'essence','EP6DT',2010,2015),E('1.6 HDi 110',110,'diesel','DV6',2006,2015),E('1.6 BlueHDi 120',120,'diesel','DV6',2014,2018),E('2.0 BlueHDi 150',150,'diesel','DW10FC',2013,2018)]);
M('Citroën','C5',2001,2017,'berline',[E('1.6 THP 150',150,'essence','EP6DT',2009,2015),E('1.6 THP 156',156,'essence','EP6DT',2010,2015),E('2.0i 140',140,'essence','EW10',2001,2010),E('1.6 HDi 110',110,'diesel','DV6',2004,2015),E('2.0 HDi 136',136,'diesel','DW10',2004,2010),E('2.0 HDi 163',163,'diesel','DW10',2009,2015),E('2.2 HDi 170',170,'diesel','DW12',2006,2015),E('2.7 HDi V6 204',204,'diesel','DT17',2006,2009),E('3.0 HDi V6 240',240,'diesel','DT20',2009,2015)]);
M('Citroën','C6',2005,2012,'berline luxe',[E('3.0 V6 211',211,'essence','ES9',2005,2012),E('2.7 HDi V6 204',204,'diesel','DT17',2005,2012),E('3.0 HDi V6 240',240,'diesel','DT20',2009,2012)]);
M('Citroën','C8',2002,2014,'monospace',[E('2.0i 136',136,'essence','EW10',2002,2014),E('2.0 HDi 120',120,'diesel','DW10',2002,2014),E('2.2 HDi 170',170,'diesel','DW12',2006,2014)]);
M('Citroën','DS3',2010,2019,'citadine',[E('1.2 PureTech 82',82,'essence','EB2',2014,2019),E('1.2 PureTech 110',110,'essence','EB2ADTS',2014,2019),E('1.2 PureTech 130',130,'essence','EB2ADTS',2015,2019),E('1.6 VTi 120',120,'essence','EP6',2010,2015),E('1.6 THP 156',156,'essence','EP6DT',2010,2015),E('1.6 THP 208 Racing',208,'essence','EP6CDTX',2013,2018),E('1.6 BlueHDi 100',100,'diesel','DV6',2014,2018),E('1.6 BlueHDi 120',120,'diesel','DV6',2014,2018)]);
M('Citroën','DS4',2011,2018,'berline',[E('1.6 THP 165',165,'essence','EP6FDT',2011,2018),E('1.6 THP 200',200,'essence','EP6FDT',2011,2018),E('1.6 HDi 112',112,'diesel','DV6',2011,2015),E('1.6 BlueHDi 120',120,'diesel','DV6',2014,2018),E('2.0 BlueHDi 180',180,'diesel','DW10FC',2013,2018)]);
M('Citroën','DS5',2011,2018,'berline',[E('1.6 THP 156',156,'essence','EP6DT',2011,2015),E('1.6 THP 200',200,'essence','EP6FDT',2012,2018),E('1.6 BlueHDi 120',120,'diesel','DV6',2014,2018),E('2.0 BlueHDi 180',180,'diesel','DW10FC',2013,2018),E('2.0 Hybrid4 200',200,'hybride','DW10H',2012,2016)]);
M('Citroën','Nemo',2008,2018,'ludospace',[E('1.4 75',75,'essence','TU3',2008,2018),E('1.4 HDi 70',70,'diesel','DV4',2008,2018),E('1.3 HDi 75',75,'diesel','MJET',2009,2018)]);
/* ══════════ OPEL ══════════ */
M('Opel','Corsa D',2006,2014,'citadine',[E('1.2 80',80,'essence','A12XEL',2006,2014),E('1.4 90',90,'essence','A14XEL',2006,2014),E('1.4 Turbo 100',100,'essence','A14NET',2010,2014),E('1.6 Turbo 192 OPC',192,'essence','A16LER',2007,2014),E('1.3 CDTI 75',75,'diesel','MJET',2006,2014),E('1.7 CDTI 125',125,'diesel','A17DTS',2006,2014)]);
M('Opel','Corsa E',2014,2019,'citadine',[E('1.4 90',90,'essence','B14XEL',2014,2019),E('1.4 Turbo 100',100,'essence','B14NET',2014,2019),E('1.0 Turbo 115',115,'essence','B10XFL',2015,2019),E('1.6 Turbo 207 OPC',207,'essence','B16LES',2015,2019),E('1.3 CDTI 95',95,'diesel','B13DTE',2014,2019)]);
M('Opel','Astra J',2009,2015,'berline',[E('1.4 Turbo 120',120,'essence','A14NET',2009,2015),E('1.4 Turbo 140',140,'essence','A14NET',2009,2015),E('1.6 Turbo 180',180,'essence','A16LET',2009,2015),E('1.6 SIDI Turbo 170',170,'essence','A16XHT',2012,2015),E('2.0 OPC 280',280,'essence','A20NFT',2012,2015),E('1.7 CDTI 110',110,'diesel','A17DTC',2009,2015),E('2.0 CDTI 165',165,'diesel','A20DTH',2009,2015)]);
M('Opel','Astra K',2015,2021,'berline',[E('1.0 Turbo 105',105,'essence','B10XFL',2015,2021),E('1.4 Turbo 150',150,'essence','B14XFT',2015,2021),E('1.6 SIDI Turbo 200',200,'essence','B16SHT',2015,2021),E('1.6 CDTI 110',110,'diesel','B16DTH',2015,2021),E('1.6 CDTI 136',136,'diesel','B16DTH',2015,2021),E('1.6 BiTurbo CDTI 160',160,'diesel','B16DTR',2015,2019)]);
M('Opel','Insignia A',2008,2017,'berline',[E('1.6 Turbo 180',180,'essence','A16LET',2008,2017),E('2.0 Turbo 220',220,'essence','A20NHT',2008,2017),E('2.8 V6 Turbo 260',260,'essence','A28NET',2008,2017),E('2.0 CDTI 130',130,'diesel','A20DT',2008,2017),E('2.0 CDTI 160',160,'diesel','A20DTH',2008,2017),E('2.0 BiTurbo CDTI 195',195,'diesel','A20DTR',2012,2017)]);
M('Opel','Insignia B',2017,2022,'berline',[E('1.5 Turbo 165',165,'essence','B15XFT',2017,2022),E('2.0 Turbo 230',230,'essence','B20NFT',2017,2022),E('1.6 CDTI 136',136,'diesel','B16DTH',2017,2022),E('2.0 Diesel 170',170,'diesel','B20DTH',2017,2022),E('2.0 BiTurbo Diesel 210',210,'diesel','B20DTR',2017,2022)]);
M('Opel','Zafira',2005,2019,'monospace',[E('1.8 140',140,'essence','A18XEL',2005,2014),E('1.4 Turbo 140',140,'essence','A14NET',2011,2019),E('1.6 SIDI Turbo 170',170,'essence','B16SHT',2013,2019),E('1.7 CDTI 110',110,'diesel','A17DTC',2005,2014),E('2.0 CDTI 130',130,'diesel','A20DT',2005,2014),E('1.6 CDTI 136',136,'diesel','B16DTH',2014,2019)]);
M('Opel','Meriva',2003,2017,'monospace',[E('1.4 Turbo 120',120,'essence','A14NET',2010,2017),E('1.6 Turbo 180',180,'essence','A16LET',2005,2010),E('1.7 CDTI 100',100,'diesel','A17DTJ',2003,2010),E('1.6 CDTI 110',110,'diesel','B16DTH',2014,2017)]);
M('Opel','Adam',2013,2019,'citadine',[E('1.2 70',70,'essence','A12XEL',2013,2019),E('1.4 87',87,'essence','A14XEL',2013,2019),E('1.0 Turbo 115',115,'essence','B10XFL',2014,2019),E('1.4 Turbo 150 S',150,'essence','B14NEJ',2015,2019)]);
M('Opel','Karl',2015,2019,'citadine',[E('1.0 75',75,'essence','B10XE',2015,2019)]);
M('Opel','Crossland X',2017,2024,'SUV',[E('1.2 PureTech 110',110,'essence','EB2ADTS',2017,2023),E('1.2 PureTech 130',130,'essence','EB2ADTS',2018,2023),E('1.5 Diesel 110',110,'diesel','DV5R',2017,2023),E('1.5 Diesel 120',120,'diesel','DV5R',2018,2023),E('1.6 Diesel 120',120,'diesel','B16DTH',2017,2020)]);
M('Opel','Combo D',2012,2018,'ludospace',[E('1.4 95',95,'essence','FIRE',2012,2018),E('1.6 CDTI 105',105,'diesel','MJET',2012,2018),E('2.0 CDTI 135',135,'diesel','MJET2',2012,2018)]);
/* ══════════ DS ══════════ */
M('DS','DS5',2015,2018,'berline',[E('1.6 THP 165',165,'essence','EP6FDT',2015,2018),E('1.6 BlueHDi 120',120,'diesel','DV6',2015,2018),E('2.0 BlueHDi 180',180,'diesel','DW10FC',2015,2018)]);
M('DS','DS7 Crossback',2018,2023,'SUV',[E('1.2 PureTech 130',130,'essence','EB2ADTS',2018,2023),E('1.6 PureTech 180',180,'essence','EP6FADTX',2018,2023),E('1.6 PureTech 225',225,'essence','EP6FADTX',2018,2023),E('1.5 BlueHDi 130',130,'diesel','DV5RUC',2018,2023),E('2.0 BlueHDi 180',180,'diesel','DW10FC',2018,2023),E('E-Tense 225',225,'hybride','EP6FADTXH',2019,2023),E('E-Tense 300',300,'hybride','EP6FADTXH',2019,2023),E('E-Tense 360',360,'hybride','EP6FADTXH',2021,2023)]);
if(C.LOCK){
 ['A12XEL','A14XEL','A14NET','A16LER','A16LET','A16XHT','A17DTS','A17DTC','A17DTJ','A18XEL','A20NFT','A20NHT','A28NET','A20DT','A20DTH','A20DTR',
  'B10XE','B10XFL','B14XEL','B14NET','B14XFT','B14NEJ','B15XFT','B16LES','B16SHT','B16DTH','B16DTE','B16DTR','B13DTE','B20NFT','B20DTH','B20DTR']
  .forEach(function(k){C.LOCK[k]=['Opel','Vauxhall','Chevrolet','Saab']});
 ['EA111','EA113','EA188','EA839','EA898','VR6','V8','W12','V10TDI','V8TDI','R5TDI','EA189CFCA']
  .forEach(function(k){C.LOCK[k]=['Volkswagen','Audi','SEAT','Skoda','Porsche','Bentley']});
 ['TU1','TU3','TU5','ET3','EP3','EW7','EW10','EW12','ES9','DT17','DT20','DW12','EP6CDT','EP6CDTX','EP6CDTR','DW10H']
  .forEach(function(k){C.LOCK[k]=['Peugeot','Citroën','DS','Opel','Vauxhall','MINI','Fiat','Lancia']});
 ['V4Y','L7X','P9X','S9W','G9T','G9U'].forEach(function(k){C.LOCK[k]=['Renault','Nissan','Opel','Vauxhall']})}
try{C.purge()}catch(e){}
APPLIED=true;window.KFMegaCatalog={ok:true,makes:Object.keys(CAT).length};return true}
function boot(){if(apply())return;var n=0,t=setInterval(function(){n++;if(apply()||n>60)clearInterval(t)},150)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
