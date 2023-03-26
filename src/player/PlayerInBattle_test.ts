import {
   assert,
   assertEquals,
   GamePlayer,
   getDefaultUnit,
   InBattleStatus,
   PlayerInBattle,
} from '../index.ts'

Deno.test('PlayerInBattle is correctly created', () => {
   const unit = getDefaultUnit('1')
   const player: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   player.addUnit(unit)
   assertEquals(player.getNumberOfUnits(), 1)

   const playerInBattle = new PlayerInBattle(player)
   assertEquals(playerInBattle.playerId, 'p1')
   assertEquals(playerInBattle.name, 'Test Player')
   assertEquals(playerInBattle.getNumberOfUnitsInBattle(), 1)
   //assertEquals(playerInBattle, undefined);

   const unitInBattle = playerInBattle.getUnitInBattle(1)
   assert(unitInBattle)
   assertEquals(unitInBattle.joinNumber, 1)
   assertEquals(unitInBattle.name, unit.name)
   assertEquals(
      unitInBattle.inBattleStatus,
      {
         hp: unit.defaultStatus.hp,
         atk: unit.defaultStatus.atk,
         def: unit.defaultStatus.def,
      } as InBattleStatus,
   )
})

Deno.test('findRandomNonDefeatedUnit returns undefined if no undefeated units are available', () => {
   const unit = getDefaultUnit('5')
   const player: GamePlayer = new GamePlayer({
      playerId: 'p1',
      name: 'Test Player',
   })
   player.addUnit(unit)
   const playerInBattle = new PlayerInBattle(player)
   assertEquals(playerInBattle.findRandomNonDefeatedUnit(), undefined)
})
