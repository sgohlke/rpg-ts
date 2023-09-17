import { assert, assertEquals } from '../deps.ts'
import {
   GamePlayer,
   getDefaultUnit,
   InMemoryPlayerDataStore,
} from '../index.ts'

const slimeUnit = getDefaultUnit('1')
const parentSlimeUnit = getDefaultUnit('2')

Deno.test('Player is correctly created and added to Player list', () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   const playerOne: GamePlayer = new GamePlayer({
      playerId: 'doesnotmatter',
      name: 'Test Player',
   })
   playerOne.addUnit(slimeUnit)
   playerOne.addUnit(parentSlimeUnit)

   const newPlayerId = playerDataStore.createPlayer(playerOne)
   assertEquals(newPlayerId, 'p1')

   const newPlayer = playerDataStore.getPlayer(newPlayerId)
   assert(newPlayer)
   assertEquals(newPlayer.playerId, newPlayerId)
   assertEquals(newPlayer.name, 'Test Player')
   assertEquals(newPlayer.getUnit(1), {
      name: slimeUnit.name,
      defaultStatus: slimeUnit.defaultStatus,
      joinNumber: 1,
   })
   assertEquals(newPlayer.getUnit(2), {
      name: parentSlimeUnit.name,
      defaultStatus: parentSlimeUnit.defaultStatus,
      joinNumber: 2,
   })
})
