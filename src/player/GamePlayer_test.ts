import { assert, assertEquals, GamePlayer } from "../index.ts"

Deno.test("GamePlayer is correctly created", () => {
    const player: GamePlayer = new GamePlayer({ playerId: "p1" , name: "Test Player"})
    assertEquals(player.playerId, "p1")
    assertEquals(player.name, "Test Player")
    assertEquals(player.units.length, 0)
})

Deno.test("Correct unit is added to GamePlayer", () => {
    const player: GamePlayer = new GamePlayer({ playerId: "p1" , name: "Test Player"})
    const newUnitId = player.addUnit({ joinNumber: 1, name: "Slime", defaultStatus: {hp: 5, atk: 2, def: 1}})
    assertEquals(player.units.length, 1)
    const newUnit = player.getUnit(newUnitId)
    assert(newUnit)
    assertEquals(newUnit.joinNumber, newUnitId)
    assertEquals(newUnit.name, "Slime")
    assertEquals(newUnit.defaultStatus, {hp: 5, atk: 2, def: 1})
})