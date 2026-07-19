export type CdsTrack = 'IMA/INA/AFA' | 'OTA (Non-Tech)';

export const CDS_TRACKS: CdsTrack[] = ['IMA/INA/AFA', 'OTA (Non-Tech)'];

export interface CdsSubject {
  name: string;
  note: string;
  progress: number;
}

export function getCdsSubjects(track: CdsTrack): CdsSubject[] {
  const isOta = track === 'OTA (Non-Tech)';
  return [
    { name: 'English', note: 'Grammar, vocabulary, comprehension.', progress: 65 },
    { name: 'General Knowledge', note: 'Graduate-level current affairs & static GK.', progress: 40 },
    {
      name: 'Elementary Mathematics',
      note: isOta ? 'Not required for OTA candidates.' : 'Class 10-level arithmetic, algebra, geometry.',
      progress: isOta ? 0 : 50,
    },
  ];
}
