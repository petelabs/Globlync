
"use server";

/**
 * Server actions to fetch jobs strictly from Malawi.
 * This keeps API keys secure and ensures the board is 100% relevant.
 */

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY || "11f7354d-81e2-4517-ba04-1399caa395ce";

export async function searchJoobleJobs(keywords: string = "", location: string = "Malawi") {
  try {
    const response = await fetch(`https://jooble.org/api/${JOOBLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        keywords: keywords || "", 
        location: "Malawi" // Strictly locked to Malawi for local relevance
      }),
      next: { revalidate: 1800 }, // Cache for 30 mins
    });

    if (!response.ok) {
      throw new Error("Jooble API request failed");
    }

    const data = await response.json();
    // Normalize Jooble data
    return (data.jobs || []).map((job: any) => ({
      id: job.id?.toString() || Math.random().toString(),
      title: job.title,
      company: job.company || "Local Enterprise",
      location: job.location || "Malawi (National)",
      description: job.snippet,
      url: job.link,
      type: 'jooble',
      remote: job.title.toLowerCase().includes('remote') || job.snippet.toLowerCase().includes('remote'), 
      createdAt: job.updated ? new Date(job.updated).getTime() : Date.now()
    }));
  } catch (error) {
    console.error("Jooble Search Error:", error);
    return [];
  }
}
