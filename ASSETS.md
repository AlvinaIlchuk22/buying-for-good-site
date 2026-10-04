# Asset shot list (add stage by stage)

Every placeholder on the site is a `.ph` element with a label. To swap in real media, set one inline variable on that element:

```html
<div class="ph ph-a" data-label="Ocean sunrise" style="--img:url(assets/band1-sunrise.jpg)"></div>
```
(the label chip and pattern hide automatically once `--img` is set.)

Save files into `assets/`. Photos: ~1600px wide JPG, quality ~75. Video: MP4 H.264, under 6 MB, muted, loopable.

## Stage 1 — Hero + story bands (highest impact)
| File | Where | Idea |
|---|---|---|
| `hero-ocean.mp4` (or jpg) | Hero background | Calm ocean at sunrise, slow motion, warm gold light, no people |
| `band1-*.jpg` x4 | Photo band 1 | Ocean sunrise, surf club volunteers, local market, headland walk |
| `band2-*.jpg` x4 | Photo band 2 | Community garden, cafe regulars, kids' sports day, farm gate stall |
| `band3-*.jpg` x4 | Photo band 3 | Wildlife carers, main street, beach clean-up, bakery morning |

Style: warm, natural light, Australian coastal town, real-feeling people, not stock-posed. Teal/navy accents welcome.

## Stage 2 — Ripple + causes
| File | Where |
|---|---|
| `cause-wildlife.jpg`, `cause-lifesavers.jpg`, `cause-food.jpg`, `cause-youth.jpg`, `cause-reef.jpg`, `cause-aged-care.jpg` | The six photos at the end of the ripple sequence (portrait 4:5) |

## Stage 3 — People
| File | Where |
|---|---|
| `founder.jpg` + signature as SVG | Founder's promise (client supplies the real photo and signature) |
| `aud-business.jpg`, `aud-charity.jpg`, `aud-supporter.jpg` | Three expanding audience panels (landscape-ish, face-safe crop) |

## Stage 4 — Crowd transition
| File | Where |
|---|---|
| `crowd.mp4` + `crowd-poster.jpg` | Section "Different people. One idea." Add inside the `<video class="crowd-video">`: `<source src="assets/crowd.mp4" type="video/mp4">` and set `poster=` |

## Licensing
Client states photo links are suggestions and final image/video licences will be confirmed before launch. Keep a note of the source and licence for every file.

---
## Status (media done)
Hero video+poster, 3 photo bands (12), audience panels (3, reused in Welcome cards), crowd poster, founder portrait (placeholder, `founder.jpg` / `founder-alt.jpg`), ripple (6). Remaining optional: crowd video from `crowd-poster.jpg` (Frame-to-Video), real founder photo + signature from the client, real licensed photos before launch.
