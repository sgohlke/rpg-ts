import { InBattleStatus, Unit } from '../index.ts';

export interface UnitInBattle extends Unit {
   inBattleStatus: InBattleStatus;
}
