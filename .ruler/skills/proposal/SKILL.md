---
name: proposal
description: Write a proposal, plan, RFC, design doc or explainer as one self-contained HTML page that helps people make one decision — plain words, one picture per section, motion only where it explains something. Use when asked for a proposal, a plan page, an RFC, a design doc or an explainer.
---

# Proposal

One HTML page that helps people make a decision. How you build it is up to you; these are the values.

- **A newcomer gets it fast.** The problem, who it hurts, the change and why it might work are clear from the
  top of the page. Know the reader and the decision; if nobody said, infer them and say so.
- **Plain words.** Talk like a person. No slogans, no dramatic contrasts, no filler.
- **Pictures carry it.** Each section is a plain headline, a line or two, and one diagram drawn for this
  argument: a flow, a before/after, a map of what exists, a comparison. Inline SVG at real size, text 13px or
  larger. Boxes of text joined by arrows are still text. Evidence and detail go in `<details>` blocks.
- **Motion explains or it goes.** Animate order, flow, timing or change (a request travelling an arrow, a
  before turning into an after). Nothing decorative. Under `prefers-reduced-motion` and in screenshots the
  finished frame must be the complete picture.
- **Honest.** Say what is measured, simulated or guessed. Cite files and links. No invented numbers; an
  animated race is illustrative unless you measured it.
- **One decision.** End with a clear recommendation.

## Mechanics

- One `.html` file, inline CSS. Colors as tokens on `:root`, with a dark set under
  `@media (prefers-color-scheme: dark)`. No build step.
- Every `<svg>` gets `role="img"` and an `aria-label`, `width`/`height` equal to its `viewBox`, inside a
  figure that scrolls sideways on phones, so text never shrinks below 13px.
- Set `html.motion` in `<head>` only when reduced motion is not requested, and hide start states only under
  that class; otherwise reduced-motion readers and screenshots get blank diagrams.
- `localStorage` can throw (private windows, sandboxed iframes): wrap it in `try`.

## Done means checked

Screenshot the page at 1200px and 375px wide in light and dark (Playwright). Then read only the headlines and
the pictures: if the story is not there, it is not finished. `dashboard/decisions.html` in this repo follows
these rules.
