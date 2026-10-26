import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DynamicDocumentForm({
  fieldsSchema,
  initialTitle = "",
  initialFields = {},
  onSubmit,
  submitting = false,
  submitLabel = "Save Draft",
}) {
  const [title, setTitle] = useState(initialTitle);
  const [fields, setFields] = useState(initialFields);
  const [error, setError] = useState("");

  function updateField(name, value) {
    setFields((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a document title.");
      return;
    }

    for (const field of fieldsSchema) {
      const value = fields[field.name];

      if (
        field.required &&
        (value === undefined ||
          value === null ||
          value === "" ||
          (typeof value === "string" && !value.trim()))
      ) {
        setError(`${field.label} is required.`);
        return;
      }

      if (value !== undefined && value !== "" && value !== null) {
        if (field.type === "integer" && !Number.isInteger(Number(value))) {
          setError(`${field.label} must be a whole number.`);
          return;
        }
        if (field.type === "float" && !Number.isFinite(Number(value))) {
          setError(`${field.label} must be a valid number.`);
          return;
        }
      }
    }

    try {
      await onSubmit({ title: title.trim(), fields });
    } catch (err) {
      setError(err.message || "Unable to save the document.");
    }
  }

  function renderField(field) {
    const value = fields[field.name] ?? "";

    if (field.type === "boolean") {
      return (
        <label
          key={field.name}
          className="flex items-center gap-3 rounded-lg border border-border p-3"
        >
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => updateField(field.name, event.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="text-sm text-foreground">
            {field.label}
            {field.required && " *"}
          </span>
        </label>
      );
    }

    const inputType =
      field.type === "integer" || field.type === "float" ? "number" : "text";

    const inputValue =
      field.type === "integer" || field.type === "float"
        ? value === ""
          ? ""
          : String(value)
        : value;

    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && " *"}
        </Label>

        {field.type === "string" && field.multiline ? (
          <Textarea
            id={field.name}
            value={inputValue}
            required={field.required}
            onChange={(event) => updateField(field.name, event.target.value)}
          />
        ) : (
          <Input
            id={field.name}
            type={inputType}
            step={
              field.type === "float"
                ? "any"
                : field.type === "integer"
                  ? "1"
                  : undefined
            }
            value={inputValue}
            required={field.required}
            onChange={(event) =>
              updateField(
                field.name,
                field.type === "integer" || field.type === "float"
                  ? event.target.value
                  : event.target.value,
              )
            }
          />
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="document-title">Document Title *</Label>
        <Input
          id="document-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter a descriptive title"
          required
        />
      </div>

      {fieldsSchema.map(renderField)}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
