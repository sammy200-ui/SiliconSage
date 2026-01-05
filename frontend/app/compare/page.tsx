import { EcosystemComparison } from "@/components/compare/ecosystem-comparison";

export const metadata = {
  title: "Compare | SiliconSage",
  description: "Compare custom PC builds against consoles and gaming laptops to find the best value.",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <EcosystemComparison />
    </div>
  );
}
