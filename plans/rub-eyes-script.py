"""Writes videos/rub-eyes/toon.json (the script for the checker, the voices and the player). Run: python3 plans/rub-eyes-script.py

Engine v9, script format 6, shape `visit` (plans/rub-eyes-2026-11-25.md). The owner approved (2026-11-25): hook A ("Hook A"),
the look sheets after the redraw in the reference style ("Looks good, build"). The first video under the opening rules O1-O5:
the whole eye fills the frame, red from frame 1, one place until the card, two characters (the germs arrive small, later).
Facts (at most 3): the germs on hands (story, NEI), rubbing hard and often (answer, PubMed reviews), what to do (answer, NHS).
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
    if speed: l["speed"] = speed
    return l

def E(at, act, word=None, set=None, over=None, sfx=None, delay=None):
    e = {"at": at, "act": act}
    if word: e["word"] = word
    if delay: e["delay"] = delay
    if set: e["set"] = set
    if over: e["over"] = over
    if sfx: e["sfx"] = sfx
    return e

NEI, RUB1, RUB2, CONJ = "nei-pink-eye", "pubmed-31343437", "pubmed-19512912", "nhs-conjunctivitis"

shots = [
  # A: the whole eye (side cut-away), red and itchy from frame 1; the Knuckles press down on the upper lid. ONE place until
  # the card (O2); the germs hop off the knuckles at A4 (small).
  {"id": "A", "set": "macro", "kind": "body",
   "cast": [{"who": "eye", "x": 470, "size": 1080, "stage": True, "emotion": "scared", "pose": "rest"},
            {"who": "knuckles", "x": 700, "size": 420, "emotion": "happy", "pose": "rest"}],
   "voices": ["kid"],  # heard from outside
   "state": {"red": 0.8, "squash": 0.7},
   "events": [
     E("start", "knuckles: already pressing on the upper lid, press in hard; the eye squashes and squints", over=80, sfx="squish"),
     E("A1", "knuckles: one more hard press, the eye wobbles", word="Harder"),
     E("A2", "eye: pushes up against the knuckles, one eye shut", word="dome"),
     E("A4", "knuckles: three small germs hop off onto the eye", word="friends", sfx="pop"),
   ],
   "lines": [
     L("A1", "knuckles", "Itchy eyes? Rub, rub, rub! Harder!", "happy", "rub", chat=True),
     L("A2", "eye", "Ow! You're squishing my dome!", "scared", "dome", chat=True),
     L("A3", "kid", "It itches so much. Is rubbing my eyes bad?", "sad", "rubbing", chat=True),
     L("A4", "knuckles", "Relax. I brought friends.", "happy", "friends", chat=True),
     L("A5", "eye", "Germs?! Kid, wash those hands before you touch me!", "angry", "Germs", chat=True, beat=0.6),
   ]},
  {"id": "K1", "set": "macro", "card": "MONTHS LATER", "seconds": 0.85, "same": "A", "src": [RUB1], "cast": [], "lines": []},
  # A again: the same framing, months of hard rubbing later: the dome thinner and pointed (the knuckles hovering above).
  {"id": "A", "set": "macro", "kind": "body",
   "cast": [{"who": "eye", "x": 470, "size": 1080, "stage": True, "emotion": "scared", "pose": "rest"},
            {"who": "knuckles", "x": 740, "size": 420, "emotion": "happy", "pose": "rest"}],
   "voices": ["kid"],
   "state": {"red": 0.6, "squash": 0.6, "cone": 1},
   "events": [
     E("start", "eye: looks down at his pointy dome, shocked"),
     E("B3", "knuckles: freeze mid-air, then lift away up", word="doctor", delay=0.8),
   ],
   "lines": [
     L("B1", "eye", "Hey! Why is my dome going thin and pointy?", "scared", "pointy", chat=True),
     L("B2", "knuckles", "Don't look at me. Keep rubbing!", "happy", "rubbing", chat=True),
     L("B2b", "eye", "Kid! Every rub squashes me!", "angry", "squashes", chat=True),
     L("B2c", "knuckles", "Squash, schmash. One more rub!", "happy", "Squash", chat=True),
     L("B3", "kid", "Hands off! I'm asking the doctor.", "neutral", "doctor", chat=True, beat=0.6),
   ]},
  # D: the clinic (grey wall): Kid (red itchy eyes) and the new doctor; the answer, slower.
  {"id": "D", "set": "clinic", "kind": "room",
   "cast": [{"who": "kid", "x": 300, "size": 700}, {"who": "doctor", "x": 815, "size": 900}],
   "events": [
     E("D1", "kid: rubs one eye with his fist, then stops himself", word="rub"),
     E("D3", "doctor: one open-hand gesture toward Kid", word="Instead"),
   ],
   "lines": [
     L("D1", "kid", "Doc, my eyes itch all day. Is it bad to rub?", "sad", "rub", chat=True),
     L("D2", "doctor", "Rubbing your eyes hard and often can thin the clear front of the eye and change its shape.", "neutral", "thin", src=[RUB1, RUB2], answer=True, pause=1.2),
     L("D3", "doctor", "Instead, hold a cold flannel on them, and wash your hands before you touch them.", "happy", "flannel", src=[CONJ, NEI], answer=True),
     L("D4", "doctor", "Eye pain, very red eyes, or changes in your vision? Get help fast.", "neutral", "help", src=[CONJ], answer=True, care=True),
     L("D5", "kid", "So: cold flannel, not knuckles!", "happy", "flannel", chat=True),
   ]},
  # B: the end, CLOSER on the calm eye's face (a second body framing, about 1.5x): the Knuckles give up and lift away.
  {"id": "B", "set": "macro", "kind": "body",
   "cast": [{"who": "eye", "x": 470, "size": 1080, "stage": True, "emotion": "happy", "pose": "rest"},
            {"who": "knuckles", "x": 740, "size": 420, "emotion": "sad", "pose": "rest"}],
   "state": {"red": 0.15, "squash": 0, "cone": 0},
   "events": [
     E("E0", "eye: a big relieved stretch of his lids", word="flannel"),
     E("E1", "knuckles: lift up and away out of the frame", word="out", sfx="slide-whistle-up"),
   ],
   "lines": [
     L("E0", "eye", "Ahh. A cold flannel. Clean hands. Bliss.", "happy", "flannel", chat=True),
     L("E0b", "knuckles", "Hey! Nobody needs me anymore?", "sad", "Nobody", chat=True),
     L("E1", "knuckles", "A cold flannel? Fine. I'm out!", "sad", "out", chat=True),
     L("E2", "eye", "Itchy eyes? No more rub, rub, rub.", "happy", "rub", chat=True),
   ]},
]

toon = {
  "slug": "rub-eyes", "title": "What Happens When You Rub Your Eyes", "format": 6, "shape": "visit",
  "music": "rub-eyes",
  # A4: Kid ~210 Hz at 0 (Jessica), the doctor ~213: Kid +6 (~296, as in bee-sting); the Eye (Mark ~349) +2 (~392), 4.9 st over Kid;
  # the Knuckles (Jerry B. ~166) 10+ st under the Eye, 9 under Kid
  "pitch": {"kid": 6, "eye": 2},
  "camera": "steady", "episode": 18, "caption": 2,
  "intruder": "knuckles", "term": "rub eyes",
  "musicPrompt": "Playful funk instrumental, bouncy slap bass, crisp light drums, squeaky muted trumpet and rubbery synth wobbles for the cheeky knuckles, 144 BPM, no lead melody in the voice range, short rests between phrases; from 20 seconds a tense, slower stretch with low plucks; from 30 seconds warm and calm for the doctor's answer; no vocals, ends on a clean button.",
  "hooks": [
    {"line": "Itchy eyes? Rub, rub, rub! Harder!", "why": "the owner's pick A (2026-11-25): the whole red eye fills the frame, giant knuckles press down on the lid"},
    {"line": "Please don't rub me. Please don't rub.", "why": "B: the watering eye looks at us as a knuckle shadow grows"},
    {"line": "Knuckles reporting for eye rubbing duty!", "why": "C: the knuckles crack above the eye, grinning"},
  ],
  "rooms": {
    "clinic": {"palette": "slate", "wall": "paint", "floor": "wood", "window": {"style": "round", "side": "left", "view": "city"},
               "layout": "exam-bed", "chart": "body", "time": "day"},
  },
  "package": {
    "title": "What Happens When You Rub Your Eyes",
    "phrase": "what happens when you rub your eyes",
    "opener": "What happens when you rub your eyes? Hands carry germs, so always wash your hands before touching your eyes (NEI). Rubbing hard and often is a known problem: reviews of the research say vigorous, prolonged rubbing may thin the clear front of the eye (the cornea) and lead to keratoconus, a change in its shape, and that the habit should be controlled, especially in children and people with eye allergies (PubMed reviews, 2009 and 2019). For itchy eyes, the NHS advises not rubbing them and holding a cold flannel on them for a few minutes to cool them down. Ask for an urgent appointment (NHS 111 in the UK) if you have eye pain, sensitivity to light, changes in your vision or very red eyes; for a chemical in the eye, a sharp object, a change in sight after an injury or severe pain, go to A&E or call your emergency number (999 in the UK, 911 in the US, 112 in the EU).",
    "question": "Did you know rubbing your eyes hard and often can change their shape?",
    "tags": ["what happens when you rub your eyes", "rubbing eyes", "eye rubbing", "keratoconus", "itchy eyes", "cornea",
             "eye health", "stop rubbing your eyes", "eye allergy", "health cartoon"],
    "hashtags": "#eyes #health #shorts",
    "cover": {"at": 0.8, "text": "You rub your eyes", "accent": "rub", "y": 1500},
  },
  "retention": {
    "noIntro": {"scene": "A1", "line": "Itchy eyes? Rub, rub, rub! Harder!"},
    "promise": {"scene": "A1", "line": "Itchy eyes? Rub, rub, rub! Harder!"},
    "question": {"scene": "A3", "line": "It itches so much. Is rubbing my eyes bad?"},
    "answer": {"scene": "D2", "line": "Rubbing your eyes hard and often can thin the clear front of the eye and change its shape."},
    "change3s": {"scene": "all", "line": "one action, then a hold"},
    "twist": {"scene": "D2", "line": "Rubbing your eyes hard and often can thin the clear front of the eye and change its shape."},
    "bestLast": {"scene": "D5", "line": "So: cold flannel, not knuckles!"},
    "loop": {"scene": "E2", "line": "Itchy eyes? No more rub, rub, rub.", "kind": "callback"},
  },
  "sources": [
    {"id": NEI, "label": "National Eye Institute (NIH). Pink eye", "url": "https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/pink-eye",
     "note": "'Always wash your hands before touching your eyes.' 'Viral and bacterial pink eye spread very easily from person to person' 'Avoid touching or rubbing your eyes.' Read on 2026-11-25."},
    {"id": RUB1, "label": "Ben-Eli H, Erdinest N, Solomon A. Pathogenesis and complications of chronic eye rubbing in ocular allergy. Curr Opin Allergy Clin Immunol 2019 (review)", "url": "https://pubmed.ncbi.nlm.nih.gov/31343437/",
     "note": "'Vigorous and prolonged rubbing may lead to establishment of corneal remodeling and ectatic disorders, such as keratoconus.' '...mechanical mechanisms of corneal thinning and its loss of rigidity...' 'Strategies eliminating eye rubbing and its consequences are vital, mainly among at-risk populations, such as young children and individuals with allergic ocular disorders...' Read on 2026-11-25 (PubMed abstract)."},
    {"id": RUB2, "label": "McMonnies CW. Mechanisms of rubbing-related corneal trauma in keratoconus. Cornea 2009 (review)", "url": "https://pubmed.ncbi.nlm.nih.gov/19512912/",
     "note": "'Responses to eye rubbing (and possible causal links) may include increased corneal temperature, epithelial thinning...' 'There appear to be indications for the control of chronic habits of abnormal rubbing.' Read on 2026-11-25 (PubMed abstract)."},
    {"id": CONJ, "label": "NHS. Conjunctivitis", "url": "https://www.nhs.uk/conditions/conjunctivitis/",
     "note": "'Hold a cold flannel on your eyes for a few minutes to cool them down.' 'do not rub your eyes' Urgent GP / NHS 111 if you have: 'pain in your eyes', 'sensitivity to light', 'changes in your vision, like wavy lines or flashing', 'very red eyes'. Read on 2026-11-25."},
  ],
  "shots": shots,
  "cta": {"read": "card", "text": "Itchy eyes? Know this. Don't rub them hard. Use a cold flannel. Eye pain or vision changes? Get help fast. Follow MedPeak Health for more.", "src": [RUB1, CONJ]},
}

for sh in shots:
    for l in sh["lines"]:
        if l["who"] == "doctor": l["tempo"] = 0.92
        elif l["who"] in ("eye", "knuckles"): l["tempo"] = 1.05
        else: l["tempo"] = 1.0

out = os.path.join(ROOT, "videos", "rub-eyes")
os.makedirs(out, exist_ok=True)
with open(os.path.join(out, "toon.json"), "w") as f:
    json.dump(toon, f, indent=1, ensure_ascii=False)
    f.write("\n")
print("wrote videos/rub-eyes/toon.json:", sum(len(s["lines"]) for s in shots), "lines")
