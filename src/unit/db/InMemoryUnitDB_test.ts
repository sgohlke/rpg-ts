import {
   assert,
   assertEquals,
   getDefaultUnit,
   InMemoryUnitDB,
   UnitWithPlayerId,
} from '../../index.ts';

Deno.test('Unit is created and stored in in-memory database', () => {
   const testUnit = getDefaultUnit('1');
   const unit: UnitWithPlayerId = {
      joinNumber: testUnit.joinNumber,
      name: testUnit.name,
      defaultStatus: testUnit.defaultStatus,
      playerId: 'p1',
   };

   const inMemoryUnitDB = new InMemoryUnitDB();
   inMemoryUnitDB.createUnit(unit);
   const createdUnit = inMemoryUnitDB.getUnit('p1', 1);
   assert(createdUnit);
   assertEquals(createdUnit.playerId, 'p1');
   assertEquals(createdUnit.name, testUnit.name);
   assertEquals(createdUnit.defaultStatus, testUnit.defaultStatus);
});

Deno.test('Broken unit is created and stored in in-memory database', () => {
   const testUnit = getDefaultUnit('148965325325');
   const unit: UnitWithPlayerId = {
      joinNumber: testUnit.joinNumber,
      name: testUnit.name,
      defaultStatus: testUnit.defaultStatus,
      playerId: 'p1',
   };

   const inMemoryUnitDB = new InMemoryUnitDB();
   inMemoryUnitDB.createUnit(unit);
   const createdUnit = inMemoryUnitDB.getUnit('p1', 0);

   assert(createdUnit);
   assertEquals(createdUnit.playerId, 'p1');
   assertEquals(createdUnit.name, testUnit.name);
   assertEquals(createdUnit.defaultStatus, testUnit.defaultStatus);
});
