import { Unit } from "../units/Unit.ts"
import { Battle } from "./Battle.ts"
import { IdGenerator } from "./IdGenerator.ts"
import { Player } from "./Player.ts"
import { assert, assertEquals, assertThrows } from "../deps.ts";

Deno.test("Players and units can join a battle", () => {
    IdGenerator.getInstance().resetCounters()
    const firstPlayer = new Player("First Player")
    firstPlayer.addUnit(new Unit("First Unit", undefined))
    firstPlayer.addUnit(new Unit("Second Unit", undefined))
    const secondPlayer = new Player("Second Player")
    secondPlayer.addUnit(new Unit("Third Unit", undefined))
    const battle: Battle = new Battle()
    battle.joinBattle(firstPlayer)
    battle.joinBattle(secondPlayer)
    assertEquals(battle.$players.size, 2)
    const playerOne = battle.$players.get("p1")
    assert(playerOne, "playerOne is undefined") 
    assertEquals(playerOne.$name, "First Player")
    const playerTwo = battle.$players.get("p2")
    assert(playerTwo, "playerTwo is undefined") 
    assertEquals(playerTwo.$name, "Second Player")
    assertEquals(battle.getUnitPlayerAssignment().size, 3)
    assertEquals(battle.getUnitFromPlayer("u1").$name, "First Unit")
    assertEquals(battle.getUnitFromPlayer("u2").$name, "Second Unit")
    assertEquals(battle.getUnitFromPlayer("u3").$name, "Third Unit")
})

Deno.test("Units can be attacked in battle", () => {
    IdGenerator.getInstance().resetCounters()
    const firstPlayer = new Player("First Player")
    firstPlayer.addUnit(new Unit("Attacking Unit", {hp: 40, atk: 20, def: 19}))
    const secondPlayer = new Player("Second Player")
    secondPlayer.addUnit(new Unit("Second Unit", {hp: 30, atk: 10, def: 10}))
    const battle: Battle = new Battle()
    battle.joinBattle(firstPlayer)
    battle.joinBattle(secondPlayer)
    battle.attackUnit("u1", "u2")
    assertEquals(battle.getUnitFromPlayer("u1").$ingameStatus, {hp: 40, atk: 20, def: 19})
    assertEquals(battle.getUnitFromPlayer("u2").$ingameStatus, {hp: 20, atk: 10, def: 10})
})

Deno.test("Error is thrown if unit player assignment does not contain given unit", () => {
    IdGenerator.getInstance().resetCounters()
    const battle: Battle = new Battle()
    assertThrows(
        (): void => {
            battle.getUnitFromPlayer("u1")
        },
        Error,
        "Unit u1 not found in unit player assignment",
    )
})

Deno.test("Error is thrown if unit player assignment has been manipulated and is broken", () => {
    IdGenerator.getInstance().resetCounters()
    const battle: Battle = new Battle()
    const originalFunction = battle.getUnitPlayerAssignment
    battle.getUnitPlayerAssignment = () => new Map( [["u1", "p1"]])
    assertThrows(
        (): void => {
            battle.getUnitFromPlayer("u1")
        },
        Error,
        "Unit u1 not found in unit list of player p1",
    )
    battle.getUnitPlayerAssignment = originalFunction
})

Deno.test("Test calculateHpAfterDamag", () => {
    IdGenerator.getInstance().resetCounters()
    assertEquals(new Battle().calculateHpAfterDamage({hp: 10, atk: 5, def: 2}, {hp: 10, atk: 2, def: 6}), 9 )
    assertEquals(new Battle().calculateHpAfterDamage({hp: 10, atk: 5, def: 2}, {hp: 10, atk: 2, def: 1}), 6)
    assertEquals(new Battle().calculateHpAfterDamage({hp: 10, atk: 15, def: 2}, {hp: 10, atk: 2, def: 1}), 0)
})
