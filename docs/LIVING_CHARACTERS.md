# Pathfinder v0.24 — Living Characters

## Scope
- Existing authored visual novel routes and scene assets are reused; AI consultations have a dedicated shared scene layer (`living-characters-921.js` / `.css`). Authored story engine and saves are unchanged.
- Kael and Oracle share the illustrated viewport, response suggestions, editable messages, typewriter effect (with skip/reduced motion) and collapsible technical/memory controls. Kael presents generated contracts and existing approval actions after a response. Oracle displays the latest reply and keeps earlier turns in expandable history, with existing campaign and memory actions.
- Opening either scene, selecting a suggested reply or copying a chapter fragment does not call AI. Sending is explicit. Kael's manual status check is still available in advanced connection options. Each additional sent Kael request is a separate consultation, not an unlimited conversation. Oracle keeps the existing eight-turn consultation/session semantics.
- Optional personal story context is copied into the editable message only on request: up to 400 characters from the latest approved AI chapter, subject to the original message length. It is marked as fictional. No private diary or other NPC memory is automatically included. User can edit/remove before sending. Existing opt-in memory switches and approvals are unchanged.
- Backend changes only NPC prompt wording: distinct voices and optional personal-story references. No endpoint, token, quota, ledger or persistence changes. Original server-side security rules remain in force. Private prototype still uses a shared token and global quotas; production authentication issue from prior testing remains open.

## Tests
- `node scripts/test-living-characters.cjs`: scene logic, quick replies, explicit chapter preview, animation skip/reduced motion; lightweight DOM stubs and static wiring checks, not a full UI integration test.
- `node scripts/test-living-chronicle.cjs`: v0.23 regression and simulated provider.
- `node backend/server.cjs --self-test` and `node backend/server.cjs --ai-self-test`: backend and simulated provider tests; no real API costs.
- `node scripts/build-android.cjs --check-only`: SRI validation.
- Pending: native Android build/install, actual display, keyboard/scrolling, full scene flows, native Keystore and production backend, real AI style quality. Chromium navigation was blocked in the build environment; no visual result is claimed.
- Preserve encrypted user backup, Git v0.23 checkpoint and Railway `/data` volume. Do not reset quotas or clear app storage to test.
