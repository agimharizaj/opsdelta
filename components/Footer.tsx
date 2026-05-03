import React, { useState } from 'react';
import { ContactModal } from './ContactModal';

export const Footer: React.FC = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-ink/10 py-14 print:hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-xl font-semibold tracking-tight">
                Ops<span className="text-ember italic">Δ</span>elta
              </span>
              <span className="text-xs text-ink-faint font-mono">v0.1</span>
            </div>

            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-mute items-center">
              <a href="#how" className="hover:text-ink transition-colors">How it works</a>
              <a href="#about" className="hover:text-ink transition-colors">About</a>
              <a
                href="https://calendly.com/agim-harizaj/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                Book a call
              </a>
              <button
                onClick={() => setContactOpen(true)}
                className="hover:text-ink transition-colors bg-transparent border-none p-0 cursor-pointer text-sm font-sans text-ink-mute"
              >
                Contact
              </button>
              <a
                href="https://www.linkedin.com/in/agim-harizaj/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                LinkedIn
              </a>
            </nav>

            <div className="text-xs text-ink-faint font-mono">
              © {new Date().getFullYear()} OpsDelta
            </div>
          </div>
        </div>
      </footer>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
};
