import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Upload, Trash2, FileText, Download, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/settings";
import { RowSkeleton } from "@/components/site/Skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/documents")({
  component: DocumentsAdmin,
});

type Doc = {
  id: string;
  patient_id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};

type Profile = { id: string; full_name: string | null; email: string | null; phone: string | null };

function DocumentsAdmin() {
  const qc = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: patients, isLoading: loadingPatients } = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const { data: docs, isLoading: loadingDocs } = useQuery({
    queryKey: ["admin", "documents", selectedPatient],
    queryFn: async () => {
      let q = (supabase as any).from("patient_documents").select("*").order("created_at", { ascending: false });
      if (selectedPatient) q = q.eq("patient_id", selectedPatient);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Doc[];
    },
  });

  const del = useMutation({
    mutationFn: async (doc: Doc) => {
      await supabase.storage.from("patient-documents").remove([doc.file_path]);
      const { error } = await (supabase as any).from("patient_documents").delete().eq("id", doc.id);
      if (error) throw error;
      await logActivity("delete", "patient_document", doc.id, { title: doc.title });
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "documents"] });
    },
  });

  async function download(doc: Doc) {
    const { data, error } = await supabase.storage.from("patient-documents").createSignedUrl(doc.file_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  }

  const patientName = (id: string) => {
    const p = patients?.find((x) => x.id === id);
    return p?.full_name || p?.email || id.slice(0, 8);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Patient Documents</h1>
          <p className="text-sm text-muted-foreground">Upload reports, prescriptions, and scans for patients.</p>
        </div>
        <button onClick={() => setUploadOpen(true)} className="btn-hero btn-hero-hover inline-flex items-center gap-2 !text-sm !py-2.5">
          <Upload className="h-4 w-4" /> Upload
        </button>
      </header>

      <div className="glass rounded-3xl p-4">
        <label className="block text-xs font-medium text-muted-foreground">Filter by patient</label>
        <select
          className="input-base mt-1.5"
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
        >
          <option value="">All patients</option>
          {(patients ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name || p.email || p.id.slice(0, 8)} {p.phone ? `· ${p.phone}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="glass overflow-hidden rounded-3xl">
        {loadingDocs || loadingPatients ? (
          <div className="divide-y divide-border p-4">{Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}</div>
        ) : !docs || docs.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No documents yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {docs.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-3 p-4">
                <FileText className="h-5 w-5 shrink-0 text-accent" />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    <UserIcon className="mr-1 inline h-3 w-3" />
                    {patientName(d.patient_id)} · {d.category} · {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => download(d)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" title="Download">
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => confirm("Delete this document?") && del.mutate(d)}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {uploadOpen && (
        <UploadDialog
          patients={patients ?? []}
          defaultPatient={selectedPatient}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => {
            qc.invalidateQueries({ queryKey: ["admin", "documents"] });
            setUploadOpen(false);
          }}
        />
      )}
    </div>
  );
}

function UploadDialog({ patients, defaultPatient, onClose, onUploaded }: {
  patients: Profile[]; defaultPatient: string; onClose: () => void; onUploaded: () => void;
}) {
  const [patientId, setPatientId] = useState(defaultPatient);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("report");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload() {
    if (!patientId || !file || !title) { toast.error("Patient, title and file are required"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${patientId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("patient-documents").upload(path, file, {
        contentType: file.type || undefined,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data: userRes } = await supabase.auth.getUser();
      const { error: insErr } = await (supabase as any).from("patient_documents").insert({
        patient_id: patientId, title, description, category,
        file_path: path, file_size: file.size, mime_type: file.type,
        uploaded_by: userRes?.user?.id ?? null,
      });
      if (insErr) throw insErr;
      await logActivity("upload", "patient_document", undefined, { title, patient_id: patientId });
      toast.success("Uploaded");
      onUploaded();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-lg rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-semibold">Upload Document</h2>
        <div className="mt-6 space-y-4">
          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Patient *</span>
            <select className="input-base" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              <option value="">Select a patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.email} {p.phone ? `· ${p.phone}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Title *</span>
            <input className="input-base" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</span>
            <select className="input-base" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="report">Report</option>
              <option value="prescription">Prescription</option>
              <option value="scan">Scan / Imaging</option>
              <option value="invoice">Invoice</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</span>
            <textarea className="input-base min-h-[60px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">File *</span>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-full px-5 py-2 text-sm hover:bg-muted">Cancel</button>
          <button onClick={upload} disabled={busy} className="btn-hero btn-hero-hover !text-sm !py-2.5 disabled:opacity-50">
            {busy ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
