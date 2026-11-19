/* KEV FUSION 2026 — brandlogo.js v1.0.0
   LOGOS RÉELS VECTORIELS des marques → fond d'écran vivant dès la sélection de la marque.
   · 60 marques dessinées en SVG fidèle (formes, couleurs officielles, wordmarks)
   · calque dédié #brandLayer (n'écrase jamais le fond admin), halo, anneaux, particules, grain
   · mini-logos injectés dans le sélecteur de marque, la fiche véhicule et les titres de résultats
   · dock de réglages PERMANENT : 18 outils live + reset / aléatoire / export PNG & SVG */
(function(){
'use strict';
/* ══════════════════════════════════════════════════════════════
   1. BIBLIOTHÈQUE DE LOGOS (SVG fidèles, viewBox 0 0 200 200)
   ══════════════════════════════════════════════════════════════ */
var F='font-family="system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif"';
var SR='font-family="Georgia,Times New Roman,serif"';
function T(x,y,s,t,w,ls,extra){return '<text x="'+x+'" y="'+y+'" '+F+' font-size="'+s+'" font-weight="'+(w||800)+'" letter-spacing="'+(ls||0)+'" text-anchor="middle" '+(extra||'')+'>'+t+'</text>'}
var L={};
function D(k,c,c2,inner,alt){L[k]={c:c,c2:c2||c,svg:inner,alt:alt||[]}}

D('Renault','#ffcc33','#f2a900',
 '<g fill="none" stroke="#ffcc33" stroke-width="8" stroke-linejoin="miter">'+
 '<path d="M100 20 L168 100 L100 180 L32 100 Z"/>'+
 '<path d="M100 46 L146 100 L100 154 L54 100 Z"/></g>'+
 '<g stroke="#ffcc33" stroke-width="6"><path d="M66 84 L100 44 L134 84"/><path d="M66 116 L100 156 L134 116"/></g>');
D('Dacia','#0f4c81','#1e88e5',
 '<path d="M100 18 L172 46 V104 C172 142 138 168 100 182 C62 168 28 142 28 104 V46 Z" fill="#0f4c81"/>'+
 '<path d="M62 66 h44 c24 0 40 14 40 34 s-16 34 -40 34 H62 Z M84 86 v28 h20 c10 0 17 -6 17 -14 s-7 -14 -17 -14 Z" fill="#fff"/>'+
 '<path d="M28 46 L100 18 L172 46" fill="none" stroke="#7fc4ff" stroke-width="4"/>');
D('Alpine','#0055a4','#38bdf8',
 '<circle cx="100" cy="100" r="80" fill="none" stroke="#0055a4" stroke-width="7"/>'+
 '<path d="M100 44 L142 148 H120 L100 96 L80 148 H58 Z" fill="#0055a4"/>'+
 '<path d="M86 124 h28" stroke="#fff" stroke-width="7"/>'+
 T(100,172,15,'ALPINE',800,3,'fill="#0055a4"'));
D('Peugeot','#c8cdd4','#e8eefc',
 '<path d="M100 16 L166 40 V106 C166 146 134 172 100 186 C66 172 34 146 34 106 V40 Z" fill="#12161c" stroke="#c8cdd4" stroke-width="4"/>'+
 T(100,52,15,'PEUGEOT',800,2.2,'fill="#e8eefc"')+
 '<g fill="#e8eefc"><path d="M74 78 c6 -12 20 -18 32 -14 c10 3 16 10 20 18 l10 4 -8 6 c2 10 -2 20 -10 26 l-6 16 -8 -12 c-12 2 -24 -4 -30 -14 l-10 -2 8 -8 c-2 -8 0 -14 2 -20 Z"/>'+
 '<path d="M112 62 l14 -14 4 12 z"/><path d="M92 60 l-8 -16 14 8 z"/></g>'+
 '<circle cx="112" cy="92" r="4" fill="#12161c"/>'+
 '<path d="M84 108 q14 10 30 4" stroke="#12161c" stroke-width="3" fill="none"/>');
D('Citroën','#d31f26','#ff5a45',
 '<ellipse cx="100" cy="100" rx="86" ry="72" fill="none" stroke="#d31f26" stroke-width="6"/>'+
 '<path d="M100 56 L156 100 V122 L100 78 L44 122 V100 Z" fill="#d31f26"/>'+
 '<path d="M100 100 L156 144 V166 L100 122 L44 166 V144 Z" fill="#d31f26"/>');
D('DS','#c9a227','#ffd166',
 '<rect x="24" y="52" width="152" height="96" rx="10" fill="none" stroke="#c9a227" stroke-width="5"/>'+
 '<path d="M50 74 h26 c18 0 30 11 30 26 s-12 26 -30 26 H50 Z M66 88 v24 h10 c9 0 15 -5 15 -12 s-6 -12 -15 -12 Z" fill="#c9a227"/>'+
 '<path d="M150 80 c-6 -6 -18 -8 -26 -4 c-9 4 -10 14 -1 18 l16 7 c9 4 8 14 -2 17 c-8 3 -18 1 -24 -5" fill="none" stroke="#c9a227" stroke-width="8" stroke-linecap="round"/>');
D('Opel','#f7c500','#ffe066',
 '<circle cx="100" cy="100" r="76" fill="none" stroke="#1a1a1a" stroke-width="12"/>'+
 '<circle cx="100" cy="100" r="76" fill="none" stroke="#f7c500" stroke-width="5"/>'+
 '<path d="M28 100 h74 l-16 -26 84 26 h-74 l16 26 z" fill="#f7c500"/>'+
 '<path d="M28 100 h74 l-16 -26 84 26 h-74 l16 26 z" fill="none" stroke="#1a1a1a" stroke-width="3"/>');
D('Vauxhall','#c8102e','#ff4d3d',
 '<path d="M100 18 L170 44 V108 C170 146 138 172 100 184 C62 172 30 146 30 108 V44 Z" fill="#12161c" stroke="#c8102e" stroke-width="4"/>'+
 '<path d="M62 128 c8 -30 26 -48 48 -52 c-6 -10 -4 -20 4 -26 c2 10 8 14 16 16 c14 4 22 16 22 30 c0 20 -16 34 -38 34 z" fill="#c8102e"/>'+
 '<path d="M110 50 l22 -12 -6 16 z" fill="#c8102e"/>'+
 T(100,166,13,'VAUXHALL',800,1.6,'fill="#e8eefc"'));
D('Fiat','#a4123f','#e11d48',
 '<path d="M100 20 L170 48 V112 C170 148 138 172 100 184 C62 172 30 148 30 112 V48 Z" fill="#a4123f"/>'+
 '<path d="M100 26 L164 52 V112 C164 144 134 166 100 178 C66 166 36 144 36 112 V52 Z" fill="none" stroke="#ffd9e2" stroke-width="3"/>'+
 '<text x="100" y="118" '+SR+' font-size="46" font-weight="700" font-style="italic" text-anchor="middle" fill="#fff">FIAT</text>');
D('Abarth','#ffd400','#e11d2e',
 '<path d="M100 18 L170 44 V106 C170 146 138 172 100 184 C62 172 30 146 30 106 V44 Z" fill="#ffd400"/>'+
 '<path d="M30 106 V44 L100 18 L170 44 V106 Z" fill="#e11d2e"/>'+
 '<g fill="#12161c"><path d="M100 74 c10 0 18 8 18 18 c0 8 -6 14 -12 18 l10 14 -12 -4 -4 12 -4 -12 -12 4 10 -14 c-6 -4 -12 -10 -12 -18 c0 -10 8 -18 18 -18 Z"/>'+
 '<path d="M84 66 l-16 -12 6 18 z"/><path d="M116 66 l16 -12 -6 18 z"/>'+
 '<path d="M100 128 l-8 22 8 -6 8 6 z"/></g>'+
 T(100,168,13,'ABARTH',900,1.8,'fill="#12161c"'));
D('Alfa Romeo','#0b7a3b','#d31f26',
 '<circle cx="100" cy="100" r="82" fill="#fff" stroke="#0b3d24" stroke-width="6"/>'+
 '<path d="M100 20 A80 80 0 0 0 100 180 Z" fill="#fff"/>'+
 '<path d="M100 20 A80 80 0 0 1 100 180 Z" fill="#0b7a3b"/>'+
 '<g fill="#d31f26"><rect x="52" y="56" width="14" height="88"/><rect x="30" y="92" width="58" height="14"/></g>'+
 '<g fill="#ffd166"><path d="M124 148 c-10 -14 -6 -30 6 -40 c10 -8 14 -18 8 -28 c-4 -8 -14 -10 -20 -4 c8 -2 14 4 12 12 c-2 8 -12 12 -18 20 c-10 12 -10 30 4 42 z"/>'+
 '<circle cx="136" cy="66" r="7"/><path d="M140 58 l12 -10 -4 14 z"/></g>'+
 '<path d="M100 20 V180" stroke="#0b3d24" stroke-width="4"/>'+
 '<circle cx="100" cy="100" r="82" fill="none" stroke="#0b3d24" stroke-width="6"/>'+
 T(100,36,13,'ALFA ROMEO',800,1.2,'fill="#0b3d24"'));
D('Lancia','#123a6b','#3b82f6',
 '<path d="M100 18 L170 44 V108 C170 146 138 172 100 184 C62 172 30 146 30 108 V44 Z" fill="#123a6b"/>'+
 '<circle cx="100" cy="98" r="52" fill="none" stroke="#c9d8ee" stroke-width="3"/>'+
 '<path d="M100 50 V146" stroke="#c9d8ee" stroke-width="5"/>'+
 '<path d="M100 50 l14 18 -14 6 -14 -6 z" fill="#c9d8ee"/>'+
 '<path d="M64 118 q36 18 72 0" fill="none" stroke="#c9d8ee" stroke-width="3"/>'+
 T(100,166,14,'LANCIA',800,2.4,'fill="#c9d8ee"'));
D('Jeep','#3f663f','#6b8f4e',
 '<g fill="#3f663f"><rect x="34" y="52" width="12" height="46" rx="6"/><rect x="52" y="52" width="12" height="46" rx="6"/>'+
 '<rect x="70" y="52" width="12" height="46" rx="6"/><rect x="88" y="52" width="12" height="46" rx="6"/>'+
 '<rect x="106" y="52" width="12" height="46" rx="6"/><rect x="124" y="52" width="12" height="46" rx="6"/>'+
 '<rect x="142" y="52" width="12" height="46" rx="6"/></g>'+
 '<circle cx="24" cy="75" r="9" fill="none" stroke="#3f663f" stroke-width="5"/>'+
 '<circle cx="176" cy="75" r="9" fill="none" stroke="#3f663f" stroke-width="5"/>'+
 '<text x="100" y="150" '+F+' font-size="52" font-weight="900" text-anchor="middle" fill="#3f663f">Jeep</text>');
D('Mercedes-Benz','#c8cdd4','#e8eefc',
 '<circle cx="100" cy="100" r="80" fill="none" stroke="#c8cdd4" stroke-width="7"/>'+
 '<g stroke="#c8cdd4" stroke-width="7" stroke-linecap="round"><path d="M100 100 V24"/><path d="M100 100 L34 138"/><path d="M100 100 L166 138"/></g>'+
 '<circle cx="100" cy="100" r="9" fill="#c8cdd4"/>',['Mercedes','Mercedes Benz','Mercedes-AMG']);
D('BMW','#0066b1','#38bdf8',
 '<circle cx="100" cy="100" r="82" fill="#12161c"/>'+
 '<circle cx="100" cy="100" r="60" fill="#fff"/>'+
 '<path d="M100 40 A60 60 0 0 1 160 100 L100 100 Z" fill="#0066b1"/>'+
 '<path d="M100 160 A60 60 0 0 1 40 100 L100 100 Z" fill="#0066b1"/>'+
 '<circle cx="100" cy="100" r="60" fill="none" stroke="#12161c" stroke-width="3"/>'+
 T(100,32,17,'BMW',900,1.5,'fill="#fff"'));
D('MINI','#c8cdd4','#e8eefc',
 '<g fill="none" stroke="#c8cdd4" stroke-width="5">'+
 '<path d="M62 100 L18 84 L26 100 L18 116 Z"/><path d="M138 100 L182 84 L174 100 L182 116 Z"/>'+
 '<path d="M62 92 L30 82"/><path d="M62 108 L30 118"/><path d="M138 92 L170 82"/><path d="M138 108 L170 118"/></g>'+
 '<circle cx="100" cy="100" r="38" fill="none" stroke="#c8cdd4" stroke-width="6"/>'+
 T(100,108,22,'MINI',900,1,'fill="#c8cdd4"'));
D('Audi','#d31f26','#ff4d3d',
 '<g fill="none" stroke="#c8cdd4" stroke-width="8">'+
 '<circle cx="46" cy="100" r="30"/><circle cx="82" cy="100" r="30"/><circle cx="118" cy="100" r="30"/><circle cx="154" cy="100" r="30"/></g>');
D('Volkswagen','#001e50','#3b82f6',
 '<circle cx="100" cy="100" r="80" fill="#001e50"/>'+
 '<circle cx="100" cy="100" r="80" fill="none" stroke="#fff" stroke-width="8"/>'+
 '<g fill="none" stroke="#fff" stroke-width="11" stroke-linejoin="round" stroke-linecap="round">'+
 '<path d="M64 48 L100 96 L136 48"/><path d="M52 104 L76 156 L100 112 L124 156 L148 104"/></g>',['VW']);
D('Skoda','#0e3a2f','#4ba82e',
 '<circle cx="100" cy="100" r="80" fill="none" stroke="#0e3a2f" stroke-width="9"/>'+
 '<path d="M56 128 c14 -34 40 -54 74 -58 l-10 -18 30 22 -22 26 -4 -16 c-26 6 -46 22 -56 46 z" fill="#4ba82e"/>'+
 '<circle cx="128" cy="76" r="9" fill="#0e3a2f"/>'+
 '<path d="M62 148 q34 16 70 -2" fill="none" stroke="#0e3a2f" stroke-width="6"/>');
D('SEAT','#c8102e','#ff4d3d',
 '<ellipse cx="100" cy="100" rx="84" ry="60" fill="none" stroke="#c8102e" stroke-width="8"/>'+
 '<path d="M148 74 c-12 -10 -34 -14 -50 -6 c-16 8 -16 24 0 30 l28 10 c14 6 12 20 -4 24 c-14 4 -32 0 -42 -8" fill="none" stroke="#c8102e" stroke-width="14" stroke-linecap="round"/>');
D('Cupra','#9c5b34','#c98a5e',
 '<path d="M100 30 L166 154 H124 L100 108 L76 154 H34 Z" fill="#9c5b34"/>'+
 '<path d="M100 62 L136 132 H112 L100 110 L88 132 H64 Z" fill="#0a0f14"/>'+
 '<path d="M34 154 L100 30 L166 154" fill="none" stroke="#c98a5e" stroke-width="3"/>');
D('Porsche','#c9a227','#d31f26',
 '<path d="M100 16 L172 40 V104 C172 148 138 174 100 188 C62 174 28 148 28 104 V40 Z" fill="#c9a227"/>'+
 '<path d="M100 22 L166 44 V104 C166 144 134 168 100 181 C66 168 34 144 34 104 V44 Z" fill="none" stroke="#12161c" stroke-width="3"/>'+
 '<rect x="34" y="44" width="132" height="20" fill="#12161c"/>'+
 T(100,60,15,'PORSCHE',900,2,'fill="#c9a227"')+
 '<g fill="#d31f26"><rect x="42" y="70" width="30" height="26"/><rect x="128" y="70" width="30" height="26"/>'+
 '<rect x="42" y="122" width="30" height="26"/><rect x="128" y="122" width="30" height="26"/></g>'+
 '<g fill="#12161c"><rect x="72" y="70" width="56" height="26"/><rect x="72" y="122" width="56" height="26"/></g>'+
 '<path d="M100 96 c14 0 24 10 24 22 c0 12 -10 20 -24 20 c-14 0 -24 -8 -24 -20 c0 -12 10 -22 24 -22 Z" fill="#c9a227"/>'+
 '<path d="M92 106 l-8 -12 12 4 z M108 106 l8 -12 -12 4 z" fill="#12161c"/>'+
 '<path d="M96 120 q4 8 8 0" stroke="#12161c" stroke-width="3" fill="none"/>'+
 '<circle cx="94" cy="112" r="2.5" fill="#12161c"/><circle cx="106" cy="112" r="2.5" fill="#12161c"/>');
D('Volvo','#003057','#38bdf8',
 '<circle cx="96" cy="106" r="66" fill="none" stroke="#003057" stroke-width="10"/>'+
 '<path d="M138 46 h40 v40" fill="none" stroke="#003057" stroke-width="10"/>'+
 '<path d="M178 46 L134 90" stroke="#003057" stroke-width="10"/>'+
 '<rect x="26" y="92" width="140" height="26" fill="#003057"/>'+
 T(96,112,19,'VOLVO',800,3,'fill="#fff"'));
D('Polestar','#c8cdd4','#e8eefc',
 '<g fill="#c8cdd4"><path d="M100 24 L112 88 L100 100 L88 88 Z"/><path d="M100 176 L88 112 L100 100 L112 112 Z"/>'+
 '<path d="M24 100 L88 88 L100 100 L88 112 Z"/><path d="M176 100 L112 112 L100 100 L112 88 Z"/></g>'+
 '<g fill="#5a6a84" opacity=".7"><path d="M100 40 L108 88 L100 96 L92 88 Z"/><path d="M100 160 L92 112 L100 104 L108 112 Z"/></g>');
D('Land Rover','#005a2b','#4ba82e',
 '<ellipse cx="100" cy="100" rx="90" ry="48" fill="#005a2b"/>'+
 '<ellipse cx="100" cy="100" rx="84" ry="42" fill="none" stroke="#c9e6d2" stroke-width="2.5"/>'+
 T(100,92,20,'LAND',800,3,'fill="#fff"')+T(100,118,20,'ROVER',800,3,'fill="#fff"')+
 '<path d="M28 100 h20 M152 100 h20" stroke="#c9e6d2" stroke-width="3"/>',['Landrover','Land-Rover']);
D('Range Rover','#c9a227','#e8eefc',
 '<ellipse cx="100" cy="100" rx="90" ry="46" fill="none" stroke="#c9a227" stroke-width="4"/>'+
 T(100,92,19,'RANGE',700,4,'fill="#c9a227"')+T(100,118,19,'ROVER',700,4,'fill="#c9a227"')+
 '<path d="M26 100 h18 M156 100 h18" stroke="#c9a227" stroke-width="3"/>');
D('Jaguar','#c8cdd4','#ffd166',
 '<path d="M22 118 c14 -6 24 -18 34 -30 c8 -10 18 -16 30 -16 l16 -14 -4 14 c14 2 26 8 36 18 c10 10 22 14 34 12 l14 -8 -8 14 c-10 10 -26 12 -40 6 l-14 14 -2 -14 c-14 0 -26 -4 -36 -12 l-18 10 6 -14 c-8 -2 -16 0 -24 6 z" fill="#c8cdd4"/>'+
 '<circle cx="128" cy="80" r="3" fill="#12161c"/>'+
 T(100,166,20,'JAGUAR',700,5,'fill="#c8cdd4"'));
D('Ford','#003478','#3b82f6',
 '<ellipse cx="100" cy="100" rx="92" ry="52" fill="#003478"/>'+
 '<ellipse cx="100" cy="100" rx="86" ry="46" fill="none" stroke="#fff" stroke-width="3"/>'+
 '<ellipse cx="100" cy="100" rx="80" ry="41" fill="none" stroke="#fff" stroke-width="1.5"/>'+
 '<text x="100" y="118" '+SR+' font-size="52" font-style="italic" font-weight="700" text-anchor="middle" fill="#fff">Ford</text>');
D('Toyota','#eb0a1e','#ff4d3d',
 '<g fill="none" stroke="#eb0a1e" stroke-width="11">'+
 '<ellipse cx="100" cy="100" rx="88" ry="58"/>'+
 '<ellipse cx="100" cy="76" rx="26" ry="40"/>'+
 '<ellipse cx="100" cy="106" rx="62" ry="24"/></g>');
D('Lexus','#c8cdd4','#e8eefc',
 '<ellipse cx="100" cy="100" rx="88" ry="60" fill="none" stroke="#c8cdd4" stroke-width="8"/>'+
 '<path d="M62 132 V64 h16 v52 h50" fill="none" stroke="#c8cdd4" stroke-width="11" stroke-linecap="square"/>'+
 '<path d="M78 116 L136 66" stroke="#c8cdd4" stroke-width="8"/>');
D('Honda','#c8102e','#ff4d3d',
 '<rect x="26" y="52" width="148" height="96" rx="18" fill="none" stroke="#c8102e" stroke-width="9"/>'+
 '<path d="M62 68 v64 M138 68 v64 M62 96 h76" stroke="#c8102e" stroke-width="16" stroke-linecap="butt"/>'+
 '<path d="M52 62 h20 M128 62 h20" stroke="#c8102e" stroke-width="10"/>');
D('Nissan','#c3002f','#ff4d3d',
 '<circle cx="100" cy="100" r="78" fill="none" stroke="#c8cdd4" stroke-width="9"/>'+
 '<rect x="16" y="84" width="168" height="32" fill="#c8cdd4"/>'+
 T(100,108,22,'NISSAN',800,2,'fill="#12161c"'));
D('Infiniti','#c8cdd4','#e8eefc',
 '<ellipse cx="100" cy="104" rx="86" ry="58" fill="none" stroke="#c8cdd4" stroke-width="8"/>'+
 '<path d="M100 62 L146 148 L118 148 L100 106 L82 148 L54 148 Z" fill="#c8cdd4"/>'+
 '<path d="M100 62 L100 106" stroke="#12161c" stroke-width="4"/>');
D('Mazda','#c8cdd4','#e8eefc',
 '<ellipse cx="100" cy="100" rx="88" ry="58" fill="none" stroke="#c8cdd4" stroke-width="8"/>'+
 '<path d="M46 76 c14 4 26 14 34 28 l20 -22 20 22 c8 -14 20 -24 34 -28 c-10 18 -22 32 -34 46 l-20 -20 -20 20 c-12 -14 -24 -28 -34 -46 z" fill="#c8cdd4"/>');
D('Suzuki','#c3002f','#ff4d3d',
 '<path d="M34 66 c22 -16 48 -14 66 4 l24 24 c10 10 22 12 34 6 l8 -6 -10 24 c-22 16 -48 14 -66 -4 l-24 -24 c-10 -10 -22 -12 -34 -6 l-8 6 z" fill="#c3002f"/>'+
 '<path d="M34 66 l14 20 M166 134 l-14 -20" stroke="#c3002f" stroke-width="6"/>');
D('Mitsubishi','#e60012','#ff4d3d',
 '<g fill="#e60012"><path d="M100 100 L100 34 L134 68 L100 100 Z"/><path d="M100 100 L100 34 L66 68 L100 100 Z"/>'+
 '<path d="M100 100 L44 134 L78 168 L100 134 Z"/><path d="M100 100 L156 134 L122 168 L100 134 Z"/></g>'+
 '<g fill="#e60012"><path d="M100 34 L134 68 L100 102 L66 68 Z"/>'+
 '<path d="M44 134 L78 100 L100 134 L78 168 Z"/><path d="M156 134 L122 100 L100 134 L122 168 Z"/></g>');
D('Subaru','#003d7c','#38bdf8',
 '<ellipse cx="100" cy="100" rx="90" ry="56" fill="#003d7c"/>'+
 '<ellipse cx="100" cy="100" rx="84" ry="50" fill="none" stroke="#c9d8ee" stroke-width="2"/>'+
 '<g fill="#fff"><path d="M62 88 l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6 z"/>'+
 '<path d="M112 78 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 z"/>'+
 '<path d="M138 92 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z"/>'+
 '<path d="M118 112 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z"/>'+
 '<path d="M146 116 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 z"/>'+
 '<path d="M92 118 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 z"/></g>');
D('Hyundai','#002c5f','#3b82f6',
 '<ellipse cx="100" cy="100" rx="90" ry="58" fill="none" stroke="#002c5f" stroke-width="10"/>'+
 '<g transform="rotate(-16 100 100)" fill="#002c5f">'+
 '<path d="M58 66 c8 0 14 6 14 14 v40 c0 8 -6 14 -14 14 s-14 -6 -14 -14 V80 c0 -8 6 -14 14 -14 Z"/>'+
 '<path d="M142 66 c8 0 14 6 14 14 v40 c0 8 -6 14 -14 14 s-14 -6 -14 -14 V80 c0 -8 6 -14 14 -14 Z"/>'+
 '<path d="M62 92 h76 v18 H62 Z"/></g>');
D('Kia','#05141f','#c8cdd4',
 '<g fill="none" stroke="#c8cdd4" stroke-width="11" stroke-linecap="square">'+
 '<path d="M28 132 V68"/><path d="M28 100 L70 68"/><path d="M28 100 L70 132"/>'+
 '<path d="M92 68 V132"/><path d="M116 132 L140 68 L164 132"/><path d="M126 112 h28"/></g>'+
 '<path d="M28 68 L70 68" stroke="#c8cdd4" stroke-width="0"/>');
D('Genesis','#c9a227','#ffd166',
 '<path d="M100 40 L146 58 V104 C146 132 126 150 100 162 C74 150 54 132 54 104 V58 Z" fill="none" stroke="#c9a227" stroke-width="5"/>'+
 '<g fill="#c9a227"><path d="M54 74 L14 62 L26 78 L14 94 L54 84 Z"/><path d="M146 74 L186 62 L174 78 L186 94 L146 84 Z"/></g>'+
 '<path d="M100 70 V132 M78 96 h44" stroke="#c9a227" stroke-width="6"/>'+
 T(100,180,13,'GENESIS',700,3,'fill="#c9a227"'));
D('Tesla','#e82127','#ff4d3d',
 '<path d="M100 44 c-26 0 -50 6 -68 16 l10 18 c14 -8 34 -12 58 -12 s44 4 58 12 l10 -18 c-18 -10 -42 -16 -68 -16 Z" fill="#e82127"/>'+
 '<path d="M100 70 c-10 0 -20 2 -28 6 l8 14 c6 -3 12 -4 20 -4 v78 h0 v-78 c8 0 14 1 20 4 l8 -14 c-8 -4 -18 -6 -28 -6 Z" fill="#e82127"/>'+
 '<rect x="92" y="78" width="16" height="90" fill="#e82127"/>'+
 '<path d="M32 40 c18 -10 42 -16 68 -16 s50 6 68 16" fill="none" stroke="#e82127" stroke-width="7"/>');
D('BYD','#c3002f','#ff4d3d',
 '<ellipse cx="100" cy="100" rx="92" ry="52" fill="none" stroke="#c3002f" stroke-width="7"/>'+
 '<text x="100" y="120" '+F+' font-size="54" font-weight="900" letter-spacing="4" text-anchor="middle" fill="#c3002f">BYD</text>');
D('MG','#c3002f','#ff4d3d',
 '<path d="M62 34 H138 L172 68 V132 L138 166 H62 L28 132 V68 Z" fill="none" stroke="#c3002f" stroke-width="8"/>'+
 '<path d="M68 46 H132 L160 74 V126 L132 154 H68 L40 126 V74 Z" fill="none" stroke="#c3002f" stroke-width="3"/>'+
 '<text x="100" y="122" '+F+' font-size="52" font-weight="900" letter-spacing="1" text-anchor="middle" fill="#c3002f">MG</text>');
D('Geely','#0a3d91','#3b82f6',
 '<path d="M100 20 L172 46 V106 C172 146 138 172 100 184 C62 172 28 146 28 106 V46 Z" fill="#0a3d91"/>'+
 '<path d="M46 66 h108 v22 H46 Z M46 112 h108 v22 H46 Z" fill="#c9d8ee"/>'+
 '<path d="M100 46 v112" stroke="#c9d8ee" stroke-width="10"/>'+
 '<path d="M28 46 L100 20 L172 46" fill="none" stroke="#7fc4ff" stroke-width="3"/>');
D('Zeekr','#c8cdd4','#38bdf8',
 '<g fill="none" stroke="#c8cdd4" stroke-width="10" stroke-linecap="square">'+
 '<path d="M40 62 h50 L40 138 h50"/><path d="M110 62 h50"/><path d="M135 62 v76"/><path d="M110 138 h50"/></g>'+
 '<circle cx="100" cy="100" r="86" fill="none" stroke="#38bdf8" stroke-width="2" opacity=".5"/>');
D('Leapmotor','#00a3a3','#38bdf8',
 '<g fill="none" stroke="#00a3a3" stroke-width="11" stroke-linecap="square">'+
 '<path d="M44 56 v88 h44"/><path d="M112 144 V56 h30 c14 0 22 10 22 22 s-8 22 -22 22 h-30"/></g>'+
 T(100,178,13,'LEAPMOTOR',700,2.4,'fill="#00a3a3"'));
D('Chery','#c3002f','#ff4d3d',
 '<ellipse cx="100" cy="100" rx="88" ry="58" fill="none" stroke="#c3002f" stroke-width="8"/>'+
 '<path d="M100 56 L142 144 H118 L100 100 L82 144 H58 Z" fill="#c3002f"/>'+
 '<path d="M84 122 h32" stroke="#fff" stroke-width="7"/>'+
 T(100,176,13,'CHERY',800,3,'fill="#c3002f"'));
D('Omoda','#c8cdd4','#a3e635',
 '<circle cx="100" cy="92" r="52" fill="none" stroke="#c8cdd4" stroke-width="11"/>'+
 '<path d="M100 40 v104" stroke="#c8cdd4" stroke-width="0"/>'+
 '<path d="M62 54 L138 130" stroke="#c8cdd4" stroke-width="9"/>'+
 T(100,178,20,'OMODA',800,5,'fill="#c8cdd4"'));
D('Jaecoo','#c9a227','#ffd166',
 '<path d="M56 46 h88 v72 c0 22 -18 36 -44 36 s-44 -14 -44 -36 h24 c0 10 8 16 20 16 s20 -6 20 -16 V46 Z" fill="#c9a227"/>'+
 T(100,180,18,'JAECOO',800,4,'fill="#c9a227"'),['Jaecco']);
D('Lynk & Co','#c8cdd4','#38bdf8',
 '<g fill="none" stroke="#c8cdd4" stroke-width="9">'+
 '<rect x="26" y="60" width="148" height="80" rx="8"/>'+
 '<path d="M26 100 h148"/></g>'+
 T(100,90,20,'LYNK',900,3,'fill="#c8cdd4"')+T(100,128,20,'& CO',900,3,'fill="#c8cdd4"'),['Lynk and Co','Lynk&Co','Lynk Co']);
D('XPeng','#c8cdd4','#38bdf8',
 '<g fill="#c8cdd4"><path d="M40 44 L100 100 L40 156 H72 L116 116 L100 100 L116 84 L72 44 Z"/>'+
 '<path d="M160 44 L100 100 L160 156 H128 L84 116 L100 100 L84 84 L128 44 Z"/></g>'+
 T(100,182,15,'XPENG',800,4,'fill="#38bdf8"'),['Xpeng']);
D('NIO','#00b0f0','#38bdf8',
 '<path d="M40 96 c14 -30 38 -46 60 -46 s46 16 60 46 z" fill="#00b0f0"/>'+
 '<path d="M40 108 h120 c-14 30 -38 46 -60 46 s-46 -16 -60 -46 z" fill="#5a6a84"/>'+
 T(100,182,16,'NIO',800,5,'fill="#00b0f0"'));
D('VinFast','#003d7c','#38bdf8',
 '<path d="M32 44 L100 156 L168 44 H136 L100 108 L64 44 Z" fill="#003d7c"/>'+
 '<path d="M84 44 L100 74 L116 44 Z" fill="#c3002f"/>'+
 T(100,180,16,'VINFAST',800,3,'fill="#003d7c"'));
D('Bugatti','#be0030','#ff4d3d',
 '<ellipse cx="100" cy="100" rx="90" ry="56" fill="#be0030"/>'+
 '<ellipse cx="100" cy="100" rx="83" ry="49" fill="none" stroke="#fff" stroke-width="2"/>'+
 T(100,92,24,'BUGATTI',800,2.5,'fill="#fff"')+
 T(100,124,17,'EB',800,3,'fill="#ffd166"')+
 '<g fill="#fff"><circle cx="40" cy="100" r="2.5"/><circle cx="160" cy="100" r="2.5"/></g>');
D('Lamborghini','#c9a227','#ffd166',
 '<path d="M100 16 L172 40 V100 C172 146 138 174 100 188 C62 174 28 146 28 100 V40 Z" fill="#12161c" stroke="#c9a227" stroke-width="4"/>'+
 T(100,44,12,'LAMBORGHINI',800,1,'fill="#c9a227"')+
 '<g fill="#c9a227"><path d="M100 70 c14 0 26 8 30 20 c4 12 0 26 -10 34 l-6 20 -14 -12 -14 12 -6 -20 c-10 -8 -14 -22 -10 -34 c4 -12 16 -20 30 -20 Z"/>'+
 '<path d="M74 74 c-12 -6 -20 -18 -18 -30 c10 4 18 12 22 22 z"/><path d="M126 74 c12 -6 20 -18 18 -30 c-10 4 -18 12 -22 22 z"/></g>'+
 '<circle cx="90" cy="96" r="3.5" fill="#12161c"/><circle cx="110" cy="96" r="3.5" fill="#12161c"/>'+
 '<path d="M92 116 q8 8 16 0" stroke="#12161c" stroke-width="3" fill="none"/>');
D('Aston Martin','#c8cdd4','#e8eefc',
 '<g fill="none" stroke="#c8cdd4" stroke-width="4">'+
 '<path d="M100 100 L14 74 L30 92 L14 110 L100 100"/><path d="M100 100 L186 74 L170 92 L186 110 L100 100"/>'+
 '<path d="M34 82 L100 96"/><path d="M34 104 L100 100"/><path d="M166 82 L100 96"/><path d="M166 104 L100 100"/></g>'+
 '<rect x="52" y="84" width="96" height="32" fill="#12161c" stroke="#c8cdd4" stroke-width="3"/>'+
 T(100,98,11,'ASTON',800,1.6,'fill="#c8cdd4"')+T(100,111,11,'MARTIN',800,1.2,'fill="#c8cdd4"'),['Aston']);
D('Smart','#c8cdd4','#ffd166',
 '<circle cx="88" cy="100" r="56" fill="none" stroke="#c8cdd4" stroke-width="9"/>'+
 '<path d="M132 62 h44 v44" fill="none" stroke="#ffd166" stroke-width="9"/>'+
 '<path d="M176 62 L136 102" stroke="#ffd166" stroke-width="9"/>'+
 '<path d="M88 74 c-14 0 -24 10 -24 24 s10 24 24 24 c8 0 14 -4 18 -10 l-12 -8 c-2 3 -4 4 -6 4 c-6 0 -10 -4 -10 -10 s4 -10 10 -10 c2 0 4 1 6 4 l12 -8 c-4 -6 -10 -10 -18 -10 Z" fill="#c8cdd4"/>'+
 T(100,178,17,'smart',700,2,'fill="#c8cdd4"'));
D('Genesis','#c9a227','#ffd166',L['Genesis'].svg);
/* alias supplémentaires */
['Vauxhall','Abarth','DS','MINI','Cupra','Polestar','Range Rover','Infiniti','Genesis','Smart'].forEach(function(k){if(L[k])L[k].alt=L[k].alt||[]});

/* ══════════════════════════════════════════════════════════════
   2. ÉTAT + RÉSOLUTION
   ══════════════════════════════════════════════════════════════ */
var LS={g:function(k,d){try{var v=JSON.parse(localStorage.getItem('kf_'+k));return v==null?d:v}catch(e){return d}},
 s:function(k,v){try{localStorage.setItem('kf_'+k,JSON.stringify(v))}catch(e){}}};
var DEF={mode:'ghost',scale:100,opacity:26,x:0,y:0,rot:0,blur:0,glow:52,grain:16,vignette:62,
 rings:true,particles:true,anim:true,speed:26,parallax:true,tint:true,color:'',wide:false};
var ST=Object.assign({},DEF,LS.g('brandLogo',{}));
var CUR=null,CURKEY=null,raf=0,px=0,py=0,tx=0,ty=0,grainURL=null;
function norm(s){return String(s==null?'':s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
var IDX={};Object.keys(L).forEach(function(k){IDX[norm(k)]=k;(L[k].alt||[]).forEach(function(a){IDX[norm(a)]=k})});
function resolve(brand){
 if(!brand)return null;var n=norm(brand);
 if(IDX[n])return IDX[n];
 if(window.KFCatalog&&KFCatalog.resolveMake){var r=KFCatalog.resolveMake(brand);if(r&&IDX[norm(r)])return IDX[norm(r)]}
 var keys=Object.keys(IDX);
 for(var i=0;i<keys.length;i++){if(keys[i].length>2&&(n.indexOf(keys[i])>=0||keys[i].indexOf(n)>=0))return IDX[keys[i]]}
 return null}
function logoOf(brand){var k=resolve(brand);return k?{key:k,c:L[k].c,c2:L[k].c2,svg:L[k].svg}:null}
function save(){LS.s('brandLogo',ST)}
function toast(m){if(typeof window.toast==='function'){window.toast(m);return}
 var t=document.getElementById('toast');if(!t)return;t.textContent=m;t.classList.remove('hid');t.classList.add('show');
 clearTimeout(t._h);t._h=setTimeout(function(){t.classList.add('hid');t.classList.remove('show')},2600)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function hex2rgb(h){h=String(h||'#22c55e').replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
 var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function shade(h,f){var c=hex2rgb(h);return '#'+c.map(function(v){return Math.max(0,Math.min(255,Math.round(v*f))).toString(16).padStart(2,'0')}).join('')}

/* ══════════════════════════════════════════════════════════════
   3. SVG DU FOND
   ══════════════════════════════════════════════════════════════ */
function tintMatrix(hex,a){var c=hex2rgb(hex);
 return '0 0 0 0 '+(c[0]/255).toFixed(3)+'  0 0 0 0 '+(c[1]/255).toFixed(3)+'  0 0 0 0 '+(c[2]/255).toFixed(3)+'  0 0 0 '+a+' 0'}
function buildSVG(o){
 o=o||{};var lg=o.logo||CUR;if(!lg)return '';
 var col=ST.color||lg.c,c2=lg.c2||col;
 var mode=o.mode||ST.mode;
 var W=1200,H=1200;
 var defs='<defs>'+
  '<linearGradient id="blG" x1="0" y1="0" x2="1" y2="1">'+
   '<stop offset="0" stop-color="'+shade(col,1.35)+'"/><stop offset=".5" stop-color="'+col+'"/><stop offset="1" stop-color="'+c2+'"/></linearGradient>'+
  '<radialGradient id="blH" cx=".5" cy=".5" r=".5">'+
   '<stop offset="0" stop-color="'+col+'" stop-opacity=".55"/><stop offset=".6" stop-color="'+col+'" stop-opacity=".12"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></radialGradient>'+
  '<filter id="blTint" x="-20%" y="-20%" width="140%" height="140%">'+
   '<feColorMatrix type="matrix" values="'+tintMatrix(col,1)+'"/></filter>'+
  '<filter id="blEdge" x="-20%" y="-20%" width="140%" height="140%">'+
   '<feMorphology operator="dilate" radius="1.4" in="SourceAlpha" result="d"/>'+
   '<feComposite in="d" in2="SourceAlpha" operator="out" result="e"/>'+
   '<feFlood flood-color="'+col+'"/><feComposite in2="e" operator="in"/></filter>'+
  '<filter id="blGlow" x="-40%" y="-40%" width="180%" height="180%">'+
   '<feGaussianBlur stdDeviation="'+(2+ST.glow/12).toFixed(1)+'" result="b"/>'+
   '<feFlood flood-color="'+col+'" flood-opacity="'+(ST.glow/140).toFixed(2)+'"/>'+
   '<feComposite in2="b" operator="in" result="g"/>'+
   '<feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'+
  '</defs>';
 var filt=mode==='outline'?'url(#blEdge)':(ST.tint?'url(#blTint)':'');
 if(ST.glow>0&&mode!=='outline')filt=(filt?filt+' ':'')+'url(#blGlow)';
 var inner='<g transform="translate(600 600) scale('+(4.6*ST.scale/100).toFixed(3)+') translate(-100 -100)"'+(filt?' filter="'+filt+'"':'')+'>'+lg.svg+'</g>';
 var body='';
 if(mode==='mosaic'){
  body='';var step=200,sc=.72*ST.scale/100;
  for(var yy=0;yy<6;yy++)for(var xx=0;xx<6;xx++){
   var ox=(xx*step+((yy%2)?100:0))%1200,oy=yy*step;
   body+='<g transform="translate('+(ox+100)+' '+(oy+100)+') scale('+sc.toFixed(3)+') translate(-100 -100)" opacity="'+((xx+yy)%3===0?.9:.5)+'"'+(filt?' filter="'+filt+'"':'')+'>'+lg.svg+'</g>'}
 }else if(mode==='echo'){
  for(var i=3;i>=1;i--){
   body+='<g transform="translate('+(600+i*54)+' '+(600-i*30)+') scale('+(4.6*ST.scale/100*(1+i*.12)).toFixed(3)+') translate(-100 -100)" opacity="'+(0.16/i).toFixed(2)+'"'+(filt?' filter="'+filt+'"':'')+'>'+lg.svg+'</g>'}
  body+=inner;
 }else body=inner;
 var rings='';
 if(ST.rings){for(var r=0;r<4;r++){var rr=250+r*130;
  rings+='<circle cx="600" cy="600" r="'+rr+'" fill="none" stroke="'+col+'" stroke-opacity="'+(0.16-r*0.03).toFixed(2)+'" stroke-width="'+(2-r*0.3).toFixed(1)+'"'+(r%2?' stroke-dasharray="14 22"':'')+'/>'}}
 var halo=ST.glow>0?'<rect width="1200" height="1200" fill="url(#blH)" opacity="'+(ST.glow/100).toFixed(2)+'"/>':'';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="'+W+'" height="'+H+'">'+defs+halo+rings+body+'</svg>'}
function svgURL(){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(buildSVG())}
function miniSVG(brand,size,mono){
 var lg=logoOf(brand);if(!lg)return '';
 var col=mono?(ST.color||lg.c):null;
 var f=col?'<filter id="mt'+size+'"><feColorMatrix type="matrix" values="'+tintMatrix(col,1)+'"/></filter>':'';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="'+size+'" height="'+size+'">'+
  (f?'<defs>'+f+'</defs>':'')+'<g'+(col?' filter="url(#mt'+size+')"':'')+'>'+lg.svg+'</g></svg>'}
function miniURL(brand,size,mono){var s=miniSVG(brand,size,mono);return s?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s):''}

/* ══════════════════════════════════════════════════════════════
   4. CALQUE DE FOND
   ══════════════════════════════════════════════════════════════ */
function grain(){
 if(grainURL)return grainURL;
 var c=document.createElement('canvas');c.width=c.height=128;var x=c.getContext('2d');
 var d=x.createImageData(128,128);
 for(var i=0;i<d.data.length;i+=4){var v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=26}
 x.putImageData(d,0,0);grainURL=c.toDataURL('image/png');return grainURL}
function layer(){
 var el=document.getElementById('brandLayer');
 if(el)return el;
 el=document.createElement('div');el.id='brandLayer';el.setAttribute('aria-hidden','true');
 el.innerHTML='<div class="bl-halo"></div><div class="bl-art"></div><div class="bl-parts"></div><div class="bl-grain"></div><div class="bl-vig"></div>';
 document.body.appendChild(el);
 var p=el.querySelector('.bl-parts');
 for(var i=0;i<16;i++){var s=document.createElement('i');
  s.style.cssText='left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*100).toFixed(1)+'%;'+
   'width:'+(2+Math.random()*4).toFixed(1)+'px;height:'+(2+Math.random()*4).toFixed(1)+'px;'+
   'animation-duration:'+(14+Math.random()*22).toFixed(1)+'s;animation-delay:-'+(Math.random()*20).toFixed(1)+'s';
  p.appendChild(s)}
 return el}
function paint(){
 var el=layer();
 if(!CUR){el.classList.remove('on');document.body.classList.remove('bl-on');return}
 el.classList.add('on');document.body.classList.add('bl-on');
 var col=ST.color||CUR.c;
 el.style.setProperty('--blc',col);
 el.style.setProperty('--blc2',CUR.c2||col);
 el.style.setProperty('--blo',(ST.opacity/100).toFixed(3));
 el.style.setProperty('--blx',ST.x+'%');
 el.style.setProperty('--bly',ST.y+'%');
 el.style.setProperty('--blr',ST.rot+'deg');
 el.style.setProperty('--blb',ST.blur+'px');
 el.style.setProperty('--bldur',ST.speed+'s');
 el.style.setProperty('--blgrain',(ST.grain/100).toFixed(2));
 el.style.setProperty('--blvig',(ST.vignette/100).toFixed(2));
 el.querySelector('.bl-art').style.backgroundImage='url("'+svgURL()+'")';
 el.querySelector('.bl-grain').style.backgroundImage='url("'+grain()+'")';
 el.classList.toggle('anim',!!ST.anim);
 el.classList.toggle('parts',!!ST.particles);
 el.classList.toggle('rings',!!ST.rings);
 var bg=document.getElementById('bgLayer');
 var custom=bg&&bg.style.backgroundImage&&bg.style.backgroundImage!=='none';
 el.classList.toggle('over-custom',!!custom);
 var chip=document.getElementById('blChip');
 if(chip){chip.innerHTML='<img src="'+miniURL(CUR.key,16,false)+'" alt=""> '+esc(CUR.key);chip.classList.remove('hid')}
}
function setBrand(brand,force){
 var lg=logoOf(brand);
 var key=lg?lg.key:null;
 if(!force&&key===CURKEY)return;
 CURKEY=key;CUR=lg;
 if(lg&&!ST.color)ST.color='';
 paint();dockState();
 if(lg){var el=layer();el.classList.remove('swap');void el.offsetWidth;el.classList.add('swap');
  toast('🏷️ '+lg.key+' — logo appliqué au fond')}
}

/* ══════════════════════════════════════════════════════════════
   5. INJECTIONS UI (sélecteur, fiche, titres)
   ══════════════════════════════════════════════════════════════ */
function decorate(){
 /* options du combobox marque */
 var lists=document.querySelectorAll('.cbx-list');
 Array.prototype.forEach.call(lists,function(list){
  Array.prototype.forEach.call(list.querySelectorAll('.cbx-opt'),function(opt){
   if(opt.dataset.bl)return;
   var sp=opt.querySelector('span');if(!sp)return;
   var label=sp.textContent.trim();
   var lg=logoOf(label);
   if(!lg){opt.dataset.bl='0';return}
   opt.dataset.bl='1';
   var img=document.createElement('img');img.className='bl-opt';img.alt='';
   img.src=miniURL(lg.key,20,false);
   opt.insertBefore(img,opt.firstChild);
  })});
 /* fiche véhicule */
 var vr=document.getElementById('vehRead');
 if(vr&&vr.dataset.blKey!==String(CURKEY)){
  var old=vr.querySelector('.bl-badge');if(old)old.remove();
  if(CUR){var b=document.createElement('img');b.className='bl-badge';b.alt=CUR.key;b.src=miniURL(CUR.key,30,false);
   vr.insertBefore(b,vr.firstChild);vr.dataset.blKey=String(CURKEY)}
  else vr.dataset.blKey=''}
 /* titres de résultats + étude */
 var hs=document.querySelectorAll('#srRes .card.accent h2, #stResult .card.accent h2, #view .card.accent h2');
 Array.prototype.forEach.call(hs,function(h){
  if(h.dataset.blKey===String(CURKEY))return;
  var o=h.querySelector('.bl-badge');if(o)o.remove();
  if(CUR){var b=document.createElement('img');b.className='bl-badge';b.alt=CUR.key;b.src=miniURL(CUR.key,26,false);
   h.insertBefore(b,h.firstChild)}
  h.dataset.blKey=String(CURKEY)});
}

/* ══════════════════════════════════════════════════════════════
   6. DOCK DE RÉGLAGES PERMANENT
   ══════════════════════════════════════════════════════════════ */
function rg(id,label,min,max,unit){
 return '<div class="bld-c"><label for="bld_'+id+'">'+label+' <b id="bldo_'+id+'">'+ST[id]+(unit||'')+'</b></label>'+
 '<input type="range" id="bld_'+id+'" data-bld="'+id+'" min="'+min+'" max="'+max+'" value="'+ST[id]+'"></div>'}
function dock(){
 var d=document.getElementById('blDock');if(d)return d;
 d=document.createElement('aside');d.id='blDock';
 d.innerHTML=
 '<div class="bld-head"><span class="bld-mark" id="bldMark">🏷️</span>'+
  '<div class="bld-t"><b>Fond de marque</b><span id="bldName">Aucune marque</span></div>'+
  '<button type="button" class="bld-size" id="bldSize" title="Agrandir / réduire le panneau">⇕</button></div>'+
 '<div class="bld-body">'+
  '<div class="bld-c"><label>Mode de rendu</label><select id="bld_mode" data-bld="mode">'+
   '<option value="ghost">Filigrane monochrome</option><option value="solid">Couleurs officielles</option>'+
   '<option value="outline">Contour lumineux</option><option value="echo">Échos décalés</option>'+
   '<option value="mosaic">Mosaïque</option></select></div>'+
  '<div class="bld-c"><label>Couleur du calque</label>'+
   '<div class="bld-col"><input type="color" id="bld_color" data-bld="color" value="#22c55e">'+
   '<button type="button" class="bld-mini" id="bldReset Color" data-bld-act="brandcolor">Couleur marque</button></div></div>'+
  '<div class="bld-presets" id="bldPresets"></div>'+
  '<div class="bld-sep"></div>'+
  rg('scale','Échelle',20,180,'%')+rg('opacity','Opacité',2,100,'%')+
  rg('x','Position X',-45,45,'%')+rg('y','Position Y',-45,45,'%')+
  rg('rot','Rotation',-180,180,'°')+rg('blur','Flou',0,24,'px')+
  rg('glow','Halo lumineux',0,100,'%')+rg('grain','Grain',0,60,'')+
  rg('vignette','Vignette',0,100,'%')+rg('speed','Cycle animation',6,60,'s')+
  '<div class="bld-tgs">'+
   '<label class="bld-tg" id="bldt_tint"><input type="checkbox" data-bldt="tint"> Monochrome</label>'+
   '<label class="bld-tg" id="bldt_rings"><input type="checkbox" data-bldt="rings"> Anneaux</label>'+
   '<label class="bld-tg" id="bldt_particles"><input type="checkbox" data-bldt="particles"> Particules</label>'+
   '<label class="bld-tg" id="bldt_anim"><input type="checkbox" data-bldt="anim"> Animation</label>'+
   '<label class="bld-tg" id="bldt_parallax"><input type="checkbox" data-bldt="parallax"> Parallaxe</label>'+
  '</div>'+
  '<div class="bld-btns">'+
   '<button type="button" data-bld-act="reset">↺ Réinitialiser</button>'+
   '<button type="button" data-bld-act="rand">🎲 Aléatoire</button>'+
   '<button type="button" class="p" data-bld-act="png">🖼️ Export PNG</button>'+
   '<button type="button" data-bld-act="svg">🧬 Export SVG</button>'+
  '</div>'+
  '<p class="bld-note" id="bldNote">Sélectionne une marque dans <b>Recherche</b> : son logo réel devient le fond d’écran, en direct.</p>'+
 '</div>';
 document.body.appendChild(d);
 d.querySelector('#bldSize').addEventListener('click',function(){
  ST.wide=!ST.wide;save();document.body.classList.toggle('bl-wide',ST.wide)});
 d.addEventListener('input',function(e){
  var k=e.target.dataset&&e.target.dataset.bld;
  if(k){ST[k]=e.target.type==='range'?+e.target.value:e.target.value;
   var o=document.getElementById('bldo_'+k);if(o)o.textContent=ST[k]+(k==='rot'?'°':(k==='blur'?'px':(k==='speed'?'s':(k==='grain'?'':'%'))));
   save();schedule();return}
  var t=e.target.dataset&&e.target.dataset.bldt;
  if(t){ST[t]=e.target.checked;var w=document.getElementById('bldt_'+t);if(w)w.classList.toggle('on',ST[t]);save();schedule()}});
 d.addEventListener('change',function(e){
  var k=e.target.dataset&&e.target.dataset.bld;
  if(k&&e.target.tagName==='SELECT'){ST[k]=e.target.value;save();schedule()}});
 d.addEventListener('click',function(e){
  var p=e.target.closest('[data-blp]');
  if(p){ST.color=p.dataset.blp;document.getElementById('bld_color').value=ST.color;save();schedule();return}
  var b=e.target.closest('[data-bld-act]');if(!b)return;
  var a=b.dataset.bldAct;
  if(a==='brandcolor'){ST.color='';document.getElementById('bld_color').value=CUR?CUR.c:'#22c55e';save();schedule();toast('🎨 Couleur officielle restaurée')}
  else if(a==='reset'){ST=Object.assign({},DEF,{wide:ST.wide});save();syncDock();schedule();toast('↺ Réglages réinitialisés')}
  else if(a==='rand'){
   var modes=['ghost','solid','outline','echo','mosaic'];
   ST.mode=modes[Math.floor(Math.random()*modes.length)];
   ST.scale=60+Math.floor(Math.random()*100);ST.opacity=12+Math.floor(Math.random()*46);
   ST.rot=Math.floor(Math.random()*80)-40;ST.x=Math.floor(Math.random()*40)-20;ST.y=Math.floor(Math.random()*40)-20;
   ST.blur=Math.floor(Math.random()*8);ST.glow=20+Math.floor(Math.random()*70);
   ST.grain=Math.floor(Math.random()*40);ST.vignette=30+Math.floor(Math.random()*60);
   ST.tint=Math.random()<.7;ST.rings=Math.random()<.7;ST.particles=Math.random()<.8;
   save();syncDock();schedule();toast('🎲 Variante générée')}
  else if(a==='png')exportPNG();
  else if(a==='svg')exportSVG()});
 syncDock();
 return d}
function syncDock(){
 var d=document.getElementById('blDock');if(!d)return;
 ['mode'].forEach(function(k){var e=d.querySelector('#bld_'+k);if(e)e.value=ST[k]});
 var c=d.querySelector('#bld_color');if(c)c.value=ST.color||(CUR?CUR.c:'#22c55e');
 ['scale','opacity','x','y','rot','blur','glow','grain','vignette','speed'].forEach(function(k){
  var e=d.querySelector('#bld_'+k);if(e)e.value=ST[k];
  var o=d.querySelector('#bldo_'+k);if(o)o.textContent=ST[k]+(k==='rot'?'°':(k==='blur'?'px':(k==='speed'?'s':(k==='grain'?'':'%'))))});
 ['tint','rings','particles','anim','parallax'].forEach(function(k){
  var w=d.querySelector('#bldt_'+k);if(!w)return;w.querySelector('input').checked=!!ST[k];w.classList.toggle('on',!!ST[k])});
 document.body.classList.toggle('bl-wide',!!ST.wide);
 var pal=['#22c55e','#a3e635','#38bdf8','#ffb020','#ff4d3d','#c9a227','#a855f7','#e8eefc'];
 var pr=d.querySelector('#bldPresets');
 if(pr&&!pr.childNodes.length)pr.innerHTML=pal.map(function(x){return '<button type="button" data-blp="'+x+'" style="background:'+x+'" title="'+x+'"></button>'}).join('');
}
function dockState(){
 var d=document.getElementById('blDock');if(!d)return;
 var n=d.querySelector('#bldName'),m=d.querySelector('#bldMark'),note=d.querySelector('#bldNote');
 if(CUR){
  n.textContent=CUR.key;
  m.innerHTML='<img src="'+miniURL(CUR.key,26,false)+'" alt="">';
  note.innerHTML='Logo vectoriel <b>'+esc(CUR.key)+'</b> · couleur officielle <code>'+esc(CUR.c)+'</code>. Les réglages s’appliquent en direct.';
  var c=d.querySelector('#bld_color');if(c&&!ST.color)c.value=CUR.c;
 }else{
  n.textContent='Aucune marque';m.textContent='🏷️';
  note.innerHTML='Sélectionne une marque dans <b>Recherche</b> : son logo réel devient le fond d’écran, en direct.';
 }
}
function schedule(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;paint();decorate()})}

/* ══════════════════════════════════════════════════════════════
   7. EXPORT
   ══════════════════════════════════════════════════════════════ */
function dl(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href)},6000)}
function exportSVG(){
 if(!CUR){toast('Sélectionne d’abord une marque');return}
 dl(new Blob([buildSVG()],{type:'image/svg+xml'}),'kev-fusion-fond-'+CUR.key.toLowerCase().replace(/\s+/g,'-')+'.svg');
 toast('🧬 SVG exporté')}
function exportPNG(){
 if(!CUR){toast('Sélectionne d’abord une marque');return}
 var im=new Image();
 im.onload=function(){
  var S=1600,c=document.createElement('canvas');c.width=c.height=S;var x=c.getContext('2d');
  var g=x.createLinearGradient(0,0,S,S);
  g.addColorStop(0,'#04140c');g.addColorStop(.55,'#0a1f14');g.addColorStop(1,'#0d1a26');
  x.fillStyle=g;x.fillRect(0,0,S,S);
  x.globalAlpha=Math.max(.12,ST.opacity/100);x.drawImage(im,0,0,S,S);x.globalAlpha=1;
  var v=x.createRadialGradient(S/2,S*.46,S*.16,S/2,S/2,S*.78);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,'+(ST.vignette/140).toFixed(2)+')');
  x.fillStyle=v;x.fillRect(0,0,S,S);
  c.toBlob(function(b){dl(b,'kev-fusion-fond-'+CUR.key.toLowerCase().replace(/\s+/g,'-')+'.png');toast('🖼️ PNG 1600×1600 exporté')},'image/png')};
 im.onerror=function(){toast('Export impossible')};
 im.src=svgURL()}

