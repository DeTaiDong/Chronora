// 紫微斗数 AI 解读响应结构（与 fortune-master 结构保持一致）

export type ZiweiMasterResponse = {
  title:       string;
  answer:      string;   // 支持 \n\n 段落分隔；正常解读约 800-1200 字
  focusAreas:  string[]; // 可留意（最多 4 条）
  cautions:    string[]; // 分寸（最多 3 条）
  isRefusal:   boolean;
};

export const ziweiMasterJsonSchema = {
  type: "object",
  properties: {
    title:      { type: "string" },
    answer:     { type: "string" },
    focusAreas: { type: "array",  items: { type: "string" }, maxItems: 4 },
    cautions:   { type: "array",  items: { type: "string" }, maxItems: 3 },
    isRefusal:  { type: "boolean" },
  },
  required: ["title","answer","focusAreas","cautions","isRefusal"],
  additionalProperties: false,
};
