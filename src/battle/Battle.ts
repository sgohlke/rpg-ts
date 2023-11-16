import {
   BattleAction,
   BattleStatus,
   PlayerInBattle,
   TurnBar,
} from '../index.ts'

export interface Battle {
   battleId: string
   battleActions: Array<BattleAction>
   playerOne: PlayerInBattle
   playerTwo: PlayerInBattle
   battleStatus: BattleStatus
   battleWinner?: PlayerInBattle
   isTutorialBattle?: boolean
   turnBar?: TurnBar
}
