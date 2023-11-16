import { PlayerInBattle, PlayerUnit, TurnBar, UnitInBattle } from '../index.ts'

export interface PlayerIdUnitInBattle {
   playerId: string
   unitInBattle: UnitInBattle
}

export class SPDTurnBar implements TurnBar {
   playerOne?: PlayerInBattle
   playerTwo?: PlayerInBattle
   currentTurn?: PlayerUnit
   turns: Array<PlayerUnit> = []

   initTurnBar(playerOne: PlayerInBattle, playerTwo: PlayerInBattle) {
      this.playerOne = playerOne
      this.playerTwo = playerTwo
      this.initTurns()
   }

   initTurns(): void {
      if (this.playerOne && this.playerTwo) {
         const playerOnePlayerUnits = this.playerOne.getNonDefeatedUnits().map<
            PlayerIdUnitInBattle
         >((entry) =>
            <PlayerIdUnitInBattle> {
               playerId: this.playerOne?.playerId,
               unitInBattle: entry,
            }
         )
         const playerTwoPlayerUnits = this.playerTwo.getNonDefeatedUnits().map<
            PlayerIdUnitInBattle
         >((entry) =>
            <PlayerIdUnitInBattle> {
               playerId: this.playerTwo?.playerId,
               unitInBattle: entry,
            }
         )

         const sortedPlayerUnits = playerOnePlayerUnits.concat(
            playerTwoPlayerUnits,
         ).sort(
            function (
               a: PlayerIdUnitInBattle,
               b: PlayerIdUnitInBattle,
            ): number {
               const unitASpd = a.unitInBattle.inBattleStatus.spd ?? 0
               const unitBSpd = b.unitInBattle.inBattleStatus.spd ?? 0

               // Note: We sort SPD desc here
               if (unitASpd < unitBSpd) {
                  return 1
               }

               if (unitASpd > unitBSpd) {
                  return -1
               }

               return 0
            },
         )

         this.turns = sortedPlayerUnits.map<PlayerUnit>((entry) =>
            <PlayerUnit> {
               playerId: entry.playerId,
               unitJoinNumber: entry.unitInBattle.joinNumber,
            }
         )

         // Do not set current turn if it is already set (i.e. when generating turns for next round)
         if (!this.currentTurn) {
            this.currentTurn = this.turns.shift()
         }
      }
   }

   nextTurn(): PlayerUnit | undefined {
      this.currentTurn = this.turns.shift()
      if (this.turns.length === 0) {
         this.initTurns()
      }
      return this.currentTurn
   }
}
