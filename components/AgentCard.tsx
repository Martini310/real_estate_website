"use client";

import Image from "next/image";

interface Agent {
  name: string;
  phone: string;
  email: string;
  image: string;
}

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const handleCall = () => {
    window.location.href = `tel:${agent.phone}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:${agent.email}`;
  };

  return (
    <div className="flex items-center gap-4 p-6 rounded-lg border border-white/8 bg-white/3">
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={agent.image}
          alt={agent.name}
          fill
          className="object-cover rounded-full"
          sizes="64px"
        />
      </div>
      
      <div className="flex-1">
        <h4 className="text-text-primary font-light text-lg mb-1">
          {agent.name}
        </h4>
        <p className="text-text-secondary text-sm mb-3">Doradca ds. nieruchomości</p>

        <div className="flex gap-2">
          <button
            onClick={handleCall}
            className="px-3 py-1.5 text-xs font-light border border-accent/30 text-accent hover:bg-accent/5 transition-colors"
          >
            Zadzwoń
          </button>
          <button
            onClick={handleEmail}
            className="px-3 py-1.5 text-xs font-light border border-accent/30 text-accent hover:bg-accent/5 transition-colors"
          >
            Napisz
          </button>
        </div>
      </div>
    </div>
  );
}
