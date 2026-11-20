/* KEV FUSION 2026 — jradmin.js v1.0.0
   JUSTEREPÈRE · MODE ADMIN
   Accès administrateur complet : analyseur de faits, base de repères juridiques éditable,
   procédures pas-à-pas, générateur de courriers, dossiers avec échéances, calculateurs
   (prescription, intérêts, immobilisation, vétusté), journal, exports PDF/JSON partageables.
   CRUD live, recherche/filtre/tri, vues enregistrées, tiroir de détail, ordre par glisser,
   sélection multiple, annulation après suppression. */
(function(){
'use strict';
/* ═══════════ socle ═══════════ */
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}},d:function(k){try{localStorage.removeItem('kf_'+k)}catch(e){}}};
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function uid(p){return (p||'x')+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function today(){return new Date().toISOString().slice(0,10)}
function addDays(d,n){var t=new Date(d+'T12:00:00');t.setDate(t.getDate()+n);return t.toISOString().slice(0,10)}
function daysLeft(d){if(!d)return null;return Math.round((new Date(d+'T12:00:00')-new Date(today()+'T12:00:00'))/86400000)}
function eur(n){return (Math.round((n||0)*100)/100).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}
function dfr(d){if(!d)return '—';var p=String(d).split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:d}
function toast(m,act){
 var t=$('#toast');
 if(typeof window.toast==='function'&&!act){window.toast(m);return}
 if(!t){alert(m);return}
 t.innerHTML=esc(m)+(act?' <button id="jraUndo" style="margin-left:10px;padding:4px 10px;font-size:12px">'+esc(act.label)+'</button>':'');
 t.classList.remove('hid');t.classList.add('show');
 if(act){var b=$('#jraUndo');if(b)b.onclick=function(){act.fn();t.classList.add('hid');t.classList.remove('show')}}
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},act?9000:3400)}
function dl(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href)},8000)}
async function sha(s){
 try{if(window.crypto&&crypto.subtle){var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}}catch(e){}
 var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
 return 'fnv'+(h>>>0).toString(16)}

/* ═══════════ son ═══════════ */
var AU={c:null,on:LS.g('jraSound',true)};
function ac(){if(!AU.c){try{AU.c=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
 if(AU.c&&AU.c.state==='suspended')AU.c.resume().catch(function(){});return AU.c}
function snd(k){if(!AU.on)return;var c=ac();if(!c)return;
 var m={seal:[520,880,.22,'triangle'],tick:[1250,1250,.025,'sine'],warn:[420,300,.2,'sawtooth'],
  del:[300,150,.2,'sawtooth'],ok:[660,990,.14,'triangle'],err:[220,120,.26,'sawtooth'],
  page:[900,1200,.08,'sine'],out:[523,880,.26,'triangle']}[k]||[900,900,.04,'sine'];
 try{var o=c.createOscillator(),g=c.createGain();o.type=m[3];
  o.frequency.setValueAtTime(m[0],c.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(60,m[1]),c.currentTime+m[2]);
  g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(.15,c.currentTime+.01);
  g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+m[2]);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+m[2]+.02)}catch(e){}}

/* ═══════════ accès admin ═══════════ */
function isAdmin(){try{return (typeof S!=='undefined'&&S.role==='admin')||LS.g('admDevice',false)===true}catch(e){return LS.g('admDevice',false)===true}}
var LOCK={unlocked:isAdmin(),err:'',mode:'ask'};
async function tryUnlock(pw){
 if(!pw){LOCK.err='Saisissez le mot de passe administrateur.';render();return}
 var h=await sha(pw);
 var ref=(typeof ADMIN_HASH!=='undefined'&&ADMIN_HASH)||LS.g('jraHash','');
 if(!ref){LS.s('jraHash',h);LS.s('admDevice',true);LOCK.unlocked=true;LOCK.err='';
  try{if(typeof S!=='undefined')S.role='admin'}catch(e){}
  snd('seal');toast('🔐 Code administrateur JusteRepère défini');ensureNav();render();return}
 if(h===ref){LOCK.unlocked=true;LOCK.err='';LS.s('admDevice',true);
  try{if(typeof S!=='undefined')S.role='admin'}catch(e){}
  snd('seal');toast('⚖️ Mode administrateur JusteRepère actif');ensureNav();render()}
 else{LOCK.err='Mot de passe incorrect.';snd('err');render()}}

/* ═══════════ données amorce ═══════════ */
var DOMS=[
 {k:'contrat',l:'Contrat & inexécution',c:'#d8b45a'},
 {k:'conso',l:'Consommation & garantie',c:'#22c55e'},
 {k:'vehicule',l:'Véhicule & vice caché',c:'#38bdf8'},
 {k:'route',l:'Route & assurance',c:'#ffb020'},
 {k:'travail',l:'Travail',c:'#c084fc'},
 {k:'penal',l:'Pénal & préjudice',c:'#ff4d6d'},
 {k:'procedure',l:'Procédure & exécution',c:'#7dd3fc'},
 {k:'numerique',l:'Numérique & données',c:'#a3e635'}];
function domLabel(k){var d=DOMS.find(function(x){return x.k===k});return d?d.l:k}
function domColor(k){var d=DOMS.find(function(x){return x.k===k});return d?d.c:'#d8b45a'}
var GRAV={critique:{l:'Critique',c:'#ff4d6d'},eleve:{l:'Élevé',c:'#ffb020'},modere:{l:'Modéré',c:'#38bdf8'},info:{l:'Information',c:'#a3e635'}};
/* [ref, titre, domaine, résumé, délai jours, gravité, tags] */
var ART_SEED=[
['C. civ. 1103','Force obligatoire du contrat','contrat','Les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits. Le vendeur est tenu de délivrer la chose conforme aux stipulations contractuelles.',0,'eleve','contrat engagement obligation vente accord'],
['C. civ. 1104','Exécution de bonne foi','contrat','Les contrats doivent être négociés, formés et exécutés de bonne foi. Cette disposition est d’ordre public. Fonde la sanction d’un comportement déloyal du vendeur ou du réparateur.',0,'eleve','bonne foi loyauté dol négociation tromperie'],
['C. civ. 1137','Dol — dissimulation intentionnelle','contrat','Le dol est le fait d’obtenir le consentement par des manœuvres ou des mensonges. Constitue également un dol la dissimulation intentionnelle d’une information dont le cocontractant sait le caractère déterminant. Vente maquillée, compteur trafiqué, sinistre caché.',1825,'critique','dol tromperie mensonge dissimulation compteur maquillé accident caché annulation'],
['C. civ. 1217','Sanctions de l’inexécution','contrat','La partie envers laquelle l’engagement n’a pas été exécuté peut refuser d’exécuter sa propre obligation, poursuivre l’exécution forcée en nature, obtenir une réduction du prix, provoquer la résolution du contrat ou demander réparation des conséquences.',0,'eleve','inexécution sanctions résolution réduction prix'],
['C. civ. 1221','Exécution forcée en nature','contrat','Le créancier peut poursuivre l’exécution en nature sauf si elle est impossible ou s’il existe une disproportion manifeste entre son coût pour le débiteur et son intérêt pour le créancier.',0,'modere','exécution forcée réparation remise en état'],
['C. civ. 1223','Réduction du prix','contrat','Le créancier peut accepter une exécution imparfaite et solliciter une réduction proportionnelle du prix. S’il n’a pas encore payé, il notifie sa décision de réduire le prix dans les meilleurs délais.',0,'eleve','réduction prix décote exécution imparfaite'],
['C. civ. 1224','Résolution du contrat','contrat','La résolution résulte soit de l’application d’une clause résolutoire, soit d’une notification du créancier en cas d’inexécution suffisamment grave, soit d’une décision de justice.',0,'critique','résolution annulation remboursement inexécution grave'],
['C. civ. 1231-1','Responsabilité contractuelle','contrat','Le débiteur est condamné, s’il y a lieu, au paiement de dommages et intérêts à raison de l’inexécution, lorsqu’il est établi que celle-ci provient de son fait ou de celui d’une personne dont il doit répondre. Fonde l’obligation de résultat du réparateur.',0,'eleve','réparateur garage obligation de résultat dommages intérêts'],
['C. civ. 1231-3','Dommages prévisibles','contrat','Le débiteur n’est tenu que des dommages et intérêts qui ont été prévus ou qui pouvaient être prévus lors de la conclusion du contrat, sauf lorsque l’inexécution est due à une faute lourde ou dolosive.',0,'modere','préjudice prévisible faute lourde dolosive'],
['C. civ. 1240','Responsabilité délictuelle','penal','Tout fait quelconque de l’homme qui cause à autrui un dommage oblige celui par la faute duquel il est arrivé à le réparer.',1825,'critique','faute dommage réparation incendie tiers délit'],
['C. civ. 1241','Négligence et imprudence','penal','Chacun est responsable du dommage qu’il a causé non seulement par son fait, mais encore par sa négligence ou par son imprudence.',1825,'eleve','négligence imprudence accident défaut entretien'],
['C. civ. 1245','Produits défectueux','vehicule','Le producteur est responsable du dommage causé par un défaut de son produit, qu’il soit ou non lié par un contrat avec la victime. Régime sans faute : batterie, airbag, direction, freinage.',0,'critique','produit défectueux producteur batterie airbag frein incendie sans faute'],
['C. civ. 1245-3','Définition du défaut de sécurité','vehicule','Un produit est défectueux lorsqu’il n’offre pas la sécurité à laquelle on peut légitimement s’attendre, compte tenu de sa présentation, de l’usage raisonnablement attendu et du moment de sa mise en circulation.',0,'critique','sécurité défaut légitime attente'],
['C. civ. 1245-17','Prescription produits défectueux','vehicule','L’action en réparation fondée sur la responsabilité du fait des produits défectueux se prescrit par dix ans à compter de la mise en circulation du produit, sauf faute du producteur.',3650,'critique','prescription dix ans producteur mise en circulation'],
['C. civ. 1641','Garantie des vices cachés','vehicule','Le vendeur est tenu de la garantie à raison des défauts cachés de la chose vendue qui la rendent impropre à l’usage auquel on la destine, ou qui diminuent tellement cet usage que l’acheteur ne l’aurait pas acquise, ou n’en aurait donné qu’un moindre prix.',0,'critique','vice caché défaut caché impropre usage moteur casse'],
['C. civ. 1643','Vices cachés ignorés du vendeur','vehicule','Le vendeur est tenu des vices cachés quand même il ne les aurait pas connus, à moins qu’il n’ait stipulé qu’il ne sera obligé à aucune garantie. Clause de non-garantie inopérante entre professionnel et consommateur.',0,'eleve','ignorance clause non garantie professionnel consommateur'],
['C. civ. 1645','Vendeur de mauvaise foi','vehicule','Si le vendeur connaissait les vices de la chose, il est tenu, outre la restitution du prix, de tous les dommages et intérêts envers l’acheteur. Levier majeur contre un professionnel qui a dissimulé.',0,'critique','mauvaise foi connaissance dommages intérêts tous préjudices'],
['C. civ. 1648','Délai de l’action rédhibitoire','vehicule','L’action résultant des vices rédhibitoires doit être intentée par l’acquéreur dans un délai de deux ans à compter de la découverte du vice.',730,'critique','délai deux ans découverte vice forclusion'],
['C. civ. 2224','Prescription de droit commun','procedure','Les actions personnelles ou mobilières se prescrivent par cinq ans à compter du jour où le titulaire d’un droit a connu ou aurait dû connaître les faits lui permettant de l’exercer.',1825,'critique','prescription cinq ans connaissance faits'],
['C. civ. 2232','Plafond du report de prescription','procedure','Le report du point de départ, la suspension ou l’interruption de la prescription ne peut avoir pour effet de porter le délai au-delà de vingt ans à compter du jour de la naissance du droit.',7300,'modere','plafond vingt ans report suspension'],
['C. conso L217-3','Garantie légale de conformité','conso','Le vendeur délivre un bien conforme au contrat et répond des défauts de conformité existant lors de la délivrance. Il répond également des défauts résultant de l’emballage, des instructions de montage ou de l’installation.',0,'critique','conformité garantie légale vendeur professionnel'],
['C. conso L217-7','Présomption d’antériorité du défaut','conso','Les défauts de conformité qui apparaissent dans un délai de vingt-quatre mois à compter de la délivrance du bien, y compris d’un bien d’occasion, sont présumés exister au moment de la délivrance. Pour les biens d’occasion, ce délai est de douze mois.',730,'critique','présomption antériorité vingt-quatre mois douze mois occasion charge preuve'],
['C. conso L217-8','Mise en conformité du bien','conso','En cas de défaut de conformité, le consommateur choisit entre la réparation et le remplacement du bien. Le vendeur peut ne pas procéder selon le choix s’il est manifestement disproportionné.',0,'eleve','réparation remplacement choix consommateur'],
['C. conso L217-9','Délai de mise en conformité','conso','La réparation ou le remplacement doit être effectué dans un délai raisonnable qui ne peut excéder trente jours, sans frais ni inconvénient majeur pour le consommateur.',30,'eleve','trente jours délai réparation sans frais inconvénient'],
['C. conso L217-10','Réduction du prix ou résolution','conso','Le consommateur obtient une réduction du prix ou la résolution du contrat lorsque la réparation ou le remplacement est impossible, n’a pas été effectué dans les délais, ou lorsqu’un défaut de conformité apparaît malgré la tentative de mise en conformité.',0,'critique','réduction résolution remboursement échec réparation'],
['C. conso L217-12','Prescription de la garantie de conformité','conso','L’action résultant du défaut de conformité se prescrit par deux ans à compter de la délivrance du bien.',730,'critique','prescription deux ans délivrance conformité'],
['C. conso L217-21','Disponibilité des pièces détachées','conso','Le fabricant ou l’importateur informe le vendeur de la période ou de la date de fin de production des pièces détachées indispensables à l’utilisation du bien. Obligation d’information et de disponibilité.',0,'modere','pièces détachées disponibilité information fabricant'],
['C. conso L212-1','Clauses abusives','conso','Dans les contrats conclus entre professionnels et consommateurs, sont abusives les clauses qui ont pour objet ou pour effet de créer un déséquilibre significatif entre les droits et obligations des parties. Clause « vendu en l’état, sans garantie » inopérante.',0,'eleve','clause abusive déséquilibre significatif vendu en l’état sans garantie'],
['C. conso L121-1','Pratiques commerciales trompeuses','conso','Sont trompeuses les pratiques reposant sur des allégations, indications ou présentations fausses ou de nature à induire en erreur, notamment sur les qualités substantielles, la composition, l’aptitude à l’usage ou le contrôle du produit.',0,'critique','tromperie publicité mensongère qualities substantielles DGCCRF'],
['C. conso L221-18','Droit de rétractation','conso','Pour les contrats conclus à distance ou hors établissement, le consommateur dispose d’un délai de quatorze jours pour exercer son droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités.',14,'critique','rétractation quatorze jours distance démarchage vente en ligne'],
['C. conso L311-9','Crédit affecté et résolution','conso','En cas de résolution du contrat de vente, le contrat de crédit affecté est résolu ou annulé de plein droit. Le consommateur n’est tenu au paiement des sommes déjà versées qu’à compter de la livraison.',0,'eleve','crédit affecté financement résolution annulation LOA LLD'],
['C. conso L421-3','Obligation générale de sécurité','conso','Les produits et services doivent, dans des conditions normales ou raisonnablement prévisibles d’utilisation, présenter la sécurité à laquelle on peut légitimement s’attendre et ne pas porter atteinte à la santé des personnes.',0,'critique','sécurité générale produit dangereux rappel'],
['C. conso L421-7','Information et rappel des produits','conso','Lorsqu’un produit ne satisfait pas à l’obligation générale de sécurité, le professionnel en informe les autorités et les consommateurs et prend les mesures correctives, y compris le rappel.',0,'critique','rappel constructeur campagne information autorité'],
['C. conso L612-1','Médiation de la consommation','procedure','Tout consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable du litige qui l’oppose à un professionnel, après démarche écrite préalable.',0,'modere','médiation amiable gratuit médiateur consommation'],
['C. route L211-1','Obligation d’assurance automobile','route','Toute personne physique ou morale dont la responsabilité civile peut être engagée en raison de dommages causés par un véhicule terrestre à moteur doit être couverte par une assurance.',0,'critique','assurance obligatoire responsabilité civile véhicule'],
['C. route L234-1','Conduite sous l’empire d’un état alcoolique','route','Nul ne doit conduire un véhicule s’il est en état d’alcoolémie prohibée. Le dépassement des seuils constitue un délit ou une contravention selon le taux.',0,'critique','alcool conduite délit éthylotest'],
['C. route R413-14','Dépassement de la vitesse autorisée','route','Tout conducteur doit respecter les limitations de vitesse. Les excès sont sanctionnés selon des barèmes de contraventions, retraits de points et suspensions.',0,'eleve','vitesse excès radar contravention points suspension'],
['C. route R412-6','Comportement du conducteur','route','Tout conducteur doit se tenir constamment en état et en position d’exécuter commodément et sans délai toutes les manœuvres qui lui incombent.',0,'modere','conducteur attention téléphone manœuvre'],
['C. trav. L1222-1','Bonne foi du contrat de travail','travail','Le contrat de travail est exécuté de bonne foi. Fonde la loyauté des obligations réciproques de l’employeur et du salarié.',0,'modere','travail bonne foi loyauté employeur salarié'],
['C. trav. L4624-1','Avis du médecin du travail','travail','Le médecin du travail peut préconiser des mesures individuelles d’aménagement, d’adaptation ou de transformation de poste, ou d’aménagement de temps de travail justifiées par l’état de santé.',0,'modere','médecin travail inaptitude aménagement poste'],
['C. pén. 222-19','Blessures involontaires','penal','Le fait de causer à autrui, par maladresse, imprudence, inattention, négligence ou manquement à une obligation de sécurité, une incapacité totale de travail est puni de trois ans d’emprisonnement et de 45 000 € d’amende.',0,'critique','blessures involontaires ITT accident corporel imprudence'],
['C. pén. 441-1','Faux et usage de faux','penal','Constitue un faux toute altération frauduleuse de la vérité, de nature à causer un préjudice, dans un écrit ou tout autre support d’expression de la pensée. Faux certificat, facture complaisante, rapport falsifié.',0,'critique','faux facture certificat falsifié fraude écrit'],
['C. pr. civ. 145','Mesures d’instruction in futurum','procedure','Avant tout procès, le juge peut ordonner toute mesure d’instruction légalement admissible s’il existe un motif légitime de conserver ou d’établir avant tout procès la preuve de faits dont pourrait dépendre la solution d’un litige. Fondement du référé-expertise automobile.',0,'critique','référé expertise preuve avant procès 145 motif légitime'],
['C. pr. civ. 700','Frais irrépétibles','procedure','Le juge condamne la partie tenue aux dépens ou qui perd son procès à payer à l’autre la somme qu’il détermine au titre des frais exposés et non compris dans les dépens.',0,'modere','frais avocat article 700 dépens'],
['C. pr. civ. 835','Référé provision et mesures conservatoires','procedure','Le président du tribunal judiciaire peut, dans les cas où l’existence de l’obligation n’est pas sérieusement contestable, accorder une provision au créancier ou ordonner l’exécution de l’obligation.',0,'eleve','référé provision obligation non contestable urgence'],
['RGPD art. 15','Droit d’accès aux données','numerique','La personne concernée a le droit d’obtenir du responsable de traitement la confirmation que des données la concernant sont traitées et d’en recevoir une copie. Utile pour obtenir l’historique télématique d’un véhicule connecté.',30,'modere','données personnelles accès RGPD télématique véhicule connecté historique']];
var PROC_SEED=[
{id:'p-vice',t:'Vice caché sur véhicule d’occasion',dom:'vehicule',delay:'2 ans à compter de la découverte du vice',jur:'Tribunal judiciaire',cost:'Expertise 400–1 200 € · procédure 0–3 000 €',
 base:['C. civ. 1641','C. civ. 1645','C. civ. 1648','C. civ. 1240'],
 steps:['Dater précisément la découverte du vice (facture de diagnostic, rapport OBD horodaté)','Faire établir un diagnostic contradictoire ou une expertise amiable','Constituer la preuve de l’antériorité : historique entretien, campagnes, défauts connus du moteur','Mise en demeure LRAR au vendeur : résolution ou réduction du prix, délai 15 jours','À défaut, médiateur de la consommation si vendeur professionnel','Référé-expertise sur le fondement de l’article 145 si la preuve risque de disparaître','Assignation au fond : restitution du prix, dommages et intérêts, article 700'],
 pieces:['Certificat de cession et facture','Contrôle technique de moins de 6 mois','Carnet et factures d’entretien','Rapport de diagnostic daté et chiffré','Photographies datées des pièces atteintes','Échanges écrits avec le vendeur','Historique des campagnes de rappel'],
 traps:['Le délai court de la DÉCOUVERTE, pas de la vente : documentez la date','La clause « vendu en l’état » est inopérante face à un consommateur','L’usure normale n’est pas un vice caché : distinguez défaut et vétusté','Ne pas réparer avant expertise : la preuve disparaît']},
{id:'p-conf',t:'Défaut de conformité — professionnel',dom:'conso',delay:'2 ans à compter de la délivrance',jur:'Tribunal judiciaire / médiateur',cost:'Gratuit jusqu’à la médiation',
 base:['C. conso L217-3','C. conso L217-7','C. conso L217-9','C. conso L217-10','C. conso L217-12'],
 steps:['Notifier le défaut par écrit au vendeur dans les 24 mois (12 mois pour l’occasion)','Choisir réparation ou remplacement ; le vendeur a 30 jours maximum','Consigner chaque immobilisation et chaque refus','En cas d’échec, exiger réduction du prix ou résolution','Saisir le médiateur de la consommation désigné par le vendeur','Assignation si la médiation échoue'],
 pieces:['Bon de commande et facture de délivrance','Courrier initial daté','Ordres de réparation et dates d’entrée/sortie','Preuve du défaut persistant'],
 traps:['La présomption d’antériorité dispense de prouver l’origine du défaut','Tout dépassement de 30 jours ouvre droit à la résolution','Les frais de diagnostic et de transport restent à la charge du vendeur']},
{id:'p-rappel',t:'Campagne de rappel non exécutée',dom:'conso',delay:'Sans délai — risque sécurité',jur:'DGCCRF / Tribunal judiciaire',cost:'Signalement gratuit',
 base:['C. conso L421-3','C. conso L421-7','C. civ. 1245'],
 steps:['Vérifier l’éligibilité du VIN auprès du réseau constructeur','Conserver la preuve de la campagne et de la prise de rendez-vous','Mettre en demeure le constructeur et le distributeur','Signaler à la DGCCRF via SignalConso','En cas de dommage, activer la responsabilité du fait des produits défectueux'],
 pieces:['Numéro VIN et certificat d’immatriculation','Notification de rappel','Preuves de rendez-vous et de refus','Constat du dommage'],
 traps:['Un rappel non exécuté peut engager la responsabilité du vendeur professionnel','Ne pas différer un rappel de freinage, d’airbag ou de batterie']},
{id:'p-incendie',t:'Incendie d’origine technique du véhicule',dom:'vehicule',delay:'10 ans — produits défectueux',jur:'Tribunal judiciaire',cost:'Expertise incendie 1 500–5 000 €',
 base:['C. civ. 1245','C. civ. 1245-3','C. civ. 1245-17','C. civ. 1240'],
 steps:['Sécuriser et préserver les lieux, ne pas déplacer l’épave','Déclarer le sinistre à l’assureur sous 5 jours ouvrés','Faire désigner un expert et solliciter une expertise contradictoire','Rechercher la chaîne causale : fuite, court-circuit, couvaison EGR, cellule HT','Mettre en cause le producteur sur le fondement des produits défectueux','Chiffrer les préjudices matériels, de jouissance et aux tiers'],
 pieces:['Rapport des services de secours','Déclaration de sinistre','Expertise technique et photographies','Historique d’entretien et campagnes','Factures et justificatifs de préjudice'],
 traps:['La préservation de l’épave est déterminante : toute destruction compromet la preuve','Le régime des produits défectueux dispense de prouver une faute']},
{id:'p-garage',t:'Obligation de résultat du réparateur',dom:'contrat',delay:'5 ans',jur:'Tribunal judiciaire / de proximité',cost:'Devis contradictoire',
 base:['C. civ. 1231-1','C. civ. 1103','C. civ. 1217'],
 steps:['Faire constater la persistance ou l’apparition du désordre après intervention','Devis contradictoire chez un tiers','Mise en demeure de reprendre ou de rembourser','Médiation du secteur automobile','Action en responsabilité contractuelle'],
 pieces:['Ordre de réparation signé et facture','Devis initial et devis contradictoire','Constat du désordre persistant','Échanges écrits'],
 traps:['Le réparateur est tenu d’un résultat : la charge de la preuve pèse sur lui','Ne pas régler le solde sans réserve écrite']},
{id:'p-pv',t:'Contestation d’avis de contravention',dom:'route',delay:'45 jours (30 jours majoration)',jur:'Officier du ministère public',cost:'Consignation éventuelle',
 base:['C. route R413-14','C. route R412-6'],
 steps:['Ne pas payer l’amende : le paiement vaut reconnaissance','Vérifier l’identification du véhicule et la qualité de l’avis','Requête en exonération ou contestation dans le délai','Consigner si demandé, sans valoir paiement','Joindre certificat de cession, vol, ou preuve d’impossibilité'],
 pieces:['Avis de contravention complet','Certificat de cession ou dépôt de plainte','Photographie du radar si disponible','Justificatif d’absence'],
 traps:['Payer éteint l’action et entraîne le retrait de points','Le délai de majoration est court : agir immédiatement']},
{id:'p-assurance',t:'Refus de garantie ou sous-évaluation',dom:'route',delay:'2 ans — prescription biennale',jur:'Tribunal judiciaire',cost:'Expertise contradictoire',
 base:['C. route L211-1','C. civ. 1103','C. civ. 1104'],
 steps:['Exiger la clause exacte fondant le refus','Demander le rapport d’expertise de l’assureur','Contester par LRAR avec contre-expertise','Saisir le médiateur de l’assurance','Saisir l’ACPR en cas de pratique systématique','Action judiciaire en exécution du contrat'],
 pieces:['Contrat et conditions générales','Déclaration de sinistre','Rapport d’expertise adverse','Contre-expertise et devis'],
 traps:['La prescription biennale se compte de l’événement, avec des causes d’interruption','Une exclusion doit être formelle et limitée']},
{id:'p-mediation',t:'Médiation de la consommation',dom:'procedure',delay:'Réponse sous 90 jours',jur:'Médiateur sectoriel',cost:'Gratuit',
 base:['C. conso L612-1'],
 steps:['Adressez d’abord une réclamation écrite au professionnel','Conservez la preuve du refus ou de l’absence de réponse','Saisissez le médiateur désigné dans les conditions de vente','Transmettez un dossier chronologique et paginé','Suivez l’avis rendu, non contraignant mais exploitable au fond'],
 pieces:['Réclamation préalable et accusé de réception','Pièces numérotées','Chronologie synthétique'],
 traps:['La saisine suspend la prescription','Sans réclamation préalable écrite, la saisine est irrecevable']},
{id:'p-refere',t:'Référé-expertise (article 145)',dom:'procedure',delay:'Avant tout procès au fond',jur:'Tribunal judiciaire — référé',cost:'Consignation d’expertise 1 500–3 000 €',
 base:['C. pr. civ. 145','C. pr. civ. 700'],
 steps:['Établir le motif légitime : risque de dépérissement de la preuve','Assigner en référé devant le président du tribunal judiciaire','Solliciter une mission d’expertise complète et contradictoire','Obtenir la consignation et la désignation','Assister aux opérations et déposer des dires'],
 pieces:['Éléments établissant le litige futur','Preuve du risque de disparition','Devis et constats','Projet de mission d’expertise'],
 traps:['La mesure doit rester légalement admissible et ne pas suppléer une carence du demandeur','L’expertise judiciaire est contradictoire : soyez présent ou représenté']},
{id:'p-dol',t:'Dol — vente maquillée ou compteur altéré',dom:'contrat',delay:'5 ans à compter de la découverte',jur:'Tribunal judiciaire',cost:'Enquête historique 100–400 €',
 base:['C. civ. 1137','C. civ. 1104','C. conso L121-1','C. pén. 441-1'],
 steps:['Obtenir l’historique officiel du véhicule et des contrôles techniques','Comparer kilométrages, dates et sinistres déclarés','Caractériser la dissimulation intentionnelle du professionnel','Mise en demeure : nullité et restitution intégrale','Dépôt de plainte pour tromperie et faux le cas échéant','Signalement DGCCRF'],
 pieces:['Historique des contrôles techniques','Rapport d’historique','Annonce de vente archivée','Échanges et promesses écrites'],
 traps:['Le dol permet d’obtenir la nullité même hors délai de garantie','La preuve de la connaissance par le professionnel est décisive']}];
