// Pilot 1 of the skill upgrade: "What Happens If You Skip Brushing at Night" as a FIGHT (format 3).
import fs from 'node:fs';
const dir = '/Users/vedika/Desktop/MedPeakHealth/medpeak-studio/videos/skip-brushing-at-night';
const old = JSON.parse(fs.readFileSync(`${dir}/renders/old/toon.json`, 'utf8'));
const stage = (ea, pa, eb, pb) => [{who: 'tooth', x: 540, size: 700, stage: true, emotion: ea, pose: pa}, {who: 'bacteria', x: 540, size: 320, stage: true, emotion: eb, pose: pb}];
const tag = (text, from, o = {}) => ({kind: 'tag', text, x: 740, y: 250, size: 340, rot: -3, from, to: from, ...o}); // top right: the scene's label is top left
const toon = {
  slug: 'skip-brushing-at-night', title: old.title, format: 3, shape: 'fight', music: 'panic', camera: 'steady', episode: 6,
  hooks: old.hooks,
  rooms: {home: old.rooms.home},
  package: {...old.package, opener: "What happens if you skip brushing at night? Mouth germs turn leftover food into acid, and while you sleep your spit, which clears sugar and acid by day, almost stops flowing. This cartoon shows the night from the top of a tooth: the spit guards fall asleep and the germs throw a party. The fix is the NHS advice: brush last thing before bed for two minutes with fluoride toothpaste, then spit and do not rinse."},
  retention: {
    noIntro: {scene: 'A1', line: 'Skip brushing at night, your teeth pay.'},
    promise: {scene: 'A2', line: 'Guess why we party at night?'},
    question: {scene: 'A2', line: 'Guess why we party at night?'},
    answer: {scene: 'E2', line: 'No! We only party at night because your spit sleeps!'},
    change3s: {scene: 'all', line: 'steady camera: something happens in the picture at least every 3 s (stickers do not count)'},
    twist: {scene: 'B6', line: "Here's the twist: when he sleeps, your spit guards sleep too!"},
    bestLast: {scene: 'E3', line: "Two minutes, then spit, don't rinse. Skip brushing at night? Not these teeth!"},
    loop: {scene: 'E3', line: "Two minutes, then spit, don't rinse. Skip brushing at night? Not these teeth!"},
  },
  sources: old.sources,
  shots: [
    {id: 'A', set: 'molar', label: 'TONIGHT', cast: stage('scared', 'rest', 'happy', 'hips'),
      state: {night: 1, guards: 1, sleep: 1, sugar: 1, party: 1, acid: 0.55, chalk: 0.3},
      events: [
        {at: 'A1', word: 'teeth', set: {acid: 0.85}, over: 30},
        {at: 'A2', set: {chalk: 0.7}, over: 40},
        {at: 'A2', word: 'night?', set: {acid: 1}, over: 20},
      ],
      lines: [
        {id: 'A1', who: 'tooth', text: 'Skip brushing at night, your teeth pay.', emotion: 'scared', pose: 'panic', key: 'night', react: {bacteria: 'happy'}, src: ['nidcr', 'dawes-2008']},
        {id: 'A2', who: 'bacteria', text: 'Guess why we party at night?', emotion: 'smug', pose: 'cheer', key: 'night', chat: true, beat: 0.8},
      ]},
    {id: 'T1', set: 'molar', card: 'Earlier that evening...', seconds: 1.2, cast: [], lines: []},
    {id: 'B', set: 'molar', label: 'THAT EVENING', cast: stage('happy', 'rest', 'angry', 'fists'),
      state: {night: 0, guards: 0},
      events: [
        {at: 'B1', word: 'guards', set: {guards: 1}, over: 30},
        {at: 'B1b', set: {snack: 1}, over: 30, sfx: 'plop'},
        // the fight is three things that happen: the rush, the cloud, the germs thrown out
        {at: 'B2', set: {fight: 0.3}, over: 26},
        {at: 'B2', delay: 0.95, set: {fight: 0.72}, over: 52, sfx: 'thud-soft'},
        {at: 'B2', delay: 2.75, set: {fight: 1}, over: 34},
        {at: 'B3', word: 'washes', set: {wash: 1}, over: 46, sfx: 'splash-small'},
        {at: 'B4', set: {night: 0.5}, over: 44},
        {at: 'B5', set: {night: 1}, over: 36},
        {at: 'B5', word: 'brush!', set: {sugar: 1}, over: 36},
        {at: 'B5', delay: 2.5, set: {sleep: 0.12}, over: 24}, // the first guard yawns
        // they fall asleep in two waves
        {at: 'B6', word: 'sleeps,', set: {sleep: 0.5}, over: 44},
        {at: 'B6', word: 'too!', set: {sleep: 1}, over: 44},
        {at: 'B7', set: {party: 0.5}, over: 30},
        {at: 'B7', word: 'Leftovers', set: {party: 1}, over: 30},
        {at: 'B8', word: 'acid.', set: {acid: 1}, over: 44, sfx: 'sizzle-acid'},
        {at: 'B8', word: 'enamel!', set: {chalk: 1}, over: 40},
      ],
      lines: [
        {id: 'B1', who: 'tooth', text: 'This evening, my spit guards were on duty.', emotion: 'happy', pose: 'present', key: 'guards', react: {bacteria: 'angry'}, src: ['dawes-2008']},
        {id: 'B1b', who: 'tooth', text: 'Every snack leaves sugar on me.', emotion: 'neutral', pose: 'explain', key: 'sugar', react: {bacteria: 'happy'}, src: ['nidcr'], beat: 0.3},
        {id: 'B2', who: 'bacteria', text: 'Sugar! Boys, charge!', emotion: 'angry', pose: 'point', key: 'charge', react: {tooth: 'shocked'}, chat: true, beat: 3.0},
        {id: 'B3', who: 'tooth', text: 'Ha! My spit washes away their sugar and their acid.', emotion: 'happy', pose: 'cheer', key: 'washes', react: {bacteria: 'sad'}, src: ['dawes-2008', 'nidcr']},
        {id: 'B4', who: 'bacteria', text: "Fine. We'll wait for bedtime.", emotion: 'smug', pose: 'think', key: 'bedtime', chat: true, beat: 1.1},
        {id: 'B5', who: 'tooth', text: "Bedtime. And he didn't brush!", emotion: 'shocked', pose: 'panic', key: 'brush', react: {bacteria: 'happy'}, chat: true, beat: 1.5},
        {id: 'B6', who: 'bacteria', text: "Here's the twist: when he sleeps, your spit guards sleep too!", emotion: 'happy', pose: 'point', key: 'sleep', react: {tooth: 'scared'}, src: ['dawes-2008'], beat: 0.8},
        {id: 'B7', who: 'bacteria', text: 'Party time! Leftovers for everyone!', emotion: 'happy', pose: 'cheer', key: 'party', react: {tooth: 'scared'}, chat: true},
        {id: 'B8', who: 'tooth', text: 'They turn it into acid. All night. My enamel!', emotion: 'scared', pose: 'panic', key: 'acid', react: {bacteria: 'smug'}, src: ['nidcr', 'dawes-2008']},
      ]},
    {id: 'T2', set: 'molar', card: 'Many nights later...', seconds: 1.2, cast: [], lines: []},
    {id: 'D', set: 'home', cast: [{who: 'patient', x: 540, size: 1040, emotion: 'sad', pose: 'facepalm'}],
      props: [{kind: 'pain', x: 612, y: 790, size: 130, from: 'D1', word: 'tooth', on: 'patient'}],
      lines: [{id: 'D1', who: 'patient', text: 'Ow! Why does this tooth ache?', emotion: 'sad', pose: 'facepalm', key: 'ache', src: ['nidcr-decay']}]},
    {id: 'E', set: 'molar', label: 'THE NEXT NIGHT', cast: stage('happy', 'rest', 'smug', 'hips'),
      state: {night: 0.35, guards: 1, sugar: 1, party: 0.5},
      events: [
        {at: 'E1', word: 'brushes,', set: {brush: 0.4}, over: 30, sfx: 'swish'},
        {at: 'E2', set: {brush: 1}, over: 56},
        {at: 'E2', delay: 0.5, set: {party: 0}, over: 20}, // the mirror ball goes up, the lights go out
        {at: 'E2', word: 'because', set: {night: 0.7}, over: 30},
        {at: 'E3', set: {shield: 1}, over: 22},
        {at: 'E3', word: 'rinse.', set: {night: 1}, over: 40},
        {at: 'E3', word: 'night?', set: {sleep: 1}, over: 60},
      ],
      props: [
        tag('NHS: brush before bed', 'E1', {x: 700, size: 330, word: 'last'}),
        tag('2 minutes', 'E3', {word: 'Two', rot: 3}),
        tag("spit, don't rinse", 'E3', {y: 352, rot: -3, word: 'spit,', to: undefined}),
      ],
      lines: [
        {id: 'E1', who: 'tooth', text: 'But tonight he brushes, last thing before bed!', emotion: 'happy', pose: 'cheer', key: 'brushes', react: {bacteria: 'scared'}, src: ['nhs-teeth', 'dawes-2008']},
        {id: 'E2', who: 'bacteria', text: 'No! We only party at night because your spit sleeps!', emotion: 'scared', pose: 'panic', key: 'sleeps', src: ['dawes-2008'], beat: 0.2},
        {id: 'E3', who: 'tooth', text: "Two minutes, then spit, don't rinse. Skip brushing at night? Not these teeth!", emotion: 'happy', pose: 'cheer', key: 'teeth', src: ['nhs-teeth']},
      ]},
  ],
};
fs.writeFileSync(`${dir}/toon.json`, JSON.stringify(toon, null, 1) + '\n');
console.log('wrote pilot 1:', toon.shots.flatMap((s) => s.lines).length, 'lines');
