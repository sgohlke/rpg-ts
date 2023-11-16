import { assertEquals } from '../deps.ts'
import { PlayerInBattle, SPDTurnBar } from '../index.ts'

Deno.test('SPDTurnBar is correctly created for units with undefined SPD', () => {
   const spdTurnBar = new SPDTurnBar()
   const playerOne: PlayerInBattle = new PlayerInBattle(
      {
         playerId: 'one',
         name: 'Test Player',
         units: [{
            name: 'Parent Slime',
            defaultStatus: { hp: 6, atk: 2, def: 1 },
            joinNumber: 2,
         }],
      },
   )

   const playerTwo: PlayerInBattle = new PlayerInBattle(
      {
         playerId: 'two',
         name: 'AI Player',
         units: [{
            name: 'Slime',
            defaultStatus: { hp: 5, atk: 2, def: 1 },
            joinNumber: 1,
         }],
      },
   )
   spdTurnBar.initTurnBar(playerOne, playerTwo)
   assertEquals(spdTurnBar.currentTurn, { playerId: 'one', unitJoinNumber: 2 })
   assertEquals(spdTurnBar.turns, [{ playerId: 'two', unitJoinNumber: 1 }])
})
