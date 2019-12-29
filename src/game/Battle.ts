import { Unit } from "../units/Unit";
import { Player } from "./Player";

export class Battle {
    private players: Map<string, Player> = new Map()
    private units: Map<string, Unit> = new Map()

    public joinBattle(player: Player): void {
        player.initBattle()
        player.$units.forEach((value, key) => this.units.set(key, value));
        this.players.set(player.$id, player)
    }

    public attackUnit(attackerUnitId: string, defenderUnitId: string): void {
        const attacker: Unit = this.units.get(attackerUnitId)
        const defender: Unit = this.units.get(defenderUnitId)
        defender.$ingameStatus.hp = defender.$ingameStatus.hp
        - (attacker.$ingameStatus.atk - defender.$ingameStatus.def)
    }

    /**
     * Getter $players
     * @return {Map<string, Player> }
     */
    public get $players(): Map<string, Player>  {
        return this.players;
    }

    /**
     * Getter $units
     * @return {Map<String, Unit> }
     */
    public get $units(): Map<string, Unit>  {
        return this.units;
    }
}
