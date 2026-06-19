import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Lock, CheckCircle2, Upload, FileText, Paperclip } from "lucide-react";
import { toast } from "sonner";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const PUBLIC_HEADERS = {
  apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
};

type Question = {
  id: string;
  section_id: string;
  question_id: string;
  question_text: string;
  why_asking: string | null;
  follow_up_questions: string | null;
  evidence_requested: string | null;
  question_type: string;
  priority: string | null;
  required: boolean;
};
type Section = { id: string; title: string; description: string | null };

const lsKey = (token: string) => `q-public-respondent:${token}`;

export default function PublicQuestionnaire() {
  const { token = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [share, setShare] = useState<{ scope: string; label: string | null } | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<any[]>([]);
  const [identity, setIdentity] = useState({ org_name: "", respondent_name: "", respondent_email: "", respondent_role: "" });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const respondentToken = response?.respondent_token ?? (typeof window !== "undefined" ? localStorage.getItem(lsKey(token)) : null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem(lsKey(token)) : null;
      const url = new URL(`${FUNCTIONS_URL}/public-questionnaire-get`);
      url.searchParams.set("token", token);
      if (stored) url.searchParams.set("respondent_token", stored);
      const res = await fetch(url, { headers: PUBLIC_HEADERS });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setShare(data.share);
      setQuestionnaire(data.questionnaire);
      setSections(data.sections ?? []);
      setQuestions(data.questions ?? []);
      setResponse(data.response);
      setFiles(data.files ?? []);
      const map: Record<string, any> = {};
      (data.answers ?? []).forEach((a: any) => { map[a.question_id] = a.answer; });
      setAnswers(map);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [token]);

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    const done = questions.filter((q) => {
      const a = answers[q.id];
      return a != null && String(a).trim() !== "";
    }).length;
    return Math.round((done / questions.length) * 100);
  }, [answers, questions]);

  const qBySection = useMemo(() => {
    const m: Record<string, Question[]> = {};
    questions.forEach((q) => { (m[q.section_id] ||= []).push(q); });
    return m;
  }, [questions]);

  async function startResponse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${FUNCTIONS_URL}/public-questionnaire-save`, {
        method: "POST",
        headers: { ...PUBLIC_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", token, ...identity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      localStorage.setItem(lsKey(token), data.respondent_token);
      toast.success("Welcome — your progress will be saved automatically.");
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function saveAnswers(silent = false) {
    if (!respondentToken) return;
    setSaving(true);
    try {
      const payload = Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer }));
      const res = await fetch(`${FUNCTIONS_URL}/public-questionnaire-save`, {
        method: "POST",
        headers: { ...PUBLIC_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", respondent_token: respondentToken, answers: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (!silent) toast.success("Saved");
    } catch (e: any) { if (!silent) toast.error(e.message); }
    finally { setSaving(false); }
  }

  // Autosave (debounced)
  useEffect(() => {
    if (!respondentToken || !response || response.status === "submitted") return;
    const id = setTimeout(() => { saveAnswers(true); }, 1200);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [answers]);

  async function submit() {
    if (!respondentToken) return;
    const missingRequired = questions.filter((q) => q.required && !(answers[q.id] && String(answers[q.id]).trim()));
    if (missingRequired.length) {
      toast.error(`${missingRequired.length} required question(s) unanswered`);
      return;
    }
    setSubmitting(true);
    try {
      await saveAnswers(true);
      const res = await fetch(`${FUNCTIONS_URL}/public-questionnaire-save`, {
        method: "POST",
        headers: { ...PUBLIC_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", respondent_token: respondentToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Submitted — thank you!");
      await load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  }

  async function uploadFile(questionId: string | null, file: File) {
    if (!respondentToken) return;
    setUploadingFor(questionId ?? "_general");
    try {
      const fd = new FormData();
      fd.append("respondent_token", respondentToken);
      if (questionId) fd.append("question_id", questionId);
      fd.append("file", file);
      const res = await fetch(`${FUNCTIONS_URL}/public-questionnaire-upload`, {
        method: "POST",
        headers: PUBLIC_HEADERS, // do NOT set Content-Type for FormData
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast.success(`Uploaded ${file.name}`);
      setFiles((f) => [...f, data.file]);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploadingFor(null); }
  }

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  }
  if (error) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="p-8 max-w-md text-center">
          <Lock className="h-8 w-8 mx-auto text-rose-500" />
          <h1 className="mt-3 text-lg font-semibold">Link unavailable</h1>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/40">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-6">
          <Badge variant="outline" className="bg-white/70 text-[10px]">Secure questionnaire</Badge>
          <h1 className="text-2xl font-semibold mt-2">{questionnaire?.title}</h1>
          {questionnaire?.description && <p className="text-sm text-muted-foreground mt-1">{questionnaire.description}</p>}
          {share?.scope === "section" && sections[0] && (
            <p className="text-xs mt-2 text-indigo-700">Section: {sections[0].title}</p>
          )}
        </header>

        {!response ? (
          <Card className="p-6">
            <h2 className="font-semibold mb-1">Tell us who you are</h2>
            <p className="text-xs text-muted-foreground mb-4">Your progress will be saved on this device so you can return via the same link.</p>
            <form onSubmit={startResponse} className="grid gap-3">
              <div className="grid gap-1"><Label>Organization</Label><Input required value={identity.org_name} onChange={(e) => setIdentity({ ...identity, org_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1"><Label>Full name</Label><Input required value={identity.respondent_name} onChange={(e) => setIdentity({ ...identity, respondent_name: e.target.value })} /></div>
                <div className="grid gap-1"><Label>Role / Title</Label><Input required value={identity.respondent_role} onChange={(e) => setIdentity({ ...identity, respondent_role: e.target.value })} /></div>
              </div>
              <div className="grid gap-1"><Label>Work email</Label><Input type="email" required value={identity.respondent_email} onChange={(e) => setIdentity({ ...identity, respondent_email: e.target.value })} /></div>
              <Button type="submit" disabled={saving} className="mt-2 bg-indigo-600 text-white hover:bg-indigo-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start"}
              </Button>
            </form>
          </Card>
        ) : response.status === "submitted" ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500" />
            <h2 className="mt-3 text-lg font-semibold">Response submitted</h2>
            <p className="text-sm text-muted-foreground mt-1">Thanks {response.respondent_name}. The team will follow up if anything's needed.</p>
          </Card>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <Progress value={progress} className="h-2" />
              <span className="text-xs text-muted-foreground w-12 text-right">{progress}%</span>
            </div>

            <div className="space-y-5">
              {sections.map((s) => (
                <Card key={s.id} className="p-5 bg-white/80">
                  <h3 className="font-semibold">{s.title}</h3>
                  {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
                  <div className="mt-4 space-y-5">
                    {(qBySection[s.id] ?? []).map((q) => (
                      <div key={q.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] text-muted-foreground mt-1">{q.question_id}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {q.question_text}
                              {q.required && <span className="text-rose-500 ml-1">*</span>}
                            </p>
                            {q.why_asking && <p className="text-[11px] text-muted-foreground mt-1 italic">Why: {q.why_asking}</p>}
                            <Textarea
                              className="mt-2 bg-white"
                              rows={3}
                              value={answers[q.id] ?? ""}
                              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                              placeholder="Type your answer…"
                            />
                            {q.evidence_requested && (
                              <div className="mt-2 flex items-center gap-2">
                                <label className="inline-flex items-center gap-1.5 text-xs text-indigo-700 cursor-pointer hover:underline">
                                  <Paperclip className="h-3 w-3" />
                                  Attach evidence
                                  <input type="file" hidden onChange={(e) => e.target.files?.[0] && uploadFile(q.id, e.target.files[0])} />
                                </label>
                                {uploadingFor === q.id && <Loader2 className="h-3 w-3 animate-spin" />}
                                <span className="text-[10px] text-muted-foreground">Requested: {q.evidence_requested}</span>
                              </div>
                            )}
                            <ul className="mt-1 space-y-0.5">
                              {files.filter((f) => f.question_id === q.id).map((f) => (
                                <li key={f.id} className="text-[11px] text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> {f.file_name}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4 mt-5 flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 text-xs text-indigo-700 cursor-pointer hover:underline">
                <Upload className="h-3.5 w-3.5" /> Attach general file
                <input type="file" hidden onChange={(e) => e.target.files?.[0] && uploadFile(null, e.target.files[0])} />
              </label>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => saveAnswers(false)} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save draft"}
              </Button>
              <Button onClick={submit} disabled={submitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
              </Button>
            </Card>
            <p className="text-[10px] text-center text-muted-foreground mt-3">Encrypted in transit. Your draft auto-saves on this device.</p>
          </>
        )}
      </div>
    </div>
  );
}
