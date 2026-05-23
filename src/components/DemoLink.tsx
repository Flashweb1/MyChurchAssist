import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Renders a "Try a Live Demo" link on the sign‑in / sign‑up pages.
 * The link is shown only once per browser session using localStorage.
 */
export default function DemoLink() {
  const [showLink, setShowLink] = useState(false);

  useEffect(() => {
    // Guard for environments where localStorage is unavailable (SSR)
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem("demoSeen");
    setShowLink(!seen);
  }, []);

  if (!showLink) return null;

  return (
    <Link
      href="/auth/demo"
      onClick={() => typeof window !== "undefined" && window.localStorage.setItem("demoSeen", "true")}
      className="text-sm text-[var(--brand-blue)] hover:underline block mt-4 text-center"
    >
      Try a Live Demo
    </Link>
  );
}
