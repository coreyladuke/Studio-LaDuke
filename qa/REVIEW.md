# Studio LaDuke visual QA

The review command starts a loopback server for the current checkout and drives Chromium with fresh contexts. It records the website entrance, the dimensional round trip, the photographic comparison route, and the existing Front Hall fixtures. Application controls drive navigation and the harness reads DOM state to checkpoint it. Each report records the exact branch, SHA and working-tree status.

## In VS Code

1. Open the **Studio-LaDuke** repository folder and open **Terminal → New Terminal**.
2. Use Node 22 or newer. Select Node 24 with `nvm use 24`, or run `export PATH="$HOME/.config/nvm/versions/node/v24.22.1/bin:$PATH"` on the current Chromebook.
3. Playwright and Chromium are ready on the current Chromebook. On a fresh checkout, run `npm install --no-package-lock` and `npx playwright install chromium`. The system commands `montage`, `convert`, `zip` and `unzip` must be available. An existing matching Playwright installation can also be supplied through `NODE_PATH`.
4. Run `npm run review:site`. The folder and ZIP appear in the repository root. Open the desktop `CONTACT_SHEET.jpg`, then look at the mobile and Chromebook-sized sheets under `contact-sheets`.

For an output in Linux files, run:

```sh
STUDIO_REVIEW_OUTPUT="$HOME" npm run review:site
```

Set `STUDIO_REVIEW_QUICK=1` for desktop screenshots only. Optional `STUDIO_LOCAL_PREVIEW` and `STUDIO_PROTECTED_PREVIEW` update the review URLs shown in the report. They are labels. The actual capture always uses the current checkout on loopback. Supply a current screenshot assessment with `STUDIO_REVIEW_NOTES=/absolute/path/assessment.md`. Use that only for observations from the evidence being packaged. Movement checkpoints allow up to 30 seconds under software rendering. The command exits with a failure code for route, browser exception or unexpected request failures after it writes any evidence it collected. Regeneration replaces a previously generated folder and ZIP. Move them elsewhere to keep a historical copy.

## Independent review

Read `REVIEW.md` and `BUILD.json`, scan the three viewport sheets, and open the individual images for each reported failure. Scrub through both videos for pauses, interaction feedback, visual abruptness and any differences between the approach and return. Confirm FPS in `PERFORMANCE.json` rather than inferring it from video playback. Verify the route separately on a physical Chromebook and iPhone Safari before claiming a device pass.

Use identical stops for visual comparisons between iterations. For each visual issue, record the stop, direction, viewport, evidence filename, the experience it interrupts, the likely source to investigate and one check that would demonstrate the fix. Use `assets/house-dimensional.mjs` for geometry and materials, `assets/house-visit.mjs` for traversal and input, `assets/house-visit.css` for the dimensional interface, and `house.html` and `assets/house-walk.js` for the photographic route. Inspect the actual frames before using any generalized prompt about the renderer.

For a ChatGPT review, upload the ZIP and ask: “Read the report and contact sheets. Review the highest-priority defects against the approved photographic references. Cite image filenames and source files, and write one narrowly scoped implementation prompt with a visual acceptance check.”

The ZIP includes fresh public-view captures and sanitized diagnostics. The suite does not collect browser profiles, authentication state, raw HAR files, headers, arbitrary source material, or customer records. The review URLs are recorded without credentials or sensitive query values. Do not put private material in a supplemental assessment.
