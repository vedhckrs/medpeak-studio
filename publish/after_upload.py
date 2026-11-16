"""What follows an upload: captions, the question comment, and going public. Each step only with
its own flag and --approve, and only after the owner's yes for that step.

    python publish/after_upload.py <slug> <cut> --captions --dry-run
    python publish/after_upload.py <slug> <cut> --captions --approve      # add package/captions.srt
    python publish/after_upload.py <slug> <cut> --comment --approve       # post the package's question
    python publish/after_upload.py <slug> <cut> --public --approve        # private -> public

Uses the saved login in ~/.config/youtube-analytics/token.json (needs youtube.force-ssl). Writes
what it did back into videos/<slug>/package/<cut>.json. A comment can be posted here but only
PINNED by hand in YouTube (the API has no pin). Comments need a public or unlisted video.
"""
import json
import os
import sys

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKEN = os.path.expanduser("~/.config/youtube-analytics/token.json")


def main():
    a = sys.argv[1:]
    if len(a) < 2:
        sys.exit(__doc__)
    slug, cut = a[0], a[1]
    go = "--approve" in a
    pkg_path = os.path.join(ROOT, "videos", slug, "package", f"{cut}.json")
    pkg = json.load(open(pkg_path))
    vid = pkg.get("uploaded")
    if not vid:
        sys.exit(f"{slug} {cut}: not uploaded yet")
    yt = build("youtube", "v3", credentials=Credentials.from_authorized_user_file(TOKEN))
    live = yt.videos().list(part="status,snippet", id=vid).execute()["items"][0]
    status = live["status"]
    print(f"{slug} {cut}: {vid} is {status['privacyStatus']} ('{live['snippet']['title']}')")

    if "--captions" in a:
        srt = pkg.get("captions") or os.path.join(os.path.dirname(pkg_path), "captions.srt")
        if pkg.get("captionsUploaded"):
            print(f"  captions: already added ({pkg['captionsUploaded']}), skipped")
        elif not os.path.exists(srt):
            sys.exit(f"  captions: file missing: {srt}")
        elif not go:
            print(f"  captions: dry run, would add {os.path.basename(srt)} as English")
        else:
            r = yt.captions().insert(part="snippet", body={"snippet": {"videoId": vid, "language": "en", "name": "English", "isDraft": False}},
                                     media_body=MediaFileUpload(srt, mimetype="application/octet-stream")).execute()
            pkg["captionsUploaded"] = r["id"]
            print(f"  captions: added ({r['snippet'].get('status')})")

    if "--public" in a:
        if status["privacyStatus"] == "public":
            print("  public: already public, skipped")
        elif not go:
            print("  public: dry run, would change private -> public")
        else:
            keep = {k: status[k] for k in ("embeddable", "license", "publicStatsViewable", "selfDeclaredMadeForKids", "containsSyntheticMedia") if k in status}
            r = yt.videos().update(part="status", body={"id": vid, "status": {**keep, "privacyStatus": "public"}}).execute()
            pkg["madePublic"] = True
            status = r["status"]
            print(f"  public: now {status['privacyStatus']}")

    if "--comment" in a:
        toon = json.load(open(os.path.join(ROOT, "videos", slug, "toon.json"))) if cut == "toon" else {}
        text = (toon.get("package") or {}).get("question")
        if pkg.get("commentId"):
            print(f"  comment: already posted ({pkg['commentId']}), skipped")
        elif not text:
            sys.exit("  comment: no question in the package")
        elif status["privacyStatus"] == "private":
            sys.exit("  comment: the video is private; comments need a public or unlisted video")
        elif not go:
            print(f"  comment: dry run, would post: {text}")
        else:
            r = yt.commentThreads().insert(part="snippet", body={"snippet": {"videoId": vid, "topLevelComment": {"snippet": {"textOriginal": text}}}}).execute()
            pkg["commentId"] = r["id"]
            print(f"  comment: posted \"{text}\" (pin it by hand in YouTube)")

    json.dump(pkg, open(pkg_path, "w"), indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
