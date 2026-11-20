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
 base:['C. civ. 1137','C. civ. 1104','C. conso L121-1','C. pén. 441-
