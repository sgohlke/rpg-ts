import { assert, assertEquals, assertThrows } from '../deps.ts'

import {
   Battle,
   BattleStatus,
   GamePlayer,
   getDefaultUnit,
   InMemoryPlayerDataStore,
   noCounterAttackFunction,
   PlayerAgainstAIGame,
   randomCounterAttackFunction,
} from '../index.ts'

const slimeUnit = getDefaultUnit('1')
const parentSlimeUnit = getDefaultUnit('2')
const unitDefender = getDefaultUnit('3')
const punchbagUnit = getDefaultUnit('4')
const looserUnit = getDefaultUnit('5')

Deno.test('Battle is correctly created and added to Battle list', () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)
   playerOne.addUnit(parentSlimeUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'AI Player',
   })
   playerTwo.addUnit(slimeUnit)
   playerTwo.addUnit(parentSlimeUnit)

   const { battleId, battle } = createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
   )
   const battleParticipants = battleId.substring(0, battleId.indexOf('_'))

   assertEquals(battleParticipants, 'p1-p2')
   assert(battle)
   assertEquals(battle.playerOne.playerId, 'p1')
   assertEquals(battle.playerOne.name, 'Test Player')
   assertEquals(battle.playerTwo.playerId, 'p2')
   assertEquals(battle.playerTwo.name, 'AI Player')
})

Deno.test('Battle is not created and not added to Battle list if one player is not found in player list', () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)
   playerOne.addUnit(parentSlimeUnit)
   const newPlayerOneId = playerDataStore.createPlayer(playerOne)
   assertEquals(newPlayerOneId, 'p1')
   const game = new PlayerAgainstAIGame(playerDataStore)
   const newPlayerTwoId = 'pdoesnotexist'
   const battleId = game.createBattle(newPlayerOneId, newPlayerTwoId)
   assertEquals(battleId, undefined)
})

Deno.test('Attack in battle is performed correctly', () => {
   // Given
   const playerDataStore = new InMemoryPlayerDataStore()
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)
   playerOne.addUnit(parentSlimeUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'AI Player',
   })
   playerTwo.addUnit(slimeUnit)
   playerTwo.addUnit(parentSlimeUnit)

   const { battleId, battle } = createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
   )
   const initialEnemyHP = slimeUnit.defaultStatus.hp
   const playerTwoSlimeUnit = battle.playerTwo.getUnitInBattle(1)
   assert(playerTwoSlimeUnit)
   assertEquals(playerTwoSlimeUnit.defaultStatus.hp, initialEnemyHP)

   // When
   const battleAfterAttack = game.attack(battleId, 1, 1)

   // Then
   assert(battleAfterAttack)

   const defendingUnitHPAfterAttack = playerTwoSlimeUnit.inBattleStatus.hp
   assertEquals(defendingUnitHPAfterAttack, initialEnemyHP - 1)

   // Assert that initial unit default hp did not change after attack in battle
   const secondPlayer = playerDataStore.getPlayer('p2')
   assert(secondPlayer)
   const defendingUnitDefaultHP = playerTwoSlimeUnit.defaultStatus.hp
   assertEquals(defendingUnitDefaultHP, playerTwoSlimeUnit.defaultStatus.hp)
})

Deno.test('GetBattle will throw error if not matching battle for battleId id found', () => {
   // Given
   const game = new PlayerAgainstAIGame(new InMemoryPlayerDataStore())

   // When/Then: Attack punchbag with 0 HP again, throws error
   assertThrows(
      (): void => {
         game.attack('doesnotexist', 1, 1)
      },
      Error,
      'Battle for battleId doesnotexist was not found!',
   )
})

Deno.test('Attack in battle is performed correctly and deals at least 1 HP as damage', () => {
   // Given
   const playerDataStore = new InMemoryPlayerDataStore()
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)
   playerOne.addUnit(parentSlimeUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'AI Player',
   })
   playerTwo.addUnit(unitDefender)
   playerTwo.addUnit(parentSlimeUnit)

   const { battleId, battle } = createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
   )
   const initialEnemyHP = unitDefender.defaultStatus.hp
   const playerTwoDefenderUnit = battle.playerTwo.getUnitInBattle(1)
   assert(playerTwoDefenderUnit)
   assertEquals(playerTwoDefenderUnit.defaultStatus.hp, initialEnemyHP)

   // When
   const battleAfterAttack = game.attack(battleId, 1, 1)

   // Then
   assert(battleAfterAttack)
   const defendingUnitHPAfterAttack = playerTwoDefenderUnit.inBattleStatus.hp
   assertEquals(defendingUnitHPAfterAttack, initialEnemyHP - 1)

   // Assert that initial unit default hp did not change after attack in battle
   const secondPlayer = playerDataStore.getPlayer('p2')
   assert(secondPlayer)
   const defendingUnitDefaultHP = playerTwoDefenderUnit.defaultStatus.hp
   assertEquals(defendingUnitDefaultHP, playerTwoDefenderUnit.defaultStatus.hp)
})

