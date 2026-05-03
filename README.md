# OpsDelta

A free three-minute diagnostic for founders and operations leads. See where your operation is leaking time, get a personalised automation roadmap, and book a call to execute.

Live: [opsdelta.vercel.app](https://opsdelta.vercel.app)

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind 3
- Fraunces (display) + Inter (body) + JetBrains Mono (data), all via Google Fonts
- jsPDF for the downloadable report
- Formspree for lead capture

## Local development

```bash
npm install
npm run dev    # starts on http://localhost:3000 (or next free port)
```

## Build

```bash
npm run build       # type-checks then builds
npm run build:fast  # skip the type-check
npm run typecheck   # standalone type-check
```

## Project layout

```
.
├── App.tsx                  # routes between landing and results
├── index.tsx                # mount point + global CSS
├── index.html               # meta, OG, fonts
├── index.css                # tailwind base + tokens + components
├── tailwind.config.js       # ember/moss/paper/ink palette + Fraunces/Inter/Mono
├── types.ts                 # FormState + DiagnosticResult contracts
├── scoring.ts               # scoring engine (dimensions, priority, confidence, ROI)
├── constants.ts             # diagnostic questions
├── analytics.ts             # console-based event logging
├── components/
│   ├── Nav.tsx              # sticky top nav
│   ├── Hero.tsx             # editorial hero + stats strip
│   ├── HowItWorks.tsx       # numbered three-step explainer
│   ├── DiagnosticForm.tsx   # multi-step form with autosave
│   ├── ResultsView.tsx      # report, lead capture, calendly, PDF export
│   ├── About.tsx            # operator credibility section
│   └── Footer.tsx
└── public/
    ├── favicon.svg
    └── og-image.svg
```

## Configuration

| What             | Where                                                          |
| ---------------- | -------------------------------------------------------------- |
| Formspree ID     | `components/ResultsView.tsx` (constant near the top of submit) |
| Calendly URL     | `Nav.tsx`, `Hero.tsx`, `About.tsx`, `Footer.tsx`, `ResultsView.tsx` |
| Site URL for PDF / OG | `index.html` (meta), `ResultsView.tsx` (`SITE_URL`)        |
| Contact email    | `About.tsx`, `Footer.tsx`, `ResultsView.tsx` (error fallback)  |

## Deployment

Push to `main`, Vercel auto-deploys.

## Localisation

British English throughout. American spellings should be treated as bugs.

## License

Built for OpsDelta. All rights reserved.
