import React, { useState, useEffect } from 'react';
import { QUESTIONS } from '../constants';
import { FormState } from '../types';
import { ArrowLeft, ArrowRight, Check, Info } from 'lucide-react';

interface DiagnosticFormProps {
  initialState: FormState;
  initialStep: number;
  onComplete: (state: FormState) => void;
  onStepChange: (step: number) => void;
}

export const DiagnosticForm: React.FC<DiagnosticFormProps> = ({
  initialState,
  initialStep,
  onComplete,
  onStepChange,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep || 1);
  const [formData, setFormData] = useState<FormState>(initialState);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    onStepChange(currentStep);
    setShowTooltip(false);
  }, [currentStep, onStepChange]);

  const currentQuestion = QUESTIONS[currentStep - 1];
  const progress = (currentStep / QUESTIONS.length) * 100;

  const setValue = (id: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const isValid = () => {
    const v = formData[currentQuestion.id];
    return typeof v === 'string' && v.trim().length > 0;
  };

  const useExample = () => {
    if (currentQuestion.example) setValue(currentQuestion.id, currentQuestion.example);
  };

  return (
    <div className="card overflow-hidden">
      {/* Progress header */}
      <div className="px-8 md:px-10 pt-8 pb-6 border-b border-paper-line">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-3">
            <span className="section-number">/ 02</span>
            <span className="text-sm text-ink-mute">
              Question <span className="font-medium text-ink">{currentStep}</span>{' '}
              <span className="text-ink-faint">of {QUESTIONS.length}</span>
            </span>
          </div>
          <span className="font-mono text-xs text-ink-faint">{Math.round(progress)}%</span>
        </div>
        <div className="h-[3px] w-full bg-paper-line rounded-full overflow-hidden">
          <div
            className="h-full bg-ink transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question body */}
      <div className="px-8 md:px-10 py-12 min-h-[420px]">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between gap-6 mb-10">
            <h2 className="display-tight text-2xl md:text-3xl text-ink flex-1 leading-tight">
              {currentQuestion.text}
            </h2>
            {currentQuestion.tooltip && (
              <div className="relative shrink-0">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip((s) => !s)}
                  className="text-ink-faint hover:text-ember transition-colors p-1"
                  aria-label="Why we ask"
                >
                  <Info className="w-5 h-5" />
                </button>
                {showTooltip && (
                  <div className="absolute right-0 top-10 w-72 bg-ink text-paper text-sm p-4 rounded-xl shadow-soft z-50">
                    <div className="eyebrow text-ember mb-2">Why we ask</div>
                    <p className="leading-relaxed">{currentQuestion.tooltip}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Radio options */}
          {currentQuestion.type === 'radio' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => {
                const selected = formData[currentQuestion.id] === option;
                return (
                  <label
                    key={option}
                    className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all ${
                      selected
                        ? 'border-ink bg-ink text-paper'
                        : 'border-paper-line bg-paper-card hover:border-ink/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      className="hidden"
                      checked={selected}
                      onChange={() => setValue(currentQuestion.id, option)}
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selected ? 'border-paper bg-paper' : 'border-ink/20 bg-paper-card'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 text-ink stroke-[3px]" />}
                    </div>
                    <span className={`text-base font-medium ${selected ? 'text-paper' : 'text-ink'}`}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Text and textarea */}
          {(currentQuestion.type === 'text' || currentQuestion.type === 'textarea') && (
            <div className="space-y-3">
              {currentQuestion.type === 'text' ? (
                <input
                  type="text"
                  placeholder={currentQuestion.placeholder}
                  className="input-field text-lg"
                  value={formData[currentQuestion.id] || ''}
                  onChange={(e) => setValue(currentQuestion.id, e.target.value)}
                />
              ) : (
                <textarea
                  placeholder={currentQuestion.placeholder}
                  rows={5}
                  className="input-field text-lg resize-none"
                  value={formData[currentQuestion.id] || ''}
                  onChange={(e) => setValue(currentQuestion.id, e.target.value)}
                />
              )}
              {currentQuestion.example && (
                <button
                  onClick={useExample}
                  className="text-xs text-ember hover:text-ember-deep transition-colors flex items-center gap-1.5"
                >
                  <span className="font-mono">↳</span>
                  Use the example: "{currentQuestion.example}"
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 md:px-10 py-6 border-t border-paper-line bg-paper-warm/40 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            currentStep === 1
              ? 'text-ink-faint cursor-not-allowed'
              : 'text-ink-mute hover:text-ink'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!isValid()}
          className={`btn-primary ${!isValid() && 'opacity-30 cursor-not-allowed hover:bg-ink hover:translate-y-0'}`}
        >
          {currentStep === QUESTIONS.length ? 'Generate report' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
