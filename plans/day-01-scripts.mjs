// Day 1 scripts (18 Nov 2026): writes videos/<slug>/toon.json for the four videos.
import fs from 'node:fs';
import path from 'node:path';
const ROOT = '/Users/vedika/Desktop/MedPeakHealth/medpeak-studio';

const tag = (text, from, o = {}) => ({kind: 'tag', text, x: 330, y: 330, size: 320, rot: -4, from, to: from, ...o});
const change3s = {scene: 'all', line: 'steady camera: something new happens in the picture at least every 3 s'};
const stageCast = (a, b, ea, pa, eb, pb) => [{who: a, x: 540, size: 600, stage: true, emotion: ea, pose: pa}, {who: b, x: 540, size: 600, stage: true, emotion: eb, pose: pb}];

// ------------------------------------------------------------------ sources
const S = {
  medlineSwallowed: {id: 'medline-swallowed', label: 'MedlinePlus (US National Library of Medicine). Foreign object - swallowed (review date 8 January 2025)', url: 'https://medlineplus.gov/ency/article/000036.htm', note: "'If the object passes through the food pipe and into the stomach without getting stuck, it will probably pass through the entire GI tract. Objects will often pass through the GI tract within a week. In most cases, the object passes through without harming the person.' The page is about swallowed objects in general (coins, beads, buttons); it does not name gum."},
  milov: {id: 'milov-1998', label: 'Milov DE, Andres JM, Erhart NA, Bailey DJ. Chewing gum bezoars of the gastrointestinal tract. Pediatrics. 1998 (PMID 9685468)', url: 'https://pubmed.ncbi.nlm.nih.gov/9685468/', note: "'we briefly review gum-chewing complications and describe three children who developed intestinal tract and esophageal obstruction as a consequence of swallowing gum.' 'the medical literature contains very little information about the adverse effects of chewing gum.' Read from the abstract; the full text is not open."},
  niddkDigestive: {id: 'niddk-digestive', label: 'NIH National Institute of Diabetes and Digestive and Kidney Diseases. Your Digestive System & How it Works (last reviewed December 2017)', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works', note: "'After food enters your stomach, the stomach muscles mix the food and liquid with digestive juices. The stomach slowly empties its contents, called chyme, into your small intestine.' 'Waste products of digestion, including parts of food that are still too large, become stool.'"},
  goyal: {id: 'goyal-2019', label: 'Goyal RK, Guo Y, Mashimo H. Advances in the physiology of gastric emptying. Neurogastroenterol Motil. 2019 (PMID 30740834)', url: 'https://pubmed.ncbi.nlm.nih.gov/30740834/', note: "'In the inter-digestive (fasting) period, gastric motility designed to clear the stomach of undigestible residues.' 'During the migrating front, the pylorus and duodenum remain relaxed and open to allow phase III activity to sweep food residues out of the stomach.' Read in the full text (PMC6850045)."},
  nhsTeeth: {id: 'nhs-teeth', label: 'NHS. How to keep your teeth clean (page last reviewed 30 June 2025)', url: 'https://www.nhs.uk/live-well/healthy-teeth-and-gums/how-to-keep-your-teeth-clean/', note: "'Brush your teeth twice a day for about 2 minutes each time. Brush them last thing before you go to bed, as night-time brushing is important, and on 1 other occasion.' 'After brushing, spit out any excess toothpaste. Don't rinse your mouth immediately after brushing, as it'll wash away the concentrated fluoride in the remaining toothpaste.'"},
  dawes: {id: 'dawes-2008', label: 'Dawes C. Salivary flow patterns and the health of hard and soft oral tissues. J Am Dent Assoc. 2008 (PMID 18460676)', url: 'https://pubmed.ncbi.nlm.nih.gov/18460676/', note: "'Saliva protects against dental caries'. 'The most important time for toothbrushing is just before bedtime, because salivary flow is negligible during sleep and the protective effects of saliva are lost.' A review by one author, not a systematic review."},
  nidcr: {id: 'nidcr', label: 'NIH National Institute of Dental and Craniofacial Research. The Tooth Decay Process: How to Reverse It and Avoid a Cavity (reviewed January 2025)', url: 'https://www.nidcr.nih.gov/health-info/tooth-decay/more-info/tooth-decay-process', note: "'Whenever we eat or drink something that contains sugar or starch, the bacteria use them to produce acids. These acids begin to eat away at the tooth's hard outer surface, or enamel.' 'Our saliva can help fight off this acid attack.' 'A white spot may appear where minerals have been lost. This is a sign of early decay.'"},
  nidcrDecay: {id: 'nidcr-decay', label: 'NIH National Institute of Dental and Craniofacial Research. Tooth Decay (reviewed September 2025)', url: 'https://www.nidcr.nih.gov/health-info/tooth-decay', note: "'In early tooth decay, there are not usually any symptoms. As tooth decay advances, it can cause a toothache (tooth pain) or tooth sensitivity to sweets, hot, or cold.'"},
  medlineSounds: {id: 'medline-sounds', label: 'MedlinePlus (US National Library of Medicine). Abdominal sounds (review date 9 October 2024)', url: 'https://medlineplus.gov/ency/article/003137.htm', note: "'Abdominal sounds (bowel sounds) are made by the movement of the intestines as they push food through. The intestines are hollow, so bowel sounds echo through the abdomen much like the sounds heard from water pipes.' 'Most bowel sounds are normal. They simply mean that the gastrointestinal tract is working.' 'Most of the sounds you hear in your stomach and intestines are due to normal digestion.'"},
  sanger: {id: 'sanger-2011', label: 'Sanger GJ, Hellstrom PM, Naslund E. The hungry stomach: physiology, disease, and drug development opportunities. Front Pharmacol. 2011 (PMID 21927604)', url: 'https://pubmed.ncbi.nlm.nih.gov/21927604/', note: "'During hunger, a series of high-amplitude contractions of the stomach and small intestine (phase III), which form part of a cycle of quiescence and contractions (known as the migrating motor complex, MMC), play a \"housekeeping\" role prior to the next meal, and may contribute toward the development of hunger.'"},
  medlineBelching: {id: 'medline-belching', label: 'MedlinePlus (US National Library of Medicine). Belching (review date 3 July 2025)', url: 'https://medlineplus.gov/ency/article/003080.htm', note: "'Belching is a normal process. The purpose of belching is to release air from the stomach. Every time you swallow, you also swallow air, along with fluid or food.' 'The buildup of air in the upper stomach causes the stomach to stretch. This triggers the muscle at the lower end of the esophagus (the tube that runs from your mouth to the stomach) to relax. Air then escapes up the esophagus and out of your mouth.' 'Avoid chewing gum, eating quickly, and eating gas-producing foods and beverages.'"},
  niddkGas: {id: 'niddk-gas', label: 'NIH National Institute of Diabetes and Digestive and Kidney Diseases. Symptoms and Causes of Gas in the Digestive Tract (last reviewed June 2021)', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/gas-digestive-tract/symptoms-causes', note: "'Belching, or burping, is a release of gas from your stomach through your mouth. People typically belch up to 30 times a day.' 'Swallowing more air may lead to more gas and gas symptoms. You swallow more air when you chew gum or suck on hard candy, drink carbonated, or fizzy, drinks, eat or drink too fast'."},
};

// ------------------------------------------------------------------ 1. swallow gum
const gum = {
  slug: 'swallow-gum', title: 'What Happens If You Swallow Gum', format: 2, music: 'panic', camera: 'steady', episode: 5,
  hooks: [
    {line: 'You swallow gum. Seven years inside you?', why: 'the story everyone was told as a child, asked straight to the viewer; the first picture is the gum sitting in the stomach'},
    {line: 'Swallow gum? Your stomach has a plan.', why: 'calmer and curious: it promises the stomach knows what to do'},
    {line: 'You swallow gum. Now what happens?', why: 'the plain search question, almost word for word'},
  ],
  rooms: {
    clinic: {palette: 'lavender', wall: 'wainscot', floor: 'wood', window: {style: 'arch', side: 'left', view: 'city'}, layout: 'shelves', chart: 'stomach', time: 'day'},
    home: {kind: 'kitchen', palette: 'sunny', wall: 'dots', floor: 'checker', window: {style: 'wide', side: 'left', view: 'hills'}, layout: 'stove-right', time: 'day'},
  },
  package: {
    title: 'What Happens If You Swallow Gum', phrase: 'what happens if you swallow gum',
    opener: 'What happens if you swallow gum? Many of us were told it stays inside for seven years. The US National Library of Medicine says a swallowed object that reaches the stomach will probably pass through the whole gut, often within a week. This cartoon shows it from inside the stomach, and Dr. Mira explains why gum is still for chewing: doctors have reported children with a blockage after swallowing gum.',
    question: 'Were you told that swallowed gum stays for seven years?',
    tags: ['what happens if you swallow gum', 'swallowed gum', 'does gum stay in your stomach for 7 years', 'swallowing gum myth', 'is it bad to swallow gum', 'chewing gum', 'stomach', 'digestion', 'health myths', 'health cartoon'],
    hashtags: '#gum #stomach #shorts',
    cover: {at: 1.2, text: 'Swallowed your gum?', accent: 'gum'},
  },
  retention: {
    noIntro: {scene: 'A1', line: 'You swallow gum. Seven years inside you?'},
    promise: {scene: 'A2', line: 'Seven years? Does gum ever come out?'},
    question: {scene: 'A2', line: 'Seven years? Does gum ever come out?'},
    answer: {scene: 'D6', line: 'So yes, gum does come out, often within a week.'},
    change3s,
    twist: {scene: 'D3', line: "But here's the twist: gum can still cause trouble. Doctors reported three children with a blockage from swallowed gum."},
    bestLast: {scene: 'D6', line: 'So yes, gum does come out, often within a week.'},
    loop: {scene: 'E2', line: 'Swallow gum? Not seven years inside you!'},
  },
  sources: [S.medlineSwallowed, S.milov, S.niddkDigestive, S.goyal],
  shots: [
    {id: 'A', set: 'tummy', label: 'STOMACH', cast: stageCast('stomach', 'foodpipe', 'shocked', 'belly', 'scared', 'think'),
      state: {gum: 1, food: 0.3, full: 0.35},
      events: [
        {at: 'A3', set: {gum: 0}, over: 8, fx: 'flash'},
        {at: 'A4', set: {gum: 1}, over: 40},
        {at: 'A4', delay: 1.2, sfx: 'plop'},
        {at: 'A5', word: 'mix', set: {full: 0.44}, over: 24, sfx: 'gurgle-stomach'},
        {at: 'A6', set: {full: 0.36}, over: 30},
      ],
      props: [
        {kind: 'gum', x: 190, y: 540, size: 230, from: 'A1', word: 'gum', to: 'A2', halo: true},
        tag('7 years?', 'A1', {word: 'Seven'}),
        tag('does it come out?', 'A2', {size: 300, rot: 3}),
        tag('1 minute earlier', 'A3', {size: 280, rot: -3}),
        tag('gulp!', 'A4', {word: 'comes', rot: 4}),
        tag('mixing...', 'A5', {word: 'mix', rot: -3}),
        {kind: 'clock', x: 190, y: 540, size: 230, from: 'A6', halo: true},
        tag('still here', 'A6', {word: 'here', rot: 4, to: undefined}),
      ],
      lines: [
        {id: 'A1', who: 'stomach', text: 'You swallow gum. Seven years inside you?', emotion: 'shocked', pose: 'belly', key: 'gum', react: {foodpipe: 'scared'}},
        {id: 'A2', who: 'foodpipe', text: 'Seven years? Does gum ever come out?', emotion: 'scared', pose: 'think', key: 'out'},
        {id: 'A3', who: 'stomach', text: 'Rewind! A minute ago, he swallowed his gum.', emotion: 'neutral', pose: 'belly', key: 'swallowed', react: {foodpipe: 'shocked'}},
        {id: 'A4', who: 'foodpipe', text: 'Here it comes! One sticky pink lump.', emotion: 'shocked', pose: 'panic', key: 'sticky', react: {stomach: 'shocked'}},
        {id: 'A5', who: 'stomach', text: 'I mix it with my juices, like all his food.', emotion: 'neutral', pose: 'belly', key: 'mix', src: ['niddk-digestive']},
        {id: 'A6', who: 'foodpipe', text: "And it's still here. Now what?", emotion: 'scared', pose: 'shrug', key: 'here', react: {stomach: 'sick'}},
      ]},
    {id: 'T1', set: 'tummy', card: 'That evening...', seconds: 1.4, cast: [], lines: []},
    {id: 'C', set: 'home', cast: [{who: 'kid', x: 540, size: 1040, emotion: 'scared', pose: 'belly'}],
      props: [tag('7 years?!', 'C1', {x: 800, y: 420, size: 300, rot: 5, word: 'seven', to: undefined})],
      lines: [{id: 'C1', who: 'kid', text: 'Mom says gum stays in my tummy for seven years!', emotion: 'scared', pose: 'belly', key: 'seven'}]},
    {id: 'D', set: 'clinic', cast: [{who: 'doctor', x: 285, size: 940}, {who: 'kid', x: 805, size: 980, emotion: 'scared', pose: 'belly'}],
      props: [
        {kind: 'gum', x: 610, y: 330, size: 210, from: 'D1', word: 'gum', to: 'D1', halo: true},
        tag('all the way through', 'D2', {x: 550, y: 1180, size: 290, rot: 0, word: 'travel'}),
        tag('the twist', 'D3', {x: 610, y: 300, size: 300}),
        tag('3 children, a blockage', 'D3', {x: 550, y: 1180, size: 300, rot: 0, word: 'three'}),
        tag('spit it out?', 'D4', {x: 610, y: 320, size: 300, rot: 5}),
        {kind: 'gum', size: 300, from: 'D5', word: 'chewing', to: 'D5', bubble: true, of: 'doctor'},
        {kind: 'clock', x: 455, y: 1190, size: 190, from: 'D6', word: 'week', halo: true},
        tag('often within a week', 'D6', {x: 610, y: 300, size: 300, word: 'out', to: undefined}),
      ],
      lines: [
        {id: 'D1', who: 'kid', text: 'Doctor, is the gum stuck inside me?', emotion: 'scared', pose: 'belly', key: 'stuck'},
        {id: 'D2', who: 'doctor', text: 'No. A swallowed thing that reaches your stomach will most likely travel all the way through.', emotion: 'happy', pose: 'explain', key: 'through', react: {kid: 'shocked'}, src: ['medline-swallowed']},
        {id: 'D3', who: 'doctor', text: "But here's the twist: gum can still cause trouble. Doctors reported three children with a blockage from swallowed gum.", emotion: 'neutral', pose: 'present', key: 'twist', src: ['milov-1998']},
        {id: 'D4', who: 'kid', text: 'So I should spit it out?', emotion: 'shocked', pose: 'think', key: 'spit'},
        {id: 'D5', who: 'doctor', text: "Yes. Gum is for chewing. When you're done, spit it out.", emotion: 'neutral', pose: 'point', key: 'chewing', src: ['milov-1998']},
        {id: 'D6', who: 'doctor', text: 'So yes, gum does come out, often within a week.', emotion: 'happy', pose: 'thumb', key: 'week', react: {kid: 'happy'}, src: ['medline-swallowed']},
      ]},
    {id: 'E', set: 'tummy', label: 'LATER', cast: stageCast('stomach', 'foodpipe', 'happy', 'rest', 'happy', 'rest'),
      state: {gum: 1, food: 0.3, full: 0.3},
      events: [
        {at: 'E1', word: 'sweep', set: {pass: 1}, over: 80, sfx: 'swish'},
        {at: 'E2', word: 'seven', set: {full: 0.22}, over: 20},
      ],
      props: [
        tag('between meals', 'E1', {rot: -4}),
        tag('bye, gum!', 'E2', {rot: 4, to: undefined}),
      ],
      lines: [
        {id: 'E1', who: 'stomach', text: "Between meals, I sweep out what's left. Bye, gum!", emotion: 'happy', pose: 'wave', key: 'sweep', react: {foodpipe: 'happy'}, src: ['goyal-2019']},
        {id: 'E2', who: 'foodpipe', text: 'Swallow gum? Not seven years inside you!', emotion: 'happy', pose: 'cheer', key: 'seven', src: ['medline-swallowed']},
      ]},
  ],
};

// ------------------------------------------------------------------ 2. skip brushing at night
const night = {
  slug: 'skip-brushing-at-night', title: 'What Happens If You Skip Brushing at Night', format: 2, music: 'panic', camera: 'steady', episode: 6,
  hooks: [
    {line: 'Skip brushing at night, your teeth pay.', why: 'says the cost in six words; the first picture is the tooth at night, germs all over it'},
    {line: 'You skip brushing at night. Germs feast.', why: 'names the villain; a little funnier'},
    {line: 'Skip brushing at night? Your spit is asleep.', why: 'gives the surprising reason at once (less left for the twist)'},
  ],
  rooms: {
    clinic: {palette: 'blush', wall: 'stripes', floor: 'checker', window: {style: 'round', side: 'right', view: 'garden'}, layout: 'cabinet', chart: 'tooth', time: 'day'},
    home: {kind: 'bathroom', palette: 'slate', wall: 'tiles', floor: 'wood', window: {style: 'tall', side: 'left', view: 'hills'}, layout: 'sink-right', time: 'day'},
  },
  package: {
    title: 'What Happens If You Skip Brushing at Night', phrase: 'what happens if you skip brushing at night',
    opener: 'What happens if you skip brushing at night? Mouth germs turn leftover food into acid, and while you sleep your spit, which fights that acid by day, almost stops flowing. This cartoon shows the night from the tooth\'s side, and Dr. Mira shares the NHS advice: brush last thing before bed for two minutes with fluoride toothpaste, then spit and do not rinse.',
    question: 'Be honest: how often do you fall asleep without brushing?',
    tags: ['what happens if you skip brushing at night', 'skip brushing teeth at night', 'not brushing teeth before bed', 'brushing teeth at night', 'why brush before bed', 'tooth decay', 'cavities', 'saliva', 'teeth', 'health cartoon'],
    hashtags: '#teeth #brushing #shorts',
    cover: {at: 1.2, text: 'Skip brushing tonight?', accent: 'tonight'},
  },
  retention: {
    noIntro: {scene: 'A1', line: 'Skip brushing at night, your teeth pay.'},
    promise: {scene: 'A2', line: 'Why is night worse than day? Watch.'},
    question: {scene: 'A2', line: 'Why is night worse than day? Watch.'},
    answer: {scene: 'D6', line: "Night is worse because your spit sleeps. Brush last thing, two minutes, then spit, don't rinse."},
    change3s,
    twist: {scene: 'D3', line: "But here's the twist: by day, your spit fights the acid. In sleep, it almost stops."},
    bestLast: {scene: 'D6', line: "Night is worse because your spit sleeps. Brush last thing, two minutes, then spit, don't rinse."},
    loop: {scene: 'E2', line: 'Skip brushing at night? Not these teeth!'},
  },
  sources: [S.nhsTeeth, S.dawes, S.nidcr, S.nidcrDecay],
  shots: [
    {id: 'A', set: 'tooth', label: 'TOOTH', cast: stageCast('tooth', 'bacteria', 'scared', 'rest', 'smug', 'hips'),
      state: {night: 1, feast: 1, acid: 1, hole: 0.1},
      events: [
        {at: 'A3', set: {night: 0, feast: 0, acid: 0, hole: 0, sugar: 0.8, saliva: 1}, over: 8, fx: 'flash'},
        {at: 'A4', word: 'bodyguard', set: {night: 1}, over: 40},
        {at: 'A5', set: {saliva: 0}, over: 46, sfx: 'drip'},
        {at: 'A5', word: 'sleeps', set: {feast: 0.5}, over: 24},
        {at: 'A6', set: {feast: 1}, over: 24},
        {at: 'A6', word: 'acid', set: {acid: 1}, over: 30, sfx: 'sizzle-acid'},
        {at: 'A6', word: 'want', set: {hole: 0.1}, over: 20},
      ],
      props: [
        {kind: 'toothbrush', x: 230, y: 440, size: 230, from: 'A1', word: 'brushing', to: 'A1', halo: true, no: true},
        tag('why night?', 'A2', {x: 300, y: 330, size: 340, rot: 3}),
        tag('bedtime', 'A3', {x: 300, y: 330, size: 320, rot: -4}),
        {kind: 'pillow', x: 230, y: 470, size: 220, from: 'A3', word: 'tired', to: 'A3', halo: true},
        tag('spit = bodyguard', 'A4', {x: 300, y: 330, size: 320, rot: -3, word: 'bodyguard'}),
        {kind: 'drop', x: 230, y: 440, size: 230, from: 'A5', word: 'spit', to: 'A5', halo: true, no: true},
        tag('all night', 'A6', {x: 300, y: 330, size: 320, rot: 4, to: undefined}),
      ],
      lines: [
        {id: 'A1', who: 'tooth', text: 'Skip brushing at night, your teeth pay.', emotion: 'scared', pose: 'panic', key: 'night', react: {bacteria: 'smug'}, src: ['nidcr', 'dawes-2008']},
        {id: 'A2', who: 'bacteria', text: 'Why is night worse than day? Watch.', emotion: 'smug', pose: 'hips', key: 'worse'},
        {id: 'A3', who: 'tooth', text: 'Rewind! Bedtime. He was too tired to brush.', emotion: 'neutral', pose: 'explain', key: 'tired', react: {bacteria: 'happy'}},
        {id: 'A4', who: 'bacteria', text: 'Dinner is still on you. And your bodyguard is leaving!', emotion: 'happy', pose: 'point', key: 'bodyguard', react: {tooth: 'scared'}, src: ['nidcr', 'dawes-2008']},
        {id: 'A5', who: 'tooth', text: 'My spit! It almost stops while he sleeps!', emotion: 'shocked', pose: 'panic', key: 'spit', src: ['dawes-2008']},
        {id: 'A6', who: 'bacteria', text: 'All night, no spit, all the acid we want!', emotion: 'smug', pose: 'cheer', key: 'acid', react: {tooth: 'sad'}, src: ['nidcr', 'dawes-2008']},
      ]},
    {id: 'T1', set: 'tooth', card: 'Many nights later...', seconds: 1.4, cast: [], lines: []},
    {id: 'C', set: 'home', cast: [{who: 'patient', x: 540, size: 1040, emotion: 'sad', pose: 'facepalm'}],
      props: [tag('ouch!', 'C1', {x: 820, y: 430, size: 300, rot: 5, word: 'ache', to: undefined})],
      lines: [{id: 'C1', who: 'patient', text: 'Ow! Why does this tooth ache?', emotion: 'sad', pose: 'facepalm', key: 'ache', src: ['nidcr-decay']}]},
    {id: 'D', set: 'clinic', cast: [{who: 'doctor', x: 285, size: 940}, {who: 'patient', x: 805, size: 900, emotion: 'sad', pose: 'think'}],
      props: [
        {kind: 'toothbrush', x: 610, y: 330, size: 210, from: 'D1', word: 'morning', to: 'D1', halo: true},
        tag('food + germs = acid', 'D2', {x: 550, y: 1180, size: 300, rot: 0, word: 'acid'}),
        tag('the twist', 'D3', {x: 610, y: 300, size: 300}),
        {kind: 'drop', x: 550, y: 1170, size: 230, from: 'D3', word: 'spit', to: 'D3', halo: true},
        tag('worst time?!', 'D4', {x: 610, y: 320, size: 300, rot: 5}),
        {kind: 'pillow', size: 300, from: 'D5', word: 'bed', to: 'D5', bubble: true, of: 'doctor'},
        tag('just before bed', 'D5', {x: 550, y: 1180, size: 290, rot: 0, word: 'before'}),
        {kind: 'toothbrush', x: 455, y: 1190, size: 190, from: 'D6', word: 'Brush', halo: true},
        {kind: 'clock', x: 648, y: 1190, size: 190, from: 'D6', word: 'two', halo: true},
        tag("spit, don't rinse", 'D6', {x: 610, y: 300, size: 300, word: 'spit,', to: undefined}),
      ],
      lines: [
        {id: 'D1', who: 'patient', text: 'Doctor, I brush every morning. Why the ache?', emotion: 'sad', pose: 'shrug', key: 'morning'},
        {id: 'D2', who: 'doctor', text: 'Mouth germs turn leftover food into acid. That acid attacks your enamel.', emotion: 'neutral', pose: 'explain', key: 'acid', react: {patient: 'shocked'}, src: ['nidcr']},
        {id: 'D3', who: 'doctor', text: "But here's the twist: by day, your spit fights the acid. In sleep, it almost stops.", emotion: 'happy', pose: 'present', key: 'twist', src: ['nidcr', 'dawes-2008']},
        {id: 'D4', who: 'patient', text: 'So night is the worst time to skip?', emotion: 'shocked', pose: 'think', key: 'worst'},
        {id: 'D5', who: 'doctor', text: 'Yes. The most important brushing is the one just before bed.', emotion: 'neutral', pose: 'point', key: 'bed', src: ['dawes-2008', 'nhs-teeth']},
        {id: 'D6', who: 'doctor', text: "Night is worse because your spit sleeps. Brush last thing, two minutes, then spit, don't rinse.", emotion: 'happy', pose: 'thumb', key: 'last', react: {patient: 'happy'}, src: ['nhs-teeth', 'dawes-2008']},
      ]},
    {id: 'E', set: 'tooth', label: 'NEXT NIGHT', cast: stageCast('tooth', 'bacteria', 'happy', 'rest', 'smug', 'hips'),
      state: {night: 1, feast: 0.5, saliva: 0.15},
      events: [
        {at: 'E1', word: 'brush?', set: {brush: 1}, over: 52, sfx: 'swish'},
        {at: 'E2', set: {shield: 1}, over: 18},
      ],
      props: [tag('before bed', 'E1', {x: 300, y: 330, size: 320, rot: -4}), tag('clean all night', 'E2', {x: 300, y: 330, size: 320, rot: -5, word: 'teeth', to: undefined})],
      lines: [
        {id: 'E1', who: 'bacteria', text: 'A brush? At bedtime? Not fair!', emotion: 'scared', pose: 'panic', key: 'brush'},
        {id: 'E2', who: 'tooth', text: 'Skip brushing at night? Not these teeth!', emotion: 'happy', pose: 'cheer', key: 'teeth'},
      ]},
  ],
};

// ------------------------------------------------------------------ 3. stomach growls
const growl = {
  slug: 'stomach-growls', title: "Why Your Stomach Growls When You're Hungry", format: 2, music: 'panic', camera: 'steady', episode: 7,
  hooks: [
    {line: 'Hungry? Your stomach is doing the housework.', why: 'turns an embarrassing moment into a surprise; the first picture is the empty stomach squeezing'},
    {line: 'Your hungry stomach growls like water pipes.', why: 'a picture everyone knows (the sound in the pipes); less of a twist'},
    {line: "Your stomach growls when hungry. Here's why.", why: 'the plain search question; safe, less curious'},
  ],
  rooms: {
    clinic: {palette: 'forest', wall: 'dots', floor: 'wood', window: {style: 'tall', side: 'left', view: 'city'}, layout: 'desk', chart: 'stomach', time: 'day'},
    home: {kind: 'living', palette: 'terracotta', wall: 'wainscot', floor: 'carpet', window: {style: 'arch', side: 'left', view: 'hills'}, layout: 'sofa-right', time: 'evening'},
  },
  package: {
    title: "Why Your Stomach Growls When You're Hungry", phrase: 'why your stomach growls',
    opener: "Why your stomach growls when you're hungry: between meals, strong squeezing waves pass through the empty stomach and gut and sweep leftover bits along, a job researchers call housekeeping. The gut is hollow, so the sound echoes like water pipes. This cartoon shows it from inside, and Dr. Mira explains why most tummy sounds are normal.",
    question: 'Where was the most embarrassing place your stomach ever growled?',
    tags: ['why does my stomach growl', 'stomach growling', 'why your stomach growls when hungry', 'stomach rumbling', 'stomach noises', 'hunger', 'digestion', 'stomach', 'gut health', 'health cartoon'],
    hashtags: '#stomach #hungry #shorts',
    cover: {at: 1.2, text: 'Why it growls', accent: 'growls'},
  },
  retention: {
    noIntro: {scene: 'A1', line: 'Hungry? Your stomach is doing the housework.'},
    promise: {scene: 'A2', line: 'Housework? So what makes that growling noise?'},
    question: {scene: 'A2', line: 'Housework? So what makes that growling noise?'},
    answer: {scene: 'D6', line: 'So the growling noise is your hollow gut at work. Most tummy sounds are normal.'},
    change3s,
    twist: {scene: 'D3', line: "But here's the twist: an empty stomach isn't resting. It squeezes hard to sweep itself out."},
    bestLast: {scene: 'D6', line: 'So the growling noise is your hollow gut at work. Most tummy sounds are normal.'},
    loop: {scene: 'E2', line: 'Hungry? Your stomach is just doing the housework!'},
  },
  sources: [S.medlineSounds, S.sanger, S.goyal],
  shots: [
    {id: 'A', set: 'tummy', label: 'STOMACH', cast: stageCast('stomach', 'foodpipe', 'happy', 'rest', 'shocked', 'think'),
      state: {squeeze: 1, food: 0.3, full: 0.12},
      events: [
        {at: 'A3', set: {squeeze: 0}, over: 8, fx: 'flash'},
        {at: 'A4', word: 'squeezes?', set: {squeeze: 1}, over: 24, sfx: 'gurgle-stomach'},
        {at: 'A6', word: 'sweep', set: {pass: 1}, over: 80},
      ],
      props: [
        tag('GRRRRR', 'A1', {word: 'stomach', rot: -5, size: 340}),
        tag('that noise?', 'A2', {rot: 3}),
        tag('hours after lunch', 'A3', {size: 290, rot: -3}),
        {kind: 'clock', x: 190, y: 540, size: 230, from: 'A3', word: 'hours', to: 'A3', halo: true},
        tag('empty!', 'A4', {rot: 4}),
        tag('big squeezes', 'A5', {word: 'squeezes', rot: -4}),
        tag('crumbs out', 'A6', {word: 'crumbs', rot: 4, to: undefined}),
        {kind: 'burger', x: 190, y: 540, size: 230, from: 'A6', word: 'meal', halo: true},
      ],
      lines: [
        {id: 'A1', who: 'stomach', text: 'Hungry? Your stomach is doing the housework.', emotion: 'happy', pose: 'explain', key: 'housework', react: {foodpipe: 'shocked'}, src: ['sanger-2011']},
        {id: 'A2', who: 'foodpipe', text: 'Housework? So what makes that growling noise?', emotion: 'shocked', pose: 'think', key: 'noise'},
        {id: 'A3', who: 'stomach', text: "Rewind! Lunch was hours ago. I'm nearly empty.", emotion: 'neutral', pose: 'explain', key: 'empty'},
        {id: 'A4', who: 'foodpipe', text: 'Empty? Then why the big squeezes?', emotion: 'scared', pose: 'panic', key: 'squeezes'},
        {id: 'A5', who: 'stomach', text: "It's hunger time. Strong squeezes roll right through me!", emotion: 'happy', pose: 'cheer', key: 'squeezes', src: ['sanger-2011']},
        {id: 'A6', who: 'foodpipe', text: 'And they sweep the last crumbs out, before the next meal!', emotion: 'happy', pose: 'point', key: 'crumbs', react: {stomach: 'happy'}, src: ['goyal-2019', 'sanger-2011']},
      ]},
    {id: 'T1', set: 'tummy', card: 'Meanwhile, in a quiet room...', seconds: 1.4, cast: [], lines: []},
    {id: 'C', set: 'home', cast: [{who: 'patient', x: 540, size: 1040, emotion: 'shocked', pose: 'belly'}],
      events: [{at: 'start', sfx: 'gurgle-stomach'}],
      props: [tag('GRRRRR', 'C1', {x: 800, y: 430, size: 320, rot: 5, to: undefined})],
      lines: [{id: 'C1', who: 'patient', text: 'Shh! Not now, stomach!', emotion: 'shocked', pose: 'belly', key: 'stomach'}]},
    {id: 'D', set: 'clinic', cast: [{who: 'doctor', x: 285, size: 940}, {who: 'patient', x: 805, size: 900, emotion: 'sad', pose: 'belly'}],
      props: [
        tag('so loud!', 'D1', {x: 610, y: 320, size: 300, rot: 5, word: 'loud?'}),
        tag('hollow = echo', 'D2', {x: 550, y: 1180, size: 290, rot: 0, word: 'hollow.'}),
        {kind: 'valve', size: 300, from: 'D2', word: 'squeezes,', to: 'D2', bubble: true, of: 'doctor'},
        tag('the twist', 'D3', {x: 610, y: 300, size: 300}),
        tag('cleaning time', 'D3', {x: 550, y: 1180, size: 290, rot: 0, word: 'cleaning.'}),
        tag('housework?!', 'D4', {x: 610, y: 320, size: 300, rot: 5}),
        {kind: 'burger', x: 550, y: 1170, size: 220, from: 'D5', word: 'hungry.', to: 'D5', halo: true},
        tag('normal', 'D6', {x: 610, y: 300, size: 320, word: 'normal.', to: undefined}),
        tag('your gut at work', 'D6', {x: 550, y: 1180, size: 290, rot: 0, word: 'gut', to: undefined}),
      ],
      lines: [
        {id: 'D1', who: 'patient', text: 'Doctor, why does my stomach growl so loud?', emotion: 'sad', pose: 'shrug', key: 'loud'},
        {id: 'D2', who: 'doctor', text: 'Your gut is hollow. When it squeezes, the sound echoes like water pipes.', emotion: 'neutral', pose: 'explain', key: 'pipes', react: {patient: 'shocked'}, src: ['medline-sounds']},
        {id: 'D3', who: 'doctor', text: "But here's the twist: an empty stomach isn't resting. It squeezes hard to sweep itself out.", emotion: 'happy', pose: 'present', key: 'twist', src: ['sanger-2011', 'goyal-2019']},
        {id: 'D4', who: 'patient', text: 'My stomach does housework?', emotion: 'shocked', pose: 'think', key: 'housework'},
        {id: 'D5', who: 'doctor', text: 'Yes. And those same squeezes may help you feel hungry.', emotion: 'neutral', pose: 'point', key: 'hungry', src: ['sanger-2011']},
        {id: 'D6', who: 'doctor', text: 'So the growling noise is your hollow gut at work. Most tummy sounds are normal.', emotion: 'happy', pose: 'thumb', key: 'normal', react: {patient: 'happy'}, src: ['medline-sounds']},
      ]},
    {id: 'E', set: 'tummy', label: 'LUNCH TIME', cast: stageCast('stomach', 'foodpipe', 'happy', 'rest', 'happy', 'rest'),
      state: {squeeze: 0.7, food: 0, full: 0.08},
      events: [
        {at: 'start', set: {food: 0.8, full: 0.5, squeeze: 0}, over: 70, sfx: 'plop'},
        {at: 'E2', word: 'housework!', set: {full: 0.56}, over: 20},
      ],
      props: [tag('lunch!', 'E1', {rot: -4}), {kind: 'burger', x: 190, y: 540, size: 230, from: 'E1', word: 'Lunch!', to: 'E1', halo: true}, tag('all clean', 'E2', {rot: 4, to: undefined})],
      lines: [
        {id: 'E1', who: 'stomach', text: 'Lunch! The housework is done. Thank you!', emotion: 'happy', pose: 'cheer', key: 'done', react: {foodpipe: 'happy'}},
        {id: 'E2', who: 'foodpipe', text: 'Hungry? Your stomach is just doing the housework!', emotion: 'happy', pose: 'thumb', key: 'housework', src: ['sanger-2011']},
      ]},
  ],
};

// ------------------------------------------------------------------ 4. burp
const R = {x: 800, y: 330}; // the free corner at the top right of the stomach stage (burp bubbles rise on the left)
const burp = {
  slug: 'when-you-burp', title: 'What Happens When You Burp', format: 2, music: 'panic', camera: 'steady', episode: 8,
  hooks: [
    {line: 'When you burp, a tiny door opens.', why: 'makes you want to see the door; the first picture is the stomach stretched with air'},
    {line: "When you burp, it's air you swallowed.", why: 'the surprising fact at once (it gives the twist away early)'},
    {line: 'When you burp, your stomach lets go.', why: 'short and physical; a little vague'},
  ],
  rooms: {
    clinic: {palette: 'stone', wall: 'tiles', floor: 'carpet', window: {style: 'wide', side: 'left', view: 'hills'}, layout: 'exam-bed', chart: 'stomach', time: 'day'},
    home: {kind: 'kitchen', palette: 'rose', wall: 'stripes', floor: 'wood', window: {style: 'round', side: 'right', view: 'garden'}, layout: 'stove-left', time: 'day'},
  },
  package: {
    title: 'What Happens When You Burp', phrase: 'what happens when you burp',
    opener: 'What happens when you burp? Every time you swallow, a little air goes down too. It gathers at the top of the stomach and stretches it, a ring of muscle at the end of the food pipe relaxes, and the air comes back up. This cartoon shows it from inside, and Dr. Mira shares what the US National Institutes of Health say: burping is normal, up to 30 times a day, and eating slowly means less air.',
    question: 'What makes you burp the most: fizzy drinks, eating fast, or gum?',
    tags: ['what happens when you burp', 'why do we burp', 'burping', 'belching', 'why do I burp so much', 'swallowed air', 'fizzy drinks', 'stomach', 'digestion', 'health cartoon'],
    hashtags: '#burp #stomach #shorts',
    cover: {at: 1.2, text: 'Why you burp', accent: 'burp'},
  },
  retention: {
    noIntro: {scene: 'A1', line: 'When you burp, a tiny door opens.'},
    promise: {scene: 'A2', line: 'Guess how many times a day you burp?'},
    question: {scene: 'A2', line: 'Guess how many times a day you burp?'},
    answer: {scene: 'D6', line: "And it's normal. People burp up to thirty times a day."},
    change3s,
    twist: {scene: 'D3', line: "But here's the twist: a burp isn't your food talking. It's that air coming back up."},
    bestLast: {scene: 'D6', line: "And it's normal. People burp up to thirty times a day."},
    loop: {scene: 'E2', line: 'When you burp, my tiny door opens. Thirty times a day!'},
  },
  sources: [S.medlineBelching, S.niddkGas],
  shots: [
    {id: 'A', set: 'tummy', label: 'STOMACH', cast: stageCast('stomach', 'foodpipe', 'sick', 'belly', 'shocked', 'think'),
      state: {food: 0.46, full: 0.6, air: 1},
      events: [
        {at: 'A3', set: {food: 0, full: 0.25, air: 0}, over: 8, fx: 'flash'},
        {at: 'A3', word: 'fizzy', set: {full: 0.6, food: 0.46}, over: 30, sfx: 'splash-small'},
        {at: 'A4', word: 'air', set: {air: 1}, over: 30},
        {at: 'A5', word: 'stretching!', set: {full: 0.66}, over: 20},
        {at: 'A6', word: 'open', set: {valve: 1}, over: 10},
        {at: 'A6', word: 'open', delay: 0.3, set: {burp: 1, air: 0.15}, over: 40, sfx: 'burp-small'},
      ],
      props: [
        tag('BURP!', 'A1', {...R, word: 'burp,', rot: 5, size: 340}),
        tag('how many a day?', 'A2', {...R, size: 300, rot: -3}),
        tag('a minute earlier', 'A3', {...R, size: 290, rot: 3}),
        {kind: 'soda', x: 190, y: 540, size: 230, from: 'A3', word: 'fizzy', to: 'A4', halo: true},
        tag('swallowed air', 'A4', {...R, size: 300, rot: -4, word: 'air'}),
        tag('stretching!', 'A5', {...R, rot: 4, word: 'top.'}),
        tag('the door opens', 'A6', {...R, size: 300, rot: -4, word: 'open', to: undefined}),
      ],
      lines: [
        {id: 'A1', who: 'stomach', text: 'When you burp, a tiny door opens.', emotion: 'sick', pose: 'belly', key: 'door', react: {foodpipe: 'shocked'}, src: ['medline-belching']},
        {id: 'A2', who: 'foodpipe', text: 'Guess how many times a day you burp?', emotion: 'smug', pose: 'think', key: 'times'},
        {id: 'A3', who: 'stomach', text: "Rewind! He's gulping a fizzy drink.", emotion: 'neutral', pose: 'explain', key: 'fizzy', src: ['niddk-gas']},
        {id: 'A4', who: 'foodpipe', text: 'And with every gulp, air comes down too!', emotion: 'scared', pose: 'panic', key: 'air', src: ['medline-belching']},
        {id: 'A5', who: 'stomach', text: "It's piling up at my top. I'm stretching!", emotion: 'scared', pose: 'panic', key: 'stretching', react: {foodpipe: 'scared'}, src: ['medline-belching']},
        {id: 'A6', who: 'foodpipe', text: 'That stretch tells my muscle ring: open up!', emotion: 'shocked', pose: 'point', key: 'open', react: {stomach: 'happy'}, src: ['medline-belching']},
      ]},
    {id: 'T1', set: 'tummy', card: 'One fizzy drink later...', seconds: 1.4, cast: [], lines: []},
    {id: 'C', set: 'home', cast: [{who: 'kid', x: 540, size: 1040, emotion: 'happy', pose: 'belly'}],
      events: [{at: 'start', sfx: 'burp-small'}],
      props: [{kind: 'soda', x: 820, y: 430, size: 230, from: 'C1', to: undefined, halo: true}],
      lines: [{id: 'C1', who: 'kid', text: 'Burp! Oops. Excuse me!', emotion: 'happy', pose: 'belly', key: 'excuse'}]},
    {id: 'D', set: 'clinic', cast: [{who: 'doctor', x: 285, size: 940}, {who: 'kid', x: 805, size: 980, emotion: 'sad', pose: 'belly'}],
      props: [
        {kind: 'soda', x: 610, y: 330, size: 210, from: 'D1', word: 'burp', to: 'D1', halo: true},
        tag('every swallow = air', 'D2', {x: 550, y: 1180, size: 300, rot: 0, word: 'air'}),
        tag('the twist', 'D3', {x: 610, y: 300, size: 300}),
        tag('air, not food', 'D3', {x: 550, y: 1180, size: 290, rot: 0, word: 'air'}),
        tag('just air?!', 'D4', {x: 610, y: 320, size: 300, rot: 5}),
        {kind: 'soda', size: 300, from: 'D5', word: 'fizzy', to: 'D5', bubble: true, of: 'doctor', no: true},
        tag('eat slowly', 'D5', {x: 550, y: 1180, size: 290, rot: 0, word: 'slowly,'}),
        tag('up to 30 a day', 'D6', {x: 610, y: 300, size: 320, word: 'thirty', to: undefined}),
        tag('normal', 'D6', {x: 550, y: 1180, size: 290, rot: 0, word: 'normal.', to: undefined}),
      ],
      lines: [
        {id: 'D1', who: 'kid', text: 'Doctor, why do I burp so much?', emotion: 'sad', pose: 'shrug', key: 'burp'},
        {id: 'D2', who: 'doctor', text: 'Every time you swallow, you swallow a little air too.', emotion: 'neutral', pose: 'explain', key: 'air', react: {kid: 'shocked'}, src: ['medline-belching']},
        {id: 'D3', who: 'doctor', text: "But here's the twist: a burp isn't your food talking. It's that air coming back up.", emotion: 'happy', pose: 'present', key: 'twist', src: ['medline-belching']},
        {id: 'D4', who: 'kid', text: 'Just air? Not my lunch?', emotion: 'shocked', pose: 'think', key: 'air'},
        {id: 'D5', who: 'doctor', text: 'Just air. Want fewer burps? Eat slowly, and go easy on fizzy drinks and gum.', emotion: 'neutral', pose: 'point', key: 'slowly', src: ['medline-belching', 'niddk-gas']},
        {id: 'D6', who: 'doctor', text: "And it's normal. People burp up to thirty times a day.", emotion: 'happy', pose: 'thumb', key: 'thirty', react: {kid: 'happy'}, src: ['niddk-gas']},
      ]},
    {id: 'E', set: 'tummy', label: 'NEXT TIME', cast: stageCast('stomach', 'foodpipe', 'happy', 'rest', 'happy', 'rest'),
      state: {food: 0.3, full: 0.3},
      events: [
        {at: 'start', set: {full: 0.5, food: 0.46, air: 0.3}, over: 90},
        {at: 'E2', word: 'door', set: {valve: 1}, over: 10},
        {at: 'E2', word: 'door', delay: 0.3, set: {burp: 1, air: 0}, over: 40, sfx: 'burp-small'},
      ],
      props: [tag('small sips', 'E1', {...R, rot: -4}), tag('30 times a day', 'E2', {...R, size: 300, rot: 4, word: 'Thirty', to: undefined})],
      lines: [
        {id: 'E1', who: 'stomach', text: 'Small sips, slowly. Hardly any air!', emotion: 'happy', pose: 'thumb', key: 'air', react: {foodpipe: 'happy'}, src: ['niddk-gas']},
        {id: 'E2', who: 'foodpipe', text: 'When you burp, my tiny door opens. Thirty times a day!', emotion: 'happy', pose: 'cheer', key: 'door', src: ['niddk-gas']},
      ]},
  ],
};


// ------------------------------------------------------------------ graphics, placed by slot (something new at least every 3 s)
// clinic: T = above the heads, M = between the bodies, B = below it. Stage: TL = tag, OL = object.
const T = (text, from, o = {}) => tag(text, from, {x: 610, y: 300, size: 300, ...o});
const M = (text, from, word, o = {}) => tag(text, from, {x: 550, y: 1180, size: 290, rot: 0, word, ...o});
const B = (text, from, word, o = {}) => tag(text, from, {x: 550, y: 1340, size: 280, rot: 0, word, ...o});
const obj = (kind, from, o = {}) => ({kind, x: 190, y: 540, size: 230, from, to: from, halo: true, ...o});
const shot = (t, id) => t.shots.find((x) => x.id === id);

// ---- gum
shot(gum, 'A').props = [
  obj('gum', 'A1', {word: 'gum.', to: 'A2'}),
  tag('7 years?', 'A1', {word: 'Seven'}),
  tag('does it come out?', 'A2', {size: 300, rot: 3}),
  tag('a minute earlier', 'A3', {size: 290, rot: -3}),
  obj('clock', 'A3', {word: 'minute'}),
  tag('gulp!', 'A4', {word: 'comes!', rot: 4}),
  tag('mixing...', 'A5', {word: 'mix', rot: -3}),
  obj('burger', 'A5', {word: 'food.'}),
  obj('clock', 'A6', {to: undefined}),
  tag('still here', 'A6', {word: 'here.', rot: 4, to: undefined}),
];
shot(gum, 'A').events = [
  {at: 'A3', set: {gum: 0}, over: 8, fx: 'flash'},
  {at: 'A4', set: {gum: 1}, over: 40},
  {at: 'A4', delay: 1.25, sfx: 'plop'},
  {at: 'A5', word: 'juices,', set: {full: 0.44}, over: 24},
  {at: 'A6', set: {full: 0.36}, over: 30},
];
shot(gum, 'C').props = [
  {kind: 'gum', x: 820, y: 430, size: 220, from: 'C1', word: 'gum', halo: true},
  tag('7 years?!', 'C1', {x: 270, y: 430, size: 300, rot: -5, word: 'seven', to: undefined}),
];
shot(gum, 'D').props = [
  T('stuck?', 'D1', {rot: 5}),
  {kind: 'gum', x: 550, y: 1170, size: 210, from: 'D1', word: 'gum', to: 'D1', halo: true},
  T('not stuck', 'D2'),
  M('into the stomach', 'D2', 'reaches'),
  B('all the way through', 'D2', 'travel'),
  T('the twist', 'D3'),
  {kind: 'pain', x: 805, y: 1250, size: 150, from: 'D3', word: 'trouble.', to: 'D3', on: 'kid'},
  M('3 children', 'D3', 'three'),
  B('a blockage', 'D3', 'blockage'),
  T('spit it out?', 'D4', {rot: 5}),
  {kind: 'gum', size: 300, from: 'D5', to: 'D5', bubble: true, of: 'doctor'},
  M('spit it out', 'D5', 'spit'),
  {kind: 'clock', x: 455, y: 1190, size: 190, from: 'D6', halo: true},
  T('it comes out', 'D6', {word: 'out,', to: undefined}),
  B('often within a week', 'D6', 'week.', {to: undefined}),
];
shot(gum, 'E').props = [tag('between meals', 'E1'), tag('bye, gum!', 'E2', {rot: 4, to: undefined})];

// ---- night: the tooth stage has the germ at the top right, so tags sit top left and objects below them
const TG = (text, from, o = {}) => tag(text, from, {x: 310, y: 250, size: 320, ...o});
const OB = (kind, from, o = {}) => ({kind, x: 230, y: 470, size: 220, from, to: from, halo: true, ...o});
shot(night, 'A').props = [
  OB('toothbrush', 'A1', {word: 'brushing', no: true}),
  TG('why night?', 'A2', {rot: 3}),
  TG('bedtime', 'A3'),
  OB('pillow', 'A3', {word: 'tired'}),
  OB('burger', 'A4'),
  TG('spit = bodyguard', 'A4', {word: 'bodyguard', rot: -3}),
  OB('drop', 'A5', {word: 'spit!', no: true}),
  TG('all night', 'A6', {rot: 4, to: undefined}),
];
shot(night, 'A').events = [
  {at: 'A3', set: {night: 0, feast: 0, acid: 0, hole: 0, sugar: 0.8, saliva: 1}, over: 8, fx: 'flash'},
  {at: 'A4', word: 'bodyguard', set: {night: 1}, over: 40},
  {at: 'A5', set: {saliva: 0}, over: 46},
  {at: 'A5', word: 'sleeps!', set: {feast: 0.5}, over: 24},
  {at: 'A6', set: {feast: 1}, over: 24},
  {at: 'A6', word: 'acid', set: {acid: 1}, over: 30, sfx: 'sizzle-acid'},
  {at: 'A6', word: 'want!', set: {hole: 0.1}, over: 20},
];
shot(night, 'C').props = [
  {kind: 'pain', x: 612, y: 790, size: 130, from: 'C1', word: 'tooth', on: 'patient'},
  tag('ouch!', 'C1', {x: 540, y: 390, size: 300, rot: -4, word: 'ache?', to: undefined}),
];
shot(night, 'D').props = [
  T('every morning', 'D1', {rot: 5}),
  {kind: 'toothbrush', x: 550, y: 1170, size: 210, from: 'D1', word: 'brush', to: 'D1', halo: true},
  T('germs + food', 'D2'),
  M('= acid', 'D2', 'acid.'),
  {kind: 'pain', x: 868, y: 880, size: 120, from: 'D2', word: 'attacks', to: 'D2', on: 'patient'},
  T('the twist', 'D3'),
  {kind: 'drop', x: 550, y: 1170, size: 230, from: 'D3', word: 'spit', to: 'D3', halo: true},
  B('asleep: almost none', 'D3', 'sleep,'),
  T('worst time?!', 'D4', {rot: 5}),
  {kind: 'pillow', x: 550, y: 1170, size: 210, from: 'D4', word: 'night', to: 'D4', halo: true},
  {kind: 'pillow', size: 300, from: 'D5', to: 'D5', bubble: true, of: 'doctor'},
  {kind: 'toothbrush', x: 550, y: 1170, size: 210, from: 'D5', word: 'brushing', to: 'D5', halo: true},
  B('just before bed', 'D5', 'before'),
  T('why night is worse', 'D6', {to: undefined}),
  {kind: 'toothbrush', x: 455, y: 1190, size: 190, from: 'D6', word: 'Brush', halo: true},
  {kind: 'clock', x: 648, y: 1190, size: 190, from: 'D6', word: 'two', halo: true},
  B("spit, don't rinse", 'D6', 'spit,', {to: undefined}),
];
shot(night, 'E').props = [TG('before bed', 'E1'), TG('clean all night', 'E2', {rot: -5, to: undefined})];

// ---- growl
shot(growl, 'A').props = [
  tag('GRRRRR', 'A1', {word: 'stomach', rot: -5, size: 340}),
  tag('that noise?', 'A2', {rot: 3}),
  tag('hours after lunch', 'A3', {size: 290, rot: -3}),
  obj('clock', 'A3', {word: 'hours'}),
  tag('empty!', 'A4', {rot: 4}),
  tag('big squeezes', 'A5', {rot: -4}),
  obj('burger', 'A5', {word: 'hunger', no: true}),
  tag('crumbs out', 'A6', {rot: 4, to: undefined}),
  obj('burger', 'A6', {word: 'meal!', to: undefined}),
];
shot(growl, 'A').events = [
  {at: 'A3', set: {squeeze: 0}, over: 8, fx: 'flash'},
  {at: 'A4', word: 'squeezes?', set: {squeeze: 1}, over: 24},
  {at: 'A5', word: 'squeezes', sfx: 'gurgle-stomach'},
  {at: 'A6', word: 'sweep', set: {pass: 1}, over: 80},
];
shot(growl, 'C').props = [
  tag('GRRRRR', 'C1', {x: 800, y: 420, size: 320, rot: 5, to: undefined}),
  {kind: 'pain', x: 540, y: 1150, size: 150, from: 'C1', word: 'stomach!', on: 'patient'},
];
shot(growl, 'D').props = [
  T('so loud!', 'D1', {rot: 5}),
  {kind: 'pain', x: 805, y: 1150, size: 140, from: 'D1', word: 'growl', to: 'D1', on: 'patient'},
  T('hollow', 'D2'),
  M('it squeezes...', 'D2', 'squeezes,'),
  B('...and echoes', 'D2', 'echoes'),
  T('the twist', 'D3'),
  M('not resting', 'D3', 'resting.'),
  B('it sweeps itself out', 'D3', 'sweep'),
  T('housework?!', 'D4', {rot: 5}),
  {kind: 'burger', x: 550, y: 1170, size: 210, from: 'D5', to: 'D5', halo: true},
  T('same squeezes', 'D5', {word: 'squeezes'}),
  B('you feel hungry', 'D5', 'hungry.'),
  T('that noise:', 'D6', {to: undefined}),
  M('your gut at work', 'D6', 'gut', {to: undefined}),
  B('most sounds: normal', 'D6', 'tummy', {to: undefined}),
];
shot(growl, 'E').props = [
  obj('burger', 'E1'),
  tag('housework done', 'E1', {word: 'housework', rot: -4}),
  tag('all clean', 'E2', {rot: 4, to: undefined}),
];

// ---- burp: bubbles rise on the left above the pipe's face, so the tags sit top right
const TR = (text, from, o = {}) => tag(text, from, {x: 800, y: 330, size: 300, ...o});
shot(burp, 'A').props = [
  TR('BURP!', 'A1', {word: 'burp,', rot: 5, size: 340}),
  TR('how many a day?', 'A2', {rot: -3}),
  obj('clock', 'A2', {word: 'day'}),
  TR('a minute earlier', 'A3', {size: 290, rot: 3}),
  obj('soda', 'A3', {word: 'fizzy', to: 'A4'}),
  TR('swallowed air', 'A4', {rot: -4, word: 'air'}),
  TR('piling up', 'A5', {rot: 4}),
  TR('the stretch', 'A6', {rot: -4}),
];
shot(burp, 'A').events = [
  {at: 'A3', set: {food: 0, full: 0.25, air: 0}, over: 8, fx: 'flash'},
  {at: 'A3', word: 'fizzy', set: {full: 0.6, food: 0.46}, over: 30, sfx: 'splash-small'},
  {at: 'A4', word: 'air', set: {air: 1}, over: 30},
  {at: 'A5', word: 'stretching!', set: {full: 0.66}, over: 20},
  {at: 'A6', word: 'open', set: {valve: 1}, over: 10},
  {at: 'A6', word: 'open', delay: 0.3, set: {burp: 1, air: 0.15}, over: 40, sfx: 'burp-small'},
];
shot(burp, 'C').props = [{kind: 'soda', x: 820, y: 430, size: 230, from: 'C1', halo: true}, tag('excuse me!', 'C1', {x: 270, y: 430, size: 300, rot: -5, word: 'Excuse', to: undefined})];
shot(burp, 'D').props = [
  T('so many burps', 'D1', {rot: 5}),
  {kind: 'soda', x: 550, y: 1170, size: 210, from: 'D1', word: 'burp', to: 'D1', halo: true},
  T('every swallow', 'D2'),
  M('+ a little air', 'D2', 'air'),
  T('the twist', 'D3'),
  {kind: 'burger', x: 550, y: 1170, size: 210, from: 'D3', word: 'food', to: 'D3', halo: true, no: true},
  B('air, coming back up', 'D3', 'air'),
  T('just air?!', 'D4', {rot: 5}),
  {kind: 'soda', size: 300, from: 'D5', to: 'D5', bubble: true, of: 'doctor', no: true},
  M('eat slowly', 'D5', 'slowly,'),
  B('less fizz, less gum', 'D5', 'fizzy'),
  T('normal', 'D6', {to: undefined}),
  M('up to 30 times a day', 'D6', 'thirty', {to: undefined}),
];
shot(burp, 'E').props = [TR('small sips', 'E1', {rot: -4}), obj('glass', 'E1', {word: 'slowly.'}), TR('the door opens', 'E2', {rot: 4, to: undefined})];
shot(burp, 'E').events = [
  {at: 'start', set: {full: 0.5, food: 0.46, air: 0.3}, over: 90},
  {at: 'E2', word: 'door', set: {valve: 1}, over: 10},
  {at: 'E2', word: 'door', delay: 0.3, set: {burp: 1, air: 0}, over: 40, sfx: 'burp-small'},
];

const only = process.argv.slice(2);
for (const t of [gum, night, growl, burp]) {
  if (only.length && !only.includes(t.slug)) continue;
  const dir = path.join(ROOT, 'videos', t.slug);
  fs.mkdirSync(path.join(dir, 'renders'), {recursive: true});
  fs.writeFileSync(path.join(dir, 'toon.json'), JSON.stringify(t, null, 1) + '\n');
  console.log('wrote', t.slug, t.shots.flatMap((s) => s.lines).length, 'lines');
}
