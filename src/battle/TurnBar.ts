import { PlayerInBattle, PlayerUnit } from '../index.ts'

export interface TurnBar {
   currentTurn?: PlayerUnit
   turns: Array<PlayerUnit>
   initTurnBar: (playerOne: PlayerInBattle, playerTwo: PlayerInBattle) => void
   nextTurn: () => PlayerUnit | undefined
}
