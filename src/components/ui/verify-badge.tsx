import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Lock, ShieldCheck } from "lucide-react";

export function VerifyBadge({ verified }: { verified?: boolean }) {
  if (!verified) return null;

  return (
    <Badge
      variant="link"
      className="gap-1 text-xs text-green-600 border-none bg-green-50"
      
    >
        Verified
      <BadgeCheck  className="w-4 h-4" />
      
    </Badge>
  );
}
