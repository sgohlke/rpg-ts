import { PlayerUnit } from '../battle/PlayerUnit.ts'
import { assert, assertEquals, fail } from '../deps.ts'

import {
   Battle,
   BattleStatus,
   GamePlayer,
   GeneralError,
   getDefaultUnit,
   InMemoryPlayerDataStore,
   noCounterAttackFunction,
   PlayerAgainstAIGame,
   randomCounterAttackFunction,
   shortBattleAction,
   SPDTurnBar,
   TurnBar,
} from '../index.ts'

const slimeUnit = getDefaultUnit('1')
const parentSlimeUnit = getDefaultUnit('2')
const unitDefender = getDefaultUnit('3')
const punchbagUnit = getDefaultUnit('4')

Deno.test('Battle is correctly created and added to Battle list', async () => {
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

   const { battleId, battle } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      randomCounterAttackFunction,
   )
   assert(battle)
   if (typeof battleId === 'string' && 'battleId' in battle) {
      const battleParticipants = battleId.substring(0, battleId.indexOf('_'))

      assertEquals(battleParticipants, 'p1-p2')
      assert(battle)
      assertEquals(battle.playerOne.playerId, 'p1')
      assertEquals(battle.playerOne.name, 'Test Player')
      assertEquals(battle.playerTwo.playerId, 'p2')
      assertEquals(battle.playerTwo.name, 'AI Player')
   } else {
      fail('Should not reach this!')
   }
})

Deno.test('Battle is not created and not added to Battle list if one player is not found in player list', async () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)
   playerOne.addUnit(parentSlimeUnit)

   const newPlayerOnePlayerId = await playerDataStore.addPlayerAccount({
      playerId: 'new',
      name: playerOne.name,
      userName: playerOne.name,
      userPassword: 'doesnotmatter',
   })
   if (typeof newPlayerOnePlayerId === 'string') {
      playerOne.playerId = newPlayerOnePlayerId
      const newPlayerOneId = await playerDataStore.createPlayer(playerOne)
      if (typeof newPlayerOneId === 'string') {
         assertEquals(newPlayerOneId, 'p1')
         const game = new PlayerAgainstAIGame(playerDataStore)
         const newPlayerTwoId = 'pdoesnotexist'
         const battleId = await game.createBattle({
            playerOneId: newPlayerOneId,
            playerTwoId: newPlayerTwoId,
            turnBar: new SPDTurnBar(),
         })
         assertEquals(battleId, undefined)
      } else {
         fail('Should not reach here!')
      }
   } else {
      fail('Should not reach here!')
   }
})

Deno.test('Attack in battle is performed correctly', async () => {
   // Given
   const playerDataStore = new InMemoryPlayerDataStore()
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(parentSlimeUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'AI Player',
   })
   playerTwo.addUnit(slimeUnit)

   const { battleId, battle } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      randomCounterAttackFunction,
   )

   assert(battle)
   if (typeof battleId === 'string' && 'battleId' in battle) {
      const initialEnemyHP = slimeUnit.defaultStatus.hp
      const playerTwoSlimeUnit = battle.playerTwo.getUnitInBattle(1)
      assert(playerTwoSlimeUnit)
      assertEquals(playerTwoSlimeUnit.defaultStatus.hp, initialEnemyHP)

      // When
      const battleAfterAttack = await game.attack(battleId, 1, 1)

      // Then
      assert(battleAfterAttack)
      assertEquals('battleId' in battleAfterAttack, true)
      const defendingUnitHPAfterAttack = playerTwoSlimeUnit.inBattleStatus.hp
      assertEquals(defendingUnitHPAfterAttack, initialEnemyHP - 1)

      // Assert that initial unit default hp did not change after attack in battle
      const secondPlayer = playerDataStore.getPlayer('p2')
      assert(secondPlayer)
      const defendingUnitDefaultHP = playerTwoSlimeUnit.defaultStatus.hp
      assertEquals(defendingUnitDefaultHP, playerTwoSlimeUnit.defaultStatus.hp)
   } else {
      fail('Should not reach this!')
   }
})

