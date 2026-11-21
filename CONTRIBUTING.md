# How work lands in this repo

- `main` always works: `npm run typecheck`, `npm test` and `node pipeline/check.mjs --all` pass (CI runs them).
- One branch per piece of work: `feat/<thing>` (new pipeline feature), `video/<slug>` (a new video's
  script and package), `fix/<thing>`, `docs/<thing>`.
- Small commits with a clear message: `feat(render): ...`, `video(sugar): ...`, `fix(qc): ...`.
- Push the branch, open a pull request, and merge it yourself once CI passes: the owner said (2026-11-21) not to
  ask him before committing, pushing or merging. Tag releases `v0.x.0`.
- Never commit: renders, voice, music, clips (rebuilt from code), `.env`, YouTube logins, client secrets.
  Exception: the Toons' voice clips, sound effects and music beds (`assets/toons-voice`, `assets/toons-sfx`,
  `assets/toons-music`) are paid for once and ARE committed.
