/* KEV FUSION 2026 — app.js v3.0.0 · tout intégré nativement */
'use strict';
const VERSION='3.0.0';
const ADMIN_HASH='e5682532ab2709e2d15f265baef5e1668513ed68d808ba55fe0b5f6e98f2ec61';
const PEPPER='6eb2cb140545f6f0ea5073e0d9edec82';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls={get(k,d){try{const v=JSON.parse(localStorage.getItem('kf_'+k));return v??d}catch(e){return d}},set(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){log('error','storage '+e.message)}}};
async function sha256(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);
const today8=()=>new Date().toISOString().slice(0,10).replace(/-/g,'');
function toast(m,ms=3200){const t=$('#toast');t.textContent=m;t.classList.remove('hid');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.add('hid'),ms)}
function download(name,obj){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([typeof obj==='string'?obj:JSON.stringify(obj,null,2)],{type:typeof obj==='string'?'text/plain':'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
const S={role:null,prenom:'',access:null,cfg:Object.assign({opacity:55,apkUrl:'',contact:'',revoked:{},wall:null,anim:true},ls.get('cfg',{})),logs:[],check:null,dtc:[],net:{},db:null,auth:null,adminCloud:false,swReg:null,deferred:null,bt:{dev:null,chW:null,buf:'',wait:null},openMod:null,doss:null,veh:null,aspUnlocked:false,jr:{dom:'quotidien',role:'demandeur',result:null,tab:'analyse',photos:[]}};
function log(l,m){S.logs.push({t:new Date().toISOString(),l,m:String(m).slice(0,300)});if(S.logs.length>120)S.logs.shift()}
window.addEventListener('error',e=>log('error',(e.message||'')+' @'+(e.filename||'').split('/').pop()+':'+e.lineno));
window.addEventListener('unhandledrejection',e=>log('error','Promise '+((e.reason&&e.reason.message)||e.reason)));
const KBall=()=>KB.concat(ls.get('kbx',[]));
const VEHall=()=>{const x=ls.get('vehx',{});const o={};for(const b in VEH)o[b]=Object.assign({},VEH[b]);for(const b in x){o[b]=o[b]||{};Object.assign(o[b],x[b])}return o};
const PHall=()=>ls.get('photox',[]);
const Rall=()=>RECALLS.concat(ls.get('recx',[]));
const ALLTEXTS=()=>LEGAL.concat(JR_TEXTS);
const txtById=id=>ALLTEXTS().find(x=>x.id===id);
/* ---- connectivité ---- */
function netState(){const c=navigator.connection;const on=navigator.onLine;let l,cl;
 if(!on){l='⛔ Hors ligne · cache';cl='off'}else if(c&&c.type==='wifi'){l='📶 WiFi';cl='on'}
 else if(c&&c.type==='cellular'){l='📡 '+((c.effectiveType||'4g').toUpperCase());cl='on'}
 else{l='🌐 En ligne'+(c&&c.effectiveType?' '+c.effectiveType.toUpperCase():' 4G/5G/WiFi');cl='on'}
 S.net={on,type:c?c.type:'?',eff:c?c.effectiveType:'?',down:c?c.downlink:'?',rtt:c?c.rtt:'?'};
 const ch=$('#netChip');ch.textContent=l;ch.className='chip '+cl;return S.net}
async function heartbeat(){try{const r=await fetch('manifest.webmanifest?hb='+Date.now(),{cache:'no-store'});S.net.real=r.ok}catch(e){S.net.real=false}netState()}
function initNet(){netState();heartbeat();setInterval(heartbeat,30000);['online','offline'].forEach(ev=>window.addEventListener(ev,()=>{netState();toast(navigator.onLine?'✅ Réseau rétabli':'⛔ Hors ligne — cache');if(navigator.onLine)heartbeat()}));const c=navigator.connection;if(c&&c.addEventListener)c.addEventListener('change',netState)}
/* ---- cloud ---- */
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error(src));document.head.appendChild(s)})}
async function ensureCloud(){if(S.db)return true;const C=globalThis.KF_FIREBASE;if(!C||!C.enabled||!C.apiKey)return false;
 try{const b='https://www.gstatic.com/firebasejs/10.12.2/';await loadScript(b+'firebase-app-compat.js');await loadScript(b+'firebase-database-compat.js');await loadScript(b+'firebase-auth-compat.js');if(C.vapidKey)await loadScript(b+'firebase-messaging-compat.js');
  firebase.initializeApp(C);S.auth=firebase.auth();if(!S.auth.currentUser)await S.auth.signInAnonymously();S.db=firebase.database();
  S.db.ref('config').on('value',s=>{Object.assign(S.cfg,s.val()||{});ls.set('cfg',S.cfg);applyWall()});log('info','cloud ok');return true}catch(e){log('error','cloud '+e.message);return false}}
async function adminCloudLogin(em,pw){if(!await ensureCloud()){toast('Cloud non configuré');return false}try{await S.auth.signInWithEmailAndPassword(em,pw);S.adminCloud=true;listenAdminCloud();regToken();toast('🛡️ Admin cloud ok');return true}catch(e){toast('Refus : '+e.message);return false}}
function listenAdminCloud(){if(!S.db)return;S.db.ref('requests').on('value',s=>{S.reqs=s.val()||{};if(S.view==='admin')renderAdmin()});
 S.db.ref('requests').on('child_added',s=>{const r=s.val();if(r&&r.status==='pending'&&Date.now()-r.ts<120000)notify('📨 Demande d\'accès',r.prenom)});
 S.db.ref('bugs').on('value',s=>{S.bugsCloud=s.val()||{};if(S.view==='admin')renderAdmin()})}
async function regToken(){try{const C=globalThis.KF_FIREBASE;if(!C.vapidKey||!firebase.messaging)return;if(Notification.permission!=='granted')await Notification.requestPermission();const t=await firebase.messaging().getToken({vapidKey:C.vapidKey,serviceWorkerRegistration:S.swReg});if(t)S.db.ref('adminTokens/'+t).set({ts:Date.now()})}catch(e){log('warn','FCM '+e.message)}}
function notify(t,b){if(!('Notification'in window))return;if(Notification.permission==='granted'){try{new Notification(t,{body:b,icon:'icon-192.png'})}catch(e){S.swReg&&S.swReg.showNotification(t,{body:b,icon:'icon-192.png'})}}else if(Notification.permission!=='denied')Notification.requestPermission()}
/* ---- accès ---- */
async function sigFor(p,e){return(await sha256(PEPPER+'|'+p.toLowerCase()+'|'+e)).slice(0,8)}
async function makeCode(p,days){const d=new Date(Date.now()+days*864e5);const e=d.toISOString().slice(0,10).replace(/-/g,'');const s=await sigFor(p,e);return{code:`KF1-${p}-${e}-${s}`,prenom:p,exp:e,sig:s}}
async function validAccess(a){if(!a||!a.prenom||!a.exp||!a.sig)return false;if(a.exp<today8())return false;if(S.cfg.revoked[a.sig])return false;return(await sigFor(a.prenom,a.exp))===a.sig}
async function doRequest(){const p=$('#gPrenom').value.trim().replace(/[^A-Za-zÀ-ÿ0-9 -]/g,'').slice(0,24);if(!p){toast('Indique ton prénom');return}S.prenom=p;
 if(await ensureCloud()){try{const rid=S.db.ref('requests').push().key;const dev=S.auth.currentUser.uid;await S.db.ref('requests/'+rid).set({prenom:p,deviceId:dev,ts:Date.now(),status:'pending'});ls.set('rid',rid);$('#reqZone').innerHTML='<p class="mut">📨 Demande envoyée. En attente…</p>';
  S.db.ref('requests/'+rid).on('value',async s=>{const r=s.val();if(!r)return;if(r.status==='approved'&&await validAccess(r)){S.access={prenom:r.prenom,exp:r.exp,sig:r.sig};ls.set('access',S.access);notify('✅ Accès accordé',r.prenom);enterApp()}if(r.status==='refused')$('#reqZone').innerHTML='<p class="st-fail">❌ Refusée.</p>'});toast('📨 Envoyée');return}catch(e){log('error','req '+e.message)}}
 const rc='R-'+uid().slice(0,8).toUpperCase();const txt=`DEMANDE KEV FUSION — Prénom : ${p} — Réf : ${rc}`;S._reqTxt=txt;
 $('#reqZone').innerHTML=`<div class="card"><p class="mut">${esc(txt)}</p><div class="row"><button data-act="shareReq">📤 Partager</button><button data-act="copyReq">📋 Copier</button></div><p class="mut">Kevin renverra un code KF1-…</p></div>`}
async function doValCode(){const p=$('#gCode').value.trim().split('-');if(p.length!==4||p[0]!=='KF1'){toast('Format KF1-Prenom-AAAAMMJJ-xxxxxxxx');return}const a={prenom:p[1],exp:p[2],sig:p[3]};if(await validAccess(a)){S.access=a;ls.set('access',a);toast('🔓 Bienvenue '+a.prenom);enterApp()}else toast('❌ Invalide/expiré/révoqué')}
async function doAdminLogin(){const v=$('#gPass')?$('#gPass').value:($('#mPass')?$('#mPass').value:'');if(await sha256(v)===ADMIN_HASH){S.role='admin';ls.set('session',{ts:Date.now()});closeModal();toast('🛡️ Admin activé');enterApp();switchView('admin')}else{toast('❌ Mot de passe incorrect');log('warn','admin échec')}}
/* ---- auto-vérif ---- */
async function fetchStatus(u,ms=6000){const c=new AbortController();const h=setTimeout(()=>c.abort(),ms);try{const r=await fetch(u,{signal:c.signal,cache:'no-store'});clearTimeout(h);return{ok:r.ok,st:r.status}}catch(e){clearTimeout(h);try{await fetch(u,{mode:'no-cors'});return{ok:true,st:'opaque'}}catch(e2){return{ok:false,st:'injoignable'}}}}
async function runChecks(){const list=$('#checkList');list.innerHTML='';$('#verdict').textContent='';$('#btnEnter').disabled=true;const res=[];
 const tests=[
 ['Base technique fusion',async()=>({st:KBall().length>=50?'ok':'warn',info:KBall().length+' pannes'})],
 ['Catalogue juridique',async()=>({st:ALLTEXTS().length>=50?'ok':'warn',info:ALLTEXTS().length+' articles'})],
 ['Rappels / TSB',async()=>({st:'ok',info:Rall().length+' campagnes'})],
 ['Catalogue véhicules',async()=>{const v=VEHall();const m=Object.values(v).reduce((a,x)=>a+Object.keys(x).length,0);return{st:'ok',info:Object.keys(v).length+' marques · '+m+' modèles'}}],
 ['Moteur VIN (WMI)',async()=>({st:Object.keys(WMI).length>=80?'ok':'warn',info:Object.keys(WMI).length+' WMI'})],
 ['Catalogue photos',async()=>({st:'ok',info:PHall().length+' photo(s)'})],
 ['JusteRepère (analyseur)',async()=>({st:JR_RULES.length>=10?'ok':'warn',info:JR_DOMAINS.length+' domaines · '+JR_RULES.length+' règles · '+Object.keys(JR_DOCS).length+' modèles'})],
 ['Guide Juridix auto',async()=>({st:'ok',info:Object.keys(PROCEDURES).length+' procédures'})],
 ['Dossiers & échéances',async()=>{const d=ls.get('dossiers',[]);const n=d.reduce((a,x)=>a+echeances(x).filter(e=>e.jours>=0&&e.jours<=30).length,0);return{st:'ok',info:d.length+' dossier(s) · '+n+' échéance(s) ≤30j'}}],
 ['Version',async()=>({st:'ok',info:'v'+VERSION})],
 ['localStorage',async()=>{localStorage.setItem('kf_t','1');localStorage.removeItem('kf_t');return{st:'ok',info:'OK'}}],
 ['IndexedDB',async()=>{await new Promise((r,j)=>{const q=indexedDB.open('kf_t',1);q.onsuccess=()=>{q.result.close();indexedDB.deleteDatabase('kf_t');r()};q.onerror=()=>j(q.error)});return{st:'ok',info:'OK'}}],
 ['HTTPS + crypto',async()=>isSecureContext&&crypto.subtle?{st:'ok',info:'OK'}:{st:'fail',info:'HTTPS requis'}],
 ['Service Worker',async()=>{const r=await navigator.serviceWorker.getRegistration();return r?{st:'ok',info:'enregistré'}:{st:'warn',info:'1er lancement'}}],
 ['Cache',async()=>{const k=await caches.keys();return k.some(x=>x.startsWith('kf2026'))?{st:'ok',info:k.find(x=>x.startsWith('kf2026'))}:{st:'warn',info:'en création'}}],
 ['Réseau réel',async()=>{await heartbeat();return S.net.real?{st:'ok',info:$('#netChip').textContent}:{st:'warn',info:'hors ligne'}}],
 ['Bluetooth OBD',async()=>navigator.bluetooth?{st:'ok',info:'disponible'}:{st:'warn',info:'non supporté'}],
 ['Notifications',async()=>!('Notification'in window)?{st:'warn',info:'non supportées'}:Notification.permission==='granted'?{st:'ok',info:'autorisées'}:{st:'warn',info:Notification.permission}],
 ['Manifest',async()=>{const r=await fetch('manifest.webmanifest?hb='+Date.now(),{cache:'no-store'});const m=await r.json();return m.name?{st:'ok',info:m.short_name}:{st:'fail',info:'illisible'}}],
 ['Fond animé véhicule',async()=>$('#scene')&&$('#car')?{st:'ok',info:'actif'}:{st:'warn',info:'absent'}],
 ['Cloud',async()=>{const C=globalThis.KF_FIREBASE;return C&&C.enabled?((await ensureCloud())?{st:'ok',info:'connecté'}:{st:'warn',info:'injoignable'}):{st:'warn',info:'mode local'}}],
 ...MODULES.map(m=>['Module '+m.n,async()=>{const r=await fetchStatus(m.u);return r.ok?{st:'ok',info:'HTTP '+r.st}:{st:'fail',info:r.st}}])];
 for(const[n,fn]of tests){let r;try{r=await fn()}catch(e){r={st:'fail',info:e.message}}res.push({name:n,...r});const li=document.createElement('li');li.innerHTML=`<span class="st-${r.st}">${r.st==='ok'?'✅':r.st==='warn'?'⚠️':'❌'}</span><span><b>${esc(n)}</b> — <span class="mut">${esc(r.info)}</span></span>`;list.appendChild(li)}
 const f=res.filter(r=>r.st==='fail').length,w=res.filter(r=>r.st==='warn').length;const v=f?'CRITIQUE — mode dégradé':w?'DÉGRADÉ — fonctionnel':'CONFORME — opérationnel';
 S.check={ts:new Date().toISOString(),version:VERSION,verdict:v,results:res,ua:navigator.userAgent};const h=ls.get('reports',[]);h.unshift(S.check);ls.set('reports',h.slice(0,10));
 $('#verdict').innerHTML=`<span class="${f?'st-fail':w?'st-warn':'st-ok'}">${f?'❌':w?'⚠️':'✅'} ${v}</span>`;$('#btnEnter').disabled=false;log('info','verif '+v)}
