
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Home from "../page";

/**
 * Explicit Home page route to satisfy Google Cloud Verification.
 * This route either renders the main landing page or redirects to root.
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // We keep the route active for the crawler, but redirect if needed
    // In this case, we just render the Home component directly
  }, []);

  return <Home />;
}
