import { describe, expect, it } from "vitest";
import {
  JOB_STATUSES,
  availableTransitions,
  canTransition,
  statusAfterAssignment,
  transitionLabel,
} from "./status";

describe("canTransition", () => {
  it("lets a technician start and finish a job", () => {
    expect(canTransition("technician", "assigned", "in_progress")).toBe(true);
    expect(canTransition("technician", "in_progress", "done")).toBe(true);
  });

  it("does not let a technician skip a step or go backwards", () => {
    expect(canTransition("technician", "assigned", "done")).toBe(false);
    expect(canTransition("technician", "in_progress", "assigned")).toBe(false);
    expect(canTransition("technician", "done", "in_progress")).toBe(false);
  });

  it("lets the office pause or reopen a job", () => {
    expect(canTransition("office", "in_progress", "assigned")).toBe(true);
    expect(canTransition("office", "done", "in_progress")).toBe(true);
  });

  it("never leaves 'new' by hand, for any role", () => {
    for (const role of ["office", "technician"] as const) {
      expect(availableTransitions(role, "new")).toEqual([]);
    }
  });

  it("never allows staying in the same status", () => {
    for (const role of ["office", "technician"] as const) {
      for (const status of JOB_STATUSES) {
        expect(canTransition(role, status, status)).toBe(false);
      }
    }
  });
});

describe("statusAfterAssignment", () => {
  it("moves a new job to assigned when a technician is chosen", () => {
    expect(statusAfterAssignment("new", "tech-1")).toEqual({
      ok: true,
      status: "assigned",
    });
  });

  it("sends an assigned job back to new when the technician is removed", () => {
    expect(statusAfterAssignment("assigned", null)).toEqual({
      ok: true,
      status: "new",
    });
  });

  it("keeps an assigned job assigned when it is reassigned", () => {
    expect(statusAfterAssignment("assigned", "tech-2")).toEqual({
      ok: true,
      status: "assigned",
    });
  });

  it("refuses to reassign work that already started or finished", () => {
    for (const status of ["in_progress", "done"] as const) {
      expect(statusAfterAssignment(status, "tech-1").ok).toBe(false);
      expect(statusAfterAssignment(status, null).ok).toBe(false);
    }
  });
});

describe("transitionLabel", () => {
  it("uses clear action names", () => {
    expect(transitionLabel("assigned", "in_progress")).toBe("Start job");
    expect(transitionLabel("in_progress", "done")).toBe("Mark as done");
    expect(transitionLabel("done", "in_progress")).toBe("Reopen");
  });
});