Deno.test('Battle has ended and proper winner is determined if Player defeats AI', () => {
   // Given
   const playerDataStore = new InMemoryPlayerDataStore()
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   playerOne.addUnit(parentSlimeUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
   })
   playerTwo.addUnit(slimeUnit)
   playerTwo.addUnit(punchbagUnit)

   const { battleId } = createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
   )

   // When: Attack once to defeat punchbag
   const battleAfterPunchbagDefeated = game.attack(battleId, 1, 2)
   assert(battleAfterPunchbagDefeated)

   // Then: punchbag has 0 hp, but player two is not yet defeated, battle is still active and no winner has been determined
   const punchBagAfterBattle = battleAfterPunchbagDefeated.playerTwo
      .getUnitInBattle(2)
   assert(punchBagAfterBattle)
   assertEquals(punchBagAfterBattle.inBattleStatus.hp, 0)
   assertEquals(battleAfterPunchbagDefeated.playerTwo.isDefeated(), false)
   assertEquals(battleAfterPunchbagDefeated.battleStatus, BattleStatus.ACTIVE)
   assertEquals(battleAfterPunchbagDefeated.battleWinner, undefined)

   // When: Attack enemy slime unit 4 times
   let battleAfterSlimeDefeated: Battle | undefined =
      battleAfterPunchbagDefeated
   for (let index = 0; index < 4; index++) {
      const unitTwoCurrentHP = battleAfterPunchbagDefeated.playerOne
         .getUnitInBattle(1)
         ?.inBattleStatus.hp
      assert(unitTwoCurrentHP)
      battleAfterSlimeDefeated = game.attack(battleId, 1, 1)
      const counterAttackTarget = battleAfterSlimeDefeated?.counterAttackUnits
         ?.counterTarget
      assert(counterAttackTarget)
      assertEquals(counterAttackTarget.joinNumber, 1)
      // Then: counter attack target should have one HP less than before
      assertEquals(counterAttackTarget.inBattleStatus.hp, unitTwoCurrentHP - 1)
   }

   // Attack final time to defeat slime. No counterattack should be triggered
   battleAfterSlimeDefeated = game.attack(battleId, 1, 1)
   const counterAttackTarget = battleAfterSlimeDefeated?.counterAttackUnits
      ?.counterTarget
   assertEquals(counterAttackTarget, undefined)

   assert(battleAfterSlimeDefeated)
   // Then: slime has 0 hp, player two is defeated and battle has ended
   const slimeAfterBattle = battleAfterSlimeDefeated.playerTwo.getUnitInBattle(
      1,
   )
   assert(slimeAfterBattle)
   assertEquals(slimeAfterBattle.inBattleStatus.hp, 0)
   assertEquals(battleAfterSlimeDefeated.playerTwo.isDefeated(), true)
   assertEquals(battleAfterSlimeDefeated.battleStatus, BattleStatus.ENDED)
   assertEquals(
      battleAfterSlimeDefeated.battleWinner,
      battleAfterSlimeDefeated.playerOne,
   )
})

Deno.test('Player cannot attack unit with 0 HP', () => {
   // Given
   const playerDataStore = new InMemoryPlayerDataStore()
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)
   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
   })
   playerTwo.addUnit(punchbagUnit)
   playerTwo.addUnit(slimeUnit)

   const { battleId } = createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
   )

   // When: Attack once to defeat punchbag
   const battleAfterPunchbagDefeated = game.attack(battleId, 1, 1)
   assert(battleAfterPunchbagDefeated)

   // Then: punchbag has 0 hp, but player two is not yet defeated, battle is still active and no winner has been determined
   const punchBagAfterBattle = battleAfterPunchbagDefeated.playerTwo
      .getUnitInBattle(1)
   assert(punchBagAfterBattle)
   assertEquals(punchBagAfterBattle.inBattleStatus.hp, 0)

   // When/Then: Attack punchbag with 0 HP again, throws error
   assertThrows(
      (): void => {
         game.attack(battleId, 1, 1)
      },
      Error,
      'Cannot attack a unit that has already been defeated',
   )
})

