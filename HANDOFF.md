# Handoff log

Two Claude accounts work on this repo, on two machines, one at a time. This file is how one session
tells the next what happened. Newest entry on top. Read the top entry before you start; add one before
you stop. The rules are in `CLAUDE.md`.

---

## 2026-11-17 - Windows PC (commits by VED) - branch `fix/windows-entrypoint`, pull request #3

First session on the Windows PC. The repo was cloned there and the pipeline was made to run on Windows.

### What changed in the code

- `pipeline/lib/util.mjs`: new `isMain(metaUrl)` helper. It compares real file paths, so it works on
  macOS, Linux and Windows.
- `pipeline/check.mjs`, `make-sfx.mjs`, `render.mjs`, `research.mjs`, `voice.mjs`: the line
  ``if (import.meta.url === `file://${process.argv[1]}`)`` is now `if (isMain(import.meta.url))`.
  The old line never matched on Windows, so each script exited with code 0 and did nothing.
- `pipeline/render.mjs`: Remotion is started with `process.execPath` and
  `node_modules/@remotion/cli/remotion-cli.js` (helper `remotion()`), not with `execFileSync('npx', ...)`,
  which fails on Windows with `ENOENT`.
- New files: `CLAUDE.md` (start and stop rules for every session) and this log.

### What was run (Windows 11, Node 24.22.1)

- `npm run typecheck`: pass. `npm test`: 8 of 8 pass.
- `node pipeline/check.mjs --all`: prints the tables, ALL PASS.
- `node pipeline/make-sfx.mjs`: 8 sound effects written to `public/sfx`.
- `node pipeline/render.mjs what-sugar-does-to-your-body --stills --only soda`: 20 stills, looked at one.

### What was not run

- `research.mjs` and `voice.mjs` (they only got the start-up change; voice spends ElevenLabs credits).
- A full video render. Nothing on macOS: the helper compares paths exactly there, so behaviour should be
  the same, but nobody has run it on the Mac yet.

### State of the Windows PC (not in git)

- Has: Git 2.56, Node 24.22.1, the npm packages (`npm ci`), ffmpeg 9.0.2, Python 3.12, a venv at
  `~/.config/youtube-analytics/venv` with `google-api-python-client` and `google-auth-oauthlib`,
  `public/sfx`.
- Missing: the ElevenLabs key for this project (`.env` or `MEDPEAK_ENV_FILES`), `client_secret.json`
  and `token.json` for YouTube, and the link of `skill/medpeak-health` into the Claude skills folder.
  So voice, music, upload and analytics cannot run on the Windows PC yet.

### Watch out: `feat/toons`

`feat/toons` (the Mac's branch, 60+ commits, not merged) was not touched from the Windows PC.

- **Merge conflict to expect.** Pull request #3 and `feat/toons` both edit `pipeline/render.mjs`. A test
  merge shows one conflict in that file. Keep both sides: the `spawnSync` loudness change from
  `feat/toons`, and `isMain` plus the `remotion()` launcher from pull request #3.
- **Same two bugs are still on `feat/toons`.**
  - Mac-only start-up line: `pipeline/toon-check.mjs`, `toon-music.mjs`, `toon-sfx.mjs`.
  - `npx` spawns: `pipeline/toon-package.mjs:130`, `toon-render.mjs:75` and `:87`, `toon-sheets.mjs:25`.
  Until they use `isMain` and the node launcher, the Toons scripts do not run on Windows. Moving
  `remotion()` from `render.mjs` into `lib/util.mjs` would let all of them share it.

### Open

- Pull request #3 waits for the owner's OK to merge into `main`.
- `loadEnv` in `pipeline/lib/util.mjs` splits `MEDPEAK_ENV_FILES` on `:`, which breaks Windows paths
  such as `C:\...`. Use `path.delimiter`.

### Next step for whoever picks this up

1. Once pull request #3 is merged: on `feat/toons`, `git fetch` and `git merge origin/main`, and resolve
   `pipeline/render.mjs` as described above.
2. Apply the two fixes to the Toons scripts listed above and run them once on each machine.
3. Fix the `MEDPEAK_ENV_FILES` split.
