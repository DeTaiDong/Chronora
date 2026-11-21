const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const sourcePath = path.resolve(__dirname, "../app/bazi/chartEngine.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const chartModule = new Module(sourcePath, module);
chartModule.filename = sourcePath;
chartModule.paths = Module._nodeModulePaths(path.dirname(sourcePath));
chartModule._compile(compiled, sourcePath);
const { createBaziChart } = chartModule.exports;

const base = {
  birthDate: "2002-08-16",
  birthTime: "05:35",
  birthCountry: "中国",
  birthCountryCode: "CN",
  birthCity: "北京",
  birthLongitude: "116.4",
  gender: "female"
};

test("known time produces four pillars and a Beijing solar-time correction", () => {
  const chart = createBaziChart(base);
  assert.equal(chart.columns.length, 4);
  assert.equal(chart.columns[2].mainStar, "元女");
  assert.equal(chart.input.adjustedBirthDate, "2002-08-16");
  assert.ok(Math.abs(chart.input.trueSolarOffsetMinutes) < 40);
});

test("historical Chinese daylight saving time is accounted for", () => {
  const chart = createBaziChart({ ...base, birthDate: "1988-07-01", birthTime: "12:00", birthLongitude: "120" });
  assert.ok(chart.input.trueSolarOffsetMinutes < -55);
});

test("unknown time does not invent a time pillar or precise solar time", () => {
  const chart = createBaziChart({ ...base, birthTimeUnknown: true, birthTime: "" });
  assert.deepEqual(chart.columns.map((column) => column.label), ["年柱", "月柱", "日柱"]);
  assert.equal(chart.input.adjustedBirthTime, undefined);
  assert.equal(chart.input.mingGong, undefined);
});

test("invalid dates and non-mainland locations are rejected", () => {
  assert.throws(() => createBaziChart({ ...base, birthDate: "2024-02-30" }), /无效/);
  assert.throws(() => createBaziChart({ ...base, birthCountryCode: "GB" }), /中国大陆/);
});
