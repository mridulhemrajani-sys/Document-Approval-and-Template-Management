import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getTemplates,
  getTemplateVersionById,
} from "@/services/templates";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  FileText,
  GitBranch,
  Loader2,
} from "lucide-react";

export default function TemplateVersionDetails() {
  const { templateId, versionId } = useParams();

  const [template, setTemplate] = useState(null);
  const [version, setVersion] = useState(null);
  const [latestVersionId, setLatestVersionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [templatesData, versionData] = await Promise.all([
          getTemplates(),
          getTemplateVersionById(versionId),
        ]);

        if (cancelled) return;

        const selectedTemplate = templatesData.find(
          (item) => String(item.id) === String(templateId)
        );

        if (!selectedTemplate) {
          setError("Template not found or unavailable.");
          return;
        }

        if (
          String(versionData.template_id) !== String(templateId) ||
          String(versionData.id) !== String(versionId)
        ) {
          setError("This version does not belong to the selected template.");
          return;
        }

        setTemplate(selectedTemplate);
        setVersion(versionData);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load template version.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [templateId, versionId]);

  useEffect(() => {
    let cancelled = false;

    async function loadLatestVersion() {
      try {
        const { getTemplateVersions } = await import(
          "@/services/templates"
        );

        const versions = await getTemplateVersions(templateId);

        if (cancelled) return;

        const latest = Array.isArray(versions)
          ? versions.reduce(
              (highest, item) =>
                !highest || item.version > highest.version
                  ? item
                  : highest,
              null
            )
          : null;

        setLatestVersionId(latest?.id ?? null);
      } catch {
        // Version details can still be displayed if history fails to load.
      }
    }

    loadLatestVersion();

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading version details...
      </div>
    );
  }

  if (error || !version || !template) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Button variant="ghost" asChild>
          <Link to={`/admin/templates/${templateId}/versions`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Version History
          </Link>
        </Button>

        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">
              {error || "Version details could not be loaded."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fields = Array.isArray(version.fields_schema)
    ? version.fields_schema
    : [];

  const isLatest = latestVersionId === version.id;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-3 -ml-3"
        >
          <Link to={`/admin/templates/${templateId}/versions`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Version History
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <GitBranch className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-bold tracking-tight">
                Version {version.version}
              </h1>

              <Badge variant={isLatest ? "default" : "secondary"}>
                {isLatest ? "Latest" : "Historical"}
              </Badge>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {template.name} · Version record #{version.id}
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link to={`/admin/templates/${templateId}/versions/new`}>
              <GitBranch className="mr-2 h-4 w-4" />
              Create New Version
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Version Number</CardDescription>
            <CardTitle className="text-3xl">
              v{version.version}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Schema Fields</CardDescription>
            <CardTitle className="text-3xl">
              {fields.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Version Information</CardTitle>
          <CardDescription>
            Metadata associated with this version record.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Template</p>
            <p className="font-medium">{template.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="font-medium">v{version.version}</p>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <p className="text-sm text-muted-foreground">Change Reason</p>
            <p className="whitespace-pre-wrap">
              {version.change_reason || "No change reason provided."}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Created By (User ID)
            </p>
            <p className="font-medium">{version.created_by}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Version Record ID
            </p>
            <p className="font-mono text-sm">{version.id}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Field Schema</CardTitle>
          <CardDescription>
            These are the fields defined for this exact version.
            Historical schemas are displayed without modification.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {fields.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                This version has no schema fields.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field Name</TableHead>
                    <TableHead>Display Label</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={`${field.name}-${index}`}>
                      <TableCell className="font-mono text-sm">
                        {field.name}
                      </TableCell>

                      <TableCell className="font-medium">
                        {field.label}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {field.type}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            field.required ? "default" : "secondary"
                          }
                        >
                          {field.required ? "Required" : "Optional"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link to={`/admin/templates/${templateId}/versions`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Version History
          </Link>
        </Button>
      </div>
    </div>
  );
}