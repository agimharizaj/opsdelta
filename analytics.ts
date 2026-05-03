/**
 * Privacy-first analytics utility.
 * Logs events to the console for local monitoring. Swap in Plausible / Simple Analytics when you're ready.
 */
type Props = Record<string, unknown> | undefined;

export const analytics = {
  track: (event: string, properties?: Props) => {
    const entry = { event, timestamp: new Date().toISOString(), ...(properties ?? {}) };
    if (typeof console !== 'undefined' && console.groupCollapsed) {
      console.groupCollapsed(`OpsDelta · ${event}`);
      console.table(entry);
      console.groupEnd();
    }
  },
  logSessionSummary: (starts: number, finishes: number) => {
    if (starts === 0) return;
    const rate = ((finishes / starts) * 100).toFixed(1);
    console.info(`OpsDelta · Completion rate this session: ${rate}%`);
  },
};
