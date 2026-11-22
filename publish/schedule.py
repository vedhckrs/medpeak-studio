"""The channel's posting schedule (the owner's rule, 2026-11-22; the shared file is ~/Desktop/New/POSTING-SCHEDULE.md).

Two pipelines post to MedPeak Health. This one (medpeak-studio) owns:
    Shorts       12:30 IST (07:00 UTC) and 21:30 IST (16:00 UTC)
    long videos  Wednesday and Saturday 05:30 IST (00:00 UTC)
The cartoon pipeline owns 08:00, 15:30 and 18:30 IST: never used here.
Rules checked against the channel's REAL schedule (the last 50 uploads, read from the YouTube API):
    at most 5 Shorts a day (IST day, all pipelines), at least 3 h between any two Shorts,
    at least 2 h between a long video and any Short. Another pipeline's video is never moved.

    python publish/schedule.py                 the channel's schedule and the next free slots (reads only)
    python publish/schedule.py --days 10       look further ahead
"""
import datetime as dt
import os
import re
import sys

IST = dt.timezone(dt.timedelta(hours=5, minutes=30))
UTC = dt.timezone.utc
SHORT_SLOTS_UTC = [(7, 0), (16, 0)]          # 12:30 and 21:30 IST
LONG_SLOT_UTC = (0, 0)                       # 05:30 IST
LONG_DAYS_IST = (2, 5)                       # Wednesday, Saturday (Monday = 0), counted on the IST date
MAX_SHORTS_A_DAY = 5
SHORT_GAP = dt.timedelta(hours=3)
LONG_GAP = dt.timedelta(hours=2)
LEAD = dt.timedelta(hours=1)                 # a slot must be at least this far ahead to be picked
TOKEN = os.path.expanduser("~/.config/youtube-analytics/token.json")


def _secs(iso):
    m = re.match(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    d, h, mi, s = (int(x or 0) for x in m.groups()) if m else (0, 0, 0, 0)
    return d * 86400 + h * 3600 + mi * 60 + s


def _when(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(UTC)


def channel_schedule(yt, n=50):
    """The last n uploads: [{id, title, when (UTC), state 'scheduled'|'public'|'private', short}]"""
    ch = yt.channels().list(part="contentDetails", mine=True).execute()["items"][0]
    up = ch["contentDetails"]["relatedPlaylists"]["uploads"]
    ids = [i["contentDetails"]["videoId"] for i in
           yt.playlistItems().list(part="contentDetails", playlistId=up, maxResults=n).execute().get("items", [])]
    out = []
    for k in range(0, len(ids), 50):
        for v in yt.videos().list(part="snippet,status,contentDetails", id=",".join(ids[k:k + 50])).execute()["items"]:
            st = v["status"]
            if st.get("publishAt"):
                state, when = "scheduled", _when(st["publishAt"])
            elif st.get("privacyStatus") == "public":
                state, when = "public", _when(v["snippet"]["publishedAt"])
            else:
                state, when = "private", None    # private with no time: takes no slot
            out.append({"id": v["id"], "title": v["snippet"]["title"], "when": when, "state": state,
                        "short": _secs(v["contentDetails"].get("duration")) <= 180,
                        "studioTime": st.get("publishAt")})
    return out


def _ok(t, short, taken):
    timed = [v for v in taken if v["when"]]
    if short:
        day = t.astimezone(IST).date()
        if sum(1 for v in timed if v["short"] and v["when"].astimezone(IST).date() == day) >= MAX_SHORTS_A_DAY:
            return False
    for v in timed:
        gap = abs(v["when"] - t)
        if short and v["short"] and gap < SHORT_GAP:
            return False
        if (short != v["short"]) and gap < LONG_GAP:
            return False
        if not short and not v["short"] and gap < LONG_GAP:
            return False
    return True


def candidate_slots(short, start, days):
    d0 = start.astimezone(UTC).date()
    for i in range(days + 1):
        d = d0 + dt.timedelta(days=i)
        if short:
            for h, m in SHORT_SLOTS_UTC:
                yield dt.datetime(d.year, d.month, d.day, h, m, tzinfo=UTC)
        else:
            t = dt.datetime(d.year, d.month, d.day, *LONG_SLOT_UTC, tzinfo=UTC)
            if t.astimezone(IST).weekday() in LONG_DAYS_IST:
                yield t


def free_slots(taken, short, count=3, days=14, now=None):
    """The next `count` own slots that pass every rule against `taken` (list from channel_schedule)."""
    now = now or dt.datetime.now(UTC)
    got = []
    for t in candidate_slots(short, now, days):
        if t < now + LEAD:
            continue
        if _ok(t, short, taken + [{"when": g, "short": short} for g in got]):
            got.append(t)
            if len(got) == count:
                break
    return got


def ist(t):
    return t.astimezone(IST).strftime("%a %d %b %H:%M IST")


def utc_iso(t):
    return t.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def main():
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    a = sys.argv[1:]
    days = int(a[a.index("--days") + 1]) if "--days" in a else 7
    yt = build("youtube", "v3", credentials=Credentials.from_authorized_user_file(TOKEN))
    taken = channel_schedule(yt)
    now = dt.datetime.now(UTC)
    print("Channel schedule (last 50 uploads), from 2 days ago:")
    for v in sorted((v for v in taken if v["when"] and v["when"] > now - dt.timedelta(days=2)), key=lambda v: v["when"]):
        print(f"  {ist(v['when'])}  {'Short' if v['short'] else 'long '}  {v['state']:9}  {v['title'][:60]}")
    print("Next free MedPeak Short slots: " + ", ".join(ist(t) for t in free_slots(taken, True, 4, days)))
    print("Next free MedPeak long slots:  " + ", ".join(ist(t) for t in free_slots(taken, False, 2, max(days, 14))))


if __name__ == "__main__":
    main()
