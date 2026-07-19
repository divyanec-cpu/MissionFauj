export interface GroupTaskScenario {
  type: string;
  title: string;
  brief: string;
}

export const GROUP_TASK_SCENARIOS: GroupTaskScenario[] = [
  {
    type: 'Group Discussion',
    title: 'Should social media platforms be regulated more strictly?',
    brief: 'Note the key points you would raise and how you would respond to a differing viewpoint.',
  },
  {
    type: 'Group Planning Exercise',
    title: 'A village is cut off by floodwaters with limited daylight remaining',
    brief:
      'Resources available: one boat (4-person capacity), a rope, a first-aid kit, and a working radio. Plan the evacuation order and the rationale.',
  },
  {
    type: 'Progressive Group Task',
    title: 'Cross a marked obstacle zone using only the group\'s materials',
    brief: 'Materials: one plank, one rope, two drums. Note the sequence your group would use and each member\'s role.',
  },
];

export const GROUP_TASK_OLQ_TAGS = ['Cooperation', 'Organizing Ability', 'Ability to Influence the Group', 'Initiative'];
