import { InBattleStatus } from '../index.ts';

export interface UnitInBattle {
   joinNumber: number;
   name: string;
   inBattleStatus: InBattleStatus;
}
