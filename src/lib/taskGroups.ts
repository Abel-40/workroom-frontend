export const TASK_GROUPS = [
  'Design',
  'Development',
  'Testing',
  'Marketing',
  'Project Management',
] as const

export type TaskGroup = (typeof TASK_GROUPS)[number]
