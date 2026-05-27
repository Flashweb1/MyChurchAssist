export type AsyncResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<AsyncResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : errorMessage || "An unexpected error occurred";
    return { success: false, error: message };
  }
}