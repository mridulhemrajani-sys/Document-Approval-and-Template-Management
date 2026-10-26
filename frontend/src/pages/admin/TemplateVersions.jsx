import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getTemplates,
  getTemplateVersions,
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
  GitBranch,
  Plus,
  FileText,
  Eye,
  Loader2,
} from "lucide-react";

export default function TemplateVersions() {
  const { templateId } = useParams();

  const [template, setTemplate] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [templatesData, versionsData] = await Promise.all([
          getTemplates(),
          getTemplateVersions(templateId),
        ]);

        if (cancelled) return;

        const selectedTemplate = templatesData.find(
          (item) => String(item.id) === String(templateId)
        );

        setTemplate(selectedTemplate ?? null);

        const sortedVersions = Array.isArray(versionsData)
          ? [...versionsData].sort(
              (a, b) => b.version - a.version
            )
          : [];

        setVersions(sortedVersions);

        if (!selectedTemplate) {
          setError(
            "Template details could not be found. It may be archived or unavailable."
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load template versions.");
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
  }, [templateId]);

  const latestVersion = versions.length > 0 ? versions[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-3">
          <Link to="/admin/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-bold tracking-tight">
                Template Versions
              </h1>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {template
                ? `Version history for ${template.name}`
                : "View and manage template versions."}
            </p>
          </div>

          <Button asChild disabled={!template}>
            <Link to={`/admin/templates/${templateId}/versions/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Version
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading version history...
        </div>
      ) : error ? (
        <Card>
          <CardContent className="space-y-3 py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" asChild>
              <Link to="/admin/templates">Return to Templates</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Versions</CardDescription>
                <CardTitle className="text-3xl">
                  {versions.length}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Latest Version</CardDescription>
                <CardTitle className="text-3xl">
                  {latestVersion
                    ? `v${latestVersion.version}`
                    : "None"}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>
                Previous versions remain available for documents created
                using those versions.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {versions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">No versions found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This template does not have any version records yet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Change Reason</TableHead>
                        <TableHead>Fields</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {versions.map((version) => (
                        <TableRow key={version.id}>
                          <TableCell className="font-medium">
                            v{version.version}
                          </TableCell>

                          <TableCell className="max-w-sm text-muted-foreground">
                            {version.change_reason || "Initial version"}
                          </TableCell>

                          <TableCell>
                            {Array.isArray(version.fields_schema)
                              ? version.fields_schema.length
                              : 0}
                          </TableCell>

                          <TableCell>
                            {version.id === latestVersion?.id ? (
                              <Badge>Latest</Badge>
                            ) : (
                              <Badge variant="secondary">
                                Previous
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link
                                  to={`/admin/templates/${templateId}/versions/${version.id}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}