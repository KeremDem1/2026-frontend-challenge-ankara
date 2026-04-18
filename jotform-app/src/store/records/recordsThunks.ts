import { createAsyncThunk } from '@reduxjs/toolkit';
import { FORM_IDS, type FormLabel } from '../../constants/formIds';
import { getSubmissions } from '../../services/jotformApi';
import type { InvestigationRecord } from '../../types/record';
import { adaptSubmission } from './recordsAdapters';

export const fetchAllRecords = createAsyncThunk<InvestigationRecord[]>(
  'records/fetchAll',
  async () => {
    const entries = Object.entries(FORM_IDS) as [FormLabel, string][];

    const perSource = await Promise.all(
      entries.map(async ([label, formId]) => {
        const submissions = await getSubmissions(formId);
        return submissions.map((submission) =>
          adaptSubmission(label, submission),
        );
      }),
    );

    return perSource.flat();
  },
);
