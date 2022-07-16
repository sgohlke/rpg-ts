import {
   Battle,
   BattleStatus,
   calculateDamage,
   createPasswordHash,
   GamePlayer,
   generateAccessTokenHash,
   PlayerAccount,
   PlayerInBattle,
   randomCounterAttackFunction,
   verifyPassword,
} from '../index.ts';

export class PlayerAgainstAIGame {
   private nextPlayerId = 1;
   private players: Array<GamePlayer> = [];
   private battles: Array<Battle> = [];
   private playerAccounts: Array<PlayerAccount> = [];
   private playerAccessTokens: Map<string, string> = new Map<string, string>();

   async registerPlayer(
      player: GamePlayer,
      name: string,
      userName: string,
      password: string,
   ): Promise<string> {
      //TODO: Check if player with username already exists, if so throw error
      const playerId = this.createPlayer(player);
      const hashedPassword = await createPasswordHash(password);
      this.playerAccounts.push({
         playerId: playerId,
         name: name,
         userName: userName,
         userPassword: hashedPassword,
      });
      return playerId;
   }

   getPlayerAccount(playerId: string): PlayerAccount | undefined {
      return this.playerAccounts.find((entry) => entry.playerId === playerId);
   }

   createPlayer(player: GamePlayer): string {
      const newPlayerId = 'p' + this.nextPlayerId;
      player.playerId = newPlayerId;
      this.players.push(player);
      this.nextPlayerId++;
      return newPlayerId;
   }

   getPlayer(playerId: string | undefined): GamePlayer | undefined {
      return this.players.find((entry) => entry.playerId === playerId);
   }

   async login(userName: string, userPassword: string): Promise<string> {
      const playerAccount = this.playerAccounts.find((entry) =>
         entry.userName === userName
      );
      if (!playerAccount) {
         throw new Error('Login failed! Invalid credentials');
      } else {
         const verificationSuccessful = await verifyPassword(
            userPassword,
            playerAccount.userPassword,
         );
         if (verificationSuccessful) {
            // Generate accessToken
            const accessToken = generateAccessTokenHash();
            this.playerAccessTokens.set(playerAccount.playerId, accessToken);
            return accessToken;
         } else {
            throw new Error('Login failed! Invalid credentials');
         }
      }
   }

   getAccessTokenForPlayer(playerId: string): string | undefined {
      return this.playerAccessTokens.get(playerId);
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
      // attackerPlayerToken?: string,
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
         //TODO: Check if attackerPlayerToken matches token for playerOne, if not throw an error

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
