export interface FormState {
  teamSize: string;
  toolCount: string;
  primaryProcess: string;
  executionMode: string;
  errorFrequency: string;
  dependency: string;
  speedRequirement: string;
  annoyance: string;
  documentation: string;
  timeSavings: string;
  hourlyRate: string;
  email?: string;
}

export interface Question {
  id: keyof FormState;
  text: string;
  tooltip?: string;
  example?: string;
  placeholder?: string;
  type: 'radio' | 'text' | 'textarea';
  options?: string[];
}

export interface DimensionScore {
  label: string;
  score: number; // 0-10 for display
  weight: number; // 0-1, contribution to total
  color: string;
}

export type PriorityBand = 'low' | 'medium' | 'high' | 'critical';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface Recommendation {
  title: string;
  description: string;
  type: 'immediate' | 'strategic' | 'structural';
}

export interface Methodology {
  implementationCostGBP: number;
  monthlyMaintenanceGBP: number;
  hourlyRateGBP: number;
  weeklyHoursAssumed: number;
  yearOneCostGBP: number;
  scoreFormula: string;
  roiFormula: string;
}

export interface DiagnosticResult {
  totalScore: number;
  dimensions: DimensionScore[];
  bottleneck: string;
  weeklySavings: number;
  hourlyRate: number;
  annualValueGBP: number;
  monthlyValueGBP: number;
  yearOneCostGBP: number;
  yearOneNetGBP: number;
  breakEvenMonths: number | null; // null = never breaks even at this scale
  priorityBand: PriorityBand;
  confidenceLevel: ConfidenceLevel;
  recommendations: Recommendation[];
  methodology: Methodology;
}
