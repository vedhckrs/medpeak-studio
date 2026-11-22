import json, re, sys, numpy as np, librosa, statistics as st
S=sys.argv[1]
d=json.load(open(S+'/words.json'))
out={}
for it in d['items']:
    name=it['id']; W=it['words']
    y,sr=librosa.load(f'{S}/{name}.wav',sr=16000)
    if name.startswith('ours'):
        for i in range(len(W)-1):
            if W[i]['w'].lower().startswith('know') and W[i+1]['w'].lower().startswith('this'): cta=W[i-1]['start']; break
        W=[w for w in W if w['end']<=cta]
    def rms(a,b):
        seg=y[int(a*sr):int(b*sr)]
        return 10*np.log10(np.mean(seg**2)+1e-12)
    sp=[rms(w['start'],w['end']) for w in W if w['end']-w['start']>0.12]
    gaps=[]
    for i in range(len(W)-1):
        a=W[i]['end']+0.12; b=W[i+1]['start']-0.08
        if b-a>=0.3: gaps.append((rms(a,b), b-a))
    voice_db=float(np.median(sp)); gap_db=float(np.median([g for g,_ in gaps])) if gaps else None
    # sentences -> pitch
    sents=[]; cur=[]
    for w in W:
        cur.append(w)
        if re.search(r'[.?!]$',w['w']): sents.append(cur); cur=[]
    if cur: sents.append(cur)
    f0s=[]; spreads=[]
    for s in sents:
        a=s[0]['start']; b=s[-1]['end']
        seg=y[int(a*sr):int(b*sr)]
        if len(seg)<sr*0.25: continue
        f0,vf,vp=librosa.pyin(seg,fmin=65,fmax=700,sr=sr,frame_length=1024,hop_length=320)
        f=f0[vf]
        if len(f)<5: continue
        med=float(np.median(f)); f0s.append(med)
        semis=12*np.log2(f/med); spreads.append(float(np.percentile(semis,90)-np.percentile(semis,10)))
    f0s=np.array(f0s)
    # crude voice count: cluster sentence pitches into bins of 3 semitones with >=2 sentences
    semi=np.round(12*np.log2(f0s/55)/3)
    bins={}
    for v in semi: bins[v]=bins.get(v,0)+1
    out[name]=dict(voice_db=round(voice_db,1), gap_db=round(gap_db,1) if gap_db is not None else None, voice_over_gap=round(voice_db-gap_db,1) if gap_db is not None else None, n_gaps=len(gaps),
      f0_median=round(float(np.median(f0s)),0), f0_p10=round(float(np.percentile(f0s,10)),0), f0_p90=round(float(np.percentile(f0s,90)),0),
      share_high=round(float(np.mean(f0s>250)),2), share_low=round(float(np.mean(f0s<140)),2), intonation_semis=round(float(np.median(spreads)),1), pitch_bins=len([k for k,v in bins.items() if v>=2]))
    print(name, out[name], flush=True)
json.dump(out,open(S+'/voice.json','w'),indent=1)
