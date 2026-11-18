import { describe, expect, it } from "vitest";
import { z } from "zod";
import { assignSchema, createJobSchema, updateStatusSchema } from "./schemas";

const CUSTOMER = "c0000000-0000-4000-8000-000000000001";
const TECHNICIAN = "a0000000-0000-4000-8000-000000000002";

const valid = {
  customerId: CUSTOMER,
  title: "Fix leaking faucet",
  description: "",
  price: "180.50",
  scheduledAt: "",
  technicianId: "",
};

describe("createJobSchema", () => {
  it("accepts a complete form and turns empty optionals into undefined", () => {
    const result = createJobSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.price).toBe(180.5);
    expect(result.data.description).toBeUndefined();
    expect(result.data.scheduledAt).toBeUndefined();
    expect(result.data.technicianId).toBeUndefined();
  });

  it("accepts a technician and a schedule", () => {
    const result = createJobSchema.safeParse({
      ...valid,
      technicianId: TECHNICIAN,
      scheduledAt: "2026-11-20T09:00",
    });
    expect(result.success).toBe(true);
  });

  it("reports one message per invalid field", () => {
    const result = createJobSchema.safeParse({
      customerId: "",
      title: "ab",
      price: "",
      description: "",
      scheduledAt: "tomorrow",
      technicianId: "",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = z.flattenError(result.error).fieldErrors;
    expect(errors.customerId).toBeDefined();
    expect(errors.title).toBeDefined();
    expect(errors.price).toBeDefined();
    expect(errors.scheduledAt).toBeDefined();
  });

  it("rejects negative, non numeric and huge prices", () => {
    for (const price of ["-1", "abc", "2000000"]) {
      expect(createJobSchema.safeParse({ ...valid, price }).success).toBe(
        false,
      );
    }
  });

  it("rejects a title that is too long", () => {
    const result = createJobSchema.safeParse({
      ...valid,
      title: "x".repeat(121),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateStatusSchema", () => {
  it("accepts a known status and rejects an unknown one", () => {
    expect(
      updateStatusSchema.safeParse({ jobId: CUSTOMER, status: "done" }).success,
    ).toBe(true);
    expect(
      updateStatusSchema.safeParse({ jobId: CUSTOMER, status: "deleted" })
        .success,
    ).toBe(false);
  });
});

describe("assignSchema", () => {
  it("treats an empty technician as 'unassign'", () => {
    const result = assignSchema.safeParse({ jobId: CUSTOMER, technicianId: "" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.technicianId).toBeUndefined();
  });

  it("rejects a technician that is not an id", () => {
    expect(
      assignSchema.safeParse({ jobId: CUSTOMER, technicianId: "tech" }).success,
    ).toBe(false);
  });
});
