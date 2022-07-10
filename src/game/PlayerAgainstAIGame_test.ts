import {
   assert,
   assertEquals,
   assertThrows,
   Battle,
   BattleStatus,
   CounterAttackStrategy,
   GamePlayer,
   getDefaultUnit,
   PlayerAgainstAIGame,
} from '../index.ts';

const slimeUnit = getDefaultUnit('1');
const parentSlimeUnit = getDefaultUnit('2');
const unitDefender = getDefaultUnit('3');
const punchbagUnit = getDefaultUnit('4');
const looserUnit = getDefaultUnit('5');

Deno.test('Player is correctly created and added to Player list', () => {
   const game = new PlayerAgainstAIGame();
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
      units: [slimeUnit, parentSlimeUnit],
   });

   const newPlayerId = game.createPlayer(playerOne);
   assertEquals(newPlayerId, 'p1');

   const newPlayer = game.getPlayer(newPlayerId);
   assert(newPlayer);
   assertEquals(newPlayer.playerId, newPlayerId);
   assertEquals(newPlayer.name, 'Test Player');
   assertEquals(newPlayer.units, [slimeUnit, parentSlimeUnit]);
});

Deno.test('Battle is correctly created and added to Battle list', () => {
   const game = new PlayerAgainstAIGame();
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
      units: [slimeUnit, parentSlimeUnit],
   });
   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'AI Player',
      units: [slimeUnit, parentSlimeUnit],
   });

   const { battleId, battle } = createBattle(game, playerOne, playerTwo);
   const battleParticipants = battleId.substring(0, battleId.indexOf('_'));

   assertEquals(battleParticipants, 'p1-p2');
   assert(battle);
   assertEquals(battle.playerOne.playerId, 'p1');
   assertEquals(battle.playerOne.name, 'Test Player');
   assertEquals(battle.playerTwo.playerId, 'p2');
   assertEquals(battle.playerTwo.name, 'AI Player');
});

Deno.test('Battle is not created and not added to Battle list if one player is not found in player list', () => {
   const game = new PlayerAgainstAIGame();
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
      units: [slimeUnit, parentSlimeUnit],
   });

   const newPlayerOneId = game.createPlayer(playerOne);
   assertEquals(newPlayerOneId, 'p1');
   const newPlayerTwoId = 'pdoesnotexist';
   const battleId = game.createBattle(newPlayerOneId, newPlayerTwoId);
   assertEquals(battleId, undefined);
});

Deno.test('Attack in battle is performed correctly', () => {
   // Given
   const game = new PlayerAgainstAIGame();
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
      units: [slimeUnit, parentSlimeUnit],
   });
   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'AI Player',
      units: [slimeUnit, parentSlimeUnit],
   });

   const { battleId, battle } = createBattle(game, playerOne, playerTwo);
   const initialEnemyHP = slimeUnit.defaultStatus.hp;
   assertEquals(battle.playerTwo.units[0].defaultStatus.hp, initialEnemyHP);

   // When
   const battleAfterAttack = game.attack(battleId, 1, 1);

   // Then
   assert(battleAfterAttack);
   const defendingUnitHPAfterAttack =
      battleAfterAttack.playerTwo.unitsInBattle[0].inBattleStatus.hp;
   assertEquals(defendingUnitHPAfterAttack, initialEnemyHP - 1);

   // Assert that initial unit default hp did not change after attack in battle
   const secondPlayer = game.getPlayer('p2');
   assert(secondPlayer);
   const defendingUnitDefaultHP = secondPlayer.units[0].defaultStatus.hp;
   assertEquals(defendingUnitDefaultHP, playerTwo.units[0].defaultStatus.hp);
});

