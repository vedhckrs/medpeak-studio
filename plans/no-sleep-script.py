"""Writes videos/no-sleep/toon.json (the script for the checker and the player). Run: python3 plans/no-sleep-script.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def L(id, who, text, emo, key, src=None, chat=False, cam=None, beat=None, pose='rest', react=None):
    l = {"id": id, "who": who, "text": text, "emotion": emo, "pose": pose, "key": key}
    if src: l["src"] = src
    if chat: l["chat"] = True
    if beat: l["beat"] = beat
    if cam: l["cam"] = cam
    if react: l["react"] = react
    return l

def E(at, word=None, set=None, over=None, sfx=None, fx=None, delay=None):
    e = {"at": at}
    if word: e["word"] = word
    if set: e["set"] = set
    if over: e["over"] = over
    if sfx: e["sfx"] = sfx
    if fx: e["fx"] = fx
    if delay is not None: e["delay"] = delay
    return e

def tag(text, line, word, x=780, y=330):
    return {"kind": "tag", "text": text, "x": x, "y": y, "size": 300, "from": line, "to": line, "word": word}

XIE, SHOK, WIL, NHE, NHH, CDC = "xie-2013", "shokri-2018", "williamson-2000", "nhlbi-effects", "nhlbi-hours", "cdc-sleep"

shots = [
  {"id": "A", "set": "macro",
   "cast": [{"who": "gunk", "x": 540, "size": 420, "stage": True, "emotion": "angry", "pose": "rest"}],
   "state": {"view": 0, "gap": 0, "dirt": 0.6},
   "events": [
     E("start", set={"dirt": 0.7}, over=6, sfx="squelch"),
     E("A1", word="Don't", set={"dirt": 0.75}, over=8, sfx="plop"),
     E("A1", word="sleep?", set={"dirt": 0.8}, over=10),
     E("A1", word="clog", set={"dirt": 0.9}, over=10, sfx="squish", fx="flash"),
     E("A1", word="brain!", set={"dirt": 0.95}, over=12),
     E("A2", word="wash", set={"dirt": 1}, over=14, sfx="drip"),
     E("A2", word="now?", set={"gap": 0.05}, over=16),
   ],
   "lines": [
     L("A1", "gunk", "Don't sleep? I clog your brain!", "angry", "clog", src=[XIE, SHOK], cam="ecu 50 push"),
     L("A2", "gunk", "And who's going to wash me out now?", "angry", "wash", chat=True, beat=0.4),
   ], "props": []},
  {"id": "B", "set": "home",
   "cast": [{"who": "patient", "x": 300, "size": 960, "emotion": "happy", "pose": "rest", "y": 979},
            {"who": "melatonin", "x": 760, "size": 300, "emotion": "neutral", "pose": "rest", "y": 640}],
   "events": [
     E("B1", word="one", sfx="caption-pop"),
     E("B2", word="two", sfx="alarm-beep"),
     E("B2", word="crew", sfx="whoosh-soft"),
     E("B3", word="four", sfx="boing"),
     E("B3", word="Watch", sfx="swish"),
   ],
   "lines": [
     L("B1", "patient", "Just one more video...", "happy", "video", chat=True, cam="ms crash", react={"melatonin": "sleepy"}),
     L("B2", "melatonin", "It's two a.m. My night crew needs you asleep!", "neutral", "asleep", src=[XIE], cam="mcu push"),
     L("B3", "patient", "I'm fine on four hours. Watch me.", "happy", "four", chat=True, cam="cu push", react={"melatonin": "angry"}),
   ],
   "props": [tag("2 a.m.", "B2", "two"), {"kind": "clock", "x": 860, "y": 1000, "size": 200, "from": "B2", "word": "two", "to": "B2"}]},
  {"id": "C", "set": "macro",
   "cast": [{"who": "crew", "x": 540, "size": 300, "stage": True, "emotion": "happy", "pose": "rest"},
            {"who": "gunk", "x": 780, "size": 360, "emotion": "happy", "pose": "rest"}],
   "state": {"view": 1, "gap": 0, "wash": 0, "dirt": 0.5},
   "events": [
     E("start", set={"gap": 0.3}, over=20, sfx="whoosh-air"),
     E("C1", word="gaps", set={"gap": 0.8}, over=30, sfx="slide-whistle-up"),
     E("C1", word="wash", set={"wash": 1, "dirt": 0.2}, over=30, sfx="splash-small"),
     E("C2", word="sixty", set={"gap": 1}, over=20, sfx="ding"),
     E("C3", word="awake.", set={"gap": 0, "wash": 0}, over=14, sfx="record-scratch", fx="flash"),
     E("C3", word="Party!", set={"dirt": 0.8}, over=20, sfx="tada"),
     E("C4", word="night", set={"dirt": 0.9}, over=20, sfx="squelch"),
     E("C4", word="more", set={"dirt": 1}, over=14, sfx="alarm-beep"),
   ],
   "lines": [
     L("C1", "crew", "When you sleep, these gaps open up, and we wash the waste out.", "happy", "wash", src=[XIE], cam="ews whip"),
     L("C2", "crew", "In mice, they open sixty percent wider!", "happy", "sixty", src=[XIE], cam="mcu push"),
     L("C3", "gunk", "But he's still awake. No sleep, no wash. Party!", "happy", "party", chat=True, cam="cu"),
     L("C4", "crew", "One night awake, and scans of people show more of it!", "scared", "night", src=[SHOK], cam="mcu push"),
   ],
   "props": [tag("60% wider", "C2", "sixty")]},
  {"id": "D", "set": "home",
   "cast": [{"who": "patient", "x": 420, "size": 960, "emotion": "sleepy", "pose": "rest", "y": 979},
            {"who": "brain", "x": 780, "size": 300, "emotion": "scared", "pose": "rest", "y": 560}],
   "events": [
     E("start", sfx="whoosh-fast"),
     E("D1", word="slow.", sfx="slide-whistle-down"),
     E("D2", word="Seventeen", sfx="ding"),
     E("D2", word="drunk.", sfx="wobble"),
     E("D3", word="seconds", sfx="thud-soft", fx="flash"),
     E("D4", word="adds", sfx="sad-trombone"),
   ],
   "lines": [
     L("D1", "patient", "I'm fine. Just a bit... slow.", "sleepy", "slow", chat=True, cam="ms crash"),
     L("D2", "brain", "Seventeen hours awake? Some tests go as badly as being drunk.", "scared", "drunk", src=[WIL, NHE], cam="mcu push", react={"patient": "shocked"}),
     L("D3", "brain", "And you can fall asleep for seconds without knowing it.", "scared", "seconds", src=[NHE], cam="ews 24 lock", react={"patient": "sleepy"}),
     L("D4", "brain", "Lose sleep night after night, and it adds up.", "sad", "adds", src=[NHH], cam="mcu push", react={"patient": "sad"}),
   ],
   "props": [tag("17 hours", "D2", "Seventeen"), {"kind": "pain", "x": 420, "y": 600, "size": 120, "from": "D2", "word": "tests", "to": "D2", "on": "patient"}, {"kind": "pillow", "x": 420, "y": 1100, "size": 220, "from": "D3", "word": "seconds", "to": "D3"}, {"kind": "pain", "x": 420, "y": 600, "size": 120, "from": "D4", "word": "night", "to": "D4", "on": "patient"}]},
  {"id": "E", "set": "macro",
   "cast": [{"who": "gunk", "x": 540, "size": 460, "stage": True, "emotion": "scared", "pose": "rest"},
            {"who": "melatonin", "x": 300, "size": 260, "emotion": "happy", "pose": "rest"},
            {"who": "crew", "x": 800, "size": 260, "emotion": "happy", "pose": "rest"}],
   "state": {"view": 2, "gap": 0, "wash": 0, "dirt": 1},
   "events": [
     E("start", set={"gap": 0.2}, over=20, sfx="sparkle"),
     E("E1", word="down.", set={"gap": 0.5}, over=24, sfx="whoosh-soft"),
     E("E1", word="seven", set={"gap": 0.8}, over=24),
     E("E2", word="opening?", set={"gap": 1, "wash": 1}, over=20, sfx="splash-small"),
     E("E2", word="crew!", set={"dirt": 0.5}, over=30, sfx="gulp"),
     E("E3", word="sleep!", set={"dirt": 0.2}, over=30, sfx="zip-away"),
     E("E3", word="wash", set={"dirt": 0}, over=24, sfx="success-chime", fx="flash"),
     E("E3", word="clog", set={"gap": 0.9}, over=20, sfx="sparkle"),
   ],
   "lines": [
     L("E1", "melatonin", "Tonight: phone down. Seven hours or more.", "happy", "seven", src=[CDC, NHH], cam="mcu push"),
     L("E2", "gunk", "The gaps are opening? No, no, not the crew!", "scared", "crew", chat=True, cam="ews"),
     L("E3", "gunk", "You did sleep! Now they wash me out. I can't clog your brain!", "sad", "wash", src=[XIE], cam="push"),
   ],
   "props": [tag("7+ hours", "E1", "seven")]},
]

toon = {
  "slug": "no-sleep", "title": "What Happens If You Don't Sleep", "format": 5, "shape": "crew",
  "music": "no-sleep", "camera": "steady", "episode": 10,
  "hooks": [
    {"line": "Don't sleep? I clog your brain!", "why": "the owner's pick (2026-11-21): A cut to fit the 2-second hook rule (A was 9 words, about 3 s)"},
    {"line": "Don't sleep? Your brain fills with gunk!", "why": "says the villain's name"},
    {"line": "Don't sleep? I pile up in your head!", "why": "closest to A, 8 words"},
  ],
  "rooms": {"home": {"kind": "bedroom", "palette": "nightblue", "wall": "stripes", "floor": "wood",
                      "window": {"style": "wide", "side": "centre", "view": "night"}, "layout": "bed-left", "time": "night"}},
  "package": {
    "title": "What Happens If You Don't Sleep",
    "phrase": "what happens if you don't sleep",
    "opener": "What happens if you don't sleep? While you sleep, the spaces between brain cells open up and fluid washes waste away (shown in mice). After one night without sleep, brain scans of healthy people showed more beta-amyloid, a waste protein. After 17 to 19 hours awake, people did some tests as badly as at a blood alcohol level of 0.05%. Adults need 7 or more hours of sleep, says the CDC.",
    "question": "How many hours did you sleep last night?",
    "tags": ["what happens if you don't sleep", "sleep deprivation", "no sleep", "all nighter", "why we need sleep",
             "brain cleaning during sleep", "microsleep", "how much sleep do I need", "sleep health", "health cartoon"],
    "hashtags": "#sleep #brain #shorts",
    "cover": {"at": 1.0, "text": "Don't sleep?", "accent": "sleep"},
  },
  "retention": {
    "noIntro": {"scene": "A1", "line": "Don't sleep? I clog your brain!"},
    "promise": {"scene": "A2", "line": "And who's going to wash me out now?"},
    "question": {"scene": "A2", "line": "And who's going to wash me out now?"},
    "answer": {"scene": "E3", "line": "You did sleep! Now they wash me out. I can't clog your brain!"},
    "change3s": {"scene": "all", "line": "steady camera: something happens in the picture at least every 3 s (stickers do not count)"},
    "twist": {"scene": "D2", "line": "Seventeen hours awake? Some tests go as badly as being drunk."},
    "bestLast": {"scene": "E3", "line": "You did sleep! Now they wash me out. I can't clog your brain!"},
    "loop": {"scene": "E3", "line": "You did sleep! Now they wash me out. I can't clog your brain!"},
  },
  "sources": [
    {"id": XIE, "label": "Xie L et al. Sleep drives metabolite clearance from the adult brain. Science 2013;342:373-7", "url": "https://pubmed.ncbi.nlm.nih.gov/24136970/",
     "note": "In live mice, 'natural sleep or anesthesia are associated with a 60% increase in the interstitial space', with a 'striking increase in convective exchange of cerebrospinal fluid with interstitial fluid', which 'increased the rate of β-amyloid clearance during sleep'."},
    {"id": SHOK, "label": "Shokri-Kojori E et al. (NIH). β-Amyloid accumulation in the human brain after one night of sleep deprivation. PNAS 2018;115:4483-8", "url": "https://pubmed.ncbi.nlm.nih.gov/29632177/",
     "note": "In 20 healthy people, 'one night of sleep deprivation, relative to baseline, resulted in a significant increase in Aβ burden in the right hippocampus and thalamus' (PET scans). It does not show disease."},
    {"id": WIL, "label": "Williamson AM, Feyer AM. Moderate sleep deprivation produces impairments ... equivalent to legally prescribed levels of alcohol intoxication. Occup Environ Med 2000;57:649-55", "url": "https://pubmed.ncbi.nlm.nih.gov/10984335/",
     "note": "'After 17-19 hours without sleep ... performance on some tests was equivalent or worse than that at a BAC of 0.05%.' 39 subjects."},
    {"id": NHE, "label": "NHLBI (NIH). Sleep Deprivation and Deficiency: How Sleep Affects Your Health (updated 15 June 2022)", "url": "https://www.nhlbi.nih.gov/health/sleep-deprivation/health-effects",
     "note": "Microsleep is 'brief moments of sleep that happen when you're normally awake'; 'You can't control microsleep, and you might not be aware of it'; sleep deficiency 'harms your driving ability as much or more than being drunk'."},
    {"id": NHH, "label": "NHLBI (NIH). Sleep Deprivation and Deficiency: How Much Sleep Is Enough (updated 24 March 2022)", "url": "https://www.nhlbi.nih.gov/health/sleep-deprivation/how-much-sleep",
     "note": "Adults 18 or older: '7 to 8 hours a day'. 'If you regularly lose sleep or choose to sleep less than needed, the sleep loss adds up.'"},
    {"id": CDC, "label": "CDC. About Sleep (15 May 2024)", "url": "https://www.cdc.gov/sleep/about/index.html",
     "note": "Recommended sleep for adults 18-60 years: '7 or more hours'; 61-64 years: 7-9 hours; 65 and older: 7-8 hours."},
  ],
  "shots": shots,
  "musicPrompt": "Soft dreamy night lullaby on celesta and muted pizzicato strings, 96 BPM, a sneaky bassoon creeping in for the villain; it turns clumsy and off-beat when the hero stays awake, then resolves into a warm calm sunrise with gentle harp and a bright glockenspiel finish.",
}
with open(os.path.join(ROOT, "videos", "no-sleep", "toon.json"), "w") as fh:
    json.dump(toon, fh, indent=1, ensure_ascii=False)
    fh.write("\n")
print("wrote videos/no-sleep/toon.json")
