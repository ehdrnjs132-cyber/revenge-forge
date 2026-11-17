// The numbers the game ships with, checked against four kinds of player.
const S=require('./sim.js');
const curve={g:[[0,.888],[10,.78],[20,.72],[30,.68],[40,.66]],c:[[0,.017],[10,.035],[20,.045],[30,.05],[40,.052]],k:[[0,0],[5,0],[6,.05],[10,.10],[20,.141],[30,.173],[40,.195]]};
const P=Object.assign({},S.BASE,{curve,costA:.4,costB:2,costG:1,sellGrow:1.45,sellBase:25,tribBase:30,tribGrow:1.10,needWin:60,needEsc:25,orcA:.8,orcB:.3,forgeCost:[800,2500,6000,12000],loseCut:.2,loseDrop:4});
const od=S.buildOD(curve);
console.log('level: success / down / destroy');for(const L of [0,6,10,20,30,38]){const o=od[L];console.log(' +'+L,((o.up+o.great2+o.great3)*100).toFixed(1),(o.down*100).toFixed(1),(o.destroy*100).toFixed(1));}
console.log('tribute d1/10/20/29:',[1,10,20,29].map(d=>S.tribOf(P,d)).join('/'));
console.log('per sword:',S.perSword(P));
const pols={expert:S.mk(16,.3,8,.8,1.3,20,2),steady:S.mk(12,.3,10,.4,1.2,18,3),casual:S.mk(8,.2,6,.2,1,99,6),careless:S.mk(6,0,4,0,1,99,99)};
for(const k in pols)console.log(k.padEnd(9),JSON.stringify(S.evalPol(P,pols[k],4000)));
