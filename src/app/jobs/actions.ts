
"use server";

/**
 * Server actions to fetch jobs from Jooble.
 */

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY || "11f7354d-81e2-4517-ba04-1399caa395ce";

export async function searchJoobleJobs(keywords: string = "", location: string = "") {
  try {
    const response = await fetch(`https://jooble.org/api/${JOOBLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        keywords: keywords || "", 
        location: location || "" // Open filtering as requested
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
      company: job.company || "Direct Employer",
      location: job.location || "Multiple Locations",
      description: job.snippet,
      url: job.link,
      type: 'jooble',
      salary: job.salary || "",
      updated: job.updated ? new Date(job.updated).getTime() : Date.now()
    }));
  } catch (error) {
    console.error("Jooble Search Error:", error);
    return [];
  }
}