var TPL_SEED=[
{id:'t-demeure',t:'Mise en demeure — résolution pour vice caché',dom:'vehicule',
 body:'{{expediteur}}\n{{adresse_expediteur}}\n\n{{destinataire}}\n{{adresse_destinataire}}\n\nLettre recommandée avec accusé de réception n° {{lrar}}\nÀ {{ville}}, le {{date}}\n\nObjet : Mise en demeure — résolution de la vente pour vice caché\nVéhicule : {{vehicule}} — VIN {{vin}} — immatriculation {{immat}}\n\nMadame, Monsieur,\n\nJ’ai acquis auprès de vous le véhicule désigné en référence le {{date_achat}} au prix de {{prix}} €.\n\nLe {{date_decouverte}}, j’ai constaté le désordre suivant : {{faits}}\n\nCe désordre, antérieur à la vente et non apparent lors de l’acquisition, rend le véhicule impropre à l’usage auquel il est destiné. Il constitue un vice caché au sens de l’article 1641 du Code civil. L’action est engagée dans le délai de deux ans à compter de la découverte du vice prévu par l’article 1648.\n\n{{#professionnel}}S’agissant d’un vendeur professionnel, la clause de non-garantie est inopérante et votre connaissance du vice est présumée, ce qui engage votre responsabilité sur le fondement de l’article 1645 pour l’intégralité des dommages et intérêts.{{/professionnel}}\n\nEn conséquence, je vous mets en demeure, dans un délai de quinze jours à compter de la réception de la présente, de :\n— restituer le prix de {{prix}} € contre restitution du véhicule ;\n— me régler la somme de {{montant}} € au titre des préjudices annexes ;\n— à défaut, de me proposer une réduction du prix proportionnelle au sens de l’article 1223.\n\nÀ défaut d’accord dans ce délai, je saisirai le médiateur de la consommation puis la juridiction compétente, et solliciterai une expertise judiciaire sur le fondement de l’article 145 du Code de procédure civile, ainsi qu’une indemnité au titre de l’article 700.\n\nJe vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.\n\n{{signature}}\n\nPièces jointes : {{pieces}}'},
{id:'t-conf',t:'Notification de défaut de conformité',dom:'conso',
 body:'{{expediteur}}\n\n{{destinataire}}\n\nLRAR n° {{lrar}} — {{ville}}, le {{date}}\n\nObjet : Notification d’un défaut de conformité — articles L217-3 et suivants du Code de la consommation\nVéhicule : {{vehicule}} — délivré le {{date_achat}}\n\nMadame, Monsieur,\n\nLe véhicule acquis auprès de votre établissement présente le défaut suivant : {{faits}}\n\nCe défaut est apparu dans le délai de vingt-quatre mois suivant la délivrance — douze mois s’agissant d’un bien d’occasion. Il est donc présumé exister au moment de la délivrance en application de l’article L217-7 du Code de la consommation. Il ne m’appartient pas d’en établir l’origine.\n\nJe choisis {{choix}} et vous demande d’y procéder sans frais, dans un délai maximum de trente jours conformément à l’article L217-9, sans inconvénient majeur pour moi.\n\nÀ défaut de mise en conformité dans ce délai, j’exigerai la réduction du prix ou la résolution du contrat sur le fondement de l’article L217-10, outre la réparation de mes préjudices.\n\nJe vous prie d’agréer, Madame, Monsieur, mes salutations distinguées.\n\n{{signature}}'},
{id:'t-rappel',t:'Sommation d’exécuter une campagne de rappel',dom:'conso',
 body:'{{expediteur}}\n\n{{destinataire}}\n\nLRAR n° {{lrar}} — {{ville}}, le {{date}}\n\nObjet : Sommation d’exécuter la campagne de rappel — obligation générale de sécurité\nVéhicule : {{vehicule}} — VIN {{vin}}\n\nMadame, Monsieur,\n\nMon véhicule fait l’objet de la campagne de rappel suivante : {{faits}}\n\nAux termes des articles L421-3 et L421-7 du Code de la consommation, les produits doivent présenter la sécurité à laquelle on peut légitimement s’attendre, et le professionnel doit prendre les mesures correctives nécessaires, y compris le rappel.\n\nJe vous somme de procéder à l’intervention dans un délai de quinze jours, à vos frais, et de me communiquer par écrit la référence de la campagne et le compte rendu technique.\n\nÀ défaut, je signalerai la situation à la DGCCRF et me réserve d’engager votre responsabilité sur le fondement des articles 1245 et suivants du Code civil en cas de dommage.\n\n{{signature}}'},
{id:'t-expertise',t:'Demande d’expertise amiable contradictoire',dom:'procedure',
 body:'{{expediteur}}\n\n{{destinataire}}\n\nLRAR n° {{lrar}} — {{ville}}, le {{date}}\n\nObjet : Proposition d’expertise amiable contradictoire\nLitige : {{vehicule}}\n\nMadame, Monsieur,\n\nUn différend nous oppose sur l’origine et l’étendue du désordre suivant : {{faits}}\n\nAfin d’éviter une procédure judiciaire, je vous propose de faire procéder à une expertise amiable contradictoire par un expert automobile indépendant, aux frais partagés, sous quinzaine.\n\nJe vous propose le cabinet suivant : {{expert}}. À défaut d’accord sur ce nom dans un délai de dix jours, je saisirai le président du tribunal judiciaire d’une demande d’expertise judiciaire sur le fondement de l’article 145 du Code de procédure civile.\n\nJe vous rappelle que le véhicule sera conservé en l’état jusqu’aux opérations d’expertise, afin de préserver la preuve.\n\n{{signature}}'},
{id:'t-mediation',t:'Saisine du médiateur de la consommation',dom:'procedure',
 body:'{{expediteur}}\n\nMédiateur de la consommation — {{mediateur}}\n\n{{ville}}, le {{date}}\n\nObjet : Saisine en médiation — litige de consommation\nProfessionnel mis en cause : {{destinataire}}\nVéhicule : {{vehicule}}\nMontant du litige : {{montant}} €\n\nMadame, Monsieur le Médiateur,\n\nJ’ai adressé le {{date_reclamation}} une réclamation écrite au professionnel, demeurée sans réponse satisfaisante. Je joins cette réclamation et son accusé de réception, conformément à l’article L612-2 du Code de la consommation.\n\nLes faits sont les suivants : {{faits}}\n\nChronologie :\n{{chronologie}}\n\nJe sollicite votre intervention afin d’obtenir {{demande}}.\n\nJe vous prie d’agréer, Madame, Monsieur, l’expression de ma considération distinguée.\n\n{{signature}}\n\nPièces : {{pieces}}'},
{id:'t-assurance',t:'Contestation de refus de garantie assurance',dom:'route',
 body:'{{expediteur}}\n\n{{destinataire}} — Service sinistres\n\nLRAR n° {{lrar}} — {{ville}}, le {{date}}\n\nObjet : Contestation de refus de garantie — sinistre n° {{sinistre}}\nVéhicule : {{vehicule}}\n\nMadame, Monsieur,\n\nPar courrier du {{date_refus}}, vous m’avez opposé un refus de garantie au motif suivant : {{faits}}\n\nJe conteste ce refus. La clause invoquée ne constitue pas une exclusion formelle et limitée au sens du Code des assurances, et son application créerait un déséquilibre significatif au sens de l’article L212-1 du Code de la consommation.\n\nJe vous demande, sous quinzaine : la communication intégrale du rapport d’expertise, la clause exacte opposée, et la réouverture du dossier.\n\nÀ défaut, je saisirai le médiateur de l’assurance puis la juridiction compétente, et solliciterai l’article 700 du Code de procédure civile.\n\n{{signature}}'},
{id:'t-pv',t:'Requête en exonération — avis de contravention',dom:'route',
 body:'{{expediteur}}\n\nMonsieur l’Officier du ministère public\n{{destinataire}}\n\n{{ville}}, le {{date}}\n\nObjet : Contestation de l’avis de contravention n° {{avis}}\nVéhicule : {{vehicule}} — immatriculation {{immat}}\n\nMonsieur l’Officier du ministère public,\n\nJe conteste formellement l’infraction relevée. Je n’ai pas procédé au règlement de l’amende, ce règlement valant reconnaissance de l’infraction.\n\nMotif de contestation : {{faits}}\n\nJe joins les justificatifs correspondants et sollicite l’exonération, subsidiairement la désignation du conducteur réel ou l’annulation de l’avis pour irrégularité.\n\nJe vous prie d’agréer, Monsieur, l’expression de ma considération distinguée.\n\n{{signature}}\n\nPièces : {{pieces}}'},
{id:'t-dgccrf',t:'Signalement DGCCRF — pratique commerciale trompeuse',dom:'conso',
 body:'{{expediteur}}\n\nDGCCRF — SignalConso\n\n{{ville}}, le {{date}}\n\nObjet : Signalement de pratique commerciale trompeuse\nProfessionnel : {{destinataire}}\nVéhicule : {{vehicule}}\n\nMadame, Monsieur,\n\nJe porte à votre connaissance les faits suivants, susceptibles de constituer une pratique commerciale trompeuse au sens de l’article L121-1 du Code de la consommation : {{faits}}\n\nL’annonce et les déclarations du professionnel portaient sur des qualités substantielles du véhicule qui se sont révélées inexactes. Je joins l’annonce archivée, les échanges et les constats techniques.\n\nJe sollicite l’enregistrement de ce signalement et, le cas échéant, les suites de contrôle que vous jugerez utiles.\n\n{{signature}}\n\nPièces : {{pieces}}'}];
