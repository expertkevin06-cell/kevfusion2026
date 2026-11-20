/* KEV FUSION 2026 — bootfix.js v1.0.0
   Correctif du blocage « Uncaught SyntaxError: Identifier 'AD' has already been declared ».
   Charge les modules dans l'ordre, une seule fois chacun, et neutralise les RE-DÉCLARATIONS
   lexicales (const / let / class) d'un même identifiant global en les convertissant en `var`
   (redéclarable) — sans toucher à la portée globale des autres symboles (S, NAV, FAULTS…).
   Auto-réparant : si une SyntaxError « already been declared » survient à la compilation d'un
   module, l'identifiant fautif est extrait, ajouté à la liste, et le module est ré-évalué
   immédiatement (une SyntaxError est levée avant toute exécution : la reprise est sûre).
   Repli : si le chargement texte échoue, injection d'un <script> natif + garde d'erreur. */
(function(){
'use strict';
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
/* identifiants connus pour provoquer une re-déclaration + ceux découverts à l'exécution */
var IDS=LS.g('bootfixIds',['AD']);if(!Array.isArray(IDS))IDS=['AD'];
if(IDS.indexOf('AD')<0)IDS.unshift('AD');
var FILES=[
'quota.js','firebase-config.js','data.js','app.js','sanitize.js','turbo.js',
'catalog.js','catalog_ext.js','renault_base.js','brands_base.js',
'megabase_catalog.js','megabase2_catalog.js','megabase3_catalog.js',
'access.js','notify.js','extra.js','updates.js','diffusion.js',
'vehicles.js','faults.js','faults_ext.js','renault_faults.js',
'models_add.js','bigster_spring.js','family_faults.js','import2023.js',
'megabase_faults.js','megabase2_faults.js','megabase3_faults.js',
'correlation.js','predictive.js','brandlogo.js','wallpaper.js',
'vinloc_db.js','vinloc.js','jradmin.js',
'obdpro_db.js','obdpro.js','obdtech_db.js','obdtech.js',
'websearch.js','baseupdate.js','autoimport.js',
'admingate.js','notifications.js','pwabuilder.js','icon-gen.js','ghtoken.js',
'jrgate.js','modgate.js'];
var LOG=[],DONE={},FAILED=[];
function note(m,l){LOG.push({t:Date.now(),m:m,l:l||'info'});
 try{if(window.KFNotify&&KFNotify.push&&l==='err')KFNotify.push({type:'error',level:'err',title:'Chargement module',body:m})}catch(e){}}
/* conversion ciblée : const/let/class <ID> → var <ID> (redéclarable, portée globale conservée) */
function neutralize(code,ids){
 for(var i=0;i<ids.length;i++){
  var id=ids[i];if(!/^[A-Za-z_$][\w$]*$/.test(id))continue;
  code=code.replace(new RegExp('(^|[;{}\\n])([ \\t]*)(const|let)[ \\t]+'+id+'(?![\\w$])','g'),
   function(m,a,b){return a+b+'var '+id});
  code=code.replace(new RegExp('(^|[;{}\\n])([ \\t]*)class[ \\t]+'+id+'(?![\\w$])','g'),
   function(m,a,b){return a+b+'var '+id+' = class '+id});
 }
 return code}
function fetchText(src){
 try{var x=new XMLHttpRequest();x.open('GET',src,false);x.send(null);
  if((x.status>=200&&x.status<300)||x.status===0)return x.responseText}catch(e){}
 return null}
function run(src){
 if(DONE[src])return;DONE[src]=1;
 var code=fetchText(src);
 if(code==null){FAILED.push(src);note('Lecture impossible : '+src+' → script natif','warn');native(src);return}
 var prepared=neutralize(code,IDS);
 try{ (0,eval)(prepared+'\n//# sourceURL='+src); note('OK '+src); }
 catch(err){
  var msg=String(err&&err.message||err);
  var m=/Identifier '([^']+)' has already been declared/.exec(msg)||
        /'([^']+)' has already been declared/.exec(msg);
  if(m){
   var id=m[1];
   if(IDS.indexOf(id)<0){IDS.push(id);LS.s('bootfixIds',IDS)}
   note('Conflit « '+id+' » neutralisé dans '+src,'warn');
   try{ (0,eval)(neutralize(code,IDS)+'\n//# sourceURL='+src); note('OK '+src+' (après correctif)'); }
   catch(e2){note('Échec '+src+' : '+(e2&&e2.message||e2),'err');FAILED.push(src)}
   return}
  note('Erreur '+src+' : '+msg,'err');FAILED.push(src);
 }}
function native(src){
 try{var s=document.createElement('script');s.src=src;s.async=false;
  s.onerror=function(){note('Script natif introuvable : '+src,'err')};
  document.body.appendChild(s)}catch(e){}}
/* garde sur les scripts natifs de repli : mémorise l'identifiant fautif et recharge une fois */
window.addEventListener('error',function(e){
 var msg=String(e&&e.message||'');
 var m=/Identifier '([^']+)' has already been declared/.exec(msg);
 if(!m)return;
 var id=m[1];
 if(IDS.indexOf(id)<0){IDS.push(id);LS.s('bootfixIds',IDS)}
 if(!sessionStorage.getItem('kf_bootfix_retry')){
  sessionStorage.setItem('kf_bootfix_retry','1');
  setTimeout(function(){location.reload()},60)}
},true);
/* chargement séquentiel synchrone : ordre et timing identiques aux <script> classiques */
for(var i=0;i<FILES.length;i++)run(FILES[i]);
try{sessionStorage.removeItem('kf_bootfix_retry')}catch(e){}
/* diagnostic accessible */
window.KFBoot={files:FILES,loaded:Object.keys(DONE),failed:FAILED,ids:IDS,log:LOG,
 reload:function(){try{sessionStorage.removeItem('kf_bootfix_retry')}catch(e){}location.reload()},
 retry:function(){FAILED.slice().forEach(function(f){DONE[f]=0;run(f)});return FAILED}};
if(FAILED.length){
 try{console.warn('[KEV FUSION] modules en échec :',FAILED.join(', '))}catch(e){}
}
})();
