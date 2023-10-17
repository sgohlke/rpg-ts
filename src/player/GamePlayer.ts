import { Player, Unit } from '../index.ts'

export class GamePlayer implements Player {
   playerId: string
   name: string
   private nextJoinNumber = 1
   units: Array<Unit> = []

   constructor(player: { playerId: string; name: string }) {
      this.playerId = player.playerId
      this.name = player.name
   }

   addUnit(unit: Unit): number {
      const joinNumber = this.nextJoinNumber
      this.units.push({
         joinNumber: joinNumber,
         name: unit.name,
         defaultStatus: unit.defaultStatus,
      })
      this.nextJoinNumber++
      return joinNumber
   }

   getUnit(joinNumber: number): Unit | undefined {
      return this.getUnits().find((entry) => entry.joinNumber === joinNumber)
   }

   getNumberOfUnits(): number {
      return this.getUnits().length
   }

   getUnits(): ReadonlyArray<Unit> {
      return this.units
   }
}
