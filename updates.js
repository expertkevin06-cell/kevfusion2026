/* KEV FUSION 2026 — updates.js v3.3.0 · MAJ admin + sauvegarde locale + partage tiers */
(function(){
'use strict';
if(typeof aspSource!=='function'||typeof mergeAsp!=='function'){console.warn('updates.js: app.js non chargé');return}
const UP_VERSION='3.3.0';
/* ---- nouveaux modules fusionnés + sources internes ---- */
const NEW_MODULES=[
 {k:'dfaillance',n:'AutoLitige Expert (D-Faillance)',i:'⚖️',u:'https://expertkevin06-cell.github.io/d-faillance-auto-/',d:'Pannes · rappels · DTC · droit français'},
 {k:'monaide',n:'DTCDiag Pro (Mon Aide Technique)',i:'⚙️',u:'https://expertkevin06-cell.github.io/mon-aide-technique/',d:'21 000 fiches OBD'},
 {k:'techkevin',n:'TechKevin 2026 (véhicules)',i:'📦',u:'https://expertkevin06-cell.github.io/techkevin2026/',d:'Catalogue véhicules source'},
 {k:'autodiag',n:'Auto-Diagnostic (source)',i:'📦',u:'https://expertkevin06-cell.github.io/auto-diagnostic/',d:'Diagnostic & pannes source'}];
NEW_MODULES.forEach(m=>{if(!MODULES.find(x=>x.k===m.k))MODULES.push(m);
 if(typeof MODULE_FALLBACKS==='object')MODULE_FALLBACKS[m.k]=[m.u,m.u+'index.html',m.u.replace(/\/$/,'')]});
/* ---- sauvegarde locale ---- */
function snapshot(){return{ts:Date.now(),version:UP_VERSION,kb:ls.get('kbx',[]),veh:ls.get('vehx',{}),ph:PHall(),rec:ls.get('recx',[])}}
function backup(){const s=snapshot();const arr=ls.get('backups',[]);arr.unshift(s);ls.set('backups',arr.slice(0,5));return s}
function restore(i){const arr=ls.get('backups',[]);const s=arr[i];if(!s){toast('Sauvegarde introuvable');return}
 ls.set('kbx',s.kb||[]);ls.set('vehx',s.veh||{});ls.set('photox',s.ph||[]);ls.set('recx',s.rec||[]);
 toast('💾 Base restaurée ('+new Date(s.ts).toLocaleString('fr-FR')+')');renderAdmin()}
function exportBackup(){download('sauvegarde-base-kev-fusion.json',{type:'KF-BACKUP',backups:ls.get('backups',[]),current:snapshot()})}
/* ---- auth admin MAJ ---- */
async function upAuth(){if(S.upUnlocked)return true;const pw=$('#upPass')?$('#upPass').value:'';
 if(await sha256(pw)===ADMIN_HASH){S.upUnlocked=true;toast('🔓 Mises à jour déverrouillées (admin)');return true}
 toast('❌ Mot de passe admin requis (Kevin83600)');return false}
/* ---- aspiration par source ---- */
async function sourceForModule(m){const out={kb:[],veh:{},ph:[],rec:[]};const origin=location.origin;let u;try{u=new URL(moduleUrl(m))}catch(e){return out}
 if(u.origin!==origin)return out;
 try{const r=await fetch(u.href,{cache:'no-store'});const html=await r.text();
  const scripts=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(x=>x[1]);
  const targets=[u.href,...scripts.map(s=>new URL(s,u.href).href).filter(s=>{try{return new URL(s).origin===origin}catch(e){return false}})];
  for(const t of targets.slice(0,10)){let code;try{const rr=await fetch(t,{cache:'no-store'});code=await rr.text()}catch(e){continue}if(code.length>4000000)continue;
   extractArrays(code).forEach(a=>{const c=classify(a);out.kb.push(...c.kb);for(const b in c.veh){out.veh[b]=out.veh[b]||{};for(const mm in c.veh[b])out.veh[b][mm]=[...new Set([...(out.veh[b][mm]||[]),...c.veh[b][mm]])]}out.ph.push(...c.ph);out.rec.push(...c.rec)})}}catch(e){log('warn','upSrc '+m.k+' '+e.message)}
 return out}
function combine(parts){const out={kb:[],veh:{},ph:[],rec:[]};parts.forEach(p=>{if(!p)return;out.kb.push(...(p.kb||[]));out.ph.push(...(p.ph||[]));out.rec.push(...(p.rec||[]));for(const b in (p.veh||{})){out.veh[b]=out.veh[b]||{};for(const m in p.veh[b])out.veh[b][m]=[...new Set([...(out.veh[b][m]||[]),...p.veh[b][m]])]}});return out}
function stats(k,m){const s=ls.get('upStats',{});s[k]={ts:Date.now(),...m};ls.set('upStats',s)}
async function updateOne(k){if(!await upAuth())return;const m=MODULES.find(x=>x.k===k);if(!m){toast('Module inconnu');return}
 toast('🔄 MAJ '+m.n+'…');backup();
 try{const out=await sourceForModule(m);const mg=mergeAsp(out);stats(k,mg);
  toast(`✅ ${m.n} : +${mg.kb} pannes · +${mg.veh} marques · +${mg.ph} photos (sauvegarde auto)`,6000);log('info','MAJ '+k+' '+JSON.stringify(mg));renderAdmin()}
 catch(e){toast('MAJ : '+e.message);log('error','MAJ '+k+' '+e.message)}}
async function updateAll(){if(!await upAuth())return;toast('🔄 Mise à jour globale…');backup();
 try{const parts=[aspLocal().out,await aspIDB(),await aspSource()];
  try{const c=await Sync.resolve();parts.push(await Sync.pull(c))}catch(e){}
  const out=combine(parts);const mg=mergeAsp(out);stats('all',mg);
  toast(`✅ MAJ globale : +${mg.kb} pannes · +${mg.veh} marques · +${mg.ph} photos · +${mg.rec} rappels (sauvegarde auto)`,7000);log('info','MAJ all '+JSON.stringify(mg));renderAdmin()}
 catch(e){toast('MAJ globale : '+e.message);log('error','MAJ all '+e.message)}}
/* ---- partage aux tiers (admin seul) ---- */
async function shareToTiers(){if(!await upAuth())return;
 const payload={shared:true,ts:Date.now(),version:UP_VERSION,kb:ls.get('kbx',[]),veh:ls.get('vehx',{}),ph:PHall(),rec:ls.get('recx',[])};
 const how=[];
 if(S.db&&S.adminCloud){try{await S.db.ref('sharedBase').set(payload);how.push('cloud')}catch(e){toast('Cloud refus : '+e.message)}}
 try{const c=await Sync.resolve();const r=await fetch(Sync.url(c),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(r.ok)how.push('canal '+c.service)}catch(e){}
 S.cfg.sharedUpdate={ts:payload.ts,counts:{kb:payload.kb.length,veh:Object.keys(payload.veh).length,ph:payload.ph.length,rec:payload.rec.length}};
 await publishCfg();ls.set('lastShared',payload.ts);
 download('partage-maj-tiers.json',payload);
 toast('📡 Mises à jour partagées aux tiers ('+(how.join(', ')||'fichier')+')',6000);renderAdmin()}
async function receiveUpdates(auto){let shared=null;
 if(S.db){try{const s=await S.db.ref('sharedBase').get();shared=s.val()}catch(e){}}
 if(!shared||!shared.shared){try{const c=await Sync.resolve();const r=await fetch(Sync.url(c),{cache:'no-store'});if(r.ok){const j=await r.json();if(j&&j.shared)shared=j}}catch(e){}}
 if(!shared||!shared.ts)return false;
 const last=ls.get('lastReceived',0);if(shared.ts<=last)return false;
 const mg=mergeAsp({kb:shared.kb||[],veh:shared.veh||{},ph:shared.ph||[],rec:shared.rec||[]});
 ls.set('lastReceived',shared.ts);
 toast('🔄 Mise à jour partagée reçue : +'+mg.kb+' pannes · +'+mg.veh+' marques',6000);
 if(!auto&&S.view==='home')renderHome();return true}
/* ---- panneau admin ---- */
const _ra=window.renderAdmin;
window.renderAdmin=function(){_ra();const v=$('#view');if(!v)return;
 const backups=ls.get('backups',[]);const st=ls.get('upStats',{});const sh=S.cfg.sharedUpdate;
 v.insertAdjacentHTML('beforeend',`<div class="card" style="border-color:var(--ac)">
 <h2>🔄 Mises à jour & sauvegarde locale (admin)</h2>
 <p class="mut">Réservé admin. Chaque MAJ aspire la base de l'APK et fusionne dans la base locale, avec <b>sauvegarde automatique</b> avant. Le partage aux tiers est une décision admin (bouton dédié).</p>
 <input id="upPass" type="password" placeholder="Mot de passe admin (Kevin83600)" autocomplete="off">
 <div class="row"><button class="pri" data-up="all">🔄 Tout mettre à jour</button><button data-up="backup">💾 Sauvegarder maintenant</button><button data-up="exportBackup">📤 Exporter sauvegarde</button><button data-up="importBackup">📥 Importer sauvegarde</button></div>
 <h3>Mise à jour par APK</h3>
 <div class="grid g2">${MODULES.map(m=>{const s=st[m.k];return`<div class="card"><b>${m.i} ${esc(m.n)}</b><p class="mut">${s?`+${s.kb} pannes · +${s.veh} marques · ${new Date(s.ts).toLocaleString('fr-FR')}`:'jamais'}</p><button data-up="one" data-k="${m.k}">🔄 Mettre à jour</button></div>`}).join('')}</div>
 <h3>💾 Sauvegardes locales (${backups.length})</h3>
 ${backups.length?backups.map((b,i)=>`<div class="row"><span class="mut">${new Date(b.ts).toLocaleString('fr-FR')} · ${(b.kb||[]).length} pannes · ${Object.keys(b.veh||{}).length} marques</span><button data-up="restore" data-k="${i}">↩️ Restaurer</button></div>`).join(''):'<p class="mut">Aucune sauvegarde.</p>'}
 <h3>📡 Partage aux tiers</h3>
 <p class="mut">${sh?`Dernier partage : ${new Date(sh.ts).toLocaleString('fr-FR')} · ${sh.counts.kb} pannes · ${sh.counts.veh} marques`:'Aucun partage. Les tiers ne reçoivent rien tant que tu ne partages pas.'}</p>
 <div class="row"><button class="jr" data-up="share">📡 Partager les mises à jour aux tiers</button></div>
 <p class="mut">Base locale actuelle : ${KBall().length} pannes · ${Object.keys(VEHall()).length} marques · ${PHall().length} photos · ${Rall().length} rappels.</p>
 </div>`)};
/* ---- carte tiers (accueil) ---- */
const _rh=window.renderHome;
window.renderHome=function(){_rh();const v=$('#view');if(!v)return;const sh=S.cfg.sharedUpdate;const last=ls.get('lastReceived',0);
 v.insertAdjacentHTML('beforeend',`<div class="card"><h2>🔄 Mises à jour partagées</h2>
 <p class="mut">${sh?`L'admin a partagé une base le ${new Date(sh.ts).toLocaleString('fr-FR')} (${sh.counts.kb} pannes). ${last>=sh.ts?'✅ Déjà reçue.':'📥 Disponible.'}`:'Aucune mise à jour partagée par l\'admin pour le moment.'}</p>
 <div class="row"><button class="pri" data-up="receive">📥 Recevoir la mise à jour</button></div></div>`)};
/* ---- auto-vérif : tests additionnels ---- */
const _rc=window.runChecks;
window.runChecks=async function(){await _rc();try{
 const add=[['Sauvegardes locales',()=>{const b=ls.get('backups',[]);return{st:'ok',info:b.length+' snapshot(s) · dernière '+(b[0]?new Date(b[0].ts).toLocaleString('fr-FR'):'—')}}],
 ['Mises à jour partagées',()=>{const sh=S.cfg.sharedUpdate;return{st:'ok',info:sh?'partagé le '+new Date(sh.ts).toLocaleString('fr-FR'):'aucun partage admin'}}]];
 const list=$('#checkList');
 for(const[n,fn]of add){const r=fn();S.check.results.push({name:n,...r});if(list)list.insertAdjacentHTML('beforeend',`<li class="st-${r.st}"><span>✅</span><span><b>${esc(n)}</b> — <span class="mut">${esc(r.info)}</span></span></li>`)}
}catch(e){}};
/* ---- réception auto à l'ouverture ---- */
const _ea=window.enterApp;
window.enterApp=function(){_ea();receiveUpdates(true).catch(()=>{})};
/* ---- import sauvegarde ---- */
let bkInput=null;
function ensureBkInput(){if(bkInput)return;bkInput=document.createElement('input');bkInput.type='file';bkInput.accept='application/json';bkInput.style.display='none';
 bkInput.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);
  const cur=p.current||(p.backends&&p.backends[0])||(p.kb?p:null);if(!cur)throw new Error('format invalide');
  if(confirm('Remplacer la base locale par cette sauvegarde ? (une sauvegarde auto sera créée)')){backup();
   ls.set('kbx',cur.kb||[]);ls.set('vehx',cur.veh||{});ls.set('photox',cur.ph||[]);ls.set('recx',cur.rec||[]);toast('📥 Sauvegarde importée');renderAdmin()}}catch(x){toast('Import : '+x.message)}};r.readAsText(f)});
 document.body.appendChild(bkInput)}
/* ---- dispatcher ---- */
document.addEventListener('click',async e=>{const b=e.target.closest('[data-up]');if(!b)return;const act=b.dataset.up,k=b.dataset.k;
 try{
  if(act==='all')await updateAll();
  else if(act==='one')await updateOne(k);
  else if(act==='backup'){backup();toast('💾 Sauvegarde locale créée');renderAdmin()}
  else if(act==='restore')restore(+k);
  else if(act==='exportBackup')exportBackup();
  else if(act==='importBackup'){ensureBkInput();bkInput.click()}
  else if(act==='share')await shareToTiers();
  else if(act==='receive'){const ok=await receiveUpdates(false);if(!ok)toast('Aucune nouvelle mise à jour partagée')}
 }catch(x){toast('MAJ : '+x.message);log('error','up '+x.message)}});
window.KFUpdates={backup,restore,updateOne,updateAll,shareToTiers,receiveUpdates};
})();
