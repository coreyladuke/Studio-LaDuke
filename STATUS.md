# Studio LaDuke status

- Canonical Chromebook checkout is `~/Studio-LaDuke-Development/Studio-LaDuke` with GitHub origin `coreyladuke/Studio-LaDuke`.
- Recovery baseline is `dev/house-guide-walk` at `a3379c7688980affea1cb732671e73933efc7bcf`. It was 18 commits ahead of `main` at `585dcc54fe085ca1eab8497e8961059c88d93240`.
- Recovery commits on the isolated line preserve Playwright QA (`28a98e5`), recover the Workshop Reflection Pond (`1e31e6c`), and restore the Woods first sound gesture (`43c2302`).
- [Protected baseline preview](https://studio-laduke-house-walk-review-6t8x7rwhv-coreyladuke-5408.vercel.app/house-visit.html?entry=stoop) is Vercel READY at `a3379c7`.
- Front Stoop remains below the visual acceptance gate. The baseline Playwright capture showed visible rectangular forest edges, bare sections, flat exterior materials and slow software rendering. Current development belongs on the Front Stoop only. Use the spatial collision and door behavior as functional baselines.
- Run `npm run review:site` from the canonical checkout with Node 22 or newer. See `qa/REVIEW.md` for setup. Physical device and protected shared-storage verification require the appropriate environment.

## Recovery verification

- Node 24 passed all 12 regression files covering the dimensional threshold, World Builder authorization, cross-session storage, stale writes, pool, HEIMR, Prism and Super Maverick's World.
- Static link audit checked 33 HTML files and 285 local references with zero missing targets.
- Chromium desktop and phone touch emulation passed the Workshop drawer → folded receipt → Reflection Pond route, water interaction and opt-in/mute control. Both profiles also passed the Woods fire and token checks with ambient audio off and with a saved opt-in.
- Local storage regression tests use an isolated store. Hosted Blob credentials, cross-deployment persistence and physical devices remain separate checks.
- The reconciliation capture completed 39 of 39 visitor checkpoints and 150 directional views across desktop, Chromebook-sized and emulated phone profiles. The phone walkthrough passed 11 of 11. The first desktop recording timed out at Main Hall while another renderer was active. The desktop-only repeat passed 11 of 11 after the audit movement timeout was increased in `aae2041`. No unexpected HTTP failures or page exceptions were reported by the three capture profiles.
- Shared development branch is `dev/reconciliation-2026-11-26`. The [current protected review](https://studio-laduke-house-walk-review-o6fdd5kv6-coreyladuke-5408.vercel.app/house-visit.html?entry=stoop) is Vercel READY and serves the allowlisted recovery snapshot at `4769ad8`. House, Workshop, Woods, Pond and the shared ambient script returned HTTP 200 behind Vercel Authentication.
- Local experiment `experiment/front-stoop-envelope` at `84ceb59` demonstrates continuous surroundings, photo-textured door and porch materials, and near vegetation with parallax. Desktop and narrow viewport angle, closed-door collision and threshold checks passed. The experiment has an unapproved forest light match and requires frame-pacing work. It remains outside the shared recovery branch.
