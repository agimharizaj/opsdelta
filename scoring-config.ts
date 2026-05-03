/**
 * Tunable scoring configuration.
 * All constants live here so the engine logic stays clean and readable.
 * After ~50 real submissions, recalibrate against actual response distribution.
 */

// =============================================================================
// COST MODEL — what an OpsDelta engagement actually costs
// =============================================================================
// Used in ROI / break-even calculations. Shown explicitly to the user
// in the methodology panel for transparency.

export const COST_MODEL = {
  currency: '£',
  implementation: 1000, // one-off
  monthlyMaintenance: 250,
  averageHourlyRateGBP: 40, // fallback when user picks "Not sure"
} as const;

// =============================================================================
// DIMENSION WEIGHTS — must sum to 1.0
// =============================================================================
// Manual Burden carries the most weight: it is the dimension automation
// directly attacks (hours saved × rate = ROI numerator).
// Process Complexity is a friction multiplier, not a value driver, so it
// sits below errors despite being a common scoring obsession.

export const DIMENSION_WEIGHTS = {
  manualBurden: 0.40,
  errorFrequency: 0.25,
  processComplexity: 0.20,
  speedRequirement: 0.15,
} as const;

// =============================================================================
// SUB-WEIGHTS — how each dimension breaks down
// =============================================================================
// Each dimension produces a normalised 0-1 score from its sub-questions.
// Sub-weights inside each dimension also sum to 1.0.

export const SUBWEIGHTS = {
  manualBurden: {
    executionMode: 0.50, // current automation state matters most
    timeSavings: 0.35,   // hours at stake
    dependency: 0.15,    // bus factor
  },
  processComplexity: {
    toolCount: 0.50,    // integration seams
    documentation: 0.25, // process clarity
    teamSize: 0.25,     // communication overhead
  },
} as const;

// =============================================================================
// ANSWER SCORES — each maps to a 0-1 value
// =============================================================================

export const ANSWER_SCORES = {
  executionMode: {
    "It's a bit of a mess": 1.00,
    'Fully manual': 0.85,
    'Not sure': 0.55,
    'Partly automated': 0.30,
  },
  timeSavings: {
    '10+ hours': 1.00,
    '5-10 hours': 0.70,
    '3-5 hours': 0.45,
    '1-2 hours': 0.20,
    'Honestly no idea': 0.40,
  },
  dependency: {
    'Yes, one person': 1.00,
    'A couple of people': 0.50,
    'Anyone on the team can do it': 0.00,
  },
  errorFrequency: {
    Constantly: 1.00,
    Daily: 0.80,
    Weekly: 0.60,
    Sometimes: 0.30,
    Never: 0.05,
  },
  speedRequirement: {
    Instant: 1.00,
    'Fast (within minutes)': 0.70,
    'Medium (within hours)': 0.40,
    'Slow (days are fine)': 0.15,
  },
  toolCount: {
    '10+': 1.00,
    '5-10': 0.60,
    'Under 5': 0.20,
  },
  teamSize: {
    '50+': 1.00,
    '21-50': 0.75,
    '6-20': 0.50,
    '1-5': 0.25,
  },
  documentation: {
    'We tried and gave up': 1.00,
    'Not really': 0.75,
    'Roughly': 0.35,
    'Thoroughly': 0.00,
  },
} as const;

// =============================================================================
// PRIORITY BANDS — score thresholds for triage
// =============================================================================
// These are v1 guesses. Recalibrate against real distribution after 50 submissions.

export const PRIORITY_BANDS = {
  critical: 70, // plus a qualitative trigger (see scoring.ts)
  high: 60,
  medium: 40,
  // anything below medium is "low"
} as const;

// =============================================================================
// HOURLY RATES — what the user picked, in GBP
// =============================================================================

export const HOURLY_RATES_GBP: Record<string, number> = {
  '£25 / $30': 25,
  '£50 / $60': 50,
  '£75 / $90': 75,
  '£100+ / $120+': 100,
  'Not sure': COST_MODEL.averageHourlyRateGBP,
};

// =============================================================================
// WEEKLY HOUR ESTIMATES — midpoint of each user-selected band
// =============================================================================
// Conservative deliberately. Better to under-promise than inflate.

export const WEEKLY_HOURS_BY_ANSWER: Record<string, number> = {
  '10+ hours': 12,
  '5-10 hours': 7.5,
  '3-5 hours': 4,
  '1-2 hours': 1.5,
  'Honestly no idea': 3,
};
