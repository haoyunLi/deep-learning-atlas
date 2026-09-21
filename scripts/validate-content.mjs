import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const files = [
  ["src/data/lessons.ts", "coreLessons"],
  ["src/data/classicalRepresentation.ts", "classicalRepresentationLessons"],
  ["src/data/visionLanguage.ts", "visionLanguageLessons"],
  ["src/data/rlModels.ts", "rlLessons"],
  ["src/data/learningConcepts.ts", "learningConceptLessons"],
  ["src/data/dataConcepts.ts", "dataConceptLessons"],
];
const requiredText = [
  "id",
  "title",
  "englishTitle",
  "category",
  "level",
  "duration",
  "icon",
  "summary",
  "intuition",
  "core",
  "equation",
  "example",
];
const requiredLists = [
  "mechanicsSteps",
  "whenToUse",
  "limits",
  "howToUse",
  "tuning",
  "modifications",
  "pitfalls",
  "compareTo",
];
const minimumLengths = {
  mechanicsSteps: 4,
  limits: 2,
  howToUse: 4,
  tuning: 3,
};
const errors = [];
const lessons = [];
const totals = { mechanicsSteps: 0, limits: 0, settings: 0 };
let categories = [];

function property(object, name) {
  return object.properties.find(
    (item) =>
      ts.isPropertyAssignment(item) &&
      item.name.getText(object.getSourceFile()) === name,
  )?.initializer;
}

function textValue(node) {
  return node && ts.isStringLiteralLike(node) ? node.text.trim() : "";
}

function arrayValue(node) {
  return node && ts.isArrayLiteralExpression(node) ? node.elements : null;
}

function getArray(source, name) {
  let result;
  function visit(node) {
    let initializer = node.initializer;
    if (
      initializer &&
      ts.isCallExpression(initializer) &&
      ts.isPropertyAccessExpression(initializer.expression) &&
      initializer.expression.name.text === "sort"
    ) {
      initializer = initializer.expression.expression;
    }
    while (
      initializer &&
      (ts.isAsExpression(initializer) ||
        ts.isSatisfiesExpression(initializer) ||
        ts.isParenthesizedExpression(initializer))
    ) {
      initializer = initializer.expression;
    }
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(source) === name &&
      initializer &&
      ts.isArrayLiteralExpression(initializer)
    ) {
      result = initializer;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return result;
}

for (const [filename, exportName] of files) {
  const source = ts.createSourceFile(
    filename,
    readFileSync(resolve(filename), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const data = getArray(source, exportName);
  if (!data) {
    errors.push(`${filename}: missing ${exportName} array`);
    continue;
  }
  if (filename.endsWith("lessons.ts")) {
    categories =
      getArray(source, "categories")
        ?.elements.filter(ts.isObjectLiteralExpression)
        .map((item) => textValue(property(item, "id"))) ?? [];
  }
  for (const item of data.elements) {
    if (!ts.isObjectLiteralExpression(item)) continue;
    const id = textValue(property(item, "id"));
    const name =
      id ||
      `${filename}:${source.getLineAndCharacterOfPosition(item.pos).line + 1}`;
    for (const field of requiredText) {
      if (!textValue(property(item, field)))
        errors.push(`${name}: missing ${field}`);
    }
    for (const field of requiredLists) {
      const values = arrayValue(property(item, field));
      if (values && field in totals) totals[field] += values.length;
      if (!values || !values.length) errors.push(`${name}: empty ${field}`);
      else if (values.some((value) => !textValue(value))) {
        errors.push(`${name}: ${field} contains an empty or non-text item`);
      }
      if (
        values &&
        field in minimumLengths &&
        values.length < minimumLengths[field]
      ) {
        errors.push(
          `${name}: ${field} needs at least ${minimumLengths[field]} items`,
        );
      }
    }
    const settings = arrayValue(property(item, "settings"));
    if (settings) totals.settings += settings.length;
    if (!settings || settings.length < 3) {
      errors.push(`${name}: settings needs at least 3 rows`);
    } else {
      const settingNames = new Set();
      for (const setting of settings) {
        if (!ts.isObjectLiteralExpression(setting)) {
          errors.push(`${name}: settings must contain objects`);
          continue;
        }
        for (const field of ["name", "start", "adjust"]) {
          if (!textValue(property(setting, field))) {
            errors.push(`${name}: setting missing ${field}`);
          }
        }
        const settingName = textValue(property(setting, "name"));
        if (settingNames.has(settingName)) {
          errors.push(`${name}: duplicate setting ${settingName}`);
        }
        settingNames.add(settingName);
      }
    }
    const sourceValue = property(item, "source");
    if (!sourceValue || !ts.isObjectLiteralExpression(sourceValue)) {
      errors.push(`${name}: missing primary source`);
    } else {
      if (!textValue(property(sourceValue, "label"))) {
        errors.push(`${name}: missing source label`);
      }
      if (!textValue(property(sourceValue, "url")).startsWith("https://")) {
        errors.push(`${name}: source URL must use HTTPS`);
      }
    }
    lessons.push({
      id,
      category: textValue(property(item, "category")),
      references: arrayValue(property(item, "compareTo"))?.map(textValue) ?? [],
    });
  }
}

const ids = new Set();
for (const lesson of lessons) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson.id)) {
    errors.push(`${lesson.id}: id must be lowercase kebab-case`);
  }
  if (ids.has(lesson.id)) errors.push(`${lesson.id}: duplicate id`);
  ids.add(lesson.id);
  if (!categories.includes(lesson.category)) {
    errors.push(`${lesson.id}: unknown category ${lesson.category}`);
  }
}
for (const lesson of lessons) {
  for (const reference of lesson.references) {
    if (!ids.has(reference))
      errors.push(`${lesson.id}: unknown comparison ${reference}`);
  }
}

const pathsFilename = "src/data/conceptPaths.ts";
const pathsSource = ts.createSourceFile(
  pathsFilename,
  readFileSync(resolve(pathsFilename), "utf8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);
const paths = getArray(pathsSource, "conceptPaths");
if (!paths) {
  errors.push(`${pathsFilename}: missing conceptPaths array`);
} else {
  const pathIds = new Set();
  for (const path of paths.elements) {
    if (!ts.isObjectLiteralExpression(path)) continue;
    const id = textValue(property(path, "id"));
    if (!id || pathIds.has(id))
      errors.push(`concept path: missing or duplicate id ${id}`);
    pathIds.add(id);
    for (const field of ["title", "description"]) {
      if (!textValue(property(path, field)))
        errors.push(`${id}: missing ${field}`);
    }
    const steps = arrayValue(property(path, "steps"));
    if (!steps || steps.length < 5) {
      errors.push(`${id}: concept path needs at least 5 steps`);
      continue;
    }
    const stepIds = new Set();
    for (const step of steps) {
      if (!ts.isObjectLiteralExpression(step)) {
        errors.push(`${id}: concept path step must be an object`);
        continue;
      }
      const lessonId = textValue(property(step, "lessonId"));
      if (!ids.has(lessonId)) errors.push(`${id}: unknown lesson ${lessonId}`);
      if (stepIds.has(lessonId))
        errors.push(`${id}: repeated lesson ${lessonId}`);
      stepIds.add(lessonId);
      if (!textValue(property(step, "why")))
        errors.push(`${id}: missing step explanation`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${lessons.length} lessons in ${categories.length} categories: ${totals.mechanicsSteps} steps, ${totals.limits} limits, ${totals.settings} settings.`,
  );
}
