import { assertEquals } from "../deps.ts"
import { IdGenerator } from "../game/IdGenerator.ts"
import {Unit} from "./Unit.ts"

Deno.test("Unit is correctly creaeted", () => {
    IdGenerator.getInstance().resetCounters()
    const unit: Unit = new Unit("Test Unit", {hp: 20, atk: 10, def: 9})
    assertEquals(unit.$name, "Test Unit")
    assertEquals(unit.$id, "u1")
    assertEquals(unit.$defaultStatus, {hp: 20, atk: 10, def: 9})
})

Deno.test("Two units do have different unit ids", () => {
    IdGenerator.getInstance().resetCounters()
    const firstUnitId: string = new Unit("First Unit", {hp: 20, atk: 10, def: 9}).$id
    const secondUnitId: string = new Unit("Second Unit", {hp: 20, atk: 10, def: 9}).$id
    assertEquals(firstUnitId, "u1")
    assertEquals(secondUnitId, "u2")
})

Deno.test("Battle status is initiated correctly", () => {
    IdGenerator.getInstance().resetCounters()
    const unit: Unit = new Unit("Test Unit", {hp: 20, atk: 10, def: 9})
    unit.initBattleStatus()
    assertEquals(unit.$ingameStatus, {hp: 20, atk: 10, def: 9})
})
