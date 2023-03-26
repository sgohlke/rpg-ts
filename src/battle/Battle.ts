import { BattleStatus, CounterAttackUnits, PlayerInBattle } from '../index.ts'

export interface Battle {
   battleId: string
   playerOne: PlayerInBattle
   playerTwo: PlayerInBattle
   battleStatus: BattleStatus
   battleWinner?: PlayerInBattle
   counterAttackUnits?: CounterAttackUnits
   isTutorialBattle?: boolean
}
