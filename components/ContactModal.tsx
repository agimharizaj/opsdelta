import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { analytics } from '../analytics';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  // Lock body scroll while modal is open and close on Escape
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Reset state when reopened after a previous successful submit
  useEffect(() => {
    if (open) {
      setError(false);
      if (submitted) {
        setName(''); setEmail(''); setMessage(''); setSubmitted(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const response = await fetch('https://formspree.io/f/mdaoepnz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'contact_form',
          name,
          email,
          message,
          timestamp: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setSubmitted(true);
        analytics.track('contact_form_submitted');
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg card p-8 md:p-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-ink-faint hover:text-ink hover:bg-paper-warm transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-moss-soft mb-5">
              <CheckCircle2 className="w-6 h-6 text-moss" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-ink mb-3">Message received.</h3>
            <p className="text-ink-mute leading-relaxed">
              Thanks for reaching out. I'll get back to you within 24 hours, usually faster.
            </p>
            <button onClick={onClose} className="btn-ghost mt-8">Close</button>
          </div>
        ) : (
          <>
            <div className="eyebrow mb-3">/ Contact</div>
            <h3 id="contact-title" className="display-tight text-3xl text-ink mb-3">
              Get in touch.
            </h3>
            <p className="text-ink-mute leading-relaxed mb-7">
              Question, suggestion, partnership idea, or just want to say hi.
              I read every message personally.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="eyebrow block mb-2">Your name</label>
                <input
                  id="contact-name"
                  required
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="eyebrow block mb-2">Email</label>
                <input
                  id="contact-email"
                  required
                  type="email"
                  className="input-field"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="eyebrow block mb-2">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  className="input-field resize-none"
                  placeholder="What's on your mind?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending</>
                ) : (
                  <>Send message <Send className="w-4 h-4" /></>
                )}
              </button>

              {error && (
                <p className="text-xs text-ember-deep flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Something broke. Try again, or email agim.harizaj@hotmail.com directly.
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};
