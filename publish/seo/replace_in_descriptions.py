"""Replace a string in every video description on the channel.

Usage: replace_in_descriptions.py OLD NEW [--apply]
Without --apply it only lists the videos that would change.
Backs up each changed video's snippet to backup/replace/ first.
"""
import json
import os
import sys

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

HERE = os.path.dirname(os.path.abspath(__file__))
TOKEN = os.path.expanduser("~/.config/youtube-analytics/token.json")


def main():
    old, new = sys.argv[1], sys.argv[2]
    apply = "--apply" in sys.argv
    yt = build("youtube", "v3", credentials=Credentials.from_authorized_user_file(TOKEN))
    up = yt.channels().list(part="contentDetails", mine=True).execute()["items"][0][
        "contentDetails"]["relatedPlaylists"]["uploads"]
    ids, tok = [], None
    while True:
        r = yt.playlistItems().list(part="contentDetails", playlistId=up, maxResults=50, pageToken=tok).execute()
        ids += [i["contentDetails"]["videoId"] for i in r["items"]]
        tok = r.get("nextPageToken")
        if not tok:
            break
    bdir = os.path.join(HERE, "backup", "replace")
    os.makedirs(bdir, exist_ok=True)
    hits = 0
    for i in range(0, len(ids), 50):
        for v in yt.videos().list(part="snippet", id=",".join(ids[i:i + 50])).execute()["items"]:
            sn = v["snippet"]
            if old not in sn.get("description", ""):
                continue
            hits += 1
            if not apply:
                print("would change", v["id"], sn["title"][:60])
                continue
            json.dump(v, open(os.path.join(bdir, v["id"] + ".json"), "w"), indent=1, ensure_ascii=False)
            body = {"id": v["id"], "snippet": {
                "title": sn["title"], "description": sn["description"].replace(old, new),
                "categoryId": sn["categoryId"]}}
            for k in ("tags", "defaultLanguage", "defaultAudioLanguage"):
                if k in sn:
                    body["snippet"][k] = sn[k]
            yt.videos().update(part="snippet", body=body).execute()
            print("updated", v["id"], sn["title"][:60])
    print(f"{hits} of {len(ids)} videos contained the text")


if __name__ == "__main__":
    main()
