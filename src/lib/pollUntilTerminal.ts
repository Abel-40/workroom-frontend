// Shared polling loop for the three AI features (project decomposition,
// assistant, health summary) -- they all share the identical
// pending -> processing -> completed/failed lifecycle (ai_agent/models.py),
// so one implementation is used instead of three copies of the same loop.
// There's no push/webhook channel from the backend for these (confirmed:
// GET polling is the only option), so a plain interval is the correct tool.

export interface PollSignal {
  cancelled: boolean;
}

export function createPollSignal(): PollSignal {
  return { cancelled: false };
}

const TERMINAL_STATUSES = new Set(["completed", "failed"]);

export async function pollUntilTerminal<T extends { status: string }>(
  fetchOnce: () => Promise<T>,
  options: { intervalMs?: number; signal?: PollSignal } = {}
): Promise<T> {
  const intervalMs = options.intervalMs ?? 2000;
  const signal = options.signal;

  let result = await fetchOnce();
  while (!TERMINAL_STATUSES.has(result.status) && !signal?.cancelled) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    if (signal?.cancelled) break;
    result = await fetchOnce();
  }
  return result;
}
