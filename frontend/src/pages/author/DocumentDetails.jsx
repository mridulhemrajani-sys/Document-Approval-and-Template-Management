import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Pencil, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocument } from "@/services/document";

const STATUS_STYLES = {
  draft: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  submitted: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  in_review: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400",
  changes_requested:
    "border-orange-500/30 bg-orange-500/10 text-orange-400",
};

function normalizeStatus(status) {
  return String(status ?? "").toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");
}

function formatLabel(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

export default function DocumentDetails() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getDocument(documentId);
      setDocument(data);
    } catch (err) {
        console.log(documentId)
      setError(err.message || "Unable to load this document.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-muted-foreground">
        <RefreshCw className="size-5 animate-spin" />
        Loading document...
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="ghost" onClick={() => navigate("/author/documents")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to My Documents
        </Button>

        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error || "Document not found."}
        </div>

        <Button variant="outline" onClick={loadDocument}>
          Try again
        </Button>
      </div>
    );
  }

  const status = normalizeStatus(document.status);
  const canEdit = ["draft", "changes_requested"].includes(status);
  const fields = document.fields ?? {};

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => navigate("/author/documents")}>
        <ArrowLeft className="mr-2 size-4" />
        Back to My Documents
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <FileText className="size-6 text-muted-foreground" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {document.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Document #{document.id}
            </p>
            <span
              className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                STATUS_STYLES[status] ??
                "border-border bg-muted text-muted-foreground"
              }`}
            >
              {formatLabel(status)}
            </span>
          </div>
        </div>

        {canEdit && (
          <Button
            onClick={() => navigate(`/author/documents/${document.id}/edit`)}
          >
            <Pencil className="mr-2 size-4" />
            Edit Document
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Metadata label="Document ID" value={document.id} />
          <Metadata label="Author ID" value={document.author_id} />
          <Metadata
            label="Template Version ID"
            value={document.template_version_id}
          />
          <Metadata label="Status" value={formatLabel(status)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document Content</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(fields).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This document has no saved fields.
            </p>
          ) : (
            <div className="space-y-0">
              {Object.entries(fields).map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-2 border-b border-border/60 py-4 last:border-0 sm:grid-cols-[200px_1fr]"
                >
                  <p className="text-sm text-muted-foreground">
                    {formatLabel(key)}
                  </p>
                  <div className="min-w-0 break-words text-sm">
                    {typeof value === "object" && value !== null ? (
                      <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                        {formatValue(value)}
                      </pre>
                    ) : (
                      formatValue(value)
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metadata({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="break-words font-medium">{value ?? "—"}</p>
    </div>
  );
}