Deno.test('GetBattle will throw error if not matching battle for battleId id found', async () => {
   // Given
   const game = new PlayerAgainstAIGame(new InMemoryPlayerDataStore())

   // When/Then: Attack punchbag with 0 HP again, throws error
   const errorMessage = await game.attack('doesnotexist', 1, 1)
   assert(errorMessage)
   assertEquals(
      (errorMessage as GeneralError).errorMessage,
      'Battle for battleId doesnotexist was not found!',
   )
})

Deno.test('Attack in battle is performed correctly and deals at least 1 HP as damage', async () => {
   // Given
   const playerDataStore = new InMemoryPlayerDataStore()
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'AI Player',
   })
   playerTwo.addUnit(unitDefender)

   const { battleId, battle } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      randomCounterAttackFunction,
   )
   assert(battle)
   if (typeof battleId === 'string' && 'battleId' in battle) {
      const initialEnemyHP = unitDefender.defaultStatus.hp
      const playerTwoDefenderUnit = battle.playerTwo.getUnitInBattle(1)
      assert(playerTwoDefenderUnit)
      assertEquals(playerTwoDefenderUnit.defaultStatus.hp, initialEnemyHP)

      // When
      const battleAfterAttack = await game.attack(battleId, 1, 1)

      // Then
      assert(battleAfterAttack)
      assertEquals('battleId' in battleAfterAttack, true)
      const defendingUnitHPAfterAttack = playerTwoDefenderUnit.inBattleStatus.hp
      assertEquals(defendingUnitHPAfterAttack, initialEnemyHP - 1)

      // Assert that initial unit default hp did not change after attack in battle
      const secondPlayer = playerDataStore.getPlayer('p2')
      assert(secondPlayer)
      const defendingUnitDefaultHP = playerTwoDefenderUnit.defaultStatus.hp
      assertEquals(
         defendingUnitDefaultHP,
         playerTwoDefenderUnit.defaultStatus.hp,
      )
   } else {
      fail('Should not reach this!')
   }
})

Deno.test('Battle has ended and proper winner is determined if Player defeats AI', async () => {
   // Given
   const playerDataStore = new InMemoryPlayerDataStore()
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   playerOne.addUnit({
      name: 'Vital Parent Slime',
      defaultStatus: { hp: 16, atk: 2, def: 1, spd: 4 },
   })

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
   })
   playerTwo.addUnit(slimeUnit)
   playerTwo.addUnit(punchbagUnit)

   const { battleId } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      randomCounterAttackFunction,
   )
   assert(battleId)
   if (typeof battleId === 'string') {
      // When: Attack once to defeat punchbag
      const battleAfterPunchbagDefeated = await game.attack(battleId, 1, 2)
      assert(battleAfterPunchbagDefeated)
      if ('battleId' in battleAfterPunchbagDefeated) {
         // Then: punchbag has 0 hp, but player two is not yet defeated, battle is still active and no winner has been determined
         const punchBagAfterBattle = battleAfterPunchbagDefeated.playerTwo
            .getUnitInBattle(2)
         assert(punchBagAfterBattle)
         assertEquals(punchBagAfterBattle.inBattleStatus.hp, 0)
         assertEquals(battleAfterPunchbagDefeated.playerTwo.isDefeated(), false)
         assertEquals(
            battleAfterPunchbagDefeated.battleStatus,
            BattleStatus.ACTIVE,
         )
         assertEquals(battleAfterPunchbagDefeated.battleWinner, undefined)
      } else {
         fail('Expected Battle but got ErrorMessage')
      }

      // When: Attack enemy slime unit 4 times
      let battleAfterSlimeDefeated: Battle | GeneralError | undefined =
         battleAfterPunchbagDefeated
      for (let index = 0; index < 4; index++) {
         const unitTwoCurrentHP = battleAfterPunchbagDefeated.playerOne
            .getUnitInBattle(1)
            ?.inBattleStatus.hp
         assert(unitTwoCurrentHP)
         battleAfterSlimeDefeated = await game.attack(battleId, 1, 1)
         assert(battleAfterSlimeDefeated)
         assertEquals('battleId' in battleAfterSlimeDefeated, true)
      }

      // Attack final time to defeat slime. No counterattack should be triggered
      battleAfterSlimeDefeated = await game.attack(battleId, 1, 1)
      assert(battleAfterSlimeDefeated)
      if ('battleId' in battleAfterSlimeDefeated) {
         const shortBattleActions = battleAfterSlimeDefeated.battleActions.map(
            shortBattleAction,
         )
         assertEquals(shortBattleActions, [
            'p1_1-p2_2',
            'p2_1-p1_1',
            'p1_1-p2_1',
            'p2_1-p1_1',
            'p1_1-p2_1',
            'p2_1-p1_1',
            'p1_1-p2_1',
            'p2_1-p1_1',
            'p1_1-p2_1',
            'p2_1-p1_1',
            'p1_1-p2_1',
         ])

         assert(battleAfterSlimeDefeated)
         // Then: slime has 0 hp, player two is defeated and battle has ended
         const slimeAfterBattle = battleAfterSlimeDefeated.playerTwo
            .getUnitInBattle(
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
      } else {
         fail(
            'Expected Battle but got ErrorMessage' +
               JSON.stringify(battleAfterSlimeDefeated),
         )
      }
   } else {
      fail('Should not reach this!')
   }
})

