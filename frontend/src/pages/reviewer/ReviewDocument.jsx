import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getReviewDocument,
  requestDocumentChanges,
  approveDocument,
  rejectDocument,
} from "@/services/reviews";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function normalizeStatus(status) {
  return String(status ?? "").toLowerCase().split(".").pop();
}

function formatLabel(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);

  const styles = {
    submitted: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    in_review: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    rejected: "border-red-500/30 bg-red-500/10 text-red-400",
    changes_requested:
      "border-orange-500/30 bg-orange-500/10 text-orange-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${
        styles[normalized] ?? "border-border bg-muted text-muted-foreground"
      }`}
    >
      {formatLabel(normalized || "unknown")}
    </span>
  );
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item)).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

export default function ReviewDocument() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getReviewDocument(documentId);
      setDocument(data);
    } catch (err) {
      setError(err.message || "Unable to load this document.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  async function handleAction(action, successMessage) {
    if (actionLoading) return;

    const confirmed = window.confirm(
      `Are you sure you want to ${successMessage.toLowerCase()}?`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      await action(Number(documentId));
      setSuccess(successMessage);
      await loadDocument();
    } catch (err) {
      setError(err.message || "The review action failed.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading document...
      </div>
    );
  }

  if (error && !document) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-400">{error}</p>
        <Button variant="outline" onClick={loadDocument}>
          Try Again
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/reviewer/queue">Back to queue</Link>
        </Button>
      </div>
    );
  }

  if (!document) return null;

  const status = normalizeStatus(document.status);
  const canReview = ["submitted", "in_review"].includes(status);
  const fields = document.fields ?? {};

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-3 -ml-3">
          <Link to="/reviewer/queue">← Back to review queue</Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {document.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Document #{document.id}
            </p>
          </div>

          <StatusBadge status={document.status} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Information</CardTitle>
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
          <CardTitle className="text-base">Document Content</CardTitle>
        </CardHeader>

        <CardContent>
          {Object.keys(fields).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This document has no saved fields.
            </p>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {Object.entries(fields).map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-2 py-4 sm:grid-cols-[200px_1fr]"
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatLabel(key)}
                  </p>
                  <div className="min-w-0 whitespace-pre-wrap break-words text-sm">
                    {typeof value === "object" &&
                    value !== null &&
                    !Array.isArray(value) ? (
                      <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
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

      {canReview ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Decision</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              disabled={actionLoading}
              onClick={() =>
                handleAction(approveDocument, "Document approved successfully.")
              }
            >
              {actionLoading ? "Processing..." : "Approve"}
            </Button>

            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={() =>
                handleAction(
                  requestDocumentChanges,
                  "Changes requested successfully."
                )
              }
            >
              Request Changes
            </Button>

            <Button
              variant="destructive"
              disabled={actionLoading}
              onClick={() =>
                handleAction(rejectDocument, "Document rejected successfully.")
              }
            >
              Reject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          This document is no longer awaiting a review decision.
        </p>
      )}
    </div>
  );
}

function Metadata({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}