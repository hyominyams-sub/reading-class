import os from "node:os";
import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { QrSheet } from "@/components/qr-sheet";

export const metadata: Metadata = { title: "QR 인쇄" };
export const dynamic = "force-dynamic";

function lanHosts(): string[] {
  const hosts: string[] = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const ni of list ?? []) {
      if (ni.family === "IPv4" && !ni.internal) hosts.push(ni.address);
    }
  }
  return hosts;
}

export default function QrPage() {
  return (
    <>
      <AppHeader />
      <QrSheet lanHosts={lanHosts()} />
    </>
  );
}
