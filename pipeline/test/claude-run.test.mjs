import test from 'node:test';
import assert from 'node:assert/strict';
import {CAP_USD, MARGIN_USD, remaining, runBudget, spent} from '../claude-run.mjs';

test('the cap is $5 per video', () => assert.equal(CAP_USD, 5));

test('spent and remaining add up the ledger', () => {
  const l = {capUsd: 5, runs: [{costUsd: 0.09}, {costUsd: 2.5}]};
  assert.equal(spent(l), 2.59);
  assert.equal(remaining(l), 2.41);
});

test('a run gets what is left minus the margin', () => {
  assert.equal(runBudget({capUsd: 5, runs: []}), 5 - MARGIN_USD);
  assert.equal(runBudget({capUsd: 5, runs: [{costUsd: 2.59}]}), 1.66);
});

test('no run starts when too little is left', () => {
  assert.equal(runBudget({capUsd: 5, runs: [{costUsd: 3.6}]}), 0);
  assert.equal(runBudget({capUsd: 5, runs: [{costUsd: 5.2}]}), 0);
});
