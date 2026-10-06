import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=readFileSync('src/components/foundationContrastMath.ts','utf8');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const module={exports:{}};vm.runInNewContext(code,{exports:module.exports,module});
const {xorContrast,classificationContrast:ce,sharedParameterContrast:shared}=module.exports;
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} ≠ ${b}`);
assert.deepEqual(Array.from(xorContrast(true),r=>r.prediction),[0,1,1,0]);
assert.deepEqual(Array.from(xorContrast(false),r=>r.prediction),[1,1,1,0]);
for(const r of xorContrast(false))near(r.margin,1.5-r.x1-r.x2);
const eps=1e-5;
for(const b of [-2,-1,0,1,3,4]) {
 const logits=[1,b,-1],r=ce(logits);
 near(r.probabilities.reduce((s,p)=>s+p,0),1);
 near(r.gradients.reduce((s,g)=>s+g,0),0);
 for(let i=0;i<3;i++) {
  const hi=[...logits],lo=[...logits];hi[i]+=eps;lo[i]-=eps;
  near((ce(hi).loss-ce(lo).loss)/(2*eps),r.gradients[i]);
 }
 assert.ok(ce([1,b+0.01,-1]).loss>r.loss,'raising a wrong-class logit increases loss');
 near(ce(logits.map(z=>z+10000)).loss,r.loss,1e-10);
}
near(ce([1,0,-1]).loss,0.40760596444438035);
near(ce([1,3,-1]).loss,2.1429316284998996);
assert.ok(Number.isFinite(ce([1000,-1000,0]).loss));
for(const w of [0,0.5,0.8,1,1.6]) {
 const r=shared(w);
 near((shared(w+eps).loss-shared(w-eps).loss)/(2*eps),r.gradient);
 near(r.branch1+r.branch2,r.gradient);
 near(r.loss,0.5*(5*w-4)**2);
}
near(shared(0.8).gradient,0);
console.log('PASS · same-weight XOR contrast · CE finite differences, shift invariance and direction · shared-parameter finite differences and branch sum');
