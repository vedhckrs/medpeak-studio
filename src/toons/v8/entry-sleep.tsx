import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board} from './kit';
import {SleepCastBoard} from './sleep-cast';
import {MomentAsleep, MomentAwake, MomentMorning} from './sleep-places';
import {Crop, Mini} from './sheets-v4';
import {MomentMorning as RoomMorning, MomentNight as RoomNight} from './sleep-rooms';

const K = 0.44; // 1080 x 1920 -> 475 x 845
const SleepPlaceBoard: React.FC = () => (
  <Board
    kicker="No sleep · new place · sheet 2"
    title="Inside the brain, among the cells: the gaps open when you sleep"
    note="Microscopic, four depth planes. Awake the cells sit close; asleep they draw apart and the night crew washes the channels (Xie 2013: about 60% more space, in mice). The grey bits are the waste."
    page="no-sleep · brain place"
  >
    <Mini x={56} y={200} k={K} label="A · AWAKE, 2 A.M. (THE HOOK)"><MomentAwake /></Mini>
    <Mini x={56 + 495} y={200} k={K} label="C · ASLEEP: GAPS OPEN, THE WASH"><MomentAsleep /></Mini>
    <Mini x={56 + 990} y={200} k={K} label="D · MORNING AFTER NO SLEEP"><MomentMorning /></Mini>
    <Crop x={1530} y={200} w={340} h={400} fx={300} fy={480} zoom={0.75} label="THE WASH, CLOSER"><MomentAsleep /></Crop>
    <Crop x={1530} y={645} w={340} h={400} fx={260} fy={560} zoom={0.75} label="THE WASTE, CLOSER"><MomentMorning /></Crop>
  </Board>
);

const SleepRoomBoard: React.FC = () => (
  <Board
    kicker="No sleep · new room · sheet 3"
    title="Sam's bedroom: 2 a.m. and 7 a.m."
    note="One room, two times of day (no other video has a bedroom). Night: deep blue, moon, the clock at 2:00, the phone's light as a flat pale shape. Morning: butter walls, sun, the clock at 7:00, Sam slumped on the bed's edge."
    page="no-sleep · bedroom"
  >
    <Mini x={56} y={200} k={K} label="B · 2 A.M., ONE MORE VIDEO"><RoomNight /></Mini>
    <Mini x={56 + 495} y={200} k={K} label="D · 7 A.M., JUST A BIT SLOW"><RoomMorning /></Mini>
    <Crop x={1046} y={200} w={400} h={400} fx={60} fy={720} zoom={0.62} label="SAM AND THE PHONE"><RoomNight /></Crop>
    <Crop x={1476} y={200} w={400} h={400} fx={120} fy={760} zoom={0.62} label="SAM, MORNING"><RoomMorning /></Crop>
    <Crop x={1046} y={645} w={400} h={400} fx={420} fy={420} zoom={0.62} label="MELATONIN AND THE CLOCK"><RoomNight /></Crop>
    <Crop x={1476} y={645} w={400} h={400} fx={260} fy={150} zoom={0.62} label="THE WINDOW, MORNING"><RoomMorning /></Crop>
  </Board>
);

registerRoot(() => (
  <>
    <Still id="SleepCast" component={SleepCastBoard} width={1920} height={1080} />
    <Still id="SleepPlace" component={SleepPlaceBoard} width={1920} height={1080} />
    <Still id="SleepRoom" component={SleepRoomBoard} width={1920} height={1080} />
  </>
));
