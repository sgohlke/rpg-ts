import { UnitInBattle } from '../index.ts'

export interface BattleAction {
   attackingUnit?: UnitInBattle & { playerId: string }
   defendingUnit?: UnitInBattle & { playerId: string }
}

export function shortBattleAction(battleAction: BattleAction): string {
   return `${battleAction.attackingUnit?.playerId}_${battleAction.attackingUnit?.joinNumber}-${battleAction.defendingUnit?.playerId}_${battleAction.defendingUnit?.joinNumber}`
}
