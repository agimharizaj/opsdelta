import {
  FormState,
  DiagnosticResult,
  DimensionScore,
  PriorityBand,
  ConfidenceLevel,
  Recommendation,
  Methodology,
} from './types';
import {
  COST_MODEL,
  DIMENSION_WEIGHTS,
  SUBWEIGHTS,
  ANSWER_SCORES,
  PRIORITY_BANDS,
  HOURLY_RATES_GBP,
  WEEKLY_HOURS_BY_ANSWER,
} from './scoring-config';

/**
 * SCORING MODEL (v2)
 *
 * Each dimension produces a normalised 0..1 score from its sub-questions.
 * Dimensions are then weighted and summed to produce a 0..100 total.
 *
 *   total = (manual_burden * 0.40)
 *         + (error_frequency * 0.25)
 *         + (process_complexity * 0.20)
 *         + (speed_requirement * 0.15)
 *         × 100
 *
 * Manual Burden carries the most weight because it is the dimension
 * automation directly attacks. Process Complexity is a friction
 * multiplier, not a value driver, so it sits below errors.
 *
 * All constants live in scoring-config.ts.
 */

export const calculateResults = (responses: FormState): DiagnosticResult => {
  // Sub-scores, each 0..1
  const manualBurden = computeManualBurden(responses);
  const errorFrequency = lookup(ANSWER_SCORES.errorFrequency, responses.errorFrequency);
  const processComplexity = computeProcessComplexity(responses);
  const speedRequirement = lookup(ANSWER_SCORES.speedRequirement, responses.speedRequirement);

  // Total 0..100
  const total01 =
    manualBurden * DIMENSION_WEIGHTS.manualBurden +
    errorFrequency * DIMENSION_WEIGHTS.errorFrequency +
    processComplexity * DIMENSION_WEIGHTS.processComplexity +
    speedRequirement * DIMENSION_WEIGHTS.speedRequirement;
  const totalScore = Math.round(total01 * 100);

  // Dimensions for the breakdown view (display as 0..10)
  const dimensions: DimensionScore[] = [
    { label: 'Manual Burden', score: round1(manualBurden * 10), weight: DIMENSION_WEIGHTS.manualBurden, color: '#D9472A' },
    { label: 'Error Frequency', score: round1(errorFrequency * 10), weight: DIMENSION_WEIGHTS.errorFrequency, color: '#B53A20' },
    { label: 'Process Complexity', score: round1(processComplexity * 10), weight: DIMENSION_WEIGHTS.processComplexity, color: '#3F5E4A' },
    { label: 'Speed Requirement', score: round1(speedRequirement * 10), weight: DIMENSION_WEIGHTS.speedRequirement, color: '#1C1C1C' },
  ];

  // Economics
  const weeklySavings = WEEKLY_HOURS_BY_ANSWER[responses.timeSavings] ?? 3;
  const hourlyRate = HOURLY_RATES_GBP[responses.hourlyRate] ?? COST_MODEL.averageHourlyRateGBP;
  const annualValueGBP = Math.round(weeklySavings * 52 * hourlyRate);
  const monthlyValueGBP = annualValueGBP / 12;

  // Cost model: £1,000 setup + £250/month
  const yearOneCostGBP = COST_MODEL.implementation + COST_MODEL.monthlyMaintenance * 12;
  const yearOneNetGBP = annualValueGBP - yearOneCostGBP;

  // Break-even: month N where N * monthly_value > setup + N * monthly_maintenance
  // => N > setup / (monthly_value - monthly_maintenance)
  // If monthly_value <= monthly_maintenance, never breaks even.
  const breakEvenMonths =
    monthlyValueGBP > COST_MODEL.monthlyMaintenance
      ? Math.max(1, Math.ceil(COST_MODEL.implementation / (monthlyValueGBP - COST_MODEL.monthlyMaintenance)))
      : null;

  // Triage
  const priorityBand = derivePriorityBand(totalScore, weeklySavings, responses);
  const confidenceLevel = deriveConfidence(responses);

  // Bottleneck narrative
  const bottleneck = (responses.annoyance && responses.annoyance.trim().length > 5)
    ? responses.annoyance.trim()
    : `${responses.executionMode.toLowerCase()} execution with ${responses.errorFrequency.toLowerCase()} errors`;

  const recommendations = generateRecommendations(responses, weeklySavings, hourlyRate, annualValueGBP);

  const methodology: Methodology = {
    implementationCostGBP: COST_MODEL.implementation,
    monthlyMaintenanceGBP: COST_MODEL.monthlyMaintenance,
    hourlyRateGBP: hourlyRate,
    weeklyHoursAssumed: weeklySavings,
    yearOneCostGBP,
    scoreFormula: `Manual Burden ${pct(DIMENSION_WEIGHTS.manualBurden)} + Errors ${pct(DIMENSION_WEIGHTS.errorFrequency)} + Process Complexity ${pct(DIMENSION_WEIGHTS.processComplexity)} + Speed ${pct(DIMENSION_WEIGHTS.speedRequirement)}`,
    roiFormula: `(${weeklySavings} hrs/week x 52 x £${hourlyRate}) - (£${COST_MODEL.implementation} setup + £${COST_MODEL.monthlyMaintenance}/month)`,
  };

  return {
    totalScore,
    dimensions,
    bottleneck,
    weeklySavings,
    hourlyRate,
    annualValueGBP,
    monthlyValueGBP,
    yearOneCostGBP,
    yearOneNetGBP,
    breakEvenMonths,
    priorityBand,
    confidenceLevel,
    recommendations,
    methodology,
  };
};

