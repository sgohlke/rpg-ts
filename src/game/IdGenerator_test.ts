import { assertEquals } from "../deps.ts"
import { IdGenerator } from "./IdGenerator.ts"

Deno.test("GeneratePlayerId creates the correct player ids", () => {
    IdGenerator.getInstance().resetCounters()
    assertEquals(IdGenerator.getInstance().generatePlayerId(), "p1")
    assertEquals(IdGenerator.getInstance().generatePlayerId(), "p2")
})

Deno.test("GenerateUnitId creates the correct unit ids", () => {
    IdGenerator.getInstance().resetCounters()
    assertEquals(IdGenerator.getInstance().generateUnitId(), "u1")
    assertEquals(IdGenerator.getInstance().generateUnitId(), "u2")
})

Deno.test("ResetCounters resets player counter", () => {
    IdGenerator.getInstance().generatePlayerId()
    IdGenerator.getInstance().resetCounters()
    assertEquals(IdGenerator.getInstance().generatePlayerId(), "p1")
})

Deno.test("ResetCounters resets unit counter", () => {
    IdGenerator.getInstance().generateUnitId()
    IdGenerator.getInstance().resetCounters()
    assertEquals(IdGenerator.getInstance().generateUnitId(), "u1")
})
