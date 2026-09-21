import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const files = [
  ["src/data/lessons.ts", "coreLessons"],
  ["src/data/classicalRepresentation.ts", "classicalRepresentationLessons"],
  ["src/data/visionLanguage.ts", "visionLanguageLessons"],
  ["src/data/rlModels.ts", "rlLessons"],
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
  "whenToUse",
  "howToUse",
  "tuning",
  "modifications",
  "pitfalls",
  "compareTo",
];
const errors = [];
const lessons = [];
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
      if (!values || !values.length) errors.push(`${name}: empty ${field}`);
      else if (values.some((value) => !textValue(value))) {
        errors.push(`${name}: ${field} contains an empty or non-text item`);
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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${lessons.length} lessons in ${categories.length} categories.`,
  );
}
