"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ZiweiInput } from "@/lib/ziwei/types";

const HOUR_OPTIONS = [
  { label: "子时", range: "23:00-00:59", value: 23 },
  { label: "丑时", range: "01:00-02:59", value: 1 },
  { label: "寅时", range: "03:00-04:59", value: 3 },
  { label: "卯时", range: "05:00-06:59", value: 5 },
  { label: "辰时", range: "07:00-08:59", value: 7 },
  { label: "巳时", range: "09:00-10:59", value: 9 },
  { label: "午时", range: "11:00-12:59", value: 11 },
  { label: "未时", range: "13:00-14:59", value: 13 },
  { label: "申时", range: "15:00-16:59", value: 15 },
  { label: "酉时", range: "17:00-18:59", value: 17 },
  { label: "戌时", range: "19:00-20:59", value: 19 },
  { label: "亥时", range: "21:00-22:59", value: 21 }
];

const QUESTION_TEMPLATES = [
  "我想看未来一年事业发展，是否适合换方向或争取更大的机会。",
  "我想看感情关系的发展，以及自己在关系里需要注意的地方。",
  "我想看财帛与事业之间的联动，适合稳守还是主动开拓。",
  "我想看当前大运阶段的重点，哪些宫位主题最值得留意。",
  "我想了解自己的性格优势、贵人助力和容易反复的课题。"
];

const EDUCATION_OPTIONS = ["高中/中专", "本科", "硕士", "博士", "在读", "其他"];
const CAREER_OPTIONS = ["学生", "求职中", "在职", "管理层", "自由职业", "创业中", "待业", "其他"];
const RELATION_OPTIONS = ["单身", "暧昧中", "恋爱中", "已婚", "离异", "分居", "不便透露"];
const ROMANCE_OPTIONS = ["无正式恋爱经历", "1段", "2-3段", "4段及以上", "不便透露"];
const FAMILY_OPTIONS = ["支持较多", "支持一般", "主要靠自己", "有经济压力", "不便透露"];
const LIFE_EVENT_OPTIONS = [
  "换专业/转行",
  "长期异地",
  "出国/留学",
  "创业经历",
  "重大考试",
  "家庭变故",
  "重要分手",
  "失业",
  "大额投资亏损",
  "无明显重大事件"
];

type BaziSavedPerson = {
  id: string;
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  location?: {
    name?: string;
    city?: string;
  };
  gender: string;
  education?: string;
  careerStatus?: string;
  relationshipStatus?: string;
  romanceHistory?: string;
  familySupport?: string;
  lifeEvents?: string[];
};

function loadBaziPersons(): BaziSavedPerson[] {
  try {
    return JSON.parse(localStorage.getItem("bazi:persons") ?? "[]");
  } catch {
    return [];
  }
}

function birthTimeToZiweiHour(time: string) {
  const hour = Number(time.split(":")[0]);
  if (!Number.isFinite(hour)) return 11;
  if (hour === 23 || hour === 0) return 23;
  if (hour >= 1 && hour <= 2) return 1;
  if (hour >= 3 && hour <= 4) return 3;
  if (hour >= 5 && hour <= 6) return 5;
  if (hour >= 7 && hour <= 8) return 7;
  if (hour >= 9 && hour <= 10) return 9;
  if (hour >= 11 && hour <= 12) return 11;
  if (hour >= 13 && hour <= 14) return 13;
  if (hour >= 15 && hour <= 16) return 15;
  if (hour >= 17 && hour <= 18) return 17;
  if (hour >= 19 && hour <= 20) return 19;
  return 21;
}

function genderLabel(value: string) {
  return { male: "男", female: "女", other: "其他" }[value] ?? "未填";
}

function toggleValue(values: string[], value: string) {
  if (values.includes(value)) return values.filter((item) => item !== value);
  if (value === "无明显重大事件") return [value];
  return [...values.filter((item) => item !== "无明显重大事件"), value].slice(0, 4);
}

