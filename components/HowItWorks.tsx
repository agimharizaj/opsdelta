import React from 'react';

const steps = [
  {
    n: '01',
    title: 'Map your workflow',
    description:
      'Eleven targeted questions about your team, tools, and the single process eating most of your week.',
  },
  {
    n: '02',
    title: 'See the numbers',
    description:
      'A precision score, your weekly hour leak, projected annual value, and the specific bottleneck holding you back.',
  },
  {
    n: '03',
    title: 'Get the roadmap',
    description:
      'Up to five personalised recommendations, plus an optional 15-minute call to walk through implementation.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how" className="py-24 md:py-32 border-t border-ink/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-baseline gap-6 mb-16">
          <span className="section-number">/ 01</span>
          <h2 className="display-tight text-4xl md:text-5xl">
            How the audit works.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-ink/10 border border-ink/10 rounded-2xl overflow-hidden">
          {steps.map((step) => (
            <div
              key={step.n}
              className="bg-paper p-10 md:p-12 hover:bg-paper-warm transition-colors"
            >
              <div className="font-mono text-sm text-ember mb-8">{step.n}</div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-4 text-ink">
                {step.title}
              </h3>
              <p className="text-ink-mute leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
