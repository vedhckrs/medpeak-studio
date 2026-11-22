import json, re, statistics as st, sys
d=json.load(open(sys.argv[1]))
loud={l.split()[0][:-9]:float(l.split()[1]) for l in open(sys.argv[2])}
# our story end (CTA start) seconds: detect "Know this" phrase start minus topic word
rows=[]
for it in d['items']:
    W=it['words']; name=it['id']; dur=loud[name]
    if name.startswith('ours'):
        # story ends before the CTA: find word 'Know' followed by 'this'
        for i in range(len(W)-1):
            if W[i]['w'].lower().startswith('know') and W[i+1]['w'].lower().startswith('this'):
                cta=W[i-1]['start']; break
        Wst=[w for w in W if w['end']<=cta]; story_end=cta
    else:
        Wst=W; story_end=dur
    # speech spans: merge words with gap < 0.3
    spans=[]
    for w in Wst:
        if spans and w['start']-spans[-1][1]<0.3: spans[-1][1]=w['end']
        else: spans.append([w['start'],w['end']])
    speech=sum(b-a for a,b in spans)
    gaps=[Wst[i+1]['start']-Wst[i]['end'] for i in range(len(Wst)-1)]
    pauses=[g for g in gaps if g>=0.3]
    long=[g for g in gaps if g>=1.0]
    # sentences: split on . ? !
    text=' '.join(w['w'] for w in Wst)
    sents=[s for s in re.split(r'(?<=[.?!])\s+',text) if s.strip()]
    wps=[len(s.split()) for s in sents]
    q=sum(1 for s in sents if s.strip().endswith('?'))
    ex=sum(1 for s in sents if s.strip().endswith('!'))
    nums=re.findall(r'\b\d[\d,.]*%?|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|sixteen|hundred|thousand|million|percent)\b',text,flags=re.I)
    # doctor: first word "Doc"/"Doctor" addressed
    doc=None
    for w in Wst:
        if re.match(r'^(doc|doctor)\b',w['w'].lower()): doc=w['start']; break
    # longest silence anywhere in story
    first=Wst[0]['start'] if Wst else None
    # speaking rate inside speech
    rate=len(Wst)/speech if speech else 0
    tail=story_end-Wst[-1]['end']
    rows.append(dict(name=name,story=round(story_end,1),words=len(Wst),wps_overall=round(len(Wst)/story_end,2),wps_in_speech=round(rate,2),
       speech_share=round(speech/story_end,2),first_word=round(first,2),pauses_03=len(pauses),pauses_per_min=round(len(pauses)/story_end*60,1),
       pause_med=round(st.median(pauses),2) if pauses else 0, pauses_1s=len(long),max_gap=round(max(gaps),2) if gaps else 0,
       sentences=len(sents),words_per_sentence=round(st.mean(wps),1), wps_med=st.median(wps), questions=q, q_share=round(q/len(sents),2), exclaims=ex,
       numbers=len(nums), doctor_at=round(doc,1) if doc else None, doctor_frac=round(doc/story_end,2) if doc else None, doc_words=sum(1 for w in Wst if doc and w['start']>=doc),
       silent_tail=round(tail,1), first3s=' '.join(w['w'] for w in Wst if w['start']<3.0)))
json.dump(rows,open(sys.argv[3],'w'),indent=1)
keys=['name','story','words','wps_overall','wps_in_speech','speech_share','first_word','pauses_per_min','pause_med','pauses_1s','max_gap','sentences','words_per_sentence','q_share','exclaims','numbers','doctor_frac','doc_words']
print('\t'.join(k[:10] for k in keys))
for r in rows: print('\t'.join(str(r[k])[:14] for k in keys))
refs=[r for r in rows if r['name'].startswith('ref')]
print('REF MEDIAN', {k: st.median([r[k] for r in refs if r[k] is not None]) for k in keys[1:]})
for r in rows: print(r['name'], '|', r['first3s'])
