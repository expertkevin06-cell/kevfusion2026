/* KEV FUSION 2026 — correlation.js v4.5.0
   Corrélation stricte marque + modèle + motorisation + puissance + énergie + systèmes.
   v4.5 : infraction-safe, liens par fiche (TSB / rappels / articles), résolution énergie par catalogue. */
(function(){
'use strict';
if(typeof KBall!=='function'){console.warn('correlation.js: base indisponible');return}
const WIN=[2015,2027];
function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim()}
const FAM=[
 [/bluehdi|\bhdi\b|dv5|dv6|dw10|\bdv\b|\bdw\b/,'PSA_D'],
 [/puretech|eb2|\beb\b|\bthp\b|ep6|\bep\b|prince|\bvti\b/,'PSA_E'],
 [/\bdci\b|k9k|m9r|r9m/,'REN_D'],[/\btce\b|h5ft|h5ht|\bsce\b/,'REN_E'],
 [/\btdi\b|ea189|ea288/,'VAG_D'],[/\btsi\b|tfsi|ea888|ea211/,'VAG_E'],
 [/n47|b47|n57|b57/,'BMW_D'],[/n20|n13|b48|n55/,'BMW_E'],
 [/om651|om654|om642|\bcdi\b/,'MB_D'],[/m274|m264|m256/,'MB_E'],
 [/ecoblue|tdci|duratorq/,'FORD_D'],[/ecoboost/,'FORD_E'],
 [/multijet|jtdm|\bjtd\b|mjet/,'FCA_D'],[/\bfire\b|twinair|\bt3\b|\bt4\b|\btb\b/,'FCA_E'],
 [/\bcdti\b/,'OPEL_D'],[/\bcrdi\b/,'HK_D'],[/t-gdi|\bgdi\b|theta|gamma|kappa|\bmpi\b/,'HK_E'],
 [/e:hev|\bths\b/,'TOY_H'],[/vvt-i/,'TOY_E'],[/d-4d/,'TOY_D'],
 [/skyactiv-d/,'MAZ_D'],[/skyactiv-g/,'MAZ_E'],[/boxer|\bej\b|\bfa\b|\bfb\b/,'SUB_E'],
 [/\bvtec\b|l15/,'HON_E'],[/i-mmd/,'HON_H'],[/ingenium/,'JLR_D'],
 [/\bvea\b|\bd3\b|\bd4\b|\bd5\b/,'VOL_D'],[/dig-t|ig-t/,'NIS_E'],
 [/li-ion|runaway|\bbms\b|pack ht/,'EV']];
function famsOf(t){const s=new Set();const n=norm(t);FAM.forEach(function(p){if(p[0].test(n))s.add(p[1])});return s}
function powersOf(t){const out=[];const n=norm(t);let m;const re=/\b(\d{2,3})\s?(?:ch|cv|hp)\b/g;
 while((m=re.exec(n)))out.push(+m[1]);return Array.from(new Set(out))}
const BRAND_FAM={
 'Peugeot':{d:['PSA_D'],e:['PSA_E']},'Citroën':{d:['PSA_D'],e:['PSA_E']},'DS':{d:['PSA_D'],e:['PSA_E']},
 'Opel':{d:['PSA_D','OPEL_D'],e:['PSA_E']},'Vauxhall':{d:['PSA_D','OPEL_D'],e:['PSA_E']},
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
 'Mitsubishi':{d:['FCA_D'],e:['NIS_E']},'Suzuki':{d:['FCA_D'],e:['TOY_E']},'Chevrolet':{d:['HK_D'],e:['HK_E']}};
const COMMON=['Batterie 12V','Faisceau électrique','Électronique / Calculateurs','Boîte de vitesses','Freinage','ADAS','Suspension','Transmission','Multimédia','Climatisation','Sécurité (airbag/ceintures)','Direction','Refroidissement'];
const ENGINE=['Distribution','Lubrification','Injection','Suralimentation','Bloc moteur','Embrayage'];
function systemsFor(g){
 if(g==='ev')return COMMON.concat(['Pack HT','Charge']);
 if(g==='diesel')return COMMON.concat(['Alternateur / B+'],ENGINE,['EGR','FAP / catalyseur','AdBlue / SCR']);
 if(g==='essence')return COMMON.concat(['Alternateur / B+'],ENGINE,['EGR','FAP / catalyseur']);
 if(g==='hyb')return COMMON.concat(['Alternateur / B+'],ENGINE,['EGR','FAP / catalyseur','Pack HT','Charge']);
 return COMMON.concat(['Alternateur / B+'],ENGINE,['EGR','FAP / catalyseur','AdBlue / SCR','Pack HT','Charge'])}
function fuelGroup(f){const n=norm(f);
 if(/electri|\bev\b|kwh/.test(n))return'ev';
 if(/hybride|hybrid|phev|e-tech|e:hev/.test(n))return'hyb';
 if(/diesel|flexfuel|gpl|hdi|tdi|dci|cdti|crdi|bluehdi/.test(n))return'diesel';
 if(/essence|puretech|thp|tsi|tfsi|tce|ecoboost|vtec|gdi|mpi/.test(n))return'essence';
 return''}
function signature(v){
 v=v||{};const label=norm(v.engine||v.motor||'');
 let g=fuelGroup(v.fuel||v.energie||'')||fuelGroup(label);
 if(!g)g='';
 const dm=label.match(/(\d\.\d)/);const disp=dm?dm[1]:'';
 const lp=label.match(/(\d{2,3})\s*(?:ch|cv|hp)?\s*$/);
 const ch=v.ch||(lp?+lp[1]:null);
 const families=famsOf(label);const bf=BRAND_FAM[v.brand];
 if(bf&&g)(g==='diesel'?bf.d:g==='essence'?bf.e:[]).forEach(function(x){families.add(x)});
 if(g==='ev')families.add('EV');
 if(g==='hyb'){if(/toyota|lexus/.test(norm(v.brand)))families.add('TOY_H');if(/honda/.test(norm(v.brand)))families.add('HON_H')}
 const model=norm(v.model||''),brand=norm(v.brand||'');
 if(/peugeot|citroen|ds|opel/.test(brand)&&g==='diesel')families.add('PSA_D');
 if(/nissan/.test(brand)&&g==='diesel')families.add('REN_D');
 if(/mercedes/.test(brand)&&g==='diesel'&&disp&&parseFloat(disp)<=1.6)families.add('REN_D');
 if(/mini/.test(brand)&&g==='essence')families.add('PSA_E');
 if(/toyota/.test(brand)&&/proace/.test(model)&&g==='diesel')families.add('PSA_D');
 if(/opel|vauxhall/.test(brand)&&/movano/.test(model)&&g==='diesel')families.add('REN_D');
 if(/peugeot/.test(brand)&&/boxer/.test(model)&&g==='diesel')families.add('FCA_D');
 if(/citroen/.test(brand)&&/jumper/.test(model)&&g==='diesel')families.add('FCA_D');
 const years=v.y||(v.annee?[+v.annee,+v.annee]:WIN);
 return{brand:v.brand||'',model:v.model||'',engine:v.engine||v.motor||'',ch:ch,kw:ch?Math.round(ch*0.7355):null,
  disp:disp,fuelGroup:g,systemList:systemsFor(g||'all'),families:families,years:years,
  familyLabel:Array.from(families).join(', ')||'famille non identifiée'}}
const D_MARK=/bluehdi|\bhdi\b|\bdci\b|\btdi\b|cdti|d-4d|multijet|jtdm|\bjtd\b|ecoblue|skyactiv-d|crdi|diesel|adblue|\bscr\b|\bnox\b|suies|coking|common rail|\begr\b|eolys|\bdpf\b/;
const E_MARK=/puretech|\bthp\b|\btsi\b|tfsi|\btce\b|ecoboost|vtec|skyactiv-g|\bgdi\b|t-gdi|\bmpi\b|boxer|lspi|calamine|\bgpf\b|essence|allumage|bougie|twinair|\bfire\b|vvt-i/;
const V_MARK=/pack ht|\bbms\b|\bsoh\b|dc\/dc|dcdc|li-ion|runaway|charge impossible|\bleaf\b|tesla/;
const H_MARK=/hybride|hybrid|e:hev|e-tech|phev|inverter|i-mmd|\bths\b/;
function annotate(k){
 const t=norm((k.t||'')+' '+(k.mec||'')+' '+(k.s||'')+' '+(k.ch||''));
 let d=D_MARK.test(t),e=E_MARK.test(t);
 if(/\bfap\b/.test(t)&&!/\bgpf\b|essence/.test(t))d=true;
 const v=V_MARK.test(t),h=H_MARK.test(t);
 let fuel='any';
 if(v&&!d&&!e)fuel='ev';else if(h&&!d&&!e)fuel='hyb';else if(d&&!e)fuel='diesel';else if(e&&!d)fuel='essence';
 return{fuel:fuel,families:famsOf((k.t||'')+' '+(k.mec||'')+' '+(k.s||'')),system:k.s,powers:powersOf((k.t||'')+' '+(k.mec||''))}}
function fuelOK(a,g){if(!g)return true;if(a==='any')return true;if(a===g)return true;
 if(g==='hyb'&&(a==='diesel'||a==='essence'||a==='hyb'))return true;return false}
function yearOK(y,years){if(!y)return true;const a=years&&years[0]?years[0]:WIN[0],b=years&&years[1]?years[1]:WIN[1];return y[0]<=b&&y[1]>=a}
function powerOK(p,ch){if(!p||!p.length||!ch)return true;return p.indexOf(+ch)>=0}
function recallFuel(r){const t=norm((r.t||'')+' '+(r.risk||''));
 if(/tesla|emmc/.test(t))return'ev';if(/takata/.test(t))return'any';
 if(/puretech|thp|tsi|ecoboost|tce|theta|denso/.test(t))return'essence';
 if(/egr|hdi|tdi|dci|om651|ingenium|diesel/.test(t))return'diesel';return'any'}
function modelOK(list,model){if(!model)return true;if(!list||!list.length)return true;
 if(list.indexOf('*')>=0)return true;const n=norm(model);
 return list.some(function(m){const x=norm(m);return n.indexOf(x)>=0||x.indexOf(n)>=0})}
function recallMatch(r,v,sig){
 if(!((r.b||[]).indexOf('*')>=0||(r.b||[]).indexOf(v.brand)>=0))return false;
 if(!modelOK(r.m,v.model))return false;
 const f=recallFuel(r);if(f!=='any'&&!fuelOK(f,sig.fuelGroup))return false;
 if(!yearOK(r.y,sig.years))return false;
 if(!powerOK(powersOf((r.t||'')+' '+(r.risk||'')),sig.ch))return false;
 return true}
function tsbMatch(t,v,sig){
 if((t.b||[]).indexOf(v.brand)<0)return false;
 if(!modelOK(t.m,v.model))return false;
 if(v.engine){const sel=norm(v.engine);
  const hit=(t.e||[]).some(function(e){const n=norm(e);
   return sel.indexOf(n.split(' ')[0])>=0||n.indexOf(sel.split(' ')[0])>=0||Array.from(famsOf(n)).some(function(f){return sig.families.has(f)})});
  if(!hit)return false}
 if(!yearOK(t.y,sig.years))return false;
 if(!powerOK(powersOf((t.e||[]).join(' ')+' '+(t.s||'')),sig.ch))return false;
 return true}
function correlate(v,opts){
 opts=opts||{};const strict=opts.strict!==false;
 const read=(opts.readDtc||[]).map(function(x){return String(x).toUpperCase()});
 const sig=signature(v);
 const empty={sig:sig,faults:[],dtc:[],recalls:[],tsb:[],modelDtc:[]};
 if(!v||!v.brand)return empty;
 let recalls=[],tsb=[];
 try{recalls=Rall().filter(function(r){return recallMatch(r,v,sig)})}catch(e){}
 try{tsb=(typeof TSBDB!=='undefined'?TSBDB:[]).filter(function(t){return tsbMatch(t,v,sig)})}catch(e){}
 const md=[];recalls.forEach(function(r){(r.dtc||[]).forEach(function(d){if(md.indexOf(d)<0)md.push(d)})});
 tsb.forEach(function(t){(t.dtc||[]).forEach(function(d){if(md.indexOf(d)<0)md.push(d)})});
 const faults=[];
 KBall().forEach(function(k){
  const brandOK=(k.b||[]).indexOf(v.brand)>=0,generic=(k.b||[]).indexOf('*')>=0;
  if(!brandOK&&!generic)return;
  const a=annotate(k);
  if(sig.systemList.indexOf(a.system)<0)return;
  if(!fuelOK(a.fuel,sig.fuelGroup))return;
  const famMatch=a.families.size>0&&Array.from(a.families).some(function(f){return sig.families.has(f)});
  if(a.families.size>0&&!famMatch)return;
  if(strict&&!powerOK(a.powers,sig.ch))return;
  const blob=norm((k.t||'')+' '+(k.mec||'')+' '+(k.ch||''));
  const modelDirect=!!v.model&&blob.indexOf(norm(v.model))>=0;
  const modelIndirect=!modelDirect&&(k.dtc||[]).some(function(d){return md.indexOf(d)>=0});
  const engineExact=!!sig.engine&&blob.indexOf(norm(sig.engine))>=0;
  const fuelSpecific=a.fuel!=='any'&&a.fuel===sig.fuelGroup;
  if(strict&&!famMatch&&!brandOK&&!modelDirect&&!modelIndirect&&!engineExact&&!fuelSpecific)return;
  let sc=0;const why=[];
  if(engineExact){sc+=5;why.push('motorisation exacte')}
  if(famMatch){sc+=6;why.push('famille moteur')}
  if(modelDirect){sc+=4;why.push('modèle direct')}else if(modelIndirect){sc+=3;why.push('modèle via TSB/rappel')}
  if(brandOK){sc+=3;why.push('marque')}
  if(a.fuel&&a.fuel===sig.fuelGroup){sc+=3;why.push('énergie')}
  if(sig.disp&&blob.indexOf(sig.disp)>=0){sc+=2;why.push('cylindrée '+sig.disp)}
  if(sig.ch&&a.powers.indexOf(+sig.ch)>=0){sc+=3;why.push('puissance '+sig.ch+' ch')}
  const hits=(k.dtc||[]).filter(function(d){return read.indexOf(d)>=0});
  if(hits.length){sc+=3;why.push('DTC lus '+hits.join(','))}
  if(!brandOK&&!famMatch&&!modelDirect&&!modelIndirect&&!engineExact){sc+=1;why.push('générique compatible énergie')}
  const relevance=sc>=15?'DIRECT motorisation':sc>=10?'FORT marque+modèle':sc>=6?'COMPATIBLE système':'GÉNÉRIQUE compatible';
  const linkTsb=tsb.filter(function(t){return (t.dtc||[]).some(function(d){return (k.dtc||[]).indexOf(d)>=0})||norm(t.sys)===norm(k.s)});
  const linkRec=recalls.filter(function(r){return (r.dtc||[]).some(function(d){return (k.dtc||[]).indexOf(d)>=0})});
  const legal=(k.law||[]).map(function(id){try{return txtById(id)}catch(e){return null}}).filter(Boolean);
  faults.push(Object.assign({},k,{sc:sc,why:why,relevance:relevance,famMatch:famMatch,modelDirect:modelDirect,
   modelIndirect:modelIndirect,engineExact:engineExact,readHits:hits,energy:a.fuel,linkTsb:linkTsb,linkRec:linkRec,legal:legal}))});
 faults.sort(function(a,b){return b.sc-a.sc||String(a.t).localeCompare(String(b.t))});
 const map={};faults.forEach(function(f){(f.dtc||[]).forEach(function(d){(map[d]=map[d]||[]).push(f.t)})});
 const dtc=Object.keys(map).sort().map(function(d){return{code:d,faults:map[d],read:read.indexOf(d)>=0,fromModel:md.indexOf(d)>=0}});
 return{sig:sig,faults:faults,dtc:dtc,recalls:recalls,tsb:tsb,modelDtc:md}}
window.KFCorr={correlate:correlate,signature:signature,annotate:annotate,systemsFor:systemsFor,norm:norm,powersOf:powersOf,fuelGroup:fuelGroup,WIN:WIN};
})();
