import numpy as np, json, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
OUT='/Users/vedika/Desktop/MedPeakHealth/medpeak-studio/plans/engine-upgrade-2026-11-23/agent2-sheets/'
S=json.load(open('summary.json')); S={r['name']:r for r in S}
refs=[f'ref{i:02d}' for i in range(1,21)]; ours=['creatine','quit-sugar','fasting','snake-bite']
# 1 heatmaps
names=['ref20','ref05','ref02','ref13','fasting','snake-bite','quit-sugar','creatine']
fig,ax=plt.subplots(1,8,figsize=(24,7.5))
for a,n in zip(ax,names):
    z=np.load(f'data/heat-{n}.npz'); h=z['heat']
    a.imshow(z['mid'].mean(2),cmap='gray',alpha=1); a.imshow(h,cmap='inferno',vmin=0,vmax=0.5,alpha=0.75)
    a.set_title(f"{n}\npicture outside the caption that changes\nin more than 5% of frames: {100*(h[np.r_[0:240,328:384]]>0.05).mean():.0f}%",fontsize=11); a.axis('off')
fig.suptitle('Where the picture keeps changing (bright = this pixel changes in many frames; cuts left out). References: only eyes, mouth, caption. Ours: whole regions.',fontsize=14)
plt.tight_layout(); plt.savefig(OUT+'01-motion-heatmaps.jpg',dpi=80); plt.close()
# 2 timelines
fig,ax=plt.subplots(8,1,figsize=(18,14),sharex=True)
for a,n in zip(ax,['ref20','ref05','ref02','ref13']+ours):
    z=np.load(f'data/{n}.npz'); ap=z['areapic']; t=np.arange(len(ap))/30
    a.fill_between(t,np.minimum(ap,0.3),color='#c04355' if n.startswith('ref') else '#2b6cb0',lw=0)
    for c in S[n]['cut_times']: a.axvline(c,color='k',lw=1.5)
    a.set_ylim(0,0.3); a.set_ylabel(n,rotation=0,ha='right',fontsize=12); a.set_yticks([])
ax[-1].set_xlabel('seconds (story only). Black line = a cut. Filled = share of picture changing that frame (capped at 30%).',fontsize=12)
fig.suptitle('Cuts and motion over time: references (red) hold one picture for 10-30 s; ours (blue) cut every 2-4 s and move all the time',fontsize=14)
plt.tight_layout(); plt.savefig(OUT+'02-cuts-and-motion-timelines.jpg',dpi=80); plt.close()
# 3 bars
mets=[('cuts_per_min','Cuts per minute'),('hold_med','Median shot hold (s)'),('still','Picture still (share of frames, caption left out)'),('mean_area','Mean share of picture changing per frame')]
fig,ax=plt.subplots(1,4,figsize=(22,6))
for a,(k,lab) in zip(ax,mets):
    v=[S[n][k] for n in refs]+[S[n][k] for n in ours]
    cols=['#c04355']*20+['#2b6cb0']*4
    a.bar(range(24),v,color=cols); a.set_xticks(range(24)); a.set_xticklabels([n.replace('ref','') for n in refs]+['crea','sugar','fast','snake'],rotation=90)
    med=np.median([S[n][k] for n in refs]); a.axhline(med,color='#c04355',ls='--'); a.set_title(f'{lab}\nreference median {med:g}',fontsize=12)
fig.suptitle('Camera and motion numbers: 20 references (red) and our 4 latest videos (blue), measured every frame at 30 fps',fontsize=14)
plt.tight_layout(); plt.savefig(OUT+'03-camera-motion-numbers.jpg',dpi=80); plt.close()
print('ok')
