import { ResourceUnavailableState } from "../../../../pages/system/ResourceUnavailableState";

interface ResultUnavailableProps {
  onRetry?: () => void;
}

export function ResultUnavailable({ onRetry }: ResultUnavailableProps) {
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <ResourceUnavailableState resourceType="assessment" onRetry={onRetry} />
    </div>
  );
}
