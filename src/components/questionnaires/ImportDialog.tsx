import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const VALID_TYPES = ["long_text", "short_text", "single_choice", "multi_choice", "boolean"] as const;
const VALID_PRIORITY = ["High", "Medium", "Low"] as const;

const TEMPLATE_HEADERS = [
  "Section Order",
  "Section Title",
  "Section Description",
  "Question ID",
  "Question Text",
  "Question Type",
  "Priority",
  "Required",
  "Customer Visible",
  "Why Asking",
  "Follow Up Questions",
  "Evidence Requested",
  "Display Order",
];

const SAMPLE_ROWS = [
  [1, "Governance", "Governance & accountability practices", "Q01", "Who owns the resilience program?", "short_text", "High", "Y", "Y", "Establish accountability", "How often is it reviewed?", "Org chart or RACI", 1],
  [1, "Governance", "Governance & accountability practices", "Q02", "Do you have a written resilience policy?", "boolean", "High", "Y", "Y", "Validate baseline maturity", "", "Policy PDF", 2],
  [2, "Operations", "Day-to-day operational controls", "Q01", "Which incident tooling do you use?", "multi_choice", "Medium", "N", "Y", "", "", "", 1],
  [2, "Operations", "Day-to-day operational controls", "Q02", "Describe your on-call rotation.", "long_text", "Medium", "Y", "Y", "Understand coverage", "What is the escalation policy?", "Schedule export", 2],
];

function buildTemplateWorkbook() {
  const wb = XLSX.utils.book_new();

  // Instructions sheet
  const instructions = [
    ["Questionnaire Import Template"],
    [],
    ["How to use"],
    ["1. Fill in the 'Questionnaire' sheet — one row per question."],
    ["2. Group questions by Section: rows sharing the same 'Section Title' become one section."],
    ["3. 'Section Order' controls section ordering; 'Display Order' controls question ordering within a section."],
    ["4. Save the file and upload it from the Import button in Questionnaire Studio."],
    [],
    ["Column reference"],
    ["Section Order", "Integer. Order of section within the questionnaire."],
    ["Section Title", "Required. Sections are grouped/created by this title."],
    ["Section Description", "Optional. Used when creating a new section."],
    ["Question ID", "Required. Stable identifier within the section (e.g. Q01)."],
    ["Question Text", "Required. The question shown to the responder."],
    ["Question Type", `One of: ${VALID_TYPES.join(", ")}`],
    ["Priority", `One of: ${VALID_PRIORITY.join(", ")} (default Medium)`],
    ["Required", "Y or N (default N)"],
    ["Customer Visible", "Y or N (default Y)"],
    ["Why Asking", "Optional context shown to the responder."],
    ["Follow Up Questions", "Optional. Free text."],
    ["Evidence Requested", "Optional. What artefact should be attached."],
    ["Display Order", "Integer. Order of the question within its section."],
    [],
    ["Notes"],
    ["• Existing sections matched by title will be reused; new ones will be created."],
    ["• Existing questions are matched by 'Question ID' within the section and will be updated."],
  ];
  const wsI = XLSX.utils.aoa_to_sheet(instructions);
  wsI["!cols"] = [{ wch: 24 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsI, "Instructions");

  // Questionnaire sheet
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...SAMPLE_ROWS]);
  ws["!cols"] = [
    { wch: 12 }, { wch: 22 }, { wch: 30 }, { wch: 12 }, { wch: 50 },
    { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 30 },
    { wch: 30 }, { wch: 30 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Questionnaire");

  return wb;
}

function downloadTemplate() {
  const wb = buildTemplateWorkbook();
  XLSX.writeFile(wb, "questionnaire-template.xlsx");
}

type ParsedRow = {
  sectionOrder: number;
  sectionTitle: string;
  sectionDescription: string;
  questionId: string;
  questionText: string;
  questionType: string;
  priority: string;
  required: boolean;
  customerVisible: boolean;
  whyAsking: string;
  followUp: string;
  evidence: string;
  displayOrder: number;
};

function toBool(v: any, dflt: boolean): boolean {
  if (v === undefined || v === null || v === "") return dflt;
  const s = String(v).trim().toLowerCase();
  return ["y", "yes", "true", "1"].includes(s);
}

function parseWorkbook(wb: XLSX.WorkBook): { rows: ParsedRow[]; errors: string[] } {
  const errors: string[] = [];
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase() === "questionnaire") ?? wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });
  const rows: ParsedRow[] = [];

  json.forEach((r, idx) => {
    const rowNum = idx + 2;
    const sectionTitle = String(r["Section Title"] ?? "").trim();
    const questionId = String(r["Question ID"] ?? "").trim();
    const questionText = String(r["Question Text"] ?? "").trim();
    if (!sectionTitle && !questionId && !questionText) return; // blank row
    if (!sectionTitle) { errors.push(`Row ${rowNum}: missing Section Title`); return; }
    if (!questionId) { errors.push(`Row ${rowNum}: missing Question ID`); return; }
    if (!questionText) { errors.push(`Row ${rowNum}: missing Question Text`); return; }

    let qt = String(r["Question Type"] ?? "long_text").trim().toLowerCase().replace(/\s+/g, "_");
    if (!VALID_TYPES.includes(qt as any)) {
      errors.push(`Row ${rowNum}: invalid Question Type "${r["Question Type"]}" — defaulted to long_text`);
      qt = "long_text";
    }
    let pr = String(r["Priority"] ?? "Medium").trim();
    pr = pr.charAt(0).toUpperCase() + pr.slice(1).toLowerCase();
    if (!VALID_PRIORITY.includes(pr as any)) pr = "Medium";

    rows.push({
      sectionOrder: Number(r["Section Order"]) || 0,
      sectionTitle,
      sectionDescription: String(r["Section Description"] ?? "").trim(),
      questionId,
      questionText,
      questionType: qt,
      priority: pr,
      required: toBool(r["Required"], false),
      customerVisible: toBool(r["Customer Visible"], true),
      whyAsking: String(r["Why Asking"] ?? "").trim(),
      followUp: String(r["Follow Up Questions"] ?? "").trim(),
      evidence: String(r["Evidence Requested"] ?? "").trim(),
      displayOrder: Number(r["Display Order"]) || 0,
    });
  });
  return { rows, errors };
}

