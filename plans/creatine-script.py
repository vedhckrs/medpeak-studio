"""Writes videos/creatine/toon.json (the script for the checker and the player). Run: python3 plans/creatine-script.py"""
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

KR, AN, BR, RA, AL, LAK = "kreider-2017", "antonio-2021", "branch-2003", "raihan-2026", "almeida-2026", "lak-2025"

shots = [
  # A: the hook. Mom steps on the gym scale, the needle SLAMS into the red on "jumps" (a cold open in the gym), then the
  # camera dives into her arm: inside the muscle, the cell already swollen with water (the consequence), Crea in the middle.
  {"id": "A", "set": "macro",
   "cast": [{"who": "crea", "x": 540, "size": 420, "stage": True, "emotion": "happy", "pose": "rest"}],
   "state": {"view": 1, "water": 0.8, "flex": 0},
   "events": [
     E("start", set={"water": 0.85}, over=6, sfx="thud-soft"),  # she steps on: the platform drops
     E("A1", word="jumps!", set={"water": 0.9}, over=8, sfx="boing", fx="flash"),  # the needle slams into the red
     E("A2", set={"water": 0.95}, over=8),  # the cell swells as the dive begins
     E("A2", word="scale", sfx="whoosh-fast"),  # the dive into her arm
     E("A2", word="fat?", set={"water": 1}, over=16, sfx="drip"),
   ],
   "lines": [
     dict(L("A1", "crea", "Take creatine? Your scale jumps!", "happy", "jumps", src=[AN], cam="ecu 50 push"), tempo=1.1),  # voiced 2.1 s; the hook rule is 2 s (free retime)
     L("A2", "crea", "Your scale jumps... is it fat?", "happy", "fat", chat=True, beat=0.3),
   ], "props": []},
  # B: the gym. Mom on the scale with her shaker: she only started this week.
  {"id": "B", "set": "home",
   "cast": [{"who": "mom", "x": 400, "size": 960, "emotion": "shocked", "pose": "rest", "y": 979}],
   "events": [
     E("B1", word="started", sfx="record-scratch"),
     E("B1", word="week!", sfx="wobble"),
   ],
   "lines": [
     L("B1", "mom", "What? I only started creatine this week!", "shocked", "week", chat=True, cam="mcu push"),
   ], "props": []},
  # C: the blood. Crea rides the stream with the red cells toward the fork.
  {"id": "C", "set": "macro",
   "cast": [{"who": "crea", "x": 600, "size": 420, "stage": True, "emotion": "happy", "pose": "rest"}],
   "state": {"view": 0, "crea": 0.5},
   "events": [
     E("start", set={"crea": 0.7}, over=20, sfx="whoosh-fast"),
     E("C1", word="blood.", set={"crea": 0.9}, over=20, sfx="splash-small", delay=0.45),  # in the pause after the word (on it, it was lost)
     E("C2", word="percent", sfx="ding"),
     E("C2", word="muscles.", set={"crea": 1}, over=16, sfx="zip-away"),
   ],
   "lines": [
     L("C1", "crea", "Almost all of me gets into your blood.", "happy", "blood", src=[KR], cam="ews whip"),
     L("C2", "crea", "And ninety-five percent of me heads for your muscles.", "happy", "muscles", src=[KR], cam="mcu push"),
   ], "props": []},
  # D: inside a muscle cell. The lift drains the batteries; Crea's sparks recharge them.
  {"id": "D", "set": "macro",
   "cast": [{"who": "battery", "x": 540, "size": 330, "stage": True, "emotion": "scared", "pose": "rest"},
            {"who": "crea", "x": 380, "size": 320, "emotion": "angry", "pose": "rest"},
            {"who": "muscle", "x": 700, "size": 360, "emotion": "happy", "pose": "rest"}],
   "state": {"view": 1, "flex": 0, "drain": 0, "charge": 0, "water": 0},
   "events": [
     E("D1", word="lift!", set={"flex": 1, "drain": 0.5}, over=10, sfx="thud-soft", fx="flash"),
     E("D1", word="flat!", set={"drain": 1}, over=16, sfx="slide-whistle-down"),
     E("D2", word="Spark", sfx="whoosh-air"),
     E("D2", word="Recharged!", set={"charge": 1, "flex": 0.4}, over=20, sfx="sparkle"),
     E("D3", word="power", set={"flex": 0.7}, over=10),
     E("D3", word="bursts.", set={"flex": 1}, over=10, sfx="swish"),
     E("D4", word="run?", set={"flex": 0.2}, over=20, sfx="slide-whistle-down"),
     E("D4", word="barely", set={"drain": 0.6}, over=16),
   ],
   "lines": [
     L("D1", "battery", "Heavy lift! We're going flat!", "scared", "flat", src=[KR], cam="ews whip"),
     L("D2", "crea", "Spark coming! Recharged!", "angry", "recharged", src=[KR], cam="mcu push", react={"battery": "happy"}),
     L("D3", "muscle", "A bit more power for short, hard bursts.", "happy", "bursts", src=[BR], cam="mcu push"),
     L("D4", "muscle", "A long run? Studies say it barely helps.", "sad", "barely", src=[BR]),
   ], "props": []},
  # E: the kidney filter, the twist. Creatinine chips pass the filter; the blood test looks like kidney trouble.
  {"id": "E", "set": "macro",
   "cast": [{"who": "kidney", "x": 250, "size": 380, "stage": True, "emotion": "scared", "pose": "rest"},
            {"who": "crea", "x": 780, "size": 280, "emotion": "neutral", "pose": "rest"}],
   "state": {"view": 2, "bits": 0.2},
   "events": [
     E("start", set={"bits": 0.4}, over=20, sfx="whoosh-air"),
     E("E1", word="creatinine.", set={"bits": 1}, over=24, sfx="plop"),
     E("E2", word="blood", set={"bits": 0.85}, over=10, sfx="alarm-beep", fx="flash"),  # the blood-test card pops up, its number red
     E("E2", word="Looks", set={"bits": 1}, over=10),
     E("E2", word="trouble!", sfx="gasp"),
     E("E3", word="no", set={"bits": 0.6}, over=20, sfx="success-chime"),
   ],
   "lines": [
     L("E1", "crea", "A little of me breaks down into creatinine.", "neutral", "creatinine", src=[KR], cam="ews whip"),
     L("E2", "kidney", "Your blood test shows more of it. Looks like kidney trouble!", "scared", "trouble", src=[RA, AL], cam="mcu push"),
     L("E3", "kidney", "But in trials with healthy adults, no kidney harm was found.", "happy", "harm", src=[RA, AL]),
   ], "props": []},
  # F: the clinic, the end of the journey. Dr. Mira explains; Mom asks about her hair.
  {"id": "F", "set": "clinic",
   "cast": [{"who": "doctor", "x": 270, "size": 960, "emotion": "neutral", "pose": "rest", "y": 979},
            {"who": "mom", "x": 800, "size": 960, "emotion": "neutral", "pose": "rest", "y": 979}],
   "events": [
     E("F1", word="blood", sfx="ding"),
     E("F3", word="hair?", sfx="boing"),
     E("F5", word="no", sfx="success-chime"),
   ],
   "lines": [
     dict(L("F1", "doctor", "Taking creatine? Tell me before a blood test.", "neutral", "blood", src=[AN], cam="mcu push"), tempo=1.12),  # voiced, the clinic had a 3.3 s stretch with nothing new (free retime)
     dict(L("F2", "doctor", "Kidney problems already? Ask before you take it.", "neutral", "kidney", src=[AN], cam="ecu push"), tempo=1.15),  # voiced 3.3 s on one picture (limit 3): free retime
     L("F3", "mom", "And my hair?", "shocked", "hair", chat=True, cam="ms crash"),
     L("F4", "doctor", "A trial over twelve weeks...", "happy", "twelve", src=[LAK], cam="mcu push"),
     L("F5", "doctor", "found no hair loss.", "happy", "hair", src=[LAK], cam="ecu push", react={"mom": "happy"}),
   ], "props": [tag("12 weeks", "F4", "twelve", x=540, y=300)]},
  # G: back inside her muscle, the answer: the swollen cell is water, not fat (loops back to the hook).
  {"id": "G", "set": "macro",
   "cast": [{"who": "crea", "x": 540, "size": 440, "stage": True, "emotion": "happy", "pose": "rest"}],
   "state": {"view": 1, "water": 0.3, "flex": 0},
   "events": [
     E("start", set={"water": 0.6}, over=20, sfx="whoosh-air"),
     E("G1", word="That's", set={"water": 0.8}, over=12),
     E("G1", word="water", set={"water": 1}, over=30, sfx="drip"),
     E("G1", word="creatine.", set={"flex": 0.5}, over=12),
     E("G1", word="fat!", sfx="tada", delay=0.6),  # after his last word (at 0.35 s it was lost)
   ],
   "lines": [
     L("G1", "crea", "Your scale jumps? That's water in your muscles from creatine. Not fat!", "happy", "water", src=[AN], cam="push"),
   ], "props": []},
]

