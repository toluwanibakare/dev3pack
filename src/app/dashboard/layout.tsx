import { SolanaProvider } from "@/components/SolanaProvider";
import { OnboardingTour } from "@/components/dashboard/OnboardingTour";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SolanaProvider>
      {children}
      <OnboardingTour />
    </SolanaProvider>
  );
}
