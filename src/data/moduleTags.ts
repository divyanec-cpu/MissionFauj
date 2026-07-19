import type { SsbModuleId } from '../types/ssb';
import { WAT_OLQ_TAGS } from './watWords';
import { TAT_OLQ_TAGS } from './tatPrompts';
import { PPDT_OLQ_TAGS } from './ppdtPrompts';
import { SRT_OLQ_TAGS } from './srtSituations';
import { SELF_DESCRIPTION_OLQ_TAGS } from './selfDescriptionPrompts';
import { LECTURETTE_OLQ_TAGS } from './lecturetteTopics';
import { GROUP_TASK_OLQ_TAGS } from './groupTaskScenarios';
import { PIQ_INTERVIEW_OLQ_TAGS } from './interviewQuestions';
import { OLQ_LIST } from './olq';

export function getModuleOlqTags(id: SsbModuleId): string[] {
  switch (id) {
    case 'WAT':
      return WAT_OLQ_TAGS;
    case 'TAT':
      return TAT_OLQ_TAGS;
    case 'PPDT':
      return PPDT_OLQ_TAGS;
    case 'SRT':
      return SRT_OLQ_TAGS;
    case 'Self Description':
      return SELF_DESCRIPTION_OLQ_TAGS;
    case 'Lecturette':
      return LECTURETTE_OLQ_TAGS;
    case 'Group Tasks':
      return GROUP_TASK_OLQ_TAGS;
    case 'PIQ & Interview Prep':
      return PIQ_INTERVIEW_OLQ_TAGS;
    case 'OLQ Self-Assessment':
      return OLQ_LIST;
    default:
      return OLQ_LIST;
  }
}
