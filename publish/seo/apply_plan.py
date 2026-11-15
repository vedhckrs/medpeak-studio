"""Apply seo_plan.json to the channel.

Usage:
  apply_plan.py --dry-run          # show what would change, touch nothing
  apply_plan.py --only ID[,ID]     # apply to specific videos
  apply_plan.py --all              # apply to every video in the plan
  apply_plan.py --channel          # update channel keywords + description
Saves a backup of each video's old snippet to backup/ before changing it.
"""
import json
import os
import sys

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

HERE = os.path.dirname(os.path.abspath(__file__))
TOKEN = os.path.expanduser("~/.config/youtube-analytics/token.json")


def main():
    args = sys.argv[1:]
    plan = json.load(open(os.path.join(HERE, "seo_plan.json")))
    yt = build("youtube", "v3", credentials=Credentials.from_authorized_user_file(TOKEN))
    dry = "--dry-run" in args
    os.makedirs(os.path.join(HERE, "backup"), exist_ok=True)

    if "--channel" in args:
        ch = yt.channels().list(part="brandingSettings", mine=True).execute()["items"][0]
        json.dump(ch, open(os.path.join(HERE, "backup", "channel.json"), "w"), indent=1, ensure_ascii=False)
        ch["brandingSettings"]["channel"]["keywords"] = plan["channel"]["keywords"]
        ch["brandingSettings"]["channel"]["description"] = plan["channel"]["description"]
        if dry:
            print("would update channel keywords + description")
        else:
            yt.channels().update(part="brandingSettings",
                                 body={"id": ch["id"], "brandingSettings": ch["brandingSettings"]}).execute()
            print("channel updated")

    only = None
    for a in args:
        if a.startswith("--only"):
            only = set(args[args.index(a) + 1].split(","))
    if not (only or "--all" in args or dry):
        return
    for p in plan["videos"]:
        if only and p["id"] not in only:
            continue
        v = yt.videos().list(part="snippet", id=p["id"]).execute()["items"][0]
        sn = v["snippet"]
        json.dump(v, open(os.path.join(HERE, "backup", p["id"] + ".json"), "w"), indent=1, ensure_ascii=False)
        body = {"id": p["id"], "snippet": {
            "title": p["new_title"], "description": p["new_description"],
            "tags": p["new_tags"], "categoryId": sn["categoryId"]}}
        for k in ("defaultLanguage", "defaultAudioLanguage"):
            if k in sn:
                body["snippet"][k] = sn[k]
        if dry:
            print(f"[dry] {p['id']}: '{sn['title']}' -> '{p['new_title']}'")
            continue
        try:
            yt.videos().update(part="snippet", body=body).execute()
            print(f"updated {p['id']}: {p['new_title']}")
        except Exception as e:
            if "TEST_AND_COMPARE" not in str(e):
                raise
            body["snippet"]["title"] = sn["title"]
            yt.videos().update(part="snippet", body=body).execute()
            print(f"updated {p['id']} (title A/B test running, title kept): {sn['title']}")


if __name__ == "__main__":
    main()
