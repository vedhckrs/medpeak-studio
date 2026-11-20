import React from 'react';
import {registerRoot, Still} from 'remotion';
import {DoctorTest, PeopleCloseTest, PeopleHandTest, PeopleLineup, PersonSheet, PeopleHands} from './people-sheets';

const sheet = (id: string) => {
  const C: React.FC = () => <PersonSheet id={id} />;
  return C;
};
const Doctor = sheet('doctor'), Patient = sheet('patient'), Mom = sheet('mom'), Dad = sheet('dad');
const Kid = sheet('kid'), Grandpa = sheet('grandpa'), Grandma = sheet('grandma'), Baby = sheet('baby');

registerRoot(() => (
  <>
    <Still id="V8PeopleTest" component={DoctorTest} width={1920} height={1080} />
    <Still id="V8PeopleClose" component={PeopleCloseTest} width={1920} height={1080} />
    <Still id="V8PeopleHandTest" component={PeopleHandTest} width={1920} height={1080} />
    <Still id="V8PeopleLineup" component={PeopleLineup} width={1920} height={1080} />
    <Still id="V8PersonDoctor" component={Doctor} width={1920} height={1080} />
    <Still id="V8PersonPatient" component={Patient} width={1920} height={1080} />
    <Still id="V8PersonMom" component={Mom} width={1920} height={1080} />
    <Still id="V8PersonDad" component={Dad} width={1920} height={1080} />
    <Still id="V8PersonKid" component={Kid} width={1920} height={1080} />
    <Still id="V8PersonGrandpa" component={Grandpa} width={1920} height={1080} />
    <Still id="V8PersonGrandma" component={Grandma} width={1920} height={1080} />
    <Still id="V8PersonBaby" component={Baby} width={1920} height={1080} />
    <Still id="V8PeopleHands" component={PeopleHands} width={1920} height={1080} />
  </>
));
