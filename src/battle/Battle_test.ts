import { assertEquals, Battle, PlayerWithUnits } from "../index.ts"

const slimeOneUnit = { joinNumber: 1, name: "Slime", defaultStatus: {hp: 5, atk: 2, def: 1}}
const slimeTwoUnit = { joinNumber: 2, name: "Slime", defaultStatus: {hp: 6, atk: 2, def: 1}}

Deno.test("Battle is correctly creaeted", () => {
    const playerOne: PlayerWithUnits = { playerId: "p1" , name: "Test Player", units: [slimeOneUnit, slimeTwoUnit]}
    const playerTwo: PlayerWithUnits = { playerId: "p2" , name: "AI Player", units: [slimeOneUnit, slimeTwoUnit]}
    const battle: Battle = { battleId: "p1-p2-1111", playerOne, playerTwo}

    assertEquals(battle.battleId, "p1-p2-1111")
    assertEquals(battle.playerOne, playerOne)
    assertEquals(battle.playerTwo, playerTwo)
})