/* ---- fond ---- */
function applyWall(){const b=$('#bgLayer');b.style.backgroundImage=S.cfg.wall?`url(${S.cfg.wall})`:'none';b.style.opacity=(S.cfg.opacity??55)/100;document.body.classList.toggle('noanim',S.cfg.anim===false)}
function compressImg(f,max,cb){const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');const s=Math.min(1,max/Math.max(i.width,i.height));c.width=Math.round(i.width*s);c.height=Math.round(i.height*s);c.getContext('2d').drawImage(i,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',0.72))};i.src=r.result};r.readAsDataURL(f)}
async function publishCfg(){ls.set('cfg',S.cfg);applyWall();if(S.db&&S.adminCloud){try{await S.db.ref('config').set(S.cfg);toast('📡 Publié aux tiers')}catch(e){toast('Publication refusée : '+e.message)}}else toast('💾 Local — exporte le pack ou active le cloud')}
/* ---- étude croisée ---- */
function studyInput(){return{marque:$('#stMarque').value.trim(),modele:$('#stModele').value.trim(),motor:$('#stMotor').value.trim(),annee:$('#stAnnee').value,energie:$('#stEnergie').value,constats:$$('#stConstats input:checked').map(i=>i.value),dtc:($('#stDtc').value.toUpperCase().match(/[PCBU][0-9]{4}/g)||[]),vendeur:$('#stVendeur').value,achat:$('#stAchat').value,neuf:$('#stNeuf').value,prix:$('#stPrix').value,ctx:$('#stCtx').value.trim()}}
function scoreKB(inp){const txt=(inp.ctx+' '+inp.constats.join(' ')+' '+inp.motor).toLowerCase();return KBall().map(k=>{let sc=0;const why=[];
 if(k.b.includes('*')||k.b.some(b=>inp.marque&&b.toLowerCase().includes(inp.marque.toLowerCase()))){sc+=3;why.push('marque')}
 const d=k.dtc.filter(x=>inp.dtc.includes(x));if(d.length){sc+=Math.min(8,d.length*4);why.push('DTC '+d.join(','))}
 const s=k.sym.filter(x=>txt.includes(x));if(s.length){sc+=Math.min(6,s.length*2);why.push('symptômes')}
 if(inp.motor&&k.t.toLowerCase().includes(inp.motor.toLowerCase().split(' ')[0])){sc+=2;why.push('motorisation')}
 if(inp.constats.includes('incendie')&&k.f){sc+=3;why.push('incendie')}
 return{...k,sc,why}}).filter(k=>k.sc>0).sort((a,b)=>b.sc-a.sc).slice(0,6)}
function qualify(inp,top){const out=[];const mo=inp.achat?Math.floor((Date.now()-new Date(inp.achat))/2629800000):null;const grave=inp.constats.some(c=>['incendie','véhicule immobilisé'].includes(c))||(top[0]&&top[0].g==='Critique');
 if(inp.vendeur==='pro'){out.push({l:'CONSO2173',why:'Vendeur pro → garantie conformité'});if(mo!==null&&mo<=(inp.neuf==='occasion'?12:24))out.push({l:'CONSO2177',why:'Présomption antériorité ('+(inp.neuf==='occasion'?12:24)+' mois)'})}
 if(grave)out.push({l:'CC1641',why:'Défaut grave → résolution/réduction'+(inp.vendeur==='part'?' (particulier : voie principale)':'')});
 if(inp.constats.includes('après entretien')||/répar|garage|entretien/i.test(inp.ctx))out.push({l:'CC12311',why:'Réparateur → obligation de résultat'});
 if(inp.constats.includes('incendie')||/bless|brûl|dommage/i.test(inp.ctx)){out.push({l:'CC1245',why:'Défaut de sécurité produit'});out.push({l:'CONSOL4213',why:'Sécurité générale — rappels'});if(/propag|voisin|tiers/i.test(inp.ctx))out.push({l:'CC1240',why:'Dommages tiers'})}
 if(/dissimul|menti|maquill|tromp/i.test(inp.ctx))out.push({l:'CC1137',why:'Dissimulation → dol'});
 if(!out.length)out.push({l:'CC1641',why:'À qualifier selon gravité/antériorité'});
 return out.map(o=>({...LEGAL.find(x=>x.id===o.l),why:o.why}))}
function runStudy(){const inp=studyInput();if(!inp.marque&&!inp.dtc.length&&!inp.constats.length){toast('Renseigne marque, DTC ou constatations');return}
 const top=scoreKB(inp),laws=qualify(inp,top),best=top[0]?top[0].sc:0;
 const level=best>=14?'PROBABLE (faisceau fort)':best>=8?'PROBABLE':best>=4?'POSSIBLE':'INDÉTERMINÉ';
 const fires=top.filter(k=>k.f);const study={ts:new Date().toISOString(),inp,top,laws:laws.map(l=>({id:l.id,ref:l.ref,why:l.why})),level,fires:fires.map(f=>({id:f.id,t:f.t,ch:f.ch}))};
 S.study=study;const h=ls.get('studies',[]);h.unshift(study);ls.set('studies',h.slice(0,20));
 $('#stResult').innerHTML=`<div class="card"><h2>🧠 Niveau : <span class="${best>=8?'st-warn':'st-ok'}">${level}</span></h2>
 ${top.length?top.map(k=>`<div class="card"><h3>${esc(k.t)} <span class="mut">(score ${k.sc} · ${k.why.join(' · ')})</span></h3>
  <span class="badge ${k.g==='Critique'?'b-crit':k.g==='Élevé'?'b-elev':'b-mod'}">${k.g}</span>${k.f?'<span class="badge b-fire">🔥</span>':''}${k.dtc.map(d=>`<span class="badge b-dtc">${d}</span>`).join('')}
  <p><b>Mécanisme :</b> ${esc(k.mec)}</p>${k.ch?`<p class="b-fire"><b>Chaîne :</b> ${esc(k.ch)}</p>`:''}
  <p class="mut"><b>Preuves :</b> ${k.prv.join(' · ')} — <b>Tests :</b> ${k.tst.join(' · ')}</p><p class="mut"><b>Sécurité :</b> ${esc(k.sec)}</p>
  ${photosFor(k.id)}<div class="row"><button data-act="openModule" data-k="tech">🛰️ 2026tech</button><button data-act="openModule" data-k="diag">🔥 Diag</button></div></div>`).join(''):'<p class="mut">Aucune corrélation — élargir ou consulter les modules.</p>'}</div>
 <div class="card"><h2>⚖️ Qualification juridique</h2>${laws.map(l=>`<div class="card"><h3>${esc(l.t)} <span class="badge b-law">${esc(l.ref)}</span></h3><p>${esc(l.txt)}</p><p class="mut"><b>Délai :</b> ${esc(l.delai)}</p><p class="b-law">${esc(l.why)}</p></div>`).join('')}</div>
 <div class="row"><button class="pri" data-act="printReport">🖨️ PDF</button><button data-act="exportStudy">📤 JSON</button><button class="pri" data-act="dossFromStudy">📁 Dossier Juridix</button><button data-act="studyToJR">⚖️ JusteRepère</button></div>
 <p class="mut">Pré-étude croisée — ne remplace pas une expertise contradictoire.</p>`;toast('🧠 Étude générée')}
function photosFor(pid){const ph=PHall().filter(p=>p.panne===pid).slice(0,4);if(!ph.length)return'';return`<div class="grid g4">${ph.map(p=>`<img class="ph" src="${esc(p.src)}" alt="" loading="lazy">`).join('')}</div>`}
function printReport(){const s=S.study;if(!s){toast('Lance une étude');return}
 $('#printArea').innerHTML=`<h1>🔥 KEV FUSION — Étude croisée</h1><p>${new Date(s.ts).toLocaleString('fr-FR')} · v${VERSION} · ${esc(S.role==='admin'?'Kevin (admin)':S.prenom)}</p>
 <h2>1. Véhicule</h2><p>${esc(s.inp.marque)} ${esc(s.inp.modele)} ${esc(s.inp.motor)} ${esc(s.inp.annee)} · ${esc(s.inp.energie)} · vendeur ${s.inp.vendeur} · achat ${esc(s.inp.achat||'?')} · ${esc(s.inp.prix||'?')} €</p>
 <p>Constatations : ${s.inp.constats.map(esc).join(', ')||'—'} · DTC : ${s.inp.dtc.join(', ')||'—'}</p><p>${esc(s.inp.ctx)}</p>
 <h2>2. Technique (${esc(s.level)})</h2>${s.top.map(k=>`<p><b>${esc(k.t)}</b> (score ${k.sc}) — ${esc(k.mec)}<br>Conséquences : ${k.cons.map(esc).join(' ; ')}<br>Preuves : ${k.prv.map(esc).join(' ; ')} · Tests : ${k.tst.map(esc).join(' ; ')}<br>Sécurité : ${esc(k.sec)}</p>`).join('')}
 <h2>3. Chaînes incendie</h2>${s.fires.length?s.fires.map(f=>`<p>🔥 <b>${esc(f.t)}</b> : ${esc(f.ch)}</p>`).join(''):'<p>Aucune.</p>'}
 <h2>4. Juridique</h2>${s.laws.map(l=>{const x=LEGAL.find(y=>y.id===l.id);return`<p><b>${esc(x.t)}</b> — ${esc(x.ref)}<br>${esc(x.txt)}<br>Délai : ${esc(x.delai)}<br>Cas : ${esc(l.why)}</p>`}).join('')}
 <h2>5. Méthode</h2><p>Qualifier→Inférer→Corréler→Analyser→Tester→Conclure. Aide à l'expertise.</p>`;
 document.body.classList.add('printing');window.print();setTimeout(()=>document.body.classList.remove('printing'),800)}
/* ---- VIN ---- */
function vinCheckDigit(v){const tr={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9};const w=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];let sum=0;for(let i=0;i<17;i++){const c=v[i];const n=/[0-9]/.test(c)?+c:tr[c];if(n===undefined)return null;sum+=n*w[i]}const r=sum%11;return r===10?'X':''+r}
function vinYear(c){const i=YEARCODE.indexOf(c);if(i<0)return null;const now=new Date().getFullYear();const cands=[1980+i,2010+i].filter(y=>y<=now+1);return cands.length?Math.max(...cands):null}
function vinCountry(c){if(/[1-5]/.test(c))return'Amérique du Nord';if(/[6-7]/.test(c))return'Océanie';if(/[8-9]/.test(c))return'Amérique du Sud';if(/[A-H]/.test(c))return'Afrique';if(/[J-R]/.test(c))return'Asie';if(/[S-Z]/.test(c))return'Europe';return'Inconnu'}
function decodeVIN(raw){const v=raw.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,'');if(v.length!==17)return{err:'VIN = 17 caractères (hors I,O,Q). Reçu : '+v.length};
 const wmi3=v.slice(0,3),wmi2=v.slice(0,2);const w=WMI[wmi3]||WMI[wmi2]||null;const cd=vinCheckDigit(v);
 return{vin:v,wmi:wmi3,make:w?w[0]:null,country:w?w[1]:vinCountry(v[0]),year:vinYear(v[9]),plant:v[10],serial:v.slice(11),checkDigit:cd,checkOk:cd===null?null:cd===v[8],vds:v.slice(3,9)}}
