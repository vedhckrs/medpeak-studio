"""Writes videos/snake-bite/toon.json (the script for the checker and the player). Run: python3 plans/snake-bite-script.py

The owner approved (2026-11-22): the plan (plans/snake-bite-2026-11-22.md), hook A, Mom shouts the myths, the looks (the venom gang
Numb / Bleed / Crush, Antivenom, inside the leg, the trail, the hospital). Shape `journey`: the venom travels through Sam's body;
Dr. Mira only at the end. First aid ONLY from the NHS list; no myth shown as working.
"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def L(id, who, text, emo, key, src=None, chat=False, cam=None, react=None, tempo=None):
    l = {"id": id, "who": who, "text": text, "emotion": emo, "pose": "rest", "key": key}
    if src: l["src"] = src
    if chat: l["chat"] = True
    if cam: l["cam"] = cam
    if react: l["react"] = react
    if tempo: l["tempo"] = tempo
    return l

def E(at, word=None, set=None, over=None, sfx=None, fx=None, act=None):
    e = {"at": at}
    if act: e["act"] = act
    if word: e["word"] = word
    if set: e["set"] = set
    if over: e["over"] = over
    if sfx: e["sfx"] = sfx
    if fx: e["fx"] = fx
    return e

WHO, NHS, GU, NA = "who-snakebite", "nhs-snakebite", "gutierrez-2017", "naik-2017"

shots = [
  # A: the hook, INSIDE the leg: two fangs punch down through the skin from above, the venom gang bursts out AT the lens;
  # then (A2) a hard cut to the trail: Sam hops on one foot, a snake's tail slipping under the rock.
  {"id": "A", "set": "macro",
   "cast": [{"who": "numb", "x": 540, "size": 700, "emotion": "happy", "pose": "rest", "stage": True},
            {"who": "patient", "x": 520, "size": 960, "emotion": "scared", "pose": "rest", "y": 979}],
   "state": {"view": 0, "swell": 0.6},
   "events": [
     E("start", act="numb: the fangs punch down through the skin; the gang bursts out at the lens", set={"swell": 1}, over=12, sfx="pop", fx="flash"),
     E("A1", word="bites", act="numb: grins at the lens, fangs showing"),
     E("A1", word="ride!", act="numb: the gang whoops and scatters", sfx="whoosh-fast"),
     E("A2", word="Ow!", act="patient: hops on one foot on the trail, clutching his ankle", sfx="boing", fx="flash"),
     E("A2", word="snake", act="patient: stares at a tail slipping under the rock", sfx="swish"),
   ],
   "lines": [
     L("A1", "numb", "A snake bites you. We ride!", "happy", "ride", chat=True, tempo=1.15),
     L("A2", "patient", "Ow! Was that snake venomous?", "scared", "venomous", chat=True, cam="ms lock"),
   ], "props": []},
  # B: inside the leg, the split: Numb dives for the nerve cable, Bleed jumps into the blood river, Crush stays and the flesh swells.
  {"id": "B", "set": "macro",
   "cast": [{"who": "numb", "x": 300, "size": 420, "emotion": "smug", "pose": "rest"},
            {"who": "bleed", "x": 780, "size": 420, "emotion": "happy", "pose": "rest"},
            {"who": "crush", "x": 540, "size": 460, "emotion": "angry", "pose": "rest", "stage": True}],
   "state": {"view": 1, "swell": 0, "nerve": 0, "clot": 0},
   "events": [
     E("start", act="numb: the three drops land in the leg and split three ways", sfx="whoosh-air"),
     E("B0", word="million", act="numb: a crowd of tiny venom drops floods in behind the gang", fx="flash"),
     E("B0", word="busy!", act="numb: the gang high-fives", sfx="pop"),
     E("B1", word="nerves.", act="numb: grabs the nerve cable; it sparks", set={"nerve": 0.5}, over=10, sfx="zip-away", fx="flash"),
     E("B1", word="Breathing", act="numb: the sparks along the nerve go dark one by one", set={"nerve": 1}, over=20),
     E("B2", word="blood", act="bleed: dives into the blood river with a splash", sfx="splash-small"),
     E("B2", word="clotting!", act="bleed: tosses away a little clot plug, grinning", set={"clot": 1}, over=10),
     E("B3", word="wreck", act="crush: stamps; the flesh around him swells", set={"swell": 1}, over=24, sfx="squish"),
     E("B3", word="here!", act="crush: flexes, smug"),
   ],
   "lines": [
     L("B0", "numb", "Over five million bites a year. We're busy!", "happy", "million", src=[WHO]),
     L("B1", "numb", "I go for the nerves. Breathing gets hard.", "smug", "nerves", src=[WHO], cam="cu lock"),
     L("B2", "bleed", "I stop your blood from clotting!", "happy", "clotting", src=[WHO], cam="cu lock"),
     L("B3", "crush", "And I wreck the flesh right here!", "angry", "wreck", src=[WHO]),
   ], "props": [{"kind": "tag", "text": "over 5 million a year", "x": 540, "y": 300, "size": 300, "from": "B0", "to": "B0", "word": "Over"}]},
  # C: the trail, Sam does the right thing first: he sits on the rock, calm, and keeps his leg still.
  {"id": "C", "set": "home",
   "cast": [{"who": "patient", "x": 460, "size": 960, "emotion": "neutral", "pose": "rest", "y": 979}],
   "events": [
     E("start", act="patient: sits down on the rock, slowly", sfx="whoosh-soft"),
     E("C1", word="calm.", act="patient: one slow breath", fx="flash"),
     E("C1", word="still.", act="patient: rests his leg flat and stops moving it"),
     E("C2", word="snake.", act="patient: waves the snake's tail away under the rock", sfx="swish", fx="flash"),
   ],
   "lines": [
     L("C1", "patient", "Stay calm. Keep the bitten leg still.", "neutral", "still", src=[NHS]),
     L("C2", "patient", "And don't go near the snake.", "neutral", "snake", src=[NHS], cam="cu lock"),
   ], "props": []},
  # D: Mom runs in with the myths; the gang CHEERS from a bubble; Sam stops her (the twist); Mom takes his ring off and calls.
  {"id": "D", "set": "home",
   "cast": [{"who": "mom", "x": 360, "size": 960, "emotion": "scared", "pose": "rest", "y": 979},
            {"who": "bleed", "x": 820, "size": 300, "emotion": "happy", "pose": "rest"},
            {"who": "patient", "x": 760, "size": 960, "emotion": "neutral", "pose": "rest", "y": 979}],
   "events": [
     E("start", act="mom: runs in along the trail", sfx="footsteps-tiny"),
     E("D1", word="Cut", act="mom: raises a knife", sfx="swish", fx="flash"),
     E("D1", word="Suck", act="mom: leans toward the bite"),
     E("D1", word="Tie", act="mom: pulls out a rope", sfx="swish"),
     E("D2", word="Yes!", act="bleed: pops up in a bubble, cheering", sfx="pop"),
     E("D2", word="love", act="bleed: the whole gang dances in the bubble", sfx="tada"),
     E("D3", word="No,", act="patient: holds up both hands: stop", sfx="record-scratch", fx="flash"),
     E("D3", word="suck", act="bleed: the gang's bubble POPS", sfx="pop", fx="flash"),
     E("D3", word="tie", act="mom: drops the knife and the rope", sfx="thud-soft"),
     E("D4", word="Rings", act="mom: slides a ring off his finger", sfx="ding"),
     E("D4", word="calling", act="mom: phone to her ear", sfx="alarm-beep", fx="flash"),
   ],
   "lines": [
     L("D1", "mom", "Cut it! Suck it out! Tie it tight!", "scared", "cut", chat=True),
     L("D2", "bleed", "Yes! Do all of that! We love it!", "happy", "love", chat=True, cam="cu lock"),
     L("D3", "patient", "No, Mom! Don't cut it, suck it, or tie it.", "neutral", "don't", src=[NHS], cam="ms lock"),
     L("D4", "mom", "Rings off. I'm calling for help!", "neutral", "help", src=[NHS], cam="ms lock"),
   ], "props": []},
  # E: inside the blood at the hospital: the drip line pours in, Antivenom arrives and knocks the gang out.
  {"id": "E", "set": "macro",
   "cast": [{"who": "numb", "x": 760, "size": 420, "emotion": "scared", "pose": "rest"},
            {"who": "antivenom", "x": 320, "size": 520, "emotion": "happy", "pose": "rest", "stage": True}],
   "state": {"view": 2, "knock": 0},
   "events": [
     E("start", act="numb: a drip line pours golden drops into the blood", sfx="drip"),
     E("E1", word="drip?", act="numb: hides behind Bleed", fx="flash"),
     E("E2", word="Antivenom.", act="antivenom: lands, shining", sfx="success-chime", fx="flash"),
     E("E2", word="best", act="antivenom: one punch; the gang goes flying, knocked out", set={"knock": 1}, over=12, sfx="bonk", fx="flash"),
   ],
   "lines": [
     L("E1", "numb", "Uh oh. What's in that drip?", "scared", "drip", chat=True),
     L("E2", "antivenom", "Antivenom. The best treatment there is.", "happy", "antivenom", src=[WHO, GU]),
   ], "props": []},
  # F: the hospital (Dr. Mira at the end, the journey shape): the answer to "was it venomous?"
  {"id": "F", "set": "clinic",
   "cast": [{"who": "doctor", "x": 760, "size": 960, "emotion": "neutral", "pose": "rest", "y": 979},
            {"who": "patient", "x": 360, "size": 960, "emotion": "neutral", "pose": "rest", "y": 979}],
   "events": [
     E("start", act="patient: in the hospital bed, the drip in his arm", sfx="whoosh-soft"),
     E("F1", word="venom", act="doctor: holds up the clipboard: two fang marks, no venom", sfx="pop"),
     E("F1", word="no", act="doctor: shakes her head", fx="flash"),
     E("F2", word="tell", act="doctor: shrugs"),
     E("F2", word="venomous.", act="doctor: two snake pictures pop up beside her, a big question mark between them", sfx="pop", fx="flash"),
     E("F2", word="checked.", act="patient: gives a thumbs-up", sfx="ding"),
   ],
   "lines": [
     L("F1", "doctor", "Some snake bites carry no venom at all...", "neutral", "no", src=[NA], cam="ms lock"),
     L("F2", "doctor", "...but you can't tell which snake is venomous. Get every bite checked.", "neutral", "checked", src=[NHS], cam="cu lock"),
   ], "props": []},
  # G: the drip again (the loop): Numb, knocked out, dizzy: "Next time a snake bites you... we ride again!"
  {"id": "G", "set": "macro",
   "cast": [{"who": "numb", "x": 540, "size": 600, "emotion": "sad", "pose": "rest", "stage": True}],
   "state": {"view": 2, "knock": 1},
   "events": [
     E("start", act="numb: lies knocked out, stars spinning", sfx="wobble"),
     E("G1", word="snake", act="numb: lifts his head, dizzy"),
     E("G1", word="again!", act="numb: flops back down", sfx="thud-soft", fx="flash"),
   ],
   "lines": [
     L("G1", "numb", "Next time a snake bites you... we ride again!", "sad", "again", chat=True),
   ], "props": []},
]

toon = {
  "slug": "snake-bite", "title": "What Happens When a Snake Bites You", "format": 5, "shape": "journey",
  "music": "snake-bite", "camera": "steady", "episode": 14, "caption": 2,
  "hooks": [
    {"line": "A snake bites you. We ride!", "why": "the owner's pick A (2026-11-22: \"Hook A, Mom\"): inside the leg, the fangs punch in and the venom gang bursts out at the lens"},
    {"line": "When a snake bites you, don't cut it.", "why": "B: Mom's knife coming down, freezing in the air"},
    {"line": "A snake bites you. Do you suck it?", "why": "C: Mom leaning in to suck the bite, the gang cheering"},
  ],
  "rooms": {
    "home": {"kind": "living", "palette": "sage", "wall": "paint", "floor": "wood",
             "window": {"style": "wide", "side": "right", "view": "hills"}, "layout": "sofa-left", "time": "day"},
    "clinic": {"palette": "lilac", "wall": "paint", "floor": "checker", "window": {"style": "round", "side": "left", "view": "city"},
               "layout": "shelves", "chart": "body", "time": "day"},
  },
  "package": {
    "title": "What Happens When a Snake Bites You",
    "phrase": "what happens when a snake bites you",
    "opener": "What happens when a snake bites you? Venom from a venomous snake can cause paralysis that can stop breathing, bleeding problems, kidney failure and tissue damage (WHO). What to do while you wait for help (NHS): stay calm, keep the bitten part of your body as still as you can, take off rings and other jewellery in case it swells, and call your emergency number. Do NOT cut or suck the bite, do NOT tie anything tightly around it, and do not go near the snake. At the hospital, antivenom is the most effective treatment. Some bites from venomous snakes carry no venom at all, but you cannot tell, so get every snake bite checked. Worldwide, about 5.4 million people are bitten by snakes every year (WHO).",
    "question": "Did you know you should never cut or suck a snake bite?",
    "tags": ["what happens when a snake bites you", "snake bite", "snake bite first aid", "what to do if a snake bites you", "venom",
             "antivenom", "snake bite myths", "dry bite", "venomous snake", "health cartoon"],
    "hashtags": "#snakebite #health #shorts",
    "cover": {"at": 0.8, "text": "A snake bites you", "accent": "snake"},
  },
  "retention": {
    "noIntro": {"scene": "A1", "line": "A snake bites you. We ride!"},
    "promise": {"scene": "A1", "line": "A snake bites you. We ride!"},
    "question": {"scene": "A2", "line": "Ow! Was that snake venomous?"},
    "answer": {"scene": "F2", "line": "...but you can't tell which snake is venomous. Get every bite checked."},
    "change3s": {"scene": "all", "line": "steady camera: something happens in the picture at least every 3 s (stickers do not count)"},
    "twist": {"scene": "D3", "line": "No, Mom! Don't cut it, suck it, or tie it."},
    "bestLast": {"scene": "F2", "line": "...but you can't tell which snake is venomous. Get every bite checked."},
    "loop": {"scene": "G1", "line": "Next time a snake bites you... we ride again!"},
  },
  "sources": [
    {"id": WHO, "label": "World Health Organization. Snakebite envenoming (fact sheet)", "url": "https://www.who.int/news-room/fact-sheets/detail/snakebite-envenoming",
     "note": "'An estimated 5.4 million people worldwide are bitten by snakes each year'; 'Bites by venomous snakes can cause paralysis that may prevent breathing, bleeding disorders that can lead to a fatal haemorrhage, irreversible kidney failure and tissue damage'; 'High-quality snake antivenoms are the most effective treatment to prevent or reverse most of the venomous effects of snake bites'."},
    {"id": NHS, "label": "NHS. Snake bites", "url": "https://www.nhs.uk/conditions/snake-bites/",
     "note": "Do: 'stay calm'; 'keep the part of your body that was bitten as still as you can'; 'take off any jewellery and loosen clothes near the bite, in case the skin swells'. Don't: 'do not try to suck or cut the venom (toxin) out of the bite'; 'do not tie anything tightly round the part of the body where the bite is'. 'you should get all snake bites checked as soon as possible'. Read in the browser on 2026-11-22."},
    {"id": GU, "label": "Gutierrez JM et al. Snakebite envenoming. Nat Rev Dis Primers 2017;3:17063", "url": "https://pubmed.ncbi.nlm.nih.gov/28905944/",
     "note": "'Intravenous administration of antivenom is the only specific treatment to counteract envenoming.'"},
    {"id": NA, "label": "Naik BS. \"Dry bite\" in venomous snakes: a review. Toxicon 2017;133:63-67", "url": "https://pubmed.ncbi.nlm.nih.gov/28456535/",
     "note": "'A good percentage of venomous snake bites in humans do occur without venom injection.' No percentage is given in the video."},
  ],
  "shots": shots,
  "cta": {"text": "Snake bite: know this. Never cut, suck or tie the bite. Stay calm and keep it still. Get every bite checked. Follow MedPeak Health for more health tips that keep you safe.",
          "src": [NHS]},
  "musicPrompt": "A steady, continuous adventure-comedy cartoon groove at 100 BPM that never stops or drops out: a constant driving drum beat with shakers, a bouncy plucked bass line and a held warm string pad under everything from the first second to the last, no breaks, no silences, no stop-time stabs. A sneaky, slinky clarinet and marimba melody on top like a villain gang on the move, with a bright heroic brass lift near the end. Background music under dialogue.",
}
os.makedirs(os.path.join(ROOT, "videos", "snake-bite"), exist_ok=True)
with open(os.path.join(ROOT, "videos", "snake-bite", "toon.json"), "w") as fh:
    json.dump(toon, fh, indent=1, ensure_ascii=False)
    fh.write("\n")
print("wrote videos/snake-bite/toon.json")
