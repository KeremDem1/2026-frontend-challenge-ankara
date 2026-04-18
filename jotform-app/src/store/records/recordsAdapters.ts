import type { FormLabel } from '../../constants/formIds';
import type { JotformAnswer, JotformSubmission } from '../../types/jotform';
import type { InvestigationRecord, RecordSource } from '../../types/record';
import {
  indexAnswersByName,
  parseCoordinates,
  parseJotformTimestamp,
} from '../../utils/parsers';

const PERSON_KEYS = ['personName', 'name', 'from', 'author', 'reporter'];
const WITH_KEYS = ['seenWith', 'with', 'to', 'recipient'];
const TEXT_KEYS = ['note', 'message', 'tip', 'comment', 'content', 'text'];
const LOCATION_KEYS = ['location', 'place', 'where'];
const COORDS_KEYS = ['coordinates', 'coords', 'geo'];
const TIME_KEYS = ['timestamp', 'time', 'when', 'date'];

function pickAnswer(
  index: Record<string, JotformAnswer>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = index[key]?.answer;
    if (value) return value;
  }
  return undefined;
}

function dedupe(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))];
}

function buildRecord(
  source: RecordSource,
  submission: JotformSubmission,
): InvestigationRecord {
  const answers = indexAnswersByName(submission.answers);

  const personName = pickAnswer(answers, PERSON_KEYS);
  const seenWith = pickAnswer(answers, WITH_KEYS);
  const timestamp = pickAnswer(answers, TIME_KEYS);

  return {
    id: submission.id,
    source,
    formId: submission.form_id,
    createdAt: submission.created_at,

    personName,
    seenWith,
    participants: dedupe([personName, seenWith]),

    location: pickAnswer(answers, LOCATION_KEYS),
    coordinates: parseCoordinates(pickAnswer(answers, COORDS_KEYS)),

    timestamp,
    timestampMs: parseJotformTimestamp(timestamp),

    text: pickAnswer(answers, TEXT_KEYS),

    rawAnswers: submission.answers,
  };
}

const adapters: Record<
  FormLabel,
  (submission: JotformSubmission) => InvestigationRecord
> = {
  Checkins: (s) => buildRecord('Checkins', s),
  Messages: (s) => buildRecord('Messages', s),
  Sightings: (s) => buildRecord('Sightings', s),
  PersonalNotes: (s) => buildRecord('PersonalNotes', s),
  AnonymousTips: (s) => buildRecord('AnonymousTips', s),
};

export function adaptSubmission(
  label: FormLabel,
  submission: JotformSubmission,
): InvestigationRecord {
  return adapters[label](submission);
}
