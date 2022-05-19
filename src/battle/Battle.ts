import { BattleStatus, PlayerInBattle } from "../index.ts";

export interface Battle {
  battleId: string;
  playerOne: PlayerInBattle;
  playerTwo: PlayerInBattle;
  battleStatus: BattleStatus;
}
