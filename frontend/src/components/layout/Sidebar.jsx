import { NavLink } from "react-router-dom";
import { FileCheck2, PanelLeftClose } from "lucide-react";
import { navigationByRole } from "./navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Sidebar({ user, onNavigate, onCollapse }) {
  const role = String(user?.role || "").toLowerCase();
  const navigation = navigationByRole[role] || [];

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileCheck2 className="size-5" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">DocFlow</p>
            <p className="text-xs text-muted-foreground">
              Document workspace
            </p>
          </div>
        </div>

        {onCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
      </div>

      <Separator />

      <div className="px-4 pb-2 pt-6">
        <p className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">
          Signed in as
        </p>
        <p className="mt-1 truncate text-sm font-medium">
          {user?.name}
        </p>
        <p className="mt-1 text-xs capitalize text-muted-foreground">
          {role}
        </p>
      </div>
    </aside>
  );
}