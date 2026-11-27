# Pathfinder v0.23 — Living Chronicle

Status: implementation and local tests, not yet deployed or tested on Android. Based on v0.22 source commit 253358c6d9b8ec66758c3d45679be2ed067f0048.

## Design
- Personal deeds remain literal in the journal; newly completed quests store `questTitle` and `questSource` on log entries. Existing log entries can recover a title from an exact ID/name match with a surviving quest; the known template names are also available for display. Deleted custom quests with no surviving title cannot be reconstructed reliably.
- Narrator drafts select a calendar week (Monday to Sunday, local device calendar), and include only completed deeds dated no later than now. First narrative week is the calendar week containing the personal cycle start; it may contain deeds from before the start. Narrative days 1–7, 8–14, etc. are labels, not a mapping to canonical campaign days or a change to the 66-day counter. The tenth narrative week has the symbolic label 64–66; later weeks can still be written. A week can be selected before it ends, and the approved chapter covers only what was submitted at that moment; no automatic regeneration or catch-up quotas.
- A chapter stores `week` (server quota week, Warsaw) and optional `sourceWeek` (selected calendar week). New chapters cannot duplicate either an already saved server week or an already saved sourceWeek. Legacy chapters remain valid, with no guessed source week.
- The preview is editable and is the only narrative input sent to the server. Known locations, encountered speakers and chosen dialogue labels may be included; unreached text, NPC memory, profile, diary and report prose are not collected. Previous approved chapter excerpt is opt-in and defaults off. No automatic sharing with NPCs.
- Personal narrator writes fictional adaptations in known settings, not factual additions or changes to authored campaign. Prompt constraints are not a formal guarantee of model output; user approval remains required. Authored progression, economics, EXP, free JSON chronicler and account-local data architecture unchanged.
- Input cap increases from 2000 to 6000 characters (18000 UTF-8 bytes); draft discloses omitted entries. Output remains 100-character title, 2500-character prose. Same endpoint and response schema; existing v0.22 clients work with new backend. Deploy backend before using a longer draft in v0.23. Guild endpoint explicitly assigns npc=kael server-side.
- Same quota ledger, model, token, server identity, and Railway volume. No reset or new service. One attempt per Warsaw week for narrator; 100 total/20 per UTC day across AI. Mock does not consume paid quota. Per-user auth and multiprocess quotas remain future work.

## Tests
- `node scripts/test-living-chronicle.cjs`
- `node backend/server.cjs --self-test`
- `node backend/server.cjs --ai-self-test`
- `node scripts/build-android.cjs --check-only`
All above passed on a local source copy; tests use synthetic data and fake provider only. Windows APK build, phone UI, production HTTP authentication (previous 401), live model quality, persistence/export on the actual device still require verification. Do not clear app data or rotate token to bypass a weekly limit.
