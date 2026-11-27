import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "./fonts/inter-latin-var.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-inter",
  display: "swap",
});

const montserrat = localFont({
  src: "./fonts/montserrat-latin-var.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-montserrat",
  display: "swap",
});

const jetbrains = localFont({
  src: "./fonts/jetbrains-mono-latin-var.woff2",
  weight: "100 800",
  style: "normal",
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://solvox.vercel.app"),
  title: "SolVox — Speak. Verify. Execute. | On-Chain Trust & Policy Firewall",
  description:
    "The AI proposes. The Solana program decides. Speak a transfer goal, verify the recipient's live project site and wash-loop history, and enforce your spend & trust rules inside an Anchor PolicyVault.",
  icons: {
    icon: "/brand/solvox-icon-dark.png",
  },
  openGraph: {
    title: "SolVox — On-Chain Trust & Policy Firewall for Solana",
    description:
      "Speak. Verify. Execute. An AI assistant investigates the recipient's website and on-chain history first, while an Anchor PolicyVault enforces your limits on Solana.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SolVox — Speak. Verify. Execute.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SolVox — On-Chain Trust & Policy Firewall for Solana",
    description:
      "Speak. Verify. Execute. Live web + wash-loop verification enforced by an Anchor PolicyVault on Solana.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${montserrat.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-void font-sans antialiased selection:bg-mint/30">
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}