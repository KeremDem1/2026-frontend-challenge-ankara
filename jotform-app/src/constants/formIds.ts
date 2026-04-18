export const FORM_IDS = {
  Checkins: '261065067494966',
  Messages: '261065765723966',
  Sightings: '261065244786967',
  PersonalNotes: '261065509008958',
  AnonymousTips: '261065875889981',
} as const;

export type FormLabel = keyof typeof FORM_IDS;
