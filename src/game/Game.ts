import { Battle, PlayerWithUnits } from "../index.ts";

export interface Game {
  createPlayer(player: PlayerWithUnits): string | undefined;
  getPlayer(playerId: string): PlayerWithUnits | undefined;
  createBattle(playerOneId: string, playerTwoId: string): string | undefined;
  getBattle(battleId: string): Battle | undefined;
}
