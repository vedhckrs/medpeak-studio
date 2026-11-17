#!/usr/bin/env node
/**
 * Research: pull real studies from PubMed (free NCBI E-utilities, no key) for a video's
 * research queries, with abstracts, so every number in the script can be checked
 * against its source. Also checks that every source URL in video.json answers.
 *
 *   node pipeline/research.mjs <slug>              # queries from video.json research.queries
 *   node pipeline/research.mjs <slug> --pmid 123,456  # fetch exact papers
 *   node pipeline/research.mjs <slug> --check-urls    # HEAD/GET every source URL
 *
 * Writes videos/<slug>/research/pubmed.json and research/abstracts.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, isMain, loadVideo, videoDir, writeJson} from './lib/util.mjs';

const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const TOOL = 'tool=medpeak-studio';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getJson = async (url) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};

export const searchPubmed = async (query, max = 5) => {
  const q = encodeURIComponent(query);
  const d = await getJson(`${EUTILS}/esearch.fcgi?db=pubmed&retmode=json&sort=relevance&retmax=${max}&term=${q}&${TOOL}`);
  return d.esearchresult?.idlist || [];
};

export const summaries = async (ids) => {
  if (!ids.length) return [];
  const d = await getJson(`${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}&${TOOL}`);
  return ids.map((id) => d.result?.[id]).filter(Boolean).map((r) => ({
    pmid: r.uid,
    title: r.title,
    journal: r.fulljournalname || r.source,
    year: (r.pubdate || '').slice(0, 4),
    authors: (r.authors || []).slice(0, 3).map((a) => a.name).join(', '),
    url: `https://pubmed.ncbi.nlm.nih.gov/${r.uid}/`,
  }));
};

export const abstracts = async (ids) => {
  if (!ids.length) return '';
  const r = await fetch(`${EUTILS}/efetch.fcgi?db=pubmed&rettype=abstract&retmode=text&id=${ids.join(',')}&${TOOL}`);
  return r.ok ? r.text() : '';
};

const checkUrls = async (video) => {
  let bad = 0;
  for (const s of video.sources || []) {
    if (!s.url) continue;
    let status = 'ERR';
    try {
      const r = await fetch(s.url, {method: 'GET', redirect: 'follow', headers: {'user-agent': 'Mozilla/5.0 medpeak-studio link check'}});
      status = r.status;
    } catch (e) { status = e.code || 'ERR'; }
    const ok = typeof status === 'number' && status < 400;
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : 'BAD'} ${status} ${s.id} ${s.url}`);
  }
  console.log(bad ? `${bad} source link(s) need fixing` : 'All source links answer');
  return bad;
};

const main = async () => {
  const a = args();
  const slug = a._[0];
  const video = loadVideo(slug);
  if (a['check-urls']) process.exit((await checkUrls(video)) ? 1 : 0);

  const out = path.join(videoDir(slug), 'research');
  fs.mkdirSync(out, {recursive: true});
  const results = [];
  let ids = [];
  if (a.pmid) {
    ids = String(a.pmid).split(',');
    results.push({query: `pmid:${a.pmid}`, papers: await summaries(ids)});
  } else {
    for (const q of video.research?.queries || []) {
      const found = await searchPubmed(q, Number(a.max || 4));
      await sleep(400); // NCBI asks for at most 3 requests a second without a key
      results.push({query: q, papers: await summaries(found)});
      ids.push(...found);
      await sleep(400);
    }
  }
  ids = [...new Set(ids)];
  writeJson(path.join(out, 'pubmed.json'), {fetched: new Date().toISOString(), results});
  const text = await abstracts(ids);
  fs.writeFileSync(path.join(out, 'abstracts.md'), `# PubMed abstracts for ${slug}\n\nFetched ${new Date().toISOString()}\n\n${text}`);
  for (const r of results) {
    console.log(`\n## ${r.query}`);
    for (const p of r.papers) console.log(`- ${p.pmid} (${p.year}) ${p.title} — ${p.journal}`);
  }
  console.log(`\nSaved research/pubmed.json and research/abstracts.md (${ids.length} papers)`);
};

if (isMain(import.meta.url)) main().catch((e) => { console.error(e.message); process.exit(1); });
