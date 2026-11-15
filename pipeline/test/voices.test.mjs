import test from 'node:test';
import assert from 'node:assert/strict';
import {pickVoice, voicePool} from '../lib/voices.mjs';

test('the pool has 15 voices with ids and owner ids', () => {
  const pool = voicePool();
  assert.equal(pool.voices.length, 15);
  assert.equal(new Set(pool.voices.map((v) => v.voiceId)).size, 15);
  for (const v of pool.voices) assert.ok(v.voiceId && v.publicOwnerId && v.name);
});

test('a recently used voice is never picked again', () => {
  const pool = voicePool();
  const recent = pool.voices.slice(0, 7).map((v) => v.voiceId);
  for (let i = 0; i < 8; i++) {
    const v = pickVoice({pool, recent, rand: () => i});
    assert.ok(!recent.includes(v.voiceId), `${v.name} was used recently`);
  }
});

test('when every voice was used recently, any voice is allowed', () => {
  const pool = {...voicePool(), avoidRecent: 99};
  const v = pickVoice({pool, recent: pool.voices.map((x) => x.voiceId), rand: () => 0});
  assert.ok(v.voiceId);
});
