import Image from "next/image";
import { ButtonLink } from "./ui/Button";
import PhoneIcon from "./ui/PhoneIcon";
import { Agent } from "@/types/property";
import { siteConfig } from "@/lib/site";

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="flex items-center gap-4 p-6 rounded-card border border-line bg-beige/[0.03]">
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
        <h3 className="text-text-primary text-h3 mb-1">{agent.name}</h3>
        {/* Licencja tutaj, bo z opisu oferty wycinamy podpis agenta (lib/description.ts) */}
        <p className="text-text-secondary text-small mb-3">
          {siteConfig.role}, licencja zawodowa nr {siteConfig.licenseNumber}
        </p>

        <div className="flex flex-wrap gap-2">
          {/* Numer widoczny, nie tylko „Zadzwoń” — na komputerze `tel:` często nic nie otwiera */}
          <ButtonLink href={`tel:${agent.phone.replace(/\s/g, "")}`} variant="secondary" size="sm">
            <PhoneIcon />
            {agent.phone}
          </ButtonLink>
          <ButtonLink href={`mailto:${agent.email}`} variant="secondary" size="sm">
            E-mail
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
