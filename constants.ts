import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 'teamSize',
    text: 'How big is your team?',
    tooltip: 'Larger teams accumulate more communication debt: the kind automation can dissolve.',
    type: 'radio',
    options: ['1-5', '6-20', '21-50', '50+'],
  },
  {
    id: 'toolCount',
    text: 'How many tools does your team touch in a normal day?',
    tooltip: 'Every additional tool is a seam where data has to be copied or re-entered by hand.',
    type: 'radio',
    options: ['Under 5', '5-10', '10+'],
  },
  {
    id: 'primaryProcess',
    text: 'Which process eats the most time each week?',
    tooltip: 'Pick one specific recurring workflow, not a category.',
    example: 'Generating monthly investor reports',
    type: 'text',
    placeholder: 'e.g. customer onboarding, expense approvals, weekly reporting',
  },
  {
    id: 'executionMode',
    text: 'How is this process currently run?',
    tooltip: 'Manual processes carry the highest automation alpha: the largest return for the least effort.',
    type: 'radio',
    options: ['Fully manual', 'Partly automated', "It's a bit of a mess", 'Not sure'],
  },
  {
    id: 'errorFrequency',
    text: 'How often do errors or delays creep into this process?',
    tooltip: 'Frequent errors suggest a process too complex for consistent human execution.',
    type: 'radio',
    options: ['Never', 'Sometimes', 'Weekly', 'Daily', 'Constantly'],
  },
  {
    id: 'dependency',
    text: 'Does this process depend on one specific person?',
    tooltip: 'Single-person dependency is operational fragility: the bus factor problem.',
    type: 'radio',
    options: ['Yes, one person', 'A couple of people', 'Anyone on the team can do it'],
  },
  {
    id: 'speedRequirement',
    text: 'How quickly does this process need to run?',
    tooltip: 'Anything that needs to happen in minutes is a strong candidate for API-led automation.',
    type: 'radio',
    options: ['Slow (days are fine)', 'Medium (within hours)', 'Fast (within minutes)', 'Instant'],
  },
  {
    id: 'annoyance',
    text: 'If you could remove one annoyance from this workflow, what would it be?',
    tooltip: 'The emotional pain point usually points straight at the technical bottleneck.',
    example: 'Copying data between the CRM and the invoice tool, twenty times a day',
    type: 'textarea',
    placeholder: 'Describe the bit that drives you up the wall',
  },
  {
    id: 'documentation',
    text: 'Is the process documented?',
    tooltip: 'Documentation is the pseudo-code of automation. If you can describe it clearly, it can be built.',
    type: 'radio',
    options: ['Thoroughly', 'Roughly', 'Not really', 'We tried and gave up'],
  },
  {
    id: 'timeSavings',
    text: 'How many hours a week could a fully automated version save you?',
    tooltip: 'Used to estimate your hidden labour cost: the money quietly disappearing into manual tasks.',
    type: 'radio',
    options: ['1-2 hours', '3-5 hours', '5-10 hours', '10+ hours', 'Honestly no idea'],
  },
  {
    id: 'hourlyRate',
    text: 'What is the loaded hourly cost of the people doing this work?',
    tooltip: 'Use a fully-loaded rate (salary plus overhead). Used purely for ROI maths.',
    type: 'radio',
    options: ['£25 / $30', '£50 / $60', '£75 / $90', '£100+ / $120+', 'Not sure'],
  },
];

export const STORAGE_KEY = 'opsdelta_state_v3';
export const CURRENT_STEP_KEY = 'opsdelta_step_v3';
