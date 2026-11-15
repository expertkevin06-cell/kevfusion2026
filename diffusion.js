/* KEV FUSION 2026 — diffusion.js v3.5.0 · Diffusion tiers via GitHub Pages (sans canal ni Firebase)
   Admin : accord distanciel temps réel (publie maj-tiers.json + maj-base.json).
   Tiers : bouton GRISÉ sans accord, BLEU avec accord ; polling 15 s. */
(function(){
'use strict';
if(typeof mergeAsp!=='function'){console.warn('diffusion.js: app.js non chargé');return}
const DIFF_VERSION='3.5.0';
const TIERS_FILE='maj-tiers.json',BASE_FILE='maj-base.json';
S.diff={approval:null};
/* ---- CSS bouton gris/bleu ---- */
const st=document.createElement('style');
st.textContent='.upd-btn{width:100%;padding:14px;font-size:16px;font-weight:700;border-radius:12px;border:1px solid var(--line);background:#2a2f3a;color:#8a919e;cursor:not-allowed}.upd-btn.on{background:#2563eb;border-color:#2563eb;color:#fff;cursor:pointer}';
document.head.appendChild(st);
/* ---- config GitHub (admin) ---- */
function ghCfg(){return Object.assign({owner:'expertkevin06-cell',repo:'kev-fusion',branch:'main'},ls.get('ghCfg',{}))}
function utf8ToB64(s){const b=new TextEncoder().encode(s);let bin='';const CH=0x8000;for(let i=0;i<b.length;i+=CH)bin+=String.fromCharCode.apply(null,b.subarray(i,i+CH));return btoa(bin)}
async function ghWrite(path,obj){const c=ghCfg();const token=ls.get('ghToken','');if(!token)throw new Error('no-token');
 const api='https://api.github.com/repos/'+c.owner+'/'+c.repo+'/contents/'+path;
 let sha;try{const g=await fetch(api+'?ref='+c.branch,{headers:{Authorization:'Bearer '+token}});if(g.ok){const j=await g.json();sha=j.sha}}catch(e){}
 const body={message:'KEV FUSION — '+path,content:utf8ToB64(JSON.stringify(obj)),branch:c.branch};if(sha)body.sha=sha;
 const r=await fetch(api,{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!r.ok)throw new Error('GitHub '+r.status+' (jeton invalide ou droits insuffisants)');return r.json()}
/* ---- lecture accord (tiers, sans jeton) ---- */
async function readApproval(){try{const r=await fetch('./'+TIERS_FILE+'?ts='+Date.now(),{cache:'no-store'});if(!r.ok)return null;return await r.json()}catch(e){return null}}
function updateDiffUI(){const a=S.diff.approval;const btn=$('#updBtn');const msg=$('#diffMsg');if(!btn)return;
 const last=ls.get('lastApplied',0);
 if(a&&a.approved&&a.ts>last){btn.disabled=false;btn.classList.add('on');btn.textContent='🔄 Appuyez pour mettre à jour';if(msg)msg.textContent=(a.message||'Mise à jour disponible.')+' — appuyez sur le bouton bleu.'}
 else if(a&&a.approved&&a.ts<=last){btn.disabled=true;btn.classList.remove('on');btn.textContent='✅ Base à jour';if(msg)msg.textContent='Dernière mise à jour appliquée. En attente du prochain accord admin.'}
 else{btn.disabled=true;btn.classList.remove('on');btn.textContent='🔄 Mettre à jour ma base (en attente accord admin)';if(msg)msg.textContent=(a&&a.message)?a.message:'En attente de l\'accord de l\'administrateur…'}}
async function poll(){S.diff.approval=await readApproval();updateDiffUI()}
async function receive(){const a=await readApproval();S.diff.approval=a;
 if(!a||!a.approved){toast('⛔ Pas d\'accord admin pour le moment');updateDiffUI();return false}
 const last=ls.get('lastApplied',0);if(a.ts<=last){toast('✅ Déjà à jour');updateDiffUI();return false}
 const r=await fetch('./'+BASE_FILE+'?ts='+Date.now(),{cache:'no-store'});if(!r.ok){toast('Base indisponible ('+r.status+')');return false}
 const j=await r.json();const m=mergeAsp({kb:j.kb||[],veh:j.veh||{},ph:j.ph||[],rec:j.rec||[]});
 ls.set('lastApplied',a.ts);toast('🔄 Mise à jour appliquée : +'+m.kb+' pannes · +'+m.veh+' marques · +'+m.ph+' photos',6000);
 updateDiffUI();if(S.view==='home')renderHome();return true}
/* ---- admin : accord / retrait ---- */
function basePayload(){return{ts:Date.now(),version:DIFF_VERSION,kb:ls.get('kbx',[]),veh:ls.get('vehx',{}),ph:PHall(),rec:ls.get('recx',[])}}
async function publish(){if(S.role!=='admin'){toast('Réservé admin');return}
 const message=($('#diffMessage')?$('#diffMessage').value.trim():'')||'Mise à jour disponible : appuyez sur le bouton.';
 const base=basePayload();const approval={approved:true,ts:Date.now(),version:DIFF_VERSION,message,counts:{kb:base.kb.length,veh:Object.keys(base.veh).length,ph:base.ph.length,rec:base.rec.length},base:BASE_FILE};
 const token=ls.get('ghToken','');
 if(token){try{toast('📡 Publication GitHub…');await ghWrite(BASE_FILE,base);await ghWrite(TIERS_FILE,approval);
   ls.set('lastShared',approval.ts);toast('🟢 Accord donné + base publiée (temps réel tiers)',6000);renderAdmin();return}catch(e){toast('GitHub : '+e.message+' → mode manuel');}}
 manual(approval,base)}
function manual(approval,base){download(BASE_FILE,base);download(TIERS_FILE,approval);
 const c=ghCfg();window.open('https://github.com/'+c.owner+'/'+c.repo+'/upload/'+c.branch,'_blank','noopener');
 toast('📥 2 fichiers téléchargés. Commit-les à la racine du dépôt pour diffuser l\'accord.',8000)}
async function revoke(){if(S.role!=='admin'){toast('Réservé admin');return}
 const approval={approved:false,ts:Date.now(),version:DIFF_VERSION,message:'Accord retiré par l\'administrateur.'};
 const token=ls.get('ghToken','');
 if(token){try{await ghWrite(TIERS_FILE,approval);toast('🔴 Accord retiré (bouton tiers gris)');renderAdmin();return}catch(e){toast('GitHub : '+e.message)}}
 download(TIERS_FILE,approval);const c=ghCfg();window.open('https://github.com/'+c.owner+'/'+c.repo+'/upload/'+c.branch,'_blank','noopener');toast('📥 Commit maj-tiers.json pour retirer l\'accord.',7000)}
/* ---- UI tiers (accueil) ---- */
const _rh=window.renderHome;
window.renderHome=function(){_rh();const v=$('#view');if(!v)return;
 v.insertAdjacentHTML('beforeend',`<div class="card"><h2>🔄 Mise à jour de la base</h2>
 <p id="diffMsg" class="mut">En attente de l'accord de l'administrateur…</p>
 <button id="updBtn" class="upd-btn" disabled data-diff="receive">🔄 Mettre à jour ma base (en attente accord admin)</button>
 <div class="row" style="margin-top:8px"><button data-diff="check">↻ Vérifier l'accord</button></div>
 <p class="mut">Le bouton reste grisé sans accord admin ; il passe en bleu dès l'accord, puis redevient gris une la mise à jour appliquée.</p></div>`);
 updateDiffUI()};
/* ---- UI admin ---- */
const _ra=window.renderAdmin;
window.renderAdmin=function(){_ra();const v=$('#view');if(!v)return;const c=ghCfg();const lsShared=ls.get('lastShared',0);
 v.insertAdjacentHTML('beforeend',`<div class="card" style="border-color:var(--ac)">
 <h2>📡 Diffusion tiers — sans canal ni Firebase (GitHub)</h2>
 <p class="mut">Ton accord est publié dans <b>maj-tiers.json</b> + la base dans <b>maj-base.json</b> à la racine du dépôt. Les tiers interrogent en temps réel : bouton gris → bleu dès ton accord.</p>
 <div class="grid g3"><div><label>Owner</label><input id="ghOwner" value="${esc(c.owner)}"></div><div><label>Repo</label><input id="ghRepo" value="${esc(c.repo)}"></div><div><label>Branche</label><input id="ghBranch" value="${esc(c.branch)}"></div></div>
 <label>Jeton GitHub (fine-grained, contents:write) — stocké uniquement sur cet appareil admin</label><input id="ghToken" type="password" value="${esc(ls.get('ghToken',''))}" placeholder="github_pat_…">
 <label>Message affiché aux tiers</label><input id="diffMessage" value="${esc(ls.get('diffMessage',''))}" placeholder="Mise à jour disponible : appuyez sur le bouton.">
 <div class="row"><button data-diff="saveGh">💾 Enregistrer config</button><button class="jr" data-diff="publish">🟢 Donner l'accord + publier</button><button class="danger" data-diff="revoke">🔴 Retirer l'accord</button><button data-diff="test">🧪 Tester lecture</button></div>
 <p class="mut">${lsShared?`Dernier accord : ${new Date(lsShared).toLocaleString('fr-FR')}`:'Aucun accord publié.'} · Sans jeton : téléchargement des 2 fichiers + commit manuel.</p></div>`)};
/* ---- auto-vérif ---- */
const _rc=window.runChecks;
window.runChecks=async function(){await _rc();try{const a=await readApproval();const r={st:'ok',info:a?(a.approved?'accord admin actif ('+new Date(a.ts).toLocaleString('fr-FR')+')':'accord retiré'):'maj-tiers.json absent (aucun accord)'};
 S.check.results.push({name:'Diffusion tiers (GitHub)',...r});const list=$('#checkList');if(list)list.insertAdjacentHTML('beforeend',`<li class="st-ok"><span>✅</span><span><b>Diffusion tiers (GitHub)</b> — <span class="mut">${esc(r.info)}</span></span></li>`)}catch(e){}};
/* ---- dispatcher ---- */
document.addEventListener('click',async e=>{const b=e.target.closest('[data-diff]');if(!b)return;const act=b.dataset.diff;
 try{
  if(act==='receive')await receive();
  else if(act==='check'){await poll();toast(S.diff.approval&&S.diff.approval.approved?'🟢 Accord admin actif':'⏳ Pas d\'accord admin')}
  else if(act==='saveGh'){ls.set('ghCfg',{owner:$('#ghOwner').value.trim(),repo:$('#ghRepo').value.trim(),branch:$('#ghBranch').value.trim()});ls.set('ghToken',$('#ghToken').value.trim());ls.set('diffMessage',$('#diffMessage').value.trim());toast('💾 Config GitHub enregistrée (admin)')}
  else if(act==='publish'){ls.set('diffMessage',$('#diffMessage')?$('#diffMessage').value.trim():'');await publish()}
  else if(act==='revoke')await revoke();
  else if(act==='test'){const a=await readApproval();toast(a?'🧪 maj-tiers.json lu : '+(a.approved?'accord actif':'accord retiré'):'🧪 maj-tiers.json absent')}
 }catch(x){toast('Diffusion : '+x.message)}});
/* ---- polling temps réel ---- */
function startPolling(){poll();setInterval(poll,15000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()});
 window.addEventListener('online',poll)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startPolling);else startPolling();
window.KFDiffusion={publish,revoke,receive,poll,readApproval};
})();