Deno.test('Player cannot attack unit with 0 HP', async () => {
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

   const { battleId } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      randomCounterAttackFunction,
   )

   if (typeof battleId === 'string') {
      // When: Attack once to defeat punchbag
      const battleAfterPunchbagDefeated = await game.attack(battleId, 1, 1)
      assert(battleAfterPunchbagDefeated)

      if ('battleId' in battleAfterPunchbagDefeated) {
         // Then: punchbag has 0 hp, but player two is not yet defeated, battle is still active and no winner has been determined
         const punchBagAfterBattle = battleAfterPunchbagDefeated.playerTwo
            .getUnitInBattle(1)
         assert(punchBagAfterBattle)
         assertEquals(punchBagAfterBattle.inBattleStatus.hp, 0)
      } else {
         fail('Expected Battle but got ErrorMessage')
      }

      const errorMessage = await game.attack(battleId, 1, 1)
      assert(errorMessage)
      if ('errorMessage' in errorMessage) {
         assertEquals(
            errorMessage.errorMessage,
            'Cannot attack a unit that has already been defeated',
         )
      } else {
         fail('Expected ErrorMessage but got Battle')
      }
   } else {
      fail('Should not reach this!')
   }
})

Deno.test('Enemy player does not counterattack if NO_COUNTER_ATTACK strategy is used', async () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   // Given
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

   const { battleId } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      noCounterAttackFunction,
   )
   assert(battleId)
   if (typeof battleId === 'string') {
      const battle = await game.attack(battleId, 1, 1)
      assert(battle)
      if ('battleId' in battle) {
         const battleActions = battle?.battleActions[1]
         assertEquals(battleActions, {})
      } else {
         fail('Expected Battle but got ErrorMessage')
      }
   } else {
      fail('Should not reach this!')
   }
})

Deno.test('Player looses battle against AI', async () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   // Given
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   playerOne.addUnit({
      name: 'GlassCannon',
      defaultStatus: { hp: 1, atk: 3, def: 1, spd: 5 },
   })

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
   })
   playerTwo.addUnit(slimeUnit)

   const { battleId } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      randomCounterAttackFunction,
   )

   if (typeof battleId === 'string') {
      const battle = await game.attack(battleId, 1, 1)
      assert(battle)
      if ('battleId' in battle) {
         assertEquals(battle.playerOne.isDefeated(), true)
         assertEquals(battle.battleStatus, BattleStatus.ENDED)
         assertEquals(
            battle.battleWinner,
            battle.playerTwo,
         )
      } else {
         fail('Expected Battle but got ErrorMessage' + JSON.stringify(battle))
      }
   } else {
      fail('Should not reach this!')
   }
})

