import React, { useState, useMemo, useEffect } from 'react';
import { FormState, PriorityBand, ConfidenceLevel } from '../types';
import {
  Download,
  Mail,
  RefreshCw,
  CheckCircle2,
  Layers,
  Loader2,
  AlertCircle,
  Linkedin,
  Calendar,
  TrendingDown,
  Clock,
  Target,
  ArrowUpRight,
  Calculator,
} from 'lucide-react';
import { analytics } from '../analytics';
import { calculateResults } from '../scoring';
import { DIMENSION_WEIGHTS } from './../scoring-config';

interface ResultsViewProps {
  responses: FormState;
  onReset: () => void;
}

const SITE_URL = 'https://opsdelta.vercel.app';
const gbp = (n: number) => `£${Math.round(n).toLocaleString('en-GB')}`;
const pct = (n: number) => `${Math.round(n * 100)}%`;

export const ResultsView: React.FC<ResultsViewProps> = ({ responses, onReset }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const results = useMemo(() => calculateResults(responses), [responses]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    analytics.track('report_viewed', {
      process: responses.primaryProcess,
      score: results.totalScore,
      priority: results.priorityBand,
    });
  }, [responses.primaryProcess, results.totalScore, results.priorityBand]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);
    try {
      const response = await fetch('https://formspree.io/f/mdaoepnz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'audit_report',
          email,
          automationScore: results.totalScore,
          priorityBand: results.priorityBand,
          confidenceLevel: results.confidenceLevel,
          processName: responses.primaryProcess,
          weeklySavings: results.weeklySavings,
          annualValueGBP: results.annualValueGBP,
          breakEvenMonths: results.breakEvenMonths,
          hourlyRateGBP: results.hourlyRate,
          primaryBottleneck: results.bottleneck,
          timestamp: new Date().toISOString(),
          fullResponses: responses,
        }),
      });
      if (response.ok) {
        setSubmitted(true);
        analytics.track('lead_capture_submitted', {
          score: results.totalScore,
          priority: results.priorityBand,
        });
      } else {
        setSubmitError(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      generatePDF(jsPDF, results, responses);
      analytics.track('pdf_downloaded', { score: results.totalScore });
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert("PDF export failed. Try your browser's print to PDF function as a fallback.");
    }
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`;
    window.open(url, '_blank');
    analytics.track('shared', { platform: 'linkedin' });
  };

  return (
    <section className="pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Section header */}
        <div className="flex items-baseline gap-6">
          <span className="section-number">/ Report</span>
          <h1 className="display-tight text-4xl md:text-5xl">Your audit, ready.</h1>
        </div>

        {/* Score panel */}
        <div className="card overflow-hidden">
          <div className="grid md:grid-cols-[1fr,1.4fr]">
            <div className="p-10 md:p-12 border-b md:border-b-0 md:border-r border-paper-line bg-paper-warm/40 flex flex-col items-center justify-center">
              <ScoreRing score={results.totalScore} />
              <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
                <PriorityBadge band={results.priorityBand} />
                <ConfidenceBadge level={results.confidenceLevel} />
              </div>
            </div>
            <div className="p-10 md:p-12 flex flex-col justify-center">
              <div className="eyebrow mb-4">Headline finding</div>
              <p className="display-tight text-3xl md:text-4xl text-ink mb-6">
                Annual value at stake:{' '}
                <span className="text-ember">{gbp(results.annualValueGBP)}</span>
              </p>
              <p className="text-ink-mute leading-relaxed">
                <span className="text-ink font-medium">Primary friction:</span>{' '}
                {results.bottleneck}
                {responses.primaryProcess && (
                  <>, inside the <span className="text-ink font-medium">{responses.primaryProcess}</span> workflow.</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/10 border border-ink/10 rounded-2xl overflow-hidden">
          <StatCard
            icon={<TrendingDown className="w-5 h-5 text-ember" />}
            label="Weekly hour leak"
            value={`${results.weeklySavings} hrs`}
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-ink" />}
            label="Break-even"
            value={results.breakEvenMonths === null
              ? "Doesn\u2019t cover ongoing"
              : `${results.breakEvenMonths} ${results.breakEvenMonths === 1 ? 'month' : 'months'}`}
            tone={results.breakEvenMonths === null ? 'warn' : undefined}
          />
          <StatCard
            icon={<Target className="w-5 h-5 text-moss" />}
            label="Year-one net"
            value={gbp(results.yearOneNetGBP)}
            tone={results.yearOneNetGBP > 0 ? 'calm' : 'warn'}
          />
        </div>

        {/* Two-column: dimensions+methodology stacked LEFT, roadmap RIGHT */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* LEFT column: dimensions + methodology stacked */}
          <div className="space-y-8">
            <div className="card p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <Layers className="w-5 h-5 text-ember" />
                <h3 className="font-display text-xl font-semibold text-ink tracking-tight">
                  Dimension breakdown
                </h3>
              </div>
              <div className="space-y-7">
                {results.dimensions.map((dim) => (
                  <div key={dim.label}>
                    <div className="flex justify-between items-baseline mb-2 gap-3">
                      <span className="text-sm text-ink font-medium">{dim.label}</span>
                      <span className="font-mono text-xs text-ink-faint whitespace-nowrap">
                        {dim.score.toFixed(1)} / 10 <span className="text-ink-faint/60">· {Math.round(dim.weight * 100)}% weight</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-paper-line rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${dim.score * 10}%`, backgroundColor: dim.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-paper-warm border border-paper-line rounded-2xl p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="w-5 h-5 text-ink-mute" />
                <h3 className="font-display text-xl font-semibold text-ink tracking-tight">
                  How we calculated this
                </h3>
              </div>
              <div className="space-y-6 text-sm">
                <div>
                  <div className="eyebrow mb-2">Score formula</div>
                  <p className="text-ink-mute leading-relaxed font-mono text-xs">
                    {results.methodology.scoreFormula}
                  </p>
                </div>
                <div>
                  <div className="eyebrow mb-2">ROI assumptions</div>
                  <ul className="space-y-1.5 text-ink-mute">
                    <li><span className="text-ink font-medium">Implementation:</span> {gbp(results.methodology.implementationCostGBP)} one-off</li>
                    <li><span className="text-ink font-medium">Maintenance:</span> {gbp(results.methodology.monthlyMaintenanceGBP)} per month</li>
                    <li><span className="text-ink font-medium">Hourly rate:</span> {gbp(results.methodology.hourlyRateGBP)} (your selection)</li>
                    <li><span className="text-ink font-medium">Hours saved per week:</span> {results.methodology.weeklyHoursAssumed} (midpoint of your band)</li>
                  </ul>
                </div>
              </div>
              <p className="mt-6 pt-5 border-t border-paper-line text-xs text-ink-faint leading-relaxed">
                Working assumptions for the report, not a quote. Actual scope and pricing depend on your specific workflow.
              </p>
            </div>
          </div>

          {/* RIGHT column: roadmap, full height */}
          <div className="card p-8 md:p-10 h-full">
            <div className="flex items-center gap-3 mb-8">
              <Target className="w-5 h-5 text-ember" />
              <h3 className="font-display text-xl font-semibold text-ink tracking-tight">
                Execution roadmap
              </h3>
            </div>
            <div className="space-y-6">
              {results.recommendations.map((rec, i) => (
                <div key={i} className="border-l-2 border-paper-line pl-5 py-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-ink-faint">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        rec.type === 'immediate'
                          ? 'bg-ember-soft text-ember-deep'
                          : rec.type === 'structural'
                          ? 'bg-ink text-paper'
                          : 'bg-moss-soft text-moss'
                      }`}
                    >
                      {rec.type}
                    </span>
                  </div>
                  <h4 className="font-display text-lg font-semibold text-ink mb-2 leading-tight">
                    {rec.title}
                  </h4>
                  <p className="text-sm text-ink-mute leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="grid md:grid-cols-2 gap-8 pt-4">
          <div className="bg-ink text-paper rounded-2xl p-10 md:p-12">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-paper/10 mb-6">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-display text-2xl font-semibold mb-3">
              Email me the full report
            </h3>
            <p className="text-paper/60 leading-relaxed mb-6">
              I'll send the technical blueprint for {responses.primaryProcess || 'your workflow'}, plus the cost comparison between custom code and platform tools like n8n or Make.
            </p>
            {submitted ? (
              <div className="bg-paper/5 border border-paper/10 p-5 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-ember shrink-0" />
                <div>
                  <div className="font-medium">Sent</div>
                  <div className="text-sm text-paper/60">Check your inbox.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <input
                  required
                  type="email"
                  placeholder="founder@company.com"
                  className="w-full px-5 py-3.5 bg-paper text-ink rounded-xl placeholder:text-ink-faint outline-none focus:ring-2 focus:ring-ember/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-ember text-paper font-medium rounded-xl hover:bg-ember-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending</>
                  ) : (
                    <>Send me the report <ArrowUpRight className="w-4 h-4" /></>
                  )}
                </button>
                {submitError && (
                  <p className="text-xs text-ember-soft flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    Something broke. Try the contact form instead.
                  </p>
                )}
                <p className="text-[10px] text-paper/40 text-center">No spam. Unsubscribe anytime.</p>
              </form>
            )}
          </div>

          <div className="card p-10 md:p-12 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-ember-soft mb-6">
                <Calendar className="w-4 h-4 text-ember-deep" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-ink mb-3">
                Or book a 15-minute call
              </h3>
              <p className="text-ink-mute leading-relaxed mb-8">
                Walk through your specific workflow with me, get architecture options on the spot, and leave with a clear next step. No pitch.
              </p>
            </div>
            <a
              href="https://calendly.com/agim-harizaj/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full justify-center"
              onClick={() => analytics.track('calendly_clicked')}
            >
              Schedule the call
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-6">
          <button onClick={downloadPDF} className="btn-ghost">
            <Download className="w-4 h-4" />
            Download report (PDF)
          </button>
          <button onClick={handleShareLinkedIn} className="btn-ghost">
            <Linkedin className="w-4 h-4" />
            Share on LinkedIn
          </button>
          <button
            onClick={onReset}
            className="text-sm text-ink-mute hover:text-ink flex items-center gap-1.5 px-4 py-3"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Start over
          </button>
        </div>
      </div>
    </section>
  );
};

// =====================================================================
// PDF GENERATION — visual, branded, page-balanced
// =====================================================================

type Color = [number, number, number];

const C = {
  ink:        [14, 14, 14] as Color,
  inkMute:    [90, 86, 80] as Color,
  inkFaint:   [139, 134, 125] as Color,
  ember:      [217, 71, 42] as Color,
  emberDeep:  [181, 58, 32] as Color,
  emberSoft:  [251, 233, 226] as Color,
  moss:       [63, 94, 74] as Color,
  mossSoft:   [228, 236, 229] as Color,
  paper:      [255, 255, 255] as Color,
  paperWarm:  [242, 237, 229] as Color,
  paperLine:  [229, 223, 211] as Color,
};

function hexToRgb(hex: string): Color {
  const m = hex.replace('#', '').match(/.{1,2}/g);
  return m ? [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)] : [0, 0, 0];
}

function generatePDF(jsPDF: any, results: any, responses: FormState) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();   // 210
  const H = doc.internal.pageSize.getHeight();  // 297
  const M = 18;
  const CW = W - 2 * M;

  const setFill = (c: Color) => doc.setFillColor(c[0], c[1], c[2]);
  const setStroke = (c: Color) => doc.setDrawColor(c[0], c[1], c[2]);
  const setText = (c: Color) => doc.setTextColor(c[0], c[1], c[2]);

  const drawPill = (x: number, y: number, label: string, fill: Color, textColor: Color, width: number) => {
    const h = 6.5;
    setFill(fill);
    doc.roundedRect(x, y, width, h, 3.25, 3.25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    setText(textColor);
    doc.text(label.toUpperCase(), x + width / 2, y + h / 2 + 1.1, { align: 'center' });
  };

  // ===================================================================
  // PAGE 1 — Cover & Score
  // ===================================================================
  let y = 18;

  // Logo: "Ops" + ember triangle + "elta"
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  setText(C.ink);
  doc.text('Ops', M, y);
  const opsW = doc.getTextWidth('Ops');

  // Triangle in place of Greek Δ (jsPDF core fonts lack Greek glyphs)
  const triH = 4.8;
  const triW = 4.8;
  const triLeft = M + opsW + 0.6;
  const triBaseY = y + 0.4;
  setFill(C.ember);
  doc.triangle(
    triLeft, triBaseY,
    triLeft + triW, triBaseY,
    triLeft + triW / 2, triBaseY - triH,
    'F',
  );

  setText(C.ink);
  doc.text('elta', triLeft + triW + 1.2, y);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(C.inkMute);
  doc.text('Process automation diagnostic', M, y + 5);

  // Date
  setText(C.inkFaint);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  const dateStr = new Date()
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
  doc.text(dateStr, W - M, y, { align: 'right' });

  y += 10;
  setStroke(C.paperLine);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 16;

  // Eyebrow
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setText(C.inkFaint);
  doc.text('AUTOMATION POTENTIAL', M, y);

  // Big score number
  doc.setFont('times', 'bold');
  doc.setFontSize(72);
  setText(C.ink);
  doc.text(`${results.totalScore}`, M, y + 22);

  // /100 potential stacked next to score
  const scoreWidth = doc.getTextWidth(`${results.totalScore}`);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(C.inkFaint);
  doc.text('/ 100', M + scoreWidth + 3, y + 14);
  doc.text('potential', M + scoreWidth + 3, y + 19);

  // Pills on right (vertically stacked)
  const pillX = W - M - 50;
  let pillY = y - 1;

  const priorityCfg = ({
    critical: { fill: C.ember, text: C.paper },
    high:     { fill: C.emberSoft, text: C.emberDeep },
    medium:   { fill: C.paperWarm, text: C.ink },
    low:      { fill: C.paperWarm, text: C.inkMute },
  } as const)[results.priorityBand as PriorityBand];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setText(C.inkFaint);
  doc.text('PRIORITY', pillX, pillY);
  drawPill(pillX, pillY + 2, results.priorityBand, priorityCfg.fill, priorityCfg.text, 50);

  pillY += 14;

  const confCfg = ({
    high:   { fill: C.mossSoft, text: C.moss },
    medium: { fill: C.paperWarm, text: C.ink },
    low:    { fill: C.paperWarm, text: C.inkMute },
  } as const)[results.confidenceLevel as ConfidenceLevel];

  setText(C.inkFaint);
  doc.text('CONFIDENCE', pillX, pillY);
  drawPill(pillX, pillY + 2, results.confidenceLevel, confCfg.fill, confCfg.text, 50);

  // Score progress bar below
  y += 30;
  setFill(C.paperLine);
  doc.roundedRect(M, y, CW, 1.8, 0.9, 0.9, 'F');
  setFill(C.ink);
  doc.roundedRect(M, y, CW * (results.totalScore / 100), 1.8, 0.9, 0.9, 'F');

  y += 14;

  // Process section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setText(C.inkFaint);
  doc.text('PROCESS ASSESSED', M, y);
  y += 6;
  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  setText(C.ink);
  const procText = doc.splitTextToSize(responses.primaryProcess || '(not specified)', CW);
  doc.text(procText, M, y);
  y += procText.length * 6 + 6;

  // Bottleneck
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setText(C.inkFaint);
  doc.text('PRIMARY FRICTION', M, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setText(C.inkMute);
  const bnText = doc.splitTextToSize(`\u201C${results.bottleneck}\u201D`, CW);
  doc.text(bnText, M, y);
  y += bnText.length * 5 + 12;

  // Stat cards
  const cardW = (CW - 8) / 3;
  const cardH = 28;

  const drawStatCard = (cx: number, cy: number, label: string, value: string, valueColor: Color, bg: Color) => {
    setFill(bg);
    doc.roundedRect(cx, cy, cardW, cardH, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    setText(C.inkFaint);
    doc.text(label.toUpperCase(), cx + 5, cy + 7);
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    setText(valueColor);
    doc.text(value, cx + 5, cy + 22);
  };

  drawStatCard(M, y, 'Weekly hour leak', `${results.weeklySavings}h`, C.ink, C.paperWarm);
  drawStatCard(
    M + cardW + 4, y, 'Break-even',
    results.breakEvenMonths === null ? 'Never' : `${results.breakEvenMonths}mo`,
    results.breakEvenMonths === null ? C.ember : C.ink,
    C.paperWarm,
  );
  drawStatCard(M + 2 * (cardW + 4), y, 'Annual value', gbp(results.annualValueGBP), C.ember, C.emberSoft);

  // ===================================================================
  // PAGE 2 — Analysis: dimensions + recommendations
  // ===================================================================
  doc.addPage();
  y = 18;

  // Dimension breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setText(C.inkFaint);
  doc.text('DIMENSION BREAKDOWN', M, y);
  y += 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  setText(C.ink);
  doc.text('What is driving the score', M, y);
  y += 12;

  results.dimensions.forEach((dim: any) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setText(C.ink);
    doc.text(dim.label, M, y);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    setText(C.inkFaint);
    const valueStr = `${dim.score.toFixed(1)} / 10  \u00B7  ${Math.round(dim.weight * 100)}% weight`;
    doc.text(valueStr, W - M, y, { align: 'right' });

    y += 3;

    setFill(C.paperLine);
    doc.roundedRect(M, y, CW, 1.8, 0.9, 0.9, 'F');
    setFill(hexToRgb(dim.color));
    doc.roundedRect(M, y, CW * (dim.score / 10), 1.8, 0.9, 0.9, 'F');

    y += 11;
  });

  y += 6;

  // Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setText(C.inkFaint);
  doc.text('EXECUTION ROADMAP', M, y);
  y += 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  setText(C.ink);
  doc.text('What to do about it', M, y);
  y += 10;

  const typePillStyle = (type: string) => {
    if (type === 'immediate') return { fill: C.emberSoft, text: C.emberDeep };
    if (type === 'structural') return { fill: C.ink, text: C.paper };
    return { fill: C.mossSoft, text: C.moss };
  };

  results.recommendations.forEach((rec: any, idx: number) => {
    const desc = doc.splitTextToSize(rec.description, CW);
    const titleLines = doc.splitTextToSize(rec.title, CW - 30);
    const blockHeight = 8 + titleLines.length * 5.5 + desc.length * 4.2 + 6;

    if (y + blockHeight > H - 22) {
      doc.addPage();
      y = 18;
    }

    // Number + type pill on same line
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    setText(C.inkFaint);
    doc.text(`${String(idx + 1).padStart(2, '0')}`, M, y);

    const typeStyle = typePillStyle(rec.type);
    drawPill(M + 8, y - 4, rec.type, typeStyle.fill, typeStyle.text, 22);

    y += 5;

    // Title
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    setText(C.ink);
    doc.text(titleLines, M, y);
    y += titleLines.length * 5.5 + 2;

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setText(C.inkMute);
    doc.text(desc, M, y);
    y += desc.length * 4.2 + 7;
  });

  // ===================================================================
  // METHODOLOGY (continues on current page or moves to next)
  // ===================================================================
  if (y > H - 95) {
    doc.addPage();
    y = 18;
  } else {
    y += 4;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setText(C.inkFaint);
  doc.text('METHODOLOGY', M, y);
  y += 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  setText(C.ink);
  doc.text('How we calculated this', M, y);
  y += 10;

  // Methodology card
  const methH = 64;
  setFill(C.paperWarm);
  doc.roundedRect(M, y, CW, methH, 3, 3, 'F');

  const colW = (CW - 12) / 2;

  // Left column: Score formula
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  setText(C.inkFaint);
  doc.text('SCORE FORMULA', M + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(C.ink);
  const formulaLines = [
    `Manual Burden  ${pct(DIMENSION_WEIGHTS.manualBurden)}`,
    `Errors  ${pct(DIMENSION_WEIGHTS.errorFrequency)}`,
    `Process Complexity  ${pct(DIMENSION_WEIGHTS.processComplexity)}`,
    `Speed  ${pct(DIMENSION_WEIGHTS.speedRequirement)}`,
  ];
  let fy = y + 14;
  formulaLines.forEach((line) => { doc.text(line, M + 6, fy); fy += 5; });

  // Right column: ROI assumptions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  setText(C.inkFaint);
  doc.text('ROI ASSUMPTIONS', M + colW + 12, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(C.ink);
  const roiLines = [
    `Implementation: ${gbp(results.methodology.implementationCostGBP)} one-off`,
    `Maintenance: ${gbp(results.methodology.monthlyMaintenanceGBP)}/month`,
    `Hourly rate: ${gbp(results.methodology.hourlyRateGBP)}`,
    `Hours/week: ${results.methodology.weeklyHoursAssumed}`,
  ];
  fy = y + 14;
  roiLines.forEach((line) => { doc.text(line, M + colW + 12, fy); fy += 5; });

  // ROI calc spans bottom
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  setText(C.inkFaint);
  doc.text('ROI CALCULATION', M + 6, y + 46);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  setText(C.ink);
  const roiCalc = doc.splitTextToSize(results.methodology.roiFormula, CW - 12);
  doc.text(roiCalc, M + 6, y + 52);

  y += methH + 6;

  // Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  setText(C.inkFaint);
  const disclaim = doc.splitTextToSize(
    'Working assumptions for the report, not a quote. Actual scope and pricing depend on your specific workflow.',
    CW,
  );
  doc.text(disclaim, M, y);
  y += disclaim.length * 4 + 14;

  // Next Steps panel
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setText(C.inkFaint);
  doc.text('NEXT STEPS', M, y);
  y += 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  setText(C.ink);
  doc.text('Where to go from here', M, y);
  y += 12;

  // Three numbered steps
  const steps = [
    {
      n: '01',
      title: 'Pick the highest-impact recommendation',
      body: 'From the roadmap on the previous pages, choose one item flagged IMMEDIATE and commit to shipping it within two weeks.',
    },
    {
      n: '02',
      title: 'Document the chosen workflow end-to-end',
      body: 'Two to three hours of writing surfaces more than half the eventual automation spec. This becomes your build brief.',
    },
    {
      n: '03',
      title: 'Book a 15-minute call when ready',
      body: 'opsdelta.vercel.app — walk through architecture options on the spot. No pitch, no obligation.',
    },
  ];

  steps.forEach((s) => {
    if (y + 18 > H - 22) { doc.addPage(); y = 18; }
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    setText(C.ember);
    doc.text(s.n, M, y);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    setText(C.ink);
    doc.text(s.title, M + 10, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setText(C.inkMute);
    const bodyLines = doc.splitTextToSize(s.body, CW - 10);
    doc.text(bodyLines, M + 10, y);
    y += bodyLines.length * 4.2 + 6;
  });

  // ===================================================================
  // FOOTER ON ALL PAGES
  // ===================================================================
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setText(C.inkFaint);
    doc.text('OpsDelta \u00B7 opsdelta.vercel.app', M, H - 10);
    doc.text(`${i} / ${totalPages}`, W - M, H - 10, { align: 'right' });
  }

  // Save
  const slug = (responses.primaryProcess || 'workflow')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40) || 'workflow';
  const date = new Date().toISOString().split('T')[0];
  doc.save(`OpsDelta-Report-${slug}-${date}.pdf`);
}

// =====================================================================
// PRESENTATION COMPONENTS
// =====================================================================

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * score) / 100;
  return (
    <div className="relative w-[220px] h-[220px]">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} stroke="#E5DFD3" strokeWidth="6" fill="none" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#0E0E0E"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-[2000ms] ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl font-semibold text-ink leading-none tracking-tightest">
          {score}
        </span>
        <span className="text-xs text-ink-faint mt-2 font-mono uppercase tracking-widest">
          / 100 potential
        </span>
      </div>
    </div>
  );
};

const PriorityBadge: React.FC<{ band: PriorityBand }> = ({ band }) => {
  const map = {
    critical: { label: 'Critical', cls: 'bg-ember text-paper' },
    high: { label: 'High', cls: 'bg-ember-soft text-ember-deep border border-ember/20' },
    medium: { label: 'Medium', cls: 'bg-paper-warm text-ink border border-paper-line' },
    low: { label: 'Low', cls: 'bg-paper-warm text-ink-mute border border-paper-line' },
  };
  const { label, cls } = map[band];
  return (
    <div className={`flex-1 px-4 py-3 rounded-xl text-center ${cls}`}>
      <div className="text-[10px] font-mono uppercase tracking-widest opacity-60">Priority</div>
      <div className="font-display text-lg font-semibold mt-0.5">{label}</div>
    </div>
  );
};

const ConfidenceBadge: React.FC<{ level: ConfidenceLevel }> = ({ level }) => {
  const map = {
    high: { label: 'High', cls: 'bg-moss-soft text-moss border border-moss/20' },
    medium: { label: 'Medium', cls: 'bg-paper-warm text-ink border border-paper-line' },
    low: { label: 'Low', cls: 'bg-paper-warm text-ink-mute border border-paper-line' },
  };
  const { label, cls } = map[level];
  return (
    <div className={`flex-1 px-4 py-3 rounded-xl text-center ${cls}`}>
      <div className="text-[10px] font-mono uppercase tracking-widest opacity-60">Confidence</div>
      <div className="font-display text-lg font-semibold mt-0.5">{label}</div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'warn' | 'calm';
}> = ({ icon, label, value, tone }) => (
  <div className={`p-8 ${tone === 'warn' ? 'bg-ember-soft' : tone === 'calm' ? 'bg-moss-soft' : 'bg-paper-card'}`}>
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span className="eyebrow">{label}</span>
    </div>
    <div className="font-display text-3xl font-semibold text-ink tracking-tighter">{value}</div>
  </div>
);
