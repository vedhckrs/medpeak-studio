"""Writes videos/quit-smoking/toon.json (the script for the checker, the voices and the player). Run: python3 plans/quit-smoking-script.py

The engine v9 pilot, script format 6 (plans/quit-smoking-2026-11-23.md). The owner approved (2026-11-23): hook B ("B": open
INSIDE the chest, the grey tarry lungs coughing, the cilia crew asleep under the tar) and the look sheets ("Yes, write script").
Shape `visit`: the chest, the blood vessel, back to the chest after a time card, then Dr. Mira's answer. Three facts in the story
(NHS), the care line from the NHS cough page. Sweep (the cilia crew leader) speaks as `crew`; the CO gang as `co`.
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

def E(at, act, word=None, set=None, over=None, sfx=None, delay=None, stop=None):
    e = {"at": at, "act": act}
    if word: e["word"] = word
    if delay: e["delay"] = delay
    if set: e["set"] = set
    if over: e["over"] = over
    if sfx: e["sfx"] = sfx
    if stop: e["stop"] = stop
    return e

QUIT, BEN, COUGH = "nhs-quit-timeline", "nhs-quit-benefits", "nhs-cough"
HOOK_STATE = {"tar": 0.9, "mucus": 0.7, "airway": 0.3, "cough": 0.8, "pink": 0, "cilia": 0}
LATER_STATE = {"tar": 0.45, "mucus": 0.4, "airway": 1, "cough": 0, "pink": 0.55, "cilia": 1}

shots = [
  # B: hook B, inside the chest, one framing held: the grey, tarry lungs cough; the last thin curl of cigarette smoke drifts
  # down the windpipe and fizzles out; the lungs gasp. The cilia crew sleeps under the tar, then Sweep wakes and they stand.
  {"id": "B", "set": "lungs", "kind": "body",
   "cast": [{"who": "lungs", "x": 540, "size": 900}, {"who": "crew", "x": 540, "size": 340}],
   "state": HOOK_STATE,
   "events": [
     E("start", "lungs: a dusty cough; the last curl of cigarette smoke drifts down the windpipe and fizzles out", over=60, sfx="cough"),
     E("B1", "crew: the sleeping crew twitch at the shout; one snore bubble pops", word="wake"),
     E("B2", "crew: Sweep sits up in the tar, rubbing his eyes", word="years", set={"cilia": 0.2}, over=24),
     E("B4", "crew: the crew jumps up, brooms high", word="Brooms", set={"cough": 0}, over=18, sfx="pop"),
     E("B4", "crew: the crew starts sweeping the tar along the airway floor", delay=1.8, set={"cilia": 1}, over=30, sfx="swish"),
   ],
   "lines": [
     L("B1", "lungs", "He quit smoking? Crew, wake up!", "shocked", "quit", chat=True),
     L("B2", "crew", "Ugh. We've been asleep under this tar for years.", "sleepy", "tar", chat=True, pause=0.3),
     L("B3", "lungs", "No more naps, crew. Get up and get sweeping!", "angry", "sweeping", chat=True),
     L("B4", "crew", "Brooms up, team! Let's clean this place!", "happy", "brooms", chat=True),
     L("B5", "lungs", "Ha, look at them go! Tar, you're finished now!", "happy", "finished", chat=True),
   ]},
  # C: inside a blood vessel, one framing held: the CO gang lounges on the red cells like seats.
  {"id": "C", "set": "blood", "kind": "body",
   "cast": [{"who": "co", "x": 540, "size": 300}, {"who": "redcell", "x": 540, "size": 230}],
   "state": {"flow": 0.3, "co": 1, "pink": 0},
   "events": [
     E("start", "co: the gang leans back on the red cells, hands behind their heads", sfx="whoosh-soft"),
     E("C2", "co: one of them flicks ash off his band, smug", word="again", sfx="pop"),
   ],
   "lines": [
     L("C1", "co", "Relax, oxygen, these red seats are all ours.", "smug", "seats", chat=True),
     L("C2", "co", "He'll light up again. They always do.", "smug", "again", chat=True),
   ]},
  {"id": "K1", "set": "blood", "card": "8 HOURS LATER", "seconds": 1.0, "same": "C", "src": [QUIT], "cast": [], "lines": []},
  # C again: the same framing, 8 hours later: half the gang gone, the free cells redder (NHS: carbon monoxide halved).
  {"id": "C", "set": "blood", "kind": "body",
   "cast": [{"who": "co", "x": 540, "size": 300}, {"who": "redcell", "x": 540, "size": 230}],
   "state": {"flow": 0.3, "co": 0.5, "pink": 0.5},
   "events": [
     E("start", "co: the empty red cells glow redder; the gang left behind looks round, shocked", sfx="ding"),
     E("C3", "co: one more is shoved off his seat and tumbles out of frame", word="kicked", sfx="boing"),
     E("C4", "co: a bright oxygen bubble drops onto a free seat; the gang glares", word="oxygen", sfx="pop"),
   ],
   "lines": [
     L("C3", "co", "Hey! Half of us just got kicked out!", "shocked", "half", src=[QUIT]),
     L("C4", "co", "Ugh. And fresh oxygen is grabbing our seats!", "angry", "oxygen", chat=True, pause=0.4),
   ]},
  {"id": "K2", "set": "lungs", "card": "3 DAYS LATER", "seconds": 1.0, "same": "B", "src": [QUIT], "cast": [], "lines": []},
  # B again: the same chest framing, 3 days later: pinker, less tar, the airways open, the crew sweeping the mucus up and out.
  {"id": "B", "set": "lungs", "kind": "body",
   "cast": [{"who": "lungs", "x": 540, "size": 900}, {"who": "crew", "x": 540, "size": 340}],
   "state": LATER_STATE,
   "events": [
     E("start", "lungs: a big, slow, easy breath in; the airways open wide", over=40, sfx="whoosh-air"),
     E("D2", "crew: the crew sweeps a ball of mucus up the windpipe", word="up", set={"mucus": 0.6}, over=30, sfx="swish"),
     E("D3", "lungs: a HUGE cough; the mucus ball flies up and out of the top of the frame", word="coughing", set={"cough": 1}, over=12, sfx="cough"),
   ],
   "lines": [
     L("D1", "lungs", "Whoa. Breathing feels easier!", "happy", "easier", src=[QUIT]),
     L("D2", "crew", "Airways are open! Sweep it all up and out!", "happy", "sweep", chat=True),
     L("D4", "lungs", "Hey, careful down there, that really tickles!", "happy", "tickles", chat=True),
     L("D3", "lungs", "Then why am I coughing more?", "shocked", "coughing", chat=True),
   ]},
  # E: Dr. Mira's pale clinic. Dad, a hand on his chest (the symptom), asks; Mira answers, slower and calmer; Dad's loop line.
  {"id": "E", "set": "clinic", "kind": "room",
   "cast": [{"who": "dad", "x": 280, "size": 960}, {"who": "doctor", "x": 820, "size": 960}],
   "events": [
     E("E1", "dad: coughs into his fist, a hand on his chest", word="Doc", sfx="cough"),
     E("E3", "doctor: smiles and taps the lungs chart on the wall", word="good"),
     E("E5", "doctor: hands Dad a leaflet", word="support"),
     E("E7", "dad: pats his chest, grinning", word="crew"),
   ],
   "lines": [
     L("E1", "dad", "Doc, I quit smoking.", "neutral", "quit", chat=True),
     L("E2", "dad", "Why am I coughing more?", "scared", "coughing", chat=True),
     L("E3", "doctor", "That cough is a good sign after you quit smoking. Your lungs are clearing out mucus and toxins.", "happy", "clearing", src=[QUIT], answer=True),
     L("E5", "doctor", "Get support to quit. It really helps you quit for good.", "neutral", "support", src=[BEN], answer=True),
     L("E6", "doctor", "See a doctor if a cough lasts over three weeks, or brings up blood.", "neutral", "doctor", src=[COUGH], answer=True, care=True),
     L("E7", "dad", "Hear that, crew? I quit smoking for good!", "happy", "good", chat=True),
   ]},
]

toon = {
  "slug": "quit-smoking", "title": "What Happens When You Quit Smoking", "format": 6, "shape": "visit",
  "music": "quit-smoking", "camera": "steady", "episode": 15, "caption": 2,
  "intruder": "cigarette", "term": "smoking",
  "musicPrompt": "Playful funk instrumental, slap bass, tight light percussion, bright clavinet stabs, 148 BPM, no lead melody in the voice range, short rests between phrases; a wheezy harmonica that turns bright and breezy as the lungs heal; from 33 seconds a brighter, confident second half for the doctor's answer; no vocals, ends on a clean button.",
  "hooks": [
    {"line": "Last one. Done!", "why": "A: night balcony, Dad snaps the cigarette with a crack; then inside, the lungs: \"He QUIT smoking?!\""},
    {"line": "He quit smoking? Crew, wake up!", "why": "the owner's pick B (2026-11-23: \"B\"): inside first, the grey tarry lungs coughing, the cilia crew asleep under the tar"},
    {"line": "He quit smoking? Then we're getting kicked out!", "why": "C: the CO gang lounging on the red cells like seats"},
  ],
  "rooms": {
    "clinic": {"palette": "mint", "wall": "paint", "floor": "carpet", "window": {"style": "tall", "side": "left", "view": "garden"},
               "layout": "desk", "chart": "lungs", "time": "day"},
  },
  "package": {
    "title": "What Happens When You Quit Smoking",
    "phrase": "what happens when you quit smoking",
    "opener": "What happens when you quit smoking? Coughing more at first is usually a good sign: your lungs are clearing out the mucus and toxins built up from smoking, and your airways are cleaning themselves (NHS). After 8 hours the carbon monoxide in your blood halves and your oxygen levels recover; after 72 hours breathing can feel easier because your bronchial tubes start to relax (NHS). Getting support can really increase your chances of quitting for good (NHS). See a doctor if a cough lasts more than 3 weeks, and get urgent help if you cough up blood or find it hard to breathe (NHS).",
    "question": "Did you know coughing more after you quit can be a good sign?",
    "tags": ["what happens when you quit smoking", "quit smoking", "quitting smoking", "stop smoking", "smoker's cough",
             "coughing after quitting smoking", "lungs after quitting smoking", "carbon monoxide", "cilia", "health cartoon"],
    "hashtags": "#quitsmoking #health #shorts",
    "cover": {"at": 0.8, "text": "You quit smoking", "accent": "quit"},
  },
  "retention": {
    "noIntro": {"scene": "B1", "line": "He quit smoking? Crew, wake up!"},
    "promise": {"scene": "B1", "line": "He quit smoking? Crew, wake up!"},
    "question": {"scene": "B1", "line": "He quit smoking? Crew, wake up!"},
    "answer": {"scene": "E3", "line": "That cough is a good sign after you quit smoking. Your lungs are clearing out mucus and toxins."},
    "change3s": {"scene": "all", "line": "one action, then a hold"},
    "twist": {"scene": "E3", "line": "That cough is a good sign after you quit smoking. Your lungs are clearing out mucus and toxins."},
    "bestLast": {"scene": "E6", "line": "See a doctor if a cough lasts over three weeks, or brings up blood."},
    "loop": {"scene": "E7", "line": "Hear that, lungs? I quit smoking for good!"},
  },
  "sources": [
    {"id": QUIT, "label": "NHS Better Health. What could happen when you quit smoking", "url": "https://www.nhs.uk/better-health/quit-smoking/ready-to-quit-smoking/what-could-happen-when-you-quit-smoking/",
     "note": "'After 8 hours Your oxygen levels are recovering, and the harmful carbon monoxide level in your blood will have reduced by half.' 'After 72 hours If you notice that breathing feels easier, it's because your bronchial tubes have started to relax.' 'Your lungs are clearing out all the toxins and mucus built up from smoking. So, you may notice an increase in coughing or phlegm, which is a good sign that your body is doing its job of cleaning out your airways.' Read on 2026-11-23."},
    {"id": BEN, "label": "NHS Better Health. Benefits of quitting smoking", "url": "https://www.nhs.uk/better-health/quit-smoking/why-quit-smoking/benefits-of-quitting-smoking/",
     "note": "'Research shows getting support can really increase your chances of quitting for good.' Read on 2026-11-23."},
    {"id": COUGH, "label": "NHS. Cough", "url": "https://www.nhs.uk/symptoms/cough/",
     "note": "See a GP if: 'you've had a cough for more than 3 weeks (persistent cough)'. Ask for an urgent GP appointment or get help from NHS 111 if: 'you're coughing up blood'. Read on 2026-11-23."},
  ],
  "shots": shots,
  "cta": {"text": "Follow MedPeak Health for more health tips that keep you safe.", "src": [QUIT]},
}

out = os.path.join(ROOT, "videos", "quit-smoking")
os.makedirs(out, exist_ok=True)
with open(os.path.join(out, "toon.json"), "w") as f:
    json.dump(toon, f, indent=1, ensure_ascii=False)
    f.write("\n")
print("wrote videos/quit-smoking/toon.json:", sum(len(s["lines"]) for s in shots), "lines")
