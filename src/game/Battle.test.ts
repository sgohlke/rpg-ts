import { Unit } from "../units/Unit"
import { Battle } from "./Battle"
import { IdGenerator } from "./IdGenerator"
import { Player } from "./Player"

beforeEach(() => {
    IdGenerator.getInstance().resetCounters()
})

test("Players and units can join a battle", () => {
    const firstPlayer = new Player("First Player")
    firstPlayer.addUnit(new Unit("First Unit", undefined))
    firstPlayer.addUnit(new Unit("Second Unit", undefined))
    const secondPlayer = new Player("Second Player")
    secondPlayer.addUnit(new Unit("Third Unit", undefined))
    const battle: Battle = new Battle()
    battle.joinBattle(firstPlayer)
    battle.joinBattle(secondPlayer)
    expect(battle.$players.size).toBe(2)
    expect(battle.$players.get("p1").$name).toBe("First Player")
    expect(battle.$players.get("p2").$name).toBe("Second Player")
    expect(battle.getUnitPlayerAssignment().size).toBe(3)
    expect(battle.getUnitFromPlayer("u1").$name).toBe("First Unit")
    expect(battle.getUnitFromPlayer("u2").$name).toBe("Second Unit")
    expect(battle.getUnitFromPlayer("u3").$name).toBe("Third Unit")
})

test("Units can be attacked in battle", () => {
    const firstPlayer = new Player("First Player")
    firstPlayer.addUnit(new Unit("Attacking Unit", {hp: 40, atk: 20, def: 19}))
    const secondPlayer = new Player("Second Player")
    secondPlayer.addUnit(new Unit("Second Unit", {hp: 30, atk: 10, def: 10}))
    const battle: Battle = new Battle()
    battle.joinBattle(firstPlayer)
    battle.joinBattle(secondPlayer)
    battle.attackUnit("u1", "u2")
    expect(battle.getUnitFromPlayer("u1").$ingameStatus).toStrictEqual({hp: 40, atk: 20, def: 19})
    expect(battle.getUnitFromPlayer("u2").$ingameStatus).toStrictEqual({hp: 20, atk: 10, def: 10})
})

test("Error is thrown if unit player assignment does not contain given unit", () => {
    const battle: Battle = new Battle()
    let thrownError: Error
    try {
        battle.getUnitFromPlayer("u1")
    } catch (error) {
        thrownError = error
    }
    expect(thrownError).toEqual(new Error("Unit u1 not found in unit player assignment"))
})

test("Error is thrown if unit player assignment has been manipulated and is broken", () => {
    const battle: Battle = new Battle()
    battle.getUnitPlayerAssignment = jest.fn(() => new Map( [["u1", "p1"]]))

    let thrownError: Error
    try {
        battle.getUnitFromPlayer("u1")
    } catch (error) {
        thrownError = error
    }
    expect(thrownError).toEqual(new Error("Unit u1 not found in unit list of player p1"))
})

describe.each`
  attackerStatus                | defenderStatus                | expectedHP
  ${{hp: 10, atk: 5, def: 2}} | ${{hp: 10, atk: 2, def: 6}} | ${9}
  ${{hp: 10, atk: 5, def: 2}} | ${{hp: 10, atk: 2, def: 1}} | ${6}
  ${{hp: 10, atk: 15, def: 2}} | ${{hp: 10, atk: 2, def: 1}} | ${0}
`("Test calculateHpAfterDamage ", ({attackerStatus, defenderStatus, expectedHP}) => {
    test(`returns ${expectedHP}`, () => {
      expect(new Battle().calculateHpAfterDamage(attackerStatus, defenderStatus)).toBe(expectedHP)
    })
  })
