# Super Maverick’s World — Working Game Brief

This file brings the founder’s original build assignment and later direction into the game repository so future work can continue from one source of truth. The full October 30 assignment is also saved in ChatGPT Library as `Super_Mavericks_World_Work_Build_Assignment.md`.

## Founder direction

- Make the playable game feel like the colorful 16-bit game pictured on the TV in Maverick’s Fort. That TV artwork is the primary visual reference.
- Build a responsive side-scrolling platform adventure that is fun to replay and clear enough for Maverick to feel proud showing it to friends and family.
- Keep the characters and story original to Studio LaDuke. Maverick is the hero; Finn’s Finn Suit, bone ability and Finn Dash stay useful; preserve Bob’s look and humor; keep the secret coin cave, checkpoints, collectibles, scores and Grumble King.
- Give the adventure separate worlds with distinct visual identity and pacing. Each world gets its own mini-boss and main boss. Use *Super Mario World* only to study broad craft: readable movement, a welcoming opening, clear level landmarks, optional discoveries, gradual challenge, and a satisfying world-end fight. Do not copy Nintendo sprites, characters, compositions, level layouts, music, names or other protected content.
- Keep the cartridge shelf extensible. HEIMR is a separate future dragon adventure with Corey, Maverick and HEIMR, using an original 3/4-view “up is away” perspective inspired by classic 16-bit adventure readability. Do not let that separate project displace work on this platformer.

## Original acceptance requirements carried forward

- The fort TV and console launch this same playable game; Back returns to the fort; closing and reopening do not duplicate loops or controls.
- Match the TV image’s perspective, scale, saturated palette, expressive proportions, chunky illustrated terrain and layered scenery. Keep gameplay readable and foreground/background separation clear.
- Make acceleration, braking, short/long jumps, coyote time, jump buffering, collision, enemy stomps, pickups, blocks, secrets, checkpoints and level exits dependable.
- Keep audio original, initialize it after a user gesture, and honor mute. Preserve local progress/high scores where practical.
- Desktop keyboard and multi-touch mobile controls need safe-area, orientation, scroll prevention, cancellation and focus handling.
- Test with a real browser: TV and console launch, movement, jump height, blocks, enemies, suit, secret area, checkpoint, boss, transitions, game-over/retry, scores, reopen, sustained play and portrait/landscape. Capture gameplay and compare it beside a crop of the TV artwork. Physical iPhone testing must be reported as unverified unless performed.
- Work on a feature branch and a review preview. Do not publish production without founder approval.

## Current world plan

| World | Courses | World-end boss | Mini-boss in course 1 | Visual direction |
| --- | --- | --- | --- | --- |
| 1 — Sunlit Fortland | Sunlit Fort Trail → Cedar Rush | Raincaller Ram | The Wagging Block Bandit | Sunny hill country into a rainy cedar run |
| 2 — Bob’s Wildwood | Bob’s Greenhouse → Root-Locked Ruins | Barkback Bruiser | Bob’s Flytrap Cousin | Overgrown greenhouse paths into rootbound ruins |
| 3 — Tidal Roots & Grumble Keep | Tidal Roots → Grumble Keep | Grumble King | The Tide-Pool Terror | Tide pools and deep greens into a purple-sunset keep |

Each course has authored terrain, platforms, collectible lines, blocks, enemies and checkpoint placement. World 1’s opening run is approximately 6,100 game units; the prior accidental 16,500-unit extension was removed. The three mini-bosses are arena encounters: the exit lane stays gated until each is defeated. Finn abilities, Bob’s transformations, the first-course coin cave and Grumble King are preserved in the active engine.

## Reference viewing notes

Useful *Super Mario World* longplay references opened during this review:

