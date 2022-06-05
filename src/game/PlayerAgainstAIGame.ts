import {
   Battle,
   BattleStatus,
   Game,
   GamePlayer,
   PlayerInBattle,
   UnitInBattle,
} from '../index.ts';

export class PlayerAgainstAIGame implements Game {
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
   ): string | undefined {
      const battleId = this.createBattleId(playerOneId, playerTwoId);
      const playerOne = this.getPlayer(playerOneId);
      const playerTwo = this.getPlayer(playerTwoId);
      if (playerOne && playerTwo) {
         this.battles.push({
            battleId,
            playerOne: new PlayerInBattle(playerOne),
            playerTwo: new PlayerInBattle(playerTwo),
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
         const attackerUnit = battle.playerOne.getUnitInBattle(
            attakerJoinNumber,
         );
         const defenderUnit = battle.playerTwo.getUnitInBattle(
            defenderJoinNumber,
         );

         if (attackerUnit && attackerUnit.inBattleStatus.hp === 0) {
            throw new Error('Cannot attack with a unit with 0 HP');
         }

         if (defenderUnit && defenderUnit.inBattleStatus.hp === 0) {
            throw new Error(
               'Cannot attack a unit that has already been defeated',
            );
         }

         if (attackerUnit && defenderUnit) {
            defenderUnit.inBattleStatus.hp -= this.calculateDamage(
               attackerUnit,
               defenderUnit,
            );
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

   private calculateDamage(
      attackerUnit: UnitInBattle,
      defenderUnit: UnitInBattle,
   ): number {
      let damage = attackerUnit.inBattleStatus.atk -
         defenderUnit.inBattleStatus.def;
      if (damage < 1) {
         damage = 1;
      }
      return damage;
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
