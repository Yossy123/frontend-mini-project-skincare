/**
 * Shape of a failed Laravel JSON response.
 */
export interface ErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Prefer the field-level validation messages over Laravel's generic
 * "The given data was invalid." summary.
 */
export function describeFailure(body: ErrorBody | null | undefined, fallback: string): string {
  if (body?.errors) {
    const messages = Object.values(body.errors).flat().join(' ');
    if (messages) return messages;
  }

  return body?.message || fallback;
}
