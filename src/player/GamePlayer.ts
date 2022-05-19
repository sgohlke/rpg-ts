import { PlayerWithUnits, Unit } from "../index.ts";

export class GamePlayer implements PlayerWithUnits {
  playerId: string;
  name: string;
  nextJoinNumber = 1;
  units: Array<Unit> = [];

  constructor(player: PlayerWithUnits) {
    this.playerId = player.playerId;
    this.name = player.name;
    this.units = player.units || [];
  }

  addUnit(unit: Unit): number {
    const joinNumber = this.nextJoinNumber;
    this.units.push({
      joinNumber: joinNumber,
      name: unit.name,
      defaultStatus: unit.defaultStatus,
    });
    this.nextJoinNumber++;
    return joinNumber;
  }

  getUnit(joinNumber: number): Unit | undefined {
    return this.units.find((entry) => entry.joinNumber === joinNumber);
  }
}
