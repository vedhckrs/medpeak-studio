"""Writes videos/fasting/toon.json (the script for the checker and the player). Run: python3 plans/fasting-script.py

The owner approved (2026-11-22): the plan (plans/fasting-2026-11-22.md), hook A, Grandpa as the lead, the looks (Lardo the fat
cell, the whole stomach, the liver's sugar store, Grandpa's night living room). Shape `clock`: one 16-hour overnight fast; the
big wall clock's red FAST ring is the clock, and each round opens on it jumping (0 h, 4 h, 12 h, 16 h).
"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def L(id, who, text, emo, key, src=None, chat=False, cam=None, beat=None, pose='rest', react=None, tempo=None):
    l = {"id": id, "who": who, "text": text, "emotion": emo, "pose": pose, "key": key}
    if src: l["src"] = src
    if chat: l["chat"] = True
    if beat: l["beat"] = beat
    if cam: l["cam"] = cam
    if react: l["react"] = react
    if tempo: l["tempo"] = tempo
    return l

def E(at, word=None, set=None, over=None, sfx=None, fx=None, delay=None, act=None):
    e = {"at": at}
    if act: e["act"] = act
    if word: e["word"] = word
    if set: e["set"] = set
    if over: e["over"] = over
    if sfx: e["sfx"] = sfx
    if fx: e["fx"] = fx
    if delay is not None: e["delay"] = delay
    return e

def tag(text, line, word, x=540, y=330):
    return {"kind": "tag", "text": text, "x": x, "y": y, "size": 300, "from": line, "to": line, "word": word}

NID, AN, NA, TR, LO = "niddk-if", "anton-2018", "natalucci-2005", "trepanowski-2017", "lowe-2020"

shots = [
  # A: the hook. 0 h, Grandpa's living room at night: his Stomach bursts on screen at the lens; Grandpa pushes his dinner away and
  # points at the clock; the camera dives into his belly to the whole stomach, already growling (the consequence first).
  {"id": "A", "set": "macro",
   "cast": [{"who": "stomach", "x": 540, "size": 1080, "stage": True, "emotion": "angry", "pose": "rest"},
            {"who": "grandpa", "x": 560, "size": 960, "emotion": "happy", "pose": "rest", "y": 979}],
   "state": {"view": 0, "growl": 1},
   "events": [
     E("start", act="stomach: bursts on screen at the lens, fists up", sfx="pop", fx="flash"),
     E("A1", word="scream", act="stomach: shakes both fists at grandpa", sfx="gurgle-stomach"),
     E("A2", word="Sixteen", act="grandpa: pushes his dinner plate away and points at the clock", sfx="swish"),
     E("A2", word="Scared", act="grandpa: turns and points down at his stomach, teasing", fx="flash"),
     E("A2", word="stomach?", act="grandpa: the camera dives into his belly to the growling stomach", sfx="whoosh-fast", set={"growl": 1}, over=12),
   ],
   "lines": [
     L("A1", "stomach", "When you fast, I scream!", "angry", "scream", chat=True, cam="ecu 50 push", tempo=1.15, react={"grandpa": "happy"}),
     L("A2", "grandpa", "Sixteen hours. Scared of a little hunger, stomach?", "happy", "hunger", chat=True, cam="mcu lock"),
   ], "props": []},
  # B: 4 h, the whole stomach: it growls and shakes ("Feed me!"); the Brain peeks down from the top: hunger comes in waves at
  # your usual meal times, and drops again on its own (the growl dies down).
  {"id": "B", "set": "macro", "lead": 0.6,
   "cast": [{"who": "stomach", "x": 540, "size": 1080, "stage": True, "emotion": "angry", "pose": "rest"},
            {"who": "brain", "x": 820, "size": 340, "emotion": "neutral", "pose": "rest"}],
   "state": {"view": 0, "growl": 0},
   "events": [
     E("start", act="grandpa: the clock jumps to 4 h; cut inside to his stomach", sfx="swish"),
     E("B1", word="Feed", act="stomach: growls and shakes", set={"growl": 1}, over=6, sfx="gurgle-stomach"),
     E("B1", word="FEED", act="stomach: pounds the wall with both fists", fx="flash"),
     E("B2", word="Hunger", act="brain: peeks down from the top of the frame", sfx="bubble-pop"),
     E("B2", word="waves,", act="brain: draws a wave in the air; the growl swells with it", set={"growl": 0.6}, over=10, sfx="whoosh-air"),
     E("B2", word="meal", act="stomach: the growl swells again, then eases", set={"growl": 0.9}, over=10),
     E("B3", word="drops", act="stomach: the growl dies down, it blinks, surprised", set={"growl": 0}, over=20, sfx="whoosh-soft"),
   ],
   "lines": [
     L("B1", "stomach", "Feed me! FEED ME!", "angry", "feed", chat=True, cam="ews whip"),
     L("B2", "brain", "Hunger comes in waves, at your usual meal times...", "neutral", "waves", src=[NA], cam="mcu push"),
     L("B3", "brain", "...and it drops again on its own.", "happy", "drops", src=[NA], cam="ews"),
   ], "props": []},
  # C: 12 h, the whole liver and its sugar store: the jar empties bead by bead, then runs dry.
  {"id": "C", "set": "macro", "lead": 0.6,
   "cast": [{"who": "liver", "x": 540, "size": 1080, "stage": True, "emotion": "scared", "pose": "rest"}],
   "state": {"view": 1, "store": 1},
   "events": [
     E("start", act="grandpa: the clock jumps to 12 h; cut to his liver", sfx="swish"),
     E("C1", word="sugar", act="liver: taps its sugar jar", sfx="ding"),
     E("C1", word="low...", act="liver: the beads in its jar drop away", set={"store": 0.3}, over=30, sfx="drip"),
     E("C2", word="twelve", act="liver: the last beads go", set={"store": 0}, over=20),
     E("C2", word="dry!", act="liver: stares at the empty jar, shocked", sfx="record-scratch", fx="flash"),
   ],
   "lines": [
     L("C1", "liver", "I keep sugar for between meals. Running low...", "scared", "sugar", src=[AN], cam="ews whip"),
     L("C2", "liver", "Past about twelve hours, my store runs dry!", "shocked", "dry", src=[AN], cam="cu push"),
   ], "props": [tag("about 12 hours", "C2", "about", y=300)]},
  # D: the switch: Lardo the fat cell pops up and starts burning fat; the body switches fuel from sugar to fat.
  {"id": "D", "set": "macro",
   "cast": [{"who": "lardo", "x": 820, "size": 420, "emotion": "happy", "pose": "rest"},
            {"who": "liver", "x": 540, "size": 1080, "stage": True, "emotion": "happy", "pose": "rest"}],
   "state": {"view": 2, "drops": 0},
   "events": [
     E("start", act="lardo: pops up beside the liver", sfx="boing"),
     E("D1", word="turn!", act="lardo: throws his arms up", sfx="tada"),
     E("D1", word="fat!", act="lardo: fuel drops pop off his top", set={"drops": 1}, over=20, sfx="sparkle"),
     E("D2", word="switches", act="liver: flips a big switch on its side from SUGAR to FAT", sfx="toot", fx="flash"),
     E("D2", word="fat!", act="liver: catches a fuel drop and hops for joy", sfx="success-chime"),
   ],
   "lines": [
     L("D1", "lardo", "My turn! Burning fat!", "happy", "fat", src=[AN], cam="ms lock"),
     L("D2", "liver", "No sugar left, so the body switches fuel: fat!", "happy", "switches", src=[AN], cam="cu push"),
   ], "props": []},
  # E: 16 h, the living room, breakfast (the twist): Grandpa is proud; Lardo, on the side table, says fasting was no faster.
  {"id": "E", "set": "home",
   "cast": [{"who": "grandpa", "x": 560, "size": 960, "emotion": "happy", "pose": "rest", "y": 979},
            {"who": "lardo", "x": 900, "size": 300, "emotion": "neutral", "pose": "rest"}],
   "events": [
     E("start", act="grandpa: the clock rings 16 h; breakfast on the table", sfx="ding", fx="flash"),
     E("E1", word="Sixteen", act="grandpa: gives a big thumbs-up"),
     E("E1", word="melts", act="grandpa: spreads his arm out proudly", fx="flash"),
     E("E1", word="faster?", act="grandpa: rubs his chin, grinning"),
     E("E2", word="year-long", act="lardo: pops up on the side table", sfx="pop"),
     E("E2", word="every", act="lardo: counts days on his fingers", sfx="pop", fx="flash"),
     E("E3", word="same", act="lardo: shrugs", sfx="boing"),
     E("E3", word="less.", act="grandpa: his grin drops", sfx="sad-trombone", fx="flash"),
   ],
   "lines": [
     L("E1", "grandpa", "Sixteen hours! So fasting melts fat faster?", "happy", "faster", chat=True, cam="ms lock"),
     L("E2", "lardo", "In a year-long trial, fasting every other day...", "neutral", "trial", src=[TR], cam="mcu lock"),
     L("E3", "lardo", "...lost about the same as just eating less.", "neutral", "same", src=[TR, LO], cam="ews"),
   ], "props": []},
  # F: the care line, the whole brain: fasting is not for everyone; who should not (NIDDK).
  {"id": "F", "set": "macro",
   "cast": [{"who": "brain", "x": 540, "size": 1080, "stage": True, "emotion": "neutral", "pose": "rest"}],
   "state": {"view": 3, "lean": 0},
   "events": [
     E("start", act="brain: looks straight at the lens", sfx="whoosh-soft"),
     E("F1", word="isn't", act="brain: wags a finger", sfx="wobble"),
     E("F1", word="everyone.", act="brain: shakes its head"),
     E("F2", word="Pregnant?", act="brain: holds up one hand", sfx="pop"),
     E("F2", word="disorder?", act="brain: holds up the other hand", fx="flash"),
     E("F2", word="doctor", act="brain: leans in to the lens", set={"lean": 1}, over=18, sfx="ding"),
   ],
   "lines": [
     L("F1", "brain", "Fasting isn't for everyone.", "neutral", "everyone", chat=True, cam="cu push"),
     L("F2", "brain", "Pregnant? Had an eating disorder? Ask a doctor first.", "neutral", "doctor", src=[NID], cam="ews"),
   ], "props": []},
  # G: the stomach again (best last): it asks who was screaming all night; the Brain peeks in and owns up (the loop to A1).
  {"id": "G", "set": "macro",
   "cast": [{"who": "stomach", "x": 540, "size": 1080, "stage": True, "emotion": "angry", "pose": "rest"},
            {"who": "brain", "x": 820, "size": 340, "emotion": "happy", "pose": "rest"}],
   "state": {"view": 0, "growl": 0},
   "events": [
     E("start", act="stomach: full and calm after breakfast, then frowns", sfx="burp-small"),
     E("G1", word="screaming", act="stomach: looks around, suspicious; a little growl", set={"growl": 0.5}, over=6, sfx="record-scratch"),
     E("G1", word="night?", act="stomach: folds its arms", sfx="swish"),
     E("G2", word="Me!", act="brain: peeks down from the top and winks; the growl stops", set={"growl": 0}, over=8, sfx="boing", fx="flash"),
     E("G2", word="fast,", act="brain: taps its head"),
     E("G2", word="scream,", act="brain: does a tiny scream face; the stomach rattles", set={"growl": 0.4}, over=6, sfx="boing"),
     E("G2", word="stomach!", act="stomach: drops its jaw; the rattle stops", set={"growl": 0}, over=6),
   ],
   "lines": [
     L("G1", "stomach", "So who was screaming at me all night?", "angry", "screaming", chat=True, cam="ews whip"),
     L("G2", "brain", "Me! When you fast, the brain makes you scream, little stomach!", "happy", "brain", src=[NA], cam="cu push"),
   ], "props": []},
]

toon = {
  "slug": "fasting", "title": "What Happens to Your Body When You Fast", "format": 5, "shape": "clock",
  "music": "fasting", "camera": "steady", "episode": 13, "caption": 2,
  "hooks": [
    {"line": "When you fast, I scream!", "why": "the owner's pick A (2026-11-22: \"Hook A, Grandpa\"), cut to 5 words for the 2-second hook rule (\"No food for sixteen hours? I'll scream in four!\" took 2.7 s)"},
    {"line": "You fast? Hour twelve, your body switches fuel!", "why": "B: the liver's sugar jar, the last bead drops"},
    {"line": "When you fast, hunger starts in your brain.", "why": "C: the Brain winks while the Stomach screams"},
  ],
  "rooms": {
    "home": {"kind": "living", "palette": "blush", "wall": "wainscot", "floor": "carpet",
             "window": {"style": "round", "side": "centre", "view": "night"}, "layout": "sofa-left", "time": "night"},
  },
  "package": {
    "title": "What Happens to Your Body When You Fast",
    "phrase": "what happens to your body when you fast",
    "opener": "What happens to your body when you fast for 16 hours? Hunger comes in waves at your usual meal times and drops again on its own. After about 12 hours or more without food, the liver's sugar store runs low and the body switches to burning fat. But in a year-long trial, fasting every other day lost about the same weight as simply eating less every day, and eating in an 8-hour window did no better either. Fasting isn't for everyone: researchers advise against it in pregnancy and for anyone with a history of eating disorders. Ask a doctor first.",
    "question": "Have you ever tried a 16-hour fast?",
    "tags": ["what happens to your body when you fast", "intermittent fasting", "16 hour fast", "fasting benefits", "what happens when you fast",
             "ketosis", "fasting for weight loss", "hunger", "metabolic switch", "health cartoon"],
    "hashtags": "#fasting #health #shorts",
    "cover": {"at": 3.2, "text": "When you fast", "accent": "fast"},
  },
  "retention": {
    "noIntro": {"scene": "A1", "line": "When you fast, I scream!"},
    "promise": {"scene": "A1", "line": "When you fast, I scream!"},
    "question": {"scene": "A2", "line": "Sixteen hours. Scared of a little hunger, stomach?"},
    "answer": {"scene": "G2", "line": "Me! When you fast, the brain makes you scream, little stomach!"},
    "change3s": {"scene": "all", "line": "steady camera: something happens in the picture at least every 3 s (stickers do not count)"},
    "twist": {"scene": "E3", "line": "...lost about the same as just eating less."},
    "bestLast": {"scene": "G2", "line": "Me! When you fast, the brain makes you scream, little stomach!"},
    "loop": {"scene": "G2", "line": "Me! When you fast, the brain makes you scream, little stomach!"},
  },
  "sources": [
    {"id": NID, "label": "National Institute of Diabetes and Digestive and Kidney Diseases (NIH). What Can You Tell Your Patients About Intermittent Fasting and Type 2 Diabetes?", "url": "https://www.niddk.nih.gov/health-information/professionals/diabetes-discoveries-practice/patients-intermittent-fasting",
     "note": "Interview with an NIH-funded fasting researcher: 'I don't think people with a history of eating disorders should do fasting regimens.'; 'certain people probably shouldn't do intermittent fasting, like pregnant women since no studies have been conducted in this group just yet.'; 'You don't really get significant increases in ketones after fasting for 16 hours.' (so the video does not mention ketones); 'Both diets resulted in about 5% weight loss over 12 months.'"},
    {"id": AN, "label": "Anton SD et al. Flipping the Metabolic Switch: Understanding and Applying the Health Benefits of Fasting. Obesity 2018;26:254-68", "url": "https://pubmed.ncbi.nlm.nih.gov/29086496/",
     "note": "'the metabolic switch: the point of negative energy balance at which liver glycogen stores are depleted and fatty acids are mobilized (typically beyond 12 hours after cessation of food intake)'; 'the metabolic switch from glucose to fatty acid-derived ketones'. No conflicts."},
    {"id": NA, "label": "Natalucci G et al. Spontaneous 24-h ghrelin secretion pattern in fasting subjects: maintenance of a meal-related pattern. Eur J Endocrinol 2005;152:845-50", "url": "https://pubmed.ncbi.nlm.nih.gov/15941923/",
     "note": "Six healthy volunteers, a 24-hour fast: 'An increase and spontaneous decrease in ghrelin were seen at the timepoints of customary meals'; 'An overall decrease in ghrelin levels was observed'; 'it is the brain that is primarily involved in the regulation of meal initiation.' A small pilot study."},
    {"id": TR, "label": "Trepanowski JF et al. Effect of Alternate-Day Fasting on Weight Loss, Weight Maintenance, and Cardioprotection Among Metabolically Healthy Obese Adults: A Randomized Clinical Trial. JAMA Intern Med 2017;177:930-8", "url": "https://pubmed.ncbi.nlm.nih.gov/28459931/",
     "note": "100 adults with obesity, 1 year; month 12: -6.0% vs -5.3% of body weight; 'Alternate-day fasting did not produce superior adherence, weight loss, weight maintenance, or cardioprotection vs daily calorie restriction.' The last author wrote an alternate-day diet book (declared)."},
    {"id": LO, "label": "Lowe DA et al. Effects of Time-Restricted Eating on Weight Loss and Other Metabolic Parameters in Women and Men With Overweight and Obesity: The TREAT Randomized Clinical Trial. JAMA Intern Med 2020;180:1491-9", "url": "https://pubmed.ncbi.nlm.nih.gov/32986097/",
     "note": "116 adults, 12 weeks of 16:8 eating: 'Time-restricted eating, in the absence of other interventions, is not more effective in weight loss than eating throughout the day.'"},
  ],
  "shots": shots,
  "cta": {"text": "Fasting: know this. Hunger comes in waves, and it passes. Fasting is no faster than eating less. Pregnant, or had an eating disorder? Ask a doctor first. Follow MedPeak Health for more health tips that keep you safe.",
          "src": [NA, TR, NID]},
  "musicPrompt": "A steady, continuous warm cartoon groove at 96 BPM that never stops or drops out: a constant soft drum beat with a ticking woodblock like a clock, a round plucked bass line and a held mellow organ pad under everything from the first second to the last, no breaks, no silences, no stop-time stabs. A playful bassoon and glockenspiel melody on top, a little grumpy and comic like a hungry tummy, with a bright cheerful lift near the end. Background music under dialogue.",
}
os.makedirs(os.path.join(ROOT, "videos", "fasting"), exist_ok=True)
with open(os.path.join(ROOT, "videos", "fasting", "toon.json"), "w") as fh:
    json.dump(toon, fh, indent=1, ensure_ascii=False)
    fh.write("\n")
print("wrote videos/fasting/toon.json")
