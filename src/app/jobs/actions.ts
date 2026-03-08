"use server";

/**
 * Server actions to fetch jobs from multiple sources.
 * This keeps API keys secure and avoids CORS issues.
 */

const JOOBLE_API_KEY = "11f7354d-81e2-4517-ba04-1399caa395ce";

export async function getArbeitnowJobs() {
  try {
    const response = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch jobs from Arbeitnow");
    }
    
    const data = await response.json();
    // Normalize Arbeitnow data
    return (data.data || []).map((job: any) => ({
      id: job.slug || Math.random().toString(),
      title: job.title,
      company: job.company_name,
      location: job.location,
      description: job.description,
      url: job.url,
      type: 'arbeitnow',
      remote: job.remote,
      createdAt: job.created_at ? job.created_at * 1000 : Date.now()
    }));
  } catch (error) {
    console.error("Error fetching Arbeitnow jobs:", error);
    return [];
  }
}

export async function searchJoobleJobs(keywords: string = "remote", location: string = "") {
  try {
    const response = await fetch(`https://jooble.org/api/${JOOBLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        keywords: keywords || "remote", 
        location: location 
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
      company: job.company || "Global Company",
      location: job.location || "Remote / Global",
      description: job.snippet,
      url: job.link,
      type: 'jooble',
      remote: true, // Jooble snippets usually contain remote context or we assume global
      createdAt: job.updated ? new Date(job.updated).getTime() : Date.now()
    }));
  } catch (error) {
    console.error("Jooble Search Error:", error);
    return [];
  }
}
