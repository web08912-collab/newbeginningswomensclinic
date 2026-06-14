import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { RowSkeleton } from "@/components/site/Skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/documents")({
  component: PortalDocuments,
});

type Doc = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  mime_type: string | null;
  created_at: string;
};

function PortalDocuments() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    enabled: !!user?.id,
    queryKey: ["portal", "documents", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("patient_documents")
        .select("*")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Doc[];
    },
  });

  async function download(doc: Doc) {
    const { data, error } = await supabase.storage.from("patient-documents").createSignedUrl(doc.file_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">My Documents</h1>
        <p className="text-sm text-muted-foreground">Reports, prescriptions, and scans shared by your care team.</p>
      </header>

      <div className="glass overflow-hidden rounded-3xl">
        {isLoading ? (
          <div className="divide-y divide-border p-4">{Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)}</div>
        ) : !data || data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No documents yet. Your doctor will share reports here after your visits.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {data.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-4 p-4">
                <FileText className="h-5 w-5 text-accent" />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{d.category} · {new Date(d.created_at).toLocaleDateString()}</p>
                  {d.description && <p className="mt-1 text-xs text-foreground/70">{d.description}</p>}
                </div>
                <button onClick={() => download(d)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
