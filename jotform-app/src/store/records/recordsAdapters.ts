import type { FormLabel } from '../../constants/formIds';
import type { JotformAnswer, JotformSubmission } from '../../types/jotform';
import type { InvestigationRecord, RecordSource } from '../../types/record';
import {
  indexAnswersByName,
  parseCoordinates,
  parseJotformTimestamp,
} from '../../utils/parsers';

const PERSON_KEYS = [
  'personName',
  'name',
  'from',
  'sender',
  'senderName',
  'author',
  'writer',
  'authorName',
  'reporter',
  'observer',
  'about',
  'subject',
  'target',
  'suspect',
  'suspectName',
  'tipAbout',
];
const WITH_KEYS = [
  'seenWith',
  'with',
  'to',
  'recipient',
  'recipientName',
];
const TEXT_KEYS = [
  'note',
  'message',
  'tip',
  'comment',
  'content',
  'text',
  'body',
  'description',
];
const LOCATION_KEYS = ['location', 'place', 'where'];
const COORDS_KEYS = ['coordinates', 'coords', 'geo'];
const TIME_KEYS = ['timestamp', 'time', 'when', 'date'];
const MENTIONS_KEYS = [
  'mentionedPeople',
  'mentions',
  'people',
  'involvedPeople',
  'peopleInvolved',
];
const CONFIDENCE_KEYS = ['confidence', 'certainty', 'reliability'];

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

function parseNameList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;]/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
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
  const mentions = parseNameList(pickAnswer(answers, MENTIONS_KEYS));
  const timestamp = pickAnswer(answers, TIME_KEYS);

  return {
    id: submission.id,
    source,
    formId: submission.form_id,
    createdAt: submission.created_at,

    personName,
    seenWith,
    mentions: mentions.length > 0 ? mentions : undefined,
    participants: dedupe([personName, seenWith, ...mentions]),

    location: pickAnswer(answers, LOCATION_KEYS),
    coordinates: parseCoordinates(pickAnswer(answers, COORDS_KEYS)),

    timestamp,
    timestampMs: parseJotformTimestamp(timestamp),

    text: pickAnswer(answers, TEXT_KEYS),

    confidence: pickAnswer(answers, CONFIDENCE_KEYS),

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