/* ══════════════════════════════════════════════════════════════
   8. PARALLAXE + SURVEILLANCE
   ══════════════════════════════════════════════════════════════ */
var praf=0;
function pointer(e){
 if(!ST.parallax||!CUR)return;
 var w=window.innerWidth,h=window.innerHeight;
 tx=((e.clientX/w)-.5)*26;ty=((e.clientY/h)-.5)*20;
 if(praf)return;
 praf=requestAnimationFrame(function loop(){
  px+=(tx-px)*.08;py+=(ty-py)*.08;
  var el=document.getElementById('brandLayer');
  if(el){el.style.setProperty('--blpx',px.toFixed(2)+'px');el.style.setProperty('--blpy',py.toFixed(2)+'px')}
  if(Math.abs(tx-px)>.2||Math.abs(ty-py)>.2)praf=requestAnimationFrame(loop);else praf=0})}
function currentBrand(){
 try{if(typeof S!=='undefined'&&S.vehicle&&S.vehicle.brand)return S.vehicle.brand}catch(e){}
 var vr=document.getElementById('vehRead');
 if(vr){var b=vr.querySelector('b');if(b&&b.textContent.trim())return b.textContent.trim()}
 return null}
var lastB=null,lastView=null;
function tick(){
 var b=currentBrand();
 if(b!==lastB){lastB=b;setBrand(b)}
 var v=null;try{v=(typeof S!=='undefined'&&S.view)||null}catch(e){}
 var app=document.getElementById('app');
 var visible=app&&!app.classList.contains('hid');
 var show=visible&&(v==='recherche'||v==='etude'||v==='vin'||v===null||v==='accueil');
 document.body.classList.toggle('bl-dock',!!show);
 if(v!==lastView){lastView=v;decorate()}
 decorate()}

