// 30-day balance simulation for 룬 대장간. Rules mirror src/game.html; P holds the tunable numbers.
const SYM=['flame','hammer','star','stone','crack','skull'];
function at(pt,L){for(let i=1;i<pt.length;i++)if(L<=pt[i][0]){const a=pt[i-1],b=pt[i];return a[1]+(b[1]-a[1])*(L-a[0])/(b[0]-a[0]);}return pt[pt.length-1][1];}
function buildOD(C){const OD=[];for(let L=0;L<=40;L++){const g=at(C.g,L),c=at(C.c,L),k=at(C.k,L),w={flame:g*.4,hammer:g*.4,star:g*.2,stone:Math.max(.02,1-g-c-k),crack:c,skull:k};let t=0;for(const s of SYM)t+=w[s];
 const o={great3:0,great2:0,up:0,keep:0,down:0,destroy:0};
 for(const a of SYM)for(const b of SYM)for(const d of SYM){const n={};[a,b,d].forEach(s=>n[s]=(n[s]||0)+1);
  const r=(n.skull||0)>=2?'destroy':n.crack?'down':n.star===3?'great3':(n.flame===3||n.hammer===3)?'great2':((n.flame||0)+(n.hammer||0)+(n.star||0)===3)?'up':'keep';o[r]+=w[a]*w[b]*w[d]/(t*t*t);}
 OD.push(o);}return OD;}
function step(OD,L){const o=OD[L];let r=Math.random();if((r-=o.great3)<0)return Math.min(40,L+4);if((r-=o.great2)<0)return Math.min(40,L+2);if((r-=o.up)<0)return Math.min(40,L+1);if((r-=o.keep)<0)return L;if((r-=o.down)<0)return Math.max(0,L-1);return -1;}
const form=l=>Math.min(20,Math.floor(l/2));
const OLD={g:[[0,.888],[10,.705],[20,.531],[30,.412],[40,.3]],c:[[0,.017],[10,.042],[20,.053],[30,.064],[40,.074]],k:[[0,0],[3,0],[4,.04],[10,.148],[20,.232],[30,.298],[40,.365]]};
const BASE={curve:OLD,tribBase:30,tribGrow:1.17,tribLin:0,orcA:.8,orcB:.3,orcPow:1,costA:0,costB:6,costG:1.25,sellBase:25,sellGrow:1.6,forgeCost:[800,3000,12000,45000],capBase:2,loot:12,loseCut:.3,needWin:30,needEsc:15,start:300,supplyBase:3,kid:3,wear:.35};
function prep(P){if(!P.OD)P.OD=buildOD(P.curve);return P;}
function costOf(P,L,forge){return L===0?0:Math.round((P.costA*L+P.costB*Math.pow(P.costG,L/2))*(1-.05*(forge-1)));}
function sellOf(P,L,forge){return L===0?0:Math.round(P.sellBase*Math.pow(P.sellGrow,L/2)*(1+.1*(forge-1)));}
function tribOf(P,d){return Math.round((P.tribBase+P.tribLin*(d-1))*Math.pow(P.tribGrow,d-1));}
function run(P,pol){
 let cr=P.start,forge=1,kid=P.kid,rack=[],anvil=null,paid=0,missed=0,wins=0,losses=0,best=0;
 const def=()=>rack.reduce((a,l)=>a+form(l)+1,0);
 for(let d=1;d<=30;d++){
  const orc=d<2||d>=30?0:Math.round(Math.pow(d,P.orcPow)*P.orcA+Math.random()*Math.pow(d,P.orcPow)*P.orcB);
  let stock=P.supplyBase+Math.floor((forge-1)/2);
  if(d%3===0){while(forge<5&&cr-P.forgeCost[forge-1]>=pol.reserve*tribOf(P,d)){cr-=P.forgeCost[forge-1];forge++;}}
  const cap=P.capBase+forge,due=d<30?tribOf(P,d):0;
  while(stock>0||anvil!==null){
   if(anvil===null){stock--;anvil=0;}
   const wantDef=d>=30?0:Math.max(orc,Math.pow(d+2,P.orcPow)*(P.orcA+P.orcB))*pol.margin;
   const needRack=rack.length<cap&&(def()<wantDef||d>=pol.hoardFrom);
   const upgrade=!needRack&&d>=pol.hoardFrom&&rack.length>=cap;
   const target=needRack||upgrade?pol.rackT(d):pol.sellT(d);
   let L=anvil;
   while(L>=0&&L<target&&cr-costOf(P,L,forge)>=(needRack||upgrade?due:0)){cr-=costOf(P,L,forge);L=step(P.OD,L);}
   if(L<0){anvil=null;continue;}
   best=Math.max(best,L);
   if(needRack&&L>=2)rack.push(L);
   else if(upgrade&&L>Math.min(...rack)){const i=rack.indexOf(Math.min(...rack));cr+=sellOf(P,rack[i],forge);rack[i]=L;}
   else if(L>0)cr+=sellOf(P,L,forge);
   anvil=null;
  }
  if(d>=30)break;
  if(cr>=due){cr-=due;paid++;}else{cr=0;kid=Math.max(0,kid-1);missed++;}
  if(d>=2){const a=def();let ha=40+a*10,hb=40+orc*10,t=0;
   while(ha>0&&hb>0){const me=t%2===0,pw=me?a:orc,dm=Math.round((6+pw*2)*(.6+Math.random()*.8));if(me)hb-=dm;else ha-=dm;t++;}
   if(hb<=0){wins++;cr+=20+orc*P.loot;if(rack.length&&Math.random()<P.wear){const i=Math.random()*rack.length|0;if(rack[i]>2)rack[i]-=2;}}
   else{losses++;cr-=Math.round(cr*P.loseCut);if(rack.length){const i=rack.indexOf(Math.max(...rack));if(P.loseDrop){rack[i]-=P.loseDrop;if(rack[i]<2)rack.splice(i,1);}else rack.splice(i,1);}}}
 }
 const pw=rack.reduce((a,l)=>a+form(l),0);
 const end=pw>=P.needWin&&kid>0?'win':pw>=P.needEsc&&kid>0?'escape':pw>=P.needWin?'late':'fail';
 return{end,paid,missed,wins,losses,pw,forge,best,kid,cr};
}
function evalPol(P,pol,N){prep(P);const acc={win:0,escape:0,late:0,fail:0,paid:0,missed:0,wins:0,losses:0,pw:0,forge:0,kid:0,best:0};
 for(let i=0;i<N;i++){const r=run(P,pol);acc[r.end]++;for(const k of ['paid','missed','wins','losses','pw','forge','kid','best'])acc[k]+=r[k];}
 const o={};for(const k in acc)o[k]=+(acc[k]/N).toFixed(2);return o;}