toon = {
  "slug": "creatine", "title": "What Happens When You Take Creatine", "format": 5, "shape": "journey",
  "music": "creatine", "camera": "steady", "episode": 11,
  "hooks": [
    {"line": "Take creatine? Your scale jumps!", "why": "the owner's pick A (2026-11-21), cut for the hook rules: it says \"your\" and two of the title's words"},
    {"line": "Take creatine? Your muscles go flat!", "why": "B, mid-lift, the batteries drain to red"},
    {"line": "Take creatine? Your kidneys? Wait.", "why": "C, the myth as the hook"},
  ],
  "rooms": {
    "home": {"kind": "gym", "palette": "stone", "wall": "stripes", "floor": "carpet",
             "window": {"style": "wide", "side": "left", "view": "city"}, "layout": "rack-right", "time": "day"},
    "clinic": {"palette": "peach", "wall": "wainscot", "floor": "checker", "window": {"style": "round", "side": "left", "view": "city"},
               "layout": "cabinet", "chart": "body", "time": "day"},
  },
  "package": {
    "title": "What Happens When You Take Creatine",
    "phrase": "what happens when you take creatine",
    "opener": "What happens when you take creatine? Almost all of it is absorbed, and about 95% of the body's creatine is stored in the muscles, where it helps recharge their energy (ATP) in short, hard efforts. A review of 100 studies found small gains, mostly in short, repeated efforts, not in running or swimming. In the first days the scale can go up 1 to 3 kg, mostly water. Creatine raises creatinine on a blood test (by about 0.14 mg/dL in two 2026 reviews), which can look like kidney trouble; trials in healthy adults found no kidney harm, but that is not proof of safety for everyone.",
    "question": "Have you ever tried creatine?",
    "tags": ["what happens when you take creatine", "creatine", "creatine side effects", "creatine water weight",
             "creatine kidneys", "creatine hair loss", "does creatine work", "creatine explained", "muscle energy", "health cartoon"],
    "hashtags": "#creatine #gym #shorts",
    "cover": {"at": 1.75, "text": "Take creatine?", "accent": "creatine"},  # just after the needle swings into the red (on "jumps!", 1.3 s)
  },
  "retention": {
    "noIntro": {"scene": "A1", "line": "Take creatine? Your scale jumps!"},
    "promise": {"scene": "A2", "line": "Your scale jumps... is it fat?"},
    "question": {"scene": "A2", "line": "Your scale jumps... is it fat?"},
    "answer": {"scene": "G1", "line": "Your scale jumps? That's water in your muscles from creatine. Not fat!"},
    "change3s": {"scene": "all", "line": "steady camera: something happens in the picture at least every 3 s (stickers do not count)"},
    "twist": {"scene": "E2", "line": "Your blood test shows more of it. Looks like kidney trouble!"},
    "bestLast": {"scene": "G1", "line": "Your scale jumps? That's water in your muscles from creatine. Not fat!"},
    "loop": {"scene": "G1", "line": "Your scale jumps? That's water in your muscles from creatine. Not fat!"},
  },
  "sources": [
    {"id": KR, "label": "Kreider RB et al. International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine. J Int Soc Sports Nutr 2017;14:18", "url": "https://pubmed.ncbi.nlm.nih.gov/28615996/",
     "note": "'The majority of creatine is found in skeletal muscle (~95%)'; 'absorption into the blood is nearly 100%'; the free energy of PCr 'can be used as a buffer to resynthesize ATP ... particularly during maximal effort anaerobic sprint-type exercise'; 'About 1-2% of intramuscular creatine is degraded into creatinine'. Several authors have ties to creatine makers (declared)."},
    {"id": AN, "label": "Antonio J et al. Common questions and misconceptions about creatine supplementation: what does the scientific evidence really show? J Int Soc Sports Nutr 2021;18:13", "url": "https://pubmed.ncbi.nlm.nih.gov/33557850/",
     "note": "'the most common adverse effect of creatine supplementation is water retention in the early stages (first several days)'; loading 'typically results in a 1-3 kg increase in body mass, mostly attributable to net body water retention'; 'one must exercise caution when using blood creatinine ... in individuals who ... supplement with creatine'; the 1998 kidney case was a man 'who had kidney disease for 8 years'. Several authors have ties to creatine makers (declared)."},
    {"id": BR, "label": "Branch JD. Effect of creatine supplementation on body composition and performance: a meta-analysis. Int J Sport Nutr Exerc Metab 2003;13:198-226", "url": "https://pubmed.ncbi.nlm.nih.gov/12945830/",
     "note": "100 placebo-controlled studies. 'Small, but significant' effects, greater for repetitive-bout tasks of 30 s or less; creatine 'does not appear to be effective in improving running and swimming performance'."},
    {"id": RA, "label": "Raihan FA, Supriyanta A. Creatine supplementation and kidney function in healthy, physically active adults: a systematic review and meta-analysis. Int Urol Nephrol, 17 Nov 2026", "url": "https://pubmed.ncbi.nlm.nih.gov/43050022/",
     "note": "12 trials. Creatine 'raised serum creatinine by 12.10 µmol/L (≈ 0.14 mg/dL)'; the evidence 'is compatible with no effect of creatine on kidney function in healthy adults but ... does not establish renal safety'. No industry ties."},
    {"id": AL, "label": "de Souza Almeida A et al. Impact of creatine supplementation on kidney health: a systematic review and meta-analysis. Int Urol Nephrol 2026;58:5423-34", "url": "https://pubmed.ncbi.nlm.nih.gov/42507286/",
     "note": "26 studies, 1036 people. Serum creatinine up 0.14 mg/dL; no difference when filtration was measured directly (Cr-EDTA); 'These findings likely reflect altered creatinine metabolism rather than kidney injury'."},
    {"id": LAK, "label": "Lak M et al. Does creatine cause hair loss? A 12-week randomized controlled trial. J Int Soc Sports Nutr 2025", "url": "https://pubmed.ncbi.nlm.nih.gov/40265319/",
     "note": "38 resistance-trained men completed 12 weeks; 'no significant differences in DHT levels, DHT-to-testosterone ratio, or hair growth parameters between the creatine and placebo groups'. Some authors have ties to supplement makers (declared)."},
  ],
  "shots": shots,
  "cta": {"text": "Creatine: know this. The first jump on the scale is mostly water, not fat. Taking it? Tell your doctor before a blood test. Kidney problems? Ask first. Follow MedPeak Health for more health tips that keep you safe.",
          "src": [AN]},
  "musicPrompt": "Bouncy gym-workout funk on slap bass and punchy brass stabs, 112 BPM, a cheeky whistle melody for the little hero, a tense pulsing synth when the energy drains, a short suspense sting for the blood test, then a bright confident brass finish.",
}
os.makedirs(os.path.join(ROOT, "videos", "creatine"), exist_ok=True)
with open(os.path.join(ROOT, "videos", "creatine", "toon.json"), "w") as fh:
    json.dump(toon, fh, indent=1, ensure_ascii=False)
    fh.write("\n")
print("wrote videos/creatine/toon.json")
