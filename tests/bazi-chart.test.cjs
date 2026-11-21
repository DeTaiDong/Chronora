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
const { LunarUtil, Solar } = require("lunar-typescript");

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

function pillar(chart, index) {
  const column = chart.columns[index];
  return column.heavenlyStem.value + column.earthlyBranch.value;
}

test("year and month change at the Beijing instant of Lichun, not the solar-clock reading", () => {
  const before = createBaziChart({ ...base, birthDate: "2024-02-04", birthTime: "16:26", birthLongitude: "105" });
  const after = createBaziChart({ ...base, birthDate: "2024-02-04", birthTime: "16:28", birthLongitude: "105" });
  assert.notEqual(pillar(before, 0), pillar(after, 0));
  assert.notEqual(pillar(before, 1), pillar(after, 1));
  assert.equal(pillar(after, 0), "甲辰");
  assert.ok(after.input.adjustedBirthTime < "16:00");
  assert.ok(after.warnings?.some((warning) => warning.includes("立春")));
});

test("month changes at Jingzhe even when the local solar clock has not reached the term clock time", () => {
  const before = createBaziChart({ ...base, birthDate: "2024-03-05", birthTime: "10:21", birthLongitude: "105" });
  const after = createBaziChart({ ...base, birthDate: "2024-03-05", birthTime: "10:24", birthLongitude: "105" });
  assert.notEqual(pillar(before, 1), pillar(after, 1));
  assert.equal(pillar(before, 0), pillar(after, 0));
});

test("year and month ten gods use the solar-time day master after a date crossing", () => {
  const chart = createBaziChart({ ...base, birthDate: "2024-04-01", birthTime: "00:15", birthLongitude: "105" });
  assert.equal(chart.input.adjustedBirthDate, "2024-03-31");
  for (const index of [0, 1]) {
    assert.equal(chart.columns[index].mainStar,
      LunarUtil.SHI_SHEN[chart.dayMaster + chart.columns[index].heavenlyStem.value]);
  }
});

test("the two late-Zi day-boundary settings produce different day pillars", () => {
  const input = { ...base, birthDate: "2024-04-01", birthTime: "23:10", birthLongitude: "120" };
  const midnight = createBaziChart({ ...input, dayBoundary: "midnight" });
  const zi = createBaziChart({ ...input, dayBoundary: "zi" });
  assert.notEqual(pillar(midnight, 2), pillar(zi, 2));
  assert.equal(pillar(midnight, 0), pillar(zi, 0));
  assert.ok(zi.warnings?.some((warning) => warning.includes("换日边界")));
});

test("unknown birth time reports alternative pillars at Lichun", () => {
  const chart = createBaziChart({ ...base, birthDate: "2024-02-04", birthTimeUnknown: true, birthTime: "", birthLongitude: "105" });
  assert.equal(chart.columns.length, 3);
  assert.ok(chart.uncertainPillars?.["年柱"]?.length > 1);
  assert.ok(chart.uncertainPillars?.["月柱"]?.length > 1);
});

test("unknown birth time remains usable on a historical daylight-saving transition", () => {
  const chart = createBaziChart({ ...base, birthDate: "1988-04-17", birthTimeUnknown: true, birthTime: "" });
  assert.equal(chart.columns.length, 3);
});

test("ordinary four pillars agree with the calendar library away from boundaries", () => {
  const chart = createBaziChart({ ...base, birthLongitude: "120", birthTime: "12:00" });
  const expected = Solar.fromYmdHms(2002, 8, 16, 12, 0, 0).getLunar().getEightChar();
  assert.deepEqual(chart.columns.map((_, index) => pillar(chart, index)),
    [expected.getYear(), expected.getMonth(), expected.getDay(), expected.getTime()]);
});

test("all twelve Jie boundaries use the same Beijing instant", () => {
  const names = ["立春", "惊蛰", "清明", "立夏", "芒种", "小暑", "立秋", "白露", "寒露", "立冬", "大雪", "小寒"];
  const table = Solar.fromYmdHms(2024, 7, 1, 12, 0, 0).getLunar().getJieQiTable();
  for (const name of names) {
    const term = table[name] ?? Solar.fromYmdHms(2024, name === "小寒" ? 1 : 12, 15, 12, 0, 0)
      .getLunar().getJieQiTable()[name];
    assert.ok(term, `${name} should be available`);
    const instant = Date.parse(term.toYmdHms().replace(" ", "T") + "+08:00");
    const inputAt = (differenceMinutes) => {
      const clock = new Date(instant + differenceMinutes * 60_000 + 8 * 60 * 60_000);
      return {
        ...base,
        birthDate: clock.toISOString().slice(0, 10),
        birthTime: clock.toISOString().slice(11, 16),
        birthLongitude: "105"
      };
    };
    const before = createBaziChart(inputAt(-2));
    const after = createBaziChart(inputAt(2));
    assert.notEqual(pillar(before, 1), pillar(after, 1), name);
  }
});
