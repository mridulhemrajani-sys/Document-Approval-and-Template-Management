import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getTemplates,
  getLatestTemplate,
  createTemplateVersion,
} from "@/services/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GitBranch,
  Loader2,
} from "lucide-react";

function createEmptyField() {
  return {
    name: "",
    label: "",
    type: "string",
    required: false,
  };
}

function validateFields(fields) {
  if (fields.length === 0) {
    return "A template version must contain at least one field.";
  }

  const names = new Set();

  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];
    const name = field.name.trim();

    if (!name) {
      return `Field ${index + 1}: enter a field name.`;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      return `Field ${index + 1}: use letters, numbers, and underscores for the field name. The name must not start with a number.`;
    }

    if (names.has(name.toLowerCase())) {
      return `Field name "${name}" is duplicated.`;
    }

    names.add(name.toLowerCase());

    if (!field.label.trim()) {
      return `Field ${index + 1}: enter a display label.`;
    }
  }

  return "";
}

export default function CreateTemplateVersion() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [fields, setFields] = useState([]);
  const [changeReason, setChangeReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [templatesData, latestData] = await Promise.all([
          getTemplates(),
          getLatestTemplate(templateId),
        ]);

        if (cancelled) return;

        const selectedTemplate = templatesData.find(
          (item) => String(item.id) === String(templateId)
        );

        if (!selectedTemplate) {
          setError("Template not found or unavailable.");
          return;
        }

        setTemplate(selectedTemplate);
        setCurrentVersion(latestData);

        const schema = Array.isArray(latestData.fields_schema)
          ? latestData.fields_schema
          : [];

        setFields(
          schema.map((field) => ({
            name: field.name ?? "",
            label: field.label ?? "",
            type: field.type ?? "string",
            required: field.required === true,
          }))
        );
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load the latest template version.");
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

  function updateField(index, key, value) {
    setFields((currentFields) =>
      currentFields.map((field, fieldIndex) =>
        fieldIndex === index
          ? { ...field, [key]: value }
          : field
      )
    );
  }

  function addField() {
    setFields((currentFields) => [
      ...currentFields,
      createEmptyField(),
    ]);
  }

  function removeField(index) {
    setFields((currentFields) =>
      currentFields.filter((_, fieldIndex) => fieldIndex !== index)
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!currentVersion) {
      setError("The current template version could not be loaded.");
      return;
    }

    if (!changeReason.trim()) {
      setError("Please explain why you are creating this version.");
      return;
    }

    const fieldError = validateFields(fields);

    if (fieldError) {
      setError(fieldError);
      return;
    }

    const payload = {
      change_reason: changeReason.trim(),
      fields_schema: fields.map((field) => ({
        name: field.name.trim(),
        label: field.label.trim(),
        type: field.type,
        required: field.required,
      })),
    };

    setSubmitting(true);

    try {
      await createTemplateVersion(templateId, payload);

      navigate(`/admin/templates/${templateId}/versions`, {
        state: { successMessage: "New template version created successfully." },
      });
    } catch (err) {
      setError(err.message || "Unable to create a new template version.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading template schema...
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/admin/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </Button>

        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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

        <div className="flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">
            Create Template Version
          </h1>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {template?.name} · Current version: v{currentVersion?.version}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Version Information</CardTitle>
          <CardDescription>
            A new version preserves the previous schema for existing documents.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <Label htmlFor="change-reason">Change Reason</Label>
          <Textarea
            id="change-reason"
            placeholder="Explain what changed and why..."
            value={changeReason}
            onChange={(event) => setChangeReason(event.target.value)}
            rows={3}
            required
          />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Field Schema</CardTitle>
                <CardDescription className="mt-1">
                  The current version's fields are pre-filled. Edit them
                  or add and remove fields as needed.
                </CardDescription>
              </div>

              <Button type="button" variant="outline" onClick={addField}>
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {fields.length === 0 && (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No fields in this schema. Add a field to continue.
              </p>
            )}

            {fields.map((field, index) => (
              <div
                key={index}
                className="space-y-4 rounded-lg border bg-muted/20 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Field {index + 1}</h3>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(index)}
                    aria-label={`Remove field ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`field-name-${index}`}>
                      Field Name
                    </Label>
                    <Input
                      id={`field-name-${index}`}
                      value={field.name}
                      onChange={(event) =>
                        updateField(index, "name", event.target.value)
                      }
                      placeholder="e.g. project_title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`field-label-${index}`}>
                      Display Label
                    </Label>
                    <Input
                      id={`field-label-${index}`}
                      value={field.label}
                      onChange={(event) =>
                        updateField(index, "label", event.target.value)
                      }
                      placeholder="e.g. Project Title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Field Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) =>
                        updateField(index, "type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">Text</SelectItem>
                        <SelectItem value="integer">Integer</SelectItem>
                        <SelectItem value="float">Decimal</SelectItem>
                        <SelectItem value="boolean">Yes / No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3 sm:pt-7">
                    <Checkbox
                      id={`field-required-${index}`}
                      checked={field.required}
                      onCheckedChange={(checked) =>
                        updateField(index, "required", checked === true)
                      }
                    />
                    <Label
                      htmlFor={`field-required-${index}`}
                      className="cursor-pointer"
                    >
                      Required field
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </div>
          )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" type="button" asChild>
            <Link to={`/admin/templates/${templateId}/versions`}>
              Cancel
            </Link>
          </Button>

          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {submitting ? "Creating Version..." : "Create Version"}
          </Button>
        </div>
      </form>
    </div>
  );
}