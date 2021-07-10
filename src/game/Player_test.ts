import { assert, assertEquals } from "../deps.ts"
import { Unit } from "../units/Unit.ts"
import { IdGenerator } from "./IdGenerator.ts"
import { Player } from "./Player.ts"

Deno.test("Player is correctly creaeted", () => {
    IdGenerator.getInstance().resetCounters()
    const player: Player = new Player("Test Player")
    assertEquals(player.$name, "Test Player")
    assertEquals(player.$id, "p1")
})

Deno.test("Two players do have different player ids", () => {
    IdGenerator.getInstance().resetCounters()
    const firstPlayerId: string = new Player("First Player").$id
    const secondPlayerId: string = new Player("Second Player").$id
    assertEquals(firstPlayerId, "p1")
    assertEquals(secondPlayerId, "p2")
})

Deno.test("Battle status is initiated correctly", () => {
    IdGenerator.getInstance().resetCounters()
    const player: Player = new Player("Test Player")
    player.addUnit(new Unit("Test Unit", undefined))
    assertEquals(player.$units.size, 1)
    const unit = player.$units.get("u1")
    assert(unit, "unit is undefined")
    assertEquals(unit.$name, "Test Unit")
})
