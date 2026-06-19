import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Download, FileText, CheckCircle2, Clock, FileDown, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type Props = {
  responseId: string | null;
  questionnaireId: string;
  onClose: () => void;
};

type ResponseRow = {
  id: string;
  org_name: string;
  respondent_name: string;
  respondent_email: string;
  respondent_role: string;
  status: string;
  submitted_at: string | null;
  updated_at: string;
  created_at: string;
};

type Section = { id: string; title: string; display_order: number };
type Question = {
  id: string;
  section_id: string;
  question_id: string;
  question_text: string;
  question_type: string;
  display_order: number;
};
type Answer = { question_id: string; answer: any; updated_at: string };
type FileRow = {
  id: string;
  question_id: string;
  storage_bucket: string;
  storage_path: string;
  file_name: string;
  content_type: string | null;
  size_bytes: number | null;
};

function formatAnswer(a: any): string {
  if (a == null) return "—";
  if (typeof a === "string") return a || "—";
  if (typeof a === "number" || typeof a === "boolean") return String(a);
  if (Array.isArray(a)) return a.join(", ") || "—";
  if (typeof a === "object") {
    if ("value" in a) return formatAnswer(a.value);
    if ("text" in a) return formatAnswer(a.text);
    return JSON.stringify(a);
  }
  return String(a);
}

