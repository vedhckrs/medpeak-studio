"""Writes videos/stop-alcohol/toon.json (the script for the checker, the voices and the player). Run: python3 plans/stop-alcohol-script.py

Engine v9, script format 6, shape `visit` (plans/stop-alcohol-2026-11-24.md). The owner approved (2026-11-24): hook A ("Hook A"),
the look sheets ("Looks good, build"). The fact budget of format 6: at most 3 sourced facts in the whole story: the sleep line
in the story (NHS), the liver and the care point in the doctor's answer (NHS).
"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def L(id, who, text, emo, key, src=None, chat=False, answer=False, care=False, beat=None, pause=None):
    l = {"id": id, "who": who, "text": text, "emotion": emo, "pose": "rest", "key": key}
    if src: l["src"] = src
    if chat: l["chat"] = True
    if answer: l["answer"] = True
    if care: l["care"] = True
    if beat: l["beat"] = beat
    if pause is not None: l["pause"] = pause
    return l

def E(at, act, word=None, set=None, over=None, sfx=None, delay=None):
    e = {"at": at, "act": act}
    if word: e["word"] = word
    if delay: e["delay"] = delay
    if set: e["set"] = set
    if over: e["over"] = over
    if sfx: e["sfx"] = sfx
    return e

CUT, AUD, ARLD = "nhs-cutting-down", "nhs-alcohol-use-disorder", "nhs-arld"

shots = [
  # A: NIGHT. The whole Liver fills the frame on the dusky indigo place, mop in hand, amber puddles all over him; Booze splashes
  # down on his top right edge and grins at the lens; drops keep falling. Dad's voice from above ends the night.
  {"id": "A", "set": "macro", "kind": "body",
   "cast": [{"who": "liver", "x": 540, "size": 1080, "stage": True, "emotion": "sleepy", "pose": "rest"},
            {"who": "booze", "x": 790, "size": 300, "emotion": "happy", "pose": "rest"}],
   "voices": ["dad"],  # heard from outside the body
   "state": {"mess": 1, "rain": 1},
   "events": [
     E("start", "booze: drops in from the top of the frame, SPLASHES onto the liver's edge (splash drops fly), squashes, throws both arms up and winks", over=80, sfx="splash-small"),
     E("A1", "liver: jolts as the splash lands, the mop wobbles", word="drinking"),
     E("A2", "liver: one slow, heavy mop stroke, then his eyes droop", word="mess"),
     E("A2c", "booze: a fresh drop splats down beside him", word="round", sfx="drip"),
     E("A3", "liver: looks up at the voice; the falling drops stop", word="drinks", delay=0.8, set={"rain": 0}),
     E("A4", "booze: points up, laughing", word="Friday"),
   ],
   "lines": [
     L("A1", "booze", "Drink number four! Never stop drinking! Scrub, Liver!", "happy", "drink", chat=True),
     L("A2", "liver", "More mess! I never catch up.", "sad", "mess", chat=True),
     L("A2b", "liver", "If he'd just stop drinking, could I recover?", "sad", "recover", chat=True),
     L("A2c", "booze", "Never! Here comes another round!", "happy", "round", chat=True),
     L("A3", "dad", "That's it. I'm done with drinks.", "neutral", "done", chat=True, beat=1.0),
     L("A4", "booze", "Ha! He'll be back by Friday.", "happy", "Friday", chat=True),
   ]},
  {"id": "K1", "set": "macro", "card": "THE NEXT MORNING", "seconds": 0.85, "same": "A", "src": [CUT], "cast": [], "lines": []},
  # B: THE NEXT MORNING, the same framing on the sunrise place: no new drops, the puddles mopped up; Booze has shrunk into the
  # corner. Then Grandpa's voice: "all at once, tonight!": the Liver drops his mop.
  {"id": "A", "set": "macro", "kind": "body",
   "cast": [{"who": "liver", "x": 540, "size": 1080, "stage": True, "emotion": "happy", "pose": "rest"},
            {"who": "booze", "x": 940, "size": 160, "emotion": "sad", "pose": "rest"}],
   "voices": ["dad", "grandpa"],
   "state": {"mess": 0.15, "rain": 0},
   "events": [
     E("start", "liver: stretches both arms up, wide awake; last night's puddles still there", sfx="ding"),
     E("B2", "liver: one big mop swipe, every puddle gone", word="catching", set={"mess": 0}),
   ],
   "lines": [
     L("B1", "dad", "Whoa. I slept so deep. I feel good!", "happy", "slept", src=[CUT], chat=True),
     L("B2", "liver", "No new mess! I'm finally catching up.", "happy", "catching", chat=True),
   ]},
  # B: the twist, a CLOSER framing of the morning liver (his face and Booze in the corner): Grandpa's "all at once"
  {"id": "B", "set": "macro", "kind": "body",
   "cast": [{"who": "liver", "x": 540, "size": 1080, "stage": True, "emotion": "happy", "pose": "rest"},
            {"who": "booze", "x": 940, "size": 160, "emotion": "sad", "pose": "rest"}],
   "voices": ["grandpa"],
   "state": {"mess": 0, "rain": 0},
   "events": [
     E("B3", "booze: shrinks smaller in the corner, waving for help", word="friend"),
     E("C1", "liver: DROPS his mop (it clatters down), both hands up", word="once", sfx="bonk"),
     E("C3", "booze: rubs his hands, a sly grin", word="bumpy"),
   ],
   "lines": [
     L("B3", "booze", "Hey! Somebody pour me a friend!", "sad", "friend", chat=True),
     L("C1", "grandpa", "I drink every day. I'll quit too, all at once!", "happy", "once", chat=True, pause=0.4),
     L("C2", "liver", "Wait! Not like that!", "scared", "Wait", chat=True),
     L("C3", "booze", "Ooh. This could get bumpy.", "happy", "bumpy", chat=True),
   ]},
  # D: the clinic (a cream wall): Grandpa, Dad and the new doctor; the answer (slower), the loop.
  {"id": "D", "set": "clinic", "kind": "room",
   "cast": [{"who": "grandpa", "x": 200, "size": 900}, {"who": "dad", "x": 470, "size": 900}, {"who": "doctor", "x": 880, "size": 900}],
   "events": [
     E("D1", "dad: a hand on his side, over his liver", word="liver"),
     E("D2", "grandpa: a hand on his chest, worried", word="once", delay=0.8),
     E("D3", "doctor: nods at Dad", word="recover"),
     E("D4", "doctor: turns to Grandpa, one open-hand gesture", word="depends"),
     E("D6", "grandpa: nods, a hand on his chest", word="help"),
   ],
   "lines": [
     L("D1", "dad", "Doc, I stopped. Can my liver heal?", "neutral", "liver", chat=True),
     L("D2", "grandpa", "Can I stop all at once?", "neutral", "once", chat=True, beat=1.0),
     L("D3", "doctor", "If you stop drinking, your liver can often recover.", "happy", "recover", src=[ARLD], answer=True, pause=0.35),
     L("D4", "doctor", "But if your body depends on alcohol, stopping suddenly can be very dangerous. Get medical help before you stop.", "neutral", "depends", src=[AUD], answer=True, care=True),
     L("D5", "doctor", "Shaking or confusion? Get emergency help right away.", "neutral", "emergency", src=[AUD], answer=True, care=True),
     L("D6", "grandpa", "Then I'll stop with my doctor's help.", "happy", "doctor", chat=True),
   ]},
  # back in the liver, the morning place: Booze gives up and rolls away out of frame; the Liver waves him off (the loop).
  {"id": "A", "set": "macro", "kind": "body",
   "cast": [{"who": "liver", "x": 540, "size": 1080, "stage": True, "emotion": "happy", "pose": "rest"},
            {"who": "booze", "x": 940, "size": 160, "emotion": "sad", "pose": "rest"}],
   "state": {"mess": 0, "rain": 0},
   "events": [
     E("E2", "booze: hops down and rolls away out of the frame; the Liver waves the mop", word="Fine", sfx="slide-whistle-down"),
   ],
   "lines": [
     L("E1", "liver", "Hear that, Booze? With a doctor!", "happy", "doctor", chat=True),
     L("E2", "booze", "Fine! No drink, no scrub. Bye, Liver!", "sad", "Bye", chat=True),
   ]},
]

toon = {
  "slug": "stop-alcohol", "title": "What Happens When You Stop Drinking Alcohol", "format": 6, "shape": "visit",
  "music": "stop-alcohol",
  "camera": "steady", "episode": 17, "caption": 2,
  "intruder": "booze", "term": "drink",
  # a new topic track (memory: new music every video): late-night lounge turning into a sunny morning
  "musicPrompt": "Playful jazzy funk instrumental, walking upright bass, brushed drums, muted trumpet stabs and a tipsy honky-tonk piano for the sneaky Booze, 138 BPM, no lead melody in the voice range, short rests between phrases; from 20 seconds a bright sunrise lift with glockenspiel and clean guitar; from 34 seconds calm and warm for the doctor's answer; no vocals, ends on a clean button.",
  "hooks": [
    {"line": "Drink number four! Never stop drinking! Scrub, Liver!", "why": "the owner's pick A (2026-11-24): the whole Liver fills the frame, Booze splashes down and grins at the lens"},
    {"line": "Please... I need one night off.", "why": "B: the exhausted Liver holds up a CLOSED sign, drops keep splashing past it"},
    {"line": "Stop drinking? Ha! Watch the liver beg.", "why": "C: Booze surfs down a waterfall of drinks into the liver"},
  ],
  "rooms": {
    "clinic": {"palette": "cream", "wall": "paint", "floor": "checker", "window": {"style": "arch", "side": "left", "view": "hills"},
               "layout": "desk", "chart": "body", "time": "day"},
  },
  "package": {
    "title": "What Happens When You Stop Drinking Alcohol",
    "phrase": "what happens when you stop drinking alcohol",
    "opener": "What happens when you stop drinking alcohol? Drinking can disrupt your sleep and stop you sleeping deeply, so cutting down should help you feel more rested when you wake up (NHS). The NHS lists other quick changes: feeling better in the mornings, being less tired during the day, better-looking skin, feeling more energetic and better weight management. If you stop drinking, your liver can often recover (NHS). But if your body is dependent on alcohol, it can be very dangerous to stop suddenly: get medical help before you stop or cut down (NHS). Withdrawal symptoms usually begin within 6 to 12 hours of the last drink (NHS). Call your emergency number (999 in the UK, 911 in the US, 112 in the EU) if someone has severe withdrawal symptoms after stopping, such as visible shaking, confusion, seeing or hearing things that are not there, or a seizure (NHS). If you are worried about your drinking, talk to a doctor or a local alcohol support service.",
    "question": "Did you know stopping alcohol all at once can be dangerous for some people?",
    "tags": ["what happens when you stop drinking alcohol", "stop drinking alcohol", "quit drinking", "alcohol and liver",
             "liver recovery", "alcohol withdrawal", "sleep after quitting alcohol", "sober", "liver", "health cartoon"],
    "hashtags": "#quitdrinking #health #shorts",
    "cover": {"at": 0.8, "text": "You stop drinking", "accent": "stop", "y": 1500},  # the title low, under the Liver's face
  },
  "retention": {
    "noIntro": {"scene": "A1", "line": "Drink number four! Never stop drinking! Scrub, Liver!"},
    "promise": {"scene": "A1", "line": "Drink number four! Never stop drinking! Scrub, Liver!"},
    "question": {"scene": "A2b", "line": "If he'd just stop drinking, could I recover?"},
    "answer": {"scene": "D3", "line": "If you stop drinking, your liver can often recover."},
    "change3s": {"scene": "all", "line": "one action, then a hold"},
    "twist": {"scene": "D4", "line": "But if your body depends on alcohol, stopping suddenly can be very dangerous. Get medical help before you stop."},
    "bestLast": {"scene": "D5", "line": "Shaking or confusion? Get emergency help right away."},
    "loop": {"scene": "E2", "line": "Fine! No drink, no scrub. Bye, Liver!", "kind": "callback"},
  },
  "sources": [
    {"id": CUT, "label": "NHS. Tips on cutting down alcohol", "url": "https://www.nhs.uk/live-well/alcohol-advice/tips-on-cutting-down-alcohol/",
     "note": "'Although it can help some people fall asleep quickly, it can disrupt your sleep patterns and stop you sleeping deeply.' 'So cutting down on alcohol should help you feel more rested when you wake up.' The immediate effects of cutting down include: 'feeling better in the mornings', 'being less tired during the day', 'better-looking skin', 'feeling more energetic', 'better weight management'. Read on 2026-11-24."},
    {"id": AUD, "label": "NHS. Alcohol-use disorder: treatment", "url": "https://www.nhs.uk/conditions/alcohol-misuse/treatment/",
     "note": "'It can be very dangerous to stop drinking suddenly if you're dependent on alcohol.' 'If you get withdrawal symptoms, get medical help before you try to stop drinking.' 'Withdrawal symptoms begin within 6 to 12 hours of your last drink, and usually last from 3 to 7 days.' Call 999 or go to A&E if someone has severe withdrawal symptoms after stopping drinking alcohol, such as: 'shaking visibly', 'confusion (for example, not knowing what day it is)', 'seeing, hearing, or feeling things that are not there', 'having a seizure'. Read on 2026-11-24."},
    {"id": ARLD, "label": "NHS. Alcohol-related liver disease", "url": "https://www.nhs.uk/conditions/alcohol-related-liver-disease-arld/",
     "note": "'If you stop drinking, your liver can often recover.' 'If you regularly drink too much alcohol it can be very dangerous to stop drinking suddenly.' 'Get medical help before you try to stop drinking.' Read on 2026-11-24."},
  ],
  "shots": shots,
  "cta": {"read": "card", "text": "Stopping alcohol? Know this. Your liver can often recover. Drink every day? Don't stop suddenly. Get medical help first. Shaking or confusion? Get emergency help. Follow MedPeak Health for more health tips that keep you safe.", "src": [ARLD, AUD]},
}

# the pace per line is set on the real voices (free remix) once they exist; a first guess by role
for sh in shots:
    for l in sh["lines"]:
        if l["who"] == "doctor": l["tempo"] = 0.88
        elif l["who"] in ("booze", "liver"): l["tempo"] = 1.1
        else: l["tempo"] = 1.0

out = os.path.join(ROOT, "videos", "stop-alcohol")
os.makedirs(out, exist_ok=True)
with open(os.path.join(out, "toon.json"), "w") as f:
    json.dump(toon, f, indent=1, ensure_ascii=False)
    f.write("\n")
print("wrote videos/stop-alcohol/toon.json:", sum(len(s["lines"]) for s in shots), "lines")