export function ImportDialog({
  questionnaireId,
  trigger,
}: {
  questionnaireId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ rows: ParsedRow[]; errors: string[] } | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const reset = () => { setPreview(null); setFileName(""); if (fileRef.current) fileRef.current.value = ""; };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const parsed = parseWorkbook(wb);
    setPreview(parsed);
  };

  const doImport = async () => {
    if (!preview || preview.rows.length === 0) return;
    setBusy(true);
    try {
      // Load existing sections + questions for this questionnaire
      const { data: existingSections, error: sErr } = await supabase
        .from("questionnaire_sections")
        .select("id,title,display_order")
        .eq("questionnaire_id", questionnaireId);
      if (sErr) throw sErr;

      const sectionByTitle = new Map<string, { id: string; display_order: number }>();
      (existingSections ?? []).forEach((s: any) => sectionByTitle.set(s.title, { id: s.id, display_order: s.display_order }));

      // Group rows by section title preserving first appearance order
      const orderedSections: { title: string; description: string; sectionOrder: number; rows: ParsedRow[] }[] = [];
      const seen = new Map<string, number>();
      preview.rows.forEach((r) => {
        if (!seen.has(r.sectionTitle)) {
          seen.set(r.sectionTitle, orderedSections.length);
          orderedSections.push({ title: r.sectionTitle, description: r.sectionDescription, sectionOrder: r.sectionOrder, rows: [] });
        }
        orderedSections[seen.get(r.sectionTitle)!].rows.push(r);
      });
      orderedSections.sort((a, b) => (a.sectionOrder || 0) - (b.sectionOrder || 0));

      let createdSections = 0;
      let createdQuestions = 0;
      let updatedQuestions = 0;

      const baseOrder = (existingSections ?? []).length;

      for (let i = 0; i < orderedSections.length; i++) {
        const sec = orderedSections[i];
        let sectionId: string;
        if (sectionByTitle.has(sec.title)) {
          sectionId = sectionByTitle.get(sec.title)!.id;
        } else {
          const { data: newSec, error: nsErr } = await supabase
            .from("questionnaire_sections")
            .insert({
              questionnaire_id: questionnaireId,
              title: sec.title,
              description: sec.description || null,
              display_order: sec.sectionOrder || baseOrder + i,
            })
            .select()
            .single();
          if (nsErr) throw nsErr;
          sectionId = newSec.id;
          createdSections++;
        }

        // Existing questions in this section
        const { data: existingQs, error: qErr } = await supabase
          .from("questions")
          .select("id,question_id")
          .eq("section_id", sectionId);
        if (qErr) throw qErr;
        const qByCode = new Map<string, string>();
        (existingQs ?? []).forEach((q: any) => qByCode.set(q.question_id, q.id));

        for (const r of sec.rows) {
          const payload = {
            section_id: sectionId,
            question_id: r.questionId,
            question_text: r.questionText,
            question_type: r.questionType,
            priority: r.priority,
            required: r.required,
            customer_visible: r.customerVisible,
            why_asking: r.whyAsking || null,
            follow_up_questions: r.followUp || null,
            evidence_requested: r.evidence || null,
            display_order: r.displayOrder,
          };
          if (qByCode.has(r.questionId)) {
            const { error: uErr } = await supabase.from("questions").update(payload).eq("id", qByCode.get(r.questionId)!);
            if (uErr) throw uErr;
            updatedQuestions++;
          } else {
            const { error: iErr } = await supabase.from("questions").insert(payload);
            if (iErr) throw iErr;
            createdQuestions++;
          }
        }
      }

      toast.success(`Imported: ${createdSections} new sections, ${createdQuestions} new questions, ${updatedQuestions} updated`);
      qc.invalidateQueries({ queryKey: ["q-sections", questionnaireId] });
      qc.invalidateQueries({ queryKey: ["q-questions"] });
      reset();
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message ?? "Import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
            Import questionnaire from spreadsheet
          </DialogTitle>
          <DialogDescription>
            Upload an .xlsx file matching the template. Sections and questions are matched by title / question ID and updated in place.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-indigo-300 bg-indigo-50/40 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Need the template?</p>
              <p className="text-xs text-muted-foreground">Download a pre-formatted spreadsheet with instructions and sample rows.</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-1.5" /> Download template
            </Button>
          </div>

          <div className="rounded-lg border border-border/60 bg-white/70 p-4">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {fileName ? <span className="font-medium">{fileName}</span> : <span className="text-muted-foreground">No file selected</span>}
              </div>
              <Button onClick={() => fileRef.current?.click()} variant="outline">
                <Upload className="h-4 w-4 mr-1.5" /> Choose file
              </Button>
            </div>

            {preview && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{preview.rows.length} valid rows ready to import</span>
                </div>
                {preview.errors.length > 0 && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs space-y-0.5 max-h-32 overflow-auto">
                    <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" /> {preview.errors.length} warning(s)
                    </div>
                    {preview.errors.slice(0, 20).map((e, i) => (
                      <p key={i} className="text-amber-800">• {e}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={doImport}
            disabled={!preview || preview.rows.length === 0 || busy}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
            Import {preview ? `(${preview.rows.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
