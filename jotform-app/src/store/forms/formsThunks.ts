import { createAsyncThunk } from '@reduxjs/toolkit';
import { FORM_IDS, type FormLabel } from '../../constants/formIds';
import { getForm } from '../../services/jotformApi';
import type { JotformForm } from '../../types/jotform';

export type FormsByLabel = Record<FormLabel, JotformForm>;

export const fetchAllForms = createAsyncThunk<FormsByLabel>(
  'forms/fetchAll',
  async () => {
    const entries = Object.entries(FORM_IDS) as [FormLabel, string][];

    const results = await Promise.all(
      entries.map(async ([label, id]) => {
        const form = await getForm(id);
        return [label, form] as const;
      }),
    );

    return Object.fromEntries(results) as FormsByLabel;
  },
);
