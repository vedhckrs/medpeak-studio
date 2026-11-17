# Working in this repo (for Claude)

This repo is worked on from two Claude accounts on two machines (a Mac and a Windows PC). The owner
uses one at a time. Git is the only thing the two share: nothing you learn or change reaches the other
Claude unless it is pushed. So every session follows the same start and stop.

## Start of every session

1. `git fetch --all --prune`, then `git status`. If the branch is behind its remote, `git pull --ff-only`
   before touching anything.
2. Read the top entry of `HANDOFF.md` on `origin/main` (`git show origin/main:HANDOFF.md`). It says what
   the last session changed, what is open and what to do next.
3. List open pull requests and unmerged branches (`git branch -r --no-merged origin/main`). If one of
   them has a newer `HANDOFF.md` entry, read that too. Do not redo work that is already on a branch.
4. If you are on a long-lived branch, merge `origin/main` into it before new work, so fixes made on the
   other machine are in.

## Before you stop (or when the owner says he is switching machines)

1. Commit all work on its branch (see `CONTRIBUTING.md`) and push it. Nothing may stay only on one machine.
2. Add a new entry at the top of `HANDOFF.md`: date, machine, branch, what changed, what was run and its
   result, what was not run, what is open, the next step. Commit and push it with the work.
3. Tell the owner what is pushed and what waits for his OK (for example a pull request to merge).

## Rules for both machines

- Never push to a branch the other machine is working on unless the owner says so. Open a branch of
  your own and a pull request.
- Scripts must run on macOS and on Windows:
  - "run only when started directly" uses `isMain(import.meta.url)` from `pipeline/lib/util.mjs`,
    never ``import.meta.url === `file://${process.argv[1]}` `` (it never matches on Windows).
  - Do not spawn `npx` with `execFileSync` (it is `npx.cmd` on Windows and fails). Start the tool with
    `process.execPath` and its `.js` entry file, as `pipeline/render.mjs` does for Remotion.
  - Build paths with `node:path`; split path lists with `path.delimiter`.
- Machine setup (Node, ffmpeg, keys, YouTube login) is per machine and never in git. Note in
  `HANDOFF.md` what a machine has and what it is missing.
- Never commit keys, `.env`, YouTube logins, renders, voice, music or clips.
