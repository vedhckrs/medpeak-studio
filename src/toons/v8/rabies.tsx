/** The rabies video's shots in look v8, by shot id (videos/rabies/toon.json). */
import type {ShotDef} from './play';
import {BODY_SHOTS} from './scenes-body';
import {ROOM_SHOTS} from './scenes-rooms';

export const RABIES_SHOTS: Record<string, ShotDef> = {...BODY_SHOTS, ...ROOM_SHOTS};
