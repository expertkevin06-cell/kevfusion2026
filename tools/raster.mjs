/* KEV FUSION — mini-moteur 2D + encodeur PNG. Zéro dépendance (zlib natif Node).
   Supporte : transforms, paths (move/line/quad/bezier/arc/ellipse/rect), fill, stroke,
   clip, gradients linéaire/radial, globalAlpha, supersampling AA. */
import zlib from 'node:zlib';

/* ---------- encodeur PNG ---------- */
const CRCT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRCT[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function chunk(type,data){
  const len=Buffer.alloc(4);len.writeUInt32BE(data.length,0);
  const td=Buffer.concat([Buffer.from(type,'ascii'),data]);
  const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(td),0);
  return Buffer.concat([len,td,crc]);
}
export function encodePNG(w,h,rgba){
  const raw=Buffer.alloc((w*4+1)*h);
  for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;rgba.copy?rgba.copy(raw,y*(w*4+1)+1,y*w*4,(y+1)*w*4):Buffer.from(rgba.buffer,y*w*4,w*4).copy(raw,y*(w*4+1)+1)}
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);
  ihdr[8]=8;ihdr[9]=6;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}

/* ---------- maths ---------- */
const M=(a,b,c,d,e,f)=>({a,b,c,d,e,f});
const mul=(m,n)=>M(m.a*n.a+m.c*n.b,m.b*n.a+m.d*n.b,m.a*n.c+m.c*n.d,m.b*n.c+m.d*n.d,m.a*n.e+m.c*n.f+m.e,m.b*n.e+m.d*n.f+m.f);
const ap=(m,x,y)=>[m.a*x+m.c*y+m.e,m.b*x+m.d*y+m.f];
function parseCol(s){
  if(typeof s!=='string')return [0,0,0,1];
  s=s.trim();
  if(s[0]==='#'){let h=s.slice(1);if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    const n=parseInt(h,16);return [(n>>16)&255,(n>>8)&255,n&255,1]}
  let m=s.match(/rgba?\(([^)]+)\)/);
  if(m){const p=m[1].split(',').map(v=>parseFloat(v));return [p[0]|0,p[1]|0,p[2]|0,p.length>3?p[3]:1]}
  if(s==='transparent')return [0,0,0,0];
  return [0,0,0,1];
}
class Grad{
  constructor(kind,g){this.kind=kind;this.g=g;this.stops=[]}
  addColorStop(o,c){this.stops.push([o,parseCol(c)]);this.stops.sort((a,b)=>a[0]-b[0]);return this}
  at(t){const s=this.stops;if(!s.length)return [0,0,0,0];
    if(t<=s[0][0])return s[0][1];if(t>=s[s.length-1][0])return s[s.length-1][1];
    for(let i=1;i<s.length;i++){if(t<=s[i][0]){const [o0,c0]=s[i-1],[o1,c1]=s[i];
      const k=(t-o0)/(o1-o0||1);return [c0[0]+(c1[0]-c0[0])*k,c0[1]+(c1[1]-c0[1])*k,c0[2]+(c1[2]-c0[2])*k,c0[3]+(c1[3]-c0[3])*k]}}
    return s[s.length-1][1]}
}