export function ResponseDetailDialog({ responseId, questionnaireId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ResponseRow | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [files, setFiles] = useState<Record<string, FileRow[]>>({});

  useEffect(() => {
    if (!responseId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [{ data: r }, { data: secs }, { data: qs }, { data: ans }, { data: fs }] = await Promise.all([
          supabase.from("questionnaire_responses").select("*").eq("id", responseId).maybeSingle(),
          supabase.from("questionnaire_sections").select("id, title, display_order").eq("questionnaire_id", questionnaireId).order("display_order"),
          supabase.from("questions").select("id, section_id, question_id, question_text, question_type, display_order").order("display_order"),
          supabase.from("questionnaire_response_answers").select("question_id, answer, updated_at").eq("response_id", responseId),
          supabase.from("questionnaire_response_files").select("*").eq("response_id", responseId),
        ]);
        if (cancelled) return;
        setResp(r as any);
        setSections((secs ?? []) as Section[]);
        const secIds = new Set((secs ?? []).map((s: any) => s.id));
        setQuestions(((qs ?? []) as Question[]).filter((q) => secIds.has(q.section_id)));
        const aMap: Record<string, Answer> = {};
        (ans ?? []).forEach((a: any) => { aMap[a.question_id] = a; });
        setAnswers(aMap);
        const fMap: Record<string, FileRow[]> = {};
        (fs ?? []).forEach((f: any) => { (fMap[f.question_id] ||= []).push(f); });
        setFiles(fMap);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [responseId, questionnaireId]);

  async function downloadFile(f: FileRow) {
    const { data, error } = await supabase.storage.from(f.storage_bucket).createSignedUrl(f.storage_path, 60);
    if (error || !data) { toast.error(error?.message || "Download failed"); return; }
    window.open(data.signedUrl, "_blank");
  }

  const answered = Object.keys(answers).length;
  const totalQs = questions.length;

  function buildRows() {
    const rows: Array<{ section: string; qid: string; question: string; answer: string; files: string }> = [];
    sections.forEach((sec) => {
      questions.filter((q) => q.section_id === sec.id).forEach((q) => {
        const a = answers[q.id];
        const qfiles = files[q.id] ?? [];
        rows.push({
          section: sec.title,
          qid: q.question_id,
          question: q.question_text,
          answer: a ? formatAnswer(a.answer) : "",
          files: qfiles.map((f) => f.file_name).join("; "),
        });
      });
    });
    return rows;
  }

  function baseFileName() {
    if (!resp) return "response";
    const safe = (s: string) => s.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "");
    return `${safe(resp.org_name)}_${safe(resp.respondent_name)}_${format(new Date(resp.submitted_at || resp.updated_at), "yyyyMMdd")}`;
  }

  function exportXlsx() {
    if (!resp) return;
    const wb = XLSX.utils.book_new();
    const meta = [
      ["Organization", resp.org_name],
      ["Respondent", resp.respondent_name],
      ["Email", resp.respondent_email],
      ["Role", resp.respondent_role],
      ["Status", resp.status],
      ["Started", format(new Date(resp.created_at), "PP p")],
      [resp.status === "submitted" ? "Submitted" : "Last updated",
       format(new Date(resp.submitted_at || resp.updated_at), "PP p")],
      ["Answered", `${answered} / ${totalQs}`],
    ];
    const metaWs = XLSX.utils.aoa_to_sheet(meta);
    metaWs["!cols"] = [{ wch: 20 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, metaWs, "Summary");

    const rows = buildRows();
    const ansWs = XLSX.utils.json_to_sheet(rows, {
      header: ["section", "qid", "question", "answer", "files"],
    });
    XLSX.utils.sheet_add_aoa(ansWs, [["Section", "Question ID", "Question", "Answer", "Files"]], { origin: "A1" });
    ansWs["!cols"] = [{ wch: 24 }, { wch: 14 }, { wch: 60 }, { wch: 60 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ansWs, "Answers");

    XLSX.writeFile(wb, `${baseFileName()}.xlsx`);
    toast.success("Spreadsheet downloaded");
  }

  function exportPdf() {
    if (!resp) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = margin;

    doc.setFontSize(16);
    doc.text("Questionnaire Response", margin, y);
    y += 22;
    doc.setFontSize(10);
    doc.setTextColor(90);

    const metaLines = [
      `Organization: ${resp.org_name}`,
      `Respondent: ${resp.respondent_name}  (${resp.respondent_role})`,
      `Email: ${resp.respondent_email}`,
      `Status: ${resp.status === "submitted" ? "Submitted" : "Draft"}  ·  ${answered} / ${totalQs} answered`,
      `${resp.status === "submitted" ? "Submitted" : "Last updated"}: ${format(new Date(resp.submitted_at || resp.updated_at), "PP p")}`,
    ];
    metaLines.forEach((line) => { doc.text(line, margin, y); y += 14; });
    doc.setTextColor(0);

    const body: any[] = [];
    sections.forEach((sec) => {
      const sqs = questions.filter((q) => q.section_id === sec.id);
      if (!sqs.length) return;
      body.push([{ content: sec.title, colSpan: 3, styles: { fillColor: [241, 245, 249], fontStyle: "bold", textColor: 30 } }]);
      sqs.forEach((q) => {
        const a = answers[q.id];
        const qfiles = files[q.id] ?? [];
        const answerText = a ? formatAnswer(a.answer) : "—";
        const filesText = qfiles.length ? `\nFiles: ${qfiles.map((f) => f.file_name).join(", ")}` : "";
        body.push([q.question_id, q.question_text, answerText + filesText]);
      });
    });

    autoTable(doc, {
      startY: y + 6,
      head: [["ID", "Question", "Answer"]],
      body,
      styles: { fontSize: 9, cellPadding: 5, valign: "top", overflow: "linebreak" },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 220 }, 2: { cellWidth: "auto" } },
      margin: { left: margin, right: margin },
    });

    doc.save(`${baseFileName()}.pdf`);
    toast.success("PDF downloaded");
  }


  return (
    <Dialog open={!!responseId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Response details</DialogTitle>
        </DialogHeader>

        {loading || !resp ? (
          <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-2">
                {resp.status === "submitted"
                  ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" />Submitted</Badge>
                  : <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" />Draft</Badge>}
                <span className="text-xs text-muted-foreground ml-auto">{answered} / {totalQs} answered</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Organization: </span><span className="font-medium">{resp.org_name}</span></div>
                <div><span className="text-muted-foreground">Respondent: </span><span className="font-medium">{resp.respondent_name}</span></div>
                <div><span className="text-muted-foreground">Email: </span><span className="font-medium">{resp.respondent_email}</span></div>
                <div><span className="text-muted-foreground">Role: </span><span className="font-medium">{resp.respondent_role}</span></div>
                <div><span className="text-muted-foreground">Started: </span>{format(new Date(resp.created_at), "PP p")}</div>
                <div><span className="text-muted-foreground">{resp.status === "submitted" ? "Submitted: " : "Updated: "}</span>
                  {format(new Date(resp.submitted_at || resp.updated_at), "PP p")}</div>
              </div>
            </Card>

            {sections.map((sec) => {
              const sqs = questions.filter((q) => q.section_id === sec.id);
              if (!sqs.length) return null;
              return (
                <div key={sec.id}>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 mb-2">{sec.title}</h4>
                  <div className="space-y-2">
                    {sqs.map((q) => {
                      const a = answers[q.id];
                      const qfiles = files[q.id] ?? [];
                      return (
                        <Card key={q.id} className="p-3">
                          <div className="flex gap-2 items-start">
                            <span className="text-[10px] font-mono text-muted-foreground mt-0.5">{q.question_id}</span>
                            <p className="text-xs font-medium flex-1">{q.question_text}</p>
                          </div>
                          <div className="mt-2 pl-1">
                            {a ? (
                              <p className="text-xs whitespace-pre-wrap text-slate-800">{formatAnswer(a.answer)}</p>
                            ) : (
                              <p className="text-xs italic text-muted-foreground">No answer</p>
                            )}
                            {qfiles.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {qfiles.map((f) => (
                                  <button key={f.id} onClick={() => downloadFile(f)}
                                    className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 hover:underline">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>{f.file_name}</span>
                                    {f.size_bytes ? <span className="text-muted-foreground">({Math.round(f.size_bytes / 1024)} KB)</span> : null}
                                    <Download className="h-3 w-3" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={exportXlsx} disabled={!resp || loading}>
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Export XLSX
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdf} disabled={!resp || loading}>
            <FileDown className="h-4 w-4 mr-1.5" /> Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
