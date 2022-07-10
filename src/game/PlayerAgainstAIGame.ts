import {
   Battle,
   BattleStatus,
   calculateDamage,
   GamePlayer,
   PlayerInBattle,
   randomCounterAttackFunction,
} from '../index.ts';

export class PlayerAgainstAIGame {
   private nextPlayerId = 1;
   private players: Array<GamePlayer> = [];
   private battles: Array<Battle> = [];

   createPlayer(player: GamePlayer): string | undefined {
      const newPlayerId = 'p' + this.nextPlayerId;
      player.playerId = newPlayerId;
      this.players.push(player);
      this.nextPlayerId++;
      return newPlayerId;
   }

   getPlayer(playerId: string | undefined): GamePlayer | undefined {
      return this.players.find((entry) => entry.playerId === playerId);
   }

   createBattle(
      playerOneId: string | undefined,
      playerTwoId: string | undefined,
      playerTwoCounterAttackFunction = randomCounterAttackFunction,
   ): string | undefined {
      const battleId = this.createBattleId(playerOneId, playerTwoId);
      const playerOne = this.getPlayer(playerOneId);
      const playerTwo = this.getPlayer(playerTwoId);
      if (playerOne && playerTwo) {
         this.battles.push({
            battleId,
            playerOne: new PlayerInBattle(playerOne),
            playerTwo: new PlayerInBattle(
               playerTwo,
               playerTwoCounterAttackFunction,
            ),
            battleStatus: BattleStatus.ACTIVE,
         });
         return battleId;
      } else {
         return undefined;
      }
   }

   getBattle(battleId: string): Battle | undefined {
      return this.battles.find((entry) => entry.battleId === battleId);
   }

   attack(
      battleId: string,
      attakerJoinNumber: number,
      defenderJoinNumber: number,
   ): Battle | undefined {
      const battle = this.getBattle(battleId);
      if (battle) {
         if (battle.battleStatus === BattleStatus.ENDED) {
            throw new Error('Cannot attack in a battle that has already ended');
         }

         const attackerUnit = battle.playerOne.getUnitInBattle(
            attakerJoinNumber,
         );
         if (!attackerUnit) {
            throw new Error(
               `Cannot attack, did not find attacker unit with join number ${attakerJoinNumber}`,
            );
         }

         const defenderUnit = battle.playerTwo.getUnitInBattle(
            defenderJoinNumber,
         );
         if (!defenderUnit) {
            throw new Error(
               `Cannot attack, did not find defender unit with join number ${defenderJoinNumber}`,
            );
         }

         if (attackerUnit && attackerUnit.inBattleStatus.hp === 0) {
            throw new Error('Cannot attack with a unit with 0 HP');
         }

         if (defenderUnit && defenderUnit.inBattleStatus.hp === 0) {
            throw new Error(
               'Cannot attack a unit that has already been defeated',
            );
         }

         if (attackerUnit && defenderUnit) {
            defenderUnit.inBattleStatus.hp -= calculateDamage(
               attackerUnit,
               defenderUnit,
            );
         }

         if (battle.playerTwo.counterAttackFunction) {
            battle.playerTwo.counterAttackFunction(battle);
         }

         const winner = this.determineWinner(
            battle.playerOne,
            battle.playerTwo,
         );
         if (winner) {
            battle.battleStatus = BattleStatus.ENDED;
            battle.battleWinner = winner;
         }
      }
      return battle;
   }

   private determineWinner(
      playerOne: PlayerInBattle,
      playerTwo: PlayerInBattle,
   ): PlayerInBattle | undefined {
      //TODO: Add test case for playerOne defeated after counter-attack has been added
      return playerOne.isDefeated()
         ? playerTwo
         : (playerTwo.isDefeated() ? playerOne : undefined);
   }

   private createBattleId(
      playerOneId: string | undefined,
      playerTwoId: string | undefined,
   ): string {
      return playerOneId + '-' + playerTwoId + '_' + Date.now();
   }
}
