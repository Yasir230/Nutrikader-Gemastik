"use client";

import React from "react";
import { useAuth } from "@/lib/auth-store";
import { LoginPage } from "@/components/login-page";
import { AppShell } from "@/components/app-shell";

export default function Home() {
  const { user, restoreSession } = useAuth();

  React.useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (!user) {
    return <LoginPage />;
  }

  return <AppShell />;
}
