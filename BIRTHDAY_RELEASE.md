# December 2 birthday release candidate

## Ready for protected review

- Keep the approved photographic walk as the reliable entrance from Front Hall through Main Hall and upstairs.
- Explore the Front Hall / Main Hall scene with WebGL movement, collision-checked hall and front-door thresholds, tap and keyboard interaction, and a photographic fallback.
- Try the hinged entry door, lamp, drawer, painting, notebook, record player and the note in the drawer. These prototype objects use stable IDs. Art inspection uses the existing King salmon image. The record player plays a small locally synthesized motif.
- The modular house links to the existing Bob’s World, Music Room, Workshop, McBride’s cabinet row and cartridge shelf, Maverick’s Fort, artwork collection, and Higher Ground. Bob’s World and Higher Ground use the Back Porch as a provisional departure point. These links open the existing experiences. Browser Back returns to the house.
- World Builder retains placement edits while switching between Front Hall objects. Owner sessions can save room settings with revision checks in shared mode. Local backups restore assets and settings together in one transaction.
- The dimensional front door opens into a collision-bounded stoop. The background crops the existing Woods photograph from `forest-path.html`. The stoop dimensions remain provisional.

## Physical device review

- Walk through the Main Hall Opening on phone and Chromebook. Verify that a drag rotates the view without activating an object.
- Check the WebGL scene for frame pacing, battery use and touch target comfort on iPhone Safari. The browser suite uses emulation and software-rendered Chromium.
- Check rain and music volume on actual phone speakers. Verify that the photographic fallback opens on a device with unavailable graphics.

## Artwork

- Match the dimensional Front Hall and Main Hall to calibrated views and the accepted plan. Existing artwork is preserved.
- Prepare texture maps and foreground masks for the approved photographic plates before using authored photographic depth and occlusion.
- Finish the reverse views and landing/stair plates. They remain listed in the asset queue.

## Unfinished

- The stoop and halls use provisional geometry. A physically continuous stair mesh is pending. The current Main Stairs action leads into the existing photographic and modeled stair route.
- Perspective and occlusion use geometry and the GPU depth buffer. Authored photographic depth maps, texture calibration, physically based lighting, fireplace effects and directional audio are pending.
- More placed objects and room configuration outside the two prototype halls remain future milestones. Showcases and games remain on their existing pages.

## Blocked

- Shared live storage is unconnected. Artwork and room settings passed recovery in fresh authenticated browser sessions on two separate localhost server instances using the same filesystem store. The isolated Vercel project needs a private Blob connection and a Preview owner passphrase for the live acceptance test.

## Optional after visitor review

- Connected publishing, additional layer editors and a richer spatial audio mix.
