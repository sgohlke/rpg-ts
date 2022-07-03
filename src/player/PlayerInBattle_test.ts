import {
   assertEquals,
   GamePlayer,
   getDefaultUnit,
   InBattleStatus,
   PlayerInBattle,
} from '../index.ts';

Deno.test('PlayerInBattle is correctly created', () => {
   const unit = getDefaultUnit('1');
   const player: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
      units: [unit],
   });

   const playerInBattle = new PlayerInBattle(player);
   assertEquals(playerInBattle.playerId, 'p1');
   assertEquals(playerInBattle.name, 'Test Player');
   assertEquals(playerInBattle.units.length, 1);

   const unitInBattle = playerInBattle.unitsInBattle[0];
   assertEquals(unitInBattle.joinNumber, unit.joinNumber);
   assertEquals(unitInBattle.name, unit.name);
   assertEquals(
      unitInBattle.inBattleStatus,
      {
         hp: unit.defaultStatus.hp,
         atk: unit.defaultStatus.atk,
         def: unit.defaultStatus.def,
      } as InBattleStatus,
   );
});

Deno.test('findRandomNonDefeatedUnit returns undefined if no undefeated units are available', () => {
   const unit = getDefaultUnit('5');
   const player: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
      units: [unit],
   });
   const playerInBattle = new PlayerInBattle(player);
   assertEquals(playerInBattle.findRandomNonDefeatedUnit(), undefined);
});