Deno.test('Attack in battle is performed correctly and deals at least 1 HP as damage', () => {
   // Given
   const game = new PlayerAgainstAIGame();
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
      units: [slimeUnit, parentSlimeUnit],
   });
   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'AI Player',
      units: [unitDefender, parentSlimeUnit],
   });

   const { battleId, battle } = createBattle(game, playerOne, playerTwo);
   const initialEnemyHP = unitDefender.defaultStatus.hp;
   assertEquals(battle.playerTwo.units[0].defaultStatus.hp, initialEnemyHP);

   // When
   const battleAfterAttack = game.attack(battleId, 1, 3);

   // Then
   assert(battleAfterAttack);
   const defendingUnitHPAfterAttack =
      battleAfterAttack.playerTwo.unitsInBattle[0].inBattleStatus.hp;
   assertEquals(defendingUnitHPAfterAttack, initialEnemyHP - 1);

   // Assert that initial unit default hp did not change after attack in battle
   const secondPlayer = game.getPlayer('p2');
   assert(secondPlayer);
   const defendingUnitDefaultHP = secondPlayer.units[0].defaultStatus.hp;
   assertEquals(defendingUnitDefaultHP, playerTwo.units[0].defaultStatus.hp);
});

Deno.test('Battle has ended and proper winner is determined if Player defeats AI', () => {
   // Given
   const game = new PlayerAgainstAIGame();
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
      units: [parentSlimeUnit],
   });
   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
      units: [slimeUnit, punchbagUnit],
   });

   const { battleId } = createBattle(game, playerOne, playerTwo);

   // When: Attack once to defeat punchbag
   const battleAfterPunchbagDefeated = game.attack(battleId, 2, 4);
   assert(battleAfterPunchbagDefeated);

   // Then: punchbag has 0 hp, but player two is not yet defeated, battle is still active and no winner has been determined
   const punchBagAfterBattle = battleAfterPunchbagDefeated.playerTwo
      .getUnitInBattle(4);
   assert(punchBagAfterBattle);
   assertEquals(punchBagAfterBattle.inBattleStatus.hp, 0);
   assertEquals(battleAfterPunchbagDefeated.playerTwo.isDefeated(), false);
   assertEquals(battleAfterPunchbagDefeated.battleStatus, BattleStatus.ACTIVE);
   assertEquals(battleAfterPunchbagDefeated.battleWinner, undefined);

   // When: Attack enemy slime unit 4 times
   let battleAfterSlimeDefeated: Battle | undefined =
      battleAfterPunchbagDefeated;
   for (let index = 0; index < 4; index++) {
      const unitTwoCurrentHP =
         battleAfterPunchbagDefeated.playerOne.getUnitInBattle(2)
            ?.inBattleStatus.hp;
      assert(unitTwoCurrentHP);
      battleAfterSlimeDefeated = game.attack(battleId, 2, 1);
      const counterAttackTarget = battleAfterSlimeDefeated?.counterAttackUnits
         ?.counterTarget;
      assert(counterAttackTarget);
      assertEquals(counterAttackTarget.joinNumber, 2);
      // Then: counter attack target should have one HP less than before
      assertEquals(counterAttackTarget.inBattleStatus.hp, unitTwoCurrentHP - 1);
   }

   // Attack final time to defeat slime. No counterattack should be triggered
   battleAfterSlimeDefeated = game.attack(battleId, 2, 1);
   const counterAttackTarget = battleAfterSlimeDefeated?.counterAttackUnits
      ?.counterTarget;
   assertEquals(counterAttackTarget, undefined);

   assert(battleAfterSlimeDefeated);
   // Then: slime has 0 hp, player two is defeated and battle has ended
   const slimeAfterBattle = battleAfterSlimeDefeated.playerTwo.getUnitInBattle(
      1,
   );
   assert(slimeAfterBattle);
   assertEquals(slimeAfterBattle.inBattleStatus.hp, 0);
   assertEquals(battleAfterSlimeDefeated.playerTwo.isDefeated(), true);
   assertEquals(battleAfterSlimeDefeated.battleStatus, BattleStatus.ENDED);
   assertEquals(
      battleAfterSlimeDefeated.battleWinner,
      battleAfterSlimeDefeated.playerOne,
   );
});

