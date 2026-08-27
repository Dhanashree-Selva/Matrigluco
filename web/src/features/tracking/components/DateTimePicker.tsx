import { useState, useMemo } from "react";
import {
  Calendar03Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  Time02Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "../../../components/common/AppIcon";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
  Button,
  ToggleGroup,
  ToggleGroupItem,
} from "../../../shared/ui";

interface DateTimePickerProps {
  value: string; // ISO or datetime-local string (YYYY-MM-DDTHH:MM)
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  className = "",
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"date" | "time">("date");

  // Parse current date & time values
  const dateObj = useMemo(() => {
    const d = new Date(value);
    return !isNaN(d.getTime()) ? d : new Date();
  }, [value]);

  const [selectedDate, setSelectedDate] = useState<Date>(dateObj);

  // 12-hour format state
  const rawHours = dateObj.getHours();
  const rawMinutes = dateObj.getMinutes();

  const currentPeriod = rawHours >= 12 ? "PM" : "AM";
  const current12Hour = rawHours % 12 === 0 ? 12 : rawHours % 12;

  const [hour, setHour] = useState<number>(current12Hour);
  const [minute, setMinute] = useState<number>(rawMinutes);
  const [period, setPeriod] = useState<"AM" | "PM">(currentPeriod);

  // Helper to commit date and time back as YYYY-MM-DDTHH:MM
  const commitChange = (
    newDate: Date,
    newHour: number,
    newMinute: number,
    newPeriod: "AM" | "PM"
  ) => {
    let computed24Hour = newHour % 12;
    if (newPeriod === "PM") computed24Hour += 12;

    const y = newDate.getFullYear();
    const m = String(newDate.getMonth() + 1).padStart(2, "0");
    const d = String(newDate.getDate()).padStart(2, "0");
    const hh = String(computed24Hour).padStart(2, "0");
    const mm = String(newMinute).padStart(2, "0");

    const localIso = `${y}-${m}-${d}T${hh}:${mm}`;
    onChange(localIso);
  };

  const handleDateSelect = (date?: Date) => {
    if (!date) return;
    setSelectedDate(date);
    commitChange(date, hour, minute, period);
    // Smoothly transition to time tab upon picking date for faster UX
    setActiveTab("time");
  };

  const handleHourChange = (newHour: number) => {
    const clamped = Math.max(1, Math.min(12, newHour));
    setHour(clamped);
    commitChange(selectedDate, clamped, minute, period);
  };

  const handleMinuteChange = (newMinute: number) => {
    const clamped = Math.max(0, Math.min(59, newMinute));
    setMinute(clamped);
    commitChange(selectedDate, hour, clamped, period);
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    commitChange(selectedDate, hour, minute, newPeriod);
  };

  const handleSetNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const p = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;

