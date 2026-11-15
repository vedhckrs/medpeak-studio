"""Builds the MedPeak Health SEO plan (seo_plan.json + SEO_PLAN.md).

Each entry: id, action (KEEP = title stays, ranking well; FIX = new title),
new title, description opener (keyword-first), tags, 3 hashtags, reason.
Full description = opener + standard footer.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
CURRENT = sys.argv[1]  # path to videos_current.json

FOOTER = (
    "\n\n🔔 Subscribe to MedPeak Health for 3D medical animations that show what really "
    "happens inside your body: @MedPeakHealth"
    "\n\n💬 Comment below: which part of the body should we animate next?"
    "\n\n⚠️ For education only. This video is not medical advice, diagnosis or treatment. "
    "Always talk to a qualified doctor about your health."
)

P = [
 # ---- top performers: keep titles, strengthen description/tags only
 ("GpVj_C67iOE","KEEP","How Too Much Sugar Damages Your Body",
  "What does sugar do to your body? This 3D animation shows how too much sugar affects your blood sugar, insulin, liver and fat storage, and why the effects of sugar on the body build up over time.",
  ["what sugar does to your body","how sugar affects your body","effects of sugar on the body","sugar side effects","what happens when you eat too much sugar","too much sugar","added sugar","insulin resistance","fatty liver","blood sugar"],
  "#sugar #bloodsugar #3danimation",
  "Your #1 video (59K views, 196 subs). Ranks for 'how sugar affects your body' and 'what sugar does to your body'. Don't touch the title; only make the description lead with those exact search phrases."),
 ("heMkXCcFcAQ","KEEP","What Happens When a Virus Invades Your Body?",
  "How does a virus enter the human body and make you sick? This virus animation shows a virus invading your cells, copying itself, and how your immune system fights back with white blood cells and antibodies.",
  ["virus animation","how viruses work","how virus enters human body","what happens when a virus enters your body","viral infection","immune system animation","immune response","antibodies","white blood cells"],
  "#virus #immunesystem #3danimation",
  "Your #2 video (25K views). People search 'virus animation' and 'how virus enter in human body animation', so those words go in the description and tags. Title stays."),
 ("wGVm8L6aH0A","KEEP","Your Brain Cleans Itself While You Sleep",
  "The glymphatic system is how your brain cleans itself while you sleep. During deep sleep, cerebrospinal fluid flows through the brain and helps wash away waste. This 3D animation shows how it works.",
  ["glymphatic system","glymphatic system explained","brain cleans itself while you sleep","brain cleaning during sleep","deep sleep","cerebrospinal fluid","sleep and brain health"],
  "#glymphaticsystem #sleep #brain",
  "Gets 974 searches for 'glymphatic system'. Title works; description now opens with 'glymphatic system'."),
 ("lk0Um5nXOIw","KEEP","Normal Blood Sugar? Insulin Resistance Explained",
  "What is insulin resistance, and can you have it with normal blood sugar? This 3D animation explains insulin resistance symptoms and what happens in your pancreas, muscle cells and liver.",
  ["insulin resistance","insulin resistance explained","insulin resistance symptoms","what is insulin resistance","normal blood sugar","prediabetes","insulin and glucose"],
  "#insulinresistance #bloodsugar #diabetes",
  "Newest video and already ranks for 'insulin resistance' searches. Title stays; best topic to make a LONG video about."),
 ("OdrexUIfjUA","KEEP","What Happens to Your Liver When You Drink Alcohol?",
  "What happens to your liver when you drink alcohol? This 3D animation follows alcohol into your bloodstream and liver cells, and shows how regular drinking can lead to fatty liver and liver damage.",
  ["what happens to your liver when you drink alcohol","alcohol and liver","alcohol effects on liver","fatty liver","liver damage","alcohol metabolism"],
  "#liver #alcohol #3danimation",
  "Title already matches a common search. Shorter, keyword-first description."),
 ("M0FQ_Syqg9A","KEEP","What Happens When a Splinter Enters Your Skin?",
  "What happens if you get a splinter? This 3D animation shows how a splinter breaks your skin, how bacteria get in, and how white blood cells and inflammation fight infection and heal the wound.",
  ["splinter","what happens if you get a splinter","infected splinter","splinter in skin","immune response","inflammation","wound healing"],
  "#splinter #immunesystem #3danimation",
  "Ranks for 'splinter' (32 searches). Title stays."),
 # ---- retitle: add the words people actually search
 ("bDd8lASeRxk","FIX","How Ozempic Works: GLP-1 Explained in 3D",
  "How does Ozempic work? Ozempic (semaglutide) is a GLP-1 receptor agonist. This 3D animation explains the GLP-1 mechanism of action: how it slows digestion, reduces hunger and helps control blood sugar.",
  ["how ozempic works","glp 1 mechanism of action","semaglutide mechanism of action","how glp 1 works","ozempic","semaglutide","glp-1","weight loss injection","blood sugar"],
  "#ozempic #glp1 #semaglutide",
  "Top search is 'glp 1 mechanism of action' (182) but 'GLP-1' isn't in the title. Adding it."),
 ("rGbL0GIrKF8","FIX","How Wounds Heal: What Happens When You Get a Cut",
  "How do wounds heal? When you get a cut, platelets form a clot, immune cells clear germs, and collagen rebuilds the skin. This 3D animation shows every stage of wound healing.",
  ["how wounds heal","wound healing","wound healing stages","what happens when you get a cut","blood clotting","platelets","collagen","skin repair"],
  "#woundhealing #humanbody #3danimation",
  "2.8K views but zero real search traffic (searches were random gaming terms). Adding 'how wounds heal'."),
 ("fGJsFfXlK_8","FIX","What Happens in Your Lungs During an Asthma Attack?",
  "What happens during an asthma attack? Your airways tighten, swell and fill with mucus, so air can't move freely. This 3D animation shows asthma inside the lungs and how inhalers help open the airways.",
  ["asthma attack","what happens during an asthma attack","asthma","asthma explained","bronchial asthma","airways","inhaler","can't breathe"],
  "#asthma #lungs #3danimation",
  "'asthma attack' is a much bigger search than 'during asthma'."),
 ("961LMV9O-8I","FIX","What Causes Brain Fog? (Inside Your Brain)",
  "What causes brain fog? Poor sleep, stress, dehydration, diet and some health conditions can all make thinking feel slow and foggy. This 3D animation shows what may be happening inside your brain.",
  ["what causes brain fog","brain fog","brain fog causes","how to get rid of brain fog","mental fatigue","poor focus","brain health"],
  "#brainfog #brainhealth #3danimation",
  "No real search traffic. 'What causes brain fog' is the common search phrase."),
 ("yi-zxs3An2s","FIX","How Insulin Works (3D Animation)",
  "How does insulin work? Insulin acts like a key that unlocks your cells so glucose can enter and be used for energy. This insulin animation shows insulin receptors, blood sugar and what goes wrong in diabetes.",
  ["how insulin works","insulin animation","what does insulin do","insulin","blood sugar","glucose","insulin resistance animation","diabetes"],
  "#insulin #bloodsugar #diabetes",
  "Viewers searched 'insulin animation'. 'How insulin works' is the main search."),
 ("o1pen8FeuKg","FIX","Immune System Animation: White Blood Cells vs Bacteria",
  "How does your immune system fight bacteria? This immune system animation shows white blood cells finding, surrounding and destroying bacteria inside your body.",
  ["immune system animation","white blood cells attacking bacteria","how immune system works","immune system","white blood cells","bacteria animation","neutrophils","macrophages"],
  "#immunesystem #bacteria #3danimation",
  "Top searches: 'immune system animation' (46) and 'white blood cells attacking bacteria'. Title now matches them."),
 ("kWZ1Jbyo6ho","FIX","How Breast Cancer Spreads Before You Feel a Lump",
  "Breast cancer can start before you feel a lump. This 3D animation shows how breast cancer begins in a milk duct and spreads, the early breast cancer symptoms to know, and how a mammogram can find it early.",
  ["breast cancer","breast cancer symptoms","how breast cancer spreads","breast cancer animation","mammogram","mammography test","breast lump","early detection"],
  "#breastcancer #mammogram #womenshealth",
  "Works for 'breast cancer'. Removed the emoji; description now covers 'breast cancer symptoms' and 'mammography'."),
 ("69w--s8IhRo","FIX","Microplastics in Your Blood: What They Do to Your Body",
  "Are there microplastics in your blood? Studies have found microplastics in human blood. This 3D animation shows how microplastics can enter the body, travel in the bloodstream and interact with immune cells.",
  ["microplastics in blood","microplastics in human body","microplastics","how microplastics affect the body","plastic in blood"],
  "#microplastics #health #3danimation",
  "Old title was a statement with no search phrase. 'Microplastics in blood' is what people type."),
 ("_Uczx1G6dVQ","FIX","What Happens in Your Brain During a Stroke? (3D)",
  "What happens during a stroke? Blood flow to part of the brain is blocked and brain cells start losing oxygen within minutes. Learn the stroke symptoms (BE FAST / FAST) and why every minute matters.",
  ["stroke","what happens during a stroke","stroke symptoms","brain stroke","FAST stroke signs","ischemic stroke"],
  "#stroke #brain #3danimation",
  "Small tweak. Description now leads with 'stroke symptoms'."),
 ("d-Un91Fvtws","FIX","What Vaping Does to Your Lungs",
  "What does vaping do to your lungs? This 3D animation shows how vape aerosol reaches your airways and air sacs, irritates lung cells and can lead to inflammation and lung damage.",
  ["what vaping does to your lungs","vaping","vaping lungs","is vaping bad for you","vape lungs","e-cigarette lungs","vaping dangers"],
  "#vaping #lungs #3danimation",
  "Removed the all-caps 'ACTUALLY' (the caps batch underperformed). Uses the 'what vaping does to your lungs' search."),
 ("Sz9rhV-DpYo","FIX","Vape Lungs vs Healthy Lungs: Inside Your Air Sacs",
  "Vape lungs vs healthy lungs: what's the difference? This 3D animation goes inside your alveoli (air sacs) to show how vaping can coat them, reduce oxygen exchange and leave scar tissue over time.",
  ["vape lungs","vape lungs vs healthy lungs","vaping lung damage","alveoli","e-cigarette health effects","is vaping safe"],
  "#vaping #lungs #3danimation",
  "Duplicate of the other vaping video. A different angle ('vape lungs vs healthy lungs') stops the two competing for the same search."),
 ("rpifgft1yBg","FIX","Heart Attack Animation: Inside a Blocked Artery",
  "What happens inside an artery during a heart attack? This heart attack animation shows plaque rupturing, a clot forming and blood flow to the heart muscle being cut off.",
  ["heart attack animation","heart attack","blocked artery","coronary artery","plaque rupture","what causes a heart attack"],
  "#heartattack #heart #3danimation",
  "Two heart-attack videos compete. This one targets 'heart attack animation'."),
 ("6uoQoP7MBx8","FIX","What Happens During a Heart Attack? (Heart Attack Explained)",
  "What happens during a heart attack? This 3D animation shows how plaque slowly builds up in a coronary artery, how a sudden blockage starves the heart of oxygen, and why getting help fast saves heart muscle.",
  ["what happens during a heart attack","heart attack explained","heart attack","myocardial infarction","heart attack symptoms","what is a heart attack"],
  "#heartattack #heart #health",
  "Already gets 'heart attack' searches. Title made fuller."),
 ("kTd_fkSX4Ug","FIX","Hidden Sugar in 'Healthy' Foods: How to Spot It",
  "Hidden sugar is in many 'healthy' foods like granola, yogurt, juice and protein bars. This animation shows how to read food labels, spot names for added sugar and what it does to your blood sugar.",
  ["hidden sugar","hidden sugar in healthy foods","added sugar","how to read food labels","names for sugar","sugar in food"],
  "#hiddensugar #nutrition #sugar",
  "No search traffic. Pairs with your sugar video, so 'hidden sugar' goes first."),
 ("x9h098yuk_o","FIX","How Your Nose Filters Air Before It Reaches Your Lungs",
  "How does your nose protect your lungs? Your nose filters, warms and humidifies the air you breathe using mucus, tiny hairs (cilia) and blood vessels. This 3D animation shows the nasal cavity at work.",
  ["how your nose works","nose function","nasal cavity","nose filters air","cilia","mucus","respiratory system"],
  "#nose #lungs #anatomy",
  "No search traffic. Uses the clearer search phrase."),
 ("d2oBc-amFR0","FIX","How Your Kidneys Filter Blood (Kidney Function Explained)",
  "How do kidneys filter blood? Millions of tiny filters called nephrons clean your blood, balance fluids and make urine. This 3D animation explains kidney function step by step.",
  ["how kidneys filter blood","kidney function","how do kidneys work","nephron","kidney animation","urine formation"],
  "#kidney #kidneyhealth #3danimation",
  "No search traffic. 'How kidneys filter blood' and 'kidney function' are common searches."),
 ("pgyK6zeoO8c","FIX","Can Food Unclog Your Arteries? What Science Says",
  "Can food unclog arteries? No single food clears blocked arteries, but a heart-healthy diet with fibre, healthy fats and antioxidants can help protect them. This animation shows what science says.",
  ["foods that unclog arteries","can food unclog arteries","clogged arteries","heart healthy foods","cholesterol","artery health"],
  "#hearthealth #arteries #nutrition",
  "Added the 'what science says' angle plus the 'foods that unclog arteries' keyword."),
 ("2hqRyd6gH3Y","FIX","What Energy Drinks Do to Your Heart",
  "What do energy drinks do to your heart? This 3D animation shows how caffeine blocks your heart's 'slow down' signal and raises adrenaline, heart rate and blood pressure.",
  ["what energy drinks do to your heart","energy drinks effects on human body","energy drinks","energy drinks and heart","caffeine and heart","energy drink side effects"],
  "#energydrinks #heart #caffeine",
  "Removed caps. Duplicate topic, so this one targets the general question."),
 ("COKwWnAzruU","FIX","Can Energy Drinks Cause Heart Arrhythmia?",
  "Can energy drinks cause heart arrhythmia? This 3D animation shows how very high caffeine doses can disturb your heart's electrical rhythm, and who should be most careful.",
  ["energy drinks arrhythmia","energy drinks heart palpitations","energy drink heart damage","caffeine heart rhythm","heart arrhythmia"],
  "#energydrinks #arrhythmia #heart",
  "Duplicate of the other energy-drink video. The 'arrhythmia' angle gives it its own search."),
 ("rjHEv8vz60E","FIX","Does Cinnamon Lower Blood Sugar? (Cinnamon for Diabetes)",
  "Does cinnamon lower blood sugar? Cinnamon for diabetes is a popular claim, but the research is mixed. This animation explains what studies show and why cinnamon is not a replacement for medicine.",
  ["does cinnamon lower blood sugar","cinnamon for diabetes","cinnamon water for diabetes","cinnamon blood sugar","ceylon cinnamon"],
  "#cinnamon #bloodsugar #diabetes",
  "Viewers searched 'cinnamon water for diabetic'. Title now matches that intent."),
 ("hZMKASLDy0s","FIX","Can Vitamin Deficiency Cause Hair Loss?",
  "Can vitamin deficiency cause hair loss? Low iron, vitamin D, zinc or protein can all affect hair growth. This animation shows how nutrition reaches your hair follicles.",
  ["vitamin deficiency hair loss","hair loss causes","hair fall reasons","iron deficiency hair loss","vitamin d hair loss","hair loss"],
  "#hairloss #hairfall #nutrition",
  "The old title promised every cause but the video covers nutrients. The new title matches the video, which helps viewers keep watching."),
 ("ch1hX0UzL6M","FIX","How HPV Causes Cervical Cancer (and How the Vaccine Helps)",
  "How does HPV cause cervical cancer? This 3D animation shows how HPV infects cervical cells, how cervical cancer can take 10 to 20 years to develop, and how the HPV vaccine trains your immune system.",
  ["hpv","how hpv causes cervical cancer","cervical cancer","hpv vaccine","cervical cancer symptoms","what is cervical cancer","pap smear"],
  "#hpv #cervicalcancer #womenshealth",
  "Top search is 'hpv' but it wasn't in the title. Removed the caps 'YEARS'."),
 ("q_QpGqVab2I","FIX","Glymphatic System Explained: How Your Brain Cleans Itself",
  "Glymphatic system explained: during deep sleep your brain's waste-clearing system speeds up, moving cerebrospinal fluid through brain tissue. This 2-minute animation shows how sleep supports brain health.",
  ["glymphatic system","glymphatic system explained","how the brain cleans itself","sleep and brain","cerebrospinal fluid"],
  "#glymphaticsystem #sleep #brain",
  "Shorter title, keyword first."),
 ("3C7Lp05EfxA","FIX","What Happens When You Hold Your Pee? (Bladder Animation)",
  "What happens if you hold your urine too long? This 3D animation shows how your bladder fills, how nerves send the urge to pee, and why holding it too often can raise the risk of infection.",
  ["what happens if you hold your urine","hold your pee","holding pee too long","bladder animation","urinary system","full bladder"],
  "#bladder #urinarysystem #3danimation",
  "Removed emoji; added 'what happens if you hold your urine' (a real search)."),
 ("8s2jkPZL9bU","FIX","What Diabetes Does to Your Body (Type 2 Diabetes Explained)",
  "What does diabetes do to your body? This 3D animation explains type 2 diabetes simply: how insulin resistance raises blood sugar, and how high blood sugar slowly affects blood vessels, nerves, eyes and kidneys.",
  ["what diabetes does to your body","type 2 diabetes explained","diabetes","what is diabetes","diabetes symptoms","high blood sugar"],
  "#diabetes #type2diabetes #bloodsugar",
  "Removed caps. Also replaces the inaccurate line '1 in 3 Americans already has this': that figure is for PREDIABETES, not diabetes."),
 ("muvV8iljXMo","FIX","What Coffee Does to Your Heart (Caffeine Explained)",
  "What does coffee do to your heart? Caffeine blocks adenosine, the signal that tells your heart to slow down, and raises adrenaline. This animation shows why moderate coffee is fine for most people.",
  ["what coffee does to your heart","caffeine and heart","coffee and heart health","coffee heart palpitations","caffeine effects"],
  "#coffee #caffeine #heart",
  "Removed caps; shorter."),
 ("yA37nq3i7ZQ","FIX","Why Am I Anxious for No Reason? (What's Happening in Your Brain)",
  "Why am I anxious for no reason? Your amygdala can trigger the fight-or-flight response before your thinking brain catches up. This animation explains anxiety symptoms like a racing heart and tight chest.",
  ["why am i anxious for no reason","anxiety for no reason","anxiety symptoms","what is anxiety","fight or flight","amygdala"],
  "#anxiety #mentalhealth #brain",
  "Hashtags removed from the title (they cut it off). Searches match 'anxiety symptoms' and 'why am I anxious'."),
 ("3o4QEE-wKR4","FIX","How Tuberculosis Hides in Your Lungs (TB Animation)",
  "How does tuberculosis (TB) infect your lungs? About a quarter of the world's people carry TB bacteria. This TB animation shows how it hides from immune cells and how the body walls it off in a granuloma.",
  ["tuberculosis","tb","tuberculosis animation","tb infection","how tb affects lungs","granuloma"],
  "#tuberculosis #tb #lungs",
  "Removed emoji; added the plain words 'tuberculosis' and 'TB animation'."),
 ("qNiW-oDwEF8","FIX","Why Do I Wake Up at 3 AM? (Cortisol Explained)",
  "Why do I wake up at 3am every night? Cortisol naturally starts rising in the early morning, and stress can make that rise stronger during light sleep. This animation explains what's happening.",
  ["why do i wake up at 3am","waking up at 3am","wake up at 3am","cortisol","stress and sleep","insomnia"],
  "#sleep #cortisol #insomnia",
  "Exact search phrase is 'why do i wake up at 3am'."),
 ("VWvgPaws_cY","FIX","What High Blood Sugar Does to Your Body",
  "What does high blood sugar do to your body? Over time, high blood sugar (hyperglycemia) can damage blood vessels, nerves, eyes and kidneys. More than 1 in 3 US adults has prediabetes, and most don't know it.",
  ["what high blood sugar does to your body","high blood sugar","hyperglycemia","high blood sugar symptoms","prediabetes"],
  "#bloodsugar #diabetes #health",
  "Title is fine. Fixes the '1 in 3 American adults' line to say prediabetes, which is the accurate figure."),
 ("iQiPJjow2EE","FIX","How Your Immune System Fights Cancer Cells",
  "How does your immune system fight cancer? Your body regularly finds and removes cells that start growing abnormally. This 3D animation shows how immune cells spot cancer cells and what happens when cancer escapes.",
  ["how immune system fights cancer","cancer cells","immune system and cancer","how cancer starts","cancer explained"],
  "#cancer #immunesystem #3danimation",
  "The old title didn't match the video, which is about the immune system clearing abnormal cells."),
 ("4t3JxywIWRE","FIX","Sleep and Alzheimer's: What Your Brain Clears at Night",
  "How is sleep linked to Alzheimer's? During deep sleep your glymphatic system helps clear proteins like amyloid-beta and tau, which are linked to Alzheimer's disease. This animation shows the process.",
  ["sleep and alzheimer's","amyloid beta","deep sleep brain","glymphatic system","brain detox sleep"],
  "#alzheimers #sleep #brain",
  "Third brain-cleaning video with almost the same title. A new angle (Alzheimer's) stops it competing with your 4K-view one."),
 ("9hoD3Nr63I0","FIX","Why Can a Heart Beat Outside the Body?",
  "Why can a heart beat outside the body? The heart has its own pacemaker, the sinoatrial (SA) node, which creates electrical signals without the brain. This 3D animation shows your heart's electrical system.",
  ["heart beating outside body","why can a heart beat outside the body","sinoatrial node","heart electrical system","human heart"],
  "#heart #humanheart #3danimation",
  "Phrased as the question people type."),
 ("fvJHGbe_R84","FIX","What Happens to Your Brain Without Sleep?",
  "What happens to your brain without sleep? After 24 hours awake, attention, memory, reaction time and mood all get worse. This animation shows the effects of sleep deprivation and microsleeps.",
  ["what happens to your brain without sleep","sleep deprivation","effects of sleep deprivation","24 hours without sleep","microsleep"],
  "#sleepdeprivation #sleep #brain",
  "Removed emoji; matches the common search phrase."),
 ("MUFZoSDQ4nM","FIX","Type 2 Diabetes Explained: How Insulin Resistance Damages Your Body",
  "Type 2 diabetes explained in 5 minutes. This 3D animation shows how insulin resistance starts, why blood sugar rises, how the pancreas gets overworked, and how high blood sugar damages blood vessels and organs over time.",
  ["type 2 diabetes explained","type 2 diabetes","insulin resistance","diabetes animation","how diabetes damages the body","blood sugar"],
  "#diabetes #type2diabetes #insulinresistance",
  "Your ONLY long video, and the only kind that counts toward the 4,000 hours. Clearer title. Pin it on your channel page and link it from every diabetes or sugar Short."),
 ("x6WqEIFCdAM","FIX","How Screen Time Affects Your Brain (Dopamine & Focus)",
  "How does screen time affect your brain? Endless scrolling gives your brain frequent dopamine hits, which can make focusing on slower tasks harder. This animation shows what may happen and how to reset.",
  ["how screen time affects your brain","screen time brain","dopamine","doomscrolling","phone addiction brain"],
  "#screentime #dopamine #brain",
  "Removed caps and emoji. Only had 6 tags before."),
 ("kyOIiTBpLqM","FIX","How Your Skin Protects You: Skin Layers Explained",
  "How does your skin protect you? Your skin is your largest organ, with three layers (epidermis, dermis and hypodermis) that block germs, UV light and water loss. This 3D animation takes you inside each layer.",
  ["skin layers","layers of skin","how skin protects you","epidermis dermis hypodermis","skin anatomy"],
  "#skin #anatomy #3danimation",
  "Tags were all hashtags (#skin...), which YouTube doesn't use as tags. Replaced with real tags."),
 ("cKSd3GsDtJE","FIX","How Fast Do Nerve Signals Travel? (Nervous System)",
  "How fast do nerve signals travel? The fastest nerves send signals at around 120 metres per second (about 270 mph). This 3D animation shows how neurons fire and carry signals to your brain.",
  ["how fast do nerve signals travel","nervous system","nerve impulse","how neurons work","nervous system animation"],
  "#nervoussystem #brain #3danimation",
  "Had NO tags at all, and the title had no search phrase."),
 ("beo_6rwG9XY","FIX","Walking After Eating: What It Does to Your Blood Sugar",
  "Should you walk after eating? A short walk after meals helps your muscles pull glucose out of your blood and lowers blood sugar spikes. This 3D animation shows how walking after eating works.",
  ["walking after eating","walk after eating","walking after meals blood sugar","post meal walk","blood sugar spike"],
  "#bloodsugar #walking #diabetes",
  "Keyword first ('walking after eating'), emoji removed."),
]

CHANNEL = {
 "keywords": ('"3d medical animation" "human body" "how the body works" "medical animation" '
              '"health education" "blood sugar" "insulin resistance" "diabetes explained" '
              '"immune system" "heart health" "brain health" "sleep science" "anatomy" '
              '"biology animation" "health explained" "MedPeak Health"'),
 "description": (
  "MedPeak Health makes 3D medical animations that show what really happens inside your body.\n\n"
  "How does sugar damage your body? What does insulin resistance do? How does your immune system "
  "fight a virus? We animate the answers in short, simple explainers you'll actually remember.\n\n"
  "🩸 Blood sugar, insulin resistance & diabetes\n"
  "🦠 Immune system, viruses & infections\n"
  "🫀 Heart, brain, lungs, kidneys & more\n"
  "😴 Sleep, stress & everyday health questions\n\n"
  "New videos every week. Subscribe so you don't miss one.\n\n"
  "⚠️ For education only. Not medical advice, diagnosis or treatment. Always talk to a qualified doctor about your health."),
}


def main():
    cur = {v["id"]: v for v in json.load(open(CURRENT))["videos"]}
    plan = []
    for vid, action, title, opener, tags, hashtags, reason in P:
        old = cur[vid]
        assert len(title) <= 100, title
        desc = opener + FOOTER + "\n\n" + hashtags
        tags = tags + ["3d medical animation", "medical animation", "MedPeak Health"]
        plan.append({"id": vid, "action": action, "views": old["views"],
                     "old_title": old["title"], "new_title": title,
                     "old_tags": old["tags"], "new_tags": tags,
                     "old_description": old["desc"], "new_description": desc,
                     "reason": reason})
    missing = [v for v in cur if v not in {p["id"] for p in plan}]
    json.dump({"channel": CHANNEL, "videos": plan, "skipped": missing},
              open(os.path.join(HERE, "seo_plan.json"), "w"), indent=1, ensure_ascii=False)

    md = ["# MedPeak Health: SEO fix plan for every video", "",
          "Built from each video's real YouTube search terms (analytics through Nov 14, 2026).", "",
          "**KEEP** = title is already ranking, so only the description and tags change. "
          "**FIX** = new title too.", "",
          "## Channel", "", "**New channel keywords** (old ones were about executive health and "
          "longevity medicine, which isn't what the channel makes):", "",
          "```", CHANNEL["keywords"], "```", "", "**New channel description:**", "",
          "```", CHANNEL["description"], "```", "",
          "## Rules used for every video",
          "- Put the exact phrase people search at the start of the title and the first line of the description.",
          "- No ALL-CAPS words, no emojis and no hashtags in titles (that batch underperformed).",
          "- Same-topic videos get different angles so they stop competing with each other.",
          "- Description = 2–3 keyword sentences, then subscribe line, comment question, disclaimer, 3 hashtags.",
          "- Fix inaccurate stats (diabetes vs prediabetes).", "",
          "## Every video (sorted by views)", ""]
    for i, p in enumerate(sorted(plan, key=lambda x: -x["views"]), 1):
        md += [f"### {i}. [{p['action']}] {p['new_title']}",
               f"`{p['id']}` · {p['views']:,} views", "",
               f"- **Old title:** {p['old_title']}",
               f"- **New title:** {p['new_title']}" + (" *(unchanged)*" if p['old_title'] == p['new_title'] else ""),
               f"- **Why:** {p['reason']}",
               f"- **New tags:** {', '.join(p['new_tags'])}", "",
               "**New description:**", "", "```", p["new_description"], "```", ""]
    md += ["## Not changed", "", f"- `{', '.join(missing)}`: private 'Intro' video, left alone.", ""]
    open(os.path.join(HERE, "SEO_PLAN.md"), "w").write("\n".join(md))
    fixes = sum(p["old_title"] != p["new_title"] for p in plan)
    print(f"{len(plan)} videos planned, {fixes} new titles, {len(plan) - fixes} titles kept; skipped {missing}")


if __name__ == "__main__":
    main()