Deno.test('Player looses battle against AI on battle start', async () => {
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

   const { battleId } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      randomCounterAttackFunction,
   )

   if (typeof battleId === 'string') {
      const battle = await game.getBattle(battleId)
      assert(battle)
      if ('battleId' in battle) {
         assertEquals(battle.playerOne.isDefeated(), true)
         assertEquals(battle.battleStatus, BattleStatus.ENDED)
         assertEquals(
            battle.battleWinner,
            battle.playerTwo,
         )
      } else {
         fail('Should not reach this!')
      }
   } else {
      fail('Should not reach this!')
   }
})

Deno.test('PlayerOne can battle even if PlayerTwo is faster', async () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   // Given
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   playerOne.addUnit({
      name: 'CounterAttacker',
      defaultStatus: { hp: 5, atk: 3, def: 1, spd: 1 },
   })

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
   })
   playerTwo.addUnit({
      name: 'GlassCannon',
      defaultStatus: { hp: 1, atk: 3, def: 1, spd: 5 },
   })

   const { battleId } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      randomCounterAttackFunction,
   )

   assert(battleId)
   if (typeof battleId === 'string') {
      const battle = await game.attack(battleId, 1, 1)
      assert(battle)
      if ('battleId' in battle) {
         // Test battle actions
         const shortBattleActions = battle.battleActions.map(
            shortBattleAction,
         )
         assertEquals(shortBattleActions, [
            'p2_1-p1_1',
            'p1_1-p2_1',
         ])

         // Test playerTwo is defeated and playerOne won
         assertEquals(battle.playerTwo.isDefeated(), true)
         assertEquals(battle.battleStatus, BattleStatus.ENDED)
         assertEquals(
            battle.battleWinner,
            battle.playerOne,
         )
      } else {
         fail('Expected Battle but got ErrorMessage' + JSON.stringify(battle))
      }
   } else {
      fail('Should not reach this!')
   }
})

Deno.test('Cannot attack in battle that has already ended', async () => {
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

   const { battleId } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      randomCounterAttackFunction,
   )

   assert(battleId)
   if (typeof battleId === 'string') {
      const battle = await game.attack(battleId, 1, 1)
      assert(battle)
      if ('battleId' in battle) {
         assertEquals(battle.playerTwo.isDefeated(), true)
         assertEquals(battle.battleStatus, BattleStatus.ENDED)
         assertEquals(
            battle.battleWinner,
            battle.playerOne,
         )

         const errorMessage = await game.attack(battleId, 1, 4)
         assert(errorMessage)
         if ('errorMessage' in errorMessage) {
            assertEquals(
               errorMessage.errorMessage,
               'Cannot attack in a battle that has already ended',
            )
         } else {
            fail('Expected ErrorMessage but got Battle')
         }
      } else {
         fail('Expected Battle but got ErrorMessage')
      }
   } else {
      fail('Should not reach this!')
   }
})

Deno.test('Cannot attack if attacker or defender unit is not found', async () => {
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

   const { battleId } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      randomCounterAttackFunction,
   )
   assert(battleId)
   if (typeof battleId === 'string') {
      // When/Then: Attack not possible if attacker not found, throws error
      let errorMessage = await game.attack(battleId, 15, 4)
      assert(errorMessage)
      if ('errorMessage' in errorMessage) {
         assertEquals(
            errorMessage.errorMessage,
            'Cannot attack, did not find attacker unit with join number 15',
         )
      } else {
         fail('Expected ErrorMessage but got Battle')
      }

      // When/Then: Attack not possible if defender not found, throws error

      errorMessage = await game.attack(battleId, 1, 27)
      assert(errorMessage)
      if ('errorMessage' in errorMessage) {
         assertEquals(
            errorMessage.errorMessage,
            'Cannot attack, did not find defender unit with join number 27',
         )
      } else {
         fail('Expected ErrorMessage but got Battle')
      }
   } else {
      fail('Should not reach this!')
   }
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
   if (typeof newPlayerId === 'string') {
      assertEquals(newPlayerId, 'p1')
      const playerAccount = await playerDataStore.getPlayerAccount(newPlayerId)
      assert(playerAccount)
      if ('playerId' in playerAccount) {
         assertEquals(playerAccount.playerId, newPlayerId)
         assertEquals(playerAccount.name, 'Test Player')
         assertEquals(playerAccount.userName, 'tp')
         assertEquals(
            playerAccount.userPassword,
            '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
         )
      } else {
         fail('Should not reach here!')
      }
   } else {
      fail('Should not reach here!')
   }
})