    setSelectedDate(now);
    setHour(h12);
    setMinute(m);
    setPeriod(p);
    commitChange(now, h12, m, p);
  };

  // Formatted trigger labels
  const formattedDateStr = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTimeStr = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className={`space-y-1 ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-1.5 w-full">
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Select measurement date and time"
              disabled={disabled}
              className={`flex-1 flex items-center justify-between px-3 py-2 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs transition-all select-none ${
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-[var(--primary)]/50 hover:bg-[var(--surface-soft)]/40 cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              }`}
            >
              {/* Left: Icon + Formatted DateTime */}
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[var(--accent-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 border border-[var(--primary)]/20">
                  <AppIcon icon={Calendar03Icon} size="xs" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--foreground)]">
                    {formattedDateStr}
                  </span>
                  <span className="text-[var(--border)]">·</span>
                  <span className="font-mono font-semibold text-[var(--primary)]">
                    {formattedTimeStr}
                  </span>
                </div>
              </div>
            </button>
          </PopoverTrigger>

          {/* Quick "Now" action button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSetNow}
            disabled={disabled}
            className="h-9 px-2.5 text-xs font-bold border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--accent-soft)] shrink-0"
          >
            <AppIcon icon={Time02Icon} size="xs" className="mr-1" />
            <span>Now</span>
          </Button>
        </div>

        <PopoverContent
          position="popper"
          sideOffset={6}
          align="start"
          collisionPadding={16}
          className="w-[calc(100vw-2rem)] sm:w-[320px] p-3 bg-[var(--card)] border border-[var(--border)] shadow-2xl rounded-md overflow-hidden space-y-3"
        >
          {/* Segmented Tab Switcher (Date / Time) */}
          <div className="grid grid-cols-2 w-full h-8 p-0.5 bg-[var(--surface-soft)] rounded-md border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setActiveTab("date")}
              className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-sm transition-all ${
                activeTab === "date"
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-2xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <AppIcon icon={Calendar03Icon} size="xs" />
              <span>Date</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("time")}
              className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold rounded-sm transition-all ${
                activeTab === "time"
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-2xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <AppIcon icon={Clock01Icon} size="xs" />
              <span>Time</span>
            </button>
          </div>

          {/* 1. Date Tab Content */}
          {activeTab === "date" && (
            <div className="flex items-center justify-center p-0 animate-in fade-in-50 duration-100">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date > new Date()}
                initialFocus
                className="p-0"
              />
            </div>
          )}

          {/* 2. Time Tab Content */}
          {activeTab === "time" && (
            <div className="space-y-3 animate-in fade-in-50 duration-100">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
                <span>Time Settings</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleSetNow}
                  className="h-5 px-1.5 text-[10px] text-[var(--primary)] font-bold hover:bg-[var(--accent-soft)]"
                >
                  Current Time
                </Button>
              </div>

              {/* Digital Time Controls (Hour : Minute + AM/PM) */}
              <div className="p-3 rounded-md bg-[var(--surface-soft)]/50 border border-[var(--border)]">
                <div className="flex items-center justify-center gap-2">
                  {/* Hours */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] mb-0.5">
                      Hour
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={hour}
                      onChange={(e) => handleHourChange(Number(e.target.value))}
                      className="w-12 h-9 text-center font-mono font-black text-sm bg-[var(--card)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>

                  <span className="font-mono text-lg font-bold text-[var(--muted-foreground)] pt-3">
                    :
                  </span>

                  {/* Minutes */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] uppercase font-bold text-[var(--muted-foreground)] mb-0.5">
                      Min
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={String(minute).padStart(2, "0")}
                      onChange={(e) => handleMinuteChange(Number(e.target.value))}
                      className="w-12 h-9 text-center font-mono font-black text-sm bg-[var(--card)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>

                  {/* AM / PM Toggle */}
                  <div className="flex flex-col items-center pl-1 pt-3">
                    <ToggleGroup
                      type="single"
                      value={period}
                      onValueChange={(val) => {
                        if (val) handlePeriodChange(val as "AM" | "PM");
                      }}
                      size="sm"
                      className="border border-[var(--border)] rounded-md p-0.5 bg-[var(--card)] gap-0.5"
                    >
                      <ToggleGroupItem
                        value="AM"
                        className="text-[10px] h-7 px-2 font-bold data-[state=on]:bg-[var(--primary)] data-[state=on]:text-white"
                      >
                        AM
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="PM"
                        className="text-[10px] h-7 px-2 font-bold data-[state=on]:bg-[var(--primary)] data-[state=on]:text-white"
                      >
                        PM
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
              </div>

              {/* Routine Presets Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider block">
                  Quick Presets
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setHour(8);
                      setMinute(0);
                      setPeriod("AM");
                      commitChange(selectedDate, 8, 0, "AM");
                    }}
                    className="p-1.5 rounded-sm bg-[var(--card)] hover:bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[10px] text-left transition-colors"
                  >
                    <span className="block font-bold text-[var(--foreground)]">Morning</span>
                    <span className="font-mono text-[9px] text-[var(--muted-foreground)]">8:00 AM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHour(12);
                      setMinute(30);
                      setPeriod("PM");
                      commitChange(selectedDate, 12, 30, "PM");
                    }}
                    className="p-1.5 rounded-sm bg-[var(--card)] hover:bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[10px] text-left transition-colors"
                  >
                    <span className="block font-bold text-[var(--foreground)]">Midday</span>
                    <span className="font-mono text-[9px] text-[var(--muted-foreground)]">12:30 PM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHour(6);
                      setMinute(0);
                      setPeriod("PM");
                      commitChange(selectedDate, 6, 0, "PM");
                    }}
                    className="p-1.5 rounded-sm bg-[var(--card)] hover:bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[10px] text-left transition-colors"
                  >
                    <span className="block font-bold text-[var(--foreground)]">Evening</span>
                    <span className="font-mono text-[9px] text-[var(--muted-foreground)]">6:00 PM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHour(9);
                      setMinute(30);
                      setPeriod("PM");
                      commitChange(selectedDate, 9, 30, "PM");
                    }}
                    className="p-1.5 rounded-sm bg-[var(--card)] hover:bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-[10px] text-left transition-colors"
                  >
                    <span className="block font-bold text-[var(--foreground)]">Night</span>
                    <span className="font-mono text-[9px] text-[var(--muted-foreground)]">9:30 PM</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Done Bar */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <div className="text-[10px] font-mono text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">{formattedDateStr}</span> · {formattedTimeStr}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-7 px-3 text-xs font-bold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] gap-1"
            >
              <AppIcon icon={CheckmarkCircle01Icon} size="xs" />
              <span>Done</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
