import React from "react";
import { PrivacyDisclosure } from "./PrivacyDisclosure";
import { AppIcon } from "../../../../components/common/AppIcon";
import {
  UserCircleIcon,
  Activity01Icon,
  File01Icon,
  Message01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";

export function PrivacyMap() {
  const DATA_DOMAINS = [
    {
      title: "Profile & Identity",
      description: "Name, email, phone, and designated emergency contact.",
      scope: "Stored in account record",
      icon: UserCircleIcon,
    },
    {
      title: "Maternal Health Context",
      description: "Gestational week, expected due date, and prior pregnancies.",
      scope: "Used for tracking & clinical context",
      icon: Activity01Icon,
    },
    {
      title: "Clinical Lab Reports",
      description: "Uploaded glucose curves, OGTT charts, and laboratory PDFs.",
      scope: "Private authenticated files",
      icon: File01Icon,
    },
    {
      title: "Assistant Conversations",
      description: "Chat history with Maternal Assistant governed by consent.",
      scope: "Zero third-party training",
      icon: Message01Icon,
    },
    {
      title: "Doctor Consultations",
      description: "Booked appointments, care room discussions, and prescriptions.",
      scope: "Encrypted clinical records",
      icon: Calendar03Icon,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-[var(--foreground)]">Your MatriGluco Data Map</h3>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Clear overview of what information is collected, how it is scoped, and how your privacy is protected.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {DATA_DOMAINS.map((domain) => (
          <div
            key={domain.title}
            className="p-3.5 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex flex-col justify-between gap-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center">
                  <AppIcon icon={domain.icon} size="xxs" />
                </span>
                <h4 className="text-xs font-bold text-[var(--foreground)]">{domain.title}</h4>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                {domain.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] block">
                {domain.scope}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <PrivacyDisclosure />
      </div>
    </div>
  );
}