var DOSS_SEED=[
{id:'d1',ref:'JR-2026-014',t:'3008 1.5 BlueHDi — chaîne AAC 7 mm',dom:'vehicule',status:'instruction',
 veh:'Peugeot 3008 II 1.5 BlueHDi 130',vin:'VF3MCYHZRMS041882',adv:'Garage Central Auto',
 amount:14900,opened:'2026-01-12',due:addDays(today(),18),
 arts:['C. civ. 1641','C. civ. 1645','C. civ. 1648'],
 notes:'Chaîne 7 mm d’origine identifiée à la dépose. Claquement côté boîte documenté à froid. Campagne constructeur 8 mm applicable au VIN. Vendeur professionnel.',
 pieces:['Facture de cession','Rapport OBD horodaté','Devis dépose culasse 2 380 €','Courrier vendeur du 04/01']},
{id:'d2',ref:'JR-2026-021',t:'Spring — freins arrière tambours corrodés',dom:'vehicule',status:'mise en demeure',
 veh:'Dacia Spring Electric 45',vin:'UU1DBG005NM012447',adv:'Concession Nord Motors',
 amount:1890,opened:'2026-02-03',due:addDays(today(),6),
 arts:['C. conso L217-3','C. conso L217-7','C. conso L217-9'],
 notes:'Efficacité arrière 38 % au banc. Cylindre gauche grippé. Véhicule sous garantie de conformité, présomption acquise.',
 pieces:['PV de contrôle technique','Relevé banc de freinage','Ordre de réparation du 28/01']},
{id:'d3',ref:'JR-2026-008',t:'Golf VII 2.0 TDI — EGR et FAP après MAJ',dom:'vehicule',status:'expertise',
 veh:'Volkswagen Golf VII 2.0 TDI 150',vin:'WVWZZZAUZGW118204',adv:'Vendeur particulier',
 amount:6400,opened:'2025-11-21',due:addDays(today(),-4),
 arts:['C. civ. 1641','C. civ. 1648','C. civ. 1240'],
 notes:'Dilution huile confirmée par analyse. Régénérations tous les 180 km. Échéance dépassée : relance expertise à programmer sans délai.',
 pieces:['Analyse huile laboratoire','Historique régénérations','Annonce archivée']},
{id:'d4',ref:'JR-2026-030',t:'Contestation PV excès de vitesse — véhicule cédé',dom:'route',status:'urgent',
 veh:'Renault Clio V',vin:'VF1RJA00X67214003',adv:'ANTAI / OMP Rennes',
 amount:135,opened:'2026-02-18',due:addDays(today(),2),
 arts:['C. route R413-14'],
 notes:'Avis reçu le 16/02 pour une infraction du 09/02, postérieure à la cession du 03/02. Ne pas régler. Certificat de cession joint.',
 pieces:['Avis de contravention','Certificat de cession','Accusé d’enregistrement ANTS']},
{id:'d5',ref:'JR-2025-192',t:'Kuga PHEV — refus de garantie batterie HT',dom:'route',status:'médiation',
 veh:'Ford Kuga III 2.5 PHEV 225',vin:'WF0FXXWPUFLL52190',adv:'Assurance Mutuelle Auto',
 amount:9750,opened:'2025-09-30',due:addDays(today(),41),
 arts:['C. civ. 1245','C. civ. 1103','C. conso L212-1'],
 notes:'Refus fondé sur une clause d’exclusion imprécise. Médiateur saisi le 02/02, avis attendu sous 90 jours.',
 pieces:['Conditions générales','Courrier de refus','Rapport batterie HT','Saisine médiateur']},
{id:'d6',ref:'JR-2026-002',t:'Bigster — ressorts arrière, campagne de rappel',dom:'conso',status:'clos',
 veh:'Dacia Bigster 1.2 TCe 130',vin:'UU1DJF00XSN004411',adv:'Concession Sud Dacia',
 amount:0,opened:'2026-01-05',due:addDays(today(),-20),
 arts:['C. conso L421-3','C. conso L421-7'],
 notes:'Campagne exécutée le 22/01 : remplacement des deux ressorts arrière, contrôle hauteur et géométrie. Dossier clos, pièces archivées.',
 pieces:['Notification de rappel','Ordre de réparation','Compte rendu d’intervention']}];
var STATUS=[{k:'urgent',l:'Urgent',c:'#ff4d6d'},{k:'mise en demeure',l:'Mise en demeure',c:'#ffb020'},
 {k:'instruction',l:'Instruction',c:'#38bdf8'},{k:'expertise',l:'Expertise',c:'#c084fc'},
 {k:'médiation',l:'Médiation',c:'#a3e635'},{k:'clos',l:'Clos',c:'#5b8a70'}];
function statusOf(k){return STATUS.find(function(s){return s.k===k})||STATUS[2]}

/* ═══════════ état ═══════════ */
var DEF={density:100,text:100,contrast:100,glow:52,grain:14,parchment:true,raw:false,timeline:true,
 seal:'#d8b45a',accent:'#22c55e',sort:'recent',view:'all',cols:3};
var ST={tab:'analyse',q:'',dom:'all',stat:'all',sort:LS.g('jraSort','recent'),view:LS.g('jraView','all'),
 sel:[],drawer:null,edit:null,undo:null,cfg:Object.assign({},DEF,LS.g('jraCfg',{})),
 arts:[],procs:[],tpl:[],doss:[],log:[],views:LS.g('jraViews',[]),
 facts:'',res:null,letter:{tpl:'t-demeure',vars:{},out:''},
 calc:{presc:{start:today(),kind:'1648'},int:{cap:5000,rate:4.2,from:addDays(today(),-180)},
 immo:{days:12,rate:35},vet:{val:14900,coef:18}}};
function saveCfg(){LS.s('jraCfg',ST.cfg)}
function persist(){LS.s('jraArts',ST.arts);LS.s('jraProcs',ST.procs);LS.s('jraTpl',ST.tpl);LS.s('jraDoss',ST.doss);LS.s('jraViews',ST.views)}
function jlog(kind,msg,lvl){ST.log.unshift({t:new Date().toISOString(),kind:kind,msg:msg,lvl:lvl||'info'});
 if(ST.log.length>600)ST.log.pop();LS.s('jraLog',ST.log)}
function load(){
 ST.arts=LS.g('jraArts',null);
 if(!ST.arts){ST.arts=ART_SEED.map(function(a){return{id:uid('a'),ref:a[0],t:a[1],dom:a[2],txt:a[3],delay:a[4],grav:a[5],tags:a[6],ts:Date.now()}})}
 ST.procs=LS.g('jraProcs',null)||PROC_SEED.map(function(p){return Object.assign({},p,{ts:Date.now()})});
 ST.tpl=LS.g('jraTpl',null)||TPL_SEED.map(function(t){return Object.assign({},t,{ts:Date.now()})});
 ST.doss=LS.g('jraDoss',null)||DOSS_SEED.map(function(d){return Object.assign({},d,{ts:Date.now()})});
 ST.log=LS.g('jraLog',[]);
 persist()}

/* ═══════════ analyseur ═══════════ */
function tokens(s){return norm(s).split(' ').filter(function(w){return w.length>3})}
function analyse(txt){
 var tk=tokens(txt);if(!tk.length)return{arts:[],procs:[],score:0};
 var veh='';try{veh=(typeof S!=='undefined'&&S.vehicle&&S.vehicle.brand)||''}catch(e){}
 function score(hay,w){var h=norm(hay),n=0;tk.forEach(function(t){if(h.indexOf(t)>=0)n+=w});return n}
 var a=ST.arts.map(function(x){
  var s=score(x.tags,3)+score(x.t,2.4)+score(x.ref,2)+score(x.txt,1);
  if(x.dom==='vehicule'&&veh)s*=1.15;
  return{it:x,s:s}}).filter(function(r){return r.s>0}).sort(function(p,q){return q.s-p.s});
 var p=ST.procs.map(function(x){
  var s=score(x.t,3)+score(x.steps.join(' '),1.4)+score(x.traps.join(' '),1.6)+score(x.dom,1);
  if(x.dom==='vehicule'&&veh)s*=1.15;
  return{it:x,s:s}}).filter(function(r){return r.s>0}).sort(function(u,v){return v.s-u.s});
 return{arts:a.slice(0,14),procs:p.slice(0,6),score:a.length+p.length}}
function runAnalyse(){
 var t=ST.facts.trim();
 if(t.length<20){toast('Décrivez les faits en quelques phrases (20 caractères minimum)');snd('err');return}
 ST.res=analyse(t);
 jlog('ANALYSE',ST.res.arts.length+' repère(s) et '+ST.res.procs.length+' procédure(s) identifiés','ok');
 snd('seal');toast('⚖️ '+ST.res.arts.length+' repère(s) · '+ST.res.procs.length+' procédure(s)');render()}
var SAMPLE='J’ai acheté chez un concessionnaire un véhicule diesel d’occasion il y a huit mois. Le moteur a cassé après un claquement au démarrage. Le diagnostic révèle une chaîne de distribution allongée, défaut connu de ce moteur et couvert par une campagne du constructeur. Le vendeur refuse toute prise en charge en invoquant la mention vendu en l’état sans garantie portée sur le certificat de cession. Je souhaite obtenir le remboursement du véhicule et le paiement des frais de dépannage.';

/* ═══════════ filtres / tri ═══════════ */
function applyView(list,kind){
 var q=norm(ST.q),out=list.slice();
 if(ST.dom!=='all')out=out.filter(function(x){return x.dom===ST.dom});
 if(kind==='doss'&&ST.stat!=='all')out=out.filter(function(x){return x.status===ST.stat});
 if(ST.view==='urgent')out=out.filter(function(x){var d=x.due?daysLeft(x.due):null;return d!=null&&d<=30});
 if(ST.view==='vehicule')out=out.filter(function(x){return x.dom==='vehicule'||x.dom==='conso'});
 if(ST.view==='delai')out=out.filter(function(x){return (x.delay||0)>0||!!x.due});
 if(ST.view==='critique')out=out.filter(function(x){return x.grav==='critique'||x.status==='urgent'});
 var custom=ST.views.find(function(v){return v.id===ST.view});
 if(custom){if(custom.dom!=='all')out=out.filter(function(x){return x.dom===custom.dom});
  if(custom.q)out=out.filter(function(x){return norm(JSON.stringify(x)).indexOf(norm(custom.q))>=0})}
 if(q)out=out.filter(function(x){return norm(JSON.stringify(x)).indexOf(q)>=0});
 var s=ST.sort;
 if(s==='alpha')out.sort(function(a,b){return String(a.t||a.ref).localeCompare(String(b.t||b.ref))});
 else if(s==='grav'){var ord={critique:0,eleve:1,modere:2,info:3};
  out.sort(function(a,b){return (ord[a.grav]!=null?ord[a.grav]:9)-(ord[b.grav]!=null?ord[b.grav]:9)})}
 else if(s==='echeance')out.sort(function(a,b){return (daysLeft(a.due)==null?9999:daysLeft(a.due))-(daysLeft(b.due)==null?9999:daysLeft(b.due))});
 else if(s==='delai')out.sort(function(a,b){return (b.delay||0)-(a.delay||0)});
 else if(s==='montant')out.sort(function(a,b){return (b.amount||0)-(a.amount||0)});
 else if(s==='manuel')out.sort(function(a,b){return (a.ord||0)-(b.ord||0)});
 else out.sort(function(a,b){return (b.ts||0)-(a.ts||0)});
 return out}

/* ═══════════ CRUD ═══════════ */
function collection(kind){return kind==='art'?ST.arts:kind==='proc'?ST.procs:kind==='tpl'?ST.tpl:ST.doss}
function findItem(kind,id){return collection(kind).find(function(x){return x.id===id})}
function saveItem(kind,obj){
 var c=collection(kind),i=c.findIndex(function(x){return x.id===obj.id});
 obj.ts=Date.now();
 if(i>=0)c[i]=obj;else c.unshift(obj);
 persist();jlog('ÉDITION',(kind==='art'?'Repère ':kind==='proc'?'Procédure ':kind==='tpl'?'Modèle ':'Dossier ')+(obj.ref||obj.t||obj.id)+' enregistré','ok');
 snd('seal');toast('💾 Enregistré')}
function removeItems(kind,ids){
 var c=collection(kind),removed=c.filter(function(x){return ids.indexOf(x.id)>=0});
 if(!removed.length)return;
 var idx=removed.map(function(r){return{it:r,at:c.indexOf(r)}});
 for(var i=c.length-1;i>=0;i--)if(ids.indexOf(c[i].id)>=0)c.splice(i,1);
 ST.sel=[];persist();snd('del');
 jlog('SUPPRESSION',removed.length+' élément(s) supprimé(s)','warn');
 toast('🗑️ '+removed.length+' élément(s) supprimé(s)',{label:'Annuler',fn:function(){
  idx.sort(function(a,b){return a.at-b.at}).forEach(function(r){c.splice(Math.min(r.at,c.length),0,r.it)});
  persist();snd('ok');toast('↩️ Restauration effectuée');render()}});
 render()}
function reorder(kind,fromId,toId){
 var c=collection(kind);
 var vis=applyView(c,kind==='doss'?'doss':kind).map(function(x){return x.id});
 var f=vis.indexOf(fromId),t=vis.indexOf(toId);
 if(f<0||t<0||f===t)return;
 vis.splice(t,0,vis.splice(f,1)[0]);
 vis.forEach(function(id,i){var it=c.find(function(x){return x.id===id});if(it)it.ord=i});
 ST.sort='manuel';LS.s('jraSort','manuel');persist();snd('tick');render()}
function saveView(){
 var n=prompt('Nom de la vue enregistrée :','Ma vue');
 if(!n)return;
 ST.views.push({id:uid('v'),name:n.slice(0,32),dom:ST.dom,q:ST.q,sort:ST.sort});
 persist();ST.view=ST.views[ST.views.length-1].id;LS.s('jraView',ST.view);snd('ok');toast('🔖 Vue enregistrée');render()}

/* ═══════════ courrier ═══════════ */
function baseVars(){
 var d=ST.doss[0],v='',vin='',imm='';
 try{if(typeof S!=='undefined'&&S.vehicle){v=[S.vehicle.brand,S.vehicle.model,S.vehicle.engine].filter(Boolean).join(' ');}}catch(e){}
 if(d){v=v||d.veh;vin=d.vin}
 return{expediteur:'[Nom Prénom / Cabinet]',adresse_expediteur:'[Adresse complète]',
  destinataire:d?d.adv:'[Destinataire]',adresse_destinataire:'[Adresse du destinataire]',
  lrar:'[n° LRAR]',ville:'[Ville]',date:dfr(today()),vehicule:v||'[Marque modèle motorisation]',
  vin:vin||'[VIN 17 caractères]',immat:'[AA-123-AA]',date_achat:d?dfr(d.opened):'[date]',
  prix:d?String(d.amount||0):'[prix]',montant:d?String(d.amount||0):'[montant]',
  date_decouverte:dfr(today()),faits:ST.facts||'[Exposé précis des faits]',
  choix:'la réparation du bien',expert:'[Cabinet d’expertise]',mediateur:'[Médiateur désigné]',
  date_reclamation:'[date]',chronologie:'— '+dfr(today())+' : constat du défaut',
  demande:'la résolution de la vente et la restitution du prix',
  sinistre:'[n° sinistre]',date_refus:'[date]',avis:'[n° avis]',
  pieces:'copie de la facture, rapport de diagnostic, échanges',
  signature:'[Nom Prénom]\n[Qualité]',professionnel:'oui'}}
function renderLetter(){
 var t=ST.tpl.find(function(x){return x.id===ST.letter.tpl});
 if(!t){ST.letter.out='';return ''}
 var v=Object.assign({},baseVars(),ST.letter.vars);
 var body=t.body.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,function(m,k,inner){
  var val=v[k];return (val&&val!=='non'&&val!=='')?inner:''});
 body=body.replace(/\{\{(\w+)\}\}/g,function(m,k){return v[k]!=null&&v[k]!==''?v[k]:'['+k+']'});
 ST.letter.out=body;return body}
function letterFromProc(pid){
 var p=ST.procs.find(function(x){return x.id===pid});if(!p)return;
 var map={vehicule:'t-demeure',conso:'t-conf',procedure:'t-expertise',route:'t-assurance',contrat:'t-demeure'};
 ST.letter.tpl=map[p.dom]||'t-demeure';
 ST.letter.vars=Object.assign({},ST.letter.vars,{faits:ST.facts||p.t});
 ST.tab='courriers';render();snd('page');toast('✉️ Modèle pré-rempli depuis la procédure')}
function dossierFromAnalyse(){
 var r=ST.res;if(!r||!r.arts.length){toast('Lancez d’abord une analyse');return}
 var top=r.procs[0]?r.procs[0].it:null;
 var dom=top?top.dom:(r.arts[0].it.dom);
 var d={id:uid('d'),ref:'JR-'+new Date().getFullYear()+'-'+String(ST.doss.length+1).padStart(3,'0'),
  t:(ST.facts.slice(0,64)||'Nouveau dossier')+(ST.facts.length>64?'…':''),dom:dom,status:'instruction',
  veh:'',vin:'',adv:'',amount:0,opened:today(),due:addDays(today(),30),
  arts:r.arts.slice(0,5).map(function(x){return x.it.ref}),notes:ST.facts,pieces:[],ts:Date.now(),ord:0};
 try{if(typeof S!=='undefined'&&S.vehicle)d.veh=[S.vehicle.brand,S.vehicle.model,S.vehicle.engine].filter(Boolean).join(' ')}catch(e){}
 ST.doss.unshift(d);persist();ST.drawer={kind:'doss',id:d.id};ST.tab='dossiers';
 jlog('DOSSIER','Dossier '+d.ref+' créé depuis l’analyse','ok');snd('seal');toast('📁 Dossier '+d.ref+' créé');render()}

/* ═══════════ calculateurs ═══════════ */
var PRESC=[{k:'1648',l:'Vice caché — 2 ans de la découverte',d:730,ref:'C. civ. 1648'},
 {k:'L217-12',l:'Conformité — 2 ans de la délivrance',d:730,ref:'C. conso L217-12'},
 {k:'2224',l:'Droit commun — 5 ans',d:1825,ref:'C. civ. 2224'},
 {k:'1245-17',l:'Produits défectueux — 10 ans',d:3650,ref:'C. civ. 1245-17'},
 {k:'L221-18',l:'Rétractation — 14 jours',d:14,ref:'C. conso L221-18'},
 {k:'L217-9',l:'Mise en conformité — 30 jours',d:30,ref:'C. conso L217-9'},
 {k:'assurance',l:'Assurance — 2 ans (biennale)',d:730,ref:'C. ass. L114-1'}];
function calcPresc(){var c=ST.calc.presc,p=PRESC.find(function(x){return x.k===c.kind})||PRESC[0];
 var end=addDays(c.start||today(),p.d),left=daysLeft(end);
 return{end:end,left:left,ref:p.ref,label:p.l,state:left==null?'—':left<0?'expiré':left<=30?'critique':left<=90?'attention':'ouvert'}}
function calcInt(){var c=ST.calc.int,d=Math.max(0,(new Date(today())-new Date(c.from))/86400000);
 var i=(c.cap||0)*(c.rate||0)/100*(d/365);return{days:Math.round(d),int:i,total:(c.cap||0)+i}}
