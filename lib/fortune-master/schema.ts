export type FortuneMasterResponse = {
  isRefusal: boolean;
  title: string;
  answer: string;
  focusAreas: string[];
  cautions: string[];
};

export const fortuneMasterJsonSchema = {
  name: "fortune_master_response",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      isRefusal: {
        type: "boolean",
        description: "Whether the answer refuses an unrelated or unsupported request."
      },
      title: {
        type: "string",
        description: "A short classical Chinese-style title for the reading."
      },
      answer: {
        type: "string",
        description: "The main answer, written in refined modern Chinese with a Bazi master's tone."
      },
      focusAreas: {
        type: "array",
        items: { type: "string" },
        description: "Three to five concise points the user should pay attention to."
      },
      cautions: {
        type: "array",
        items: { type: "string" },
        description: "Practical cautions, avoiding deterministic claims."
      }
    },
    required: ["isRefusal", "title", "answer", "focusAreas", "cautions"]
  },
  strict: true
} as const;
