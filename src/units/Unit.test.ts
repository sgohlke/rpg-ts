import { IdGenerator } from "../game/IdGenerator"
import {Unit} from "./Unit"

beforeEach(() => {
    IdGenerator.getInstance().resetCounters()
})

test("Unit is correctly creaeted", () => {
    const unit: Unit = new Unit("Test Unit", {hp: 20, atk: 10, def: 9})
    expect(unit.$name).toBe("Test Unit")
    expect(unit.$id).toBe("u1")
    expect(unit.$defaultStatus).toStrictEqual({hp: 20, atk: 10, def: 9})
})

test("Two units do have different unit ids", () => {
    const firstUnitId: string = new Unit("First Unit", {hp: 20, atk: 10, def: 9}).$id
    const secondUnitId: string = new Unit("Second Unit", {hp: 20, atk: 10, def: 9}).$id
    expect(firstUnitId).toBe("u1")
    expect(secondUnitId).toBe("u2")
})

test("Battle status is initiated correctly", () => {
    const unit: Unit = new Unit("Test Unit", {hp: 20, atk: 10, def: 9})
    unit.initBattleStatus()
    expect(unit.$ingameStatus).toStrictEqual({hp: 20, atk: 10, def: 9})
})
