import '../styles/login.css'
import login from '../services/auth'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const navigate = useNavigate()
  const location = useLocation()
  const {refreshUser} = useAuth()

  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(formData.email, formData.password);

      const user = await refreshUser();
      const role = String(user.role).toLowerCase();

      const destinations = {
        admin: "/admin",
        author: "/author",
        reviewer: "/reviewer",
      };

      const destination = destinations[role];

      if (!destination) {
        localStorage.removeItem("access_token");
        throw new Error("Your account has an unsupported role.");
      }

      const requestedPath = location.state?.from?.pathname;
      const rolePaths = {
        admin: "/admin",
        author: "/author",
        reviewer: "/reviewer",
      };

      const target =
        requestedPath === rolePaths[role]
          ? requestedPath
          : destination;

      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="login-page">
      <Card className="login-card">
        <CardHeader className="login-header">
          <CardTitle className="login-title">
            Welcome Back
          </CardTitle>

          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="form-item">
              <Label htmlFor="email">
                Email Id
              </Label>

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
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <p role="alert" className='text-sm text-destructive'>
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="login-button"
              disabled = {submitting}
            >
              {submitting ? "Signing In ..." : "Sign In"}
            </Button>
          </form>

          <p className="login-footer">
            Don't have an account?{' '}
            <Link to="/register" className="register-link">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}