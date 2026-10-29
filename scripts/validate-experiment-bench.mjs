import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const code=ts.transpileModule(readFileSync('src/components/experimentBenchMath.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const m={exports:{}}; vm.runInNewContext(code,{module:m,exports:m.exports});
const {bayesUpdate,betaDensity,thresholdExperiment,sinkhornExperiment,bootstrapExperiment}=m.exports;
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
near(bayesUpdate(16,4).mean,18/24);
for(let s=0;s<=20;s++) for(let k=2;k<=40;k+=2){const r=bayesUpdate(s,k);assert.ok(r.mean>0&&r.mean<1&&r.variance>0);near(r.mean+bayesUpdate(20-s,k).mean,1);assert.ok(r.points.every(p=>Number.isFinite(p.posterior)&&p.posterior>=0));}
for(const [a,b] of [[1,1],[2,2],[18,6],[1,21],[20,40]]) { let mass=0;const n=10000;for(let i=0;i<n;i++)mass+=betaDensity((i+.5)/n,a,b)/n;near(mass,1,1e-5); }
for(let p=1;p<=50;p++) for(let cut=0;cut<=8;cut++){ const r=thresholdExperiment(p/100,cut);near(r.tp+r.fp+r.fn+r.tn,1000);near(r.tp+r.fn,p*10); if(cut===8)assert.equal(r.precision,null);else assert.ok(r.precision>=0&&r.precision<=1); }
near(thresholdExperiment(.1,4).recall,.88);near(thresholdExperiment(.1,4).precision,88/196);
assert.ok(thresholdExperiment(.01,4).precision<thresholdExperiment(.1,4).precision);
for(const epsilon of [.2,.4,.7,1,2]) for(const b of [.2,.4,.6]) { const r=sinkhornExperiment(epsilon,b,2000);near(r.mass,1);assert.ok(r.error<.00001);assert.ok(r.plan.flat().every(x=>x>0&&Number.isFinite(x)));for(let j=0;j<3;j++)near(r.columns[j],r.b[j]); }
assert.ok(sinkhornExperiment(.7,.4,0).mass>1);
const boot=bootstrapExperiment(1), copied=bootstrapExperiment(10);near(boot.mean,6);assert.deepEqual(Array.from(boot.donor),Array.from(copied.donor));assert.ok(copied.rowInterval[1]-copied.rowInterval[0]<boot.rowInterval[1]-boot.rowInterval[0]);assert.deepEqual(Array.from(boot.row),Array.from(bootstrapExperiment(1).row));
console.log('PASS experiment bench: conjugacy/symmetry/density mass, confusion totals/base rate/undefined precision, Sinkhorn marginals, reproducible cluster resampling.');
