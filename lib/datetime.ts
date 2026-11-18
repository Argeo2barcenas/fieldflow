// Dates are stored in UTC and always shown in one business time zone, so every
// user sees the same schedule no matter where their browser or server runs.
export const APP_TIME_ZONE = "America/Chicago";

// Offset (in minutes) between UTC and `timeZone` at the given instant.
function offsetMinutes(timeZone: string, instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  const wallClockAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  const instantWithoutMs = Math.floor(instant.getTime() / 1000) * 1000;
  return (wallClockAsUtc - instantWithoutMs) / 60_000;
}

// Converts a wall-clock value from <input type="datetime-local"> (for example
// "2026-11-20T09:00"), meant in `timeZone`, to the real UTC instant.
export function zonedLocalToUtc(
  local: string,
  timeZone: string = APP_TIME_ZONE,
): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!match) return null;

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute);

  // Two passes: the offset can differ right at a daylight-saving change.
  const firstGuess = asIfUtc - offsetMinutes(timeZone, new Date(asIfUtc)) * 60_000;
  const secondGuess =
    asIfUtc - offsetMinutes(timeZone, new Date(firstGuess)) * 60_000;

  const result = new Date(secondGuess);
  return Number.isNaN(result.getTime()) ? null : result;
}
