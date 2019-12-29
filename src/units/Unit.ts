import { IdGenerator } from "../game/IdGenerator"

export class Unit {
    private id: string
    private name: string
    private defaultStatus: IStatus
    private ingameStatus: IStatus

    constructor(name: string, status: IStatus) {
        this.id = IdGenerator.getInstance().generateUnitId()
        this.name = name
        this.defaultStatus = status
    }

    public initBattleStatus(): void {
        this.ingameStatus = this.defaultStatus
    }

    public get $id(): string {
        return this.id
    }

    public get $name(): string {
        return this.name
    }

    public get $defaultStatus(): IStatus {
        return this.defaultStatus
    }

    public get $ingameStatus(): IStatus {
        return this.ingameStatus
    }
}
