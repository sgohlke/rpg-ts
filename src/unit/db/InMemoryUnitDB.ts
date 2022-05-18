import { UnitWithPlayerId, UnitDB } from "../../index.ts"

export class InMemoryUnitDB implements UnitDB {
    units: Array<UnitWithPlayerId> = []

    createUnit(unit: UnitWithPlayerId): void {
        this.units.push(unit)
    }

    getUnit(playerId: string, joinNumber: number): UnitWithPlayerId | undefined {
        return this.units.find(entry => entry.playerId === playerId && entry.joinNumber === joinNumber)
    }
}
