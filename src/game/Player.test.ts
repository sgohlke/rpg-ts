import { Unit } from "../units/Unit";
import { IdGenerator } from "./IdGenerator";
import { Player } from "./Player"

beforeEach(() => {
    IdGenerator.getInstance().resetCounters();
});

test("Player is correctly creaeted", () => {
    const player: Player = new Player("TestPlayer")
    expect(player.$name).toBe("TestPlayer")
    expect(player.$id).toBe("p1")
})

test("Two players do have different player ids", () => {
    const firstPlayerId: string = new Player("First Player").$id
    const secondPlayerId: string = new Player("Second Player").$id
    expect(firstPlayerId).toBe("p1")
    expect(secondPlayerId).toBe("p2")
})

test("Battle status is initiated correctly", () => {
    const player: Player = new Player("TestPlayer")
    player.addUnit(new Unit("TestUnit", undefined))
    expect(player.$units.size).toBe(1)
    expect(player.$units.get("u1").$name).toBe("TestUnit")
})
