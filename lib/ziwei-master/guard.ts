import type { ZiweiInput } from "@/lib/ziwei/types";

export function hasSecondaryInfo(input: ZiweiInput): boolean {
  return !!(
    input.question?.trim() ||
    input.education?.trim() ||
    input.careerStatus?.trim() ||
    input.relationshipStatus?.trim() ||
    input.romanceHistory?.trim() ||
    input.familySupport?.trim() ||
    input.lifeEvents?.some((e) => e.trim())
  );
}

export function normalizeQuestion(q?: string): string {
  return q?.trim().replace(/[？?]+$/, "").trim() ?? "";
}

export function shouldStaySilent(input: ZiweiInput): boolean {
  return !hasSecondaryInfo(input);
}
