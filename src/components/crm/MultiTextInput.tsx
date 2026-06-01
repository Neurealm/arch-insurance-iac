import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function MultiTextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string[];
  onChange: (n: string[]) => void;
  placeholder?: string;
  type?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || value.includes(v)) return setDraft("");
    onChange([...value, v]);
    setDraft("");
  };
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {value.map((v) => (
          <Badge key={v} variant="outline" className="gap-1">
            {v}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== v))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={placeholder}
      />
    </div>
  );
}