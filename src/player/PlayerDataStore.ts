import { GamePlayer, PlayerAccount } from '../index.ts'

export interface PlayerDataStore {
   addPlayerAccount(playerAccount: PlayerAccount): void
   createPlayer(player: GamePlayer): string
   doesPlayerExist(userName: string): boolean
   getAccessTokenForPlayer(playerId: string): string | undefined
   getPlayer(playerId: string | undefined): GamePlayer | undefined
   getPlayerAccount(playerId: string): PlayerAccount | undefined
   getPlayerAccountForName(username: string): PlayerAccount | undefined
   setPlayerAccessToken(playerId: string, accessToken: string): void
}
