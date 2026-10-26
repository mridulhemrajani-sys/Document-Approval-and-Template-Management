import "../styles/login.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";

import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";

export default function Register() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

const ROLE_OPTIONS = [
  { value: "author", label: "Author" },
  { value: "reviewer", label: "Reviewer" },
];

const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  requested_role: "author",
});

  const navigate = useNavigate();

  function handleChange(e) {
  const { name, value } = e.target;

  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));

  }

  function handleRoleChange(value) {
    if (!value) return;
    setFormData((prev) => ({ ...prev, requested_role: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.requested_role
      );

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Registration submitted successfully. Your account is awaiting admin approval.",
        },
      });
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }

  }

  return (
  <div className="login-page">
  <Card className="register-card">
  <CardHeader className="login-header">
  <CardTitle className="login-title">
  Create an account
  </CardTitle>

        <CardDescription>
          Enter your details and request an account role.
          An administrator must approve your account before you
          can sign in.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-item">
            <Label htmlFor="name">Name</Label>

            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-item">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-item">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-item">
            <Label htmlFor="requested_role">
              Requested Role
            </Label>

            <Select
  items={ROLE_OPTIONS}
  value={formData.requested_role}
  onValueChange={handleRoleChange}
>
  <SelectTrigger id="requested_role">
    <SelectValue placeholder="Choose a role" />
  </SelectTrigger>

  <SelectContent>
    {ROLE_OPTIONS.map((role) => (
      <SelectItem key={role.value} value={role.value}>
        {role.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

            <p className="text-sm text-muted-foreground">
              Your requested role is subject to administrator approval.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="login-button"
            disabled={submitting}
          >
            {submitting
              ? "Submitting registration..."
              : "Create Account"}
          </Button>
        </form>

        <p className="login-footer">
          Already have an account?{" "}
          <Link to="/login" className="register-link">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  </div>

  );
}