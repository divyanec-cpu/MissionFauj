export interface TimelineStage {
  stage: string;
  detail: string;
  timing: string;
}

// Stable, evergreen cycle patterns (month-level and relative durations) —
// deliberately NOT hardcoded exact calendar dates, since those shift
// slightly year to year and would go stale/misleading otherwise. Verified
// against UPSC/AFCAT's publicly documented biannual cycles.
export const EXAM_TIMELINES: Record<'NDA' | 'CDS' | 'AFCAT', TimelineStage[]> = {
  NDA: [
    {
      stage: 'Notification',
      detail: 'UPSC releases the NDA I or NDA II notification on upsc.gov.in, opening the online application window.',
      timing: 'NDA I: ~December · NDA II: ~May–June',
    },
    {
      stage: 'Application Window',
      detail: 'Online application, usually with a short correction window afterward.',
      timing: 'Open ~3 weeks from notification',
    },
    {
      stage: 'Written Exam',
      detail: 'Mathematics + General Ability Test (GAT — English and General Knowledge), at centres nationwide.',
      timing: 'NDA I: ~April · NDA II: ~September',
    },
    {
      stage: 'Written Result',
      detail: 'UPSC declares candidates clearing the written cut-off, shortlisted for SSB.',
      timing: '~1–2 months after the exam',
    },
    {
      stage: 'SSB Interview',
      detail: 'A 5-day assessment — screening, psychology tests, GTO tasks, personal interview, and conference.',
      timing: 'Call letter ~2–3 months after result',
    },
    {
      stage: 'Medical Examination',
      detail: 'SSB-recommended candidates undergo a medical board exam at a military hospital.',
      timing: 'Scheduled soon after SSB',
    },
    {
      stage: 'Final Merit List',
      detail: 'UPSC publishes the merit list (written + SSB marks) for candidates who clear medicals.',
      timing: '~1–2 months after SSB results',
    },
    {
      stage: 'Joining NDA, Khadakwasla',
      detail: 'Selected candidates join the National Defence Academy for training.',
      timing: 'Courses begin each January and July',
    },
  ],
  CDS: [
    {
      stage: 'Notification',
      detail: 'UPSC releases the CDS I or CDS II notification on upsc.gov.in.',
      timing: 'CDS I: ~November–December · CDS II: ~May–June',
    },
    {
      stage: 'Application Window',
      detail: 'Online application, usually with a short correction window afterward.',
      timing: 'Open ~3 weeks from notification',
    },
    {
      stage: 'Written Exam',
      detail: 'English, General Knowledge, and Elementary Mathematics for IMA/INA/AFA — OTA candidates skip the Maths paper.',
      timing: 'CDS I: ~April · CDS II: ~September',
    },
    {
      stage: 'Written Result',
      detail: 'UPSC declares candidates clearing the written cut-off, shortlisted for SSB.',
      timing: '~1–2 months after the exam',
    },
    {
      stage: 'SSB Interview',
      detail: 'A 5-day assessment — screening, psychology tests, GTO tasks, personal interview, and conference.',
      timing: 'Call letter ~2–3 months after result',
    },
    {
      stage: 'Medical Examination',
      detail: 'SSB-recommended candidates undergo a medical board exam at a military hospital.',
      timing: 'Scheduled soon after SSB',
    },
    {
      stage: 'Final Merit List',
      detail: 'UPSC publishes the merit list (written + SSB marks) for candidates who clear medicals.',
      timing: '~1–2 months after SSB results',
    },
    {
      stage: 'Joining IMA / OTA / INA / AFA',
      detail: 'Selected candidates join the Indian Military Academy, Officers Training Academy, Indian Naval Academy, or Air Force Academy depending on their chosen track.',
      timing: 'Courses begin each January and July',
    },
  ],
  AFCAT: [
    {
      stage: 'Notification',
      detail: 'The Indian Air Force releases the AFCAT 1 or AFCAT 2 notification on afcat.cdac.in, typically about 3 months before the exam.',
      timing: 'AFCAT 1: ~November · AFCAT 2: ~May',
    },
    {
      stage: 'Application Window',
      detail: 'Online application for the flying, ground duty (technical), or ground duty (non-technical) branches.',
      timing: 'Open ~1 month from notification',
    },
    {
      stage: 'Online Exam',
      detail: 'Verbal Ability, Numerical Ability, Reasoning & Military Aptitude, and General Awareness — plus EKT for technical-branch applicants.',
      timing: 'AFCAT 1: ~February · AFCAT 2: ~August',
    },
    {
      stage: 'Result',
      detail: 'AFCAT declares candidates clearing the cut-off, shortlisted for AFSB.',
      timing: '~3–4 weeks after the exam',
    },
    {
      stage: 'AFSB Interview',
      detail: 'A 5-day assessment at an Air Force Selection Board — screening, psychology tests, GTO tasks, and personal interview.',
      timing: 'Call letter ~1–2 months after result',
    },
    {
      stage: 'Medical Examination',
      detail: 'AFSB-recommended candidates undergo a medical exam at an Air Force medical centre.',
      timing: 'Scheduled soon after AFSB',
    },
    {
      stage: 'Final Selection List',
      detail: 'The Air Force publishes the order-of-merit list for candidates who clear medicals, based on available vacancies.',
      timing: '~1–2 months after AFSB results',
    },
    {
      stage: 'Joining Air Force Academy, Hyderabad',
      detail: 'Selected candidates join for flight cadet or ground duty officer training.',
      timing: 'Courses begin each January and July',
    },
  ],
};
