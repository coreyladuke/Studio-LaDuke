# THE LIVING WORLD STANDARD
## Master directive for websites, apps, interactive portfolios, creative tools, and games

**Default rule:** Build an experience, not a collection of pages. Unless the project owner explicitly asks for a simpler build, treat immersive environmental quality, dimensional depth, motion, lighting, sound design where appropriate, and meaningful interaction as baseline design requirements, not optional upgrades.

## 0. Operational safety gate (proposed November 26, 2026)

These operational limits take precedence over the creative quality standard below and older broad build briefs. Do not interpret a creative ambition as authorization for unlimited implementation. Keep one bounded task active at a time.

- Before editing, inspect Git status, branch, current baseline, relevant existing tests and task acceptance criteria. Never discard local changes, force-push, reset, or overwrite newer work. Stop if existing changes overlap unexpectedly.
- Work on a task branch or isolated worktree, not directly on main. Keep production untouched until the specific change is reviewed, required checks pass and release is authorized. Do not enable automatic deployment from an experimental branch.
- Use the smallest meaningful prototype; reuse working assets and code. No broad rewrites, new dependencies, paid tools, large asset batches, long render jobs, or unrelated feature work without explicit approval.
- Default trial limits: one representative asset or scene, at most 720p for exploratory renders, 120 seconds per render attempt and two attempts per failed operation. Use actual tool-enforced timeouts when available; if a tool cannot enforce the limit, do not start the expensive operation without approval. These limits are experimental starting values, not evidence of runtime enforcement.
- No parallel coding agents by default. Use a focused independent review only when the task warrants it. Prefer deterministic automated tests over repeated AI inspection. Do not start another task or widen scope to fix an unrelated failure.
- Before work starts, state the one deliverable, allowed scope, verification commands and stop conditions. If the task cannot be completed in one bounded pass, save recoverable progress and report the blocker rather than escalating effort automatically.
- Run the relevant existing checks and exercise the changed behavior on actual browser previews where applicable. Preserve unaffected behavior. Report exact commands, pass/fail, skipped checks, commit, preview and before/after evidence when meaningful. Never claim physical-device testing from emulation.
- Use a GitHub issue as the task contract and a draft pull request as the evidence handoff. Refer to the issue from the PR and post a short results summary. Keep private data, credentials, unreleased creative assets and confidential project details out of public issues, branches and artifacts.
- A successful check is evidence, not aesthetic approval. Owner decisions should be limited to meaningful visual/product choices and exceptions to scope or cost. Stop after a reviewable checkpoint. Do not claim these instructions alone constitute hard enforcement of token, time, deployment or permission limits.

## 1. What quality means

The visitor should feel that they have entered a distinct, coherent place. The interface should have a recognizable visual identity, atmosphere, and sense of discovery. Aim for the reaction: *"I can't believe this is my website."*

A premium immersive experience may use real-time 3D, layered 2.5D environments, photogrammetry, detailed hand-crafted models, physically rich materials, dynamic lighting, natural movement, spatial transitions, and carefully authored sound. Choose the tools that best produce actual depth and convincing behavior. **Do not substitute flat background imagery, canned video, gradients, or animated text for genuine environmental interaction when a 3D world is called for.**

This is a quality standard, not a mandate to give every brand the same aesthetic. A retreat might be a living woodland. An upholstery business might be a tactile workshop. A design studio might be an explorable gallery. Invent a world appropriate to the client's story.

## 2. Non-negotiable creative requirements

- **Depth:** Design foreground, middle ground, and background. Use coherent perspective, scale, camera movement, occlusion, shadows, parallax, and 3D geometry where they meaningfully improve the scene.
- **Light:** Make illumination feel physically present, with directional light, soft shadows, reflection, glow, atmospheric scattering or fog, and changes in response to movement or time when appropriate.
- **Life:** Scenes should breathe. Trees respond to wind, leaves drift, water moves, fabric shifts, light flickers, and environmental details react. Motion should follow material behavior and avoid repetitive screensaver effects.
- **Touch and discovery:** Visitors should be able to look around, approach, explore, manipulate, and discover. Interactions should do something meaningful, not simply open a generic popup.
- **Materiality:** Favor convincing bark, stone, wood, metal, textile, paper, glass, water, and other brand-appropriate materials over generic gradients and featureless surfaces.
- **Soundscape:** When appropriate, design optional environmental audio, musical cues, and spatial sound. Start audio only after a user gesture, provide visible mute/volume control, and respect reduced-motion and accessibility preferences.
- **Composition:** Integrate text and navigation into the experience. Use editorial clarity and excellent typography, but do not let giant flat headings, rows of tiles, or floating button panels dominate the environment.
- **Warmth:** Immersive does not mean dark, ominous, or visually exhausting. Make the desired emotional tone tangible through art direction and interaction.

