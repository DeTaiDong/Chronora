"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

type LocationResult = {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  district: string;
  type: string;
};

type SavedPerson = {
  id: string;
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  location: LocationResult;
  locationQuery: string;
  birthPlaceDetail: string;
  gender: string;
  education: string;
  careerStatus: string;
  relationshipStatus: string;
  romanceHistory: string;
  familySupport: string;
  lifeEvents: string[];
};

const MAX_SAVED = 5;

function loadSavedPersons(): SavedPerson[] {
  try {
    return JSON.parse(localStorage.getItem("bazi:persons") ?? "[]");
  } catch {
    return [];
  }
}

function upsertPerson(person: SavedPerson) {
  const existing = loadSavedPersons().filter((p) => p.id !== person.id);
  localStorage.setItem("bazi:persons", JSON.stringify([person, ...existing].slice(0, MAX_SAVED)));
}

function deletePerson(id: string) {
  localStorage.setItem(
    "bazi:persons",
    JSON.stringify(loadSavedPersons().filter((p) => p.id !== id))
  );
}

function genderShort(g: string) {
  return { female: "女", male: "男" }[g] ?? "其他";
}

const careerOptions = ["学生", "求职中", "在职", "创业中", "自由职业", "待业"];
const relationshipOptions = ["单身", "暧昧中", "恋爱中", "已订婚", "已婚", "离异", "分居"];
const romanceHistoryOptions = ["无正式恋爱经历", "1段", "2-3段", "4段及以上", "不方便透露"];
const familySupportOptions = ["支持较多", "支持一般", "主要靠自己", "有经济压力", "不方便透露"];
const lifeEventOptions = [
  "换专业 / 转行",
  "长期异地",
  "出国留学",
  "创业经历",
  "重大疾病",
  "家庭变故",
  "重要分手",
  "失业",
  "重大考试",
  "大额投资亏损",
  "无明显重大事件"
];

const questionTemplates = [
  {
    label: "事业 / 学业",
    value: "我想看未来一年事业或学业的发展方向，是否适合转型、换环境或加大投入。"
  },
  {
    label: "感情",
    value: "我想了解近期感情关系的发展，以及自己在亲密关系里需要注意的地方。"
  },
  {
    label: "财运趋势",
    value: "我想看未来一年财运和收入机会，适合稳守还是主动争取新的机会。"
  },
  {
    label: "流年",
    value: "我想看未来一年整体运势重点，哪些方面适合推进，哪些方面需要谨慎。"
  },
  {
    label: "适合方向",
    value: "我想了解自己更适合的发展方向，包括工作类型、学习路径或长期选择。"
  },
  {
    label: "性格优势",
    value: "我想了解自己的性格优势、容易卡住的地方，以及如何更好地发挥长处。"
  }
];

const fieldClass =
  "mt-2 w-full rounded-2xl border border-gold/20 bg-[rgba(255,252,245,0.9)] px-4 py-3.5 text-ink shadow-sm outline-none transition placeholder:text-moss/50 focus:border-gold-light focus:ring-2 focus:ring-gold-light/20 disabled:bg-ink/5 disabled:text-moss";

function RequiredMark() {
  return <span className="ml-1 text-ember">*</span>;
}

function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-ember">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-moss">{description}</p> : null}
    </div>
  );
}

