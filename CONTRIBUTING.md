# How work lands in this repo

- `main` always works: `npm run typecheck`, `npm test` and `node pipeline/check.mjs --all` pass (CI runs them).
- One branch per piece of work: `feat/<thing>` (new pipeline feature), `video/<slug>` (a new video's
  script and package), `fix/<thing>`, `docs/<thing>`.
- Small commits with a clear message: `feat(render): ...`, `video(sugar): ...`, `fix(qc): ...`.
- Push the branch, open a pull request, merge after the owner's OK. Tag releases `v0.x.0`.
- Never commit: renders, voice, music, clips (rebuilt from code), `.env`, YouTube logins, client secrets.
