import { GamePlayer, UnitInBattle } from '../index.ts';

export class PlayerInBattle extends GamePlayer {
   unitsInBattle: Array<UnitInBattle> = [];

   constructor(player: GamePlayer) {
      super(player);
      this.initUnitsInBattle();
   }

   initUnitsInBattle(): void {
      for (const unit of this.units) {
         this.unitsInBattle.push({
            joinNumber: unit.joinNumber,
            name: unit.name,
            inBattleStatus: {
               hp: unit.defaultStatus.hp,
               atk: unit.defaultStatus.atk,
               def: unit.defaultStatus.def,
            },
         });
      }
   }

   getUnitInBattle(joinNumber: number): UnitInBattle | undefined {
      return this.unitsInBattle.find((entry) =>
         entry.joinNumber === joinNumber
      );
   }
}