/* ---------- contexte ---------- */
export class Ctx{
  constructor(w,h,ss=3){
    this.W=w*ss;this.H=h*ss;this.ss=ss;this.outW=w;this.outH=h;
    this.buf=new Float64Array(this.W*this.H*4);
    this.m=M(ss,0,0,ss,0,0);
    this.stack=[];this.clipMask=null;
    this.fillStyle='#000';this.strokeStyle='#000';this.lineWidth=1;this.globalAlpha=1;this.lineCap='butt';
    this.path=[];this.cur=null;this.start=null;
  }
  save(){this.stack.push({m:this.m,clip:this.clipMask,fs:this.fillStyle,ss:this.strokeStyle,lw:this.lineWidth,ga:this.globalAlpha,lc:this.lineCap})}
  restore(){const s=this.stack.pop();if(!s)return;this.m=s.m;this.clipMask=s.clip;this.fillStyle=s.fs;this.strokeStyle=s.ss;this.lineWidth=s.lw;this.globalAlpha=s.ga;this.lineCap=s.lc}
  translate(x,y){this.m=mul(this.m,M(1,0,0,1,x,y))}
  scale(x,y){this.m=mul(this.m,M(x,0,0,y,0,0))}
  rotate(r){const c=Math.cos(r),s=Math.sin(r);this.m=mul(this.m,M(c,s,-s,c,0,0))}
  createLinearGradient(x0,y0,x1,y1){return new Grad('lin',{x0,y0,x1,y1,m:this.m})}
  createRadialGradient(x0,y0,r0,x1,y1,r1){return new Grad('rad',{x0,y0,r0,x1,y1,r1,m:this.m})}
  beginPath(){this.path=[];this.cur=null;this.start=null}
  moveTo(x,y){this.cur=[ap(this.m,x,y)];this.start=this.cur[0];this.path.push(this.cur)}
  lineTo(x,y){if(!this.cur)this.moveTo(x,y);else this.cur.push(ap(this.m,x,y))}
  quadraticCurveTo(cx,cy,x,y){
    if(!this.cur)this.moveTo(cx,cy);
    const p0=this.cur[this.cur.length-1],c=ap(this.m,cx,cy),p=ap(this.m,x,y);
    const n=18;for(let i=1;i<=n;i++){const t=i/n,u=1-t;
      this.cur.push([u*u*p0[0]+2*u*t*c[0]+t*t*p[0],u*u*p0[1]+2*u*t*c[1]+t*t*p[1]])}}
  bezierCurveTo(c1x,c1y,c2x,c2y,x,y){
    if(!this.cur)this.moveTo(c1x,c1y);
    const p0=this.cur[this.cur.length-1],a=ap(this.m,c1x,c1y),b=ap(this.m,c2x,c2y),p=ap(this.m,x,y);
    const n=22;for(let i=1;i<=n;i++){const t=i/n,u=1-t;
      this.cur.push([u*u*u*p0[0]+3*u*u*t*a[0]+3*u*t*t*b[0]+t*t*t*p[0],u*u*u*p0[1]+3*u*u*t*a[1]+3*u*t*t*b[1]+t*t*t*p[1]])}}
  closePath(){if(this.cur&&this.start)this.cur.push(this.start.slice());this.cur=null}
  rect(x,y,w,h){this.moveTo(x,y);this.lineTo(x+w,y);this.lineTo(x+w,y+h);this.lineTo(x,y+h);this.closePath()}
  arc(cx,cy,r,a0,a1,ccw){
    let d=a1-a0;if(!ccw&&d<0)d+=Math.PI*2;if(ccw&&d>0)d-=Math.PI*2;
    const n=Math.max(10,Math.ceil(Math.abs(d)/0.14));
    for(let i=0;i<=n;i++){const a=a0+d*i/n,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
      if(i===0&&!this.cur)this.moveTo(x,y);else this.lineTo(x,y)}}
  ellipse(cx,cy,rx,ry,rot,a0,a1){
    const n=Math.max(14,Math.ceil(Math.abs(a1-a0)/0.12)),c=Math.cos(rot||0),s=Math.sin(rot||0);
    for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,ex=Math.cos(a)*rx,ey=Math.sin(a)*ry;
      const x=cx+ex*c-ey*s,y=cy+ex*s+ey*c;
      if(i===0&&!this.cur)this.moveTo(x,y);else this.lineTo(x,y)}}
  clearRect(){this.buf.fill(0)}
  fillRect(x,y,w,h){this.beginPath();this.rect(x,y,w,h);this.fill()}
  clip(){const m=this._mask(this.path);
    if(this.clipMask){const o=this.clipMask;for(let i=0;i<m.length;i++)m[i]=Math.min(m[i],o[i])}
    this.clipMask=m}
  _mask(polys){
    const mask=new Float64Array(this.W*this.H);
    for(const p of polys){if(p.length<3)continue;this._scan(p,(idx)=>{mask[idx]=1})}
    return mask}
  _scan(p,cb){
    let minY=Infinity,maxY=-Infinity;
    for(const q of p){if(q[1]<minY)minY=q[1];if(q[1]>maxY)maxY=q[1]}
    const y0=Math.max(0,Math.floor(minY)),y1=Math.min(this.H-1,Math.ceil(maxY));
    const xs=[];
    for(let y=y0;y<=y1;y++){
      const yc=y+0.5;xs.length=0;
      for(let i=0,j=p.length-1;i<p.length;j=i++){
        const a=p[j],b=p[i];
        if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc))
          xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
      xs.sort((u,v)=>u-v);
      for(let k=0;k+1<xs.length;k+=2){
        const xa=Math.max(0,Math.ceil(xs[k]-0.5)),xb=Math.min(this.W-1,Math.floor(xs[k+1]-0.5));
        for(let x=xa;x<=xb;x++)cb(y*this.W+x)}}
  }
  _paint(polys,style){
    const W=this.W,H=this.H,buf=this.buf,ga=this.globalAlpha,clip=this.clipMask;
    let grad=null,gc=null;
    if(style instanceof Grad){grad=style;
      const g=style.g,m=g.m;
      if(style.kind==='lin'){const A=ap(m,g.x0,g.y0),B=ap(m,g.x1,g.y1);
        gc={k:'lin',ax:A[0],ay:A[1],dx:B[0]-A[0],dy:B[1]-A[1]};gc.len2=gc.dx*gc.dx+gc.dy*gc.dy||1}
      else{const C=ap(m,g.x1,g.y1),P0=ap(m,g.x0,g.y0);
        const sc=Math.hypot(m.a,m.b)||1;
        gc={k:'rad',cx:C[0],cy:C[1],r0:g.r0*sc,r1:Math.max(g.r1*sc,0.001),px:P0[0],py:P0[1]}}}
    const col=grad?null:parseCol(style);
    for(const p of polys){
      if(p.length<3)continue;
      this._scan(p,(idx)=>{
        const x=idx%W,y=(idx-x)/W;
        let c;
        if(grad){let t;
          if(gc.k==='lin')t=((x+0.5-gc.ax)*gc.dx+(y+0.5-gc.ay)*gc.dy)/gc.len2;
          else{const d=Math.hypot(x+0.5-gc.cx,y+0.5-gc.cy);t=(d-gc.r0)/(gc.r1-gc.r0)}
          c=grad.at(Math.max(0,Math.min(1,t)))}
        else c=col;
        let a=c[3]*ga;if(clip)a*=clip[idx];
        if(a<=0)return;
        const o=idx*4,ia=1-a;
        buf[o]=c[0]*a+buf[o]*ia;buf[o+1]=c[1]*a+buf[o+1]*ia;buf[o+2]=c[2]*a+buf[o+2]*ia;
        buf[o+3]=a+buf[o+3]*ia})}
  }
  fill(){this._paint(this.path,this.fillStyle)}
  stroke(){
    const w=this.lineWidth*(Math.hypot(this.m.a,this.m.b)||1);
    const polys=[];
    for(const p of this.path){
      for(let i=1;i<p.length;i++){
        const a=p[i-1],b=p[i],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);
        if(L<1e-6)continue;
        const nx=-dy/L*w/2,ny=dx/L*w/2;
        polys.push([[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]])}
      if(this.lineCap==='round')for(const q of p){
        const c=[],n=10;for(let i=0;i<n;i++){const t=i/n*Math.PI*2;c.push([q[0]+Math.cos(t)*w/2,q[1]+Math.sin(t)*w/2])}
        polys.push(c)}}
    this._paint(polys,this.strokeStyle)}
  toPNG(){
    const {W,H,ss,outW,outH,buf}=this;
    const out=Buffer.alloc(outW*outH*4),n=ss*ss;
    for(let y=0;y<outH;y++)for(let x=0;x<outW;x++){
      let r=0,g=0,b=0,a=0;
      for(let dy=0;dy<ss;dy++)for(let dx=0;dx<ss;dx++){
        const o=((y*ss+dy)*W+(x*ss+dx))*4;
        const al=buf[o+3];r+=buf[o]*al;g+=buf[o+1]*al;b+=buf[o+2]*al;a+=al}
      const i=(y*outW+x)*4;
      if(a>0){out[i]=Math.round(r/a);out[i+1]=Math.round(g/a);out[i+2]=Math.round(b/a)}
      out[i+3]=Math.round(Math.min(1,a/n)*255)}
    return encodePNG(outW,outH,out)}
}
export function makeCtx(size,ss=3){return new Ctx(size,size,ss)}
