import sys; sys.path.insert(0,'/private/tmp/claude-501/agent2')
import numpy as np
from measure import frames, W, H
name, path, to = sys.argv[1], sys.argv[2], (float(sys.argv[3]) if sys.argv[3]!='-' else None)
acc=np.zeros((H,W)); n=0; prev=None; still_acc=np.zeros((H,W)); ns=0
mid=None
for i,f in enumerate(frames(path,to)):
    g=f.astype(np.int16)
    if prev is not None:
        a=np.abs(g-prev).mean(2)
        if (a>12).mean()<0.3:
            m=a>4; acc+=m; n+=1
    prev=g
    if i==int(0.5*30*(to or 50)): mid=f.copy()
np.savez('data/heat-'+name+'.npz', heat=acc/max(n,1), mid=mid)
print(name, n)
