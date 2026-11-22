# MedPeak Health: daily posting schedule (v2: 5 Shorts a day)

**Channel:** MedPeak Health (@medpeakhealth). Two pipelines post to this one channel, so both follow this file.

| Pipeline | Folder | What it makes | Shorts a day |
|---|---|---|---|
| **Talking-organ cartoons** | `~/Desktop/New` (skill `organ-talk-shorts`) | 2D cartoon Shorts where body parts talk | **3** |
| **MedPeak 3D** | `~/Desktop/MedPeakHealth/medpeak-studio` (skill `medpeak-health`) | 3D medical Shorts (quit sugar, creatine…) + long videos | **2** |

Why these times: in the last 28 days (to 22 Nov 2026), **60 % of views came from India and 24 % from the US**, and Shorts
got about 18,000 views against 40 for long videos. All times are **IST (UTC+05:30)**; US East = IST − 10:30 (Nov–Mar).

## Daily slots: 5 Shorts, 3 to 4½ hours apart

| Time (IST) | UTC | US East | Who posts | Why this time |
|---|---|---|---|---|
| **08:00** | 02:30 | 21:30 (day before) | Cartoon Short #1 | India morning commute + US evening |
| **12:30** | 07:00 | 02:00 | MedPeak 3D Short #1 | India lunch break |
| **15:30** | 10:00 | 05:00 | Cartoon Short #2 | India afternoon break, UK/Europe morning |
| **18:30** | 13:00 | 08:00 | Cartoon Short #3 | India evening commute + US morning |
| **21:30** | 16:00 | 11:00 | MedPeak 3D Short #2 | India prime time + US late morning |

## Long videos: 2 a week

| Day | Time (IST) | UTC | US East |
|---|---|---|---|
| **Wednesday** | 05:30 | 00:00 | 19:00 Tuesday (US prime time) |
| **Saturday** | 05:30 | 00:00 | 19:00 Friday |

On a long-video day, the 21:30 MedPeak Short should be a clip from that long video that points viewers to it.

## Rules (every pipeline checks them before scheduling)
1. **Stay in your own slots.** Cartoons: 08:00, 15:30, 18:30. MedPeak 3D: 12:30 and 21:30 Shorts, long videos Wed/Sat 05:30.
2. **Max 5 Shorts a day** on the channel, all pipelines together.
3. **At least 3 hours between any two Shorts**, and at least 2 hours between a long video and any Short.
4. **Before scheduling, read the channel's real schedule from the YouTube API**: the last 50 uploads with `status.publishAt`
   (scheduled) or `snippet.publishedAt` (public). If your slot is taken or breaks rule 2 or 3, use your next own slot that
   passes. Never move another pipeline's video.
5. **Upload as private with `publishAt`**, so YouTube publishes on time even if the Mac is off. Read the status back after
   upload: if `publishAt` is missing or different, fix it and say so.
6. **Each video needs the user's OK in chat** before it is uploaded. An earlier OK doesn't cover a new video.
7. **The user may move a time in Studio.** If a scheduled time differs from the slot, ask before changing it back.
8. **Keep a buffer:** aim for 3–4 days scheduled ahead in every slot, so a busy day doesn't break the streak.
9. **After 2 weeks,** compare views per Short by slot and by format. Give the strongest format the 18:30 and 21:30 slots, and
   if a slot keeps getting the fewest views, test a different time. Update this file.

## What 5 a day costs (check monthly)
Cartoon Shorts, 3 a day = about 90 episodes a month. Per episode (measured on episode 4):
- **ElevenLabs:** ≈ 2,000 characters → **≈ 180,000 a month**. The Starter plan's 40,000 a month covers only about 20 episodes,
  so 3 a day needs a bigger ElevenLabs plan (or the voices run out about a week in).
- **Magnific:** ≈ 1,000 credits with new art; less when scenes reuse the prop library → up to **≈ 90,000 a month**.
- **Time:** about 2–3 hours of pipeline work per episode, so build in batches and keep the buffer (rule 8).

## How each pipeline does it

**Talking-organ cartoons** (`organ-talk-shorts` › `scripts/youtube_upload.py`) follows these rules automatically:
`config.json › youtube.daily_times` = `["08:00", "15:30", "18:30"]`, `min_gap_hours` = 3, `max_shorts_per_day` = 5.
`schedule a,b,c --approve` fills the next free cartoon slots in order; `status` lists every video per day and the next free slots.

**MedPeak 3D** (`medpeak-studio`): when scheduling an upload,
- Shorts: 12:30 IST (= 07:00Z) for the first of the day, 21:30 IST (= 16:00Z) for the second;
- long videos: Wednesday and Saturday at 05:30 IST (= 00:00Z);
- before choosing the slot, apply rule 4 (read the channel's real schedule) and rules 2–3;
- send `publishAt` in UTC with `privacyStatus: private`.

All of this is done by the scripts (2026-11-22), run with `~/.config/youtube-analytics/venv/bin/python`, network on:
- `python publish/schedule.py [--days N]`: reads the last 50 uploads, lists what is scheduled or public from 2 days ago,
  and prints the next free MedPeak Short slots and long-video slots (reads only).
- `python publish/upload.py <slug> <cut> --slot` (dry run) / `--approve --slot`: takes the next free slot that passes
  rules 1-4 (a `long` cut gets a Wed/Sat slot, every other cut a Short slot), uploads private with `publishAt`, reads the
  time back and fixes it if YouTube stored something else (rule 5). It never touches another video (rules 4 and 7).

## Instructions to give the MedPeak 3D session
Paste this into the MedPeak session:

> From now on, schedule MedPeak uploads by `~/Desktop/New/POSTING-SCHEDULE.md`. You post 2 Shorts a day: 12:30 IST and
> 21:30 IST. Long videos go at 05:30 IST on Wednesday and Saturday only. The cartoon pipeline owns 08:00, 15:30 and 18:30 IST,
> so never use those. Before picking a slot, read the channel's scheduled and public videos from the YouTube API. Keep at least
> 3 hours between Shorts, 2 hours between a long video and any Short, and no more than 5 Shorts a day on the channel. Upload as
> private with `publishAt`, then read back the time. Ask me before uploading each video, and before changing a time I set in
> Studio. Update the upload/scheduling script in medpeak-studio to follow these rules and show me the next free slots.
