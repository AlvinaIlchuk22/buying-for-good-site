# Buying for Good — concept build

A storytelling website built from the public Upwork brief "Website Developer for Storytelling Site". It demonstrates approach, motion and form quality. It is **not** the live Buying for Good site; all copy is sample copy and all media are placeholders.

## Run locally
```bash
cd ~/buying-for-good-site
python3 serve.py        # no-cache dev server (use this, not http.server, so you never see stale files)
# open http://localhost:8782/index.html
```
Add `?simulate=fail` to the URL to demo the failed-submission experience on both forms.

## Stack
Plain HTML, CSS and JavaScript. GSAP 3.12 + ScrollTrigger from cdnjs. No build step, so it deploys as a static site (Vercel "Framework: Other").

## How the brief maps to the build
| Brief requirement | Where |
|---|---|
| Six-step story (Curiosity → Action) | Left story rail, progress bar, `data-stage` on sections |
| Opening headline over ocean at sunrise | `.hero` — layered sky, rising sun, drifting waves |
| Eight moving information cards | `.cards` — pinned horizontal scroll (desktop), stacked on mobile |
| Three gentle photo bands | `.bands` — slow drifting rows (CSS) |
| Four "What if" cards | `.whatif` |
| Reveal of the three figures in the logo | `#logoReveal` |
| Three stakeholder cards | `.welcome .scard` |
| Selectable stakeholder tabs | `#howTabs` (ARIA tabs, arrow keys, sliding ink) |
| Ripple: five purchases → shared impact → six charity photos | `#ripple` — pinned, scrubbed GSAP timeline |
| Trust: money flow, expandable governance, founder's promise | `#trust` |
| Crowd-video transition | `#crowd` — window expands to full-bleed |
| Three expanding audience choices, benefits and grouped FAQs | `#audience` + `AUD` / `COMMON` data in `script.js` |
| Jigsaw invitation | `#jigsaw` |
| Registration with questions per audience | `#regForm` — conditional fieldsets (hidden + disabled so they are not validated or sent) |
| Separate consent to respond vs updates | two independent checkboxes, stored as `consentRespond` / `consentUpdates` |
| Reliable save, duplicate prevention, failed submissions | `script.js` section 5 (demo uses localStorage; see "Going live") |
| Separate contact form (no registration / no subscription) | `contact.html` |
| Privacy and website terms pages | `privacy.html`, `terms.html` (placeholder text) |
| Phone usability, reduced motion, accessibility | `gsap.matchMedia()` branches, skip link, focus styles, ARIA, error summary |

## Going live (what is intentionally a stub)
1. **Form storage and email:** set `CONFIG.endpoint` / `CONFIG.contactEndpoint` in `script.js` to a real serverless endpoint. The server must enforce a **unique email constraint** (client-side duplicate check is only a convenience), store both consents separately, send the confirmation email, and return clear errors.
2. **Editable content for the client:** either move to Webflow/CMS, or keep this code and connect a lightweight headless CMS for wording, images and FAQs. List which parts the client can edit and which need a developer (required in the brief).
3. **Analytics:** agreed visitor + registration events (privacy-friendly option recommended).
4. **Real media:** see `ASSETS.md`.
5. **Real copy, figures, policy pages:** from the client's Website Plan. The 70/20/10 money split is illustrative only.
