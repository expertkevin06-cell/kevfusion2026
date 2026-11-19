/* KEV FUSION 2026 — megabase3_catalog.js v1.0.0
   Compléments catalogue : modèles & motorisations RÉELLES encore absents, toutes marques.
   Merge non destructif (n'écrase jamais une motorisation réelle existante). */
'use strict';
(function(){
var DONE=false;
function E(l,ch,f,code,y0,y1){return{l:l,ch:ch,kw:Math.round(ch*0.7355),f:f,code:code,y:[y0,y1]}}
function apply(){
 if(DONE||!window.KFCatalog)return false;
 var C=window.KFCatalog,CAT=C.CAT,OWN=C.OWNER;
 function M(k,m,y0,y1,b,eng){
  CAT[k]=CAT[k]||{};var p=CAT[k][m];
  if(p&&p.eng&&p.eng.length){eng.forEach(function(e){if(!p.eng.some(function(x){return x.l===e.l&&x.ch===e.ch}))p.eng.push(e)});
   p.y=[Math.min(p.y[0],y0),Math.max(p.y[1],y1)];if(b&&!p.body)p.body=b}
  else CAT[k][m]={y:[y0,y1],body:b||'',eng:eng.slice()};
  var n=C.norm(m);OWN[n]=OWN[n]||[];if(OWN[n].indexOf(k)<0)OWN[n].push(k)}
/* ── PSA / STELLANTIS ── */
M('Peugeot','301',2012,2021,'berline',[E('1.2 VTi 72',72,'essence','EB2',2012,2021),E('1.6 VTi 115',115,'essence','EC5',2012,2021),E('1.6 HDi 92',92,'diesel','DV6',2012,2021),E('1.6 BlueHDi 100',100,'diesel','DV6',2015,2021)]);
M('Peugeot','508 SW',2011,2027,'break',[E('1.6 THP 156',156,'essence','EP6DT',2011,2018),E('1.6 PureTech 180',180,'essence','EP6FADTX',2018,2023),E('2.0 BlueHDi 160',160,'diesel','DW10FC',2011,2020),E('1.6 Hybrid 225',225,'hybride','EP6FADTXH',2019,2023)]);
M('Peugeot','Boxer II',1994,2006,'fourgon',[E('2.5 D 86',86,'diesel','DJ5',1994,2002),E('2.8 HDi 128',128,'diesel','SOFIM',2002,2006),E('2.0 HDi 84',84,'diesel','DW10',2002,2006)]);
M('Citroën','C1 II',2014,2021,'citadine',[E('1.0 VTi 69',69,'essence','KR',2014,2021),E('1.2 PureTech 82',82,'essence','EB2',2014,2021)]);
M('Citroën','C-Elysée',2012,2021,'berline',[E('1.2 VTi 72',72,'essence','EB2',2012,2021),E('1.6 VTi 115',115,'essence','EC5',2012,2021),E('1.6 HDi 92',92,'diesel','DV6',2012,2021)]);
M('Citroën','C4 Aircross',2012,2017,'SUV',[E('1.6i 114',114,'essence','4A92',2012,2017),E('1.6 HDi 114',114,'diesel','DV6',2012,2017),E('1.8 HDi 150',150,'diesel','4N14',2012,2017)]);
M('Citroën','C-Zero',2011,2020,'citadine',[E('EV 67',67,'electrique','EV',2011,2020)]);
M('Citroën','Berlingo II',2008,2018,'ludospace',[E('1.6 HDi 75',75,'diesel','DV6',2008,2015),E('1.6 HDi 90',90,'diesel','DV6',2008,2015),E('1.6 BlueHDi 100',100,'diesel','DV6',2015,2018),E('1.6 VTi 95',95,'essence','EP6',2008,2015)]);
M('Opel','Antara',2006,2015,'SUV',[E('2.4 140',140,'essence','Z24SED',2006,2015),E('3.2 V6 227',227,'essence','Z32SE',2006,2015),E('2.0 CDTI 150',150,'diesel','Z20DMH',2006,2015),E('2.2 CDTI 163',163,'diesel','A22DM',2011,2015)]);
M('Opel','Vectra',2002,2008,'berline',[E('1.8 122',122,'essence','Z18XE',2002,2008),E('2.2 Direct 155',155,'essence','Z22YH',2002,2008),E('3.2 V6 211',211,'essence','Z32SE',2002,2008),E('1.9 CDTI 120',120,'diesel','Z19DT',2004,2008),E('3.0 V6 CDTI 184',184,'diesel','Z30DT',2003,2008)]);
M('Opel','Tigra',2004,2009,'cabriolet',[E('1.4 90',90,'essence','Z14XEP',2004,2009),E('1.8 125',125,'essence','Z18XE',2004,2009),E('1.3 CDTI 70',70,'diesel','MJET',2004,2009)]);
M('Opel','Cascada',2013,2019,'cabriolet',[E('1.4 Turbo 140',140,'essence','A14NET',2013,2019),E('1.6 SIDI 170',170,'essence','A16XHT',2013,2019),E('2.0 CDTI 165',165,'diesel','A20DTH',2013,2019)]);
M('Opel','Movano A',1998,2010,'fourgon',[E('2.5 D 80',80,'diesel','S8U',1998,2010),E('2.5 DTI 114',114,'diesel','G9U',2001,2010),E('2.8 DTI 114',114,'diesel','S9W',1998,2002)]);
M('DS','DS9',2021,2027,'berline',[E('1.6 PureTech 225',225,'essence','EP6FADTX',2021,2027),E('1.6 E-Tense 225',225,'hybride','EP6FADTXH',2021,2027),E('1.6 E-Tense 4x4 360',360,'hybride','EP6FADTXH',2021,2027)]);
M('Fiat','Bravo',2007,2014,'berline',[E('1.4 T-Jet 120',120,'essence','FIRE',2007,2014),E('1.4 MultiAir 140',140,'essence','FIRE',2009,2014),E('1.6 MultiJet 105',105,'diesel','MJET',2007,2014),E('2.0 MultiJet 165',165,'diesel','MJET2',2008,2014)]);
M('Fiat','Stilo',2001,2007,'berline',[E('1.6 16v 103',103,'essence','FIRE',2001,2007),E('1.8 16v 133',133,'essence','FIRE',2001,2007),E('2.4 20v 170',170,'essence','FIVE',2001,2007),E('1.9 JTD 115',115,'diesel','JTD',2001,2007)]);
M('Fiat','Croma',2005,2010,'break',[E('2.2 16v 147',147,'essence','FIRE',2005,2010),E('1.9 MultiJet 150',150,'diesel','JTD',2005,2010),E('2.4 MultiJet 200',200,'diesel','JTD5',2005,2010)]);
M('Fiat','Sedici',2006,2014,'SUV',[E('1.6 16v 120',120,'essence','M16',2006,2014),E('1.9 MultiJet 120',120,'diesel','D19',2006,2014),E('2.0 MultiJet 135',135,'diesel','D20',2009,2014)]);
M('Fiat','Freemont',2011,2016,'SUV',[E('2.0 MultiJet 140',140,'diesel','VM',2011,2016),E('2.0 MultiJet 170',170,'diesel','VM',2011,2016),E('3.6 V6 280',280,'essence','PENTASTAR',2011,2016)]);
M('Fiat','Qubo / Fiorino',2008,2021,'ludospace',[E('1.4 73',73,'essence','FIRE',2008,2021),E('1.3 MultiJet 75',75,'diesel','MJET',2008,2021),E('1.3 MultiJet 95',95,'diesel','MJET',2015,2021)]);
M('Fiat','Fullback',2016,2020,'pick-up',[E('2.4 DI-D 154',154,'diesel','4N15',2016,2020),E('2.4 DI-D 181',181,'diesel','4N15',2016,2020)]);
M('Alfa Romeo','Giulietta',2010,2020,'berline',[E('1.4 TB 120',120,'essence','FIRE',2010,2020),E('1.4 TB MultiAir 170',170,'essence','FIRE',2010,2020),E('1.75 TBi QV 240',240,'essence','TBi',2013,2020),E('1.6 JTDM 120',120,'diesel','MJET',2010,2020),E('2.0 JTDM 175',175,'diesel','MJET',2010,2020)]);
M('Alfa Romeo','159',2005,2011,'berline',[E('1.9 JTS 160',160,'essence','JTS',2005,2011),E('2.2 JTS 185',185,'essence','JTS',2005,2011),E('3.2 V6 JTS Q4 260',260,'essence','JTSV6',2005,2011),E('1.9 JTDM 150',150,'diesel','JTD',2005,2011),E('2.4 JTDM 200',200,'diesel','JTD5',2005,2011)]);
M('Alfa Romeo','Brera / Spider',2006,2010,'coupé',[E('2.2 JTS 185',185,'essence','JTS',2006,2010),E('3.2 V6 JTS 260',260,'essence','JTSV6',2006,2010),E('2.0 JTDM 170',170,'diesel','JTD',2006,2010)]);
M('Alfa Romeo','GT',2003,2010,'coupé',[E('1.8 TS 140',140,'essence','TS',2003,2010),E('2.0 JTS 165',165,'essence','JTS',2003,2010),E('3.2 V6 240',240,'essence','BUSso',2003,2010),E('1.9 JTDM 150',150,'diesel','JTD',2003,2010)]);
M('Lancia','Musa',2004,2012,'monospace',[E('1.4 16v 95',95,'essence','FIRE',2004,2012),E('1.3 MultiJet 70',70,'diesel','MJET',2004,2012),E('1.9 MultiJet 120',120,'diesel','JTD',2004,2012)]);
M('Lancia','Phedra',2002,2010,'monospace',[E('2.0 16v 136',136,'essence','EW10',2002,2010),E('2.0 JTD 110',110,'diesel','DW10',2002,2010),E('2.2 JTD 128',128,'diesel','DW12',2002,2010)]);
M('Jeep','Commander',2006,2010,'SUV',[E('3.7 V6 210',210,'essence','SOHC',2006,2010),E('4.7 V8 231',231,'essence','POWERTECH',2006,2010),E('5.7 Hemi 326',326,'essence','HEMI',2006,2010),E('3.0 CRD 218',218,'diesel','OM642',2006,2010)]);
M('Jeep','Patriot',2007,2017,'SUV',[E('2.0 158',158,'essence','WORLD',2007,2017),E('2.4 170',170,'essence','TIGERSHARK',2007,2017),E('2.0 CRD 140',140,'diesel','VM',2007,2011)]);
/* ── ALLEMAND ── */
M('Mercedes-Benz','Classe V / Viano',2003,2027,'monospace',[E('V220d 163',163,'diesel','OM651',2010,2019),E('V250d 190',190,'diesel','OM651',2014,2019),E('V300d 239',239,'diesel','OM654',2019,2027),E('V200d 136',136,'diesel','OM622',2019,2027),E('EQV 300 204',204,'electrique','EV',2020,2027)]);
M('Mercedes-Benz','Classe T / Citan',2012,2027,'ludospace',[E('180d 116',116,'diesel','OM608',2012,2021),E('1.3 131',131,'essence','M282',2021,2027),E('EQT 200 122',122,'electrique','EV',2023,2027)]);
M('Mercedes-Benz','AMG GT',2014,2027,'sportive',[E('4.0 V8 GT 462',462,'essence','M178',2014,2023),E('4.0 V8 GTS 522',522,'essence','M178',2017,2023),E('4.0 V8 R 585',585,'essence','M178',2017,2023),E('2.0 43 421',421,'essence','M139',2023,2027),E('4.0 V8 63 S E 843',843,'hybride','M177H',2023,2027)]);
M('Mercedes-Benz','SL / SLC',2012,2027,'roadster',[E('SL400 333',333,'essence','M276',2014,2020),E('SL500 455',455,'essence','M278',2012,2020),E('SLC300 245',245,'essence','M274',2016,2020),E('AMG SL63 585',585,'essence','M177',2022,2027)]);
M('BMW','Série 6 / Série 8',2011,2027,'coupé',[E('640i 320',320,'essence','N55',2011,2018),E('650i 450',450,'essence','N63',2011,2018),E('840i 340',340,'essence','B58',2018,2027),E('M850i 530',530,'essence','N63',2018,2027),E('M8 625',625,'essence','S63',2019,2027)]);
M('BMW','X2 / X4 / X6',2014,2027,'SUV coupé',[E('sDrive18i 136',136,'essence','B38',2018,2023),E('xDrive20i 178',178,'essence','B48',2018,2027),E('M35i 306',306,'essence','B48',2019,2027),E('xDrive20d 190',190,'diesel','B47',2014,2027),E('M40d 340',340,'diesel','B57',2019,2027)]);
M('BMW','Z4',2009,2027,'roadster',[E('sDrive20i 184',184,'essence','B48',2018,2027),E('sDrive30i 258',258,'essence','B48',2018,2023),E('M40i 340',340,'essence','B58',2018,2027),E('sDrive23i 204',204,'essence','N52',2009,2011)]);
M('BMW','M2 / M3 / M4 / M5',2014,2027,'sportive',[E('M2 370',370,'essence','N55',2016,2018),E('M2 Competition 410',410,'essence','S55',2018,2021),E('M2 G87 460',460,'essence','S58',2023,2027),E('M3/M4 510',510,'essence','S58',2021,2027),E('M5 F90 600',600,'essence','S63',2018,2023),E('M5 G90 727',727,'hybride','S68H',2024,2027)]);
M('BMW','i8',2014,2020,'sportive',[E('1.5 PHEV 362',362,'hybride','B38PHEV',2014,2020)]);
M('Audi','A7 / A8',2010,2027,'berline',[E('40 TDI 204',204,'diesel','EA288EVO',2018,2027),E('50 TDI 286',286,'diesel','EA897',2010,2027),E('55 TFSI 340',340,'essence','EA839',2010,2027),E('60 TFSI e 462',462,'hybride','EA839H',2019,2027),E('S8 571',571,'essence','EA825',2019,2027)]);
M('Audi','R8',2007,2023,'supercar',[E('4.2 V8 430',430,'essence','BNS',2007,2015),E('5.2 V10 540',540,'essence','BUJ',2009,2015),E('5.2 V10 620',620,'essence','DKA',2015,2023)]);
M('Audi','RS3 / RS4 / RS6 / RS7',2011,2027,'sportive',[E('2.5 TFSI RS3 400',400,'essence','EA855',2011,2027),E('2.9 TFSI RS4/RS5 450',450,'essence','EA839',2017,2027),E('4.0 TFSI RS6/RS7 600',600,'essence','EA825',2013,2027)]);
M('Volkswagen','ID.2 / ID.Every1',2025,2027,'citadine',[E('ID.2 226',226,'electrique','MEB',2025,2027),E('ID.Every1 95',95,'electrique','MEB',2026,2027)]);
M('Volkswagen','Multivan / Caravelle',2015,2027,'combi',[E('2.0 TDI 150',150,'diesel','EA288',2015,2027),E('2.0 TDI 204',204,'diesel','EA288',2019,2027),E('1.4 eHybrid 218',218,'hybride','EA211H',2021,2027),E('2.0 TSI 204',204,'essence','EA888',2015,2023)]);
M('Volkswagen','Crafter',2006,2027,'fourgon',[E('2.5 TDI 109',109,'diesel','R5TDI',2006,2011),E('2.0 TDI 109',109,'diesel','EA288',2011,2016),E('2.0 TDI 140',140,'diesel','EA288',2016,2027),E('2.0 TDI 177',177,'diesel','EA288',2016,2027),E('e-Crafter 136',136,'electrique','EV',2018,2027)]);
M('Porsche','918 Spyder',2013,2015,'hypercar',[E('4.6 V8 PHEV 887',887,'hybride','M96H',2013,2015)]);
M('Porsche','Carrera GT',2003,2006,'hypercar',[E('5.7 V10 612',612,'essence','M80',2003,2006)]);
M('Porsche','911 (996/997)',1997,2012,'sportive',[E('3.4 Carrera 300',300,'essence','M96',1997,2004),E('3.6 Carrera 320',320,'essence','M96',2001,2008),E('3.6 Turbo 420',420,'essence','M96T',2000,2005),E('3.8 Carrera S 355',355,'essence','M97',2004,2012),E('3.6 GT3 415',415,'essence','M97',2006,2011)]);
M('Skoda','Yeti / Roomster',2005,2017,'SUV',[E('1.2 TSI 105',105,'essence','EA111',2009,2015),E('1.4 TSI 122',122,'essence','EA111',2010,2015),E('1.6 TDI 105',105,'diesel','EA189',2009,2015),E('2.0 TDI 140',140,'diesel','EA189',2005,2015)]);
M('SEAT','Altea / Exeo',2004,2013,'monospace',[E('1.6 MPI 102',102,'essence','EA113',2004,2013),E('1.4 TSI 125',125,'essence','EA111',2007,2013),E('2.0 TFSI 200',200,'essence','EA888',2006,2013),E('2.0 TDI 140',140,'diesel','EA189',2004,2013)]);
/* ── JAPONAIS / CORÉEN ── */
M('Toyota','Aygo / Verso / Urban Cruiser',2005,2021,'citadine',[E('1.0 VVT-i 68',68,'essence','KR',2005,2021),E('1.33 VVT-i 99',99,'essence','NR',2009,2018),E('1.4 D-4D 90',90,'diesel','ND',2005,2015),E('1.8 VVT-i 147',147,'essence','ZZ',2009,2018)]);
M('Toyota','GT86 / Supra',2012,2027,'sportive',[E('2.0 Boxer 200',200,'essence','FA20',2012,2021),E('2.0 Turbo Supra 258',258,'essence','B48',2019,2023),E('3.0 Turbo Supra 340',340,'essence','B58',2019,2027)]);
M('Toyota','Mirai',2015,2027,'berline',[E('Hydrogène 154',154,'electrique','FCEV',2015,2021),E('Hydrogène 182',182,'electrique','FCEV',2021,2027)]);
M('Toyota','Proace Verso / City Verso',2016,2027,'combi',[E('1.5 D-4D 100',100,'diesel','DV5R',2019,2027),E('2.0 D-4D 145',145,'diesel','DW10F',2016,2027),E('Electric 136',136,'electrique','EV',2021,2027)]);
M('Lexus','GS / LS / RC / LC',2011,2027,'berline',[E('GS450h 345',345,'hybride','2GRH',2011,2018),E('LS500h 359',359,'hybride','8GRH',2017,2027),E('RC F 477',477,'essence','2UR',2014,2023),E('LC500 477',477,'essence','2UR',2016,2027),E('LC500h 359',359,'hybride','8GRH',2016,2027)]);
M('Honda','Accord / Insight / CR-Z',2008,2023,'berline',[E('2.0 i-VTEC 156',156,'essence','R20',2008,2015),E('2.4 i-VTEC 201',201,'essence','K24',2008,2015),E('2.2 i-DTEC 150',150,'diesel','N22',2008,2015),E('1.3 IMA Hybrid 115',115,'hybride','IMA',2009,2014),E('1.5 IMA CR-Z 124',124,'hybride','IMA',2010,2015)]);
M('Honda','NSX',2016,2022,'supercar',[E('3.5 V6 Hybrid 581',581,'hybride','JNCH',2016,2022)]);
M('Nissan','Note / Pulsar / NV200',2006,2027,'citadine',[E('1.2 80',80,'essence','HR12',2013,2022),E('1.2 DIG-S 98',98,'essence','HR12DDR',2013,2018),E('1.5 dCi 90',90,'diesel','K9K',2006,2018),E('e-NV200 109',109,'electrique','EV',2014,2021),E('Townstar EV 122',122,'electrique','EV',2022,2027)]);
M('Nissan','370Z / Pathfinder / Patrol',2009,2027,'sportive',[E('3.7 V6 328',328,'essence','VQ37',2009,2020),E('3.5 V6 284',284,'essence','VQ35',2013,2023),E('5.6 V8 400',400,'essence','VK56',2010,2027)]);
M('Mazda','CX-7 / CX-9 / RX-8',2006,2023,'SUV',[E('2.3 DISI Turbo 260',260,'essence','L3VDT',2006,2012),E('2.2 MZR-CD 163',163,'diesel','R2',2006,2012),E('3.7 V6 303',303,'essence','CY',2016,2023),E('1.3 Renesis RX-8 231',231,'essence','13B',2003,2012)]);
M('Mazda','BT-50',2011,2027,'pick-up',[E('2.2 MZR-CD 150',150,'diesel','R2',2011,2020),E('3.2 Duratorq 200',200,'diesel','P5AT',2011,2020),E('1.9 DDiS 150',150,'diesel','RZ4E',2020,2027),E('3.0 DDiS 190',190,'diesel','4JJ3',2020,2027)]);
M('Suzuki','Baleno / Celerio / Alto',2015,2027,'citadine',[E('1.0 Boosterjet 111',111,'essence','K10',2016,2022),E('1.2 Dualjet 90',90,'essence','K12',2015,2023),E('1.2 Hybrid 90',90,'hybride','K12',2020,2027),E('1.0 68',68,'essence','K10',2015,2021)]);
M('Suzuki','Grand Vitara / Kizashi',2005,2015,'SUV',[E('1.6 106',106,'essence','M16',2005,2015),E('2.0 140',140,'essence','J20',2005,2015),E('2.4 169',169,'essence','J24',2008,2015),E('1.9 DDiS 129',129,'diesel','D19',2005,2013)]);
M('Mitsubishi','Colt / Lancer / Pajero',2004,2021,'berline',[E('1.3 95',95,'essence','4A90',2004,2013),E('1.5 109',109,'essence','4A91',2004,2013),E('1.6 117',117,'essence','4A92',2010,2018),E('2.0 DI-D 140',140,'diesel','4N14',2004,2012),E('3.2 DI-D 190',190,'diesel','4M41',2006,2021),E('2.0 Turbo Evo 295',295,'essence','4B11T',2007,2016)]);
M('Mitsubishi','i-MiEV',2010,2020,'citadine',[E('EV 67',67,'electrique','EV',2010,2020)]);
M('Subaru','Legacy / Levorg / Tribeca',2009,2027,'break',[E('2.0i 150',150,'essence','FB20',2009,2021),E('1.6 GT 170',170,'essence','FB16T',2015,2020),E('2.0 GT 268',268,'essence','FA20',2013,2020),E('1.8 GT 177',177,'essence','CB18',2021,2027),E('3.6 R 258',258,'essence','EZ36',2009,2014)]);
M('Infiniti','Q70 / QX80 / FX',2010,2023,'berline',[E('3.7 V6 320',320,'essence','VQ37',2010,2019),E('3.5 Hybrid 364',364,'hybride','VQ35H',2012,2019),E('5.6 V8 400',400,'essence','VK56',2010,2023),E('3.0d V6 238',238,'diesel','V9X',2010,2017)]);
M('Hyundai','i40 / ix35 / Veloster',2011,2021,'berline',[E('1.6 GDi 135',135,'essence','GAMMA',2011,2019),E('2.0 GDi 177',177,'essence','NU',2011,2019),E('1.7 CRDi 115',115,'diesel','U2',2011,2019),E('1.6 T-GDi Veloster 204',204,'essence','GAMMA',2018,2021)]);
M('Hyundai','Nexo / Inster / Casper',2018,2027,'SUV',[E('Hydrogène 163',163,'electrique','FCEV',2018,2027),E('Inster EV 115',115,'electrique','EV',2024,2027),E('Casper 1.0 76',76,'essence','KAPPA',2021,2027)]);
M('Kia','Stinger / EV5 / EV2',2017,2027,'berline',[E('3.3 T-GDi V6 370',370,'essence','LAMBDA',2017,2023),E('2.2 CRDi 200',200,'diesel','D4HC',2017,2023),E('EV5 218',218,'electrique','EGMP',2024,2027),E('EV2 145',145,'electrique','EGMP',2026,2027)]);
M('Genesis','G70 / G80 / GV80',2017,2027,'berline',[E('2.0 T-GDi 245',245,'essence','THETA',2017,2027),E('3.3 T-GDi V6 370',370,'essence','LAMBDA',2017,2027),E('2.2 CRDi 210',210,'diesel','D4HC',2017,2023),E('Electrified G80 370',370,'electrique','EGMP',2021,2027),E('GV80 2.5T 304',304,'essence','SMARTSTREAM',2020,2027)]);
/* ── CHINOIS / VE ── */
M('BYD','Atto 2 / Seagull / Dolphin Surf',2023,2027,'citadine',[E('Blade 156',156,'electrique','EV',2023,2027),E('Seagull 102',102,'electrique','EV',2023,2027)]);
M('MG','MG3 II / MG5 II / IM5',2024,2027,'berline',[E('Hybrid+ 194',194,'hybride','15S4C',2024,2027),E('EV 156',156,'electrique','EV',2024,2027),E('IM5 408',408,'electrique','EV',2025,2027)]);
M('XPeng','X9 / G7',2024,2027,'monospace',[E('X9 FWD 320',320,'electrique','EV',2024,2027),E('G7 296',296,'electrique','EV',2025,2027)]);
M('NIO','ET7 / EL7 / ES6',2021,2027,'berline',[E('ET7 653',653,'electrique','EV',2021,2027),E('EL7 653',653,'electrique','EV',2022,2027),E('ES6 490',490,'electrique','EV',2023,2027)]);
M('Zeekr','7X / 009 / X',2023,2027,'SUV',[E('7X RWD 421',421,'electrique','EV',2024,2027),E('009 AWD 544',544,'electrique','EV',2023,2027)]);
M('Chery','Tiggo 2 / Arrizo 5',2019,2027,'SUV',[E('1.5 116',116,'essence','SQRE4G15',2019,2027),E('1.0T 116',116,'essence','SQRE3T10',2019,2027)]);
M('Omoda','E5 / C5 EV',2024,2027,'SUV',[E('E5 204',204,'electrique','EV',2024,2027)]);
M('Geely','EX5 / Starray',2023,2027,'SUV',[E('EX5 218',218,'electrique','EV',2023,2027),E('Starray 1.5T 174',174,'essence','JLH3G15',2023,2027)]);
M('Leapmotor','C16 / B05',2025,2027,'SUV',[E('C16 EV 292',292,'electrique','EV',2025,2027),E('C16 REEV 218',218,'hybride','REEV',2025,2027)]);
M('VinFast','VF5 / VF e34',2022,2027,'SUV',[E('VF5 134',134,'electrique','EV',2022,2027),E('VF e34 147',147,'electrique','EV',2022,2027)]);
M('Polestar','1',2019,2021,'GT',[E('2.0 PHEV 609',609,'hybride','VEAH',2019,2021)]);
/* ── UTILITAIRES / US ── */
M('Ford','Transit Connect / Tourneo',2013,2027,'ludospace',[E('1.0 EcoBoost 100',100,'essence','ECOBOOST10',2013,2023),E('1.5 TDCi 75',75,'diesel','DURATORQ',2013,2018),E('1.5 EcoBlue 100',100,'diesel','ECOBLUE',2018,2027),E('1.5 EcoBlue 120',120,'diesel','ECOBLUE',2018,2027),E('2.5 PHEV 232',232,'hybride','DURATEC',2023,2027)]);
M('Ford','S-Max / Galaxy',2006,2023,'monospace',[E('1.5 EcoBoost 160',160,'essence','ECOBOOST15',2015,2023),E('2.0 EcoBoost 240',240,'essence','ECOBOOST',2010,2019),E('2.0 TDCi 150',150,'diesel','DURATORQ',2006,2023),E('2.0 EcoBlue 190',190,'diesel','ECOBLUE',2018,2023),E('2.5 FHEV 190',190,'hybride','DURATEC',2019,2023)]);
M('Ford','Bronco / Maverick',2021,2027,'SUV',[E('2.3 EcoBoost 275',275,'essence','ECOBOOST',2021,2027),E('2.7 EcoBoost 315',315,'essence','ECOBOOST27',2021,2027),E('2.0 Hybrid Maverick 191',191,'hybride','DURATEC',2022,2027)]);
M('Jeep','Grand Wagoneer',2022,2027,'SUV luxe',[E('6.4 V8 471',471,'essence','HEMI',2022,2027),E('3.0 Hurricane 510',510,'essence','HURRICANE',2023,2027)]);
M('RAM','1500 / 2500',2019,2027,'pick-up',[E('3.6 V6 eTorque 305',305,'hybride','PENTASTAR',2019,2027),E('5.7 V8 eTorque 395',395,'hybride','HEMI',2019,2024),E('3.0 Hurricane 420',420,'essence','HURRICANE',2024,2027),E('6.7 Cummins 370',370,'diesel','CUMMINS',2019,2027)]);
M('Chevrolet','Silverado / Tahoe',2019,2027,'pick-up',[E('5.3 V8 355',355,'essence','L84',2019,2027),E('6.2 V8 420',420,'essence','L87',2019,2027),E('3.0 Duramax 305',305,'diesel','LZ0',2020,2027)]);
M('Chevrolet','Bolt EV / Bolt EUV',2017,2023,'citadine',[E('EV 204',204,'electrique','EV',2017,2023)]);
M('GMC','Sierra / Hummer EV',2019,2027,'pick-up',[E('6.2 V8 420',420,'essence','L87',2019,2027),E('Hummer EV 1000',1000,'electrique','EV',2022,2027)]);
M('Cadillac','Lyriq / Escalade',2022,2027,'SUV',[E('Lyriq 340',340,'electrique','EV',2022,2027),E('6.2 V8 420',420,'essence','L87',2022,2027)]);
M('Volvo','V90 / S90 / EX40',2016,2027,'break',[E('B4 197',197,'hybride','VEA',2020,2027),E('B5 250',250,'hybride','VEA',2016,2027),E('B6 300',300,'hybride','VEA',2016,2023),E('D4 190',190,'diesel','VEA',2016,2020),E('T8 455',455,'hybride','VEAH',2022,2027),E('EX40 238',238,'electrique','EV',2024,2027)]);
M('Land Rover','Freelander / Discovery 3-4',2006,2016,'SUV',[E('2.2 TD4 150',150,'diesel','DURATORQ',2006,2014),E('2.2 SD4 190',190,'diesel','DURATORQ',2010,2014),E('2.7 TDV6 190',190,'diesel','AJV6D',2006,2009),E('3.0 TDV6 245',245,'diesel','AJV6D',2009,2016),E('5.0 V8 375',375,'essence','AJ133',2009,2016)]);
M('Jaguar','XJ / XK',2009,2019,'berline luxe',[E('3.0 V6 D 275',275,'diesel','AJV6D',2009,2019),E('5.0 V8 385',385,'essence','AJ133',2009,2019),E('5.0 V8 SC 510',510,'essence','AJ133',2009,2019),E('2.0 Turbo 240',240,'essence','AJ200P',2012,2019)]);
M('Aston Martin','Rapide / Vanquish',2010,2023,'GT',[E('6.0 V12 477',477,'essence','AMV12',2010,2018),E('6.0 V12 Vanquish 573',573,'essence','AMV12',2012,2018),E('5.2 V12 DBS 725',725,'essence','AMV12',2018,2023)]);
M('Lamborghini','Gallardo',2003,2013,'supercar',[E('5.0 V10 500',500,'essence','V10L',2003,2008),E('5.2 V10 LP560-4 560',560,'essence','V10L',2008,2013)]);
M('Bugatti','Mistral / Bolide',2022,2027,'hypercar',[E('8.0 W16 Mistral 1600',1600,'essence','W16',2022,2027),E('8.0 W16 Bolide 1850',1850,'essence','W16',2024,2027)]);
/* verrous */
if(C.LOCK){
 var lk={OM642:['Mercedes-Benz','Jeep','SsangYong'],OM622:['Mercedes-Benz'],M276:['Mercedes-Benz','Infiniti'],M278:['Mercedes-Benz'],
  M178:['Mercedes-Benz','Aston Martin'],M96:['Porsche'],M97:['Porsche'],M96T:['Porsche'],M96H:['Porsche'],M80:['Porsche'],
  N52:['BMW'],N55:['BMW','MINI'],S55:['BMW'],S58:['BMW'],S63:['BMW'],S68H:['BMW'],B38PHEV:['BMW'],
  BNS:['Audi'],BUJ:['Audi'],DKA:['Audi'],EA825:['Audi','Porsche','Bentley','Lamborghini'],
  '2GRH':['Lexus','Toyota'],'8GRH':['Lexus'],'2UR':['Lexus'],'ZZ':['Toyota'],'NR':['Toyota'],'KR':['Toyota'],
  R20:['Honda'],K24:['Honda','Acura'],N22:['Honda'],IMA:['Honda'],JNCH:['Honda'],
  HR12:['Nissan','Renault','Dacia'],HR12DDR:['Nissan'],VQ37:['Nissan','Infiniti'],VK56:['Nissan','Infiniti'],
  L3VDT:['Mazda'],R2:['Mazda'],CY:['Mazda'],'13B':['Mazda'],P5AT:['Mazda','Ford'],RZ4E:['Isuzu','Mazda'],'4JJ3':['Isuzu','Mazda'],
  J20:['Suzuki'],J24:['Suzuki'],D20:['Suzuki'],'4A90':['Mitsubishi'],'4A91':['Mitsubishi'],'4M41':['Mitsubishi'],'4B11T':['Mitsubishi'],
  CB18:['Subaru'],EZ36:['Subaru'],NU:['Hyundai','Kia'],D4HC:['Hyundai','Kia','Genesis'],
  SQRE4G15:['Chery'],SQRE3T10:['Chery'],JTS:['Alfa Romeo'],JTSV6:['Alfa Romeo'],BUSso:['Alfa Romeo'],TS:['Alfa Romeo'],
  JTD:['Fiat','Alfa Romeo','Lancia','Opel'],JTD5:['Fiat','Alfa Romeo','Lancia'],FIVE:['Fiat'],
  EC5:['Peugeot','Citroën'],DJ5:['Peugeot'],SOFIM:['Peugeot','Citroën','Iveco'],S8U:['Opel','Renault'],
  Z24SED:['Opel','Chevrolet'],Z32SE:['Opel'],Z18XE:['Opel'],Z22YH:['Opel'],Z19DT:['Opel'],Z30DT:['Opel'],
  Z14XEP:['Opel'],Z20DMH:['Opel'],A22DM:['Opel'],
  SOHC:['Jeep','Chrysler','Dodge'],POWERTECH:['Jeep','Chrysler','Dodge'],WORLD:['Jeep','Chrysler','Dodge','Mitsubishi'],
  HURRICANE:['Jeep','RAM','Dodge'],CUMMINS:['RAM','Dodge'],L84:['Chevrolet','GMC','Cadillac'],L87:['Chevrolet','GMC','Cadillac'],
  LZ0:['Chevrolet','GMC'],FCEV:['Toyota','Hyundai','Honda'],MEB:['Volkswagen','Audi','Skoda','Cupra','SEAT','Ford'],
  EGMP:['Hyundai','Kia','Genesis'],REEV:['Leapmotor','BYD','Chery'],EV:['*']};
 Object.keys(lk).forEach(function(k){C.LOCK[k]=lk[k]})}
try{C.purge()}catch(e){}
DONE=true;window.KFMega3Catalog={ok:true,makes:Object.keys(CAT).length};return true}
function boot(){if(apply())return;var n=0,t=setInterval(function(){n++;if(apply()||n>90)clearInterval(t)},150)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
