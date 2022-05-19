import { UnitWithPlayerId } from "../../index.ts";

export interface UnitDB {
  createUnit(unit: UnitWithPlayerId): void;
  getUnit(playerId: string, joinNumber: number): UnitWithPlayerId | undefined;
}
