import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getReviewQueue } from "@/services/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_STYLES = {
  submitted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  changes_requested:
    "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

function normalizeStatus(status) {
  return String(status ?? "").toLowerCase().split(".").pop();
}

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const label = normalized.replaceAll("_", " ");

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
        STATUS_STYLES[normalized] ??
        "border-border bg-muted text-muted-foreground"
      }`}
    >
      {label || "Unknown"}
    </span>
  );
}

export default function ReviewQueue() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getReviewQueue();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load the review queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        String(document.title ?? "").toLowerCase().includes(query) ||
        String(document.id).includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        normalizeStatus(document.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, search, statusFilter]);

  const countStatus = (status) =>
    documents.filter(
      (document) => normalizeStatus(document.status) === status
    ).length;

  return (
    <div className="space-y-6 p-[10px]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Review Queue
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review documents assigned to you.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-3"
            onClick={loadDocuments}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Assigned" value={documents.length} />
        <SummaryCard title="Submitted" value={countStatus("submitted")} />
        <SummaryCard title="In Review" value={countStatus("in_review")} />
        <SummaryCard title="Approved" value={countStatus("approved")} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assigned Documents</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Search by title or document ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="sm:max-w-sm"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="changes_requested">Changes Requested</option>
            </select>

            <Button
              variant="outline"
              onClick={loadDocuments}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Loading review queue...
            </p>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-medium">No documents found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Document</th>
                    <th className="px-3 py-3 font-medium">Document ID</th>
                    <th className="px-3 py-3 font-medium">Author ID</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDocuments.map((document) => (
                    <tr
                      key={document.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-3 py-4 font-medium">
                        {document.title}
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">
                        #{document.id}
                      </td>
                      <td className="px-3 py-4 text-muted-foreground">
                        {document.author_id}
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge status={document.status} />
                      </td>
                      <td className="px-3 py-4 text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/reviewer/queue/${document.id}`}>
                            Review Document
                          </Link>
                        </Button>
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

function SummaryCard({ title, value }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}