Deno.test('PlayerAccount is not created if an error occurred during account creation', async () => {
   class MockedInMemoryPlayerDataStore extends InMemoryPlayerDataStore {
      async addPlayerAccount(): Promise<string | GeneralError> {
         return await new Promise((resolve) => {
            resolve({ errorMessage: 'Account creation failed' })
         })
      }
   }

   const playerDataStore = new MockedInMemoryPlayerDataStore()
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

   if (typeof newPlayerId === 'object') {
      assertEquals(newPlayerId.errorMessage, 'Account creation failed')
   } else {
      fail('Should not reach here!')
   }
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
      const loggedInPlayer = await game.login('tp', '12345')
      assert(loggedInPlayer)
      if ('playerId' in loggedInPlayer) {
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
         const { battleId, battle } = await createNonTutorialBattle(
            playerDataStore,
            game,
            loggedInPlayer.playerId,
            loggedInPlayer.accessToken,
            playerTwo,
            randomCounterAttackFunction,
         )
         assert(battle)
         if (typeof battleId === 'string' && 'battleId' in battle) {
            assertEquals(battle.isTutorialBattle, false)
            //When/Then: If accessToken is wrong, getBattle should return undefined
            assert(battleId)
            const battleWhenWrongToken = await game.getBattle(
               battleId,
               'wrongToken',
            )
            assert(!battleWhenWrongToken)
            assert(battleId)

            // When/Then: Attacking without access token will return missing access token error
            const errorMessage = await game.attack(battleId, 1, 1)
            assert(errorMessage)
            if ('errorMessage' in errorMessage) {
               assertEquals(
                  errorMessage.errorMessage,
                  'Access token needs to be provided in order to get battle',
               )
            } else {
               fail('Expected ErrorMessage but got Battle')
            }

            assert(battleId)

            // When: Attacking with accessToken
            const battleAfterAttack = await game.attack(
               battleId,
               2,
               1,
               loggedInPlayer.accessToken,
            )
            // Then: Attack is successful, does not throw error
            assert(battleAfterAttack)
            if ('battleId' in battleAfterAttack) {
               assertEquals(battleAfterAttack.battleId, battleId)
            } else {
               fail('Should not reach this!')
            }
         } else {
            fail('Should not reach this!')
         }
      } else {
         fail('Should not reach here!')
      }
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

Deno.test('isAuthorizedPlayer will throw error if not accessToken is provided', async () => {
   // Given
   const game = new PlayerAgainstAIGame(new InMemoryPlayerDataStore())

   const errorMessage = await game.isAuthorizedPlayer('p1', '')
   assert(errorMessage)
   if (typeof errorMessage !== 'boolean') {
      assertEquals(
         errorMessage.errorMessage,
         'Access Token for player p1 has to be provided.',
      )
   } else {
      fail('Expected ErrorMessage but got boolean')
   }
})

Deno.test('isAuthorizedPlayer will throw error if accessToken for player is not available', async () => {
   // Given
   const game = new PlayerAgainstAIGame(new InMemoryPlayerDataStore())
   const errorMessage = await game.isAuthorizedPlayer('p1', 'doesnotmatter')
   assert(errorMessage)
   if (typeof errorMessage !== 'boolean') {
      assertEquals(
         errorMessage.errorMessage,
         'Did not find access token for player p1',
      )
   } else {
      fail('Expected ErrorMessage but got boolean')
   }
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

Deno.test('Player cannot attack enemy if enemy is on turn', async () => {
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
   playerTwo.addUnit(parentSlimeUnit)

   class CustomTurnbar extends SPDTurnBar {
      setCurrentTurn(playerUnit: PlayerUnit) {
         this.currentTurn = playerUnit
      }
   }
   const customTurnBar = new CustomTurnbar()
   const { battleId } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      randomCounterAttackFunction,
      customTurnBar,
   )
   assert(battleId)

   customTurnBar.setCurrentTurn({
      playerId: 'p2',
      unitJoinNumber: 1,
   })

   if (typeof battleId === 'string') {
      const battle = await game.attack(battleId, 1, 1)
      assert(battle)
      if ('errorMessage' in battle) {
         assertEquals(
            battle.errorMessage,
            'Cannot attack, player p1 is not on turn. Player on turn is p2',
         )
      } else {
         fail(
            'Expected ErrorMessage but got Battle ' +
               JSON.stringify(battle.battleActions.map(shortBattleAction)),
         )
      }
   } else {
      fail('Should not reach this!')
   }
})

Deno.test('Player cannot attack enemy if player unit is not on turn', async () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   // Given
   const game = new PlayerAgainstAIGame(playerDataStore)
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   playerOne.addUnit(parentSlimeUnit)
   playerOne.addUnit(slimeUnit)

   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
   })
   playerTwo.addUnit(slimeUnit)

   const { battleId } = await createBattle(
      playerDataStore,
      game,
      playerOne,
      playerTwo,
      noCounterAttackFunction,
   )
   assert(battleId)
   if (typeof battleId === 'string') {
      const battle = await game.attack(battleId, 2, 1)
      assert(battle)
      if ('errorMessage' in battle) {
         assertEquals(
            battle.errorMessage,
            'Cannot attack, player unit 2 is not on turn. Unit on turn is 1',
         )
      } else {
         fail('Expected Battle but got ErrorMessage')
      }
   } else {
      fail('Should not reach this!')
   }
})

