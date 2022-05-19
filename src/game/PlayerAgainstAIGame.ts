import {
  Battle,
  BattleStatus,
  Game,
  GamePlayer,
  PlayerInBattle,
} from "../index.ts";

export class PlayerAgainstAIGame implements Game {
  private nextPlayerId = 1;
  private players: Array<GamePlayer> = [];
  private battles: Array<Battle> = [];

  createPlayer(player: GamePlayer): string {
    const newPlayerId = "p" + this.nextPlayerId;
    if (player) {
      player.playerId = newPlayerId;
      this.players.push(player);
      this.nextPlayerId++;
      return newPlayerId;
    }
    //TODO: Add error handling
    return "";
  }

  getPlayer(playerId: string): GamePlayer | undefined {
    return this.players.find((entry) => entry.playerId === playerId);
  }

  createBattle(playerOneId: string, playerTwoId: string): string | undefined {
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
      const attackerUnit = battle.playerOne.getUnitInBattle(attakerJoinNumber);
      const defenderUnit = battle.playerTwo.getUnitInBattle(defenderJoinNumber);
      if (attackerUnit && defenderUnit) {
        let damage = attackerUnit.inBattleStatus.atk -
          defenderUnit.inBattleStatus.def;
        if (damage < 1) {
          damage = 1;
        }
        defenderUnit.inBattleStatus.hp = defenderUnit.inBattleStatus.hp -
          damage;
      }
    }
    return battle;
  }

  private createBattleId(playerOneId: string, playerTwoId: string): string {
    return playerOneId + "-" + playerTwoId + "_" + Date.now();
  }
}
