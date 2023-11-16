import { Battle, calculateDamage } from '../index.ts'

export type CounterAttackFunction = (battle: Battle) => void

export function noCounterAttackFunction(battle: Battle) {
   battle.battleActions.push({})
}

export function randomCounterAttackFunction(battle: Battle) {
   if (!battle.playerTwo.isDefeated() && !battle.playerOne.isDefeated()) {
      const counterAttacker = battle.turnBar && battle.turnBar.currentTurn
         ? battle.playerTwo.getUnitInBattle(
            battle.turnBar.currentTurn.unitJoinNumber,
         )
         : battle.playerTwo.findRandomNonDefeatedUnit()
      const counterTarget = battle.playerOne.findRandomNonDefeatedUnit()
      if (counterAttacker && counterTarget) {
         counterTarget.inBattleStatus.hp -= calculateDamage(
            counterAttacker,
            counterTarget,
         )
         battle.battleActions.push({
            attackingUnit: {
               defaultStatus: counterAttacker.defaultStatus,
               inBattleStatus: counterAttacker.inBattleStatus,
               joinNumber: counterAttacker.joinNumber,
               name: counterAttacker.name,
               playerId: battle.playerTwo.playerId,
            },
            defendingUnit: {
               defaultStatus: counterTarget.defaultStatus,
               inBattleStatus: counterTarget.inBattleStatus,
               joinNumber: counterTarget.joinNumber,
               name: counterTarget.name,
               playerId: battle.playerOne.playerId,
            },
         })
      }
   }
}
