import { UnitInBattle } from '../index.ts'

export interface CounterAttackUnits {
   counterAttacker: UnitInBattle | undefined
   counterTarget: UnitInBattle | undefined
}
