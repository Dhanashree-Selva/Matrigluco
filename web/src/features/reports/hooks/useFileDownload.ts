import { useState, useCallback, useEffect } from "react";
import { reportsApi } from "../api/reports.api";
import { toast } from "../../../shared/ui";

export function useFileDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFile = useCallback(
    async (
      identifier: string,
      filename: string = "medical-report.pdf",
      reportId?: string
    ) => {
      if (!identifier && !reportId) return;
      setIsDownloading(true);
      try {
        let blob: Blob;
        const targetReportId = reportId || identifier;
        try {
          // Attempt downloading high-fidelity Jinja2 generated clinical PDF first
          blob = await reportsApi.downloadReportPdfBlob(targetReportId);
        } catch {
          // Fallback to original attached file asset stream
          blob = await reportsApi.downloadPrivateFileBlob(identifier);
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const safeName = filename.includes(".") ? filename : `${filename}.pdf`;
        a.download = safeName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Download started", {
          description: `Downloading "${safeName}" securely.`,
        });
      } catch (err: any) {
        toast.error("Download failed", {
          description: err?.message || "Could not retrieve private file stream.",
        });
      } finally {
        setIsDownloading(false);
      }
    },
    []
  );

  return {
    downloadFile,
    isDownloading,
  };
}

export function useFilePreviewBlob(fileId?: string) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      setBlobUrl(null);
      setMimeType(null);
      return;
    }

    let active = true;
    let createdUrl: string | null = null;

    async function loadBlob() {
      setIsLoading(true);
      setError(null);
      try {
        const blob = await reportsApi.downloadPrivateFileBlob(fileId!);
        if (!active) return;
        setMimeType(blob.type || null);
        createdUrl = window.URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Failed to load file preview");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadBlob();

    return () => {
      active = false;
      if (createdUrl) {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [fileId]);

  return {
    blobUrl,
    mimeType,
    isLoading,
    error,
  };
}
