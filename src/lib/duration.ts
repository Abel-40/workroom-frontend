// Duration strings across the app follow the pattern "1d 2h 30m" (any subset),
// with a workday defined as 8 hours — matching the reference designs
// ("Original Estimate 3d 8h" style summaries).
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 8

export function parseDurationToMinutes(value: string | undefined | null): number {
  if (!value) return 0
  const dayMatch = value.match(/(\d+(?:\.\d+)?)\s*d/i)
  const hourMatch = value.match(/(\d+(?:\.\d+)?)\s*h/i)
  const minuteMatch = value.match(/(\d+(?:\.\d+)?)\s*m/i)

  const days = dayMatch ? parseFloat(dayMatch[1]) : 0
  const hours = hourMatch ? parseFloat(hourMatch[1]) : 0
  const minutes = minuteMatch ? parseFloat(minuteMatch[1]) : 0

  return Math.round(days * HOURS_PER_DAY * MINUTES_PER_HOUR + hours * MINUTES_PER_HOUR + minutes)
}

export function formatMinutesToDuration(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0h'

  const dayMinutes = HOURS_PER_DAY * MINUTES_PER_HOUR
  const days = Math.floor(totalMinutes / dayMinutes)
  const remAfterDays = totalMinutes % dayMinutes
  const hours = Math.floor(remAfterDays / MINUTES_PER_HOUR)
  const minutes = Math.round(remAfterDays % MINUTES_PER_HOUR)

  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  return parts.length ? parts.join(' ') : '0h'
}

export function computeProgressLabel(spent: string | undefined, estimate: string | undefined): string {
  const spentMinutes = parseDurationToMinutes(spent)
  const estimateMinutes = parseDurationToMinutes(estimate)
  if (!estimateMinutes) return spentMinutes > 0 ? '100%' : '0%'
  const percent = Math.min(100, Math.round((spentMinutes / estimateMinutes) * 100))
  return `${percent}%`
}

// The backend stores task time as hours floats (Task.estimated_time /
// spent_time), not the "1d 2h 30m" strings above — these operate on those
// floats directly rather than round-tripping through the string parser.
export function formatHoursToDuration(hours: number | null | undefined): string {
  if (!hours || hours <= 0) return '0h'
  return formatMinutesToDuration(Math.round(hours * MINUTES_PER_HOUR))
}

// Progress reflects real task completion, not just logged time -- a "Done"
// task is 100% even if nobody logged hours, and a "To Do" task is 0% even
// if time was pre-logged against it. Only while a task is actually being
// worked (In Progress/In Review) does the spent/estimate ratio matter, and
// even then it's clamped so it never visually reads as "not started" or
// "finished" while the task's real status says otherwise.
export function computeTaskProgress(
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done',
  spentHours: number | null | undefined,
  estimateHours: number | null | undefined
): string {
  if (status === 'Done') return '100%'
  if (status === 'To Do') return '0%'
  const spent = spentHours || 0
  if (!estimateHours) return status === 'In Review' ? '90%' : '50%'
  const ratio = Math.round((spent / estimateHours) * 100)
  const percent = Math.min(95, Math.max(5, ratio))
  return `${percent}%`
}
