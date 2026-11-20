/* KEV FUSION 2026 — obdtech_db.js v1.0.0
   Référentiel TECHNICIEN DIAGNOSTICIEN : passerelles de sécurité constructeur et voies d'accès
   OFFICIELLES (aucun contournement), moniteurs OBD Mode 06, readiness, DID étendus,
   règles d'anomalies consigne/réel, modèle de traçabilité. */
'use strict';
(function(){
/* ---------- passerelles & voies d'accès officielles ---------- */
var GATEWAYS=[
 {id:'sgw',make:'Stellantis (Peugeot, Citroën, DS, Opel, Fiat, Alfa, Jeep, Lancia)',name:'Security Gateway (SGW)',
  years:'2018+',unlock:'autoauth',
  desc:'Passerelle qui filtre les écritures CAN. Le déverrouillage s\'obtient par un compte technicien agréé via le service officiel AutoAuth (abonnement), qui autorise le VIN pour une session.',
  needs:['Compte AutoAuth actif (atelier)','Clé API AutoAuth','VIN du véhicule','Accord du propriétaire'],
  read:'Lecture DTC/JDD/DID libre sans déverrouillage',
  write:'Actionneurs, apprentissages, effacement, écritures DID',
  url:'https://autoauth.com'},
 {id:'sfd',make:'VAG (Volkswagen, Audi, Skoda, SEAT, Cupra)',name:'SFD — Schutz Fahrzeug Diagnose',
  years:'2020+',unlock:'token',
  desc:'Protection par jeton liée au calculateur et au VIN. Le jeton est délivré par le portail constructeur (compte atelier / GeKo / erWin) après authentification de l\'utilisateur.',
  needs:['Compte atelier constructeur','Jeton SFD délivré pour le VIN et le calculateur','Durée de validité limitée'],
  read:'Lecture libre',write:'Adaptations, basic settings, codages, actionneurs',
  url:'Portail constructeur / erWin'},
 {id:'mbauth',make:'Mercedes-Benz / Smart',name:'Authentification diagnostic',
  years:'2021+',unlock:'vendor',
  desc:'Les calculateurs récents exigent une authentification liée à un compte atelier (Xentry / service constructeur). Aucune clé universelle.',
  needs:['Compte atelier Mercedes','Outil/licence constructeur'],read:'Lecture libre',write:'Adaptations, SCN, actionneurs',
  url:'Portail Mercedes Service'},
 {id:'bmwauth',make:'BMW / MINI',name:'Protection calculateurs (ISTA / compte atelier)',
  years:'2018+',unlock:'vendor',
  desc:'Codages et adaptations passent par l\'outillage constructeur authentifié. Les lectures restent ouvertes.',
  needs:['Compte atelier BMW','ISTA / licence'],read:'Lecture libre',write:'Codage, adaptations, actionneurs',
  url:'Portail BMW AOS'},
 {id:'renauth',make:'Renault / Dacia / Alpine',name:'Accès atelier (CLIP / compte constructeur)',
  years:'2018+',unlock:'key',
  desc:'Certaines routines exigent un accès sécurité calculateur. La clé est fournie par la documentation technique constructeur pour le calculateur concerné.',
  needs:['Documentation technique légitime','Clé correspondant au seed du calculateur'],
  read:'Lecture libre',write:'Apprentissages, actionneurs, écritures',url:'Portail Renault Service'},
 {id:'generic',make:'Autres marques',name:'SecurityAccess UDS 0x27',
  years:'variable',unlock:'key',
  desc:'Seed/clé propre à chaque calculateur et fournisseur. La clé provient de la documentation technique ; elle n\'est ni devinée ni calculée par l\'application.',
  needs:['Clé constructeur légitime'],read:'Lecture libre',write:'Routines et écritures protégées',url:'Documentation constructeur'}
];
/* ---------- NRC liés à la sécurité : conduite à tenir LÉGITIME ---------- */
var SECNRC={
 0x33:{l:'SecurityAccessRequired',a:'Obtenir l\'accès officiel (AutoAuth / SFD / compte atelier / clé constructeur) puis réessayer.'},
 0x35:{l:'InvalidKey',a:'Clé erronée : vérifier la référence du calculateur et la documentation correspondante. Ne pas itérer au hasard.'},
 0x36:{l:'ExceedNumberOfAttempts',a:'Nombre de tentatives dépassé : couper le contact, attendre la temporisation constructeur, puis reprendre avec la clé correcte.'},
 0x37:{l:'RequiredTimeDelayNotExpired',a:'Temporisation de sécurité en cours : attendre la durée prescrite avant toute nouvelle tentative.'},
 0x22:{l:'ConditionsNotCorrect',a:'Préconditions véhicule non remplies (température, tension, frein, point mort, contact).'},
 0x7E:{l:'SubFunctionNotSupportedInActiveSession',a:'Ouvrir la session appropriée (étendue / programmation) avant la routine.'}
};
/* ---------- readiness OBD (Mode 01 PID 01) ---------- */
var READY={
 diesel:[{b:0,n:'Misfire'},{b:1,n:'Système carburant'},{b:2,n:'Composants'},{b:3,n:'Catalyseur'},
  {b:4,n:'Catalyseur chauffé'},{b:5,n:'EVAP'},{b:6,n:'Air secondaire'},{b:7,n:'Sonde O2'},
  {b:8,n:'Chauffage O2'},{b:9,n:'EGR / VVT'},{b:10,n:'FAP'},{b:11,n:'NOx / SCR'}],
 petrol:[{b:0,n:'Misfire'},{b:1,n:'Système carburant'},{b:2,n:'Composants'},{b:3,n:'Catalyseur'},
  {b:4,n:'Catalyseur chauffé'},{b:5,n:'EVAP'},{b:6,n:'Air secondaire'},{b:7,n:'Sonde O2'},
  {b:8,n:'Chauffage O2'},{b:9,n:'EGR / VVT'},{b:10,n:'FAP essence'},{b:11,n:'NOx'}]
};
/* ---------- Mode 06 : moniteurs (TID/CID usuels, interprétation) ---------- */
var M06=[
 {mid:'01',n:'Sonde O2 — richesse banco 1',tid:{'01':'Tension de commutation','02':'Temps de réponse riche→maigre','03':'Temps maigre→riche','04':'Amplitude'}},
 {mid:'02',n:'Sonde O2 — banco 2',tid:{'01':'Tension','02':'Temps de réponse','03':'Amplitude'}},
 {mid:'03',n:'Catalyseur — efficacité',tid:{'01':'Indice d\'efficacité','02':'Test de stockage O2'}},
 {mid:'04',n:'EGR — débit / position',tid:{'01':'Erreur de position','02':'Débit hors plage'}},
 {mid:'05',n:'FAP — charge / régénération',tid:{'01':'Charge suies','02':'Cendres','03':'Intervalle régénération'}},
 {mid:'06',n:'Ratés d\'allumage',tid:{'01':'Compteur cyl.1','02':'cyl.2','03':'cyl.3','04':'cyl.4','05':'Global'}},
 {mid:'07',n:'Système carburant — corrections',tid:{'01':'Correction court terme','02':'Correction long terme'}},
 {mid:'08',n:'EVAP — étanchéité',tid:{'01':'Fuite grosse','02':'Fuite fine'}},
 {mid:'09',n:'SCR / NOx',tid:{'01':'Efficacité','02':'Dosage urée','03':'Capteur NOx'}},
 {mid:'0A',n:'Turbo / suralimentation',tid:{'01':'Erreur de pression','02':'Position actuateur'}},
 {mid:'0B',n:'Batterie HT / hybride',tid:{'01':'Isolement','02':'Déséquilibre','03':'SOC'}}
];
/* ---------- DID étendus à balayer en LECTURE (ouverts, sans clé) ---------- */
var DID_SWEEP=[
 ['F100','F1FF'],['0100','012F'],['F400','F43F'],['2000','201F'],['2100','211F'],['0200','020F']
];
var DID_HINT={
 F100:'Configuration véhicule',F101:'Options',F110:'Type moteur',F111:'Type boîte',F120:'Cylindrée',
 '0100':'Compteur / occurrence','0101':'Vieillissement','0102':'Guérison','0110':'Apprentissage 1','0111':'Apprentissage 2',
 F400:'Tension batterie',F401:'Température liquide',F402:'Régime',F403:'Vitesse',F405:'Kilométrage',
 F40C:'Rapport engagé',F40D:'Pression boîte',F40E:'Température huile boîte',F410:'Usure embrayage',
 F411:'Point de léchage',F420:'SOC HT',F421:'SOH HT',F422:'Isolement HT',F423:'Tension pack HT',
 '2000':'Consigne pression suralimentation','2001':'Pression réelle','2002':'Consigne EGR','2003':'EGR réel',
 '2100':'Consigne couple','2101':'Couple réel'
};
/* ---------- règles d'anomalies consigne / réel ---------- */
var RULES=[
 {id:'boost',n:'Suralimentation — écart consigne/réel',want:'2000',real:'2001',tol:15,unit:'kPa',
  fault:'Turbo / wastegate / géométrie variable / fuite admission',dtc:['P0299','P0234'],
  advice:'Contrôler tringlerie et actuateur, durites, échangeur, lubrification turbo, capteur de pression.'},
 {id:'egr',n:'EGR — écart consigne/réel',want:'2002',real:'2003',tol:12,unit:'%',
  fault:'Vanne EGR encrassée / grippée, refroidisseur',dtc:['P0400','P0401','P0402'],
  advice:'Endoscopie EGR, test course vanne, mise en pression circuit LDR (couvaison).'},
 {id:'torque',n:'Couple — écart consigne/réel',want:'2100',real:'2101',tol:18,unit:'%',
  fault:'Injection / suralimentation / limitation calculateur',dtc:['P0087','P0299'],
  advice:'Pression rail, débits injecteurs, pression suralimentation, mode dégradé.'},
 {id:'stft',n:'Correction carburant court terme excessive',pid:'06',lim:15,unit:'%',
  fault:'Prise d\'air, débitmètre, pression carburant, injecteurs',dtc:['P0171','P0172'],
  advice:'Recherche fuite admission fumigène, MAF, pression rail, sonde O2.'},
 {id:'ltft',n:'Correction carburant long terme excessive',pid:'07',lim:12,unit:'%',
  fault:'Dérive mélange persistante',dtc:['P0171','P0172'],
  advice:'Contrôle étanchéité admission/échappement, MAF, injecteurs, pression carburant.'},
 {id:'vbat',n:'Tension de charge insuffisante',pid:'42',min:13.2,max:15.0,unit:'V',running:true,
  fault:'Alternateur / régulateur / courroie / masses',dtc:['P0562','P0620'],
  advice:'Test alternateur en charge, chute de tension masses, courroie accessoire, poulie découplée.'},
 {id:'cool',n:'Température liquide anormalement basse',pid:'05',max:70,unit:'°C',running:true,warm:600,
  fault:'Calorstat bloqué ouvert',dtc:['P0128'],
  advice:'Test calorstat, sonde de température, temps de montée en température.'},
 {id:'oil',n:'Écart température huile / liquide excessif',pid:'5C',delta:'05',lim:22,unit:'°C',running:true,
  fault:'Refroidissement huile / échangeur / dilution carburant',dtc:['P0521'],
  advice:'Analyse huile (dilution), échangeur huile/eau, pression huile à chaud.'}
];
/* ---------- modèle de traçabilité ---------- */
var TRACE={
 fields:['technicien','atelier','agrement','vin','km','date','objet','baseLegale'],
 mentions:[
  'Intervention réalisée par un professionnel sur véhicule confié, avec accord du propriétaire.',
  'Les lectures (DTC, JDD, DID, moniteurs) sont réalisées via les services de diagnostic ouverts, sans clé d\'accès.',
  'Les écritures, actionneurs et apprentissages ne sont exécutés qu\'après obtention de l\'accès officiel correspondant (AutoAuth/SGW, jeton SFD, compte atelier ou clé constructeur).',
  'Aucune protection de calculateur n\'est contournée. Aucun compteur kilométrique n\'est modifié.',
  'Document d\'aide à l\'expertise : il ne constitue pas une expertise judiciaire contradictoire.'
 ]
};
window.KFObdTechDB={GATEWAYS:GATEWAYS,SECNRC:SECNRC,READY:READY,M06:M06,DID_SWEEP:DID_SWEEP,DID_HINT:DID_HINT,
 RULES:RULES,TRACE:TRACE};
})();
