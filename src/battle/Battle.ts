import { PlayerWithUnits } from "../index.ts"

export interface Battle {
    battleId: string
    playerOne: PlayerWithUnits
    playerTwo: PlayerWithUnits
}
