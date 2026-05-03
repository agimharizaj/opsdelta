import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-24 md:py-32 border-t border-ink/10 bg-paper-warm/40">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-baseline gap-6 mb-6">
          <span className="section-number">/ 03</span>
          <h2 className="display-tight text-4xl md:text-5xl">Built by an operator. For operators.</h2>
        </div>

        <p className="font-display text-2xl md:text-3xl text-ink leading-snug tracking-tight max-w-3xl mt-12">
          After scaling operations at{' '}
          <a
            href="https://www.thanksben.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-deep underline decoration-ember/30 underline-offset-4 hover:decoration-ember"
          >
            Ben
          </a>
          , the same pattern shows up in every founder team I speak to: fifteen to
          twenty hours a week vanishing into copy-paste, manual handoffs, and tools
          that nearly, but never quite, talk to each other.
        </p>

        <p className="mt-8 text-lg text-ink-mute leading-relaxed max-w-3xl">
          OpsDelta exists to find those hours, name them, and put a number on what they cost you.
          You leave with a roadmap. If you want help executing it, the next step is one click away.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 items-start">
          <a
            href="https://www.linkedin.com/in/agim-harizaj/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            Connect on LinkedIn
            <ArrowUpRight className="w-4 h-4" />
          </a>
          <a
            href="https://calendly.com/agim-harizaj/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Book a 15-minute call
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
