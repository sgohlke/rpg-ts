import { InBattleStatus, Unit } from '../index.ts'

export interface UnitInBattle extends Unit {
   inBattleStatus: InBattleStatus
}

export function calculateDamage(
   attackerUnit: UnitInBattle,
   defenderUnit: UnitInBattle,
): number {
   let damage = attackerUnit.inBattleStatus.atk -
      defenderUnit.inBattleStatus.def
   if (damage < 1) {
      damage = 1
   }
   return damage
}
