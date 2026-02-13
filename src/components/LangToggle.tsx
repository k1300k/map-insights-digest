import { useState } from "react";

interface Props {
  value: "ko" | "en";
  onChange: (v: "ko" | "en") => void;
}

export default function LangToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-muted p-0.5">
      <button
        onClick={() => onChange("ko")}
        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
          value === "ko" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        한국어
      </button>
      <button
        onClick={() => onChange("en")}
        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
          value === "en" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        English
      </button>
    </div>
  );
}
