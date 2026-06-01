import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function TagsInput({
  value,
  onChange,
  placeholder = "Add tag and press Enter",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...value, v]);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5">
      {value.map((t) => (
        <Badge key={t} variant="secondary" className="gap-1">
          {t}
          <button
            type="button"
            className="hover:text-destructive"
            onClick={() => onChange(value.filter((x) => x !== t))}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        className="h-7 flex-1 min-w-[120px] border-0 px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={placeholder}
      />
    </div>
  );
}