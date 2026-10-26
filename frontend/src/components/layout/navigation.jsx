import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  ClipboardCheck,
  Files,
  Users,
  Settings,
  Layers3,
} from "lucide-react";

export const navigationByRole = {
  admin: [
    {
      label: "Overview",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Submitted Documents",
      path: "/admin/documents",
      icon: Files,
    },
    {
      label: "Templates",
      path: "/admin/templates",
      icon: Layers3,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
  ],

  author: [
    {
      label: "Overview",
      path: "/author",
      icon: LayoutDashboard,
    },
    {
      label: "My Documents",
      path: "/author/documents",
      icon: FileText,
    },
    {
      label: "Create Document",
      path: "/author/create",
      icon: FilePlus2,
    },
    {
      label: "Approved Documents",
      path: "/author/approved",
      icon: Files,
    },
  ],

  reviewer: [
    {
      label: "Overview",
      path: "/reviewer",
      icon: LayoutDashboard,
    },
    {
      label: "Review Queue",
      path: "/reviewer/queue",
      icon: ClipboardCheck,
    },
  ],
};