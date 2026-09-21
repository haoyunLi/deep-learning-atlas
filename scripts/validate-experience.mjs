import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

// Each loader gets a fresh module cache, allowing isolated storage sessions.
// Browser globals are injected into module scope rather than changing Node globals.
function createLoader(environment = {}) {
  const cache = new Map();
  function load(input) {
    let file = resolve(input);
    if (extname(file) === ".css") return {};
    if (!extname(file))
      file = [file + ".ts", file + ".tsx", file + "/index.ts"].find(existsSync);
    assert.ok(file, `Cannot resolve ${input}`);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(readFileSync(file, "utf8"), {
      fileName: file,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (path) => {
      if (path.startsWith(".")) return load(resolve(dirname(file), path));
      if (path === "react" && environment.react) return environment.react;
      return require(path);
    };
    new vm.Script(
      `(function(require,module,exports,window,localStorage,HashChangeEvent){${code}\n})`,
      { filename: file },
    ).runInThisContext()(
      localRequire,
      module,
      module.exports,
      environment.window,
      environment.localStorage,
      environment.HashChangeEvent,
    );
    return module.exports;
  }
  return load;
}

const load = createLoader();
const { lessons } = load("src/data/lessons.ts");
const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const { glossaryEntries, glossaryGroups, filterGlossary } = load(
  "src/data/glossary.ts",
);
const { guideTasks } = load("src/data/modelGuide.ts");

assert.equal(
  glossaryEntries.length,
  112,
  "Glossary keeps the audited 112 terms",
);
assert.equal(
  glossaryGroups.length,
  8,
  "Glossary exposes eight knowledge groups",
);
assert.equal(
  new Set(glossaryEntries.map((entry) => entry.id)).size,
  glossaryEntries.length,
  "Glossary term IDs are unique",
);
const glossaryGroupIds = new Set(glossaryGroups.map((group) => group.id));
for (const entry of glossaryEntries) {
  assert.ok(
    entry.chinese && entry.english && entry.definition,
    `${entry.id}: complete glossary copy`,
  );
  assert.ok(
    glossaryGroupIds.has(entry.group),
    `${entry.id}: known glossary group`,
  );
  assert.ok(entry.aliases.length, `${entry.id}: searchable aliases`);
  assert.ok(entry.lessonIds.length, `${entry.id}: at least one course link`);
  for (const id of entry.lessonIds)
    assert.ok(lessonById.has(id), `${entry.id}: course link ${id} exists`);
}
for (const query of ["BN", "GQA", "KV cache", "Cohort", "OPE", "流匹配"])
  assert.ok(
    filterGlossary(query).length,
    `Glossary query ${query} returns a term`,
  );

assert.equal(guideTasks.length, 15, "Guide covers fifteen task families");
assert.equal(
  guideTasks.reduce((sum, task) => sum + task.contexts.length, 0),
  39,
  "Guide keeps 39 contextual branches",
);
assert.equal(
  new Set(guideTasks.map((task) => task.id)).size,
  guideTasks.length,
  "Guide task IDs are unique",
);
for (const task of guideTasks) {
  assert.ok(
    task.contexts.length >= 2 && task.contexts.length <= 3,
    `${task.id}: two or three contexts`,
  );
  assert.equal(
    new Set(task.contexts.map((context) => context.id)).size,
    task.contexts.length,
    `${task.id}: context IDs unique`,
  );
  const recommendations = new Map(
    task.recommendations.map((item) => [item.lessonId, item]),
  );
  for (const recommendation of task.recommendations) {
    assert.ok(
      lessonById.has(recommendation.lessonId),
      `${task.id}: course ${recommendation.lessonId} exists`,
    );
    assert.ok(
      recommendation.settings.length >= 2,
      `${task.id}/${recommendation.lessonId}: actionable settings`,
    );
    assert.ok(
      recommendation.reason && recommendation.limitation,
      `${task.id}/${recommendation.lessonId}: reason and limit`,
    );
  }
  for (const context of task.contexts) {
    assert.ok(
      context.baseline,
      `${task.id}/${context.id}: baseline is explicit`,
    );
    assert.ok(
      context.recommendationIds.length >= 2 &&
        context.recommendationIds.length <= 3,
      `${task.id}/${context.id}: two or three starting options`,
    );
    for (const id of context.recommendationIds)
      assert.ok(
        recommendations.has(id),
        `${task.id}/${context.id}: recommendation ${id} is defined`,
      );
  }
  assert.ok(task.evaluation.length >= 2, `${task.id}: evaluation guidance`);
  for (const id of task.preparationIds)
    assert.ok(
      lessonById.has(id),
      `${task.id}: preparation course ${id} exists`,
    );
}
const { parseStudyState, questionSignature } = load("src/lib/studyState.ts");
const empty = {
  completed: [],
  lastLesson: null,
  attempts: {},
  storageUnavailable: false,
};

for (const raw of [null, "", "{", "null", "[]", "42", '"knn"', "true"])
  assert.deepEqual(
    parseStudyState(raw),
    empty,
    `Recover malformed state: ${raw}`,
  );
assert.deepEqual(
  parseStudyState("{", "{"),
  empty,
  "Malformed legacy JSON also recovers",
);
assert.deepEqual(
  parseStudyState(null, '["knn","knn","attention","missing",null,42]'),
  { ...empty, completed: ["knn", "attention"] },
  "Legacy completion migrates, deduplicates, and filters unknown IDs",
);
assert.deepEqual(
  parseStudyState('{"completed":[]}', '["knn"]'),
  empty,
  "An explicit empty new-format list takes precedence over legacy progress",
);
assert.deepEqual(
  parseStudyState(
    '{"completed":"invalid","lastLesson":"knn"}',
    '["attention"]',
  ),
  { ...empty, completed: ["attention"], lastLesson: "knn" },
  "Invalid completion data can recover independently from a valid last lesson",
);
assert.deepEqual(
  parseStudyState(
    '{"completed":["knn","knn","missing",42,null],"lastLesson":"missing","storageUnavailable":true}',
  ),
  { ...empty, completed: ["knn"] },
  "Only known lessons persist and storage failure is a live runtime status",
);

const exampleQuestion = {
  question: "Which neighbors vote?",
  options: ["Nearest three", "All samples", "Only class A"],
  answer: 0,
};
const signature = questionSignature(exampleQuestion);
assert.equal(
  signature,
  questionSignature({
    ...exampleQuestion,
    options: [...exampleQuestion.options],
  }),
);
for (const changed of [
  { ...exampleQuestion, question: "Which neighbors are selected?" },
  {
    ...exampleQuestion,
    options: ["Nearest five", ...exampleQuestion.options.slice(1)],
  },
  { ...exampleQuestion, options: [...exampleQuestion.options].reverse() },
  { ...exampleQuestion, answer: 1 },
])
  assert.notEqual(
    signature,
    questionSignature(changed),
    "Question changes invalidate old attempts",
  );

const attempt = {
  selected: 1,
  correct: false,
  signature,
  updatedAt: 1770000000000,
};
const validAttempt = parseStudyState(
  JSON.stringify({ attempts: { "knn-mechanism": attempt } }),
);
assert.deepEqual(validAttempt.attempts, { "knn-mechanism": attempt });
for (const invalid of [
  null,
  [],
  "invalid",
  {},
  { ...attempt, selected: -1 },
  { ...attempt, selected: 0.5 },
  { ...attempt, selected: 8 },
  { ...attempt, selected: "1" },
  { ...attempt, correct: "false" },
  { ...attempt, signature: 42 },
  { ...attempt, signature: "x".repeat(32) },
  { ...attempt, updatedAt: "yesterday" },
  { ...attempt, updatedAt: null },
]) {
  assert.deepEqual(
    parseStudyState(JSON.stringify({ attempts: { "knn-mechanism": invalid } }))
      .attempts,
    {},
    "Malformed attempt must not become a saved answer",
  );
}
assert.deepEqual(
  parseStudyState(
    '{"attempts":{"knn-mechanism":{"selected":1,"correct":false,"signature":"a","updatedAt":1e400}}}',
  ).attempts,
  {},
  "Non-finite numeric timestamps are rejected",
);
assert.deepEqual(
  parseStudyState(
    JSON.stringify({
      attempts: {
        knn: attempt,
        "knn-unrecognized": attempt,
        "missing-mechanism": attempt,
        "constructor-decision": attempt,
        "__proto__-mechanism": attempt,
      },
    }),
  ).attempts,
  {},
  "Unknown exercises and inherited property names are not course IDs",
);
assert.deepEqual(
  parseStudyState(
    '{"__proto__":{"completed":["knn"]},"completed":["__proto__","constructor","toString"],"lastLesson":"constructor","attempts":{"__proto__":{"polluted":true},"constructor":{},"toString":{}}}',
  ),
  empty,
  "Prototype-like JSON does not create valid progress or attempts",
);
assert.equal(
  {}.polluted,
  undefined,
  "Parsing does not pollute object prototypes",
);

function createStudySession(
  initial = {},
  { readDenied = false, writeDenied = false } = {},
) {
  const data = new Map(Object.entries(initial));
  const eventListeners = new Map();
  const access = { readDenied, writeDenied, writes: 0 };
  let subscription;
  const localStorage = {
    getItem(key) {
      if (access.readDenied) throw new Error("Storage access denied");
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      if (access.writeDenied) throw new Error("Storage quota exceeded");
      access.writes++;
      data.set(key, value);
    },
  };
  const window = {
    addEventListener(type, listener) {
      eventListeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (eventListeners.get(type) === listener) eventListeners.delete(type);
    },
  };
  const react = {
    useSyncExternalStore(subscribe, snapshot) {
      subscription = subscribe;
      return snapshot();
    },
  };
  const api = createLoader({ window, localStorage, react })(
    "src/lib/studyState.ts",
  );
  return {
    api,
    data,
    access,
    snapshot: () => api.useStudyState(),
    subscribe(listener) {
      api.useStudyState();
      return subscription(listener);
    },
    storageEvent(key) {
      eventListeners.get("storage")?.({ key });
    },
  };
}

const session = createStudySession({ "dla-progress": '["knn"]' });
assert.deepEqual(session.snapshot().completed, ["knn"]);
let notifications = 0;
const unsubscribe = session.subscribe(() => notifications++);
session.api.visitLesson("attention");
session.api.toggleCompleted("ppo");
session.api.recordAttempt("knn-mechanism", attempt);
assert.deepEqual(session.snapshot().completed, ["knn", "ppo"]);
assert.equal(session.snapshot().lastLesson, "attention");
assert.deepEqual(session.snapshot().attempts["knn-mechanism"], attempt);
assert.equal(notifications, 3, "Store mutations notify subscribers");
assert.deepEqual(
  createStudySession(Object.fromEntries(session.data)).snapshot(),
  session.snapshot(),
  "Progress and attempts survive a fresh store instance",
);
const writes = session.access.writes;
session.api.visitLesson("attention");
session.api.visitLesson("missing");
session.api.toggleCompleted("constructor");
assert.equal(
  session.access.writes,
  writes,
  "Unchanged visits and unknown courses do not write",
);
session.api.toggleCompleted("knn");
assert.deepEqual(
  session.snapshot().completed,
  ["ppo"],
  "Completion toggles back off",
);
session.data.set("dla-study-v1", '{"completed":["bert"],"lastLesson":"bert"}');
session.storageEvent("unrelated");
assert.deepEqual(
  session.snapshot().completed,
  ["ppo"],
  "Unrelated storage events preserve the cached state",
);
session.storageEvent("dla-study-v1");
assert.deepEqual(
  session.snapshot().completed,
  ["bert"],
  "Other tabs can replace saved progress",
);
session.data.delete("dla-study-v1");
session.data.delete("dla-progress");
session.storageEvent(null);
assert.deepEqual(
  session.snapshot(),
  empty,
  "A storage clear event resets progress",
);
unsubscribe();
const countAfterUnsubscribe = notifications;
session.api.visitLesson("knn");
assert.equal(
  notifications,
  countAfterUnsubscribe,
  "Unmounted subscribers are removed",
);

const denied = createStudySession({}, { readDenied: true, writeDenied: true });
assert.deepEqual(denied.snapshot(), { ...empty, storageUnavailable: true });
assert.doesNotThrow(() => {
  denied.api.toggleCompleted("knn");
  denied.api.visitLesson("attention");
  denied.api.recordAttempt("knn-mechanism", attempt);
});
assert.deepEqual(denied.snapshot().completed, ["knn"]);
assert.deepEqual(denied.snapshot().attempts["knn-mechanism"], attempt);
assert.equal(
  denied.snapshot().storageUnavailable,
  true,
  "Denied writes keep a visible failure state and in-memory progress",
);
denied.access.writeDenied = false;
denied.api.toggleCompleted("ppo");
assert.equal(
  denied.snapshot().storageUnavailable,
  false,
  "A later successful write clears the failure state",
);
assert.deepEqual(JSON.parse(denied.data.get("dla-study-v1")).completed, [
  "knn",
  "ppo",
]);

const { matchesLesson, normalizeSearch } = load("src/lib/search.ts");
const searchCases = [
  ["batch-normalization", "BN"],
  ["batch-normalization", "BatchNorm"],
  ["batch-normalization", "Batch Norm"],
  ["layer-normalization", "LN"],
  ["gradient-descent", "SGD"],
  ["expectation-maximization", "EM"],
  ["ppo", "PPO"],
  ["unet", "U Net"],
  ["unet", "U-Net"],
  ["bert", "BERT"],
  ["bert", "burt"],
  ["grouped-query-attention", "GQA"],
  ["kv-cache", "KV cache"],
  ["batch-normalization", "batch normalization"],
  ["gradient-descent", "sgd gradient"],
  ["meta-learning-maml", "metalearning"],
  ["fomaml-reptile", "Reptile"],
  ["episodic-meta-learning", "support query"],
  ["domain-adaptation-dann", "GRL"],
  ["continual-learning", "catastrophic forgetting"],
  ["federated-learning", "FedAvg"],
  ["semi-supervised-self-training", "FixMatch"],
  ["automl-hpo-nas", "NAS"],
];
for (const [id, query] of searchCases) {
  assert.ok(lessonById.has(id), `Search fixture uses a known course: ${id}`);
  assert.ok(matchesLesson(lessonById.get(id), query), `${query} finds ${id}`);
}
assert.equal(normalizeSearch("  ＢＡＴＣＨ—ＮＯＲＭ_ / "), "batchnorm");
for (const lesson of lessons) {
  assert.ok(
    matchesLesson(lesson, "  "),
    "An empty query includes every course",
  );
  assert.equal(
    matchesLesson(lesson, "not-a-topic-9zq87"),
    false,
    "Unrelated queries produce no results",
  );
}
assert.equal(
  matchesLesson(lessonById.get("knn"), "knn not-a-topic-9zq87"),
  false,
  "Every query term must match",
);
assert.ok(
  matchesLesson(lessonById.get("knn"), "custom lab", "Custom lab parameter"),
  "Directory-specific metadata participates in search",
);

const { hashParts } = load("src/lib/routing.ts");
for (const hash of ["", "#", "#/", "/"])
  assert.equal(
    hashParts(hash).path,
    "/",
    "Empty routes normalize to the home path",
  );
const route = hashParts(
  "#/concepts/knn?q=U+Net&section=sandbox%23note&query=a%3Fb%26c&filter=x&filter=y",
);
assert.equal(route.path, "/concepts/knn");
assert.equal(route.params.get("q"), "U Net");
assert.equal(route.params.get("section"), "sandbox#note");
assert.equal(route.params.get("query"), "a?b&c");
assert.deepEqual(route.params.getAll("filter"), ["x", "y"]);
assert.equal(
  hashParts("#/concepts/name%23part?x=1").path,
  "/concepts/name%23part",
  "Encoded hashes in the path stay in the path",
);
assert.equal(
  hashParts("#/concepts/knn?query=what?why").params.get("query"),
  "what?why",
  "Only the first question mark separates the query",
);
assert.equal(
  hashParts("#/library?bad=%E0%A4%A&bare&empty=&equals=a=b").params.get("bad"),
  "�%A",
  "Malformed percent encoding recovers without throwing",
);
assert.equal(hashParts("#/library?bare&empty=").params.get("bare"), "");
assert.equal(hashParts("#/library?equals=a=b").params.get("equals"), "a=b");

const historyCalls = [];
const events = [];
const routingWindow = {
  location: { hash: "#/library" },
  history: {
    replaceState(state, title, hash) {
      historyCalls.push([state, title, hash]);
      routingWindow.location.hash = hash;
    },
  },
  dispatchEvent(event) {
    events.push(event.type);
  },
};
const { replaceHash } = createLoader({
  window: routingWindow,
  HashChangeEvent: class {
    constructor(type) {
      this.type = type;
    }
  },
})("src/lib/routing.ts");
replaceHash("/library", new URLSearchParams());
assert.equal(historyCalls.length, 0, "Replacing the current hash is a no-op");
const params = new URLSearchParams({ q: "KV cache # 中文", category: "a&b" });
replaceHash("/library", params);
assert.equal(historyCalls.length, 1);
assert.deepEqual(
  events,
  ["hashchange"],
  "URL updates notify the application without adding a history entry",
);
assert.equal(
  hashParts(routingWindow.location.hash).params.get("q"),
  "KV cache # 中文",
);
assert.equal(
  hashParts(routingWindow.location.hash).params.get("category"),
  "a&b",
);
replaceHash("/library", params);
assert.equal(
  historyCalls.length,
  1,
  "Repeating the same filter state does not dispatch again",
);

const catalog = load("src/data/animationCatalog.ts");
const labs = load("src/components/labs/index.ts");
const sandboxes = load("src/components/HandCalculationSandbox.tsx");
assert.deepEqual(
  Object.keys(catalog.animationCatalog).sort(),
  Object.keys(labs.parameterLabs).sort(),
  "Lightweight catalog has exactly the live parameter labs",
);
for (const [id, entry] of Object.entries(catalog.animationCatalog)) {
  assert.ok(
    lessonById.has(id),
    `${id}: catalog entry refers to a known course`,
  );
  assert.deepEqual(
    entry,
    {
      label: labs.parameterLabs[id].parameter.label,
      hint: labs.parameterLabs[id].parameter.hint,
    },
    `${id}: label and hint match the rendered experiment`,
  );
}
assert.deepEqual(catalog.legacyAnimationIds, labs.legacyAnimationIds);
assert.deepEqual(
  catalog.handCalculationLessonIds,
  sandboxes.handCalculationLessonIds,
);
assert.equal(catalog.mechanismCount, labs.mechanismCount);
for (const lesson of lessons)
  assert.equal(
    catalog.animationKind(lesson.id),
    labs.animationKind(lesson.id),
    `${lesson.id}: directory kind agrees with the live component`,
  );
assert.equal(catalog.animationKind("missing-course"), "steps");

console.log(
  `Validated experience: ${glossaryEntries.length} glossary terms, ${guideTasks.length} guide tasks/${guideTasks.reduce((sum, task) => sum + task.contexts.length, 0)} contexts, corrupted/legacy study recovery, denied storage and cross-tab updates, question signatures, ${searchCases.length} search aliases, encoded/malformed routes, and ${Object.keys(catalog.animationCatalog).length} catalog entries against live labs.`,
);
