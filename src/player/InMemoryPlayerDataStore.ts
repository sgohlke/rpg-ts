import {
   GeneralError,
   PlayerAccount,
   PlayerData,
   PlayerDataStore,
} from '../index.ts'
export class InMemoryPlayerDataStore implements PlayerDataStore {
   private nextPlayerId = 1
   private playerData: Array<PlayerData> = []
   private playerAccounts: Array<PlayerAccount> = []
   private playerAccessTokens: Map<string, string> = new Map<string, string>()

   async addPlayerAccount(
      playerAccount: PlayerAccount,
   ): Promise<string | GeneralError> {
      const newPlayerId = 'p' + this.nextPlayerId
      playerAccount.playerId = newPlayerId
      this.playerAccounts.push(playerAccount)
      this.nextPlayerId++
      return await new Promise((resolve) => {
         resolve(newPlayerId)
      })
   }

   async createPlayer(player: PlayerData): Promise<string | GeneralError> {
      this.playerData.push(player)
      return await new Promise((resolve) => {
         resolve(player.playerId)
      })
   }

   async doesPlayerExist(userName: string): Promise<boolean | GeneralError> {
      const maybePlayerAccount = this.playerAccounts.some((entry) =>
         entry.userName === userName
      )
      return await new Promise((resolve) => {
         resolve(maybePlayerAccount)
      })
   }

   async getPlayer(
      playerId: string | undefined,
   ): Promise<PlayerData | undefined | GeneralError> {
      const maybePlayerData = this.playerData.find((entry) =>
         entry.playerId === playerId
      )
      return await new Promise((resolve) => {
         resolve(maybePlayerData)
      })
   }

   async getPlayerAccount(
      playerId: string,
   ): Promise<PlayerAccount | undefined | GeneralError> {
      const maybePlayerAccount = this.playerAccounts.find((entry) =>
         entry.playerId === playerId
      )
      return await new Promise((resolve) => {
         resolve(maybePlayerAccount)
      })
   }

   async getPlayerAccountForName(
      userName: string,
   ): Promise<PlayerAccount | undefined | GeneralError> {
      const maybePlayerAccount = this.playerAccounts.find((entry) =>
         entry.userName === userName
      )
      return await new Promise((resolve) => {
         resolve(maybePlayerAccount)
      })
   }

   async getAccessTokenForPlayer(
      playerId: string,
   ): Promise<string | undefined | GeneralError> {
      const maybePlayerAccessToken = this.playerAccessTokens.get(playerId)
      return await new Promise((resolve) => {
         resolve(maybePlayerAccessToken)
      })
   }

   async setPlayerAccessToken(
      playerId: string,
      accessToken: string,
   ): Promise<string | GeneralError> {
      this.playerAccessTokens.set(playerId, accessToken)
      return await new Promise((resolve) => {
         resolve(accessToken)
      })
   }
}