Deno.test('Player cannot attack unit with 0 HP', () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   // Given
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   playerOne.addUnit(looserUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
   })
   playerTwo.addUnit(punchbagUnit)

   const { battleId } = createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
   )

   // When/Then: Attack punchbag with 0 HP again, throws error
   assertThrows(
      (): void => {
         game.attack(battleId, 1, 1)
      },
      Error,
      'Cannot attack with a unit with 0 HP',
   )
})

Deno.test('Enemy player does not counterattack if NO_COUNTER_ATTACK strategy is used', () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   // Given
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
   })
   playerTwo.addUnit(slimeUnit)

   const { battleId } = createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      noCounterAttackFunction,
   )

   const battle = game.attack(battleId, 1, 1)
   const counterAttackTarget = battle?.counterAttackUnits?.counterTarget
   assertEquals(counterAttackTarget, undefined)
})

Deno.test('Player looses battle against AI', () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   // Given
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   playerOne.addUnit(punchbagUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
   })
   playerTwo.addUnit(slimeUnit)

   const { battleId } = createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
   )

   const battle = game.attack(battleId, 1, 1)
   assert(battle)
   assertEquals(battle.playerOne.isDefeated(), true)
   assertEquals(battle.battleStatus, BattleStatus.ENDED)
   assertEquals(
      battle.battleWinner,
      battle.playerTwo,
   )
})

Deno.test('Cannot attack in battle that has already ended', () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   // Given
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
   })
   playerTwo.addUnit(punchbagUnit)

   const { battleId } = createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
   )

   const battle = game.attack(battleId, 1, 1)
   assert(battle)
   assertEquals(battle.playerTwo.isDefeated(), true)
   assertEquals(battle.battleStatus, BattleStatus.ENDED)
   assertEquals(
      battle.battleWinner,
      battle.playerOne,
   )

   // When/Then: Attack not possible if battle has ended, throws error
   assertThrows(
      (): void => {
         game.attack(battleId, 1, 4)
      },
      Error,
      'Cannot attack in a battle that has already ended',
   )
})

Deno.test('Cannot attack if attacker or defender unit is not found', () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   // Given
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
   })
   playerTwo.addUnit(punchbagUnit)

   const { battleId } = createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
   )

   // When/Then: Attack not possible if attacker not found, throws error
   assertThrows(
      (): void => {
         game.attack(battleId, 15, 4)
      },
      Error,
      'Cannot attack, did not find attacker unit with join number 15',
   )

   // When/Then: Attack not possible if defender not found, throws error
   assertThrows(
      (): void => {
         game.attack(battleId, 1, 27)
      },
      Error,
      'Cannot attack, did not find defender unit with join number 27',
   )
})

Deno.test('PlayerAccount is correctly created and added to PlayerAccount map', async () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)
   playerOne.addUnit(parentSlimeUnit)

   const newPlayerId = await game.registerPlayer(
      playerOne,
      'Test Player',
      'tp',
      '12345',
   )
   assertEquals(newPlayerId, 'p1')

   const playerAccount = playerDataStore.getPlayerAccount(newPlayerId)
   assert(playerAccount)
   assertEquals(playerAccount.playerId, newPlayerId)
   assertEquals(playerAccount.name, 'Test Player')
   assertEquals(playerAccount.userName, 'tp')
   assertEquals(
      playerAccount.userPassword,
      '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
   )
})

Deno.test(
   'Login is working if correct username and password are provided ' +
      'and a battle can be created and accessed for the registered player',
   async () => {
      const playerDataStore = new InMemoryPlayerDataStore()
      const game = new PlayerAgainstAIGame(playerDataStore)
      const playerOne: GamePlayer = new GamePlayer({
         playerId: 'doesnotmatter',
         name: 'Test Player',
      })
      playerOne.addUnit(slimeUnit)
      playerOne.addUnit(parentSlimeUnit)

      const newPlayerId = await game.registerPlayer(
         playerOne,
         'Test Player',
         'tp',
         '12345',
      )
      assertEquals(newPlayerId, 'p1')

      game.login('tp', '12345')
         .then((loggedInPlayer) => {
            assert(loggedInPlayer)
            assertEquals(loggedInPlayer.name, 'Test Player')
            assertEquals(loggedInPlayer.userName, 'tp')
            assertEquals(loggedInPlayer.playerId, 'p1')
            assert(loggedInPlayer.accessToken)

            const playerTwo: GamePlayer = new GamePlayer({
               playerId: 'doesnotmatter',
               name: 'AI Player',
            })
            playerTwo.addUnit(slimeUnit)
            playerTwo.addUnit(parentSlimeUnit)

            const { battleId, battle } = createNonTutorialBattle(
               playerDataStore,
               game,
               newPlayerId,
               loggedInPlayer.accessToken,
               playerTwo,
               randomCounterAttackFunction,
            )
            assert(battle)
            assertEquals(battle.isTutorialBattle, false)

            //When/Then: If accessToken is wrong, getBattle should return undefined
            assert(battleId)
            const battleWhenWrongToken = game.getBattle(battleId, 'wrongToken')
            assert(!battleWhenWrongToken)
            assert(battleId)

            // When/Then: Attacking without access token will return missing access token error
            assertThrows(
               (): void => {
                  game.attack(battleId, 1, 1)
               },
               Error,
               'Access token needs to be provided in order to get battle',
            )
            assert(battleId)

            // When: Attacking with accessToken
            const battleAfterAttack = game.attack(
               battleId,
               1,
               1,
               loggedInPlayer.accessToken,
            )
            // Then: Attack is successful, does not throw error
            assert(battleAfterAttack)
         })
         .catch((err) => {
            assertEquals(err.message, 'Should not throw error, see above')
         })
   },
)

