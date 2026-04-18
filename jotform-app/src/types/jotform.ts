export interface JotformResponse<T> {
  responseCode: number;
  message?: string;
  content: T;
  duration?: string;
  'limit-left'?: number;
  resultSet?: JotformResultSet;
}

export interface JotformResultSet {
  offset: number;
  limit: number;
  orderby?: string;
  count: number;
}

export interface JotformForm {
  id: string;
  username: string;
  title: string;
  height: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_submission?: string;
  new: string;
  count: string;
  type: string;
  favorite: string;
  archived: string;
  url: string;
}

export interface JotformAnswer {
  name: string;
  order: string;
  text: string;
  type: string;
  answer?: string;
}

export interface JotformSubmission {
  id: string;
  form_id: string;
  ip: string;
  created_at: string;
  updated_at: string | null;
  status: string;
  new: string;
  flag: string;
  notes: string;
  answers: Record<string, JotformAnswer>;
}
