/**
 * "What Happens When You Quit Smoking" (`quit-smoking`), the engine v9 pilot: this video's moments built from the v9 kit
 * (anatomy stages, the cilia crew, the CO gang, the pale clinic), for the owner's look sheets and for the shots.
 *   MomentHook      the chest, grey and tarry, coughing; the cilia crew asleep under the tar (hook B)
 *   MomentCrewUp    the same framing: Sweep wakes and stands, broom up
 *   MomentCoSeats   inside a vessel: the CO gang lounging on the red cells
 *   MomentCoHalf    the same framing, 8 hours later: half the gang gone
 *   MomentEasier    the chest, 3 days later: pinker, the airways open, the crew sweeping the mucus up and out
 *   MomentClinic    Dr. Mira's pale clinic: Dad, a hand on his chest, asks why he coughs more
 */
import React from 'react';
import {Put, Scene} from './scene';
import {V9} from './kit';
import {STAGES, CoEgg, RedDisc} from './anatomy';
import {MiniWorker} from './cells';
import {castById, PersonAt} from './people-rig';
import {FEET_Y_TWO, PaleClinicRoom, PEOPLE_SCALE_TWO} from './scenes-rooms';

const Chest = STAGES.chest.Stage, Vessel = STAGES.vesselInside.Stage;
/** Where the crew stands: on the floor of the chest under the lungs, clear of the two faces and the caption band. */
const CREW: [number, number, number][] = [[250, 1560, 300], [540, 1600, 340], [830, 1560, 300]];

export const SweepCrew: React.FC<{awake: number; sweeping?: boolean}> = ({awake, sweeping}) => (
  <>
    {CREW.map(([x, y, s], i) => (
      <Put key={i} x={x} y={y + (1 - awake) * 40} size={s} rot={awake < 0.5 ? (i - 1) * 70 : 0}>
        <MiniWorker job="cleaner" band={i === 1 ? 'CILIA' : undefined} pose={awake < 0.5 ? 'rest' : sweeping ? 'sweep' : i === 1 ? 'up' : 'hold'}
          mood={awake < 0.5 ? 'closed' : 'open'} mouth={awake < 0.5 ? 'flat' : 'big'} look={[0, -0.3]} />
      </Put>
    ))}
  </>
);

export const MomentHook: React.FC = () => (
  <Scene bg="#000"><V9>
    <Chest t={1} state={{tar: 0.9, mucus: 0.7, airway: 0.3, cough: 0.8, pink: 0, cilia: 0}}
      faces={{lungR: {mood: 'pain', mouth: 'open'}, lungL: {mood: 'shock', mouth: 'o', lookAt: [290, 640]}}}>
      <SweepCrew awake={0} />
    </Chest>
  </V9></Scene>
);
export const MomentCrewUp: React.FC = () => (
  <Scene bg="#000"><V9>
    <Chest t={2} state={{tar: 0.9, mucus: 0.7, airway: 0.3, cough: 0, pink: 0, cilia: 0.2}}
      faces={{lungR: {mood: 'side', mouth: 'flat', lookAt: [540, 1500]}, lungL: {mood: 'open', mouth: 'smile', lookAt: [540, 1500]}}}>
      <SweepCrew awake={1} />
    </Chest>
  </V9></Scene>
);
const CO_ON: [number, number][] = [[260, 860], [520, 1000], [780, 880], [360, 1180], [700, 1200], [900, 1080]];
export const MomentCoSeats: React.FC<{half?: boolean}> = ({half}) => (
  <Scene bg="#000"><V9>
    <Vessel t={3} state={{flow: 0.3, co: 0, pink: half ? 0.5 : 0}}
      layer={<>
        {/* every red cell a big seat; the CO sit on them (8 hours later, half the seats are free again) */}
        {CO_ON.map(([x, y], i) => <RedDisc key={'d' + i} x={x} y={y + 70} w={230} c={half ? '#d8453f' : '#b8504a'} rot={(i % 3 - 1) * 8} />)}
        {CO_ON.filter((_, i) => !half || i % 2 === 0).map(([x, y], i) => <CoEgg key={i} x={x} y={y} s={1.3} face={{mood: half ? 'shock' : 'wink', mouth: half ? 'o' : 'smile', lookAt: [540, 960]}} />)}
      </>} />
  </V9></Scene>
);
export const MomentCoHalf: React.FC = () => <MomentCoSeats half />;
export const MomentEasier: React.FC = () => (
  <Scene bg="#000"><V9>
    <Chest t={4} state={{tar: 0.45, mucus: 0.4, airway: 1, cough: 0, pink: 0.55, cilia: 1}}
      faces={{lungR: {mood: 'happy', mouth: 'big', lookAt: [800, 650]}, lungL: {mood: 'happy', mouth: 'big', lookAt: [290, 640]}}}>
      <SweepCrew awake={1} sweeping />
    </Chest>
  </V9></Scene>
);
export const MomentClinic: React.FC = () => {
  const mira = castById('doctor'), dad = castById('dad');
  return (
    <Scene bg="#f1ede4"><V9>
      <PaleClinicRoom wall="sky" items={["door", "chart"]} />
      <PersonAt spec={dad} pose="worried" view="three-quarter" facing="right" expr="worried" lookAt={[800, 640]} x={280} y={FEET_Y_TWO} scale={PEOPLE_SCALE_TWO} />
      <PersonAt spec={mira} pose="clipboard" view="three-quarter" facing="left" expr="neutral" lookAt={[300, 640]} x={820} y={FEET_Y_TWO} scale={PEOPLE_SCALE_TWO} />
    </V9></Scene>
  );
};