// =========================================================================
// Sub-scores (0..1)
// =========================================================================

function computeManualBurden(r: FormState): number {
  const exec = lookup(ANSWER_SCORES.executionMode, r.executionMode);
  const time = lookup(ANSWER_SCORES.timeSavings, r.timeSavings);
  const dep = lookup(ANSWER_SCORES.dependency, r.dependency);
  const w = SUBWEIGHTS.manualBurden;
  return exec * w.executionMode + time * w.timeSavings + dep * w.dependency;
}

function computeProcessComplexity(r: FormState): number {
  const tools = lookup(ANSWER_SCORES.toolCount, r.toolCount);
  const team = lookup(ANSWER_SCORES.teamSize, r.teamSize);
  const docs = lookup(ANSWER_SCORES.documentation, r.documentation);
  const w = SUBWEIGHTS.processComplexity;
  return tools * w.toolCount + team * w.teamSize + docs * w.documentation;
}

// =========================================================================
// Triage
// =========================================================================

function derivePriorityBand(total: number, weekly: number, r: FormState): PriorityBand {
  const fragile = r.errorFrequency === 'Constantly' || r.errorFrequency === 'Daily' || r.dependency === 'Yes, one person';
  if (total >= PRIORITY_BANDS.critical && fragile) return 'critical';
  if (total >= PRIORITY_BANDS.high || weekly >= 10) return 'high';
  if (total >= PRIORITY_BANDS.medium) return 'medium';
  return 'low';
}

