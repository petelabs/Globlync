"use server";
/**
 * @fileOverview Generates a personalized daily professional tip for workers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailyTipInputSchema = z.object({
  trade: z.string().describe('The worker\'s trade.'),
});

const DailyTipOutputSchema = z.object({
  tipTitle: z.string().describe('Short catchy title for the tip.'),
  tipContent: z.string().describe('The actual professional advice (1-2 sentences).'),
});

export type DailyTipInput = z.infer<typeof DailyTipInputSchema>;
export type DailyTipOutput = z.infer<typeof DailyTipOutputSchema>;

export async function generateDailyTip(input: DailyTipInput): Promise<DailyTipOutput> {
  const prompt = ai.definePrompt({
    name: 'generateDailyTipPrompt',
    input: { schema: DailyTipInputSchema },
    output: { schema: DailyTipOutputSchema },
    prompt: `You are a professional mentor for manual workers in Malawi.
    Provide one highly practical, professional, or safety-related daily tip for a worker in the trade: {{{trade}}}.
    
    The tip should be:
    1. Relevant to the Malawian context (e.g., mention local tools, climate, or business practices).
    2. Encouraging and expert.
    3. Concise.`,
  });

  const { output } = await prompt(input);
  return output!;
}
