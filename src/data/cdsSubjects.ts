export type CdsTrack = 'IMA/INA/AFA' | 'OTA (Non-Tech)';

export const CDS_TRACKS: CdsTrack[] = ['IMA/INA/AFA', 'OTA (Non-Tech)'];

export interface CdsSubject {
  name: string;
  note: string;
  progress: number;
}

// progress is real, tracked coverage for this account — every subject
// starts at 0 since there is no fabricated activity history for a new
// sign-up.
export function getCdsSubjects(track: CdsTrack): CdsSubject[] {
  const isOta = track === 'OTA (Non-Tech)';
  return [
    { name: 'English', note: 'Grammar, vocabulary, comprehension.', progress: 0 },
    { name: 'General Knowledge', note: 'Graduate-level current affairs & static GK.', progress: 0 },
    {
      name: 'Elementary Mathematics',
      note: isOta ? 'Not required for OTA candidates.' : 'Class 10-level arithmetic, algebra, geometry.',
      progress: 0,
    },
  ];
}
