import { useParams, Link } from "react-router-dom";
import { useReport } from "../hooks/useReport";
import { ReportDetailHeader } from "../components/detail/ReportDetailHeader";
import { EvidenceSplit } from "../components/detail/EvidenceSplit";
import { ReportDetailSkeleton } from "../components/detail/ReportDetailSkeleton";
import { ResourceUnavailableState } from "../../../pages/system/ResourceUnavailableState";

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: report, isLoading, isError } = useReport(id);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto pb-12">
        <ReportDetailSkeleton />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <ResourceUnavailableState resourceType="report" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in-50 duration-200">
      <ReportDetailHeader report={report} />
      <EvidenceSplit report={report} />
    </div>
  );
}