async function createBattle(
   playerDataStore: InMemoryPlayerDataStore,
   game: PlayerAgainstAIGame,
   playerOne: GamePlayer,
   playerTwo: GamePlayer,
   playerTwoCounterAttackStrategy?: (battle: Battle) => void,
   customTurnbar?: TurnBar,
): Promise<
   {
      battleId: string | GeneralError
      battle: Battle | GeneralError | undefined
   }
> {
   const newPlayerOnePlayerId = await playerDataStore.addPlayerAccount(
      {
         playerId: 'new',
         name: playerOne.name,
         userName: playerOne.name,
         userPassword: 'doesnotmatter',
      },
   )
   if (typeof newPlayerOnePlayerId === 'string') {
      playerOne.playerId = newPlayerOnePlayerId
      const newPlayerOneId = await playerDataStore.createPlayer(playerOne)
      assertEquals(newPlayerOneId, 'p1')

      const newPlayerTwoPlayerId = await playerDataStore.addPlayerAccount(
         {
            playerId: 'new',
            name: playerTwo.name,
            userName: playerTwo.name,
            userPassword: 'doesnotmatter',
         },
      )
      if (typeof newPlayerTwoPlayerId === 'string') {
         playerTwo.playerId = newPlayerTwoPlayerId
         const newPlayerTwoId = await playerDataStore.createPlayer(playerTwo)
         assertEquals(newPlayerTwoId, 'p2')
         const battleId = await game.createBattle({
            playerOneId: newPlayerOnePlayerId,
            playerTwoId: newPlayerTwoPlayerId,
            playerTwoCounterAttackFunction: playerTwoCounterAttackStrategy,
            turnBar: customTurnbar ?? new SPDTurnBar(),
         })
         assert(battleId)
         if (typeof battleId === 'string') {
            const battle = await game.getBattle(battleId)
            assert(battle)
            return { battleId, battle }
         } else {
            return { battleId, battle: undefined }
         }
      } else {
         fail('Should not reach here!')
      }
   } else {
      fail('Should not reach here!')
   }
}

