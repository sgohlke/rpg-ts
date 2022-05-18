import { Status } from "../../index.ts"

export interface UnitWithPlayerId {
    joinNumber: number
    name: string
    defaultStatus: Status
    playerId: string
}