- [Complete 100% walkthrough with secret exits (YouTube)](https://www.youtube.com/watch?v=Be4LB4qTiTI)
- [SNES longplay and world progression (YouTube)](https://www.youtube.com/watch?v=ha54ej8WqdE)
- [Super Mario World 100% longplay, Part 1 (Dailymotion)](https://www.dailymotion.com/video/x9ui8ei)
- [SFC gameplay and Yoshi’s Island course (Bilibili, 8:27)](https://www.bilibili.com/video/BV1hoFUzBE5j/)
- [Nintendo’s official manual](https://www.nintendo.co.jp/clvs/manuals/common/pdf/CLV-P-SAAAE.pdf)

The YouTube video stayed at 0:00 and Dailymotion returned a playback error. A Bilibili upload did play here: I watched its opening minute, including the title, outdoor course, cave segment, elevated cloud-block section, and goal/clear sequence. Bilibili then presented its login prompt. The footage makes the short-range level rhythm concrete: a recognizable outdoor start, a quick palette/space change into a cave, then a return to bright sky platforms with an obvious goal. Collectibles and power-ups sit along and above the route, while the landscape itself keeps moving and changing. This backs the current separate-world plan and suggests adding more contrasting sub-areas inside longer courses as the route expands.

### Controls and level-flow takeaways

- Nintendo’s *Super Mario World* manual describes building speed before flight, steering in the air, and holding the jump button to slow a cape descent. The new Studio LaDuke cape is deliberately simpler: hold Jump while descending to glide, keeping the action accessible on touchscreens and distinct from the original control recipe. It is an optional power-up in the opening course.
- Nintendo’s *Donkey Kong Country* manual documents run, jump and roll attack controls, with the roll also revealing buried items. This supports keeping a clear main jump/action layout while making secrets visible through environmental clues. Finn’s dash remains his original special move; it is not converted into a copied roll attack.
- [Extremely OK Games’ Celeste page](https://exok.com/games/celeste/) describes a small core set of jump, air-dash and climb actions with room for mastery. We apply that constraint by keeping the regular controls compact and teaching one mechanic at a time, while keeping the authored challenges forgiving enough for a family platform game.
- Each world has two courses, with its mini-boss gating the course exit and its main boss closing the world. A captioned, silent 16-bit story strip now opens the adventure, provides a brief beat after each mini-boss, and ends after the final boss. The story uses the same character and terrain rendering as play; it can be advanced by tap or Enter and also advances on its own. No dialogue audio is used in these sequences.

### Dad as Maverick’s companion

- Corey’s character is Maverick’s supportive dad and builder. He appears briefly at the workbench when a new piece of gear is introduced, explains why he made it, and lets Maverick react; the scene is skippable and never takes control away from Maverick.
- The current pass adds that presentation for the Finn Suit and cape, plus original red “field-test” runners as a timed speed pickup. The next movement pass should give those shoes a proper speed-built loop route with a forgiving alternate path, so the player chooses the challenge rather than being forced into it.
- The broad Genesis reference is *Sonic the Hedgehog 2*’s temporary Power Sneakers and Tails following Sonic; *Sonic 3* adds a co-op assist where Tails can briefly fly with Sonic. These are mechanic references only. Studio LaDuke will use its own red runner design, Dad/Maverick scenes, route shapes, animation, and rules. SEGA’s [Sonic 2 manual](https://manuals.sega.com/megadrivemini/pdf/SONIC_THE_HEDGEHOG2.pdf) describes the Power Sneakers, and the [Sonic Origins manual](https://manuals.sega.com/origins/en/index.html) documents the Tails carry action in *Sonic 3 & Knuckles*.

All references are for broad interaction and pacing ideas only. Studio LaDuke’s art, characters, courses, encounters, ability rules and music remain original.

## Status and remaining review

- Implemented: one consolidated active platform engine, three world identities, six courses, three mini-bosses and three world bosses, chapter/world HUD and world-end progression.
- Retained: original character abilities and story hooks, the TV/console entry points, cartridge shelf, high scores, pause/restart/game-over and sound preference.
- Added in the active engine: an optional cape pickup and hold-to-glide control, a silent captioned opening cartoon, one brief vignette after each mini-boss, and a three-beat final victory sequence.
- Still needs founder-grade play review: tune each new arena through play, verify all six boss encounters and every transition, compare the current game capture to the actual TV-art crop, test the Red Runners and loop route, and check desktop plus phone portrait/landscape behavior. No physical iPhone result should be inferred from desktop testing.
- Future expansion: world-map/select presentation and additional courses/secrets should come after this six-course route is enjoyable and tested end to end.