async function createNonTutorialBattle(
   playerDataStore: InMemoryPlayerDataStore,
   game: PlayerAgainstAIGame,
   playerOneId: string | undefined,
   playerOneAccessToken: string | undefined,
   playerTwo: GamePlayer,
   playerTwoCounterAttackStrategy = randomCounterAttackFunction,
): Promise<
   {
      battleId: string | GeneralError | undefined
      battle: Battle | GeneralError | undefined
   }
> {
   const newPlayerTwoPlayerId = await playerDataStore.addPlayerAccount(
      {
         playerId: 'new',
         name: playerTwo.name,
         userName: playerTwo.name,
         userPassword: 'doesnotmatter',
      },
   )
   if (typeof newPlayerTwoPlayerId === 'string') {
      playerTwo.playerId = newPlayerTwoPlayerId
      const newPlayerTwoId = await playerDataStore.createPlayer(playerTwo)
      assert(newPlayerTwoId)
      const battleId = await game.createBattle({
         playerOneId,
         playerTwoId: newPlayerTwoPlayerId,
         playerTwoCounterAttackFunction: playerTwoCounterAttackStrategy,
         isTutorialBattle: false,
         playerOneAccessToken,
         turnBar: new SPDTurnBar(),
      })
      if (typeof battleId === 'string') {
         const battle = await game.getBattle(battleId, playerOneAccessToken)
         assert(battle)
         return { battleId, battle }
      } else {
         return { battleId, battle: undefined }
      }
   } else {
      fail('Should not reach here')
      return { battleId: undefined, battle: undefined }
   }
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

      if (typeof newPlayerId === 'string') {
         assertEquals(newPlayerId, 'p1')

         const playerTwo: GamePlayer = new GamePlayer({
            playerId: 'doesnotmatter',
            name: 'AI Player',
         })
         playerTwo.addUnit(slimeUnit)
         playerTwo.addUnit(parentSlimeUnit)

         const { battleId } = await createNonTutorialBattle(
            playerDataStore,
            game,
            newPlayerId,
            undefined,
            playerTwo,
            randomCounterAttackFunction,
         )
         assert(battleId)
         if (typeof battleId !== 'string') {
            assertEquals(
               battleId.errorMessage,
               'Access token needs to be provided in order to create a non-tutorial battle',
            )
         } else {
            fail('Expected ErrorMessage but got Battle')
         }
      } else {
         fail('Should not reach here!')
      }
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

      const { battleId } = await createNonTutorialBattle(
         playerDataStore,
         game,
         undefined,
         'doesnotmatter',
         playerTwo,
         randomCounterAttackFunction,
      )
      assert(battleId)
      if (typeof battleId !== 'string') {
         assertEquals(
            battleId.errorMessage,
            'playerOneId needs to be provided to create non-tutorial battle.',
         )
      } else {
         fail('Expected ErrorMessage but got Battle')
      }
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
      if (typeof newPlayerId === 'string') {
         assertEquals(newPlayerId, 'p1')

         const playerTwo: GamePlayer = new GamePlayer({
            playerId: 'doesnotmatter',
            name: 'AI Player',
         })
         playerTwo.addUnit(slimeUnit)
         playerTwo.addUnit(parentSlimeUnit)

         //Login so playerOne would have accessToken available
         await game.login('tp', '12345')

         const { battleId, battle } = await createNonTutorialBattle(
            playerDataStore,
            game,
            newPlayerId,
            'wrongToken',
            playerTwo,
            randomCounterAttackFunction,
         )

         if (typeof battleId === 'object' && 'errorMessage' in battleId) {
            assertEquals(
               battleId.errorMessage,
               'Non-tutorial battle cannot be created. Reason: Invalid credentials',
            )
         } else {
            fail(
               'Expected ErrorMessage but got BattleId' + battleId +
                  ' and battle ' + battle,
            )
         }
      } else {
         fail('Should not reach here!')
      }
   },
)
