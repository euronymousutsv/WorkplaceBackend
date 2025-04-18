import { z } from "zod";

// Enum constraints
const shiftStatusEnum = z.enum([
  "pending",
  "assigned",
  "active",
  "completed",
  "cancelled",
]);
const repeatFrequencyEnum = z.enum(["none", "weekly", "fortnightly"]);

export const insertShiftSchema = z.object({
  employeeId: z.string().uuid(),
  locationId: z.string().uuid(),
  startTime: z.union([z.string(), z.date()]),
  endTime: z.union([z.string(), z.date()]),
  status: shiftStatusEnum.optional(),
  notes: z.string().optional().nullable(),
  repeatFrequency: repeatFrequencyEnum.optional(),
  parentShiftId: z.string().uuid().optional().nullable(),
  repeatEndDate: z.union([z.string(), z.date()]).optional().nullable(),
});

export const updateShiftSchema = insertShiftSchema.partial();
