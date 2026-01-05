import { BuilderInterface } from "@/components/builder/builder-interface";

export const metadata = {
  title: "PC Builder | SiliconSage",
  description: "Build your perfect PC with AI-powered compatibility checking and bottleneck detection.",
};

export default function BuilderPage() {
  return (
    <div className="min-h-screen bg-[#171514]">
      <BuilderInterface />
    </div>
  );
}
