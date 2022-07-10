import {
   CounterAttackFunction,
   GamePlayer,
   randomCounterAttackFunction,
   Unit,
   UnitInBattle,
} from '../index.ts';

export class PlayerInBattle extends GamePlayer {
   private unitsInBattle: Array<UnitInBattle> = [];
   counterAttackFunction?: CounterAttackFunction;

   constructor(
      player: GamePlayer,
      counterAttackFunction = randomCounterAttackFunction,
   ) {
      super(player);
      this.counterAttackFunction = counterAttackFunction;
      this.initUnitsInBattle(player.getUnits());
   }

   initUnitsInBattle(units: ReadonlyArray<Unit>): void {
      for (const unit of units) {
         this.unitsInBattle;

         this.unitsInBattle.push({
            name: unit.name,
            joinNumber: unit.joinNumber,
            defaultStatus: {
               hp: unit.defaultStatus.hp,
               atk: unit.defaultStatus.atk,
               def: unit.defaultStatus.def,
            },
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

   isDefeated(): boolean {
      return !this.unitsInBattle.some((entry) => entry.inBattleStatus.hp > 0);
   }

   getNonDefeatedUnits(): Array<UnitInBattle> {
      return this.unitsInBattle.filter((entry) => entry.inBattleStatus.hp > 0);
   }

   findRandomNonDefeatedUnit(): UnitInBattle | undefined {
      const nonDefeatedUnits = this.getNonDefeatedUnits();
      if (nonDefeatedUnits && nonDefeatedUnits.length > 0) {
         return nonDefeatedUnits[
            Math.floor(Math.random() * nonDefeatedUnits.length)
         ];
      }
      return undefined;
   }

   getNumberOfUnitsInBattle(): number {
      return this.unitsInBattle.length;
   }
}