function calcImmo(){var c=ST.calc.immo;return{total:(c.days||0)*(c.rate||0)}}
function calcVet(){var c=ST.calc.vet;return{loss:(c.val||0)*(c.coef||0)/100,net:(c.val||0)*(1-(c.coef||0)/100)}}

/* ═══════════ PDF ═══════════ */
function pdf(title,blocks){
 var W=595.28,H=841.89,M=42,LH=13.2,pages=[],cur=[],y=H-M;
 function lat(s){return String(s).normalize('NFC').replace(/[^\x20-\xFF]/g,function(c){
  return {'€':'EUR','—':'-','–':'-','’':"'",'‘':"'",'“':'"','”':'"','…':'...','⚖':'','✅':'[OK]','❌':'[X]','📁':'','🔎':''}[c]||''})}
 function q(s){return String(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
 function band(){cur.push('0.024 0.09 0.06 rg '+M+' '+(H-M-4)+' '+(W-2*M)+' 26 re f');
  cur.push('BT /F2 11.5 Tf 0.85 0.71 0.35 rg 1 0 0 1 '+(M+10)+' '+(H-M+5)+' Tm ('+q(lat('KEV FUSION 2026 — JUSTEREPÈRE · '+title))+') Tj ET');y=H-M-24}
 function nl(h){y-=(h||LH);if(y<M+44){pages.push(cur);cur=[];y=H-M;band()}}
 function t(s,o){o=o||{};nl(o.h);cur.push('BT /'+(o.b?'F2':'F1')+' '+(o.fs||9.3)+' Tf '+(o.c||'0.09 0.11 0.16')+
  ' rg 1 0 0 1 '+(M+(o.x||0))+' '+y.toFixed(2)+' Tm ('+q(lat(s))+') Tj ET')}
 function rule(){nl(8);cur.push('0.82 0.78 0.62 RG 0.7 w '+M+' '+(y+4).toFixed(2)+' m '+(W-M)+' '+(y+4).toFixed(2)+' l S');nl(4)}
 function wrap(s,max){var words=String(s).split(/\s+/),lines=[],line='';
  words.forEach(function(w){if((line+' '+w).trim().length>max){lines.push(line);line=w}else line=(line?line+' ':'')+w});
  if(line)lines.push(line);return lines}
 band();
 t('Édité le '+new Date().toLocaleString('fr-FR'),{fs:8.3,c:'0.35 0.4 0.48'});
 blocks.forEach(function(b){
  if(b.rule){rule();return}
  if(b.h){nl(19);t(b.h,{b:true,fs:11,c:'0.13 0.35 0.62'});return}
  if(b.sub){nl(16);t(b.sub,{b:true,fs:9.8,c:'0.09 0.11 0.16'});return}
  wrap(b.t||'',b.w||104).forEach(function(l){t(l,{fs:b.fs||9,x:b.x||0,c:b.c||'0.09 0.11 0.16'})})});
 rule();
 t('Document d’aide à l’expertise et à la rédaction. Il ne constitue pas une consultation juridique individualisée',{fs:7.8,c:'0.35 0.4 0.48'});
 t('ni une expertise judiciaire contradictoire. Vérifiez la version en vigueur des textes cités.',{fs:7.8,c:'0.35 0.4 0.48'});
 t('KEV FUSION 2026 — '+location.host,{fs:7.8,c:'0.35 0.4 0.48'});
 pages.push(cur);
 var objs=[],n=1;function add(s){objs.push(s);return n++}
 var fr=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
 var fb=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 var pg=add('<< /Type /Pages /Kids [] /Count 0 >>'),ids=[];
 pages.forEach(function(ops){var s=ops.join('\n');
  var sid=add('<< /Length '+s.length+' >>\nstream\n'+s+'\nendstream');
  ids.push(add('<< /Type /Page /Parent '+pg+' 0 R /MediaBox [0 0 '+W.toFixed(2)+' '+H.toFixed(2)+
   '] /Resources << /Font << /F1 '+fr+' 0 R /F2 '+fb+' 0 R >> >> /Contents '+sid+' 0 R >>'))});
 objs[pg-1]='<< /Type /Pages /Kids ['+ids.map(function(i){return i+' 0 R'}).join(' ')+'] /Count '+ids.length+' >>';
 var cat=add('<< /Type /Catalog /Pages '+pg+' 0 R >>');
 var out='%PDF-1.4\n',offs=[];
 objs.forEach(function(o,i){offs.push(out.length);out+=(i+1)+' 0 obj\n'+o+'\nendobj\n'});
 var xr=out.length;out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n';
 offs.forEach(function(o){out+=('0000000000'+o).slice(-10)+' 00000 n \n'});
 out+='trailer\n<< /Size '+(objs.length+1)+' /Root '+cat+' 0 R >>\nstartxref\n'+xr+'\n%%EOF';
 var b=new Uint8Array(out.length);for(var i=0;i<out.length;i++)b[i]=out.charCodeAt(i)&255;
 return new Blob([b],{type:'application/pdf'})}
function exportPdf(){
 var blocks=[],o=ST.tab;
 if(o==='courriers'&&ST.letter.out){
  blocks.push({h:'COURRIER'});
  ST.letter.out.split('\n').forEach(function(l){blocks.push({t:l||' ',fs:9.4})});
 }else if(o==='dossiers'){
  var ds=applyView(ST.doss,'doss');
  blocks.push({h:'DOSSIERS — '+ds.length});
  ds.forEach(function(d){blocks.push({sub:d.ref+' · '+d.t});
   blocks.push({t:'Domaine : '+domLabel(d.dom)+' · Statut : '+statusOf(d.status).l+' · Enjeu : '+eur(d.amount),fs:8.6,c:'0.3 0.35 0.42'});
   blocks.push({t:'Véhicule : '+(d.veh||'—')+' · VIN : '+(d.vin||'—'),fs:8.6,c:'0.3 0.35 0.42'});
   blocks.push({t:'Partie adverse : '+(d.adv||'—')+' · Ouvert le '+dfr(d.opened)+' · Échéance '+dfr(d.due),fs:8.6,c:'0.3 0.35 0.42'});
   if(d.arts&&d.arts.length)blocks.push({t:'Fondements : '+d.arts.join(' · '),fs:8.6});
   if(d.notes)blocks.push({t:'Notes : '+d.notes,fs:8.6});
   if(d.pieces&&d.pieces.length)blocks.push({t:'Pièces : '+d.pieces.join(' · '),fs:8.4,c:'0.3 0.35 0.42'});
   blocks.push({rule:true})});
 }else if(o==='reperes'){
  var as=applyView(ST.arts,'art');blocks.push({h:'REPÈRES JURIDIQUES — '+as.length});
  as.forEach(function(a){blocks.push({sub:a.ref+' — '+a.t});
   blocks.push({t:'Domaine : '+domLabel(a.dom)+' · Gravité : '+(GRAV[a.grav]||{}).l+(a.delay?' · Délai : '+a.delay+' jours':''),fs:8.5,c:'0.3 0.35 0.42'});
   blocks.push({t:a.txt,fs:8.8});blocks.push({rule:true})});
 }else if(o==='procedures'){
  var ps=applyView(ST.procs,'proc');blocks.push({h:'PROCÉDURES — '+ps.length});
  ps.forEach(function(p){blocks.push({sub:p.t});
   blocks.push({t:'Domaine : '+domLabel(p.dom)+' · Délai : '+p.delay+' · Juridiction : '+p.jur,fs:8.5,c:'0.3 0.35 0.42'});
   blocks.push({t:'Fondements : '+(p.base||[]).join(' · '),fs:8.5});
   (p.steps||[]).forEach(function(s,i){blocks.push({t:(i+1)+'. '+s,fs:8.6,x:6})});
   if(p.pieces&&p.pieces.length)blocks.push({t:'Pièces : '+p.pieces.join(' · '),fs:8.4,c:'0.3 0.35 0.42'});
   if(p.traps&&p.traps.length){blocks.push({t:'Pièges à éviter :',fs:8.6,b:true,c:'0.72 0.13 0.2'});
    p.traps.forEach(function(s){blocks.push({t:'— '+s,fs:8.4,x:6,c:'0.62 0.4 0.05'})})}
   blocks.push({rule:true})});
 }else if(o==='analyse'&&ST.res){
  blocks.push({h:'ANALYSE DES FAITS'});blocks.push({t:ST.facts,fs:9});
  blocks.push({h:'REPÈRES PERTINENTS'});
  ST.res.arts.forEach(function(r){blocks.push({sub:r.it.ref+' — '+r.it.t+' (score '+r.s.toFixed(1)+')'});
   blocks.push({t:r.it.txt,fs:8.6})});
  blocks.push({h:'PROCÉDURES RECOMMANDÉES'});
  ST.res.procs.forEach(function(r){blocks.push({sub:r.it.t});
   (r.it.steps||[]).forEach(function(s,i){blocks.push({t:(i+1)+'. '+s,fs:8.4,x:6})})});
 }else if(o==='calc'){
  var p=calcPresc(),i2=calcInt(),im=calcImmo(),v=calcVet();
  blocks.push({h:'CALCULATEURS'});
  blocks.push({sub:'Prescription — '+p.label});
  blocks.push({t:'Point de départ : '+dfr(ST.calc.presc.start)+' · Échéance : '+dfr(p.end)+' · '+p.left+' jours · '+p.state+' · '+p.ref});
  blocks.push({sub:'Intérêts légaux'});
  blocks.push({t:'Capital '+eur(ST.calc.int.cap)+' · taux '+ST.calc.int.rate+' % · '+i2.days+' jours → intérêts '+eur(i2.int)+' · total '+eur(i2.total)});
  blocks.push({sub:'Immobilisation'});
  blocks.push({t:ST.calc.immo.days+' jours × '+eur(ST.calc.immo.rate)+' = '+eur(im.total)});
  blocks.push({sub:'Vétusté'});
  blocks.push({t:'Valeur '+eur(ST.calc.vet.val)+' · abattement '+ST.calc.vet.coef+' % → perte '+eur(v.loss)+' · net '+eur(v.net)});
 }else{blocks.push({h:'JOURNAL'});ST.log.slice(0,120).forEach(function(l){
  blocks.push({t:l.t.slice(0,19).replace('T',' ')+' ['+l.kind+'] '+l.msg,fs:8,c:'0.3 0.35 0.42'})})}
 var b=pdf('MODE ADMIN',blocks);
 dl(b,'JusteRepere-'+ST.tab+'-'+today()+'.pdf');jlog('EXPORT','PDF '+ST.tab+' généré','ok');snd('out');toast('📄 PDF généré')}
async function sharePdf(){
 var b=pdf('MODE ADMIN',[{h:'SYNTHÈSE JUSTEREPÈRE'},
  {t:'Repères : '+ST.arts.length+' · Procédures : '+ST.procs.length+' · Modèles : '+ST.tpl.length+' · Dossiers : '+ST.doss.length},
  {t:'Dossiers urgents : '+ST.doss.filter(function(d){var l=daysLeft(d.due);return l!=null&&l<=30&&d.status!=='clos'}).length},
  {rule:true},{h:'DOSSIERS EN COURS'}].concat(ST.doss.filter(function(d){return d.status!=='clos'}).map(function(d){
   return{t:d.ref+' · '+d.t+' · '+statusOf(d.status).l+' · échéance '+dfr(d.due)+' · '+eur(d.amount),fs:8.6}})));
 var f=new File([b],'JusteRepere-synthese-'+today()+'.pdf',{type:'application/pdf'});
 try{if(navigator.canShare&&navigator.canShare({files:[f]})){
   await navigator.share({files:[f],title:'JusteRepère — synthèse',text:'JusteRepère · '+ST.doss.length+' dossiers'});
   snd('out');toast('📤 Partagé');return}}catch(e){if(e&&e.name==='AbortError')return}
 dl(b,f.name);toast('📄 PDF téléchargé')}
function exportJson(){
 dl(new Blob([JSON.stringify({ts:new Date().toISOString(),arts:ST.arts,procs:ST.procs,tpl:ST.tpl,doss:ST.doss,views:ST.views,log:ST.log},null,2)],
  {type:'application/json'}),'JusteRepere-base-'+today()+'.json');snd('out');toast('🧬 Base exportée')}
function importJson(file){
 var r=new FileReader();
 r.onload=function(){try{var j=JSON.parse(r.result);
  if(j.arts)ST.arts=j.arts;if(j.procs)ST.procs=j.procs;if(j.tpl)ST.tpl=j.tpl;if(j.doss)ST.doss=j.doss;if(j.views)ST.views=j.views;
  persist();jlog('IMPORT','Base importée','ok');snd('seal');toast('📥 Base importée');render()}
  catch(e){toast('❌ Fichier illisible');snd('err')}};
 r.readAsText(file)}

/* ═══════════ thème ═══════════ */
function theme(){
 var r=document.documentElement.style,c=ST.cfg;
 r.setProperty('--jr-seal',c.seal);r.setProperty('--jr-acc',c.accent);
 r.setProperty('--jr-glow',(c.glow/100).toFixed(2));r.setProperty('--jr-grain',(c.grain/100).toFixed(2));
 r.setProperty('--jr-den',(c.density/100).toFixed(2));r.setProperty('--jr-txt',(c.text/100).toFixed(2));
 r.setProperty('--jr-con',(c.contrast/100).toFixed(2));
 document.body.classList.toggle('jr-parch',!!c.parchment);
 document.body.classList.toggle('jr-raw',!!c.raw)}

/* ═══════════ rendu ═══════════ */
var TABS=[['analyse','🔎 Analyse'],['reperes','📚 Repères'],['procedures','🧭 Procédures'],
 ['courriers','✉️ Courriers'],['dossiers','📁 Dossiers'],['calc','🧮 Calculateurs'],['journal','🧾 Journal']];
function render(){
 var v=$('#view');if(!v)return;
 if(!LOCK.unlocked){v.innerHTML=lockView();bind();theme();return}
 var urg=ST.doss.filter(function(d){var l=daysLeft(d.due);return l!=null&&l<=30&&d.status!=='clos'}).length;
 var late=ST.doss.filter(function(d){var l=daysLeft(d.due);return l!=null&&l<0&&d.status!=='clos'}).length;
 var enjeu=ST.doss.filter(function(d){return d.status!=='clos'}).reduce(function(a,b){return a+(b.amount||0)},0);
 v.innerHTML=
 '<div class="jr-hero"><div class="jr-hero-grid"></div><div class="jr-hero-in">'+
  '<div class="jr-hero-l"><span class="jr-kick">⚖️ JUSTEREPÈRE · MODE ADMINISTRATEUR</span>'+
   '<h1>Le repère juste, la pièce à l’appui</h1>'+
   '<p>Analyse des faits, <b>repères juridiques vérifiables</b>, procédures pas-à-pas, courriers prêts à envoyer, '+
   'dossiers avec échéances et calculateurs de prescription. Tout est <b>éditable, exportable et tracé</b>.</p>'+
   '<p class="jr-ethic">Accès administrateur · base locale à votre appareil · aucune protection contournée.</p></div>'+
  '<div class="jr-hero-r">'+
   '<div class="jr-stat"><b>'+ST.arts.length+'</b><span>repères</span></div>'+
   '<div class="jr-stat p"><b>'+ST.procs.length+'</b><span>procédures</span></div>'+
   '<div class="jr-stat d"><b>'+ST.doss.length+'</b><span>dossiers</span></div>'+
   '<div class="jr-stat u"><b>'+urg+'</b><span>≤ 30 jours</span></div>'+
   '<div class="jr-stat l"><b>'+late+'</b><span>échus</span></div>'+
   '<div class="jr-stat m"><b>'+eur(enjeu)+'</b><span>enjeu ouvert</span></div>'+
  '</div></div>'+
  '<button class="jr-mute" data-jr="sound" id="jrMute">'+(AU.on?'🔊 Son actif':'🔇 Son coupé')+'</button>'+
 '</div>'+
 '<div class="jr-strip">'+
  '<span class="jr-pill seal">🔓 ADMIN ACTIF</span>'+
  '<span class="jr-pill">'+esc(domLabel(ST.dom)==='all'?'Tous domaines':domLabel(ST.dom))+'</span>'+
  (ST.q?'<span class="jr-pill info">recherche « '+esc(ST.q)+' »</span>':'')+
  '<span class="jr-pill">'+ST.sort+'</span>'+
  (ST.sel.length?'<span class="jr-pill warn">'+ST.sel.length+' sélectionné(s)</span>':'')+
  '<button class="jr-link" data-jr="classic">↗ JusteRepère classique</button>'+
  '<button class="jr-link" data-jr="lock">🔒 Verrouiller</button>'+
 '</div>'+
 '<div class="jr-layout"><section class="jr-main">'+
  '<div class="jr-card">'+
   '<div class="jr-tabs">'+TABS.map(function(t){
    return '<button class="jr-tab '+(ST.tab===t[0]?'on':'')+'" data-jrtab="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'+
   toolbar()+
   '<div id="jrBody">'+body()+'</div>'+
  '</div>'+
 '</section>'+dock()+'</div>'+
 (ST.drawer?drawer():'');
 theme();syncDock();bind();dnd();
 if(ST.tab==='courriers')renderLetterPreview()}
function lockView(){
 var first=!LS.g('jraHash','')&&(typeof ADMIN_HASH==='undefined');
 return '<div class="jr-lock"><div class="jr-lock-in">'+
  '<span class="jr-lock-seal">⚖️</span>'+
  '<span class="jr-kick">JUSTEREPÈRE · ACCÈS ADMINISTRATEUR</span>'+
  '<h1>'+(first?'Définir le code administrateur':'Déverrouiller le mode administrateur')+'</h1>'+
  '<p>Le mode administrateur ouvre l’édition complète de la base juridique, des procédures, des modèles de courriers '+
  'et des dossiers, ainsi que les exports et le journal. Les données restent sur cet appareil.</p>'+
  '<label for="jrPw">'+(first?'Nouveau code administrateur':'Mot de passe administrateur')+'</label>'+
  '<div class="jr-pwrow"><input id="jrPw" type="password" autocomplete="off" placeholder="••••••••">'+
   '<button class="jr-eye" data-jr="eye">👁</button></div>'+
  (LOCK.err?'<p class="jr-err">'+esc(LOCK.err)+'</p>':'')+
  '<div class="jr-lock-a"><button class="jr-pri" data-jr="unlock">🔓 '+(first?'Créer et entrer':'Entrer')+'</button>'+
   '<button data-jr="classic">↗ JusteRepère classique</button>'+
   '<button data-jr="home">🏠 Accueil</button></div>'+
  '<p class="jr-lock-note">'+(first?'Aucun mot de passe administrateur n’est encore défini sur cet appareil : le premier code saisi devient la référence.':'Le mot de passe administrateur de l’application est accepté.')+'</p>'+
 '</div></div>'}
function toolbar(){
 if(ST.tab==='journal'||ST.tab==='calc')return '';
 var kind=ST.tab==='reperes'?'art':ST.tab==='procedures'?'proc':ST.tab==='tpl'?'tpl':ST.tab==='dossiers'?'doss':null;
 return '<div class="jr-tools">'+
  '<input id="jrQ" placeholder="Rechercher un texte, une référence, un dossier…" value="'+esc(ST.q)+'">'+
  '<select id="jrDom"><option value="all">Tous domaines</option>'+DOMS.map(function(d){
   return '<option value="'+d.k+'"'+(ST.dom===d.k?' selected':'')+'>'+esc(d.l)+'</option>'}).join('')+'</select>'+
  (ST.tab==='dossiers'?'<select id="jrStat"><option value="all">Tous statuts</option>'+STATUS.map(function(s){
   return '<option value="'+s.k+'"'+(ST.stat===s.k?' selected':'')+'>'+esc(s.l)+'</option>'}).join('')+'</select>':'')+
  '<select id="jrSort">'+[['recent','Récents'],['alpha','Alphabétique'],['grav','Gravité'],['echeance','Échéance'],
   ['delai','Délai'],['montant','Enjeu'],['manuel','Ordre manuel']].map(function(s){
   return '<option value="'+s[0]+'"'+(ST.sort===s[0]?' selected':'')+'>'+s[1]+'</option>'}).join('')+'</select>'+
  '<select id="jrView"><option value="all">Vue : tout</option><option value="urgent">≤ 30 jours</option>'+
   '<option value="vehicule">Véhicule & conso</option><option value="delai">Avec délai</option>'+
   '<option value="critique">Critiques</option>'+
   ST.views.map(function(v){return '<option value="'+v.id+'">🔖 '+esc(v.name)+'</option>'}).join('')+'</select>'+
  '<button data-jr="saveview" title="Enregistrer la vue">🔖</button>'+
  (kind?'<button class="jr-pri" data-jrnew="'+kind+'">＋ Nouveau</button>':'')+
  (ST.sel.length?'<button class="jr-danger" data-jr="delsel">🗑️ Supprimer ('+ST.sel.length+')</button>'+
   '<button data-jr="selnone">Désélectionner</button>':'')+
 '</div>'}
function body(){
 if(ST.tab==='analyse')return analyseView();
 if(ST.tab==='reperes')return artsView();
 if(ST.tab==='procedures')return procsView();
 if(ST.tab==='courriers')return lettersView();
 if(ST.tab==='dossiers')return dossView();
 if(ST.tab==='calc')return calcView();
 return journalView()}
function analyseView(){
 var r=ST.res;
 return '<div class="jr-analyse">'+
  '<div class="jr-an-l"><label for="jrFacts">Exposé des faits</label>'+
   '<textarea id="jrFacts" rows="9" placeholder="Décrivez la situation : date et lieu d’achat, vendeur professionnel ou particulier, désordre constaté, date de découverte, démarches déjà effectuées, réponse du vendeur…">'+esc(ST.facts)+'</textarea>'+
   '<div class="jr-an-a"><button class="jr-pri" data-jr="analyse">⚖️ Analyser les faits</button>'+
    '<button data-jr="sample">📋 Exemple</button>'+
    '<button data-jr="clearfacts">Effacer</button>'+
    (r&&r.arts.length?'<button class="jr-seal-btn" data-jr="mkdoss">📁 Créer le dossier</button>':'')+'</div>'+
   '<p class="jr-note">L’analyse confronte votre exposé aux repères et aux procédures de la base : '+
   'chaque résultat affiche son score de pertinence et sa référence vérifiable. Elle ne remplace pas une consultation individualisée.</p>'+
  '</div>'+
  '<div class="jr-an-r">'+(r?
   (r.arts.length?
    '<div class="jr-box"><b>Repères pertinents · '+r.arts.length+'</b>'+
     r.arts.map(function(x){return '<article class="jr-hit" data-jropen="art|'+x.it.id+'">'+
      '<div class="jr-hit-h"><span class="jr-ref">'+esc(x.it.ref)+'</span>'+
      '<span class="jr-score">'+x.s.toFixed(1)+'</span>'+
      '<span class="jr-dot" style="background:'+domColor(x.it.dom)+'"></span></div>'+
      '<b>'+esc(x.it.t)+'</b><p>'+esc(x.it.txt.slice(0,190))+(x.it.txt.length>190?'…':'')+'</p>'+
      (x.it.delay?'<span class="jr-pill warn">délai '+x.it.delay+' j</span>':'')+
      '<span class="jr-pill" style="border-color:'+(GRAV[x.it.grav]||{}).c+';color:'+(GRAV[x.it.grav]||{}).c+'">'+esc((GRAV[x.it.grav]||{}).l||'')+'</span>'+
      '</article>'}).join('')+'</div>'
    :'<div class="jr-empty">Aucun repère ne correspond à cet exposé. Précisez les faits ou élargissez le vocabulaire.</div>')+
   (r.procs.length?'<div class="jr-box"><b>Procédures recommandées</b>'+
    r.procs.map(function(x){return '<article class="jr-hit proc" data-jropen="proc|'+x.it.id+'">'+
     '<div class="jr-hit-h"><b>'+esc(x.it.t)+'</b><span class="jr-score">'+x.s.toFixed(1)+'</span></div>'+
     '<p class="jr-mut">'+esc(x.it.delay)+' · '+esc(x.it.jur)+'</p>'+
     '<button class="jr-mini" data-jrletter="'+x.it.id+'">✉️ Courrier adapté</button></article>'}).join('')+'</div>':'')
   :'<div class="jr-empty">Saisissez les faits puis lancez l’analyse.<br>Les repères, procédures et courriers adaptés s’afficheront ici, classés par pertinence.</div>')+
  '</div></div>'}
function artsView(){
 var list=applyView(ST.arts,'art');
 if(!list.length)return '<div class="jr-empty">Aucun repère pour ce filtre. <button class="jr-mini" data-jrnew="art">＋ Créer un repère</button></div>';
 return '<div class="jr-list" id="jrList" data-kind="art">'+list.map(function(a){
  var sel=ST.sel.indexOf(a.id)>=0;
  return '<article class="jr-item'+(sel?' sel':'')+'" draggable="true" data-id="'+a.id+'" style="--c:'+domColor(a.dom)+'">'+
   '<label class="jr-check"><input type="checkbox" data-jrsel="'+a.id+'"'+(sel?' checked':'')+'></label>'+
   '<div class="jr-item-h"><span class="jr-ref">'+esc(a.ref)+'</span>'+
    '<span class="jr-tag">'+esc(domLabel(a.dom))+'</span>'+
    '<span class="jr-grav" style="color:'+(GRAV[a.grav]||{}).c+';border-color:'+(GRAV[a.grav]||{}).c+'">'+esc((GRAV[a.grav]||{}).l||'')+'</span>'+
    (a.delay?'<span class="jr-pill warn">'+a.delay+' j</span>':'')+
    '<button class="jr-open" data-jropen="art|'+a.id+'">⋯</button></div>'+
   '<b class="jr-item-t">'+esc(a.t)+'</b>'+
   '<p class="jr-item-x">'+esc(a.txt)+'</p>'+
   (ST.cfg.raw?'<p class="jr-rawline">'+esc(a.tags)+'</p>':'')+
   '<div class="jr-item-a"><button data-jredit="art|'+a.id+'">✏️ Éditer</button>'+
    '<button data-jr="addtodoss" data-ref="'+esc(a.ref)+'">📁 Lier</button>'+
    '<button class="jr-danger" data-jrdel="art|'+a.id+'">🗑️</button></div>'+
  '</article>'}).join('')+'</div>'}
function procsView(){
 var list=applyView(ST.procs,'proc');
 if(!list.length)return '<div class="jr-empty">Aucune procédure. <button class="jr-mini" data-jrnew="proc">＋ Créer</button></div>';
 return '<div class="jr-list wide" id="jrList" data-kind="proc">'+list.map(function(p){
  var sel=ST.sel.indexOf(p.id)>=0;
  return '<article class="jr-item proc'+(sel?' sel':'')+'" draggable="true" data-id="'+p.id+'" style="--c:'+domColor(p.dom)+'">'+
   '<label class="jr-check"><input type="checkbox" data-jrsel="'+p.id+'"'+(sel?' checked':'')+'></label>'+
   '<div class="jr-item-h"><b>'+esc(p.t)+'</b><span class="jr-tag">'+esc(domLabel(p.dom))+'</span>'+
    '<button class="jr-open" data-jropen="proc|'+p.id+'">⋯</button></div>'+
   '<div class="jr-meta"><span>⏱ '+esc(p.delay)+'</span><span>⚖ '+esc(p.jur)+'</span><span>💶 '+esc(p.cost||'—')+'</span></div>'+
   '<ol class="jr-steps">'+(p.steps||[]).map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ol>'+
   (p.traps&&p.traps.length?'<div class="jr-traps"><b>Pièges</b>'+p.traps.map(function(s){return '<span>'+esc(s)+'</span>'}).join('')+'</div>':'')+
   '<div class="jr-refs">'+(p.base||[]).map(function(r){return '<span class="jr-ref">'+esc(r)+'</span>'}).join('')+'</div>'+
   '<div class="jr-item-a"><button class="jr-pri" data-jrletter="'+p.id+'">✉️ Courrier</button>'+
    '<button data-jredit="proc|'+p.id+'">✏️ Éditer</button>'+
    '<button data-jr="mkdossfrom" data-id="'+p.id+'">📁 Dossier</button>'+
    '<button class="jr-danger" data-jrdel="proc|'+p.id+'">🗑️</button></div>'+
  '</article>'}).join('')+'</div>'}
function lettersView(){
 var v=Object.assign({},baseVars(),ST.letter.vars);
 var keys=Object.keys(baseVars());
 return '<div class="jr-letter">'+
  '<div class="jr-l-l"><label>Modèle de courrier</label>'+
   '<select id="jrTpl">'+ST.tpl.map(function(t){return '<option value="'+t.id+'"'+(ST.letter.tpl===t.id?' selected':'')+'>'+esc(t.t)+'</option>'}).join('')+'</select>'+
   '<div class="jr-l-tools"><button data-jrnew="tpl">＋ Modèle</button>'+
    '<button data-jredit="tpl|'+ST.letter.tpl+'">✏️ Éditer le modèle</button>'+
    '<button class="jr-danger" data-jrdel="tpl|'+ST.letter.tpl+'">🗑️</button></div>'+
   '<label>Variables</label><div class="jr-vars">'+keys.map(function(k){
    return '<div class="jr-var"><span>'+esc(k)+'</span><input data-jrvar="'+k+'" value="'+esc(v[k]||'')+'"></div>'}).join('')+'</div>'+
   '<div class="jr-l-a"><button class="jr-pri" data-jr="lettercopy">📋 Copier</button>'+
    '<button data-jr="lettertxt">📄 .txt</button>'+
    '<button class="jr-seal-btn" data-jr="letterpdf">📄 PDF</button>'+
    '<button data-jr="letterreset">↺ Variables auto</button></div>'+
  '</div>'+
  '<div class="jr-l-r"><div class="jr-paper" id="jrPaper"></div></div></div>'}
function renderLetterPreview(){
 var p=$('#jrPaper');if(!p)return;
 var out=renderLetter();
 p.innerHTML='<pre>'+esc(out||'Sélectionnez un modèle.')+'</pre>'}
function dossView(){
 var list=applyView(ST.doss,'doss');
 if(!list.length)return '<div class="jr-empty">Aucun dossier. <button class="jr-mini" data-jrnew="doss">＋ Créer un dossier</button></div>';
 return (ST.cfg.timeline?timeline(list):'')+
 '<div class="jr-list wide" id="jrList" data-kind="doss">'+list.map(function(d){
  var l=daysLeft(d.due),s=statusOf(d.status),sel=ST.sel.indexOf(d.id)>=0;
  var cls=l==null?'':l<0?'late':l<=15?'soon':l<=30?'near':'';
  return '<article class="jr-item doss'+(sel?' sel':'')+' '+cls+'" draggable="true" data-id="'+d.id+'" style="--c:'+s.c+'">'+
   '<label class="jr-check"><input type="checkbox" data-jrsel="'+d.id+'"'+(sel?' checked':'')+'></label>'+
   '<div class="jr-item-h"><span class="jr-ref">'+esc(d.ref)+'</span>'+
    '<span class="jr-status" style="color:'+s.c+';border-color:'+s.c+'">'+esc(s.l)+'</span>'+
    '<span class="jr-tag">'+esc(domLabel(d.dom))+'</span>'+
    (d.status==='clos'?'<span class="jr-sealed">SCELLÉ</span>':'')+
    '<button class="jr-open" data-jropen="doss|'+d.id+'">⋯</button></div>'+
   '<b class="jr-item-t">'+esc(d.t)+'</b>'+
   '<div class="jr-meta"><span>🚗 '+esc(d.veh||'—')+'</span><span>🏛 '+esc(d.adv||'—')+'</span><span>💶 '+eur(d.amount)+'</span></div>'+
   '<div class="jr-due"><span>Échéance '+dfr(d.due)+'</span>'+
    '<b class="'+cls+'">'+(l==null?'—':l<0?Math.abs(l)+' j de retard':l+' j restants')+'</b></div>'+
   (d.arts&&d.arts.length?'<div class="jr-refs">'+d.arts.map(function(r){return '<span class="jr-ref">'+esc(r)+'</span>'}).join('')+'</div>':'')+
   (d.notes?'<p class="jr-item-x">'+esc(d.notes.slice(0,220))+(d.notes.length>220?'…':'')+'</p>':'')+
   '<div class="jr-item-a"><button data-jredit="doss|'+d.id+'">✏️ Éditer</button>'+
    '<button data-jr="letterfrom" data-id="'+d.id+'">✉️ Courrier</button>'+
    '<button data-jr="advance" data-id="'+d.id+'">⏭ Statut</button>'+
    '<button class="jr-danger" data-jrdel="doss|'+d.id+'">🗑️</button></div>'+
  '</article>'}).join('')+'</div>'}
function timeline(list){
 var w=list.filter(function(d){return d.due}).sort(function(a,b){return daysLeft(a.due)-daysLeft(b.due)}).slice(0,10);
 if(!w.length)return '';
 return '<div class="jr-tl"><b>Échéancier</b><div class="jr-tl-track">'+w.map(function(d){
  var l=daysLeft(d.due),pos=Math.max(0,Math.min(100,((l+30)/120)*100));
  var c=l<0?'#ff4d6d':l<=15?'#ffb020':l<=30?'#38bdf8':'#22c55e';
  return '<button class="jr-tl-pt" style="left:'+pos+'%;--c:'+c+'" data-jropen="doss|'+d.id+'" title="'+esc(d.ref+' · '+dfr(d.due))+'">'+
   '<i></i><span>'+esc(d.ref.slice(-3))+'</span></button>'}).join('')+
  '<div class="jr-tl-axis"><span>−30 j</span><span>aujourd’hui</span><span>+90 j</span></div></div></div>'}
function calcView(){
 var p=calcPresc(),i=calcInt(),im=calcImmo(),v=calcVet();
 return '<div class="jr-calcs">'+
  '<div class="jr-calc"><b>⏳ Prescription</b>'+
   '<label>Point de départ</label><input type="date" data-jrc="presc.start" value="'+ST.calc.presc.start+'">'+
   '<label>Régime</label><select data-jrc="presc.kind">'+PRESC.map(function(x){
    return '<option value="'+x.k+'"'+(ST.calc.presc.kind===x.k?' selected':'')+'>'+esc(x.l)+'</option>'}).join('')+'</select>'+
   '<div class="jr-res '+p.state+'"><span>Échéance</span><b>'+dfr(p.end)+'</b>'+
    '<span>'+p.left+' jours · '+p.state+'</span><i>'+esc(p.ref)+'</i></div></div>'+
  '<div class="jr-calc"><b>💶 Intérêts légaux</b>'+
   '<label>Capital (€)</label><input type="number" data-jrc="int.cap" value="'+ST.calc.int.cap+'">'+
   '<label>Taux annuel (%)</label><input type="number" step="0.01" data-jrc="int.rate" value="'+ST.calc.int.rate+'">'+
   '<label>Depuis le</label><input type="date" data-jrc="int.from" value="'+ST.calc.int.from+'">'+
   '<div class="jr-res"><span>'+i.days+' jours</span><b>'+eur(i.int)+'</b><span>total '+eur(i.total)+'</span></div></div>'+
  '<div class="jr-calc"><b>🅿️ Immobilisation</b>'+
   '<label>Jours</label><input type="number" data-jrc="immo.days" value="'+ST.calc.immo.days+'">'+
   '<label>Taux journalier (€)</label><input type="number" data-jrc="immo.rate" value="'+ST.calc.immo.rate+'">'+
   '<div class="jr-res"><span>préjudice de jouissance</span><b>'+eur(im.total)+'</b></div></div>'+
  '<div class="jr-calc"><b>📉 Vétusté</b>'+
   '<label>Valeur de remplacement (€)</label><input type="number" data-jrc="vet.val" value="'+ST.calc.vet.val+'">'+
   '<label>Abattement (%)</label><input type="number" data-jrc="vet.coef" value="'+ST.calc.vet.coef+'">'+
   '<div class="jr-res"><span>perte '+eur(v.loss)+'</span><b>'+eur(v.net)+'</b><span>indemnité nette</span></div></div>'+
 '</div>'}
function journalView(){
 if(!ST.log.length)return '<div class="jr-empty">Aucune entrée. Chaque analyse, édition, suppression et export est journalisé.</div>';
 return '<div class="jr-log">'+ST.log.slice(0,240).map(function(l){
  return '<div class="jr-log-l '+l.lvl+'"><i>'+esc(l.t.slice(0,19).replace('T',' '))+'</i><b>'+esc(l.kind)+'</b><span>'+esc(l.msg)+'</span></div>'}).join('')+'</div>'}
function dock(){
 var c=ST.cfg;
 return '<aside class="jr-dock"><div class="jr-dock-h"><b>🎛️ Poste de travail</b>'+
  '<button class="jr-mini" data-jr="pdf" title="Export PDF">📄</button></div>'+
 '<div class="jr-dock-b">'+
  '<div class="jr-c"><label>Domaine actif</label><select data-jrcfg="dom">'+
   '<option value="all">Tous</option>'+DOMS.map(function(d){return '<option value="'+d.k+'">'+esc(d.l)+'</option>'}).join('')+'</select></div>'+
  rg('density','Densité',80,130,'%')+rg('text','Corps du texte',85,130,'%')+
  rg('contrast','Contraste',80,140,'%')+rg('glow','Halo du sceau',0,100,'%')+rg('grain','Grain parchemin',0,40,'')+
  rg('cols','Colonnes de la grille',1,4,'')+
  '<div class="jr-c"><label>Couleur du sceau</label><input type="color" data-jrcfg="seal" value="'+c.seal+'"></div>'+
  '<div class="jr-c"><label>Couleur d’accent</label><input type="color" data-jrcfg="accent" value="'+c.accent+'"></div>'+
  '<div class="jr-tgs">'+tg('parchment','Voile parchemin')+tg('raw','Mots-clés bruts')+tg('timeline','Échéancier')+'</div>'+
  '<div class="jr-sep"></div>'+
  '<div class="jr-btns">'+
   '<button data-jr="reset">↺ Réinitialiser</button><button data-jr="rand">🎲 Thème</button>'+
   '<button class="p" data-jr="pdf">📄 Export PDF</button>'+
   '<button class="b" data-jr="share">📤 Partager</button>'+
   '<button data-jr="json">🧬 Export JSON</button>'+
   '<button data-jr="import">📥 Importer</button>'+
  '</div>'+
  '<input type="file" id="jrImport" accept="application/json" hidden>'+
  '<p class="jr-note">Chaque réglage s’applique <b>immédiatement</b> à la lecture, à la grille et au rendu du papier.</p>'+
 '</div></aside>'}
function rg(k,l,a,b,u){return '<div class="jr-c"><label>'+l+' <b id="jro_'+k+'">'+ST.cfg[k]+(u||'')+'</b></label>'+
 '<input type="range" data-jrcfg="'+k+'" min="'+a+'" max="'+b+'" value="'+ST.cfg[k]+'"></div>'}
function tg(k,l){return '<label class="jr-tg" id="jrt_'+k+'"><input type="checkbox" data-jrcfgt="'+k+'"> '+l+'</label>'}
function syncDock(){
 $$('[data-jrcfg]').forEach(function(e){var k=e.dataset.jrcfg;
  if(k==='dom')e.value=ST.dom;else e.value=ST.cfg[k]});
 ['density','text','contrast','glow','grain','cols'].forEach(function(k){
  var o=$('#jro_'+k);if(o)o.textContent=ST.cfg[k]+(k==='cols'?'':'%')});
 ['parchment','raw','timeline'].forEach(function(k){
  var w=$('#jrt_'+k);if(w){w.querySelector('input').checked=!!ST.cfg[k];w.classList.toggle('on',!!ST.cfg[k])}});
 var d=$('#jrDom');if(d)d.value=ST.dom;
 var s=$('#jrSort');if(s)s.value=ST.sort;
 var v=$('#jrView');if(v)v.value=ST.view;
 var st=$('#jrStat');if(st)st.value=ST.stat;
 var g=$('#jrList');if(g)g.style.setProperty('--cols',ST.cfg.cols)}
function drawer(){
 var d=ST.drawer,it=findItem(d.kind,d.id);
 if(!it)return '';
 var edit=ST.edit&&ST.edit.id===it.id&&ST.edit.kind===d.kind;
 var bodyHtml='';
 if(d.kind==='art'){
  bodyHtml=edit?artForm(it):
   '<div class="jr-d-sec"><span class="jr-ref big">'+esc(it.ref)+'</span>'+
    '<h3>'+esc(it.t)+'</h3>'+
    '<div class="jr-meta"><span>'+esc(domLabel(it.dom))+'</span><span>'+esc((GRAV[it.grav]||{}).l)+'</span>'+
    (it.delay?'<span>délai '+it.delay+' jours</span>':'')+'</div>'+
    '<p class="jr-d-txt">'+esc(it.txt)+'</p>'+
    '<div class="jr-refs"><span class="jr-ref">'+esc(it.tags)+'</span></div></div>';
 }else if(d.kind==='proc'){
  bodyHtml=edit?procForm(it):
   '<div class="jr-d-sec"><h3>'+esc(it.t)+'</h3>'+
    '<div class="jr-meta"><span>'+esc(domLabel(it.dom))+'</span><span>'+esc(it.delay)+'</span><span>'+esc(it.jur)+'</span></div>'+
    '<b>Étapes</b><ol class="jr-steps">'+(it.steps||[]).map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ol>'+
    '<b>Pièces</b><ul class="jr-pieces">'+(it.pieces||[]).map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ul>'+
    '<b>Pièges</b><div class="jr-traps">'+(it.traps||[]).map(function(s){return '<span>'+esc(s)+'</span>'}).join('')+'</div>'+
    '<b>Fondements</b><div class="jr-refs">'+(it.base||[]).map(function(r){return '<span class="jr-ref">'+esc(r)+'</span>'}).join('')+'</div></div>';
 }else if(d.kind==='tpl'){
  bodyHtml=edit?tplForm(it):'<div class="jr-d-sec"><h3>'+esc(it.t)+'</h3><pre class="jr-d-pre">'+esc(it.body)+'</pre></div>';
 }else{
  bodyHtml=edit?dossForm(it):
   '<div class="jr-d-sec"><span class="jr-ref big">'+esc(it.ref)+'</span><h3>'+esc(it.t)+'</h3>'+
    '<table class="jr-tbl"><tr><td>Statut</td><td><b style="color:'+statusOf(it.status).c+'">'+esc(statusOf(it.status).l)+'</b></td></tr>'+
    '<tr><td>Domaine</td><td>'+esc(domLabel(it.dom))+'</td></tr>'+
    '<tr><td>Véhicule</td><td>'+esc(it.veh||'—')+'</td></tr>'+
    '<tr><td>VIN</td><td class="mono">'+esc(it.vin||'—')+'</td></tr>'+
    '<tr><td>Partie adverse</td><td>'+esc(it.adv||'—')+'</td></tr>'+
    '<tr><td>Enjeu</td><td><b>'+eur(it.amount)+'</b></td></tr>'+
    '<tr><td>Ouverture</td><td>'+dfr(it.opened)+'</td></tr>'+
    '<tr><td>Échéance</td><td>'+dfr(it.due)+' ('+(daysLeft(it.due)==null?'—':daysLeft(it.due)+' j')+')</td></tr></table>'+
    '<b>Fondements</b><div class="jr-refs">'+(it.arts||[]).map(function(r){return '<span class="jr-ref">'+esc(r)+'</span>'}).join('')+'</div>'+
    '<b>Notes</b><p class="jr-d-txt">'+esc(it.notes||'—')+'</p>'+
    '<b>Pièces</b><ul class="jr-pieces">'+(it.pieces||[]).map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ul></div>';
 }
 return '<div class="jr-drawer" id="jrDrawer"><div class="jr-drawer-in">'+
  '<div class="jr-drawer-h"><b>'+(edit?'Édition':'Détail')+'</b>'+
   '<button data-jr="dclose">✕</button></div>'+bodyHtml+
  '<div class="jr-drawer-a">'+
   (edit?'<button class="jr-pri" data-jr="dsave">💾 Enregistrer</button><button data-jr="dcancel">Annuler</button>'
    :'<button class="jr-pri" data-jr="dedit">✏️ Éditer</button>'+
     (d.kind==='proc'?'<button data-jrletter="'+it.id+'">✉️ Courrier</button>':'')+
     (d.kind==='doss'?'<button data-jr="letterfrom" data-id="'+it.id+'">✉️ Courrier</button>':'')+
     '<button data-jr="dup" data-kind="'+d.kind+'" data-id="'+it.id+'">📄 Dupliquer</button>'+
     '<button class="jr-danger" data-jrdel="'+d.kind+'|'+it.id+'">🗑️ Supprimer</button>')+
  '</div></div></div>'}
function fld(l,id,val,type){return '<label>'+l+'</label><input data-jrf="'+id+'" type="'+(type||'text')+'" value="'+esc(val==null?'':val)+'">'}
function artForm(it){
 return '<div class="jr-form">'+fld('Référence','ref',it.ref)+fld('Titre','t',it.t)+
  '<label>Domaine</label><select data-jrf="dom">'+DOMS.map(function(d){return '<option value="'+d.k+'"'+(it.dom===d.k?' selected':'')+'>'+esc(d.l)+'</option>'}).join('')+'</select>'+
  '<label>Gravité</label><select data-jrf="grav">'+Object.keys(GRAV).map(function(k){return '<option value="'+k+'"'+(it.grav===k?' selected':'')+'>'+GRAV[k].l+'</option>'}).join('')+'</select>'+
  fld('Délai (jours, 0 = aucun)','delay',it.delay||0,'number')+
  '<label>Texte du repère</label><textarea data-jrf="txt" rows="7">'+esc(it.txt||'')+'</textarea>'+
  fld('Mots-clés','tags',it.tags)+'</div>'}
function procForm(it){
 return '<div class="jr-form">'+fld('Titre','t',it.t)+
  '<label>Domaine</label><select data-jrf="dom">'+DOMS.map(function(d){return '<option value="'+d.k+'"'+(it.dom===d.k?' selected':'')+'>'+esc(d.l)+'</option>'}).join('')+'</select>'+
  fld('Délai','delay',it.delay)+fld('Juridiction','jur',it.jur)+fld('Coût','cost',it.cost)+
  '<label>Étapes (une par ligne)</label><textarea data-jrf="steps" rows="8">'+esc((it.steps||[]).join('\n'))+'</textarea>'+
  '<label>Pièces (une par ligne)</label><textarea data-jrf="pieces" rows="5">'+esc((it.pieces||[]).join('\n'))+'</textarea>'+
  '<label>Pièges (un par ligne)</label><textarea data-jrf="traps" rows="4">'+esc((it.traps||[]).join('\n'))+'</textarea>'+
  fld('Fondements (séparés par ·)','base',(it.base||[]).join(' · '))+'</div>'}
function tplForm(it){
 return '<div class="jr-form">'+fld('Titre du modèle','t',it.t)+
  '<label>Domaine</label><select data-jrf="dom">'+DOMS.map(function(d){return '<option value="'+d.k+'"'+(it.dom===d.k?' selected':'')+'>'+esc(d.l)+'</option>'}).join('')+'</select>'+
  '<label>Corps — variables {{nom}}, bloc conditionnel {{#professionnel}}…{{/professionnel}}</label>'+
  '<textarea data-jrf="body" rows="18" class="mono">'+esc(it.body||'')+'</textarea></div>'}
function dossForm(it){
 return '<div class="jr-form">'+fld('Référence','ref',it.ref)+fld('Intitulé','t',it.t)+
  '<label>Domaine</label><select data-jrf="dom">'+DOMS.map(function(d){return '<option value="'+d.k+'"'+(it.dom===d.k?' selected':'')+'>'+esc(d.l)+'</option>'}).join('')+'</select>'+
  '<label>Statut</label><select data-jrf="status">'+STATUS.map(function(s){return '<option value="'+s.k+'"'+(it.status===s.k?' selected':'')+'>'+s.l+'</option>'}).join('')+'</select>'+
  fld('Véhicule','veh',it.veh)+fld('VIN','vin',it.vin)+fld('Partie adverse','adv',it.adv)+
  fld('Enjeu (€)','amount',it.amount||0,'number')+fld('Ouverture','opened',it.opened,'date')+fld('Échéance','due',it.due,'date')+
  fld('Fondements (séparés par ·)','arts',(it.arts||[]).join(' · '))+
  '<label>Notes</label><textarea data-jrf="notes" rows="6">'+esc(it.notes||'')+'</textarea>'+
  '<label>Pièces (une par ligne)</label><textarea data-jrf="pieces" rows="4">'+esc((it.pieces||[]).join('\n'))+'</textarea></div>'}
function newItem(kind){
 var base={id:uid(kind),ts:Date.now(),ord:0,dom:ST.dom==='all'?'vehicule':ST.dom};
 var it;
 if(kind==='art')it=Object.assign(base,{ref:'Nouvelle référence',t:'Nouveau repère',txt:'',delay:0,grav:'modere',tags:''});
 else if(kind==='proc')it=Object.assign(base,{t:'Nouvelle procédure',delay:'',jur:'Tribunal judiciaire',cost:'',steps:[],pieces:[],traps:[],base:[]});
 else if(kind==='tpl')it=Object.assign(base,{t:'Nouveau modèle',body:'{{expediteur}}\n\n{{destinataire}}\n\n{{ville}}, le {{date}}\n\nObjet : \n\n{{faits}}\n\n{{signature}}'});
 else it=Object.assign(base,{ref:'JR-'+new Date().getFullYear()+'-'+String(ST.doss.length+1).padStart(3,'0'),
  t:'Nouveau dossier',status:'instruction',veh:'',vin:'',adv:'',amount:0,opened:today(),due:addDays(today(),30),arts:[],notes:'',pieces:[]});
 collection(kind).unshift(it);persist();
 ST.drawer={kind:kind,id:it.id};ST.edit={kind:kind,id:it.id};snd('page');render()}
function readForm(){
 var e=ST.edit;if(!e)return;
 var it=findItem(e.kind,e.id);if(!it)return;
 var o=Object.assign({},it);
 $$('[data-jrf]').forEach(function(f){
  var k=f.dataset.jrf,v=f.value;
  if(['steps','pieces','traps'].indexOf(k)>=0)o[k]=v.split('\n').map(function(s){return s.trim()}).filter(Boolean);
  else if(k==='base'||k==='arts')o[k]=v.split('·').map(function(s){return s.trim()}).filter(Boolean);
  else if(['delay','amount'].indexOf(k)>=0)o[k]=+v||0;
  else o[k]=v});
 saveItem(e.kind,o);ST.edit=null;render()}
function dnd(){
 var g=$('#jrList');if(!g||g._d)return;g._d=1;
 var kind=g.dataset.kind,dragId=null;
 g.addEventListener('dragstart',function(e){var c=e.target.closest('.jr-item');if(!c)return;
  dragId=c.dataset.id;c.classList.add('drag');try{e.dataTransfer.setData('text/plain',dragId)}catch(x){}});
 g.addEventListener('dragend',function(){$$('.jr-item',g).forEach(function(c){c.classList.remove('drag','over')})});
 g.addEventListener('dragover',function(e){var c=e.target.closest('.jr-item');if(!c||!dragId)return;
  e.preventDefault();$$('.jr-item',g).forEach(function(x){x.classList.remove('over')});c.classList.add('over')});
 g.addEventListener('drop',function(e){var c=e.target.closest('.jr-item');if(!c||!dragId)return;
  e.preventDefault();reorder(kind,dragId,c.dataset.id)})}
function repaint(){var b=$('#jrBody');if(b){b.innerHTML=body();dnd();
  if(ST.tab==='courriers')renderLetterPreview();
  var g=$('#jrList');if(g)g.style.setProperty('--cols',ST.cfg.cols)}}

/* ═══════════ événements ═══════════ */
function bind(){
 var v=$('#view');if(!v||v._jr)return;v._jr=1;
 v.addEventListener('input',function(e){
  var t=e.target;
  if(t.id==='jrFacts'){ST.facts=t.value;return}
  if(t.id==='jrQ'){ST.q=t.value;repaint();return}
  var ck=t.dataset.jrcfg;
  if(ck){ST.cfg[ck]=t.type==='range'?+t.value:t.value;
   var o=$('#jro_'+ck);if(o)o.textContent=ST.cfg[ck]+(ck==='cols'?'':'%');
   saveCfg();theme();var g=$('#jrList');if(g)g.style.setProperty('--cols',ST.cfg.cols);
   if(ST.tab==='courriers')renderLetterPreview();return}
  var tk=t.dataset.jrcfgt;
  if(tk){ST.cfg[tk]=t.checked;var w=$('#jrt_'+tk);if(w)w.classList.toggle('on',ST.cfg[tk]);saveCfg();theme();repaint();return}
  var cv=t.dataset.jrvar;
  if(cv){ST.letter.vars[cv]=t.value;renderLetterPreview();return}
  var cc=t.dataset.jrc;
  if(cc){var p=cc.split('.'),val=t.type==='number'?+t.value:t.value;
   ST.calc[p[0]][p[1]]=val;repaint();return}});
 v.addEventListener('change',function(e){
  var t=e.target;
  if(t.id==='jrDom'){ST.dom=t.value;syncDock();repaint();return}
  if(t.id==='jrStat'){ST.stat=t.value;repaint();return}
  if(t.id==='jrSort'){ST.sort=t.value;LS.s('jraSort',ST.sort);repaint();return}
  if(t.id==='jrView'){ST.view=t.value;LS.s('jraView',ST.view);repaint();return}
  if(t.id==='jrTpl'){ST.letter.tpl=t.value;render();return}
  if(t.id==='jrImport'&&t.files[0]){importJson(t.files[0]);t.value='';return}
  var ck=t.dataset.jrcfg;
  if(ck&&t.tagName==='SELECT'){if(ck==='dom'){ST.dom=t.value;syncDock();repaint()}
   else{ST.cfg[ck]=t.value;saveCfg();theme()}return}
  var cc=t.dataset.jrc;
  if(cc&&t.tagName==='SELECT'){var p=cc.split('.');ST.calc[p[0]][p[1]]=t.value;repaint();return}
  var sel=t.dataset.jrsel;
  if(sel){if(t.checked){if(ST.sel.indexOf(sel)<0)ST.sel.push(sel)}else ST.sel=ST.sel.filter(function(x){return x!==sel});
   render();return}});
 v.addEventListener('click',async function(e){
  var tab=e.target.closest('[data-jrtab]');if(tab){ST.tab=tab.dataset.jrtab;ST.sel=[];ST.drawer=null;ST.edit=null;snd('page');render();return}
  var op=e.target.closest('[data-jropen]');if(op&&!e.target.closest('button[data-jrletter]')){
   var pp=op.dataset.jropen.split('|');ST.drawer={kind:pp[0],id:pp[1]};ST.edit=null;snd('page');render();return}
  var ed=e.target.closest('[data-jredit]');if(ed){var q=ed.dataset.jredit.split('|');
   ST.drawer={kind:q[0],id:q[1]};ST.edit={kind:q[0],id:q[1]};render();return}
  var de=e.target.closest('[data-jrdel]');if(de){var r=de.dataset.jrdel.split('|');removeItems(r[0],[r[1]]);
   if(ST.drawer&&ST.drawer.id===r[1])ST.drawer=null;render();return}
  var nw=e.target.closest('[data-jrnew]');if(nw){newItem(nw.dataset.jrnew);return}
  var le=e.target.closest('[data-jrletter]');if(le){letterFromProc(le.dataset.jrletter);return}
  var b=e.target.closest('[data-jr]');if(!b)return;
  var k=b.dataset.jr;
  if(k==='unlock'){await tryUnlock($('#jrPw')?$('#jrPw').value:'');return}
  if(k==='eye'){var i=$('#jrPw');if(i)i.type=i.type==='password'?'text':'password';return}
  if(k==='lock'){LOCK.unlocked=false;LS.s('admDevice',false);
   try{if(typeof S!=='undefined'&&S.role==='admin')S.role=null}catch(x){}
   ensureNav();snd('tick');toast('🔒 Mode administrateur verrouillé');render();return}
  if(k==='classic'){if(typeof switchView==='function')switchView('jr');return}
  if(k==='home'){if(typeof switchView==='function')switchView('accueil');return}
  if(k==='sound'){AU.on=!AU.on;LS.s('jraSound',AU.on);var m=$('#jrMute');
   if(m)m.textContent=AU.on?'🔊 Son actif':'🔇 Son coupé';if(AU.on)snd('ok');return}
  if(k==='analyse'){ST.facts=$('#jrFacts')?$('#jrFacts').value:ST.facts;runAnalyse();return}
  if(k==='sample'){ST.facts=SAMPLE;render();snd('tick');return}
  if(k==='clearfacts'){ST.facts='';ST.res=null;render();return}
  if(k==='mkdoss'){dossierFromAnalyse();return}
  if(k==='mkdossfrom'){var p2=ST.procs.find(function(x){return x.id===b.dataset.id});
   if(p2){ST.res={arts:(p2.base||[]).map(function(r){var a=ST.arts.find(function(z){return z.ref===r});
    return a?{it:a,s:5}:null}).filter(Boolean),procs:[{it:p2,s:5}]};dossierFromAnalyse()}return}
  if(k==='saveview'){saveView();return}
  if(k==='delsel'){var kind2=ST.tab==='reperes'?'art':ST.tab==='procedures'?'proc':ST.tab==='courriers'?'tpl':'doss';
   removeItems(kind2,ST.sel.slice());return}
  if(k==='selnone'){ST.sel=[];render();return}
  if(k==='dclose'){ST.drawer=null;ST.edit=null;render();return}
  if(k==='dedit'){ST.edit=Object.assign({},ST.drawer);render();return}
  if(k==='dcancel'){ST.edit=null;render();return}
  if(k==='dsave'){readForm();return}
  if(k==='dup'){var kd=b.dataset.kind,src=findItem(kd,b.dataset.id);
   if(src){var cp=Object.assign({},src,{id:uid(kd),ts:Date.now()});
    if(cp.t)cp.t=cp.t+' (copie)';if(cp.ref&&kd==='doss')cp.ref=cp.ref+'-B';
    collection(kd).unshift(cp);persist();ST.drawer={kind:kd,id:cp.id};snd('seal');toast('📄 Copie créée');render()}return}
  if(k==='addtodoss'){var ref=b.dataset.ref,d0=ST.doss.find(function(x){return x.status!=='clos'});
   if(!d0){toast('Créez d’abord un dossier');return}
   d0.arts=d0.arts||[];if(d0.arts.indexOf(ref)<0)d0.arts.push(ref);persist();
   snd('seal');toast('📁 '+ref+' lié à '+d0.ref);return}
  if(k==='advance'){var dd=ST.doss.find(function(x){return x.id===b.dataset.id});
   if(dd){var i2=STATUS.findIndex(function(s){return s.k===dd.status});
    dd.status=STATUS[(i2+1)%STATUS.length].k;dd.ts=Date.now();persist();
    jlog('DOSSIER',dd.ref+' → '+statusOf(dd.status).l,'ok');snd(dd.status==='clos'?'seal':'tick');render()}return}
  if(k==='letterfrom'){var d2=ST.doss.find(function(x){return x.id===b.dataset.id});
   if(d2){ST.facts=d2.notes||ST.facts;ST.letter.vars={destinataire:d2.adv,vehicule:d2.veh,vin:d2.vin,
    montant:String(d2.amount||0),prix:String(d2.amount||0),date_achat:dfr(d2.opened),faits:d2.notes||''};
    ST.letter.tpl=d2.dom==='conso'?'t-conf':d2.dom==='route'?(d2.t.indexOf('PV')>=0?'t-pv':'t-assurance'):'t-demeure';
    ST.tab='courriers';ST.drawer=null;render();snd('page')}return}
  if(k==='lettercopy'){renderLetter();
   try{await navigator.clipboard.writeText(ST.letter.out);snd('ok');toast('📋 Courrier copié')}catch(x){toast('Copie impossible')}return}
  if(k==='lettertxt'){renderLetter();dl(new Blob([ST.letter.out],{type:'text/plain;charset=utf-8'}),'courrier-'+today()+'.txt');snd('out');return}
  if(k==='letterpdf'){renderLetter();
   var bl=[{h:'COURRIER'}];ST.letter.out.split('\n').forEach(function(l){bl.push({t:l||' ',fs:9.4})});
   dl(pdf('COURRIER',bl),'courrier-'+today()+'.pdf');jlog('EXPORT','Courrier PDF','ok');snd('out');toast('📄 Courrier PDF');return}
  if(k==='letterreset'){ST.letter.vars={};render();snd('tick');return}
  if(k==='pdf'){exportPdf();return}
  if(k==='share'){await sharePdf();return}
  if(k==='json'){exportJson();return}
  if(k==='import'){$('#jrImport').click();return}
  if(k==='reset'){ST.cfg=Object.assign({},DEF);saveCfg();theme();render();snd('tick');toast('↺ Poste réinitialisé');return}
  if(k==='rand'){var pal=[['#d8b45a','#22c55e'],['#c084fc','#38bdf8'],['#ffb020','#a3e635'],['#7dd3fc','#ff4d9d'],['#a3e635','#d8b45a']];
   var p3=pal[Math.floor(Math.random()*pal.length)];ST.cfg.seal=p3[0];ST.cfg.accent=p3[1];
   ST.cfg.glow=25+Math.floor(Math.random()*70);ST.cfg.grain=Math.floor(Math.random()*32);
   ST.cfg.density=88+Math.floor(Math.random()*34);ST.cfg.text=90+Math.floor(Math.random()*30);
   saveCfg();theme();render();snd('seal');toast('🎲 Thème généré');return}});
 document.addEventListener('keydown',function(e){
  if(!LOCK.unlocked)return;
  if(e.key==='Escape'&&ST.drawer){ST.drawer=null;ST.edit=null;render()}
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&ST.tab==='analyse'){e.preventDefault();
   ST.facts=$('#jrFacts')?$('#jrFacts').value:ST.facts;runAnalyse()}})}

/* ═══════════ CSS ═══════════ */
function css(){
 if($('#jrCss'))return;var s=document.createElement('style');s.id='jrCss';
 s.textContent=
 ':root{--jr-seal:#d8b45a;--jr-acc:#22c55e;--jr-glow:.52;--jr-grain:.14;--jr-den:1;--jr-txt:1;--jr-con:1;'+
 '--jr-ink:#050f0b;--jr-ink2:#0a1a13;--jr-surf:#0e2419;--jr-surf2:#13301f;--jr-line:#1f4a33;--jr-line2:#2e6a49;'+
 '--jr-tx:#f2f8f2;--jr-tx2:#c8ddcd;--jr-mut:#8bb098;--jr-dim:#5f8a70;'+
 '--jr-cyan:#38bdf8;--jr-amber:#ffb020;--jr-gar:#ff4d6d;--jr-purple:#c084fc;--jr-acid:#a3e635;--jr-parch:#f4ecd8}'+
 '.jr-hero{position:relative;border-radius:20px;overflow:hidden;margin-bottom:14px;border:1px solid var(--jr-line);'+
  'background:linear-gradient(135deg,#050f0b,#0c2418 38%,#101d2c 70%,#1c1424);box-shadow:0 20px 54px #000b}'+
 '.jr-hero-grid{position:absolute;inset:0;opacity:.3;background-image:linear-gradient(#d8b45a1c 1px,transparent 1px),linear-gradient(90deg,#d8b45a1c 1px,transparent 1px);'+
  'background-size:30px 30px;mask-image:radial-gradient(74% 74% at 24% 22%,#000,transparent)}'+
 '.jr-hero::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:calc(var(--jr-glow)*.34);mix-blend-mode:screen;'+
  'background:radial-gradient(46% 60% at 12% 4%,var(--jr-seal),transparent 62%),radial-gradient(44% 54% at 92% 96%,var(--jr-acc),transparent 60%)}'+
 'body.jr-parch .jr-hero::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:var(--jr-grain);'+
  'background-image:radial-gradient(#f4ecd8 1px,transparent 1px);background-size:3px 3px;mix-blend-mode:overlay}'+
 '.jr-hero-in{position:relative;display:flex;gap:20px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;padding:24px 22px 20px}'+
 '.jr-hero-l{flex:1;min-width:276px}'+
 '.jr-kick{display:inline-block;font:800 10px/1 system-ui;letter-spacing:1.7px;color:#050f0b;'+
  'background:linear-gradient(90deg,var(--jr-seal),var(--jr-acc));padding:6px 12px;border-radius:8px;margin-bottom:10px}'+
 '.jr-hero h1{font-size:27px;margin:0 0 8px;color:#f6fbf6;letter-spacing:-.5px;font-weight:800}'+
 '.jr-hero p{margin:0 0 5px;font-size:13px;color:#a3c6ae;line-height:1.6;max-width:660px}.jr-hero p b{color:#eaf6ec}'+
 '.jr-ethic{font-size:11.5px!important;color:var(--jr-seal)!important;font-weight:700}'+
 '.jr-hero-r{display:flex;gap:9px;flex-wrap:wrap}'+
 '.jr-stat{min-width:82px;padding:10px 12px;border-radius:14px;background:#050f0bcc;border:1px solid var(--jr-line);text-align:center}'+
 '.jr-stat b{display:block;font-size:21px;font-weight:900;color:var(--jr-seal);line-height:1.1}'+
 '.jr-stat.p b{color:var(--jr-cyan)}.jr-stat.d b{color:var(--jr-acc)}.jr-stat.u b{color:var(--jr-amber)}'+
 '.jr-stat.l b{color:var(--jr-gar)}.jr-stat.m b{color:var(--jr-acid);font-size:14px}'+
 '.jr-stat span{font-size:9px;letter-spacing:.9px;text-transform:uppercase;color:var(--jr-dim)}'+
 '.jr-mute{position:absolute;top:14px;right:14px;z-index:3;background:#050f0bcc;border:1px solid var(--jr-line2);'+
  'color:var(--jr-seal);border-radius:20px;padding:7px 13px;font-size:11.5px;font-weight:800;cursor:pointer}'+
 '.jr-mute:hover{border-color:var(--jr-seal);box-shadow:0 0 16px #d8b45a55}'+
 '.jr-strip{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:12px}'+
 '.jr-pill{font:700 10.5px/1 system-ui;padding:6px 10px;border-radius:20px;border:1px solid var(--jr-line);background:var(--jr-ink2);color:var(--jr-tx2);white-space:nowrap}'+
 '.jr-pill.seal{border-color:var(--jr-seal);color:var(--jr-seal);background:#d8b45a14}'+
 '.jr-pill.info{border-color:var(--jr-cyan);color:var(--jr-cyan);background:#38bdf814}'+
 '.jr-pill.warn{border-color:var(--jr-amber);color:var(--jr-amber);background:#ffb02014}'+
 '.jr-link{background:none;border:1px dashed var(--jr-line2);color:var(--jr-mut);border-radius:20px;padding:5px 11px;font-size:11px;cursor:pointer}'+
 '.jr-link:hover{color:var(--jr-seal);border-color:var(--jr-seal)}'+
 '.jr-layout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:14px;align-items:start}'+
 '@media(max-width:1080px){.jr-layout{grid-template-columns:1fr}}'+
 '.jr-main{min-width:0}'+
 '.jr-card{background:#0e2419ee;border:1px solid var(--jr-line);border-radius:16px;padding:16px;margin-bottom:14px;'+
  'box-shadow:0 12px 36px #000a;font-size:calc(14px*var(--jr-txt));filter:contrast(var(--jr-con))}'+
 '.jr-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:13px}'+
 '.jr-tab{border-radius:20px;padding:8px 14px;font-size:12px;font-weight:800;border:1px solid var(--jr-line);'+
  'background:var(--jr-ink2);color:var(--jr-tx2);cursor:pointer}'+
 '.jr-tab:hover{border-color:var(--jr-seal);color:var(--jr-seal)}'+
 '.jr-tab.on{background:linear-gradient(135deg,var(--jr-seal),var(--jr-acc));border-color:var(--jr-seal);color:#050f0b}'+
 '.jr-tools{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-bottom:13px}'+
 '.jr-tools input,.jr-tools select{width:auto;margin:0;padding:8px 11px;font-size:12px;background:var(--jr-ink2);'+
  'border:1px solid var(--jr-line2);color:var(--jr-tx);border-radius:9px}'+
 '.jr-tools input{flex:1;min-width:190px}'+
 '.jr-tools button{padding:8px 12px;font-size:12px;border-radius:9px;border:1px solid var(--jr-line2);'+
  'background:var(--jr-ink2);color:var(--jr-tx2);cursor:pointer;font-weight:700}'+
 '.jr-tools button:hover{border-color:var(--jr-seal);color:var(--jr-seal)}'+
 '.jr-pri{background:linear-gradient(135deg,var(--jr-seal),var(--jr-acc))!important;border-color:var(--jr-seal)!important;color:#050f0b!important;font-weight:800!important}'+
 '.jr-danger{border-color:var(--jr-gar)!important;color:var(--jr-gar)!important;background:#ff4d6d12!important}'+
 '.jr-seal-btn{background:#d8b45a18!important;border-color:var(--jr-seal)!important;color:var(--jr-seal)!important;font-weight:800!important}'+
 '.jr-mini{padding:6px 10px;font-size:11px;border-radius:8px;border:1px solid var(--jr-line2);background:var(--jr-ink2);color:var(--jr-tx2);cursor:pointer}'+
 '.jr-mini:hover{border-color:var(--jr-seal);color:var(--jr-seal)}'+
 '.jr-empty{padding:28px;text-align:center;border:1px dashed var(--jr-line2);border-radius:14px;color:var(--jr-mut);font-size:13px;line-height:1.7}'+
 /* analyse */
 '.jr-analyse{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}'+
 '@media(max-width:860px){.jr-analyse{grid-template-columns:1fr}}'+
 '.jr-an-l label{display:block;font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:var(--jr-dim);margin-bottom:5px}'+
 '.jr-an-l textarea{width:100%;margin:0 0 10px;background:var(--jr-ink2);border:1px solid var(--jr-line2);color:var(--jr-tx);'+
  'border-radius:12px;padding:12px;font-size:13px;line-height:1.65;resize:vertical;font-family:inherit}'+
 '.jr-an-l textarea:focus{outline:none;border-color:var(--jr-seal);box-shadow:0 0 0 3px #d8b45a26}'+
 '.jr-an-a{display:flex;gap:7px;flex-wrap:wrap}'+
 '.jr-an-a button{padding:9px 13px;font-size:12px;border-radius:10px;border:1px solid var(--jr-line2);background:var(--jr-ink2);color:var(--jr-tx2);cursor:pointer;font-weight:700}'+
 '.jr-note{font-size:11px;color:var(--jr-mut);line-height:1.6;margin:11px 0 0}'+
 '.jr-box{border:1px solid var(--jr-line);border-radius:14px;background:var(--jr-ink2);padding:12px;margin-bottom:12px}'+
 '.jr-box>b{display:block;font-size:12px;color:var(--jr-tx);margin-bottom:9px;letter-spacing:.4px}'+
 '.jr-hit{border-left:3px solid var(--jr-seal);border-radius:10px;background:var(--jr-surf);padding:10px;margin-bottom:8px;cursor:pointer;transition:.16s}'+
 '.jr-hit:hover{transform:translateX(3px);box-shadow:0 8px 22px #000a}'+
 '.jr-hit.proc{border-left-color:var(--jr-cyan)}'+
 '.jr-hit-h{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-bottom:5px}'+
 '.jr-hit b{font-size:12.5px;color:var(--jr-tx);display:block}'+
 '.jr-hit p{margin:4px 0 6px;font-size:11.5px;color:var(--jr-tx2);line-height:1.55}'+
 '.jr-score{font:900 10px/1 ui-monospace,monospace;color:#050f0b;background:var(--jr-seal);padding:4px 7px;border-radius:8px}'+
 '.jr-dot{width:9px;height:9px;border-radius:50%;display:inline-block}'+
 '.jr-mut{color:var(--jr-mut);font-size:11.5px}'+
 /* listes */
 '.jr-list{display:grid;grid-template-columns:repeat(var(--cols,3),minmax(0,1fr));gap:calc(11px*var(--jr-den))}'+
 '.jr-list.wide{grid-template-columns:repeat(min(var(--cols,3),2),minmax(0,1fr))}'+
 '@media(max-width:900px){.jr-list,.jr-list.wide{grid-template-columns:1fr}}'+
 '.jr-item{position:relative;border:1px solid var(--jr-line);border-left:3px solid var(--c,var(--jr-seal));border-radius:13px;'+
  'background:linear-gradient(150deg,var(--jr-ink2),var(--jr-surf));padding:calc(12px*var(--jr-den));transition:.16s;cursor:grab}'+
 '.jr-item:hover{border-color:var(--jr-line2);transform:translateY(-2px);box-shadow:0 12px 28px #000a}'+
 '.jr-item.sel{border-color:var(--jr-amber);box-shadow:0 0 0 2px #ffb02044}'+
 '.jr-item.drag{opacity:.4}.jr-item.over{border-color:var(--jr-acid);box-shadow:0 0 0 2px #a3e63555}'+
 '.jr-item.late{box-shadow:inset 0 0 0 1px #ff4d6d55}'+
 '.jr-item.soon{box-shadow:inset 0 0 0 1px #ffb02055}'+
 '.jr-check{position:absolute;top:9px;right:9px;background:#050f0bcc;border:1px solid var(--jr-line2);border-radius:7px;padding:2px 4px;cursor:pointer;z-index:2}'+
 '.jr-check input{width:auto;margin:0;accent-color:var(--jr-amber)}'+
 '.jr-item-h{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:7px;padding-right:34px}'+
 '.jr-ref{font:800 10.5px/1 ui-monospace,monospace;color:var(--jr-seal);background:#d8b45a14;border:1px solid #d8b45a44;padding:4px 8px;border-radius:8px}'+
 '.jr-ref.big{font-size:12.5px;padding:6px 11px}'+
 '.jr-tag{font:700 9.5px/1 system-ui;color:var(--jr-mut);border:1px solid var(--jr-line2);padding:4px 8px;border-radius:10px}'+
 '.jr-grav,.jr-status{font:800 9.5px/1 system-ui;padding:4px 8px;border-radius:10px;border:1px solid}'+
 '.jr-open{margin-left:auto;background:none;border:1px solid var(--jr-line2);color:var(--jr-mut);border-radius:7px;padding:2px 8px;cursor:pointer;font-size:13px}'+
 '.jr-open:hover{color:var(--jr-seal);border-color:var(--jr-seal)}'+
 '.jr-item-t{display:block;font-size:13px;color:var(--jr-tx);margin-bottom:6px;line-height:1.35}'+
 '.jr-item-x{margin:0 0 8px;font-size:11.5px;color:var(--jr-tx2);line-height:1.6}'+
 '.jr-rawline{margin:0 0 8px;font:10px/1.5 ui-monospace,monospace;color:var(--jr-dim);display:none}'+
 'body.jr-raw .jr-rawline{display:block}'+
 '.jr-meta{display:flex;gap:9px;flex-wrap:wrap;font-size:10.5px;color:var(--jr-mut);margin-bottom:8px}'+
 '.jr-due{display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--jr-mut);'+
  'border-top:1px dashed var(--jr-line);padding-top:7px;margin-bottom:8px}'+
 '.jr-due b.late{color:var(--jr-gar)}.jr-due b.soon{color:var(--jr-amber)}.jr-due b.near{color:var(--jr-cyan)}.jr-due b{color:var(--jr-acc)}'+
 '.jr-sealed{font:900 9px/1 system-ui;letter-spacing:1.2px;color:var(--jr-seal);border:1.5px solid var(--jr-seal);'+
  'padding:4px 7px;border-radius:6px;transform:rotate(-6deg);opacity:.9}'+
 '.jr-steps{margin:0 0 9px 17px;font-size:11.5px;color:var(--jr-tx2);line-height:1.7}'+
 '.jr-pieces{margin:0 0 9px 17px;font-size:11.5px;color:var(--jr-mut);line-height:1.6}'+
 '.jr-traps{display:flex;flex-direction:column;gap:5px;margin-bottom:9px}'+
 '.jr-traps b{font-size:10px;letter-spacing:.7px;text-transform:uppercase;color:var(--jr-gar)}'+
 '.jr-traps span{font-size:11px;color:#ffd0d8;background:#ff4d6d10;border-left:2px solid var(--jr-gar);padding:5px 8px;border-radius:6px;line-height:1.5}'+
 '.jr-refs{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px}'+
 '.jr-item-a{display:flex;gap:5px;flex-wrap:wrap}'+
 '.jr-item-a button{padding:6px 9px;font-size:11px;border-radius:8px;border:1px solid var(--jr-line2);background:#050f0b;color:var(--jr-tx2);cursor:pointer}'+
 '.jr-item-a button:hover{border-color:var(--jr-seal);color:var(--jr-seal)}'+
 /* timeline */
 '.jr-tl{border:1px solid var(--jr-line);border-radius:13px;background:var(--jr-ink2);padding:12px;margin-bottom:13px}'+
 '.jr-tl>b{display:block;font-size:11px;letter-spacing:.8px;text-transform:uppercase;color:var(--jr-dim);margin-bottom:16px}'+
 '.jr-tl-track{position:relative;height:52px;background:linear-gradient(90deg,#ff4d6d22,#ffb02022,#38bdf822,#22c55e22);border-radius:9px;border:1px solid var(--jr-line)}'+
 '.jr-tl-pt{position:absolute;top:6px;transform:translateX(-50%);background:none;border:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px}'+
 '.jr-tl-pt i{width:12px;height:12px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c);display:block}'+
 '.jr-tl-pt span{font:800 9px/1 ui-monospace,monospace;color:var(--jr-tx2)}'+
 '.jr-tl-pt:hover i{transform:scale(1.35)}'+
 '.jr-tl-axis{position:absolute;left:0;right:0;bottom:3px;display:flex;justify-content:space-between;padding:0 8px;font-size:9px;color:var(--jr-dim)}'+
 /* courrier */
 '.jr-letter{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:14px}'+
 '@media(max-width:900px){.jr-letter{grid-template-columns:1fr}}'+
 '.jr-l-l label{display:block;font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:var(--jr-dim);margin:10px 0 5px}'+
 '.jr-l-l select{width:100%;margin:0;background:var(--jr-ink2);border:1px solid var(--jr-line2);color:var(--jr-tx);border-radius:9px;padding:9px;font-size:12px}'+
 '.jr-l-tools{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}'+
 '.jr-l-tools button{padding:6px 10px;font-size:11px;border-radius:8px;border:1px solid var(--jr-line2);background:var(--jr-ink2);color:var(--jr-tx2);cursor:pointer}'+
 '.jr-vars{max-height:290px;overflow:auto;border:1px solid var(--jr-line);border-radius:11px;padding:9px;background:var(--jr-ink2)}'+
 '.jr-var{margin-bottom:7px}.jr-var span{display:block;font:700 9.5px/1 ui-monospace,monospace;color:var(--jr-seal);margin-bottom:3px}'+
 '.jr-var input{width:100%;margin:0;padding:6px 9px;font-size:11.5px;background:#050f0b;border:1px solid var(--jr-line2);color:var(--jr-tx);border-radius:7px}'+
 '.jr-var input:focus{outline:none;border-color:var(--jr-seal)}'+
 '.jr-l-a{display:flex;gap:6px;flex-wrap:wrap;margin-top:11px}'+
 '.jr-l-a button{padding:8px 11px;font-size:11.5px;border-radius:9px;border:1px solid var(--jr-line2);background:var(--jr-ink2);color:var(--jr-tx2);cursor:pointer;font-weight:700}'+
 '.jr-paper{background:linear-gradient(170deg,#f7f1e2,#efe6d2);border-radius:12px;padding:26px 28px;min-height:420px;'+
  'box-shadow:0 18px 44px #000b,inset 0 0 60px #d9c9a333;border:1px solid #d9c9a3;position:relative;overflow:hidden}'+
 '.jr-paper::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:var(--jr-grain);'+
  'background-image:radial-gradient(#8a7a52 1px,transparent 1px);background-size:3px 3px}'+
 '.jr-paper pre{margin:0;font:12.5px/1.75 Georgia,"Times New Roman",serif;color:#1a1a14;white-space:pre-wrap;word-break:break-word;position:relative;z-index:1}'+
 /* calculateurs */
 '.jr-calcs{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}'+
 '.jr-calc{border:1px solid var(--jr-line);border-radius:14px;background:var(--jr-ink2);padding:13px}'+
 '.jr-calc>b{display:block;font-size:13px;color:var(--jr-tx);margin-bottom:10px}'+
 '.jr-calc label{display:block;font-size:9.5px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:var(--jr-dim);margin:8px 0 4px}'+
 '.jr-calc input,.jr-calc select{width:100%;margin:0;padding:8px 10px;font-size:12.5px;background:#050f0b;border:1px solid var(--jr-line2);color:var(--jr-tx);border-radius:8px}'+
 '.jr-res{margin-top:12px;border:1px solid var(--jr-seal);border-radius:11px;background:#d8b45a10;padding:11px;text-align:center}'+
 '.jr-res span{display:block;font-size:10.5px;color:var(--jr-mut)}'+
 '.jr-res b{display:block;font:900 20px/1.2 ui-monospace,monospace;color:var(--jr-seal);margin:4px 0}'+
 '.jr-res i{display:block;font-style:normal;font-size:10px;color:var(--jr-dim);margin-top:4px}'+
 '.jr-res.critique{border-color:var(--jr-gar);background:#ff4d6d12}.jr-res.critique b{color:var(--jr-gar)}'+
 '.jr-res.expiré{border-color:var(--jr-gar);background:#ff4d6d18}.jr-res.expiré b{color:var(--jr-gar)}'+
 '.jr-res.attention{border-color:var(--jr-amber);background:#ffb02012}.jr-res.attention b{color:var(--jr-amber)}'+
 '.jr-res.ouvert{border-color:var(--jr-acc);background:#22c55e12}.jr-res.ouvert b{color:var(--jr-acc)}'+
 /* journal */
 '.jr-log{max-height:440px;overflow:auto;border:1px solid var(--jr-line);border-radius:12px;background:#050f0b;padding:11px}'+
 '.jr-log-l{display:flex;gap:9px;font:11px/1.7 ui-monospace,monospace;padding:3px 0;border-bottom:1px solid #0e2419}'+
 '.jr-log-l i{font-style:normal;color:var(--jr-dim);flex:none}'+
 '.jr-log-l b{color:var(--jr-seal);flex:none;min-width:96px}'+
 '.jr-log-l.ok span{color:var(--jr-acc)}.jr-log-l.warn span{color:var(--jr-amber)}.jr-log-l.err span{color:var(--jr-gar)}.jr-log-l.info span{color:var(--jr-tx2)}'+
 /* dock */
 '.jr-dock{position:sticky;top:76px;max-height:calc(100vh - 96px);display:flex;flex-direction:column;'+
  'border:1px solid var(--jr-line);border-radius:18px;overflow:hidden;background:linear-gradient(168deg,#07160fF2,#141026F2 76%);'+
  'box-shadow:0 18px 48px #000b,0 0 0 1px #d8b45a1e;backdrop-filter:blur(12px)}'+
 '@media(max-width:1080px){.jr-dock{position:static;max-height:none}}'+
 '.jr-dock-h{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--jr-line);'+
  'background:linear-gradient(90deg,#d8b45a1c,transparent)}'+
 '.jr-dock-h b{flex:1;font-size:12.5px;color:#f4ecd8}'+
 '.jr-dock-b{flex:1;overflow:auto;padding:13px 14px 16px}'+
 '.jr-dock-b::-webkit-scrollbar,.jr-vars::-webkit-scrollbar,.jr-log::-webkit-scrollbar,.jr-drawer-in::-webkit-scrollbar{width:10px}'+
 '.jr-dock-b::-webkit-scrollbar-track,.jr-vars::-webkit-scrollbar-track,.jr-log::-webkit-scrollbar-track,.jr-drawer-in::-webkit-scrollbar-track{background:#050f0b;border-radius:8px}'+
 '.jr-dock-b::-webkit-scrollbar-thumb,.jr-vars::-webkit-scrollbar-thumb,.jr-log::-webkit-scrollbar-thumb,.jr-drawer-in::-webkit-scrollbar-thumb{'+
  'background:linear-gradient(var(--jr-seal),var(--jr-acc));border-radius:8px;border:2px solid #050f0b}'+
 '.jr-dock-b::-webkit-scrollbar-thumb:hover,.jr-vars::-webkit-scrollbar-thumb:hover{background:var(--jr-seal)}'+
 '.jr-dock-b,.jr-vars,.jr-log,.jr-drawer-in{scrollbar-width:thin;scrollbar-color:var(--jr-seal) #050f0b}'+
 '.jr-c{margin-bottom:11px}'+
 '.jr-c label{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:4px;'+
  'font-size:9.5px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:var(--jr-dim)}'+
 '.jr-c label b{color:var(--jr-seal);font-family:ui-monospace,monospace;font-size:10.5px}'+
 '.jr-c select{width:100%;background:#050f0b;border:1px solid var(--jr-line2);color:var(--jr-tx);border-radius:9px;padding:8px 10px;font-size:12px;margin:0}'+
 '.jr-c input[type=color]{width:100%;height:32px;border:1px solid var(--jr-line2);border-radius:9px;background:#050f0b;padding:2px;cursor:pointer;margin:0}'+
 '.jr-c input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:2px 0 0;padding:0;border:0;'+
  'background:linear-gradient(90deg,var(--jr-seal),var(--jr-acc),var(--jr-cyan))}'+
 '.jr-c input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;background:#f4ecd8;'+
  'border:3px solid var(--jr-seal);box-shadow:0 0 10px var(--jr-seal);cursor:grab}'+
 '.jr-c input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#f4ecd8;border:3px solid var(--jr-seal);cursor:grab}'+
 '.jr-tgs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:11px}'+
 '.jr-tg{display:flex;align-items:center;gap:6px;font-size:10.5px;color:var(--jr-dim);background:#050f0b;'+
  'border:1px solid var(--jr-line2);border-radius:18px;padding:5px 10px;cursor:pointer;user-select:none}'+
 '.jr-tg input{width:auto;margin:0;accent-color:var(--jr-seal)}'+
 '.jr-tg.on{color:var(--jr-seal);border-color:var(--jr-seal);background:#d8b45a14}'+
 '.jr-sep{height:1px;background:linear-gradient(90deg,#d8b45a66,#22c55e66,transparent);margin:12px 0}'+
 '.jr-btns{display:grid;grid-template-columns:1fr 1fr;gap:7px}'+
 '.jr-btns button{border-radius:10px;padding:10px;font-size:11.5px;font-weight:800;cursor:pointer;border:1px solid var(--jr-line2);background:#050f0b;color:var(--jr-tx)}'+
 '.jr-btns button:hover{border-color:var(--jr-seal);transform:translateY(-1px)}'+
 '.jr-btns .p{grid-column:1/-1;background:linear-gradient(135deg,var(--jr-seal),var(--jr-acc));border-color:var(--jr-seal);color:#050f0b}'+
 '.jr-btns .b{background:linear-gradient(135deg,#1f6f54,#3fa382);border-color:#1f6f54;color:#fff}'+
 /* drawer */
 '.jr-drawer{position:fixed;inset:0;z-index:215;background:#050f0bcc;backdrop-filter:blur(6px);display:flex;justify-content:flex-end}'+
 '.jr-drawer-in{width:min(560px,96vw);height:100%;overflow:auto;background:linear-gradient(168deg,#0a1a13,#0e2419);'+
  'border-left:1px solid var(--jr-line2);padding:18px;box-shadow:-20px 0 60px #000b;animation:jrSlide .26s ease-out}'+
 '@keyframes jrSlide{from{transform:translateX(28px);opacity:0}to{transform:none;opacity:1}}'+
 '.jr-drawer-h{display:flex;align-items:center;gap:10px;margin-bottom:14px}'+
 '.jr-drawer-h b{flex:1;font-size:15px;color:var(--jr-tx)}'+
 '.jr-drawer-h button{background:#050f0b;border:1px solid var(--jr-line2);color:var(--jr-tx2);border-radius:9px;padding:6px 11px;cursor:pointer}'+
 '.jr-d-sec h3{font-size:16px;color:var(--jr-tx);margin:9px 0}'+
 '.jr-d-sec>b{display:block;font-size:10.5px;letter-spacing:.8px;text-transform:uppercase;color:var(--jr-seal);margin:12px 0 6px}'+
 '.jr-d-txt{font-size:13px;color:var(--jr-tx2);line-height:1.7;margin:8px 0}'+
 '.jr-d-pre{background:#050f0b;border:1px solid var(--jr-line);border-radius:10px;padding:12px;font:11.5px/1.6 ui-monospace,monospace;color:var(--jr-tx2);white-space:pre-wrap;max-height:420px;overflow:auto}'+
 '.jr-tbl{width:100%;border-collapse:collapse;font-size:12.5px;margin:8px 0}'+
 '.jr-tbl td{border-bottom:1px solid var(--jr-line);padding:7px 6px;color:var(--jr-tx2)}'+
 '.jr-tbl td:first-child{color:var(--jr-dim);width:36%}'+
 '.jr-tbl .mono,.mono{font-family:ui-monospace,monospace}'+
 '.jr-form label{display:block;font-size:9.5px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:var(--jr-dim);margin:10px 0 4px}'+
 '.jr-form input,.jr-form select,.jr-form textarea{width:100%;margin:0;padding:9px 11px;font-size:12.5px;'+
  'background:#050f0b;border:1px solid var(--jr-line2);color:var(--jr-tx);border-radius:9px;font-family:inherit}'+
 '.jr-form textarea{resize:vertical;line-height:1.6}'+
 '.jr-form textarea.mono{font-family:ui-monospace,monospace;font-size:11.5px}'+
 '.jr-form input:focus,.jr-form select:focus,.jr-form textarea:focus{outline:none;border-color:var(--jr-seal);box-shadow:0 0 0 3px #d8b45a22}'+
 '.jr-drawer-a{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:16px;padding-top:14px;border-top:1px solid var(--jr-line)}'+
 '.jr-drawer-a button{padding:11px;font-size:12px;font-weight:800;border-radius:10px;border:1px solid var(--jr-line2);background:#050f0b;color:var(--jr-tx);cursor:pointer}'+
 '.jr-drawer-a .jr-pri{grid-column:1/-1}'+
 /* lock */
 '.jr-lock{display:grid;place-items:center;min-height:60vh;padding:20px 0}'+
 '.jr-lock-in{max-width:520px;width:100%;border:1px solid var(--jr-line);border-radius:20px;padding:32px 26px;'+
  'background:linear-gradient(160deg,#0a1a13,#0e2419 60%,#141026);box-shadow:0 20px 54px #000b;text-align:center;position:relative;overflow:hidden}'+
 '.jr-lock-in::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.28;mix-blend-mode:screen;'+
  'background:radial-gradient(50% 50% at 20% 0%,var(--jr-seal),transparent 62%),radial-gradient(50% 50% at 90% 100%,var(--jr-acc),transparent 60%)}'+
 '.jr-lock-seal{font-size:44px;display:block;margin-bottom:10px;position:relative;z-index:1;'+
  'filter:drop-shadow(0 0 18px #d8b45a88)}'+
 '.jr-lock-in h1{font-size:21px;margin:10px 0;color:var(--jr-tx);position:relative;z-index:1}'+
 '.jr-lock-in p{font-size:12.5px;color:var(--jr-mut);line-height:1.7;margin:0 0 14px;position:relative;z-index:1}'+
 '.jr-lock-in label{display:block;text-align:left;font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:var(--jr-dim);margin-bottom:5px;position:relative;z-index:1}'+
 '.jr-pwrow{display:flex;gap:7px;position:relative;z-index:1}'+
 '.jr-pwrow input{flex:1;margin:0;padding:11px 13px;font-size:15px;font-family:ui-monospace,monospace;'+
  'background:#050f0b;border:1px solid var(--jr-line2);color:var(--jr-tx);border-radius:10px}'+
 '.jr-pwrow input:focus{outline:none;border-color:var(--jr-seal);box-shadow:0 0 0 3px #d8b45a26}'+
 '.jr-eye{flex:none;background:#050f0b;border:1px solid var(--jr-line2);color:var(--jr-seal);border-radius:10px;padding:0 13px;cursor:pointer}'+
 '.jr-err{color:var(--jr-gar)!important;font-size:12px!important;margin:9px 0 0!important;font-weight:700}'+
 '.jr-lock-a{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin-top:15px;position:relative;z-index:1}'+
 '.jr-lock-a button{padding:11px 15px;font-size:12.5px;font-weight:800;border-radius:10px;border:1px solid var(--jr-line2);background:#050f0b;color:var(--jr-tx);cursor:pointer}'+
 '.jr-lock-note{margin-top:15px!important;font-size:11px!important;color:var(--jr-dim)!important}'+
 '@media(max-width:640px){.jr-hero h1{font-size:22px}.jr-hero-in{padding:20px 16px}.jr-paper{padding:18px}}';
 document.head.appendChild(s)}

/* ═══════════ nav / boot ═══════════ */
function ensureNav(){
 try{
  if(typeof NAV==='undefined'||!Array.isArray(NAV))return;
  var has=NAV.some(function(n){return n[0]==='jradmin'});
  if(LOCK.unlocked&&!has){var i=NAV.findIndex(function(n){return n[0]==='jr'});
   NAV.splice(i<0?NAV.length:i,0,['jradmin','⚖️ JusteRepère Admin'])}
  if(!LOCK.unlocked&&has){for(var k=NAV.length-1;k>=0;k--)if(NAV[k][0]==='jradmin')NAV.splice(k,1)}
  var btn=$('#jrTopBtn');
  if(LOCK.unlocked&&!btn){var h=document.querySelector('.hbtns');
   if(h){btn=document.createElement('button');btn.id='jrTopBtn';btn.type='button';btn.title='JusteRepère — mode admin';
    btn.textContent='⚖️';btn.style.borderColor='#d8b45a';btn.style.color='#d8b45a';btn.style.background='#0e2419';
    btn.addEventListener('click',function(e){e.preventDefault();if(typeof switchView==='function')switchView('jradmin')});
    h.insertBefore(btn,h.firstChild)}}
  if(!LOCK.unlocked&&btn)btn.remove();
 }catch(e){}}
function hook(){
 try{
  if(typeof window.switchView==='function'&&!window.switchView.__jrA){
   var _s=window.switchView;
   var w=function(v){
    if(v!=='jradmin')return _s(v);
    if(typeof S!=='undefined')S.view='jradmin';
    LOCK.unlocked=LOCK.unlocked||isAdmin();
    ensureNav();
    var n=$('#nav');if(n&&typeof NAV!=='undefined')n.innerHTML=NAV.map(function(x){
     return '<button data-act="nav" data-k="'+x[0]+'" class="'+(x[0]==='jradmin'?'act':'')+'">'+x[1]+'</button>'}).join('');
    render()};
   w.__jrA=true;window.switchView=w}
 }catch(e){}}
function boot(){
 css();load();hook();LOCK.unlocked=isAdmin();ensureNav();theme();
 setInterval(function(){LOCK.unlocked=LOCK.unlocked||isAdmin();ensureNav()},1600);
 if(!ST.log.length)jlog('SESSION','JusteRepère mode administrateur initialisé · '+ST.arts.length+' repères chargés','info')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFJrAdmin={render:render,analyse:runAnalyse,pdf:exportPdf,json:exportJson,state:ST,
 unlock:tryUnlock,save:saveItem,remove:removeItems};
})();
