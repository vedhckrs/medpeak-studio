# YouTube upload login and scheduled uploads: setup guide

This guide gets a new computer ready to upload MedPeak videos and schedule them to go live later. You do
it once per computer, in Google Chrome, and it takes about 15 minutes.

You will end up with two files in one folder:

| File | What it is | Where it comes from |
|---|---|---|
| `client_secret.json` | The "app key": tells Google which app is asking | You download it from Google Cloud in Chrome (Part 1) |
| `token.json` | Your saved login: lets the app upload to your channel | Made when you sign in once (Part 2) |

The folder is the same on every computer:

- Mac: `~/.config/youtube-analytics/`
- Windows: `C:\Users\<you>\.config\youtube-analytics\`

**Never put these two files in the repo, in a chat, in an email or in a cloud drive.** The repo is public.
Anyone holding them can upload to or delete from your channel. If one ever leaks, delete that OAuth
client in Google Cloud (Part 1, step 4) and make a new one.

---

## Part 1: get the app key (`client_secret.json`) in Chrome

1. Open Chrome and sign in with **the Google account that owns the MedPeak Health channel**.
2. Go to **https://console.cloud.google.com/**.
   - At the top, click the project picker and choose the existing MedPeak project.
   - If there is none, click **New project**, name it (for example `MedPeak Uploader`) and click **Create**.
3. **Turn on the YouTube API:**
   - Go to **APIs & Services → Library**.
   - Search **YouTube Data API v3**, open it and click **Enable**.
   - Optional, for channel statistics: also enable **YouTube Analytics API**.
4. **Set up the consent screen** (only once per project):
   - Go to **APIs & Services → OAuth consent screen**, which newer screens call **Google Auth Platform**.
   - User type: **External**. App name: anything (for example `MedPeak Uploader`). Support email and
     developer email: your own.
   - Under **Audience** (or **Test users**), click **Add users** and add the channel's Gmail address.
     Without this, the sign-in in Part 2 says "access blocked".
   - Under **Data access** (or **Scopes**), add these:
     - `.../auth/youtube`
     - `.../auth/youtube.upload`
     - `.../auth/youtube.force-ssl`
     - `.../auth/yt-analytics.readonly`
5. **Make the key:**
   - Go to **APIs & Services → Credentials** (or **Clients**).
   - Click **Create credentials → OAuth client ID**.
   - Application type: **Desktop app**. Name: the computer it is for (for example `MedPeak Mac uploader`
     or `MedPeak Windows uploader`). Click **Create**.
6. **Download it:** in the box that opens, click **Download JSON**. Chrome saves a file named like
   `client_secret_1234...apps.googleusercontent.com.json` in **Downloads**.
   - If you missed the box, open the client from the **Credentials** list and use the download icon.
7. **Move and rename it:** rename the file to exactly `client_secret.json` and move it into the folder
   above (`~/.config/youtube-analytics/`).
   - On a Mac the folder starts with a dot, so Finder hides it. In Finder press **Cmd + Shift + G**, type
     `~/.config/youtube-analytics/` and press Return. If it says the folder does not exist, ask Claude to
     make it.
   - Then delete the copy left in Downloads.

---

## Part 2: sign in once (makes `token.json`)

The easiest way: tell Claude **"sign me in to YouTube for uploads"**. Claude runs the sign-in and gives you a
link. Then:

1. Open the link in **Chrome**, signed in as the channel's account.
2. Choose the account. If you see **"Google hasn't verified this app"**, click **Continue**. It is your own
   app, so this is safe.
3. Tick **all** the boxes it asks for (manage your YouTube account, upload videos and so on), then click
   **Continue**.
4. Chrome shows **"The authentication flow has completed"**. You can close the tab.
   `token.json` is now saved in the folder.

If you run it yourself in a terminal instead:

```bash
~/.config/youtube-analytics/venv/bin/python ~/.config/youtube-analytics/yt_analytics.py auth
```

It prints a link. Open it in Chrome and follow steps 1 to 4. It ends by printing `authorized`.

**The login lasts about 7 days.** While the Google app is in "Testing" mode, Google ends the login after a
week. When an upload fails with `invalid_grant` or "token expired", do Part 2 again. Part 1 is not needed
again. To stop the weekly sign-in, the app has to be **published** (OAuth consent screen → **Publish app**),
which may need Google's review.

---

## Part 3: upload a video and schedule it

Every MedPeak video ends with an upload package in `videos/<slug>/package/`. You don't run anything here
yourself. Tell Claude one of these, and Claude runs it after your word:

| You say | What happens |
|---|---|
| "Upload creatine private" | Uploads now, private (only you can see it) |
| "Schedule creatine for 25 Nov 6:30 pm India time" | Uploads now, private, and YouTube makes it public at that time by itself |
| "Show me the upload first" | A dry run: shows title, size and privacy and uploads nothing |

The commands Claude runs:

```bash
~/.config/youtube-analytics/venv/bin/python publish/upload.py creatine toon --dry-run
```

```bash
~/.config/youtube-analytics/venv/bin/python publish/upload.py creatine toon --approve --publish-at 2026-11-25T18:30:00+05:30
```

**How the schedule time is written:** `year-month-dayThour:minute:second+timezone`.
- India time ends `+05:30`.
- New York time ends `-05:00` in winter and `-04:00` in summer.
- London time ends `+00:00` in winter and `+01:00` in summer.

**Rules YouTube applies to a schedule:**
- The time must be in the future.
- The video stays **private** until that time, then goes **public** by itself. You can see it in
  **YouTube Studio → Content**, marked "Scheduled".
- You can change or cancel the time in Studio (open the video → **Visibility**) any time before it goes
  live.
- Your computer does NOT need to be on at that time. YouTube does it.

**After the upload, check these in YouTube Studio:**
1. **Details → Altered or synthetic content.** Set it to **Yes** if it is not already. The upload asks for
   it, but YouTube does not always show it.
2. **For a Short: Related video.** Pick the long video. The upload cannot set this field.

### One thing to watch for

Google locks videos uploaded through an app it has **not audited** to private. If a scheduled video does
not go public at its time, or Studio shows **"Locked (private)"**, the Google project needs the YouTube API
audit:
- Fill in the form at https://support.google.com/youtube/contact/yt_api_form.
- Until it is approved, make videos public by hand in Studio.

---

## Part 4: a new computer, quick checklist

1. In Chrome, do Part 1 and make a **new** Desktop client for this computer. Each computer gets its own
   client, so you can delete one without breaking the others.
2. Put `client_secret.json` in `~/.config/youtube-analytics/`.
3. Ask Claude to set up the Python tools for uploads. They are the Google libraries in a `venv` inside that
   folder.
4. Do Part 2 (sign in).
5. Ask Claude for a dry run of any packaged video. If it prints the title, everything works.

## When something goes wrong

| Message | What it means | Fix |
|---|---|---|
| `Access blocked: app has not completed verification` | Your Gmail is not a test user | Part 1, step 4: add it under Test users |
| `invalid_grant` / `Token has been expired or revoked` | The weekly login ended | Part 2 again |
| `redirect_uri_mismatch` | The client is a "Web application", not a "Desktop app" | Make a new **Desktop app** client (Part 1, step 5) |
| `quotaExceeded` | Google's daily limit (about 6 uploads a day on the free quota) | Wait until the next day (midnight US Pacific time) |
| `invalid publishAt` | The time is in the past or written wrongly | Use the format in Part 3 |
| `deleted_client` | The OAuth client was deleted in Cloud | Part 1, steps 5 to 7, then Part 2 |
