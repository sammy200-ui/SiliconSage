import { AdvisorChat } from "@/components/advisor/advisor-chat";

export const metadata = {
  title: "AI Advisor | SiliconSage",
  description: "Chat with our AI advisor powered by Llama 3 to get personalized PC building recommendations.",
};

export default function AdvisorPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <AdvisorChat />
    </div>
  );
}
