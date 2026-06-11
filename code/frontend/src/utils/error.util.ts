export interface ApiErrorDetail {
  field: string;
  message: string;
}

/**
 * Parses the API error response and extracts inline field errors.
 * Returns { globalError, fieldErrors }
 */
export function handleApiError(err: any, defaultMessage: string = 'Có lỗi xảy ra'): { globalError: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  let globalError = err.response?.data?.message || defaultMessage;

  if (err.response?.data?.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
    err.response.data.errors.forEach((e: ApiErrorDetail) => {
      // Remove generic Zod prefixes like body., query., params.
      const rawField = e.field.replace(/^(body\.|query\.|params\.)/, '');
      fieldErrors[rawField] = e.message;
    });

    // We keep the global error as well, so it can be displayed at the top if needed.
    // Or we could suppress it if there are specific field errors, but it's up to the UI.
  }

  return { globalError, fieldErrors };
}
