
"use server";
/**
 * @fileOverview Generates a personalized daily professional tip for global workers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DailyTipInputSchema = z.object({
  trade: z.string().describe('The focus area or audience for the tip.'),
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
    prompt: `You are a professional mentor for global freelancers and remote workers.
    Provide one highly practical, high-value professional tip or career hack for someone in: {{{trade}}}.
    
    The tip should be:
    1. Relevant to the Global Remote Economy (scaling, productivity, or trust-building).
    2. Mentions Malawian context where appropriate but remains globally relevant.
    3. High-energy, professional, and encouraging.
    4. Concise (maximum 2 sentences).`,
  });

  const { output } = await prompt(input);
  return output!;
}
