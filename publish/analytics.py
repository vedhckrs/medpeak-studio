"""YouTube channel analytics fetcher.

First run opens a browser for Google sign-in and stores a refresh token
in token.json (chmod 600). Later runs reuse it.
Usage: venv/bin/python yt_analytics.py [days]
"""
import json
import os
import sys
from datetime import date, timedelta

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

HERE = os.path.expanduser("~/.config/youtube-analytics")  # login + client secret live here, never in git
SECRET = os.path.join(HERE, "client_secret.json")
TOKEN = os.path.join(HERE, "token.json")
SCOPES = [
    "https://www.googleapis.com/auth/youtube",            # manage channel
    "https://www.googleapis.com/auth/youtube.upload",     # upload videos
    "https://www.googleapis.com/auth/youtube.force-ssl",  # comments, captions
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",  # revenue
]


def creds():
    c = None
    if os.path.exists(TOKEN):
        c = Credentials.from_authorized_user_file(TOKEN, SCOPES)
    if c and c.expired and c.refresh_token:
        c.refresh(Request())
    if not c or not c.valid:
        flow = InstalledAppFlow.from_client_secrets_file(SECRET, SCOPES)
        c = flow.run_local_server(port=0, open_browser=False,
                                  prompt="consent", access_type="offline")
    with open(TOKEN, "w") as f:
        f.write(c.to_json())
    os.chmod(TOKEN, 0o600)
    return c


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "auth":
        creds()
        print("authorized")
        return
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 28
    end = date.today() - timedelta(days=1)
    start = end - timedelta(days=days - 1)
    c = creds()
    yt = build("youtube", "v3", credentials=c)
    ya = build("youtubeAnalytics", "v2", credentials=c)

    out = {"period": f"{start} to {end}", "channels": []}
    chans = yt.channels().list(part="snippet,statistics,contentDetails",
                               mine=True).execute().get("items", [])
    for ch in chans:
        cid = ch["id"]
        info = {
            "title": ch["snippet"]["title"],
            "id": cid,
            "lifetime": ch["statistics"],
        }
        base = dict(ids=f"channel=={cid}", startDate=str(start), endDate=str(end))
        totals = ya.reports().query(
            metrics="views,estimatedMinutesWatched,averageViewDuration,"
                    "averageViewPercentage,subscribersGained,subscribersLost,"
                    "likes,comments,shares", **base).execute()
        info["period_totals"] = dict(zip(
            [h["name"] for h in totals.get("columnHeaders", [])],
            (totals.get("rows") or [[]])[0]))

        top = ya.reports().query(
            metrics="views,estimatedMinutesWatched,averageViewPercentage,likes,subscribersGained",
            dimensions="video", sort="-views", maxResults=10, **base).execute()
        rows = top.get("rows") or []
        titles = {}
        if rows:
            vids = yt.videos().list(part="snippet",
                                    id=",".join(r[0] for r in rows)).execute()
            titles = {v["id"]: v["snippet"]["title"] for v in vids.get("items", [])}
        info["top_videos"] = [
            {"title": titles.get(r[0], r[0]), "id": r[0], "views": r[1],
             "watch_min": r[2], "avg_view_pct": r[3], "likes": r[4], "subs": r[5]}
            for r in rows]

        for dim, key, n in [("insightTrafficSourceType", "traffic_sources", 10),
                            ("country", "countries", 10),
                            ("deviceType", "devices", 10)]:
            r = ya.reports().query(metrics="views", dimensions=dim,
                                   sort="-views", maxResults=n, **base).execute()
            info[key] = r.get("rows") or []

        daily = ya.reports().query(metrics="views,subscribersGained",
                                   dimensions="day", sort="day", **base).execute()
        info["daily"] = daily.get("rows") or []
        out["channels"].append(info)

    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
