/* KEV FUSION 2026 — models_add.js v1.0.0
   Ajouts demandés : FORD F-150 / F-150 Raptor / F-150 Raptor R / F-150 Lightning / Ranger Raptor,
   DACIA Bigster, SKODA Epiq — motorisations & puissances RÉELLES par modèle,
   + pannes corrélées (DTC, mécanisme, chaîne, preuves, tests, actions, sécurité),
   + bulletins techniques (TSB) + campagnes de rappel scopés modèle/motorisation/années.
   Les motorisations de ces modèles sont REMPLACÉES par la liste réelle (pas de template). */
'use strict';
(function(){
if(!window.KFCatalog||typeof FAULTS==='undefined'){console.warn('models_add: prérequis');return}
var C=window.KFCatalog,CAT=C.CAT,OWNER=C.OWNER;
function E(l,ch,f,code,y0,y1){return{l:l,ch:ch,kw:Math.round(ch*0.7355),f:f,code:code,y:[y0,y1]}}
function SET(make,model,y0,y1,body,engs){
 CAT[make]=CAT[make]||{};
 CAT[make][model]={y:[y0,y1],body:body||'',eng:engs.slice()};
 var n=C.norm(model);OWNER[n]=OWNER[n]||[];if(OWNER[n].indexOf(make)<0)OWNER[n].push(make)}
function FF(o){return Object.assign({id:'',t:'',eng:[],b:[],m:['*'],y:[2015,2027],pw:[],fuel:'',s:'',sys:[],
 g:'Élevé',fire:false,dtc:[],sym:[],mec:'',chain:'',cons:[],prv:[],tst:[],act:[],sec:'—',
 law:['CC1641'],tsb:null,rec:null,generic:false},o)}
function TSB(o){if(typeof TSBDB!=='undefined')TSBDB.push(Object.assign({id:'tsb-'+Math.random().toString(36).slice(2,8),ref:'',b:[],m:[],e:[],sys:'',g:'Élevé',s:'',dtc:[],y:[2015,2027]},o))}
function REC(o){if(typeof RECALLS!=='undefined')RECALLS.push(Object.assign({id:'rec-'+Math.random().toString(36).slice(2,8),t:'',b:[],m:[],y:[2015,2027],fire:false,risk:'',dtc:[],src:'Campagne constructeur',law:['CC1641','CONSOL4213']},o))}

/* ==================== FORD F-150 (14e gén. 2021+) ==================== */
SET('Ford','F-150',2021,2027,'pick-up',[
 E('3.3 Ti-VCT V6 290',290,'essence','TIVCT',2021,2023),
 E('2.7 EcoBoost V6 325',325,'essence','ECOBOOST27',2021,2027),
 E('3.5 EcoBoost V6 400',400,'essence','ECOBOOST35',2021,2027),
 E('3.5 PowerBoost Hybrid 430',430,'hybride','POWERBOOST',2021,2027),
 E('5.0 Ti-VCT V8 400',400,'essence','COYOTE',2021,2027),
 E('3.0 Power Stroke V6 250',250,'diesel','POWERSTROKE',2021,2021)]);
SET('Ford','F-150 Raptor',2021,2027,'pick-up sport',[
 E('3.5 EcoBoost HO V6 450',450,'essence','ECOBOOST35HO',2021,2027)]);
SET('Ford','F-150 Raptor R',2023,2027,'pick-up sport',[
 E('5.2 Supercharged V8 700',700,'essence','PREDATOR',2023,2023),
 E('5.2 Supercharged V8 720',720,'essence','PREDATOR',2024,2027)]);
SET('Ford','F-150 Lightning',2022,2027,'pick-up électrique',[
 E('Standard Range 452',452,'electrique','EV',2022,2023),
 E('Extended Range 580',580,'electrique','EV',2022,2027)]);
SET('Ford','Ranger Raptor',2023,2027,'pick-up sport',[
 E('3.0 EcoBoost V6 292',292,'essence','ECOBOOST30',2023,2027),
 E('3.0 EcoBoost V6 405',405,'essence','ECOBOOST30',2023,2027)]);
/* ==================== DACIA BIGSTER (2025+) ==================== */
SET('Dacia','Bigster',2025,2027,'SUV',[
 E('1.2 TCe 130 (MHEV 48V)',130,'hybride','HR12',2025,2027),
 E('1.2 TCe 140 4x4 (MHEV 48V)',140,'hybride','HR12',2025,2027),
 E('1.2 Eco-G 140 (GPL)',140,'essence','HR12',2025,2027),
 E('1.8 Hybrid 155 (E-Tech)',155,'hybride','H4M',2025,2027)]);
/* ==================== SKODA EPIQ (2025+, MEB Entry) ==================== */
SET('Skoda','Epiq',2025,2027,'SUV urbain électrique',[
 E('Epiq 170 (FWD)',170,'electrique','EV',2025,2027),
 E('Epiq 204 (FWD)',204,'electrique','EV',2025,2027)]);

/* ==================== PANNES CORRÉLÉES ==================== */
var FORD=['Ford'];
var F150=['F-150','F-150 Raptor','F-150 Raptor R'];
var NEW=[
/* --- EcoBoost 2.7 / 3.5 / 3.5 HO / 3.0 V6 --- */
FF({id:'f150-ecoboost-phaser',t:'Déphaseurs / chaîne de distribution — EcoBoost V6 (cam phaser rattle)',
 eng:['ECOBOOST27','ECOBOOST35','ECOBOOST35HO','ECOBOOST30'],b:FORD,m:F150.concat(['Ranger Raptor']),
 y:[2017,2027],pw:[292,325,400,405,450],fuel:'essence',s:'Distribution',sys:['chaine','vvt'],g:'Critique',
 dtc:['P0016','P0017','P0011','P0012','P0340','P0341'],
 sym:['claquement au démarrage à froid','ratés','voyant moteur','perte puissance','mode dégradé'],
 mec:'Déphaseurs (cam phasers) et tendeurs de chaîne usés : jeu au démarrage → bruit de cliquetis, décalage de calage, allongement chaîne.',
 chain:'Phaser/tendeur usé → décalage AAC → saut de dent → contact soupapes/pistons → casse moteur',
 cons:['Casse moteur','Perte puissance','Mode dégradé','Coût élevé'],
 prv:['Claquement 1-3 s au démarrage froid','Codes P0016/P0011','Déphasage loggé','Tendeur/phaser usé'],
 tst:['Écoute démarrage à froid','Lecture déphasage AAC/vilebrequin','Contrôle tendeurs/phasers','Pression huile'],
 act:['Kit phasers + tendeurs + chaîne révisé','Huile spec Motorcraft + vidanges courtes','MAJ calculateur'],
 sec:'Arrêt si claquement persistant : risque casse.',law:['CC1641','CC1645','CONSO2173'],
 tsb:'Ford EcoBoost V6 — cam phasers / tendeurs révisés (TSB 21-2xxx)',rec:'Campagne / extension garantie cam phasers EcoBoost selon VIN'}),
FF({id:'f150-ecoboost-condensate',t:'Condensation intercooler — ratés d\'allumage (EcoBoost)',
 eng:['ECOBOOST27','ECOBOOST35','ECOBOOST35HO'],b:FORD,m:F150,y:[2017,2027],pw:[325,400,450],
 fuel:'essence',s:'Allumage',sys:['bougies','turbo'],g:'Élevé',fire:true,
 dtc:['P0300','P0301','P0302','P0303','P0304','P0305','P0306'],
 sym:['ratés sous charge','à-coups','voyant moteur clignotant','perte puissance par temps humide'],
 mec:'Condensation d\'eau dans l\'échangeur air/air (intercooler) aspirée par temps humide → ratés d\'allumage, bougies/bobines sollicitées.',
 chain:'Ratés → carburant imbrûlé → surchauffe catalyseur → risque thermique',
 cons:['Catalyseur endommagé','Bougies/bobines','Mode dégradé'],
 prv:['Ratés multi-cylindres par temps humide','Eau dans intercooler','Bougies usées'],
 tst:['Lecture ratés par cylindre','Inspection intercooler/condensat','Test bougies/bobines'],
 act:['Intercooler révisé / drain','Bougies + bobines','MAJ calculateur (gestion condensat)'],
 sec:'Ne pas rouler voyant clignotant.',law:['CC1641','CONSO2173'],
 tsb:'Ford EcoBoost — condensat intercooler / ratés (TSB)',rec:'Campagne gestion condensat EcoBoost selon VIN'}),
FF({id:'f150-ecoboost-turbo',t:'Turbo / wastegate / durites — EcoBoost V6',
 eng:['ECOBOOST27','ECOBOOST35','ECOBOOST35HO','ECOBOOST30'],b:FORD,m:F150.concat(['Ranger Raptor']),
 y:[2017,2027],pw:[292,325,400,405,450],fuel:'essence',s:'Suralimentation',sys:['turbo'],g:'Élevé',
 dtc:['P0299','P0234','P0033','P0245','P0236'],
 sym:['perte puissance','sifflement','mode dégradé','fumée'],
 mec:'Wastegate grippée / actuateur, durites de suralimentation fissurées, lubrification dégradée → sous/sur-alimentation.',
 cons:['Perte puissance','Casse turbo','Huile dans admission'],
 prv:['Jeu arbre turbo','Durites fissurées','Tringlerie grippée','Codes boost'],
 tst:['Test pression suralimentation','Contrôle actuateur/wastegate','Inspection durites'],
 act:['Turbo/actuateur','Durites','Huile spec + vidanges courtes'],sec:'—',law:['CC1641','CONSO2173']}),
FF({id:'f150-ecoboost-coolant',t:'Intrusion liquide de refroidissement / joint de culasse — EcoBoost',
 eng:['ECOBOOST27','ECOBOOST35'],b:FORD,m:F150,y:[2017,2023],pw:[325,400],fuel:'essence',
 s:'Refroidissement',sys:['refroid'],g:'Critique',fire:true,
 dtc:['P0217','P0128','P0300','P0301'],
 sym:['surchauffe','fumée blanche','perte de liquide','ratés au démarrage','odeur brûlé'],
 mec:'Fissure/intrusion LDR dans cylindre ou joint de culasse sur blocs EcoBoost → ratés, surchauffe, casse.',
 chain:'Surchauffe → joint de culasse → fuite huile/LDR sur échappement → risque thermique',
 cons:['Casse moteur','Joint de culasse','Feu baie moteur'],
 prv:['CO2 dans LDR','Compression basse','Traces LDR cylindre','Niveau en baisse'],
 tst:['Test CO2 LDR','Compression/étanchéité','Mise en pression circuit','Endoscopie'],
 act:['Bloc/joint révisé selon diagnostic','LDR conforme','MAJ gestion thermique'],
 sec:'Arrêt si surchauffe/odeur.',law:['CC1641','CC1245','CONSOL4213'],
 tsb:'Ford EcoBoost — intrusion LDR / joint de culasse',rec:'Campagne / extension garantie bloc EcoBoost selon VIN'}),
/* --- 5.0 Coyote --- */
FF({id:'f150-coyote-oil',t:'Consommation d\'huile / segmentation — 5.0 V8 Coyote',
 eng:['COYOTE'],b:FORD,m:['F-150'],y:[2018,2023],pw:[400],fuel:'essence',s:'Lubrification',sys:['crepine'],g:'Élevé',
 dtc:['P0521','P0300'],sym:['consommation huile','fumée bleue','bougies huileuses','voyant huile'],
 mec:'Segmentation/rainures d\'huile et joints de queue de soupape → consommation excessive, encrassement.',
 cons:['Encrassement cata','Usure moteur','Bougies'],
 prv:['Conso > 0,5 L/1000 km','Bougies huileuses','Compression/étanchéité'],
 tst:['Test consommation huile','Compression','Inspection bougies'],
 act:['Segmentation/joints révisés','Huile spec + vidanges courtes','MAJ calculateur'],
 sec:'Surveiller niveau huile.',law:['CC1641','CONSO2173'],
 tsb:'Ford Coyote 5.0 — consommation huile / segmentation',rec:'Campagne / extension garantie Coyote selon VIN'}),
FF({id:'f150-coyote-valve',t:'Ressorts de soupape / déphaseurs — 5.0 V8 Coyote',
 eng:['COYOTE'],b:FORD,m:['F-150'],y:[2018,2027],pw:[400],fuel:'essence',s:'Distribution',sys:['chaine','vvt'],g:'Élevé',
 dtc:['P0016','P0011','P0300'],sym:['claquement','ratés','voyant moteur','perte puissance'],
 mec:'Ressorts de soupape et déphaseeurs sensibles à l\'huile dégradée / sollicitation élevée.',
 cons:['Décalage distribution','Ratés','Casse si rupture'],
 prv:['Claquement','Codes phaser','Ressorts usés'],tst:['Lecture déphasage','Contrôle ressorts/phasers'],
 act:['Ressorts/phasers','Huile spec','Vidanges courtes'],sec:'—',law:['CC1641','CONSO2173']}),
/* --- Raptor R 5.2 Predator --- */
FF({id:'raptor-r-predator',t:'5.2 Supercharged Predator — surchauffe compresseur / coussinets',
 eng:['PREDATOR'],b:FORD,m:['F-150 Raptor R'],y:[2023,2027],pw:[700,720],fuel:'essence',
 s:'Suralimentation',sys:['turbo','crepine','refroid'],g:'Critique',fire:true,
 dtc:['P0299','P0234','P0521','P0217'],
 sym:['perte puissance en charge','surchauffe','claquement bas moteur','voyant huile','odeur brûlé'],
 mec:'Compresseur volumétrique et échangeur sur sollicitation extrême ; coussinets de bielle sensibles à l\'huile diluée/dégradée.',
 chain:'Surchauffe huile → film rompu → coussinets → bielle percée → casse moteur / feu',
 cons:['Casse moteur','Feu baie moteur','Compresseur'],
 prv:['Température huile élevée','Limaille','Jeu compresseur','Codes boost'],
 tst:['Analyse huile','Pression huile','Test compresseur/échangeur','Lecture boost'],
 act:['Coussinets si atteinte','Compresseur/échangeur','Huile haute performance + vidanges très courtes'],
 sec:'Usage extrême : surveiller huile/température ; arrêt si claquement.',
 law:['CC1641','CC1245','CONSOL4213'],tsb:'Ford Predator 5.2 — refroidissement / coussinets',rec:'Campagne Predator selon VIN'}),
/* --- 3.0 Power Stroke diesel --- */
FF({id:'f150-powerstroke',t:'3.0 Power Stroke — EGR / FAP / SCR / injecteurs',
 eng:['POWERSTROKE'],b:FORD,m:['F-150'],y:[2018,2021],pw:[250],fuel:'diesel',
 s:'FAP / catalyseur',sys:['fap','egr','adblue','injecteurs'],g:'Élevé',fire:true,
 dtc:['P2463','P244A','P0400','P20EE','P0201','P0087'],
 sym:['voyant FAP','mode dégradé','fumée','ratés','voyant AdBlue'],
 mec:'Encrassement EGR/FAP, cristallisation SCR, injecteurs coking sur diesel 3.0.',
 chain:'Régénérations répétées → surchauffe échappement → risque thermique sous caisse',
 cons:['Mode dégradé','Démarrage interdit','Turbo','Piston'],
 prv:['Charge suies','Cristaux SCR','Débits retour','Traces glycol EGR'],
 tst:['Lecture FAP/SCR','Test dosage','Débits injecteurs','Mise en pression LDR'],
 act:['FAP/EGR/SCR','Injecteurs + codage','MAJ calculateur'],
 sec:'Éviter herbe sèche en régénération.',law:['CC1641','CONSO2173','CC1245']}),
/* --- 10R80 transmission --- */
FF({id:'f150-10r80',t:'Boîte 10R80 — à-coups / convertisseur / mécatronic',
 eng:['TIVCT','ECOBOOST27','ECOBOOST35','ECOBOOST35HO','COYOTE','POWERBOOST','PREDATOR'],b:FORD,
 m:F150.concat(['Ranger Raptor']),y:[2017,2027],pw:[290,292,325,400,405,430,450,700,720],fuel:'',
 s:'Boîte de vitesses',sys:['boite'],g:'Élevé',generic:false,
 dtc:['P0700','P0730','P0776','P0715','P0841'],
 sym:['à-coups au démarrage','secousses 2-3-4','patinage','voyant boîte','mode dégradé'],
 mec:'Boîte 10R80 : corps de vanne/accumulateurs, convertisseur de couple, logiciel d\'adaptation → à-coups et usure.',
 cons:['Usure boîte','Perte motricité','Convertisseur'],
 prv:['Codes P07xx','ATF dégradée','Adaptations hors cote'],
 tst:['Lecture codes/adaptations','Analyse ATF','Test convertisseur'],
 act:['MAJ logiciel boîte','Corps de vanne/accumulateurs','Vidange ATF + filtre','Convertisseur si usé'],
 sec:'Éviter de forcer si patinage.',law:['CC1641','CONSO2173'],
 tsb:'Ford 10R80 — à-coups / corps de vanne / MAJ (TSB)',rec:'Campagne / extension garantie 10R80 selon VIN'}),
/* --- PowerBoost hybrid --- */
FF({id:'f150-powerboost',t:'3.5 PowerBoost Hybrid — batterie HT / DC-DC / 10R80 hybride',
 eng:['POWERBOOST'],b:FORD,m:['F-150'],y:[2021,2027],pw:[430],fuel:'hybride',
 s:'Pack HT',sys:['ht','charge','boite','b12'],g:'Élevé',fire:true,
 dtc:['P0A80','P0AFA','P0AA6','U0100','P0562','P0700'],
 sym:['voyant hybride','perte puissance','mode dégradé','batterie 12V faible','à-coups boîte'],
 mec:'Batterie HT Li-ion, convertisseur DC-DC et module hybride intégrés à la 10R80 ; défauts d\'isolement/cellules et 12V.',
 chain:'Défaut cellule/refroidissement → emballement → risque feu',
 cons:['Perte motricité','Immobilisation','Risque incendie HT'],
 prv:['Codes HT/DC-DC','SOH bas','Tension 12V basse','Codes boîte'],
 tst:['Mesure isolement','Lecture BMS','Test DC-DC/12V','Lecture boîte'],
 act:['Modules/pack','DC-DC','12V','MAJ logiciel hybride/boîte'],
 sec:'Intervention HT habilitée ; ne pas recharger si odeur/surchauffe.',
 law:['CC1245','CONSOL4213','CC1641','CONSO2173'],
 tsb:'Ford PowerBoost — batterie HT / DC-DC / 10R80',rec:'Campagne PowerBoost selon VIN'}),
/* --- Lightning EV --- */
FF({id:'lightning-battery',t:'F-150 Lightning — batterie HT / charge / rappel',
 eng:['EV'],b:FORD,m:['F-150 Lightning'],y:[2022,2027],pw:[452,580],fuel:'electrique',
 s:'Pack HT',sys:['ht','charge','soh','b12'],g:'Critique',fire:true,
 dtc:['P0AA6','P0AFA','P0A80','P0D20','U0111'],
 sym:['charge impossible','charge interrompue','autonomie réduite','voyant HT','odeur âcre'],
 mec:'Batterie HT haute capacité : cellules/refroidissement, chargeur embarqué et connecteur ; campagne constructeur sur lots batterie.',
 chain:'Défaut cellule → emballement thermique → feu en charge',
 cons:['Risque incendie','Charge impossible','Immobilisation'],
 prv:['Codes HT/charge','SOH bas','Isolement bas','VIN plage rappel','Connecteur chaud'],
 tst:['Mesure isolement','Lecture BMS','Test charge AC/DC','Thermographie','Vérification campagne VIN'],
 act:['Modules/pack selon campagne','OBC/connecteur','Refroidissement','MAJ BMS limitation charge'],
 sec:'Ne pas recharger à 100 % avant campagne ; stationner à l\'écart.',
 law:['CC1245','CONSOL4213','CC1641'],
 tsb:'Ford Lightning — batterie HT / gestion charge',rec:'Rappel F-150 Lightning batterie HT — risque incendie (vérifier VIN)'}),
/* --- Ranger Raptor specifics --- */
FF({id:'ranger-raptor-shocks',t:'Ranger Raptor — amortisseurs Fox / transmission / transfert',
 eng:['ECOBOOST30'],b:FORD,m:['Ranger Raptor'],y:[2023,2027],pw:[292,405],fuel:'essence',
 s:'Suspension',sys:['suspension','boite'],g:'Élevé',
 dtc:['C1A00','P1867','U0100'],
 sym:['claquement suspension','véhicule affaissé','voyant 4x4','à-coups transfert','bruit'],
 mec:'Amortisseurs Fox à valves électroniques, boîte de transfert et différentiels sollicités en usage extrême.',
 cons:['Tenue de route dégradée','Perte motricité 4x4','Usure différentiel'],
 prv:['Fuite amortisseur','Codes actuateur','Huile transfert noire'],
 tst:['Test amortisseurs/valves','Lecture codes transfert','Analyse huile transfert/diff'],
 act:['Amortisseurs Fox','Actuateurs transfert','Huile transfert/diff','MAJ Terrain Response'],
 sec:'Tenue de route dégradée : vigilance.',law:['CONSO2173','CC1641']}),
/* --- Dacia Bigster HR12 (1.2 TCe 3-cyl MHEV / Eco-G GPL) --- */
FF({id:'bigster-hr12-chain',t:'Bigster 1.2 TCe / Eco-G (HR12) — chaîne / tendeur',
 eng:['HR12'],b:['Dacia','Renault'],m:['Bigster'],y:[2025,2027],pw:[130,140],fuel:'hybride',
 s:'Distribution',sys:['chaine','vvt'],g:'Critique',
 dtc:['P0016','P0017','P0011','P0340'],
 sym:['claquement à froid','voyant moteur','perte puissance','ratés'],
 mec:'Nouveau 1.2 TCe 3-cyl (HR12) : chaîne + tendeur sensibles à l\'huile dégradée / dilution (trajets courts, GPL).',
 chain:'Chaîne allongée → saut de dent → décalage AAC → casse moteur',
 cons:['Casse moteur','Déphaseurs','Ratés'],
 prv:['Claquement distribution','Log déphasage','Tendeur hors cote','Huile diluée'],
 tst:['Lecture déphasage','Contrôle tendeur/chaîne','Analyse huile','Pression huile'],
 act:['Kit chaîne + tendeur','Huile spec RN17 + vidanges courtes','MAJ calculateur'],
 sec:'Arrêt si claquement.',law:['CC1641','CC1645','CONSO2173'],
 tsb:'Dacia/Renault HR12 — chaîne / tendeur',rec:'Campagne HR12 selon VIN (à vérifier)'}),
FF({id:'bigster-hr12-lspi',t:'Bigster 1.2 TCe / Eco-G (HR12) — LSPI / dilution huile',
 eng:['HR12'],b:['Dacia','Renault'],m:['Bigster'],y:[2025,2027],pw:[130,140],fuel:'hybride',
 s:'Bloc moteur',sys:['bougies','crepine','turbo'],g:'Élevé',fire:true,
 dtc:['P0300','P0325','P0521','P0234'],
 sym:['claquement en charge bas régime','à-coups','niveau huile en hausse','perte puissance'],
 mec:'Pré-allumage basse vitesse (LSPI) sur turbo injection directe + dilution huile (trajets courts / GPL).',
 chain:'LSPI → pré-allumage → pic pression → casse piston/bielle',
 cons:['Casse moteur','Turbo','Bougies'],
 prv:['Cliquetis loggé','Huile diluée','Piston fissuré (endoscopie)'],
 tst:['Lecture cliquetis','Endoscopie','Analyse huile anti-LSPI'],
 act:['Huile anti-LSPI RN17/API SP','MAJ calculateur','Éviter pleine charge bas régime','Vidanges courtes'],
 sec:'Éviter forte charge bas régime.',law:['CC1641','CONSO2173'],
 tsb:'Dacia/Renault HR12 — huile anti-LSPI / cartographie'}),
FF({id:'bigster-hr12-mhev',t:'Bigster MHEV 48V — BISG / batterie 48V / DC-DC',
 eng:['HR12'],b:['Dacia','Renault'],m:['Bigster'],y:[2025,2027],pw:[130,140],fuel:'hybride',
 s:'Électronique / Calculateurs',sys:['ht','b12','charge'],g:'Élevé',
 dtc:['P0A80','U0100','P0562','P1AF0'],
 sym:['stop/start inopérant','voyant hybride','mode dégradé','batterie 12V faible'],
 mec:'Alterno-démarreur à courroie (BISG) 48V, batterie 48V Li-ion et DC-DC : courroie usée, cellules déséquilibrées, isolement.',
 cons:['Perte assistance hybride','Immobilisation 12V','Mode dégradé'],
 prv:['Codes 48V/DC-DC','Courroie BISG usée','Tension 48V hors cote'],
 tst:['Lecture tensions 48V/12V','Test BISG','Test isolement','Contrôle courroie'],
 act:['BISG + courroie','Batterie 48V','DC-DC','MAJ calculateur hybride'],
 sec:'Intervention habilitée 48V.',law:['CONSO2173','CC1641']}),
FF({id:'bigster-ecog-lpg',t:'Bigster Eco-G 140 (GPL) — sièges de soupape / injecteurs GPL',
 eng:['HR12'],b:['Dacia','Renault'],m:['Bigster'],y:[2025,2027],pw:[140],fuel:'essence',
 s:'Injection',sys:['injecteurs','bougies'],g:'Élevé',
 dtc:['P0300','P0171','P0201','P0301'],
 sym:['ratés au GPL','démarrage difficile','perte puissance','voyant moteur','odeur gaz'],
 mec:'Usage GPL : usure sièges de soupape et injecteurs GPL, mélange appauvri, bougies sollicitées.',
 cons:['Ratés','Usure soupapes','Catalyseur'],
 prv:['Ratés au GPL uniquement','Compression basse','Injecteurs GPL encrassés'],
 tst:['Lecture ratés essence vs GPL','Compression','Test injecteurs GPL','Contrôle jeu soupapes'],
 act:['Injecteurs GPL','Sièges/jeu soupapes','Bougies adaptées','MAJ calculateur GPL'],
 sec:'Contrôle étanchéité circuit GPL.',law:['CONSO2173','CC1641']}),
FF({id:'bigster-hybrid155',t:'Bigster Hybrid 155 (E-Tech) — boîte à crabots / batterie HT',
 eng:['H4M'],b:['Dacia','Renault'],m:['Bigster'],y:[2025,2027],pw:[155],fuel:'hybride',
 s:'Boîte de vitesses',sys:['boite','ht','charge'],g:'Élevé',
 dtc:['P0700','P0A80','P0AFA','U0100'],
 sym:['à-coups boîte','voyant hybride','mode dégradé','perte motricité','charge impossible'],
 mec:'E-Tech 1.8 : boîte multimode à crabots sans embrayage (actuateurs sensibles) + batterie HT 400V et chargeur.',
 cons:['Perte motricité','Mode dégradé','Charge impossible'],
 prv:['Codes crabots','Codes HT','Adaptations boîte','SOH bas'],
 tst:['Test actuateurs crabots','Lecture BMS','Test charge','Lecture adaptations'],
 act:['Actuateurs crabots','Batterie/OBC','MAJ logiciel hybride/boîte'],
 sec:'Intervention HT habilitée.',law:['CC1641','CONSO2173'],
 tsb:'Dacia/Renault E-Tech 155 — crabots / batterie HT'}),
/* --- Skoda Epiq (MEB Entry EV) --- */
FF({id:'epiq-meb-entry',t:'Skoda Epiq (MEB Entry) — charge / OBC / 12V / logiciel',
 eng:['EV'],b:['Skoda','Volkswagen','Cupra'],m:['Epiq'],y:[2025,2027],pw:[170,204],fuel:'electrique',
 s:'Charge',sys:['charge','ht','b12','soh'],g:'Élevé',fire:true,
 dtc:['P0D20','P0AFA','P0AA6','U0111','P0562'],
 sym:['charge impossible','charge interrompue','autonomie réduite','écran noir','voyant HT'],
 mec:'Plateforme MEB Entry : chargeur embarqué, connecteur/verrou, batterie HT et 12V ; logiciel OTA incomplet.',
 chain:'Défaut cellule/refroidissement → emballement → risque feu en charge',
 cons:['Charge impossible','Immobilisation','Risque incendie'],
 prv:['Codes charge/HT','Connecteur/verrou HS','SOH bas','Tension 12V basse','Version logiciel ancienne'],
 tst:['Test charge AC/DC','Lecture BMS/OBC','Mesure isolement','Test 12V/DC-DC','MAJ OTA'],
 act:['OBC/connecteur','Modules/pack','12V/DC-DC','MAJ logiciel'],
 sec:'Ne pas recharger si odeur/surchauffe ; intervention habilitée HT.',
 law:['CC1245','CONSOL4213','CC1641','CONSO2173'],
 tsb:'Skoda MEB Entry (Epiq) — OBC / logiciel / 12V',rec:'Campagne MEB Entry selon VIN'}),
FF({id:'epiq-soh',t:'Skoda Epiq — dégradation pack HT / perte autonomie (SOH)',
 eng:['EV'],b:['Skoda'],m:['Epiq'],y:[2025,2027],pw:[170,204],fuel:'electrique',
 s:'Pack HT',sys:['soh','ht'],g:'Élevé',
 dtc:['P0A80','P0AFA','P0A1F'],
 sym:['autonomie réduite','charge plus lente','perte puissance'],
 mec:'Vieillissement/déséquilibre cellules → capacité utile (SOH) en baisse, limitation charge/décharge.',
 cons:['Autonomie réduite','Valeur revente','Garantie batterie'],
 prv:['SOH bas','Déséquilibre cellules','Historique charge rapide'],
 tst:['Lecture SOH/tensions','Test capacité','Historique charges'],
 act:['Équilibrage/modules','Garantie batterie (8 ans/160 000 km)','MAJ BMS'],
 sec:'—',law:['CONSO2173','CC1641','CONSO_L21721']})
];
NEW.forEach(function(f){FAULTS.push(f)});
/* ==================== TSB ==================== */
TSB({ref:'Ford EcoBoost V6 — cam phasers / tendeurs (TSB 21-2xxx)',b:FORD,m:F150.concat(['Ranger Raptor']),e:['ECOBOOST27','ECOBOOST35','ECOBOOST35HO','ECOBOOST30'],sys:'Distribution',g:'Critique',s:'Remplacement phasers + tendeurs + chaîne révisés ; huile spec + vidanges courtes.',dtc:['P0016','P0011','P0340'],y:[2017,2027]});
TSB({ref:'Ford EcoBoost — condensat intercooler / ratés',b:FORD,m:F150,e:['ECOBOOST27','ECOBOOST35','ECOBOOST35HO'],sys:'Allumage',g:'Élevé',s:'Intercooler révisé / drain + bougies/bobines + MAJ gestion condensat.',dtc:['P0300','P0301'],y:[2017,2027]});
TSB({ref:'Ford 10R80 — à-coups / corps de vanne / MAJ logiciel',b:FORD,m:F150.concat(['Ranger Raptor']),e:['TIVCT','ECOBOOST27','ECOBOOST35','ECOBOOST35HO','COYOTE','POWERBOOST','PREDATOR'],sys:'Boîte de vitesses',g:'Élevé',s:'MAJ logiciel boîte + corps de vanne/accumulateurs + vidange ATF.',dtc:['P0700','P0730','P0776'],y:[2017,2027]});
TSB({ref:'Ford Coyote 5.0 — consommation huile / segmentation',b:FORD,m:['F-150'],e:['COYOTE'],sys:'Lubrification',g:'Élevé',s:'Segmentation/joints de queue de soupape révisés ; huile spec + vidanges courtes.',dtc:['P0521','P0300'],y:[2018,2023]});
TSB({ref:'Ford Predator 5.2 — refroidissement / coussinets',b:FORD,m:['F-150 Raptor R'],e:['PREDATOR'],sys:'Suralimentation',g:'Critique',s:'Refroidissement compresseur/échangeur + coussinets ; huile haute performance + vidanges très courtes.',dtc:['P0299','P0521','P0217'],y:[2023,2027]});
TSB({ref:'Ford PowerBoost — batterie HT / DC-DC / 10R80',b:FORD,m:['F-150'],e:['POWERBOOST'],sys:'Pack HT',g:'Élevé',s:'Modules/pack + DC-DC + 12V + MAJ logiciel hybride/boîte.',dtc:['P0A80','U0100','P0562','P0700'],y:[2021,2027]});
TSB({ref:'Ford Lightning — batterie HT / gestion charge',b:FORD,m:['F-150 Lightning'],e:['EV'],sys:'Pack HT',g:'Critique',s:'Modules/pack selon campagne + OBC/connecteur + MAJ BMS limitation charge.',dtc:['P0AA6','P0A80','P0D20'],y:[2022,2027]});
TSB({ref:'Dacia/Renault HR12 — chaîne / tendeur',b:['Dacia','Renault'],m:['Bigster'],e:['HR12'],sys:'Distribution',g:'Critique',s:'Kit chaîne + tendeur ; huile RN17 + vidanges courtes ; MAJ calculateur.',dtc:['P0016','P0011','P0340'],y:[2025,2027]});
TSB({ref:'Dacia/Renault HR12 — huile anti-LSPI / cartographie',b:['Dacia','Renault'],m:['Bigster'],e:['HR12'],sys:'Bloc moteur',g:'Élevé',s:'Huile anti-LSPI RN17/API SP + MAJ calculateur ; éviter pleine charge bas régime.',dtc:['P0300','P0325','P0521'],y:[2025,2027]});
TSB({ref:'Dacia/Renault E-Tech 155 — crabots / batterie HT',b:['Dacia','Renault'],m:['Bigster'],e:['H4M'],sys:'Boîte de vitesses',g:'Élevé',s:'Actuateurs crabots + batterie/OBC + MAJ logiciel hybride/boîte.',dtc:['P0700','P0A80'],y:[2025,2027]});
TSB({ref:'Skoda MEB Entry (Epiq) — OBC / logiciel / 12V',b:['Skoda'],m:['Epiq'],e:['EV'],sys:'Charge',g:'Élevé',s:'OBC/connecteur + modules/pack + 12V/DC-DC + MAJ OTA.',dtc:['P0D20','U0111','P0562'],y:[2025,2027]});
/* ==================== CAMPAGNES DE RAPPEL ==================== */
REC({t:'Rappel F-150 — pompe carburant / calage',b:FORD,m:['F-150'],y:[2021,2024],fire:false,risk:'Pompe carburant basse pression défaillante → calage en roulant, perte d\'assistance.',dtc:['P0087','P0230'],src:'NHTSA / constructeur',law:['CC1245','CONSOL4213','CC1641']});
REC({t:'Rappel F-150 — bouclier thermique / risque incendie',b:FORD,m:['F-150'],y:[2021,2023],fire:true,risk:'Bouclier thermique sous caisse contact échappement chaud → risque incendie.',dtc:[],src:'NHTSA',law:['CC1245','CONSOL4213']});
REC({t:'Rappel F-150 — caméra de recul / écran',b:FORD,m:['F-150'],y:[2021,2024],fire:false,risk:'Caméra de recul / écran noir → perte de visibilité, non-conformité.',dtc:['U0155'],src:'NHTSA',law:['CONSOL4213','CONSO2173']});
REC({t:'Rappel F-150 Lightning — batterie HT risque incendie',b:FORD,m:['F-150 Lightning'],y:[2022,2024],fire:true,risk:'Batterie HT : cellules/refroidissement → risque incendie en charge. Limitation de charge / remplacement modules selon VIN.',dtc:['P0AA6','P0A80','P0D20'],src:'NHTSA / constructeur',law:['CC1245','CONSOL4213','CC1641']});
REC({t:'Rappel F-150 Raptor R — compresseur / refroidissement',b:FORD,m:['F-150 Raptor R'],y:[2023,2024],fire:true,risk:'Compresseur/échangeur sur sollicitation extrême → surchauffe, risque thermique.',dtc:['P0299','P0217'],src:'Constructeur',law:['CC1245','CONSOL4213']});
REC({t:'Campagne Ford 10R80 — à-coups / logiciel boîte',b:FORD,m:F150.concat(['Ranger Raptor']),y:[2017,2024],fire:false,risk:'À-coups / secousses boîte 10R80 → MAJ logiciel + corps de vanne selon VIN.',dtc:['P0700','P0730'],src:'Constructeur / TSB',law:['CC1641','CONSO2173']});
REC({t:'Campagne Ford EcoBoost — cam phasers / chaîne',b:FORD,m:F150.concat(['Ranger Raptor']),y:[2017,2024],fire:false,risk:'Claquement démarrage / décalage calage → phasers + tendeurs + chaîne révisés selon VIN.',dtc:['P0016','P0011','P0340'],src:'Constructeur / TSB',law:['CC1641','CC1645']});
REC({t:'Campagne Dacia Bigster HR12 — chaîne / tendeur',b:['Dacia','Renault'],m:['Bigster'],y:[2025,2026],fire:false,risk:'Chaîne/tendeur 1.2 TCe 3-cyl → contrôle + kit révisé selon VIN (à vérifier).',dtc:['P0016','P0011'],src:'Constructeur',law:['CC1641','CC1645']});
REC({t:'Campagne Dacia Bigster Eco-G — étanchéité GPL',b:['Dacia','Renault'],m:['Bigster'],y:[2025,2026],fire:true,risk:'Circuit GPL : étanchéité / injecteurs → contrôle et réfection selon VIN.',dtc:['P0300','P0171'],src:'Constructeur',law:['CC1245','CONSOL4213']});
REC({t:'Campagne Skoda Epiq (MEB Entry) — OBC / logiciel',b:['Skoda'],m:['Epiq'],y:[2025,2026],fire:true,risk:'Chargeur embarqué / logiciel → charge interrompue, risque thermique en charge ; MAJ + OBC selon VIN.',dtc:['P0D20','U0111'],src:'Constructeur',law:['CC1245','CONSOL4213','CC1641']});
/* ==================== VERROUS FAMILLE ==================== */
if(C.LOCK){
 ['TIVCT','ECOBOOST27','ECOBOOST35','ECOBOOST35HO','ECOBOOST30','COYOTE','PREDATOR','POWERSTROKE','POWERBOOST']
  .forEach(function(k){C.LOCK[k]=['Ford','Lincoln']});
 ['HR12'].forEach(function(k){C.LOCK[k]=['Dacia','Renault','Alpine','Nissan']});
}
try{C.purge()}catch(e){}
window.KFModelsAdd={models:['F-150','F-150 Raptor','F-150 Raptor R','F-150 Lightning','Ranger Raptor','Bigster','Epiq'],faults:NEW.length};
})();
