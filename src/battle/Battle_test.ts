import { assertEquals } from '../deps.ts'
import {
   Battle,
   BattleStatus,
   GamePlayer,
   getDefaultUnit,
   PlayerInBattle,
} from '../index.ts'

const unitOne = getDefaultUnit('1')
const unitTwo = getDefaultUnit('2')

Deno.test('Battle is correctly created', () => {
   const playerOne: PlayerInBattle = new PlayerInBattle(
      new GamePlayer({
         playerId: 'p1',
         name: 'Test Player',
      }),
   )
   playerOne.addUnit(unitOne)
   playerOne.addUnit(unitTwo)

   const playerTwo: PlayerInBattle = new PlayerInBattle(
      new GamePlayer({
         playerId: 'p2',
         name: 'AI Player',
      }),
   )
   playerTwo.addUnit(unitOne)
   playerTwo.addUnit(unitTwo)

   const battle: Battle = {
      battleId: 'p1-p2-1111',
      battleActions: [],
      playerOne,
      playerTwo,
      battleStatus: BattleStatus.ACTIVE,
   }

   assertEquals(battle.battleId, 'p1-p2-1111')
   assertEquals(battle.battleActions, [])
   assertEquals(battle.playerOne, playerOne)
   assertEquals(battle.playerTwo, playerTwo)
   assertEquals(battle.battleStatus, BattleStatus.ACTIVE)
})
