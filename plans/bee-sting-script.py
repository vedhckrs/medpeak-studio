"""Writes videos/bee-sting/toon.json (the script for the checker, the voices and the player). Run: python3 plans/bee-sting-script.py

Engine v9, script format 6, shape `visit` (plans/bee-sting-2026-11-23.md). The owner approved (2026-11-23): hook A ("A"), the
look sheets ("Start"). The fact budget of format 6 (decision 1): at most 3 sourced facts in the whole story, all in Dr. Mira's
answer here; the story SHOWS the tweezers and the card (actions and wishes, no claims), the answer says why (NHS).
"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def L(id, who, text, emo, key, src=None, chat=False, answer=False, care=False, beat=None, pause=None, speed=None):
    l = {"id": id, "who": who, "text": text, "emotion": emo, "pose": "rest", "key": key}
    if src: l["src"] = src
    if chat: l["chat"] = True
    if answer: l["answer"] = True
    if care: l["care"] = True
    if beat: l["beat"] = beat
    if pause is not None: l["pause"] = pause
    if speed: l["speed"] = speed  # a new take at this speaking speed (paid; toon-voice --only)
    return l

def E(at, act, word=None, set=None, over=None, sfx=None, delay=None):
    e = {"at": at, "act": act}
    if word: e["word"] = word
    if delay: e["delay"] = delay
    if set: e["set"] = set
    if over: e["over"] = over
    if sfx: e["sfx"] = sfx
    return e

STING, ANA = "nhs-insect-stings", "nhs-anaphylaxis"

shots = [
  # A: inside the skin (the stage lowered under a band of air), one framing held for the whole sting: the Stinger spears in,
  # the guards call the swell, Mom's giant tweezers come down (the Stinger cheers), the card sweeps him out sideways.
  {"id": "A", "set": "skin", "kind": "body",
   "cast": [{"who": "stinger", "x": 540, "size": 500}, {"who": "guard", "x": 820, "size": 250}],
   "voices": ["kid", "mom"],  # heard from the air above the skin (their hands and tools reach in)
   "state": {"wound": 0.5, "swelling": 0.1},
   "events": [
     E("start", "stinger: spears down through the surface with a thunk, wobbles, then throws both arms up and winks", over=60, sfx="thud-soft"),
     E("A2", "guard: the crew jumps at the shout from above", word="Ow"),
     E("A3", "guard: raises his STOP sign; the lump rises under the Stinger", word="swell", set={"swelling": 0.9}, over=40, sfx="squish"),
     E("B1", "mom: giant tweezers come down from the air, prongs open", word="tweezers", sfx="whoosh-soft"),
     E("B3", "guard: the crew jumps, arms out: no!", word="No"),
     E("B4", "kid: the tweezers pull back up out of frame", word="card", delay=0.4, sfx="swish"),
     E("B5", "stinger: a bank card's edge sweeps in sideways along the skin and flicks him out of frame", word="sideways", sfx="boing"),
   ],
   "lines": [
     L("A1", "stinger", "Bee sting! Bullseye! I'm staying right here.", "happy", "bullseye", chat=True ),
     L("A2", "kid", "Ow! A bee sting? What do I do?", "scared", "sting", chat=True),
     L("A3", "guard", "Intruder in the skin! Crew, swell it up!", "angry", "swell", chat=True),
     L("A4", "mom", "Oh no, honey, it's swelling up!", "scared", "swelling", chat=True),
     L("B1", "mom", "Hold still, honey. I'll pull it out with tweezers.", "neutral", "tweezers", chat=True),
     L("B2", "stinger", "Ooh, tweezers! Yes, squeeze me! Squeeze me hard!", "happy", "squeeze", chat=True ),
     L("B3", "guard", "No! Not the tweezers! Not the sac!", "scared", "no", chat=True),
     L("B4", "kid", "Wait, Mom! Use a card instead. Scrape it sideways.", "neutral", "card", chat=True),
     L("B5", "stinger", "Hey! Not sideways! Nooo!", "shocked", "sideways", chat=True),
     L("B6", "mom", "Got it out! Card it is.", "happy", "card", chat=True),
   ]},
  # C: the lump close up (the tissue under it), the crew resting under the soft redness.
  {"id": "C", "set": "tissue", "kind": "body",
   "cast": [{"who": "guard", "x": 540, "size": 340}],
   "state": {"damage": 0, "swelling": 1},
   "events": [
     E("start", "guard: the crew sits down under the red glow; the leader leans back", sfx="whoosh-soft"),
     E("C1", "guard: the two others yawn a big yawn", word="rest", delay=0.4),
   ],
   "lines": [
     L("C1", "guard", "Stinger's gone, crew. Now this lump can rest.", "neutral", "rest", chat=True, beat=0.8),
   ]},
  {"id": "K1", "set": "tissue", "card": "2 DAYS LATER", "seconds": 0.85, "same": "C", "src": [STING], "cast": [], "lines": []},
  {"id": "C", "set": "tissue", "kind": "body",
   "cast": [{"who": "guard", "x": 540, "size": 340}],
   "state": {"damage": 0, "swelling": 0.35},
   "events": [
     E("start", "guard: the crew stands and stretches; the redness is smaller", sfx="ding"),
   ],
   "lines": [
     L("C2", "guard", "Hmm. Smaller, but still here. Ask the doctor.", "neutral", "doctor", chat=True),
   ]},
  # D: Dr. Mira's pale clinic: Mom, Kid showing the small red lump on his hand, Mira's answer (slower), Kid's loop line.
  {"id": "D", "set": "clinic", "kind": "room",
   "cast": [{"who": "mom", "x": 210, "size": 900}, {"who": "kid", "x": 470, "size": 700}, {"who": "doctor", "x": 850, "size": 900}],
   "events": [
     E("D1", "kid: holds up his hand: a small red lump", word="lump"),
     E("D3", "doctor: smiles and nods at Kid", word="right"),
   ],
   "lines": [
     L("D1", "kid", "Doc, it still has a lump. Is that bad?", "scared", "lump", chat=True),
     L("D3", "doctor", "Scraping the bee sting out sideways was right. Tweezers squeeze out more poison.", "happy", "right", src=[STING], answer=True, pause=0.35),
     L("D4", "doctor", "A small swollen lump is normal. It should get better in a few days.", "neutral", "normal", src=[STING], answer=True),
     L("D5", "doctor", "But if lips or tongue swell, or breathing gets hard, get help right away.", "neutral", "help", src=[STING, ANA], answer=True, care=True),
     L("D6", "kid", "So next bee sting, card, right?", "happy", "card", chat=True),
   ]},
]

# the pace per line is set on the real voices (free remix) once they exist
toon = {
  "slug": "bee-sting", "title": "What Happens When a Bee Stings You", "format": 6, "shape": "visit",
  "music": "bee-sting",
  # check A4 (voices 3+ semitones apart in a scene), read on the cast's clips: Stinger ~169 Hz, Mom ~212 -> +3 (~252), Kid ~284 -> +2
  # (~319), Guard ~385, Dr. Mira ~208: every pair of a scene now 3+ semitones apart (free: a per-video pitch)
  # measured on the real clips (the samples misled: Chuck 275 Hz, not 209): mom -4 (~188), guard -5 (his shout under 250 Hz), kid +6 (~296),
  # stinger +5 (~367): 3+ semitones between every pair of the skin scene; the body lines above 250 Hz 3 of 7
  "pitch": {"mom": -4, "kid": 6, "guard": -5, "stinger": 5},
  "musicTrim": -2,
  "camera": "steady", "episode": 16, "caption": 2,
  "intruder": "stinger", "term": "bee sting",
  "musicPrompt": "Playful funk instrumental, slap bass, tight light percussion, bright clavinet stabs, 152 BPM, no lead melody in the voice range, short rests between phrases; a buzzing kazoo and plucky pizzicato strings for the sneaky stinger; from 34 seconds a brighter, confident second half for the doctor's answer; no vocals, ends on a clean button.",
  "hooks": [
    {"line": "Bee sting! Bullseye! I'm staying right here.", "why": "the owner's pick A (2026-11-23): inside the skin, the Stinger spears down and grins at the lens"},
    {"line": "Ow! A bee stung me!", "why": "B: the park, Kid swats a bee, then the dive into his hand"},
    {"line": "A bee sting and tweezers? Yes, squeeze me!", "why": "C: inside, giant tweezers descend at the lens, the Stinger rubbing his hands"},
  ],
  "rooms": {
    "clinic": {"palette": "sage", "wall": "paint", "floor": "carpet", "window": {"style": "round", "side": "right", "view": "city"},
               "layout": "desk", "chart": "body", "time": "day"},
  },
  "package": {
    "title": "What Happens When a Bee Stings You",
    "phrase": "what happens when a bee stings you",
    "opener": "What happens when a bee stings you? The sting usually leaves a small mark, and sometimes the stinger stays stuck in the skin (NHS). Brush or scrape it out sideways with a fingernail or the edge of a bank card; do not use tweezers, as you could squeeze poison out of it (NHS, CDC). Wash the area with soap and water, hold an ice pack wrapped in a cloth on it for up to 20 minutes, and keep it raised if you can (NHS). A small swollen lump is normal and should get better in a few days (NHS). Call your emergency number (999 in the UK, 911 in the US, 112 in the EU) at once if the lips, mouth, throat or tongue suddenly swell, or someone is struggling to swallow or breathe: these can be signs of a serious allergic reaction (NHS).",
    "question": "Did you know you should never use tweezers on a bee sting?",
    "tags": ["what happens when a bee stings you", "bee sting", "bee stings", "how to remove a bee sting", "bee sting tweezers",
             "bee sting swelling", "bee sting allergy", "stinger", "insect sting", "health cartoon"],
    "hashtags": "#beesting #health #shorts",
    "cover": {"at": 0.8, "text": "A bee stings you", "accent": "bee", "y": 220},  # the title in the air above the Stinger, off the guards' faces
  },
  "retention": {
    "noIntro": {"scene": "A1", "line": "Bee sting! Bullseye! I'm staying right here."},
    "promise": {"scene": "A1", "line": "Bee sting! Bullseye! I'm staying right here."},
    "question": {"scene": "A2", "line": "Ow! A bee sting? What do I do?"},
    "answer": {"scene": "D3", "line": "Scraping the bee sting out sideways was right. Tweezers squeeze out more poison."},
    "change3s": {"scene": "all", "line": "one action, then a hold"},
    "twist": {"scene": "D3", "line": "Scraping the bee sting out sideways was right. Tweezers squeeze out more poison."},
    "bestLast": {"scene": "D5", "line": "But if lips or tongue swell, or breathing gets hard, get help right away."},
    "loop": {"scene": "D6", "line": "So next bee sting, card, right?", "kind": "question"},
  },
  "sources": [
    {"id": STING, "label": "NHS. Insect bites and stings", "url": "https://www.nhs.uk/conditions/insect-bites-and-stings/",
     "note": "'Brush or scrape the stinger sideways with your fingernail or the edge of a bank card.' 'Do not use tweezers to pull out a stinger as you could squeeze poison out of it.' 'a small, swollen lump on the skin' 'The bite or sting should get better in a few days.' Call 999 if: 'suddenly has swollen lips, mouth, throat or tongue'; 'struggling to swallow'; 'breathing very fast or struggling to breathe'. Read on 2026-11-23."},
    {"id": ANA, "label": "NHS. Anaphylaxis", "url": "https://www.nhs.uk/conditions/anaphylaxis/",
     "note": "'Anaphylaxis is a life-threatening allergic reaction that happens very quickly.' Causes: 'insect stings, such as wasp and bee stings'. Read on 2026-11-23."},
  ],
  "shots": shots,
  "cta": {"read": "card", "text": "Bee sting? Know this. Scrape it out sideways. Never use tweezers. Swollen lips or hard breathing? Get help now. Follow MedPeak Health for more health tips that keep you safe.", "src": [STING, ANA]},
}

# Pace on the real voices (free remix; format 6, S6): the body cast faster (the Stinger's voice is slow), people near their
# own pace (the quick ones slower), Dr. Mira calmer. Voiced 2026-11-23: the story ran 64.8 s.
# Chuck (the Stinger since the re-cast) is quick: the body cast at its own pace; the clinic tighter so the body keeps 60%+
PACE = {"D1": 0.9, "A2": 1.05, "B1": 1.08, "B6": 1.05, "D6": 1.12, "B4": 1.15}
for sh in shots:
    for l in sh["lines"]:
        if l["who"] == "doctor": l["tempo"] = 0.86
        elif l["who"] in ("stinger", "guard"): l["tempo"] = 1.1
        else: l["tempo"] = PACE.get(l["id"], 1.0)

out = os.path.join(ROOT, "videos", "bee-sting")
os.makedirs(out, exist_ok=True)
with open(os.path.join(out, "toon.json"), "w") as f:
    json.dump(toon, f, indent=1, ensure_ascii=False)
    f.write("\n")
print("wrote videos/bee-sting/toon.json:", sum(len(s["lines"]) for s in shots), "lines")
