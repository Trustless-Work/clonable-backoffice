import * as React from "react";
import { TrustlessWorkCrossmintBridge } from "@/components/providers/TrustlessWorkCrossmintBridge";

export default function CrossmintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0C0D] text-[#111111] dark:text-[#EEEEEE]">
      <TrustlessWorkCrossmintBridge>{children}</TrustlessWorkCrossmintBridge>
    </div>
  );
}
