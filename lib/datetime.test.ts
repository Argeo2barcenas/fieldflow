import { describe, expect, it } from "vitest";
import { zonedLocalToUtc } from "./datetime";

describe("zonedLocalToUtc (America/Chicago)", () => {
  it("applies the winter offset (CST, UTC-6)", () => {
    expect(zonedLocalToUtc("2026-11-20T09:00")?.toISOString()).toBe(
      "2026-11-20T15:00:00.000Z",
    );
  });

  it("applies the summer offset (CDT, UTC-5)", () => {
    expect(zonedLocalToUtc("2026-07-01T09:00")?.toISOString()).toBe(
      "2026-07-01T14:00:00.000Z",
    );
  });

  it("handles the day daylight saving time ends (2026-11-01)", () => {
    // 00:30 is still CDT (UTC-5); 03:00 is already CST (UTC-6).
    expect(zonedLocalToUtc("2026-11-01T00:30")?.toISOString()).toBe(
      "2026-11-01T05:30:00.000Z",
    );
    expect(zonedLocalToUtc("2026-11-01T03:00")?.toISOString()).toBe(
      "2026-11-01T09:00:00.000Z",
    );
  });

  it("converts other zones too", () => {
    expect(
      zonedLocalToUtc("2026-11-20T09:00", "America/Tijuana")?.toISOString(),
    ).toBe("2026-11-20T17:00:00.000Z");
  });

  it("rejects text that is not a datetime-local value", () => {
    expect(zonedLocalToUtc("tomorrow")).toBeNull();
    expect(zonedLocalToUtc("2026-11-20")).toBeNull();
    expect(zonedLocalToUtc("")).toBeNull();
  });
});
