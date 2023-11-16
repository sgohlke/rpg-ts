import {
   Battle,
   BattleOptions,
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
   ): Promise<string | GeneralError> {
      const playerExists = await this.playerDataStore.doesPlayerExist(userName)
      if (playerExists) {
         return {
            errorMessage:
               `Cannot register user "${userName}", the username already exists`,
         }
      }
      const hashedPassword = await createPasswordHash(password)
      const playerId = await this.playerDataStore.addPlayerAccount({
         playerId: 'new',
         name: name,
         userName: userName,
         userPassword: hashedPassword,
      })
      if (typeof playerId === 'string') {
         player.playerId = playerId

         // TODO: Check error handling
         await this.playerDataStore.createPlayer(player)
         return playerId
      } else {
         return playerId
      }
   }

   async login(
      userName: string,
      userPassword: string,
   ): Promise<LoggedInPlayer | GeneralError> {
      const playerAccount = await this.playerDataStore.getPlayerAccountForName(
         userName,
      )
      if (playerAccount && 'playerId' in playerAccount) {
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
            return {
               errorMessage: 'Login failed! Invalid credentials',
            }
         }
      } else {
         return playerAccount ?? {
            errorMessage: 'Login failed! Invalid credentials',
         }
      }
   }

   async createBattle(
      battleOptions: BattleOptions,
   ): Promise<string | GeneralError | undefined> {
      const {
         playerOneAccessToken,
         playerOneId,
         playerTwoId,
         turnBar,
      } = battleOptions

      let {
         isTutorialBattle,
         playerTwoCounterAttackFunction,
      } = battleOptions

      // Set default values if options are not set
      isTutorialBattle = isTutorialBattle ?? true
      playerTwoCounterAttackFunction = playerTwoCounterAttackFunction ??
         randomCounterAttackFunction

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
            if (
               !await this.isAuthorizedPlayer(playerOneId, playerOneAccessToken)
            ) {
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
      if (
         playerOne && 'playerId' in playerOne &&
         playerTwo && 'playerId' in playerTwo
      ) {
         const playerOneInBattle = new PlayerInBattle(playerOne)
         const playerTwoInBattle = new PlayerInBattle(
            playerTwo,
            playerTwoCounterAttackFunction,
         )

         if (turnBar) {
            turnBar.initTurnBar(playerOneInBattle, playerTwoInBattle)
            //TODO: Check if AI player is on turn and perform actions
         }

         this.battles.push({
            battleId,
            battleActions: [],
            playerOne: playerOneInBattle,
            playerTwo: playerTwoInBattle,
            battleStatus: BattleStatus.ACTIVE,
            isTutorialBattle: isTutorialBattle,
            turnBar: turnBar,
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
            errorMessage: `Battle for battleId ${battleId} was not found!`,
         }
      } else if (battle.isTutorialBattle) {
         return battle
      } else {
         if (!playerOneAccessToken) {
            return {
               errorMessage:
                  'Access token needs to be provided in order to get battle',
            }
         } else {
            //TODO: Add check if player is authorized
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

         // Check if attacker is current turn
         const turnBar = battle.turnBar
         if (turnBar) {
            const currentTurn = turnBar.currentTurn
            if (
               currentTurn && currentTurn.playerId !== battle.playerOne.playerId
            ) {
               return {
                  errorMessage:
                     `Cannot attack, player ${battle.playerOne.playerId} is not on turn. Player on turn is ${currentTurn.playerId}`,
               }
            } else if (
               currentTurn &&
               currentTurn.playerId === battle.playerOne.playerId &&
               currentTurn.unitJoinNumber !== attakerJoinNumber
            ) {
               return {
                  errorMessage:
                     `Cannot attack, player unit ${attakerJoinNumber} is not on turn. Unit on turn is ${currentTurn.unitJoinNumber}`,
               }
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

         battle.battleActions.push({
            attackingUnit: {
               defaultStatus: attackerUnit.defaultStatus,
               inBattleStatus: attackerUnit.inBattleStatus,
               joinNumber: attackerUnit.joinNumber,
               name: attackerUnit.name,
               playerId: battle.playerOne.playerId,
            },
            defendingUnit: {
               defaultStatus: defenderUnit.defaultStatus,
               inBattleStatus: defenderUnit.inBattleStatus,
               joinNumber: defenderUnit.joinNumber,
               name: defenderUnit.name,
               playerId: battle.playerTwo.playerId,
            },
         })

         const winner = this.determineWinner(
            battle.playerOne,
            battle.playerTwo,
         )

         if (winner) {
            battle.battleStatus = BattleStatus.ENDED
            battle.battleWinner = winner
         } else {
            if (turnBar) {
               for (
                  let nextTurn = turnBar.nextTurn();
                  nextTurn !== undefined;
                  nextTurn = turnBar.nextTurn()
               ) {
                  if (nextTurn.playerId === battle.playerOne.playerId) {
                     break
                  } else {
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
               }
            } else {
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
