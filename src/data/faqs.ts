export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: 'What is the age limit for the National Defence Academy (NDA)?',
    a: 'Candidates must be between 16.5 and 19.5 years old at the time of joining, and unmarried throughout training.',
  },
  {
    q: 'Can women apply for the National Defence Academy?',
    a: 'Yes — the National Defence Academy has been open to women candidates across all three wings (Army, Navy and Air Force) since 2021.',
  },
  {
    q: 'How many attempts are allowed for Combined Defence Services (CDS)?',
    a: 'There is no fixed cap on attempts — eligibility is based on age and qualification for each notification, not a lifetime attempt limit.',
  },
  {
    q: 'What happens if I fail the screening on Day 1 of the Services Selection Board (SSB)?',
    a: 'Candidates who are screened out are released the same day and do not proceed to the psychology or Group Testing Officer tasks. You can reapply in a future SSB call-up.',
  },
  {
    q: 'Is the Services Selection Board interview only on one day?',
    a: 'No — the personal interview is usually spread across one or more days during the 4-day (screened-in) process, alongside psychology and Group Testing Officer tasks.',
  },
  {
    q: 'Do I need Class 12 Physics, Chemistry & Mathematics for the Air Force Common Admission Test (AFCAT)?',
    a: 'Only for the Flying Branch, which requires Class 12 Physics, Chemistry & Mathematics alongside a graduate degree. Ground Duty branches vary by role.',
  },
  {
    q: 'Is the Engineering Knowledge Test (EKT) compulsory for AFCAT?',
    a: 'The Engineering Knowledge Test is only required if you are applying for a technical branch. Its negative-marking scheme is currently unresolved — always confirm against the latest AFCAT notification.',
  },
  {
    q: 'Can I reattempt the Services Selection Board after a conference-out?',
    a: 'Yes. A conference-out (not recommended after Day 5) does not bar you from applying again through a fresh notification.',
  },
  {
    q: "What's the negative marking for the Air Force Common Admission Test?",
    a: 'The main AFCAT paper is +3 for a correct answer, −1 for a wrong answer, and 0 for an unattempted question.',
  },
  {
    q: 'Does the National Defence Academy have the Naval Academy as a separate option?',
    a: "Yes — the Naval Academy 10+2 Cadet Entry (Bachelor of Technology) shares the NDA/NA written exam but is a distinct 4-year Executive Branch track from the National Defence Academy's Naval Wing.",
  },
  {
    q: 'What are Officer-Like Qualities (OLQs)?',
    a: 'Officer-Like Qualities are 15 traits — such as effective intelligence, courage, and cooperation — that the board assesses across every stage. No single task scores them.',
  },
  {
    q: 'I am already serving. How do I become an officer?',
    a: 'Both services run internal routes for serving personnel. In the Navy it is the Cadet Entry Scheme (CW), for serving sailors; in the Army it is the Army Cadet College (ACC), for serving soldiers, whose entrants train at the ACC Wing before joining the Indian Military Academy. Unlike NDA or CDS these are not open civilian notifications — you apply through your own unit, and the age, service-length and qualification criteria are set by each service\'s current notification, so confirm them through your unit rather than from any app.',
  },
  {
    q: 'Why do CW and ACC not appear in the Eligibility Check?',
    a: 'Because eligibility for them depends on your service record — how long you have served and in what capacity — which this app does not ask for and could not verify. Showing a verdict from age and education alone would be misleading, so they are deliberately left out of the scan. You can still select CW or ACC when registering for SSB training, and the preparation itself is identical.',
  },
  {
    q: 'Can the AI Assistant tell me if my answer is good?',
    a: 'No, and this is deliberate rather than a limitation. The assistant explains concepts, Officer-Like Qualities and how a strong response is generally structured, but it will never score, grade or rank anything you write, and it will not judge your personality or suitability from what you tell it. Only a human assessor does that. It also will not tell you that you personally qualify for a scheme — use the Eligibility Check and the official notification for that.',
  },
  {
    q: 'Where do I find the AI Assistant?',
    a: 'The "Ask AI" button sits in the bottom corner of every page once you are signed in, and your conversation stays with you as you move around the app. There are also two focused versions: one inside SSB Training for psychology and interview preparation, and one attached to each Current Affairs brief for questions about that specific story.',
  },
];
