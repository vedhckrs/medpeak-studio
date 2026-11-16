"""Read-only: the channel's newest uploads with their live counts, and (once YouTube Analytics has
caught up, 1 to 3 days after publishing) how much of each is watched and where its views come from.

    python publish/recent.py            # newest 8 uploads
    python publish/recent.py 12         # newest 12

Changes nothing on the channel. Uses the saved login in ~/.config/youtube-analytics/token.json.
"""
import datetime as dt
import os
import sys

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TOKEN = os.path.expanduser("~/.config/youtube-analytics/token.json")


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 8
    cred = Credentials.from_authorized_user_file(TOKEN)
    yt = build("youtube", "v3", credentials=cred)
    ya = build("youtubeAnalytics", "v2", credentials=cred)
    ch = yt.channels().list(part="contentDetails,statistics,snippet", mine=True).execute()["items"][0]
    print(f"CHANNEL {ch['snippet']['title']}: {ch['statistics'].get('subscriberCount')} subscribers, {ch['statistics'].get('viewCount')} lifetime views, {ch['statistics'].get('videoCount')} public videos")
    ups = ch["contentDetails"]["relatedPlaylists"]["uploads"]
    ids = [i["contentDetails"]["videoId"] for i in yt.playlistItems().list(part="contentDetails", playlistId=ups, maxResults=min(50, n)).execute()["items"]]
    vs = yt.videos().list(part="snippet,status,statistics,contentDetails", id=",".join(ids)).execute()["items"]
    vs.sort(key=lambda v: v["snippet"]["publishedAt"], reverse=True)
    now = dt.datetime.now(dt.timezone.utc)
    today = dt.date.today()
    start = str(today - dt.timedelta(days=28))
    print(f"\nNEWEST {len(vs)} UPLOADS (read {now.astimezone().strftime('%Y-%m-%d %H:%M %Z')})")
    for v in vs:
        s, st, x = v["snippet"], v["status"], v.get("statistics", {})
        hrs = (now - dt.datetime.fromisoformat(s["publishedAt"].replace("Z", "+00:00"))).total_seconds() / 3600
        age = f"{hrs:.1f} h" if hrs < 72 else f"{hrs / 24:.0f} d"
        print(f"\n{s['title']}\n  https://youtu.be/{v['id']} | {st['privacyStatus']} | live {age} | views {x.get('viewCount', '-')} | likes {x.get('likeCount', '-')} | comments {x.get('commentCount', '-')}")
        if st["privacyStatus"] == "private":
            continue
        try:
            r = ya.reports().query(ids="channel==MINE", startDate=start, endDate=str(today), filters=f"video=={v['id']}",
                                   metrics="views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,shares,subscribersGained").execute()
            row = (r.get("rows") or [[0] * 7])[0]
            if not row[0]:
                print("  analytics: not in yet (YouTube Analytics runs 1 to 3 days behind)")
                continue
            print(f"  analytics: {row[0]} views counted | {row[1]} minutes watched | average {row[2]} s = {row[3]:.0f}% of the video | {row[4]} likes | {row[5]} shares | +{row[6]} subscribers")
            t = ya.reports().query(ids="channel==MINE", startDate=start, endDate=str(today), filters=f"video=={v['id']}",
                                   metrics="views", dimensions="insightTrafficSourceType", sort="-views").execute()
            print("  views from: " + ", ".join(f"{a} {b}" for a, b in (t.get("rows") or [])[:5]))
        except Exception as e:
            print("  analytics error:", str(e)[:160])
    r = ya.reports().query(ids="channel==MINE", startDate=str(today - dt.timedelta(days=10)), endDate=str(today),
                           metrics="views,estimatedMinutesWatched,subscribersGained,subscribersLost", dimensions="day", sort="day").execute()
    print("\nWHOLE CHANNEL BY DAY (date, views, minutes watched, subscribers gained, lost)")
    for row in r.get("rows", []):
        print("  ", *row)


if __name__ == "__main__":
    main()
