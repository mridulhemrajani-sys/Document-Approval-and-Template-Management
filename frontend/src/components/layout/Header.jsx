import { Menu, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const initials = (user?.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>

        <div>
          <p className="text-sm font-medium">Document Workspace</p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Manage your document workflow
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
            render={<Button variant="ghost" className="gap-2 px-2" />}
  >
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/15 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <span className="hidden max-w-36 truncate text-sm sm:block">
              {user?.name}
            </span>

            <ChevronDown className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p>{user?.name}</p>
            <p className="font-normal text-muted-foreground">
              {user?.email}
            </p>
          </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}