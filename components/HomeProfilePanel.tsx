"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SavedPerson = {
  id: string;
  label?: string;
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  location?: { name?: string; city?: string };
  gender: string;
};

function loadSavedPersons(): SavedPerson[] {
  try { return JSON.parse(localStorage.getItem("bazi:persons") ?? "[]"); }
  catch { return []; }
}

function genderLabel(v: string) {
  return { female: "女", male: "男", other: "其他" }[v] ?? "";
}

function rememberProfile(id: string) {
  localStorage.setItem("chronora:selectedPersonId", id);
}

export default function HomeProfilePanel() {
  const [persons, setPersons] = useState<SavedPerson[] | null>(null);

  useEffect(() => { setPersons(loadSavedPersons()); }, []);

  // 新用户：不渲染任何东西，首页保持干净
  if (!persons || persons.length === 0) return null;

  return (
    <section className="w-full opacity-0 animate-fade-up" style={{ animationDelay: "600ms" }}>
      <div className="rounded-2xl border border-ink/10 bg-white/55 p-4 text-left shadow-sm backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-jade">已保存档案</p>
            <h2 className="mt-0.5 text-base font-semibold text-ink">继续上次的排盘</h2>
          </div>
          <Link
            href="/profile"
            className="text-xs font-semibold text-jade underline decoration-jade/20 underline-offset-4 transition hover:decoration-jade"
          >
            管理档案
          </Link>
        </div>

        <div className="grid gap-2">
          {persons.slice(0, 3).map((person) => {
            const displayName = person.label || `${person.birthDate} · ${genderLabel(person.gender)}`;
            const city = person.location?.city || person.location?.name;
            return (
              <div
                key={person.id}
                className="flex flex-col gap-2 rounded-xl border border-ink/10 bg-paper/55 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs text-moss">
                    {person.birthTimeUnknown ? "时辰不详" : person.birthTime}
                    {city ? ` · ${city}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href="/bazi"
                    onClick={() => rememberProfile(person.id)}
                    className="rounded-lg border border-gold/35 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold-dark transition hover:bg-gold/20"
                  >
                    排八字
                  </Link>
                  <Link
                    href="/ziwei"
                    onClick={() => rememberProfile(person.id)}
                    className="rounded-lg bg-jade px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-90"
                  >
                    排紫微
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
