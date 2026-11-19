/* KEV FUSION 2026 — megabase2_catalog.js v1.0.0
   Extension catalogue massive : création des marques manquantes + modèles/motorisations/puissances
   RÉELLES pour Renault, Fiat, Peugeot, Citroën, Opel, Jeep, Mercedes, BYD, Tesla, XPeng, Audi, Skoda,
   SEAT, Land Rover, Alpine, Bugatti, Volkswagen, BMW, Porsche, Alfa Romeo, Lancia, Lamborghini,
   Cupra, Volvo, Polestar, Aston Martin, Ford, Toyota, Honda, Nissan, MG, Geely, Zeekr, Leapmotor,
   Chery, Omoda, Jaecoo, Lynk & Co, Mazda, Lexus, Suzuki, Mitsubishi, Subaru, Infiniti, Hyundai, VinFast.
   Merge non destructif : n'écrase jamais une motorisation réelle déjà présente. */
'use strict';
(function(){
var DONE=false;
function E(l,ch,f,code,y0,y1){return{l:l,ch:ch,kw:Math.round(ch*0.7355),f:f,code:code,y:[y0,y1]}}
function apply(){
 if(DONE||!window.KFCatalog)return false;
 var C=window.KFCatalog,CAT=C.CAT,OWNER=C.OWNER;
 function M(k,m,y0,y1,b,engs){
  CAT[k]=CAT[k]||{};var p=CAT[k][m];
  if(p&&p.eng&&p.eng.length){engs.forEach(function(e){if(!p.eng.some(function(x){return x.l===e.l&&x.ch===e.ch}))p.eng.push(e)});
   p.y=[Math.min(p.y[0],y0),Math.max(p.y[1],y1)];if(b&&!p.body)p.body=b}
  else CAT[k][m]={y:[y0,y1],body:b||'',eng:engs.slice()};
  var n=C.norm(m);OWNER[n]=OWNER[n]||[];if(OWNER[n].indexOf(k)<0)OWNER[n].push(k)}
 function alias(a,b){var n=C.norm(a);OWNER[n]=OWNER[n]||[];if(OWNER[n].indexOf(b)<0)OWNER[n].push(b)}

/* ═══ EXOTIQUES / PREMIUM MANQUANTS ═══ */
M('Bugatti','Chiron',2016,2024,'hypercar',[E('8.0 W16 quad-turbo 1500',1500,'essence','W16',2016,2024),E('8.0 W16 Super Sport 1600',1600,'essence','W16',2021,2024),E('8.0 W16 Pur Sport 1500',1500,'essence','W16',2020,2022)]);
M('Bugatti','Veyron',2005,2015,'hypercar',[E('8.0 W16 1001',1001,'essence','W16',2005,2011),E('8.0 W16 Super Sport 1200',1200,'essence','W16',2010,2015)]);
M('Bugatti','Tourbillon',2026,2027,'hypercar',[E('8.3 V16 hybride 1800',1800,'hybride','V16H',2026,2027)]);
M('Bugatti','Divo',2019,2021,'hypercar',[E('8.0 W16 1500',1500,'essence','W16',2019,2021)]);
M('Lamborghini','Huracan',2014,2024,'supercar',[E('5.2 V10 610',610,'essence','V10L',2014,2020),E('5.2 V10 EVO 640',640,'essence','V10L',2019,2024),E('5.2 V10 STO 640',640,'essence','V10L',2021,2023),E('5.2 V10 Performante 640',640,'essence','V10L',2017,2019),E('5.2 V10 Tecnica 640',640,'essence','V10L',2022,2024)]);
M('Lamborghini','Aventador',2011,2022,'supercar',[E('6.5 V12 700',700,'essence','V12L',2011,2017),E('6.5 V12 S 740',740,'essence','V12L',2017,2022),E('6.5 V12 SVJ 770',770,'essence','V12L',2018,2022),E('6.5 V12 Ultimae 780',780,'essence','V12L',2021,2022)]);
M('Lamborghini','Urus',2018,2027,'SUV',[E('4.0 V8 biturbo 650',650,'essence','EA825',2018,2023),E('4.0 V8 S 666',666,'essence','EA825',2023,2027),E('4.0 V8 Performante 666',666,'essence','EA825',2022,2027),E('4.0 V8 SE hybride 800',800,'hybride','EA825H',2024,2027)]);
M('Lamborghini','Revuelto',2023,2027,'supercar',[E('6.5 V12 hybride 1015',1015,'hybride','V12LH',2023,2027)]);
M('Aston Martin','DB11',2016,2023,'GT',[E('5.2 V12 biturbo 608',608,'essence','AMV12',2016,2023),E('4.0 V8 AMG 510',510,'essence','M177',2018,2023)]);
M('Aston Martin','DB12',2023,2027,'GT',[E('4.0 V8 AMG 680',680,'essence','M177',2023,2027)]);
M('Aston Martin','Vantage',2018,2027,'sportive',[E('4.0 V8 AMG 510',510,'essence','M177',2018,2023),E('4.0 V8 AMG 665',665,'essence','M177',2024,2027)]);
M('Aston Martin','DBX',2020,2027,'SUV',[E('4.0 V8 AMG 550',550,'essence','M177',2020,2023),E('4.0 V8 707 707',707,'essence','M177',2022,2027)]);
M('Aston Martin','DBS',2018,2024,'GT',[E('5.2 V12 biturbo 725',725,'essence','AMV12',2018,2024)]);
M('Aston Martin','Valhalla',2025,2027,'hypercar',[E('4.0 V8 hybride 1079',1079,'hybride','M177H',2025,2027)]);
M('Infiniti','Q30',2016,2019,'berline',[E('1.6t 122',122,'essence','M270',2016,2019),E('2.0t 211',211,'essence','M274',2016,2019),E('1.5d 109',109,'diesel','K9K',2016,2019),E('2.2d 170',170,'diesel','OM651',2016,2019)]);
M('Infiniti','Q50',2013,2022,'berline',[E('2.0t 211',211,'essence','M274',2013,2022),E('3.0t V6 405',405,'essence','VR30',2016,2022),E('3.5 Hybrid 364',364,'hybride','VQ35H',2013,2018),E('2.2d 170',170,'diesel','OM651',2013,2019)]);
M('Infiniti','Q60',2016,2022,'coupé',[E('2.0t 211',211,'essence','M274',2016,2022),E('3.0t V6 405',405,'essence','VR30',2016,2022)]);
M('Infiniti','QX30',2016,2019,'SUV',[E('1.6t 122',122,'essence','M270',2016,2019),E('2.0t 211',211,'essence','M274',2016,2019),E('2.2d 170',170,'diesel','OM651',2016,2019)]);
M('Infiniti','QX50',2013,2024,'SUV',[E('2.0t VC-Turbo 268',268,'essence','KR20',2018,2024),E('3.7 V6 325',325,'essence','VQ37',2013,2018)]);
M('Infiniti','QX70',2008,2017,'SUV',[E('3.7 V6 325',325,'essence','VQ37',2008,2017),E('5.0 V8 390',390,'essence','VK50',2008,2013),E('3.0d V6 238',238,'diesel','V9X',2010,2017)]);
/* ═══ CHINOIS ═══ */
M('VinFast','VF6',2023,2027,'SUV',[E('Eco 177',177,'electrique','EV',2023,2027),E('Plus 204',204,'electrique','EV',2023,2027)]);
M('VinFast','VF7',2023,2027,'SUV',[E('Eco 177',177,'electrique','EV',2023,2027),E('Plus 354',354,'electrique','EV',2023,2027)]);
M('VinFast','VF8',2022,2027,'SUV',[E('Eco 354',354,'electrique','EV',2022,2027),E('Plus 408',408,'electrique','EV',2022,2027)]);
M('VinFast','VF9',2023,2027,'SUV',[E('Eco 408',408,'electrique','EV',2023,2027),E('Plus 408',408,'electrique','EV',2023,2027)]);
M('VinFast','VF3',2024,2027,'micro-SUV',[E('Electric 43',43,'electrique','EV',2024,2027)]);
M('XPeng','P7',2021,2027,'berline',[E('RWD 267',267,'electrique','EV',2021,2027),E('AWD Performance 473',473,'electrique','EV',2021,2023),E('P7i Wing 553',553,'electrique','EV',2023,2027)]);
M('XPeng','P5',2021,2025,'berline',[E('Electric 211',211,'electrique','EV',2021,2025)]);
M('XPeng','G9',2022,2027,'SUV',[E('RWD 313',313,'electrique','EV',2022,2027),E('AWD 551',551,'electrique','EV',2022,2027)]);
M('XPeng','G6',2023,2027,'SUV',[E('RWD 258',258,'electrique','EV',2023,2027),E('RWD Long 296',296,'electrique','EV',2023,2027),E('AWD 487',487,'electrique','EV',2023,2027)]);
M('XPeng','G3',2020,2024,'SUV',[E('Electric 197',197,'electrique','EV',2020,2024)]);
M('Zeekr','001',2021,2027,'shooting brake',[E('RWD 272',272,'electrique','EV',2021,2027),E('AWD 544',544,'electrique','EV',2021,2027),E('FR 1265',1265,'electrique','EV',2024,2027)]);
M('Zeekr','007',2024,2027,'berline',[E('RWD 421',421,'electrique','EV',2024,2027),E('AWD 646',646,'electrique','EV',2024,2027)]);
M('Zeekr','X',2023,2027,'SUV',[E('RWD 272',272,'electrique','EV',2023,2027),E('AWD 428',428,'electrique','EV',2023,2027)]);
M('Zeekr','009',2023,2027,'monospace',[E('AWD 544',544,'electrique','EV',2023,2027)]);
M('Leapmotor','T03',2021,2027,'citadine',[E('Electric 95',95,'electrique','EV',2021,2027)]);
M('Leapmotor','C10',2024,2027,'SUV',[E('EV 231',231,'electrique','EV',2024,2027),E('REEV 218',218,'hybride','REEV',2024,2027)]);
M('Leapmotor','C01',2022,2027,'berline',[E('RWD 272',272,'electrique','EV',2022,2027),E('AWD 544',544,'electrique','EV',2022,2027)]);
M('Leapmotor','B10',2025,2027,'SUV',[E('EV 218',218,'electrique','EV',2025,2027)]);
M('Chery','Tiggo 4',2019,2027,'SUV',[E('1.5 TCI 147',147,'essence','SQRE4T15',2019,2027),E('1.6 TGDI 186',186,'essence','SQRF4J16',2021,2027)]);
M('Chery','Tiggo 7',2020,2027,'SUV',[E('1.6 TGDI 186',186,'essence','SQRF4J16',2020,2027),E('1.5T PHEV 328',328,'hybride','DHT',2023,2027)]);
M('Chery','Tiggo 8',2020,2027,'SUV 7pl',[E('1.6 TGDI 186',186,'essence','SQRF4J16',2020,2027),E('2.0 TGDI 254',254,'essence','SQRF4J20',2022,2027),E('1.5T PHEV 328',328,'hybride','DHT',2023,2027)]);
M('Chery','Tiggo 9',2023,2027,'SUV',[E('2.0 TGDI 254',254,'essence','SQRF4J20',2023,2027),E('1.5T PHEV 360',360,'hybride','DHT',2023,2027)]);
M('Chery','Arrizo 8',2022,2027,'berline',[E('1.6 TGDI 186',186,'essence','SQRF4J16',2022,2027),E('2.0 TGDI 254',254,'essence','SQRF4J20',2022,2027)]);
M('Omoda','5',2023,2027,'SUV coupé',[E('1.6 TGDI 186',186,'essence','SQRF4J16',2023,2027),E('1.5T CVT 156',156,'essence','SQRE4T15C',2023,2027),E('E5 EV 204',204,'electrique','EV',2024,2027)]);
M('Omoda','7',2024,2027,'SUV',[E('1.5T PHEV 347',347,'hybride','DHT',2024,2027)]);
M('Omoda','9',2024,2027,'SUV',[E('1.5T PHEV 449',449,'hybride','DHT',2024,2027),E('EV 408',408,'electrique','EV',2024,2027)]);
M('Jaecoo','5',2024,2027,'SUV',[E('1.6 TGDI 186',186,'essence','SQRF4J16',2024,2027),E('EV 204',204,'electrique','EV',2024,2027)]);
M('Jaecoo','7',2023,2027,'SUV',[E('1.6 TGDI 186',186,'essence','SQRF4J16',2023,2027),E('1.5T PHEV 347',347,'hybride','DHT',2024,2027)]);
M('Jaecoo','8',2024,2027,'SUV 7pl',[E('2.0 TGDI 254',254,'essence','SQRF4J20',2024,2027),E('1.5T PHEV 449',449,'hybride','DHT',2024,2027)]);
M('Lynk & Co','01',2021,2027,'SUV',[E('1.5T Hybrid 143',143,'hybride','JLH3G15',2021,2027),E('1.5T PHEV 261',261,'hybride','VEP4H',2021,2027),E('2.0T 190',190,'essence','VEP4',2021,2024)]);
M('Lynk & Co','02',2022,2027,'SUV coupé',[E('EV 272',272,'electrique','EV',2022,2027)]);
M('Lynk & Co','03',2021,2027,'berline',[E('1.5T 180',180,'essence','JLH3G15',2021,2027),E('2.0T 254',254,'essence','VEP4',2021,2027),E('03+ 350',350,'essence','VEP4',2022,2027)]);
M('Lynk & Co','05',2021,2027,'SUV coupé',[E('1.5T PHEV 261',261,'hybride','VEP4H',2021,2027),E('2.0T 254',254,'essence','VEP4',2021,2027)]);
M('Lynk & Co','08',2023,2027,'SUV',[E('1.5T EM-P 350',350,'hybride','DHT',2023,2027),E('1.5T EM-P 593',593,'hybride','DHT',2023,2027)]);
M('Lynk & Co','Z10',2024,2027,'berline',[E('RWD 272',272,'electrique','EV',2024,2027),E('AWD 646',646,'electrique','EV',2024,2027)]);
M('Geely','Coolray',2021,2027,'SUV',[E('1.5T 177',177,'essence','JLH3G15',2021,2027),E('1.5T MHEV 190',190,'hybride','JLH3G15',2023,2027)]);
M('Geely','Monjaro',2023,2027,'SUV',[E('2.0T 238',238,'essence','VEP4',2023,2027),E('1.5T PHEV 350',350,'hybride','DHT',2023,2027)]);
M('Geely','Azkarra',2021,2027,'SUV',[E('1.5T MHEV 190',190,'hybride','JLH3G15',2021,2027)]);
M('Geely','Emgrand',2021,2027,'berline',[E('1.5 103',103,'essence','JLC4G15',2021,2027)]);
M('Geely','Galaxy E8',2024,2027,'berline',[E('RWD 272',272,'electrique','EV',2024,2027),E('AWD 646',646,'electrique','EV',2024,2027)]);
M('MG','MG4',2022,2027,'berline',[E('Standard 170',170,'electrique','EV',2022,2027),E('Comfort 204',204,'electrique','EV',2022,2027),E('XPower 435',435,'electrique','EV',2023,2027)]);
M('MG','MG5',2021,2027,'break',[E('EV 156',156,'electrique','EV',2021,2027),E('EV Long 177',177,'electrique','EV',2022,2027)]);
M('MG','ZS',2017,2027,'SUV',[E('1.5 VTi 106',106,'essence','15S4C',2017,2023),E('1.0 T-GDI 111',111,'essence','10E4E',2020,2023),E('EV 143',143,'electrique','EV',2019,2023),E('EV 156',156,'electrique','EV',2022,2027),E('Hybrid+ 190',190,'hybride','15S4C',2024,2027)]);
M('MG','HS',2018,2027,'SUV',[E('1.5 T-GDI 162',162,'essence','15E4E',2018,2027),E('2.0 T-GDI 231',231,'essence','20L4E',2019,2023),E('PHEV 258',258,'hybride','15E4E',2020,2023),E('PHEV 272',272,'hybride','15E4E',2024,2027)]);
M('MG','Marvel R',2021,2027,'SUV',[E('RWD 180',180,'electrique','EV',2021,2027),E('AWD 288',288,'electrique','EV',2021,2027)]);
M('MG','Cyberster',2023,2027,'roadster',[E('RWD 314',314,'electrique','EV',2023,2027),E('AWD 510',510,'electrique','EV',2023,2027)]);
M('MG','MG3',2024,2027,'citadine',[E('Hybrid+ 194',194,'hybride','15S4C',2024,2027)]);
M('BYD','Atto 3',2022,2027,'SUV',[E('Blade 204',204,'electrique','EV',2022,2027)]);
M('BYD','Dolphin',2023,2027,'citadine',[E('Blade 95',95,'electrique','EV',2023,2027),E('Blade 177',177,'electrique','EV',2023,2027),E('Blade 204',204,'electrique','EV',2023,2027)]);
M('BYD','Seal',2023,2027,'berline',[E('RWD 204',204,'electrique','EV',2023,2027),E('RWD 313',313,'electrique','EV',2023,2027),E('AWD 530',530,'electrique','EV',2023,2027)]);
M('BYD','Seal U',2023,2027,'SUV',[E('DM-i 218',218,'hybride','DMi',2023,2027),E('DM-p 324',324,'hybride','DMi',2024,2027),E('EV 218',218,'electrique','EV',2023,2027)]);
M('BYD','Sealion 7',2024,2027,'SUV',[E('RWD 313',313,'electrique','EV',2024,2027),E('AWD 530',530,'electrique','EV',2024,2027)]);
M('BYD','Han',2022,2027,'berline',[E('AWD 517',517,'electrique','EV',2022,2027)]);
M('BYD','Tang',2021,2027,'SUV 7pl',[E('AWD 517',517,'electrique','EV',2021,2027)]);
M('BYD','Song Plus',2023,2027,'SUV',[E('DM-i 218',218,'hybride','DMi',2023,2027),E('EV 204',204,'electrique','EV',2023,2027)]);
M('BYD','Yangwang U8',2023,2027,'SUV luxe',[E('EREV 1197',1197,'hybride','EREV',2023,2027)]);
/* ═══ JAPONAIS / CORÉENS ═══ */
M('Mazda','2',2015,2027,'citadine',[E('1.5 Skyactiv-G 75',75,'essence','PE',2015,2023),E('1.5 Skyactiv-G 90',90,'essence','PE',2015,2023),E('1.5 Skyactiv-G 115',115,'essence','PE',2017,2023),E('1.5 Skyactiv-D 105',105,'diesel','S8',2015,2018),E('Hybrid 116',116,'hybride','THS',2023,2027)]);
M('Mazda','3',2019,2027,'berline',[E('2.0 Skyactiv-G 122',122,'essence','PE',2019,2027),E('2.0 Skyactiv-G 150',150,'essence','PE',2019,2027),E('2.0 Skyactiv-X 186',186,'essence','SKYX',2019,2027),E('2.5 Skyactiv-G 140',140,'essence','PY',2019,2023),E('1.8 Skyactiv-D 116',116,'diesel','S8',2019,2023)]);
M('Mazda','6',2013,2024,'berline',[E('2.0 Skyactiv-G 145',145,'essence','PE',2013,2024),E('2.5 Skyactiv-G 192',192,'essence','PY',2013,2024),E('2.2 Skyactiv-D 150',150,'diesel','SH',2013,2024),E('2.2 Skyactiv-D 184',184,'diesel','SH',2013,2024)]);
M('Mazda','CX-3',2015,2024,'SUV',[E('2.0 Skyactiv-G 120',120,'essence','PE',2015,2024),E('1.8 Skyactiv-D 116',116,'diesel','S8',2018,2024)]);
M('Mazda','CX-30',2019,2027,'SUV',[E('2.0 Skyactiv-G 122',122,'essence','PE',2019,2027),E('2.0 Skyactiv-X 186',186,'essence','SKYX',2019,2027),E('2.5 Skyactiv-G 140',140,'essence','PY',2019,2023)]);
M('Mazda','CX-5',2012,2027,'SUV',[E('2.0 Skyactiv-G 165',165,'essence','PE',2012,2027),E('2.5 Skyactiv-G 194',194,'essence','PY',2017,2027),E('2.2 Skyactiv-D 150',150,'diesel','SH',2012,2023),E('2.2 Skyactiv-D 184',184,'diesel','SH',2017,2023)]);
M('Mazda','CX-60',2022,2027,'SUV',[E('3.3 e-Skyactiv D 200',200,'diesel','T3',2022,2027),E('3.3 e-Skyactiv D 254',254,'diesel','T3',2022,2027),E('2.5 PHEV 327',327,'hybride','PYH',2022,2027)]);
M('Mazda','CX-80',2024,2027,'SUV 7pl',[E('3.3 e-Skyactiv D 254',254,'diesel','T3',2024,2027),E('2.5 PHEV 327',327,'hybride','PYH',2024,2027)]);
M('Mazda','MX-5',2015,2027,'roadster',[E('1.5 Skyactiv-G 132',132,'essence','PE',2015,2027),E('2.0 Skyactiv-G 184',184,'essence','PE',2018,2027)]);
M('Mazda','MX-30',2020,2027,'SUV',[E('EV 145',145,'electrique','EV',2020,2027),E('R-EV rotary 170',170,'hybride','ROTARY',2023,2027)]);
M('Lexus','CT',2011,2022,'berline',[E('200h 136',136,'hybride','THS',2011,2022)]);
M('Lexus','IS',2013,2024,'berline',[E('300h 223',223,'hybride','THS',2013,2024),E('200t 245',245,'essence','8AR',2015,2020)]);
M('Lexus','UX',2018,2027,'SUV',[E('250h 184',184,'hybride','THS',2018,2027),E('300e 204',204,'electrique','EV',2020,2027)]);
M('Lexus','NX',2014,2027,'SUV',[E('300h 197',197,'hybride','THS',2014,2021),E('350h 244',244,'hybride','THS',2021,2027),E('450h+ 309',309,'hybride','THS',2021,2027)]);
M('Lexus','RX',2015,2027,'SUV',[E('450h 249',249,'hybride','THS',2015,2022),E('450h+ 309',309,'hybride','THS',2022,2027),E('500h 371',371,'hybride','THS',2022,2027)]);
M('Lexus','RZ',2023,2027,'SUV',[E('450e 313',313,'electrique','EV',2023,2027)]);
M('Lexus','LBX',2023,2027,'SUV',[E('1.5 Hybrid 136',136,'hybride','THS',2023,2027)]);
M('Lexus','ES',2018,2027,'berline',[E('300h 218',218,'hybride','THS',2018,2027)]);
M('Suzuki','Swift',2017,2027,'citadine',[E('1.2 Dualjet 83',83,'essence','K12',2017,2023),E('1.2 Hybrid 90',90,'hybride','K12',2020,2023),E('1.2 Hybrid 83',83,'hybride','K12',2024,2027),E('1.4 Boosterjet 140',140,'essence','K14',2017,2020),E('1.4 Hybrid 129',129,'hybride','K14',2020,2023),E('1.0 Boosterjet 111',111,'essence','K10',2016,2020)]);
M('Suzuki','Vitara',2015,2027,'SUV',[E('1.4 Boosterjet 140',140,'essence','K14',2015,2020),E('1.4 Hybrid 129',129,'hybride','K14',2020,2027),E('1.5 Hybrid 102',102,'hybride','K15',2019,2023),E('1.6 120',120,'essence','M16',2015,2019),E('1.6 DDiS 120',120,'diesel','D19',2015,2019)]);
M('Suzuki','S-Cross',2013,2027,'SUV',[E('1.4 Boosterjet 140',140,'essence','K14',2013,2020),E('1.4 Hybrid 129',129,'hybride','K14',2020,2027),E('1.5 Hybrid 115',115,'hybride','K15',2022,2027),E('1.6 DDiS 120',120,'diesel','D19',2013,2019)]);
M('Suzuki','Jimny',2018,2027,'SUV',[E('1.5 102',102,'essence','K15',2018,2027)]);
M('Suzuki','Ignis',2016,2027,'citadine',[E('1.2 Dualjet 90',90,'essence','K12',2016,2023),E('1.2 Hybrid 90',90,'hybride','K12',2020,2027)]);
M('Suzuki','Across',2020,2027,'SUV',[E('2.5 PHEV 306',306,'hybride','THS',2020,2027)]);
M('Suzuki','Swace',2020,2027,'break',[E('1.8 Hybrid 122',122,'hybride','THS',2020,2027)]);
M('Mitsubishi','ASX',2010,2027,'SUV',[E('1.6 MIVEC 117',117,'essence','4A92',2010,2020),E('2.0 MIVEC 150',150,'essence','4B11',2010,2018),E('1.6 DI-D 114',114,'diesel','DV6',2013,2018),E('2.2 DI-D 150',150,'diesel','4N14',2013,2018),E('1.3 Turbo 158',158,'essence','H5Ht',2023,2027),E('1.6 Hybrid 143',143,'hybride','H4M',2023,2027)]);
M('Mitsubishi','Outlander',2013,2027,'SUV',[E('2.0 PHEV 203',203,'hybride','4B11PHEV',2013,2021),E('2.4 PHEV 224',224,'hybride','4B12PHEV',2019,2021),E('2.4 PHEV 248',248,'hybride','4B12PHEV',2024,2027),E('2.2 DI-D 150',150,'diesel','4N14',2013,2021)]);
M('Mitsubishi','Eclipse Cross',2018,2027,'SUV',[E('1.5 Turbo 163',163,'essence','4B40',2018,2027),E('2.2 DI-D 150',150,'diesel','4N14',2018,2021),E('2.4 PHEV 248',248,'hybride','4B12PHEV',2021,2027)]);
M('Mitsubishi','L200',2015,2027,'pick-up',[E('2.4 DI-D 154',154,'diesel','4N15',2015,2021),E('2.2 DI-D 150',150,'diesel','4N14',2019,2027)]);
M('Mitsubishi','Space Star',2013,2027,'citadine',[E('1.0 71',71,'essence','3A90',2013,2027),E('1.2 80',80,'essence','3A92',2013,2027)]);
M('Subaru','Impreza',2016,2027,'berline',[E('1.6i 114',114,'essence','FB16',2016,2023),E('2.0i 150',150,'essence','FB20',2012,2023),E('2.0 e-Boxer 150',150,'hybride','FB20H',2019,2027)]);
M('Subaru','XV / Crosstrek',2012,2027,'SUV',[E('1.6i 114',114,'essence','FB16',2012,2023),E('2.0i 150',150,'essence','FB20',2012,2023),E('2.0 e-Boxer 150',150,'hybride','FB20H',2019,2027)]);
M('Subaru','Forester',2013,2027,'SUV',[E('2.0i 150',150,'essence','FB20',2013,2023),E('2.0 e-Boxer 150',150,'hybride','FB20H',2019,2027),E('2.0 XT 240',240,'essence','FA20',2013,2018),E('2.0D 147',147,'diesel','EE20',2008,2018)]);
M('Subaru','Outback',2015,2027,'break',[E('2.5i 175',175,'essence','FB25',2015,2023),E('2.5i 169',169,'essence','FB25',2021,2027),E('2.0D 150',150,'diesel','EE20',2008,2018)]);
M('Subaru','WRX',2014,2027,'berline sport',[E('2.0 268',268,'essence','FA20',2014,2021),E('2.4 275',275,'essence','FA24',2022,2027)]);
M('Subaru','BRZ',2012,2027,'coupé',[E('2.0 200',200,'essence','FA20',2012,2021),E('2.4 234',234,'essence','FA24',2022,2027)]);
M('Subaru','Solterra',2022,2027,'SUV',[E('AWD 218',218,'electrique','EV',2022,2027)]);
M('Honda','Jazz',2015,2027,'citadine',[E('1.3 i-VTEC 102',102,'essence','L13',2015,2020),E('1.5 e:HEV 109',109,'hybride','IMMD',2020,2027)]);
M('Honda','Civic',2016,2027,'berline',[E('1.0 VTEC Turbo 129',129,'essence','L15',2016,2021),E('1.5 VTEC Turbo 182',182,'essence','L15',2016,2021),E('2.0 Type R 320',320,'essence','K20',2017,2023),E('2.0 Type R 329',329,'essence','K20',2023,2027),E('2.0 e:HEV 184',184,'hybride','IMMD',2021,2027),E('1.6 i-DTEC 120',120,'diesel','N16',2015,2018)]);
M('Honda','CR-V',2015,2027,'SUV',[E('1.5 VTEC Turbo 173',173,'essence','L15',2018,2023),E('1.5 VTEC Turbo 193',193,'essence','L15',2018,2023),E('2.0 e:HEV 184',184,'hybride','IMMD',2018,2027),E('2.0 e:PHEV 184',184,'hybride','IMMD',2023,2027),E('1.6 i-DTEC 160',160,'diesel','N16',2015,2018)]);
M('Honda','HR-V',2015,2027,'SUV',[E('1.5 i-VTEC 130',130,'essence','L15',2015,2021),E('1.5 e:HEV 131',131,'hybride','IMMD',2021,2027)]);
M('Honda','ZR-V',2023,2027,'SUV',[E('2.0 e:HEV 184',184,'hybride','IMMD',2023,2027)]);
M('Honda','e',2019,2027,'citadine',[E('EV 154',154,'electrique','EV',2019,2027)]);
M('Honda','e:Ny1',2023,2027,'SUV',[E('EV 204',204,'electrique','EV',2023,2027)]);
M('Nissan','Micra',2017,2027,'citadine',[E('0.9 IG-T 90',90,'essence','HR09',2016,2019),E('1.0 IG-T 100',100,'essence','HR10',2018,2023),E('1.5 dCi 90',90,'diesel','K9K',2016,2019)]);
M('Nissan','Juke',2010,2027,'SUV',[E('1.0 DIG-T 114',114,'essence','HR10',2019,2027),E('1.6 DIG-T 190',190,'essence','MR16',2013,2019),E('1.6 117',117,'essence','HR16',2010,2019),E('1.5 dCi 110',110,'diesel','K9K',2010,2018),E('1.6 Hybrid 143',143,'hybride','H4M',2022,2027)]);
M('Nissan','Qashqai',2006,2027,'SUV',[E('1.2 DIG-T 115',115,'essence','HR12',2013,2020),E('1.3 DIG-T 140',140,'essence','HR13',2018,2023),E('1.3 DIG-T 158',158,'hybride','HR13',2021,2027),E('1.5 dCi 110',110,'diesel','K9K',2006,2018),E('1.6 dCi 130',130,'diesel','R9M',2013,2019),E('1.7 dCi 150',150,'diesel','R9N',2019,2021),E('1.5 e-Power 190',190,'hybride','HR15',2022,2027)]);
M('Nissan','X-Trail',2001,2027,'SUV',[E('1.3 DIG-T 160',160,'essence','HR13',2019,2021),E('1.6 dCi 130',130,'diesel','R9M',2014,2019),E('2.0 dCi 177',177,'diesel','M9R',2007,2014),E('1.5 e-Power 204',204,'hybride','HR15',2022,2027),E('e-4ORCE 213',213,'hybride','HR15',2022,2027)]);
M('Nissan','Leaf',2010,2027,'berline',[E('24 kWh 109',109,'electrique','EV',2010,2017),E('30 kWh 109',109,'electrique','EV',2016,2017),E('40 kWh 150',150,'electrique','EV',2017,2023),E('62 kWh e+ 218',218,'electrique','EV',2019,2023)]);
M('Nissan','Ariya',2022,2027,'SUV',[E('63 kWh 218',218,'electrique','EV',2022,2027),E('87 kWh 242',242,'electrique','EV',2022,2027),E('e-4ORCE 306',306,'electrique','EV',2022,2027),E('Nismo 367',367,'electrique','EV',2024,2027)]);
M('Nissan','Navara',2015,2027,'pick-up',[E('2.3 dCi 163',163,'diesel','YS23',2015,2027),E('2.3 dCi 190',190,'diesel','YS23',2015,2027)]);
M('Nissan','GT-R',2008,2024,'supercar',[E('3.8 V6 biturbo 485',485,'essence','VR38',2008,2011),E('3.8 V6 biturbo 550',550,'essence','VR38',2011,2016),E('3.8 V6 Nismo 600',600,'essence','VR38',2014,2024)]);
M('Hyundai','i10',2013,2027,'citadine',[E('1.0 MPi 67',67,'essence','KAPPA',2013,2027),E('1.2 MPi 84',84,'essence','KAPPA',2013,2027),E('1.0 T-GDi N 100',100,'essence','KAPPA',2020,2027)]);
M('Hyundai','i20',2014,2027,'citadine',[E('1.2 MPi 84',84,'essence','KAPPA',2014,2023),E('1.0 T-GDi 100',100,'essence','KAPPA',2015,2027),E('1.0 T-GDi 48V 120',120,'hybride','KAPPA',2020,2027),E('1.6 T-GDi N 204',204,'essence','GAMMA',2021,2027),E('1.4 CRDi 90',90,'diesel','U2',2014,2018)]);
M('Hyundai','i30',2015,2027,'berline',[E('1.0 T-GDi 120',120,'essence','KAPPA',2016,2023),E('1.4 T-GDi 140',140,'essence','GAMMA',2016,2020),E('1.5 T-GDi 160',160,'essence','SMARTSTREAM',2017,2023),E('1.5 T-GDi 48V 160',160,'hybride','SMARTSTREAM',2020,2023),E('2.0 T-GDi N 280',280,'essence','THETA',2021,2027),E('1.6 CRDi 136',136,'diesel','U2',2015,2020)]);
M('Hyundai','Bayon',2021,2027,'SUV',[E('1.2 MPi 84',84,'essence','KAPPA',2021,2027),E('1.0 T-GDi 100',100,'essence','KAPPA',2021,2027),E('1.0 T-GDi 48V 120',120,'hybride','KAPPA',2021,2027)]);
M('Hyundai','Kona',2017,2027,'SUV',[E('1.0 T-GDi 120',120,'essence','KAPPA',2017,2023),E('1.6 T-GDi 177',177,'essence','GAMMA',2017,2021),E('1.6 T-GDi N 280',280,'essence','THETA',2021,2023),E('1.6 Hybrid 141',141,'hybride','SMARTSTREAM',2023,2027),E('Electric 136',136,'electrique','EV',2018,2023),E('Electric 204',204,'electrique','EV',2020,2023),E('Electric 218',218,'electrique','EV',2023,2027)]);
M('Hyundai','Tucson',2015,2027,'SUV',[E('1.6 T-GDi 150',150,'essence','SMARTSTREAM',2018,2027),E('1.6 T-GDi 48V 150',150,'hybride','SMARTSTREAM',2020,2027),E('1.6 T-GDi Hybrid 230',230,'hybride','SMARTSTREAM',2020,2027),E('1.6 T-GDi PHEV 265',265,'hybride','SMARTSTREAM',2021,2027),E('1.6 CRDi 136',136,'diesel','U2',2015,2023),E('2.0 CRDi 185',185,'diesel','D4HA',2015,2020)]);
M('Hyundai','Santa Fe',2012,2027,'SUV',[E('2.2 CRDi 200',200,'diesel','D4HB',2012,2020),E('2.2 CRDi 202',202,'diesel','SMARTSTREAM',2020,2023),E('1.6 T-GDi Hybrid 230',230,'hybride','SMARTSTREAM',2020,2027),E('1.6 T-GDi PHEV 265',265,'hybride','SMARTSTREAM',2021,2027)]);
M('Hyundai','Ioniq 5',2021,2027,'SUV',[E('58 kWh 170',170,'electrique','EGMP',2021,2027),E('77.4 kWh 229',229,'electrique','EGMP',2023,2027),E('AWD 325',325,'electrique','EGMP',2021,2027),E('N 650',650,'electrique','EGMP',2024,2027)]);
M('Hyundai','Ioniq 6',2022,2027,'berline',[E('RWD 151',151,'electrique','EGMP',2022,2027),E('RWD 229',229,'electrique','EGMP',2022,2027),E('AWD 325',325,'electrique','EGMP',2022,2027)]);
M('Hyundai','Ioniq 9',2025,2027,'SUV 7pl',[E('RWD 218',218,'electrique','EGMP',2025,2027),E('AWD 428',428,'electrique','EGMP',2025,2027)]);
/* ═══ EUROPÉENS — compléments ═══ */
M('Porsche','911',2016,2027,'sportive',[E('3.0 Carrera 370',370,'essence','9A2',2016,2019),E('3.0 Carrera 385',385,'essence','9A2',2019,2027),E('3.0 Carrera S 450',450,'essence','9A2',2019,2027),E('3.0 GTS 480',480,'essence','9A2',2021,2027),E('3.8 Turbo 580',580,'essence','9A1',2016,2020),E('3.8 Turbo S 650',650,'essence','9A1',2020,2027),E('4.0 GT3 510',510,'essence','9A1',2019,2027)]);
M('Porsche','718 Cayman / Boxster',2016,2027,'sportive',[E('2.0 300',300,'essence','MA2',2016,2027),E('2.5 S 350',350,'essence','MA2',2016,2027),E('4.0 GTS 400',400,'essence','9A1',2019,2027),E('4.0 GT4 420',420,'essence','9A1',2019,2027)]);
M('Porsche','Panamera',2016,2027,'berline',[E('2.9 V6 440 4S',440,'essence','EA839',2016,2027),E('4.0 V8 Turbo 550',550,'essence','EA825',2016,2023),E('4.0 V8 GTS 480',480,'essence','EA825',2018,2027),E('2.9 4 E-Hybrid 462',462,'hybride','EA839H',2016,2027),E('4.0 Turbo S E-Hybrid 700',700,'hybride','EA825H',2017,2027)]);
M('Porsche','Taycan',2019,2027,'berline',[E('RWD 408',408,'electrique','J1',2019,2023),E('4S 530',530,'electrique','J1',2019,2023),E('Turbo 884',884,'electrique','J1',2023,2027),E('Turbo GT 1034',1034,'electrique','J1',2024,2027)]);
M('Porsche','Macan',2014,2027,'SUV',[E('2.0 245',245,'essence','EA888',2014,2018),E('2.0 265',265,'essence','EA888',2021,2023),E('2.9 S 354',354,'essence','EA839',2018,2021),E('2.9 GTS 440',440,'essence','EA839',2021,2023),E('Electric 408',408,'electrique','PPE',2024,2027),E('Electric 4S 516',516,'electrique','PPE',2024,2027),E('Electric Turbo 639',639,'electrique','PPE',2024,2027)]);
M('Porsche','Cayenne',2017,2027,'SUV',[E('3.0 V6 340',340,'essence','EA839',2017,2023),E('3.0 V6 353',353,'essence','EA839',2023,2027),E('2.9 S 440',440,'essence','EA839',2017,2023),E('4.0 V8 Turbo 550',550,'essence','EA825',2017,2023),E('3.0 Diesel 262',262,'diesel','EA897',2014,2018),E('4.0 V8 TDI 421',421,'diesel','EA898',2016,2020),E('E-Hybrid 462',462,'hybride','EA839H',2017,2023),E('Turbo S E-Hybrid 739',739,'hybride','EA825H',2023,2027)]);
M('Volvo','V40',2012,2019,'berline',[E('D2 120',120,'diesel','VEA',2015,2019),E('D3 150',150,'diesel','VEA',2012,2019),E('D4 190',190,'diesel','VEA',2014,2019),E('T2 122',122,'essence','VEA',2013,2019),E('T3 152',152,'essence','VEA',2013,2019),E('T4 190',190,'essence','VEA',2014,2019),E('T5 245',245,'essence','VEA',2013,2019)]);
M('Volvo','V60 / S60',2018,2027,'break',[E('B3 163',163,'hybride','VEA',2020,2027),E('B4 197',197,'hybride','VEA',2020,2027),E('B5 250',250,'hybride','VEA',2020,2027),E('D3 150',150,'diesel','VEA',2018,2020),E('D4 190',190,'diesel','VEA',2018,2020),E('T6 350',350,'hybride','VEAH',2020,2027),E('T8 455',455,'hybride','VEAH',2022,2027)]);
M('Volvo','XC40',2017,2027,'SUV',[E('T2 129',129,'essence','VEA',2017,2020),E('T3 163',163,'essence','VEA',2017,2023),E('B3 163',163,'hybride','VEA',2020,2027),E('B4 197',197,'hybride','VEA',2020,2027),E('D3 150',150,'diesel','VEA',2017,2020),E('D4 190',190,'diesel','VEA',2017,2020),E('T5 Twin 262',262,'hybride','VEAH',2019,2023),E('Recharge 231',231,'electrique','EV',2020,2027),E('Recharge Twin 408',408,'electrique','EV',2020,2027)]);
M('Volvo','XC60',2017,2027,'SUV',[E('B4 197',197,'hybride','VEA',2020,2027),E('B5 250',250,'hybride','VEA',2020,2027),E('B6 300',300,'hybride','VEA',2020,2023),E('D4 190',190,'diesel','VEA',2017,2020),E('D5 235',235,'diesel','VEA',2017,2020),E('T6 350',350,'hybride','VEAH',2017,2023),E('T8 455',455,'hybride','VEAH',2022,2027)]);
M('Volvo','XC90',2015,2027,'SUV',[E('B5 250',250,'hybride','VEA',2020,2027),E('B6 300',300,'hybride','VEA',2020,2023),E('D5 235',235,'diesel','VEA',2017,2020),E('T8 455',455,'hybride','VEAH',2022,2027)]);
M('Volvo','EX30',2023,2027,'SUV',[E('Single Motor 272',272,'electrique','EV',2023,2027),E('Twin Motor 428',428,'electrique','EV',2023,2027)]);
M('Volvo','EX90',2024,2027,'SUV',[E('Twin Motor 408',408,'electrique','EV',2024,2027),E('Performance 517',517,'electrique','EV',2024,2027)]);
M('Polestar','2',2020,2027,'berline',[E('Standard 231',231,'electrique','EV',2020,2023),E('Long Single 272',272,'electrique','EV',2023,2027),E('Long Dual 408',408,'electrique','EV',2020,2023),E('Long Dual 476',476,'electrique','EV',2023,2027)]);
M('Polestar','3',2024,2027,'SUV',[E('Long Dual 489',489,'electrique','EV',2024,2027),E('Performance 517',517,'electrique','EV',2024,2027)]);
M('Polestar','4',2024,2027,'SUV coupé',[E('Long Single 272',272,'electrique','EV',2024,2027),E('Long Dual 544',544,'electrique','EV',2024,2027)]);
M('Polestar','5',2025,2027,'GT',[E('Dual 884',884,'electrique','EV',2025,2027)]);
M('Alpine','A110',2017,2027,'sportive',[E('1.8 TCe 252',252,'essence','M5Pt',2017,2027),E('1.8 TCe S 292',292,'essence','M5Pt',2019,2027),E('1.8 TCe R 300',300,'essence','M5Pt',2022,2027),E('1.8 TCe GT 300',300,'essence','M5Pt',2022,2027)]);
M('Alpine','A290',2024,2027,'citadine sport',[E('EV 180',180,'electrique','EV',2024,2027),E('EV GTS 220',220,'electrique','EV',2024,2027)]);
M('Alpine','A390',2025,2027,'SUV sport',[E('EV 400',400,'electrique','EV',2025,2027),E('EV GTS 470',470,'electrique','EV',2025,2027)]);
M('Lancia','Ypsilon',2011,2027,'citadine',[E('1.2 Fire 69',69,'essence','FIRE',2011,2020),E('0.9 TwinAir 85',85,'essence','FIRE',2011,2015),E('1.3 MultiJet 95',95,'diesel','MJET',2011,2018),E('1.0 Hybrid 70',70,'hybride','FIRE',2020,2024),E('1.2 Hybrid 100',100,'hybride','EB2GEN3',2024,2027),E('Elettrica 156',156,'electrique','EV',2024,2027)]);
M('Lancia','Delta',2008,2014,'berline',[E('1.4 T-Jet 120',120,'essence','FIRE',2008,2014),E('1.6 MultiJet 120',120,'diesel','MJET',2008,2014),E('2.0 MultiJet 165',165,'diesel','MJET2',2009,2014)]);
M('Lancia','Voyager',2011,2015,'monospace',[E('3.6 V6 283',283,'essence','PENTASTAR',2011,2015),E('2.8 CRD 163',163,'diesel','VM',2011,2015)]);
M('Alfa Romeo','MiTo',2008,2018,'citadine',[E('0.9 TwinAir 105',105,'essence','FIRE',2013,2018),E('1.4 T-Jet 155',155,'essence','FIRE',2008,2018),E('1.4 MultiAir 170',170,'essence','FIRE',2009,2018),E('1.3 JTDM 95',95,'diesel','MJET',2008,2018),E('1.6 JTDM 120',120,'diesel','MJET',2008,2018)]);
M('Alfa Romeo','4C',2013,2020,'sportive',[E('1.75 TBi 240',240,'essence','TBi',2013,2020)]);
M('Alfa Romeo','Giulia',2016,2027,'berline',[E('2.0 Turbo 200',200,'essence','GME',2016,2023),E('2.0 Turbo 280',280,'essence','GME',2016,2023),E('2.9 V6 QV 510',510,'essence','690T',2016,2023),E('2.9 V6 GTA 540',540,'essence','690T',2020,2023),E('2.2 JTDM 150',150,'diesel','MJET',2016,2023),E('2.2 JTDM 190',190,'diesel','MJET',2016,2023),E('2.2 JTDM 210',210,'diesel','MJET',2018,2023)]);
M('Alfa Romeo','Stelvio',2017,2027,'SUV',[E('2.0 Turbo 200',200,'essence','GME',2017,2023),E('2.0 Turbo 280',280,'essence','GME',2017,2023),E('2.9 V6 QV 510',510,'essence','690T',2017,2023),E('2.2 JTDM 190',190,'diesel','MJET',2017,2023),E('2.2 JTDM 210',210,'diesel','MJET',2017,2023)]);
M('Jeep','Cherokee',2014,2023,'SUV',[E('2.0 MultiJet 140',140,'diesel','MJET',2014,2020),E('2.0 MultiJet 170',170,'diesel','MJET',2014,2020),E('2.4 Tigershark 177',177,'essence','TIGERSHARK',2014,2020),E('3.2 V6 272',272,'essence','PENTASTAR',2014,2020)]);
M('Jeep','Grand Cherokee',2011,2027,'SUV',[E('3.0 CRD V6 241',241,'diesel','VM',2011,2021),E('3.6 V6 286',286,'essence','PENTASTAR',2011,2027),E('5.7 V8 352',352,'essence','HEMI',2011,2021),E('6.4 V8 SRT 468',468,'essence','HEMI',2012,2021),E('2.0 4xe 380',380,'hybride','GMEH',2022,2027)]);
M('Jeep','Wrangler',2018,2027,'SUV',[E('2.0 Turbo 272',272,'essence','GME',2018,2027),E('3.6 V6 285',285,'essence','PENTASTAR',2012,2023),E('2.2 MultiJet 200',200,'diesel','MJET',2018,2023),E('2.8 CRD 200',200,'diesel','VM',2007,2018),E('2.0 4xe 380',380,'hybride','GMEH',2021,2027)]);
M('Jeep','Gladiator',2020,2027,'pick-up',[E('3.6 V6 285',285,'essence','PENTASTAR',2020,2027),E('3.0 V6 diesel 260',260,'diesel','VM',2020,2023)]);
M('Fiat','Panda',2012,2027,'citadine',[E('1.0 Hybrid 70',70,'hybride','FIRE',2020,2027),E('1.2 Fire 69',69,'essence','FIRE',2012,2020),E('0.9 TwinAir 85',85,'essence','FIRE',2012,2020),E('1.3 MultiJet 75',75,'diesel','MJET',2012,2018)]);
M('Fiat','Grande Panda',2024,2027,'citadine',[E('1.2 Hybrid 100',100,'hybride','EB2GEN3',2024,2027),E('Elettrica 113',113,'electrique','EV',2024,2027)]);
M('Fiat','500L',2012,2022,'monospace',[E('1.4 T-Jet 120',120,'essence','FIRE',2012,2022),E('0.9 TwinAir 105',105,'essence','FIRE',2012,2018),E('1.3 MultiJet 95',95,'diesel','MJET',2012,2020),E('1.6 MultiJet 120',120,'diesel','MJET',2012,2020)]);
M('Fiat','Talento',2016,2027,'utilitaire',[E('1.6 MultiJet 95',95,'diesel','MJET',2016,2021),E('1.6 MultiJet 120',120,'diesel','MJET',2016,2021),E('1.6 MultiJet 145',145,'diesel','MJET',2016,2021),E('2.0 MultiJet 120',120,'diesel','MJET2',2021,2027),E('2.0 MultiJet 145',145,'diesel','MJET2',2021,2027),E('E-Talento 136',136,'electrique','EV',2022,2027)]);
M('Fiat','Scudo',2022,2027,'utilitaire',[E('1.5 BlueHDi 100',100,'diesel','DV5R',2022,2027),E('1.5 BlueHDi 120',120,'diesel','DV5R',2022,2027),E('2.0 BlueHDi 145',145,'diesel','DW10F',2022,2027),E('2.0 BlueHDi 180',180,'diesel','DW10F',2022,2027),E('E-Scudo 136',136,'electrique','EV',2022,2027)]);
M('Mercedes-Benz','Classe S',2013,2027,'berline luxe',[E('S350d 286',286,'diesel','OM656',2017,2027),E('S400d 330',330,'diesel','OM656',2017,2023),E('S450 367',367,'essence','M256',2017,2027),E('S500 469',469,'essence','M256',2017,2027),E('S580 503',503,'essence','M176',2020,2027),E('S580e 510',510,'hybride','M256H',2020,2027),E('AMG S63 E 802',802,'hybride','M177H',2023,2027)]);
M('Mercedes-Benz','Classe G',2018,2027,'SUV',[E('G350d 286',286,'diesel','OM656',2018,2027),E('G400d 330',330,'diesel','OM656',2018,2023),E('G500 422',422,'essence','M176',2018,2023),E('AMG G63 585',585,'essence','M177',2018,2027),E('G580 EQ 587',587,'electrique','EV',2024,2027)]);
M('Mercedes-Benz','GLS',2016,2027,'SUV 7pl',[E('GLS350d 286',286,'diesel','OM656',2016,2023),E('GLS400d 330',330,'diesel','OM656',2019,2023),E('GLS450 367',367,'essence','M256',2019,2027),E('GLS580 489',489,'essence','M176',2019,2027),E('AMG GLS63 612',612,'essence','M177',2019,2027)]);
M('Mercedes-Benz','EQS',2021,2027,'berline',[E('450+ 333',333,'electrique','EV',2021,2027),E('580 4MATIC 523',523,'electrique','EV',2021,2027),E('AMG 53 658',658,'electrique','EV',2022,2027)]);
M('Mercedes-Benz','EQB',2021,2027,'SUV',[E('250 190',190,'electrique','EV',2021,2027),E('300 4MATIC 228',228,'electrique','EV',2021,2027),E('350 4MATIC 292',292,'electrique','EV',2021,2027)]);
M('Mercedes-Benz','EQV',2020,2027,'monospace',[E('300 204',204,'electrique','EV',2020,2027)]);
M('Mercedes-Benz','CLE',2023,2027,'coupé',[E('CLE200 204',204,'essence','M254',2023,2027),E('CLE300 258',258,'essence','M254',2023,2027),E('CLE220d 197',197,'diesel','OM654',2023,2027),E('AMG CLE53 449',449,'essence','M256',2023,2027)]);
M('BMW','Série 2',2014,2027,'coupé',[E('218i 136',136,'essence','B38',2014,2023),E('220i 184',184,'essence','B48',2014,2023),E('230i 245',245,'essence','B48',2021,2027),E('M240i 374',374,'essence','B58',2016,2023),E('M240i 387',387,'essence','B58',2023,2027),E('218d 150',150,'diesel','B47',2014,2023),E('220d 190',190,'diesel','B47',2014,2023)]);
M('BMW','Série 4',2020,2027,'coupé',[E('420i 184',184,'essence','B48',2020,2027),E('430i 258',258,'essence','B48',2020,2027),E('M440i 374',374,'essence','B58',2020,2027),E('420d 190',190,'diesel','B47',2020,2027),E('430d 286',286,'diesel','B57',2020,2027)]);
M('BMW','Série 5',2017,2027,'berline',[E('520i 184',184,'essence','B48',2017,2023),E('530i 252',252,'essence','B48',2017,2023),E('540i 340',340,'essence','B58',2017,2023),E('M550i 530',530,'essence','N63',2017,2023),E('520d 190',190,'diesel','B47',2017,2023),E('530d 286',286,'diesel','B57',2017,2023),E('540d 340',340,'diesel','B57',2017,2023),E('530e 292',292,'hybride','B48H',2017,2023),E('550e 489',489,'hybride','B58H',2023,2027),E('i5 eDrive40 340',340,'electrique','EV',2023,2027),E('i5 M60 601',601,'electrique','EV',2023,2027)]);
M('BMW','Série 7',2015,2027,'berline luxe',[E('730d 265',265,'diesel','B57',2015,2023),E('740d 320',320,'diesel','B57',2015,2023),E('740i 340',340,'essence','B58',2015,2023),E('750i 530',530,'essence','N63',2015,2023),E('745e 394',394,'hybride','B58H',2019,2023),E('i7 xDrive60 544',544,'electrique','EV',2022,2027),E('i7 M70 660',660,'electrique','EV',2023,2027)]);
M('BMW','X3',2017,2027,'SUV',[E('xDrive20i 184',184,'essence','B48',2017,2023),E('xDrive30i 252',252,'essence','B48',2017,2023),E('M40i 360',360,'essence','B58',2017,2023),E('xDrive20d 190',190,'diesel','B47',2017,2023),E('xDrive30d 286',286,'diesel','B57',2017,2023),E('M40d 340',340,'diesel','B57',2017,2023),E('xDrive30e 292',292,'hybride','B48H',2019,2023)]);
M('BMW','X5',2018,2027,'SUV',[E('xDrive40i 340',340,'essence','B58',2018,2023),E('xDrive40i 381',381,'essence','B58',2023,2027),E('M60i 530',530,'essence','S68',2023,2027),E('xDrive30d 286',286,'diesel','B57',2018,2023),E('xDrive40d 340',340,'diesel','B57',2019,2023),E('xDrive45e 394',394,'hybride','B58H',2019,2023),E('xDrive50e 489',489,'hybride','B58H',2023,2027)]);
M('BMW','X7',2019,2027,'SUV 7pl',[E('xDrive40i 340',340,'essence','B58',2019,2023),E('M60i 530',530,'essence','S68',2023,2027),E('xDrive40d 340',340,'diesel','B57',2019,2027)]);
M('BMW','iX1',2022,2027,'SUV',[E('eDrive20 204',204,'electrique','EV',2023,2027),E('xDrive30 313',313,'electrique','EV',2022,2027)]);
M('BMW','iX3',2021,2027,'SUV',[E('286 ch 286',286,'electrique','EV',2021,2027)]);
M('BMW','i3',2013,2022,'citadine',[E('170 ch 170',170,'electrique','EV',2013,2018),E('i3s 184',184,'electrique','EV',2018,2022),E('REx 170',170,'hybride','REX',2013,2018)]);
M('Audi','A1',2018,2027,'citadine',[E('25 TFSI 95',95,'essence','EA211',2018,2023),E('30 TFSI 110',110,'essence','EA211',2018,2027),E('35 TFSI 150',150,'essence','EA211EVO',2018,2027),E('40 TFSI 200',200,'essence','EA888',2018,2023)]);
M('Audi','A4',2015,2027,'berline',[E('35 TFSI 150',150,'essence','EA211EVO',2015,2023),E('40 TFSI 204',204,'essence','EA888',2015,2027),E('45 TFSI 265',265,'essence','EA888',2015,2027),E('30 TDI 136',136,'diesel','EA288',2015,2023),E('35 TDI 163',163,'diesel','EA288',2015,2027),E('40 TDI 204',204,'diesel','EA288EVO',2019,2027),E('S4 3.0 TDI 341',341,'diesel','EA897',2019,2023)]);
M('Audi','A5',2016,2027,'coupé',[E('40 TFSI 204',204,'essence','EA888',2016,2027),E('45 TFSI 265',265,'essence','EA888',2016,2027),E('40 TDI 204',204,'diesel','EA288EVO',2016,2027),E('S5 3.0 TFSI 354',354,'essence','EA839',2016,2027)]);
M('Audi','A6',2018,2027,'berline',[E('40 TFSI 204',204,'essence','EA888',2018,2027),E('45 TFSI 265',265,'essence','EA888',2018,2027),E('55 TFSI 340',340,'essence','EA839',2018,2027),E('40 TDI 204',204,'diesel','EA288EVO',2018,2027),E('50 TDI 286',286,'diesel','EA897',2018,2027),E('50 TFSI e 299',299,'hybride','EA888H',2019,2027),E('55 TFSI e 367',367,'hybride','EA839H',2019,2027)]);
M('Audi','A6 e-tron',2024,2027,'berline',[E('Performance 367',367,'electrique','PPE',2024,2027),E('S6 503',503,'electrique','PPE',2024,2027)]);
M('Audi','Q2',2016,2027,'SUV',[E('30 TFSI 110',110,'essence','EA211',2016,2023),E('35 TFSI 150',150,'essence','EA211EVO',2016,2027),E('30 TDI 116',116,'diesel','EA288',2016,2023),E('SQ2 300',300,'essence','EA888',2018,2023)]);
M('Audi','Q3',2018,2027,'SUV',[E('35 TFSI 150',150,'essence','EA211EVO',2018,2027),E('40 TFSI 190',190,'essence','EA888',2018,2023),E('45 TFSI 245',245,'essence','EA888',2018,2027),E('35 TDI 150',150,'diesel','EA288',2018,2027),E('RS Q3 400',400,'essence','EA855',2019,2027),E('45 TFSI e 245',245,'hybride','EA211H',2020,2023)]);
M('Audi','Q5',2017,2027,'SUV',[E('40 TFSI 204',204,'essence','EA888',2017,2027),E('45 TFSI 265',265,'essence','EA888',2017,2027),E('40 TDI 204',204,'diesel','EA288EVO',2017,2027),E('50 TDI 286',286,'diesel','EA897',2017,2027),E('50 TFSI e 299',299,'hybride','EA888H',2019,2027)]);
M('Audi','Q7',2015,2027,'SUV 7pl',[E('45 TDI 231',231,'diesel','EA897',2015,2023),E('50 TDI 286',286,'diesel','EA897',2015,2027),E('55 TFSI 340',340,'essence','EA839',2015,2027),E('SQ7 4.0 TDI 435',435,'diesel','EA898',2016,2020),E('55 TFSI e 381',381,'hybride','EA839H',2019,2027)]);
M('Audi','Q8',2018,2027,'SUV coupé',[E('50 TDI 286',286,'diesel','EA897',2018,2027),E('55 TFSI 340',340,'essence','EA839',2018,2027),E('SQ8 4.0 TDI 435',435,'diesel','EA898',2019,2023),E('RS Q8 600',600,'essence','EA825',2019,2027),E('55 TFSI e 381',381,'hybride','EA839H',2019,2027)]);
M('Audi','e-tron GT',2021,2027,'GT',[E('quattro 476',476,'electrique','J1',2021,2027),E('RS 646',646,'electrique','J1',2021,2027),E('RS Performance 925',925,'electrique','J1',2024,2027)]);
M('Audi','TT',2014,2023,'coupé',[E('40 TFSI 197',197,'essence','EA888',2014,2023),E('45 TFSI 245',245,'essence','EA888',2014,2023),E('TTS 310',310,'essence','EA888',2014,2023),E('TT RS 400',400,'essence','EA855',2016,2023)]);
M('Skoda','Citigo',2012,2020,'citadine',[E('1.0 MPI 60',60,'essence','EA211',2012,2020),E('1.0 MPI 75',75,'essence','EA211',2012,2020),E('Citigo-e iV 83',83,'electrique','EV',2019,2020)]);
M('Skoda','Rapid',2012,2019,'berline',[E('1.0 TSI 95',95,'essence','EA211',2017,2019),E('1.2 TSI 90',90,'essence','EA211',2012,2017),E('1.4 TSI 125',125,'essence','EA211',2015,2019),E('1.6 TDI 116',116,'diesel','EA288',2015,2019)]);
M('Skoda','Kamiq',2019,2027,'SUV',[E('1.0 TSI 95',95,'essence','EA211',2019,2027),E('1.0 TSI 110',110,'essence','EA211',2019,2023),E('1.5 TSI 150',150,'essence','EA211EVO',2019,2027)]);
M('Skoda','Scala',2019,2027,'berline',[E('1.0 TSI 95',95,'essence','EA211',2019,2027),E('1.0 TSI 110',110,'essence','EA211',2019,2023),E('1.5 TSI 150',150,'essence','EA211EVO',2019,2027)]);
M('Skoda','Karoq',2017,2027,'SUV',[E('1.0 TSI 115',115,'essence','EA211',2017,2020),E('1.5 TSI 150',150,'essence','EA211EVO',2017,2027),E('2.0 TSI 190',190,'essence','EA888',2018,2020),E('2.0 TDI 115',115,'diesel','EA288',2017,2023),E('2.0 TDI 150',150,'diesel','EA288',2017,2023)]);
M('Skoda','Kodiaq',2016,2027,'SUV 7pl',[E('1.4 TSI 150',150,'essence','EA211',2016,2020),E('1.5 TSI 150',150,'essence','EA211EVO',2018,2023),E('2.0 TSI 190',190,'essence','EA888',2016,2023),E('2.0 TSI 245 RS',245,'essence','EA888',2018,2023),E('2.0 TDI 150',150,'diesel','EA288',2016,2023),E('2.0 TDI 200',200,'diesel','EA288',2019,2023),E('1.5 iV 204',204,'hybride','EA211H',2024,2027)]);
M('Skoda','Enyaq',2021,2027,'SUV',[E('60 179',179,'electrique','MEB',2021,2023),E('80 204',204,'electrique','MEB',2021,2023),E('85 286',286,'electrique','MEB',2023,2027),E('85x 286',286,'electrique','MEB',2023,2027),E('RS 340',340,'electrique','MEB',2023,2027)]);
M('Skoda','Elroq',2024,2027,'SUV',[E('50 170',170,'electrique','MEB',2024,2027),E('60 204',204,'electrique','MEB',2024,2027),E('85 286',286,'electrique','MEB',2024,2027)]);
M('Skoda','Superb',2015,2027,'berline',[E('1.4 TSI 150',150,'essence','EA211',2015,2020),E('1.5 TSI 150',150,'essence','EA211EVO',2018,2023),E('2.0 TSI 272',272,'essence','EA888',2015,2020),E('2.0 TSI 265',265,'essence','EA888',2024,2027),E('2.0 TDI 150',150,'diesel','EA288',2015,2023),E('2.0 TDI 193',193,'diesel','EA288',2019,2023),E('1.4 iV 218',218,'hybride','EA211H',2019,2023)]);
M('SEAT','Mii',2012,2020,'citadine',[E('1.0 MPI 60',60,'essence','EA211',2012,2020),E('1.0 MPI 75',75,'essence','EA211',2012,2020),E('Mii electric 83',83,'electrique','EV',2019,2020)]);
M('SEAT','Toledo',2012,2019,'berline',[E('1.0 TSI 95',95,'essence','EA211',2017,2019),E('1.2 TSI 90',90,'essence','EA211',2012,2017),E('1.4 TSI 125',125,'essence','EA211',2015,2019),E('1.6 TDI 116',116,'diesel','EA288',2015,2019)]);
M('SEAT','Alhambra',2010,2020,'monospace',[E('1.4 TSI 150',150,'essence','EA211',2010,2020),E('2.0 TSI 200',200,'essence','EA888',2010,2020),E('2.0 TDI 150',150,'diesel','EA288',2010,2020),E('2.0 TDI 184',184,'diesel','EA288',2015,2020)]);
M('SEAT','Tarraco',2018,2027,'SUV 7pl',[E('1.5 TSI 150',150,'essence','EA211EVO',2018,2027),E('2.0 TSI 190',190,'essence','EA888',2018,2023),E('2.0 TDI 150',150,'diesel','EA288',2018,2023),E('2.0 TDI 200',200,'diesel','EA288',2019,2023),E('1.4 e-Hybrid 245',245,'hybride','EA211H',2021,2027)]);
M('Cupra','Ateca',2018,2027,'SUV',[E('2.0 TSI 300',300,'essence','EA888',2018,2023),E('2.0 TSI 333',333,'essence','EA888',2023,2027),E('1.5 TSI 150',150,'essence','EA211EVO',2020,2027),E('1.4 e-Hybrid 245',245,'hybride','EA211H',2021,2027)]);
M('Cupra','Born',2021,2027,'berline',[E('150 kW 204',204,'electrique','MEB',2021,2027),E('170 kW 231',231,'electrique','MEB',2022,2027),E('VZ 240 kW 326',326,'electrique','MEB',2024,2027)]);
M('Cupra','Tavascan',2024,2027,'SUV coupé',[E('V1 286',286,'electrique','MEB',2024,2027),E('V2 340',340,'electrique','MEB',2024,2027)]);
M('Cupra','Raval',2026,2027,'citadine',[E('EV 226',226,'electrique','MEB',2026,2027)]);
M('Land Rover','Discovery Sport',2015,2027,'SUV',[E('2.0 D150',150,'diesel','AJ200D',2015,2023),E('2.0 D165',163,'diesel','AJ200D',2019,2023),E('2.0 D180',180,'diesel','AJ200D',2015,2023),E('2.0 D200',204,'diesel','AJ200D',2019,2027),E('2.0 P200',200,'essence','AJ200P',2017,2027),E('2.0 P250',249,'essence','AJ200P',2019,2027),E('2.0 P300',300,'essence','AJ200P',2019,2023),E('1.5 P300e',309,'hybride','AJ150PHEV',2020,2027)]);
M('Land Rover','Discovery',2017,2027,'SUV 7pl',[E('3.0 TD6',258,'diesel','AJV6D',2017,2020),E('3.0 SDV6',306,'diesel','AJV6D',2017,2020),E('3.0 D250',249,'diesel','AJ300D',2020,2027),E('3.0 D300',300,'diesel','AJ300D',2020,2027),E('3.0 P360',360,'essence','AJ300P',2020,2027),E('2.0 P300',300,'essence','AJ200P',2017,2023),E('5.0 P525',525,'essence','AJ133',2021,2022)]);
M('Range Rover','Range Rover',2013,2027,'SUV luxe',[E('3.0 TDV6',258,'diesel','AJV6D',2013,2020),E('3.0 SDV6',275,'diesel','AJV6D',2013,2020),E('4.4 SDV8',339,'diesel','AJV8D',2013,2020),E('5.0 P525',525,'essence','AJ133',2013,2022),E('5.0 P565 SV',565,'essence','AJ133',2018,2022),E('3.0 D250',249,'diesel','AJ300D',2020,2027),E('3.0 D300',300,'diesel','AJ300D',2020,2027),E('3.0 D350',350,'diesel','AJ300D',2022,2027),E('3.0 P400',400,'essence','AJ300P',2020,2027),E('4.4 P530',530,'essence','N63',2022,2027),E('4.4 P615 SV',615,'essence','N63',2023,2027),E('3.0 P440e',440,'hybride','AJ300PHEV',2022,2027),E('3.0 P550e',550,'hybride','AJ300PHEV',2023,2027)]);
M('Range Rover','Range Rover Sport',2013,2027,'SUV sport',[E('3.0 SDV6',306,'diesel','AJV6D',2013,2020),E('5.0 P575 SVR',575,'essence','AJ133',2018,2022),E('3.0 D250',249,'diesel','AJ300D',2020,2027),E('3.0 D300',300,'diesel','AJ300D',2020,2027),E('3.0 D350',350,'diesel','AJ300D',2022,2027),E('3.0 P400',400,'essence','AJ300P',2020,2027),E('4.4 P635 SV',635,'essence','S68',2024,2027),E('3.0 P460e',460,'hybride','AJ300PHEV',2023,2027),E('3.0 P550e',550,'hybride','AJ300PHEV',2023,2027)]);
M('Range Rover','Range Rover Velar',2017,2027,'SUV coupé',[E('2.0 D180',180,'diesel','AJ200D',2017,2020),E('2.0 D200',204,'diesel','AJ200D',2019,2023),E('2.0 D240',240,'diesel','AJ200D',2017,2023),E('2.0 P250',250,'essence','AJ200P',2017,2027),E('2.0 P300',300,'essence','AJ200P',2017,2023),E('3.0 D300',300,'diesel','AJV6D',2017,2020),E('3.0 P400',400,'essence','AJ300P',2020,2027),E('5.0 P550 SV',550,'essence','AJ133',2019,2020),E('2.0 P400e',404,'hybride','AJ200PHEV',2020,2027)]);
M('Range Rover','Range Rover Evoque',2019,2027,'SUV compact',[E('2.0 D150',150,'diesel','AJ200D',2019,2023),E('2.0 D165',163,'diesel','AJ200D',2019,2023),E('2.0 D200',204,'diesel','AJ200D',2019,2023),E('2.0 P200',200,'essence','AJ200P',2019,2027),E('2.0 P250',249,'essence','AJ200P',2019,2027),E('2.0 P300',300,'essence','AJ200P',2019,2023),E('1.5 P300e',309,'hybride','AJ150PHEV',2020,2027)]);
M('Land Rover','Defender',2020,2027,'SUV tout-terrain',[E('2.0 P300',300,'essence','AJ200P',2020,2027),E('2.0 D200',200,'diesel','AJ300D',2020,2023),E('2.0 D240',240,'diesel','AJ300D',2020,2023),E('3.0 D250',249,'diesel','AJ300D',2023,2027),E('3.0 D300',300,'diesel','AJ300D',2023,2027),E('3.0 D350',350,'diesel','AJ300D',2024,2027),E('3.0 P400',400,'essence','AJ300P',2020,2027),E('5.0 P525 V8',525,'essence','AJ133',2021,2024),E('4.4 P635 OCTA',635,'essence','S68',2024,2027),E('2.0 P400e',404,'hybride','AJ200PHEV',2021,2027)]);
M('Tesla','Model 3',2019,2027,'berline',[E('Standard Range Plus 283',283,'electrique','EV',2019,2021),E('RWD 283',283,'electrique','EV',2023,2027),E('Long Range AWD 440',440,'electrique','EV',2019,2023),E('Long Range AWD 498',498,'electrique','EV',2023,2027),E('Performance 513',513,'electrique','EV',2019,2023),E('Performance 460',460,'electrique','EV',2024,2027)]);
M('Tesla','Model Y',2021,2027,'SUV',[E('RWD 299',299,'electrique','EV',2022,2027),E('Long Range AWD 440',440,'electrique','EV',2021,2023),E('Long Range AWD 514',514,'electrique','EV',2023,2027),E('Performance 534',534,'electrique','EV',2022,2027)]);
M('Tesla','Model S',2013,2027,'berline',[E('75D 333',333,'electrique','EV',2016,2019),E('100D 422',422,'electrique','EV',2017,2019),E('P100D 613',613,'electrique','EV',2016,2019),E('Long Range 670',670,'electrique','EV',2021,2027),E('Plaid 1020',1020,'electrique','EV',2021,2027)]);
M('Tesla','Model X',2016,2027,'SUV',[E('75D 333',333,'electrique','EV',2016,2019),E('100D 422',422,'electrique','EV',2017,2019),E('P100D 613',613,'electrique','EV',2016,2019),E('Long Range 670',670,'electrique','EV',2021,2027),E('Plaid 1020',1020,'electrique','EV',2021,2027)]);
/* aliases marques */
alias('infinity','Infiniti');alias('infiniti','Infiniti');alias('jaecco','Jaecoo');alias('jaecoo','Jaecoo');
alias('lynk and co','Lynk & Co');alias('lynk co','Lynk & Co');alias('lynk&co','Lynk & Co');
alias('range rover','Land Rover');alias('landrover','Land Rover');alias('vw','Volkswagen');
alias('mercedes','Mercedes-Benz');alias('alfa','Alfa Romeo');alias('aston','Aston Martin');
alias('lambo','Lamborghini');alias('cupra','Cupra');alias('xpeng','XPeng');
/* verrous famille */
var LK={
 W16:['Bugatti'],V16H:['Bugatti'],V10L:['Lamborghini'],V12L:['Lamborghini'],V12LH:['Lamborghini'],
 EA825:['Lamborghini','Porsche','Audi','Bentley'],EA825H:['Lamborghini','Porsche','Audi'],
 AMV12:['Aston Martin'],M177:['Aston Martin','Mercedes-Benz'],M177H:['Aston Martin','Mercedes-Benz'],
 M270:['Mercedes-Benz','Infiniti'],M274:['Mercedes-Benz','Infiniti'],M254:['Mercedes-Benz'],M256:['Mercedes-Benz'],
 M176:['Mercedes-Benz'],M139:['Mercedes-Benz'],OM656:['Mercedes-Benz'],OM654:['Mercedes-Benz'],OM651:['Mercedes-Benz','Infiniti'],
 VR30:['Nissan','Infiniti'],VR38:['Nissan'],VQ35:['Nissan','Infiniti'],VQ35H:['Nissan','Infiniti'],VQ37:['Nissan','Infiniti'],
 VK50:['Nissan','Infiniti'],V9X:['Nissan','Infiniti','Renault'],KR20:['Nissan','Infiniti'],YS23:['Nissan','Renault'],
 PE:['Mazda'],PY:['Mazda'],PYH:['Mazda'],SH:['Mazda'],S8:['Mazda'],SKYX:['Mazda'],T3:['Mazda'],ROTARY:['Mazda'],
 THS:['Toyota','Lexus','Suzuki','Mazda'],AR:['Toyota','Lexus'],ZR:['Toyota','Lexus'],NR:['Toyota','Lexus'],
 GR:['Toyota','Lexus'],G16E:['Toyota'],T24A:['Toyota'],A25A:['Toyota','Lexus'],M20A:['Toyota','Lexus'],
 '8AR':['Lexus','Toyota'],'1ND':['Toyota'],GD:['Toyota'],AD:['Toyota'],KD:['Toyota'],ND:['Toyota'],
 L13:['Honda'],L15:['Honda','Acura'],K20:['Honda','Acura'],K24:['Honda','Acura'],N16:['Honda'],N22:['Honda'],IMMD:['Honda'],
 K10:['Suzuki'],K12:['Suzuki'],K14:['Suzuki'],K15:['Suzuki'],M16:['Suzuki'],D19:['Suzuki','Fiat'],
 '4A92':['Mitsubishi'],'4B11':['Mitsubishi'],'4B12':['Mitsubishi'],'4B40':['Mitsubishi'],'4N14':['Mitsubishi'],'4N15':['Mitsubishi'],
 '4B11PHEV':['Mitsubishi'],'4B12PHEV':['Mitsubishi'],'3A90':['Mitsubishi'],'3A92':['Mitsubishi'],
 FB16:['Subaru'],FB20:['Subaru'],FB20H:['Subaru'],FB25:['Subaru'],FA20:['Subaru','Toyota'],FA24:['Subaru'],EE20:['Subaru'],
 KAPPA:['Hyundai','Kia'],GAMMA:['Hyundai','Kia'],SMARTSTREAM:['Hyundai','Kia'],THETA:['Hyundai','Kia'],
 U2:['Hyundai','Kia'],D4HA:['Hyundai','Kia'],D4HB:['Hyundai','Kia'],EGMP:['Hyundai','Kia','Genesis'],
 '9A1':['Porsche'],'9A2':['Porsche'],MA2:['Porsche'],EA839:['Porsche','Audi'],EA839H:['Porsche','Audi'],
 J1:['Porsche','Audi'],PPE:['Porsche','Audi'],MEB:['Volkswagen','Audi','Skoda','Cupra','SEAT','Ford'],
 EA855:['Audi'],EA897:['Audi','Volkswagen','Porsche'],EA898:['Audi','Volkswagen','Porsche'],EA288EVO:['Volkswagen','Audi','Skoda','SEAT'],
 B38:['BMW','MINI'],B48:['BMW','MINI','Toyota'],B58:['BMW','Toyota'],B47:['BMW','MINI'],B57:['BMW'],
 N63:['BMW','Land Rover','Range Rover'],S68:['BMW','Land Rover','Range Rover'],B48H:['BMW'],B58H:['BMW'],REX:['BMW'],
 VEA:['Volvo','Polestar','Lynk & Co'],VEAH:['Volvo','Polestar'],
 AJ200D:['Jaguar','Land Rover','Range Rover'],AJ200P:['Jaguar','Land Rover','Range Rover'],
 AJ300D:['Jaguar','Land Rover','Range Rover'],AJ300P:['Jaguar','Land Rover','Range Rover'],
 AJ133:['Jaguar','Land Rover','Range Rover'],AJV6D:['Jaguar','Land Rover','Range Rover'],AJV8D:['Land Rover','Range Rover'],
 AJ150PHEV:['Jaguar','Land Rover','Range Rover'],AJ200PHEV:['Jaguar','Land Rover','Range Rover'],AJ300PHEV:['Land Rover','Range Rover'],
 FIRE:['Fiat','Alfa Romeo','Lancia','Abarth','Jeep'],MJET:['Fiat','Alfa Romeo','Lancia','Jeep','Opel','Suzuki'],
 MJET2:['Fiat','Jeep','Opel'],GME:['Alfa Romeo','Jeep','Fiat'],GMEH:['Jeep','Alfa Romeo'],
 '690T':['Alfa Romeo'],TBi:['Alfa Romeo'],PENTASTAR:['Jeep','Chrysler','Lancia','Dodge'],
 HEMI:['Jeep','Dodge','Chrysler'],VM:['Jeep','Lancia','Land Rover'],TIGERSHARK:['Jeep','Chrysler'],
 M5Pt:['Renault','Alpine'],SQRF4J16:['Chery','Omoda','Jaecoo'],SQRF4J20:['Chery','Jaecoo'],
 SQRE4T15:['Chery','Omoda'],SQRE4T15C:['Chery','Omoda'],DHT:['Chery','Omoda','Jaecoo','Geely','Lynk & Co'],
 JLH3G15:['Geely','Lynk & Co'],JLC4G15:['Geely'],VEP4:['Geely','Lynk & Co'],VEP4H:['Lynk & Co','Geely'],
 '15S4C':['MG'],'10E4E':['MG'],'15E4E':['MG'],'20L4E':['MG'],DMi:['BYD'],EREV:['BYD','Leapmotor'],REEV:['Leapmotor'],
 EV:['*']};
if(C.LOCK)Object.keys(LK).forEach(function(k){C.LOCK[k]=LK[k]});
try{C.purge()}catch(e){}
DONE=true;window.KFMega2Catalog={ok:true,makes:Object.keys(CAT).length};return true}
function boot(){if(apply())return;var n=0,t=setInterval(function(){n++;if(apply()||n>80)clearInterval(t)},150)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
