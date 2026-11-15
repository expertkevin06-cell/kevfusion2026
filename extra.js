/* KEV FUSION 2026 — extra.js v3.2.0 · AutoDiag Pro/Formation + Auto-Droit Smart (natif) */
(function(){
'use strict';
if(typeof KBall!=='function'){console.warn('extra.js: app.js non chargé');return}
/* ---- module externe Auto-Droit Smart ---- */
if(!MODULES.find(m=>m.k==='droitsmart'))MODULES.push({k:'droitsmart',n:'Auto-Droit Smart',i:'🧠',u:'https://auto-droit-smart.base44.app/',d:'Assistant juridique auto intelligent (accès admin)'});
if(typeof MODULE_FALLBACKS==='object')MODULE_FALLBACKS.droitsmart=['https://auto-droit-smart.base44.app/','https://auto-droit-smart.base44.app'];
/* ---- listes officielles AutoDiag Pro ---- */
const FX_SYSTEMES=['Moteur','Transmission','Embrayage','Batterie & BMS','Charge','ADAS / Caméras','Multimédia','Sécurité (airbag/ceintures)','Direction','Freinage','Échappement / FAP / Catalyseur','Refroidissement','Carrosserie / Corrosion / Infiltration','Suspension / Ressorts / Amortisseurs','Électricité','Électronique / Calculateurs'];
const FX_TYPES=['Mécanique','Électrique','Électronique'];
const FX_ENERGIES=['Essence','FlexFuel / GPL','Diesel','Hybride','Électrique'];
const FX_COMPOSANTS=['Alternateur','Amortisseur','Antenne GPS','Batterie 12V','Batterie 48V','Batterie haute tension','BMS','Bielle','Bloc moteur','Bobine d\'allumage','Bougies d\'allumage','Boîte de vitesses','Boîtier ABS','Boîtier ESP','Boîtier airbag','Boîtier moteur (ECU)','Calculateur direction assistée','Caméra ADAS','Caméra de recul','Capteur NOx','Capteur PMH','Capteur d\'angle de braquage','Capteur de pression','Capteur de pression FAP','Capteur de pression pneus (TPMS)','Capteur de température','Cardan','Catalyseur','Chaîne de distribution','Courroie de distribution','Culasse','Débitmètre','Démarreur','Différentiel','Direction assistée','Disque de frein','Embrayage','Faisceau électrique','Filtre à huile','Filtre à particules (FAP)','Flexible de frein','Fuite de courant parasitaire','Injecteurs','Joint de culasse','Liquide de refroidissement','Maître-cylindre','Module 4G/5G','Module Bluetooth','Module WiFi','Moteur de ventilateur','Onduleur','Phares','Plaquette de frein','Pompe à eau','Pompe à huile','Pompe à injection','Pompe haute pression','Radiateur','Roulement de roue','Rotule de direction','Sonde Lambda','Sonde de température','Soupape','Synchroniseurs boîte','Tablette multimédia','Thermostat','Transpondeur clé','Triangle de suspension','Turbo','Vanne EGR','Vilebrequin','Volant moteur','Volant moteur bi-masse','Échappement','Écran tactile','Étrier de frein','Convertisseur DC/DC','Connecteur de charge','Pompe à chaleur'];
function fxMeta(k){const t=(k.t+' '+k.mec+' '+k.s+' '+k.dtc.join(' ')).toLowerCase();
 const energie=/diesel|hdi|tdi|dci|bluehdi|cdti|jtd|multijet|ecoblue|skyactiv-d/.test(t)?'Diesel':/électrique|pack ht|bms|leaf|tesla|charge|dcdc|dc\/dc/.test(t)?'Électrique':/hybride|hybrid|e:hev|phev|inverter/.test(t)?'Hybride':'Essence';
 const type=/électronique|calculateur|bsi|can|u0|u1|écran|multimédia|adas|capteur|transpondeur/.test(t)?'Électronique':/électrique|batterie|alternateur|démarreur|faisceau|bobine|bougie|12v|charge|onduleur/.test(t)?'Électrique':'Mécanique';
 const comp=FX_COMPOSANTS.find(c=>t.includes(c.toLowerCase().split(' ')[0].split('(')[0].trim()))||'';
 const sys=FX_SYSTEMES.find(s=>t.includes(s.toLowerCase().split(' ')[0].split('/')[0].trim()))||k.s;
 return{energie,type,comp,sys}}
function fxRecall(k){return Rall().find(r=>(r.b.includes('*')||r.b.some(b=>k.b.includes(b)))&&(r.dtc||[]).some(d=>k.dtc.includes(d)))}
/* ---- Formation : cours + quiz ---- */
const FORMATION=[
{sys:'Distribution',title:'Distribution : chaîne vs courroie',lessons:[{t:'Rôle',txt:'Synchroniser vilebrequin et arbre à cames. Décalage = contact soupapes/pistons.'},{t:'Chaîne',txt:'Graissée par l\'huile moteur ; tendeur hydraulique. Usure → allongement → claquement à froid (N47, EP6, EA888). DTC P0016/P0017.'},{t:'Courroie humide',txt:'1.2 PureTech : courroie dans l\'huile → délamination → débris → crépine colmatée → chute pression huile (P0521). Huile spec + vidanges courtes.'},{t:'Preuves',txt:'Gabarit courroie, pression huile à chaud, lecture déphasage, écoute démarrage, endoscopie.'}],quiz:[{q:'Quel DTC évoque un décalage arbre à cames / vilebrequin ?',a:['P0016','P0401','P0562'],c:0},{q:'La courroie humide 1.2 PureTech baigne dans…',a:['le liquide de refroidissement','l\'huile moteur','le carburant'],c:1},{q:'Un claquement à froid côté boîte sur BMW N47 évoque…',a:['la chaîne de distribution','le turbo','l\'embrayage'],c:0}]},
{sys:'EGR / FAP',title:'EGR, FAP et risque incendie',lessons:[{t:'EGR',txt:'Recircule les gaz pour réduire les NOx. Refroidisseur EGR : fuite glycol + suies → couvaison → feu baie moteur (PSA, BMW diesel).'},{t:'FAP',txt:'Piège les suies ; régénération > 600 °C. Colmatage (P2463) → mode dégradé. Risque feu sous caisse sur végétation sèche.'},{t:'Après MAJ émissions',txt:'EA189 : EGR/FAP plus sollicités → encrassement accéléré, dilution huile.'},{t:'Sécurité',txt:'Immobiliser si odeur de brûlé ; vérifier campagne rappel VIN.'}],quiz:[{q:'Le refroidisseur EGR qui fuit peut provoquer…',a:['un incendie baie moteur','une crevaison','un défaut de clim'],c:0},{q:'P2463 correspond à…',a:['colmatage FAP','défaut airbag','batterie faible'],c:0},{q:'En régénération FAP, il faut éviter…',a:['l\'autoroute','stationner sur herbe sèche','le mode sport'],c:1}]},
{sys:'Injection',title:'Injection essence / diesel',lessons:[{t:'Diesel common rail',txt:'Injecteurs piézo/électromagnétiques ; coking → ratés, fumée (P0201-P0204). Test débits retour.'},{t:'Essence directe',txt:'Calamine admission (EP6, GDI) ; LSPI sur petits turbo → casse piston. Huile anti-LSPI.'},{t:'Pompe HP',txt:'Pression rail basse (P0087) → perte puissance, mode dégradé (THP).'}],quiz:[{q:'Le coking diesel touche…',a:['les injecteurs','les plaquettes','le catalyseur seul'],c:0},{q:'LSPI signifie…',a:['Low Speed Pre-Ignition','Low Signal Pressure Input','Long Service Period Interval'],c:0}]},
{sys:'Pack HT / VE',title:'Véhicule électrique : pack HT & charge',lessons:[{t:'Emballement',txt:'Court interne cellule Li-ion → emballement → jet-fire + gaz HF/CO (P0AA6). Périmètre, extinction adaptée, pas de recharge.'},{t:'SOH / BMS',txt:'Vieillissement/déséquilibre → autonomie réduite (P0A1F). Lecture BMS, équilibrage.'},{t:'Charge / DC-DC',txt:'Connecteur/chargeur/BMS → charge impossible ; DC/DC HS → 12V non chargée → immobilisation.'}],quiz:[{q:'P0AA6 évoque…',a:['isolement/emballement pack HT','un défaut EGR','une bougie'],c:0},{q:'Un DC/DC HS provoque…',a:['une batterie 12V déchargée','une fuite huile','un défaut FAP'],c:0}]},
{sys:'Boîte de vitesses',title:'Boîtes auto : DSG, EAT, CVT, ZF',lessons:[{t:'DSG7 DQ200',txt:'Embrayage à sec + mécatronic → à-coups, patinage (P0700).'},{t:'CVT Jatco',txt:'Courroie/poulies → surchauffe, patinage ; huile NS-3.'},{t:'ZF8 / EAT',txt:'Vidange ATF + adaptations ; à-coups si entretien négligé.'}],quiz:[{q:'La DSG7 DQ200 utilise…',a:['un embrayage à sec','un convertisseur seul','une courroie CVT'],c:0}]},
{sys:'Freinage / ADAS',title:'Freinage, ABS/ESP et ADAS',lessons:[{t:'ABS/ESP',txt:'Capteur roue/boîtier → désactivation (C0035, U0121). Freinage dégradé.'},{t:'ADAS',txt:'Caméra/radar : calibration après choc/pare-brise → faux positifs, désactivation.'}],quiz:[{q:'Après remplacement de pare-brise, il faut…',a:['recalibrer la caméra ADAS','changer le FAP','vidanger la boîte'],c:0}]},
{sys:'Refroidissement',title:'Surchauffe & joint de culasse',lessons:[{t:'Causes',txt:'Thermostat bloqué, pompe à eau, fuite LDR, joint de culasse (P0217/P0128).'},{t:'Risque thermique',txt:'Fuite huile/LDR sur échappement → auto-inflammation (Ford EcoBoost, Subaru EJ).'}],quiz:[{q:'Bulles dans le LDR + mayonnaise évoquent…',a:['un joint de culasse','un pneu','un défaut multimédia'],c:0}]},
{sys:'Juridique auto',title:'Vice caché, conformité, dol',lessons:[{t:'Vice caché (1641)',txt:'Caché, antérieur, grave. Pro ou particulier. 2 ans après découverte (1648).'},{t:'Conformité (L217-3)',txt:'Vendeur pro, 2 ans ; présomption 24/12 mois (L217-7) ; mise en conformité 30 j (L217-10).'},{t:'Dol (1137)',txt:'Dissimulation intentionnelle → nullité + DI, 5 ans découverte.'},{t:'Réparateur (1231-1)',txt:'Obligation de résultat : panne persistante après intervention → responsabilité.'}],quiz:[{q:'La garantie légale de conformité s\'applique contre…',a:['un vendeur professionnel','un particulier uniquement','n\'importe qui sans condition'],c:0},{q:'Le délai du vice caché court à compter de…',a:['la découverte du vice','la vente','la mise en demeure'],c:0}]}
];
/* ---- Auto-Droit Smart : règles express ---- */
function AD(keys,title,qual,articles,quiPaie,delais,demarches,doc,cat){return{keys,title,qual,articles,quiPaie,delais,demarches,doc,cat}}
const AD_RULES=[
AD(['vice caché','moteur cassé','casse moteur','chaîne','courroie','distribution','culasse','joint'],'Vice caché — défaut grave moteur',
 'Défaut caché, antérieur à la vente, rendant le véhicule impropre à l\'usage → garantie des vices cachés.',
 ['CC1641','CC1644','CC1648','CC1645'],
 'Le vendeur (pro ou particulier) restitue le prix ou réduit le prix ; s\'il connaissait le vice, tous dommages-intérêts (1645).',
 '2 ans à compter de la découverte du vice (1648), plafond 20 ans (2232).',
 ['Expertise amiable contradictoire','Mise en demeure LRAR (résolution/réduction)','Médiation si pro','Assignation TJ'],
 'med','vicecache'),
AD(['garantie','conformité','occasion','professionnel',' concession','défaut à la livraison'],'Garantie légale de conformité (pro)',
 'Défaut de conformité existant à la délivrance, vendeur professionnel.',
 ['CONSO2173','CONSO2177','CONSO21710','CONSO21712'],
 'Le vendeur pro met en conformité sans frais (réparation/remplacement) ; à défaut réduction/résolution.',
 '2 ans après délivrance ; présomption 24 mois neuf / 12 mois occasion ; mise en conformité 30 jours.',
 ['Demande de mise en conformité LRAR','Réduction/résolution si refus ou >30 j','Médiateur conso','Tribunal'],
 'medconfo','conformite'),
AD(['garage','réparation','réparé','après entretien','panne après','facture garage','mécano'],'Obligation de résultat du réparateur',
 'Le garage est tenu d\'un résultat : panne persistante ou nouvelle après intervention → responsabilité contractuelle.',
 ['CC12311','CC12316'],
 'Le réparateur remet en état sans frais ou indemnise ; sauf cause étrangère prouvée.',
 '5 ans (2224).',
 ['Constat de l\'échec par un tiers','Mise en demeure LRAR au garage','Expertise contradictoire','Médiation puis TJ'],
 'med','reparateur'),
AD(['incendie','feu','brûlé','flamme','cramé','sinistre feu'],'Incendie / produit défectueux',
 'Dommage par défaut de sécurité du produit → producteur responsable de plein droit ; dommages aux tiers (1240).',
 ['CC1245','CONSOL4213','CC1240'],
 'Producteur/vendeur indemnise intégralement ; assurance joue puis recours ; tiers indemnisés (1240).',
 'Déclaration assurance 5 j ouvrés ; action 3 ans après connaissance ; forclusion 10 ans.',
 ['Préserver les preuves (ne pas déblayer)','Déclaration assurance','Expertise contradictoire','Mise en demeure producteur/vendeur','Signalement RappelConso','Tribunal'],
 'assurance','incendie'),
AD(['compteur','kilométrage','trafiqué','dol','tromperie','maquillé','accident caché','histovec'],'Dol / tromperie / compteur',
 'Dissimulation intentionnelle d\'une information déterminante (sinistre, km) → nullité + dommages-intérêts ; escroquerie possible.',
 ['CC1137','CC1144','CP3131','CONSOL1212'],
 'Le vendeur restitue le prix + dommages-intérêts ; sanctions pénales si manœuvres frauduleuses.',
 '5 ans après découverte (1144) ; plainte pénale 6 ans.',
 ['Documenter (HistoVec, annonce, messages)','Mise en demeure nullité','Dépôt de plainte','Tribunal'],
 'med','dol'),
AD(['assurance','refus','indemnisation','expert assurance','offre','sinistre'],'Litige assurance / indemnisation',
 'L\'assureur doit une offre motivée ; retard ou offre insuffisante → contestation et intérêts.',
 ['ASS_L2119','ASS_L1132','BADINTER'],
 'L\'assureur indemnise selon garanties ; offre sous 8 mois (accident) ; intérêts doublés si retard.',
 'Déclaration 5 j ouvrés ; offre 8 mois ; contestation selon contrat.',
 ['Déclarer le sinistre','Suivre expertise / consolidation','Contester l\'offre par LRAR','Médiateur assurance puis ACPR'],
 'sinistre','autre'),
AD(['rappel','campagne','tsb','constructeur','sécurité','takata','egr rappel'],'Rappel constructeur / sécurité',
 'Défaut de sécurité → obligation générale de sécurité ; campagne de rappel à vérifier par VIN.',
 ['CONSOL4213','CC1245'],
 'Le constructeur prend en charge la campagne ; préjudices indemnisables (1245).',
 'Vérifier rappel par VIN ; action 3 ans après connaissance du dommage.',
 ['Vérifier rappel VIN (NHTSA/RappelConso)','Mise en demeure si refus de prise en charge','Signalement DGCCRF','Tribunal si préjudice'],
 'dgccrf','incendie'),
AD(['batterie','ve','électrique','autonomie','soh','pack ht','charge impossible'],'VE : batterie / autonomie / charge',
 'Dégradation anormale du pack HT ou défaut de charge → conformité (pro) ou vice caché ; garantie constructeur batterie.',
 ['CONSO2173','CC1641','CONSO_L21721'],
 'Vendeur pro / constructeur selon garantie batterie (souvent 8 ans/160 000 km) ; vice caché sinon.',
 'Conformité 2 ans ; garantie batterie selon contrat ; vice caché 2 ans découverte.',
 ['Lecture SOH/BMS','Mise en demeure vendeur/constructeur','Expertise pack HT','Médiation puis TJ'],
 'medconfo','conformite'),
AD(['achat','distance','internet','rétractation','livraison','colis','commande'],'Achat à distance / livraison',
 'Vente à distance : rétractation 14 j ; livraison 30 j max ; conformité.',
 ['CONSO_L22118','CONSO_L2161','CONSO2173'],
 'Le vendeur pro rembourse sous 14 j après rétractation/retour ; livre sous 30 j.',
 'Rétractation 14 j ; livraison 30 j ; conformité 2 ans.',
 ['Rétractation ou MED livraison','Médiateur conso','Signalement DGCCRF','Tribunal'],
 'retract','conformite'),
AD(['expertise','contradictoire','expert','constat','preuve'],'Expertise & preuve',
 'L\'expertise amiable contradictoire établit nature, origine, antériorité ; charge de la preuve sur le demandeur (1353).',
 ['CC1353','CC1641','CC12311'],
 'Chacune des parties supporte ses frais d\'expertise ; remboursement possible au fond (700 CPC).',
 'Convoquer par LRAR ; à défaut de présence, expertise réputée contradictoire.',
 ['Constituer les preuves','Convoquer l\'expertise contradictoire','Rapport écrit','Mise en demeure puis TJ'],
 'expertise','autre')
];
const AD_CHIPS=['Vice caché moteur','Garantie conformité occasion','Panne après réparation garage','Incendie véhicule','Compteur trafiqué / dol','Refus assurance','Rappel constructeur','Batterie VE / autonomie','Achat à distance','Expertise contradictoire'];
/* ---- état ---- */
const FX={view:'filters',course:null,quiz:null,answers:{},filters:{}};
const AD={result:null,tab:'analyse'};
function fxProgress(){return ls.get('fx_progress',{})}
function adHist(){return ls.get('ad_history',[])}
/* ---- navigation ---- */
if(!NAV.find(n=>n[0]==='formation')){const i=NAV.findIndex(n=>n[0]==='etude');NAV.splice(i+1,0,['formation','🎓 Formation'])}
if(!NAV.find(n=>n[0]==='droitsmart')){const i=NAV.findIndex(n=>n[0]==='jr');NAV.splice(i+1,0,['droitsmart','🧠 Auto-Droit'])}
const _switch=window.switchView;
window.switchView=function(v){if(v==='formation'){S.view=v;$('#nav').innerHTML=NAV.map(([k,l])=>`<button data-act="nav" data-k="${k}" class="${k===v?'act':''}">${l}</button>`).join('');renderFormation();return}
 if(v==='droitsmart'){S.view=v;$('#nav').innerHTML=NAV.map(([k,l])=>`<button data-act="nav" data-k="${k}" class="${k===v?'act':''}">${l}</button>`).join('');renderAD();return}
 return _switch(v)};
const _home=window.renderHome;
window.renderHome=function(){_home();const v=$('#view');if(v)v.insertAdjacentHTML('beforeend',`<div class="card"><h2>🆕 Modules fusionnés</h2><div class="row"><button class="pri" data-act="nav" data-k="formation">🎓 AutoDiag Pro / Formation</button><button class="jr" data-act="nav" data-k="droitsmart">🧠 Auto-Droit Smart</button><button data-act="openModule" data-k="form">🎓 Module AutoDiag</button><button data-act="openModule" data-k="droitsmart">🧠 Module Auto-Droit</button></div></div>`)};
/* ---- auto-vérif : tests additionnels ---- */
const _rc=window.runChecks;
window.runChecks=async function(){await _rc();try{
 const add=[['Formation AutoDiag Pro',FORMATION.length>=6&&FX_COMPOSANTS.length>=60?{st:'ok',info:FORMATION.length+' cours · '+FX_COMPOSANTS.length+' composants · '+KBall().length+' fiches'}:{st:'warn',info:'incomplet'}],
 ['Auto-Droit Smart',AD_RULES.length>=8?{st:'ok',info:AD_RULES.length+' scénarios · '+AD_CHIPS.length+' questions express'}:{st:'warn',info:'incomplet'}]];
 const list=$('#checkList');
 for(const[n,r]of add){S.check.results.push({name:n,...r});if(list)list.insertAdjacentHTML('beforeend',`<li class="st-${r.st}"><span>${r.st==='ok'?'✅':'⚠️'}</span><span><b>${esc(n)}</b> — <span class="mut">${esc(r.info)}</span></span></li>`)}
 const coreFail=S.check.results.filter(r=>r.st==='fail'&&CORE.includes(r.name)).length;
 const warns=S.check.results.filter(r=>r.st==='warn').length;
 const modOk=S.check.results.filter(r=>r.name.startsWith('Module ')&&r.st==='ok').length;
 const v=coreFail?'CRITIQUE — mode dégradé':warns?'DÉGRADÉ — fonctionnel ('+modOk+'/'+MODULES.length+' modules)':'CONFORME — opérationnel';
 S.check.verdict=v;const vd=$('#verdict');if(vd)vd.innerHTML=`<span class="${coreFail?'st-fail':warns?'st-warn':'st-ok'}">${coreFail?'❌':warns?'⚠️':'✅'} ${v}</span>`;
}catch(e){}};
/* ================= FORMATION / AUTODIAG PRO ================= */
function renderFormation(){
 $('#view').innerHTML=`<div class="card"><h2>🎓 AutoDiag Pro / Formation</h2>
 <p class="mut">Navigateur de diagnostic multi-filtres (marque, modèle, motorisation, système, type, composant, DTC) sur toute la base fusionnée + cours et quiz.</p>
 <div class="row"><button data-fx="tab" data-k="filters" class="${FX.view==='filters'?'pri':''}">🔍 Filtres</button><button data-fx="tab" data-k="courses" class="${FX.view==='courses'?'pri':''}">📚 Cours</button><button data-fx="tab" data-k="quiz" class="${FX.view==='quiz'?'pri':''}">🧪 Quiz</button><button data-act="openModule" data-k="form">🎓 Module AutoDiag</button></div></div><div id="fxBody"></div>`;
 if(FX.view==='filters')fxFilters();else if(FX.view==='courses')fxCourses();else fxQuizList()}
function fxFilters(){const v=VEHall();const f=FX.filters;
 const marques=[...new Set([...Object.keys(v),...KBall().flatMap(k=>k.b).filter(b=>b!=='*')])].sort();
 $('#fxBody').innerHTML=`<div class="card"><h2>🔍 Filtres de recherche</h2>
 <div class="grid g3">
 <div><label>Marque</label><select id="fxMarque"><option value="">Toutes les marques</option>${marques.map(m=>`<option ${f.marque===m?'selected':''}>${esc(m)}</option>`).join('')}</select></div>
 <div><label>Modèle</label><select id="fxModele"><option value="">Tous les modèles</option>${(f.marque&&v[f.marque]?Object.keys(v[f.marque]):[]).map(m=>`<option ${f.modele===m?'selected':''}>${esc(m)}</option>`).join('')}</select></div>
 <div><label>Motorisation précise</label><select id="fxMotor"><option value="">Toutes motorisations</option>${(f.marque&&f.modele&&v[f.marque]&&v[f.marque][f.modele]?v[f.marque][f.modele]:[]).map(m=>`<option ${f.motor===m?'selected':''}>${esc(m)}</option>`).join('')}</select></div>
 <div><label>Type motorisation</label><select id="fxEnergie"><option value="">Tous types</option>${FX_ENERGIES.map(e=>`<option ${f.energie===e?'selected':''}>${e}</option>`).join('')}</select></div>
 <div><label>Système</label><select id="fxSys"><option value="">Tous systèmes</option>${FX_SYSTEMES.map(s=>`<option ${f.sys===s?'selected':''}>${s}</option>`).join('')}</select></div>
 <div><label>Type de panne</label><select id="fxType"><option value="">Tous types</option>${FX_TYPES.map(t=>`<option ${f.type===t?'selected':''}>${t}</option>`).join('')}</select></div>
 <div><label>Composant</label><select id="fxComp"><option value="">Tous composants</option>${FX_COMPOSANTS.map(c=>`<option ${f.comp===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
 <div><label>Code défaut OBD</label><input id="fxDtc" value="${esc(f.dtc||'')}" placeholder="P0016"></div>
 <div><label>Recherche libre</label><input id="fxQ" value="${esc(f.q||'')}" placeholder="courroie, EGR, incendie…"></div></div>
 <div class="row"><button class="pri" data-fx="apply">Appliquer</button><button data-fx="reset">Réinitialiser</button></div></div>
 <div id="fxRes"></div>`;
 ['fxMarque','fxModele'].forEach(id=>{const el=$('#'+id);el&&el.addEventListener('change',()=>{fxRead();fxFilters()})});
 fxApply()}
function fxRead(){FX.filters={marque:$('#fxMarque').value,modele:$('#fxModele').value,motor:$('#fxMotor').value,energie:$('#fxEnergie').value,sys:$('#fxSys').value,type:$('#fxType').value,comp:$('#fxComp').value,dtc:$('#fxDtc').value.trim().toUpperCase(),q:$('#fxQ').value.trim().toLowerCase()}}
function fxApply(){const f=FX.filters;const res=KBall().filter(k=>{const m=fxMeta(k);const blob=(k.t+' '+k.b.join(' ')+' '+k.s+' '+k.dtc.join(' ')+' '+k.mec+' '+k.sym.join(' ')).toLowerCase();
 if(f.marque&&!k.b.includes(f.marque)&&!k.b.includes('*'))return false;
 if(f.modele&&!blob.includes(f.modele.toLowerCase()))return false;
 if(f.motor&&!blob.includes(f.motor.toLowerCase().split(' ')[0]))return false;
 if(f.energie&&m.energie!==f.energie.split(' ')[0])return false;
 if(f.sys&&m.sys!==f.sys&&!k.s.toLowerCase().includes(f.sys.toLowerCase().split(' ')[0]))return false;
 if(f.type&&m.type!==f.type)return false;
 if(f.comp&&m.comp!==f.comp)return false;
 if(f.dtc&&!k.dtc.includes(f.dtc))return false;
 if(f.q&&!blob.includes(f.q))return false;
 return true});
 $('#fxRes').innerHTML=`<div class="card"><h2>📋 Résultats ${res.length}</h2></div>`+res.map(k=>{const m=fxMeta(k);const rc=fxRecall(k);return`<div class="card"><h3>${esc(k.t)}</h3>
 <p class="mut"><b>Composant :</b> ${esc(m.comp||'—')}</p>
 <span class="badge">${esc(m.sys)}</span>${k.dtc.slice(0,3).map(d=>`<span class="badge b-dtc">${d}</span>`).join('')}<span class="badge">${m.type}</span><span class="badge">${esc(k.b.slice(0,3).join(', '))}</span><span class="badge">${m.energie}</span>
 <span class="badge ${k.g==='Critique'?'b-crit':k.g==='Élevé'?'b-elev':'b-mod'}">${k.g==='Critique'?'🔴':k.g==='Élevé'?'🟡':'🟢'} ${k.g}</span>${rc?'<span class="badge b-fire">📢 TSB/Rappel</span>':''}${k.f?'<span class="badge b-fire">🔥 incendie</span>':''}
 <p class="mut">${esc(k.mec)}</p>
 <div class="row"><button data-fx="fiche" data-k="${k.id}">📋 Fiche</button><button data-act="studyFrom" data-k="${k.id}">🧠 Étudier</button><button data-fx="toAD" data-k="${k.id}">🧠 Auto-Droit</button></div></div>`}).join('')}
function fxFiche(id){const k=KBall().find(x=>x.id===id);if(!k)return;const m=fxMeta(k);const rc=fxRecall(k);
 openModal(`<h2>📋 ${esc(k.t)}</h2>
 <p class="mut">${esc(m.sys)} · ${m.type} · ${m.energie} · ${esc(k.b.join(', '))} · ${k.g}${rc?' · 📢 TSB/Rappel':''}</p>
 <p><b>DTC :</b> ${k.dtc.join(', ')||'—'}</p><p><b>Mécanisme :</b> ${esc(k.mec)}</p>${k.ch?`<p class="b-fire"><b>Chaîne incendie :</b> ${esc(k.ch)}</p>`:''}
 <p><b>Conséquences :</b> ${k.cons.map(esc).join(' ; ')}</p><p><b>Preuves :</b> ${k.prv.map(esc).join(' ; ')}</p><p><b>Tests :</b> ${k.tst.map(esc).join(' ; ')}</p><p><b>Sécurité :</b> ${esc(k.sec)}</p>
 <p><b>Juridique :</b> ${k.law.map(id=>{const t=txtById(id);return t?esc(t.ref):''}).filter(Boolean).join(' ; ')}</p>
 ${rc?`<p class="b-fire"><b>Rappel :</b> ${esc(rc.t)} — ${esc(rc.risk)}</p>`:''}
 <div class="row"><button data-act="studyFrom" data-k="${k.id}">🧠 Étudier</button><button data-fx="toAD" data-k="${k.id}">🧠 Auto-Droit</button><button data-act="closeModal">Fermer</button></div>`)}
function fxCourses(){const p=fxProgress();$('#fxBody').innerHTML=`<div class="card"><h2>📚 Cours par système</h2><div class="grid g2">${FORMATION.map((c,i)=>`<div class="card"><h3>${esc(c.title)}</h3><p class="mut">${esc(c.sys)} · ${c.lessons.length} leçons · ${c.quiz.length} questions ${p[i]?'· ✅ '+p[i]+'%':''}</p><div class="row"><button class="pri" data-fx="course" data-k="${i}">📖 Ouvrir</button><button data-fx="quiz" data-k="${i}">🧪 Quiz</button></div></div>`).join('')}</div></div>`}
function fxCourse(i){const c=FORMATION[i];FX.course=i;$('#fxBody').innerHTML=`<div class="row" style="margin-bottom:8px"><button data-fx="tab" data-k="courses">← Cours</button><b>📖 ${esc(c.title)}</b></div>
 ${c.lessons.map((l,n)=>`<div class="card"><h3>${n+1}. ${esc(l.t)}</h3><p>${esc(l.txt)}</p></div>`).join('')}
 <div class="row"><button class="pri" data-fx="quiz" data-k="${i}">🧪 Passer le quiz</button><button data-act="nav" data-k="etude">🧠 Étude croisée</button></div>`}
function fxQuizList(){$('#fxBody').innerHTML=`<div class="card"><h2>🧪 Quiz</h2><div class="grid g2">${FORMATION.map((c,i)=>`<button data-fx="quiz" data-k="${i}">🧪 ${esc(c.title)}</button>`).join('')}</div></div>`}
function fxQuiz(i){const c=FORMATION[i];FX.quiz=i;FX.answers={};$('#fxBody').innerHTML=`<div class="row" style="margin-bottom:8px"><button data-fx="tab" data-k="courses">← Cours</button><b>🧪 ${esc(c.title)}</b></div>
 ${c.quiz.map((q,qi)=>`<div class="card"><h3>Q${qi+1}. ${esc(q.q)}</h3>${q.a.map((a,ai)=>`<label class="row" style="gap:8px"><input type="radio" name="fxq${qi}" data-fxq="${qi}" value="${ai}" style="width:auto"> ${esc(a)}</label>`).join('')}</div>`).join('')}
 <button class="pri" data-fx="quizSubmit" data-k="${i}">✅ Valider le quiz</button><div id="fxScore"></div>`}
function fxQuizSubmit(i){const c=FORMATION[i];let ok=0;c.quiz.forEach((q,qi)=>{const sel=document.querySelector(`input[name="fxq${qi}"]:checked`);if(sel&&+sel.value===q.c)ok++});
 const pct=Math.round(ok/c.quiz.length*100);const p=fxProgress();p[i]=pct;ls.set('fx_progress',p);
 $('#fxScore').innerHTML=`<div class="card"><h2 class="${pct>=70?'st-ok':'st-warn'}">Score : ${ok}/${c.quiz.length} (${pct}%)</h2><p class="mut">${pct>=70?'✅ Module validé':'⚠️ Revois les leçons et réessaie.'}</p><div class="row"><button data-fx="course" data-k="${i}">📖 Revoir le cours</button><button data-fx="quiz" data-k="${i}">↻ Refaire</button></div></div>`;toast('🧪 Score '+pct+'%')}
/* ================= AUTO-DROIT SMART ================= */
function adAnalyze(text){const t=(text||'').toLowerCase();
 const scored=AD_RULES.map(r=>{let sc=0;r.keys.forEach(k=>{if(t.includes(k))sc+=2});return Object.assign({},r,{sc})}).filter(r=>r.sc>0).sort((a,b)=>b.sc-a.sc);
 const r=scored[0]||AD_RULES[0];
 return{id:uid(),ref:'AD-'+new Date().getFullYear()+'-'+uid().slice(0,4).toUpperCase(),ts:Date.now(),text,rule:r,level:scored.length?(scored[0].sc>=4?'Qualification probable':'Piste à vérifier'):'Indéterminé — préciser',articles:r.articles.map(id=>txtById(id)).filter(Boolean)}}
function renderAD(){$('#view').innerHTML=`<div class="card" style="border-color:var(--jr)">
 <div class="row"><span style="font-size:26px">🧠</span><div><b style="font-size:18px">Auto-Droit Smart</b><p class="mut" style="color:var(--jr2)">L'intelligence juridique automobile.</p></div></div>
 <h1 style="margin-top:8px">Quel est votre droit dans cette situation ?</h1>
 <p class="mut">Décrivez le problème ou choisissez une question express : qualification, articles, qui paie, délais, démarches et courrier.</p>
 <div class="row" style="margin-top:8px"><button data-ad="tab" data-k="analyse" class="${AD.tab==='analyse'?'jr':''}">🤖 Analyse</button><button data-ad="tab" data-k="hist" class="${AD.tab==='hist'?'jr':''}">🕘 Historique</button><button data-ad="openModule">🧠 Module Auto-Droit</button><button data-act="jrOpen">🔑 Accès admin</button></div></div><div id="adBody"></div>`;
 if(AD.tab==='analyse')adAnalyseView();else adHistView()}
function adAnalyseView(){$('#adBody').innerHTML=`<div class="card"><h2>Questions express</h2><div class="row">${AD_CHIPS.map(c=>`<button data-ad="chip" data-k="${esc(c)}">${esc(c)}</button>`).join('')}</div>
 <label style="margin-top:10px">Ou décrivez votre situation</label><textarea id="adText" placeholder="Ex : moteur cassé 3 mois après l'achat à un particulier, chaîne de distribution…">${AD.result?esc(AD.result.text):''}</textarea>
 <button class="jr" data-ad="analyze" style="width:100%;padding:14px;font-size:16px">🧠 Analyser mon droit →</button></div>
 <div id="adRes">${AD.result?adResultHTML(AD.result):''}</div>`}
function adResultHTML(r){const a=r.rule;return`<div class="card"><h2>🧭 ${esc(a.title)} — <span class="st-warn">${esc(r.level)}</span></h2><p>${esc(a.qual)}</p></div>
 <div class="card"><h2>📜 Articles applicables</h2>${r.articles.map(t=>`<div class="card"><h3>${esc(t.t)} <span class="badge b-law">${esc(t.ref)}</span></h3><p>${esc(t.txt)}</p><p class="mut">Délai : ${esc(t.delai)}</p></div>`).join('')}</div>
 <div class="card"><h2>💶 Qui paie ?</h2><p>${esc(a.quiPaie)}</p></div>
 <div class="card"><h2>⏳ Délais</h2><p>${esc(a.delais)}</p></div>
 <div class="card"><h2>🧭 Démarches</h2><ol style="padding-left:18px">${a.demarches.map(d=>`<li>${esc(d)}</li>`).join('')}</ol></div>
 <div class="row"><button class="jr" data-ad="doc" data-k="${a.doc}">✉️ Générer le courrier</button><button data-ad="toJR" data-k="${a.cat}">⚖️ JusteRepère</button><button data-ad="toDossier" data-k="${a.cat}">📁 Dossier</button><button data-act="nav" data-k="etude">🧠 Étude technique</button><button data-ad="pdf">🖨️ PDF</button><button data-ad="json">📤 JSON</button></div>
 <p class="mut">Orientation juridique — ne remplace pas un avocat.</p>`}
function adHistView(){const h=adHist();$('#adBody').innerHTML=`<div class="card"><h2>🕘 Historique (${h.length})</h2>${h.length?h.map(r=>`<div class="card"><b>${esc(r.rule.title)}</b> <span class="mut">${new Date(r.ts).toLocaleString('fr-FR')}</span><p class="mut">${esc((r.text||'').slice(0,140))}</p><div class="row"><button data-ad="reload" data-k="${r.id}">↻ Rouvrir</button><button class="danger" data-ad="delHist" data-k="${r.id}">🗑️</button></div></div>`).join(''):'<p class="mut">Aucune analyse.</p>'}</div>`}
function adDocData(){const r=AD.result||{rule:{articles:[]},text:($('#adText')?$('#adText').value:'')};return{ref:r.ref||'AD',desc:r.text||'',client:{nom:'',ville:'',adresse:'',cp:'',tel:'',email:''},dest:'[Partie adverse]',parties:[[ 'Partie adverse','',r.rule.articles[0]||'CC1641']],texts:r.rule.articles,defense:[]}}
function adGenDoc(key){const r=AD.result||adAnalyze($('#adText')?$('#adText').value:'');const data=adDocData();
 const fn=(JR_DOCS[key]||JR_DOCS.lrar).fn;const text=fn(data,{parties:data.parties,texts:r.rule.articles,desc:r.text,defense:[]});
 openModal('<h2>✉️ '+esc((JR_DOCS[key]||JR_DOCS.lrar).n)+'</h2><pre class="doc">'+esc(text)+'</pre><div class="row"><button data-ad="copyDoc">📋 Copier</button><button data-ad="txtDoc">⬇️ .txt</button><button data-act="closeModal">Fermer</button></div>');AD._doc=text}
function adPDF(){const r=AD.result;if(!r){toast('Lance une analyse');return}const a=r.rule;
 $('#printArea').innerHTML=`<h1>🧠 Auto-Droit Smart — ${esc(a.title)}</h1><p>${new Date(r.ts).toLocaleString('fr-FR')} · ${esc(r.level)}</p>
 <h2>Situation</h2><p>${esc(r.text)}</p><h2>Qualification</h2><p>${esc(a.qual)}</p>
 <h2>Articles</h2>${r.articles.map(t=>`<p><b>${esc(t.t)}</b> — ${esc(t.ref)}. ${esc(t.txt)} Délai : ${esc(t.delai)}</p>`).join('')}
 <h2>Qui paie</h2><p>${esc(a.quiPaie)}</p><h2>Délais</h2><p>${esc(a.delais)}</p>
 <h2>Démarches</h2>${a.demarches.map((d,i)=>`<p>${i+1}. ${esc(d)}</p>`).join('')}<p><i>Orientation — ne remplace pas un avocat.</i></p>`;
 document.body.classList.add('printing');window.print();setTimeout(()=>document.body.classList.remove('printing'),800)}
function adToJR(cat){S.jr.dom='route';S.jr.result=null;switchView('jr');setTimeout(()=>{if($('#jrFaits'))$('#jrFaits').value=AD.result?AD.result.text:'';if($('#jrTitre'))$('#jrTitre').value=AD.result?AD.result.rule.title:''},60)}
function adToDossier(cat){const r=AD.result;if(!r){toast('Lance une analyse');return}const d=newDossier({cat:cat||'autre',titre:r.rule.title+' — '+r.ref,faits:r.text,qualifs:r.rule.articles.filter(id=>LEGAL.find(l=>l.id===id))});saveDossier(d);S.doss=d;switchView('dossiers');openDossier(d.id);toast('📁 Dossier créé depuis Auto-Droit Smart')}
/* ---- dispatchers ---- */
document.addEventListener('click',async e=>{
 const f=e.target.closest('[data-fx]');if(f){const act=f.dataset.fx,k=f.dataset.k;
  if(act==='tab'){FX.view=k;renderFormation()}
  else if(act==='apply'){fxRead();fxApply()}
  else if(act==='reset'){FX.filters={};fxFilters()}
  else if(act==='fiche'){fxFiche(k)}
  else if(act==='course'){fxCourse(+k)}
  else if(act==='quiz'){fxQuiz(+k)}
  else if(act==='quizSubmit'){fxQuizSubmit(+k)}
  else if(act==='toAD'){const kb=KBall().find(x=>x.id===k);switchView('droitsmart');setTimeout(()=>{if($('#adText'))$('#adText').value=kb?kb.t+' : '+kb.mec:''},60)}
  return}
 const a=e.target.closest('[data-ad]');if(a){const act=a.dataset.ad,k=a.dataset.k;
  try{
   if(act==='tab'){AD.tab=k;renderAD()}
   else if(act==='openModule'){S.openMod='droitsmart';switchView('modules')}
   else if(act==='chip'){$('#adText').value=k;AD.result=adAnalyze(k);const h=adHist();h.unshift(AD.result);ls.set('ad_history',h.slice(0,30));$('#adRes').innerHTML=adResultHTML(AD.result);toast('🧠 Analyse générée')}
   else if(act==='analyze'){const t=$('#adText').value.trim();if(!t){toast('Décris ta situation');return}AD.result=adAnalyze(t);const h=adHist();h.unshift(AD.result);ls.set('ad_history',h.slice(0,30));$('#adRes').innerHTML=adResultHTML(AD.result);toast('🧠 Analyse générée')}
   else if(act==='doc'){adGenDoc(k)}
   else if(act==='copyDoc'){await navigator.clipboard.writeText(AD._doc);toast('📋')}
   else if(act==='txtDoc'){download('AutoDroit.txt',AD._doc)}
   else if(act==='toJR'){adToJR(k)}
   else if(act==='toDossier'){adToDossier(k)}
   else if(act==='pdf'){adPDF()}
   else if(act==='json'){if(AD.result)download(AD.result.ref+'.json',AD.result)}
   else if(act==='reload'){const r=adHist().find(x=>x.id===k);if(r){AD.result=r;AD.tab='analyse';renderAD()}}
   else if(act==='delHist'){ls.set('ad_history',adHist().filter(x=>x.id!==k));adHistView()}
  }catch(x){toast('Auto-Droit : '+x.message)}
  return}
});
window.KFExtra={formation:FORMATION,adRules:AD_RULES,fxMeta};
})();