/* ══════════════════════════════════════════════════════════════
   9. CSS
   ══════════════════════════════════════════════════════════════ */
function css(){
 if(document.getElementById('blCss'))return;
 var s=document.createElement('style');s.id='blCss';
 s.textContent=
 '#brandLayer{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:0;transition:opacity .5s;overflow:hidden;'+
  '--blc:#22c55e;--blc2:#a3e635;--blo:.26;--blx:0%;--bly:0%;--blr:0deg;--blb:0px;--bldur:26s;--blgrain:.16;--blvig:.62;--blpx:0px;--blpy:0px}'+
 '#brandLayer.on{opacity:1}'+
 '#brandLayer.over-custom{opacity:.62}'+
 '#brandLayer .bl-halo{position:absolute;inset:-10%;background:radial-gradient(46% 42% at 50% 46%,var(--blc) 0%,transparent 62%);opacity:.14;filter:blur(30px)}'+
 '#brandLayer .bl-art{position:absolute;inset:-8%;background-repeat:no-repeat;background-position:center;background-size:contain;'+
  'opacity:var(--blo);filter:blur(var(--blb));transform:translate3d(calc(var(--blx) + var(--blpx)),calc(var(--bly) + var(--blpy)),0) rotate(var(--blr));'+
  'transition:opacity .4s,filter .3s}'+
 '#brandLayer.anim .bl-art{animation:blFloat var(--bldur) ease-in-out infinite alternate}'+
 '@keyframes blFloat{0%{transform:translate3d(calc(var(--blx) + var(--blpx) - 1.2%),calc(var(--bly) + var(--blpy) + 1%),0) rotate(calc(var(--blr) - 1.6deg)) scale(1)}'+
  '100%{transform:translate3d(calc(var(--blx) + var(--blpx) + 1.2%),calc(var(--bly) + var(--blpy) - 1%),0) rotate(calc(var(--blr) + 1.6deg)) scale(1.045)}}'+
 '#brandLayer.swap .bl-art{animation:blIn .7s cubic-bezier(.2,.8,.2,1)}'+
 '@keyframes blIn{0%{opacity:0;filter:blur(26px);transform:translate3d(var(--blx),var(--bly),0) rotate(var(--blr)) scale(.82)}'+
  '100%{opacity:var(--blo);filter:blur(var(--blb))}}'+
 '#brandLayer .bl-parts{position:absolute;inset:0;display:none}'+
 '#brandLayer.parts .bl-parts{display:block}'+
 '#brandLayer .bl-parts i{position:absolute;border-radius:50%;background:var(--blc);opacity:.5;'+
  'box-shadow:0 0 10px var(--blc);animation:blDrift 20s linear infinite}'+
 '@keyframes blDrift{0%{transform:translate3d(0,20px,0);opacity:0}'+
  '20%{opacity:.55}80%{opacity:.4}100%{transform:translate3d(26px,-120px,0);opacity:0}}'+
 '#brandLayer .bl-grain{position:absolute;inset:0;opacity:var(--blgrain);mix-blend-mode:overlay;background-repeat:repeat}'+
 '#brandLayer .bl-vig{position:absolute;inset:0;background:radial-gradient(58% 54% at 50% 46%,transparent 30%,rgba(2,8,5,var(--blvig)) 100%)}'+
 '.bl-badge{width:26px;height:26px;vertical-align:-6px;margin-right:8px;filter:drop-shadow(0 2px 6px #000a)}'+
 '.bl-opt{width:20px;height:20px;flex:none;margin-right:8px;filter:drop-shadow(0 1px 3px #0008)}'+
 '.cbx-opt{align-items:center}'+
 '#blChip{display:inline-flex;align-items:center;gap:5px}#blChip img{width:16px;height:16px}'+
 /* dock */
 '#blDock{position:fixed;z-index:70;display:none;flex-direction:column;'+
  'background:linear-gradient(168deg,#06180fF2,#101c2eF2 70%);border:1px solid #25314a;'+
  'box-shadow:0 18px 48px #000b,0 0 0 1px #22c55e22;backdrop-filter:blur(14px);overflow:hidden}'+
 'body.bl-dock #blDock{display:flex}'+
 '.bld-head{display:flex;align-items:center;gap:10px;padding:11px 13px;border-bottom:1px solid #25314a;'+
  'background:linear-gradient(90deg,#22c55e18,transparent)}'+
 '.bld-mark{width:32px;height:32px;flex:none;display:grid;place-items:center;border-radius:10px;font-size:17px;'+
  'background:#0f1625;border:1px solid #334466}'+
 '.bld-mark img{width:26px;height:26px}'+
 '.bld-t{flex:1;min-width:0}.bld-t b{display:block;font-size:13px;color:#e8eefc;font-weight:800}'+
 '.bld-t span{display:block;font-size:11px;color:#a3e635;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.bld-size{flex:none;background:#0f1625;border:1px solid #334466;color:#c4cfe0;border-radius:9px;padding:5px 9px;cursor:pointer;font-size:14px}'+
 '.bld-size:hover{border-color:#22c55e;color:#a3e635}'+
 '.bld-body{flex:1;overflow:auto;padding:12px 13px 14px}'+
 '.bld-body::-webkit-scrollbar{width:10px}'+
 '.bld-body::-webkit-scrollbar-track{background:#04140c;border-radius:8px}'+
 '.bld-body::-webkit-scrollbar-thumb{background:linear-gradient(#22c55e,#38bdf8);border-radius:8px;border:2px solid #04140c}'+
 '.bld-body::-webkit-scrollbar-thumb:hover{background:#a3e635}'+
 '.bld-body{scrollbar-width:thin;scrollbar-color:#22c55e #04140c}'+
 '.bld-c{margin-bottom:11px}'+
 '.bld-c label{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:4px;'+
  'font-size:10px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:#8899b4}'+
 '.bld-c label b{color:#a3e635;font-family:ui-monospace,monospace;font-size:11px}'+
 '.bld-c select{width:100%;background:#0f1625;border:1px solid #334466;color:#e8eefc;border-radius:9px;padding:8px 10px;font-size:12.5px;margin:0}'+
 '.bld-c select:focus{outline:none;border-color:#22c55e;box-shadow:0 0 0 3px #22c55e2e}'+
 '.bld-c input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;margin:2px 0 0;padding:0;border:0;'+
  'background:linear-gradient(90deg,#22c55e,#a3e635,#38bdf8)}'+
 '.bld-c input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;border-radius:50%;background:#e8eefc;'+
  'border:3px solid #22c55e;box-shadow:0 0 10px #22c55eaa;cursor:grab}'+
 '.bld-c input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:#e8eefc;border:3px solid #22c55e;cursor:grab}'+
 '.bld-col{display:flex;gap:7px;align-items:center}'+
 '.bld-col input[type=color]{width:52px;height:32px;flex:none;border:1px solid #334466;border-radius:9px;background:#0f1625;padding:2px;cursor:pointer;margin:0}'+
 '.bld-mini{flex:1;background:#0f1625;border:1px solid #334466;color:#c4cfe0;border-radius:9px;padding:7px;font-size:11.5px;font-weight:700;cursor:pointer}'+
 '.bld-mini:hover{border-color:#22c55e;color:#a3e635}'+
 '.bld-presets{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:11px}'+
 '.bld-presets button{width:26px;height:26px;border-radius:8px;border:2px solid #25314a;cursor:pointer;padding:0;transition:.15s}'+
 '.bld-presets button:hover{border-color:#a3e635;transform:scale(1.14)}'+
 '.bld-sep{height:1px;background:linear-gradient(90deg,#22c55e66,#38bdf866,transparent);margin:12px 0}'+
 '.bld-tgs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:11px}'+
 '.bld-tg{display:flex;align-items:center;gap:6px;font-size:10.5px;color:#8899b4;background:#0f1625;border:1px solid #334466;'+
  'border-radius:18px;padding:5px 10px;cursor:pointer;user-select:none}'+
 '.bld-tg input{width:auto;margin:0;accent-color:#22c55e}'+
 '.bld-tg.on{color:#a3e635;border-color:#22c55e;background:#22c55e14}'+
 '.bld-btns{display:grid;grid-template-columns:1fr 1fr;gap:7px}'+
 '.bld-btns button{border-radius:9px;padding:9px;font-size:11.5px;font-weight:800;cursor:pointer;border:1px solid #334466;background:#0f1625;color:#e8eefc}'+
 '.bld-btns button:hover{border-color:#22c55e;transform:translateY(-1px)}'+
 '.bld-btns .p{grid-column:1/-1;background:linear-gradient(135deg,#22c55e,#a3e635);border-color:#22c55e;color:#04140c}'+
 '.bld-note{font-size:10.5px;color:#8899b4;line-height:1.55;margin:11px 0 0}'+
 '.bld-note b{color:#e8eefc}.bld-note code{font-family:ui-monospace,monospace;color:#a3e635;background:#a3e63514;padding:1px 5px;border-radius:5px}'+
 /* desktop */
 '@media(min-width:1100px){'+
  '#blDock{right:14px;top:74px;width:322px;max-height:calc(100vh - 92px);border-radius:16px}'+
  'body.bl-wide #blDock{width:392px}'+
  'body.bl-dock main,body.bl-dock section{margin-left:auto;margin-right:352px}'+
  'body.bl-dock.bl-wide main,body.bl-dock.bl-wide section{margin-right:422px}'+
 '}'+
 /* mobile / tablette : dock bas permanent */
 '@media(max-width:1099px){'+
  '#blDock{left:8px;right:8px;bottom:8px;height:196px;border-radius:14px}'+
  'body.bl-wide #blDock{height:330px}'+
  'body.bl-dock main{padding-bottom:214px}'+
  'body.bl-dock.bl-wide main{padding-bottom:348px}'+
  '.bld-body{display:grid;grid-template-columns:1fr 1fr;gap:0 12px;align-content:start}'+
  '.bld-head{padding:8px 11px}'+
  '.bld-presets,.bld-sep,.bld-tgs,.bld-btns,.bld-note{grid-column:1/-1}'+
  '#toast{bottom:auto;top:70px}'+
 '}'+
 '@media(max-width:520px){.bld-body{grid-template-columns:1fr}#blDock{height:210px}body.bl-dock main{padding-bottom:228px}}'+
 '@media (prefers-reduced-motion:reduce){#brandLayer .bl-art,#brandLayer .bl-parts i{animation:none!important}}';
 document.head.appendChild(s)}

/* ══════════════════════════════════════════════════════════════
   10. BOOT
   ══════════════════════════════════════════════════════════════ */
function chip(){
 var host=document.querySelector('.chips');if(!host||document.getElementById('blChip'))return;
 var s=document.createElement('span');s.id='blChip';s.className='chip hid';host.appendChild(s)}
function boot(){
 css();layer();dock();chip();
 window.addEventListener('pointermove',pointer,{passive:true});
 document.addEventListener('kf:vehicle',function(e){
  var b=e.detail&&e.detail.brand;if(b)setBrand(b)});
 var mo=new MutationObserver(function(){decorate()});
 mo.observe(document.body,{childList:true,subtree:true});
 setInterval(tick,420);
 tick();paint();decorate();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.KFBrandLogo={set:function(b){setBrand(b,true)},logos:L,resolve:resolve,mini:miniURL,
 svg:buildSVG,png:exportPNG,exportSVG:exportSVG,state:ST,refresh:function(){paint();decorate()}};
})();
