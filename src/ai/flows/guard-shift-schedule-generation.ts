'use server';

/**
 * @fileOverview Generates a monthly guard shift schedule based on shift types, guard availability, and constraints.
 *
 * - generateGuardShiftSchedule - A function that generates the guard shift schedule.
 * - GuardShiftScheduleInput - The input type for the generateGuardShiftSchedule function.
 * - GuardShiftScheduleOutput - The return type for the generateGuardShiftSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GuardShiftScheduleInputSchema = z.object({
  shiftType: z.enum(['12-hour', '8-hour']).describe('The type of shift (12-hour or 8-hour).'),
  guardAvailability: z
    .array(z.string())
    .describe('An array of available guard names for the schedule.'),
  startDate: z.string().describe('The start date for the schedule (YYYY-MM-DD).'),
  constraints: z
    .string()
    .optional()
    .describe('Any constraints for the schedule (e.g., specific days off for guards).'),
});
export type GuardShiftScheduleInput = z.infer<typeof GuardShiftScheduleInputSchema>;

const GuardShiftScheduleOutputSchema = z.object({
  schedule: z.record(z.string(), z.string()).describe('A monthly shift schedule.'),
});
export type GuardShiftScheduleOutput = z.infer<typeof GuardShiftScheduleOutputSchema>;

export async function generateGuardShiftSchedule(
  input: GuardShiftScheduleInput
): Promise<GuardShiftScheduleOutput> {
  return guardShiftScheduleFlow(input);
}

const guardShiftSchedulePrompt = ai.definePrompt({
  name: 'guardShiftSchedulePrompt',
  input: {schema: GuardShiftScheduleInputSchema},
  output: {schema: GuardShiftScheduleOutputSchema},
  prompt: `You are an expert in creating guard shift schedules.

  Based on the following information, generate a monthly guard shift schedule:

  Shift Type: {{{shiftType}}}
  Guard Availability: {{#each guardAvailability}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Start Date: {{{startDate}}}
  Constraints: {{{constraints}}}

  Ensure that the schedule covers the entire month, respects the shift type, and considers guard availability and any provided constraints.

  Return the schedule as a JSON object where keys are dates (YYYY-MM-DD) and values are the assigned guard's name.
  `,
});

const guardShiftScheduleFlow = ai.defineFlow(
  {
    name: 'guardShiftScheduleFlow',
    inputSchema: GuardShiftScheduleInputSchema,
    outputSchema: GuardShiftScheduleOutputSchema,
  },
  async input => {
    const {output} = await guardShiftSchedulePrompt(input);
    return output!;
  }
);
