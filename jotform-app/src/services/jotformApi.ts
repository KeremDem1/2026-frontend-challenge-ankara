import type {
  JotformForm,
  JotformResponse,
  JotformSubmission,
} from '../types/jotform';

const BASE_URL = 'https://api.jotform.com';
const API_KEY = import.meta.env.VITE_JOTFORM_API_KEY as string | undefined;

async function request<T>(path: string): Promise<T> {
  if (!API_KEY) {
    throw new Error(
      'VITE_JOTFORM_API_KEY is not set. Create a `.env` file based on `.env.example`.',
    );
  }

  const separator = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE_URL}${path}${separator}apiKey=${API_KEY}`);

  if (!res.ok) {
    throw new Error(`Jotform HTTP ${res.status}: ${res.statusText}`);
  }

  const json = (await res.json()) as JotformResponse<T>;
  if (json.responseCode !== 200) {
    throw new Error(json.message ?? `Jotform error (code ${json.responseCode})`);
  }

  return json.content;
}

export function getForm(formId: string): Promise<JotformForm> {
  return request<JotformForm>(`/form/${formId}`);
}

export function getSubmissions(
  formId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<JotformSubmission[]> {
  const params = new URLSearchParams();
  if (options.limit !== undefined) params.set('limit', String(options.limit));
  if (options.offset !== undefined) params.set('offset', String(options.offset));
  const qs = params.toString();
  const path = qs
    ? `/form/${formId}/submissions?${qs}`
    : `/form/${formId}/submissions`;
  return request<JotformSubmission[]>(path);
}
