import { assertEquals } from '../../dev_deps.ts'
import { getDefaultUnit } from '../../index.ts'

Deno.test('getDefaultUnit returns broken unit if no unitId is not found', () => {
   const unit = getDefaultUnit('122')
   assertEquals(unit.name, 'Broken')
   assertEquals(unit.defaultStatus, { hp: 1, atk: 1, def: 1, spd: 0 })
})