function mk(sa,sb,ra,rb,margin,hoardFrom,reserve){return{sellT:d=>Math.max(2,Math.min(40,Math.round(sa+sb*d))),rackT:d=>Math.max(2,Math.min(40,Math.round(ra+rb*d))),margin,hoardFrom,reserve,tag:[sa,sb,ra,rb,margin,hoardFrom,reserve].join(',')};}
function search(P,N){let bestP=null,bestS=-1,bestR=null;
 for(const sa of [4,8,12,16])for(const sb of [0,.3,.6])for(const ra of [4,8,12])for(const rb of [.2,.5,.8])for(const margin of [1,1.3])for(const hoardFrom of [12,20,99])for(const reserve of [2,5]){
  const pol=mk(sa,sb,ra,rb,margin,hoardFrom,reserve),r=evalPol(P,pol,N),s=r.win*2+r.escape+r.paid/60;
  if(s>bestS){bestS=s;bestP=pol;bestR=r;}}
 return{pol:bestP,r:bestR};}
const NAIVE=mk(6,0,4,0,1,99,99);
function perSword(P){prep(P);const out=[];for(const T of [4,8,12,16,20,24,30,40]){let net=0,ok=0;const N=6000;
 for(let i=0;i<N;i++){let L=0;while(L>=0&&L<T){net-=costOf(P,L,1);L=step(P.OD,L);}if(L>=0){net+=sellOf(P,L,1);ok++;}}
 out.push('T'+T+': '+(net/N).toFixed(0)+'c/'+(ok/N*100).toFixed(0)+'%');}return out.join('  ');}
module.exports={BASE,OLD,run,evalPol,search,mk,NAIVE,perSword,tribOf,buildOD};
if(require.main===module){
 const over=process.argv[2]?JSON.parse(require('fs').readFileSync(process.argv[2],'utf8')):{};const P=Object.assign({},BASE,over);
 console.log('tribute d1/10/20/29:',[1,10,20,29].map(d=>tribOf(P,d)).join(' / '),' total:',Array.from({length:29},(_,i)=>tribOf(P,i+1)).reduce((a,b)=>a+b,0));
 console.log('per sword (net credits / reach%):',perSword(P));
 const s=search(P,200),fine=evalPol(P,s.pol,3000),nv=evalPol(P,NAIVE,3000);
 console.log('best policy',s.pol.tag);console.log(' good  :',JSON.stringify(fine));console.log(' casual:',JSON.stringify(nv));
}
