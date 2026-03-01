"use server";
/**
 * @fileOverview AI agent to analyze job photos for verification.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeJobPhotoInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of the completed work, as a data URI."),
  description: z.string().describe("The worker's description of the job."),
});

const AnalyzeJobPhotoOutputSchema = z.object({
  isMatch: z.boolean().describe("Whether the photo matches the description."),
  analysis: z.string().describe("Brief reasoning for the match determination."),
  confidence: z.number().describe("Confidence score between 0 and 1."),
});

export type AnalyzeJobPhotoInput = z.infer<typeof AnalyzeJobPhotoInputSchema>;
export type AnalyzeJobPhotoOutput = z.infer<typeof AnalyzeJobPhotoOutputSchema>;

export async function analyzeJobPhoto(input: AnalyzeJobPhotoInput): Promise<AnalyzeJobPhotoOutput> {
  const prompt = ai.definePrompt({
    name: 'analyzeJobPhotoPrompt',
    input: { schema: AnalyzeJobPhotoInputSchema },
    output: { schema: AnalyzeJobPhotoOutputSchema },
    prompt: `You are an expert quality assurance agent for Globlync, a platform for skilled manual workers.
    Compare the provided photo to the following job description: "{{{description}}}".
    
    Tasks:
    1. Determine if the photo reasonably represents the work described.
    2. Check if the work looks professionally completed.
    3. Flag if the photo is likely a stock image or irrelevant.
    
    Photo: {{media url=photoDataUri}}
    
    Provide your determination in a supportive but objective tone.`,
  });

  const { output } = await prompt(input);
  return output!;
}
