# Pact Loop: interactive prototype

A frontend-only, desktop-only prototype of Pact's five-stage loop
(Signal → Act → Surface → Decide → Learn), built for a portfolio.
The flow is scripted: a guide strip at the top shows each step, and the next thing to click pulses.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/ (hash routes, so any static host works)
```
Below 1280 px wide the app shows a "screen too small" message. Restart the demo from the ↺ button in
the guide strip, or from the avatar menu → *Reset demo data*.

## How it's put together
| Path | What |
|---|---|
| `src/index.css`, `src/components/{ui,shared,chat,editor,charts}` | Design layer, copied unchanged from `../pact-prototype` (tokens, Inter 13px, shadcn-style components). Added: `.demo-pulse` highlight and a `format` option on `TargetBarChart`. |
| `src/components/layout` | App frame from the reference (sidebar rail, top bar, page header, ⌘K, Ask Pact panel), wired to this demo |
| `src/demo/script.ts` | The fixed script: every step, its loop stage, hint and route |
| `src/demo/DemoGuide.tsx` | The guide strip: loop tracker, current step, Skip time, Restart |
| `src/store` | Zustand store saved in the browser: the fake backend |
| `src/features/onboarding` | Setup: Connect, Learn the business (upload documents or answer questions), Plan |
| `src/data/documents.ts` | Sample documents for the fake upload: pitch deck, ICP doc, playbook, messaging, interview notes, customer list |
| `src/pages` | Home (Turn 1 starts here) |

## Demo decisions (open questions on the workflow board)
- Unanswered queue items roll into a daily digest
- Pact sends from the founder's connected Gmail
- Answers to buyers' AI agents: pre-approved answers, marked "Next"
- Autonomy pauses itself after 2 edits in a row (on by default)
- Cold start: day-one import from past email

All people, companies and numbers are fictional.

## Status
- [x] Phase 1: project, design layer, demo script and guide, setup (Connect, Learn, Plan), Home
- [ ] Phase 2: Turn 1, Find and Win (signal, account record, queue, draft sheet, call brief, learning, autonomy)
- [ ] Phase 3: Turn 2, Deliver and Grow (promises, renewal risk, human expert, plan progress), finish card
