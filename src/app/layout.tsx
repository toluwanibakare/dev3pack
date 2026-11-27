import type { Metadata } from "next";
import "./globals.css";
import { SolanaProvider } from "@/components/SolanaProvider";

export const metadata: Metadata = {
  title: "SolVox — On-Chain Trust & Policy Firewall for Solana",
  description:
    "Speak a Solana goal. Verify the project website and on-chain wash-loop history, and enforce spending & trust rules inside an Anchor PolicyVault.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased selection:bg-emerald-500/30">
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
