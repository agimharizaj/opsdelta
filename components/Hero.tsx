import React from 'react';
import { ArrowDown, ArrowUpRight, Clock } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden">
      {/* Soft background flourish */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-32 w-[42rem] h-[42rem] rounded-full bg-ember/5 blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[34rem] h-[34rem] rounded-full bg-moss/5 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Eyebrow */}
        <div className="rise rise-1 flex items-center gap-3 mb-10">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-ember animate-pulse" />
          <span className="eyebrow">A diagnostic for operators</span>
          <span className="text-ink-faint">·</span>
          <span className="eyebrow flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> ~3 minutes
          </span>
        </div>

        {/* Headline */}
        <h1 className="rise rise-2 display text-[clamp(3rem,9vw,7.5rem)] text-ink max-w-5xl">
          Find the hours your operation is{' '}
          <em className="text-ember not-italic relative">
            quietly leaking
            <svg
              className="absolute left-0 -bottom-2 w-full"
              viewBox="0 0 100 8"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M0,5 Q25,0 50,4 T100,3"
                stroke="#D9472A"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </em>
          .
        </h1>

        {/* Lede */}
        <p className="rise rise-3 mt-10 text-lg md:text-xl text-ink-mute max-w-2xl leading-relaxed">
          A free three-minute diagnostic for founders and operations leaders.
          See where your team is losing time, get a personalised automation roadmap,
          then if you wish, you can book a call to execute.
        </p>

        {/* CTAs */}
        <div className="rise rise-4 mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button onClick={onStart} className="btn-primary text-base px-8 py-4">
            Start the audit
            <ArrowDown className="w-4 h-4" />
          </button>
          <a
            href="https://calendly.com/agim-harizaj/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-base px-8 py-4"
          >
            Skip ahead, book a call
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Proof strip */}
        <div className="rise rise-5 mt-20 pt-10 border-t border-ink/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
            <Stat figure="3 min" label="Average completion time" />
            <Stat figure="11" label="Diagnostic questions" />
            <Stat figure="5" label="Tailored recommendations" />
            <Stat figure="$0" label="Zero obligation, free PDF report" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat: React.FC<{ figure: string; label: string }> = ({ figure, label }) => (
  <div>
    <div className="font-display text-3xl md:text-4xl font-semibold text-ink tracking-tighter">
      {figure}
    </div>
    <div className="mt-1 text-xs text-ink-mute leading-snug max-w-[14ch]">{label}</div>
  </div>
);
