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
  {
    type: 'Half Group Task',
    title: 'Cross a narrow gorge with an injured teammate',
    brief:
      "Materials: one rope, two bamboo poles, one sheet for an improvised stretcher. Half the group must get the injured member and all equipment across without anyone entering the marked 'unsafe zone'.",
  },
  {
    type: 'Group Obstacle Race',
    title: "Move a long pole and a water drum through a marked course as a team",
    brief:
      'Materials: one 12-ft bamboo pole, one water drum, a length of rope. Plan the running order and how the group stays synchronised without dropping the pole.',
  },
  {
    type: 'Command Task',
    title: 'As the appointed commander, lead two teammates across a marked hazard',
    brief:
      'Materials: one plank, one rope. Only you may give instructions — your two teammates follow without proposing their own plan. Note your exact sequence of commands.',
  },
  {
    type: 'Final Group Task',
    title: "Combine the group's remaining resources to clear the last three obstacles before time runs out",
    brief:
      'Materials: whatever remains from earlier tasks — one rope, one plank, one drum. Plan a single continuous route covering all three obstacles.',
  },
];

export const GROUP_TASK_OLQ_TAGS = ['Cooperation', 'Organizing Ability', 'Ability to Influence the Group', 'Initiative'];
