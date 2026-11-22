import json, sys, glob, os
import numpy as np
D='/private/tmp/claude-501/agent2/data'
def runs(mask):
    out=[]; i=0; n=len(mask)
    while i<n:
        if mask[i]:
            j=i
            while j<n and mask[j]: j+=1
            out.append((i,j)); i=j
        else: i+=1
    return out
def an(name):
    z=np.load(f'{D}/{name}.npz'); n=int(z['n']); sec=n/30
    d=z['d']; area=z['area']; ap=z['areapic']; ab=z['areaband']; grid=z['grid']; gm=z['gm']
    cut=(d>28)&(area>0.45)
    # also softer hard changes: big single-frame change not part of a smooth move
    hard=(area>0.30)&~cut
    cutf=np.where(cut)[0]
    bounds=[0]+[int(c)+1 for c in cutf]+[n-1]
    holds=np.diff(bounds)/30
    still=ap<0.005; small=(ap>=0.005)&(ap<0.08); big=ap>=0.25
    # action events: runs of visible picture change >=2% lasting >=2 frames, merge gaps < 3 frames
    act=ap>=0.02
    ev=[r for r in runs(act) if r[1]-r[0]>=2]
    stillruns=[ (b-a)/30 for a,b in runs(still) ]
    # captions: band changes while picture still
    capflip=((ab>0.01)&(ap<0.005)).mean()
    # camera
    s=gm[:,1]; dy=gm[:,2]; dx=gm[:,3]; e0=gm[:,4]; eb=gm[:,5]
    moving=(e0>1.0)&(eb<0.7*e0)&((s!=1.0)|(dy!=0)|(dx!=0))
    # exclude samples on a cut
    tt=gm[:,0].astype(int)
    oncut=np.array([cut[max(0,t-1):t+7].any() for t in tt])
    moving&=~oncut
    zoom=moving&(s!=1.0); pan=moving&(s==1.0)
    camsegs=[r for r in runs(moving) if r[1]-r[0]>=2]  # >=0.2s
    zoomin=(zoom&(s>1)).sum(); zoomout=(zoom&(s<1)).sum()
    # shake: translation reverses sign within consecutive samples
    sh=0
    for i in range(1,len(dx)):
        if moving[i] and moving[i-1] and ((dx[i]*dx[i-1]<0 and abs(dx[i])+abs(dx[i-1])>=3) or (dy[i]*dy[i-1]<0 and abs(dy[i])+abs(dy[i-1])>=3)): sh+=1
    g=grid.mean(0); g=g/g.sum()
    return dict(name=name, sec=round(sec,1), cuts=int(cut.sum()), cuts_per_min=round(cut.sum()/sec*60,2),
        hold_med=round(float(np.median(holds)),1), hold_max=round(float(holds.max()),1),
        hard_nocut=int(hard.sum()), hard_per_min=round(hard.sum()/sec*60,2),
        still=round(float(still.mean()),3), small=round(float(small.mean()),3), big=round(float(big.mean()),4),
        mean_area=round(float(ap.mean()),4), p95_area=round(float(np.percentile(ap,95)),4),
        events_per_min=round(len(ev)/sec*60,1), event_med_s=round(float(np.median([(b-a)/30 for a,b in ev])) if ev else 0,2),
        stillrun_med=round(float(np.median(stillruns)) if stillruns else 0,2), stillrun_p90=round(float(np.percentile(stillruns,90)) if stillruns else 0,2),
        longest_still=round(max(stillruns) if stillruns else 0,1),
        capflip=round(float(capflip),3),
        cam_move_share=round(float(moving.mean()),3), cam_segments=len(camsegs), cam_seg_per_min=round(len(camsegs)/sec*60,1),
        zoom_share=round(float(zoom.mean()),3), pan_share=round(float(pan.mean()),3), zoom_in=int(zoomin), zoom_out=int(zoomout), shake_samples=sh,
        top_third=round(float(g[:3].sum()),2), mid_third=round(float(g[3:6].sum()),2), bottom_third=round(float(g[6:].sum()),2),
        cut_times=[round((c+1)/30,2) for c in cutf][:40], hard_times=[round((c+1)/30,2) for c in np.where(hard)[0]][:40],
        cam_segs=[(round(gm[a,0]/30,1), round(gm[b-1,0]/30+0.2,1), float(np.median(s[a:b])), int(np.median(dx[a:b])), int(np.median(dy[a:b]))) for a,b in camsegs][:30])
names=sys.argv[1:] or sorted(os.path.basename(p)[:-4] for p in glob.glob(D+'/*.npz') if 'test' not in p)
res=[an(n) for n in names]
json.dump(res, open('/private/tmp/claude-501/agent2/summary.json','w'), indent=1)
keys=['sec','cuts','cuts_per_min','hold_med','hold_max','hard_nocut','still','small','big','mean_area','events_per_min','event_med_s','stillrun_med','stillrun_p90','longest_still','capflip','cam_move_share','cam_seg_per_min','zoom_share','pan_share','zoom_in','zoom_out','shake_samples','top_third','mid_third','bottom_third']
print('name'.ljust(11)+' '.join(k[:8].rjust(8) for k in keys))
for r in res: print(r['name'].ljust(11)+' '.join(str(r[k]).rjust(8) for k in keys))
