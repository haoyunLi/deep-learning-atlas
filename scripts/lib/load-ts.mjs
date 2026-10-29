import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
const require = createRequire(import.meta.url);
export function createLoader() {
  const cache = new Map();
  function load(input) {
    let file = resolve(input);
    if (extname(file) === ".css") return {};
    if (!extname(file))
      file = [file + ".ts", file + ".tsx", file + "/index.ts"].find(existsSync);
    if (!file) throw new Error(`Missing ${input}`);
    if (cache.has(file)) return cache.get(file).exports;
    const m = { exports: {} };
    cache.set(file, m);
    const code = ts.transpileModule(readFileSync(file, "utf8"), {
      fileName: file,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    new vm.Script(`(function(require,module,exports){${code}\n})`, {
      filename: file,
    }).runInThisContext()(
      (p) => (p.startsWith(".") ? load(resolve(dirname(file), p)) : require(p)),
      m,
      m.exports,
    );
    return m.exports;
  }
  return load;
}
