import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTemplates } from "@/services/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, History, Search, FileText } from "lucide-react";

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTemplates() {
    setLoading(true);
    setError("");

    try {
      const data = await getTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load templates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  const filteredTemplates = templates.filter((template) => {
    const query = search.toLowerCase();

    return (
      template.name?.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      String(template.id).includes(query)
    );
  });

  return (
    <div className="space-y-6 p-[10px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Template Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage document templates and their versions.
          </p>
        </div>

        <Button asChild>
          <Link to="/admin/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Templates</CardDescription>
            <CardTitle className="text-3xl">
              {templates.length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Matching Templates</CardDescription>
            <CardTitle className="text-3xl">
              {filteredTemplates.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            Search templates and open their version history.
          </CardDescription>

          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, description, or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading templates...
            </p>
          ) : error ? (
            <div className="space-y-3 py-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={loadTemplates}>
                Try Again
              </Button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {search ? "No matching templates" : "No templates yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search
                    ? "Try a different search term."
                    : "Create your first template to get started."}
                </p>
              </div>

              {!search && (
                <Button asChild>
                  <Link to="/admin/templates/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        #{template.id}
                      </TableCell>

                      <TableCell className="font-medium">
                        {template.name}
                      </TableCell>

                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {template.description || "No description"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            template.is_archived
                              ? "secondary"
                              : "default"
                          }
                        >
                          {template.is_archived ? "Archived" : "Active"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              to={`/admin/templates/${template.id}/versions`}
                            >
                              <History className="mr-2 h-4 w-4" />
                              Versions
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
    </div>
  );
}