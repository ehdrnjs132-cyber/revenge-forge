// Baseline without any skills: damage removed, higher destroy rate. Forge upgrades no longer exist, so they are priced out.
const S=require('./sim.js');
const curve={g:[[0,.888],[10,.78],[20,.72],[30,.68],[40,.66]],c:[[0,0],[40,0]],k:[[0,0],[3,0],[4,.06],[10,.13],[20,.183],[30,.224],[40,.25]]};
const P=Object.assign({},S.BASE,{curve,costA:.4,costB:2,costG:1,sellGrow:1.45,sellBase:25,tribBase:30,tribGrow:1.10,needWin:60,needEsc:25,orcA:.8,orcB:.3,forgeCost:[1e9,1e9,1e9,1e9],capBase:2,loseCut:.2,loseDrop:4});
const od=S.buildOD(curve);console.log('level: success / keep / destroy');for(const L of [0,4,10,20,30,38]){const o=od[L];console.log(' +'+L,((o.up+o.great2+o.great3)*100).toFixed(1),(o.keep*100).toFixed(1),(o.destroy*100).toFixed(1));}
console.log('per sword:',S.perSword(P));
const pols={expert:S.mk(16,.3,8,.8,1.3,20,2),steady:S.mk(12,.3,10,.4,1.2,18,3),casual:S.mk(8,.2,6,.2,1,99,6)};
for(const k in pols)console.log(k.padEnd(7),JSON.stringify(S.evalPol(P,pols[k],3000)));
const s=S.search(P,60);console.log('best found',s.pol.tag,JSON.stringify(S.evalPol(P,s.pol,3000)));
