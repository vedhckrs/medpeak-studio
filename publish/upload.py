"""Upload a packaged cut to YouTube (private or scheduled). Never public without --public.

    python publish/upload.py <slug> <cut> --dry-run
    python publish/upload.py <slug> <cut> --approve                      # private upload
    python publish/upload.py <slug> <cut> --approve --publish-at 2026-11-20T13:30:00+05:30
    python publish/upload.py <slug> <cut> --slot              # dry run: shows the next free slot it would use
    python publish/upload.py <slug> <cut> --approve --slot    # scheduled in the next free MedPeak slot
    python publish/upload.py <slug> all --approve                        # long video first, then Shorts

Uses the saved login in ~/.config/youtube-analytics/token.json (needs the youtube + youtube.upload
scopes). Writes the new video id back into videos/<slug>/package/<cut>.json as "uploaded".
--slot follows the channel's posting schedule (publish/schedule.py; the owner's rule, 2026-11-22): Shorts at 12:30 or
21:30 IST, long videos Wednesday/Saturday 05:30 IST, checked against the channel's real schedule read from the API.
The "Related video" link on each Short is set in YouTube Studio (the API has no field for it).
"""
import json
import os
import sys

import schedule as sched

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN = os.path.expanduser("~/.config/youtube-analytics/token.json")


def upload(yt, pkg_path, args):
    pkg = json.load(open(pkg_path))
    # the package stores paths relative to the repo (it is made on one machine and uploaded from another)
    for k in ("file", "thumbnail"):
        if pkg.get(k) and not os.path.isabs(pkg[k]):
            pkg[k] = os.path.join(ROOT, *pkg[k].split("/"))
    if pkg.get("uploaded"):
        print(f"{pkg['cut']}: already uploaded as {pkg['uploaded']}, skipped")
        return
    if pkg.get("issues"):
        sys.exit(f"{pkg['cut']}: fix package issues first: {pkg['issues']}")
    if not os.path.exists(pkg["file"]):
        sys.exit(f"{pkg['cut']}: render missing: {pkg['file']}")
    status = dict(pkg["status"])
    if "--slot" in args:
        short = pkg["cut"] != "long"
        slots = sched.free_slots(sched.channel_schedule(yt), short, 1)
        if not slots:
            sys.exit(f"{pkg['cut']}: no free {'Short' if short else 'long'} slot in the next 14 days")
        status["privacyStatus"] = "private"
        status["publishAt"] = sched.utc_iso(slots[0])
        print(f"  slot: {sched.ist(slots[0])} (next free {'Short' if short else 'long-video'} slot)")
    elif "--publish-at" in args:
        status["privacyStatus"] = "private"
        status["publishAt"] = args[args.index("--publish-at") + 1]
    if "--public" in args:
        status["privacyStatus"] = "public"
    size = os.path.getsize(pkg["file"]) / 1e6
    print(f"{pkg['cut']}: '{pkg['snippet']['title']}' ({size:.0f} MB) -> {status['privacyStatus']}"
          + (f", goes live {status['publishAt']}" if status.get("publishAt") else ""))
    if "--approve" not in args:
        print("  dry run: nothing uploaded (add --approve)")
        return
    req = yt.videos().insert(part="snippet,status", body={"snippet": pkg["snippet"], "status": status},
                             media_body=MediaFileUpload(pkg["file"], chunksize=8 * 1024 * 1024, resumable=True))
    resp = None
    while resp is None:
        prog, resp = req.next_chunk()
        if prog:
            print(f"  {int(prog.progress() * 100)}%")
    vid = resp["id"]
    if os.path.exists(pkg["thumbnail"]):
        try:
            yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(pkg["thumbnail"])).execute()
            pkg["coverSet"] = True
        except Exception as e:  # Shorts often refuse custom thumbnails; the cover is still useful in Studio
            pkg["coverSet"] = False
            print(f"  cover NOT accepted by YouTube (pick the frame in the app instead): {str(e)[:120]}")
    pkg["uploaded"] = vid
    # read back what YouTube really stored: a field it silently dropped is caught here, not days later
    live = yt.videos().list(part="status,snippet", id=vid).execute()["items"][0]
    stored = live["status"]
    pkg["stored"] = {"privacyStatus": stored.get("privacyStatus"), "madeForKids": stored.get("madeForKids"),
                     "containsSyntheticMedia": stored.get("containsSyntheticMedia")}
    if stored.get("privacyStatus") != status["privacyStatus"]:
        print(f"  WARNING: asked for {status['privacyStatus']}, YouTube stored {stored.get('privacyStatus')}")
    if status.get("publishAt"):
        pkg["stored"]["publishAt"] = stored.get("publishAt")
        want, got = sched._when(status["publishAt"]), stored.get("publishAt")
        if not got or sched._when(got) != want:
            print(f"  WARNING: asked to go live {status['publishAt']}, YouTube stored {got}: fixing it")
            yt.videos().update(part="status", body={"id": vid, "status": {**{k: stored[k] for k in ("privacyStatus", "embeddable", "license", "publicStatsViewable", "selfDeclaredMadeForKids") if k in stored}, "privacyStatus": "private", "publishAt": status["publishAt"]}}).execute()
            got = yt.videos().list(part="status", id=vid).execute()["items"][0]["status"].get("publishAt")
            pkg["stored"]["publishAt"] = got
            print(f"  publishAt now {got}")
        else:
            print(f"  goes live {sched.ist(want)} (read back from YouTube)")
    if status.get("containsSyntheticMedia") and not stored.get("containsSyntheticMedia"):
        print("  WARNING: the AI-use answer was not stored by the upload; set it with: publish/after_upload.py <slug> <cut> --label --approve")
    # write the paths back RELATIVE to the repo (2026-11-21: they came back as this Mac's full paths, twice)
    for k in ("file", "thumbnail"):
        if pkg.get(k) and os.path.isabs(pkg[k]) and pkg[k].startswith(ROOT):
            pkg[k] = os.path.relpath(pkg[k], ROOT).replace(os.sep, "/")
    json.dump(pkg, open(pkg_path, "w"), indent=2, ensure_ascii=False)
    print(f"  uploaded: https://youtu.be/{vid}")


def main():
    a = sys.argv[1:]
    if len(a) < 2:
        sys.exit(__doc__)
    slug, cut = a[0], a[1]
    pdir = os.path.join(ROOT, "videos", slug, "package")
    cuts = ["long"] + sorted(f[:-5] for f in os.listdir(pdir) if f.endswith(".json") and f != "long.json") if cut == "all" else [cut]
    yt = build("youtube", "v3", credentials=Credentials.from_authorized_user_file(TOKEN))
    for c in cuts:
        upload(yt, os.path.join(pdir, f"{c}.json"), a)


if __name__ == "__main__":
    main()
