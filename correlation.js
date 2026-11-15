/* KEV FUSION 2026 — correlation.js v4.2.0
   Moteur de corrélation INGÉNIEUR : signature véhicule (marque/modèle/cylindrée/famille moteur/énergie/systèmes)
   → filtrage strict des pannes, DTC, rappels et TSB. Aucune restitution "de toutes les pannes".
   Les bases techniques (KB/RECALLS/TSBDB) et juridiques (LEGAL/JR) sont conservées et exploitées telles quelles. */
(function(){
'use strict';
if(typeof KBall!=='function'){console.warn('correlation.js: base indisponible');return}
const WIN=[2015,2027];
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
/* ---------- familles moteur ---------- */
const FAM=[
 [/bluehdi|\bhdi\b|dv5|dv6|dw10|\bdv\b|\bdw\b/,'PSA_D'],
 [/puretech|eb2|\beb\b|\bthp\b|ep6|\bep\b|prince|\bvti\b/,'PSA_E'],
 [/\bdci\b|k9k|m9r|r9m/,'REN_D'],
 [/\btce\b|h5ft|h5ht|\bsce\b/,'REN_E'],
 [/\btdi\b|ea189|ea288/,'VAG_D'],
 [/\btsi\b|tfsi|ea888|ea211/,'VAG_E'],
 [/n47|b47|n57|b57/,'BMW_D'],
 [/n20|n13|b48|n55/,'BMW_E'],
 [/om651|om654|om642|\bcdi\b/,'MB_D'],
 [/m274|m264|m256/,'MB_E'],
 [/ecoblue|tdci|duratorq/,'FORD_D'],
 [/ecoboost/,'FORD_E'],
 [/multijet|jtdm|\bjtd\b|mjet/,'FCA_D'],
 [/\bfire\b|twinair|\bt3\b|\bt4\b|\btb\b/,'FCA_E'],
 [/\bcdti\b/,'OPEL_D'],
 [/\bcrdi\b/,'HK_D'],
 [/t-gdi|\bgdi\b|theta|gamma|kappa|\bmpi\b/,'HK_E'],
 [/e:hev|\bths\b/,'TOY_H'],
 [/vvt-i/,'TOY_E'],
 [/d-4d/,'TOY_D'],
 [/skyactiv-d/,'MAZ_D'],
 [/skyactiv-g/,'MAZ_E'],
 [/boxer|\bej\b|\bfa\b|\bfb\b/,'SUB_E'],
 [/\bvtec\b|l15/,'HON_E'],
 [/i-mmd/,'HON_H'],
 [/ingenium/,'JLR_D'],
 [/\bvea\b|\bd3\b|\bd4\b|\bd5\b/,'VOL_D'],
 [/dig-t|ig-t/,'NIS_E'],
 [/li-ion|runaway|\bbms\b|pack ht/,'EV']
];
function famsOf(t){const s=new Set();const n=norm(t);FAM.forEach(([re,g])=>{if(re.test(n))s.add(g)});return s}
const BRAND_FAM={
 'Peugeot':{d:['PSA_D'],e:['PSA_E']},'Citroën':{d:['PSA_D'],e:['PSA_E']},'DS':{d:['PSA_D'],e:['PSA_E']},
 'Opel':{d:['PSA_D','OPEL_D'],e:['PSA_E','OPEL_E']},'Vauxhall':{d:['PSA_D','OPEL_D'],e:['PSA_E']},
 'Renault':{d:['REN_D'],e:['REN_E']},'Dacia':{d:['REN_D'],e:['REN_E']},
 'Nissan':{d:['REN_D'],e:['NIS_E']},'Mercedes-Benz':{d:['MB_D'],e:['MB_E']},'Smart':{d:['REN_D'],e:['REN_E']},
 'Volkswagen':{d:['VAG_D'],e:['VAG_E']},'Audi':{d:['VAG_D'],e:['VAG_E']},'SEAT':{d:['VAG_D'],e:['VAG_E']},
 'Skoda':{d:['VAG_D'],e:['VAG_E']},'Cupra':{d:['VAG_D'],e:['VAG_E']},
 'BMW':{d:['BMW_D'],e:['BMW_E']},'MINI':{d:['BMW_D'],e:['PSA_E','BMW_E']},
 'Ford':{d:['FORD_D'],e:['FORD_E']},
 'Fiat':{d:['FCA_D'],e:['FCA_E']},'Abarth':{d:['FCA_D'],e:['FCA_E']},'Alfa Romeo':{d:['FCA_D'],e:['FCA_E']},
 'Lancia':{d:['FCA_D'],e:['FCA_E']},'Jeep':{d:['FCA_D','REN_D'],e:['FCA_E']},
 'Hyundai':{d:['HK_D'],e:['HK_E']},'Kia':{d:['HK_D'],e:['HK_E']},'SsangYong':{d:['HK_D'],e:['HK_E']},
 'Toyota':{d:['TOY_D'],e:['TOY_E']},'Lexus':{d:['TOY_D'],e:['TOY_E']},
 'Mazda':{d:['MAZ_D'],e:['MAZ_E']},'Subaru':{d:['SUB_E'],e:['SUB_E']},
 'Honda':{d:['HON_E'],e:['HON_E']},'Volvo':{d:['VOL_D'],e:['VOL_D']},
 'Jaguar':{d:['JLR_D'],e:['JLR_D']},'Land Rover':{d:['JLR_D'],e:['JLR_D']},
 'Tesla':{d:['EV'],e:['EV']},'Polestar':{d:['EV'],e:['EV']},'NIO':{d:['EV'],e:['EV']},
 'BYD':{d:['EV'],e:['EV']},'MG':{d:['EV'],e:['EV']},'Aiways':{d:['EV'],e:['EV']},'XPeng':{d:['EV'],e:['EV']},'Zeekr':{d:['EV'],e:['EV']},
 'Mitsubishi':{d:['FCA_D'],e:['NIS_E']},'Suzuki':{d:['FCA_D'],e:['TOY_E']},'Chevrolet':{d:['HK_D'],e:['HK_E']}
};
/* ---------- systèmes réellement présents selon l'énergie ---------- */
const COMMON=['Batterie 12V','Faisceau électrique','Électronique / Calculateurs','Boîte de vitesses','Freinage','ADAS','Suspension','Transmission','Multimédia','Climatisation','Sécurité (airbag/ceintures)','Direction','Refroidissement'];
const ENGINE=['Distribution','Lubrification','Injection','Suralimentation','Bloc moteur','Embrayage'];
function systemsFor(g){
 if(g==='ev')return COMMON.concat(['Pack HT','Charge']);
 if(g==='diesel')return COMMON.concat(['Alternateur / B+'],ENGINE,['EGR','FAP / catalyseur','AdBlue / SCR']);
 if(g==='essence')return COMMON.concat(['Alternateur / B+'],ENGINE,['EGR','FAP / catalyseur']);
 if(g==='hyb')return COMMON.concat(['Alternateur / B+'],ENGINE,['EGR','FAP / catalyseur','Pack HT','Charge']);
 return COMMON.concat(['Alternateur / B+'],ENGINE,['EGR','FAP / catalyseur','AdBlue / SCR','Pack HT','Charge']);
}
function fuelGroup(f){const n=norm(f);if(/electri|ev\b/.test(n))return'ev';if(/hybride|hybrid|phev/.test(n))return'hyb';if(/diesel|flexfuel|gpl/.test(n))return'diesel';if(/essence/.test(n))return'essence';return''}
/* ---------- signature véhicule ---------- */
function signature(v){
 v=v||{};const label=norm(v.engine||v.motor||'');
 let g=fuelGroup(v.fuel||v.energie||'');
 if(!g){if(/bluehdi|hdi|dci|tdi|cdti|crdi|ecoblue|d-4d|multijet|jtd|skyactiv-d|diesel/.test(label))g='diesel';
  else if(/puretech|thp|tsi|tfsi|tce|ecoboost|vtec|skyactiv-g|gdi|mpi|boxer|essence/.test(label))g='essence';
  else if(/hybrid|hybride|e:hev|e-tech|phev/.test(label))g='hyb';
  else if(/electric|electrique|ev\b|kwh/.test(label))g='ev';else g='essence'}
 const dm=label.match(/(\d\.\d)/);const disp=dm?dm[1]:'';
 const families=famsOf(label);
 const bf=BRAND_FAM[v.brand];
 if(bf){(g==='diesel'?bf.d:g==='essence'?bf.e:[]).forEach(x=>families.add(x))}
 if(g==='ev')families.add('EV');
 if(g==='hyb'){if(/toyota|lexus/.test(norm(v.brand)))families.add('TOY_H');if(/honda/.test(norm(v.brand)))families.add('HON_H')}
 const model=norm(v.model||'');
 if(/peugeot|citroen|ds|opel/.test(norm(v.brand))&&g==='diesel')families.add('PSA_D');
 if(/nissan/.test(norm(v.brand))&&g==='diesel')families.add('REN_D');
 if(/mercedes/.test(norm(v.brand))&&g==='diesel'&&disp&&parseFloat(disp)<=1.6)families.add('REN_D');
 if(/mini/.test(norm(v.brand))&&g==='essence')families.add('PSA_E');
 if(/toyota/.test(norm(v.brand))&&/proace/.test(model)&&g==='diesel')families.add('PSA_D');
 if(/opel|vauxhall/.test(norm(v.brand))&&/movano/.test(model)&&g==='diesel')families.add('REN_D');
 if(/peugeot/.test(norm(v.brand))&&/boxer/.test(model)&&g==='diesel')families.add('FCA_D');
 if(/citroen/.test(norm(v.brand))&&/jumper/.test(model)&&g==='diesel')families.add('FCA_D');
 const years=v.y||(v.annee?[+v.annee,+v.annee]:WIN);
 return{brand:v.brand||'',model:v.model||'',engine:v.engine||v.motor||'',ch:v.ch||null,kw:v.ch?Math.round(v.ch*0.7355):null,
  disp,fuelGroup:g,systemList:systemsFor(g),families,years,
  familyLabel:[...families].join(', ')||'famille non identifiée'}
}
/* ---------- annotation d'une fiche de la base ---------- */
const D_MARK=/bluehdi|\bhdi\b|\bdci\b|\btdi\b|cdti|d-4d|multijet|jtdm|\bjtd\b|ecoblue|skyactiv-d|crdi|diesel|adblue|\bscr\b|\bnox\b|suies|coking|common rail|\begr\b|eolys|\bdpf\b/;
const E_MARK=/puretech|\bthp\b|\btsi\b|tfsi|\btce\b|ecoboost|vtec|skyactiv-g|\bgdi\b|t-gdi|\bmpi\b|boxer|lspi|calamine|\bgpf\b|essence|allumage|bougie|twinair|\bfire\b|vvt-i/;
const V_MARK=/pack ht|\bbms\b|\bsoh\b|dc\/dc|dcdc|li-ion|runaway|charge impossible|\bleaf\b|tesla/;
const H_MARK=/hybride|hybrid|e:hev|e-tech|phev|inverter|i-mmd|\bths\b/;
function annotate(k){
 const t=norm(k.t+' '+k.mec+' '+k.s+' '+(k.ch||''));
 let d=D_MARK.test(t),e=E_MARK.test(t);
 if(/\bfap\b/.test(t)&&!/\bgpf\b|essence/.test(t))d=true;
 const v=V_MARK.test(t),h=H_MARK.test(t);
 let fuel='any';
 if(v&&!d&&!e)fuel='ev';else if(h&&!d&&!e)fuel='hyb';
 else if(d&&!e)fuel='diesel';else if(e&&!d)fuel='essence';
 return{fuel,families:famsOf(k.t+' '+k.mec+' '+k.s),system:k.s}
}
function fuelOK(aFuel,g){if(aFuel==='any')return true;if(aFuel===g)return true;
 if(g==='hyb'&&(aFuel==='diesel'||aFuel==='essence'||aFuel==='hyb'))return true;return false}
function yearOK(y,years){if(!y)return true;const a=years&&years[0]?years[0]:WIN[0],b=years&&years[1]?years[1]:WIN[1];return y[0]<=b&&y[1]>=a}
/* ---------- rappels & TSB précis ---------- */
function recallFuel(r){const t=norm(r.t+' '+r.risk);
 if(/tesla|emmc/.test(t))return'ev';
 if(/puretech|thp|tsi|ecoboost|tce|theta|denso|takata/.test(t))return takataOrEssence(t);
 if(/egr|hdi|tdi|dci|om651|ingenium|diesel/.test(t))return'diesel';
 return'any'}
function takataOrEssence(t){return/takata/.test(t)?'any':'essence'}
function recallMatch(r,v,sig){
 if(!(r.b.includes('*')||r.b.includes(v.brand)))return false;
 if(v.model&&!(r.m.includes('*')||r.m.some(m=>norm(v.model).includes(norm(m))||norm(m).includes(norm(v.model)))))return false;
 const f=recallFuel(r);if(f!=='any'&&!fuelOK(f,sig.fuelGroup))return false;
 if(!yearOK(r.y,sig.years))return false;
 return true}
function tsbMatch(t,v,sig){
 if(!t.b.includes(v.brand))return false;
 if(v.model&&!t.m.some(m=>norm(v.model).includes(norm(m))||norm(m).includes(norm(v.model))))return false;
 if(v.engine){const sel=norm(v.engine);const hit=t.e.some(e=>{const n=norm(e);
   return sel.includes(n.split(' ')[0])||n.includes(sel.split(' ')[0])||[...famsOf(n)].some(f=>sig.families.has(f))});
  if(!hit)return false}
 if(!yearOK(t.y,sig.years))return false;
 return true}
/* ---------- corrélation principale ---------- */
function correlate(v,opts){
 opts=opts||{};const strict=opts.strict!==false;const read=(opts.readDtc||[]).map(x=>String(x).toUpperCase());
 const sig=signature(v);const faults=[];
 if(!v||!v.brand)return{sig,faults:[],dtc:[],recalls:[],tsb:[]};
 KBall().forEach(k=>{
  const brandOK=k.b.includes(v.brand),generic=k.b.includes('*');
  if(!brandOK&&!generic)return;
  const a=annotate(k);
  if(sig.systemList.indexOf(a.system)<0)return;
  if(!fuelOK(a.fuel,sig.fuelGroup))return;
  const famMatch=a.families.size>0&&[...a.families].some(f=>sig.families.has(f));
  if(a.families.size>0&&!famMatch)return;
  const modelMatch=!!v.model&&norm(k.t+' '+k.mec+' '+(k.ch||'')).includes(norm(v.model));
  const fuelSpecific=a.fuel!=='any'&&a.fuel===sig.fuelGroup;
  if(strict&&!famMatch&&!brandOK&&!modelMatch&&!fuelSpecific)return;
  let sc=0;const why=[];
  if(famMatch){sc+=6;why.push('famille moteur')}
  if(modelMatch){sc+=4;why.push('modèle')}
  if(brandOK){sc+=3;why.push('marque')}
  if(a.fuel===sig.fuelGroup){sc+=3;why.push('énergie')}
  if(sig.disp&&norm(k.t+' '+k.mec).includes(sig.disp)){sc+=2;why.push('cylindrée '+sig.disp)}
  const hits=k.dtc.filter(d=>read.indexOf(d)>=0);
  if(hits.length){sc+=3;why.push('DTC lus '+hits.join(','))}
  if(!brandOK&&!famMatch&&!modelMatch){sc+=1;why.push('générique compatible énergie')}
  if(sig.years&&k.law&&yearOK(sig.years,sig.years))sc+=0;
  const relevance=sc>=13?'DIRECT motorisation':sc>=9?'FORT marque+énergie':sc>=6?'COMPATIBLE système':'GÉNÉRIQUE compatible';
  faults.push(Object.assign({},k,{sc,why,relevance,famMatch,readHits:hits,energy:a.fuel}))});
 faults.sort((a,b)=>b.sc-a.sc||a.t.localeCompare(b.t));
 const map={};faults.forEach(f=>f.dtc.forEach(d=>{(map[d]=map[d]||[]).push(f.t)}));
 const dtc=Object.keys(map).sort().map(d=>({code:d,faults:map[d],read:read.indexOf(d)>=0}));
 return{sig,faults,dtc,recalls:Rall().filter(r=>recallMatch(r,v,sig)),tsb:(typeof TSBDB!=='undefined'?TSBDB:[]).filter(t=>tsbMatch(t,v,sig))}
}
window.KFCorr={correlate,signature,annotate,systemsFor,norm,WIN};
})();
