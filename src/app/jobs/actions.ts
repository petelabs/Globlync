
"use server";

/**
 * Server action to fetch jobs from Arbeitnow API.
 * This avoids CORS issues and keeps the API logic on the server.
 */
export async function getArbeitnowJobs() {
  try {
    const response = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch jobs from Arbeitnow");
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching Arbeitnow jobs:", error);
    return [];
  }
}
