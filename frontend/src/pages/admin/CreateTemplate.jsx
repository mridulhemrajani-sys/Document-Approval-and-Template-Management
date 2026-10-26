import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createTemplate } from "@/services/templates";
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
  FilePlus2,
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
    return "Add at least one field to the template.";
  }

  const names = new Set();

  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];

    if (!field.name.trim()) {
      return `Field ${index + 1}: enter a field name.`;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name.trim())) {
      return `Field ${index + 1}: use letters, numbers, and underscores for the field name. The name must not start with a number.`;
    }

    if (names.has(field.name.trim().toLowerCase())) {
      return `Field name "${field.name}" is duplicated.`;
    }

    names.add(field.name.trim().toLowerCase());

    if (!field.label.trim()) {
      return `Field ${index + 1}: enter a display label.`;
    }
  }

  return "";
}

export default function CreateTemplate() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([createEmptyField()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Template name is required.");
      return;
    }

    if (!trimmedDescription) {
      setError("Template description is required.");
      return;
    }

    const fieldError = validateFields(fields);

    if (fieldError) {
      setError(fieldError);
      return;
    }

    const payload = {
      name: trimmedName,
      description: trimmedDescription,
      fields_schema: fields.map((field) => ({
        name: field.name.trim(),
        label: field.label.trim(),
        type: field.type,
        required: field.required,
      })),
    };

    setSubmitting(true);

    try {
      await createTemplate(payload);
      navigate("/admin/templates", {
        state: { successMessage: "Template created successfully." },
      });
    } catch (err) {
      setError(err.message || "Unable to create template.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3 -ml-3">
          <Link to="/admin/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </Button>

        <h1 className="text-2xl font-bold tracking-tight">
          Create Template
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define a reusable template and its initial set of fields.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
            <CardDescription>
              Provide a name and description to identify this template.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g. Project Proposal"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={150}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                placeholder="Describe what this template is used for..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Initial Field Schema</CardTitle>
                <CardDescription className="mt-1">
                  These fields will appear when authors create documents
                  using this template.
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addField}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
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
                    disabled={fields.length === 1}
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
                      placeholder="e.g. project_title"
                      value={field.name}
                      onChange={(event) =>
                        updateField(index, "name", event.target.value)
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Used as the key in the document data.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`field-label-${index}`}>
                      Display Label
                    </Label>
                    <Input
                      id={`field-label-${index}`}
                      placeholder="e.g. Project Title"
                      value={field.label}
                      onChange={(event) =>
                        updateField(index, "label", event.target.value)
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Shown to authors on the document form.
                    </p>
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
                        <SelectValue placeholder="Select a field type" />
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
            <Link to="/admin/templates">Cancel</Link>
          </Button>

          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FilePlus2 className="mr-2 h-4 w-4" />
            )}
            {submitting ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </form>
    </div>
  );
}