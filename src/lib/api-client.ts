/**
 * Authenticated API client that:
 * 1. Attaches Firebase ID token to every request
 * 2. On 401, force-refreshes the token and retries once
 * 3. On second 401, signs the user out and redirects to /login
 */

import { getAuth } from "firebase/auth";

async function getFreshToken(forceRefresh = false): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getFreshToken();

  if (!token) {
    // No session — redirect to login
    window.location.replace("/login");
    return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  const res = await fetch(url, { ...options, headers });

  // If 401, token may have expired — force-refresh once and retry
  if (res.status === 401) {
    const freshToken = await getFreshToken(true);

    if (!freshToken) {
      // Refresh failed — force logout
      const auth = getAuth();
      await auth.signOut().catch(() => {});
      window.location.replace("/login");
      return res;
    }

    headers.set("Authorization", `Bearer ${freshToken}`);
    const retryRes = await fetch(url, { ...options, headers });

    // If still 401 after refresh, session is truly invalid
    if (retryRes.status === 401) {
      const auth = getAuth();
      await auth.signOut().catch(() => {});
      window.location.replace("/login");
    }

    return retryRes;
  }

  return res;
}

/** Convenience wrappers */
export async function apiGet(url: string): Promise<Response> {
  return apiRequest(url, { method: "GET" });
}

export async function apiPost(url: string, body: unknown): Promise<Response> {
  return apiRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiPut(url: string, body: unknown): Promise<Response> {
  return apiRequest(url, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiDelete(url: string): Promise<Response> {
  return apiRequest(url, { method: "DELETE" });
}
