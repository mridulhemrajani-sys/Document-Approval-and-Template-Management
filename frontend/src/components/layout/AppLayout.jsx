import { use, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {user} = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex">
        <Sidebar user={user} />
      </div>

      <div className="lg:pl-64">
        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">
            Navigation
          </SheetTitle>
          <Sidebar
            user={user}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}