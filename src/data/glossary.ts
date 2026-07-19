export interface GlossaryTerm {
  abbr: string;
  full: string;
}

export interface GlossaryGroup {
  title: string;
  terms: GlossaryTerm[];
}

export const GLOSSARY_GROUPS: GlossaryGroup[] = [
  {
    title: 'Entry Schemes',
    terms: [
      { abbr: 'NDA', full: 'National Defence Academy' },
      { abbr: 'NA', full: 'Naval Academy' },
      { abbr: 'CDS', full: 'Combined Defence Services' },
      { abbr: 'IMA', full: 'Indian Military Academy' },
      { abbr: 'INA', full: 'Indian Naval Academy' },
      { abbr: 'AFA', full: 'Air Force Academy' },
      { abbr: 'OTA', full: 'Officers Training Academy' },
      { abbr: 'AFCAT', full: 'Air Force Common Admission Test' },
      { abbr: 'EKT', full: 'Engineering Knowledge Test' },
      { abbr: 'TES', full: 'Technical Entry Scheme' },
      { abbr: 'TGC', full: 'Technical Graduate Course' },
      { abbr: 'SSC', full: 'Short Service Commission' },
      { abbr: 'NCC', full: 'National Cadet Corps' },
      { abbr: 'UES', full: 'University Entry Scheme' },
      { abbr: 'JAG', full: 'Judge Advocate General' },
      { abbr: 'ACC', full: 'Army Cadet College' },
      { abbr: 'TA', full: 'Territorial Army' },
    ],
  },
  {
    title: 'SSB & Psychology',
    terms: [
      { abbr: 'SSB', full: 'Services Selection Board' },
      { abbr: 'TAT', full: 'Thematic Apperception Test' },
      { abbr: 'WAT', full: 'Word Association Test' },
      { abbr: 'SRT', full: 'Situation Reaction Test' },
      { abbr: 'SD', full: 'Self Description' },
      { abbr: 'PPDT', full: 'Picture Perception & Discussion Test' },
      { abbr: 'GTO', full: 'Group Testing Officer' },
      { abbr: 'GD', full: 'Group Discussion' },
      { abbr: 'IO', full: 'Interviewing Officer' },
      { abbr: 'PIQ', full: 'Personal Information Questionnaire' },
      { abbr: 'OLQ', full: 'Officer-Like Qualities' },
    ],
  },
  {
    title: 'Written Exam',
    terms: [
      { abbr: 'GAT', full: 'General Ability Test' },
      { abbr: 'GK', full: 'General Knowledge' },
      { abbr: 'PCM', full: 'Physics, Chemistry, Mathematics' },
    ],
  },
  {
    title: 'General',
    terms: [
      { abbr: 'UPSC', full: 'Union Public Service Commission' },
      { abbr: 'DRDO', full: 'Defence Research and Development Organisation' },
      { abbr: 'CDS (Staff)', full: 'Chief of Defence Staff' },
    ],
  },
];
