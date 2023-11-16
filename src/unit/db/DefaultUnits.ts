import { Unit } from '../../index.ts'

export const DEFAULT_UNITS = new Map<string, Unit>([
   ['1', {
      name: 'Slime',
      defaultStatus: { hp: 5, atk: 2, def: 1, spd: 3 },
   }],
   ['2', {
      name: 'Parent Slime',
      defaultStatus: { hp: 6, atk: 2, def: 1, spd: 4 },
   }],
   ['3', {
      name: 'LilDefender',
      defaultStatus: { hp: 6, atk: 2, def: 3, spd: 2 },
   }],
   ['4', {
      name: 'Punchbag',
      defaultStatus: { hp: 1, atk: 1, def: 1, spd: 1 },
   }],
   ['5', {
      name: 'IamALooser',
      defaultStatus: { hp: 0, atk: 1, def: 1, spd: 0 },
   }],
])

export function getDefaultUnit(unitId: string): Unit {
   return DEFAULT_UNITS.get(unitId) ||
      {
         name: 'Broken',
         defaultStatus: { hp: 1, atk: 1, def: 1, spd: 0 },
      }
}