function deriveConfidence(r: FormState): ConfidenceLevel {
  const knowsTime = r.timeSavings !== 'Honestly no idea';
  const knowsRate = r.hourlyRate !== 'Not sure';
  const documented = r.documentation === 'Thoroughly' || r.documentation === 'Roughly';
  const namedProcess = !!r.primaryProcess && r.primaryProcess.trim().length > 4;
  const score = [knowsTime, knowsRate, documented, namedProcess].filter(Boolean).length;
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

// =========================================================================
// Recommendations (rule-based, deterministic)
// =========================================================================

function generateRecommendations(r: FormState, weekly: number, rate: number, annualGBP: number): Recommendation[] {
  const recs: Recommendation[] = [];
  const proc = r.primaryProcess.trim() || 'this workflow';

  if (r.annoyance && r.annoyance.trim().length > 10) {
    recs.push({
      title: 'Fix the biggest annoyance first',
      description: `You said: "${r.annoyance.trim()}". Start there. Removing the single most painful friction point in ${proc} compounds: it builds momentum, frees attention, and proves the model before you commit to a larger build.`,
      type: 'immediate',
    });
  }

  if (r.documentation === 'Not really' || r.documentation === 'We tried and gave up') {
    recs.push({
      title: 'Document before you automate',
      description: `Map ${proc} step by step: what happens, who does it, where data lives, what breaks. Two to three hours of writing usually surfaces more than half the eventual automation spec. Without this, you build blind.`,
      type: 'immediate',
    });
  } else if (r.documentation === 'Roughly') {
    recs.push({
      title: 'Close the documentation gaps',
      description: `Partial docs for ${proc} are good. Now fill the edges: failure modes, exceptions, who picks it up when the primary owner is out. Complete docs become a clean automation brief.`,
      type: 'immediate',
    });
  }

  if (r.toolCount === '5-10' || r.toolCount === '10+') {
    recs.push({
      title: `Connect the ${r.toolCount} tools you already use`,
      description: `${proc} almost certainly involves moving data between systems by hand. Use n8n, Make, or Zapier to wire the two or three highest-traffic seams first. You will recover hours before you have built anything custom.`,
      type: 'strategic',
    });
  }

  if (r.errorFrequency === 'Daily' || r.errorFrequency === 'Constantly') {
    recs.push({
      title: 'Eliminate the error-prone manual steps',
      description: `${r.errorFrequency} errors in ${proc} are not a discipline problem: they are a system problem. Humans miss steps, mistype values, and get distracted. Systems do not. Treat automation here as a reliability investment, not an efficiency one.`,
      type: 'immediate',
    });
  } else if (r.errorFrequency === 'Weekly') {
    recs.push({
      title: 'Systemise the steps that fail most',
      description: `Weekly errors in ${proc} cluster around a small number of manual steps. Instrument the process for a week, identify the top three failure modes, and automate those first.`,
      type: 'strategic',
    });
  }

  if (r.dependency === 'Yes, one person') {
    recs.push({
      title: 'Remove the single-person dependency',
      description: `${proc} sitting with one person is an operational risk. Bus factor of one means a sick day or resignation breaks the process. Start with a Loom walkthrough, turn that into documented SOP, then automate the repetitive 30%.`,
      type: 'structural',
    });
  }

  if (weekly >= 5) {
    recs.push({
      title: `Recover ${weekly} hours per week, worth £${annualGBP.toLocaleString()} a year`,
      description: `${weekly} hours a week on ${proc} is ${Math.round(weekly * 52)} hours a year. Automating just the most repetitive 30% of the workflow typically unlocks 60-70% of the time saving immediately, with a payback inside a quarter.`,
      type: 'strategic',
    });
  } else if (weekly >= 2) {
    recs.push({
      title: 'Small process, compounding return',
      description: `${weekly} hours a week on ${proc} sounds modest, but that is ${Math.round(weekly * 52)} hours a year. Build it once, benefit forever, and free that attention for higher-value work.`,
      type: 'strategic',
    });
  }

  if (r.speedRequirement === 'Instant' || r.speedRequirement === 'Fast (within minutes)') {
    recs.push({
      title: 'Move to event-driven automation',
      description: `${proc} needs to run ${r.speedRequirement.toLowerCase()}. Manual execution cannot reliably hit that bar. Webhooks and APIs eliminate the human bottleneck and remove latency at the same time.`,
      type: 'structural',
    });
  }

  if (recs.length < 3) {
    recs.push({
      title: 'Start with the most repetitive 20%',
      description: `Do not try to automate all of ${proc} at once. Pick the most repetitive 20%, usually data entry or status updates, and ship that first. Prove the ROI, then expand.`,
      type: 'immediate',
    });
  }

  return recs.slice(0, 5);
}

// =========================================================================
// Helpers
// =========================================================================

function lookup<T extends Record<string, number>>(table: T, key: string): number {
  return (table as Record<string, number>)[key] ?? 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
