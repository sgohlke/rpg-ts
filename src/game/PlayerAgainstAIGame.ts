import {
   Battle,
   BattleStatus,
   calculateDamage,
   createPasswordHash,
   GamePlayer,
   GeneralError,
   generateAccessTokenHash,
   LoggedInPlayer,
   PlayerDataStore,
   PlayerInBattle,
   randomCounterAttackFunction,
   verifyPassword,
} from '../index.ts'

export class PlayerAgainstAIGame {
   private battles: Array<Battle> = []
   private playerDataStore: PlayerDataStore

   constructor(playerDataStore: PlayerDataStore) {
      this.playerDataStore = playerDataStore
   }

   async registerPlayer(
      player: GamePlayer,
      name: string,
      userName: string,
      password: string,
   ): Promise<string> {
      const playerExists = await this.playerDataStore.doesPlayerExist(userName)
      if (playerExists) {
         throw new Error(
            `Cannot register user "${userName}", the username already exists`,
         )
      }
      const hashedPassword = await createPasswordHash(password)
      const playerId = await this.playerDataStore.addPlayerAccount({
         playerId: 'new',
         name: name,
         userName: userName,
         userPassword: hashedPassword,
      })
      player.playerId = playerId

      // TODO: Check error handling
      await this.playerDataStore.createPlayer(player)
      return playerId
   }

   async login(
      userName: string,
      userPassword: string,
   ): Promise<LoggedInPlayer> {
      const playerAccount = await this.playerDataStore.getPlayerAccountForName(
         userName,
      )
      if (!playerAccount) {
         throw new Error('Login failed! Invalid credentials')
      } else {
         const verificationSuccessful = await verifyPassword(
            userPassword,
            playerAccount.userPassword,
         )
         if (verificationSuccessful) {
            // Generate accessToken
            const accessToken = generateAccessTokenHash()
            this.playerDataStore.setPlayerAccessToken(
               playerAccount.playerId,
               accessToken,
            )
            return {
               playerId: playerAccount.playerId,
               userName: playerAccount.userName,
               name: playerAccount.name,
               accessToken: accessToken,
            }
         } else {
            throw new Error('Login failed! Invalid credentials')
         }
      }
   }

   async createBattle(
      playerOneId: string | undefined,
      playerTwoId: string | undefined,
      playerTwoCounterAttackFunction = randomCounterAttackFunction,
      isTutorialBattle = true,
      playerOneAccessToken?: string,
   ): Promise<string | GeneralError | undefined> {
      if (!isTutorialBattle) {
         if (!playerOneAccessToken) {
            return {
               errorMessage:
                  'Access token needs to be provided in order to create a non-tutorial battle',
            }
         } else if (!playerOneId) {
            return {
               errorMessage:
                  'playerOneId needs to be provided to create non-tutorial battle.',
            }
         } else {
            if (!await this.isAuthorizedPlayer(playerOneId, playerOneAccessToken)) {
               return {
                  errorMessage:
                     'Non-tutorial battle cannot be created. Reason: Invalid credentials',
               }
            }
         } 
      }
      const battleId = this.createBattleId(playerOneId, playerTwoId)
      const playerOne = await this.playerDataStore.getPlayer(playerOneId)
      const playerTwo = await this.playerDataStore.getPlayer(playerTwoId)
      if (playerOne && playerTwo) {
         this.battles.push({
            battleId,
            playerOne: new PlayerInBattle(playerOne),
            playerTwo: new PlayerInBattle(
               playerTwo,
               playerTwoCounterAttackFunction,
            ),
            battleStatus: BattleStatus.ACTIVE,
            isTutorialBattle: isTutorialBattle,
         })
         return battleId
      } else {
         return undefined
      }
   }

   async getBattle(
      battleId: string,
      playerOneAccessToken?: string,
   ): Promise<Battle | GeneralError | undefined> {
      const battle = this.battles.find((entry) => entry.battleId === battleId)
      if (!battle) {
         return {
            errorMessage: `Battle for battleId ${battleId} was not found!`
         }
      } else if (battle.isTutorialBattle) {
         return battle
      } else {
         if (!playerOneAccessToken) {
            return {
               errorMessage: 'Access token needs to be provided in order to get battle'
            }
         } else {
            //TODO: Add check if player is authorized, else throw error
            const isAuthorized = await this.isAuthorizedPlayer(
               battle.playerOne.playerId,
               playerOneAccessToken,
            )
            return isAuthorized ? battle : undefined
         }
      }
   }

   async attack(
      battleId: string,
      attakerJoinNumber: number,
      defenderJoinNumber: number,
      playerOneAccessToken?: string,
   ): Promise<Battle | GeneralError | undefined> {
      const battle = await this.getBattle(battleId, playerOneAccessToken)
      if (battle && 'battleId' in battle) {
         if (battle.battleStatus === BattleStatus.ENDED) {
            return {
               errorMessage: 'Cannot attack in a battle that has already ended',
            }
         }

         const attackerUnit = battle.playerOne.getUnitInBattle(
            attakerJoinNumber,
         )
         if (!attackerUnit) {
            return {
               errorMessage:
                  `Cannot attack, did not find attacker unit with join number ${attakerJoinNumber}`,
            }
         }

         const defenderUnit = battle.playerTwo.getUnitInBattle(
            defenderJoinNumber,
         )
         if (!defenderUnit) {
            return {
               errorMessage:
                  `Cannot attack, did not find defender unit with join number ${defenderJoinNumber}`,
            }
         }

         if (attackerUnit && attackerUnit.inBattleStatus.hp === 0) {
            return { errorMessage: 'Cannot attack with a unit with 0 HP' }
         }

         if (defenderUnit && defenderUnit.inBattleStatus.hp === 0) {
            return {
               errorMessage:
                  'Cannot attack a unit that has already been defeated',
            }
         }

         if (attackerUnit && defenderUnit) {
            defenderUnit.inBattleStatus.hp -= calculateDamage(
               attackerUnit,
               defenderUnit,
            )
         }

         if (battle.playerTwo.counterAttackFunction) {
            battle.playerTwo.counterAttackFunction(battle)
         }

         const winner = this.determineWinner(
            battle.playerOne,
            battle.playerTwo,
         )
         if (winner) {
            battle.battleStatus = BattleStatus.ENDED
            battle.battleWinner = winner
         }
      }
      return battle
   }

   private determineWinner(
      playerOne: PlayerInBattle,
      playerTwo: PlayerInBattle,
   ): PlayerInBattle | undefined {
      return playerOne.isDefeated()
         ? playerTwo
         : (playerTwo.isDefeated() ? playerOne : undefined)
   }

   private createBattleId(
      playerOneId: string | undefined,
      playerTwoId: string | undefined,
   ): string {
      return playerOneId + '-' + playerTwoId + '_' + Date.now()
   }

   public async isAuthorizedPlayer(
      playerId: string,
      providedAccessToken: string,
   ): Promise<boolean | GeneralError> {
      if (!providedAccessToken) {
         return {
            errorMessage:
               `Access Token for player ${playerId} has to be provided.`,
         }
      }
      const knownAccessTokenForPlayer = await this.playerDataStore
         .getAccessTokenForPlayer(playerId)
      if (!knownAccessTokenForPlayer) {
         return {
            errorMessage: `Did not find access token for player ${playerId}`,
         }
      }
      return knownAccessTokenForPlayer === providedAccessToken
   }
}
