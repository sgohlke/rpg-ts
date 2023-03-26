import { Battle, calculateDamage } from '../index.ts'

export type CounterAttackFunction = (battle: Battle) => void

export function noCounterAttackFunction(battle: Battle) {
   battle.counterAttackUnits = {
      counterAttacker: undefined,
      counterTarget: undefined,
   }
}

export function randomCounterAttackFunction(battle: Battle) {
   if (!battle.playerTwo.isDefeated() && !battle.playerOne.isDefeated()) {
      const counterAttacker = battle.playerTwo.findRandomNonDefeatedUnit()
      const counterTarget = battle.playerOne.findRandomNonDefeatedUnit()
      if (counterAttacker && counterTarget) {
         counterTarget.inBattleStatus.hp -= calculateDamage(
            counterAttacker,
            counterTarget,
         )
         battle.counterAttackUnits = { counterAttacker, counterTarget }
      }
   } else {
      battle.counterAttackUnits = {
         counterAttacker: undefined,
         counterTarget: undefined,
      }
   }
}
