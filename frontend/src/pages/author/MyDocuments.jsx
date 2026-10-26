import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  FileText,
  Plus,
  ArrowUpRight,
  Send,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  getMyDocuments,
  submitDocument,
} from "@/services/document";

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
  return String(status ?? "")
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");
}

function formatStatus(status) {
  return normalizeStatus(status)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
        STATUS_STYLES[normalized] ??
        "border-border bg-muted text-muted-foreground"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

export default function MyDocuments() {
  const navigate = useNavigate();
  const location = useLocation();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [submittingId, setSubmittingId] = useState(null);
  const [success, setSuccess] = useState(location.state?.success ?? "");

  const loadDocuments = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getMyDocuments();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the server.");
      }

      setDocuments(data);
    } catch (err) {
      setError(err.message || "Unable to load your documents.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const counts = useMemo(() => {
    const result = {
      total: documents.length,
      draft: 0,
      inProgress: 0,
      approved: 0,
      changesRequested: 0,
    };

    for (const document of documents) {
      const status = normalizeStatus(document.status);

      if (status === "draft") result.draft += 1;
      if (["submitted", "in_review"].includes(status)) {
        result.inProgress += 1;
      }
      if (status === "approved") result.approved += 1;
      if (status === "changes_requested") {
        result.changesRequested += 1;
      }
    }

    return result;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !query ||
        String(document.title ?? "").toLowerCase().includes(query) ||
        String(document.id).includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        normalizeStatus(document.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, search, statusFilter]);

  async function handleSubmitDocument(document) {
    const status = normalizeStatus(document.status);

    if (!["draft", "changes_requested"].includes(status)) {
      return;
    }

    const confirmed = window.confirm(
      `Submit "${document.title}" for the next workflow step?`
    );

    if (!confirmed) return;

    setSubmittingId(document.id);
    setActionError("");
    setSuccess("");

    try {
      await submitDocument(document.id);

      setSuccess(`"${document.title}" was submitted successfully.`);
      await loadDocuments(true);
    } catch (err) {
      setActionError(
        err.message || "Unable to submit this document."
      );
    } finally {
      setSubmittingId(null);
    }
  }

  function handleEditDocument(document) {
    navigate(`/author/documents/${document.id}/edit`);
  }

  function renderActions(document) {
    const status = normalizeStatus(document.status);
    const canEdit = ["draft", "changes_requested"].includes(status);
    const canSubmit = canEdit;

    return (
      <div className="flex items-center justify-end gap-2">
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditDocument(document)}
          >
            <Pencil className="mr-2 size-3.5" />
            Edit
          </Button>
        )}
        {canSubmit && (
          <Button
            size="sm"
            disabled={submittingId === document.id}
            onClick={() => handleSubmitDocument(document)}
          >
            <Send className="mr-2 size-3.5" />
            {submittingId === document.id ? "Submitting..." : "Submit"}
          </Button>
        )}

        {!canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate(`/author/documents/${document.id}`)
            }
          >
            View
            <ArrowUpRight className="ml-2 size-3.5" />
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-[10px]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Documents
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, manage, and track your documents.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadDocuments(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw
              className={`mr-2 size-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
          <Button onClick={() => navigate("/author/create")}>
            <Plus className="mr-2 size-4" />
            Create Document
          </Button>
        </div>
      </div>

      {/* Feedback messages */}
      {success && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400"
        >
          <span>{success}</span>
          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => setSuccess("")}
            className="text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDocuments()}
          >
            Try again
          </Button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {actionError}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 p-[10px]">
        <SummaryCard
          title="Total Documents"
          value={counts.total}
          description="All your documents"
        />

        <SummaryCard
          title="Drafts"
          value={counts.draft}
          description="Not yet submitted"
        />
        <SummaryCard
          title="In Progress"
          value={counts.inProgress}
          description="Submitted or under review"
        />
        <SummaryCard
          title="Approved"
          value={counts.approved}
          description="Approved documents"
        />
      </div>

      {/* Document list */}
      <Card className="border-border/70 bg-card m-[10px]">
        <CardHeader className="space-y-4">
          <div >
            <CardTitle className="text-lg">All Documents</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredDocuments.length} of {documents.length} documents
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title or document ID..."
                className="pl-9"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
                <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="size-6 animate-spin" />
              <p className="text-sm">Loading your documents...</p>
            </div>
          ) : documents.length === 0 && !error ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <FileText className="size-7 text-muted-foreground" />
              </div>
              <h3 className="font-medium">No documents yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first document using one of the available templates.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/author/create")}
              >
                <Plus className="mr-2 size-4" />
                Create your first document
              </Button>
            </div>
            ) : filteredDocuments.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-medium">No matching documents</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your search or status filter.
              </p>
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Document</th>
                    <th className="px-3 py-3 font-medium">Document ID</th>
                    <th className="px-3 py-3 font-medium">Template Version</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDocuments.map((document) => (
                    <tr
                      key={document.id}
                      className="border-b border-border/60 transition-colors hover:bg-muted/30 last:border-0"
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-muted p-2">
                            <FileText className="size-4 text-muted-foreground" />
                          </div>
                          <span className="max-w-xs truncate font-medium">
                            {document.title || "Untitled document"}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-muted-foreground">
                        #{document.id}
                      </td>

                      <td className="px-3 py-4 text-muted-foreground">
                        #{document.template_version_id}
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge status={document.status} />
                      </td>

                      <td className="px-3 py-4">
                        {renderActions(document)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, description }) {
  return (
    <Card className="border-border/70 bg-card">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}