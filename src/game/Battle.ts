import { Unit } from "../units/Unit.ts"
import { Player } from "./Player.ts"

export class Battle {
    private players: Map<string, Player> = new Map()
    private unitPlayerAssignment: Map<string, string> = new Map()

    public joinBattle(player: Player): void {
        player.initBattle()
        player.$units.forEach((value) => this.getUnitPlayerAssignment().set(value.$id, player.$id))
        this.players.set(player.$id, player)
    }

    public attackUnit(attackerUnitId: string, defenderUnitId: string): void {
        const attacker: Unit = this.getUnitFromPlayer(attackerUnitId)
        const defender: Unit = this.getUnitFromPlayer(defenderUnitId)
        defender.$ingameStatus.hp = this.calculateHpAfterDamage(attacker.$ingameStatus, defender.$ingameStatus)
    }

    public calculateHpAfterDamage(attackerIngameStatus: IStatus, defenderIngameStatus: IStatus): number {
        const damage: number = defenderIngameStatus.def > attackerIngameStatus.atk ? 1
        : attackerIngameStatus.atk - defenderIngameStatus.def
        return damage > defenderIngameStatus.hp ? 0 : defenderIngameStatus.hp - damage
    }

    /**
     * Getter $players
     * @return {Map<string, Player> }
     */
    public get $players(): Map<string, Player>  {
        return this.players
    }

    /**
     * Getter $units
     * @return {Map<string, string> }
     */
    public getUnitPlayerAssignment(): Map<string, string>  {
        return this.unitPlayerAssignment
    }

    public getUnitFromPlayer(unitId: string): Unit {
        if (unitId && this.getUnitPlayerAssignment().has(unitId) ) {
            const playerId = this.getUnitPlayerAssignment().get(unitId)
            if (playerId && this.players.has(playerId)) {
                const player = this.players.get(playerId)
                if (player && player.$units && player.$units.has(unitId)) {
                    const unit = player.$units.get(unitId)
                    if (unit) {
                        return unit;
                    }
                }
            }
            throw new Error(`Unit ${unitId} not found in unit list of player ${playerId}`)
        }
        throw new Error(`Unit ${unitId} not found in unit player assignment`)
    }
}
