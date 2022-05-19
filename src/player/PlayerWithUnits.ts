import { Unit } from '../index.ts';

export interface PlayerWithUnits {
   playerId: string;
   name: string;
   units?: Array<Unit>;
}
