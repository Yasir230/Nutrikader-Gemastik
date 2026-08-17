import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SyncEngineRegister } from "@/components/sync-engine-register";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  style: "normal",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NutriKader — Dashboard Pendampingan Gizi Balita & MBG",
  description: "Dashboard admin internal untuk pemantauan gizi balita dan integrasi program Makan Bergizi Gratis (MBG). Badan Gizi Nasional (BGN).",
  keywords: ["NutriKader", "MBG", "BGN", "Makan Bergizi Gratis", "gizi balita", "stunting", "dashboard admin"],
  authors: [{ name: "Badan Gizi Nasional (BGN)" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${plusJakarta.variable} ${ibmPlexMono.variable} antialiased`}
        style={{
          fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif",
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text)",
        }}
      >
        {children}
        <ServiceWorkerRegister />
        <SyncEngineRegister />
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}
