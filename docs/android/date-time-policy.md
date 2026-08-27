# Date and Time Policy

Network instants use ISO-8601 UTC and Kotlin `Instant`; render in the device zone. Send measurement/history bounds with explicit offsets. Store canonical instants, not formatted strings. Consultation `appointment_date` and `appointment_time` are currently separate strings with no server timezone field: mark scheduling as HIGH risk and do not infer a universal instant. Date-only pregnancy/report concepts remain `LocalDate`. Tests must cover DST, device-zone changes and malformed/naive server timestamps.
