import { assert, assertEquals, getDefaultUnit, GamePlayer, PlayerAgainstAIGame } from "../index.ts"

const unitOne = getDefaultUnit('1')
const unitTwo = getDefaultUnit('2')

Deno.test("Player is correctly creaeted and added to Player list", () => {
    const game = new PlayerAgainstAIGame()
    const playerOne: GamePlayer = new GamePlayer({ playerId: "doesnotmatter" , 
        name: "Test Player", 
        units: [unitOne, unitTwo]})

    const newPlayerId = game.createPlayer(playerOne)
    assertEquals(newPlayerId, 'p1')

    const newPlayer = game.getPlayer(newPlayerId)
    assert(newPlayer)
    assertEquals(newPlayer.playerId, newPlayerId)
    assertEquals(newPlayer.name, "Test Player")
    assertEquals(newPlayer.units, [unitOne, unitTwo])
})

Deno.test("Battle is correctly creaeted and added to Battle list", () => {
    const game = new PlayerAgainstAIGame()
    const playerOne: GamePlayer = new GamePlayer({ playerId: "doesnotmatter" , name: "Test Player", units: [unitOne, unitTwo]})
    const playerTwo: GamePlayer = new GamePlayer({ playerId: "doesnotmatter" , name: "AI Player", units: [unitOne, unitTwo]})

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


Deno.test("Attack in battle is performed correctly", () => {
    const game = new PlayerAgainstAIGame()
    const playerOne: GamePlayer = new GamePlayer({ playerId: "doesnotmatter" , name: "Test Player", units: [unitOne, unitTwo]})
    const playerTwo: GamePlayer = new GamePlayer({ playerId: "doesnotmatter" , name: "AI Player", units: [unitOne, unitTwo]})

    const newPlayerOneId = game.createPlayer(playerOne)
    const newPlayerTwoId = game.createPlayer(playerTwo)
    const battleId = game.createBattle(newPlayerOneId, newPlayerTwoId)
    assert(battleId)

    const battle = game.getBattle(battleId)
    const initialEnemyHP = unitOne.defaultStatus.hp
    assert(battle)
    assertEquals(battle.playerTwo.units[0].defaultStatus.hp, initialEnemyHP )

    const battleAfterAttack = game.attack(battleId, 1, 1)
    assert(battleAfterAttack)
    assertEquals(battleAfterAttack.playerTwo.units[0].defaultStatus.hp, initialEnemyHP - 1 )
})