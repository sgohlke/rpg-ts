import { BattleStatus, GamePlayer } from "../index.ts"

export interface Battle {
    battleId: string
    playerOne: GamePlayer
    playerTwo: GamePlayer
    battleStatus: BattleStatus
}