function OptionButton({
  selected,
  children,
  onClick
}: {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
        selected
          ? "border-jade bg-jade/10 text-jade shadow-sm"
          : "border-ink/10 bg-white/65 text-moss hover:border-jade/40 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function ZiweiIntakeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedPersons, setSavedPersons] = useState<BaziSavedPerson[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const [birthDate, setBirthDate] = useState("");
  const [birthHour, setBirthHour] = useState<number>(11);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [question, setQuestion] = useState("");
  const [education, setEducation] = useState("");
  const [careerStatus, setCareerStatus] = useState("");
  const [relationStatus, setRelationStatus] = useState("");
  const [romance, setRomance] = useState("");
  const [family, setFamily] = useState("");
  const [lifeEvents, setLifeEvents] = useState<string[]>([]);

  function applyPerson(person: BaziSavedPerson) {
    setSelectedPersonId(person.id);
    setBirthDate(person.birthDate);
    setTimeUnknown(person.birthTimeUnknown);
    if (!person.birthTimeUnknown) setBirthHour(birthTimeToZiweiHour(person.birthTime));
    if (person.gender === "male" || person.gender === "female") setGender(person.gender);
    setEducation(person.education ?? "");
    setCareerStatus(person.careerStatus ?? "");
    setRelationStatus(person.relationshipStatus ?? "");
    setRomance(person.romanceHistory ?? "");
    setFamily(person.familySupport ?? "");
    setLifeEvents(person.lifeEvents?.filter(Boolean).slice(0, 4) ?? []);
  }

  useEffect(() => {
    const persons = loadBaziPersons();
    const selectedId = localStorage.getItem("chronora:selectedPersonId");
    const selected = persons.find((person) => person.id === selectedId) ?? persons[0];

    setSavedPersons(persons);
    if (selected) applyPerson(selected);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!birthDate) {
      setError("请填写出生日期。");
      return;
    }
    if (!gender) {
      setError("请选择性别（紫微斗数排大运需要）。");
      return;
    }

    const input: ZiweiInput = {
      birthDate,
      birthHour: timeUnknown ? 0 : birthHour,
      birthTimeUnknown: timeUnknown,
      gender,
      question: question.trim() || undefined,
      education: education.trim() || undefined,
      careerStatus: careerStatus.trim() || undefined,
      relationshipStatus: relationStatus.trim() || undefined,
      romanceHistory: romance.trim() || undefined,
      familySupport: family.trim() || undefined,
      lifeEvents: lifeEvents.filter(Boolean)
    };

    setLoading(true);
    try {
      const res = await fetch("/api/ziwei/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error(`排盘请求失败（HTTP ${res.status}）`);
      const chart = await res.json();
      sessionStorage.setItem("ziwei:chart", JSON.stringify(chart));
      sessionStorage.removeItem("ziwei:reading");
      sessionStorage.removeItem("ziwei:reading:fp");
      router.push("/ziwei/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "排盘失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "mt-2 w-full rounded-2xl border border-gold/20 bg-[rgba(255,252,245,0.9)] px-4 py-3.5 text-ink shadow-sm outline-none transition placeholder:text-moss/50 focus:border-gold-light focus:ring-2 focus:ring-gold-light/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-lg border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(39,54,47,0.14)] backdrop-blur"
    >
      <div className="border-b border-ink/10 bg-white/70 px-5 py-4 md:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-jade">紫微斗数</p>
            <h2 className="mt-1 text-2xl font-semibold">填写命盘资料</h2>
          </div>
          <p className="rounded border border-jade/20 bg-jade/10 px-3 py-2 text-sm text-jade">
            可复用八字基础信息
          </p>
        </div>

        {savedPersons.length > 0 ? (
          <div className="mt-4 border-t border-ink/8 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-moss">已保存资料 · 点击快速填入</p>
              <a href="/profile" className="text-xs font-semibold text-jade underline decoration-jade/20 underline-offset-4 hover:decoration-jade">管理档案</a>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {savedPersons.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => applyPerson(person)}
                  className={`shrink-0 rounded-md border px-3 py-2 text-left text-xs transition ${
                    selectedPersonId === person.id
                      ? "border-jade bg-jade/10"
                      : "border-ink/15 bg-paper/60 hover:border-jade/40"
                  }`}
                >
                  <span className="block font-medium text-ink">
                    {person.birthDate} · {genderLabel(person.gender)}
                  </span>
                  <span className="mt-0.5 block text-moss">
                    {person.birthTimeUnknown ? "时辰不详" : person.birthTime}
                    {person.location?.city ? ` · ${person.location.city}` : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-8 p-5 md:p-7">
        <section className="rounded-lg border border-ink/10 bg-paper/45 p-4 md:p-5">
          <div className="mb-5">
            <p className="text-sm font-semibold text-ember">必要信息</p>
            <h3 className="mt-1 text-2xl font-semibold">出生资料</h3>
            <p className="mt-2 text-sm leading-6 text-moss">
              紫微以农历生辰与时辰安命宫，性别用于判断大运顺逆。
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium">
              出生日期（阳历）
              <input
                type="date"
                className={inputCls}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </label>

            <div>
              <p className="text-sm font-medium">性别</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <OptionButton selected={gender === "male"} onClick={() => setGender("male")}>
                  男
                </OptionButton>
                <OptionButton selected={gender === "female"} onClick={() => setGender("female")}>
                  女
                </OptionButton>
              </div>
              <p className="mt-2 text-xs text-moss/70">紫微斗数大运顺逆由性别决定。</p>
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium">出生时辰</p>
                  <p className="mt-1 text-xs text-moss">不确定时可勾选时辰不详，命盘会降低时宫相关判断权重。</p>
                </div>
                <label className="flex items-center gap-2 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-moss shadow-sm">
                  <input
                    type="checkbox"
                    checked={timeUnknown}
                    onChange={(e) => setTimeUnknown(e.target.checked)}
                    className="h-4 w-4 accent-jade"
                  />
                  时辰不详
                </label>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {HOUR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={timeUnknown}
                    onClick={() => setBirthHour(option.value)}
                    className={`rounded-md border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
                      birthHour === option.value && !timeUnknown
                        ? "border-gold bg-gold/10 text-gold-dark shadow-sm"
                        : "border-ink/10 bg-white/65 text-moss hover:border-gold/40 hover:bg-white"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="mt-0.5 block text-xs opacity-70">{option.range}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-ink/10 bg-white/65 p-4 md:p-5">
          <div className="mb-5">
            <p className="text-sm font-semibold text-jade">问诊主题</p>
            <h3 className="mt-1 text-2xl font-semibold">你想请先生看的事</h3>
            <p className="mt-2 text-sm leading-6 text-moss">
              这项会直接影响 AI 解读方向。可先点模板，再改成自己的问题。
            </p>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {QUESTION_TEMPLATES.map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => setQuestion(template)}
                className="rounded-full border border-ink/12 bg-paper/70 px-3 py-1.5 text-xs font-medium text-moss transition hover:border-jade/40 hover:bg-jade/10 hover:text-jade"
              >
                {template.slice(3, 13)}
              </button>
            ))}
          </div>

          <textarea
            rows={5}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例：我想看未来一年事业是否适合换方向，或者感情关系是否适合稳定下来。"
            className={`${inputCls} resize-y`}
          />
        </section>

        <section className="rounded-lg border border-ink/10 bg-paper/55 p-4 md:p-5">
          <div className="mb-5">
            <p className="text-sm font-semibold text-ember">辅助信息</p>
            <h3 className="mt-1 text-2xl font-semibold">点击选择当前状态</h3>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium">学历 / 学习</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {EDUCATION_OPTIONS.map((option) => (
                  <OptionButton
                    key={option}
                    selected={education === option}
                    onClick={() => setEducation(education === option ? "" : option)}
                  >
                    {option}
                  </OptionButton>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">事业状态</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CAREER_OPTIONS.map((option) => (
                  <OptionButton
                    key={option}
                    selected={careerStatus === option}
                    onClick={() => setCareerStatus(careerStatus === option ? "" : option)}
                  >
                    {option}
                  </OptionButton>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">感情状态</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {RELATION_OPTIONS.map((option) => (
                  <OptionButton
                    key={option}
                    selected={relationStatus === option}
                    onClick={() => setRelationStatus(relationStatus === option ? "" : option)}
                  >
                    {option}
                  </OptionButton>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">恋爱经历</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ROMANCE_OPTIONS.map((option) => (
                  <OptionButton
                    key={option}
                    selected={romance === option}
                    onClick={() => setRomance(romance === option ? "" : option)}
                  >
                    {option}
                  </OptionButton>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">家庭支持程度</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FAMILY_OPTIONS.map((option) => (
                  <OptionButton
                    key={option}
                    selected={family === option}
                    onClick={() => setFamily(family === option ? "" : option)}
                  >
                    {option}
                  </OptionButton>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">重要人生经历</p>
              <p className="mt-1 text-xs text-moss">可多选，最多保留 4 项。</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {LIFE_EVENT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLifeEvents((values) => toggleValue(values, option))}
                    className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
                      lifeEvents.includes(option)
                        ? "border-jade bg-jade/10 text-jade"
                        : "border-ink/10 bg-white/65 text-moss hover:border-jade/40 hover:bg-white"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {error ? (
        <div className="mx-5 mb-4 rounded-lg border border-ember/20 bg-ember/10 px-4 py-3 text-sm text-ember md:mx-7">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-ink/10 bg-white/75 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-7">
        <p className="text-sm leading-6 text-moss">生成后会进入紫微十二宫命盘页，可继续请先生解读。</p>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-gradient-to-br from-gold to-[#b8914f] px-8 py-3.5 text-sm font-semibold text-[#fffaf1] shadow-[0_10px_24px_rgba(138,106,53,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "正在排盘..." : "生成紫微命盘"}
        </button>
      </div>
    </form>
  );
}
