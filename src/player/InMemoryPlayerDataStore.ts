import { GamePlayer, PlayerAccount, PlayerDataStore } from '../index.ts'
export class InMemoryPlayerDataStore implements PlayerDataStore {
   private nextPlayerId = 1
   private players: Array<GamePlayer> = []
   private playerAccounts: Array<PlayerAccount> = []
   private playerAccessTokens: Map<string, string> = new Map<string, string>()

   addPlayerAccount(playerAccount: PlayerAccount): void {
      this.playerAccounts.push(playerAccount)
   }

   createPlayer(player: GamePlayer): string {
      const newPlayerId = 'p' + this.nextPlayerId
      player.playerId = newPlayerId
      this.players.push(player)
      this.nextPlayerId++
      return newPlayerId
   }

   doesPlayerExist(userName: string): boolean {
      return this.playerAccounts.some((entry) => entry.userName === userName)
   }

   getPlayer(playerId: string | undefined): GamePlayer | undefined {
      return this.players.find((entry) => entry.playerId === playerId)
   }

   getPlayerAccount(playerId: string): PlayerAccount | undefined {
      return this.playerAccounts.find((entry) => entry.playerId === playerId)
   }

   getPlayerAccountForName(userName: string): PlayerAccount | undefined {
      return this.playerAccounts.find((entry) => entry.userName === userName)
   }

   getAccessTokenForPlayer(playerId: string): string | undefined {
      return this.playerAccessTokens.get(playerId)
   }

   setPlayerAccessToken(playerId: string, accessToken: string): void {
      this.playerAccessTokens.set(playerId, accessToken)
   }
}