Deno.test('Player cannot attack unit with 0 HP', () => {
   // Given
   const game = new PlayerAgainstAIGame();
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
      units: [slimeUnit],
   });
   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
      units: [punchbagUnit, slimeUnit],
   });

   const { battleId } = createBattle(game, playerOne, playerTwo);

   // When: Attack once to defeat punchbag
   const battleAfterPunchbagDefeated = game.attack(battleId, 1, 4);
   assert(battleAfterPunchbagDefeated);

   // Then: punchbag has 0 hp, but player two is not yet defeated, battle is still active and no winner has been determined
   const punchBagAfterBattle = battleAfterPunchbagDefeated.playerTwo
      .getUnitInBattle(4);
   assert(punchBagAfterBattle);
   assertEquals(punchBagAfterBattle.inBattleStatus.hp, 0);

   // When/Then: Attack punchbag with 0 HP again, throws error
   assertThrows(
      (): void => {
         game.attack(battleId, 1, 4);
      },
      Error,
      'Cannot attack a unit that has already been defeated',
   );
});

Deno.test('Player cannot attack unit with 0 HP', () => {
   // Given
   const game = new PlayerAgainstAIGame();
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
      units: [looserUnit],
   });
   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
      units: [punchbagUnit],
   });

   const { battleId } = createBattle(game, playerOne, playerTwo);

   // When/Then: Attack punchbag with 0 HP again, throws error
   assertThrows(
      (): void => {
         game.attack(battleId, 5, 4);
      },
      Error,
      'Cannot attack with a unit with 0 HP',
   );
});

Deno.test('Enemy player does not counterattack if NO_COUNTER_ATTACK strategy is used', () => {
   // Given
   const game = new PlayerAgainstAIGame();
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
      units: [slimeUnit],
   });
   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
      units: [slimeUnit],
   });

   const { battleId } = createBattle(
      game,
      playerOne,
      playerTwo,
      CounterAttackStrategy.NO_COUNTER_ATTACK,
   );

   const battle = game.attack(battleId, 1, 1);
   const counterAttackTarget = battle?.counterAttackUnits?.counterTarget;
   assertEquals(counterAttackTarget, undefined);
});

Deno.test('Player looses battle against AI', () => {
   // Given
   const game = new PlayerAgainstAIGame();
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
      units: [punchbagUnit],
   });
   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
      units: [slimeUnit],
   });

   const { battleId } = createBattle(
      game,
      playerOne,
      playerTwo,
   );

   const battle = game.attack(battleId, 4, 1);
   assert(battle);
   assertEquals(battle.playerOne.isDefeated(), true);
   assertEquals(battle.battleStatus, BattleStatus.ENDED);
   assertEquals(
      battle.battleWinner,
      battle.playerTwo,
   );
});


Deno.test('Cannot attack in battle that has already ended', () => {
   // Given
   const game = new PlayerAgainstAIGame();
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
      units: [slimeUnit],
   });
   const playerTwo: GamePlayer = new GamePlayer({
      playerId: 'p2',
      name: 'AI Player',
      units: [punchbagUnit],
   });

   const { battleId } = createBattle(
      game,
      playerOne,
      playerTwo,
   );

   const battle = game.attack(battleId, 1, 4);
   assert(battle);
   assertEquals(battle.playerTwo.isDefeated(), true);
   assertEquals(battle.battleStatus, BattleStatus.ENDED);
   assertEquals(
      battle.battleWinner,
      battle.playerOne,
   );

    // When/Then: Attack not possible if battle has ended, throws error
    assertThrows(
      (): void => {
         game.attack(battleId, 1, 4);
      },
      Error,
      'Cannot attack in a battle that has already ended',
   );

});

function createBattle(
   game: PlayerAgainstAIGame,
   playerOne: GamePlayer,
   playerTwo: GamePlayer,
   playerTwoCounterAttackStrategy = CounterAttackStrategy.RANDOM_ATTACK,
): { battleId: string; battle: Battle } {
   const newPlayerOneId = game.createPlayer(playerOne);
   assertEquals(newPlayerOneId, 'p1');
   const newPlayerTwoId = game.createPlayer(playerTwo);
   assertEquals(newPlayerTwoId, 'p2');
   const battleId = game.createBattle(
      newPlayerOneId,
      newPlayerTwoId,
      playerTwoCounterAttackStrategy,
   );
   assert(battleId);

   const battle = game.getBattle(battleId);
   assert(battle);
   return { battleId, battle };
}