Deno.test('Login throws error if matching PlayerAccount is not available', async () => {
   const game = new PlayerAgainstAIGame(new InMemoryPlayerDataStore())
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)
   playerOne.addUnit(parentSlimeUnit)

   const newPlayerId = await game.registerPlayer(
      playerOne,
      'Test Player',
      'tp',
      '12345',
   )
   assertEquals(newPlayerId, 'p1')
   try {
      await game.login('doesnotexists', 'doesnotmatter')
   } catch (error) {
      assertEquals(error.message, 'Login failed! Invalid credentials')
   }
})

Deno.test('isAuthorizedPlayer will throw error if not accessToken is provided', () => {
   // Given
   const game = new PlayerAgainstAIGame(new InMemoryPlayerDataStore())

   // When/Then: Attack punchbag with 0 HP again, throws error
   assertThrows(
      (): void => {
         game.isAuthorizedPlayer('p1', '')
      },
      Error,
      'Access Token for player p1 has to be provided.',
   )
})

Deno.test('isAuthorizedPlayer will throw error if accessToken for player is not available', () => {
   // Given
   const game = new PlayerAgainstAIGame(new InMemoryPlayerDataStore())

   // When/Then: Attack punchbag with 0 HP again, throws error
   assertThrows(
      (): void => {
         game.isAuthorizedPlayer('p1', 'doesnotmatter')
      },
      Error,
      'Did not find access token for player p1',
   )
})

Deno.test('Login throws error if password is wrong', async () => {
   const game = new PlayerAgainstAIGame(new InMemoryPlayerDataStore())
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)
   playerOne.addUnit(parentSlimeUnit)

   const newPlayerId = await game.registerPlayer(
      playerOne,
      'Test Player',
      'tp',
      '12345',
   )
   assertEquals(newPlayerId, 'p1')
   try {
      await game.login('tp', 'wrongPassword')
   } catch (error) {
      assertEquals(error.message, 'Login failed! Invalid credentials')
   } 
})

function createBattle(
   playerDataStore: InMemoryPlayerDataStore,
   game: PlayerAgainstAIGame,
   playerOne: GamePlayer,
   playerTwo: GamePlayer,
   playerTwoCounterAttackStrategy = randomCounterAttackFunction,
): { battleId: string; battle: Battle } {
   const newPlayerOneId = playerDataStore.createPlayer(playerOne)
   assertEquals(newPlayerOneId, 'p1')
   const newPlayerTwoId = playerDataStore.createPlayer(playerTwo)
   assertEquals(newPlayerTwoId, 'p2')
   const battleId = game.createBattle(
      newPlayerOneId,
      newPlayerTwoId,
      playerTwoCounterAttackStrategy,
   )
   assert(battleId)

   const battle = game.getBattle(battleId)
   assert(battle)
   return { battleId, battle }
}

function createNonTutorialBattle(
   playerDataStore: InMemoryPlayerDataStore,
   game: PlayerAgainstAIGame,
   playerOneId: string | undefined,
   playerOneAccessToken: string | undefined,
   playerTwo: GamePlayer,
   playerTwoCounterAttackStrategy = randomCounterAttackFunction,
): { battleId: string | undefined; battle: Battle | undefined } {
   const newPlayerTwoId = playerDataStore.createPlayer(playerTwo)
   assert(newPlayerTwoId)
   const battleId = game.createBattle(
      playerOneId,
      newPlayerTwoId,
      playerTwoCounterAttackStrategy,
      false,
      playerOneAccessToken,
   )

   if (battleId) {
      const battle = game.getBattle(battleId, playerOneAccessToken)
      assert(battle)
      return { battleId, battle }
   }
   return { battleId: undefined, battle: undefined }
}

