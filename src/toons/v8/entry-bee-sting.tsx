import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board} from './kit';
import {Mini} from './sheets-v4';
import {MomentCard, MomentClinic, MomentHook, MomentLump, MomentLumpLater, MomentSwell, MomentTweezers} from './bee-sting-art';

const K = 0.4;
const BeePlaces1: React.FC = () => (
  <Board kicker="Bee sting · engine v9 · sheet 1" title="Inside the skin: the sting, the swell, the tweezers, the card"
    note="The skin in section is the stage (surface, dermis, fat, muscle, a vessel), the outside a band of air above it, held in ONE framing. Hook A: the Stinger spears in and grins at us. The guards call the swell: the lump rises. Mom's giant tweezers come down and the Stinger cheers (they would squeeze poison out: NHS). The card edge sweeps in sideways and flicks him out (NHS)."
    page="bee sting · skin">
    <Mini x={56} y={240} k={K} label="A1 · HOOK: BULLSEYE!"><MomentHook /></Mini>
    <Mini x={56 + 452} y={240} k={K} label="A3 · SWELL IT UP!"><MomentSwell /></Mini>
    <Mini x={56 + 904} y={240} k={K} label="B2 · SQUEEZE ME!"><MomentTweezers /></Mini>
    <Mini x={56 + 1356} y={240} k={K} label="B5 · NOT SIDEWAYS!"><MomentCard /></Mini>
  </Board>
);
const BeePlaces2: React.FC = () => (
  <Board kicker="Bee sting · engine v9 · sheet 2" title="The lump close up, two days later, and Dr. Mira's clinic"
    note="Under the lump: the tissue stage, the guard crew resting, the soft redness of the swelling. After the 2 DAYS LATER card, the same framing with less redness (NHS: it should get better in a few days). The clinic: Mom, Kid showing the small red lump on his hand, Dr. Mira."
    page="bee sting · lump and clinic">
    <Mini x={280} y={240} k={K} label="C1 · THE LUMP"><MomentLump /></Mini>
    <Mini x={280 + 452} y={240} k={K} label="C2 · 2 DAYS LATER"><MomentLumpLater /></Mini>
    <Mini x={280 + 904} y={240} k={K} label="D · DR. MIRA"><MomentClinic /></Mini>
  </Board>
);
registerRoot(() => (
  <>
    <Still id="BeePlaces1" component={BeePlaces1} width={1920} height={1080} />
    <Still id="BeePlaces2" component={BeePlaces2} width={1920} height={1080} />
  </>
));
