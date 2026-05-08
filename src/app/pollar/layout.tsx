import "@pollar/react/styles.css";
import { TrustlessWorkPollarBridge } from "@/components/providers/TrustlessWorkPollarBridge";

export default function PollarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TrustlessWorkPollarBridge>{children}</TrustlessWorkPollarBridge>;
}
