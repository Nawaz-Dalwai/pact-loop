/** The plan Pact works back from the goal (fictional demo numbers, in $K ARR). */
export const PLAN = {
  deadline: 'Sep 30, 2027',
  deadlineShort: 'Sep 30',
  arrToday: 310,
  goal: 1000,
  path: [
    { label: 'Dec', value: 325 },
    { label: 'Jan', value: 355 },
    { label: 'Feb', value: 400 },
    { label: 'Mar', value: 455 },
    { label: 'Apr', value: 520 },
    { label: 'May', value: 590 },
    { label: 'Jun', value: 665 },
    { label: 'Jul', value: 750 },
    { label: 'Aug', value: 860 },
    { label: 'Sep', value: 1000 },
  ],
}

/** Progress against the plan at each point of the story (fictional). */
export function progressFor(step: string, reachedUsage: boolean) {
  const won = step === 'done'
  return {
    arr: won ? 346 : 310,
    leads: reachedUsage ? 41 : 9,
    pilots: reachedUsage ? 4 : 1,
    conversions: won ? 1 : 0,
    /** north star: tasks Pact completed for the founder this week (approved + ran on its own) */
    tasksApproved: reachedUsage ? 18 : 11,
    tasksOwn: reachedUsage ? 5 : 0,
  }
}
