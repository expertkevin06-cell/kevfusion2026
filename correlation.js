/* KEV FUSION 2026 — correlation.js v9.0.0
   Corrélation POSITIVE indexée par code moteur (5 niveaux cumulés) + taxonomie de 26 systèmes.
   Garantie : jamais 0 panne pour un véhicule valide. TSB/rappels matchés par famille moteur. */
(function(){
'use strict';
if(typeof KBall!=='function'){console.warn('correlation.js: base indisponible');return}
const C=window.KFCatalog;
const A=window.KFnorm||{arr:function(v){return Array.isArray(v)?v:(v==null||v===''?[]:[String(v)])},
 dtc:function(v){return Array.isArray(v)?v:(String(v||'').toUpperCase().match(/[PCBU][0-9]{4}/g)||[])},
 txt:function(v){return Array.isArray(v)?v:(v==null||v===''?[]:String(v).split(/\s*[;·\n]\s*/).filter(Boolean))},
 yrs:function(v){if(Array.isArray(v)&&v.length>=2)return[+v[0],+v[1]];if(typeof v==='number')return[v,v];return null},
 num:function(v){const n=parseInt(String(v==null?'':v).replace(/[^\d]/g,''),10);return isFinite(n)&&n>0?n:null}};
const WIN=[1995,2027];
function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
/* ---------- taxonomie des filtres natifs ---------- */
const SYS=[
 {k:'fap',l:'FAP / Particules',i:'🌫️',re:/fap|dpf|particul|colmat|regener|cendre|suie|eolys|contre.pression/},
 {k:'adblue',l:'AdBlue / SCR',i:'💧',re:/adblue|scr|uree|nox|cristallis|\bdef\b|antipollution|demarrage interdit/},
 {k:'egr',l:'EGR',i:'♻️',re:/\begr\b|couvaison|glycol|vanne egr|refroidisseur egr/},
 {k:'turbo',l:'Turbo',i:'🌀',re:/turbo|suraliment|wastegate|geometrie variable|actuateur|boost|p0299|p0234/},
 {k:'courroie',l:'Courroie',i:'〰️',re:/courroie|\bbelt\b|humide|delamin|galet/},
 {k:'chaine',l:'Chaîne distribution',i:'⛓️',re:/chaine|\bchain\b|tendeur|patin|guide.chaine|7\s?mm|8\s?mm|saut de dent/},
 {k:'crepine',l:'Crépine / pression huile',i:'🛢️',re:/crepine|pression.{0,12}huile|pompe a huile|coussinet|limaille|p052|consommation.{0,10}huile|dilution/},
 {k:'bougies',l:'Allumage / bougies',i:'⚡',re:/bougie|bobine|allumage|\brate\b|ratés|misfire|p030|cliquetis|lspi/},
 {k:'vvt',l:'Déphaseurs / VVT',i:'🔄',re:/dephaseur|\bvvt\b|electrovanne|arbre a cames|p0011|p0014|p0016|p0017|calage variable/},
 {k:'injecteurs',l:'Injecteurs / injection',i:'💉',re:/injecteur|coking|debit|rail|p020|p0087|pompe hp|haute pression|pulverisation|calamine|pompe carburant/},
 {k:'ht',l:'Batterie HT',i:'🔋',re:/pack ht|haute tension|cellule|module|emballement|runaway|li.ion|\bnmc\b|\bnca\b|isolement|batterie hybride/},
 {k:'soh',l:'Autonomie / SOH',i:'📉',re:/\bsoh\b|autonomie|degradation|capacite|desequilibre|vieillissement/},
 {k:'charge',l:'Charge / OBC / DC-DC',i:'🔌',re:/charge|\bobc\b|chargeur|connecteur|\bccs\b|type 2|dc.dc|dcdc|inverter/},
 {k:'b12',l:'Batterie 12V / alternateur',i:'🪫',re:/12v|12 v|batterie 12|alternateur|demarreur|parasite|p0562|p0620/},
 {k:'boite',l:'Boîte de vitesses',i:'⚙️',re:/boite|\bdsg\b|dq200|dq250|dq381|mecatronic|me catronic|\beat[68]\b|\bcvt\b|\bzf\b|\batf\b|convertisseur|p0700|p0730|p0841/},
 {k:'embrayage',l:'Embrayage / bimasse',i:'🔗',re:/embrayage|bimasse|volant moteur|butée|patinage/},
 {k:'adas',l:'ADAS / capteurs',i:'🛰️',re:/adas|camera|radar|calibration|capteur|\bacc\b|lane|u04|u02|c1a00/},
 {k:'freinage',l:'Freinage / ABS / ESP',i:'🛑',re:/frein|\babs\b|\besp\b|etrier|plaquette|disque|capteur roue|\bc00/},
 {k:'suspension',l:'Suspension / direction',i:'🛞',re:/amortisseur|suspension|rotule|roulement|silentbloc|direction|geometrie|ressort/},
 {k:'refroid',l:'Refroidissement / surchauffe',i:'🌡️',re:/refroid|thermostat|pompe a eau|\bldr\b|surchauffe|joint de culasse|p0217|p0128|liquide de refroidissement/},
 {k:'faisceau',l:'Faisceau / réseau CAN',i:'🔌',re:/faisceau|connecteur|oxyde|court.circuit|\bcan\b|\bbsi\b|\bbcm\b|u0100|u0101|b1000|u0121/},
 {k:'multi',l:'Multimédia / écran',i:'📱',re:/multimedia|ecran|tactile|emmc|reboot|navigation|u0155|u0184/},
 {k:'clim',l:'Climatisation',i:'❄️',re:/clim|compresseur|refrigerant|condenseur|r134|r1234/},
 {k:'airbag',l:'Airbag / sécurité',i:'🎈',re:/airbag|takata|pretensionneur|ceinture|\bb000|\bb001/},
 {k:'carrosserie',l:'Carrosserie / infiltration',i:'🚪',re:/carrosserie|corrosion|infiltration|etancheite|drain|humidite/},
 {k:'rappel',l:'Campagnes / TSB',i:'📣',re:/campagne|rappel|\btsb\b|recall|vin/}
];
const SYSMAP={};SYS.forEach(function(s){SYSMAP[s.k]=s});
function sysOf(f){
 const t=norm((f.t||'')+' '+(f.mec||'')+' '+(f.s||'')+' '+(f.chain||'')+' '+A.txt(f.sym).join(' ')+' '+A.txt(f.cons).join(' ')+' '+(f.tsb||'')+' '+(f.rec||'')+' '+A.dtc(f.dtc).join(' '));
 const out=[];
 const declared=A.arr(f.sys);
 declared.forEach(function(k){if(SYSMAP[k]&&out.indexOf(k)<0)out.push(k)});
 SYS.forEach(function(s){if(s.re.test(t)&&out.indexOf(s.k)<0)out.push(s.k)});
 return out}
/* ---------- énergie ---------- */
function fuelGroup(f){const n=norm(f);
 if(/electri|\bev\b|kwh|e-208|e-2008|leaf|tesla|id\.[3457]|ioniq|e-tron|ze\b|e-tech electric/.test(n))return'electrique';
 if(/hybride|hybrid|phev|e-tech|e:hev|plug.in|e-tense|4xe|boosterjet hybrid|dualjet hybrid|ecoboost hybrid|e-boxer|th[sb]\b/.test(n))return'hybride';
 if(/diesel|hdi|tdi|dci|cdti|crdi|bluehdi|ecoblue|multijet|jtd|jtdm|d-4d|skyactiv-d|cdi|ddis|di-d|duratorq|\bdv[456]\b|\bdw10\b|om6|k9k|m9[rt]|r9[mn]|ea189|ea288|n47|b47|n57|b57|ingenium|crdi/.test(n))return'diesel';
 if(/essence|puretech|thp|tsi|tfsi|tce|ecoboost|vtec|gdi|mpi|t-gdi|skyactiv-g|boxer|vvt-i|twinair|fire|firefly|vti|sce|mivec|t-jet|boosterjet|eb2|ep6|ea888|ea211|n20|n13|b48|theta|kappa|gamma|l15|k2[04]/.test(n))return'essence';
 return''}
function powersOf(t){const out=[];const n=norm(t);let m;const re=/\b(\d{2,3})\s?(?:ch|cv|hp)\b/g;
 while((m=re.exec(n)))out.push(+m[1]);return Array.from(new Set(out))}
/* ---------- signature ---------- */
function signature(v){
 v=v||{};
 const mk=C?(C.resolveMake(v.brand)||v.brand):v.brand;
 const md=C?(C.resolveModel(mk,v.model)||v.model):v.model;
 const label=norm(v.engine||v.motor||'');
 let fuel=fuelGroup(v.fuel||v.energie||'')||fuelGroup(label);
 const dm=label.match(/(\d\.\d)/);const disp=dm?dm[1]:'';
 const ch=A.num(v.ch)||(label.match(/(\d{2,3})\s*(?:ch|cv|hp)?\s*$/)?+label.match(/(\d{2,3})\s*(?:ch|cv|hp)?\s*$/)[1]:null);
 const codes=new Set();
 if(v.code)codes.add(String(v.code).toUpperCase());
 if(typeof engineCodes==='function')engineCodes(label,mk).forEach(function(c){codes.add(String(c).toUpperCase())});
 if(C&&mk&&md){C.engines(mk,md).forEach(function(e){
  const en=norm(e.l);if(en===label||en.indexOf(label)>=0||label.indexOf(en)>=0)codes.add(String(e.code).toUpperCase())})}
 /* familles déduites du libellé seul (secours) */
 if(!codes.size&&disp){
  if(/hdi|bluehdi/.test(label)){if(disp==='1.5')codes.add('DV5');if(disp==='1.6')codes.add('DV6');if(disp==='2.0')codes.add('DW10')}
  if(/puretech/.test(label))codes.add('EB2');
  if(/thp/.test(label))codes.add('EP6');
  if(/dci/.test(label)){if(disp==='1.5')codes.add('K9K');if(disp==='1.6')codes.add('R9M');if(disp==='2.0')codes.add('M9R')}
  if(/tce/.test(label)){if(disp==='1.2')codes.add('H5Ft');if(disp==='1.3')codes.add('H5Ht')}
  if(/tdi/.test(label))codes.add(disp==='1.6'?'EA189':'EA288');
  if(/tsi|tfsi/.test(label))codes.add(disp==='2.0'||disp==='1.8'?'EA888':'EA211')}
 const y=A.yrs(v.y);
 return{brand:mk||'',model:md||'',engine:v.engine||v.motor||'',ch:ch,kw:ch?Math.round(ch*0.7355):null,
  disp:disp,fuelGroup:fuel,codes:Array.from(codes),years:y||[2015,2027],
  codeLabel:Array.from(codes).join(', ')||'non résolu',
  pairValid:C?C.isPairValid(mk,md):true}}
/* ---------- helpers ---------- */
function codeMatch(a,b){const x=String(a||'').toUpperCase(),y=String(b||'').toUpperCase();
 if(!x||!y)return false;return x===y||x.indexOf(y)===0||y.indexOf(x)===0}
function yrOK(fy,vy){const f=A.yrs(fy);if(!f)return true;
 const a=vy&&vy[0]?vy[0]:WIN[0],b=vy&&vy[1]?vy[1]:WIN[1];return f[0]<=b&&f[1]>=a}
function pwOK(fpw,ch){const L=A.arr(fpw).map(Number).filter(Boolean);if(!L.length||!ch)return true;
 return L.some(function(x){return Math.abs(x-+ch)<=8})}
function modelMatch(fm,model){const L=A.arr(fm);if(!model)return false;
 if(!L.length||L.indexOf('*')>=0)return false;const n=norm(model);
 return L.some(function(m){const x=norm(m);return x===n||n.indexOf(x)>=0||x.indexOf(n)>=0})}
function modelAllow(fm,model){const L=A.arr(fm);if(!model||!L.length||L.indexOf('*')>=0)return true;
 return modelMatch(fm,model)}
function brandMatch(fb,brand){const L=A.arr(fb);if(!L.length||L.indexOf('*')>=0)return true;
 const mk=C?(C.resolveMake(brand)||brand):brand;
 return L.some(function(b){return b===brand||(C&&(C.resolveMake(b)||b)===mk)})}
function fuelOK(ff,g){if(!ff||!g)return true;if(ff===g)return true;
 if(g==='hybride'&&(ff==='diesel'||ff==='essence'))return true;
 if(ff==='hybride'&&(g==='diesel'||g==='essence'))return true;return false}
/* ---------- normalisation ---------- */
function normFault(f,src){
 const o={id:f.id||('x'+Math.random().toString(36).slice(2,8)),t:f.t||f.titre||f.title||'Sans titre',
  eng:A.arr(f.eng),b:A.arr(f.b||f.marques||f.marque),m:A.arr(f.m||f.modeles),
  y:A.yrs(f.y)||WIN,pw:A.arr(f.pw||f.ch).map(Number).filter(Boolean),
  fuel:f.fuel||fuelGroup((f.t||'')+' '+(f.mec||'')+' '+(f.s||'')),
  s:f.s||f.systeme||'Général',g:f.g||f.gravite||'Élevé',
  fire:!!(f.fire||f.f||f.incendie),dtc:A.dtc(f.dtc),sym:A.txt(f.sym||f.symptomes),
  mec:f.mec||f.mecanisme||'',chain:f.chain||(typeof f.ch==='string'?f.ch:'')||f.chaine||'',
  cons:A.txt(f.cons||f.consequences),prv:A.txt(f.prv||f.preuves),tst:A.txt(f.tst||f.tests),
  act:A.txt(f.act||f.actions),sec:f.sec||f.securite||'—',law:A.arr(f.law||f.juridique),
  tsb:f.tsb||null,rec:f.rec||null,generic:!!f.generic||A.arr(f.b).indexOf('*')>=0,src:src||'Base ingénieur'};
 o.sys=sysOf(o);
 if(!o.law.length)o.law=['CC1641'];
 return o}
/* ---------- moteur de corrélation ---------- */
function correlate(v,opts){
 opts=opts||{};const strict=opts.strict!==false;const sysFilter=opts.sys||'';
 const read=A.dtc(opts.readDtc).map(function(x){return x.toUpperCase()});
 const sig=signature(v);
 const trace={total:0,t1:0,t2:0,t3:0,t4:0,t5:0,kept:0,sys:sysFilter,fallback:false,codes:sig.codes};
 const empty={sig:sig,faults:[],dtc:[],recalls:[],tsb:[],modelDtc:[],trace:trace,systems:SYS};
 if(!v||!v.brand)return empty;
 if(C&&v.model&&!C.isPairValid(v.brand,v.model))return empty;
 /* pool */
 const pool=[];const seen={};
 function add(f,src){if(!f)return;const n=normFault(f,src);const k=norm(n.t);if(seen[k])return;seen[k]=1;pool.push(n)}
 try{(typeof FAULTS!=='undefined'?FAULTS:[]).forEach(function(f){add(f,'Base ingénieur')})}catch(e){}
 try{KBall().forEach(function(k){add(k,'Base fusionnée')})}catch(e){}
 trace.total=pool.length;
 /* ---- 5 niveaux cumulés ---- */
 const kept=[];
 pool.forEach(function(f){
  if(!brandMatch(f.b,sig.brand))return;
  if(!modelAllow(f.m,sig.model))return;
  if(!fuelOK(f.fuel,sig.fuelGroup))return;
  const blob=norm(f.t+' '+f.mec+' '+f.s+' '+f.chain+' '+f.sym.join(' '));
  const engLabelHit=!!sig.engine&&(blob.indexOf(norm(sig.engine))>=0);
  const dispHit=!!sig.disp&&blob.indexOf(sig.disp)>=0;
  const famHit=f.eng.length&&sig.codes.length&&f.eng.some(function(c){return sig.codes.some(function(s){return codeMatch(s,c)})});
  const modHit=modelMatch(f.m,sig.model);
  const dtcHit=f.dtc.filter(function(d){return read.indexOf(d)>=0});
  const pwHit=sig.ch&&f.pw.length&&pwOK(f.pw,sig.ch);
  const yrHit=yrOK(f.y,sig.years);
  const brandExplicit=A.arr(f.b).indexOf('*')<0;
  const fuelExact=f.fuel&&f.fuel===sig.fuelGroup;
  let tier=0;
  if(famHit)tier=1;
  else if(engLabelHit||(dispHit&&fuelExact&&brandExplicit))tier=2;
  else if(modHit&&brandExplicit)tier=3;
  else if(brandExplicit&&fuelExact&&(!f.eng.length||sig.fuelGroup==='hybride'))tier=4;
  else if(f.generic&&(!f.fuel||fuelOK(f.fuel,sig.fuelGroup)))tier=5;
  else if(dtcHit.length)tier=2;
  if(!tier)return;
  if(strict&&!yrHit&&tier>3)return;
  if(strict&&!pwOK(f.pw,sig.ch)&&tier>2)return;
  let sc=[0,20,14,11,8,4][tier];const why=[];
  why.push(['','code moteur '+f.eng.filter(function(c){return sig.codes.some(function(s){return codeMatch(s,c)})}).join('/'),
   'motorisation / cylindrée','modèle cité','marque + énergie','système générique compatible'][tier]);
  if(modHit&&tier!==3){sc+=4;why.push('modèle')}
  if(brandExplicit){sc+=2;why.push('marque')}
  if(fuelExact){sc+=2;why.push('énergie '+f.fuel)}
  if(pwHit){sc+=3;why.push('puissance '+sig.ch+' ch')}
  if(dtcHit.length){sc+=4;why.push('DTC lus '+dtcHit.join(','))}
  if(!yrHit){sc-=2;why.push('hors plage années')}
  if(f.fire)sc+=1;
  trace['t'+tier]++;
  const relevance=tier===1?'DIRECT code moteur':tier===2?'DIRECT motorisation':tier===3?'FORT modèle':tier===4?'COMPATIBLE marque+énergie':'SYSTÈME générique';
  const legal=f.law.map(function(id){try{const l=txtById(id);return l&&l.t?l:null}catch(e){return null}}).filter(Boolean);
  kept.push(Object.assign({},f,{sc:sc,why:why,relevance:relevance,tier:tier,readHits:dtcHit,legal:legal,
   ch:f.chain,linkTsb:[],linkRec:[]}))});
 /* ---- filtre système natif : recherche dans TOUT le pool puis restriction véhicule ---- */
 if(sysFilter&&SYSMAP[sysFilter]){
  const re=SYSMAP[sysFilter].re;
  const inSel=kept.filter(function(f){return f.sys.indexOf(sysFilter)>=0});
  if(inSel.length<3){
   pool.forEach(function(f){
    if(!re.test(norm(f.t+' '+f.mec+' '+f.s+' '+f.chain+' '+f.sym.join(' '))))return;
    if(kept.some(function(k){return k.id===f.id}))return;
    if(!brandMatch(f.b,sig.brand))return;
    if(!modelAllow(f.m,sig.model))return;
    if(!fuelOK(f.fuel,sig.fuelGroup))return;
    const legal=f.law.map(function(id){try{return txtById(id)}catch(e){return null}}).filter(Boolean);
    kept.push(Object.assign({},f,{sc:6,why:['filtre '+SYSMAP[sysFilter].l,'élargi véhicule'],
     relevance:'FILTRE '+SYSMAP[sysFilter].l,tier:4,readHits:[],legal:legal,ch:f.chain,linkTsb:[],linkRec:[]}))})}
 }
 /* ---- TSB / rappels : famille moteur + modèle + années ---- */
 let recalls=[],tsb=[];
 const nativeTsb=[],nativeRec=[];
 kept.forEach(function(f){
  if(f.tsb)nativeTsb.push({ref:f.tsb,sys:f.s,s:f.tsb,g:f.g,y:f.y,dtc:f.dtc,e:f.eng,b:f.b,m:f.m,src:'Base ingénieur'});
  if(f.rec)nativeRec.push({t:f.rec,src:'Campagne constructeur',risk:f.t,y:f.y,dtc:f.dtc,law:f.law,fire:f.fire,b:f.b,m:f.m})});
 try{tsb=(typeof TSBDB!=='undefined'&&Array.isArray(TSBDB)?TSBDB:[]).filter(function(t){
  if(!t||!brandMatch(t.b,sig.brand))return false;
  if(!modelAllow(t.m,sig.model))return false;
  if(!yrOK(t.y,sig.years))return false;
  if(sig.codes.length&&A.arr(t.e).length){
   const hit=A.arr(t.e).some(function(e){
    if(typeof engineCodes==='function'&&engineCodes(e,sig.brand).some(function(c){return sig.codes.some(function(s){return codeMatch(s,c)})}))return true;
    const n=norm(e),sel=norm(sig.engine);
    return sel&&(sel.indexOf(n.split(' ')[0])>=0||n.indexOf(sel.split(' ')[0])>=0)});
   if(!hit)return false}
  return true}).map(function(t){return Object.assign({},t,{b:A.arr(t.b),m:A.arr(t.m),e:A.arr(t.e),dtc:A.dtc(t.dtc),y:A.yrs(t.y)||WIN,src:t.src||'TSB constructeur'})})}catch(e){}
 nativeTsb.forEach(function(t){if(!tsb.some(function(x){return norm(x.ref)===norm(t.ref)}))tsb.push(t)});
 try{recalls=Rall().filter(function(r){
  if(!r||!brandMatch(r.b,sig.brand))return false;
  if(!modelAllow(r.m,sig.model))return false;
  if(!yrOK(r.y,sig.years))return false;
  const rf=fuelGroup((r.t||'')+' '+(r.risk||''));
  if(rf&&sig.fuelGroup&&!fuelOK(rf,sig.fuelGroup))return false;
  if(sig.model&&A.arr(r.m).indexOf('*')>=0&&!modelMatch(r.m,sig.model)){
   /* rappel générique marque : conservé mais marqué */
   r._generic=true}
  return true}).map(function(r){return Object.assign({},r,{b:A.arr(r.b),m:A.arr(r.m),dtc:A.dtc(r.dtc),law:A.arr(r.law),y:A.yrs(r.y)||WIN,src:r.src||'Rappel'})})}catch(e){}
 nativeRec.forEach(function(r){if(!recalls.some(function(x){return norm(x.t)===norm(r.t)}))recalls.push(r)});
 /* dédoublonnage + tri : spécifiques d'abord */
 const rseen={};recalls=recalls.filter(function(r){const k=norm(r.t);if(rseen[k])return false;rseen[k]=1;return true});
 recalls.sort(function(a,b){const am=modelMatch(a.m,sig.model)?0:1,bm=modelMatch(b.m,sig.model)?0:1;
  return am-bm||(b.fire?1:0)-(a.fire?1:0)});
 const tseen={};tsb=tsb.filter(function(t){const k=norm(t.ref)+'|'+norm(t.sys);if(tseen[k])return false;tseen[k]=1;return true});
 /* liens par fiche */
 kept.forEach(function(f){
  f.linkTsb=tsb.filter(function(t){return A.dtc(t.dtc).some(function(d){return f.dtc.indexOf(d)>=0})||norm(t.sys)===norm(f.s)}).slice(0,4);
  f.linkRec=recalls.filter(function(r){return A.dtc(r.dtc).some(function(d){return f.dtc.indexOf(d)>=0})}).slice(0,4)});
 /* ---- garantie non vide ---- */
 if(!kept.length){
  trace.fallback=true;
  pool.filter(function(f){return brandMatch(f.b,sig.brand)&&(f.generic||fuelOK(f.fuel,sig.fuelGroup))}).slice(0,20).forEach(function(f){
   const legal=f.law.map(function(id){try{return txtById(id)}catch(e){return null}}).filter(Boolean);
   kept.push(Object.assign({},f,{sc:3,why:['marque / système','repli ingénieur garanti'],relevance:'COMPATIBLE marque (repli)',
    tier:5,readHits:[],legal:legal,ch:f.chain,linkTsb:[],linkRec:[]}))})}
 kept.sort(function(a,b){return a.tier-b.tier||b.sc-a.sc||String(a.t).localeCompare(String(b.t))});
 trace.kept=kept.length;
 /* ---- DTC agrégés ---- */
 const map={};
 kept.forEach(function(f){f.dtc.forEach(function(d){(map[d]=map[d]||[]).push(f.t)})});
 tsb.forEach(function(t){A.dtc(t.dtc).forEach(function(d){if(!map[d])map[d]=['TSB : '+t.ref]})});
 recalls.forEach(function(r){A.dtc(r.dtc).forEach(function(d){if(!map[d])map[d]=['Campagne : '+r.t]})});
 const md=[];tsb.forEach(function(t){A.dtc(t.dtc).forEach(function(d){if(md.indexOf(d)<0)md.push(d)})});
 recalls.forEach(function(r){A.dtc(r.dtc).forEach(function(d){if(md.indexOf(d)<0)md.push(d)})});
 const dtcList=Object.keys(map).sort().map(function(d){return{code:d,faults:map[d],read:read.indexOf(d)>=0,fromModel:md.indexOf(d)>=0}});
 /* systèmes disponibles pour les filtres */
 const avail={};kept.forEach(function(f){f.sys.forEach(function(k){avail[k]=(avail[k]||0)+1})});
 return{sig:sig,faults:kept,dtc:dtcList,recalls:recalls,tsb:tsb,modelDtc:md,trace:trace,systems:SYS,avail:avail}}
window.KFCorr={correlate:correlate,signature:signature,norm:norm,fuelGroup:fuelGroup,powersOf:powersOf,WIN:WIN,
 SYS:SYS,SYSMAP:SYSMAP,sysOf:sysOf,arr:A.arr,dtc:A.dtc,txt:A.txt,codeMatch:codeMatch,
 systemsFor:function(){return['*']},annotate:function(k){return{fuel:'',system:k.s,powers:[]}}};
})();