export default function BaziIntakeForm() {
  const router = useRouter();

  // Core form state
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [question, setQuestion] = useState("");
  const [auxOpen, setAuxOpen] = useState(false);

  // History state
  const [savedPersons, setSavedPersons] = useState<SavedPerson[]>([]);
  const [prefillKey, setPrefillKey] = useState(0);
  const [prefill, setPrefill] = useState<SavedPerson | null>(null);

  useEffect(() => {
    const persons = loadSavedPersons();
    const selectedId = localStorage.getItem("chronora:selectedPersonId");
    const selected = persons.find((person) => person.id === selectedId);

    setSavedPersons(persons);
    if (selected) applyPerson(selected);
  }, []);

  function applyPerson(person: SavedPerson) {
    setBirthTimeUnknown(person.birthTimeUnknown);
    setSelectedLocation(person.location);
    setLocationQuery(person.locationQuery);
    setLocationResults([]);
    setLocationError("");
    setAuxOpen(
      Boolean(
        person.education ||
          person.careerStatus ||
          person.relationshipStatus ||
          person.romanceHistory ||
          person.familySupport ||
          person.lifeEvents.length
      )
    );
    setPrefill(person);
    setPrefillKey((k) => k + 1);
  }

  function handleDeletePerson(id: string) {
    deletePerson(id);
    setSavedPersons(loadSavedPersons());
    if (prefill?.id === id) setPrefill(null);
  }

  async function searchLocation() {
    const query = locationQuery.trim();

    if (query.length < 2) {
      setLocationError("请输入至少 2 个字再搜索。");
      return;
    }

    setSearching(true);
    setLocationError("");

    try {
      const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
      const data = (await response.json()) as { results?: LocationResult[]; error?: string };

      if (!response.ok || data.error) throw new Error(data.error || "地点搜索失败。");

      setLocationResults(data.results ?? []);
      if (!data.results?.length) setLocationError("没有找到匹配地点，请尝试输入城市、区县或英文地址。");
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "地点搜索失败。");
    } finally {
      setSearching(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedLocation) {
      setLocationError("请先搜索并选择出生地点。");
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = {
      birthDate: String(form.get("birthDate") || ""),
      birthTime: birthTimeUnknown ? "" : String(form.get("birthTime") || ""),
      birthTimeUnknown,
      birthCountryCode: selectedLocation.countryCode,
      birthCountry: selectedLocation.country,
      birthState: selectedLocation.state,
      birthCity: selectedLocation.city || selectedLocation.district || selectedLocation.name,
      birthLatitude: selectedLocation.latitude,
      birthLongitude: selectedLocation.longitude,
      birthPlaceDetail: String(form.get("birthPlaceDetail") || selectedLocation.name),
      gender: String(form.get("gender") || ""),
      question: String(form.get("question") || ""),
      education: String(form.get("education") || ""),
      careerStatus: String(form.get("careerStatus") || ""),
      relationshipStatus: String(form.get("relationshipStatus") || ""),
      romanceHistory: String(form.get("romanceHistory") || ""),
      familySupport: String(form.get("familySupport") || ""),
      lifeEvents: form.getAll("lifeEvents").map(String)
    };

    // Save to history (without question)
    const personId = [payload.birthDate, payload.birthTime || "unknown", payload.birthCountry, payload.birthCity, payload.gender].join("|");
    upsertPerson({
      id: personId,
      birthDate: payload.birthDate,
      birthTime: payload.birthTime,
      birthTimeUnknown,
      location: selectedLocation,
      locationQuery,
      birthPlaceDetail: payload.birthPlaceDetail,
      gender: payload.gender,
      education: payload.education,
      careerStatus: payload.careerStatus,
      relationshipStatus: payload.relationshipStatus,
      romanceHistory: payload.romanceHistory,
      familySupport: payload.familySupport,
      lifeEvents: payload.lifeEvents
    });

    sessionStorage.setItem("bazi:intake", JSON.stringify(payload));
    sessionStorage.removeItem("bazi:chart");
    router.push("/bazi/loading");
  }

  return (
    <form
      key={prefillKey}
      onSubmit={onSubmit}
      className="overflow-hidden rounded-lg border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(39,54,47,0.14)] backdrop-blur"
    >
      {/* Header */}
      <div className="border-b border-ink/10 bg-white/70 px-5 py-4 md:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ember">八字命理</p>
            <h2 className="mt-1 text-2xl font-semibold">填写问诊资料</h2>
          </div>
          <p className="rounded border border-ember/20 bg-ember/10 px-3 py-2 text-sm text-ember">
            <span className="font-semibold">*</span> 必填信息
          </p>
        </div>

        {/* History panel */}
        {savedPersons.length > 0 && (
          <div className="mt-4 border-t border-ink/8 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-moss">历史记录 — 点击快速填入</p>
              <a href="/profile" className="text-xs font-semibold text-jade underline decoration-jade/20 underline-offset-4 hover:decoration-jade">管理档案</a>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {savedPersons.map((person) => (
                <div
                  key={person.id}
                  className={`flex flex-shrink-0 items-stretch overflow-hidden rounded-md border transition ${
                    prefill?.id === person.id
                      ? "border-jade bg-jade/10"
                      : "border-ink/15 bg-paper/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => applyPerson(person)}
                    className="px-3 py-2 text-left text-xs hover:bg-jade/10 transition"
                  >
                    <span className="block font-medium text-ink">
                      {person.birthDate} · {genderShort(person.gender)}
                    </span>
                    <span className="mt-0.5 block text-moss">
                      {person.location.city || person.location.name}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePerson(person.id)}
                    title="删除"
                    className="border-l border-ink/10 px-2.5 text-sm text-moss/50 transition hover:bg-ember/8 hover:text-ember"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8 p-5 md:p-7">
        <section className="rounded-lg border border-ink/10 bg-paper/45 p-4 md:p-5">
          <SectionTitle
            eyebrow="必要信息"
            title="出生资料"
            description="出生日期、出生地和性别会直接影响排盘结果，请尽量准确填写。"
          />

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium">
              具体生日日期
              <RequiredMark />
              <input
                name="birthDate"
                type="date"
                required
                defaultValue={prefill?.birthDate ?? ""}
                className={fieldClass}
              />
            </label>

            <div>
              <label className="block text-sm font-medium">
                出生时间
                {!birthTimeUnknown ? <RequiredMark /> : null}
                <input
                  name="birthTime"
                  type="time"
                  required={!birthTimeUnknown}
                  disabled={birthTimeUnknown}
                  defaultValue={prefill?.birthTime ?? ""}
                  className={fieldClass}
                />
              </label>
              <label className="mt-3 flex min-h-12 items-center gap-3 rounded-md border border-ink/10 bg-white px-3 py-3 text-sm text-moss shadow-sm">
                <input
                  name="birthTimeUnknown"
                  type="checkbox"
                  checked={birthTimeUnknown}
                  onChange={(e) => setBirthTimeUnknown(e.target.checked)}
                  className="h-4 w-4 accent-jade"
                />
                不确定具体出生时间
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">
                出生地点
                <RequiredMark />
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      setSelectedLocation(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        searchLocation();
                      }
                    }}
                    placeholder="搜索出生城市、区县或英文地址"
                    className="w-full rounded-md border border-ink/15 bg-white px-3 py-3 text-ink shadow-sm outline-none transition placeholder:text-moss/55 focus:border-jade focus:ring-2 focus:ring-jade/15"
                  />
                  <button
                    type="button"
                    onClick={searchLocation}
                    disabled={searching}
                    className="rounded-full border border-gold/30 bg-[rgba(255,250,241,0.72)] px-6 py-3.5 text-sm font-semibold text-gold-dark shadow-sm transition hover:bg-[rgba(255,250,241,0.95)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {searching ? "搜索中" : "搜索"}
                  </button>
                </div>
              </label>

              {selectedLocation && locationResults.length === 0 && (
                <p className="mt-2 text-xs text-jade">
                  已选择：{selectedLocation.name}
                </p>
              )}

              {locationError ? (
                <p className="mt-3 rounded-md border border-ember/20 bg-ember/10 px-3 py-2 text-sm text-ember">
                  {locationError}
                </p>
              ) : null}

              {locationResults.length > 0 ? (
                <div className="mt-3 grid gap-2 rounded-md border border-ink/10 bg-paper/70 p-2">
                  {locationResults.map((result) => {
                    const selected = selectedLocation?.id === result.id;
                    return (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(result);
                          setLocationQuery(result.name);
                          setLocationError("");
                        }}
                        className={`rounded-md border px-3 py-3 text-left text-sm transition ${
                          selected
                            ? "border-jade bg-jade/10 text-ink"
                            : "border-ink/10 bg-white/60 text-moss hover:border-jade/40 hover:bg-white/90"
                        }`}
                      >
                        <span className="block font-medium text-ink">{result.name}</span>
                        <span className="mt-1 block text-xs">
                          经度 {Number(result.longitude).toFixed(4)} · 纬度{" "}
                          {Number(result.latitude).toFixed(4)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <label className="block text-sm font-medium md:col-span-2">
              具体区县 / 出生地补充
              <input
                name="birthPlaceDetail"
                defaultValue={prefill?.birthPlaceDetail ?? ""}
                placeholder="可补充医院、区县、街区；不填则使用搜索结果"
                className={fieldClass}
              />
            </label>

            <label className="block text-sm font-medium md:col-span-2">
              性别
              <RequiredMark />
              <select
                name="gender"
                required
                defaultValue={prefill?.gender ?? ""}
                className={fieldClass}
              >
                <option value="" disabled>
                  请选择性别
                </option>
                <option value="female">女</option>
                <option value="male">男</option>
                <option value="other">其他 / 不便分类</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-ink/10 bg-white/65 p-4 md:p-5">
          <SectionTitle
            eyebrow="辅助信息"
            title="你想预测的问题"
            description="这项不强制，但会显著影响后续解读方向。可以写具体问题，也可以写当前最困扰你的主题。"
          />
          <div className="mb-3 flex flex-wrap gap-2">
            {questionTemplates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => setQuestion(template.value)}
                className="rounded-full border border-ink/12 bg-paper/70 px-3 py-1.5 text-xs font-medium text-moss transition hover:border-jade/40 hover:bg-jade/10 hover:text-jade focus:outline-none focus:ring-2 focus:ring-jade/20"
              >
                {template.label}
              </button>
            ))}
          </div>
          <textarea
            name="question"
            rows={5}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="例：我想看未来一年事业是否适合转行；或者我想了解感情关系的发展。"
            className={`${fieldClass} resize-y`}
          />
        </section>

        <details
          open={auxOpen}
          onToggle={(e) => setAuxOpen((e.target as HTMLDetailsElement).open)}
          className="rounded-lg border border-ink/10 bg-paper/55 p-4 transition open:bg-white/65 md:p-5"
        >
          <summary className="cursor-pointer text-base font-semibold text-ink">
            展开填写更多辅助信息
          </summary>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium">
              学历信息
              <input
                name="education"
                defaultValue={prefill?.education ?? ""}
                placeholder="例：本科 / 硕士 / 高中 / 其他"
                className={fieldClass}
              />
            </label>

            <label className="block text-sm font-medium">
              职业状态
              <select name="careerStatus" defaultValue={prefill?.careerStatus ?? ""} className={fieldClass}>
                <option value="">不填写</option>
                {careerOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              感情状态
              <select name="relationshipStatus" defaultValue={prefill?.relationshipStatus ?? ""} className={fieldClass}>
                <option value="">不填写</option>
                {relationshipOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              感情经历
              <select name="romanceHistory" defaultValue={prefill?.romanceHistory ?? ""} className={fieldClass}>
                <option value="">不填写</option>
                {romanceHistoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium md:col-span-2">
              家庭支持程度
              <select name="familySupport" defaultValue={prefill?.familySupport ?? ""} className={fieldClass}>
                <option value="">不填写</option>
                {familySupportOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="md:col-span-2">
              <legend className="text-sm font-medium">重大人生经历</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lifeEventOptions.map((option) => (
                  <label
                    key={option}
                    className="flex min-h-12 items-center gap-3 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-moss shadow-sm"
                  >
                    <input
                      name="lifeEvents"
                      type="checkbox"
                      value={option}
                      defaultChecked={prefill?.lifeEvents.includes(option) ?? false}
                      className="h-4 w-4 accent-jade"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </details>
      </div>

      <div className="flex flex-col gap-3 border-t border-ink/10 bg-white/75 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-7">
        <p className="text-sm leading-6 text-moss">点击下一步后，将进入八字排盘加载页。</p>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-br from-gold to-[#b8914f] px-8 py-3.5 text-sm font-semibold text-[#fffaf1] shadow-[0_10px_24px_rgba(138,106,53,0.22)] transition hover:brightness-110 hover:shadow-[0_14px_32px_rgba(138,106,53,0.30)] focus:outline-none focus:ring-2 focus:ring-gold-light/40"
        >
          下一步
        </button>
      </div>
    </form>
  );
}
