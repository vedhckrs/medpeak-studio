"""Writes videos/quit-sugar/toon.json (the script for the checker and the player). Run: python3 plans/quit-sugar-script.py

The owner approved (2026-11-22): the plan (plans/quit-sugar-2026-11-22.md), hook A, Dad as the lead, the looks (Sweetie, the
night kitchen, the whole-organ frames). Shape `fight`: Sweetie, a sugar cube, fights for 30 days to win Dad back; each trick is
answered by a part of Dad's body. The wall calendar in the kitchen is the clock: each round opens on its page being ripped off.
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

WHO, TM, SC, WI, WE, MO = "who-diet", "temorenga-2013", "schwarz-2017", "wise-2016", "westwater-2016", "moynihan-2014"

shots = [
  # A: the hook. Day 1, the kitchen at night: Dad opens the fridge, Sweetie BURSTS out of a soda can at the lens. Dad rips
  # off the calendar's page ("Watch me."), and the camera dives into his belly: the liver on Day 1, pale with fat patches
  # (the consequence on screen; the payoff comes on Day 10).
  {"id": "A", "set": "macro",
   # Sweetie listed before the Liver: the layout checks turn Dad toward the first other character while he talks
   "cast": [{"who": "sweetie", "x": 640, "size": 620, "emotion": "happy", "pose": "rest"},
            {"who": "liver", "x": 540, "size": 1080, "stage": True, "emotion": "sleepy", "pose": "rest"},
            {"who": "dad", "x": 380, "size": 960, "emotion": "angry", "pose": "rest", "y": 979}],
   "state": {"view": 0, "fat": 1},
   "events": [
     E("start", act="sweetie: bursts out of the soda can at the lens", sfx="pop", fx="flash"),
     E("A1", word="back!", act="sweetie: points at Dad, grinning", sfx="boing"),
     E("A2", act="dad: turns on Sweetie and swipes the can into the bin", sfx="swish"),
     E("A2", word="me.", act="dad: the camera dives into his belly to the fatty liver", sfx="whoosh-fast", set={"fat": 1}, over=12),
   ],
   "lines": [
     L("A1", "sweetie", "Quit sugar? You'll be back!", "happy", "back", chat=True, cam="ecu 50 push", tempo=1.1, react={"dad": "angry"}),
     L("A2", "dad", "No sugar for a month? Watch me.", "angry", "watch", chat=True, cam="mcu lock"),
   ], "props": []},
  # B: Day 3, the brain (the whole brain, its face on the front): Sweetie dangles a candy on a fishing hook in front of it
  # ("hooked"); the Brain, unimpressed, flicks the line away and Sweetie tumbles off.
  {"id": "B", "set": "macro",
   "cast": [{"who": "brain", "x": 540, "size": 1080, "stage": True, "emotion": "smug", "pose": "rest"},
            {"who": "sweetie", "x": 780, "size": 300, "emotion": "happy", "pose": "rest"}],
   "state": {"view": 1, "pull": 0.5},
   "events": [
     E("start", act="dad: rips the calendar page, DAY 3; cut inside his brain", sfx="swish"),
     E("B1", word="hooked", act="sweetie: casts a fishing line, a candy on the hook swings in front of the brain", sfx="whoosh-air", set={"pull": 1}, over=10),
     E("B1", word="cravings!", act="sweetie: waggles the candy", sfx="sparkle"),
     E("B2", word="Hooked?", act="brain: rolls its eyes, unimpressed"),
     E("B2", word="little", act="brain: flicks the line away; sweetie tumbles off", sfx="bonk", set={"pull": 0}, over=8),
   ],
   "lines": [
     L("B1", "sweetie", "You're hooked on me! Here come the cravings!", "happy", "cravings", chat=True, cam="ews whip"),
     L("B2", "brain", "Hooked? Studies find little proof sugar is addictive in people.", "smug", "little", src=[WE], cam="mcu push"),
   ], "props": []},
  # C: Day 7, the mouth (close on the front teeth): Sweetie in his juice box slides in; the front tooth (the bouncer) kicks him
  # out on "Out!"; the sugar crystals at the gum line fall away on "fewer holes".
  {"id": "C", "set": "macro",
   "cast": [{"who": "tooth", "x": 420, "size": 1080, "stage": True, "emotion": "angry", "pose": "rest"},
            {"who": "sweetie", "x": 760, "size": 360, "emotion": "happy", "pose": "rest"}],
   "state": {"view": 2, "bits": 1},
   "events": [
     E("start", act="dad: rips the calendar page, DAY 7; cut into his mouth", sfx="swish"),
     E("C1", word="juice", act="sweetie: slides in wearing his juice box, sipping the straw", sfx="slide-whistle-up"),
     E("C2", word="Juice,", act="tooth: glares, cracks its knuckles"),
     E("C2", word="Out!", act="tooth: kicks sweetie out of the mouth", sfx="bonk", fx="flash"),
     E("C3", word="fewer", act="tooth: shakes the sugar crystals off its gum line", sfx="sparkle", set={"bits": 0}, over=20),
   ],
   "lines": [
     L("C1", "sweetie", "Relax. I'm juice now. Healthy!", "happy", "juice", chat=True, cam="ews whip"),
     L("C2", "tooth", "Juice, honey, syrup: still sugar to me. Out!", "angry", "out", src=[WHO], cam="cu push"),
     L("C3", "tooth", "Under twelve teaspoons a day, and I get fewer holes.", "happy", "holes", src=[WHO, MO], cam="ews"),
   ], "props": [tag("12 teaspoons", "C3", "twelve")]},
  # D: Day 10, the liver again (Day 1 was the hook): the fat patches shrink, one after another, to about half.
  {"id": "D", "set": "macro",
   "cast": [{"who": "liver", "x": 540, "size": 1080, "stage": True, "emotion": "happy", "pose": "rest"}],
   "state": {"view": 0, "fat": 1},
   "events": [
     E("start", act="dad: rips the calendar page, DAY 10; cut to his liver", sfx="swish"),
     E("D1", word="swapped", act="liver: a sugar cube on a plate is swapped for a slice of bread", sfx="pop", fx="flash"),
     E("D2", word="halved", act="liver: its fat patches shrink one after another", set={"fat": 0.5}, over=40, sfx="bubble-pop"),
     E("D2", word="calories!", act="liver: hops for joy", sfx="success-chime"),
   ],
   "lines": [
     L("D1", "liver", "In kids with obesity who swapped sugar for starch...", "neutral", "kids", src=[SC], cam="ews whip"),
     L("D2", "liver", "...liver fat nearly halved in nine days! Same calories!", "happy", "halved", src=[SC], cam="cu push"),
   ], "props": []},
  # E: Day 20, the kitchen (the twist): Sweetie on the counter in his ZERO can; Dad reaches for it; the Brain pops up in a
  # thought bubble over Dad's head and Dad stops.
  {"id": "E", "set": "home",
   "cast": [{"who": "dad", "x": 360, "size": 960, "emotion": "neutral", "pose": "rest", "y": 979},
            {"who": "sweetie", "x": 830, "size": 300, "emotion": "happy", "pose": "rest"},
            {"who": "brain", "x": 540, "size": 300, "emotion": "neutral", "pose": "rest"}],
   "events": [
     E("start", act="dad: rips the calendar page, DAY 20", sfx="swish"),
     E("E1", word="Zero", act="sweetie: pops up in the ZERO can on the counter, winking", sfx="pop"),
     E("E1", word="sugar!", act="dad: reaches toward the can"),
     E("E2", act="brain: pops up in a thought bubble over dad's head", sfx="bubble-pop"),
     E("E2", word="swap", act="dad: freezes, hand in the air"),
     E("E2", word="sweeteners.", act="dad: pulls his hand back and pushes the can away", sfx="skid", fx="flash"),
   ],
   "lines": [
     L("E1", "sweetie", "Fine. Have my sweet cousin. Zero sugar!", "smug", "zero", chat=True, cam="ms lock"),
     L("E2", "brain", "The WHO says: don't swap sugar for sweeteners.", "neutral", "sweeteners", src=[WHO], cam="mcu lock"),
   ], "props": []},
  # F: Day 30, the scale: Dad steps on; Sweetie, small now, sulks on the counter.
  {"id": "F", "set": "home",
   "cast": [{"who": "dad", "x": 470, "size": 960, "emotion": "neutral", "pose": "rest", "y": 979},
            {"who": "sweetie", "x": 860, "size": 260, "emotion": "sad", "pose": "rest"}],
   "events": [
     E("start", act="dad: rips the last page, DAY 30, and steps onto the scale", sfx="thud-soft"),
     E("F1", word="did", act="dad: wobbles on the scale, arms out", fx="flash"),
     E("F1", word="weight?", act="dad: looks down at the scale"),
     E("F2", word="trials,", act="sweetie: peeks over the counter's edge"),
     E("F2", word="kilo", act="dad: the scale's screen shows a small drop", sfx="ding", fx="flash"),
     E("F2", word="less.", act="sweetie: shrugs and sulks", sfx="sad-trombone"),
   ],
   "lines": [
     L("F1", "dad", "So... did I lose weight?", "neutral", "weight", chat=True, cam="ms lock"),
     L("F2", "sweetie", "In trials, about one kilo... only because you ate less.", "sad", "less", src=[TM], cam="mcu lock"),
   ], "props": []},
  # G: the mouth again, a NEW view: the whole mouth, the tongue with the face. The taste buds stay dark ("not yet"), then on
  # "three months" they light up one after another; a tiny Sweetie trudges out past the lip: "...I'll be back." (the loop)
  {"id": "G", "set": "macro",
   "cast": [{"who": "tongue", "x": 540, "size": 1080, "stage": True, "emotion": "neutral", "pose": "rest"},
            {"who": "sweetie", "x": 880, "size": 160, "emotion": "sad", "pose": "rest"}],
   "state": {"view": 3, "buds": 0},
   "events": [
     E("start", act="tongue: looks up as the whole mouth opens", sfx="whoosh-soft"),
     E("G1", word="same.", act="tongue: shrugs; the taste buds stay dark"),
     E("G2", word="Three", act="tongue: its taste buds light up one after another", set={"buds": 1}, over=40, sfx="sparkle"),
     E("G2", word="sweeter!", act="tongue: throws its arms up", sfx="tada"),
     E("G3", act="sweetie: tiny, trudges out past the lip, grumbling", sfx="footsteps-tiny"),
   ],
   "lines": [
     L("G1", "tongue", "And me? Sweet food tastes just the same.", "neutral", "same", src=[WI], cam="ews whip"),
     L("G2", "tongue", "No sugar for a month? Not yet. Three months? Forty percent sweeter!", "happy", "sweeter", src=[WI], cam="cu push"),
     L("G3", "sweetie", "You quit sugar? ...I'll be back.", "sad", "back", chat=True, cam="mcu lock"),
   ], "props": [tag("40% sweeter", "G2", "forty")]},
]

toon = {
  "slug": "quit-sugar", "title": "What Happens If You Quit Sugar for 30 Days", "format": 5, "shape": "fight",
  "music": "quit-sugar", "camera": "steady", "episode": 12,
  "hooks": [
    {"line": "Quit sugar? You'll be back!", "why": "the owner's pick A (2026-11-22: \"Yes, hook A, Dad\"), cut to 5 words for the 2-second hook rule (\"Quit me for thirty days? Ha! You'll be back!\" took 2.7 s)"},
    {"line": "Quit sugar, and your juice still counts!", "why": "B: Dad proudly pours juice, Sweetie pops out of the glass"},
    {"line": "Quit sugar? Your tongue isn't done yet.", "why": "C: the taste buds, dark, one blinks awake"},
  ],
  "rooms": {
    "home": {"kind": "kitchen", "palette": "forest", "wall": "stripes", "floor": "wood",
             "window": {"style": "tall", "side": "left", "view": "night"}, "layout": "stove-left", "time": "night"},
  },
  "package": {
    "title": "What Happens If You Quit Sugar for 30 Days",
    "phrase": "what happens if you quit sugar for 30 days",
    "opener": "What happens if you quit sugar for 30 days? Little evidence says sugar is addictive in people, so the cravings are not a drug withdrawal. Juice, honey and syrups still count as free sugar; the WHO's limit is under 10% of daily energy, about 12 teaspoons for someone eating about 2,000 calories, and caries are lower below it. In a 9-day study of children with obesity, swapping sugar for starch at the same calories nearly halved liver fat (7.2% to 3.8%). The WHO advises not to swap sugar for sweeteners. In trials of adults, eating less sugar took off about 0.8 kg, because people ate fewer calories. And in one small trial, after three months on less sugar, sweet foods tasted about 40% sweeter.",
    "question": "Could you quit sugar for 30 days?",
    "tags": ["what happens if you quit sugar for 30 days", "quit sugar", "no sugar for 30 days", "sugar detox", "sugar cravings",
             "is fruit juice healthy", "sugar and fatty liver", "artificial sweeteners", "how much sugar per day", "health cartoon"],
    "hashtags": "#nosugar #health #shorts",
    "cover": {"at": 1.2, "text": "Quit sugar?", "accent": "sugar"},
  },
  "retention": {
    "noIntro": {"scene": "A1", "line": "Quit sugar? You'll be back!"},
    "promise": {"scene": "A1", "line": "Quit sugar? You'll be back!"},
    "question": {"scene": "A2", "line": "No sugar for a month? Watch me."},
    "answer": {"scene": "G2", "line": "No sugar for a month? Not yet. Three months? Forty percent sweeter!"},
    "change3s": {"scene": "all", "line": "steady camera: something happens in the picture at least every 3 s (stickers do not count)"},
    "twist": {"scene": "E2", "line": "The WHO says: don't swap sugar for sweeteners."},
    "bestLast": {"scene": "G2", "line": "No sugar for a month? Not yet. Three months? Forty percent sweeter!"},
    "loop": {"scene": "G3", "line": "You quit sugar? ...I'll be back."},
  },
  "sources": [
    {"id": WHO, "label": "World Health Organization. Healthy diet (fact sheet)", "url": "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
     "note": "'free sugars should be limited to less than 10% of total daily energy intake, which is equivalent to 50 g (or about 12 level teaspoons) for a person of healthy body weight consuming about 2000 calories per day'; free sugars include sugars 'added to foods and beverages by the manufacturer, cook or consumer, and sugars naturally present in honey, syrups, fruit juices and fruit juice concentrates'; 'Reducing consumption of free sugars ... should be accomplished without the use of non-sugar sweeteners.'"},
    {"id": TM, "label": "Te Morenga L, Mallard S, Mann J. Dietary sugars and body weight: systematic review and meta-analyses of randomised controlled trials and cohort studies. BMJ 2013;346:e7492", "url": "https://pubmed.ncbi.nlm.nih.gov/23321486/",
     "note": "'In trials of adults with ad libitum diets ... reduced intake of dietary sugars was associated with a decrease in body weight (0.80 kg, 95% CI 0.39 to 1.21)'; 'Isoenergetic exchange of dietary sugars with other carbohydrates showed no change in body weight'; the change 'seems to be mediated via changes in energy intakes'. The video rounds 0.8 kg to 'about one kilo'."},
    {"id": SC, "label": "Schwarz JM et al. Effects of dietary fructose restriction on liver fat, de novo lipogenesis, and insulin kinetics in children with obesity. Gastroenterology 2017;153:743-52", "url": "https://pubmed.ncbi.nlm.nih.gov/28579536/",
     "note": "41 children aged 9-18 with obesity, 9 days, the same calories with starch in place of sugar: 'liver fat decreased from a median of 7.2% ... to 3.8%'; 'insulin kinetics improved'."},
    {"id": WI, "label": "Wise PM, Nattress L, Flammer LJ, Beauchamp GK. Reduced dietary intake of simple sugars alters perceived sweet taste intensity but not perceived pleasantness. Am J Clin Nutr 2016;103:50-60", "url": "https://pubmed.ncbi.nlm.nih.gov/26607941/",
     "note": "Low-sugar group 16 (13 completed key parts), control 17: 'no systematic differences ... during the baseline or first diet month'; 'During the third diet month, the low-sugar subjects rated both low and high concentrations in puddings as ∼40% sweeter than did the control group'. One small trial; two authors worked at PepsiCo (declared)."},
    {"id": WE, "label": "Westwater ML, Fletcher PC, Ziauddeen H. Sugar addiction: the state of the science. Eur J Nutr 2016;55(Suppl 2):55-69", "url": "https://pubmed.ncbi.nlm.nih.gov/27372453/",
     "note": "'We find little evidence to support sugar addiction in humans'. No conflicts."},
    {"id": MO, "label": "Moynihan PJ, Kelly SA. Effect on caries of restricting sugars intake: systematic review to inform WHO guidelines. J Dent Res 2014;93:8-18", "url": "https://pubmed.ncbi.nlm.nih.gov/24323509/",
     "note": "55 studies; 'evidence of moderate quality showing that caries is lower when free-sugars intake is < 10% E'."},
  ],
  "shots": shots,
  "cta": {"text": "Quitting sugar: know this. Juice and honey count as sugar too. Don't swap sugar for sweeteners. Keep it under twelve teaspoons a day. Follow MedPeak Health for more health tips that keep you safe.",
          "src": [WHO]},
  "musicPrompt": "A steady, continuous playful cartoon caper groove at 104 BPM that never stops or drops out: a constant tight drum beat, a bouncy plucked bass line and a held warm organ pad under everything from the first second to the last, no breaks, no silences, no stop-time stabs. A sneaky pizzicato and clarinet melody on top, mischievous like a villain tiptoeing, with a bright triumphant brass lift near the end. Background music under dialogue.",
}
os.makedirs(os.path.join(ROOT, "videos", "quit-sugar"), exist_ok=True)
with open(os.path.join(ROOT, "videos", "quit-sugar", "toon.json"), "w") as fh:
    json.dump(toon, fh, indent=1, ensure_ascii=False)
    fh.write("\n")
print("wrote videos/quit-sugar/toon.json")
