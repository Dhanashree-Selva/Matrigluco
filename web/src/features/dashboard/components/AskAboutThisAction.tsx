import { useNavigate } from "react-router-dom";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { Button } from "../../../shared/ui";
import { routePaths } from "../../../app/route-paths";

export interface AskAboutThisActionProps {
  contextTopic: string;
  resourceId?: string;
  className?: string;
}

export function AskAboutThisAction({
  contextTopic,
  resourceId,
  className = "",
}: AskAboutThisActionProps) {
  const navigate = useNavigate();

  const handleAsk = () => {
    const params = new URLSearchParams();
    params.set("resourceType", "tracking");
    params.set("topic", contextTopic);
    if (resourceId) {
      params.set("resourceId", resourceId);
    }

    navigate(`${routePaths.app.assistant}?${params.toString()}`, {
      state: {
        topic: contextTopic,
        resourceType: "tracking",
        resourceId,
      },
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleAsk}
      className={`h-7 px-2.5 text-[11px] font-bold border-[var(--border-pink)] text-[var(--primary)] hover:bg-[var(--accent-soft)] cursor-pointer inline-flex items-center gap-1.5 ${className}`}
    >
      <AppIcon icon={SparklesIcon} size="xs" />
      <span>Ask about this</span>
    </Button>
  );
}
