import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createLoader} from './lib/load-ts.mjs';
const load=createLoader();
const {lessons}=load('src/data/lessons.ts');
const {conceptPaths}=load('src/data/conceptPaths.ts');
const {aiJourneys}=load('src/data/aiLandscape.ts');
const {learningRoutes,resolveLessonNavigation,lessonHref}=load('src/lib/learningNavigation.ts');
const catalogue=lessons.map(lesson=>lesson.id);
assert.equal(learningRoutes.length,conceptPaths.length+aiJourneys.length);
assert.equal(new Set(learningRoutes.map(route=>route.id)).size,learningRoutes.length);
let traversed=0;
for(const route of learningRoutes){
 assert.equal(new Set(route.lessonIds).size,route.lessonIds.length,route.id);
 assert.ok(route.lessonIds.every(id=>catalogue.includes(id)),route.id);
 let active=route.lessonIds[0],seen=[];
 while(active){
  seen.push(active);const nav=resolveLessonNavigation(active,route.id,catalogue);
  assert.equal(nav.route.id,route.id);assert.equal(nav.previousId,seen.at(-2));
  active=nav.nextId;assert.ok(seen.length<=route.lessonIds.length);
 }
 assert.deepEqual(seen,route.lessonIds);traversed+=seen.length;
 assert.equal(resolveLessonNavigation(route.lessonIds.at(-1),route.id,catalogue).nextId,undefined);
}
assert.equal(resolveLessonNavigation('variant-mixture-inference','biology-regulation-inference',catalogue).nextId,'motif-pwm-scoring');
assert.equal(resolveLessonNavigation('motif-pwm-scoring','biology-regulation-inference',catalogue).nextId,'enhancer-gene-abc');
assert.equal(resolveLessonNavigation('neural-networks','journey-breadth',catalogue).nextId,'planning-search-astar');
assert.equal(resolveLessonNavigation('neural-networks','two-kinds-of-heads',catalogue).nextId,'resnet','Overlapping lessons obey the selected route');
assert.equal(resolveLessonNavigation('transfer-lora','language-model-pipeline',catalogue).nextId,'language-model-evaluation');
assert.equal(resolveLessonNavigation('transfer-lora','zero-to-few-shot',catalogue).nextId,undefined);
for(const invalidPath of [null,'missing','<script>','journey-nope','language-model-pipeline']){
 const nav=resolveLessonNavigation('variant-mixture-inference',invalidPath,catalogue);
 assert.equal(nav.route,undefined);assert.equal(nav.nextId,catalogue[catalogue.indexOf('variant-mixture-inference')+1]);
}
assert.equal(resolveLessonNavigation('missing','journey-breadth',catalogue).nextId,undefined);
assert.equal(resolveLessonNavigation(catalogue[0],undefined,catalogue).previousId,undefined);
assert.equal(resolveLessonNavigation(catalogue.at(-1),undefined,catalogue).nextId,undefined);
assert.equal(lessonHref('attention','two-kinds-of-heads','animation=1&exercise=1&sandbox=1&path=wrong&unused=value'),'#/lesson/attention?path=two-kinds-of-heads&animation=1&sandbox=1&exercise=1');
assert.equal(lessonHref('attention',undefined,'animation=0&exercise=bogus'),'#/lesson/attention');
const app=readFileSync('src/App.tsx','utf8'),landscape=readFileSync('src/components/AILandscape.tsx','utf8');
assert.ok(app.includes('lessonHref(lesson.id, path.id)'));
assert.ok(app.includes('routeQuery={routeQuery}'));
assert.ok(app.includes('本路径已到终点'));
assert.ok(landscape.includes('pathId={`journey-${j.id}`}'));
assert.ok(landscape.includes('id={`journey-${j.id}`}'));
console.log(`PASS · ${learningRoutes.length} coherent routes / ${traversed} ordered steps, overlapping lessons, boundaries, malformed contexts and supported reading-focus flags`);
