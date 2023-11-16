import { Battle, TurnBar } from '../index.ts'

export interface BattleOptions {
   playerOneId?: string
   playerTwoId?: string
   playerTwoCounterAttackFunction?: (battle: Battle) => void
   isTutorialBattle?: boolean
   playerOneAccessToken?: string
   turnBar?: TurnBar
}
