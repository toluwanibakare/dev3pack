import { SolanaProvider } from "@/components/SolanaProvider";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SolanaProvider>{children}</SolanaProvider>;
}