async function vinOnline(v){try{const r=await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVINValues/'+v+'?format=json');const j=await r.json();const x=(j.Results||[])[0]||{};const keep=['Make','Model','ModelYear','EngineConfiguration','EngineCylinders','DisplacementL','FuelTypePrimary','TransmissionStyle','DriveType','BodyClass','VehicleType','PlantCity','PlantCountry','Manufacturer','Series','Trim','GVWR'];const o={};keep.forEach(k=>{if(x[k]&&x[k]!=='Not Applicable')o[k]=x[k]});return o}catch(e){return null}}
async function vinRecalls(make,model,year){const out=[];
 try{const r=await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`);const j=await r.json();(j.results||[]).slice(0,8).forEach(x=>out.push({src:'NHTSA',t:x.Component||x.Subject,d:(x.Summary||'').slice(0,200)}))}catch(e){}
 try{const r=await fetch(`https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso0/records?where=search(marque_des_produits,"${encodeURIComponent(make)}")&limit=8`);const j=await r.json();(j.results||[]).forEach(x=>out.push({src:'RappelConso',t:x.noms_des_modeles||x.libelle_affichage||x.marque_des_produits,d:(x.risques_encourus||x.motif_du_rappel||'').slice(0,200)}))}catch(e){}
 Rall().filter(r=>(r.b.includes('*')||r.b.some(b=>b.toLowerCase()===String(make).toLowerCase()))&&(!year||(year>=r.y[0]&&year<=r.y[1]))).forEach(r=>out.push({src:'Base fusion',t:r.t,d:r.risk,fire:r.fire}));return out}
async function runVin(){const raw=$('#vinIn').value.trim();const d=decodeVIN(raw);if(d.err){toast(d.err);return}S.vin=d;
 $('#vinRes').innerHTML='<div class="card"><p class="mut">⏳ Décodage NHTSA vPIC + rappels…</p></div>';
 const online=await vinOnline(d.vin);const make=(online&&online.Make)||d.make||'';const model=(online&&online.Model)||'';const year=(online&&online.ModelYear)||d.year||'';
 const recalls=(make&&model)?await vinRecalls(make,model,year):Rall().filter(r=>d.make&&r.b.includes(d.make)).map(r=>({src:'Base fusion',t:r.t,d:r.risk,fire:r.fire}));
 S.veh={marque:make,modele:model,motor:(online&&online.DisplacementL?online.DisplacementL+' L':''),annee:year,vin:d.vin};
 const rows=[['VIN',d.vin],['WMI',d.wmi+(d.make?' → '+d.make:'')],['Pays',d.country],['Année (code '+d.vin[9]+')',d.year||'?'],['Usine (pos.11)',d.plant],['N° série',d.serial],['Check digit',d.checkOk===null?'n/a':d.checkOk?'✅ valide ('+d.checkDigit+')':'⚠️ attendu '+d.checkDigit],['VDS',d.vds]];
 if(online)Object.entries(online).forEach(([k,v])=>rows.push([k,v]));
 $('#vinRes').innerHTML=`<div class="card"><h2>🔎 Identification VIN</h2><table class="kv">${rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table></div>
 <div class="card"><h2>📣 Rappels / TSB (${recalls.length})</h2>${recalls.length?recalls.map(r=>`<div class="card"><b>${r.fire?'🔥 ':''}${esc(r.t)}</b> <span class="badge">${esc(r.src)}</span><p class="mut">${esc(r.d)}</p></div>`).join(''):'<p class="mut">Aucun rappel trouvé.</p>'}
 <p class="mut">🇪🇺 <a href="https://ec.europa.eu/safety-gate-alerts/screen/search" target="_blank" rel="noopener" style="color:var(--ac2)">Safety Gate</a></p></div>
 <div class="row"><button class="pri" data-act="vinToStudy">🧠 Étudier</button><button data-act="vinToJR">⚖️ JusteRepère</button><button data-act="vinToDoss">📁 Dossier</button></div>`;
 const h=ls.get('vins',[]);h.unshift({vin:d.vin,make,model,year,ts:Date.now()});ls.set('vins',h.slice(0,12));toast('🔎 VIN décodé')}
/* ---- Juridix auto (dossiers) ---- */
function getDossiers(){return ls.get('dossiers',[])}
function saveDossier(d){const ds=getDossiers();const i=ds.findIndex(x=>x.id===d.id);d.updated=Date.now();if(i>=0)ds[i]=d;else ds.unshift(d);ls.set('dossiers',ds)}
function echeances(d){const out=[];const add=(t,dt,l)=>{if(!dt)return;out.push({t,date:dt,jours:Math.ceil((new Date(dt)-Date.now())/864e5),law:l})};const v=d.veh||{};const plus=(b,m)=>{if(!b)return null;const x=new Date(b);x.setMonth(x.getMonth()+m);return x.toISOString().slice(0,10)};
 if(d.cat==='conformite'||d.vendeur.type==='pro'){add('Fin garantie conformité (2 ans)',plus(v.achat,24),'L217-3');add('Fin présomption',plus(v.achat,v.neuf==='neuf'?24:12),'L217-7')}
 if(d.cat==='vicecache')add('Forclusion vice caché (2 ans découverte)',plus(d.decouverte,24),'1648');
 if(d.cat==='dol')add('Prescription dol (5 ans)',plus(d.decouverte,60),'1144');
 if(d.cat==='incendie')add('Produit défectueux (3 ans)',plus(d.decouverte,36),'1245-16');
 add('Prescription personnelle (5 ans)',plus(d.decouverte,60),'2224');return out.sort((a,b)=>a.jours-b.jours)}
function newDossier(pref){const d=Object.assign({id:uid(),ref:'JD-'+new Date().getFullYear()+'-'+uid().slice(0,4).toUpperCase(),titre:'Nouveau dossier',cat:'vicecache',statut:'ouvert',created:Date.now(),updated:Date.now(),client:{nom:'',adresse:'',cp:'',ville:'',tel:'',email:''},vendeur:{nom:'',adresse:'',type:'pro'},veh:{marque:'',modele:'',motor:'',annee:'',vin:'',prix:'',achat:'',neuf:'occasion'},decouverte:'',faits:'',qualifs:[],etude:null,jr:null,steps:[],preuves:[],docs:[],notes:''},pref||{});
 const P=PROCEDURES[d.cat];d.steps=P.steps.map(s=>({t:s.t,d:s.d,docs:s.docs,status:'todo',note:''}));d.preuves=P.preuves.map(t=>({t,ok:false}));d.qualifs=P.law.slice();return d}
function dossProgress(d){return Math.round(d.steps.filter(s=>s.status==='done').length/Math.max(1,d.steps.length)*100)}
function renderDossiers(){const ds=getDossiers();$('#view').innerHTML=`<div class="card"><h2>📁 Juridix — Dossiers auto</h2>
 <p class="mut">Preuves → expertise → mise en demeure → médiation → tribunal. Échéances calculées, courriers générés.</p>
 <div class="row"><button class="pri" data-act="dossNew">➕ Nouveau</button><button data-act="dossExportAll">📤 Tout</button><button data-act="dossImport">📥 Importer</button><button data-act="nav" data-k="jr">⚖️ JusteRepère</button></div></div>
 ${ds.length?ds.map(d=>{const e=echeances(d).filter(x=>x.jours>=0)[0];const p=dossProgress(d);return`<div class="card"><h3>${esc(d.titre)} <span class="mut">${esc(d.ref)} · ${esc(PROCEDURES[d.cat].label)}</span></h3><div class="bar"><i style="width:${p}%"></i></div><p class="mut">${p}% · ${d.statut}${e?` · ⏳ ${esc(e.t)} : ${e.jours} j`:''}</p>
 <div class="row"><button class="pri" data-act="dossOpen" data-k="${d.id}">Ouvrir</button><button data-act="dossExport" data-k="${d.id}">📤</button><button class="danger" data-act="dossDel" data-k="${d.id}">🗑️</button></div></div>`}).join(''):'<div class="card mut">Aucun dossier.</div>'}`}
function renderDossier(d){const P=PROCEDURES[d.cat];const ech=echeances(d);
 $('#view').innerHTML=`<div class="row" style="margin-bottom:8px"><button data-act="dossBack">← Dossiers</button><b>📁 ${esc(d.titre)}</b><span class="mut">${esc(d.ref)}</span></div>
 <div class="card"><h2>${esc(P.label)}</h2><div class="grid g2">
 <div><label>Intitulé</label><input data-doss="titre" value="${esc(d.titre)}"><label>Catégorie</label><select data-doss="cat">${Object.entries(PROCEDURES).map(([k,v])=>`<option value="${k}" ${k===d.cat?'selected':''}>${v.label}</option>`).join('')}</select>
 <label>Statut</label><select data-doss="statut"><option value="ouvert" ${d.statut==='ouvert'?'selected':''}>Ouvert</option><option value="clos" ${d.statut==='clos'?'selected':''}>Clos</option></select>
 <label>Découverte du vice/dommage</label><input type="date" data-doss="decouverte" value="${esc(d.decouverte)}"></div>
 <div><label>Véhicule</label><input data-doss="veh.marque" value="${esc(d.veh.marque)}" placeholder="Marque"><input data-doss="veh.modele" value="${esc(d.veh.modele)}" placeholder="Modèle"><input data-doss="veh.motor" value="${esc(d.veh.motor)}" placeholder="Motorisation"><input data-doss="veh.vin" value="${esc(d.veh.vin)}" placeholder="VIN"><input data-doss="veh.prix" value="${esc(d.veh.prix)}" placeholder="Prix €"><label>Date d'achat</label><input type="date" data-doss="veh.achat" value="${esc(d.veh.achat)}"></div></div>
 <label>Faits</label><textarea data-doss="faits">${esc(d.faits)}</textarea></div>
 <div class="card"><h2>👤 Coordonnées</h2><div class="grid g2">
 <div><input data-doss="client.nom" value="${esc(d.client.nom)}" placeholder="Nom prénom"><input data-doss="client.adresse" value="${esc(d.client.adresse)}" placeholder="Adresse"><input data-doss="client.cp" value="${esc(d.client.cp)}" placeholder="CP"><input data-doss="client.ville" value="${esc(d.client.ville)}" placeholder="Ville"><input data-doss="client.tel" value="${esc(d.client.tel)}" placeholder="Tél"><input data-doss="client.email" value="${esc(d.client.email)}" placeholder="Email"></div>
 <div><input data-doss="vendeur.nom" value="${esc(d.vendeur.nom)}" placeholder="Vendeur/garage/producteur"><input data-doss="vendeur.adresse" value="${esc(d.vendeur.adresse)}" placeholder="Adresse destinataire"><select data-doss="vendeur.type"><option value="pro" ${d.vendeur.type==='pro'?'selected':''}>Professionnel</option><option value="part" ${d.vendeur.type==='part'?'selected':''}>Particulier</option></select></div></div></div>
 <div class="card"><h2>⏳ Échéances légales</h2>${ech.length?ech.map(e=>`<div class="ech ${e.jours<0?'bad':e.jours<=30?'warn':'ok'}"><span>${esc(e.t)} <span class="mut">(${esc(e.law)})</span></span><b>${e.jours<0?'dépassée':e.jours+' j'} · ${esc(e.date)}</b></div>`).join(''):'<p class="mut">Renseigne les dates.</p>'}</div>
 <div class="card"><h2>🧭 Procédure pas à pas</h2>${d.steps.map((s,i)=>`<div class="step ${s.status}"><button class="stbtn" data-act="dossStep" data-k="${i}">${s.status==='done'?'✅':s.status==='doing'?'🔄':'☐'}</button>
 <div style="flex:1"><b>${esc(s.t)}</b><p class="mut">${esc(s.d)}</p><input data-doss="steps.${i}.note" value="${esc(s.note||'')}" placeholder="Note/date/réf…">
 ${s.docs&&s.docs.length?`<div class="row">${s.docs.map(k=>`<button data-act="dossDoc" data-k="${k}">✉️ ${esc(TEMPLATES[k].n)}</button>`).join('')}</div>`:''}</div></div>`).join('')}</div>
 <div class="card"><h2>🗂️ Preuves</h2>${d.preuves.map((p,i)=>`<label class="row" style="gap:8px"><input type="checkbox" data-act="dossPreuve" data-k="${i}" ${p.ok?'checked':''} style="width:auto"> ${esc(p.t)}</label>`).join('')}</div>
 ${d.etude?`<div class="card"><h2>🧠 Étude liée</h2><p class="mut">${esc(d.etude.level)} · ${d.etude.top.map(k=>esc(k.t)).join(' · ')}</p>${d.etude.fires.length?`<p class="b-fire">🔥 ${d.etude.fires.map(f=>esc(f.ch)).join(' ; ')}</p>`:''}</div>`:''}
 ${d.jr?`<div class="card"><h2>⚖️ Analyse JusteRepère liée</h2><p class="mut">${esc(d.jr.level)} · ${esc(d.jr.parties.map(p=>p[0]).join(' · '))}</p></div>`:''}
 <div class="card"><h2>✉️ Documents (${d.docs.length})</h2>${d.docs.map((doc,i)=>`<div class="card"><b>${esc(doc.n)}</b> <span class="mut">${new Date(doc.ts).toLocaleString('fr-FR')}</span>
 <div class="row"><button data-act="dossViewDoc" data-k="${i}">👁️</button><button data-act="dossCopyDoc" data-k="${i}">📋</button><button data-act="dossTxtDoc" data-k="${i}">⬇️.txt</button><button data-act="dossPrintDoc" data-k="${i}">🖨️</button></div></div>`).join('')||'<p class="mut">Génère un courrier depuis les étapes.</p>'}</div>
 <div class="row"><button class="pri" data-act="dossPrint" data-k="${d.id}">🖨️ Dossier PDF</button><button data-act="dossExport" data-k="${d.id}">📤 JSON</button></div>
 <p class="mut">Aide à la constitution de dossier — ne remplace pas un avocat.</p>`}
function openDossier(id){const d=getDossiers().find(x=>x.id===id);if(!d){toast('Introuvable');return}S.doss=d;renderDossier(d)}
function genDoc(k){const d=S.doss;if(!d)return;d.docs.unshift({key:k,n:TEMPLATES[k].n,ts:Date.now(),text:TEMPLATES[k].fn(d)});saveDossier(d);renderDossier(d);toast('✉️ Courrier généré')}
function printDossier(d){const P=PROCEDURES[d.cat];$('#printArea').innerHTML=`<h1>📁 Dossier Juridix — ${esc(d.titre)}</h1><p>${esc(d.ref)} · ${esc(P.label)}</p>
 <h2>Véhicule</h2><p>${esc(d.veh.marque)} ${esc(d.veh.modele)} ${esc(d.veh.motor)} · VIN ${esc(d.veh.vin)} · achat ${esc(d.veh.achat)} · ${esc(d.veh.prix)} €</p>
 <h2>Faits</h2><p>${esc(d.faits)}</p><h2>Échéances</h2>${echeances(d).map(e=>`<p>${esc(e.t)} (${esc(e.law)}) : ${esc(e.date)} — ${e.jours<0?'dépassée':e.jours+' j'}</p>`).join('')}
 <h2>Procédure</h2>${d.steps.map(s=>`<p>[${s.status==='done'?'FAIT':s.status==='doing'?'EN COURS':'À FAIRE'}] ${esc(s.t)} — ${esc(s.note||'')}</p>`).join('')}
 <h2>Preuves</h2>${d.preuves.map(p=>`<p>${p.ok?'☑':'☐'} ${esc(p.t)}</p>`).join('')}
 <h2>Fondements</h2>${P.law.map(id=>{const x=LEGAL.find(y=>y.id===id);return x?`<p><b>${esc(x.t)}</b> — ${esc(x.ref)}. ${esc(x.txt)} Délai : ${esc(x.delai)}</p>`:''}).join('')}
 <h2>Documents</h2>${d.docs.map(doc=>`<h3>${esc(doc.n)}</h3><pre>${esc(doc.text)}</pre>`).join('')}`;
 document.body.classList.add('printing');window.print();setTimeout(()=>document.body.classList.remove('printing'),800)}
function alertEcheances(){const soon=[];getDossiers().forEach(d=>echeances(d).forEach(e=>{if(e.jours>=0&&e.jours<=30)soon.push(d.ref+' : '+e.t+' ('+e.jours+' j)')}));
 if(soon.length&&ls.get('alertDay','')!==today8()){ls.set('alertDay',today8());notify('⏳ Échéances juridiques',soon.slice(0,3).join(' · '));toast('⏳ '+soon.length+' échéance(s) ≤30 j',5000)}}
/* ---- JUSTEREPÈRE (natif, fidèle aux captures) ---- */
function parseFRDate(s){s=String(s||'');let m=s.match(/(\d{4})-(\d{2})-(\d{2})/);if(m)return new Date(+m[1],+m[2]-1,+m[3]);
 m=s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)return new Date(+m[3],+m[2]-1,+m[1]);
 const months=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
 m=s.toLowerCase().match(/(\d{1,2})\s+([a-zûéè]+)\s+(\d{4})/);if(m){const mi=months.findIndex(x=>m[2].startsWith(x.slice(0,4))||x.startsWith(m[2].slice(0,4)));if(mi>=0)return new Date(+m[3],mi,+m[1])}
 return null}
function jrAnalyze(form){
 const txt=(form.faits+' '+form.titre+' '+form.impliques).toLowerCase();
 const scored=JR_RULES.map(r=>{let sc=0;if(r.dom===form.dom)sc+=3;r.keys.forEach(k=>{if(txt.includes(k))sc+=2});return Object.assign({},r,{sc})}).filter(r=>r.sc>0).sort((a,b)=>b.sc-a.sc);
 const top=scored.slice(0,3);const parties=[],texts=new Set(),steps=[],moyens=[],preuves=[],prejudice=[],defense=[];
 top.forEach(r=>{r.parties.forEach(p=>{if(!parties.find(x=>x[0]===p[0]))parties.push(p)});r.texts.forEach(t=>texts.add(t));r.steps.forEach(s=>{if(!steps.find(x=>x[0]===s[0]))steps.push(s)});r.moyens.forEach(m=>{if(!moyens.includes(m))moyens.push(m)});r.preuves.forEach(p=>{if(!preuves.includes(p))preuves.push(p)});r.prejudice.forEach(p=>{if(!prejudice.find(x=>x[0]===p[0]))prejudice.push(p.slice())});(r.defense||[]).forEach(d=>{if(!defense.includes(d))defense.push(d)})});
 if(!top.length){parties.push(['À identifier','Décrire les faits pour qualifier','CC1240']);texts.add('CC1240');texts.add('CC1353');
  steps.push(['Constituer les preuves','Rassembler et dater.','—','',0],['Mise en demeure LRAR','Faits et demande.','15 jours','lrar',15],['Médiation/conciliation','Gratuit.','—','mediation',0],['Tribunal','Assignation complète.','—','assignation',0]);
  moyens.push('Responsabilité à qualifier selon les faits (1240 C. civ.)');preuves.push('Toutes pièces datées');prejudice.push(['Préjudice','À chiffrer',0])}
 JR_DEFENSE_COMMON.forEach(d=>{if(!defense.includes(d))defense.push(d)});
 const level=top.length?(top[0].sc>=7?'Faisceau fort':top[0].sc>=4?'Responsabilité probable':'Piste à vérifier'):'Indéterminé — préciser les faits';
 const base=parseFRDate(form.dateLieu);
 const calendrier=steps.map(s=>{let date=null,jours=null;if(base&&s[4]){const d=new Date(base);d.setDate(d.getDate()+s[4]);date=d.toISOString().slice(0,10);jours=Math.ceil((d-Date.now())/864e5)}return{t:s[0],d:s[1],delai:s[2],doc:s[3],date,jours}});
 const vehPannes=form.vehMarque?scoreKB({marque:form.vehMarque.split(' ')[0],modele:form.vehMarque,motor:form.vehMotor,ctx:form.faits,constats:[],dtc:[]}):[];
 return{id:uid(),ref:'JR-'+new Date().getFullYear()+'-'+uid().slice(0,4).toUpperCase(),ts:Date.now(),form,dom:form.dom,role:form.role,desc:form.faits,titre:form.titre,dateLieu:form.dateLieu,impliques:form.impliques,partie:form.partie,photos:S.jr.photos.slice(),top,parties,texts:[...texts],steps,moyens,preuves,prejudice,defense,calendrier,vehPannes,level,totalPrejudice:0}}
function jrHist(){return ls.get('jr_history',[])}
function jrSave(r){const h=jrHist();h.unshift(r);ls.set('jr_history',h.slice(0,30))}
function renderJR(){
 $('#view').innerHTML=`<div class="card" style="border-color:var(--jr)">
  <div class="row"><span style="font-size:26px">⚖️</span><div><b style="font-size:18px">JusteRepère</b><p class="mut" style="color:var(--jr2)">Comprendre. Agir. Se protéger.</p></div></div>
  <h1 style="margin-top:8px">Qui est responsable dans votre situation ?</h1>
  <p class="mut">Décrivez votre problème pour obtenir une lecture claire des responsabilités possibles, des textes applicables et des prochaines démarches.</p>
  <div class="row" style="margin-top:8px"><button data-jr="tab" data-k="analyse" class="${S.jr.tab==='analyse'?'jr':''}">🤖 Analyse</button><button data-jr="tab" data-k="textes" class="${S.jr.tab==='textes'?'jr':''}">📚 Base de textes</button><button data-jr="tab" data-k="hist" class="${S.jr.tab==='hist'?'jr':''}">🕘 Historique</button><button data-jr="tab" data-k="docs" class="${S.jr.tab==='docs'?'jr':''}">✉️ Modèles</button><button data-jr="openModule">📁 Module JusteRepère</button></div>
 </div><div id="jrBody"></div>`;
 if(S.jr.tab==='analyse')jrAnalyseView();else if(S.jr.tab==='textes')jrTextesView();else if(S.jr.tab==='hist')jrHistView();else jrDocsView()}
function jrAnalyseView(){const f=(S.jr.result&&S.jr.result.form)||{};
 $('#jrBody').innerHTML=`<div class="card"><h2>Quel domaine concerne votre problème ?</h2>
 <div class="grid g2">${JR_DOMAINS.map(d=>`<button class="domcard ${S.jr.dom===d.k?'sel':''}" data-jr="dom" data-k="${d.k}"><b>${d.i} ${d.n}</b><br><span class="mut">${d.d}</span></button>`).join('')}</div>
 <label style="margin-top:10px">Titre du problème</label><input id="jrTitre" value="${esc(f.titre||'')}" placeholder="Ex. Dégât des eaux chez mon voisin">
 <label>Date et lieu</label><input id="jrDateLieu" value="${esc(f.dateLieu||'')}" placeholder="Ex. 4 août 2026, Lyon">
 <div class="card"><h3>Quel véhicule est impliqué ?</h3><p class="mut">La marque, le modèle et la motorisation permettent de rechercher les pannes et défauts connus sur ce véhicule précis.</p>
  <label>Marque et modèle</label><input id="jrVehMarque" value="${esc(f.vehMarque||(S.veh?S.veh.marque+' '+S.veh.modele:''))}" placeholder="Ex. Renault Trafic 2">
  <label>Motorisation et année</label><input id="jrVehMotor" value="${esc(f.vehMotor||(S.veh?(S.veh.motor||'')+', '+(S.veh.annee||''):''))}" placeholder="Ex. 2.0 dCi 115, 2009"></div>
 <label>Que s'est-il passé ?</label><textarea id="jrFaits" placeholder="Décrivez les faits dans l'ordre, les dommages et les démarches déjà effectuées…">${esc(f.faits||'')}</textarea>
 <label>Qui est impliqué ?</label><input id="jrImpliques" value="${esc(f.impliques||'')}" placeholder="Ex. Moi, mon voisin, le syndic et mon assureur">
 <div class="card"><h3>Dans ce dossier, vous êtes…</h3>
  <div class="grid g2"><button class="rolecard ${S.jr.role==='demandeur'?'sel':''}" data-jr="role" data-k="demandeur"><b>🎯 Demandeur</b><br><span class="mut">Je réclame réparation, un remboursement ou un droit.</span></button>
  <button class="rolecard ${S.jr.role==='defenseur'?'sel':''}" data-jr="role" data-k="defenseur"><b>⚔️ Défenseur</b><br><span class="mut">On me réclame quelque chose et je dois y répondre.</span></button></div>
  <label style="margin-top:8px">Quelle partie représentez-vous ?</label><input id="jrPartie" value="${esc(f.partie||'')}" placeholder="Ex. Moi-même, le garage, mon entreprise…">
  <p class="mut">${S.jr.role==='demandeur'?'Le rapport construit la stratégie du demandeur : moyens à soulever, preuves à réunir, chiffrage du préjudice et calendrier des démarches.':'Le rapport construit la stratégie du défenseur : moyens de défense, contestation des preuves, réponse au chiffrage et calendrier de réponse.'}</p></div>
 <div class="card"><h3>Photos du litige</h3><p class="mut">Prenez ou choisissez vos photos : elles sont jointes automatiquement au compte rendu PDF.</p>
  <div class="drop" data-jr="addPhoto">📷 Ajouter des photos</div>
  <div id="jrPhotos" class="grid g4" style="margin-top:8px">${S.jr.photos.map((p,i)=>`<div><img class="ph" src="${esc(p)}"><button class="danger" data-jr="delPhoto" data-k="${i}" style="margin-top:4px">🗑️</button></div>`).join('')}</div></div>
 <label>Vos nom / ville (courriers)</label><input id="jrNom" value="${esc(f.nom||'')}" placeholder="Nom Prénom — Ville">
 <button class="jr" data-jr="analyze" style="width:100%;padding:14px;font-size:16px">Analyser ma situation →</button>
 </div><div id="jrRes">${S.jr.result?jrResultHTML(S.jr.result):''}</div>
 <div class="card"><h2>📊 Tableau de bord</h2><div class="grid g3">
  <div class="card"><div class="stat">${jrHist().length}</div><div class="mut">analyses</div></div>
  <div class="card"><div class="stat">${getDossiers().length}</div><div class="mut">dossiers</div></div>
  <div class="card"><div class="stat">${ALLTEXTS().length}</div><div class="mut">textes</div></div></div></div>`}
function jrResultHTML(r){const isDef=r.role==='defenseur';
 return`<div class="card"><h2>🧭 ${esc(r.titre||'Analyse')} — <span class="${r.level.includes('fort')||r.level.includes('probable')?'st-warn':'st-ok'}">${esc(r.level)}</span></h2>
 <p class="mut">${esc(JR_DOMAINS.find(d=>d.k===r.dom)?.n||r.dom)} · ${esc(r.dateLieu||'')} · ${isDef?'⚔️ Défenseur':'🎯 Demandeur'}${r.partie?' · '+esc(r.partie):''}</p>
 <p class="mut">${esc(r.top.map(t=>t.title).join(' · ')||'Situation générique')}</p></div>
 <div class="card"><h2>👥 Responsabilités possibles</h2>${r.parties.map(p=>{const t=txtById(p[2]);return`<div class="card"><b>${esc(p[0])}</b><p>${esc(p[1])}</p>${t?`<span class="badge b-law">${esc(t.ref)}</span>`:''}</div>`}).join('')}</div>
 <div class="card"><h2>${isDef?'🛡️ Moyens de défense':'⚖️ Moyens à soulever'}</h2><ul style="padding-left:18px">${(isDef?r.defense:r.moyens).map(m=>`<li>${esc(m)}</li>`).join('')}</ul></div>
 <div class="card"><h2>📜 Textes applicables</h2>${r.texts.map(id=>{const t=txtById(id);return t?`<div class="card"><h3>${esc(t.t)} <span class="badge b-law">${esc(t.ref)}</span></h3><p>${esc(t.txt)}</p><p class="mut">Délai : ${esc(t.delai)}</p></div>`:''}).join('')}</div>
 <div class="card"><h2>🗂️ Preuves à réunir</h2>${r.preuves.map(p=>`<label class="row" style="gap:8px"><input type="checkbox" style="width:auto"> ${esc(p)}</label>`).join('')}</div>
 <div class="card"><h2>💶 Chiffrage du préjudice ${isDef?'(à contester)':''}</h2>
  <table class="kv"><tr><td>Poste</td><td>Méthode</td><td>Montant €</td></tr>
  ${r.prejudice.map((p,i)=>`<tr><td>${esc(p[0])}</td><td class="mut">${esc(p[1])}</td><td><input type="number" data-jr="chiffre" data-k="${i}" value="${p[2]||0}" style="width:110px;margin:0"></td></tr>`).join('')}</table>
  <p style="margin-top:8px"><b>Total : <span id="jrTotal">${r.prejudice.reduce((a,p)=>a+(+p[2]||0),0)}</span> €</b> <span class="mut">(indicatif — justificatifs requis)</span></p></div>
 <div class="card"><h2>🗓️ Calendrier des démarches</h2>${r.calendrier.map((s,i)=>`<div class="step"><b>${i+1}.</b><div style="flex:1"><b>${esc(s.t)}</b><p class="mut">${esc(s.d)}${s.delai!=='—'?' · ⏳ '+esc(s.delai):''}${s.date?` · 📅 ${esc(s.date)} (${s.jours<0?'dépassé':s.jours+' j'})`:''}</p>${s.doc?`<button data-jr="doc" data-k="${s.doc}">✉️ ${esc(JR_DOCS[s.doc].n)}</button>`:''}</div></div>`).join('')}</div>
 ${r.vehPannes&&r.vehPannes.length?`<div class="card"><h2>🚗 Pannes connues du véhicule</h2>${r.vehPannes.map(k=>`<div class="card"><b>${esc(k.t)}</b> <span class="badge ${k.g==='Critique'?'b-crit':'b-elev'}">${k.g}</span>${k.f?'<span class="badge b-fire">🔥</span>':''}<p class="mut">${esc(k.mec)}</p></div>`).join('')}</div>`:''}
 ${r.photos&&r.photos.length?`<div class="card"><h2>📷 Photos du litige</h2><div class="grid g4">${r.photos.map(p=>`<img class="ph" src="${esc(p)}">`).join('')}</div></div>`:''}
 <div class="row"><button class="jr" data-jr="toDossier">📁 Créer un dossier</button><button data-jr="doc" data-k="${isDef?'reponse':'lrar'}">✉️ ${isDef?'Réponse en défense':'Mise en demeure'}</button><button data-jr="pdf">🖨️ PDF (avec photos)</button><button data-jr="json">📤 JSON</button><button data-jr="notify">🔔 Alertes délais</button></div>
 <p class="mut">Lecture d'orientation juridique — ne remplace pas un avocat. Vérifiez les textes et délais à jour.</p>`}
function jrTextesView(){$('#jrBody').innerHTML=`<div class="card"><h2>📚 Base de textes (${ALLTEXTS().length})</h2><input id="jrTq" placeholder="Rechercher (article, mot-clé, domaine)…"><div id="jrTlist"></div></div>`;
 const draw=()=>{const q=($('#jrTq').value||'').toLowerCase();const list=ALLTEXTS().filter(t=>!q||(t.t+' '+t.ref+' '+t.txt+' '+(t.dom||'')).toLowerCase().includes(q));
  $('#jrTlist').innerHTML=list.map(t=>`<div class="card"><h3>${esc(t.t)} <span class="badge b-law">${esc(t.ref)}</span>${t.dom?`<span class="badge">${esc(t.dom)}</span>`:''}</h3><p>${esc(t.txt)}</p><p class="mut">Délai : ${esc(t.delai)}</p></div>`).join('')};
 draw();$('#jrTq').addEventListener('input',draw)}
function jrHistView(){const h=jrHist();$('#jrBody').innerHTML=`<div class="card"><h2>🕘 Historique (${h.length})</h2>${h.length?h.map(r=>`<div class="card"><b>${esc(r.titre||r.ref)}</b> <span class="mut">${new Date(r.ts).toLocaleString('fr-FR')} · ${esc(JR_DOMAINS.find(d=>d.k===r.dom)?.n||r.dom)} · ${r.role==='defenseur'?'⚔️':'🎯'}</span><p class="mut">${esc((r.desc||'').slice(0,140))}</p><div class="row"><button data-jr="reload" data-k="${r.id}">↻ Rouvrir</button><button class="danger" data-jr="delHist" data-k="${r.id}">🗑️</button></div></div>`).join(''):'<p class="mut">Aucune analyse.</p>'}</div>`}
function jrDocsView(){$('#jrBody').innerHTML=`<div class="card"><h2>✉️ Modèles de documents</h2><p class="mut">Courriers adaptés à ta situation (remplis depuis l'analyse).</p><div class="grid g2">${Object.entries(JR_DOCS).map(([k,v])=>`<button data-jr="doc" data-k="${k}">✉️ ${esc(v.n)}</button>`).join('')}</div></div>`}
function jrForm(){return{dom:S.jr.dom,role:S.jr.role,titre:$('#jrTitre')?$('#jrTitre').value.trim():'',dateLieu:$('#jrDateLieu')?$('#jrDateLieu').value.trim():'',vehMarque:$('#jrVehMarque')?$('#jrVehMarque').value.trim():'',vehMotor:$('#jrVehMotor')?$('#jrVehMotor').value.trim():'',faits:$('#jrFaits')?$('#jrFaits').value.trim():'',impliques:$('#jrImpliques')?$('#jrImpliques').value.trim():'',partie:$('#jrPartie')?$('#jrPartie').value.trim():'',nom:$('#jrNom')?$('#jrNom').value.trim():''}}
function jrClient(){const n=(S.jr.result&&S.jr.result.form.nom)||($('#jrNom')?$('#jrNom').value:'');const p=String(n).split('—');return{nom:(p[0]||'').trim(),ville:(p[1]||'').trim(),adresse:'',cp:'',tel:'',email:''}}
function jrDocData(){const r=S.jr.result||{parties:[],texts:[],desc:($('#jrFaits')?$('#jrFaits').value:''),defense:JR_DEFENSE_COMMON};return{ref:r.ref||'JR',desc:r.desc||'',dateLieu:r.dateLieu||'',client:jrClient(),dest:(r.parties&&r.parties[0]?r.parties[0][0]:'')}}
function jrGenDoc(key){const r=S.jr.result||jrAnalyze(jrForm());const text=JR_DOCS[key].fn(jrDocData(),r);
 openModal('<h2>✉️ '+esc(JR_DOCS[key].n)+'</h2><pre class="doc">'+esc(text)+'</pre><div class="row"><button data-jr="copyDoc">📋 Copier</button><button data-jr="txtDoc" data-k="'+key+'">⬇️ .txt</button><button data-jr="printDoc" data-k="'+key+'">🖨️ PDF</button><button data-act="closeModal">Fermer</button></div>');
 S.jr._doc=text}
function jrPDF(){const r=S.jr.result;if(!r){toast('Lance une analyse');return}const isDef=r.role==='defenseur';
 $('#printArea').innerHTML=`<h1>⚖️ JusteRepère — ${esc(r.titre||r.ref)}</h1><p>${new Date(r.ts).toLocaleString('fr-FR')} · ${esc(JR_DOMAINS.find(d=>d.k===r.dom)?.n||r.dom)} · ${esc(r.dateLieu||'')} · ${isDef?'Défenseur':'Demandeur'}${r.partie?' · '+esc(r.partie):''} · ${esc(r.level)}</p>
 <h2>Situation</h2><p>${esc(r.desc)}</p>${r.impliques?`<p>Impliqués : ${esc(r.impliques)}</p>`:''}
 <h2>Responsabilités possibles</h2>${r.parties.map(p=>`<p><b>${esc(p[0])}</b> — ${esc(p[1])}</p>`).join('')}
 <h2>${isDef?'Moyens de défense':'Moyens à soulever'}</h2>${(isDef?r.defense:r.moyens).map(m=>`<p>• ${esc(m)}</p>`).join('')}
 <h2>Textes applicables</h2>${r.texts.map(id=>{const t=txtById(id);return t?`<p><b>${esc(t.t)}</b> — ${esc(t.ref)}. ${esc(t.txt)} Délai : ${esc(t.delai)}</p>`:''}).join('')}
 <h2>Preuves à réunir</h2>${r.preuves.map(p=>`<p>☐ ${esc(p)}</p>`).join('')}
 <h2>Chiffrage du préjudice</h2>${r.prejudice.map(p=>`<p>${esc(p[0])} (${esc(p[1])}) : ${+p[2]||0} €</p>`).join('')}<p><b>Total : ${r.prejudice.reduce((a,p)=>a+(+p[2]||0),0)} €</b> (indicatif)</p>
 <h2>Calendrier des démarches</h2>${r.calendrier.map((s,i)=>`<p>${i+1}. ${esc(s.t)} — ${esc(s.d)}${s.delai!=='—'?' (délai : '+esc(s.delai)+')':''}${s.date?' · '+esc(s.date):''}</p>`).join('')}
 ${r.vehPannes&&r.vehPannes.length?`<h2>Pannes connues du véhicule</h2>${r.vehPannes.map(k=>`<p><b>${esc(k.t)}</b> — ${esc(k.mec)}</p>`).join('')}`:''}
 ${r.photos&&r.photos.length?`<h2>Photos du litige</h2>${r.photos.map(p=>`<img src="${esc(p)}">`).join('')}`:''}
 <p><i>Lecture d'orientation — ne remplace pas un avocat.</i></p>`;
 document.body.classList.add('printing');window.print();setTimeout(()=>document.body.classList.remove('printing'),800)}
function jrToDossier(){const r=S.jr.result;if(!r){toast('Lance une analyse');return}
 const d=newDossier({cat:'autre',titre:(r.titre||JR_DOMAINS.find(x=>x.k===r.dom)?.n||'Litige')+' — '+r.ref,faits:r.desc,qualifs:r.texts.filter(id=>LEGAL.find(l=>l.id===id)),veh:{marque:(r.form.vehMarque||'').split(' ')[0],modele:r.form.vehMarque||'',motor:r.form.vehMotor||'',vin:S.vin?S.vin.vin:'',prix:'',achat:'',neuf:'occasion'}});
 d.jr=r;saveDossier(d);S.doss=d;switchView('dossiers');openDossier(d.id);toast('📁 Dossier créé depuis JusteRepère')}
function jrNotify(){const r=S.jr.result;if(!r){toast('Lance une analyse');return}const soon=r.calendrier.filter(s=>s.jours!==null&&s.jours>=0&&s.jours<=30);
 if(soon.length){notify('⏳ Délais JusteRepère',soon.map(s=>s.t+' ('+s.jours+' j)').join(' · '));toast('🔔 '+soon.length+' délai(s) ≤30 j')}else toast('Renseigne une date valide (ex. 4 août 2026) ou aucun délai ≤30 j')}
/* ---- OBD ---- */
const UART={s:'6e400001-b5a3-f393-e0a9-e50e24dcca9e',w:'6e400002-b5a3-f393-e0a9-e50e24dcca9e',n:'6e400003-b5a3-f393-e0a9-e50e24dcca9e'};
async function obdConnect(){if(!navigator.bluetooth){toast('Web Bluetooth indisponible');return}
 try{const dev=await navigator.bluetooth.requestDevice({filters:[{services:[UART.s]},{namePrefix:'Vgate'},{namePrefix:'OBD'},{namePrefix:'ELM'},{namePrefix:'vLinker'},{namePrefix:'OBDLink'}],optionalServices:[UART.s,'0000fff0-0000-1000-8000-00805f9b34fb']});
  S.bt.dev=dev;dev.addEventListener('gattserverdisconnected',()=>{$('#btChip').classList.add('hid');toast('🔵 Déconnecté');obdReconnect(dev,3)});
  const srv=await dev.gatt.connect();for(const se of await srv.getPrimaryServices()){const chs=await se.getCharacteristics();const w=chs.find(c=>c.uuid===UART.w)||chs.find(c=>c.properties.write||c.properties.writeWithoutResponse);const n=chs.find(c=>c.uuid===UART.n)||chs.find(c=>c.properties.notify);
   if(w&&n){S.bt.chW=w;await n.startNotifications();n.addEventListener('characteristicvaluechanged',e=>{S.bt.buf+=new TextDecoder().decode(e.target.value);if(S.bt.wait&&S.bt.buf.includes('>')){S.bt.wait(S.bt.buf);S.bt.wait=null}});break}}
  if(!S.bt.chW){toast('UART introuvable');return}
  for(const c of['ATZ','ATE0','ATL0','ATSP0'])await obdCmd(c,c==='ATZ'?2500:1200);
  $('#btChip').classList.remove('hid');$('#btChip').textContent='🔵 '+(dev.name||'OBD');$('#obdStatus')&&($('#obdStatus').textContent='✅ '+(dev.name||'ELM327'));toast('🔵 OBD connecté')}catch(e){toast('BT : '+e.message)}}
async function obdReconnect(dev,t){if(!t||!S.bt.dev)return;try{await dev.gatt.connect();toast('🔵 Reconnecté')}catch(e){setTimeout(()=>obdReconnect(dev,t-1),2500)}}
function obdCmd(cmd,ms=2000){return new Promise(async res=>{S.bt.buf='';S.bt.wait=res;setTimeout(()=>{if(S.bt.wait){S.bt.wait=null;res(S.bt.buf)}},ms);try{await S.bt.chW.writeValue(new TextEncoder().encode(cmd+'\r'))}catch(e){S.bt.wait=null;res('')}})}
function decodeDTC(b){const o=[];for(let i=0;i+1<b.length;i+=2){const a=b[i],c=b[i+1];if(!a&&!c)continue;o.push('PCBU'[a>>6]+((a>>4)&3)+(a&15).toString(16).toUpperCase()+(c>>4).toString(16).toUpperCase()+(c&15).toString(16).toUpperCase())}return o}
async function obdRead(){if(!S.bt.chW){toast('Connecte l\'adaptateur');return}const r=await obdCmd('03',3000);const lines=r.split(/[\r\n]+/).map(l=>l.trim()).filter(l=>/^[0-9A-F ]+$/.test(l)&&l.replace(/ /g,'').includes('43'));let dtc=[];for(const l of lines){const h=l.replace(/ /g,'');const i=h.indexOf('43');const b=[];for(let j=i+2;j+1<h.length;j+=2)b.push(parseInt(h.substr(j,2),16));dtc=dtc.concat(decodeDTC(b))}
 S.dtc=[...new Set(dtc)];$('#obdStatus').textContent=S.dtc.length?'Défauts : '+S.dtc.join(' · '):'Aucun défaut ('+r.slice(0,50)+')';if(S.dtc.length)toast('📥 '+S.dtc.length+' défaut(s)')}
/* ---- ASPIRATION + CANAL AUTO ---- */
function classify(rec){const out={kb:[],veh:{},ph:[],rec:[]};const arr=Array.isArray(rec)?rec:[rec];
 for(const it of arr){if(!it||typeof it!=='object')continue;
  const t=it.t||it.titre||it.title||it.panne||it.nom||it.label;const dtc=it.dtc||it.DTC||it.codes;const mec=it.mec||it.mecanisme||it.mechanism||it.description;
  if(t&&(dtc||mec||it.systeme||it.system||it.gravite)){out.kb.push({id:it.id||('x'+uid().slice(0,6)),t:String(t),b:it.b||it.marques||(it.marque?[it.marque]:['*']),s:it.s||it.systeme||it.system||'Général',g:it.g||it.gravite||'Modéré',f:!!(it.f||it.incendie||it.fire),dtc:Array.isArray(dtc)?dtc:(typeof dtc==='string'?dtc.match(/[PCBU][0-9]{4}/g)||[]:[]),sym:it.sym||it.symptomes||[],mec:String(mec||''),ch:it.ch||it.chaine||'',cons:it.cons||it.consequences||[],prv:it.prv||it.preuves||[],tst:it.tst||it.tests||[],sec:it.sec||it.securite||'—',law:it.law||it.juridique||['CC1641'],src:it.src||'aspiré'});continue}
  const mk=it.marque||it.make||it.brand;const md=it.modele||it.model;const mo=it.motorisation||it.motor||it.engine||it.version;
  if(mk&&md){out.veh[mk]=out.veh[mk]||{};out.veh[mk][md]=out.veh[mk][md]||[];if(mo&&!out.veh[mk][md].includes(mo))out.veh[mk][md].push(mo);continue}
  const src=it.src||it.url||it.photo||it.image;const leg=it.leg||it.legende||it.caption;
  if(src&&(String(src).startsWith('data:image')||/\.(jpg|jpeg|png|webp|gif)/i.test(String(src)))){out.ph.push({id:uid(),panne:it.panne||it.panneId||'',leg:leg||'',src:String(src),ts:Date.now()});continue}
  if(it.risk||it.rappel||it.recall){out.rec.push({id:it.id||('r'+uid().slice(0,6)),t:t||'Rappel',b:it.b||it.marques||['*'],m:it.m||it.modeles||['*'],y:it.y||[2000,2026],fire:!!(it.fire||it.incendie),risk:it.risk||it.risque||'',dtc:it.dtc||[],src:it.src||'aspiré',law:it.law||['CONSOL4213']})}}
 return out}
function mergeAsp(o){const kb=ls.get('kbx',[]);const seen=new Set(kb.map(k=>k.t+'|'+k.dtc.join(',')));o.kb.forEach(k=>{const key=k.t+'|'+k.dtc.join(',');if(!seen.has(key)){seen.add(key);kb.push(k)}});ls.set('kbx',kb);
 const vx=ls.get('vehx',{});for(const b in o.veh){vx[b]=vx[b]||{};for(const m in o.veh[b])vx[b][m]=[...new Set([...(vx[b][m]||[]),...o.veh[b][m]])]}ls.set('vehx',vx);
 const ph=PHall();o.ph.forEach(p=>ph.push(p));ls.set('photox',ph);
 const rx=ls.get('recx',[]);o.rec.forEach(r=>rx.push(r));ls.set('recx',rx);
 return{kb:o.kb.length,veh:Object.keys(o.veh).length,ph:o.ph.length,rec:o.rec.length}}
function aspLocal(){const out={kb:[],veh:{},ph:[],rec:[]};let n=0;
 for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith('kf_'))continue;let v;try{v=JSON.parse(localStorage.getItem(key))}catch(e){continue}if(!v)continue;n++;
  const c=classify(v);out.kb.push(...c.kb);for(const b in c.veh){out.veh[b]=out.veh[b]||{};for(const m in c.veh[b])out.veh[b][m]=[...new Set([...(out.veh[b][m]||[]),...c.veh[b][m]])]}out.ph.push(...c.ph);out.rec.push(...c.rec)}
 return{out,n}}
async function aspIDB(){const out={kb:[],veh:{},ph:[],rec:[]};if(!indexedDB.databases){toast('indexedDB.databases non supporté');return out}
 for(const db of await indexedDB.databases()){if(!db.name||db.name.startsWith('kf_'))continue;
  await new Promise(res=>{const q=indexedDB.open(db.name);q.onsuccess=()=>{const d=q.result;const names=[...d.objectStoreNames];let left=names.length;if(!left){d.close();res();return}
   names.forEach(st=>{try{const tx=d.transaction(st,'readonly');const rq=tx.objectStore(st).getAll();rq.onsuccess=()=>{const c=classify(rq.result||[]);out.kb.push(...c.kb);for(const b in c.veh){out.veh[b]=out.veh[b]||{};for(const m in c.veh[b])out.veh[b][m]=[...new Set([...(out.veh[b][m]||[]),...c.veh[b][m]])]}out.ph.push(...c.ph);out.rec.push(...c.rec)};tx.oncomplete=()=>{if(--left===0){d.close();res()}};tx.onerror=()=>{if(--left===0){d.close();res()}}}catch(e){if(--left===0){d.close();res()}}})};q.onerror=()=>res()})}
 return out}
function extractArrays(code){const res=[];const re=/(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*\[/g;let m;let count=0;
 while((m=re.exec(code))&&count<40){const start=m.index+m[0].length-1;let depth=0,i=start,inStr=null;
  for(;i<code.length&&i<start+400000;i++){const c=code[i];if(inStr){if(c==='\\'){i++;continue}if(c===inStr)inStr=null;continue}
   if(c==='"'||c==="'"||c==='`'){inStr=c;continue}if(c==='[')depth++;else if(c===']'){depth--;if(depth===0)break}}
  if(depth===0){const sn=code.slice(start,i+1);if(sn.length>200){try{const val=new Function('return('+sn+')')();if(Array.isArray(val)&&val.length){res.push(val);count++}}catch(e){}}}}
 return res}
async function aspSource(){const out={kb:[],veh:{},ph:[],rec:[]};const origin=location.origin;
 for(const m of MODULES){let u;try{u=new URL(m.u)}catch(e){continue}if(u.origin!==origin)continue;
  try{const r=await fetch(m.u,{cache:'no-store'});const html=await r.text();const scripts=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(x=>x[1]);
   const targets=[m.u,...scripts.map(s=>new URL(s,m.u).href).filter(s=>new URL(s).origin===origin)];
   for(const t of targets.slice(0,8)){let code;try{const rr=await fetch(t,{cache:'no-store'});code=await rr.text()}catch(e){continue}if(code.length>3000000)continue;
    extractArrays(code).forEach(a=>{const c=classify(a);out.kb.push(...c.kb);for(const b in c.veh){out.veh[b]=out.veh[b]||{};for(const mm in c.veh[b])out.veh[b][mm]=[...new Set([...(out.veh[b][mm]||[]),...c.veh[b][mm]])]}out.ph.push(...c.ph);out.rec.push(...c.rec)})}}catch(e){log('warn','aspSource '+m.k+' '+e.message)}}
 return out}
const KV='https://kvdb.io/',JB='https://jsonblob.com/api/jsonBlob';
const Sync={
 detect(){try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith('kf_'))continue;const raw=localStorage.getItem(key)||'';
  let m=raw.match(/kvdb\.io\/([A-Za-z0-9]{12,40})/);if(m)return{service:'kvdb',bucket:m[1],key:'state',from:key};
  m=raw.match(/jsonblob\.com\/api\/jsonBlob\/([A-Za-z0-9-]+)/);if(m)return{service:'jsonblob',bucket:m[1],key:'',from:key};
  if(/kvdb|canal|channel|bucket|sync|blob/i.test(key)){let v=raw;try{const j=JSON.parse(raw);v=(j&&(j.bucket||j.code||j.canal||j.channel||j.id))||raw}catch(e){}v=String(v).replace(/["']/g,'').trim();if(/^[A-Za-z0-9]{12,40}$/.test(v))return{service:'kvdb',bucket:v,key:'state',from:key}}}}catch(e){}return null},
 async create(){try{const r=await fetch(KV,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:''});if(r.ok){const b=(await r.text()).trim().replace(/["'\s]/g,'');if(/^[A-Za-z0-9]{12,40}$/.test(b)){const c={service:'kvdb',bucket:b,key:'state',created:Date.now()};ls.set('sync',c);return c}}}catch(e){}
  try{const r=await fetch(JB,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({pannes:[],photos:[],ts:Date.now()})});if(r.ok||r.status===201){const loc=r.headers.get('Location')||'';let id=(loc.match(/jsonBlob\/([A-Za-z0-9-]+)/)||[])[1];if(!id){try{const j=await r.json();id=j.id||j.blobId}catch(e){}}if(id){const c={service:'jsonblob',bucket:id,key:'',created:Date.now()};ls.set('sync',c);return c}}}catch(e){}
  throw new Error('Création impossible (kvdb/jsonblob injoignables) → aspiration same-origin ou import dump.')},
 async resolve(manual,key){if(manual)return{service:'kvdb',bucket:manual,key:key||'state'};const s=ls.get('sync',null);if(s&&s.bucket)return s;const d=Sync.detect();if(d){ls.set('sync',d);return d}return await Sync.create()},
 url(c){return c.service==='jsonblob'?JB+'/'+c.bucket:KV+c.bucket+'/'+(c.key||'state')},
 async pull(c){const r=await fetch(Sync.url(c),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();const out={kb:[],veh:{},ph:[],rec:[]};
  const add=x=>{const cc=classify(x);out.kb.push(...cc.kb);for(const b in cc.veh){out.veh[b]=out.veh[b]||{};for(const m in cc.veh[b])out.veh[b][m]=[...new Set([...(out.veh[b][m]||[]),...cc.veh[b][m]])]}out.ph.push(...cc.ph);out.rec.push(...cc.rec)};
  if(Array.isArray(j))add(j);['pannes','photos','base','kb','rec'].forEach(k=>{if(j[k])add(j[k])});
  if(j.veh)for(const b in j.veh){out.veh[b]=out.veh[b]||{};for(const m in j.veh[b])out.veh[b][m]=[...new Set([...(out.veh[b][m]||[]),...j.veh[b][m]])]}return out},
 async push(c){const data={pannes:KBall(),base:KBall(),photos:PHall(),rec:Rall(),veh:VEHall(),ts:Date.now(),source:'KEV FUSION '+VERSION};const r=await fetch(Sync.url(c),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw new Error('HTTP '+r.status);return true}};
function flattenDump(dump){const items=[];const push=v=>{if(Array.isArray(v))items.push(...v);else if(v&&typeof v==='object')items.push(v)};
 if(dump.localStorage)for(const k in dump.localStorage){try{push(JSON.parse(dump.localStorage[k]))}catch(e){}}
 if(dump.indexedDB)for(const db in dump.indexedDB)for(const st in dump.indexedDB[db])push(dump.indexedDB[db][st]);
 if(Array.isArray(dump))push(dump);if(dump.items)push(dump.items);return items}
async function runAsp(mode){if(!S.aspUnlocked){const pw=$('#aspPass')?$('#aspPass').value:'';if(await sha256(pw)!==ADMIN_HASH){toast('❌ Mot de passe admin requis');return}S.aspUnlocked=true;toast('🔓 Aspiration déverrouillée')}
 toast('🧲 Aspiration en cours…');let out={kb:[],veh:{},ph:[],rec:[]};let info='';
 try{
  if(mode==='local'){const r=aspLocal();out=r.out;info=r.n+' clés localStorage'}
  else if(mode==='idb'){out=await aspIDB();info='IndexedDB same-origin'}
  else if(mode==='source'){out=await aspSource();info='code source modules'}
  else if(mode==='kvdb'||mode==='auto'){const c=await Sync.resolve($('#kvBucket')?$('#kvBucket').value.trim():'',$('#kvKey')?$('#kvKey').value.trim():'');out=await Sync.pull(c);ls.set('sync',c);info='canal '+c.service+':'+c.bucket}
  const m=mergeAsp(out);toast(`🧲 +${m.kb} pannes · +${m.veh} marques · +${m.ph} photos · +${m.rec} rappels (${info})`,6000);log('info','asp '+mode+' '+JSON.stringify(m));renderAdmin();
 }catch(e){toast('Aspiration : '+e.message);log('error','asp '+e.message)}}
/* ---- vues ---- */
const NAV=[['home','🏠'],['recherche','🔎 Recherche'],['etude','🧠 Étude'],['jr','⚖️ JusteRepère'],['vin','🔎 VIN'],['photos','📷 Photos'],['dossiers','📁 Dossiers'],['obd','🔵 OBD'],['modules','🧩 Modules'],['check','🛡️ Vérif'],['admin','🔐 Admin']];
function switchView(v){S.view=v;$('#nav').innerHTML=NAV.map(([k,l])=>`<button data-act="nav" data-k="${k}" class="${k===v?'act':''}">${l}</button>`).join('');
 const R={home:renderHome,recherche:renderSearch,etude:renderStudy,jr:renderJR,vin:renderVin,photos:renderPhotos,dossiers:renderDossiers,obd:renderObd,modules:renderModules,check:renderCheckView,admin:()=>{S.role==='admin'?renderAdmin():openAdminModal()}};(R[v]||renderHome)()}
function badges(k){return`<span class="badge ${k.g==='Critique'?'b-crit':k.g==='Élevé'?'b-elev':'b-mod'}">${k.g}</span>${k.f?'<span class="badge b-fire">🔥</span>':''}${k.dtc.slice(0,4).map(d=>`<span class="badge b-dtc">${d}</span>`).join('')}`}
function renderHome(){const ok=S.check?S.check.results.filter(r=>r.st==='ok').length:0;const ds=getDossiers();const soon=[];ds.forEach(d=>echeances(d).forEach(e=>{if(e.jours>=0&&e.jours<=30)soon.push({d,e})}));
 $('#view').innerHTML=`<div class="grid g3">
 <div class="card"><div class="stat">${KBall().length}</div><div class="mut">pannes 🔥</div></div>
 <div class="card"><div class="stat">${ALLTEXTS().length}</div><div class="mut">articles ⚖️</div></div>
 <div class="card"><div class="stat">${Rall().length}</div><div class="mut">rappels 📣</div></div>
 <div class="card"><div class="stat">${Object.keys(VEHall()).length}</div><div class="mut">marques 🚗</div></div>
 <div class="card"><div class="stat">${PHall().length}</div><div class="mut">photos 📷</div></div>
 <div class="card"><div class="stat">${ok}/${S.check?S.check.results.length:'—'}</div><div class="mut">contrôles ✅</div></div></div>
 ${soon.length?`<div class="card"><h2>⏳ Échéances proches</h2>${soon.slice(0,5).map(x=>`<div class="ech warn"><span>${esc(x.d.ref)} — ${esc(x.e.t)}</span><b>${x.e.jours} j</b></div>`).join('')}<button data-act="nav" data-k="dossiers">📁 Dossiers</button></div>`:''}
 <div class="card"><h2>🚀 Actions</h2><div class="row">
 <button class="jr" data-act="nav" data-k="jr">⚖️ JusteRepère</button><button class="pri" data-act="nav" data-k="etude">🧠 Étude croisée</button>
 <button data-act="nav" data-k="vin">🔎 VIN</button><button data-act="nav" data-k="dossiers">📁 Dossiers</button>
 <button data-act="nav" data-k="photos">📷 Photos</button><button data-act="nav" data-k="obd">🔵 OBD</button><button data-act="shareOpen">📤 Partager/APK</button></div></div>
 <div class="card"><h2>📡 Connexion</h2><p class="mut">${esc(JSON.stringify(S.net))} · OBD : ${S.bt.dev?'lié':'non'} · Cloud : ${S.db?'actif':'local'}</p></div>
 <div class="card mut">Fusion massive : 7 modules + base native + aspiration + JusteRepère. Fond animé véhicule. Aide à l'expertise, ne remplace pas un avis judiciaire.</div>`}
function renderSearch(){$('#view').innerHTML=`<div class="card"><h2>🔎 Recherche fusionnée</h2><input id="q" placeholder="EGR, courroie, P0016, incendie, vice caché, 3008…">
 <div class="grid g3"><select id="fSys"><option value="">Tous systèmes</option>${[...new Set(KBall().map(k=>k.s))].map(s=>`<option>${s}</option>`).join('')}</select>
 <select id="fG"><option value="">Toutes gravités</option><option>Critique</option><option>Élevé</option><option>Modéré</option></select>
 <select id="fF"><option value="">Tout</option><option value="1">🔥 Incendie</option></select></div><button class="pri" data-act="search">Rechercher</button></div><div id="qRes"></div>`;doSearch()}
function doSearch(){const q=($('#q').value||'').toLowerCase(),sys=$('#fSys').value,g=$('#fG').value,f=$('#fF').value;
 const res=KBall().filter(k=>{const blob=(k.t+' '+k.b.join(' ')+' '+k.s+' '+k.dtc.join(' ')+' '+k.mec+' '+k.sym.join(' ')).toLowerCase();return(!q||blob.includes(q))&&(!sys||k.s===sys)&&(!g||k.g===g)&&(!f||k.f)});
 const laws=ALLTEXTS().filter(l=>q&&(l.t+' '+l.ref+' '+l.txt).toLowerCase().includes(q));
 $('#qRes').innerHTML=`<p class="mut">${res.length} panne(s) · ${laws.length} article(s)</p>`+
 res.map(k=>`<div class="card"><h3>${esc(k.t)}</h3><div>${badges(k)}</div><p class="mut">${esc(k.b.join(', '))} — ${esc(k.mec)}</p>${k.ch?`<p class="b-fire">🔥 ${esc(k.ch)}</p>`:''}${photosFor(k.id)}
 <div class="row"><button data-act="studyFrom" data-k="${k.id}">🧠 Étudier</button><button data-act="openModule" data-k="tech">🛰️</button><button data-act="openModule" data-k="diag">🔥</button><button data-act="openModule" data-k="form">🎓</button></div></div>`).join('')+
 laws.map(l=>`<div class="card"><h3>⚖️ ${esc(l.t)} <span class="badge b-law">${esc(l.ref)}</span></h3><p>${esc(l.txt)}</p><p class="mut">Délai : ${esc(l.delai)}</p><div class="row"><button data-act="nav" data-k="jr">⚖️ JusteRepère</button><button data-act="dossNewCat" data-k="${CAT2LAW[l.id]||'autre'}">📁 Dossier</button></div></div>`).join('')}
function renderStudy(){const v=VEHall();$('#view').innerHTML=`<div class="card"><h2>🧠 Étude croisée</h2>
 <div class="grid g3"><div><label>Marque</label><input id="stMarque" list="brands" value="${S.veh?esc(S.veh.marque):''}"><datalist id="brands">${Object.keys(v).map(b=>`<option>${b}</option>`).join('')}</datalist></div>
 <div><label>Modèle</label><input id="stModele" value="${S.veh?esc(S.veh.modele):''}"></div><div><label>Motorisation</label><input id="stMotor" value="${S.veh?esc(S.veh.motor||''):''}"></div>
 <div><label>Année</label><input id="stAnnee" type="number" value="${S.veh?esc(S.veh.annee||''):''}"></div>
 <div><label>Énergie</label><select id="stEnergie"><option>Essence</option><option>Diesel</option><option>Hybride</option><option>Électrique</option></select></div>
 <div><label>Vendeur</label><select id="stVendeur"><option value="pro">Professionnel</option><option value="part">Particulier</option></select></div>
 <div><label>Date d'achat</label><input id="stAchat" type="date"></div><div><label>Neuf/occasion</label><select id="stNeuf"><option value="occasion">Occasion</option><option value="neuf">Neuf</option></select></div>
 <div><label>Prix €</label><input id="stPrix" type="number"></div></div>
 <label>Constatations</label><div class="constats" id="stConstats">${CONSTATS.map(c=>`<label><input type="checkbox" value="${c}">${c}</label>`).join('')}</div>
 <label>DTC</label><input id="stDtc" value="${S.dtc.join(' ')}" placeholder="P0016 P0400…"><label>Contexte</label><textarea id="stCtx"></textarea>
 <button class="pri" data-act="study">⚙️ Lancer l'étude</button></div><div id="stResult"></div>`}
function renderVin(){$('#view').innerHTML=`<div class="card"><h2>🔎 Lecture VIN complète</h2>
 <p class="mut">17 caractères. Offline : WMI/pays/année/check-digit. En ligne : NHTSA vPIC + rappels NHTSA/RappelConso.</p>
 <input id="vinIn" maxlength="17" placeholder="Ex : VF3XXXXXXXXXXXXXX" style="text-transform:uppercase;font-family:monospace">
 <div class="row"><button class="pri" data-act="vinRun">⚙️ Analyser</button><button data-act="vinPaste">📋 Coller</button>${('BarcodeDetector'in window)?'<button data-act="vinScan">📷 Scanner</button>':''}</div>
 <div id="vinRes"></div>${ls.get('vins',[]).length?`<h3>🕘 Historique</h3>${ls.get('vins',[]).map(x=>`<p class="mut"><button data-act="vinHist" data-k="${esc(x.vin)}">${esc(x.vin)}</button> ${esc(x.make||'')} ${esc(x.model||'')} ${esc(x.year||'')}</p>`).join('')}`:''}</div>`}
function renderPhotos(){const ph=PHall();$('#view').innerHTML=`<div class="card"><h2>📷 Catalogue photos</h2>
 <p class="mut">${ph.length} photo(s). Admin : upload par panne. Tous : Wikimedia Commons.</p>
 <div class="row"><input id="phQ" placeholder="Rechercher…" style="max-width:260px"><button data-act="phFilter">Filtrer</button>
 ${S.role==='admin'?'<button class="pri" data-act="phUpload">📷 Ajouter</button><button data-act="phPublish">📡 Publier</button>':''}</div>
 <div class="row"><input id="wmQ" placeholder="Wikimedia : ex Peugeot 3008 engine" style="max-width:260px"><button data-act="wmSearch">🌐 Wikimedia</button></div></div>
 <div id="phGrid" class="grid g4">${ph.map(p=>`<div class="card"><img class="ph" src="${esc(p.src)}" loading="lazy"><p class="mut">${esc(p.leg||'')} ${p.panne?'· '+esc(p.panne):''}</p>${S.role==='admin'?`<button class="danger" data-act="phDel" data-k="${p.id}">🗑️</button>`:''}</div>`).join('')||'<p class="mut">Aucune photo.</p>'}</div><div id="wmRes"></div>`}
async function wmSearch(){const q=$('#wmQ').value.trim();if(!q)return;$('#wmRes').innerHTML='<p class="mut">⏳ Wikimedia…</p>';
 try{const r=await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`);const j=await r.json();const pages=Object.values((j.query&&j.query.pages)||{});
  $('#wmRes').innerHTML=`<div class="card"><h3>🌐 Wikimedia Commons</h3><div class="grid g4">${pages.map(p=>{const ii=p.imageinfo&&p.imageinfo[0];if(!ii)return'';return`<div class="card"><img class="ph" src="${esc(ii.thumburl||ii.url)}" loading="lazy"><p class="mut">${esc(p.title.replace('File:',''))}</p>${S.role==='admin'?`<button data-act="wmAdd" data-k="${esc(ii.url)}" data-t="${esc(p.title)}">➕ Base</button>`:''}</div>`}).join('')}</div></div>`}
 catch(e){$('#wmRes').innerHTML='<p class="st-fail">Wikimedia : '+esc(e.message)+'</p>'}}
function renderObd(){$('#view').innerHTML=`<div class="card"><h2>🔵 OBD Bluetooth ELM327 BLE</h2><p class="mut">Contact mis, moteur à l'arrêt. Chrome Android.</p>
 <div class="row"><button class="pri" data-act="obdConnect">🔗 Connecter</button><button data-act="obdRead">📥 Lire défauts</button><button data-act="obdInject">🧠 Injecter étude</button></div>
 <p id="obdStatus" class="mut">${S.bt.dev?'Connecté : '+esc(S.bt.dev.name||'OBD'):'Non connecté.'}</p></div>`}
function renderModules(){if(S.openMod){const m=MODULES.find(x=>x.k===S.openMod);$('#view').innerHTML=`<div class="row" style="margin-bottom:8px"><button data-act="closeModule">← Modules</button><b>${m.i} ${esc(m.n)}</b><button data-act="reloadModule">↻</button><a href="${m.u}" target="_blank" rel="noopener"><button>↗ Externe</button></a>${m.k==='juridix'?'<button data-act="jrOpen">🔑 Admin (copie MDP)</button>':''}</div>
 <iframe class="mod" id="modFrame" src="${m.u}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"></iframe>
 <p class="mut">Écran vide ou portail d'accès → « ↗ Externe ». JusteRepère : mot de passe admin Kevin83600.</p>`;return}
 const st={};(S.check?S.check.results:[]).forEach(r=>{const m=MODULES.find(x=>r.name==='Module '+x.n);if(m)st[m.k]=r});
 $('#view').innerHTML=`<div class="grid g2">${MODULES.map(m=>{const r=st[m.k];return`<div class="card"><h3>${m.i} ${esc(m.n)}</h3><p class="mut">${esc(m.d)}</p><p class="${r?(r.st==='ok'?'st-ok':'st-fail'):'mut'}">${r?(r.st==='ok'?'✅':'❌')+' '+esc(r.info):'⏳'}</p>
 <div class="row"><button class="pri" data-act="openModule" data-k="${m.k}">Intégré</button><a href="${m.u}" target="_blank" rel="noopener"><button>↗</button></a></div></div>`}).join('')}</div>`}
function renderCheckView(){const r=S.check;$('#view').innerHTML=`<div class="card"><h2>🛡️ Auto-vérification</h2><p>${r?new Date(r.ts).toLocaleString('fr-FR'):'—'} — <b>${r?esc(r.verdict):''}</b></p>
 <button class="pri" data-act="rerunCheck">↻ Relancer</button><button data-act="exportCheck">📤 Rapport</button></div>
 <div class="card"><ul id="checkList2">${r?r.results.map(x=>`<li class="st-${x.st}">${x.st==='ok'?'✅':x.st==='warn'?'⚠️':'❌'} <b>${esc(x.name)}</b> — <span class="mut">${esc(x.info)}</span></li>`).join(''):''}</ul></div>`}
/* ---- admin ---- */
function openAdminModal(){openModal(`<h2>🛡️ Connexion admin</h2><label>Mot de passe</label><input id="mPass" type="password"><div class="row"><button class="pri" data-act="adminLogin">🔑 Entrer</button><button data-act="closeModal">Annuler</button></div>`)}
function renderAdmin(){const reqs=S.reqs||{};const bugs=Object.entries(S.bugsCloud||{}).map(([id,b])=>({id,...b})).concat(ls.get('bugs',[]));const issued=ls.get('issued',[]);const sync=ls.get('sync',null);
 $('#view').innerHTML=`<div class="card"><h2>🛡️ Administration</h2><p class="mut">Cloud : ${S.db?(S.adminCloud?'✅ admin':'⚠️ anonyme'):'local'} · <button data-act="logout">Quitter</button></p>
 ${S.db&&!S.adminCloud?`<div class="row"><input id="acEmail" placeholder="Email Firebase" style="max-width:220px"><input id="acPass" type="password" placeholder="MDP Firebase" style="max-width:180px"><button data-act="adminCloud">☁️ Connexion</button></div>`:''}</div>
 <div class="card"><h2>🧲 Aspiration massive (mot de passe admin)</h2>
 <p class="mut">localStorage + IndexedDB + code source (same-origin) + canal auto + import dump. Cross-origin (lovable/base44) : snippet console puis import dump.</p>
 <input id="aspPass" type="password" placeholder="Mot de passe admin (Kevin83600)" autocomplete="off">
 <div class="row"><button class="pri" data-act="asp" data-k="local">🧲 localStorage</button><button data-act="asp" data-k="idb">🗄️ IndexedDB</button><button data-act="asp" data-k="source">📜 Code source</button><button data-act="baseImport">📥 Import JSON</button><button data-act="dumpImport">📥 Import dump source</button><button data-act="baseExport">📤 Export base</button></div>
 <div class="card"><h3>🪄 Canal auto — sans code à saisir</h3>
  <p class="mut">Détecte le canal de 2026tech (same-origin), sinon crée son propre canal. Colle le code dans 2026tech → Sync → « Utiliser ».</p>
  <p class="mut">Canal : <b>${sync?esc(sync.service+':'+sync.bucket):'aucun'}</b></p>
  <div class="row"><input id="kvBucket" placeholder="Code canal (optionnel)" style="max-width:220px"><input id="kvKey" placeholder="clé (state)" style="max-width:120px"></div>
  <div class="row"><button class="pri" data-act="asp" data-k="auto">🪄 Canal auto + récupérer</button><button data-act="syncPush">📤 Publier ma base</button><button data-act="syncCopy">📋 Copier code</button><button data-act="syncNew">✨ Nouveau canal</button><button data-act="jrOpen">🔑 JusteRepère (admin)</button></div></div>
 <p class="mut">Base : ${KBall().length} pannes · ${Object.keys(VEHall()).length} marques · ${PHall().length} photos · ${Rall().length} rappels.</p></div>
 <div class="card"><h2>📨 Demandes d'accès ${S.db?'(temps réel)':'(local)'}</h2>
 ${S.db?Object.entries(reqs).map(([rid,r])=>`<div class="card"><b>${esc(r.prenom)}</b> <span class="mut">${new Date(r.ts).toLocaleString('fr-FR')} — ${esc(r.status)}</span>
 <div class="row">${r.status==='pending'?`<button class="pri" data-act="approve" data-k="${rid}">✅ 30 j</button><button class="danger" data-act="refuse" data-k="${rid}">❌</button>`:''}${r.status==='approved'?`<span class="badge b-dtc">KF1-${esc(r.prenom)}-${r.exp}-${r.sig}</span><button class="danger" data-act="revoke" data-k="${r.sig}">🚫</button>`:''}</div></div>`).join('')||'<p class="mut">Aucune.</p>':'<p class="mut">Sans cloud : demandes par message (réf R-…). Génère le code et renvoie-le.</p>'}
 <div class="grid g3"><input id="adPrenom" placeholder="Prénom"><input id="adDays" type="number" value="30" min="1"></div><button class="pri" data-act="genCode">🎟️ Générer code</button><div id="genZone"></div>
 <h3>Codes émis</h3>${issued.map(i=>`<p><span class="badge b-dtc">${esc(i.code)}</span> ${S.cfg.revoked[i.sig]?'<span class="st-fail">révoqué</span>':`<button class="danger" data-act="revoke" data-k="${i.sig}">🚫</button>`}</p>`).join('')||'<p class="mut">Aucun.</p>'}</div>
 <div class="card"><h2>🎨 Fond & apparence</h2>
 <div class="row"><button class="pri" data-act="wallPick">🖼️ Image fond</button><button data-act="wallPublish">📡 Publier</button><button class="danger" data-act="wallReset">🗑️ Reset image</button>
 <label class="row" style="gap:6px"><input type="checkbox" id="animChk" ${S.cfg.anim!==false?'checked':''} style="width:auto"> Fond animé véhicule</label></div>
 <label>Opacité image : <span id="opVal">${S.cfg.opacity??55}</span>%</label><input id="wallOp" type="range" min="10" max="90" value="${S.cfg.opacity??55}"></div>
 <div class="card"><h2>🐞 Bugs (${bugs.length})</h2>${bugs.map(b=>`<div class="card"><b>${esc(b.titre||'Bug')}</b> <span class="mut">${esc(b.grav||'')} · ${b.ts?new Date(b.ts).toLocaleString('fr-FR'):''} · ${esc(b.status||'ouvert')}</span><p class="mut">${esc((b.desc||'').slice(0,200))}</p>
 <div class="row">${b.id?`<button data-act="bugResolve" data-k="${b.id}">✅</button>`:''}<button data-act="bugDetail" data-k="${esc(b.id||b.ts)}">🔍</button></div></div>`).join('')||'<p class="mut">Aucun.</p>'}</div>
 <div class="card"><h2>📦 Diffusion</h2><label>URL APK</label><input id="apkUrl" value="${esc(S.cfg.apkUrl||'')}"><label>Email contact</label><input id="contact" value="${esc(S.cfg.contact||'')}">
 <div class="row"><button class="pri" data-act="saveCfg">💾 Publier</button><button data-act="packExport">📤 Pack</button><button data-act="packImport">📥 Import pack</button><button data-act="dossExportAll">📁 Dossiers</button></div></div>`;
 const op=$('#wallOp');op&&op.addEventListener('input',()=>{$('#opVal').textContent=op.value;S.cfg.opacity=+op.value;applyWall()});
 const an=$('#animChk');an&&an.addEventListener('change',()=>{S.cfg.anim=an.checked;applyWall()})}
/* ---- bugs ---- */
function bugContext(){return{version:VERSION,ua:navigator.userAgent,net:S.net,role:S.role,prenom:S.prenom,verif:S.check?S.check.verdict:null,check:S.check?S.check.results:null,logs:S.logs.slice(-50),view:S.view,kb:KBall().length,photos:PHall().length,dossiers:getDossiers().length,jr:jrHist().length,ts:Date.now()}}
function openBug(){openModal(`<h2>🐞 Signaler un bug</h2><label>Titre</label><input id="bugTitle" maxlength="90">
 <div class="grid g2"><div><label>Gravité</label><select id="bugGrav"><option>Bloquant</option><option>Majeur</option><option>Mineur</option></select></div>
 <div><label>Module</label><select id="bugMod"><option>Fusion</option><option>JusteRepère</option><option>VIN</option><option>Photos</option><option>Juridix</option><option>Aspiration</option>${MODULES.map(m=>`<option>${esc(m.n)}</option>`).join('')}</select></div></div>
 <label>Description</label><textarea id="bugDesc"></textarea><p class="mut">Contexte auto joint.</p>
 <div class="row"><button class="pri" data-act="bugSend">📨 Envoyer</button><button data-act="bugShare">📤 Partager</button><button data-act="closeModal">Fermer</button></div>`)}
async function sendBug(){const b={id:uid(),titre:$('#bugTitle').value.trim()||'Sans titre',grav:$('#bugGrav').value,mod:$('#bugMod').value,desc:$('#bugDesc').value.trim(),status:'ouvert',ctx:bugContext(),ts:Date.now()};if(!b.desc){toast('Décris le problème');return}
 const l=ls.get('bugs',[]);l.unshift(b);ls.set('bugs',l.slice(0,50));S._bug=b;
 if(await ensureCloud()){try{await S.db.ref('bugs/'+b.id).set(b);toast('📨 Bug transmis');closeModal();return}catch(e){log('warn','bug '+e.message)}}
 toast('💾 Enregistré — « Partager » pour envoyer');closeModal()}
/* ---- partage ---- */
function openShare(){const url=location.href.split('?')[0].split('#')[0];openModal(`<h2>📤 Partager · Télécharger</h2><input id="shareUrl" value="${esc(url)}" readonly>
 <div class="row"><button class="pri" data-act="doShare">📤 Partager</button><button data-act="copyLink">📋 Copier</button>
 ${S.cfg.apkUrl?`<a href="${esc(S.cfg.apkUrl)}" target="_blank" rel="noopener"><button class="pri">⬇️ APK Android</button></a>`:'<span class="mut">APK : URL non publiée.</span>'}</div>
 <div style="text-align:center;margin-top:10px"><img alt="QR" width="200" height="200" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" onerror="this.style.display='none'"></div>
 <div class="row"><button data-act="install">⬇️ Installer PWA</button><button data-act="closeModal">Fermer</button></div>`)}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();S.deferred=e;$('#btnInstall').classList.remove('hid')});
/* ---- modal / dispatcher ---- */
function openModal(h){$('#modalBox').innerHTML=h;$('#modal').classList.remove('hid')}
function closeModal(){$('#modal').classList.add('hid')}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
function setPath(o,p,v){const a=p.split('.');let x=o;for(let i=0;i<a.length-1;i++)x=x[a[i]];x[a[a.length-1]]=v}
document.addEventListener('change',e=>{const el=e.target;
 if(el.dataset.doss&&S.doss){const v=el.type==='checkbox'?el.checked:el.value;if(el.dataset.doss==='cat'){S.doss.cat=v;const P=PROCEDURES[v];S.doss.steps=P.steps.map(s=>({t:s.t,d:s.d,docs:s.docs,status:'todo',note:''}));S.doss.preuves=P.preuves.map(t=>({t,ok:false}));S.doss.qualifs=P.law.slice()}else setPath(S.doss,el.dataset.doss,v);
  saveDossier(S.doss);if(['cat','decouverte','veh.achat'].includes(el.dataset.doss))renderDossier(S.doss)}
 if(el.dataset.act==='dossPreuve'&&S.doss){S.doss.preuves[+el.dataset.k].ok=el.checked;saveDossier(S.doss)}
 if(el.dataset.jr==='chiffre'&&S.jr.result){S.jr.result.prejudice[+el.dataset.k][2]=+el.value||0;const tot=S.jr.result.prejudice.reduce((a,p)=>a+(+p[2]||0),0);S.jr.result.totalPrejudice=tot;const t=$('#jrTotal');if(t)t.textContent=tot;jrSave(S.jr.result)}});
async function handleAct(act,el){const k=el.dataset.k;switch(act){
 case'enter':$('#boot').classList.add('hid');await gateOrApp();break;
 case'reqAccess':await doRequest();break;case'valCode':await doValCode();break;case'adminLogin':await doAdminLogin();break;
 case'shareReq':navigator.share?navigator.share({text:S._reqTxt}).catch(()=>{}):toast('Copie');break;
 case'copyReq':await navigator.clipboard.writeText(S._reqTxt);toast('📋');break;
 case'nav':if(k==='admin'&&S.role!=='admin')openAdminModal();else switchView(k);break;
 case'search':doSearch();break;case'study':runStudy();break;
 case'studyFrom':{const kb=KBall().find(x=>x.id===k);switchView('etude');if(kb){$('#stMarque').value=kb.b[0]==='*'?'':kb.b[0];$('#stDtc').value=kb.dtc.join(' ');$('#stCtx').value=kb.t}break}
 case'printReport':printReport();break;case'exportStudy':S.study?download('etude.json',S.study):toast('Lance une étude');break;
 case'studyToJR':{if(S.study){S.jr.dom='route';S.jr.result=null;switchView('jr');setTimeout(()=>{if($('#jrVehMarque'))$('#jrVehMarque').value=S.study.inp.marque+' '+S.study.inp.modele;if($('#jrVehMotor'))$('#jrVehMotor').value=(S.study.inp.motor||'')+', '+(S.study.inp.annee||'');if($('#jrFaits'))$('#jrFaits').value=S.study.inp.ctx||S.study.top.map(x=>x.t).join(' ; ')},50)}else switchView('jr');break}
 case'dossFromStudy':{if(!S.study){toast('Lance une étude');break}const s=S.study;const cat=CAT2LAW[s.laws[0]?s.laws[0].id:'CC1641']||'autre';
  const d=newDossier({cat,titre:(s.inp.marque+' '+s.inp.modele+' — '+PROCEDURES[cat].label).trim(),veh:{marque:s.inp.marque,modele:s.inp.modele,motor:s.inp.motor,annee:s.inp.annee,vin:S.vin?S.vin.vin:'',prix:s.inp.prix,achat:s.inp.achat,neuf:s.inp.neuf},vendeur:{nom:'',adresse:'',type:s.inp.vendeur},decouverte:new Date().toISOString().slice(0,10),faits:(s.inp.ctx||'')+(s.top.length?' Constatations : '+s.top.map(x=>x.t).join(' ; '):''),etude:s});
  saveDossier(d);S.doss=d;switchView('dossiers');renderDossier(d);toast('📁 Dossier créé');break}
 case'dossNew':{const d=newDossier({});saveDossier(d);S.doss=d;renderDossier(d);break}
 case'dossNewCat':{const d=newDossier({cat:k||'autre'});saveDossier(d);S.doss=d;switchView('dossiers');renderDossier(d);break}
 case'dossOpen':openDossier(k);break;case'dossBack':S.doss=null;renderDossiers();break;
 case'dossStep':{const s=S.doss.steps[+k];s.status=s.status==='todo'?'doing':s.status==='doing'?'done':'todo';saveDossier(S.doss);renderDossier(S.doss);break}
 case'dossDoc':genDoc(k);break;
 case'dossViewDoc':{const doc=S.doss.docs[+k];openModal('<h2>✉️ '+esc(doc.n)+'</h2><pre class="doc">'+esc(doc.text)+'</pre><div class="row"><button data-act="dossCopyDoc" data-k="'+k+'">📋</button><button data-act="closeModal">Fermer</button></div>');break}
 case'dossCopyDoc':await navigator.clipboard.writeText(S.doss.docs[+k].text);toast('📋');break;
 case'dossTxtDoc':{const doc=S.doss.docs[+k];download(S.doss.ref+'-'+doc.key+'.txt',doc.text);break}
 case'dossPrintDoc':{const doc=S.doss.docs[+k];$('#printArea').innerHTML='<pre>'+esc(doc.text)+'</pre>';document.body.classList.add('printing');window.print();setTimeout(()=>document.body.classList.remove('printing'),800);break}
 case'dossPrint':{const d=getDossiers().find(x=>x.id===k)||S.doss;if(d)printDossier(d);break}
 case'dossExport':{const d=getDossiers().find(x=>x.id===k)||S.doss;if(d)download(d.ref+'.json',d);break}
 case'dossExportAll':download('dossiers-juridix.json',getDossiers());break;
 case'dossImport':$('#fileDoss').click();break;
 case'dossDel':if(confirm('Supprimer ?')){ls.set('dossiers',getDossiers().filter(x=>x.id!==k));S.doss=null;renderDossiers()}break;
 case'vinRun':await runVin();break;
 case'vinPaste':try{$('#vinIn').value=(await navigator.clipboard.readText()).trim();toast('📋 Collé')}catch(e){toast('Collage refusé')}break;
 case'vinHist':$('#vinIn').value=k;await runVin();break;
 case'vinScan':try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});const v=document.createElement('video');v.srcObject=stream;v.play();const bd=new BarcodeDetector({formats:['code_39','code_128','qr_code']});let found=null;for(let i=0;i<40&&!found;i++){await new Promise(r=>setTimeout(r,200));const codes=await bd.detect(v);if(codes.length)found=codes[0].rawValue}stream.getTracks().forEach(t=>t.stop());if(found){$('#vinIn').value=found;await runVin()}else toast('Aucun code détecté')}catch(e){toast('Scan : '+e.message)}break;
 case'vinToStudy':switchView('etude');break;
 case'vinToJR':switchView('jr');break;
 case'vinToDoss':{const d=newDossier({cat:'vicecache',veh:Object.assign({prix:'',achat:'',neuf:'occasion'},S.veh||{})});saveDossier(d);S.doss=d;switchView('dossiers');renderDossier(d);break}
 case'phFilter':{const q=($('#phQ').value||'').toLowerCase();const ph=PHall().filter(p=>!q||(p.leg||'').toLowerCase().includes(q)||(p.panne||'').toLowerCase().includes(q));$('#phGrid').innerHTML=ph.map(p=>`<div class="card"><img class="ph" src="${esc(p.src)}" loading="lazy"><p class="mut">${esc(p.leg||'')} ${p.panne?'· '+esc(p.panne):''}</p>${S.role==='admin'?`<button class="danger" data-act="phDel" data-k="${p.id}">🗑️</button>`:''}</div>`).join('')||'<p class="mut">Aucune.</p>';break}
 case'phUpload':{const pid=prompt('ID de la panne (vide si général) :')||'';S._phPanne=pid;$('#filePhoto').click();break}
 case'phDel':ls.set('photox',PHall().filter(p=>p.id!==k));renderPhotos();break;
 case'phPublish':if(S.db&&S.adminCloud){try{await S.db.ref('photos').set(PHall());toast('📡 Photos publiées')}catch(e){toast('Refus : '+e.message)}}else toast('Active le cloud admin ou exporte la base');break;
 case'wmSearch':await wmSearch();break;
 case'wmAdd':{const ph=PHall();ph.push({id:uid(),panne:'',leg:el.dataset.t||'',src:k,ts:Date.now()});ls.set('photox',ph);toast('➕ Photo ajoutée');break}
 case'obdConnect':await obdConnect();break;case'obdRead':await obdRead();break;
 case'obdInject':switchView('etude');$('#stDtc').value=S.dtc.join(' ');toast('🧠 DTC injectés');break;
 case'openModule':S.openMod=k;switchView('modules');break;case'closeModule':S.openMod=null;switchView('modules');break;
 case'reloadModule':{const f=$('#modFrame');if(f)f.src=f.src;break}
 case'jrOpen':try{await navigator.clipboard.writeText('Kevin83600');toast('🔑 Mot de passe copié — ouverture JusteRepère')}catch(x){}window.open('https://juridix-case-guide.base44.app/','_blank','noopener');break;
 case'rerunCheck':$('#boot').classList.remove('hid');$('#app').classList.add('hid');await runChecks();$('#boot').classList.add('hid');switchView('check');break;
 case'exportCheck':download('auto-verif.json',S.check||{});break;
 case'adminCloud':await adminCloudLogin($('#acEmail').value.trim(),$('#acPass').value);renderAdmin();break;
 case'approve':{const r=S.reqs[k];const c=await makeCode(r.prenom,30);await S.db.ref('requests/'+k).update({status:'approved',prenom:c.prenom,exp:c.exp,sig:c.sig});toast('✅ '+c.prenom);break}
 case'refuse':await S.db.ref('requests/'+k).update({status:'refused'});toast('❌');break;
 case'genCode':{const p=$('#adPrenom').value.trim();const dd=+$('#adDays').value||30;if(!p){toast('Prénom requis');break}const c=await makeCode(p,dd);const i=ls.get('issued',[]);i.unshift(c);ls.set('issued',i.slice(0,100));
  $('#genZone').innerHTML=`<div class="card"><span class="badge b-dtc">${esc(c.code)}</span><div class="row"><button data-act="copyCode" data-k="${esc(c.code)}">📋</button></div><p class="mut">Jusqu'au ${c.exp} — ${esc(p)}.</p></div>`;break}
 case'copyCode':await navigator.clipboard.writeText(k);toast('📋');break;
 case'revoke':S.cfg.revoked[k]={ts:Date.now()};await publishCfg();toast('🚫 Révoqué');if(S.view==='admin')renderAdmin();break;
 case'wallPick':$('#fileWall').click();break;case'wallPublish':await publishCfg();break;case'wallReset':S.cfg.wall=null;await publishCfg();break;
 case'saveCfg':S.cfg.apkUrl=$('#apkUrl').value.trim();S.cfg.contact=$('#contact').value.trim();await publishCfg();break;
 case'packExport':download('pack-diffusion.json',{type:'KF-PACK',version:VERSION,ts:Date.now(),cfg:S.cfg});break;
 case'packImport':$('#filePack').click();break;
 case'asp':await runAsp(k);break;
 case'syncPush':{try{const c=await Sync.resolve();await Sync.push(c);toast('📤 Base publiée : '+c.service+':'+c.bucket)}catch(e){toast('Sync : '+e.message)}break}
 case'syncCopy':{try{const c=await Sync.resolve();await navigator.clipboard.writeText(c.bucket);toast('📋 '+c.bucket)}catch(e){toast('Sync : '+e.message)}break}
 case'syncNew':{try{const c=await Sync.create();toast('✨ Nouveau canal : '+c.service+':'+c.bucket,6000);renderAdmin()}catch(e){toast('Sync : '+e.message)}break}
 case'baseExport':download('base-fusion.json',{kb:ls.get('kbx',[]),veh:ls.get('vehx',{}),ph:PHall(),rec:ls.get('recx',[])});break;
 case'baseImport':$('#fileBase').click();break;
 case'dumpImport':$('#fileDump').click();break;
 case'bugOpen':openBug();break;case'bugSend':await sendBug();break;
 case'bugShare':{const b=S._bug||{titre:$('#bugTitle')?.value,desc:$('#bugDesc')?.value,ctx:bugContext()};const txt='BUG KEV FUSION — '+(b.titre||'')+'\n'+(b.desc||'')+'\n'+JSON.stringify(b.ctx).slice(0,1500);if(navigator.share)navigator.share({title:'Bug',text:txt}).catch(()=>{});else{await navigator.clipboard.writeText(txt);toast('📋 Copié')}break}
 case'bugResolve':if(S.db&&S.adminCloud){await S.db.ref('bugs/'+k+'/status').set('résolu');toast('✅')}break;
 case'bugDetail':{const b=(S.bugsCloud&&S.bugsCloud[k])||ls.get('bugs',[]).find(x=>String(x.ts)===k||x.id===k);openModal('<h2>🔍 Contexte</h2><pre class="doc">'+esc(JSON.stringify(b,null,2))+'</pre><button data-act="closeModal">Fermer</button>');break}
 case'shareOpen':openShare();break;
 case'doShare':{const url=$('#shareUrl').value;if(navigator.share)navigator.share({title:'KEV FUSION 2026',text:'Diagnostic · incendie · juridique · JusteRepère · VIN',url}).catch(()=>{});else{await navigator.clipboard.writeText(url);toast('📋')}break}
 case'copyLink':await navigator.clipboard.writeText($('#shareUrl').value);toast('📋');break;
 case'install':if(S.deferred){S.deferred.prompt();S.deferred=null}else toast('Menu → Installer l\'application');break;
 case'logout':S.role=null;ls.set('session',null);toast('Session fermée');switchView('home');break;
 case'closeModal':closeModal();break}}
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(a){handleAct(a.dataset.act,a).catch(err=>{log('error',err.message);toast('Erreur : '+err.message)});return}
 const j=e.target.closest('[data-jr]');if(j)handleJR(j.dataset.jr,j).catch(err=>{log('error',err.message);toast('Erreur : '+err.message)})});
async function handleJR(act,el){const k=el.dataset.k;switch(act){
 case'tab':S.jr.tab=k;renderJR();break;
 case'dom':S.jr.dom=k;jrAnalyseView();break;
 case'role':S.jr.role=k;jrAnalyseView();break;
 case'openModule':S.openMod='juridix';switchView('modules');break;
 case'addPhoto':$('#fileJrPhoto').click();break;
 case'delPhoto':S.jr.photos.splice(+k,1);jrAnalyseView();break;
 case'analyze':{const f=jrForm();if(!f.faits&&!f.titre){toast('Décris ton problème');break}S.jr.result=jrAnalyze(f);jrSave(S.jr.result);$('#jrRes').innerHTML=jrResultHTML(S.jr.result);toast('⚖️ Analyse générée');break}
 case'doc':jrGenDoc(k);break;
 case'copyDoc':await navigator.clipboard.writeText(S.jr._doc);toast('📋');break;
 case'txtDoc':download('JR-'+k+'.txt',S.jr._doc);break;
 case'printDoc':$('#printArea').innerHTML='<pre>'+esc(S.jr._doc)+'</pre>';document.body.classList.add('printing');window.print();setTimeout(()=>document.body.classList.remove('printing'),800);break;
 case'pdf':jrPDF();break;
 case'json':if(S.jr.result)download(S.jr.result.ref+'.json',S.jr.result);break;
 case'toDossier':jrToDossier();break;
 case'notify':jrNotify();break;
 case'reload':{const r=jrHist().find(x=>x.id===k);if(r){S.jr.result=r;S.jr.dom=r.dom;S.jr.role=r.role||'demandeur';S.jr.photos=r.photos||[];S.jr.tab='analyse';renderJR()}break}
 case'delHist':ls.set('jr_history',jrHist().filter(x=>x.id!==k));jrHistView();break}}
/* ---- démarrage ---- */
async function gateOrApp(){const sess=ls.get('session',null);if(sess&&Date.now()-sess.ts<12*3600e3){S.role='admin';enterApp();return}
 const a=ls.get('access',null);if(await validAccess(a)){S.access=a;S.prenom=a.prenom;enterApp();return}$('#gate').classList.remove('hid')}
function enterApp(){$('#boot').classList.add('hid');$('#gate').classList.add('hid');$('#app').classList.remove('hid');
 const v=new URLSearchParams(location.search).get('view');switchView(v&&['recherche','etude','jr','vin','photos','dossiers','obd','modules','check'].includes(v)?v:'home');
 if(v==='bug')openBug();if(v==='admin'&&S.role!=='admin')openAdminModal();alertEcheances();toast('Bienvenue '+(S.role==='admin'?'Kevin 🛡️':S.prenom))}
async function init(){initNet();applyWall();
 if('serviceWorker'in navigator){try{S.swReg=await navigator.serviceWorker.register('./sw.js')}catch(e){log('warn','SW '+e.message)}}
 $('#fileWall').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;compressImg(f,1600,d=>{if(d.length>900000){toast('Image trop lourde');return}S.cfg.wall=d;applyWall();toast('🖼️ Appliqué — Publier')})});
 $('#filePack').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);if(p.type!=='KF-PACK')throw new Error('pack invalide');Object.assign(S.cfg,p.cfg);ls.set('cfg',S.cfg);applyWall();toast('📥 Pack importé')}catch(x){toast('Pack : '+x.message)}};r.readAsText(f)});
 $('#fileDoss').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);const arr=Array.isArray(p)?p:[p];const ds=getDossiers();let n=0;arr.forEach(d=>{if(d&&d.id&&d.steps&&!ds.find(x=>x.id===d.id)){ds.push(d);n++}});ls.set('dossiers',ds);renderDossiers();toast('📥 '+n+' dossier(s)')}catch(x){toast('Import : '+x.message)}};r.readAsText(f)});
 $('#fileBase').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);const out={kb:[],veh:{},ph:[],rec:[]};if(p.kb)out.kb=p.kb;if(p.veh)out.veh=p.veh;if(p.ph)out.ph=p.ph;if(p.rec)out.rec=p.rec;if(!p.kb&&!p.veh){const c=classify(p);out.kb=c.kb;out.veh=c.veh;out.ph=c.ph;out.rec=c.rec}const m=mergeAsp(out);toast(`📥 +${m.kb} pannes · +${m.veh} marques · +${m.ph} photos`)}catch(x){toast('Import : '+x.message)}};r.readAsText(f)});
 $('#fileDump').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const items=flattenDump(JSON.parse(r.result));const m=mergeAsp(classify(items));toast(`📥 Dump : +${m.kb} pannes · +${m.veh} marques · +${m.ph} photos · +${m.rec} rappels`,7000);renderAdmin()}catch(x){toast('Dump : '+x.message)}};r.readAsText(f)});
 $('#filePhoto').addEventListener('change',e=>{const files=[...e.target.files];let done=0;const ph=PHall();files.forEach(f=>compressImg(f,1200,d=>{ph.push({id:uid(),panne:S._phPanne||'',leg:f.name,src:d,ts:Date.now()});if(++done===files.length){ls.set('photox',ph);renderPhotos();toast('📷 '+done+' photo(s)')}}))});
 $('#fileJrPhoto').addEventListener('change',e=>{const files=[...e.target.files];let done=0;files.forEach(f=>compressImg(f,1200,d=>{S.jr.photos.push(d);if(++done===files.length){jrAnalyseView();toast('📷 '+done+' photo(s) du litige')}}))});
 ensureCloud();await runChecks()}
document.addEventListener('DOMContentLoaded',init);
