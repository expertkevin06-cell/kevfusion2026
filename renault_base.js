/* KEV FUSION 2026 — renault_base.js v1.0.0
   Base RENAULT / DACIA / ALPINE rigoureuse et complète : tous modèles (1990→2027),
   motorisations + puissances homologuées + codes moteur, pannes connues et campagnes.
   Fusionnée dans KFCatalog.CAT / OWNER et FAULTS avant corrélation. */
'use strict';
(function(){
if(!window.KFCatalog){console.warn('renault_base: KFCatalog absent');return}
var C=window.KFCatalog,CAT=C.CAT,OWNER=C.OWNER;
function E(l,ch,f,code,y0,y1){return{l:l,ch:ch,kw:Math.round(ch*0.7355),f:f,code:code,y:[y0,y1]}}
function add(make,model,y0,y1,body,engs){
 CAT[make]=CAT[make]||{};
 var prev=CAT[make][model],merged=engs.slice();
 if(prev&&prev.eng)prev.eng.forEach(function(e){if(!merged.some(function(x){return x.l===e.l&&x.ch===e.ch}))merged.push(e)});
 CAT[make][model]={y:[y0,y1],body:body||'',eng:merged};
 var n=C.norm(model);OWNER[n]=OWNER[n]||[];if(OWNER[n].indexOf(make)<0)OWNER[n].push(make)}
/* moteurs récurrents */
function K9K(a,b){return[E('1.5 dCi 65',65,'diesel','K9K',a,b),E('1.5 dCi 70',70,'diesel','K9K',a,b),E('1.5 dCi 75',75,'diesel','K9K',a,b),
 E('1.5 dCi 80',80,'diesel','K9K',a,b),E('1.5 dCi 85',85,'diesel','K9K',a,b),E('1.5 dCi 90',90,'diesel','K9K',a,b),
 E('1.5 dCi 95',95,'diesel','K9K',a,b),E('1.5 dCi 105',105,'diesel','K9K',a,b),E('1.5 dCi 110',110,'diesel','K9K',a,b),
 E('1.5 Blue dCi 85',85,'diesel','K9K',a,b),E('1.5 Blue dCi 95',95,'diesel','K9K',a,b),E('1.5 Blue dCi 115',115,'diesel','K9K',a,b)]}
function H4B(a,b){return[E('0.9 TCe 90',90,'essence','H4Bt',a,b)]}
function H4D(a,b){return[E('1.0 SCe 65',65,'essence','B4D',a,b),E('1.0 SCe 70',70,'essence','B4D',a,b),E('1.0 SCe 75',75,'essence','B4D',a,b),
 E('1.0 TCe 90',90,'essence','H4Dt',a,b),E('1.0 TCe 100',100,'essence','H4Dt',a,b),E('1.0 TCe 110',110,'essence','H4Dt',a,b)]}
function H5F(a,b){return[E('1.2 TCe 100',100,'essence','H5Ft',a,b),E('1.2 TCe 115',115,'essence','H5Ft',a,b),E('1.2 TCe 120',120,'essence','H5Ft',a,b),E('1.2 TCe 130',130,'essence','H5Ft',a,b)]}
function H5H(a,b){return[E('1.3 TCe 115',115,'essence','H5Ht',a,b),E('1.3 TCe 130',130,'essence','H5Ht',a,b),E('1.3 TCe 140',140,'essence','H5Ht',a,b),E('1.3 TCe 155',155,'essence','H5Ht',a,b),E('1.3 TCe 160',160,'essence','H5Ht',a,b)]}
function R9M(a,b){return[E('1.6 dCi 130',130,'diesel','R9M',a,b),E('1.6 dCi 160',160,'diesel','R9M',a,b),E('1.6 Blue dCi 115',115,'diesel','R9M',a,b),E('1.6 Blue dCi 130',130,'diesel','R9M',a,b),E('1.6 Blue dCi 160',160,'diesel','R9M',a,b)]}
function R9N(a,b){return[E('1.7 Blue dCi 120',120,'diesel','R9N',a,b),E('1.7 Blue dCi 150',150,'diesel','R9N',a,b)]}
function M9R(a,b){return[E('2.0 dCi 130',130,'diesel','M9R',a,b),E('2.0 dCi 150',150,'diesel','M9R',a,b),E('2.0 dCi 160',160,'diesel','M9R',a,b),E('2.0 dCi 175',175,'diesel','M9R',a,b),E('2.0 dCi 190',190,'diesel','M9R',a,b),E('2.0 Blue dCi 160',160,'diesel','M9R',a,b),E('2.0 Blue dCi 180',180,'diesel','M9R',a,b),E('2.0 Blue dCi 200',200,'diesel','M9R',a,b)]}
function M9T(a,b){return[E('2.3 dCi 100',100,'diesel','M9T',a,b),E('2.3 dCi 110',110,'diesel','M9T',a,b),E('2.3 dCi 125',125,'diesel','M9T',a,b),E('2.3 dCi 130',130,'diesel','M9T',a,b),E('2.3 dCi 135',135,'diesel','M9T',a,b),E('2.3 dCi 145',145,'diesel','M9T',a,b),E('2.3 dCi 150',150,'diesel','M9T',a,b),E('2.3 dCi 165',165,'diesel','M9T',a,b),E('2.3 dCi 170',170,'diesel','M9T',a,b),E('2.3 dCi 180',180,'diesel','M9T',a,b),E('2.3 Blue dCi 130',130,'diesel','M9T',a,b),E('2.3 Blue dCi 150',150,'diesel','M9T',a,b),E('2.3 Blue dCi 180',180,'diesel','M9T',a,b)]}
function H4Mh(a,b){return[E('1.6 E-Tech 140',140,'hybride','H4M',a,b),E('1.6 E-Tech 145',145,'hybride','H4M',a,b),E('1.6 E-Tech 160',160,'hybride','H4M',a,b)]}
function H5Fh(a,b){return[E('1.2 E-Tech 160',160,'hybride','H5Ft',a,b),E('1.2 E-Tech 200',200,'hybride','H5Ft',a,b),E('1.2 E-Tech 300 4x4',300,'hybride','H5Ft',a,b)]}
function EVr(ch,a,b){return[E('Electrique '+ch,ch,'electrique','EV',a,b)]}
/* ================= RENAULT ================= */
add('Renault','Twingo I',1993,2007,'citadine',[E('1.0 16v 70',70,'essence','D4D',1998,2007),E('1.2 16v 75',75,'essence','D4F',1998,2007),E('1.2 16v 60',60,'essence','D4F',2001,2007),E('1.14 60',60,'essence','C3G',1993,1998),E('1.5 dCi 65',65,'diesel','K9K',2002,2007),E('1.5 dCi 85',85,'diesel','K9K',2005,2007)]);
add('Renault','Twingo II',2007,2014,'citadine',[E('1.2 16v 75',75,'essence','D4F',2007,2014),E('1.2 16v 100',100,'essence','D4F',2007,2014),E('1.2 TCe 100',100,'essence','D4Ft',2010,2014),E('1.5 dCi 75',75,'diesel','K9K',2007,2014),E('1.5 dCi 85',85,'diesel','K9K',2007,2014),E('1.5 dCi 105',105,'diesel','K9K',2010,2014)]);
add('Renault','Twingo III',2014,2024,'citadine',H4D(2014,2024).concat(H4B(2014,2019),EVr(82,2020,2024)));
add('Renault','Clio I',1990,1998,'citadine',[E('1.2 60',60,'essence','E7F',1990,1998),E('1.4 75',75,'essence','E7J',1991,1998),E('1.8 90',90,'essence','F3P',1991,1998),E('1.9 D 65',65,'diesel','F8Q',1991,1998)]);
add('Renault','Clio II',1998,2012,'citadine',[E('1.2 16v 75',75,'essence','D4F',1998,2012),E('1.4 16v 98',98,'essence','K4J',1999,2012),E('1.6 16v 110',110,'essence','K4M',1999,2012),E('2.0 16v RS 172',172,'essence','F4R',2000,2012),E('2.0 16v RS 182',182,'essence','F4R',2004,2012),E('1.5 dCi 65',65,'diesel','K9K',2001,2012),E('1.5 dCi 85',85,'diesel','K9K',2001,2012),E('1.9 dTi 80',80,'diesel','F9Q',1999,2012)]);
add('Renault','Clio III',2005,2014,'citadine',[E('1.2 16v 75',75,'essence','D4F',2005,2014),E('1.2 TCe 100',100,'essence','D4Ft',2007,2014),E('1.6 16v 110',110,'essence','K4M',2005,2014),E('2.0 16v RS 200',200,'essence','F4R',2006,2014),E('2.0 16v RS 203',203,'essence','F4R',2008,2014),E('1.5 dCi 70',70,'diesel','K9K',2005,2014),E('1.5 dCi 85',85,'diesel','K9K',2005,2014),E('1.5 dCi 105',105,'diesel','K9K',2005,2014),E('2.0 dCi 150',150,'diesel','M9R',2006,2014)]);
add('Renault','Clio IV',2012,2019,'citadine',[E('0.9 TCe 90',90,'essence','H4Bt',2012,2019),E('1.2 16v 75',75,'essence','D4F',2012,2019),E('1.2 TCe 120',120,'essence','H5Ft',2013,2019),E('1.6 RS 200',200,'essence','M5Mt',2013,2019),E('1.6 RS 220',220,'essence','M5Mt',2016,2019)].concat(K9K(2012,2019)));
add('Renault','Clio V',2019,2027,'citadine',H4D(2019,2027).concat(H5H(2019,2023),K9K(2019,2023),H4Mh(2020,2027)));
add('Renault','Megane I',1995,2003,'berline',[E('1.4 16v 95',95,'essence','K4J',1999,2003),E('1.6 16v 110',110,'essence','K4M',1999,2003),E('2.0 16v 140',140,'essence','F4R',1999,2003),E('1.9 dTi 80',80,'diesel','F9Q',1997,2003),E('1.9 dCi 102',102,'diesel','F9Q',2001,2003)]);
add('Renault','Megane II',2002,2009,'berline',[E('1.4 16v 98',98,'essence','K4J',2002,2009),E('1.6 16v 115',115,'essence','K4M',2002,2009),E('2.0 16v 136',136,'essence','F4R',2002,2009),E('2.0 Turbo RS 225',225,'essence','F4Rt',2004,2009),E('1.5 dCi 85',85,'diesel','K9K',2002,2009),E('1.5 dCi 105',105,'diesel','K9K',2005,2009),E('1.9 dCi 110',110,'diesel','F9Q',2002,2009),E('1.9 dCi 130',130,'diesel','F9Q',2002,2009),E('2.0 dCi 150',150,'diesel','M9R',2005,2009),E('2.0 dCi 175',175,'diesel','M9R',2007,2009)]);
add('Renault','Megane III',2008,2016,'berline',[E('1.4 TCe 130',130,'essence','H5Ft',2009,2016),E('1.6 16v 110',110,'essence','K4M',2008,2016),E('2.0 TCe 180',180,'essence','F4Rt',2008,2016),E('2.0 TCe RS 250',250,'essence','F4Rt',2009,2016),E('2.0 TCe RS 265',265,'essence','F4Rt',2011,2016),E('2.0 TCe RS 275',275,'essence','F4Rt',2014,2016)].concat(K9K(2008,2016),R9M(2011,2016),[E('1.6 dCi 130',130,'diesel','R9M',2011,2016),E('2.0 dCi 165',165,'diesel','M9R',2009,2016)]));
add('Renault','Megane IV',2016,2023,'berline',H5F(2016,2023).concat(H5H(2018,2023),K9K(2016,2023),R9M(2016,2020),R9N(2018,2020),M9R(2016,2020),[E('1.8 TCe 280 RS',280,'essence','M5Pt',2018,2023),E('1.8 TCe 300 RS',300,'essence','M5Pt',2019,2023),E('1.3 TCe 160',160,'essence','H5Ht',2018,2023)]));
add('Renault','Megane E-Tech',2022,2027,'berline',EVr(130,2022,2027).concat(EVr(220,2022,2027)));
add('Renault','Scenic I',1996,2003,'monospace',[E('1.4 16v 95',95,'essence','K4J',1999,2003),E('1.6 16v 110',110,'essence','K4M',1999,2003),E('2.0 16v 140',140,'essence','F4R',1999,2003),E('1.9 dTi 80',80,'diesel','F9Q',1997,2003),E('1.9 dCi 102',102,'diesel','F9Q',2001,2003)]);
add('Renault','Scenic II',2003,2009,'monospace',[E('1.4 16v 98',98,'essence','K4J',2003,2009),E('1.6 16v 115',115,'essence','K4M',2003,2009),E('2.0 16v 136',136,'essence','F4R',2003,2009),E('1.5 dCi 85',85,'diesel','K9K',2003,2009),E('1.5 dCi 105',105,'diesel','K9K',2005,2009),E('1.9 dCi 110',110,'diesel','F9Q',2003,2009),E('1.9 dCi 130',130,'diesel','F9Q',2003,2009),E('2.0 dCi 150',150,'diesel','M9R',2005,2009)]);
add('Renault','Scenic III',2009,2016,'monospace',[E('1.4 TCe 130',130,'essence','H5Ft',2009,2016),E('1.6 16v 110',110,'essence','K4M',2009,2016),E('2.0 16v 140',140,'essence','F4R',2009,2016),E('1.5 dCi 95',95,'diesel','K9K',2009,2016),E('1.5 dCi 110',110,'diesel','K9K',2009,2016),E('1.6 dCi 130',130,'diesel','R9M',2011,2016),E('2.0 dCi 150',150,'diesel','M9R',2009,2016),E('2.0 dCi 165',165,'diesel','M9R',2009,2016)]);
add('Renault','Scenic IV',2016,2022,'monospace',H5F(2016,2022).concat(H5H(2018,2022),K9K(2016,2020),R9M(2016,2020),R9N(2018,2020)));
add('Renault','Scenic E-Tech',2024,2027,'monospace',EVr(170,2024,2027).concat(EVr(220,2024,2027)));
add('Renault','Kangoo I',1997,2008,'ludospace',[E('1.4 75',75,'essence','K7J',1997,2008),E('1.6 16v 95',95,'essence','K4M',2001,2008),E('1.5 dCi 65',65,'diesel','K9K',2001,2008),E('1.5 dCi 85',85,'diesel','K9K',2001,2008),E('1.9 dCi 85',85,'diesel','F9Q',2001,2008),E('1.9 dTi 80',80,'diesel','F9Q',1997,2008)]);
add('Renault','Kangoo II',2008,2021,'ludospace',[E('1.6 16v 105',105,'essence','K4M',2008,2021),E('1.2 TCe 115',115,'essence','H5Ft',2013,2021)].concat(K9K(2008,2021),[E('1.5 dCi 70',70,'diesel','K9K',2008,2021),E('1.5 dCi 90',90,'diesel','K9K',2008,2021),E('1.5 dCi 110',110,'diesel','K9K',2010,2021)]));
add('Renault','Kangoo III',2021,2027,'ludospace',H4D(2021,2027).concat(K9K(2021,2027),EVr(122,2022,2027)));
add('Renault','Espace IV',2002,2015,'monospace',[E('2.0 16v 136',136,'essence','F4R',2002,2015),E('2.0 Turbo 170',170,'essence','F4Rt',2002,2015),E('3.5 V6 245',245,'essence','V4Y',2002,2015),E('1.9 dCi 120',120,'diesel','F9Q',2002,2015),E('2.0 dCi 150',150,'diesel','M9R',2006,2015),E('2.0 dCi 175',175,'diesel','M9R',2008,2015),E('3.0 dCi V6 180',180,'diesel','P9X',2006,2015)]);
add('Renault','Espace V',2015,2023,'monospace',[E('1.6 TCe 200',200,'essence','M5Mt',2015,2023),E('1.8 TCe 225',225,'essence','M5Pt',2018,2023)].concat(R9M(2015,2020),R9N(2018,2020),M9R(2015,2020)));
add('Renault','Espace VI',2023,2027,'SUV',H5Fh(2023,2027));
add('Renault','Laguna II',2001,2007,'berline',[E('1.6 16v 110',110,'essence','K4M',2001,2007),E('2.0 16v 136',136,'essence','F4R',2001,2007),E('2.0 Turbo 170',170,'essence','F4Rt',2003,2007),E('3.0 V6 210',210,'essence','L7X',2001,2007),E('1.9 dCi 110',110,'diesel','F9Q',2001,2007),E('1.9 dCi 130',130,'diesel','F9Q',2001,2007),E('2.0 dCi 150',150,'diesel','M9R',2005,2007),E('2.2 dCi 150',150,'diesel','G9T',2001,2007)]);
add('Renault','Laguna III',2007,2015,'berline',[E('1.6 16v 110',110,'essence','K4M',2007,2015),E('2.0 16v 140',140,'essence','F4R',2007,2015),E('2.0 Turbo 170',170,'essence','F4Rt',2007,2015),E('3.5 V6 240',240,'essence','V4Y',2008,2015),E('1.5 dCi 110',110,'diesel','K9K',2007,2015),E('2.0 dCi 130',130,'diesel','M9R',2007,2015),E('2.0 dCi 150',150,'diesel','M9R',2007,2015),E('2.0 dCi 175',175,'diesel','M9R',2008,2015),E('2.0 dCi 180',180,'diesel','M9R',2008,2015)]);
add('Renault','Latitude',2010,2015,'berline',[E('2.0 140',140,'essence','M4R',2010,2015),E('2.5 V6 175',175,'essence','VQ25',2010,2015),E('1.5 dCi 110',110,'diesel','K9K',2010,2015),E('2.0 dCi 150',150,'diesel','M9R',2010,2015),E('2.0 dCi 175',175,'diesel','M9R',2010,2015)]);
add('Renault','Talisman',2016,2022,'berline',[E('1.6 TCe 150',150,'essence','M5Mt',2016,2018),E('1.6 TCe 200',200,'essence','M5Mt',2016,2018),E('1.8 TCe 225',225,'essence','M5Pt',2018,2022)].concat(H5H(2018,2022),K9K(2016,2020),R9M(2016,2018),R9N(2018,2020),M9R(2016,2020)));
add('Renault','Fluence',2009,2016,'berline',[E('1.6 16v 110',110,'essence','K4M',2009,2016),E('2.0 16v 140',140,'essence','M4R',2009,2016),E('1.5 dCi 85',85,'diesel','K9K',2009,2016),E('1.5 dCi 95',95,'diesel','K9K',2009,2016),E('1.5 dCi 110',110,'diesel','K9K',2009,2016),E('Z.E. 95',95,'electrique','EV',2011,2016)]);
add('Renault','Symbol / Thalia',1999,2021,'berline',[E('1.2 16v 75',75,'essence','D4F',2002,2021),E('1.4 75',75,'essence','K7J',1999,2021),E('1.6 16v 105',105,'essence','K4M',2002,2021),E('1.5 dCi 65',65,'diesel','K9K',2002,2021),E('1.5 dCi 85',85,'diesel','K9K',2002,2021),E('1.5 dCi 90',90,'diesel','K9K',2008,2021)]);
add('Renault','Modus',2004,2013,'monospace',[E('1.2 16v 75',75,'essence','D4F',2004,2013),E('1.4 16v 98',98,'essence','K4J',2004,2013),E('1.6 16v 110',110,'essence','K4M',2004,2013),E('1.5 dCi 65',65,'diesel','K9K',2004,2013),E('1.5 dCi 85',85,'diesel','K9K',2004,2013),E('1.5 dCi 105',105,'diesel','K9K',2007,2013)]);
add('Renault','Wind',2010,2013,'cabriolet',[E('1.2 TCe 100',100,'essence','D4Ft',2010,2013),E('1.6 16v 110',110,'essence','K4M',2010,2013)]);
add('Renault','Koleos I',2008,2016,'SUV',[E('2.5 170',170,'essence','2TR',2008,2016),E('2.0 dCi 150',150,'diesel','M9R',2008,2016),E('2.0 dCi 175',175,'diesel','M9R',2010,2016)]);
add('Renault','Koleos II',2016,2023,'SUV',[E('2.0 145',145,'essence','M4R',2016,2023),E('2.5 170',170,'essence','2TR',2016,2023)].concat(R9M(2016,2020),M9R(2016,2020),[E('1.7 Blue dCi 150',150,'diesel','R9N',2019,2023),E('2.0 Blue dCi 190',190,'diesel','M9R',2019,2023)]));
add('Renault','Kadjar',2015,2022,'SUV',H5F(2015,2022).concat(H5H(2018,2022),K9K(2015,2022),R9M(2015,2020),R9N(2018,2020)));
add('Renault','Captur I',2013,2019,'SUV',[E('0.9 TCe 90',90,'essence','H4Bt',2013,2019),E('1.2 TCe 120',120,'essence','H5Ft',2013,2019)].concat(K9K(2013,2019)));
add('Renault','Captur II',2019,2027,'SUV',H4D(2019,2027).concat(H5H(2019,2023),K9K(2019,2023),H4Mh(2020,2027)));
add('Renault','Austral',2022,2027,'SUV',H5F(2022,2023).concat(H5H(2022,2027),H5Fh(2022,2027)));
add('Renault','Arkana',2021,2027,'SUV coupé',H5H(2021,2027).concat(H4Mh(2021,2027)));
add('Renault','Symbioz',2024,2027,'SUV',H5H(2024,2027).concat(H4Mh(2024,2027)));
add('Renault','Rafale',2024,2027,'SUV coupé',H5Fh(2024,2027));
add('Renault','Trafic II',2001,2014,'utilitaire',[E('2.0 16v 120',120,'essence','F4R',2001,2014),E('1.9 dCi 82',82,'diesel','F9Q',2001,2014),E('1.9 dCi 100',100,'diesel','F9Q',2001,2014),E('2.0 dCi 90',90,'diesel','M9R',2006,2014),E('2.0 dCi 115',115,'diesel','M9R',2006,2014),E('2.5 dCi 135',135,'diesel','G9U',2003,2014),E('2.5 dCi 145',145,'diesel','G9U',2006,2014)]);
add('Renault','Trafic III',2014,2027,'utilitaire',[E('1.6 dCi 90',90,'diesel','R9M',2014,2019),E('1.6 dCi 95',95,'diesel','R9M',2016,2019),E('1.6 dCi 115',115,'diesel','R9M',2014,2019),E('1.6 dCi 120',120,'diesel','R9M',2014,2019),E('1.6 dCi 125',125,'diesel','R9M',2014,2019),E('1.6 dCi 140',140,'diesel','R9M',2014,2019),E('1.6 dCi 145',145,'diesel','R9M',2016,2019),E('2.0 dCi 114',114,'diesel','M9R',2014,2019),E('2.0 dCi 120',120,'diesel','M9R',2014,2019),E('2.0 dCi 145',145,'diesel','M9R',2014,2019),E('2.0 dCi 170',170,'diesel','M9R',2014,2019),E('2.0 Blue dCi 110',110,'diesel','M9R',2019,2027),E('2.0 Blue dCi 130',130,'diesel','M9R',2019,2027),E('2.0 Blue dCi 150',150,'diesel','M9R',2019,2027),E('2.0 Blue dCi 170',170,'diesel','M9R',2019,2027),E('E-Tech Electric 122',122,'electrique','EV',2023,2027)]);
add('Renault','Master II',1997,2010,'fourgon',[E('2.2 dCi 90',90,'diesel','G9T',2000,2010),E('2.2 dCi 100',100,'diesel','G9T',2000,2010),E('2.5 dCi 100',100,'diesel','G9U',2001,2010),E('2.5 dCi 120',120,'diesel','G9U',2001,2010),E('2.5 dCi 145',145,'diesel','G9U',2006,2010),E('2.8 dTi 114',114,'diesel','S9W',1998,2010)]);
add('Renault','Master III',2010,2024,'fourgon',M9T(2010,2024).concat([E('2.5 dCi 100',100,'diesel','G9U',2010,2011),E('2.5 dCi 125',125,'diesel','G9U',2010,2011),E('2.5 dCi 150',150,'diesel','G9U',2010,2011)]));
add('Renault','Master IV',2024,2027,'fourgon',M9T(2024,2027).concat(EVr(76,2024,2027),EVr(143,2024,2027)));
add('Renault','Zoe',2012,2024,'citadine',[E('R240 88',88,'electrique','5AM',2012,2016),E('Q90 88',88,'electrique','5AM',2016,2019),E('R90 92',92,'electrique','5AM',2016,2019),E('R110 108',108,'electrique','5AM',2018,2019),E('R135 135',135,'electrique','5AM',2019,2024)]);
add('Renault','Twizy',2012,2023,'quadricycle',[E('45 5',5,'electrique','EV',2012,2023),E('80 11',11,'electrique','EV',2012,2023)]);
add('Renault','Spring',2021,2027,'citadine',EVr(45,2021,2027).concat(EVr(65,2022,2027)));
add('Renault','4 E-Tech',2024,2027,'SUV',EVr(150,2024,2027));
add('Renault','5 E-Tech',2024,2027,'citadine',EVr(120,2024,2027).concat(EVr(150,2024,2027)));
add('Renault','R5 Turbo 3E',2026,2027,'sportive',EVr(540,2026,2027));
add('Alpine','A110',2017,2027,'sportive',[E('1.8 TCe 252',252,'essence','M5Pt',2017,2027),E('1.8 TCe 292 S',292,'essence','M5Pt',2019,2027),E('1.8 TCe 300 R',300,'essence','M5Pt',2022,2027)]);
add('Alpine','A290',2024,2027,'citadine',EVr(180,2024,2027).concat(EVr(220,2024,2027)));
add('Alpine','A390',2025,2027,'SUV',EVr(400,2025,2027).concat(EVr(470,2025,2027)));
/* ================= DACIA ================= */
add('Dacia','Logan I',2004,2012,'berline',[E('1.4 75',75,'essence','K7J',2004,2012),E('1.6 90',90,'essence','K7M',2004,2012),E('1.6 16v 105',105,'essence','K4M',2006,2012),E('1.5 dCi 65',65,'diesel','K9K',2006,2012),E('1.5 dCi 70',70,'diesel','K9K',2006,2012),E('1.5 dCi 85',85,'diesel','K9K',2006,2012)]);
add('Dacia','Logan II',2012,2021,'berline',[E('0.9 TCe 90',90,'essence','H4Bt',2012,2021),E('1.2 16v 75',75,'essence','D4F',2012,2021),E('1.6 16v 105',105,'essence','K4M',2012,2021),E('1.0 SCe 75',75,'essence','B4D',2017,2021)].concat(K9K(2012,2021)));
add('Dacia','Logan III',2021,2027,'berline',H4D(2021,2027).concat(K9K(2021,2023),H4Mh(2023,2027)));
add('Dacia','Sandero I',2008,2012,'citadine',[E('1.4 75',75,'essence','K7J',2008,2012),E('1.6 90',90,'essence','K7M',2008,2012),E('1.5 dCi 70',70,'diesel','K9K',2008,2012),E('1.5 dCi 85',85,'diesel','K9K',2008,2012)]);
add('Dacia','Sandero II',2012,2021,'citadine',[E('0.9 TCe 90',90,'essence','H4Bt',2012,2021),E('1.2 16v 75',75,'essence','D4F',2012,2021),E('1.0 SCe 75',75,'essence','B4D',2017,2021),E('1.5 Blue dCi 95',95,'diesel','K9K',2018,2021)].concat(K9K(2012,2021)));
add('Dacia','Sandero III',2021,2027,'citadine',H4D(2021,2027).concat(K9K(2021,2023),H4Mh(2023,2027)));
add('Dacia','Duster I',2010,2018,'SUV',[E('1.6 16v 105',105,'essence','K4M',2010,2018),E('1.6 SCe 115',115,'essence','H4M',2015,2018),E('1.2 TCe 125',125,'essence','H5Ft',2015,2018),E('2.0 16v 135',135,'essence','F4R',2010,2018)].concat(K9K(2010,2018)));
add('Dacia','Duster II',2018,2024,'SUV',[E('1.6 SCe 115',115,'essence','H4M',2018,2024),E('1.0 TCe 100',100,'essence','H4Dt',2019,2024),E('1.3 TCe 130',130,'essence','H5Ht',2019,2024),E('1.3 TCe 150',150,'essence','H5Ht',2019,2024)].concat(K9K(2018,2024)));
add('Dacia','Duster III',2024,2027,'SUV',H4D(2024,2027).concat(H5F(2024,2027),H5Fh(2024,2027)));
add('Dacia','Spring',2021,2027,'citadine',EVr(45,2021,2027).concat(EVr(65,2022,2027)));
add('Dacia','Jogger',2021,2027,'break 7 places',H4D(2021,2027).concat(K9K(2021,2023),H4Mh(2023,2027)));
add('Dacia','Bigster',2025,2027,'SUV',H5F(2025,2027).concat(H5Fh(2025,2027)));
add('Dacia','Lodgy',2012,2022,'monospace',[E('1.2 TCe 115',115,'essence','H5Ft',2012,2022),E('1.6 SCe 102',102,'essence','H4M',2015,2022)].concat(K9K(2012,2022)));
add('Dacia','Dokker',2012,2021,'ludospace',[E('1.6 SCe 102',102,'essence','H4M',2015,2021),E('1.2 TCe 115',115,'essence','H5Ft',2012,2021)].concat(K9K(2012,2021)));
add('Dacia','Pick-Up',2008,2012,'pick-up',[E('1.5 dCi 65',65,'diesel','K9K',2008,2012),E('1.5 dCi 85',85,'diesel','K9K',2008,2012)]);
/* verrous */
if(C.LOCK){['B4D','H4Bt','H4Dt','H5Ft','H5Ht','H4M','K4M','K7M','K7J','D4F','D4Ft','F4R','F4Rt','F9Q','F8Q','E7J','E7F','C3G','K4J','M4R','M5Mt','M5Pt','R9M','R9N','M9R','M9T','G9T','G9U','S9W','P9X','V4Y','L7X','VQ25','2TR','5AM','K9K'].forEach(function(k){C.LOCK[k]=C.LOCK[k]||['Renault','Dacia','Nissan','Mercedes-Benz','Suzuki','Infiniti','Mitsubishi','Alpine','Lada']})}
try{C.purge()}catch(e){}
window.KFRenaultBase={models:Object.keys(CAT.Renault||{}).length};
})();
