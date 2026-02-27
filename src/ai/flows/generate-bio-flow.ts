"use server";
/**
 * @fileOverview Generates a professional bio for informal workers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBioInputSchema = z.object({
  trade: z.string().describe('The worker\'s primary trade or skill (e.g., Plumber).'),
  experienceYears: z.number().optional().describe('Years of experience.'),
  specialties: z.string().optional().describe('Specific types of work they excel at.'),
});

const GenerateBioOutputSchema = z.object({
  bio: z.string().describe('The generated professional bio.'),
});

export type GenerateBioInput = z.infer<typeof GenerateBioInputSchema>;
export type GenerateBioOutput = z.infer<typeof GenerateBioOutputSchema>;

export async function generateProfessionalBio(input: GenerateBioInput): Promise<GenerateBioOutput> {
  const prompt = ai.definePrompt({
    name: 'generateProfessionalBioPrompt',
    input: { schema: GenerateBioInputSchema },
    output: { schema: GenerateBioOutputSchema },
    prompt: `You are a professional profile writer for CareerGoMW, a platform for skilled informal workers.
    Generate a compelling, trustworthy professional bio for a worker with the following details:
    
    Trade: {{{trade}}}
    Experience: {{#if experienceYears}}{{{experienceYears}}} years{{else}}Several years of experience{{/if}}
    Specialties: {{{specialties}}}
    
    The bio should be concise (2-3 sentences), highlight reliability, and sound expert yet approachable.`,
  });

  const { output } = await prompt(input);
  return output!;
}
