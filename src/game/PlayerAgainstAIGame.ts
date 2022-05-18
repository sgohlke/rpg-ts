import { Battle, Game, PlayerWithUnits } from "../index.ts";

export class PlayerAgainstAiGame implements Game {
    private nextPlayerId = 1
    private players: Array<PlayerWithUnits> = []
    private battles: Array<Battle> = []

    createPlayer(player: PlayerWithUnits): string {
        const newPlayerId = "p" + this.nextPlayerId
        this.players.push({ playerId: newPlayerId, name: player.name, units: player.units })
        this.nextPlayerId = this.nextPlayerId + 1
        return newPlayerId
    }

    getPlayer(playerId: string): PlayerWithUnits | undefined {
        return this.players.find(entry => entry.playerId === playerId)
    }

    createBattle(playerOneId: string, playerTwoId: string): string | undefined {
        const battleId = this.createBattleId(playerOneId, playerTwoId)
        const playerOne = this.getPlayer(playerOneId)
        const playerTwo = this.getPlayer(playerTwoId)
        if (playerOne && playerTwo) {
            this.battles.push({ battleId, playerOne, playerTwo })
            return battleId
        } else {
            return undefined
        }
        
    }

    getBattle(battleId: string): Battle | undefined {
        return this.battles.find(entry => entry.battleId = battleId)
    }

    private createBattleId(playerOneId: string, playerTwoId: string): string {
        return playerOneId + "-" + playerTwoId + "_" + Date.now();
    }
}
