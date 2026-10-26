import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DynamicDocumentForm from "@/components/document/DynamicDocumentForm";
import { createDocument } from "@/services/document";
import { getLatestTemplate, getTemplates } from "@/services/templates";

export default function CreateDocument() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateVersion, setTemplateVersion] = useState(null);

  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTemplates() {
      try {
        setError("");
        const data = await getTemplates();
        setTemplates(data);
      } catch (err) {
        setError(err.message || "Unable to load templates.");
      } finally {
        setLoadingTemplates(false);
      }
    }

    loadTemplates();
  }, []);

  async function handleTemplateChange(templateId) {
    setSelectedTemplateId(templateId);
    setTemplateVersion(null);
    setError("");
    setLoadingSchema(true);

    try {
      const version = await getLatestTemplate(templateId);
      setTemplateVersion(version);
    } catch (err) {
      setError(err.message || "Unable to load the template schema.");
    } finally {
      setLoadingSchema(false);
    }
  }

  async function handleCreate(payload) {
    if (!templateVersion) {
      throw new Error("Please select a template first.");
    }

    setSubmitting(true);
    setError("");

    try {
      const document = await createDocument(templateVersion.id, payload);

      navigate("/author/documents", {
        state: {
          success: `"${document.title}" was created successfully.`,
          documentId: document.id,
        },
      });
    } catch (err) {
      setError(err.message || "Unable to create the document.");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Document
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a template and fill in the required information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose a template</CardTitle>
          <CardDescription>
            Your document fields will be generated from the latest version.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loadingTemplates ? (
            <p className="text-sm text-muted-foreground">
              Loading templates...
            </p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No templates are currently available.
            </p>
          ) : (
            <Select
              value={selectedTemplateId}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>

              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={String(template.id)}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {loadingSchema && (
            <p className="text-sm text-muted-foreground">
              Loading template fields...
            </p>
          )}

          {templateVersion && !loadingSchema && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-3">
                <p className="font-medium">
                  {
                    templates.find(
                      (template) => String(template.id) === selectedTemplateId,
                    )?.name
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Version {templateVersion.version}
                </p>
              </div>

              <DynamicDocumentForm
                key={templateVersion.id}
                fieldsSchema={templateVersion.fields_schema}
                onSubmit={handleCreate}
                submitting={submitting}
                submitLabel="Create Draft"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
