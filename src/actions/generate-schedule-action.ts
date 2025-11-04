"use server";

import { generateGuardShiftSchedule, GuardShiftScheduleInput, GuardShiftScheduleOutput } from "@/ai/flows/guard-shift-schedule-generation";

export async function generateGuardShiftScheduleAction(
  input: GuardShiftScheduleInput
): Promise<{ data?: GuardShiftScheduleOutput; error?: string }> {
  try {
    const output = await generateGuardShiftSchedule(input);
    return { data: output };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { error: `Failed to generate schedule: ${errorMessage}` };
  }
}
