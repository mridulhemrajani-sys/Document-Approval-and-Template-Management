import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import DynamicDocumentForm from "@/components/document/DynamicDocumentForm";
import {
  getDocument,
  updateDocument,
} from "@/services/document";
import { getTemplateVersionById } from "@/services/templates";

function normalizeStatus(status) {
  return String(status ?? "")
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");
}

export default function EditDocument() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [templateVersion, setTemplateVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const currentDocument = await getDocument(documentId);

      const status = normalizeStatus(currentDocument.status);

      if (!["draft", "changes_requested"].includes(status)) {
        throw new Error(
          "This document can no longer be edited in its current status."
        );
      }

      // Use the exact template version associated with this document.
      const version = await getTemplateVersionById(
        currentDocument.template_version_id
      );

      setDocument(currentDocument);
      setTemplateVersion(version);
    } catch (err) {
      setError(
        err.message || "Unable to load the document for editing."
      );
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSave(payload) {
    setSaving(true);
    setError("");

    try {
      await updateDocument(documentId, payload);

      navigate(`/author/documents/${documentId}`, {
        state: {
          success: "Document updated successfully.",
        },
      });
    } catch (err) {
      setError(err.message || "Unable to save your changes.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-muted-foreground">
        <RefreshCw className="size-5 animate-spin" />
        Loading document...
      </div>
    );
  }

  if (error && (!document || !templateVersion)) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/author/documents")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to My Documents
        </Button>

        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error}
        </p>

        <Button variant="outline" onClick={loadData}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Button
        variant="ghost"
        onClick={() =>
          navigate(`/author/documents/${documentId}`)
        }
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to Document
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Document</CardTitle>
          <CardDescription>
            Editing version {templateVersion.version} of the template
            associated with this document.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <p
              role="alert"
              className="mb-4 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <DynamicDocumentForm
            key={document.id}
            fieldsSchema={templateVersion.fields_schema}
            initialTitle={document.title}
            initialFields={document.fields ?? {}}
            onSubmit={handleSave}
            submitting={saving}
            submitLabel="Save Changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}