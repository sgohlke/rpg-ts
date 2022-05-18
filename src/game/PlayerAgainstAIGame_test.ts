import { assert, assertEquals, PlayerWithUnits, PlayerAgainstAiGame } from "../index.ts"

const slimeOneUnit = { joinNumber: 1, name: "Slime", defaultStatus: {hp: 5, atk: 2, def: 1}}
const slimeTwoUnit = { joinNumber: 2, name: "Slime", defaultStatus: {hp: 6, atk: 2, def: 1}}

Deno.test("Player is correctly creaeted and added to Player list", () => {
    const game = new PlayerAgainstAiGame()
    const playerOne: PlayerWithUnits = { playerId: "doesnotmatter" , name: "Test Player", units: [slimeOneUnit, slimeTwoUnit]}

    const newPlayerId = game.createPlayer(playerOne)
    const newPlayer = game.getPlayer(newPlayerId)

    assert(newPlayer)
    assertEquals(newPlayer.playerId, newPlayerId)
    assertEquals(newPlayer.name, "Test Player")
    assertEquals(newPlayer.units, [slimeOneUnit, slimeTwoUnit])
})

Deno.test("Battle is correctly creaeted and added to Battle list", () => {
    const game = new PlayerAgainstAiGame()
    const playerOne: PlayerWithUnits = { playerId: "doesnotmatter" , name: "Test Player", units: [slimeOneUnit, slimeTwoUnit]}
    const playerTwo: PlayerWithUnits = { playerId: "doesnotmatter" , name: "AI Player", units: [slimeOneUnit, slimeTwoUnit]}

    const newPlayerOneId = game.createPlayer(playerOne)
    assertEquals(newPlayerOneId, 'p1')
    const newPlayerTwoId = game.createPlayer(playerTwo)
    assertEquals(newPlayerTwoId, 'p2')
    const battleId = game.createBattle(newPlayerOneId, newPlayerTwoId)
    assert(battleId)

    const battle = game.getBattle(battleId)
    const battleParticipants = battleId.substring(0, battleId.indexOf('_'))

    assertEquals(battleParticipants , 'p1-p2' )
    assert(battle)
    assertEquals(battle.playerOne.playerId, 'p1')
    assertEquals(battle.playerOne.name, 'Test Player')
    assertEquals(battle.playerTwo.playerId, 'p2')
    assertEquals(battle.playerTwo.name, 'AI Player')
})
