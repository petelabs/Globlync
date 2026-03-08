"use server";
/**
 * @fileOverview AI agent to analyze job photos for verification.
 * 
 * - analyzeJobPhoto - Main function to verify evidence.
 * - AnalyzeJobPhotoInput - Schema for photo and description.
 * - AnalyzeJobPhotoOutput - Result with specific improvement tips if match fails.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeJobPhotoInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of the completed work, as a data URI."),
  description: z.string().describe("The worker's description of the job."),
});

const AnalyzeJobPhotoOutputSchema = z.object({
  isMatch: z.boolean().describe("Whether the photo reasonably matches the description."),
  analysis: z.string().describe("Detailed reasoning. If isMatch is false, provide specific steps to improve evidence."),
  confidence: z.number().describe("Confidence score between 0 and 1."),
});

export type AnalyzeJobPhotoInput = z.infer<typeof AnalyzeJobPhotoInputSchema>;
export type AnalyzeJobPhotoOutput = z.infer<typeof AnalyzeJobPhotoOutputSchema>;

const analyzeJobPhotoPrompt = ai.definePrompt({
  name: 'analyzeJobPhotoPrompt',
  input: { schema: AnalyzeJobPhotoInputSchema },
  output: { schema: AnalyzeJobPhotoOutputSchema },
  prompt: `You are an expert quality assurance agent for Globlync, a platform for skilled manual workers and remote professionals.
  Compare the provided photo to the following job description: "{{{description}}}".
  
  Tasks:
  1. Determine if the photo reasonably represents the work described.
  2. Check if the work looks professionally completed.
  3. Flag if the photo is likely a stock image or irrelevant.
  
  CRITICAL INSTRUCTION:
  - If the photo is NOT a match (isMatch: false), your analysis MUST tell the user exactly what is wrong and how to improve (e.g., "The image is too dark to see the wiring," "Please provide a photo showing the finished surface instead of just the tools," or "The description mentions a garden but the photo shows a room.").
  - If the photo IS a match (isMatch: true), provide a brief professional confirmation of the quality.
  
  Photo: {{media url=photoDataUri}}
  
  Provide your determination in a supportive but objective tone.`,
});

export async function analyzeJobPhoto(input: AnalyzeJobPhotoInput): Promise<AnalyzeJobPhotoOutput> {
  const { output } = await analyzeJobPhotoPrompt(input);
  if (!output) throw new Error("AI failed to generate a response.");
  return output;
}
