import { IdGenerator } from "./IdGenerator";

beforeEach(() => {
    IdGenerator.getInstance().resetCounters();
});

test("GeneratePlayerId creates the correct player ids", () => {
    expect(IdGenerator.getInstance().generatePlayerId()).toBe("p1")
    expect(IdGenerator.getInstance().generatePlayerId()).toBe("p2")
})

test("GenerateUnitId creates the correct unit ids", () => {
    expect(IdGenerator.getInstance().generateUnitId()).toBe("u1")
    expect(IdGenerator.getInstance().generateUnitId()).toBe("u2")
})

test("ResetCounters resets player counter", () => {
    IdGenerator.getInstance().generatePlayerId()
    IdGenerator.getInstance().resetCounters()
    expect(IdGenerator.getInstance().generatePlayerId()).toBe("p1")
})

test("ResetCounters resets unit counter", () => {
    IdGenerator.getInstance().generateUnitId()
    IdGenerator.getInstance().resetCounters()
    expect(IdGenerator.getInstance().generateUnitId()).toBe("u1")
})
