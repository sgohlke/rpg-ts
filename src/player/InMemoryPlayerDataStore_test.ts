import { assert, assertEquals, fail } from '../dev_deps.ts'
import {
   GamePlayer,
   getDefaultUnit,
   InMemoryPlayerDataStore,
} from '../index.ts'

const slimeUnit = getDefaultUnit('1')
const parentSlimeUnit = getDefaultUnit('2')

Deno.test('Player is correctly created and added to Player list', async () => {
   const playerDataStore = new InMemoryPlayerDataStore()
   const newPlayerId = await playerDataStore.addPlayerAccount({
      playerId: 'doesnotmatter',
      name: 'Test Player',
      userName: 'doesnotmatter',
      userPassword: 'doesnotmatter',
   })

   if (typeof newPlayerId === 'string') {
      assertEquals(newPlayerId, 'p1')
      const playerOne: GamePlayer = new GamePlayer({
         playerId: newPlayerId,
         name: 'Test Player',
      })
      playerOne.addUnit(slimeUnit)
      playerOne.addUnit(parentSlimeUnit)

      await playerDataStore.createPlayer(playerOne)
      const newPlayer = await playerDataStore.getPlayer(newPlayerId)
      assert(newPlayer)
      if ('playerId' in newPlayer) {
         assertEquals(newPlayer.playerId, newPlayerId)
         assertEquals(newPlayer.name, 'Test Player')
         assertEquals(newPlayer.units[0], {
            name: slimeUnit.name,
            defaultStatus: slimeUnit.defaultStatus,
            joinNumber: 1,
         })
         assertEquals(newPlayer.units[1], {
            name: parentSlimeUnit.name,
            defaultStatus: parentSlimeUnit.defaultStatus,
            joinNumber: 2,
         })
      } else {
         fail('Should not reach here!')
      }
   } else {
      fail('Should not reach here!')
   }
})
