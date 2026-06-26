"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SavedPerson = {
  id: string;
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  location?: {
    name?: string;
    city?: string;
  };
  gender: string;
};

function loadSavedPersons(): SavedPerson[] {
  try {
    return JSON.parse(localStorage.getItem("bazi:persons") ?? "[]");
  } catch {
    return [];
  }
}

function genderLabel(value: string) {
  return { female: "女", male: "男", other: "其他" }[value] ?? "未填";
}

function rememberProfile(id: string) {
  localStorage.setItem("chronora:selectedPersonId", id);
}

export default function HomeProfilePanel() {
  const [persons, setPersons] = useState<SavedPerson[]>([]);

  useEffect(() => {
    setPersons(loadSavedPersons());
  }, []);

  return (
    <section
      className="opacity-0 animate-fade-up w-full max-w-xl rounded-2xl border border-ink/10 bg-white/55 p-4 text-left shadow-sm backdrop-blur"
      style={{ animationDelay: "660ms" }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ember">基础资料</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">复用已保存的出生信息</h2>
        </div>
        <Link
          href="/profile"
          className="text-xs font-semibold text-jade underline decoration-jade/20 underline-offset-4 transition hover:decoration-jade"
        >
          登记 / 更新
        </Link>
      </div>

      {persons.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {persons.slice(0, 3).map((person) => (
            <div
              key={person.id}
              className="flex flex-col gap-3 rounded-lg border border-ink/10 bg-paper/55 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {person.birthDate}
                  {person.birthTimeUnknown ? " · 时辰不详" : ` · ${person.birthTime}`}
                  {" · "}
                  {genderLabel(person.gender)}
                </p>
                <p className="mt-1 truncate text-xs text-moss">
                  {person.location?.city || person.location?.name || "出生地已保存"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href="/bazi"
                  onClick={() => rememberProfile(person.id)}
                  className="rounded-md border border-ink/15 bg-white/70 px-3 py-2 text-xs font-medium text-ink transition hover:border-jade hover:text-jade"
                >
                  排八字
                </Link>
                <Link
                  href="/ziwei"
                  onClick={() => rememberProfile(person.id)}
                  className="rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-jade"
                >
                  排紫微
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-ink/15 bg-paper/35 px-3 py-3 text-sm leading-6 text-moss">
          还没有保存的基础资料。先完成一次八字填写后，出生日期、时辰、地点和性别会保存到本机，之后可直接复用到紫微斗数。
        </p>
      )}
    </section>
  );
}