Deno.test('An error is thrown if userName already exists and register is called', async () => {
   const game = new PlayerAgainstAIGame(new InMemoryPlayerDataStore())
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)
   playerOne.addUnit(parentSlimeUnit)

   const newPlayerId = await game.registerPlayer(
      playerOne,
      'Test Player',
      'tp',
      '12345',
   )
   assertEquals(newPlayerId, 'p1')
   try {
      await game.registerPlayer(playerOne, 'Another Player', 'tp', '12345687')
   } catch (error) {
      assertEquals(
         error.message,
         'Cannot register user "tp", the username already exists',
      )
   }
})

Deno.test(
   'An error is thrown if a non-tutorial battle is created and no ' +
      'playerOneAccessToken is provided',
   async () => {
      const playerDataStore = new InMemoryPlayerDataStore()
      const game = new PlayerAgainstAIGame(playerDataStore)
      const playerOne: GamePlayer = new GamePlayer({
         playerId: 'doesnotmatter',
         name: 'Test Player',
      })
      playerOne.addUnit(slimeUnit)
      playerOne.addUnit(parentSlimeUnit)

      const newPlayerId = await game.registerPlayer(
         playerOne,
         'Test Player',
         'tp',
         '12345',
      )
      assertEquals(newPlayerId, 'p1')

      const playerTwo: GamePlayer = new GamePlayer({
         playerId: 'doesnotmatter',
         name: 'AI Player',
      })
      playerTwo.addUnit(slimeUnit)
      playerTwo.addUnit(parentSlimeUnit)

      assertThrows(
         (): void => {
            createNonTutorialBattle(
               playerDataStore,
               game,
               newPlayerId,
               undefined,
               playerTwo,
               randomCounterAttackFunction,
            )
         },
         Error,
         'Access token needs to be provided in order to create a non-tutorial battle',
      )
   },
)

Deno.test(
   'An error is thrown if a non-tutorial battle is created and no ' +
      'playerOneId is provided',
   async () => {
      const playerDataStore = new InMemoryPlayerDataStore()
      const game = new PlayerAgainstAIGame(playerDataStore)
      const playerOne: GamePlayer = new GamePlayer({
         playerId: 'doesnotmatter',
         name: 'Test Player',
      })
      playerOne.addUnit(slimeUnit)
      playerOne.addUnit(parentSlimeUnit)

      const newPlayerId = await game.registerPlayer(
         playerOne,
         'Test Player',
         'tp',
         '12345',
      )
      assertEquals(newPlayerId, 'p1')

      const playerTwo: GamePlayer = new GamePlayer({
         playerId: 'doesnotmatter',
         name: 'AI Player',
      })
      playerTwo.addUnit(slimeUnit)
      playerTwo.addUnit(parentSlimeUnit)

      assertThrows(
         (): void => {
            createNonTutorialBattle(
               playerDataStore,
               game,
               undefined,
               'doesnotmatter',
               playerTwo,
               randomCounterAttackFunction,
            )
         },
         Error,
         'playerOneId needs to be provided to create non-tutorial battle.',
      )
   },
)

Deno.test(
   'An error is thrown if a non-tutorial battle is created and wrong ' +
      'playerOneAccessToken is provided',
   async () => {
      const playerDataStore = new InMemoryPlayerDataStore()
      const game = new PlayerAgainstAIGame(playerDataStore)
      const playerOne: GamePlayer = new GamePlayer({
         playerId: 'doesnotmatter',
         name: 'Test Player',
      })
      playerOne.addUnit(slimeUnit)
      playerOne.addUnit(parentSlimeUnit)

      const newPlayerId = await game.registerPlayer(
         playerOne,
         'Test Player',
         'tp',
         '12345',
      )
      assertEquals(newPlayerId, 'p1')

      const playerTwo: GamePlayer = new GamePlayer({
         playerId: 'doesnotmatter',
         name: 'AI Player',
      })
      playerTwo.addUnit(slimeUnit)
      playerTwo.addUnit(parentSlimeUnit)

      //Login so playerOne would have accessToken available
      await game.login('tp', '12345')

      assertThrows(
         (): void => {
            createNonTutorialBattle(
               playerDataStore,
               game,
               newPlayerId,
               'wrongToken',
               playerTwo,
               randomCounterAttackFunction,
            )
         },
         Error,
         'Non-tutorial battle cannot be created. Reason: Invalid credentials',
      )
   },
)
