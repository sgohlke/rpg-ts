import { Unit } from "../units/Unit.ts"
import { IdGenerator } from "./IdGenerator.ts"

export class Player {
    private id: string
    private name: string
    private units: Map<string, Unit> = new Map()

    constructor(name: string) {
        this.id = IdGenerator.getInstance().generatePlayerId()
        this.name = name
    }

    public addUnit(unit: Unit): void {
        this.units.set(unit.$id, unit)
    }

    public initBattle(): void {
        for (const unit of this.units.values()) {
            unit.initBattleStatus()
        }
    }

    /**
     * Getter $units
     * @return {Map<string, Unit> }
     */
    public get $units(): Map<string, Unit>  {
        return this.units
    }

    public get $id(): string {
        return this.id
    }

    public get $name(): string {
        return this.name
    }
}
