import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  Alert,
  AlertDescription,
  Progress,
  Spinner,
} from "../../../shared/ui";
import {
  Upload04Icon,
  Pdf02Icon,
  Image01Icon,
  DocumentCodeIcon,
  Cancel01Icon,
  Shield01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import { REPORTS_CONFIG } from "../config/reports.config";
import { formatBytes, detectFileType } from "../mappers/reports.mapper";
import { useUploadReport } from "../hooks/useUploadReport";

interface SecureIntakeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SecureIntake({ open, onOpenChange }: SecureIntakeProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadReport();

  const handleReset = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (uploadMutation.isPending) return;
    handleReset();
    onOpenChange(false);
  };

  const validateAndSelectFile = (file: File) => {
    setValidationError(null);

    // 1. Check size limit
    if (file.size > REPORTS_CONFIG.maxFileSizeBytes) {
      setValidationError(
        `File is too large (${formatBytes(file.size)}). Maximum supported size is ${REPORTS_CONFIG.maxFileSizeLabel}.`
      );
      return;
    }

    // 2. Check MIME / extension
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const isValidExt = REPORTS_CONFIG.acceptedExtensionsString.includes(ext);
    const isValidMime =
      REPORTS_CONFIG.acceptedMimeTypes.includes(file.type) || isValidExt;

    if (!isValidMime) {
      setValidationError(
        `Unsupported file type (${file.type || ext}). Please select a PDF, JPEG, PNG, or WebP document.`
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || uploadMutation.isPending) return;

    try {
      await uploadMutation.mutateAsync({ file: selectedFile });
      handleClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  const fileType = selectedFile ? detectFileType(selectedFile.name, selectedFile.type) : "document";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-[var(--card)] border-[var(--border)] p-6">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
            <AppIcon icon={Shield01Icon} size="xs" />
            <span>Secure Medical Intake</span>
          </div>

          <DialogTitle className="text-lg sm:text-xl font-black text-[var(--foreground)] tracking-tight">
            Upload Medical Report
          </DialogTitle>

          <DialogDescription className="text-xs text-[var(--muted-foreground)]">
            Upload a laboratory report, diagnostic scan, or prescription. Your file is saved in private authenticated storage and processed for clinical extraction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Dropzone Area */}
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragOver
                  ? "border-[var(--primary)] bg-[var(--accent-soft)]/50 scale-[0.99]"
                  : "border-[var(--border)] hover:border-[var(--primary)]/60 bg-[var(--surface-soft)]/40 hover:bg-[var(--surface-soft)]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={REPORTS_CONFIG.acceptedExtensionsString}
                onChange={handleFileChange}
                className="hidden"
                id="medical-report-file-input"
                aria-label="Select medical report file"
              />

              <div className="h-12 w-12 rounded-full bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center border border-[var(--primary)]/30 shadow-xs">
                <AppIcon icon={Upload04Icon} size="md" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-[var(--foreground)]">
                  Choose a file or drag and drop here
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  PDF, JPEG, PNG, or WebP up to {REPORTS_CONFIG.maxFileSizeLabel}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1 text-xs font-bold pointer-events-none"
              >
                Browse Document
              </Button>
            </div>
          ) : (
            /* Selected File Attachment Presentation */
            <div className="space-y-3">
              <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                Selected Document
              </p>

              <Attachment
                state={uploadMutation.isPending ? "uploading" : "idle"}
                size="default"
                orientation="horizontal"
                className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]"
              >
                <AttachmentMedia
                  variant="icon"
                  className="h-10 w-10 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] shrink-0"
                >
                  {fileType === "pdf" ? (
                    <AppIcon icon={Pdf02Icon} size="md" />
                  ) : fileType === "image" ? (
                    <AppIcon icon={Image01Icon} size="md" />
                  ) : (
                    <AppIcon icon={DocumentCodeIcon} size="md" />
                  )}
                </AttachmentMedia>

                <AttachmentContent className="flex-1 min-w-0">
                  <AttachmentTitle className="text-xs font-bold text-[var(--foreground)] truncate">
                    {selectedFile.name}
                  </AttachmentTitle>
                  <AttachmentDescription className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <span>{formatBytes(selectedFile.size)}</span>
                    <span>•</span>
                    <span className="uppercase font-mono text-[10px]">
                      {fileType}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Ready to upload
                    </span>
                  </AttachmentDescription>
                </AttachmentContent>

                <AttachmentActions>
                  <AttachmentAction
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleReset}
                    disabled={uploadMutation.isPending}
                    aria-label="Remove selected file"
                    className="text-[var(--muted-foreground)] hover:text-destructive"
                  >
                    <AppIcon icon={Cancel01Icon} size="xs" />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            </div>
          )}

          {/* Validation Alert */}
          {validationError && (
            <Alert variant="destructive" className="py-2.5 px-3">
              <AppIcon icon={AlertCircleIcon} size="xs" className="text-destructive shrink-0" />
              <AlertDescription className="text-xs font-medium ml-2">
                {validationError}
              </AlertDescription>
            </Alert>
          )}

          {/* Sample Test Files Helper */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--surface-soft)]/70 border border-[var(--border-subtle)] text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-[var(--foreground)]">
              <AppIcon icon={DocumentCodeIcon} size="xxs" className="text-[var(--primary)]" />
              <span>Need sample test files?</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/samples/OGTT_Lab_Report.pdf"
                download="OGTT_Lab_Report.pdf"
                className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1 text-[10px]"
              >
                <AppIcon icon={Pdf02Icon} size="xxs" />
                <span>Sample PDF</span>
              </a>
              <span className="text-[var(--muted-foreground)]">•</span>
              <a
                href="/samples/OGTT_Lab_Report.png"
                download="OGTT_Lab_Report.png"
                className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1 text-[10px]"
              >
                <AppIcon icon={Image01Icon} size="xxs" />
                <span>Sample PNG</span>
              </a>
            </div>
          </div>

          {/* Privacy & OCR Transparency Disclosure */}
          <div className="rounded-lg bg-[var(--surface-soft)]/50 border border-[var(--border-subtle)] p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--foreground)]">
              <AppIcon icon={CheckmarkCircle02Icon} size="xxs" className="text-[var(--primary)]" />
              <span>Transparent Processing & Non-Diagnostic Disclosure</span>
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
              {REPORTS_CONFIG.disclosureText}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
            className="text-xs font-bold"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleUploadSubmit}
            disabled={!selectedFile || uploadMutation.isPending}
            className="gap-2 text-xs font-bold bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-sm"
          >
            {uploadMutation.isPending ? (
              <>
                <Spinner className="h-3.5 w-3.5 text-white" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <AppIcon icon={Upload04Icon} size="xs" />
                <span>Upload Report</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
