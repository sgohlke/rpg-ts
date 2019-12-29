import { Unit } from "../units/Unit";
import { Battle } from "./Battle";
import { IdGenerator } from "./IdGenerator";
import { Player } from "./Player";

beforeEach(() => {
    IdGenerator.getInstance().resetCounters();
});

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
    expect(battle.$units.size).toBe(3)
    expect(battle.$units.get("u1").$name).toBe("First Unit")
    expect(battle.$units.get("u2").$name).toBe("Second Unit")
    expect(battle.$units.get("u3").$name).toBe("Third Unit")
})

test("Units can be attacked in battle", () => {
    const firstPlayer = new Player("First Player")
    firstPlayer.addUnit(new Unit("Attacking Unit", {hp: 40, atk: 20, def: 19}))
    const secondPlayer = new Player("Second Player")
    secondPlayer.addUnit(new Unit("Second Unit", {hp: 30, atk: 10, def: 10}))
    const battle: Battle = new Battle()
    battle.joinBattle(firstPlayer)
    battle.joinBattle(secondPlayer)
    battle.attackUnit("u1", "u2");
    expect(battle.$units.get("u1").$ingameStatus).toStrictEqual({hp: 40, atk: 20, def: 19})
    expect(battle.$units.get("u2").$ingameStatus).toStrictEqual({hp: 20, atk: 10, def: 10})
})
