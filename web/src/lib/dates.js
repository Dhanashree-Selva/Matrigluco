/**
 * Universal UTC-aware date parser.
 * If given a date string in ISO format without timezone designator (e.g. "2026-08-18T06:52:00"),
 * it normalizes it to UTC by appending "Z" so that JavaScript's Date methods (like toLocaleTimeString
 * and Intl.DateTimeFormat) accurately format it in the user's current local timezone.
 */
export function parseDate(dateInput) {
    if (!dateInput) return null;
    if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? null : dateInput;
    }
    let str = String(dateInput).trim();
    if (!str) return null;

    // Check if ISO format string without timezone offset or Z
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(str)) {
        str += "Z";
    }
    const date = new Date(str);
    return isNaN(date.getTime()) ? null : date;
}

export function formatDate(dateString, options = {}) {
    if (!dateString) return "—";
    const date = parseDate(dateString);
    if (!date) return "—";
    try {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            ...options,
        }).format(date);
    } catch {
        return "—";
    }
}

export function formatTime(dateString, options = {}) {
    if (!dateString) return "—";
    const date = parseDate(dateString);
    if (!date) return "—";
    try {
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            ...options,
        }).format(date);
    } catch {
        return "—";
    }
}

export function formatDateTime(dateString) {
    if (!dateString) return "—";
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function calculatePregnancyWeek(dueDateStr) {
    if (!dueDateStr) return "—";
    const due = parseDate(dueDateStr);
    if (!due) return "—";
    try {
        const today = new Date();
        const diffDays = Math.max(0, Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        const week = 40 - Math.floor(diffDays / 7);
        return Math.max(1, Math.min(40, week));
    } catch {
        return "—";
    }
}
