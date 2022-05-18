import { assertEquals, Unit } from "../index.ts"

Deno.test("Unit is correctly creaeted", () => {
    const unit: Unit = { joinNumber: 1, name: "Slime", defaultStatus: {hp: 5, atk: 2, def: 1}}
    assertEquals(unit.name, "Slime")
    assertEquals(unit.joinNumber, 1)
    assertEquals(unit.defaultStatus, {hp: 5, atk: 2, def: 1})
})
