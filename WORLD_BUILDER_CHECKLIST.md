# World Builder development checklist

## Implemented and tested

- [x] Preserve the House Guide graph, room and viewpoint IDs, approved artwork, and photographic walk.
- [x] Portable room JSON includes revisions, master and variant media, alignment, thresholds, provisional camera notes, connection IDs, filenames, layer needs, placeholder SVG and production prompts.
- [x] Restore an exported room on a fresh browser profile without changing navigation.
- [x] Authenticated shared repository contract with signed, HttpOnly owner sessions, origin checks, private storage adapter, content-addressed upload chunks and ETag conflict protection.
- [x] Verify artwork assignments and room settings from fresh authenticated browser sessions on two local server instances using one filesystem store. Reject stale room settings writes.
- [x] Retain pending placement edits while switching objects. Save the current room configuration in the active local or shared storage mode.
- [x] Review editor has floor-grouped room selection, file drop, separate master import with generated desktop/phone variants, numeric scale and perspective, drag positioning, portal bounds, and undo/redo for alignment drafts.
- [x] Draft, approved, rejected and published-to-review states. No operation publishes to the production website.

## Provisioning and follow-up

- [ ] Confirm a private Vercel Blob store with an acceptable no-cost plan or provide an existing private store connection. GitHub remains the code and portable-schema history. The current public source repository is unsuitable for private artwork.
- [ ] Connect the private store to the isolated preview. The pinned adapter uses the server-only `BLOB_READ_WRITE_TOKEN` for a private store. Set a unique owner passphrase of at least 32 characters in `WORLD_BUILDER_OWNER_PASSPHRASE` for Preview. The review project must keep Vercel Authentication on every deployment. Never paste a credential into chat or commit it.
- [ ] Repeat the shared storage tests against live Blob from two clean browser sessions and two deployments. The current review clearly reports browser-local mode when storage is unconfigured.
- [ ] Add a room-level transaction for backup imports, bulk artwork routing, layer ordering and full object editing. Import currently commits one slot at a time. The editor imports one artwork file at a time.
- [ ] Establish persistent editable room/camera, lighting, animation and audio settings beyond the existing static geometry and per-view asset slots. Add a measured floor-plan overlay when the dimensional source is available.
- [ ] Prototype floor collision, portal-plane traversal, mask/depth parallax and placed objects in Front Hall and Main Hall after the storage acceptance test. The existing stair prototype and mobile fallback remain available.
- [ ] Approve artwork from the queue inside the studio. Use exported packages to hand a room to an external artist without providing repository write access.

For a portable backup, export a room from the World Builder and restore it in the destination browser. Keep a copy of the downloaded JSON with your artwork masters. Versions saved only in the browser stay tied to that browser profile and preview hostname until exported.
