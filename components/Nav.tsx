import React, { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface NavProps {
  onStart?: () => void;
  minimal?: boolean;
}

export const Nav: React.FC<NavProps> = ({ onStart, minimal = false }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-paper/80 backdrop-blur-md border-b border-paper-line' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-2xl font-semibold tracking-tightest text-ink leading-none">
            Ops<span className="text-ember italic">Δ</span>elta
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] text-ink-faint font-mono">
            v0.1
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#how" className="text-sm text-ink-mute hover:text-ink transition-colors">How it works</a>
          <a href="#about" className="text-sm text-ink-mute hover:text-ink transition-colors">About</a>
          <a
            href="https://calendly.com/agim-harizaj/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ink-mute hover:text-ink transition-colors flex items-center gap-1"
          >
            Book a call
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </nav>

        {!minimal && onStart && (
          <button
            onClick={onStart}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink text-paper text-sm font-medium hover:bg-ember transition-colors"
          >
            Start audit
          </button>
        )}
      </div>
    </header>
  );
};
