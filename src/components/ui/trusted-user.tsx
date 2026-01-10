import { Badge } from "@/components/ui/badge";
import { CircleCheck } from "lucide-react";

export function TrustedBadge({ trusted }: { trusted?: boolean }) { // Capitalized component name
  if (!trusted) return null;

  return (
    <Badge
      variant="secondary"
      className="gap-1.5 px-3 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
    >
      <CircleCheck className="w-3.5 h-3.5" />
      Trusted User
    </Badge>
  );
}