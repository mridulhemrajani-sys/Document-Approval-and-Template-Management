import { useCallback, useEffect, useState } from "react";
import { getSubmittedDocuments, assignDocument, getReviewers } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [documentData, reviewerData] = await Promise.all([
        getSubmittedDocuments(),
        getReviewers(),
      ]);

      setDocuments(Array.isArray(documentData) ? documentData : []);
      setReviewers(Array.isArray(reviewerData) ? reviewerData : []);
    } catch (err) {
      setError(err.message || "Unable to load assignment data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAssign(documentId) {
    const reviewerId = selectedReviewers[documentId];

    if (!reviewerId) {
      setError("Please select a reviewer before assigning.");
      return;
    }

    setAssigningId(documentId);
    setError("");
    setSuccess("");

    try {
      await assignDocument(documentId, reviewerId);

      setSuccess(`Document #${documentId} was assigned successfully.`);
      setDocuments((current) =>
        current.filter((document) => document.id !== documentId)
      );
      setSelectedReviewers((current) => {
        const updated = { ...current };
        delete updated[documentId];
        return updated;
      });
    } catch (err) {
      setError(err.message || "Unable to assign this document.");
    } finally {
      setAssigningId(null);
    }
  }

  const filteredDocuments = documents.filter((document) => {
    const query = search.trim().toLowerCase();

    return (
      String(document.title ?? "").toLowerCase().includes(query) ||
      String(document.id).includes(query) ||
      String(document.author_id).includes(query)
    );
  });

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Document Assignment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign submitted documents to reviewers.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={loadData}
          disabled={loading || assigningId !== null}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400"
        >
          {success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Awaiting Assignment
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {documents.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Available Reviewers
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {reviewers.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Submitted Documents
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Search by title, document ID, or author ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:max-w-md"
          />

          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Loading documents and reviewers...
            </p>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-medium">No submitted documents found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                New submissions awaiting assignment will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Document</th>
                    <th className="px-3 py-3 font-medium">Author ID</th>
                    <th className="px-3 py-3 font-medium">Template Version</th>
                    <th className="px-3 py-3 font-medium">Reviewer</th>
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
                      <td className="px-3 py-4">
                        <p className="font-medium">{document.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Document #{document.id}
                        </p>
                      </td>

                      <td className="px-3 py-4 text-muted-foreground">
                        {document.author_id}
                      </td>

                      <td className="px-3 py-4 text-muted-foreground">
                        {document.template_version_id}
                      </td>

                      <td className="min-w-56 px-3 py-4">
                        <select
                          value={selectedReviewers[document.id] ?? ""}
                          onChange={(event) => {
                            setSelectedReviewers((current) => ({
                              ...current,
                              [document.id]: event.target.value,
                            }));
                            setError("");
                            setSuccess("");
                          }}
                          disabled={
                            assigningId !== null || reviewers.length === 0
                          }
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">
                            {reviewers.length === 0
                              ? "No reviewers available"
                              : "Select a reviewer"}
                          </option>

                          {reviewers.map((reviewer) => (
                            <option
                              key={reviewer.id}
                              value={reviewer.id}
                            >
                              {reviewer.name} ({reviewer.email})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-4 text-right">
                        <Button
                          size="sm"
                          disabled={
                            assigningId !== null ||
                            !selectedReviewers[document.id]
                          }
                          onClick={() => handleAssign(document.id)}
                        >
                          {assigningId === document.id
                            ? "Assigning..."
                            : "Assign"}
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