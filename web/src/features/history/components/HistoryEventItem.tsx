import { HistoryEventVM } from "../types/history.types";
import { ReadingHistoryEvent } from "./ReadingHistoryEvent";
import { AssessmentHistoryEvent } from "./AssessmentHistoryEvent";
import { ReportHistoryEvent } from "./ReportHistoryEvent";
import { ConsultationHistoryEvent } from "./ConsultationHistoryEvent";
import { EpisodeThread } from "./EpisodeThread";

interface HistoryEventItemProps {
  event: HistoryEventVM;
}

export function HistoryEventItem({ event }: HistoryEventItemProps) {
  const renderEvent = () => {
    switch (event.type) {
      case "measurement":
        return <ReadingHistoryEvent event={event} />;
      case "assessment":
        return <AssessmentHistoryEvent event={event} />;
      case "report":
        return <ReportHistoryEvent event={event} />;
      case "consultation":
        return <ConsultationHistoryEvent event={event} />;
      default:
        return null;
    }
  };

  if (event.episodeId && (event.type === "report" || event.type === "consultation")) {
    return (
      <EpisodeThread parentEvent={event}>
        {renderEvent()}
      </EpisodeThread>
    );
  }

  return renderEvent();
}