## 3. Patterns we reject by default

Do not deliver an ordinary template with a new color palette and call it a redesign. Avoid repetitive square/rounded cards, generic button grids, flat panels, static stock-photo heroes, unrelated decorative motion, ungrounded neon glows, placeholder visuals passed off as final artwork, and interfaces that look interchangeable with unrelated brands.

Do not claim "3D," "cinematic," "realistic," "alive," or "tested" unless the delivered build demonstrates those qualities. If an early prototype is technically functional but visually below this standard, label it **technical proof of concept** rather than a completed design.

## 4. Functional depth matters too

The beautiful public experience and useful business operations should be one coherent product. Include the required scheduling, consultation requests, service information, inquiries, customer portals, payments, forms, approvals, and other workflows appropriate to the project. Put operational controls where people can find them without flattening the public experience into a dashboard.

A private administrative interface may use clean conventional controls when that improves speed, safety, and accessibility. **The Living World Standard is not an excuse to make business tasks harder.** Never sacrifice clear calls to action, readability, accessibility, or secure handling of information for spectacle.

## 5. Build primarily with free tools

Prefer open-source and freely usable technology: Three.js/WebGL/WebGPU where supported, Blender, SVG, CSS, browser audio APIs, and reputable free-to-use or CC0 assets. Verify asset licensing before shipping. Build custom reusable components when existing free tools are insufficient. **Do not assume paid subscriptions, APIs, licensed assets, or new accounts are available.** Ask before introducing any cost.

Prioritize reliable real-time interaction over expensive prerendered video. Video is optional atmospheric support, not the foundation of interactivity.

## 6. Performance, inclusivity, and honesty

- Build for real phones and desktop browsers, including touch, mouse, keyboard, and accessibility needs.
- Provide a graceful lightweight fallback for devices with weak GPUs or no WebGL; do not make the fallback the primary artistic target.
- Use adaptive quality, responsible asset sizes, efficient animation, loading transitions, and performance budgets.
- Respect prefers-reduced-motion; make sound optional and avoid surprise playback.
- Test actual interactions, navigation, forms, and the visual result at mobile and desktop sizes.
- State clearly what was tested, what remains simulated, and what has not been verified. Never invent successful tests.

## 7. Required workflow

1. **Interpret the brand as a place.** Define atmosphere, emotional goal, materials, light, movement, and sensory identity.
2. **Prototype the living environment first.** Establish actual environmental depth, camera behavior, motion, lighting, and one meaningful interaction before building generic content sections.
3. **Build the practical journeys.** Connect exploration to the real services, information, and actions people need.
4. **Inspect, play, and critique.** Compare the rendered result to the creative brief. Identify the most obvious sign of flatness or cheapness and fix it before presenting the build.
5. **Quality-gate the handoff.** Show the real working experience, explain what is functional versus simulated, and name remaining visual or technical limitations without overselling.

## 8. Acceptance test: the five questions

Before calling a creative build ready for review, ask:

1. Does it feel like a distinct place rather than a template?
2. Is depth visible and interactive, not merely implied by decorative layers?
3. Do light, materials, and environmental motion create believable life?
4. Are meaningful interactions and practical business workflows discoverable and functional?
5. Does it feel polished and welcoming on a phone as well as desktop, with accessible controls and a usable fallback?

If a core answer is **no**, improve the experience or describe the honest prototype stage. Do not disguise a failing result with enthusiastic copy.

## 9. Simpler mode is opt-in

Only scale down the immersive standard when the project owner explicitly requests a basic, quick, lightweight, utilitarian, or conventional version. Even then, preserve excellent art direction, deliberate interaction, and brand individuality. Never silently revert to generic cards and buttons merely because they are easier to implement.

**Standing instruction:** Whenever ambiguity exists, choose the more imaginative, interactive, physically convincing solution that remains usable, performant, affordable, and appropriate for the brand.

## 10. Scope in this repository

These directives apply by default to any **user-facing visual, game, webpage, client portal or app experience** in this repo. For services, APIs, voice workers, build tools, automated jobs, data pipelines, or infrastructure-only code, apply the emphasis on thoughtful UX, quality, performance, accessibility, privacy and reliable functionality when relevant. **Do not add a 3D interface to a backend-only component.** If this repo includes multiple products, evaluate their visual experiences individually.
