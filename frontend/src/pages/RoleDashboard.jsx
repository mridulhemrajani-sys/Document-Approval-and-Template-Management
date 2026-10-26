import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getTemplates } from "@/services/templates";
import { getMyDocuments } from "@/services/document";
import {
  getSubmittedDocuments,
  getReviewers,
} from "@/services/admin";
import { getReviewQueue } from "@/services/reviews";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  FileText,
  FilePlus2,
  ClipboardCheck,
  Users,
  LayoutTemplate,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

const STATUS_STYLES = {
  DRAFT: "secondary",
  IN_REVIEW: "default",
  CHANGES_REQUESTED: "destructive",
  APPROVED: "outline",
  REJECTED: "destructive",
};

function normalizeStatus(status) {
  return String(status ?? "")
    .toUpperCase()
    .split(".")
    .pop();
}

function MetricCard({ title, value, description, icon: Icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{title}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function QuickAction({ title, description, to, icon: Icon }) {
  return (
    <Link to={to} className="block">
      <div className="group flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
        <div className="rounded-lg bg-muted p-3">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function DocumentList({ documents, emptyMessage, linkTo }) {
  if (documents.length === 0) {
    return (
      <div className="py-8 text-center">
        <FileText className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {documents.slice(0, 5).map((document) => {
        const status = normalizeStatus(document.status);

        return (
          <div
            key={document.id}
            className="flex items-center justify-between gap-4 py-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{document.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Document #{document.id}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Badge variant={STATUS_STYLES[status] ?? "secondary"}>
                {status.replaceAll("_", " ")}
              </Badge>

              <Button variant="ghost" size="icon" asChild>
                <Link
                  to={linkTo(document)}
                  aria-label={`Open ${document.title}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RoleDashboard() {
  const { user } = useAuth();
  const role = String(user?.role ?? "").toLowerCase();

  const [data, setData] = useState({
    documents: [],
    templates: [],
    reviewers: [],
    submitted: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      let results;

      if (role === "admin") {
        results = await Promise.all([
          getTemplates(),
          getSubmittedDocuments(),
          getReviewers(),
        ]);

        setData({
          templates: results[0],
          submitted: results[1],
          reviewers: results[2],
          documents: [],
        });
      } else if (role === "author") {
        const documents = await getMyDocuments();

        setData({
          documents,
          templates: [],
          reviewers: [],
          submitted: [],
        });
      } else if (role === "reviewer") {
        const documents = await getReviewQueue();

        setData({
          documents,
          templates: [],
          reviewers: [],
          submitted: [],
        });
      } else {
        setError("Your account does not have a supported dashboard role.");
      }
    } catch (err) {
      setError(err.message || "Unable to load dashboard information.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (role) {
      loadDashboard();
    }
  }, [role]);

  const documents = Array.isArray(data.documents)
    ? data.documents
    : [];

  const templates = Array.isArray(data.templates)
    ? data.templates
    : [];

  const reviewers = Array.isArray(data.reviewers)
    ? data.reviewers
    : [];

  const submitted = Array.isArray(data.submitted)
    ? data.submitted
    : [];

  const countStatus = (status) =>
    documents.filter(
      (document) => normalizeStatus(document.status) === status
    ).length;

  const roleConfig = {
    admin: {
      title: "Admin Dashboard",
      description: "Manage templates, documents, and review assignments.",
    },
    author: {
      title: "Author Dashboard",
      description: "Create documents and track their review progress.",
    },
    reviewer: {
      title: "Reviewer Dashboard",
      description: "Review assigned documents and manage your queue.",
    },
  };

  const config = roleConfig[role];

  if (!config) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            Your dashboard is not available for this account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 p-[10px]">
      {/* Welcome section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back,
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {user?.name || "User"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {config.description}
          </p>
        </div>

        <Badge variant="secondary" className="w-fit capitalize">
          {role}
        </Badge>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-3 rounded-lg border py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your dashboard...
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-medium">Unable to load dashboard</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error}
              </p>
            </div>
            <Button variant="outline" onClick={loadDashboard}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* ADMIN DASHBOARD */}
          {role === "admin" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  title="Templates"
                  value={templates.length}
                  description="Available document templates"
                  icon={LayoutTemplate}
                />

                <MetricCard
                  title="Awaiting Assignment"
                  value={submitted.length}
                  description="Submitted documents to manage"
                  icon={Clock}
                />

                <MetricCard
                  title="Reviewers"
                  value={reviewers.length}
                  description="Available reviewer accounts"
                  icon={Users}
                />
              </div>

              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Quick Actions
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Common administration tasks.
                  </p>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <QuickAction
                    title="Manage Templates"
                    description="Create templates and manage their versions."
                    to="/admin/templates"
                    icon={LayoutTemplate}
                  />

                  <QuickAction
                    title="Assign Documents"
                    description="Assign submitted documents to reviewers."
                    to="/admin/documents"
                    icon={ClipboardCheck}
                  />

                  <QuickAction
                    title="Review Documents"
                    description="Open submitted documents awaiting assignment."
                    to="/admin/documents"
                    icon={FileText}
                  />
                </div>
              </section>

              <Card>
                <CardHeader>
                  <CardTitle>Administration Overview</CardTitle>
                  <CardDescription>
                    Your current template and assignment workload.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
                      <span>Manage document templates</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/templates">Open</Link>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                      <span>Documents awaiting assignment</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/documents">Open</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          {/* AUTHOR DASHBOARD */}
          {role === "author" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  title="Total Documents"
                  value={documents.length}
                  description="All your documents"
                  icon={FileText}
                />

                <MetricCard
                  title="Drafts"
                  value={countStatus("DRAFT")}
                  description="Documents not yet submitted"
                  icon={FilePlus2}
                />

                <MetricCard
                  title="Under Review"
                  value={countStatus("IN_REVIEW")}
                  description="Documents in the review process"
                  icon={Clock}
                />

                <MetricCard
                  title="Changes Requested"
                  value={countStatus("CHANGES_REQUESTED")}
                  description="Documents needing your attention"
                  icon={AlertCircle}
                />

                {/* <MetricCard
                  title="Approved"
                  value={countStatus("APPROVED")}
                  description="Documents approved by reviewers"
                  icon={CheckCircle2}
                />

                <MetricCard
                  title="Rejected"
                  value={countStatus("REJECTED")}
                  description="Documents that were rejected"
                  icon={FileText}   
                /> */}
              </div>

              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Quick Actions
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Continue working on your documents.
                  </p>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <QuickAction
                    title="Create a Document"
                    description="Start a document using an available template."
                    to="/author/create"
                    icon={FilePlus2}
                  />

                  <QuickAction
                    title="My Documents"
                    description="Edit drafts and track document status."
                    to="/author/documents"
                    icon={FileText}
                  />
                </div>
              </section>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Documents</CardTitle>
                    <CardDescription>
                      Your most recent documents.
                    </CardDescription>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <Link to="/author/documents">View All</Link>
                  </Button>
                </CardHeader>

                <CardContent>
                  <DocumentList
                    documents={documents}
                    emptyMessage="You haven't created any documents yet."
                    linkTo={(document) =>
                      `/author/documents/${document.id}`
                    }
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* REVIEWER DASHBOARD */}
          {role === "reviewer" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  title="Assigned Documents"
                  value={documents.length}
                  description="Documents in your review queue"
                  icon={ClipboardCheck}
                />

                <MetricCard
                  title="Awaiting Review"
                  value={countStatus("IN_REVIEW")}
                  description="Documents currently in review"
                  icon={Clock}
                />

                <MetricCard
                  title="Changes Requested"
                  value={countStatus("CHANGES_REQUESTED")}
                  description="Documents marked for author updates"
                  icon={AlertCircle}
                />
              </div>

              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Review Workspace
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Access your assigned documents and review decisions.
                  </p>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <QuickAction
                    title="Open Review Queue"
                    description="Inspect assigned documents and submit decisions."
                    to="/reviewer/queue"
                    icon={ClipboardCheck}
                  />
                </div>
              </section>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your Review Queue</CardTitle>
                    <CardDescription>
                      Documents assigned to you.
                    </CardDescription>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <Link to="/reviewer/queue">View All</Link>
                  </Button>
                </CardHeader>

                <CardContent>
                  <DocumentList
                    documents={documents}
                    emptyMessage="You have no documents assigned for review."
                    linkTo={(document) =>
                      `/reviewer/queue/${document.id}`
                    }
                  />
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}